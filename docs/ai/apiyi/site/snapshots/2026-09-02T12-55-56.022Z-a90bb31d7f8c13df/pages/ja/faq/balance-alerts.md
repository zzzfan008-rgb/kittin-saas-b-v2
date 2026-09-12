> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 残高アラートを設定するには？

> APIYI は、メール、WeCom/DingTalk/Feishu グループボット、カスタム残高リマインダー API など、複数の残高アラート方法をサポートしています。

## クイックアンサー

APIYI は **3種類の残高アラート方法** をサポートしています。メール通知（デフォルトで有効）、WeCom / DingTalk / Feishu 経由のグループボット通知、そしてカスタムの残高リマインダー API です。ダッシュボードの **通知設定** ページで、アラートしきい値とチャネルを設定してください。

<Card title="通知設定へ移動" icon="settings" href="https://api.apiyi.com/account/notificationSettings">
  ダッシュボードのパス: **アカウント → 通知設定**

  ここでアラートしきい値を設定し、各通知チャネルの有効/無効を切り替えられます。
</Card>

## アラート方法の説明

<CardGroup cols={3}>
  <Card title="メール通知" icon="mail">
    **デフォルトで有効**

    残高が閾値を下回ると、アラートメールが登録済みアカウントのメールアドレスに自動送信されます。追加設定は不要です。
  </Card>

  <Card title="グループボット" icon="bot">
    **WeCom / DingTalk / Feishu** の webhook ボットをサポートしており、アラートをチームチャットにリアルタイムで直接送信できます。
  </Card>

  <Card title="Balance Reminder API" icon="code">
    独自の監視システムやアラートプラットフォームと連携するためのカスタム **Balance Reminder API** をサポートしています。
  </Card>
</CardGroup>

## 設定手順

<Steps>
  <Step title="APIYI ダッシュボードにログインする">
    [api.apiyi.com](https://api.apiyi.com) にアクセスしてアカウントにログインしてください。
  </Step>

  <Step title="通知設定を開く">
    左側のメニューで **アカウント → 通知設定** に移動するか、[通知設定ページ](https://api.apiyi.com/account/notificationSettings) を直接開いてください。
  </Step>

  <Step title="アラートしきい値を設定する">
    アラートを発生させる残高レベルを設定してください（例: 残高が \$10 未満になったらアラート）。通常の利用量で 3〜7 日分をカバーするしきい値の設定をおすすめします。
  </Step>

  <Step title="通知チャネルを有効にする">
    必要に応じてメール、グループボット webhook、または残高リマインダー API を有効にし、対応する通知先アドレス / webhook URL を入力してください。
  </Step>

  <Step title="アラートをテストする">
    設定後は、テストボタンを使うか、しきい値を一時的に下げて、アラートが正常に動作することを確認してください。
  </Step>
</Steps>

## チャンネルのおすすめ

<Tip>
  **チームでは、複数のチャンネルを同時に有効化するのがおすすめです**

  * **個人開発者**: メールで十分なことが多いです
  * **小規模チーム**: メール + WeCom / DingTalk / Feishu のグループボット
  * **エンタープライズユーザー**: メール + グループボット + 残高リマインダー API（内部モニタリングと連携）
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="なぜアラートメールを受信できなかったのですか？">
    ご確認ください:

    1. 登録済みのメールアドレスが正しく、メールを受信できること
    2. アラートメールがスパムとして判定されていないこと（迷惑メールフォルダをご確認ください）
    3. **Email notification** が Notification Settings で有効になっていること
    4. 残高が実際に設定されたしきい値を下回っていること
  </Accordion>

  <Accordion title="グループ bot の webhook URL はどう取得しますか？">
    * **WeCom**: グループチャット → グループ bot → Bot を追加 → Webhook URL をコピー
    * **DingTalk**: グループ設定 → スマートグループアシスタント → Bot を追加 → カスタム Bot → Webhook をコピー
    * **Feishu**: グループ設定 → グループ bot → Bot を追加 → カスタム Bot → Webhook URL をコピー

    Webhook URL を Notification Settings の対応するフィールドに貼り付けてください。
  </Accordion>

  <Accordion title="残高リマインダー API はどのように動作しますか？">
    残高リマインダー API を使うと、カスタム HTTP コールバック URL を設定できます。残高がしきい値を下回ると、システムはその URL に POST リクエストを送信し、Grafana、Prometheus、社内のアラートシステムなど、お使いの監視プラットフォームと連携できます。

    連携の詳細については、docs center の API documentation をご参照いただくか、サポートまでお問い合わせください。
  </Accordion>

  <Accordion title="トリガー後、アラートはどのくらいの頻度で再送されますか？">
    システムには、短時間に同じアラートが繰り返し送られないようにするスパム防止のスロットリングが組み込まれています。アラートを受信したら、サービス停止を防ぐため、速やかにチャージすることをおすすめします。
  </Accordion>

  <Accordion title="複数のアラートしきい値を設定できますか？">
    現在、Notification Settings ページは単一のしきい値のみをサポートしています。複数段階のアラート戦略については、Balance Reminder API を使ってご自身のシステムで実装することをおすすめします。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="残高は十分そうなのに呼び出しが失敗する" icon="credit-card" href="/ja/faq/balance-insufficient">
    事前控除の仕組みについて学ぶ
  </Card>

  <Card title="支払い方法" icon="dollar-sign" href="/ja/faq/payment-methods">
    利用可能なチャージ手段とガイド
  </Card>

  <Card title="チャージ特典" icon="gift" href="/ja/faq/recharge-promotions">
    コストを抑えるための最新チャージボーナスキャンペーン
  </Card>

  <Card title="呼び出しログ" icon="file-text" href="/ja/faq/call-logs">
    消費詳細と利用傾向を確認する
  </Card>
</CardGroup>

<Info>
  **親切なご案内**

  残高アラートはあくまで安全策です。特にトラフィックが集中する時間帯や新しいモデルを導入する際には、残高不足によるサービス中断を避けるため、アカウント残高と消費状況を定期的に確認することをおすすめします。
</Info>
