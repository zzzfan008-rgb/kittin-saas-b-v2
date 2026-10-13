> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 流式和非流式请求，遇到内容过滤有什么不同？

> 非流式请求被内容安全过滤时，平台会自动换线路重新生成；流式请求一旦开始输出就无法切换，会以 content_filter 截断。本文给出实测对照、输出形态和按场景的选择建议。

## 简短回答

<Info>
  **同一段内容，流式和非流式遇到内容过滤时的结果可能完全不同：**

  1. **非流式**：某条官方线路触发内容安全过滤时，API易 会**自动换一条官方线路重新生成**。客户端拿到的是完整结果，**只计费一次**。
  2. **流式**：内容一开始输出就已经发给客户端了，**中途没法再换线路**。这次请求会以 `finish_reason: "content_filter"` 结束，已经生成的部分**照常计费**。
  3. **怎么选**：需要逐字展示给用户的（对话、Agent 回复）用流式；程序生成完才使用的（剧本、分镜、翻译、结构化数据）用非流式。
</Info>

## 过滤发生的两个时机

原厂的内容安全过滤会在两个时机介入，流式下两种形态都会出现：

| 时机 | 流式下的表现 | 典型耗时 |
| - | - | - |
| **请求阶段**（审查输入） | 正文只有一句 `I'm sorry, but I cannot assist with that request.`（约 15 tokens），`finish_reason` 为 `content_filter` | 几秒 |
| **生成阶段**（审查输出） | 模型已经输出了一部分正文，中途被截断，`finish_reason` 为 `content_filter` | 取决于截断前生成了多少 |

两种情况的 HTTP 状态码都是 `200`，响应以 `data: [DONE]` 正常收尾，**HTTP 错误日志里看不到**，只能从流的最后一个事件判断。

## 流式与非流式对照

| | 流式 `stream: true` | 非流式 `stream: false` |
| - | - | - |
| 被过滤时平台怎么处理 | 已经开始输出，无法切换线路 | 自动换一条官方线路重新生成 |
| 客户端拿到的结果 | 被截断的半段正文，或一句拒答 | 完整结果，`finish_reason: "stop"` |
| 计费 | 被截断的这次按实际输入、输出 tokens 计费；续写或重试再另计 | 只计成功的那一次 |
| 客户端要做的处理 | 识别 `content_filter`，清理正文，再决定续写或重试 | 无需额外处理 |
| 适合的场景 | 需要逐字展示的内容 | 生成完才使用的内容 |

<Note>
  非流式的自动切换能大幅提高成功率，但不是 100%：如果内容明显违反原厂使用政策，换一条线路后也可能被模型自己拒答，形态见 [OpenAI 模型拒答长什么样？](/faq/openai-content-safety-refusal)。
</Note>

## 实测对照

2026-09-25 (UTC+8)，用 `gpt-5.6-terra`、相同的参数（`max_tokens=35000`、`temperature=0`、`reasoning_effort=high`），对同一批影视分镜剧本分别发流式和非流式请求：

| 剧本题材 | 流式 | 非流式 |
| - | - | - |
| 武侠打斗，要求把招式、受伤、倒地写具体 | **5/5 在生成阶段被截断**（约 1,700 tokens 处） | **4/4 完整返回** |
| 动作片、战争片，含流血和死亡细节 | **10/10 在请求阶段被拦**（固定一句拒答） | **6/6 完整返回** |
| 生活题材、悬疑题材 | 8/8 正常结束 | — |

同一段内容原样重试，流式下的结果基本一样。**决定是否触发的主要是内容本身，不是运气。**

## 流式被截断时的输出形态

最后一个带 `choices` 的事件没有正文，只有结束原因：

```text theme={null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[{"delta":{},"finish_reason":"content_filter","index":0}],"usage":null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[],"usage":{"prompt_tokens":27831,"completion_tokens":6966,"total_tokens":34797}}
data: [DONE]
```

<Warning>
  **生成阶段被截断时，拼好的正文末尾会直接接上一句英文拒答，中间没有换行**，例如：

  `……林远把长刀横于胸前，脚尖缓慢挪动，始终让I'm sorry, but I cannot assist with that request.`

  如果把这段正文原样带进续写请求，模型会在上下文里看到一句拒答，下一轮更容易继续被拦。**续写前请先去掉这句。**
</Warning>

## 怎么选

<CardGroup cols={2}>
  <Card title="用流式" icon="zap">
    * 聊天、客服、Agent 对话回复，用户需要立刻看到输出
    * 需要中途打断（用户点「停止」）的场景
    * 日常对话触发内容过滤的概率很低，流式的体验优势更重要
  </Card>

  <Card title="用非流式" icon="package">
    * 剧本、分镜、小说章节等创作类长文本
    * 批量翻译、信息抽取、结构化 JSON
    * 结果要先解析、落库，再展示给用户
    * **容易碰到敏感情节的内容**（打斗、伤亡、犯罪）
  </Card>
</CardGroup>

同一个产品完全可以**两种都用**：对话部分走流式，剧本或分镜生成走非流式。只需要把后者请求里的 `stream` 改成 `false`，其他参数不变。

非流式要等整段生成完才返回，长输出的推理模型可能要 30\~100 秒甚至更久，请把这类请求的客户端超时设到 **300 秒以上**，见 [如何避免接口超时？](/faq/timeout-configuration)。前端如果需要进度感，可以先显示「生成中」，完成后一次性展示。

## 必须用流式时怎么处理

<Steps>
  <Step title="读流时记下 finish_reason">
    最后一个带 `choices` 的事件里，`finish_reason` 为 `content_filter` 就说明被过滤了。不要只看 HTTP 状态码。
  </Step>

  <Step title="去掉末尾的拒答句">
    生成阶段被截断时，正文末尾带着一句英文拒答，先把它去掉，再决定怎么用已生成的部分。
  </Step>

  <Step title="改走非流式重试">
    对被截断的那一段，改用非流式重新请求，让平台自动切换线路。这比流式续写的成功率高得多。
  </Step>

  <Step title="连续被拦就调整表述">
    同一任务非流式也拿不到结果时，把敏感细节写得概括一些再试，不要原样重试。
  </Step>
</Steps>

下面是一个最小示例：流式读取，被过滤时去掉拒答句，再改走非流式重试。

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL = "I'm sorry, but I cannot assist with that request."

def generate(messages, model="gpt-5.6-terra"):
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        stream_options={"include_usage": True},
    )
    parts, finish = [], None
    for chunk in stream:
        if not chunk.choices:
            continue
        choice = chunk.choices[0]
        if choice.delta and choice.delta.content:
            parts.append(choice.delta.content)
            print(choice.delta.content, end="", flush=True)
        if choice.finish_reason:
            finish = choice.finish_reason

    text = "".join(parts)
    if finish != "content_filter":
        return text

    # 被过滤：去掉末尾的拒答句，改走非流式，由平台自动切换线路
    partial = text.removesuffix(REFUSAL)
    print(f"\n[被内容过滤截断，已生成 {len(partial)} 字，改用非流式重试]")
    resp = client.chat.completions.create(model=model, messages=messages, timeout=600)
    return resp.choices[0].message.content
```

<Tip>
  示例里直接用非流式把整段重新生成一遍，最省事。如果你的业务必须保留已生成的部分，可以把 `partial` 作为上下文让模型续写，但续写请求同样建议用非流式。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="流式被截断的那次也扣费吗？">
    扣。原厂已经实际生成了这些内容，按实际输入、输出 tokens 计费。所以容易触发过滤的内容，用非流式更划算：非流式只计成功的那一次。
  </Accordion>

  <Accordion title="能关闭内容过滤吗？">
    不能。过滤由原厂执行，API易 无法关闭，也无法调整尺度。平台能做的是在非流式请求被过滤时换一条官方线路重试。
  </Accordion>

  <Accordion title="同样的内容，为什么有时通过、有时被截断？">
    不同官方线路的过滤尺度不完全一致，模型每次生成的措辞也不同，所以边界附近的内容可能时而通过、时而被截断。明显敏感的内容会被稳定拦截。
  </Accordion>

  <Accordion title="平台为什么不对流式请求也自动重试？">
    生成阶段的截断发生在正文已经发出之后，客户端已经收到并展示了前半段，这时再换线路从头生成，内容会对不上。所以流式请求只能由客户端识别 `content_filter` 后自行处理。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="OpenAI 模型拒答长什么样？" icon="message-square-x" href="/faq/openai-content-safety-refusal">
    被模型自己拒答时的输出体与识别方法
  </Card>

  <Card title="流式和非流式调用有什么区别？" icon="audio-lines" href="/faq/streaming-vs-non-streaming">
    两种调用方式的接入、计费与常见误区
  </Card>

  <Card title="如何避免接口超时？" icon="timer" href="/faq/timeout-configuration">
    非流式长输出的超时设置
  </Card>

  <Card title="内容安全如何合规性？" icon="shield-check" href="/faq/content-safety">
    平台内容安全与合规政策
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.