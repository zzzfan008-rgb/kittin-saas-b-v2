> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana OSS 分組

> Nano Banana OSS（NB-OSS）內測分組：圖片輸出為 URL 地址而非 Base64，減輕傳輸壓力、提升體驗，適合直接使用 URL 的場景。

## 背景必讀

<Info>
  **特點**：本分組為內測，可輸出的圖片為 **URL 地址**，而非 Base64，可減輕 Base64 傳輸壓力，提升客戶體驗。**適合直接用 URL 的場景**。如果沒有特別需求、能處理 Base64 輸出的圖片格式，則仍然建議使用「正常預設分組」或「NanoBanana 企業分組」。
</Info>

**支援模型**（Nano Banana Pro 和第一代）：

* `gemini-3-pro-image-preview`
* `gemini-3.1-flash-image-preview`
* `gemini-2.5-flash-image`

## 如何開始

<Steps>
  <Step title="聯絡管理員開通該可見分組">
    聯絡管理員為你的賬號開通 NB-OSS 可見分組（在「編輯使用者資訊 → 額外可見分組」中新增 NB-OSS）。

    <Frame caption="編輯使用者資訊：在「額外可見分組」中新增 NB-OSS">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-contact-admin.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=d4975f7e75786ca3452e99659297f9dc" alt="編輯使用者資訊介面，在額外可見分組中新增 NB-OSS 分組" width="736" height="310" data-path="images/nano-banana-oss-contact-admin.png" />
    </Frame>
  </Step>

  <Step title="新建令牌：選擇 NB-OSS 分組">
    新建令牌時，計費模式選「按次計費」，分組選 **NB-OSS**（Nano Banana PRO，輸出圖片為 URL，替代 Base64）。只換令牌，請求方式不變。

    <Frame caption="建立令牌：計費模式選「按次計費」，分組選 NB-OSS（1x）——輸出圖片為 URL，替代 Base64">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-create-token.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6ccac2359d775f8c0f9a185884bb6e4a" alt="建立令牌介面：計費模式選擇按次計費，選擇分組 NB-OSS，輸出圖片為 URL 替代 Base64" width="1284" height="886" data-path="images/nano-banana-oss-create-token.png" />
    </Frame>
  </Step>

  <Step title="替換令牌，進行測試">
    替換令牌進行測試。**程式碼層面需要相容 URL 輸出的解析** —— 不要直接替換 Base64，兩者相容最佳。
  </Step>
</Steps>

## 示例程式碼

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### 輸出示例

在 `text` 欄位裡有圖片的地址，下方的 `thoughtSignature` 是推理過程的 base64。

<Frame caption="響應 JSON：candidates → content → parts，圖片 URL 在 text 欄位中；thoughtSignature 為推理的 base64">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-output-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=7c466c969fc59d03a889f31c8b192bcb" alt="API 響應 JSON 示例，text 欄位包含圖片 URL 地址，thoughtSignature 欄位為推理的 base64" width="1200" height="637" data-path="images/nano-banana-oss-output-example.png" />
</Frame>

## OSS 儲存節點與下載速度

### 圖片儲存在哪裡？

輸出的圖片 URL 儲存在**阿里雲 OSS 洛杉磯節點（美西 us-west-1，北美區域）**，URL 形如：

```
https://<bucket名>.oss-us-west-1.aliyuncs.com/xxxx.png
```

<Warning>
  URL 的二級域名（`<bucket名>` 部分，如 `mycdn-gg`）**可能會變化，請不要在程式碼或防火牆規則中寫死完整域名**。如需做域名判斷或白名單，請匹配字尾 `oss-us-west-1.aliyuncs.com`（阿里雲 OSS 官方域名），或更寬鬆地放行 `*.aliyuncs.com`。
</Warning>

### 下載慢怎麼辦？

由於儲存節點在北美，從中國大陸等地直連下載時速度可能受限，常見原因和建議：

* **公司網路對海外流量限速 / 白名單攔截**：請聯絡網路管理員對 `*.oss-us-west-1.aliyuncs.com`（或 `*.aliyuncs.com`）解除限速、加入白名單。
* **及時轉存**：拿到 URL 後建議儘快下載並轉存到自己的儲存 / CDN，再分發給終端使用者，不要把 OSS URL 直接長期暴露給終端使用者。
* **伺服器代下**：如果本地網路下載慢，可以用海外或網路出口較好的伺服器先下載再中轉。

更多網路鏈路排查思路（DNS、路由、跨境頻寬等），可參考 FAQ：[下載 CDN 圖片/影片很慢怎麼辦？](/zh-Hant/faq/cdn-download-slow)

### 網址打不開？

核心是把輸出內容 JSON 裡的跳脫字元 `\u0026` 還原成正常的 `&`，同時忽略 `thoughtSignature` 後面的 base64 內容。

<Frame caption="圖片連結在 text 欄位裡；將 JSON 轉義的 & 還原成網址裡的 &，忽略 thoughtSignature 後的 base64">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-url-unescape.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5998b89a3f6b0cf6448041e47db2d9dd" alt="說明圖：圖片連結在 text 欄位，需將 JSON 轉義符 反斜槓 u0026 還原成 & 號，忽略 thoughtSignature 後的 base64 內容" width="1200" height="723" data-path="images/nano-banana-oss-url-unescape.png" />
</Frame>
