> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트 모더레이션

> AI 모델을 사용해 텍스트 콘텐츠에 규정 위반, 유해 또는 부적절한 콘텐츠가 포함되어 있는지 탐지하여 플랫폼 콘텐츠 안전성을 보장합니다

## 개요

텍스트 모더레이션 API는 고급 AI 모델을 사용하여 텍스트 콘텐츠의 잠재적 위험을 자동으로 탐지하고 식별함으로써 안전하고 규정을 준수하는 애플리케이션을 구축할 수 있도록 돕습니다.

<Info>
  OpenAI Moderation 모델 및 기타 주류 콘텐츠 모더레이션 모델을 높은 정확도와 빠른 응답으로 지원합니다.
</Info>

### 주요 기능

<CardGroup cols={2}>
  <Card title="위반 탐지" icon="ban">
    폭력, 음란물, 혐오와 같은 위반을 식별합니다
  </Card>

  <Card title="유해 콘텐츠 필터" icon="triangle-alert">
    자해, 괴롭힘, 사기와 같은 유해 정보를 탐지합니다
  </Card>

  <Card title="다국어 지원" icon="languages">
    중국어, 영어 및 기타 언어의 모더레이션을 지원합니다
  </Card>

  <Card title="세분화된 분류" icon="tags">
    상세한 위반 범주와 신뢰도 점수를 제공합니다
  </Card>
</CardGroup>

## 빠른 시작

### 기본 API 호출

Moderation API를 사용하여 텍스트 콘텐츠가 정책을 위반하는지 감지합니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.moderations.create(
    model="omni-moderation-latest",
    input="This is a text to be checked"
)

result = response.results[0]
if result.flagged:
    print("⚠️ Violation detected")
    print(f"Categories: {result.categories}")
else:
    print("✅ Content is safe")
```

### 배치 감지 예시

여러 텍스트를 한 번에 감지합니다:

```python theme={null}
texts = [
    "This is the first text",
    "This is the second text",
    "This is the third text"
]

response = client.moderations.create(
    model="omni-moderation-latest",
    input=texts
)

for i, result in enumerate(response.results):
    print(f"Text {i+1}: {'Flagged' if result.flagged else 'Safe'}")
```

## 모더레이션 카테고리

### OpenAI 모더레이션 지원 카테고리

| Category                 | Description | Examples                  |
| ------------------------ | ----------- | ------------------------- |
| `hate`                   | 혐오 발언       | 인종, 성별, 종교 등에 기반한 차별적 콘텐츠 |
| `hate/threatening`       | 위협적인 혐오 발언  | 폭력적 위협이 포함된 혐오 콘텐츠        |
| `harassment`             | 괴롭힘         | 모욕, 조롱, 인신공격              |
| `harassment/threatening` | 위협적인 괴롭힘    | 위협이 포함된 괴롭힘               |
| `self-harm`              | 자해          | 자해를 조장하거나 미화하는 콘텐츠        |
| `self-harm/intent`       | 자해 의도       | 자해 의도를 표현하는 콘텐츠           |
| `self-harm/instructions` | 자해 방법 안내    | 자해 방법을 제공하는 콘텐츠           |
| `sexual`                 | 성적 콘텐츠      | 성인 콘텐츠, 음란한 설명            |
| `sexual/minors`          | 미성년자 성적 콘텐츠 | 미성년자가 관련된 성적 콘텐츠          |
| `violence`               | 폭력          | 폭력 행위, 유혈 장면              |
| `violence/graphic`       | 적나라한 폭력     | 상세한 폭력, 유혈 묘사             |

<Warning>
  모델에 따라 지원하는 모더레이션 카테고리가 다를 수 있습니다. 필요에 맞는 적절한 모델을 선택하시기 바랍니다.
</Warning>

## 응답 구조

### 응답 형식

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

### 필드 설명

<CardGroup cols={3}>
  <Card title="flagged" icon="flag">
    위반이 감지되었는지 나타내는 불리언
  </Card>

  <Card title="categories" icon="folder">
    각 카테고리에 대한 이진 판정 결과
  </Card>

  <Card title="category_scores" icon="chart-line">
    각 카테고리에 대한 신뢰도 점수 (0-1)
  </Card>
</CardGroup>

## 통합 예시

### 채팅 콘텐츠 모더레이션

채팅 애플리케이션에 콘텐츠 모더레이션을 통합합니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def moderate_message(user_message):
    """Moderate user message"""
    # 1. Moderate content first
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=user_message
    )

    result = moderation.results[0]

    # 2. If flagged, reject processing
    if result.flagged:
        violated_categories = [
            category for category, flagged in result.categories.items()
            if flagged
        ]
        return {
            "success": False,
            "error": f"Violations detected: {', '.join(violated_categories)}",
            "message": "Your message contains inappropriate content. Please revise and retry."
        }

    # 3. Content is safe, continue processing
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    return {
        "success": True,
        "reply": response.choices[0].message.content
    }

# Usage example
user_input = "Help me write an article about artificial intelligence"
result = moderate_message(user_input)

if result["success"]:
    print(result["reply"])
else:
    print(result["message"])
```

### UGC(사용자 생성 콘텐츠) 필터링

포럼, 댓글 등에서 사용자 콘텐츠를 필터링합니다:

```python theme={null}
def review_ugc(content):
    """Review user-generated content"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=content
    )

    result = moderation.results[0]

    if not result.flagged:
        return {"status": "approved", "action": "Publish"}

    # Analyze violation severity
    max_score = max(result.category_scores.values())

    if max_score > 0.9:
        return {"status": "rejected", "action": "Reject"}
    elif max_score > 0.7:
        return {"status": "pending", "action": "Manual Review"}
    else:
        return {"status": "approved_with_warning", "action": "Publish with Flag"}

# Usage example
ugc_content = "This is a user comment..."
review_result = review_ugc(ugc_content)
print(f"Review result: {review_result['action']}")
```

### AI 생성 콘텐츠 모더레이션

AI 생성 콘텐츠에 대한 2차 모더레이션입니다:

```python theme={null}
def generate_safe_content(prompt):
    """Generate and moderate content"""
    # 1. Moderate user input first
    input_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=prompt
    )

    if input_moderation.results[0].flagged:
        return "Your request contains inappropriate content and cannot be processed"

    # 2. Generate content
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )

    generated_content = response.choices[0].message.content

    # 3. Moderate generated content
    output_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=generated_content
    )

    if output_moderation.results[0].flagged:
        return "Generated content does not meet safety standards and has been filtered"

    return generated_content

# Usage example
result = generate_safe_content("Write a children's story")
print(result)
```

## 고급 사용법

### 사용자 지정 모더레이션 임계값

비즈니스 요구에 따라 모더레이션 엄격도를 조정합니다:

```python theme={null}
def custom_moderation(text, threshold=0.5):
    """Custom moderation threshold"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # Use custom threshold for judgment
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

# Usage example
result = custom_moderation("This is test text", threshold=0.3)
if result["flagged"]:
    for violation in result["violations"]:
        print(f"{violation['category']}: {violation['score']:.2f} ({violation['severity']})")
```

### 모더레이션 로그 기록

분석 및 개선을 위해 모더레이션 이력을 기록합니다:

```python theme={null}
import json
from datetime import datetime

def moderate_with_logging(text, user_id=None):
    """Moderation with logging"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # Record moderation log
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "text_length": len(text),
        "flagged": result.flagged,
        "categories": {k: v for k, v in result.categories.items() if v},
        "max_score": max(result.category_scores.values())
    }

    # Save to log file
    with open("moderation_logs.jsonl", "a") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")

    return result.flagged

# Usage example
is_flagged = moderate_with_logging("Test text", user_id="user_123")
```

### 다중 모델 공동 모더레이션

더 높은 정확도를 위해 여러 모더레이션 모델을 결합합니다:

```python theme={null}
def multi_model_moderation(text):
    """Moderate using multiple models"""
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
            print(f"Model {model} call failed: {e}")

    # If any model flags as violation, consider it a violation
    flagged = any(r.flagged for r in results)

    return {
        "flagged": flagged,
        "model_count": len(results),
        "results": results
    }
```

## 모범 사례

### 1. 양방향 모더레이션

<CardGroup cols={2}>
  <Card title="Input Moderation" icon="log-in">
    악의적인 요청을 방지하기 위해 사용자 입력을 모더레이션합니다
  </Card>

  <Card title="Output Moderation" icon="log-out">
    안전한 출력을 보장하기 위해 AI 생성 콘텐츠를 모더레이션합니다
  </Card>
</CardGroup>

```python theme={null}
def safe_chat(user_message):
    """Chat with bidirectional moderation"""
    # Input moderation
    if moderate_text(user_message):
        return "Your message contains inappropriate content"

    # Generate reply
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    reply = response.choices[0].message.content

    # Output moderation
    if moderate_text(reply):
        return "AI-generated content did not pass safety review"

    return reply
```

### 2. 비동기 모더레이션

실시간이 아닌 시나리오에서는 성능 향상을 위해 비동기 모더레이션을 사용합니다:

```python theme={null}
import asyncio
from openai import AsyncOpenAI

async_client = AsyncOpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

async def async_moderate(texts):
    """Asynchronous batch moderation"""
    tasks = [
        async_client.moderations.create(
            model="omni-moderation-latest",
            input=text
        )
        for text in texts
    ]

    results = await asyncio.gather(*tasks)
    return [r.results[0].flagged for r in results]

# Usage example
texts = ["Text 1", "Text 2", "Text 3"]
flagged_list = asyncio.run(async_moderate(texts))
```

### 3. 모더레이션 결과 캐싱

API 호출을 줄이기 위해 동일한 콘텐츠에 대한 모더레이션 결과를 캐싱합니다:

```python theme={null}
import hashlib
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_moderate(text_hash):
    """Cache moderation results"""
    # Actual moderation logic
    pass

def moderate_with_cache(text):
    """Moderation with caching"""
    text_hash = hashlib.md5(text.encode()).hexdigest()
    return cached_moderate(text_hash)
```

### 4. 단계별 처리

위반 심각도에 따라 다른 조치를 취합니다:

```python theme={null}
def handle_moderation_result(text, result):
    """Tiered handling of moderation results"""
    if not result.flagged:
        return {"action": "allow", "message": "Content is safe"}

    max_score = max(result.category_scores.values())

    if max_score > 0.95:
        return {"action": "block", "message": "Severe violation, directly reject"}
    elif max_score > 0.8:
        return {"action": "review", "message": "Suspected violation, manual review"}
    elif max_score > 0.5:
        return {"action": "warn", "message": "Minor violation, warn user"}
    else:
        return {"action": "allow", "message": "Possible false positive, allow"}
```

## 자주 묻는 질문

### 중국어 모더레이션을 지원합니까?

예. OpenAI Moderation 및 다른 주류 모더레이션 모델은 영어와 비슷한 정확도로 중국어 콘텐츠 모더레이션을 지원합니다.

### 모더레이션 지연 시간은 어느 정도입니까?

일반적으로 100-500ms 사이이며, 다음 요소에 따라 달라집니다:

* 텍스트 길이
* 모델 선택
* 네트워크 상태

### 오탐은 어떻게 처리합니까?

단계적 전략을 권장합니다:

1. 높은 신뢰도의 위반: 즉시 거부
2. 중간 신뢰도: 수동 검토
3. 낮은 신뢰도: 허용하거나 경고

### 모더레이션에 과금됩니까?

OpenAI Moderation API는 현재 무료입니다. 다른 모델은 요금이 부과될 수 있습니다. 자세한 내용은 [가격](/ko/pricing)을 참고하십시오.

### 이미지와 동영상도 모더레이션할 수 있습니까?

현재 Moderation API는 주로 텍스트 콘텐츠를 대상으로 합니다. 이미지 및 동영상 모더레이션에는 전문화된 멀티모달 모더레이션 모델이 필요합니다.

## 관련 문서

<CardGroup cols={2}>
  <Card title="텍스트 생성" icon="messages-square" href="/ko/api-capabilities/text-generation">
    Chat Completions API 문서
  </Card>

  <Card title="콘텐츠 안전" icon="shield" href="/ko/faq/content-safety">
    플랫폼 콘텐츠 안전 정책
  </Card>

  <Card title="요금" icon="dollar-sign" href="/ko/pricing">
    Moderation API 요금 상세
  </Card>
</CardGroup>
