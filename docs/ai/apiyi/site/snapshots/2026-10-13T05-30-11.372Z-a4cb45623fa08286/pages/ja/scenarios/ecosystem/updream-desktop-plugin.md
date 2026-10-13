> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Updream Desktop と APIYI の連携

> hellojint/updream-openai-compatible-plugin プラグインを使用して、Updream Desktop v0.2.0 からの画像生成タスクを APIYI の OpenAI 互換画像エンドポイントに転送します。ローカルでの実行やローカルでの認証情報の保存が必要なシナリオに適しています。

## 概要

プラグイン `hellojint/updream-openai-compatible-plugin`（GitHub）は、**汎用 OpenAI 互換画像**プロトコルに対応した **Updream Desktop v0.2.0** 向けのオープンソース画像生成プラグインです。インストールすると、デスクトップクライアントは OpenAI Images インターフェースに準拠する任意のサードパーティ API アップストリームに画像生成リクエストを転送します —— **APIYI は API パスにおいてこの要件を満たしています**。

<Info>
  **プロジェクト情報**

  * ソース: `github.com/hellojint/updream-openai-compatible-plugin` (GitHub)
  * ライセンス: MIT
  * 作者: hellojint
  * プラグインパッケージ名: `updream-openai-compatible-v1.updplugin`
  * ベース: 公式 Updream プラグイン作成ガイドの OpenAI 画像プロバイダーサンプル
</Info>

<Tip>
  **2 つの統合パス**

  「ローカルでのタスク実行 / ローカルでの認証情報保存」を必要としない場合は、**Updream ウェブクライアントをおすすめします**:
  [Updream と APIYI の統合（ウェブ）](/ja/scenarios/agent/updream)。ウェブクライアントは、**「外部モデルコネクタ」スキル + OpenAI 互換**プロトコル経由で APIYI に接続し、**プラグインのインストールは不要です** —— ほとんどのユーザーにとって推奨されるパスです。

  ここで説明するデスクトップ + プラグインのパスは、API キーをローカルに保持する必要があるユーザー、バッチ画像生成ジョブを実行するユーザー、またはウェブクライアントで OpenAI Images プロトコルの制限に達したユーザー向けです。
</Tip>

## コア機能

<CardGroup cols={2}>
  <Card title="汎用的なOpenAI互換プロトコル" icon="workflow">
    `/v1/images/generations`を公開し、`Bearer`で認証を行う任意のアップストリームで動作します。APIYIはこれを満たしています。
  </Card>

  <Card title="デスクトップ上でのローカル実行" icon="monitor">
    タスクはUpdream Desktop v0.2.0でローカルに実行され、Webキャンバスに結果を返します。
  </Card>

  <Card title="APIキーのローカル保存" icon="key">
    キーはUpdreamのシステムキーチェーンに保持され、実行時に読み取られます。プラグイン自体には認証情報は同梱されていません。
  </Card>

  <Card title="複数のプロバイダーの併用" icon="layers">
    デスクトップクライアントは複数のプロバイダー（例: `openai`、`apiyi-compatible`）を保持し、それらを切り替えることができます。
  </Card>

  <Card title="サイズの自動マッピング" icon="ratio">
    デスクトップの鮮明度とアスペクト比は、アップストリームの`size`パラメーターに自動マッピングされます。ハードコードされた`extra.size`はこのマッピングを上書きします。
  </Card>

  <Card title="複数のレスポンス形式" icon="image">
    `data[].url`、`data[].b64_json`、トップレベルの`url`などに対応しています。MIMEはBase64から判別されます。
  </Card>
</CardGroup>

## APIYI モデル例

以下のIDは**エンドポイント ID**フィールドに入力できます。これらはあくまで例です：

| モデル名 | モデル ID | ユースケース |
| - | - | - |
| GPT Image（例） | `gpt-image-1` | 高品質な画像生成 |
| GPT Image v2（例） | `gpt-image-2` | 最新世代（提供状況はAPIYIの現在のモデル一覧に依存します） |
| Nano Banana（例） | `nano-banana` | Googleの画像モデルファミリー |
| Gemini Flash Image（著者のスクリーンショット例） | `gemini-3.1-flash-image` | 高速かつ低コスト |

> 実際にサポートされているモデルは、[APIYI 推奨モデル](/ja/api-capabilities/model-info)ページに記載されています。この表は、プラグインが受け付けるフィールド形式を示しているに過ぎません。

## プラグイン設定項目

プラグインがデスクトップクライアントに読み込まれると、**APIキーの追加**フォームには以下の項目が表示されます：

| フィールド | 必須 | 説明 |
| - | - | - |
| **設定名** | はい | リスト内のプロバイダーを区別するためのカスタムラベル（例：`apiyi-compatible`） |
| **プロトコルタイプ** | はい | **汎用 OpenAI 互換画像**を選択 |
| **生成タイプ** | はい | `image` を選択 |
| **APIキー** | はい | APIYI プラットフォームキー。Updream のキーチェーンに保存され、実行時に読み込まれます |
| **API ベース URL** | はい | アップストリームのベース URL。APIYI では `https://api.apiyi.com/v1` を使用します |
| **モデル** | はい | デフォルト（エンドポイント ID と同じ）、または明示的に選択します |
| **エンドポイント ID** | いいえ | 設定すると、モデルフィールドを**上書き**して最終的な `model` の値となります。通常はモデル ID 文字列です |
| **プロキシを使用** | いいえ | 必要に応じて、このプロバイダーをグローバルプロキシ経由でルーティングします |

APIキーは機密情報です。**実際のキーをスクリーンショット、ドキュメント、Issue、README、またはチャットに貼り付けないでください。**[APIYI コンソール](https://www.apiyi.com)でデスクトップクライアント専用の利用上限付きキーを作成し、使用が終わったら失効させてください。

## インストールと設定（手順ガイド）

### ステップ 0: デスクトップクライアントの概要

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-task-overview.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=b2431a85db7a53efd727fad1b51cf896" alt="Updream Desktop のタスク概要 (v0.2.0)" width="1200" height="811" data-path="images/updream-desktop-task-overview.png" />

v0.2.0 のデフォルトレイアウト：左側に「Local execution（ローカル実行）」タスクリスト、上部バーに **Sync / Add Key / Import Plugin / Manage Plugins**、右下にバージョンラベル `v0.2.0` が表示されます。

### ステップ 1: プラグインのインポート

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-import-plugin.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=8f63d49aa37892c70145edcf2bb03300" alt="デスクトップ上部バーの「Import Plugin」エントリ" width="1194" height="70" data-path="images/updream-desktop-import-plugin.png" />

上部にある **Import Plugin** ボタンをクリックします。ファイルピッカーでダウンロードした `updream-openai-compatible-v1.updplugin` を選択し、確認を求められたら**インストールを承認**（confirm the install）します。作者は承認前に `plugin.py` を確認することを推奨しています。

### ステップ 2: インストールの確認

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-plugin-installed.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=d0a9cd5d819da625a4cb95a13fb1309e" alt="プラグインのインストール状態" width="609" height="169" data-path="images/updream-desktop-plugin-installed.png" />

**Manage Plugins** ページに **Universal OpenAI-compatible Image** (universal-openai-compatible-image · v1.0.0 · image) が表示されます。この時点で、デスクトップクライアントは任意の OpenAI Images 互換のアップストリームを呼び出す準備が整いました。

### ステップ 3: キーの追加

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-add-key.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=720b99501217ca1651ba3676211c0b94" alt="デスクトップ上部バーの「Add Key」エントリ" width="1193" height="144" data-path="images/updream-desktop-add-key.png" />

**Add Key** ボタンをクリックして設定フォームを開きます。

### ステップ 4: APIYI の設定

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-config-apiyi.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=3c52f8755f39c1d6330ec97772e4484a" alt="APIYI の設定例" width="514" height="668" data-path="images/updream-desktop-config-apiyi.png" />

スクリーンショットの例に従ってフォームに入力します。

| フィールド | 例 |
| - | - |
| 設定名 | `apiyi-compatible` |
| プロトコルタイプ | Universal OpenAI-compatible Image |
| 生成タイプ | `image` |
| API-Key | お客様の APIYI プラットフォームキー（実行時に読み取られ、コードには一切書き込まれません） |
| API base URL | `https://api.apiyi.com/v1` |
| モデル | デフォルト（エンドポイント ID と同一） |
| エンドポイント ID | `gemini-3.1-flash-image`（APIYI モデルドキュメントから取得） |

**Test connection** と **Test generation** をクリックします。**Connection succeeded! API available** と表示されたら、設定を保存します。

### ステップ 5: プロバイダーが有効になっていることを確認

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-provider-list.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=1357b08d7da971ce18923f71e62e1d80" alt="プロバイダー一覧" width="807" height="407" data-path="images/updream-desktop-provider-list.png" />

**Configuration** ページのプロバイダーリストに、新しく `apiyi-compatible` のエントリが表示されます。そのプロバイダー識別子は `plugin:universal-openai-compatible-image` で、ステータスは **Enabled** になっています。プロバイダーの切り替えや無効化はいつでも行えます。

<Tip>
  デスクトップでの設定完了後、Updream の **Webクライアント** を再度開きます。キャンバスノードの画像生成プロバイダードロップダウンで `apiyi-compatible` を選択すると、Webクライアントからタスクを発行し、デスクトップクライアントで実行させることができます。
</Tip>

## 使用方法: Web → デスクトップ → Web ループ

上記の5つのステップの後、**Updream Webクライアント**から画像生成を実行すると、デスクトップ側の `apiyi-compatible` プロバイダーが使用され、`https://api.apiyi.com/v1/images/generations` へ転送されます。生成結果はWebキャンバスのノードへと戻されます。

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-web-recv-from-desktop.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=383de779592d3d3a270db2ca330bd158" alt="デスクトップクライアントから生成結果を受信するWebクライアント" width="891" height="611" data-path="images/updream-web-recv-from-desktop.png" />

スクリーンショットでは、キャンバスの下のパネルに「画像生成 + `apiyi-compatible`（矢印の位置）+ `16:9 / 2K / ×1`」と表示されています。これは、Updream Webクライアントで開始され、デスクトップクライアントで実行されてWebキャンバスに戻ったタスクの視覚的な結果です。

## よくある質問

<AccordionGroup>
  <Accordion title="デスクトップクライアントに「プラグインをインポート」ボタンが表示されません">
    デスクトップクライアントのバージョンが **≥ v0.2.0** であることを確認してください。以前のバージョンにはプラグインのサポートがないため、まずUpdream Desktopをアップグレードする必要があります。
  </Accordion>

  <Accordion title="プラグインのインポート後、プロトコルのドロップダウンに「Universal OpenAI-compatible Image」が表示されません">
    1. `.updplugin`アーカイブのルート直下に`plugin.py`が含まれており、`manifest.entry`と一致していることを確認します
    2. デスクトップクライアントを再起動します
    3. **プラグイン管理**ページで、プラグインのステータスが**無効**になっていないことを確認します
  </Accordion>

  <Accordion title="接続テストは成功するのに生成に失敗します">
    1. **エンドポイントID**のスペルが正しく、APIYIの最新モデルリストに存在することを確認します
    2. アカウント残高が十分であることを確認します（[残高があるにもかかわらずアカウントで失敗するのはなぜですか？](/ja/faq/balance-insufficient)を参照）
    3. デスクトップクライアントの**ローカル実行**ページで詳細なエラーコードを確認します
  </Accordion>

  <Accordion title="デスクトップクライアントでは動作するのに、Webクライアントで同じプロバイダーを利用できないのはなぜですか？">
    Webクライアントはこのプラグインを経由しません。OpenAI互換プロトコル設定でWebクライアントの**外部モデルコネクター**スキルを使用するか、[APIYIとUpdreamの連携（Web）](/ja/scenarios/agent/updream)を参照してください。
  </Accordion>

  <Accordion title="プラグインを再パッケージ化するにはどうすればよいですか？">
    `manifest.json.version`を更新し、再パッケージ化します：

    ```bash theme={null}
    zip -r updream-openai-compatible-v1.updplugin plugin.py manifest.json README.md
    ```

    ZIPアーカイブのルート直下に`plugin.py`が含まれている必要があります。
  </Accordion>

  <Accordion title="APIキーがプラグインのコードやログに残ることはありますか？">
    いいえ。プラグインには**認証情報は一切含まれていません**。キーはUpdreamのキーチェーンに保存され、実行時に`cfg.get('api_key')`経由で読み込まれます。実際のキーを`plugin.py`、README、Issue、チャットなどに貼り付けないでください。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="APIYIとのUpdream連携（Web版、推奨）" icon="globe" href="/ja/scenarios/agent/updream">
    Webクライアントは**External Model Connector**スキルを通じてAPIYIに接続します — プラグインは不要です
  </Card>

  <Card title="hellojint/updream-openai-compatible-plugin" icon="github">
    このドキュメントが基づいているオープンソースリポジトリ（MITライセンス）：`github.com/hellojint/updream-openai-compatible-plugin`
  </Card>

  <Card title="APIYI推奨モデル" icon="star" href="/ja/api-capabilities/model-info">
    現在APIYIでサポートされている画像モデルと料金を確認できます
  </Card>

  <Card title="APIYI APIキー管理" icon="key" href="/ja/faq/token-management">
    APIキーの作成と管理に関するベストプラクティス
  </Card>

  <Card title="APIYIコンソール" icon="settings" href="https://www.apiyi.com">
    専用キーの作成、使用量の確認、残高上限の設定を行えます
  </Card>

  <Card title="APIYIの連携と利用方法" icon="book" href="/ja/getting-started">
    API連携およびOpenAI互換プロトコルの概要
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.