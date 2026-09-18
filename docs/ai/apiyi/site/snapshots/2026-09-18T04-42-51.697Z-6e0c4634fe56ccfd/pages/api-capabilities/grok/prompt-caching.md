> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Prompt Caching 缓存计费指南

> Grok 缓存全自动、无写入费：命中部分按输入价 0.25x 计费。128 token 块粒度、怎么写出会命中的请求、怎么看 cached_tokens、长对话为什么该走 responses 链式。

用 Grok 跑 Agent、长系统提示词、多轮对话时，Prompt Caching 能把**命中部分**的输入账单打到 **0.25×**（省 75%），而且**什么代码都不用改**——缓存是全自动的。

先把预期说在前面：xAI 官方明确缓存条目可能因负载、重启、路由变化被驱逐，**不保证 100% 命中**。把缓存折扣当作「有则更好」的额外优惠，**做成本测算时按无缓存价格打底**。

本页基于 xAI 官方文档（`docs.x.ai/developers/advanced-api-usage/prompt-caching`）整理，并以 **2026-08-19 在 API易 网关上对 `grok-4.6` 的实测**为准（124 次调用，逐条与后台账单核对）。

## 一句话理解

只要请求的**开头部分（前缀）与近期某次请求逐字相同**，上游就自动跳过重复处理：命中部分按 **0.25×** 计费，不需要任何参数、不需要打标记。

和另外两家的差别：

* **对比 Claude**：不用打 `cache_control` 标记，达到条件自动生效
* **对比 OpenAI**：同样全自动、同样没有写入费，但 Grok 没有 `prompt_cache_key` 这类由你控制路由的手段

## 为什么要用 —— 看账单倍率

以模型原始输入 token 价为 **1×** 计：

| 类型       | 价格         | 说明         |
| -------- | ---------- | ---------- |
| 普通输入     | **1×**     | 没命中的部分，原价  |
| 缓存写入     | **0×（免费）** | 自动发生，不收钱   |
| **缓存命中** | **0.25×**  | 命中部分便宜 75% |

**回本点：第 2 次请求就净省。** 没有写入成本要摊，同一前缀只要被复用一次，省下的就是纯收益。

按 `grok-4.6` 的挂牌价换算（每 1M tokens，两个上下文档位）：

| 档位          | 普通输入   | 缓存命中       |
| ----------- | ------ | ---------- |
| 0 – 200K    | \$2.00 | **\$0.50** |
| 200K – 512K | \$4.00 | **\$1.00** |

其余 Grok 型号的分档与缓存读取价见 [Grok 概览的阶梯计费表](/api-capabilities/grok/overview)。

### 适合场景

* 同一份长系统提示词 + 工具定义被反复调用（Agent、客服机器人）
* 批量处理同一份文档（一份合同问 50 个问题）
* RAG 把稳定的文档块放在 prompt 前部
* 多轮对话（注意：Grok 上 chat 与 responses 两种接法的效果差别很大，见下文）

### 不适合场景

* 每次请求从第一个字开始就不一样
* 整个 prompt 在**千 token 量级以下**——实测这种请求反复调用也形不成可复用的缓存

## 两个端点、流式与非流式都已核对

`/v1/chat/completions` 与 `/v1/responses`，各自的流式与非流式，**四种组合我们于 2026-08-19 逐条核对过后台账单**，命中部分均按缓存价单列计费：

|                        | 非流式 | 流式  |
| ---------------------- | --- | --- |
| `/v1/chat/completions` | 已核对 | 已核对 |
| `/v1/responses`        | 已核对 | 已核对 |

<Info>
  **代码无需为中转层做任何适配。** 缓存相关行为原样转发上游，`cached_tokens` 原样回吐，后台账单把命中部分单列为「缓存读取」计费项。
</Info>

## 触发条件

| 条件   | 要求                                 |
| ---- | ---------------------------------- |
| 触发方式 | **全自动**，无参数、无标记                    |
| 匹配起点 | 从 `messages` 数组**开头**逐字比对          |
| 只能追加 | 修改 / 删除 / 重排历史消息会让缓存作废；**尾部追加不影响** |
| 块粒度  | **128 token**（见下）                  |
| 长度   | 官方未公布最小门槛；实测千 token 量级以下形不成可复用缓存   |
| 时间窗  | 官方明确随时可能驱逐，**间隔越短越稳**              |

### 命中量按 128 token 取整

```text theme={null}
命中量 = ⌊匹配上的前缀长度 ÷ 128⌋ × 128
```

两轮实测都吻合：8802 token 的前缀命中 8704（= 68 × 128），更早一轮 2735 token 的前缀命中 2688（= 21 × 128）。**所以 `cached_tokens` 通常略小于你的稳定前缀总长，是正常现象。**

### 只能追加：改历史即失效

同一段前缀贴着连发，只改动其中一次：

| 操作            | `cached_tokens` |
| ------------- | --------------- |
| 不改动           | 8704            |
| **把前缀首字符改掉**  | 128（等于没命中）      |
| **在前缀末尾追加一行** | 8704（不受影响）      |
| 再发一次原前缀       | 8704            |

**实践含义：稳定的东西放前面，易变的东西放后面。**

```python theme={null}
# ❌ 错：动态内容拼在 system 开头，前缀每次都变，永远命中不了
messages = [
    {"role": "system", "content": f"当前时间 {datetime.now()}。你是一个助手。" + 长指令},
    {"role": "user", "content": 问题},
]

# ✅ 对：长指令和工具定义在前保持稳定，动态内容放 user 消息里
messages = [
    {"role": "system", "content": 长指令},          # 稳定，会命中
    {"role": "user", "content": f"当前时间 {datetime.now()}。{问题}"},  # 易变，放最后
]
```

## 最小可运行示例

同一段长前缀发两次不同问题，第一次自动写入，第二次命中：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# 前缀要足够长：千 token 量级以下基本吃不到缓存
LONG_SYSTEM = open("long_instructions_zh.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="grok-4.6",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("请概括要点", "第1次")    # 冷启动，cached 为 0 或极小值
ask("请给3个关键词", "第2次")  # 期望 cached 接近前缀长度
```

期望看到的输出：

```text theme={null}
[第1次] input=8804 cached=128
[第2次] input=8804 cached=8704
```

第 2 次的 `cached` 接近系统提示词长度（按 128 取整），这部分按 0.25× 计费。

<Info>
  `/v1/responses` 端点同样自动生效，字段换成 `usage.input_tokens_details.cached_tokens`，机制完全一致。**长对话在这个端点上还有额外优势**，见下文「长对话优先走 responses 链式」。
</Info>

## 怎么判断命中 —— 看 usage 字段

| 端点                     | 命中字段                                        |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

### 判读口径：小值不算命中

不要只看「大于 0」。**拿 `cached_tokens` 和你的稳定前缀长度做比**：

| `cached_tokens`         | 判读           |
| ----------------------- | ------------ |
| `0`                     | 未命中          |
| 相对前缀长度只占零头（几十、一两百这样的小值） | **同样按未命中看待** |
| 上千，且接近前缀长度按 128 取整后的值   | 真命中          |

实测冷启动的首次调用也可能回显一个一两百的小值，别被它骗到 —— 那不代表你的前缀被缓存了。

### 对账：控制台的缓存计费详情

后台单条调用日志里会**单列缓存读取的 token 数与对应的折扣倍率**，可以直接和响应里的 `cached_tokens` 对上。需要精确核算某一次调用到底怎么计费时，以那里为准。

自检三步：

1. 构造一个千 token 以上的稳定前缀，连续发 2 次请求
2. 第 2 次响应应看到 `cached_tokens` 明显上千
3. 后台 [调用日志](/faq/call-logs) 里对应请求出现「缓存读取」计费项，输入费用明显低于第 1 次

## 提高命中率

### 稳定前缀工程化

* 长指令、few-shot 示例、工具定义放最前面；用户输入、时间戳放最后
* 工具定义的顺序与 JSON 序列化方式保持固定（别让序列化库随机排序字段）
* 图片输入也参与前缀比对，复用图片时保持 base64 / URL 与参数一致
* 同一前缀**集中连续复用**，不要拉开间隔

方法论与 OpenAI 一致，展开解释见 [OpenAI 缓存计费指南](/api-capabilities/openai/prompt-caching)。

### 长对话优先走 responses 链式

这是 Grok 上一个容易被忽略的差别：

| 接法                                       | 实测表现                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `/v1/chat/completions` 追加式多轮             | 连追 5 轮、prompt 从 8.8K 涨到 10K，`cached_tokens` **始终停在最初那段静态前缀的量级** —— 每轮新增的问答没有被复用起来 |
| `/v1/responses` + `previous_response_id` | 命中量**随轮次增长**（实测第 2 轮 8704 → 第 3 轮 9344）                                           |

所以长对话、Agent 多步骤这类场景，优先用 Responses API 的链式接法：

```python theme={null}
r1 = client.responses.create(
    model="grok-4.6",
    input=[{"role": "system", "content": LONG_SYSTEM},
           {"role": "user", "content": "第一个问题"}],
    store=True,
)

r2 = client.responses.create(
    model="grok-4.6",
    previous_response_id=r1.id,          # 只传新增的一句，历史由上游接续
    input=[{"role": "user", "content": "追问"}],
    store=True,
)
print(r2.usage.input_tokens_details.cached_tokens)
```

端点差异详见 [Grok 概览的端点一览](/api-capabilities/grok/overview)。

### 关于 `x-grok-conv-id`

xAI 官方最佳实践建议每次请求带上 `x-grok-conv-id` 请求头（UUID 或会话 ID）以提高命中率。我们在 API易 上做了对称 A/B（带与不带各若干组独立前缀、各若干次复用），**两组的命中表现没有可观测的差异**。带上它无害，但不要把命中率的指望押在这个请求头上。

## 命中率与预期管理

<Warning>
  **缓存命中不保证。** xAI 官方文档写明缓存条目可能因内存压力、服务重启、请求被路由到另一台服务器而失效。

  实测在**稳定前缀 + 连续复用**的场景下多数请求能命中，但确实存在抖动，且抖动来自上游侧、无法由调用方控制。**做成本测算请一律按无缓存价格打底，把命中当作额外优惠。**
</Warning>

还有一点值得提前说清楚：**缓存的价值在成本，不在速度**。实测命中与未命中的首字延迟差距只有百毫秒量级 —— 别指望靠缓存把长上下文请求变快。

## 最常见的踩坑

| 现象                          | 原因                                              |
| --------------------------- | ----------------------------------------------- |
| `cached_tokens` 恒为 0 或恒是极小值 | prompt 太短（千 token 量级以下）/ 前缀开头有时间戳、UUID、随机 ID    |
| 时有时无                        | 上游驱逐，属正常现象；缩短复用间隔、批量任务连续发                       |
| 命中数比前缀短一截                   | 128 token 取整，正常                                 |
| 多轮对话 `cached_tokens` 不涨     | chat/completions 只复用最初那段静态前缀，长对话改走 responses 链式 |
| 改了历史消息就不命中了                 | 缓存只能追加，改 / 删 / 重排历史即作废                          |
| 换模型后不命中                     | 缓存按**模型隔离**，`grok-4.6` 与 `grok-4.5` 互不共享        |

## 与其它通道的差异速查

|       | Grok                  | OpenAI          | Gemini                    | Claude                    |
| ----- | --------------------- | --------------- | ------------------------- | ------------------------- |
| 触发方式  | **全自动**               | **全自动**         | 隐式自动                      | 手动打 `cache_control`       |
| 写入费   | **免费**                | **免费**          | 免费                        | 1.25× / 2×                |
| 命中价   | 0.25×                 | 0.1×            | 官方口径最高省 90%               | 0.1×                      |
| 最小阈值  | 官方未公布，实测千 token 以下不起缓 | 1024 tokens     | 4096（3 系）/ 2048（2.5 系）    | 1024–4096                 |
| 块粒度   | 128 token             | 128 token       | —                         | —                         |
| 命中稳定性 | ✅ 命中确定，但上游不保证         | ✅ 稳定            | ⚠️ 不保证，体感一般               | ✅ 稳定                      |
| 命中字段  | `cached_tokens`       | `cached_tokens` | `cachedContentTokenCount` | `cache_read_input_tokens` |

全平台缓存支持总览见 [缓存计费 FAQ](/faq/cache-billing)。

<Info>
  **本页数据基于 `grok-4.6`（2026-08-19 实测）。** xAI 官方称全部 Grok 语言模型都支持前缀缓存，其余型号我们未逐一实打；块粒度、短 prompt 行为等细节以你自己用例上的实测为准。

  若你发现同一前缀下的账单与上面的口径明显不符，请带上响应头里的 request-id 联系客服。
</Info>

## 要点回顾

<CardGroup cols={2}>
  <Card title="1. 全自动" icon="wand-sparkles">
    不用打标记、没有写入费，达到条件自动缓存，第 2 次复用就是纯省钱。
  </Card>

  <Card title="2. 只能追加" icon="layers">
    从 messages 开头逐字匹配，改历史即作废；命中量按 128 token 台阶取整。
  </Card>

  <Card title="3. 长对话走链式" icon="link">
    chat 多轮只复用最初的静态前缀；responses + previous\_response\_id 的命中量随轮次增长。
  </Card>

  <Card title="4. 别押命中率" icon="scale">
    官方不保证命中，成本测算按无缓存价打底，命中当作额外优惠。
  </Card>
</CardGroup>

## 相关链接

* 同组页面：[Grok 概览](/api-capabilities/grok/overview) · [对话与推理](/api-capabilities/grok/chat) · [联网搜索与 X 搜索](/api-capabilities/grok/web-search) · [代码执行与 MCP](/api-capabilities/grok/code-execution-mcp)
* 其它通道缓存：[OpenAI 缓存计费](/api-capabilities/openai/prompt-caching) · [Gemini 缓存计费](/api-capabilities/gemini/prompt-caching) · [Claude 缓存计费](/api-capabilities/claude-prompt-caching)
* 全平台总览：[缓存计费 FAQ](/faq/cache-billing)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
* xAI 官方文档：`docs.x.ai/developers/advanced-api-usage/prompt-caching`
