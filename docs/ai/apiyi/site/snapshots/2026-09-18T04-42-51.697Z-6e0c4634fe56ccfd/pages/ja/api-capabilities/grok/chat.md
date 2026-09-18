> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Chat & 推論ガイド

> APIYI の Grok シリーズ向けに検証済みの Chat Completions 機能です。ストリーミング、chain-of-thought reasoning_content とその課金、json_schema による構造化出力、関数呼び出し、ビジョン入力、自動プロンプトキャッシュを含みます。

このページでは、`/v1/chat/completions` エンドポイントで Grok シリーズが実行できるすべての内容を扱います。すべての結論は、2026 年 7 月 13 日 (UTC+8) に APIYI ゲートウェイに対して実施した実地テストに基づいています。

## Basic Chat and Streaming

6つのモデルはいずれも標準のOpenAI形式とストリーミングをサポートしています。`stream_options: {"include_usage": true}` は動作確認済みです（最終チャンクに完全な使用量が含まれます）:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

stream = client.chat.completions.create(
    model="grok-4.3",
    messages=[{"role": "user", "content": "Count from 1 to 5, one number per line"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    if chunk.usage:
        print(f"\nUsage: {chunk.usage.total_tokens} tokens")
```

計測されたストリーミングの最初のtokenまでの時間: すべてのモデルで 1.5–2.3 秒。非ストリーミングの短いQ\&Aは全体で 1.7–5.1 秒で完了します。

## 思考の連鎖（推論）

これは Grok シリーズで最も誤解されやすい課金の側面です — このセクションを最後までお読みください。

### どのモデルが思考の連鎖を出力するか

| Model                                      | 推論の振る舞い                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| `grok-4.5` / `grok-4.3` / `grok-build-0.1` | **デフォルトでオン**; レスポンスに `reasoning_content` が含まれます; 無効化できません |
| `grok-4.20-0309-reasoning`                 | オン; `reasoning_content` を含みます                             |
| `grok-4.20-0309-non-reasoning`             | オフ; `reasoning_tokens` は 0; 直接回答します                       |
| `grok-4.20-multi-agent-beta-0309`          | 内部推論は公開されませんが、`reasoning_tokens` は引き続き課金されます              |

<Warning>
  **推論に使われた tokens は出力課金の対象です。** ある短い Q\&A の計測では、表示された回答は 30 tokens しかありませんでしたが、586 output tokens が課金されました（うち 556 は推論でした）。短い Q\&A を高頻度で処理する場合、`grok-4.20-0309-non-reasoning` により大きく節約できます。
</Warning>

### Chain-of-Thought と推論使用量の読み方

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.20-0309-reasoning",
    messages=[{"role": "user", "content": "Pipe A fills a pool in 8h, pipe B in 12h. How long together?"}]
)
msg = resp.choices[0].message
print("Answer:", msg.content)
print("Chain-of-thought:", msg.reasoning_content)
print("Reasoning tokens:", resp.usage.completion_tokens_details.reasoning_tokens)
```

### reasoning\_effort パラメータ

`reasoning_effort`（例: `"low"` / `"high"`）は **`grok-4.5` でのみ受け付けられます**; `grok-4.20-0309-reasoning` は 400 `Model ... does not support parameter reasoningEffort` で明示的に拒否します。クロスモデルのコードにこのパラメータをハードコードしないでください。

## 構造化出力

OpenAI準拠の `response_format: json_schema`（strict mode）に対応しています。`grok-4.5` / `grok-4.3` / `grok-build-0.1` / `grok-4.20-0309-reasoning` とマルチエージェントモデルで動作確認済みで、すべてスキーマに厳密に準拠した JSON を返します:

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{"role": "user", "content": "Zhang San is 25 and lives in Hangzhou. Extract the info."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "city": {"type": "string"}
                },
                "required": ["name", "age", "city"],
                "additionalProperties": False
            }
        }
    }
)
print(resp.choices[0].message.content)   # {"name":"Zhang San","age":25,"city":"Hangzhou"}
```

## 関数呼び出し

OpenAI標準の `tools` / `tool_choice` フィールドと、完全な2ラウンドのツール呼び出しフローに対応しています（`grok-4.5` / `grok-4.3` / `grok-build-0.1`で検証済み）:

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "City name"}},
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in Shanghai right now?"}]

# Round 1: the model decides to call the tool
resp = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
msg = resp.choices[0].message
tool_call = msg.tool_calls[0]
print(tool_call.function.name, tool_call.function.arguments)  # get_weather {"city":"Shanghai"}

# Round 2: feed the tool result back
messages += [
    msg,
    {"role": "tool", "tool_call_id": tool_call.id,
     "content": '{"city": "Shanghai", "temp_c": 31, "condition": "sunny"}'}
]
resp2 = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
print(resp2.choices[0].message.content)  # It's sunny in Shanghai, 31°C.
```

`tool_choice`（`{"type": "function", "function": {"name": "get_weather"}}`）による強制ツール呼び出しも正常に動作することを確認済みです。

<Tip>
  このセクションは**クライアントサイドの関数呼び出し**について説明しています（ツールを実行するのはあなたのコードです）。xAIのサーバーに検索、コード実行、またはMCPへの接続を任せたい場合は、Responses APIを使用してください — [Web & X Search](/ja/api-capabilities/grok/web-search) と [Code Execution & MCP](/ja/api-capabilities/grok/code-execution-mcp) を参照してください。
</Tip>

## Vision 入力（画像理解）

Grok 4.x チャットモデルは、OpenAI Vision 形式で画像入力（jpg / png、画像ごとに最大20MiB）を受け付けます。`grok-4.5` / `grok-4.3` / `grok-4.20-0309-non-reasoning` で検証済みで、いずれも形状と色を正しく識別しました：

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
        ]
    }]
)
print(resp.choices[0].message.content)
```

<Warning>
  **base64 data URL を優先してください。** 外部 URL を使う場合、画像は xAI の上流サーバーによって直接取得されます — テストでは、Wikimedia など一部の画像ホストがサーバー側の取得を拒否し、`image_download_error` でリクエストが失敗しました。外部 URL を使う必要がある場合は、ホストがサーバー側アクセスを許可していること、および URL が画像ファイルを直接指していることを確認してください。
</Warning>

## Prompt Caching（自動）

Grok のプレフィックスキャッシュは**自動で有効 — 設定不要**で、キャッシュされた部分は割引料金（`grok-4.6` では 0.25×、75% の節約）で課金されます:

```python theme={null}
resp = client.chat.completions.create(model="grok-4.6", messages=messages)
print("Cache hits:", resp.usage.prompt_tokens_details.cached_tokens)
```

最適化: 安定した内容（system prompt、few-shot の例）はメッセージの先頭に、変動する内容は末尾に配置して、プレフィックスのキャッシュヒットを最大化してください。xAI は、キャッシュエントリは削除される場合があり、ヒットは保証されないと述べているため、**キャッシュ未使用価格で予算を見積もってください**。

ヒットの読み方、128-token 単位のブロック粒度、そして長い会話に適した endpoint については、[Grok キャッシュ課金ガイド](/ja/api-capabilities/grok/prompt-caching)を参照してください。

## よくある質問

<AccordionGroup>
  <Accordion title="grok-4.5 の推論過程をオフにするにはどうすればよいですか？">
    できません。内部推論は `grok-4.5` / `grok-4.3` / `grok-build-0.1` に固有です。推論過程が不要で、高速かつ低コストな回答が欲しい場合は、代わりに `grok-4.20-0309-non-reasoning` を使用してください。
  </Accordion>

  <Accordion title="reasoning_content を次のターンのコンテキストに戻すべきですか？">
    いいえ。マルチターン会話で履歴を再現する場合は、`content` のみ（tool-calling フィールドを除く）を返してください。`reasoning_content` は標準フィールドではありません。これをそのまま返すと input tokens を増やすだけです。
  </Accordion>

  <Accordion title="max_tokens はどのように設定すればよいですか？">
    推論過程も出力バジェットを消費します。`max_tokens` が小さすぎると、推論がバジェット全体を使い切って表示される回答が途中で切れることがあります。推論モデルでは、2048 以上から始めてください。
  </Accordion>

  <Accordion title="temperature / top_p は機能しますか？">
    はい、通常どおり受け付けられます。推論系モデルは従来型モデルよりサンプリングパラメータの影響を受けにくいため、調整の余地は限られます。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Grok 概要" icon="rocket" href="/ja/api-capabilities/grok/overview">
    モデル一覧、価格、機能マトリクス
  </Card>

  <Card title="キャッシュ課金" icon="database" href="/ja/api-capabilities/grok/prompt-caching">
    ヒット時は75%割引、読み方、長い会話の構成方法
  </Card>

  <Card title="Web & X 検索" icon="globe" href="/ja/api-capabilities/grok/web-search">
    サーバーサイドのライブ検索ツールをハンズオンで使う
  </Card>
</CardGroup>
