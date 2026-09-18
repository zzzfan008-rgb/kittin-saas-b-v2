> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# WorkBuddy

> Tencentのあらゆるシナリオに対応するAIオフィスワークスペース — 要件を伝えるだけで、自律的に計画・実行し、最終成果物を納品します。1つのAPIYIキーであらゆる大規模モデルを接続できます

<Tip>
  テンセントの全シナリオ対応 AI オフィスワークスペースです。要件を伝えると、自律的に計画・実行し、完成した成果物を届けます。1つの APIYI キーで、あらゆる大規模モデルに接続できます。
</Tip>

## 概要

WorkBuddy は、Tencent の AI Agent オフィス向け製品で、新しいパラダイムである **要件を伝えるだけで、タスクを実行させ、完成した成果物を受け取る** を中心に設計されています。会話型 AI のように提案やテキスト応答だけを返すのではなく、WorkBuddy は自然言語の指示を理解し、タスクを自律的に分解して、手順を計画し、操作を実行します。ドキュメント、スプレッドシート、スライド資料、データ分析といったマルチモーダルな作業に対応し、承認済みのローカルフォルダを読み取って一括処理もできるため、実際にそのまま承認できる成果物（週次レポート、議事録、資料、データダッシュボード）を出力します。

WorkBuddy には、Hunyuan、GLM、MiniMax、Kimi、DeepSeek（Tencent Cloud の Token プラン経由で提供）が標準搭載されており、さらに **Model configuration** を通じて、任意のサードパーティ製大規模モデルを基盤エンジンとして接続することもできます。APIYI を接続すると、次のような利点があります。

| 機能                  | 詳細                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| 🧩 1つのキーで全モデル       | ベンダーごとに個別登録する必要はありません。1つの APIYI キーで、WorkBuddy 内から GPT / Claude / Gemini / DeepSeek など一通りを利用できます |
| 🔐 キーはローカル保存        | 設定（API キーを含む）はお使いの端末の`workbuddy/models.json`にのみ保存され、クラウドへはアップロードされません                           |
| ⚡ 画面からのワンステップ設定     | 設定 → モデル → カスタムで、エンドポイント、キー、モデル名を入力して保存するだけです。設定ファイルを編集する必要はありません                               |
| 💰 従量課金、自分のアカウントで利用 | カスタムモデルの費用は APIYI へ直接課金され、WorkBuddy 自体のクレジットやプランのクォータは消費しません                                    |

> ℹ️ **製品情報**: WorkBuddy は Tencent 製です。Web サイト `www.workbuddy.cn`、公式ドキュメント `www.workbuddy.cn/docs/workbuddy/Overview`。

## インストール

WorkBuddy は現在、**Windows / macOS** のデスクトップクライアントを提供しています。ウェブサイトからインストーラーをダウンロードしてダブルクリックするだけでインストールできます — コマンドラインは不要です:

| プラットフォーム   | 入手方法                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| ウェブサイトのホーム | `www.workbuddy.cn` — ダウンロードボタンをクリックすると、お使いのプラットフォーム向けインストーラーを入手できます                                  |
| Windows    | 公式の Windows インストールガイドをご覧ください: `/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide` |
| macOS      | 公式の Mac インストールガイドをご覧ください: `/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Mac-Guide`     |
| 古いバージョン    | 公式ドキュメントの「ダウンロード履歴」: `/docs/workbuddy/Download-History`                                              |

インストールしたら、WorkBuddy を開いてサインインしてください。すると、**New task** バーから 1 文でタスクを指示できます。あるいは、公式の「クイックスタート」/「最初のタスク」チュートリアルに従って、基本を把握することもできます。

## APIYI への接続

WorkBuddy のモデル設定ダイアログは、**OpenAI互換プロトコルのAPIのみ**をサポートします（ダイアログ上部にもその旨が表示されます）。APIYI は標準の **OpenAI互換 API** を提供しているため、**カスタム** プロバイダーを選ぶだけで十分です。これで、GPT / Claude / Gemini / DeepSeek / Zhipu / Kimi などのモデルラインアップを一度に使えます。

### グラフィカル設定（唯一の方法であり、推奨）

WorkBuddy で **Settings → Models** を開き、**Add model** をクリックして、各項目を次のように入力します。

| 項目               | 入力内容                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Provider         | `Custom` を選択                                                                                                                                           |
| Endpoint         | `https://api.apiyi.com/v1/chat/completions` — `/chat/completions` までの完全なパスを入力してください。`https://api.apiyi.com` や `https://api.apiyi.com/v1` だけを入力しないでください |
| API Key          | APIYI のキー（`sk-...`）                                                                                                                                    |
| Model name       | 使用したいモデル ID。例: `claude-sonnet-5`、`gpt-5.4`、`deepseek-v3.2`、`kimi-k2.6`                                                                                 |
| Advanced options | 選択したモデルが実際にサポートしている内容に合わせて手動でチェックしてください — 下の注意を参照してください                                                                                                |

<img src="https://mintcdn.com/apiyillc/hVgOxBLyKM6-uzFJ/images/workbuddy-model-config-zh.png?fit=max&auto=format&n=hVgOxBLyKM6-uzFJ&q=85&s=d52fe72d995e805cc4a587d6aada814b" alt="WorkBuddy カスタムモデル設定ダイアログ（OpenAI互換プロトコルのAPIのみ）" width="660" height="639" data-path="images/workbuddy-model-config-zh.png" />

> ℹ️ **「Advanced options」内の機能フラグについて**: Tencent Cloud の Token Plan などの **標準プロバイダー** を選ぶと、ツール呼び出しや画像入力などのフラグは自動的に入力されます。APIYI に接続するために **カスタム** を選ぶ場合、これらは**自動検出されません**。モデルが実際にサポートしている内容に基づいて、手動でチェックする必要があります。
>
> * 入力したモデル ID の**実際の機能**に従ってください。迷う場合は、チェックを増やすより減らすほうが安全です — 上のスクリーンショットでは、`claude-sonnet-5` の例で有効になっているのはツール呼び出しだけです
> * 画像入力 / 推論モードは、モデルが本当にビジョンや高度な推論をサポートしていることを確認してから追加してください
> * モデルにない機能をチェックすると（たとえば、サポートしていないモデルでツール呼び出しを有効にするなど）、リクエストエラーの原因になることがあるため、必要なものだけをチェックしてください

**Input** と **Output** のセクションでは、コンテキスト長と最大出力 token 数を設定します。空欄のままにするとプロバイダーのデフォルトが使われます。必要に応じてプリセットも選べます。入力は 32K/64K/128K/256K、出力は 8K/16K/32K/64K です。**Save** をクリックしてチャット画面に戻ると、モデルはモデルピッカーの Custom グループに表示され、すぐに使えるようになります。

> ⚠️ **エンドポイントは `https://api.apiyi.com/v1/chat/completions` として完全な形で入力してください** — スクリーンショットにあるように、`/chat/completions` で終わる完全なパスです。`https://api.apiyi.com` や `https://api.apiyi.com/v1` のような不完全なアドレスでは、リクエストは失敗します。

**補足**: `api.apiyi.com/token` で token を作成する際、**一部のグループには割引があります**（たとえば ClaudeCode グループ）。これはチャージ特典と併用できます。現在のレートはコンソールが正です。

> 💡 **なぜ APIYI なのか？**
>
> * **1つのキーで多くのベンダーに対応**: OpenAI / Anthropic / Google / DeepSeek / Zhipu / Kimi など、モデルマトリクス全体を WorkBuddy で一度に設定できます
> * **価格面の優位性**: 通常は公式料金より 5%〜20% 安く、一部モデルではチャージ特典があります
> * **中国本土から直接アクセス**: プロキシなしで海外モデルにアクセスできるため、WorkBuddy デスクトップクライアントに追加のネットワーク設定は不要です
> * **標準の OpenAI互換プロトコル**: WorkBuddy の **カスタム** プロバイダー要件に完全に一致し、カスタムプロトコルのスイッチを有効にする必要がありません

> ℹ️ **費用とプライバシー**: カスタムモデルで発生したすべての費用（token 消費など）は APIYI と直接精算されるため、APIYI の残高と使用状況に注意してください。API Key はお使いの端末の `workbuddy/models.json` にのみ保存され、WorkBuddy がクラウドにアップロードすることはありません。安全に保管し、使わなくなったら Settings で設定を削除またはクリアしてください。

## 機能クイックリファレンス

| 機能                   | 詳細                                                                     |
| -------------------- | ---------------------------------------------------------------------- |
| ✨ 自然言語タスク            | 新規タスクバーに要件を1文で入力するだけで、複雑な手順を自分で分解する必要はありません                            |
| 📋 自律的な計画と実行         | タスクを分解し、手順を計画し、操作を実行して、確認可能な結果を返します                                    |
| 🗂️ マルチモーダルなタスク処理    | 文書 / スプレッドシート / スライドデッキ / データ分析など                                      |
| 📁 ローカルファイル操作        | 許可済みのローカルフォルダを読み取り、一括整理、リネーム、形式変換を行います                                 |
| 📨 マルチプラットフォームアシスタント | WeChat、WeCom、Feishu、DingTalk、QQ、Yuanbao botを含む7つの連携経路                  |
| 🧩 スキルマーケットプレイスとコネクタ | 厳選された無料スキル（Agent Browser、Web Search など）に加え、Tencent Docs / ナレッジベースのコネクタ |

## よくある質問

### APIYI を接続した後、私の API key は WorkBuddy のクラウドにアップロードされますか？

いいえ。公式ドキュメントには、モデル構成パラメータ（API key を含む）は `workbuddy/models.json` にローカル保存され、クラウドにはアップロードされないと明記されています。実行時に WorkBuddy は転送リンクとしてのみ動作し、設定した APIYI endpoint に入力を転送するだけです。出力はそのモデルから直接返ってきます。送信、セキュリティ監査、トラブルシューティング、法令で義務付けられた保持に必要な範囲を超えて、WorkBuddy は会話内容を読み取ったり保存したりしません。

### APIYI 経由でモデルを呼び出す際の料金はどのように計算されますか？ WorkBuddy の credits やプランのクォータを消費しますか？

いいえ、WorkBuddy 自身の credits やプランのクォータには一切影響しません。カスタムモデルにかかるすべての費用（token 消費、サブスクリプション料金など）は、あなたが APIYI に直接支払い、精算します。そのため、予想外の出費を避けるためにも、APIYI の残高と利用状況に注意してください。

### Anthropic ネイティブプロトコル（`anthropic_messages`）はサポートしていますか？

現時点ではサポートしていません。WorkBuddy のカスタムモデルダイアログは **OpenAI互換プロトコルの API のみ** をサポートします（ダイアログ上部に明記されています）。したがって、APIYI を接続する場合は、OpenAI 互換 endpoint `https://api.apiyi.com/v1/chat/completions` を使用してください — Anthropic のネイティブ endpoint は現時点ではサポートされていません。

### 「カスタムプロトコル」スイッチはいつ必要で、endpoint はどこまで完全に入力する必要がありますか？

**カスタムプロトコル** スイッチが必要なのは、接続するモデルサービスが ゲートウェイ や プロキシ レイヤーの背後にあり、標準ではない URL path を使っている場合だけです。これをオンにすると、WorkBuddy は path の検証をスキップし、入力したアドレスにそのままリクエストを送信します。APIYI は標準の `/chat/completions` path を提供しているため、スイッチは **オフ**（既定値）のままにしてください。いずれの場合も、endpoint は `https://api.apiyi.com/v1/chat/completions`（末尾が `/chat/completions` になる形）で**完全に**入力してください。ベースアドレスだけ（`https://api.apiyi.com` または `https://api.apiyi.com/v1`）を入力したり、`/v1` を重複させたりしないでください — `.../v1/v1/chat/completions` は 404 になります。

### tool calling / image input / reasoning mode はどのようにチェックすればよいですか？

Tencent Cloud の Token Plan のような標準プロバイダーでは、これらのフラグは自動的に設定されます。**カスタム** で APIYI を接続する場合は自動検出されないため、入力した model ID が実際にサポートしている内容に応じて手動でチェックしてください。迷った場合は、**多めにチェックするより少なめにチェックする** のが安全です。上のスクリーンショットでは、`claude-sonnet-5` は tool calling のみが有効になっています。model がそれらをサポートしていることを確認できたら、画像入力や推論モードを追加してください。model にない capability をチェックすると request エラーの原因になります。

### 「Model name」欄には何を入力しますか？

APIYI のドキュメントにある model ID です。たとえば `claude-sonnet-5`、`gpt-5.4`、`deepseek-v3.2`、`gemini-3.1-pro-preview`、または `kimi-k2.6` です。model を切り替えるには、設定でその欄を編集して保存するだけです。endpoint や API key を再設定する必要はありません。

## 関連リソース

| リソース                       | リンク                                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 🌐 WorkBuddy ウェブサイト        | `www.workbuddy.cn`                                                                                                                       |
| 📖 公式ドキュメントホーム             | `www.workbuddy.cn/docs/workbuddy/Overview`                                                                                               |
| ⚙️ モデル設定ドキュメント             | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model`                                               |
| ⬇️ Windows / Mac インストールガイド | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide` (Mac のガイドは同じディレクトリ内の `Installation-Mac-Guide` です) |
