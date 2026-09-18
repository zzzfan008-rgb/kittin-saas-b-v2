> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan 视频生成（阿里云通义万相）

> 阿里云通义万相 Wan2.7 视频生成系列完整指南：文生视频 / 图生视频（含音频驱动）/ 参考图生视频 / 视频编辑，统一 DashScope 异步端点，支持 720P / 1080P 与 2–15 秒时长。

## 概述

**Wan（通义万相）** 是阿里云推出的视频生成模型系列。API易 通过 **DashScope 透传通道** 直连阿里云百炼，让你用一个 `sk-` 开头的 API易 Key 即可调用全部 Wan 视频能力，无需单独注册阿里云账号。当前主力版本为 **Wan2.7**，覆盖四种核心玩法：

| 玩法         | 模型 ID              | 你给的输入                  | 产出                       |
| ---------- | ------------------ | ---------------------- | ------------------------ |
| **文生视频**   | `wan2.7-t2v`       | 一段文本 prompt            | 5–15 秒短视频                |
| **图生视频**   | `wan2.7-i2v`       | 首帧图 + prompt（可选驱动音频）   | 让静态图"动起来"，配音频可做对口型 / rap |
| **参考图生视频** | `wan2.7-r2v`       | 1–5 个参考图/视频 + prompt   | 保持参考主体特征的单/多角色视频，支持音色参考  |
| **视频编辑**   | `wan2.7-videoedit` | 一段视频 + 1–5 张参考图 + 编辑指令 | 换装、换背景等编辑后的视频            |

<Note>
  **🎬 核心亮点**：四种能力共用同一个异步端点和同一套请求结构，**切换玩法只改 `model` 字段**。原生支持 720P / 1080P 分辨率与 2–15 秒整数时长，`wan2.7-i2v` 还支持驱动音频做对口型。适合短视频生产、电商素材、数字人口播、创意运营等场景。
</Note>

<CardGroup cols={2}>
  <Card title="文生视频 API" icon="wand-sparkles" href="/api-capabilities/wan/text-to-video">
    `wan2.7-t2v`，纯文本提示词生成视频，最简单的入口。
  </Card>

  <Card title="图生视频 API" icon="image" href="/api-capabilities/wan/image-to-video">
    `wan2.7-i2v`，首帧图 + 可选驱动音频，做对口型 / rap。
  </Card>

  <Card title="参考图生视频 API" icon="users" href="/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v`，参考图/视频保持主体特征，支持音色参考。
  </Card>

  <Card title="视频编辑 API" icon="scissors" href="/api-capabilities/wan/video-edit">
    `wan2.7-videoedit`，视频 + 参考图做换装、换背景等编辑。
  </Card>

  <Card title="可视化接口测试" icon="flask-conical" href="https://icover.ai/zh/wan-official">
    在 iCover 可视化测试工具里直接调试本接口，无需写代码。
  </Card>

  <Card title="异步任务查询 / 下载" icon="list-checks" href="https://api.apiyi.com/task">
    在 API易后台查看已提交的视频任务、下载视频链接（API 之外的查询入口）。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——异步轮询、**不能用 `/v1/videos`**、缺 `X-DashScope-Async` 头会报错、`duration` 必须是整数这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Wan2.7 的文生视频、图生视频、参考生视频与视频编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 Wan2.7 的视频生成（文生视频 / 图生视频 / 参考生视频 / 视频编辑）。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/wan/overview.md](https://docs.apiyi.com/api-capabilities/wan/overview.md) 拿到本页纯文本版；四种能力各有一页（text-to-video、image-to-video、reference-to-video、video-edit），同样加 `.md` 后缀。

  接入要求：

  1. 端点和异步头（**最容易一上来就卡住的两条**）：提交必须打 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，而且**必须带请求头 `X-DashScope-Async: enable`**，否则上游报 `current user api does not support synchronous calls`。**绝对不要用 `/v1/videos`**——那条路会把 `media` 字段丢掉，上游报 `[InvalidParameter] Field required: input.media`。轮询用的是**另一个前缀**：`GET /v1/tasks/{task_id}`（轮询不需要带异步头）。

  2. 轮询与状态：任务 ID 在提交响应的 **`output.task_id`**。轮询每 5 到 10 秒一次，**不要小于 3 秒**（会被限流），客户端整体给 20 分钟兜底。状态是 `submitted` / `in_progress` / `completed` / `failed`，**成功是 `completed`**。`progress` 长时间停在 30% 是正常的——上游只汇报 0 / 10 / 30 / 100 四档，不是卡住了。任务 ID 本身只有 **24 小时**查询有效期，超过会返回 `UNKNOWN`。

  3. 视频落地：地址在顶层 **`result_url`**，是阿里云 OSS 签名直链、**24 小时过期**。拿到后**立即在服务端下载转存到自己的 OSS / CDN**，不要存进数据库当长期地址。下载这条直链时**不要带 `Authorization` 头**，带了会 403 报 `SignatureDoesNotMatch`。

  4. 请求体结构与类型：body 是 DashScope 的嵌套结构 `{ model, input: { prompt, media[] }, parameters: { ... } }`，不是扁平的。两个类型坑：**`duration` 必须是整数 `5`，不能是字符串 `"5"`**（否则报 `cannot unmarshal string into Go struct field ... of type int`）；**`resolution` 要写大写 `720P` / `1080P`**，本模型**没有 480P**。

  5. 关键参数：`duration` 是 2 到 15 的整数、默认 5（**带参考视频时不能超过 10**）。`ratio` 五选一（`16:9` `9:16` `1:1` `4:3` `3:4`），默认 `16:9`，但**传了首帧图时 `ratio` 会被自动忽略**。`prompt_extend` 默认 `true`，强烈建议保持开启。**注意 `wan2.7-r2v` 的 `resolution` 默认是 `1080P` 而不是 `720P`**，而计费是按分辨率分档的，不显式指定会悄悄用上更贵的档位——务必显式传。`wan2.7-videoedit` 的输出时长跟随输入视频，`duration` 不起作用（模型名里 **`videoedit` 没有连字符**，别写成 `video-edit`）。

  6. 媒体输入：放在 `input.media[]`，每项形如 `{"type": ..., "url": ...}`，`url` 按文档口径要是**公网可直接 GET 的 https 链接**。各能力的类型和张数：`first_frame` 最多 1 张（i2v 和 r2v）；`reference_image` 与 `reference_video` 在 r2v 里**合计不超过 5 个**；`driving_audio` **只有 i2v 支持**；视频编辑要 1 个 `video` 加 1 到 5 张 `reference_image`。参考生视频的提示词里用「图1 / 图2」「视频1 / 视频2」按 `media` 数组顺序指代，图和视频分别计数。

  7. 计费与幂等：**按秒计费、按分辨率分档**，1080P 明显贵于 720P。任务进入 `failed` **不计费**，但**重复提交同一个任务会重复计费**——业务层要维护「业务 ID 到 task\_id」的映射做幂等，不要写无脑自动重试。错误分两个阶段：提交阶段被网关拒（HTTP 4xx/5xx，`type` 为 `task_error` / `parse_request_failed` 等）说明请求体有问题，立刻改不要重试；执行阶段是任务 `failed` 且 `error.message` 带方括号前缀，其中 `[InvalidImageUrl]` 可能是媒体链接临时不可达、可以重试，`[InvalidParameter]` 或敏感词**不要重试**。5xx 和网络错误做指数退避（1 秒 / 4 秒 / 16 秒）。

  8. 令牌要求：本模型需要令牌带 `Wan&HappyHorse` 分组，且计费模式是**按量优先或按量计费**——**按次计费的令牌路由不过去**，会报「该模型无可用渠道」。

  9. Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码进代码、也不要提交进 git。

  10. 改完真跑一次文生视频 + 一次图生视频，把生成的视频和这两次调用的花费贴给我。注意整个流程要几分钟，如果你在受限的执行环境里跑，记得把命令超时放到 600 秒以上或者放后台。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                      | 挡掉的坑                                                    |
  | ----------------------- | ------------------------------------------------------- |
  | 不能用 `/v1/videos`        | 那条路会静默丢掉 `media` 字段，上游报缺少 `input.media`，看起来像参数写错其实是端点选错 |
  | 必须带 `X-DashScope-Async` | 缺这个头会被当成同步调用直接拒绝                                        |
  | 提交与轮询前缀不同               | 提交在 `/wan/api/v1/...`，轮询却在 `/v1/tasks/{task_id}`        |
  | `duration` 是整数不是字符串     | 传 `"5"` 直接反序列化失败；`resolution` 还要大写                      |
  | `r2v` 默认 1080P          | 不显式指定就悄悄用上更贵的档位，按秒计费下成本翻倍                               |
  | 重复提交会重复计费               | 失败不计费，但无脑重试等于多付钱，必须自己做幂等                                |
  | 下载不带 `Authorization`    | OSS 签名直链带 Auth 反而 403                                   |
</Accordion>

## 为什么选 API易 的 Wan

<CardGroup cols={2}>
  <Card title="一个 Key 调全部能力" icon="key">
    无需注册阿里云、无需配置地域和环境变量。一把 API易 Key 即可调用 Wan2.7 全部四种能力以及 [HappyHorse 系列](/api-capabilities/happyhorse/overview)。
  </Card>

  <Card title="国内直连 · 免出海" icon="globe">
    直连 `api.apiyi.com`，国内机房、家宽网络均可访问，省去为阿里云配置地域 Endpoint 的麻烦。
  </Card>

  <Card title="失败不计费" icon="circle-check">
    任务进入 `failed` 状态（媒体 URL 不可达、prompt 涉敏、上游容量等）**不计费**，可放心重试。
  </Card>

  <Card title="DashScope 协议透传" icon="plug">
    请求体与阿里云 DashScope 原生协议一一对齐，对照官方文档即可迁移，响应已统一收口便于轮询。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="四合一异步端点" icon="list-check">
    t2v / i2v / r2v / video-edit 共用 `POST /wan/api/v1/...video-synthesis`，提交后返回 `task_id`，轮询 + 下载，便于批量管理。
  </Card>

  <Card title="音频驱动对口型" icon="volume-2">
    `wan2.7-i2v` 支持 `driving_audio`，让静态人像跟随音频做口型与节奏，适合 rap / 口播 / 数字人。
  </Card>

  <Card title="多主体参考" icon="users">
    `wan2.7-r2v` 支持参考图 + 参考视频混合输入（合计 ≤5），用「图1 / 视频1」标识在 prompt 里指代，支持音色参考。
  </Card>

  <Card title="多档分辨率与时长" icon="expand">
    720P / 1080P 分辨率，2–15 秒整数时长，`prompt_extend` 智能改写进一步提升短 prompt 的画质。
  </Card>
</CardGroup>

## 支持的模型

| 模型 ID              | 能力     | 必需媒体输入                                       | 说明                        |
| ------------------ | ------ | -------------------------------------------- | ------------------------- |
| `wan2.7-t2v`       | 文生视频   | 无                                            | 纯文本生成                     |
| `wan2.7-i2v`       | 图生视频   | `first_frame`（+ 可选 `driving_audio`）          | 唯一支持音频驱动的能力               |
| `wan2.7-r2v`       | 参考图生视频 | `reference_image` / `reference_video`（合计 ≤5） | 支持 `reference_voice` 音色参考 |
| `wan2.7-videoedit` | 视频编辑   | `video` + `reference_image`（1–5 张）           | 编辑模型名 **无连字符**            |

<Warning>
  `wan2.7-videoedit` 是图像编辑视频用途；另有 `wan2.7-image-pro` 属于 **图片** 模型（走 `/v1/images/generations`），不在本视频端点范围内，请勿混用。历史版本 Wan2.6 见 [历史版本](/api-capabilities/wan/historical-versions)。
</Warning>

## 分组介绍

Wan 与 [HappyHorse](/api-capabilities/happyhorse/overview) 两个系列**共用同一个 `Wan&HappyHorse` 分组**——一把令牌即可同时调用两个系列。视频模型按**秒**计费，令牌必须同时满足两个条件才能成功路由：

1. **计费模式**：选「按量优先」或「按量计费」—— 视频按秒计费，**按次计费的令牌无法路由**
2. **分组**：选择包含 `Wan&HappyHorse`

<Frame caption="创建令牌：计费模式选「按量优先」，分组选 Wan&HappyHorse（0.14x），即可调用 Wan2.7 与 HappyHorse 全部视频模型（截图中为分组旧名 Wan，现已更名 Wan&HappyHorse）">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="创建令牌界面：计费模式选「按量优先」，分组下拉中选择 Wan&HappyHorse（倍率 0.14x），令牌可同时用于 Wan2.7 与 HappyHorse" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 模型定价

### 默认价格 = 阿里云官方原价的 98％（理解简单）

控制台里 `Wan&HappyHorse` 分组显示倍率 **0.14x**，这是按**人民币**计价单位计的。本站统一用**美元充值、固定汇率 1:7**，实际折算：

```
0.14（人民币计价单位） × 7（固定汇率） = 0.98
```

也就是说，**默认价格 = 阿里云官方原价的 98%（98 折）**——比官方直采更省，且无需自建出海链路。

> 换算公式：**本站每秒美元价 = 官方人民币原价 × 0.14**（即 `× 0.98 ÷ 7`）。例如官方 1080P 原价 ¥1.0/秒 → \$0.14/秒，正好等于控制台里看到的 `0.14x`。

### 价格明细（默认价，按秒计费）

Wan2.7 文生 / 图生 / 参考生视频同价，仅 `720P` / `1080P` 两档（不支持 480P）：

| 分辨率     | 官方原价   | 本站默认价/秒   | 5 秒    | 10 秒   | 12 秒   |
| ------- | ------ | --------- | ------ | ------ | ------ |
| `720P`  | ¥0.6/秒 | \$0.084/秒 | \$0.42 | \$0.84 | \$1.01 |
| `1080P` | ¥1.0/秒 | \$0.14/秒  | \$0.70 | \$1.40 | \$1.68 |

<Info>
  * `wan2.7-r2v` 默认 `1080P`，且参考素材含视频时时长上限为 10 秒。
  * `wan2.7-videoedit`（视频编辑）输出时长跟随源视频，按实际输出秒数计费，不由 `duration` 决定。
  * 表中为 **默认价（官方 98%）**；叠加充值加赠最高档约为表中价 **÷ 1.2**（例：1080P 5 秒 \$0.70 → 约 \$0.58）。
</Info>

### 叠加充值加赠，折扣进一步走低

参与 [充值加赠活动](/faq/recharge-promotions) 后，到账额度最高可放大约 1.2 倍，等效价格进一步下探：

```
0.98 ÷ 1.2 ≈ 0.816
```

即大客户最低可做到 **官方原价的约 81.6%（约 82 折）**。

| 档位             | 等效价格（对比阿里云官方原价）     | 算法                |
| -------------- | ------------------- | ----------------- |
| 默认             | **98%**（98 折）       | 倍率 0.14x × 固定汇率 7 |
| 叠加充值加赠（大客户最高档） | **约 81.6%**（约 82 折） | 0.98 ÷ 1.2        |

<Info>
  * 计费维度 = **分辨率档位 × 时长（秒）**，失败任务不计费。
  * 1:7 为**固定结算汇率**（不是优惠汇率），所有美元充值统一适用。
  * 充值加赠的最高加赠档位与适用渠道见 [充值加赠活动](/faq/recharge-promotions)。最新倍率以 [控制台](https://api.apiyi.com/token) 为准。
</Info>

## ⚠️ 端点选择（最重要）

API易 同时挂载两条路径，**只有 DashScope 透传端点对 Wan 全部能力完整可用**：

| 路径                                                           | 协议风格           | i2v / r2v 可用性 | 结论        |
| ------------------------------------------------------------ | -------------- | ------------- | --------- |
| `/v1/videos`                                                 | OpenAI 扁平风格    | ❌ 媒体字段会被丢弃    | **不要用**   |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 原生透传 | ✅ 完整可用        | **始终用这条** |

<Warning>
  看到任何文档/示例里写 `/v1/videos` 提交 Wan 视频任务，**直接忽略**。该路径对 i2v / r2v 的 `media` 字段适配不完整，会导致上游报 `[InvalidParameter] Field required: input.media`。所有 Wan 视频创建请求都走 `/wan/api/v1/...video-synthesis`。
</Warning>

## 异步调用流程

整套流程是异步的三步：**创建任务 → 轮询状态 → 下载视频**。

<Steps>
  <Step title="创建任务">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，请求头带 `X-DashScope-Async: enable`，立刻返回 `task_id`。
  </Step>

  <Step title="轮询状态">
    `GET /v1/tasks/{task_id}`（带 `Authorization`），每 5–10 秒查一次（**不要小于 3 秒**），直到 `status` 变为 `completed`。
  </Step>

  <Step title="下载视频">
    从响应的 `result_url` 直接 GET 下载 mp4，**不要带 `Authorization` 头**（它是 OSS 签名直链，带 Auth 反而 403）。
  </Step>
</Steps>

### 任务状态说明

`GET /v1/tasks/{task_id}` 响应顶层的 `status` 字段（API易 已统一收口）：

| 状态            | 含义      | 下一步操作                                |
| ------------- | ------- | ------------------------------------ |
| `submitted`   | 已提交，排队中 | 继续轮询                                 |
| `in_progress` | 生成中     | 继续轮询（progress 常停在 30%，是上游汇报粒度粗，不是卡住） |
| `completed`   | 成功      | 从 `result_url` 下载                    |
| `failed`      | 失败      | 看 `error.message` / `fail_reason`    |

### 完整 Python 客户端

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # 你的 API易 Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. 创建任务（切换玩法只改 model 和 media）
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan2.7-t2v",
    "input": {"prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声"},
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. 轮询（5–10 秒一次）
while True:
    info = get(f"/v1/tasks/{task_id}")
    status = info["status"]
    print("status:", status, "progress:", info.get("progress"))
    if status == "completed":
        url = info["result_url"]
        break
    if status == "failed":
        raise RuntimeError(info.get("error") or info.get("fail_reason"))
    time.sleep(10)

# 3. 下载（不要带 Authorization！result_url 是 OSS 签名直链）
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 关键参数详解

提交时 body 为 DashScope 嵌套结构：`{ model, input: { prompt, media[] }, parameters: {...} }`。

### `input` 字段

| 字段                | 类型     | 必填              | 说明                                     |
| ----------------- | ------ | --------------- | -------------------------------------- |
| `prompt`          | string | ✓               | 自然语言描述，wan2.7-r2v 支持「图1 / 视频1」标识指代参考素材 |
| `negative_prompt` | string |                 | 反向提示词，≤500 字符                          |
| `media`           | array  | i2v/r2v/edit 必填 | 媒体素材数组，见下                              |

### `media[]` 类型

| `type`            | 用途                                | 适用模型          |
| ----------------- | --------------------------------- | ------------- |
| `first_frame`     | 首帧图（≤1 张）                         | i2v、r2v       |
| `reference_image` | 参考图（保持主体/场景）                      | r2v、videoedit |
| `reference_video` | 参考视频（主体/音色参考）                     | r2v           |
| `driving_audio`   | 驱动音频（对口型）                         | **仅 i2v**     |
| `video`           | 输入视频                              | videoedit     |
| `reference_voice` | 音色参考（附在 reference\_image/video 上） | r2v           |

每个媒体对象至少含 `type` + `url`，`url` 必须是公网可直接 GET 的 https 链接（本地文件先上传到 OSS / CDN）。

### `parameters` 字段

| 字段              | 类型     | 取值                                      | 说明                            |
| --------------- | ------ | --------------------------------------- | ----------------------------- |
| `resolution`    | string | `720P` / `1080P`                        | 大写，建议显式指定                     |
| `ratio`         | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` | 宽高比；传了首帧图时自动忽略                |
| `duration`      | int    | 2–15                                    | 秒数（整数），常用 5 / 10；含参考视频时上限为 10 |
| `prompt_extend` | bool   | `true` / `false`                        | 智能改写 prompt，**强烈推荐 `true`**   |
| `watermark`     | bool   | `true` / `false`                        | 右下角「AI 生成」水印                  |
| `seed`          | int    | 0–2147483647                            | 固定可提升可复现性                     |

<Tip>
  `duration` 必须是 **整数** `5` 而不是字符串 `"5"`，否则报 `cannot unmarshal string into Go struct field ... of type int`。`resolution` 写 **大写** `720P` 更稳。
</Tip>

## 如何选择 Wan 还是 HappyHorse

Wan 和 [HappyHorse](/api-capabilities/happyhorse/overview) 都是阿里系视频模型、共用同一端点和 schema（只改 `model` 名即可互换），但能力侧重不同：

| 维度           | Wan2.7                            | HappyHorse-1.1    |
| ------------ | --------------------------------- | ----------------- |
| 音频驱动对口型（i2v） | ✅ `wan2.7-i2v` 支持 `driving_audio` | ❌ 不支持，i2v 仅首帧     |
| 参考图生视频上限     | 参考图 + 参考视频合计 ≤5                   | 参考图最多 9 张         |
| 视频编辑参考图      | ≤5 张                              | ≤5 张              |
| 主体一致性风格      | 多主体互动、音色参考                        | 偏「高度还原动态画面」，主体保持稳 |

<Tip>
  **需要对口型 / rap / 数字人口播** → 选 `wan2.7-i2v`（唯一支持音频驱动）。
  **需要多张参考图保持主体一致** → 考虑 [HappyHorse r2v（≤9 张）](/api-capabilities/happyhorse/reference-to-video)。
</Tip>

## 最佳实践

<Steps>
  <Step title="先用 720P / 5 秒联调">
    开发期用低分辨率短视频快速验证 prompt 与镜头方向，定型后再放大到 720P / 1080P 与更长时长，降低单价与等待时间。
  </Step>

  <Step title="始终开 prompt_extend">
    `prompt_extend: true` 对短 prompt 的画质提升明显，代价只是多几秒生成时间。
  </Step>

  <Step title="轮询 5–10 秒一次">
    不要小于 3 秒（会被限流），也不要长任务死等。720P / 5 秒典型耗时 70–140 秒，1080P / 长视频可能超 5 分钟。
  </Step>

  <Step title="客户端超时设 20 分钟兜底">
    1080P 或 10 秒以上视频显著更慢，给轮询循环设置 20 分钟兜底超时。
  </Step>

  <Step title="拿到 result_url 立即下载落地">
    `result_url` 默认 **24 小时过期**，且是 OSS 签名直链，下载时**不要带 Authorization 头**。生产场景务必转存到自己的 OSS / CDN。
  </Step>

  <Step title="做好幂等">
    失败任务不扣费，但重复提交相同任务会重复计费。业务层维护「业务 ID → task\_id」映射避免误扣。
  </Step>
</Steps>

## 错误码与重试

错误来自两个阶段，处理方式不同：

| 来源               | 特征                                                                                         | 处理                              |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------- |
| **创建阶段（API易 拒）** | HTTP 4xx/5xx，`type` 为 `task_error` / `parse_request_failed` / `build_request_failed`       | 改 body 重试（多为字段类型错、缺 media、用错端点） |
| **执行阶段（上游阿里云拒）** | 任务最终 `status=failed`，`error.message` 以 `[InvalidParameter]` / `[InvalidImageUrl]` 等方括号前缀打头 | 看方括号提示，多为媒体 URL 不可达或 prompt 涉敏  |

<Info>
  **建议客户端**：HTTP 5xx / 网络错误做指数退避重试（1s / 4s / 16s）；HTTP 4xx 立刻 surface 不重试；任务 `failed` 含 `[InvalidImageUrl]` 可重试（可能临时网络），含 `[InvalidParameter]` / 敏感词不重试。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么不能用 /v1/videos 提交 Wan 任务？">
    `/v1/videos` 是 OpenAI 扁平风格端点，对 Wan 的 i2v / r2v 适配不完整：`media` 等媒体字段会被丢弃，上游阿里云会报 `[InvalidParameter] Field required: input.media`。**所有 Wan 视频创建请求都走 `/wan/api/v1/services/aigc/video-generation/video-synthesis`**，查询统一走 `/v1/tasks/{task_id}`。
  </Accordion>

  <Accordion title="X-DashScope-Async: enable 这个头是干啥的？必须带吗？">
    它告诉端点「这是异步任务，立刻返回 task\_id 不要堵塞」。**所有创建请求都必须带**，缺失会报 `current user api does not support synchronous calls`。查询任务（GET）不需要带这个头。
  </Accordion>

  <Accordion title="查任务为什么是 /v1/tasks/{id} 而不是 /wan/api/v1/tasks/{id}？">
    API易 把所有视频任务查询统一收口到了 `/v1/tasks/{task_id}`。不管你用哪个路径创建，查任务都走这一个端点，响应顶层的 `status` / `progress` / `result_url` / `error` 字段一致。
  </Accordion>

  <Accordion title="result_url 下载报 403 / SignatureDoesNotMatch 怎么办？">
    去掉 `Authorization` 头。`result_url` 已经是阿里云 OSS 签好名的直链，再带 API易 Key OSS 反而会拒：

    ```bash theme={null}
    curl -L -o out.mp4 "$RESULT_URL"          # ✅ 对
    curl -L -H "Authorization: Bearer $KEY" -o out.mp4 "$RESULT_URL"   # ❌ 错
    ```
  </Accordion>

  <Accordion title="result_url 过期了怎么办？">
    链接默认有效期 **24 小时**。过期后重新 GET `/v1/tasks/{task_id}` 通常会得到新的 `result_url`，但 task\_id 本身查询有效期也是 24 小时（超时返回 `UNKNOWN`）。需要长期保存请尽快下载到自己的存储。
  </Accordion>

  <Accordion title="progress 一直停在 30% 是卡住了吗？">
    不是。阿里云上游汇报的 progress 是粗粒度的（只有 0% / 10% / 30% / 100% 几档）。**只要 `status` 还是 `in_progress` 就继续等**，通常 30% 到 100% 之间直接跳过。
  </Accordion>

  <Accordion title="一个 Key 能并发跑几个任务？">
    实测可同时提交 4–8 个任务不报限流。生产建议同时活跃任务 ≤10 个，超出排队。查询接口默认 RPS 较高，但轮询间隔仍建议 5–10 秒。
  </Accordion>

  <Accordion title="失败任务扣费吗？">
    `status=failed` 不扣费。但需注意：重复提交相同任务会重复计费，做好幂等。测试期可关掉 `prompt_extend`、用 720P / 5 秒 / 短 prompt 降低单价。
  </Accordion>

  <Accordion title="wan2.6 还能用吗？">
    可以。Wan2.6 系列（含 `wan2.6-r2v-flash`）仍在可调用列表，协议与 Wan2.7 一致，只改 `model` 名即可。详见 [历史版本](/api-capabilities/wan/historical-versions)。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="文生视频 Playground" icon="wand-sparkles" href="/api-capabilities/wan/text-to-video">
    `wan2.7-t2v` 在线调试 + 代码示例
  </Card>

  <Card title="图生视频 Playground" icon="image" href="/api-capabilities/wan/image-to-video">
    `wan2.7-i2v` 首帧 + 驱动音频
  </Card>

  <Card title="参考图生视频 Playground" icon="users" href="/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 多主体参考 + 音色
  </Card>

  <Card title="视频编辑 Playground" icon="scissors" href="/api-capabilities/wan/video-edit">
    `wan2.7-videoedit` 换装 / 换背景
  </Card>

  <Card title="历史版本（Wan2.6）" icon="rotate-ccw-clock" href="/api-capabilities/wan/historical-versions">
    Wan2.6 系列与迁移说明
  </Card>

  <Card title="HappyHorse 系列" icon="monitor-play" href="/api-capabilities/happyhorse/overview">
    同为阿里系，选型对照
  </Card>
</CardGroup>

<Info>
  阿里云官方文档（参考）：`help.aliyun.com/zh/model-studio/text-to-video-api-reference`。如有问题或建议，欢迎在 [API易控制台](https://api.apiyi.com) 工单中反馈。
</Info>
