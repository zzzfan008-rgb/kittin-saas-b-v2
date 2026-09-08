> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 生成された画像が参照画像と大きく異なるのはなぜですか？

> Gemini-3-Pro-Image と Bananaシリーズ モデルは、OpenAI 形式の URL ではなく base64 の参照画像を必要とします。よくある確認事項を以下に示します。

## 簡単な答え

`gemini-3-pro-image`、Banana Pro、または Banana 2 を使用している場合、生成画像と参照画像の差が大きくなる原因は、通常、参照画像のアップロード形式の不一致です。

* これらのモデルは **OpenAI 形式の参照画像アップロードをサポートしていません**
* 参照画像は **base64 文字列** としてアップロードする必要があります
* 問題はモデル自体ではなく、統合方法に関連しています

## トラブルシューティング手順

次の確認を順番に実施してください:

<Steps>
  <Step title="Webコンソールでモデルをテストする">
    `imagen.apiyi.com`を開き、同じ参照を Web UI で実行してください。

    Web の結果が参照と一致する場合、モデルは正常に動作しており、問題は統合側にあります。Web の結果も異なる場合は、次の確認に進んでください。
  </Step>

  <Step title="トークングループを確認する">
    APIYI コンソールで、トークンに `gemini-3-pro-image` または Bananaシリーズのモデルグループが含まれていることを確認してください。

    モデルが有効になっていない場合、呼び出しはデフォルトの動作にフォールバックし、予期しない結果になることがあります。
  </Step>

  <Step title="課金モードを確認する">
    トークン設定で、課金モードを確認してください:

    * **従量課金優先**: 従量課金とサブスクリプションのクォータの両方を使用します
    * **従量課金のみ**: 従量課金のクォータのみが利用できます

    課金モードとモデルグループが一致しないと、呼び出しが失敗したり、予期しない結果になったりします。
  </Step>

  <Step title="統合方法を確認する">
    公式のモデルドキュメントと照らし合わせて、リクエストを再確認してください。

    Banana 2 の場合:
    `docs.apiyi.com/api-capabilities/nano-banana-2-image/image-edit`

    次の点に注意してください:

    * reference フィールドは URL ではなく、**base64 文字列** を想定しています
    * MIME タイプは実際の画像形式と一致していなければなりません
    * パラメータの形は、このモデルがサポートする内容と一致していなければなりません
  </Step>
</Steps>

## よくある原因

| 症状                         | 考えられる原因                          |
| -------------------------- | -------------------------------- |
| Web UI は動作するが、API の結果がおかしい | 統合形式の不一致（最も一般的）                  |
| すべての呼び出しがおかしい              | 参照画像がアップロードされていない、またはアップロードに失敗した |
| ときどき違いが出る                  | prompt の説明が薄すぎる、または参照が多すぎる       |
| モデルグループは有効だが、呼び出しに失敗する     | 課金モードの不一致                        |

<Tip>
  **最も一般的な原因**: 画像 URL を OpenAI互換の `image_url` フィールドに入れてしまうことです。OpenAI形式の参照をサポートしないモデルでは、画像を base64 文字列としてエンコードし、正しいフィールドに配置してください。
</Tip>

## 関連する質問

<CardGroup cols={2}>
  <Card title="Nano Banana 画像生成の失敗" icon="banana" href="/ja/faq/nano-banana-image-failure">
    Nano Banana モデルでよくある問題と対処法です。
  </Card>

  <Card title="画像非同期 API" icon="loader" href="/ja/faq/image-async-api">
    画像非同期タスクのエンドポイントの使い方です。
  </Card>

  <Card title="Base URL の設定方法" icon="link" href="/ja/faq/base-url-config">
    さまざまなクライアントツールで APIYI を接続します。
  </Card>

  <Card title="token モデルのホワイトリスト" icon="key" href="/ja/faq/token-model-whitelist">
    token がアクセスできるモデルを設定します。
  </Card>
</CardGroup>
