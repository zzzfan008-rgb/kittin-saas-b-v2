> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 失敗生成クレジット返還プラン

> リクエストごとの Nano Banana Pro について、APIYI は失敗生成の返還プランを提供しています。Google のコンテンツモデレーションによる主観的でない理由で生成に失敗した場合、失敗したリクエスト数に基づいてクレジットが返還されます。

## プラン概要

お客様によりよいサービスを提供するため、APIYI は **Nano Banana Pro 生成失敗時クレジット返還プラン** を開始します。

<Info>
  対象となるモデルは **リクエスト単位の Nano Banana Pro** のみです。Nano Banana 2 については、**token ベース**の token を選択でき、失敗した呼び出しはごくわずかな金額で課金されるため、無視できます。
</Info>

リクエストが **status code 200 で返ってきたのに画像生成に失敗した** 場合、それは Google 側からのフィードバックです。APIYI は結果をそのまま転送するだけの透過プロキシであり、私たちもお客様の画像が成功することをお客様と同じくらい望んでいます。このプランでは、こうした **主観的ではない理由** による失敗に対してクレジットを返還します。

## Nano Banana Pro はいつ生成に失敗しますか?

Google のコンテンツモデレーションポリシーは、ますます厳しくなっています。拒否を引き起こしやすい一般的なケースには、次のものがあります。

* **コンテンツの安全性**: NSFW や未成年に関連するコンテンツ
* **ウォーターマークの削除**: とくに特殊なカテゴリ
* **有名 IP**（2026年1月23日追加）: Disney など — Google は新しいモデレーションポリシーを導入したようです
* **より厳格な安全機構**（2月27日、Nano Banana 2 のリリース後）: 有名な公人、金融・注文情報の編集、人物の服装交換/顔交換、暗示的な性的コンテンツなどは、いずれも「xxx に対して要求された編集を完了できません」というようなテキストエラーメッセージを返します

## 生成失敗の症状

<CardGroup cols={2}>
  <Card title="ログ出力の Tokens が 1000 未満" icon="triangle-alert">
    Google は次のようなテキストを1行返します。例: "I'm unable to help with this task" / `I'm just a language model and can't help with that.`
  </Card>

  <Card title="ログ出力の Tokens が空" icon="ban">
    画像生成はそのまま拒否され、エラーは空です。API レスポンスデータ内の主要指標は `"candidatesTokenCount": 0`
  </Card>
</CardGroup>

<Frame caption="Log list: when the 'Completion' (output Tokens) column shows tiny values like 100-200, that call is a failed generation">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-failure-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6cf66f9f67eeca2b89255d9287c4ae7c" alt="gemini-3-pro-image-preview モデルの completion Tokens 列に 173 や 176 のような小さな値が表示され、失敗した生成としてマークされているログ一覧" width="938" height="860" data-path="images/nano-banana-pro-guarantee-failure-example.png" />
</Frame>

## なぜ失敗しても課金されるのですか？

* Google がクォータを消費します: 同じリクエストをプロンプトを変更せずに繰り返し送ると、Google の RPD クォータを無駄に消費します
* システムはまだ「出力が空の場合は課金しない」に対応できません
* 禁止コンテンツを含むリクエストは、公式 KEY が禁止される可能性を高めます。これは取り返しのつかない損失です

## 参加方法

対象となるお客様:

1. 月間支出が **USD 1000** 以上（オンサイトモデルを含む） — この基準は意図的に低く設定しています。少額クレジットでのテストや個人利用では、そもそも失敗する可能性は低いためです
2. **ツールサービスプロバイダー** を対象としています。顧客側でエンドユーザーの入力内容を制御するのが難しいためです
3. **主観的でない理由のみ**: 悪意を持って同じまたは類似の禁止コンテンツを要求した場合は補填されません
4. 期間: **5月1日開始 (UTC+8)**
5. 順次ご連絡し、社内リストへの登録を進めます

## 補填はどのように行われますか？

ログ セクションに移動し、右上の Export をクリックして、期間（たとえば先月）を選択し、Async Export を選びます。送信後は、上部ナビゲーションメニューの Async Tasks で進捗を確認し、最終的な Excel データ結果をダウンロードします。

<Frame caption="The Export button in the top-right corner of the Logs section">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-export-logs.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=233889ab4fdb3740a726f77ff2fc84bd" alt="右上の Export ボタンが強調表示されたログセクションのツールバー" width="1284" height="296" data-path="images/nano-banana-pro-guarantee-export-logs.png" />
</Frame>

**補填クレジット**: 失敗したリクエストの正確な件数を集計し、`failed count × model price / discount factor`に基づいて補填します（たとえば、15% のチャージボーナスがある場合は、1.15 で割ります）。

**補填のタイミング**: 毎月末に前月のデータを集計し、補填は通常、**翌月の最初の 5 営業日以内**に付与されます。
