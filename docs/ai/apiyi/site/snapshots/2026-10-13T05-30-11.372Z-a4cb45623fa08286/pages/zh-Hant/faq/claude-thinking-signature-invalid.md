> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 多輪對話報「思考簽名無效」怎麼辦？

> Claude Code、Claude Agent 智慧體報 Invalid signature in thinking block 且顯示 429 時，不是限流，而是會話歷史裡的思考塊簽名失效。新開會話即可解決。

## 簡短回答

報錯長這樣：

```text theme={null}
API Error: Request rejected (429) · messages.1.content.0: Invalid `signature` in `thinking` block
```

報錯裡雖然帶著 429，但**這不是限流**，是**會話歷史裡某個思考塊（thinking block）的簽名沒有通過原廠校驗**。這個歷史每次都會原樣發出去，所以客戶端自動重試多少次都會失敗。

**解決辦法：新開一個會話。** 智慧體、模型、Key 的配置都不用改。

## 典型症狀

用 Claude Code、Claude Agent SDK，或者 Cherry Studio 等客戶端的「Claude Agent」智慧體模式，同時開著思考時：

* 主對話一直出不來，介面顯示「請求過於頻繁」「9 秒後重試 5/10」之類的提示，重試 10 次後停止；
* 控制台日誌裡**能看到這個 Key 有正常計費的請求**，但都是 token 很少的小請求。那是客戶端用 Small 模型發的輔助請求（生成標題、判斷意圖等），它們不帶歷史，所以能成功；
* 在這個會話裡點「繼續」、換個說法重發，都是同樣的報錯；新開會話後立刻恢復正常。

## 為什麼會這樣

開啟思考後，Claude 每輪迴復開頭會有一個 `thinking` 塊，塊裡帶一個 `signature`（簽名）。下一輪請求時，客戶端要把上一輪的 `thinking` 塊**連同簽名一字不改**地放回歷史，原廠會校驗簽名，確認思考內容沒有被改動過。

下面幾種情況都會讓簽名校驗失敗：

<CardGroup cols={2}>
  <Card title="簽名丟失或為空" icon="file-x">
    客戶端儲存會話歷史時沒有存下簽名，回傳時 `signature` 為空字串或整個欄位缺失。社群裡已有多個客戶端出現過這類問題，常見於思考和檔案讀取等工具呼叫同時開啟的場景。
  </Card>

  <Card title="思考內容被改動" icon="pencil">
    手動編輯過歷史訊息、客戶端對歷史做了壓縮或裁剪，或者經過的代理對請求體重新排版，都會讓思考內容與簽名對不上。
  </Card>

  <Card title="中途切換模型" icon="shuffle">
    同一個會話裡先用 A 模型生成了思考塊，再切到 B 模型繼續，B 模型可能不認 A 留下的簽名。
  </Card>

  <Card title="中途切換 Key 或分組" icon="key">
    同一個會話中途換了 Key 或令牌分組，後續請求可能由不同的線路處理，前面留下的簽名可能無法通過校驗。
  </Card>
</CardGroup>

報錯資訊裡的 `messages.1.content.0` 指的是歷史裡**第一條 assistant 回覆的第一個內容塊**，也就是會話開頭那一輪的思考塊。只要它壞了，這個會話後面的每一輪都會失敗。

## 解決步驟

<Steps>
  <Step title="新開會話">
    在客戶端裡新建一個會話，重新上傳檔案、重新提問。智慧體配置、模型、Key 都不用改。這是最快、最確定的辦法。
  </Step>

  <Step title="一個會話只用一個模型、一個 Key">
    需要換模型或換 Key 時，新開會話再換，不要在已有思考歷史的會話裡切換。
  </Step>

  <Step title="不要手動改歷史">
    不要編輯、刪除歷史中 assistant 訊息的思考內容。需要精簡上下文時，用客戶端自帶的壓縮功能，或者直接新開會話。
  </Step>

  <Step title="升級客戶端">
    如果新會話裡沒過幾輪又復現，多半是客戶端儲存歷史時丟了簽名。升級到最新版本，並把復現步驟反饋給客戶端的開發者。
  </Step>
</Steps>

<Tip>
  **自己寫程式碼呼叫時**：回傳歷史時，`thinking` 塊要麼**原樣保留**（包括 `signature` 欄位），要麼**整塊去掉**，不要只保留思考文字、丟掉簽名。用官方 SDK 時，直接把上一輪響應的 `content` 陣列原樣放回 `messages` 即可。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="報錯裡寫著 429，需要降低請求頻率嗎？">
    不需要。這個報錯的原因是請求內容無效，跟頻率無關，退避重試、換時間段都不會好轉。看到 `Invalid signature in thinking block` 就直接新開會話。
  </Accordion>

  <Accordion title="失敗的請求會扣費嗎？">
    不會。簽名校驗在模型生成之前就失敗了，這些請求不產生費用，控制台日誌裡也不會有記錄。日誌裡看到的計費都來自成功的請求（通常是客戶端的輔助小請求）。
  </Accordion>

  <Accordion title="關掉思考能繞過嗎？">
    在同一個會話裡關掉思考不一定有用，歷史裡已經存在的思考塊仍然會被髮送。新開會話更可靠。如果任務確實不需要思考，也可以換用不帶 `-thinking` 字尾的模型，從新會話開始用。
  </Accordion>

  <Accordion title="新開會話後還是反覆出現怎麼辦？">
    請聯絡客服，提供出錯的大致時間（註明時區，如 `17:00 (UTC+8)`）、使用的客戶端及版本、模型名。我們可以按時間定位這個會話的請求，協助排查。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="Claude Effort 努力檔位與思考指南" icon="brain" href="/zh-Hant/api-capabilities/claude-effort-thinking">
    思考模式的開關、流式事件與簽名回傳
  </Card>

  <Card title="Claude 原生格式：流式與非流式響應" icon="sparkles" href="/zh-Hant/api-capabilities/claude-response-handling">
    `thinking` 塊與 `signature_delta` 的結構
  </Card>

  <Card title="Claude Code 接入" icon="terminal" href="/zh-Hant/scenarios/programming/claude-code">
    在 Claude Code 中配置 API易
  </Card>

  <Card title="API 可以開多少併發？" icon="gauge" href="/zh-Hant/faq/api-concurrency">
    併發與限流說明
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.