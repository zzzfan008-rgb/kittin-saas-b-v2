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

## 🔧 症状別のトラブルシューティング

実際に発生している現象に一致する行をご確認ください。ひとつの症状が複数のトピックに関連している場合も多いため、この表では確認できる挙動ごとにトラブルシューティング記事を整理しています。

| 発生している現象 | 考えられる原因 | 確認先 |
| - | - | - |
| API Keyが無効 / 401 | Base URLとKEYが一致していない、またはKEYの入力ミス | [無効なAPI Key](/ja/faq/invalid-api-key) · [Base URL設定](/ja/faq/base-url-config) |
| 残高、ログ、またはトークン管理APIが401 `ACCESS_TOKEN_LEGACY_RETIRED`または403 `ACCESS_TOKEN_SCOPE_DENIED`を返す | レガシーシステムトークンが廃止されたか、パーソナルアクセストークンに必要な権限がない | [パーソナルアクセストークン](/ja/faq/personal-access-token) |
| エラーメッセージが不明瞭で、どこから手をつければいいかわからない | エラーの種類を順に確認してください | [モデルAPIエラーのトラブルシューティング](/ja/faq/model-error-troubleshooting) |
| 残高があるのにリクエストが失敗する | 事前引き落としの仕組み、またはmax\_tokensの設定値が高すぎる | [残高不足](/ja/faq/balance-insufficient) · [事前引き落とし](/ja/faq/pre-deduction-quota) |
| リクエストがタイムアウトする、またはストリーミング途中で切断される | クライアント側のタイムアウトが短すぎる。推論モデルは応答に時間がかかります | [APIタイムアウトの回避方法](/ja/faq/timeout-configuration) |
| ログ上は成功および課金済みとなっているが、クライアント側に何も届かない | ログの所要時間はゲートウェイの処理終了時点で停止します。遅延・切断は下流または終了シグナルで発生しています | [ログ完了後にレスポンスがない場合](/ja/faq/log-duration-vs-client-wait) |
| ウェブサイト / APIが502を返す | サービスコンテナが一時的に自動再起動中。約1分で復帰します | [502発生時の対処法](/ja/faq/website-502-error) |
| スクリプトで断続的にボディが空の502が発生し、ログに何も残らない | ローカルプロキシソフトウェア（Clash / v2rayN）によって生成された空の502 | [プロキシ起因の空の502](/ja/faq/proxy-empty-502) |
| VPN経由での画像呼び出しが90〜180秒後にまとめて切断されるが、課金は行われている | ローカルプロキシが、データ通信のない接続を長時間放置して切断している | [プロキシのアイドル切断](/ja/faq/proxy-idle-timeout-disconnect) |
| PythonでSSLEOFErrorが発生するが、curlでは動作する | OpenSSL 3.5+の耐量子ハンドシェイクがミドルボックスによって切断されている | [SSLEOFErrorのトラブルシューティング](/ja/faq/openssl-pq-handshake-eof) |
| 429 同時実行数エラー | 同時実行数クォータに達した | [API同時実行数制限](/ja/faq/api-concurrency) |
| 出力が文の途中で途切れる | max\_tokensが未設定、または小さすぎる | [max\_tokensとは](/ja/faq/max-tokens) |
| 200が返されるが内容が拒否（refusal）であり、JSONパースに失敗する | GPTモデルはポリシー違反のコンテンツをエラーやカテゴリを伴わずに拒否します | [OpenAIの拒否（refusal）の挙動](/ja/faq/openai-content-safety-refusal) |
| Claudeが空のコンテンツで200を返し、`content[0]`がエラーをスローする | プロバイダーの安全ポリシーに抵触しました。`stop_reason`は`refusal`です | [Claudeの拒否が空コンテンツを返す理由](/ja/faq/claude-content-safety-refusal) |
| Claude Code / Claude Agentが429 `Invalid signature in thinking block`を報告し、10回のリトライがすべて失敗する | レート制限ではなく、履歴内のthinkingブロックの署名が失われています | [Claude無効なthinking署名](/ja/faq/claude-thinking-signature-invalid) |
| 特定のモデルが動作しない | アカウント権限のロック、またはトークンのモデルホワイトリスト | [一部のモデルが使用できない理由](/ja/faq/model-availability) · [トークンモデルホワイトリスト](/ja/faq/token-model-whitelist) |
| 画像生成が失敗する / 空で返される | Googleのコンテンツ安全機能がトリガーされました | [Nano Bananaの失敗](/ja/faq/nano-banana-image-failure) |
| Gemini画像APIがNO\_IMAGEを返す | 安全ブロックとは異なる原因です | [NO\_IMAGEが返される理由](/ja/faq/gemini-no-image) |
| Gemini画像が候補なしで数秒以内にblockReason: OTHERを返す | 生成前に入力がブロックされました（通常は1つの参照画像が原因） | [blockReason: OTHERのトラブルシューティング](/ja/faq/gemini-image-input-blocked) |
| Gemini画像が時々IMAGE\_OTHERを返す | 画像は生成されましたが出力時にフィルタリングされました（実在の人物名がプロンプトに含まれている場合が多いです） | [IMAGE\_OTHERのトラブルシューティング](/ja/faq/gemini-image-other) |
| 出力が参照画像と大きく異なる | 参照画像はbase64としてアップロードする必要があります | [画像が参照画像と異なる場合](/ja/faq/image-result-differs-from-reference) |
| アップロードがdoes not match MIME typeで失敗する | 画像URLにCDN処理パラメータが含まれています | [MIMEタイプの不一致](/ja/faq/image-mime-type-mismatch-with-query) |
| 白背景の画像に黒い斑点が表示される | AI Studioルートにおける既知の挙動です | [白背景のアーティファクト](/ja/faq/white-background-image-artifacts) |
| タスクIDで画像結果をポーリングしたい | 画像生成は同期処理のみ対応しています | [非同期画像APIはありますか](/ja/faq/image-async-api) |
| 画像の請求額が予想よりはるかに高い | 解像度、品質、アスペクト比、枚数によって出力tokensが増加します | [GPT画像の出力tokensが多い理由](/ja/faq/gpt-image-output-token-calculation) |
| Seedanceが顔の参照画像をブロックする | 実在の顔にはアセットのアップロードと本人確認が必要です | [顔アセットがブロックされる理由](/ja/faq/seedance2-face-asset-whitelist) |
| Seedanceの画像リンクがブラウザでは開けるが、送信するとinvalid image formatで失敗する | リンクがRangeリクエストを拒否している、ダウンロード制限がある、または有効期限が早すぎるため、プロバイダーが取得できません | [画像リンクは開けるのに失敗する場合](/ja/faq/seedance-image-url-invalid-format) |
| 比率と再生時間を設定しているにもかかわらず、Seedance 2.5が400 `TaskTypeConstraint`を返す | タスクが動画編集として認識されました。`ratio`は`adaptive`、`duration`は`-1`である必要があります | [参照画像からの動画生成と動画編集の違い](/ja/faq/seedance2-reference-vs-edit) |
| 先頭フレームモードでないのにSeedanceが`first/last frame content cannot be mixed with reference media content`を返す | 画像に`role`がなく先頭フレームとして扱われています。ネイティブエンドポイントを使用し、`reference_image`を明示的に設定してください | [先頭フレームと参照画像の混同](/ja/faq/seedance-first-frame-mixed-with-reference) |
| モデルが別のベンダーを名乗る / 自身のバージョンを答えられない | モデルの自己認識情報は信頼性が低いです | [ClaudeがQwenを名乗る](/ja/faq/claude-identity-confusion) · [モデルが自身のバージョンを把握していない](/ja/faq/model-version-identity) |
| Webアプリは賢いが、APIは賢くない | Webアプリにはシステムプロンプトやツール機能が組み込まれています。APIは素のモデルです | [WebアプリとAPIの違い](/ja/faq/webapp-vs-api-difference) |
| 心当たりのないKEYの呼び出しがある | KEYが漏洩している可能性があります。追跡して無効化してください | [予期しないKEY使用の調査](/ja/faq/troubleshoot-key-usage) · [安全なキー管理](/ja/faq/key-security-management) |
| 課金計算が合わない | 使用量ベースの課金と呼び出しごとの課金で見え方が異なります | [ログでの課金確認](/ja/faq/log-billing-explained) · [モデル倍率](/ja/faq/model-multiplier) |
| 画像や動画のダウンロードが遅い、またはRead timed outが発生する | 生成自体は成功しています。セルフチェックを行って結果をお送りください | [CDNダウンロードの遅延またはタイムアウト](/ja/faq/cdn-download-slow) |
| プロキシは必要ですか？ | 直接接続に対応しており、プロキシは不要です | [プロキシは必要ですか](/ja/faq/network-proxy) |
| GitHubログインで「Account already bound」と表示される | そのGitHubアカウントは別のメールアドレスに連携されています | [GitHub連携エラー](/ja/faq/github-bindng-bindng-error) |
| パスワードをお忘れの場合 | メールで再設定するか、サポートにお問い合わせください | [パスワードを忘れた場合](/ja/faq/forgot-password) |

***

## 📚 トピック別に見る

### 🧭 サイト機能（4）

| 質問 | 一行回答 |
| - | - |
| [Tokens とグループ](/ja/faq/token-and-groups) | KEY の作成方法とグループの選択方法 |
| [グループとは？ユーザーグループと Token グループの違いを解説](/ja/faq/groups-explained) | 実際に適用されるのは token で選択したグループです |
| [Codex、Claude Code、Default グループの違いは？](/ja/faq/codex-claudecode-default-groups) | 提供元とプロトコルが異なります。本番環境では Default 公式リレーを推奨します |
| [APIYI がワンクリック統合を提供しない理由は？](/ja/faq/one-click-integration) | 統合方法はモデルごとに異なります。代わりに AI アシスタントを使用してください |

### 🔑 Tokensとログ (12)

| 質問 | 一行回答 |
| - | - |
| [KEYの作成方法は？](/ja/faq/token-management) | コンソールでデフォルトのtokenを取得するか、新しいtokenを作成します |
| [tokensに利用可能なモデルを設定する必要はありますか？](/ja/faq/token-model-whitelist) | 任意ですが、プロジェクトを分離する場合に推奨されます |
| [API Keyを安全に管理するにはどうすればよいですか？](/ja/faq/key-security-management) | IPホワイトリスト、モデルホワイトリスト、および日常的なセキュリティ習慣です |
| [Personal Access Tokenとは何ですか？また、システムtokenを置き換えるにはどうすればよいですか？](/ja/faq/personal-access-token) | 管理用API向けの新しい認証情報です。システムtokenは11月11日に廃止されます |
| [tokenの課金モードの違いは何ですか？](/ja/faq/token-billing-modes) | 5つの課金モードとそれぞれの適切な使い分けについて説明します |
| [呼び出し履歴を確認するにはどうすればよいですか？](/ja/faq/call-logs) | コンソールのログページで呼び出しと課金の詳細を確認できます |
| [Request IDはどこで確認できますか？](/ja/faq/request-id-troubleshooting) | APIのタイプに応じてレスポンスヘッダーまたはボディを確認してください。タスクIDと混同しないようご注意ください |
| [ログの課金金額はどのように確認すればよいですか？](/ja/faq/log-billing-explained) | 使用量課金と呼び出し回数課金の違い、および使用量からのコスト計算方法について説明します |
| [呼び出しログの保存期間とクリアされるタイミングは？](/ja/faq/log-retention-policy) | 当月と過去2か月間です。毎月5日にクリアされます |
| [ログのタイムゾーン設定とデータエクスポートに関する注意事項は？](/ja/faq/log-timezone-and-export) | アカウントのタイムゾーンはUTC+0に維持してください。エクスポートデータは常にUTC+0になります |
| [トラブルシューティングのためにバックエンドで詳細なログを確認できますか？](/ja/faq/user-logs-control) | 管理者は詳細ログを一時的に有効化できます |
| [API Keyの予期しない使用を調査するにはどうすればよいですか？](/ja/faq/troubleshoot-key-usage) | ログから実際のIPを追跡し、KEYを無効化します |

### 🏢 エンタープライズサービス (9)

| 質問 | 一行回答 |
| - | - |
| [エンタープライズグループとは？どのような場合に利用すべきですか？](/ja/faq/enterprise-group-vertex-fallback) | モデル固有のグループで、供給がより安定し、レート倍率が高めです |
| [画像生成向けに、より高速またはエンタープライズ向けのルートはありますか？](/ja/faq/image-generation-fast-enterprise-route) | 優先レーンはありません。時間はモデル推論そのものにかかります |
| [APIYIのエンタープライズサービスは信頼できますか？モデルは正規のものですか？](/ja/faq/enterprise-trust) | 透明性の高い公式リレーです。迂回転送やモデルの差し替えはありません |
| [エンタープライズユーザーと個人ユーザーの違いは何ですか？](/ja/faq/enterprise-vs-individual) | アカウント種別は同じで、違いはサポートと価格にあります |
| [エンタープライズ顧客はどのようにチャージしますか？](/ja/faq/enterprise-recharge) | 銀行振込を推奨しており、基本契約およびVAT請求書をご利用いただけます |
| [大学の顧客はどのように安心して精算できますか？](/ja/faq/university-reimbursement) | 請求書、購入リスト、押印済み書類を提供します |
| [APIYIはSLA保証を提供していますか？](/ja/faq/sla-guarantee) | はい。課金異常に対する補償やクレジットの補充を含みます |
| [Agentミニプログラムにはアルゴリズム届出が必要ですか？](/ja/faq/agent-miniapp-algorithm-filing) | 通常は必要です。ここでは一般的なプロセスを説明します |
| [海外モデルを使用する中国向け製品のコンプライアンスにはどう対応すればよいですか？](/ja/faq/overseas-model-compliance) | ライセンスの階層、モデルの届出状況、コンテンツモデレーションを確認します |

### 💰 課金とセキュリティ (17)

| 質問 | 一行回答 |
| - | - |
| [料金は公式料金と同じ — なぜ APIYI から購入するのですか？](/ja/faq/official-pricing-advantages) | 同一価格に加えてチャージボーナスがあり、グループ割引と併用できます |
| [APIYI はなぜ公式料金より安く提供できるのですか？](/ja/faq/why-cheaper-than-official) | 大量購入とベンダー配信によるものであり、モデルの品質を落としているわけではありません |
| [モデルの「倍率」とは何を意味しますか？](/ja/faq/model-multiplier) | RMB 単位です。USD 相当額には固定レートを適用します |
| [100 RMB でどれくらいのコンピューティング能力を利用できますか？](/ja/faq/rmb-to-computing-power) | チャージには固定の 1 USD = 7 RMB レートを使用します。比率はご利用のシステムで設定されます |
| [APIYI はキャッシュ課金をサポートしていますか？](/ja/faq/cache-billing) | すべての主要ルートでサポートしており、ヒット率はベンダーによって異なります |
| [API 呼び出しの事前控除メカニズムとは何ですか？](/ja/faq/pre-deduction-quota) | 事前に推定額を控除し、実際の使用量に基づいて精算します |
| [残高があるのにリクエストを実行できないのはなぜですか？](/ja/faq/balance-insufficient) | 事前控除チェック、または max\_tokens の設定値が高すぎる可能性があります |
| [残高アラートを設定するにはどうすればよいですか？](/ja/faq/balance-alerts) | メール、グループボット、または残高アラート API を利用できます |
| [APIYI の残高に有効期限はありますか？有効期間はどれくらいですか？](/ja/faq/balance-validity-period) | 365 日です。新たにチャージすると残高全体の有効期限がリセットされます |
| [APIYI はどのような支払い方法をサポートしていますか？](/ja/faq/payment-methods) | WeChat、Alipay、USDT、Stripe、PayPal などに対応しています |
| [請求書の金額が \$100 未満の場合はどうすればよいですか？](/ja/faq/invoice-minimum-amount) | 少額の注文を合算し、\$100 に達するまでお待ちください |
| [請求書の記載内容を間違えました。請求書を再発行できますか？](/ja/faq/invoice-reissue) | 取消および再発行のため、元の情報と正しい情報を提出してください |
| [利用可能なチャージキャンペーンには何がありますか？](/ja/faq/recharge-promotions) | 初回および段階的なボーナスに加え、請求書発行も利用できます |
| [代理店パートナーシップに申し込むにはどうすればよいですか？友人を招待してリベートを獲得できますか？](/ja/faq/referral-program) | 紹介リベートはデフォルトで有効になっており、申請は不要です |
| [APIYI の返金ポリシーとは何ですか？](/ja/faq/refund-policy) | 条件、手続き、手数料、および請求書に関する注意事項です |
| [コンテンツの安全性とコンプライアンスはどのように確保されていますか？](/ja/faq/content-safety) | モデレーションメカニズムと違反時の対応を行います |
| [APIYI はどのようにデータセキュリティを確保していますか？](/ja/faq/data-security) | 暗号化通信、最小限の保存、アクセス制御を実施しています |

### ⚙️ モデル & API (40)

**モデルの選択と一般的な動作**

| 質問 | 1行回答 |
| - | - |
| [適切なAIモデルの選び方は？](/ja/faq/model-selection-guide) | ユースケース、コスト、速度に応じて選択します |
| [一部のモデルが使用できないのはなぜですか？](/ja/faq/model-availability) | 一部のモデルは事前に権限を解放する必要があります |
| [テキストと生成画像の両方を出力する会話型APIはありますか？](/ja/faq/text-and-image-in-one-api) | 画像の読み取りと画像の生成は異なります。画像を出力するには4つのルートがあります |
| [GoogleモデルはAI StudioとVertexのどちらで動作しますか？](/ja/faq/google-upstream-aistudio-vertex) | デフォルトグループは公式のAI Studioルートを使用します |
| [モデル名の末尾にある -c サフィックスは何を意味しますか？](/ja/faq/model-name-suffix-c) | 課金体系が異なる別のルートを示します |
| [公式WebアプリとAPIで結果が異なるのはなぜですか？](/ja/faq/webapp-vs-api-difference) | Webアプリはシステムpromptを追加しますが、APIは素のモデルです |
| [APIにはChatGPTのような記憶機能がありますか？](/ja/faq/api-memory) | いいえ、記憶機能はクライアントが読み書きするローカルファイルです |
| [AIモデルが自身のバージョンを認識できないのはなぜですか？](/ja/faq/model-version-identity) | モデルの自己認識は信頼できません |
| [ClaudeがQwenやDeepSeekだと主張するのはなぜですか？](/ja/faq/claude-identity-confusion) | モデルが入れ替わったのではなく、アイデンティティのハルシネーションです |

**統合とパラメータ**

| 質問 | 1行回答 |
| - | - |
| [Base URLの設定方法は？/v1、ルートドメイン、/v1betaの違い](/ja/faq/base-url-config) | OpenAI、Claude、Geminiでそれぞれ1つの形式があります |
| [ストリーミング呼び出しと非ストリーミング呼び出しの違いは何ですか？](/ja/faq/streaming-vs-non-streaming) | `stream`フラグによって決まり、内容と課金は同一です |
| [max\_tokensとは何ですか？設定しないとどうなりますか？](/ja/faq/max-tokens) | 出力長の上限を設定します。未設定の場合はデフォルト値が適用されます |
| [APIの同時実行数制限はどのくらいですか？](/ja/faq/api-concurrency) | 制限はモデルタイプによって異なり、引き上げることが可能です |
| [APIのタイムアウトを回避するにはどうすればよいですか？](/ja/faq/timeout-configuration) | クライアントのタイムアウト値を増やしてください。推論モデルは低速です |
| [モデルAPIのエラーはどのようにトラブルシューティングすればよいですか？](/ja/faq/model-error-troubleshooting) | パラメータ、認証、429、5xx、タイムアウトを順番に確認します |
| [OpenAIモデルの拒絶応答はどのような形式ですか？](/ja/faq/openai-content-safety-refusal) | 200 + stop + 短い拒絶文であり、エラーコードやカテゴリはありません |
| [Claudeの拒絶応答が空のコンテンツを返すのはなぜですか？](/ja/faq/claude-content-safety-refusal) | 200 + 空のコンテンツ + `refusal`（拒絶カテゴリ付き） |
| [ClaudeのInvalid Thinking Signatureエラーを修正するにはどうすればよいですか？](/ja/faq/claude-thinking-signature-invalid) | レート制限ではありません。新しい会話を開始してください |
| [コンテンツがフィルタリングされた場合、ストリーミングリクエストと非ストリーミングリクエストでどのような違いがありますか？](/ja/faq/streaming-content-filter) | 非ストリーミングは自動的にフェイルオーバーし、ストリーミングはcontent\_filterで終了します |
| [ログでは呼び出しが完了して課金されているのに、クライアントが応答を受信できませんでした。どうトラブルシューティングすればよいですか？](/ja/faq/log-duration-vs-client-wait) | 2つの時間は異なる範囲を測定しています。まずはその時間差を測定してください |

**画像生成**

| 質問 | 1行回答 |
| - | - |
| [Nano Bananaの画像生成が失敗する一般的な理由](/ja/faq/nano-banana-image-failure) | 通常はGoogleのコンテンツセーフティに引っかかっていることが原因です |
| [Gemini画像APIがNO\_IMAGEを返すのはなぜですか？](/ja/faq/gemini-no-image) | セーフティによるブロックとは原因が異なるため、個別にトラブルシューティングしてください |
| [Gemini画像がblockReason: OTHERを返すのはなぜですか？](/ja/faq/gemini-image-input-blocked) | まず参照画像を特定し、すべての参照画像を再エンコードしてください |
| [Gemini画像がIMAGE\_OTHERを返すのはなぜですか？](/ja/faq/gemini-image-other) | promptに実名を含めず、代わりに外見の特徴を描写してください |
| [白背景の画像に黒い斑点、汚れ、または不鮮明な色ムラが出るのはなぜですか？](/ja/faq/white-background-image-artifacts) | 純白ではなく、明るい色の背景を指定するpromptを使用してください |
| [banana proで編集した後に画像が赤みを帯びるのはなぜですか？](/ja/faq/banana-pro-edit-red-cast) | Vertexルートに切り替えるか、`gpt-image-2`を使用してください |
| [Nano Banana Proで衣装を変更する際にプリントが歪む問題を修正するには？](/ja/faq/nano-banana-pro-print-distortion) | promptの言い回し、参照の重み付け、ルート間フォールバックで対応します |
| [生成された画像が参照画像と大きく異なるのはなぜですか？](/ja/faq/image-result-differs-from-reference) | 参照画像はbase64でエンコードされている必要があります |
| [背景が透明な画像（PNG切り抜き）を生成するにはどうすればよいですか？](/ja/faq/image-transparent-background) | `background: "transparent"`を`gpt-image-2`に渡すことで、実際のアルファチャンネルを取得します |
| [image content does not match MIME type エラーを修正するには？](/ja/faq/image-mime-type-mismatch-with-query) | 画像URLからCDN処理パラメータを削除してください |
| [GPT画像出力のtokenが非常に多いのはなぜですか？](/ja/faq/gpt-image-output-token-calculation) | 解像度、品質、アスペクト比、生成枚数のすべてが出力token数に影響します |
| [GPT-ImageのCodex連携がIncorrect API Keyで失敗する](/ja/faq/gpt-image-incorrect-api-key-openai) | エラーはOpenAIからのものであり、リクエストはAPIYIに到達していません |
| [非同期の画像APIはありますか？タスクIDで結果を照会できますか？](/ja/faq/image-async-api) | 同期のみ対応しており、タスクIDによる照会はありません |

**動画生成**

| 質問 | 1行回答 |
| - | - |
| [送信後にSeedance動画タスクをキャンセルできますか？](/ja/faq/seedance-video-task-cancel) | キャンセル用エンドポイントは存在しません。再送信しないように注意してください |
| [task\_idからSeedance動画の実際のコストを確認するにはどうすればよいですか？](/ja/faq/seedance-task-cost-lookup) | 2つの課金行とタスクのクォータを照合します |
| [Seedance 2.0は顔の参照画像をアセットライブラリに自動アップロードしますか？](/ja/faq/seedance2-asset-face-reference) | いいえ — 最初にアップロードし、その後に`asset://` IDを参照します |
| [Seedance 2.0 / 2.5が顔アセットをブロックするのはなぜですか？](/ja/faq/seedance2-face-asset-whitelist) | 実在の人物の顔にはアセットのアップロードに加えて本人確認が必要です |
| [Seedanceでinvalid image formatと表示されますが、リンクはブラウザで開けます](/ja/faq/seedance-image-url-invalid-format) | リンクはサーバーから取得可能である必要があります。公開URLを使用してください |
| [Seedance 2.5：Reference-to-Video vs. 動画編集](/ja/faq/seedance2-reference-vs-edit) | promptの意図によって決定されます。編集ではアスペクト比と再生時間が固定されます |
| [SeedanceでFirst/Last Frame Cannot Be Mixed with Reference Mediaと表示される](/ja/faq/seedance-first-frame-mixed-with-reference) | 画像にロールが設定されていないため最初のフレームになっています。ロールを明示的に設定してください |

### 🌐 ネットワークと接続 (9)

| 質問 | 一行回答 |
| - | - |
| [APIの利用にプロキシは必要ですか？](/ja/faq/network-proxy) | 直接接続が可能です。プロキシやVPNは不要です |
| [PythonでSSLEOFErrorが発生するのにcurlでは動作する？](/ja/faq/openssl-pq-handshake-eof) | OpenSSL 3.5+の耐量子暗号ハンドシェイクがミドルボックスによって切断されています |
| [APIYIのサーバーはどこにありますか？どのサーバーを選択すべきですか？](/ja/faq/server-location) | ノードの所在地、レイテンシテスト、購入に関するアドバイス |
| [CDNの画像/動画ダウンロードが遅い、またはタイムアウトする場合はどうすればよいですか？](/ja/faq/cdn-download-slow) | セルフチェックコマンドと弊社へお送りいただく情報 |
| [httpはHTTP/1.1と同じですか？](/ja/faq/http-vs-http11) | 異なります。ほとんどのユーザーはhttpsをご利用ください |
| [画像APIのレイテンシを短縮するにはどうすればよいですか？](/ja/faq/image-api-network-latency-optimization) | クライアントのプロトコルバージョン、接続の再利用、タイムアウト設定 |
| [WebサイトまたはAPIが502を返す場合はどうすればよいですか？](/ja/faq/website-502-error) | 一時的なコンテナの自動再起動です。約1分で復旧し、課金は発生しません。30秒後に再試行してください |
| [スクリプトで502が発生するのに呼び出しログに何も記録されない？](/ja/faq/proxy-empty-502) | ローカルプロキシから返された空の502です。スクリプトがシステムプロキシをバイパスするように設定してください |
| [プロキシ経由で画像呼び出しが約90秒後に切断される？](/ja/faq/proxy-idle-timeout-disconnect) | プロキシがアイドル接続を切断しています。api.apiyi.comへ直接ルーティングしてください |

### 👤 アカウントとログイン (6)

| 質問 | 一行回答 |
| - | - |
| [APIYIは登録にどのメールプロバイダーをサポートしていますか？](/ja/faq/email-registration) | Gmail、Outlook、Foxmail、大学のメールアドレス |
| [Passkeyでサインインするにはどうすればよいですか？](/ja/faq/passkey-login) | 一度紐付ければ、指紋または顔認証でロック解除できます |
| [GitHubログインで「アカウントはすでに紐付けられています」と表示される？](/ja/faq/github-bindng-bindng-error) | そのGitHubアカウントは別のメールアドレスに紐付けられています |
| [パスワードを忘れた場合はどうすればよいですか？](/ja/faq/forgot-password) | メールでリセットするか、サポートにお問い合わせください |
| [API Keyが無効なのはなぜですか？](/ja/faq/invalid-api-key) | Base URLとKEYの不一致が一般的な原因です |
| [アカウントを削除するにはどうすればよいですか？](/ja/faq/account-deletion) | ワンクリックで削除でき、データは復元できません |

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.