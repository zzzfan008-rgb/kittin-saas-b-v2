> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 画像生成失敗の一般的な理由

> コンテンツの安全性、ウォーターマーク削除、有名 IP、未成年、その他 Google の安全メカニズムを引き起こす要因を含む、Nano Banana Pro/2 の画像生成失敗に関する一般的な原因の分析

## クイックアンサー

Nano Banana シリーズ（Nano Banana Pro と Nano Banana 2 を含む）は、内部で Google Gemini モデルを使用しています。画像生成の失敗の主な原因は、**Google のコンテンツ安全機構が作動すること**であり、これにより生成フェーズ中に非準拠のリクエストがブロックされます。APIYI はトランスペアレント・プロキシとして機能し、Google のフィードバックをそのまま転送します。

## よくあるトリガー

<CardGroup cols={2}>
  <Card title="NSFW コンテンツ" icon="ban">
    ポルノ、暴力、流血表現、またはヘイトスピーチを含むプロンプトや参照画像は、Google の安全機構によって直接ブロックされます。
  </Card>

  <Card title="ウォーターマーク削除" icon="droplet-off">
    画像からのウォーターマーク削除を要求することはコンテンツポリシーに違反し、Google によって拒否されます。
  </Card>

  <Card title="著名な IP / 著作権保護されたキャラクター" icon="copyright">
    Disney、Marvel、Nintendo などの著作権保護されたキャラクターを含む生成リクエストは、著作権保護のため拒否されます。
  </Card>

  <Card title="未成年に関連するコンテンツ" icon="baby">
    未成年者が関与する不適切なコンテンツ生成リクエストは、Google のゼロトレランスポリシーの対象となり、厳格にブロックされます。
  </Card>
</CardGroup>

### Nano Banana 2 の新しい制限

<Warning>
  Nano Banana 2 は 2026 年 2 月 27 日にリリースされて以降、Google は安全機構をさらに強化しました。以下のシナリオでもブロックが発生します。
</Warning>

<CardGroup cols={2}>
  <Card title="著名人" icon="user-x">
    公人（有名人、政治家など）に関わる画像生成または編集リクエストは拒否されます。
  </Card>

  <Card title="金融/注文情報の改変" icon="credit-card">
    画像内の金融情報、注文のスクリーンショット、価格タグなどを変更しようとする試みはブロックされます。
  </Card>

  <Card title="服装/顔の差し替え" icon="shirt">
    人物の服装を変更したり顔を差し替えたりする操作は、プライバシーと倫理上の懸念を伴うため、拒否されます。
  </Card>

  <Card title="暗示的な NSFW コンテンツ" icon="eye-off">
    露骨な性的描写がなくても、示唆的または境界線上の不適切なコンテンツは検出され、ブロックされます。
  </Card>
</CardGroup>

## ポリシー更新タイムライン

| 日付                | イベント                 | 影響                                                         |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| January 23, 2026  | Google がリスク管理ポリシーを調整 | 全体的な安全性レビューがより厳格になり、一部の以前は許可されていたプロンプトがブロックされるようになります      |
| February 27, 2026 | Nano Banana 2 がリリース  | 著名人、金融情報の改変、服装/顔の入れ替え、暗示的な NSFW コンテンツに対する新しいブロックルールが追加されます |

## 生成失敗の典型的な症状

image generation が失敗しても、API は HTTP ステータスコード **200** を返しますが、レスポンスには画像データが含まれず、代わりにテキストの説明が返されます。

<Info>
  **なぜステータスコードが 200 なのですか？** APIYI は透過プロキシとして動作し、Google API の元のレスポンスを忠実に転送します。Google は、安全ブロック中に HTTP エラーコードではなく、テキストの拒否理由を含む 200 ステータスコードを返します。
</Info>

### よくあるエラーメッセージ

Google API の拒否テキストには、通常次のようなメッセージが含まれます。

* `"I can't complete the modification of xxx"`
* `"I can't generate images that are sexually explicit."`
* `"I'm just a language model and can't help with that."`

<Warning>
  注: Google の安全フィルタには多少のランダム性があります。**同じ prompt でも、参照画像の内容、prompt の組み合わせ、その他の要因によって、成功することもあれば失敗することもあります。**
</Warning>

## プロダクト開発者向けの推奨事項

Nano Banana API を使ってユーザー向けプロダクトを構築する場合は、ユーザーにわかりやすい失敗メッセージを返せるよう、適切なエラーハンドリングロジックを実装することをおすすめします。

<Tip>
  **確認すべき主な指標**:

  1. **candidatesTokenCount = 0**: Google がコンテンツレビュー段階で拒否しました
  2. **finishReason is not STOP**: 生成中に安全ポリシーによってブロックされました
  3. **Text present but no image**: API が画像データではなく拒否の説明を返しました
</Tip>

## サポートへのお問い合わせ

ご利用ケースが正当かつ準拠しているにもかかわらず、生成の失敗が引き続き発生する場合は、調査のためにお気軽にお問い合わせください。

<Card title="技術サポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  * [Enterprise WeChat でお問い合わせください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * メール: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
