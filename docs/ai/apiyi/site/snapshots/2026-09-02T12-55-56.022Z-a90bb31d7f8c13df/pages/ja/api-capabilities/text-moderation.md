> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストモデレーション

> AIモデルを使用して、テキストコンテンツに違反、有害、または不適切な内容が含まれているかを検出し、プラットフォームのコンテンツ安全性を確保します

## 概要

Text Moderation API は、高度な AI モデルを使用してテキストコンテンツ内の潜在的なリスクを自動的に検出・識別し、安全でコンプライアンスに準拠したアプリケーションの構築を支援します。

<Info>
  OpenAI Moderation モデルやその他の主流なコンテンツモデレーションモデルをサポートし、高い精度と高速な応答を実現します。
</Info>

### 主な機能

<CardGroup cols={2}>
  <Card title="違反検出" icon="ban">
    暴力、ポルノ、ヘイトなどの違反を識別します
  </Card>

  <Card title="有害コンテンツフィルター" icon="triangle-alert">
    自傷行為、嫌がらせ、詐欺などの有害情報を検出します
  </Card>

  <Card title="多言語対応" icon="languages">
    中国語、英語、その他の言語でのモデレーションをサポートします
  </Card>

  <Card title="きめ細かな分類" icon="tags">
    詳細な違反カテゴリと信頼度スコアを提供します
  </Card>
</CardGroup>

## クイックスタート

### 基本API呼び出し

Moderation API を使用して、テキストコンテンツがポリシーに違反しているかを検出します:

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

### バッチ検出の例

複数のテキストを一度に検出します:

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

## モデレーションカテゴリ

### OpenAI Moderation 対応カテゴリ

| カテゴリ                     | 説明          | 例                       |
| ------------------------ | ----------- | ----------------------- |
| `hate`                   | ヘイトスピーチ     | 人種、性別、宗教などに基づく差別的なコンテンツ |
| `hate/threatening`       | 脅迫的なヘイトスピーチ | 暴力的な脅しを含むヘイトコンテンツ       |
| `harassment`             | ハラスメント      | 侮辱、嘲笑、個人攻撃              |
| `harassment/threatening` | 脅迫的なハラスメント  | 脅しを伴うハラスメント             |
| `self-harm`              | 自傷行為        | 自傷行為を促したり、賛美したりする内容     |
| `self-harm/intent`       | 自傷行為の意図     | 自傷行為の意図を示す内容            |
| `self-harm/instructions` | 自傷行為の方法     | 自傷行為の方法を提供する内容          |
| `sexual`                 | 性的コンテンツ     | 成人向けコンテンツ、わいせつな描写       |
| `sexual/minors`          | 未成年の性的コンテンツ | 未成年が関わる性的コンテンツ          |
| `violence`               | 暴力          | 暴力行為、流血シーン              |
| `violence/graphic`       | 生々しい暴力      | 詳細な暴力表現、流血の描写           |

<Warning>
  モデルによってサポートするモデレーションカテゴリは異なる場合があります。ご要件に応じて適切なモデルを選択してください。
</Warning>

## レスポンス構造

### レスポンス形式

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

### フィールドの説明

<CardGroup cols={3}>
  <Card title="flagged" icon="flag">
    違反が検出されたかどうかを示します
  </Card>

  <Card title="categories" icon="folder">
    各カテゴリの二値判定結果です
  </Card>

  <Card title="category_scores" icon="chart-line">
    各カテゴリの信頼度スコアです（0-1）
  </Card>
</CardGroup>

## 統合例

### チャットコンテンツのモデレーション

チャットアプリケーションにコンテンツモデレーションを統合します:

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

### UGC（ユーザー生成コンテンツ）のフィルタリング

フォーラムやコメントなどでユーザーコンテンツをフィルタリングします:

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

### AI生成コンテンツのモデレーション

AI生成コンテンツに対する二次モデレーション:

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

## 高度な使い方

### カスタムモデレーションしきい値

ビジネス要件に応じてモデレーションの厳しさを調整します:

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

### モデレーションログ

分析と改善のためにモデレーション履歴を記録します:

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

### 複数モデルの共同モデレーション

より高い精度のために複数のモデレーションモデルを組み合わせます:

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

## ベストプラクティス

### 1. 双方向のモデレーション

<CardGroup cols={2}>
  <Card title="入力モデレーション" icon="log-in">
    悪意のあるリクエストを防ぐためにユーザー入力をモデレートします
  </Card>

  <Card title="出力モデレーション" icon="log-out">
    安全な出力を確保するためにAI生成コンテンツをモデレートします
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

### 2. 非同期モデレーション

リアルタイムでないシナリオでは、パフォーマンスを向上させるために非同期モデレーションを使用します：

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

### 3. モデレーション結果のキャッシュ

API呼び出しを減らすため、同一コンテンツのモデレーション結果をキャッシュします：

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

### 4. 段階的な処理

違反の重大度に応じて、異なる対応を取ります：

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

## よくある質問

### モデレーションは中国語に対応していますか？

はい。OpenAI Moderation とその他の主要なモデレーションモデルは、英語と同等の精度で中国語コンテンツのモデレーションをサポートしています。

### モデレーションのレイテンシーはどのくらいですか？

通常は 100-500ms で、以下によって異なります。

* テキストの長さ
* モデルの選択
* ネットワーク状況

### 誤検知はどのように扱えばよいですか？

段階的な戦略を推奨します。

1. 高い確信度の違反: 直接拒否
2. 中程度の確信度: 人手によるレビュー
3. 低い確信度: 許可または警告

### モデレーションは課金されますか？

OpenAI Moderation API は現在無料です。その他のモデルでは料金が発生する場合があります。詳細は[料金](/ja/pricing)をご覧ください。

### 画像と動画もモデレーションできますか？

現在の Moderation API は主にテキストコンテンツを対象としています。画像と動画のモデレーションには、専用のマルチモーダルモデレーションモデルが必要です。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="テキスト生成" icon="messages-square" href="/ja/api-capabilities/text-generation">
    Chat Completions API のドキュメント
  </Card>

  <Card title="コンテンツセーフティ" icon="shield" href="/ja/faq/content-safety">
    プラットフォームのコンテンツ安全ポリシー
  </Card>

  <Card title="料金" icon="dollar-sign" href="/ja/pricing">
    Moderation API の料金詳細
  </Card>
</CardGroup>
