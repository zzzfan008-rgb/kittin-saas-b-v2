> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片生成有非同步介面嗎？支援任務 ID 查詢結果嗎？

> API易 圖片生成均為同步呼叫，不提供任務 ID 非同步查詢介面，本文說明原因和推薦做法

## 簡短回答

目前 API易 **不提供圖片生成的非同步任務 ID 查詢介面**，所有圖片模型均為**同步呼叫**：請求建立長連線 → 等待生成 → 直接返回圖片結果。

我們是**原廠透傳**模式，且**不記錄使用者業務資料**，因此無法提供"斷線後憑 ID 取回結果"的能力。建議在客戶端設定合理 timeout、保持長連線，並在自己的後臺記錄請求與回執。

<Info>
  **簡單理解**：同步呼叫 + 合理 timeout + 客戶端記錄任務，等價於自己實現了一個輕量非同步佇列，本質區別不大。
</Info>

## 為什麼沒有非同步任務 ID 查詢？

<CardGroup cols={3}>
  <Card title="原廠透傳模式" icon="forward">
    我們對圖片介面保持與上游官方完全一致的同步行為，不在中間增加任務佇列層，避免引入額外的不一致和延遲
  </Card>

  <Card title="隱私與安全優先" icon="shield">
    出於使用者隱私和資料安全考慮，我們**不記錄任何業務內容**（包括 prompt、生成圖片），自然也無法事後憑 ID 取回
  </Card>

  <Card title="同步已可覆蓋" icon="check">
    將 timeout 設到合理範圍、保持長連線，絕大多數圖片生成請求都能在一次呼叫內穩定返回
  </Card>
</CardGroup>

## 推薦做法

<Steps>
  <Step title="客戶端保持長連線 + 合理 timeout">
    把 HTTP 客戶端的 timeout 設到模型生成時間的安全上限（通常 60–300 秒，視模型而定），並啟用 keep-alive，避免中間網路層提前斷開。

    不同模型的耗時差異較大，可聯絡客服獲取**按模型分類的 timeout 建議表**。
  </Step>

  <Step title="在自己的後臺記錄任務與回執">
    由於我方不儲存業務資料，請在你自己的服務端為每次請求生成業務 ID，落庫儲存 prompt、引數、返回結果或錯誤資訊。這樣即使前端斷線，後端仍持有完整記錄。
  </Step>

  <Step title="客戶側自行實現非同步包裝">
    如果業務必須非同步（前端不能長等），可以在你的後端做一層"非同步外殼"：

    * 前端 POST 任務 → 後端入隊 → 返回業務 ID
    * 後端 worker 用同步方式呼叫 API易 → 寫回資料庫
    * 前端憑業務 ID 輪詢 / 用 WebSocket 推送

    這種模式與"平臺原生非同步"在體驗上幾乎等價，且資料全部留在你自己可控範圍內。
  </Step>
</Steps>

## 客戶側非同步包裝（示例思路）

```python theme={null}
# 虛擬碼：在你自己的後端實現非同步外殼
def submit_image_task(prompt):
    task_id = uuid4()
    db.save(task_id, status="pending", prompt=prompt)
    queue.push({"task_id": task_id, "prompt": prompt})
    return task_id

def worker(job):
    try:
        # 同步呼叫 API易，timeout 設到該模型的安全上限
        result = apiyi_client.images.generate(
            prompt=job["prompt"],
            timeout=180,
        )
        db.update(job["task_id"], status="done", url=result.url)
    except TimeoutError:
        db.update(job["task_id"], status="failed", error="timeout")

def query_image_task(task_id):
    return db.get(task_id)  # 前端憑 task_id 輪詢自己的後端
```

<Tip>
  **關鍵點**：業務 ID 是**你自己生成的**，存在**你自己的資料庫**裡。API易 只負責"同步生成"這一步。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="同步呼叫經常超時怎麼辦？">
    多數超時是**客戶端 timeout 設定過短**或**中間網路層（如反向代理、閘道）提前斷開長連線**導致。

    排查順序：

    1. 確認 HTTP 客戶端的 read timeout 已調大到 60–300 秒
    2. 確認 nginx / API 閘道 / CDN 等中間層的超時也已調高
    3. 啟用 keep-alive，避免被中間層強制斷連
    4. 聯絡客服獲取該模型的推薦 timeout 值
  </Accordion>

  <Accordion title="生成超時了，圖片實際可能已經生成，能補救嗎？">
    很遺憾不能。我們是原廠透傳，不持久化生成結果。如果同步呼叫因 timeout 中斷，**該次結果會丟失**，需要客戶端重試。

    建議把 timeout 一次性調到該模型的安全上限，避免"接近成功但被自己掐斷"的情況。
  </Accordion>

  <Accordion title="後續會不會推出非同步任務 ID 介面？">
    我們瞭解部分上游平臺速度較慢、非同步確實更友好，**未來有可能引入非同步能力**，但目前沒有時間表，不做承諾。在此之前請按"客戶側實現非同步包裝"的思路自行處理。
  </Accordion>

  <Accordion title="影片生成介面（Sora / VEO 等）是非同步的嗎？">
    **是的，影片生成介面本身就是非同步任務**（由上游官方設計），返回 task\_id，需要客戶端輪詢任務狀態拿到最終影片。這與圖片介面的同步模式不同，請按對應模型文件處理。
  </Accordion>

  <Accordion title="不同圖片模型的推薦 timeout 是多少？">
    不同模型生成耗時差異較大（快的幾秒、慢的幾十秒甚至 3–5 分鐘）。我們整理了**按模型分檔的 timeout 速查表**，見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)；有特殊場景也可聯絡客服進一步諮詢。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="圖片 API 呼叫須知與最佳實踐" icon="book-check" href="/zh-Hant/api-capabilities/image-api-best-practices">
    各模型 timeout 速查表、base64 處理與 URL 輸出對照
  </Card>

  <Card title="自實現非同步佇列" icon="list-checks" href="/zh-Hant/api-capabilities/image-async-queue">
    在同步介面之上自建任務佇列的工程實踐
  </Card>

  <Card title="模型選擇指南" icon="cpu" href="/zh-Hant/faq/model-selection-guide">
    瞭解各圖片模型的能力與適用場景
  </Card>

  <Card title="API 併發與速率" icon="gauge" href="/zh-Hant/faq/api-concurrency">
    併發上限、限流策略與最佳實踐
  </Card>

  <Card title="呼叫日誌與資料" icon="file-text" href="/zh-Hant/faq/user-logs-control">
    瞭解我們的資料記錄策略與日誌控制
  </Card>

  <Card title="聯絡客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    獲取 timeout 建議表或進一步諮詢
  </Card>
</CardGroup>
