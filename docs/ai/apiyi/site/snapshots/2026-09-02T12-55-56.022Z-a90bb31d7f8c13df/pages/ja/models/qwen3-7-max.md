> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.7-Max

> APIYI 上の Qwen3.7-Max: 1M tokens あたり入力 $1.714 / 出力 $5.142、コンテキストウィンドウ 1,000,000、3つの課金グループで利用可能。

AA intelligence index（56.6）では世界トップ5、中国系モデルの中で1位で、自律エージェントの実行時間は約35時間規模です。

## 仕様

| 項目              | 値                |
| --------------- | ---------------- |
| **Model ID**    | `qwen3.7-max`    |
| **ベンダー**        | Alibaba          |
| **APIYIで利用可能**  | 2026-05-21       |
| **知識のカットオフ**    | 公開されていません        |
| **入力モダリティ**     | Text             |
| **出力モダリティ**     | Text             |
| **コンテキストウィンドウ** | 1,000,000 tokens |
| **課金**          | 従量課金             |

## 料金

USD 建ての 1M tokens あたりの価格（\$/1M）。

| 入力      | キャッシュ済み入力 | 出力      |
| ------- | --------- | ------- |
| \$1.714 | —         | \$5.142 |

<Info>この表は**リスト価格**を示しています。チャージ特典とグループ割引は**併用可能**です。コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ         | レート倍率 | 備考     |
| ------------ | ----- | ------ |
| `ClaudeCode` | 0.95× | 定価の95% |
| `Default`    | 1×    | 定価     |
| `SVIP`       | 1×    | 定価     |

一部のグループには追加割引があり、チャージ特典と併用できます。[トークンとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応 |
| ---------- | -- |
| ストリーミング    | ✅  |
| ツール呼び出し    | ✅  |
| 構造化出力      | ✅  |
| プロンプトキャッシュ | —  |

## リクエスト例

下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`qwen3.7-max`を呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください — それ以外はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.7-max",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、取り消しと使用状況の帰属を個別に行えるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース告知" icon="megaphone" href="/en/news/qwen-3-7-max-launch">
    Qwen3.7-Max の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="モデル料金一覧" icon="table" href="/en/models">
    全283モデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントはライブ料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は2026-07-31です。</Note>
