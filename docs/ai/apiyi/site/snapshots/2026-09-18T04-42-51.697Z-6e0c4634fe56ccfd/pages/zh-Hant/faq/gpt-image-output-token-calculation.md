> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 輸出 token 為什麼這麼高？

> 解釋 GPT Image 的輸入與輸出 token 如何區分，以及解析度、品質、寬高比和生成數量為什麼會顯著影響圖片費用。

## 簡短回答

這是正常現象。GPT Image 的 4K + `high` 本身就是高成本組合，即使只輸出一張圖片，也可能產生大量 `output_tokens`。

圖片輸出 token 不是按“最終檔案只有一張”或“總畫素數簡單等比例”計算，而是主要由以下因素共同決定：

1. `quality`：`low`、`medium`、`high` 或 `auto`
2. 輸出尺寸與寬高比
3. 生成數量 `n`
4. 模型內部對畫布的劃分和影像複雜度

<Info>
  `usage.output_tokens` 標註的是**模型生成輸出圖片所消耗的影像 token**，不是參考圖輸入。參考圖消耗會單獨記錄在 `usage.input_tokens_details.image_tokens` 中。
</Info>

## 為什麼只輸出一張圖也會有大量 token

“一張圖片”只表示結果數量，不表示生成工作量小。模型需要在內部影像表示空間中生成整張畫布，畫質越高、解析度越大，需要計算和輸出的影像 token 通常越多。

例如以下兩次呼叫都只返回一張圖，但成本可能相差數倍：

```json theme={null}
{
  "size": "1024x1024",
  "quality": "low",
  "n": 1
}
```

```json theme={null}
{
  "size": "3840x2160",
  "quality": "high",
  "n": 1
}
```

第二個請求仍然只生成一張圖，但使用了 4K 橫版畫布和高品質檔位，輸出 token 明顯更高是預期行為。

## 四個主要影響因素

### 1. 品質引數 `quality`

`quality` 通常是最明顯的成本變數：

| 引數       | 特點           | 輸出 token 趨勢 |
| -------- | ------------ | ----------- |
| `low`    | 快速預覽、草稿      | 最低          |
| `medium` | 品質與成本平衡      | 中等          |
| `high`   | 精細紋理、文字和複雜細節 | 最高          |
| `auto`   | 模型自行選擇檔位     | 每次可能不同      |

<Warning>
  如果使用 `quality: "auto"` 或不傳 `quality`，模型可能根據提示詞自動選擇不同檔位。即使尺寸和參考圖完全相同，不同請求的 `output_tokens` 也可能相差數倍。需要穩定預算時，請顯式指定 `low`、`medium` 或 `high`。
</Warning>

專案中已有真實記錄：三次請求的輸入都為 1061 token，但輸出分別為 1286、5146 和 1287 token。中間一次因自動選擇了更高畫質，費用約為其他兩次的 3.5 倍。

### 2. 輸出尺寸

解析度越高，通常需要覆蓋的內部畫布越大，因此輸出 token 越多。4K `high` 會比 1K `low` 貴很多。

但不能直接使用以下公式精確預測：

```text theme={null}
輸出 token = 寬 × 高 × 固定係數
```

畫素數量只能用於粗略估算。真正的 `output_tokens` 由模型在生成時返回，應以響應中的 `usage.output_tokens` 為準。

### 3. 寬高比與內部畫布劃分

輸出 token 還受內部畫布如何分塊、縮放和覆蓋影響。因此，token 與最終畫素總數並不總是嚴格單調對應。

同一品質下，更大的非正方形圖片有時可能比更小或更接近正方形的圖片消耗更少的輸出 token。這並不矛盾，而是因為模型內部使用的是離散畫布或分塊規則，不是簡單按最終畫素逐個計費。

<Tip>
  比較不同尺寸時，應該同時看 `quality` 和寬高比，不能只看“4K”“2K”標籤或畫素總量。
</Tip>

### 4. 生成數量 `n`

通用規則下，生成數量越多，總輸出 token 越高；生成 N 張圖片相當於承擔 N 份輸出成本。

不過，當前 `gpt-image-2` 僅支援 `n=1`。需要多張圖片時，應發起多次獨立請求，每次都單獨計算輸入和輸出 token。其他圖片模型是否支援 `n>1`，以對應模型文件為準。

## 參考圖多會影響哪個 token

參考圖數量主要增加的是**輸入圖片 token**，不是輸出圖片 token：

| 欄位                                         | 代表什麼           |
| ------------------------------------------ | -------------- |
| `usage.input_tokens_details.text_tokens`   | 提示詞文本輸入        |
| `usage.input_tokens_details.image_tokens`  | 參考圖輸入          |
| `usage.output_tokens_details.image_tokens` | 生成結果圖片輸出       |
| `usage.output_tokens`                      | 本次所有圖片輸出 token |

`gpt-image-2` 對參考圖採用高保真處理。參考圖張數會近似線性增加輸入 image token，但最終輸出圖的 `output_tokens` 仍主要由輸出品質、尺寸、寬高比和模型內部生成過程決定。

因此，如果日誌明確顯示高消耗位於“輸出圖片”，就不能歸因於參考圖數量。參考圖費用應在輸入圖片 token 中單獨看到。

## 如何計算真實費用

以 `gpt-image-2` 當前計費口徑為例：

```text theme={null}
總費用
= 文本輸入 token × 文本輸入單價
+ 參考圖輸入 token × 圖片輸入單價
+ 輸出圖片 token × 圖片輸出單價
```

響應示例：

```json theme={null}
{
  "usage": {
    "input_tokens": 1040,
    "input_tokens_details": {
      "text_tokens": 16,
      "image_tokens": 1024
    },
    "output_tokens": 5146,
    "output_tokens_details": {
      "text_tokens": 0,
      "image_tokens": 5146
    },
    "total_tokens": 6186
  }
}
```

這表示：

* 16 token 來自提示詞
* 1024 token 來自參考圖
* 5146 token 來自最終生成圖片
* 輸出只有一張，但該圖片採用的品質與畫布需要 5146 個輸出 image token

<Info>
  2K 和 4K 沒有適用於所有尺寸與內容的固定每張 token 數。預算表只能用於預估，最終計費應以每次介面響應或控制台日誌中的實際 `usage` 為準。
</Info>

## 如何降低 token 消耗

<Steps>
  <Step title="固定品質檔位">
    不使用 `auto`，明確傳入 `low`、`medium` 或 `high`，避免模型自動升檔導致費用波動。
  </Step>

  <Step title="降低不必要的解析度">
    預覽或內部稽核先用 1K / 2K，最終交付時再生成 4K `high`。
  </Step>

  <Step title="選擇合適的寬高比">
    使用業務真正需要的畫布，不要為了“看起來更高畫質”盲目放大尺寸。
  </Step>

  <Step title="控制生成數量">
    多張候選圖會線性增加總輸出成本。先小批次驗證提示詞，再進行批次生成。
  </Step>

  <Step title="記錄 usage 欄位">
    持久化每次請求的 `size`、`quality`、`output_tokens` 和費用，按實際資料建立自己的成本基線。
  </Step>
</Steps>

## 相關文件

* [GPT-Image-2 概覽與計費說明](/zh-Hant/api-capabilities/gpt-image-2/overview)
* [GPT-Image-2 文生圖 API](/zh-Hant/api-capabilities/gpt-image-2/text-to-image)
* [GPT-Image-2 圖片編輯 API](/zh-Hant/api-capabilities/gpt-image-2/image-edit)
* [如何檢視呼叫記錄？](/zh-Hant/faq/call-logs)
