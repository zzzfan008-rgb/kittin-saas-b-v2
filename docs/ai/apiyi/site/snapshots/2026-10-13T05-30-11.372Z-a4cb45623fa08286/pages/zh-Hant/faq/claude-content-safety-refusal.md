> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 拒答為什麼返回空內容？

> Claude 觸發原廠安全策略時不報錯，返回 HTTP 200、空 content 與 stop_reason: refusal，並附拒答類別。本文給出各呼叫格式的輸出體、計費規則與識別方法。

## 簡短回答

Claude 遇到觸發原廠安全策略的請求時，**不會報錯**。介面照常返回 HTTP 200，但：

* `content` 是**空陣列** `[]`，`output_tokens` 為 `0`；
* `stop_reason` 是 `refusal`；
* `stop_details` 裡寫明拒答的**類別**（如 `cyber` 網路安全）和一段英文說明。

這是模型本身的行為，不是介面故障。程式碼裡如果直接取 `message.content[0]`，就會丟擲 `IndexError`；用 OpenAI 相容格式呼叫時，拿到的是空字串，`finish_reason` 為 `refusal`。

拒答通常在 1\~2 秒內返回。是否計費取決於拒答類別：**`cyber` 等類別在輸出前被拒答時不計費**，詳見下文「計費規則」。

## 拒答的輸出體

下面是同一條觸發網路安全拒答的請求，在四種呼叫方式下的實測返回（2026-09-29 實測，id 已打碼）：

<Tabs>
  <Tab title="原生 · 非流式">
    `POST /v1/messages`，`stream: false`：

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "type": "message",
      "role": "assistant",
      "model": "claude-sonnet-5",
      "content": [],
      "stop_reason": "refusal",
      "stop_sequence": null,
      "stop_details": {
        "type": "refusal",
        "category": "cyber",
        "explanation": "This request triggered cyber-related safeguards. To learn about the Cyber Verification Program and apply for access, visit our help center: ..."
      },
      "usage": {
        "input_tokens": 2863,
        "output_tokens": 0,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0
      }
    }
    ```
  </Tab>

  <Tab title="原生 · 流式">
    `POST /v1/messages`，`stream: true`。**沒有任何 `content_block_*` 事件**，`message_start` 之後直接是帶拒答資訊的 `message_delta`：

    ```text theme={null}
    event: message_start
    data: {"type":"message_start","message":{"id":"msg_xxxxxxxx","content":[],"stop_reason":null,"stop_details":null,"usage":{"input_tokens":2863,"output_tokens":0}, ...}}

    event: message_delta
    data: {"type":"message_delta","delta":{"stop_reason":"refusal","stop_sequence":null,"stop_details":{"type":"refusal","category":"cyber","explanation":"This request triggered cyber-related safeguards. ..."}},"usage":{"input_tokens":2863,"output_tokens":0}}

    event: message_stop
    data: {"type":"message_stop"}
    ```
  </Tab>

  <Tab title="OpenAI 相容 · 非流式">
    `POST /v1/chat/completions`。`content` 為空字串，`finish_reason` 為 `refusal`，**沒有拒答類別**：

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "object": "chat.completion",
      "model": "claude-sonnet-5",
      "choices": [
        {
          "index": 0,
          "message": { "role": "assistant", "content": "" },
          "finish_reason": "refusal"
        }
      ],
      "usage": { "prompt_tokens": 2863, "total_tokens": 2863 }
    }
    ```
  </Tab>

  <Tab title="OpenAI 相容 · 流式">
    `POST /v1/chat/completions`，`stream: true`。只有空的 `delta`，某個 chunk 的 `finish_reason` 為 `refusal`：

    ```text theme={null}
    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""}}]}

    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"refusal"}]}

    data: [DONE]
    ```
  </Tab>
</Tabs>

| 欄位 | 拒答時的表現 |
| - | - |
| HTTP 狀態碼 | `200`，不是錯誤 |
| `content` | 原生格式為空陣列 `[]`；OpenAI 相容格式為空字串 `""` |
| `stop_reason` / `finish_reason` | `refusal` |
| `stop_details` | 僅原生格式有：`type`、`category`（拒答類別）、`explanation`（英文說明） |
| `usage` | 輸入 tokens 如實計數，`output_tokens` 為 0（計數不等於計費，見下文） |
| 耗時 | 通常 1\~2 秒，遠快於正常回答 |

<Note>
  拒答也可能發生在**流式輸出的中途**：先輸出了一部分正文，最後以 `stop_reason: "refusal"` 結束。這時已輸出的部分是不完整的，應當丟棄。
</Note>

## 拒答類別

`stop_details.category` 目前有五個取值：

| 類別 | 含義 |
| - | - |
| `cyber` | 可能助長網路安全危害，如惡意軟體、漏洞利用開發；正常的安全工作也可能觸發 |
| `bio` | 可能助長生物危害；正常的生命科學研究也可能觸發 |
| `frontier_llm` | 可能協助開發與之競爭的 AI 模型（原廠商業條款限制） |
| `reasoning_extraction` | 要求模型在回答裡複述自己的內部推理過程 |
| `general_harms` | 不屬於以上四類的其他使用政策領域 |

拒答對應不到具體類別時，`category` 和 `explanation` 都是 `null`，這是正常值。`explanation` 的文字隨時可能變化，只適合展示，**不要拿來做字串匹配**。

## 常見觸發場景

`category: "cyber"`（網路安全）是開發者最常遇到的一類。Claude 對網路安全相關請求有一層即時防護，下面這些任務都可能觸發：

* 讓模型尋找程式碼漏洞、判斷一段程式碼「是否存在漏洞」、給出漏洞型別（CWE）
* 編寫或補全漏洞利用程式碼（exploit）、滲透測試步驟
* 分析、改寫惡意程式碼

<Warning>
  **批次評測和資料集蒸餾最容易踩到。** 例如用一整個漏洞資料集逐條讓模型判斷，往往會有相當一部分樣本被拒答。指令碼如果預設 `content[0]` 一定存在，就會在拒答那一條上直接崩潰，看起來像「介面時好時壞」。
</Warning>

## 計費規則

按原廠規則（截至 2026 年 9 月，原廠可能根據誤攔率調整）：

| 拒答發生的時機與類別 | 計費 |
| - | - |
| 輸出前拒答，類別為 `cyber`、`general_harms` 或 `null` | **不計費** |
| 輸出前拒答，類別為 `bio`、`frontier_llm`、`reasoning_extraction` | 按輸入 tokens 計費 |
| 流式輸出中途拒答（任何類別） | 按輸入 tokens 與已輸出的 tokens 計費 |

無論是否計費，拒答請求都會計入速率限制。`usage` 裡照常顯示 token 數，這是計數，不代表一定扣費。

## 如何識別與處理

<Steps>
  <Step title="先判斷 stop_reason，再取內容">
    原生格式看 `stop_reason == "refusal"`，OpenAI 相容格式看 `finish_reason == "refusal"`。確認不是拒答之後，再去讀 `content`。
  </Step>

  <Step title="把拒答當作一類結果記錄">
    拒答是一次成功的呼叫，不是網路錯誤。評測類任務建議單獨記為「拒答」，連同 `stop_details.category` 一起存檔，而不是計入失敗重試。
  </Step>

  <Step title="不要原樣重試">
    同一內容原樣重試，大機率還是同樣的拒答，還會佔用速率限制；部分類別每次都會產生輸入費用。
  </Step>

  <Step title="多輪對話要先重置上下文">
    多輪對話裡某一輪被拒答後，要刪掉或改寫觸發拒答的那一輪，或者清空歷史，再繼續對話。不重置的話，後續請求會持續被拒答。
  </Step>

  <Step title="定期分析拒答集中在哪類內容">
    按 `category` 統計，就能看出是哪類任務在觸發。再決定這部分內容是否改用其他模型處理。
  </Step>
</Steps>

<Tabs>
  <Tab title="Anthropic SDK">
    ```python theme={null}
    import os
    import anthropic

    client = anthropic.Anthropic(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com",
    )

    def ask(prompt, model="claude-sonnet-5"):
        message = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        if message.stop_reason == "refusal":
            details = getattr(message, "stop_details", None)
            category = getattr(details, "category", None) if details else None
            return {"refused": True, "category": category, "request_id": message.id}

        text = "".join(b.text for b in message.content if b.type == "text")
        return {"refused": False, "text": text}
    ```
  </Tab>

  <Tab title="OpenAI SDK">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1",
    )

    def ask(prompt, model="claude-sonnet-5"):
        resp = client.chat.completions.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        choice = resp.choices[0]
        if choice.finish_reason == "refusal" or not choice.message.content:
            return {"refused": True, "request_id": resp.id}
        return {"refused": False, "text": choice.message.content}
    ```
  </Tab>
</Tabs>

<Tip>
  需要知道拒答**類別**，請用原生 `/v1/messages` 格式呼叫。OpenAI 相容格式只保留了 `finish_reason: "refusal"`，沒有 `stop_details`。
</Tip>

## 合規的安全研究怎麼辦

拒答說明裡提到的 **Cyber Verification Program（網路安全驗證計劃）**，是原廠面向合規安全研究的免費申請計劃：通過身份驗證後，漏洞利用、攻防工具開發這類「高風險兩用」任務可以放寬。但勒索軟體開發、大規模資料竊取這類「禁止用途」，任何情況下都會被攔截。

這個計劃**由組織管理員以原廠賬號申請**。通過第三方平臺呼叫時，原廠說明「並非所有平臺都參與」，API易 目前不提供該計劃的接入。

所以通過 API易 呼叫時，對被拒答的樣本：

* 在評測結果裡如實記為「拒答」，連同類別一起統計；
* 或改用其他模型處理這部分內容。

API易 不會也無法調整原廠的安全策略。

## 與 OpenAI 拒答的區別

| | Claude | OpenAI（GPT 系列） |
| - | - | - |
| HTTP 狀態碼 | 200 | 200 |
| 正文 | 空（`content: []`） | 一句拒答文字，如 `I can't help with that…` |
| 結束原因 | `refusal` | `stop`，與正常回答相同 |
| 拒答類別 | 有，`stop_details.category` | 無 |
| 計費 | 輸出前拒答的 `cyber` 等類別不計費 | 按拒答文字正常計費 |
| 識別方式 | 判斷 `stop_reason` 即可 | 只能看正文特徵 |

OpenAI 模型的拒答形態詳見 [OpenAI 模型拒答長什麼樣？](/zh-Hant/faq/openai-content-safety-refusal)。

## 常見問題

<AccordionGroup>
  <Accordion title="被拒答也會扣費嗎？">
    看類別和時機。輸出前被拒答、類別為 `cyber`、`general_harms` 或 `null` 的不計費；`bio`、`frontier_llm`、`reasoning_extraction` 按輸入計費；流式中途被拒按輸入加已輸出部分計費。詳見上文「計費規則」。
  </Accordion>

  <Accordion title="能關閉拒答嗎？">
    不能。拒答由原廠模型根據其安全策略決定，API易 無法關閉，也無法調整它的尺度。被拒答的內容建議記為拒答結果，或改用其他模型處理。
  </Accordion>

  <Accordion title="同一個資料集，為什麼有的樣本被拒、有的正常？">
    防護按每一條請求的內容單獨判斷。程式碼片段本身的特徵、提示詞的問法都會影響結果，所以同一個資料集裡通常只有一部分樣本被拒。實測同一條被拒的樣本連續重發，結果基本穩定一致。
  </Accordion>

  <Accordion title="拒答時 usage 裡的 output_tokens 為什麼是 0？">
    模型沒有生成任何內容就結束了，所以輸出為 0，只有輸入被計數。這也是區分「拒答」和「被 max\_tokens 截斷」的方法：後者 `stop_reason` 是 `max_tokens`，且輸出 tokens 等於你設定的上限。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="Claude 響應資料處理" icon="braces" href="/zh-Hant/api-capabilities/claude-response-handling">
    流式與非流式響應結構、stop\_reason 取值
  </Card>

  <Card title="OpenAI 模型拒答長什麼樣？" icon="message-square-x" href="/zh-Hant/faq/openai-content-safety-refusal">
    GPT 系列拒答的形態與識別方法
  </Card>

  <Card title="內容安全如何合規性？" icon="shield-check" href="/zh-Hant/faq/content-safety">
    平臺內容安全與合規政策
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.