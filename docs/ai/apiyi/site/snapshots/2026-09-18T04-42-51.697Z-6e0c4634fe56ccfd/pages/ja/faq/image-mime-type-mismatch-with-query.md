> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像コンテンツが MIME タイプと一致しないエラーを修正する方法

> 画像 URL が x-oss-process（または同様の CDN 処理）パラメータで終わっている場合、このエラーが発生します。パラメータを削除するか、元の直接リンクを使用してください。

## 簡単な回答

API に渡す画像 URL が `?x-oss-process=...` のようなクラウドストレージの処理パラメータで終わっている場合、API は「画像の内容が MIME タイプと一致しません」というエラーを返します。

修正するには、URL から処理パラメータを削除して生の直接リンクを API に渡すか、画像を自分のサーバーにダウンロードして再処理してからアップロードしてください。

## エラーはどのようなものですか？

エラーレスポンスは次のとおりです。

```json theme={null}
{
  "error": {
    "message": "decode image: image content does not match MIME type 'image/png'",
    "type": "invalid_request_error",
    "code": 429
  }
}
```

一般的なトリガーURLは次のようになります。

```text theme={null}
https://oss.fzputi.com/tools/aiCraft/...jpg?x-oss-process=image/resize,w_800
```

`?x-oss-process=...`サフィックスは、Alibaba Cloud OSSなどのオブジェクトストレージサービスで使用される画像処理パラメータです。APIYIの画像生成エンドポイントでは、URLにこの種のパラメータが含まれている場合、上記のエラーが返されることが確認されています。

## 影響が確認されているパラメータ名

画像 URL に次のパラメータ名が含まれている場合、このエラーを引き起こすことが報告されています。

* `x-oss-process`

他のクラウドストレージプロバイダー（Tencent Cloud COS や Huawei Cloud OBS の同等のパラメータなど）の画像処理パラメータを使用する場合は、URL を API に渡す前に、以下と同じ手順に従ってください。

## 修正手順

<Steps>
  <Step title="URLから処理パラメーターを削除します">
    画像の未加工の直接リンク（`?x-oss-process=`形式のパラメーターを含まないもの）をコピーし、再度 API に渡します。

    例として、次のように変更します：

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg?x-oss-process=image/resize,w_800
    ```

    次のようにします：

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg
    ```
  </Step>

  <Step title="サイズ調整が必要な場合は、まずサーバー上で画像を処理します">
    ワークフローで OSS 側の圧縮またはトリミングに実際に依存している場合は、まず処理済みの画像をバケットからローカルストレージにダウンロードし、その後、ローカルパスまたはパラメーターのない新しい直接リンクを使用してアップロードします。
  </Step>
</Steps>

## 注記

<Warning>
  API に渡す画像 URL は、末尾パラメータのないプレーンな直接リンクとして保持してください。そうしないと、このエラーが発生する可能性があります。
</Warning>

## それでも機能しない場合

* URLをブラウザで直接開けること、またブラウザに表示される実際の画像形式（右クリック → 検証）がURLの拡張子（jpg / png / webp）と一致していることを確認してください
* 別のクラウドストレージプロバイダーの画像処理パラメータを使用している場合は、エラー JSON全体とリクエスト IDを添えてテクニカルサポートにお問い合わせください

## 関連ドキュメント

* [非同期画像 API はありますか？タスク ID で結果を照会できますか？](/ja/faq/image-async-api)
* [生成された画像が参照画像と大きく異なるのはなぜですか？](/ja/faq/image-result-differs-from-reference)
