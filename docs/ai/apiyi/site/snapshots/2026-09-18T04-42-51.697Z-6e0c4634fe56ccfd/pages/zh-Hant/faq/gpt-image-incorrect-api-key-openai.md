> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 用 Codex 接 GPT-Image 出圖，報金鑰認證失敗怎麼辦？

> Codex 接 gpt-image-2.5 出圖報 Incorrect API key：錯來自 OpenAI，請求沒到 API易。三條解法：裝 Skills、丟提示詞、網頁出圖。

## 典型報錯

```text theme={null}
秘鑰認證失敗
Incorrect API key provided: sk-xxxx****************************A6Af.
You can find your API key at https://platform.openai.com/account/api-keys.
（請求 ID：req_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx）
```

<Info>
  **一句話結論**：這條錯是 **OpenAI 官方伺服器**返回的，不是 API易 返回的。你的程式碼目前請求的是 `api.openai.com`，API易 的 Key 自然會被 OpenAI 拒絕。**Key 沒壞，是請求地址沒改。**
</Info>

## 怎麼判斷請求沒到 API易

兩個特徵，看到任意一個就能確定：

| 特徵                                                  | 說明                                                          |
| --------------------------------------------------- | ----------------------------------------------------------- |
| 報錯裡讓你去 `platform.openai.com/account/api-keys` 找 Key | 這是 OpenAI 的標準 `invalid_api_key` 文案，API易 的報錯不會引導你去 OpenAI 官網 |
| 請求 ID 是 `req_` 開頭的 32 位串                            | OpenAI 的請求 ID 格式。API易 的日誌裡查不到這條記錄，因為請求從未到達                  |

<Note>
  這個問題在「讓 AI 程式設計助手寫接入程式碼」時格外常見：Codex、Cursor、Claude Code 等看到 `gpt-image-2.5` 這個模型名，預設會按 OpenAI 官方 SDK 的寫法生成程式碼，`base_url` 用的是 SDK 的預設值 `https://api.openai.com/v1`。你填進去的 Key 是 API易 的，兩邊對不上。
</Note>

## 三條解法，按你的情況選

<Tabs>
  <Tab title="① 會用 Codex / 程式設計 Agent：裝 Skills 讓它接">
    最省事的做法是讓 Agent 先「學會」API易 再寫程式碼，有兩個層級的技能包可選：

    <Steps>
      <Step title="整站技能包（推薦先裝）">
        讓你的 Agent 執行下面這條命令安裝 API易 技能包；跑不通就讓它直接讀 `https://docs.apiyi.com/skill.md`：

        ```bash theme={null}
        npx skills add https://docs.apiyi.com
        ```

        這份檔案專門寫給 AI 看：Base URL、認證方式、模型命名規則、常見坑一應俱全。裝完再讓它寫程式碼，`base_url` 就會自動指向 `https://api.apiyi.com/v1`。
      </Step>

      <Step title="GPT-Image 專用出圖技能">
        [GPT-Image-2.5 / 2 系列 Agent 技能](/zh-Hant/api-capabilities/gpt-image-2/skills) 頁提供一個開箱即用的 Skill：兩個檔案、一個指令碼，覆蓋 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2` 等六個模型，用 `--model` 切換，文生圖、多圖融合、局部重繪都能做。

        放進 Codex、OpenClaw、Claude Code 等任意能執行命令列的編碼 Agent，對它說一句「幫我出一張……」即可，不需要你自己碰 Base URL。
      </Step>
    </Steps>

    <Tip>
      其它出圖 / 影片模型也各有一頁「Agent 技能」，都掛在對應模型的文件目錄下。文件站左側導航裡找到模型，看有沒有名為「Agent 技能」的子頁即可。
    </Tip>
  </Tab>

  <Tab title="② 不會寫程式碼：把提示詞丟給 AI">
    不想理解 Skill 是什麼，也可以直接把我們寫好的**接入提示詞**複製給 Codex、Claude Code、Cursor 等 AI：

    1. 開啟 [GPT-Image-2.5 / 2 系列總覽](/zh-Hant/api-capabilities/gpt-image-2/overview)
    2. 找到「讓 AI Agent 幫你接入」一節，點提示詞右上角的複製按鈕
    3. 原樣貼上給你的 AI 程式設計助手

    這段提示詞裡已經寫死了 `base_url` 用 `https://api.apiyi.com/v1`、Key 從環境變數 `APIYI_API_KEY` 讀，還預先擋掉了超時、base64 渲染、上傳壓縮、品質引數幾個高頻坑。AI 會先抓文件頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼。

    <Note>
      每個出圖 / 影片模型的總覽頁都有這樣一段提示詞，不止 GPT-Image。更通用的三條路（聊天 Agent、命令列、程式設計 Agent）見 [AI 開發者套件](/zh-Hant/developer-kit)。
    </Note>
  </Tab>

  <Tab title="③ 不想接入：直接網頁出圖">
    只是想出圖、暫時不需要接進自己的程式，可以完全繞開程式碼：

    1. 在 API易 後臺「令牌」頁複製一個 Key
    2. 開啟 `imagen.apiyi.com`，填入這個 Key
    3. 選擇 `gpt-image-2.5-flare`（文生圖）或 `gpt-image-2.5-sunburst`（改圖）直接出圖

    網頁端用的就是同一個 Key、同一套介面，費用也從同一個賬戶餘額扣。等後續要接程序序，再回到前兩條路。
  </Tab>
</Tabs>

## 自己改程式碼：只改一行

如果你已經有一段 Codex 生成的程式碼，最小改動是給客戶端加上 `base_url`，其它一律不動：

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",
      base_url="https://api.apiyi.com/v1",  # ← 加上這一行
  )

  result = client.images.generate(
      model="gpt-image-2.5-flare",
      prompt="一隻戴著宇航員頭盔的柴犬，賽博朋克風格",
      size="1024x1024",
      quality="medium",
  )
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: "sk-your-apiyi-key",
    baseURL: "https://api.apiyi.com/v1", // ← 加上這一行
  });

  const result = await client.images.generate({
    model: "gpt-image-2.5-flare",
    prompt: "一隻戴著宇航員頭盔的柴犬，賽博朋克風格",
    size: "1024x1024",
    quality: "medium",
  });
  ```

  ```bash 環境變數 theme={null}
  # 不改程式碼，用環境變數覆蓋 SDK 預設地址
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```
</CodeGroup>

改完用這條命令驗證請求確實到了 API易，能返回模型列表就對了：

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

## 常見追問

<AccordionGroup>
  <Accordion title="我明明改了 base_url，為什麼還報同樣的錯？">
    按順序排查：

    1. **多處配置**：Codex 生成的專案常常同時有 `.env`、配置檔案、程式碼初始化三處地方，只改了一處，另一處仍是預設值
    2. **環境變數優先**：`OPENAI_BASE_URL` 若在系統裡已經設成了別的值，會覆蓋程式碼裡沒寫的那一項；用 `echo $OPENAI_BASE_URL` 看一眼
    3. **改完沒重啟**：程序仍在跑舊配置
    4. **拼寫**：`apiyi`，不是 `apiyii` 或 `apiyl`

    最簡單的自證方法：看報錯。只要還出現 `platform.openai.com`，請求就還在打 OpenAI。
  </Accordion>

  <Accordion title="Codex 說它已經按 API易 寫了，但報錯沒變，怎麼回事？">
    把報錯原文連同這一頁一起發給它。每個文件頁右上角都有「複製頁面」按鈕，把頁面內容 + 報錯一起貼給 AI，它就能對照著定位是哪一處配置沒生效。這是最快的排錯路徑。
  </Accordion>

  <Accordion title="到了 API易 之後如果再報 Key 無效呢？">
    那才輪到查 Key 本身：登入後臺「令牌」頁確認該 Key 狀態為「啟用」、餘額充足、沒有限制模型白名單。完整排查見 [為什麼提示 API Key 無效？](/zh-Hant/faq/invalid-api-key)。
  </Accordion>

  <Accordion title="gpt-image-2.5 該用哪個模型名？">
    文生圖預設 `gpt-image-2.5-flare`，改圖 / 局部重繪用 `gpt-image-2.5-sunburst`，兩款同價同參數。走量要便宜可以用官逆 `gpt-image-2.5-all`。六個模型的取捨見 [GPT-Image 系列 Agent 技能](/zh-Hant/api-capabilities/gpt-image-2/skills) 頁的對比表。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="為什麼提示 API Key 無效？" icon="key" href="/zh-Hant/faq/invalid-api-key">
    Base URL 與 Key 一一對應的完整原理與各語言示例。
  </Card>

  <Card title="Base URL 怎麼填？" icon="link" href="/zh-Hant/faq/base-url-config">
    OpenAI 加 /v1、Claude 填根域名、Gemini 加 /v1beta。
  </Card>

  <Card title="有沒有一鍵對接功能？" icon="plug" href="/zh-Hant/faq/one-click-integration">
    把文件交給 AI 程式設計助手，讓它替你完成對接。
  </Card>

  <Card title="GPT-Image-2.5 / 2 系列總覽" icon="sparkles" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    引數、價格、接入提示詞與常見報錯。
  </Card>
</CardGroup>
