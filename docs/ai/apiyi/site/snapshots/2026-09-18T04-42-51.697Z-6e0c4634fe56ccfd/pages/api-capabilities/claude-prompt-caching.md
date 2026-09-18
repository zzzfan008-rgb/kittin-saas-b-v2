> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Prompt Caching 缓存计费指南

> Claude 原生格式的 Prompt Cache 入门：怎么写出会缓存的请求、怎么看账单、为什么没命中。看完能少花一半钱。

如果你用 Claude Code、Cline、Cursor，或者自己写代码调 Claude API，**Prompt Cache 是把账单打下来最直接的一件事**——命中缓存的部分只按 **0.1×** 计费，相当于打 1 折。

本页基于 Anthropic 官方文档整理（`platform.claude.com/docs/en/build-with-claude/prompt-caching`），并按 API易 的接入方式给出可直接复制的示例。

## 一句话理解

把一段**反复使用的长 prompt**（系统说明 / 长文档 / few-shot 示例）打上 `cache_control` 标记，服务器会把它存起来。下次相同前缀的请求来，服务器跳过重复处理，**便宜约 10 倍、也更快**。一段时间内没人再用就会过期。

## 为什么要用 —— 看账单倍率

以模型原始输入 token 价为 **1×** 计：

| 类型             | 价格        | 说明         |
| -------------- | --------- | ---------- |
| 普通输入           | **1×**    | 没缓存的部分，原价  |
| 缓存写入（5 分钟 TTL） | **1.25×** | 第一次写入贵 25% |
| 缓存写入（1 小时 TTL） | **2×**    | 想存更久要付更多   |
| **缓存读取（命中）**   | **0.1×**  | 后续每次便宜 90% |

**回本点：**

* **5 分钟 TTL**：只需 **2 次**复用同一前缀即可回本（1.25 + 0.1 = 1.35，比两次不缓存的 2.0 便宜）。
* **1 小时 TTL**：需要 **3 次**才回本（2 + 0.2 = 2.2，比 3.0 便宜）。

<Info>
  TTL 是**滑动窗口**：每次命中都会把过期时间重置，因此活跃的会话不会平白过期。只有真正闲置超过 TTL 才会失效。
</Info>

### 适合场景

* 同一份长系统提示词被多次调用（Agent、客服机器人）
* 多轮对话（每加一轮，前面的历史都能复用）
* 批量处理同一份文档（一份合同问 50 个问题）
* RAG 把检索到的稳定文档块作为前缀

### 不适合场景

* 每次 prompt 从第一个字开始都不一样
* 整体很短，根本到不了最小 token 阈值（见下）

## 触发缓存的三个硬条件

缺一不可。

### 1. 必须显式打标记 `cache_control`

`content` 不能是纯字符串，必须是 **content block 数组**，在要缓存的那一块上加 `cache_control`：

```python theme={null}
# ❌ 错：纯字符串永不缓存
"content": "一大段长文..."

# ✅ 对：content block + cache_control
"content": [
    {
        "type": "text",
        "text": "一大段长文...",
        "cache_control": {"type": "ephemeral"},
    },
    {"type": "text", "text": "问题"},
]
```

### 2. 长度必须达到最小阈值

短于阈值的内容，**就算打了标记也不会缓存**（不报错，静默忽略）。按模型不同：

| 最小 tokens | 模型                                                               |
| --------- | ---------------------------------------------------------------- |
| **512**   | Opus 5、Fable 5 / 5.1、Mythos 5                                    |
| **1024**  | Opus 4.8、Sonnet 5、Sonnet 4.6、Sonnet 4.5、Sonnet 4、Opus 4.1、Opus 4 |
| **2048**  | Opus 4.7、Haiku 3.5                                               |
| **4096**  | Opus 4.6、Opus 4.5、Haiku 4.5                                      |

<Warning>
  **这个阈值不随版本号单调下降，别凭直觉猜。** 最典型的反直觉组合：Opus 5 只要 **512**，而更早的 Opus 4.6 / 4.5 要 **4096**，整整差 8 倍；Haiku 4.5 也是 4096，比它更老的 Haiku 3.5（2048）还高。所以「新模型门槛更低」「小模型门槛更低」这两个推断都不成立，换模型时务必查表。
</Warning>

<Tip>
  中文 1 个字大约 0.5–1 token。换算下来：Opus 5 大约 **500 字**以上就能缓存，Sonnet 5 / Sonnet 4.6 需要 **1000 字**左右，而 Opus 4.6 / Haiku 4.5 要到 **4000 字**才有意义。阈值可能随官方版本变化，**以 Anthropic 官方文档为准**。
</Tip>

<Info>
  **实测校验（2026-07-29，API易 站内）。** 我们用逐档递增的固定前缀实测了写入起点：`claude-opus-5` 在 301 tokens 时不产生缓存写入、614 tokens 时产生，落点与官方 **512** 一致；`claude-sonnet-5` 在 612 tokens 时不写入、1250 tokens 时写入，落点与官方 **1024** 一致。两者均与上表吻合。
</Info>

### 3. 前缀必须逐字节相同

缓存按**前缀匹配**：从请求开头一直到 `cache_control` 标记位置，这段字节流必须和上一次**完全一样**。改任何一个字符——哪怕是空格、JSON 字段顺序、时间戳——都算"新前缀"，会重新写入而不是命中。

**实践含义：稳定的东西放前面，易变的东西放后面。**

```python theme={null}
# ❌ 错：每换一个问题前缀就变了，永远命中不了
content = [
    {"type": "text", "text": "请回答下面问题: " + 问题},  # 这块在变
    {"type": "text", "text": 长文, "cache_control": {"type": "ephemeral"}},
]

# ✅ 对：长文在前打标记，问题在后不打标记
content = [
    {"type": "text", "text": 长文, "cache_control": {"type": "ephemeral"}},  # 稳定
    {"type": "text", "text": 问题},                                            # 随便变
]
```

## 最小可运行示例

跑两次同一段长文 + 不同问题，第一次写入缓存，第二次命中：

```python theme={null}
import json, os, requests

URL = "https://api.apiyi.com/v1/messages"
KEY = os.environ["APIYI_API_KEY"]
HEADERS = {
    "content-type": "application/json",
    "x-api-key": KEY,
    "anthropic-version": "2023-06-01",
}

# 必须足够长。Sonnet 4.6 至少 1024 tokens，大约 1000+ 中文字。
LONG_TEXT = open("long_document_zh.txt").read()


def ask(question: str, label: str):
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 256,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": LONG_TEXT, "cache_control": {"type": "ephemeral"}},
                {"type": "text", "text": question},
            ],
        }],
    }
    r = requests.post(URL, headers=HEADERS, data=json.dumps(payload), timeout=120)
    u = r.json().get("usage", {})
    print(f"[{label}] input={u.get('input_tokens')} "
          f"write={u.get('cache_creation_input_tokens')} "
          f"read={u.get('cache_read_input_tokens')}")


ask("请概括主旨", "第1次")    # 期望 write>0, read=0
ask("请给3个关键词", "第2次")  # 期望 write=0, read>0
```

期望看到的输出：

```text theme={null}
[第1次] input=35 write=6512 read=0
[第2次] input=22 write=0    read=6512
```

第 2 次的 `read` ≈ 第 1 次的 `write`，说明同一段前缀被命中复用了。

## 怎么判断命中没命中 —— 看三个字段

每次响应的 `usage` 里：

| 字段                            | 含义               | 计费倍率       |
| ----------------------------- | ---------------- | ---------- |
| `input_tokens`                | 没被缓存的剩余输入 token  | 1×         |
| `cache_creation_input_tokens` | 这次写入缓存的 token 数  | 1.25× 或 2× |
| `cache_read_input_tokens`     | 这次从缓存读取的 token 数 | **0.1×**   |

**输入总量 = 三者之和。** 只要 `cache_read_input_tokens > 0`，你就在省钱。

## 最常见的踩坑

| 现象                                                                                                               | 原因                                                                             |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `write` 永远是 `0` 或字段不存在                                                                                           | 没打 `cache_control` 标记 / 长度没到阈值 / 用了 OpenAI 兼容格式                                |
| 第 2 次 `write` 又 > 0，`read` 还是 0                                                                                  | 前缀变了。常见：prompt 里有 `datetime.now()`、UUID、变化的用户 ID；JSON 序列化顺序不稳定；带时间戳的 system 提示 |
| 隔了一会儿再调又变成写入                                                                                                     | 闲置超过 TTL 过期。要常驻可加 `{"type": "ephemeral", "ttl": "1h"}`                         |
| 同一份 prompt 切换模型后没命中                                                                                              | 缓存按模型隔离，换模型相当于换 key                                                            |
| 用 Fable 5 / 5.1 时某一轮 `read` 突然归 0，响应 `model` 变成 `claude-opus-4-8`（或 `claude-opus-5`），或 `stop_reason` 为 `refusal` | 触发了内容安全回退 / 拒答。回退等于换模型换缓存键，本轮读不到之前的缓存；被拒那一轮写入的缓存后续也不会被读取。见下方说明                 |
| 长对话最近几轮不命中                                                                                                       | 单次请求最多 **4 个** `cache_control` 断点；且每个断点的**前缀查找窗口为 20 个 block**，更久远的内容不会被纳入命中检查 |

<Warning>
  **Fable 系列的安全回退会打断缓存。** `claude-fable-5` / `claude-fable-5-1` 内建安全分类器，命中高风险内容时会**拒答**（HTTP 200 + `stop_reason: "refusal"`）或**安全回退**到 Opus 系列处理，响应顶层的 `model` 会如实回显回退后的模型。这是模型侧的正常行为，不是中转层问题。

  对缓存的影响：回退等于换模型、换缓存键，这一轮读不到前面轮次写的缓存，下一轮回到 Fable 后才能继续命中；被拒的那一轮即使报了 `cache_creation_input_tokens`，这份写入后续不会被读取。多轮 agent 会话里表现为**个别轮次 `read` 归 0、`write` 重新变大**。

  怎么办：判断命中先看响应 `model` 和 `stop_reason`，别只看 usage；被拒的输入调整后再发，不要原样重试；对话内容保持规范就能把这类 miss 压到最低。拒答、回退与计费的细节见 [Fable 5.1 上线说明](/news/claude-fable-5-1-launch)。
</Warning>

<Warning>
  **Prompt Cache 只在 Anthropic 原生格式（`/v1/messages`）下生效。** 用 OpenAI 兼容格式（`/v1/chat/completions`）调 Claude 时，无论你怎么传，都拿不到缓存计费。Claude Code、Cline、Cursor 等深度场景请务必走原生格式。
</Warning>

## 进阶：多轮对话怎么打

把 `cache_control` 打在**最近一条 user 消息的最后一个 content block** 上。每加一轮，缓存读取范围会自动延伸到上一轮结束的位置：

```python theme={null}
# 每一轮请求构造时
messages[-1]["content"][-1]["cache_control"] = {"type": "ephemeral"}
```

两个硬限制要注意：

* 单次请求最多 **4 个** `cache_control` 断点。
* 每个断点的**前缀查找只回溯最近 20 个 content block**——超出 20 个 block 的更久远内容不会再被检索去拼命中。换言之：很长的多轮对话靠"最末一次打标记"是兜不住前面所有历史的。

实践建议：在工具定义/系统提示/长文档/最近一轮对话各打一个断点，正好用满 4 个槽位，让不同变化频率的内容互不影响彼此的命中。

## API易 关于缓存的说明

<Info>
  **API易完整透传缓存字段。** 你在请求里写的 `cache_control` 会原样转发给上游 Claude（AWS Claude 或 Claude Official），响应里的 `cache_creation_input_tokens` / `cache_read_input_tokens` 也会原样回吐给你——所以你的代码无需为中转层做任何额外适配。
</Info>

如何自检：

1. 第一次发送时观察响应 `usage.cache_creation_input_tokens > 0`（写入成功）。
2. 几秒后用相同前缀再发一次，应看到 `usage.cache_read_input_tokens > 0`（命中）。
3. 后台账单里会单独显示**缓存写入** / **缓存读取**两类计费项，倍率与官方一致（1.25× / 2× / 0.1×）。

## 要点回顾

<CardGroup cols={2}>
  <Card title="1. 打标记" icon="tag">
    `cache_control: {"type": "ephemeral"}` 加在 content block 上，**纯字符串 content 永不缓存**。
  </Card>

  <Card title="2. 够长度" icon="ruler">
    Opus 5 ≥ 512、Sonnet 5 / Sonnet 4.6 ≥ 1024、Opus 4.7 ≥ 2048、Opus 4.6 / Haiku 4.5 ≥ 4096 tokens，否则静默忽略。
  </Card>

  <Card title="3. 稳前缀" icon="lock">
    稳定内容在前、易变内容在后；任何一个字符变化都会让缓存失效。
  </Card>

  <Card title="4. 看 usage" icon="search">
    `cache_read_input_tokens > 0` 才说明真的省钱了。
  </Card>
</CardGroup>

## 相关链接

* 父页面：[Claude API 调用基础说明](/api-capabilities/claude)
* 客户端配置教程：[Claude Code 接入指南](/scenarios/programming/claude-code) · [Cherry Studio 接入指南](/scenarios/chat/cherry-studio)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
* Anthropic 官方文档：`platform.claude.com/docs/en/build-with-claude/prompt-caching`
