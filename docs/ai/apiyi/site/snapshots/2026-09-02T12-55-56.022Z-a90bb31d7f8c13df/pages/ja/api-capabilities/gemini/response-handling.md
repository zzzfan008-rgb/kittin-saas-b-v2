> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini ネイティブ形式: ストリーミングと非ストリーミング応答

> Gemini のネイティブな generateContent / streamGenerateContent のレスポンス構造: candidates/parts、thoughtSignature、SSE ストリーミング、さらにパース方法とフィールドリファレンスです。

When you call [Gemini のネイティブ形式](/ja/api-capabilities/gemini/native) (`/v1beta` generateContent), the response uses Google's `candidates / parts` 構造で、OpenAI 互換モードとは異なります。このページでは、非ストリーミング（`generateContent`）とストリーミング（`streamGenerateContent`）の両方を解析する方法を説明します。

<Info>
  リクエスト側（base\_url は `https://api.apiyi.com` で、`/v1` なし、`x-goog-api-key` 認証、`thinking_level` 制御）は [Gemini Native Format Guide](/ja/api-capabilities/gemini/native) で説明しています。このページは**レスポンス側**のみを扱います。例では軽量モデル `gemini-3.1-flash-lite` を使用します。
</Info>

## 非ストリーミング応答

エンドポイント `…:generateContent`。**答えは `candidates[0].content.parts[]` にあります**:

```json theme={null}
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [
        { "text": "1+1 equals 2.", "thoughtSignature": "EjQKMgEM…" }
      ]
    },
    "finishReason": "STOP",
    "index": 0
  }],
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 6,
    "totalTokenCount": 21
  },
  "modelVersion": "gemini-3.1-flash-lite",
  "responseId": "Il0taoSYJ5Cez7…"
}
```

答えを取得するには、**`parts` を反復処理し**、各 `text` を連結します:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
      json={"contents": [{"parts": [{"text": "What is 1+1?"}]}]},
      timeout=60,
  )
  data = resp.json()
  parts = data["candidates"][0]["content"]["parts"]
  text = "".join(p["text"] for p in parts if "text" in p)
  print(text)
  print(data["usageMetadata"])
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{"contents":[{"parts":[{"text":"What is 1+1?"}]}]}'
  ```
</CodeGroup>

<Note>
  `finishReason` は **大文字の** `STOP` です（OpenAI の小文字の `stop` ではありません）。他の値には `MAX_TOKENS` と `SAFETY` があります。`part` には `thoughtSignature` のみが含まれ、`text` は含まれない場合があるため、反復処理する際は `if "text" in p` でフィルターしてください。そうしないと KeyError が発生します。
</Note>

## thoughtSignature

Gemini 3シリーズのモデルは、部分に `thoughtSignature`（暗号化された推論状態）を付与します — **テストでは、軽量版の `gemini-3.1-flash-lite` でもこれが返ります**。

* **シングルターン**: 不要です。無視してください。
* **マルチターン / 関数呼び出し**: 前回レスポンスの `thoughtSignature` を次のターンの `contents` に**そのまま**返し、モデルが推論チェーンを継続できるようにします。公式の `google-genai` SDK はこれを自動的に処理します。REST を手書きする場合は、フィールドを落とさないでください。[Gemini の関数呼び出し](/ja/api-capabilities/gemini/function-calling) を参照してください。

<Tip>
  これは [OpenAI compatible mode](/ja/api-capabilities/openai/reasoning-models) との重要な違いです。互換モードでは推論モデルはステートレスで、シグネチャを公開しません。`thoughtSignature` を持つのはネイティブ形式だけで、これをターンをまたいで返す必要があります。
</Tip>

## ストリーミング応答 (SSE)

エンドポイント `…:streamGenerateContent`。各行は `data: {...}` で、各チャンクの増分は `candidates[0].content.parts[0].text` です:

```text theme={null}
data: {"candidates":[{"content":{"parts":[{"text":"1"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"text":"+1 equals 2."}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"thoughtSignature":"EjQK…"}]},"finishReason":"STOP","index":0}],"usageMetadata":{...}}
```

<Warning>
  **APIYI ゲートウェイ経由では、ストリーミングは常に SSE `data:` 行を返します**（`?alt=sse` の有無にかかわらず）、また **`[DONE]` の終端子はありません** — `finishReason == "STOP"` を持つチャンクで終了します。その最後のチャンクには通常、**`thoughtSignature` のみが含まれ、`text` は含まれません**。
</Warning>

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse",
    headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
    json={"contents": [{"parts": [{"text": "Write a short poem"}]}]},
    stream=True, timeout=120,
)

text, usage = "", None
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    chunk = json.loads(line[6:])
    usage = chunk.get("usageMetadata", usage)        # cumulative; later overrides
    for cand in chunk.get("candidates", []):
        for p in cand.get("content", {}).get("parts", []):
            if "text" in p:                          # skip signature-only chunks
                text += p["text"]
                print(p["text"], end="", flush=True)
print("\n", usage)
```

<Note>
  `usageMetadata` は **各チャンクに含まれ、累積されます**（`candidatesTokenCount` は出力とともに増えます）— **最後の** チャンクの値だけを使えばよく、手動で合計する必要はありません。
</Note>

## OpenAI互換モードとの主な違い

| 項目        | Geminiネイティブ (`/v1beta`)                 | OpenAI互換 (`/v1/chat/completions`) |
| --------- | --------------------------------------- | --------------------------------- |
| base\_url | `https://api.apiyi.com`（`/v1`なし）        | `https://api.apiyi.com/v1`        |
| 認証ヘッダー    | `x-goog-api-key`                        | `Authorization: Bearer`           |
| 回答の場所     | `candidates[0].content.parts[].text`    | `choices[0].message.content`      |
| ストリーム増分   | 各チャンクの`parts[].text`                    | `choices[0].delta.content`        |
| ストリーム終端   | `finishReason == "STOP"`、**`[DONE]`なし** | `data: [DONE]`                    |
| 終了理由      | 大文字の`STOP` / `MAX_TOKENS`               | 小文字の`stop`                        |
| 思考シグネチャ   | ✅ `thoughtSignature`（ターンをまたいで返却）        | ❌ 非公開                             |
| usage     | `usageMetadata`（各ストリームチャンクで累積）          | `usage`（ストリーム末尾で1回）               |

## 使用量と課金

```python theme={null}
u = data["usageMetadata"]
# promptTokenCount  input / candidatesTokenCount output / thoughtsTokenCount thinking / totalTokenCount total
```

* `thoughtsTokenCount`（推論用 token）は**出力レート**で課金されます。コストを抑えるには、`thinking_level`を使って上限を設定してください。
* キャッシュヒット項目（`cachedContentTokenCount`）の割引については、[Gemini キャッシュ課金](/ja/api-capabilities/gemini/prompt-caching)をご覧ください。
* 完全なフィールドリファレンスは、[Gemini ネイティブ形式ガイド](/ja/api-capabilities/gemini/native)の「使用量フィールド」セクションにあります。

## 関連リンク

* 同じグループ: [Gemini ネイティブフォーマットガイド](/ja/api-capabilities/gemini/native) · [マルチモーダル & コード実行](/ja/api-capabilities/gemini/multimodal) · [Function Calling](/ja/api-capabilities/gemini/function-calling)
* 互換フォーマット対応版: [OpenAI 互換モード: レスポンスの処理](/ja/api-capabilities/openai/response-handling)
* token の取得 / 管理: `https://api.apiyi.com/token`
