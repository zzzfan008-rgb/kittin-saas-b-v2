> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GitHub ログインで「アカウントはすでに紐付け済み」と表示される？

> GitHub で APIYI にログインする際の「この GitHub アカウントはすでに紐付けられています」エラーを修正します

## クイックアンサー

まず `github.com` に**同じブラウザ**でログインし、その後 APIYI のウェブサイトで GitHub のワンクリックログインを使用してください。**必ず Chrome ブラウザを使用してください**。

## 症状

GitHub アカウントで APIYI にログインしようとすると、次のエラーメッセージが表示されます。

> この GitHub アカウントはすでに紐付けられています

そのため、通常どおりログインできません。

## 解決手順

<Steps>
  <Step title="Chromeブラウザを開く">
    この手順では**Chromeブラウザ**を必ず使用してください。ログインフローが正しく動作するよう、Safari、Firefox など他のブラウザは使用しないでください。
  </Step>

  <Step title="GitHubにログインする">
    Chromeで`github.com`を開き、正しいGitHubアカウントでログインしていることを確認してください。

    以前に別のGitHubアカウントでログインしていた場合は、先にログアウトし、その後 APIYI に紐づけられたアカウントでログインしてください。
  </Step>

  <Step title="APIYIにログインする">
    **同じChromeブラウザ**でAPIYIのサイトを開き、「GitHubワンクリックログイン」ボタンをクリックしてログインを完了してください。

    <Warning>
      両方の手順は同じブラウザで完了する必要があります。各手順で別々のブラウザを使用しないでください。
    </Warning>
  </Step>
</Steps>

## よくある質問

<AccordionGroup>
  <Accordion title="なぜ Chrome ブラウザを使う必要があるのですか？">
    Chrome は GitHub OAuth ログインフローとの互換性が最も高いためです。ほかのブラウザでは Cookie やセッションの同期に問題があり、ログインに失敗することがあります。
  </Accordion>

  <Accordion title="Chrome を使っていますが、まだ動作しません。どうすればよいですか？">
    次をお試しください:

    * Chrome のキャッシュと Cookie を削除する
    * Chrome がシークレットモードになっていないことを確認する
    * ブラウザ拡張機能がサードパーティ Cookie をブロックしていないか確認する
    * GitHub からログアウトし、再度ログインして、APIYI のワンクリックログインをもう一度試す
  </Accordion>

  <Accordion title="紐づけた GitHub アカウントはどう変更しますか？">
    紐づけた GitHub アカウントを変更する必要がある場合は、サポートまでお問い合わせください。
  </Accordion>
</AccordionGroup>

## お問い合わせ

<Card title="サポートにお問い合わせ" icon="message-circle">
  上記の手順を試しても問題が解決しない場合は、サポートチームまでご連絡ください。
</Card>
