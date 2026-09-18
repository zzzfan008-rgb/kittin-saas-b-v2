> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日誌顯示呼叫已完成並扣費，客戶端卻收不到響應，怎麼排查？

> 控制台日誌的「用時」只記到閘道處理結束，客戶端要等到最後一個位元組和收尾訊號——本文給出把差值定位到具體環節的測量方法、兩臺伺服器之間的測速辦法，以及打點日誌該記哪些欄位。

## 簡短回答

<Info>
  **控制台日誌的「用時」和你客戶端的超時，量的不是同一段時間。**

  * 日誌的用時記到**閘道處理結束**為止；
  * 你的客戶端要等到**響應體最後一個位元組收完、且連線給出收尾訊號**才算拿到結果。

  所以「日誌顯示 280 秒就完成了，我這邊 600 秒超時都沒拿到資料」是可能出現的，**並且這次請求確實成功了、確實計費了**——差值落在日誌沒有覆蓋的那幾段上。

  本文教你把這個差值**量出來**，定位到具體環節，再對症處理。
</Info>

本文針對**非流式的大響應**呼叫：出圖介面返回 base64 是最典型的場景（響應體動輒幾 MB 到幾十 MB），非流式的長文本輸出同理。流式呼叫和小響應一般不受影響。

## 日誌的「用時」到底記了哪一段

一次呼叫的完整耗時可以拆成五段：

```
客戶端總耗時 = 建立連線 + 上行寫入 + 上游生成 + 下行迴流 + 等收尾訊號
                            └─ 控制台日誌的「用時」只覆蓋這一段 ─┘
```

| 環節                    | 誰在耗時                      | 計入控制台日誌？         |
| --------------------- | ------------------------- | ---------------- |
| 建立連線（DNS / TCP / TLS） | 你的網路到我們入口                 | ❌                |
| 上行寫入（把請求體發完）          | 你的**上行**頻寬；帶參考圖時請求體也有數 MB | ❌                |
| 上游生成                  | 模型真正在出圖 / 推理              | ✅ **這就是日誌顯示的用時** |
| 下行迴流（把響應體收完）          | 你的**下行**頻寬，與併發數強相關        | ❌                |
| 等收尾訊號                 | HTTP 分塊傳輸的終止塊             | ❌                |

<Warning>
  **差值不會出現在任何一個日誌欄位裡。**

  我們內部用裸 socket 做過對照實測：同一批請求，後臺記錄的用時是 5 秒、狀態成功，而客戶端實際等了 37～40 秒才拿到完整響應。中間那 31～35 秒發生在閘道處理結束**之後**，任何一個 duration 欄位都沒有記錄它。

  所以：**用日誌的用時去反駁「我這邊等了很久」是無效的**，兩個數本來就不衝突。要判斷問題在哪，必須在客戶端做分段計時。
</Warning>

控制台日誌與[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 裡可用的欄位：`duration_for_view`（本次呼叫耗時，單位秒）、`is_stream`（是否流式）、`request_id`（報障時提供這個）。

## 第一步：用一條 curl 把差值定位到具體環節

這是整個排查的入口，先跑這一條，再決定往下看哪一節。

```bash theme={null}
curl -sS -o /dev/null --max-time 900 \
  -w 'connect=%{time_connect} pretransfer=%{time_pretransfer} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} speed=%{speed_download}\n' \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST https://api.apiyi.com/v1/images/generations \
  -d '{"model":"gpt-image-2-vip","prompt":"a watercolor mountain village","size":"2048x2048"}'
```

三個派生指標，把上面的原始數字換算成有意義的分段：

| 指標     | 演算法                              | 含義                             |
| ------ | -------------------------------- | ------------------------------ |
| 上行耗時   | `pretransfer − connect`          | 把請求體發完花了多久                     |
| 生成耗時   | `ttfb − pretransfer`             | **≈ 控制台日誌的用時**                 |
| 下行耗時   | `total − ttfb`                   | 收完響應體花了多久                      |
| 實際下行速率 | `size_download / (total − ttfb)` | 也可以直接讀 `speed_download`（位元組/秒） |

### 判讀表

拿上面的數字對號入座，這張表決定你接下來該做什麼：

| 你觀測到                                   | 差值落在            | 下一步                                                               |
| -------------------------------------- | --------------- | ----------------------------------------------------------------- |
| `ttfb` ≈ 日誌用時，且 `total` ≈ `ttfb`       | 沒有差值，就是模型本身慢    | [如何避免介面超時](/zh-Hant/faq/timeout-configuration) 調大 timeout         |
| `total − ttfb` 很大，`speed_download` 很低  | **下行頻寬不足**      | 本頁「兩臺伺服器之間怎麼測速」+「降低響應體體積」                                         |
| `total − ttfb` 很大，但位元組數早就收齊、末尾長時間沒有新資料 | **收尾訊號沒來**      | [出圖請求收尾卡住](/zh-Hant/api-capabilities/image-tail-stall)            |
| `pretransfer − connect` 很大             | **上行慢**，參考圖體積過大 | 把單張輸入圖壓到 1.5MB 以內再傳                                               |
| 中途報 `ECONNRESET` / SSL EOF             | **下行斷連**        | [圖片 API 連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops) |
| curl 跑起來正常，只有業務程式碼超時                   | **客戶端側**        | 本頁「客戶端側最容易被忽略的三條」                                                 |

<Tip>
  跑一次不夠。這類問題**成時間窗發作**——窗內連續多次全中，窗外連續幾十次全正常。建議連續跑 10 次取分佈，並記下發生時間（UTC+8）。
</Tip>

## 第二步：怎麼把「資料到齊但沒收尾」量出來

如果判讀表指向第三行，需要更細的觀測：逐塊讀響應，記錄每一塊的到達時間和塊間停頓。關鍵是要能回答一個問題——**最後一個位元組到齊之後，連線還空轉了多久**。

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json, os, time, urllib.request

    body = json.dumps({
        "model": "gpt-image-2-vip",
        "prompt": "a watercolor mountain village",
        "size": "2048x2048",
    }).encode()

    req = urllib.request.Request(
        "https://api.apiyi.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": "Bearer " + os.environ["APIYI_API_KEY"],
            "Content-Type": "application/json",
        },
    )

    t0 = time.monotonic()
    resp = urllib.request.urlopen(req, timeout=900)
    ttfb = time.monotonic() - t0            # 響應頭到達 ≈ 上游生成結束

    chunks, total, last = [], 0, time.monotonic()
    while True:
        buf = resp.read(65536)
        now = time.monotonic()
        if not buf:
            break
        total += len(buf)
        chunks.append((round(now - t0, 3), round(now - last, 3), total))
        last = now
    t_end = time.monotonic() - t0

    transfer = t_end - ttfb
    max_gap = max((gap for _, gap, _ in chunks), default=0)
    p99_at = next((t for t, _, cum in chunks if cum >= total * 0.99), ttfb)

    print(json.dumps({
        "ttfb_s": round(ttfb, 2),                 # ≈ 控制台日誌的用時
        "transfer_s": round(transfer, 2),         # 下行迴流
        "total_s": round(t_end, 2),               # 你的體感耗時
        "body_bytes": total,
        "down_KBps": round(total / 1024 / transfer, 1) if transfer > 0.001 else None,
        "max_gap_s": max_gap,                     # 塊間最大停頓
        "tail_99_s": round(t_end - p99_at, 2),    # 最後 1% 的位元組花了多久
    }, ensure_ascii=False))
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const t0 = Date.now();
    const resp = await fetch("https://api.apiyi.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2-vip",
        prompt: "a watercolor mountain village",
        size: "2048x2048",
      }),
    });
    const ttfb = (Date.now() - t0) / 1000;

    const reader = resp.body.getReader();
    const curve = [];
    let total = 0, maxGap = 0, last = Date.now();
    while (true) {
      const { done, value } = await reader.read();
      const now = Date.now();
      if (done) break;
      total += value.length;
      maxGap = Math.max(maxGap, (now - last) / 1000);
      curve.push([(now - t0) / 1000, total]);
      last = now;
    }
    const totalS = (Date.now() - t0) / 1000;
    const p99At = (curve.find(([, cum]) => cum >= total * 0.99) || [ttfb])[0];

    console.log({
      ttfb_s: ttfb,
      transfer_s: totalS - ttfb,
      total_s: totalS,
      body_bytes: total,
      down_KBps: total / 1024 / (totalS - ttfb),
      max_gap_s: maxGap,
      tail_99_s: totalS - p99At,
    });
    ```
  </Tab>
</Tabs>

**判定口徑**：`tail_99` 超過 30 秒，或 `max_gap` 超過 30 秒，就記一次「尾部扣留」。典型形態是 `max_gap` 出現在位元組數已達 100% 的位置——也就是資料一個不少地到齊了，之後才開始空等。

<Warning>
  **別用一個超時值兜住三個階段。**

  這是最容易踩的坑：把「等首位元組」和「等傳輸」用同一個 timeout 兜住，會把兩件根因完全不同的事混成同一種失敗。

  | 階段         | 含義                | 建議值       |
  | ---------- | ----------------- | --------- |
  | 等首位元組      | 上游正在生成，**慢不等於故障** | 120–180 秒 |
  | 塊間停頓       | 已經在傳輸了，卻突然不動      | 20–30 秒   |
  | 資料到齊後等收尾訊號 | 寬限期，超過就主動收尾       | 3–5 秒     |

  分開設之後，日誌裡能直接看出是「生成慢」還是「傳完了不收尾」，不用再猜。
</Warning>

## 第三步：兩臺伺服器之間怎麼測速

### 你自己的兩臺機器之間

用 `iperf3` 直接打真實吞吐，這是最準的：

```bash theme={null}
# 服務端（被測那臺）
iperf3 -s

# 客戶端（發起那臺）：正向 30 秒、4 條並行流
iperf3 -c <服務端IP> -t 30 -P 4

# 加 -R 測反向，兩個方向都要看——出圖瓶頸在下行
iperf3 -c <服務端IP> -t 30 -P 4 -R
```

### 你的伺服器到我們介面

**這一段沒法用 iperf3**——我們不提供 iperf 服務端。改用真實呼叫測出來的有效速率：

```bash theme={null}
# 連續 10 次，取 speed_download 的中位數當作有效下行頻寬（位元組/秒）
for i in $(seq 1 10); do
  curl -sS -o /dev/null --max-time 900 \
    -w '%{time_starttransfer} %{time_total} %{size_download} %{speed_download}\n' \
    -H "Authorization: Bearer $APIYI_API_KEY" -H "Content-Type: application/json" \
    -X POST https://api.apiyi.com/v1/images/generations \
    -d '{"model":"gpt-image-2-vip","prompt":"test","size":"1024x1024"}'
done
```

配合鏈路品質一起看：

```bash theme={null}
mtr -rwzbc 100 api.apiyi.com        # 路由每一跳的丟包與延遲
ss -tin state established           # TCP 重傳次數、RTT、擁塞視窗
```

<Warning>
  **如果判讀表指向「收尾訊號沒來」，`mtr` / `ping` 這類工具完全無效。** 那種情況下資料一個位元組都沒丟，鏈路品質是好的，測不出任何異常——查錯方向就跑偏了。先用上一節的指令碼確認是不是這一類，再決定要不要查網路。
</Warning>

### 算一下你的頻寬夠不夠

出圖的響應體是一整塊 base64，實測體積量級：

| 場景                   | 響應體大小    |
| -------------------- | -------- |
| `gpt-image-2` 系列預設尺寸 | 約 2.6 MB |
| Gemini 系列 2K         | 約 13 MB  |
| Gemini 系列 4K         | 約 35 MB  |

base64 編碼本身還會讓體積膨脹約 33%。獨佔頻寬時的下行耗時：

| 出口頻寬     | 2.6 MB | 13 MB  | 35 MB |
| -------- | ------ | ------ | ----- |
| 100 Mbps | 0.2 秒  | 1.0 秒  | 2.8 秒 |
| 10 Mbps  | 2.1 秒  | 10.4 秒 | 28 秒  |
| 2 Mbps   | 10.4 秒 | 52 秒   | 140 秒 |

**關鍵在於這張表是獨佔頻寬的理想值。** 實際上：

```
單個請求可用頻寬 = 出口頻寬 ÷ 同時在飛的請求數
```

舉個例子：出口 10 Mbps、併發 30 個出圖請求、每個響應體 2.6 MB，則每個請求只分到約 0.04 MB/s，**光下行就要 62 秒**——而這 62 秒在控制台日誌裡一秒都看不到。併發再翻一倍，這個數字也跟著翻倍。

<Tip>
  這就是為什麼「白天忙時超時、夜裡同樣的程式碼正常」。不是模型變慢了，是頻寬被併發分攤了。
</Tip>

## 第四步：打點日誌該記哪些欄位

要把現象說清楚（無論是自己定位還是發給我們），每次呼叫至少記這些：

| 欄位              | 怎麼取                                                | 為什麼要它                       |
| --------------- | -------------------------------------------------- | --------------------------- |
| 請求 ID           | 響應頭，不同模型頭名不同（`request-id` 或 `x-request-id`），兩個都讀一下 | 我們按這個查後臺日誌                  |
| 發起時間            | 客戶端本地時間，**標註時區**                                   | 用來和後臺日誌、故障時間窗對齊             |
| 首位元組耗時          | `ttfb`                                             | 與後臺「用時」對照                   |
| 末位元組時間          | 最後一塊資料到達的時刻                                        | 和總耗時的差 = 空等收尾的時間            |
| 總耗時             | 到拿到完整響應為止                                          | 你的真實體感                      |
| 響應體位元組數         | 累加讀到的長度                                            | 用來算速率、判斷是否收齊                |
| 下行速率            | 位元組數 ÷ 下行耗時                                        | 低速率 = 頻寬問題                  |
| **該時刻同時在飛的請求數** | 自己的併發計數器                                           | **最關鍵的一列**，沒有它無法把「慢」和「併發」對上 |

最後一列經常被漏掉，但它往往是結論本身：把速率和併發數畫在一起，如果速率隨併發上升而成比例下降，頻寬就是瓶頸，不用再往別處找。

**怎麼用這張表**：把它和控制台日誌的 `duration_for_view` 並排比——

* 兩者接近 → 問題在下行傳輸，看頻寬和併發；
* 差得很遠 → 問題在收尾訊號或客戶端側。

## 能立刻降低風險的四件事

<Steps>
  <Step title="改用 URL 輸出，這是收益最大的一招">
    `gpt-image-2-vip` 和 `gpt-image-2-all` 支援 `response_format: "url"`，返回圖片連結而不是 base64。**響應體從約 2.6 MB 降到約 0.3 KB**——下行傳輸和收尾訊號兩類問題會同時消失（小響應帶 `Content-Length`，客戶端自己就知道讀完了）。

    強依賴 URL 輸出的業務，把令牌分組切到 `image2_OSS`：確定性輸出 URL、不會在資源緊張時降級為 base64，而且是 **1x 倍率不加價**。

    <Warning>
      官轉 `gpt-image-2` **不支援**這個引數，傳了會直接返回 400 `unknown_parameter`。它目前只有 base64 一條輸出路徑。
    </Warning>
  </Step>

  <Step title="把響應體壓小">
    仍需 base64 時：用 `output_format=jpeg` 配合 `output_compression`，比 PNG 體積小一半以上；按實際用途降低 `size` 與 `quality`，不要預設拉滿 4K。輸入參考圖也壓到 1.5MB 以內，上行同樣受益。
  </Step>

  <Step title="把併發控制在頻寬能承受的範圍">
    用上一節的公式反推：`可接受的下行耗時 × 出口頻寬 ÷ 單張體積` 就是併發上限。超過這個數，加併發只會讓每個請求都變慢，總吞吐不漲。各模型的併發限制見 [API 可以開多少併發](/zh-Hant/faq/api-concurrency)。
  </Step>

  <Step title="超時分三段設，並在資料到齊時主動收尾">
    按前面的表分別設定等首位元組、塊間停頓、收尾寬限三個超時。資料已經到齊卻等不到收尾訊號時，主動把手裡的響應交給業務——完整的相容程式碼見[出圖請求收尾卡住](/zh-Hant/api-capabilities/image-tail-stall)。
  </Step>
</Steps>

## 常見疑問

<AccordionGroup>
  <Accordion title="沒拿到結果，為什麼還照常扣費？">
    因為計費發生在**閘道處理結束時**，而這時上游確實已經把結果生成並返回了。客戶端後續能不能收到，不改變這次呼叫已經產生的成本。實測對照：客戶端在 5 秒時主動斷開，與完整跑完的扣費**完全相同**。

    反過來用，這條是最強的判據：**有計費記錄，說明請求確實跑到了上游併成功了**，問題一定在「閘道處理結束之後」或「請求真正發出之前」，不用再懷疑上游。

    圖片介面沒有非同步任務 ID，斷開就拿不回結果，這一點見[圖片生成有非同步介面嗎](/zh-Hant/faq/image-async-api)。
  </Accordion>

  <Accordion title="把 timeout 從 600 秒再調大到 1200 秒，有用嗎？">
    分情況，這也是為什麼必須先測一次再動手：

    * **下行慢**（速率低、位元組還在持續增長）：有用，調大就能拿到結果。
    * **收尾訊號沒來**（位元組早已收齊、末尾長時間零新增）：**沒用**。實測這種狀態下持續等待 330 秒，一個新位元組都不會再來，調大超時只是把故障暴露得更晚。這種情況要在客戶端主動收尾。
  </Accordion>

  <Accordion title="這到底是我這邊的問題，還是你們閘道的問題？">
    兩邊都可能，所以才要先測。我們把兩邊的判據都擺出來：

    * **偏你這邊**：`speed_download` 明顯偏低、速率隨併發上升而下降、`mtr` 看到丟包、或 curl 正常而只有業務程式碼超時。
    * **偏我們這邊**：位元組早已收齊、末尾長時間零新增資料。閘道側確實存在過「收尾訊號推遲」的問題（根因是出圖路徑的記賬阻塞了請求處理），已隨上游版本於 **2026 年 8 月 13 日**修復並驗證。即便在完全健康的時段，仍有約 4% 的請求要多等 10～79 秒才收到收尾訊號——這些請求的資料其實早就傳完了。

    測完把分段資料發我們，比描述「很慢」有效得多。要帶哪些欄位見下一節。
  </Accordion>

  <Accordion title="有非同步介面嗎？不想一直掛著連線">
    目前圖片生成均為同步呼叫，沒有任務 ID 查詢介面。非同步方式在規劃中，上線後會另行公告。

    在此之前，推薦在自己這一側包一層非同步外殼（提交即返回本地任務 ID，後臺 worker 跑同步呼叫），做法見[自建非同步佇列](/zh-Hant/api-capabilities/image-async-queue)。
  </Accordion>

  <Accordion title="換個接入地址或者換臺機器能繞開嗎？">
    看是哪一類。頻寬不足是你的出口決定的，換我們的入口地址沒用，要麼擴頻寬、要麼降體積、要麼降併發。收尾訊號那一類在故障窗內是多個落點同時出現、又同時恢復的，換域名同樣繞不開。

    唯一要避開的是 CDN 節點：`api-cf.apiyi.com` 走 Cloudflare，約 100 秒會返回 `524`，不適合跑出圖這類長請求。
  </Accordion>
</AccordionGroup>

## 客戶端側最容易被忽略的三條

如果 curl 測下來一切正常，只有業務程式碼超時，往這三個方向查：

1. **超時語義不是你以為的那個**。600 秒到底是總超時，還是隻是讀超時？Node 的 `undici` 有 `headersTimeout` / `bodyTimeout` / `connect.timeout` 三個獨立超時，預設值遠小於你在外層設的那個數，只改外層不生效。
2. **連線池排隊**。連線池被佔滿時，請求還沒真正發出去就已經開始計時了。這段等待在我們這邊完全看不見——後臺日誌里根本沒有這條請求，直到它真正發出。判斷方法：日誌裡查不到對應記錄，基本就是這一類。
3. **中間還有一層**。自建 nginx 的 `proxy_read_timeout` 預設 60 秒，負載均衡、API 閘道、Serverless 平臺各自都有超時上限。把鏈路上每一跳的超時都列出來，取最小值才是你的真實超時。

## 上報時請提供

自查之後仍需要我們協助，請把這些一起發過來，可以少來回好幾輪：

* **請求 ID**（幾條即可，不用全量）
* **分段計時**：首位元組耗時 / 末位元組時間 / 總耗時 / 響應體位元組數
* **發生時間**，標註時區（如 `2026-08-13 15:57 (UTC+8)`）
* **當時的併發數**和出口頻寬
* 用的是哪個**模型**和**令牌分組**

## 相關文件

<CardGroup cols={2}>
  <Card title="如何避免介面超時？" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    各場景該設多少 timeout，以及節點選擇
  </Card>

  <Card title="出圖請求收尾卡住" icon="hourglass" href="/zh-Hant/api-capabilities/image-tail-stall">
    資料已到齊但連線不結束時的客戶端相容程式碼
  </Card>

  <Card title="圖片 API 連線中斷排查" icon="unplug" href="/zh-Hant/api-capabilities/image-connection-drops">
    ECONNRESET、SSL EOF 一類下行斷連的定位
  </Card>

  <Card title="API 可以開多少併發？" icon="gauge" href="/zh-Hant/faq/api-concurrency">
    各類模型的併發限制與配額申請
  </Card>

  <Card title="圖片 API 呼叫須知與最佳實踐" icon="image" href="/zh-Hant/api-capabilities/image-api-best-practices">
    各圖片模型的 timeout 速查表與輸出格式對照
  </Card>

  <Card title="怎麼看懂日誌裡的計費金額？" icon="receipt" href="/zh-Hant/faq/log-billing-explained">
    後臺日誌各列的含義與計費口徑
  </Card>
</CardGroup>

## 聯絡我們

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    出圖超時、下行慢排查
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
