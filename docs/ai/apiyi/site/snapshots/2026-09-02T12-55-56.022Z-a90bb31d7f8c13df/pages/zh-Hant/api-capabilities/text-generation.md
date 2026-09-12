> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文本生成（對話補全）

> 使用大語言模型進行對話補全，支援單輪對話、多輪對話、角色扮演等多種文本生成場景

## 功能概述

文本生成（Chat Completions）是 API易平臺最核心的能力之一，支援呼叫 400+ 熱門 AI 大模型進行智慧對話和文本生成。通過統一的 OpenAI 相容介面，你可以輕鬆實現：

* **智慧對話**：構建聊天機器人、虛擬助手
* **內容創作**：文章寫作、創意生成、文案潤色
* **程式碼輔助**：程式碼生成、除錯、重構建議
* **知識問答**：回答問題、知識檢索、資訊提取
* **角色扮演**：定製化 AI 角色、場景模擬

<Info>
  支援 OpenAI GPT-4、Claude、Gemini、DeepSeek、Qwen 等 400+ 主流大模型，一個 API Key 呼叫所有模型。
</Info>

## 快速開始

### 基礎對話示例

使用 Chat Completions API 進行簡單的單輪對話：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "介紹一下人工智慧的發展歷程"}
    ]
)

print(response.choices[0].message.content)
```

### 多輪對話示例

通過 `messages` 陣列維護對話歷史，實現上下文連貫的多輪對話：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

messages = [
    {"role": "system", "content": "你是一個專業的 Python 程式設計助手"},
    {"role": "user", "content": "如何讀取 CSV 檔案？"},
    {"role": "assistant", "content": "可以使用 pandas 庫的 read_csv() 函式..."},
    {"role": "user", "content": "那如何過濾特定列的資料？"}
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

print(response.choices[0].message.content)
```

## 核心引數詳解

### model（必填）

指定要使用的模型名稱，詳見 [模型資訊](/zh-Hant/api-capabilities/model-info) 頁面。

```python theme={null}
model="gpt-4o"  # GPT-4 Omni
model="claude-sonnet-4.5"  # Claude Sonnet 4.5
model="gemini-3-pro-preview"  # Gemini 3 Pro
model="deepseek-chat"  # DeepSeek Chat
```

### messages（必填）

對話訊息陣列，每條訊息包含 `role` 和 `content` 欄位：

<CardGroup cols={3}>
  <Card title="system" icon="settings">
    系統提示，定義 AI 的行為和角色
  </Card>

  <Card title="user" icon="user">
    使用者訊息，代表使用者的輸入
  </Card>

  <Card title="assistant" icon="bot">
    助手訊息，代表 AI 的回覆
  </Card>
</CardGroup>

```python theme={null}
messages = [
    {"role": "system", "content": "你是一個友好的客服助手"},
    {"role": "user", "content": "我想諮詢退款問題"},
    {"role": "assistant", "content": "好的，請問您遇到了什麼問題？"},
    {"role": "user", "content": "商品有品質問題"}
]
```

### temperature（可選）

控制輸出的隨機性，範圍 `0.0 ~ 2.0`，預設 `1.0`：

* **0.0 \~ 0.3**：輸出更確定、一致，適合事實性任務（翻譯、總結、程式碼生成）
* **0.7 \~ 1.0**：平衡創造性和準確性，適合日常對話
* **1.0 \~ 2.0**：輸出更有創意、多樣性，適合創意寫作、頭腦風暴

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "寫一首關於春天的詩"}],
    temperature=1.2  # 提高創造性
)
```

### max\_tokens（可選）

限制生成的最大 token 數量，用於控制成本和響應長度：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "用一句話介紹 AI"}],
    max_tokens=50  # 限制輸出長度
)
```

<Warning>
  不同模型的 token 計費標準不同，詳見 [定價說明](/zh-Hant/pricing) 頁面。
</Warning>

### top\_p（可選）

核取樣引數，範圍 `0.0 ~ 1.0`，控制輸出的多樣性：

* 較低的值（如 `0.5`）：輸出更聚焦、確定
* 較高的值（如 `0.9`）：輸出更多樣、隨機

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "推薦一些科幻電影"}],
    top_p=0.8
)
```

<Info>
  通常建議只調整 `temperature` 或 `top_p` 其中之一，避免同時使用。
</Info>

### stream（可選）

啟用流式輸出，逐 token 返回結果，提升使用者體驗：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "寫一篇關於人工智慧的文章"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

詳見 [流式輸出](/wiki/applications/streaming-output) 文件。

## 高階用法

### 系統提示（System Prompt）

通過 `system` 角色定義 AI 的行為、角色、知識範圍和回覆風格：

```python theme={null}
messages = [
    {
        "role": "system",
        "content": """你是一個專業的法律顧問助手。

規則：
1. 提供準確、專業的法律建議
2. 使用通俗易懂的語言解釋法律術語
3. 必要時引用相關法律條文
4. 避免給出絕對性的結論，建議諮詢專業律師
5. 保持中立、客觀的立場"""
    },
    {"role": "user", "content": "請問勞動合同可以隨時解除嗎？"}
]
```

### 角色扮演

建立具有特定性格和專業領域的 AI 助手：

```python theme={null}
messages = [
    {
        "role": "system",
        "content": "你是一位資深的 Python 開發者，擁有 10 年經驗。你擅長用簡潔的程式碼解決問題，喜歡使用 Pythonic 的寫法，並且會主動指出程式碼中的潛在問題。"
    },
    {"role": "user", "content": "幫我寫一個快速排序演算法"}
]
```

### 上下文管理

對於長對話，需要合理管理上下文長度，避免超過模型的 token 限制：

```python theme={null}
def manage_context(messages, max_history=10):
    """保留最近的對話歷史"""
    # 保留 system 訊息
    system_messages = [m for m in messages if m["role"] == "system"]
    # 保留最近的 N 條對話
    recent_messages = messages[-max_history:]

    return system_messages + recent_messages

# 使用示例
messages = manage_context(messages, max_history=10)
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)
```

### JSON 模式輸出

某些模型支援強制輸出 JSON 格式：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一個數據提取助手，始終以 JSON 格式返回結果"},
        {"role": "user", "content": "提取這段文本的關鍵資訊：張三，男，30歲，軟體工程師"}
    ],
    response_format={"type": "json_object"}
)

import json
result = json.loads(response.choices[0].message.content)
print(result)
```

## 最佳實踐

### 1. 選擇合適的模型

根據任務需求選擇價效比最優的模型：

| 任務型別  | 推薦模型                                            | 說明       |
| ----- | ----------------------------------------------- | -------- |
| 日常對話  | gpt-4o-mini, deepseek-chat                      | 成本低，響應快  |
| 複雜推理  | gpt-4o, claude-sonnet-4.5, gemini-3-pro-preview | 能力強，準確度高 |
| 程式碼生成 | gpt-4o, deepseek-coder, claude-sonnet-4.5       | 專業性強     |
| 創意寫作  | claude-sonnet-4.5, gpt-4o                       | 文筆流暢     |
| 多語言翻譯 | gemini-3-pro-preview, gpt-4o                    | 支援語言多    |

### 2. 最佳化提示詞（Prompt）

好的提示詞能顯著提升輸出品質：

<CardGroup cols={2}>
  <Card title="明確任務" icon="check">
    清楚說明需要 AI 做什麼，提供必要的上下文
  </Card>

  <Card title="指定格式" icon="list">
    明確輸出格式、長度、語氣等要求
  </Card>

  <Card title="提供示例" icon="lightbulb">
    給出輸入輸出示例，幫助 AI 理解期望
  </Card>

  <Card title="分步引導" icon="list-ordered">
    複雜任務拆分成多個步驟，逐步完成
  </Card>
</CardGroup>

```python theme={null}
# ❌ 不好的提示詞
"寫一篇文章"

# ✅ 好的提示詞
"""請寫一篇關於人工智慧在醫療領域應用的科普文章。

要求：
- 長度：800-1000 字
- 受眾：普通讀者
- 結構：引言、應用場景、案例分析、未來展望
- 語氣：專業但易懂
- 包含 2-3 個真實案例"""
```

### 3. 控制成本

合理使用引數降低 API 呼叫成本：

```python theme={null}
# 設定 max_tokens 限制輸出長度
response = client.chat.completions.create(
    model="gpt-4o-mini",  # 使用價效比更高的模型
    messages=messages,
    max_tokens=500,  # 限制最大輸出
    temperature=0.7
)

{/* 定期清理對話歷史 */}
if len(messages) > 20:
    messages = messages[-10:]  # 只保留最近 10 條
```

### 4. 錯誤處理

新增異常處理，提升應用穩定性：

```python theme={null}
from openai import OpenAI, OpenAIError
import time

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def chat_with_retry(messages, max_retries=3):
    """帶重試機制的聊天函式"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return response.choices[0].message.content
        except OpenAIError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 指數退避
                continue
            else:
                raise

# 使用示例
try:
    result = chat_with_retry(messages)
    print(result)
except OpenAIError as e:
    print(f"API 呼叫失敗：{e}")
```

詳見 [錯誤處理](/wiki/applications/error-handling) 文件。

### 5. 使用流式輸出

對於長文本生成，建議使用流式輸出提升使用者體驗：

```python theme={null}
def stream_chat(messages):
    """流式輸出示例"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True
    )

    full_response = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            full_response += content

    return full_response
```

## 常見問題

### 如何計算 token 數量？

不同模型的 tokenizer 不同，建議使用 `tiktoken` 庫估算：

```python theme={null}
import tiktoken

def count_tokens(text, model="gpt-4o"):
    """估算文本的 token 數量"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 使用示例
text = "你好，世界！"
tokens = count_tokens(text)
print(f"Token 數量：{tokens}")
```

### 為什麼輸出被截斷了？

可能的原因：

1. 達到了 `max_tokens` 限制
2. 模型的上下文視窗不足
3. 觸發了內容安全策略

解決方法：

* 增加 `max_tokens` 引數
* 選擇支援更長上下文的模型
* 檢查 `finish_reason` 欄位判斷原因

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=2000  # 增加輸出長度限制
)

finish_reason = response.choices[0].finish_reason
if finish_reason == "length":
    print("輸出因長度限制被截斷")
elif finish_reason == "content_filter":
    print("輸出因內容安全被過濾")
```

### 如何實現對話記憶？

在應用層維護對話歷史：

```python theme={null}
class ChatSession:
    def __init__(self, system_prompt=""):
        self.messages = []
        if system_prompt:
            self.messages.append({"role": "system", "content": system_prompt})

    def chat(self, user_message):
        """傳送訊息並記錄對話"""
        self.messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=self.messages
        )

        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

# 使用示例
session = ChatSession(system_prompt="你是一個友好的助手")
print(session.chat("你好"))
print(session.chat("我剛才說了什麼？"))  # AI 可以記住上下文
```

## 相關文件

<CardGroup cols={2}>
  <Card title="模型資訊" icon="database" href="/zh-Hant/api-capabilities/model-info">
    檢視支援的所有模型及定價
  </Card>

  <Card title="文本嵌入" icon="vector-square" href="/zh-Hant/api-capabilities/text-embedding">
    將文本轉換為向量表示
  </Card>

  <Card title="流式輸出" icon="zap" href="/wiki/applications/streaming-output">
    實現打字機效果的流式響應
  </Card>

  <Card title="錯誤處理" icon="triangle-alert" href="/wiki/applications/error-handling">
    處理 API 呼叫異常
  </Card>
</CardGroup>
