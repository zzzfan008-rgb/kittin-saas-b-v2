> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Python 報 SSLEOFError、curl 卻正常？

> OpenSSL 3.5 及以上版本預設啟用後量子金鑰交換，握手包變大後會被部分網路裝置掐斷，導致 UNEXPECTED_EOF_WHILE_READING

## 症狀

同一臺機器上，`curl` 呼叫 `api.apiyi.com` 一切正常，但 Python 程式（尤其是 Conda 環境）報錯：

```text theme={null}
ssl.SSLEOFError: [SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol (_ssl.c:1016)
urllib3.exceptions.MaxRetryError: HTTPSConnectionPool(host='api.apiyi.com', port=443): Max retries exceeded
```

有時表現為 443 埠連線超時、握手階段就斷開。沒有連 VPN，換個網路環境（比如手機熱點）又能通。

## 簡短回答

**這不是 API易 服務端的問題，也不是證書問題，而是你的 OpenSSL 版本與所在網路的中間裝置不相容。**

先對比兩邊的 OpenSSL 版本：

```bash theme={null}
curl --version | head -1          # 例如 OpenSSL/3.0.2
python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # 例如 OpenSSL 3.6.2
```

如果報錯的那一邊是 **OpenSSL 3.5 或更新版本**，而正常的那一邊低於 3.5，基本就是這個原因。

## 原因

OpenSSL 從 3.5 開始，TLS 握手預設帶上後量子金鑰交換（X25519MLKEM768）。這會讓握手的第一個包（ClientHello）從約 300 位元組漲到約 1500 位元組，超過一個 TCP 報文段的大小，必須拆成兩段傳送。

部分企業防火牆、TLS 檢測裝置和運營商側的深度包檢測裝置處理不了被拆開的握手包，或者不認識這個新的金鑰交換演算法，會直接把連線斷開。客戶端看到的就是「EOF occurred in violation of protocol」。

API易 的所有邊緣節點都支援這種後量子握手，2026-09-11 (UTC+8) 我們用 OpenSSL 3.6.4 逐臺驗證過，全部通過。握手包是在你的網路裡被丟棄的，服務端收不到，所以服務端無法替你修復。

## 三條命令自證

用**報錯的那個環境**裡的 `openssl`（Conda 環境請先啟用）依次執行：

```bash theme={null}
# 1. 預設引數，帶後量子金鑰交換
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com </dev/null | grep -E "Negotiated|Verify"

# 2. 只用 X25519，不帶後量子金鑰交換
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com -groups X25519 </dev/null | grep Verify

# 3. 對任意其他 HTTPS 站點做預設握手
openssl s_client -connect www.baidu.com:443 -servername www.baidu.com </dev/null | grep Verify
```

| 結果        | 判斷                                                 |
| --------- | -------------------------------------------------- |
| 1 失敗、2 成功 | 確認是大握手包被你的網路掐斷，按下面的方法在客戶端修復                        |
| 1、3 都失敗   | 你的網路對所有後量子握手都不通，同樣在客戶端修復                           |
| 1、2、3 都成功 | 不是這個問題，請把完整報錯和 `pip show urllib3 requests` 的輸出發給客服 |

## 修復方法（任選其一）

<Steps>
  <Step title="方法一：用配置檔案關閉後量子金鑰交換（推薦）">
    新建一個檔案，例如 `~/no-pq.cnf`：

    ```ini theme={null}
    openssl_conf = openssl_init
    [openssl_init]
    ssl_conf = ssl_sect
    [ssl_sect]
    system_default = system_default_sect
    [system_default_sect]
    Groups = X25519:P-256:P-384
    ```

    執行程式前設定環境變數：

    ```bash theme={null}
    export OPENSSL_CONF=~/no-pq.cnf
    python your_script.py
    ```

    這會讓該環境裡所有基於 OpenSSL 的程式（Python、curl、pip 等）都不再發送後量子金鑰份額，握手包縮回約 300 位元組。不影響加密強度，只是回到 3.5 之前的預設行為。
  </Step>

  <Step title="方法二：降級 Conda 裡的 OpenSSL">
    ```bash theme={null}
    conda install "openssl<3.5"
    ```

    3.5 之前的版本預設不帶後量子金鑰交換。注意這會連帶調整依賴它的包，生產環境請先在測試環境驗證。
  </Step>

  <Step title="方法三：讓網路部門升級中間裝置">
    主流防火牆和 TLS 檢測裝置在 2025 年之後的韌體版本都已支援混合後量子握手。這是根治辦法，也能避免以後訪問其他站點時出現同樣的問題。
  </Step>
</Steps>

## 常見追問

<AccordionGroup>
  <Accordion title="為什麼瀏覽器能開啟 api.apiyi.com，程式卻不行？">
    瀏覽器和你的程式走的可能不是同一條網路路徑（比如瀏覽器配置了系統代理），而且瀏覽器在握手失敗時會自動重試不帶後量子份額的握手，程式不會。
  </Accordion>

  <Accordion title="Node.js、Go、Java 會遇到這個問題嗎？">
    只要 TLS 庫是 OpenSSL 3.5 或更新版本就可能遇到，包括用新版 OpenSSL 編譯的 curl 8.x。Go 和 Java 使用自己的 TLS 實現，是否預設啟用後量子交換取決於各自的版本，判斷方法相同：用上面三條命令看是否只有預設握手失敗。
  </Accordion>

  <Accordion title="換成 IP 直連或加 verify=False 有用嗎？">
    沒用。連線在握手階段就被斷開，還沒到證書驗證這一步。關閉證書驗證既不能解決問題，還會帶來安全風險。
  </Accordion>

  <Accordion title="API易 能不能在服務端關掉後量子握手？">
    握手的第一個包是客戶端發出的，被丟在你的網路裡時服務端根本收不到，服務端配置對此無能為力。如果你按上面的三條命令測出「對其他站點預設握手成功、只對 api.apiyi.com 失敗」，請把結果發給客服，我們會進一步排查。
  </Accordion>
</AccordionGroup>

## 相關問題

<CardGroup cols={2}>
  <Card title="使用 API 介面需要代理網路嗎？" icon="wifi" href="/zh-Hant/faq/network-proxy">
    API易 支援直連，無需代理或 VPN
  </Card>

  <Card title="超時配置建議" icon="clock" href="/zh-Hant/faq/timeout-configuration">
    連線超時與讀取超時應該怎麼設
  </Card>
</CardGroup>
