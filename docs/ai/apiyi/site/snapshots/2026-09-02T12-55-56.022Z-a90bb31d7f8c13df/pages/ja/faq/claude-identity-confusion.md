> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude はなぜ Qwen や DeepSeek を名乗るのか？

> Claude（特に AWS 経由）で「あなたはどのモデルですか？」に対してランダムな回答が返り、ときどき Qwen や DeepSeek だと名乗る理由: モデルの真正性とは無関係な業界全体の LLM の癖

## 簡潔な回答

<Info>
  **これはまったく正常です。モデルが偽物という意味ではなく、モデルの能力にも影響しません。**

  LLM の「どのモデルですか？」という質問への回答は **本質的に信頼できません** — 27 の主要な LLM を対象にした体系的な学術研究では、約 26% に「アイデンティティの混乱」が見られ、その根本原因はモデルの差し替えや再パッケージ化ではなく **hallucination** であることが示されています。Claude を API から直接呼び出す場合、そのアイデンティティを固定する system prompt はありません。中国語で質問すると、中国語の学習データの影響も受けるため、よく見かけた名前を「推測」してしまうことがあり、たとえば Qwen や DeepSeek などです。
</Info>

## 症状

<Warning>
  **典型的なシナリオ**

  AWS チャネル経由で Claude に「あなたはどのモデルですか？」と尋ねると、次のように答えることがあります。

  * 「私は Claude 4.5 です」と答えることがある
  * 「私は Qwen です」と主張することがある
  * 「私は DeepSeek です」と言うことがある
  * 特に中国語で尋ねた場合に目立ちやすく、実行のたびに答えが変わることもある

  **重要な観察点**: 同じモデルでも、通常の利用、コーディング、その他の複雑なタスクではまったく問題なく動作します。混乱するのは「自己識別」の答えだけです。これは、問題が「モデルの能力」ではなく「アイデンティティ認識」にあることを示しています。
</Warning>

<Info>
  **公式の AWS コンソールでも再現可能です - どのリレー チャネルとも関係ありません**

  **AWS Bedrock コンソールの組み込み推論インターフェース（Playground / Chat）** でも簡単に再現できます。Amazon の公式コンソールで Claude に直接「あなたはどのモデルですか？」と尋ねるだけで、APIYI や他のサードパーティーのリレーを一切介さずに、Qwen や DeepSeek を名乗る同じ回答が表示されます。

  これにより、この混乱した自己識別が上流のモデルのネイティブな挙動であり、チャネルの問題ではないことが直接証明されます。Bedrock コンソールでの再現動画も記録しています。

  * 📹 **動画ファイルはサポートに依頼してください**: 下の WeCom サポートを追加すると、完全な再現動画を入手できます
  * 📺 **サポートチームの WeCom Channels フィードで視聴できます**: デモ動画はそこに公開されています。ぜひ視聴してコメントしてください
</Info>

## 根本原因の分析

<AccordionGroup>
  <Accordion title="理由 1: モデルにはそもそも安定した内的アイデンティティがありません">
    モデルの名前は学習が完了した後に付与されます。重みの中に「自分は誰か」は一度も入っていません。API リクエスト内の `model` パラメータはサーバー向けのルーティング情報であり、モデル自身はそれを見ません。

    公式の Web アプリ（claude.ai）が正しく答えられるのは、各会話に「You are Claude」と伝える隠し system prompt が注入されるからです。直接の API 呼び出しには既定でそのような prompt がないため、モデルは学習データから「推測」するしかありません。

    詳しい説明はこちら: [なぜ LLM は自分のバージョン番号を知らないのでしょうか?](/ja/faq/model-version-identity)
  </Accordion>

  <Accordion title="理由 2: 中国語の学習データ汚染が、中国系モデルへの推測を偏らせます">
    Qwen と DeepSeek は、中国のインターネットで最も話題にされているモデルです。それらの自己紹介、API の例、チャットのスクリーンショットは中国語コーパスを埋め尽くしており、Claude の学習データにもそのコーパスは含まれています。

    アイデンティティの固定が弱い（system prompt がない）うえに、質問が **中国語で** されると、中国語の文脈では最も「自然」な補完が、こうした出現頻度の高い中国系モデル名のいずれかになることは十分あり得ます。これで、英語に切り替えたり、質問の言い回しを変えたりすると答えが変わる理由も説明できます。
  </Accordion>

  <Accordion title="理由 3: 学術研究も、これが業界全体の問題であることを裏付けています">
    2024 年の体系的研究「I'm Spartacus, No, I'm Spartacus: LLM のアイデンティティ混同の測定と理解」では、27 種類の主要 LLM を調査し、約 **26%** にアイデンティティ混同が見られることが確認されました。これにより、根本原因は **ハルシネーションであり、モデルの複製や置換ではない** ことが裏付けられています。

    逆の例も同じくらいよくあります。初期の DeepSeek のバージョンは ChatGPT だと主張し、GLM は Claude だと主張し、Gemini は特定の言語では他社のモデルだと主張したことがあります。自己識別は、これまで一度も信頼できる情報ではありませんでした。

    論文（コピーして開く）: `arxiv.org/abs/2411.10683`
  </Accordion>

  <Accordion title="意図的なものですか？（アンチ蒸留理論）">
    コミュニティでよく語られる説です。ベンダーがアイデンティティをモデルの重みに組み込まないのは、ひとつには技術的に不要だから（Web アプリは system prompt に依存するため）、もうひとつには、あいまいに定義された自己識別のほうが蒸留モデルには模倣しにくいから、というものです。

    明確に言うと、これはコミュニティの推測であり、どのベンダーも正確な自己識別を機能として約束したことはありません。確かなのは、**素の API のモデルが自分の名前に正しく答えられることを、主要ベンダーは誰も保証していない** ということです。
  </Accordion>
</AccordionGroup>

## なぜ混沌とした回答が本物のベアモデルの挙動と一致するのか

<Card title="リパッケージされたモデルだけが一貫した筋書きを必要とします" icon="shield-check">
  ベア API で呼び出された本物のモデルにはアイデンティティ用プロンプトがまったくないため、回答は自然にランダムになり、言語間でも揺れます — 今日は Claude 4.5、明日は Qwen、という具合です。

  リパッケージされた、あるいはモデルを差し替えたプラットフォームはその逆です。正体露見を避けるため、モデルに一貫して「私は Claude です」と主張させるプロンプトを注入することがよくあります。なので、やけに整っていて常に一貫した自己紹介が必ずしも信頼できるとは限りません。一方で、混沌とした回答は、アイデンティティ注入のないベアモデルの挙動と実際に一致します。

  とはいえ、混沌とした回答だけで本物だと証明できるわけでもありません — 下の信頼できる検証方法を参照してください。
</Card>

## 本物のClaudeを取得しているか確認する方法

<CardGroup cols={2}>
  <Card title="APIレスポンスで model フィールドを確認する" icon="code">
    すべての API レスポンスの JSON には、実際に使用された model を示す `model` フィールドが含まれています:

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>

  <Card title="呼び出しログを確認する" icon="file-text" href="/ja/faq/call-logs">
    APIYI コンソールの **call logs** では、各リクエストで実際に使用された model を確認できます。
  </Card>

  <Card title="複雑なタスクで比較する" icon="flask-conical">
    自己申告は当てになりませんが、**能力は嘘をつきません**。同じコーディング問題や長いコンテキストのタスクを複数のモデルで実行してみてください。Claude のコードスタイルと推論チェーンは、Qwen/DeepSeek とは明確に異なります。
  </Card>

  <Card title="技術チームに連絡する" icon="message-circle">
    まだ疑問がある場合は、APIYI の技術チームがチャネルと model のソースを確認するお手伝いをします。
  </Card>
</CardGroup>

## モデルに自分のアイデンティティを正しく答えさせる方法

公式の Web アプリが行っているのとまったく同じ方法です。リクエストに system prompt を追加します。

```python theme={null}
messages=[
    {
        "role": "system",
        "content": "You are Claude, an AI assistant developed by Anthropic."
    },
    {
        "role": "user",
        "content": "What model are you?"
    }
]
```

<Tip>
  **APIYI のサービス保証**: APIYI の Claude（AWS チャネルを含む）は公式ソースから転送され、リクエストはそのまま通過し、prompt は挿入されません。モデルが「自分が何者かを知らない」ことは、素の API プラットフォームでは共通に起こることであり、チャネルの真正性とは無関係です。
</Tip>

## 関連する質問

<CardGroup cols={2}>
  <Card title="なぜ LLM は自分のバージョン番号を知らないのですか？" icon="circle-question-mark" href="/ja/faq/model-version-identity">
    アイデンティティ問題の基本原理
  </Card>

  <Card title="呼び出しログを確認するには？" icon="file-text" href="/ja/faq/call-logs">
    実際に使用されたモデルのバージョンを確認します
  </Card>

  <Card title="適切なモデルを選ぶには？" icon="compass" href="/ja/faq/model-selection-guide">
    各モデルの強みとユースケースを学びます
  </Card>

  <Card title="モデル名の -c サフィックスは何を意味しますか？" icon="tag" href="/ja/faq/model-name-suffix-c">
    モデル命名のサフィックスを理解します
  </Card>
</CardGroup>

## お問い合わせ

<CardGroup cols={2}>
  <Card title="WeComサポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeComサポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[クリックしてサポートに連絡](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    モデル検証と技術サポート
  </Card>

  <Card title="メール" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネス**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
