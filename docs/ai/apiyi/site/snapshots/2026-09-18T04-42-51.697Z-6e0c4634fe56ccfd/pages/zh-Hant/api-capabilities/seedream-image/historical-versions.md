> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 歷史版本

> Seedream 5.0 / 4.5 / 4.0 三版本規格對比、價格差異、遷移建議——三版本都仍可呼叫，按業務需求選型即可

<Note>
  本頁記錄 API易**仍可呼叫**的所有 Seedream 版本。三個版本同時活躍，引數協議**完全相容**，只需替換 `model` 欄位即可切換。最新版本與綜合介紹請見 [Seedream 總覽](/zh-Hant/api-capabilities/seedream-image/overview)。
</Note>

## 版本一覽

| 版本 ID                     | 上線日期（UTC+8） | API易 價格   | 狀態           | 推薦使用場景                     |
| ------------------------- | ----------- | --------- | ------------ | -------------------------- |
| `seedream-5-0-pro-260628` | 2026-06-28  | \$0.12/次  | 🆕 專業版       | 極致畫質 / 複雜指令的專業場景（約 2 分鐘出圖） |
| `seedream-5-0-260128`     | 2026-01-28  | \$0.035/張 | ✅ 當前推薦（最新）   | 綜合體驗最優、文字渲染、png 輸出         |
| `seedream-4-5-251128`     | 2025-11-28  | \$0.04/張  | ✅ 當前推薦       | 4K 高畫質 + 強文字渲染（海報、廣告）      |
| `seedream-4-0-250828`     | 2025-08-28  | \$0.03/張  | 🟡 維護中（仍可呼叫） | 4K + 最佳價效比、prompt fast 模式  |

<Tip>
  `seedream-5-0-260128` 也可通過別名 `seedream-5-0-lite-260128` 呼叫，行為完全一致——官方文件同時承認兩個 model\_id 字串。
</Tip>

## 各版本詳細規格

### `seedream-5-0-pro-260628`（5.0 Pro）

* **上線日期**：2026-06-28（UTC+8），API易 2026-07-19 上架
* **API易 價格**：**\$0.12/次**（按次固定價，每次輸出 1 張，折扣前約 ￥0.84/次）。官方原價按輸出畫素分兩檔（≤2.36M / >2.36M）並對第 2 張起的輸入參考圖另行收費，API易 簡化為按次統一價、不分檔、已含輸入圖費用
* **支援解析度檔位**：預設 `1K` / `2K`（**無 3K/4K 預設**）+ 精確畫素 `WxH` 總畫素 ≤ **4.19M**（最大 2048×2048，16:9 最長邊可達 `2720x1530` ≈ 2.7K，實測可用）
* **輸出格式**：`png` / `jpeg`
* **Prompt 最佳化**：standard / fast
* **核心特性**：
  * 畫質與複雜指令遵循為全系最強，支援互動式編輯（座標 / 選框 / 箭頭指定編輯位置）
  * 多圖參考融合官方明確**最多 10 張**
* **已知限制**：
  * **不支援 `sequential_image_generation` / `stream`**——傳任何值（含 `"disabled"`）都返回 400，請求時不要攜帶這兩個引數
  * 出圖慢：實測穩定在 **2 分鐘級**（110\~130 秒），客戶端超時建議 ≥ 240 秒
  * 單價為 5.0-lite 的 3.4 倍，常規場景建議 5.0-lite

### `seedream-5-0-260128`（5.0-lite）

* **上線日期**：2026-01-28（UTC+8）
* **API易 價格**：\$0.035/張（折扣前約 ￥0.245/張）
* **支援解析度檔位**：`2K` / `3K`（**無 4K**）
* **輸出格式**：`png` / `jpeg`（唯一支援 png 輸出的版本）
* **Prompt 最佳化**：standard
* **核心特性**：
  * 綜合體驗最優，多圖融合 / 編輯 / 批次序列協議成熟
  * 唯一支援 `png` 輸出（可輸出透明背景）
  * 流式輸出（`stream: true`）成熟可用
* **已知限制**：
  * 解析度上限 3K（≈3072×3072），需要 4K 物料請用 4.5 / 4.0
* **官方介紹**：`docs.byteplus.com/en/docs/ModelArk/1824121`

### `seedream-4-5-251128`

* **上線日期**：2025-11-28（UTC+8）
* **API易 價格**：\$0.04/張（折扣前約 ￥0.28/張）
* **支援解析度檔位**：`2K` / `4K`
* **輸出格式**：`jpeg`
* **Prompt 最佳化**：standard
* **核心特性**：
  * 12 億引數統一生成-編輯架構
  * **文本渲染突破**：小文本清晰可讀，海報、廣告、UI 截圖場景表現領先
  * 多圖融合官方明確"最多 10 張參考圖"
  * 編輯時保留光照、色調、面部特徵自然
* **已知限制**：
  * 僅 `jpeg` 輸出（無 `png`，不支援透明背景）
* **News 文章**：[Seedream 4.5 上線公告](/news/seedream-4-5-launch)

### `seedream-4-0-250828`

* **上線日期**：2025-08-28（UTC+8）
* **API易 價格**：\$0.03/張（折扣前約 ￥0.21/張）
* **支援解析度檔位**：`1K` / `2K` / `4K`（解析度覆蓋最全）
* **輸出格式**：`jpeg`
* **Prompt 最佳化**：standard / **fast**（唯一支援 fast 模式）
* **核心特性**：
  * 經過驗證的穩定版本
  * 優秀的視覺一致性，4K 出圖細節均衡
  * **唯一支援 prompt fast 模式**，對預算敏感的場景出圖更快
* **已知限制**：
  * 文本渲染弱於 4.5
  * 僅 `jpeg` 輸出

## 遷移建議

<Steps>
  <Step title="評估差異">
    本系列三個版本**引數協議完全相容**——只需替換 `model` 欄位即可切換。重點核對：

    * 你用的 `size` 檔位是否在新版本支援列表裡（5.0 沒有 1K / 4K，4.5 沒有 1K，4.0 全支援）
    * 你是否依賴 `output_format: "png"`（僅 5.0 支援）
    * 你是否用 `prompt_optimization: "fast"`（僅 4.0 支援）
  </Step>

  <Step title="並行對照">
    拿同一批 prompt 在新舊版本各跑一輪，對比效果與成本。建議先小批次（10-20 張）驗證品質再切量。
  </Step>

  <Step title="漸進切換">
    把流量按比例切（如 10% / 50% / 100% 三檔），每檔觀察一段時間畫質、失敗率、成本，再放量。
  </Step>

  <Step title="保留 fallback">
    生產環境建議同時保留新舊兩個 `model` 配置，新版出現問題時可一鍵回退到舊版。三個版本統一計費，並行使用沒有額外成本。
  </Step>
</Steps>

## 舊版呼叫示例

```python theme={null}
{/* 切換版本只需改 model 欄位，其它引數相容 */}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="seedream-4-0-250828",   # 切到 4.5 / 5.0 只換這一行
    prompt="A serene mountain landscape at golden hour, snow-capped peaks, ultra detailed, 4K",
    size="4K",                      # 注意：5.0 不支援 4K，需改 2K 或 3K
    response_format="url",
    extra_body={
        "watermark": False,
    }
)

print(resp.data[0].url)
```

## 計費差異

按典型用量估算（**未疊加充值加贈折扣**，疊加後實際可低至 8 折）：

| 版本                        | 單價       | 100 張 | 1000 張 | 10000 張 |
| ------------------------- | -------- | ----- | ------ | ------- |
| `seedream-5-0-pro-260628` | \$0.12/次 | \$12  | \$120  | \$1200  |
| `seedream-5-0-260128`     | \$0.035  | \$3.5 | \$35   | \$350   |
| `seedream-4-5-251128`     | \$0.04   | \$4   | \$40   | \$400   |
| `seedream-4-0-250828`     | \$0.03   | \$3   | \$30   | \$300   |

<Info>
  **如何選**：

  * 4K 物料 + 強文字 → **4.5**
  * 4K 物料 + 價效比 → **4.0**
  * 綜合體驗最優 / png 輸出 / 透明背景 → **5.0**
  * 大批次穩定生產 → **4.0**（已驗證 + 最便宜 + fast 模式）
  * 極致畫質 / 複雜指令的專業場景 → **5.0-pro**（\$0.12/次 + 約 2 分鐘出圖，非專業場景不建議）
</Info>

## 相容性對照表

| 維度                            | 5.0-pro          | 5.0 | 4.5          | 4.0 | 遷移注意                                          |
| ----------------------------- | ---------------- | --- | ------------ | --- | --------------------------------------------- |
| `1K` 解析度檔位                    | ✅                | ❌   | ❌            | ✅   | 從 4.0 升級到 5.0-lite 時如用 1K，需改 2K               |
| `4K` 解析度檔位                    | ❌                | ❌   | ✅            | ✅   | 從 4.5 / 4.0 切到 5.0 系時如用 4K，需改檔位               |
| `output_format: "png"`        | ✅                | ✅   | ❌            | ❌   | 從 5.0 系切到 4.5 / 4.0 時如依賴 png 透明背景，**畫面會丟失透明** |
| `prompt_optimization: "fast"` | ✅                | ❌   | ❌            | ✅   | 5.0-lite / 4.5 不支援 fast，切換時需刪除該引數             |
| `image` 陣列（多圖融合）              | ✅（最多 10 張明確）     | ✅   | ✅（最多 10 張明確） | ✅   | 協議一致                                          |
| `sequential_image_generation` | ❌（**傳任何值即 400**） | ✅   | ✅            | ✅   | 切到 pro 時必須刪除該引數（含 `"disabled"`）               |
| `stream` 流式                   | ❌（傳入即 400）       | ✅   | ✅            | ✅   | 切到 pro 時必須刪除該引數                               |
| 響應欄位（`url` / `b64_json`）      | 一致               | 一致  | 一致           | 一致  | —                                             |
| 計費方式                          | **按次 \$0.12**    | 按張  | 按張           | 按張  | —                                             |

## 相關文件

* [Seedream 總覽](/zh-Hant/api-capabilities/seedream-image/overview)
* [文生圖 Playground](/zh-Hant/api-capabilities/seedream-image/text-to-image)
* [圖片編輯 Playground](/zh-Hant/api-capabilities/seedream-image/image-edit)
* [Seedream 4.5 上線公告](/news/seedream-4-5-launch)
* BytePlus 官方 tutorial：`docs.byteplus.com/en/docs/ModelArk/1824121`
