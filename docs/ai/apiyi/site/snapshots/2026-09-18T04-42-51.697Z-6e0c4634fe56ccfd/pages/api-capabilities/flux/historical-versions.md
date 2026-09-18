> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX 历史版本

> FLUX.1 [pro] / [pro] 1.1 / [pro] 1.1 Ultra / [dev] 历史版本规格、定价与迁移到 FLUX.2 的建议

<Note>
  本页仅记录 APIYI **仍可调用**的 FLUX.1 \[pro] 系列文生图模型。最新一代 FLUX.2 与图编辑专用 FLUX.1 Kontext 见 [FLUX 总览](/api-capabilities/flux/overview)。
</Note>

## 版本一览

| 版本 ID                | 发布时间 (UTC+0) | APIYI 单价   | 状态     | 推荐使用场景          |
| -------------------- | ------------ | ---------- | ------ | --------------- |
| `flux-pro-1.1-ultra` | 2024-11      | \$0.0500/次 | 🟡 维护中 | 老项目超高分辨率（4MP）   |
| `flux-pro-1.1`       | 2024-10      | \$0.0350/次 | 🟡 维护中 | 老项目文生图标杆        |
| `flux-pro`           | 2024-08      | \$0.0400/次 | 🟡 维护中 | 初代 pro，老接入兼容    |
| `flux-dev`           | 2024-08      | \$0.0200/次 | 🟡 维护中 | 开发/测试，开源权重可本地部署 |

<Tip>
  **新项目建议直接用 FLUX.2**：`flux-2-pro` 与 `flux-pro-1.1` 同档位但画质、多图、长 prompt、4MP 全面提升，价格相近甚至更低。详见下方迁移建议。
</Tip>

## 各版本详细规格

### `flux-pro-1.1-ultra`

* **发布时间**：2024-11（UTC+0）
* **APIYI 单价**：\$0.0500/次（官方 \$0.06，节省 17%）
* **最大输出分辨率**：约 4MP（FLUX.1 系列里最高）
* **核心特性**：超高分辨率、可选 raw 模式（更接近真实摄影质感）
* **已知限制**：单参考图、无 hex 色控、无 grounding search
* **官方介绍**：`docs.bfl.ai/flux_models/flux_1_1_pro_ultra_raw`

### `flux-pro-1.1`

* **发布时间**：2024-10（UTC+0）
* **APIYI 单价**：\$0.0350/次（官方 \$0.04，节省 12.5%）
* **最大输出分辨率**：约 1.6MP（1024×1536 等）
* **核心特性**：在 1.0 基础上提升画质和提示词遵循，行业标杆
* **已知限制**：单参考图、prompt 短（无 32K）
* **官方介绍**：`docs.bfl.ai/flux_models/flux_1_1_pro`

### `flux-pro`

* **发布时间**：2024-08（UTC+0）
* **APIYI 单价**：\$0.0400/次（官方 \$0.04，同价）
* **最大输出分辨率**：约 1.6MP
* **核心特性**：BFL 第一代商用 pro，文生图基础款
* **已知限制**：画质和遵循度低于 1.1，新项目无理由继续使用

### `flux-dev`

* **APIYI 单价**：\$0.0200/次
* **最大输出分辨率**：约 1MP
* **核心特性**：开源权重版（FLUX.1 \[dev]，非商用 license），可本地部署
* **已知限制**：质量低于 \[pro] 系列，主要用于研究、原型、本地推理验证
* **官方权重**：`huggingface.co/black-forest-labs/FLUX.1-dev`

## 迁移建议

<Steps>
  <Step title="评估差异">
    FLUX.2 全面替代 FLUX.1 \[pro]：4MP 输出（vs 1.6MP）、最多 8 张多参考图（vs 1 张）、32K tokens prompt（vs 短）、原生 hex 色控、文字渲染特化。价格在 1MP 内同档位下基本持平甚至更低。
  </Step>

  <Step title="并行对照">
    拿同一批 prompt 在 `flux-pro-1.1` 与 `flux-2-pro` 各跑一轮，重点对比：文字清晰度、多对象一致性、品牌色还原。多数场景 FLUX.2 \[pro] 全面胜出。
  </Step>

  <Step title="渐进切换">
    业务流量先 10% 切到 `flux-2-pro`，观察质量与成本一周后逐步全量。低分辨率（1MP 内）单价基本持平、4MP 场景 FLUX.2 显著更便宜。
  </Step>

  <Step title="处理参数差异">
    多数参数兼容，但需注意：

    * FLUX.1 \[pro] 系列单参考图，FLUX.2 支持多参考图（JSON 字段 `input_image` \~ `input_image_8`，最多 8 张）
    * FLUX.1 不支持 `prompt_upsampling`，FLUX.2 \[pro/max/flex] 支持
    * 老版的部分自定义比例标识（如 `aspect_ratio`）在 FLUX.2 中改用 `width`/`height` 或 `size` 字符串
  </Step>
</Steps>

## 旧版调用示例

```python theme={null}
{/* 调用任意历史版本，仅 model 字段不同，其余参数与 OpenAI Images API 兼容 */}
from openai import OpenAI
import requests

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="flux-pro-1.1-ultra",
    prompt="A serene mountain landscape at golden hour, raw photo style",
    size="2048x1536"
)

# data[0].url 仅 10 分钟有效
url = resp.data[0].url
with open("legacy.jpg", "wb") as f:
    f.write(requests.get(url, timeout=30).content)
```

## 计费差异

按典型用量估算（每张固定单价）：

| 版本                   | APIYI 单价   | 100 张      | 1,000 张     | 10,000 张     |
| -------------------- | ---------- | ---------- | ----------- | ------------ |
| `flux-pro-1.1-ultra` | \$0.05     | \$5.00     | \$50.00     | \$500.00     |
| `flux-pro-1.1`       | \$0.035    | \$3.50     | \$35.00     | \$350.00     |
| `flux-pro`           | \$0.04     | \$4.00     | \$40.00     | \$400.00     |
| `flux-dev`           | \$0.02     | \$2.00     | \$20.00     | \$200.00     |
| **`flux-2-pro`（新版）** | **\$0.03** | **\$3.00** | **\$30.00** | **\$300.00** |
| **`flux-2-max`（新版）** | **\$0.07** | **\$7.00** | **\$70.00** | **\$700.00** |

<Info>
  **如何选**：新项目优先 FLUX.2（`flux-2-pro` 综合最优，`flux-2-max` 旗舰）。仅当老项目对接已固化、不便回归测试时，再继续维持 FLUX.1 \[pro] 系列调用。`flux-dev` 可继续作为开发环境的低成本占位选项。
</Info>

## 相关文档

* [FLUX 总览](/api-capabilities/flux/overview) - 全模型矩阵与选型
* [文生图 Playground](/api-capabilities/flux/text-to-image) - FLUX.2 + FLUX.1 通用调试
* [图片编辑 Playground](/api-capabilities/flux/image-edit) - 多图融合 + 编辑
