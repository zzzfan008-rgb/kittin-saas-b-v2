> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5 / 2 生圖/編輯

> OpenAI GPT-Image 2.5 / 2 系列官轉接入：gpt-image-2.5-flare 速度優先、gpt-image-2.5-sunburst 編輯精度優先、gpt-image-2 仍可用，三款同價同參數。原生 2K/4K 任意解析度，參考圖自動高保真，支援文生圖、參考圖編輯、多圖融合、mask 局部重繪。

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

## 概述

本頁覆蓋 OpenAI **GPT-Image 2.5 / 2 系列**三款官轉模型：**`gpt-image-2.5-flare`**（速度優先）、**`gpt-image-2.5-sunburst`**（畫質與編輯精度優先）與上一代 **`gpt-image-2`**。2.5 於 2026-09-08 釋出，畫質高於 gpt-image-2、編輯更準、`quality` 新增 `xhigh` / `max` 兩檔，**價格與引數與 gpt-image-2 完全相同**。系列共同特性：**任意合法解析度（含 2K / 3840×2160 4K）**、**參考圖自動高保真**、**按 token 計費**。API易 閘道完整相容 OpenAI Images API，OpenAI 官方 SDK 把 `base_url` 指過來即可零程式碼改動直連。

<Note>
  **🎨 核心亮點**：原生支援任意合法解析度（最大 3840×2160 4K）+ 參考圖編輯自動啟用 high-fidelity + 中文提示詞原生支援 + 2.5 新增 `xhigh` / `max` 畫質檔。**適合需要精確控制 size / quality、要求與 OpenAI 官方一致、要 4K 出圖**的生產場景；文生圖預設選 `gpt-image-2.5-flare`，改圖選 `gpt-image-2.5-sunburst`。
</Note>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations`，輸入文本提示詞生成圖片，支援 size / quality / output\_format。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits`，multipart 上傳參考圖（最多 16 張）+ 編輯/融合指令，支援 mask 局部重繪。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、base64 渲染、上傳壓縮、品質引數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 GPT-Image 2.5 / 2 系列的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 GPT-Image 2.5 系列的「文生圖 + 圖片編輯」：文生圖用 `gpt-image-2.5-flare`，圖片編輯用 `gpt-image-2.5-sunburst`（兩款與 `gpt-image-2` 同價同參數，模型名做成配置項方便切換）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/gpt-image-2/overview.md](https://docs.apiyi.com/api-capabilities/gpt-image-2/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：客戶端 timeout 提到 360 秒兜底。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費，所以寧可多等也不要過早超時。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬，任何一層小於生成時間都會掐斷請求。

  2. 返回渲染：`/v1/images/generations` 固定返回 base64（`b64_json`，不帶 `data:` 字首），不是 URL。前端要能把 base64 渲染成圖片展示，並提供「儲存到本地」。不要傳 `response_format`，傳了直接報 400；也不要傳 `input_fidelity`。

  3. 上傳壓縮：調 `/v1/images/edits`（multipart，最多 16 張參考圖）前先壓縮參考圖——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。

  4. 品質引數：`quality` 必傳，預設 `medium`，前臺介面加一個品質下拉（`low` / `medium` / `high` / `xhigh` / `max`，後兩檔僅 2.5 模型接受、成本更高）。不要傳 `auto`——它是動態推理檔，費用和耗時都會漂移。注意 2.5 的檔位重新分過級：2.5 的 `high` 只等於 `gpt-image-2` 的 `medium`，從 `gpt-image-2` 遷移時不要原樣照搬 `quality`，同預算要改傳 `max`。

  5. 生產環境把模型名鎖到日期快照 `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08`，別名指向變化時不會被動跟著變。

  6. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                   | 擋掉的坑                                                                                                                              |
  | -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
  | timeout 提到 360 秒     | 主流 HTTP 客戶端預設 30-60 秒超時，會在服務端還在正常出圖時掐斷請求，而**斷連的請求照常計費**。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) |
  | 渲染 base64            | 本模型不返回 URL，按 `data[0].url` 取值只會拿到空值                                                                                               |
  | 不傳 `response_format` | 目前最高頻的 400 報錯，見本頁[常見問題](#常見問題)                                                                                                    |
  | 上傳前壓縮                | 手機原圖動輒 4-5MB，base64 編碼後還會再膨脹約 33%。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)                    |
  | 顯式傳 `quality`        | `auto` 是動態推理檔，同一條提示詞的費用和耗時會在檔位之間漂移                                                                                                |
  | 遷移不照搬 `quality`      | 2.5 的 `high` = `gpt-image-2` 的 `medium`，照搬會掉一檔                                                                                    |
  | 鎖日期快照                | 別名指向新快照時行為可能變，生產環境不該被動跟隨                                                                                                          |
</Accordion>

## 為什麼選 API易 的 GPT-image-2 官轉？

對標 OpenAI 官方通道，針對企業生產場景在 **穩定性**、**成本**、**接入體驗** 三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="官方通道 · 與官方一致" icon="shield-check">
    嚴格走 OpenAI 官方轉發鏈路，請求和響應 **100% 與 OpenAI 官方一致**——欄位、錯誤碼、模型行為完全相同，品質無損、無偷跑風險。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    不受 OpenAI 官方 **Tier 等級** 對 RPM / TPM 的硬限，企業量級請求可線性放大，批次生圖與高峰場景更從容。
  </Card>

  <Card title="同價 + 充值最低 85 折" icon="percent">
    預設單價與 OpenAI 官方一致，疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) **最低可享 85 折**，長期使用成本顯著下降。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，延遲穩定、免去出海改造。
  </Card>

  <Card title="模型生態齊全" icon="layers">
    官逆 [`gpt-image-2-all`](/zh-Hant/api-capabilities/gpt-image-2-all/overview)（\$0.03/張統一價）可無縫切換，另有價效比標杆 [Nano Banana Pro / 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)，按場景自由組合。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影像生成場景，具備豐富的選型、調優與整合經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 模型選型：flare / sunburst / gpt-image-2

2026-09-08 起，本組文件覆蓋 OpenAI GPT-Image 2.5 / 2 三款模型。**三款同價、同參數、同分組、同端點**，切換隻改 `model` 欄位：

| 對比項                     | `gpt-image-2.5-flare`                                               | `gpt-image-2.5-sunburst`               | `gpt-image-2`                      |
| ----------------------- | ------------------------------------------------------------------- | -------------------------------------- | ---------------------------------- |
| 定位                      | 速度優先的小模型，OpenAI 建議的日常預設                                             | 畫質優先的基座模型，OpenAI 目前最強的生成 / 編輯模型        | 上一代單一旗艦，仍可用                        |
| 畫質                      | 高於 gpt-image-2                                                      | 兩款中最高                                  | 基準                                 |
| 時延（1024² 實測 2026-09-09） | `low` 10 秒 / `high` 21 秒 / `max` 45 秒；OpenAI 稱比 gpt-image-2 最多低 50% | `low` 14 秒 / `high` 42 秒 / `max` 142 秒 | `low` 21 秒 / `high` 224 秒          |
| 編輯與多輪一致性                | 提升                                                                  | 提升更明顯，主體保留、多輪記憶更好                      | —                                  |
| `quality` 檔位            | 六檔，新增 `xhigh` / `max`                                               | 六檔，新增 `xhigh` / `max`                  | `low` / `medium` / `high` / `auto` |
| 當前快照                    | `gpt-image-2.5-flare-2026-09-08`                                    | `gpt-image-2.5-sunburst-2026-09-08`    | `gpt-image-2-2026-04-21`           |
| 適合                      | 批量出圖、社交內容、商品圖、時延敏感場景                                                | 多輪精修、成品級營銷物料、多圖融合                      | 已接入且不想改動的存量專案                      |

<Tip>
  **怎麼選**：文生圖預設用 `gpt-image-2.5-flare`，編輯 / 多圖融合用 `gpt-image-2.5-sunburst`；生產環境鎖定日期快照，避免別名指向變化時被動跟著變。已在用 `gpt-image-2` 的程式碼只需改一個模型名即可升級，其餘引數、價格、超時經驗都沿用。釋出解讀見 [GPT-image-2.5 上線：Flare 更快、Sunburst 更準](/news/gpt-image-2-5-launch)。
</Tip>

## 核心特性

<CardGroup cols={2}>
  <Card title="任意解析度（含 4K）" icon="expand">
    支援任意合法尺寸輸出，預設涵蓋 1K / 2K / 3840×2160 4K，自定義尺寸只需滿足邊長 16 倍數、比例 ≤ 3:1 等基本約束。
  </Card>

  <Card title="參考圖自動高保真" icon="wand-sparkles">
    編輯場景下自動啟用 high-fidelity，參考圖細節、人物身份、文字內容保留度大幅提升。**無需也不能**再傳 `input_fidelity`。
  </Card>

  <Card title="同檔降價 20-30%" icon="dollar-sign">
    1024×1024 高畫質從 1.5 時代的 \$0.25 級別降到 \$0.211/張，2K/4K 按 token 實計但同樣下行，長期使用成本明顯降低。
  </Card>

  <Card title="中文 + 文字渲染" icon="type">
    中文提示詞原生支援，招牌、海報、UI 截圖等場景的中英文文字渲染穩定，`high` 檔位下精細文字幾乎不糊。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="多圖融合（最多 16 張）" icon="layers">
    `image[]` 陣列最多接受 16 張參考圖，prompt 中可用「圖1/圖2/圖3」明確指代。
  </Card>

  <Card title="mask 局部重繪" icon="paintbrush">
    支援上傳帶 alpha 通道的 mask 圖，透明區域為重繪區，不透明區域保留原圖。
  </Card>

  <Card title="多種輸出格式" icon="file-image">
    支援 png（預設）/ jpeg / webp，jpeg/webp 可設 `output_compression` 控制體積。
  </Card>

  <Card title="OpenAI SDK 直連" icon="plug">
    把 `base_url` 指向 `https://api.apiyi.com/v1` 即可用 OpenAI 官方 SDK 直接呼叫，零程式碼改動遷移。
  </Card>
</CardGroup>

## 模型定價

API易 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2` 三款（Default 分組）**單價相同，且與 OpenAI 官網完全一致**，折扣體現在充值活動上——**充值 100 美金即送 10%，最多可送 20%**，📖 [瞭解充值活動](/zh-Hant/faq/recharge-promotions)。

### 按 token 計費單價（與官網一致）

按 token 計費，一次請求 = 文本輸入 + 圖片輸入 + 圖片輸出三段 token 之和：

| 計費項                | 單價（每 1M tokens）       | 說明                                   |
| ------------------ | --------------------- | ------------------------------------ |
| 文本輸入（Text Input）   | \$5.00                | prompt 文字部分                          |
| 圖片輸入（Image Input）  | \$8.00                | 編輯/融合場景的參考圖，按 Vision 規則換算 token      |
| 圖片輸出（Image Output） | \$30.00               | **成本大頭**，由 size × quality 決定 token 量 |
| 快取輸入（Cached Input） | 文本 \$1.25 / 圖片 \$2.00 | 已配置，但高併發下命中率有限，詳見 [FAQ](#常見問題)       |

**圖片輸入為什麼更貴？** 圖片輸入單價 \$8.00 / 1M tokens，是文本輸入 \$5.00 / 1M tokens 的 **1.6 倍**（官方定價如此）。這也是為什麼帶參考圖的編輯 / 多圖融合請求，輸入成本會明顯高於純文生圖——參考圖本身按 Vision 規則換算成大量 image token，且每個 token 的單價還比文本 token 高六成。

### 每張成本速查（官方按量定價表，gpt-image-2）

1K 預設尺寸下，`gpt-image-2` 每張輸出圖的典型成本（2.5 兩款同名檔位的 token 量不同，見下一節）：

| 畫質     | 1024×1024 | 1024×1536 | 1536×1024 |
| ------ | --------- | --------- | --------- |
| Low    | \$0.006   | \$0.005   | \$0.005   |
| Medium | \$0.053   | \$0.041   | \$0.041   |
| High   | \$0.211   | \$0.165   | \$0.165   |

<Info>
  **計費說明**：

  * 單價與 OpenAI 官網一致，疊加 [充值加贈](/zh-Hant/faq/recharge-promotions)（充 \$100 送 10%，最高 20%）後實際成本低於官方直連
  * 2K / 4K 無固定每張價，按輸入 + 輸出 token 實計
  * 編輯場景因強制高保真，輸入 token 明顯高於純文生圖
  * 流式出圖（`stream: true` + `partial_images: N`）每張 partial 額外消耗 100 個輸出 image token
  * 對比 `gpt-image-1.5`，同檔同尺寸 `gpt-image-2` 成本低約 20-30%
</Info>

### 2.5 兩款的畫質檔位與實測成本（2026-09-09 實測）

**同名檔位在 2.5 與 gpt-image-2 上的 token 量不同**：2.5 把畫質梯子重新分了級，`low` 不變，2.5 的 `high` 等於 gpt-image-2 的 `medium`，2.5 的 `max` 才等於 gpt-image-2 的 `high`。下表為 1024×1024 文生圖、同一條提示詞、序列各跑一次的 `usage.output_tokens` 與按 \$30 / 1M 折算的輸出費用（flare 與 sunburst 的 token 量逐檔相同，只有耗時不同）：

| quality  | gpt-image-2                   | gpt-image-2.5-flare          | gpt-image-2.5-sunburst        |
| -------- | ----------------------------- | ---------------------------- | ----------------------------- |
| `low`    | 196 tokens ≈ \$0.006（21 秒）    | 196 tokens ≈ \$0.006（10 秒）   | 196 tokens ≈ \$0.006（14 秒）    |
| `medium` | 1,756 tokens ≈ \$0.053（63 秒）  | 439 tokens ≈ \$0.013（10 秒）   | 439 tokens ≈ \$0.013（19 秒）    |
| `high`   | 7,024 tokens ≈ \$0.211（224 秒） | 1,756 tokens ≈ \$0.053（21 秒） | 1,756 tokens ≈ \$0.053（42 秒）  |
| `xhigh`  | ❌ 400                         | 3,122 tokens ≈ \$0.094（31 秒） | 3,122 tokens ≈ \$0.094（60 秒）  |
| `max`    | ❌ 400                         | 7,024 tokens ≈ \$0.211（45 秒） | 7,024 tokens ≈ \$0.211（142 秒） |

<Warning>
  **從 gpt-image-2 遷移時不要原樣照搬 `quality`**：同樣寫 `high`，2.5 的輸出 token 只有 gpt-image-2 的四分之一，畫質檔位也對應更低；想要與 gpt-image-2 `high` 同等的 token 預算，2.5 要傳 `max`。反過來，同樣的預算下 2.5 的 `high` / `xhigh` 給了兩個更便宜的中間檔。上生產前用自己的提示詞跑一輪 `usage.output_tokens` 核對，2K / 4K 尺寸按畫素比例外推。
</Warning>

### 多圖輸入的價格影響（2026-07 實測）

客戶常問：「參考圖是每張定量收費，還是圖片越大消耗越多？」答案是**兩者都影響，且張數嚴格線性累加**。`gpt-image-2` 對輸入圖固定高保真處理（`input_fidelity` 不可調，傳了直接 400），每張參考圖按尺寸/寬高比換算成 image token。以下為控制變數實測（編輯介面，2026-07-15）：

| 參考圖輸入             | `image_tokens`       | 輸入費用（\$8/M） |
| ----------------- | -------------------- | ----------- |
| 1 張 512×512       | 1024                 | ≈\$0.0082   |
| 1 張 1024×1024     | 1024                 | ≈\$0.0082   |
| 1 張 2048×2048     | 1521                 | ≈\$0.0122   |
| 1 張 4096×4096     | 1521                 | ≈\$0.0122   |
| 1 張 1024×1536（豎版） | 1536                 | ≈\$0.0123   |
| **4 張 1024×1024** | **4096（= 4 × 1024）** | ≈\$0.0328   |

三個規律：

1. **張數嚴格線性**：N 張參考圖 ≈ N × 單張 token。16 張 1024² 參考圖 ≈ 16384 tokens ≈ \$0.13——已與一張 `high` 輸出（\$0.211）同量級，多圖融合時不可忽略。
2. **尺寸有下限也有封頂**：小於等於 1024² 的方圖統一按 1024 tokens 計（把圖縮到 512 **不省錢**）；2048² 與 4096² 同為 1521 tokens（超大圖先縮放再換算，**封頂**）。單張參考圖的 token 大致在 800-1600 區間浮動（含寬高比影響）。
3. **token 由畫素尺寸決定，與檔案體積無關**：把圖壓到 1.5MB 是為了上傳穩定和速度，**不會減少 image token**；反過來，費用也不會因為你傳了 50MB 的原圖而爆炸（有封頂）。

<Tip>
  成本視角的直覺：`low` 輸出（196 tokens ≈ \$0.006）時，1 張參考圖的輸入費（≈\$0.008）反而比輸出還貴；`high` 輸出（≈\$0.211）時 1 張參考圖只佔約 4%。**輸出的尺寸和畫質永遠是價格的最大變數**，參考圖張數是第二變數。
</Tip>

### 2K/4K 成本預估（畫素比例外推，⚠️ 非官方固定價）

OpenAI 官方只公佈了 1K 尺寸的固定每張單價表，2K/4K **沒有官方逐尺寸定價**。下表是 API易 按「畫素總數比例」從上方 1K 官方單價**外推**的預估值，僅供預算參考：

| 畫質     | 2048×2048（2K 方形） | 2048×1152（2K 橫版） | 3840×2160 / 2160×3840（4K） |
| ------ | ---------------- | ---------------- | ------------------------- |
| Low    | ≈\$0.024         | ≈\$0.008         | ≈\$0.026                  |
| Medium | ≈\$0.212         | ≈\$0.062         | ≈\$0.216                  |
| High   | ≈\$0.844         | ≈\$0.248         | ≈\$0.870                  |

<Warning>
  **這不是官方定價表，是估算值。** 計算方法：以 1K 官方表中同長寬比的行為基準，按目標尺寸與基準尺寸的畫素總數比例線性外推（如 2048×2048 畫素數是 1024×1024 的 4 倍，估算成本也 ×4）。實際出圖的 image token 數由模型按內容複雜度動態決定，並非嚴格線性，**真實成本務必以每次呼叫響應裡的 `usage.output_tokens` 為準**（見下方「如何檢視每次呼叫的真實 token 數」）。`high` + 超過 2560×1440 的尺寸目前還是官方標記的實驗檔位，估算誤差可能更大。
</Warning>

### 與 SaaS 套餐 / 積分制計費方式的區別

影像生成類工具廠商常見兩種計費模式：

* **包月套餐（訂閱制）**：固定月費換取"每月可生成 N 張"的額度。這個額度背後是運營商按平均用量預估的**超賣定價**——套餐設計時就假設不是所有人都會用滿，宣傳的"單張成本"只是套餐價除以額度上限的理論值，跟你真實一張圖的實際生成成本沒有必然關係。
* **積分包 / 動態點數計費**：把不同畫質、尺寸的生成任務換算成不透明的"積分"消耗，本質上也是按量計費，只是用積分做了一層包裝，掩蓋了底層真實的 token 用量。

API易走的是**官轉 API + 按 token 實際用量計費**：沒有套餐額度，沒有積分模糊層，每次呼叫的成本 = 實際消耗的 input/output token × 官方單價，可以精確核算到每一次呼叫，不存在套餐"多退少補"或"超額限流"的問題。

<Tip>
  按量計費的代價是需要自己估算 / 監控用量，不像套餐那樣有固定月度總價的確定性——好處是用多少花多少，沒有閒置浪費。下面教你怎麼從響應裡直接拿到每次呼叫的真實 token 數，自己核算成本。
</Tip>

### 如何檢視每次呼叫的真實 token 數

`/v1/images/generations` 和 `/v1/images/edits` 的響應都帶 `usage` 欄位，**圖片輸入 token 和文本輸入 token 是分開返回的**，不用估算，直接讀欄位就能精確核算這一次呼叫的真實成本。下面是一次真實編輯請求（帶 1 張參考圖）返回的完整 `usage`（實測抓包）：

```json theme={null}
{
    "data": [ { "b64_json": "..." } ],
    "usage": {
        "input_tokens": 848,
        "input_tokens_details": {
            "image_tokens": 832,
            "text_tokens": 16
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 1044
    }
}
```

| 欄位                                        | 含義                                                                                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `usage.input_tokens_details.text_tokens`  | 輸入 prompt 文本消耗的 token 數，按 \$5.00 / 1M 計                                                                                                         |
| `usage.input_tokens_details.image_tokens` | 參考圖按 Vision 規則換算出的 token 數，按 \$8.00 / 1M 計；純文生圖（無參考圖）時恆為 0                                                                                      |
| `usage.input_tokens`                      | 上面兩項之和                                                                                                                                          |
| `usage.output_tokens`                     | 輸出圖片的 token 數，由 `quality × size` 共同決定，是**成本大頭**，按 \$30.00 / 1M 計，2K/4K 請求應重點關注這個值（`output_tokens_details.image_tokens` 與其相同，`text_tokens` 恆為 0） |
| `usage.total_tokens`                      | 輸入 + 輸出總和                                                                                                                                       |

自行核算公式（精確版）：

```
成本 ≈ input_tokens_details.text_tokens × \$5.00 / 1,000,000
     + input_tokens_details.image_tokens × \$8.00 / 1,000,000
     + output_tokens × \$30.00 / 1,000,000
```

<Tip>
  想看歷史呼叫的真實 token 消耗和計費明細，也可以直接去控制台「日誌」頁面查：📖 [如何檢視呼叫記錄](/zh-Hant/faq/call-logs)——日誌詳情裡會把「輸入價格 / 圖片輸入價格 / 輸出價格」和對應的 token 數都列出來，跟接口裡 `usage.input_tokens_details` / `usage.output_tokens_details` 是對應的。
</Tip>

## 分組介紹

GPT-Image 2.5 / 2 系列三款模型的官轉分組完全相同，可在後臺「令牌設定 → 分組」中切換：

| 分組                      | 倍率   | 適用場景                                   |
| ----------------------- | ---- | -------------------------------------- |
| `Default` 預設分組          | 1.0x | 與 OpenAI 官方同價，資源寬裕時首選；高峰期可能併發緊張、出現 429 |
| `image2Enterprise` 企業分組 | 1.2x | 預設分組緊張時的穩定過渡通道，穩定優先                    |
| `svip` 分組               | 見控制台 | 同樣開放三款模型，倍率以控制台令牌頁顯示為準                 |

**1.2x 倍率怎麼來的？** 基於"3000 美金單次充值大客戶加贈 20% 後約等官網原價"的口徑設定——平臺不計稅務成本，不賺錢也優先保障供給。預設分組不穩定時，把令牌切到 `image2Enterprise` 即可臨時過渡使用。

<Frame caption="令牌設定：選擇 image2Enterprise 分組（1.2x），常規資源不足時仍穩定">
  <img src="https://mintcdn.com/apiyillc/UtyWoIxj7WA74SC7/images/image2-enterprise-token-setup-20260425.png?fit=max&auto=format&n=UtyWoIxj7WA74SC7&q=85&s=10b41109f9642890dfdc96ec3b6afa03" alt="令牌建立介面：計費模式選「按量優先」，分組選 image2Enterprise（1.2x），高速正價的 GPT image 2 企業分組" width="1274" height="988" data-path="images/image2-enterprise-token-setup-20260425.png" />
</Frame>

📖 分組上線公告：[/live/2026-04/image2-enterprise](/live/2026-04/image2-enterprise)

## 技術規格

| 維度            | 引數                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **模型名**       | `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`（三款同參數，見上方「模型選型」一節）                                                                                              |
| **速度**        | 1024² 實測（2026-09-09）：`gpt-image-2.5-flare` `low` 10 秒 / `high` 21 秒 / `max` 45 秒；`gpt-image-2.5-sunburst` 14 / 42 / 142 秒；`gpt-image-2` `low` 21 秒 / `high` 224 秒。高畫質 + 2K/4K 更長 |
| **輸出解析度**     | 任意合法尺寸（1K/2K/4K，最大 3840×2160）                                                                                                                                                    |
| **畫質檔位**      | `auto` / `low` / `medium` / `high` / `xhigh` / `max`（`xhigh` / `max` 僅 2.5 兩款接受）                                                                                                 |
| **輸出格式**      | `png`（預設）/ `jpeg` / `webp`                                                                                                                                                       |
| **中文提示詞**     | ✅ 原生支援                                                                                                                                                                           |
| **提示詞上限**     | 32,000 字元（原廠上限，按字元計），見 [長提示詞篇](/zh-Hant/api-capabilities/image-long-prompt)                                                                                                      |
| **單次出圖數量**    | 1 張（`n=1`）                                                                                                                                                                       |
| **參考圖上限**     | 16 張（`image[]`）                                                                                                                                                                  |
| **單圖大小上限**    | multipart 檔案每張小於 50MB（png/jpg/webp）；base64 data URL 欄位約 20MiB，原圖建議 15MB 以內                                                                                                       |
| **mask 局部重繪** | ✅ 支援（要求帶 alpha 通道，PNG 且小於 4MB）                                                                                                                                                   |
| **透明背景**      | ✅ 支援（`background: "transparent"` + `png` / `webp`；`jpeg` 無 alpha 通道，與透明互斥；提示詞別描述場景，否則引數壓不過）                                                                                      |
| **響應欄位**      | `b64_json`（**純 base64，無字首**）；**不接受 `response_format` 引數**，傳了直接 400                                                                                                               |

## 端點一覽

| 端點                            | 用途                     | Content-Type          |
| ----------------------------- | ---------------------- | --------------------- |
| `POST /v1/images/generations` | 文生圖                    | `application/json`    |
| `POST /v1/images/edits`       | 參考圖編輯 / 多圖融合 / mask 重繪 | `multipart/form-data` |

<Tip>
  **域名選擇**：`api.apiyi.com` 為主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平臺提供的其他閘道域名，響應行為一致。
</Tip>

## 尺寸（size）詳解

### 預設尺寸

| size        | 含義      | 畫素   |
| ----------- | ------- | ---- |
| `auto`      | 自適應（預設） | 模型決定 |
| `1024x1024` | 方形 1:1  | 1K   |
| `1536x1024` | 橫版 3:2  | 1K   |
| `1024x1536` | 豎版 2:3  | 1K   |
| `2048x2048` | 方形 1:1  | 2K   |
| `2048x1152` | 橫版 16:9 | 2K   |
| `3840x2160` | 橫版 16:9 | 4K   |
| `2160x3840` | 豎版 9:16 | 4K   |

### 自定義尺寸約束

`gpt-image-2` 接受**任意合法尺寸**，只需同時滿足：

1. **最大邊 ≤ 3840px**
2. **兩條邊都是 16 的倍數**
3. **長短邊比例 ≤ 3:1**
4. **總畫素數 ∈ \[655,360, 8,294,400]**（下限約 0.65MP，上限約 8.3MP）

**合法示例**：`1600x1200`、`1792x1024`、`2048x1536`、`3200x1800`
**非法示例**：`1000x1000`（非 16 倍數）、`4000x4000`（超上限）、`3840x1000`（比例超 3:1）

<Warning>
  超過 `2560×1440`（約 3.69MP）的輸出目前官方標記為**實驗性**，可能不穩定或出現品質波動。生產環境建議優先用預設尺寸：`2048x1152` / `2048x2048` / `3840x2160` 等。
</Warning>

## 畫質（quality）詳解

### 可選檔位

| quality  | 含義               | 說明                                                         |
| -------- | ---------------- | ---------------------------------------------------------- |
| `auto`   | 自動（**預設**）       | 不傳 `quality` 時即為此值，由模型自動選檔                                 |
| `low`    | 低畫質              | 速度最快、成本最低，適合草稿 / 批次                                        |
| `medium` | 中畫質              | 日常 / 終稿的均衡選擇                                               |
| `high`   | 高畫質              | 文字、精細紋理、印刷場景；`gpt-image-2` 的最高檔                            |
| `xhigh`  | 超高畫質（**2.5 新增**） | 僅 `gpt-image-2.5-flare` / `sunburst` 接受，輸出 token 高於 `high` |
| `max`    | 最高畫質（**2.5 新增**） | 僅 2.5 兩款接受，成本與耗時最高，用於成品級終稿                                 |

<Warning>
  **預設是 `auto`，不是 `medium`。** 不傳 `quality` 等同於傳 `"quality": "auto"`，由模型自動選擇合適的畫質檔位，**官方沒有承諾它固定等同於 `medium`**。`auto` 選中的檔位不可控，會直接影響出圖成本、響應速度與計費穩定性。**需要控制成本和可預期性時，請顯式傳入 `low` / `medium` / `high` / `xhigh` / `max`，不要依賴 `auto`。**
</Warning>

<Warning>
  **不要傳舊版 DALL·E 的 `standard` / `hd`。** `quality` 只接受 `low` / `medium` / `high` / `xhigh` / `max` / `auto` 六個官方列舉值，其中 `xhigh` / `max` 僅 2.5 兩款接受。舊版 DALL·E 3 的 `standard` / `hd` 在不同後端渠道下行為不一致：有時直接 400 報錯（`invalid_value`），有時被靜默忽略、按 `auto` 檔跑出結果（費用不可控）。請始終顯式傳官方列舉值之一。
</Warning>

<Info>
  **`quality` 是影響價格最大的引數，比 `size` 更顯著。** 輸出圖片 token 量由 `quality × size` 共同決定，但 `quality` 的權重明顯更高——同一尺寸下從 `low` 到 `high`，每張成本可相差 **30 倍以上**（參見上方「每張成本速查」表：gpt-image-2 的 1024×1024 從 `low` \$0.006 到 `high` \$0.211；2.5 兩款從 `low` \$0.006 到 `max` \$0.211）。預算和選檔時應**優先按 `quality` 評估成本**，再疊加 `size` 的影響。
</Info>

## 最佳實踐

<Warning>
  **對接經驗：先用 `low` 跑通，再按需升檔**

  實測有客戶首次接入就直接拉滿 `quality=high` + 高解析度，**單張耗時 ≈ 235 秒（約 4 分鐘）**，一度誤以為是轉接器住。`high` 模式推理複雜度最高，4K 場景甚至接近 5 分鐘。**正式上線前請先用 `quality=low` 跑通整條鏈路**（鑑權、SDK、引數、超時、錯誤處理），確認功能 OK 後再按業務對畫質的實際需求逐檔升到 `medium` / `high`。
</Warning>

<Steps>
  <Step title="對接先跑 low 驗證鏈路">
    新接入時**優先用 `quality=low` + 預設尺寸**跑通整條鏈路（鑑權、引數、超時、錯誤處理）。`low` 速度比 `high` 快數倍，能快速暴露所有非畫質相關的問題，避免被長耗時干擾排查。
  </Step>

  <Step title="尺寸優先選預設">
    8 個預設尺寸經過官方最佳化，速度和品質更穩定；自定義尺寸留給真有比例需求的場景。
  </Step>

  <Step title="畫質按場景分檔">
    草稿 / 批次 → `low`；預設 / 終稿 → `medium`；文字、精細紋理、印刷 → `high`。**注意 `low` ↔ `high` 不僅是畫面精美度差異，還包含推理複雜度差異**——耗時差距可達數倍。
  </Step>

  <Step title="輸出格式選 JPEG">
    對最終展示無特別要求時，`output_format=jpeg` + `output_compression=85` 比 PNG 快且體積小一半以上。
  </Step>

  <Step title="文字場景鎖 high">
    文字渲染是主要賣點，但 low/medium 仍可能糊；招牌、海報類場景鎖 `quality=high`。
  </Step>

  <Step title="編輯場景準備參考圖">
    單張上限 50MB（建議壓到 1.5MB 以內），PNG/JPEG/WebP 均可；最多 16 張；prompt 裡用「圖1/圖2」指代順序。
  </Step>

  <Step title="透明背景：傳引數之外，提示詞別描述場景">
    `background: "transparent"` + `png` / `webp` 只保證輸出帶 alpha 通道；**提示詞或參考圖一旦描述了完整場景（森林、房間、街道），模型會按語義把場景畫出來**，引數攔不住，這就是「透明時好時壞」的主因，與 `quality` 無關（2026-09-11 實測：主體類提示詞 16/16 透明，寫了場景的 0/3，medium 與 high 一樣）。句尾固定加 `isolated subject on a transparent background, no scenery, no ground`；參考圖帶背景時在編輯提示詞裡寫明 `remove the background entirely, keep only the subject`。詳見 [透明背景 FAQ](/zh-Hant/faq/image-transparent-background)。
  </Step>

  <Step title="超時分檔配置（high 兜底 600 秒）">
    影響出圖耗時最大的是 **`quality`** 與 **`size`**，尤其是 `quality`。建議按檔位配置客戶端超時：

    | quality        | 推薦客戶端超時         | 實測耗時區間                                                                            |
    | -------------- | --------------- | --------------------------------------------------------------------------------- |
    | `low`          | ≥ **120 秒**     | 通常 10–40 秒                                                                        |
    | `medium`       | ≥ **240 秒**     | 通常 30–90 秒                                                                        |
    | `high`         | ≥ **600 秒**（兜底） | gpt-image-2 2K/4K 實測 3–5 分鐘，長尾可達 235 秒以上；2.5 兩款 1024² 實測 21–42 秒                  |
    | `xhigh`（僅 2.5） | ≥ **300 秒**     | 1024² 實測 31–60 秒（2026-09-09），2K/4K 更長                                             |
    | `max`（僅 2.5）   | ≥ **600 秒**（兜底） | 1024² 實測 45–142 秒，token 量與 gpt-image-2 `high` 相同，2K/4K 按 gpt-image-2 `high` 的經驗預留 |

    **`high` 模式務必配 600 秒兜底**，覆蓋排隊 / 長尾 / 服務抖動等各種異常情況；前端務必給進度反饋；服務端建議用任務佇列解耦。
  </Step>

  <Step title="遷移注意">
    從 `gpt-image-1.5` 遷移：刪掉 `input_fidelity`（強制高保真，傳了會報錯）；`background: transparent` 照常可用，無需改動。從 DALL·E 2/3 老程式碼遷移：**刪掉 `response_format`**（GPT Image 系列不接受此引數，傳了直接 400 `Unknown parameter: 'response_format'`，返回固定為 `b64_json`）。
  </Step>
</Steps>

## 錯誤碼與重試

| 狀態碼                               | 含義                                               | 處理建議                                                                                                                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`                             | 引數非法（size 不合約束、傳了不支援的欄位等）                        | 按尺寸約束章節校驗；**注意不要傳** `response_format` / `input_fidelity`；`background: transparent` 配 `output_format: jpeg` 也會 400（jpeg 無 alpha 通道），改用 `png` / `webp`；報 `Unknown parameter: 'response_format'` 直接刪掉該引數即可，見 [FAQ](#常見問題)；編輯介面報 `invalid_image_file` 多為手機原拍 MPO 圖，見 [FAQ](#常見問題) |
| `413`                             | 請求體過大（編輯介面多圖 / 超大 PNG，實測請求體 80MB 以上開始出現，同體積並非必現） | 報錯體是 `message: openai_error, code: bad_response_status_code`，由原廠鏈路返回，閘道不會自動重試；把參考圖壓到單張 10MB 以內、總體 50MB 以內（原廠單圖上限 50MB），也能把上傳等待從幾分鐘降下來                                                                                                                                         |
| `401`                             | 令牌無效                                             | 檢查 Bearer Token                                                                                                                                                                                                                                                               |
| `400` + `safety_violations=[...]` | 內容稽核攔截（實測狀態碼是 400，不是 403）                        | 多數發生在成圖之後、同一 prompt 時過時不過；`moderation: low` 隻影響提示詞側稽核。先給人物加明確服裝，再一次只改一個詞，見 [內容安全排查篇](/zh-Hant/api-capabilities/image-safety-troubleshooting)                                                                                                                                  |
| `429`                             | 限流 / 餘額不足                                        | 指數退避重試                                                                                                                                                                                                                                                                        |
| `5xx`                             | 閘道 / 後端錯誤                                        | 重試 1–2 次                                                                                                                                                                                                                                                                      |
| 超時                                | 長尾                                               | 客戶端超時按 `quality` 分檔：`low` ≥ **120 秒** / `medium` ≥ **240 秒** / `high` ≥ **600 秒**（high + 2K/4K 實測 3–5 分鐘，長尾可達 235 秒以上）                                                                                                                                                        |

<Info>
  **建議客戶端**：

  * 請求超時按 `quality` 分檔配置：`low` ≥ **120 秒** / `medium` ≥ **240 秒** / **`high` ≥ 600 秒**（兜底；實測 3–5 分鐘，按 120/360 秒配會大量誤超時）
  * **新接入先用 `quality=low` 跑通鏈路**，再按需升到 `medium` / `high`
  * 對 5xx 與超時做 **指數退避重試**（建議 2 次）
  * 記錄響應頭 `x-request-id` 方便排查
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="報 400「Unknown parameter: 'response_format'」怎麼辦？">
    **刪掉 `response_format` 引數即可，這是目前最高頻的 400 報錯。** `gpt-image-2`（及整個 GPT Image 系列）**不接受** `response_format`——返回格式固定為 `b64_json`，無需也不能指定。傳了就會報：

    ```json theme={null}
    {
      "error": {
        "message": "Unknown parameter: 'response_format'.",
        "type": "invalid_request_error",
        "param": "response_format",
        "code": "unknown_parameter"
      }
    }
    ```

    這個引數是 **DALL·E 2/3 時代**的遺留（當年可選 `url` / `b64_json`），網上大量舊示例程式碼和部分第三方庫預設會帶上它。遷移到 `gpt-image-2` 時把這個欄位刪掉，直接讀 `data[0].b64_json`（純 base64，decode 後即為圖片檔案）。該錯誤在入口引數校驗階段返回，**不計費**。

    如果業務確實需要拿到**圖片 URL** 而不是 base64：

    * 官方 `gpt-image-2` 沒有 URL 輸出，需自行 decode 後上傳到自己的物件儲存
    * 或改用官逆 [`gpt-image-2-all`](/zh-Hant/api-capabilities/gpt-image-2-all/overview)，它支援 `response_format: "url"`，返回 24 小時有效的 CDN 連結
  </Accordion>

  <Accordion title="返回的 b64_json 要不要自己加 data:image/png;base64, 字首？">
    **要**。`gpt-image-2` 返回的是**純 base64 字串**（無字首），與 `gpt-image-2-all` 不同。客戶端有兩種用法：

    * **寫檔案**：`base64.b64decode(b64_str)` 後寫入磁碟
    * **瀏覽器渲染**：`img.src = 'data:image/png;base64,' + b64_str` 自行拼字首

    若你的程式碼沿用了 1.5 時代的"已含字首"假設，會拿到損壞的 data URL，請顯式判斷。
  </Accordion>

  <Accordion title="為什麼傳 input_fidelity 會報 400？">
    `gpt-image-2` **強制啟用** high-fidelity 處理參考圖，不再接受 `input_fidelity` 引數。從 1.5 遷移時把這個欄位移除即可，無需替換。
  </Accordion>

  <Accordion title="想要透明背景怎麼辦？">
    直接傳 `background: "transparent"`，配合 `output_format` 為 `png` 或 `webp`，返回的就是帶 alpha 通道的透明底圖，不需要任何後處理摳圖。文生圖、圖片編輯兩條路都支援。

    兩個邊界：`jpeg` 沒有 alpha 通道，與透明互斥（會 400）；編輯介面傳透明時是**重繪去背**而不是沿原圖輪廓精確摳像，主體細節會有變化，要畫素級還原請自行用 `rembg` / `PIL` / `sharp` 處理。

    第三個邊界最常被忽略：**提示詞或參考圖描述了場景，模型就會把場景畫出來**，引數壓不過，升 `quality` 也沒用。只寫主體，句尾加 `isolated subject on a transparent background, no scenery, no ground`。

    完整說明與各模型支援情況見 [怎麼生成透明背景的圖片](/zh-Hant/faq/image-transparent-background)。
  </Accordion>

  <Accordion title="單次能出幾張？">
    1 張（`n=1`）。如需 N 張請客戶端並行 N 次呼叫。每次獨立按 token 計費。
  </Accordion>

  <Accordion title="2K/4K 出圖為什麼很慢？">
    輸出解析度越高、畫質檔位越高，需要生成的 image token 越多，自然耗時越長。**實測有客戶在 `quality=high` + 高解析度下耗時 ≈ 235 秒（約 4 分鐘）單張**，`3840×2160` + `high` 長尾可接近 5 分鐘。建議：

    * **新接入先用 `quality=low` 跑通鏈路**，確認正常後再按業務需求升檔
    * 客戶端超時按檔位配：`low` ≥ **120 秒** / `medium` ≥ **240 秒** / **`high` ≥ 600 秒**（兜底）
    * 前端顯示"生成中"進度反饋
    * 不需要 4K 時仍用 1024×1024 / 1536×1024 等 1K 預設
  </Accordion>

  <Accordion title="編輯請求為什麼比文生圖貴？">
    因為 `gpt-image-2` 對參考圖自動啟用 high-fidelity 處理，參考圖本身會按 Vision 計費規則換算成大量輸入 token。帶圖編輯的輸入 token 明顯高於文生圖，預算時要留足。
  </Accordion>

  <Accordion title="尺寸、參考圖都一樣，為什麼每次呼叫價格還不一樣？">
    **根因：`quality` 傳了 `auto`（或沒傳）。** 有客戶反饋「尺寸、解析度、參考圖完全一樣，價格卻忽高忽低」，定位後發現請求裡 `size` 和 `quality` 都用了 `auto`。

    **問題出在 `quality: auto`**：自動模式下，模型會**自行理解需求、臨時選擇不同的品質檔位**去創作。檔位不同 → 輸出的 image token 數量不同 → 價格自然不同。下面是三次「輸入完全一致（input 都是 1061 token）」卻價格相差數倍的真實賬單：

    | 耗時    | 輸入 token | 輸出 token | 單次價格           |
    | ----- | -------- | -------- | -------------- |
    | 53 秒  | 1061     | 1286     | \$0.055082     |
    | 135 秒 | 1061     | **5146** | **\$0.194042** |
    | 68 秒  | 1061     | 1287     | \$0.055118     |

    第二次 `auto` 被模型判定為更高畫質，輸出 token 飆到 5146，價格也隨之漲到約 3.5 倍。

    **解決辦法：不要讓 `quality` 用 `auto`，顯式傳 `low` / `medium` / `high`。** 固定檔位後，相同輸入的輸出 token 量和價格才穩定可預期。詳見上方「畫質（quality）詳解」章節。
  </Accordion>

  <Accordion title="快取計費（Cached Input）能享受到嗎？">
    **已配置，但請勿把緩存摺扣納入成本預算。** 官方快取單價為文本 \$1.25 / 圖片 \$2.00（每 1M tokens），API易 通道同樣配置了快取計費，命中時按快取價結算。

    但需要如實同步一個客觀限制：API易 為承載高併發，請求會分散到多個 OpenAI 上游賬號（單個 OpenAI Tier-5 賬號的 RPM 僅 250）。OpenAI 的提示詞快取不跨賬號共享，高併發下同一字首的請求未必落在同一賬號上，**快取可能命中不了**。

    好在影響很小：影像生成的成本大頭是圖片輸出 token（\$30 / 1M），緩存摺扣只作用於輸入端，對單張圖總成本的影響本就式微。建議按**全正價輸入**做預算，快取命中時視為額外節省。
  </Accordion>

  <Accordion title="圖片編輯介面的圖片數量和大小限制？">
    `gpt-image-2` 圖片編輯介面（`/v1/images/edits`）最多支援上傳 **16 張**參考圖：

    * **multipart/form-data 檔案上傳**：每張圖片**小於 50MB**，支援 `png` / `jpg` / `webp`
    * **base64 data URL 方式**：欄位長度限制約 **20MiB**（schema `maxLength: 20971520`，是字串欄位限制，**不等同於** multipart 的 50MB 上限），實際原圖建議控制在 **15MB 以內**
    * **mask 檔案**：單獨限制為 **PNG 且小於 4MB**

    實踐建議：不要多張大圖同時頂滿上限——請求體過大易在閘道 / 超時層面失敗，每張先壓到 **1.5MB 以內**最穩，且輸出畫質與輸入體積無關。
  </Accordion>

  <Accordion title="編輯介面報 400「Invalid image file or mode for image 1」怎麼辦？">
    這個報錯（`code: invalid_image_file`）的含義是：**第 N 張參考圖不是標準的 png / jpg / webp 格式**（序號從 1 開始，按序號定位問題圖）。

    最常見的根因是手機原拍照片的 **MPO 格式**：華為 Mate 系列等機型直出的 `.jpg` 內嵌 HDR 增益圖副幀，實為多幀 JPEG 容器（MPO）。檔案頭同為 `FFD8`，副檔名和 `file` 命令都顯示 JPEG，肉眼無法分辨——2026-07 實測 MPO 圖必被拒，重編碼為標準 JPEG/PNG 後**原解析度上傳即成功**（與尺寸、`image[]` 欄位名、`quality`/`size` 引數均無關）。該錯誤在入口校驗階段返回，**不計費**。

    **修復**：上傳前用 Pillow 重編碼（`Image.open(f).format` 返回 `"MPO"` 即需轉換）：

    ```python theme={null}
    from PIL import Image
    im = Image.open("photo.jpg")
    im.load()                          # MPO 只取第一幀
    im.convert("RGB").save("photo_fixed.jpg", quality=92)
    ```

    完整說明與判別方法見 [圖片編輯 API「參考圖格式要求與預處理」](/zh-Hant/api-capabilities/gpt-image-2/image-edit#參考圖格式要求與預處理)。
  </Accordion>

  <Accordion title="mask 檔案怎麼準備？">
    * 與原圖**相同尺寸**，**PNG 格式**，單張**小於 4MB**
    * **必須帶 alpha 通道**：透明區域（alpha=0）= 要重繪的部分，不透明區域 = 保留
    * 僅對第一張 image 生效
    * mask 是"軟引導"非精確邊界，模型可能在蒙版周圍擴充套件 / 收斂
  </Accordion>

  <Accordion title="和 gpt-image-2-all 怎麼選？">
    | 選                                                    | 場景                                                                                     |
    | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
    | **gpt-image-2.5-flare / sunburst / gpt-image-2**（官方） | 需要精確控制 size / quality、要求與 OpenAI 官方完全一致、要 4K 出圖、要 mask 局部重繪；三款中 flare 最快、sunburst 編輯最準 |
    | **gpt-image-2-all**（官逆）                              | 追求統一價 \$0.03/張、約 30–60 秒出圖、引數極簡、對一致性 / 中文文字要求高                                         |
  </Accordion>

  <Accordion title="能用 OpenAI 的官方 SDK 直連嗎？">
    可以，零程式碼改動。把 `base_url` 指向 `https://api.apiyi.com/v1`，`api_key` 設為 API易 令牌即可：

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(model="gpt-image-2.5-flare", prompt="...", size="2048x1152", quality="high")
    ```
  </Accordion>

  <Accordion title="支援主動中斷生成任務嗎？">
    **不支援**。`gpt-image-2` 走 OpenAI 官方同步端點，請求一旦提交就會跑到結束，無法發出"取消"指令。客戶端即使斷開連線，服務端仍會把這次生成完整跑完並照常計費。建議在客戶端做好超時控制，不要依賴"斷連就不收費"的假設。
  </Accordion>

  <Accordion title="有請求速率限制（RPM）嗎？">
    預設 **100 RPM**（每分鐘 100 次請求）。實際可用 RPM 還會受**全平臺總併發**動態調整。如果你的業務需要更高配額，請聯絡我們告知預估 QPS / RPM，可單獨申請擴容資源。
  </Accordion>

  <Accordion title="支援非同步呼叫嗎？">
    **不支援**。`gpt-image-2` 嚴格與 OpenAI 官方一致——只有同步呼叫，發起請求後阻塞等待結果（`high` 檔 + 4K 實測 1–2 分鐘）。如需非同步佇列、回撥通知等能力：

    * 在業務層用任務佇列（Celery / BullMQ 等）自行封裝非同步
    * 或改用 [`gpt-image-2-all`](/zh-Hant/api-capabilities/gpt-image-2-all/overview)，出圖約 30–60 秒，更適合前端輪詢
  </Accordion>

  <Accordion title="提示詞有長度上限嗎？為什麼 ChatGPT 網頁版能貼更長？">
    有，**32,000 字元**，是 OpenAI Images API 的原廠上限，按字元不按 token，API易 官轉不額外收緊。網頁版看起來沒限制，是因為貼進去的資料由對話模型先讀、再自己寫一條短提示詞去調圖片工具，圖片模型從沒直面那份資料。有品牌手冊、包裝規格這類長資料時，先用文本模型提煉成 1K～3K 字元的結構化提示詞再出圖，做法見 [長提示詞篇](/zh-Hant/api-capabilities/image-long-prompt)。
  </Accordion>

  <Accordion title="報 400「safety_violations=[sexual]」但提示詞並不色情，怎麼辦？">
    這類攔截多數發生在**成圖之後**：圖先生成，再被輸出側分類器攔下，所以失敗耗時和成功一樣長，同一 prompt 也會時過時不過。`moderation: low` 只降低提示詞側稽核強度，對它無效。最常見的原因是人物只寫了氣質沒寫服裝，模型自由發揮後越線：**先給人物加一句明確的服裝描述**（其餘不動），不行再一次只改一個詞做消融。完整案例與 20 次實測記錄見 [內容安全排查篇](/zh-Hant/api-capabilities/image-safety-troubleshooting)。
  </Accordion>

  <Accordion title="生成失敗會扣費嗎？">
    **不會**。OpenAI 自帶內容安全稽核，觸發稽核或引數非法時會直接返回 `400` 錯誤並**不計費**。典型響應：

    ```json theme={null}
    {
      "status_code": 400,
      "error": {
        "message": "Your request was rejected by the safety system. ...",
        "type": "shell_api_error",
        "code": "moderation_blocked"
      }
    }
    ```

    其它常見的 0 計費錯誤：`401`（令牌無效）、`429`（限流）。**只有請求實際進入模型生成階段（即收到 `200` + `b64_json`）才會按 token 計費**。
  </Accordion>
</AccordionGroup>

## 相關文件

* [⚖️ 官轉 vs 官逆 對比](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - 選型對照表，幫你決定用哪個
* [文生圖 Playground](/zh-Hant/api-capabilities/gpt-image-2/text-to-image) - `/v1/images/generations` 線上除錯
* [圖片編輯 Playground](/zh-Hant/api-capabilities/gpt-image-2/image-edit) - `/v1/images/edits` 多圖融合 + mask
* [深度解讀：GPT-image-2.5 上線，Flare 更快、Sunburst 更準](/news/gpt-image-2-5-launch) - News 文章
* [深度解讀：gpt-image-2 上線說明](/news/gpt-image-2-launch) - News 文章
* [完整接入文件（中文）](/zh-Hant/api-capabilities/gpt-image-2/overview) - 完整 API 參考
* [GPT-Image-2-All（官逆版本）](/zh-Hant/api-capabilities/gpt-image-2-all/overview) - 更便宜、更快的備選方案
* [社群貢獻：Luck GPT-Image 2 ComfyUI 節點](/zh-Hant/scenarios/ecosystem/luckgpt2-comfyui) - 在 ComfyUI 中一鍵呼叫 `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`（含 mask / 16 圖輸入 / 六檔畫質 / 自定義尺寸）
* [社群貢獻：APIYI GPT-Image 2 Skills](/zh-Hant/scenarios/ecosystem/apiyi-gpt-image-skills) - 在 Codex CLI / Cursor / Gemini CLI 等 AI 程式設計工具中一句話呼叫
* [API 使用手冊](/zh-Hant/api-manual) - 通用呼叫規範

<Info>
  `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2` 是 OpenAI 官方模型，按 token 實計；如果你更看重統一定價（\$0.03/張）和出圖速度（30–60s），可參考 [gpt-image-2-all](/zh-Hant/api-capabilities/gpt-image-2-all/overview)。
</Info>
