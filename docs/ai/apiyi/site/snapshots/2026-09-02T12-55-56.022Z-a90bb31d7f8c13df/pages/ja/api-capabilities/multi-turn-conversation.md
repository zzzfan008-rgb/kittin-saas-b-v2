> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# マルチターン会話ガイド

> APIYI でマルチターンチャットを実装します。OpenAI 互換モード（マルチモデル）と、OpenAI / Gemini / Anthropic のネイティブ形式での履歴処理、比較、FAQ を含みます。

LLMは**自分自身の記憶を持ちません** — モデルは、ほんの少し前にあなたが言ったことも覚えていません。「マルチターン会話」とは、実際には**毎回のリクエストに会話履歴全体を送ること**を意味します。このガイドでは、APIYI における 4 つの呼び出し形式がその履歴をどのように保持するかと、注意すべき落とし穴を説明します。

<Info>
  例ではエンドポイント `https://api.apiyi.com` と、あなたの [APIYI token](https://api.apiyi.com/token) を使用します。参照しているモデル: `gpt-5.4-mini`, `deepseek-v4-pro`, `gemini-3.5-flash`, `claude-sonnet-4-6`。
</Info>

## コア原則: 履歴は自分で保持する

一言で言うと、**モデルはステートレスであり、あなた（クライアント）が履歴を保持して、毎ターンその全体を再送する** ということです。

```text theme={null}
Turn 1: send [user Q1]                              → get [reply 1]
Turn 2: send [user Q1, reply 1, user Q2]            → get [reply 2]
Turn 3: send [user Q1, reply 1, user Q2, reply 2, user Q3] → get [reply 3]
```

新しいターンごとに、前回の user メッセージと model の返信を history array の末尾に **追加** してから、全体を送信します。形式ごとの差分は、history array の呼び名と roles の書き方だけです。

<Warning>
  **APIYI では、常に「履歴を自分で保持する」方式を使ってください。** サーバー側の会話状態（OpenAI Responses の `previous_response_id` など）には依存しないでください — ゲートウェイ経由では動作が保証されないためで、その詳細は下の OpenAI ネイティブのセクションで説明しています。
</Warning>

## OpenAI互換モード（複数モデルで動作）

最も汎用的な方法で、エンドポイント `/v1/chat/completions`。履歴は `messages` 配列にあり、各エントリには `role`（`system` / `user` / `assistant`）が含まれます。**`model` 文字列を切り替えるだけで、同じコードで別のモデルを動かせます**（gpt、deepseek、claude、gemini…）。

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  messages = [{"role": "system", "content": "You are a friendly assistant."}]

  def chat(user_input, model="gpt-5.4-mini"):
      messages.append({"role": "user", "content": user_input})
      resp = client.chat.completions.create(model=model, messages=messages)
      reply = resp.choices[0].message.content
      messages.append({"role": "assistant", "content": reply})  # append reply to history
      return reply

  print(chat("My name is Alice and I'm 28. Please remember."))
  print(chat("How old am I? And plus 5?"))   # remembers → 28, 33
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });
  const messages = [{ role: 'system', content: 'You are a friendly assistant.' }];

  async function chat(userInput, model = 'gpt-5.4-mini') {
    messages.push({ role: 'user', content: userInput });
    const resp = await client.chat.completions.create({ model, messages });
    const reply = resp.choices[0].message.content;
    messages.push({ role: 'assistant', content: reply });   // append reply to history
    return reply;
  }

  console.log(await chat("My name is Alice and I'm 28. Please remember."));
  console.log(await chat('How old am I?'));
  ```

  ```bash cURL theme={null}
  {/* Turn 2: include both the question and answer from turn 1 */}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "deepseek-v4-pro",
      "messages": [
        {"role": "user", "content": "My name is Alice and I am 28. Please remember."},
        {"role": "assistant", "content": "Got it: your name is Alice and you are 28."},
        {"role": "user", "content": "How old am I?"}
      ]
    }'
  ```
</CodeGroup>

<Tip>
  **1つのコードベースで、複数モデルに対応**: `model` を `deepseek-v4-pro`、`claude-sonnet-4-6`、`gemini-3.5-flash`、または他の任意のモデルに変更しても、マルチターンのロジックは同じままです。[モデルと料金の概要](/ja/api-capabilities/model-info) を参照してください。
</Tip>

### 推論モデルの履歴の扱い

`deepseek-v4-pro` のような推論モデルは、追加の `reasoning_content`（思考の連鎖）フィールドを返します。

<Warning>
  **履歴には `content` だけを残し、`reasoning_content` は返さないでください。** 思考は現在ターンの中間生成物にすぎず、これを返すと tokens を無駄にし、上流のルールにも違反します（DeepSeek の direct API ではこれに対して 400 が返ることもあります）。履歴へ追加する際は、`content` だけを使用します：

  ```python theme={null}
  messages.append({"role": "assistant", "content": resp.choices[0].message.content})
  # do NOT include resp.choices[0].message.reasoning_content
  ```
</Warning>

推論モデルのレスポンスの解析については、[推論モデルの出力](/ja/api-capabilities/openai/reasoning-models) を参照してください。

## OpenAI ネイティブ形式（Responses API）

エンドポイント `/v1/responses`。マルチターンでは、**`input` 配列として完全な履歴を渡します**（各エントリには `role` / `content` を含めます）— compatible mode と同じ自己管理型のアプローチです:

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

resp = client.responses.create(
    model="gpt-5.4-mini",
    input=[
        {"role": "user", "content": "Remember the codeword: purple elephant."},
        {"role": "assistant", "content": "Got it, the codeword is purple elephant."},
        {"role": "user", "content": "What's the codeword?"},
    ],
)
print(resp.output_text)   # The codeword is: purple elephant.
```

<Warning>
  **サーバー側の状態** のような `previous_response_id` / `conversation` / `store` に依存しないでください。APIYI ゲートウェイ経由で確認したところ、`previous_response_id` を渡してもエラーにはならず（200 を返します）が、次のターンでは前回の内容を**記憶しません**。また、`GET /v1/responses/{id}` は利用できません。したがって APIYI では、上記のように **自己管理型の履歴**（`input` 配列）を使って Responses API を利用してください。
</Warning>

## Gemini ネイティブ形式

エンドポイント `/v1beta/models/{model}:generateContent`。履歴は `contents` 配列に保持されます。**役割は `user` / `model`**（`assistant` ではありません）に注意してください。また、各エントリの content は `parts` に入ります。

```python theme={null}
from google import genai

client = genai.Client(api_key="YOUR_API_KEY",
                      http_options={"base_url": "https://api.apiyi.com"})

contents = [
    {"role": "user", "parts": [{"text": "Remember the codeword: purple elephant."}]},
    {"role": "model", "parts": [{"text": "Got it: purple elephant."}]},
    {"role": "user", "parts": [{"text": "What's the codeword?"}]},
]
resp = client.models.generate_content(model="gemini-3.5-flash", contents=contents)
print(resp.text)   # The codeword is: purple elephant.
```

<Tip>
  **さらに簡単**: 公式 `google-genai` SDK の `client.chats.create(...)` が `contents` の履歴を保持してくれるので、`send_message` を呼ぶだけです。手動でつなぎ合わせる必要はありません。
</Tip>

<Note>
  Gemini 3-series のレスポンスは parts に `thoughtSignature` を付与します。**プレーンテキストのマルチターンでは、`text` だけを返せばコンテキストを維持できます**（tokens も少なくて済みます）。**function calling** のように厳密な reasoning の継続が必要な場合のみ、`thoughtSignature` をそのまま返す必要があります。これは公式 SDK が自動で処理します。[Gemini Native Calls](/ja/api-capabilities/gemini/native) と [Function Calling](/ja/api-capabilities/gemini/function-calling) を参照してください。
</Note>

## Anthropic ネイティブフォーマット

エンドポイント `/v1/messages`。履歴は `messages` 配列にあり、ロールは `user` / `assistant` です。`content` は通常の文字列にできます。**`max_tokens` は必須です。**

```python theme={null}
import requests

def chat(messages):
    r = requests.post(
        "https://api.apiyi.com/v1/messages",
        headers={
            "content-type": "application/json",
            "anthropic-version": "2023-06-01",
            "x-api-key": "YOUR_API_KEY",
        },
        json={"model": "claude-sonnet-4-6", "max_tokens": 200, "messages": messages},
        timeout=60,
    )
    return "".join(b["text"] for b in r.json()["content"] if b["type"] == "text")

messages = [{"role": "user", "content": "Remember the codeword: purple elephant."}]
reply = chat(messages)
messages.append({"role": "assistant", "content": reply})       # append reply
messages.append({"role": "user", "content": "What's the codeword?"})
print(chat(messages))   # The codeword is: purple elephant.
```

<Tip>
  公式の `anthropic` SDK も、base\_url を `https://api.apiyi.com` に指定することで利用できます。レスポンスは `content` の block 配列です。パースの詳細は [Claude Streaming & Responses](/ja/api-capabilities/claude-response-handling) を参照してください。
</Tip>

## 4つの形式の比較

| 項目       | OpenAI互換               | OpenAIネイティブ（Responses） | Geminiネイティブ                 | Anthropicネイティブ |
| -------- | ---------------------- | ---------------------- | --------------------------- | -------------- |
| エンドポイント  | `/v1/chat/completions` | `/v1/responses`        | `/v1beta/…:generateContent` | `/v1/messages` |
| 履歴フィールド  | `messages`             | `input`                | `contents`                  | `messages`     |
| ロール      | system/user/assistant  | user/assistant         | **user/model**              | user/assistant |
| コンテンツ形式  | `content` 文字列          | `content` 文字列          | `parts: [{text}]`           | `content` 文字列  |
| 履歴の所有者   | あなた                    | あなた                    | あなた                         | あなた            |
| サーバー側の状態 | なし                     | ⚠️ 利用不可                | なし                          | なし             |
| モデル横断    | ✅ `model` を切り替え        | OpenAIのみ               | Geminiのみ                    | Claudeのみ       |

<Tip>
  **選び方**: ベンダーをまたいで 1 つのコードベースを使いたい場合は **OpenAI互換モード** を優先してください; ベンダー固有のネイティブ専用機能（Gemini の thought signatures / code execution、Claude の thinking blocks とキャッシュ、OpenAI の組み込み tools）が必要なら、その **ネイティブ形式** を使ってください。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="会話が長くなるほど料金は高くなりますか？">
    はい。各ターンで履歴全体が再送されるため、**input tokens はターン数に応じて増え**、それに伴ってコストも上がります。節約の主な方法は **コンテキストキャッシュ** です。同一の履歴プレフィックスは自動的にキャッシュヒット率が適用され、定価よりはるかに低くなります。[OpenAI caching](/ja/api-capabilities/openai/prompt-caching)、[Claude caching](/ja/api-capabilities/claude-prompt-caching)、[Gemini caching](/ja/api-capabilities/gemini/prompt-caching) をご覧ください。
  </Accordion>

  <Accordion title="何ターンまで保持すべきですか？ コンテキストウィンドウを超えたらどうなりますか？">
    厳密なルールはありませんが、履歴が長いほどコストは高くなり、モデルのコンテキストウィンドウを超える場合があります。一般的な対処法は次のとおりです。(1) **スライディングウィンドウ** — 直近の N ターンだけを保持する；(2) **要約圧縮** — 以前のターンを system prompt の段落に要約する；(3) システム指示と直近のターンを常に保持する。ユースケースに必要な「記憶量」とのバランスを取ってください。
  </Accordion>

  <Accordion title="system / system instruction はどこに入れればよいですか？">
    OpenAI 互換と Anthropic: 会話の先頭に置きます（互換版では `role:"system"` を使用し、Anthropic ではトップレベルの `system` フィールドまたは最初のメッセージを使います）。Gemini: `config.system_instruction` を使用します。システム指示は **一度だけ** 設定すればよく、毎ターン再追加する必要はありません。
  </Accordion>

  <Accordion title="推論モデルの thinking（reasoning_content）を戻すべきですか？">
    **いいえ。** thinking はそのターンの中間生成物です。履歴には最終的な `content` だけを残してください（Gemini では `text` のみ）。thinking を返すと token を無駄に消費し、一部の upstream では受け付けられません。例外は、関数呼び出しにおける Gemini の `thoughtSignature` です。公式 SDK が自動的に処理します。
  </Accordion>

  <Accordion title="サーバーに会話を覚えさせて、履歴を再送しなくてもよいですか？">
    APIYI ではこれは **推奨されません**。OpenAI Responses の `previous_response_id` は、ゲートウェイ経由で確実に動作するとは限りません（検証済み: メモリなし）。どこでもクライアント側で履歴を自前管理する方法を使ってください。これはモデル間で最も安定しており、一貫性があります。
  </Accordion>
</AccordionGroup>

## 関連リンク

* 呼び出しの基本: [OpenAI 互換モード](/ja/api-capabilities/openai/compatible) · [OpenAI ネイティブ呼び出し](/ja/api-capabilities/openai/native) · [Gemini ネイティブ呼び出し](/ja/api-capabilities/gemini/native) · [Claude API 基本](/ja/api-capabilities/claude)
* レスポンスのパース: [OpenAI のレスポンス処理](/ja/api-capabilities/openai/response-handling) · [推論モデルの出力](/ja/api-capabilities/openai/reasoning-models) · [Claude のストリーミングとレスポンス](/ja/api-capabilities/claude-response-handling) · [Gemini のストリーミングとレスポンス](/ja/api-capabilities/gemini/response-handling)
* モデルと料金: [モデルと料金の概要](/ja/api-capabilities/model-info)
* token の取得 / 管理: `https://api.apiyi.com/token`
