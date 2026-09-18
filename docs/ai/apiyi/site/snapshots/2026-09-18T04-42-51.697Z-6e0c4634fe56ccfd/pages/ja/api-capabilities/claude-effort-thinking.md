> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Effort & Thinking ガイド

> Anthropic のネイティブ形式で `output_config.effort` とアダプティブ Thinking を正しく使用する方法を、すぐに実行できる完全な例付きで解説します。

このページでは、Claude を **Anthropic ネイティブ Messages API** で呼び出す方法（APIYI ゲートウェイ経由で AWS Bedrock にルーティングされます）と、`output_config.effort`（エフォートレベル）および `thinking`（アダプティブ・シンキング）の正しい使い方を説明します。

チャネル、課金、基本的なオンボーディングについては、まず [Claude API 基礎](/ja/api-capabilities/claude) のページをご覧ください。

<Info>
  対応モデル: Claude Opus 4.8 / 4.7 / 4.6、Sonnet 4.6 など。このページでは **Opus 4.8** を例にしています。
</Info>

## オンラインテストツール

コードを書きたくありませんか？ まずは APIYI のオンライン推論テスターをお試しください。モデルと effort レベルを選び、Max Tokens を設定し、「return thinking summary」をオンにして、各 effort レベルがどのように推論するかをブラウザ上で比較できます。

<Card title="推論テスター · APIYI オンラインツール" icon="flask-conical" href="https://imagen.apiyi.com/#reasoning">
  ブラウザで直接 Claude（および GPT / Gemini）の推論テストを実行できます。コードは不要で、APIYI キーを貼り付けるだけです。
</Card>

<img src="https://mintcdn.com/apiyillc/243pgGcIcpapNSDI/images/claude-effort-reasoning-tool.png?fit=max&auto=format&n=243pgGcIcpapNSDI&q=85&s=5207a7ea87e733a018c55c9480d2bc64" alt="APIYI オンライン推論テスター: effort レベル選択付きの claude-opus-4-8" width="1400" height="856" data-path="images/claude-effort-reasoning-tool.png" />

## リクエスト構造

### エンドポイントとヘッダー

```
POST https://api.apiyi.com/v1/messages
```

| Header              | 値                  | 備考                           |
| ------------------- | ------------------ | ---------------------------- |
| `content-type`      | `application/json` | 固定                           |
| `anthropic-version` | `2023-06-01`       | Anthropic ネイティブのバージョンヘッダー、必須 |
| `x-api-key`         | `your-apiyi-key`   | Anthropic ネイティブ認証            |

<Info>
  APIYI が Bedrock にルーティングする場合でも、**クライアントは引き続き Anthropic ネイティブ形式**（`x-api-key` + `/v1/messages`）を使用します。ゲートウェイが Bedrock の `bedrock-2023-05-31` への変換を内部で処理します。`anthropic_version: bedrock-2023-05-31` を設定する必要は**ありません**。
</Info>

### 最小リクエストボディ

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

## 努力度レベル

`effort` は、Claude が結果の生成に費やす token 数をどれだけ許容するかを制御し、丁寧さと速度/コストの間でトレードオフを取ります。これは、回答、ツール呼び出し、拡張思考を含む**すべて**の token 消費に影響します。

<Warning>
  **主要ルール**

  1. `effort` はトップレベルの単独の `output_config` オブジェクトに入れる必要があり、`thinking` の中に入れてはいけません。誤って配置すると `ValidationException` / 400 が返されます。
  2. **beta ヘッダーは不要です。** Effort は現在、サポートされているすべてのモデルで利用でき、`anthropic-beta: effort-2025-11-24` は不要になりました。
  3. デフォルトは `high` です。`"high"` を設定しても、`effort` を完全に省略した場合と同じように動作します。
</Warning>

### effort を指定したリクエストボディ

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "output_config": {
    "effort": "medium"
  },
  "messages": [
    { "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }
  ]
}
```

### レベルの概要

| レベル      | 説明                              | 一般的な用途                            |
| -------- | ------------------------------- | --------------------------------- |
| `low`    | 最安です。大きな token 節約があり、能力はやや低めです。 | シンプルなタスク、高い同時実行数、サブエージェント         |
| `medium` | バランス型です。中程度の token 節約があります。     | ほとんどのエージェント型ワークフローで妥当なデフォルト       |
| `high`   | デフォルトです。高い能力があります。              | 複雑な reasoning、難しいコーディング、品質に敏感なタスク |
| `xhigh`  | 長期的な拡張能力で、high と max の中間です。     | 長時間のコーディング / エージェント型タスク（30 分超）    |
| `max`    | 制約のない最高峰の能力です。                  | 真に最先端の問題、最も深い reasoning           |

<Tip>
  **Opus 4.8 の推奨**: コーディング / エージェント作業は `xhigh` から始め、ほかの知的負荷の高いタスクには `high` を使い、evals で品質が維持されると確認できてから `medium` / `low` に下げてください。

  `xhigh` / `max` を実行する場合は、`max_tokens` を高めに設定し（まずは 64k を目安に）、思考 + 出力の余地をモデルに残してください。
</Tip>

### 各モデルがサポートするレベル

すべてのモデルがすべてのレベルをサポートしているわけではありません。`xhigh` は Opus 4.7 で追加され、`max` は Sonnet ではサポートされていません:

| レベル                       | Opus 4.6 | Opus 4.7 / 4.8 | Sonnet 4.6 |
| ------------------------- | :------: | :------------: | :--------: |
| `low` / `medium` / `high` |     ✅    |        ✅       |      ✅     |
| `xhigh`                   |     ❌    |        ✅       |      ❌     |
| `max`                     |     ✅    |        ✅       |      ❌     |

<Warning>
  よくある間違い: `claude-opus-4-6` と `effort: "xhigh"` を混同することです。Opus 4.6 には `xhigh` レベルがないため、代わりに `high` / `max` を使うか、モデルを `claude-opus-4-8` に切り替えて `xhigh` を使ってください。
</Warning>

## アダプティブ思考

Opus 4.7 / 4.8 は **アダプティブ思考** を使用します: モデルがいつ、どれだけ考えるかを決め、effort が深さを制御します。

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": {
    "type": "adaptive",
    "display": "summarized"
  },
  "output_config": {
    "effort": "xhigh"
  },
  "messages": [
    { "role": "user", "content": "Walk through and pinpoint the root cause of this production bug" }
  ]
}
```

* `thinking.type: "adaptive"` — アダプティブ思考を有効にします（省略するとモデルは思考しません）。
* `thinking.display: "summarized"` — 応答で **thinking summary** ブロックを返します。表示する必要がなければ省略してください。
* effort と思考の関係: `high` / `xhigh` / `max` はほぼ常に深く考えます。`low` / `medium` は簡単な問題では思考を省略する場合があります。
* `display` のデフォルトはモデルによって異なります: **Opus 4.6 のデフォルトは `summarized`** で、Opus 4.7 / 4.8 のデフォルトは `omitted` です（thinking block 自体は存在しますが、その `thinking` テキストは空で、回答の前に一時停止として表示されます）。サマリーを確実に取得するには、`display: "summarized"` を明示的に設定してください。
* ネイティブ API に `-thinking` サフィックス付きモデルはありません。モデルが思考するかどうかはモデル名のサフィックスではなく `thinking` **パラメータ** で制御されます。`xxx-thinking` はサードパーティのエイリアスにすぎません。ベースモデル ID と `thinking` パラメータだけを使ってください。

<Warning>
  Opus 4.7 / 4.8 は `thinking.type: "enabled"` + `budget_tokens` を**サポートしていません**（400 を返します）。代わりに adaptive + effort を使ってください。
</Warning>

### 思考サマリーの実体とは（重要）

* サマリーは Anthropic（モデル/サービングレイヤー）によって生成されるもので、ゲートウェイでも別のモデルでもありません。生の思考の連鎖が逐語的に返されることはなく、取得できるのは公式サマリーです。
* system prompt で thinking summary のスタイルを変えることはできません。`system` はモデルの思考のしかたと最終回答のスタイルを形作りますが、サマリーは内部推論の読みやすい表現にすぎません。トーン、書式、スタイルの要件は最終回答への制約に入れて、`text` ブロックに反映されるようにしてください。
* モデルに内部推論を回答内で逐語的に出力するよう促さないでください。拒否される場合があります（`stop_reason: "refusal"`、`stop_details.category` が `reasoning_extraction` になることもあります）。推論を確認したい場合は、代わりに `display: "summarized"` サマリーを読み取ってください。

<Info>
  複数ターンの会話を **同じモデル** で続ける場合は、前のターンの thinking blocks を（署名や空テキストのブロックを含めて）変更せずにそのまま返してください。API は **変更された** thinking blocks を拒否します。サマリーを表示するのは問題ありませんが、返す前に編集するのはできません。
</Info>

## レスポンスの解析

レスポンス `content` は、`type` によって区別されるブロックの配列です:

```python theme={null}
for block in data["content"]:
    if block["type"] == "thinking":
        print("[Thinking summary]", block["thinking"])
    elif block["type"] == "text":
        print("[Answer]", block["text"])
```

token の使用量は `usage` フィールドにあります:

```json theme={null}
{
  "usage": {
    "input_tokens": 164,
    "output_tokens": 11056,
    "service_tier": "standard"
  }
}
```

<Info>
  `stop_reason` が `max_tokens` の場合、出力は `max_tokens` によって切り詰められています（高い effort では thinking が簡単に予算を使い切ることがあり）、回答テキストが空になることもあります — その場合は単に `max_tokens` を送出してください。
</Info>

## ストリーミング（stream）中の thinking フィールド

`stream: true` では、thinking コンテンツは `delta.text` では送られてこず、専用のイベントシーケンスとして出力されます。

| イベント                  | フィールド                                              | 備考                                            |
| --------------------- | -------------------------------------------------- | --------------------------------------------- |
| `content_block_start` | `content_block.type = "thinking"`                  | thinking ブロックが開始します                           |
| `content_block_delta` | `delta.type = "thinking_delta"` → `delta.thinking` | 増分サマリテキスト（`delta.text` ではありません）               |
| `content_block_delta` | `delta.type = "signature_delta"`                   | thinking ブロックのシグネチャ。マルチターンを再生する際はそのまま保持してください |
| `content_block_stop`  | —                                                  | thinking ブロックが終了します。続いて `text` ブロックが続きます      |

回答テキストは引き続き `delta.type = "text_delta"` → `delta.text` で送られます。`display: "omitted"` の場合でも thinking ブロックは表示されますが、`delta.thinking` は空文字列です。

## 完全に実行可能なサンプル

```python theme={null}
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("APIYI_API_KEY")
BASE_URL = "https://api.apiyi.com"

resp = requests.post(
    f"{BASE_URL}/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": API_KEY,
    },
    json={
        "model": "claude-opus-4-8",
        "max_tokens": 16000,
        "thinking": {"type": "adaptive", "display": "summarized"},
        "output_config": {"effort": "xhigh"},
        "messages": [
            {"role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith"}
        ],
    },
    timeout=300,
)

data = resp.json()
print("status:", resp.status_code, "| usage:", data.get("usage"))
for block in data.get("content", []):
    if block.get("type") == "thinking":
        print("\n[Thinking summary]\n", block.get("thinking", ""))
    elif block.get("type") == "text":
        print("\n[Answer]\n", block.get("text", ""))
```

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: your-apiyi-key" \
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 16000,
    "thinking": { "type": "adaptive" },
    "output_config": { "effort": "xhigh" },
    "messages": [{ "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }]
  }'
```

## Bedrock ルートの注意事項

| 項目                      | メモ                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `output_config`         | **必ずそのまま通過させる必要があります。** ゲートウェイに`delete output_config`のオーバーライドルールがある場合、effort は黙って破棄されます（200 は返りますが、効果はありません）。                              |
| `effort` 位置             | トップレベルの`output_config`内にあり、`thinking`内には入れません。                                                                                             |
| Beta ヘッダー               | effort にも適応的思考にも不要です。                                                                                                                      |
| `temperature` / `top_p` | アダプティブシンキングを使う Opus 4.7 / 4.8 では、デフォルトのサンプリングを使うべきです。ゲートウェイは通常、これらのモデルではこの 2 つのパラメータを除去します。これは想定どおりで、クライアント側で設定する必要はありません。                 |
| 無効な effort 値            | Bedrock は未知の値に対して **グレースフルに劣化します**（200 を返します）、400 にはなりません。したがって、「無効ならエラーになるか」で effort が通過しているかは判断できません。代わりに、レベルごとに token 数が分岐するかを確認してください。 |

## トラブルシューティング

### `"thinking.type.enabled" is not supported for this model`

AWS（Bedrock）経由で Opus 4.7 / 4.8 を呼び出す際に最もよく発生する 400 エラーは次のとおりです:

```
status_code=400, InvokeModelWithResponseStream: ... Bedrock Runtime,
StatusCode: 400, ValidationException: "thinking.type.enabled" is not supported
for this model. Use "thinking.type.adaptive" and "output_config.effort" to
control thinking behavior.
```

**原因**: リクエストボディがまだ古い固定予算の推論形式 `thinking: { "type": "enabled", "budget_tokens": N }` を使っています。Opus 4.7 / 4.8（および新しいモデル）ではこれが **削除** され、適応型推論のみをサポートします。AWS 側の上流では `ValidationException` の 400 が返されます。これは上の [適応型推論](#adaptive-thinking) セクションの注記と一致しています。

<Warning>
  エラー内の `thinking.type.enabled` は、リクエストの `thinking.type` フィールドが `"enabled"` に設定されていることを示します。同様に `budget_tokens` はもうサポートされていません。`temperature` / `top_p` / `top_k` もこれらのモデルでは削除されており、送信すると 400 になります。
</Warning>

**対処**: `type: "enabled"` と `budget_tokens` を削除し、推論の深さは `adaptive` + `output_config.effort` で制御します。

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": { "type": "adaptive", "display": "summarized" },
  "output_config": { "effort": "xhigh" },
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

| 旧形式（400 エラー）                                               | 新形式                                         |
| ---------------------------------------------------------- | ------------------------------------------- |
| `"thinking": { "type": "enabled", "budget_tokens": 8000 }` | `"thinking": { "type": "adaptive" }`        |
| `budget_tokens` で推論を制御                                     | `output_config.effort` で制御（`low` – `max`）   |
| `temperature` / `top_p` / `top_k`                          | それらは削除するだけです。prompt で誘導すれば、サンプリングパラメータは不要です |

<Info>
  推論なしで実行するには: Opus 4.7 / 4.8 は `thinking: { "type": "disabled" }` を受け付けます。あるいは `thinking` フィールドを単純に省略してください（フィールドがなければ推論なしです）。
</Info>

## 参考資料

* Anthropic — Effort ドキュメント: `platform.claude.com/docs/en/build-with-claude/effort`
* AWS Bedrock — 適応型 thinking: `docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html`
* AWS Bedrock — Claude Opus 4.8: `docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-8.html`
