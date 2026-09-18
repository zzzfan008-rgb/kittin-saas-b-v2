> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite 生图/编辑

> 谷歌最快最省的图像模型 Nano Banana 2 Lite (gemini-3.1-flash-lite-image)，约 4 秒出图、比 Nano Banana 2 快约 2.7 倍，专注 1K 画布 + 14 种宽高比。API易按量计费实测约 $0.018/次（官网 4 折费率），按次 $0.025/次。

## 概述

**Nano Banana 2 Lite**（本站栏目简称 **Nano Banana Lite**）是谷歌于 2026 年 6 月 30 日发布的图像模型，模型 ID 为 `gemini-3.1-flash-lite-image`。它是 Nano Banana 2（`gemini-3.1-flash-image`）的**轻量经济版**，把重心放在**速度与成本**上：约 4 秒即可出图，比 Nano Banana 2 快约 **2.7 倍**，是 Nano Banana 系列里**最快、最省**的一档。

<Note>
  **🍌 2026年6月30日发布**：Nano Banana 2 Lite 上线！约 4 秒出图、比 Nano Banana 2 快约 2.7 倍，专注 1K 画布 + 14 种宽高比，自带 SynthID 隐形水印。API易 已第一时间接入，**按量计费实测约 \$0.018/次**（官网 4 折费率）、按次 \$0.025/次，主打高并发、低成本、快速迭代。
</Note>

<Warning>
  **价格暂定**：模型刚上线，当前售价为暂定价，后续可能调整最终售价。如有变动我们会另行公告，请以平台实时价格为准。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/nano-banana-lite-image/text-to-image">
    输入文本提示词生成图片，带交互式 Playground 在线调试。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/nano-banana-lite-image/image-edit">
    上传图片 + 编辑指令生成新图片，带交互式 Playground 在线调试。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、`parts` 防御式解析、上传压缩、以及 Lite 只支持 1K 这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Nano Banana Lite 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 Nano Banana Lite（`gemini-3.1-flash-lite-image`）的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/nano-banana-lite-image/overview.md](https://docs.apiyi.com/api-capabilities/nano-banana-lite-image/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 超时：走 Gemini 原生格式 `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent`，客户端 timeout 设到 300 秒。本模型常规出图只要 4 秒左右，300 秒是给高峰拥塞留的余量，**不要因为它快就把超时压到几十秒**。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了、但这次请求照样计费。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽。

  2. 返回解析（**最容易写错的一条**）：图片是 base64，在 `candidates[0].content.parts[]` 里的 `inlineData.data`。但 `parts` 是**异构数组，段数和顺序都不保证**——前面可能挂一个文本段，图片就落到下标 1 而不是 0。所以**绝对不要写死 `parts[0]` 或 `parts[1]`**，在两者之间来回改是解决不了问题的。正确写法：遍历 `parts`、筛出所有含 `inlineData` 的段，取**最后一张**。`mimeType` 也从响应里读，不要写死成 `image/png`。拿到后渲染展示并提供「保存到本地」。

  3. 上传压缩：编辑时把参考图 base64 塞进 `inlineData`（支持 `image/png` 和 `image/jpeg`）。上传前先压缩——超过 1.5MB 才处理，长边等比缩到 2048px 以内（不放大小图），以质量 0.9 重编码、保持原格式；多图时合计控制在 6MB 以内。base64 编码后体积还会再膨胀约三分之一，别直传手机原图。某张图压缩失败就回退用原图继续，不要因为压缩失败中断整个请求。另外注意：**同一个 part 里只能放 `text` 或 `inlineData` 其中一个**，不能两个字段并存，正确结构是 1 个文本段 + N 个图片段。

  4. 分辨率参数：`generationConfig.imageConfig.imageSize` 在 Lite 上**只接受 `1K`**，传 `2K` 或 `4K` 会报错——如果你从 Nano Banana 2 的代码改过来，务必把这两个值删掉。`aspectRatio` 支持本页列出的 14 个比例，显式传、别靠默认值。前台界面只需要暴露比例下拉，不要给分辨率选项。

  5. 错误处理：内容审核拦截时 HTTP 仍然是 200，但 `candidates[0].content.parts` 为空。判断顺序是先看 `candidatesTokenCount` 是否为 0，再看 `finishReason` 是否非 `STOP`。`IMAGE_SAFETY` 这类拦截**不计费**，原样重试 1-2 次往往就成功了，建议在代码里对它做自动重试。

  6. Key 从环境变量 `APIYI_API_KEY` 读，用 `Authorization` 头加 `Bearer` 前缀传，不要硬编码进代码、也不要提交进 git。

  7. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                    | 挡掉的坑                                                                                                            |
  | --------------------- | --------------------------------------------------------------------------------------------------------------- |
  | `imageSize` 只传 `1K`   | Lite 只有 1K 一档，从 Nano Banana 2 迁过来忘了删 `2K` / `4K` 会直接报错                                                          |
  | 不写死 `parts` 下标        | `parts` 段数和顺序都不保证，写死下标一定会间歇性失败。详见 [Nano Banana 开发指南](/api-capabilities/nano-banana-dev-guide)                   |
  | 超时仍设 300 秒            | 常规 4 秒出图容易让人把超时压得很小，高峰拥塞时就会误超时，而**断连的请求照常计费**。详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) |
  | 上传前压缩                 | base64 编码后体积再膨胀约三分之一，直传手机原图会拖慢请求。压缩标准见 [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution)           |
  | 对 `IMAGE_SAFETY` 自动重试 | 审核拦截返回 200 但没有图，且不计费，原样重试往往就过了。详见 [Gemini 出图错误处理](/api-capabilities/gemini-image-error-handling)                |
</Accordion>

## 为什么选 API易 的 Nano Banana Lite

**Nano Banana Pro / 2 是 API易 消耗量排名第一的图像模型**——稳定、可靠、速度快。Lite 版把「快」和「省」做到新高度，适合走量场景。API易 在**稳定性**、**成本**、**接入体验**三方面做了深度优化：

<CardGroup cols={2}>
  <Card title="官方通道 · 与 Gemini 一致" icon="shield-check">
    完全兼容谷歌官方 Gemini API 格式（`/v1beta/models/.../generateContent`），同时支持 OpenAI SDK 模式，请求体、响应字段、错误码与官方一致，迁移零改造。
  </Card>

  <Card title="不限并发 · 企业可放量" icon="infinity">
    无谷歌 AI Studio 的 RPM/RPD 硬限制，企业批量出图、高峰流量都能线性放大，避免被官方配额打断。
  </Card>

  <Card title="按量实测约 \$0.018/次" icon="percent">
    **按量计费实测约 \$0.018/次**（官网 4 折费率：提示 \$0.10 / 输出 \$12 每 1M tokens），比按次 \$0.025/次（官方约 \$0.034/张）更省；叠加 [充值加赠活动](/faq/recharge-promotions) 实际成本更低。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需海外服务器或代理**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，延迟稳定、免去出海改造。
  </Card>

  <Card title="模型生态齐全" icon="layers">
    同系列覆盖 [Nano Banana Pro](/api-capabilities/nano-banana-image/overview)（极致画质）、[Nano Banana 2](/api-capabilities/nano-banana-2-image/overview)（画质速度兼顾）、Nano Banana 2 Lite（最快最省），按场景自由组合。
  </Card>

  <Card title="专业服务 · 企业陪跑" icon="handshake">
    团队深耕图像生成场景，具备丰富的选型、调优与集成经验，可为企业客户提供从 PoC 到生产上线的完整技术支持。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="约 4 秒出图" icon="gauge">
    约 4 秒生成一张，较 Nano Banana 2 快约 2.7 倍，主打高并发、快速迭代
  </Card>

  <Card title="低成本" icon="hand-coins">
    按量计费实测约 \$0.018/次（官网 4 折费率），比按次 \$0.025 更省，单张成本敏感场景理想选择
  </Card>

  <Card title="14 种宽高比" icon="maximize">
    覆盖 `1:1`、`4:1`、`1:4`、`16:9`、`9:16` 等 14 种宽高比，适配多种版式
  </Card>

  <Card title="SynthID 水印" icon="shield-check">
    输出自带 SynthID 隐形数字水印，肉眼不可见，不影响使用
  </Card>
</CardGroup>

## 版本对比

| 特性     | **Nano Banana 2 Lite**        | Nano Banana 2            | Nano Banana Pro      |
| ------ | ----------------------------- | ------------------------ | -------------------- |
| 模型 ID  | `gemini-3.1-flash-lite-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
| 定位     | 最快 / 最省                       | 画质速度兼顾                   | 画质上限                 |
| 画质     | ⭐⭐⭐⭐ 优秀                       | ⭐⭐⭐⭐⭐ Pro 级              | ⭐⭐⭐⭐⭐ 最高             |
| 出图速度   | 🚀 约 4 秒                      | ⚡ 较快                     | 🐢 较慢                |
| 最高分辨率  | 1K                            | 4K                       | 4K                   |
| 宽高比数量  | 14 种                          | 14 种                     | 10 种                 |
| API易定价 | **\$0.025/次**                 | \$0.055/次                | \$0.09/次             |

<Tip>
  **选型速记**：

  * ⚡ **追求极致性价比 / 快速批量出图** → Nano Banana 2 Lite（约 4 秒出图，按次 \$0.025）
  * 🔥 **需要 2K/4K 高清或更强画质** → Nano Banana 2（Pro 级画质 + Flash 级速度）
  * 🎨 **追求极致画质** → Nano Banana Pro（最高保真度）
</Tip>

## 模型定价

<Info>
  **计费模式选择**：Nano Banana 2 Lite 支持两种计费方式，通过创建令牌时的「Billing model」设置选择：

  * 选择 **Pay-as-you-go**（按量计费）或 **Pay-as-you-go Priority**（按量优先）→ 按量计费
  * 选择 **Pay-per-request**（按次计费）或 **Pay-per-request Priority**（按次优先）→ 按次计费
  * ⚠️ **请勿选择 Hybrid billing（混合计费）**
</Info>

### 按量计费（推荐 · 官网 4 折）

| 计费项目   | 谷歌官方             | API易                 | 官网折扣       |
| ------ | ---------------- | -------------------- | ---------- |
| 提示（输入） | \$0.25/M tokens  | **\$0.10/M tokens**  | **官网 4 折** |
| 补全（输出） | \$30.00/M tokens | **\$12.00/M tokens** | **官网 4 折** |

<Info>
  **实测单价可预期**：按量（按 tokens）计费下，1K 出图**实测平均约 \$0.018/次**（常见区间约 \$0.016–\$0.019，输出 token 决定单价）。比按次固定价 \$0.025/次更省，且单价稳定、可预期。
</Info>

### 按次计费

| 模型                                                   | API易定价        | 谷歌官方        | 说明               |
| ---------------------------------------------------- | ------------- | ----------- | ---------------- |
| **Nano Banana 2 Lite** `gemini-3.1-flash-lite-image` | **\$0.025/次** | 约 \$0.034/张 | 固定单价，后续可能下调、暂时不动 |

<Tip>
  **💰 计费模式怎么选：首选「按量优先」**。按量（按 tokens）计费实测约 \$0.018/次，比按次 \$0.025/次更省、单价可预期；且令牌计费模式选 `按量优先`（Pay-as-you-go Priority）时，**同一把令牌还兼容 Nano Banana Pro / 2 的按次计费**，一把跑全系列。按次 \$0.025/次为固定单价，后续**可能下调、暂时不动**，以平台实时价为准。结合充值加赠活动，实际成本更低。
</Tip>

<Warning>
  模型刚上线，当前价格为暂定价，后续可能调整最终售价（按次 \$0.025/次后续可能下调）。如有变动我们会另行公告，请以平台实时价格为准。
</Warning>

## 分组介绍

Nano Banana 2 Lite 走 API易 默认通道即可调用，无需专属分组：

| 分组             | 倍率   | 适用场景             |
| -------------- | ---- | ---------------- |
| `Default` 默认分组 | 1.0x | 基础通道，与定价表一致；默认推荐 |

**令牌「计费模式」推荐：默认选 `按量优先`（Pay-as-you-go Priority）**。原因有三：① 按量（按 tokens）计费实测约 \$0.018/次，比按次 \$0.025/次更省；② 单价稳定、可预期；③ 同一把令牌**同时兼容 Lite / Nano Banana 2 的按量计费与 Nano Banana Pro 的按次计费**，一把跑全系列。

## 支持的分辨率与宽高比

### 输出分辨率

| 分辨率 | 说明              | 推荐场景               |
| --- | --------------- | ------------------ |
| 1K  | 唯一档位（不支持 2K/4K） | 社交配图、缩略图、草稿预览、网页展示 |

<Info>
  Nano Banana 2 Lite 专注 **1K 画布**，不支持 2K/4K。需要更高分辨率或更强画质时，切换到 [Nano Banana 2](/api-capabilities/nano-banana-2-image/overview)（最高 4K）或 [Nano Banana Pro](/api-capabilities/nano-banana-image/overview)。
</Info>

### 支持的宽高比（14 种）

`1:1`、`1:4`、`4:1`、`1:8`、`8:1`、`2:3`、`3:2`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`

### 各宽高比的输出尺寸（1K，像素）

在请求中通过 `aspectRatio` 指定宽高比、`imageSize` 固定为 `1K`：

| 宽高比      | 1K 输出尺寸   |
| -------- | --------- |
| **1:1**  | 1024×1024 |
| **1:4**  | 512×2048  |
| **1:8**  | 384×3072  |
| **2:3**  | 848×1264  |
| **3:2**  | 1264×848  |
| **3:4**  | 896×1200  |
| **4:1**  | 2048×512  |
| **4:3**  | 1200×896  |
| **4:5**  | 928×1152  |
| **5:4**  | 1152×928  |
| **8:1**  | 3072×384  |
| **9:16** | 768×1376  |
| **16:9** | 1376×768  |
| **21:9** | 1584×672  |

## 常见问题

<AccordionGroup>
  <Accordion title="Nano Banana 2 Lite 和 Nano Banana 2 有什么区别？">
    两者都基于谷歌 Gemini 3.1 Flash 系列，**Lite** 是**轻量经济版**：

    * ✅ **速度**：Lite 约 4 秒出图，比 Nano Banana 2 快约 2.7 倍
    * ✅ **价格**：Lite 按量实测约 \$0.018/次（官网 4 折费率）、按次 \$0.025/次，更适合走量
    * ⚠️ **分辨率**：Lite 仅支持 1K；Nano Banana 2 最高 4K
    * ⚠️ **画质上限**：追求极致画质时 Nano Banana 2 / Pro 更优

    从 Nano Banana 2 迁移只需改模型名（注意 Lite 仅 1K）：把 `gemini-3.1-flash-image` 换成 `gemini-3.1-flash-lite-image` 即可。
  </Accordion>

  <Accordion title="我应该选 Lite 还是 Nano Banana 2？">
    * **追求极致性价比 / 快速批量出图 / 1K 够用** → 选 **Lite**（约 4 秒、按次 \$0.025）
    * **需要 2K/4K 高清、或对画质有更高要求** → 选 **Nano Banana 2**（最高 4K，Pro 级画质）

    两者代码完全一致，只差模型名，随时可切换测试。
  </Accordion>

  <Accordion title="生成一张图片需要多长时间？">
    Nano Banana 2 Lite 主打速度，**1K 分辨率约 4 秒**出图。建议仍把客户端超时设到较长（如 300 秒），以应对偶发延迟和高峰拥塞。
  </Accordion>

  <Accordion title="有并发限制吗？">
    **API 不限制并发，也不是串行处理。** 你可以放心地自行并发调用，请求之间不用排队、不会互相阻塞。与谷歌 AI Studio 不同，API易 的通道没有 RPM/RPD 硬限制，企业批量出图、高峰流量都能线性放大。

    真正要注意的是 `timeout` 超时时间——虽然 Lite 出图快，但高峰拥塞时单次仍可能变慢，建议把客户端超时设到 300 秒。
  </Accordion>

  <Accordion title="支持哪些输入图片格式？">
    图片编辑时支持 `image/png` 和 `image/jpeg` 格式，可通过 base64 编码上传。详见 [图片编辑 API 参考](/api-capabilities/nano-banana-lite-image/image-edit)。
  </Accordion>

  <Accordion title="输出图片有水印吗？">
    所有输出图片都带有 SynthID 隐形数字水印（Google 的 AI 生成内容标识技术），肉眼不可见，不影响使用。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Nano Banana 2 图片生成](/api-capabilities/nano-banana-2-image/overview) - 画质速度兼顾版，最高 4K
* [Nano Banana Pro 图片生成](/api-capabilities/nano-banana-image/overview) - 极致画质旗舰版
* [图像生成对比测试](https://imagen.apiyi.com/)
* [API 使用手册](/api-manual)

<Info>
  Nano Banana 2 Lite 刚上线，功能和定价可能会有调整。建议关注文档更新获取最新信息。
</Info>
