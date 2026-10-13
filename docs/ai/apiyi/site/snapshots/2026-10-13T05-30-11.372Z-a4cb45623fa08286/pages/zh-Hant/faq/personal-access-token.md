> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 什麼是個人訪問令牌？如何替換系統令牌？

> 個人訪問令牌用於餘額查詢、日誌查詢、令牌管理等管理介面，可按權限勾選、設定到期時間與 IP 白名單；舊系統令牌計劃 2026-11-11 停用

## 簡短回答

**個人訪問令牌**是新版控制台推出的「管理介面憑證」，用來讓指令碼或自動化工具呼叫餘額查詢、日誌查詢、令牌管理這類介面。
它取代原來的**系統令牌**：可以**只勾選需要的權限**、**設定到期時間**、**限定 IP 白名單**，一個賬號最多可建 20 個，按用途分開發放。

<Warning>
  **舊系統令牌計劃於 2026-11-11 (UTC+8) 停用。** 停用後，用系統令牌呼叫管理介面會返回 401。
  平臺會根據實際使用情況決定是否延期，但建議儘早換成個人訪問令牌：只需替換請求頭 `Authorization` 裡的值，程式碼不用改。
</Warning>

<Info>
  個人訪問令牌**不能呼叫模型**。呼叫模型請繼續使用 API Key（控制台裡叫「模型金鑰」，`sk-` 開頭）。
</Info>

## 與系統令牌有什麼不同

| 對比項 | 舊系統令牌 | 個人訪問令牌 |
| - | - | - |
| 權限 | 擁有賬號的全部權限 | 按需勾選，讀取、寫入、檢視金鑰相互獨立 |
| 數量 | 每個賬號 1 個 | 每個賬號最多 20 個，可按用途分開 |
| 到期時間 | 不過期 | 30 / 90 / 180 / 365 天、自定義或永不過期 |
| IP 白名單 | 不支援 | 支援 IPv4、IPv6、CIDR |
| 字首 | 無固定字首 | `nap_` 開頭 |
| 狀態 | 2026-11-11 (UTC+8) 起計劃停用 | 當前推薦 |

## 如何建立

<Steps>
  <Step title="打開個人訪問令牌">
    登入控制台，進入個人中心 `api.apiyi.com/account/profile`，在「賬戶選項」裡點選 **個人訪問令牌**，再點右上角 **建立令牌**。
  </Step>

  <Step title="填寫名稱與到期時間">
    名稱按用途寫，方便日後識別，例如「對賬指令碼」「餘額監控」。到期時間預設 30 天，到期後令牌自動失效，**建議選久一點**（如 365 天），免得指令碼突然中斷。
  </Step>

  <Step title="設定 IP 白名單（可選）">
    多個地址用英文逗號分隔，支援 IPv4、IPv6 或 CIDR，留空表示不限制。**白名單建立後不能修改**，做法見下文。
  </Step>

  <Step title="勾選權限">
    只勾你的指令碼用得到的權限，對照表見下文。
  </Step>

  <Step title="建立並儲存令牌">
    點選 **建立令牌**，立即複製並妥善儲存。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-entry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=74b07a2becc459ad9db610e57281d4b7" alt="個人中心「賬戶選項」裡的個人訪問令牌入口" width="1400" height="598" data-path="images/personal-access-token-entry.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="建立個人訪問令牌：名稱、到期時間、IP 白名單與權限" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-expiry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=79d7e78889391a1bdb1b31239f4a48f1" alt="到期時間可選 30 天、90 天、180 天、365 天、自定義時間或永不過期" width="900" height="361" data-path="images/personal-access-token-expiry.png" />

## 該勾選哪些權限

權限分為「讀取」「寫入」「檢視金鑰」三種，相互獨立：勾了寫入不等於能讀取，勾了讀取也看不到金鑰明文。

| 你要呼叫的介面 | 需要勾選 |
| - | - |
| [餘額查詢](/zh-Hant/api-capabilities/balance-query)（`GET /api/user/self`） | 個人資料 · 讀取 |
| [日誌查詢](/zh-Hant/api-capabilities/log-query)（`GET /api/log/self`） | 用量與個人記錄 · 讀取 |
| [令牌管理](/zh-Hant/api-capabilities/token-management)：列出 / 查詢 API Key | 模型金鑰 · 讀取 |
| [令牌管理](/zh-Hant/api-capabilities/token-management)：建立 / 修改 / 刪除 API Key | 模型金鑰 · 寫入 |
| [令牌管理](/zh-Hant/api-capabilities/token-management)：獲取 API Key 明文 | 模型金鑰 · 檢視金鑰 |

例如只做每日對賬，勾「用量與個人記錄 · 讀取」一項就夠了；餘額監控只勾「個人資料 · 讀取」。
**修改密碼、兩步驗證這類需要安全驗證的操作，仍須登入網頁完成**，個人訪問令牌勾了寫入也做不了。

<Tip>
  一個指令碼一把令牌、只勾它用到的權限。哪天某個指令碼不用了或令牌洩漏，刪掉那一把即可，不影響其它指令碼。
</Tip>

## IP 白名單怎麼設才不踩坑

白名單建立後不能修改，要改只能新建一把。推薦的順序：

1. **先建一把不填白名單的令牌**，把指令碼調通。
2. 確認能用後，**再建一把帶白名單的正式令牌**。把可能用到的出口 IP 都填上：生產伺服器、備用伺服器、需要臨時排查時用的辦公網路等。
3. 換上正式令牌，**刪除那把不帶白名單的測試令牌**。

填的是**公網出口 IP**，不是內網 IP。家用寬頻、辦公網路這類出口 IP 會變的環境不適合開白名單，可以改用只讀權限加較短的到期時間來控制風險。

## 怎麼呼叫

用法與系統令牌完全相同：請求頭 `Authorization` 填令牌本身，加不加 `Bearer ` 字首都可以。

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H "Authorization: $APIYI_TOKEN"
```

原來用系統令牌的指令碼，把環境變數或配置裡的值換成新令牌即可。

## 常見報錯

| HTTP 狀態 | 返回內容 | 原因與處理 |
| - | - | - |
| 401 | `ACCESS_TOKEN_LEGACY_RETIRED`，`Legacy management tokens have been retired...` | 仍在使用舊系統令牌，且已過停用日期。按上文建立個人訪問令牌替換 |
| 401 | `This access token may not be used from the current IP address.` | 請求來源 IP 不在白名單內。核對伺服器的公網出口 IP，白名單不能改，需新建令牌 |
| 403 | `ACCESS_TOKEN_SCOPE_DENIED`，`This endpoint is outside this access token's granted permissions.` | 令牌沒有勾選這個介面需要的權限。對照上表新建一把令牌 |
| 401 | 令牌無效 | 令牌已過期、已被刪除，或者賬號修改了密碼、兩步驗證或通行金鑰。**這三項任一改動都會撤銷全部個人訪問令牌**，需要重新建立 |

## 相關文件

<CardGroup cols={2}>
  <Card title="餘額查詢 API" icon="wallet" href="/zh-Hant/api-capabilities/balance-query">
    用個人訪問令牌查詢賬戶餘額
  </Card>

  <Card title="日誌查詢 API" icon="file-text" href="/zh-Hant/api-capabilities/log-query">
    按時間段拉取呼叫明細做對賬
  </Card>

  <Card title="令牌管理 API" icon="key" href="/zh-Hant/api-capabilities/token-management">
    程式化建立、輪換和刪除 API Key
  </Card>

  <Card title="如何安全地管理 API Key？" icon="shield-check" href="/zh-Hant/faq/key-security-management">
    API Key 的權限邊界與防洩漏
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.