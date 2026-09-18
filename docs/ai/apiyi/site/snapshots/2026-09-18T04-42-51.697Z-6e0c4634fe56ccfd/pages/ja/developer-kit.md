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

| ファイル             | URL                                          | 役割                                                                                        |
| ---------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **統合契約**         | `https://docs.apiyi.com/skill.md`            | エンドポイント一覧、認証、モデル命名規則、既知の落とし穴、自己チェックのステータス、検証チェックリスト。コーディングエージェント向けのルールブックであると同時に、スキルの本体です |
| **モデルレジストリ**     | `https://docs.apiyi.com/model-registry.json` | モデル ID、エンドポイント、グループ、課金タイプ、リスト価格に関する機械可読な唯一の正規情報源です。価格表とともに再生成されます                         |
| **ページインデックス**    | `https://docs.apiyi.com/llms.txt`            | エージェントが読むべきページを判断できるようにする、サイト全体のインデックスです                                                  |
| **全文**           | `https://docs.apiyi.com/llms-full.txt`       | すべてのページを連結したものです。サイズが大きいため、必要に応じて取得してください                                                 |
| **テキスト形式の単一ページ** | 任意のページ URL に `.md` を追加                       | 1ページだけ必要な場合に使用します。HTML より低コストです                                                           |
| **MCP サーバー**     | `https://docs.apiyi.com/mcp`                 | このサイトを MCP サーバーとして接続し、最新のコンテンツを検索できるようにします                                                |

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
  | 要件              | 防止できる落とし穴                                                                 |
  | --------------- | ------------------------------------------------------------------------- |
  | エンドポイントを作り出さない  | エージェントが学習時の記憶から`/v1/complete`や`/v1/generate`を組み立て、404エラーを繰り返す             |
  | レジストリのモデル IDを使用 | `gpt-5-4-mini`や`minimax-m3`が404を返すが、何が間違っているのかエラーからは分からない                 |
  | SDKでベースURLを選択   | Anthropic SDKの余分な`/v1`が`/v1/v1/messages`になり、OpenAI SDKの不足している`/v1`も404になる |
  | 環境変数からのみキーを取得   | ハードコードされたキーがリポジトリとともに漏洩します。このサイトのpre-commitフックもそれをブロックします                 |
  | 編集前に説明          | 間違ったプロトコルを選択したことに気づく前に、エージェントが10個のファイルを変更するのを防ぐ                           |
</Accordion>

## スキル

スキルそのものが`skill.md`です。これは機械向けに書かれた統合リファレンスです。インストールすると、APIYIを呼び出す必要があるときに、エージェントがこれらのルールを毎回参照します。インストール方法は3つあります。

<Tabs>
  <Tab title="npx skills（汎用）" icon="package">
    Claude Code、Cursor、Codex、およびAgent Skills仕様をサポートするその他のツールの場合：

    ```bash theme={null}
    npx skills add https://docs.apiyi.com
    ```

    検出はこのサイトの`/.well-known/agent-skills/index.json`を通じて行われます。これにより、スクリプトを使わずに`skill.md`自体がインストールされます。セルフチェックには`npx apiyi@latest check`を使用してください。
  </Tab>

  <Tab title="OpenClaw" icon="bot">
    OpenClawのスキルインストーラーはgitソースを受け付け、リポジトリのルートに`SKILL.md`があることを想定します。スキルリポジトリ`github.com/apiyi-com/skills`はその構成になっており、セルフチェックスクリプトも含まれています。

    ```bash theme={null}
    openclaw skills install git:apiyi-com/skills
    ```

    または、手動でワークスペースにクローンすることもできます。

    ```bash theme={null}
    git clone https://github.com/apiyi-com/skills ~/.openclaw/workspace/skills/apiyi
    ```

    インストール後、エージェントは`scripts/apiyi.py --check`を実行し、その結果に基づいて主要なセットアップを案内します。
  </Tab>

  <Tab title="手動コピー" icon="clipboard">
    ファイルを読み取れる任意のエージェントで使用できます。`https://docs.apiyi.com/skill.md`の内容を、そのエージェントのスキルディレクトリに配置します。

    | エージェント      | 場所                              |
    | ----------- | ------------------------------- |
    | Claude Code | `.claude/skills/apiyi/SKILL.md` |
    | Codex CLI   | `.agents/skills/apiyi/SKILL.md` |
    | Cursor      | プロジェクトのルールファイル、またはコンテキストとして貼り付け |
    | その他         | 完全なテキストをシステムプロンプトに含める           |
  </Tab>
</Tabs>

<Prompt description="OpenClaw、Claude Code、Cursor、およびスキルをサポートするその他のエージェント向けです。そのままコピーして貼り付けてください。" icon="bot" actions={["copy"]}>
  まず自分自身にAPIYIスキルをインストールし、その後、それを使って私のためにAPIYIを統合してください。

  1. `npx skills add https://docs.apiyi.com`を実行します（スキル名：apiyi）。
     OpenClawの場合は、スキルインストーラーで`git:apiyi-com/skills`をインストールするか、
     リポジトリを\~/.openclaw/workspace/skills/apiyi/にクローンします。
     どちらも機能しない場合は、[https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) を完全に取得して読み取ります。内容は同じです。
  2. 何よりも先にセルフチェックを行います：スキルの`scripts/apiyi.py --check`を実行します
     （スクリプトがない場合は`npx apiyi@latest check`）。
     no\_keyの場合は、キーを尋ねます（[https://api.apiyi.com/tokenからコピーしてもらいます）。](https://api.apiyi.com/tokenからコピーしてもらいます）。)
     そのキーをAPIYI\_API\_KEY環境変数に設定します。ハードコードしたり、コミットしたりしてはいけません。
  3. チェックでreadyと表示されたら、gpt-5.4-miniで「Hello」を1回送信し、返信を表示して、
     それ以降、このスキルで何ができるかを伝えます。
</Prompt>

### キーがエージェントに届く仕組み

* \*\*環境変数`APIYI_API_KEY`が最初に使用されます。\*\*スキル、CLI、およびこれらのドキュメント内のすべての例は、そこから読み取ります。
* **OpenClaw**は`~/.openclaw/openclaw.json`内の`skills.entries.apiyi.apiKey`にキーを保存し、実行時に`APIYI_API_KEY`として注入します。これは、スキルのfrontmatterにある`primaryEnv`フィールドで宣言されています。ファイル構成については、[OpenClaw設定ファイル](/ja/scenarios/agent/openclaw/config-json)を参照してください。
* **CLI**は`npx apiyi@latest auth set-key`を使用して、`~/.config/apiyi/config.json`にモード0600で保存します。

### セルフチェックのステータス

スキルスクリプト、CLI、および手動のcurlは、いずれも同じステータスセットを返します。

| ステータス           | 意味                   | エージェントの動作                                             |
| --------------- | -------------------- | ----------------------------------------------------- |
| `ready`         | `/v1/models`が200を返した | 表示可能なモデル数を伝え、何を構築するか尋ねる                               |
| `no_key`        | どこにもキーが見つからない        | コンソールからキーをコピーするよう案内し、その後再チェックする                       |
| `invalid_key`   | 401または403            | キーが間違っている、無効化されている、または使い切られている。もう一度コピーするよう依頼する        |
| `network_error` | タイムアウト、DNS障害、または5xx  | 1回再試行し、その後`vip.apiyi.com`（中国本土外）または`b.apiyi.com`を提案する |

<Warning>
  通常の`sk-`キーでは**残高を読み取れない**ため、`no_balance`ステータスはありません。残高とログには別のシステムトークンを使用します。[呼び出しログの表示方法](/ja/faq/call-logs)を参照してください。429は、レート制限または残高不足のいずれかを意味する可能性があります。エージェントは推測せず、[コンソール](https://api.apiyi.com/account/profile)を案内する必要があります。
</Warning>

## CLI

コードを書かずにターミナルから最初の呼び出しを実行できます。Node 18 以降で、インストールは不要です。

```bash theme={null}
npx apiyi@latest check
```

<Prompt description="ターミナルコマンドを実行できるエージェントに依頼するか、これらの行を自分で実行してください。" icon="terminal" actions={["copy"]}>
  APIYI CLI のインストールと実行を手伝ってください：[https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
  要件：Node 18 以降。インストール不要で `npx apiyi@latest check` を実行してください。
  API key（`npx apiyi@latest auth set-key` または APIYI\_API\_KEY 環境変数。[https://api.apiyi.com/token](https://api.apiyi.com/token) からコピー）を設定する方法を案内してください。
  最後に `npx apiyi@latest models --grep gpt-5` と `npx apiyi@latest chat "Hello" -m gpt-5.4-mini` を実行し、出力を貼り付けてください。
</Prompt>

### コマンド

| コマンド                                                | 必要なもの      | 動作                                                                                             |
| --------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `apiyi check`                                       | key は任意    | key の取得元、ノードへの到達性、`/v1/models` が 200 を返すかどうか、レイテンシー、ステータスを報告します。システム token が設定されている場合は残高を表示します |
| `apiyi models [--grep text]`                        | key は任意    | key がある場合は、`/v1/models` 経由で key が到達できるモデルを一覧表示します。key がない場合は、公開レジストリを読み取ります                    |
| `apiyi chat "prompt" [-m model] [--stream]`         | key        | Chat Completions リクエストを 1 件送信し、応答と token 使用量を表示します。デフォルトモデルは `gpt-5.4-mini` です                 |
| `apiyi responses "input" [-m model] [--effort low]` | key        | Responses エンドポイントを使用し、`output_text` を表示します                                                     |
| `apiyi image "prompt" -m gpt-image-2 [-o file]`     | key        | 画像を生成し、ローカルファイルに書き込みます。タイムアウトは 360 秒です                                                         |
| `apiyi balance`                                     | システム token | 残高を表示します（500000 クォータ単位 = 1 USD）                                                                |
| `apiyi auth set-key` / `show` / `clear`             | なし         | 非表示入力で key を保存します。`show` は key をマスクし、`clear` は key を削除します                                      |

グローバルフラグ：`--api-key`、`--node api|vip|b|cf`（ノードを選択）、`--base-url`、`--timeout`、`--json`（機械可読な出力）。

### Key の検索順序

`--api-key` フラグ、次に `APIYI_API_KEY` 環境変数、次に `~/.config/apiyi/config.json`、最後に OpenClaw の `~/.openclaw/openclaw.json` の順です。OpenClaw のスキルをすでにインストールしている場合、CLI はその key を再利用します。

### 終了コード

スクリプトやエージェントは、テキストを解析するのではなく終了コードに基づいて分岐します。

| コード | 意味                                         |
| --- | ------------------------------------------ |
| 0   | 成功                                         |
| 2   | `no_key`                                   |
| 3   | `invalid_key`（401 / 403）                   |
| 4   | `network_error`（DNS、タイムアウト、またはリトライ後の 5xx）  |
| 5   | モデルが見つかりません（404。通常は ID のスペルミスです）           |
| 6   | レート制限中、または残高不足です（429）                      |
| 7   | 不正なリクエストです（400。`error.message` をそのまま表示します） |
| 8   | コマンドライン引数が不正です                             |

ソースコードは `github.com/apiyi-com/cli` にあり、npm パッケージは `apiyi` です。古いバージョンをキャッシュする `npx` があるため、ドキュメントでは常に `npx apiyi@latest` と記述します。

## model-registry.json のフィールド

価格表が更新されるたびに、[モデル価格](/en/models)ページと同じデータから再生成されます。トップレベルのフィールド：

| フィールド            | 意味                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `schema_version` | スキーマバージョン。現在は 1 です。各バージョン内では、フィールドは追加のみで、名前が変更されることはありません                                                          |
| `generated_at`   | 生成時刻（UTC）                                                                                                          |
| `base_urls`      | 3 つの SDK それぞれのベース URL、および Gemini `api_version`                                                                     |
| `nodes`          | 利用可能なノードホスト名                                                                                                       |
| `endpoints`      | エンドポイント名からパスとメソッドへの対応：`chat` / `responses` / `messages` / `gemini` / `images` / `embeddings` / `rerank` / `models` |
| `groups`         | グループ名から表示ラベルと比率への対応                                                                                                |
| `models[]`       | 以下を参照してください                                                                                                        |

各モデルエントリ：

| フィールド                                                                   | 意味                                                |
| ----------------------------------------------------------------------- | ------------------------------------------------- |
| `id`                                                                    | リクエストでそのまま使用するモデル ID。大文字と小文字を区別します                |
| `vendor_en`                                                             | 英語でのベンダー名                                         |
| `category`                                                              | `text`、`image`、`video`、`embedding`などの機能タイプ        |
| `endpoints`                                                             | このモデルが受け付けるエンドポイント名。トップレベルの `endpoints` のキーに対応します |
| `groups`                                                                | このモデルを呼び出せる token グループ                            |
| `billing.type`                                                          | `per_token`（100 万 token あたり）または `per_call`        |
| `billing.input_usd_per_m` / `output_usd_per_m` / `cache_read_usd_per_m` | token 単位のモデルにおける USD の定価                          |
| `billing.per_call_usd`                                                  | 呼び出し単位のモデルにおける 1 回あたりの USD の定価                    |
| `billing.tiered`                                                        | 段階的な価格設定が適用されるかどうか（true の場合はモデルページを参照してください）      |
| `docs_url`                                                              | 存在する場合の詳細ページ URL                                  |

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
