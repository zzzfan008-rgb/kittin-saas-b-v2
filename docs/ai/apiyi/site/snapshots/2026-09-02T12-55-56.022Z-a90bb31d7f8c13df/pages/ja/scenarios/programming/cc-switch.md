> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CC Switch

> Claude Code と他の 4 つの AI CLI ツールを一元管理する統合デスクトップアプリ — ワンクリックでプロバイダー切り替え、モデル設定などが可能です

## 概要

CC Switch は Tauri 2 で構築されたデスクトップアプリケーションで、Claude Code、Codex CLI、Gemini CLI、OpenCode、OpenClaw の 5 つの AI CLI ツールの管理を統合します。設定ファイルを手動で編集する必要はもうありません。グラフィカルインターフェースから API プロバイダー、モデル、キーを切り替えられます。

APIYI をプロバイダーとして設定すると、次の利点があります:

<CardGroup cols={2}>
  <Card title="🚀 ワンクリック切り替え" icon="toggle-right">
    すべての CLI ツールの設定を GUI で管理でき、手動編集は不要です
  </Card>

  <Card title="💰 88% 価格" icon="piggy-bank">
    ClaudeCode グループで token を作成すると、88% 価格で利用できます
  </Card>

  <Card title="📊 利用状況の追跡" icon="chart-line">
    リアルタイムの支出、リクエスト、token 追跡を行える組み込みの利用ダッシュボード
  </Card>

  <Card title="🔄 スマートフェイルオーバー" icon="shield">
    ホットスイッチング、自動フェイルオーバー、サーキットブレーカーを備えたローカルプロキシ
  </Card>
</CardGroup>

<Info>
  **プロジェクト情報**

  * 🔗 リポジトリ: `github.com/farion1231/cc-switch`
  * 📜 ライセンス: MIT
  * 👤 作者: Jason Young (farion1231)
  * 🏷️ 最新バージョン: v3.12.0
</Info>

## コア機能

### プロバイダー管理

* AWS Bedrock や NVIDIA NIM を含む 50+ の組み込みプリセット
* ワンクリック切り替え、ドラッグ＆ドロップによる並べ替え、インポート/エクスポート
* システムトレイからのすばやいアクセス

### MCP サーバー管理

* すべての CLI ツールにまたがる統一された MCP サーバー設定
* 双方向同期 — 変更はすべてのアプリケーションに反映されます

### その他の機能

* **Prompt管理**: Markdown エディタ + アプリ間同期
* **スキルのインストール**: GitHub リポジトリまたは ZIP ファイルからスキルをインストール
* **セッションブラウザ**: 会話履歴を表示して復元
* **クラウド同期**: Dropbox、OneDrive、iCloud、WebDAV をサポート
* **ディープリンク**: ワンクリック設定インポート用の `ccswitch://` プロトコル

## クイックスタート

### ステップ 1: CC Switch をインストールする

<Tabs>
  <Tab title="macOS">
    Homebrew でインストールします:

    ```bash theme={null}
    brew install --cask cc-switch
    ```

    または GitHub Releases から DMG インストーラーをダウンロードしてください。
  </Tab>

  <Tab title="Windows">
    GitHub Releases から MSI インストーラーまたは Portable ZIP をダウンロードしてください。
  </Tab>

  <Tab title="Linux">
    ご利用のディストリビューションに合ったインストール方法を選んでください:

    ```bash theme={null}
    # Debian/Ubuntu
    sudo dpkg -i cc-switch_*.deb

    # Fedora/RHEL
    sudo rpm -i cc-switch_*.rpm

    # Arch Linux
    paru -S cc-switch-bin
    ```

    AppImage と Flatpak も利用できます。
  </Tab>
</Tabs>

<Info>
  **システム要件**: Windows 10 以降、macOS 10.15 (Catalina) 以降、Ubuntu 22.04 以降 / Debian 11 以降 / Fedora 34 以降
</Info>

### ステップ 2: APIYI の API Key を取得する

1. [APIYI コンソール - トークンページ](https://api.apiyi.com/token) を開きます
2. クリックして新しい token を作成します
3. **重要**: **88% 割引** を適用するには、**【ClaudeCode】グループ** を選択します
4. 生成されたキーをコピーします（先頭は `sk-` です）

<Tip>
  **節約のコツ**: token を作成するときは、【ClaudeCode】グループを選択して 88% 割引価格を適用してください。
</Tip>

### ステップ 3: CC Switch で APIYI を設定する

1. CC Switch を開きます
2. **Provider** 管理ページに移動し、追加をクリックして「カスタム ゲートウェイ」を選択します:

<img src="https://mintcdn.com/apiyillc/9frKyyBXrVY4n9Yi/images/cc-switch-provider-config.png?fit=max&auto=format&n=9frKyyBXrVY4n9Yi&q=85&s=bea7dc157f751d1a530f486664b15791" alt="CC Switch プロバイダー設定 - APIYI を統合プロバイダーとして追加" width="1628" height="1522" data-path="images/cc-switch-provider-config.png" />

3. 上記のとおり、以下の情報を入力します:
   * **Name**: `APIYI`
   * **API Address**: `https://api.apiyi.com`
   * **API Key**: 以前の手順で取得したキーを貼り付けます
   * **Enabled Apps**: Claude Code を有効にします（必要に応じて他も有効化してください）
4. 「Add」をクリックして設定を保存します

### ステップ 4: モデルを追加する

Provider の設定に以下のモデルを追加します:

**標準モデル**:

| モデル名              | モデル ID                      | 説明                       |
| ----------------- | --------------------------- | ------------------------ |
| Claude Opus 4.6   | `claude-opus-4-6`           | 最上位のフラッグシップで、複雑なタスクに最適です |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`         | コーディング性能が高く、コスパに優れます     |
| Claude Haiku 4.5  | `claude-haiku-4-5-20251001` | 軽量で高速、シンプルなタスク向けです       |

**推論モデル**（強制思考連鎖）:

| モデル名                       | モデル ID                               | 説明                           |
| -------------------------- | ------------------------------------ | ---------------------------- |
| Claude Opus 4.6 Thinking   | `claude-opus-4-6-thinking`           | 深い推論と複雑なロジック解析に適しています        |
| Claude Sonnet 4.6 Thinking | `claude-sonnet-4-6-thinking`         | 推論強化のコーディングに適した、バランスのよいモデルです |
| Claude Haiku 4.5 Thinking  | `claude-haiku-4-5-20251001-thinking` | 軽量な推論で、素早い思考に向いています          |

<Tip>
  **モデル選択のヒント**: 日常的なコーディングには `claude-sonnet-4-6`、複雑なアーキテクチャ設計には `claude-opus-4-6`、素早い Q\&A には `claude-haiku-4-5-20251001` を使ってください。深い推論が必要な場合は thinking 版を使います。
</Tip>

### ステップ 5: ワンクリックスイッチ

設定が完了したら、CC Switch で APIYI をアクティブな Provider として選択します。連携済みの CLI ツール（Claude Code、Codex CLI など）はすべて、自動的に APIYI の設定に切り替わります。

## 使用ガイド

### 複数の CLI ツールの管理

CC Switch は、次の 5 つの AI CLI ツールを同時に管理できます。

* **Claude Code** — Anthropic の公式 CLI プログラミングアシスタント
* **Codex CLI** — OpenAI のコマンドラインプログラミングツール
* **Gemini CLI** — Google のコマンドライン AI アシスタント
* **OpenCode** — オープンソースの CLI プログラミングツール
* **OpenClaw** — オープンソースのローカル AI エージェント

すべてのツールで Provider 設定を共有します。一度切り替えれば、どこでも適用されます。

### ローカルプロキシ

CC Switch には、次の機能を備えた組み込みのローカルプロキシサーバーが含まれています。

* **ホットスイッチ**: 再起動せずにプロバイダーを切り替えます
* **自動フェイルオーバー**: 現在のプロバイダーが停止した場合に、自動的にバックアップへ切り替えます
* **サーキットブレーカー**: 連続した失敗時にリクエストを停止し、リソースの無駄を防ぎます

### 設定のバックアップ

* 自動バックアップシステムにより、最新 10 バージョンを保持します
* 完全な設定のインポート／エクスポート
* Dropbox、OneDrive、iCloud、WebDAV を介したクラウド同期

## モデルのおすすめ

<Card title="プログラミングモデルのおすすめをもっと見る" icon="star" href="/ja/api-capabilities/model-info">
  Claudeシリーズに加えて、APIYIは400以上の主要なAIモデルをサポートしています。プログラミングモデルのおすすめ、性能比較、シナリオ別の提案をぜひご確認ください。
</Card>

## FAQ

<AccordionGroup>
  <Accordion title="CC Switch はどのオペレーティングシステムをサポートしていますか？">
    Windows 10+、macOS 10.15 (Catalina)+、および主要な Linux ディストリビューション（Ubuntu 22.04+、Debian 11+、Fedora 34+、Arch Linux）。
  </Accordion>

  <Accordion title="グループ割引価格はどうすれば適用できますか？">
    一部のグループ（例: ClaudeCode グループ）では、[APIYI コンソール](https://api.apiyi.com/token)で token を作成すると割引価格が適用されます。現在のレートはコンソールで確認してください。これをチャージボーナスと組み合わせると、実質コストをさらに下げられます。
  </Accordion>

  <Accordion title="設定後に Claude Code に接続できませんか？">
    次を確認してください:

    1. API Key が正しいこと（`sk-`で始まる）
    2. ベース URL が `https://api.apiyi.com` に設定されていること
    3. APIYI アカウントの残高が十分であること
    4. CC Switch が設定を Claude Code に同期済みであること
  </Accordion>

  <Accordion title="標準モデルと Thinking モデルの違いは何ですか？">
    Thinking（reasoning）モデルは chain-of-thought モードを強制し、応答前に深い推論分析を行います。複雑なロジック、アーキテクチャ設計、深い思考が必要なシナリオに最適です。標準モデルは応答が速く、日常のコーディングや簡単なタスクに適しています。
  </Accordion>

  <Accordion title="他の設定方法から CC Switch に移行するにはどうすればよいですか？">
    CC Switch はインポート機能をサポートしており、既存の環境変数や設定ファイルを自動検出できます。インストール後にアプリを開くと、インストール済みの CLI ツールとその既存の設定を自動検出します。
  </Accordion>

  <Accordion title="CC Switch は無料ですか？">
    CC Switch 自体は完全に無料で、オープンソースです（MIT License）。料金が発生するのは API 呼び出しのみです。APIYI 経由で ClaudeCode グループを使うと、88% 割引価格になります。
  </Accordion>
</AccordionGroup>

## ベストプラクティス

<Tip>
  **効率的な利用のコツ**:

  1. **適切なグループで token を作成する**: 88% 割引のために、常に【ClaudeCode】グループを選択してください
  2. **ホットスイッチングを活用する**: タスク間でプロバイダーやモデルをすばやく切り替えます
  3. **自動フェイルオーバーを有効にする**: サービス継続性のために、複数のプロバイダーをバックアップとして設定します
  4. **定期的にバックアップする**: クラウド同期を使って設定を定期的にバックアップします
</Tip>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Claude Code 設定" icon="terminal" href="/ja/scenarios/programming/claude-code">
    詳細な Claude Code の設定チュートリアル
  </Card>

  <Card title="モデルの推奨事項" icon="bot" href="/ja/api-capabilities/model-info">
    最新の AI モデルの推奨事項
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://api.apiyi.com">
    API キーを管理し、使用状況を確認します
  </Card>

  <Card title="その他のプログラミングツール" icon="code" href="/ja/scenarios/programming/cursor">
    Cursor などの他のツールを探します
  </Card>
</CardGroup>
