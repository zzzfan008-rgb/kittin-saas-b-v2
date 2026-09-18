> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.1 Flash-Lite

> APIYI の Gemini 3.1 Flash-Lite：100万 tokens あたり入力 $0.25 / 出力 $1.5、コンテキストウィンドウ 1,048,576、最大出力 65,536、3つの課金グループで利用可能。

同時実行数とバッチ処理に適した、調整可能な推論レベルを備えた低コスト・高スループットのティアです。

## 仕様

| 項目              | 値                                                         |
| --------------- | --------------------------------------------------------- |
| **モデルID**       | `gemini-3.1-flash-lite` · `gemini-3.1-flash-lite-preview` |
| **提供元**         | Google                                                    |
| **APIYIで利用可能**  | 2026-05-09                                                |
| **知識カットオフ**     | 2025-01                                                   |
| **入力モダリティ**     | テキスト, 画像, 動画, 音声, PDF                                     |
| **出力モダリティ**     | テキスト                                                      |
| **コンテキストウィンドウ** | 1,048,576 tokens                                          |
| **最大出力**        | 65,536 tokens                                             |
| **課金**          | 従量課金                                                      |

## 価格

価格は USD 建てで 1M tokens あたりです（\$/1M）。

| 入力     | キャッシュ済み入力 | 出力    |
| ------ | --------- | ----- |
| \$0.25 | \$0.025   | \$1.5 |

<Info>この表は**定価**を示しています。チャージのプロモーションとグループ割引は**併用**できます。コンソールには実際の課金額がリアルタイムで反映されます。[Pricing](/ja/pricing) と [Recharge promotions](/ja/faq/recharge-promotions) をご覧ください。</Info>

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

| グループ             | レート倍率 | 備考     |
| ---------------- | ----- | ------ |
| `Gemini_Reverse` | 0.5×  | 定価の50% |
| `Default`        | 1×    | 定価     |
| `SVIP`           | 1×    | 定価     |

一部のグループには追加割引があり、チャージボーナスと併用できます。[tokensとグループ](/ja/faq/token-and-groups)を参照してください。

## 対応機能

| 機能         | 対応状況 |
| ---------- | ---- |
| ストリーミング    | ✅    |
| ツール呼び出し    | ✅    |
| 構造化出力      | ✅    |
| ビジョン       | ✅    |
| プロンプトキャッシュ | ✅    |
| 拡張推論       | 任意   |

## バリアント

| Model ID                        | 備考                             |
| ------------------------------- | ------------------------------ |
| `gemini-3.1-flash-lite`         | 一般提供モデル名です。                    |
| `gemini-3.1-flash-lite-preview` | プレビュー版時代の名称です。課金とエンドポイントは同一です。 |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）経由で`gemini-3.1-flash-lite`を呼び出します。base\_url は`https://api.apiyi.com/v1`に設定してください — それ以外は公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.1-flash-lite",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードはしないでください。本番環境では、用途ごとに個別の token を発行し、使用を個別に取り消し・把握できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース告知" icon="megaphone" href="/en/news/gemini-3-1-flash-lite-launch">
    Gemini 3.1 Flash-Lite の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="ネイティブ呼び出し" icon="book-open" href="/ja/api-capabilities/gemini/native">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Gemini 3.5 Flash-Lite" icon="git-compare" href="/ja/models/gemini-3-5-flash-lite">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、ビルドごとに更新されます。</Note>
