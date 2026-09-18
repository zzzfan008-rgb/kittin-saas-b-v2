> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2.5 上线：Flare 更快、Sunburst 更准

> OpenAI 9 月 8 日发布 GPT-image-2.5，API 侧分为 Flare（速度优先，时延比 gpt-image-2 最多低 50%）与 Sunburst（画质与编辑精度优先）两款。API易 官转已同步上线，接入方式与 gpt-image-2 一致，价格同为 $5/$8/$30 每百万 tokens，新增 xhigh / max 两档画质。

## 核心要点

* **🚀 一代两款**：`gpt-image-2.5-flare` 速度优先，`gpt-image-2.5-sunburst` 画质与编辑精度优先，当前分别指向 `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08`
* **⚡ Flare 更快**：OpenAI 称 Flare 在画质高于 `gpt-image-2` 的前提下，时延最多降低 50%；早期客户实测速度是 `gpt-image-2` 的 2～4 倍
* **🎯 Sunburst 更准**：OpenAI 目前最强的图像生成与编辑模型，多轮编辑更能保留前几轮改动与参考图主体，生成时间比 Flare 长
* **🎚️ 画质六档**：`quality` 新增 `xhigh` / `max`，加上原有 `low` / `medium` / `high` / `auto` 共六档；`gpt-image-2` 只到 `high`
* **💰 价格不变**：文本输入 \$5、图片输入 \$8、图片输出 \$30 每百万 tokens，与 `gpt-image-2` 逐项相同
* **🔌 零改动接入**：API易 官转已上线，把 `model` 换成新名字即可，`Default` / `image2Enterprise` / `svip` 分组可用

## 背景介绍

2026 年 9 月 8 日，OpenAI 发布 **ChatGPT Images 2.5**。官方口径是「更锐利的细节、更精准的编辑、更快的生成」：光影更自然、纹理更丰富，复杂版式与透明背景处理更好，带参考图编辑时对人物和物体主体的保留度更高，多轮修改时也更能记住前几轮已经改过的内容。OpenAI 同时披露，ChatGPT Images 与 API 侧的 GPT-Image 系列每周生成图片已超过 30 亿张。

与 4 月发布的 `gpt-image-2` 只有一个模型不同，这一代在 API 侧拆成了两款：**Flare** 是小模型，为速度优化，OpenAI 把它定位成「大多数应用的默认选择」；**Sunburst** 是基座模型，为画质优化，面向需要精修编辑的高端视觉工作流。ChatGPT 端同步上线了 Sketch 手绘参考、图片局部评论等交互功能，不过这些属于 ChatGPT 产品功能，不在 API 范围内。

API易 在发布次日完成官转接入。两款模型与 `gpt-image-2` 同走 images API、同一套参数、同一张价目表，已经在用 `gpt-image-2` 的代码只需要改一个模型名。

## 详细解析

### 两款模型怎么分工

<CardGroup cols={2}>
  <Card title="gpt-image-2.5-flare · 速度优先" icon="zap">
    小模型，为速度优化。OpenAI 称其画质高于 `gpt-image-2`，时延最多低 50%；早期客户评估中速度达到 `gpt-image-2` 的 2～4 倍。适合创作者与社交内容、商品图、视觉搜索、快速原型与高并发批量出图。
  </Card>

  <Card title="gpt-image-2.5-sunburst · 精度优先" icon="crosshair">
    基座模型，为画质优化，OpenAI 称其为「目前最强的图像生成与编辑模型」。编辑指令执行更精确、多轮修改更稳，适合成品级营销物料、精修商品图等对细节控制要求高的工作流。生成时间比 Flare 长。
  </Card>
</CardGroup>

选型可以很简单：**默认用 Flare**，只有在编辑精度不够、或者要出成品级大图时再换 Sunburst。两款模型参数完全相同，切换只改 `model` 字段，可以在同一条流水线里按任务动态选择。

### 与 gpt-image-2 的差异

| 对比项              | gpt-image-2                        | gpt-image-2.5-flare              | gpt-image-2.5-sunburst              |
| ---------------- | ---------------------------------- | -------------------------------- | ----------------------------------- |
| 定位               | 单一旗舰                               | 速度优先的小模型                         | 画质优先的基座模型                           |
| 画质相对 gpt-image-2 | 基准                                 | 更高                               | 更高（两款中最高）                           |
| 时延相对 gpt-image-2 | 基准                                 | 最多低 50%                          | 比 Flare 长                           |
| `quality` 档位     | `low` / `medium` / `high` / `auto` | 六档，新增 `xhigh` / `max`            | 六档，新增 `xhigh` / `max`               |
| 多轮编辑一致性          | —                                  | 提升                               | 提升更明显                               |
| 每百万 tokens 单价    | \$5 / \$8 / \$30                   | 相同                               | 相同                                  |
| 当前快照             | `gpt-image-2-2026-04-21`           | `gpt-image-2.5-flare-2026-09-08` | `gpt-image-2.5-sunburst-2026-09-08` |

### 技术规格

尺寸规则沿用 `gpt-image-2`：预设 `1024x1024` / `1536x1024` / `1024x1536`，自定义尺寸需满足边长为 16 的倍数、长宽比在 1:3 到 3:1 之间、最长边不超过 3840 像素、总像素在 0.65MP 到 8.3MP 之间；超过 2560×1440 的分辨率官方仍标记为实验性。

输出格式 `png`（默认）/ `jpeg` / `webp`，`jpeg` / `webp` 可用 `output_compression` 控制体积；透明背景需 `background: "transparent"` 搭配 `png` 或 `webp`。流式出图 `stream: true` + `partial_images`（0～3）照常可用。官方模型页列出的端点是 `v1/images/generations` 与 `v1/images/edits`，支持 mask 局部重绘。

<Warning>
  `quality` 的 `xhigh` / `max` 是新档位，OpenAI 未公布逐尺寸每张价。API易 2026-09-09 在 1024×1024 实测：2.5 两款 `low` 196 / `medium` 439 / `high` 1,756 / `xhigh` 3,122 / `max` 7,024 个输出 token，也就是 `max` 才对应 gpt-image-2 的 `high`（7,024），同样写 `high` 在 2.5 上只有四分之一的 token。从 gpt-image-2 迁移时别原样照搬 `quality`，先用 `usage.output_tokens` 核一轮。
</Warning>

## 实际应用

### 代码示例

把现有 `gpt-image-2` 代码的 `model` 改掉即可，其余字段不动：

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 日常批量出图：Flare
resp = client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="深秋清晨的京都小巷，石板路带着薄雾，电影感构图",
    size="1536x1024",
    quality="high",
    output_format="jpeg",
    output_compression=85
)
with open("flare.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))

# 精修编辑：Sunburst
resp = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=[open("product.png", "rb"), open("scene.png", "rb")],
    prompt="把图1的商品放到图2的桌面上，保留商品标签文字，光影与图2一致",
    size="1024x1024",
    quality="xhigh"
)
with open("sunburst.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### 最佳实践

<Info>
  **生产环境建议**：

  * 默认走 `gpt-image-2.5-flare`，编辑类任务或成品级大图再切 `gpt-image-2.5-sunburst`
  * 生产代码锁定日期快照 `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08`，别名后续指向变化时不会被动跟着变
  * `quality` 先用 `high` 跑通再考虑 `xhigh` / `max`，两档新画质的成本以实测 `usage` 为准
  * Sunburst 生成时间更长，客户端超时按 `gpt-image-2` 的经验值 360 秒起步配置
  * 与 `gpt-image-2` 一样，`input_fidelity` 参数不要传，编辑场景默认高保真
</Info>

## 价格与可用性

### 定价信息

API易 官转两款模型单价与 OpenAI 官网一致，且与 `gpt-image-2` 逐项相同：

| 计费项  | 单价（每百万 tokens）      |
| ---- | ------------------- |
| 文本输入 | \$5.00（缓存命中 \$1.25） |
| 图片输入 | \$8.00（缓存命中 \$2.00） |
| 图片输出 | \$30.00             |

按 token 计费意味着 `low` / `medium` / `high` 三档在 1K 尺寸下的每张参考价与 `gpt-image-2` 一致（1024×1024 分别约 \$0.006 / \$0.053 / \$0.211），完整成本表见 [gpt-image-2 官转接入指南](/api-capabilities/gpt-image-2/overview)。`xhigh` / `max` 与 2K / 4K 无固定每张价，以每次响应的 `usage.output_tokens` 为准。

### 分组与官逆姐妹模型

| 模型                       | 通道              | 分组                                           | 计费           |
| ------------------------ | --------------- | -------------------------------------------- | ------------ |
| `gpt-image-2.5-flare`    | 官转              | `Default` / `image2Enterprise`（1.2x）/ `svip` | 按 tokens     |
| `gpt-image-2.5-sunburst` | 官转              | `Default` / `image2Enterprise`（1.2x）/ `svip` | 按 tokens     |
| `gpt-image-2.5-all`      | 官逆（ChatGPT 网页版） | `Default`                                    | \$0.03 / 张按次 |

`Default` 分组可直接调用；对稳定性要求高的生产任务可选 `image2Enterprise` 企业分组，供给更稳，两个分组下模型名与端点不变。官逆侧同步推出 `gpt-image-2.5-all`，来源为 ChatGPT 网页版，价格与 `gpt-image-2-all` 相同，接入方式见 [gpt-image-2-all 官逆接入指南](/api-capabilities/gpt-image-2-all/overview)。

### 叠加网站充值活动

官转单价与官网一致，折扣体现在充值加赠上，叠加后实付低于官网直连。详情见 [充值活动说明](/faq/recharge-promotions)。

## 总结与建议

GPT-image-2.5 这一代的核心变化不是「更大」，而是**按场景拆成两款**：Flare 用更低的时延覆盖绝大多数日常出图，Sunburst 把编辑精度和画质上限再往上推一格，而两款价格与 `gpt-image-2` 保持一致。对已经在用 `gpt-image-2` 的团队，这是一次几乎零成本的升级。

* ✅ **批量出图、社交内容、商品图**：直接把 `gpt-image-2` 换成 `gpt-image-2.5-flare`，更快且画质不降
* ✅ **多轮精修、成品级营销物料**：用 `gpt-image-2.5-sunburst`，编辑指令执行更准、主体保留更好
* ✅ **预算敏感、不挑尺寸**：`gpt-image-2.5-all` 按次 \$0.03 一张，适合原型验证
* ⚠️ **新画质档位先实测**：`xhigh` / `max` 的成本没有官方每张价，上生产前用 `usage` 核一遍

<Info>
  **信息来源与日期**：

  * OpenAI 官方发布：`openai.com/index/introducing-chatgpt-images-2-5`
  * OpenAI 模型页：`developers.openai.com/api/docs/models/gpt-image-2.5-flare`、`developers.openai.com/api/docs/models/gpt-image-2.5-sunburst`
  * OpenAI 图像生成指南：`developers.openai.com/api/docs/guides/image-generation`
  * 数据获取日期：2026 年 9 月 9 日
</Info>
