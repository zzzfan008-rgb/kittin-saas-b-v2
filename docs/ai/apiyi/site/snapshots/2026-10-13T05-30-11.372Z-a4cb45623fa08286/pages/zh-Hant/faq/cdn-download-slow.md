> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 下載 CDN 圖片/影片很慢或超時怎麼辦？

> 出圖介面已成功，下載圖片/影片 URL 卻很慢或 Read timed out？本文給出自助排查命令（含 Windows）、下載程式碼加固寫法，以及提交給我們的資訊清單。

## 簡短回答

API易 生成的圖片與影片（如 Veo 3.1、Sora、Nano Banana、gpt-image-2-vip 等模型的產物）多數以 URL 形式返回，託管在 Cloudflare 等全球 CDN 上。下載慢或超時，常見原因有兩類：

* **你的伺服器到 CDN 的網路鏈路**：中國大陸伺服器訪問海外 CDN 時，容易受跨境頻寬、運營商路由、本地 DNS 解析影響
* **圖片儲存側**：CDN 背後的儲存節點偶發變慢時，所有線路都可能受影響

兩類問題在你的程式裡看到的報錯幾乎一樣，單靠一臺機器的測試很難區分。**請按下面的步驟自助測一遍，把結果發給我們**，我們對照儲存側狀態一起判斷，比來回溝通省時間得多。

<Info>
  **重點提示**

  Cloudflare R2 的資源 URL 通常形如 `*.r2.cloudflarestorage.com` 或通過 Cloudflare 代理的自定義域名。是否能快速下載，取決於你的伺服器能否高效訪問到最近的 Cloudflare 邊緣節點。
</Info>

## 介面成功了，圖片卻下載不下來？

一次出圖分兩段：

1. 你的程式呼叫 API易 介面，生成圖片，返回圖片 URL
2. 你的程式再去這個 URL 下載圖片

第 2 段由你的伺服器**直接連線圖片儲存地址，不經過 API易 閘道**。所以會出現：

* API易 日誌裡這條請求顯示**成功並已計費** —— 圖片確實已經生成好了
* 你的程式報 `Read timed out`、`Connection reset` 之類的錯誤，報錯裡的 host 是**圖片域名**，而不是 `api.apiyi.com`
* `Read timed out` 表示連線已經建立，但之後長時間收不到資料。它不等於「連不上」，也不能單憑它判斷問題出在哪一側

<Tip>
  **URL 有效期內可以重複下載**（如 gpt-image-2-vip 為 48 小時），下載失敗**不需要重新出圖**，重試下載即可。程式碼寫法見下文「方案二」。
</Tip>

<Warning>
  **檢查你的告警文案**：介面呼叫失敗時報 `api.apiyi.com`，下載圖片失敗時報圖片域名，並註明「出圖已成功」。兩者混在一起，很容易把下載問題誤判成介面故障。
</Warning>

## 常見原因分析

<CardGroup cols={2}>
  <Card title="跨境網路擁塞" icon="network">
    中國大陸伺服器訪問海外 CDN 時，國際出口頻寬在高峰期容易擁塞，導致下載緩慢甚至間歇性超時。
  </Card>

  <Card title="運營商路由繞行" icon="route">
    部分雲廠商或機房的國際路由會繞行美西、歐洲，實際鏈路延遲遠高於直連節點。
  </Card>

  <Card title="DNS 解析異常" icon="globe">
    本地 DNS 可能把 Cloudflare 域名解析到較遠的邊緣節點（如美西），而非就近的亞太節點。
  </Card>

  <Card title="防火牆/安全組限制" icon="shield">
    部分伺服器對境外 IP 段、443 埠或特定 CDN 域名存在出站限制，會降低連線品質。
  </Card>

  <Card title="HTTP/2 與連線複用" icon="plug">
    下載端未啟用 HTTP/2 或未複用 TCP 連線，每個檔案單獨建連會顯著放大延遲。
  </Card>

  <Card title="單執行緒序列下載" icon="gauge">
    大檔案或多檔案使用單執行緒序列下載，無法利用 CDN 的多路複用優勢。
  </Card>
</CardGroup>

## 排查步驟

<Steps>
  <Step title="拿到出口 IP 和 CDN 節點">
    圖片域名走 Cloudflare 時，訪問它的 `/cdn-cgi/trace` 路徑，一條命令就能看到你的出口 IP 和被分配的節點。Linux / macOS / Windows cmd 通用：

    ```bash theme={null}
    curl -s -m 30 https://<圖片域名>/cdn-cgi/trace
    ```

    重點看 `ip=`（出口 IP）、`colo=`（節點程式碼，如 HKG、SIN、LAX、FRA）、`loc=`（所在地區）三行。

    * **30 秒沒有任何輸出**：你的伺服器連這個域名本身就不通，重點看第 4、5 步
    * **秒出結果**：連線正常，問題在傳輸階段，繼續第 3 步分段計時
  </Step>

  <Step title="對照：本機與伺服器各測一次">
    在本地電腦和伺服器上分別下載**同一個圖片 URL**（命令見第 3 步）。

    * **本機快、伺服器慢**：多半是伺服器鏈路問題，但也可能是儲存側只對部分線路異常，兩邊結果都發給我們
    * **所有環境都慢**：大機率是儲存側問題，直接聯絡我們並附上 URL
  </Step>

  <Step title="測試到 CDN 的基礎網路">
    使用 `ping`、`mtr`、`traceroute` 等工具測試到 CDN 域名的延遲與丟包：

    ```bash theme={null}
    # Linux / macOS：測試延遲與路由
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    ```bash theme={null}
    # Windows cmd
    tracert -d -w 1000 <cdn-host>
    ```

    想確認伺服器到 Cloudflare 網路的整體吞吐，可以下載一份 5MB 的測試資料：
    `curl -o /dev/null -m 60 -w "total=%{time_total} speed=%{speed_download}\n" "https://speed.cloudflare.com/__down?bytes=5000000"`
    （Windows 把 `/dev/null` 換成 `NUL`）。它也慢，說明是伺服器整體出網問題；它快、只有圖片 URL 慢，就把結果發給我們。

    如果出現大量丟包、延遲超過 200ms 或路由繞行境外，說明底層鏈路存在問題。
  </Step>

  <Step title="測試實際下載速度">
    使用 `curl` 檢視下載耗時與吞吐：

    <Tabs>
      <Tab title="Linux / macOS">
        ```bash theme={null}
        curl -4 -o /dev/null -m 60 -w "dns:%{time_namelookup} connect:%{time_connect} \
        tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total} \
        size:%{size_download} speed:%{speed_download} ip:%{remote_ip}\n" \
        "<CDN URL>"
        ```
      </Tab>

      <Tab title="Windows cmd">
        ```bash theme={null}
        curl -4 -o NUL -m 60 -w "dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} size=%{size_download} speed=%{speed_download} ip=%{remote_ip}\n" "<CDN URL>"
        ```

        直接貼上到 cmd 視窗執行即可；寫進 .bat 檔案時要把 `%` 改成 `%%`。Windows 10 及以上自帶 curl，Windows Server 2012 R2 等老系統需要自行安裝。
      </Tab>
    </Tabs>

    `-m 60` 表示最多等 60 秒就退出並列印計時，不會一直卡住。把 `-4` 換成 `-6` 再測一次：如果只有其中一種協議卡住，可以讓程式固定走正常的那一種。

    重點關注：

    * `time_namelookup`：DNS 解析耗時
    * `time_connect`：TCP 建連耗時
    * `time_appconnect`：TLS 握手完成時間，為 0 說明握手沒成功
    * `time_starttransfer`：首位元組耗時（TTFB）
    * `size_download`：實際收到的位元組數，為 0 或很小說明連上了但傳輸卡住
    * `speed_download`：平均下載速率（位元組/秒）
  </Step>

  <Step title="檢查 DNS 解析結果">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    檢視解析出的 IP 是否就近（亞太使用者應解析到亞太節點）。若解析到遠端，可嘗試更換公共 DNS。
  </Step>

  <Step title="檢查伺服器自身">
    「之前正常、今天突然不行」通常是伺服器側有變化，逐項確認：

    * 雲廠商控制台：流量包是否用完、是否被限速、賬戶是否欠費
    * 頻寬是否被其它程序佔滿（Windows：工作管理員 → 效能 → 乙太網路；Linux：`iftop`、`nload`）
    * 安全組、防火牆是否放行 443 埠和境外 IP 段，最近是否改過出站規則
    * 程式是否走了失效的代理：檢查 `HTTP_PROXY` / `HTTPS_PROXY` 環境變數，Windows 另查 `netsh winhttp show proxy`
  </Step>
</Steps>

## 解決方案

### 方案一：更換公共 DNS（最簡單）

國內伺服器預設 DNS 經常把 Cloudflare 解析到較遠節點，建議改為以下公共 DNS：

```bash theme={null}
{/* /etc/resolv.conf */}
nameserver 1.1.1.1        # Cloudflare
nameserver 8.8.8.8        # Google
nameserver 223.5.5.5      # 阿里 DNS
nameserver 119.29.29.29   # 騰訊 DNS
```

<Tip>
  優先使用 `1.1.1.1` —— 它是 Cloudflare 自家的 DNS，能解析到最近的 Cloudflare 邊緣節點，對 R2 / Cloudflare CDN 友好度最高。
</Tip>

### 方案二：最佳化下載方式

<CardGroup cols={2}>
  <Card title="併發下載" icon="layers">
    多檔案場景使用併發下載（如 `aria2c -x 8`、Python `asyncio + httpx`），充分利用頻寬。
  </Card>

  <Card title="短超時 + 重試" icon="refresh-cw">
    連線超時和讀取超時分開設，讀取超時 30 秒左右，失敗後重試 3\~4 次。卡住的連線換一條往往就通了，比干等 120 秒有效。
  </Card>

  <Card title="連線複用" icon="plug">
    使用支援 HTTP/2 或 keep-alive 的客戶端（如 `httpx`、`requests.Session()`），避免頻繁建連。
  </Card>

  <Card title="流式落盤" icon="hard-drive">
    下載時流式寫入磁碟，避免把整個影片讀入記憶體導致 OOM 或卡頓。
  </Card>
</CardGroup>

**Python 示例（推薦）**：

不要寫成 `timeout=120` 單次下載。那樣一旦連線卡住，要白等 120 秒，而且下載失敗後整個出圖任務都判失敗，已生成、已計費的圖片就浪費了。

```python theme={null}
import time
import httpx

# 連線 10 秒；讀取 30 秒 = 多久沒收到資料就放棄（不是總時長）
TIMEOUT = httpx.Timeout(connect=10, read=30, write=30, pool=10)

def download(url: str, path: str, attempts: int = 4) -> str:
    for i in range(attempts):
        try:
            with httpx.stream("GET", url, timeout=TIMEOUT, follow_redirects=True) as resp:
                resp.raise_for_status()
                with open(path, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=256 * 1024):
                        f.write(chunk)
            return path
        except httpx.HTTPError as e:
            print(f"下載失敗（第 {i + 1} 次）：{e!r}")
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"圖片已生成，但下載多次失敗：{url}")

download("<CDN URL>", "output.png")
```

**aria2c 示例（命令列）**：

```bash theme={null}
aria2c -x 8 -s 8 -k 1M --file-allocation=none "<CDN URL>"
```

### 方案三：更換伺服器所在區域

如果你的應用場景允許，優先選擇**網路品質更好的機房**來訪問海外 CDN：

<CardGroup cols={2}>
  <Card title="海外伺服器（推薦）" icon="globe">
    AWS / GCP / Azure / Cloudflare Workers 等海外機房訪問 Cloudflare R2 延遲極低，通常僅 10-50ms。
  </Card>

  <Card title="中國大陸：三網最佳化機房" icon="server">
    如果必須在中國大陸部署，選擇帶三網 BGP + 國際最佳化鏈路（CN2 GIA、CMI、AS9929 等）的機房，延遲與穩定性更好。
  </Card>

  <Card title="中國香港/新加坡" icon="network">
    作為折中方案，港新機房對大陸延遲低（30-80ms），對 Cloudflare 亞太節點也很友好。
  </Card>

  <Card title="避免低價 VPS" icon="triangle-alert">
    部分低價機房國際出口擁塞嚴重，高峰期下載速度可能降到幾十 KB/s，不建議用於對 CDN 下載有要求的業務。
  </Card>
</CardGroup>

### 方案四：中轉落盤（終極方案）

如果你的伺服器訪問 Cloudflare CDN 確實非常慢，且無法更換機房，可以考慮：

1. **使用海外伺服器做中轉**：在海外機房先把 CDN 資源下載到本地，再通過內部專線/國際最佳化鏈路回傳到你的伺服器
2. **物件儲存中轉**：把資源先同步到你自己的 OSS / COS / S3（如阿里雲 OSS 境內 Bucket），後續業務從境內物件儲存讀取
3. **CDN 預熱回源**：在業務側先下載一次並快取，後續請求走本地快取

<Warning>
  **及時性提醒**

  API易 的圖片/影片 CDN URL 通常有一定的有效期（具體以返回的 URL 為準）。建議業務收到回撥後**儘快下載並持久化**到自己的儲存，避免過期後資源失效。
</Warning>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼本地電腦下載很快，伺服器卻很慢？">
    本地電腦走家庭寬頻，雲伺服器走機房國際出口，兩者的鏈路品質可能差異很大，這是最常見的原因。

    但它**不是唯一原因**：圖片儲存側的節點偶發異常時，也可能隻影響部分線路，表現同樣是「本機快、伺服器慢」。所以請不要只憑這一點下結論，按排查步驟測完後把結果發給我們，我們對照儲存側狀態一起判斷。
  </Accordion>

  <Accordion title="報錯寫著「無法連線 api.apiyi.com」，詳情裡的 host 卻是圖片域名？">
    這通常是程式自己拼接的提示文案，真正失敗的是**下載圖片**這一步，出圖介面已經成功。以詳情裡的 host 為準，並建議把兩類錯誤的文案分開。
  </Accordion>

  <Accordion title="更換 DNS 後為什麼還是慢？">
    DNS 隻影響解析到哪個 CDN 節點，如果底層國際頻寬本身就擁塞，換 DNS 也無法根本解決問題。此時建議考慮換機房、走中轉方案，或使用海外伺服器做下載代理。
  </Accordion>

  <Accordion title="Cloudflare R2 在中國大陸是不是被限制了？">
    Cloudflare 的服務在中國大陸沒有被封鎖，但國際出口頻寬在高峰期容易擁塞，且部分運營商路由不理想，導致訪問速度不穩定。這是跨境網路的普遍情況，並非 R2 本身的問題。
  </Accordion>

  <Accordion title="影片檔案很大，下載老是中斷怎麼辦？">
    建議使用支援**斷點續傳**的下載工具（如 `aria2c`、`wget -c`），並設定合理的超時和重試次數。示例：

    ```bash theme={null}
    aria2c -x 8 -s 8 -c --max-tries=10 --retry-wait=3 "<CDN URL>"
    ```
  </Accordion>

  <Accordion title="可以讓 API易 直接返回 Base64 而不是 CDN 連結嗎？">
    影片檔案體積大（幾十 MB 到幾百 MB），Base64 會額外膨脹約 33%，並且無法斷點續傳，反而更慢、更佔頻寬。**不建議** 將大檔案轉 Base64。對於圖片等小檔案，部分介面支援返回 Base64，具體請檢視對應 API 文件。
  </Accordion>

  <Accordion title="如何驗證瓶頸確實在網路鏈路而非 CDN？">
    在海外伺服器（如 AWS 東京、新加坡）上測試同一個 CDN URL 的下載速度。如果海外很快、你的伺服器很慢，基本可以確定是你所在伺服器到 Cloudflare 的鏈路問題，而非 CDN 本身。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="網路代理配置" icon="network" href="/zh-Hant/faq/network-proxy">
    如果國際網路不穩定，參考代理配置方案
  </Card>

  <Card title="API易伺服器在哪裡？" icon="server" href="/zh-Hant/faq/server-location">
    瞭解 API易 API 伺服器位置與網路延遲情況
  </Card>

  <Card title="Veo 影片生成 API" icon="video" href="/api-capabilities/veo/overview">
    檢視影片生成介面的輸出格式與有效期說明
  </Card>

  <Card title="聯絡客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    如果以上方案都無效，歡迎聯絡客服協助排查
  </Card>
</CardGroup>

<Info>
  **提交診斷資訊**

  自助排查後仍無法解決，請把以下資訊發給我們，一次發全能省掉來回溝通：

  * 失敗的圖片 URL，以及對應的出圖時間（或請求 ID）
  * `/cdn-cgi/trace` 的完整輸出（本機和伺服器各一份）
  * `curl` 分段計時的輸出（`-4` 和 `-6` 各一次）
  * `tracert` / `mtr` 的輸出，以及 5MB 測試資料的下載結果
  * 伺服器所在的雲廠商與地域
  * 開始異常的大致時間，請註明時區，如 `21:23 (UTC+8)`

  發截圖前請先遮住螢幕上的 API Key。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.