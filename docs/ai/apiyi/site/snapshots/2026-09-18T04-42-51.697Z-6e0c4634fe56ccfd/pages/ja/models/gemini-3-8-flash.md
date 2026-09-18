> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash

> APIYI上のGemini 3.8 Flash：100万 tokensあたり入力 $0.75 / 出力 $3.75、2つの課金グループで利用可能。

3.7と同価格の次世代 Flash。150件の測定ケースで項目ごとに同等ですが、公式仕様はまだ公開されていません。thinking の段階は low／medium／high に縮小され、minimal は廃止されました。

## 仕様

| 項目             | 値                  |
| -------------- | ------------------ |
| **モデルID**      | `gemini-3.8-flash` |
| **ベンダー**       | Google             |
| **ベンダーリリース**   | 2026-09-02         |
| **APIYIで利用可能** | 2026-09-02         |
| **知識カットオフ**    | 非公開                |
| **入力モダリティ**    | テキスト、画像、動画、音声      |
| **出力モダリティ**    | テキスト               |
| **課金**         | 使用量ベース             |

## 料金

1M tokensあたりの米ドル価格（\$/1M）です。

| 入力     | キャッシュ済み入力 | 出力     |
| ------ | --------- | ------ |
| \$0.75 | \$0.075   | \$3.75 |

<Info>表の価格は**定価**です。チャージキャンペーンとグループ割引は**併用**され、コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージキャンペーン](/ja/faq/recharge-promotions)をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応状況 |
| ------------------------- | --------------------------------------------- | ---- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅    |
| `OpenAI Responses`        | `POST /v1/responses`                          | —    |
| `Anthropic Messages`      | `POST /v1/messages`                           | —    |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅    |
| `Image Generations`       | `POST /v1/images/generations`                 | —    |
| `Embeddings`              | `POST /v1/embeddings`                         | —    |

## 課金グループ

| グループ      | 倍率 | 備考 |
| --------- | -- | -- |
| `Default` | 1× | 定価 |
| `SVIP`    | 1× | 定価 |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[トークンとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況     |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| ビジョン       | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張思考       | デフォルトで有効 |
| コード実行      | ✅        |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`gemini-3.8-flash`を呼び出します。base\_urlを`https://api.apiyi.com/v1`に指定してください。それ以外は公式APIと同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.8-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別のtokenを発行し、個別に無効化および使用状況の追跡ができるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/gemini-3-8-flash-launch">
    Gemini 3.8 Flash の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Gemini 3.8 Flash の概要" icon="book-open" href="/ja/api-capabilities/gemini-3-8-flash/overview">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="ネイティブ呼び出し" icon="book-open" href="/ja/api-capabilities/gemini/native">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Gemini 3.7 Flash" icon="git-compare" href="/ja/models/gemini-3-7-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ja/models/gemini-3-6-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、再ビルドごとに更新されます。</Note>
