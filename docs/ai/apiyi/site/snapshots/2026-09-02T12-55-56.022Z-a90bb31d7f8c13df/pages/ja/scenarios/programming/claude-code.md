> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code

> Claude の公式コマンドライン・プログラミングアシスタントで、安定的かつ効率的な AI プログラミング体験のために APIYI で設定されています

<Warning>
  **コスト面を先に言うと**: 長文コンテキストのコーディング作業やエージェント型の深い探索では、**従量課金のAPI利用はcreditをすぐに消費し、通常は公式サブスクリプションよりも割高になります**。

  コーディングエージェントはプロジェクトのコンテキストを読み直し、ツール出力を消化し、ターンごとに反復します — 1つの本格的なタスクだけで、簡単に数十万tokensに達します。これは実際に起きています: **\$5分のcreditが、1回のdeep-research実行が終わる前に尽きました**。これは欠陥ではなく、この種の作業では普通の消費ペースです。

  * **利用頻度が高く、公式サービスに直接アクセスできる場合**: 公式のClaude Pro / Maxサブスクリプションを購入してください — その程度の利用量なら、月額定額のほうが割安です。
  * **ネットワークによりブロックされている場合、または使った分だけ支払いたいだけの場合**: APIのほうが向いています — プロキシなしの直接アクセス、固定月額料金なし、維持すべき公式アカウントなし、そして400以上のモデルに使える1つのキーです。

  どちらか一方が絶対に優れているわけではありません。実際の利用状況とネットワーク環境に応じて選んでください。課金で想定外が起きないよう、先にお伝えしています。
</Warning>

## 概要

Claude Code は Anthropic の公式コマンドライン・プログラミングアシスタントで、Claude の強力なプログラミング機能をターミナルから直接利用できます。APIYI サービスを設定すると、次のメリットがあります:

<CardGroup cols={2}>
  <Card title="🚀 安定した接続" icon="wifi">
    プロキシ不要の直接接続で、ネットワークの不安定さがありません
  </Card>

  <Card title="💳 従量課金" icon="wallet">
    月額固定料金なし — 使った分だけお支払いください
  </Card>

  <Card title="⚡ 高い同時実行数" icon="bolt">
    APIYI による無制限アクセス
  </Card>

  <Card title="🔧 簡単なセットアップ" icon="wrench">
    数分でセットアップ完了
  </Card>
</CardGroup>

<Info>
  **従量課金制 vs. 公式 Claude Max プラン — どちらを選ぶべきですか？**

  * **Claude Max (公式サブスクリプション)**: 支出上限のある月額固定料金です。**コードを書くことだけに集中し、膨大な量を消費するヘビーユーザーにとってはよりお得です** — ただし、公式のネットワーク要件を満たせること、アカウント管理を自分で行い、利用停止リスクを受け入れられることが前提です。
  * **APIYI の Claude 設定**: 利用停止リスクのない従量課金です。品質は 2 つの経路で支えられています — AWS Bedrock の公式アクセスと、Anthropic の公式キーによる直接接続 — さらにチャージ特典で実際の支払額を抑えられます。利用者の評判も良く、継続してチャージする方が多いです。企業にとっては、直接アクセスと税務コンプライアンス（請求書発行）も解決できます。
  * **API の方が柔軟です**: コーディング以外でも、同じキーで 400 以上のモデルにアクセスできるため、単一のコーディングプランよりはるかに選択肢が多いです。
</Info>

## Token グループ: ClaudeCode

APIYI を Claude Code と併用する場合は、**token を作成する際に必ず `ClaudeCode` グループを選択してください**（コンソールの token 作成ダイアログの「Group」オプションで指定します）。このグループは、Anthropic のネイティブな `/v1/messages` フォーマットに対応するすべてのモデルを 1 つのチャネルに集約し、Claude Code 向けのシナリオ専用になっています。

<Tip>
  **ClaudeCode グループはデフォルトで 5% オフです** — 追加対応は不要です。この割引はチャージ特典キャンペーン（10%–20%）と併用でき、実質コストは公式の直販価格よりおおむね 20% 低くなります。
</Tip>

<Note>
  **このグループはどこで使えますか?**

  * **Claude Code 内**: このグループは Claude Code に最適です。**一部の中国国内モデルは、Claude Code 内では ClaudeCode グループの token でしか呼び出せません** — 他のグループの token では失敗します。
  * **Claude Code 外**: ClaudeCode グループの token でも **問題なく使えます** — Claude Code 専用ではありません。その場合は純粋に割引のみで、デフォルトで 5% オフ（0.95x）、チャージ特典キャンペーン（10%–20%）と併用できます。
</Note>

### Claude Code で利用できる中国国内モデル

Claude の全ラインナップに加えて、`ClaudeCode` グループには Anthropic のネイティブな `/v1/messages` フォーマットに対応する中国国内のコーディングモデル群も含まれています。Claude Code でモデル名を下記の model ID のいずれかに切り替えるだけです — **ClaudeCode グループで作成した token も必要です**; 他のグループの token では呼び出しに失敗します。

| Model ID                 | ベンダー     | 入力 / 1M tokens | 出力 / 1M tokens |
| ------------------------ | -------- | -------------- | -------------- |
| `deepseek-v4-flash`      | DeepSeek | \$0.133        | \$0.266        |
| `deepseek-v4-pro`        | DeepSeek | \$0.408        | \$0.817        |
| `glm-4.7`                | Zhipu    | \$0.570        | \$2.052        |
| `glm-5`                  | Zhipu    | \$0.532        | \$2.394        |
| `glm-5.1`                | Zhipu    | \$0.798        | \$3.192        |
| `kimi-k2.5`              | Moonshot | \$0.570        | \$2.992        |
| `kimi-k2.6`              | Moonshot | \$0.570        | \$2.280        |
| `MiniMax-M2.7`           | MiniMax  | \$0.285        | \$1.140        |
| `MiniMax-M2.7-highspeed` | MiniMax  | \$0.570        | \$2.280        |
| `MiniMax-M3`             | MiniMax  | \$0.285        | \$1.140        |
| `qwen3.6-plus`           | Alibaba  | \$0.285        | \$1.710        |
| `qwen3.7-max`            | Alibaba  | \$1.628        | \$4.885        |

<Info>
  上記のモデルはすべて従量課金です。表は基本価格を示しており、ClaudeCode グループの token には自動的にさらに 5% オフが適用されます。モデル一覧は継続的に更新されるため、最新の価格はコンソールのモデルマーケットプレイスでご確認ください。
</Info>

<Card title="Token グループについて学ぶ" icon="layers" href="/ja/faq/groups-explained">
  ClaudeCode グループはなぜ存在するのですか? グループと割引はどのように機能しますか? グループ機構の詳細な説明をご覧ください。
</Card>

## クイックスタート

<Note>
  **簡易設定のヒント**: Claude の公式アカウントを登録したくない場合は、下の [詳細設定](#advanced-configuration) セクションを確認して、`~/.claude.json` のファイル設定を使用することをおすすめします。これにより、公式の確認を完全に回避できます。
</Note>

### 1. Claude Code をインストールする

次のコマンドをターミナルで実行して、グローバルにインストールします:

```bash theme={null}
npm install -g @anthropic-ai/claude-code
```

<Info>
  Node.js 18 以上が必要です。インストールされていない場合は、[nodejs.org](https://nodejs.org) にアクセスしてダウンロードし、インストールしてください。
</Info>

### 2. API Key を設定する

#### API Key を取得する

APIYI key を取得するには、[API Key 管理チュートリアル](/ja/faq/token-management) を参照してください。

#### 環境変数を設定する

システムの環境変数に APIYI の設定を追加します。

<Tabs>
  <Tab title="macOS/Linux">
    `~/.zshrc` または `~/.bashrc` ファイルを編集します:

    ```bash theme={null}
    # APIYI Configuration
    export ANTHROPIC_AUTH_TOKEN="sk-***"
    export ANTHROPIC_BASE_URL="https://api.apiyi.com"
    ```

    <Tip>
      **Mac ユーザー向けのヒント**: ユーザー ディレクトリで `⌘ + ⇧ + .` を押して隠しファイルを表示し、テキストエディタで `.zshrc` ファイルを開いてください。
    </Tip>
  </Tab>

  <Tab title="Windows">
    PowerShell を使って設定を編集します:

    ```powershell theme={null}
    # Edit configuration file
    notepad $PROFILE

    # Add the following content
    $env:ANTHROPIC_AUTH_TOKEN = "sk-***"
    $env:ANTHROPIC_BASE_URL = "https://api.apiyi.com"
    ```
  </Tab>
</Tabs>

### 3. 設定を適用する

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    source ~/.zshrc
    # or
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell を再起動するか、次を実行します:

    ```powershell theme={null}
    . $PROFILE
    ```
  </Tab>
</Tabs>

### 4. Claude Code を起動する

プロジェクト ディレクトリに移動して起動します:

```bash theme={null}
# Enter project directory
cd ~/Desktop/my-project

# Launch Claude Code
claude
```

## 詳細設定

### 設定ファイル（推奨）

Claude公式認証を回避するには、2つのファイルを一緒に設定する必要があります:

**手順1**: 公式認証を回避するため、ホームディレクトリに `~/.claude.json` を作成します:

```json theme={null}
{
  "hasCompletedOnboarding": true
}
```

**手順2**: `~/.claude/settings.json` で APIYI サービスを設定します:

```json theme={null}
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-APIYI-key",
    "ANTHROPIC_BASE_URL": "https://api.apiyi.com"
  }
}
```

<Tip>
  **重要な注意**: `hasCompletedOnboarding: true` は Claude の公式アカウント認証を完全に回避し、APIYI サービスを直接利用できるようにします。つまり、次のことは不要です:

  * Claude の公式アカウントへの登録（登録が難しく、海外の電話番号が必要です）
  * Claude の公式アカウントがBANされることを心配すること
  * 追加の認証手順を実行すること
</Tip>

<Warning>
  **セキュリティの注意**: 設定ファイルには API キーなどの機密情報が含まれます。ほかの人と共有しないでください。
</Warning>

### グローバル認証（非推奨）

`hasCompletedOnboarding: true` を設定しない場合、初回使用時に認証ページが表示されます:

1. 確認のために Claude の公式サイトへリダイレクトする必要があります
2. Claude の公式アカウントが必要です（登録が難しく、BANされやすいです）
3. 認証成功後にターミナルへ戻ります

<Info>
  **推奨**: Claude の公式アカウントに伴うさまざまな制約を避けるため、上記の設定ファイル方式を強く推奨します。
</Info>

## ユーザーガイド

### 基本コマンド

起動後、Claude Code は現在の設定情報を表示します:

```bash theme={null}
claude
# Displays API Key and API Base URL
# Confirm configuration is correct and select Yes to continue
```

### ワークフロー

1. **アシスタントを起動**: プロジェクトディレクトリで `claude` を実行します
2. **要件を記述**: プログラミングの要望や質問を入力します
3. **対話形式のやり取り**: Claude がコンテキストを理解し、コードの提案を行います
4. **変更を適用**: 確認後、Claude がファイルを直接修正できます

### 対応機能

* ✅ コードの生成と最適化
* ✅ バグ修正とデバッグ
* ✅ コードリファクタリングの提案
* ✅ ドキュメント作成
* ✅ テストケース生成
* ✅ 技術Q\&A

## モデル選択

Claude Code はデフォルトで最新の Claude モデルを使用します。APIYI を通じて、以下にアクセスできます。

| モデル                          | 特徴           | 推奨シナリオ      |
| ---------------------------- | ------------ | ----------- |
| **Claude 4 Sonnet**          | 最強のプログラミング性能 | 複雑なコードタスク   |
| **Claude Opus 4.1**          | 性能向上版        | 高負荷なプログラミング |
| **Claude 4 Sonnet Thinking** | 思考連鎖モード      | 複雑な推論       |

## トラブルシューティング

### よくある問題

<AccordionGroup>
  <Accordion title="Anthropic サービスに接続できない">
    これは通常、ネットワーク設定の問題です。以下を確認してください:

    1. 環境変数が正しく設定されている
    2. API key が有効である
    3. ネットワーク接続が正常である

    設定を確認するには、次のコマンドを実行してください:

    ```bash theme={null}
    echo $ANTHROPIC_AUTH_TOKEN
    echo $ANTHROPIC_BASE_URL
    ```
  </Accordion>

  <Accordion title="Claude 公式アカウントの認証を求められる">
    これは、`hasCompletedOnboarding` が設定されていないためです。`{"hasCompletedOnboarding": true}` を `~/.claude.json` に追加し、`~/.claude/settings.json` で APIYI の環境変数を設定してください。詳細は上記の [詳細設定](#advanced-configuration) を参照してください。
  </Accordion>

  <Accordion title="無効な API Key">
    APIYI の key を使用していることを確認してください。Claude 公式サイトの key ではありません。[API Key 管理チュートリアル](/ja/faq/token-management) を参照して key を取得してください。
  </Accordion>

  <Accordion title="Claude Code を更新する方法">
    最新バージョンに更新するには、次のコマンドを実行してください:

    ```bash theme={null}
    npm update -g @anthropic-ai/claude-code
    ```
  </Accordion>

  <Accordion title="サポートされているプログラミング言語">
    Claude Code は、以下を含むすべての主要なプログラミング言語をサポートしています:

    * Python, JavaScript/TypeScript, Java, C++, C#
    * Go, Rust, Swift, Kotlin
    * HTML/CSS, SQL, Shell Scripts
    * その他...
  </Accordion>
</AccordionGroup>

## ベストプラクティス

### 効果的な prompt

```markdown theme={null}
Good prompts:
"Help me refactor this Python function to make it more efficient and add type annotations"
"This code has a memory leak, please help me find and fix it"
"Write unit tests for this React component"

Avoid being too broad:
"Improve my code"  # Too vague
```

### プロジェクト構成の推奨事項

* コードベースを整理された状態に保つ
* 分かりやすいファイル名を使う
* 適切なコメントを追加する
* プロジェクトの README を用意する

## パフォーマンス最適化

### 応答速度を向上させる

1. **`~/.claude.json` 設定を使用する**: これにより毎回の検証を回避でき、特に `hasCompletedOnboarding: true` を設定した後は起動がより速くなります
2. **会話の一貫性を保つ**: 関連するタスクは同じセッションで処理します
3. **要件を明確にする**: 明確な説明により往復のやり取りが減ります

### コスト管理

* Claude Code の料金は Token 使用量に基づきます
* APIYI を通じて優待価格をご利用いただけます
* 詳細は [料金ページ](/ja/pricing) をご確認ください

## 関連リソース

<CardGroup cols={2}>
  <Card title="API Key 管理" icon="book" href="https://docs.apiyi.com/faq/token-management">
    API Key 設定チュートリアル
  </Card>

  <Card title="Claude Code 公式ドキュメント" icon="terminal">
    公式ドキュメント: `code.claude.com/docs`
  </Card>

  <Card title="モデル紹介" icon="bot" href="/ja/api-capabilities/model-info">
    Claude シリーズのモデルについて学ぶ
  </Card>

  <Card title="その他のプログラミングツール" icon="code" href="/ja/scenarios/programming/cursor">
    Cursor などのツールを探す
  </Card>
</CardGroup>

## 概要

Claude Code と APIYI を組み合わせると、開発者は安定的で柔軟な AI コーディング環境を構築できます。プロキシなしで直接アクセスでき、従量課金で、月額固定料金もありません。特に、ネットワークに制限がある場合や利用状況が不規則な場合に適しています。**ヘビーユーザーで高頻度に利用し、公式サービスへ直接アクセスできる場合は、このページ上部の料金に関する注記と比較して検討してください。**

<Info>
  **ヒント**: プログラミングのシナリオで使えるその他の AI ツールについては、[OpenAI Codex CLI](/ja/scenarios/programming/codex-cli) や他の選択肢も確認してください。
</Info>
