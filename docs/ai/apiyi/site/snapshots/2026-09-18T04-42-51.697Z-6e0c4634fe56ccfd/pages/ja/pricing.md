> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 料金

> APIYI と AI モデルの課金ロジックとメリットを理解し、公式ソースよりもお得な価格をご利用いただけます。私たちは透明で優遇された料金プランを提供し、より低いコストで最上位の AI モデルサービスをご利用いただけるようにしています。

## APIYI の価格設定原則

### 1. モデル価格の整合性

* **海外モデル**: 価格は公式サイトと同じです（OpenAI、Claude、Gemini、Grok などを含みます）
* **国内モデル**: 価格は公式サイトより安いです（DeepSeek、Qwen、Doubao、Kimi などを含みます）
* **レアモデル**: 新しくリリースされた一部の海外モデル（例: o3-pro）や、アクセス条件が高いモデルでは、わずかな上乗せがある場合があります。ただし、チャージ特典や割引を含めると、価格は公式料金に近くなります。

<CardGroup cols={2}>
  <Card title="透明な価格設定、20%オフ" icon="tags">
    ほとんどのモデル価格は公式料金と一致しています。消費は完全に透明で、安心してご利用いただけます\~
  </Card>

  <Card title="完全なモデル、迅速な更新" icon="bell-dot">
    メーカーが新しいモデルをリリースするたびに、APIYI はすぐに更新します。スピードが強みです！
  </Card>
</CardGroup>

## チャージのメリット

### 2. 固定為替レート

<CardGroup cols={2}>
  <Card title="固定為替レート" icon="dollar-sign">
    **1:7**の固定為替レート

    リアルタイムレートで変動しないため、課金がよりシンプルになり、チャージ特典とも併用できてさらにお得です
  </Card>

  <Card title="低い参入ハードル" icon="coins">
    **\$5**から

    わずか35人民元で利用を開始できます
  </Card>
</CardGroup>

### 3. チャージ特典

<Note>
  **チャージ額が大きいほど、節約も大きくなります**

  初回特典 + 段階的特典（10%-20%）、全体の割引は公式価格から最大**20%オフ**です
</Note>

<Card title="チャージ特典の完全なキャンペーンポリシーを見る" icon="gift" href="/ja/faq/recharge-promotions">
  初回特典、段階別の特典率、法人向けサービスなどの詳細をご確認ください
</Card>

## 公式サイトよりさらに多くの利点

より重要なのは、公式の単一アカウントと比べて、APIYI はより包括的なサービスを提供することです：

<CardGroup cols={2}>
  <Card title="無制限利用" icon="infinity">
    * レート制限なし
    * アカウント停止リスクなし
    * 従量課金
  </Card>

  <Card title="完全なモデル選択" icon="layers">
    * 400以上の人気モデル
    * ワンクリック切り替え
    * 継続的な更新
  </Card>

  <Card title="簡単な統合" icon="plug">
    * 統一された API インターフェース
    * OpenAI 形式に対応
    * ゼロ移行コスト
  </Card>

  <Card title="エンタープライズグレードのサービス" icon="shield-check">
    * 専門的な技術サポート
    * 安定して信頼性が高い
    * データセキュリティ保証
  </Card>
</CardGroup>

## 課金の基本

### 「従量課金」とは？

従量課金とは、月額や年額の前払いなしで、実際に利用したサービス分だけ支払う方式です。

<CardGroup cols={2}>
  <Card title="柔軟な利用" icon="chart-line">
    * 利用した分だけ支払う
    * 最低利用量なし
    * いつでも開始・停止可能
  </Card>

  <Card title="コスト管理" icon="gauge">
    * リアルタイムの消費状況を確認
    * クォータアラートを設定
    * 1回ごとに正確に計測
  </Card>
</CardGroup>

### 課金モードの優先順位

APIYI は 2 つの課金モードをサポートしています。モデルが両方をサポートする場合は、次のとおりです。

<Warning>
  **呼び出しごとの課金は token ごとの課金より優先されます**

  モデルが呼び出しごとの課金と token ごとの課金の両方をサポートしている場合、システムのデフォルトは呼び出しごとの課金になります。
</Warning>

#### token（API Key）設定の影響

課金方法は token の設定にも影響されます。

<CardGroup cols={2}>
  <Card title="tokenのみ課金" icon="sliders-horizontal">
    token が「tokenのみ課金」に設定されている場合、モデルが呼び出しごとの課金をサポートしていても、token ごとの課金が使用されます
  </Card>

  <Card title="デフォルト設定" icon="circle-check">
    token はデフォルトで全ての課金モードをサポートし、システムが自動選択します（呼び出しごとの課金が優先）
  </Card>
</CardGroup>

### 「呼び出しごとの課金」のケース

次の種類のモデルは通常、呼び出しごとの課金を使用します。

<Tabs>
  <Tab title="画像生成">
    **適用モデル**:

    * sora\_image シリーズ（リバースエンジニアリングされたモデル）
    * flux-kontext-pro（公式モデル）
    * DALL-E シリーズ
    * Midjourney 関連モデル

    **課金単位**: 画像ごと
  </Tab>

  <Tab title="動画生成">
    **適用モデル**:

    * 動画生成 API
    * アニメーションモデル

    **課金単位**: 動画ごと/秒ごと
  </Tab>

  <Tab title="特殊モデル">
    **識別方法**:

    * `-all` サフィックスを持つモデル（リバースエンジニアリングされたもの）
    * 特定の機能モデル

    **課金単位**: 1回ごと
  </Tab>
</Tabs>

<Info>
  完全なモデル料金表はこちら: [APIYI 料金表](https://api.apiyi.com/account/pricing)
</Info>

### token とは？

token は、AI モデルがテキストを処理するための基本単位です。token を理解すると、費用の見積もりと管理に役立ちます。

<Info>
  **token 計算の参考**

  * 中国語: 1 文字 ≈ 1-2 token
  * 英語: 1 単語 ≈ 1-2 token
  * 1000 token ≈ 英語 750 語 ≈ 中国語 500 文字
</Info>

#### token 計算の例

```
Input text: "Hello, please help me write a Python function"
Token count: About 12-15 tokens

Output text: "def hello_world():\n    print('Hello, World!')"
Token count: About 15-20 tokens

Total consumption: Input + Output ≈ 30-35 tokens
```

### prompt と completion

各 API 呼び出しの費用は、次の 2 つの部分で構成されます。

<Steps>
  <Step title="prompt - 入力 token">
    モデルに送信するすべての内容には、次が含まれます:

    * システム prompt
    * ユーザーの質問
    * コンテキスト情報
    * 会話履歴（ある場合）
  </Step>

  <Step title="completion - 出力 token">
    モデルによって生成される内容には、次が含まれます:

    * テキスト応答
    * コード生成
    * 構造化データ
  </Step>
</Steps>

<Warning>
  モデルによって入力と出力の料金は異なる場合があります。通常、出力 token のほうが入力 token より高くなります。
</Warning>

## 最適なモデルの選び方

### モデル選定戦略

<Tabs>
  <Tab title="コスト重視">
    **適したシナリオ**: バッチ処理、単純なタスク、テストと開発

    **推奨モデル**:

    * gemini-2.5-flash (高速でバランスが良い)
    * gpt-4.1 (gpt-4.5 の公式後継)
    * deepseek-v3 (国産の強み、高コスパ)

    **想定コスト**: \$0.1-1/100万 token
  </Tab>

  <Tab title="性能重視">
    **適したシナリオ**: 複雑な推論、専門的なコンテンツ、高品質な出力

    **推奨モデル**:

    * gemini-2.5-pro (強力なマルチモーダル)
    * claude-sonnet-4-20250514-thinking (長文処理)
    * o3 (OpenAI の主要な推論モデル、マルチモーダル)
    * deepseek-r1-0528 (R1 最適化版)

    **想定コスト**: \$3-15/100万 token
  </Tab>

  <Tab title="バランス重視の選択">
    **適したシナリオ**: 日常利用、中程度の複雑さのタスク

    **推奨モデル**:

    * gpt-4.1 (コストと性能のバランスが良い)
    * claude-3-5-haiku-20241022 (高速応答)
    * qwen-max (中国語向けに最適化)

    **想定コスト**: \$0.5-3/100万 token
  </Tab>
</Tabs>

左側の「人気モデル」ページで、詳しい情報をご確認ください。

### コスト見積もり方法

<Steps>
  <Step title="少量サンプルのテスト">
    少数のサンプル（5-10件）でテストする
  </Step>

  <Step title="消費ログを確認">
    APIYI コンソールで、各呼び出しの詳細な token 消費量を確認する
  </Step>

  <Step title="平均を算出">
    1回の呼び出しあたりの平均 token 数を算出する
  </Step>

  <Step title="総コストを見積もる">
    平均 token 数 × 想定呼び出し回数 × モデル単価
  </Step>
</Steps>

<Card title="実践的なアドバイス" icon="lightbulb">
  1. まずは安価なモデルでテストし、実現可能性を確認する
  2. APIYI バックエンドのログで実際の消費量を分析する
  3. タスクの複雑さに応じて適切なモデルを選ぶ
  4. プロンプトを最適化して、不要な token 消費を減らす
</Card>

## リアルタイム価格照会

<CardGroup cols={2}>
  <Card title="モデル価格一覧" icon="table" href="https://api.apiyi.com/account/pricing">
    すべてのモデルのリアルタイム価格を確認できます

    * token単位の課金価格
    * 1回ごとの課金価格
    * 割引の比較
  </Card>

  <Card title="コスト計算ツール（開発中）" icon="calculator" href="https://api.apiyi.com">
    利用コストをすばやく見積もれます

    * 想定利用量を入力
    * モデルを選択
    * 手数料を自動計算
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="リアルタイム価格の確認方法は？">
    [APIYI コンソール](https://api.apiyi.com)にログインすると、モデル一覧ページで全モデルのリアルタイム価格を確認できます。
  </Accordion>

  <Accordion title="チャージにはどれくらい時間がかかりますか？">
    チャージは即時で、お支払い成功後すぐにご利用いただけます。
  </Accordion>

  <Accordion title="請求書に対応していますか？">
    はい、正式な請求書に対応しています。コンソールで請求書申請を提出してください。
  </Accordion>

  <Accordion title="まとめ買い割引はありますか？">
    法人向けの大口チャージでは、より多くの割引を受けられます。カスタマーサービスまでお問い合わせください。
  </Accordion>
</AccordionGroup>

## 請求書情報

### 請求書の発行手続き

オンラインでのチャージまたは法人振込が完了すると、実際の支払金額に基づいて請求書を発行します（表示価格はすべて税込です）。お客様は、会社名または大学名、納税者番号などの詳細な請求書情報をご提供ください。

<Steps>
  <Step title="請求書情報を送信">
    Webサイト管理画面の上部ナビゲーション - 請求書発行、自分で請求書フォームを送信

    [請求書申請を送信 →](https://xinqikeji.feishu.cn/share/base/form/shrcns8TS3alZTN2Av1JfkOvmqh)
  </Step>

  <Step title="請求書の種類">
    * VATの通常請求書を発行できます（特別請求書は別途税点の調整が必要です）
    * 請求書の区分: **情報技術サービス費** または **データ収集費**
    * 提供可能: 公式印章付きの購入一覧
  </Step>

  <Step title="発行までの時間">
    約1営業日で、WeChatまたはメールで電子請求書として送付します
  </Step>
</Steps>

<Info>
  当社には多くの大学・企業のお客様がいらっしゃり、各種の合理的な精算要件に対応できます。
</Info>

***

<Card title="今すぐ始める" icon="rocket" href="https://api.apiyi.com">
  アカウントを登録し、チャージして割引を受け、400以上のAIモデルをお試しください
</Card>
