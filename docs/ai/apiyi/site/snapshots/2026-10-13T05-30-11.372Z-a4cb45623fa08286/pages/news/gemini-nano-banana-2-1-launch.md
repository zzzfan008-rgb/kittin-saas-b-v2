> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 上线：4K 按次 $0.05

> 谷歌 Nano Banana 2.1（gemini-nano-banana-2.1）正式版上线 API易：竞技场文生图比 Nano Banana 2 高 67 分，官方图片输出价减半。按次 $0.05（4K 同价），按量 1K 约 $0.03。

## 核心要点

* **画质更好，排名跃升**：Arena 文生图榜得分 1328，比 Nano Banana 2 高 67 分、比 Nano Banana Pro 高 80 分；图片编辑榜 1428，也高于前两者
* **官方图片输出价减半**：图片输出从 \$60 降到 \$30 每百万 tokens，但输入从 \$0.50 涨到 \$1.50，4K 单张 tokens 也从 2520 增加到 3780
* **API易 两种计费**：按次 \$0.05/次（1K / 2K / 4K 同价）；按量输入 \$0.66、输出 \$13.2 每百万 tokens，线上实测 1K 单张约 \$0.021–\$0.033
* **选法很简单**：1K / 2K 选按量更低，4K 选按次更省
* **迁移注意**：不支持 512px；默认就会思考，思考 tokens 计入输出费用；Nano Banana 2 继续可用、价格不变

## 背景介绍

2026 年 2 月，谷歌发布 Nano Banana 2（`gemini-3.1-flash-image`），用 Flash 级速度和成本做出接近 Pro 的画质，很快成为 API易 用量最大的图片模型之一。

10 月 6 日，谷歌发布它的升级版 **Nano Banana 2.1**，模型 ID 为 `gemini-nano-banana-2.1`，发布即为正式版（GA）。谷歌在官方文档中把它定位为图像生成的「主力模型」，并建议所有新项目直接使用 2.1。

需要说明的是，谷歌官方弃用表里 `gemini-3.1-flash-image` 目前**没有公布下线日期**，只是把 2.1 列为推荐替代。网上有文章称 Nano Banana 2 将于 10 月 29 日下线，与官方表格不符，以官方为准。

## 详细解析

### 性能基准

以下为 Arena（原 LMArena）公开榜单截至 2026-10-06 的数据。2.1 刚上榜，投票数较少，分数仍处于初步阶段：

| 榜单 | Nano Banana 2.1 | Nano Banana 2 | Nano Banana Pro |
| - | - | - | - |
| 文生图得分 | **1328**（第 5） | 1261（第 11） | 1248（第 16） |
| 图片编辑得分 | **1428**（第 6） | 1387（第 14） | 1390（第 12） |
| 文生图投票数 | 5,312 | 59,779 | 174,996 |

几点解读：

* 2.1 在两个榜单上都**超过了自家的 Pro**，Nano Banana 系列的「性价比款画质不如旗舰款」的格局被打破
* 榜首仍是 OpenAI 的 `gpt-image-2.5` 系列；文生图第 4 到第 6 名（MAI-Image-2.6、Nano Banana 2.1、Grok Imagine 2.0）误差区间重叠，可视为同一梯队
* 2.1 的优势在于**同档画质下价格最低**：按次 \$0.05 也能出 4K

### 核心特性

<CardGroup cols={2}>
  <Card title="画质与文字渲染" icon="sparkles">
    视觉质量、图中文字准确度提升，修复了上一代的平铺伪影
  </Card>

  <Card title="多轮编辑一致性" icon="repeat">
    对话式多轮编辑时角色和画面更稳定，最多 4 张角色参考图
  </Card>

  <Card title="三档思考" icon="brain">
    minimal / medium / high，默认 medium；上一代只有 minimal / high
  </Card>

  <Card title="多参考图融合" icon="layers">
    最多 10 张物体参考 + 4 张角色参考 + 3 张风格参考
  </Card>
</CardGroup>

### 与 Nano Banana 2 的规格对比

| 对比项 | Nano Banana 2.1 | Nano Banana 2 |
| - | - | - |
| 模型 ID | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image` |
| 分辨率 | 1K / 2K / 4K | 512 / 1K / 2K / 4K |
| 宽高比 | 14 种 | 14 种 |
| 4K 单张输出 tokens | 3780 | 2520 |
| 思考档位（默认） | minimal / medium / high（medium） | minimal / high（minimal） |
| 输入模态 | 文本、图片、视频、PDF | 文本、图片 |
| 官方价：输入 | \$1.50 / M | \$0.50 / M |
| 官方价：文本与思考输出 | \$7.50 / M | \$3 / M |
| 官方价：图片输出 | \$30 / M | \$60 / M |
| 官方价：4K 每张 | \$0.113 | \$0.151 |

### 我们实测发现的三个细节

2026-10-07 我们在生产网关上做了约 30 次实测：

1. **默认就在思考**：不传任何思考参数，每次也会产生约 530–960 个 `thoughtsTokenCount`，再加上约 230–400 个非图片输出 tokens。这些都计入输出费用，所以**按图片 tokens 估算成本会低估 20%–40%**。开 `high` 只多约 30% 思考 tokens，4K 单张贵约 6%。
2. **不支持 512**：传 `"imageSize": "512"` 会直接返回 400（不计费）。从 Nano Banana 2 迁移时，代码里用了 512 的要先改成 `1K`。
3. **尺寸和上一代不完全一样**：不传 `aspectRatio` 时模型按内容自选比例（风景类多为 16:9，海报类多为 2:3 或 3:4）；8:1 在 1K 下是 2928×352，而 Nano Banana 2 是 3072×384。前端预留尺寸时不要照搬旧表。

## 实际应用

### 推荐场景

* **电商与营销物料**：海报、商品主图、带文字的 Banner，文字渲染提升最直接
* **多轮改图**：先出初稿再逐步调整，角色和画面一致性更好
* **批量出 4K 图**：按次 \$0.05 不区分分辨率，4K 越多越划算
* **实时信息类图片**：挂 Google 搜索画天气卡、行情图（每次检索另收 \$0.014）

### 代码示例

```python theme={null}
import base64
import requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
    headers={"Authorization": "Bearer sk-your-apiyi-key"},
    json={
        "contents": [{"parts": [{"text": "一张咖啡店开业海报，标题「秋日限定」，暖色调，4K"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "3:4", "imageSize": "4K"},
        },
    },
    timeout=360,
).json()

# parts 的顺序不固定，取最后一个图片段
image = [p for p in resp["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]
with open("poster.png", "wb") as f:
    f.write(base64.b64decode(image["inlineData"]["data"]))
```

### 最佳实践

* **显式传 `imageSize` 和 `aspectRatio`**，否则比例由模型决定、按量费用也不可控
* **超时设到 360 秒**：实测 4K 多在 30–50 秒，个别超过 2 分钟
* **不要写死 `parts[0]`**：遍历 `parts` 取最后一个含 `inlineData` 的段
* **从 Nano Banana 2 迁移只需两步**：改模型名、把 512 改成 1K；请求和返回格式不变

## 价格与可用性

### 定价信息

API易 同时提供按次和按量两种计费，在创建令牌时选择计费模式：

| 计费方式 | API易 | 谷歌官方 |
| - | - | - |
| 按次 | **\$0.05/次**（1K / 2K / 4K 同价） | 4K \$0.113/张 |
| 按量·输入 | \$0.66 / M tokens | \$1.50 / M tokens |
| 按量·输出（图片、文本、思考统一） | \$13.2 / M tokens | 图片 \$30 / M，文本与思考 \$7.50 / M |

按量计费的单张费用**有高有低**。以下是 2026-10-07 当天 60 次线上按量请求的实际扣费：

| 分辨率 | 最低 | 中位 | 最高 | 对比按次 |
| - | - | - | - | - |
| 1K | \$0.021 | \$0.029 | \$0.033 | \$0.05 |
| 2K | \$0.033 | \$0.036 | \$0.058 | \$0.05 |
| 4K | \$0.061 | \$0.063 | \$0.067 | \$0.05 |

<Tip>
  **一句话选法**：出 1K / 2K 选按量，单张通常 \$0.02–\$0.04；出 4K 选按次，固定 \$0.05。一次塞 10 张以上参考图时，输入 tokens 会把按量费用推到 \$0.05 附近，这类请求也建议走按次。
</Tip>

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

可用分组：`Default`（1.0x）与 `NB-Enterprise`（1.4x 兜底通道）。Nano Banana 2 继续可用、价格不变（按次 \$0.055）。

### 叠加网站充值活动

以上价格可以再叠加 API易 的充值加赠活动，实际成本更低，详见 [充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Nano Banana 2.1 是一次「画质上去、价格下来」的升级：竞技场分数超过了自家的 Pro，官方图片输出价却减半。在 API易 上，**4K 按次只要 \$0.05**，比 Nano Banana 2 的 \$0.055 还便宜。

* **新项目**：直接用 Nano Banana 2.1
* **已在用 Nano Banana 2**：建议切换，改模型名、去掉 512 即可
* **需要 512px 缩略图**：继续用 Nano Banana 2，或用 Nano Banana 2 Lite
* **追求榜单最高画质**：可以对比 `gpt-image-2.5` 系列，价格更高

完整参数、Playground 与 Agent 技能见 [Nano Banana 2.1 生图/编辑](/api-capabilities/gemini-nano-banana-2.1/overview)，上线动态见 [实时动态](/live/2026-10/gemini-nano-banana-2-1)。

<Info>
  **信息来源**（获取日期 2026-10-07）：谷歌 Gemini API 模型页与定价页 `ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1`、`ai.google.dev/gemini-api/docs/pricing`；弃用时间表 `ai.google.dev/gemini-api/docs/deprecations`；Arena 文生图与图片编辑榜 `arena.ai/leaderboard`（数据截至 2026-10-06）；API易 定价接口与生产网关实测（2026-10-07）。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.