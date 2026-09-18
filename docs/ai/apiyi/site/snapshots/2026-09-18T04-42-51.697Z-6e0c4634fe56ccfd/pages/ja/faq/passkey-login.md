> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Passkey でサインインするにはどうすればよいですか？

> APIYI は現在、passkey サインインに対応しています。Profile ページから 1 つをバインドし、指紋、顔認証、またはデバイスの画面ロックでログインできます。パスワードを覚える必要がなく、フィッシングやクレデンシャルスタッフィングにも強いです。

## 簡単な答え

APIYI は **passkey** によるサインインをサポートするようになりました。いったん連携すれば、普段使っている端末では **指紋、顔認証、または端末の画面ロック** だけでログインでき、アカウントパスワードは不要です。

連携方法: ログイン後、**プロフィール → 一番下までスクロール → アカウントオプション → Passkey を連携** に進んでください。`https://api.apiyi.com/account/profile` で。

<Info>
  **やる価値がある理由**: 覚えるべきパスワードがなくなり（パスワードを忘れたという問い合わせは圧倒的に多いログイン時のサポート要因です）、passkey は本質的にフィッシングやクレデンシャルスタッフィングに強くなっています。秘密鍵は端末やパスワードマネージャーから外に出ることがなく、サーバー側に盗まれうるパスワードも保存されません。
</Info>

## passkeyとは何か

passkeyは、WebAuthn / FIDO2標準に基づくパスワードレスサインインです。これをバインドすると、デバイスが鍵ペアを生成します。

* **秘密鍵**はデバイスのセキュアエレメントまたはパスワードマネージャーに保存され、**決してアップロードされません**；
* **公開鍵**はAPIYIに保存され、署名の検証だけに使われます。秘密鍵を導出するためには使用できません。

サインイン時には、デバイスが秘密鍵でチャレンジに署名し、あなたはその署名を**指紋、顔認証、または画面ロック**で承認するだけです。

<CardGroup cols={3}>
  <Card title="パスワードを忘れることがありません" icon="face-slightly-smiling">
    生体認証対応の任意のデバイスから直接ログインできます — メールのリセット手順はありません
  </Card>

  <Card title="設計上フィッシングに強い" icon="shield">
    passkeyはドメインにひも付くため、見た目が似たサイトではそもそも認証を開始できません
  </Card>

  <Card title="credential stuffingの影響を受けません" icon="database">
    サーバー側に漏えいするパスワードがないため、他所での侵害がここでのアカウントに及ぶことはありません
  </Card>
</CardGroup>

## パスキーのバインド方法

<Warning>
  **前提条件**: パスキーをバインドするには、あらかじめ **サインイン済み** である必要があります。これは既存のアカウントにサインイン方法を追加するものであり、新規登録には使用できません。
</Warning>

<Steps>
  <Step title="プロフィールページを開く">
    サインイン後、`https://api.apiyi.com/account/profile`に移動するか、左側のナビゲーションで **プロフィール** をクリックします。
  </Step>

  <Step title="最下部までスクロールしてアカウントオプションを見つける">
    ページ最下部の **アカウントオプション** カードで、**パスキーをバインド** をクリックします。

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="プロフィールページ下部のアカウントオプションとパスキーをバインドボタン" width="1100" height="818" data-path="images/passkey-bind-entry.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="プロフィールページ下部のアカウントオプションとパスキーをバインドボタン" width="1100" height="818" data-path="images/passkey-bind-entry.png" />
  </Step>

  <Step title="保存先を選択する">
    ブラウザが apiyi.com のパスキーの保存先を尋ねるシステムダイアログを開きます。環境に合うものを選んでください。

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="パスキーの保存先を尋ねるダイアログ" width="896" height="1010" data-path="images/passkey-save-location.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="パスキーの保存先を尋ねるダイアログ" width="896" height="1010" data-path="images/passkey-save-location.png" />

    | 保存先                       | 向いている人                   | 動作                           |
    | ------------------------- | ------------------------ | ---------------------------- |
    | iCloud キーチェーン             | Mac / iPhone / iPad ユーザー | Apple デバイス間で自動的に同期されます       |
    | Google パスワード マネージャー       | Chrome / Android ユーザー    | デバイス間で同期され、マシンを変更しても使えます     |
    | スマートフォン、タブレット、またはセキュリティキー | 他人のコンピューターで一時的にサインインする場合 | QRコードをスキャンし、自分のスマートフォンで確認します |
    | このブラウザープロファイル             | いつも使う1台のコンピューター          | このマシンのみに保存され、同期されません         |
  </Step>

  <Step title="確認すれば完了です">
    表示に従って **指紋認証、顔認証、または画面ロック** で確認してください。以後は、ログインページでパスキーでのサインインを選び、1回の確認でサインインできます。
  </Step>
</Steps>

## 状態の確認と解除

一度バインドすると、**プロフィール → アカウントオプション** に戻るとボタンが **Passkeyの解除** に変わり、横に **最終使用日時** が表示されます。これで、Passkey が使用されたかどうか、またいつ使用されたかをすばやく確認できます。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="Unbind Passkey button with last-used date shown once bound" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="Unbind Passkey button with last-used date shown once bound" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

**マシンを切り替える前に解除または再連携してください**: passkey が 1 つのブラウザープロファイルにしか存在しない場合（同期なし）、コンピューターを変更したり OS を再インストールしたりすると消えてしまいます。iCloud Keychain または Google Password Manager に保存された Passkey には影響ありません。

<Tip>
  **マシンを切り替える前に解除または再連携してください**: passkey が 1 つのブラウザープロファイルにしか存在しない場合（同期なし）、コンピューターを変更したり OS を再インストールしたりすると消えてしまいます。iCloud Keychain または Google Password Manager に保存された Passkey には影響ありません。
</Tip>

## 注意すべき点

<Warning>
  **必ずバックアップ用のサインイン方法を用意してください。** パスキーは追加であり、置き換えではありません。パスワードが引き続き使えること、登録済みのメールアドレスでメールを受信できること、または GitHub サインインが連携されていることを確認してください。代替手段がない状態で紛失したデバイスを復旧するのは、かなり大変です。
</Warning>

* **共有コンピュータでは登録しないでください**: パスキーはデバイス上に保存されるため、公共の端末や借りた端末で登録すると、その端末にサインイン手段が残ってしまいます。一時的にアクセスする場合は、「スマートフォン、タブレット、またはセキュリティキー」オプションを選び、ご自身のスマートフォンで QR コードを使って確認してください。
* **確認する前にドメインを確認してください**: 正規の登録やサインインの際、ダイアログには `apiyi.com` が表示されます。ドメインが正しくない場合は中止してください — その確認こそが、パスキーがフィッシングを防ぐ仕組みです。
* **同期は保存先によって異なります**: iCloud Keychain は Apple デバイス間で同期され、Google Password Manager はデバイス間で同期されますが、ローカルのブラウザープロファイルはまったく同期されません。複数デバイスからサインインする必要があるかどうかに応じて選んでください。
* **パスキーは API キーではありません**: パスキーはコンソールへのサインインにのみ対応し、API 呼び出しには影響しません。API 認証情報の管理については、[API キーを安全に管理する方法](/ja/faq/key-security-management) をご覧ください。
* **ブラウザー要件**: 指紋 / 顔 / 画面ロックによる確認に対応したデバイス上で、Chrome、Edge、Safari、または Firefox の最新バージョンが必要です。古いブラウザーでは、登録オプションがまったく表示されない場合があります。

## よくある質問

<AccordionGroup>
  <Accordion title="パスキーを連携した後でも、パスワードでサインインできますか？">
    はい。パスキーはサインイン方法を**追加**するものであり、パスワードでのサインインと GitHub でのサインインはこれまでどおり機能します。少なくとも1つの代替手段を残しておくことをおすすめします。
  </Accordion>

  <Accordion title="別のコンピュータに切り替えたのですが、パスキーはまだ使えますか？">
    保存先によります。**iCloud Keychain** または **Google Password Manager** のパスキーはデバイス間で同期され、新しい端末でそのアカウントにサインインするとすぐに使えます。**ローカルのブラウザープロファイル** にのみ保存した場合は同期されないため、新しいデバイスで再度連携する必要があります。
  </Accordion>

  <Accordion title="スマートフォンを紛失したり、デバイスが故障したりした場合はどうなりますか？">
    代替手段（パスワードまたは GitHub）でサインインし、プロフィールページで古いパスキーの連携を解除してから、新しいデバイスで新しいパスキーを連携してください。だからこそ、バックアップのサインイン方法を必ず残しておくようお願いしています。
  </Accordion>

  <Accordion title="複数のデバイスに連携できますか？">
    パスキーが iCloud Keychain または Google Password Manager に保存されている場合は、他のデバイスに自動で同期され、通常は再連携は不要です。相互に同期しない環境どうし（たとえば Mac と Android スマートフォン）で使うには、いったん連携を解除して別の環境で再連携するか、たまに使うだけなら「phone, tablet, or security key」の QR フローを使ってください。
  </Accordion>

  <Accordion title="パスキーで指紋データが公開されることはありますか？">
    いいえ。指紋と顔のデータは**デバイス上でローカルに**検証され、サイトに送信されることはありません。APIYI が保存するのは公開鍵だけであり、そこから秘密鍵を導き出すことはできません。
  </Accordion>

  <Accordion title="連携をクリックしたのにダイアログが表示されません。">
    よくある原因は、古いブラウザーを使っている、デバイスで画面ロックや生体認証が設定されていない、ブラウザーの権限がプロンプトをブロックしている、または WebAuthn に対応していない組み込みブラウザーであることです（モバイルアプリ内でよくあります）。最新の Chrome / Edge / Safari に切り替え、OS で画面ロック確認を有効にして、もう一度お試しください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [パスワードを忘れた場合はどうすればよいですか?](/ja/faq/forgot-password)
* [GitHub ログインで「Account Already Bound」と表示されるのはなぜですか?](/ja/faq/github-bindng-bindng-error)
* [API key を安全に管理するにはどうすればよいですか?](/ja/faq/key-security-management)
* [登録時に APIYI がサポートするメールプロバイダーはどれですか?](/ja/faq/email-registration)
* [APIYI はどのようにデータセキュリティを確保していますか?](/ja/faq/data-security)
