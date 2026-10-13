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

## 🛡️ 信頼できない API リセラーにお困りですか？

<Info>
  API リセラー市場は玉石混交であり、密かなモデルのすり替え、品質低下、運営者の突然の失踪などが日常茶飯事となっています。APIYI は口約束だけに頼ることはありません。検証可能な確かな証拠をお届けします。
</Info>

<CardGroup cols={3}>
  <Card title="2年以上の運営実績" icon="calendar-check" href="/ja/faq/enterprise-trust">
    月間15万人以上の訪問者、長期にわたる安定稼働 — 一夜限りの新興業者ではありません
  </Card>

  <Card title="30日間の無条件返金保証" icon="rotate-ccw" href="/ja/faq/refund-policy">
    未使用の残高は30日以内であれば元のお支払い方法へ返金可能、WeChat/Alipay経由の手数料は無料
  </Card>

  <Card title="純粋な公式リレー・モデルの忠実性" icon="shield-check" href="/ja/faq/enterprise-trust">
    迂回ルーティングなし、品質低下なし、モデルのすり替えなし — ご自身で忠実性を検証いただけます
  </Card>

  <Card title="実効性のあるSLA保証" icon="file-check" href="/ja/faq/sla-guarantee">
    課金異常時の補填、障害発生時のクレジット再発行、企業向けには契約に基づくSLAを提供
  </Card>

  <Card title="データセキュリティ" icon="lock" href="/ja/faq/data-security">
    透過型プロキシ、対話内容は保持せず、ログ記録は最小限
  </Card>

  <Card title="法人決済・スムーズな経費精算" icon="receipt" href="/ja/faq/university-reimbursement">
    請求書および法人送金に対応 — 大学、病院、企業での経費精算にも便利
  </Card>
</CardGroup>

### APIYI の立ち位置

信頼性と安心感が第一です。しかし率直に言えば、**質の高いリソースは決して安くはなく、安価なものには常に別の代償が伴います** — モデルのすり替え、出力の品質低下、スロットリング、あるいは運営者の突然の失踪により、最終的にビジネスがその代償を支払うことになります。

<CardGroup cols={2}>
  <Card title="メインとして APIYI を利用" icon="star">
    高品質で安定した、完全な忠実性を備えた API 体験を手に入れ、プロダクトの開発に専念できます
  </Card>

  <Card title="バックアップとして APIYI を確保" icon="life-buoy">
    メインプロバイダーでトラブルが発生した場合でも、ビジネスを滞りなく継続できるようサポートします
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

## 🌟 注目のモデル

<CardGroup cols={3}>
  <Card title="Nano Banana Pro/2 シリーズ" icon="image" href="/ja/api-capabilities/nano-banana-pricing">
    **🎨 画像生成**

    最高峰の品質、4Kがわずか

    **\$0.09** /画像

    🎯 公式価格のわずか30.3%から
  </Card>

  <Card title="Claude 公式リレー" icon="sparkles" href="/ja/api-capabilities/claude">
    **🤖 チャット＆コーディング**

    AWS + 公式のデュアルチャネルによる純粋な公式リレー、高いキャッシュヒット率

    ⚡ 公式価格の約80%
  </Card>

  <Card title="GPT-image-2 全シリーズ" icon="images" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    **🖼️ 画像生成**

    公式リレー + リバース（-all/-vip）を完全カバー

    🎯 ニーズに合わせて選択可能
  </Card>

  <Card title="Gemini マルチモーダル全シリーズ" icon="gem" href="/ja/api-capabilities/model-info">
    **🔥 マルチモーダル**

    テキスト、画像、動画のフルラインナップ

    🏆 Gemini 3.8 Flash が新登場
  </Card>

  <Card title="OpenAI マルチモーダル全シリーズ" icon="bot" href="/ja/api-capabilities/model-info">
    **🚀 マルチモーダル**

    GPT-6 / GPT-5.6 シリーズ、画像、音声

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
    🔥 ByteDanceの最新フラッグシップ：standard / fast / mini ティア、デフォルトで音声同期、キュー待ちなしの高同時実行数
  </Card>

  <Card title="Wan2.7 動画生成" icon="videotape" href="/ja/api-capabilities/wan/overview">
    Alibaba 公式チャネル：テキスト/画像/参照からの動画生成および動画編集、1動画あたり \$0.42 から
  </Card>

  <Card title="VEO 3.1 動画生成" icon="clapperboard" href="/ja/api-capabilities/veo-3-1-official/overview">
    Google 公式チャネル、生成ごとの課金で1動画あたり \$0.3 から、720p / 1080p / 4K
  </Card>

  <Card title="キャラクター一貫性動画" icon="images" href="/ja/api-capabilities/seedance2/asset-library">
    Seedance アセットライブラリ：画像を一度アップロードすれば、それを参照してキャラクターの一貫性を保った動画を生成できます
  </Card>

  <Card title="動画理解 API" icon="eye" href="/ja/api-capabilities/video-understanding">
    高度な動画分析、シーン認識、コンテンツ理解
  </Card>
</CardGroup>

### 🎨 画像生成 API

<CardGroup cols={2}>
  <Card title="Nano Banana Pro" icon="banana" href="/ja/api-capabilities/nano-banana-image/overview">
    🔥 最高峰モデル、4K HD、クラス最高のテキスト描画、1画像あたり \$0.09
  </Card>

  <Card title="Nano Banana 2" icon="banana" href="/ja/api-capabilities/nano-banana-2-image/overview">
    🔥 従量課金、新たに1:8/8:1の縦長・横長比率に対応、1画像あたり \$0.055（従量課金 \$0.025 から）
  </Card>

  <Card title="Nano Banana Lite" icon="zap" href="/ja/api-capabilities/nano-banana-lite-image/overview">
    🆕 Google 最速・最安、1画像あたり約4秒、1画像あたり \$0.025
  </Card>

  <Card title="gpt-image-2.5 / 2 シリーズ" icon="images" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    OpenAI 公式リレー 2.5-flare / 2.5-sunburst / 2（ネイティブ4K対応）＋ reverse -all（1画像あたり \$0.025）および -vip（1画像あたり \$0.03）— 用途に合わせて選択可能
  </Card>

  <Card title="Seedream 5.0/4.5" icon="sparkles" href="/ja/api-capabilities/seedream-image/overview">
    BytePlus 公式パートナーシップ、高速かつ URL 出力対応、1画像あたり \$0.035 から
  </Card>

  <Card title="FLUX 2 シリーズ" icon="wand-sparkles" href="/ja/api-capabilities/flux/overview">
    🆕 FLUX.2 max/pro/flex ティア、1生成あたり \$0.03 から
  </Card>
</CardGroup>

### 🔧 基本 API

<CardGroup cols={2}>
  <Card title="モデル情報" icon="database" href="/ja/api-capabilities/model-info">
    400以上の対応AIモデルの詳細情報を確認できます
  </Card>

  <Card title="OpenAI SDK 統合" icon="code" href="/ja/api-capabilities/openai/compatible">
    公式 SDK を使用して APIYI をシームレスに統合できます
  </Card>

  <Card title="画像理解 API" icon="eye" href="/ja/api-capabilities/vision-understanding">
    インテリジェントな画像分析、OCR、物体認識、シーン説明
  </Card>

  <Card title="Claude ネイティブフォーマット" icon="messages-square" href="/ja/api-capabilities/claude">
    Anthropic ネイティブ API フォーマット、全機能をフルサポート
  </Card>

  <Card title="Gemini ネイティブフォーマット" icon="gem" href="/ja/api-capabilities/gemini/native">
    Google ネイティブ API フォーマット、全機能をフルサポート
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

## 🚀 APIYI が選ばれる理由

### 1つのインターフェースで複数のモデルに対応

AIサービスごとに個別のアカウントを申請してAPIキーを管理する必要はありません。APIYI なら、必要なのはこれだけです：

* **1つのアカウント**：すべてのAIサービスを管理
* **1つのAPIキー**：すべてのモデルにアクセス
* **1つの標準規格**：OpenAI API フォーマットと互換

### 💡 サポートされているモデル

業界をリードする400以上のAIモデルをサポートしています：

#### OpenAI シリーズ

* **GPT-6 Astra**（🔥 コンピュータ操作および長期的エージェント向けの第6世代フラグシップ）
* **GPT-6 Sol / GPT-6 Luna**（🔥 5.6の約半額、長期的な価格設定）
* GPT-5.6 Sol / Terra / Luna、GPT-5.5 / GPT-5.4
* GPT-5.5 Pro（ディープ推論、Responses エンドポイントのみ）
* gpt-image-2.5 Flare / Sunburst、gpt-image-2（画像生成）
* gpt-realtime-2.1 / 2.1-mini（リアルタイム音声）

#### Anthropic シリーズ

* **Claude Opus 5.5**（🔥 最新フラグシップ、Terminal-Bench 4.0 66.4%、Opus 5 より低価格）
* **Claude Fable 5.1**（Mythos クラスのフラグシップ）
* Claude Opus 5 / Claude Sonnet 5
* Claude Opus 4.8 / Opus 4.7 / Sonnet 4.6 / Haiku 4.5

#### Google シリーズ

* **Gemini 3.8 Flash**（🔥 最新の Flash、3.7 と同価格）
* Gemini 3.7 Flash / 3.6 Flash / 3.5 Flash-Lite
* Gemini 3.1 Pro Preview（Google 最強の推論モデル）
* **Nano Banana Pro / Nano Banana 2**（🔥 4K HD 画像生成）

#### xAI Grok シリーズ

* **Grok 4.7**（🔥 2.1T ベースの最新フラグシップ）
* Grok 4.6 / Grok 4.5（コード＆エージェント）
* Grok 4.3（1M コンテキスト）
* [API ガイド](/ja/api-capabilities/grok/overview)（ウェブ検索 / X 検索 / コード実行の検証済み）

#### 中国系モデル

* DeepSeek V4.1 Flash / V4 Pro
* GLM-5.3 / GLM-5.3-Flash（Zhipu AI）
* Kimi K3（Moonshot）
* Qwen3.8-Max / Qwen3.7 シリーズ（Alibaba）
* MiniMax-M3
* Seed 2.1 Turbo（ByteDance）

#### 動画生成モデル

* **Seedance 2.5**（🔥 ByteDance の最新モデル、30秒の動画クリップ、最大30枚の参照画像）
* Seedance 2.0 シリーズ（標準 / 高速 / mini）
* **Wan2.7**（Alibaba Wan、動画編集機能を含む）、HappyHorse
* VEO 3.1（Google 公式ルート、最大4K）

#### 画像生成モデル

* **gpt-image-2.5**（🔥 スピード重視の Flare / クオリティ重視の Sunburst）
* Nano Banana Pro / Nano Banana 2（4K HD）
* Seedream 5.0 Pro / Flash（プロフェッショナルデザイン / 高速かつ低コスト）

### 🔧 シンプルで簡単

モデルの切り替えは、パラメータを1つ変更するだけです：

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

* **高可用性**：マルチノードデプロイ、インテリジェントルーティング
* **自動フェイルオーバー**：モデルが利用不可時の自動切り替え
* **ロードバランシング**：インテリジェントなリクエスト分散によりレート制限を回避
* **リアルタイム監視**：24時間365日のサービスステータス監視

### 💰 コストの最適化

* **一元的な課金**：すべてのモデルで統一された残高を使用
* **透明性の高い価格設定**：明確な料金体系
* **利用統計**：詳細な使用状況レポート
* **柔軟なチャージ**：複数の支払い方法に対応

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.