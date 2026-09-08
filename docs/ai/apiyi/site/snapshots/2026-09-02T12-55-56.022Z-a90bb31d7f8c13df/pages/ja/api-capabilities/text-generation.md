> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキスト生成（チャット補完）

> 大規模言語モデルを対話型 AI に活用し、シングルターン対話、マルチターン会話、ロールプレイなどをサポートします

## 概要

テキスト生成（Chat Completions）は、APIYi プラットフォームの中核機能の1つであり、400以上の人気AIモデルを活用したインテリジェントな会話とテキスト生成をサポートします。統一された OpenAI 互換インターフェースを通じて、次のようなことを簡単に実現できます。

* **インテリジェント対話**: チャットボットやバーチャルアシスタントを構築する
* **コンテンツ作成**: 記事執筆、クリエイティブ生成、コピーライティング
* **コード支援**: コード生成、デバッグ、リファクタリングの提案
* **知識Q\&A**: 質問への回答、知識検索、情報抽出
* **ロールプレイ**: カスタマイズされたAIキャラクターとシナリオのシミュレーション

<Info>
  OpenAI GPT-4、Claude、Gemini、DeepSeek、Qwen を含む 400以上の主要モデルを、1つのAPIキーでサポートします。
</Info>

## クイックスタート

### 基本的な会話の例

Chat Completions API を使用した、シンプルな単一ターンの会話:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Tell me about the history of artificial intelligence"}
    ]
)

print(response.choices[0].message.content)
```

### マルチターン会話の例

コンテキストを考慮した対話のために、`messages` 配列で会話履歴を保持します:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

messages = [
    {"role": "system", "content": "You are a professional Python programming assistant"},
    {"role": "user", "content": "How do I read a CSV file?"},
    {"role": "assistant", "content": "You can use pandas library's read_csv() function..."},
    {"role": "user", "content": "How do I filter specific columns?"}
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

print(response.choices[0].message.content)
```

## コアパラメータ

### model (必須)

モデル名を指定します。詳細は [モデル情報](/ja/api-capabilities/model-info) をご覧ください。

```python theme={null}
model="gpt-4o"  # GPT-4 Omni
model="claude-sonnet-4.5"  # Claude Sonnet 4.5
model="gemini-3-pro-preview"  # Gemini 3 Pro
model="deepseek-chat"  # DeepSeek Chat
```

### messages (必須)

会話メッセージの配列で、各メッセージには `role` と `content` フィールドが含まれます:

<CardGroup cols={3}>
  <Card title="system" icon="settings">
    AI の振る舞いと役割を定義するシステムプロンプト
  </Card>

  <Card title="user" icon="user">
    ユーザー入力を表すユーザーメッセージ
  </Card>

  <Card title="assistant" icon="bot">
    AI の応答を表すアシスタントメッセージ
  </Card>
</CardGroup>

```python theme={null}
messages = [
    {"role": "system", "content": "You are a friendly customer service assistant"},
    {"role": "user", "content": "I want to inquire about refunds"},
    {"role": "assistant", "content": "Sure, what issue did you encounter?"},
    {"role": "user", "content": "The product has quality issues"}
]
```

### temperature (任意)

出力のランダム性を制御します。範囲は `0.0 ~ 2.0`、デフォルトは `1.0` です:

* **0.0 \~ 0.3**: より決定的で一貫した出力になり、事実ベースのタスク（翻訳、要約、コード生成）に適しています
* **0.7 \~ 1.0**: 創造性と正確さのバランスが取れており、日常会話に適しています
* **1.0 \~ 2.0**: より創造的で多様な出力になり、創作やブレインストーミングに適しています

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a poem about spring"}],
    temperature=1.2  # Increase creativity
)
```

### max\_tokens (任意)

生成される tokens の最大数を制限して、コストと応答の長さを制御します:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Describe AI in one sentence"}],
    max_tokens=50  # Limit output length
)
```

<Warning>
  モデルごとに token 価格が異なります。詳細は [料金](/ja/pricing) をご覧ください。
</Warning>

### top\_p (任意)

Nucleus sampling パラメータで、範囲は `0.0 ~ 1.0`、出力の多様性を制御します:

* 低い値（例: `0.5`）: よりフォーカスされた決定的な出力
* 高い値（例: `0.9`）: より多様でランダムな出力

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Recommend some sci-fi movies"}],
    top_p=0.8
)
```

<Info>
  `temperature` または `top_p` のみを調整することを推奨します。両方を同時に調整しないでください。
</Info>

### stream (任意)

ストリーミング出力を有効にすると、結果を token ごとに返せるため、ユーザー体験が向上します:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write an article about artificial intelligence"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## 上級者向けの使い方

### システムプロンプト

`system` ロールを通じて、AI の動作、役割、知識範囲、応答スタイルを定義します:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": """You are a professional legal advisor assistant.

Rules:
1. Provide accurate and professional legal advice
2. Use plain language to explain legal terms
3. Cite relevant laws when necessary
4. Avoid absolute conclusions, suggest consulting professional lawyers
5. Maintain a neutral and objective stance"""
    },
    {"role": "user", "content": "Can employment contracts be terminated at any time?"}
]
```

### ロールプレイ

特定の個性や専門性を持つ AI アシスタントを作成します:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": "You are an experienced Python developer with 10 years of experience. You excel at solving problems with concise code, prefer Pythonic approaches, and proactively identify potential issues in code."
    },
    {"role": "user", "content": "Help me write a quicksort algorithm"}
]
```

### コンテキスト管理

長い会話では、モデルの token 制限を超えないようにコンテキスト長を適切に管理します:

```python theme={null}
def manage_context(messages, max_history=10):
    """Keep recent conversation history"""
    # Preserve system messages
    system_messages = [m for m in messages if m["role"] == "system"]
    # Keep recent N messages
    recent_messages = messages[-max_history:]

    return system_messages + recent_messages

# Usage example
messages = manage_context(messages, max_history=10)
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)
```

### JSON モード出力

一部のモデルでは、JSON 形式の出力を強制できます:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a data extraction assistant. Always return results in JSON format"},
        {"role": "user", "content": "Extract key information from this text: Zhang San, male, 30 years old, software engineer"}
    ],
    response_format={"type": "json_object"}
)

import json
result = json.loads(response.choices[0].message.content)
print(result)
```

## ベストプラクティス

### 1. 適切なモデルを選ぶ

タスク要件に基づいて、最も費用対効果の高いモデルを選択してください:

| タスク種別         | 推奨モデル                                           | 備考         |
| ------------- | ----------------------------------------------- | ---------- |
| 日常会話          | gpt-4o-mini, deepseek-chat                      | 低コスト、高速応答  |
| 複雑な推論         | gpt-4o, claude-sonnet-4.5, gemini-3-pro-preview | 高い性能、高精度   |
| コード生成         | gpt-4o, deepseek-coder, claude-sonnet-4.5       | 専門的な知識     |
| クリエイティブライティング | claude-sonnet-4.5, gpt-4o                       | 流暢な文章      |
| 多言語翻訳         | gemini-3-pro-preview, gpt-4o                    | 多くの言語をサポート |

### 2. prompt を最適化する

良い prompt は出力品質を大幅に向上させます:

<CardGroup cols={2}>
  <Card title="明確なタスク" icon="check">
    必要なコンテキストとともに、AI が何を行うべきかを明確に示します
  </Card>

  <Card title="形式を指定する" icon="list">
    出力形式、長さ、トーンなどを定義します
  </Card>

  <Card title="例を示す" icon="lightbulb">
    入出力の例を示して、AI が期待値を理解しやすくします
  </Card>

  <Card title="段階的に" icon="list-ordered">
    複雑なタスクを複数のステップに分けます
  </Card>
</CardGroup>

```python theme={null}
# ❌ Poor prompt
"Write an article"

# ✅ Good prompt
"""Write a popular science article about AI applications in healthcare.

Requirements:
- Length: 800-1000 words
- Audience: General readers
- Structure: Introduction, Application Scenarios, Case Analysis, Future Outlook
- Tone: Professional but accessible
- Include 2-3 real-world cases"""
```

### 3. コスト管理

API コストを削減するために、パラメータを賢く使いましょう:

```python theme={null}
# Set max_tokens to limit output length
response = client.chat.completions.create(
    model="gpt-4o-mini",  # Use more cost-effective model
    messages=messages,
    max_tokens=500,  # Limit maximum output
    temperature=0.7
)

{/* Regularly clean conversation history */}
if len(messages) > 20:
    messages = messages[-10:]  # Keep only recent 10 messages
```

### 4. エラーハンドリング

アプリケーションの安定性を向上させるために、例外処理を追加します:

```python theme={null}
from openai import OpenAI, OpenAIError
import time

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def chat_with_retry(messages, max_retries=3):
    """Chat function with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return response.choices[0].message.content
        except OpenAIError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise

# Usage example
try:
    result = chat_with_retry(messages)
    print(result)
except OpenAIError as e:
    print(f"API call failed: {e}")
```

### 5. ストリーミング出力を使用する

長文生成では、ストリーミング出力によりユーザー体験が向上します:

```python theme={null}
def stream_chat(messages):
    """Streaming output example"""
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

## FAQ

### tokenの数をどう数えますか？

異なるモデルでは異なるトークナイザーが使われます。推定には`tiktoken`ライブラリを使用してください:

```python theme={null}
import tiktoken

def count_tokens(text, model="gpt-4o"):
    """Estimate token count for text"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# Usage example
text = "Hello, world!"
tokens = count_tokens(text)
print(f"Token count: {tokens}")
```

### 出力が途中で切れるのはなぜですか？

考えられる理由:

1. `max_tokens`の上限に達した
2. モデルのコンテキストウィンドウが不足している
3. コンテンツ安全ポリシーが作動した

対処方法:

* `max_tokens`パラメータを増やす
* より長いコンテキスト対応のモデルを選ぶ
* 原因を特定するために`finish_reason`フィールドを確認する

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=2000  # Increase output length limit
)

finish_reason = response.choices[0].finish_reason
if finish_reason == "length":
    print("Output truncated due to length limit")
elif finish_reason == "content_filter":
    print("Output filtered due to content safety")
```

### 会話メモリをどう実装しますか？

アプリケーション層で会話履歴を保持します:

```python theme={null}
class ChatSession:
    def __init__(self, system_prompt=""):
        self.messages = []
        if system_prompt:
            self.messages.append({"role": "system", "content": system_prompt})

    def chat(self, user_message):
        """Send message and record conversation"""
        self.messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=self.messages
        )

        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

# Usage example
session = ChatSession(system_prompt="You are a friendly assistant")
print(session.chat("Hello"))
print(session.chat("What did I just say?"))  # AI can remember context
```

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="モデル情報" icon="database" href="/ja/api-capabilities/model-info">
    対応しているすべてのモデルと料金を確認できます
  </Card>

  <Card title="テキスト埋め込み" icon="vector-square" href="/ja/api-capabilities/text-embedding">
    テキストをベクトル表現に変換します
  </Card>
</CardGroup>
