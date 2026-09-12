> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# なぜ AI モデルは自分自身のバージョンを把握できないのか?

> API経由で呼び出されたときに AI モデルが自分のバージョンを正確に識別できない理由と、Webアプリと API 呼び出しの違いを説明します

## 短い回答

<Info>
  **これは完全に正常で、モデルの機能には影響しません。**

  モデルの名前は、学習が完了したあとに付与されます。つまり、モデル自身が自分のアイデンティティを「学習する」ことはありません。公式のウェブアプリ（claude.ai や chatgpt.com など）は、モデルに「自分が何者か」を伝える組み込みのシステムプロンプトを含んでいるため、正しく答えられます。API呼び出しには、デフォルトではこの情報が含まれないため、モデルは自分のバージョンを「間違って推測」してしまうことがあります。
</Info>

## 実例

<Warning>
  **よくあるシナリオ**

  Claude Sonnet 4.5 を API 経由で呼び出して「あなたはどのモデルですか？」と尋ねると、「私は Claude 3.5 Sonnet です。」と返答することがあります。これは**間違ったモデルを呼び出した**ことを意味しません。モデルは自分の名前を知らないだけです。

  GPT-4o、Gemini、そしてその他すべてのモデルでも同じことが起こります。これは大規模言語モデルに共通する普遍的な特性であり、APIYI 特有の問題ではありません。
</Warning>

## シンプルなたとえ

<Card title="俳優のたとえ" icon="drama">
  熟練した俳優を想像してください:

  * その **スキル** は、長年の訓練（モデルの学習プロセスのようなもの）によって身につきます
  * その **役名** は、撮影前に監督から伝えられます（System Prompt のようなものです）
  * もし誰も自分がどの役を演じるのか伝えなければ、才能はあっても **自分の役名は分かりません**

  AI モデルも同じです。能力は学習データから生まれますが、「私は Claude Sonnet 4.5 です」というアイデンティティは明示的に与える必要があります。
</Card>

## 技術解説

<AccordionGroup>
  <Accordion title="モデルはなぜ自分の名前を知らないのでしょうか？">
    **モデルの命名は学習後に行われます**

    大規模言語モデルの開発プロセスは次のとおりです:

    1. **データを収集する** → 学習コーパスを準備する
    2. **モデルを学習する** → 言語理解と生成を学習する
    3. **評価してファインチューニングする** → モデル性能を最適化する
    4. **命名して公開する** → 名前を付ける (例: "Claude Sonnet 4.5")

    ステップ 2 で学習が完了した時点では、ステップ 4 の名前はまだ存在しません。学習データには古いモデルバージョンの名前 (たとえば Claude 3.5 Sonnet) が含まれていることがあるため、質問されると、モデルは以前見たことのある名前を「推測」します。

    **たとえば**: 人が生まれる前に自分の名前を知ることができないのと同じで、名前は生まれたあとに与えられます。
  </Accordion>

  <Accordion title="なぜ公式Webアプリは正しく答えられるのでしょうか？">
    **組み込みの system prompt の役割**

    claude.ai や chatgpt.com でチャットすると、公式Webアプリは各会話の先頭に、次のような非表示の system prompt を自動で挿入します:

    ```
    You are Claude, developed by Anthropic. Your model version is Claude Sonnet 4.5...
    ```

    この prompt はユーザーには見えませんが、モデルはこれを「読み取り」、そのため自分が何者かを把握できます。

    **つまり**: モデルは本質的には自分の名前を知っているわけではなく、公式Webアプリが毎回「思い出させて」いるのです。
  </Accordion>

  <Accordion title="なぜ API では違うのでしょうか？">
    **API 呼び出しにはデフォルトで識別情報が含まれません**

    API でモデルを呼び出すときに送るのは次のものだけです:

    * `model` パラメータ (サーバーにどのモデルを使うかを伝える)
    * `messages` 配列 (会話内容)
    * オプションの `system` パラメータ (カスタムの system prompt)

    `model` パラメータは **サーバー** のルーティング情報であり、モデル自身はこのフィールドを読み取れません。`system` prompt にモデルの識別情報を指定しなければ、学習データに基づいて「推測」することしかできません。

    **これはすべての API プラットフォームに当てはまります** — 公式 API、APIYI、その他どの提供元であっても、動作はまったく同じです。
  </Accordion>
</AccordionGroup>

## 実際に呼び出しているモデルを確認する方法

<CardGroup cols={2}>
  <Card title="コールログを確認する" icon="file-text" href="/ja/faq/call-logs">
    APIYIコンソールの**コールログ**では、各リクエストで実際に使用されたモデル名を確認できます。これは最も正確な確認方法です。
  </Card>

  <Card title="APIレスポンスを確認する" icon="code">
    各APIレスポンスのJSONには、呼び出された実際のモデルバージョンを明確に示す`model`フィールドが含まれています。

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>
</CardGroup>

## APIYI サービス保証

<Tip>
  **APIYI は公式リレーを通じてリクエストを転送します — モデル品質は提供元と同一です。**

  * APIYI は OpenAI、Anthropic、Google などの公式 API にリクエストを直接転送します
  * モデルが自分自身の識別情報を認識できないのは、すべての API プラットフォームに共通する普遍的な現象です
  * 実際に呼び出されたモデルは、呼び出しログと API レスポンス内の `model` フィールドで確認できます
  * ご不明な点がある場合は、検証のために技術チームまでお気軽にお問い合わせください
</Tip>

## モデルに正しく自分自身を識別させる方法

API呼び出しに `system` パラメータを追加するだけで、モデルに自身のアイデンティティを伝えられます:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://vip.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5-20250514",
    messages=[
        {
            "role": "system",
            "content": "You are Claude Sonnet 4.5, an AI assistant developed by Anthropic."
        },
        {
            "role": "user",
            "content": "What model are you?"
        }
    ]
)

print(response.choices[0].message.content)
# Output: I am Claude Sonnet 4.5, developed by Anthropic.
```

<Info>
  **ヒント**: これは公式Webアプリとまったく同じ仕組みです。システムプロンプトを通じてモデルに自身のアイデンティティを伝えます。追加すると、モデルは「私は誰ですか」を正しく答えられるようになります。
</Info>

## 関連する質問

<CardGroup cols={2}>
  <Card title="適切なモデルの選び方は？" icon="compass" href="/ja/faq/model-selection-guide">
    さまざまなモデルの機能とユースケースについて学べます
  </Card>

  <Card title="一部のモデルが利用できないのはなぜですか？" icon="lock" href="/ja/faq/model-availability">
    モデルの権限とユーザー階層について学べます
  </Card>

  <Card title="呼び出しログを表示するには？" icon="file-text" href="/ja/faq/call-logs">
    実際に呼び出されたモデルのバージョンを確認できます
  </Card>

  <Card title="API 呼び出しエラー？" icon="triangle-alert" href="/ja/faq/invalid-api-key">
    よくある API エラーのトラブルシューティングガイド
  </Card>
</CardGroup>

## お問い合わせ

<CardGroup cols={2}>
  <Card title="企業WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業WeChatのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートに連絡するにはクリックしてください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    モデルの検証、技術サポート
  </Card>

  <Card title="メール" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネス**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
