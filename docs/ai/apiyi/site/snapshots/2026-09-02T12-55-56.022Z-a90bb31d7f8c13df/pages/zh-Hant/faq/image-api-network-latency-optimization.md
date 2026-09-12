> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片 API 延遲如何最佳化？

> 針對高頻圖片生成業務，介紹 HTTP 介面、HTTP/1.1、連線複用和超時設定等網路最佳化建議。

## 簡短回答

如果每月生成圖片量巨大，並希望介面響應延遲控制在 360ms 內，單純更換其他線路通常幫助有限，因為其他可選節點大多是海外機器，網路距離可能帶來更高延遲。

可以先將原來的根域名：

```text theme={null}
https://api.apiyi.com
```

替換為以下 HTTP 介面進行測試：

```text theme={null}
http://api.apiyi.com:16888
```

請求路徑保持不變。例如原請求為 `https://api.apiyi.com/v1/images/generations`，替換後為 `http://api.apiyi.com:16888/v1/images/generations`。

<Warning>
  HTTP 不提供 TLS 加密，API Key 和請求內容會以明文方式傳輸。僅建議在可信網路或已配置專線、隧道的環境中使用，不要在公共網路中直接呼叫。
</Warning>

## 客戶端最佳化建議

部分中轉 API 在長連線或流式傳輸場景下對 HTTP/2 的相容性不穩定，可能出現連線中斷或額外重試。建議自定義 HTTP 客戶端：

* 強制使用 **HTTP/1.1**，關閉 HTTP/2
* 啟用連線池和 Keep-Alive，避免每次請求重新建立連線
* 根據圖片生成耗時適當增加讀取超時，不要只設置 500ms 總超時
* 對偶發網路錯誤設定有限次數重試，並採用退避策略

<Info>
  **500ms 應作為網路或任務提交階段的最佳化目標，而不是圖片生成完成時間的保證。** 實際延遲還會受到客戶端所在地、運營商線路、併發量、圖片模型和上游處理時間影響。建議先使用真實生產併發進行壓測，再根據 P95 和 P99 延遲評估效果。
</Info>

## 推薦排查順序

<Steps>
  <Step title="切換 HTTP 介面">
    將根域名替換為 `http://api.apiyi.com:16888`，保持原有 API 路徑和鑑權方式不變。
  </Step>

  <Step title="關閉 HTTP/2">
    在客戶端中固定使用 HTTP/1.1，並開啟連線複用。
  </Step>

  <Step title="調整超時與重試">
    分別配置連線超時和讀取超時；讀取超時應覆蓋圖片任務的正常處理時間。
  </Step>

  <Step title="進行併發壓測">
    按接近生產環境的併發量測試，重點觀察 P50、P95、P99 延遲和失敗率。
  </Step>
</Steps>

## 相關文件

* [使用 API 介面需要代理網路嗎？](/zh-Hant/faq/network-proxy)
* [API 使用手冊](/zh-Hant/api-manual)
