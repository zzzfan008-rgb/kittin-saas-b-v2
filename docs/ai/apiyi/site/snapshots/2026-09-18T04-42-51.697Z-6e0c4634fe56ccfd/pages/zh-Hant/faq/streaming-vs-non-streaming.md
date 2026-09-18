> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 流式和非流式呼叫有什麼區別？

> 同一個 Key 為什麼一會流式一會非流式、兩者差在哪、各自適合什麼場景、接入複雜度和計費口徑，以及六個最常見的誤區。

## 簡短回答

<Info>
  **三句話講完：**

  1. **流式還是非流式，完全由你的程式碼決定**——請求體裡的 `stream` 引數。同一個 Key、同一個模型、同一個端點，一會流式一會非流式，一定是客戶端程式碼（或你用的 SDK / 上層框架）在切換，**閘道不會隨機改**。
  2. **兩者拿到的最終內容一致、計費口徑也完全一致**。差別只在「什麼時候拿到」和「怎麼解析」。
  3. **怎麼選**：有人盯著螢幕等輸出 → 流式；程式自己吃結果（解析 JSON、批處理、工具呼叫）→ 非流式。
</Info>

## 一張表看清差別

| 維度           | 流式 `stream: true`                                             | 非流式（預設）                          |
| ------------ | ------------------------------------------------------------- | -------------------------------- |
| 請求引數         | `stream: true`                                                | 不傳，或 `stream: false`             |
| 響應格式         | SSE 事件流（`text/event-stream`），多個 `data:` 塊，以 `data: [DONE]` 收尾 | 一個完整的 JSON 物件                    |
| 取正文的方式       | 逐塊累加 `choices[0].delta.content`                               | 直接讀 `choices[0].message.content` |
| 首位元組時間（TTFB） | 快，普通模型通常 1-3 秒                                                | ≈ 總生成時間                          |
| 總耗時          | 與非流式基本一致                                                      | 與流式基本一致                          |
| 用量 `usage`   | **預設不返回**，需加 `stream_options: {"include_usage": true}`        | 響應體裡必有                           |
| 出錯的形態        | 連線已建立後可能在流中途報錯，要在讀流的迴圈裡處理                                     | 一個 HTTP 狀態碼 + 錯誤 JSON，最直白        |
| 中途長時間無資料     | 少見（持續有資料心跳）                                                   | 常見（整段生成期間連線是"靜默"的）               |
| 接入複雜度        | 中：要處理增量拼接、SSE 解析、關緩衝                                          | 低：一次請求一次解析                       |
| 計費           | 按 token 計費                                                    | **完全相同**                         |
| 控制台日誌        | `is_stream = true`                                            | `is_stream = false`              |

## 為什麼我的請求一會流式一會非流式？

這是最常見的疑問，答案是：**在你自己這一側被改掉了**。按下面幾條從上到下排查，基本能命中：

<AccordionGroup>
  <Accordion title="① 程式碼裡的 stream 是變數或配置項">
    最典型的情況：`stream=config.get("stream", False)`、`stream=is_web_request` 這類寫法。不同入口走到同一個函式，傳進去的值不一樣，日誌上看就是"一會流式一會非流式"。

    **排查**：把實際發出去的請求體打印出來，看 `stream` 欄位到底是什麼。
  </Accordion>

  <Accordion title="② 不同 SDK / 框架的預設值不一樣">
    同一份業務程式碼，換個客戶端就變了：

    * 直接用 OpenAI SDK 的 `chat.completions.create()`：預設 **非流式**
    * 用 `client.chat.completions.stream()` 或 `with_streaming_response`：**流式**
    * LangChain / LlamaIndex 之類的封裝：是否流式取決於你調的是 `invoke` 還是 `stream`，以及構造模型物件時有沒有傳 `streaming=True`
    * 各類桌面客戶端、Agent 工具、工作流平臺：一般在設定裡有「流式輸出」開關，預設值各不相同

    **排查**：確認這次呼叫具體是哪個入口發出去的。
  </Accordion>

  <Accordion title="③ 同一個 Key 被多個應用共用">
    一個 Key 同時給「網頁聊天介面」和「後臺定時任務」用，前者流式、後者非流式，日誌混在一起看就像是隨機的。

    **排查**：給不同用途建不同的令牌，日誌一眼就分得開。做法見 [令牌管理](/zh-Hant/faq/token-management)。
  </Accordion>

  <Accordion title="④ 中間層代理把流式「壓平」了">
    你確實發了 `stream: true`，但請求經過 Nginx、企業閘道、某些代理軟體時被**緩衝**了——服務端是一塊塊發的，代理攢夠了才一次性給你，體感上就變成了非流式。

    **排查**：繞過代理直連測一次；Nginx 側關掉緩衝（`proxy_buffering off;`）。注意這種情況下控制台日誌的 `is_stream` **仍然是 true**，因為閘道這邊確實是流式發出去的。
  </Accordion>
</AccordionGroup>

<Tip>
  **怎麼確認某一次呼叫到底是不是流式**：去控制台日誌看 `is_stream` 欄位，或用[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 批次拉取。這是"事實來源"，比憑體感判斷可靠。
</Tip>

## 怎麼選：按場景對號入座

<CardGroup cols={2}>
  <Card title="用流式" icon="zap">
    * 聊天介面、客服機器人——使用者需要立刻看到反應
    * IDE 外掛 / 程式設計助手（Claude Code、Cursor 等）
    * 長文本生成（萬字文章、長翻譯、大段程式碼）
    * 推理型模型的長任務——至少能看到進度，不至於"完全沒動靜"
    * 需要中途打斷（使用者點「停止」）的場景
  </Card>

  <Card title="用非流式" icon="package">
    * 結構化輸出：要拿完整 JSON 去 `json.loads()`
    * Function Calling / 工具呼叫的引數解析
    * 批處理、離線跑批、定時任務
    * 只要最終結果、沒有人在等的後臺流程
    * 快速驗證、除錯、寫測試用例
  </Card>
</CardGroup>

幾個特殊場景單獨說：

| 場景                 | 建議       | 說明                                                                                         |
| ------------------ | -------- | ------------------------------------------------------------------------------------------ |
| 圖片生成 / 編輯          | 非流式      | OpenAI 相容的 `/v1/images/generations` 不接受 `stream`；Gemini 原生出圖另有 `:streamGenerateContent` 端點 |
| 影片生成               | 與流式無關    | 走非同步任務 + 輪詢，見 [圖片/影片非同步介面](/zh-Hant/faq/image-async-api)                                   |
| Embedding / Rerank | 非流式      | 這類端點沒有流式概念                                                                                 |
| 推理型 / 長輸出模型        | **推薦流式** | 思考階段有靜默但有 keepalive，read timeout 按事件間隔設即可，見下方誤區①                                           |

## 接入複雜度對比：同一件事的兩種寫法

<Tabs>
  <Tab title="Python 非流式">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-api-key",
        base_url="https://api.apiyi.com/v1",
    )

    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "介紹一下量子計算"}],
        timeout=120,
    )

    # 一行拿到全文
    print(resp.choices[0].message.content)
    # usage 直接就在響應體裡
    print(resp.usage.total_tokens)
    ```
  </Tab>

  <Tab title="Python 流式">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-api-key",
        base_url="https://api.apiyi.com/v1",
    )

    stream = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "介紹一下量子計算"}],
        stream=True,
        stream_options={"include_usage": True},   # 不加這行拿不到 usage
        timeout=120,
    )

    chunks = []
    for chunk in stream:
        # 末尾的 usage chunk 裡 choices 是空陣列，必須先判空
        if chunk.choices and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            chunks.append(piece)
            print(piece, end="", flush=True)
        if chunk.usage:
            print(f"\n用量：{chunk.usage.total_tokens} tokens")

    full_text = "".join(chunks)   # 需要全文時自己拼
    ```
  </Tab>

  <Tab title="Node.js 流式">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: "sk-your-api-key",
      baseURL: "https://api.apiyi.com/v1",
    });

    const stream = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [{ role: "user", content: "介紹一下量子計算" }],
      stream: true,
      stream_options: { include_usage: true },
    });

    let full = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        process.stdout.write(delta);
      }
      if (chunk.usage) console.log("\n用量：", chunk.usage.total_tokens);
    }
    ```
  </Tab>

  <Tab title="cURL 對照">
    ```bash theme={null}
    # 非流式：一個完整 JSON
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "你好"}]
      }'

    # 流式：一連串 data: 塊，最後是 data: [DONE]
    # -N 關閉 curl 自己的緩衝，否則看起來還是"一次性出來的"
    curl -N https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "你好"}],
        "stream": true,
        "stream_options": {"include_usage": true}
      }'
    ```
  </Tab>
</Tabs>

<Note>
  **Claude 原生格式（`/v1/messages`）的流式協議不一樣**：它用的是 Anthropic 的**具名事件 SSE**（`message_start` / `content_block_delta` / `message_delta` 等），不是 OpenAI 那種統一的 `data:` chunk，`usage` 也分散在 `message_start` 和 `message_delta` 兩個事件裡。完整解析方法見 [Claude 原生格式：流式與非流式響應](/zh-Hant/api-capabilities/claude-response-handling)。
</Note>

## 計費與用量：兩者完全一樣

<Warning>
  **流式不會更便宜，也不會更貴。** 計費按 token 走，與傳輸方式無關。

  **中途斷開也照常計費**——你按 `Ctrl+C` 或客戶端超時斷開後，上游的生成任務仍會跑完，這次請求正常扣費。所以"流式看到一半不想要了就斷開能省錢"是不成立的。
</Warning>

關於 `usage` 的兩個坑：

1. **流式預設不返回 usage**。OpenAI 相容端點要顯式傳 `stream_options: {"include_usage": true}`，用量會出現在最後一個 chunk 裡（那個 chunk 的 `choices` 是空陣列，解析時要先判空）。本站多個模型已實測可用。
2. **不要用 API 回顯的 usage 去核對賬單**，尤其是快取相關欄位。回顯值和實際計費不總是一致，快取是否命中以**控制台日誌的「快取計費詳情」為準**。詳見 [快取計費說明](/zh-Hant/faq/cache-billing)。

無論流式與否，控制台日誌都會完整記錄本次呼叫的 token 數、耗時和計費，不受傳輸方式影響。日誌欄位含義見 [日誌計費明細怎麼看](/zh-Hant/faq/log-billing-explained)。

## 六個常見誤區

<AccordionGroup>
  <Accordion title="誤區①：開了流式就不用管 timeout 了">
    **要分清兩件事。** 流式不縮短總生成時間——從首字到最後一個 token 的總時長該多久還是多久，這點沒變。

    但流式確實能解決「拿不到結果」：只要把客戶端的 read timeout 設成覆蓋**兩次事件之間的間隔**（推理型模型思考階段實測最大靜默約 42 秒、且期間有 keepalive ping，設 90-120 秒即可），就不會誤觸發。反倒是**純非流式**要讓一個超時值兜住整段十幾分鐘的生成，才是真正撐不住的那種。

    所以正確做法是：長輸出用流式 + read timeout 按事件間隔設。分場景取值見 [如何避免介面超時](/zh-Hant/faq/timeout-configuration)，完整做法見 [長文輸出實戰建議](/zh-Hant/api-capabilities/long-form-output-practices)。
  </Accordion>

  <Accordion title="誤區②：流式比非流式快">
    **快的是首位元組，不是總耗時。** 同一個模型、同一段提示詞，流式和非流式跑完的總時間基本一致。

    流式的價值是**體感**：使用者 1 秒就看到有東西在動，而不是盯著轉圈等 30 秒。如果沒人在看螢幕，這份價值等於零。
  </Accordion>

  <Accordion title="誤區③：流式更省錢 / 只按實際收到的部分計費">
    **不是。** 見上方「計費與用量」一節：計費口徑完全相同，中途斷開也照常扣費。
  </Accordion>

  <Accordion title="誤區④：所有模型和端點都支援流式">
    **不是。** 文本對話類模型基本都支援；圖片生成、Embedding、Rerank 這類端點沒有流式概念，傳 `stream` 要麼被忽略要麼直接報錯。

    個別模型對流式下的某些引數組合有額外限制，不確定時先用非流式跑通，再加 `stream: true`。
  </Accordion>

  <Accordion title="誤區⑤：非流式一定更穩">
    **各有各的坑。**

    * 非流式的風險：整段生成期間連線是"靜默"的，中間的代理、CDN、企業閘道容易按空閒超時把連線掐掉。另外響應體很大時（出圖返回 base64 動輒十幾 MB）還可能遇到收尾卡住，見 [請求收尾卡住](/zh-Hant/api-capabilities/image-tail-stall) 和 [日誌顯示已完成卻收不到響應](/zh-Hant/faq/log-duration-vs-client-wait)。
    * 流式的風險：對不支援 SSE 或強制緩衝的中間層不友好；客戶端解析邏輯更復雜，容易漏掉邊界情況。

    另外注意：`api-cf.apiyi.com`（CDN 節點）有約 100 秒的請求上限，**流式和非流式都受影響**，長請求請改用 `api.apiyi.com` 或 `vip.apiyi.com`，見 [Base URL 配置指南](/zh-Hant/faq/base-url-config)。
  </Accordion>

  <Accordion title="誤區⑥：流式響應裡拿不到完整答案">
    **能拿到，只是要自己拼。** 把每個 chunk 的 `delta.content` 按順序累加起來，就是非流式那個 `message.content`。

    如果你發現拼出來的內容不完整，先查這三點：是否漏處理了 `finish_reason`、是否在收到 `data: [DONE]` 前就退出了迴圈、是否被中間層截斷。
  </Accordion>
</AccordionGroup>

## 流式接不通？按這四步查

<Steps>
  <Step title="確認請求體真的帶了 stream: true">
    列印實際發出的 JSON。用了封裝庫時，"你以為傳了"和"真的傳了"經常不是一回事。
  </Step>

  <Step title="用 curl -N 直連測一次">
    繞開你自己的程式碼和代理，直接用上面「cURL 對照」裡的命令跑。如果 curl 能看到一塊塊吐出來，說明服務端側沒問題，問題在客戶端或中間層。
  </Step>

  <Step title="檢查中間層緩衝">
    Nginx 加 `proxy_buffering off;`；企業閘道 / 安全裝置可能對 `text/event-stream` 做整包掃描，需要聯絡網路管理員放行。
  </Step>

  <Step title="核對解析邏輯">
    按行讀 SSE，跳過空行和 `:` 開頭的註釋行，遇到 `data: [DONE]` 結束；最後一個帶 `usage` 的 chunk 裡 `choices` 是空陣列，別在這裡下標越界。
  </Step>
</Steps>

<Tip>
  排查到這一步還沒結論時，**帶上 `request_id` 聯絡客服**——控制台日誌裡能直接看到這次呼叫是不是按流式處理的、耗時和首位元組時間各是多少。
</Tip>

## 相關文件

<CardGroup cols={2}>
  <Card title="如何避免介面超時" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    分場景的 timeout 推薦值，以及長輸出為什麼要用流式
  </Card>

  <Card title="Base URL 配置指南" icon="link" href="/zh-Hant/faq/base-url-config">
    各介面地址的差異，CDN 節點的 100 秒限制
  </Card>

  <Card title="日誌顯示已完成卻收不到響應" icon="stethoscope" href="/zh-Hant/faq/log-duration-vs-client-wait">
    非流式大響應的經典問題，含分段計時方法
  </Card>

  <Card title="Claude 流式與非流式響應" icon="braces" href="/zh-Hant/api-capabilities/claude-response-handling">
    Anthropic 原生格式的具名事件 SSE 協議解析
  </Card>

  <Card title="文本生成介面說明" icon="message-square" href="/zh-Hant/api-capabilities/text-generation">
    完整引數列表與呼叫示例
  </Card>

  <Card title="日誌計費明細怎麼看" icon="file-text" href="/zh-Hant/faq/log-billing-explained">
    控制台日誌各欄位含義，含 is\_stream
  </Card>
</CardGroup>
