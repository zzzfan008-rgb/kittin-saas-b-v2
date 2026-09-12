> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 白底圖出現黑點 / 髒塊 / 模糊色塊怎麼辦？

> Google Aistudio API 出純白背景圖時容易出現髒塊、黑點或模糊色塊，可改提示詞換淺色背景，或切 Vertex 線路解決。

## 簡短回答

這是 Google Aistudio API 出圖的已知問題，純白背景在算力緊張時容易出現黑點、髒塊或模糊色塊，自 2026 年 4 月起多次出現。有兩種解決辦法：

* **方案一（推薦先試）**：把提示詞裡的「白色背景」改成別的淺色背景（如淺灰、米色、淡藍），無需任何配置變更
* **方案二**：聯絡運營開通 `VertexGemini` 分組，建立令牌時選該分組，走 Google Vertex 平臺出圖，能根治純白背景模糊問題

## 詳細說明

Google Aistudio 通道在算力緊張時段（高峰 / 資源排程緊張）對**大面積純色畫素區域**（尤其是白色）壓縮處理不夠穩定，容易產生三類瑕疵：

* **黑點 / 髒塊**：影像局部出現深色斑點或不規則髒塊
* **模糊色塊**：原本純白的區域出現灰白、淺黃的霧化區域
* **整體偏色**：白色背景偏暖（米黃）或偏冷（灰藍），與提示詞不一致

這個問題**不是模型能力問題**，而是 Aistudio 出圖鏈路在純色背景上的渲染缺陷。Nano Banana Pro / Nano Banana 2 等 Gemini 影像模型在 Aistudio 通道都會出現。

## 解決步驟

### 方案一：提示詞規避（首選）

把提示詞中的「白色背景 / pure white background / #FFFFFF」改成其他淺色背景描述：

* **淺灰**：`淺灰色背景` / `light gray background, #F5F5F5`
* **米色**：`米色背景` / `beige background, #F5F0E5`
* **淡藍**：`淡藍色背景` / `light blue background, #E8F0F8`
* **透明**：`透明背景`（若模型支援 alpha 輸出）

<Info>
  實測把白色改成淺灰或米色後，黑點、髒塊問題幾乎完全消失；這不會影響主體物的色彩還原，只改背景色。
</Info>

### 方案二：切到 Vertex 線路

如果你的場景必須用純白背景（例如電商主圖、產品白底圖），切到 Vertex 通道可以根治此問題。

#### VertexGemini 分組說明

| 專案       | 說明                                                                     |
| -------- | ---------------------------------------------------------------------- |
| **標識**   | `VertexGemini`                                                         |
| **描述**   | Vertex Gemini Models: Nano Banana Pro / 2 Series，提供 Vertex 渠道專門的生成圖片資源 |
| **支援模型** | Nano Banana Pro、Nano Banana 2                                          |
| **優勢**   | 能解決純白背景修圖時的模糊背景問題                                                      |
| **劣勢**   | 整體併發不高（約 100 RPM），僅開放給特邀客戶；圖片生成用時比 Aistudio 略慢                         |

#### 使用方式

<Steps>
  <Step title="聯絡運營開通">
    聯絡 API易 客服或運營同事，申請開通 `VertexGemini` 分組權限。該分組目前僅對特邀客戶開放。
  </Step>

  <Step title="建立專用令牌">
    登入 API易 後臺 → 「令牌管理」 → 「建立令牌」 → **選擇分組 `VertexGemini`** → 儲存金鑰。
  </Step>

  <Step title="切換呼叫">
    用該新令牌呼叫 Nano Banana Pro / Nano Banana 2 模型即可，呼叫地址不變（仍是 `https://api.apiyi.com/v1`）。
  </Step>
</Steps>

<Warning>
  **Vertex 分組併發較低（約 100 RPM）**，不建議用於線上高併發場景。主力出圖仍建議使用預設分組（Aistudio），僅在遇到純白背景問題時切到 Vertex 測試對比。
</Warning>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼提示詞改色之後就不出問題了？">
    Aistudio 通道的渲染問題主要發生在**大面積純色畫素區域**的壓縮與重建環節。把白色改成淺灰 / 米色，相當於讓背景變成有細節的淺色填充，規避了「純色大面積壓縮」這個觸發條件，問題就消失了。
  </Accordion>

  <Accordion title="Vertex 通道的圖片品質一定比 Aistudio 好嗎？">
    不一定。Vertex 通道在「純白 / 純色背景」場景下渲染更穩，但在其它場景（如複雜構圖、人物特寫）兩者差異不大，且 Vertex 用時更長。**只有當你確認是純白背景觸發問題時才切 Vertex**。
  </Accordion>

  <Accordion title="VertexGemini 分組如何申請？">
    目前僅對特邀客戶開放，請聯絡 API易 客服 / 運營同事申請。普通使用者先用方案一（提示詞換淺色）通常就夠用了。
  </Accordion>

  <Accordion title="切到 Vertex 後請求地址需要改嗎？">
    **不需要**。Base URL 仍是 `https://api.apiyi.com/v1`，只是令牌所屬分組變了，API易 後端會自動路由到 Vertex 平臺。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="Nano Banana 圖片失敗" icon="banana" href="/zh-Hant/faq/nano-banana-image-failure">
    Nano Banana 系列模型的常見出圖問題與排查方法。
  </Card>

  <Card title="Google Aistudio vs Vertex 線路" icon="network" href="/zh-Hant/faq/google-upstream-aistudio-vertex">
    Aistudio 與 Vertex 兩條 Gemini 出圖線路的差異與選擇建議。
  </Card>

  <Card title="企業分組 Vertex 兜底" icon="building" href="/zh-Hant/faq/enterprise-group-vertex-fallback">
    企業使用者如何用 Vertex 分組做兜底出圖。
  </Card>

  <Card title="圖片非同步 API" icon="loader" href="/zh-Hant/faq/image-async-api">
    圖片生成非同步任務介面的使用方式。
  </Card>
</CardGroup>
