> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片 API 連線中斷排查

> connection reset by peer、write_response_body_failed、SSL EOF 這類報錯的排查方法。平臺返回 500 write_response_body_failed 不計費；含 macOS / Linux 伺服器分別要查什麼、Node.js undici 三個超時、以及本地代理判別矩陣。

<Warning>
  ### 先說計費：`write_response_body_failed` 這類 500 **不收費**

  閘道返回 `500` + `write_response_body_failed` / `connection reset by peer` 時，平臺側**已經自動內部重試了 2-3 次**，全部失敗才把錯誤拋給你。**這種情況不產生任何費用。**

  所以哪怕你在日誌裡看到一連串這樣的報錯，**賬單上不會有對應扣費**——不用擔心「失敗了還被收錢」。會計費的是另一種情況（客戶端自己提前斷開），詳見下面的「計費影響」一節。
</Warning>

<Info>
  **一句話結論**：圖片 API 的響應體動輒十幾到幾十 MB，斷點幾乎總在**下載響應資料**這一程（**不是**請求體太大——純文生圖同樣會中斷）。排查時先看後臺日誌屬於哪一類，再按 macOS / Linux / Node.js 分別自查。
</Info>

## 報錯長什麼樣

同一個根因，在閘道側和客戶端側會呈現成兩副完全不同的面孔。

### 閘道側返回

```json theme={null}
{
  "status_code": 500,
  "error": {
    "message": "write tcp 10.0.0.1:443->203.0.113.5:52310: write: connection reset by peer",
    "type": "shell_api_error",
    "code": "write_response_body_failed"
  }
}
```

### 客戶端側丟擲

| 語言 / 庫                        | 典型異常                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Python `requests` / `urllib3` | `SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol'))`、`ChunkedEncodingError`、`ConnectionResetError` |
| Python `httpx`                | `RemoteProtocolError`、`ReadError`                                                                                 |
| Node.js（undici / 內建 fetch）    | `UND_ERR_CONNECT_TIMEOUT`、`UND_ERR_HEADERS_TIMEOUT`、`UND_ERR_BODY_TIMEOUT`、`SocketError: other side closed`       |
| Node.js（其它棧）                  | `read ECONNRESET`、`ERR_STREAM_PREMATURE_CLOSE`、`socket hang up`                                                   |
| Go                            | `unexpected EOF`、`http2: server sent GOAWAY`                                                                      |
| curl                          | `curl: (56) Recv failure`、`curl: (18) transfer closed with outstanding read data remaining`                       |

<Tip>
  **Node.js 的報錯要分清「掐」和「關」**：`ECONNRESET` 表示收到了 TCP RST，是連線被中間裝置**掐斷**，指向網路路徑上的某一跳；`SocketError: other side closed` / `ERR_STREAM_PREMATURE_CLOSE` 表示對端**優雅關閉**（FIN），指向服務端收尾問題（如少發了 chunked 終止塊）。兩者方向完全不同，不要混為一談。

  另外 `UND_ERR_*` 只可能來自 undici（Node 18+ 的內建 `fetch` 底層），`read ECONNRESET` 則是 libuv 的頂層文案，`axios` / `node-fetch` / `http` 模組都會給。**如果兩類錯誤同時出現，先確認你的應用裡是不是有兩條不同的 HTTP 路徑**——那樣的話它們根本不是同一件事。
</Tip>

## 先判斷方向：是誰先斷的

`write_response_body_failed` 這個 code 是關鍵線索——它的含義是**閘道在向呼叫方回寫響應體的過程中失敗**，屬於**下行方向**，不是上游模型報錯。換句話說，結果已經生成出來了，正往你這邊推的時候連線斷了。

<Info>
  **這不是「請求體太大」造成的。** 圖片編輯要上傳參考圖，容易讓人誤以為是上傳體積的問題；但**純文生圖（請求體只有幾百位元組）同樣會中斷**。斷點在**下載響應資料**的這一程——圖片響應動輒十幾到幾十 MB，是全鏈路上最脆弱的一段。
</Info>

<CardGroup cols={2}>
  <Card title="下行斷開" icon="arrow-down-from-line">
    `write_response_body_failed`、`connection reset by peer`、客戶端 SSL EOF。
    閘道在推 body 時連線消失。**平臺返回 500 的這一類不計費**，詳見下面的計費一節。
  </Card>

  <Card title="上游失敗（渠道側）" icon="arrow-up-from-line">
    上游超時、`upstream_error`、5xx 帶上游原始報文，或 HTTP 200 但 `finishReason` 異常。
    這類才是渠道問題，可以拿 `x-request-id` 找客服核查。
  </Card>
</CardGroup>

### 最強判據：後臺日誌裡這次是什麼狀態

在動手排查之前先看後臺呼叫日誌。這條零成本，而且比任何客戶端操作都更快縮小範圍：

| 日誌表現                                 | 含義                                 | 是否計費    | 下一步                                     |
| ------------------------------------ | ---------------------------------- | ------- | --------------------------------------- |
| **正常的計費記錄**                          | 請求到達、上游跑完、閘道認為已交付完成                | 計費      | 走下面的四步自證，重點查應用層誤讀與客戶端提前斷開               |
| **500 `write_response_body_failed`** | 閘道向你回寫響應體失敗，且平臺已**內部重試 2-3 次**仍未成功 | **不計費** | 屬於下行鏈路問題，帶 request-id 找客服               |
| **完全沒有記錄**                           | 請求**壓根沒發出去**                       | 不計費     | 建連階段，跳到下面的「Node.js 三個超時」與「本地代理 / VPN」兩節 |

<Warning>
  由此可以推出一條經常被搞反的結論：**`UND_ERR_CONNECT_TIMEOUT` 這類建連階段的失敗不可能產生計費**，因為請求根本沒到閘道。所以如果你看到「大量 connect timeout」同時又「被扣了很多次費」，**這兩件事一定不是同一批請求**，必須分開排查，不要用一個根因去解釋全部現象。
</Warning>

### 四步自證

按這個順序做，絕大多數情況在前兩步就能定位：

<Steps>
  <Step title="先排除應用層誤讀：你可能收到了但沒存住">
    「沒收到圖」往往是**程式碼拋異常後被 catch 成「請求失敗」**的結論，而不是真的沒收到位元組。最常見的一種：`gpt-image-2-all` 預設返回 `b64_json` 且**不帶 `data:` 字首**，程式碼若按 `data[0].url` 取值會拿到 `undefined`，後續處理直接拋錯 → 被判定為失敗 → 觸發重試 → **重複計費**。

    現象與網路故障一模一樣，但根本不需要任何網路故障。先列印一行自查：

    ```javascript theme={null}
    console.log(Object.keys(resp.data[0]), resp.data[0].b64_json?.length);
    ```

    各系列的欄位與字首差異見 [base64 字首差異對照](/zh-Hant/api-capabilities/image-api-best-practices#字首差異對照)。
  </Step>

  <Step title="看是不是「所有渠道 / 所有模型一起報」">
    同一時間窗內，如果你在測的**兩個不同渠道、不同模型都在報同一個錯**，那幾乎可以直接排除渠道特異性——上游不會這麼整齊地同時出問題。
  </Step>

  <Step title="查客戶端的執行時：TLS 棧（Python）或 undici 超時（Node.js）">
    Python 看 TLS 棧版本，Node.js 看 undici 的三個超時——見下面兩節。這是實測中最高頻的根因，且完全在你本地，一條命令就能確認。
  </Step>

  <Step title="降併發 / 改序列 / 關掉本地代理再跑一遍">
    把併發降到 1-2、並關掉 VPN 或代理重跑同樣的請求。如果這樣完全不復現，問題在客戶端的連線管理、本地資源（連線池、檔案描述符、記憶體）或網路路徑，而不是渠道。
  </Step>
</Steps>

## 頭號元兇：客戶端 TLS 棧（macOS 尤其高發）

**macOS 系統自帶的 Python（`/usr/bin/python3`）連結的是 LibreSSL 2.8.3**，而不是 OpenSSL。這個組合在配合 urllib3 v2 做**併發大響應體下載**時會穩定丟擲 `SSLEOFError`，表現為客戶端單方面斷連——於是閘道側記錄下一片 `connection reset by peer`。

### 一條命令自查

```bash theme={null}
python3 -c "import ssl; print(ssl.OPENSSL_VERSION)"
```

| 輸出                   | 判斷                         |
| -------------------- | -------------------------- |
| `LibreSSL 2.8.3`     | ⚠️ **高危**，併發大響應體場景下會假報連線錯誤 |
| `OpenSSL 1.1.1x` 及以上 | ✅ 正常                       |

匯入 `requests` 時如果看到這行告警，同樣是中招訊號：

```
NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+,
currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'
```

### 修復：換一個直譯器

不要去降級 urllib3，直接換用帶正常 OpenSSL 的 Python：

```bash theme={null}
# macOS：用 Homebrew 的 Python 建虛擬環境
brew install python@3.13
python3.13 -m venv venv
venv/bin/pip install requests pillow
venv/bin/python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # 應輸出 OpenSSL 3.x
```

### 實測對照（2026-07-29，UTC+8）

在 Nano Banana 系列（`gemini-3-pro-image` / `gemini-3.1-flash-image`）上做雙渠道對比測試時的真實資料：

| 直譯器                                | 場景                                       | 傳輸層異常率                           |
| ---------------------------------- | ---------------------------------------- | -------------------------------- |
| 系統 python3.9（LibreSSL 2.8.3）       | 併發 12 跑圖                                 | **大面積報錯，兩個渠道同時出現**               |
| Homebrew python3.13（OpenSSL 3.6.1） | 同樣的 108 次呼叫                              | 3 次（2.8%），均為 4K 大響應體，**重試一次即成功** |
| Homebrew python3.13（OpenSSL 3.6.1） | 80 次專項復現（含併發 24 小響應體、併發 12 的 4K、以及序列 4K） | **0 次**                          |

結論很清楚：**換直譯器前後差了一個數量級**，且換之前兩個渠道同時報錯這一點本身就說明與渠道無關。

## Linux 伺服器要查什麼（和 macOS 完全不是一回事）

<Info>
  上一節的 TLS 棧自查在 Linux 上**基本都會通過**——各發行版自帶的 Python 鏈的都是正常 OpenSSL，不存在 LibreSSL 那個坑。**所以別在這裡停下**：伺服器環境的坑在**出網路徑**和**容器限制**上，和本機開發完全是兩套問題。
</Info>

### 1. 雲 NAT 閘道 / 負載均衡的空閒超時（伺服器上最高頻）

這是生產環境 `connection reset by peer` 的頭號來源。以 **AWS NAT Gateway** 為例：它有一個**固定 350 秒**、不可調的空閒超時，而且超時後**發的是 RST 不是 FIN**——於是客戶端拿到的正好就是 `ECONNRESET`。

坑在於它會**連鎖**：連線池裡的連線閒置超過 350 秒後集體失效，你發請求時第一條被 RST，客戶端自動重試換池裡下一條——**那條也閒置超時了，照樣 RST**。表現就是「一段時間沒呼叫，然後突然連續幾發全掛，之後又恢復正常」。

<Tip>
  這和前面 Node.js 一節講的「keep-alive 複用死連線」是同一個機制，只不過在伺服器上元兇通常是**雲廠商的 NAT 閘道**，而不是本地代理軟體。
</Tip>

修法（任選，推薦前兩個）：

* **把 TCP keepalive 調到小於 350 秒**，讓靜默期也有包在走；
* **限制連線池的空閒存活時間**，讓它主動丟棄可能已失效的連線（Node：`new Agent({ keepAliveTimeout: 60_000 })`；Python `requests` 用 `HTTPAdapter` 控制連線池）；
* 走 VPC 端點等繞開 NAT 閘道的路徑。

其它雲廠商與自建 LB 的空閒超時值各不相同，但**思路一樣：找出鏈路上最短的那個空閒超時，把 keepalive 調得比它更小**。

### 2. TCP keepalive 預設值等於沒開

Linux 的 `tcp_keepalive_time` 預設是 **7200 秒（2 小時）**，遠大於上面任何一個空閒超時，等於完全不起作用：

```bash theme={null}
# 查當前值
sysctl net.ipv4.tcp_keepalive_time net.ipv4.tcp_keepalive_intvl net.ipv4.tcp_keepalive_probes

# 臨時調整（容器裡需要 --sysctl 或特權，生產建議寫進 sysctl.d 或應用層設定 SO_KEEPALIVE）
sudo sysctl -w net.ipv4.tcp_keepalive_time=60
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=15
```

更穩妥的做法是**在應用層的 HTTP 客戶端上開 keepalive**，不依賴全域性 sysctl——容器裡改核心引數往往受限。

### 3. 容器網路的 MTU

Docker / K8s 的 overlay 網路（flannel VXLAN 等）MTU 常被設成 **1450** 而不是 1500，一旦和路徑上的 PMTUD 黑洞疊加，就是典型的「小請求全正常、大響應必掛」：

```bash theme={null}
ip link show            # 看容器網絡卡 MTU
# 用逐步增大的包長探測實際可通過的 MTU（不分片）
ping -M do -s 1400 api.apiyi.com
```

### 4. 容器記憶體上限 → 程序被 OOMKilled

4K 出圖的 base64 單條可達 20-30MB，`resp.json()` 一次性載入再疊加併發，很容易超過容器的 memory limit 被核心殺掉，**表現同樣是「連線莫名其妙斷了」**：

```bash theme={null}
# 容器是不是被 OOM 殺的
dmesg -T | grep -i -E "oom|killed process"
kubectl describe pod <pod> | grep -A3 "Last State"   # 看是否 OOMKilled
```

對策見下面的「流式讀取，別一次性載入」。

### 5. 環境變數裡的代理（伺服器上最隱蔽的一個）

伺服器上經常有全域性 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY`（寫在 `/etc/environment`、systemd unit 或 Dockerfile 裡），你自己都忘了它的存在。**更麻煩的是各語言對它的處理並不一致**：

| 客戶端                            | 是否自動讀取 `HTTPS_PROXY`                               |
| ------------------------------ | -------------------------------------------------- |
| Python `requests` / `httpx`    | ✅ 預設讀取                                             |
| curl                           | ✅ 預設讀取                                             |
| **Node.js 內建 `fetch`（undici）** | ❌ **預設不讀**，要顯式用 `ProxyAgent` / `EnvHttpProxyAgent` |

這個不一致會造成非常迷惑的現象：**同一臺機器上 curl 和 Python 走代理、Node 直連**（或反過來），兩者行為不同，排查時容易得出矛盾結論。先確認一下：

```bash theme={null}
env | grep -i -E "proxy|no_proxy"
```

API易 國內可直連，**伺服器上通常應該把 `api.apiyi.com` 加進 `NO_PROXY`**，或乾脆確認沒有代理變數。

### 伺服器側一鍵自查

```bash theme={null}
echo "--- 代理變數 ---";   env | grep -i proxy || echo "無"
echo "--- keepalive ---";  sysctl net.ipv4.tcp_keepalive_time
echo "--- MTU ---";        ip link show | grep mtu
echo "--- fd 上限 ---";     ulimit -n
echo "--- DNS 解析 ---";    getent hosts api.apiyi.com
echo "--- 連通性與耗時 ---"
curl -sS -o /dev/null -w 'connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} ip=%{remote_ip}\n' \
  https://api.apiyi.com/v1/models -H "Authorization: Bearer $KEY"
```

## Node.js：三個超時互相獨立，SDK 的 timeout 管不到

Node 18+ 的內建 `fetch` 底層是 undici，它有**三個各自獨立的超時**，分別對應請求的三個階段。「我 timeout 設了 5 分鐘」通常只調到了其中一個都不是的第四個值：

| 錯誤碼                       | 發生階段                      | undici 預設值 | 由什麼控制             | 會被計費嗎          |
| ------------------------- | ------------------------- | ---------- | ----------------- | -------------- |
| `UND_ERR_CONNECT_TIMEOUT` | 建連（TCP + TLS 握手）          | **10 秒**   | `connect.timeout` | **不會**（請求沒到閘道） |
| `UND_ERR_HEADERS_TIMEOUT` | 等首個響應頭                    | 300 秒      | `headersTimeout`  | 會              |
| `UND_ERR_BODY_TIMEOUT`    | **相鄰兩個 body chunk 之間**的間隔 | 300 秒      | `bodyTimeout`     | 會              |

<Warning>
  **openai-node 的 `timeout` 選項是基於 AbortController 的「總請求超時」，不會傳導到上面三個中的任何一個。** 你把 `timeout` 從 60 秒調到 300 秒，`connectTimeout` 依然是 10 秒。裸 `fetch()` 的 `AbortSignal.timeout()` 同理。

  這就是「明明 timeout 設得很大卻還是報超時」最常見的原因——調錯了層。
</Warning>

### 正確的配置寫法

要放寬 undici 的三個超時，必須配 `Agent`（全域性或按請求）：

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import OpenAI from "openai";

// 圖片介面是「長時間靜默 + MB 級響應體」，三個超時都要單獨放寬
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },   // 建連 30s，預設只有 10s
  headersTimeout: 300_000,        // 等首包 300s
  bodyTimeout: 300_000,           // chunk 間隔 300s
}));

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: "https://api.apiyi.com/v1",
  timeout: 300_000,   // 總超時，與上面三個是不同層，都要設
  maxRetries: 0,      // 關鍵：見下
});
```

### `maxRetries` 預設是 2，而且會自動重試連線錯誤

openai-node **預設 `maxRetries: 2`，並且連線錯誤和超時都在自動重試範圍內**。也就是說一次業務呼叫最多會產生 **3 次實際請求**（其中會不會計費，取決於每一次分別屬於下面「計費影響」的哪一類），而你的程式碼裡可能一次重試都沒寫。

圖片介面單價高、又是同步長請求，**一律顯式設 `maxRetries: 0`，把重試收到自己手裡**，配合自己的退避與次數上限。計費口徑見 [重試策略](/zh-Hant/api-capabilities/image-api-best-practices#重試策略)。

<Tip>
  排查時先確認你到底用的是什麼棧：`node -v`、`npm ls openai undici axios node-fetch`。`UND_ERR_*` 只證明底層走的是 undici，**不能證明你用的是 openai SDK**——裸 `fetch()` 同樣會拋這些錯誤碼，而裸 `fetch()` 沒有 `maxRetries` 這回事。
</Tip>

### keep-alive 複用了一條已經死掉的連線

undici 預設啟用連線池 + keep-alive。VPN、NAT、代理軟體把空閒連線靜默回收之後，客戶端並不知情，仍然從池裡取出這條連線來發下一個請求——**寫入的瞬間收到 RST，表現就是 `read ECONNRESET`**。

這是 `ECONNRESET` 在長間隔呼叫場景下最常見的來源，也能解釋「錯誤在某個時間窗內密集出現」「重試的第一發也失敗」。驗證方法是關掉複用再跑：

```javascript theme={null}
const agent = new Agent({ pipelining: 0, keepAliveTimeout: 1_000 });
// 錯誤隨之消失 ⇒ 就是死連線複用
```

## 本地代理 / VPN：圖片介面最容易暴露的一跳

<Info>
  **API易 國內可直連，不需要代理或 VPN**（見 [使用 API 介面需要代理網路嗎？](/zh-Hant/faq/network-proxy)）。所以排查時，**關掉代理直連複測是成本最低、資訊量最大的一發**。

  但要說清楚：代理只是**嫌疑最大的變數之一**，不等於根因。下面的判別矩陣才是用來定位的。
</Info>

圖片介面有兩個特徵讓它比文本介面敏感得多：**生成期有 30-60 秒零位元組流動**，以及**響應體是 MB 級的一次性突發**。普通聊天介面跑得好好的，圖片介面掛掉，往往就卡在這兩點上。

<CardGroup cols={2}>
  <Card title="fake-ip / 分流規則不命中" icon="route-off">
    代理軟體的 fake-ip 模式下，若規則沒命中，會連到 `198.18.x.x` 這類不可路由地址，表現是**精確 10 秒**的 connect timeout。注意這不是「建連慢」，是**根本沒有路由**——放大 `connect.timeout` 也救不回來。務必記錄實際連到的 `remote_ip`。
  </Card>

  <Card title="生成期被當成空閒連接回收" icon="timer-off">
    請求發出後有 30-60 秒零位元組流動，代理按空閒連線策略回收。特徵是**失敗時刻是 30 / 60 / 120 這類圓整值**，且與圖片大小無關。
  </Card>

  <Card title="MTU / PMTUD 黑洞" icon="package-x">
    隧道 MTU 小於路徑 MTU，而 ICMP「需要分片」被丟棄導致 PMTUD 失效。典型表現是**小請求全正常、大響應必掛**，已收位元組停在幾 KB 到幾十 KB 就不動了。把隧道 MTU 降到 1400 左右常能解決。
  </Card>

  <Card title="MITM 解密 + 全量緩衝" icon="shield-off">
    開了 HTTPS 解密的代理常對大 body 做整體緩衝，可能撞上體積上限；也可能把 chunked 重寫成 `Content-Length` 而長度算錯，直接 RST。同樣只打圖片這種 MB 級響應，不打文本呼叫。
  </Card>
</CardGroup>

### 判別矩陣

這是本節的核心。判別軸只有兩條：**失敗發生在首位元組之前還是之後**、**已經收到了多少位元組**。

| 觀測項                        | 建連超時            | 代理空閒回收     | MTU 黑洞          | 服務端缺 chunked 終止塊                                       |
| -------------------------- | --------------- | ---------- | --------------- | ------------------------------------------------------ |
| TTFB（首位元組）                 | 永遠沒有            | 永遠沒有       | 有               | **正常**（與生成耗時一致）                                        |
| 已收位元組數                     | 0               | 0          | **0 \< N ≪ 全量** | **= 全量，JSON 可完整解析**                                    |
| 失敗時刻                       | **≈10.0 秒，極穩定** | 圓整值，與圖大小無關 | 不定              | last-byte 之後 **+300 秒被斷開**；也可能**無限期掛住**（實測等 330 秒仍無變化） |
| 連線終態                       | ConnectTimeout  | RST        | 掛死或 RST         | FIN（優雅關閉）；也可能**既無終止塊也無 FIN，連線一直開著**                    |
| 是否計費                       | **否**（沒到閘道）     | 見「計費影響」一節  | 見「計費影響」一節       | 見「計費影響」一節                                              |
| 換 `response_format: "url"` | 仍失敗             | 仍失敗        | **變正常**         | **變正常**                                                |

最後一行是價效比最高的一發：把響應體從數 MB 壓到 1KB 左右，**如果 URL 模式穩定成功而 base64 模式穩定失敗，就說明問題與傳輸體量相關**，可以直接排掉建連和空閒回收兩列。

<Info>
  最右邊那一列（**服務端缺 chunked 終止塊**）近期出現了新的形態：**既不發終止塊、也不關連線，無限期掛住**，不再是過去那種「+300 秒後被優雅關閉」。兩種形態的共同點是**資料已經完整、圖片可以直接用**，處理方式也一樣 —— 在客戶端主動收尾，詳見[請求收尾卡住](/zh-Hant/api-capabilities/image-tail-stall)。
</Info>

### 一條命令看清時間剖面

```bash theme={null}
curl -sS -o /tmp/out.json --trace-time \
  -w '\nconnect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} code=%{http_code} ip=%{remote_ip}\n' \
  -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"model":"gpt-image-2-all","prompt":"a red cube on a white table"}' \
  https://api.apiyi.com/v1/images/generations
```

讀法對著上面的矩陣：`connect` 沒值 → 建連階段；`ttfb` 沒值且 `total` 是圓整數 → 空閒回收；`bytes` 是全量但 `total ≈ ttfb + 300` 並報 `curl: (18)` → 服務端沒發終止塊；`bytes` 卡在幾十 KB → MTU。

<Warning>
  **做代理開 / 關的 A/B 對比時必須交替執行，不能分塊。** 先連跑 5 次代理、再連跑 5 次直連，這種順序分組會被**時間窗性質的故障**汙染出完全錯誤的結論——實測中確實遇到過某段時間全掛、隔幾分鐘全好、再過一會兒又復發的情況。正確做法是 `代理 → 直連 → 代理 → 直連` 交替，並記錄每次的 `remote_ip`。
</Warning>

## 其它常見誘因

<CardGroup cols={2}>
  <Card title="中途手動中斷" icon="octagon-x">
    除錯時 Ctrl+C、重啟程序、熱過載、kill 掉正在跑的指令碼——所有正在傳輸的大響應體都會在閘道側留下一條 `write_response_body_failed`。這是最容易被誤讀成「渠道不穩」的假警報。
  </Card>

  <Card title="外層超時先到" icon="timer-off">
    任務佇列 worker 超時、Serverless 函式執行上限、閘道/CDN 的回源超時（預設普遍 60 秒）。任何一層小於生成時間都會先掐斷連線，詳見[必讀&最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices#超時與斷連排查)。
  </Card>

  <Card title="連線池與併發過高" icon="waypoints">
    連線池上限、本地檔案描述符上限、NAT / 防火牆對長連線的靜默回收。大響應體持續時間長，撞上這些限制的機率遠高於文本介面。
  </Card>

  <Card title="記憶體扛不住響應體" icon="memory-stick">
    4K 出圖的 base64 單條可達 20-30MB，一次性 `resp.json()` 全量載入再加併發，容器記憶體打滿會導致程序被 OOM 殺掉，表現同樣是「連線莫名斷開」。
  </Card>
</CardGroup>

## 計費影響：哪些斷連收費，哪些不收費

這兩種情況經常被混為一談，但計費結果完全相反：

<Info>
  ### 平臺返回 500 `write_response_body_failed` —— **不計費**

  這個錯誤表示閘道在向你回寫圖片資料時連線斷了。**平臺側會自動內部重試 2-3 次**，重試全部失敗之後才把 500 拋給你。

  **這種情況不產生任何費用。** 所以即使你在日誌裡看到一連串這樣的報錯、而且是同一個請求反覆失敗，**賬單上不會有對應的扣費**，不用擔心「失敗了還被收錢」。
</Info>

<Warning>
  ### 客戶端自己提前走開 —— **照常計費**

  另一種情況是閘道正常完成了交付，是**你這邊先斷的**：客戶端 timeout 到點主動斷開、除錯時 Ctrl+C、程序被重啟或被 OOM 殺掉。

  這類請求服務端與上游的生成**已經完成**，**照常計費**——「我沒拿到圖」不等於「沒花錢」。所以排查期間反覆重試大圖請求，這部分賬單是實打實在走的。
</Warning>

區分方法就是上面那張表：**看後臺日誌記的是正常呼叫還是 500 `write_response_body_failed`**。

重試策略也要相應剋制：傳輸層異常值得重試，但**每次重試都可能是一次新的計費**（取決於它屬於上面哪一類）。不要寫無上限的重試迴圈。

## 正確的重試寫法

關鍵原則：**只對傳輸層異常重試，不對 HTTP 層錯誤重試**。4xx 重發一萬次也還是 4xx，而且浪費時間。

```python theme={null}
import time
import requests

TRANSPORT_ERRORS = (
    requests.exceptions.SSLError,
    requests.exceptions.ConnectionError,
    requests.exceptions.ChunkedEncodingError,
    requests.exceptions.ReadTimeout,
)

def call_image_api(url, headers, body, timeout=360, retries=2):
    """傳輸層異常最多重試 retries 次；HTTP 4xx/5xx 一律不重試，直接交給上層判斷。

    注意：每次重試都可能是一次新的計費請求，retries 不要設大。
    """
    attempts = []
    for i in range(retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=body,
                                 stream=True, timeout=(10, timeout))
            raw = b"".join(resp.iter_content(chunk_size=8192))
            attempts.append({"attempt": i + 1, "status": resp.status_code})
            return resp.status_code, raw, attempts      # 含 4xx/5xx，交上層處理
        except TRANSPORT_ERRORS as e:
            attempts.append({"attempt": i + 1, "error": repr(e)})
            if i == retries:
                raise
            time.sleep(2 + 3 * i)                       # 2s、5s 退避
```

<Tip>
  **把每次嘗試單獨記下來**（上面的 `attempts`）。否則客戶端重試成功後，日誌裡只剩一條漂亮的 200，你會永遠看不到底層到底斷了多少次——排查渠道品質時這份資料是關鍵，也能避免把自己的重試誤讀成渠道行為。
</Tip>

### 流式讀取，別一次性載入

大響應體建議用 `stream=True` 逐塊讀取，既能降低記憶體峰值，也能在出問題時看清**是在傳輸的哪個階段斷的**：

```python theme={null}
resp = requests.post(url, headers=headers, json=body, stream=True, timeout=(10, 360))
chunks, total = [], 0
for chunk in resp.iter_content(chunk_size=8192):
    total += len(chunk)
    chunks.append(chunk)
raw = b"".join(chunks)
# total 遠小於 Content-Length ⇒ 傳到一半斷了
# total 完整但連線不關 ⇒ 上游缺 chunked 終止塊，屬於渠道問題
```

後一種情況**不要重試**：資料已經完整，圖片可以直接用。客戶端主動收尾的完整寫法見[請求收尾卡住](/zh-Hant/api-capabilities/image-tail-stall)。

## 什麼時候才該找客服

自證走完之後，如果滿足下面**任一條**，就帶著材料找客服核查：

* 換了正常 OpenSSL 的直譯器、併發降到序列，**仍然穩定復現**；
* 只有**某一個特定渠道 / 模型**在報，其它渠道同時段正常；
* 響應體**已經完整收到**（位元組數對得上 `Content-Length`）但連線遲遲不關閉，直到超時——這是上游缺 chunked 終止塊，屬於渠道側問題。**先按[請求收尾卡住](/zh-Hant/api-capabilities/image-tail-stall)加一層主動收尾把圖取出來**，仍有問題再提工單；
* 報錯是明確的上游方向（`upstream_error`、上游 5xx 原文）。

提工單時附上：`x-request-id`、呼叫時間（**帶時區**，如 `2026-07-29 14:32 (UTC+8)`）、模型名、`imageSize` 等關鍵引數、客戶端異常原文、以及你已經做過的自證步驟。

## 相關文件

<CardGroup cols={3}>
  <Card title="請求收尾卡住" icon="hourglass" href="/zh-Hant/api-capabilities/image-tail-stall">
    圖已傳完但連線不結束時，在客戶端主動收尾的相容寫法
  </Card>

  <Card title="必讀&最佳實踐" icon="book-check" href="/zh-Hant/api-capabilities/image-api-best-practices">
    同步呼叫、timeout 分檔配置、base64 處理、斷連計費口徑
  </Card>

  <Card title="自實現非同步佇列" icon="list-checks" href="/zh-Hant/api-capabilities/image-async-queue">
    把同步呼叫包進任務佇列，用重試與落庫消化偶發斷連
  </Card>

  <Card title="需要代理網路嗎？" icon="wifi" href="/zh-Hant/faq/network-proxy">
    API易 國內直連、無需代理；證書與 DNS 類問題的自查方法
  </Card>

  <Card title="Gemini 圖片錯誤處理" icon="triangle-alert" href="/zh-Hant/api-capabilities/gemini-image-error-handling">
    Gemini 系出圖的錯誤碼與 finishReason 處理
  </Card>

  <Card title="錯誤資訊留存" icon="clipboard-list" href="/zh-Hant/api-manual/error-reporting">
    怎麼把上面這些報錯完整列印下來，以及提工單該帶哪些欄位
  </Card>
</CardGroup>
