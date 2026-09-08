> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Codex、ClaudeCode 和 Default 分組有什麼區別？

> 說明 CodexReverse、ClaudeCode 與 Default 令牌分組的來源、協議和日常開發使用建議。

## 簡短回答

三個分組主要區別在於**上游來源、呼叫協議和適用工具**：

* **CodexReverse**：Codex 逆向資源通道，適合在 Codex 中日常開發，使用正常且快取命中率較高
* **ClaudeCode**：為 Claude Code 和 Anthropic 原生 `/v1/messages` 環境準備的專屬分組
* **Default**：通用官轉分組，適合混合呼叫 GPT、Claude、Gemini、DeepSeek 等不同模型

## 三個分組怎麼選

| 分組             | 主要特點                                 | 推薦場景                                                    |
| -------------- | ------------------------------------ | ------------------------------------------------------- |
| `CodexReverse` | Codex 逆向資源經濟通道，來源性質與官方 API 官轉不同      | Codex CLI、Codex 程式設計任務、成本敏感的開發呼叫                        |
| `ClaudeCode`   | 聚合相容 Anthropic 原生 `/v1/messages` 的模型 | Claude Code、Anthropic 原生客戶端、需要在 Claude Code 中使用相容程式設計模型 |
| `Default`      | 通用官轉資源，模型覆蓋範圍廣                       | 日常混合開發、生產級穩定性優先、一個令牌呼叫多類模型                              |

<Info>
  **“官轉”和“逆向”主要是上游資源來源不同。** `Default` 使用官方 API 轉發資源；`CodexReverse` 使用 Codex 逆向資源。兩者都可以正常呼叫，但生產穩定性、價格、快取表現和可用模型可能不同。
</Info>

## 日常開發推薦配置

如果您同時使用 Codex 和 Claude Code，保留兩把獨立令牌是合理的：

* Codex 中使用 `CodexReverse` 令牌
* Claude Code 中使用 `ClaudeCode` 令牌
* 如果還需要在其他程式裡混合呼叫多家模型，再額外保留一把 `Default` 令牌

這樣可以避免協議和路由混用，也方便分別檢視呼叫日誌與費用。

<Warning>
  分組會影響可用模型、路由和計費倍率。`CodexReverse` 不等同於官方 API 官轉資源；對生產級穩定性或來源合規要求較高的任務，建議優先使用 `Default` 官轉分組並進行實際測試。
</Warning>

## 相關文件

* [什麼是分組？](/zh-Hant/faq/groups-explained)
* [令牌與分組](/zh-Hant/faq/token-and-groups)
* [Codex CLI 接入指南](/zh-Hant/scenarios/programming/codex-cli)
* [Claude Code 接入指南](/zh-Hant/scenarios/programming/claude-code)
