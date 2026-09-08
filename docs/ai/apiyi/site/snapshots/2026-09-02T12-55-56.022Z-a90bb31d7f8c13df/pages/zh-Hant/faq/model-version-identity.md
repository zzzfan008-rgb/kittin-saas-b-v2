> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼大模型不知道自己的版本號？

> 解釋通過 API 呼叫時模型無法準確回答自身版本的原因，以及官網和 API 的區別

## 簡短回答

<Info>
  **這是完全正常的現象，不影響模型能力。**

  模型的名字是訓練完成後才命名的，模型本身從未"學習過"自己的身份資訊。官方網頁版（如 claude.ai、chatgpt.com）之所以能正確回答，是因為內建了 System Prompt 告知模型"你是誰"。通過 API 呼叫時預設沒有這些資訊，所以模型會"猜錯"自己的版本。
</Info>

## 實際案例

<Warning>
  **常見場景**

  通過 API 呼叫 Claude Sonnet 4.5，問它"你是什麼模型？"，它可能回答"我是 Claude 3.5 Sonnet"。這**不代表**你呼叫的模型有誤，而是模型本身不知道自己的名字。

  同樣的情況也出現在 GPT-4o、Gemini 等所有模型上——這是大模型的通用特性，而非 API易 的問題。
</Warning>

## 通俗理解

<Card title="演員類比" icon="drama">
  想像一位演技精湛的演員：

  * **能力**來自多年訓練（相當於模型的訓練過程）
  * **角色名字**由導演在開拍前告訴他（相當於 System Prompt）
  * 如果沒人告訴他演什麼角色，他雖然演技一流，但**不知道自己叫什麼名字**

  大模型也是如此：能力來自訓練資料，但"我是 Claude Sonnet 4.5"這個身份資訊，需要額外告知。
</Card>

## 技術原理

<AccordionGroup>
  <Accordion title="為什麼模型不知道自己的名字？">
    **模型命名發生在訓練之後**

    大模型的開發流程是：

    1. **收集資料** → 準備訓練語料
    2. **訓練模型** → 學習語言理解和生成能力
    3. **評測調優** → 最佳化模型表現
    4. **命名釋出** → 給模型起名字（如 "Claude Sonnet 4.5"）

    模型在第 2 步完成訓練時，第 4 步的名字還不存在。模型的訓練資料中可能包含舊版本模型的名字（如 Claude 3.5 Sonnet），所以被問到時會"猜"一個它見過的名字。

    **類比**：就像一個人在出生前不可能知道自己的名字——名字是出生後才取的。
  </Accordion>

  <Accordion title="官方網頁版為什麼能正確回答？">
    **內建 System Prompt 的作用**

    當你在 claude.ai 或 chatgpt.com 上對話時，官方網頁會自動在每次對話開頭注入一段隱藏的 System Prompt，類似：

    ```
    你是 Claude，由 Anthropic 開發。你的模型版本是 Claude Sonnet 4.5...
    ```

    這段提示詞對使用者不可見，但模型會"讀到"它，從而知道自己是誰。

    **所以**：不是模型"天生"知道自己的名字，而是官方網頁每次都在"提醒"它。
  </Accordion>

  <Accordion title="API 呼叫為什麼不一樣？">
    **API 呼叫預設不包含身份資訊**

    通過 API 呼叫模型時，你傳送的只有：

    * `model` 引數（告訴伺服器呼叫哪個模型）
    * `messages` 陣列（你的對話內容）
    * 可選的 `system` 引數（你自定義的系統提示詞）

    `model` 引數是給**伺服器**看的路由資訊，模型本身讀不到這個欄位。如果你沒有在 `system` 中告訴模型它是誰，模型就只能根據訓練資料"猜測"。

    **這對所有 API 平臺都一樣**——無論是官方 API、API易，還是其他中轉站，行為完全一致。
  </Accordion>
</AccordionGroup>

## 如何驗證你呼叫的模型是否正確？

<CardGroup cols={2}>
  <Card title="檢視呼叫日誌" icon="file-text" href="/zh-Hant/faq/call-logs">
    在 API易 控制台的**呼叫日誌**中，可以看到每次請求實際使用的模型名稱，這是最準確的驗證方式。
  </Card>

  <Card title="檢視 API 響應" icon="code">
    每個 API 響應的 JSON 中都包含 `model` 欄位，明確標識了實際呼叫的模型版本。

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>
</CardGroup>

## API易 服務保障

<Tip>
  **API易 是官方渠道轉發，模型品質與源頭完全一致。**

  * API易 直接轉發請求到 OpenAI、Anthropic、Google 等官方 API
  * 模型回答"不知道自己是誰"是所有 API 平臺的通用現象
  * 您可以通過呼叫日誌和 API 響應中的 `model` 欄位確認實際呼叫的模型
  * 如有疑問，隨時聯絡我們的技術團隊驗證
</Tip>

## 如何讓模型正確回答自己的版本？

只需在 API 呼叫時新增 `system` 引數，告知模型它的身份即可：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://vip.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5-20250514",
    messages=[
        {
            "role": "system",
            "content": "你是 Claude Sonnet 4.5，由 Anthropic 開發的 AI 助手。"
        },
        {
            "role": "user",
            "content": "你是什麼模型？"
        }
    ]
)

print(response.choices[0].message.content)
# 輸出：我是 Claude Sonnet 4.5，由 Anthropic 開發。
```

<Info>
  **提示**：這和官方網頁版的原理完全一樣——通過 System Prompt 告知模型身份。新增後，模型就能正確回答"我是誰"了。
</Info>

## 相關問題

<CardGroup cols={2}>
  <Card title="如何選擇合適的模型？" icon="compass" href="/zh-Hant/faq/model-selection-guide">
    瞭解不同模型的特點和適用場景
  </Card>

  <Card title="為什麼有些模型不可用？" icon="lock" href="/zh-Hant/faq/model-availability">
    瞭解模型權限和使用者組等級
  </Card>

  <Card title="如何檢視呼叫日誌？" icon="file-text" href="/zh-Hant/faq/call-logs">
    驗證實際呼叫的模型版本
  </Card>

  <Card title="API 呼叫報錯怎麼辦？" icon="triangle-alert" href="/zh-Hant/faq/invalid-api-key">
    常見 API 錯誤排查指南
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
