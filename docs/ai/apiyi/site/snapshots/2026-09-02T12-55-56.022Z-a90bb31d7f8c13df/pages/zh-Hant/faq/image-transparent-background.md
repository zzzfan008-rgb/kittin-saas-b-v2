> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 怎麼生成透明背景的圖片（PNG 摳圖）？

> gpt-image-2 傳 background: transparent 就能直接輸出帶 alpha 通道的透明底圖，png 與 webp 都支援，jpeg 因為沒有 alpha 通道與透明互斥。本頁彙總各影像模型的透明背景支援情況、最小示例與常見報錯。

## 簡短回答

**用 `gpt-image-2`，請求里加兩個欄位就行**：

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

返回的圖就是帶 alpha 通道的透明底 PNG，不需要任何後處理摳圖。文生圖、圖片編輯、Responses 出圖工具三條路都支援。

<Info>
  `background: "transparent"` 是 OpenAI 於 2026-08-21 為 GPT-Image-2 開放的能力（官方標註為 preview）。本站已實測可用，文生圖與圖片編輯均產出真 alpha 透明。
</Info>

## 哪些模型能出透明背景

| 模型                                    | 支援方式                                                                       | 穩定性                              |
| ------------------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| `gpt-image-2`                         | **引數控制** —— `background: "transparent"` + `output_format` 為 `png` 或 `webp` | ✅ 穩定，推薦                          |
| `gpt-image-1.5` / `gpt-image-1`       | 引數控制，同上                                                                    | ✅ 穩定（老模型，新專案建議直接用 `gpt-image-2`） |
| `gpt-image-2-all` / `gpt-image-2-vip` | **沒有 `background` 引數**，只能在提示詞裡要求透明背景                                       | ⚠️ 偶現不穩定，同一條提示詞可能出白底             |
| `seedream-5-0` / `seedream-5-0-pro`   | `output_format: "png"` + 提示詞裡寫 `transparent background, alpha channel`     | ⚠️ 靠提示詞，不保證每次都有 alpha            |
| Gemini 系出圖（Nano Banana 系列）            | 只能在提示詞裡要求                                                                  | ⚠️ 同上                            |
| `seedream-4-5` / `seedream-4-0`       | 僅 `jpeg` 輸出，沒有 alpha 通道                                                    | ❌ 不支援                            |

<Tip>
  **需要穩定拿到透明底就用 `gpt-image-2`。** 引數控制和提示詞要求是兩回事：前者由介面保證，後者是"讓模型儘量照做"，批次跑的時候差別很明顯。
</Tip>

## 三種呼叫方式

### 文生圖 `/v1/images/generations`

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a cute cartoon fox sticker, flat vector illustration, single centered subject, clean cutout edges, no background, no shadow",
    "background": "transparent",
    "output_format": "png",
    "quality": "low"
  }'
```

### 圖片編輯 `/v1/images/edits`

給一張普通照片，讓模型去掉背景：

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

蒙版局部重繪（`mask`）與透明背景可以同時用，互不衝突。

### Responses 出圖工具

```json theme={null}
{
  "model": "gpt-5.2",
  "input": "生成一個卡通狐狸貼紙",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

返回的 `image_generation_call` 裡會回顯 `"background": "transparent"`。

## 為什麼 `jpeg` 不行

JPEG 格式本身**沒有 alpha 通道**，裝不下透明資訊。傳 `output_format: "jpeg"` 加 `background: "transparent"` 會直接報 400：

```json theme={null}
{
  "error": {
    "message": "Transparent background is not supported for JPEG output format",
    "param": "background",
    "code": "invalid_value"
  }
}
```

想要透明就選 `png`（無損，體積大）或 `webp`（有損可調，體積小，同樣支援 alpha）。`webp` 還能配合 `output_compression` 壓體積。

## 編輯介面是「重繪去背」，不是精確摳像

這一點要提前對齊預期：`/v1/images/edits` 傳 `background: transparent` 時，模型是**理解畫面之後重新畫一遍主體**，而不是像 Photoshop 那樣沿著原圖輪廓把主體切下來。所以：

* 主體的**姿態、風格、細節會有變化**，不是原影像素級保留
* 想盡量貼近原圖，用 `quality: "high"`，並在提示詞裡明確「保持原有構圖 / 不要改變主體外觀」
* 如果業務要求畫素級還原，建議自己用 `rembg`、`PIL`、`sharp` 這類工具做摳圖，模型出圖更適合"生成可複用素材"這類場景

## 計費

**透明背景不額外收費。** 相同畫質檔與尺寸下，`background: "transparent"` 與 `background: "opaque"` 消耗的 image token 完全一致，按 `gpt-image-2` 的正常按量計費規則走。

## 常見報錯

<AccordionGroup>
  <Accordion title="報 400：Transparent background is not supported for JPEG output format">
    `output_format` 傳了 `jpeg`。改成 `png` 或 `webp` 即可。
  </Accordion>

  <Accordion title="出圖確實是白底，不是透明的">
    先確認三件事：一是 `background` 欄位真的傳上去了（編輯介面是 `multipart/form-data`，欄位要用 `-F background=transparent` 而不是塞進 JSON）；二是響應頂層的 `background` 回顯是不是 `transparent`；三是你用的是不是 `gpt-image-2` —— `gpt-image-2-all` 和 `gpt-image-2-vip` 沒有這個引數，傳了會被忽略。
  </Accordion>

  <Accordion title="怎麼確認拿到的圖真的有 alpha 通道">
    用 Python 一行就能驗：

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA 才有 alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # alpha=0 的畫素佔比
    ```

    模式是 `RGB` 說明沒有 alpha 通道；`RGBA` 但 alpha 全是 255，說明有通道但沒鏤空。
  </Accordion>

  <Accordion title="提示詞裡已經寫了 transparent background，為什麼還要傳引數">
    提示詞只是"請求模型這麼畫"，模型可能畫一個看起來像透明的灰白棋盤格，那仍然是不透明畫素。真正的 alpha 通道只有 `background: "transparent"` 引數能保證。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="GPT-Image-2 概覽" icon="image" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    完整引數、尺寸、畫質檔與錯誤碼
  </Card>

  <Card title="文生圖 API 參考" icon="wand-sparkles" href="/zh-Hant/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations` 全部欄位
  </Card>

  <Card title="圖片編輯 API 參考" icon="scissors" href="/zh-Hant/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits` 與多圖融合
  </Card>

  <Card title="蒙版局部重繪" icon="square-dashed" href="/zh-Hant/api-capabilities/gpt-image-2/mask-editing">
    用 alpha 蒙版標記要改的區域
  </Card>

  <Card title="官轉 vs 官逆對比" icon="git-compare" href="/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    `gpt-image-2` / `-all` / `-vip` 怎麼選
  </Card>

  <Card title="白底圖出現髒塊怎麼辦" icon="triangle-alert" href="/zh-Hant/faq/white-background-image-artifacts">
    純白背景的另一類問題
  </Card>
</CardGroup>
