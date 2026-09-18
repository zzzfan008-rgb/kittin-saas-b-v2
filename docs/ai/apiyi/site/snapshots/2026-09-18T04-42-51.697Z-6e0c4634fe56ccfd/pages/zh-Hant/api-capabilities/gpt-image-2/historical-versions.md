> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image 歷史版本

> GPT-Image 系列版本一覽：現役 gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 與歷史版 GPT-Image-1 / 1-mini / 1.5 的模型 ID、釋出時間、計費、端點，以及遷移到 2.5 / 2-All 的建議。

<Info>
  新專案請直接使用 [GPT-Image-2.5 / 2](/zh-Hant/api-capabilities/gpt-image-2/overview)（官方版，文生圖選 `gpt-image-2.5-flare`、改圖選 `gpt-image-2.5-sunburst`）或 [GPT-Image-2-All](/zh-Hant/api-capabilities/gpt-image-2-all/overview)（官逆，\$0.03/張統一價）。本頁面僅保留歷史版本的核心引數，方便老專案排查與遷移。
</Info>

## 版本一覽

| 模型 ID                                      | 釋出時間     | 端點                                          | 價格特點                                                | 狀態                                           |
| ------------------------------------------ | -------- | ------------------------------------------- | --------------------------------------------------- | -------------------------------------------- |
| `gpt-image-2.5-flare`（快照 `-2026-09-08`）    | 2026年9月  | `/v1/images/generations`、`/v1/images/edits` | 輸入 \$5.00 / 輸出 \$30.00 / 百萬 tokens，與 gpt-image-2 相同 | **現役**，速度優先，文生圖預設                            |
| `gpt-image-2.5-sunburst`（快照 `-2026-09-08`） | 2026年9月  | `/v1/images/generations`、`/v1/images/edits` | 同上                                                  | **現役**，畫質與編輯精度優先                             |
| `gpt-image-2`（快照 `-2026-04-21`）            | 2026年4月  | `/v1/images/generations`、`/v1/images/edits` | 輸入 \$5.00 / 輸出 \$30.00 / 百萬 tokens                  | 現役，上一代，`quality` 只到 `high`                   |
| `gpt-image-1.5`                            | 2025年12月 | `/v1/images/generations`                    | 輸入 \$5.00 / 輸出 \$10.00 / 百萬 tokens                  | 仍可用，建議升級至 `gpt-image-2.5-flare` / `sunburst` |
| `gpt-image-1`                              | 2025年4月  | `/v1/images/generations`、`/v1/images/edits` | 輸入 \$2.50 / 輸出 \$8.00 / 百萬 tokens                   | 仍可用，建議升級至 `gpt-image-2.5-flare` / `sunburst` |
| `gpt-image-1-mini`                         | 2025年4月  | `/v1/images/generations`                    | 較 `gpt-image-1` 更低                                  | 仍可用                                          |

<Tip>
  **直接遷移**：把 `model` 改成 `gpt-image-2` 或 `gpt-image-2-all` 即可，引數（`size` / `quality` / `output_format` 等）大體相容，無需改程式碼結構。
</Tip>

## 通用引數（生圖）

歷史版本共享一套生圖引數：

| 引數                   | 說明                                                           |
| -------------------- | ------------------------------------------------------------ |
| `model`              | `gpt-image-1.5` / `gpt-image-1` / `gpt-image-1-mini`         |
| `prompt`             | 影像描述，最長 32,000 字元（原廠上限，按字元計）                                 |
| `size`               | `1024x1024` / `1536x1024` / `1024x1536` / `auto`             |
| `quality`            | `low` / `medium` / `high` / `auto`（2.5 系列另有 `xhigh` / `max`） |
| `output_format`      | `png`（預設） / `jpeg` / `webp`                                  |
| `output_compression` | 僅 JPEG / WebP，0–100%                                         |
| `background`         | `transparent` / `opaque` / `auto`                            |
| `n`                  | 生成數量（1–10）                                                   |

## 快速呼叫示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.images.generate(
    model="gpt-image-1.5",  {/* 也可填 gpt-image-1 / gpt-image-1-mini */}
    prompt="A professional product photo on white background, soft studio lighting",
    size="1024x1024",
    quality="high"
)

print(response.data[0].url)
```

## 按圖片計費參考

GPT-Image-1 / 1.5 同時支援 Token 計費與按圖片計費，系統自動取較優方式：

### GPT-Image-1.5

| 品質     | 1024×1024 | 1024×1536 / 1536×1024 |
| ------ | --------- | --------------------- |
| Low    | \$0.009   | \$0.013               |
| Medium | \$0.034   | \$0.050               |
| High   | \$0.133   | \$0.200               |

### GPT-Image-1

| 品質     | 1024×1024 | 1024×1536 / 1536×1024 |
| ------ | --------- | --------------------- |
| Low    | \$0.005   | \$0.006               |
| Medium | \$0.011   | \$0.015               |
| High   | \$0.036   | \$0.052               |

<Warning>
  按圖片計費僅作參考。實際扣費以系統自動選擇的更優方式（Token 或按圖片）為準。
</Warning>

## 影像編輯（僅 `gpt-image-1`）

`gpt-image-1` 支援基於遮罩的局部編輯端點 `/v1/images/edits`：

```python theme={null}
response = client.images.edit(
    model="gpt-image-1",
    image=open("original.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A modern glass skyscraper with reflective windows",
    size="1024x1024"
)
```

| 引數       | 說明                                 |
| -------- | ---------------------------------- |
| `image`  | 原圖，PNG/WebP/JPG，單張 \< 50MB，最多 16 張 |
| `mask`   | 遮罩圖，alpha=0 的區域將被重繪                |
| `prompt` | 描述要在遮罩區生成的內容                       |

<Note>
  新專案編輯場景推薦使用 [GPT-Image-2 編輯](/zh-Hant/api-capabilities/gpt-image-2/image-edit)（官方）或 [GPT-Image-2-All 編輯](/zh-Hant/api-capabilities/gpt-image-2-all/image-edit)（官逆，最多 16 張多圖融合）。
</Note>

## 遷移到 GPT-Image-2.5 / 2-All

| 你的訴求                        | 推薦遷移到                                                       |
| --------------------------- | ----------------------------------------------------------- |
| 沿用 OpenAI 官方端點、需要精確尺寸/品質控制  | `gpt-image-2.5-flare`（文生圖）/ `gpt-image-2.5-sunburst`（編輯），官轉 |
| 想要可預測的統一價（\$0.03/張）、提示詞遵循更優 | `gpt-image-2-all`（官逆）                                       |
| 仍需影像編輯 + 遮罩                 | `gpt-image-2-all` 編輯端點（支援最多 16 張）                           |

<CardGroup cols={2}>
  <Card title="GPT-Image-2.5 / 2 概覽" icon="bolt" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    OpenAI 官方現役三款，端點 / 引數與歷史版相容
  </Card>

  <Card title="GPT-Image-2-All 概覽" icon="sparkles" href="/zh-Hant/api-capabilities/gpt-image-2-all/overview">
    官逆通道，\$0.03/張統一價，速度更快
  </Card>

  <Card title="官轉 vs 官逆 對比" icon="scale" href="/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    一文看懂兩者的差異和選型建議
  </Card>
</CardGroup>
