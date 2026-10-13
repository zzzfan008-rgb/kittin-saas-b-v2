> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片 API 延遲如何最佳化？

> 針對高頻圖片生成業務，介紹客戶端協議版本、連線複用、超時設定等網路最佳化建議。

## 簡短回答

如果每月生成圖片量巨大，並希望介面響應延遲控制在 360ms 內，單純更換其他線路通常幫助有限，因為其他可選節點大多是海外機器，網路距離可能帶來更高延遲。

最佳化應從客戶端入手，地址保持預設的：

```text theme={null}
https://api.apiyi.com
```

先確認客戶端實際使用的協議版本，再按需調整連線複用、超時和重試。**不需要為了走 HTTP/1.1 而把地址換成 `http://`**：http/https 管的是加不加密，HTTP/1.1 和 HTTP/2 是另一回事，詳見 [http 和 HTTP/1.1 是一回事嗎？](/zh-Hant/faq/http-vs-http11)

## 客戶端最佳化建議

* **確認協議版本**：Python（requests、httpx、OpenAI SDK）預設就是 HTTP/1.1，無需調整。Go、Java、OkHttp 以及 Node 26 起的內建 fetch 預設會走 **HTTP/2**。高併發上傳大圖時，HTTP/2 會把所有請求擠在一條連線上，這類客戶端建議在程式碼裡強制 HTTP/1.1，地址仍用 https
* 啟用連線池和 Keep-Alive，避免每次請求重新建立連線
* 根據圖片生成耗時適當增加讀取超時，不要只設置 500ms 總超時
* 對偶發網路錯誤設定有限次數重試，並採用退避策略

<Info>
  **500ms 應作為網路或任務提交階段的最佳化目標，而不是圖片生成完成時間的保證。** 實際延遲還會受到客戶端所在地、運營商線路、併發量、圖片模型和上游處理時間影響。建議先使用真實生產併發進行壓測，再根據 P95 和 P99 延遲評估效果。
</Info>

## 推薦排查順序

<Steps>
  <Step title="確認協議版本">
    用 `curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models -H "Authorization: Bearer YOUR_API_KEY"` 或檢視客戶端文件，確認實際走的是 HTTP/1.1 還是 HTTP/2。
  </Step>

  <Step title="按需關閉 HTTP/2">
    只有預設走 HTTP/2 的客戶端（Go、Java 等）需要這一步：在客戶端中固定使用 HTTP/1.1，並開啟連線複用。Go 程式可直接設定環境變數 `GODEBUG=http2client=0`。
  </Step>

  <Step title="調整超時與重試">
    分別配置連線超時和讀取超時；讀取超時應覆蓋圖片任務的正常處理時間。
  </Step>

  <Step title="進行併發壓測">
    按接近生產環境的併發量測試，重點觀察 P50、P95、P99 延遲和失敗率。
  </Step>
</Steps>

## 關於明文介面 16888

`http://api.apiyi.com:16888` 是正式提供的明文介面，請求路徑與 https 相同。它不會讓出圖變快：對已經走 HTTP/1.1 的客戶端，只省掉一次 TLS 握手。只建議在 HTTPS 握手本身出問題時臨時使用，或在可信內網、專線環境中使用。

<Warning>
  HTTP 不提供 TLS 加密，API Key 和請求內容會以明文方式傳輸。僅建議在可信網路或已配置專線、隧道的環境中使用，不要在公共網路中直接呼叫。
</Warning>

## 相關文件

* [http 和 HTTP/1.1 是一回事嗎？](/zh-Hant/faq/http-vs-http11)
* [使用 API 介面需要代理網路嗎？](/zh-Hant/faq/network-proxy)
* [API 使用手冊](/zh-Hant/api-manual)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.