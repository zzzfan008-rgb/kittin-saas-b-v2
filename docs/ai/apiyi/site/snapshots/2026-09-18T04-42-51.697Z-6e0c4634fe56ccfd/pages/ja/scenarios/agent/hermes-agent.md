> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Hermes エージェント

> Nous Researchの自己改善するAIエージェントで、内蔵の学習ループとマルチプラットフォーム・ゲートウェイを備え、APIYI経由で任意のLLMにプラグイン可能です

## 概要

Hermes Agent は、Nous Research によって構築されたオープンソースの AI エージェントで、「あなたとともに成長するエージェント」と位置付けられています。これは、組み込みの **学習ループ** を備えた数少ないエージェントの1つであり、経験から自律的にスキルを作成し、使用中に改善し、知識を保持するよう自らを促し、FTS5 の全文インデックスを通じて過去の会話を検索し、セッションをまたいで深まっていくユーザーモデルを維持します。Hermes はノート PC 上で動作する必要はなく、\$5 の VPS、GPU クラスター、あるいはアイドル時のコストがほぼゼロのサーバーレスインフラでも同様に快適に動作します。

APIYI を統合すると、次のような利点があります:

<CardGroup cols={2}>
  <Card title="🧠 自己改善ループ" icon="brain">
    自律的なスキル作成 + 改善、セッションをまたいだ長期記憶
  </Card>

  <Card title="📱 マルチプラットフォーム ゲートウェイ" icon="message-circle">
    Telegram / Discord / Slack / WhatsApp / Signal / Email / CLI
  </Card>

  <Card title="⏰ Cron スケジューリング" icon="clock">
    組み込みスケジューラーが、任意のプラットフォーム経由でレポート/監査を配信
  </Card>

  <Card title="☁️ どこでも動作" icon="cloud">
    7つのターミナルバックエンド — ローカル / Docker / SSH / Modal / Daytona / Vercel Sandbox
  </Card>
</CardGroup>

<Info>
  **プロジェクト情報**: Hermes Agent は MIT ライセンスのオープンソースです。リポジトリ: `github.com/NousResearch/hermes-agent`。ドキュメント: `hermes-agent.nousresearch.com/docs/`.
</Info>

## インストール

### Linux / macOS / WSL2 / Termux

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Windows (PowerShell、ネイティブ向けの初期ベータ)

```powershell theme={null}
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

インストーラーは `uv`、Python 3.11、Node.js、`ripgrep`、`ffmpeg`、およびポータブルな Git Bash を自動で処理します。

インストール後、シェルを再読み込みして開始してください:

```bash theme={null}
source ~/.bashrc    # or source ~/.zshrc
hermes              # Launches the TUI, ready to chat
```

## APIYI に接続する

Hermes には `hermes model` コマンドが標準搭載されており、Nous Portal / OpenRouter / OpenAI / カスタムエンドポイントをサポートします。APIYI は **OpenAI互換 API** を公開しているため、「カスタムOpenAIエンドポイント」として接続するだけで、APIYI の全モデル一覧を一度に利用できます。

### オプション 1: `hermes model` で設定する（推奨）

```bash theme={null}
hermes model        # Enter the model selection wizard
```

ウィザードでは次の内容を入力します:

| ステップ         | 入力                                                                                   |
| ------------ | ------------------------------------------------------------------------------------ |
| プロバイダー       | `OpenAI`（または `Custom OpenAI endpoint`）を選択                                            |
| API Base URL | `https://api.apiyi.com/v1`                                                           |
| API Key      | あなたの APIYI キー（`sk-...`）                                                              |
| モデル          | 使いたいモデル ID。例: `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` |

### オプション 2: `hermes config set` で設定する

```bash theme={null}
hermes config set llm.provider openai
hermes config set llm.base_url https://api.apiyi.com/v1
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model gpt-5.4
```

その後、接続を確認するために `hermes` を 1 回実行してください。

### オプション 3: 環境変数（Docker / Serverless に最適）

```bash theme={null}
export OPENAI_API_BASE=https://api.apiyi.com/v1
export OPENAI_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=gpt-5.4
hermes
```

`hermes model` からいつでもモデルを切り替えられます。または `HERMES_MODEL` を更新してください — **コード変更は不要です**。

### オプション 4: Anthropic ネイティブプロトコル（Claude を多用するワークロードに最適）

Hermes は Anthropic を **第一級のプロバイダー**として扱います。内部では、この wire protocol は `anthropic_messages` と呼ばれ、OpenAI互換パスでは得られない特典が付いています:

<Info>
  **ネイティブ Anthropic が Claude に最適な理由**: ネイティブ Anthropic、OpenRouter、そして Nous Portal の各プロバイダーでは、Hermes が system prompt、skill blocks、そして長いコンテキストの前半部分に対して、1 時間 TTL の `cache_control` ブレークポイントを自動的に付与します。セッションをまたいだ後続の送信や分岐したサブエージェントでは、キャッシュを割引済みの cached-read レートで再利用します。**この最適化は OpenAI互換パスでは適用されません。**
</Info>

CLI 設定:

```bash theme={null}
hermes config set llm.provider anthropic
hermes config set llm.base_url https://api.apiyi.com
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model claude-sonnet-4-6
```

環境変数での同等設定:

```bash theme={null}
export ANTHROPIC_BASE_URL=https://api.apiyi.com
export ANTHROPIC_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=claude-sonnet-4-6
hermes
```

<Warning>
  **`/v1` を `base_url` に含めないでください** — `https://api.apiyi.com` でなければなりません。Anthropic プロトコルは `/v1/messages` を自動的に付加します。自分で `/v1` を含めると `.../v1/v1/messages` となり、404 が発生します。
</Warning>

Hermes は URL から wire protocol を自動判別します（`/anthropic` で終わるパスは `anthropic_messages` にルーティングされます）。LiteLLM プロキシのような非標準のエンドポイントでは、モードを明示的に設定してください:

```bash theme={null}
hermes config set llm.api_mode anthropic_messages
```

**ボーナス**: `api.apiyi.com/token` で token を作成する際は、**`ClaudeCode` グループ**を選ぶと自動で 5% の割引が適用され、10%-20% のチャージボーナスとも併用できます。

<Tip>
  **APIYI を使う理由は？**

  * **1つのキーで多数のモデル**: OpenAI / Anthropic / Google / DeepSeek / Zhipu / Kimi など
  * **価格面の優位性**: 通常、公式価格より 5%-20% 安く、対象モデルには入金ボーナスもあります
  * **中国から直接アクセス**: VPN なしで海外の LLM にアクセス可能
  * **デュアルプロトコル互換性**: OpenAI wire と Anthropic wire の両方のエンドポイントをサポートします。Claude を多用するユーザーは、ネイティブ Anthropic パスを使うと 1 時間のセッション横断キャッシュ割引を受けられます。
</Tip>

## 機能早見表

<CardGroup cols={2}>
  <Card title="ターミナルUI" icon="terminal">
    フルTUI: 複数行編集、スラッシュコマンド補完、会話履歴、ストリーミングのツール出力
  </Card>

  <Card title="メッセージングゲートウェイ" icon="bot">
    ボットのtokenを紐づけ、任意のIMプラットフォームからチャットするには `hermes gateway setup` を実行します
  </Card>

  <Card title="スキルシステム" icon="puzzle">
    手続きメモリ + スキルハブ (`agentskills.io`) — 使うほど賢くなります
  </Card>

  <Card title="MCP統合" icon="plug">
    コミュニティ製の Linux デスクトップ制御 MCP を含む、任意の MCP サーバーを接続できます
  </Card>

  <Card title="スケジュールタスク" icon="clock">
    組み込み cron — 「毎日9時に日次レポートを送って」のような自然言語で指定できます
  </Card>

  <Card title="サブエージェント" icon="users">
    分離されたサブエージェントを生成して並列作業を行い、Pythonスクリプトから RPC 経由でツールを呼び出せます
  </Card>
</CardGroup>

## OpenClaw からの移行

OpenClaw から移行する場合、Hermes には組み込みの移行ツールがあります:

```bash theme={null}
hermes claw migrate              # Interactive full migration
hermes claw migrate --dry-run    # Preview what would be migrated
hermes claw migrate --preset user-data   # User data only, no secrets
hermes claw migrate --overwrite  # Overwrite conflicts
```

`SOUL.md`、メモリ（`MEMORY.md` / `USER.md`）、ユーザー作成のスキル、コマンドの許可リスト、メッセージングプラットフォームの設定、API キー（Telegram / OpenRouter / OpenAI / Anthropic / ElevenLabs）、TTS アセット、ワークスペースの指示をインポートします。

## FAQ

<AccordionGroup>
  <Accordion title="Hermes Agent は OpenClaw や FastClaw とどう違いますか？">
    * **Hermes Agent**: Nous Research による Python 実装 — **自己改善ループ**、スキル進化、セッション横断メモリに重点を置き、研究用途に適しています（trajectory generation をサポート）
    * **OpenClaw**: Node.js 実装 — ローカルプライバシーと複数 IM プラットフォーム間の連携に重点を置いています
    * **FastClaw**: Go の単一バイナリ — Dashboard 形式でのマルチエージェント管理に重点を置いています

    3つとも APIYI の全モデルマトリクスにアクセスできます。用途に合うものをお選びください。
  </Accordion>

  <Accordion title="APIYI の全モデルラインナップに対応していますか？">
    はい。Hermes は **OpenAI-compatible** と **Anthropic-native** の両方のプロトコルをサポートしています。

    * OpenAI エンドポイント: `https://api.apiyi.com/v1` — 全モデルマトリクス
    * Anthropic エンドポイント: `https://api.apiyi.com`（`/v1`なし）— Claude ファミリー

    APIYI の docs にあるモデル ID をそのまま使用してください（例: `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`）。Claude を多く使う方は Anthropic-native の経路を使うと、Hermes の 1 時間のセッション横断プロンプトキャッシュを利用できます。
  </Accordion>

  <Accordion title="クロスプラットフォームのメッセージングはどのように動作しますか？">
    Hermes は **単一のゲートウェイプロセス** を実行し、Telegram / Discord / Slack / WhatsApp / Signal 全体の bot 接続を管理します。`hermes gateway setup` では token の貼り付け手順を案内し、`hermes gateway start` は各プラットフォームからのメッセージを同じ agent インスタンスにルーティングします。**会話はプラットフォームをまたいで継続される** ので、Discord で Telegram のスレッドをそのまま引き継げます。

    ボイスメモの文字起こしも含まれており、cron 配信も同じゲートウェイを通ります。
  </Accordion>

  <Accordion title="クラウドで実行できますか？">
    はい。Hermes はそれを前提に作られています。7 種類のターミナルバックエンドを提供します。

    * **Local / Docker / SSH / Singularity**: 従来型のデプロイ
    * **Modal / Daytona**: サーバーレス永続化 — アイドル時は休止し、要求に応じて起動、セッション間のコストはほぼゼロ
    * **Vercel Sandbox**: エッジランタイム

    \$5 の VPS でも 24/7 で稼働させるのに十分です。Telegram 経由でスマートフォンからクラウド VM にタスクを送ることも、そのまま使えます。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Project Repository" icon="github">
    `github.com/NousResearch/hermes-agent`
  </Card>

  <Card title="Official Docs" icon="book">
    `hermes-agent.nousresearch.com/docs/`
  </Card>

  <Card title="OpenClaw の代替" icon="bot" href="/ja/scenarios/agent/openclaw/overview">
    ローカルプライバシー + IM の連携ユースケース向け
  </Card>

  <Card title="FastClaw の代替" icon="bolt" href="/ja/scenarios/agent/fastclaw">
    マルチエージェント工場 + Dashboard のユースケース向け
  </Card>
</CardGroup>
