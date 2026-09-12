> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 系列出圖失敗，常見原因有哪些？

> Nano Banana Pro/2 出圖失敗的常見原因分析，包括內容安全、去水印、知名IP、未成年人等觸發谷歌安全機制的場景

## 簡要說明

Nano Banana 系列（包括 Nano Banana Pro 和 Nano Banana 2）底層使用谷歌 Gemini 模型。出圖失敗的主要原因是**觸發了谷歌的內容安全機制**，谷歌會在生成階段直接攔截不合規的請求。API易作為透明代理，忠實轉發谷歌的反饋結果。

## 常見觸發原因

<CardGroup cols={2}>
  <Card title="NSFW 內容" icon="ban">
    包含色情、暴力、血腥、仇恨言論等不適當內容的提示詞或參考圖，會被谷歌安全機制直接攔截。
  </Card>

  <Card title="去水印請求" icon="droplet-off">
    要求去除圖片上的水印屬於違反內容政策的操作，谷歌會拒絕處理此類請求。
  </Card>

  <Card title="知名 IP / 版權角色" icon="copyright">
    涉及迪士尼、漫威、任天堂等知名版權角色的生成請求，會因版權保護被拒絕。
  </Card>

  <Card title="未成年人相關" icon="baby">
    任何涉及未成年人的不當內容生成請求，谷歌執行零容忍政策，嚴格攔截。
  </Card>
</CardGroup>

### Nano Banana 2 新增限制

<Warning>
  自 2026 年 2 月 27 日 Nano Banana 2 上線後，谷歌進一步收緊了安全機制，以下場景也會觸發攔截：
</Warning>

<CardGroup cols={2}>
  <Card title="知名人物" icon="user-x">
    涉及公眾人物（明星、政治人物等）的影像生成或編輯請求會被拒絕。
  </Card>

  <Card title="金融/訂單資訊修改" icon="credit-card">
    試圖修改圖片中的金融資訊、訂單截圖、價格標籤等內容會被攔截。
  </Card>

  <Card title="人物換裝/換臉" icon="shirt">
    對人物進行換裝、換臉等操作涉及隱私和倫理問題，會被安全機制拒絕。
  </Card>

  <Card title="隱性 NSFW 內容" icon="eye-off">
    即使沒有直接的色情描述，暗示性的、擦邊的不當內容也會被識別並攔截。
  </Card>
</CardGroup>

## 政策更新時間線

| 時間         | 事件               | 影響                               |
| ---------- | ---------------- | -------------------------------- |
| 2026年1月23日 | 谷歌調整風控政策         | 整體安全稽核更加嚴格，部分原本可通過的提示詞被攔截        |
| 2026年2月27日 | Nano Banana 2 上線 | 新增知名人物、金融資訊修改、換裝換臉、隱性 NSFW 等攔截規則 |

## 出圖失敗的典型表現

當出圖失敗時，API 返回的 HTTP 狀態碼仍然是 **200**，但響應內容中不包含圖片資料，而是返回文字說明。

<Info>
  **為什麼狀態碼是 200？** API易作為透明代理，忠實轉發谷歌 API 的原始響應。谷歌在安全攔截時返回的就是 200 狀態碼 + 文本拒絕說明，而非 HTTP 錯誤碼。
</Info>

### 常見的報錯文案示例

谷歌 API 返回的拒絕文本通常包含以下內容：

* `"我不能完成 xxx 的修改"`
* `"我不能為你建立帶有色情、不雅或冒犯性內容的影像"`
* `"I can't generate images that are sexually explicit."`
* `"I'm just a language model and can't help with that."`

<Warning>
  注意：谷歌的安全過濾存在一定的隨機性。**同一個提示詞有時能生成、有時不能**，這與參考圖內容、提示詞組合方式等因素有關。
</Warning>

## C 端產品開發者建議

如果你正在基於 Nano Banana 系列 API 開發面向使用者的產品，建議做好錯誤處理邏輯，為使用者提供友好的失敗提示。

<Tip>
  **核心判斷指標**：

  1. **candidatesTokenCount = 0**：谷歌在內容稽核階段直接拒絕
  2. **finishReason 不是 STOP**：生成過程中被安全策略攔截
  3. **有文本但無圖片**：API 返回了拒絕說明而非圖片資料
</Tip>

## 聯絡支援

如果你的使用場景是正常合規的，但仍然遇到出圖失敗問題，歡迎聯絡我們排查：

<Card title="技術支援" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  * 企業微信客服：[點選聯絡](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 郵箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
