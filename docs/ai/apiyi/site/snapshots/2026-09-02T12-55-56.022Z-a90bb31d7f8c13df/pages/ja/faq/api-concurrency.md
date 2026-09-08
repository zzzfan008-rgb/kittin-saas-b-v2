> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIの同時実行数制限とは？

> さまざまなモデルタイプの同時実行数制限と、より高いクォータを申請する方法を学びます

## 簡単な回答

**同時実行数の制限はモデルの種類によって異なります** - テキストモデルは同時実行数が最も多く、画像モデルは中程度の制御です。

<Info>
  **重要な注意**

  同時実行数の制限は**個々のモデル**に適用され、アカウント全体には適用されません。たとえば、Nano Banana Pro には 30 件の同時リクエストがあり、他のモデルの同時実行数には影響しません。
</Info>

## モデル種別ごとの同時実行数制限

<CardGroup cols={3}>
  <Card title="テキストモデル" icon="file-text">
    **デフォルト: 50 リクエスト/秒**

    * ✅ 高い同時実行に対応
    * ✅ バッチ処理に適しています
    * 🔓 より高いクォータを利用可能
  </Card>

  <Card title="非同期動画モデル" icon="video">
    **デフォルト: 高い同時実行数**

    * ✅ 非同期処理
    * ✅ 大規模な呼び出しに対応
    * 📊 バッチ動画生成に最適
  </Card>

  <Card title="画像モデル" icon="image">
    **デフォルト: 30 リクエスト/秒**

    * ⚠️ 同時実行数は制御されています
    * 📦 Base64による大容量データ転送
    * 🔓 リクエストに応じて調整可能
  </Card>
</CardGroup>

## なぜ画像モデルには同時実行数の制御があるのでしょうか？

<Warning>
  **技術的な理由**

  画像生成 API は画像データを転送するために **Base64 エンコーディング** を使用するため、リクエストのペイロードが大きくなります（通常、1リクエストあたり 500KB〜5MB）。サービスの安定性と応答速度を確保するため、適度な同時実行数の制御が必要です。

  **例**: Nano Banana Pro のデフォルト同時リクエスト数は 30 で、ほとんどのユースケースに十分です。
</Warning>

## 同時実行数の計算方法

### 個々のモデルごと

同時実行数の制限は、アカウント全体ではなく、**各特定のモデル**に適用されます。

| シナリオ        | 同時実行数の計算                                 |
| ----------- | ---------------------------------------- |
| 同じモデルの呼び出し  | そのモデルの制限の対象になります（例: Nano Banana Pro: 30） |
| 異なるモデルの呼び出し | 各モデルごとに個別に計算されます                         |
| 複数の token   | 各 token は独立した同時実行数を持ちます                  |

<Tip>
  **実例**

  次のものを同時に使用する場合:

  * Nano Banana Pro（画像）: 30 同時実行
  * GPT-4o mini（テキスト）: 50 同時実行
  * FLUX.1 Pro（画像）: 30 同時実行

  **利用可能な同時実行数の合計**: 110+ リクエスト（モデルごとに独立）
</Tip>

## より高い同時実行数を申請するには？

### 個人ユーザー

<Steps>
  <Step title="必要条件の確認">
    必要な同時実行数とユースケースを確認します
  </Step>

  <Step title="サポートへの連絡">
    [Enterprise WeChat でお問い合わせください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)  כדי needs? to explain your needs
  </Step>

  <Step title="技術審査">
    ユースケースと過去データに基づいて評価します
  </Step>

  <Step title="クォータの調整">
    承認後、token の同時実行数制限を調整します
  </Step>
</Steps>

### エンタープライズ顧客

<Info>
  **専用回線サービス**

  エンタープライズ顧客は、以下の特長を備えた専用回線サービスを申請できます:

  * 🚀 **より高い同時実行数クォータ**: ビジネス要件に合わせてカスタマイズ
  * 🔒 **分離されたリソースプール**: 一般トラフィックの影響を受けません
  * ⚡ **優先スケジューリング**: 応答速度を保証
  * 📞 **専任サポート**: 1対1のサービス

  エンタープライズ向けサービスプランについてはお問い合わせください。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="なぜテキストモデルは画像モデルより同時実行数が高いのですか？">
    テキストモデルはリクエスト/レスポンスのペイロードが小さく（通常は数 KB）、一方で画像モデルは Base64 エンコードされた画像データを転送します（通常は 500KB-5MB）。同時実行数の制御は、サービス全体の品質を確保するためのものです。
  </Accordion>

  <Accordion title="現在の同時実行数クォータはどのように確認できますか？">
    確認方法は次のとおりです:

    * バックエンドコンソールの token 設定
    * API レスポンスヘッダー内の レート制限 情報
    * 具体的なクォータについてカスタマーサポートに問い合わせる
  </Accordion>

  <Accordion title="同時実行数制限を超えるとどうなりますか？">
    制限を超えると、API は `429 Too Many Requests` を返します。推奨事項:

    * リクエストキュー管理を実装する
    * リトライ機構（指数バックオフ）を追加する
    * より高い同時実行数クォータを申請する
  </Accordion>

  <Accordion title="同時実行数制限は異なる token 間で共有されますか？">
    いいえ。各 token は干渉のない独立した同時実行数クォータを持ちます。合計の同時実行数を増やしたい場合は、複数の token を作成してリクエストを分散してください。
  </Accordion>

  <Accordion title="同時実行数クォータの調整に追加料金はかかりますか？">
    一般的に、妥当な同時実行数の調整は **無料** です。ただし、極めて高い同時実行数や専用回線サービスでは、法人向けのカスタムプランが必要になる場合があります - 詳細はカスタマーサポートにお問い合わせください。
  </Accordion>
</AccordionGroup>

## 同時実行数最適化のヒント

<CardGroup cols={2}>
  <Card title="リクエストキューを使用する" icon="list">
    同時リクエストを制御し、制限を回避するためにローカルのキュー管理を実装します
  </Card>

  <Card title="エラー再試行メカニズム" icon="refresh-cw">
    429エラーが発生した場合は、指数バックオフの再試行戦略を使用します
  </Card>

  <Card title="複数 token への分散" icon="key">
    複数の token を作成して、異なる token にリクエストを分散し、全体の同時実行数を増やします
  </Card>

  <Card title="非同期処理を優先する" icon="clock">
    リアルタイムでないシナリオでは、非同期 API（たとえば動画生成）を優先します
  </Card>
</CardGroup>

## お問い合わせ

より高い同時実行数クォータのご依頼や、エンタープライズ専用回線サービスについてのお問い合わせは、以下をご利用ください。

<CardGroup cols={3}>
  <Card title="メールサポート" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    同時実行数のご要望を詳しくご記入ください
  </Card>

  <Card title="エンタープライズ WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="エンタープライズ WeChat QRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートに連絡する](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    迅速な対応、リアルタイムでのコミュニケーション
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    即時メッセージ、効率的な回答
  </Card>
</CardGroup>

<Tip>
  **お問い合わせ時にご提供ください**:

  * 📊 **利用ケース**: 具体的なアプリケーション（例: ECサイトのバッチ画像生成、コンテンツモデレーション）
  * 📈 **想定同時実行数**: 必要な同時実行レベル
  * 🕐 **ピーク時間帯**: 主な利用時間帯
  * 📜 **過去データ**: 現在の呼び出し量と頻度

  この情報により、お客様に最適な同時実行数クォータプランをご提案できます。
</Tip>
