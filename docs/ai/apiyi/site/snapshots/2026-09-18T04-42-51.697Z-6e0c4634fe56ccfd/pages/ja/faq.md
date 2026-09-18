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

実際に発生している状況に一致する行を見つけてください。1つの症状が複数のトピックにまたがることも多いため、この表では観測可能な挙動ごとにトラブルシューティング記事を再整理しています。

| 発生している状況                                  | 考えられる原因                                          | 確認する場所                                                                                                          |
| ----------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| API Key が無効 / 401                         | Base URL と KEY が一致していない、または KEY の入力ミス            | [無効な API Key](/ja/faq/invalid-api-key) · [Base URL 設定](/ja/faq/base-url-config)                                 |
| エラーメッセージが不明確で、どこから始めればよいかわからない            | エラータイプを順番に確認する                                   | [モデル API エラーのトラブルシューティング](/ja/faq/model-error-troubleshooting)                                                  |
| 残高はあるがリクエストが失敗する                          | 事前控除の仕組み、または max\_tokens の設定値が高すぎる               | [残高不足](/ja/faq/balance-insufficient) · [事前控除](/ja/faq/pre-deduction-quota)                                      |
| リクエストがタイムアウトする、またはストリーミング途中で切断される         | クライアントのタイムアウトが短すぎる。推論モデルは低速                      | [API タイムアウトの回避](/ja/faq/timeout-configuration)                                                                  |
| ログでは成功して課金されているが、クライアントには何も届かない           | ログの所要時間はゲートウェイの完了時点で終了する。問題はダウンストリームまたは完了シグナルにある | [ログは完了しているがレスポンスがない](/ja/faq/log-duration-vs-client-wait)                                                       |
| Webサイト / API が 502 を返す                    | サービスコンテナが短時間自動再起動している。約1分で復旧                     | [502 への対処](/ja/faq/website-502-error)                                                                           |
| スクリプトで空のボディを伴う断続的な 502 が発生し、ログにも何もない      | ローカルプロキシソフトウェア（Clash / v2rayN）が生成した空の 502        | [プロキシ生成の空の 502](/ja/faq/proxy-empty-502)                                                                        |
| Python で SSLEOFError が発生するが curl は動作する    | OpenSSL 3.5+ の耐量子ハンドシェイクが中間機器によって遮断される           | [SSLEOFError のトラブルシューティング](/ja/faq/openssl-pq-handshake-eof)                                                    |
| 429 同時実行数エラー                              | 同時実行数クォータに到達                                     | [API 同時実行数制限](/ja/faq/api-concurrency)                                                                          |
| 出力が文の途中で切れる                               | max\_tokens が未設定、または小さすぎる                        | [max\_tokens とは](/ja/faq/max-tokens)                                                                            |
| 特定のモデルが実行できない                             | アカウント権限がロックされている、または token モデルホワイトリストの問題         | [一部のモデルを使えない理由](/ja/faq/model-availability) · [Token モデルホワイトリスト](/ja/faq/token-model-whitelist)                 |
| 画像生成が失敗する / 空の結果を返す                       | Google のコンテンツ安全性チェックが作動                          | [Nano Banana の失敗](/ja/faq/nano-banana-image-failure)                                                            |
| Gemini 画像 API が NO\_IMAGE を返す             | 安全性ブロックとは異なる原因                                   | [NO\_IMAGE になる理由](/ja/faq/gemini-no-image)                                                                      |
| 出力が参照画像と大きく異なる                            | 参照画像は base64 としてアップロードする必要がある                    | [画像が参照画像と異なる](/ja/faq/image-result-differs-from-reference)                                                      |
| does not match MIME type でアップロードに失敗する     | 画像 URL に CDN の処理パラメータが含まれている                     | [MIME type の不一致](/ja/faq/image-mime-type-mismatch-with-query)                                                   |
| 白背景の画像に黒い点が表示される                          | AI Studio 経路で確認されている挙動                           | [白背景のアーティファクト](/ja/faq/white-background-image-artifacts)                                                        |
| タスク ID で画像結果をポーリングしたい                     | 画像生成は同期処理のみ                                      | [非同期画像 API はあるか](/ja/faq/image-async-api)                                                                       |
| 画像の課金額が想定より大幅に高い                          | 解像度、品質、アスペクト比、枚数に応じて出力 tokens が増加する              | [GPT Image の出力 tokens が多い理由](/ja/faq/gpt-image-output-token-calculation)                                        |
| Seedance が顔の参照画像をブロックする                   | 実在する顔にはアセットのアップロードと本人確認が必要                       | [顔アセットがブロックされる理由](/ja/faq/seedance2-face-asset-whitelist)                                                       |
| モデルが別ベンダーのものだと主張する / 自身のバージョンを示せない        | モデル自身の知識は信頼できない                                  | [Claude が Qwen だと主張する](/ja/faq/claude-identity-confusion) · [モデルは自身のバージョンを知らない](/ja/faq/model-version-identity) |
| Web アプリは賢いが API は賢くない                     | Web アプリにはシステム prompt とツールが含まれるが、API は素のモデル       | [Web アプリと API](/ja/faq/webapp-vs-api-difference)                                                                |
| 自分の KEY で見覚えのない呼び出しがある                    | KEY が漏洩している可能性がある。追跡して無効化する                      | [想定外の KEY 使用を調査する](/ja/faq/troubleshoot-key-usage) · [KEY を安全に管理する](/ja/faq/key-security-management)            |
| 課金額が合わない                                  | 使用量ごとの課金と呼び出しごとの課金では見え方が異なる                      | [ログで課金を確認する](/ja/faq/log-billing-explained) · [モデル倍率](/ja/faq/model-multiplier)                                 |
| 画像または動画のダウンロードが遅い                         | 特定サーバーでの海外 CDN ルーティング                            | [CDN のダウンロードが遅い](/ja/faq/cdn-download-slow)                                                                     |
| プロキシは必要か？                                 | 直接接続で動作するため、プロキシは不要                              | [プロキシは必要か](/ja/faq/network-proxy)                                                                               |
| GitHub ログインで「Account already bound」と表示される | その GitHub アカウントは別のメールアドレスに紐付いている                 | [GitHub 紐付けエラー](/ja/faq/github-bindng-bindng-error)                                                             |
| パスワードを忘れた                                 | メールでリセットするか、サポートに問い合わせる                          | [パスワードを忘れた場合](/ja/faq/forgot-password)                                                                          |

***

## 📚 トピック別に見る

### 🧭 サイト機能（4）

| 質問                                                                             | 一行回答                                       |
| ------------------------------------------------------------------------------ | ------------------------------------------ |
| [Tokens とグループ](/ja/faq/token-and-groups)                                       | KEY の作成方法とグループの選択方法                        |
| [グループとは？ユーザーグループと Token グループの違いを解説](/ja/faq/groups-explained)                  | 実際に適用されるのは token で選択したグループです               |
| [Codex、Claude Code、Default グループの違いは？](/ja/faq/codex-claudecode-default-groups) | 提供元とプロトコルが異なります。本番環境では Default 公式リレーを推奨します |
| [APIYI がワンクリック統合を提供しない理由は？](/ja/faq/one-click-integration)                     | 統合方法はモデルごとに異なります。代わりに AI アシスタントを使用してください   |

### 🔑 Tokens とログ (11)

| 質問                                                                      | 一行回答                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------- |
| [KEY を作成するには？](/ja/faq/token-management)                                | デフォルトの token を取得するか、コンソールで新しい token を作成します            |
| [Tokens に利用可能なモデルを設定する必要はありますか？](/ja/faq/token-model-whitelist)         | 任意ですが、プロジェクトを分離する場合は推奨されます                            |
| [API Keys を安全に管理するには？](/ja/faq/key-security-management)                 | IP ホワイトリスト、モデルホワイトリスト、および日常的な運用習慣                     |
| [Token の課金モードの違いは何ですか？](/ja/faq/token-billing-modes)                    | 5 つの課金モードと、それぞれに適した用途                                 |
| [呼び出し履歴を確認するには？](/ja/faq/call-logs)                                     | コンソールのログページで呼び出しと課金の詳細を確認します                          |
| [リクエスト ID はどこで確認できますか？](/ja/faq/request-id-troubleshooting)             | API タイプに応じてレスポンスヘッダーまたは本文を確認してください。タスク ID と混同しないでください |
| [ログ内の課金額はどのように確認しますか？](/ja/faq/log-billing-explained)                   | 使用量ごとか呼び出しごとか、および使用量からコストを計算する方法                      |
| [呼び出しログはどのくらい保持され、いつ削除されますか？](/ja/faq/log-retention-policy)             | 当月と過去 2 か月分が保持され、5 日に削除されます                           |
| [ログのタイムゾーン設定とデータエクスポートについて知っておくべきことは？](/ja/faq/log-timezone-and-export) | アカウントのタイムゾーンは UTC+0 のままにしてください。エクスポートは常に UTC+0 です     |
| [トラブルシューティングのためにバックエンドで詳細ログを確認できますか？](/ja/faq/user-logs-control)        | 管理者は詳細ログを一時的に有効化できます                                  |
| [予期しない API Key の使用を調査するには？](/ja/faq/troubleshoot-key-usage)             | ログで実際の IP を追跡し、KEY を無効化します                            |

### 🏢 エンタープライズサービス (9)

| 質問                                                                                     | 一行回答                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------ |
| [エンタープライズグループとは？どのような場合に利用すべきですか？](/ja/faq/enterprise-group-vertex-fallback)           | モデル固有のグループで、供給がより安定し、レート倍率が高めです      |
| [画像生成向けに、より高速またはエンタープライズ向けのルートはありますか？](/ja/faq/image-generation-fast-enterprise-route) | 優先レーンはありません。時間はモデル推論そのものにかかります       |
| [APIYIのエンタープライズサービスは信頼できますか？モデルは正規のものですか？](/ja/faq/enterprise-trust)                   | 透明性の高い公式リレーです。迂回転送やモデルの差し替えはありません    |
| [エンタープライズユーザーと個人ユーザーの違いは何ですか？](/ja/faq/enterprise-vs-individual)                       | アカウント種別は同じで、違いはサポートと価格にあります          |
| [エンタープライズ顧客はどのようにチャージしますか？](/ja/faq/enterprise-recharge)                               | 銀行振込を推奨しており、基本契約およびVAT請求書をご利用いただけます  |
| [大学の顧客はどのように安心して精算できますか？](/ja/faq/university-reimbursement)                            | 請求書、購入リスト、押印済み書類を提供します               |
| [APIYIはSLA保証を提供していますか？](/ja/faq/sla-guarantee)                                         | はい。課金異常に対する補償やクレジットの補充を含みます          |
| [Agentミニプログラムにはアルゴリズム届出が必要ですか？](/ja/faq/agent-miniapp-algorithm-filing)                | 通常は必要です。ここでは一般的なプロセスを説明します           |
| [海外モデルを使用する中国向け製品のコンプライアンスにはどう対応すればよいですか？](/ja/faq/overseas-model-compliance)          | ライセンスの階層、モデルの届出状況、コンテンツモデレーションを確認します |

### 💰 課金とセキュリティ (17)

| 質問                                                                            | 一行回答                                                 |
| ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| [料金は公式料金と同じ — なぜ APIYI から購入するのですか？](/ja/faq/official-pricing-advantages)      | 同一価格に加えてチャージボーナスがあり、グループ割引と併用できます                    |
| [APIYI はなぜ公式料金より安く提供できるのですか？](/ja/faq/why-cheaper-than-official)              | 大量購入とベンダー配信によるものであり、モデルの品質を落としているわけではありません           |
| [モデルの「倍率」とは何を意味しますか？](/ja/faq/model-multiplier)                               | RMB 単位です。USD 相当額には固定レートを適用します                        |
| [100 RMB でどれくらいのコンピューティング能力を利用できますか？](/ja/faq/rmb-to-computing-power)         | チャージには固定の 1 USD = 7 RMB レートを使用します。比率はご利用のシステムで設定されます |
| [APIYI はキャッシュ課金をサポートしていますか？](/ja/faq/cache-billing)                           | すべての主要ルートでサポートしており、ヒット率はベンダーによって異なります                |
| [API 呼び出しの事前控除メカニズムとは何ですか？](/ja/faq/pre-deduction-quota)                      | 事前に推定額を控除し、実際の使用量に基づいて精算します                          |
| [残高があるのにリクエストを実行できないのはなぜですか？](/ja/faq/balance-insufficient)                   | 事前控除チェック、または max\_tokens の設定値が高すぎる可能性があります           |
| [残高アラートを設定するにはどうすればよいですか？](/ja/faq/balance-alerts)                            | メール、グループボット、または残高アラート API を利用できます                    |
| [APIYI の残高に有効期限はありますか？有効期間はどれくらいですか？](/ja/faq/balance-validity-period)        | 365 日です。新たにチャージすると残高全体の有効期限がリセットされます                 |
| [APIYI はどのような支払い方法をサポートしていますか？](/ja/faq/payment-methods)                      | WeChat、Alipay、USDT、Stripe、PayPal などに対応しています          |
| [請求書の金額が \$100 未満の場合はどうすればよいですか？](/ja/faq/invoice-minimum-amount)             | 少額の注文を合算し、\$100 に達するまでお待ちください                        |
| [請求書の記載内容を間違えました。請求書を再発行できますか？](/ja/faq/invoice-reissue)                      | 取消および再発行のため、元の情報と正しい情報を提出してください                      |
| [利用可能なチャージキャンペーンには何がありますか？](/ja/faq/recharge-promotions)                      | 初回および段階的なボーナスに加え、請求書発行も利用できます                        |
| [代理店パートナーシップに申し込むにはどうすればよいですか？友人を招待してリベートを獲得できますか？](/ja/faq/referral-program) | 紹介リベートはデフォルトで有効になっており、申請は不要です                        |
| [APIYI の返金ポリシーとは何ですか？](/ja/faq/refund-policy)                                 | 条件、手続き、手数料、および請求書に関する注意事項です                          |
| [コンテンツの安全性とコンプライアンスはどのように確保されていますか？](/ja/faq/content-safety)                  | モデレーションメカニズムと違反時の対応を行います                             |
| [APIYI はどのようにデータセキュリティを確保していますか？](/ja/faq/data-security)                      | 暗号化通信、最小限の保存、アクセス制御を実施しています                          |

### ⚙️ モデル & API (31)

**モデルの選択と一般的な動作**

| 質問                                                                                 | 一行回答                                 |
| ---------------------------------------------------------------------------------- | ------------------------------------ |
| [適切なAIモデルを選ぶ方法は？](/ja/faq/model-selection-guide)                                   | ユースケース、コスト、速度で選択します                  |
| [一部のモデルを使用できないのはなぜですか？](/ja/faq/model-availability)                                | 一部のモデルは、先に権限を解除する必要があります             |
| [テキストと生成画像の両方を出力する会話型APIはありますか？](/ja/faq/text-and-image-in-one-api)                | 画像の読み取りと作成は異なります。画像への経路は4つあります       |
| [GoogleモデルはAI StudioとVertexのどちらで実行されますか？](/ja/faq/google-upstream-aistudio-vertex) | デフォルトグループは公式AI Studio経路を使用します        |
| [モデル名の-cサフィックスは何を意味しますか？](/ja/faq/model-name-suffix-c)                             | 異なる課金の別経路を示します                       |
| [公式WebアプリとAPIで結果が異なるのはなぜですか？](/ja/faq/webapp-vs-api-difference)                    | Webアプリはシステムpromptを追加しますが、APIは素のモデルです |
| [APIにはChatGPTのようなメモリがありますか？](/ja/faq/api-memory)                                   | ありません。メモリはクライアントが読み書きするローカルファイルです    |
| [AIモデルが自分自身のバージョンを知らないのはなぜですか？](/ja/faq/model-version-identity)                    | モデルの自己認識は信頼できません                     |
| [ClaudeがQwenやDeepSeekだと主張するのはなぜですか？](/ja/faq/claude-identity-confusion)            | モデルの入れ替わりではなく、アイデンティティのハルシネーションです    |

**統合とパラメータ**

| 質問                                                                                                       | 一行回答                                |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [Base URLの設定方法：/v1、ルートドメイン、/v1betaの違い](/ja/faq/base-url-config)                                          | OpenAI、Claude、Geminiそれぞれに1つの形式があります |
| [ストリーミング呼び出しと非ストリーミング呼び出しの違いは何ですか？](/ja/faq/streaming-vs-non-streaming)                                  | `stream`フラグで決まり、内容と課金は同一です          |
| [max\_tokensとは何ですか？設定しない場合はどうなりますか？](/ja/faq/max-tokens)                                                 | 出力長を制限します。未設定時にはデフォルト値があります         |
| [APIの同時実行数制限とは何ですか？](/ja/faq/api-concurrency)                                                            | 制限はモデルタイプによって異なり、引き上げ可能です           |
| [APIタイムアウトを回避するにはどうすればよいですか？](/ja/faq/timeout-configuration)                                             | クライアントのタイムアウトを延長してください。推論モデルは低速です   |
| [モデルAPIエラーをトラブルシューティングするにはどうすればよいですか？](/ja/faq/model-error-troubleshooting)                              | パラメータ、認証、429、5xx、タイムアウトの順に確認します     |
| [ログでは呼び出し完了・課金済みと表示されているのに、クライアントが応答を受信しません。どうトラブルシューティングすればよいですか？](/ja/faq/log-duration-vs-client-wait) | 2つの時計は異なる時間枠を測定します。まず差分を測定してください    |

**画像生成**

| 質問                                                                                                         | 一行回答                                                             |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [Nano Bananaの画像生成が失敗する一般的な原因](/ja/faq/nano-banana-image-failure)                                           | 通常はGoogleのコンテンツ安全性がトリガーされています                                    |
| [Gemini画像APIがNO\_IMAGEを返すのはなぜですか？](/ja/faq/gemini-no-image)                                                | 安全性ブロックとは別の原因です。分けてトラブルシューティングしてください                             |
| [白背景の画像に黒い斑点、汚れたパッチ、ぼやけたカラーブロックが表示されるのはなぜですか？](/ja/faq/white-background-image-artifacts)                   | 純白ではなく明るい背景をpromptで指定してください                                      |
| [banana proで編集後に画像が赤みがかるのはなぜですか？](/ja/faq/banana-pro-edit-red-cast)                                        | Vertex経路に切り替えるか、`gpt-image-2`を使用してください                           |
| [Nano Banana Proで衣装を変更した際の歪んだプリントを修正するにはどうすればよいですか？](/ja/faq/nano-banana-pro-print-distortion)             | promptの文言、参照の重み付け、経路間フォールバックを確認してください                            |
| [生成された画像が参照画像と大きく異なるのはなぜですか？](/ja/faq/image-result-differs-from-reference)                                 | 参照画像はbase64エンコードする必要があります                                        |
| [透明背景の画像（PNG切り抜き）を生成するにはどうすればよいですか？](/ja/faq/image-transparent-background)                                 | 実際のアルファチャンネルを得るには、`gpt-image-2`に`background: "transparent"`を渡します |
| [image content does not match MIME typeエラーを修正するにはどうすればよいですか？](/ja/faq/image-mime-type-mismatch-with-query) | 画像URLからCDN処理パラメータを削除してください                                       |
| [GPT Imageの出力tokensが非常に多いのはなぜですか？](/ja/faq/gpt-image-output-token-calculation)                             | 解像度、品質、アスペクト比、枚数のすべてが出力tokensを増加させます                             |
| [不正なAPIキーによりCodex Integration for GPT-Imageが失敗する](/ja/faq/gpt-image-incorrect-api-key-openai)              | エラーはOpenAIから発生しており、リクエストはAPIYIに到達していません                          |
| [非同期画像APIはありますか？タスクIDで結果を照会できますか？](/ja/faq/image-async-api)                                                | 同期のみです。タスクIDの照会はできません                                            |

**動画生成**

| 質問                                                                                  | 一行回答                                    |
| ----------------------------------------------------------------------------------- | --------------------------------------- |
| [送信後にSeedance動画タスクをキャンセルできますか？](/ja/faq/seedance-video-task-cancel)                 | キャンセルエンドポイントはありません。再送信しないことに注力してください    |
| [task\_idでSeedance動画の実際のコストを確認するにはどうすればよいですか？](/ja/faq/seedance-task-cost-lookup)   | 2つの課金行をタスククォータと照合します                    |
| [Seedance 2.0は顔の参照をアセットライブラリへ自動アップロードしますか？](/ja/faq/seedance2-asset-face-reference) | いいえ。先にアップロードしてから、`asset://` IDを参照してください |
| [Seedance 2.0 / 2.5が顔アセットをブロックするのはなぜですか？](/ja/faq/seedance2-face-asset-whitelist)   | 実在する顔には、アセットのアップロードと本人確認が必要です           |

### 🌐 ネットワークと接続 (7)

| 質問                                                                            | 一行回答                                               |
| ----------------------------------------------------------------------------- | -------------------------------------------------- |
| [API を使用するのにプロキシは必要ですか？](/ja/faq/network-proxy)                               | 直接接続で動作します。プロキシや VPN は不要です                         |
| [Python では SSLEOFError が発生するが curl では動作する？](/ja/faq/openssl-pq-handshake-eof) | OpenSSL 3.5+ の耐量子ハンドシェイクが中間機器によって遮断されます            |
| [APIYI のサーバーはどこにありますか？どのサーバーを選ぶべきですか？](/ja/faq/server-location)               | ノードの所在地、レイテンシーテスト、購入に関するアドバイス                      |
| [CDN の画像・動画ダウンロードが遅い場合はどうすればよいですか？](/ja/faq/cdn-download-slow)                | 特定サーバーにおける海外 CDN ルーティングの診断                         |
| [画像 API のレイテンシーを削減するには？](/ja/faq/image-api-network-latency-optimization)      | 接続の再利用、HTTP/1.1、タイムアウト設定                           |
| [ウェブサイトまたは API が 502 を返す場合はどうすればよいですか？](/ja/faq/website-502-error)            | 一時的なコンテナの自動再起動です。約 1 分で復旧し、課金されません。30 秒後に再試行してください |
| [スクリプトで 502 が発生するが呼び出しログには何もない？](/ja/faq/proxy-empty-502)                     | ローカルプロキシからの空の 502 です。スクリプトでシステムプロキシをバイパスしてください     |

### 👤 アカウントとログイン (6)

| 質問                                                                           | 一行回答                              |
| ---------------------------------------------------------------------------- | --------------------------------- |
| [APIYIは登録にどのメールプロバイダーをサポートしていますか？](/ja/faq/email-registration)               | Gmail、Outlook、Foxmail、大学のメールアドレス  |
| [Passkeyでサインインするにはどうすればよいですか？](/ja/faq/passkey-login)                        | 一度紐付ければ、指紋または顔認証でロック解除できます        |
| [GitHubログインで「アカウントはすでに紐付けられています」と表示される？](/ja/faq/github-bindng-bindng-error) | そのGitHubアカウントは別のメールアドレスに紐付けられています |
| [パスワードを忘れた場合はどうすればよいですか？](/ja/faq/forgot-password)                           | メールでリセットするか、サポートにお問い合わせください       |
| [API Keyが無効なのはなぜですか？](/ja/faq/invalid-api-key)                               | Base URLとKEYの不一致が一般的な原因です         |
| [アカウントを削除するにはどうすればよいですか？](/ja/faq/account-deletion)                          | ワンクリックで削除でき、データは復元できません           |

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
