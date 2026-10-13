> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 模型拒答長什麼樣？

> GPT 系列模型遇到違反原廠使用政策的請求時，返回 200 與一段拒答文字，不報錯也不分類。本文給出輸出體示例與識別方法。

## 簡短回答

GPT 系列模型遇到違反原廠使用政策的請求時，**不會報錯**。介面照常返回 HTTP 200，`finish_reason` 是 `stop`，正文是模型自己寫的一句拒答，比如「I can't help with that…」或「抱歉，我不能…」。

響應裡**沒有錯誤碼，也沒有拒答類別或嚴重程度**，結構與正常回答完全一樣，並且按正常輸出計費。所以只看狀態碼和 `finish_reason`，是判斷不出「被拒答了」的。

## 拒答的輸出體

下面是 `/v1/chat/completions` 非流式拒答的實測返回（正文已替換為中性示例）：

```json theme={null}
{
  "model": "gpt-5.6-terra",
  "object": "chat.completion",
  "created": 1789712872,
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I can't help with that request. I can, however, help with a related topic or a rewritten version that stays within the usage policy."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 54,
    "total_tokens": 89
  }
}
```

| 欄位 | 拒答時的表現 |
| - | - |
| HTTP 狀態碼 | `200` |
| `finish_reason` | `stop`，與正常回答相同 |
| `message` | 只有 `role` 和 `content`，**沒有**單獨的 `refusal` 欄位 |
| 正文開頭 | 常見為 `I can't…`、`Sorry, I can't…`、`抱歉，我不能…` |
| 語言 | 跟隨提示詞：中文提問多用中文拒答 |
| 長度 | 多在 50–120 tokens；涉及身心健康的話題會附帶求助建議，可能長到 400 tokens 左右 |
| 計費 | 按實際輸入、輸出 tokens 正常計費 |

## 為什麼沒有分類

OpenAI 的對話介面對違規請求的處理方式，是**讓模型自己決定不回答**，而不是由介面返回一個錯誤。它不會告訴你命中的是哪一類（例如成人向內容、血腥暴力、自我傷害等），也不給嚴重程度。

這和「報錯」是兩回事：報錯時你拿到的是非 200 狀態碼和 `error` 物件；拒答時你拿到的是一次**成功的呼叫**，只是內容不是你想要的。

## 翻譯與結構化輸出場景

批次翻譯、資訊抽取這類任務，通常要求模型按固定格式輸出（比如一個 JSON 陣列）。一旦某批內容觸發拒答，模型返回的是一句普通文字，客戶端按 JSON 解析就會失敗，常見報錯如 `Unrecognized token 'I'`、`Expecting value`。

**這不是介面格式問題**，而是這一批內容本身被拒絕處理。同一批內容原樣重試，結果通常也一樣。

<Info>
  API易 已對**非流式請求**啟用內容安全自動切換：某條官方線路在請求階段或生成階段觸發內容過濾時，會自動切換到其他官方線路重新處理，無需客戶端重試。切換後，大多數請求能拿到正常結果；極個別內容仍可能被模型本身拒答，這時就是本文描述的形態。
</Info>

## 如何識別與處理

<Steps>
  <Step title="先校驗輸出格式">
    要求 JSON 就先按 JSON 解析，要求固定條數就核對條數。格式不符，就當作「未拿到結果」處理，不要直接把正文當譯文使用。
  </Step>

  <Step title="再判斷是否為拒答">
    格式不符時，看正文是否是一句以 `I can't`、`Sorry`、`抱歉` 等開頭的短句。是的話基本可以判定為拒答，而不是模型輸出格式跑偏。
  </Step>

  <Step title="不要原樣重試">
    同一內容原樣重試，大機率得到同樣的拒答，還會重複計費。
  </Step>

  <Step title="拆小批次，定位具體條目">
    把失敗的批次拆成更小的批次重新提交，找出觸發拒答的具體條目；其餘條目通常可以正常完成。對觸發的條目，可以調整表述後再試。
  </Step>

  <Step title="內部存檔失敗 Case，再決定是否換模型">
    把失敗 Case 在你們內部存檔（原文、請求時間、請求 ID、返回正文），定期分析拒答集中在哪類內容，再考慮對這部分內容改用其他模型重試。
  </Step>
</Steps>

<Tip>
  建議把「失敗 Case 存檔 → 分析 → 換其他模型重試」做成固定流程。拒答往往集中在少數幾類內容上，存檔之後很容易看出規律，比每次人工排查省事得多，也能避免對同一內容反覆重試、重複計費。
</Tip>

下面是一個最小示例：校驗 JSON，不符合就記入本地失敗清單。

```python theme={null}
import json
import os
import time
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL_PREFIXES = ("I can't", "I can’t", "Sorry", "I'm sorry", "I’m sorry", "抱歉")

def translate_batch(lines):
    prompt = "把下面的字幕逐句翻譯成英文，只輸出 JSON 陣列：\n" + json.dumps(lines, ensure_ascii=False)
    resp = client.chat.completions.create(
        model="gpt-5.6-terra",
        messages=[{"role": "user", "content": prompt}],
    )
    text = resp.choices[0].message.content or ""
    try:
        result = json.loads(text)
        if isinstance(result, list) and len(result) == len(lines):
            return result
    except json.JSONDecodeError:
        pass

    # 未拿到結果：記入本地失敗清單，供後續分析或改用其他模型重試
    with open("failed_cases.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "time": time.strftime("%Y-%m-%d %H:%M:%S %z"),
            "request_id": resp.id,
            "is_refusal": text.strip().startswith(REFUSAL_PREFIXES),
            "input": lines,
            "output": text,
        }, ensure_ascii=False) + "\n")
    return None
```

## 流式請求的區別

流式請求一旦開始輸出，就無法再切換線路，因此**內容安全自動切換隻對非流式請求生效**。流式下你可能會看到：

* 一句簡短的拒答，最後一個事件的 `finish_reason` 為 `content_filter`；
* 或者已經輸出了一部分正文，最後以 `finish_reason: "content_filter"` 結束。

批次翻譯這類不需要逐字展示的任務，建議使用非流式呼叫。兩者的完整對照與實測資料見 [流式和非流式請求，遇到內容過濾有什麼不同？](/zh-Hant/faq/streaming-content-filter)。

## 常見問題

<AccordionGroup>
  <Accordion title="被拒答也會扣費嗎？">
    會。拒答是一次成功的呼叫，按實際輸入、輸出 tokens 正常計費，所以不建議對同一內容反覆重試。
  </Accordion>

  <Accordion title="能關閉拒答嗎？">
    不能。拒答由原廠模型根據其使用政策決定，API易 無法關閉，也無法調整它的尺度。
  </Accordion>

  <Accordion title="同樣的內容，為什麼有時成功、有時被拒答？">
    模型的判斷本身有一定隨機性，不同官方線路的過濾尺度也不完全一致，所以邊界附近的內容可能時而通過、時而被拒。明顯違反使用政策的內容，基本會被穩定拒答。
  </Accordion>

  <Accordion title="怎樣才能拿到拒答的類別？">
    OpenAI 的對話介面不返回類別。如果你的業務需要按類別處理，可以在請求前自行對內容做一次分類，或在失敗 Case 存檔後人工歸類。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="響應資料處理" icon="braces" href="/zh-Hant/api-capabilities/openai/response-handling">
    流式與非流式響應的統一解析方法
  </Card>

  <Card title="內容安全如何合規性？" icon="shield-check" href="/zh-Hant/faq/content-safety">
    平臺內容安全與合規政策
  </Card>

  <Card title="Claude 拒答為什麼返回空內容？" icon="message-square-x" href="/zh-Hant/faq/claude-content-safety-refusal">
    Claude 拒答的形態與識別方法
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.