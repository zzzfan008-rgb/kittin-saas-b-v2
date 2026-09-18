> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Codex

> 1つの設定、3つの利用先: Codex デスクトップアプリ、IDE拡張（VSCode/Cursor）、および CLI で、APIYI 経由で gpt-5.6-sol / gpt-5.5 / gpt-5.4 を使用します。推奨される方法は config.toml + auth.json で、環境変数をいじる必要はありません。

<Warning>
  **費用面を先に言うと**: 長いコンテキストのコーディング作業やエージェント的な深掘り探索では、**従量課金のAPI利用はクレジットをすぐに消費し、通常は公式サブスクリプションよりも割高になります**。

  Codex はプロジェクトのコンテキストを再読込し、ツールの出力を要約し、各ターンで反復します。単発の本格的なタスクでも、簡単に数十万 token に達します。これは実際に起きています。**1回の deep-research 実行が終わる前に、\$5分のクレジットが尽きた**のです。これは不具合ではなく、この種の作業における通常の消費ペースです。

  * **利用量が多く、公式サービスに直接アクセスできる**: 公式の ChatGPT Plus / Pro サブスクリプションを購入してください。これだけの利用強度なら、月額定額のほうが費用対効果が高いです。
  * **ネットワークでブロックされている、または使った分だけ支払いたい**: API のほうが適しています。プロキシ不要で直接アクセスでき、固定の月額料金もなく、維持すべき公式アカウントもなく、400+ モデルに対して 1つのキーで使えます。

  どちらかが絶対に優れているわけではありません。実際の利用状況とネットワーク環境で選んでください。ここで先にお伝えしているのは、請求額に驚かないようにするためです。
</Warning>

## 概要

<Info>
  **CodexとChatGPTアプリは統合されました**: 2026年7月上旬、OpenAIはCodexデスクトップアプリをChatGPTアプリに統合し、現在は1つの製品になっています。そのため、このガイドは**CodexアプリとChatGPTアプリの両方に適用されます**。ChatGPTアプリ内でCodexを使っている場合も、設定はまったく同じです。
</Info>

**OpenAI Codex** はOpenAIの公式AIコーディングアシスタントで、利用方法は3つあります。**デスクトップアプリ**、**IDE拡張機能**（VSCode / Cursor など）、そして**コマンドラインCLI**です。これら3つはすべて、`~/.codex/`（`config.toml` と `auth.json`）の下で**同じ設定**を共有します。

APIYIとの連携は、一言で言えば次のとおりです。

> **OpenAIのエンドポイントをAPIYIに置き換える**

APIYIは\*\*OpenAI互換のインターフェース（透過プロキシ）\*\*です。一度設定すれば、デスクトップアプリ、拡張機能、ターミナルのすべてで動作します。

<CardGroup cols={2}>
  <Card title="🔁 1つの設定、3つの画面" icon="layers">
    デスクトップ / 拡張機能 / CLI はすべて `~/.codex/` を共有します — 一度設定するだけです
  </Card>

  <Card title="⚡ 最新モデル" icon="sparkles">
    `gpt-5.6-sol` / `gpt-5.5` / `grok-4.5` に対応し、ほかのモデルにも対応しています
  </Card>

  <Card title="💰 従量課金" icon="calculator">
    OpenAIの公式APIと同じ課金モデルで、月額固定料金はありません
  </Card>

  <Card title="🪟 クロスプラットフォーム" icon="globe">
    Windows / Mac / Linux — すべて対応しています
  </Card>
</CardGroup>

<Info>
  **まず理解してください**: Codexを第三者のAPI（APIYIなど）に向けるための鍵は、`~/.codex/config.toml`で「model provider」をAPIYIに設定し、`~/.codex/auth.json`にKeyを入れることです。**デスクトップアプリとIDE拡張機能の両方がこれらのファイルに依存しています** — そのため、このガイドでは環境変数ではなく設定ファイルを先に扱います。
</Info>

## 1. 前提条件: APIYIキーを取得する

<Steps>
  <Step title="APIYIにサインアップ / ログインする">
    [api.apiyi.com](https://api.apiyi.com) にアクセスして、登録またはサインインします。
  </Step>

  <Step title="API Keyを作成する">
    「Token Management」ページ ([api.apiyi.com/token](https://api.apiyi.com/token)) を開き、「Create New Token」をクリックします。
  </Step>

  <Step title="キーをコピーする">
    生成されたAPI Key（形式: `sk-***`）をコピーし、安全に保管してください。設定ファイルに貼り付けます。
  </Step>
</Steps>

### 使用する画面を選ぶ

3つの画面はすべて**まったく同じ設定**を使います。ワークフローに合うものを選んでください。

<CardGroup cols={3}>
  <Card title="🖥️ デスクトップアプリ" icon="monitor">
    単体アプリで、そのまま使えます。**初心者に最適**です
  </Card>

  <Card title="🧩 IDE拡張機能" icon="puzzle">
    VSCode / Cursor の拡張機能で、コードと並行して使えます
  </Card>

  <Card title="⌨️ CLI" icon="terminal">
    ターミナルでのワークフロー。スクリプトや自動化に最適です
  </Card>
</CardGroup>

## 2. コア設定（推奨: 設定ファイル、環境変数ではありません）

以下の3つの方法があります — **1つだけ選んでください**。推奨順は、設定ファイルを手書きする（最も信頼性が高い）→ ビジュアル設定 → 環境変数 です。

### オプション 1 · `auth.json` + `config.toml` を手動で記述（推奨、最も信頼性が高い）

Codex の設定ディレクトリを開き（なければ作成し）、その中に2つのファイルを追加/編集します。

<Tabs>
  <Tab title="🪟 Windows">
    設定ディレクトリ: `%USERPROFILE%\.codex\`（つまり `C:\Users\YourName\.codex\` です）。

    ファイル エクスプローラーで開いてください。
  </Tab>

  <Tab title="Mac / Linux">
    設定ディレクトリ: `~/.codex/`。

    ターミナルで `mkdir -p ~/.codex` を実行して、その場所に移動します。
  </Tab>
</Tabs>

<Warning>
  **`config.toml` がすでに存在する場合、全体を上書きしないでください！** そこには、以前のモデル設定、承認ポリシー、MCP サーバーなどがすでに入っている可能性があります。正しい方法は、**まずバックアップし、その後でマージする** ことです（下の「既存の config.toml を安全に編集する方法」を参照） — APIYI に必要な少数の行だけを追加してください。`auth.json` も同様で、存在する場合は `OPENAI_API_KEY` の値だけを更新してください。
</Warning>

**1) `auth.json` — ここにキーを入れてください:**

```json theme={null}
{
  "OPENAI_API_KEY": "sk-your-APIYI-key"
}
```

**2) `config.toml` — モデル プロバイダを APIYI に向ける:**

**新規ファイル** なら、下の内容をそのまま貼り付けてください。**既存ファイル** なら、「global keys」を**最上部**に追加し、`[model_providers.apiyi]` ブロックを**最下部**に追加してください（理由は下のヒントを参照）。

```toml theme={null}
# === Global (put at the very top of the file) ===
model = "gpt-5.4"                 # default model, change to gpt-5.5 etc. as needed
model_provider = "apiyi"          # use the apiyi provider defined below
preferred_auth_method = "apikey"  # authenticate with API Key (not chatgpt login)

# === APIYI provider definition (put at the very bottom) ===
[model_providers.apiyi]
name = "apiyi"
base_url = "https://api.apiyi.com/v1"
experimental_bearer_token = "sk-your-APIYI-key"
wire_api = "responses"
```

<Warning>
  保存する前に、**`sk-your-APIYI-key` を実際のキーに置き換えてください**（`sk-` の文字列を `api.apiyi.com/token` からコピーしたものです）。キーは両方のファイルで一致している必要があります。
</Warning>

<Accordion title="既存の config.toml を安全に編集する方法（バックアップ + マージのベストプラクティス）">
  **ステップ 1: まずバックアップします。** 設定を変更する前に、元のファイルをコピーしておけば、いつでも復元できます:

  ```bash theme={null}
  # Mac / Linux
  cp ~/.codex/config.toml ~/.codex/config.toml.bak

  # Windows PowerShell
  Copy-Item $env:USERPROFILE\.codex\config.toml $env:USERPROFILE\.codex\config.toml.bak
  ```

  **ステップ 2: 上書きせず、マージします。** APIYI に必要な内容だけを既存ファイルに追加してください。`model` / `model_provider` / `preferred_auth_method` の行は**最上部**に入れ、`[model_providers.apiyi]` ブロックは**最下部**に追加します。それ以外はそのままにしてください。

  <Warning>
    **TOML の順序で注意する点**: TOML では、すべての「ベアなキー=値ペア」（`model = "..."` のようなもの）は、任意の `[xxx]` テーブルヘッダーより**前に**配置する必要があります。そうしないと、直前のテーブルに取り込まれてしまいます。したがって、グローバルキーを上部に置き、`[model_providers.apiyi]` を下部に置く構成が、最もミスが起きにくいレイアウトです。
  </Warning>

  **ステップ 3: メインの設定を触らずに試したいだけですか？** プロファイルを使ってください。上の内容で `~/.codex/apiyi.config.toml` を作成し、次に `codex --profile apiyi` を実行します — 完全に分離されています（[Advanced](#6-advanced-configuration) を参照）。
</Accordion>

<Note>
  **補足**:

  * `base_url`: 常に `https://api.apiyi.com/v1` です — そこには **`/v1` が必須** で、ないと 404 になります。
  * `experimental_bearer_token`: キーをプロバイダ ブロックに直接入れ、Bearer token として送信します。**これは、デスクトップアプリ、IDE 拡張機能、CLI のすべてで確実に動作する唯一の形式です** — 環境変数は使いません。
  * プロバイダの認証フィールドは**排他的です。1つだけ選んでください**: `experimental_bearer_token`（キーを設定ファイルに入れる、推奨） / `env_key`（**起動したプロセスの環境変数** からキーを読み取る — なお、`auth.json` にフォールバックしない点に注意してください。また、デスクトップアプリはターミナルで export した変数を参照できません） / `requires_openai_auth`（`auth.json` の公式ログイン状態を再利用する）。このガイドの古い版で `env_key` + `requires_openai_auth` を組み合わせていた場合は、現在の形式に切り替えてください。
  * `wire_api = "responses"`: Codex のデフォルトかつ推奨のプロトコルで、APIYI がサポートしています。特定のモデルが 404 / unknown endpoint を返す場合は、フォールバックとして `"chat"` に切り替えてください（[Advanced](#6-advanced-configuration) を参照）。
  * このファイルに `C:\Users\xxx\.codex\...` のような絶対パスをハードコードしないでください — マシン間で壊れます。
</Note>

### オプション 2 · cc-switch のビジュアル設定（GUI、手動編集なし）

手でファイルを編集したくない場合は、**CC Switch** を使ってください。数回クリックするだけで、APIYI の URL、Key、モデルを Codex の設定に書き込みます。Claude Code、Codex、Gemini CLI なども1か所で管理でき、ワンクリックで切り替えられます。上記のバックアップ/マージも自動でやってくれるので、初心者にはまずおすすめです。

[CC Switch ビジュアル設定](/ja/scenarios/programming/cc-switch) を参照してください。設定後は、Codex のデスクトップアプリ / 拡張機能 / CLI が自動的に設定を読み込みます。

### オプション 3 · 環境変数（任意、少し面倒、推奨しません）

<Accordion title="すぐにターミナルでテストしたいだけですか？ 環境変数方式を展開してください（長期利用には不向きです）">
  Codex CLI は `OPENAI_BASE_URL` / `OPENAI_API_KEY` の環境変数も読み取れます:

  ```bash theme={null}
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  export OPENAI_API_KEY="sk-your-APIYI-key"
  ```

  <Warning>
    **主要な方法としては推奨しません**: 環境変数は最近の Codex ビルドでは反映されないことが多く、**デスクトップアプリ / IDE 拡張機能は読み取りません** — それらが認識するのは `config.toml` + `auth.json` だけです。環境変数は、短時間の CLI テスト用途に限って使ってください。長期利用には、オプション 1 かオプション 2 を推奨します。
  </Warning>
</Accordion>

## 3. 各画面の使い方（デスクトップ優先）

`~/.codex/` をセットアップしたら、以下のいずれかの画面を選んでください。**設定を変更したらプログラムを再起動してください**（Codex は起動時にのみ設定を読み込みます）。

### 1. Codex デスクトップアプリ（最もおすすめ）

1. Codex デスクトップアプリをインストールして開きます。
2. 初回起動時に認証方法を選びます。**apikey を選択**してください（ChatGPT のログインではありません）。
3. モデル / プロバイダー選択で、`apiyi` プロバイダーと対象モデル（例: `gpt-5.4`）を選択します。
4. 反映するために**アプリを再起動**します。
5. 最小限のタスクを実行して確認します（[4章](#4-minimal-verification) を参照）。

### 2. IDE 拡張機能（VSCode / Cursor）

1. 拡張機能マーケットプレイスを開き（VSCode では `Ctrl+Shift+X` / `Cmd+Shift+X` を押します）、`Codex — OpenAI's coding agent` を検索して `Install` をクリックします。
2. インストール後、サイドバーに Codex アイコンが表示されるので、クリックしてパネルを開きます。
3. 初回オープン時に 3 つのプロンプトに答えます。① 認証方法 — **apikey を選択**; ② キーの取得元 — 「設定ファイル / 環境変数」を選択; ③ `AGENTS.md` を有効にする（推奨）。
4. 反映するために**エディターを再起動**します。
5. Codex パネルで最小限のタスクを実行して確認します。

### 3. CLI

公式 CLI をグローバルにインストールします（Node.js 18+ が必要です）:

```bash theme={null}
npm install -g @openai/codex
codex --version
```

プロジェクトに移動して起動するか、単発タスクを実行します:

```bash theme={null}
cd /your/project
codex                                  # interactive mode
codex "write a Python HTTP server"     # pass a task directly
codex -q "fix the build errors"        # non-interactive / silent mode
```

<Tip>
  グローバルインストールの権限エラーに遭遇する Mac ユーザーは、nvm / fnm を使って Node を管理し、`sudo` を避けてください。
</Tip>

## 4. 最小限の確認

設定して再起動した後、任意の画面で最小限のタスクを入力してください:

```text theme={null}
Create a hello endpoint in this project and include a usage example.
```

CLIユーザーは次のコマンドも実行できます:

```bash theme={null}
codex -q "hello"
```

実行可能なコードが返ってくれば、APIYI の連携は正常に動作しています。

## 5. Models (APIYI Recommendations)

これらを `config.toml` の `model` フィールドに設定するか、実行時に切り替えます:

| Model                | Strengths                                | Best For                                     |
| -------------------- | ---------------------------------------- | -------------------------------------------- |
| **`gpt-5.6-sol`**    | 5.6のフラッグシップ（2026年7月9日リリース）               | 最難関の課題: 複雑なコーディング、深いエンジニアリング分析、エージェントワークフロー  |
| **`gpt-5.6-terra`**  | 5.6のバランス型                                | 大量のビジネス業務、性能とコストの両立                          |
| **`gpt-5.6-luna`**   | 5.6の高速・低コスト枠                             | 要約、下書き、定型自動化 — 高速で安価                         |
| **`gpt-5.5`**        | 前世代のフラッグシップ                              | 複雑なコーディング、エンジニアリング分析、エージェントワークフロー            |
| **`gpt-5.4`**        | 安定した主力モデル                                | ほとんどのコーディング、デバッグ、リファクタリング（既定の選択）             |
| **`gpt-5.4-mini`**   | 低コストの5.4派生モデル                            | 中規模タスク、バッチ処理、コスト削減                           |
| **`grok-4.5`**       | xAIのフラッグシップ、**ネイティブの responses プロトコル対応** | コーディングエージェント、複雑なタスク — OpenAI のラインナップ外では最有力候補 |
| **`grok-build-0.1`** | Grokのコード特化モデル、シリーズ最安                     | 高頻度のコード補完、軽めのコーディングタスク                       |

<Tip>
  **選び方**: 日常 → `gpt-5.4` または `gpt-5.6-terra`; 重い作業 / エージェント → `gpt-5.6-sol`（または `gpt-5.5`）; コスト重視 → `gpt-5.6-luna` / `gpt-5.4-mini`; OpenAI 以外で気分を変えたい → `grok-4.5`。
</Tip>

<Note>
  **Grok が特別に言及される理由**: xAI の公式 API 自体が、OpenAI 互換のデュアルエンドポイント API（Chat Completions + Responses API）であり、Grok は**ネイティブの `/v1/responses` プロトコル対応を備えた珍しい非 OpenAI モデル**です。Codex では `wire_api = "responses"` をそのままにして、`model` を `grok-4.5` に切り替えるだけで使えます。Codex のエージェント機能（tool calls、reasoning items など）はすべてネイティブプロトコル上で動作します。responses エンドポイントは APIYI で `grok-4.5` により検証済みです。その他の Grok モデルも同じアーキテクチャを共有しており、同様に動作すると期待されています。404 を返す場合は、[Section 6](#6-advanced-configuration) のフォールバックを使ってください。[Grok API Guide](/ja/api-capabilities/grok/overview) もご覧ください。

  **Claude / Gemini と比較すると**: APIYI ではこの 2 つは**OpenAI 互換のチャットモードでのみ動作し、responses エンドポイントはありません**。そのため、Codex では `wire_api = "chat"` にフォールバックする必要があります。Codex のエージェントシナリオは responses プロトコルを前提に設計されているため、チャットモードでは tool calling の不整合や体験の低下が発生することがあります。Claude / Gemini でコーディングする場合は、代わりにそれぞれのネイティブツール（[Claude Code](/ja/scenarios/programming/claude-code) / [Gemini CLI](/ja/scenarios/programming/gemini-cli)）を使ってください。
</Note>

<Note>
  **その他の OpenAI 互換モデルも利用できます**: APIYI は多くのモデルを集約しており、OpenAI 互換の呼び出しをサポートするモデルなら Codex で使えます。たとえば Zhipu の `glm-5.2` です。`config.toml` の `model` フィールドを、対象のモデル ID に変更するだけです（または実行時に `-m`）。
</Note>

### 4 Ways to Switch Models

**① 起動時に指定**（CLI）:

```bash theme={null}
codex -m gpt-5.5
codex --model gpt-5.4 "review this project's structure"
```

**② 非対話モードで指定**（CLI）:

```bash theme={null}
codex -q -m gpt-5.4 "fix the build errors in this project"
```

**③ セッション内で切り替え**: 対話パネルで `/model` と入力し、プロンプトに従ってください。

**④ 既定モデルを設定する（永続的）**: `~/.codex/config.toml` を編集し、`model` を変更して保存し、再起動します:

```toml theme={null}
model = "gpt-5.5"
```

## 6. 詳細設定

<AccordionGroup>
  <Accordion title="カスタムシステムプロンプト（instructions.md）">
    `~/.codex/instructions.md` を編集して、コーディングスタイル、出力言語、プロジェクトの規約を定義します。例：

    ```markdown theme={null}
    - Write code comments in English
    - Follow the project's ESLint config
    - Provide detailed explanations
    ```
  </Accordion>

  <Accordion title="プロジェクトレベルの AGENTS.md">
    プロジェクト内で `codex /init` を実行して、構成と規約を記録する `AGENTS.md` を生成します。Codex が既定で特定の言語で応答するようにするには、次を追加します：

    ```markdown theme={null}
    Always respond to the user in English for this project.
    ```
  </Accordion>

  <Accordion title="フォールバックのプロトコル: wire_api を chat に切り替える">
    `wire_api = "responses"` は Codex のデフォルトかつ推奨プロトコルで、ほとんどのモデルはそのまま動作します。モデルが 404 / unknown endpoint を返す場合は、そのプロバイダの `wire_api` を `"chat"` に変更し（`/chat/completions` を使用します）、再試行してください。
  </Accordion>

  <Accordion title="複数の設定（プロファイル）">
    `<name>.config.toml` を `~/.codex/` の下に作成し（たとえば、公式セットアップでは `openai.config.toml` を使用します）、その後は実行時に `codex --profile <name>` で切り替えます。APIYI と他のプロバイダを行き来するのに便利です。
  </Accordion>

  <Accordion title="よく使うフラグ">
    ```bash theme={null}
    codex -h          # full help
    codex -m <model>  # specify model
    codex -q          # non-interactive / silent mode
    codex --full-auto # auto-execute (use cautiously)
    ```
  </Accordion>
</AccordionGroup>

## 7. トラブルシューティング

<AccordionGroup>
  <Accordion title="1. 環境変数が見つからない: OPENAI_API_KEY（デスクトップアプリ / 拡張機能で最もよくある）">
    `auth.json` + `config.toml` を正しく設定してアプリを再起動したのに、それでも `Missing environment variable: OPENAI_API_KEY` と表示される場合、原因はプロバイダーブロック内の `env_key = "OPENAI_API_KEY"` です（このガイドの古い版で使われていた形式です）。

    `env_key` は、**Codex を起動したプロセスの環境変数から Key を読み取る** ことを意味します。`auth.json` にフォールバックすることは **ありません**（こちらは OpenAI の公式ログイン状態にのみ使われます）。また、デスクトップアプリ / IDE を Dock やランチャーから起動した場合、**ターミナルで export した変数は継承されません**（`export` の `.zshrc` は GUI アプリには影響しません）ので、何度再起動しても変数は表示されません。

    **修正方法（推奨）**: `~/.codex/config.toml` を編集し、プロバイダーブロックから `env_key` を削除し（`requires_openai_auth` があればそれも削除し）、Key を設定ファイルに直接記述します:

    ```toml theme={null}
    [model_providers.apiyi]
    name = "apiyi"
    base_url = "https://api.apiyi.com/v1"
    experimental_bearer_token = "sk-your-APIYI-key"
    wire_api = "responses"
    ```

    その後、アプリを**再起動**します。

    **代替案**（どうしても `env_key` を使いたい場合）: 変数をシステム全体で設定します。macOS では `launchctl setenv OPENAI_API_KEY "sk-your-key"` を実行してからアプリを再起動してください（再起動後は再実行が必要です）。Windows では `setx OPENAI_API_KEY "sk-your-key"` を実行してからアプリを再起動してください。CLI のみで使う場合は、シェルプロファイルに `export` を入れれば十分です。
  </Accordion>

  <Accordion title="2. auth.json / config.toml のパスと内容を確認する">
    * `auth.json` は有効な JSON である必要があり、`OPENAI_API_KEY` には実際の `sk-` Key が設定されていなければなりません。
    * `config.toml` は有効な TOML として解釈できる必要があります（引用符とインデントに注意してください）。
    * パス: Windows は `%USERPROFILE%\.codex\`、Mac/Linux は `~/.codex/` です。
  </Accordion>

  <Accordion title="3. Key が有効で、利用可能なクレジットがあることを確認する">
    APIYI コンソールで、Key が期限切れになっていないことと、アカウントに残高 / クォータがあることを確認してください。
  </Accordion>

  <Accordion title="4. base_url に /v1 が含まれていることを確認する">
    最も多い接続エラー / タイムアウト / 404 の原因は、`/v1` がないことです。正しい例: `https://api.apiyi.com/v1`。その後、ローカルプロキシと DNS を確認してください。
  </Accordion>

  <Accordion title="5. 設定変更のたびに再起動する">
    Codex（CLI / extension / desktop app）は起動時にのみ config を読み込みます。**`auth.json` / `config.toml` を編集した後は、必ずプログラムを再起動してください。**
  </Accordion>

  <Accordion title="6. まだ不安定な場合: wire_api を chat に切り替える">
    あるモデルが `responses` プロトコルと互換性がない場合は、そのプロバイダーの `wire_api` を `"chat"` に変更して再試行してください。
  </Accordion>
</AccordionGroup>

## 8. よくある質問

<AccordionGroup>
  <Accordion title="なぜ Codex は APIYI で動作するのですか？">
    APIYI は **OpenAI API プロトコルと完全に互換性がある** ためです。`https://api.apiyi.com/v1` と `https://api.openai.com/v1` は、リクエスト/レスポンス形式で互換に使えます。Base URL を差し替えるだけで十分です。
  </Accordion>

  <Accordion title="なぜ、単純な hello で数万の input token を消費するのですか？">
    これは通常 **想定どおり** です。起動時に Codex は初期化のため現在のプロジェクトからいくつかのファイルを読み込み（ディレクトリ構成、`AGENTS.md`、関連ソース）、それらを prompt と一緒にコンテキストとして送信します。そのため、1語だけの `hello` でも数千の input token がかかることがあります。

    **どう減らしますか？**

    * 最小限のタスクは **空のディレクトリ** か **非常に小さなプロジェクト** で試し、コンテキストを小さく保ってください。
    * 具体的で小さなタスクを指定し、対象ファイルを正確に名前で挙げてください（たとえば「`app.py` だけを見て、hello エンドポイントを追加して」）と伝えることで、Codex がスキャンする範囲を絞れます。
    * こうした使い捨ての確認には、より安価なモデル（例: `gpt-5.4-mini`）を使ってください。
  </Accordion>

  <Accordion title="`command not found: codex`">
    インストールを確認してください:

    ```bash theme={null}
    npm install -g @openai/codex
    codex --version
    ```

    それでも失敗する場合は、`npm bin -g` があなたの `PATH` にあるか確認してください。
  </Accordion>

  <Accordion title="無効な API Key (401 / Invalid Key)">
    1. OpenAI key ではなく、`sk-` で始まる **APIYI Key** を使用していることを確認してください。
    2. `auth.json` の Key が正しく、余計なスペースが入っていないことを確認してください。
    3. config を変更した後は、**再起動** してください。
  </Accordion>

  <Accordion title="接続エラー / タイムアウト / 404">
    最も多い原因は、**Base URL に `/v1` がないこと** です。正しい例: `https://api.apiyi.com/v1`。そのあと、ローカル proxy と DNS を確認してください。
  </Accordion>

  <Accordion title="どのモデルがサポートされていますか？">
    * **OpenAI シリーズ**: ✅ 完全対応（推奨 `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4`）。
    * **Grok シリーズ**: ✅ ネイティブな responses protocol 対応 — `grok-4.5` は `wire_api` を触らずに動作します。詳細は [Grok API Guide](/ja/api-capabilities/grok/overview) を参照してください。
    * **その他の OpenAI 互換モデル**: APIYI でサポートされています。たとえば `glm-5.2` です。`model` フィールドを変更するだけです。
    * 注: **APIYI 上の Claude / Gemini は OpenAI 互換の chat モードのみを提供し、responses endpoint はありません**。そのため Codex では `wire_api` を `"chat"` に切り替える必要があり、tool calling などの agent の挙動で互換性の問題が発生することがあります。Claude / Gemini ベースのコーディングには、各ネイティブツール（例: Claude Code / Gemini CLI）を使ってください。
  </Accordion>

  <Accordion title="デスクトップアプリ / 拡張機能が動作しませんか？">
    デスクトップアプリと IDE 拡張機能は **`~/.codex/config.toml` + `auth.json` だけを読み込み、環境変数は読みません**。この 2 つのファイルが正しいこと、認証方法が **apikey** に設定されていること、そして **再起動** することを確認してください。
  </Accordion>

  <Accordion title="本番環境に適していますか？">
    * **CLI / アプリ**: 開発時の生産性向上に最適です。
    * **本番環境**: 直接 API 呼び出しを優先してください（より細かな制御、監視、段階的なロールアウトが可能です）。
  </Accordion>

  <Accordion title="APIYI の設定をアンインストールまたは無効化するにはどうすればよいですか？">
    **CLI をアンインストールする**:

    ```bash theme={null}
    npm uninstall -g @openai/codex
    ```

    **APIYI config を無効化する**: `~/.codex/config.toml` と `auth.json` を削除するか元に戻してください（デスクトップアプリ / 拡張機能については、それぞれの UI で管理します）。
  </Accordion>
</AccordionGroup>

## 9. 概要

統合全体は一文で表せます。

> **OpenAI のエンドポイントを APIYI に置き換える**

核心は `~/.codex/` を一度だけ設定することです。Key を `auth.json` に入れ、`base_url` を `https://api.apiyi.com/v1` に向けて `config.toml` で指定します。その後は、**デスクトップアプリ、IDE 拡張、CLI のすべてが動作します**。それ以外のこと — モデルの選択、プロンプト、`instructions.md`、`AGENTS.md` — はすべて仕上げにすぎません。

## 関連リソース

<CardGroup cols={2}>
  <Card title="APIYI コンソール" icon="settings" href="https://api.apiyi.com">
    APIキーを管理し、使用状況を確認します
  </Card>

  <Card title="CC Switch ビジュアル設定" icon="toggle-left" href="/ja/scenarios/programming/cc-switch">
    Codex / Claude Code向けのGUIワンクリック設定
  </Card>

  <Card title="Claude Code 連携" icon="bot" href="/ja/scenarios/programming/claude-code">
    ClaudeモデルをCLIコーディングに使用します
  </Card>

  <Card title="モデル比較" icon="chart-bar" href="/ja/api-capabilities/model-info">
    利用可能なすべてのモデルと料金
  </Card>
</CardGroup>
