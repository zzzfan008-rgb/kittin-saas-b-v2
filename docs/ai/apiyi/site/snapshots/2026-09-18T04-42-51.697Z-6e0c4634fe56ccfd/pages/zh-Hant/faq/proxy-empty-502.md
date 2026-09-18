> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 指令碼報 502 但呼叫日誌裡查不到？

> 響應裡只有 Connection: close 和 Content-Length: 0、正文為空的 502，是你電腦上的代理軟體自己生成的，不是 API易 返回的。讓指令碼繞開系統代理即可解決。

## 症狀

批次呼叫的指令碼（常見於 Windows + Python `requests`）間歇性收到 502，打印出來的響應大致是這樣：

```text theme={null}
HTTP 502: {'_non_json_response': '', '_status_code': 502,
           '_headers': {'Connection': 'close', 'Content-Length': '0'}}
```

同時有這幾個特徵：

* 響應**正文為空**，響應頭**只有** `Connection` 和 `Content-Length` 兩個欄位
* 網頁版控制台一直正常，沒有跟著打不開
* 到 [呼叫日誌](/zh-Hant/faq/call-logs) 裡查，這些失敗請求**一條記錄都沒有**
* 指令碼按 502 重試，往往要連續失敗好幾次才成功，退避時間越拉越長

## 簡短回答

<Info>
  **這種 502 不是 API易 返回的，而是你電腦上的代理軟體（Clash、v2rayN 等）自己生成的。**

  讓指令碼繞開系統代理就能解決：`requests` 裡設定 `session.trust_env = False`，其他語言的做法見下文。
</Info>

## 怎麼判斷是不是這種情況

API易 各層返回的響應都有固定特徵，和上面的空 502 對不上：

| 來源               | 響應特徵                                                   |
| ---------------- | ------------------------------------------------------ |
| API易 接入節點（nginx） | 一定帶 `Server` 和 `Date` 響應頭；節點自己生成的 5xx 還帶一段 HTML 正文     |
| API易 閘道          | 錯誤正文是 JSON，帶 `error.message`                           |
| 代理軟體轉發失敗         | 正文為空，響應頭通常只有 `Connection: close` 和 `Content-Length: 0` |

所以只要看到**沒有 `Server`、沒有 `Date`、正文為空**的 502，基本就能斷定它來自代理軟體，而不是 API易。

<Note>
  平臺側確實也會出現 502，那種是服務容器短暫重啟，網頁版會同時打不開，約 1 分鐘內恢復，而且響應帶完整的響應頭和正文。處理方法見 [網站或介面返回 502 怎麼辦](/zh-Hant/faq/website-502-error)。
</Note>

## 為什麼會被代理接管

1. **Python `requests` 會自動讀取系統代理。** 在 Windows 上，它會讀取登錄檔裡的系統代理設定。Clash、v2rayN 這類軟體一旦開啟「系統代理」，你的指令碼就會悄悄走代理，程式碼裡完全看不出來。
2. **明文 HTTP 請求由代理代發。** 用 `http://api.apiyi.com:16888` 這類明文地址時，代理不是隻做透明隧道，而是替你把請求重新發出去。代理節點抖動、切換或超時後，它會直接給你的腳本回一個空的 502。
3. **大請求體和高併發會放大問題。** 圖片編輯一次要上傳幾 MB 的圖片，單次生成要 45 到 70 秒。幾十個併發都擠在一個代理節點上，任何一次抖動都會讓一批請求同時失敗。

<Tip>
  走 `https://` 時，代理只負責搭一條加密隧道，出問題時通常表現為連線異常（比如 `ProxyError`），而不是偽造的 502。不過 HTTPS 請求照樣會經過代理，最終的解決辦法仍然是讓指令碼不走代理。
</Tip>

## 解決方法

<Steps>
  <Step title="確認指令碼有沒有走代理">
    在執行指令碼的同一個環境裡執行：

    ```python theme={null}
    import urllib.request
    print(urllib.request.getproxies())
    ```

    輸出裡有 `http` 或 `https` 項（比如 `127.0.0.1:7890`），就說明 `requests` 預設會走這個代理。
  </Step>

  <Step title="讓指令碼繞開代理（任選一種）">
    <Tabs>
      <Tab title="requests">
        ```python theme={null}
        import requests

        session = requests.Session()
        session.trust_env = False   # 不讀取系統代理和環境變數裡的代理

        resp = session.post(
            "https://api.apiyi.com/v1/images/edits",
            headers={"Authorization": "Bearer YOUR_API_KEY"},
            data={"model": "gpt-image-2-vip", "prompt": "...", "size": "1024x1536"},
            files=[("image[]", open("a.jpg", "rb"))],
            timeout=(10, 600),
        )
        ```

        只改單次請求也可以：`requests.post(..., proxies={"http": None, "https": None})`。
      </Tab>

      <Tab title="OpenAI SDK">
        ```python theme={null}
        import httpx
        from openai import OpenAI

        client = OpenAI(
            api_key="YOUR_API_KEY",
            base_url="https://api.apiyi.com/v1",
            http_client=httpx.Client(trust_env=False, timeout=600),
        )
        ```
      </Tab>

      <Tab title="環境變數">
        不想改程式碼時，在執行指令碼前設定 `NO_PROXY`，讓 API易 的域名不走代理：

        ```bash theme={null}
        # Windows PowerShell
        $env:NO_PROXY="api.apiyi.com,.apiyi.com"

        # macOS / Linux
        export NO_PROXY="api.apiyi.com,.apiyi.com"
        ```
      </Tab>

      <Tab title="代理軟體">
        在 Clash、v2rayN 等軟體裡給 `apiyi.com` 加一條直連（DIRECT）規則，或者跑批次任務時關掉「系統代理」。
      </Tab>
    </Tabs>
  </Step>

  <Step title="重新跑一小批驗證">
    先用 5 到 10 個併發跑幾十次。空 502 消失，就說明是代理的問題。API易 國內可以直連，不需要代理，詳見 [使用 API 介面需要代理網路嗎](/zh-Hant/faq/network-proxy)。
  </Step>
</Steps>

<Note>
  `http://api.apiyi.com:16888` 是正式提供的明文介面，圖片場景用它可以降低延遲（見 [圖片 API 延遲如何最佳化](/zh-Hant/faq/image-api-network-latency-optimization)），**可以繼續使用**，前提是按上面的方法繞開代理。
</Note>

## 常見疑問

<AccordionGroup>
  <Accordion title="這些失敗的請求會扣費嗎？">
    分兩種情況：

    * 代理在**請求發到 API易 之前**就失敗了：API易 沒收到請求，不會扣費，呼叫日誌裡也沒有記錄。
    * 代理在**請求已經發出、正在等待結果時**斷開：API易 可能已經在處理這張圖，並照常計費，但結果沒能回到你的指令碼。

    所以不要只看指令碼的報錯。請以 [呼叫日誌](/zh-Hant/faq/call-logs) 裡的記錄為準，核對實際扣費次數。
  </Accordion>

  <Accordion title="為什麼重試幾次之後又成功了？">
    代理節點的抖動通常是間歇性的，重試時剛好趕上節點恢復，請求就過去了。但每次重試都要重新上傳整張圖，退避時間也越來越長，批次任務的總耗時會明顯變長。繞開代理才能根治。
  </Accordion>

  <Accordion title="API易 能在服務端幫我修嗎？">
    修不了。這類失敗發生在你本機和 API易 之間的代理上，請求往往根本沒有到達 API易，或者是代理主動斷開了連線，服務端沒有辦法干預。
  </Accordion>

  <Accordion title="繞開代理之後還是有 502，怎麼辦？">
    先看響應頭：如果帶 `Server`、`Date`，正文是 HTML 或 JSON，那就是平臺側的 502，按 [網站或介面返回 502 怎麼辦](/zh-Hant/faq/website-502-error) 處理。如果持續出現，請把出錯時間（註明時區，如 `14:30 (UTC+8)`）和完整響應發給客服。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="網站或介面返回 502 怎麼辦？" icon="refresh-cw" href="/zh-Hant/faq/website-502-error">
    平臺側 502：容器短暫重啟，約 1 分鐘恢復
  </Card>

  <Card title="使用 API 介面需要代理網路嗎？" icon="wifi" href="/zh-Hant/faq/network-proxy">
    國內可直連，不需要代理或 VPN
  </Card>

  <Card title="圖片 API 延遲如何最佳化？" icon="gauge" href="/zh-Hant/faq/image-api-network-latency-optimization">
    HTTP 介面、連線複用與超時設定
  </Card>

  <Card title="如何避免介面超時？" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    timeout 設定與逐層排查
  </Card>
</CardGroup>
