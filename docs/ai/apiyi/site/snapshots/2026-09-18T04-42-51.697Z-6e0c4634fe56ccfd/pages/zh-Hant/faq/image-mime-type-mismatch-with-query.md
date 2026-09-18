> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 上傳圖片報 image content does not match MIME type 怎麼解決？

> 圖片 URL 末尾帶 x-oss-process 等 CDN 處理引數時會觸發該報錯，去掉引數或用原始直鏈即可

## 簡要回答

上傳給 API 的圖片 URL 末尾帶了 `?x-oss-process=...` 這類雲端儲存處理引數，會觸發 `image content does not match MIME type` 報錯。

解決辦法是去掉 URL 末尾的處理引數、使用原始直鏈傳給 API，或者先把圖在自己服務端處理好再上傳。

## 這個報錯是什麼樣？

報錯內容如下：

```json theme={null}
{
  "error": {
    "message": "decode image: image content does not match MIME type 'image/png'",
    "type": "invalid_request_error",
    "code": 429
  }
}
```

常見的觸發 URL 形如：

```text theme={null}
https://oss.fzputi.com/tools/aiCraft/...jpg?x-oss-process=image/resize,w_800
```

這種 URL 末尾的 `?x-oss-process=...` 是阿里雲 OSS 等物件儲存的圖片處理引數；目前已知帶上這類引數後，圖片生成類介面會報上述錯誤。

## 已知受影響的引數名

以下引數名出現在圖片 URL 末尾時，**已被反饋會觸發該報錯**：

* `x-oss-process`

若你使用其他雲端儲存的圖片處理引數（例如騰訊雲 COS、華為雲 OBS 等的等效引數），同樣建議按以下步驟處理後再傳入 API。

## 解決步驟

<Steps>
  <Step title="去掉 URL 末尾的處理引數">
    複製圖片的原始直鏈（不帶 `?x-oss-process=` 這類引數），重新傳入 API。

    例如把：

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg?x-oss-process=image/resize,w_800
    ```

    改成：

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg
    ```
  </Step>

  <Step title="如果需要尺寸調整，先在服務端處理後再上傳">
    如果你的業務確實需要 OSS 端做壓縮或裁剪，先在服務端把處理後的圖片下載到本地，再用本地路徑或新的直鏈（不帶引數）傳給 API。
  </Step>
</Steps>

## 注意事項

<Warning>
  傳進 API 的圖片 URL 應儘量保持「直鏈、零引數」，避免觸發該報錯。
</Warning>

## 仍然無法解決時

* 確認你傳入的 URL 在瀏覽器中可以直接開啟，且瀏覽器右鍵 → 檢視圖片時顯示的真實格式與 URL 字尾（jpg / png / webp）一致
* 如果使用其他雲端儲存的圖片處理引數，請聯絡技術支援附上具體報錯 JSON 與請求 ID

## 相關文件

* [圖片生成有非同步介面嗎？支援任務 ID 查詢結果嗎？](/zh-Hant/faq/image-async-api)
* [接入模型後生成的圖片和參考圖相差很大怎麼辦？](/zh-Hant/faq/image-result-differs-from-reference)
