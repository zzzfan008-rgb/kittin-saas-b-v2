> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼 Gemini 圖片介面返回 NO_IMAGE？

> 解釋 Gemini 圖片介面返回 NO_IMAGE 的常見原因，並提供提示詞最佳化和故障排查方法。

## 簡短回答

當介面返回 `finishReason: NO_IMAGE` 且 `parts` 為 `null` 時，通常表示模型處理了請求，但沒有返回圖片內容。

這不一定代表提示詞觸發了內容安全稽核。對於“什麼是 GEO”“請介紹一下某個概念”這類更像文本問答的提示詞，模型可能無法確認使用者是否明確要求生成圖片，因此直接返回 `NO_IMAGE`。

建議在提示詞開頭明確說明要生成什麼圖片，並補充畫面主體、佈局、風格和輸出要求。

另一類高頻原因是**提示詞在要求模型寫文字**，比如「生成設計方案」「請確保分析內容深入」。在只允許輸出圖片的呼叫裡，這類請求會以一定機率返回 `NO_IMAGE`，同一個請求時好時壞。見下文「提示詞在要求模型輸出文字」。

<Note>
  如果響應裡沒有 `candidates`，而是出現了 `promptFeedback.blockReason`（例如 `OTHER`），那是另一類問題：輸入內容在生成前就被原廠攔截了。請看 [Gemini 出圖返回 blockReason: OTHER 怎麼辦？](/zh-Hant/faq/gemini-image-input-blocked)
</Note>

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

### 4. 提示詞在要求模型輸出文字

Gemini 圖片模型同時具備看圖和寫文字的能力。如果提示詞裡有要求文字產出的句子，模型會以一定機率「先寫方案」而不是直接出圖：

```text theme={null}
……根據圖1的鞋底款式，設計一款馬拉松跑鞋……
針對鞋款生成專業、精準且可操作性強的設計方案。
請確保分析內容深入，判斷準確，且設計與配色方案可直接應用於設計開發。
```

這類句子適合寫給文本模型。寫給出圖模型時，一旦請求設定了只輸出圖片（`responseModalities: ["IMAGE"]`），模型想寫的方案無法輸出，響應就變成 `finishReason: NO_IMAGE`、`parts: null`、輸出 token 為 0。

我們對一個真實的鞋款設計請求（3 張參考圖 + 上面這類提示詞）做過複測（2026-09 (UTC+8)，gemini-3.1-flash-image，`responseModalities: ["IMAGE"]`）：

| 提示詞寫法 | 返回 NO\_IMAGE 的次數 |
| - | - |
| 原提示詞 | 10/48（約 21%，不同時段在 1/12 \~ 5/12 之間波動） |
| 刪掉「生成設計方案」「分析內容深入」等句子 | 0/36 |
| 原文不動，末尾追加一句「只輸出最終圖片」 | 0/24 |
| 刪掉提示詞裡的品牌名 | 1/12（品牌名不是誘因） |

所以同一個請求會「連續失敗幾次又成功」，而渠道本身沒有任何變化。最簡單的修法是在提示詞末尾加一句：

```text theme={null}
【重要】本次只需直接輸出最終效果圖一張，不要輸出任何文字方案、分析或提示詞。
```

<Tip>
  參考圖裡有清晰可讀的文字或第三方標識（如鞋底上的品牌字樣）時，模型更容易進入「先分析素材」的狀態。我們在上述測試中把這類字樣模糊處理後，同一請求也是 0/36。
</Tip>

## responseModalities 不同，表現也不同

同一個「意圖不明確」的請求，在不同的 `responseModalities` 設定下表現不一樣：

| 設定 | 沒出圖時的表現 |
| - | - |
| `["IMAGE"]` | `finishReason: NO_IMAGE`，`parts: null`，輸出 token 為 0 |
| 不傳，或 `["TEXT", "IMAGE"]` | `finishReason: STOP`，但 `parts` 裡只有一段文字、沒有圖片 |

**排查技巧**：把出問題的請求去掉 `responseModalities` 再發幾次，看沒出圖時模型寫的是什麼：

* 寫的是一篇方案、分析，或者一段出圖提示詞 → 意圖不明確，按本頁的方法改提示詞
* 寫的是「無法生成」這類拒絕說明 → 觸發了內容稽核，參考 [Nano Banana 系列出圖失敗](/zh-Hant/faq/nano-banana-image-failure)

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
  <Step title="第一步：先分清失敗訊號在哪個欄位">
    `candidates[0].finishReason` 為 `NO_IMAGE`，屬於本頁討論的情況。如果沒有 `candidates`，而 `promptFeedback.blockReason` 有值，說明輸入在生成前就被攔截了，請看 [blockReason: OTHER 排查](/zh-Hant/faq/gemini-image-input-blocked)。
  </Step>

  <Step title="第二步：確認響應中是否有圖片內容">
    檢查響應中的 `parts`、`inlineData`、`image` 或等效圖片欄位。如果 `parts` 為 `null`，通常表示本次響應沒有返回圖片內容。
  </Step>

  <Step title="第三步：檢查提示詞是否明確要求生成圖片">
    確認提示詞中包含“生成一張圖片”“製作一張海報”或“create an image”等明確指令，不要只提交“什麼是……”或“請解釋……”這類文本問題。同時檢查有沒有「生成方案」「深入分析」「給出說明」這類要求文字產出的句子，有的話刪掉，或在末尾追加「只輸出圖片」。
  </Step>

  <Step title="第四步：再排查內容安全因素">
    如果已經明確要求生成圖片，但仍然返回 `NO_IMAGE`，再檢查是否涉及 NSFW、未成年人、知名 IP、去水印、真實人物肖像或其他上游安全策略。
  </Step>

  <Step title="第五步：檢視呼叫日誌">
    檢查呼叫日誌中的完整響應、模型名稱、request ID 和消費記錄。`usageMetadata` 表示模型處理過請求，但不能單獨證明圖片已經生成，也不能單獨判斷是否觸發了安全攔截。
  </Step>
</Steps>

## NO\_IMAGE 和內容安全攔截有什麼區別？

| 現象 | 可能原因 | 建議處理方式 |
| - | - | - |
| `NO_IMAGE` 且 `parts` 為 `null`，提示詞偏抽象 | 圖片生成意圖不明確 | 補充圖片型別、畫面主體和視覺要求 |
| 返回安全策略相關錯誤 | 觸發上游內容稽核 | 修改或刪除可能觸發稽核的內容 |
| `NO_IMAGE` 時有時無，同一請求重試後又成功 | 提示詞在要求文字產出，模型以一定機率先寫方案 | 刪掉索要方案/分析的句子，或末尾追加「只輸出最終圖片」 |
| 沒有 `candidates`，`promptFeedback.blockReason` 為 `OTHER` | 輸入內容在生成前被原廠攔截 | 見 [blockReason: OTHER 排查](/zh-Hant/faq/gemini-image-input-blocked) |
| 已明確圖片意圖仍然無法出圖 | 可能是模型、分組、令牌或上游通道問題 | 聯絡客服，並提供完整錯誤資訊、模型名稱、request ID 和呼叫時間 |

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

  <Accordion title="同一個請求為什麼時好時壞？渠道變了嗎？">
    多數情況下渠道沒有變化。意圖不明確導致的 `NO_IMAGE` 本身是機率性的：模型每次都在「出圖」和「先寫文字」之間做選擇。在我們的實測中，同一請求的失敗率約 21%，而且會連續出現。建議客戶端在收到 `NO_IMAGE` 時自動重試 1\~2 次，同時從提示詞上根治。
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
  <Card title="Gemini 出圖返回 blockReason: OTHER 怎麼辦？" icon="shield-alert" href="/zh-Hant/faq/gemini-image-input-blocked">
    輸入圖在生成前被攔截時的定位方法與參考圖預處理建議
  </Card>

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.