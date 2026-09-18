> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bob 翻譯

> macOS 上的專業翻譯工具整合指南

# Bob 翻譯

Bob 是 macOS 上一款優秀的翻譯軟體，支援劃詞翻譯、截圖翻譯等功能。通過整合 API易，您可以使用 AI 模型提供更準確、更自然的翻譯結果。

## 快速配置

### 1. 安裝 Bob

從 [Bob 官網](https://bobtranslate.com) 下載並安裝最新版本。

### 2. 配置 API易

1. 開啟 Bob 設定（選單欄圖示 > 偏好設定）
2. 切換到"服務"標籤頁
3. 新增 OpenAI 翻譯服務
4. 配置引數：
   * **API Key**：您的 API易 金鑰
   * **API URL**：`https://api.apiyi.com`
   * **模型**：`gpt-3.5-turbo`

### 3. 測試配置

點選"測試"按鈕驗證配置，顯示成功後儲存。

## 使用方法

### 劃詞翻譯

1. 選中需要翻譯的文本
2. 按下快捷鍵（預設 `⌥ + D`）
3. Bob 彈出翻譯結果

### 截圖翻譯

1. 按下截圖快捷鍵（預設 `⌥ + S`）
2. 框選需要翻譯的區域
3. Bob 識別並翻譯圖片中的文字

### 輸入翻譯

1. 調出 Bob 視窗（預設 `⌥ + Space`）
2. 輸入或貼上要翻譯的文本
3. 選擇目標語言
4. 檢視翻譯結果

## 模型選擇

### 不同場景的推薦

<Card title="檢視翻譯場景模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦，瞭解適合不同翻譯場景的最佳模型選擇，包括日常翻譯、專業文件、長文本處理等。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

### 多模型配置

可以配置多個翻譯服務，使用不同模型：

1. 新增多個 OpenAI 翻譯服務
2. 為每個服務配置不同模型
3. 在翻譯時選擇使用

## 進階設定

### 自定義提示詞

最佳化翻譯品質的提示詞模板：

```text theme={null}
你是一位專業的翻譯專家，精通多國語言。請將以下{source_lang}文本翻譯成{target_lang}。

要求：
1. 保持原文的語氣和風格
2. 使用地道的表達方式
3. 對於專業術語，在翻譯後用括號標註原文
4. 注意文化差異，適當調整表達

原文：{text}
```

### 快捷鍵自定義

在設定 > 通用中自定義：

* **劃詞翻譯**：`⌥ + D`
* **截圖翻譯**：`⌥ + S`
* **輸入翻譯**：`⌥ + Space`
* **顯示/隱藏**：`⌥ + B`

### 翻譯行為設定

推薦配置：

* **自動識別語言**：開啟
* **翻譯後自動複製**：根據需求
* **保留原文格式**：開啟
* **歷史記錄**：開啟

## 使用技巧

### 1. 專業領域翻譯

針對特定領域，可以在提示詞中說明：

```text theme={null}
請作為計算機專業譯者，翻譯以下技術文件。
保留所有技術術語的英文，用括號標註中文含義。
```

### 2. 批次翻譯

需要翻譯大量文本時：

1. 使用輸入翻譯模式
2. 將文本分段貼上
3. 利用歷史記錄檢視所有翻譯

### 3. 對照閱讀

閱讀外文資料時：

1. 開啟"顯示原文"選項
2. 使用劃詞翻譯即時檢視
3. 對比原文和譯文學習

### 4. 術語庫管理

建立個人術語庫：

1. 收藏常用術語翻譯
2. 自定義特定詞彙翻譯
3. 匯出術語庫備份

## 常見問題

### 翻譯速度慢

**原因分析：**

* 網路連線問題
* 選擇的模型較大
* API 服務繁忙

**解決方案：**

1. 檢查網路連線
2. 使用 gpt-3.5-turbo 等快速模型
3. 避開高峰時段

### 翻譯不準確

**改進方法：**

1. 使用更高階的模型（如 GPT-4）
2. 最佳化提示詞，提供更多上下文
3. 對專業內容說明領域

### API 配額用盡

**處理方式：**

1. 檢查 API易 賬戶餘額
2. 合理使用不同模型控制成本
3. 設定每日使用限制

## 最佳實踐

### 1. 成本控制

* 日常翻譯使用 gpt-3.5-turbo
* 重要文件才使用 gpt-4
* 定期檢視使用統計

### 2. 翻譯品質

* 提供充足的上下文
* 使用專業術語時說明領域
* 對重要內容進行二次校對

### 3. 工作流最佳化

* 設定常用語言對
* 自定義專業領域提示詞
* 善用歷史記錄和收藏功能

### 4. 資料安全

* 不翻譯包含敏感資訊的文本
* 定期清理翻譯歷史
* 妥善保管 API 金鑰

## 進階功能

### URL Scheme 整合

Bob 支援通過 URL Scheme 整合到其他應用：

```bash theme={null}
# 直接翻譯文本
bob://translate?text=Hello&from=en&to=zh

# 開啟 Bob 視窗
bob://open
```

### AppleScript 自動化

```applescript theme={null}
tell application "Bob"
    translate "Hello World" from "en" to "zh"
end tell
```

### 匯出功能

定期匯出翻譯記錄：

1. 進入歷史記錄
2. 選擇時間範圍
3. 匯出為 CSV 或 JSON 格式

## 與其他工具整合

### Raycast 整合

通過 Raycast 擴充套件快速呼叫 Bob：

```javascript theme={null}
// Raycast 指令碼示例
import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";

export default async function Command() {
  exec("open bob://translate", (error) => {
    if (error) {
      showToast(Toast.Style.Failure, "啟動 Bob 失敗");
    }
  });
}
```

### Alfred 工作流

建立 Alfred 工作流實現快速翻譯：

1. 建立新工作流
2. 新增 Keyword 觸發器
3. 連線 Run Script 動作
4. 呼叫 Bob 的 URL Scheme

### PopClip 擴充套件

安裝 PopClip 的 Bob 擴充套件，選中文本後直接翻譯。

## 故障排除

### 服務不可用

檢查專案：

1. API 金鑰是否正確
2. 網路連線是否正常
3. API易 服務狀態

### 快捷鍵衝突

解決方法：

1. 在系統偏好設定中檢查快捷鍵衝突
2. 為 Bob 設定獨特的快捷鍵組合
3. 停用衝突應用的快捷鍵

### 權限問題

確保 Bob 具有必要權限：

* 輔助功能權限
* 螢幕錄製權限（截圖翻譯）
* 鍵盤輸入權限

## 效能最佳化

### 減少延遲

1. 使用更快的模型
2. 啟用本地快取
3. 最佳化網路設定

### 節省資源

1. 合理設定翻譯歷史保留時間
2. 定期清理快取
3. 避免同時執行多個翻譯服務

### 提升體驗

1. 調整彈窗顯示時間
2. 自定義介面主題
3. 最佳化字型大小和樣式

需要更多幫助？請檢視 [詳細整合文件](/zh-Hant/scenarios/translation/bob)。
