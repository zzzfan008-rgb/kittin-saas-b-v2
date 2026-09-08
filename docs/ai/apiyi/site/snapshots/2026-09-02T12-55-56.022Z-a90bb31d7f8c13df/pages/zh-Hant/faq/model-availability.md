> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼有些模型我用不了？

> API易模型權限說明，瞭解如何解鎖全部模型和模型不可用的原因

## 使用者分組和模型權限

### 充值使用者自動升級

充值後，平臺會定期把充值使用者調整為 **VIP** 或 **SVIP** 分組，即可解鎖全部模型。

<Info>
  **自動分組調整**

  * 充值使用者會被自動分配到VIP/SVIP分組
  * VIP/SVIP使用者可以使用平臺所有可用模型
  * 分組調整通常在充值後自動完成
</Info>

### 手動調整分組

如果您已經充值但分組沒有自動調整，可以聯絡客服進行手動調整：

<Card title="聯絡企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  請提供您的賬號資訊，客服會幫助您調整到正確的使用者分組。
</Card>

## 模型不可用的具體原因

### 1. 高價格模型限制

大部分情況下模型都可以正常使用，但少數高價格模型對 `default` 分組有限制：

* **示例**：`claude-opus-4-20250514` 等新發布的高階模型
* **原因**：因為價格高昂，暫未對預設分組開放
* **解決方案**：充值升級到VIP/SVIP分組即可使用

<Warning>
  **高價格模型**

  某些最新或高階模型由於成本較高，僅對付費使用者開放。充值後即可獲得完整的模型訪問權限。
</Warning>

### 2. 平臺方下線模型

部分模型因為官方平臺下線而無法使用：

* **示例**：`gpt-4.5-preview`
* **原因**：OpenAI 平臺方已下線該模型
* **結果**：我們也相應下線，無法繼續提供服務

<Info>
  **模型下線說明**

  當原始AI服務商（如OpenAI、Anthropic等）下線某個模型時，我們也會同步下線該模型。這是為了確保服務的穩定性和一致性。
</Info>

## 使用者分組說明

### Default 分組

* **權限**：基礎模型訪問
* **限制**：部分高價格模型不可用
* **適用**：免費使用者和新註冊使用者

### VIP/SVIP 分組

* **權限**：全部可用模型訪問
* **優勢**：包括最新和高階模型
* **獲得方式**：充值後自動或手動調整

## 檢查模型可用性

### 確認當前分組

1. 登入控制台檢視賬戶資訊
2. 確認當前使用者分組級別
3. 檢視可用模型列表

### 測試模型呼叫

1. 使用API文件中的測試功能
2. 嘗試呼叫特定模型
3. 檢視返回的錯誤資訊

## 常見解決方案

1. **充值升級**：最直接的解決方案，解鎖所有模型
2. **聯絡客服**：充值後分組未調整時的處理方式
3. **選擇替代模型**：使用功能類似但可用的其他模型
4. **等待更新**：關注平臺公告，瞭解新模型上線資訊
