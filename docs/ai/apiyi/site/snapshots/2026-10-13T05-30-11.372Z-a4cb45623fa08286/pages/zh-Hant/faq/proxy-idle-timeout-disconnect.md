> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 開著代理調用出圖，總在 90 秒左右斷開？

> 本地開發時電腦開著 VPN/代理，出圖請求在 90~180 秒成批斷開、超時設得再長也沒用，而且照樣扣費。原因是代理會掐斷長時間沒有資料的連線，把 api.apiyi.com 設為直連即可解決。

## 症狀

在自己電腦上開發、調試出圖程式時，電腦開著 VPN 或代理軟體（很多開發者是為了讓 AI 程式設計工具正常聯網），出現這些情況：

* 出圖請求經常報連線中斷，例如 `socket hang up`、`ECONNRESET`、`RemoteDisconnected`、`Connection aborted`
* 程式裡的超時已經設到 600 秒甚至 900 秒，請求卻在 **90\~180 秒**左右就斷了
* 經常**好幾張一起失敗**，像是被一刀切掉
* 出圖越慢的模型越容易中（如 `gpt-image-2-vip`，單張通常要 60\~120 秒）
* 到 [呼叫日誌](/zh-Hant/faq/call-logs) 裡看，這些請求**大多有成功扣費的記錄**

## 簡短回答

<Info>
  **這不是併發限制，也不是 API易 的超時，而是你電腦上的代理把「一段時間沒有資料」的連線掐斷了。**

  出圖期間，連線上本來就沒有任何資料在傳，圖越慢出來，越容易被代理當成空閒連接回收。把 `api.apiyi.com` 設為直連（不走代理）就能解決，API易 在國內可以直接訪問。
</Info>

## 為什麼會這樣

一次非流式的出圖請求分三段：

1. **上傳**：把提示詞和參考圖發出去，幾秒到幾十秒
2. **等待**：服務端出圖，通常 60\~200 秒。**這期間連線上沒有任何資料**
3. **下載**：圖出好後一次性返回

問題出在第 2 段。代理軟體和代理節點為了回收資源，會給每條連線設一個「空閒超時」：上傳、下載兩個方向都沒有資料，超過這個時長就把連線斷掉。以常見的 Xray / V2Ray 核心為例，對應配置叫 `connIdle`，預設 300 秒，但**節點服務端可以改得更短**，你在本機看不到、也改不了。我們處理過的案例裡，這個值約為 90 秒。

所以：

* **程式裡的 timeout 管不到它**。timeout 是你的程式願意等多久，代理在中間先斷了，程式只能收到「連線中斷」
* **為什麼一批一起斷**：代理通常是定時巡檢，每次把所有超過空閒時長的連線一起斷開。同時在等圖的幾個請求會在同一秒失敗
* **為什麼聊天、寫程式碼不受影響**：流式對話一直有資料在傳，連線從來不會空閒；出圖是幾分鐘裡一個位元組都沒有

<Warning>
  **斷開以後通常照樣扣費。** 請求已經到達 API易 並開始出圖，你這邊斷開不會讓出圖停下來，圖照常生成、照常計費，只是結果回不到你的程式。請以 [呼叫日誌](/zh-Hant/faq/call-logs) 裡的記錄為準核對實際扣費，不要只看程式的報錯數。
</Warning>

## 怎麼確認是這個問題

<Steps>
  <Step title="看斷開的時長和節奏">
    把失敗請求從發出到報錯的耗時打出來。如果集中在某個固定值附近（比如 90 秒、180 秒），且常有幾個請求在**同一秒**一起失敗，基本就是代理空閒超時。
  </Step>

  <Step title="對照呼叫日誌">
    在 [呼叫日誌](/zh-Hant/faq/call-logs) 裡找對應時間段：程式報了斷開，日誌裡卻有成功扣費的記錄，說明 API易 這邊已經出圖完成，是回程的連線被斷了。
  </Step>

  <Step title="設直連跑一小批對比">
    按下文把 `api.apiyi.com` 設為直連，同樣的引數跑 10\~20 張。斷開消失，就可以確認是代理的問題。
  </Step>
</Steps>

## 解決方法

<Tabs>
  <Tab title="代理軟體設直連（推薦）">
    在代理軟體裡給 API易 加一條直連規則，其他流量照常走代理，AI 程式設計工具不受影響。

    Clash / Clash Verge / mihomo 的配置檔案裡，在 `rules` 最前面加：

    ```yaml theme={null}
    rules:
      - DOMAIN-SUFFIX,apiyi.com,DIRECT
      # ……原有規則
    ```

    v2rayN 等客戶端：在「路由設定」裡把 `apiyi.com` 加進直連（direct）列表。

    <Note>
      開著 **TUN 模式 / 全域性模式**時，代理會接管電腦上所有程式的流量，程式碼裡怎麼設定都繞不開，只能用這種規則直連。
    </Note>
  </Tab>

  <Tab title="程式繞開代理">
    如果代理只是「系統代理」或環境變數代理（沒開 TUN），也可以讓程式自己不走代理：

    ```bash theme={null}
    # 執行程式前設定，API易 的域名不走代理
    # macOS / Linux
    export NO_PROXY="api.apiyi.com,.apiyi.com"
    # Windows PowerShell
    $env:NO_PROXY="api.apiyi.com,.apiyi.com"
    ```

    * **Python `requests` / `httpx`**：會自動讀取系統代理，設 `trust_env=False` 即可關閉，寫法見 [指令碼報 502 但呼叫日誌裡查不到？](/zh-Hant/faq/proxy-empty-502)
    * **Node.js**：原生 `fetch` 預設不讀系統代理；如果你用了 `HTTPS_PROXY` 配合 `ProxyAgent`、`global-agent` 之類的庫，請把 `api.apiyi.com` 排除在外；`axios` 可以在請求裡傳 `proxy: false`
  </Tab>

  <Tab title="一定要走代理">
    只有自建節點才能改服務端配置。把節點的空閒超時調到 600 秒以上（Xray / V2Ray 是 `policy.levels.<等級>.connIdle`）。用的是別人的節點就改不了，還是建議設直連。
  </Tab>
</Tabs>

## 部署到伺服器後還會遇到嗎？

**一般不會。** 伺服器上通常不裝代理，直連 API易，就不存在「代理掐斷空閒連線」這一層。這也是生產環境推薦的部署方式：國內雲伺服器直接訪問 `api.apiyi.com` 即可。

不過，伺服器和 API易 之間如果還有別的中間層，它們同樣有空閒超時，部署時順手檢查一下：

| 中間層 | 常見預設值 | 說明 |
| - | - | - |
| 雲廠商 NAT 閘道 / 負載均衡 | Azure 預設 4 分鐘；AWS NAT 閘道 350 秒 | 伺服器沒有公網 IP、經 NAT 出網時才涉及，多數可在控制台調大 |
| 自建 Nginx 反向代理 | `proxy_read_timeout` 預設 60 秒 | 在你的服務和 API易 之間加了一層 Nginx 時，必須調大，見 [如何避免介面超時？](/zh-Hant/faq/timeout-configuration) |
| 伺服器上也裝了代理 | 取決於代理配置 | 與本地開發是同一個問題，同樣設直連 |

單張出圖通常在 60\~200 秒內完成，低於雲廠商 NAT 的預設值。只有在你自己加了反向代理，或者伺服器也走代理時，才需要特別處理。

## 常見疑問

<AccordionGroup>
  <Accordion title="開啟 TCP keepalive 能解決嗎？">
    對雲廠商的 NAT 閘道有用：keepalive 探測包能讓 NAT 認為連線還活著。對代理軟體基本無效：代理按「有沒有實際資料」判斷空閒，keepalive 探測包不算資料。本地開發遇到的這種斷開，還是要靠直連解決。
  </Accordion>

  <Accordion title="為什麼網頁版控制台和 AI 程式設計工具都正常？">
    它們的請求要麼很快就返回，要麼是流式輸出、一直有資料在傳，連線從來不會空閒 90 秒以上。只有出圖這種「幾分鐘沒有資料、最後一次性返回」的請求才會撞上。
  </Accordion>

  <Accordion title="和「指令碼報空 502」是同一個問題嗎？">
    都是本機代理造成的，但現象不同。[空 502 那篇](/zh-Hant/faq/proxy-empty-502) 是代理自己生成了一個沒有正文的 502；本篇是連線在等圖期間被直接掐斷，程式收到的是連線中斷。兩種情況的解決方法相同：讓 API易 的請求不走代理。
  </Accordion>

  <Accordion title="被斷開的請求扣的費能退嗎？">
    這類斷開發生在你和 API易 之間的代理上，API易 側出圖已經完成並計費。如果金額較大，請把時間段（註明時區，如 16:30\~17:00 (UTC+8)）和使用者名稱發給客服，我們會幫你核對呼叫日誌。
  </Accordion>

  <Accordion title="有沒有不需要長時間等待的呼叫方式？">
    目前出圖介面是同步返回的，沒有任務 ID 查詢，詳見 [圖片生成有非同步介面嗎？](/zh-Hant/faq/image-async-api)。設直連後，長時間等待本身不是問題。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="指令碼報 502 但呼叫日誌裡查不到？" icon="unplug" href="/zh-Hant/faq/proxy-empty-502">
    本機代理自造的空 502，指令碼繞開系統代理即可
  </Card>

  <Card title="使用 API 介面需要代理網路嗎？" icon="wifi" href="/zh-Hant/faq/network-proxy">
    國內可直連，不需要代理或 VPN
  </Card>

  <Card title="如何避免介面超時？" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    timeout 設定與逐層排查
  </Card>

  <Card title="圖片生成有非同步介面嗎？" icon="clock" href="/zh-Hant/faq/image-async-api">
    同步返回的原因與客戶側非同步包裝
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.