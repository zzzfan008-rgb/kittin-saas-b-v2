> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 有沒有既能輸出文本、又能生成圖片的對話式 API？

> 「能看圖」和「能出圖」是兩回事；哪些模型吃圖片輸入、哪些模型才能出圖、真正一個介面同時返回文本和圖片的只有哪一類，以及四條出圖路線怎麼選。

## 簡短回答

<Info>
  **三句話講完：**

  1. **「能看圖」和「能出圖」是兩件事**。絕大多數新對話模型都能**讀**圖片（這就是通常說的「多模態」），但它們**不能生成**圖片；能出圖的是另一類專門的圖片模型。
  2. **真正「一個介面同時返回文本和圖片」的，只有 Gemini 出圖系**——`gemini-3-pro-image`（Nano Banana Pro）、`gemini-3.1-flash-image`（Nano Banana 2）等，響應裡文本段和圖片段是混排的。
  3. **其餘場景都是編排**：對話模型 + 獨立出圖介面兩個 API 協作，或者用 `gpt-5.5` + Responses 原生 `image_generation` 工具，讓模型自己決定什麼時候畫。
</Info>

## 先分清兩件事：圖片「進」和圖片「出」

大部分困惑來自「多模態」這個詞——它在 API 語境裡**預設指輸入側**，也就是「你能給模型喂圖片」，
而不是「模型能給你產出圖片」。這兩件事的模型池、端點、計費方式完全不同：

| 維度   | 圖片輸入（識圖 / vision）                                          | 圖片輸出（出圖 / 生成）                                                             |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| 誰具備  | **絕大多數新對話模型**——GPT-5 系、Claude 系、Gemini 文本系、Grok 系等         | **少數專門的圖片模型**，全站近 300 個模型裡只有 30 多個                                        |
| 典型端點 | `POST /v1/chat/completions`、`/v1/responses`、`/v1/messages` | `POST /v1/images/generations`、`POST /v1/images/edits`                     |
| 圖片在哪 | **請求**裡：`content` 陣列放 `image_url` 或 base64                 | **響應**裡：`data[0].url` / `data[0].b64_json`，Gemini 系在 `parts[].inlineData` |
| 計費口徑 | 圖片折算成 token，按對話價計                                          | 按張計費，或按輸出 token 計費                                                        |
| 怎麼查  | 模型詳情頁「**輸入模態**」那一行含「圖片」                                    | 不在詳情頁體系裡，見[影像與影片生成模型](/zh-Hant/api-capabilities/image-video-models)       |

<Note>
  所以客戶問「有沒有多模態對話 API」時，如果他要的是**上傳圖片讓模型分析**，答案是「幾乎全都支援」；
  如果他要的是**讓模型畫一張圖**，那是完全另一批模型。問清楚這一句，能省掉後面一大半溝通成本。
</Note>

## 想拿到圖片，一共四條路

| 路線                    | 怎麼調                                                 | 同一次響應裡有文本嗎                 | 適合誰           |
| --------------------- | --------------------------------------------------- | -------------------------- | ------------- |
| **A. 獨立出圖介面**（主推）     | 圖片模型 + `POST /v1/images/generations`                | ❌ 只有圖                      | 「我就是要一張圖」     |
| **B. Gemini 出圖系原生**   | `POST /v1beta/models/{model}:generateContent`       | ✅ **可能有**，但不保證             | 要文字說明和圖一起拿    |
| **C. Responses 原生工具** | `gpt-5.5` + `tools: [{"type": "image_generation"}]` | ✅ 有                        | Agent 自主決定畫不畫 |
| **D. 圖片模型的對話端點**      | `gpt-image-2-all` / `-vip` + `/v1/chat/completions` | 圖以 Markdown 塞在 `content` 裡 | 存量相容，**不再主推** |

<AccordionGroup>
  <Accordion title="A. 獨立出圖介面 —— 絕大多數場景選這條">
    最標準、最便宜、最好排查的一條路。GPT-Image、FLUX、Seedream、Grok Imagine 都走這裡。

    ```bash theme={null}
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-image-2",
        "prompt": "一隻橙色的貓坐在藍色沙發上，簡筆畫風格",
        "size": "1024x1024"
      }'
    ```

    響應裡 FLUX / Seedream 一般回 `data[0].url`，GPT-Image 系回 `data[0].b64_json`。
    **這條路不返回任何對話文本**——它就不是對話介面。

    模型全表見[影像與影片生成模型](/zh-Hant/api-capabilities/image-video-models)，
    各模型的端點、超時、輸出格式差異見[圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
  </Accordion>

  <Accordion title="B. Gemini 出圖系 —— 唯一原生「文本 + 圖片」同出的一類">
    Nano Banana 系列（`gemini-3-pro-image` / `gemini-3.1-flash-image` 等）走 Gemini 原生端點，
    響應的 `candidates[0].content.parts` 是一個**異構陣列**：裡面可能只有圖片段，
    也可能文本段和圖片段混排。這就是「一個介面既給文字又給圖」的那一類。

    但有個坑必須提前知道：**段數和順序都不做保證**。實測出現過三種排列：

    | parts 結構              | 長度 | 圖片下標    |
    | --------------------- | -- | ------- |
    | `inlineData`          | 1  | `0`     |
    | `text` + `inlineData` | 2  | **`1`** |
    | `inlineData` + `text` | 2  | **`0`** |

    所以 `parts[0]` / `parts[1]` 這類寫死下標的取法**一定會間歇性失敗**。正確寫法是按欄位特徵篩選，
    並取**最後一個** `inlineData`（複雜任務下模型會返回多張圖，最後一張才是最終稿）：

    ```python theme={null}
    cand = (resp.get("candidates") or [{}])[0]
    parts = (cand.get("content") or {}).get("parts") or []
    images = [p["inlineData"] for p in parts if "inlineData" in p]
    texts  = [p["text"] for p in parts if "text" in p]          # 文字說明在這裡
    if not images:
        raise RuntimeError(f"未返回圖片，finishReason={cand.get('finishReason')}")
    final = images[-1]                                          # 多圖時最後一張為最終稿
    ```

    完整說明見 [Nano Banana 系列開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide)。
  </Accordion>

  <Accordion title="C. Responses 原生 image_generation 工具 —— 讓 Agent 自己決定畫不畫">
    調 `POST /v1/responses`，模型用 `gpt-5.5`，請求裡掛上原生出圖工具：

    ```json theme={null}
    {
      "model": "gpt-5.5",
      "input": "幫我畫一張產品釋出會的主視覺海報",
      "tools": [{ "type": "image_generation" }]
    }
    ```

    模型自己判斷要不要畫，圖片以 base64 放在響應 `output` 陣列的 `image_generation_call` 項裡，
    和正常的文本輸出並列。**這是 OpenAI 側最接近「會畫畫的聊天模型」的形態。**

    <Warning>
      **代價**：這條路每次出圖會**額外固定收一筆約 \$0.20 的工具呼叫費**，疊加在按量計費之上；
      而路線 A 的 `/v1/images/generations` 只按用量計費。所以只在「流程必須走 Responses」
      （比如 Agent 要自主決定畫/不畫）時才用它，單純想要一張圖請走 A。
    </Warning>

    詳見[原生工具出圖](/zh-Hant/api-capabilities/gpt-image-2/responses-image-tool)。
  </Accordion>

  <Accordion title="D. 圖片模型的對話端點 —— 形似對話，本質仍是圖片模型">
    `gpt-image-2-all` / `gpt-image-2-vip` 支援用 `/v1/chat/completions` 呼叫，圖片以 Markdown
    連結的形式塞在 `choices[0].message.content` 裡。

    看起來像「一個對話介面既迴文字又出圖」，但**它並不是會畫畫的聊天模型**——底下仍然是圖片模型
    套了一層對話 schema，沒有通用對話能力。另外它**只讀最後一條 `user` 訊息裡的 `image_url` 作底圖**，
    assistant 歷史裡的圖會被忽略。

    這條路**不再主推**，新接入請走 A。
  </Accordion>
</AccordionGroup>

## 想做「邊聊邊出圖」的產品，推薦怎麼搭

大多數 Agent / 產品要的其實不是「一個萬能介面」，而是一條清晰的編排鏈。推薦這樣搭：

<Steps>
  <Step title="對話模型判斷意圖">
    用你本來就在用的對話模型（`gpt-5.5`、`claude-opus-5`、`gemini-3-pro` 等）處理使用者輸入，
    判斷這一輪到底是「聊天」還是「要出圖」。需要的話讓它以結構化輸出返回一個標誌位。
  </Step>

  <Step title="讓對話模型寫出圖提示詞">
    這一步價值很高：使用者說的是「給我搞個海報」，而出圖模型需要的是完整的畫面描述。
    讓對話模型把口語需求改寫成規範的英文/中文提示詞，出圖品質會明顯更穩。
  </Step>

  <Step title="調出圖介面拿圖">
    走路線 A 的 `/v1/images/generations`。拿到 `url` 或 `b64_json` 後落到你自己的物件儲存。
  </Step>

  <Step title="把圖回填進對話">
    把圖片連結以 assistant 訊息的形式接回對話歷史，使用者體驗上就是「邊聊邊出圖」。
  </Step>
</Steps>

<Tip>
  這樣拆的好處很實在：兩個模型可以各自獨立替換（換出圖模型不用動對話邏輯）、
  計費在日誌裡分得清清楚楚、**任一環失敗可以單獨重試**，而不是整輪重來。
</Tip>

## 怎麼確認某個模型吃不吃圖片

<Steps>
  <Step title="① 查模型詳情頁">
    開啟 `/models/<模型名>`，看頂部規格表裡「**輸入模態**」那一行——含「圖片」就支援識圖。
    這是最快的判斷方式。
  </Step>

  <Step title="② 拿不準就實測一條">
    發一條最小的帶圖請求，看返回：

    ```bash theme={null}
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "要測的模型名",
        "messages": [{
          "role": "user",
          "content": [
            {"type": "text", "text": "這張圖裡是什麼？"},
            {"type": "image_url", "image_url": {"url": "https://example.com/test.jpg"}}
          ]
        }]
      }'
    ```
  </Step>

  <Step title="③ 認報錯原文">
    純文本模型會明確報錯，上游原文是 `Model do not support image input`
    （語法就是這樣，不是筆誤）。看到這一句就說明該模型不吃圖片，換模型即可。
  </Step>
</Steps>

<Warning>
  **已知的純文本例外（截至 2026-08-20）**：`deepseek-v4-pro`、`deepseek-v4-flash`、`glm-5.2`。

  這幾個是「新模型但不支援圖片輸入」的少數派，容易踩。
  **這份名單會隨模型庫變化**——同一廠商不同代際的能力也不一致，
  請始終以模型詳情頁的「輸入模態」和實測結果為準，不要把這裡的名單當成長期清單。
</Warning>

## 五個常見誤區

<AccordionGroup>
  <Accordion title="誤區一：多模態模型 = 能生成圖片">
    **不成立。** 多模態在 API 語境裡預設指**輸入側**能力。`gpt-5.5` 能看懂你發的設計稿，
    但它自己吐不出一張圖——想讓它出圖，得靠工具呼叫（路線 C）或另外調出圖介面（路線 A）。
  </Accordion>

  <Accordion title="誤區二：出圖模型也能當聊天模型用">
    **不成立。** 圖片模型沒有通用對話能力，別拿 `gpt-image-2` 去做客服問答。
    即便是支援對話端點的 `-all` / `-vip`（路線 D），底下也仍然是圖片模型。
  </Accordion>

  <Accordion title="誤區三：responseModalities 帶上 TEXT 就一定會返回文本段">
    **反向不成立。** 宣告 `responseModalities: ["TEXT", "IMAGE"]` **不保證**響應裡一定有文本段，
    模型也可能只給圖片。反過來倒是有用：顯式宣告 `["IMAGE"]` 可以減少多餘的文本段。
  </Accordion>

  <Accordion title="誤區四：在 parts[0] 和 parts[1] 之間來回改能修好取圖">
    **修不好。** 寫死下標的兩種寫法是**互補**的——圖片必落在 `[0]` 或 `[1]`，
    無論選哪個，都存在拿不到圖的請求。改下標只是把失敗的請求換了一批，
    **只有按欄位特徵遍歷篩選才穩定**。
  </Accordion>

  <Accordion title="誤區五：給 /v1/images/generations 傳參考圖就能做圖片編輯">
    **不成立，而且是靜默失敗。** 以 Grok Imagine 為例：向生成端點傳 `image` / `image_url` / `images`，
    實測會**返回 200 並正常出一張圖，但參考圖被靜默丟棄、並照常計費**——你拿到的是純文生圖結果。

    圖片編輯必須走 `/v1/images/edits`（Grok Imagine 側還要求 `multipart/form-data`，傳 JSON 會硬報 400）。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="影像理解（識圖）API" icon="eye" href="/zh-Hant/api-capabilities/vision-understanding">
    圖片輸入側的完整指南：支援的模型、URL / base64 兩種傳法、多圖輸入、常見報錯
  </Card>

  <Card title="影像與影片生成模型" icon="palette" href="/zh-Hant/api-capabilities/image-video-models">
    圖片輸出側的模型全表與價格，判斷「哪些模型能出圖」看這裡
  </Card>

  <Card title="Nano Banana 系列開發指南" icon="banana" href="/zh-Hant/api-capabilities/nano-banana-dev-guide">
    Gemini 出圖系的正確接法，含 parts 遍歷取圖、多圖輸出、mimeType 處理
  </Card>

  <Card title="原生工具出圖" icon="wand-sparkles" href="/zh-Hant/api-capabilities/gpt-image-2/responses-image-tool">
    用 Responses API 的 image\_generation 工具讓模型自主出圖，含額外工具呼叫費說明
  </Card>

  <Card title="圖片 API 呼叫須知與最佳實踐" icon="list-checks" href="/zh-Hant/api-capabilities/image-api-best-practices">
    各出圖模型的端點、超時、輸出格式對照矩陣
  </Card>

  <Card title="如何選擇合適的 AI 模型？" icon="compass" href="/zh-Hant/faq/model-selection-guide">
    按場景、成本、速度三個維度的選型指南
  </Card>
</CardGroup>
