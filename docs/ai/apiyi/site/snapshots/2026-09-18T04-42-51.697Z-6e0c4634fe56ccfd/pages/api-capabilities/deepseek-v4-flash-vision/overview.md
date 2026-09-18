> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision 图像理解

> DeepSeek 首个视觉模型 deepseek-v4-flash-vision-exp：看图、读截图、认图表，1M 上下文、单图最多 384 tokens。API易 输入 $0.44、输出 $1.32 每 1M tokens，OpenAI 与 Anthropic 两种格式都能调。

`deepseek-v4-flash-vision-exp` 是 DeepSeek 的**实验性视觉模型**，在 V4 Flash 的底座上加了图像输入：
描述图片、读截图里的文字、认图表数值、比较多张图，都能直接做。文本侧的能力（1M 上下文、
深度思考、函数调用、上下文缓存）全部保留，定价也与纯文本的 V4 Flash 完全一致 ——
**看图不额外加价，图片按尺寸折成输入 tokens 计费**。

API易 已完成 **124 个用例、约 1100 次调用的实测**，覆盖三种传图通道、四种图片格式、
两种协议、两个分组。

<Warning>
  **调用前必读：这个模型在 API易 有两个分组，能力不一样，必须按你用的协议选。**

  | 你用的协议                                             | 令牌要选的分组          |
  | ------------------------------------------------- | ---------------- |
  | OpenAI 格式（`/v1/chat/completions`、`/v1/responses`） | **`default`**    |
  | Anthropic 格式（`/v1/messages`，含 Claude Code 等客户端）   | **`ClaudeCode`** |

  选错不会提示"分组错误"，而是表现成参数不生效、第二轮 400、responses 报 messages 的错。
  两个分组**同价**，选分组只影响能力，不影响计费。详见下方「分组怎么选」。
</Warning>

## 核心优势

<CardGroup cols={2}>
  <Card title="看图不加价" icon="circle-dollar-sign">
    与纯文本 V4 Flash 同价：输入 \$0.44、输出 \$1.32 每 1M tokens。图片折成输入 tokens，单图最多 384。
  </Card>

  <Card title="实测识别扎实" icon="eye">
    截图 OCR 数值全对、5 根柱状图读数全对、36 个图形里数指定颜色形状 24/24 全对，否定性提问不幻觉。
  </Card>

  <Card title="大图不用预压缩" icon="image">
    2000×2000 与 4000×4000 折出的 tokens 完全相同（均 346），上游自己缩放。压缩只省带宽，不省钱。
  </Card>

  <Card title="两种协议都能调" icon="git-compare">
    OpenAI 格式（chat/completions + responses）与 Anthropic 格式（/v1/messages）都实测可用，各走各的分组。
  </Card>
</CardGroup>

## 模型信息

| 参数              | 值                                                                    |
| --------------- | -------------------------------------------------------------------- |
| **模型名称**        | `deepseek-v4-flash-vision-exp`                                       |
| **模型版本**        | DeepSeek-V4-Flash-Vision-Exp（实验性）                                    |
| **上下文窗口**       | 1M（实测硬上限 1,048,576 tokens，`max_tokens` 计入其中）                         |
| **最大输出**        | 384K（实测硬上限 393,216，超出报 `valid range of max_tokens is [1, 393216]`）   |
| **可用分组**        | `default`、`ClaudeCode`、`svip`                                        |
| **端点**          | `POST /v1/chat/completions`、`POST /v1/responses`、`POST /v1/messages` |
| **图片输入**        | ✅ JPEG / PNG / GIF / WebP                                            |
| **深度思考**        | 默认开启，可关（写法与分组有关，见下）                                                  |
| **流式输出**        | ✅ 三种端点均支持                                                            |
| **函数调用 / 工具使用** | ✅ 支持，含流式增量拼装                                                         |
| **JSON 输出**     | ✅ `json_object`；❌ `json_schema`（上游未开放）                               |
| **定价**          | 输入 \$0.44、输出 \$1.32、缓存命中 \$0.014，每 1M tokens                         |

<Note>
  官方自 2026 年 8 月 17 日起对该模型采用峰谷两档计费（峰值时段为 01:00-04:00 与 06:00-10:00 (UTC)，
  即 09:00-12:00 与 14:00-18:00 (UTC+8)）。**本站固定按峰值档计价**，不随时段浮动。
</Note>

## 分组怎么选

这个模型在 API易 挂了两个分组，**上游渠道不是同一个端点**，所以能力不对等。
下表是 2026 年 8 月 21 日的实测结果（每格重复 3 次）：

| 能力                         | `default` 分组              | `ClaudeCode` 分组 |
| -------------------------- | ------------------------- | --------------- |
| `/v1/chat/completions` + 图 | ✅                         | ✅               |
| `/v1/responses` + 图        | ✅                         | ❌ 全部 400        |
| `/v1/messages` + 图         | ⚠️ 必须显式传 `top_p`，且多轮会 400 | ✅ 完整可用          |
| `detail` 省 token           | ✅ 生效                      | ❌ 被忽略           |
| 关闭深度思考（OpenAI 格式）          | ✅ 生效                      | ❌ 被忽略           |
| `logprobs`                 | ✅ 有值                      | ❌ 返回空           |
| 响应里的 `reasoning_tokens` 统计 | ✅ 有                       | ❌ 整个字段缺失        |
| 图片用公网外链（Anthropic 格式）      | ❌                         | ✅               |

### 用 OpenAI 格式 → 选 `default` 分组

在控制台创建令牌时把分组选成 `default`，然后：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",          # default 分组的令牌
    base_url="https://api.apiyi.com/v1",
)
```

### 用 Anthropic 格式 → 选 `ClaudeCode` 分组

在控制台创建令牌时把分组选成 `ClaudeCode`，然后：

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",          # ClaudeCode 分组的令牌
    base_url="https://api.apiyi.com",
)
```

<Tip>
  一个账号可以同时建多个不同分组的令牌，互不影响 —— 建议就按协议各留一把。
  分组的作用和创建方式见 [分组是什么](/faq/groups-explained)、
  [令牌与分组](/faq/token-and-groups)，三个分组的区别见
  [Codex、ClaudeCode 和 Default 分组有什么区别](/faq/codex-claudecode-default-groups)。
</Tip>

<Warning>
  **Anthropic 格式千万别用 `default` 分组**，会撞上两个叠加问题：

  1. 不显式传 `top_p` 一律返回 400 `Invalid top_p value`
  2. 就算补上 `top_p`，第一轮返回的 `thinking` 块原样回传到第二轮时会报
     `unknown variant 'thinking'` —— 而 Claude Code、Anthropic SDK 这类标准客户端
     一定会原样回传，所以**多轮必断**

  换成 `ClaudeCode` 分组，这两个问题都不存在，工具调用闭环也完整可用。
</Warning>

## 三种传图方式

### 1. base64 内联（最常用）

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "这张图里有什么？"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ],
    }],
    max_tokens=2000,
)
print(resp.choices[0].message.content)
```

### 2. 公网图片外链

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "描述这张图"},
            {"type": "image_url",
             "image_url": {"url": "https://example.com/image.jpg"}},
        ],
    }],
    max_tokens=2000,
)
```

外链长度上限 8192 字符，图片需在 60 秒内下载完成。链接不通会返回
`Failed to download image`。

### 3. `file` 内容块（等价于 base64 内联）

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

实测与 `image_url` 通道折出的 tokens 完全一致（同一张图都是 303）。

<Warning>
  **Files API（`/v1/files` 上传后用 `file_id` 引用）在 API易 不可用**，
  这是第三方中转平台的普遍情况。因此官方给 `file_id` 留的两个额度
  —— 单图 64 MiB、单请求总量 200 MiB —— 也拿不到。

  实际能用的上限是：**单图 ≤ 32 MiB、单请求体 ≤ 48 MiB**。
  超了会返回 `image file size exceeds limit 32 MB`。
</Warning>

## 图片怎么计费

图片按**缩放后的尺寸**折成输入 tokens，与文本 tokens 一起按 \$0.44 / 1M 计价。
下面是 API易 实测数据（用同一段提示词做差值，扣掉文本基线）：

| 图片尺寸                        | 折算 tokens | 单图成本        | 每千张    |
| --------------------------- | --------- | ----------- | ------ |
| 64×64                       | 114       | \$0.00005   | \$0.05 |
| 384×384                     | 114       | \$0.00005   | \$0.05 |
| 800×800                     | 346       | \$0.000152  | \$0.15 |
| 2000×2000                   | 346       | \$0.000152  | \$0.15 |
| 4000×4000                   | 346       | \$0.000152  | \$0.15 |
| 1600×1200                   | 354       | \$0.000156  | \$0.16 |
| 1600×1200 + `detail: "low"` | 142       | \$0.0000625 | \$0.06 |

三条规律，实测与官方描述完全一致：

* **单图上限 384 tokens**。实测最大 354，怎么放大都超不过
* **大图会被缩到约 800×800 等效**。所以 2000² 与 4000² 折出的 tokens 完全相同，
  **上传前预压缩只省带宽、不省钱**
* **小于 384×384 的图会被放大**。所以 64×64 和 384×384 花的钱一样，
  小图不必刻意再缩

### 省下六成 token 的开关：`detail: "low"`

不需要看清细节时（判断图片类型、认主体、粗略分类），加上 `detail: "low"`
会把图缩到 512×512 再推理：

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

四个档位实测（1600×1200 同一张图）：

| `detail`   | 折算 tokens | 相对默认      |
| ---------- | --------- | --------- |
| `low`      | 142       | **省 60%** |
| `high`     | 354       | 持平        |
| `original` | 354       | 基准        |
| `auto`     | 354       | 持平        |

<Warning>
  `detail` 只在**两个条件同时满足**时生效：走 `image_url` 通道（放在 `file` 块上会被静默忽略），
  且令牌是 **`default` 分组**（`ClaudeCode` 分组下不生效）。

  填了非法值会明确报错：`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`。
</Warning>

## 深度思考控制

模型**默认开启深度思考**，思考内容会计入 `max_tokens` 配额。
纯识图任务建议直接关掉：实测关思考后 24/24 全对、更快，还省下思考的输出 tokens，
输入侧也少 80 tokens（思考模式的系统提示词固定占这么多）。

各写法实测（每种 3 次）：

| 写法                               | `default` 分组 chat   | `ClaudeCode` 分组 chat | `/v1/messages` |
| -------------------------------- | ------------------- | -------------------- | -------------- |
| `thinking: {"type": "disabled"}` | ✅                   | ❌                    | ✅ 两个分组都行       |
| `reasoning_effort: "none"`       | ✅                   | ❌                    | —              |
| `reasoning_effort: "low"`        | ⚠️ 思考仍在，只是换了更短的系统提示 | ❌                    | —              |
| `reasoning: {"effort": "none"}`  | ❌                   | ❌                    | —              |
| `enable_thinking: false`         | ❌                   | ❌                    | —              |

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[...],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},   # default 分组有效
)
```

<Warning>
  **`max_tokens` 别给小**。开着思考时，一句话问题也可能先输出几百 tokens 的思考内容，
  给小了会 `finish_reason: "length"` 且 `content` 为空字符串 —— 看起来像模型没回答。
  开思考建议 2000 以上；或者干脆关掉思考。
</Warning>

## 上下文缓存

无需任何参数，相同长前缀重复请求会自动命中，命中部分按 \$0.014 / 1M 计费。
但**含图请求有两点和纯文本不一样**：

|              | 纯文本请求 | 含图请求      |
| ------------ | ----- | --------- |
| 第几次开始命中      | 第 2 次 | 第 3 次     |
| 图片那部分 tokens | —     | **永不进缓存** |

实测（2304 tokens 的文本前缀 + 一张 800×800 图）：

| 第几次 | prompt\_tokens | 命中       | 未命中  |
| --- | -------------- | -------- | ---- |
| 1   | 2675           | 0        | 2675 |
| 2   | 2675           | 0        | 2675 |
| 3   | 2675           | **2304** | 371  |
| 4   | 2675           | 2304     | 371  |

命中量恰好等于图片**之前**那段文本，图片本身与其后的内容每次都全价。
所以**把固定的长指令放在图片前面**，能让它进缓存；放在图片后面则永远命中不了。

<Note>
  Anthropic 格式下这些字段叫 `cache_read_input_tokens` / `cache_creation_input_tokens`，
  行为一致。注意 `cache_control` 显式缓存标记**不生效**（上游用的是自动前缀缓存），
  且两种协议的 usage 口径不同：OpenAI 格式的 `prompt_tokens` 是全量，
  Anthropic 格式命中后 `input_tokens` 只剩未命中部分，**不能直接对账**。
</Note>

## 支持的图片格式

| 格式               | 支持 | 说明                                          |
| ---------------- | -- | ------------------------------------------- |
| JPEG             | ✅  |                                             |
| PNG              | ✅  |                                             |
| GIF              | ✅  | 动画 GIF **只读第一帧**，tokens 也按单帧算               |
| WebP             | ✅  |                                             |
| BMP / TIFF / SVG | ❌  | 返回 `You have uploaded an unsupported image` |

四种支持格式折出的 tokens 完全一致，选哪个都不影响成本。

<Tip>
  **格式按文件内容判断，不看你声明的 MIME**。实测把 PNG 谎报成 `image/jpeg` 照样正常工作
  —— 所以扩展名写错、MIME 填错都不影响，只要文件本身是这四种格式之一。
</Tip>

## 实测能力矩阵

以下为 API易 2026 年 8 月 21 日的实测结果：

| 能力                                                     | 官方声明     | 实测（`default` 分组）                                      |
| ------------------------------------------------------ | -------- | ----------------------------------------------------- |
| base64 内联图                                             | ✅        | ✅                                                     |
| 公网外链图                                                  | ✅        | ✅                                                     |
| `file` 块 `file_data`                                   | ✅        | ✅                                                     |
| `file_id`（Files API）                                   | ✅        | ❌ 平台不提供 Files API                                     |
| 多图单请求                                                  | 最多 600 张 | ✅ 实测 20 张顺序内容全对                                       |
| 图 + 多轮上下文                                              | ✅        | ✅                                                     |
| 图 + 函数调用                                               | ✅        | ✅ 含流式增量                                               |
| 图 + JSON 输出                                            | ✅        | ✅ `json_object`                                       |
| 结构化输出 `json_schema`                                    | —        | ❌ 上游返回 `This response_format type is unavailable now` |
| 流式输出                                                   | ✅        | ✅ 三种端点均可                                              |
| `logprobs` / `temperature` / `top_p` / `stop` / `seed` | ✅        | ✅                                                     |
| Responses 的 `previous_response_id` 会话链                 | ✅        | ❌ **静默失效**（不报错但不带上下文），多轮请自己拼 `input`                  |

### 视觉准确性抽查

| 任务                     | 结果          |
| ---------------------- | ----------- |
| 6 行英数混排截图 OCR          | 订单号、金额、邮箱全对 |
| 5 根柱状图读数               | 5/5 全对，含标题  |
| 6×6 网格里数指定颜色形状（36 个图形） | 24/24 全对    |
| 两图差异比较                 | 正确          |
| 10 图 / 20 图顺序标签识别      | 全对          |
| 否定性提问（图中没有的东西）         | 正确否认，未幻觉    |

## 限制与常见报错

| 限制             | 值         | 超出时的报错                                                  |
| -------------- | --------- | ------------------------------------------------------- |
| 单图大小           | 32 MiB    | `image file size exceeds limit 32 MB`                   |
| 单请求体           | 48 MiB    | —                                                       |
| 外链长度           | 8192 字符   | `external link length … too long, max link length 8192` |
| 单请求图片数         | 官方 600 张  | —                                                       |
| `max_tokens`   | 393,216   | `valid range of max_tokens is [1, 393216]`              |
| `top_logprobs` | 0–20      | `valid range of top_logprobs is [0, 20]`                |
| 上下文            | 1,048,576 | `This model's maximum context length is 1048576 tokens` |

<Note>
  上下文的 1,048,576 是实测硬上限，且报错显示 **`max_tokens` 会计入这个总量**
  （`… in the messages, … in the completion`）。拼满长上下文时记得给输出配额留位置，
  否则会撞上限。
</Note>

其它常见 400：

* `You have uploaded an unsupported image` —— 格式不在四种之列，或 base64 数据损坏
* `Failed to download image` —— 外链不通或超过 60 秒
* `Image in assistant message is unsupported` —— 图片只能放在 `user` 消息里

<Note>
  实测约 **1%\~3%** 的请求会出现连接被静默关闭（客户端表现为 SSL EOF 或握手超时），
  与图片无关、与分组无关，是通道层面的偶发现象。
  **客户端务必设置读超时并带重试**，否则单条请求可能挂住两分钟以上。
  超时设置见 [超时配置](/faq/timeout-configuration)。
</Note>

## 完整示例

### OpenAI 格式（`default` 分组）

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",       # default 分组
    base_url="https://api.apiyi.com/v1",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "读出这张柱状图的五个数值，只输出数字。"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "original"}},
        ],
    }],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
print(resp.usage)
```

### Anthropic 格式（`ClaudeCode` 分组）

```python theme={null}
import base64
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",       # ClaudeCode 分组
    base_url="https://api.apiyi.com",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

msg = client.messages.create(
    model="deepseek-v4-flash-vision-exp",
    max_tokens=2000,
    thinking={"type": "disabled"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "读出这张柱状图的五个数值，只输出数字。"},
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/png", "data": b64}},
        ],
    }],
)
print(msg.content)
```

## 相关文档

<CardGroup cols={2}>
  <Card title="图像理解（识图）API" icon="eye" href="/api-capabilities/vision-understanding">
    各家识图模型的通用调用方式与对比
  </Card>

  <Card title="DeepSeek V4 Flash 文本生成" icon="zap" href="/api-capabilities/deepseek-v4-flash/overview">
    同底座的纯文本版本，1M 上下文与双端点能力
  </Card>

  <Card title="分组怎么选" icon="users" href="/faq/codex-claudecode-default-groups">
    Codex、ClaudeCode 和 Default 三个分组的区别与选择建议
  </Card>

  <Card title="超时配置" icon="timer" href="/faq/timeout-configuration">
    客户端读超时与重试的推荐设置
  </Card>
</CardGroup>
