> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Pro

> APIYI 上の DeepSeek V4 Pro: 入力 $1.32 / 出力 $3.96、1M token あたり、コンテキストウィンドウ 1,048,576、3 つの課金グループで利用できます。

1.6T合計 / 49BアクティブのMoEフラッグシップ: エージェント型コーディングにおけるオープンソースのSOTA、SWE-Verified 80.6、thinking effortは最大まで調整可能。

## 仕様

| 項目              | 値                 |
| --------------- | ----------------- |
| **モデル ID**      | `deepseek-v4-pro` |
| **ベンダー**        | DeepSeek          |
| **APIYI で利用可能** | 2026-04-24        |
| **知識のカットオフ**    | 非公開               |
| **入力モダリティ**     | テキスト              |
| **出力モダリティ**     | テキスト              |
| **コンテキストウィンドウ** | 1,048,576 tokens  |
| **課金**          | 従量課金制             |

## 料金

USD の 1M tokens あたりの価格（\$/1M）。

| 入力     | キャッシュされた入力 | 出力     |
| ------ | ---------- | ------ |
| \$1.32 | \$0.043996 | \$3.96 |

<Info>この表は **定価** を示しています。チャージ特典とグループ割引は **併用** できます。コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

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

一部のグループには追加割引があり、チャージ特典と併用できます。[tokenとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況   |
| ---------- | ------ |
| ストリーミング    | ✅      |
| tool呼び出し   | ✅      |
| プロンプトキャッシュ | ✅      |
| 拡張推論       | 任意で有効化 |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）経由で`deepseek-v4-pro`を呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください — それ以外は公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>環境変数からキーを読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、個別に取り消しと使用状況の把握ができるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース発表" icon="megaphone" href="/en/news/deepseek-v4-launch">
    DeepSeek V4 Pro の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="DeepSeek V4 Flash" icon="git-compare" href="/ja/models/deepseek-v4-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    283種類すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは、2026-08-31 11:46 (UTC+8) に更新された最新の料金 API から取得しています。仕様の最終確認日は2026-08-17です。</Note>
