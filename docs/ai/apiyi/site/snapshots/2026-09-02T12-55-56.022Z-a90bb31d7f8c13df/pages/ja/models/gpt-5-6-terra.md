> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Terra

> APIYI の GPT-5.6 Terra: 100万 tokens あたり入力 $2 / 出力 $12、コンテキスト 1,000,000、4つの課金グループで利用可能です。

GPT-5.6 ファミリーの主力ティア: 価格は半額で GPT-5.5 クラスの性能 — 移行時のデフォルトの選択肢です。

## 仕様

| 項目              | 値                |
| --------------- | ---------------- |
| **Model ID**    | `gpt-5.6-terra`  |
| **ベンダー**        | OpenAI           |
| **APIYIで利用可能**  | 2026-07-10       |
| **知識カットオフ**     | 非公開              |
| **入力モダリティ**     | テキスト、画像          |
| **出力モダリティ**     | テキスト             |
| **コンテキストウィンドウ** | 1,000,000 tokens |
| **課金**          | 従量課金             |

## 料金

100万 tokens あたりの USD 価格（\$/1M）。

| 入力  | キャッシュ済み入力 | 出力   |
| --- | --------- | ---- |
| \$2 | \$0.2     | \$12 |

<Info>この表は**定価**を示しています。チャージキャンペーンとグループ割引は**併用できます**。コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージキャンペーン](/ja/faq/recharge-promotions) をご覧ください。</Info>

## 段階料金

このモデルは、各リクエストの token サイズに応じた段階料金です（出力価格 = 段階の入力価格 × 出力倍率）:

* 0 – 272,000 tokens: \$2/1M input
* 272,000 tokens 超: \$4/1M input

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ             | 倍率   | 備考     |
| ---------------- | ---- | ------ |
| `CodexResponses` | 1×   | 定価     |
| `CodexReverse`   | 0.7× | 定価の70% |
| `Default`        | 1×   | 定価     |
| `SVIP`           | 1×   | 定価     |

一部のグループには追加割引があり、チャージ特典と重複適用できます。[Tokens and groups](/ja/faq/token-and-groups)をご覧ください。

## サポートされている機能

| 機能         | サポート状況 |
| ---------- | ------ |
| ストリーミング    | ✅      |
| ツール呼び出し    | ✅      |
| 構造化出力      | ✅      |
| ビジョン       | ✅      |
| プロンプトキャッシュ | ✅      |
| 拡張思考       | オプトイン  |

## 例のリクエスト

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`gpt-5.6-terra`を呼び出します。base\_url を `https://api.apiyi.com/v1` に向ければ、他はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-terra",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、ユースケースごとに個別の token を発行すると、失効や利用状況の帰属を個別に行えます。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース告知" icon="megaphone" href="/en/news/gpt-5-6-launch">
    GPT-5.6 Terra の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="互換モード" icon="book-open" href="/ja/api-capabilities/openai/compatible">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/ja/models/gpt-5-6-sol">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="GPT-5.6 Luna" icon="git-compare" href="/ja/models/gpt-5-6-luna">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    全283モデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は2026-07-31です。</Note>
