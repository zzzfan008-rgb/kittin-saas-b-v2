> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何避免介面超時？

> 客戶端 timeout 設定、推理型模型的耗時特點、Base URL 節點選擇與 429 併發排查——一次講清避免介面超時的四個關鍵點

## 簡短回答

<Info>
  **三條黃金法則，覆蓋 90% 的超時問題：**

  1. **圖片類同步介面 timeout 設到 360 秒兜底**——圖片生成沒有非同步任務 ID，客戶端提前斷開 = 照常計費但拿不到圖。
  2. **推理型模型要留足時間**——`gemini-3.1-pro-preview`、`gpt-5.6-sol`、`gpt-5.5-pro` 等模型無論流式還是非流式，總耗時都可能達到幾分鐘。
  3. **別用 CDN 節點跑長請求**——`api-cf.apiyi.com` 走 Cloudflare，超過約 100 秒會返回 `524`，只適合快速文本呼叫。

  另外：若個別模型頻繁出現 `429`（併發不足），可聯絡客服排查配額。
</Info>

## 一張表看懂該設多少 timeout

| 呼叫場景                        | 推薦 timeout    | 推薦節點                              | 備註           |
| --------------------------- | ------------- | --------------------------------- | ------------ |
| 普通文本對話（非推理）                 | 60-120 秒      | 任意節點                              | 通常幾秒內返回      |
| 推理型模型（thinking / reasoning） | **300-600 秒** | `api.apiyi.com` / `vip.apiyi.com` | 流式與非流式都可能很慢  |
| 長文本輸出（萬字級）                  | **300 秒以上**   | `api.apiyi.com` / `vip.apiyi.com` | ❌ 不要用 CDN 節點 |
| 圖片生成 / 編輯                   | **360 秒兜底**   | `api.apiyi.com` / `vip.apiyi.com` | ❌ 不要用 CDN 節點 |
| 4K 出圖、多圖參考                  | **600 秒**     | 同上                                | 詳見圖片最佳實踐     |

<Warning>
  **超時斷開仍然計費**

  客戶端主動斷開後，服務端與上游的生成任務**仍會跑完**，這次請求**照常計費**。

  也就是說：**timeout 設小了 = 花了錢卻拿不到結果**。寧可一次性把 timeout 調到安全上限，也不要讓請求"快成功了卻被自己掐斷"。
</Warning>

## 四個關鍵點詳解

<AccordionGroup>
  <Accordion title="① 圖片類同步介面：timeout 設到 360 秒">
    API易 的圖片模型**全部是同步呼叫**——發出請求後保持連線等待，結果直接在響應體裡返回。沒有非同步任務 ID，也沒有輪詢介面，斷開就丟結果。

    **為什麼預設值會誤傷**：主流 HTTP 客戶端預設超時普遍在 30-60 秒，而圖片生成是真正的"長請求"：

    * GPT-Image-2 在 `high` 品質 + 2K/4K 下實測 3-5 分鐘
    * Nano Banana 系列 4K 出圖約 50 秒起步，高峰期更久
    * 多圖參考類任務常常超過 5 分鐘

    **實踐建議**：不清楚具體模型耗時時，統一用 **360 秒**兜底；4K、多圖參考等重任務給到 **600 秒**。按模型分檔的精確推薦值見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。

    <Tip>
      出圖偶爾"日誌顯示 30 秒完成，客戶端卻等了 5 分鐘"——這是因為日誌的用時只記到閘道處理結束，而你要等到響應體收完並收到收尾訊號。**調大 timeout 不一定管用**：下行慢的那一類有用，資料已到齊卻等不到收尾訊號的那一類沒用。先按[日誌顯示已完成卻收不到響應](/zh-Hant/faq/log-duration-vs-client-wait)測一次，再決定怎麼處理。
    </Tip>
  </Accordion>

  <Accordion title="② 推理型文本模型：流式和非流式都慢">
    普通文本模型通常幾秒內就返回，容易讓人誤以為"文本呼叫不用管 timeout"。但**推理型（reasoning / thinking）模型是例外**：

    * `gemini-3.1-pro-preview`
    * `gpt-5.6-sol`
    * `gpt-5.5-pro`（更貴也更慢）
    * 其他開啟了高思考預算（high reasoning effort）的模型

    這類模型會先進行長時間的內部推理再產出答案，**總耗時達到幾分鐘是常態**。

    **關鍵提醒：流式輸出並不能解決超時問題**。很多人以為開了 `stream=True` 就會立刻有資料，但推理模型在思考階段可能長時間不吐任何 token，客戶端的 read timeout 一樣會被觸發；而且從首字到最後一個 token 的**總時長**依舊很長。

    **實踐建議**：呼叫推理型模型時把 timeout 設到 **300-600 秒**，並把思考檔位（`reasoning_effort` / `thinking`）與預期耗時對應起來——檔位越高，需要留的時間越多。
  </Accordion>

  <Accordion title="③ Base URL 節點選擇：CDN 節點不能跑長請求">
    API易 的 `api-cf.apiyi.com` 是套了 **Cloudflare 全球 CDN** 的介面地址。它的優勢是全球加速、海外訪問延遲低，但**存在約 100 秒的請求超時上限**，超過就會返回 `524` 錯誤。

    ⚠️ **注意：這不只影響圖片介面**。任何可能超過 100 秒的呼叫都不適合走這個節點，包括：

    * ❌ 圖片生成 / 編輯
    * ❌ 影片生成
    * ❌ 長文本輸出（萬字級文章、長篇翻譯、大段程式碼生成）
    * ❌ 推理型模型的深度思考任務

    ✅ **適合**：普通文本對話、短文本生成等能在 100 秒內完成的快速呼叫。

    **實踐建議**：長請求場景請改用 `api.apiyi.com`（中國大陸推薦）或 `vip.apiyi.com`（海外推薦）。完整節點對比見 [Base URL 配置指南](/zh-Hant/faq/base-url-config)。
  </Accordion>

  <Accordion title="④ 遇到 429 併發不足：聯絡客服排查">
    如果超時的同時還伴隨大量 `429 Too Many Requests`，那多半不是 timeout 的問題，而是**併發配額**問題。

    併發限制是**針對單一模型**的，不是整個賬號共享。個別模型（尤其是剛上線或供給緊張的模型）可能配額偏低。

    **處理方式**：

    1. 先實現指數退避重試，避免瞬時打滿
    2. 若長期、穩定地出現 429，**聯絡本站客服排查**——我們可以核查該模型的實際配額並協助調整

    併發規則詳見 [API 可以開多少併發？](/zh-Hant/faq/api-concurrency)
  </Accordion>
</AccordionGroup>

## 程式碼示例

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",  # 長請求不要用 api-cf 節點
    )

    # 按場景分檔設定超時（秒），不要全域性用一個值
    TIMEOUTS = {
        "text":      120,   # 普通文本
        "reasoning": 600,   # 推理型模型
        "image":     360,   # 圖片生成兜底
        "image_4k":  600,   # 4K / 多圖參考
    }

    resp = client.chat.completions.create(
        model="gpt-5.6-sol",
        messages=[{"role": "user", "content": "幫我分析這段程式碼的複雜度"}],
        timeout=TIMEOUTS["reasoning"],   # 推理模型留足 600 秒
    )
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      timeout: 600 * 1000,   // 毫秒，推理型模型留 600 秒
      maxRetries: 0,         // 長請求慎用自動重試，避免重複計費
    });

    const resp = await client.chat.completions.create({
      model: "gemini-3.1-pro-preview",
      messages: [{ role: "user", content: "寫一篇 8000 字的技術分析" }],
    });
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # --max-time 控制整個請求的最長時間（秒）
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      --max-time 360 \
      -d '{
        "model": "gpt-image-2",
        "prompt": "a serene mountain lake at sunrise",
        "size": "2048x2048"
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **長請求慎開自動重試**：很多 SDK 預設帶 2 次重試。圖片和推理任務一旦超時重試，可能變成"扣了三次費、一張圖都沒拿到"。建議把 `max_retries` 設為 0，由業務層自己控制重試邏輯。
</Warning>

## 已經調大 timeout 還是超時？逐層排查

<Steps>
  <Step title="第一步：確認 SDK 的真實 timeout 生效">
    有些框架會在 HTTP 客戶端外再包一層超時。列印實際生效的配置，確認你改的那個引數真的被用上了。
  </Step>

  <Step title="第二步：檢查鏈路上的每一跳">
    請求鏈路上任何一層超時小於生成耗時，都會先於你的客戶端斷開：

    * 自建反向代理：Nginx 的 `proxy_read_timeout`（預設 60 秒）
    * 雲負載均衡：空閒連線超時
    * API 閘道 / CDN：回源超時
    * Serverless 函式：執行時長上限（很多平臺預設 30-60 秒）
    * 任務佇列 worker：單任務超時

    **每一跳都要放寬**，只改客戶端是沒用的。
  </Step>

  <Step title="第三步：確認沒有走 CDN 節點">
    檢查 Base URL 是不是 `api-cf.apiyi.com`。如果是長請求場景，換成 `api.apiyi.com` 或 `vip.apiyi.com`。

    判斷依據：報 **`524`** 基本可以確定是 Cloudflare 層超時，而不是模型太慢。
  </Step>

  <Step title="第四步：區分超時與併發不足">
    看錯誤碼：`524` / 連線中斷 是超時問題；`429` 是併發配額問題。兩者的解決方向完全不同。
  </Step>

  <Step title="第五步：查呼叫日誌確認實際耗時">
    在控制台的[呼叫日誌](/zh-Hant/faq/call-logs)裡檢視該請求的實際耗時和計費情況，據此反推合理的 timeout 值。
  </Step>
</Steps>

## 常見疑問

<AccordionGroup>
  <Accordion title="超時斷開的請求，能退費嗎？">
    不能。客戶端斷開後，服務端與上游的生成任務仍然完成了，成本已經真實產生。

    所以正確做法是**一次性把 timeout 調到安全上限**，而不是設一個小值再靠重試——重試只會讓計費翻倍。
  </Accordion>

  <Accordion title="能不能提供非同步介面，斷線後憑 ID 取回結果？">
    圖片介面目前是**原廠透傳的同步模式**，且我們不記錄使用者業務資料，因此無法提供"斷線後憑 ID 取回"的能力。

    推薦做法：同步呼叫 + 合理 timeout + 在自己後臺記錄任務狀態，等價於一個輕量非同步佇列。詳見 [圖片介面是同步還是非同步？](/zh-Hant/faq/image-async-api)

    影片類模型本身是非同步任務制，不受此限制。
  </Accordion>

  <Accordion title="開啟流式輸出能避免超時嗎？">
    **部分能，但不要依賴它。**

    流式確實能讓首字更早到達，降低"整體無響應"的風險。但推理型模型在思考階段可能長時間不吐 token，read timeout 一樣會觸發；而且完整輸出的總時長並不會變短。

    正確做法是：流式 + 足夠大的 timeout，兩者一起用。
  </Accordion>

  <Accordion title="timeout 設得特別大會有副作用嗎？">
    對計費沒有影響——**計費只看實際消耗的 token 和呼叫，與你等了多久無關**。

    唯一要注意的是業務層的資源佔用：長連線會佔住一個 worker / 連線池槽位，高併發場景建議用非同步 IO 或獨立的長任務佇列來跑圖片和推理請求。
  </Accordion>

  <Accordion title="524 和 429 有什麼區別？">
    * **`524`**：Cloudflare 層的超時，說明你走了 `api-cf.apiyi.com` 且請求超過約 100 秒。換節點即可。
    * **`429`**：併發或速率超限，與耗時無關。先做指數退避，長期出現請聯絡客服排查配額。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="圖片 API 呼叫須知與最佳實踐" icon="image" href="/zh-Hant/api-capabilities/image-api-best-practices">
    各圖片模型的 timeout 速查表與輸出格式對照
  </Card>

  <Card title="Base URL 怎麼填？" icon="link" href="/zh-Hant/faq/base-url-config">
    四個節點的區別與選擇建議
  </Card>

  <Card title="圖片介面是同步還是非同步？" icon="refresh-cw" href="/zh-Hant/faq/image-async-api">
    同步呼叫模式與客戶端任務管理方案
  </Card>

  <Card title="API 可以開多少併發？" icon="gauge" href="/zh-Hant/faq/api-concurrency">
    各類模型的併發限制與配額申請
  </Card>
</CardGroup>

## 聯絡我們

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    超時排查、併發配額申請
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
