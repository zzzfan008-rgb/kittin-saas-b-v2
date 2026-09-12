> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易的伺服器在哪裡？應該選擇什麼伺服器？

> 瞭解 API易 的伺服器地理位置、資料中心分佈、網路延遲測試方法以及伺服器選購建議

## 伺服器位置

API易 的伺服器位於**美國洛杉磯（美西）**，採用知名 VPS 服務商**搬瓦工（BandwagonHost）的回國最佳化專線**。

<Info>
  **專線最佳化**：我們的伺服器配備回國最佳化專線，專門針對中國大陸使用者進行了網路最佳化，即使是大圖片傳輸（Base64 編碼）也能保持正常速度。
</Info>

## 不同地區的網路表現

<CardGroup cols={2}>
  <Card title="中國大陸使用者" icon="map-pin">
    **網路表現**：優秀 ✅

    * 回國專線最佳化，延遲低
    * 大圖片傳輸（Base64）速度正常
    * 適合高頻 API 呼叫場景
    * 無需額外配置代理
  </Card>

  <Card title="海外使用者" icon="globe">
    **網路表現**：取決於地理位置 🌍

    * 美西地區延遲最低
    * 歐洲、亞太地區稍有延遲
    * 建議選擇美西機房伺服器
    * 可使用 CDN 加速
  </Card>
</CardGroup>

## 伺服器選購建議

### 海外伺服器推薦

如果您使用海外伺服器呼叫 API易 的服務，建議選擇：

<Tip>
  **推薦選擇**：美西（洛杉磯、聖何塞、西雅圖等）機房的伺服器

  * **地理位置接近**：與我們的伺服器在同一地區，延遲最低
  * **網路路由最佳化**：同區域之間的網路路由通常最優
  * **價效比高**：美西機房價格相對合理
</Tip>

如果您正在尋找穩定的 VPS 服務商，可以考慮與我們使用相同的服務商：

<Card title="搬瓦工 VPS" icon="server" href="https://bandwagonhost.com/aff.php?aff=80627">
  **BandwagonHost（搬瓦工）** - 知名 VPS 服務商

  * ✅ 回國最佳化專線（CN2 GIA、CN2 等）
  * ✅ 美西多個機房可選（洛杉磯、聖何塞等）
  * ✅ 穩定可靠，價效比高
  * ✅ 適合國內外使用者訪問

  點選檢視搬瓦工 VPS 套餐
</Card>

### 中國大陸伺服器

<Info>
  **中國大陸伺服器也沒問題**！

  由於我們配備了回國最佳化專線，即使您的伺服器位於中國大陸境內，訪問 API易 的延遲和速度也是正常的，無需擔心網路問題。
</Info>

**適用場景**：

* 應用部署在國內雲服務商（阿里雲、騰訊雲、華為雲等）
* 使用者主要在中國大陸地區
* 需要符合國內合規要求

## 如何測試網路延遲？

在選擇伺服器之前，建議先測試您的伺服器到 API易 的網路延遲。

### 方法 1：Ping 測試

```bash theme={null}
# 測試延遲（ICMP）
ping api.apiyi.com
```

**參考延遲**：

* **中國大陸**：通常 50-150ms（回國專線最佳化）
* **美西地區**：通常 5-30ms（同區域）
* **歐洲/亞太**：通常 150-300ms（跨區域）

### 方法 2：cURL 延遲測試

```bash theme={null}
# 單次 HTTP 延遲測試
curl -o /dev/null -s -w "連線時間: %{time_connect}s\n總時間: %{time_total}s\n" https://api.apiyi.com

# 多次測試取平均值（更準確）
for i in {1..10}; do
  curl -o /dev/null -s -w "第 $i 次 - 總時間: %{time_total}s\n" https://api.apiyi.com
done
```

### 方法 3：實際 API 呼叫測試

```bash theme={null}
# 測試實際 API 呼叫延遲
time curl -X POST https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

<Tip>
  **最佳化建議**：如果測試延遲較高（大於 500ms），可以考慮：

  * 更換到美西機房的伺服器
  * 使用 CDN 或代理加速
  * 聯絡客服諮詢網路最佳化方案
</Tip>

## 網路最佳化建議

### 針對高延遲場景

如果您的伺服器延遲較高，可以嘗試以下最佳化方案：

<Steps>
  <Step title="使用連線池">
    複用 HTTP 連線，避免頻繁建立新連線的開銷
  </Step>

  <Step title="啟用 HTTP/2 或 HTTP/3">
    利用多路複用特性，提升併發請求效率
  </Step>

  <Step title="批次請求">
    將多個小請求合併為批次請求，減少網路往返次數
  </Step>

  <Step title="非同步呼叫">
    使用非同步方式呼叫 API，避免阻塞等待
  </Step>

  <Step title="本地快取">
    對於重複的請求結果，使用本地快取減少 API 呼叫次數
  </Step>
</Steps>

### 針對大圖片傳輸

如果您需要頻繁傳輸大圖片（如影像生成、影像識別），建議：

<CardGroup cols={2}>
  <Card title="使用 URL 傳參" icon="link">
    優先使用圖片 URL 而不是 Base64 編碼

    減少請求體大小，提升傳輸效率
  </Card>

  <Card title="壓縮圖片" icon="file-archive">
    在上傳前適當壓縮圖片品質

    在保證效果的前提下減小檔案體積
  </Card>
</CardGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼選擇美西而不是其他地區？">
    **主要原因**：

    1. **回國專線最佳化**：美西是回國專線的主要出口點，能為中國大陸使用者提供最佳網路路由
    2. **國際樞紐**：洛杉磯是重要的國際網路樞紐，連線亞太、歐洲、北美等地區
    3. **成本優勢**：美西機房的頻寬成本相對較低，價效比高
    4. **服務穩定**：搬瓦工等服務商在美西運營經驗豐富，穩定性好
  </Accordion>

  <Accordion title="中國大陸訪問 API易 會慢嗎？">
    **不會！**

    我們使用的是搬瓦工的**回國最佳化專線**（CN2 GIA 等），專門針對中國大陸使用者進行了網路最佳化。

    **實際表現**：

    * 中國大陸使用者訪問延遲通常在 50-150ms
    * 即使是大圖片的 Base64 傳輸也速度正常
    * 無需配置代理或 VPN

    您可以通過上述的測試方法實際測試一下您的網路延遲。
  </Accordion>

  <Accordion title="如何最佳化我的應用的網路延遲？">
    **最佳化建議**：

    1. **伺服器選擇**：選擇美西機房的伺服器（與我們在同一地區）
    2. **連線複用**：使用 HTTP 連線池，避免頻繁建立新連線
    3. **批次請求**：將多個小請求合併為批次請求
    4. **非同步呼叫**：使用非同步方式呼叫 API，不阻塞主執行緒
    5. **本地快取**：快取重複的請求結果
    6. **CDN 加速**：對於靜態資源使用 CDN

    詳見上方的"網路最佳化建議"章節。
  </Accordion>

  <Accordion title="API易 是否計劃在其他地區部署伺服器？">
    我們目前專注於提供**高品質、穩定**的美西伺服器服務，並通過回國專線最佳化為全球使用者（尤其是中國大陸使用者）提供良好的網路體驗。

    未來我們會根據使用者需求和業務發展情況，評估在其他地區（如歐洲、亞太）部署伺服器的可能性。

    如果您有特殊的地理位置需求，歡迎聯絡我們的商務團隊討論定製方案。
  </Accordion>

  <Accordion title="我的伺服器不在美西，延遲很高怎麼辦？">
    如果您的伺服器延遲較高（大於 500ms），可以考慮：

    **短期方案**：

    * 使用代理或 CDN 加速
    * 最佳化應用程式碼（連線池、非同步呼叫等）
    * 批次請求減少網路往返次數

    **長期方案**：

    * 遷移伺服器到美西機房
    * 使用多地域部署，美西伺服器專門用於呼叫 API易
    * 聯絡我們討論定製化網路最佳化方案
  </Accordion>

  <Accordion title="搬瓦工 VPS 適合個人開發者嗎？">
    **非常適合！**

    搬瓦工提供多種價格檔位的 VPS 套餐：

    * **入門級**：適合個人開發者測試和小流量應用
    * **中端**：適合中小型生產環境
    * **高階**：適合大流量、高併發場景

    優勢：

    * 價格相對合理，價效比高
    * 回國專線最佳化（中國大陸訪問速度快）
    * 支援月付、年付等靈活付款方式
    * 提供快照備份、一鍵重灌等便捷功能
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="網路連線問題排查" icon="network" href="/zh-Hant/faq/network-proxy">
    瞭解如何解決網路連線問題、配置代理等
  </Card>

  <Card title="API 併發限制" icon="gauge" href="/zh-Hant/faq/api-concurrency">
    瞭解 API 的併發限制和效能最佳化建議
  </Card>
</CardGroup>

## 聯絡我們

如有伺服器選擇、網路最佳化等相關問題，歡迎聯絡我們：

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    網路最佳化、技術支援
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
