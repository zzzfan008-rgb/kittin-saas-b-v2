> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 下載 CDN 圖片/影片很慢怎麼辦？

> API易 的圖片與影片資源由 Cloudflare R2 全球 CDN 託管，本文幫你排查海外 CDN 在特定伺服器上下載慢的常見原因與解決方案。

## 簡短回答

API易 生成的圖片與影片（如 Veo 3.1、Sora、Nano Banana 等模型的產物）統一託管在 **Cloudflare R2 全球 CDN**，理論上全球訪問速度都很快。如果你的伺服器下載很慢，**絕大多數情況是你所在伺服器到 Cloudflare 邊緣節點的網路鏈路問題**，而不是 CDN 本身的問題 —— 尤其是中國大陸伺服器訪問海外 CDN 時，容易受到跨境頻寬、運營商路由、本地 DNS 解析等因素影響。

<Info>
  **重點提示**

  Cloudflare R2 的資源 URL 通常形如 `*.r2.cloudflarestorage.com` 或通過 Cloudflare 代理的自定義域名。是否能快速下載，取決於你的伺服器能否高效訪問到最近的 Cloudflare 邊緣節點。
</Info>

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
  <Step title="確認是單機問題還是全域性問題">
    在本地電腦 / 其他伺服器上嘗試下載同一個 CDN URL。

    * 如果本地電腦很快、伺服器慢 → **伺服器網路鏈路問題**
    * 如果所有環境都慢 → 請聯絡客服，提供具體 URL
  </Step>

  <Step title="測試到 CDN 的基礎網路">
    使用 `ping`、`mtr`、`traceroute` 等工具測試到 CDN 域名的延遲與丟包：

    ```bash theme={null}
    # 測試延遲與路由
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    如果出現大量丟包、延遲超過 200ms 或路由繞行境外，說明底層鏈路存在問題。
  </Step>

  <Step title="測試實際下載速度">
    使用 `curl` 檢視下載耗時與吞吐：

    ```bash theme={null}
    curl -o /dev/null -w "dns:%{time_namelookup} connect:%{time_connect} \
    ttfb:%{time_starttransfer} total:%{time_total} speed:%{speed_download}\n" \
    "<CDN URL>"
    ```

    重點關注：

    * `time_namelookup`：DNS 解析耗時
    * `time_connect`：TCP 建連耗時
    * `time_starttransfer`：首位元組耗時（TTFB）
    * `speed_download`：平均下載速率（位元組/秒）
  </Step>

  <Step title="檢查 DNS 解析結果">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    檢視解析出的 IP 是否就近（亞太使用者應解析到亞太節點）。若解析到遠端，可嘗試更換公共 DNS。
  </Step>

  <Step title="檢查伺服器出站限制">
    確認雲廠商的安全組、防火牆規則是否放行了 443 埠和境外 IP 段，以及是否存在頻寬限速。
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

  <Card title="斷點續傳" icon="refresh-cw">
    大影片檔案啟用 HTTP Range 分塊下載 + 失敗重試，避免單次失敗重頭下載。
  </Card>

  <Card title="連線複用" icon="plug">
    使用支援 HTTP/2 或 keep-alive 的客戶端（如 `httpx`、`requests.Session()`），避免頻繁建連。
  </Card>

  <Card title="流式落盤" icon="hard-drive">
    下載時流式寫入磁碟，避免把整個影片讀入記憶體導致 OOM 或卡頓。
  </Card>
</CardGroup>

**Python 示例（推薦）**：

```python theme={null}
import httpx
import asyncio

async def download(url: str, path: str):
    async with httpx.AsyncClient(http2=True, timeout=120) as client:
        async with client.stream("GET", url) as resp:
            resp.raise_for_status()
            with open(path, "wb") as f:
                async for chunk in resp.aiter_bytes(chunk_size=1024 * 256):
                    f.write(chunk)

asyncio.run(download("<CDN URL>", "output.mp4"))
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
    本地電腦走的是家庭寬頻（通常有運營商國際加速），而云伺服器走的是機房國際出口，兩者的國際鏈路品質差異很大。請優先檢查伺服器所在機房的國際頻寬品質，並參考上面的排查步驟。
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

  聯絡客服時，請附上以下資訊以便快速定位問題：

  * 具體的 CDN URL（可脫敏關鍵引數）
  * 伺服器所在地區與機房/雲廠商
  * `mtr` 或 `traceroute` 的完整輸出
  * `curl` 測速命令的時間統計輸出
  * 出現問題的時間段（方便核對跨境鏈路監控）
</Info>
