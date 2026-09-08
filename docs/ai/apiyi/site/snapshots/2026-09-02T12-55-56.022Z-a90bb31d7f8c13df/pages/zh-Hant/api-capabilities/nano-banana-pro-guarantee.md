> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 出圖失敗包補計劃

> API易 針對按次計費的 Nano Banana Pro 推出出圖失敗包補計劃：因谷歌風控導致的非主觀出圖失敗，按條數核算後補發額度。

## 計劃簡介

為了更好地服務客戶，API易 推出 **Nano Banana Pro 出圖失敗包補計劃**。

<Info>
  保障模型僅為**按次計費的 Nano Banana Pro**。Nano Banana 2 可選擇**按量計費**的令牌，失敗的呼叫計費極少、可忽略。
</Info>

當請求返回**狀態碼 200 但出圖失敗**時，這是谷歌側的反饋，API易 透明代理只是直接轉發結果——我們同樣希望客戶成功出圖。本計劃即針對這類**非主觀原因**導致的失敗進行額度補發。

## 什麼情況下 Nano Banana Pro 不出圖？

谷歌的內容風控策略在持續收緊，常見觸發拒絕的情形：

* **內容安全**：NSFW、未成年人相關內容
* **去水印**：較為特殊的一類
* **知名 IP**（2026 年 1 月 23 日新增）：如迪士尼等——谷歌疑似調整了新的風控政策
* **更嚴格的安全機制**（2 月 27 日，Nano Banana 2 上線後）：知名人物、金融/訂單資訊修改、人物換裝/換臉、隱性 Sex 等，均會返回文案報錯，類似「我不能完成 xxx 的修改」

## 出圖失敗的表現特徵

<CardGroup cols={2}>
  <Card title="日誌輸出 Tokens 少於 1000" icon="triangle-alert">
    谷歌返回一段文字，例如：「我無法協助完成這個工作」 / `I'm just a language model and can't help with that.`
  </Card>

  <Card title="日誌輸出 Tokens 為空" icon="ban">
    直接拒絕出圖，報錯為空。介面資料中關鍵指標為 `"candidatesTokenCount": 0`
  </Card>
</CardGroup>

<Frame caption="日誌列表：「補全」（輸出 Tokens）列出現 100~200 等極小值，即為出圖失敗的呼叫">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-failure-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6cf66f9f67eeca2b89255d9287c4ae7c" alt="日誌列表，gemini-3-pro-image-preview 模型的補全 Tokens 列出現 173、176 等極小值，標記為出圖失敗" width="938" height="860" data-path="images/nano-banana-pro-guarantee-failure-example.png" />
</Frame>

## 為什麼失敗仍會扣費？

* 谷歌會扣配額：不修改提示詞反覆請求，會浪費谷歌的 RPD 配額
* 系統暫時做不到「輸出為空即不扣費」
* 違規內容請求更容易導致我們的官方 KEY 被封——這是不可挽回的損失

## 如何參與？

面向客戶範圍：

1. 每月消耗 **1000 美金起**（不限站內模型）——門檻定得很低，小額度測試、自用出現失敗的機率也不高
2. 面向**工具服務商**：因為客戶側並不好控制使用者的輸入內容
3. 僅限**非主觀原因**：惡意請求相同/相似的違規內容，拒絕補發
4. 時間範圍：**5 月 1 日 (UTC+8) 起**
5. 陸續溝通，加入我們內部名單登記

## 如何補發？

進入**日誌**欄目，點選右上角的【匯出】，選擇時間範圍（比如上個月），選擇【非同步匯出】；提交後在頂部導航選單的【非同步任務】中檢視進度，並下載最終的 Excel 資料結果。

<Frame caption="日誌欄目右上角的【匯出】按鈕">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-export-logs.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=233889ab4fdb3740a726f77ff2fc84bd" alt="日誌欄目工具欄，右上角匯出按鈕被高亮標記" width="1284" height="296" data-path="images/nano-banana-pro-guarantee-export-logs.png" />
</Frame>

**補發額度**：統計出具體的失敗條數，按 `條數 × 模型價格 / 折扣係數` 進行補發（例如充值贈送 15%，則除以 1.15）。

**補發時間**：每個月底統計上個月的資料，大概在**下月初的 5 個工作日內**補發到賬。
