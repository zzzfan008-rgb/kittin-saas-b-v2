> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ログのタイムゾーン設定とデータエクスポートについて知っておくべきことは何ですか？

> アカウントのタイムゾーンは既定の UTC+0 のままにし、コンソールのタイムゾーン切り替えの提案は無視してください。すべてのエクスポートファイル（エクスポートと請求概要）は常に UTC+0 であり、一方でログ詳細一覧と呼び出しデータチャートはアカウントのタイムゾーンに従います。この2つの不一致が、8時間の突合差を生みます。

## 簡潔な回答

<CardGroup cols={3}>
  <Card title="アカウントのタイムゾーンを UTC+0 に設定してください" icon="globe">
    デフォルトの `London (UTC+0/+1)` が正しい設定です — **変更しないでください**。ログは UTC で保存されるため、UTC+0 がデータソースと一致します
  </Card>

  <Card title="提案ダイアログを閉じる" icon="bell-off">
    コンソールが別のデバイスのタイムゾーンを検出すると、「ローカル設定の提案」ダイアログが表示されます — 左側の **一時的に無視 (Dismiss)** を選び、切り替えボタンは押さないでください
  </Card>

  <Card title="すべてのエクスポートファイルは UTC+0 です" icon="download">
    エクスポート (Export) と 課金サマリー (Billing Summary) の両ボタンは、アカウントのタイムゾーンに関係なく UTC+0 のファイルを出力します。*ページ上* に表示される時刻は、その代わりにアカウントのタイムゾーンに従います
  </Card>
</CardGroup>

<Warning>
  **すでに切り替えている場合は、`London (UTC+0/+1)` に戻すだけで大丈夫です。** タイムゾーンはデータの表示方法にのみ影響し、**通話データが変更されたり失われたりすることはありません**。エクスポートファイルは常に UTC+0 なので影響を受けません。元に戻せば、ページとエクスポートファイルの基準が再び揃います。
</Warning>

<Info>
  **一言でいうと**: あなたが **エクスポート** するもの、つまりエクスポートファイル、課金サマリー、そして [ログクエリAPI](/ja/api-capabilities/log-query) からの `created_at` は **UTC+0** です。ページ上で **読む** もの、つまり詳細一覧とグラフは、あなたの **アカウントのタイムゾーン** に従います。
</Info>

## アカウントのタイムゾーンを確認する場所

現在のアカウントのタイムゾーンは、コンソールのユーザー情報（User Info）セクションに表示されます。`London (UTC+0/+1)` と表示されるはずで、これは UTC+0 です。

<Frame caption="The timezone setting in the console's User Info section — it should read London (UTC+0/+1)">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="Console User Info section showing the timezone set to London (UTC+0/+1)" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

## सुझावダイアログが表示されたら「一時的に無視」(Dismiss) を選択する

アカウントのタイムゾーン（UTC）が現在のデバイスのタイムゾーン（たとえば `Asia/Shanghai`）と異なる場合、コンソールには切り替えを提案する「ローカル設定の提案」ダイアログが表示されます。

<Frame caption="The Local Settings Suggestion dialog — choose 暂时忽略 (Dismiss) on the left">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="アカウントのタイムゾーンが UTC、デバイスのタイムゾーンが Asia/Shanghai であることを示すローカル設定の提案ダイアログ。Dismiss と Switch のボタンがあります" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

<Warning>
  **「一時的に無視」(Dismiss) を選び、切り替えないでください。** 切り替え後、Logs ページ上部の **呼び出しデータ概要 (Call Data Overview)** チャートが正しく描画されなくなります。時間バケットがチャート範囲と一致しなくなるため、データが全体として欠けているように見えたり、ずれて見えたりします。
</Warning>

影響を受けるのは次のセクションです。

<Frame caption="The Call Data Overview at the top of the Logs page — this chart misaligns once the account timezone is switched">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="コンソールの Logs ページ上部にある、赤枠で囲まれた呼び出しデータ概要の項目" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

ログ詳細リストのタイムスタンプもアカウントのタイムゾーンに従います。**エクスポートファイルはそうではなく、常に UTC+0 です。** アカウントを UTC+0 に保つことで、詳細リスト、チャート、エクスポートファイルの基準がそろい、適用するオフセットを 1 つの固定値だけにできます。

## どのエクスポートを使うべきですか？

Logs ページの右上には、2つのボタンがあります。導出（エクスポート）と汇总账单（請求サマリー）です。

<Frame caption="The Export and Billing Summary buttons in the top-right corner of the Logs page">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="Logs ページのツールバー。左にエクスポートボタン、右に請求サマリーボタンがあります" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

|           | 導出 (Export)             | 汇总账单 (請求サマリー)  |
| --------- | ----------------------- | -------------- |
| タイムゾーンの基準 | **常に UTC+0**            | **常に UTC+0**   |
| 粒度        | 個別の呼び出しレコード（選択可能なフィールド） | 日付ごとに集計された支出   |
| 容量        | 大量バッチ向け。非同期で実行可能        | 少量向け。直接ダウンロード  |
| 最適な用途     | 照合、監査、カスタム分析            | 期間全体の総支出を手早く確認 |

どちらのボタンも、アカウントのタイムゾーン設定に関係なく、**同じタイムゾーン基準 UTC+0** を使います。違いは粒度と容量だけです。必要なものに応じて、個別レコードか日次合計かを選んでください。

### ページとエクスポートファイルが一致しないのは正常です

照合で最も間違えやすいのはここです。**ページはアカウントのタイムゾーンに従い、エクスポートファイルは UTC+0 です。**

アカウントのタイムゾーンが UTC+8 に変更されている場合、**2026-08-14 00:30 (UTC+8)** に行われた呼び出しは次のように表示されます。

* `2026-08-14 00:30` **ページの詳細一覧** では、8月14日に属する
* `2026-08-13 16:30` (UTC+0) **エクスポートファイル** では、8月13日に属する

したがって、「00:00〜08:00 (UTC+8) の呼び出しが今日の合計から抜けている」というように見えますが、失われているわけではありません。2つの表示が単に8時間ずれているだけです。

<Tip>
  **アカウントのタイムゾーンを`London (UTC+0/+1)`に戻せば、両方が同じ基準になります**。これが最も簡単な解決策です。
  ほかの理由でローカルタイムゾーンを維持する必要がある場合は、エクスポートファイルを正として扱い、スプレッドシートやスクリプト内で一貫して変換してください（下記参照）。
</Tip>

### エクスポート → バックグラウンド非同期エクスポート（推奨）

明細ごとの支出レコードが必要な場合は、导出（エクスポート）ボタンを使い、ダイアログで **后台异步导出（バックグラウンド非同期エクスポート）** を選択してください。

<Frame caption="The export dialog — select background async export for large volumes">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="選択可能なフィールド、現在のページかバックグラウンド非同期エクスポートか、Excel と CSV の形式、最大レコード数を示すエクスポートダイアログ" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

重要なポイント:

* **タイムゾーンは常に UTC+0** です。アカウント設定に関係なく、保存済みのログそのものを出力するためです。ローカル時刻への変換は自分で行ってください（UTC+8 の場合は 8 時間加算します）
* **選択可能なフィールド**: 使用時刻、リクエスト ID、token 名、モデル名など。照合に必要な項目を選べます
* **エクスポートモード**: 大量データではバックグラウンド非同期エクスポートを選んでください。ジョブはページをブロックせずバックグラウンドで実行され、10,000 件を超える場合に推奨されます
* **形式**: Excel（`.xlsx`、非常に大きいエクスポートは自動的に分割され、zip 化されます）または CSV（`.csv`、少量向け）
* **最大レコード数**: `0` は無制限を意味します（サーバーが複数の Excel ファイルに分割して zip 化します）。上限は 5,000 万件です
* **進捗**: ジョブ作成後は、任务管理（タスク管理）ページで進捗と状態を確認し、その後ファイルをダウンロードします

エクスポートの全手順とアーカイブの考え方については、[呼び出しログはどのくらい保持されますか？](/ja/faq/log-retention-policy) を参照してください。

## 実務での照合

<Steps>
  <Step title="まず、すべてを1つのタイムゾーンに統一します">
    * **読みやすいタイムスタンプ**: 北京時間にするには8時間足します。 `2026-08-14 00:30:00 UTC+0` は `2026-08-14 08:30:00 (UTC+8)` になります
    * **Unix秒**（`created_at` を [ログクエリ API](/ja/api-capabilities/log-query) から取得した場合）: 値に **28800**（8 × 3600）を足します
  </Step>

  <Step title="暦日でグループ化する前に変換します">
    Excel でも独自のスクリプトでも、まず各タイムスタンプをずらし、**その後で** `YYYY-MM-DD` ごとにグループ化します。
    **エクスポートした日付列をそのまま使って照合しないでください** — これが、ページとファイルの内容が一致しない最も一般的な原因です。
  </Step>

  <Step title="問題を報告するときは UTC+0 と UTC+8 の両方を記載してください">
    サポートはログを UTC+0 で検索します。北京時間は、ビジネス上の同僚が認識しやすい表記です。両方を示せば、やり取りを往復させずに済みます。
  </Step>
</Steps>

<Tip>
  *営業日* ごとに分割する必要がある照合や監査作業では、CSV エクスポートよりも [ログクエリ API](/ja/api-capabilities/log-query) と独自のスクリプトを使うことをおすすめします — コードで 28800 秒を足すほうが、Excel の数式を管理するより確実です。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="ローカルタイムゾーンではなく UTC+0 がデフォルトなのはなぜですか？">
    バックエンドの呼び出しログは、UTC で記録されたデータベースログだからです。アカウントを UTC+0 にしておくと、ページ表示、グラフ、エクスポートファイルの基準をそろえられるため、どこでも同じ固定オフセットを適用できます。ローカルタイムゾーンに設定すると、変換ルールが場所ごとに異なり、むしろ誤読しやすくなります。
  </Accordion>

  <Accordion title="タイムゾーンをすでに切り替えましたが、データは失われますか？">
    いいえ。タイムゾーンはページ表示にのみ影響し、呼び出し記録や課金は変更されず、エクスポートファイルにも影響しません。アカウントのタイムゾーンを`London (UTC+0/+1)`に戻せば、ページとエクスポートファイルの基準が再びそろいます。
  </Accordion>

  <Accordion title="UTC+8 のユーザーは、エクスポート内の時刻をどのように変換しますか？">
    **エクスポートファイルの時刻に 8 時間を加算します**。たとえば、ファイル内の`2026-08-09 08:00`は **2026/8/9 16:00 (UTC+8)** に相当します。日付をまたいで照合するときは、この 8 時間のずれに注意してください。
  </Accordion>

  <Accordion title="なぜページの詳細一覧とエクスポートファイルで表示時刻が異なるのですか？">
    参照基準が異なるためです。詳細一覧は **アカウントのタイムゾーン** に従い、エクスポートファイルは常に **UTC+0** です。アカウントを UTC+8 に設定している場合、0:00 から 08:00 までの呼び出しはページ上では「今日」に属しますが、ファイル上では「昨日」になります。これは想定どおりで、データエラーではありません。アカウントを UTC+0 に戻せば、この差はなくなります。
  </Accordion>

  <Accordion title="エクスポートを直接 UTC+8 で出力できますか？">
    いいえ。エクスポートは、保存されているデータベースログをそのまま出力するため、常に UTC+0 です。業務上のタイムゾーンが UTC+8 でない場合は、同様に変換が必要です。
  </Accordion>

  <Accordion title="Log Query API にタイムゾーンパラメータを指定できますか？">
    いいえ。API が受け取って返すのは Unix の秒単位タイムスタンプのみで、定義上 UTC です。必要に応じてクライアント側で変換してください。
  </Accordion>

  <Accordion title="エクスポートファイルには入力と出力が含まれますか？">
    いいえ。エクスポートされる項目はコンソールに表示される内容、つまり時刻、リクエスト ID、token 名、model、token 数、金額、状態と一致し、prompt や model 出力は含まれません。[呼び出しログはどのくらい保持されますか？](/ja/faq/log-retention-policy) をご覧ください。
  </Accordion>

  <Accordion title="ページからエクスポートする代わりに、プログラムからログを取得できますか？">
    はい。[ログ照会 API](/ja/api-capabilities/log-query) をご覧ください。`start_timestamp`、`end_timestamp`、`created_at` はすべて **Unix の秒単位タイムスタンプ** で、コンソールのタイムゾーン設定に依存しません。そのため、必要に応じてコード側で変換してください。自動照合に適しています。
  </Accordion>

  <Accordion title="エクスポートジョブがいつまでも終わりません。どうすればよいですか？">
    まず、タスク管理ページでジョブの状態を確認してください。非常に大きい件数（数百万レコード）では、サーバーがファイルを分割してパッケージ化するのに時間がかかります。時間範囲を絞るか、適切な最大レコード数を設定して、バッチでエクスポートしてください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [呼び出し履歴はどこで確認できますか？](/ja/faq/call-logs)
* [ログ内の課金金額はどのように読み取ればよいですか？](/ja/faq/log-billing-explained)
* [呼び出しログはどのくらい保存されますか？](/ja/faq/log-retention-policy)
* [ログクエリ API](/ja/api-capabilities/log-query)
* [ライブ更新：コンソールのタイムゾーン切り替えの提案を閉じる](/en/live/2026-08/timezone-switch-prompt-ignore)
