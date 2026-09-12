> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Paper2Any - Paper マルチモーダルワークフロー

> APIYI 経由で GPT、Claude、その他の LLM を活用し、学術論文をアーキテクチャ図、技術ロードマップ、PPT プレゼンテーション、反論資料などに変換する、コミュニティ主導のオープンソース論文変換ツールです。

## 概要

Paper2Any は、学術論文向けのオープンソースのマルチモーダルワークフロープラットフォームです。論文 PDF、スクリーンショット、またはテキストを、モデルアーキテクチャ図、技術ロードマップ、実験プロット、PPT プレゼンテーションなどに、ワンクリックで変換できます。

<Info>
  **プロジェクト情報**

  * 🔗 ソースコード: `github.com/OpenDCAI/Paper2Any`
  * 📜 ライセンス: オープンソース
  * 👤 組織: OpenDCAI
  * ⭐ コミュニティ貢献、APIYI 経由で複数の LLM をサポート
</Info>

## Paper2Any が選ばれる理由

<CardGroup cols={2}>
  <Card title="複数の出力形式" icon="layers">
    論文をアーキテクチャ図、ロードマップ、PPT、反論文などに変換できます。研究ワークフロー全体を1つのツールでカバーします
  </Card>

  <Card title="柔軟なモデル選択" icon="sliders-horizontal">
    APIパラメータから GPT-4o、Claude Sonnet、Qwen-VL などを動的に切り替えられます。ハードコーディングは不要です
  </Card>

  <Card title="CLI + Web のデュアルモード" icon="terminal">
    コマンドラインスクリプトと Web インターフェースの両方を用意しており、さまざまなワークフローに対応します
  </Card>

  <Card title="OpenAI互換 API" icon="plug">
    OpenAI互換の API フォーマットをネイティブでサポートします。APIYI の Base URL を設定するだけで、400+ モデルにアクセスできます
  </Card>
</CardGroup>

## コアモジュール

| モジュール              | 説明                             | 出力形式                             |
| ------------------ | ------------------------------ | -------------------------------- |
| **Paper2Figure**   | 論文から科学的なビジュアライゼーションを生成します      | アーキテクチャ図、ロードマップ（PPTX + SVG）、プロット |
| **Paper2Diagram**  | 論文/テキスト/画像からフローチャートを作成します      | draw\.io / PNG / SVG             |
| **Paper2PPT**      | 論文をプレゼンテーションに変換します             | PPTX（40枚以上のスライドをサポート）            |
| **Paper2Rebuttal** | 構造化された反論応答を生成します               | エビデンスに基づく反論文書                    |
| **PDF2PPT**        | レイアウトを保持したままPDFを編集可能なPPTに変換します | PPTX                             |
| **Image2PPT**      | 画像/スクリーンショットをスライドに変換します        | PPTX                             |
| **PPTPolish**      | AI駆動のレイアウト最適化                  | PPTX                             |
| **Knowledge Base** | ファイルの取り込み、セマンティック検索、KB駆動の生成    | 複数形式                             |

## APIYI 経由で LLM に接続する

Paper2Any は OpenAI 互換の API 形式に対応しています。APIYI を LLM エンドポイントとして設定すると、GPT、Claude、Gemini、DeepSeek、および 400+ の他のモデルを使用できます。

### Docker デプロイ

<Steps>
  <Step title="ステップ 1: APIYI API キーを取得する">
    1. [APIYI コンソール](https://api.apiyi.com) にアクセスして登録/ログインする
    2. **Tokens** セクションに移動する
    3. 新しい API キーを生成する
    4. キーをコピーする（`sk-` で始まります）
  </Step>

  <Step title="ステップ 2: バックエンドをクローンして設定する">
    リポジトリをクローンしたら、`fastapi_app/.env` を編集して APIYI を LLM エンドポイントとして設定します:

    ```bash theme={null}
    # fastapi_app/.env
    DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    BACKEND_API_KEY=sk-your-apiyi-key
    ```

    必要に応じて、ワークフローごとのデフォルトモデルを指定できます:

    ```bash theme={null}
    PAPER2PPT_DEFAULT_MODEL=gpt-4o
    PDF2PPT_DEFAULT_MODEL=gpt-4o
    ```
  </Step>

  <Step title="ステップ 3: フロントエンドを設定する">
    `frontend-workflow/.env` を編集して、Web UI のデフォルトを APIYI に設定します:

    ```bash theme={null}
    # frontend-workflow/.env
    VITE_DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    VITE_LLM_API_URLS=https://api.apiyi.com/v1
    ```
  </Step>

  <Step title="ステップ 4: 起動する">
    Docker Compose で全体を起動します:

    ```bash theme={null}
    docker compose up -d --build
    ```

    起動したら、フロントエンドを開いて Paper2Any の使用を開始します。
  </Step>
</Steps>

### CLI の使用方法

Paper2Any は、APIYI を直接統合するための `--api-url` および `--api-key` パラメータ付きのスタンドアロン CLI スクリプトを提供しています:

```bash theme={null}
# Paper to PPT
python script/run_paper2ppt_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --model gpt-4o

# Paper to Figure
python script/run_paper2figure_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --graph-type model_arch
```

<Tip>
  **モデルの推奨**: 論文から PPT への変換には、長文理解と構造化された出力能力に優れた GPT-4o または Claude Sonnet 4.5 が推奨されます。図の生成には、Qwen-VL のようなビジョンモデルも試す価値があります。
</Tip>

## デプロイオプション

| 方法              | 要件                                      | 最適な用途          |
| --------------- | --------------------------------------- | -------------- |
| **Docker（推奨）**  | フロントエンド + バックエンドをワンクリックで起動              | すばやい開始、プロダクション |
| **Linux ネイティブ** | Python 3.11+、LaTeX、Inkscape、LibreOffice | 開発、カスタマイズ      |
| **Windows**     | Python 3.12、Inkscape                    | ローカル利用         |

<Warning>
  PDF2PPT や Image2PPT などの GPU 依存機能には、別個の SAM3 モデルサーバーが必要です。GPU デプロイ手順はプロジェクトの README を参照してください。
</Warning>

## よくある質問

<AccordionGroup>
  <Accordion title="Paper2Any を APIYI モデルに接続するにはどうすればよいですか？">
    `DEFAULT_LLM_API_URL` を `https://api.apiyi.com/v1` に、`BACKEND_API_KEY` を APIYI キーに、環境変数で設定してください。CLI モードでは、`--api-url` と `--api-key` パラメータを使用します。
  </Accordion>

  <Accordion title="どのモデルがサポートされていますか？">
    APIYI 経由で、GPT-4o、Claude Sonnet 4.5、Gemini、DeepSeek、Qwen などを含む 400 以上のモデルにアクセスできます。モデルはコード変更なしで Web インターフェース上で動的に切り替えられます。
  </Accordion>

  <Accordion title="Docker の起動に失敗します — 何を確認すればよいですか？">
    次を確認してください:

    1. Docker と Docker Compose が正しくインストールされている
    2. `.env` ファイルが正しく設定されている
    3. 必要なポートが使用中でない
    4. 詳細なエラーメッセージについては `docker compose logs` を確認する
  </Accordion>

  <Accordion title="PPT 生成でエラーが出る、または内容が不完全ですか？">
    * APIYI アカウントの残高が十分であることを確認してください
    * 長い論文では、より大きなコンテキストウィンドウを持つモデルを使用してください（例: GPT-4o 128K）
    * 論文 PDF が検索可能なテキストであることを確認してください（スキャンされた PDF では結果が悪くなる場合があります）
  </Accordion>

  <Accordion title="APIYI APIキーを取得するにはどうすればよいですか？">
    [APIYI コンソール](https://api.apiyi.com/token) にアクセスし、アカウントを作成して、Tokens セクションで新しいキーを生成してください。新規ユーザーには無料トライアルクレジットが付与されます。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="APIYI Model List" icon="list" href="/ja/api-capabilities/model-info">
    APIYI がサポートする 400 以上のモデルの完全一覧を確認できます
  </Card>

  <Card title="Base URL Configuration" icon="settings" href="/ja/faq/base-url-config">
    さまざまなツールで APIYI の Base URL を設定する方法を学べます
  </Card>

  <Card title="APIYI Token Management" icon="key" href="https://api.apiyi.com/token">
    API key を管理し、使用状況と残高を確認できます
  </Card>

  <Card title="APIYI Pricing" icon="banknote" href="https://api.apiyi.com/account/pricing">
    モデル料金とチャージ特典を確認できます
  </Card>
</CardGroup>
