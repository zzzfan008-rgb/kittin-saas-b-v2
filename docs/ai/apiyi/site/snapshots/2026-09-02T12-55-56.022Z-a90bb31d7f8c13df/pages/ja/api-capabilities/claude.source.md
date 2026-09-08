> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API 呼び出しの基本

> APIYI は、AWS Claude + Claude Official API へのデュアルチャネルの公式リレーパススルーアクセスを、定価の約 85% で提供します。安定しており、従量課金でご利用いただけます。

チャネルと課金の要点:

* **デフォルトチャネル: AWS Claude**（AWS Bedrock 公式）— 高い安定性、優れたキャッシュヒット率。
* **バックアップチャネル: Claude Official**（公式キーを使った Anthropic API 直結）— AWSチャネルに問題があるときは自動フェイルオーバーします。
* **両チャネルとも純正の公式パススルーです。** 従量課金、レート制限なし、総額コストは ≈ **定価の85%**（入金ボーナスを重ねた後で79%〜86%の範囲）。

<Info>
  当社は低コストのリバースエンジニアリングされたアクセスは提供しません — **信頼でき、安定した品質とサービスのみ**です。

  Claudeアクセス市場は少し混沌としており、価格が安いほど、たいてい中身が不透明になります。そうした低コストチャネルでは、何が混ぜられているのか分かりません — リバースエンジニアリングのハック、共有アカウント、簡略化されたモデルや、こっそり差し替えられたモデルなどです。さらに悪いことに、会話データが転売されても、知ることはできません。APIYI は純正の公式パススルーのみ（AWS Bedrock + 公式 Anthropic キー）を提供します。追跡可能なチャネルで、データ保持はありません。多少コストが上がっても、安定してクリーンな状態を保ちたいのです。
</Info>

## API Keyを取得する

ダッシュボードで token を作成または管理します:

`https://api.apiyi.com/token`

* **default token** はそのまま利用できます。
* **ClaudeCode グループ**で新しい token を作成すると、**5%割引**（定価の95%）になります。
* そのグループ割引は**10%〜20%のチャージボーナス**と併用でき、実質コストは定価の約\*\*79%〜86%\*\*まで下がります（「≈ 85%」という見出し）。
* レート制限なし、公式サイトより安く、使いやすいです。

<Info>
  API は月額サブスクリプションではなく従量課金です。料金は事前チャージした残高からリアルタイムで差し引かれます。
</Info>

## エンドポイント

| 項目                         | 値                                           |
| -------------------------- | ------------------------------------------- |
| **ベース URL**                | `https://api.apiyi.com`                     |
| **Anthropic ネイティブエンドポイント** | `https://api.apiyi.com/v1/messages`         |
| **OpenAI互換エンドポイント**        | `https://api.apiyi.com/v1/chat/completions` |

## 利用可能なモデル

次の3つは各ファミリーで最新のモデルです。直接の利用に推奨されます。

| ファミリー      | モデル                         | 最適な用途          |
| ---------- | --------------------------- | -------------- |
| **Opus**   | `claude-opus-4-8`           | 複雑なコーディング、深い推論 |
| **Sonnet** | `claude-sonnet-4-6`         | 一般的な知能、日常的なコード |
| **Haiku**  | `claude-haiku-4-5-20251001` | 高速な応答、高い同時実行数  |

## 呼び出し形式: ネイティブ vs OpenAI互換

当社は **Anthropic ネイティブ形式** と **OpenAI互換形式** の両方をサポートしていますが、用途に合ったほうを選んでください。

<CardGroup cols={2}>
  <Card title="✅ 強く推奨: Anthropic ネイティブ" icon="star">
    エンドポイント: `/v1/messages`

    **Claude Code、Cline、Cursor、または Claude を多用するクライアントを使う場合は、ネイティブ形式を使用してください。**

    ネイティブ形式だけが **Prompt Cache（キャッシュ課金）** を正しく発動し、長いコンテキスト / 繰り返しのシステムプロンプトにかかるコストを大幅に下げます。
  </Card>

  <Card title="⚙️ 汎用: OpenAI互換" icon="plug">
    エンドポイント: `/v1/chat/completions`

    もしプロジェクトがすでに OpenAI SDK 上にあり、**キャッシュ課金を気にしない** のであれば、ほぼ移行コストなしで Claude に切り替えられます。

    単発スクリプト、軽いワークロード、そして OpenAI SDK に固定されたレガシープロジェクトに最適です。
  </Card>
</CardGroup>

<Warning>
  **キャッシュ課金は Anthropic ネイティブ形式でしか機能しません。** Claude Code 形式のような高頻度・長コンテキストの利用では、OpenAI互換形式は請求額が実質的に高くなる可能性があります。これは上流のプロトコル制約であり、APIYI の問題ではありません。
</Warning>

Prompt caching の仕組みと確認方法の詳細は、[Claude Prompt Caching Guide](/ja/api-capabilities/claude-prompt-caching) をご覧ください。

## 例

### Anthropic ネイティブ形式（推奨）

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "x-api-key: your-apiyi-key" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, please introduce yourself."}
    ]
  }'
```

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Write a Python quicksort example."}
    ]
)

print(message.content[0].text)
```

### OpenAI 互換形式（一般的な移行向け）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "Hello, please introduce yourself."}
    ]
)

print(response.choices[0].message.content)
```

## Opusの料金に関する注意

<Warning>
  **Opusは比較的高価です。** 日常的なチャット利用ではそれほど負担になりませんが、tokenの入力/出力が多いコーディングシナリオでは、請求額がすぐに膨らみます。実運用での消費量を見極めるために、まずは **\$10のテスト予算** から始めることをおすすめします。
</Warning>

日常利用の指針:

* **ほとんどのシナリオ**: `claude-sonnet-4-6` を優先してください — 価格性能比が最適です。
* **シンプル / 大量処理のタスク**: `claude-haiku-4-5-20251001` を使ってください — 高速で安価です。
* **難しいコーディング / 推論**: `claude-opus-4-8` に切り替えてください。

## よくある質問

<AccordionGroup>
  <Accordion title="なぜ APIYI は、より安い「低コストの逆解析」チャネルを提供しないのですか?">
    「安い」の本当のコストは、見えない部分にあります。逆解析による不正利用、共有アカウント、簡略化されたモデルや密かに差し替えられたモデルは、いずれも価格を下げることができますが、チャネルの中身が何であるかは分かりません。出力品質は不安定になり、サービスは一夜にして消えることもあり、会話データが再販されても気づけません。

    当社は **純正の公式パススルー** のみを採用しています。デフォルトのチャネルは AWS Bedrock の公式アクセス、バックアップは公式キーを使った Anthropic への直接接続です。いずれも追跡可能な従量課金で、データは保持しません。総コストはおおむね定価の **85%** に収まり、これは「信頼性と安定性」と「適正価格」のあいだで守るべきちょうどよい線だと考えています。怪しく追跡不能な安価な供給源に手を出すくらいなら、多少高くても構いません。
  </Accordion>

  <Accordion title="「thinking.type.enabled is not supported for this model」と表示されますか?">
    これは、AWS（Bedrock）経由で Opus 4.7 / 4.8 を呼び出す際に最もよく出る 400 です。完全なメッセージは次のとおりです:

    ```
    ValidationException: "thinking.type.enabled" is not supported for this model.
    Use "thinking.type.adaptive" and "output_config.effort" to control thinking behavior.
    ```

    **原因**: リクエストボディが、古い固定予算型の thinking 形式 `thinking: { "type": "enabled", "budget_tokens": N }` のままです。Opus 4.7 / 4.8 ではこれが廃止され、適応的 thinking のみがサポートされています。

    **対処**: `type: "enabled"` と `budget_tokens` を外し、thinking の深さは `thinking: { "type": "adaptive" }` + `output_config.effort` で制御してください。同様に、これらのモデルでは `temperature` / `top_p` / `top_k` も削除されており、送ると 400 になります。[Claude Effort & Thinking ガイド](/ja/api-capabilities/claude-effort-thinking) をご覧ください。
  </Accordion>
</AccordionGroup>

## 関連リンク

* token の取得 / 管理: `https://api.apiyi.com/token`
* 入金とプロモーション: `https://api.apiyi.com`
* [Claude プロンプトキャッシュ ガイド](/ja/api-capabilities/claude-prompt-caching)
