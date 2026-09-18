> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek ハーネス

> Web UI、ヘッドレス CLI、Python SDK に対応した、DeepSeek AI のオープンソース・プラグインベース AI エージェント・ハーネス

## 概要

DeepSeek Harness（`dsh`）は、DeepSeek AI が開発したオープンソースの AI エージェントハーネスです。「すべてがプラグイン」というアーキテクチャに従い、モデル、ツール、ファイルシステム、ターミナル、セッション、ワークフローを組み合わせて、拡張可能なエージェントランタイムを構築できます。

APIYI を使用すると、DeepSeek Harness をローカルで実行し、APIYI の OpenAI 互換エンドポイントでモデルを設定したり、開発タスクを実行したり、永続セッションを維持したりできます。

<CardGroup cols={2}>
  <Card title="🧩 プラグインベースのアーキテクチャ" icon="puzzle">
    プラグインを通じてモデル、ツール、セッション、ワークフローを組み合わせ、必要に応じてエージェントを拡張できます。
  </Card>

  <Card title="🌐 Web UI" icon="globe">
    1つのコマンドでローカル Web UI を起動し、ブラウザでモデル、ワークスペース、セッションを設定できます。
  </Card>

  <Card title="⌨️ ヘッドレス CLI" icon="terminal">
    コマンドラインから単発タスクを送信し、自動化スクリプト、バッチジョブ、開発ワークフローに利用できます。
  </Card>

  <Card title="💾 永続セッション" icon="database">
    セッション、ツール呼び出し、ワークスペースの状態を永続化して、タスクを継続したり、実行をトラブルシューティングしたりできます。
  </Card>
</CardGroup>

<Info>
  **プロジェクト情報**: DeepSeek Harness は MIT ライセンスで公開されているオープンソースです。プロジェクトリポジトリは `github.com/deepseek-ai/deepseek-harness` です。現在は Developer Preview 段階であるため、今後のリリースには互換性を損なう変更が含まれる可能性があります。
</Info>

## インストールと起動

### npm で Web UI を起動する

Node.js をインストールしてから、次を実行します。

```bash theme={null}
npx @deepseek-ai/dsh web
```

サーバーが起動したら、`http://127.0.0.1:3080` を開きます。初回起動時は、Web UI のモデル設定から APIYI を設定します。

### ソースから実行する

リポジトリのソースを実行する場合、またはプロジェクトに貢献する場合は、次を実行します。

```bash theme={null}
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

### ヘッドレス CLI を使用する

ソースからビルドした後、次のコマンドで単発タスクを送信します。

```bash theme={null}
pnpm dsh --profile headless "Inspect the repository and explain the failing tests."
```

## APIYIへの接続

DeepSeek Harnessは、ネイティブのDeepSeekルートと、`llm-pi-ai`に基づくマルチプロバイダールートをサポートしています。現在の設定では、`apiyi`プロバイダー、`openai-responses`プロトコル、`https://api.apiyi.com/v1`エンドポイントを使用しています。デフォルトモデルは`deepseek-v4-pro-0813`です。

設定ファイルは`$DSH_HOME/settings.yaml`です。`DSH_HOME`が設定されていない場合、Windowsのデフォルトの場所は通常`C:\Users\Administrator\.dsh\settings.yaml`です。

### オプション1：Web UIから設定する（推奨）

<Steps>
  <Step title="APIYIトークンを用意する">
    APIYIコンソールでトークンを作成します。実際のトークンをプロジェクトファイル、シェル履歴、公開ログに絶対にコミットしないでください。
  </Step>

  <Step title="モデル設定を開く">
    Web UIを起動し、**設定 → モデル**を開いて、**カスタムプロバイダーを追加**を選択します。
  </Step>

  <Step title="プロバイダーの詳細を入力する">
    開始点として、以下の値を使用します。

    | フィールド      | 推奨値                        |
    | ---------- | -------------------------- |
    | プロバイダーID   | `apiyi`                    |
    | 表示名        | `apiyi`                    |
    | ベースURL     | `https://api.apiyi.com/v1` |
    | APIプロトコル   | `openai-responses`         |
    | 認証情報リファレンス | `APIYI_API_KEY`            |
    | モデル        | `deepseek-v4-pro-0813`     |

    現在の設定では、`deepseek-v4-pro-0813`をデフォルトモデルとして使用しています。また、設定ファイルにはその他のAPIYIモデルも保持されています。モデルを切り替える場合は、現在のAPIYIモデル一覧を使用してください。
  </Step>

  <Step title="保存してモデルを選択する">
    プロバイダーを保存し、新しく追加したモデルをモデルピッカーで選択してから、新しいセッションを開始し、接続をテストします。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-config.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=283844b8bb9f276b3236661422af5be3" alt="DeepSeek Harness APIYIカスタムプロバイダー設定" width="655" height="526" data-path="images/deepseek-harness-model-config.png" />

<Tip>
  Web UIでキーを保存すると、DeepSeek Harnessはキーをローカルの認証情報ストアに保存し、マスク済みのディスクリプタのみをページに返します。設定の変更は次のリクエストから有効になり、通常はWeb UIの再起動を必要としません。
</Tip>

### オプション2：settings.yamlを設定する

ファイルベースの設定では、`$DSH_HOME/settings.yaml`にAPIYIプロバイダーを宣言し、環境変数を通じてトークンを参照します。

```yaml theme={null}
llm-pi-ai:
  providers:
    apiyi:
      displayName: apiyi
      apiKeyEnv: APIYI_API_KEY
      api: openai-responses
      baseURL: https://api.apiyi.com/v1
      models:
        - id: deepseek-v4-pro-0813
```

macOSまたはLinux：

```bash theme={null}
export APIYI_API_KEY=YOUR_API_KEY
```

Windows PowerShell：

```powershell theme={null}
$env:APIYI_API_KEY = "YOUR_API_KEY"
```

`apiKeyEnv`は認証情報リファレンスにすぎません。実際のトークンを`settings.yaml`に記述しないでください。別のモデルを追加するには、そのモデルIDを`models`リストに追加します。

## 一般的な使用パターン

### ローカル Web エージェント

ブラウザベースの Web UI を使用して、コード分析、ファイル整理、テストのデバッグ、プロジェクトのメンテナンスを行います。セッション用のワークスペースを選択し、目的と制約を自然言語で説明します。

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-chat.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=8e9ed8c8428b7a3fd8618db5c6ec5bbb" alt="DeepSeek ハーネスのローカル Web エージェントのチャットインターフェース" width="934" height="758" data-path="images/deepseek-harness-model-chat.png" />

### 自動化タスク

ヘッドレスプロファイルは 1 つのタスクを実行して最終レスポンスを出力するため、ローカルスクリプトや自動化ワークフローに適しています。

```bash theme={null}
pnpm dsh --profile headless "Review the changed files and summarize possible regressions."
```

### Python SDK

DeepSeek ハーネスは `deepseek-harness-sdk` を提供しており、Python からランタイムを起動してエージェントを呼び出せます。バンドルされた Python ランタイムはデフォルトで `deepseek-official` を使用する点に注意してください。現在の Web/ヘッドレス構成で使用されている `apiyi` ルートを自動的に継承することはありません。

```bash theme={null}
python -m pip install deepseek-harness-sdk
```

```python theme={null}
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness(
    provider="apiyi",
    model="deepseek-v4-pro-0813",
    cwd="/absolute/path/to/workspace",
    session_root="/absolute/path/to/sessions",
    cordis="/absolute/path/to/apiyi.cordis.yml",
) as harness:
    result = harness.run(
        "Inspect the repository and summarize the failing tests.",
        session_id="example-001",
    )

print(result.final_response)
```

上記の `apiyi` ルートを使用するには、カスタム Cordis 構成で `@deepseek-ai/dsh-llm-pi-ai` をマウントし、`apiKeyEnv: APIYI_API_KEY`、`api: openai-responses`、および APIYI モデル一覧を `settings.yaml` または構成設定から提供する必要があります。

Python SDK ガイドでは、バンドルされた永続ターミナル構成について、Linux x64、Linux arm64、および arm64 上の macOS 14 以降を対象としています。この構成は Windows エージェントをサポートしていません。Windows ユーザーは Web UI または CLI を優先してください。

## モデル選択

APIYI のモデルは継続的に更新されます。本番モデルを選択する前に、最新のモデル一覧、機能、使用に関する推奨事項を確認してください。

<Card title="最新のモデル推奨事項を表示" icon="star" href="/ja/api-capabilities/model-info">
  現在のモデル推奨事項、機能比較、使用ガイダンスを確認してください。APIYI のモデル一覧で現在利用可能なモデル ID を使用してください。
</Card>

## ベストプラクティス

* 独立したタスクごとに個別のセッション ID を使用してください。同じ会話と永続的なシェル状態を継続する必要がある場合にのみ、既存の ID を再利用してください。
* Python SDK の例では書き込み可能なワークスペースと `danger-full-access` コンポジションを使用します。使い捨てのチェックアウトまたはコンテナ内で実行してください。
* API キーを `cordis.yml`、`settings.yaml`、ソースコード、またはコミットログに記述しないでください。Web UI の認証情報ストアまたは環境変数参照を使用してください。
* DeepSeek Harness は開発者プレビューです。アップグレードする前に、プラグイン設定とモデルルートの互換性が維持されていることを確認してください。

## よくある質問

<AccordionGroup>
  <Accordion title="現在の設定では、どのプロバイダーとモデルが使用されていますか？">
    現在の設定では、`apiyi`プロバイダー、`openai-responses`プロトコル、`https://api.apiyi.com/v1`ベース URL、およびデフォルトモデルとして`deepseek-v4-pro-0813`が使用されています。
  </Accordion>

  <Accordion title="APIYI では、どのベース URL とプロトコルを使用すべきですか？">
    現在の設定に合わせて、ベース URL には`https://api.apiyi.com/v1`を、プロトコルには`openai-responses`を使用してください。エンドポイントの互換性を確認せずにプロトコルを変更しないでください。
  </Accordion>

  <Accordion title="モデルピッカーに使用したいモデルが表示されないのはなぜですか？">
    プロバイダー ID が空でない小文字の値であること、モデル ID が正しいこと、保存済みの設定が`llm-pi-ai`プロバイダーに属していることを確認してください。現在のデフォルトは`deepseek-v4-pro-0813`です。カスタムモデルを選択するには、事前に`models`リストに追加する必要があります。
  </Accordion>

  <Accordion title="MISSING_CREDENTIAL を修正するにはどうすればよいですか？">
    Web UI で **設定 → モデル** に戻り、プロバイダーの認証情報を保存してください。`settings.yaml`を使用している場合は、`APIYI_API_KEY`が設定されていること、および`apiKeyEnv`がその環境変数を指していることを確認してください。
  </Accordion>

  <Accordion title="モデル検出で 401 が返された場合はどうすればよいですか？">
    まず APIYI の token とベース URL を確認してください。DeepSeek ハーネスは、OpenAI 互換のカスタムプロバイダーでのモデル検出に`GET /models`を使用します。エンドポイントにそのルートがない場合は、モデル ID を手動で入力してください。
  </Accordion>

  <Accordion title="Windows で Python SDK を実行できますか？">
    同梱の永続ターミナル構成は Windows エージェントをサポートしていません。Windows ユーザーは Web UI または CLI を使用できます。Python SDK については、プロジェクトドキュメントに記載されているプラットフォーム要件に従ってください。
  </Accordion>

  <Accordion title="アップグレードによって設定が壊れた場合はどうすればよいですか？">
    このプロジェクトは Developer Preview 段階であるため、アップグレードに破壊的変更が含まれる場合があります。最新のプロジェクトドキュメントを参照して、プロバイダー設定、モデル ID、およびプラグイン構成を再確認してください。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="APIYI クイックスタート" icon="book" href="/ja/getting-started">
    API キーを取得し、基本 URL と API の基本的な使用方法について学びます。
  </Card>

  <Card title="APIYI モデルの推奨事項" icon="star" href="/ja/api-capabilities/model-info">
    現在のモデル、機能、使用方法に関するガイダンスを確認します。
  </Card>

  <Card title="DeepSeek Harness リポジトリ" icon="github">
    `github.com/deepseek-ai/deepseek-harness`
  </Card>

  <Card title="DeepSeek Harness プロバイダー設定" icon="settings">
    プロバイダー、認証情報、モデル設定については、プロジェクトのドキュメントを確認してください。
  </Card>
</CardGroup>

## ヘルプを利用する

<CardGroup cols={2}>
  <Card title="企業向けWeChatサポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業向けWeChatサポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    スキャンしてサポートを追加するか、[サポートに直接お問い合わせください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    APIYIの設定、DeepSeek Harnessの統合、利用方法の案内
  </Card>

  <Card title="メールサポート" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネスに関するお問い合わせ**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  サポートにお問い合わせの際は、問題をより迅速に診断できるよう、プロバイダー、モデルID、ベースURL、APIプロトコル、エラーメッセージ、Node.jsのバージョン、利用モード、関連するスクリーンショットを含めてください。
</Tip>
