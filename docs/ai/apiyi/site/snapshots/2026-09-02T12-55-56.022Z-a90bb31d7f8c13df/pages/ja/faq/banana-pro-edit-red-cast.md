> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro で編集したあとに画像が赤っぽくなるのはなぜですか?

> Nano Banana Pro の画像編集で赤みがかった暖色寄りの色かぶりを抑える一般的な方法: Vertex チャネルに切り替えるか、gpt-image-2 に切り替えます。

## 簡単な回答

Nano Banana Pro（`gemini-3-pro-image`）の画像編集で全体的に赤み／暖色寄りの色かぶりが出るのは、よく見られる症状です。よくある対処法は次の 2 つです。

1. banana pro を **Vertex** チャネル経由でルーティングする
2. 編集タスクには **gpt-image-2** に切り替える

## 詳細な説明

### banana pro は既定でどのチャネルを使いますか？

API易 の Nano Banana Pro は、既定では **公式 AI Studio** チャネル経由でルーティングされます。Vertex は別のオプションのプールで、AI Studio に問題がある場合に引き継ぎます（[Google は AI Studio 経由ですか、それとも Vertex 経由ですか？](/ja/faq/google-upstream-aistudio-vertex) を参照してください）。

### Vertex に切り替えるにはどうすればよいですか？

Vertex は apiyi コンソール内で **別グループ** として公開されています。token を作成または編集する際に、Vertex 関連のグループを選択してください。コードの変更は不要です（[Google は AI Studio 経由ですか、それとも Vertex 経由ですか？](/ja/faq/google-upstream-aistudio-vertex) を参照してください）。

### gpt-image-2 でこれは解決しますか？

gpt-image-2 は、一般的に編集タスクで元の色をよりよく保持します。フォールバックオプションとして扱ってください — [GPT-Image-2 画像編集 API](/ja/api-capabilities/gpt-image-2-all/image-edit) を参照してください。

## トラブルシューティング

<Steps>
  <Step title="Webプレイグラウンドで再現する">
    `imagen.apiyi.com`を開き、同じ prompt + 参照画像を再実行します。

    * Webで再現する → おそらくモデルの挙動です。Vertex / gpt-image-2 を試してください
    * Webでは問題ない → 統合部分を確認してください（[画像出力が参照画像と大きく異なる](/ja/faq/image-result-differs-from-reference) を参照）
  </Step>

  <Step title="参照画像が base64 としてアップロードされていることを確認する">
    Nano Banana Pro は OpenAI 形式の参照画像アップロードを**受け付けません**。base64 が必要です（[画像出力が参照画像と大きく異なる](/ja/faq/image-result-differs-from-reference) を参照）。`image_url` に URL を直接入れると、モデルは実質的に参照画像を「想像」することになり、それが色かぶりとして現れることもあります。
  </Step>

  <Step title="Vertex チャネルを試す">
    token のグループを Vertex グループに切り替えて、同じ prompt を再実行してください。色かぶりを AI Studio と比較します。
  </Step>

  <Step title="gpt-image-2 を試す">
    それでも Vertex に色かぶりが出る場合は、gpt-image-2 に切り替えてください。ビジュアルスタイルは banana pro と異なるため、prompt の再調整が必要になることがあります。
  </Step>
</Steps>

## よくある質問

<AccordionGroup>
  <Accordion title="gpt-image-2 と banana pro の編集比較">
    banana pro は「スタイル化された再レンダリング」寄りで、gpt-image-2 は「控えめなインプレース編集」寄りです。gpt-image-2 は通常、元の色をよりよく保持します。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Google は AI Studio または Vertex 経由でルーティングされますか?](/ja/faq/google-upstream-aistudio-vertex)
* [画像出力が参照画像と大きく異なる](/ja/faq/image-result-differs-from-reference)
* [Nano Banana Pro 画像編集 API](/ja/api-capabilities/nano-banana-image/image-edit)
* [GPT-Image-2 画像編集 API](/ja/api-capabilities/gpt-image-2-all/image-edit)

## お問い合わせ

お使いのアカウントで Vertex グループが利用可能かの確認が必要な場合、または色かぶりの編集のトラブルシューティングが必要な場合は、サポートまでお問い合わせください。
