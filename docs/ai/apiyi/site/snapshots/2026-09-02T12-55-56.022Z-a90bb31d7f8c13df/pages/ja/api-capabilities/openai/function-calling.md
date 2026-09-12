> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Function Calling ガイド

> ツール定義、厳格モード、並列呼び出し、ストリーミングの組み立て — および responses と chat/completions エンドポイント間のフォーマットの違い。

Function Calling（FC）はエージェント構築の基盤です: **モデルは関数を実行しません — ただ「どの関数を、どの引数で呼び出すか」を出力するだけです**。実行はご自身のコードで行い、その結果をモデルに返すと、モデルが最終回答を生成します。

このページは、公式 OpenAI ドキュメント（`developers.openai.com/api/docs/guides/function-calling`、2026年6月時点）を基にしています。両方のエンドポイント向けの例は、そのままコピーして使えます。

## 完全なコールループ

<Steps>
  <Step title="関数を定義する">
    関数名、説明、パラメータ JSON Schema をリクエストと一緒に送信します
  </Step>

  <Step title="モデルが呼び出しを返す">
    モデルが呼び出しを行うと判断すると、関数名と JSON 引数を返します
  </Step>

  <Step title="ローカルで実行する">
    コードが引数をパースし、実際に関数を実行します（DB を照会する、外部 API を呼び出す…）
  </Step>

  <Step title="結果を送り返す">
    結果を会話とともに 2 回目のリクエストで送信すると、モデルはそれに基づいて回答します
  </Step>
</Steps>

## 2つのエンドポイント間の主な形式の違い

同じ機能でも、`/v1/chat/completions` と `/v1/responses` ではフィールド形式が異なります。これは最もよくある統合時の落とし穴です。

|            | Chat Completions                                                   | Responses                                                                |
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| ツール定義      | ネスト形式: `{"type": "function", "function": {name, parameters, ...}}` | フラット形式: `{"type": "function", "name": ..., "parameters": ...}`           |
| 呼び出し出力     | `message.tool_calls[]`（`id` を含む）                                   | トップレベルの出力項目: `{"type": "function_call", "call_id", "name", "arguments"}` |
| 結果の返却      | `{"role": "tool", "tool_call_id": ..., "content": ...}`            | `{"type": "function_call_output", "call_id": ..., "output": ...}`        |
| strict モード | `"strict": true` を明示的に設定                                           | 可能な場合、サーバーがスキーマを strict に正規化                                             |

<Warning>
  2つの形式を**混在させることはできません**。Chat Completions のネストされた `function: {...}` 定義を `/v1/responses` に送信する（またはその逆）ことが、SDK で「無効なパラメーター」エラーが発生する最も一般的な原因です。
</Warning>

既存のツール呼び出しフローを Chat Completions から Responses に移行する方法については、たとえば `tools` と `reasoning_effort` に関する GPT-5.4 以降の制限に達した場合など、[エンドポイントと移行](/ja/api-capabilities/openai/responses-migration) で移行前後のコードを完全に比較しながら説明しています。

## Chat Completions の完全な例

完全な define → call → execute → return ループを通じた天気の検索:

<CodeGroup>
  ```python Python theme={null}
  import json
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
              "type": "object",
              "properties": {
                  "city": {"type": "string", "description": "City name, e.g. Beijing"}
              },
              "required": ["city"],
              "additionalProperties": False
          },
          "strict": True
      }
  }]

  messages = [{"role": "user", "content": "What's the weather in Beijing?"}]

  # 1st request: the model decides to call the function
  r1 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  tool_call = r1.choices[0].message.tool_calls[0]
  args = json.loads(tool_call.function.arguments)

  # Execute locally (fake data standing in for a real lookup)
  weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

  # 2nd request: return the result; the model writes the final answer
  messages.append(r1.choices[0].message)
  messages.append({
      "role": "tool",
      "tool_call_id": tool_call.id,
      "content": json.dumps(weather)
  })

  r2 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  print(r2.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const tools = [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name, e.g. Beijing' }
        },
        required: ['city'],
        additionalProperties: false
      },
      strict: true
    }
  }];

  const messages = [{ role: 'user', content: "What's the weather in Beijing?" }];

  const r1 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  const toolCall = r1.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);

  const weather = { city: args.city, temp: '26°C', condition: 'sunny' };

  messages.push(r1.choices[0].message);
  messages.push({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify(weather)
  });

  const r2 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  console.log(r2.choices[0].message.content);
  ```

  ```bash cURL (1st request) theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [{"role": "user", "content": "What is the weather in Beijing?"}],
      "tools": [{
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
            "additionalProperties": false
          },
          "strict": true
        }
      }]
    }'
  ```
</CodeGroup>

## 完全な例: 応答

3つの違いに注目してください。ツール定義は**フラット**で、呼び出しはトップレベルの `function_call` アイテムとして返され、結果は `function_call_output` として返されます。`previous_response_id` を使うと、2回目のリクエストで完全な履歴を再送する必要はありません:

```python theme={null}
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

tools = [{
    "type": "function",          # flat definition — no nested "function" field
    "name": "get_weather",
    "description": "Get current weather for a city",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name, e.g. Beijing"}
        },
        "required": ["city"],
        "additionalProperties": False
    }
}]

# 1st request
r1 = client.responses.create(
    model="gpt-5.4",
    input="What's the weather in Beijing?",
    tools=tools
)

# Find the function_call item in the output array
call = next(item for item in r1.output if item.type == "function_call")
args = json.loads(call.arguments)

weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

# 2nd request: chain with previous_response_id, return only the function result
r2 = client.responses.create(
    model="gpt-5.4",
    previous_response_id=r1.id,
    input=[{
        "type": "function_call_output",
        "call_id": call.call_id,
        "output": json.dumps(weather)
    }],
    tools=tools
)
print(r2.output_text)
```

## strict モード (構造化出力)

`strict: true` は、モデルの引数が **JSON Schema に厳密に一致する** ことを保証します — 幻覚によるフィールドや欠落したフィールドはありません。要件は 3 つです:

1. スキーマには `"additionalProperties": false` を含める必要があります
2. すべてのフィールドは `required` に必ず含める必要があります（オプションは `"type": ["string", "null"]` で表します）
3. サポートされている JSON Schema のサブセットのみ（基本型、enum、配列、ネストされたオブジェクト、…）

```json theme={null}
// ✅ Valid strict schema
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
    "date": {"type": ["string", "null"], "description": "Optional, defaults to today"}
  },
  "required": ["city", "unit", "date"],
  "additionalProperties": false
}
```

```json theme={null}
// ❌ Invalid: missing additionalProperties, date not in required
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "date": {"type": "string"}
  },
  "required": ["city"]
}
```

<Warning>
  **strict モード は parallel function calls と併用できません**: strict なスキーマ保証が必要な場合は、`parallel_tool_calls: false` も設定してください。
</Warning>

## parallel\_tool\_calls と tool\_choice

### 並列呼び出し

`parallel_tool_calls` はデフォルトでオンです: モデルは1回のターンで複数の関数を要求できます（例: 北京と上海の天気を同時に取得するなど）。それぞれを実行したら、次のリクエストの前に **すべての結果を返してください** — 各結果は、その `call_id` (レスポンス) または `tool_call_id` (チャット) に対応していなければなりません。

### tool\_choice の戦略

| 値                                             | 動作                         |
| --------------------------------------------- | -------------------------- |
| `"auto"` (既定)                                 | モデルが呼び出すかどうか、何を呼び出すかを判断します |
| `"required"`                                  | 少なくとも1つの関数を呼び出す必要があります     |
| `{"type": "function", "name": "get_weather"}` | 特定の関数を強制的に呼び出します           |
| `"none"`                                      | 呼び出しなし — テキストのみ            |

### allowed\_tools の部分集合

多くのツールがあるものの、このターンでは一部だけ公開したい場合は、`allowed_tools` 形式の `tool_choice` を使って呼び出し可能なサブセットを制限します — これは **tools リスト自体を変更しない** ため、[キャッシング](/ja/api-capabilities/openai/prompt-caching) の安定したプレフィックスを壊しません:

```python theme={null}
tool_choice={
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [{"type": "function", "name": "get_weather"}]
}
```

## ストリーミング中の関数呼び出し

### チャット補完: インデックスごとに組み立てる

関数引数は断片ごとにストリーミングされます。`index` ごとに `arguments` 文字列を蓄積し、ストリーム終了後に `json.loads` します:

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4", messages=messages, tools=tools, stream=True
)

calls = {}  # index -> {name, arguments}
for chunk in stream:
    delta = chunk.choices[0].delta if chunk.choices else None
    if delta and delta.tool_calls:
        for tc in delta.tool_calls:
            entry = calls.setdefault(tc.index, {"name": "", "arguments": ""})
            if tc.function.name:
                entry["name"] = tc.function.name
            if tc.function.arguments:
                entry["arguments"] += tc.function.arguments

print(calls)  # arguments are complete JSON only after the stream ends
```

### Responses: セマンティックイベントを監視する

`response.function_call_arguments.delta` イベントは引数の増分を運び、`response.function_call_arguments.done` が完全な引数を返します — インデックスを手動で組み立てる必要はありません。

## ベストプラクティスと落とし穴

優れたツール定義の書き方:

* **名前と説明はモデル向けに書く**: 「いつ呼び出すか」を明確に記述します。例: `"Get real-time weather; call only when the user explicitly asks about weather"`
* **enum でパラメータを絞り込む**: 値を列挙できるなら、自由形式の文字列は使わないでください。これで幻覚による引数の大半を防げます
* **ツール定義はプロンプトの早い段階に置き、安定させる**: ツールはキャッシュプレフィックスに参加します。安定した定義にすると入力が 90% オフになります（[キャッシュ課金](/ja/api-capabilities/openai/prompt-caching) を参照）
* **エージェントループに上限を設ける**: 最大ラウンド数を設定し、モデルが call → return → call の循環で無駄に課金を発生させないようにします

よくある落とし穴:

| 症状                         | 修正                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `arguments` が有効な JSON ではない | `strict: true` を有効にします — 根本から解決できます                                                 |
| モデルが存在しない関数を呼び出す           | `tool_choice` で絞り込みます。説明が誤解を招いていないか確認してください                                         |
| 並列呼び出し後に `call_id` が一致しない  | すべての結果は、その `call_id` / `tool_call_id` と 1 対 1 で対応している必要があります — 1 組でも欠けるとリクエストは失敗します |
| 形式が混在していることによるパラメータエラー     | 上の差分表を確認し、定義の形状（ネスト/フラット）をエンドポイントに合わせてください                                          |

## モデル対応と選択

gpt-5シリーズ全体で関数呼び出しに対応しています。シナリオ別には次のとおりです。

| シナリオ               | 推奨モデル                                   | 理由               |
| ------------------ | --------------------------------------- | ---------------- |
| 日常的なエージェント / ツール利用 | `gpt-5.4` (\$2.50 / \$15.00 per 1M)     | 機能とコストのバランスが最も良い |
| 高頻度の軽量ルーティング       | `gpt-5.4-mini` (\$0.75 / \$4.50 per 1M) | 安価で、単純な振り分けには十分  |
| 複雑なマルチステップ推論エージェント | `gpt-5.5` (\$5.00 / \$30.00 per 1M)     | 長い計画チェーンでも安定している |

## 関連リンク

* このグループ: [Native Calls](/ja/api-capabilities/openai/native) · [Compatible Mode](/ja/api-capabilities/openai/compatible) · [Cache Billing](/ja/api-capabilities/openai/prompt-caching)
* token の取得 / 管理: `https://api.apiyi.com/token`
* OpenAI 公式ドキュメント: `developers.openai.com/api/docs/guides/function-calling`
