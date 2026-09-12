> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash

> APIYI の Gemini 3.6 Flash: 1M tokens あたり入力 $1.5 / 出力 $7.5、コンテキストウィンドウ 1,048,576、最大出力 65,536、2つの課金グループで利用可能です。

4段階すべてでデフォルトで推論オン、検索グラウンディング、コード実行、URL コンテキストがすべて有効な、マルチモーダル Flash のフラッグシップです。

## 仕様

| 項目              | 値                  |
| --------------- | ------------------ |
| **モデル ID**      | `gemini-3.6-flash` |
| **ベンダー**        | Google             |
| **APIYI で利用可能** | 2026-07-22         |
| **知識のカットオフ**    | 非公開                |
| **入力モダリティ**     | テキスト、画像、音声、動画、PDF  |
| **出力モダリティ**     | テキスト               |
| **コンテキストウィンドウ** | 1,048,576 tokens   |
| **最大出力**        | 65,536 tokens      |
| **課金**          | 使用量ベース             |

## 価格

USD建ての価格です（\$/1M tokens）。

| 入力    | キャッシュ済み入力 | 出力    |
| ----- | --------- | ----- |
| \$1.5 | \$0.15    | \$7.5 |

<Info>この表は**定価**を示しています。チャージプロモーションとグループ割引は**併用**できます。コンソールには実際の請求額がリアルタイムで反映されます。[価格](/ja/pricing) と [チャージプロモーション](/ja/faq/recharge-promotions) をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ      | 倍率 | 注記 |
| --------- | -- | -- |
| `Default` | 1× | 定価 |
| `SVIP`    | 1× | 定価 |

一部のグループには追加割引があり、チャージ特典と併用できます。[Tokens and groups](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応       |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| Vision     | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張思考       | デフォルトで有効 |
| Web検索      | ✅        |
| コード実行      | ✅        |

## 例のリクエスト

以下の例では、`gemini-3.6-flash` を OpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出します。base\_url を `https://api.apiyi.com/v1` に向けてください — それ以外は公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.6-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、ユースケースごとに個別の token を発行し、個別に失効・追跡できるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース発表" icon="megaphone" href="/en/news/gemini-3-6-flash-lite-launch">
    Gemini 3.6 Flash の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="概要" icon="book-open" href="/ja/api-capabilities/gemini-3-6-flash/overview">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="ネイティブ呼び出し" icon="book-open" href="/ja/api-capabilities/gemini/native">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Gemini 3.5 Flash-Lite" icon="git-compare" href="/ja/models/gemini-3-5-flash-lite">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/ja/models/gemini-3-5-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル価格一覧" icon="table" href="/en/models">
    283モデルすべての最新の価格、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は手動で`models/data/model-details.json`管理されています。価格とエンドポイントは、2026-08-31 11:46 (UTC+8) に更新された最新の価格 API から取得され、仕様は2026-07-31に最終確認されています。</Note>
