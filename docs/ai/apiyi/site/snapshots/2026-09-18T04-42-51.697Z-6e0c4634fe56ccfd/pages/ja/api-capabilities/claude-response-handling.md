> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude ネイティブ形式: ストリーミングと非ストリーミングのレスポンス

> Anthropic のネイティブ /v1/messages のレスポンス構造: content block 配列、名前付きイベント SSE プロトコル、各形式のパース方法、そしてフィールドリファレンス。

[Claude のネイティブ形式](/ja/api-capabilities/claude)（`/v1/messages`）を呼び出すと、レスポンスは OpenAI 互換モードとは**完全に異なります**。返答は型付きの `content` ブロック配列であり、ストリーミングでは Anthropic の**名前付きイベント SSE プロトコル**を使用します。このページでは、両方のモードをどのようにパースするかを説明します。

<Info>
  リクエスト側（エンドポイント、`anthropic-version` ヘッダー、`x-api-key` 認証、effort / thinking パラメータ）については、[Claude API の基本](/ja/api-capabilities/claude) と [Claude Effort & Thinking ガイド](/ja/api-capabilities/claude-effort-thinking) を参照してください。このページは**レスポンス側**のみを扱います。例では軽量モデル `claude-haiku-4-5-20251001` を使用します。
</Info>

## 非ストリーミング応答

最上位は `message` オブジェクトで、**答えは `content` 配列にあります**。`type` によってブロックに分割されます:

```json theme={null}
{
  "id": "msg_bdrk_xxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-4-5-20251001",
  "content": [
    { "type": "text", "text": "1+1 equals 2." }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 26,
    "output_tokens": 11,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

答えを取得するには、**`content` 配列を反復処理する** 必要があります。OpenAI のように単一の文字列フィールドを読むことはできません:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1/messages",
      headers={
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": "YOUR_API_KEY",
      },
      json={
          "model": "claude-haiku-4-5-20251001",
          "max_tokens": 100,
          "messages": [{"role": "user", "content": "What is 1+1?"}],
      },
      timeout=60,
  )
  data = resp.json()
  for block in data["content"]:
      if block["type"] == "text":
          print(block["text"])
      elif block["type"] == "thinking":      # only present when thinking is on
          print("[thinking]", block["thinking"])
  print(data["usage"])
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/messages \
    -H "content-type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -H "x-api-key: YOUR_API_KEY" \
    -d '{
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 100,
      "messages": [{"role": "user", "content": "What is 1+1?"}]
    }'
  ```
</CodeGroup>

<Note>
  `stop_reason` の値: `end_turn`（通常）、`max_tokens`（`max_tokens` によって切り捨てられた場合 — テキストが空かもしれません。制限を引き上げてください）、`stop_sequence`、`tool_use`（ツールを呼び出したい場合）。thinking を有効にすると、`content` 配列に `type: "thinking"` ブロックが `text` ブロックの前に追加されます。
</Note>

## ストリーミング応答（named-event SSE）

Claude のストリーミングでは Anthropic のイベントプロトコルを使います。各メッセージには `event:` 名と `data:` ペイロードがあり、OpenAI のように各チャンクを同じように扱うのではなく、イベントタイプでディスパッチします。

```text theme={null}
event: message_start
data: {"type":"message_start","message":{"id":"...","content":[],"usage":{"input_tokens":26,"output_tokens":8}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"1+1 equals 2."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":11}}

event: message_stop
data: {"type":"message_stop"}
```

固定のイベント順序と、それぞれが持つ内容は次のとおりです。

| イベント                  | 役割                                                           |
| --------------------- | ------------------------------------------------------------ |
| `message_start`       | メッセージの骨組み。`usage.input_tokens` と最初の `output_tokens` がここにあります |
| `content_block_start` | コンテンツブロックが始まります（`index` + ブロックタイプ text / thinking）           |
| `content_block_delta` | 増分。テキストは `delta.text` で、`delta.type == "text_delta"` にあります   |
| `content_block_stop`  | 現在のブロックが終了します                                                |
| `message_delta`       | 最終的な `stop_reason` + **累積された `output_tokens`** がここにあります      |
| `message_stop`        | メッセージ全体が終了します（**`[DONE]` はありません; このイベントが終端です**）              |

要点は、**`text_delta` を `content_block_delta` の中で蓄積すること**です。

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": "YOUR_API_KEY",
    },
    json={
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 100,
        "stream": True,
        "messages": [{"role": "user", "content": "Write a short poem"}],
    },
    stream=True, timeout=120,
)

text, usage = "", {}
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue                       # the event: line can be skipped; type is in data's "type"
    evt = json.loads(line[6:])
    t = evt["type"]
    if t == "message_start":
        usage.update(evt["message"]["usage"])
    elif t == "content_block_delta" and evt["delta"]["type"] == "text_delta":
        piece = evt["delta"]["text"]
        text += piece
        print(piece, end="", flush=True)
    elif t == "message_delta":
        usage.update(evt["usage"])     # final output_tokens
    elif t == "message_stop":
        break                          # terminator, no [DONE]
```

<Tip>
  イベントタイプは **`event:`** 行と **`data:`** ペイロードの **`"type"`** フィールドの両方にあります。どちらを使ってもディスパッチできます。公式 `anthropic` SDK では、base\_url を `https://api.apiyi.com` に向ければ SDK がイベントストリームを処理してくれるため、手書きのループは不要です。
</Tip>

<Note>
  thinking（adaptive thinking）を有効にすると、最初に `type: "thinking"` ブロックが表示されます。増分は `thinking_delta` で、ブロックが閉じる前に `signature_delta`（thinking ブロックのシグネチャー）が表示されます。thinking を表示するには、`thinking_delta` と `text_delta` を別々にレンダリングします。[Claude Effort & Thinking Guide](/ja/api-capabilities/claude-effort-thinking) を参照してください。
</Note>

## OpenAI互換モードとの主な違い

| 項目           | Claudeネイティブ (`/v1/messages`)                                               | OpenAI互換モード (`/v1/chat/completions`)                   |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| 応答の格納先       | `content` **ブロック配列**、型付き                                                   | `choices[0].message.content` 文字列                       |
| ストリーミングプロトコル | 名前付きイベント (`event:` + `data:`)                                              | 均一なチャンクオブジェクト                                          |
| ストリーム終端      | `message_stop` イベント、**`[DONE]` なし**                                        | `data: [DONE]`                                         |
| 増分フィールド      | `content_block_delta.delta.text`                                           | `choices[0].delta.content`                             |
| usage フィールド  | `input_tokens` / `output_tokens` (message\_start と message\_delta に分割されます) | `prompt_tokens` / `completion_tokens` / `total_tokens` |
| 終了理由         | `stop_reason` (`end_turn` など)                                              | `finish_reason` (`stop` など)                            |
| `max_tokens` | **必須**                                                                     | 任意                                                     |

<Warning>
  移行時に特に陥りやすい落とし穴は 2 つあります: (1) 応答は文字列ではなく **配列** です — `content` を反復し、`type=="text"` ブロックごとに処理します; (2) ストリーミングには **`[DONE]`** がありません — 終了は `message_stop` イベントで検出します。
</Warning>

## 利用と課金

* 非ストリーミング: `usage` は結果とともに返ってきて、`input_tokens`、`output_tokens`、`cache_creation_input_tokens`、`cache_read_input_tokens` が含まれます。
* ストリーミング: `input_tokens` は `message_start` にあり、最終的な `output_tokens` は `message_delta` にあります — **両方をマージ**してください。
* キャッシュヒットフィールド（`cache_read_input_tokens`）の割引と使用量については、[Claude Cache Billing](/ja/api-capabilities/claude-prompt-caching) を参照してください。

## 関連リンク

* 同じグループ: [Claude API 基礎](/ja/api-capabilities/claude) · [Claude キャッシュ 課金](/ja/api-capabilities/claude-prompt-caching) · [Claude の推論強度と Thinking ガイド](/ja/api-capabilities/claude-effort-thinking)
* 互換フォーマット対応版: [OpenAI 互換モード: 応答の処理](/ja/api-capabilities/openai/response-handling)
* token の取得 / 管理: `https://api.apiyi.com/token`
