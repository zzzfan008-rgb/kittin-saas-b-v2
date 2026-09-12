> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# アカウントを削除するには？

> プロフィールページからAPIYIアカウントを削除できます。すべてのユーザーデータ、利用ログ、チャージ記録は完全に失われます — 慎重に進めてください。

## クイックアンサー

APIYIコンソールにログインし、`api.apiyi.com/account/profile`の**プロフィール**ページに移動して、ページ下部の「アカウントオプション」にある**アカウントを削除**ボタンをクリックしてください。確認プロンプトが表示され、操作を確定できます。

<Warning>
  **アカウント削除は元に戻せません**: 一度削除すると、**ユーザーデータ、利用ログ、チャージ記録、およびアカウント残高**は完全に失われ、復元できません。誤って削除した場合の責任はユーザーにあり、プラットフォームはデータ復旧の責任を負いません。続行する前に慎重にご確認ください。
</Warning>

## 見つけ方

削除ボタンは、**プロフィール**ページの下部にある**アカウントオプション**セクションにあります。— 「パスワードの変更」、「システムトークン」、「アクセス トークン」の横です:

<img src="https://mintcdn.com/apiyillc/Az0T-cmcmXqc4ycr/images/account-deletion-button.png?fit=max&auto=format&n=Az0T-cmcmXqc4ycr&q=85&s=36f570e399cf0f60267c39c9a70f3a25" alt="アカウント削除ボタンの位置" width="1140" height="258" data-path="images/account-deletion-button.png" />

## 手順

<Steps>
  <Step title="プロフィールに移動">
    APIYI コンソールにログインした後、プロフィールページを開きます：

    ```
    https://api.apiyi.com/account/profile
    ```
  </Step>

  <Step title="「アカウント オプション」セクションを見つける">
    ページの**最下部**までスクロールし、「アカウント オプション」セクションを見つけます。
  </Step>

  <Step title="「アカウントを削除」をクリック">
    赤い**アカウントを削除**ボタン（ゴミ箱アイコン付き）をクリックします。
  </Step>

  <Step title="ダイアログで確認する">
    確認ダイアログが表示されます。確認する前に内容をよく読んでください。**確認すると、操作は直ちに有効になり、元に戻せません。**
  </Step>
</Steps>

## 削除する前に

<CardGroup cols={2}>
  <Card title="アカウント残高" icon="wallet" color="#ef4444">
    残高が残っている場合、削除後はすべて消去され、**返金不可**となります。先に使い切るか、返金を申請することをご検討ください。
  </Card>

  <Card title="利用ログ" icon="file-text" color="#ef4444">
    すべての履歴呼び出し記録が削除され、後からの照合や監査には使用できなくなります。
  </Card>

  <Card title="チャージ記録" icon="receipt" color="#ef4444">
    請求書と注文履歴はアカウントとともに失われます。事前にエクスポートするか、請求書を取得してください。
  </Card>

  <Card title="APIキー" icon="key" color="#ef4444">
    すべてのシステム用およびアクセス tokens は直ちに無効になります。これらを使用している稼働中のワークロードは、すぐに失敗します。
  </Card>
</CardGroup>

<Tip>
  **推奨**: 削除する前に、未請求のチャージ注文、未エクスポートの利用ログ、および API をまだ呼び出している本番サービスがないか確認してください。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="削除後、同じメールアドレスで再登録できますか？">
    多くの場合、メールアドレスは解放され、再登録に使用できます。ただし、**新しいアカウントは旧アカウントと一切関連しません**。残高、ログ、チャージ記録、キャンペーン適用資格は引き継がれません。特別なケースについては、WeChat のカスタマーサポートまでご連絡ください。
  </Accordion>

  <Accordion title="アカウントにまだ残高があります。削除後に返金できますか？">
    返金が必要な場合は、アカウントを削除する**前に**、[返金ポリシー](/ja/faq/refund-policy)に基づいて申請してください。**一度削除すると、残高は回復できず、返金申請も受け付けられなくなります。**
  </Accordion>

  <Accordion title="誤って「アカウントを削除」をクリックしてしまいました。取り消せますか？">
    確認ダイアログがあるため、「アカウントを削除」ボタンをクリックしただけでは**すぐには削除されません**。ただし、ダイアログで確認すると、操作は**即時かつ取り消し不可**です。確認前にダイアログをよくお読みください。
  </Accordion>

  <Accordion title="今は使うつもりがないだけです。削除以外の方法はありますか？">
    **一時的に利用を停止するだけ**であれば、削除は不要です。

    * 「システムトークン」セクションで**APIキーを無効化または削除**して、誤使用を防げます
    * 残高はアカウント内に残り、次回ログイン時に利用できます
    * 履歴と記録を保持でき、後で再登録する手間も省けます
  </Accordion>

  <Accordion title="パスワードを忘れてログインできません。アカウントはどうやって削除しますか？">
    まず [パスワードを忘れましたか？](/ja/faq/forgot-password) の手順でアカウントを回復し、その後に削除を進めてください。アクセスを回復できない場合は、WeChat のカスタマーサポートまでご連絡ください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="返金ポリシー" icon="rotate-ccw" href="/ja/faq/refund-policy">
    削除する前に返金ルールを確認してください
  </Card>

  <Card title="パスワードをお忘れですか?" icon="key" href="/ja/faq/forgot-password">
    パスワードの回復とリセット
  </Card>

  <Card title="データセキュリティ" icon="shield" href="/ja/faq/data-security">
    APIYI のデータセキュリティとプライバシーポリシーについて学ぶ
  </Card>

  <Card title="通話履歴" icon="file-text" href="/ja/faq/call-logs">
    削除する前に使用履歴をエクスポートしてください
  </Card>
</CardGroup>
