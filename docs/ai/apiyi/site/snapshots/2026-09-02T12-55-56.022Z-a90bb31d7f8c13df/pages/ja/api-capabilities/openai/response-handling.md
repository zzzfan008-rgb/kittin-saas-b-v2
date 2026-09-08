> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Compatible モード: レスポンスの処理

> /v1/chat/completions からのストリーミングと非ストリーミングのレスポンスを一元的にパースする方法です。共通点を先に押さえつつ、少数のモデル固有の癖をカバーする堅牢なリファレンスパーサーを備えています。

[互換モード](/ja/api-capabilities/openai/compatible)を呼び出すと、OpenAI、Claude、Gemini、Grok、Qwen、GLM など、すべてのモデルが同じ OpenAI スキーマを返します。**パースロジックのほとんどは共通**であり、以下のパターンに従えば、モデルを切り替えてもコード変更は不要です。

このページでは、レスポンス処理を最初から正しく行えるようにします。まず共通点を示し、その後、許容すべきわずかな違いを1つの表にまとめます（いずれも統合を妨げるものではありません）。

<Info>
  リクエスト側（base\_url、auth、モデルの切り替え）については、[互換モードの呼び出し](/ja/api-capabilities/openai/compatible)で説明しています。このページは純粋に**レスポンス側**、つまり返ってきた内容をどうパースするかに焦点を当てています。
</Info>

## 2つのモード、1つのエンドポイント

同じ`/v1/chat/completions`エンドポイントです。`stream`フラグだけで形が変わります:

|           | `stream: false`（デフォルト）       | `stream: true`                   |
| --------- | ---------------------------- | -------------------------------- |
| 形状        | 単一の JSON オブジェクト              | SSE ストリーム（多数の`data:`行）           |
| トップレベルの型  | `chat.completion`            | `chat.completion.chunk`          |
| テキストを取得する | `choices[0].message.content` | 各`choices[0].delta.content`を蓄積する |
| ユースケース    | バックエンド、バッチジョブ、完全な結果          | チャット UI、token ごとのレンダリング          |

## 非ストリーミング応答

安定した構造 — `choices[0].message.content` を読むだけです:

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4.1-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "1+1 equals 2." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 31, "completion_tokens": 8, "total_tokens": 39 }
}
```

<CodeGroup>
  ```python Python theme={null}
  resp = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "What is 1+1?"}]
  )
  print(resp.choices[0].message.content)
  print(resp.usage.total_tokens)
  ```

  ```javascript Node.js theme={null}
  const resp = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'What is 1+1?' }]
  });
  console.log(resp.choices[0].message.content);
  console.log(resp.usage.total_tokens);
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{"model":"gpt-4.1-mini","messages":[{"role":"user","content":"What is 1+1?"}]}'
  ```
</CodeGroup>

<Tip>
  非ストリーミング出力は主要なすべてのモデルで非常に一貫しています — `choices[0].message.content` はどこでも動作します。一部のモデル（例: OpenAI ファミリー）では、`message` 上で `annotations` と `refusal` も追加されます。必要であれば読んでください。不要なら無視して構いません。
</Tip>

## ストリーミングレスポンス (SSE)

ストリーミングでは、チャンクを Server-Sent Events として 1 行ごとに `data: {...}` で送信し、`data: [DONE]` で終了します:

```text theme={null}
data: {"choices":[{"delta":{"content":"1"},"index":0}], ...}
data: {"choices":[{"delta":{"content":"+1"},"index":0}], ...}
data: {"choices":[{"delta":{},"finish_reason":"stop","index":0}], ...}
data: [DONE]
```

公式 SDK では、そのまま反復するだけです。要点は **`delta.content` を蓄積すること** です:

<CodeGroup>
  ```python Python theme={null}
  stream = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "Write a short poem"}],
      stream=True
  )

  for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
          print(chunk.choices[0].delta.content, end="", flush=True)
  ```

  ```javascript Node.js theme={null}
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'Write a short poem' }],
    stream: true
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  ```
</CodeGroup>

## 統合メモ: いくつかの違いを、共通の方法で処理します

ストリーミングの詳細はモデルごとに少し異なりますが、**以下のルールに従えば、1つのコードパスでそれらすべてをカバーできます**。

<Warning>
  **最終チャンクの`choices`は空の配列になることがあります。** `usage`を含む最後のチャンクは、いくつかのモデル（gpt-4.1-mini, grok, qwen, glm）では`"choices":[]`です。そこで`choices[0]`をインデックス参照すると例外になります。**読み取る前に、`choices`が空でないことを確認してください。**
</Warning>

| 違い                   | 表示される内容                                                            | 共通の処理                               |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| 最終チャンクの choices      | `[]` が空の場合もあれば、空でない場合もある                                           | delta を読む前に `choices` が空でないことを確認する  |
| `finish_reason` の中間値 | 通常は `null`。Claude では `""`（空文字列）を使う                                 | `finish_reason === "stop"` で終了を検出する |
| `usage` の位置          | 空の choices チャンク / 空でないチャンク / `stop` と同じチャンク                        | 3つすべて試し、存在するたびに記録する                 |
| チャンクの粒度              | トークンごと（OpenAI）または文ごと（Gemini/Claude）                                | 関係ありません — そのまま蓄積するだけです              |
| 最初の role 宣言チャンク      | 一部のモデルは、`role`を宣言する空コンテンツのチャンクを送ります                                | content が空ならスキップし、テキストとして扱わないでください  |
| ベンダー固有のフィールド         | `obfuscation`, `system_fingerprint`, `first_token_return_time`, など | 無視してください — それらに依存しないでください           |

## 堅牢な参考パーサー

raw SSE を自前で処理する場合（SDK を使わない場合）、これで上記のすべての違いをカバーできます:

<CodeGroup>
  ```python Python theme={null}
  import json, requests

  def stream_chat(model, messages, api_key):
      resp = requests.post(
          "https://api.apiyi.com/v1/chat/completions",
          headers={"Authorization": f"Bearer {api_key}",
                   "Content-Type": "application/json"},
          json={"model": model, "messages": messages, "stream": True},
          stream=True, timeout=300,
      )
      text, usage = "", None
      for line in resp.iter_lines(decode_unicode=True):
          if not line or not line.startswith("data: "):
              continue
          data = line[6:]
          if data == "[DONE]":
              break
          chunk = json.loads(data)
          if chunk.get("usage"):          # usage may appear in any chunk
              usage = chunk["usage"]
          choices = chunk.get("choices")
          if not choices:                 # final chunk may be empty; guard it
              continue
          delta = choices[0].get("delta", {})
          piece = delta.get("content")
          if piece:                       # skip role-only / empty-content chunks
              text += piece
              print(piece, end="", flush=True)
          # finish_reason == "stop" is just a marker; don't break (usage often follows)
      return text, usage
  ```

  ```javascript Node.js theme={null}
  async function streamChat(model, messages, apiKey) {
    const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "", usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();             // keep the possibly-incomplete last line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return { text, usage };
        const chunk = JSON.parse(data);
        if (chunk.usage) usage = chunk.usage;        // usage may appear in any chunk
        const choices = chunk.choices;
        if (!choices || choices.length === 0) continue;  // final chunk may be empty
        const piece = choices[0].delta?.content;
        if (piece) { text += piece; process.stdout.write(piece); }
      }
    }
    return { text, usage };
  }
  ```
</CodeGroup>

<Note>
  推論モデル（grok、qwen、glm など）は、まず `delta.reasoning_content`（思考の連鎖）をストリーミングし、次に `delta.content`（回答）をストリーミングします。上のパーサーは `content` だけを読み取るため、思考は自動的にスキップされます。思考を表示するには、[推論モデルの出力](/ja/api-capabilities/openai/reasoning-models) を参照してください。
</Note>

## 使用方法と課金

* `usage` は非ストリーミング応答ではインラインで返り、ストリーミングでは最後のチャンクで届きます（場所は上の表どおりです — 「存在する場合は必ず記録」）。
* 項目の内訳は異なります。OpenAI 系では `completion_tokens_details` が追加され、Gemini/Claude では `input_tokens`/`output_tokens` が追加され、推論モデルでは `reasoning_tokens` が追加されます。3 つの標準項目、つまり `prompt_tokens` / `completion_tokens` / `total_tokens` を参照してください。

<Warning>
  **ストリーミングされた `total_tokens` を信用しないでください。** テストでは、一部のモデル（例: gpt-5.4-mini）が、`total ≠ prompt + completion` となっている末尾フレームを出力することがありますが、同じモデルは非ストリーミングでは正しくなります。**そのフレームではなく、アカウント明細を基に課金してください。**
</Warning>

## 関連リンク

* 同じグループ: [互換モードの呼び出し](/ja/api-capabilities/openai/compatible) · [推論モデルの出力](/ja/api-capabilities/openai/reasoning-models) · [ネイティブ呼び出し](/ja/api-capabilities/openai/native)
* モデルと料金: [モデルと料金の概要](/ja/api-capabilities/model-info)
* token の取得・管理: `https://api.apiyi.com/token`
