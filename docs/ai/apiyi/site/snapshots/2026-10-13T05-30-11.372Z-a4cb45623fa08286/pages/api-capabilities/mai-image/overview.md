> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MAI-Image 2.6 生图/编辑

> 微软 MAI-Image 2.6 图像模型（MAI-Image-2.6 / MAI-Image-2.6-Flash）完整指南：文生图 + 参考图编辑（1–5 张多图融合），width/height 自定义尺寸最高 1536×1536，中文文字渲染出色，按次计费 $0.12 / $0.06 一张、不区分尺寸。

## 概述

**MAI-Image 2.6** 是微软 AI（Microsoft AI）自研的图像生成模型，2026-09-04 发布、在 Microsoft Foundry 公开预览。发布时在 Arena 榜单上**文生图与图片编辑均排第 2**，在 Artificial Analysis 榜单上**图片编辑排第 1**（数据截至 2026-09-04，来源：微软官方公告）。

API易 通过微软官方渠道（官转）提供两个型号，共用同一套接口与参数：

* **`MAI-Image-2.6`**：旗舰版，追求画质与精度
* **`MAI-Image-2.6-Flash`**：快速版，官方称出图速度是 GPT-Image-2-Medium 的 2.8 倍，适合高吞吐的生产场景

<Note>
  **核心亮点**：**中文文字渲染出色**（招牌、对联、手写体都能逐字正确），**编辑保真度高**（只改指定部分、其余像素级保留），`width` + `height` 自定义任意画幅（最高 1536×1536 面积），**按次固定计费、不区分尺寸**。1024×1024 出图 Flash 约 17 秒、2.6 约 30 秒。
</Note>

<Warning>
  **📌 上手前必看的三条**

  1. **只支持两个端点**：`/v1/images/generations`（文生图，JSON）和 `/v1/images/edits`（编辑，`multipart/form-data`）。**不支持 `/v1/chat/completions` 和 `/v1/responses`**，发过去会返回 404。
  2. **不要传 `response_format`、`seed`、`negative_prompt`**——这三个参数会直接返回 400。返回值固定是 `data[0].b64_json`（PNG）。
  3. **尺寸用 `width` + `height`，不用 `size`**。文生图接口传 `size` 会被静默忽略，结果恒为 1024×1024。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/mai-image/text-to-image">
    输入文本提示词生成图片，带交互式 Playground 在线调试。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/mai-image/image-edit">
    上传 1–5 张参考图 + 编辑指令生成新图，支持多图融合，带 Playground。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、**三个会 400 的参数**、`width`/`height` 取代 `size`、编辑接口只认文件上传这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 MAI-Image 2.6 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查微软 MAI-Image 2.6 的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/mai-image/overview.md](https://docs.apiyi.com/api-capabilities/mai-image/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 模型名：旗舰版 `MAI-Image-2.6`，快速版 `MAI-Image-2.6-Flash`。**模型名大小写敏感**，写成全小写会返回 503（看起来像服务故障，其实是名字错了）。

  2. 端点：只能用 `/v1/images/generations`（JSON）和 `/v1/images/edits`（`multipart/form-data`）。**不要发 `/v1/chat/completions` 或 `/v1/responses`**，会返回 404。

  3. 超时：Flash 客户端 timeout 设 120 秒、2.6 设 180 秒。实测 1024×1024 约 17 秒 / 30 秒，但高峰和大尺寸会更久。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了而且照常计费。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽。

  4. 参数红线：**不要传 `response_format`、`seed`、`negative_prompt`**，三者都会返回 400 `Invalid parameters`。从 gpt-image / DALL·E 迁移过来的代码常常显式写了 `response_format="b64_json"`，必须删掉。`quality`、`output_format`、`background`、`style` 会被静默忽略，删掉即可。

  5. 返回处理：固定返回 `data[0].b64_json`，纯 base64、不带 `data:` 前缀，解码后是 PNG（1024×1024 约 1.5–1.7 MB）。没有 `url` 模式。`usage` 是占位值，不能拿来对账，费用以控制台账单为准。

  6. 尺寸：用 `width` + `height`（整数，必须成对传），每一维至少 768，宽×高不超过 2,359,296（即 1536×1536 的面积），不是 16 的倍数会向下取整到 16 的倍数。两个都不传默认 1024×1024。**文生图接口传 `size` 会被静默忽略**。

  7. 张数：文生图一次只出 1 张，`n` 无效；需要多张就并发多次请求。编辑接口的 `n` 有效，按张计费。

  8. 编辑：参考图必须用 multipart **文件上传**，字段名 `image`；**不支持 URL 或 base64 JSON 入参**（会返回 400）。**多图融合支持 1–5 张参考图**：多张时重复 `image[]` 字段（OpenAI SDK 直接传列表 `image=[f1, f2]`），按上传顺序为图1、图2……，提示词里用「图N」指代；超过 5 张返回 400。**不要用 `image` + `image2` 这类编号字段名**，第二张会被丢弃（返回 200 但只用第一张）。参考图张数不影响价格。只接受 JPEG / PNG / WebP。不支持 mask。上传前先压缩：超过 1.5MB 才处理，长边等比缩到 2048px 以内，质量 0.9 重编码，压缩失败就回退原图。

  9. 错误处理：内容审核拦截返回 400 `content_safety_violation`（真人名人、暴力血腥、知名 IP 角色、裸露都会被拦），改提示词，不要重试。尺寸越界返回 400 `unsupported_request_value`，错误信息里带具体约束。

  10. Key 从环境变量 `APIYI_API_KEY` 读，base\_url 用 [https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进](https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进) git。

  11. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求 | 挡掉的坑 |
  | - | - |
  | 删掉 `response_format` | 迁移代码里最常见的显式参数，传了就 400，整批失败 |
  | 用 `width` / `height` 不用 `size` | `size` 在文生图接口被静默忽略，你以为设了 1536×1024，拿到的却是 1024×1024 方图 |
  | 编辑只用文件上传 | 照 OpenAI 习惯传图片 URL 或 base64 JSON 会 400 |
  | 多图用重复的 `image[]`，不用 `image2` | `image` + `image2` 返回 200 但第二张被丢弃，结果里少了图2的内容却很难察觉 |
  | 不发 chat / responses | 对话类客户端会对所有模型名发 chat 请求，这里会 404 |
  | 超时按模型给足 | 断连的请求照常计费。详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) |
</Accordion>

## 为什么选 API易 的 MAI-Image 2.6

<CardGroup cols={2}>
  <Card title="微软官方渠道" icon="shield-check">
    官转接入，模型与微软 Foundry 上的同名模型一致。走标准 `/v1/images/generations` 与 `/v1/images/edits`，响应结构与 OpenAI Images API 一致。
  </Card>

  <Card title="按次计费 · 成本可预测" icon="receipt">
    原厂按 token 计费、图越大越贵；API易 **按张固定价、不区分尺寸**，从 768×768 到 1536×1536 同价；编辑时传 1 张还是 5 张参考图也同价，预算可精确到张。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需 Azure 账号与海外服务器**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，一个 Key 调所有模型。
  </Card>

  <Card title="模型生态齐全" icon="layers">
    图像侧还有 [GPT-Image-2](/api-capabilities/gpt-image-2/overview)、[Nano Banana 2](/api-capabilities/nano-banana-2-image/overview)、[Seedream](/api-capabilities/seedream-image/overview)、[FLUX](/api-capabilities/flux/overview) 可按场景组合。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="中文文字渲染" icon="languages">
    中文招牌、竖排对联、黑板手写都能逐字正确，适合海报、电商主图、文创物料
  </Card>

  <Card title="高保真编辑" icon="wand">
    「把茶壶改成钴蓝釉」只改茶壶，尺寸标注、其它物件像素级保留
  </Card>

  <Card title="自定义画幅" icon="maximize">
    `width` + `height` 任意组合，最长边可到 3072（如 3072×768 横幅），面积上限 1536×1536
  </Card>

  <Card title="双档速度" icon="zap">
    1024×1024 出图 Flash 约 17 秒、2.6 约 30 秒；10 并发下延迟稳定
  </Card>
</CardGroup>

### 实测效果

**中文文字渲染**（`MAI-Image-2.6-Flash`，提示词要求招牌写「API易 欢迎」）：招牌、灯笼、竖排对联、黑板手写全部是可读的中文。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-zh-text-render.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=7b83a1cb725f1391524c334b7399ea61" alt="MAI-Image-2.6-Flash 中文文字渲染示例：古风茶馆招牌写着 API易 欢迎" width="768" height="780" data-path="images/mai-image-zh-text-render.jpg" />
</Frame>

**参考图编辑**（`MAI-Image-2.6-Flash`，指令「把茶壶改成深钴蓝釉，其余完全不变」）：左为原图，右为结果。只有茶壶变色，尺寸标注与其它物件保持不变。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flash 编辑示例：茶壶从米白改为钴蓝，其余不变" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

## 模型定价

| 模型 | 定位 | API易定价 | 计费方式 |
| - | - | - | - |
| **`MAI-Image-2.6`** | 旗舰，画质优先 | **\$0.12 / 张** | 按次，不区分尺寸 |
| **`MAI-Image-2.6-Flash`** | 快速，吞吐优先 | **\$0.06 / 张** | 按次，不区分尺寸 |

<Note>模型价格可能调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

<Info>
  **计费说明**

  * **按张计费、不区分尺寸**：768×768 与 1536×1536 同价；提示词长短不影响价格。
  * **编辑与文生图同价**：按出图张数计费，**参考图传 1 张还是 5 张都同价**；编辑接口传 `n=2` 按 2 张计费。
  * **被拦截或参数错误的请求**（400）不出图。
  * **响应体里的 `usage` 不能用来核账**：`prompt_tokens` 恒为 `1000 × 张数`，是占位值，真实扣费以控制台账单为准。
  * 可叠加 [充值加赠活动](/faq/recharge-promotions)。
</Info>

## 分组与令牌

本系列在 **`Default` 默认分组**，新建令牌即可直接调用，无需申请。

<Info>
  **令牌「计费模式」**：选 `按量优先` 或 `按次计费` 都能正常调用本系列。推荐 `按量优先`，同一把令牌还能兼容站内其它按 token 计费的模型。

  **速率**：单个 Key 建议控制在 **50 RPM** 以内；有大批量出图需求请提前联系客服报备。
</Info>

## 技术规格

| 项目 | 规格 |
| - | - |
| 模型 ID | `MAI-Image-2.6`、`MAI-Image-2.6-Flash`（**大小写敏感**） |
| 端点 | `/v1/images/generations`（JSON）、`/v1/images/edits`（multipart） |
| 尺寸参数 | `width` + `height`，整数、必须成对 |
| 尺寸范围 | 每维 ≥ 768；宽×高 ≤ 2,359,296（= 1536×1536）；非 16 倍数向下取整 |
| 默认尺寸 | 1024×1024 |
| 输出格式 | PNG（RGB），仅 `b64_json`，1024×1024 约 1.5–1.7 MB |
| 单次张数 | 文生图固定 1 张；编辑接口 `n` 有效 |
| 参考图 | 编辑接口文件上传，**1–5 张**（多张时重复 `image[]`），JPEG / PNG / WebP，张数不影响价格 |
| mask 局部重绘 | ❌ 不支持 |
| `seed` / `negative_prompt` | ❌ 传入返回 400 |
| 流式输出 | ❌ 不支持 |
| 出图耗时（1024×1024） | Flash P50 约 17 秒、2.6 P50 约 30 秒 |
| 建议客户端超时 | Flash ≥ 120 秒、2.6 ≥ 180 秒 |

## 端点一览

| 功能 | 方法 | 路径 | Content-Type |
| - | - | - | - |
| 文生图 | `POST` | `/v1/images/generations` | `application/json` |
| 图片编辑 | `POST` | `/v1/images/edits` | **`multipart/form-data`** |

<Warning>
  **❌ 不支持对话端点**

  `/v1/chat/completions` 与 `/v1/responses` 对本系列返回 **404 `Requested path is not found`**。Cherry Studio、LobeChat 这类对话式客户端会对模型列表里的所有模型发 chat 请求，**请不要在这类客户端里选用 MAI-Image**，改用支持 Images API 的工具或自己写代码调用。
</Warning>

<Warning>
  **✅ 编辑接口只认 multipart 文件上传**

  发送 JSON（`image` 填 URL、data URI 或裸 base64）到 `/v1/images/edits` 会返回 400：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  请用 `-F "image=@photo.jpg"` 直接上传本地文件，**不需要图床**。完整示例见 [图片编辑 API](/api-capabilities/mai-image/image-edit)。
</Warning>

<Tip>
  主域名 `https://api.apiyi.com`，备用域名 `https://b.apiyi.com`。
</Tip>

## 关键参数详解

### `width` 与 `height`（输出尺寸）

| 规则 | 说明 |
| - | - |
| 必须成对 | 只传其中一个返回 400 |
| 下限 | 每维至少 768，传 767 返回 400 `'width' must be at least 768 pixels` |
| 面积上限 | 宽×高 ≤ 2,359,296，1600×1600 返回 400 `exceeds the maximum of 2359296` |
| 取整 | 非 16 倍数向下取整：1000×1000 → 992×992、1024×1023 → 1024×1008 |
| 纵横比 | 不限，3072×768（4:1 横幅）可出 |

**常用画幅参考**（都在面积上限内）：

| 用途 | `width` × `height` |
| - | - |
| 方图 | 1024×1024 / 1536×1536 |
| 横版 3:2 | 1536×1024 |
| 竖版 2:3 | 1024×1536 |
| 横版 16:9 | 1792×1008 |
| 竖版 9:16 | 1008×1792 |
| 横幅 4:1 | 3072×768 |

<Warning>
  **`size` 的行为在两个端点上不一样**：文生图接口传 `size` 会被**静默忽略**（恒出 1024×1024），编辑接口传 `size` 却会生效。为了避免混淆，**两个端点都统一用 `width` + `height`**。
</Warning>

### `n`（张数）

* **文生图**：`n` 无效，传 2、4、10 都只返回 1 张（也只收 1 张的钱）。需要多张请并发多次请求。
* **编辑**：`n` 有效，`n=2` 返回 2 张、按 2 张计费。

## 最佳实践

<Steps>
  <Step title="按场景选型号">
    批量出图、对延迟敏感 → `MAI-Image-2.6-Flash`；海报主视觉、复杂构图、对画质要求高 → `MAI-Image-2.6`。两者参数完全一致，切换只改模型名。
  </Step>

  <Step title="中文文字写进引号">
    要在图里出现的中文，用引号括起来并说明位置，例如：招牌上写「API易 欢迎」。模型对引号内文字的还原度很高。
  </Step>

  <Step title="编辑时明确写「其余保持不变」">
    编辑指令写成「把茶壶改成钴蓝釉，其余部分完全保持不变」，能最大限度保留原图。
  </Step>

  <Step title="改画幅会重新构图">
    编辑时传与原图不同比例的 `width` / `height`，模型会**重新排布画面**而不是裁切或留白。只想改局部时不要传尺寸，输出会按原图比例贴合到 16 的倍数（如 1344×756 输入 → 1360×768 输出）。
  </Step>

  <Step title="多张图就并发请求">
    文生图一次只出一张，要 4 张就并发 4 个请求。实测 10 并发延迟与单发基本一致。
  </Step>
</Steps>

## 错误码与重试

| HTTP | code / 信息 | 含义 | 处理建议 |
| - | - | - | - |
| `400` | `unsupported_request_value` | 尺寸越界、类型错误、`width`/`height` 不成对 | 按错误信息里的约束改参数，不要重试 |
| `400` | `invalid_request`：`Invalid parameters: xxx` | 传了 `response_format` / `seed` / `negative_prompt` | 删掉该字段 |
| `400` | `invalid_request`：`Prompt must be …` | `prompt` 为空或缺失 | 补上提示词 |
| `400` | `invalid_request_error`：`at most 5 reference images are accepted for <model>` | 编辑接口传了超过 5 张参考图 | 减到 5 张以内 |
| `400` | `invalid_request_error`：`reference image xxx is image/gif; only JPEG, PNG and WebP are accepted` | 参考图格式不支持 | 转成 JPEG / PNG / WebP 再上传 |
| `400` | `invalid_request_error`：`<model> does not support mask edits` | 编辑接口带了 `mask` | 去掉 mask，在提示词里描述修改范围 |
| `400` | `content_safety_violation` | 内容审核拦截 | 调整提示词，重试无效 |
| `400` | `request Content-Type isn't multipart/form-data` | 编辑接口发了 JSON | 改为 multipart 文件上传 |
| `404` | `Requested path is not found` | 发到了 chat / responses 端点 | 改用 Images API |
| `500` | `image is required` | 编辑请求里没有图片文件字段，或用了 `image1` + `image2` 这类编号字段名 | 单图用 `image`，多图重复 `image[]` |
| `503` | `no available channels` | 模型名大小写写错（如全小写） | 改为 `MAI-Image-2.6` / `MAI-Image-2.6-Flash` |

<Info>
  **客户端建议**：上表中的 4xx / 500 都是确定性错误，重试没有意义，应直接告警。只有网络层超时和 `429` 值得重试，建议指数退避、最多 3 次——但注意**超时断开的请求仍会计费**，先加大 timeout。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么传了 response_format 就报 400？">
    本系列只返回 `b64_json` 一种格式，**不接受 `response_format` 参数**，传 `"b64_json"` 也一样报 400 `Invalid parameters: response_format`。

    从 gpt-image / DALL·E 迁移过来的代码往往显式写了这个参数，删掉即可，返回值依然在 `data[0].b64_json`。`seed` 和 `negative_prompt` 同理。
  </Accordion>

  <Accordion title="传了 size: 1536x1024 为什么出来还是方图？">
    文生图接口**不认 `size`**，会静默忽略并按默认 1024×1024 出图。请改成 `"width": 1536, "height": 1024`。

    编辑接口的 `size` 反而能生效，但为了两边写法统一，建议都用 `width` + `height`。
  </Accordion>

  <Accordion title="能用图片 URL 做编辑吗？">
    **不能。** 编辑接口只接受 `multipart/form-data` 文件上传，`image` 填 URL、data URI 或 base64 字符串都会返回 400。

    如果你手上只有图片 URL，先在服务端下载成文件再上传：

    ```python theme={null}
    import requests
    img = requests.get("https://example.com/photo.jpg", timeout=30).content
    files = {"image": ("photo.jpg", img, "image/jpeg")}
    ```
  </Accordion>

  <Accordion title="能传多张参考图做融合吗？">
    **能，支持 1–5 张**（2026-10-07 起），价格与单图相同。

    * **写法**：重复 `image[]` 字段，`curl -F "image[]=@a.jpg" -F "image[]=@b.jpg"`；OpenAI SDK 直接传列表 `client.images.edit(image=[f1, f2])`
    * **指代**：按上传顺序为图1、图2……，提示词写「把图2里的狐狸放进图1的场景里，图1其余部分保持不变」
    * **不要用 `image` + `image2`**：返回 200，但第二张被丢弃，只用第一张
    * **超过 5 张**返回 400 `at most 5 reference images are accepted for <model>`

    完整示例见 [图片编辑 API](/api-capabilities/mai-image/image-edit)。
  </Accordion>

  <Accordion title="支持 mask 局部重绘吗？">
    **不支持**，带 `mask` 字段会返回 400 `<model> does not support mask edits`。局部修改请直接在提示词里描述修改范围，例如「只把茶壶改成蓝色，其余部分完全保持不变」——实测本模型对这类约束的遵循度很高。
  </Accordion>

  <Accordion title="能在 Cherry Studio / LobeChat 里用吗？">
    **不建议。** 这类对话客户端走的是 `/v1/chat/completions`，本系列在该端点返回 404。请使用支持 OpenAI Images API 的工具，或按本文档的代码示例直接调用。
  </Accordion>

  <Accordion title="一次能出几张？">
    文生图接口**固定 1 张**，`n` 传多少都只返回 1 张、只收 1 张的钱。需要多张请并发多次请求。

    编辑接口的 `n` 有效，`n=2` 返回 2 张、按 2 张计费。
  </Accordion>

  <Accordion title="usage 里的 token 数能用来核对账单吗？">
    **不能。** 响应体的 `usage.prompt_tokens` 恒为 `1000 × 张数`、`output_tokens` 恒为 0，是占位值。本系列按张固定计费，真实扣费请以 API易 控制台的账单记录为准。
  </Accordion>

  <Accordion title="内容审核严吗？被拦了是什么样？">
    本系列走微软官方的内容安全策略，**审核较严格**：真人名人、暴力血腥、知名 IP 角色（如迪士尼）、裸露内容都会被拦截。

    被拦时返回 `400 content_safety_violation`，错误信息里带具体原因。提示词类拦截通常 5–8 秒内返回；少数情况是出图后才拦截，耗时接近正常出图。重试同样的提示词无效，请调整表述。
  </Accordion>

  <Accordion title="支持流式输出吗？">
    **不支持。** 请按普通同步请求调用，等待完整响应返回。
  </Accordion>

  <Accordion title="调用返回 503 no available channels？">
    最常见的原因是**模型名大小写写错**。模型名必须严格写成 `MAI-Image-2.6` 或 `MAI-Image-2.6-Flash`，写成 `mai-image-2.6-flash` 会返回 503。
  </Accordion>
</AccordionGroup>

## 相关文档

* [MAI-Image 2.6 文生图 API](/api-capabilities/mai-image/text-to-image) - 带 Playground 的接口参考
* [MAI-Image 2.6 图片编辑 API](/api-capabilities/mai-image/image-edit) - 参考图编辑
* [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) - 超时、断连、压缩通用建议
* [充值加赠活动](/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.