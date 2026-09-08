> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FastClaw

> 単一バイナリ + ダッシュボードを備えた軽量な Go ベースのマルチエージェントランタイムで、APIYI 経由で主要な LLM を任意にプラグインできます

## 概要

FastClaw は Go で書かれた軽量な AI Agent ランタイムで、「Agent Factory」として位置付けられています。複数の AI エージェントを作成・管理・実行し、それぞれが独自のパーソナリティ（SOUL.md）、メモリ、スキル、ツールを持ちます。FastClaw は LLM との通信、ツール実行、サンドボックス分離、セッション管理を標準で備え、単一バイナリとして提供され、組み込みの Web ダッシュボードも搭載しています。

APIYI を統合すると、次のようなメリットがあります:

<CardGroup cols={2}>
  <Card title="🚀 単一バイナリでのデプロイ" icon="rocket">
    1行でインストールでき、SQLite をバンドルし、ローカルでもクラウドでも実行できます
  </Card>

  <Card title="🤖 マルチエージェント管理" icon="users">
    各エージェントは独自のパーソナリティ、モデル、スキル、セッションを持ちます
  </Card>

  <Card title="📱 マルチチャネル IM" icon="message-circle">
    Telegram / Discord / Slack のチャネル連携を標準搭載
  </Card>

  <Card title="🛡️ サンドボックス分離" icon="shield">
    安全なツール実行のための Docker / E2B サンドボックス対応
  </Card>
</CardGroup>

<Info>
  **プロジェクト情報**: FastClaw は FastClaw Community License（Apache 2.0 + 追補）のもとでソース公開されています。リポジトリ: `github.com/fastclaw-ai/fastclaw`.
</Info>

## インストールと起動

公式のワンライナーを使って FastClaw をインストールします。単一のバイナリを `~/.local/bin` に配置します。

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/fastclaw-ai/fastclaw/main/install.sh | bash
```

最初の起動でセットアップウィザードが起動します。LLM プロバイダを設定すると、デフォルトのエージェントが自動的に作成されます。

```bash theme={null}
fastclaw                    # Foreground (Ctrl+C to stop)
fastclaw daemon start       # Background (logs at ~/.fastclaw/daemon.log)
fastclaw daemon install     # Register as a launchd / systemd service
```

その後、`http://localhost:18953` でダッシュボードを開いてください（デフォルトポート `18953`）。

## APIYIに接続する（推奨）

APIYIはOpenAIとAnthropicの両方のAPIプロトコルに対応しています。FastClawは **OpenAI互換のプロバイダ** または **Anthropic互換のプロバイダ** のどちらでも使用でき、どちらでも単一のAPIYIキーで同じ完全なモデル一覧にアクセスできます。

### オプション1: ダッシュボードから設定する（推奨）

1. `http://localhost:18953` を開き、初回起動時に生成された管理者アカウントでログインします
2. **モデル / プロバイダ** に移動し、新しいプロバイダ項目を追加します:

| Field   | Recommended Value                                                                        |
| ------- | ---------------------------------------------------------------------------------------- |
| プロバイダ種別 | `OpenAI`互換                                                                               |
| ベースURL  | `https://api.apiyi.com/v1`                                                               |
| API Key | APIYIキー（`sk-...`）                                                                        |
| モデル     | 必要に応じて追加します。例: `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` |

3. エージェントの **モデル** パネルに移動し、デフォルトモデルに設定します

### オプション2: CLIから設定する

```bash theme={null}
# 1. Create a new agent, initially bound to APIYI (OpenAI-compatible)
fastclaw agents init alpha \
  --provider openai \
  --model openai/gpt-5.4 \
  --api-key-env APIYI_API_KEY

# 2. Point the OpenAI provider's Base URL at APIYI
fastclaw agents config alpha set provider.openai.apiBase https://api.apiyi.com/v1
fastclaw agents config alpha set provider.openai.apiKeyEnv APIYI_API_KEY

# 3. Add the models you want (append, idempotent)
fastclaw agents config alpha set provider.openai.model gpt-5.4
fastclaw agents config alpha set provider.openai.model claude-sonnet-4-6
fastclaw agents config alpha set provider.openai.model deepseek-v3.2
```

まずシェルで `APIYI_API_KEY` 環境変数を export しておく必要があります（`export APIYI_API_KEY=sk-...`）— FastClaw はキーをデータベースに平文で保存しません。

<Tip>
  **なぜAPIYIなのか？**

  * **1つのキーで多くのモデル**: OpenAI / Anthropic / Google / DeepSeek / Zhipu など — 各プロバイダごとに個別申請する必要はありません
  * **料金面の優位性**: 通常は公式料金より5%-20%安く、一部のモデルではチャージ特典があります
  * **中国から直接アクセス**: VPNなしで海外のLLMにアクセスできます
  * **二重プロトコル対応**: FastClawの両方のプロバイダ種別をサポートしています
</Tip>

### オプション3: Anthropicネイティブプロトコル（Claude中心のワークロードに最適）

主にClaudeモデルを使用する場合は、AnthropicプロバイダをAPIYIに直接向けます:

| Field   | Recommended Value                          |
| ------- | ------------------------------------------ |
| プロバイダ種別 | `Anthropic`                                |
| ベースURL  | `https://api.apiyi.com`                    |
| API Key | APIYIキー                                    |
| モデル     | `claude-sonnet-4-6`, `claude-opus-4-7`, など |

対応するCLI:

```bash theme={null}
fastclaw agents config alpha set provider.anthropic.apiBase https://api.apiyi.com
fastclaw agents config alpha set provider.anthropic.apiKeyEnv APIYI_API_KEY
fastclaw agents config alpha set provider.anthropic.model claude-sonnet-4-6
fastclaw agents config alpha set model claude-sonnet-4-6
```

## 機能早見表

<CardGroup cols={2}>
  <Card title="エージェント管理" icon="bot">
    ダッシュボード → エージェント: エージェントの作成 / 編集、SOUL.md（パーソナリティ）、IDENTITY.md、MEMORY.md（長期メモリ）を定義します。
  </Card>

  <Card title="スキル" icon="puzzle">
    同梱: code-runner, image-gen, data-analysis, web-search, skill-creator. ClawHub / GitHub からさらに追加できます。
  </Card>

  <Card title="IMチャネルのバインディング" icon="message-circle">
    エージェント → チャネル: Telegram / Discord / Slack のボット token を貼り付けます — 保存時に自動検証されます。
  </Card>

  <Card title="OpenAI互換 API" icon="code">
    `/v1/chat/completions` ストリーミング エンドポイントは、任意の OpenAI SDK でそのまま動作します。
  </Card>

  <Card title="サンドボックス実行" icon="shield">
    設定 → ランタイムで Docker / E2B サンドボックスを切り替え、ツール呼び出し後に成果物を自動同期します。
  </Card>

  <Card title="スケジューラ" icon="clock">
    エージェント → スケジューラ: エージェントが `create_cron_job` 経由で cron ベースのリマインダーを作成できるようにします。
  </Card>
</CardGroup>

## デプロイモード

| モード            | ユースケース      | 主な設定                                           |
| -------------- | ----------- | ---------------------------------------------- |
| **Local**      | 個人利用        | `fastclaw daemon start`, デフォルトのSQLiteストレージ     |
| **Docker**     | 単一ホストサービス   | `cd deploy/docker && ./start.sh`               |
| **Kubernetes** | 複数レプリカの本番環境 | `FASTCLAW_STORAGE_TYPE=postgres` + S3オブジェクトストア |

複数レプリカのデプロイには次が必要です:

* `FASTCLAW_STORAGE_TYPE=postgres`, `FASTCLAW_STORAGE_DSN=postgres://...`
* S3互換ストアを指す一連の`FASTCLAW_OBJECT_STORE_*`変数（pod間でskillsとworkspaceを同期するために使用）
* `FASTCLAW_BIND=all`（`0.0.0.0`で待ち受け）

K8sの完全なマニフェストは、リポジトリの`deploy/k8s/`フォルダにあります。

## よくある質問

<AccordionGroup>
  <Accordion title="FastClaw と OpenClaw の違いは何ですか?">
    * **FastClaw**: Go ベースの単一バイナリで、「エージェントファクトリー」ユースケース向けです — マルチエージェント管理、IM チャネル配信、サンドボックス分離に対応します。エージェントをサービスとして提供したい場合に最適です。
    * **OpenClaw**: Node.js ベースで、個人向けローカルアシスタントのユースケースに重点を置いています — ローカルプライバシー + マルチ IM プラットフォーム間の連携。
    * どちらも APIYI の全モデルマトリクスにアクセスできます。デプロイ形態に合うほうを選んでください。
  </Accordion>

  <Accordion title="APIYI の全モデルラインナップに対応していますか?">
    はい。APIYI は OpenAI 互換エンドポイント（`https://api.apiyi.com/v1`）と Anthropic 互換エンドポイント（`https://api.apiyi.com`）の両方を公開しています。FastClaw のどちらのプロバイダータイプでも動作します。APIYI のドキュメントにあるモデル ID をそのまま使ってください（例: `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`）。
  </Accordion>

  <Accordion title="Telegram / Discord 経由でエージェントを公開するにはどうすればよいですか?">
    1. 対象プラットフォームでボットを作成し、トークンを取得します
    2. ダッシュボード → エージェントを選択 → チャネル → トークンを貼り付けて保存します（`getMe` / `auth.test` で自動検証されます）
    3. IM プラットフォーム内でボットを検索してチャットを開始します — セッションは chatID ごとに分離されます
  </Accordion>

  <Accordion title="商用プロジェクトで使えますか?">
    はい。FastClaw Community License では以下が許可されています:

    * ✅ 自社製品のバックエンドとして組み込むこと（商用利用）
    * ✅ 組織内での内部デプロイ

    許可されないもの（商用ライセンスなしの場合）:

    * ❌ FastClaw 自体を、無関係な組織向けのマルチテナント SaaS としてホスティングすること
    * ❌ ダッシュボード内の FastClaw ブランド表記を削除または変更すること

    商用ライセンス: `support@thinkany.ai`
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="プロジェクトリポジトリ" icon="github">
    `github.com/fastclaw-ai/fastclaw`
  </Card>

  <Card title="APIYI API ドキュメント" icon="book" href="/ja/getting-started">
    キーと Base URL の参照を取得します
  </Card>

  <Card title="OpenClaw の代替" icon="bot" href="/ja/scenarios/agent/openclaw/overview">
    個人向けローカルアシスタントのユースケースに対する別の選択肢です
  </Card>

  <Card title="料金とチャージ" icon="coins" href="/ja/faq/recharge-promotions">
    APIYI の料金と初回チャージ特典をご覧ください
  </Card>
</CardGroup>
