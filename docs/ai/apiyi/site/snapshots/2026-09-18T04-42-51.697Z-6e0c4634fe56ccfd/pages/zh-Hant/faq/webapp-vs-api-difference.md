> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼官方網頁版和 API 返回結果不同？

> 同一個模型，為什麼 Claude、ChatGPT 官網聊得又準又聰明，API 呼叫卻像變笨了？解釋網頁版的工程封裝層，以及如何用 API 復刻網頁版體驗

## 簡短回答

<Info>
  **模型是同一個，差別在於網頁版在模型外面套了一整層「工程封裝」。**

  打個比方：**網頁版是精裝修房，API 是毛坯房。**

  * **精裝修房（claude.ai / chatgpt.com）**：已經裝好了系統提示詞、聯網搜尋、程式碼執行、檔案解析、對話記憶、上下文管理——拎包入住。
  * **毛坯房（API）**：只交付最核心的模型能力（承重牆和水電），搜尋、工具、記憶、上下文都需要開發者自己配置。

  所以"API 感覺變笨了"，通常不是模型被降級或換成了假模型，而是**你拿到的是沒裝修的毛坯房**。
</Info>

## 網頁版到底多做了什麼？

官方產品在模型之上疊加了大量看不見的工程層，這些能力**都不屬於模型權重本身**，API 預設一個都不帶：

<CardGroup cols={2}>
  <Card title="系統提示詞（System Prompt）" icon="file-text">
    網頁版每輪對話都會注入一段長達數千 token 的隱藏提示詞，規定身份、語氣、回答長度、格式偏好、拒答邊界、Markdown 排版規則等。

    這是網頁版"說話更像人、格式更漂亮、知道自己是誰"的最主要原因。
  </Card>

  <Card title="內建工具（Tools）" icon="wrench">
    聯網搜尋、網頁抓取、程式碼執行沙箱（當計算器用）、檔案與圖片解析、圖表繪製、Artifacts / Canvas……

    網頁版遇到"今天的新聞""這串數字算一下"會自動調工具，API 不配置工具就只能靠模型硬答。
  </Card>

  <Card title="記憶與對話歷史" icon="brain">
    網頁版自動儲存歷史對話、跨會話記憶、專案知識庫（Projects）。

    API 是**完全無狀態**的：你不把上文放進 `messages` 裡，模型就什麼都不記得。
  </Card>

  <Card title="上下文管理與壓縮" icon="scissors">
    長對話時網頁版會自動摘要、裁剪、檢索歷史片段，保證不超限。

    API 需要你自己實現截斷、摘要或 RAG 檢索。
  </Card>

  <Card title="預設引數與思考檔位" icon="settings">
    網頁版幫你設定了 temperature、最大輸出長度、思考預算（reasoning effort）等引數，有的產品還會根據問題**自動路由**到不同模型或思考檔位。

    API 用的是預設值，往往和網頁版不一致。
  </Card>

  <Card title="後處理與前端渲染" icon="monitor">
    引用角標、程式碼高亮、表格渲染、思維鏈摺疊展示，都是前端做的。

    API 返回的是純文本 / JSON，觀感上天然"樸素"很多。
  </Card>
</CardGroup>

## 一張表看懂差異

| 能力          | 官方網頁版     | 直接呼叫 API                                            |
| ----------- | --------- | --------------------------------------------------- |
| 模型權重        | 相同        | 相同                                                  |
| 系統提示詞       | 官方注入（不公開） | 無，需自己寫                                              |
| 聯網搜尋        | 內建，自動觸發   | 需自行開啟工具或接搜尋                                         |
| 計算 / 程式碼執行  | 內建沙箱      | 需自行實現工具呼叫                                           |
| 檔案、圖片解析     | 內建        | 需自己上傳或轉 Base64                                      |
| 對話記憶        | 自動儲存      | 無狀態，需自己傳上文（見 [API 有記憶能力嗎](/zh-Hant/faq/api-memory)） |
| 上下文超限處理     | 自動壓縮      | 需自己截斷或摘要                                            |
| 引數（溫度、思考預算） | 官方調好      | 使用預設值，需自己對齊                                         |
| 輸出格式        | 前端美化渲染    | 純文本 / JSON                                          |

## 常見的"結果不同"分別是什麼原因？

<AccordionGroup>
  <Accordion title="API 不知道最新的新聞和事件">
    模型的知識截止到訓練時間，網頁版是靠**內建聯網搜尋**補齊時效資訊的。

    API 預設不聯網。解決方式：呼叫支援的搜尋工具（如 `web_search`、`google_search`），或自己接一個搜尋介面，把結果放進上下文。

    <Warning>
      聯網搜尋工具屬於**按次計費**的付費能力，不含在模型 token 費用裡，具體價格見 [模型倍率說明](/zh-Hant/faq/model-multiplier)。
    </Warning>
  </Accordion>

  <Accordion title="API 算數、統計字數會算錯">
    網頁版遇到計算任務會悄悄寫一段程式碼在沙箱裡跑出結果。裸模型是"心算"，出錯很正常。

    解決方式：給模型掛一個計算 / 程式碼執行工具，或在提示詞裡要求它列出計算步驟。
  </Accordion>

  <Accordion title="API 回答明顯更短、格式更隨意">
    網頁版的系統提示詞裡有大量關於結構、長度、Markdown 排版的要求。

    解決方式：把你想要的風格寫進自己的 System Prompt，例如"用小標題分段""先給結論再展開""程式碼必須帶註釋"。
  </Accordion>

  <Accordion title="API 裡模型不知道自己是誰、說錯版本號">
    模型權重裡從來沒有"我是誰"這條資訊，網頁版是靠系統提示詞錨定的。

    詳見：[為什麼大模型不知道自己的版本號？](/zh-Hant/faq/model-version-identity) 和 [為什麼 Claude 會自稱 Qwen 或 DeepSeek？](/zh-Hant/faq/claude-identity-confusion)
  </Accordion>

  <Accordion title="API 回答「忘記」了前面說過的話">
    API 是無狀態的，每次請求都是全新的對話。網頁版幫你自動帶上了歷史。

    解決方式：把歷史輪次完整放進 `messages` 陣列再發送。注意這會增加輸入 token，可配合[快取計費](/zh-Hant/faq/cache-billing)降低成本。
  </Accordion>

  <Accordion title="同樣的問題，API 每次回答都不一樣">
    這是取樣隨機性，不是故障。網頁版同樣如此，只是你不會連問兩遍。

    解決方式：降低 `temperature`（如 0.2），或在提示詞中明確輸出格式約束。
  </Accordion>

  <Accordion title="API 的推理感覺更「淺」">
    很多網頁版預設開啟了較高的思考預算，而 API 的預設檔位通常更低（甚至關閉）。

    解決方式：顯式設定 `reasoning_effort` / `thinking` 等引數到 high，並適當調高最大輸出長度，參見 [max\_tokens 說明](/zh-Hant/faq/max-tokens)。
  </Accordion>
</AccordionGroup>

## 如何用 API 復刻網頁版體驗？

<Steps>
  <Step title="第一步：寫好你自己的 System Prompt">
    這是投入產出比最高的一步。明確身份、語氣、輸出格式、回答長度、邊界。

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    SYSTEM_PROMPT = """你是一個專業的技術助手。
    - 先給結論，再給理由
    - 使用 Markdown 小標題分段
    - 程式碼必須可執行並附關鍵註釋
    - 不確定的資訊要明確說明，不要編造"""
    ```
  </Step>

  <Step title="第二步：自己維護對話歷史">
    把每一輪的使用者輸入和模型回覆都追加到 `messages` 裡，模擬網頁版的"記憶"。

    ```python theme={null}
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    def chat(user_input):
        messages.append({"role": "user", "content": user_input})
        resp = client.chat.completions.create(
            model="claude-opus-5",
            messages=messages,
        )
        reply = resp.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        return reply
    ```
  </Step>

  <Step title="第三步：按需掛上工具">
    需要時效資訊就接搜尋，需要精確計算就接程式碼執行，需要查內部資料就接 RAG 檢索。工具的定義與呼叫方式見 [Function Calling 文件](/zh-Hant/api-capabilities/openai/function-calling)，聯網搜尋見 [Web Search 文件](/zh-Hant/api-capabilities/openai/web-search)。
  </Step>

  <Step title="第四步：對齊引數">
    顯式設定 `temperature`、`max_tokens`、思考檔位等引數，不要依賴預設值。想要接近網頁版的深度思考，通常需要把推理強度調高。
  </Step>

  <Step title="第五步：處理長上下文">
    對話變長後，做摘要壓縮或只保留最近 N 輪 + 關鍵資訊，避免超出上下文視窗。開啟快取可以大幅降低重複字首的成本。
  </Step>
</Steps>

<Tip>
  **不想自己從零搭？** 直接使用成熟的客戶端更省事——Cherry Studio、ChatWise、LobeChat、Cursor、Claude Code 等工具已經內建了系統提示詞、歷史管理、工具呼叫，把 API易 的 Base URL 和金鑰填進去即可獲得接近網頁版的體驗。配置方法見 [Base URL 配置說明](/zh-Hant/faq/base-url-config)。
</Tip>

## 需要注意的邊界

<Warning>
  **API 無法 100% 復刻網頁版，這是客觀限制：**

  1. **官方不公開系統提示詞**，社群流傳的版本只是逆向推測，且會隨版本變化。
  2. **部分網頁版功能不開放 API**，例如某些產品的記憶系統、Artifacts / Canvas 的完整互動。
  3. **網頁版一直在做 A/B 實驗**，同一天不同使用者拿到的提示詞和路由策略可能都不一樣。
  4. **網頁版可能自動換模型**：部分產品會把簡單問題路由到更小更快的模型，而 API 是你指定哪個就用哪個——這也是"結果不同"的來源之一。

  反過來說，API 的優勢正是**可控**：提示詞、引數、工具、上下文全在你手上，結果可復現、可版本管理，這是做產品時必須的。
</Warning>

<Info>
  **API易 的角色**：API易 是純粹的 API 閘道，**請求原樣透傳、不注入任何提示詞、不做任何改寫**。所以你在 API易 得到的行為，與直連官方 API 一致——毛坯房就是毛坯房，我們不會偷偷裝修，也不會偷偷拆牆。
</Info>

## 相關問題

<CardGroup cols={2}>
  <Card title="為什麼大模型不知道自己的版本號？" icon="circle-question-mark" href="/zh-Hant/faq/model-version-identity">
    模型身份問題的底層原理
  </Card>

  <Card title="為什麼 Claude 會自稱 Qwen 或 DeepSeek？" icon="venetian-mask" href="/zh-Hant/faq/claude-identity-confusion">
    身份混淆現象的詳細解釋
  </Card>

  <Card title="如何選擇合適的模型？" icon="compass" href="/zh-Hant/faq/model-selection-guide">
    不同模型的特點與適用場景
  </Card>

  <Card title="Base URL 怎麼配置？" icon="link" href="/zh-Hant/faq/base-url-config">
    在各類客戶端中接入 API易
  </Card>
</CardGroup>

## 聯絡我們

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    接入諮詢、技術支援
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
