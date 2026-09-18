> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何建立 KEY？

> API易令牌管理指南，包括獲取預設令牌和建立新KEY的完整說明

## 如何建立KEY？

## 獲取現有的預設令牌

1. 進入頂部導航的"令牌"頁面：[https://api.apiyi.com/token](https://api.apiyi.com/token)

2. 在頁面中找到預設令牌，點選最右側的管理選單

3. 在管理選單中找到複製圖示，點選複製

4. 複製出完整的 KEY，KEY 的格式是以 `sk-` 開頭

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="複製API Key" width="1466" height="1006" data-path="images/key-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=6ca82bbb014b12b285048e6b50a00461" alt="複製API Key" width="1466" height="1006" data-path="images/key-manage.png" />

## 新增KEY

除了使用預設令牌，您也可以建立新的 KEY 來精準控制使用權限：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增API Key" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增API Key" width="1284" height="1158" data-path="images/key-add-new.png" />

### 新增KEY的優勢

* **餘額控制**：可以為每個 KEY 設定專門的餘額限制
* **有效期管理**：可以設定 KEY 的過期時間
* **靈活分配**：適合團隊使用或專案隔離

<Warning>
  **重要提示**：建立新 KEY 時，**不需要設定可用模型**。

  這裡採用白名單機制：

  * **如果設定了可用模型**：該 KEY 只能使用指定的模型
  * **如果不設定可用模型**：該 KEY 可以使用整個網站裡的 400+ 模型

  推薦不設定可用模型，這樣可以享受所有模型的訪問權限。
</Warning>

## KEY格式說明

* 所有 API KEY 都以 `sk-` 開頭
* KEY 長度通常為 48-64 位字元
* 請妥善保管您的 KEY，不要在公開場所分享

## 使用建議

1. **開發測試**：使用預設令牌進行快速開發和測試
2. **生產環境**：為生產專案建立專門的 KEY，便於管理和監控
3. **團隊協作**：為不同團隊成員建立獨立的 KEY，方便權限管理
