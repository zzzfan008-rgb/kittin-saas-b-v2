> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 出圖返回 IMAGE_OTHER 怎麼辦？

> Gemini 圖片模型返回 finishReason: IMAGE_OTHER 時，圖已經畫完但在輸出前被原廠過濾。本文解釋它與 NO_IMAGE、blockReason 的區別，並給出實測定位方法與修復建議。

## 簡短回答

如果 Gemini 圖片介面返回 HTTP 200，`candidates[0].finishReason` 是 `IMAGE_OTHER`，並且 `finishMessage` 寫著 `Unable to show the generated image`，說明**模型已經生成了圖片，但這張圖在返回之前被原廠的輸出檢查攔下了**。

* 它是**機率性**的：同一個請求有時成功、有時失敗，失敗率可能很高
* 它**和負向提示詞、引數、閘道都無關**，問題出在「畫出來的內容」上
* 我們實測到的最典型誘因是：**提示詞裡點名了真實人物**
* 原廠在 `finishMessage` 裡註明這類請求不計費

處理思路是：**找出提示詞裡讓畫面「像某個具體真人或受保護內容」的那部分，把它換成描述。**

## 怎麼識別

典型響應如下：

```json theme={null}
{
  "candidates": [
    {
      "finishReason": "IMAGE_OTHER",
      "finishMessage": "Unable to show the generated image. The model could not generate the image based on the prompt provided. You will not be charged for this request. Try rephrasing the prompt. ..."
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 1430,
    "candidatesTokenCount": 274,
    "thoughtsTokenCount": 274
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

注意 `candidatesTokenCount` 不是 0，而是等於 `thoughtsTokenCount`：模型完成了思考，只是最終的圖片沒有交付。

三種「沒出圖」的形態對比：

| 特徵 | IMAGE\_OTHER | NO\_IMAGE | blockReason: OTHER |
| - | - | - | - |
| 失敗訊號所在欄位 | `candidates[0].finishReason` | `candidates[0].finishReason` | `promptFeedback.blockReason` |
| 發生在哪一步 | 圖已生成，**輸出時被過濾** | 模型沒有去畫圖 | 生成前，**輸入被攔截** |
| `finishMessage` | `Unable to show the generated image` | 通常沒有 | 沒有 `candidates` |
| 輸出 token | 只有思考 token | 0 或只有文字 | 0 |
| 是否穩定復現 | 機率性 | 機率性 | 通常穩定復現 |
| 常見原因 | 畫面像具體真人等受限內容 | 提示詞在要求輸出文字 | 某張參考圖被攔截 |
| 處理方向 | 改提示詞裡的人物/受限描述 | 見 [NO\_IMAGE 排查](/zh-Hant/faq/gemini-no-image) | 見 [blockReason: OTHER 排查](/zh-Hant/faq/gemini-image-input-blocked) |

<Info>
  官方 API 文件中，`IMAGE_OTHER` 與 `IMAGE_SAFETY`、`IMAGE_PROHIBITED_CONTENT`、`IMAGE_RECITATION` 同屬「圖片生成被停止」的一組原因，`IMAGE_OTHER` 表示原因不屬於其餘幾類，原廠不會公開具體判斷依據。
</Info>

## 一個實測案例

2026-09 (UTC+8) 一位客戶反饋：一個純文生圖的球員卡請求，在 gemini-3-pro-image 上**約 63% 的呼叫不出圖**。提示詞約 5500 字元，結構如下：

* 開頭一句點名一位真實的運動員，要求「1:1 復刻其面部特徵」
* 姿勢、構圖、隊服配色、畫風、白底背景等詳細描述
* 兩大段負向提示詞（NEGATIVE），列了大量品牌名

我們復現到的失敗全部是 `IMAGE_OTHER`，約 20 秒返回。隨後每組 6 次、逐項刪減：

| 改動 | 不出圖 |
| - | - |
| 原提示詞 | **5/6** |
| **只刪掉點名真人的那一句**，其餘逐字保留 | **0/6** |
| 保留人名，只刪掉「1:1 復刻」這類措辭 | 4/6 |
| 刪掉兩段負向提示詞 | 3/6 |

結論很清楚：**觸發源是真人姓名本身**。模型認得這個名字、就會往這個人的樣子畫，畫得越像越容易在輸出時被過濾；畫得不太像的那幾次就能通過，所以表現為「時好時壞」。「1:1 復刻」的措辭和冗長的負向提示詞都不是原因。

刪掉名字後，原提示詞裡已有的髮色、臉型、眼型等外貌描述足以畫出同樣風格的球員卡。

<Tip>
  二分定位時每組 6 次就夠用：原請求失敗率 5/6 時，刪對了的那一組連續 6 次全部成功，碰巧的機率約為十萬分之二。整個定位只用了 24 次呼叫。
</Tip>

## 如何定位

<Steps>
  <Step title="第一步：確認失敗形態">
    原樣重發 5\~6 次，確認失敗時 `finishReason` 是 `IMAGE_OTHER`，並記下失敗率。如果是 `NO_IMAGE` 或 `blockReason`，請看對應的排查頁。
  </Step>

  <Step title="第二步：先查人名和具體物件">
    優先檢查提示詞裡是否出現了**真實人物的姓名**（明星、運動員、網紅、政要等），或要求「和某人一模一樣」。刪掉後重發一組。
  </Step>

  <Step title="第三步：逐段刪減">
    如果不是人名，把提示詞按段落對半刪減，每組 6 次，只在失敗率明顯下降的那一半里繼續縮小範圍。
  </Step>

  <Step title="第四步：改寫而不是硬刪">
    定位到誘因後，用外貌、服裝、風格等**描述**替換掉「指名道姓」，保留你真正需要的畫面要求。
  </Step>
</Steps>

## 處理建議

1. **提示詞裡不要寫真人姓名**：改成具體的外貌描述，例如「金色直髮、偏分、杏仁眼、鵝蛋臉」。這是本案例中唯一有效的修復。
2. **負向提示詞可以精簡，但它不是這個問題的原因**：Gemini 圖片模型沒有獨立的負向提示詞引數，大段 NEGATIVE 列表只會被當作普通文字理解，精簡後提示詞更清晰，但不會降低 `IMAGE_OTHER` 的機率。
3. **不要把重試當成方案**：失敗率在 60% 以上時，重試只是在碰運氣，還會增加整體耗時。客戶端可以在收到 `IMAGE_OTHER` 時重試 1 次兜底，但治本要改提示詞。
4. **批次生成場景提前改模板**：如果是按名單批次生成（例如每位球員一張卡），不要把名單裡的姓名拼進提示詞，姓名只用於你自己的檔案命名或後期排版。
5. **需要人物形象一致時用參考圖**：如果確實需要畫出某個具體的人，請提供本人授權的參考圖，並注意 [Nano Banana 出圖失敗](/zh-Hant/faq/nano-banana-image-failure) 裡列出的真人、未成年人等限制。

程式碼裡可以這樣區分三種形態：

```python theme={null}
def classify_no_image(resp: dict) -> str:
    if resp.get("promptFeedback", {}).get("blockReason"):
        return "input_blocked"        # 見 blockReason: OTHER 排查
    cand = (resp.get("candidates") or [{}])[0]
    reason = cand.get("finishReason")
    if reason == "IMAGE_OTHER":
        return "output_filtered"      # 改提示詞裡的人名/受限描述
    if reason == "NO_IMAGE":
        return "no_image_intent"      # 見 NO_IMAGE 排查
    if reason in ("IMAGE_SAFETY", "IMAGE_PROHIBITED_CONTENT"):
        return "safety"               # 明確的安全攔截，不要重試
    return "ok" if any("inlineData" in p for p in (cand.get("content") or {}).get("parts") or []) else "unknown"
```

## 常見問題

<AccordionGroup>
  <Accordion title="提示詞裡只是寫了名字，沒有要求畫得像，也會觸發嗎？">
    會。在我們的實測中，刪掉「1:1 復刻」這類措辭、只保留人名，失敗率仍有 4/6。模型認得這個名字，就會往這個人的樣子畫。
  </Accordion>

  <Accordion title="同一個請求為什麼時好時壞？">
    過濾發生在圖片生成之後，取決於這一次畫出來的結果。每次生成都不一樣，所以同一個請求會時而通過、時而被過濾。
  </Accordion>

  <Accordion title="為什麼換了分組或渠道後就正常了？">
    不同分組背後的輸出檢查嚴格程度可能不同，同一提示詞在不同分組上的失敗率會有差異。但分組的路由會隨時調整，這種差異並不穩定，從提示詞上修復才是可靠的做法。
  </Accordion>

  <Accordion title="負向提示詞（NEGATIVE）有用嗎？">
    Gemini 圖片模型沒有單獨的負向提示詞引數，寫在提示詞裡的 NEGATIVE 列表會被當作普通文字。它對 `IMAGE_OTHER` 沒有影響，但過長的列表可能稀釋主要描述，建議只保留最關鍵的幾項，並改成正向表述（例如「純白背景」而不是列一長串「不要體育場、不要草地……」）。
  </Accordion>

  <Accordion title="IMAGE_OTHER 會扣費嗎？">
    原廠在 `finishMessage` 中註明這類請求不計費。實際是否產生消費，請以 API易 控制台的呼叫日誌為準。
  </Accordion>
</AccordionGroup>

## 仍然無法解決？聯絡我們

請提供以下資訊，方便我們協助排查：

* 模型名稱和令牌分組；
* 完整響應（至少包含 `finishReason`、`finishMessage` 和 `responseId`）與 `request ID`；
* 問題發生時間（請註明時區）；
* 脫敏後的提示詞，以及你統計到的失敗率。

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

    郵件標題建議包含「IMAGE\_OTHER + 模型名稱」。
  </Card>
</CardGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="為什麼 Gemini 圖片介面返回 NO_IMAGE？" icon="image-off" href="/zh-Hant/faq/gemini-no-image">
    提示詞意圖不明確導致的未出圖與修復方法
  </Card>

  <Card title="Gemini 出圖返回 blockReason: OTHER 怎麼辦？" icon="shield-alert" href="/zh-Hant/faq/gemini-image-input-blocked">
    輸入圖在生成前被攔截時的定位方法與參考圖預處理建議
  </Card>

  <Card title="Nano Banana 系列出圖失敗" icon="image-off" href="/zh-Hant/faq/nano-banana-image-failure">
    內容安全、去水印、知名 IP 和未成年人等常見原因
  </Card>

  <Card title="Gemini 生圖 API 錯誤處理指南" icon="triangle-alert" href="/zh-Hant/api-capabilities/gemini-image-error-handling">
    完整的響應判斷順序與 C 端友好提示方案
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.