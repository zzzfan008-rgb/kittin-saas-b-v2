> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text Moderation

> Use AI models to detect whether text content contains violations, harmful, or inappropriate content to ensure platform content safety

## Overview

The Text Moderation API uses advanced AI models to automatically detect and identify potential risks in text content, helping you build safe and compliant applications.

<Info>
  Supports OpenAI Moderation models and other mainstream content moderation models with high accuracy and fast response.
</Info>

### Key Capabilities

<CardGroup cols={2}>
  <Card title="Violation Detection" icon="ban">
    Identify violations like violence, pornography, and hate
  </Card>

  <Card title="Harmful Content Filter" icon="triangle-alert">
    Detect harmful information like self-harm, harassment, fraud
  </Card>

  <Card title="Multilingual Support" icon="languages">
    Support moderation in Chinese, English, and other languages
  </Card>

  <Card title="Fine-grained Classification" icon="tags">
    Provide detailed violation categories and confidence scores
  </Card>
</CardGroup>

## Quick Start

### Basic API Call

Use the Moderation API to detect if text content violates policies:

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

### Batch Detection Example

Detect multiple texts at once:

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

## Moderation Categories

### OpenAI Moderation Supported Categories

| Category                 | Description             | Examples                                                     |
| ------------------------ | ----------------------- | ------------------------------------------------------------ |
| `hate`                   | Hate speech             | Discriminatory content based on race, gender, religion, etc. |
| `hate/threatening`       | Threatening hate speech | Hate content with violent threats                            |
| `harassment`             | Harassment              | Insults, mockery, personal attacks                           |
| `harassment/threatening` | Threatening harassment  | Harassment with threats                                      |
| `self-harm`              | Self-harm               | Encouraging or glorifying self-harm                          |
| `self-harm/intent`       | Self-harm intent        | Content expressing self-harm intentions                      |
| `self-harm/instructions` | Self-harm instructions  | Content providing self-harm methods                          |
| `sexual`                 | Sexual content          | Adult content, pornographic descriptions                     |
| `sexual/minors`          | Minor sexual content    | Sexual content involving minors                              |
| `violence`               | Violence                | Violent acts, bloody scenes                                  |
| `violence/graphic`       | Graphic violence        | Detailed violence, bloody descriptions                       |

<Warning>
  Different models may support different moderation categories. Please choose the appropriate model based on your needs.
</Warning>

## Response Structure

### Response Format

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

### Field Descriptions

<CardGroup cols={3}>
  <Card title="flagged" icon="flag">
    Boolean indicating if violations detected
  </Card>

  <Card title="categories" icon="folder">
    Binary judgment results for each category
  </Card>

  <Card title="category_scores" icon="chart-line">
    Confidence scores for each category (0-1)
  </Card>
</CardGroup>

## Integration Examples

### Chat Content Moderation

Integrate content moderation in chat applications:

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

### UGC (User-Generated Content) Filtering

Filter user content in forums, comments, etc.:

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

### AI-Generated Content Moderation

Secondary moderation for AI-generated content:

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

## Advanced Usage

### Custom Moderation Thresholds

Adjust moderation strictness based on business needs:

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

### Moderation Logging

Record moderation history for analysis and improvement:

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

### Multi-Model Joint Moderation

Combine multiple moderation models for higher accuracy:

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

## Best Practices

### 1. Bidirectional Moderation

<CardGroup cols={2}>
  <Card title="Input Moderation" icon="log-in">
    Moderate user input to prevent malicious requests
  </Card>

  <Card title="Output Moderation" icon="log-out">
    Moderate AI-generated content to ensure safe output
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

### 2. Asynchronous Moderation

Use asynchronous moderation for non-real-time scenarios to improve performance:

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

### 3. Cache Moderation Results

Cache moderation results for identical content to reduce API calls:

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

### 4. Tiered Handling

Take different actions based on violation severity:

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

## FAQ

### Does moderation support Chinese?

Yes. OpenAI Moderation and other mainstream moderation models support Chinese content moderation with accuracy comparable to English.

### What is the moderation latency?

Typically between 100-500ms, depending on:

* Text length
* Model selection
* Network conditions

### How to handle false positives?

Recommend a tiered strategy:

1. High confidence violations: Direct rejection
2. Medium confidence: Manual review
3. Low confidence: Allow or warn

### Is moderation charged?

OpenAI Moderation API is currently free. Other models may charge fees. See [Pricing](/en/pricing) for details.

### Can images and videos be moderated?

Current Moderation API mainly targets text content. Image and video moderation require specialized multimodal moderation models.

## Related Documentation

<CardGroup cols={2}>
  <Card title="Text Generation" icon="messages-square" href="/en/api-capabilities/text-generation">
    Chat Completions API documentation
  </Card>

  <Card title="Content Safety" icon="shield" href="/en/faq/content-safety">
    Platform content safety policies
  </Card>

  <Card title="Pricing" icon="dollar-sign" href="/en/pricing">
    Moderation API pricing details
  </Card>
</CardGroup>
