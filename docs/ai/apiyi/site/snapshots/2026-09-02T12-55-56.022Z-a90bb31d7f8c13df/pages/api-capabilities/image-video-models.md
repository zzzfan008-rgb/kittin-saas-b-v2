> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图像与视频生成模型

> 查看支持的图像生成和视频生成 AI 模型，包括定价和使用说明。

API易 支持多种图像和视频生成模型，本页面提供详细的模型信息、定价和使用说明。

<Tip>
  查看文本和多模态模型请访问 [当下热门模型](/api-capabilities/model-info)。
</Tip>

## 🎨 图像生成模型

| 模型名称                                                                         | 状态           | 特点                                                                          | 分辨率/规格                              | 价格                          |
| ---------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------- | ----------------------------------- | --------------------------- |
| [**Nano Banana Pro**](/api-capabilities/nano-banana-image-edit) 🔥           | 热卖中，本站最强     | 知识理解、中文字支持好、精准编辑                                                            | 1K/2K/4K，支持原比例改图                    | \$0.09/张                    |
| [**Nano Banana 2**](/api-capabilities/nano-banana-2-image) 🔥                | 热卖中，快速       | 同 Pro，支持按量计费                                                                | 0.5K-4K，新增 1:8 和 8:1（可制作长图）         | \$0.055/张（按量 \$0.025-0.07）  |
| [**Nano Banana Lite**](/api-capabilities/nano-banana-lite-image/overview) 🆕 | 新上线，最快最省     | 谷歌最快最省、约 4s 出图、比 NB2 快约 2.7 倍、专注 1K                                         | 1K，14 种宽高比                          | \$0.025/张（按量约 \$0.018）      |
| [**gpt-image-2**](/api-capabilities/gpt-image-2/overview) 🆕                 | 新上线，官转       | OpenAI 旗舰官转、size/quality 精确控、参考图自动高保真、支持 mask 局部重绘                          | 1K/2K/**4K**（任意合法尺寸）                | 按 token 计费，默认原价，充值活动 85 折左右 |
| [**gpt-image-2-all**](/api-capabilities/gpt-image-2-all/overview) 🔥         | 热卖中，官逆       | GPT 官逆 ChatGPT 网页线、文字还原好、中文原生、约 30–60s 出图较快、尺寸写进 prompt                     | 1K-2K（prompt 控制）                    | \$0.03/张（按次）                |
| [**gpt-image-2-vip**](/api-capabilities/gpt-image-2-vip/overview) 🆕         | 新上线，官逆       | GPT 官逆 Codex 线、调用同 -all、`size` 字段锁尺寸、30 档常见 size 含 **4K**、约 90–150s 出图      | 1K/2K/**4K**（30 档统一价）               | \$0.03/张（按次，4K 不加价）         |
| [**Nano Banana**](/api-capabilities/nano-banana-image)                       | 正常可用         | 速度快、一致性佳、电商改图                                                               | 多种尺寸                                | \$0.02/张                    |
| [**Seedream 5.0 Pro**](/api-capabilities/seedream-image/overview) 🆕         | 新上线，专业版      | 全系最强画质与复杂指令遵循、交互式编辑（坐标/选框/箭头）、最多 10 张参考图融合、png 输出；约 2 分钟出图，常规场景仍建议 5.0 Lite | 1K/2K（总像素 ≤ 4.19M，无 3K/4K；不支持组图与流式） | \$0.12/次                    |
| [**Seedream 5.0 Lite**](/api-capabilities/seedream-image)                    | 正常可用         | 价格优势、速度快、输出 URL                                                             | 2K/3K                               | \$0.035/张                   |
| [**Seedream 4.5**](/api-capabilities/seedream-image)                         | 正常可用         | 价格优势、速度快、输出 URL                                                             | 2K/4K                               | \$0.04/张                    |
| [**Seedream 4.0**](/api-capabilities/seedream-image)                         | 正常可用         | 价格优势、速度快、输出 URL                                                             | 2K                                  | \$0.035/张                   |
| [**GPT Image 1.5**](/news/gpt-image-1-5-launch) 🔥                           | 官方系列         | 精准编辑，速度提升 4 倍，文本渲染增强                                                        | 低/中/高质量                             | 按量计费                        |
| [**GPT Image 1**](/api-capabilities/gpt-image-1)                             | 官方系列         | 精准编辑                                                                        | 多种尺寸                                | 按量计费                        |
| **GPT Image 1-Mini**                                                         | 官方系列         | 可替代 sora\_image                                                             | 多种尺寸                                | 按量计费                        |
| [**flux-2-max**](/api-capabilities/flux/overview) 🆕                         | 最新一代（FLUX.2） | FLUX.2 旗舰，高质量出图                                                             | 多种尺寸                                | \$0.07/次                    |
| [**flux-2-pro**](/api-capabilities/flux/overview) 🆕                         | 最新一代（FLUX.2） | FLUX.2 专业版，均衡质价                                                             | 多种尺寸                                | \$0.03/次                    |
| [**flux-2-flex**](/api-capabilities/flux/overview) 🆕                        | 最新一代（FLUX.2） | FLUX.2 灵活版，参数可调                                                             | 多种尺寸                                | \$0.06/次                    |
| [**Flux Kontext Pro**](/api-capabilities/flux-image-generation)              | 正常可用         | 图像编辑                                                                        | 多种尺寸                                | 详见文档                        |
| [**Flux Kontext Max**](/api-capabilities/flux-image-generation)              | 正常可用         | 高质量图像编辑                                                                     | 多种尺寸                                | 详见文档                        |

<Info>
  **Nano Banana Pro**：1K-4K 所有分辨率统一价格 \$0.09/张，官方 4K 价格为 \$0.24/张，约官网 38%！企业高可用分组 `NanoBananaEnterprise`（1.4x）可作为兜底。[查看详情](/news/nano-banana-pro-launch)
</Info>

<Tip>
  **图像生成测试工具**

  * 国内访问：<a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * 全球访问：<a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  详细文档：

  * [Nano Banana Pro 文档](/api-capabilities/nano-banana-image-edit) - 本站最强，知识理解+精准编辑
  * [Nano Banana 2 文档](/api-capabilities/nano-banana-2-image) - 支持按量计费，新增超长比例
  * [gpt-image-2-all 文档](/api-capabilities/gpt-image-2-all/overview) - GPT 官逆 ChatGPT 网页线，\$0.03/张、约 30–60s 出图较快
  * [gpt-image-2-vip 文档](/api-capabilities/gpt-image-2-vip/overview) - GPT 官逆 Codex 线，\$0.03/张、30 档 size 含 4K、约 90–150s 出图
  * [gpt-image-2 文档](/api-capabilities/gpt-image-2/overview) - OpenAI 官转、原生 4K、size/quality 精确控
  * [⚖️ 官转 vs 官逆 对比](/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2 与官逆姐妹模型 -all / -vip 选型对照
  * [Nano Banana 文档](/api-capabilities/nano-banana-image) - 速度快、一致性佳
  * [Nano Banana Lite 文档](/api-capabilities/nano-banana-lite-image/overview) - 最快最省，约 4s 出图，按次 \$0.025/张
  * [Seedream 文档](/api-capabilities/seedream-image) - 价格优势、速度快；含 5.0 Pro 专业版（\$0.12/次、约 2 分钟出图）
  * [GPT Image 1.5 文档](/news/gpt-image-1-5-launch) - 速度提升 4 倍，精准编辑
  * [GPT Image 1 文档](/api-capabilities/gpt-image-1) - 官方图像生成
  * [Flux 文档](/api-capabilities/flux-image-generation) - 图像编辑
</Tip>

## 🎬 视频生成模型

| 模型名称                                                                       | 状态              | 特点                                                                                                                   | 时长                                                         | 价格                                                                               |
| -------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [**Seedance 2.5 / 2.0 系列**](/api-capabilities/seedance2/overview) 🔥       | 已上线，热卖中         | 字节跳动，火山引擎国内版官方资源；**2.5** + 2.0 标准版 / 极速版 `fast` / 轻量版 `mini` 四档并行，文生/首尾帧/多模态参考（图+视频+音频）/视频编辑与延长，**默认输出同步音频**，私域素材库免费 | 2.5 为 4–30s，2.0 系为 4–15s（480p/720p/1080p，1080p 仅 2.5 与标准版） | 按 token 计费（面积×时长）；720p/5s 实测 \$0.45（mini）/ \$0.73（fast）/ \$0.91（标准）/ \$1.35（2.5） |
| [**Wan2.7 视频生成**](/api-capabilities/wan/overview) 🆕                       | 新上线，推荐          | 阿里云万象，文生/图生/参考生/视频编辑，i2v 支持音频驱动                                                                                      | 按秒（最长 12s）                                                 | \$0.084-0.14/秒（官网 98%）                                                           |
| [**Wan2.6 视频生成**](/api-capabilities/wan/historical-versions)               | 正常可用            | 与 Wan2.7 共用端点，含 `r2v-flash` 低延迟档                                                                                     | 按秒                                                         | 以控制台为准                                                                           |
| [**VEO 3.1 官转（Official）**](/api-capabilities/veo-3-1-official/overview) 🔥 | 已上线，热卖中（官逆替代方案） | 透传 Google AI Studio 官方端点，声画同步、支持真人、默认分组即可调用                                                                          | 4/6/8s                                                     | 按次 \$0.3 / \$1.2（720p/1080p/4k 同价）                                               |
| **Veo 3.1 官逆**                                                             | ⏸️ 暂停（谷歌风控）     | 谷歌 Flow 官逆；暂停期间请改用 **VEO 3.1 官转**                                                                                    | 固定 8s                                                      | 暂不可用                                                                             |
| **Sora 2 官转**                                                              | ⏸️ 已下线          | OpenAI 官转、专业创作、稳定性高、支持 sora-2-pro，不支持「角色」引用                                                                          | 4/8/12s                                                    | 暂不可用                                                                             |
| [**HappyHorse 1.1**](/api-capabilities/happyhorse/overview) 🆕             | 新上线             | 阿里云，多参考图主体保持（最多 9 张），与 Wan 共用分组                                                                                      | 按秒（最长 12s）                                                 | \$0.126-0.224/秒（官网 98%）                                                          |
| ~~**Sora 2 官逆**~~                                                          | ❌ 已下线           | 原电商带货 / 动漫漫剧场景，请改用 Sora 2 官转                                                                                         | —                                                          | —                                                                                |

<Info>
  **视频模型核心特性**：

  * **Seedance 2.5 / 2.0 系列（字节跳动）**：`doubao-seedance-2-5-260628`（2.5，最长 30 秒、最多 30 张参考图、支持 mov 输出）/ `doubao-seedance-2-0-260128`（标准版）/ `-fast-260128`（极速版）/ `-mini-260615`（轻量版），价格与速度不同（mini \< fast \< 标准版 \< 2.5，2.5 约为标准版 1.5 倍），mini 与 fast 最高 720p。**四个模型同走 `SeeDance2` 分组**（0.18x），一把令牌通吃；令牌计费模式须选「按量优先」或「按量计费」。`SD2Mini`（0.10x）与 `SD2Fast`（0.15x）为限时特价分组，**mini 降价 44.4％、fast 降价 16.7％，截至 2026 年 9 月 7 日 23:59 (UTC+8)**，到期后倍率恢复 0.18x 不断供
  * **VEO 3.1 官转（Official）**：透传 Google AI Studio 官方端点，业界领先的声画同步，支持真人出镜，默认分组 + 按次/按量优先令牌即可调用，是 Veo 3.1 官逆暂停期间的推荐替代
  * **Veo 3.1 官逆**：因谷歌风控**暂停中**，恢复时间另行通知，期间请改用 VEO 3.1 官转
  * **Sora 2 官转**：已下线，暂不可用
  * **Wan2.7 / Wan2.6（阿里云万象）**：默认价约官网 98%，两个系列与 HappyHorse 共用 `Wan&HappyHorse` 分组，一把令牌通用；Wan2.6 与 Wan2.7 同端点同 schema，只改 `model` 名即可迁移
  * **HappyHorse 1.1（阿里云）**：擅长多参考图主体保持，与 Wan 共用 `Wan&HappyHorse` 分组与端点
  * AI 视频工具（在线测试）：<a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **即将上线的视频模型**：

  * Kling 3.0

  敬请期待！关注我们获取最新上线通知。
</Note>

## 💰 定价说明

* **按量计费**：根据实际使用计费，无最低消费
* **余额有效期**：自充值之日起 365 天内有效，再次充值自动重置（详见[充值活动说明](/faq/recharge-promotions)）
* 访问 [API易控制台定价页面](https://www.apiyi.com/account/pricing) 查看所有模型的最新价格
