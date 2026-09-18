> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文本审核（Moderation）

> 使用 AI 模型检测文本内容是否包含违规、有害、不适当内容，保障平台内容安全

## 功能概述

文本审核（Moderation）API 基于先进的 AI 模型，能够自动检测和识别文本内容中的潜在风险，帮助你构建安全、合规的应用程序。

<Info>
  支持 OpenAI Moderation 模型及其他主流内容审核模型，准确率高，响应速度快。
</Info>

### 主要能力

<CardGroup cols={2}>
  <Card title="违规内容检测" icon="ban">
    识别暴力、色情、仇恨等违规内容
  </Card>

  <Card title="有害信息过滤" icon="triangle-alert">
    检测自残、骚扰、欺诈等有害信息
  </Card>

  <Card title="多语言支持" icon="languages">
    支持中文、英文等多语言内容审核
  </Card>

  <Card title="细粒度分类" icon="tags">
    提供详细的违规类别和置信度评分
  </Card>
</CardGroup>

## 快速开始

### 基础调用示例

使用 Moderation API 检测文本内容是否违规：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.moderations.create(
    model="omni-moderation-latest",
    input="这是一段需要检测的文本内容"
)

result = response.results[0]
if result.flagged:
    print("⚠️ 检测到违规内容")
    print(f"违规类别：{result.categories}")
else:
    print("✅ 内容安全")
```

### 批量检测示例

一次性检测多段文本：

```python theme={null}
texts = [
    "这是第一段文本",
    "这是第二段文本",
    "这是第三段文本"
]

response = client.moderations.create(
    model="omni-moderation-latest",
    input=texts
)

for i, result in enumerate(response.results):
    print(f"文本 {i+1}：{'违规' if result.flagged else '安全'}")
```

## 审核类别

### OpenAI Moderation 支持的类别

| 类别                       | 说明      | 示例                |
| ------------------------ | ------- | ----------------- |
| `hate`                   | 仇恨言论    | 基于种族、性别、宗教等的歧视性内容 |
| `hate/threatening`       | 威胁性仇恨言论 | 包含暴力威胁的仇恨内容       |
| `harassment`             | 骚扰      | 侮辱、嘲讽、人身攻击        |
| `harassment/threatening` | 威胁性骚扰   | 包含威胁的骚扰内容         |
| `self-harm`              | 自残      | 鼓励、美化自残行为         |
| `self-harm/intent`       | 自残意图    | 表达自残意图的内容         |
| `self-harm/instructions` | 自残指导    | 提供自残方法的内容         |
| `sexual`                 | 性相关内容   | 成人内容、色情描述         |
| `sexual/minors`          | 未成年性内容  | 涉及未成年人的性相关内容      |
| `violence`               | 暴力      | 暴力行为、血腥场面         |
| `violence/graphic`       | 血腥暴力    | 详细的暴力、血腥描述        |

<Warning>
  不同模型支持的审核类别可能有所不同，请根据实际需求选择合适的模型。
</Warning>

## 返回结果详解

### 响应结构

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

### 字段说明

<CardGroup cols={3}>
  <Card title="flagged" icon="flag">
    布尔值，是否检测到违规内容
  </Card>

  <Card title="categories" icon="folder">
    各类别的二元判断结果
  </Card>

  <Card title="category_scores" icon="chart-line">
    各类别的置信度评分（0-1）
  </Card>
</CardGroup>

## 集成示例

### 聊天内容审核

在聊天应用中集成内容审核：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def moderate_message(user_message):
    """审核用户消息"""
    # 1. 先审核内容
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=user_message
    )

    result = moderation.results[0]

    # 2. 如果违规，拒绝处理
    if result.flagged:
        violated_categories = [
            category for category, flagged in result.categories.items()
            if flagged
        ]
        return {
            "success": False,
            "error": f"检测到违规内容：{', '.join(violated_categories)}",
            "message": "您的消息包含不适当内容，请修改后重试"
        }

    # 3. 内容安全，继续处理
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    return {
        "success": True,
        "reply": response.choices[0].message.content
    }

# 使用示例
user_input = "帮我写一篇关于人工智能的文章"
result = moderate_message(user_input)

if result["success"]:
    print(result["reply"])
else:
    print(result["message"])
```

### UGC（用户生成内容）过滤

在论坛、评论区等场景过滤用户内容：

```python theme={null}
def review_ugc(content):
    """审核用户生成内容"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=content
    )

    result = moderation.results[0]

    if not result.flagged:
        return {"status": "approved", "action": "发布"}

    # 分析违规严重程度
    max_score = max(result.category_scores.values())

    if max_score > 0.9:
        return {"status": "rejected", "action": "拒绝发布"}
    elif max_score > 0.7:
        return {"status": "pending", "action": "人工复审"}
    else:
        return {"status": "approved_with_warning", "action": "发布并标记"}

# 使用示例
ugc_content = "这是一条用户评论..."
review_result = review_ugc(ugc_content)
print(f"审核结果：{review_result['action']}")
```

### AI 生成内容审核

对 AI 生成的内容进行二次审核：

```python theme={null}
def generate_safe_content(prompt):
    """生成内容并审核"""
    # 1. 先审核用户输入
    input_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=prompt
    )

    if input_moderation.results[0].flagged:
        return "您的请求包含不适当内容，无法处理"

    # 2. 生成内容
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )

    generated_content = response.choices[0].message.content

    # 3. 审核生成的内容
    output_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=generated_content
    )

    if output_moderation.results[0].flagged:
        return "生成的内容不符合安全规范，已被过滤"

    return generated_content

# 使用示例
result = generate_safe_content("写一个儿童故事")
print(result)
```

## 高级用法

### 自定义审核阈值

根据业务需求调整审核严格程度：

```python theme={null}
def custom_moderation(text, threshold=0.5):
    """自定义审核阈值"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # 使用自定义阈值判断
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
result = custom_moderation("这是测试文本", threshold=0.3)
if result["flagged"]:
    for violation in result["violations"]:
        print(f"{violation['category']}: {violation['score']:.2f} ({violation['severity']})")
```

### 审核日志记录

记录审核历史，用于分析和改进：

```python theme={null}
import json
from datetime import datetime

def moderate_with_logging(text, user_id=None):
    """带日志记录的审核"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # 记录审核日志
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "text_length": len(text),
        "flagged": result.flagged,
        "categories": {k: v for k, v in result.categories.items() if v},
        "max_score": max(result.category_scores.values())
    }

    # 保存到日志文件
    with open("moderation_logs.jsonl", "a") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")

    return result.flagged

# 使用示例
is_flagged = moderate_with_logging("测试文本", user_id="user_123")
```

### 多模型联合审核

结合多个审核模型提高准确性：

```python theme={null}
def multi_model_moderation(text):
    """使用多个模型进行审核"""
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
            print(f"模型 {model} 调用失败：{e}")

    # 如果任一模型判定为违规，则认为违规
    flagged = any(r.flagged for r in results)

    return {
        "flagged": flagged,
        "model_count": len(results),
        "results": results
    }
```

## 最佳实践

### 1. 双向审核

<CardGroup cols={2}>
  <Card title="输入审核" icon="log-in">
    审核用户输入，防止恶意请求
  </Card>

  <Card title="输出审核" icon="log-out">
    审核 AI 生成内容，确保输出安全
  </Card>
</CardGroup>

```python theme={null}
def safe_chat(user_message):
    """双向审核的聊天"""
    # 输入审核
    if moderate_text(user_message):
        return "您的消息包含不适当内容"

    # 生成回复
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    reply = response.choices[0].message.content

    # 输出审核
    if moderate_text(reply):
        return "AI 生成的内容未通过安全审核"

    return reply
```

### 2. 异步审核

对于非实时场景，使用异步审核提升性能：

```python theme={null}
import asyncio
from openai import AsyncOpenAI

async_client = AsyncOpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

async def async_moderate(texts):
    """异步批量审核"""
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

### 3. 缓存审核结果

对于相同内容，缓存审核结果减少 API 调用：

```python theme={null}
import hashlib
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_moderate(text_hash):
    """缓存审核结果"""
    # 实际的审核逻辑
    pass

def moderate_with_cache(text):
    """带缓存的审核"""
    text_hash = hashlib.md5(text.encode()).hexdigest()
    return cached_moderate(text_hash)
```

### 4. 分级处理

根据违规程度采取不同措施：

```python theme={null}
def handle_moderation_result(text, result):
    """分级处理审核结果"""
    if not result.flagged:
        return {"action": "allow", "message": "内容安全"}

    max_score = max(result.category_scores.values())

    if max_score > 0.95:
        return {"action": "block", "message": "严重违规，直接拒绝"}
    elif max_score > 0.8:
        return {"action": "review", "message": "疑似违规，人工复审"}
    elif max_score > 0.5:
        return {"action": "warn", "message": "轻微违规，提示用户"}
    else:
        return {"action": "allow", "message": "可能误判，放行"}
```

## 常见问题

### 审核是否支持中文？

支持。OpenAI Moderation 和其他主流审核模型都支持中文内容审核，准确率与英文相当。

### 审核延迟是多少？

通常在 100-500ms 之间，具体取决于：

* 文本长度
* 模型选择
* 网络状况

### 如何处理误判？

建议采取分级策略：

1. 高置信度违规：直接拒绝
2. 中等置信度：人工复审
3. 低置信度：放行或提示

### 审核是否收费？

OpenAI Moderation API 目前免费，其他模型可能收费，详见 [定价说明](/pricing)。

### 可以审核图片和视频吗？

当前 Moderation API 主要针对文本内容。图片和视频审核需要使用专门的多模态审核模型。

## 相关文档

<CardGroup cols={2}>
  <Card title="文本生成" icon="messages-square" href="/api-capabilities/text-generation">
    Chat Completions API 文档
  </Card>

  <Card title="内容安全" icon="shield" href="/faq/content-safety">
    平台内容安全政策
  </Card>

  <Card title="错误处理" icon="triangle-alert" href="/wiki/applications/error-handling">
    API 错误处理最佳实践
  </Card>

  <Card title="定价说明" icon="dollar-sign" href="/pricing">
    审核 API 定价详情
  </Card>
</CardGroup>
