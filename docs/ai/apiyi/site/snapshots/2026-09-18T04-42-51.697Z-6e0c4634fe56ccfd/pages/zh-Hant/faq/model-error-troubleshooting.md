> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 模型呼叫報錯怎麼排查？

> 從引數錯誤、鑑權失敗、429、5xx、超時、資源耗盡到分組不匹配，快速定位模型呼叫問題。

## 簡短回答

不要只根據 HTTP 狀態碼判斷原因。先儲存完整錯誤資訊、模型名、Base URL、令牌分組和 request ID，再區分這是**請求配置錯誤**還是**上游臨時故障**：

* `400`、`401`、`403`、引數不支援、安全攔截和分組不匹配，通常需要修改請求或配置，重複重試不會解決問題。
* `429`、`503`、部分 `504` 和 `Upstream model timed out` 可能與上游負載、資源或長請求有關，應先檢查日誌，再使用有限次數的指數退避重試。
* 如果只有某個模型或分組異常，可以測試該模型的兜底分組；如果多個模型同時異常，應優先檢查 API Key、Base URL 和網路鏈路。

## 先記錄完整錯誤資訊

截圖往往會截掉最有用的欄位。排查前請保留以下資訊：

| 資訊         | 示例                            | 用途           |
| ---------- | ----------------------------- | ------------ |
| HTTP 狀態碼   | `400`、`401`、`429`、`503`       | 判斷錯誤的大類      |
| 錯誤訊息與 code | `Unsupported parameter: stop` | 判斷是否為確定性請求錯誤 |
| 模型與分組      | `gpt-5.6-luna`、`Default`      | 判斷模型或通道範圍    |
| Base URL   | `https://api.apiyi.com/v1`    | 排查地址和節點配置    |
| request ID | 響應中的請求標識                      | 方便後臺定位       |
| 發生時間       | 建議註明時區                        | 對照上游和呼叫日誌    |
| 日誌記錄       | 是否出現消費記錄                      | 判斷是否已經進入生成流程 |

<Warning>
  請勿在工單、截圖或程式碼中公開完整 API Key。提交錯誤資訊時，只保留錯誤訊息、request ID 和脫敏後的配置。
</Warning>

## 按錯誤型別排查

| 錯誤現象                                       | 常見原因                           | 首要處理方式                                  |
| ------------------------------------------ | ------------------------------ | --------------------------------------- |
| `400` 或 `Unsupported parameter`            | 當前模型不支援請求引數，例如部分輕量模型不支援 `stop` | 刪除不支援的引數，先用最小請求驗證；不要重複重試                |
| `401 Invalid token` 或 `403`                | API Key、Base URL、令牌狀態或分組權限不匹配  | 先核對 API Key 與 Base URL，再檢查令牌分組和模型權限     |
| `429`                                      | 併發過高、上游負載飽和，也可能被錯誤訊息掩蓋了真實引數問題  | 檢視完整錯誤訊息，降低併發並指數退避；長期出現時檢查配額和分組         |
| `503` 或 `Service unavailable`              | 服務暫時不可用、上游資源不足或當前分組沒有可用渠道      | 等待片刻後有限次數重試，必要時切換已授權的兜底分組               |
| `504` 或 `Upstream model timed out`         | 上游處理時間過長、上游資源波動或請求鏈路超時         | 檢查呼叫日誌和客戶端 timeout；確認沒有使用不適合長請求的 CDN 節點 |
| `RESOURCE_EXHAUSTED`                       | 上游算力或併發資源暫時不足                  | 降低併發、等待資源恢復，或使用其他可用分組/模型                |
| `rejected by the safety system`、`NO_IMAGE` | 請求觸發了上游內容安全策略                  | 修改提示詞和輸入內容；不要原樣重複提交                     |
| 模型不可用或分組不匹配                                | 令牌未選擇對應分組、模型白名單限制或模型名不正確       | 檢查令牌的選擇分組、兜底分組和可用模型設定                   |

<Info>
  同一個狀態碼可能對應不同原因。例如，`429` 既可能是上游負載飽和，也可能只是錯誤訊息沒有直接顯示引數不相容。最終判斷應以完整響應和呼叫日誌為準。
</Info>

## 標準排查步驟

<Steps>
  <Step title="第一步：複製最小請求">
    暫時移除可選引數、工具定義、複雜圖片輸入和超長提示詞，只保留模型、必要訊息和認證資訊。這樣可以判斷問題來自請求引數，還是來自模型通道。
  </Step>

  <Step title="第二步：核對地址、令牌和分組">
    確認 API Key 與 `api.apiyi.com` 的 Base URL 配套使用，並在控制台檢查令牌的選擇分組、兜底分組和可用模型。不同模型可能需要不同的專屬分組。
  </Step>

  <Step title="第三步：判斷是否適合重試">
    對 `429`、`503` 和確認屬於臨時上游故障的錯誤，使用逐步增加間隔的重試策略。對引數錯誤、安全攔截、模型名錯誤和分組不匹配，先修改請求或配置，不要原樣重試。
  </Step>

  <Step title="第四步：檢查 timeout 和網路鏈路">
    圖片生成、推理模型和長文本任務需要更長的 timeout。長請求建議使用 `api.apiyi.com` 或 `vip.apiyi.com`，不要使用有約 100 秒限制的 `api-cf.apiyi.com` CDN 節點。
  </Step>

  <Step title="第五步：檢視呼叫日誌後再決定是否補發">
    檢查請求是否產生消費記錄。客戶端 timeout 或上游已經開始生成的請求，可能在客戶端斷開後仍然計費；確認狀態前不要盲目重複提交。
  </Step>
</Steps>

## 最小請求測試示例

下面的請求只用於驗證地址、令牌和基本模型呼叫是否正常。請將 `YOUR_MODEL` 替換為令牌實際可用的模型，並不要額外新增未經確認支援的引數。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [
      {"role": "user", "content": "請回復：測試成功"}
    ]
  }'
```

## 如何避免重複報錯

* 先用最小請求跑通，再逐項加入 `stop`、工具呼叫、推理強度、圖片和其他可選引數。
* 為不同模型維護引數兼容表，不要假設所有模型都支援同一組引數。
* 遇到 `429` 不要立即併發重發，使用指數退避並控制單模型併發。
* 圖片和推理請求使用足夠大的 timeout；SDK 自帶重試時，避免與業務層重試疊加。
* 為重要模型配置經過實際驗證的兜底分組，並定期用真實業務引數測試。

## 常見問題

<AccordionGroup>
  <Accordion title="429 一定代表併發超限嗎？">
    不一定。`429` 可能來自併發或上游負載，也可能是某些模型的錯誤訊息沒有直接顯示引數相容性問題。請先檢視完整的 `error.message`，再決定是降低併發還是修改請求。
  </Accordion>

  <Accordion title="遇到 401 就一定要重新生成令牌嗎？">
    不一定。先確認請求使用的是 API易 的 Base URL，並檢查令牌是否過期、是否選擇了正確分組。如果只有某個模型出現 `Invalid token`，同時伴隨 5xx 或超時，問題也可能來自該模型的上游通道。
  </Accordion>

  <Accordion title="請求超時後可以直接重試嗎？">
    先檢視呼叫日誌。客戶端 timeout 只代表客戶端停止等待，不一定代表服務端停止處理；如果請求已經產生消費記錄，直接重試可能造成重複呼叫。
  </Accordion>

  <Accordion title="錯誤請求會扣費嗎？">
    不能只憑錯誤頁面判斷。沒有進入模型生成階段的引數校驗、鑑權或安全攔截通常不會產生最終消費，但客戶端主動斷開、上游已開始處理或已返回結果的請求可能仍然計費，請以呼叫日誌為準。
  </Accordion>
</AccordionGroup>

## 仍然無法解決？聯絡我們

如果按照上述步驟仍然無法恢復，請通過企業微信或郵件聯絡 API易 客服。為了加快定位，請一併提供：

* 模型名稱、令牌分組和 Base URL
* 完整錯誤訊息、HTTP 狀態碼和 request ID
* 問題發生時間（請註明 `UTC+8`）
* 最小化後的請求示例或脫敏後的請求體
* 呼叫日誌中是否存在消費記錄

<Warning>
  請勿傳送完整 API Key。可以保留 Key 的字首和後幾位，其餘內容請打碼。
</Warning>

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增，或點選本卡片直接聯絡客服。

    模型報錯、超時、分組和計費排查
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    郵件標題建議包含「模型報錯 + 模型名稱」。
  </Card>
</CardGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="為什麼提示 API Key 無效？" icon="key" href="/zh-Hant/faq/invalid-api-key">
    檢查 Base URL、API Key 和基本鑑權配置
  </Card>

  <Card title="什麼是分組？" icon="layers" href="/zh-Hant/faq/groups-explained">
    瞭解令牌分組、上游通道和兜底分組
  </Card>

  <Card title="如何避免介面超時？" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    配置 timeout、節點和長請求排查方法
  </Card>

  <Card title="API 可以開多少併發？" icon="gauge" href="/zh-Hant/faq/api-concurrency">
    檢視模型併發限制和 429 處理建議
  </Card>

  <Card title="網站或介面返回 502 怎麼辦？" icon="server-crash" href="/zh-Hant/faq/website-502-error">
    瞭解 5xx 錯誤、重試和計費判斷
  </Card>

  <Card title="怎麼看懂日誌裡的計費金額？" icon="file-text" href="/zh-Hant/faq/log-billing-explained">
    通過呼叫日誌確認請求是否計費
  </Card>
</CardGroup>
