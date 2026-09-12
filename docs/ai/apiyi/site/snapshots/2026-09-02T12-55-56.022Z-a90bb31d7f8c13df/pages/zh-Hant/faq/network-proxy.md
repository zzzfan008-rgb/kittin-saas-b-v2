> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 使用 API 介面需要代理網路嗎？

> 瞭解 API易 的網路訪問方式，是否需要使用代理或 VPN

## 簡短回答

**不需要代理，可以直連。**

API易 支援國內直接訪問，無需任何代理或 VPN。

## 網路訪問說明

### 國內使用者

<Info>
  **免代理直連**

  * ✅ 無需配置代理或 VPN
  * ✅ 直接訪問 `api.apiyi.com`
  * ✅ 採用企業專線回國線路，網路品質優良
  * ✅ 低延遲、高穩定性
</Info>

### 海外使用者

如果您在海外使用 API易：

* 🚀 訪問速度更快
* 🌐 直連國際線路
* ⚡ 無需額外配置

## 網路問題解決方案

極少數情況下，部分使用者可能遇到以下問題：

<CardGroup cols={2}>
  <Card title="HTTPS 證書問題" icon="shield-alert">
    SSL/TLS 證書驗證失敗

    可能原因：本地時間不準確、證書鏈不完整
  </Card>

  <Card title="網路連線異常" icon="wifi-off">
    連線超時或無法建立連線

    可能原因：本地網路限制、DNS 解析問題
  </Card>
</CardGroup>

### 備選方案：HTTP 地址

如遇到上述問題無法解決，我們提供 HTTP 訪問地址作為備選方案：

<Warning>
  **獲取 HTTP 地址**

  HTTP 協議不加密傳輸，僅作為臨時解決方案使用。如需獲取 HTTP 訪問地址，請聯絡技術客服：

  企業微信客服：[點選聯絡](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
</Warning>

## 常見問題

### 為什麼國內可以直連？

我們使用了合規的企業專線回國線路，確保國內使用者可以穩定、快速地訪問服務。

### HTTPS 和 HTTP 有什麼區別？

* **HTTPS**（推薦）：加密傳輸，資料安全性高
* **HTTP**（備選）：明文傳輸，僅在遇到 HTTPS 問題時臨時使用

### 如何判斷網路連線是否正常？

可以使用以下命令測試：

```bash theme={null}
# 測試 API 連線
curl -I https://api.apiyi.com

# 測試 DNS 解析
ping api.apiyi.com
```

如果返回正常響應，說明網路連線無問題。

## 網路最佳化建議

<Tip>
  **提升訪問速度的建議**

  * 🕐 確保本地系統時間準確（避免證書驗證失敗）
  * 🌐 使用穩定的 DNS 服務（如 114.114.114.114 或 8.8.8.8）
  * 📡 優先使用有線網路而非 Wi-Fi
  * 🔄 定期更新系統根證書
</Tip>

## 技術支援

如遇到網路訪問問題，請聯絡技術客服：

<Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  技術支援，快速響應
</Card>
