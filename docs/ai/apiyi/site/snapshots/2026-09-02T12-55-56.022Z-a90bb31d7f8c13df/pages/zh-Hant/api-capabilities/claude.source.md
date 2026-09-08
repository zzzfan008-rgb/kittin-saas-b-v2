> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API 呼叫基礎說明

> API易 提供純正官轉的 AWS Claude + Claude Official API 雙通道接入，約 85 折，穩定可靠、按量計費。

通道與計費亮點：

* **預設通道：AWS Claude**（AWS Bedrock 官方接入）——穩定性高、快取命中好。
* **替補通道：Claude Official**（Anthropic 官網官 Key 直連）——AWS 通道異常時自動兜底。
* **兩條通道都是純官轉**，按量計費、不限速，綜合成本約官網價 **85 折**（含充值加贈後區間為 79–86 折）。

<Info>
  低價逆向的我們不做，**只做可靠穩定的品質和服務**。

  市場上 Claude 的接入渠道有點混亂，價格越低往往越不透明：那些低價通道你用了，根本不知道對方在裡面摻了什麼——可能是逆向破解、共享賬號、降智或被替換的模型；更要緊的是，你的對話資料被轉賣了你也無從察覺。API易 只做純正官轉（AWS Bedrock + Anthropic 官方 Key），通道可溯源、不留存資料，寧可貴一點也要穩、要乾淨。
</Info>

## 獲取 API Key

在後臺建立 / 檢視令牌：

`https://api.apiyi.com/token`

* 使用**預設令牌**即可直接呼叫。
* 若新建令牌時選擇 **ClaudeCode 分組**，可享 **95 折**（5% off）。
* 該分組折扣可與**充值活動 10%–20% 加贈**疊加，綜合下來實際成本約為官網價的 **79 折–86 折**（即標題所說的"約 85 折"區間）。
* 不限速，比官網價格更低，使用方便。

<Info>
  API 按量計費（非包月套餐），餘額從充值賬戶即時扣費。
</Info>

## 接入資訊

| 專案                 | 值                                           |
| ------------------ | ------------------------------------------- |
| **Base URL**       | `https://api.apiyi.com`                     |
| **Anthropic 原生端點** | `https://api.apiyi.com/v1/messages`         |
| **OpenAI 相容端點**    | `https://api.apiyi.com/v1/chat/completions` |

## 可用模型

以下 3 個為各系列最新版本，推薦直接使用：

| 系列         | 模型名                         | 適用場景        |
| ---------- | --------------------------- | ----------- |
| **Opus**   | `claude-opus-4-8`           | 複雜程式設計、深度推理 |
| **Sonnet** | `claude-sonnet-4-6`         | 通用智慧、日常程式碼  |
| **Haiku**  | `claude-haiku-4-5-20251001` | 快速響應、高併發    |

## 呼叫方式：原生 vs OpenAI 相容

我們**同時支援** Anthropic 原生格式和 OpenAI 相容格式，但請按場景選擇：

<CardGroup cols={2}>
  <Card title="✅ 強烈推薦：Anthropic 原生格式" icon="star">
    端點：`/v1/messages`

    **凡是用 Claude Code、Cline、Cursor 等深度依賴 Claude 的客戶端，請務必使用原生格式。**

    只有原生格式才能正確觸發 **Prompt Cache（快取計費）**，長上下文/重複 system prompt 場景下賬單可大幅降低。
  </Card>

  <Card title="⚙️ 通用支援：OpenAI 相容格式" icon="plug">
    端點：`/v1/chat/completions`

    若你的專案原本就是 OpenAI SDK 寫的、**且不在意快取計費**，可以直接切到 Claude 模型，遷移成本幾乎為零。

    適合一次性指令碼、輕量呼叫、SDK 已固化的存量專案。
  </Card>
</CardGroup>

<Warning>
  **快取計費只在 Anthropic 原生格式下生效。** 在 Claude Code 等高頻、長上下文場景中，使用 OpenAI 相容格式可能讓賬單顯著偏高——這不是 API 易的問題，是上游協議本身的限制。
</Warning>

## 呼叫示例

### Anthropic 原生格式（推薦）

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "x-api-key: your-apiyi-key" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "你好，介紹一下你自己。"}
    ]
  }'
```

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "寫一個 Python 快速排序示例。"}
    ]
)

print(message.content[0].text)
```

### OpenAI 相容格式（通用遷移用）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "你好，介紹一下你自己。"}
    ]
)

print(response.choices[0].message.content)
```

## 關於 Opus 價格的提示

<Warning>
  **Opus 價格相對較高**。日常對話消耗一般，但在程式設計場景裡，由於大量 Tokens 輸入和輸出，賬單不低。建議先用 **\$10 小額度**測試實際消耗，再決定是否長期使用。
</Warning>

日常使用建議：

* **大多數場景**：優先 `claude-sonnet-4-6`，價效比最高。
* **簡單/高頻任務**：用 `claude-haiku-4-5-20251001`，速度快、成本低。
* **複雜程式設計/推理**：再切到 `claude-opus-4-8`。

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼 API易 不做更便宜的「低價逆向」通道？">
    因為低價的代價你看不見。逆向破解、共享賬號、降智或被悄悄替換的模型，都能把價格壓下來，但用的時候你完全不知道對方在通道里摻了什麼——輸出品質時好時壞、隨時可能斷供，甚至你的對話資料被轉賣你也察覺不到。

    我們只做**純正官轉**：預設走 AWS Bedrock 官方接入，替補走 Anthropic 官方 Key 直連，兩條通道都可溯源、按量計費、不留存你的資料。綜合成本約官網價 **85 折**，我們認為這是「穩定可靠」與「價格合理」之間最該守住的那條線——寧可貴一點，也不碰來路不明的便宜貨。
  </Accordion>

  <Accordion title="報錯 「thinking.type.enabled is not supported for this model」 怎麼辦？">
    這是經 AWS（Bedrock）通道呼叫 Opus 4.7 / 4.8 時最常見的 400 報錯，完整資訊形如：

    ```
    ValidationException: "thinking.type.enabled" is not supported for this model.
    Use "thinking.type.adaptive" and "output_config.effort" to control thinking behavior.
    ```

    **原因**：請求體裡傳了舊版固定預算思考寫法 `thinking: { "type": "enabled", "budget_tokens": N }`。Opus 4.7 / 4.8 已移除這種寫法，只支援自適應思考。

    **解決**：刪掉 `type: "enabled"` 和 `budget_tokens`，改用 `thinking: { "type": "adaptive" }` + `output_config.effort` 控制思考深度。同理 `temperature` / `top_p` / `top_k` 在這些模型上也已移除，傳了會 400。詳見 [Claude Effort 思考指南](/zh-Hant/api-capabilities/claude-effort-thinking)。
  </Accordion>
</AccordionGroup>

## 相關連結

* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* 充值與活動：`https://api.apiyi.com`
