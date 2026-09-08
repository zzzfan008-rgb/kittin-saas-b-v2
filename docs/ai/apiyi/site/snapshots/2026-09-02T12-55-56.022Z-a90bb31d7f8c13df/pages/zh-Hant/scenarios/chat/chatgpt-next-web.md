> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> 一鍵部署的網頁版 ChatGPT 整合指南

ChatGPT Next Web 是一款精心設計的 ChatGPT 網頁客戶端，支援一鍵部署和多種 AI 模型。

## 快速部署

### Vercel 一鍵部署

1. 點選 [一鍵部署](https://vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web)
2. 設定環境變數：
   * `OPENAI_API_KEY`：您的 API易 金鑰
   * `BASE_URL`：`https://api.apiyi.com`
3. 完成部署

### Docker 部署

```bash theme={null}
docker run -d \
  --name chatgpt-next-web \
  -p 3000:3000 \
  -e OPENAI_API_KEY="您的API易金鑰" \
  -e BASE_URL="https://api.apiyi.com" \
  yidadaa/chatgpt-next-web
```

## 配置說明

### 基礎配置

在設定頁面配置：

* **API Key**：輸入 API易 金鑰
* **介面地址**：`https://api.apiyi.com`

### 非 OpenAI 模型

對於 Claude、Gemini 等模型：

1. 在"自定義模型"中新增
2. 格式：`+模型名稱@OpenAI`
3. 示例：`+claude-3-opus-20240229@OpenAI`

## 核心功能

### 預設提示詞

內建豐富的提示詞模板

### 面具功能

建立預設的 AI 角色

### 對話匯出

支援 Markdown、圖片、PDF 格式

### 訪問控制

設定密碼保護您的應用

## 環境變數

```bash theme={null}
# API 配置
OPENAI_API_KEY=您的API易金鑰
BASE_URL=https://api.apiyi.com

# 訪問控制
CODE=您的訪問密碼

# 模型配置
DEFAULT_MODEL=gpt-3.5-turbo
CUSTOM_MODELS=+claude-3-opus-20240229@OpenAI
```

## 使用技巧

### 模型選擇策略

<Card title="檢視當下熱門模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  獲取最新的模型推薦、效能對比和場景化使用建議。涵蓋文本創作、程式設計開發、影像生成、影片生成等全場景。
</Card>

### 提示詞最佳化

```markdown theme={null}
# 角色設定
你是一位經驗豐富的[具體角色]

# 任務說明
請幫我[具體任務]

# 輸出要求
- 要求1
- 要求2
```

## 常見問題

### 模型不顯示

確保使用 v2.13.0+ 版本

### 連線失敗

檢查 API 地址：`https://api.apiyi.com`

### 回覆中斷

檢查賬戶餘額和網路連線

## 更新維護

### Vercel 更新

在 GitHub 中 Sync fork，Vercel 自動重新部署

### Docker 更新

```bash theme={null}
docker pull yidadaa/chatgpt-next-web
docker stop chatgpt-next-web
docker rm chatgpt-next-web
# 重新執行容器
```
