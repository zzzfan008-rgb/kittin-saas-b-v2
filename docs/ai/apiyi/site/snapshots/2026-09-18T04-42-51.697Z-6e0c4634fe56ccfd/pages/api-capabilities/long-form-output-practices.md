> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 长文输出实战建议

> 漫剧脚本、文学创作、万字长文等长输出场景怎么稳定拿到结果：用流式、read timeout 按事件间隔设、max_tokens 给足、查 stop_reason。附 Claude 原生调用示例。

<Info>
  **一句话结论**：让大模型一次产出上万字（分集大纲、长篇小说、长翻译、大段代码）时，**用流式、不要用非流式**；客户端 read timeout 按「两次数据事件之间的间隔」设（几十秒即可，建议 90\~120 秒），不要按「整段生成的总时长」设；`max_tokens` 给足；拿到响应后先看 `stop_reason` 再用正文。做到这四点，长文场景就不会「拿不到结果」。
</Info>

本页面向所有大模型通用（OpenAI、Claude、Gemini、Grok 等），代码示例以 Claude 原生 `/v1/messages` 为主，OpenAI 兼容格式的差异单独标注。

## 三个先知道的事实

1. **出万字长文，真实生成 10\~20 分钟是常态**。模型要逐 token 产出上万字，叠加推理/思考阶段，端到端耗时本就很长。这不是网关慢，是生成本身慢。

2. **非流式要「整段攒齐」才回写**。非流式（`stream` 不传或为 `false`）下，服务端必须等模型把整段生成完，再一次性把响应体回传给你。这几分钟里你的客户端 read timeout 一直在和它赛跑，生成越久越容易在拿到结果前先断开——断开时异常信息经常是空的（`httpx.ReadError` 的 `str(e)` 为空），看不出病因。

3. **断连仍然计费，盲目重试是重复计费**。只要服务端已经产出，哪怕最后没送达你，这次调用也照常计费。已经收到部分正文再断开的情况，重试等于让模型再跑一遍、再付一次钱。

## 用流式，不要用非流式

流式（`stream: true`）下，首字节几秒内就到，之后每隔几十秒必有一个数据事件。你的 read timeout 只需覆盖「两次事件之间的间隔」，而不是覆盖长达十几分钟的整段生成——这是流式能稳定拿到长文结果的根本原因。

两种协议的**结束信号不同**，别混用：

| 协议                               | 结束信号                                   | 正文取法                                                                |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Claude 原生 `/v1/messages`         | `event: message_stop`（**没有 `[DONE]`**） | `content_block_delta` 里 `delta.type == "text_delta"` 的 `delta.text` |
| OpenAI 兼容 `/v1/chat/completions` | `data: [DONE]`                         | `choices[0].delta.content`                                          |

Claude 原生开启自适应思考时，会**先**出一个 `type: "thinking"` 的思考块（增量是 `thinking_delta`），再出 `text` 正文块。渲染时把 `thinking_delta` 和 `text_delta` 分流即可，思考增量不拼进正文。

Claude 原生 `/v1/messages` 流式最小可用示例（纯 httpx，逐行解析 SSE）：

```python theme={null}
import json
import httpx

def generate_long_text(prompt, api_key, model="claude-opus-5", max_tokens=64000):
    url = "https://api.apiyi.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "accept": "text/event-stream",
    }
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "stream": True,                        # ← 关键：长输出必须流式
        "thinking": {"type": "adaptive"},      # 自适应思考，模型自行决定思考深度
        "messages": [{"role": "user", "content": prompt}],
    }
    # 三段式超时：read 只覆盖事件间隔，不覆盖整段生成
    timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)

    text, stop_reason = [], None
    with httpx.Client(timeout=timeout) as c:
        with c.stream("POST", url, json=payload, headers=headers) as r:
            if r.status_code != 200:
                raise RuntimeError(f"HTTP {r.status_code}: {r.read()[:400]}")
            event, data = None, []
            for line in r.iter_lines():
                if line == "":                 # 事件以空行分隔
                    if data:
                        d = json.loads("\n".join(data))
                        t = d.get("type") or event
                        if t == "content_block_delta" and d.get("delta", {}).get("type") == "text_delta":
                            text.append(d["delta"]["text"])
                        elif t == "message_delta":
                            stop_reason = d.get("delta", {}).get("stop_reason") or stop_reason
                    event, data = None, []
                    continue
                if line.startswith("event:"):
                    event = line[6:].strip()
                elif line.startswith("data:"):
                    data.append(line[5:].strip())
    # Claude 流以 message_stop 结束，没有 [DONE]
    if stop_reason == "max_tokens":
        raise RuntimeError(f"被 max_tokens 截断，已产出 {len(''.join(text))} 字，调大 max_tokens 后重试")
    return "".join(text).strip()
```

<Tip>
  如果你用官方 anthropic SDK，把 `base_url` 指到 `https://api.apiyi.com`，再用 `client.messages.stream(...).get_final_message()` 即可一步到位——SDK 自带了 SSE 解析、超时处理、`stop_reason` 判定。上面的 httpx 版本是给不想引 SDK 的场景。
</Tip>

## read timeout 按事件间隔设，不是按总时长

很多人把 read timeout 设成一个能兜住整段生成的巨大值（比如 1800 秒），结果照样超时——因为非流式下这个值要和整段生成竞速，稍有波动就断。正确做法是流式 + 按事件间隔设 read timeout。

实测参考（`claude-opus-5` 出约 2 万字分集大纲，输入约 1.5 万字符）：

| 指标         | 实测值                         |
| ---------- | --------------------------- |
| 首字节到达      | 3 \~ 130 秒                  |
| 思考阶段最大静默间隔 | 约 42 秒（且期间有 keepalive ping） |
| 端到端总耗时     | 9 \~ 12 分钟                  |

所以 read timeout 设 **90 \~ 120 秒**足以覆盖最大事件间隔并留余量，不必设成十几分钟。三段式超时把三个阶段拆开，各自设值：

```python theme={null}
# connect：建连；write：上行发请求体；read：两次读之间的上限
timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)
```

## max\_tokens 给足，并检查 stop\_reason

长输出容易撞到 `max_tokens` 上限被截断。尤其是 Claude 这类**开了思考的模型，思考本身也占 `max_tokens` 预算**，一份长文很容易把预算吃满。

* **`max_tokens` 建议 64000 起步**（开高 effort / 深度思考时更要给足；`claude-opus-5` 输出上限 128K）。
* **拿到响应先看 `stop_reason`**：
  * `end_turn`——正常结束，正文完整，这才算成功。
  * `max_tokens`——被截断，正文可能不完整甚至为空。这是**被截断**不是「空结果」，把 `max_tokens` 调大后重试即可。
  * `refusal`——被安全策略拒绝，单独处理。

只用 `str(e)` 或「正文为空」来判断成败会误导——空正文的真实原因往往是 `max_tokens` 截断。

## 重试策略

长文场景的重试要克制，别让「失败重试」变成「重复计费 + 重复长跑」：

* **只对「拿到响应头之前的失败」和 `5xx` / `429` 重试**（退避、最多 2 次）。这类是建连/瞬时问题，重试有意义。
* **已经收到部分正文再断流的，不要盲目重试**。服务端已经产出并计费，重试是让它再跑一遍、再付一次钱。
* 记录响应头里的 request id，方便对账和排查。

## 场景速查

| 场景            | 典型输出量     | max\_tokens 建议    | read timeout 建议 |
| ------------- | --------- | ----------------- | --------------- |
| 漫剧 / 短剧分集大纲   | 1 \~ 3 万字 | 64000             | 90 \~ 120 秒     |
| 文学创作（长篇小说/章节） | 1 \~ 5 万字 | 64000 \~ 128000   | 90 \~ 120 秒     |
| 长篇翻译          | 随原文长度     | 按原文 token 估算 ×1.5 | 90 \~ 120 秒     |
| 大段代码生成        | 数千行       | 32000 \~ 64000    | 90 \~ 120 秒     |

全部走流式；节点用 `api.apiyi.com`（中国大陆推荐）或 `vip.apiyi.com`（海外推荐），**不要用 `api-cf.apiyi.com`**（CDN 节点约 100 秒就 `524`，扛不住长请求）。

## 相关链接

<CardGroup cols={2}>
  <Card title="如何避免接口超时" icon="clock" href="/faq/timeout-configuration">
    分场景的 timeout 推荐值
  </Card>

  <Card title="流式 vs 非流式" icon="git-compare" href="/faq/streaming-vs-non-streaming">
    两种模式的差异与选型
  </Card>

  <Card title="Claude 思考与 effort" icon="brain" href="/api-capabilities/claude-effort-thinking">
    自适应思考、effort 档位、max\_tokens 与截断
  </Card>

  <Card title="Claude 响应处理" icon="code" href="/api-capabilities/claude-response-handling">
    原生响应结构、SSE 事件、stop\_reason
  </Card>
</CardGroup>
