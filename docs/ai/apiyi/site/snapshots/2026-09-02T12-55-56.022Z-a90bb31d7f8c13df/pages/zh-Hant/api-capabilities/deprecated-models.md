> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 廢棄模型列表

> 檢視即將下線和已廢棄的模型列表，及時遷移到推薦替代模型。

## 說明

本頁面列出即將下線和已廢棄的模型，幫助您瞭解模型生命週期，提前做好遷移準備。

<Warning>
  如果您正在使用即將廢棄的模型，請儘快遷移到推薦的替代模型，以避免服務中斷。
</Warning>

## ⚠️ 廢棄模型預告

以下模型即將下線，請在預計下線日期前完成遷移。

| 模型名稱                                | 模型ID                                  | 預計下線日期         | 推薦替代模型                   | 備註                                                                                                               |
| ----------------------------------- | ------------------------------------- | -------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Gemini 3 Pro Preview                | `gemini-3-pro-preview`                | 已透明替換（2026-05） | `gemini-3.1-pro-preview` | **與谷歌官方同步**：考慮到已有客戶在線上使用舊 ID，呼叫 `gemini-3-pro-preview` 會自動路由到 `gemini-3.1-pro-preview`，避免業務中斷；建議儘快遷移到新 ID        |
| Gemini 3.1 Flash Lite Preview       | `gemini-3.1-flash-lite-preview`       | 已透明替換（2026-05） | `gemini-3.1-flash-lite`  | **與谷歌官方同步**：谷歌已於 2026-05-25 下線該 Preview，呼叫舊 ID 會自動路由到 `gemini-3.1-flash-lite`，**價格相同**、跟隨官網變化，避免業務中斷；建議儘快遷移到新 ID |
| Gemini 2.0 Flash Lite               | `gemini-2.0-flash-lite`               | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整體下線                                                                                                |
| Gemini 2.0 Flash Lite 001           | `gemini-2.0-flash-lite-001`           | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整體下線                                                                                                |
| Gemini 2.0 Flash                    | `gemini-2.0-flash`                    | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整體下線                                                                                                |
| Gemini 2.0 Flash 001                | `gemini-2.0-flash-001`                | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整體下線                                                                                                |
| Gemini 2.0 Flash Lite Preview 02-05 | `gemini-2.0-flash-lite-preview-02-05` | 待定             | `gemini-2.5-flash`       | Preview 版本                                                                                                       |

<Info>
  谷歌 Gemini 模型廢棄詳情請參考官方文件：`ai.google.dev/gemini-api/docs/deprecations`
</Info>

## 🚫 已下線模型

以下模型已廢棄，不再可用。如果您的應用仍在呼叫這些模型，請儘快切換到替代模型。

| 模型名稱                   | 模型ID                                                                                      | 下線日期       | 替代模型                                    | 備註                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------- | ---------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kimi K2                | `kimi-k2`                                                                                 | 2026-05-28 | `kimi-k2.6`                             | 舊版 Kimi K2 系列，請遷移到最新的 K2.6                                                                                                                                    |
| Kimi K2 128K           | `kimi-k2-128k`                                                                            | 2026-05-28 | `kimi-k2.6`                             | 舊版長上下文 K2，K2.6 已預設 256K 上下文                                                                                                                                   |
| Kimi K2 Instruct       | `kimi-k2-instruct`                                                                        | 2026-05-28 | `kimi-k2.6`                             | 舊版指令微調 K2，請遷移到 K2.6                                                                                                                                           |
| DeepSeek V3.1          | `deepseek-v3-1-250821`                                                                    | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 系列下線，請遷移至 V4：複雜推理選 Pro，高併發/價效比選 Flash                                                                                                             |
| DeepSeek V3.1 Terminus | `deepseek-v3.1-terminus`                                                                  | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 系列下線，請遷移至 V4                                                                                                                                      |
| DeepSeek R1 (250528)   | `deepseek-r1-250528`                                                                      | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | R1 推理模型已被 V4 系列取代，推理能力請用 V4 Pro                                                                                                                               |
| GPT-4                  | `gpt-4`                                                                                   | 2026-02-27 | `gpt-5.2`                               | 一代目強者，已停用                                                                                                                                                     |
| GPT-4（32K）             | `gpt-4-32k`                                                                               | 2026-02-27 | `gpt-5.2`                               | 一代目強者，已停用                                                                                                                                                     |
| Grok 4                 | `grok-4`                                                                                  | 2026-03-12 | `grok-4-1-fast-reasoning`               | 已下線，請遷移至新版                                                                                                                                                    |
| Grok 4 0709            | `grok-4-0709`                                                                             | 2026-03-12 | `grok-4-1-fast-reasoning`               | 已下線，請遷移至新版                                                                                                                                                    |
| Sora 2 影片生成（官轉）        | `sora-2` / `sora-2-pro` / `sora-2-remix`                                                  | 2026-07-01 | `doubao-seedance-2-0` / `wan2.7-t2v`    | **Sora 2 全系已下線**。OpenAI 官方算力持續傾斜導致超時嚴重，官方定於 9 月正式下線，本站提前於 7 月 1 日下線 `Sora2Official` 分組，該分組現已停用。詳見 [服務通知](/live/2026-07/sora2-official-offline)                |
| Sora 2 影片生成（逆向）        | `sora_video2` / `sora_video2-landscape` / `sora_video2-15s` / `sora_video2-landscape-15s` | 2026-04-26 | `doubao-seedance-2-0` / `wan2.7-t2v`    | 逆向通道下線。其後繼的官轉 Sora 2 也已於 2026-07-01 下線，請直接遷移到 [SeeDance 2.0](/zh-Hant/api-capabilities/seedance2/overview) 或 [Wan2.7](/zh-Hant/api-capabilities/wan/overview) |
| Sora 2 角色生成            | `sora-character`                                                                          | 2026-04-26 | `doubao-seedance-2-0`                   | 逆向通道下線。人物一致性場景請改用 [Seedance 素材庫](/zh-Hant/api-capabilities/seedance2/asset-library)                                                                           |
| Sora Image 生圖/編輯（逆向）   | `sora_image`                                                                              | 2026-04-26 | `gpt-image-2-all`（新版官逆）                 | 逆向通道下線，請遷移至 [GPT-Image-2-All](/zh-Hant/api-capabilities/gpt-image-2-all/overview)                                                                             |
| GPT-4o Image 生圖/編輯（逆向） | `gpt-4o-image`                                                                            | 2026-04-26 | `gpt-image-2-all`（新版官逆）                 | 逆向通道下線，請遷移至 [GPT-Image-2-All](/zh-Hant/api-capabilities/gpt-image-2-all/overview)                                                                             |

## 🔗 各大模型官方棄用頁面

各模型供應商的官方模型生命週期與棄用公告頁面，便於對照查詢最新動態。點選卡片直接跳轉到官方文件。

<CardGroup cols={2}>
  <Card title="OpenAI" icon="square-terminal" href="https://platform.openai.com/docs/deprecations">
    GPT 系列模型棄用列表與替代建議
  </Card>

  <Card title="Anthropic Claude" icon="brain" href="https://platform.claude.com/docs/zh-CN/about-claude/model-deprecations">
    Claude 模型棄用計劃（中文官方文件）
  </Card>

  <Card title="Google Gemini" icon="gem" href="https://ai.google.dev/gemini-api/docs/deprecations">
    Gemini 系列模型下線時間表與遷移指引
  </Card>

  <Card title="xAI Grok" icon="bolt" href="https://docs.x.ai/developers/migration/models">
    Grok 模型遷移說明與歷次下線公告
  </Card>

  <Card title="阿里雲 Qwen" icon="cloud" href="https://help.aliyun.com/zh/model-studio/newly-released-models">
    百鍊平臺 Qwen 模型上下架與更新公告
  </Card>

  <Card title="DeepSeek" icon="fish" href="https://api-docs.deepseek.com/updates">
    DeepSeek API 更新日誌與模型變更記錄
  </Card>
</CardGroup>

<Info>
  以上鍊接將跳轉至各廠商官方文件，建議收藏並定期檢視，以掌握最新的模型下線安排。
</Info>

<Info>
  本頁面會持續更新，建議定期檢視以獲取最新的模型廢棄資訊。
</Info>
