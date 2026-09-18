> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼 Gemini 圖片介面返回 NO_IMAGE？

> 解釋 Gemini 圖片介面返回 NO_IMAGE 的常見原因，並提供提示詞最佳化和故障排查方法。

## 簡短回答

當介面返回 `finishReason: NO_IMAGE` 且 `parts` 為 `null` 時，通常表示模型處理了請求，但沒有返回圖片內容。

這不一定代表提示詞觸發了內容安全稽核。對於“什麼是 GEO”“請介紹一下某個概念”這類更像文本問答的提示詞，模型可能無法確認使用者是否明確要求生成圖片，因此直接返回 `NO_IMAGE`。

建議在提示詞開頭明確說明要生成什麼圖片，並補充畫面主體、佈局、風格和輸出要求。

## 為什麼會返回 NO\_IMAGE？

### 1. 提示詞更像文本問答

例如：

```text theme={null}
什麼是 GEO？

GEO 就是讓企業在大模型 AI 中獲得排名……
```

這段內容主要是在解釋 GEO 的概念，沒有明確說明：

* 要生成什麼型別的圖片；
* 畫面中應該出現哪些元素；
* 資訊應該如何排版；
* 是否只需要圖片，不需要文字解釋。

即使請求中包含“生成圖片”幾個字，模型仍可能將整體請求理解為文本說明或知識問答。

### 2. 圖片生成意圖不夠明確

某些平臺工具會自動在使用者輸入前新增“生成圖片：”等提示詞。但通過 API 呼叫時，平臺通常只是透明轉發請求，不一定會自動補充完整的影像生成意圖。

因此，不建議只寫：

```text theme={null}
生成圖片：什麼是 GEO？
```

而應直接說明圖片型別和視覺要求：

```text theme={null}
生成一張中文科技風資訊圖海報，主題是“什麼是 GEO”。
```

### 3. 輸入內容缺少視覺描述

如果提示詞只有概念解釋，模型不知道應該把內容轉換成什麼畫面。建議補充以下資訊：

* 圖片型別：資訊圖、海報、流程圖或宣傳圖；
* 畫面結構：三欄佈局、時間軸或中心輻射結構；
* 視覺風格：科技風、商務風、簡約風或品牌風；
* 文字要求：標題、編號、正文和排版層級；
* 輸出要求：僅生成圖片，不要返回文字解釋。

## GEO 提示詞示例

可以將原始提示詞改寫為：

```text theme={null}
生成一張中文科技風資訊圖海報，主題是“什麼是 GEO”。

畫面包含一個主標題和三個編號說明模組：

1. 讓企業在大模型 AI 的搜尋和推薦中獲得更高曝光；
2. 讓企業成為使用者問題的答案；
3. 建立 AI 對企業資訊的信任和推薦。

設計要求：

- 使用藍紫色科技風；
- 採用清晰的三欄佈局；
- 突出“排名”“答案”“信任推薦”三個關鍵詞；
- 使用簡潔、易讀的中文排版；
- 適合作為企業宣傳海報；
- 僅生成圖片，不要返回文字解釋。
```

<Tip>
  “生成圖片”本身通常只是一個動作提示，不能完全替代對畫面內容的描述。越明確說明圖片型別、主體、佈局和視覺風格，模型越容易判斷這是一個圖片生成請求。
</Tip>

## 如何排查 NO\_IMAGE？

<Steps>
  <Step title="第一步：確認響應中是否有圖片內容">
    檢查響應中的 `parts`、`inlineData`、`image` 或等效圖片欄位。如果 `parts` 為 `null`，通常表示本次響應沒有返回圖片內容。
  </Step>

  <Step title="第二步：檢查提示詞是否明確要求生成圖片">
    確認提示詞中包含“生成一張圖片”“製作一張海報”或“create an image”等明確指令，不要只提交“什麼是……”或“請解釋……”這類文本問題。
  </Step>

  <Step title="第三步：再排查內容安全因素">
    如果已經明確要求生成圖片，但仍然返回 `NO_IMAGE`，再檢查是否涉及 NSFW、未成年人、知名 IP、去水印、真實人物肖像或其他上游安全策略。
  </Step>

  <Step title="第四步：檢視呼叫日誌">
    檢查呼叫日誌中的完整響應、模型名稱、request ID 和消費記錄。`usageMetadata` 表示模型處理過請求，但不能單獨證明圖片已經生成，也不能單獨判斷是否觸發了安全攔截。
  </Step>
</Steps>

## NO\_IMAGE 和內容安全攔截有什麼區別？

| 現象                                   | 可能原因               | 建議處理方式                               |
| ------------------------------------ | ------------------ | ------------------------------------ |
| `NO_IMAGE` 且 `parts` 為 `null`，提示詞偏抽象 | 圖片生成意圖不明確          | 補充圖片型別、畫面主體和視覺要求                     |
| 返回安全策略相關錯誤                           | 觸發上游內容稽核           | 修改或刪除可能觸發稽核的內容                       |
| 已明確圖片意圖仍然無法出圖                        | 可能是模型、分組、令牌或上游通道問題 | 聯絡客服，並提供完整錯誤資訊、模型名稱、request ID 和呼叫時間 |

<Info>
  `finishReason: NO_IMAGE` 只能說明本次沒有返回圖片，不能僅憑這個欄位斷定一定是內容違規。需要結合完整錯誤訊息、提示詞內容和呼叫日誌一起判斷。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="提示詞中加上“生成圖片”就一定能解決嗎？">
    不一定。“生成圖片”只能表達基本意圖，建議同時說明圖片型別、主體、構圖、風格和輸出要求。對於抽象概念，最好明確要求生成資訊圖、海報或流程圖。
  </Accordion>

  <Accordion title="GEO 這個主題是不是被內容安全攔截了？">
    從 GEO 的概念本身來看，沒有明顯的內容安全風險。但 `NO_IMAGE` 並不能完全排除上游策略影響，仍需要結合完整響應和呼叫日誌判斷。就當前案例而言，提示詞更像知識解釋，圖片生成意圖不夠具體是更值得優先排查的方向。
  </Accordion>

  <Accordion title="為什麼 usageMetadata 有 token，但仍然沒有圖片？">
    `usageMetadata` 只能說明模型處理了輸入併產生了推理或文本 token，不代表響應一定包含圖片。是否生成圖片，應以響應中是否存在圖片資料為準。
  </Accordion>

  <Accordion title="NO_IMAGE 會扣費嗎？">
    不能只根據 `NO_IMAGE` 判斷是否扣費。請以 API易 控制台的呼叫日誌為準，確認該請求是否產生消費記錄。
  </Accordion>
</AccordionGroup>

## 仍然無法解決？聯絡我們

如果明確補充了圖片生成意圖後仍然返回 `NO_IMAGE`，請聯絡 API易 客服，並提供：

* 模型名稱和令牌分組；
* 完整錯誤訊息和 `request ID`；
* 脫敏後的提示詞；
* 問題發生時間；
* 呼叫日誌中的消費記錄。

<Warning>
  請勿傳送完整 API Key。提交截圖或日誌前，請將金鑰內容打碼。
</Warning>

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增，或點選本卡片直接聯絡客服。
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    郵件標題建議包含「NO\_IMAGE + 模型名稱」。
  </Card>
</CardGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="Nano Banana 系列出圖失敗" icon="image-off" href="/zh-Hant/faq/nano-banana-image-failure">
    檢視內容安全、去水印、知名 IP 和未成年人等常見原因
  </Card>

  <Card title="模型呼叫報錯怎麼排查？" icon="alert-triangle" href="/zh-Hant/faq/model-error-troubleshooting">
    檢視 401、429、503、504、超時和分組問題的通用排查流程
  </Card>

  <Card title="怎麼看懂日誌裡的計費金額？" icon="file-text" href="/zh-Hant/faq/log-billing-explained">
    通過呼叫日誌確認請求是否成功和是否產生消費
  </Card>
</CardGroup>
