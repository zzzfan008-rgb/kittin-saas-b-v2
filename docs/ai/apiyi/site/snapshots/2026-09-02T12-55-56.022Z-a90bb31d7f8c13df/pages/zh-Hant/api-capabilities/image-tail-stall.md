> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 出圖請求傳完卻不返回的相容處理

> 圖片其實已經完整傳完，但連線遲遲不結束，客戶端一直等到自己超時。說明成因、判別方法，並給出在客戶端主動收尾的相容程式碼 —— 是在現有呼叫上加一層保護，不是替換呼叫方式。

<Info>
  **一句話結論**：圖片資料**是完整的**，能正常解碼出圖，卡住的只是 HTTP 傳輸的最後一個動作 ——「告訴客戶端傳完了」。所以正確的處理不是把超時調長、也不是重試，而是**在資料已經到齊時主動收尾，把圖取出來用**。
</Info>

<Warning>
  ### 這是**相容**，不是**替換**

  下面給的程式碼是在你**現有呼叫邏輯之外加一層保護**，不是讓你換一套接入方式：

  * **不需要**換端點、換模型、換 SDK，也不需要改請求引數；
  * 正常請求走的還是原來的路徑，**行為完全不變** —— 這段相容邏輯在正常請求下根本不會觸發；
  * 只有當「資料已經到齊、但連線遲遲不結束」時，它才會介入，把已經拿到的圖交給你。

  換句話說：\*\*加上它，壞的情況能救回來；不加它，壞的情況只能等到超時報錯。\*\*其餘一切照舊。
</Warning>

## 現象

呼叫原生出圖介面（`POST /v1beta/models/{model}:generateContent`）時，可能遇到這樣一組現象：

* 後臺呼叫日誌顯示請求**成功**、也**已經計費**；
* 客戶端卻一直掛著，直到自己的讀超時才報錯；
* 報錯形如 `Read timed out`、`ETIMEDOUT`、`UND_ERR_BODY_TIMEOUT`。

體感就是「後臺日誌裡 30 秒就好了，我這邊 5 分鐘都拿不到圖」。

<Warning>
  **同一套程式碼以前一直是好用的，現在會在收尾這一步卡住不放。** 這是近期新出現的場景，不是你的整合方式一直有問題 —— 所以你不需要懷疑自己的呼叫寫法，只需要按下面的方式加一層相容。
</Warning>

### 它是成時間窗發作的

這一點很重要，直接決定你怎麼復現、怎麼判斷：

* **窗內**：連續多次呼叫**全部**卡住，不分先後；
* **窗外**：幾十次連續呼叫**一次都不出現**，完全正常。

所以它既不是「必現」，也不是「小機率偶發」。如果你測的時候剛好錯開了視窗，會 100% 正常，很容易得出「已經好了」的錯誤結論。反過來，如果你正好撞進視窗，會覺得「全掛了」。**兩種體感都是真的，別用其中一次的結果去下長期結論。**

<Info>
  **流式請求**（`:streamGenerateContent`）和純文本模型一般不受影響。本頁針對的是**非流式出圖**這一類響應體很大的請求 —— 一張 2K 圖的 JSON 響應體在 13 MB 量級。
</Info>

## 成因

出圖響應用 `Transfer-Encoding: chunked` 分塊傳輸。按 HTTP/1.1 規範，服務端把最後一個數據塊發完之後，還必須再發一個**終止塊**（長度為 0 的塊），用來告訴客戶端「到此為止，傳完了」。

問題就出在這一步：**資料塊全部到齊了，終止塊卻沒有發出來，連線也沒有關閉。**

於是客戶端手裡握著一份**完整可用的 JSON**（圖片能正常 base64 解碼），但它無從知道這份資料已經收完了，只能繼續等 —— 一直等到自己的讀超時。

打個比方：**快遞已經放到你門口了，但快遞員忘了點「已送達」。** 你守在系統前等狀態更新，東西其實就在門外。

<Warning>
  鏈路在某些時間窗內沒有給響應做這個收尾動作。**服務端側的根治我們會繼續推進**，本頁給的是在此之前的**客戶端兜底方案**。

  這層兜底有它自己獨立的價值，而且**不需要等服務端修好再回滾**：有結束訊號時它永遠不會被觸發，服務端修復之後會自動靜默，零開銷、零維護負擔。
</Warning>

三個關鍵判斷，直接決定該怎麼處理：

<CardGroup cols={3}>
  <Card title="資料是完整的" icon="circle-check">
    不是丟包、不是網路品質問題、更不是傳到一半斷了。已收到的位元組能完整解析，圖片可以正常使用。
  </Card>

  <Card title="繼續等沒有意義" icon="timer-off">
    卡住之後服務端**一個位元組都不會再發**。實測持續等待 **330 秒**仍無任何變化，把超時調到幾百秒只是白白拖長故障感知時間。
  </Card>

  <Card title="不繫結某臺機器" icon="server-off">
    故障窗內多個落點**同時**出現、又**同時**恢復，所以換域名、換入口都繞不開，只能在客戶端處理。
  </Card>
</CardGroup>

## 判別方法

同時滿足下面三條，基本可以確定就是這個場景：

<Steps>
  <Step title="響應頭帶 Transfer-Encoding: chunked，且沒有 Content-Length">
    這說明響應體的長度不是預先宣告的，客戶端只能靠終止塊判斷「傳完了」。
  </Step>

  <Step title="已收到的位元組能被完整解析成 JSON">
    把已收位元組做一次 `json.loads`，能成功；並且裡面的 `inlineData.data` 做 base64 解碼後是一張完整可用的圖片。
  </Step>

  <Step title="解析成功之後，連線長時間沒有任何新位元組">
    既沒有收到終止塊，連線也沒有被關閉 —— 它就那樣一直開著。
  </Step>
</Steps>

### 與另外兩種形態的區別

三種情況報錯很像，但根因和處理方式完全不同，**不要混用同一套判據**：

| 觀測項    | 本頁場景（無限期掛住）                 | 被掐斷（`ECONNRESET`） | 收尾遲到後被斷開                |
| ------ | --------------------------- | ----------------- | ----------------------- |
| 已收位元組數 | **= 全量，JSON 可完整解析**         | 通常不足全量            | = 全量                    |
| 連線終態   | **既無終止塊、也無 FIN，一直開著**       | 收到 TCP RST        | FIN（優雅關閉）               |
| 失敗時刻   | 無限期，等到客戶端自己放棄（實測 330 秒仍無變化） | 不定                | last-byte 之後 **+300 秒** |
| 該怎麼辦   | **把已拿到的圖直接用掉**（本頁）          | 排查網路路徑與客戶端        | 同本頁，資料也是完整的             |

如果你的報錯是 `ECONNRESET`，那屬於另一類問題，判別方式見[連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops)。

## 相容改造：客戶端主動收尾

思路很簡單：**不要死等連線結束，而是在已收資料能被完整解析時就主動收尾。**

### 關鍵：必須留一個寬限期

不能一解析成功就立刻收尾。正常情況下，終止塊往往就在下一個 TCP 分段裡，只差幾毫秒。如果解析成功就馬上斷開，會把「終止塊晚到幾毫秒」誤判成「服務端沒發」。

正確做法是：解析成功後**再等一小段時間**（建議 3\~5 秒）。這期間收到任何位元組就按正常流程繼續走；等不到才判定為卡住並主動收尾。

<Warning>
  **這一步不是可選最佳化。** 省掉寬限期會讓判定完全失真 —— **每一個正常請求都會被誤判成故障**。我們在實測中第一版就踩了這個坑，一整批正常請求全被誤報。
</Warning>

### 收尾前要過的幾道判定

按從便宜到昂貴的順序排，**任何一條不滿足就繼續等，不要收尾**：

| # | 判定                     | 為什麼                                         |
| - | ---------------------- | ------------------------------------------- |
| 1 | 連線仍處於「接收中」，沒有正常結束      | 已經正常結束的走原有成功路徑即可                            |
| 2 | HTTP 狀態碼是 2xx          | 非 2xx 交給你原有的錯誤處理                            |
| 3 | 響應頭沒有 `Content-Length` | 有明確長度就說明不是這個場景，交給客戶端庫自己結束                   |
| 4 | 已收資料達到一個最小體積           | 擋掉小體積的錯誤響應                                  |
| 5 | 資料量相比上次嘗試有變化           | 避免對十幾 MB 的內容反覆做無謂解析                         |
| 6 | 最後一個非空白字元是 `}`         | 極便宜的預篩。圖片的 base64 編碼裡不含 `}`，傳輸沒到頭幾乎必定在這裡被擋掉 |
| 7 | 完整 JSON 解析成功           | 最終裁決                                        |

第 6、7 條合起來讓**誤判機率接近於零**：響應是單個 JSON 物件，資料沒收全時解析必然失敗。換句話說，**只有真的收全了才可能收尾**。

### Python 實現

用後臺執行緒做流式讀取，主執行緒靠**佇列超時**來實現寬限期：

```python theme={null}
import json
import time
import base64
import queue
import threading
import requests

MIN_BYTES = 1024          # 判定 4：比這還小不可能是一張圖


def _pump(raw, q):
    """後臺執行緒：只負責把收到的塊塞進佇列。"""
    try:
        for chunk in raw.stream(65536, decode_content=True):
            q.put(chunk)
        q.put(None)                       # 服務端正常收尾了
    except Exception as exc:              # 傳輸異常，交給主執行緒拋
        q.put(exc)


def _try_parse(buf):
    if len(buf) < MIN_BYTES:                    # 判定 4
        return None
    if not buf.rstrip().endswith(b"}"):         # 判定 6：極便宜的預篩
        return None
    try:
        return json.loads(buf.decode("utf-8"))  # 判定 7：最終裁決
    except ValueError:
        return None


def generate_image(url, headers, payload,
                   ttfb_timeout=180, term_grace=5, body_timeout=60):
    """非流式出圖，帶主動收尾。

    ttfb_timeout: 等首位元組。這一段是上游在生成，慢不等於故障，要留夠。
    term_grace:   資料到齊後，再等多久結束訊號。等不到就主動收尾。
    body_timeout: 首位元組之後，整個響應體最多再花多久。
    """
    resp = requests.post(url, headers=headers, json=payload,
                         stream=True, timeout=(10, ttfb_timeout))
    resp.raise_for_status()                     # 判定 2

    if resp.headers.get("Content-Length"):      # 判定 3
        return resp.json()                      # 長度已宣告，交給庫自己結束

    q = queue.Queue()
    threading.Thread(target=_pump, args=(resp.raw, q), daemon=True).start()

    buf = bytearray()
    deadline = time.monotonic() + body_timeout

    while True:
        try:
            item = q.get(timeout=term_grace)
        except queue.Empty:                     # 寬限期內沒有任何新資料
            obj = _try_parse(buf)
            if obj is not None:
                resp.close()                    # 資料已到齊，主動收尾
                return obj
            if time.monotonic() > deadline:
                raise TimeoutError("響應不完整，且長時間沒有新資料")
            continue                            # 還不完整，繼續等

        if item is None:                        # 正常路徑：服務端自己收了尾
            break
        if isinstance(item, Exception):
            raise item
        buf += item

    obj = _try_parse(buf)
    if obj is None:
        raise ValueError("響應不完整")
    return obj


def extract_image(obj):
    for cand in obj.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])
    return None
```

<Warning>
  **為什麼要多起一個執行緒？** 因為 `requests` 的讀超時**只有一個值**，它同時管著「等首位元組」和「塊間等待」這兩段。而卡住時讀迴圈會一直阻塞在下一次讀上，寬限期根本沒有機會跑 —— 直接寫成 `for chunk in ...` 加計時的版本，在真正卡住時是**不會觸發**的。

  用後臺執行緒讀、主執行緒 `q.get(timeout=term_grace)`，才能把這兩段超時真正拆開。這個坑我們自己踩過：一個超時值管兩件事，會把「生成慢」和「不收尾」混成同一種失敗，根本沒法歸因。
</Warning>

<Note>
  這個寫法只在**寬限期到點時解析一次**，而不是每收到一塊就試一次，天然滿足上表第 5 條 —— 十幾 MB 的內容不會被反覆解析。
</Note>

### Node.js 實現

Node.js 這邊不需要額外執行緒 —— `reader.read()` 本身就是 Promise，用 `Promise.race` 就能給「等下一塊」加上寬限期上限：

```javascript theme={null}
const TERM_GRACE_MS = 5000;       // 資料到齊後再等多久結束訊號
const TOTAL_TIMEOUT_MS = 180000;  // 總超時：必須留夠上游生成的時間
const MIN_BYTES = 1024;

async function generateImage(url, headers, payload) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TOTAL_TIMEOUT_MS),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);        // 判定 2
  if (resp.headers.get("content-length")) return resp.json();  // 判定 3

  const reader = resp.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    // 用 Promise.race 給「等下一塊資料」加一個寬限期上限
    const next = reader.read();
    const timer = new Promise((r) => setTimeout(() => r("GRACE"), TERM_GRACE_MS));
    const winner = await Promise.race([next, timer]);

    if (winner === "GRACE") {
      const parsed = tryParse(chunks, total);
      if (parsed) {                 // 資料已完整，是服務端沒收尾
        reader.cancel().catch(() => {});
        return parsed;
      }
      continue;                     // 資料還不完整，繼續等
    }

    const { done, value } = winner;
    if (done) break;                // 正常路徑：服務端收了尾
    chunks.push(value);
    total += value.length;
  }

  const parsed = tryParse(chunks, total);
  if (!parsed) throw new Error("響應不完整");
  return parsed;
}

function tryParse(chunks, total) {
  if (total < MIN_BYTES) return null;                 // 判定 4
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  const text = new TextDecoder().decode(buf).trimEnd();
  if (!text.endsWith("}")) return null;               // 判定 6
  try { return JSON.parse(text); } catch { return null; }   // 判定 7
}
```

<Tip>
  兩段程式碼裡都留意一下**正常路徑**那一行註釋：服務端正常收尾時，迴圈靠 `done` / 迭代結束自然退出，寬限期分支根本不會進。這就是「相容而不是替換」的具體含義 —— 你原來的成功路徑一個位元組都沒變。
</Tip>

## 超時怎麼設

最容易踩的坑是**用一個超時值管兩件事**：「等上游把圖生成出來」和「首位元組之後兩塊資料之間的靜默」。這兩段的正常時長差著一個數量級，混成一個值，要麼把生成慢誤殺成故障，要麼讓真正卡住的請求白等好幾分鐘。

| 這一段              | 正常時長                | 建議值             | 為什麼                     |
| ---------------- | ------------------- | --------------- | ----------------------- |
| **等首位元組**（上游在生成） | 2K 約 20\~30 秒，4K 更久 | **120\~180 秒**  | 這段慢不等於故障，要留夠，切短了會誤殺正常請求 |
| **首位元組之後的塊間靜默**  | 毫秒級                 | **3\~5 秒**（寬限期） | 到這個量級還沒動靜，就該判定並主動收尾     |

<CardGroup cols={2}>
  <Card title="✅ 建議" icon="check">
    兩段分開設：首位元組留足生成時間，
    塊間靜默壓到幾秒，靠上面的主動收尾兜底。
    故障幾秒內就能感知，正常請求一個都不誤傷。
  </Card>

  <Card title="❌ 不要這樣" icon="ban">
    用一個 300 秒的大超時兜一切「以防萬一」。
    卡住時服務端一個位元組都不會再發，
    等多久都一樣，只是白白拖長故障感知時間。
  </Card>
</CardGroup>

<Note>
  如果你的產品裡有 4K 這類更耗時的檔位：**總超時可以更長**（模型確實要算那麼久），但**塊間靜默的判定不該跟著變長** —— 這是兩件事，不要一起放大。
</Note>

<Note>
  Node.js 使用者注意：undici（Node 18+ 內建 `fetch` 的底層）有**三個互相獨立的超時**，SDK 的 `timeout` 選項管不到它們。配置寫法見[連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops)的「Node.js：三個超時互相獨立」一節。
</Note>

## 重試與計費

判定為「服務端沒有收尾」之後，按這個順序處理：

<Steps>
  <Step title="先用已經拿到的圖 —— 絕大多數情況到這一步就結束了">
    資料是完整的，圖片可以正常使用，**不需要重試**。這既是最省事的路徑，也避免了重複計費。
  </Step>

  <Step title="解析確實失敗了，才重試">
    如果已收位元組真的解析不出完整 JSON（資料確實不完整），再重試。建議換一條新連線，並在重試之間留 2\~3 秒間隔。
  </Step>

  <Step title="連續失敗就退避，別貼著重試">
    該問題成時間窗發作，短時間內連續重試很可能仍然落在同一個視窗內。若連續 3 次都卡住，建議退避到 30 秒後再試。
  </Step>
</Steps>

<Warning>
  **計費口徑**：這類請求上游已經把圖生成出來、也開始正常回傳了，屬於**交付已完成**，會**照常計費**。所以「客戶端超時報錯」不等於「沒花錢」—— 這正是第一步「直接用已拿到的圖」價值最大的地方：圖已經付過費了，白白丟掉才是真的浪費。

  完整的斷連計費對照（哪些收費、哪些不收費）見[連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops)的「計費影響」一節。
</Warning>

## 工程落地建議

下面這些與語言、框架無關，是我們自己落地時總結的：

* **落在網路層的統一入口，不要散在業務呼叫點。** 把它做成「發請求」這個動作的一部分。這樣所有出圖路徑一次性覆蓋，業務程式碼完全無感知，將來服務端修好了也只需要動一個地方。

* **你真正需要的是「增量讀取」能力。** 關鍵前提是能在響應還沒結束時就看到已收到的內容。絕大多數 HTTP 客戶端都提供這個能力（流式讀取、分塊回撥、進度事件），但**預設用法通常不是** —— 預設那個「直接拿完整響應體」恰恰就是會卡死的那條路。**這是改造的主要工作量所在。**

* **計時以「最後一次收到資料」為準，不是請求開始時間。** 每收到一塊資料就重置寬限期計時。這樣既不會誤傷慢速網路，也能準確捕捉「徹底不動了」的狀態。

* **加一個開關。** 把這層行為放在一個可以隨時關閉的開關後面。上線初期出現任何非預期情況，關掉即可回到原有行為，不用緊急發版。

* **加埋點。** 每次觸發收尾都記一條（時間、資料量、等待時長）。它有三個用途：量化故障實際發生頻率、驗證這層邏輯確實在起作用、以及在服務端修復之後確認埋點歸零 —— 這是判斷「可以下線這層邏輯」的唯一客觀依據。

* **順帶可以改善的體驗。** 既然已經拿到了增量讀取能力，就可以順便把「正在接收資料 X.X MB」這類真實進度展示給使用者。大響應體下載期間的等待，原本對使用者是完全黑盒的。

## 我們自己的落地情況

這套改造我們已經在自家的 AI 圖片大師（`imagen.apiyi.com`）上完成並驗證。用一個會復現該故障的模擬服務（完整發完資料後既不髮結束訊號、也不關連線）跑了一組對照：

| 場景                         | 結果                         |
| -------------------------- | -------------------------- |
| 正常響應（有結束訊號）                | 走原有路徑正常返回，**不觸發收尾** —— 無誤判 |
| 資料到齊但無結束訊號                 | 寬限期後主動收尾，資料完整可用            |
| 同上，但開關關閉                   | 維持舊行為（一直等） —— 開關有效，可隨時回退   |
| 資料只收到一半就掛起                 | **不會**誤收尾，繼續等待             |
| 完整資料但響應頭帶 `Content-Length` | 被護欄攔住，不收尾                  |

結論：**正常請求零影響，故障請求從「等到超時然後失敗」變成「幾秒內正常出圖」。**

## 常見疑問

<AccordionGroup>
  <Accordion title="這會不會把本來正常的請求提前掐斷？">
    不會。收尾的前提是已收資料能解析成一份**完整的 JSON** —— 資料沒收全時解析必然失敗。再加上 3\~5 秒的寬限期，正常請求不會被誤判。上面「我們自己的落地情況」那張表裡，前兩行就是這兩種情況的對照。
  </Accordion>

  <Accordion title="會不會拿到半張圖？">
    不會。判定的是**整個響應體**的完整性，不是圖片本身。JSON 解析通過就意味著圖片資料是完整的 —— 半張圖對應的是解析失敗，那種情況不會觸發收尾。
  </Accordion>

  <Accordion title="這算不算掩蓋服務端問題？">
    不算。它不替代服務端修復，只是把**已經產生、並且已經計費**的結果交付到使用者手裡，同時避免了盲目重試帶來的重複扣費。埋點資料反過來還能幫助定位故障的發作規律。
  </Accordion>

  <Accordion title="服務端修好之後要不要拆掉？">
    不需要急著拆。有結束訊號時這段邏輯永遠不會被觸發，零開銷。可以等埋點連續歸零一段時間之後再考慮清理。
  </Accordion>
</AccordionGroup>

## 什麼時候找客服

加了上面的相容之後，如果仍然滿足下面任一條，帶材料找客服核查：

* 已收位元組**始終解析不出完整 JSON**（說明不是本頁場景，是真的傳輸中斷）；
* 加了主動收尾之後**仍然長時間拿不到任何響應頭**（那是上游還沒開始回傳，屬於生成慢或上游故障，不是收尾問題）；
* 卡住的比例**持續偏高**，不是集中在某個時間窗內，而是長時間穩定復現。

提工單時附上：`x-request-id`、呼叫時間（**帶時區**，如 `2026-08-03 13:15 (UTC+8)`）、模型名與 `imageSize` 等關鍵引數、客戶端異常原文，以及卡住時已收到的位元組數。

## 相關文件

<CardGroup cols={3}>
  <Card title="連線中斷排查" icon="unplug" href="/zh-Hant/api-capabilities/image-connection-drops">
    `ECONNRESET`、SSL EOF、undici 三個超時與本地代理判別矩陣
  </Card>

  <Card title="必讀&最佳實踐" icon="book-check" href="/zh-Hant/api-capabilities/image-api-best-practices">
    同步呼叫、timeout 分檔配置、base64 處理、斷連計費口徑
  </Card>

  <Card title="自實現非同步佇列" icon="list-checks" href="/zh-Hant/api-capabilities/image-async-queue">
    把同步呼叫包進任務佇列，用重試與落庫消化偶發異常
  </Card>
</CardGroup>
