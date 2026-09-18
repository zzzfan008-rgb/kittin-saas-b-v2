> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 呼叫的預扣費機制是什麼？

> 講清 API易的預扣費（預扣額度）機制：請求前按模型價格和輸入預估扣費、最終按實際結算，並教你看懂 insufficient_user_quota 報錯。

## 簡短回答

API易在每次請求**真正執行之前**，會先按「模型價格 × 預估 token 數」算出一筆**預扣費**（預估的最大可能花費），並臨時凍結這筆額度。請求完成後**按實際消耗的 token 結算，多退少補**——預扣費只是估算，不是最終賬單。

<Info>
  **核心兩句話**

  * **預扣費**：請求前的估算，用來判斷"你這次跑得起跑不起"。
  * **實際計費**：請求完成後按真實 token 結算，最終扣的是這個。
</Info>

如果**預扣費估算金額 > 當前賬戶餘額**，請求會在執行前被直接拒絕，返回 `insufficient_user_quota`。這就是「明明還有餘額，卻跑不通」的根本原因。

## 預扣費是怎麼運作的

<Steps>
  <Step title="請求前：估算並凍結">
    系統讀取你這次的**輸入內容**（prompt、圖片、歷史對話等），按當前模型的價格和**預估的輸出長度**，算出一個**最大可能花費**，臨時從餘額裡凍結。

    估算邏輯大致是：

    `預扣費 ≈ 模型價格 ×（輸入 tokens + 預估輸出 tokens）`
  </Step>

  <Step title="執行前校驗：餘額夠不夠">
    拿**預扣費**和你的**當前餘額**比較：

    * 餘額 ≥ 預扣費 → 放行，請求正常發出
    * 餘額 \< 預扣費 → 直接拒絕，報 `insufficient_user_quota`，**不會真的發起呼叫**
  </Step>

  <Step title="請求後：按實際結算，多退少補">
    請求完成後，系統拿到真實的輸入/輸出 token 用量，按實際重新計費：

    * 實際花費**通常小於**預扣費 → 把多凍結的額度**退還**回餘額
    * 失敗/中斷的請求 → 一般不計費，預扣額度釋放
  </Step>
</Steps>

<Tip>
  **所以預扣費偏大不代表真的花這麼多**——它是"按最壞情況預留"的估算。真正扣的錢以請求完成後的實際 token 為準。
</Tip>

## 看懂這條報錯：insufficient\_user\_quota

當預扣費超過餘額時，你會看到類似這樣的返回：

```json theme={null}
{
  "error": {
    "message": "user [25359] quota [50264897] preConsumedQuota [154753475] is not enough",
    "localized_message": "Insufficient user quota",
    "type": "shell_api_error",
    "param": "",
    "code": "insufficient_user_quota"
  }
}
```

逐項拆解：

| 欄位                              | 含義                       |
| ------------------------------- | ------------------------ |
| `quota [50264897]`              | 你賬戶**當前可用的餘額**（內部額度單位）   |
| `preConsumedQuota [154753475]`  | 本次請求**預估要預扣的額度**         |
| `is not enough`                 | 預扣費 > 餘額，餘額不夠凍結，**請求被拒** |
| `code: insufficient_user_quota` | 錯誤碼：使用者額度不足              |

關鍵看兩個數字的**大小關係**：本例中預扣費 `154753475` ≈ 餘額 `50264897` 的 **3 倍**，所以被攔下。

<Note>
  這兩個數字是 API易 的**內部額度單位**，可以直接比較大小。換算成美元約為：餘額 ≈ \$100，本次預扣費估算 ≈ \$310（內部約 500,000 單位 ≈ \$1）。也就是說，這一次請求想預扣 \$300 多，而賬戶只有 \$100，自然跑不通。
</Note>

## 為什麼"有餘額卻跑不通"

絕大多數情況下，**問題出在輸入太大**，而不是餘額本身。

舉個真例項子：`gpt-5.5` 的上下文視窗高達 1,050,000 tokens。如果你把**一個很大的程式碼倉庫**整個塞進去，輸入 token 極高，預扣費就會被頂到非常大的數額——哪怕你有 \$100 餘額，預扣費估算到了 \$300，照樣在執行前被拒。

<Warning>
  **輸入越大，預扣費越高**

  超大輸入不僅讓預扣費飆升、容易觸發 `insufficient_user_quota`，而且：

  * 即使跑通了，**實際花費也很高**（按真實 token 計費）；
  * 塞太多無關內容，模型反而**可能給出一般的結果**，錢花了效果還不好。
</Warning>

## 如何解決和避免

<CardGroup cols={2}>
  <Card title="精簡輸入" icon="scissors">
    只傳**相關**的程式碼/文件，別把整個倉庫或長文件一股腦塞進去。這是最有效的辦法。
  </Card>

  <Card title="設定 max_tokens" icon="ruler">
    顯式限制輸出長度，可以壓低"預估輸出 tokens"，從而降低預扣費。詳見 [max\_tokens 說明](/zh-Hant/faq/max-tokens)。
  </Card>

  <Card title="充值餘額" icon="credit-card">
    確實需要大輸入時，保證餘額 > 預扣費即可放行。見 [充值方式](/zh-Hant/faq/payment-methods)。
  </Card>

  <Card title="先用小模型試" icon="flask-conical">
    用便宜的模型先驗證輸入是否合理，確認無誤再切高階模型，避免"燒不起"。
  </Card>
</CardGroup>

<Tip>
  **慎跑大內容**：高上下文模型（如 `gpt-5.5` 的 105 萬 tokens）能裝很多，但"能裝"不等於"該裝"。塞一個大倉庫往往既貴、效果又一般，先想清楚真正需要哪些上下文。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="預扣費會真的扣這麼多錢嗎？">
    不會。預扣費只是**請求前的臨時凍結**，最終以請求完成後的**實際 token 用量**結算，多預扣的部分會退還。你看到的 `preConsumedQuota` 是"按最壞情況預留"的估算值，不是真實賬單。
  </Accordion>

  <Accordion title="請求失敗了會扣費嗎？">
    一般不會。報 `insufficient_user_quota` 是在**執行前**就被攔下，根本沒有真正呼叫模型，不產生實際費用，預扣額度也會釋放。
  </Accordion>

  <Accordion title="我餘額明明夠，為什麼還報額度不足？">
    報錯比較的是**預扣費**和餘額，不是"實際花費"和餘額。你的輸入太大導致預扣費估算遠超餘額，就會被拒。先精簡輸入，或設定 `max_tokens` 降低預估輸出，再不行就充值。
  </Accordion>

  <Accordion title="上下文視窗大的模型是不是一定更貴？">
    模型單價由模型本身決定，**視窗大≠單價高**。但視窗大意味著你"能塞"的輸入更多，一旦真塞滿，輸入 token 暴漲，預扣費和實際費用都會很高。貴的是"你塞進去的量"，不是視窗本身。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="為什麼還有餘額跑不通？" icon="credit-card" href="/zh-Hant/faq/balance-insufficient">
    餘額不足的完整排查與解決方案。
  </Card>

  <Card title="max_tokens 怎麼設定？" icon="ruler" href="/zh-Hant/faq/max-tokens">
    控制輸出長度，影響預扣費估算。
  </Card>

  <Card title="影片任務按 task_id 查真實消費" icon="receipt" href="/zh-Hant/faq/seedance-task-cost-lookup">
    非同步影片的預扣 + 結算兩條日誌與任務 quota 的關係。
  </Card>

  <Card title="令牌計費模式" icon="coins" href="/zh-Hant/faq/token-billing-modes">
    瞭解按量計費的結算方式。
  </Card>

  <Card title="充值方式" icon="credit-card" href="/zh-Hant/faq/payment-methods">
    餘額不足時如何快速充值。
  </Card>
</CardGroup>
