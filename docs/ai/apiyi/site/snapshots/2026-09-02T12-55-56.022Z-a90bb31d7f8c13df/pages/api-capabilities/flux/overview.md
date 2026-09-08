> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX 生图/编辑

> Black Forest Labs 的 FLUX 模型族 — 从 sub-second 的 FLUX.2 [klein] 到 4MP 旗舰 [max]，覆盖文生图、参考图编辑、多图融合、文字渲染、hex 精确色控。OpenAI 兼容直连。

## 概述

**FLUX** 是德国 Black Forest Labs（BFL）推出的旗舰图像生成模型族。最新一代 **FLUX.2** 横跨 sub-second 到 4MP 旗舰画质共 5 档，叠加上一代图像编辑专用的 **FLUX.1 Kontext** 共 7 个模型在售；老版本 FLUX.1 \[pro] 系列也保留可调用。API易 网关把 BFL 的异步 API 封装成标准 OpenAI Images API（`/v1/images/generations` 与 `/v1/images/edits`），OpenAI 官方 SDK 把 `base_url` 指过来即可零代码改动直连。

<Note>
  **🎨 核心亮点**：FLUX.2 \[max] 独家支持 **grounding search 联网搜索**，原生 4MP 输出（2048×2048）+ 多参考图最多 8 张 + 32K tokens 长 prompt + hex 色精确控制 + 文字渲染领先。**适合需要旗舰画质、多图一致性、品牌色精确还原、专业排版** 的生产场景。
</Note>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/flux/text-to-image">
    `/v1/images/generations`，输入文本提示词生成图片，覆盖 FLUX.2 全部 5 个模型。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/flux/image-edit">
    JSON `input_image` 传参考图（最多 8 张多图融合，走 `/generations`），另有 OpenAI 兼容 multipart `/edits` 单图编辑，FLUX.2 + FLUX.1 Kontext 通用。
  </Card>

  <Card title="历史版本" icon="rotate-ccw-clock" href="/api-capabilities/flux/historical-versions">
    FLUX.1 \[pro] / \[pro] 1.1 / \[pro] 1.1 Ultra / \[dev] 老版本规格、迁移建议、计费差异。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、**10 分钟就失效的 URL 必须立即转存**、上传压缩、尺寸必须是 16 的倍数这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 FLUX 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 FLUX 的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/flux/overview.md](https://docs.apiyi.com/api-capabilities/flux/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 超时：客户端 timeout 设到 120 秒；如果用的是 `flux-2-flex`，放宽到 180 秒。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了、但这次请求照样计费。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽，任何一层小于生成时间都会掐断请求。

  2. 返回处理（**本模型最关键的一条**）：FLUX **只返回 URL、不返回 base64**——结果在 `data[0].url`，不要去找 `b64_json`，也不要传 `response_format`。这个签名链接**只有约 10 分钟有效期**，而且**没有开 CORS**：浏览器里用 `fetch` 直接抓会被跨域挡掉（把链接塞进图片标签的 `src` 显示是可以的）。所以正确做法是：**拿到 URL 后立刻在服务端下载，转存到你自己的对象存储**，再把你自己的永久链接返回给前端。千万不要把上游链接直接存进数据库当长期地址用。另外本模型的响应里**没有 `usage` 字段**，别指望从响应里读 token 数。

  3. 上传参考图：多图融合走 `/v1/images/generations`，用 JSON 字段 `input_image`、`input_image_2` 一直到 `input_image_8`，值可以是图片 URL 或者 `data:image/...;base64,...` 形式的 data URL。`/v1/images/edits`（multipart）**只收单张图，且文件字段名必须叫 `image`**，写错会返回 `image is required`。参考图张数上限按型号不同：FLUX.2 pro / max / flex 最多 8 张，klein 最多 4 张，FLUX.1 Kontext 只有 1 张。上传前先压缩——超过 1.5MB 才处理，长边等比缩到 2048px 以内（不放大小图），以质量 0.9 重编码、保持原格式；单图不要超过 20MB 或 2000 万像素。某张图压缩失败就回退用原图继续。

  4. 尺寸参数：用 `size`（比如 `1024x1024`）或者 `width` / `height` 两个整数，二选一即可，两种写法等价。**宽高必须都是 16 的倍数**，最小 64×64，最大约 400 万像素（建议控制在 200 万像素以内）。注意 `1000x1000` 不合法（不是 16 的倍数）、`3840x2160` 也不合法（超过 400 万像素），前台如果让用户填尺寸，务必先做这两条校验。编辑场景用 `aspect_ratio` 控制比例，不传时输出会自动跟随第一张输入图。本模型**没有 `quality` 参数**，`flux-2-flex` 独有 `steps`（默认 50）和 `guidance`（默认 4.5）两个质量旋钮。成本靠选型控制：klein 最便宜、max 最贵，编辑与生成同价、多图不额外加钱。

  5. 其它注意：用 OpenAI SDK 调用时，FLUX 特有的参数要放进 `extra_body` 才能传下去。`prompt_upsampling` 默认关闭，它会改写你的提示词，做品牌相关内容时保持关闭。`webhook_url` 不会透传，别依赖它。

  6. Key 从环境变量 `APIYI_API_KEY` 读，base\_url 用 [https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进](https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进) git。

  7. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求               | 挡掉的坑                                                                                      |
  | ---------------- | ----------------------------------------------------------------------------------------- |
  | 立即服务端转存          | 上游链接约 10 分钟就失效，存进数据库当长期地址用必然大面积 404                                                       |
  | 不要在浏览器里 `fetch`  | 上游没开 CORS，前端直接抓会被跨域挡掉；只有图片标签的 `src` 能正常显示                                                 |
  | 不要找 `b64_json`   | 本模型只返回 URL，按 base64 解析只会拿到空值                                                              |
  | 宽高必须是 16 的倍数     | `1000x1000` 这种看起来很正常的尺寸直接非法，`3840x2160` 则超了像素上限                                           |
  | 上传前压缩            | 单图上限 20MB / 2000 万像素。压缩标准见 [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution) |
  | 编辑接口字段名叫 `image` | 写成别的名字会返回 `image is required`；多图融合根本不该走这个端点                                               |
</Accordion>

## 为什么选 API易 的 FLUX？

对标 BFL 官方通道，针对企业生产场景在 **稳定性**、**成本**、**接入体验** 三方面做了深度优化：

<CardGroup cols={2}>
  <Card title="OpenAI 兼容封装 · 零代码迁移" icon="shield-check">
    BFL 官方走异步 polling，APIYI 把它封装成同步的 **OpenAI Images API**。OpenAI 官方 SDK 把 `base_url` 指过来直接用，不用自己写 `polling_url` 轮询循环。
  </Card>

  <Card title="不限并发 · 突破 24 active 限制" icon="infinity">
    BFL 官方对单账号限 **24 个 active tasks**（kontext-max 仅 6），APIYI 在网关层做了池化，企业用户线性放量不受单账号限制。
  </Card>

  <Card title="同价或最高节省 17%" icon="percent">
    FLUX.2 \[pro/max/flex] 与官方 1MP 同价，klein 4B/9B 比官方更便宜（节省约 28%），FLUX.1 \[pro] 1.1 Ultra 节省 17%，叠加 [充值加赠活动](/faq/recharge-promotions) **最低可享 85 折**。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需海外服务器或代理**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，延迟稳定、免去出海改造。
  </Card>

  <Card title="模型生态齐全" icon="layers">
    搭配 [gpt-image-2](/api-capabilities/gpt-image-2/overview)、[Seedream](/api-capabilities/seedream-image/overview)、[Nano Banana](/api-capabilities/nano-banana-image/overview) 等同站系列，可按场景自由组合。
  </Card>

  <Card title="专业服务 · 企业陪跑" icon="handshake">
    团队深耕图像生成场景，具备丰富的选型、调优与集成经验，可为企业客户提供从 PoC 到生产上线的完整技术支持。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="速度全档位覆盖" icon="bolt">
    klein 4B/9B **sub-second** 出图（消费级 GPU 即可）、pro **\< 10 秒**、max **\< 15 秒**、flex 较慢但精度更高。一个系列横跨实时到旗舰。
  </Card>

  <Card title="原生 4MP 输出" icon="expand">
    最大 2048×2048（约 4MP），是 FLUX.1 时代 1.6MP 的 2.5 倍。任意宽高（边长须 16 倍数），最小 64×64。
  </Card>

  <Card title="多参考图融合" icon="layers">
    JSON 字段 `input_image` \~ `input_image_8` 传多张参考图（URL 或 base64 data URL）：FLUX.2 \[pro/max/flex] 最多 **8 张**，\[klein] 最多 4 张，prompt 中可用「图1/图2」精确指代。
  </Card>

  <Card title="联网搜索（grounding search）" icon="globe">
    FLUX.2 \[max] 独家：prompt 触发实时网络检索，可生成"昨日比赛比分"、"实时天气"、"历史事件复刻"等需要外部知识的画面。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="精确 hex 色控制" icon="palette">
    在 prompt 里直接写 `#02eb3c` / `#ff0088` 等 hex 码，模型按精确色值出图，专业品牌设计无需后期调色。
  </Card>

  <Card title="32K tokens 长 prompt" icon="type">
    支持最长 **32K tokens** 的 prompt，可用结构化 JSON 描述（subject / background / lighting / style 等），适合产线自动化。
  </Card>

  <Card title="文字渲染特化" icon="type">
    FLUX.2 \[flex] 专为文字场景调优，海报标题、UI 截图、信息图等小字保留度业内领先；max / pro 同样可用。
  </Card>

  <Card title="OpenAI SDK 直连" icon="plug">
    把 `base_url` 指向 `https://api.apiyi.com/v1` 即可用 OpenAI 官方 SDK 直接调 `client.images.generate(model="flux-2-pro", ...)`，零代码改动。
  </Card>
</CardGroup>

## 模型定价

按次计费，单价见下表（**APIYI 单价**列）。BFL 官方按 **MP（megapixel）** 计费，1MP 内同价、超过逐 MP 加成；APIYI 按张定价更可预测。

### FLUX.2 系列（最新一代）

| 模型 ID             | APIYI 单价   | 官方价            | 速度         | 适用场景                     |
| ----------------- | ---------- | -------------- | ---------- | ------------------------ |
| `flux-2-max`      | \$0.0700/次 | from \$0.07/MP | \< 15 秒    | 旗舰画质 + 联网搜索（grounding）   |
| `flux-2-pro`      | \$0.0300/次 | from \$0.03/MP | \< 10 秒    | 生产规模、最佳性价比               |
| `flux-2-flex`     | \$0.0600/次 | \$0.06/MP      | 较慢         | 文字渲染特化，可调 steps/guidance |
| `flux-2-klein-9b` | \$0.0100/次 | from \$0.015   | sub-second | 平衡画质和速度                  |
| `flux-2-klein-4b` | \$0.0100/次 | from \$0.014   | sub-second | 最快、消费级 GPU 友好            |

### FLUX.1 Kontext 系列（图像编辑专用）

| 模型 ID              | APIYI 单价   | 官方价    | 节省    | 适用场景            |
| ------------------ | ---------- | ------ | ----- | --------------- |
| `flux-kontext-max` | \$0.0700/次 | \$0.08 | 12.5% | 编辑最高质量、文字精修     |
| `flux-kontext-pro` | \$0.0350/次 | \$0.04 | 12.5% | 编辑性价比首选、5-6 秒生成 |

### FLUX.1 \[pro] 经典版本（历史版本，仍可调用）

| 模型 ID                | APIYI 单价   | 官方价    | 节省    |
| -------------------- | ---------- | ------ | ----- |
| `flux-pro-1.1-ultra` | \$0.0500/次 | \$0.06 | 17%   |
| `flux-pro-1.1`       | \$0.0350/次 | \$0.04 | 12.5% |
| `flux-pro`           | \$0.0400/次 | \$0.04 | 同价    |
| `flux-dev`           | \$0.0200/次 | —      | —     |

详细规格与迁移建议见 [历史版本页](/api-capabilities/flux/historical-versions)。

<Info>
  **计费说明**：

  * APIYI 走按次定价，1 张图固定单价，与输出 MP 无关
  * 官方按 MP 计费，1MP 起步价 + 超过部分逐 MP 加成
  * 编辑请求与文生图同价（不像 OpenAI gpt-image-2 编辑要按 Vision 加价）
  * klein 4B / klein 9B 的开源权重可在 Hugging Face 自行部署（Apache 2.0 / FLUX NCL 协议）
  * 失败请求（4xx / 内容审核拦截）不计费
</Info>

## 技术规格

| 维度                     | 参数                                                                     |
| ---------------------- | ---------------------------------------------------------------------- |
| **当前主力推荐**             | `flux-2-pro` / `flux-2-pro-preview`（综合）+ `flux-kontext-max`（编辑文字）      |
| **速度**                 | sub-second（klein）/ \< 10 秒（pro）/ \< 15 秒（max）/ 较慢（flex）                |
| **输出分辨率**              | 最大 4MP（2048×2048），任意宽高，边长须 16 倍数                                       |
| **输入分辨率**              | 最小 64×64，最大 4MP（仅编辑端点）                                                 |
| **参考图上限**              | 8 张（FLUX.2 \[pro/max/flex]）/ 4 张（FLUX.2 \[klein]）/ 1 张（FLUX.1 Kontext） |
| **Prompt 长度**          | 最长 32K tokens                                                          |
| **输出格式**               | `jpeg`（默认）/ `png`                                                      |
| **审核档位**               | `safety_tolerance` 0–6（0 最严、6 最宽松，默认 2）                                |
| **联网搜索**               | 仅 `flux-2-max` 支持 grounding search                                     |
| **响应字段**               | `data[0].url`（**10 分钟内有效**，需立即下载）                                      |
| **单次出图数量**             | 1 张（`n=1`）                                                             |
| **prompt\_upsampling** | FLUX.2 \[pro/max/flex] 支持，\[klein] 不支持                                 |

## 端点一览

| 端点                            | 用途                                                                         | Content-Type          |
| ----------------------------- | -------------------------------------------------------------------------- | --------------------- |
| `POST /v1/images/generations` | 文生图 + 图片编辑 / 多图融合（JSON `input_image` \~ `input_image_8`，**推荐**，所有 FLUX 模型） | `application/json`    |
| `POST /v1/images/edits`       | OpenAI 兼容单图编辑（`client.images.edit()` 直连；Kontext 系列已实测）                     | `multipart/form-data` |

多图融合请走 `/generations`（JSON `input_image_N`）；`/edits` 仅接受单张 `image` 文件，适合已有 OpenAI SDK 编辑代码的迁移场景。

<Tip>
  **域名选择**：`api.apiyi.com` 为主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平台提供的其他网关域名，响应行为一致。
</Tip>

## 尺寸（width / height）详解

### 常用尺寸

| 尺寸          | 含义       | 像素      | 适用              |
| ----------- | -------- | ------- | --------------- |
| `1024x1024` | 方形 1:1   | \~1MP   | 通用、社媒头像         |
| `1024x1536` | 竖版 2:3   | \~1.6MP | 海报、肖像           |
| `1536x1024` | 横版 3:2   | \~1.6MP | 风景、桌面           |
| `1440x2048` | 竖版 \~3:4 | \~2.9MP | 电影竖幅            |
| `1920x1080` | 横版 16:9  | \~2MP   | 视频缩略图           |
| `2048x2048` | 方形 1:1   | 4MP     | 旗舰打印（FLUX.2 上限） |

### 自定义尺寸约束

FLUX.2 接受任意尺寸，只需同时满足：

1. **width / height 都是 16 的倍数**
2. **最小 64×64**
3. **最大约 4MP**（如 2048×2048 / 1920×2048 / 2048×1920 等）
4. **推荐总像素 ≤ 2MP** 以兼顾速度与价格

**合法示例**：`1280x720`、`1920x1080`、`2048x1024`、`1456x1920`
**非法示例**：`1000x1000`（非 16 倍数）、`3840x2160`（超 4MP 上限）、`32x32`（小于 64×64）

<Warning>
  **API 端 width/height 与 OpenAI 兼容写法的差异**：BFL 原生使用 `width` / `height` 整数；APIYI 也接受 OpenAI 风格的 `size: "1024x1024"` 字符串，两种写法等价，二选一即可。
</Warning>

## 最佳实践

<Steps>
  <Step title="按场景选模型">
    旗舰终稿 + 需要联网知识 → `flux-2-max`；生产批量 → `flux-2-pro`；文字海报 / 信息图 → `flux-2-flex`；高吞吐实时 → `flux-2-klein-9b`；图像编辑首选 → `flux-kontext-max` 或 `flux-kontext-pro`。
  </Step>

  <Step title="尺寸优先 ≤ 2MP">
    速度和价格的最优平衡点在 1MP–2MP 之间。仅在打印 / 4K 屏幕等明确需要时再上 4MP，klein 高分辨率会显著增加单次成本。
  </Step>

  <Step title="多图融合用「图1/图2」指代">
    `input_image` / `input_image_2` / `input_image_3` 的编号就是 prompt 中「图1/图2/图3」的指代依据，prompt 中显式说"图1的人物放进图2的场景，沿用图3的色彩风格"，比让模型自己推断稳得多。
  </Step>

  <Step title="结果 URL 立即下载">
    `data[0].url` 仅 **10 分钟有效**，且托管在 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`，CORS 默认关闭。生产服务必须代下载到自有 CDN。
  </Step>

  <Step title="文字场景锁 flex 或 max">
    招牌、海报、UI 截图等带文字的场景优先用 `flux-2-flex`（专精文字）或 `flux-2-max`（综合质量更高），其它模型小字仍可能糊。
  </Step>

  <Step title="联网知识用 max grounding search">
    需要"今天的天气"、"昨晚比赛"等实时知识时仅 `flux-2-max` 能用。其它模型纯靠训练数据，无法实时检索。
  </Step>

  <Step title="客户端超时 60–120 秒">
    APIYI 已封装好同步等待，pro / max \< 15 秒到帧，但叠加排队 + 网络抖动建议客户端超时 60–120 秒。flex 较慢可设到 180 秒。
  </Step>

  <Step title="seed 固定可复现">
    传相同 `seed` + 相同其它参数可获一致结果，适合 A/B 测试与客户验收。klein 不支持 prompt\_upsampling，pro/max/flex 默认关闭，按需开启。
  </Step>
</Steps>

## 错误码与重试

| 状态码   | 含义                                                     | 处理建议                                   |
| ----- | ------------------------------------------------------ | -------------------------------------- |
| `400` | 参数非法（width/height 非 16 倍数、超 4MP、prompt 超 32K tokens 等） | 按尺寸约束章节校验，特别检查 16 倍数                   |
| `401` | 令牌无效                                                   | 检查 Bearer Token                        |
| `403` | 内容审核拦截                                                 | 调整 prompt 或调高 `safety_tolerance`（最高 6） |
| `429` | 限流 / 余额不足 / active tasks 超限                            | 指数退避重试                                 |
| `5xx` | 网关 / 后端错误                                              | 重试 1–2 次                               |
| 超时    | 长尾                                                     | 客户端超时 ≥ **60 秒**（flex 建议 180 秒）        |

<Info>
  **建议客户端**：

  * 请求超时 **60–120 秒** 起步（flex 模型放宽到 180 秒）
  * 对 5xx 与 429 做 **指数退避重试**（建议 2 次）
  * 拿到 `data[0].url` 后**立即异步下载**，不要等用户点击再拉
  * 记录响应头 `x-request-id` 方便排查
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="返回的 url 字段为什么 10 分钟就失效？">
    BFL 官方设计：所有结果都托管在 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`，签名 URL 有效期 10 分钟，且**不开启 CORS**。生产服务必须服务端代下载到自有 OSS / CDN，不能直接给浏览器渲染、也不能让用户长期访问。

    APIYI 网关沿用了同一套 URL 机制，行为与官方一致。
  </Accordion>

  <Accordion title="官方走异步轮询，APIYI 怎么变成同步的？">
    APIYI 网关替你做了 polling：你发一个标准的 OpenAI Images API 请求，网关内部代你 POST 到 BFL、轮询 `polling_url` 直到 `Ready`，再把最终的 `result.sample` URL 包装成 `data[0].url` 返回。客户端看到的就是一发请求一次响应，与 OpenAI / GPT-Image / Nano Banana 完全一致。
  </Accordion>

  <Accordion title="多参考图最多能传几张？怎么写 prompt？">
    * **FLUX.2 \[pro/max/flex]**：最多 **8 张**
    * **FLUX.2 \[klein]**：最多 **4 张**
    * **FLUX.1 Kontext \[pro/max]**：单张为主（多图融合靠拼图变通）

    在 prompt 里用「图1/图2/图3」明确指代，例如"把图1的人物放进图2的场景，沿用图3的色彩风格"。也可以自然语言描述，模型理解输入图的内容能力较强。
  </Accordion>

  <Accordion title="prompt_upsampling 是干什么的？要开吗？">
    `prompt_upsampling=true` 时模型会自动扩写 / 优化你的 prompt（特别适合短 prompt）。但**会改变原意**，专业排版 / 品牌素材建议关闭、自由探索时可以开。

    **限制**：FLUX.2 \[klein] 系列不支持，传了会被忽略。
  </Accordion>

  <Accordion title="grounding search 联网搜索具体怎么用？">
    仅 `flux-2-max` 支持。**无需特殊参数**，只要 prompt 里包含需要实时知识的内容，模型就会自动联网搜索后再出图。例如：

    > "Generate a news photo of the snowstorm hitting NYC on Dec 15, 2025"

    适合"昨日比赛比分"、"实时天气"、"历史事件复刻"、"最新流行趋势"等。无联网知识的 prompt 即使打开也不会触发，按普通生图计费。
  </Accordion>

  <Accordion title="hex 色控怎么写最有效？">
    直接在 prompt 中写 hex 码，并用「color」/「hex」之类关键词显式标注：

    ```
    A vase on a table, the color of the vase is gradient from #02eb3c to #edfa3c, the flowers have color #ff0088
    ```

    或者多色品牌：

    ```
    Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020
    ```

    精度业内领先，无需后期调色。
  </Accordion>

  <Accordion title="结构化 JSON prompt 是什么？">
    FLUX.2 支持把 prompt 写成 JSON：

    ```json theme={null}
    {
      "subject": "Mona Lisa painting by Leonardo da Vinci",
      "background": "museum gallery wall, ornate gold frame",
      "lighting": "soft gallery lighting",
      "style": "digital art, high contrast",
      "camera_angle": "eye level view",
      "composition": "centered, portrait orientation"
    }
    ```

    把 JSON 字符串作为 `prompt` 字段值传入。适合产线自动化、批量生成同模板素材。
  </Accordion>

  <Accordion title="图片编辑该走哪个端点？">
    两种方式二选一：

    * **方式 A（推荐）**：JSON + `input_image`（\~ `input_image_8`）发 `/v1/images/generations`，所有 FLUX 模型通用，支持多图融合
    * **方式 B**：`multipart/form-data` 发 `/v1/images/edits`，文件字段名必须是 `image`（单图），与 OpenAI SDK `client.images.edit()` 直接兼容，Kontext 系列已实测

    详细参数和示例见 [图片编辑 API](/api-capabilities/flux/image-edit)。

    **注意**：FLUX.1 Kontext 系列原生只支持单参考图；FLUX.2 系列原生支持最多 8 张（走方式 A）。
  </Accordion>

  <Accordion title="可以直接用 OpenAI 官方 SDK 调用吗？">
    可以，零代码改动。把 `base_url` 指向 `https://api.apiyi.com/v1` 即可：

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="flux-2-pro",
        prompt="...",
        size="1024x1024"
    )
    ```

    Node.js 的 `openai` 包同理。所有 FLUX 模型都按 OpenAI Images API 规范返回 `data[0].url`。
  </Accordion>

  <Accordion title="支持主动取消任务吗？">
    **不支持**。客户端断开连接后服务端仍会把生成跑完并照常计费。建议客户端做好超时控制，不要依赖"断连不收费"的假设。
  </Accordion>

  <Accordion title="速率限制和并发是多少？">
    BFL 官方对单账号限 **24 active tasks**，`flux-kontext-max` 单独限 **6 active tasks**。

    APIYI 在网关层做了池化，企业用户的并发不受单账号上限制约。如需明确 SLA / RPM 配额，请联系商务申请扩容。
  </Accordion>

  <Accordion title="webhook 回调能用吗？">
    BFL 官方支持 `webhook_url` + `webhook_secret`，但 APIYI 的 OpenAI 兼容封装走同步等待，**未透传 webhook 字段**——不需要轮询，发一发拿一发。如果业务确实需要 webhook，请联系我们说明场景，可单独开启原生异步通道。
  </Accordion>

  <Accordion title="生成失败会扣费吗？">
    **不会**。参数 `400`、内容审核 `403`、限流 `429` 都返回错误且不计费。**只有请求实际进入模型生成阶段（即收到 `200` + `data[0].url`）才会按张数计费**。
  </Accordion>
</AccordionGroup>

## 相关文档

* [文生图 Playground](/api-capabilities/flux/text-to-image) - `/v1/images/generations` 在线调试
* [图片编辑 Playground](/api-capabilities/flux/image-edit) - `/v1/images/edits` 多图融合 + 编辑
* [历史版本与迁移](/api-capabilities/flux/historical-versions) - FLUX.1 \[pro] / \[pro] 1.1 / Ultra / \[dev]
* [API 使用手册](/api-manual) - 通用调用规范
* [GPT-Image-2 概览](/api-capabilities/gpt-image-2/overview) - OpenAI 官方旗舰图像，支持 4K
* [Seedream 概览](/api-capabilities/seedream-image/overview) - 字节火山战略合作通道

<Info>
  FLUX 是 BFL 自研模型族，在 hex 色精确控制、文字渲染、长 prompt 理解上业内领先。如果你更看重 OpenAI 生态一致性可参考 [GPT-Image-2](/api-capabilities/gpt-image-2/overview)；更看重中文场景可参考 [Seedream](/api-capabilities/seedream-image/overview)。
</Info>
