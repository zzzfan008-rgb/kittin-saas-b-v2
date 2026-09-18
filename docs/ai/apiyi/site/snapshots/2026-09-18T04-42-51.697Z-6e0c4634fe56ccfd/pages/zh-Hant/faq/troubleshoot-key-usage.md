> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何排查莫名的 KEY 呼叫？

> 發現 API Key 有不明呼叫時的排查思路：定位 KEY 去向、及時停用、加固賬號，並通過日誌中的真實 IP 鎖定實際呼叫方。

## 簡短回答

發現令牌（API Key）有不明用量時，按三步走最穩妥：

1. **先查去向**：複製這個 KEY，在聊天記錄、程式碼倉庫、配置檔案裡全域性搜尋，確認給過誰、用在了哪裡。
2. **查不到就停用**：如果確實排查不到使用者，直接**停用該令牌**即可，影響面通常很小。
3. **加固賬號**：修改賬號密碼、收緊後臺權限，非必要人員不登入後臺。

下面給出詳細排查步驟，以及如何通過日誌裡的**真實呼叫 IP** 鎖定實際呼叫方。

## 排查步驟

<Steps>
  <Step title="第一步：定位 KEY 的去向">
    複製這條令牌的 KEY，在以下範圍做全域性搜尋，確認它曾經發給過誰、被配置到了哪裡：

    * 與同事 / 外包 / 客戶的**聊天記錄**（微信、飛書、郵件等）
    * **程式碼倉庫**與提交歷史（包括已刪除分支、`.env`、配置檔案）
    * 部署平臺、CI/CD、第三方工具裡儲存的**環境變數 / 金鑰**

    多數"莫名呼叫"其實是某處遺留的舊配置仍在跑，搜一遍 KEY 就能對上號。
  </Step>

  <Step title="第二步：排查不到就直接停用該令牌">
    如果第一步查完仍不知道是誰在用，**直接停用這條令牌**是最快的止損方式。

    令牌是相互獨立的——停用其中一條，**不影響賬號下的其他令牌**，影響面通常很小。確認無人合法使用後即可停用，必要時再新建一條令牌替換。
  </Step>

  <Step title="第三步：加固賬號與權限">
    在止損的同時，把賬號安全收緊：

    * **修改賬號密碼**，使用高強度密碼
    * **收緊後臺管理權限**，非必要人員不要登入後臺
    * 員工日常只通過**查詢欄目**自助查詢 KEY 用量，無需進入後臺
  </Step>
</Steps>

## 如何通過日誌鎖定真實呼叫方

進入後臺的**日誌欄目**，可以看到每次呼叫使用的**令牌、模型、IP** 等資訊。把滑鼠滑到某條日誌的 IP 上，會彈出該次呼叫的 IP 詳情：

```text theme={null}
📍 主要 IP:
   IP: 104.194.93.159          ← APIYI 平臺的流量分發 IP（非呼叫方）

🔁 代理 IP:
   X-Forwarded-For: 18.163.84.xx
   X-Real-IP:       18.163.84.xx   ← 你們真正的呼叫 IP（實際使用方）
```

<Info>
  **兩個 IP 怎麼讀？**

  * **主要 IP**：是 APIYI 平臺的**流量分發 IP**，對所有客戶都一樣，不代表呼叫來源。
  * **代理 IP 裡的 `X-Real-IP`（及 `X-Forwarded-For`）**：才是**你們真正發起呼叫的 IP**，也就是實際使用方的 IP。

  排查時請以 `X-Real-IP` 為準，比對它屬於哪臺機器 / 哪個網路，即可鎖定到底是誰在呼叫。
</Info>

<Tip>
  **結合令牌一起看更快**：日誌同時顯示了使用的**令牌**和**模型**。先按可疑令牌過濾日誌，再看其 `X-Real-IP` 集中在哪些地址，往往就能定位到具體的人或服務。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="停用令牌會影響我的其他業務嗎？">
    不會。每條令牌相互獨立，停用一條不影響賬號下的其他令牌和正常業務。只要確認該令牌沒有合法用途，就可以放心停用，必要時再新建一條替換。
  </Accordion>

  <Accordion title="日誌裡顯示的主要 IP 是固定的，是不是被攻擊了？">
    不是。**主要 IP**（如 `104.194.93.159`）是 APIYI 平臺的流量分發 IP，對所有呼叫都相同，屬於正常現象。判斷呼叫來源請看代理 IP 裡的 `X-Real-IP`。
  </Accordion>

  <Accordion title="員工要查 KEY 用量，一定要登入後臺嗎？">
    不需要。建議只開放**查詢欄目**給員工自助查詢用量，後臺管理權限保留給必要人員，從源頭降低賬號與金鑰被濫用的風險。
  </Accordion>

  <Accordion title="怎樣從根本上避免 KEY 被濫用？">
    幾個習慣：不要在程式碼裡硬編碼 KEY、用環境變數儲存；按用途分多條令牌、便於單獨停用；定期輪換 KEY；離職 / 專案結束及時回收對應令牌。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="令牌管理" icon="key" href="/zh-Hant/faq/token-management">
    建立、停用、分配令牌的完整說明
  </Card>

  <Card title="呼叫日誌" icon="file-text" href="/zh-Hant/faq/call-logs">
    如何檢視每次呼叫的令牌、模型與 IP
  </Card>

  <Card title="日誌與隱私控制" icon="eye-off" href="/zh-Hant/faq/user-logs-control">
    日誌記錄範圍與隱私設定
  </Card>

  <Card title="資料安全" icon="shield" href="/zh-Hant/faq/data-security">
    API易的資料安全與訪問控制機制
  </Card>
</CardGroup>

## 聯絡我們

如排查後仍有疑問，歡迎聯絡我們的技術支援：

<Card title="技術支援" icon="headphones">
  * [聯絡企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 郵箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
