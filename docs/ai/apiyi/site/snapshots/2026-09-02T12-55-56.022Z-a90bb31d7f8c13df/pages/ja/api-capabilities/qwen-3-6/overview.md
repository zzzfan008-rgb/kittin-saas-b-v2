> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 テキストモデルシリーズ（レガシー）

> APIYI の Alibaba の Qwen3.6 ファミリー：Max-Preview のコーディング旗艦 + Flash の速度重視マルチモーダル + Plus のバランス型ワークホース + 27B / 35B-A3B のオープンウェイト版（APIYI がホストするため GPU レンタルは不要です）。すべて Aliyun の公式リレー経由でルーティングされ、OpenAI Chat 互換です。表示価格は Alibaba の公式レートと一致し、APIYI のチャージボーナスにより実効単価は表示価格の約 85% になります。

<Warning>
  **このページは旧アーカイブです。** Alibaba Qwenの現在のフラッグシップは[Qwen3.8-Max](/ja/api-capabilities/qwen-3-8/overview)で、2026年8月にリリースされました。2.4Tパラメータ、1Mコンテキスト、ネイティブな画像・動画入力に対応し、Alibabaの公式価格より17.5％低く設定されています。以下の5つのQwen3.6モデルは、価格と統合方法を変更せずに引き続き呼び出し可能ですが、新規プロジェクトはQwen3.8-Maxから始めるべきです。
</Warning>

Qwen3.6はAlibaba Tongyi Qianwenの次世代モデルファミリーで、2026年第2四半期に、3つのクローズドソースの本番向けティア — **Max**（フラッグシップ）、**Plus**（バランス重視）、**Flash**（速度重視）— に加えて、2つのオープンウェイト版: **27B** と **35B-A3B** としてリリースされました。APIYIは5モデルすべてを **Aliyun公式リレー / APIYIホストのリレー** 経由で提供し、OpenAI Chat Completions互換です。クローズドソースのティアは公式ポータルの認証とレート制限ポリシーに準拠しており、**オープンウェイトのティアはAPIYIの公式リレーでホストされるため、顧客はGPUをレンタルしたりローカル推論環境を立ち上げたりする必要がありません**。

<Note>
  **🚀 ハイライト**: Max-Previewは、SWE-bench Pro と Terminal-Bench 2.0 を含む6つのコーディングベンチマークで **#1** を主張しています。Flashは、ネイティブな256K（1Mまで拡張可能）のマルチモーダルコンテキストを備えた35B-A3B MoEです。Plusは、1Mコンテキストウィンドウを持つ72B/18Bアクティブの主力モデルです。オープンウェイトの **`qwen3.6-27b`**（27B dense）と **`qwen3.6-35b-a3b`**（35B MoE / 3B active）はAPIYIの公式リレーでホストされており、GPUレンタルは不要で、tokenごとに課金されます。**コーディングエージェント、長文コンテキストRAG、マルチモーダルの振り分け、監査可能な重みを必要とするコンプライアンス重視のワークロード向けに設計されています**。
</Note>

### クローズドソースの本番向けティア（Aliyun公式リレー）

<CardGroup cols={3}>
  <Card title="qwen3.6-max-preview" icon="trophy">
    **コーディング向けフラッグシップ**

    6つのコーディングベンチマークで#1、AIME 2025で93％、GPQAで86％、LiveCodeBenchで79％。
  </Card>

  <Card title="qwen3.6-flash" icon="bolt">
    **速度重視のマルチモーダル**

    35B-A3B MoE、ネイティブなテキスト / 画像 / 動画入力、256Kのベースコンテキストを1Mまで拡張可能。
  </Card>

  <Card title="qwen3.6-plus" icon="scale">
    **バランス重視の主力モデル**

    総計72B / アクティブ18B、1Mコンテキスト、Terminal-Bench 61.6でClaude Opus 4.5を上回ります。
  </Card>
</CardGroup>

### オープンウェイトのティア（APIYIがホスト・GPUレンタル不要）

<CardGroup cols={2}>
  <Card title="qwen3.6-27b" icon="box">
    **27B dense · コーディングの高性能モデル**

    Qwenチームのオープンウェイト版リリース（Hugging Face `Qwen/Qwen3.6-27B`）。コーディング性能は397B級モデルに匹敵します。APIYIの公式リレーでホストされており、ローカルGPUは不要です。
  </Card>

  <Card title="qwen3.6-35b-a3b" icon="boxes">
    **35B-A3B オープンウェイトMoE**

    Qwenチームのオープンウェイト版リリース（Hugging Face `Qwen/Qwen3.6-35B-A3B`）。クローズドソースのFlashと同系統ですが、配布ティアが異なります。アクティブパラメータは3Bのみで、計算コストは非常に低いです。
  </Card>
</CardGroup>

## なぜ APIYI の Qwen3.6 を Aliyun 公式リレー経由で使うのですか？

Alibaba Cloud Bailian の公式チャネルに合わせて調整され、**安定性**、**コスト**、**統合のしやすさ**の各面でエンタープライズ本番向けに深く最適化されています:

<CardGroup cols={2}>
  <Card title="Aliyun 公式リレー" icon="server">
    Alibaba Cloud Bailian の公式チャネル経由でルーティングされます。認証とレート制限ポリシーは公式ポータルと同等で、国内では低レイテンシー、エンタープライズ級の SLA を提供します。
  </Card>

  <Card title="同時実行数の上限なし · 自由にスケール" icon="infinity">
    RPM / TPM の厳格な上限はありません（上流供給に依存します）。エンタープライズのお客様は需要に応じてスケールでき、高同時実行数の調整にはチケットと専用チャネルをご利用いただけます。
  </Card>

  <Card title="定価一致 + チャージで約15%オフ" icon="percent">
    定価は Alibaba Cloud の公式レートと同じです。[チャージ特典](/ja/faq/recharge-promotions)と組み合わせると、実質単価は\*\*定価の約85%\*\*になります。
  </Card>

  <Card title="世界中から摩擦なくアクセス" icon="globe">
    **海外サーバーやプロキシは不要です**。国内データセンター、家庭用ブロードバンド、海外ノードのいずれからも `api.apiyi.com` に直接接続できます。海外移行は不要です。
  </Card>

  <Card title="OpenAI 互換エコシステムを完全サポート" icon="layers">
    OpenAI Chat Completions 互換です。APIYI の [統一モデルカタログ](/ja/api-capabilities/model-info) を通じて、GPT / Claude / DeepSeek / GLM などをシームレスに切り替えられます。
  </Card>

  <Card title="プロフェッショナルサービス · エンタープライズサポート" icon="handshake">
    モデル選定と Agent ワークフローに深い知見があります。エンタープライズのお客様には、PoC → カナリア → 本番までを一貫してサポートします。
  </Card>
</CardGroup>

## 5つのモデルの選び方

<CardGroup cols={2}>
  <Card title="Max-Preview · コーディング & 複雑な推論" icon="trophy">
    **シナリオ**: コーディングエージェントのドライバー、実運用のソフトウェアエンジニアリングタスク（SWE-Verified クラス）、Cursor / Claude Code ワークフローの主モデル。

    **ベンチマーク**: SWE-bench Pro 58.4（GLM-5.1 の 56.6 を上回る）、AIME 2025 93%、GPQA 86%、LiveCodeBench 79%、Terminal-Bench 2.0 第1位。

    **注記**: Preview 指定です — 重みはまだ調整中です。本番トラフィックを切り替える前に、小規模なカナリアを実行してください。
  </Card>

  <Card title="Flash · 大量処理向けマルチモーダル長文コンテキスト" icon="bolt">
    **シナリオ**: 画像 / 動画の理解、長文ドキュメントの要約、大量翻訳、RAG 後の全文書要約・統合。

    **アーキテクチャ**: 総計 35B / 3B アクティブ MoE（35B-A3B）、ネイティブ 256K コンテキストで 1M tokens まで拡張可能。

    **マルチモーダル**: ネイティブのテキスト / 画像 / 動画入力。単価は Max の約 1/8。
  </Card>

  <Card title="Plus · バランスの取れた主力モデル" icon="scale">
    **シナリオ**: 日常対話、カスタマーサポート、コンテンツ生成、企業ナレッジベースの Q\&A、中程度の複雑さの推論。

    **アーキテクチャ**: 総計 72B / 18B アクティブ MoE — 推論速度は Claude Opus 4.6 の約 3 倍です。

    **ベンチマーク**: Terminal-Bench 2.0 では 61.6 で Claude Opus 4.5（59.3）を上回り、SWE-bench Verified は 78.8。
  </Card>

  <Card title="qwen3.6-27b · オープンウェイトのコーディング向け主力" icon="box">
    **シナリオ**: コスト重視のコーディング支援、ローカルデプロイに移る前の API 検証フェーズ、監査可能なオープンソースライセンスを必要とする顧客。

    **注記**: 27B の dense モデルで、オープンウェイトです。コーディング能力は 397B 級モデルに匹敵します。APIYI がホストします — ローカル GPU は不要です。
  </Card>

  <Card title="qwen3.6-35b-a3b · オープンウェイトの高速 MoE" icon="boxes">
    **シナリオ**: 高頻度・低コストのワークフロー、セルフホスト推論へ移る前の移行フェーズ、コンプライアンスのためにダウンロード可能な重みが必要なプロジェクト。

    **注記**: クローズドソースの Flash と同系統です（総計 35B / 3B アクティブ）。オープンウェイト版は APIYI がホストします — GPU のレンタル、デプロイ、運用は不要です。
  </Card>

  <Card title="推奨ルーティング" icon="route">
    **戦略**: デフォルトは Flash + エスカレーション時は Plus + 上限として Max-Preview。超コスト重視のワークロードではオープンウェイト 27b / 35b-a3b にダウングレードします。

    日常的な対話とマルチモーダルのバッチは Flash に振り分け、より強い推論が必要なら Plus にエスカレーションし、コーディングエージェント、複雑な推論、マルチステップ計画には Max-Preview を確保してください。コストが最重要、または監査可能な重みが必要な場合は、オープンウェイトの階層に切り替えます。
  </Card>
</CardGroup>

## 料金

5つのモデルはいずれも **従量課金 - チャット** で課金されます。クローズドソースの階層（Max-Preview / Flash / Plus）は、1回のリクエストの合計入力 token数に基づく **階層制料金** を採用しています。オープンウェイトの階層（27b / 35b-a3b）は **一律料金 — 階層なし** で課金されます。定価は Alibaba Cloud の公式レートと一致し、APIYI のチャージ特典により実質単価はおおむね **定価の85%** になります。

### qwen3.6-max-preview

| 1回のリクエストの入力 token数 | 入力価格                 | 出力価格                  |
| ------------------ | -------------------- | --------------------- |
| **0 – 128K**       | \$1.2800 / 1M tokens | \$7.6800 / 1M tokens  |
| **128K – 256K**    | \$2.1200 / 1M tokens | \$12.7200 / 1M tokens |

### qwen3.6-flash

| 1回のリクエストの入力 token数 | 入力価格                 | 出力価格                 |
| ------------------ | -------------------- | -------------------- |
| **0 – 256K**       | \$0.1700 / 1M tokens | \$1.0200 / 1M tokens |
| **256K – 1000K**   | \$0.6800 / 1M tokens | \$4.0800 / 1M tokens |

### qwen3.6-plus

| 1回のリクエストの入力 token数 | 入力価格                 | 出力価格                 |
| ------------------ | -------------------- | -------------------- |
| **0 – 256K**       | \$0.3000 / 1M tokens | \$1.8000 / 1M tokens |
| **256K – 1000K**   | \$1.2000 / 1M tokens | \$7.2000 / 1M tokens |

### qwen3.6-27b (open-weight · APIYI hosted)

| 課金           | 入力価格                 | 出力価格                 |
| ------------ | -------------------- | -------------------- |
| **一律（階層なし）** | \$0.4200 / 1M tokens | \$2.5200 / 1M tokens |

### qwen3.6-35b-a3b (open-weight · APIYI hosted)

| 課金           | 入力価格                 | 出力価格                 |
| ------------ | -------------------- | -------------------- |
| **一律（階層なし）** | \$0.2600 / 1M tokens | \$1.5600 / 1M tokens |

<Info>
  **料金に関する注記**:

  * **クローズドソースの階層（階層制料金）**: 階層は **1回のリクエストの合計入力 token数** で決まります。そのリクエスト内のすべての token（入力 + 出力）は、その階層のレートで課金されます。**階層をまたいだ按分はありません** — たとえば、入力 token が 300K の Flash リクエストは `256K – 1000K` に入り、リクエスト全体が \$0.68 / \$4.08 で課金されます。最初の 256K は安く、残りの 44K を上位階層に分けることはありません。
  * **オープンウェイトの階層（一律料金）**: `qwen3.6-27b` と `qwen3.6-35b-a3b` は APIYI の公式リレーでホストされています — 階層はありません。利用者は GPU を借りたりローカル推論を実行したりする必要がなく、実際の token 消費量に応じて直接精算できます。
  * 定価は Alibaba Cloud Bailian と一致します。[チャージ特典](/ja/faq/recharge-promotions) を利用すると、実質単価はおおむね **定価の85%** になります。
  * キャッシュヒット時の課金は現時点では個別に開示されておらず、ベース階層にフォールバックします。
</Info>

## 仕様

### クローズドソースの本番向けティア

| 項目                           | qwen3.6-max-preview   | qwen3.6-flash   | qwen3.6-plus        |
| ---------------------------- | --------------------- | --------------- | ------------------- |
| **モデル ID**                   | `qwen3.6-max-preview` | `qwen3.6-flash` | `qwen3.6-plus`      |
| **アーキテクチャ**                  | Dense 大規模モデル          | MoE 35B-A3B     | MoE 72B / 18B アクティブ |
| **コンテキスト**                   | 262K tokens           | 256K（1M まで拡張可能） | 1M tokens           |
| **入力モダリティ**                  | テキスト                  | テキスト / 画像 / 動画  | テキスト                |
| **出力形式**                     | テキスト                  | テキスト            | テキスト                |
| **ストリーミング**                  | ✅ 対応                  | ✅ 対応            | ✅ 対応                |
| **Function calling / ツール使用** | ✅ 対応                  | ✅ 対応            | ✅ 対応                |
| **思考連鎖**                     | ✅ 推論タスクで自動有効          | —               | ✅ 常時有効              |
| **課金**                       | 従量課金チャット（段階制）         | 従量課金チャット（段階制）   | 従量課金チャット（段階制）       |
| **チャネル**                     | Aliyun 公式リレー          | Aliyun 公式リレー    | Aliyun 公式リレー        |

### APIYI がホストするオープンウェイトのティア

| 項目                           | qwen3.6-27b                                          | qwen3.6-35b-a3b                                          |
| ---------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| **モデル ID**                   | `qwen3.6-27b`                                        | `qwen3.6-35b-a3b`                                        |
| **アーキテクチャ**                  | 27B dense                                            | MoE 35B 合計 / 3B アクティブ                                    |
| **ライセンス**                    | Qwen team のオープンウェイト（Hugging Face `Qwen/Qwen3.6-27B`） | Qwen team のオープンウェイト（Hugging Face `Qwen/Qwen3.6-35B-A3B`） |
| **コンテキスト**                   | 公式ウェイトカードと一致                                         | 公式ウェイトカードと一致                                             |
| **入力モダリティ**                  | テキスト                                                 | テキスト                                                     |
| **ストリーミング**                  | ✅ 対応                                                 | ✅ 対応                                                     |
| **Function calling / ツール使用** | ✅ 対応                                                 | ✅ 対応                                                     |
| **課金**                       | 従量課金チャット（定額、段階なし）                                    | 従量課金チャット（定額、段階なし）                                        |
| **チャネル**                     | APIYI ホストのリレー                                        | APIYI ホストのリレー                                            |

<Tip>
  **オープンウェイトをホストする理由**: オープンウェイトのチェックポイントは公開ダウンロード可能ですが、実行には GPU、VRAM、運用が必要です。**APIYI はこれらのオープンウェイトを公式リレーでホストしているため**、API を直接呼び出せます。これにより、「監査可能なウェイト、制御可能なライセンス」という利点を保ちながら、レンタル、デプロイ、運用コストを省けます。
</Tip>

## エンドポイント

| エンドポイント                | メソッド   | Content-Type       | 目的                                                      |
| ---------------------- | ------ | ------------------ | ------------------------------------------------------- |
| `/v1/chat/completions` | `POST` | `application/json` | 対話 / 推論 / ツール使用（**5つのモデルすべてで共通**、異なるのは `model` フィールドのみ） |

<Tip>
  **ドメイン**: `api.apiyi.com` が主なゲートウェイです。`b.apiyi.com` / `vip.apiyi.com` のような代替ゲートウェイでも同一のレスポンスが返ります。OpenAI / OpenAI-compatible SDK を直接使うには、`base_url` を `https://api.apiyi.com/v1` に設定してください。
</Tip>

## コード例

### Python（OpenAI SDK互換）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Max-Preview: coding Agent driver
resp = client.chat.completions.create(
    model="qwen3.6-max-preview",
    messages=[
        {"role": "system", "content": "You are a senior Python engineer. Return changes as a unified diff."},
        {"role": "user", "content": "Add type hints and fix any latent bugs in this snippet ..."}
    ]
)
print(resp.choices[0].message.content)

# Flash: image + text multimodal input
resp = client.chat.completions.create(
    model="qwen3.6-flash",
    messages=[
        {"role": "user", "content": [
            {"type": "text", "text": "Describe the key information in this image."},
            {"type": "image_url", "image_url": {"url": "https://your-image-url.png"}}
        ]}
    ]
)
print(resp.choices[0].message.content)

# Plus: daily dialog and mid-complexity reasoning
resp = client.chat.completions.create(
    model="qwen3.6-plus",
    messages=[{"role": "user", "content": "Introduce yourself in one sentence."}]
)
print(resp.choices[0].message.content)
```

### Node.js

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

const resp = await client.chat.completions.create({
  model: 'qwen3.6-plus',
  messages: [{ role: 'user', content: 'Introduce yourself in one sentence.' }],
});

console.log(resp.choices[0].message.content);
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.6-max-preview",
    "messages": [
      {"role": "user", "content": "Explain what an MoE architecture is."}
    ]
  }'
```

## ベストプラクティス

<Steps>
  <Step title="タスクごとに適切なティアを選ぶ">
    日常的な対話 / 分類 / マルチモーダルバッチ処理には Flash をデフォルトにしてください。中程度の複雑さの推論やエンタープライズのナレッジベース Q\&A には Plus を使ってください。コードエージェント、複雑な計画、または競技レベルの数学推論にのみ Max-Preview へ上げてください。可能なら常に 1 つ下のティアに下げてください。
  </Step>

  <Step title="ティア境界を見積もる">
    リリース前に、P95 の入力 token 数をプロファイルしてください。Max-Preview で 128K を超える、または Flash / Plus で 256K を超えると、価格が大きく跳ね上がります。非常に長いコンテキストは要約 / チャンク化して、P95 を下位ティア内に収めてください。
  </Step>

  <Step title="マルチモーダルバッチ処理">
    Flash は 1M コンテキストと動画入力をサポートしますが、1 回の超長いリクエストで上位ティアに上がります。長い動画はセグメントに分割し、1 回あたりのコストを抑えるために 256K 以内のチャンクで投入してください。
  </Step>

  <Step title="Preview カナリア">
    `qwen3.6-max-preview` は Preview ビルドです — 重みはまだ調整中です。重要な経路では、本番トラフィックを切り替える前に、A/B 比較付きの小規模カナリアを実施してください。
  </Step>

  <Step title="ツールとストリーミング">
    3 つのモデルすべてが OpenAI 形式の `tools` と `stream: true` をサポートします。既存の OpenAI 互換の Agent フレームワーク（OpenClaw、LangChain、LlamaIndex など）に、そのまま組み込めます。ツール呼び出しロジックを書き換える必要はありません。
  </Step>

  <Step title="チャージ特典を組み合わせる">
    定価はすでに Alibaba の公式レートと一致しています。[チャージ特典](/ja/faq/recharge-promotions) を組み合わせると、実質単価は **定価の約85%** になります。大きめのチャージ（\$1,000以上）ほどボーナス率が高くなるため、より少ない回数で大きめにチャージすると、最も有利です。
  </Step>
</Steps>

## エラーと再試行

| ステータス   | 意味                  | 対処方法                                                               |
| ------- | ------------------- | ------------------------------------------------------------------ |
| `400`   | パラメータエラー / 不明なモデル   | `model`のスペル、`messages`の形状、入力が最大コンテキストウィンドウを超えていないかを確認してください        |
| `401`   | 無効な token           | Bearer Token を確認してください                                             |
| `403`   | コンテンツモデレーションによるブロック | ポリシー違反を避けるため、prompts / 参照入力を調整してください                               |
| `429`   | レート制限 / 残高不足        | 指数バックオフで再試行してください。アカウントの残高を確認してください                                |
| `5xx`   | ゲートウェイ / バックエンドエラー  | 1〜2回再試行してください。それでも失敗する場合は、チケットを起票してください                            |
| Timeout | 長いテールのレイテンシ         | クライアントのタイムアウトを **≥ 120s** に設定してください（CoT や長文コンテキストの呼び出しはより時間がかかります） |

<Info>
  **クライアント向け推奨事項**:

  * リクエストのタイムアウトを **≥ 120秒** に設定してください（Max-Preview の reasoning と Plus の長文コンテキスト CoT はより時間がかかります）
  * 5xx とタイムアウトには **指数バックオフ再試行** を適用してください（2回の試行を推奨）
  * トラブルシューティングのために `x-request-id` レスポンスヘッダーをログに記録してください
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="5つのモデルはすべて同じ API エンドポイントを共有しますか？">
    はい。5つすべてが `/v1/chat/completions`（OpenAI Chat Completions 互換）を共有しています。異なるのは `model` フィールドだけです（`qwen3.6-max-preview` / `qwen3.6-flash` / `qwen3.6-plus` / `qwen3.6-27b` / `qwen3.6-35b-a3b`）— 必要に応じて同じコードベース内で切り替えてください。
  </Accordion>

  <Accordion title="open-weight（27b / 35b-a3b）とクローズドソースのティアの違いは何ですか？">
    主な違いは 3 つあります。**(1) ダウンロード可能な重み** — open-weight のチェックポイントは Hugging Face にあり、社内監査、コンプライアンス申請、または将来のローカル inference への移行に使えます。**(2) ホストされたコンピュート** — APIYI は公式リレー上で open weights をホストしているため、API を呼ぶだけで済み、GPU のレンタル / デプロイ / 運用は不要です。**(3) よりシンプルな課金** — open-weight ティアは一律料金で、ティア分けがなく、予算管理がしやすいです。性能面では、35B-A3B はクローズドソースの Flash と系譜を共有しています（配信ティアが異なります）；27B は独立した Dense モデルで、コーディング能力ははるかに多いパラメータ数のモデルに匹敵します。
  </Accordion>

  <Accordion title="重みがオープンなら、なぜ APIYI のホスト型 API を使うのですか？">
    open な大規模モデルをセルフホストするには、少なくとも次のものが必要です。高性能な GPU（27B には少なくとも A100 40G が 1 枚必要で、35B-A3B にはさらに多くの VRAM が必要です）、推論フレームワーク（vLLM / TensorRT-LLM）、監視、フェイルオーバー、アップグレード用のパイプラインです。**APIYI のホスト型公式リレーがそのすべてを担います** — token 課金で、需要に応じてスケールし、クローズドソースのティアと同じ OpenAI 互換 SDK を共有します。まずは API で構築し、後からセルフホストへ切り替えるかどうかを決めれば大丈夫です。移行経路はスムーズなままです。
  </Accordion>

  <Accordion title="ティア別課金は正確にはどのように機能しますか？">
    ティアは、1 回のリクエストにおける **総入力 tokens** で決まります。そのリクエスト内のすべての token（入力 + 出力）は、該当ティアのレートで課金されます。例: 入力 tokens が 300K の Flash リクエストは `256K – 1000K` に入り、リクエスト全体が \$0.68 / \$4.08 で課金されます。『最初の 256K は安く、残りの 44K は高い』のような分割はありません。
  </Accordion>

  <Accordion title="Max-Preview は Preview ですが、本番利用できますか？">
    はい、ただしまずカナリア運用をしてください。Qwen チームは、今後の改訂でも引き続き重みを洗練していくと明言しています。重要な経路では、ベンチマークタスクで A/B テストを行い、安定版が出てからメインのトラフィックを切り替えてください。
  </Accordion>

  <Accordion title="Flash にマルチモーダル入力を送るにはどうすればよいですか？">
    OpenAI の Vision 互換フォーマットを使います。`messages` では、`content` を配列として送り、各要素を `{type: "text", text: ...}` または `{type: "image_url", image_url: {url: ...}}` にします。動画については、公式ドキュメントの `video_url` / フレームサンプリング関連フィールドに従ってください。
  </Accordion>

  <Accordion title="APIYI の価格は Alibaba Cloud Bailian の公式サイトと同じですか？">
    表示価格は公式レートと一致します。違いは、APIYI が [recharge bonuses](/ja/faq/recharge-promotions) を上乗せするため、実効単価は **定価の約 85%** になること、さらに OpenAI 互換エコシステム全体（GPT / Claude / Gemini / DeepSeek / GLM など）をサポートする統一アカウントが使えることです。複数のベンダーアカウントを管理する必要はありません。
  </Accordion>

  <Accordion title="function calling / tool use はサポートされていますか？">
    はい。3 つのモデルはいずれも OpenAI 標準の `tools` / `tool_choice` に対応しています。既存の Agent フレームワークの tool-calling ロジックをそのまま再利用できます。Max-Preview は、複数段階の tool 呼び出しや長期的な計画で特に強みを発揮します。
  </Accordion>

  <Accordion title="chain-of-thought 出力はサポートされていますか？">
    Max-Preview は推論タスクで CoT を自動有効化します。Plus は CoT が常時オンです。Flash は速度優先で、デフォルトでは CoT を出力しません。フィールド名は Alibaba Cloud のレスポンス形式（`reasoning_content` など）に従います。
  </Accordion>

  <Accordion title="リクエストが 1M コンテキストを超えた場合はどうなりますか？">
    Flash と Plus は 1M tokens で上限、Max-Preview は 262K です。上限を超えると `400` が返ります。送信前に要約 / チャンク分割 / RAG 検索を適用してください。すべてを 1 回の呼び出しで押し込もうとしないでください。
  </Accordion>

  <Accordion title="公式 OpenAI SDK を直接使えますか？">
    はい。`base_url` を `https://api.apiyi.com/v1` に設定し、上記の任意のモデル ID を `model` として渡せば、コード変更なしで移行できます。
  </Accordion>

  <Accordion title="失敗したリクエストは課金されますか？">
    クライアント側の `4xx` エラー（パラメータエラー / 認証失敗 / コンテンツモデレーションによるブロック）は課金されません。推論に到達しないサーバー側の `5xx` エラーも課金されません。token を正常に返したリクエストは、クライアントがストリーミング中にキャンセルしても、実際の token 数に基づいて課金されます。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [詳細解説: Qwen3.6 Max-Preview と Flash のリリース](/en/news/qwen-3-6-max-flash-launch)
* [詳細解説: Qwen3.6-Plus のリリース — Alibaba の最強コーディングエージェント](/en/news/qwen-3-6-plus-launch)
* [チャージ特典](/ja/faq/recharge-promotions) — 単価を定価の約85%まで引き下げます
* [モデルカタログ](/ja/api-capabilities/model-info) — 利用可能なすべてのモデルとグループ
* [APIマニュアル](/ja/api-manual) — 一般的な利用ルール

<Info>
  **総括**: Qwen3.6 シリーズは、本格的なコーディングエージェントから大量のマルチモーダル振り分けまで、需要曲線全体をカバーします。Max-Preview は国内コーディングを新たな高みに押し上げ、Flash はマルチモーダル長文コンテキストワークロードの単価を大きく引き下げ、Plus は信頼できるバランス型の主力機です。APIYI の公式リレーでホストされるオープンウェイトの 27B と 35B-A3B 版は、「GPU を借りずに制御可能なオープンウェイトを使う」という課題に終止符を打ちます。5 つすべてが OpenAI Chat 互換エンドポイントを共有し、公式レートと同価格で、チャージ特典を重ねると定価の約85%まで下がります。これは、現在 Aliyun の公式リレーチャンネルで利用できる中で最良のコストパフォーマンスです。
</Info>
