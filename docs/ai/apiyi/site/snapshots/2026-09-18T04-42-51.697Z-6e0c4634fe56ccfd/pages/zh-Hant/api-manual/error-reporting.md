> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 介面錯誤資訊留存指南

> API易 的錯誤只在介面響應體裡返回一次，後臺日誌只記成功計費的呼叫。本頁講為什麼必須自己列印原始錯誤、Python / Node.js / cURL 的正確捕獲寫法、ComfyUI 等封裝工具怎麼拿到原文、必須留存的 7 個欄位，以及可直接複製的報障資訊模板。

<Warning>
  ### 先說結論：錯誤原文只在響應體裡出現一次

  API易 的錯誤資訊**只通過介面響應體返回給你**。後臺日誌是**計費賬本**——它記錄的是成功產生扣費的呼叫，報錯請求既不扣費、也不會出現在日誌裡。

  所以「後臺日誌裡查不到」並不等於「沒發生」，而是意味著**那次錯誤的唯一記錄就在你的客戶端**。你沒把它列印下來、落到盤上，它就永久消失了——連我們也找不回來。
</Warning>

<Info>
  **一句話結論**：把介面返回的**原始響應體**原樣打出來，不要只留你程式包裝過的那一句話。`400 Bad Request` 這種字串對定位問題的貢獻接近於零，真正的答案在它下面被丟掉的那個 JSON 裡。
</Info>

## 一個真實案例：400 Bad Request 說明不了任何問題

一位客戶上報的原文只有一行：

```text theme={null}
apiyi GPT Image 2 2k: 400 Bad Request from POST https://api.apiyi.com/v1/images/edits
```

這行字串是**客戶端框架包裝後的產物**。它保留了模型名、HTTP 方法、URL 和狀態碼，唯獨把最關鍵的**響應體丟掉了**。支援側能給出的最好回答只能是：

> 400 一般是內容安全和引數問題，大機率是內容安全。

這是**猜測**，不是結論。因為同一次呼叫，介面真正返回的響應體可能是下面三種中的任意一種，而它們對應三種完全不同的處理動作：

| 響應體裡的 `error.message`                            | 真實原因                                       | 你該做什麼                                                                               |
| ------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `Your request was rejected by the safety system` | 上游內容稽核攔截                                   | 改提示詞或換參考圖。**不要重試**，重試一樣會被攔；見[內容安全](/zh-Hant/faq/content-safety)                     |
| `Invalid value for 'size': expected one of ...`  | 引數列舉值寫錯                                    | 程式碼級 bug，改引數即可，重試毫無意義                                                               |
| `invalid_image_file` / `Invalid input image`     | 參考圖檔案本身不合法（例如部分安卓手機拍出的 `.jpg` 實為 MPO 多幀格式） | 用 Pillow 之類重編碼一次再傳；見[圖片 API 必讀](/zh-Hant/api-capabilities/image-api-best-practices) |

<Warning>
  **同一個 400，三種完全不同的處理動作。** 丟掉響應體，就是把「三選一」變成「靠猜」——猜錯的代價是一輪無效的來回溝通，外加一次本來可以避免的重試。

  更要緊的是：**這三種情況裡有兩種根本不該重試**。分不清是哪一種，就只能盲目重試，白白消耗時間和額度。
</Warning>

## 後臺日誌能查到什麼，查不到什麼

這是最需要先建立的認知：**後臺日誌是計費賬本，不是錯誤日誌。**

| 你想查的資訊        | 後臺[日誌頁面](https://api.apiyi.com/log) | 介面響應                  |
| ------------- | ----------------------------------- | --------------------- |
| 本次呼叫的計費金額     | 有                                   | 無（`usage` 只給 token 數） |
| token 用量      | 有                                   | 有（`usage` 欄位）         |
| 模型名、呼叫時間      | 有（僅成功呼叫）                            | 需要你自己記                |
| `request_id`  | 有（僅成功呼叫）                            | 響應頭 `x-request-id`    |
| **錯誤碼與錯誤原文**  | **沒有**                              | **唯一來源**              |
| **上游拒絕的具體理由** | **沒有**                              | **唯一來源**              |
| 失敗的呼叫本身       | **不出現**（沒扣費就不入賬本）                   | —                     |

<Tip>
  **反過來用，這是排查斷連類問題最有力的判據**：如果日誌裡**有**這條計費記錄，說明請求確實到達了上游併產生了消耗；如果**沒有**，那問題多半發生在到達上游之前（網路、鑑權、引數校驗）。完整口徑見[怎麼看懂日誌裡的計費金額](/zh-Hant/faq/log-billing-explained)。
</Tip>

## 必須留存的 7 個欄位

排查一次報錯需要的資訊就這些。缺任何一項都會讓排查退化成猜測：

| 欄位                     | 怎麼拿                                      | 缺了它會怎樣                                                        |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **HTTP 狀態碼**           | `resp.status_code` / `err.status`        | 分不清是請求被拒（4xx）、服務端異常（5xx）還是壓根沒建連（無狀態碼）                         |
| **響應體全文**              | `resp.text` / `await resp.text()`        | **最致命的一項**——錯誤的真正原因全在這裡，丟了就只能猜                                |
| **`x-request-id` 響應頭** | `resp.headers.get("x-request-id")`       | 客服無法精確定位到那一次呼叫，只能按時間段模糊查                                      |
| **呼叫時間（帶時區）**          | 客戶端自己打，格式如 `2026-08-03 15:44 (UTC+8)`    | 我們的客戶遍佈全球，不寫時區的時間點無法對齊日誌                                      |
| **模型名 + 端點路徑**         | 你自己的請求引數                                 | 同一個模型走不同端點（`/v1/images/edits` 與 `/v1/chat/completions`）行為並不相同 |
| **關鍵請求引數**             | `size`、`quality`、參考圖張數與體積、`max_tokens` 等 | 引數類問題無法復現；圖片類問題無法判斷是不是素材本身的問題                                 |
| **客戶端異常原文 + 已重試次數**    | `repr(e)`，以及每次嘗試單獨記一條                    | 客戶端重試成功後日志裡只剩一條漂亮的 200，你會永遠看不到底層到底斷了多少次                       |

<Note>
  **響應體不要截斷。** 常規業務日誌裡截斷到 200 字元是合理的，但排障場景下錯誤詳情經常出現在末尾。至少保留前 2000 字元；圖片類介面若擔心 base64 刷屏，只在 `status_code >= 400` 時全量列印即可——錯誤響應體本來就不長。
</Note>

## 正確的錯誤捕獲寫法

核心原則只有一條：**分兩層捕獲，並且在任何一層都不要丟棄原始資訊。**

* **傳輸層異常**：連線被重置、TLS 握手失敗、超時、DNS 失敗。此時**根本沒有 HTTP 響應**，能留的只有異常原文。
* **HTTP 層錯誤**：服務端返回了 4xx / 5xx。此時**一定有響應體**，必須讀出來。

### Python / requests

```python theme={null}
import time
import requests

BASE_URL = "https://api.apiyi.com/v1"
API_KEY = "sk-your-api-key"          # 生產環境請從環境變數讀取


def call_and_log(path, payload, timeout=300):
    started = time.strftime("%Y-%m-%d %H:%M:%S %z")      # 帶時區
    try:
        resp = requests.post(
            f"{BASE_URL}{path}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=payload,
            timeout=timeout,
        )
    except requests.exceptions.Timeout as exc:
        # 傳輸層：超時，沒有 HTTP 響應可讀
        raise RuntimeError(f"[{started}] 請求超時 {timeout}s：{exc!r}") from exc
    except requests.exceptions.RequestException as exc:
        # 傳輸層：連線重置、SSL 錯誤、DNS 失敗……同樣沒有響應體
        raise RuntimeError(f"[{started}] 傳輸層失敗：{exc!r}") from exc

    if resp.status_code >= 400:
        # 關鍵：響應體原樣帶出，不要在這裡改寫成自己的措辭
        raise RuntimeError(
            f"[{started}] HTTP {resp.status_code} {path} "
            f"model={payload.get('model')}\n"
            f"x-request-id: {resp.headers.get('x-request-id')}\n"
            f"{resp.text}"
        )
    return resp.json()
```

<Warning>
  **不要在讀響應體之前就 `raise_for_status()`。** 它丟擲的 `HTTPError` 只帶一句 `400 Client Error: Bad Request for url: ...`，正文原封不動地留在 `resp.text` 裡沒人去讀——這正是本頁開頭那個案例的成因之一。要用它，也請先把 `resp.text` 取出來。
</Warning>

### Python / OpenAI SDK

官方 SDK 已經把三樣東西都掛在異常物件上了，只是很多人只 `print` 了一句自己的中文提示：

```python theme={null}
from openai import OpenAI, APIStatusError, APIConnectionError

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,      # SDK 內建指數退避，針對 429 / 5xx / 連線錯誤
    timeout=60.0,
)

try:
    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Hello"}],
    )
except APIStatusError as e:
    # 服務端返回了 4xx/5xx：狀態碼、request-id、響應體三樣都在這裡
    print("HTTP 狀態碼 :", e.status_code)
    print("request-id  :", e.request_id)
    print("響應體原文  :", e.response.text)
    raise
except APIConnectionError as e:
    # 沒拿到 HTTP 響應：連線被重置、超時、本地代理故障
    print("傳輸層失敗  :", repr(e), "|", repr(e.__cause__))
    raise
```

<Tip>
  即便只寫一行，也請寫 `print(f"API 錯誤：{e}")` 而不是 `print("呼叫失敗")`——SDK 異常的 `str(e)` 裡**已經包含服務端返回的 message**。真正會丟資訊的是把異常物件整個扔掉的那種寫法。
</Tip>

### Node.js

用 SDK 時：

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

try {
  const resp = await client.images.edit({ /* ... */ });
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    // 服務端返回了 4xx/5xx
    console.error('HTTP 狀態碼 :', err.status);
    console.error('request-id  :', err.requestID);
    console.error('響應體原文  :', JSON.stringify(err.error));
  } else {
    // 傳輸層：ECONNRESET、UND_ERR_* 等，此時沒有 HTTP 響應
    console.error('傳輸層失敗  :', err.code, err.message, err.cause);
  }
  throw err;
}
```

直接用 `fetch` 時，**這一步是最容易出事的地方**：

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
  method: 'POST',
  headers: { Authorization: 'Bearer sk-your-api-key' },
  body: form,
});

if (!resp.ok) {
  const raw = await resp.text();        // 必須先讀 body，再拋錯
  throw new Error(
    `HTTP ${resp.status} ${resp.url}\n` +
    `x-request-id: ${resp.headers.get('x-request-id')}\n${raw}`
  );
}
```

<Warning>
  本頁開頭那個 `400 Bad Request from POST https://api.apiyi.com/v1/images/edits`，字面上就等於 `${resp.status} ${resp.statusText} from ${resp.method} ${resp.url}` ——**響應體從頭到尾沒有被讀取過**。

  `fetch` 在 HTTP 層面出錯時**不會 reject**，`resp.ok` 為 `false` 而已；如果這時直接拋 `resp.statusText`，body 就隨著響應物件一起被丟棄了。**在拋錯之前先 `await resp.text()`**，這一行的差別就是能不能定位問題。
</Warning>

### cURL 復現

請客戶復現時，給這條命令最省事——它把狀態碼、響應頭、響應體、耗時一次性全帶出來：

```bash theme={null}
curl -i -sS -X POST https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "image=@input.png" \
  -F "prompt=把背景換成純白" \
  -w '\n---\nHTTP %{http_code}  耗時 %{time_total}s\n'
```

* `-i` 列印響應頭，`x-request-id` 就在裡面；
* `-sS` 關掉進度條但保留錯誤輸出；
* `-w` 在末尾附加狀態碼與總耗時，方便和超時配置對照。

## 封裝工具與自研中臺怎麼辦

### 一個正面例子

下面這條報錯來自某位客戶的 ComfyUI 節點：

```text theme={null}
上游 HTTP 0：OpenSSL SSL_read: Connection was reset, errno 10054
```

它比 `400 Bad Request` 難看得多，但**資訊是完整的**，幾秒鐘就能定死方向：

| 片段                               | 含義                                                               |
| -------------------------------- | ---------------------------------------------------------------- |
| `HTTP 0`                         | 根本沒拿到 HTTP 響應。`0` 是偽狀態碼，代表連響應行都沒讀到，不是 400/500 那種業務錯誤             |
| `SSL_read: Connection was reset` | 在 TLS 讀階段連線被對端或中間裝置掐斷                                            |
| `errno 10054`                    | Windows 的 `WSAECONNRESET`，等價於 Linux 的 `ECONNRESET`，表示收到了 TCP RST |

結論直接就出來了：這是**傳輸層**問題，與內容安全、與引數統統無關，也不會產生計費（請求根本沒完成）。排查路徑見[圖片 API 連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops)。

<Info>
  **對比一下**：一個是包裝得很乾淨但什麼也說明不了的 `400 Bad Request`，一個是又長又醜但直接指向根因的 `errno 10054`。**排障場景下，原始、難看、完整的錯誤遠勝於友好、簡潔、被改寫過的錯誤。**
</Info>

### 常見工具去哪裡找原文

| 工具                     | 原始錯誤在哪                                                         |
| ---------------------- | -------------------------------------------------------------- |
| ComfyUI                | 節點上的紅字通常是截斷版；完整堆疊在**啟動 ComfyUI 的那個終端視窗**，或安裝目錄下的 `comfyui.log` |
| Dify / Coze / n8n      | 工作流執行記錄裡展開該節點的「執行詳情 / 輸出」，看原始 HTTP 響應而不是節點的錯誤摘要                |
| LangChain / LlamaIndex | 捕獲 `openai.APIStatusError` 而不是籠統的 `Exception`，參見上面的 SDK 寫法     |
| 各類桌面客戶端                | 開啟設定裡的除錯 / 開發者日誌開關，或用 `curl` 復現一次                              |

### 自研中臺的三條原則

<Steps>
  <Step title="透傳，不要改寫">
    中間層可以**追加**上下文（哪個業務、哪個租戶、第幾次重試），但不能**替換**上游返回的 `error.message`。一旦改寫，原文就沒有第二個地方可以找回。
  </Step>

  <Step title="面向使用者的提示和麵向開發的原文分開存">
    參考 [Gemini 圖片錯誤處理](/zh-Hant/api-capabilities/gemini-image-error-handling) 裡的三分結構：`userMessage`（給終端使用者看的友好文案）、`devMessage`（給開發看的判定結論）、`rawResponse`（原始響應體，一字不改）。前兩個可以隨便潤色，第三個必須原樣入庫。
  </Step>

  <Step title="永遠不要出現「未知錯誤」">
    走到兜底分支時，把 `status`、`x-request-id` 和響應體前 2000 字元一併記下來。一個帶著原文的「未分類錯誤」是可排查的；一句乾淨的「未知錯誤」不是。
  </Step>
</Steps>

## 反面清單：這些寫法會讓問題無法排查

* `except Exception as e: print("呼叫失敗")` —— 異常物件整個被丟掉，連是哪一層的問題都不知道；
* 只記 HTTP 狀態碼，不記響應體 —— 就是本頁開頭那個案例；
* `raise_for_status()` 之前不讀 `resp.text` —— 正文還在記憶體裡，就是沒人取；
* `fetch` 裡 `if (!resp.ok) throw new Error(resp.statusText)` —— body 隨響應物件一起被扔了；
* 客戶端重試成功後只留一條漂亮的 200 —— **把每次嘗試單獨記一條**，否則你永遠看不到底層斷了多少次，還容易把自己的重試誤讀成渠道行為；
* 日誌只打屏不落盤、或按天覆蓋 —— 等客戶反饋到你這裡時，原始記錄往往已經滾沒了；
* 報障時只發一張手機拍的螢幕照片 —— 請直接複製**文本**，截圖裡的錯誤經常正好被裁掉半行。

## 什麼時候找客服

先自己走完上面的留存與判讀，如果滿足下面**任一條**，就帶著材料找客服核查：

* 拿到了完整響應體，但 `error.message` 指向上游方向（`upstream_error`、上游 5xx 原文、渠道明確報錯）；
* 同一份請求引數**換個模型或換個時間段就正常**，只有某個特定模型穩定失敗；
* 報錯是 `500` + `write_response_body_failed` 這類下行鏈路問題，且**穩定復現**（這類不計費，排查方法見[連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops)）；
* 你懷疑計費與實際呼叫對不上——這時 `request_id` 是唯一能精確對賬的錨點。

### 報障資訊模板（可直接複製）

```text theme={null}
【問題描述】呼叫 gpt-image-2 圖片編輯介面穩定返回 400
【介面端點】POST https://api.apiyi.com/v1/images/edits
【模型名稱】gpt-image-2
【呼叫時間】2026-08-03 15:44 (UTC+8)
【request-id】從響應頭 x-request-id 複製
【HTTP 狀態碼】400
【響應體原文】
{"error":{"message":"...","type":"...","code":"..."}}
【關鍵引數】size=2048x2048, quality=high, 參考圖 1 張 / 3.2 MB / PNG
【復現情況】連續 5 次呼叫 5 次失敗；換一張參考圖後恢復正常
【已排查】Key 有效、餘額充足、同一個 Key 呼叫文本模型正常
```

<Card title="企業微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  掃碼新增，或點選本卡片聯絡企業微信客服。

  也可通過 Telegram `@apiyi001` 或郵箱 `hi@apiyi.com` 聯絡我們。
</Card>

<Tip>
  把上面模板裡的內容**以文本形式**發過來，比任何描述都高效。有 `request_id` 時我們能直接定位到那一次呼叫的完整鏈路，不必再問「大概幾點呼叫的什麼模型」。`request_id` 的查詢方法見[如何檢視我的呼叫記錄](/zh-Hant/faq/call-logs)。
</Tip>

## 相關文件

<CardGroup cols={3}>
  <Card title="API 手冊" icon="book" href="/zh-Hant/api-manual">
    常見錯誤碼對照表、認證方式與速率限制
  </Card>

  <Card title="連線中斷排查" icon="unplug" href="/zh-Hant/api-capabilities/image-connection-drops">
    `ECONNRESET`、`errno 10054`、SSL EOF 這類傳輸層報錯的完整排查路徑
  </Card>

  <Card title="檢視呼叫記錄" icon="file-text" href="/zh-Hant/faq/call-logs">
    在控制台日誌頁查每次呼叫，`request_id` 怎麼找、怎麼對賬
  </Card>

  <Card title="看懂日誌計費金額" icon="receipt" href="/zh-Hant/faq/log-billing-explained">
    為什麼失敗呼叫不進日誌，以及「有無計費記錄」這條判據怎麼用
  </Card>

  <Card title="超時怎麼配置" icon="hourglass" href="/zh-Hant/faq/timeout-configuration">
    各類模型的 timeout 分檔、已調大仍超時的逐層排查
  </Card>

  <Card title="圖片 API 必讀" icon="book-check" href="/zh-Hant/api-capabilities/image-api-best-practices">
    同步呼叫、base64 字首差異、`400 invalid_image_file` 的圖片預處理
  </Card>
</CardGroup>
