> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易支援快取計費嗎？

> 支援。Claude、OpenAI、Gemini、DeepSeek、Qwen、Grok 等主流通道都支援快取計費，命中欄位原樣回吐、賬單按官方折扣倍率計算

## 簡短回答

**支援。** API易 的 **Claude、OpenAI、Gemini、DeepSeek、Qwen、Grok** 等主流通道都支援快取計費：快取相關請求引數原樣轉發上游，響應裡的快取命中欄位原樣回吐，後臺賬單按官方折扣倍率單列快取計費項 —— 你的程式碼無需為中轉層做任何適配。

其中 **Claude 和 OpenAI 的快取命中穩定好用**（站內有專門指南，見下方連結）；DeepSeek、Qwen、Grok 同為全自動字首快取，穩定字首下正常命中 —— 其中 **Grok 的上游明確不保證 100% 命中**，做成本測算建議按無快取價打底；Gemini 的隱式快取雖然支援，但**命中率一般**，建議不要把成本預算押在 Gemini 快取上。

## 三大通道對比

|      | OpenAI（gpt-5 系列）                                               | Claude                                                         | Gemini                                                         |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| 觸發方式 | **全自動**，零程式碼                                                   | 手動打 `cache_control` 標記                                         | 隱式快取，自動啟用                                                      |
| 最小閾值 | 1024 tokens                                                    | 按模型 1024–4096 tokens                                           | 4096（3 系）/ 2048（2.5 系）                                         |
| 寫入費  | 免費                                                             | 1.25×（5 分鐘）/ 2×（1 小時）                                          | 免費                                                             |
| 命中價  | 輸入價 0.1×                                                       | 輸入價 0.1×                                                       | 按 Google 官方折扣                                                  |
| 實際體驗 | ✅ 命中穩定                                                         | ✅ 命中穩定                                                         | ⚠️ 命中率一般                                                       |
| 詳細指南 | [OpenAI 快取計費](/zh-Hant/api-capabilities/openai/prompt-caching) | [Claude 快取計費](/zh-Hant/api-capabilities/claude-prompt-caching) | [Gemini 快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching) |

## 各通道說明

### OpenAI：全自動，最省心

請求字首不少於 1024 tokens 且保持穩定，就自動命中，命中部分按輸入價 **1 折**計費，沒有寫入費 —— 第 2 次請求即淨省。怎麼寫出會命中的請求、怎麼用 `prompt_cache_key` 提高命中率，見 [OpenAI Prompt Caching 快取計費指南](/zh-Hant/api-capabilities/openai/prompt-caching)。

### Claude：手動打標記，省得最狠

在要快取的 content block 上打 `cache_control` 標記，命中按 **0.1×** 計費（寫入收 1.25× / 2×）。Claude Code、Cline、Cursor 等深度場景必備。注意**只在 Anthropic 原生格式（`/v1/messages`）下生效**，用 OpenAI 相容格式調 Claude 拿不到快取。詳見 [Claude Prompt Caching 快取計費指南](/zh-Hant/api-capabilities/claude-prompt-caching)。

### Gemini：支援但別指望太高

API易 對 Gemini 原生格式自動啟用隱式上下文快取，命中部分按 Google 官方折扣計費。但實際使用中 **Gemini 的快取命中率明顯不如 Claude / OpenAI**（上游隱式快取的命中行為不可控），建議：

* 把緩存摺扣當作"有則更好"的額外優惠，**做成本測算時按無快取價格估算**
* 對快取敏感的高頻長字首業務，優先選 OpenAI 或 Claude 通道

## DeepSeek / Qwen / Grok 等其它通道

這幾家的快取都是**全自動**的（無需打標記），通過 API易 呼叫同樣正常命中，實際體驗良好：

| 通道             | 觸發方式                       | 命中折扣（官方口徑）                                                                                       | 命中穩定性         |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| **DeepSeek**   | 全自動，字首匹配                   | 命中省 **90% 以上**，是幾家裡折扣最狠的                                                                         | ✅ 穩定          |
| **Qwen（通義千問）** | 隱式快取自動啟用，字首不少於 1024 tokens | 命中按官方折扣價計費                                                                                       | ✅ 穩定          |
| **Grok（xAI）**  | 全自動，字首匹配                   | 命中省約 **75%**（`grok-4.6`，具體按模型檔位），詳見 [Grok 快取計費指南](/zh-Hant/api-capabilities/grok/prompt-caching) | ✅ 命中確定，但上游不保證 |

提高命中率的思路和 OpenAI 一致：**穩定內容放前面、動態內容放後面**，時間戳和隨機 ID 別放 prompt 開頭。具體玩法可直接套用 [OpenAI 快取計費指南](/zh-Hant/api-capabilities/openai/prompt-caching) 裡的"穩定字首"方法論。

## 怎麼確認自己命中了

看響應 `usage` 裡的快取欄位：

| 通道                                 | 命中欄位                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| OpenAI `/v1/chat/completions`      | `usage.prompt_tokens_details.cached_tokens`                  |
| OpenAI `/v1/responses`             | `usage.input_tokens_details.cached_tokens`                   |
| Claude `/v1/messages`              | `usage.cache_read_input_tokens`                              |
| Gemini 原生格式                        | `usageMetadata.cachedContentTokenCount`                      |
| DeepSeek                           | `usage.prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` |
| Qwen / Grok `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens`                  |
| Grok `/v1/responses`               | `usage.input_tokens_details.cached_tokens`                   |

欄位大於 0 即命中。後臺呼叫日誌中，命中部分會按折扣倍率單列計費項，可直接核對。

## 注意事項

<Warning>
  **快取跟著呼叫格式走**：用 OpenAI 相容格式（`/v1/chat/completions`）調 Claude 模型時，無法獲得 Claude 的緩存摺扣 —— 深度使用 Claude 請走原生 `/v1/messages` 格式。
</Warning>

* 快取按**模型隔離**：換模型（哪怕同系列不同檔位）不共享快取
* 上表未列出的其它廠商模型（如 Kimi 等），快取支援情況以呼叫日誌實際回吐的快取欄位為準
* 各家官方機制細節可參考：`platform.openai.com/docs/guides/prompt-caching`、`docs.claude.com/en/docs/build-with-claude/prompt-caching`、`ai.google.dev/gemini-api/docs/caching`、`api-docs.deepseek.com/quick_start/pricing`、`docs.x.ai/developers/advanced-api-usage/prompt-caching`

## 相關文件

<CardGroup cols={2}>
  <Card title="OpenAI 快取計費指南" icon="database" href="/zh-Hant/api-capabilities/openai/prompt-caching">
    全自動快取：1024 tokens 起步、命中 1 折、prompt\_cache\_key 提高命中率
  </Card>

  <Card title="Grok 快取計費指南" icon="database" href="/zh-Hant/api-capabilities/grok/prompt-caching">
    命中省 75%、128 token 塊粒度、長對話該走哪個端點
  </Card>

  <Card title="Gemini 快取計費指南" icon="database" href="/zh-Hant/api-capabilities/gemini/prompt-caching">
    隱式快取的觸發閾值與預期管理
  </Card>

  <Card title="Claude 快取計費指南" icon="database" href="/zh-Hant/api-capabilities/claude-prompt-caching">
    cache\_control 怎麼打、回本點計算、多輪對話進階玩法
  </Card>

  <Card title="模型倍率說明" icon="calculator" href="/zh-Hant/faq/model-multiplier">
    瞭解控制台分組倍率與美元價格的換算關係
  </Card>

  <Card title="呼叫日誌查詢" icon="file-text" href="/zh-Hant/faq/call-logs">
    檢視每次請求的 tokens 消耗和快取計費明細
  </Card>
</CardGroup>

## 聯絡我們

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    快取功能諮詢、技術支援
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
