> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AI開発キット

> AIにAPIYI統合を任せます。チャットエージェントはスキルをインストールし、ターミナルではCLIを利用でき、コーディングエージェントはコードを書く前にコントラクトとモデルレジストリを読み込みます。それぞれの方法にコピー可能なpromptが用意されています。

<Note>
  アカウントとキーは、引き続き[コンソール](https://api.apiyi.com/token)でご自身で作成する必要があります。「キーを取得した」から「コードが動作する」までのすべてを、以下の3つの方法のいずれかを通じてAIに任せられます。
</Note>

## パスを選択

<CardGroup cols={3}>
  <Card title="スキル · チャットエージェント" icon="sparkles" href="#skills">
    OpenClaw、Claude Codeなど、スキルシステムを備えたエージェントです。スキルを一度インストールすれば、自然言語でAPIYIを呼び出せます。
  </Card>

  <Card title="CLI · ターミナル" icon="terminal" href="#cli">
    コードは不要です。キーを確認し、モデルを一覧表示し、メッセージを送信して、ターミナルから画像を生成できます。`npx apiyi@latest check`のインストールは不要です。
  </Card>

  <Card title="開発キット · コーディングエージェント" icon="code" href="#rules-for-coding-agents">
    Cursor、Claude Code、Codexは、統合コードを書く前にコントラクトとモデルレジストリを読み込みます。存在しないエンドポイントを作ることはありません。
  </Card>
</CardGroup>

## キットの内容

すべてのファイルは公開されています。ログインは不要で、どのエージェントからでも直接取得できます。

| ファイル | URL | 役割 |
| - | - | - |
| **統合契約** | `https://docs.apiyi.com/skill.md` | エンドポイント一覧、認証、モデル命名規則、既知の落とし穴、自己チェックのステータス、検証チェックリスト。コーディングエージェント向けのルールブックであると同時に、スキルの本体です |
| **モデルレジストリ** | `https://docs.apiyi.com/model-registry.json` | モデル ID、エンドポイント、グループ、課金タイプ、リスト価格に関する機械可読な唯一の正規情報源です。価格表とともに再生成されます |
| **ページインデックス** | `https://docs.apiyi.com/llms.txt` | エージェントが読むべきページを判断できるようにする、サイト全体のインデックスです |
| **全文** | `https://docs.apiyi.com/llms-full.txt` | すべてのページを連結したものです。サイズが大きいため、必要に応じて取得してください |
| **テキスト形式の単一ページ** | 任意のページ URL に `.md` を追加 | 1ページだけ必要な場合に使用します。HTML より低コストです |
| **MCP サーバー** | `https://docs.apiyi.com/mcp` | このサイトを MCP サーバーとして接続し、最新のコンテンツを検索できるようにします |

<Tip>
  このページのプレーンテキスト版は `https://docs.apiyi.com/en/developer-kit.md` です。
</Tip>

## コーディングエージェント向けルール

コーディングエージェントで最もよくある失敗は、コードが悪いことではありません。**記憶を頼りに書くこと**です。存在しないエンドポイントを作り出したり、`gpt-5-4-mini`の代わりに`gpt-5.4-mini`と入力したり、Anthropic SDKのベースURLに余分な`/v1`を追加したりすることです。次の5つのルールで防止できます。

1. **エンドポイント、パラメータ名、列挙値、レスポンス形式を作り出さないでください。** `skill.md`エンドポイント表に記載されたパスだけを使用してください。パラメータは、使用するプロトコル（OpenAI、Anthropic、Gemini）の公式定義に従います。
2. **`model-registry.json`をモデル IDの唯一の信頼できる情報源とします。** IDはドット区切りのバージョン表記で、大文字と小文字が区別されます。ドキュメントURL内のハイフンはURLで安全に使用するための置き換えであり、モデル IDではありません。
3. **ベースURLはモデルではなくSDKで選択してください。** OpenAI SDKでは`https://api.apiyi.com/v1`を使用し、Anthropic SDKではルートの`https://api.apiyi.com`を使用します。Google GenAI SDKでは、ルートに`api_version`を設定し、その値を`v1beta`にします。
4. **キーは`APIYI_API_KEY`環境変数からのみ読み取ってください。** ハードコードしたり、コミットしたり、チャットに貼り付けたりしないでください。
5. **まず説明し、その後に編集してください。** エージェントに、使用するエンドポイント、モデル、タイムアウトを伝えさせます。あなたが確認してからコードを編集させてください。

<Prompt description="Cursor、Claude Code、Codex、その他のコーディングエージェント向けの完全なプロンプトです。そのままコピーして貼り付けてください。" icon="code" actions={["copy"]}>
  コードを書く前に、[https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) と
  [https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt) を最後まで読んでください。次のルールに従う必要があります。

  * エンドポイント、パラメータ名、列挙値、レスポンス形式を作り出さないでください。
    skill.mdのエンドポイント表に記載されたパスだけを使用してください。
  * [https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) をモデル IDの唯一の信頼できる情報源として扱ってください。IDはドット区切りのバージョン表記で、大文字と小文字が区別されます（gpt-5-4-miniではなくgpt-5.4-mini）。
    記憶を頼りに入力しないでください。
  * ベースURLはSDKで選択してください。OpenAI SDKでは[https://api.apiyi.com/v1を使用し、Anthropic](https://api.apiyi.com/v1を使用し、Anthropic) SDKでは/v1なしの[https://api.apiyi.comを使用します。Google](https://api.apiyi.comを使用します。Google) GenAI SDKでは[https://api.apiyi.comを使用し、](https://api.apiyi.comを使用し、)
    api\_versionにv1betaを設定します。
  * キーはAPIYI\_API\_KEY環境変数からのみ読み取ってください。ハードコードしたり、コミットしたりしないでください。
  * ページ単位の詳細については、llms.txtでページを見つけ、末尾に.mdを追加してプレーンテキストとして読んでください。

  読み終えたら、まず従う予定の統合フローを自分の言葉で説明してください
  （使用するエンドポイント、モデル、タイムアウト）。まだコードを編集しないでください。
  私の確認を待ってください。
</Prompt>

<Accordion title="このプロンプトで防げること">
  | 要件 | 防止できる落とし穴 |
  | - | - |
  | エンドポイントを作り出さない | エージェントが学習時の記憶から`/v1/complete`や`/v1/generate`を組み立て、404エラーを繰り返す |
  | レジストリのモデル IDを使用 | `gpt-5-4-mini`や`minimax-m3`が404を返すが、何が間違っているのかエラーからは分からない |
  | SDKでベースURLを選択 | Anthropic SDKの余分な`/v1`が`/v1/v1/messages`になり、OpenAI SDKの不足している`/v1`も404になる |
  | 環境変数からのみキーを取得 | ハードコードされたキーがリポジトリとともに漏洩します。このサイトのpre-commitフックもそれをブロックします |
  | 編集前に説明 | 間違ったプロトコルを選択したことに気づく前に、エージェントが10個のファイルを変更するのを防ぐ |
</Accordion>

## スキル

本スキルは `skill.md` そのものであり、マシン向けに書かれた統合リファレンスです。一度インストールすれば、エージェントは APIYI を呼び出す必要があるときにいつでもこれらのルールを思い出します。インストール方法は3通りあります：

<Tabs>
  <Tab title="npx skills（汎用）" icon="package">
    Claude Code、Cursor、Codex、および Agent Skills 仕様をサポートするその他のツール向け：

    ```bash theme={null}
    npx skills add https://docs.apiyi.com
    ```

    検出はこのサイトの `/.well-known/agent-skills/index.json` を経由して行われます。これにより、スクリプトなしで `skill.md` 自体がインストールされます。セルフチェックには `npx apiyi@latest check` を使用してください。
  </Tab>

  <Tab title="OpenClaw" icon="bot">
    OpenClaw のスキルインストーラーは git ソースを受け入れ、リポジトリのルートに `SKILL.md` があることを前提としています。スキルリポジトリ `github.com/apiyi-com/skills` はそのように構成されており、セルフチェックスクリプトが同梱されています：

    ```bash theme={null}
    openclaw skills install git:apiyi-com/skills
    ```

    または、手動でワークスペースにクローンします：

    ```bash theme={null}
    git clone https://github.com/apiyi-com/skills ~/.openclaw/workspace/skills/apiyi
    ```

    インストール後、エージェントは `scripts/apiyi.py --check` を実行し、その結果に基づいてキーの設定を案内します。
  </Tab>

  <Tab title="手動コピー" icon="clipboard">
    ファイルを読み込めるすべてのエージェントで動作します。`https://docs.apiyi.com/skill.md` の内容をそのスキルディレクトリに配置してください：

    | エージェント | 場所 |
    | - | - |
    | Claude Code | `.claude/skills/apiyi/SKILL.md` |
    | Codex CLI | `.agents/skills/apiyi/SKILL.md` |
    | Cursor | プロジェクトのルールファイル、またはコンテキストとして貼り付け |
    | その他 | システムプロンプトに全文を含める |
  </Tab>
</Tabs>

<Prompt description="OpenClaw、Claude Code、Cursor、およびスキルをサポートするその他のエージェント向け。そのままコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  まずご自身に APIYI スキルをインストールし、それを使って私のために APIYI を統合してください。

  1. `npx skills add https://docs.apiyi.com` を実行してください（スキル名: apiyi）。
     OpenClaw の場合は、スキルインストーラーで `git:apiyi-com/skills` をインストールするか、
     \~/.openclaw/workspace/skills/apiyi/ にリポジトリをクローンしてください。
     どちらもうまくいかない場合は、[https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) を取得して全文を読んでください。内容は同一です。
  2. 何よりもまずセルフチェックを行ってください。スキルの `scripts/apiyi.py --check` を実行します
     （スクリプトが存在しない場合は `npx apiyi@latest check`）。
     no\_key の場合は、キーを求めてください（私は [https://api.apiyi.com/token](https://api.apiyi.com/token) からコピーします）。そしてそれを
     環境変数 APIYI\_API\_KEY に設定してください。決してハードコードしたり、コミットしたりしないでください。
  3. チェックで ready と表示されたら、gpt-5.4-mini で「Hello」を1回送信して返信を見せ、
     今後このスキルを使って私のために何ができるかを教えてください。
</Prompt>

### キーがエージェントに渡る仕組み

* **環境変数 `APIYI_API_KEY` が最優先されます。** スキル、CLI、および本ドキュメントのすべてのサンプルはそこから読み取ります。
* **OpenClaw** は、キーを `~/.openclaw/openclaw.json` 内の `skills.entries.apiyi.apiKey` に保存し、実行時に `APIYI_API_KEY` として注入します。これはスキルのフロントマターにある `primaryEnv` フィールドで宣言されているものです。ファイルレイアウトについては、[OpenClaw 設定ファイル](/ja/scenarios/agent/openclaw/config-json)を参照してください。
* **CLI** は、`npx apiyi@latest auth set-key` を使用してパーミッション 0600 で `~/.config/apiyi/config.json` に保存します。

### セルフチェックのステータス

スキルのスクリプト、CLI、および手動の curl はすべて同じステータスセットを返します：

| ステータス | 意味 | エージェントの動作 |
| - | - | - |
| `ready` | `/v1/models` が 200 を返した | 利用可能なモデル数を伝え、何を構築するか尋ねる |
| `no_key` | キーがどこにも見つからない | コンソールからキーをコピーするよう案内し、再チェックする |
| `invalid_key` | 401 または 403 | キーが誤っている、無効化されている、または使い切られている。再度コピーするよう求める |
| `network_error` | タイムアウト、DNS エラー、または 5xx | 1回再試行し、その後 `b.apiyi.com` を提案する |

<Warning>
  通常の `sk-` キーでは**残高を読み取ることができない**ため、`no_balance` ステータスは存在しません。残高とログには別の認証情報であるパーソナルアクセストークン（`nap_` で始まるもの）が使用されます。[パーソナルアクセストークンとは？](/ja/faq/personal-access-token)を参照してください。429 はレート制限または残高不足のいずれかを意味する可能性があります。エージェントは推測せず、[コンソール](https://api.apiyi.com/account/profile)を案内する必要があります。
</Warning>

## CLI

Get the first call working from the terminal without writing code. Node 18 or newer, nothing to install:

```bash theme={null}
npx apiyi@latest check
```

<Prompt description="For any agent that can run terminal commands, or run the lines yourself." icon="terminal" actions={["copy"]}>
  Please help me install and run the APIYI CLI: [https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
  Requirements: Node 18+; run `npx apiyi@latest check` with nothing to install;
  guide me to configure an API key (`npx apiyi@latest auth set-key` or the APIYI\_API\_KEY env var, copied from [https://api.apiyi.com/token](https://api.apiyi.com/token));
  finally run `npx apiyi@latest models --grep gpt-5` and `npx apiyi@latest chat "Hello" -m gpt-5.4-mini` and paste the output.
</Prompt>

### Commands

| Command | Needs | What it does |
| - | - | - |
| `apiyi check` | key optional | Reports where the key came from, node reachability, whether `/v1/models` returns 200, latency and status. Shows balance if a personal access token is configured |
| `apiyi models [--grep text]` | key optional | With a key, lists the models your key can reach via `/v1/models`; without one, reads the public registry |
| `apiyi chat "prompt" [-m model] [--stream]` | key | Sends one Chat Completions request and prints the reply and token usage. Default model `gpt-5.4-mini` |
| `apiyi responses "input" [-m model] [--effort low]` | key | Uses the Responses endpoint and prints `output_text` |
| `apiyi image "prompt" -m gpt-image-2 [-o file]` | key | Generates an image and writes it to a local file, 360 s timeout |
| `apiyi balance` | personal access token | Shows the balance (500000 quota units = 1 USD). The token only needs "Profile · Read". Configure it with `apiyi auth set-key --access-token` or the `APIYI_ACCESS_TOKEN` environment variable. Legacy system tokens keep working until they retire on 2026-11-11 (UTC+8) |
| `apiyi auth set-key [--access-token]` / `show` / `clear` | none | Saves the key with hidden input; `show` masks it; `clear` removes it |

Global flags: `--api-key`, `--access-token`, `--node api|vip|b|cf` (pick a node), `--base-url`, `--timeout`, `--json` (machine-readable output).

### Key lookup order

`--api-key` flag, then the `APIYI_API_KEY` environment variable, then `~/.config/apiyi/config.json`, then OpenClaw's `~/.openclaw/openclaw.json`. If you already installed the OpenClaw skill, the CLI reuses that key.

### Exit codes

Scripts and agents branch on the exit code instead of parsing text:

| Code | Meaning |
| - | - |
| 0 | Success |
| 2 | `no_key` |
| 3 | `invalid_key` (401 / 403) |
| 4 | `network_error` (DNS, timeout, or 5xx after retry) |
| 5 | Model not found (404, usually a misspelled ID) |
| 6 | Rate limited or out of balance (429) |
| 7 | Bad request (400, prints `error.message` verbatim) |
| 8 | Bad command-line arguments |

Source is at `github.com/apiyi-com/cli`; the npm package is `apiyi`. The docs always write `npx apiyi@latest` because `npx` caches old versions.

## model-registry.json のフィールド

価格表が更新されるたびに、[モデル価格](/en/models)ページと同じデータから再生成されます。トップレベルのフィールド：

| フィールド | 意味 |
| - | - |
| `schema_version` | スキーマバージョン。現在は 1 です。各バージョン内では、フィールドは追加のみで、名前が変更されることはありません |
| `generated_at` | 生成時刻（UTC） |
| `base_urls` | 3 つの SDK それぞれのベース URL、および Gemini `api_version` |
| `nodes` | 利用可能なノードホスト名 |
| `endpoints` | エンドポイント名からパスとメソッドへの対応：`chat` / `responses` / `messages` / `gemini` / `images` / `embeddings` / `rerank` / `models` |
| `groups` | グループ名から表示ラベルと比率への対応 |
| `models[]` | 以下を参照してください |

各モデルエントリ：

| フィールド | 意味 |
| - | - |
| `id` | リクエストでそのまま使用するモデル ID。大文字と小文字を区別します |
| `vendor_en` | 英語でのベンダー名 |
| `category` | `text`、`image`、`video`、`embedding`などの機能タイプ |
| `endpoints` | このモデルが受け付けるエンドポイント名。トップレベルの `endpoints` のキーに対応します |
| `groups` | このモデルを呼び出せる token グループ |
| `billing.type` | `per_token`（100 万 token あたり）または `per_call` |
| `billing.input_usd_per_m` / `output_usd_per_m` / `cache_read_usd_per_m` | token 単位のモデルにおける USD の定価 |
| `billing.per_call_usd` | 呼び出し単位のモデルにおける 1 回あたりの USD の定価 |
| `billing.tiered` | 段階的な価格設定が適用されるかどうか（true の場合はモデルページを参照してください） |
| `docs_url` | 存在する場合の詳細ページ URL |

<Info>
  レジストリ内の価格は**定価**です。チャージボーナスとグループ割引は含まれておらず、実際の課金はコンソールに従います。グループについては、[グループの説明](/ja/faq/groups-explained)を参照してください。
</Info>

## 関連ページ

<CardGroup cols={2}>
  <Card title="はじめに" icon="rocket" href="/ja/getting-started">
    2つの方法があります。AIに統合させるか、自分で行います。
  </Card>

  <Card title="ワンクリック統合はありますか？" icon="plug" href="/ja/faq/one-click-integration">
    ボタンではなく、ドキュメントをAIに渡す形で利用できます。
  </Card>

  <Card title="OpenClaw" icon="bot" href="/ja/scenarios/agent/openclaw/overview">
    オープンソースのローカルAIアシスタントです。スキルをインストールすると、自然言語でAPIYIを呼び出せます。
  </Card>

  <Card title="モデルの料金" icon="circle-dollar-sign" href="/en/models">
    レジストリを人間が読みやすい形式にしたもので、ベンダーごとにグループ化し、段階的な料金を掲載しています。
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.