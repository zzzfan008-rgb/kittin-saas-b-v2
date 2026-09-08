> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 什麼是分組？使用者分組與令牌分組解析

> 深入解讀 API易 的分組概念：使用者視角看像「我的分組」，實際生效的始終是令牌上所選的分組。含 ClaudeCode、Sora2Official、Wan&HappyHorse 等專屬分組案例與上游負載報錯的真實工單分析。

## 一句話回答

**分組是令牌可選擇的"呼叫通道"，決定可用模型範圍、計費倍率與上游路由。** 從使用者視角看像"我自己所在的分組"，但**每一次呼叫真正生效的，始終是令牌上選定的那個分組**。

## 使用者視角 vs 平臺視角

<CardGroup cols={2}>
  <Card title="使用者視角" icon="user">
    分組 = 我在建立/編輯令牌時**自選的通道**，決定這把令牌能用哪些模型、按什麼倍率計費、走哪條上游線路。
  </Card>

  <Card title="平臺視角" icon="layers">
    分組是**資源管理與突顯特性**的手段：把同類型模型、專屬算力、定向折扣聚合成一條通道，便於精準計費與差異化定價。
  </Card>
</CardGroup>

## "使用者分組" ≠ "令牌分組"，別混淆

很多使用者的第一反應是："我賬戶上是不是有個分組，需要在哪裡切換？"

* 賬戶層確實有"使用者分組"概念，決定**基礎權限範圍**（例如能否看到 SVIP 模型列表、是否解鎖企業兜底分組等）
* 但**每一次 API 呼叫，決定路由、計費倍率與模型可用性的，都是令牌上所選的分組**

<Tip>
  所以排查問題時，先看令牌的「選擇分組」與「兜底分組」設定，而不是去找"我賬戶的分組"。詳見 [令牌與分組](/zh-Hant/faq/token-and-groups)。
</Tip>

## 案例 1：為什麼會有 `ClaudeCode` 這個分組？

**目的**：把支援 Anthropic 原生 `/v1/messages` 呼叫格式的模型聚合到一個通道，讓你在 Claude Code、Cherry Studio、其它 Anthropic 原生客戶端裡**像呼叫 Claude 一樣**直接使用國產程式設計模型，**無需改任何程式碼格式**。

**包含哪些模型**：

* Claude 全系列（官轉 / AWS Claude）
* 國產相容 `/v1/messages` 的程式設計模型，如 `qwen3.x-max`、`glm-5.x`、`deepseek-v4` 等

**折扣**：

* 預設 **95 折（5% off）**，無需任何操作
* **可疊加充值加贈 10%–20%**，實際成本比官方直連便宜約兩成

**怎麼用**：

1. 開啟 [https://api.apiyi.com/token](https://api.apiyi.com/token) 新增或編輯令牌
2. 「選擇分組」選 `ClaudeCode`
3. 客戶端按 Anthropic 原生格式呼叫即可

## 案例 2：影片模型為什麼要走專屬分組？

影片模型的計費方式（按秒、按張、按時長）與文本模型完全不同，且各自的上游通道獨立。平臺用分組來**讓特殊計費規則精準生效**：

| 模型                       | 必須選擇的分組               |
| ------------------------ | --------------------- |
| Sora 2 官轉影片              | `Sora2Official`（按秒計費） |
| 阿里 Wan & HappyHorse 影片系列 | `Wan&HappyHorse`      |
| Seedance 2 影片            | 對應專屬分組（以控制台為準）        |

<Warning>
  走錯分組的常見後果：模型不可用（404）、計費異常或呼叫直接被拒。請確認令牌的「選擇分組」或「兜底分組」裡有目標模型對應的分組。
</Warning>

## 案例 3：報錯"當前分組上游負載已飽和"是平臺在限我嗎？

這是 SaaS 多使用者產品場景下的高頻問題，**取材自一次真實工單**。

**場景還原**：

* 開發者：我的工具是 SaaS 模式，多使用者分散呼叫，點選量一上來就報：
  > `error 429 (content-type-not-allowed)`：當前分組上游負載已飽和，請稍後再試
* 我以為是平臺限制了我的併發，需要在哪裡"分組"來規避？

**真相**：

* 這條錯誤**不是賬戶層面的併發限流**
* 它指的是：該模型在該分組所對應的**上游通道**當前繁忙
* 常見誘因：使用了廠商側仍處於 preview 階段的模型（例如 `*-preview-*` 命名的版本），其官方算力本身存在波動

**正確應對**：

<Steps>
  <Step title="放寬客戶端的超時與重試">
    把超時調到更寬鬆（如 60–120s），失敗重試間隔從立即重試改為指數退避；不要在錯誤瞬間立刻併發重發。
  </Step>

  <Step title="為常用模型掛兜底分組">
    在令牌上為目標模型對應的分組新增 1–2 個**兜底分組**，主分組擁塞時自動切換備用通道，提高成功率。
  </Step>

  <Step title="對高併發業務做模型評估">
    若業務對延遲和穩定性敏感，可在自己的場景裡**中性評估**同系列裡負載更穩定的型號（不同廠商通常會有更輕量、負載更分散的同系列分支），由業務側自行測試取捨。
  </Step>
</Steps>

<Info>
  我們沒有對客戶的呼叫做併發牆。這條 429 來自上游通道，**不是計費意義上的限流**，重試通常即可恢復。
</Info>

## 我該怎麼選分組？快速決策

| 你的場景                                                  | 選擇分組                        |
| ----------------------------------------------------- | --------------------------- |
| 文本、多模態、NanoBanana、Veo 3.1 等絕大部分模型                     | `Default`                   |
| Claude Code 裡同時使用 Claude 與國產程式設計模型（`/v1/messages` 格式） | `ClaudeCode`（預設 95 折，可疊加加贈） |
| Sora 2 官轉影片                                           | `Sora2Official`             |
| Wan\&HappyHorse / Seedance 2 影片                       | 對應專屬分組                      |
| 高併發不穩定、需要更高成功率                                        | 在令牌掛 1–2 個**兜底分組**          |

## 關於"組倍率"

控制台顯示的「組倍率」是**人民幣計價的相對值**，並非直接的美元折扣比例——`0.14x` 不等於"打 1.4 折"。一般情況下您**不需要深究**，選對分組即可；想理解倍率與價格換算，請看 [系統裡模型的【倍率】是什麼？](/zh-Hant/faq/model-multiplier)。

## 相關文件

<CardGroup cols={2}>
  <Card title="令牌與分組" icon="key" href="/zh-Hant/faq/token-and-groups">
    令牌作用、建立/編輯、檢視程式碼示例與分組一覽圖。
  </Card>

  <Card title="令牌計費模式" icon="calculator" href="/zh-Hant/faq/token-billing-modes">
    按量優先、按次優先等計費模式的區別。
  </Card>

  <Card title="模型倍率說明" icon="percent" href="/zh-Hant/faq/model-multiplier">
    倍率含義、人民幣計價單位與美元價格的換算。
  </Card>

  <Card title="模型可用性" icon="list" href="/zh-Hant/faq/model-availability">
    模型分級與不同使用者分組的訪問權限。
  </Card>
</CardGroup>
