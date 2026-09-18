> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 视频生成（阿里云）

> 阿里云 HappyHorse-1.1 视频生成系列完整指南：文生视频 / 图生视频 / 参考图生视频（≤9 张参考图）/ 视频编辑，统一 DashScope 异步端点，主体高度还原。

## 概述

**HappyHorse（快马）** 是阿里系视频生成模型系列，主打**高度还原的动态画面生成**——精准理解文本语义，输出流畅自然、细节丰富、主体保持稳定的高质量视频。API易 通过 **DashScope 透传通道** 直连，让你用一个 API易 Key 即可调用全部 HappyHorse 能力。当前主力版本 **HappyHorse-1.1**（视频编辑为 1.0）覆盖四种核心玩法：

| 玩法         | 模型 ID                       | 你给的输入               | 产出                     |
| ---------- | --------------------------- | ------------------- | ---------------------- |
| **文生视频**   | `happyhorse-1.1-t2v`        | 一段文本 prompt         | 短视频                    |
| **图生视频**   | `happyhorse-1.1-i2v`        | 首帧图 + prompt        | 让静态图"动起来"（**不支持音频驱动**） |
| **参考图生视频** | `happyhorse-1.1-r2v`        | 最多 9 张参考图 + prompt  | 主体与场景高度还原的视频           |
| **视频编辑**   | `happyhorse-1.0-video-edit` | 视频 + 最多 5 张参考图 + 指令 | 局部/全局编辑后的视频            |

<Note>
  **🐎 核心亮点**：四种能力共用同一个异步端点和同一套请求结构，**切换玩法只改 `model` 字段**。HappyHorse 偏「高度还原动态画面」，参考图生视频支持 **最多 9 张参考图**、视频编辑支持 **最多 5 张参考图**，主体一致性强。与 [Wan 系列](/api-capabilities/wan/overview) 同端点、可直接互换。
</Note>

<CardGroup cols={2}>
  <Card title="文生视频 API" icon="wand-sparkles" href="/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v`，纯文本提示词生成视频。
  </Card>

  <Card title="图生视频 API" icon="image" href="/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v`，首帧图生成视频（无音频驱动）。
  </Card>

  <Card title="参考图生视频 API" icon="users" href="/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v`，最多 9 张参考图保持主体。
  </Card>

  <Card title="视频编辑 API" icon="scissors" href="/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit`，最多 5 张参考图编辑视频。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——异步轮询、**不能用 `/v1/videos`**、缺 `X-DashScope-Async` 头会报错、`duration` 必须是整数这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 HappyHorse 的文生视频、图生视频、参考生视频与视频编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 HappyHorse 的视频生成（文生视频 / 图生视频 / 参考生视频 / 视频编辑）。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/happyhorse/overview.md](https://docs.apiyi.com/api-capabilities/happyhorse/overview.md) 拿到本页纯文本版；四种能力各有一页（text-to-video、image-to-video、reference-to-video、video-edit），同样加 `.md` 后缀。

  接入要求：

  1. 端点和异步头（**最容易一上来就卡住的两条**）：提交必须打 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，而且**必须带请求头 `X-DashScope-Async: enable`**。**绝对不要用 `/v1/videos`**——那条路会把 `media` 字段丢掉，上游报 `[InvalidParameter] Field required: input.media`。轮询用的是**另一个前缀**：`GET /v1/tasks/{task_id}`，需要带 `Authorization`。

  2. 轮询与状态：任务 ID 在提交响应的 **`output.task_id`**。轮询每 5 到 10 秒一次，**不要小于 3 秒**（会被限流），客户端整体给 20 分钟兜底——720P 5 秒的典型耗时约 105 到 115 秒，1080P 或长视频会明显更久。轮询响应里的状态是 `submitted` / `in_progress` / `completed` / `failed`，**成功是 `completed`**。`progress` 长时间停在 30% 是正常的，上游汇报粒度粗，不是卡住了。任务 ID 有 **24 小时**有效期。

  3. 视频落地：地址在轮询响应的 **`result_url`**，是 OSS 签名直链、**24 小时过期**。拿到后**立即在服务端下载转存到自己的 OSS / CDN**，不要存进数据库当长期地址。下载这条直链时**不要带 `Authorization` 头**，带了反而会 403。

  4. 请求体结构与类型：body 是 DashScope 的嵌套结构 `{ model, input: { prompt, media[] }, parameters: { ... } }`，不是扁平的。两个类型坑：**`duration` 必须是整数 `5`，不能是字符串 `"5"`**；**`resolution` 要写大写 `720P` / `1080P`**，本模型**没有 480P**。

  5. 模型名与参数：四个模型是 `happyhorse-1.1-t2v` / `happyhorse-1.1-i2v` / `happyhorse-1.1-r2v` / `happyhorse-1.0-video-edit`——注意**视频编辑那个是 `video-edit`，带连字符**（跟 Wan 的 `videoedit` 写法相反，别混）。`duration` 是 2 到 15 的整数、默认 5；`resolution` 默认 `720P`；`prompt_extend` 默认 `true`，建议保持开启。两个要注意的点：**HappyHorse 的图生视频不支持 `driving_audio`**（那是 Wan 才有的），传了没用；**视频编辑的输出时长跟随输入视频，`duration` 不起作用**，通常不用传。

  6. 媒体输入：放在 `input.media[]`，每项形如 `{"type": ..., "url": ...}`，`url` 要是**公网可直接 GET 的 https 链接**（JPEG / PNG / WEBP），本地文件要先传到自己的 OSS。各能力的类型和张数：图生视频要正好 1 张 `first_frame`；参考生视频要 1 到 9 张 `reference_image`；视频编辑要 1 个 `video` 加 1 到 5 张 `reference_image`。缺 `media` 时上游会报「图生视频模型 ... 必须提供图片」。

  7. 计费与幂等：**按秒计费、按分辨率分档**，1080P 明显贵于 720P；视频编辑按实际输出秒数计费（跟随源视频，不看 `duration`）。任务进入 `failed` **不计费**，但**重复提交同一个任务会重复计费**——业务层要做幂等，不要写无脑自动重试。错误分两个阶段：提交阶段被网关拒（HTTP 4xx/5xx，`type` 为 `task_error` / `parse_request_failed` 等）说明请求体有问题，立刻改不要重试；执行阶段是任务 `failed` 且 `error.message` 带方括号前缀，其中 `[InvalidImageUrl]` 可能是媒体链接临时不可达、可以重试，`[InvalidParameter]` 或敏感词**不要重试**。5xx 和网络错误做指数退避。

  8. 令牌要求：本模型需要令牌带 `Wan&HappyHorse` 分组，且计费模式是**按量优先或按量计费**——**按次计费的令牌路由不过去**。

  9. Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码进代码、也不要提交进 git。

  10. 改完真跑一次文生视频 + 一次图生视频，把生成的视频和这两次调用的花费贴给我。注意整个流程要几分钟，如果你在受限的执行环境里跑，记得把命令超时放到 600 秒以上或者放后台。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                      | 挡掉的坑                                                    |
  | ----------------------- | ------------------------------------------------------- |
  | 不能用 `/v1/videos`        | 那条路会静默丢掉 `media` 字段，上游报缺少 `input.media`，看起来像参数写错其实是端点选错 |
  | 必须带 `X-DashScope-Async` | 缺这个头会被当成同步调用直接拒绝                                        |
  | 提交与轮询前缀不同               | 提交在 `/wan/api/v1/...`，轮询却在 `/v1/tasks/{task_id}`        |
  | 模型名是 `video-edit` 带连字符  | 与 Wan 的 `wan2.7-videoedit`（无连字符）相反，两个系列一起接时最容易写错        |
  | i2v 没有 `driving_audio`  | 那是 Wan 独有的能力，照搬 Wan 的代码会白传一个无效字段                        |
  | 重复提交会重复计费               | 失败不计费，但无脑重试等于多付钱，必须自己做幂等                                |
  | 下载不带 `Authorization`    | OSS 签名直链带 Auth 反而 403，且链接 24 小时过期                       |
</Accordion>

## 为什么选 API易 的 HappyHorse

<CardGroup cols={2}>
  <Card title="一个 Key 调全部能力" icon="key">
    无需注册阿里云、无需配置地域。一把 API易 Key 即可调用 HappyHorse 全部四种能力以及 [Wan 系列](/api-capabilities/wan/overview)。
  </Card>

  <Card title="国内直连 · 免出海" icon="globe">
    直连 `api.apiyi.com`，国内机房、家宽网络均可访问。
  </Card>

  <Card title="失败不计费" icon="circle-check">
    任务进入 `failed` 状态（媒体 URL 不可达、prompt 涉敏等）**不计费**，可放心重试。
  </Card>

  <Card title="DashScope 协议透传" icon="plug">
    与 Wan 系列共用同一端点和 schema，已有 Wan 代码切 `model` 名即可调用 HappyHorse。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="四合一异步端点" icon="list-check">
    t2v / i2v / r2v / video-edit 共用 `POST /wan/api/v1/...video-synthesis`，提交后返回 `task_id`，轮询 + 下载。
  </Card>

  <Card title="主体高度还原" icon="target">
    模型整体偏「高度还原动态画面」风格，人物/物体在动态过程中保持得更稳。
  </Card>

  <Card title="最多 9 张参考图" icon="images">
    `happyhorse-1.1-r2v` 官方支持最多 9 张 `reference_image`，多参考图场景的主体一致性更强。
  </Card>

  <Card title="多档分辨率与时长" icon="expand">
    720P / 1080P 分辨率，2–15 秒整数时长，`prompt_extend` 智能改写提升短 prompt 画质。
  </Card>
</CardGroup>

## 支持的模型

| 模型 ID                       | 能力     | 必需媒体输入                              | 说明                      |
| --------------------------- | ------ | ----------------------------------- | ----------------------- |
| `happyhorse-1.1-t2v`        | 文生视频   | 无                                   | 纯文本生成                   |
| `happyhorse-1.1-i2v`        | 图生视频   | `first_frame`                       | **不支持** `driving_audio` |
| `happyhorse-1.1-r2v`        | 参考图生视频 | `reference_image`（最多 9 张）           | 多参考图主体保持                |
| `happyhorse-1.0-video-edit` | 视频编辑   | `video` + `reference_image`（最多 5 张） | 模型名 **有连字符**            |

## 分组介绍

HappyHorse 与 [Wan](/api-capabilities/wan/overview) 两个系列**共用同一个 `Wan&HappyHorse` 分组**——一把令牌即可同时调用两个系列。视频模型按**秒**计费，令牌必须同时满足两个条件才能成功路由：

1. **计费模式**：选「按量优先」或「按量计费」—— 视频按秒计费，**按次计费的令牌无法路由**
2. **分组**：选择包含 `Wan&HappyHorse`

<Frame caption="创建令牌：计费模式选「按量优先」，分组选 Wan&HappyHorse（0.14x），即可调用 Wan2.7 与 HappyHorse 全部视频模型（截图中为分组旧名 Wan，现已更名 Wan&HappyHorse）">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="创建令牌界面：计费模式选「按量优先」，分组下拉中选择 Wan&HappyHorse（倍率 0.14x），令牌可同时用于 Wan2.7 与 HappyHorse" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 模型定价

### 默认价格 = 阿里云官方原价的 98％（理解简单）

**API易 系统已内置 HappyHorse 全部模型的价格**，无需任何手动配置，通过分组折扣自动生效。控制台里 `Wan&HappyHorse` 分组显示倍率 **0.14x**，这是按**人民币**计价单位计的。本站统一用**美元充值、固定汇率 1:7**，实际折算：

```
0.14（人民币计价单位） × 7（固定汇率） = 0.98
```

也就是说，**默认价格 = 阿里云官方原价的 98%（98 折）**——比官方直采更省，且无需自建出海链路。

> 换算公式：**本站每秒美元价 = 官方人民币原价 × 0.14**（即 `× 0.98 ÷ 7`）。

### 价格明细（默认价，按秒计费）

HappyHorse-1.1 文生 / 图生 / 参考生视频同价，仅 `720P` / `1080P` 两档（不支持 480P）：

| 分辨率     | 官方原价   | 本站默认价/秒   | 5 秒    | 10 秒   | 12 秒   |
| ------- | ------ | --------- | ------ | ------ | ------ |
| `720P`  | ¥0.9/秒 | \$0.126/秒 | \$0.63 | \$1.26 | \$1.51 |
| `1080P` | ¥1.6/秒 | \$0.224/秒 | \$1.12 | \$2.24 | \$2.69 |

<Info>
  * `happyhorse-1.0-video-edit`（视频编辑）输出时长跟随源视频，按实际输出秒数计费，不由 `duration` 决定。
  * 表中为 **默认价（官方 98%）**；叠加充值加赠最高档约为表中价 **÷ 1.2**（例：1080P 5 秒 \$1.12 → 约 \$0.93）。
</Info>

### 叠加充值加赠，折扣进一步走低

参与 [充值加赠活动](/faq/recharge-promotions) 后，到账额度最高可放大约 1.2 倍，等效价格进一步下探：

```
0.98 ÷ 1.2 ≈ 0.816
```

即大客户最低可做到 **官网约 81 折**（0.98 ÷ 1.2 ≈ 0.816）。

| 档位             | 等效价格（对比阿里云官方原价）     | 算法                |
| -------------- | ------------------- | ----------------- |
| 默认             | **98%**（98 折）       | 倍率 0.14x × 固定汇率 7 |
| 叠加充值加赠（大客户最高档） | **约 81.6%**（约 81 折） | 0.98 ÷ 1.2        |

<Info>
  * 计费维度 = **分辨率档位 × 时长（秒）**，失败任务不计费。
  * 1:7 为**固定结算汇率**（不是优惠汇率），所有美元充值统一适用。
  * 充值加赠的最高加赠档位与适用渠道见 [充值加赠活动](/faq/recharge-promotions)。最新倍率以 [控制台](https://api.apiyi.com/token) 为准。
</Info>

## ⚠️ 端点选择（最重要）

API易 同时挂载两条路径，**只有 DashScope 透传端点对 HappyHorse 全部能力完整可用**：

| 路径                                                           | 协议风格           | i2v / r2v 可用性 | 结论        |
| ------------------------------------------------------------ | -------------- | ------------- | --------- |
| `/v1/videos`                                                 | OpenAI 扁平风格    | ❌ 媒体字段会被丢弃    | **不要用**   |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 原生透传 | ✅ 完整可用        | **始终用这条** |

<Warning>
  HappyHorse 与 Wan 共用同一个透传端点。看到任何文档/示例里写 `/v1/videos` 提交视频任务，**直接忽略**。所有创建请求都走 `/wan/api/v1/...video-synthesis`，查询统一走 `/v1/tasks/{task_id}`。
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
    从响应的 `result_url` 直接 GET 下载 mp4，**不要带 `Authorization` 头**（OSS 签名直链，带 Auth 反而 403）。
  </Step>
</Steps>

### 任务状态说明

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
    "model": "happyhorse-1.1-t2v",
    "input": {"prompt": "一只猫在草地上奔跑，阳光明媚，镜头跟随"},
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

### `media[]` 类型

| `type`            | 用途                                | 适用模型           |
| ----------------- | --------------------------------- | -------------- |
| `first_frame`     | 首帧图（≤1 张）                         | i2v、r2v        |
| `reference_image` | 参考图（r2v 最多 9 张，video-edit 最多 5 张） | r2v、video-edit |
| `video`           | 输入视频                              | video-edit     |

<Warning>
  HappyHorse 的 i2v **不支持 `driving_audio`**（音频驱动是 [Wan2.7-i2v](/api-capabilities/wan/image-to-video) 的专属能力）。做对口型 / rap 请用 Wan2.7。
</Warning>

### `parameters` 字段

| 字段              | 类型     | 取值               | 说明                          |
| --------------- | ------ | ---------------- | --------------------------- |
| `resolution`    | string | `720P` / `1080P` | 大写，建议显式指定                   |
| `duration`      | int    | 2–15             | 秒数（整数），常用 5 / 10            |
| `prompt_extend` | bool   | `true` / `false` | 智能改写 prompt，**强烈推荐 `true`** |
| `watermark`     | bool   | `true` / `false` | 右下角「AI 生成」水印                |
| `seed`          | int    | 0–2147483647     | 固定可提升可复现性                   |

<Tip>
  `duration` 必须是 **整数** `5` 而不是字符串 `"5"`；`resolution` 写 **大写** `720P` 更稳。
</Tip>

## 如何选择 HappyHorse 还是 Wan

HappyHorse 和 [Wan](/api-capabilities/wan/overview) 都是阿里系视频模型、共用同一端点和 schema（只改 `model` 名即可互换），侧重不同：

| 维度           | HappyHorse-1.1 | Wan2.7                            |
| ------------ | -------------- | --------------------------------- |
| 音频驱动对口型（i2v） | ❌ 不支持，i2v 仅首帧  | ✅ `wan2.7-i2v` 支持 `driving_audio` |
| 参考图生视频上限     | 参考图最多 9 张      | 参考图 + 参考视频合计 ≤5                   |
| 视频编辑参考图      | ≤5 张           | ≤5 张                              |
| 风格侧重         | 高度还原动态画面，主体保持稳 | 多主体互动、音色参考                        |

<Tip>
  **需要多张参考图保持主体一致** → 选 `happyhorse-1.1-r2v`（最多 9 张）。
  **需要对口型 / rap / 数字人口播** → 选 [Wan2.7-i2v](/api-capabilities/wan/image-to-video)（唯一支持音频驱动）。
</Tip>

## 最佳实践

<Steps>
  <Step title="先用 720P / 5 秒联调">
    开发期用低分辨率短视频快速验证 prompt 与参考图效果，定型后再放大分辨率与时长。
  </Step>

  <Step title="始终开 prompt_extend">
    `prompt_extend: true` 对短 prompt 的画质提升明显。
  </Step>

  <Step title="轮询 5–10 秒一次">
    不要小于 3 秒（会被限流）。HappyHorse 各能力 720P / 5 秒典型耗时 105–115 秒。
  </Step>

  <Step title="客户端超时设 20 分钟兜底">
    1080P 或长视频显著更慢，给轮询循环设置 20 分钟兜底超时。
  </Step>

  <Step title="拿到 result_url 立即下载落地">
    `result_url` 默认 **24 小时过期**，且是 OSS 签名直链，下载时**不要带 Authorization 头**。
  </Step>
</Steps>

## 错误码与重试

| 来源               | 特征                                                                                       | 处理                             |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------------------ |
| **创建阶段（API易 拒）** | HTTP 4xx/5xx，`type` 为 `task_error` / `parse_request_failed` / `build_request_failed`     | 改 body 重试（字段类型错、缺 media、用错端点）  |
| **执行阶段（上游阿里云拒）** | 任务 `status=failed`，`error.message` 以 `[InvalidParameter]` / `[InvalidImageUrl]` 等方括号前缀打头 | 看方括号提示，多为媒体 URL 不可达或 prompt 涉敏 |

<Info>
  **建议客户端**：HTTP 5xx / 网络错误做指数退避重试；HTTP 4xx 立刻 surface 不重试；任务 `failed` 含 `[InvalidImageUrl]` 可重试，含 `[InvalidParameter]` / 敏感词不重试。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="HappyHorse 和 Wan 接入有差别吗？">
    **没有**。两者共用同一个 DashScope 透传端点、同一套请求结构、同一组 media type 名、同一个查询端点。**切换只改 `model` 字段**（如 `wan2.7-t2v` → `happyhorse-1.1-t2v`），body 其余部分一字不改。
  </Accordion>

  <Accordion title="HappyHorse 的 i2v 为什么不能做对口型？">
    `happyhorse-1.1-i2v` 不支持 `driving_audio`（音频驱动）字段，i2v 只接受 `first_frame`。做对口型 / rap / 数字人口播请用 [Wan2.7-i2v](/api-capabilities/wan/image-to-video)。
  </Accordion>

  <Accordion title="happyhorse-1.1-r2v 真的能塞 9 张参考图吗？">
    可以。官方说最多 9 张 `reference_image`，直接放在 `media` 数组里即可。多参考图能让主体/服装/场景一致性更强。
  </Accordion>

  <Accordion title="为什么不能用 /v1/videos 提交？">
    `/v1/videos` 对 i2v / r2v 的 `media` 字段适配不完整，会导致上游报 `[InvalidParameter] Field required: input.media`。**所有创建请求都走 `/wan/api/v1/services/aigc/video-generation/video-synthesis`**，查询走 `/v1/tasks/{task_id}`。
  </Accordion>

  <Accordion title="result_url 下载报 403 怎么办？">
    去掉 `Authorization` 头。`result_url` 已是 OSS 签好名的直链，再带 API易 Key 反而被 OSS 拒。`result_url` 默认 24 小时过期，请尽快下载落地。
  </Accordion>

  <Accordion title="失败任务扣费吗？">
    `status=failed` 不扣费。但重复提交相同任务会重复计费，做好幂等。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="文生视频 Playground" icon="wand-sparkles" href="/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v` 在线调试
  </Card>

  <Card title="图生视频 Playground" icon="image" href="/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v` 首帧生成
  </Card>

  <Card title="参考图生视频 Playground" icon="users" href="/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v` 最多 9 张参考图
  </Card>

  <Card title="视频编辑 Playground" icon="scissors" href="/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit` 换装 / 换背景
  </Card>

  <Card title="Wan 系列" icon="video" href="/api-capabilities/wan/overview">
    同为阿里系，选型对照
  </Card>
</CardGroup>

<Info>
  HappyHorse 系列通过 API易 DashScope 透传通道提供。如有问题或建议，欢迎在 [API易控制台](https://api.apiyi.com) 工单中反馈。
</Info>
