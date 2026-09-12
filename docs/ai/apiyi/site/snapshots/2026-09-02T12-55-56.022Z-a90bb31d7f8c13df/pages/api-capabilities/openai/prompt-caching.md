> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Prompt Caching 缓存计费指南

> OpenAI 缓存全自动、零标记、不收写入费：命中部分按输入价 1 折计费。怎么写出会命中的请求、怎么看 cached_tokens。

用 gpt-5 系列跑 Agent、多轮对话、批量文档处理，Prompt Caching 能把命中部分的输入账单打到 **1 折** —— 而且**什么代码都不用改**，缓存是全自动的。

本页基于 OpenAI 官方文档整理（`developers.openai.com/api/docs/guides/prompt-caching`，2026年6月数据），并按 API易 的接入方式给出可直接复制的示例。

## 一句话理解

只要请求的**开头部分（前缀）和最近一次请求完全相同且不短于 1024 tokens**，服务器就自动跳过重复处理：命中部分按 **0.1×** 计费，延迟最多降 80%。

和 Claude 缓存最大的两个区别：

* **不用打标记**：没有 `cache_control`，达到条件自动缓存
* **没有写入费**：Claude 写入要付 1.25× / 2×，OpenAI 写入免费

## 为什么要用 —— 看账单倍率

以模型原始输入 token 价为 **1×** 计：

| 类型       | 价格         | 说明         |
| -------- | ---------- | ---------- |
| 普通输入     | **1×**     | 没命中的部分，原价  |
| 缓存写入     | **0×（免费）** | 自动发生，不收钱   |
| **缓存命中** | **0.1×**   | 命中部分便宜 90% |

**回本点：第 2 次请求就净省。** 没有写入成本要摊，同一前缀只要被复用一次，省下的就是纯收益 —— 这比 Claude（先付 1.25× 写入费、复用 2 次才回本）更无脑。

按 API易 在售价格换算（每 1M tokens）：

| 模型                  | 普通输入   | 缓存命中        |
| ------------------- | ------ | ----------- |
| `gpt-5.4`           | \$2.50 | **\$0.25**  |
| `gpt-5.4-mini`      | \$0.75 | **\$0.075** |
| `gpt-5.5`           | \$5.00 | **\$0.50**  |
| `gpt-5.1` / `gpt-5` | \$1.25 | **\$0.125** |

### 适合场景

* 同一份长系统提示词 + 工具定义被反复调用（Agent、客服机器人）
* 多轮对话（每加一轮，前面的历史自动命中）
* 批量处理同一份文档（一份合同问 50 个问题）
* RAG 把稳定的文档块放在 prompt 前部

### 不适合场景

* 每次请求从第一个字开始就不一样
* 整个 prompt 不足 1024 tokens（到不了起缓阈值）

## 触发命中的三个硬条件

缺一不可。

### 1. 前缀不短于 1024 tokens

短于 1024 tokens 的请求**永远不会被缓存**（不报错，静默不生效）。超过 1024 之后，命中长度按 **128 token 增量**延伸：实际命中量是 1024、1152、1280……这样的台阶值，所以 `cached_tokens` 通常略小于你的稳定前缀总长，正常现象。

### 2. 前缀逐字节相同

缓存按**前缀匹配**：从请求第一个字符开始逐字节比对，遇到第一处不同就停止。任何变化 —— 时间戳、用户名、JSON 字段顺序 —— 都会让后面的内容全部按原价计费。

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

### 3. 在保留期内再次请求

* 基础保留：闲置 **5–10 分钟**后逐出，最长不超过 1 小时
* **2026年5月29日起**，gpt-5.1 及之后模型（含 pro 变体）对非 ZDR 组织**默认启用 24 小时扩展保留**（`prompt_cache_retention: "24h"`），价格不变 —— 也就是说当天内的复用基本都能命中

## 最小可运行示例

同一段长前缀发两次不同问题，第一次自动写入，第二次命中：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# 必须足够长：不少于 1024 tokens，大约 1500+ 中文字
LONG_SYSTEM = open("long_instructions_zh.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="gpt-5.4",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("请概括要点", "第1次")    # 期望 cached=0
ask("请给3个关键词", "第2次")  # 期望 cached≈前缀长度
```

期望看到的输出：

```text theme={null}
[第1次] input=2330 cached=0
[第2次] input=2335 cached=2304
```

第 2 次 `cached` 接近系统提示词长度（按 128 取整），这部分只按 1 折计费。

<Info>
  `/v1/responses` 端点同样自动生效，字段为 `usage.input_tokens_details.cached_tokens`。官方内部测试显示 Responses 端点的缓存利用率比 Chat Completions 还要高 40%–80%，多轮 Agent 场景建议优先走 [原生调用](/api-capabilities/openai/native)。
</Info>

## 怎么判断命中没命中 —— 看 usage 字段

| 端点                     | 命中字段                                        |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

**`cached_tokens > 0` 就在省钱**：这部分按 0.1× 计，剩余的 `prompt_tokens - cached_tokens` 按原价计。

## 提高命中率的进阶手段

### prompt\_cache\_key 固定路由

缓存命中要求请求落到同一台缓存机器上。默认按前缀哈希路由已经够用，但当**多个用户共享相似前缀**或并发较高时，显式传 `prompt_cache_key` 可以明显提高命中率：

```python theme={null}
r = client.chat.completions.create(
    model="gpt-5.4",
    messages=messages,
    prompt_cache_key="user-12345"  # 按用户/会话固定路由
)
```

<Warning>
  同一个"前缀 + prompt\_cache\_key"组合的请求超过约 **15 次/分钟** 时会溢出分流到其他机器，命中率反而下降。高并发场景应按用户或会话**拆分多个 key**，不要全局共用一个。
</Warning>

### 稳定前缀工程化

* 工具定义的顺序、JSON 序列化方式保持固定（别让序列化库随机排序字段）
* 图片输入也参与前缀比对，复用图片时保持 URL / base64 和 `detail` 参数一致
* 要按场景启用不同工具时，用 `allowed_tools` 限定子集，而不是改动 `tools` 列表本身 —— 前者不破坏缓存前缀

### 多轮对话天然命中

追加式的 messages 数组天然满足前缀稳定：每一轮的历史就是上一轮的完整前缀，自动命中，无需任何处理。

## 最常见的踩坑

| 现象                           | 原因                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `cached_tokens` 恒为 0         | 总长不足 1024 tokens / 前缀开头有动态内容（时间戳、UUID、随机 ID）                                               |
| 时有时无                         | 高并发没拆 `prompt_cache_key`，请求被分流 / 闲置超过保留期                                                   |
| 命中数比预期少一截                    | 128 token 增量截断，属正常 / 动态内容混进了前缀中段                                                           |
| 换模型后不命中                      | 缓存按模型隔离，`gpt-5.4` 和 `gpt-5.4-mini` 互不共享                                                    |
| 调 Claude 模型没有 cached\_tokens | OpenAI 兼容格式调 Claude 拿不到 Claude 缓存，走 [Claude 原生调用](/api-capabilities/claude-prompt-caching) |

## 与 Claude 缓存的差异速查

|       | OpenAI（gpt-5 系列）      | Claude                    |
| ----- | --------------------- | ------------------------- |
| 触发方式  | **全自动**，零代码           | 手动打 `cache_control` 标记    |
| 写入费   | **免费**                | 1.25×（5 分钟）/ 2×（1 小时）     |
| 命中价   | 0.1×                  | 0.1×                      |
| 最小阈值  | 1024 tokens           | 按模型 1024–4096 tokens      |
| 保留时长  | 5 分钟起，gpt-5.1+ 默认 24h | 5 分钟 / 1 小时（滑动续期）         |
| 看哪个字段 | `cached_tokens`       | `cache_read_input_tokens` |

Claude 侧的完整玩法见 [Claude 缓存计费指南](/api-capabilities/claude-prompt-caching)。

## API易 关于缓存的说明

<Info>
  **API易 的 OpenAI 通道支持缓存命中。** 请求原样转发上游，响应里的 `cached_tokens` 原样回吐，后台账单将命中部分按官方 0.1× 倍率单列"缓存读取"计费项 —— 代码无需为中转层做任何适配。
</Info>

如何自检：

1. 构造一个不少于 1024 tokens 的稳定前缀，连续发 2 次请求
2. 第 2 次响应应看到 `cached_tokens > 0`
3. 后台调用日志中对应请求的输入费用明显低于第 1 次

## 要点回顾

<CardGroup cols={2}>
  <Card title="1. 全自动" icon="wand-sparkles">
    不用打标记、没有写入费，达到条件自动缓存，第 2 次复用就是纯省钱。
  </Card>

  <Card title="2. 够长度" icon="ruler">
    前缀不少于 1024 tokens 才会起缓存，命中按 128 token 台阶计。
  </Card>

  <Card title="3. 稳前缀" icon="lock">
    稳定内容在前、易变内容在后；时间戳和随机 ID 别放开头。
  </Card>

  <Card title="4. 看 usage" icon="search">
    `cached_tokens > 0` 才说明真的命中了，这部分按 1 折计费。
  </Card>
</CardGroup>

## 相关链接

* 同组页面：[原生调用](/api-capabilities/openai/native) · [兼容模式调用](/api-capabilities/openai/compatible) · [FC函数调用](/api-capabilities/openai/function-calling)
* Claude 侧缓存：[Claude 缓存计费指南](/api-capabilities/claude-prompt-caching)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方文档：`developers.openai.com/api/docs/guides/prompt-caching`
