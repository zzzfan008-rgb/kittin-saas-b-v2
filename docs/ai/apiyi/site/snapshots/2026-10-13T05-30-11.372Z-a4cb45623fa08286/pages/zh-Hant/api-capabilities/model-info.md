> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 當下熱門模型（保持更新）

> 檢視支援的400+AI模型詳細資訊，推薦給你當下熱門、好用的 AI 大模型。

API易 支援 400+ 主流 AI 模型，本頁面提供詳細的模型資訊、定價和使用說明。

<Note>
  **企業級專業穩定的AI大模型API中轉站**\
  本站均為官方源頭轉發，價格八折（疊加充值加贈和匯率優勢），聚合各種優秀大模型。不限速，不懼封號，按量計費，長期可靠服務。
</Note>

## 🔥 當前推薦模型

以下為當前穩定供給的熱門模型，完整模型列表和即時價格請訪問 [API易控制台定價頁面](https://www.apiyi.com/account/pricing)，也可檢視站內 [模型價格總覽](/models)。

<Warning>
  **模型升級建議**：我們推薦優先使用最新模型以獲得最佳效能，但請注意：

  1. **上線初期可能不穩定**：新模型剛釋出時，原廠商算力可能不足，導致響應慢、超時或偶發錯誤，通常數天至數週後趨於穩定
  2. **注意引數相容性**：新模型可能新增或變更引數（如 `max_completion_tokens` 替代 `max_tokens`），升級前請檢查 API 引數是否相容老模型
  3. **務必先測試再上線**：在將新模型用於生產環境前，務必在測試環境充分驗證，確保輸出品質和介面相容性符合預期
</Warning>

<Info>
  表格中上下文一欄標註為「—」的，表示廠商暫未公佈明確數值，實際以控制台與官方文件為準。價格均為每 100 萬 tokens 的定價（輸入/輸出），可疊加充值加贈優惠。
</Info>

## 模型分類

### 🤖 OpenAI 系列

#### 🆕 最新模型

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **GPT-6 Astra** 🔥 | `gpt-6-astra` | 1.05M | 6 代旗艦，主打電腦操作與長程 Agent，推理力度五檔（新增 `xhigh` / `max`），Terminal-Bench 4.0 **57.9%**、ScreenSpot-Pro 92.7%；\$10/\$50 | 頂級 Agent、電腦操作、科研 |
| **GPT-6 Sol** 🔥 | `gpt-6-sol` | 1.05M | 6 代中檔，價格約為 5.6 Sol 的一半且為長期價，128K 輸出；\$2/\$10 | 寫功能、審程式碼、資料分析 |
| **GPT-6 Luna** 🔥 | `gpt-6-luna` | 1.05M | 6 代輕量檔，\$0.10/\$0.50，適合摘要、抽取等大批次任務 | 高併發、成本敏感 |
| **GPT-5.5 Pro** | `gpt-5.5-pro` | 1M | 深度推理專用，Terminal-Bench 2.0 82.7%；**僅 `/v1/responses` 端點 + SVIP 分組**，價格高昂 | 頂級推理、科研（專業需求） |
| **chat-latest** | `chat-latest` | 400K | 去版本號別名，始終指向最新 ChatGPT Instant 模型 | 快速寫作、對話 |

<Note>
  **GPT-6 系列供給**：`default` / `svip` 官轉分組四項計費與官網一致，Chat Completions 與 Responses 雙端點實測可用（含函式呼叫），從 5.6 遷移只需改 `model` 欄位；Astra 另有 `Codex_Reverse` 分組按 0.5 折扣。Sol / Luna 單次上下文超過 272K 會整單進入更高一檔計費。詳見 [GPT-6 Astra 上線說明](/news/gpt-6-astra-launch) 與 [GPT-6 Sol / Luna 上線說明](/news/gpt-6-sol-luna-launch)。
</Note>

<Warning>
  **GPT Pro 系列（如 `gpt-5.5-pro`、`gpt-5.4-pro`）使用須知**：

  1. **僅支援 `/v1/responses` 端點**：不能走 `/v1/chat/completions`，呼叫前請確認 SDK / 程式碼已切換到 Responses API
  2. **價格高昂**：單次呼叫可能消耗數美金，且僅對 SVIP 分組開放，避免 Default 分組誤用
  3. **非專業需求不建議使用**：日常任務用 GPT-6 Sol 或 GPT-5.6 Sol 即可，Pro 僅適合對推理深度有極致要求的科研、頂級任務
</Warning>

#### ✅ 穩定/經典系列

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **GPT-5.6 Sol** ⭐ | `gpt-5.6-sol` | 1M | 5.6 代旗艦，Terminal-Bench 2.1 88.8%，`gpt-5.6` 別名指向它；\$4/\$20（9/3 起降價） | 前沿智慧、Agent 任務 |
| **GPT-5.6 Terra** | `gpt-5.6-terra` | 1M | 5.6 代主力檔，\$2/\$12 | 日常開發 |
| **GPT-5.6 Luna** | `gpt-5.6-luna` | 1M | 5.6 代輕量檔，\$0.20/\$1.20；256K 以上超長上下文表現較弱 | 高併發、成本敏感 |
| **GPT-5.5** ⭐ | `gpt-5.5` | 1M | 上代旗艦，SWE-bench Verified 88.7%，`xhigh` 推理檔 | 複雜智慧體、專業工作流 |
| **GPT-5.4** ⭐ | `gpt-5.4` | 1M | 上代主力，原生計算機操控，GDPval 83% | 複雜智慧體、專業工作流 |
| **GPT-5.4 Mini** | `gpt-5.4-mini` | 1M | 輕量高性價比 | 平衡效能與成本 |
| **GPT-5.2** | `gpt-5.2` | 400K | GDPval 70.9% 超越專業人士 | 程式設計規劃、結構化任務 |
| **GPT-5.1** | `gpt-5.1` | 128K | 智慧與速度平衡，SWE-bench 76.3%，24h 快取 | 綜合應用、程式設計 |
| **GPT-5.1 Codex** | `gpt-5.1-codex-high` | 128K | Codex 程式設計專用系列（含 medium / mini 檔） | 程式設計、智慧體任務 |
| **GPT-5** | `gpt-5` | 128K | 經典旗艦穩定版 | 頂級推理、複雜任務 |
| **GPT-5 Mini** | `gpt-5-mini` | 128K | GPT-5 輕量版，效能優異 | 平衡效能與成本 |
| **o3** | `o3` | 200K | 推理模型，已大幅降價，價效比極高 | 複雜推理、數學、程式設計 |
| **o4-mini** | `o4-mini` | 200K | 輕量級推理模型 | 程式設計任務 |
| **GPT-4.1** | `gpt-4.1` | 128K | 速度快，老牌主力模型 | 綜合應用 |
| **GPT-4o** | `gpt-4o` | 128K | 綜合能力平衡，多模態支援 | 通用場景 |
| **GPT-4o Mini** | `gpt-4o-mini` | 128K | 輕量快速版本 | 快速響應 |

<Warning>
  **GPT-5 及以上系列使用注意事項**：

  1. 溫度引數 `temperature` 必須設定為 1（只支援 1）
  2. 使用 `max_completion_tokens` 替代 `max_tokens`
  3. 不要傳遞 `top_p` 引數
</Warning>

<Info>
  **影像和影片生成模型**已移至專屬頁面，請訪問 [影像與影片生成模型](/zh-Hant/api-capabilities/image-video-models) 檢視完整列表和定價。
</Info>

### 🎭 Claude 系列 (Anthropic)

#### 🆕 最新模型

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Claude Opus 5.5** 🔥 | `claude-opus-5-5` | 1M | Terminal-Bench 4.0 **66.4%** 超過 Fable 5.1（55.8%），輸出速度比 Opus 5 快 30%+；\$4/\$20，比 Opus 5 更便宜 | 頂級程式設計、複雜智慧體 |
| **Claude Opus 5.5 Thinking** 🔥 | `claude-opus-5-5-thinking` | 1M | Opus 5.5 顯式思考版本 | 頂級推理任務 |
| **Claude Fable 5.1** 🔥 | `claude-fable-5-1` | 1M | Mythos 級旗艦同價升級，Terminal-Bench-Science 24.7% → **52.6%**，含 `-thinking` 變體；\$10/\$50 | 頂級任務、長任務非同步執行 |
| **Claude Sonnet 5** | `claude-sonnet-5` | — | SWE-bench Verified **85.2%**、Terminal-Bench 2.1 80.4%，AWS 純官轉高快取命中；\$2/\$10 | 程式設計首選、智慧體開發 |
| **Claude Opus 5** | `claude-opus-5` | 1M | Frontier Bench v0.1 43.3%，128K 輸出，思考預設開啟 + effort 五檔，含 `-thinking` 變體；\$5/\$25 | 頂級程式設計、複雜智慧體 |

<Warning>
  **Opus 5.5 / Fable 5.1 的破壞性變更**：強制工具呼叫（`tool_choice` 為 `any` / `tool`）直接報 400，思考塊與模型繫結、編輯歷史訊息會讓思考塊失效；Opus 5.5 另有**思考無法關閉**、effort 預設從 `high` 降為 `medium`。從舊版遷移前請先看 [Opus 5.5 上線說明](/news/claude-opus-5-5-launch) 與 [Fable 5.1 上線說明](/news/claude-fable-5-1-launch)。
</Warning>

<Warning>
  **Fable 5 / Fable 5.1 / Mythos 5 的 30 天資料保留合規**：因模型能力先進，Bedrock 與 Anthropic 對高風險濫用執行額外檢查，這兩款模型的**輸入與輸出將保留 30 天**用於嚴重濫用檢測，預設僅自動化安全系統訪問，人工審查僅在系統標記潛在危害時發生。保留髮生在 AWS / Anthropic 官方側，API易 為純透明代理、自身不保留資料；**其他 Claude 模型不受影響**。詳見 [Fable 5.1 上線說明](/news/claude-fable-5-1-launch)。
</Warning>

#### ✅ 穩定/經典系列

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Claude Fable 5** | `claude-fable-5` | — | 上代 Mythos 級旗艦，\$10/\$50 | 頂級任務 |
| **Claude Opus 4.8** | `claude-opus-4-8` | 1M (Beta) | Agentic 程式設計 69.2%，支援動態工作流 | 頂級程式設計、複雜智慧體 |
| **Claude Opus 4.7** ⭐ | `claude-opus-4-7` | 1M (Beta) | 程式設計基準較 4.6 +13%，工具錯誤降至 1/3，含 `-thinking` 變體 | 頂級程式設計、複雜智慧體 |
| **Claude Opus 4.6** | `claude-opus-4-6` | 1M (Beta) | Terminal-Bench 2.0 登頂，128K 輸出 | 頂級程式設計、複雜智慧體 |
| **Claude Sonnet 4.6** ⭐ | `claude-sonnet-4-6` | 1M (Beta) | 效能媲美 Opus 4.5，價效比極高 | 程式設計、智慧體開發 |
| **Claude Opus 4.5** | `claude-opus-4-5-20251101` | 200K | SWE-bench 80.9%，價格降至前代 1/3 | 複雜程式設計、頂級推理 |
| **Claude Sonnet 4.5** | `claude-sonnet-4-5-20250929` | 200K | 世界級編碼模型，SWE-bench 77.2%，含 `-thinking` 變體 | 程式碼生成、智慧體開發 |
| **Claude Haiku 4.5** ⭐ | `claude-haiku-4-5-20251001` | 200K | 高性價比編碼模型，SWE-bench 73.3%，速度 2 倍 | 即時聊天、結對程式設計 |
| **Claude 4 Sonnet** | `claude-sonnet-4-20250514` | 200K | 老牌穩定版本 | 程式碼生成、分析 |

<Note>
  **最新推薦**：Claude Opus 5.5 多數程式設計與知識工作基準超過 Fable 5.1，價格卻比 Opus 5 還低（\$4/\$20），官方稱典型負載綜合成本比 Opus 5 低約 40%。Sonnet 5 效能逼近 Opus 4.8 而更快更省。**穩定首選**：Opus 4.7 / Sonnet 4.6 經過充分驗證，適合已上線的生產工作流；Haiku 4.5 速度快 2 倍、價效比高。
</Note>

### 🌟 Google Gemini 系列

#### 🆕 最新模型

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Gemini 3.8 Flash** 🔥 | `gemini-3.8-flash` | — | 谷歌 9/2 推出的新一版 Flash，官方規格尚未公佈；150 例雙協議實測與 3.7 逐項對齊；\$0.75/\$3.75 與 3.7 同價平遷 | 程式設計、Agent、價效比 |
| **Gemini 3.7 Flash** 🔥 | `gemini-3.7-flash` | 1M | 64K 輸出，Terminal-bench 2.1 **85.8%**、DeepSWE 65.3%；\$0.75/\$3.75 為官方限時價（至 2026-12-31，之後 \$1.50/\$7.50） | 程式設計、Agent、多模態 |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | 1M | ARC-AGI-2 77.1%（3 Pro 的 2 倍+），谷歌最強推理模型 | 複雜推理、多模態分析 |
| **Gemini 3.1 Flash Lite** | `gemini-3.1-flash-lite` | 1M | GA 版，比 2.5 Flash 快 64%，\$0.25/\$1.50 | 高併發、大批次、低成本 |

<Warning>
  **注意**：Gemini 3 Pro Preview 已於 2026 年 3 月 9 日停止服務，請遷移至 Gemini 3.1 Pro Preview 或 Gemini 3.8 Flash。
</Warning>

#### ✅ 穩定/經典系列

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Gemini 3.6 Flash** | `gemini-3.6-flash` | 1M | 多模態 Flash，預設開思考（四檔可控），原生工具全放通；\$1.50/\$7.50 | 程式設計、Agent、多模態 |
| **Gemini 3.5 Flash-Lite** | `gemini-3.5-flash-lite` | 1M | 預設零思考、約 2 秒極速響應；\$0.30/\$2.50 | 高併發、低延遲、批次 |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` | 1M | Terminal-Bench 2.1 76.2%；\$1.50/\$9.00 | 程式設計 |
| **Gemini 3 Flash Preview** | `gemini-3-flash-preview` | 1M | SWE-bench 78%，含 thinking / nothinking 變體 | 程式設計、價效比 |
| **Gemini 2.5 Pro** ⭐ | `gemini-2.5-pro` | 2M | 正式版，程式設計優勢，多模態能力強 | 長文本、程式設計、多模態 |
| **Gemini 2.5 Flash** ⭐ | `gemini-2.5-flash` | 1M | 速度快，成本低，正式版 | 快速響應場景 |
| **Gemini 2.5 Flash Lite** | `gemini-2.5-flash-lite` | 1M | 超輕量版本，更快更便宜 | 大批次簡單任務 |

<Note>
  **最新推薦**：Gemini 3.8 Flash 與 3.7 Flash 同價，編碼與 Agent 能力較 3.6 Flash 大幅提升、價格只有一半，Gemini 原生格式與 OpenAI 相容格式雙端點可用，詳見 [3.8 Flash 上線說明](/news/gemini-3-8-flash-launch) 與 [3.7 Flash 上線說明](/news/gemini-3-7-flash-launch)。高併發低延遲場景可選 [3.5 Flash-Lite](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/overview)。**穩定首選**：Gemini 2.5 Pro（2M 超長上下文）和 Gemini 2.5 Flash 適合已定型的生產環境。
</Note>

### 🚀 xAI Grok 系列

#### 🆕 最新模型

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Grok 4.7** 🔥 | `grok-4.7` | 500K | 換用 2.1T 新基座，Terminal-Bench 4.0 18% → **33%**、DeepSWE 73%；\$2/\$6 與上代同價，但單任務輸出 tokens 約為 4.6 的兩倍 | 程式設計 Agent、長任務 |
| **Grok 4.6** 🔥 | `grok-4.6` | 500K | Artificial Analysis 智慧指數 **61**，追平 GPT-5.6 Sol Max；\$2/\$6 | 綜合任務、程式設計 |
| **Grok 4.5** | `grok-4.5` | 500K | 與 Cursor 聯合訓練，Agentic 工具呼叫單項登頂，輸出 token 效率高；\$2/\$6 | 程式設計、Agent 任務 |
| **Grok 4.3** | `grok-4.3` | 1M | Intelligence Index 53、τ²-Bench 98%、IFBench 81%；\$1.25/\$2.50，200K 後階梯翻倍 | 複雜推理、綜合任務 |
| **Grok 4 Fast Reasoning** | `grok-4-fast-reasoning` | 200K | 推理模式，顯示思考過程，降價 93%+ | 複雜推理任務 |
| **Grok Code Fast 1** | `grok-code-fast-1` | 256K | SWE-bench 70.8%，高速生成 | 程式碼生成、智慧體程式設計 |

#### ✅ 穩定/經典系列

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Grok 4.20 Beta** | `grok-4.20-beta` | 標準 | 含推理 / 多智慧體 / 非推理多個變體 | 綜合任務 |
| **Grok 4** | `grok-4` | 標準 | 官方版本，可選 `grok-4-all` 原生聯網 | 綜合任務、即時資訊 |
| **Grok 3** | `grok-3` | 標準 | 官方穩定版本 | 日常使用 |
| **Grok 3 All** | `grok-3-all` | 標準 | 原生聯網增強版 | 新聞資訊、市場分析 |
| **Grok 3 Mini** | `grok-3-mini` | 標準 | 帶推理能力的小模型 | 輕量任務 |

<Info>
  **按任務估算 Grok 成本**：4.5 / 4.6 / 4.7 單價相同（\$2/\$6），但 Grok 4.7 完成同一批任務的輸出 tokens 約為 4.6 的兩倍，按任務算的實際花費會上升；Grok 4.5 輸出最省。超過 200K tokens 的請求按官方第二檔費率計費。詳見 [Grok 4.7 上線說明](/news/grok-4-7-launch)。
</Info>

### 🔍 DeepSeek 系列

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **DeepSeek V4 Pro** 🔥 | `deepseek-v4-pro` | 1M | 1.6T/49B 啟用，SWE-Verified 80.6 接近 Claude/Gemini，Hybrid Attention | 複雜推理、程式設計、智慧體 |
| **DeepSeek V4.1 Flash** 🔥 | `deepseek-v4.1-flash` | — | DeepSeek 最新 Flash，OpenAI 與 Anthropic 雙格式可用（Anthropic 格式走 `ClaudeCode` 分組），快取命中低至 \$0.006；\$0.30/\$1.20 | 高併發、程式設計、Agent |
| **DeepSeek V3.2** | `deepseek-v3.2` | 128K | 效能比肩 GPT-5，工具呼叫融入推理 | 複雜推理、程式設計 |
| **DeepSeek V3.1** ⭐ | `deepseek-v3-1-250821` | 128K | 混合推理模式，Think/Non-Think 雙模式 | 智慧推理、程式設計 |
| **DeepSeek R1** | `deepseek-r1` | 64K | 推理模型 | 數學、推理 |
| **DeepSeek V3** | `deepseek-v3` | 128K | 綜合能力強 | 通用場景 |

### 🐘 國產模型系列

#### 智譜 AI (GLM)

**🆕 最新**：GLM-5.3、GLM-5.3-Flash | **✅ 穩定/經典**：GLM-5.2、GLM-5.1、GLM-5

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **GLM-5.3** 🔥 | `glm-5.3` | 1M | 沿用 5.2 的 753B MoE 基座只擴後訓練，Z.ai Code Bench 比 5.2 提升 **50%**；\$1.40/\$4.396 | 專案級程式設計、長程智慧體 |
| **GLM-5.3-Flash** 🔥 | `glm-5.3-flash` | 1M | GLM-5 系列首個原生多模態（文本/圖片/影片/檔案），Terminal-Bench 2.1 **84.3** 逼近 Claude Opus 4.8；\$0.15/\$0.50 | 多模態、高性價比程式設計 |
| **GLM-5.2** | `glm-5.2` | 1M | 阿里雲官轉直連，AA 智慧指數 **51** 開源第一，Terminal-Bench 2.1 81.0、SWE-bench Pro 62.1；\$1.142/\$3.997 | 專案級程式設計、長程智慧體 |
| **GLM-5.1** ⭐ | `glm-5.1` | 200K | SWE-Bench Pro 58.4，744B MoE，MIT 開源 | 複雜程式設計、智慧體 |
| **GLM-5** | `glm-5` | 200K | 744B 引數（40B 啟用），程式設計對齊 Claude Opus 4.5 | 複雜程式設計、系統工程 |
| **GLM-4.6** | `glm-4.6` | 200K | 程式碼與推理增強版，穩定可靠 | 程式設計、推理、智慧體 |
| **GLM-4.5** | `glm-4.5` | 128K | 標準版本，綜合能力強 | 通用場景 |

<Info>
  **GLM-5.3 系列要點**：

  * 旗艦 GLM-5.3 與 5.2 同基座、只擴後訓練，程式設計與網路安全能力（ExploitBench 54.4%，5.2 為 24.4%）大幅提升
  * GLM-5.3-Flash 是 320B-A18B 混合稀疏 + 線性注意力的原生多模態模型，價格約為旗艦的 1/10
  * 定價與智譜官網逐項一致，`default` / `svip` 分組可用；長任務建議把 timeout 調到 600 秒以上，詳見 [GLM-5.3 上線說明](/news/glm-5-3-launch)
</Info>

#### 阿里通義千問 (Qwen)

**🆕 最新**：Qwen3.8-Max | **✅ 穩定/經典**：Qwen3.7 系列、Qwen3.6 系列、Qwen Max / Plus / Turbo

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Qwen3.8-Max** 🔥 | `qwen3.8-max` | 1M | 2.4T 引數稀疏 MoE，131K 輸出，GPQA Diamond **92.6**、PaperBench 93.0，原生圖片/影片輸入；思考預設開啟，暫不支援 `/v1/responses`；\$1.65/\$4.95 | 智慧體、多模態、長文本 |
| **Qwen3.7-Max** | `qwen3.7-max` | 1M | AA Intelligence Index 56.6 全球前五、國產第一，agent 長程 35 小時自主任務；\$1.714/\$5.142 | 智慧體、多語言、長文本 |
| **Qwen3.7-Plus** | `qwen3.7-plus` | 1M | 3.7 代價效比檔，\$0.60/\$2.40 | 綜合任務、批次處理 |
| **Qwen3.6-Max-Preview** | `qwen3.6-max-preview` | 1M | 6 項程式設計基準登頂（AIME 2025 93%、GPQA 86%） | 程式設計、推理 |
| **Qwen3.6-Plus** | `qwen3.6-plus` | 1M | MoE 72B / 18B 啟用，Terminal-Bench 61.6，始終開啟思維鏈 | 程式設計智慧體 |
| **Qwen3.6-Flash** | `qwen3.6-flash` | 1M | 35B-A3B MoE，多模態，\$0.17/\$1.02 | 高性價比、多模態 |
| **Qwen3.6 開源雙模** | `qwen3.6-27b` / `qwen3.6-35b-a3b` | 1M | API易 官轉託管開源權重，免去租 GPU 與運維推理框架 | 私有化替代、成本敏感 |
| **Qwen Max** | `qwen-max` | 32K | 老牌穩定版本 | 綜合任務 |
| **Qwen Plus** | `qwen-plus` | 32K | 增強版本 | 價效比場景 |
| **Qwen Turbo** | `qwen-turbo` | 32K | 快速版本 | 低延遲場景 |

#### Moonshot Kimi 系列

**🆕 最新**：Kimi K3 | **✅ 穩定/經典**：Kimi K2.6、K2.5、K2

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Kimi K3** 🔥 | `kimi-k3` | 1M | 2.8 萬億引數開源旗艦，Kimi Delta Attention，LMArena Frontend Code Arena **登頂第一**，GPQA Diamond 93.5%、Terminal-Bench 2.1 88.3%；\$3/\$15 全區間統一計價，快取命中低至 \$0.30 | 前端程式設計、長程智慧體 |
| **Kimi K2.7 Code** | `kimi-k2.7-code` | 256K | 程式設計專用檔，\$0.95/\$3.99 | 程式設計任務 |
| **Kimi K2.6** ⭐ | `kimi-k2.6` | 256K | 1T MoE / 32B 啟用，SWE-Bench Pro 58.6；\$0.60/\$2.40 約官網 6 折 | 程式設計、智慧體 |
| **Kimi K2.5** | `kimi-k2.5` | 200K | 原生多模態，Agent Swarm 100 智慧體協作 | 多模態、智慧體 |
| **Kimi K2 正式版** | `kimi-k2-250711` | 200K | 火山引擎官方合作，穩定性強 | 生產環境 |

<Info>
  **Kimi K3 使用要點**：

  * 精確 1,048,576 tokens 上下文，**全區間統一計價**，長程式碼庫 / 長文件可整體塞入，不擔心跨檔漲價
  * 最大輸出預設 131,072、最高可調至 1,048,576 tokens；思考模式常開滿檔，請預留輸出預算
  * 自動上下文快取，命中部分輸入按 \$0.30/1M 計費（未命中價的 1/10），多輪對話收益顯著
</Info>

#### 字節跳動 Seed 系列

**🆕 最新**：Seed 2.1 Turbo | **✅ 穩定/經典**：Seed 2.0 Pro / Lite / Mini

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **Seed 2.1 Turbo** 🔥 | `dola-seed-2-1-turbo-260628` | 256K | 高頻生產型文本模型，Chat Completions 與 Responses **雙端點 15/15 用例實測通過**，思考開關可控 + 隱式/顯式雙層快取；\$0.50/\$2.50 | 高併發生產、批次抽取 |
| **Seed 2.0 Pro** | `seed-2-0-pro-260328` | — | AIME 2025 98.3、Codeforces 3020，Agent 能力出色；\$0.50/\$3.00 | 複雜推理、程式設計 |
| **Seed 2.0 Lite** | `seed-2-0-lite-260428` | — | 高性價比企業級，支援圖片/影片/文本多模態輸入；\$0.25/\$2.00 | 大規模生產場景 |
| **Seed 2.0 Mini** | `seed-2-0-mini-260428` | — | 超輕量檔，\$0.10/\$0.40 | 大批次簡單任務 |

<Warning>
  **Seed 2.1 Turbo 預設開啟深度思考**：不傳任何引數時，一句話的簡單問題也會先輸出數百 tokens 的思考內容（實測一句話自我介紹消耗 444 輸出 tokens，其中思考 409），且思考內容按輸出 tokens 正常計費。高頻短問答請把 `thinking: {"type": "disabled"}` 作為基線配置。詳見 [接入文件](/zh-Hant/api-capabilities/dola-seed-2-1-turbo/overview)。
</Warning>

### 🌐 MiniMax 系列

**🆕 最新**：MiniMax-M3 | **✅ 穩定/經典**：MiniMax-M2.7、M2.5

| 模型名稱 | 模型ID | 上下文長度 | 特點 | 推薦場景 |
| - | - | - | - | - |
| **MiniMax-M3** 🔥 | `MiniMax-M3` | 1M | 首個集前沿 Agent 程式設計、百萬上下文與原生多模態於一身的開源旗艦，SWE-Bench Pro **59.0** 反超 GPT-5.5 與 Gemini 3.1 Pro，MSA 稀疏注意力把長上下文推理成本降至前代 1/20 | 程式設計、智慧體、長上下文 |
| **MiniMax-M2.7** | `MiniMax-M2.7` | 標準 | 10B 引數 SWE-bench Pro 56.22%，自進化能力，最小 Tier-1 模型 | 程式設計、智慧體 |
| **MiniMax-M2.5** | `MiniMax-M2.5` | 標準 | 230B（10B 啟用），SWE-bench 80.2%，極致價效比 | 程式設計、智慧體、辦公自動化 |

<Info>
  **MiniMax-M3 計費說明**：

  * 採用階梯計費，0-512K 區間 \$0.30 輸入 / \$1.20 輸出（每 1M tokens），超出部分按更高檔單價計費
  * 注意模型名大小寫：`MiniMax-M3`（同系列 `MiniMax-M2.7-highspeed` 等亦區分大小寫）
  * 做百萬級長上下文任務前請預估好成本
</Info>

<Note>模型價格與官網對齊，且可能隨官網調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

## 💰 定價說明

### 計費方式

* **按量計費**：根據實際使用的 Token 數量計費
* **無最低消費**：充多少用多少
* **餘額有效期**：自充值之日起 365 天內有效，再次充值自動重置（詳見[充值活動說明](/zh-Hant/faq/recharge-promotions)）
* **即時扣費**：每次呼叫後立即從餘額扣除費用

### 價格優勢

* 官方源頭轉發，價格略有優勢
* 批次使用可聯絡客服獲取更優惠價格
* 新使用者註冊後賬號自帶 \$0.05 試用額度，可直接跑通接入驗證

### 檢視即時價格

訪問 [API易控制台定價頁面](https://www.apiyi.com/account/pricing) 檢視所有模型的最新價格，或檢視站內 [模型價格總覽](/models)。

## 🛠️ 使用建議

### 模型選擇指南

**程式設計開發**

* 頂級效能：Claude Opus 5.5（Terminal-Bench 4.0 66.4%）、GPT-6 Astra（Terminal-Bench 4.0 57.9%）、Claude Sonnet 5（SWE-bench 85.2%）、Kimi K3
* 高性價比：GPT-6 Sol（約 5.6 代半價）、Gemini 3.8 Flash / 3.7 Flash、GLM-5.3 / 5.3-Flash、MiniMax-M3、DeepSeek V4.1 Flash
* 備選：Grok 4.7 / 4.6、Qwen3.8-Max、GPT-5.6 Sol、Kimi K2.6

**文本創作**

* 首選：GPT-6 Sol、Claude Opus 5.5、Claude Sonnet 5、Gemini 3.8 Flash
* 備選：chat-latest、GPT-5.6 Terra、Claude Sonnet 4.6、GLM-5.3

**快速響應**

* 首選：Gemini 3.5 Flash-Lite（預設零思考、約 2 秒）、Claude Haiku 4.5（速度快 2 倍）、GPT-6 Luna
* 備選：Gemini 3.1 Flash Lite、Gemini 2.5 Flash、Seed 2.1 Turbo（需顯式關閉思考）

**長文本處理**

* 超長上下文：Gemini 2.5 Pro（2M）、Kimi K3（1M 全區間統一計價）、MiniMax-M3（1M）、GLM-5.3（1M）、GPT-6 系列（1.05M）、Claude Opus 5.5（1M）
* 注意：部分模型超過一定長度會按更高檔階梯計費（如 Grok 4.5 / 4.6 / 4.7 超 200K、GPT-6 Sol / Luna 超 272K、MiniMax-M3 超 512K），長任務前請預估成本

**影像生成**

* 最新推薦：gpt-image-2.5-flare / gpt-image-2.5-sunburst（2026-09 上線，原生 4K、size/quality 精確控制，與 gpt-image-2 同價，速度 / 編輯精度分別更強）、Nano Banana Pro（4K 高畫質，最佳文本渲染）
* 高性價比：Nano Banana 2（\$0.055/張，按量低至 \$0.025）、Nano Banana Lite（約 4 秒出圖，\$0.025/張）
* 專業設計：Seedream 5.0 Pro（\$0.12/次，互動式編輯 + 最多 10 張參考圖）、Seedream 5.0 Lite（\$0.035/張）
* 快速出圖：Seedream 5.0 Flash（2026-09 上線，\$0.018/張，15–20 秒出圖，中文排版準確）
* 最便宜：gpt-image-2-all（官逆，\$0.025/張）

**影片生成**

* 官轉首選：VEO 3.1 Official（按次 \$0.3 / \$1.2，4/6/8 秒，原生同步音軌）
* 國產主力：Seedance 2.5 與 2.0 系列（2.5 / 標準 / fast / mini 四檔）、Wan2.7、HappyHorse 1.1
* 注意：Sora 2 相關通道已下線，請改用上述通道，詳見 [影像與影片生成模型](/zh-Hant/api-capabilities/image-video-models)

**聯網搜尋**

* 原生聯網：Grok 4 All、Grok 3 All（無需工具呼叫）
* 搜尋 grounding：Gemini 3.8 Flash / 3.7 Flash / 3.6 Flash / 3.5 Flash-Lite

### 成本最佳化建議

1. **分級使用**：簡單任務用便宜模型，複雜任務用高階模型
2. **測試最佳化**：先用小模型測試，確定需求後再用大模型
3. **批次處理**：大量相似任務可以選擇 Luna / Lite / Mini 檔位
4. **快取複用**：善用各家的上下文快取（Kimi K3、Seed 2.1 Turbo、Claude 系列命中後輸入價可低至 1/10）
5. **關閉不必要的思考**：部分模型預設開啟深度思考（如 Seed 2.1 Turbo、Gemini Flash 系列、Qwen3.8-Max），高頻短問答顯式關閉可同時省錢提速

## 🔗 相關資源

* [模型價格總覽](/models) - 全量模型與即時價格
* [模型對比測試](https://imagen.apiyi.com/) - 影像生成效果對比
* [即時價格查詢](https://www.apiyi.com/account/pricing) - 最新定價資訊
* [API 文件](/zh-Hant/api-manual) - 詳細介面說明
* [快速開始](/zh-Hant/getting-started) - 整合指南

<Note>
  模型列表持續更新中，我們會及時新增最新發布的優秀模型。最新上新動態請關注 [網站公告](/changelog)。如需使用特定模型或有批次需求，請聯絡客服。
</Note>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.