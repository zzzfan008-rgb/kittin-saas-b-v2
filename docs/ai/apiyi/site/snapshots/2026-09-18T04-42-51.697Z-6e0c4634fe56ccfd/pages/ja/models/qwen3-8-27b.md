> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-27B

> APIYI上のQwen3.8-27B：100万tokenあたり入力$0.44 / 出力$1.76、コンテキストウィンドウ262,144、2つの課金グループで利用可能。

Apache-2.0の高密度27B視覚言語モデルで、テキスト、画像、動画の入力に対応します。同世代のオープンなフラッグシップモデルの90分の1のサイズでありながら、より大規模なオープンリリースで失われている視覚機能を維持しています。

## 仕様

| 項目              | 値              |
| --------------- | -------------- |
| **モデルID**       | `qwen3.8-27b`  |
| **提供元**         | アリババ           |
| **提供元リリース**     | 2026-08-14     |
| **APIYIで利用可能**  | 2026-09-03     |
| **知識カットオフ**     | 非公開            |
| **入力モダリティ**     | テキスト、画像、動画     |
| **出力モダリティ**     | テキスト           |
| **コンテキストウィンドウ** | 262,144 tokens |
| **課金**          | 利用量ベース         |

## 料金

1M token あたりの米ドル価格（\$1M あたり）。

| 入力     | キャッシュ済み入力 | 出力     |
| ------ | --------- | ------ |
| \$0.44 | \$0.088   | \$1.76 |

<Info>表の価格は**定価**です。チャージキャンペーンとグループ割引は**重複適用**され、コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージキャンペーン](/ja/faq/recharge-promotions)をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応状況 |
| ------------------------- | --------------------------------------------- | ---- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅    |
| `OpenAI Responses`        | `POST /v1/responses`                          | —    |
| `Anthropic Messages`      | `POST /v1/messages`                           | —    |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —    |
| `Image Generations`       | `POST /v1/images/generations`                 | —    |
| `Embeddings`              | `POST /v1/embeddings`                         | —    |

## 課金グループ

| グループ      | 倍率 | 注記 |
| --------- | -- | -- |
| `Default` | 1× | 定価 |
| `SVIP`    | 1× | 定価 |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[Tokens とグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応 |
| ---------- | -- |
| ストリーミング    | ✅  |
| ツール呼び出し    | ✅  |
| 構造化出力      | ✅  |
| ビジョン       | ✅  |
| プロンプトキャッシュ | ✅  |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`qwen3.8-27b`を呼び出します。base\_url を`https://api.apiyi.com/v1`に指定してください。それ以外はすべて公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-27b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、必要に応じてそれぞれを無効化したり、使用状況を個別に追跡したりできるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Qwen3.8-2.4T-A95B" icon="git-compare" href="/ja/models/qwen3-8-2-4t-a95b">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、再ビルドのたびに更新されます。</Note>
