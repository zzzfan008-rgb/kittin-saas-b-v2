> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M3

> APIYI の MiniMax-M3: 1M token あたり入力 $0.3 / 出力 $1.2、コンテキストウィンドウ 1,000,000、3 つの課金グループで利用可能です。

最初のオープンウェイトモデルで、フロンティアなエージェント型コーディング、100万 token のコンテキスト、ネイティブなマルチモダリティを組み合わせています; MSA スパースアテンションにより、長文コンテキストでの推論コストを前世代の約1/20に削減します。

## 仕様

| Item                   | Value            |
| ---------------------- | ---------------- |
| **Model ID**           | `MiniMax-M3`     |
| **Vendor**             | MiniMax          |
| **Vendor release**     | 2026-06-01       |
| **Available on APIYI** | 2026-06-05       |
| **Knowledge cutoff**   | 非公開              |
| **Input modalities**   | テキスト、画像、動画       |
| **Output modalities**  | テキスト             |
| **Context window**     | 1,000,000 tokens |
| **Billing**            | 従量課金             |

## 価格

価格は USD で 1M tokens あたり（\$/1M）です。

| 入力    | キャッシュ済み入力 | 出力    |
| ----- | --------- | ----- |
| \$0.3 | \$0.06    | \$1.2 |

<Info>この表は**定価**を示しています。チャージプロモーションとグループ割引は**重複適用**されます。コンソールには実際の課金額がリアルタイムで反映されます。[価格](/ja/pricing) と [チャージプロモーション](/ja/faq/recharge-promotions) をご覧ください。</Info>

## 段階的料金

このモデルは、各リクエストの token 数に応じた段階料金です（出力価格 = ティア入力価格 × 出力倍率）:

* 0 – 524,288 token: \$0.3/1M 入力
* 524,288 超: \$0.6/1M 入力

（すでにベンダーの定価の 50% に割引済みです）

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

| 機能         | 対応状況  |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張推論       | オプトイン |

## 使用例

この例では、`MiniMax-M3` を OpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください。その他はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、ユースケースごとに個別の token を発行し、必要に応じて個別に失効させ、利用状況を個別に把握できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース告知" icon="megaphone" href="/en/news/minimax-m3-launch">
    MiniMax-M3 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="モデル価格ディレクトリ" icon="table" href="/en/models">
    283 モデルすべての最新の価格、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は `models/data/model-details.json` で手動管理されています。価格とエンドポイントはライブ価格 API から取得しており、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は 2026-07-31 です。</Note>
