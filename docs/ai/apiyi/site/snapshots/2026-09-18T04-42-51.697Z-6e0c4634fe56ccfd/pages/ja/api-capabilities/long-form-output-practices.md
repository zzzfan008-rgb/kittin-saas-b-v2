> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 長文出力の実践方法

> 長文出力のワークロード（ドラマ脚本、フィクション、1万語の記事）で確実に結果を得る方法 — ストリーミングを使用し、イベント間隔に合わせて読み取りタイムアウトを設定し、max_tokens に十分な余裕を持たせ、stop_reason を確認します。Claude ネイティブの例付き。

<Info>
  **一言で言うと**：1回の呼び出しで数万文字（エピソードのアウトライン、長編フィクション、大規模な翻訳、大きなコードなど）を生成するようモデルに依頼する場合は、**レスポンスをストリーミングし、非ストリーミングは使用しない**でください。クライアントの読み取りタイムアウトは、*生成全体*の時間ではなく、*データイベント間*の間隔（数十秒 — 90～120秒が安全な値です）に設定してください。`max_tokens` に余裕を持たせ、テキストを使用する前に `stop_reason` を確認してください。この4つを実行すれば、長い出力の呼び出しで「何も返ってこない」ことはなくなります。
</Info>

このページは、すべての大規模モデル（OpenAI、Claude、Gemini、Grokなど）に適用されます。コード例ではClaudeのネイティブ `/v1/messages` を使用しています。OpenAI互換フォーマットとの違いについては、別途説明します。

## 最初に知っておくべき3つのこと

1. **10k語の出力では、実際の生成に10～20分かかるのは正常です。** モデルは数万文字をtokenごとに出力し、さらに推論／thinkingフェーズもあるため、エンドツーエンドのレイテンシーは実際に長くなります。これはゲートウェイが遅いのではなく、生成そのものに時間がかかっているためです。

2. **非ストリーミングでは、すべてをバッファリングしてから送信します。** 非ストリーミング（`stream`が省略されている、または`false`の場合）では、サーバーはモデルが生成全体を完了するまで待機し、その後にレスポンスボディ全体を一度に返す必要があります。その数分間、クライアントの読み取りタイムアウトとの競争になり、生成が長いほど結果が到着する前に切断される可能性が高くなります。また、例外は空であることが多く（`httpx.ReadError`の`str(e)`が空欄）、原因を確認できません。

3. **接続が切断されても課金されるため、無計画なリトライは二重課金になります。** サーバーが出力を生成した時点で、結果が届かなかった場合でも呼び出しは課金されます。すでにボディの一部を受信した後にリトライすると、モデルは再度実行され、再び料金が発生します。

## ストリーミングを使用し、非ストリーミングは使用しない

ストリーミング（`stream: true`）では、最初のバイトが数秒以内に到着し、その後は数十秒ごとにデータイベントが到着します。読み取りタイムアウトは、何分も実行される生成全体ではなく、*イベント間*の間隔だけをカバーすればよいため、ストリーミングは長い出力を確実に配信できます。

2つのプロトコルには**異なる終端記号**があります。混同しないでください。

| プロトコル                            | 終端記号                                   | テキストの読み取り方                                                            |
| -------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| Claude ネイティブ `/v1/messages`      | `event: message_stop`（**`[DONE]` なし**） | `delta.type == "text_delta"` を持つ `content_block_delta` の `delta.text` |
| OpenAI 互換 `/v1/chat/completions` | `data: [DONE]`                         | `choices[0].delta.content`                                            |

アダプティブthinkingが有効な場合、Claude ネイティブは最初に `type: "thinking"` ブロック（その増分は `thinking_delta`）を出力し、その後に `text` ブロックを出力します。レンダリング時は、`thinking_delta` と `text_delta` を別々にルーティングし、thinkingを本文テキストに連結しないでください。

最小限のClaude ネイティブ `/v1/messages` ストリーミング例（プレーンなhttpx、行ごとのSSE解析）:

```python theme={null}
import json
import httpx

def generate_long_text(prompt, api_key, model="claude-opus-5", max_tokens=64000):
    url = "https://api.apiyi.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "accept": "text/event-stream",
    }
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "stream": True,                        # key: long output must stream
        "thinking": {"type": "adaptive"},      # adaptive thinking; the model decides depth
        "messages": [{"role": "user", "content": prompt}],
    }
    # Three-part timeout: read only covers the inter-event gap, not the whole generation
    timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)

    text, stop_reason = [], None
    with httpx.Client(timeout=timeout) as c:
        with c.stream("POST", url, json=payload, headers=headers) as r:
            if r.status_code != 200:
                raise RuntimeError(f"HTTP {r.status_code}: {r.read()[:400]}")
            event, data = None, []
            for line in r.iter_lines():
                if line == "":                 # events are separated by a blank line
                    if data:
                        d = json.loads("\n".join(data))
                        t = d.get("type") or event
                        if t == "content_block_delta" and d.get("delta", {}).get("type") == "text_delta":
                            text.append(d["delta"]["text"])
                        elif t == "message_delta":
                            stop_reason = d.get("delta", {}).get("stop_reason") or stop_reason
                    event, data = None, []
                    continue
                if line.startswith("event:"):
                    event = line[6:].strip()
                elif line.startswith("data:"):
                    data.append(line[5:].strip())
    # A Claude stream ends on message_stop, never [DONE]
    if stop_reason == "max_tokens":
        raise RuntimeError(f"truncated by max_tokens after {len(''.join(text))} chars; raise max_tokens and retry")
    return "".join(text).strip()
```

<Tip>
  公式のanthropic SDKを使用する場合は、`base_url` を `https://api.apiyi.com` に指定し、`client.messages.stream(...).get_final_message()` を使用してください。SDKがSSE解析、タイムアウト、`stop_reason` を処理します。上記のhttpx版は、SDKを導入したくない場合のためのものです。
</Tip>

## 読み取りタイムアウトは総時間ではなくイベント間隔に合わせて設定する

多くの人は、生成全体をカバーするために読み取りタイムアウトを非常に大きな値（たとえば 1800 秒）に設定しますが、それでもタイムアウトします。これは、非ストリーミングではその値が生成全体と競合し、わずかな中断でも失敗するためです。正しいアプローチは、ストリーミングとイベント間隔に合わせた読み取りタイムアウトの組み合わせです。

測定参照値（`claude-opus-5` が約 15k 文字の入力から約 20k 文字のエピソード概要を生成した場合）：

| 指標            | 測定値                            |
| ------------- | ------------------------------ |
| 最初のバイトまでの時間   | 3 ～ 130 秒                      |
| 推論中の最大無通信間隔   | 約 42 秒（その間に keepalive ping あり） |
| エンドツーエンドの合計時間 | 9 ～ 12 分                       |

**90～120 秒**の読み取りタイムアウトであれば、最大のイベント間隔を余裕を持ってカバーできます。数分に及ぶ値は不要です。3 部構成のタイムアウトではフェーズを分割し、それぞれに適切な値を設定できます。

```python theme={null}
# connect: establish; write: upload the request body; read: max gap between reads
timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)
```

## max\_tokens に余裕を持たせ、stop\_reason を確認する

長い出力は `max_tokens` の上限に達して切り詰められやすくなります。これは特に Claude のような **thinking を有効化したモデルで顕著です — thinking 自体が `max_tokens` の予算を消費します**。長い文章では、その予算を使い切ることがあります。

* **`max_tokens` は 64000 から開始してください**（高い effort / 深い thinking ではさらに多く指定してください。`claude-opus-5` は 128K 出力に対応しています）。
* **レスポンスを使用する前に `stop_reason` を確認してください:**
  * `end_turn` — 正常に完了しており、テキストは完全です。これが唯一の成功です。
  * `max_tokens` — 切り詰められており、テキストが不完全、または空の場合もあります。これは**切り詰め**であり、「空の結果」ではありません — `max_tokens` を増やして再試行してください。
  * `refusal` — 安全ポリシーにより拒否されました。別途処理してください。

`str(e)` だけ、または「テキストが空」であることだけで成功を判断するのは誤解を招きます — 空の本文は通常、`max_tokens` による切り詰めです。

## リトライ戦略

長い出力に対するリトライは慎重に行い、「失敗時にリトライ」が「二重課金と2回目の長時間実行」にならないようにします。

* **レスポンスヘッダーの到着前に発生した失敗、および `5xx` / `429` に対してのみリトライします**（バックオフを使用し、最大2回まで）。これらは接続または一時的な問題であり、リトライが合理的です。
* **ボディの一部をすでに受信した後に切断されたstreamを、無条件にリトライしないでください。** サーバーはすでに生成と課金を行っており、リトライすると再度実行され、再度支払うことになります。
* 照合とトラブルシューティングのために、レスポンスヘッダー内のリクエストIDをログに記録します。

## シナリオ早見表

| シナリオ                | 一般的な出力       | max\_tokens       | 読み取りタイムアウト |
| ------------------- | ------------ | ----------------- | ---------- |
| ドラマ／ショートドラマのエピソード概要 | 10k – 30k 文字 | 64000             | 90 – 120 秒 |
| フィクション（小説／章）        | 10k – 50k 文字 | 64000 – 128000    | 90 – 120 秒 |
| 長文翻訳                | ソースに応じて変動    | ソースの token の約1.5倍 | 90 – 120 秒 |
| 大規模なコード生成           | 数千行          | 32000 – 64000     | 90 – 120 秒 |

常に stream を使用してください。`api.apiyi.com`（中国本土で推奨）または`vip.apiyi.com`（海外で推奨）を使用し、**`api-cf.apiyi.com`は使用しないでください**（CDNノードは約100秒で`524`を返し、長いリクエストを処理できません）。

## 関連

<CardGroup cols={2}>
  <Card title="APIのタイムアウトを回避する方法" icon="clock" href="/ja/faq/timeout-configuration">
    シナリオ別のタイムアウト値
  </Card>

  <Card title="ストリーミングと非ストリーミングの比較" icon="git-compare" href="/ja/faq/streaming-vs-non-streaming">
    トレードオフと選択方法
  </Card>

  <Card title="Claudeの推論とエフォート" icon="brain" href="/ja/api-capabilities/claude-effort-thinking">
    適応型推論、エフォート層、max\_tokens、切り詰め
  </Card>

  <Card title="Claudeのレスポンス処理" icon="code" href="/ja/api-capabilities/claude-response-handling">
    ネイティブレスポンス形式、SSEイベント、stop\_reason
  </Card>
</CardGroup>
