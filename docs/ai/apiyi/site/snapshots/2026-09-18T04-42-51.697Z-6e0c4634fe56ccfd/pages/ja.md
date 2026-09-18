> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI - エンタープライズ AI モデル API ハブ

> 2年以上運営され、月間15万ユーザーが訪れる、長期的に信頼できるプロフェッショナルで安定した AI API 集約サービスです

<Info>
  **中国語ユーザーですか？** [中国語版に切り替える](/ja)
</Info>

**APIYI** は、エンタープライズグレードでプロフェッショナルかつ安定したAIモデルAPIハブです。統一されたOpenAI API標準に対応するとともに、各ベンダーのネイティブAPI形式（Claude、Geminiなど）もサポートし、400種類以上の人気AIモデルをカバーしています。1つのtokenで、OpenAI、Claude、Gemini、DeepSeek、Qwen、Kimi、GLM、Minimaxをはじめ、主流の大規模言語モデルすべてに簡単にアクセスできます。

## 🏢 会社概要

* 運営主体: APIYI, LLC (United States)
* 公式パートナー: Google AI Studio, Microsoft Azure, Amazon AWS（正規のクォータ供給元であり、安心してご利用いただけます）
* サービス保証:
  * 安定性: OpenAI, Claude, Google Gemini などの主要モデルに対して、高い同時実行数と安定したサービスを提供します
  * 信頼性:
    * 多くの有名アプリケーションが本番環境で安定的に導入されています（Use Cases セクションを参照）。
    * 著名な大学、病院、その他の機関との連携実績があり、有名企業にもサービスを提供しています。
    * 国内法人は、法人決済、請求書発行、購買リスト作成の支援を受けられるため、安心して経費精算できます。

## 🛡️ 怪しいAPIリセラーにうんざりしていませんか？

<Info>
  APIリセラー市場は玉石混交です。こっそりモデルを差し替える、品質が劣化する、運営者が消える、といったことがあまりにも多くあります。APIYIは口約束に頼らず、検証可能な証拠をお見せします。
</Info>

<CardGroup cols={3}>
  <Card title="2年以上の運営実績" icon="calendar-check" href="/ja/faq/enterprise-trust">
    月間15万訪問者、長期にわたり安定運営 — 付け焼き刃の新規参入ではありません
  </Card>

  <Card title="30日間の理由不問返金" icon="rotate-ccw" href="/ja/faq/refund-policy">
    未使用残高は30日以内に元のお支払い方法へ返金、WeChat/Alipay経由でも手数料なし
  </Card>

  <Card title="純正公式リレー · モデル忠実性" icon="shield-check" href="/ja/faq/enterprise-trust">
    迂回転送なし、劣化なし、モデル差し替えなし — 忠実性をご自身で検証できます
  </Card>

  <Card title="実務的なSLA保証" icon="file-check" href="/ja/faq/sla-guarantee">
    課金異常への補償、障害時のクレジット再発行、企業向けの契約SLA
  </Card>

  <Card title="データセキュリティ" icon="lock" href="/ja/faq/data-security">
    透過プロキシ、会話内容は保持せず、ログ記録は最小限です
  </Card>

  <Card title="法人決済 · かんたん精算" icon="receipt" href="/ja/faq/university-reimbursement">
    請求書と法人振込に対応 — 大学、病院、企業で精算しやすいです
  </Card>
</CardGroup>

## 🤖 AIに統合を任せる3つの方法

ドキュメントを読む必要も、設定を手作業で入力する必要もありません。手元にあるAIを選び、対応するプロンプトをコピーすれば、あとはAIが処理します。

<Tabs>
  <Tab title="スキル · チャットエージェント" icon="sparkles">
    **OpenClawなどのチャットエージェントから、自然言語でAPIYIを呼び出せます。** プロンプトをエージェントにコピーすると、スキルをインストールし、キーを自己チェックして、セットアップを案内します。

    <Prompt description="OpenClaw、Claude Code、Cursor、またはスキルに対応した任意のエージェントにコピー" icon="bot" actions={["copy"]}>
      [https://docs.apiyi.com](https://docs.apiyi.com) からAPIYIスキルをインストールします。まず`npx skills add https://docs.apiyi.com`を試してください。
      OpenClawの場合は代わりに`git:apiyi-com/skills`をインストールし、それ以外の場合は[https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) を読むだけで構いません。
      次にキーを自己チェックします（スキル内のscripts/apiyi.py --check、またはnpx apiyi\@latest check）。
      キーがない場合は、[https://api.apiyi.com/token](https://api.apiyi.com/token) からコピーしてAPIYI\_API\_KEYに設定するよう案内してください。キーをハードコードしないでください。
      チェックで準備完了と表示されたら、gpt-5.4-miniで「Hello」を送信し、返信を表示してください。
    </Prompt>

    スキルのソース `github.com/apiyi-com/skills` · インストール方法とキーの設定は[AI Developer Kit](/ja/developer-kit#skills)に記載
  </Tab>

  <Tab title="CLI · ターミナル" icon="terminal">
    **コードを1行も書かずに、ターミナルから最初の呼び出しを動作させます。** `npx apiyi@latest check`はインストール不要で、キーの確認、ノードのレイテンシー測定、モデル一覧の表示、メッセージ送信、画像生成を行えます。

    <Prompt description="ターミナルコマンドを実行できる任意のエージェントにコピーするか、自分で行を実行" icon="terminal" actions={["copy"]}>
      APIYI CLIのインストールと実行を手伝ってください：[https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
      要件：Node 18以降。インストール不要の`npx apiyi@latest check`を実行してください。
      APIキー（`npx apiyi@latest auth set-key`またはAPIYI\_API\_KEY環境変数。[https://api.apiyi.com/token](https://api.apiyi.com/token) からコピー）を設定するよう案内してください。
      最後に`npx apiyi@latest models --grep gpt-5`と`npx apiyi@latest chat "Hello" -m gpt-5.4-mini`を実行し、出力を貼り付けてください。
    </Prompt>

    ソース `github.com/apiyi-com/cli` · npmパッケージ `apiyi` · 完全なコマンド一覧は[AI Developer Kit](/ja/developer-kit#cli)に記載
  </Tab>

  <Tab title="AI Developer Kit · コーディングエージェント" icon="code">
    **Cursor、Claude Code、Codexに、コードを書く前に仕様を読ませます。** skill.mdはルールブック、llms.txtはインデックス、model-registry.jsonはモデルの信頼できる唯一の情報源です。読んで説明してから編集してください。エンドポイントを推測で作成しないでください。

    <Prompt description="Cursor、Claude Code、Codex、またはその他のコーディングエージェントにコピー" icon="code" actions={["copy"]}>
      最初に[https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) と[https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt) をすべて読んでください。
      APIYIの統合ルールに従う必要があります。エンドポイント、パラメータ名、列挙値、レスポンス形式を推測で作成しないでください。
      モデルIDについては、[https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) を唯一の信頼できる情報源として使用してください（ドットでバージョン管理され、大文字と小文字を区別します。例：gpt-5.4-mini）。
      SDKに応じてベースURLを選択してください。OpenAI SDKは[https://api.apiyi.com/v1、AnthropicおよびGoogle](https://api.apiyi.com/v1、AnthropicおよびGoogle) GenAI SDKは[https://api.apiyi.comです（Geminiではapi\_versionもv1betaに設定します）。](https://api.apiyi.comです（Geminiではapi_versionもv1betaに設定します）。)
      キーはAPIYI\_API\_KEY環境変数からのみ読み取ってください。読み取った後、まず統合の流れを説明してください。まだコードを編集しないでください。
    </Prompt>

    キットの内容と各ファイルの使用方法：[AI Developer Kit](/ja/developer-kit)
  </Tab>
</Tabs>

## 🌟 Featured Models

<CardGroup cols={3}>
  <Card title="Nano Banana Pro/2 シリーズ" icon="image" href="/ja/api-capabilities/nano-banana-pricing">
    **🎨 画像生成**

    利用可能な最高品質、4Kがわずか

    **\$0.09** /image

    🎯 公式価格のわずか30.3%
  </Card>

  <Card title="Claude 公式リレー" icon="sparkles" href="/ja/api-capabilities/claude">
    **🤖 チャット & コーディング**

    AWS + 公式のデュアルチャネル経由の純正公式リレー、高いキャッシュヒット率

    ⚡ 公式価格の約80%
  </Card>

  <Card title="GPT-image-2 フルシリーズ" icon="images" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    **🖼️ 画像生成**

    公式リレー + リバース（-all/-vip）をフルカバー

    🎯 ニーズに合うものをお選びください
  </Card>

  <Card title="Gemini フルマルチモーダルシリーズ" icon="gem" href="/ja/api-capabilities/model-info">
    **🔥 マルチモーダル**

    テキスト、画像、動画のフルラインナップ

    🏆 Gemini 3.1 Proが性能でリード
  </Card>

  <Card title="OpenAI フルマルチモーダルシリーズ" icon="bot" href="/ja/api-capabilities/model-info">
    **🚀 マルチモーダル**

    GPT / oシリーズ、画像、動画、音声

    ✅ フルラインナップ、安定したサポート
  </Card>
</CardGroup>

## 📖 製品の基本

<CardGroup cols={2}>
  <Card title="クイックスタート" icon="rocket" href="/ja/getting-started">
    3ステップで統合を完了し、すぐにAIモデルの利用を開始できます
  </Card>

  <Card title="APIマニュアル" icon="book" href="/ja/api-manual">
    完全なAPIドキュメントと開発者向けガイド
  </Card>

  <Card title="AI開発キット" icon="bot" href="/ja/developer-kit">
    🤖 コーディングエージェント向けのスキル、CLI、コントラクトおよびモデルレジストリ
  </Card>

  <Card title="変更履歴" icon="megaphone" href="/en/changelog">
    🔥 最新モデルのリリース、価格調整、重要なアップデート
  </Card>

  <Card title="料金" icon="tag" href="/ja/pricing">
    すべてのモデルの詳細な料金とキャンペーンを確認できます
  </Card>
</CardGroup>

## 🔧 コアAPI

<CardGroup cols={2}>
  <Card title="チャット補完 API" icon="message-circle" href="/ja/api-manual">
    チャット補完 - マルチターン会話とテキスト生成を作成します
  </Card>

  <Card title="モデル API" icon="list" href="/ja/api-capabilities/model-info">
    モデル API - 利用可能なすべてのモデル情報を取得します
  </Card>

  <Card title="画像生成 API" icon="image" href="/ja/api-capabilities/image-video-models">
    画像 API - Nano Banana Pro、gpt-image-2 など
  </Card>

  <Card title="エンベディング API" icon="vector-square" href="/ja/api-manual#embeddings-api">
    エンベディング API - テキストのベクトル化とセマンティック検索
  </Card>
</CardGroup>

## ⚡ API機能

### 🎬 動画生成 API

<CardGroup cols={2}>
  <Card title="Seedance 2.0 動画生成" icon="film" href="/ja/api-capabilities/seedance2/overview">
    🔥 ByteDanceの最新フラッグシップ：standard / fast / mini ティア、デフォルトで音声同期、高い同時実行数でキュー待ちなし
  </Card>

  <Card title="Wan2.7 動画生成" icon="videotape" href="/ja/api-capabilities/wan/overview">
    Alibaba公式チャネル：テキスト / 画像 / 参照からの動画生成に加え、動画編集にも対応、\$0.42/動画から
  </Card>

  <Card title="VEO 3.1 動画生成" icon="clapperboard" href="/ja/api-capabilities/veo-3-1-official/overview">
    Google公式チャネル、1回の生成ごとの課金で \$0.3/動画から、720p / 1080p / 4Kに対応
  </Card>

  <Card title="キャラクター一貫性動画" icon="images" href="/ja/api-capabilities/seedance2/asset-library">
    Seedanceアセットライブラリ：画像を一度アップロードするだけで、参照してキャラクターの一貫性を保った動画を生成
  </Card>

  <Card title="動画理解 API" icon="eye" href="/ja/api-capabilities/video-understanding">
    インテリジェントな動画分析、シーン認識、コンテンツ理解
  </Card>
</CardGroup>

### 🎨 画像生成 API

<CardGroup cols={2}>
  <Card title="Nano Banana Pro" icon="banana" href="/ja/api-capabilities/nano-banana-image/overview">
    🔥 当社最強モデル、4K HD、クラス最高のテキスト描画、\$0.09/画像
  </Card>

  <Card title="Nano Banana 2" icon="banana" href="/ja/api-capabilities/nano-banana-2-image/overview">
    🔥 使用量ベースの課金、新しい1:8/8:1の長尺画像比率、\$0.055/画像（使用量ベースでは \$0.025から）
  </Card>

  <Card title="Nano Banana Lite" icon="zap" href="/ja/api-capabilities/nano-banana-lite-image/overview">
    🆕 Google最速かつ最安、1画像あたり約4秒、\$0.025/画像
  </Card>

  <Card title="gpt-image-2.5 / 2 シリーズ" icon="images" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    OpenAI公式リレー、ネイティブ4K対応の2.5-flare / 2.5-sunburst / 2に、\$0.03/画像のリバース -all/-vipを適用 — 用途に合うものを選択
  </Card>

  <Card title="Seedream 5.0/4.5" icon="sparkles" href="/ja/api-capabilities/seedream-image/overview">
    BytePlus公式パートナーシップ、高速で URL出力に対応、\$0.035/画像から
  </Card>

  <Card title="Flux 2 シリーズ" icon="wand-sparkles" href="/ja/api-capabilities/flux/overview">
    🆕 FLUX.2 max/pro/flex ティア、\$0.03/生成から
  </Card>
</CardGroup>

### 🔧 基本 API

<CardGroup cols={2}>
  <Card title="モデル情報" icon="database" href="/ja/api-capabilities/model-info">
    対応する400以上の AIモデルの詳細情報を表示
  </Card>

  <Card title="OpenAI SDK統合" icon="code" href="/ja/api-capabilities/openai/compatible">
    公式 SDKを使用してAPIYIをシームレスに統合
  </Card>

  <Card title="画像理解 API" icon="eye" href="/ja/api-capabilities/vision-understanding">
    インテリジェントな画像分析、OCR、オブジェクト認識、シーン説明
  </Card>

  <Card title="Claudeネイティブフォーマット" icon="messages-square" href="/ja/api-capabilities/claude">
    Anthropicネイティブ APIフォーマット、全機能に対応
  </Card>

  <Card title="Geminiネイティブフォーマット" icon="gem" href="/ja/api-capabilities/gemini/native">
    Googleネイティブ APIフォーマット、全機能に対応
  </Card>

  <Card title="テキスト埋め込み API" icon="vector-square" href="/ja/api-capabilities/text-embedding">
    テキストのベクトル化とセマンティック検索
  </Card>
</CardGroup>

## 🎯 活用例

### 💬 会話型 AI

<CardGroup cols={2}>
  <Card title="Cherry Studio" icon="cherry" href="/ja/scenarios/chat/cherry-studio">
    複数モデルを切り替えられる高機能 AI チャットクライアント
  </Card>

  <Card title="Chatbox" icon="message-square" href="/ja/scenarios/chat/chatbox">
    クロスプラットフォーム対応のデスクトップ AI チャットアプリ
  </Card>

  <Card title="Open WebUI" icon="globe" href="/ja/scenarios/chat/open-webui">
    セルフホスト可能な Web チャットインターフェース
  </Card>

  <Card title="ChatGPT Next Web" icon="app-window" href="/ja/scenarios/chat/chatgpt-next-web">
    ワンクリックでデプロイできる Web ベースの ChatGPT
  </Card>
</CardGroup>

### 💻 プログラミング・開発

<CardGroup cols={2}>
  <Card title="Claude Code" icon="terminal" href="/ja/scenarios/programming/claude-code">
    🔥 Anthropic の公式 AI プログラミングアシスタント
  </Card>

  <Card title="Cursor" icon="mouse-pointer-click" href="/ja/scenarios/programming/cursor">
    AI 搭載のコードエディタ
  </Card>

  <Card title="Cline (VS Code)" icon="code" href="/ja/scenarios/programming/cline">
    VS Code の AI プログラミングアシスタント
  </Card>

  <Card title="Roo Code" icon="rocket" href="/ja/scenarios/programming/roo-code">
    効率的な AI コード生成ツール
  </Card>

  <Card title="Codex CLI" icon="square-terminal" href="/ja/scenarios/programming/codex-cli">
    コマンドライン AI プログラミングアシスタント
  </Card>

  <Card title="Gemini CLI" icon="gem" href="/ja/scenarios/programming/gemini-cli">
    Google Gemini のコマンドラインツール
  </Card>
</CardGroup>

### 🔧 エンジニアリング

<CardGroup cols={2}>
  <Card title="LangChain" icon="link" href="/ja/scenarios/engineering/langchain">
    AI アプリケーションを構築するための開発フレームワーク
  </Card>

  <Card title="Dify" icon="workflow" href="/ja/scenarios/engineering/dify">
    ビジュアル AI アプリケーション開発プラットフォーム
  </Card>
</CardGroup>

### 🌐 翻訳

<CardGroup cols={2}>
  <Card title="Bob Translator" icon="languages" href="/ja/scenarios/translation/bob">
    macOS 向けのプロ仕様翻訳ツール
  </Card>

  <Card title="Immersive Translate" icon="globe" href="/ja/scenarios/translation/immersive">
    バイリンガル読書用のブラウザー拡張機能
  </Card>
</CardGroup>

## 🚀 APIYIを選ぶ理由?

### 1つのインターフェース、複数のモデル

AIサービスごとに個別アカウントを申請したり、各AIサービスのAPIキーを管理したりする必要はありません。APIYIなら、必要なのは以下だけです:

* **1つのアカウント**: すべてのAIサービスを管理
* **1つのAPIキー**: すべてのモデルにアクセス
* **1つの標準**: OpenAI API形式と互換

### 💡 対応モデル

400以上の業界をリードするAIモデルに対応しています:

#### OpenAIシリーズ

* GPT-5.1フルシリーズ（最新世代、知能と速度のバランスを両立）
* GPT-5 / GPT-5 Mini / GPT-5 Nano
* o3 / o3 Pro / o4-mini（推論モデル）
* GPT-4.1 / GPT-4oシリーズ
* Codexシリーズ（プログラミング特化）
* DALL·E 3 / GPT-Image-1

#### Anthropicシリーズ

* **Claude Opus 4.5**（🔥 最新フラッグシップ、SWE-bench 80.9%）
* Claude Sonnet 4.5（世界トップクラスのコーディングモデル）
* Claude Haiku 4.5（高いコストパフォーマンス）
* Claude 4 Sonnet / Claude 4 Opus

#### Googleシリーズ

* **Gemini 3 Pro Preview**（🔥 LMArenaで世界1位）
* **Nano Banana Pro**（🔥 4K HD画像生成）
* Gemini 2.5 Pro（2Mコンテキスト）
* Gemini 2.5 Flash（高速応答）

#### xAI Grokシリーズ

* **Grok 4.5**（🔥 コードとエージェント向けの最新フラッグシップ）
* Grok 4.3 / Grok 4.20シリーズ（1Mコンテキスト）
* Grok Build 0.1（コード特化）
* Grok 4.20 Multi-Agent（マルチエージェント協調）
* [API guide](/ja/api-capabilities/grok/overview)（web search / X search / コード実行を確認済み）

#### 中国モデル

* DeepSeek V3.2 / V3.1 / R1（ハイブリッド推論）
* GLM-4.6 / GLM-4.5（Zhipu AI）
* Kimi K2（BytePlus公式）
* Qwenシリーズ（Alibaba）
* ERNIE 4.0（Baidu）
* SparkDesk 3.5（iFlytek）

#### 動画生成モデル

* **Seedance 2.0**（🔥 ByteDanceの最新、デフォルトで同期オーディオ付き）
* **Wan2.7**（Alibaba Wan、動画編集機能を含む）
* VEO 3.1（Google公式チャネル、最大4K）
* Sora 2 / Sora 2 Pro（OpenAI公式チャネル）

#### 画像生成モデル

* Nano Banana Pro（4K HD）
* Flux / SeeDream（プロ仕様）
* Sora Image（リバースエンジニアリング版）

### 🔧 シンプルで簡単

モデルの切り替えは、1つのパラメータを変更するだけです:

```python theme={null}
# Using GPT-4
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Switch to Claude 3
response = openai.ChatCompletion.create(
    model="claude-3-opus-20240229",  # Just change the model name
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 🛡️ 安定性と信頼性

* **高可用性**: マルチノード展開、インテリジェントルーティング
* **自動フェイルオーバー**: モデルが利用できない場合は自動で切り替え
* **ロードバランシング**: インテリジェントなリクエスト分散で、レート制限を回避
* **リアルタイム監視**: 24時間365日のサービス状態監視

### 💰 コスト最適化

* **統一課金**: すべてのモデルで統一された残高を使用
* **透明性の高い料金体系**: 明確な料金体系
* **利用統計**: 詳細な利用レポート
* **柔軟なチャージ**: 複数の支払い方法に対応

## 🎯 主な機能

### 🔥 最新モデルを即時利用可能

* **Claude Opus 4.5**: SWE-bench 80.9%、トップクラスのコーディング性能、価格は前世代の1/3に値下げ
* **Gemini 3 Pro Preview**: LMArena 1501 Eloで世界第1位、100万コンテキスト
* **Nano Banana Pro**: 4K HD 画像生成、クラス最高のテキストレンダリング
* **Seedance 2.0 動画生成**: ByteDance の最新フラッグシップ、デフォルトで同期音声、高同時実行数で待ち行列なし

### 🚀 安定・高信頼・無制限の同時実行数

公式パートナーのリソース（AWS、Azure、Google Cloud、BytePlus）と高性能インフラをサポートし、無制限の同時実行数で、複数業種の本番環境でも安定稼働を実現します。

### 💰 圧倒的なコストパフォーマンス

* チャージ特典: 最大80%オフ
* 為替レートの優位性: USD価格でよりお得です
* キャッシュ最適化: GPT-5.1 のプロンプトキャッシュでコストを90%削減
* 従量課金: token または利用ごとに柔軟に課金

## 🚀 始めましょう

始める準備はできましたか？ たった3ステップです:

<CardGroup cols={3}>
  <Card title="登録" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    APIYIアカウントを作成します
  </Card>

  <Card title="API Keyを取得" icon="key" href="/ja/getting-started">
    APIキーを生成します
  </Card>

  <Card title="連携" icon="code" href="/ja/api-manual">
    APIドキュメントを確認して連携を開始します
  </Card>
</CardGroup>

## 🔗 クイックリンク

<CardGroup cols={2}>
  <Card title="今すぐ登録" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    新規アカウントには試用クレジットとして \$0.05 が付与されます — チャージせずに最初の呼び出しを行えます
  </Card>

  <Card title="ダッシュボード" icon="settings" href="https://api.apiyi.com/token">
    APIキーを管理し、使用統計と課金を確認できます
  </Card>
</CardGroup>

***

<Note>
  新規アカウントには試用クレジットとして \$0.05 が付与されます — `gpt-5.4-mini` のような軽量モデルで Hello World を実行し、統合が正常に動作することを確認するのに十分です。実運用の準備ができたらチャージしてください。 [チャージボーナスポリシー](/ja/faq/recharge-promotions) をご覧ください。
</Note>
