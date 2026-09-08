> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 历史版本

> Seedream 5.0 / 4.5 / 4.0 三版本规格对比、价格差异、迁移建议——三版本都仍可调用，按业务需求选型即可

<Note>
  本页记录 API易**仍可调用**的所有 Seedream 版本。三个版本同时活跃，参数协议**完全兼容**，只需替换 `model` 字段即可切换。最新版本与综合介绍请见 [Seedream 总览](/api-capabilities/seedream-image/overview)。
</Note>

## 版本一览

| 版本 ID                     | 上线日期（UTC+8） | API易 价格   | 状态           | 推荐使用场景                     |
| ------------------------- | ----------- | --------- | ------------ | -------------------------- |
| `seedream-5-0-pro-260628` | 2026-06-28  | \$0.12/次  | 🆕 专业版       | 极致画质 / 复杂指令的专业场景（约 2 分钟出图） |
| `seedream-5-0-260128`     | 2026-01-28  | \$0.035/张 | ✅ 当前推荐（最新）   | 综合体验最优、文字渲染、png 输出         |
| `seedream-4-5-251128`     | 2025-11-28  | \$0.04/张  | ✅ 当前推荐       | 4K 高清 + 强文字渲染（海报、广告）       |
| `seedream-4-0-250828`     | 2025-08-28  | \$0.03/张  | 🟡 维护中（仍可调用） | 4K + 最佳性价比、prompt fast 模式  |

<Tip>
  `seedream-5-0-260128` 也可通过别名 `seedream-5-0-lite-260128` 调用，行为完全一致——官方文档同时承认两个 model\_id 字符串。
</Tip>

## 各版本详细规格

### `seedream-5-0-pro-260628`（5.0 Pro）

* **上线日期**：2026-06-28（UTC+8），API易 2026-07-19 上架
* **API易 价格**：**\$0.12/次**（按次固定价，每次输出 1 张，折扣前约 ￥0.84/次）。官方原价按输出像素分两档（≤2.36M / >2.36M）并对第 2 张起的输入参考图另行收费，API易 简化为按次统一价、不分档、已含输入图费用
* **支持分辨率档位**：预设 `1K` / `2K`（**无 3K/4K 预设**）+ 精确像素 `WxH` 总像素 ≤ **4.19M**（最大 2048×2048，16:9 最长边可达 `2720x1530` ≈ 2.7K，实测可用）
* **输出格式**：`png` / `jpeg`
* **Prompt 优化**：standard / fast
* **核心特性**：
  * 画质与复杂指令遵循为全系最强，支持交互式编辑（坐标 / 选框 / 箭头指定编辑位置）
  * 多图参考融合官方明确**最多 10 张**
* **已知限制**：
  * **不支持 `sequential_image_generation` / `stream`**——传任何值（含 `"disabled"`）都返回 400，请求时不要携带这两个参数
  * 出图慢：实测稳定在 **2 分钟级**（110\~130 秒），客户端超时建议 ≥ 240 秒
  * 单价为 5.0-lite 的 3.4 倍，常规场景建议 5.0-lite

### `seedream-5-0-260128`（5.0-lite）

* **上线日期**：2026-01-28（UTC+8）
* **API易 价格**：\$0.035/张（折扣前约 ￥0.245/张）
* **支持分辨率档位**：`2K` / `3K`（**无 4K**）
* **输出格式**：`png` / `jpeg`（唯一支持 png 输出的版本）
* **Prompt 优化**：standard
* **核心特性**：
  * 综合体验最优，多图融合 / 编辑 / 批量序列协议成熟
  * 唯一支持 `png` 输出（可输出透明背景）
  * 流式输出（`stream: true`）成熟可用
* **已知限制**：
  * 分辨率上限 3K（≈3072×3072），需要 4K 物料请用 4.5 / 4.0
* **官方介绍**：`docs.byteplus.com/en/docs/ModelArk/1824121`

### `seedream-4-5-251128`

* **上线日期**：2025-11-28（UTC+8）
* **API易 价格**：\$0.04/张（折扣前约 ￥0.28/张）
* **支持分辨率档位**：`2K` / `4K`
* **输出格式**：`jpeg`
* **Prompt 优化**：standard
* **核心特性**：
  * 12 亿参数统一生成-编辑架构
  * **文本渲染突破**：小文本清晰可读，海报、广告、UI 截图场景表现领先
  * 多图融合官方明确"最多 10 张参考图"
  * 编辑时保留光照、色调、面部特征自然
* **已知限制**：
  * 仅 `jpeg` 输出（无 `png`，不支持透明背景）
* **News 文章**：[Seedream 4.5 上线公告](/news/seedream-4-5-launch)

### `seedream-4-0-250828`

* **上线日期**：2025-08-28（UTC+8）
* **API易 价格**：\$0.03/张（折扣前约 ￥0.21/张）
* **支持分辨率档位**：`1K` / `2K` / `4K`（分辨率覆盖最全）
* **输出格式**：`jpeg`
* **Prompt 优化**：standard / **fast**（唯一支持 fast 模式）
* **核心特性**：
  * 经过验证的稳定版本
  * 优秀的视觉一致性，4K 出图细节均衡
  * **唯一支持 prompt fast 模式**，对预算敏感的场景出图更快
* **已知限制**：
  * 文本渲染弱于 4.5
  * 仅 `jpeg` 输出

## 迁移建议

<Steps>
  <Step title="评估差异">
    本系列三个版本**参数协议完全兼容**——只需替换 `model` 字段即可切换。重点核对：

    * 你用的 `size` 档位是否在新版本支持列表里（5.0 没有 1K / 4K，4.5 没有 1K，4.0 全支持）
    * 你是否依赖 `output_format: "png"`（仅 5.0 支持）
    * 你是否用 `prompt_optimization: "fast"`（仅 4.0 支持）
  </Step>

  <Step title="并行对照">
    拿同一批 prompt 在新旧版本各跑一轮，对比效果与成本。建议先小批量（10-20 张）验证质量再切量。
  </Step>

  <Step title="渐进切换">
    把流量按比例切（如 10% / 50% / 100% 三档），每档观察一段时间画质、失败率、成本，再放量。
  </Step>

  <Step title="保留 fallback">
    生产环境建议同时保留新旧两个 `model` 配置，新版出现问题时可一键回退到旧版。三个版本统一计费，并行使用没有额外成本。
  </Step>
</Steps>

## 旧版调用示例

```python theme={null}
{/* 切换版本只需改 model 字段，其它参数兼容 */}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="seedream-4-0-250828",   # 切到 4.5 / 5.0 只换这一行
    prompt="A serene mountain landscape at golden hour, snow-capped peaks, ultra detailed, 4K",
    size="4K",                      # 注意：5.0 不支持 4K，需改 2K 或 3K
    response_format="url",
    extra_body={
        "watermark": False,
    }
)

print(resp.data[0].url)
```

## 计费差异

按典型用量估算（**未叠加充值加赠折扣**，叠加后实际可低至 8 折）：

| 版本                        | 单价       | 100 张 | 1000 张 | 10000 张 |
| ------------------------- | -------- | ----- | ------ | ------- |
| `seedream-5-0-pro-260628` | \$0.12/次 | \$12  | \$120  | \$1200  |
| `seedream-5-0-260128`     | \$0.035  | \$3.5 | \$35   | \$350   |
| `seedream-4-5-251128`     | \$0.04   | \$4   | \$40   | \$400   |
| `seedream-4-0-250828`     | \$0.03   | \$3   | \$30   | \$300   |

<Info>
  **如何选**：

  * 4K 物料 + 强文字 → **4.5**
  * 4K 物料 + 性价比 → **4.0**
  * 综合体验最优 / png 输出 / 透明背景 → **5.0**
  * 大批量稳定生产 → **4.0**（已验证 + 最便宜 + fast 模式）
  * 极致画质 / 复杂指令的专业场景 → **5.0-pro**（\$0.12/次 + 约 2 分钟出图，非专业场景不建议）
</Info>

## 兼容性对照表

| 维度                            | 5.0-pro          | 5.0 | 4.5          | 4.0 | 迁移注意                                          |
| ----------------------------- | ---------------- | --- | ------------ | --- | --------------------------------------------- |
| `1K` 分辨率档位                    | ✅                | ❌   | ❌            | ✅   | 从 4.0 升级到 5.0-lite 时如用 1K，需改 2K               |
| `4K` 分辨率档位                    | ❌                | ❌   | ✅            | ✅   | 从 4.5 / 4.0 切到 5.0 系时如用 4K，需改档位               |
| `output_format: "png"`        | ✅                | ✅   | ❌            | ❌   | 从 5.0 系切到 4.5 / 4.0 时如依赖 png 透明背景，**画面会丢失透明** |
| `prompt_optimization: "fast"` | ✅                | ❌   | ❌            | ✅   | 5.0-lite / 4.5 不支持 fast，切换时需删除该参数             |
| `image` 数组（多图融合）              | ✅（最多 10 张明确）     | ✅   | ✅（最多 10 张明确） | ✅   | 协议一致                                          |
| `sequential_image_generation` | ❌（**传任何值即 400**） | ✅   | ✅            | ✅   | 切到 pro 时必须删除该参数（含 `"disabled"`）               |
| `stream` 流式                   | ❌（传入即 400）       | ✅   | ✅            | ✅   | 切到 pro 时必须删除该参数                               |
| 响应字段（`url` / `b64_json`）      | 一致               | 一致  | 一致           | 一致  | —                                             |
| 计费方式                          | **按次 \$0.12**    | 按张  | 按张           | 按张  | —                                             |

## 相关文档

* [Seedream 总览](/api-capabilities/seedream-image/overview)
* [文生图 Playground](/api-capabilities/seedream-image/text-to-image)
* [图片编辑 Playground](/api-capabilities/seedream-image/image-edit)
* [Seedream 4.5 上线公告](/news/seedream-4-5-launch)
* BytePlus 官方 tutorial：`docs.byteplus.com/en/docs/ModelArk/1824121`
