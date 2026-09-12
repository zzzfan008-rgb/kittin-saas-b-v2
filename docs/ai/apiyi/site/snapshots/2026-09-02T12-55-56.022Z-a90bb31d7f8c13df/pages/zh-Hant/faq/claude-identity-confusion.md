> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼 Claude 會自稱 Qwen 或 DeepSeek？

> 解釋 Claude（尤其是 AWS 渠道）被問「你是什麼模型」時亂答、甚至自稱 Qwen/DeepSeek 的原因：這是大模型行業通病，與模型真偽無關

## 簡短回答

<Info>
  **這是完全正常的現象，不代表模型是假的，更不影響模型能力。**

  大模型對「你是什麼模型」這類問題的回答**本來就不可靠**——學術研究對 27 個主流模型的系統測試發現，約 26% 存在"身份混淆"，根本原因是**幻覺（Hallucination）**，而不是套殼或換模型。Claude 通過 API 直連時沒有系統提示詞錨定身份，用中文提問時又受中文網際網路語料影響，就可能"猜"出 Qwen、DeepSeek 這類它在訓練資料裡高頻見過的名字。
</Info>

## 問題現象

<Warning>
  **典型場景**

  通過 AWS 渠道呼叫 Claude，問它"你是什麼模型？"：

  * 一會兒回答"我是 Claude 4.5"
  * 一會兒自稱"我是 Qwen（通義千問）"
  * 一會兒又說"我是 DeepSeek"
  * 用中文提問時尤其明顯，且每次回答可能都不一樣

  **關鍵觀察**：同一個模型在正常使用、程式設計等複雜場景下表現完全正常——只有"自報身份"這一件事亂答。這正說明問題出在"身份認知"而非"模型能力"。
</Warning>

<Info>
  **官方後臺可直接復現，與中轉渠道無關**

  這個現象可以在 **AWS Bedrock 官方控制台的線上推理介面（Playground / Chat）** 中輕鬆複測：不經過 API易 或任何第三方中轉，直接在亞馬遜官方後臺向 Claude 提問"你是什麼模型"，同樣會出現自稱 Qwen、DeepSeek 的回答。

  這直接證明了"亂報身份"是模型上游的原生行為，而非渠道問題。我們已錄製了 Bedrock 後臺的復現影片：

  * 📹 **聯絡客服獲取影片檔案**：新增下方企業微信客服，即可索取完整復現影片
  * 📺 **檢視客服企業微信影片號**：客服影片號中已釋出該演示影片，可直接觀看並留言交流
</Info>

## 原因分析

<AccordionGroup>
  <Accordion title="原因一：模型本來就沒有穩定的自我身份">
    模型的名字是**訓練完成之後**才確定的，權重裡從來沒有"我是誰"這條資訊。API 請求中的 `model` 引數只是給伺服器看的路由資訊，模型本身讀不到。

    官方網頁版（claude.ai）之所以答得對，是因為每次對話都注入了隱藏的 System Prompt 告訴它"你是 Claude"。API 直連預設沒有這段提示詞，模型只能靠訓練資料"猜"。

    詳細原理見：[為什麼大模型不知道自己的版本號？](/zh-Hant/faq/model-version-identity)
  </Accordion>

  <Accordion title="原因二：中文語料汙染，讓它更容易「猜」成國產模型">
    Qwen、DeepSeek 是當前中文網際網路上討論度最高的模型，它們的自我介紹、API 示例、對話截圖充斥著中文語料。Claude 的訓練資料同樣包含這些內容。

    當身份錨定很弱（沒有 System Prompt）、又用**中文**提問"你是什麼模型"時，模型在中文語境下最"順口"的答案，很可能就是這些高頻出現的國產模型名字。這也解釋了為什麼換成英文提問，或換一種問法，答案又會變。
  </Accordion>

  <Accordion title="原因三：學術研究已證實這是行業通病">
    2024 年的系統性研究《I'm Spartacus, No, I'm Spartacus: Measuring and Understanding LLM Identity Confusion》測試了 27 個主流大模型，發現約 **26%** 存在身份混淆，並證實其根源是**幻覺，而非模型抄襲或偷換**。

    反向的例子同樣常見：DeepSeek 早期版本自稱 ChatGPT、GLM 自稱 Claude、Gemini 在某些語言下自稱別家模型……"自報家門"從來不是可靠資訊。

    論文地址（請複製訪問）：`arxiv.org/abs/2411.10683`
  </Accordion>

  <Accordion title="是不是官方故意不修？（防蒸餾的說法）">
    社群有一種流行的推測：廠商不把身份資訊"寫死"進模型權重，一方面是技術上沒必要（網頁版靠 System Prompt 即可），另一方面自報身份的口徑越鬆散，越難被蒸餾模型簡單模仿。

    需要說明的是，這只是社群推測，官方從未將"準確自報身份"作為功能承諾。可以確定的是：**沒有任何一家主流廠商保證裸 API 下模型能答對自己的名字**。
  </Accordion>
</AccordionGroup>

## 為什麼說"亂答"反而是裸模型直連的特徵？

<Card title="套殼站才需要「口徑統一」" icon="shield-check">
  裸 API 直連的正版模型，沒有任何身份提示詞，回答自然隨機、跨語言漂移——今天說 4.5，明天說 Qwen。

  而套殼/偷換模型的平臺恰恰相反：為了不露餡，往往會**注入提示詞強迫模型口徑統一**地自稱"我是 Claude"。所以"每次問都答得漂亮又統一"未必可信，"亂答"反而符合無身份注入的裸模型行為。

  當然，"亂答"本身也不能作為驗真依據——真正可靠的驗證方法見下方。
</Card>

## 如何驗證你呼叫的是正版 Claude？

<CardGroup cols={2}>
  <Card title="檢視 API 響應的 model 欄位" icon="code">
    每個 API 響應的 JSON 中都包含 `model` 欄位，標識實際呼叫的模型：

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>

  <Card title="檢視呼叫日誌" icon="file-text" href="/zh-Hant/faq/call-logs">
    在 API易 控制台的**呼叫日誌**中檢視每次請求實際使用的模型名稱。
  </Card>

  <Card title="用複雜任務橫向對比" icon="flask-conical">
    身份問答不可靠，但**能力不會騙人**。用同一道程式設計題、長上下文任務分別測試，Claude 的程式碼風格、推理鏈路與 Qwen/DeepSeek 有明顯差異。
  </Card>

  <Card title="聯絡技術團隊驗證" icon="message-circle">
    如仍有疑問，可聯絡 API易 技術團隊協助驗證渠道與模型來源。
  </Card>
</CardGroup>

## 如何讓模型正確回答自己的身份？

和官方網頁版原理一樣——在請求中加一段 System Prompt 即可：

```python theme={null}
messages=[
    {
        "role": "system",
        "content": "你是 Claude，由 Anthropic 開發的 AI 助手。"
    },
    {
        "role": "user",
        "content": "你是什麼模型？"
    }
]
```

<Tip>
  **API易 服務保障**：API易 的 Claude（含 AWS 渠道）均為官方同源轉發，請求原樣透傳、不注入任何提示詞。模型"不知道自己是誰"是所有裸 API 平臺的共同現象，與渠道真偽無關。
</Tip>

## 相關問題

<CardGroup cols={2}>
  <Card title="為什麼大模型不知道自己的版本號？" icon="circle-question-mark" href="/zh-Hant/faq/model-version-identity">
    身份問題的基礎原理詳解
  </Card>

  <Card title="如何檢視呼叫日誌？" icon="file-text" href="/zh-Hant/faq/call-logs">
    驗證實際呼叫的模型版本
  </Card>

  <Card title="如何選擇合適的模型？" icon="compass" href="/zh-Hant/faq/model-selection-guide">
    瞭解不同模型的特點和適用場景
  </Card>

  <Card title="模型名帶 -c 字尾是什麼意思？" icon="tag" href="/zh-Hant/faq/model-name-suffix-c">
    瞭解模型命名字尾的含義
  </Card>
</CardGroup>

## 聯絡我們

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    模型驗證諮詢、技術支援
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
