> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# banana pro 改圖後畫面偏紅怎麼辦？

> banana pro 改圖後畫面整體偏紅/偏暖的常見緩解路徑：切換 Vertex 通道，或改用 gpt-image-2。

## 簡短回答

Nano Banana Pro（`gemini-3-pro-image`）改圖後畫面整體偏紅/偏暖是改圖場景下出現較多的情況。常見可嘗試的緩解路徑有兩種：

1. 把 banana pro 切到 Vertex 通道再試
2. 改用 gpt-image-2

## 詳細說明

### banana pro 預設走的是哪條通道？

API易 上 Nano Banana Pro 預設分組**走的是官轉 AI Studio 線路**，Vertex 作為獨立算力池在 AIStudio 出問題時頂上（詳見 [Google 系模型走 AI Studio 還是 Vertex？](/zh-Hant/faq/google-upstream-aistudio-vertex)）。

### 怎麼切到 Vertex 通道？

Vertex 在 API易 控制台裡以**獨立分組**形式提供。在建立或編輯令牌時，從「選擇分組」裡挑到 Vertex 相關的分組即可，呼叫方式不變，**程式碼層無需修改**（詳見 [Google 系模型走 AI Studio 還是 Vertex？](/zh-Hant/faq/google-upstream-aistudio-vertex)）。

### 改用 gpt-image-2 是否能解決？

gpt-image-2 在改圖場景下整體色彩保真度通常更好，可作為備選方案評估，詳見 [GPT-Image-2 圖片編輯 API](/zh-Hant/api-capabilities/gpt-image-2-all/image-edit)。

## 排查步驟

<Steps>
  <Step title="先在網頁端複測">
    開啟 `imagen.apiyi.com` 網頁端，使用相同的參考圖 + 編輯指令再測一次。

    * 如果網頁端也偏紅 → 大機率是模型在該提示詞下的表現，可走 Vertex / gpt-image-2 備選
    * 如果網頁端不偏紅 → 排查接入鏈路（參考 [圖片與參考圖差異過大排查](/zh-Hant/faq/image-result-differs-from-reference)）
  </Step>

  <Step title="確認參考圖為 base64 上傳">
    banana pro 系列**不支援 OpenAI 格式上傳參考圖**，必須用 base64（參考 [圖片與參考圖差異過大排查](/zh-Hant/faq/image-result-differs-from-reference)）。如果參考圖是 URL 直接放進 `image_url`，得到的圖本身就是模型"猜"的，偏紅也可能與參考圖沒真正傳進去有關。
  </Step>

  <Step title="嘗試換 Vertex 通道">
    在控制台給令牌選 Vertex 分組，重跑同一指令。記錄色偏程度差異。
  </Step>

  <Step title="嘗試 gpt-image-2">
    如果 Vertex 通道仍偏色，作為兜底再試 gpt-image-2。注意出圖風格會與 banana pro 有差異，需要重新調提示詞。
  </Step>
</Steps>

## 常見問題

<AccordionGroup>
  <Accordion title="gpt-image-2 和 banana pro 在改圖上的差別？">
    banana pro 偏向"畫風化重繪"，gpt-image-2 偏向"原圖微調"。如果你的訴求是儘量貼近原圖色彩，gpt-image-2 通常更合適。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Google 系模型走 AI Studio 還是 Vertex？](/zh-Hant/faq/google-upstream-aistudio-vertex)
* [圖片與參考圖差異過大排查](/zh-Hant/faq/image-result-differs-from-reference)
* [Nano Banana Pro 圖片編輯 API](/zh-Hant/api-capabilities/nano-banana-image/image-edit)
* [GPT-Image-2 圖片編輯 API](/zh-Hant/api-capabilities/gpt-image-2-all/image-edit)

## 聯絡我們

如需確認 Vertex 分組是否在控制台對你的賬號可見，或需要協助排查改圖色偏，請聯絡客服。
