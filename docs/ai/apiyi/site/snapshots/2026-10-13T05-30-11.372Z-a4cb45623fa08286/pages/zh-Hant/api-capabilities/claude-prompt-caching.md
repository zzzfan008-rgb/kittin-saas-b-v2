> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Prompt Caching 快取計費指南

> Claude 原生格式的 Prompt Cache 入門：怎麼寫出會快取的請求、怎麼看賬單、為什麼沒命中。看完能少花一半錢。

如果你用 Claude Code、Cline、Cursor，或者自己寫程式碼調 Claude API，**Prompt Cache 是把賬單打下來最直接的一件事**——命中快取的部分只按 **0.1×** 計費，相當於打 1 折。

本頁基於 Anthropic 官方文件整理（`platform.claude.com/docs/en/build-with-claude/prompt-caching`），並按 API易 的接入方式給出可直接複製的示例。

## 一句話理解

把一段**反覆使用的長 prompt**（系統說明 / 長文件 / few-shot 示例）打上 `cache_control` 標記，伺服器會把它存起來。下次相同字首的請求來，伺服器跳過重複處理，**便宜約 10 倍、也更快**。一段時間內沒人再用就會過期。

## 為什麼要用 —— 看賬單倍率

以模型原始輸入 token 價為 **1×** 計：

| 型別 | 價格 | 說明 |
| - | - | - |
| 普通輸入 | **1×** | 沒快取的部分，原價 |
| 快取寫入（5 分鐘 TTL） | **1.25×** | 第一次寫入貴 25% |
| 快取寫入（1 小時 TTL） | **2×** | 想存更久要付更多 |
| **快取讀取（命中）** | **0.1×** | 後續每次便宜 90% |

**回本點：**

* **5 分鐘 TTL**：只需 **2 次**複用同一字首即可回本（1.25 + 0.1 = 1.35，比兩次不快取的 2.0 便宜）。
* **1 小時 TTL**：需要 **3 次**才回本（2 + 0.2 = 2.2，比 3.0 便宜）。

<Info>
  TTL 是**滑動視窗**：每次命中都會把過期時間重置，因此活躍的會話不會平白過期。只有真正閒置超過 TTL 才會失效。
</Info>

### 適合場景

* 同一份長系統提示詞被多次呼叫（Agent、客服機器人）
* 多輪對話（每加一輪，前面的歷史都能複用）
* 批次處理同一份文件（一份合同問 50 個問題）
* RAG 把檢索到的穩定文件塊作為字首

### 不適合場景

* 每次 prompt 從第一個字開始都不一樣
* 整體很短，根本到不了最小 token 閾值（見下）
* 聊天客戶端裡**每輪都重新組織上傳附件**的對話（原因見下方「圖片和檔案也能快取」）

## 觸發快取的三個硬條件

缺一不可。

### 1. 必須顯式打標記 `cache_control`

`content` 不能是純字串，必須是 **content block 陣列**，在要快取的那一塊上加 `cache_control`：

```python theme={null}
# ❌ 錯：純字串永不快取
"content": "一大段長文..."

# ✅ 對：content block + cache_control
"content": [
    {
        "type": "text",
        "text": "一大段長文...",
        "cache_control": {"type": "ephemeral"},
    },
    {"type": "text", "text": "問題"},
]
```

### 2. 長度必須達到最小閾值

短於閾值的內容，**就算打了標記也不會快取**（不報錯，靜默忽略）。按模型不同：

| 最小 tokens | 模型 |
| - | - |
| **512** | Opus 5、Fable 5 / 5.1、Mythos 5 |
| **1024** | Opus 4.8、Sonnet 5、Sonnet 4.6、Sonnet 4.5、Sonnet 4、Opus 4.1、Opus 4 |
| **2048** | Opus 4.7、Haiku 3.5 |
| **4096** | Opus 4.6、Opus 4.5、Haiku 4.5 |

<Warning>
  **這個閾值不隨版本號單調下降，別憑直覺猜。** 最典型的反直覺組合：Opus 5 只要 **512**，而更早的 Opus 4.6 / 4.5 要 **4096**，整整差 8 倍；Haiku 4.5 也是 4096，比它更老的 Haiku 3.5（2048）還高。所以「新模型門檻更低」「小模型門檻更低」這兩個推斷都不成立，換模型時務必查表。
</Warning>

<Tip>
  中文 1 個字大約 0.5–1 token。換算下來：Opus 5 大約 **500 字**以上就能快取，Sonnet 5 / Sonnet 4.6 需要 **1000 字**左右，而 Opus 4.6 / Haiku 4.5 要到 **4000 字**才有意義。閾值可能隨官方版本變化，**以 Anthropic 官方文件為準**。
</Tip>

<Info>
  **實測校驗（2026-07-29，API易 站內）。** 我們用逐檔遞增的固定字首實測了寫入起點：`claude-opus-5` 在 301 tokens 時不產生快取寫入、614 tokens 時產生，落點與官方 **512** 一致；`claude-sonnet-5` 在 612 tokens 時不寫入、1250 tokens 時寫入，落點與官方 **1024** 一致。兩者均與上表吻合。
</Info>

### 3. 字首必須逐位元組相同

快取按**字首匹配**：從請求開頭一直到 `cache_control` 標記位置，這段位元組流必須和上一次**完全一樣**。改任何一個字元——哪怕是空格、JSON 欄位順序、時間戳——都算"新字首"，會重新寫入而不是命中。

**實踐含義：穩定的東西放前面，易變的東西放後面。**

```python theme={null}
# ❌ 錯：每換一個問題字首就變了，永遠命中不了
content = [
    {"type": "text", "text": "請回答下面問題: " + 問題},  # 這塊在變
    {"type": "text", "text": 長文, "cache_control": {"type": "ephemeral"}},
]

# ✅ 對：長文在前打標記，問題在後不打標記
content = [
    {"type": "text", "text": 長文, "cache_control": {"type": "ephemeral"}},  # 穩定
    {"type": "text", "text": 問題},                                            # 隨便變
]
```

## 最小可執行示例

跑兩次同一段長文 + 不同問題，第一次寫入快取，第二次命中：

```python theme={null}
import json, os, requests

URL = "https://api.apiyi.com/v1/messages"
KEY = os.environ["APIYI_API_KEY"]
HEADERS = {
    "content-type": "application/json",
    "x-api-key": KEY,
    "anthropic-version": "2023-06-01",
}

# 必須足夠長。Sonnet 4.6 至少 1024 tokens，大約 1000+ 中文字。
LONG_TEXT = open("long_document_zh.txt").read()


def ask(question: str, label: str):
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 256,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": LONG_TEXT, "cache_control": {"type": "ephemeral"}},
                {"type": "text", "text": question},
            ],
        }],
    }
    r = requests.post(URL, headers=HEADERS, data=json.dumps(payload), timeout=120)
    u = r.json().get("usage", {})
    print(f"[{label}] input={u.get('input_tokens')} "
          f"write={u.get('cache_creation_input_tokens')} "
          f"read={u.get('cache_read_input_tokens')}")


ask("請概括主旨", "第1次")    # 期望 write>0, read=0
ask("請給3個關鍵詞", "第2次")  # 期望 write=0, read>0
```

期望看到的輸出：

```text theme={null}
[第1次] input=35 write=6512 read=0
[第2次] input=22 write=0    read=6512
```

第 2 次的 `read` ≈ 第 1 次的 `write`，說明同一段字首被命中複用了。

## 怎麼判斷命中沒命中 —— 看三個欄位

每次響應的 `usage` 裡：

| 欄位 | 含義 | 計費倍率 |
| - | - | - |
| `input_tokens` | 沒被快取的剩餘輸入 token | 1× |
| `cache_creation_input_tokens` | 這次寫入快取的 token 數 | 1.25× 或 2× |
| `cache_read_input_tokens` | 這次從快取讀取的 token 數 | **0.1×** |

**輸入總量 = 三者之和。** 只要 `cache_read_input_tokens > 0`，你就在省錢。

<Tip>
  **一個很好用的自檢判據**：真正命中時，本輪的 `cache_read_input_tokens` 會**精確等於上一輪的 `cache_creation_input_tokens`**——上一輪寫進去多少，這一輪就整塊讀回來多少，本輪新增的內容才計入本輪的 write。

  所以：`read` 約等於上一輪的 `write` = 字首完整命中；`read` 明顯小於上一輪的 `write` = 只命中了更靠前的一段，中間有東西變過，順著那段去找就能定位到是什麼在變。
</Tip>

## 最常見的踩坑

| 現象 | 原因 |
| - | - |
| `write` 永遠是 `0` 或欄位不存在 | 沒打 `cache_control` 標記 / 長度沒到閾值 / 用了 OpenAI 相容格式 |
| 第 2 次 `write` 又 > 0，`read` 還是 0 | 字首變了。常見：prompt 裡有 `datetime.now()`、UUID、變化的使用者 ID；JSON 序列化順序不穩定；帶時間戳的 system 提示 |
| 隔了一會兒再調又變成寫入 | 閒置超過 TTL 過期。要常駐可加 `{"type": "ephemeral", "ttl": "1h"}` |
| 同一份 prompt 切換模型後沒命中 | 快取按模型隔離，換模型相當於換 key |
| 用 Fable 5 / 5.1 時某一輪 `read` 突然歸 0，響應 `model` 變成 `claude-opus-4-8`（或 `claude-opus-5`），或 `stop_reason` 為 `refusal` | 觸發了內容安全回退 / 拒答。回退等於換模型換快取鍵，本輪讀不到之前的快取；被拒那一輪寫入的快取後續也不會被讀取。見下方說明 |
| 長對話最近幾輪不命中 | 單次請求最多 **4 個** `cache_control` 斷點；且每個斷點的**字首查詢視窗為 20 個 block**，更久遠的內容不會被納入命中檢查 |
| 對話裡帶了上傳的檔案或大圖，命中忽高忽低 | **不是 Claude 的圖片/檔案快取有問題**，是客戶端每輪重新組織附件讓字首變了。見下方「圖片和檔案也能快取」 |

<Warning>
  **Fable 系列的安全回退會打斷快取。** `claude-fable-5` / `claude-fable-5-1` 內建安全分類器，命中高風險內容時會**拒答**（HTTP 200 + `stop_reason: "refusal"`）或**安全回退**到 Opus 系列處理，響應頂層的 `model` 會如實回顯回退後的模型。這是模型側的正常行為，不是中轉層問題。

  對快取的影響：回退等於換模型、換快取鍵，這一輪讀不到前面輪次寫的快取，下一輪迴到 Fable 後才能繼續命中；被拒的那一輪即使報了 `cache_creation_input_tokens`，這份寫入後續不會被讀取。多輪 agent 會話裡表現為**個別輪次 `read` 歸 0、`write` 重新變大**。

  怎麼辦：判斷命中先看響應 `model` 和 `stop_reason`，別隻看 usage；被拒的輸入調整後再發，不要原樣重試；對話內容保持規範就能把這類 miss 壓到最低。拒答、回退與計費的細節見 [Fable 5.1 上線說明](/news/claude-fable-5-1-launch)。
</Warning>

<Warning>
  **Prompt Cache 只在 Anthropic 原生格式（`/v1/messages`）下生效。** 用 OpenAI 相容格式（`/v1/chat/completions`）調 Claude 時，無論你怎麼傳，都拿不到快取計費。Claude Code、Cline、Cursor 等深度場景請務必走原生格式。
</Warning>

## 圖片和檔案也能快取 —— 但附件場景命中會不穩

先澄清一個常見誤解：**不是 Claude 對圖片/檔案的快取"有問題"**。Anthropic 官方明確說明**文本、圖片、文件都可以進入 Prompt Cache**，三者一視同仁。

真正的原因還是上面那條硬條件：快取匹配的是**請求的完整字首**，而圖片和檔案的那串位元組同樣算在字首裡。只要客戶端每輪對附件的組織方式有任何變化，字首就斷了。官方還特別提到一點：**改變 prompt 裡是否包含圖片，會讓對應的快取失效**。

### 兩類場景的差別

| | Coding / 純文本 | 聊天客戶端 + 附件 |
| - | - | - |
| 典型形態 | 固定 system prompt + 程式碼上下文 + 不斷向後追加的歷史 | 每輪可能重新組織 PDF / 大圖附件 |
| 字首怎麼變 | 只在末尾追加，前面原樣不動 | 附件重新上傳 / 重新編碼、content block 順序或結構變化 |
| 命中表現 | **穩定** —— 正是 prefix caching 最擅長的形態 | **忽高忽低** |

Claude Code、Cline、Cursor 這類編碼客戶端屬於前一類，命中通常很穩。Chatbox、Cherry Studio 這類 GUI 客戶端在**純文本對話**時同樣穩，只有在**對話裡夾了上傳檔案或較大圖片附件**時，才容易出現命中率掉下去的情況。

### 附件場景怎麼把命中率救回來

1. **附件放最前面、順序固定** —— 它們是最大塊也最穩定的內容，天然該佔據字首
2. **同一份附件只編碼一次，之後複用同一份 base64**，不要每輪重新讀檔案重新編碼（重新編碼出來的位元組不保證完全一致）
3. **不要每輪重排 content block**，尤其不要"這輪圖在前、下輪圖在後"
4. **`cache_control` 打在附件之後**，讓附件整體落進快取
5. **對話中途儘量不增刪附件** —— 加一張圖、去一張圖，都會讓它之後的整段字首失效

<Tip>
  **要跟非技術同事或客戶解釋時，可以這麼說：**

  Claude 的快取本身支援文本、圖片和檔案。不過在 Chatbox 這類客戶端中，如果對話裡包含上傳檔案或較大的圖片附件，客戶端每輪請求對附件和上下文的組織方式可能會發生變化，因此實際快取命中率會相對不穩定。在 Coding 這類以純文本、程式碼上下文為主的場景中，請求上下文通常比較穩定，所以快取命中一般是正常且比較穩定的。

  這樣說的好處是把原因落在**客戶端怎麼組織請求**上，不會被理解成"Claude 官方的圖片/檔案快取有 Bug"。
</Tip>

## 進階：多輪對話怎麼打

把 `cache_control` 打在**最近一條 user 訊息的最後一個 content block** 上。每加一輪，快取讀取範圍會自動延伸到上一輪結束的位置：

```python theme={null}
# 每一輪請求構造時
messages[-1]["content"][-1]["cache_control"] = {"type": "ephemeral"}
```

兩個硬限制要注意：

* 單次請求最多 **4 個** `cache_control` 斷點。
* 每個斷點的**字首查詢只回溯最近 20 個 content block**——超出 20 個 block 的更久遠內容不會再被檢索去拼命中。換言之：很長的多輪對話靠"最末一次打標記"是兜不住前面所有歷史的。

實踐建議：在工具定義/系統提示/長文件/最近一輪對話各打一個斷點，正好用滿 4 個槽位，讓不同變化頻率的內容互不影響彼此的命中。

## API易 關於快取的說明

<Info>
  **API易完整透傳快取欄位。** 你在請求裡寫的 `cache_control` 會原樣轉發給上游 Claude（AWS Claude 或 Claude Official），響應裡的 `cache_creation_input_tokens` / `cache_read_input_tokens` 也會原樣回吐給你——所以你的程式碼無需為中轉層做任何額外適配。
</Info>

如何自檢：

1. 第一次傳送時觀察響應 `usage.cache_creation_input_tokens > 0`（寫入成功）。
2. 幾秒後用相同字首再發一次，應看到 `usage.cache_read_input_tokens > 0`（命中）。
3. 後臺賬單裡會單獨顯示**快取寫入** / **快取讀取**兩類計費項，倍率與官方一致（1.25× / 2× / 0.1×）。

## 要點回顧

<CardGroup cols={2}>
  <Card title="1. 打標記" icon="tag">
    `cache_control: {"type": "ephemeral"}` 加在 content block 上，**純字串 content 永不快取**。
  </Card>

  <Card title="2. 夠長度" icon="ruler">
    Opus 5 ≥ 512、Sonnet 5 / Sonnet 4.6 ≥ 1024、Opus 4.7 ≥ 2048、Opus 4.6 / Haiku 4.5 ≥ 4096 tokens，否則靜默忽略。
  </Card>

  <Card title="3. 穩字首" icon="lock">
    穩定內容在前、易變內容在後；任何一個字元變化都會讓快取失效。
  </Card>

  <Card title="4. 看 usage" icon="search">
    `cache_read_input_tokens > 0` 才說明真的省錢了；它應約等於上一輪的 `cache_creation_input_tokens`。
  </Card>

  <Card title="5. 附件要固定" icon="paperclip">
    圖片和檔案同樣能快取，但每輪重新組織附件會讓字首失效——附件放前面、順序固定、只編碼一次。
  </Card>
</CardGroup>

## 相關連結

* 父頁面：[Claude API 呼叫基礎說明](/zh-Hant/api-capabilities/claude)
* 客戶端配置教程：[Claude Code 接入指南](/zh-Hant/scenarios/programming/claude-code) · [Cherry Studio 接入指南](/zh-Hant/scenarios/chat/cherry-studio)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* Anthropic 官方文件：`platform.claude.com/docs/en/build-with-claude/prompt-caching`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.