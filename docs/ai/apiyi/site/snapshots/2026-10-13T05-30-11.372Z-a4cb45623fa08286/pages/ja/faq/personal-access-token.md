> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# パーソナルアクセストークンとは何ですか？システムトークンを置き換えるにはどうすればよいですか？

> パーソナルアクセストークンは、残高、ログ、トークン管理などの管理APIの認証を行い、スコープごとの権限、有効期限、IP許可リストに対応しています。レガシーシステムトークンは2026-11-11に廃止される予定です。

## 簡潔な回答

**パーソナルアクセス token**は、APIYIの管理API用の新しい認証情報です。スクリプトや自動化ツールから、残高照会、ログ照会、token管理APIを呼び出すことができます。
従来の**システム token**を置き換えるものです。**必要な権限のみを付与**し、**有効期限を設定**して、**IP許可リストに制限**することができます。1つのアカウントにつき最大20個の tokens を保持できるため、用途ごとに1つずつ発行可能です。

<Warning>
  **従来のシステム tokens は、2026-11-11 (UTC+8)に廃止される予定です。** それ以降、システム token を使用した管理API呼び出しは401を返します。
  その期日より前に実際の利用状況を確認し、延長する可能性もありますが、今すぐパーソナルアクセス token へ切り替えることをお勧めします。`Authorization` ヘッダーの値を置き換えるだけで済み、コードを変更する必要はありません。
</Warning>

<Info>
  パーソナルアクセス tokens は**モデルを呼び出すことはできません**。モデルを呼び出すには、引き続き API Key（コンソールでは「モデルキー」と呼ばれ、`sk-` で始まります）をご使用ください。
</Info>

## システムtokenとの違い

| | 従来のシステムtoken | パーソナルアクセスtoken |
| - | - | - |
| 権限 | アカウントの全権限 | スコープごとに選択可能。read、write、reveal-secretは独立 |
| 個数 | 1アカウントあたり1個 | 1アカウントあたり最大20個、用途ごとに1個 |
| 有効期限 | 無期限 | 30 / 90 / 180 / 365日、カスタム、または無期限 |
| IP許可リスト | 非対応 | IPv4、IPv6、CIDR |
| プレフィックス | 固定プレフィックスなし | `nap_`で始まる |
| ステータス | 2026-11-11 (UTC+8) に廃止予定 | 推奨 |

## 作成方法

<Steps>
  <Step title="Personal Access Tokens を開く">
    コンソールにサインインし、`api.apiyi.com/account/profile` にあるプロフィールページに移動します。**Account Options** の下にある **Personal Access Tokens** をクリックし、右上の **Create Token** をクリックします。
  </Step>

  <Step title="名前を設定して有効期限を選択する">
    「照合スクリプト」や「残高監視」など、用途がわかる名前を付けます。デフォルトの有効期限は30日で、期限が切れると token は機能しなくなります。スクリプトが予期せず停止しないよう、**より長い期間**（例：365日）**を選択することをお勧めします**。
  </Step>

  <Step title="IP許可リストを設定する（任意）">
    複数のエントリはカンマで区切ります。IPv4、IPv6、CIDRに対応しています。制限しない場合は空欄のままにしてください。**作成後に許可リストを編集することはできません。** 下記の推奨ワークフローを参照してください。
  </Step>

  <Step title="権限を選択する">
    スクリプトが使用するもののみを選択してください。下の表を参照してください。
  </Step>

  <Step title="token を作成して保存する">
    **Create Token** をクリックし、すぐに token をコピーして安全に保管してください。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-entry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=74b07a2becc459ad9db610e57281d4b7" alt="プロフィールページの Account Options にある Personal Access Tokens のエントリ" width="1400" height="598" data-path="images/personal-access-token-entry.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="パーソナルアクセストークンの作成：名前、有効期限、IP許可リスト、権限" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-expiry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=79d7e78889391a1bdb1b31239f4a48f1" alt="有効期限のオプション：30日、90日、180日、365日、カスタム日付、無期限" width="900" height="361" data-path="images/personal-access-token-expiry.png" />

## 選択すべき権限

権限には、読み取り（read）、書き込み（write）、シークレットの表示（reveal secret）の3種類があります。それぞれ個別に付与されます。書き込み権限に読み取り権限は含まれず、読み取り権限でもキーのプレーンテキストは表示されません。

| 呼び出したい API | 選択する権限 |
| - | - |
| [残高照会](/ja/api-capabilities/balance-query) (`GET /api/user/self`) | Profile · Read |
| [ログ照会](/ja/api-capabilities/log-query) (`GET /api/log/self`) | Usage & personal records · Read |
| [Token 管理](/ja/api-capabilities/token-management): API Keys の一覧取得または取得 | Model keys · Read |
| [Token 管理](/ja/api-capabilities/token-management): API Keys の作成、更新、または削除 | Model keys · Write |
| [Token 管理](/ja/api-capabilities/token-management): API Key のプレーンテキストの取得 | Model keys · Reveal secret |

たとえば、毎日の照合ジョブには「Usage & personal records · Read」のみが必要であり、残高モニターには「Profile · Read」のみが必要です。
\*\*パスワードの変更や2要素認証設定など、セキュリティ検証が必要な操作は、引き続きウェブサイトにサインインして行う必要があります。\*\*パーソナルアクセス token では、書き込み権限があってもこれらの操作を実行できません。

<Tip>
  スクリプトごとに1つの token を使用し、そのスクリプトで使用する権限のみを付与してください。スクリプトが不要になった場合や token が漏洩した場合は、その token のみを削除します。他のスクリプトには影響しません。
</Tip>

## IP許可リストの安全な設定

許可リストは作成後に編集できません。変更するには、新しい token を作成する必要があります。以下の手順を推奨します：

1. **許可リストを設定せずに token を作成し**、スクリプトが正常に動作することを確認します。
2. 正常に動作したら、**許可リストを設定した本番用 token を作成します**。本番サーバー、スタンバイサーバー、トラブルシューティングで使用するオフィスネットワークなど、利用する可能性のあるすべての送信元IP（egress IP）を含めてください。
3. 本番用 token に切り替え、**許可リストのないテスト用 token を削除します**。

プライベートネットワークのアドレスではなく、\*\*パブリックな送信元IP（egress IP）\*\*を入力してください。自宅のブロードバンド回線やオフィスネットワークのように送信元IPが変動する場合は、許可リストを使用しないでください。代わりに、読み取り専用権限を付与し、短めの有効期限を設定してください。

## 使用方法

使用方法はシステムtokenと同じです。`Authorization` ヘッダーにtoken自体を指定します。`Bearer ` プレフィックスは省略可能です。

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H "Authorization: $APIYI_TOKEN"
```

スクリプトで現在システムtokenを使用している場合は、環境変数または設定内の値を新しいtokenに置き換えてください。

## よくあるエラー

| HTTPステータス | レスポンス | 原因と対処法 |
| - | - | - |
| 401 | `ACCESS_TOKEN_LEGACY_RETIRED`, `Legacy management tokens have been retired...` | 廃止日を過ぎてもレガシーシステム token を引き続き使用しています。上記の説明に従ってパーソナルアクセス token を作成してください。 |
| 401 | `This access token may not be used from the current IP address.` | リクエストが token の許可リスト外の IP から送信されました。サーバーのパブリック egress IP を確認してください。許可リストは編集できないため、新しい token を作成してください。 |
| 403 | `ACCESS_TOKEN_SCOPE_DENIED`, `This endpoint is outside this access token's granted permissions.` | token にこの API が必要とする権限がありません。上記の表の権限を持つ新しい token を作成してください。 |
| 401 | 無効な token | token の有効期限が切れているか削除されたか、あるいはアカウントのパスワード、2要素認証、パスキーのいずれかが変更されました。**これら3つの変更のいずれかが行われると、アカウント上のすべてのパーソナルアクセス token が無効化されます。** 新しい token を作成してください。 |

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="残高照会API" icon="wallet" href="/ja/api-capabilities/balance-query">
    パーソナルアクセストークンを使用してアカウント残高を確認します
  </Card>

  <Card title="ログ照会API" icon="file-text" href="/ja/api-capabilities/log-query">
    照合のために時間範囲で呼び出しログを取得します
  </Card>

  <Card title="トークン管理API" icon="key" href="/ja/api-capabilities/token-management">
    プログラムから API Key の作成、ローテーション、削除を行います
  </Card>

  <Card title="API Key を安全に管理するには？" icon="shield-check" href="/ja/faq/key-security-management">
    API Key の権限境界と漏洩防止について説明します
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.