> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 有沒有一鍵對接功能？

> 有，但形態不是一個按鈕，而是把文件餵給你的 AI 程式設計助手，讓它替你完成對接。

## 簡短回答

**有，但不是一個按鈕。**

我們不提供傳統意義上「點一下就配好」的一鍵對接——不同模型的協議、引數、鑑權方式各不相同，這種按鈕只能覆蓋最基礎的對話能力，解決不了真實需求。

取而代之的是一條更好用的路：**把文件交給你的 AI 程式設計助手，讓它替你完成對接**。你只需要註冊賬號、複製一個 Key，剩下的選模型、填 Base URL、寫程式碼、排錯，都可以讓 AI 做。

<Card title="讓 AI 幫你接入" icon="bot" href="/zh-Hant/getting-started">
  快速開始頁裡有一段可直接複製的提示詞，丟給 Codex、Claude Code、Cursor 即可。
</Card>

## 三種用法

<Steps>
  <Step title="整站技能包（最推薦）">
    讓你的 Agent 執行 `npx skills add https://docs.apiyi.com` 安裝 API易 技能包；跑不通就讓它直接讀 `https://docs.apiyi.com/skill.md`。

    這份檔案專門寫給 AI 看：端點、認證、模型命名規則、常見坑、排查清單一應俱全。讀完它就具備了接入所需的全部背景知識。
  </Step>

  <Step title="單頁發給 AI">
    每個文件頁**右上角**都有「複製頁面」按鈕，點開旁邊的箭頭還能直接「在 ChatGPT / Claude / Perplexity / Google AI Studio 中開啟」。

    遇到某個模型的具體問題時，開啟那一頁，點「複製頁面」，連同你的報錯一起發給 AI——這是最快的排錯路徑。
  </Step>

  <Step title="接成 MCP 服務">
    把 `https://docs.apiyi.com/mcp` 新增為 MCP 伺服器，你的 Agent 就能隨時檢索本站最新內容，不必每次手動喂文件。
  </Step>
</Steps>

<Info>
  **為什麼這樣更好**：按鈕式的一鍵對接只能覆蓋固定幾種場景，而 AI 能讀懂你專案的實際技術棧，直接寫出能跑的程式碼，還能順手處理超時配置、錯誤重試這些按鈕做不到的事。
</Info>

## 為什麼不做按鈕式的一鍵對接？

模型接入的差異主要體現在：

* **介面協議不同**：OpenAI、Claude、Gemini 等模型採用不同的 API 協議
* **引數結構不同**：每個模型的請求引數、返回欄位命名都不一致
* **認證方式不同**：不同模型的鑑權欄位和位置不同
* **特殊能力不同**：Function Calling、Prompt Caching、Web Search 等能力在不同模型上的實現方式也不同

因此，強行做「一鍵對接」往往只能覆蓋最基礎的對話能力，無法滿足真實使用需求。

<Note>
  **賬號仍需你本人註冊**。我們沒有提供讓 Agent 自助申請賬號和金鑰的介面——賬號與計費涉及實名與風控，這一步需要人來完成。但從「拿到 Key」到「程式碼跑通」的全部工作，都可以交給 AI。
</Note>

## 相關問題

<CardGroup cols={2}>
  <Card title="快速開始" icon="rocket" href="/zh-Hant/getting-started">
    兩條路：讓 AI 接，或自己動手接。
  </Card>

  <Card title="如何選擇合適的模型？" icon="compass" href="/zh-Hant/faq/model-selection-guide">
    根據業務場景選擇最合適的 AI 模型。
  </Card>

  <Card title="Base URL 怎麼配置？" icon="link" href="/zh-Hant/faq/base-url-config">
    在各客戶端中接入 API易 的方法。
  </Card>

  <Card title="如何檢視呼叫日誌？" icon="file-text" href="/zh-Hant/faq/call-logs">
    查詢 API 呼叫記錄和餘額消耗明細。
  </Card>
</CardGroup>
