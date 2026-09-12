> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何選擇合適的 AI 模型？

> 瞭解如何根據應用場景選擇最適合的 AI 模型，掌握模型選型的核心原則

## 快速檢視模型資訊

<Info>
  **推薦檢視**：[模型資訊總覽頁面](/zh-Hant/api-capabilities/model-info)

  本頁面會及時更新當下最新的模型列表、效能指標和價格資訊，幫助您快速瞭解所有可用模型。
</Info>

## 核心選型原則

<CardGroup cols={2}>
  <Card title="用新不用舊" icon="trending-up">
    **優先選擇新模型**

    * ✅ 效能更強，效果更好
    * ✅ 價格反而更便宜
    * ✅ 功能更豐富
    * ✅ 支援更長上下文
  </Card>

  <Card title="按場景選擇" icon="target">
    **匹配實際需求**

    * 📊 資料分析：推理能力強的模型
    * 💬 對話應用：平衡效能和成本
    * 🎨 創意生成：支援多模態的模型
    * ⚡ 批次處理：高性價比模型
  </Card>
</CardGroup>

## 常見場景推薦

### 文本生成與對話

<AccordionGroup>
  <Accordion title="💬 通用對話與內容創作">
    **推薦模型**：

    * **Claude 3.5 Sonnet**：綜合能力強，適合複雜任務
    * **GPT-4o mini**：價效比極高，適合大量呼叫
    * **Gemini 2.0 Flash**：速度快，成本低

    **適用場景**：客服機器人、內容生成、文案撰寫
  </Accordion>

  <Accordion title="🧠 複雜推理與資料分析">
    **推薦模型**：

    * **Claude 3.7 Sonnet**：頂級推理能力
    * **Gemini 3 Pro Preview**：資料分析專家
    * **o1 系列**：深度思考模型

    **適用場景**：資料分析、程式碼生成、邏輯推理
  </Accordion>

  <Accordion title="⚡ 批次處理與高併發">
    **推薦模型**：

    * **GPT-4o mini**：\$0.15/百萬 tokens 起
    * **Gemini 2.0 Flash**：速度快，穩定性高
    * **GLM-4-Flash**：國產高性價比選擇

    **適用場景**：批次翻譯、內容稽核、資料處理
  </Accordion>
</AccordionGroup>

### 影像生成

<Accordion title="🎨 影像生成模型選擇">
  **推薦模型**：

  * **FLUX.1 Pro**：最高品質，適合專業場景
  * **FLUX.1 Schnell**：速度優先，快速迭代
  * **SeeDream 4.5**：4K 生成，價效比高（\$0.035/張）

  **適用場景**：

  * **電商產品圖**：SeeDream 4.5（支援參考影像）
  * **營銷創意**：FLUX.1 Pro（品質最優）
  * **快速原型**：FLUX.1 Schnell（3秒出圖）
</Accordion>

### 程式碼與技術應用

<Accordion title="💻 程式碼生成與技術開發">
  **推薦模型**：

  * **Claude 3.7 Sonnet**：程式碼品質最佳
  * **GPT-4o**：多語言支援全面
  * **Gemini 3 Pro Preview**：SWE-bench 76.2% 高分

  **適用場景**：程式碼生成、程式碼審查、技術文件生成
</Accordion>

## 具體場景諮詢

如果您有特定的應用場景，不確定該選擇哪個模型，歡迎隨時聯絡我們獲取專業建議：

<CardGroup cols={3}>
  <Card title="郵件諮詢" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    詳細描述您的使用場景
  </Card>

  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    快速響應，即時溝通
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    即時訊息，高效解答
  </Card>
</CardGroup>

<Tip>
  **諮詢時請提供以下資訊**：

  * 🎯 **應用場景**：具體用途（如批次圖片標題生成、客服對話等）
  * 📊 **使用規模**：預計每日呼叫量
  * ⚡ **效能要求**：響應速度、品質要求
  * 💰 **預算範圍**：成本控制目標

  這些資訊能幫助我們為您推薦最合適的模型組合。
</Tip>

## 實際案例

<Warning>
  **案例：批次圖片標題生成**

  **客戶需求**：需要為大量商品圖片生成標題描述

  **推薦方案**：

  * **GPT-4o mini**：成本低（\$0.15/百萬 tokens），品質穩定，適合批次處理
  * **Gemini 2.0 Flash**：速度快，成本更低，適合超大批次

  **理由**：這類任務對創意要求不高，但對成本和速度敏感，mini 和 flash 系列價效比最優。
</Warning>

## 模型更新說明

<Info>
  **保持關注**

  AI 模型迭代速度很快，新模型通常在效能和價格上都有顯著提升。我們建議：

  * 📖 定期檢視 [模型資訊頁面](/zh-Hant/api-capabilities/model-info) 瞭解最新模型
  * 🔔 關注 [更新日誌](/changelog) 獲取新模型釋出通知
  * 🧪 使用免費額度測試新模型效果
  * 📈 根據實際效果逐步切換到新模型

  **記住**：用新不用舊，新模型往往更強更便宜！
</Info>
