> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文本稽核（Moderation）

> 使用 AI 模型檢測文本內容是否包含違規、有害、不適當內容，保障平臺內容安全

## 功能概述

文本稽核（Moderation）API 基於先進的 AI 模型，能夠自動檢測和識別文本內容中的潛在風險，幫助你構建安全、合規的應用程式。

<Info>
  支援 OpenAI Moderation 模型及其他主流內容稽核模型，準確率高，響應速度快。
</Info>

### 主要能力

<CardGroup cols={2}>
  <Card title="違規內容檢測" icon="ban">
    識別暴力、色情、仇恨等違規內容
  </Card>

  <Card title="有害資訊過濾" icon="triangle-alert">
    檢測自殘、騷擾、欺詐等有害資訊
  </Card>

  <Card title="多語言支援" icon="languages">
    支援中文、英文等多語言內容稽核
  </Card>

  <Card title="細粒度分類" icon="tags">
    提供詳細的違規類別和置信度評分
  </Card>
</CardGroup>

## 快速開始

### 基礎呼叫示例

使用 Moderation API 檢測文本內容是否違規：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.moderations.create(
    model="omni-moderation-latest",
    input="這是一段需要檢測的文本內容"
)

result = response.results[0]
if result.flagged:
    print("⚠️ 檢測到違規內容")
    print(f"違規類別：{result.categories}")
else:
    print("✅ 內容安全")
```

### 批次檢測示例

一次性檢測多段文本：

```python theme={null}
texts = [
    "這是第一段文本",
    "這是第二段文本",
    "這是第三段文本"
]

response = client.moderations.create(
    model="omni-moderation-latest",
    input=texts
)

for i, result in enumerate(response.results):
    print(f"文本 {i+1}：{'違規' if result.flagged else '安全'}")
```

## 稽核類別

### OpenAI Moderation 支援的類別

| 類別                       | 說明      | 示例                |
| ------------------------ | ------- | ----------------- |
| `hate`                   | 仇恨言論    | 基於種族、性別、宗教等的歧視性內容 |
| `hate/threatening`       | 威脅性仇恨言論 | 包含暴力威脅的仇恨內容       |
| `harassment`             | 騷擾      | 侮辱、嘲諷、人身攻擊        |
| `harassment/threatening` | 威脅性騷擾   | 包含威脅的騷擾內容         |
| `self-harm`              | 自殘      | 鼓勵、美化自殘行為         |
| `self-harm/intent`       | 自殘意圖    | 表達自殘意圖的內容         |
| `self-harm/instructions` | 自殘指導    | 提供自殘方法的內容         |
| `sexual`                 | 性相關內容   | 成人內容、色情描述         |
| `sexual/minors`          | 未成年性內容  | 涉及未成年人的性相關內容      |
| `violence`               | 暴力      | 暴力行為、血腥場面         |
| `violence/graphic`       | 血腥暴力    | 詳細的暴力、血腥描述        |

<Warning>
  不同模型支援的稽核類別可能有所不同，請根據實際需求選擇合適的模型。
</Warning>

## 返回結果詳解

### 響應結構

```json theme={null}
{
  "id": "modr-xxxxx",
  "model": "omni-moderation-latest",
  "results": [
    {
      "flagged": true,
      "categories": {
        "hate": false,
        "hate/threatening": false,
        "harassment": false,
        "harassment/threatening": false,
        "self-harm": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        "sexual": false,
        "sexual/minors": false,
        "violence": true,
        "violence/graphic": false
      },
      "category_scores": {
        "hate": 0.0001,
        "hate/threatening": 0.0001,
        "harassment": 0.0002,
        "harassment/threatening": 0.0001,
        "self-harm": 0.0001,
        "self-harm/intent": 0.0001,
        "self-harm/instructions": 0.0001,
        "sexual": 0.0001,
        "sexual/minors": 0.0001,
        "violence": 0.9876,
        "violence/graphic": 0.1234
      }
    }
  ]
}
```

### 欄位說明

<CardGroup cols={3}>
  <Card title="flagged" icon="flag">
    布林值，是否檢測到違規內容
  </Card>

  <Card title="categories" icon="folder">
    各類別的二元判斷結果
  </Card>

  <Card title="category_scores" icon="chart-line">
    各類別的置信度評分（0-1）
  </Card>
</CardGroup>

## 整合示例

### 聊天內容稽核

在聊天應用中整合內容稽核：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def moderate_message(user_message):
    """稽核使用者訊息"""
    # 1. 先稽核內容
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=user_message
    )

    result = moderation.results[0]

    # 2. 如果違規，拒絕處理
    if result.flagged:
        violated_categories = [
            category for category, flagged in result.categories.items()
            if flagged
        ]
        return {
            "success": False,
            "error": f"檢測到違規內容：{', '.join(violated_categories)}",
            "message": "您的訊息包含不適當內容，請修改後重試"
        }

    # 3. 內容安全，繼續處理
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    return {
        "success": True,
        "reply": response.choices[0].message.content
    }

# 使用示例
user_input = "幫我寫一篇關於人工智慧的文章"
result = moderate_message(user_input)

if result["success"]:
    print(result["reply"])
else:
    print(result["message"])
```

### UGC（使用者生成內容）過濾

在論壇、評論區等場景過濾使用者內容：

```python theme={null}
def review_ugc(content):
    """稽核使用者生成內容"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=content
    )

    result = moderation.results[0]

    if not result.flagged:
        return {"status": "approved", "action": "釋出"}

    # 分析違規嚴重程度
    max_score = max(result.category_scores.values())

    if max_score > 0.9:
        return {"status": "rejected", "action": "拒絕釋出"}
    elif max_score > 0.7:
        return {"status": "pending", "action": "人工複審"}
    else:
        return {"status": "approved_with_warning", "action": "釋出並標記"}

# 使用示例
ugc_content = "這是一條使用者評論..."
review_result = review_ugc(ugc_content)
print(f"稽核結果：{review_result['action']}")
```

### AI 生成內容稽核

對 AI 生成的內容進行二次稽核：

```python theme={null}
def generate_safe_content(prompt):
    """生成內容並稽核"""
    # 1. 先稽核使用者輸入
    input_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=prompt
    )

    if input_moderation.results[0].flagged:
        return "您的請求包含不適當內容，無法處理"

    # 2. 生成內容
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )

    generated_content = response.choices[0].message.content

    # 3. 稽核生成的內容
    output_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=generated_content
    )

    if output_moderation.results[0].flagged:
        return "生成的內容不符合安全規範，已被過濾"

    return generated_content

# 使用示例
result = generate_safe_content("寫一個兒童故事")
print(result)
```

## 高階用法

### 自定義稽核閾值

根據業務需求調整稽核嚴格程度：

```python theme={null}
def custom_moderation(text, threshold=0.5):
    """自定義稽核閾值"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # 使用自定義閾值判斷
    flagged_categories = []
    for category, score in result.category_scores.items():
        if score > threshold:
            flagged_categories.append({
                "category": category,
                "score": score,
                "severity": "high" if score > 0.8 else "medium"
            })

    return {
        "flagged": len(flagged_categories) > 0,
        "violations": flagged_categories
    }

# 使用示例
result = custom_moderation("這是測試文本", threshold=0.3)
if result["flagged"]:
    for violation in result["violations"]:
        print(f"{violation['category']}: {violation['score']:.2f} ({violation['severity']})")
```

### 稽核日誌記錄

記錄稽核歷史，用於分析和改進：

```python theme={null}
import json
from datetime import datetime

def moderate_with_logging(text, user_id=None):
    """帶日誌記錄的稽核"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # 記錄稽核日誌
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "text_length": len(text),
        "flagged": result.flagged,
        "categories": {k: v for k, v in result.categories.items() if v},
        "max_score": max(result.category_scores.values())
    }

    # 儲存到日誌檔案
    with open("moderation_logs.jsonl", "a") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")

    return result.flagged

# 使用示例
is_flagged = moderate_with_logging("測試文本", user_id="user_123")
```

### 多模型聯合稽核

結合多個稽核模型提高準確性：

```python theme={null}
def multi_model_moderation(text):
    """使用多個模型進行稽核"""
    models = ["omni-moderation-latest", "text-moderation-stable"]
    results = []

    for model in models:
        try:
            moderation = client.moderations.create(
                model=model,
                input=text
            )
            results.append(moderation.results[0])
        except Exception as e:
            print(f"模型 {model} 呼叫失敗：{e}")

    # 如果任一模型判定為違規，則認為違規
    flagged = any(r.flagged for r in results)

    return {
        "flagged": flagged,
        "model_count": len(results),
        "results": results
    }
```

## 最佳實踐

### 1. 雙向稽核

<CardGroup cols={2}>
  <Card title="輸入稽核" icon="log-in">
    稽核使用者輸入，防止惡意請求
  </Card>

  <Card title="輸出稽核" icon="log-out">
    稽核 AI 生成內容，確保輸出安全
  </Card>
</CardGroup>

```python theme={null}
def safe_chat(user_message):
    """雙向稽核的聊天"""
    # 輸入稽核
    if moderate_text(user_message):
        return "您的訊息包含不適當內容"

    # 生成回覆
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    reply = response.choices[0].message.content

    # 輸出稽核
    if moderate_text(reply):
        return "AI 生成的內容未通過安全稽核"

    return reply
```

### 2. 非同步稽核

對於非即時場景，使用非同步稽核提升效能：

```python theme={null}
import asyncio
from openai import AsyncOpenAI

async_client = AsyncOpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

async def async_moderate(texts):
    """非同步批次稽核"""
    tasks = [
        async_client.moderations.create(
            model="omni-moderation-latest",
            input=text
        )
        for text in texts
    ]

    results = await asyncio.gather(*tasks)
    return [r.results[0].flagged for r in results]

# 使用示例
texts = ["文本1", "文本2", "文本3"]
flagged_list = asyncio.run(async_moderate(texts))
```

### 3. 快取稽核結果

對於相同內容，快取稽核結果減少 API 呼叫：

```python theme={null}
import hashlib
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_moderate(text_hash):
    """快取稽核結果"""
    # 實際的稽核邏輯
    pass

def moderate_with_cache(text):
    """帶快取的稽核"""
    text_hash = hashlib.md5(text.encode()).hexdigest()
    return cached_moderate(text_hash)
```

### 4. 分級處理

根據違規程度採取不同措施：

```python theme={null}
def handle_moderation_result(text, result):
    """分級處理稽核結果"""
    if not result.flagged:
        return {"action": "allow", "message": "內容安全"}

    max_score = max(result.category_scores.values())

    if max_score > 0.95:
        return {"action": "block", "message": "嚴重違規，直接拒絕"}
    elif max_score > 0.8:
        return {"action": "review", "message": "疑似違規，人工複審"}
    elif max_score > 0.5:
        return {"action": "warn", "message": "輕微違規，提示使用者"}
    else:
        return {"action": "allow", "message": "可能誤判，放行"}
```

## 常見問題

### 稽核是否支援中文？

支援。OpenAI Moderation 和其他主流稽核模型都支援中文內容稽核，準確率與英文相當。

### 稽核延遲是多少？

通常在 100-500ms 之間，具體取決於：

* 文本長度
* 模型選擇
* 網路狀況

### 如何處理誤判？

建議採取分級策略：

1. 高置信度違規：直接拒絕
2. 中等置信度：人工複審
3. 低置信度：放行或提示

### 稽核是否收費？

OpenAI Moderation API 目前免費，其他模型可能收費，詳見 [定價說明](/zh-Hant/pricing)。

### 可以稽核圖片和影片嗎？

當前 Moderation API 主要針對文本內容。圖片和影片稽核需要使用專門的多模態稽核模型。

## 相關文件

<CardGroup cols={2}>
  <Card title="文本生成" icon="messages-square" href="/zh-Hant/api-capabilities/text-generation">
    Chat Completions API 文件
  </Card>

  <Card title="內容安全" icon="shield" href="/zh-Hant/faq/content-safety">
    平臺內容安全政策
  </Card>

  <Card title="錯誤處理" icon="triangle-alert" href="/wiki/applications/error-handling">
    API 錯誤處理最佳實踐
  </Card>

  <Card title="定價說明" icon="dollar-sign" href="/zh-Hant/pricing">
    稽核 API 定價詳情
  </Card>
</CardGroup>
