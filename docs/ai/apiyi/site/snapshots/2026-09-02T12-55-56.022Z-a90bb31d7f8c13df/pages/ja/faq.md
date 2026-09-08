> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FAQ 概要

> APIYI のよくある質問の完全な索引です。開始方法、モデル呼び出し、token とログ、課金、エンタープライズサービス、アカウントログインを、トピック別または症状別に参照できます。

APIYI の FAQ 記事はすべてここに索引されています。APIYI を初めてご利用ですか？ **はじめに** と **よくある質問** から始めてください。すでに連携済みで、特定のエラーに遭遇していますか？ **症状別トラブルシューティング** に進んでください。すべて読み通したいですか？ 下の **トピック別に見る** をご覧ください。

## 🚀 3ステップで始める

<CardGroup cols={3}>
  <Card title="ステップ1: 登録" icon="mail" href="/ja/faq/email-registration">
    Gmail、Outlook、Foxmail、大学のメールアドレスに対応しています。GitHubでサインインすることもできます
  </Card>

  <Card title="ステップ2: KEYを作成" icon="key" href="/ja/faq/token-management">
    コンソールからデフォルトの token を取得するか、専用の KEY を作成して、そのグループを選択します
  </Card>

  <Card title="ステップ3: ベース URLを設定" icon="link" href="/ja/faq/base-url-config">
    OpenAI 形式では `/v1` を、Claude ではルートドメインを、Gemini では `/v1beta` を使用します
  </Card>
</CardGroup>

## 🔥 よくある質問

<CardGroup cols={2}>
  <Card title="KEY を作成するには？" icon="key" href="/ja/faq/token-management">
    デフォルト token の取得と新しい KEY の作成を、手順を追って解説します
  </Card>

  <Card title="Base URL の設定方法は？" icon="link" href="/ja/faq/base-url-config">
    `/v1`、ルートドメイン、または `/v1beta` のどれがどのモデルに適用されるか
  </Card>

  <Card title="適切な AI モデルはどう選べばよいですか？" icon="compass" href="/ja/faq/model-selection-guide">
    用途、コスト、速度でモデルを選ぶ方法
  </Card>

  <Card title="なぜ API Key が無効なのですか？" icon="triangle-alert" href="/ja/faq/invalid-api-key">
    10回中9回は Base URL と KEY の組み合わせが一致していません — まずここを確認してください
  </Card>

  <Card title="残高があるのにリクエストを実行できないのはなぜですか？" icon="credit-card" href="/ja/faq/balance-insufficient">
    事前差し引きの仕組みと、過大な max\_tokens 値
  </Card>

  <Card title="モデルのレート倍率はどういう意味ですか？" icon="calculator" href="/ja/faq/model-multiplier">
    レート倍率は RMB 基準です — 固定レートを適用して USD 換算値を求めます
  </Card>

  <Card title="どのチャージ特典がありますか？" icon="gift" href="/ja/faq/recharge-promotions">
    初回チャージ特典、段階別特典、エンタープライズ向けポリシー
  </Card>

  <Card title="Web アプリと API が異なるのはなぜですか？" icon="layers" href="/ja/faq/webapp-vs-api-difference">
    同じモデルでも、公式サイトでは API 経由より賢く感じるのはなぜか
  </Card>
</CardGroup>

***

## 🔧 症状別トラブルシューティング

実際に発生している症状に一致する行を見つけてください。1 つの症状が複数のトピックにまたがることがよくあるため、この表では観測できる挙動ごとにトラブルシューティング記事を再整理しています。

| 何が起きているか                              | 考えられる原因                                          | 参照先                                                                                                             |
| ------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| API Key が無効 / 401                     | Base URL と KEY が一致しない、または KEY の টাইポ             | [無効な API Key](/ja/faq/invalid-api-key) · [Base URL の設定](/ja/faq/base-url-config)                                |
| 残高はあるのにリクエストが失敗する                     | 事前差し引きメカニズム、または max\_tokens が大きすぎる               | [残高不足](/ja/faq/balance-insufficient) · [事前差し引き](/ja/faq/pre-deduction-quota)                                    |
| リクエストがタイムアウトする、またはストリーム中に切断される        | クライアントのタイムアウトが短すぎる；reasoning モデルは遅い              | [API タイムアウトを避ける](/ja/faq/timeout-configuration)                                                                 |
| ログでは成功と課金が表示されるのに、クライアントには何も届かない      | ログの所要時間はゲートウェイ完了時点で止まるため、差分は下流側か終了シグナルにあります      | [ログは終了したのに応答がない](/ja/faq/log-duration-vs-client-wait)                                                           |
| Web サイト / API が 502 を返す               | サービスコンテナが一時的に自動再起動している；約 1 分で復旧します               | [502 への対処方法](/ja/faq/website-502-error)                                                                         |
| 429 concurrency エラー                   | concurrency クォータに達した                             | [API concurrency 制限](/ja/faq/api-concurrency)                                                                   |
| 出力が文の途中で切れる                           | max\_tokens が未設定、または小さすぎる                        | [max\_tokens とは](/ja/faq/max-tokens)                                                                            |
| 特定のモデルが実行できない                         | アカウント権限がロックされている、または token モデルのホワイトリストにない        | [一部のモデルを使えない理由](/ja/faq/model-availability) · [token モデルのホワイトリスト](/ja/faq/token-model-whitelist)                |
| 画像生成が失敗する / 空で返る                      | Google のコンテンツ安全性が発動した                            | [Nano Banana の失敗](/ja/faq/nano-banana-image-failure)                                                            |
| 出力が参照画像と大きく異なる                        | 参照画像は base64 でアップロードする必要がある                      | [画像が参照と異なる](/ja/faq/image-result-differs-from-reference)                                                        |
| 白背景の画像に黒い斑点が出る                        | AI Studio ルートでの既知の挙動                             | [白背景のアーティファクト](/ja/faq/white-background-image-artifacts)                                                        |
| task ID で画像結果をポーリングしたい                | 画像生成は同期のみ                                        | [画像 API に非同期版はあるか](/ja/faq/image-async-api)                                                                     |
| モデルが別のベンダーだと主張する / バージョンを言えない         | モデル自身の自己認識は信頼できません                               | [Claude が Qwen だと主張する](/ja/faq/claude-identity-confusion) · [モデルは自分のバージョンを知らない](/ja/faq/model-version-identity) |
| Web アプリは賢いのに、API はそうではない              | Web アプリには system prompt とツールが含まれますが、API は素のモデルです | [Web アプリと API の違い](/ja/faq/webapp-vs-api-difference)                                                            |
| KEY に見覚えのない呼び出しがある                    | KEY が漏えいしている可能性があります — 追跡して無効化してください             | [予期しない KEY 使用を調査する](/ja/faq/troubleshoot-key-usage) · [キーを安全に管理する](/ja/faq/key-security-management)             |
| 課金が合わない                               | 利用量単位と呼び出し単位の課金は、ログの読み取り方が異なります                  | [ログでの課金の読み方](/ja/faq/log-billing-explained) · [モデル倍率](/ja/faq/model-multiplier)                                 |
| 画像または動画のダウンロードが遅い                     | 特定サーバーで海外 CDN にルーティングされるため                       | [CDN のダウンロードが遅い](/ja/faq/cdn-download-slow)                                                                     |
| プロキシは必要ですか？                           | 直接接続で動作するため、プロキシは不要です                            | [プロキシは必要ですか](/ja/faq/network-proxy)                                                                             |
| GitHub ログインで「アカウントはすでに連携されています」と表示される | その GitHub アカウントは別のメールアドレスに連携されています               | [GitHub 連携エラー](/ja/faq/github-bindng-bindng-error)                                                              |
| パスワードを忘れましたか                          | メールでリセットするか、サポートに問い合わせてください                      | [パスワードを忘れた場合](/ja/faq/forgot-password)                                                                          |

***

## 📚 トピック別に見る

### 🧭 サイトの機能 (3)

| 質問                                                                               | 一言で                                   |
| -------------------------------------------------------------------------------- | ------------------------------------- |
| [Tokens & Groups](/ja/faq/token-and-groups)                                      | KEYを作成してグループを選ぶ方法                     |
| [What is a Group? User Group vs Token Group Explained](/ja/faq/groups-explained) | tokenに選択されたグループが実際に適用されます             |
| [Why Doesn't APIYI Offer One-Click Integration?](/ja/faq/one-click-integration)  | モデルごとに統合方法が異なるため、代わりにAIアシスタントをお使いください |

### ⚙️ モデルと API (18)

| 質問                                                                                            | 一言で                                                                    |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [Google モデルは AI Studio と Vertex のどちらで動作しますか？](/ja/faq/google-upstream-aistudio-vertex)        | デフォルトのグループは公式 AI Studio ルートを使います                                       |
| [白背景の画像に黒い斑点、汚れたような部分、またはぼやけた色ブロックが出るのはなぜですか？](/ja/faq/white-background-image-artifacts)      | 純白ではなく明るい背景を指定します                                                      |
| [透明背景（PNG 切り抜き）の画像を生成するにはどうすればよいですか？](/ja/faq/image-transparent-background)                   | 実際の alpha チャンネルを得るには、`background: "transparent"` を `gpt-image-2` に渡します |
| [適切な AI モデルはどう選べばよいですか？](/ja/faq/model-selection-guide)                                       | 用途、コスト、速度で選びます                                                         |
| [テキストと生成画像の両方を出力する対話型 API はありますか？](/ja/faq/text-and-image-in-one-api)                         | 画像の読み取りと画像の生成は別物です。画像生成への4つの経路があります                                    |
| [一部のモデルが使えないのはなぜですか？](/ja/faq/model-availability)                                             | 一部のモデルは先に権限の解放が必要です                                                    |
| [公式の Web アプリと API で結果が異なるのはなぜですか？](/ja/faq/webapp-vs-api-difference)                          | Web アプリは system prompt を追加し、API は素のモデルです                               |
| [AI モデルはなぜ自分のバージョンを知らないのですか？](/ja/faq/model-version-identity)                                 | モデル自身のバージョン認識は当てになりません                                                 |
| [なぜ Claude は Qwen や DeepSeek だと主張するのですか？](/ja/faq/claude-identity-confusion)                  | モデルが入れ替わったのではなく、アイデンティティの幻覚です                                          |
| [モデル名の -c サフィックスは何を意味しますか？](/ja/faq/model-name-suffix-c)                                      | 課金の異なる別ルートを示します                                                        |
| [ベース URL はどう設定しますか？ /v1、ルートドメイン、/v1beta の違いは？](/ja/faq/base-url-config)                       | OpenAI、Claude、Gemini それぞれに1つずつの形式があります                                 |
| [API のタイムアウトを避けるにはどうすればよいですか？](/ja/faq/timeout-configuration)                                 | クライアント側のタイムアウトを延ばします。推論モデルは遅いです                                        |
| [ログでは呼び出し完了かつ課金済みなのに、クライアントが応答を受け取っていません。どう切り分ければよいですか？](/ja/faq/log-duration-vs-client-wait) | 2つの時計は別の時間窓を測っています。まず差分を測ります                                           |
| [API の同時実行数の制限は？](/ja/faq/api-concurrency)                                                    | 制限はモデル種別ごとに異なり、引き上げ可能です                                                |
| [max\_tokens とは何ですか？ 未設定だとどうなりますか？](/ja/faq/max-tokens)                                       | 出力長を上限で制御します。未設定時はデフォルトがあります                                           |
| [Nano Banana の画像生成失敗でよくある原因](/ja/faq/nano-banana-image-failure)                               | たいてい Google のコンテンツ安全機能が反応しています                                         |
| [生成された画像が参照画像と大きく異なるのはなぜですか？](/ja/faq/image-result-differs-from-reference)                    | 参照画像は base64 でエンコードする必要があります                                           |
| [非同期の画像 API はありますか？ タスク ID で結果を照会できますか？](/ja/faq/image-async-api)                             | 同期のみです。タスク ID の照会はできません                                                |

### 🔑 Tokens とログ (9)

| Question                                                              | 一行で                               |
| --------------------------------------------------------------------- | --------------------------------- |
| [KEY はどう作成しますか？](/ja/faq/token-management)                            | デフォルトの token を取得するか、コンソールで新規作成します |
| [token に利用可能モデルを設定する必要はありますか？](/ja/faq/token-model-whitelist)         | 任意ですが、プロジェクトを分離する場合は推奨です          |
| [API Key を安全に管理するにはどうすればよいですか？](/ja/faq/key-security-management)      | IP ホワイトリスト、モデルのホワイトリスト、日々の習慣です    |
| [token 課金モードの違いは何ですか？](/ja/faq/token-billing-modes)                   | 5つの課金モードと、それぞれが適する場面です            |
| [自分の呼び出し記録を確認するにはどうすればよいですか？](/ja/faq/call-logs)                      | コンソールのログページで呼び出しと課金の詳細を確認できます     |
| [ログの課金額はどう読み取ればよいですか？](/ja/faq/log-billing-explained)                 | 使用量ごとか呼び出しごとか、使用量からコストを算出する方法です   |
| [呼び出しログはどれくらい保持され、いつクリアされますか？](/ja/faq/log-retention-policy)          | 現在の月と直前の2か月分で、5日にクリアされます          |
| [トラブルシューティングのためにバックエンドで詳細ログを表示できますか？](/ja/faq/user-logs-control)      | 管理者は一時的に詳細ログを有効化できます              |
| [予期しない API Key の使用を調査するにはどうすればよいですか？](/ja/faq/troubleshoot-key-usage) | ログで実際の IP を追跡し、KEY を無効化します        |

### 🏢 エンタープライズサービス (7)

| 質問                                                                          | 一言でいうと                           |
| --------------------------------------------------------------------------- | -------------------------------- |
| [エンタープライズグループとは何ですか？ いつ使うべきですか？](/ja/faq/enterprise-group-vertex-fallback)  | モデル別グループで、供給がより安定しており、レート倍率が高めです |
| [APIYI のエンタープライズサービスは信頼できますか？ モデルは本物ですか？](/ja/faq/enterprise-trust)         | 透明性のある公式リレー — 経路変更やモデル差し替えはありません |
| [エンタープライズユーザーと個人ユーザーの違いは何ですか？](/ja/faq/enterprise-vs-individual)            | アカウント種別は同じで、違いはサポートと料金にあります      |
| [エンタープライズ顧客はどのようにチャージしますか？](/ja/faq/enterprise-recharge)                    | 銀行振込がおすすめです。VATインボイスも利用できます      |
| [大学の顧客はどうすれば安心して精算できますか？](/ja/faq/university-reimbursement)                 | インボイス、購入明細、押印書類をご提供します           |
| [APIYI は SLA 保証を提供していますか？](/ja/faq/sla-guarantee)                           | はい。課金異常の補償と残高の補填を含みます            |
| [エージェント ミニプログラムにはアルゴリズム届出が必要ですか？](/ja/faq/agent-miniapp-algorithm-filing)   | 通常は必要です。一般的な手順を説明します             |
| [海外モデルを使った中国向け製品のコンプライアンスはどう対応すればよいですか？](/ja/faq/overseas-model-compliance) | ライセンス層、モデルの届出状況、コンテンツモデレーション     |

### 💰 課金とセキュリティ (14)

| 質問                                                               | 一言で                                     |
| ---------------------------------------------------------------- | --------------------------------------- |
| [公式料金と同じなら、なぜAPIYIで買うのですか？](/ja/faq/official-pricing-advantages) | 公式と同じ価格にチャージ特典が付き、グループ割引とも併用可能です        |
| [APIYIはどうして公式料金より安いのですか？](/ja/faq/why-cheaper-than-official)     | 一括購入とベンダー分配で、モデルの品質低下はありません             |
| [モデルの「倍率」とは何を意味しますか？](/ja/faq/model-multiplier)                  | RMB建ての単位です。USD換算には固定レートを適用します           |
| [100 RMB でどれだけの計算能力が得られますか？](/ja/faq/rmb-to-computing-power)     | 換算比率はお使いのシステム側で決まります                    |
| [APIYI はキャッシュ課金に対応していますか？](/ja/faq/cache-billing)                | 主要なルートはすべて対応しており、キャッシュヒット率はベンダーごとに異なります |
| [API 呼び出しの事前控除メカニズムとは何ですか？](/ja/faq/pre-deduction-quota)         | 事前に見積もって控除し、実際の利用量で精算します                |
| [残高があるのにリクエストを実行できないのはなぜですか？](/ja/faq/balance-insufficient)      | 事前控除のチェック、または max\_tokens の設定が高すぎるためです  |
| [残高アラートはどう設定しますか？](/ja/faq/balance-alerts)                       | メール、グループボット、または残高アラート API で設定できます       |
| [APIYI はどの支払い方法に対応していますか？](/ja/faq/payment-methods)              | WeChat、Alipay、USDT、Stripe、PayPal などです   |
| [どのチャージ特典がありますか？](/ja/faq/recharge-promotions)                   | 初回特典や段階別ボーナス、請求書発行に対応しています              |
| [代理店パートナーはどう申し込みますか？友達紹介でリベートを得られますか？](/ja/faq/referral-program) | 紹介報酬は標準で有効です。申し込みは不要です                  |
| [APIYI の返金ポリシーとは何ですか？](/ja/faq/refund-policy)                    | 条件、手続き、手数料、請求書に関する注意事項です                |
| [コンテンツの安全性とコンプライアンスはどのように確保されますか？](/ja/faq/content-safety)       | モデレーションの仕組みと違反対応です                      |
| [APIYI はどのようにデータセキュリティを確保していますか？](/ja/faq/data-security)         | 暗号化された転送、最小限の保存、アクセス制御です                |

### 🌐 ネットワーク・接続 (4)

| 質問                                                               | 一言でいうと                                             |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [APIを使うのにプロキシは必要ですか?](/ja/faq/network-proxy)                     | 直接接続で利用できます。プロキシやVPNは不要です                          |
| [APIYIのサーバーはどこにありますか? どのサーバーを選べばよいですか?](/ja/faq/server-location) | ノードの所在地、レイテンシー測定、購入時のアドバイス                         |
| [CDNの画像/動画ダウンロードが遅いです — どうすればよいですか?](/ja/faq/cdn-download-slow)  | 特定のサーバーでの海外CDNルーティングの診断                            |
| [WebサイトまたはAPIで502が返ります — どうすればよいですか?](/ja/faq/website-502-error) | コンテナが短時間で自動再起動します。約1分で復旧し、課金は発生しません。30秒後に再試行してください |

### 👤 アカウントとログイン (6)

| 質問                                                                                  | 1行での回答                             |
| ----------------------------------------------------------------------------------- | ---------------------------------- |
| [APIYI は登録にどのメールプロバイダーをサポートしていますか?](/ja/faq/email-registration)                     | Gmail、Outlook、Foxmail、大学のメールアドレスです |
| [Passkey でのサインイン方法は?](/ja/faq/passkey-login)                                        | 一度連携すれば、指紋認証または顔認証で使用できます          |
| [GitHub ログインで「アカウントはすでに連携されています」と表示されるのはなぜですか?](/ja/faq/github-bindng-bindng-error) | その GitHub アカウントは別のメールアドレスに連携されています |
| [パスワードを忘れた場合はどうすればよいですか?](/ja/faq/forgot-password)                                  | メールでリセットするか、サポートに помощиを依頼してください  |
| [なぜ私の API Key は無効なのですか?](/ja/faq/invalid-api-key)                                   | Base URL と KEY の不一致が原因であることがほとんどです |
| [アカウントを削除するにはどうすればよいですか?](/ja/faq/account-deletion)                                 | ワンクリックで削除できます。データは復元できません          |

***

## 💬 まだお困りですか？

<CardGroup cols={2}>
  <Card title="ユースケース" icon="layout-grid" href="/ja/scenarios">
    Cherry Studio、Claude Code、Cursor などの統合ガイド
  </Card>

  <Card title="モデル料金" icon="circle-dollar-sign" href="/en/models">
    すべてのモデルのライブ料金表と詳細ページ
  </Card>

  <Card title="最新情報" icon="radio-tower" href="/en/live/index">
    モデルの状態、供給変更、障害に関する日次更新
  </Card>

  <Card title="お知らせ" icon="megaphone" href="/en/changelog">
    新モデルのリリース、価格変更、機能更新
  </Card>
</CardGroup>

まだうまくいきませんか？ 直接お問い合わせください：

* 📧 **Email**: [support@apiyi.com](mailto:support@apiyi.com)
* 🌐 **コンソール**: [api.apiyi.com](https://api.apiyi.com)
* 💰 **料金**: [料金ページ](https://api.apiyi.com/account/pricing)

<Note>
  ご質問がここに含まれていない場合は、サポートまでお送りください。ご提案を確認し、FAQ に追加します。新規ユーザーには無料トライアルのクレジットが付与されるため、チャージ前に統合を検証できます。
</Note>
