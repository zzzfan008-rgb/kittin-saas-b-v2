> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5

> APIYI の Claude Fable 5: 100万 tokens あたり入力 $10 / 出力 $50、4つの課金グループで利用できます。

ソフトウェアエンジニアリングと視覚理解の両方でほぼ SOTA のフラッグシップ。入力と出力は、不正利用検知のため 30 日間保持されます。

## 仕様

| 項目             | 値                                            |
| -------------- | -------------------------------------------- |
| **モデル ID**     | `claude-fable-5` · `claude-fable-5-thinking` |
| **ベンダー**       | Anthropic                                    |
| **APIYIで利用可能** | 2026-06-10                                   |
| **知識カットオフ**    | 非公開                                          |
| **入力モダリティ**    | テキスト、画像                                      |
| **出力モダリティ**    | テキスト                                         |
| **課金**         | 従量課金制                                        |

## 料金

価格は 1M token あたりの USD です（\$/1M）。

| 入力   | キャッシュ済み入力 | 出力   |
| ---- | --------- | ---- |
| \$10 | \$1       | \$50 |

<Info>この表は**定価**を示しています。チャージのプロモーションとグループ割引は**併用**できます。コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージプロモーション](/ja/faq/recharge-promotions) をご覧ください。</Info>

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

| グループ                | レート倍率 | 備考     |
| ------------------- | ----- | ------ |
| `ClaudeCode`        | 0.95× | 定価の95% |
| `ClaudeCodeReverse` | 0.5×  | 定価の50% |
| `Default`           | 1×    | 定価     |
| `SVIP`              | 1×    | 定価     |

一部のグループには追加割引があり、チャージボーナスと併用できます。[Tokensとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応    |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| Vision     | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張思考       | オプトイン |

## バリアント

| モデルID                     | 注記                                                         |
| ------------------------- | ---------------------------------------------------------- |
| `claude-fable-5`          | 標準呼び出し。                                                    |
| `claude-fable-5-thinking` | 強制推論バリアント。料金とエンドポイントは標準モデルと同一で、ClaudeCodeReverseグループを除きます。 |

## 使用例

下の例では、OpenAI Chat Completions（`/v1/chat/completions`）経由で`claude-fable-5`を呼び出します。base\_url を `https://api.apiyi.com/v1` に向ければ、他はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-fable-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに別々の token を発行し、個別に失効・使用状況の把握ができるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/claude-fable-5-launch">
    Claude Fable 5 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Claude API の基本" icon="book-open" href="/ja/api-capabilities/claude">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="推論の強度と推論" icon="book-open" href="/ja/api-capabilities/claude-effort-thinking">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ja/models/claude-opus-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    283 モデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は `models/data/model-details.json` で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は 2026-07-31 です。</Note>
