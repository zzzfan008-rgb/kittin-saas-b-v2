> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 快速開始

> 兩條路接入 API易：把文件丟給你的 AI 程式設計助手讓它代勞，或者按三步自己動手。

<Note>
  註冊後賬號自帶 **\$0.05** 試用額度，不充值也能跑通下面的第一次呼叫。用 `gpt-5.4-mini` 這類輕量模型足夠驗證接入是否正常。
</Note>

## 兩條路，任選一條

<CardGroup cols={2}>
  <Card title="讓 AI 幫你接" icon="bot" href="#讓-ai-幫你接">
    複製一段提示詞丟給 Codex / Claude Code / Cursor，它自己讀文件、寫程式碼、跑通。適合已經在用程式設計 Agent 的人。
  </Card>

  <Card title="自己動手接" icon="wrench" href="#自己動手接">
    註冊 → 建 Key → 發起第一次呼叫。三步，五分鐘。適合想先搞清楚每一步在幹嘛的人。
  </Card>
</CardGroup>

<Info>
  兩條路的**第一步是一樣的**：賬號需要你本人註冊、Key 需要你本人建立。AI 能替你做的是從「拿到 Key」到「程式碼跑通」這一段——選模型、填對 Base URL、寫示例、排錯。
</Info>

## 讓 AI 幫你接

### 把這段話發給你的 Agent

<Prompt description="讓程式設計 Agent 自助完成 API易 接入。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我把 API易（APIYI）接入到當前專案。

  1. 先獲取接入知識：執行 `npx skills add https://docs.apiyi.com` 安裝 APIYI 技能包。
     如果這條命令跑不通，就直接抓取 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 全文閱讀，效果一樣。
  2. 需要更細的內容時，從 [https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt) 找到對應頁面；
     任意文件頁地址後面加 `.md` 就能拿到純 Markdown 版，比抓 HTML 省 token。
  3. 向我索要 API Key（我在 [https://api.apiyi.com/token](https://api.apiyi.com/token) 複製），
     寫進環境變數 `APIYI_API_KEY`，**不要硬編碼進程式碼，也不要提交進 git**。
  4. 按本專案的技術棧寫一段最小可執行示例，模型先用 `gpt-5.4-mini`。
     注意：Base URL 要按 SDK 選——OpenAI SDK 用 `https://api.apiyi.com/v1`，
     Anthropic SDK 用根域名 `https://api.apiyi.com`（不加 /v1），
     Google GenAI SDK 用根域名並把 api\_version 設為 v1beta。
  5. 真跑一次，把返回內容貼給我。跑通後告訴我這次呼叫花了多少錢，
     以及後續要換成哪個模型更合適。
</Prompt>

### 它會做什麼

<Steps>
  <Step title="裝技能包，或直接讀 skill.md">
    `https://docs.apiyi.com/skill.md` 是一份專門寫給 AI 讀的接入說明：端點、認證、模型命名規則、常見坑、排查清單。Agent 讀完就具備了接入 API易 所需的全部背景。
  </Step>

  <Step title="按需翻文件">
    `llms.txt` 是全站頁面索引。Agent 從中挑出相關頁面，加 `.md` 字尾拿純文本版本讀。
  </Step>

  <Step title="寫程式碼並實跑">
    它會用你專案已有的語言和依賴寫示例，而不是照搬文件裡的 Python。跑通之前不算完。
  </Step>
</Steps>

### 可以直接餵給 AI 的五個入口

| 入口         | 地址                                           | 什麼時候用                                |
| ---------- | -------------------------------------------- | ------------------------------------ |
| **技能包**    | `https://docs.apiyi.com/skill.md`            | 一次性給 Agent 完整接入知識，首選                 |
| **頁面索引**   | `https://docs.apiyi.com/llms.txt`            | 讓 Agent 自己找該讀哪一頁                     |
| **單頁純文本**  | 任意文件頁地址後加 `.md`                              | 只關心某一頁時，比抓 HTML 省 token              |
| **MCP 服務** | `https://docs.apiyi.com/mcp`                 | 把本文件站接成 MCP，讓 Agent 隨時檢索最新內容         |
| **模型登錄檔**  | `https://docs.apiyi.com/model-registry.json` | 讓 Agent 查模型 ID、端點、分組、標價的機器可讀源，不再憑記憶編 |

Skills 技能包、命令列工具、給程式設計 Agent 的契約與登錄檔，三條路的完整說明見 [AI 開發者套件](/zh-Hant/developer-kit)。

<Tip>
  例如本頁的純文本版就是 `https://docs.apiyi.com/getting-started.md`。全站每一頁都支援這個字尾。
</Tip>

### 在文件頁右上角一鍵送進 AI

每個文件頁的**右上角**都有一個「複製頁面」按鈕，點開右側箭頭還有更多選項：

<img src="https://mintcdn.com/apiyillc/pSJvB-WdRHZF62ww/images/contextual-menu-copy-page.png?fit=max&auto=format&n=pSJvB-WdRHZF62ww&q=85&s=34ae33d4f4555c0b9436364f12bab88b" alt="文件頁右上角的複製頁面選單，包含複製頁面、以 Markdown 格式檢視、在 ChatGPT / Claude / Perplexity / Google AI Studio 中開啟" width="648" height="694" data-path="images/contextual-menu-copy-page.png" />

| 選項                         | 作用                                |
| -------------------------- | --------------------------------- |
| **複製頁面**                   | 把當前頁以 Markdown 格式複製到剪貼簿，直接粘給任意 AI |
| **以 Markdown 格式檢視**        | 在瀏覽器裡開啟純文本版，方便核對或分享連結             |
| **在 ChatGPT 中開啟**          | 帶著本頁內容跳轉到 ChatGPT 提問              |
| **在 Claude 中開啟**           | 同上，跳轉 Claude                      |
| **在 Perplexity 中開啟**       | 同上，跳轉 Perplexity                  |
| **在 Google AI Studio 中開啟** | 同上，跳轉 Google AI Studio            |

遇到具體模型的接入問題時，最快的做法是開啟那個模型的文件頁，點「複製頁面」，連同你的報錯一起發給 AI。

## 自己動手接

### 第一步：註冊並拿到 Key

<Steps>
  <Step title="註冊賬號">
    訪問 [API易官網](https://api.apiyi.com) 用郵箱註冊並驗證（推薦用高校、企業郵箱），然後登入控制台。
  </Step>

  <Step title="建立 API 金鑰">
    進入[令牌頁面](https://api.apiyi.com/token)：

    1. 可以直接複製**預設令牌**使用（右側有複製圖示）
    2. 也可以點右上角「新增」建立新令牌，起個名字（如 `test-key`）後確認

    Key 以 `sk-` 開頭。詳細說明見 [如何建立 KEY](/zh-Hant/faq/token-management)。
  </Step>

  <Step title="需要更多額度時再充值">
    自帶的 \$0.05 用完後，在控制台「充值」選單充值即可，支援支付寶、微信。各通道的最低充值額與到賬規則見[支付方式說明](/zh-Hant/faq/payment-methods)，加贈政策見[充值活動](/zh-Hant/faq/recharge-promotions)。
  </Step>
</Steps>

### 第二步：填對接入資訊

**Base URL 按 SDK 選，不是按模型選**——這是最常見的接入錯誤：

| 你用的 SDK                     | Base URL                   | 說明                                                               |
| --------------------------- | -------------------------- | ---------------------------------------------------------------- |
| OpenAI SDK（及絕大多數客戶端）        | `https://api.apiyi.com/v1` | SDK 會自己拼 `/chat/completions`，所以必須帶 `/v1`                         |
| Anthropic SDK（Claude 原生）    | `https://api.apiyi.com`    | SDK 會自己拼 `/v1/messages`，**加了 `/v1` 會變成 `/v1/v1/messages` 報 404** |
| Google GenAI SDK（Gemini 原生） | `https://api.apiyi.com`    | 另需設定 `api_version: "v1beta"`                                     |

<Warning>
  `base_url` 末尾**不要留斜槓**，否則會拼出雙斜槓導致 404。完整說明與節點選擇見 [Base URL 怎麼填](/zh-Hant/faq/base-url-config)。
</Warning>

### 第三步：發起第一次呼叫

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "user", "content": "Hello!"}
        ]
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from 'openai';

    const openai = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: 'https://api.apiyi.com/v1'
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    console.log(response.choices[0].message.content);
    ```
  </Tab>

  <Tab title="Java">
    ```java theme={null}
    // 使用官方 OpenAI Java 庫
    OpenAiService service = new OpenAiService(
        System.getenv("APIYI_API_KEY"),
        Duration.ofSeconds(60),
        "https://api.apiyi.com/v1"
    );

    ChatCompletionRequest request = ChatCompletionRequest.builder()
        .model("gpt-5.4-mini")
        .messages(List.of(
            new ChatMessage(ChatMessageRole.USER, "Hello!")
        ))
        .build();

    ChatCompletionResult result = service.createChatCompletion(request);
    System.out.println(result.getChoices().get(0).getMessage().getContent());
    ```
  </Tab>
</Tabs>

<Warning>
  `gpt-5` 及以上系列有三條引數限制：`temperature` 只能是 1、用 `max_completion_tokens` 替代 `max_tokens`、不要傳 `top_p`。
</Warning>

## 下一步

<CardGroup cols={2}>
  <Card title="接入 Claude Code" icon="terminal" href="/zh-Hant/scenarios/programming/claude-code">
    配置 `ANTHROPIC_BASE_URL`，用 API易 驅動 Claude Code
  </Card>

  <Card title="接入 Codex" icon="square-terminal" href="/zh-Hant/scenarios/programming/codex-cli">
    一份 `config.toml` 同時覆蓋桌面端、IDE 外掛和 CLI
  </Card>

  <Card title="探索模型列表" icon="bot" href="/zh-Hant/api-capabilities/model-info">
    檢視所有支援的 AI 模型與能力速查
  </Card>

  <Card title="檢視 API 文件" icon="book" href="/zh-Hant/api-manual">
    完整的介面說明、錯誤碼與除錯方法
  </Card>
</CardGroup>

## 常見問題

### 如何切換模型？

只需修改請求中的 `model` 引數：

```json theme={null}
{
  "model": "gpt-5.6-sol",         // 使用 GPT-5.6 Sol
  "model": "claude-opus-5",       // 使用 Claude Opus 5
  "model": "gemini-3.6-flash"     // 使用 Gemini 3.6 Flash
}
```

<Warning>
  **模型 ID 用點號，不是連字元**。文件頁地址裡的 `-` 是為了 URL 安全替換的，真實模型 ID 保留點號：頁面 `/models/qwen3-7-max` 對應的模型 ID 是 `qwen3.7-max`。寫成 `gpt-5-4-mini` 會報 404，正確寫法是 `gpt-5.4-mini`。

  不確定時用介面列一遍：`GET https://api.apiyi.com/v1/models`。
</Warning>

### 支援哪些程式語言？

API易 相容 OpenAI API 標準，支援所有 OpenAI SDK 支援的語言：

* Python
* JavaScript/TypeScript
* Java
* C#/.NET
* Go
* Ruby
* PHP
* 更多...

### 如何檢視餘額？

登入 [控制台](https://api.apiyi.com/account/profile) 即可檢視：

* 賬戶餘額
* 使用記錄
* 消費統計

也可通過 API 程式化查詢：

* [餘額查詢 API](/zh-Hant/api-capabilities/balance-query)：通過介面獲取賬戶餘額、有效期等資訊
* [餘額告警設定方法](/zh-Hant/faq/balance-alerts)：餘額不足時自動通知，避免服務中斷

### 遇到問題怎麼辦？

1. 打開出問題的那個文件頁，點右上角「複製頁面」，連同報錯一起發給 AI
2. 檢視 [API 文件](/zh-Hant/api-manual)
3. 檢查 [常見錯誤](/zh-Hant/faq/invalid-api-key)
4. 聯絡客服：[support@apiyi.com](mailto:support@apiyi.com)

<Info>
  提示：儲存好您的 API 金鑰，並定期在控制台檢視使用日誌，每筆請求都有訊息歷史，合理最佳化成本。
  祝使用愉快\~
</Info>
