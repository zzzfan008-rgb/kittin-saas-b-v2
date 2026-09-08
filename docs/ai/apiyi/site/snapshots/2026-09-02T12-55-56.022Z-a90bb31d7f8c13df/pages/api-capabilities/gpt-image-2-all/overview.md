> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-All 生图/编辑

> GPT 图像生成 ChatGPT 网页版官逆模型 gpt-image-2-all，$0.03/张按次计费，约 30–60 秒出图，支持文生图、多图融合编辑、自然语言改图，文字还原度高、中文提示词友好。

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

## 概述

**gpt-image-2-all** 是 API易 平台上线的一款 **GPT 图像生成官逆模型**（逆向 ChatGPT 网页版）。以 **\$0.03/张** 的极具竞争力的按次计费定价，**约 30–60 秒出图**，支持 **文生图 / 单图编辑 / 多图融合 / 自然语言改图**，文字还原度高、原生支持中文提示词。

<Note>
  **🎨 核心亮点**：官逆通道稳定、定价统一每张 \$0.03，无需关心 size/quality/n 等参数，尺寸与风格全部写进 prompt 即可——最适合"开箱即用"的图像生成场景。统一使用 OpenAI Images API 标准端点：`/v1/images/generations`（文生图）与 `/v1/images/edits`（图片编辑）。

  **需要锁定输出尺寸或 4K？** 请改用姐妹模型 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)——调用方式与本模型完全一致，仅多一个 `size` 字段。
</Note>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/gpt-image-2-all/text-to-image">
    `/v1/images/generations`，输入文本提示词生成图片。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/gpt-image-2-all/image-edit">
    `/v1/images/edits`，multipart 上传参考图 + 编辑/融合指令。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、base64 渲染、上传压缩、以及本模型「不接受哪些参数」这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 gpt-image-2-all 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 gpt-image-2-all 的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/gpt-image-2-all/overview.md](https://docs.apiyi.com/api-capabilities/gpt-image-2-all/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 超时：客户端 timeout 提到 360 秒兜底。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了、但这次请求照样计费，所以宁可多等也不要过早超时。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽，任何一层小于生成时间都会掐断请求。

  2. 返回渲染：默认返回 base64（`b64_json`，不带 `data:` 前缀），也可以显式传 `response_format: "url"` 拿 CDN 直链。**请显式传 `response_format`，不要依赖默认值**——历史上默认行为随分组和负载变化过。走 base64 就要能渲染展示并提供「保存到本地」；走 url 则要注意链接约 24 小时后失效，必须服务端立即下载转存。同一条 `data[]` 里只会有 `url` 和 `b64_json` 其中一个，解析时两种都要兜住。

  3. 上传压缩：调 `/v1/images/edits`（multipart）前先压缩参考图——超过 1.5MB 才处理，长边等比缩到 2048px 以内（不放大小图），以质量 0.9 重编码、保持原格式；多图时合计控制在 6MB 以内，单图不要超过 10MB。某张图压缩失败就回退用原图继续，不要因为压缩失败中断整个请求。

  4. 参数红线：本模型**不接受** `size` / `quality` / `n` / `aspect_ratio`，请求里一个都不要带。特别注意两点：传 `n=3` 会按 3 张扣费但仍然只返回 1 张图；OpenAI SDK 的 `client.images.generate()` 会默认带上 `size` 和 `n`，所以这里**直接发原始 HTTP 请求更稳妥**。输出尺寸靠提示词前缀控制（比如在提示词开头写「横版 16:9」），本页有验证过的「提示词到实际分辨率」对照表，照着用。

  5. Key 从环境变量 `APIYI_API_KEY` 读，base\_url 用 [https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进](https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进) git。

  6. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                    | 挡掉的坑                                                                                                                      |
  | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
  | timeout 提到 360 秒      | 主流 HTTP 客户端默认 30-60 秒超时，会在服务端还在正常出图时掐断请求，而**断连的请求照常计费**。详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) |
  | 显式传 `response_format` | 默认值历史上变过；不显式指定就得同时兜住 `url` 和 `b64_json` 两种形态                                                                              |
  | 不传 `n`                | 传 `n=3` 会按 3 张扣费，但仍然只返回 1 张图                                                                                              |
  | 不传 `size` / `quality` | 本模型不接受这两个参数，尺寸靠提示词前缀控制                                                                                                    |
  | 上传前压缩                 | 手机原图动辄 4-5MB，base64 编码后还会再膨胀约 33%。压缩标准见 [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution)                    |
</Accordion>

## 核心特性

<CardGroup cols={2}>
  <Card title="极具竞争力定价" icon="dollar-sign">
    统一按次计费 \$0.03/张，无分辨率阶梯，出图成本可预测
  </Card>

  <Card title="文字还原度高" icon="type">
    图内中英文、招牌、海报文字还原稳定，适合信息图与营销物料
  </Card>

  <Card title="中文提示词友好" icon="languages">
    原生理解中文描述，无需翻译即可获得高质量输出
  </Card>

  <Card title="多图融合编辑" icon="layers">
    支持多张参考图同时输入，prompt 中可用「图1/图2/图3」指代
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="出图速度较快" icon="bolt">
    约 30–60 秒出图，比 `gpt-image-2-vip` 和官转 `gpt-image-2` 都更快
  </Card>

  <Card title="R2 CDN 加速返回" icon="cloud">
    显式传 `response_format: "url"` 返回 R2 CDN 链接，全球低延迟下载
  </Card>

  <Card title="自然语言改图" icon="message-circle">
    支持通过对话描述直接改图，无需蒙版，可多轮迭代
  </Card>

  <Card title="标准端点兼容" icon="plug">
    兼容 OpenAI Images API 标准端点 `/images/generations`、`/images/edits`
  </Card>
</CardGroup>

## 模型定价

| 模型名               | 计费方式 | 价格             | 输出         |
| ----------------- | ---- | -------------- | ---------- |
| `gpt-image-2-all` | 按次计费 | **\$0.03 / 张** | 单次返回 1 张图片 |

<Info>
  **计费说明**：

  * 统一定价，不区分分辨率、质量或提示词长度
  * 失败请求不计费（如鉴权失败、参数校验失败）
  * 如需生成 N 张，客户端并行调用 N 次
</Info>

<Tip>
  **同价姐妹模型**：[`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)（逆向 Codex 线路）同样 \$0.03/张，支持 30 档常见 size（含 4K），调用方式与本模型完全一致——需要锁定输出尺寸时切过去即可。
</Tip>

## 分组介绍

`gpt-image-2-all` **放在 `Default` 默认分组**即可，不需要额外切分组。逆向通道目前供给稳定，不存在像官转那样需要"企业分组"过渡的场景。

| 模型                | 分组           | 备注                                               |
| ----------------- | ------------ | ------------------------------------------------ |
| `gpt-image-2-all` | `Default`    | 逆向 ChatGPT 官网线路，统一 \$0.03/张，约 30–60 秒出图          |
| `gpt-image-2-all` | `image2_OSS` | **1x 倍率（不加价）**，确定性 URL 输出——默认分组资源紧张时不会降级为 base64 |

### 需要确定性 URL 输出 → 切到 `image2_OSS` 分组

`gpt-image-2-all`（及 `gpt-image-2-vip`）在默认分组下**实测（2026-07）不传 `response_format` 时返回 `b64_json`**；显式传 `response_format: "url"` 可拿到图片 URL。但默认分组的输出格式**不做承诺**——历史上曾默认返回 `url`、资源紧张时降级为 `b64_json`，行为随负载与渠道版本变化过。

如果你的业务**强依赖 URL 输出**（直接把 URL 落库、前端按 URL 渲染、不接受 base64），请把令牌分组切到 **`image2_OSS`**——这是专为 **URL 输出确定性**设计的分组，**1x 倍率（不加价）**，对 `gpt-image-2-all` 和 `gpt-image-2-vip` 两个官逆模型都生效，保证响应稳定输出图片 URL，不会降级为 base64。

<Frame caption="令牌创建：计费模式选「按量优先」，分组选 image2_OSS（1x）——需要确定性 URL 输出时使用">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="令牌创建界面：计费模式「按量优先」，选择分组 image2_OSS（1x 倍率），支持输出为图片 URL 的分组，适合 gpt-image-2-all 与 gpt-image-2-vip" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

<Tip>
  **进阶玩法（同时使用 `gpt-image-2-vip` 与官转 `gpt-image-2`）**：如果你的令牌同时覆盖逆向两模与官转 `gpt-image-2`，可以在令牌的「分组优先级」里这样配——

  * **第一优先级**：`image2Enterprise`（1.2x 企业分组，官转专用稳定通道）
  * **默认（兜底）**：`Default`（逆向两模都在这里，按模型路由）

  这样官转 `gpt-image-2` 走企业分组保稳，逆向两模仍走默认分组——一把令牌覆盖三种模型，互不干扰。
</Tip>

📖 关于 `image2Enterprise` 企业分组：[/live/2026-04/image2-enterprise](/live/2026-04/image2-enterprise)

## 技术规格

| 维度         | 参数                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| **模型名**    | `gpt-image-2-all`                                                        |
| **渠道性质**   | 官方逆向（逆向 ChatGPT 官网）                                                      |
| **定价**     | \$0.03 / 张，按次计费                                                          |
| **出图速度**   | 约 30–60 秒                                                                |
| **输出分辨率**  | 无显式 size 参数，由模型自适应（建议在 prompt 中描述）                                       |
| **默认响应格式** | `b64_json`（纯 base64，**无 `data:` 前缀**，2026-07 实测；建议显式传 `response_format`） |
| **可选响应格式** | `url`（R2 CDN 加速链接，**默认 1 天有效期**，需显式传 `response_format: "url"`）           |
| **中文提示词**  | ✅ 原生支持                                                                   |
| **支持能力**   | 文生图、单图编辑、多图融合、自然语言改图                                                     |

<Warning>
  本模型为**自适应输出尺寸**，不等同于官转 `gpt-image-2` API。需要严格锁定输出尺寸或 4K 时，请改用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)（逆向 Codex 线路，30 档 size 含 4K）；需要官方完全一致字段时，请使用 [`gpt-image-2`](/api-capabilities/gpt-image-2/overview)（官转）。
</Warning>

<Warning>
  **⏰ 图片 URL 有效期：默认 1 天**

  `url` 模式响应的 `url` 字段是 R2 CDN 加速链接，**有效期约 24 小时**，过期后访问会 404。对于需要长期保存的图片（商品图、用户作品、历史记录等），请**在生成后尽快转存到自己的对象存储 / CDN / 数据库**。

  两种常见做法：

  * **服务端立即下载并入库**：收到响应后用 `requests` / `fetch` 把图片拉回来存到 S3 / OSS / R2 / 本地磁盘
  * **改用 `b64_json` 响应格式**：直接拿到 base64 图片数据，省一次跨域下载，适合前端直接渲染或写入文件
</Warning>

## 端点一览

| 端点                            | 用途            | Content-Type          | 适用场景                                    |
| ----------------------------- | ------------- | --------------------- | --------------------------------------- |
| `POST /v1/images/generations` | 文生图           | `application/json`    | OpenAI Images API 标准格式，方便同一套代码同时调用官转与官逆 |
| `POST /v1/images/edits`       | 图片编辑（单图 / 多图） | `multipart/form-data` | OpenAI Images API 标准格式，方便同一套代码同时调用官转与官逆 |

<Tip>
  **统一使用 OpenAI Images API**（`/v1/images/generations` + `/v1/images/edits`），理由有二：

  1. **更稳定**：上游对 Images API 通道的资源供给更充足，调用成功率更高
  2. **兼容官转，便于切换**：与官转 [`gpt-image-2`](/api-capabilities/gpt-image-2/overview) 调用方式、`size` 等参数完全兼容——遇到官逆通道风控异常时，**只需更换 `model` 名即可切换**，业务代码零改动

  另有对话式端点（`/v1/chat/completions`，不主推），见下方「常见问题」。
</Tip>

<Tip>
  **域名选择**：`api.apiyi.com` 为主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平台提供的其他网关域名，响应行为一致。
</Tip>

<Info>
  **想用 `size` 参数锁定输出尺寸？** 改用姐妹模型 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)——端点完全一致，仅多一个 `size` 字段（30 档常见 size，含 4K）。
</Info>

## 尺寸与比例控制（写进 prompt）

`gpt-image-2-all` 没有 `size` 参数，尺寸通过 prompt 描述。如果你需要严格锁定输出尺寸（电商主图、海报模板、4K 壁纸等），请改用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)。

### 经过验证的「提示词 → 实际分辨率」对照表

下表是实测复现稳定的 8 种写法。把第一列的描述放在 prompt **最前面**，就能拿到第二列的分辨率（输出全部在 1.5K 像素量级）：

| 提示词包含描述   | 实测分辨率       | 文件体积     | 实际比例 |
| --------- | ----------- | -------- | ---- |
| `横版 16:9` | 1672 × 941  | \~1.9 MB | 16:9 |
| `竖屏 9:16` | 941 × 1672  | \~2.1 MB | 9:16 |
| `4:3`     | 1448 × 1086 | \~2.3 MB | 4:3  |
| `3:4`     | 1086 × 1448 | \~2.5 MB | 3:4  |
| `3:2 尺寸`  | 1536 × 1024 | \~2.9 MB | 3:2  |
| `2:3 尺寸`  | 1024 × 1536 | \~3.0 MB | 2:3  |
| `2:5 竖屏`  | 793 × 1983  | \~1.9 MB | 2:5  |
| `5:2 横屏`  | 1983 × 793  | \~1.9 MB | 5:2  |

<Info>
  **使用须知**：

  * 输出统一在 \~1.5K 量级（最长边 1500–2000 px），**不是真正的"任意分辨率"**——所有 8 种写法都属于"约 1.5K"水平的模型上限
  * prompt 里**只**包含表中描述词时复现度最高；和其它构图词混写会发生偏离
</Info>

### 风格化补充写法（无固定分辨率）

下面这些写法没有稳定的实测分辨率，仅作风格修饰用，搭配上表使用：

| 需求   | 写法（仅风格参考，不保证分辨率）            |
| ---- | --------------------------- |
| 方形   | `1024×1024 方图` / `1:1 方形构图` |
| 超宽横幅 | `横幅 21:9 超宽银幕`              |
| 画幅风格 | `电影画幅` / `手机海报` / `方形构图`    |

<Tip>
  **技巧**：在 prompt **开头** 描述尺寸/构图，模型遵循度更高。
</Tip>

### 把这张表暴露给终端用户

虽然 `gpt-image-2-all` 没有 `size` 参数，但接入方完全可以在前端加一个「尺寸 / 比例」下拉框，给用户**和官方 size 一样的体验**：

* 每个选项的 value 直接用上表的 prompt 前缀（如 `横版 16:9`）
* label 同时展示**预期分辨率**（如 `横版 16:9 (1672×941)`），让用户对最终输出有数
* 后端把选中的 prefix 拼到用户原始 prompt 的最前面再发给 API

```js theme={null}
const SIZE_OPTIONS = [
  { label: "横版 16:9 (1672×941)", prefix: "横版 16:9" },
  { label: "竖屏 9:16 (941×1672)", prefix: "竖屏 9:16" },
  { label: "4:3 (1448×1086)",      prefix: "4:3" },
  { label: "3:4 (1086×1448)",      prefix: "3:4" },
  { label: "3:2 (1536×1024)",      prefix: "3:2 尺寸" },
  { label: "2:3 (1024×1536)",      prefix: "2:3 尺寸" },
  { label: "2:5 竖屏 (793×1983)",  prefix: "2:5 竖屏" },
  { label: "5:2 横屏 (1983×793)",  prefix: "5:2 横屏" },
];

const finalPrompt = `${selected.prefix}，${userPrompt}`;
```

<Warning>
  底层模型仍是**自适应**——返回分辨率允许 ±少量像素偏差，请不要在 UI 上向用户承诺"像素级精确"。**需要严格锁死输出尺寸**（电商主图、海报模板、4K 壁纸等），请改用姐妹模型 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)——同价、同套调用代码，仅多一个 `size` 字段。
</Warning>

## 最佳实践

<Steps>
  <Step title="输入图先压到 1.5MB 以内（图生图 / 多图融合）">
    上传给接口的每张图先压到 **1.5MB 以内**（JPEG 质量 80-90 / 分辨率适当下调），多图融合时也按这个标准逐张控制。偶发的服务端错误大多就是图片体积过大触发的，压一下请求成功率和出图速度都会明显改善。**输出分辨率由 prompt 的画幅描述决定，与输入图体积无关**——压小输入只会提速、不会损画质。提示词里光写 `4K` / `8K` 这类词也不会真给你高清；要稳定拿到大图请用上文「经过验证的『提示词 → 实际分辨率』对照表」里的写法。
  </Step>

  <Step title="尺寸写在 prompt 开头">
    把比例、分辨率、画幅描述放在提示词最前面，模型遵循度更高。
  </Step>

  <Step title="大胆使用文字元素">
    该模型文字还原度是主要卖点，招牌、海报、信息图都可直接写中英文文字。
  </Step>

  <Step title="多图融合标注顺序">
    重复传入的同名 `image` 字段顺序有意义，在 prompt 里可用「图1/图2/图3」明确指代。
  </Step>

  <Step title="响应格式按需选择">
    Web 应用直接渲染用 `b64_json`，服务端中转存储用 `url`。
  </Step>

  <Step title="超时设到 300 秒">
    典型 30–60s，但叠加图片上传 / 下载、官逆高峰长尾后实际耗时波动较大。**保守按 300 秒配**，避免大量误超时。
  </Step>

  <Step title="清理不接受的参数">
    `gpt-image-2-all` 不接受 `size`、`n`、`quality`、`aspect_ratio`，传入可能触发参数校验错误——请把它们从请求里去掉。需要传 `size` 时改用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)。
  </Step>
</Steps>

## 错误码与重试

| 状态码   | 含义                 | 建议                       |
| ----- | ------------------ | ------------------------ |
| `401` | 令牌无效               | 检查 Bearer Token          |
| `429` | 限流/额度不足            | 指数退避重试                   |
| `5xx` | 网关/后端临时错误          | 重试 1–2 次                 |
| 超时    | 官逆高峰偶发 + 图片上传/下载长尾 | 客户端设置 **≥ 300s 超时**（保守值） |

<Info>
  **建议客户端**：

  * 请求超时 **300 秒** 起步（保守值；典型 30–60s，但叠加图片上传 / 下载、官逆高峰长尾后波动大，按 120s 配置容易误超时）
  * 对 5xx 与超时做 **指数退避重试**（建议 2–3 次）
  * 记录响应头 `request-id` 方便排查
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="我同时看到 gpt-image-2-all 和 gpt-image-2-vip，该选哪个？">
    两者价格一样（\$0.03/次），都是逆向通道，**调用方式完全一致**，差异主要在 `size` 和出图速度：

    * **不需要严格控尺寸、追求出图速度** → `gpt-image-2-all`（约 30–60s 出图，尺寸写进 prompt）。
    * **要锁死输出尺寸或要 4K** → [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)（约 90–150s 出图，30 档常见 size 含 4K）。
    * **需要画质参数 `quality` 或 OpenAI 官方完全对齐字段** → 改用官方版 [`gpt-image-2`](/api-capabilities/gpt-image-2/overview)。
  </Accordion>

  <Accordion title="能同时生成多张图吗？">
    本模型单次返回 1 张。如需 N 张，请客户端并行调用 N 次。每张独立按 \$0.03 计费。
  </Accordion>

  <Accordion title="支持 n 参数吗？传 n=3 会怎样？">
    **不支持。** 本模型单次只返回 1 张图，请通过**重复调用 / 并发调用**的方式生成多张。

    ⚠️ **重要**：如果在请求里传入 `n=3`，**计费会按 0.03 × 3 = \$0.09 扣费**，但**实际上仍然只返回 1 张图**。请务必把 `n` 字段从请求里去掉，避免被多扣费。
  </Accordion>

  <Accordion title="内容被拒/模型回复「我不能做到这个需求」，会计费吗？">
    官逆是**同步对话式返回**，结果分两种情况，**计费规则不同**：

    **1) 返回 5xx 状态码 → 不计费**

    上游内容策略明确拦截时会返回类似：

    ```json theme={null}
    {
      "error": {
        "message": "没有按照预期生成图片，请重新调整提示词后重试（traceid: 0672821c6951af183dbf847130caaf16）",
        "localized_message": "Unknown error",
        "type": "invalid_request_error",
        "param": "",
        "code": null
      }
    }
    ```

    这种"明确报错"调用**不计费**，引导用户调整提示词重试即可。

    **2) 返回 200 状态码（模型用文字软拒绝）→ 计费**

    模型在对话里软拒绝、用文字回复（例如「我不能做到这个需求」「抱歉，这个请求涉及……」），从协议层看就是一次正常的对话返回，**这种情况会被计费**。官逆目前没有办法在协议层提前识别"这一段是拒绝文字而不是图片"。

    **为什么不能直接对软拒绝免单？**

    强行对所有"软拒绝"都不计费意味着平台要为每次失败承担上游成本；更关键的是，**频繁触发上游内容安全会让供应方账号更容易被封号**——这部分供给侧的硬成本也无法完全规避。

    **给接入方的建议**

    * ✅ **前置内容过滤 / 风险提示**：在前端或接入层先做一道关键词与场景过滤（如真实姓名、版权角色、敏感题材），并在 UI 上提示"涉及名人/版权题材时上游限制较严，可能失败也会计费"，能显著降低误扣率。
    * ✅ **C 端产品月度补发**：理解 C 端产品无法完全控制用户输入。如果你的月用量较大（**月消费 \$1000+ 起**），可以**按月汇总日志**（短耗时调用通常对应软拒绝）联系客服一次性人工补发，无须逐条申诉。

    📖 相关：[官逆 500 多为内容违规](/live/2026-04/gpt-image-2-all-500-content-policy)
  </Accordion>

  <Accordion title="b64_json 前缀要不要自己加 data:image/png;base64,？">
    **先检测再处理**。2026-07 实测返回的 `b64_json` 为纯 base64（不带前缀），需要解码写文件或自行拼接前缀后再渲染；但**历史版本曾直接带前缀**。请在代码里做 `startsWith('data:')` 检测：有前缀直接用作 `img src`，无前缀先解码，避免双重拼接或带前缀解码产出损坏的图片。
  </Accordion>

  <Accordion title="为什么提示词里写了 1024x1024 还是拿到别的尺寸？">
    自适应模型对尺寸描述是"参考"不是"强制"。提升遵循度的写法：把尺寸/画幅词放在 prompt 最前面，并配合画幅风格词（如 `电影画幅`、`手机海报`、`方形构图`）。

    具体能稳定复现的写法和对应分辨率，参见上文「尺寸与比例控制 → 经过验证的『提示词 → 实际分辨率』对照表」。
  </Accordion>

  <Accordion title="输入图要压缩吗？提示词里写 4K / 8K 有用吗？">
    **强烈建议压**。单张输入图压到 **1.5MB 以内**（JPEG 质量 80-90 / 分辨率适当下调）：偶发的服务端错误大多就是图片体积过大触发的，压一下请求成功率和出图速度都会明显改善。注意 1.5MB 是**推荐上限**（追求稳定性与速度），上面 FAQ 写的 10MB 是网关硬上限。

    **别担心压输入会损画质**——本模型输出分辨率由 prompt 的画幅描述决定，跟你上传图的体积没关系。压小输入只会提速、不会损画质。

    **提示词光写 `4K` / `8K` 这类词也不会真给你高清**——这些只是修饰词，模型不会因此提分辨率。要稳定拿到大图，请用上文「经过验证的『提示词 → 实际分辨率』对照表」里验证过的写法（如 `电影画幅`、`手机海报`、`方形构图`）；需要严格锁尺寸或 4K 请改用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/overview)（30 档 size，含 4K，同价 \$0.03/张）。
  </Accordion>

  <Accordion title="参考图最大多大？格式要求？">
    推荐 **单张 ≤ 10MB**，格式 `png` / `jpg` / `webp`。过大的图可能触发网关限制。多图融合时每张都需满足此限制。
  </Accordion>

  <Accordion title="生成的图片 URL 有效期是多久？需要自己转存吗？">
    `url` 模式响应的 `url` 字段是 **R2 CDN 加速链接，有效期约 1 天（24 小时）**，过期后会 404。

    **强烈建议**：生成后尽快把图片 **转存到自己的对象存储（S3 / OSS / R2）、CDN 或数据库**，不要长期直接引用本服务返回的 URL。

    **两种推荐做法**：

    * **服务端中转**：收到响应后立即 `requests.get(url)` 把图片拉回来存到你自己的存储，把你自己的 URL 返回给前端；
    * **改用 b64\_json**：请求时加 `"response_format": "b64_json"`，直接拿到 base64 图片数据，少一次跨域下载，适合前端直接渲染或写入文件。

    如果只是短期展示（如单次会话预览），可以直接用 R2 URL 无需转存。
  </Accordion>

  <Accordion title="能流式返回吗？">
    本模型为一次性出图，不支持 stream 输出。如果对响应延迟敏感，建议客户端显示"生成中"进度提示，并合理配置 **300s 超时**（保守值）。
  </Accordion>

  <Accordion title="能用 OpenAI 的官方 SDK 直连吗？">
    可以。把 `base_url` 指向 `https://api.apiyi.com/v1`，`api_key` 设为 API易 令牌即可。但 `client.images.generate()` 方法默认带 `size`/`n` 参数——本模型不接受这两个参数，建议直接用 `requests` / `fetch` 发原生 HTTP 请求调用 `/v1/images/generations` 与 `/v1/images/edits`。
  </Accordion>

  <Accordion title="中文提示词和英文提示词效果差异大吗？">
    本模型原生支持中文，两者效果接近。对中文特有的场景（如中式书法、传统节日元素）中文表达更自然。
  </Accordion>

  <Accordion title="还能用 /v1/chat/completions 对话方式出图吗？">
    可以，端点仍然可用，但**不再主推**——推荐统一使用 `/v1/images/generations` 与 `/v1/images/edits`（更稳定、与官转 `gpt-image-2` 同套代码）。

    对话方式仅适合两类场景：多轮迭代改图、需要直接传在线图片 URL。注意出图意图不够明确时可能返回纯文字而不是图片（可在提示词开头加「生成图片：」前缀强化）。

    详细参数见 [对话式调用说明](/api-capabilities/gpt-image-2-all/chat-completions)。
  </Accordion>
</AccordionGroup>

## 相关文档

* [⚖️ 官转 vs 官逆 对比](/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - 与官方版 `gpt-image-2` 选型对照表
* [文生图 Playground](/api-capabilities/gpt-image-2-all/text-to-image) - `/v1/images/generations` 兼容端点
* [图片编辑 Playground](/api-capabilities/gpt-image-2-all/image-edit) - `/v1/images/edits` 多图融合与改图
* [GPT-Image-2-VIP（同价、支持 size 和 4K）](/api-capabilities/gpt-image-2-vip/overview) - 同价位姐妹模型，30 档常见 size（含 4K），调用方式与本模型完全一致
* [GPT-Image-2 官方版（按 token 计费）](/api-capabilities/gpt-image-2/overview) - 需要 `quality` 参数 / mask 局部重绘 / OpenAI 官方对齐字段时的选择
* [GPT-Image 系列总览](/api-capabilities/gpt-image-series) - 官方 GPT-Image 系列对比
* [社区贡献：Luck GPT-Image 2 ComfyUI 节点](/scenarios/ecosystem/luckgpt2-comfyui) - 在 ComfyUI 中一键调用 `gpt-image-2-all`（支持 chat\_completions / images\_api 双端点）
* [社区贡献：APIYI GPT-Image 2 Skills](/scenarios/ecosystem/apiyi-gpt-image-skills) - 在 Codex CLI / Cursor / Gemini CLI 等 AI 编程工具中一句话调用
* [API 使用手册](/api-manual) - 通用调用规范

<Info>
  gpt-image-2-all 属于官逆通道，行为对齐但定价/能力与官方版本不完全一致。如需官方直连版本，请参考 [GPT-Image-1.5](/api-capabilities/gpt-image-1-5)。
</Info>
