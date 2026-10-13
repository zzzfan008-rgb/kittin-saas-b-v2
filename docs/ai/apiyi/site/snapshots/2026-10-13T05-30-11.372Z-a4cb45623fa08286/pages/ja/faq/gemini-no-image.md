> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 画像 API が NO_IMAGE を返すのはなぜですか？

> Gemini が NO_IMAGE を返す理由、画像 prompt を改善する方法、リクエストのトラブルシューティングについて説明します。

## 簡潔な回答

APIが`finishReason: NO_IMAGE`を返し、`parts`が`null`である場合、通常、モデルはリクエストを処理したものの画像コンテンツを返しませんでした。

これは必ずしもpromptがコンテンツセーフティのブロックをトリガーしたことを意味するわけではありません。「GEOとは何ですか？」や「この概念を説明してください」のようなpromptは、テキストの質問のように見えます。モデルはユーザーが明示的に画像を求めていることを確認できず、そのため`NO_IMAGE`を返すことがあります。

promptの冒頭で画像生成の意図を明確にし、その後に被写体、レイアウト、スタイル、および出力要件を記述してください。

もう1つのよくある原因は、「デザイン案を作成してください」や「徹底的に分析してください」など、**モデルにテキストの記述を求めるprompt**です。呼び出しで画像出力のみが許可されている場合、このようなリクエストは時折`NO_IMAGE`を返すため、同じリクエストが失敗した後に成功することがあります。後述の「promptが文章による出力を求めている」を参照してください。

<Note>
  レスポンスに`candidates`がなく`promptFeedback.blockReason`（例えば`OTHER`）が含まれている場合は別の問題であり、生成が開始される前に入力がプロバイダーによってブロックされました。[Geminiの画像生成がblockReason: OTHERを返す理由は？](/ja/faq/gemini-image-input-blocked)を参照してください。
</Note>

## なぜ NO\_IMAGE が発生するのですか？

### 1. プロンプトがテキストの質問のように見える

例えば：

```text theme={null}
What is GEO?

GEO helps a company gain visibility in large-model AI systems...
```

これは概念を説明していますが、以下が明確に指定されていません：

* どのような種類の画像を生成するか
* どの要素を画像内に含めるか
* 情報をどのようにレイアウトするか
* レスポンスに画像のみを含めるべきかどうか

リクエストに「画像を生成する」という文言が含まれていても、モデルはリクエスト全体をテキストの説明として解釈してしまう場合があります。

### 2. 画像の意図が十分に具体的でない

一部のプラットフォームツールは、「画像を生成：」のような指示を自動的に先頭へ付加します。しかし、直接の API 呼び出しでは、完全な画像生成の指示が自動で追加されずに、リクエストがそのまま転送される場合があります。

単に次のように記述するのではなく：

```text theme={null}
Generate an image: What is GEO?
```

画像の種類と視覚的なゴールを直接指定してください：

```text theme={null}
Generate a Chinese technology-style infographic poster about “What is GEO”.
```

### 3. プロンプトに視覚的な説明がない

プロンプトが概念を説明しているだけの場合、モデルはそれをどのように視覚的な構成へ変換すればよいか分かりません。以下の指定を検討してください：

* 画像の種類：インフォグラフィック、ポスター、フローチャート、またはプロモーション用グラフィック
* レイアウト：3カラム、タイムライン、または放射状構造
* 視覚スタイル：テクノロジー、ビジネス、ミニマリスト、またはブランド
* テキストの階層構造：タイトル、番号付きセクション、本文、レイアウト
* 出力指示：テキストによる説明は含めず、画像のみを生成する

### 4. プロンプトが文章の出力を求めている

Gemini 画像モデルは、画像を読み取ってテキストを作成することも可能です。プロンプトに文章の出力を求める文言が含まれている場合、モデルは画像を生成する代わりに「先に企画書を作成する」ことがあります：

```text theme={null}
...Based on the outsole in image 1, design a marathon running shoe...
Produce a professional, precise, and actionable design proposal for the shoe.
Make sure the analysis is thorough and accurate, and that the design and color scheme can be used directly in product development.
```

このような文はテキストモデルに適しています。画像のみを出力する画像モデル（`responseModalities: ["IMAGE"]`）にこれらを送信すると、モデルが作成しようとする企画書を返すことができないため、レスポンスは `finishReason: NO_IMAGE`、`parts: null`、および出力 tokens がゼロになります。

2026年9月 (UTC+8) に、実際の靴のデザインリクエスト（参照画像3枚と上記のようなプロンプト）を gemini-3.1-flash-image と `responseModalities: ["IMAGE"]` を使用して再実行しました：

| プロンプトのバリエーション | NO\_IMAGE を返したリクエスト |
| - | - |
| 元のプロンプト | 10/48（約21%、実行によって 1/12 〜 5/12 の間で変動） |
| 「design proposal」および「thorough analysis」の文を削除 | 0/36 |
| 元のプロンプトに「output the final image only」という一文を追加 | 0/24 |
| プロンプトからブランド名を削除 | 1/12（ブランド名はトリガーではありません） |

そのため、ルーティングが変わっていないにもかかわらず、同じリクエストが連続して失敗した後に成功することがあります。最もシンプルな解決策は、プロンプトの末尾に次のような一文を追加することです：

```text theme={null}
Important: output only one final image. Do not output any written proposal, analysis, or prompt.
```

<Tip>
  参照画像に明瞭に読み取れるテキストやサードパーティのマーク（例えば、靴底のブランドロゴ文字など）が含まれている場合、モデルはまずその素材の分析から始めてしまう可能性が高くなります。同じテストにおいて、その文字をぼかした場合でもリクエスト結果は 0/36 になりました。
</Tip>

## responseModalities の設定による症状の違い

画像の意図が不明確な同一のリクエストでも、`responseModalities` によって失敗時の挙動が異なります:

| 設定 | 画像が返されないときの表示 |
| - | - |
| `["IMAGE"]` | `finishReason: NO_IMAGE`、`parts: null`、出力 tokens が 0 |
| 省略、または `["TEXT", "IMAGE"]` | `finishReason: STOP` ですが、`parts` にはテキストのみが含まれ画像は含まれません |

**トラブルシューティングのヒント**: `responseModalities` を含めずに失敗したリクエストを数回再送信し、画像が返されないときにモデルが何を出力しているかを確認してください:

* 提案、分析、または画像 prompt → 画像の意図が不明確です。このページの説明に従って prompt を修正してください
* 「これを生成できません」などの拒否 → コンテンツセーフティポリシーがトリガーされました。[Nano Banana 画像生成の失敗](/ja/faq/nano-banana-image-failure) を参照してください

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

## NO\_IMAGE のトラブルシューティング方法

<Steps>
  <Step title="ステップ 1: どのフィールドに障害が発生しているかを特定する">
    `candidates[0].finishReason` が `NO_IMAGE` である場合、本ページが適用されます。`candidates` が存在せず、`promptFeedback.blockReason` に値がある場合は、生成前に入力がブロックされています。[blockReason: OTHER のトラブルシューティング](/ja/faq/gemini-image-input-blocked) を参照してください。
  </Step>

  <Step title="ステップ 2: レスポンスに画像データが含まれているか確認する">
    `parts`、`inlineData`、`image`、またはレスポンス内の同等の画像フィールドを確認してください。`parts` が `null` である場合、通常レスポンスには画像コンテンツが含まれていません。
  </Step>

  <Step title="ステップ 3: prompt で明示的に画像を要求しているか確認する">
    prompt に「画像を生成して」「ポスターを作成して」「画像を作成して」などの明確な指示が含まれていることを確認してください。「〜とは何ですか」「〜について説明して」といったテキストのみの質問だけで送信しないでください。また、「提案書を作成して」「詳細に分析して」「デザインについて説明して」など、文章での出力を求める文がないかも確認してください。それらを削除するか、prompt の末尾に「画像のみを出力してください」を追加してください。
  </Step>

  <Step title="ステップ 4: 次にコンテンツセーフティの要因を確認する">
    prompt で画像を明確に要求しているにもかかわらず依然として `NO_IMAGE` が返される場合は、NSFWコンテンツ、未成年者、著名なIP、透かしの削除、実在の人物の肖像、またはその他のアップストリームの安全ポリシーに抵触していないか確認してください。
  </Step>

  <Step title="ステップ 5: 呼び出しログを確認する">
    呼び出しログで完全なレスポンス、モデル名、リクエストID、課金記録を確認してください。`usageMetadata` はモデルがリクエストを処理したことを示していますが、画像が生成されたことや安全上のブロックが発生したことを証明するものではありません。
  </Step>
</Steps>

## NO\_IMAGE はセーフティブロックとどのように異なりますか？

| 症状 | 考えられる原因 | 推奨される対応 |
| - | - | - |
| `NO_IMAGE`（`parts: null` および抽象的な prompt を伴う） | 画像生成の意図が不明確 | 画像の種類、視覚的主題、レイアウト要件を追加してください |
| セーフティポリシーエラーが返される | アップストリームのコンテンツセーフティポリシーがトリガーされた | ポリシーをトリガーする可能性のあるコンテンツを変更または削除してください |
| `NO_IMAGE` が断続的に発生し、同じリクエストを再試行すると成功する | prompt がテキスト出力を求めているため、モデルが最初に提案文を作成することがある | 提案や分析の文章を削除するか、「最終的な画像のみを出力」を追加してください |
| `candidates` がなく、`promptFeedback.blockReason` が `OTHER` である | 生成前にプロバイダーによって入力がブロックされた | [blockReason: OTHER のトラブルシューティング](/ja/faq/gemini-image-input-blocked) を参照してください |
| 画像生成の意図が明確であるにもかかわらず画像が返されない | モデル、グループ、token、またはアップストリームルートが利用できない可能性がある | エラー全文、モデル名、リクエストID、発生日時を添えてサポートにお問い合わせください |

<Info>
  `finishReason: NO_IMAGE` は、画像が返されなかったことのみを意味します。これ単体で prompt がポリシーに違反したことを証明するものではありません。完全なエラー内容、prompt、および呼び出しログを併せて確認してください。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="「画像を生成して」を追加すれば必ず問題は解決しますか？">
    いいえ。基本的な意図がより明確になるだけです。画像のタイプ、主題、構図、スタイル、および出力要件についても記述してください。抽象的な概念の場合は、インフォグラフィック、ポスター、またはフローチャートを明示的に指定してください。
  </Accordion>

  <Accordion title="GEOのトピックはコンテンツセーフティによってブロックされましたか？">
    GEOの概念自体には明らかな安全上のリスクは含まれていないように見えます。ただし、`NO_IMAGE` だけでアップストリームのポリシー決定を完全に排除することはできません。この場合、prompt は知識解説のように読めるため、画像の意図が不明確であることが最初に確認すべき点としてより適切です。
  </Accordion>

  <Accordion title="同じリクエストが成功することもあれば失敗することもあるのはなぜですか？ルートが変更されたのでしょうか？">
    ほとんどの場合、ルートは変更されていません。意図の不明確さに起因する `NO_IMAGE` は確率的なものです。リクエストごとに、モデルは画像の生成か、先にテキストを記述するかを選択します。テストでは、同じリクエストが約21%の確率で失敗し、多くの場合、連続して複数回失敗しました。クライアントで `NO_IMAGE` レスポンスを自動的に1〜2回リトライし、prompt を修正して根本原因を解消してください。
  </Accordion>

  <Accordion title="画像が返されなかったにもかかわらず、usageMetadata に tokens が含まれているのはなぜですか？">
    `usageMetadata` は、モデルが入力を処理し、推論またはテキストの tokens を生成したことのみを示しています。これはレスポンスに画像が含まれていることを意味するものではありません。レスポンス内の画像データフィールドを確認してください。
  </Accordion>

  <Accordion title="NO_IMAGE は課金されますか？">
    `NO_IMAGE` だけで課金を判断しないでください。APIYI の呼び出しログを確認し、リクエストによって課金レコードが生成されたかどうかを確認してください。
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
  <Card title="Gemini 画像で blockReason: OTHER が返されるのはなぜですか？" icon="shield-alert" href="/ja/faq/gemini-image-input-blocked">
    ブロックされた入力画像の特定方法と参照画像の前処理方法
  </Card>

  <Card title="Nano Banana 画像生成の失敗" icon="image-off" href="/ja/faq/nano-banana-image-failure">
    セーフティ、透かしの削除、著名な IP、未成年者などの一般的な原因
  </Card>

  <Card title="モデル API のエラーはどのようにトラブルシューティングすればよいですか？" icon="alert-triangle" href="/ja/faq/model-error-troubleshooting">
    401、429、503、504、タイムアウト、グループの問題に関する一般的なガイダンス
  </Card>

  <Card title="ログの課金額はどのように確認すればよいですか？" icon="file-text" href="/ja/faq/log-billing-explained">
    呼び出しログを使用してリクエストが成功したか、課金されたかを確認します
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.