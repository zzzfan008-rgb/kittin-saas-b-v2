> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 自分の呼び出し記録はどうやって確認しますか？

> APIYI の呼び出しログ確認ガイド。API呼び出し記録と課金詳細の確認方法を学べます

## コールログにアクセス

トップナビゲーションの「ログ」ページに移動します: [https://api.apiyi.com/log](https://api.apiyi.com/log)

ログセクションでは、次を確認できます:

* **各コールの成功記録**
* **APIコールのエラーログ**
* **詳細な課金の説明**

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="コールログ管理" width="1242" height="1128" data-path="images/log-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="コールログ管理" width="1242" height="1128" data-path="images/log-manage.png" />

## ログ記録内容

### 成功呼び出しレコード

各成功した API リクエストは次の情報を記録します:

* **Request Time**: 呼び出しのタイムスタンプ（秒精度）
* **Model Used**: この呼び出しで使用した AI モデル
* **Token Count**: 入力および出力 Token 数の統計
* **Billing Amount**: この呼び出しの具体的なコスト
* **Call Status**: リクエストの実行ステータス

### エラーログ

失敗した API 呼び出しは次を記録します:

* **Error Type**: 具体的なエラー分類
* **Error Message**: 詳細なエラー説明
* **Occurrence Time**: エラー発生タイムスタンプ
* **Related Parameters**: エラーを引き起こしたリクエストパラメータ情報

## プライバシーとデータポリシー

<Info>
  **データプライバシー保護**

  プライバシー保護とデータ保存コストを考慮し、当社のログシステムでは次の対応を行っています。

  * **詳細な入力・出力内容は記録しません**
  * **基本的な token 数情報のみを保持します**
  * **課金に必要な最小限のログデータのみを保存します**
  * **ユーザーデータのプライバシーセキュリティを確保します**
</Info>

## ログ閲覧のヒント

### フィルタリング機能

* **時間範囲でフィルタ**: 特定の期間の呼び出し記録を表示します
* **モデルでフィルタ**: 特定のAIモデルの使用状況を表示します
* **ステータスでフィルタ**: 成功した呼び出し記録と失敗した呼び出し記録を区別します

### 課金分析

* **単一呼び出しコスト**: 各API呼び出しの具体的なコスト
* **token使用効率**: 入出力token比率の分析
* **モデルコスト比較**: 異なるモデルの使用コスト統計

## よくある質問

### なぜ特定の会話内容が見えないのですか？

ユーザーのプライバシーを保護し、保存コストを抑えるため、請求に関連する基本情報のみを記録し、具体的な入力内容・出力内容は記録していません。

### ログはどのくらいの期間保持されますか？

**当月と、その前の 2 つの暦月** が対象で、古い月単位のデータは毎月5日に削除されます。詳細なルールとエクスポート手順については、[ログ保持およびクリーンアップ ポリシー](/ja/faq/log-retention-policy)をご覧ください。

### 通話記録をエクスポートするにはどうすればよいですか？

Logsページで必要に応じてフィルターをかけ、その後 **async export** を使用します。ジョブはバックグラウンドで実行され、完了したらファイルをダウンロードします。照合や監査用アーカイブに適しています。

なお、エクスポートと Billing Summary ボタンではタイムゾーンの基準が異なり、アカウントのタイムゾーンはデフォルトの UTC+0 のままにしておく必要があります。詳細は[ログのタイムゾーン設定とデータエクスポートについて知っておくべきことは何ですか？](/ja/faq/log-timezone-and-export)をご覧ください。
