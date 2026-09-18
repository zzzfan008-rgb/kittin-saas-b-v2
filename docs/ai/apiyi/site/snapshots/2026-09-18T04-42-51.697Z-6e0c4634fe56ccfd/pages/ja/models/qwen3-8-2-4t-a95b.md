> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-2.4T-A95B

> APIYIのQwen3.8-2.4T-A95B：100万tokensあたり入力$1.72 / 出力$5.16、コンテキストウィンドウ262,144、2つの課金グループで利用可能。

オープンウェイトとしてリリースされた初のMaxクラスQwen：2.4TパラメータのスパースMoEで、アクティブパラメータは95B。Qwen3.8-Maxのベースモデルでもあり、オープンリリース版はテキストのみで、Max版のビジョン機能は省かれています。

## 仕様

| 項目                | 値                   |
| ----------------- | ------------------- |
| **モデル ID**        | `qwen3.8-2.4t-a95b` |
| **ベンダー**          | Alibaba             |
| **ベンダーリリース**      | 2026-08-12          |
| **APIYI での利用可能日** | 2026-09-03          |
| **知識カットオフ**       | 非公開                 |
| **入力モダリティ**       | テキスト                |
| **出力モダリティ**       | テキスト                |
| **コンテキストウィンドウ**   | 262,144 tokens      |
| **課金**            | 使用量ベース              |

## 料金

料金は100万 token あたりの米ドル（\$1/100万 token）です。

| 入力     | キャッシュ済み入力 | 出力     |
| ------ | --------- | ------ |
| \$1.72 | \$0.215   | \$5.16 |

<Info>この表は**定価**を示しています。チャージキャンペーンとグループ割引は**併用**され、コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージキャンペーン](/ja/faq/recharge-promotions)をご覧ください。</Info>

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

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[トークンとグループ](/ja/faq/token-and-groups) をご覧ください。

## 対応機能

| 機能         | 対応 |
| ---------- | -- |
| ストリーミング    | ✅  |
| ツール呼び出し    | ✅  |
| 構造化出力      | ✅  |
| プロンプトキャッシュ | ✅  |

## リクエスト例

以下の例では、`qwen3.8-2.4t-a95b`を OpenAI のチャット補完（`/v1/chat/completions`）経由で呼び出します。base\_url を `https://api.apiyi.com/v1` に指定してください。それ以外はすべて公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-2.4t-a95b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み込み、ハードコードしないでください。本番環境では、ユースケースごとに個別の tokens を発行し、必要に応じて個別に失効させ、使用状況を追跡できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Qwen3.7-Max" icon="git-compare" href="/ja/models/qwen3-7-max">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントはライブ料金 API から取得され、再ビルドごとに更新されます。</Note>
