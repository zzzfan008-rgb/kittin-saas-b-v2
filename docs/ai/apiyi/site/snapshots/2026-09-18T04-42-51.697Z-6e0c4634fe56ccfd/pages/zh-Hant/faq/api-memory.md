> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 有類似 ChatGPT 的記憶能力嗎？

> API 本身沒有記憶。Agent 工具的「記憶」其實是存在你本地的檔案，每次新對話都要重新讀，也會按輸入計費。本文講清記憶的原理、換電腦怎麼帶走，以及費用怎麼省。

## 簡短回答

<Info>
  **沒有。API 本身是無狀態的，不會記住你上一次說過什麼。**

  你在 ChatGPT 網頁版、Claude Code、Codex 裡感受到的「記憶」，是這些產品在 API 之外另做的功能：把記憶寫進檔案，下次對話時再讀給模型。這些檔案儲存在你自己手裡，API易 不儲存你的對話內容。
</Info>

## 網頁版的「記憶」是怎麼回事

ChatGPT 網頁版的記憶分兩種：

* **已儲存的記憶**：你讓它記住的事實和偏好，比如職業、寫作風格
* **參考聊天記錄**：它從你過往的對話裡提煉出的資訊

這兩種記憶都儲存在 OpenAI 的賬號體系裡，是網頁產品的功能，**不通過 API 開放**。用同一個模型調 API 時，模型不會知道你在網頁版裡聊過什麼。

網頁版和 API 的更多差異，見 [為什麼官方網頁版和 API 返回結果不同](/zh-Hant/faq/webapp-vs-api-difference)。

## Agent 工具的「記憶」其實是檔案

程式設計類 Agent 工具的記憶，都是**客戶端讀寫本地檔案**：

<CardGroup cols={3}>
  <Card title="Claude Code" icon="terminal">
    專案規則寫在 `CLAUDE.md`，個人偏好和工作中積累的經驗寫進本地的記憶目錄。每次啟動會話時讀取。
  </Card>

  <Card title="Codex" icon="code">
    專案規則寫在 `AGENTS.md`。2026 年 4 月起還內建了記憶功能，自動從歷史會話裡提煉內容，存到本地的 `~/.codex/memories/`。
  </Card>

  <Card title="Claude API 的 memory tool" icon="folder-open">
    模型會發出「讀 / 寫記憶檔案」的指令，由你的程式執行，檔案放在哪裡（本地磁碟、資料庫、雲端儲存）由你決定。
  </Card>
</CardGroup>

這些工具的共同點：

1. **記憶就是檔案**：通常是 Markdown，可以直接開啟檢視和修改。
2. **模型不會一次讀完所有檔案**：客戶端會按需檢索，只讀當前任務相關的部分。
3. **每次新對話都要重新讀**：模型本身什麼都不記得，讀進來的內容和你的問題一起發給 API。

## 換電腦怎麼帶走記憶

<Steps>
  <Step title="專案級記憶：跟著程式碼倉庫走">
    `CLAUDE.md`、`AGENTS.md` 這類放在專案目錄裡的檔案，提交到 git 後，在另一臺電腦上拉取程式碼就能用。團隊成員也能共享同一份專案規則。
  </Step>

  <Step title="使用者級記憶：手動複製或同步">
    放在使用者目錄下的記憶（比如 Codex 的 `~/.codex/memories/`、Claude Code 的本地記憶目錄）不在倉庫裡，需要複製到新電腦的同一位置，或者用網盤、同步工具保持一致。
  </Step>

  <Step title="在新電腦上確認生效">
    開啟同一個專案，問一個只有記憶裡才有答案的問題，比如專案約定的測試命令。答對了，就說明記憶已經帶過來了。
  </Step>
</Steps>

<Tip>
  記憶檔案裡別寫 API Key、密碼這類敏感資訊。它會被髮給模型，同步到網盤或提交到倉庫時也可能洩露。
</Tip>

## 記憶和費用

記憶並不是免費的：

* **讀進來的記憶按輸入 token 計費。** 每開一個新對話，客戶端讀取的記憶檔案都會算進這次請求的輸入。
* **同一個對話越聊越貴。** API 無狀態，所以每一輪都要把之前的全部對話再發一遍，輸入 token 隨輪數不斷累加。
* **快取計費能省下重複部分的費用。** 每次請求開頭那段內容（系統提示詞、記憶檔案、之前的對話）如果保持不變，就能命中快取，按遠低於正常輸入的價格計費。

API易 的 Claude、OpenAI、DeepSeek、Qwen、Grok 等主流通道快取命中都比較穩定。**Gemini 的隱式快取命中率一般**，做成本測算時建議按無快取價格打底。各通道的規則見 [API易支援快取計費嗎](/zh-Hant/faq/cache-billing)。

<Tip>
  想讓快取多命中：把不變的內容（系統提示詞、記憶檔案）放在請求最前面，變化的內容放在後面；不要在開頭塞時間戳這類每次都會變的欄位。
</Tip>

## 服務端會話狀態不等於記憶

<Info>
  部分原廠 API 提供服務端會話狀態，比如 OpenAI Responses API 的 `previous_response_id`：原廠替你儲存對話，預設保留 30 天，下一輪只需要傳上一次的 ID。

  它和「記憶」有兩點不同：

  * **只能接續同一條對話鏈**，不會跨會話記住你的偏好。
  * **不省錢**：鏈上所有歷史內容每一輪仍然按輸入 token 計費。

  在 API易 上，我們推薦由客戶端自己維護對話歷史，行為最穩定，換模型也不用改程式碼。具體寫法見 [多輪對話實現指南](/zh-Hant/api-capabilities/multi-turn-conversation)。
</Info>

## 常見疑問

<AccordionGroup>
  <Accordion title="API易 會儲存我的對話嗎？">
    不會。API易 作為中轉平臺只負責轉發請求，不儲存請求和響應的內容，詳見 [API易如何保障資料安全](/zh-Hant/faq/data-security)。

    如果你用了原廠的服務端會話功能（比如上面的 `previous_response_id`），這部分對話由原廠按它自己的規則儲存。
  </Accordion>

  <Accordion title="能不能讓 API 記住我的偏好？">
    可以，但需要你自己實現。最簡單的做法是把偏好寫進系統提示詞，每次請求都帶上。偏好比較多時，可以存成檔案或資料庫，按需檢索後再放進請求。Claude API 的 memory tool 就是這種做法的官方封裝。
  </Accordion>

  <Accordion title="記憶越多越好嗎？">
    不是。記憶越多，每次請求的輸入越長，費用越高，模型也可能被不相關的內容干擾。建議定期整理記憶檔案，刪掉過時的內容，只保留真正常用的規則和事實。
  </Accordion>

  <Accordion title="除了複製資料夾，還有別的辦法同步記憶嗎？">
    有：

    * 專案級記憶提交到 git，跟著程式碼走。
    * 使用者級記憶用網盤或同步工具保持一致。
    * 搭建自己的記憶服務：部分 Agent 工具支援通過 MCP 接入外部記憶服務，多臺電腦連同一個服務即可。

    無論哪種方式，記憶都在你自己控制的地方，不在 API 那一側。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="為什麼官方網頁版和 API 返回結果不同？" icon="layers" href="/zh-Hant/faq/webapp-vs-api-difference">
    網頁版在 API 之外多做了哪些事
  </Card>

  <Card title="多輪對話實現指南" icon="messages-square" href="/zh-Hant/api-capabilities/multi-turn-conversation">
    四種呼叫格式怎麼維護對話歷史
  </Card>

  <Card title="API易支援快取計費嗎？" icon="database" href="/zh-Hant/faq/cache-billing">
    各通道快取計費規則與命中技巧
  </Card>

  <Card title="API易如何保障資料安全？" icon="shield" href="/zh-Hant/faq/data-security">
    傳輸加密與不儲存請求內容
  </Card>
</CardGroup>
