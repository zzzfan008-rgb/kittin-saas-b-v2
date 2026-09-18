> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K2.5 テキスト生成

> Moonshot AIのネイティブなマルチモーダル旗艦モデルで、256KのコンテキストウィンドウとThinkingモードを備えています。APIYIはAlibaba Cloudの公式リレー経由で接続し、0.88×のグループ価格に加えてチャージ特典により、実質コストは公式の80%未満になります。

Kimi K2.5 は Moonshot AI のネイティブなマルチモーダル旗艦モデルで、2026年1月27日にリリースされました。これは Visual Coding と自律的な Agent Swarm オーケストレーションに重点を置き、256K のコンテキストウィンドウを追加料金なしで提供します。APIYI はこれを **Alibaba Cloud 公式転送チャネル** を通じて統合し、本番グレードの安定性を実現しています。基本のグループレートは **公式料金の 0.88×** で、入金ボーナスの積み上げ（\$100 のチャージ → \$10 無料 から上）により、**実効コストは公式料金の 80% 未満** になります。

<Info>
  **Kimi K2.5 は APIYI で利用可能です**: Alibaba Cloud 公式転送チャネル、OpenAI 互換エンドポイント、モデル ID `kimi-k2.5`。Kimi の公式サイトとは異なり、**Thinking モードはリクエストボディ内で `enable_thinking: true` を使って明示的に有効化する必要があります**。デフォルトではモデルは Instant モードで動作します。
</Info>

## 主な特長

<CardGroup cols={2}>
  <Card title="256K コンテキスト" icon="scroll">
    256K tokens で追加料金なし — 中規模のコードベース全体や長文書を 1 回の呼び出しで収められます。
  </Card>

  <Card title="推論モード" icon="brain">
    `enable_thinking: true` で深い推論を有効化できます — 複雑な計画立案、根本原因分析、エージェント向けに最適です。
  </Card>

  <Card title="ネイティブなマルチモーダル + ビジュアルコーディング" icon="eye">
    画像とコードをネイティブに理解します — UI モックアップ、スクリーンショット、図を実行可能なコードに変換するのが得意です。
  </Card>

  <Card title="安定した Alibaba Cloud 転送" icon="server">
    Alibaba Cloud の公式リレー経由でルーティングされます — 高い同時実行数でもエンタープライズ級 SLA を提供します。
  </Card>
</CardGroup>

## モデル情報

| パラメータ                           | 値                                                |
| ------------------------------- | ------------------------------------------------ |
| **モデルID**                       | `kimi-k2.5`                                      |
| **コンテキストウィンドウ**                 | 256,000 tokens                                   |
| **モード**                         | 即時 / 推論 / Agent / Agent Swarm                    |
| **推論切り替え**                      | `enable_thinking: true`（リクエストボディ内、デフォルト `false`） |
| **入力**                          | テキスト + 画像（ネイティブなマルチモーダル）                         |
| **出力**                          | テキスト                                             |
| **ストリーミング**                     | ✅ 対応                                             |
| **Function Calling / Tool Use** | ✅ 対応                                             |
| **チャンネル**                       | Alibaba Cloud 公式転送                               |

<Warning>
  Kimi に組み込まれた `$web_search` ツールは、現在 推論モードと互換性がありません。Moonshot の案内に従い、web\_search ツールが必要な場合は `enable_thinking` を無効にしてください。この制限は公式プラットフォームと一致しています。
</Warning>

## 料金

| 項目           | 公式                 | APIYI グループ (0.88×)  | チャージボーナス込み（概算）       |
| ------------ | ------------------ | ------------------- | -------------------- |
| 入力           | \$0.60 / 1M tokens | \$0.528 / 1M tokens | \~\$0.48 / 1M tokens |
| 出力           | \$2.50 / 1M tokens | \$2.20 / 1M tokens  | \~\$2.00 / 1M tokens |
| キャッシュヒット（入力） | \$0.10 / 1M tokens | \$0.088 / 1M tokens | —                    |

<Info>
  **料金メモ**: APIYI では、グループの基本レートとして **0.88× のレート倍率**（公式定価の 88%）を採用しています。新規登録 / 大口チャージボーナス（例: \$100 チャージで \$10 無料など）を重ねると、**実質コストは公式の 80% 未満**になります。詳細は [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。
</Info>

## Thinkingモードを有効にする方法

Kimiの公式サイトとの最大の違いは、APIYIではデフォルトがInstantモードである点です。リクエストボディで `enable_thinking` を使って Thinking を明示的に有効化する必要があります:

| ユースケース                | `enable_thinking` | 補足                           |
| --------------------- | ----------------- | ---------------------------- |
| 日常のチャット / 高速応答        | `false` (default) | Instantモード、最小レイテンシ           |
| 複雑な推論 / コード計画 / RCA   | `true`            | Thinkingモード、推論トレースを出力        |
| web\_search を使うエージェント | `false`           | 公式の制限: web\_search と推論は排他的です |

### cURL の例（Thinkingを有効化）

```bash theme={null}
curl --location 'https://api.apiyi.com/v1/chat/completions' \
  --header "Authorization: Bearer sk-xxxx" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2.5",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "What is 1+1?"
      }
    ],
    "enable_thinking": true
  }'
```

## 呼び出し方法

### エンドポイント

```
https://api.apiyi.com/v1/chat/completions
```

### 基本的な使い方（即時モード）

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "kimi-k2.5",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'user', content: 'Introduce yourself in one sentence.' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 詳細な使い方（推論モード）

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations."}
      ],
      extra_body={
          "enable_thinking": True
      }
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Analyze the time complexity of this code and suggest optimizations.' }
    ],
    // @ts-ignore - custom field
    enable_thinking: true
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### ストリーミング

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k2.5",
    messages=[{"role": "user", "content": "Write a short poem about spring."}],
    stream=True,
    extra_body={"enable_thinking": True}
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

## リクエストパラメータ

| Name              | Type    | Required | Notes                            |
| ----------------- | ------- | -------- | -------------------------------- |
| `model`           | string  | はい       | `kimi-k2.5` である必要があります           |
| `messages`        | array   | はい       | 会話メッセージ                          |
| `enable_thinking` | boolean | いいえ      | Thinking モードを有効化; デフォルトは `false` |
| `stream`          | boolean | いいえ      | 出力をストリーミング                       |
| `temperature`     | number  | いいえ      | サンプリング temperature、0–2           |
| `max_tokens`      | integer | いいえ      | 最大出力 tokens                      |
| `tools`           | array   | いいえ      | Function / tool 一覧               |

## レスポンス形式

```json theme={null}
{
  "id": "chatcmpl-xxxxxxxx",
  "object": "chat.completion",
  "created": 1706300000,
  "model": "kimi-k2.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1+1 equals 2."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 12,
    "total_tokens": 36
  }
}
```

## ベストプラクティス

1. **タスクごとにモードを切り替える**: 日常のチャットや短い生成では Instant mode を有効のままにし、複雑な推論、コードレビュー、エージェントの計画には `enable_thinking: true` を設定します。
2. **256K のコンテキストを活用する**: 中規模のリポジトリ、製品ドキュメント一式、長い会議の文字起こしを 1 回の呼び出しに収められます — 追加料金はありません。
3. **マルチモーダルなビジュアルコーディング**: UI のスクリーンショットやデザインモックアップを送れば、K2.5 が 1 回で「読み取り → 計画 → コーディング」まで行います。
4. **節約効果を最大化する**: \$100 以上の入金ボーナスを 0.88× のグループレートと組み合わせると、実質コストは公式の 80% 未満に下がります。
5. **web\_search の注意点に留意する**: Moonshot の組み込み `$web_search` ツールが必要な場合は、`enable_thinking` を無効にしてください。

## よくある質問

<AccordionGroup>
  <Accordion title="なぜ私のリクエストは推論モードを使っていないのですか？">
    推論モードはデフォルトではオフです。リクエストボディに `"enable_thinking": true` が含まれていることを確認してください。OpenAI Python SDK では `extra_body` の中に渡し、Node.js SDK ではトップレベルのフィールドとして渡せます。
  </Accordion>

  <Accordion title="APIYI の Kimi K2.5 は Moonshot のものと同じモデルですか？">
    はい — 同じ上流モデルで、Alibaba Cloud の公式リレーチャネル経由でルーティングされています。違いは、推論モードがデフォルトではオフで、`enable_thinking` で有効化する必要があることだけです。
  </Accordion>

  <Accordion title="0.88×のグループレートはどのように動作しますか？">
    APIYI コンソールで API token を作成する際、Kimi K2.5 を含むグループに割り当ててください。課金では自動的に 0.88× のレート倍率が適用されます。チャージ特典を併用すると、総コストはさらに下がります。[チャージ特典](/ja/faq/recharge-promotions) をご覧ください。
  </Accordion>

  <Accordion title="関数呼び出し / tool の使用をサポートしていますか？">
    はい。標準的な OpenAI スタイルの `tools` 定義を渡してください。公式の `$web_search` 内蔵 tool は推論モードと排他的である点に注意してください。別々の呼び出しで使用してください。
  </Accordion>

  <Accordion title="推論モードは追加料金がかかりますか？">
    推論トレースは出力 token としてカウントされ、通常どおり課金されます。複雑なタスクでは出力 token が大幅に増える場合があるため、より深い推論が必要なときだけ有効にしてください。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="API マニュアル" icon="book" href="/ja/api-manual">
    APIの完全な利用ガイド
  </Card>

  <Card title="入金プロモーション" icon="gift" href="/ja/faq/recharge-promotions">
    ボーナスを積み重ねて、価格をさらに下げます
  </Card>

  <Card title="モデル情報" icon="list" href="/ja/api-capabilities/model-info">
    利用可能なすべてのモデルとグループを閲覧できます
  </Card>

  <Card title="ユースケース" icon="layers" href="/ja/scenarios">
    クライアント統合のウォークスルー
  </Card>
</CardGroup>
