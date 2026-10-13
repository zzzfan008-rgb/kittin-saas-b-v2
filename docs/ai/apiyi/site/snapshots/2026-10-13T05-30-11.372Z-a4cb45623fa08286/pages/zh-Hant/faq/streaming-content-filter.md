> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 流式和非流式請求，遇到內容過濾有什麼不同？

> 非流式請求被內容安全過濾時，平臺會自動換線路重新生成；流式請求一旦開始輸出就無法切換，會以 content_filter 截斷。本文給出實測對照、輸出形態和按場景的選擇建議。

## 簡短回答

<Info>
  **同一段內容，流式和非流式遇到內容過濾時的結果可能完全不同：**

  1. **非流式**：某條官方線路觸發內容安全過濾時，API易 會**自動換一條官方線路重新生成**。客戶端拿到的是完整結果，**只計費一次**。
  2. **流式**：內容一開始輸出就已經發給客戶端了，**中途沒法再換線路**。這次請求會以 `finish_reason: "content_filter"` 結束，已經生成的部分**照常計費**。
  3. **怎麼選**：需要逐字展示給使用者的（對話、Agent 回覆）用流式；程式生成完才使用的（劇本、分鏡、翻譯、結構化資料）用非流式。
</Info>

## 過濾發生的兩個時機

原廠的內容安全過濾會在兩個時機介入，流式下兩種形態都會出現：

| 時機 | 流式下的表現 | 典型耗時 |
| - | - | - |
| **請求階段**（審查輸入） | 正文只有一句 `I'm sorry, but I cannot assist with that request.`（約 15 tokens），`finish_reason` 為 `content_filter` | 幾秒 |
| **生成階段**（審查輸出） | 模型已經輸出了一部分正文，中途被截斷，`finish_reason` 為 `content_filter` | 取決於截斷前生成了多少 |

兩種情況的 HTTP 狀態碼都是 `200`，響應以 `data: [DONE]` 正常收尾，**HTTP 錯誤日誌裡看不到**，只能從流的最後一個事件判斷。

## 流式與非流式對照

| | 流式 `stream: true` | 非流式 `stream: false` |
| - | - | - |
| 被過濾時平臺怎麼處理 | 已經開始輸出，無法切換線路 | 自動換一條官方線路重新生成 |
| 客戶端拿到的結果 | 被截斷的半段正文，或一句拒答 | 完整結果，`finish_reason: "stop"` |
| 計費 | 被截斷的這次按實際輸入、輸出 tokens 計費；續寫或重試再另計 | 只計成功的那一次 |
| 客戶端要做的處理 | 識別 `content_filter`，清理正文，再決定續寫或重試 | 無需額外處理 |
| 適合的場景 | 需要逐字展示的內容 | 生成完才使用的內容 |

<Note>
  非流式的自動切換能大幅提高成功率，但不是 100%：如果內容明顯違反原廠使用政策，換一條線路後也可能被模型自己拒答，形態見 [OpenAI 模型拒答長什麼樣？](/zh-Hant/faq/openai-content-safety-refusal)。
</Note>

## 實測對照

2026-09-25 (UTC+8)，用 `gpt-5.6-terra`、相同的引數（`max_tokens=35000`、`temperature=0`、`reasoning_effort=high`），對同一批影視分鏡劇本分別發流式和非流式請求：

| 劇本題材 | 流式 | 非流式 |
| - | - | - |
| 武俠打鬥，要求把招式、受傷、倒地寫具體 | **5/5 在生成階段被截斷**（約 1,700 tokens 處） | **4/4 完整返回** |
| 動作片、戰爭片，含流血和死亡細節 | **10/10 在請求階段被攔**（固定一句拒答） | **6/6 完整返回** |
| 生活題材、懸疑題材 | 8/8 正常結束 | — |

同一段內容原樣重試，流式下的結果基本一樣。**決定是否觸發的主要是內容本身，不是運氣。**

## 流式被截斷時的輸出形態

最後一個帶 `choices` 的事件沒有正文，只有結束原因：

```text theme={null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[{"delta":{},"finish_reason":"content_filter","index":0}],"usage":null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[],"usage":{"prompt_tokens":27831,"completion_tokens":6966,"total_tokens":34797}}
data: [DONE]
```

<Warning>
  **生成階段被截斷時，拼好的正文末尾會直接接上一句英文拒答，中間沒有換行**，例如：

  `……林遠把長刀橫於胸前，腳尖緩慢挪動，始終讓I'm sorry, but I cannot assist with that request.`

  如果把這段正文原樣帶進續寫請求，模型會在上下文裡看到一句拒答，下一輪更容易繼續被攔。**續寫前請先去掉這句。**
</Warning>

## 怎麼選

<CardGroup cols={2}>
  <Card title="用流式" icon="zap">
    * 聊天、客服、Agent 對話回覆，使用者需要立刻看到輸出
    * 需要中途打斷（使用者點「停止」）的場景
    * 日常對話觸發內容過濾的機率很低，流式的體驗優勢更重要
  </Card>

  <Card title="用非流式" icon="package">
    * 劇本、分鏡、小說章節等創作類長文本
    * 批次翻譯、資訊抽取、結構化 JSON
    * 結果要先解析、落庫，再展示給使用者
    * **容易碰到敏感情節的內容**（打鬥、傷亡、犯罪）
  </Card>
</CardGroup>

同一個產品完全可以**兩種都用**：對話部分走流式，劇本或分鏡生成走非流式。只需要把後者請求裡的 `stream` 改成 `false`，其他引數不變。

非流式要等整段生成完才返回，長輸出的推理模型可能要 30\~100 秒甚至更久，請把這類請求的客戶端超時設到 **300 秒以上**，見 [如何避免介面超時？](/zh-Hant/faq/timeout-configuration)。前端如果需要進度感，可以先顯示「生成中」，完成後一次性展示。

## 必須用流式時怎麼處理

<Steps>
  <Step title="讀流時記下 finish_reason">
    最後一個帶 `choices` 的事件裡，`finish_reason` 為 `content_filter` 就說明被過濾了。不要只看 HTTP 狀態碼。
  </Step>

  <Step title="去掉末尾的拒答句">
    生成階段被截斷時，正文末尾帶著一句英文拒答，先把它去掉，再決定怎麼用已生成的部分。
  </Step>

  <Step title="改走非流式重試">
    對被截斷的那一段，改用非流式重新請求，讓平臺自動切換線路。這比流式續寫的成功率高得多。
  </Step>

  <Step title="連續被攔就調整表述">
    同一任務非流式也拿不到結果時，把敏感細節寫得概括一些再試，不要原樣重試。
  </Step>
</Steps>

下面是一個最小示例：流式讀取，被過濾時去掉拒答句，再改走非流式重試。

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL = "I'm sorry, but I cannot assist with that request."

def generate(messages, model="gpt-5.6-terra"):
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        stream_options={"include_usage": True},
    )
    parts, finish = [], None
    for chunk in stream:
        if not chunk.choices:
            continue
        choice = chunk.choices[0]
        if choice.delta and choice.delta.content:
            parts.append(choice.delta.content)
            print(choice.delta.content, end="", flush=True)
        if choice.finish_reason:
            finish = choice.finish_reason

    text = "".join(parts)
    if finish != "content_filter":
        return text

    # 被過濾：去掉末尾的拒答句，改走非流式，由平臺自動切換線路
    partial = text.removesuffix(REFUSAL)
    print(f"\n[被內容過濾截斷，已生成 {len(partial)} 字，改用非流式重試]")
    resp = client.chat.completions.create(model=model, messages=messages, timeout=600)
    return resp.choices[0].message.content
```

<Tip>
  示例裡直接用非流式把整段重新生成一遍，最省事。如果你的業務必須保留已生成的部分，可以把 `partial` 作為上下文讓模型續寫，但續寫請求同樣建議用非流式。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="流式被截斷的那次也扣費嗎？">
    扣。原廠已經實際生成了這些內容，按實際輸入、輸出 tokens 計費。所以容易觸發過濾的內容，用非流式更划算：非流式只計成功的那一次。
  </Accordion>

  <Accordion title="能關閉內容過濾嗎？">
    不能。過濾由原廠執行，API易 無法關閉，也無法調整尺度。平臺能做的是在非流式請求被過濾時換一條官方線路重試。
  </Accordion>

  <Accordion title="同樣的內容，為什麼有時通過、有時被截斷？">
    不同官方線路的過濾尺度不完全一致，模型每次生成的措辭也不同，所以邊界附近的內容可能時而通過、時而被截斷。明顯敏感的內容會被穩定攔截。
  </Accordion>

  <Accordion title="平臺為什麼不對流式請求也自動重試？">
    生成階段的截斷髮生在正文已經發出之後，客戶端已經收到並展示了前半段，這時再換線路從頭生成，內容會對不上。所以流式請求只能由客戶端識別 `content_filter` 後自行處理。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="OpenAI 模型拒答長什麼樣？" icon="message-square-x" href="/zh-Hant/faq/openai-content-safety-refusal">
    被模型自己拒答時的輸出體與識別方法
  </Card>

  <Card title="流式和非流式呼叫有什麼區別？" icon="audio-lines" href="/zh-Hant/faq/streaming-vs-non-streaming">
    兩種呼叫方式的接入、計費與常見誤區
  </Card>

  <Card title="如何避免介面超時？" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    非流式長輸出的超時設定
  </Card>

  <Card title="內容安全如何合規性？" icon="shield-check" href="/zh-Hant/faq/content-safety">
    平臺內容安全與合規政策
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.