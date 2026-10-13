> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# http 和 HTTP/1.1 是一回事嗎？

> http/https 管加不加密，HTTP/1.1 和 HTTP/2 管連線怎麼收發請求，兩者不是一回事。終端使用者預設用 https://api.apiyi.com 即可。

## 簡短回答

**不是一回事。** `http://` 和 `https://` 決定的是**傳輸加不加密**；HTTP/1.1 和 HTTP/2 是**協議版本**，決定一條連線上怎麼收發請求。兩者可以任意組合。

絕大多數使用者直接使用下面這個地址即可，什麼都不用改：

```text theme={null}
https://api.apiyi.com
```

## 兩個維度，別混在一起

| 維度 | 決定什麼 | 取值 |
| - | - | - |
| `http://` 還是 `https://` | 傳輸是否加密（有沒有 TLS） | 明文 / 加密 |
| HTTP/1.1 還是 HTTP/2 | 一條連線上怎麼收發請求 | HTTP/1.1：一條連線同一時間只跑一個請求，併發多少就開多少條連線<br />HTTP/2：一條連線同時跑很多個請求（多路複用） |

實際用哪個協議版本，是**客戶端和服務端在建立連線時協商出來的**，不由網址的寫法決定。API易 的 `https://` 入口同時支援 HTTP/1.1 和 HTTP/2，客戶端支援哪個就用哪個。

所以常聽到的「http 就是 HTTP/1.1，https 就是 HTTP/2」是一種誤解：

* 訪問 `http://` 地址時，主流客戶端確實基本都走 HTTP/1.1，但這只是結果上碰巧成立
* 訪問 `https://` 地址時，有的客戶端走 HTTP/1.1，有的走 HTTP/2，取決於客戶端本身

## 常見客戶端預設走哪個版本（https 下）

| 客戶端 | 預設版本 |
| - | - |
| Python `requests`、`httpx`、OpenAI Python SDK | HTTP/1.1 |
| Node.js `axios` | HTTP/1.1 |
| Node.js 內建 `fetch`、OpenAI Node SDK | Node 25 及更早：HTTP/1.1；**Node 26 起預設會協商 HTTP/2** |
| Go 標準庫 `net/http`（new-api、one-api 等閘道多用 Go 編寫） | HTTP/2 |
| Java `HttpClient`、OkHttp | HTTP/2 |
| curl、瀏覽器 | HTTP/2 |

想確認自己實際走的是哪個版本，可以用 curl 看一眼：

```bash theme={null}
curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
# 輸出 2 表示 HTTP/2，1.1 表示 HTTP/1.1
```

## 我該用哪個地址

<Steps>
  <Step title="終端使用者：用 https，不用改">
    直接呼叫 API 的個人和企業使用者，預設使用 `https://api.apiyi.com`。Python、Node 等常用 SDK 本來就適配良好，不需要調整協議。
  </Step>

  <Step title="Go / Java 客戶端 + 高併發大圖上傳：保持 https，只在客戶端關 HTTP/2">
    HTTP/2 會把大量併發請求放在同一條連線上。上傳幾 MB 的圖片時，這條連線一旦抖動，所有請求會一起變慢。如果你用的是預設走 HTTP/2 的客戶端、同時有高併發的出圖或圖片編輯業務，可以讓客戶端改走 HTTP/1.1。**地址仍然用 https，不需要換成 http。**
  </Step>

  <Step title="http://api.apiyi.com:16888：只作為備用">
    這是正式提供的明文介面，只建議在 HTTPS 握手本身出問題時臨時使用（例如 [Python 報 SSLEOFError、curl 卻正常](/zh-Hant/faq/openssl-pq-handshake-eof)），或者在可信內網、專線環境中使用。
  </Step>
</Steps>

<Warning>
  `http://` 不加密，API Key、提示詞和圖片都會以明文走完公網鏈路，途經的任何網路裝置都能看到。不要把明文介面作為生產環境的長期方案。
</Warning>

### Go 客戶端如何改走 HTTP/1.1

不改程式碼的辦法：給程序加一個環境變數，適合 new-api、one-api 這類現成的閘道程式：

```bash theme={null}
GODEBUG=http2client=0
```

自己寫程式碼時，把 `Transport.TLSNextProto` 設成一個非 nil 的空 map：

```go theme={null}
import (
    "crypto/tls"
    "net/http"
)

tr := &http.Transport{
    // 非 nil 的空 map 表示不啟用 HTTP/2，https 請求改走 HTTP/1.1
    TLSNextProto:        map[string]func(string, *tls.Conn) http.RoundTripper{},
    MaxIdleConnsPerHost: 100,
}
client := &http.Client{Transport: tr}
```

## 常見誤解

<AccordionGroup>
  <Accordion title="換成 http:// 會更快嗎？">
    對 Python、Node 這類本來就走 HTTP/1.1 的客戶端來說，換成 http 只省掉一次 TLS 握手（零點幾秒）。相比圖片生成動輒幾十秒的耗時，這點差距可以忽略，卻要付出明文傳輸的代價。
  </Accordion>

  <Accordion title="想關掉 HTTP/2，必須換成 http:// 嗎？">
    不需要。HTTP/2 是在客戶端裡關的，見上面的 Go 示例；其他語言也都有類似的開關。關掉之後繼續用 `https://api.apiyi.com`，既走 HTTP/1.1，又保持加密。
  </Accordion>

  <Accordion title="HTTP/2 是不是就不好？">
    不是。對於瀏覽器、普通文本對話這類請求小、數量多的場景，HTTP/2 複用連線反而更省資源。只有「高併發 + 大請求體或大響應體」疊加時，多路複用的單條連線才可能成為瓶頸。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Base URL 怎麼填？](/zh-Hant/faq/base-url-config)
* [圖片 API 延遲如何最佳化？](/zh-Hant/faq/image-api-network-latency-optimization)
* [Python 報 SSLEOFError、curl 卻正常？](/zh-Hant/faq/openssl-pq-handshake-eof)
* [指令碼報 502 但呼叫日誌裡查不到？](/zh-Hant/faq/proxy-empty-502)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.