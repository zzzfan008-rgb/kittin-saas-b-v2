> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片連結瀏覽器能開啟，Seedance 卻報 invalid image format？

> Seedance 的圖片素材連結在瀏覽器裡能正常開啟，提交任務卻返回 400 invalid image format。原因是連結只適合瀏覽器單次下載，不適合伺服器抓取：不支援 Range、限制下載次數、有效期太短。本頁說明怎麼自查連結，以及公網直鏈、素材 ID、Base64 三種傳法怎麼選。

## 簡短回答

原廠拿到的不是圖片，而是你那邊伺服器返回的一段報錯。瀏覽器能開啟，只能說明**瀏覽器下載一次**沒問題，不能說明**原廠伺服器抓取**也沒問題。

典型報錯如下，提交任務時直接返回 400，不會建立任務：

```text theme={null}
The parameter `content[1]` specified in the request is not valid:
invalid image format (detected format); received: "".
```

`received: ""` 表示原廠沒有從下載到的內容裡識別出任何圖片格式。

**最省事的改法**：把圖片放到普通的物件儲存或 CDN 上，用一個乾淨的公網直鏈（例如 `https://cdn.example.com/xxx.png`）。

## 一個真實案例

一位客戶的首幀圖連結長這樣：

```text theme={null}
https://<客戶域名>/api/v1/resource-download-grants/<檔案ID>/content?access_token=<帶過期時間和簽名的令牌>
```

瀏覽器裡開啟，圖片正常顯示，但提交 Seedance 任務就返回上面的 400。我們對這個連結做了測試：

| 測試                     | 結果                          |
| ---------------------- | --------------------------- |
| 普通 GET（和瀏覽器一樣）         | 200，返回 PNG 圖片               |
| 帶 `Range` 請求頭，只取檔案開頭一段 | **416**，返回的是一段 JSON 報錯，不是圖片 |
| 連續下載約 10 次之後           | **429**，`檔案下載授權次數已耗盡`       |
| 同一張圖轉成 Base64 提交       | **成功**出片                    |

最後一行說明圖片本身和請求引數都沒問題，問題只出在這個連結上。

## 為什麼會有這種連結

這不是圖片地址，而是一個**業務介面**：使用者的私有檔案存在後臺，每次需要下載時，由應用臨時簽發一個「下載授權」，裡面帶著過期時間、簽名和下載次數上限。這是保護私有檔案的常見做法：連結洩露出去也用不了多久、用不了幾次，每次下載也能記錄審計。

這種設計是給**一個人在瀏覽器裡下載一次**準備的，拿來給伺服器抓圖就會出問題：

* **不支援 Range 請求**：很多服務在抓取素材時，會先用 `Range` 頭取檔案開頭幾個位元組來判斷格式，或者分段下載。這類介面只會整份返回檔案，碰到 Range 就報錯
* **限制下載次數**：原廠抓取素材時，可能會探測、下載、失敗後重試，不一定只下載一次。次數用完後，返回的就是一段報錯 JSON
* **有效期太短**：連結過期後返回的也不是圖片

物件儲存或 CDN 上的公開直鏈（R2、S3、OSS、TOS 等）沒有這些限制：URL 直接指向靜態檔案，支援 Range，不限下載次數，也不需要額外的請求頭或 Cookie。

## 三種傳法怎麼選

| 傳法                                     | 什麼時候用              | 說明                                                                                              |
| -------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| **公網直鏈**（首選）                           | 一次性使用的圖片           | 請求體很小，由原廠伺服器直接拉取，原廠的伺服器效能和頻寬都更好。連結需要滿足下面的自查條件                                                   |
| **素材 ID** `asset://...`                | 同一張圖要反覆引用；含寫實人臉的素材 | 先入庫一次，之後每次只傳一個短字串，見 [素材優先實踐](/zh-Hant/api-capabilities/seedance2/asset-first-workflow)          |
| **Base64** `data:image/png;base64,...` | 實在拿不到合格的公網連結時兜底    | 圖片編碼後體積會增大約三分之一，全部要從你的機器上傳，提交階段明顯變慢。實測一張 2.3 MB 的 PNG 轉成 Base64 後，請求體約 3.1 MB，建立任務介面用了約 60 秒才返回 |

如果你的檔案存在自己的後臺、只能通過這種下載授權介面拿到，可以在提交前換一種方式出鏈：

* 檔案本來就在物件儲存裡（OSS、S3、R2 等）：直接生成**物件儲存的預簽名 URL**，有效期設為 1 小時以上。預簽名 URL 只按時間過期，不限下載次數，也支援 Range
* 否則先把圖片轉存到一個公開的物件儲存或 CDN，再把新連結傳給 Seedance

## 提交前自查連結

在任意一臺能上網的機器上跑下面兩條命令，把 `<URL>` 換成你的圖片連結（整個連結用單引號包起來，避免 `&` 被 shell 解析）：

```bash theme={null}
# 1. 普通下載：應為 200，Content-Type 應為 image/png、image/jpeg 等圖片型別
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'

# 2. 分段下載：應為 206（或 200 返回整份圖片），不能是 4xx
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type}\n' -H 'Range: bytes=0-1023' '<URL>'
```

同時確認這幾點：

* 兩條命令返回的都是圖片，不是 JSON 或 HTML
* 多次下載都能成功，沒有次數限制
* 不需要 Cookie、登入態或額外的請求頭
* 有效期至少覆蓋到任務提交完成，建議 1 小時以上
* 公網可直接訪問，不在內網或 IP 白名單之後

<Warning>
  限次下載的連結，自查時也會消耗下載次數。測試請用單獨簽發的連結，別把正式要用的那個連結的次數測光。
</Warning>

## 相關文件

<CardGroup cols={2}>
  <Card title="影片生成介面" icon="video" href="/zh-Hant/api-capabilities/seedance2/video-generation">
    圖片支援的三種傳法與全部請求引數
  </Card>

  <Card title="素材優先實踐" icon="gauge" href="/zh-Hant/api-capabilities/seedance2/asset-first-workflow">
    三種傳法在提交階段的耗時對比，以及入庫拿素材 ID 的步驟
  </Card>
</CardGroup>
