> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# なぜ Gemini 画像で IMAGE_OTHER が返されるのか？

> Gemini 画像モデルが finishReason: IMAGE_OTHER を返した場合、画像は生成されたものの、配信前にプロバイダーによってフィルタリングされています。NO_IMAGE や blockReason との違い、トリガーの特定方法、およびその解決策について解説します。

## 簡潔な回答

Gemini 画像 API が HTTP 200 を返し、`candidates[0].finishReason` が `IMAGE_OTHER` に設定され、`finishMessage` に `Unable to show the generated image` と表示されている場合、**モデルは実際に画像を生成しましたが、返却前にプロバイダーの出力チェックによってフィルタリングされました**。

* **確率的**です：同じリクエストでも成功する場合と失敗する場合があり、失敗率が高くなることがあります
* **ネガティブプロンプト、パラメータ、またはゲートウェイとは無関係**です。問題は画像内に最終的に描画された内容にあります
* 検証で判明した最も典型的なトリガー：**プロンプトに実在の人物名が含まれていること**
* プロバイダーは `finishMessage` で、これらのリクエストには課金されないと明記しています

対処法は次のとおりです：**画像が特定の実在人物やその他の制限されたコンテンツのように見えてしまう原因となっているプロンプトの部分を特定し、描写表現に置き換えること**です。

## 見分け方

典型的なレスポンス：

```json theme={null}
{
  "candidates": [
    {
      "finishReason": "IMAGE_OTHER",
      "finishMessage": "Unable to show the generated image. The model could not generate the image based on the prompt provided. You will not be charged for this request. Try rephrasing the prompt. ..."
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 1430,
    "candidatesTokenCount": 274,
    "thoughtsTokenCount": 274
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

`candidatesTokenCount` は 0 ではなく、`thoughtsTokenCount` と等しい点に注意してください。モデルは思考を完了しましたが、最終的な画像は配信されませんでした。

画像が失われる3つのパターン：

| 特徴 | IMAGE\_OTHER | NO\_IMAGE | blockReason: OTHER |
| - | - | - | - |
| 失敗情報を含むフィールド | `candidates[0].finishReason` | `candidates[0].finishReason` | `promptFeedback.blockReason` |
| 発生箇所 | 画像は生成されたが、**出力時にフィルタリングされた** | モデルが画像を描画しなかった | 生成前、**入力がブロックされた** |
| `finishMessage` | `Unable to show the generated image` | 通常はなし | `candidates` は一切なし |
| 出力 tokens | Thinking tokens のみ | 0 またはテキストのみ | 0 |
| 毎回再現するか？ | 確率的 | 確率的 | 通常は再現する |
| 主な原因 | 画像が特定の実在の人物やその他の制限対象コンテンツに類似している | prompt がテキスト出力を要求している | 参照画像がブロックされている |
| 対処法 | prompt の人物または制限対象の部分を書き直す | [NO\_IMAGE のトラブルシューティング](/ja/faq/gemini-no-image) を参照 | [blockReason: OTHER のトラブルシューティング](/ja/faq/gemini-image-input-blocked) を参照 |

<Info>
  公式 API リファレンスでは、`IMAGE_OTHER` は `IMAGE_SAFETY`、`IMAGE_PROHIBITED_CONTENT`、`IMAGE_RECITATION` と同じグループに属しており、これらはすべて「画像生成が停止された」ことを意味します。`IMAGE_OTHER` は他のカテゴリ以外の理由を対象としており、プロバイダーは具体的な基準を公開していません。
</Info>

## テスト検証事例

2026年9月 (UTC+8)、あるお客様から、gemini-3-pro-image において純粋な text-to-image の選手カード生成リクエストが**約63%の確率で画像を返せない**という報告がありました。prompt は約5,500文字でした：

* 実在するアスリートの名前を挙げ、その顔の特徴の「1:1 replica」を求める冒頭の1文
* ポーズ、構図、ユニフォームの色、アートスタイル、白背景に関する詳細な指示
* 多数のブランド名を列挙した2つの長い negative-prompt（NEGATIVE）ブロック

再現された失敗はすべて `IMAGE_OTHER` であり、約20秒で返されました。その後、1回につき1つの要素を削除し、グループごとに6回の呼び出しを行いました：

| 変更内容 | 画像なし |
| - | - |
| 元の prompt | **5/6** |
| **実在の人物名を指定した文のみを削除**し、その他はそのまま | **0/6** |
| 名前は残し、「1:1 replica」という文言のみを削除 | 4/6 |
| 両方の negative-prompt ブロックを削除 | 3/6 |

結論は明白です。**実在する人物の名前そのものがトリガーとなっています**。モデルがその名前を認識してその人物の容姿に似せようとするため、似れば似るほど出力がフィルタリングされる可能性が高くなります。あまり似ていなかった生成結果のみが通過したため、一見ランダムに発生しているように見えていました。「1:1 replica」という表現も、長い negative-prompt も原因ではありませんでした。

名前を削除しても、prompt にすでに含まれていた髪型、顔の輪郭、目の描写だけで、同じスタイルの選手カードを生成するのには十分でした。

<Tip>
  このような二分探索による切り分けには、グループあたり6回の呼び出しで十分です。元の prompt が5/6の確率で失敗する場合、適切な修正によって運だけで6回連続して成功する確率は約10万分の2です。調査全体で要した呼び出しは24回でした。
</Tip>

## トリガーを特定する方法

<Steps>
  <Step title="ステップ1：失敗のタイプを確認する">
    同じリクエストを5〜6回再送信し、失敗に`finishReason: IMAGE_OTHER`が含まれていることを確認して、失敗率を記録します。代わりに`NO_IMAGE`または`blockReason`が表示される場合は、対応するトラブルシューティングページを参照してください。
  </Step>

  <Step title="ステップ2：まず名前や特定の対象を確認する">
    prompt内に**実在の人物名**（有名人、アスリート、インフルエンサー、政治家など）や、誰かに「そっくり」に見せる指示がないか確認します。それらを削除して、別のグループを実行します。
  </Step>

  <Step title="ステップ3：半分ずつセクションを削除する">
    名前ではない場合は、promptを一度に半分ずつ削除し、1グループあたり6回呼び出して、失敗率が明らかに低下した半分側のみで絞り込みを続けます。
  </Step>

  <Step title="ステップ4：単に削除するのではなく書き直す">
    トリガーが特定できたら、名前による言及を外見、服装、スタイルの**説明**に置き換え、実際に必要な視覚的要件を維持します。
  </Step>
</Steps>

## 推奨事項

1. **promptに実在の人物名を含めない**: 代わりにその外見を描写してください（例：「センターから少しずらして分けたストレートのブロンドヘア、アーモンド型の目、卵形の顔」など）。今回のケースでは、これが唯一効果的な解決策でした。
2. **ネガティブpromptの削減は問題ありませんが、原因ではありません**: Geminiの画像モデルには独立したネガティブpromptパラメーターが存在しないため、長いNEGATIVEリストは通常のテキストとして読み取られます。削減することでpromptは明確になりますが、`IMAGE_OTHER`率は下がりません。
3. **リトライに頼らない**: 失敗率が60%を超える状況では、リトライは不確実でありレイテンシも増加します。フォールバックとしてクライアント側で`IMAGE_OTHER`時に1度リトライすることは可能ですが、根本的な解決策はpromptの修正です。
4. **一括生成の前にテンプレートを修正する**: 名簿から生成する場合（例：プレイヤーごとに1枚のカードを生成するなど）、promptに名前を挿入しないでください。名前は自身のファイル名やその後のレイアウトにのみ使用してください。
5. **一貫した似姿が必要な場合は参照画像を使用する**: 特定の人物を描写することがどうしても必要な場合は、その人物から許諾を得た参照画像を提供し、[Nano Banana画像生成の失敗](/ja/faq/nano-banana-image-failure)に記載されている実在人物および未成年者に関する制限事項にご留意ください。

コードで3つの形式を区別する方法:

```python theme={null}
def classify_no_image(resp: dict) -> str:
    if resp.get("promptFeedback", {}).get("blockReason"):
        return "input_blocked"        # see blockReason: OTHER troubleshooting
    cand = (resp.get("candidates") or [{}])[0]
    reason = cand.get("finishReason")
    if reason == "IMAGE_OTHER":
        return "output_filtered"      # rewrite names / restricted descriptions
    if reason == "NO_IMAGE":
        return "no_image_intent"      # see NO_IMAGE troubleshooting
    if reason in ("IMAGE_SAFETY", "IMAGE_PROHIBITED_CONTENT"):
        return "safety"               # explicit safety block, do not retry
    return "ok" if any("inlineData" in p for p in (cand.get("content") or {}).get("parts") or []) else "unknown"
```

## よくある質問

<AccordionGroup>
  <Accordion title="似姿を求めず、名前だけを prompt に含めた場合でもトリガーされますか？">
    はい。弊社のテストでは、「1:1 replica」という文言を削除して名前のみを残した場合でも、失敗率は依然として4/6でした。モデルが名前を認識し、その人物に寄せて描画するためです。
  </Accordion>

  <Accordion title="なぜ同じリクエストが成功することもあれば失敗することもあるのですか？">
    フィルターは画像が生成された後に実行されるため、結果はその時何が描画されたかに依存します。生成ごとに描画内容は異なるため、同じリクエストでも通過する場合とフィルターされる場合があります。
  </Accordion>

  <Accordion title="グループやチャンネルを切り替えた後に成功したのはなぜですか？">
    出力チェックの厳しさはグループによって異なる場合があるため、同じ prompt でも失敗率が変わることがあります。ただし、グループのルーティングは時間とともに変化するため、その差異は安定していません。prompt を修正することが確実な対処法です。
  </Accordion>

  <Accordion title="ネガティブ prompt（NEGATIVE）は効果がありますか？">
    Gemini の画像モデルには独立したネガティブ prompt パラメーターはありません。prompt 内の NEGATIVE リストは通常のテキストとして読み込まれます。これは `IMAGE_OTHER` には効果がありませんが、リストが長すぎると主要な説明が薄まってしまう可能性があります。重要な項目のみをごく少数に絞り、肯定的な表現に言い換えてください（例えば、「no stadium, no grass...」といった長いリストの代わりに「plain white background」とするなど）。
  </Accordion>

  <Accordion title="IMAGE_OTHER は課金されますか？">
    プロバイダーは `finishMessage` で、これらのリクエストは課金されないと明記しています。リクエストが課金されたかどうかを確認するには、APIYI コンソールの呼び出しログをご確認ください。
  </Accordion>
</AccordionGroup>

## 解決しない場合 サポートにお問い合わせください

迅速に対応できるよう、以下の情報を含めてご連絡ください：

* モデル名と token グループ
* 完全なレスポンス（少なくとも `finishReason`、`finishMessage`、および `responseId`）と `request ID`
* 発生日時（タイムゾーン付き）
* マスク済みの prompt、および確認された失敗率

<Warning>
  完全な API キーは絶対に送信しないでください。スクリーンショットやログを共有する前に、キーをマスクしてください。
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom サポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom サポート QR コード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR コードをスキャンするか、このカードをクリックして直接サポートにお問い合わせください。
  </Card>

  <Card title="メールサポート" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    件名に「IMAGE\_OTHER」とモデル名を含めることをお勧めします。
  </Card>
</CardGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Gemini 画像 API が NO_IMAGE を返す理由" icon="image-off" href="/ja/faq/gemini-no-image">
    prompt の意図が不明確なことによる画像の未生成と、その修正方法
  </Card>

  <Card title="Gemini 画像が blockReason: OTHER を返す理由" icon="shield-alert" href="/ja/faq/gemini-image-input-blocked">
    生成前にブロックされた参照画像の特定と、前処理のアドバイス
  </Card>

  <Card title="Nano Banana 画像生成の失敗" icon="image-off" href="/ja/faq/nano-banana-image-failure">
    安全性、透かしの削除、著名な IP、未成年者を含む一般的な原因
  </Card>

  <Card title="Gemini 画像 API のエラーハンドリング" icon="triangle-alert" href="/ja/api-capabilities/gemini-image-error-handling">
    レスポンスチェックの完全な順序とユーザーフレンドリーなエラーメッセージ
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.