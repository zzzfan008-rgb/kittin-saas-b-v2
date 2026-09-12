> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Sol

> APIYI の GPT-5.6 Sol: 1M tokens あたり入力 $5 / 出力 $30、コンテキストウィンドウ 1,000,000、4 つの課金グループで利用可能です。

GPT-5.6 ファミリーのフラッグシップ層です。Terminal-Bench 2.1 で 88.8%、BrowseComp で 90.4% を記録しており、`gpt-5.6` エイリアスはここを指します。

## 仕様

| 項目              | 値                |
| --------------- | ---------------- |
| **モデルID**       | `gpt-5.6-sol`    |
| **ベンダー**        | OpenAI           |
| **APIYIで利用可能**  | 2026-07-10       |
| **知識のカットオフ**    | 非公開              |
| **入力モダリティ**     | テキスト、画像          |
| **出力モダリティ**     | テキスト             |
| **コンテキストウィンドウ** | 1,000,000 tokens |
| **課金**          | 従量課金             |

## 料金

価格はUSDの1M tokenあたり（\$/1M）です。

| 入力  | キャッシュ済み入力 | 出力   |
| --- | --------- | ---- |
| \$5 | \$0.5     | \$30 |

<Info>この表は**定価**を示しています。チャージ特典とグループ割引は**併用できます**。コンソールには実際の課金額がリアルタイムで反映されます。詳細は[料金](/ja/pricing)と[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。</Info>

## 階層料金

このモデルは、各リクエストの token 数に基づく階層料金です（出力価格 = 階層の入力価格 × 出力倍率）:

* 0 – 272,000 tokens: \$5/1M input
* 272,000 tokens 超: \$10/1M input

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

| グループ             | レート倍率 | 備考     |
| ---------------- | ----- | ------ |
| `CodexResponses` | 1×    | 定価     |
| `CodexReverse`   | 0.7×  | 定価の70% |
| `Default`        | 1×    | 定価     |
| `SVIP`           | 1×    | 定価     |

一部のグループには追加割引があり、チャージボーナスと併用できます。[tokens とグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応    |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張推論       | オプトイン |

## リクエスト例

この例では、OpenAI Chat Completions（`/v1/chat/completions`）を介して `gpt-5.6-sol` を呼び出します。base\_url を `https://api.apiyi.com/v1` に向けてください — それ以外は公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-sol",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、ユースケースごとに個別の token を発行し、個別に失効させたり利用状況を追跡したりできるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/gpt-5-6-launch">
    GPT-5.6 Sol の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="互換モード" icon="book-open" href="/ja/api-capabilities/openai/compatible">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="GPT-5.6 Terra" icon="git-compare" href="/ja/models/gpt-5-6-terra">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="GPT-5.6 Luna" icon="git-compare" href="/ja/models/gpt-5-6-luna">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金一覧" icon="table" href="/en/models">
    全283モデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は2026-07-31です。</Note>
