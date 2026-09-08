> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 隱式快取計費指南

> Gemini 隱式快取自動啟用，命中按官方折扣計費。但命中率不如 Claude/OpenAI，做成本預算請按無快取價格估算。

API易 的 Gemini 通道自動啟用**隱式上下文快取**（implicit caching）：請求字首命中時按官方折扣計費，`cached_content_token_count` 欄位原樣回吐，零程式碼改動。

先說結論：**Gemini 快取"有，但別指望"** —— 隱式快取的命中行為由上游控制，實際命中率明顯不如 [OpenAI](/zh-Hant/api-capabilities/openai/prompt-caching) 和 [Claude](/zh-Hant/api-capabilities/claude-prompt-caching)。把它當作"有則更好"的額外優惠，**做成本測算時一律按無快取價格估算**。

本頁基於 Google 官方文件整理（`ai.google.dev/gemini-api/docs/caching`，2026年6月資料）。

## 機制一句話

請求開頭部分（字首）與近期請求相同且達到最小長度時，上游自動複用快取：命中部分按官方折扣計費（官方口徑**最高可省 90%**），無需打任何標記。

## 觸發條件

| 條件     | 要求                                                         |
| ------ | ---------------------------------------------------------- |
| 最小字首長度 | **Gemini 3 / 3.1 / 3.5 系列：4096 tokens**；2.5 系列：2048 tokens |
| 字首穩定   | 從第一個字元起逐位元組相同，動態內容（時間戳、隨機 ID）會切斷匹配                         |
| 時間視窗   | 快取會在閒置一段時間後過期，短時間內的連續請求更容易命中                               |

注意 Gemini 的起緩閾值（4096）比 OpenAI（1024）高不少 —— **短系統提示詞在 Gemini 上基本不會命中**，這是"Gemini 快取體感差"的原因之一。

## 怎麼判斷命中

看 `usage_metadata.cached_content_token_count`：

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[LONG_STABLE_PREFIX, question]
)

usage = response.usage_metadata
print(f"輸入: {usage.prompt_token_count}")
print(f"快取命中: {usage.cached_content_token_count}")  # > 0 即命中
```

命中部分在後臺賬單中按折扣倍率單列計費項；REST 響應裡的對應欄位為 `usageMetadata.cachedContentTokenCount`。

## 儘量提高命中率

方法論和 OpenAI 一致（詳細解釋見 [OpenAI 快取計費指南](/zh-Hant/api-capabilities/openai/prompt-caching)）：

* **穩定內容放前面**：長系統指令、文件、few-shot 示例在前；使用者輸入、時間戳在後
* **字首做長**：不足 4096 tokens（Gemini 3 系）的字首永遠不會命中
* **短時間內集中複用**：批次任務連續發，不要拉開間隔
* 多輪對話天然是追加式字首，相對容易命中

即便全部做對，**也不保證命中** —— 隱式快取是 best-effort 的，這點和 OpenAI/Claude 的確定性行為不同。

## 顯式快取（cachedContents）

Google 官方還有顯式快取 API（`cachedContents`，建立一個有 TTL 的快取物件再引用）。該介面是**有狀態的服務端資源**，API易 通道**暫不支援**，請使用隱式快取。

## 與其它通道對比

|       | Gemini                       | OpenAI          | Claude                    |
| ----- | ---------------------------- | --------------- | ------------------------- |
| 觸發    | 隱式自動                         | 全自動             | 手動標記                      |
| 最小閾值  | **4096**（3 系）/ 2048（2.5 系）   | 1024            | 1024–4096                 |
| 命中折扣  | 官方口徑最高省 90%                  | 命中 0.1×         | 命中 0.1×                   |
| 命中穩定性 | ⚠️ 不保證，體感一般                  | ✅ 穩定            | ✅ 穩定                      |
| 命中欄位  | `cached_content_token_count` | `cached_tokens` | `cache_read_input_tokens` |

**快取敏感的高頻長字首業務（Agent、RAG、批次文件），建議優先選 OpenAI 或 Claude 通道。** 全平臺快取支援總覽見 [快取計費 FAQ](/zh-Hant/faq/cache-billing)。

## 相關連結

* 同組頁面：[原生呼叫](/zh-Hant/api-capabilities/gemini/native) · [多模態與程式碼執行](/zh-Hant/api-capabilities/gemini/multimodal) · [FC函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)
* 其它通道：[OpenAI 快取計費](/zh-Hant/api-capabilities/openai/prompt-caching) · [Claude 快取計費](/zh-Hant/api-capabilities/claude-prompt-caching)
* Google 官方文件：`ai.google.dev/gemini-api/docs/caching`
