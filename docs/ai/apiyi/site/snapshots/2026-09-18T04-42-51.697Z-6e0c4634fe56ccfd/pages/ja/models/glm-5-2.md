> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.2

> APIYI の GLM-5.2: $1.142 の入力 / $3.997 の出力、1M token あたり、コンテキストウィンドウ 1,000,000、3つの課金グループで利用可能です。

約744BパラメータのMoEで、40Bのアクティブ重みを持ち、AA intelligence index におけるオープンモデルの中で第1位です — プロジェクト規模のコーディングや長期的なエージェントに適しています。

## 仕様

| Item                   | Value            |
| ---------------------- | ---------------- |
| **Model ID**           | `glm-5.2`        |
| **Vendor**             | Zhipu            |
| **Available on APIYI** | 2026-06-18       |
| **Knowledge cutoff**   | 2025-11          |
| **Input modalities**   | テキスト             |
| **Output modalities**  | テキスト             |
| **Context window**     | 1,000,000 tokens |
| **Billing**            | 従量課金             |

## 料金

価格は USD 建てで 1M tokens あたりです（\$/1M）。

| 入力      | キャッシュ済み入力 | 出力      |
| ------- | --------- | ------- |
| \$1.142 | \$0.2284  | \$3.997 |

<Info>この表は**定価**を示しています。チャージのプロモーションとグループ割引は**併用可能**です。コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージのプロモーション](/ja/faq/recharge-promotions) をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | サポート |
| ------------------------- | --------------------------------------------- | ---- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅    |
| `OpenAI Responses`        | `POST /v1/responses`                          | —    |
| `Anthropic Messages`      | `POST /v1/messages`                           | —    |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —    |
| `Image Generations`       | `POST /v1/images/generations`                 | —    |
| `Embeddings`              | `POST /v1/embeddings`                         | —    |

## 課金グループ

| グループ         | レート倍率 | 備考     |
| ------------ | ----- | ------ |
| `ClaudeCode` | 0.95× | 定価の95% |
| `Default`    | 1×    | 定価     |
| `SVIP`       | 1×    | 定価     |

一部のグループには追加割引があり、チャージ特典と併用できます。[Tokensとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況  |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張思考       | オプトイン |

## 実例のリクエスト

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`glm-5.2`を呼び出しています。base\_url は `https://api.apiyi.com/v1` に向けてください。その他は公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに別々の token を発行し、個別に失効および利用状況の把握ができるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="ローンチのお知らせ" icon="megaphone" href="/en/news/glm-5-2-launch">
    GLM-5.2の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    全モデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントはライブ料金APIから取得され、ビルドのたびに更新されます。</Note>
