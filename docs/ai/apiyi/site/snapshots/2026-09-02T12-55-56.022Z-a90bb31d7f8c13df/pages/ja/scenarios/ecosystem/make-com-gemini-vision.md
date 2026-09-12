> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Make.com + Gemini 画像理解

> Make.com の HTTP request ノードを使って APIYI の Gemini 画像理解 API を呼び出し、コードなしで自動化された画像解析、OCR、マルチモーダルワークフローを実現します。

## 概要

Make.com（旧 Integromat）は、強力なノーコード自動化プラットフォームです。標準搭載の **HTTP requestノード（Make a request）** を使うと、APIYI の Gemini ネイティブ形式 API を直接呼び出して、画像理解、コンテンツ分析、その他のマルチモーダル自動化ワークフローに利用できます — コーディングは不要です。

<Info>
  **統合情報**

  * 🔧 ツール: Make.com (`make.com`)
  * 🔌 統合: HTTP requestノード (Make a request)
  * 🤖 モデル: Geminiシリーズ（APIYI Gemini ネイティブ形式経由）
  * 📡 APIエンドポイント: `https://api.apiyi.com/v1beta/models/{model}:generateContent`
</Info>

## Make.com + APIYI を使う理由

<CardGroup cols={2}>
  <Card title="ゼロコード統合" icon="wand-sparkles">
    ビジュアルなドラッグ＆ドロップで HTTP リクエストノードを設定でき、AIモデルを呼び出すのにコーディングは不要です
  </Card>

  <Card title="自動化ワークフロー" icon="refresh-cw">
    Make.com のトリガーや条件ロジックと組み合わせて、画像処理の自動化を構築できます
  </Card>

  <Card title="マルチモデル対応" icon="layers">
    APIYI は 400+ モデルをサポートしており、1つの API key で Make.com のさまざまな AI 機能を切り替えられます
  </Card>

  <Card title="柔軟な拡張性" icon="puzzle">
    Google Sheets、Slack、Email など 1000+ のアプリとシームレスに接続できます
  </Card>
</CardGroup>

## 対応している APIYI モデル

| モデル名                   | モデル ID                   | 用途          | API ドキュメント                                      |
| ---------------------- | ------------------------ | ----------- | ----------------------------------------------- |
| Gemini 3.1 Pro Preview | `gemini-3.1-pro-preview` | 画像理解、テキスト生成 | [ドキュメントを見る](/ja/api-capabilities/gemini/native) |
| Gemini 3 Pro Preview   | `gemini-3-pro-preview`   | 画像理解、画像生成   | [ドキュメントを見る](/ja/api-capabilities/gemini/native) |
| Gemini 3 Flash Preview | `gemini-3-flash-preview` | 画像理解（高速）    | [ドキュメントを見る](/ja/api-capabilities/gemini/native) |

<Tip>
  推奨: 画像理解機能が最も強力な `gemini-3.1-pro-preview` をお選びください。より高速にするには、Flash シリーズを選択してください。
</Tip>

## セットアップ手順

<Steps>
  <Step title="Step 1: APIYI API Key を取得する">
    1. [APIYI コンソール](https://api.apiyi.com) にアクセスして登録/ログインします
    2. **Tokens** セクションに移動し、新しい API key を生成します
    3. キーをコピーします（`sk-` で始まります）。設定で必要になります
  </Step>

  <Step title="Step 2: Make.com のシナリオを作成する">
    1. Make.com にログインして、**新しいシナリオを作成** をクリックします
    2. **+** をクリックしてモジュールを追加します
    3. **HTTP** モジュールを検索して選択します
    4. アクションで、**リクエストを作成** を選択します
  </Step>

  <Step title="Step 3: HTTP リクエストノードを設定する">
    HTTP リクエストノードに以下の設定を入力します:

    **URL**:

    ```
    https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent
    ```

    **Method**: `POST`

    **Headers**:

    | ヘッダー名           | 値                          |
    | --------------- | -------------------------- |
    | `Content-Type`  | `application/json`         |
    | `Authorization` | `Bearer sk-your-APIYI-key` |

    **Body type**: `Raw`

    **Content type**: `JSON (application/json)`

    **Request content (Body)**:

    ```json theme={null}
    {
      "contents": [
        {
          "parts": [
            {
              "text": "What is in this image?"
            },
            {
              "fileData": {
                "mimeType": "image/png",
                "fileUri": "https://your-image-url-here"
              }
            }
          ]
        }
      ]
    }
    ```
  </Step>

  <Step title="Step 4: テスト実行">
    **Run once** をクリックしてリクエストをテストし、正しい画像理解結果が返ることを確認します。
  </Step>
</Steps>

## 完全なリクエスト例

こちらは、カワウソの画像を解析する画像理解リクエストの完全な例です。

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "What is in this image?"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png"
          }
        }
      ]
    }
  ]
}
```

### リクエストパラメータ

| フィールド                       | 型      | 必須  | 説明                                                    |
| --------------------------- | ------ | --- | ----------------------------------------------------- |
| `contents`                  | array  | Yes | 会話内容の配列                                               |
| `contents[].parts`          | array  | Yes | メッセージのパーツ（テキスト + 画像）                                  |
| `parts[].text`              | string | Yes | ユーザーのテキスト prompt                                      |
| `parts[].fileData.mimeType` | string | Yes | 画像フォーマット: `image/png`, `image/jpeg`, `image/webp`, など |
| `parts[].fileData.fileUri`  | string | Yes | 公開アクセス可能な画像 URL                                       |

<Warning>
  `fileUri` は、**公開アクセス可能**な画像 URL である必要があります。画像に認証が必要な場合は、先に公開ストレージサービスへアップロードしてください。
</Warning>

## 実践的なシナリオ

### シナリオ 1: メール添付画像の自動分析

1. **トリガー**: Gmail - Watch emails（新着メールを監視）
2. **処理**: HTTP ノードが Gemini の画像理解を呼び出します
3. **出力**: 分析結果を Google Sheets に書き込むか、Slack に送信します

### シナリオ 2: Eコマース商品の画像自動タグ付け

1. **トリガー**: Google Drive - Watch files（新しくアップロードされた画像を監視）
2. **処理**: HTTP ノードが商品画像の内容を分析します
3. **出力**: 商品画像にカテゴリタグを自動で追加します

### シナリオ 3: ソーシャルメディアのコンテンツモデレーション

1. **トリガー**: ユーザー提出画像を定期的に取得します
2. **処理**: HTTP ノードがコンプライアンスのために画像内容を分析します
3. **出力**: 非準拠のコンテンツをレビュー用に自動でフラグ付けします

## 上級のヒント

### 動的な画像URLの置換

Make.com では、上流のモジュールの出力変数を使って、バッチ画像分析用に `fileUri` を動的に置き換えられます:

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "Please describe this image and extract any text in it"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "{{upstream module's image URL variable}}"
          }
        }
      ]
    }
  ]
}
```

### モデルの切り替え

URL のモデル名を変更するだけで、モデルを切り替えられます:

| 必要なもの   | URL                                                                          |
| ------- | ---------------------------------------------------------------------------- |
| 最も高い理解力 | `https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent` |
| 高速分析    | `https://api.apiyi.com/v1beta/models/gemini-3-flash-preview:generateContent` |

## よくある質問

<AccordionGroup>
  <Accordion title="HTTP リクエストで 401 エラーが返りますか?">
    以下を確認してください:

    1. Authorization Header の形式: `Bearer sk-your-key` (Bearer の後にスペースがあることに注意)
    2. API key が有効であること（APIYI Console で確認）
    3. アカウントの残高が十分であること
  </Accordion>

  <Accordion title="画像が認識されない、またはエラーが返りますか?">
    以下を確認してください:

    1. `fileUri` が公開アクセス可能な URL であること（ブラウザで直接開けること）
    2. `mimeType` が実際の画像形式と一致していること
    3. 画像サイズがモデルの制限内であること
  </Accordion>

  <Accordion title="Make.com でレスポンスをどのように処理しますか?">
    Gemini API は JSON 形式を返します。次のようにできます:

    1. Make.com の **JSON** モジュールを使用してレスポンスをパースする
    2. 解析結果のために `candidates[0].content.parts[0].text` フィールドを抽出する
    3. 結果を後続のモジュールに渡す（例: データベースに書き込む、通知を送信する）
  </Accordion>

  <Accordion title="APIYI API key を取得するには?">
    [APIYI Console](https://api.apiyi.com/token) にアクセスし、アカウントを登録して、Tokens セクションで新しいキーを生成してください。新規ユーザーには無料のテストクレジットが付与されます。
  </Accordion>

  <Accordion title="Base64 エンコードされた画像に対応していますか?">
    はい。`fileData` を `inlineData` に置き換えてください:

    ```json theme={null}
    {
      "inlineData": {
        "mimeType": "image/png",
        "data": "Base64-encoded-image-data"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Gemini ネイティブ形式ドキュメント" icon="book" href="/ja/api-capabilities/gemini/native">
    完全な Gemini ネイティブ API 形式ドキュメントを表示します
  </Card>

  <Card title="画像理解 API" icon="eye" href="/ja/api-capabilities/vision-understanding">
    APIYI の画像理解機能の概要を表示します
  </Card>

  <Card title="よくある質問" icon="circle-question-mark" href="/ja/faq/model-selection-guide">
    FAQ セクションからさらにヘルプを取得できます
  </Card>

  <Card title="APIYI Token 管理" icon="settings" href="https://api.apiyi.com/token">
    API キーを管理し、使用状況と残高を確認します
  </Card>
</CardGroup>
