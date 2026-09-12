> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX 歷史版本

> FLUX.1 [pro] / [pro] 1.1 / [pro] 1.1 Ultra / [dev] 歷史版本規格、定價與遷移到 FLUX.2 的建議

<Note>
  本頁僅記錄 APIYI **仍可呼叫**的 FLUX.1 \[pro] 系列文生圖模型。最新一代 FLUX.2 與圖編輯專用 FLUX.1 Kontext 見 [FLUX 總覽](/zh-Hant/api-capabilities/flux/overview)。
</Note>

## 版本一覽

| 版本 ID                | 釋出時間 (UTC+0) | APIYI 單價   | 狀態     | 推薦使用場景          |
| -------------------- | ------------ | ---------- | ------ | --------------- |
| `flux-pro-1.1-ultra` | 2024-11      | \$0.0500/次 | 🟡 維護中 | 老專案超高解析度（4MP）   |
| `flux-pro-1.1`       | 2024-10      | \$0.0350/次 | 🟡 維護中 | 老專案文生圖標杆        |
| `flux-pro`           | 2024-08      | \$0.0400/次 | 🟡 維護中 | 初代 pro，老接入相容    |
| `flux-dev`           | 2024-08      | \$0.0200/次 | 🟡 維護中 | 開發/測試，開源權重可本地部署 |

<Tip>
  **新專案建議直接用 FLUX.2**：`flux-2-pro` 與 `flux-pro-1.1` 同檔位但畫質、多圖、長 prompt、4MP 全面提升，價格相近甚至更低。詳見下方遷移建議。
</Tip>

## 各版本詳細規格

### `flux-pro-1.1-ultra`

* **釋出時間**：2024-11（UTC+0）
* **APIYI 單價**：\$0.0500/次（官方 \$0.06，節省 17%）
* **最大輸出解析度**：約 4MP（FLUX.1 系列裡最高）
* **核心特性**：超高解析度、可選 raw 模式（更接近真實攝影質感）
* **已知限制**：單參考圖、無 hex 色控、無 grounding search
* **官方介紹**：`docs.bfl.ai/flux_models/flux_1_1_pro_ultra_raw`

### `flux-pro-1.1`

* **釋出時間**：2024-10（UTC+0）
* **APIYI 單價**：\$0.0350/次（官方 \$0.04，節省 12.5%）
* **最大輸出解析度**：約 1.6MP（1024×1536 等）
* **核心特性**：在 1.0 基礎上提升畫質和提示詞遵循，行業標杆
* **已知限制**：單參考圖、prompt 短（無 32K）
* **官方介紹**：`docs.bfl.ai/flux_models/flux_1_1_pro`

### `flux-pro`

* **釋出時間**：2024-08（UTC+0）
* **APIYI 單價**：\$0.0400/次（官方 \$0.04，同價）
* **最大輸出解析度**：約 1.6MP
* **核心特性**：BFL 第一代商用 pro，文生圖基礎款
* **已知限制**：畫質和遵循度低於 1.1，新專案無理由繼續使用

### `flux-dev`

* **APIYI 單價**：\$0.0200/次
* **最大輸出解析度**：約 1MP
* **核心特性**：開源權重版（FLUX.1 \[dev]，非商用 license），可本地部署
* **已知限制**：品質低於 \[pro] 系列，主要用於研究、原型、本地推理驗證
* **官方權重**：`huggingface.co/black-forest-labs/FLUX.1-dev`

## 遷移建議

<Steps>
  <Step title="評估差異">
    FLUX.2 全面替代 FLUX.1 \[pro]：4MP 輸出（vs 1.6MP）、最多 8 張多參考圖（vs 1 張）、32K tokens prompt（vs 短）、原生 hex 色控、文字渲染特化。價格在 1MP 內同檔位下基本持平甚至更低。
  </Step>

  <Step title="並行對照">
    拿同一批 prompt 在 `flux-pro-1.1` 與 `flux-2-pro` 各跑一輪，重點對比：文字清晰度、多物件一致性、品牌色還原。多數場景 FLUX.2 \[pro] 全面勝出。
  </Step>

  <Step title="漸進切換">
    業務流量先 10% 切到 `flux-2-pro`，觀察品質與成本一週後逐步全量。低解析度（1MP 內）單價基本持平、4MP 場景 FLUX.2 顯著更便宜。
  </Step>

  <Step title="處理引數差異">
    多數引數相容，但需注意：

    * FLUX.1 \[pro] 系列單參考圖，FLUX.2 支援多參考圖（JSON 欄位 `input_image` \~ `input_image_8`，最多 8 張）
    * FLUX.1 不支援 `prompt_upsampling`，FLUX.2 \[pro/max/flex] 支援
    * 老版的部分自定義比例標識（如 `aspect_ratio`）在 FLUX.2 中改用 `width`/`height` 或 `size` 字串
  </Step>
</Steps>

## 舊版呼叫示例

```python theme={null}
{/* 呼叫任意歷史版本，僅 model 欄位不同，其餘引數與 OpenAI Images API 相容 */}
from openai import OpenAI
import requests

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="flux-pro-1.1-ultra",
    prompt="A serene mountain landscape at golden hour, raw photo style",
    size="2048x1536"
)

# data[0].url 僅 10 分鐘有效
url = resp.data[0].url
with open("legacy.jpg", "wb") as f:
    f.write(requests.get(url, timeout=30).content)
```

## 計費差異

按典型用量估算（每張固定單價）：

| 版本                   | APIYI 單價   | 100 張      | 1,000 張     | 10,000 張     |
| -------------------- | ---------- | ---------- | ----------- | ------------ |
| `flux-pro-1.1-ultra` | \$0.05     | \$5.00     | \$50.00     | \$500.00     |
| `flux-pro-1.1`       | \$0.035    | \$3.50     | \$35.00     | \$350.00     |
| `flux-pro`           | \$0.04     | \$4.00     | \$40.00     | \$400.00     |
| `flux-dev`           | \$0.02     | \$2.00     | \$20.00     | \$200.00     |
| **`flux-2-pro`（新版）** | **\$0.03** | **\$3.00** | **\$30.00** | **\$300.00** |
| **`flux-2-max`（新版）** | **\$0.07** | **\$7.00** | **\$70.00** | **\$700.00** |

<Info>
  **如何選**：新專案優先 FLUX.2（`flux-2-pro` 綜合最優，`flux-2-max` 旗艦）。僅當老專案對接已固化、不便迴歸測試時，再繼續維持 FLUX.1 \[pro] 系列呼叫。`flux-dev` 可繼續作為開發環境的低成本佔位選項。
</Info>

## 相關文件

* [FLUX 總覽](/zh-Hant/api-capabilities/flux/overview) - 全模型矩陣與選型
* [文生圖 Playground](/zh-Hant/api-capabilities/flux/text-to-image) - FLUX.2 + FLUX.1 通用除錯
* [圖片編輯 Playground](/zh-Hant/api-capabilities/flux/image-edit) - 多圖融合 + 編輯
