> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash テキスト生成

> DeepSeek V4 Flash GA: 1M コンテキスト、合計 284B / 有効化 13B の MoE、両方のエンドポイントが利用可能です。APIYI では 1M tokens あたり入力 $0.44 / 出力 $1.32 です — DeepSeek はピーク/オフピークで課金し、APIYI は常にピーク階層で課金します — また、計測では 322K-token のコンテキストに 15 秒で応答しました。

DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) は `DeepSeek-V4-Flash-0731` に相当します。
これは、DeepSeek が 2026年7月31日に一般公開へ移行したオープンソースのチェックポイントです。アーキテクチャは 4月のプレビュー版（総パラメータ 284B / 有効化 MoE 13B、コンテキストウィンドウ 1M）と一致しており、DeepSeek によれば再実施したのはポストトレーニング段階のみです。それでも、エージェントベンチマークは大きく向上しました。APIYI は **21件のテストケースに加えて専用のデュアルエンドポイント再テスト** を完了しており、Chat Completions と Responses の両方を直接呼び出せます。

<Info>
  **APIYI が DeepSeek V4 Flash GA をリリースしました**: モデル名 `deepseek-v4-flash-ga-260731`、
  `default` / `svip` グループで利用できます。このモデルは **既定でかなり考え込む** ことに注意してください —
  単純なタスクでは `thinking: {"type": "disabled"}` を明示的に指定してください（下の「推論制御」を参照）。
</Info>

## 主な利点

<CardGroup cols={2}>
  <Card title="実用に耐える1Mコンテキスト" icon="scroll-text">
    厳格な入力上限は1,048,570 tokensです。322K-tokenのneedle-in-a-haystackテストは、正しいヒットで14.77秒で返りました。最大出力は393,216 tokensです。
  </Card>

  <Card title="2つのキャッシュ層" icon="database-zap">
    暗黙キャッシュは設定不要で、2回目の実行で99.9%ヒットします。Responsesでは連鎖する明示キャッシュが追加され、前のコンテキスト全体にヒットします。
  </Card>

  <Card title="スロットリングなしの同時実行" icon="gauge">
    20件の並列リクエストはすべて200で返り、実時間は単発呼び出しより1.3秒長いだけでした — 高同時実行数のエージェントやバッチテキストジョブに適しています。
  </Card>

  <Card title="料金" icon="circle-dollar-sign">
    \$0.44 入力 / \$1.32 出力で1M tokensあたり、キャッシュヒットは\$0.0136まで下がります。DeepSeekは2026年8月17日にピーク/オフピークの2段階課金に移行しました。APIYIは常にピーク料金です。
  </Card>
</CardGroup>

## モデル情報

| Parameter                            | Value                                             |
| ------------------------------------ | ------------------------------------------------- |
| **モデル名**                             | `deepseek-v4-flash-ga-260731`                     |
| **リリース**                             | 2026年7月31日（プレビュー版からGAへ昇格）                         |
| **アーキテクチャ**                          | 総計284B / 起動時13B、MoE                               |
| **コンテキストウィンドウ**                      | 1M（実測の上限 1,048,570 tokens）                        |
| **最大出力**                             | 384K（実測の上限 393,216 tokens）                        |
| **利用可能なグループ**                        | `default`, `svip`                                 |
| **エンドポイント**                          | `POST /v1/chat/completions`, `POST /v1/responses` |
| **深い推論**                             | デフォルトでオン、かつ詳細出力です。`thinking.type`で無効化できます         |
| **ストリーミング**                          | ✅ 両方のエンドポイント                                      |
| **関数呼び出し / tools利用**                 | ✅ 両方のエンドポイント                                      |
| **画像入力**                             | ❌ テキスト専用モデル                                       |
| **Anthropic endpoint / Claude Code** | ❌ 接続されていません — 必要に応じて`deepseek-v4-flash`を使用してください  |

## 計測済み機能マトリクス

2026年8月5日のAPIYIテスト結果（公式の主張と実際の挙動）:

| 機能                       | 公式            | Chat Completions                     | Responses                           |
| ------------------------ | ------------- | ------------------------------------ | ----------------------------------- |
| 基本チャット（非stream / stream） | ✅             | ✅ / ✅ (TTFB 1.43s)                   | ✅ / ✅ (TTFB 2.31s)                  |
| 関数呼び出し（2ラウンドループ）         | ✅             | ✅                                    | ✅                                   |
| 思考切り替え `thinking.type`   | ✅             | ✅ disabled / enabled / auto all work | ✅ reasoning items を出力               |
| 推論ティア                    | ✅             | ⚠️ `minimal` のみが決定的                  | ⚠️ 同様                               |
| 暗黙キャッシュ                  | ✅             | ✅ 2ラウンド目で 99.9% ヒット                  | ✅ 99.9% ヒット                         |
| 明示キャッシュ                  | ✅ (Responses) | —                                    | ✅ `previous_response_id` のチェーニングが必要 |
| 構造化出力                    | ❌             | ❌ 受理されるが、強制されません                     | ❌ 受理されるが、強制されません                    |
| オンライン検索                  | ✅ (Responses) | —                                    | ⚠️ 実装は接続済みですが、バックエンドが 6/6 で失敗       |
| MCP                      | ✅ (Responses) | —                                    | ❌ `AccessDenied`、アカウントレベルの権限        |
| 画像入力                     | —             | ❌                                    | ❌ 明示的なエラー                           |

<Warning>
  **3つの機能は公式シートと一致しません — 統合前にこれらを把握してください**:
  structured output は両方のエンドポイントでサイレントに失敗します（200 を返しながらスキーマ
  全体を無視します — 強制が必要な場合は Function Call を使ってください）；オンライン検索ツールは接続されていますが
  バックエンドがエラーを出し続け、`results` を返しません；MCP は `AccessDenied` を返します
  （モデルの制限ではなく、アカウントレベルの組み込みツール権限です）。
</Warning>

## 推論制御

このモデルは**デフォルトではかなり推論します** — 「9.11 は 9.9 より大きいですか」のような1行の質問でも、
私たちのテストでは 263 推論 token を消費しました（兄弟の `deepseek-v4-flash` は 44 しか使いませんでした）。
簡単なタスクでは明示的に無効化してください:

```python theme={null}
extra_body={"thinking": {"type": "disabled"}}   # reliably off
# or
extra_body={"reasoning_effort": "minimal"}      # 0 reasoning tokens in 10/10 runs
```

<Warning>
  **`reasoning_effort` は単調な階段ではありません。** 2つの質問 × 5ティア × 5サンプル:

  | ティア       | river 中央値 | prob 中央値 |
  | --------- | --------- | -------- |
  | `minimal` | **0**     | **0**    |
  | `low`     | 956       | 367      |
  | `medium`  | 506       | 193      |
  | `high`    | **97**    | **153**  |
  | `max`     | 577       | 173      |

  `high`は両方の質問で`low`より推論量が少なく、ティア内分散
  （`low`は150から1993までの範囲） はティア間の差をはるかに上回ります。
  **信頼できるのは`minimal`だけ** — 低 → 最大 をコストダイヤルだとみなさないでください。
</Warning>

## キャッシュ

### 暗黙キャッシュ（両方のエンドポイントで自動）

同一の長いプレフィックスは 2回目のリクエストでキャッシュヒットします。15,634 token のプレフィックスが 15,616 token（99.9%）に一致し、100万 tokens あたり \$0.028 で課金されます。

<Tip>
  暗黙キャッシュには **バイト単位で同一のプレフィックス** が必要です。タイムスタンプ、
  ランダムID、ユーザー名などの可変要素は prompt の末尾に置き、プレフィックスには混ぜないでください。
</Tip>

### 明示キャッシュ（Responses、連鎖が必要）

**よくあるミス**: `caching` を設定したまま同じ長いプレフィックスを2回再送すると、`cached_tokens` は 0 のままです。正しいパターンは、最初の呼び出しで書き込み、その後 `previous_response_id` で連鎖することです:

| 回       | 呼び出し形式                   | 入力 token | キャッシュ済み token |
| ------- | ------------------------ | -------- | ------------- |
| 1（書き込み） | `caching: enabled`       | 15,629   | 0             |
| 2       | + `previous_response_id` | 15,664   | **15,629**    |
| 3       | + `previous_response_id` | 15,701   | **15,664**    |
| 4       | + `previous_response_id` | 15,738   | **15,701**    |

## クイックスタート

<CodeGroup>
  ```python Python theme={null}
  import os
  from openai import OpenAI

  client = OpenAI(
      api_key=os.environ["APIYI_API_KEY"],
      base_url="https://api.apiyi.com/v1",
  )

  resp = client.chat.completions.create(
      model="deepseek-v4-flash-ga-260731",
      messages=[{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      extra_body={"thinking": {"type": "disabled"}},
  )
  print(resp.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "deepseek-v4-flash-ga-260731",
      "messages": [{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      "thinking": {"type": "disabled"}
    }'
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.APIYI_API_KEY,
    baseURL: "https://api.apiyi.com/v1",
  });

  const resp = await client.chat.completions.create({
    model: "deepseek-v4-flash-ga-260731",
    messages: [{ role: "user", content: "Explain the MoE architecture in one sentence" }],
    thinking: { type: "disabled" },
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

### 構造化出力が必要ですか？ Function Call を使いましょう

`response_format` はこのモデルでは効果がなく、エラーも発生しません。うっかりはまりやすい落とし穴です。実際に制約されるのはツールの引数です：

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "submit_result",
        "description": "Submit the extracted result",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temp_c": {"type": "number"},
            },
            "required": ["city", "temp_c"],
        },
    },
}]

resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "Beijing is 25 degrees today"}],
    tools=tools,
)

import json
print(json.loads(resp.choices[0].message.tool_calls[0].function.arguments))
```

## 料金

| 項目       | 価格                  |
| -------- | ------------------- |
| 入力       | \$0.44 / M tokens   |
| 出力       | \$1.32 / M tokens   |
| キャッシュヒット | \$0.0136 / M tokens |

DeepSeek は 2026年8月17日 00:00 (UTC+8) に2段階課金へ移行し、オフピークはピーク料金の半額です。APIYI は **ピーク帯料金で常時課金** し、時間帯による変動はありません — [DeepSeek の価格変更のお知らせ](/en/news/deepseek-price-increase-2026-08) をご覧ください。[チャージ特典](/ja/faq/recharge-promotions) と併用すると、実質コストをさらに下げられます。

<Info>
  **「フラッグシップの1/10未満」について**: ベンダーのマーケティングは、V4-Pro のプレビュー版時代の \$1.74 / \$3.48 と比較しています。V4-Pro の現在価格 (\$1.32 / \$3.96) と比べると、このモデルは **およそ 1/3** であり、1/10 ではありません。
</Info>

## 関連ページ

<CardGroup cols={2}>
  <Card title="チャット補完" icon="message-square" href="/ja/api-capabilities/deepseek-v4-flash/chat-completions">
    OpenAI互換のチャットエンドポイントとインタラクティブなプレイグラウンド
  </Card>

  <Card title="レスポンス" icon="git-fork" href="/ja/api-capabilities/deepseek-v4-flash/responses">
    連鎖した明示的キャッシュを備えたレスポンスエンドポイント
  </Card>

  <Card title="公開記事と完全なテストデータ" icon="newspaper" href="/en/news/deepseek-v4-flash-ga-launch">
    ベンチマーク、3者間の速度比較、そして私たちがはまった落とし穴
  </Card>

  <Card title="モデル料金表" icon="table" href="/en/models">
    各モデルの単価、エンドポイント、グループ
  </Card>
</CardGroup>
