> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Obsidian 用 Copilot

> Obsidian の Copilot プラグインを APIYI に接続し、個人のナレッジベースとチャットできます

Obsidian Copilot は、クリーンでプライバシーファーストな設計の、Obsidian 向けオープンソースの AI アシスタントプラグインです。独自の API キーで OpenAI 互換のモデルサービスならどれでも接続でき、カスタムプロンプトを作成し、Vault 全体とチャットして、個人のナレッジベースから回答やインサイトを得られます。

APIYI を使えば、400 以上の主流モデル — GPT、Claude、Gemini、DeepSeek など — に、Obsidian 内で 1 つのアカウントだけでアクセスでき、複数のプラットフォームに登録する必要はありません。

## 主な機能

<CardGroup cols={2}>
  <Card title="Vault とチャット" icon="messages-square">
    Vault QA モードは、ベクトルインデックスを通じて Vault 全体を検索し、個人のナレッジベースから質問に回答します
  </Card>

  <Card title="カスタムプロンプト" icon="wand-sparkles">
    要約、翻訳、書き換えのための組み込みコマンドに加え、選択したテキストをワンクリックで処理するカスタムプロンプトも使えます
  </Card>

  <Card title="プライバシー最優先" icon="shield-check">
    オープンソースのプラグイン、ローカルデータ保存、そして API キーはローカル設定内のみに保持されます
  </Card>

  <Card title="柔軟なモデルアクセス" icon="plug">
    任意の OpenAI 互換エンドポイントで動作し、APIYI を通じて 400 以上のモデルを自由に切り替えられます
  </Card>
</CardGroup>

## クイックスタート

### ステップ 1: APIYIキーを取得する

1. [APIYIのWebサイト](https://api.apiyi.com)を開いてサインアップします（すでにアカウントがある場合はログインします）
2. コンソールの「Tokens」ページに移動し、新しい API キーを作成します
3. 後で使えるように、キー（`sk-...`で始まります）をコピーします

### ステップ 2: Obsidian Copilotプラグインをインストールする

<Steps>
  <Step title="Obsidianをインストールする">
    公式サイトからObsidianをダウンロードしてインストールします: `obsidian.md`
  </Step>

  <Step title="Community Plugin Marketを開く">
    Obsidian の **Settings → Community plugins** に移動し、「Restricted mode」をオフにして「Browse」をクリックします
  </Step>

  <Step title="Copilotをインストールして有効化する">
    **Copilot**（Logan Yang作）を検索し、インストールして有効化します
  </Step>
</Steps>

### ステップ 3: APIYIのLLMモデルを設定する

<Steps>
  <Step title="Copilotの設定を開く">
    **Settings → Copilot** に移動し、**Model** タブに切り替えます
  </Step>

  <Step title="カスタムモデルを追加する">
    Chat Models セクションで **Add Custom Model** をクリックし、次の内容を入力します:

    | フィールド      | 値                                       |
    | ---------- | --------------------------------------- |
    | **モデル名**   | モデル名。例: `gpt-5.2` または `claude-sonnet-5` |
    | **プロバイダー** | **3rd party (openai-format)** を選択します    |
    | **ベースURL** | `https://api.apiyi.com/v1`              |
    | **APIキー**  | あなたの APIYI キー（`sk-...`）                 |
  </Step>

  <Step title="確認して追加する">
    **Verify** をクリックして接続をテストし、最後に **Add Model** をクリックします
  </Step>
</Steps>

<Info>
  **設定メモ**

  * ベースURLには `/v1` のサフィックスを含める必要があります: `https://api.apiyi.com/v1`
  * モデル名は APIYI がサポートするモデル名と完全に一致している必要があります。 [モデル一覧](https://api.apiyi.com/account/models)で確認してください
  * 複数のモデルを追加して、チャットパネルでいつでも切り替えられます
</Info>

### ステップ 4: 埋め込みモデルを設定する（Vault QA に必要）

Vault QA（ナレッジベースQ\&A）モードを使うには、埋め込みモデルも必要です:

1. Copilot 設定の **Embedding Models** セクションで、**Add Custom Model** をクリックします
2. 埋め込みモデル名を入力します: `text-embedding-3-small`（コスト効率が高い）または `text-embedding-3-large`（高精度）を推奨します
3. プロバイダーとして **3rd party (openai-format)** を選択します
4. ベースURLを `https://api.apiyi.com/v1` に設定し、APIYI キーを入力します
5. **Add Model** をクリックして完了します

### ステップ 5: 保存して使い始める

新しく追加したモデルを既定として選択し、**Save and Reload** をクリックします。これで次のことができます:

* 左側サイドバーの Copilot アイコンをクリックしてチャットパネルを開く
* **Chat** モードでモデルと直接会話する
* **Vault QA** モードで Vault 全体に対して質問する（初回利用時はインデックスの構築が完了するまで待つ必要があります）

## 対応モデル

Obsidian Copilot は APIYI を通じて、OpenAI、Claude、Gemini、DeepSeek、および中国系モデルを含む 400 以上の主流AIモデルをサポートしています。

<Card title="最新のモデル推薦を見る" icon="star" href="/ja/api-capabilities/model-info">
  最新のモデル推薦、性能比較、利用アドバイスをご覧ください。モデル一覧は継続的に更新されるため、常に最新かつ最も強力なAIモデルを利用できます。
</Card>

<Info>
  **ここに特定のモデルを掲載しないのはなぜですか？**

  AIモデルは非常に速いペースで進化します。最も正確なおすすめをお届けするため、最新のモデル一覧、性能データ、利用アドバイスを [モデル推薦ページ](/ja/api-capabilities/model-info) に掲載しています。
</Info>

<Tip>
  **シナリオ別のおすすめ**

  * **日常のノートQ\&A**: 高速で低コストな軽量モデルを選んでください
  * **長文要約 / 深い執筆**: 長いコンテキストウィンドウを持つフラッグシップモデルを選んでください
  * **Vault Q\&A エンベディング**: `text-embedding-3-small` はナレッジベースの大半のシナリオをカバーします
</Tip>

## 高度な機能

### カスタムコマンドとプロンプト

Copilot では、よく使う操作をカスタムコマンドとして保存できます。

1. Copilot 設定の **コマンド** セクションを開きます
2. たとえば「Rewrite the selection as a weekly report」のようなカスタムプロンプトを作成します
3. エディタでテキストを選択し、コマンドパレット（`Ctrl/Cmd + P`）から実行します

### 選択したテキストの操作

ノート内の任意の文章を選択し、組み込みコマンドを直接呼び出します。

* **要約**: 選択範囲をワンクリックで要約します
* **翻訳**: 指定した言語に翻訳します
* **簡略化 / 文法修正**: 表現を簡潔にするか、文法を修正します
* **目次を生成**: TOC を作成します

### CORS 互換モード

設定後に chat リクエストが失敗する場合は、モデルを追加する際に **CORS** オプションを有効にしてください。

<Warning>
  CORS モードを有効にすると、Obsidian は streaming 出力をサポートしません — 生成が完了すると返信が一度に表示されます。APIYI の標準エンドポイントでは通常このオプションは不要です。リクエストが失敗する場合にのみ試してください。
</Warning>

## トラブルシューティング

<AccordionGroup>
  <Accordion title="Verify に失敗するか、チャットが応答しない">
    * Base URL が `https://api.apiyi.com/v1` であることを確認してください（`/v1` を含む）
    * APIキーが余分なスペースなく正しくコピーされていることを確認してください
    * アカウントに十分な残高があることを確認してください
    * それでも失敗する場合は、モデル設定で CORS オプションを有効にしてみてください
  </Accordion>

  <Accordion title="Model が見つからないエラー">
    * モデル名は APIYI がサポートする名前と完全に一致している必要があります（大文字・小文字を区別します）
    * 正確なモデル名を [モデル一覧](https://api.apiyi.com/account/models) で確認してください
  </Accordion>

  <Accordion title="Vault QA が動作しないか、インデックス作成に失敗する">
    * 別の埋め込みモデルが設定されていることを確認してください（LLM モデルを埋め込みモデルとして兼用することはできません）
    * 大きな Vault を初めてインデックス化するには時間がかかります — しばらくお待ちください
    * 埋め込みモデルを変更した後は、インデックスを再構築してください（Force Re-index）
  </Accordion>

  <Accordion title="応答が遅い">
    * より高速な軽量モデルに切り替えてください
    * 会話のコンテキスト長を短くしてください
    * Vault QA モードでは、取得するチャンク数を減らしてください
  </Accordion>
</AccordionGroup>

## ヒント

1. **モデル間で作業を分担する**: 複数のモデルを追加し、日常的な Q\&A には軽量モデルを使い、深い文章作成にはフラッグシップモデルに切り替えてコストを抑えます
2. **インデックスの範囲を絞る**: Copilot の設定で添付ファイルとテンプレートフォルダを除外し、埋め込みコストを下げて検索品質を向上させます
3. **カスタムプロンプトを活用する**: 高頻度の操作（例: 「会議メモを整理する」）をコマンドに変え、一度設定すればずっと再利用できます
4. **定期的にインデックスを再構築する**: 大きな vault 変更の後に Force Re-index を実行し、Vault QA の検索精度を保ちます

## 関連リソース

<CardGroup cols={2}>
  <Card title="モデル推薦" icon="star" href="/ja/api-capabilities/model-info">
    最新のモデル一覧とシナリオ別のおすすめをご覧ください
  </Card>

  <Card title="はじめに" icon="rocket" href="/ja/getting-started">
    APIYIアカウントを登録し、3分でキーを作成します
  </Card>

  <Card title="ベースURLの設定" icon="circle-question-mark" href="/ja/faq/base-url-config">
    各種ツールでAPIエンドポイントを正しく入力する方法を学びます
  </Card>

  <Card title="Cherry Studio" icon="cherry" href="/ja/scenarios/chat/cherry-studio">
    もう一つの高機能なデスクトップAIチャットクライアント
  </Card>
</CardGroup>

<Info>
  Obsidian Copilot オープンソースリポジトリ: `github.com/logancyang/obsidian-copilot`
</Info>
