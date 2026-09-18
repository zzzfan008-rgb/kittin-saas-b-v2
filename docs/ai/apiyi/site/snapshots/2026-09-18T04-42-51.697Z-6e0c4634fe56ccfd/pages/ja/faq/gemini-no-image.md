> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 画像 API が NO_IMAGE を返すのはなぜですか？

> Gemini が NO_IMAGE を返す理由、画像 prompt を改善する方法、リクエストのトラブルシューティングについて説明します。

## 簡単な回答

API が `finishReason: NO_IMAGE` を返し、`parts` が `null` である場合、モデルは通常リクエストを処理しましたが、画像コンテンツを返しませんでした。

これは、必ずしもプロンプトがコンテンツセーフティブロックを引き起こしたことを意味するわけではありません。「GEOとは何ですか？」や「この概念を説明してください」のようなプロンプトは、テキストに関する質問として解釈されやすくなります。モデルは、ユーザーが明示的に画像を求めていることを確認できない可能性があるため、`NO_IMAGE` を返します。

プロンプトの冒頭で画像を生成する意図を明確にし、その後に対象、レイアウト、スタイル、出力要件を記述してください。

## NO\_IMAGE が発生するのはなぜですか？

### 1. prompt がテキストによる質問のように見える

たとえば、次のような内容です。

```text theme={null}
What is GEO?

GEO helps a company gain visibility in large-model AI systems...
```

これは概念を説明するものですが、次の点が明確ではありません。

* どの種類の画像を生成するのか
* 画像にどの要素を含めるのか
* 情報をどのようにレイアウトするのか
* レスポンスに画像のみを含めるのか

リクエストに「画像を生成する」という言葉が含まれていても、モデルはリクエスト全体をテキストによる説明として解釈する場合があります。

### 2. 画像生成の意図が十分に具体的ではない

一部のプラットフォームツールでは、「画像を生成してください：」のような指示が自動的に先頭へ追加されます。ただし、直接 API を呼び出す場合、完全な画像生成指示が自動的に追加されず、リクエストがそのまま転送されることがあります。

次のように書くのではなく、

```text theme={null}
Generate an image: What is GEO?
```

画像の種類とビジュアル上の目的を直接記述してください。

```text theme={null}
Generate a Chinese technology-style infographic poster about “What is GEO”.
```

### 3. prompt に視覚的な説明がない

prompt が概念の説明だけの場合、モデルはそれをどのようなビジュアル構成に変換すればよいのか判断できません。次の内容を指定することを検討してください。

* 画像の種類：インフォグラフィック、ポスター、フローチャート、プロモーショングラフィック
* レイアウト：3列、タイムライン、放射状構成
* ビジュアルスタイル：テクノロジー、ビジネス、ミニマリスト、ブランド調
* テキスト階層：タイトル、番号付きセクション、本文、レイアウト
* 出力指示：テキストによる説明を付けず、画像のみを生成するよう指定する

## GEOプロンプトの例

元のプロンプトは次のように書き換えられます。

```text theme={null}
Generate a Chinese technology-style infographic poster titled “What is GEO”.

The image must contain one main title and three numbered sections:

1. Help companies gain visibility in large-model AI search and recommendations;
2. Make a company the answer to a user's question;
3. Build AI trust in and recommendations for a company's information.

Design requirements:

- Use a blue and purple technology style;
- Use a clear three-column layout;
- Emphasize “visibility,” “answer,” and “trusted recommendation”;
- Use clean, readable Chinese typography;
- Make it suitable as a corporate promotional poster;
- Generate an image only, without a text explanation.
```

<Tip>
  「画像を生成」はアクションのヒントにすぎません。視覚的な結果の説明に代わるものではありません。画像の種類、被写体、レイアウト、スタイルをより明確に説明するほど、モデルはそのリクエストを画像生成として識別しやすくなります。
</Tip>

## NO\_IMAGE のトラブルシューティング

<Steps>
  <Step title="手順 1：レスポンスに画像データが含まれているか確認する">
    レスポンス内の `parts`、`inlineData`、`image`、または同等の画像フィールドを確認します。`parts` が `null` の場合、通常、レスポンスには画像コンテンツが含まれていません。
  </Step>

  <Step title="手順 2：prompt が画像を明示的に要求していることを確認する">
    prompt に「画像を生成する」「ポスターを作成する」「画像を作成する」などの明確な指示が含まれていることを確認します。「What is...」や「Explain...」のようなテキストのみの質問を送信しないでください。
  </Step>

  <Step title="手順 3：次にコンテンツセーフティ要因を確認する">
    prompt が明確に画像を要求しているにもかかわらず `NO_IMAGE` が返される場合は、NSFW コンテンツ、未成年者、著名な IP、ウォーターマークの除去、実在人物のポートレート、その他の上流側の安全ポリシーに該当していないか確認します。
  </Step>

  <Step title="手順 4：呼び出しログを確認する">
    呼び出しログで、完全なレスポンス、モデル名、リクエスト ID、課金記録を確認します。`usageMetadata` はモデルがリクエストを処理したことを示しますが、画像が生成されたことや、安全ブロックが発生したことを証明するものではありません。
  </Step>
</Steps>

## NO\_IMAGE とセーフティブロックの違いは何ですか？

| 症状                                        | 考えられる原因                                | 推奨される対応                                      |
| ----------------------------------------- | -------------------------------------- | -------------------------------------------- |
| `NO_IMAGE` と `parts: null`、および抽象的な prompt | 画像の意図が不明確です                            | 画像の種類、視覚的な対象、レイアウト要件を追加します                   |
| セーフティポリシーエラーが返されます                        | 上流のコンテンツセーフティポリシーが適用されました              | ポリシーをトリガーする可能性のあるコンテンツを変更または削除します            |
| 画像の意図は明確ですが、画像が返されません                     | モデル、グループ、token、または上流ルートを利用できない可能性があります | 完全なエラー、モデル名、リクエスト ID、発生時刻を添えてサポートにお問い合わせください |

<Info>
  `finishReason: NO_IMAGE` は画像が返されなかったことだけを意味します。これだけで prompt がポリシーに違反したことを証明するものではありません。完全なエラー、prompt、呼び出しログを組み合わせて確認してください。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="「画像を生成」と追加すれば、常に問題は解決しますか？">
    いいえ。基本的な意図がより明確になるだけです。画像の種類、対象、構図、スタイル、出力要件についても説明してください。抽象的な概念の場合は、インフォグラフィック、ポスター、またはフローチャートを明示的に指定してください。
  </Accordion>

  <Accordion title="GEOのトピックはコンテンツセーフティによってブロックされましたか？">
    GEOの概念自体に明らかな安全上のリスクが含まれているようには見えません。ただし、`NO_IMAGE`だけでは、上流側のポリシー判断を完全に排除することはできません。この場合、promptは知識の説明に近い内容なので、まず確認すべき点としては画像の意図が不明確であることがより適切です。
  </Accordion>

  <Accordion title="画像が返されなかったのに、なぜusageMetadataにtokenが含まれているのですか？">
    `usageMetadata`は、モデルが入力を処理し、推論またはテキストのtokenを生成したことを示しているだけです。レスポンスに画像が含まれていることを意味するものではありません。レスポンス内の画像データフィールドを確認してください。
  </Accordion>

  <Accordion title="NO_IMAGEでも課金されますか？">
    `NO_IMAGE`だけを基準に課金を判断しないでください。APIYIの呼び出しログを確認し、リクエストによって課金レコードが作成されたかどうかを確認してください。
  </Accordion>
</AccordionGroup>

## それでも解決しない場合はサポートにお問い合わせください

画像の意図を明示した後もリクエストが`NO_IMAGE`を返す場合は、APIYIサポートにお問い合わせのうえ、以下の情報をお知らせください。

* モデル名とtokenグループ
* 完全なエラーメッセージと`request ID`
* プロンプト（機密情報を伏せたもの）
* 発生日時
* 呼び出しログの課金記録

<Warning>
  完全なAPIキーは絶対に送信しないでください。スクリーンショットやログを共有する前に、キーを伏せ字にしてください。
</Warning>

<CardGroup cols={2}>
  <Card title="WeComサポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeComサポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、このカードをクリックしてサポートに直接お問い合わせください。
  </Card>

  <Card title="メールサポート" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    件名には「NO\_IMAGE」とモデル名を含めることをおすすめします。
  </Card>
</CardGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Nano Banana 画像生成の失敗" icon="image-off" href="/ja/faq/nano-banana-image-failure">
    安全性、透かしの除去、著名な知的財産、未成年者などの一般的な原因
  </Card>

  <Card title="モデル API のエラーをトラブルシューティングするにはどうすればよいですか？" icon="alert-triangle" href="/ja/faq/model-error-troubleshooting">
    401、429、503、504、タイムアウト、グループの問題に関する一般的なガイダンス
  </Card>

  <Card title="ログで課金額を確認するにはどうすればよいですか？" icon="file-text" href="/ja/faq/log-billing-explained">
    呼び出しログを使用して、リクエストが成功したか、課金されたかを確認します
  </Card>
</CardGroup>
