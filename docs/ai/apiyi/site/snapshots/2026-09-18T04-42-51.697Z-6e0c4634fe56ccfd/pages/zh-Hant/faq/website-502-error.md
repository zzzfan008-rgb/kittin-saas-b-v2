> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 網站或介面返回 502 怎麼辦？

> 502 是服務容器自動重啟期間的短暫現象，一般 1 分鐘內自動恢復——失敗呼叫不計費，客戶端加 30 秒重試即可無感跨過

## 簡短回答

<Info>
  **502 是短暫現象，不需要做任何配置改動：**

  1. **根因是服務容器自動重啟**——重啟視窗內網頁版打不開、API 也會報 502，兩者是同一件事。
  2. **一般 1 分鐘內自動恢復**——等 30-60 秒重新發起呼叫即可。
  3. **失敗呼叫不計費**——502 期間請求沒有真正打進服務，不會產生任何計費記錄。
  4. **客戶端建議加自動重試**——間隔 30 秒左右重試一次，就能無感跨過整個重啟視窗。
</Info>

## 發生了什麼

`502 Bad Gateway` 的含義是：**閘道層收到了你的請求，但轉發到後端服務時沒有得到響應**。

在 API易 這邊，絕大多數瞬時 502 的原因是**後端服務容器發生了一次自動重啟**。重啟期間後端程序短暫不可用，於是：

* **網頁版**（控制台、充值頁等）打不開或報錯
* **API 介面**（`api.apiyi.com` 等所有節點）返回 502

兩者由同一個後端服務支撐，所以會**同時出現、同時恢復**。系統檢測到異常後會自動完成重啟，整個過程**一般在 1 分鐘內結束**，無需人工干預。

<Note>
  **這類 502 與你的程式碼、Key、餘額、網路配置都無關**。如果你是第一次遇到，不需要排查客戶端——先等 30-60 秒重試，絕大多數情況下就已經恢復了。
</Note>

## 你需要做什麼

<Steps>
  <Step title="第一步：等 30-60 秒，重新發起請求">
    容器重啟一般在 1 分鐘內完成。API 呼叫直接重發即可；由於失敗呼叫不計費，重試不會產生重複扣費。
  </Step>

  <Step title="第二步：網頁版打不開時，強制重新整理頁面">
    恢復後瀏覽器可能仍顯示快取的錯誤頁，使用 **Ctrl+Shift+R**（Windows）或 **Cmd+Shift+R**（Mac）強制重新整理即可看到正常介面。
  </Step>

  <Step title="第三步：持續 502 超過 5 分鐘，聯絡客服">
    瞬時重啟不會超過幾分鐘。如果 502 **持續 5 分鐘以上**，說明不是常規的自動重啟，請通過頁面底部的聯絡方式反饋給我們，並附上大致的發生時間（註明時區，如 `14:30 (UTC+8)`）。
  </Step>
</Steps>

## 給程式化呼叫加自動重試

如果你的業務對可用性敏感，建議在客戶端為 502 這類瞬時錯誤加上自動重試——間隔 30 秒左右重試一次，即可覆蓋整個重啟視窗。

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import time
    from openai import OpenAI, InternalServerError

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",
        max_retries=0,  # 關閉 SDK 預設重試，由下面的邏輯接管
    )

    def chat_with_retry(messages, retries=2, wait=30):
        for attempt in range(retries + 1):
            try:
                return client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                )
            except InternalServerError:
                # 502 / 503 等 5xx：請求沒有打進服務，不計費，可放心重試
                if attempt == retries:
                    raise
                time.sleep(wait)  # 容器重啟一般 1 分鐘內完成，等 30 秒再試

    resp = chat_with_retry([{"role": "user", "content": "你好"}])
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      maxRetries: 0, // 關閉 SDK 預設重試，由下面的邏輯接管
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function chatWithRetry(messages, retries = 2, waitMs = 30_000) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await client.chat.completions.create({
            model: "gpt-4o",
            messages,
          });
        } catch (err) {
          // 502 / 503 等 5xx：請求沒有打進服務，不計費，可放心重試
          if (err.status < 500 || attempt >= retries) throw err;
          await sleep(waitMs); // 容器重啟一般 1 分鐘內完成，等 30 秒再試
        }
      }
    }

    const resp = await chatWithRetry([{ role: "user", content: "你好" }]);
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # curl 的 --retry 會自動對 502/503/504 等瞬時錯誤重試
    curl https://api.apiyi.com/v1/chat/completions \
      --retry 2 --retry-delay 30 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "你好"}]
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **重試策略只用於 502/503 這類"沒打進服務"的錯誤**。超時斷開（客戶端 timeout、`524`）的請求在服務端可能仍在執行並照常計費，盲目重試會造成重複扣費——這類問題請看 [如何避免介面超時](/zh-Hant/faq/timeout-configuration)。
</Warning>

<Tip>
  如果你的呼叫頻率很高，也可以用**指數退避**（首次 1 秒、2 秒、4 秒）先快速試探——網路抖動類的瞬時 502 通常幾秒內就恢復；仍失敗再回落到 30 秒間隔，覆蓋容器重啟的場景。
</Tip>

## 常見疑問

<AccordionGroup>
  <Accordion title="502 期間的請求會計費嗎？">
    **不會**。502 意味著請求根本沒有打進後端服務，沒有產生任何模型消耗，因此**不會出現在計費記錄裡**。

    這也是一個實用的判斷依據：如果某次報錯的請求在 [呼叫日誌](/zh-Hant/faq/call-logs) 裡查不到計費記錄，說明它沒有被服務端處理過，放心重發即可。
  </Accordion>

  <Accordion title="502 和超時、429、524 有什麼區別？">
    * **`502`**：後端服務短暫不可用（容器重啟中）。等 30-60 秒重試，不計費。
    * **超時 / 連線中斷**：客戶端 timeout 設定太短，服務端可能仍在執行且照常計費。見 [如何避免介面超時](/zh-Hant/faq/timeout-configuration)。
    * **`429`**：併發或速率超限，與服務可用性無關。見 [API 可以開多少併發](/zh-Hant/faq/api-concurrency)。
    * **`524`**：走了 CDN 節點（`api-cf.apiyi.com`）且請求超過約 100 秒，換節點即可。

    處理方向完全不同：**只有 502/503 適合直接重試**。
  </Accordion>

  <Accordion title="為什麼網頁版和 API 同時報錯？">
    網頁版控制台和 API 介面由同一個後端服務支撐。容器重啟時兩者會**同時不可用、同時恢復**——所以「網頁也打不開」恰恰說明這是平臺側的瞬時問題，而不是你的客戶端配置出了錯。
  </Accordion>

  <Accordion title="這種情況會經常發生嗎？">
    不會常態化。瞬時 502 通常與突發流量高峰有關，屬於偶發現象。

    **2026 年 8 月我們已在進行後端伺服器擴容升級**，此類瞬時 502 的發生頻率會顯著下降。如遇平臺側異常，我們會第一時間在 [即時動態](/live) 釋出通報和恢復進展。
  </Accordion>

  <Accordion title="如何確認是平臺問題還是我自己的網路問題？">
    兩個快速判斷方法：

    1. **開啟網頁版**：如果 `api.apiyi.com` 報 502 的同時網頁版也打不開，基本可以確定是平臺側瞬時重啟，等 1 分鐘即可。
    2. **換網路測試**：用手機流量（不同運營商）訪問網頁版或執行下面的命令，能通則說明是你本地網路或代理的問題。

    ```bash theme={null}
    curl -I https://api.apiyi.com/v1/models \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

    如果換網路後依然全部 502 且持續超過 5 分鐘，請聯絡客服。

    另外，如果網頁版一直正常、只有指令碼間歇報 502，而且響應正文為空、呼叫日誌裡也查不到這些請求，多半是本機代理軟體自己生成的 502，見 [指令碼報 502 但呼叫日誌裡查不到？](/zh-Hant/faq/proxy-empty-502)。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="如何避免介面超時？" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    timeout 設定、推理模型耗時與 524 排查
  </Card>

  <Card title="使用 API 需要代理網路嗎？" icon="wifi" href="/zh-Hant/faq/network-proxy">
    國內直連說明與網路環境要求
  </Card>

  <Card title="API易的伺服器在哪裡？" icon="server" href="/zh-Hant/faq/server-location">
    節點分佈、延遲測試與選購建議
  </Card>

  <Card title="服務可用性與 SLA 保障" icon="shield-check" href="/zh-Hant/faq/sla-guarantee">
    可用性承諾與故障響應機制
  </Card>
</CardGroup>

## 聯絡我們

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增，或點選本卡片直接聯絡客服

    持續 502 反饋、故障排查
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
