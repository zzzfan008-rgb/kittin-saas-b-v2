> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ログのタイムゾーン設定とデータエクスポートについて何を知っておくべきですか？

> アカウントのタイムゾーンをご自身の所在地（中国のユーザーの場合は Asia/Shanghai）に設定し、コンソールのタイムゾーン切り替え提案をそのまま適用してください。ログ詳細リスト、「呼び出しデータ概要」チャート、エクスポート、課金サマリーはすべてアカウントのタイムゾーンに従うため、相互に一致します。ログクエリAPIのみがUnixタイムスタンプを返します。

## 簡潔な回答

<CardGroup cols={3}>
  <Card title="ローカルタイムゾーンを選択" icon="globe">
    中国国内のユーザーは`Asia/Shanghai` (UTC+8)を選択し、その他のユーザーはお住まいの地域のローカルタイムゾーンを選択してください。一度設定すれば、表示されるすべての時間が現地時間になります。
  </Card>

  <Card title="提案ダイアログを承認" icon="bell">
    コンソールがデバイスの異なるタイムゾーンを検出すると、「本地设置建议」（ローカル設定の提案）ダイアログが表示されます。**切り替えボタンをクリックするだけです**
  </Card>

  <Card title="すべての場所で基準を統一" icon="check">
    詳細リスト、チャート、**エクスポート**、**課金サマリー**はすべてアカウントのタイムゾーンを使用するため、これらの間での変換は不要です。
  </Card>
</CardGroup>

<Info>
  **チャートのズレは2026/9/20 00:55 (UTC+8)に修正されました。** 以前は、アカウントのタイムゾーンがUTC以外の場合、ログページ上部にある「调用数据一览」（呼び出しデータ概要）チャートでデータが誤った日付に配置されていました（例えば、北京時間の午後に翌日分のバーが表示されるなど）。そのため、以前はUTC+0のままにしてダイアログを閉じることを推奨していました。この問題は修正されたため、**そのアドバイスは撤回されました**。ご自身のタイムゾーンを選択してください。
</Info>

### 過去データのオフセット

この修正の前は、データベースのデフォルトタイムゾーンがUTC+8でした。これにユーザーが選択した上海タイムゾーン (UTC+8) が組み合わさることで、チャートデータにオフセットが生じていました。現在、データベースのデフォルトタイムゾーンはUTC+0に調整されたため、チャートはユーザーが選択したタイムゾーンに従い、オフセットは発生しなくなりました。

影響を受ける範囲：**2026/9/20 00:55 (UTC+8)より前**の日別・時間別にグループ化されたチャートおよび課金サマリーには、8時間のズレが生じている可能性があります。合計金額には影響がなく、呼び出しごとの詳細レコードにも影響はありません。日次レベルで照合する場合は、もう一度エクスポートしてください。

過去データを照合する必要がある場合は、[ログクエリAPI](/ja/api-capabilities/log-query)経由で呼び出しごとのレコードを取得してご自身で集計することも可能です。これは修正前のサマリーファイルに依存するよりも確実です。

<Tip>
  **1行でまとめたルール**：**コンソールで確認またはエクスポートするすべての情報**（詳細リスト、チャート、エクスポートファイル、課金サマリー）は**アカウントのタイムゾーン**に従います。**プログラムによって取得するもの**（[ログクエリAPI](/ja/api-capabilities/log-query)からの`created_at`）は、いかなるタイムゾーンにも依存しない**Unix秒タイムスタンプ**です。
</Tip>

## アカウントのタイムゾーンを確認・変更する場所

アカウントのタイムゾーンは、コンソールの「用户信息 (User Info)」セクションで確認および編集できます。新規アカウントのデフォルトは`UTC`です。中国のユーザーは`Asia/Shanghai`に切り替えてください。

<Frame caption="The timezone setting in the console's User Info section — change it from the dropdown">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="コンソールの「用户信息 (User Info)」セクションにおけるタイムゾーン設定" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

タイムゾーンを切り替えても、**時間の表示とグループ化の方法が変わるだけです**。呼び出し記録や請求が変更されたり失われたりすることはなく、いつでも元に戻すことができます。

## 提案ダイアログが表示されたら切り替えを適用する

アカウントのタイムゾーン（例：`UTC`）が現在のデバイスのタイムゾーン（例：`Asia/Shanghai`）と異なる場合、コンソールに「本地设置建议」（ローカル設定の提案）ダイアログが表示されます。**右側の切り替えボタンをクリックするだけです。** これにより、詳細リストとグラフに北京時間が表示されます。

<Frame caption="The Local Settings Suggestion dialog — you can click the switch button directly">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="アカウントタイムゾーンUTCおよびデバイスタイムゾーンAsia/Shanghaiが表示され、閉じるボタンと切り替えボタンが配置された「ローカル設定の提案」ダイアログ" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

財務チームが厳密にUTCで照合を行っている場合は、ダイアログを閉じてUTCのまま維持することもできます。現在はいずれの選択肢でも正しく表示されますので、照合プロセスに合わせて選択してください。

Logsページの最上部にある「调用数据一览」（呼び出しデータ概要）グラフは、アカウントのタイムゾーンにおける暦日ごとにデータを集計します：

<Frame caption="The Call Data Overview at the top of the Logs page, bucketed by day in the account timezone">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="赤枠で囲まれた、コンソールのLogsページ最上部にある「呼び出しデータ概要」のエントリ" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

## どちらのエクスポートを使用すべきですか？

Logsページの右上には、导出 (Export) と 汇总账单 (Billing Summary) の2つのボタンがあります。

<Frame caption="The Export and Billing Summary buttons in the top-right corner of the Logs page">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="左側にExportボタン、右側にBilling Summaryボタンが配置されたLogsページのツールバー" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

| | 导出 (Export) | 汇总账单 (Billing Summary) |
| - | - | - |
| タイムゾーン基準 | **アカウントのタイムゾーン** | **アカウントのタイムゾーン** |
| 粒度 | 個別の呼び出し記録（選択可能なフィールド） | 時間別、日別、または月別の支出集計 |
| データ量 | 大規模バッチ、非同期実行可能 | 小規模、直接ダウンロード |
| 最適な用途 | 照合、監査、カスタム分析 | 総支出の概要確認、税務記録 |

どちらのボタンも同じタイムゾーン基準を使用しており、異なるのは粒度とデータ量のみです。個別の記録か集計データか、ニーズに合わせて選択してください。

例えば、アカウントが`Asia/Shanghai`に設定されている場合、**2026-09-20 01:08 (UTC+8)** に行われた呼び出しは以下のようになります：

* **ページ詳細リスト**では`2026-09-20 01:08`と表示されます
* **エクスポートファイル**でも同様に`2026/9/20 1:08`と表示されます
* **Billing Summary**（日別）では`2026-09-20`に分類され、グラフ上では9月20日に計上されます

<Tip>
  **リクエストIDの最初の14桁はUTC時間です。** 例えば、`20260919170811…`はUTCの`2026-09-19 17:08:11`、つまり`2026-09-20 01:08:11 (UTC+8)`を意味します。サポートに特定の呼び出しについて問い合わせる際は、リクエストIDが最も正確な参照情報となります。
</Tip>

### Export → バックグラウンド非同期エクスポート（推奨）

明細行ごとの支出記録が必要な場合は、导出 (Export) ボタンを使用し、ダイアログで **后台异步导出 (バックグラウンド非同期エクスポート)** を選択してください。

<Frame caption="The export dialog — select background async export for large volumes">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="選択可能なフィールド、現在のページとバックグラウンド非同期エクスポートの切り替え、ExcelおよびCSV形式、最大レコード数が表示されたエクスポートダイアログ" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

主なポイント：

* **時間はアカウントのタイムゾーンで記録され**、ページ詳細リストと一致します
* **選択可能なフィールド**：使用時刻、リクエストID、token名、モデル名など — 照合に必要な項目を選択してください
* **エクスポートモード**：データ量が多い場合はバックグラウンド非同期エクスポートを選択してください。ジョブはページをブロックすることなくバックグラウンドで実行され、10,000件を超えるレコードで推奨されます
* **形式**：Excel（`.xlsx`、非常に大規模なエクスポートは自動的に分割されzip圧縮されます）またはCSV（`.csv`、データ量が少ない場合向け）
* **最大レコード数**：`0`は無制限（サーバーが複数のExcelファイルに分割してzip圧縮します）を意味し、上限は5,000万件です
* **進捗状況**：ジョブが作成されたら、任务管理 (Task Management) ページで進捗とステータスを確認し、ファイルをダウンロードしてください

エクスポートの詳細な手順やアーカイブに関するアドバイスについては、[呼び出しログはどのくらいの期間保持されますか？](/ja/faq/log-retention-policy) を参照してください。

## 実務における照合

<Steps>
  <Step title="双方で同じタイムゾーンを使用していることを確認してください">
    エクスポートファイルの日付は、**エクスポートを実行したアカウントのタイムゾーン**によってグループ化されます。複数人で照合を行う場合や、財務システムと突き合わせる場合は、まず全員が同じタイムゾーン（例えば `Asia/Shanghai`）を使用していることを確認してください。そうしないと、深夜前後に実行された呼び出しが異なる日付に振り分けられてしまいます。
  </Step>

  <Step title="APIのタイムスタンプは自身で変換してください">
    `created_at`（[Log Query API](/ja/api-capabilities/log-query) から取得）はUnix秒タイムスタンプです。必要とする任意のタイムゾーンに変換してください。北京時間の場合は、**28800**（8 × 3600）を加算してUTCとしてフォーマットするか、ご利用の言語のタイムゾーンライブラリを使用してください。
  </Step>

  <Step title="問題を報告する際はリクエストIDとタイムゾーンを含めてください">
    リクエストIDにはUTC時刻が含まれており、最もミスの生じにくい参照情報となります。時刻を提示する際は、`01:08 (UTC+8)` などのように必ずタイムゾーンを明記してください。
  </Step>
</Steps>

<Tip>
  *営業日*ごとに分割する必要がある照合や監査作業では、独自スクリプトとともに [Log Query API](/ja/api-capabilities/log-query) を使用することもできます。これにより、エクスポートファイルよりも柔軟な制御が可能になります。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="ドキュメントには以前、UTC+0のままにしてダイアログを閉じるように書かれていましたが、今でもそれが必要ですか？">
    いいえ、必要ありません。その案内は、アカウントのタイムゾーンがUTCでない場合にグラフ上のデータが誤った日付に割り振られていたために行われていました。この問題は2026/9/20 00:55 (UTC+8)に修正されました。現在はご自身のタイムゾーンを選択してください。
  </Accordion>

  <Accordion title="案内に従ってUTCのままにしていましたが、北京時間に切り替えるべきですか？">
    コンソール内のすべての時刻が北京時間になり手動で8時間を加算する必要がなくなるため、`Asia/Shanghai`への切り替えをおすすめします。照合プロセスがUTCで固定されている場合はUTCのままでも問題ありません。どちらも現在は正しく表示されます。
  </Accordion>

  <Accordion title="タイムゾーンを切り替えるとデータが失われますか？">
    いいえ、失われません。タイムゾーンは時刻の表示方法および日付ごとのグループ化にのみ影響します。呼び出し履歴や請求額が変更されることはなく、いつでも元に戻すことができます。
  </Accordion>

  <Accordion title="修正前にエクスポートされたファイルは今でも正確ですか？">
    1行ごとのエクスポート（エクスポートボタン）における各レコードと金額は正確であり、時刻はその時点のアカウントのタイムゾーンで表示されています。**2026/9/20 00:55 (UTC+8)より前**の課金サマリーファイルおよびグラフデータについては、合計額に影響はないものの、**日次または時間ごとのグループ化**が8時間ずれている可能性があります。日ごとの正確な照合が必要な場合は、再度エクスポートしてください。
  </Accordion>

  <Accordion title="自分のページの時刻と同僚のエクスポートしたファイルの時刻が一致しないのはなぜですか？">
    アカウントのタイムゾーンが異なっている可能性が最も高いです。エクスポートファイルにはエクスポートを行ったアカウントのタイムゾーンが使用されます。「用户信息（ユーザー情報）」で両方のアカウントが同じタイムゾーンを使用しているかご確認ください。
  </Accordion>

  <Accordion title="Log Query APIでタイムゾーンパラメータを指定できますか？">
    いいえ、指定できません。このAPIはUnix秒タイムスタンプのみを受け取り、返却します。これは定義上UTCです。必要に応じてクライアント側で変換してください。
  </Accordion>

  <Accordion title="エクスポートされたファイルに入力や出力は含まれますか？">
    いいえ、含まれません。エクスポートされるフィールドはコンソールに表示される内容（時刻、リクエストID、token名、モデル、token数、金額、ステータス）と一致しており、promptやモデルの出力は含まれません。[呼び出しログの保持期間はどのくらいですか？](/ja/faq/log-retention-policy)をご覧ください。
  </Accordion>

  <Accordion title="ページからエクスポートする代わりに、プログラムからログを取得できますか？">
    はい、[Log Query API](/ja/api-capabilities/log-query)をご覧ください。その`start_timestamp`、`end_timestamp`、および`created_at`はすべて**Unix秒タイムスタンプ**であり、コンソールのタイムゾーン設定とは無関係であるため、自動照合に適しています。
  </Accordion>

  <Accordion title="エクスポートジョブが完了しません。どうすればよいですか？">
    まず「任务管理（タスク管理）」ページでジョブのステータスを確認してください。データ量が非常に多い場合（数百万件のレコードなど）、サーバーがファイルの分割とパッケージ化を行うのに時間がかかります。時間範囲を絞るか、適切な最大レコード数を設定して、バッチごとにエクスポートしてください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [呼び出し記録を確認するにはどうすればよいですか？](/ja/faq/call-logs)
* [ログの課金金額はどのように確認しますか？](/ja/faq/log-billing-explained)
* [呼び出しログはどのくらいの期間保存されますか？](/ja/faq/log-retention-policy)
* [ログクエリAPI](/ja/api-capabilities/log-query)
* [リアルタイム更新：コンソールのタイムゾーン表示を修正 — ローカルタイムゾーンへの切り替え](/en/live/2026-09/console-timezone-fixed)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.