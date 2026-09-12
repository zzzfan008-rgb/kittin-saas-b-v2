> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AIモデルをどのように選べばよいですか？

> アプリケーションのシナリオに最適なAIモデルを選ぶ方法を学び、モデル選定の基本原則を身につけましょう

## クイックモデルリファレンス

<Info>
  **推奨リソース**: [モデル情報の概要](/ja/api-capabilities/model-info)

  このページは、最新のモデル一覧、パフォーマンス指標、課金情報を定期的に更新しており、利用可能なすべてのモデルをすばやく把握できるようにしています。
</Info>

## 選定の基本原則

<CardGroup cols={2}>
  <Card title="新しいものを古いものより優先" icon="trending-up">
    **より新しいモデルを優先する**

    * ✅ より高い性能と品質
    * ✅ 改善されているにもかかわらず、より低い価格
    * ✅ より充実した機能セット
    * ✅ より長いコンテキストサポート
  </Card>

  <Card title="ご利用シーンに合わせる" icon="target">
    **実際のニーズに合わせる**

    * 📊 データ分析: 推論が強いモデル
    * 💬 会話: 性能とコストのバランス
    * 🎨 クリエイティブ作業: マルチモーダル機能
    * ⚡ バッチ処理: 高いコスト効率
  </Card>
</CardGroup>

## 一般的なシナリオのおすすめ

### テキスト生成と会話

<AccordionGroup>
  <Accordion title="💬 一般的な対話とコンテンツ作成">
    **おすすめモデル**:

    * **Claude 3.5 Sonnet**: 複雑なタスクに対して総合力が高い
    * **GPT-4o mini**: 大量利用に優れたコストパフォーマンス
    * **Gemini 2.0 Flash**: 高速かつ費用対効果が高い

    **ユースケース**: カスタマーサービスボット、コンテンツ生成、コピーライティング
  </Accordion>

  <Accordion title="🧠 複雑な推論とデータ分析">
    **おすすめモデル**:

    * **Claude 3.7 Sonnet**: 最高水準の推論能力
    * **Gemini 3 Pro Preview**: データ分析の専門家
    * **o1 Series**: 深い思考を行うモデル

    **ユースケース**: データ分析、コード生成、論理的推論
  </Accordion>

  <Accordion title="⚡ バッチ処理と高同時実行数">
    **おすすめモデル**:

    * **GPT-4o mini**: \$0.15/100万 tokens から
    * **Gemini 2.0 Flash**: 高い安定性を備えた高速モデル
    * **GLM-4-Flash**: コスト効率の高い国産オプション

    **ユースケース**: バッチ翻訳、コンテンツモデレーション、データ処理
  </Accordion>
</AccordionGroup>

### 画像生成

<Accordion title="🎨 画像生成モデルの選択">
  **おすすめモデル**:

  * **FLUX.1 Pro**: プロ向けシナリオに最適な最高品質
  * **FLUX.1 Schnell**: 高速反復のためのスピード重視
  * **SeeDream 4.5**: 4K生成、優れたコストパフォーマンス（\$0.035/image）

  **ユースケース**:

  * **Eコマース商品画像**: SeeDream 4.5（参照画像をサポート）
  * **マーケティング用クリエイティブ**: FLUX.1 Pro（最高品質）
  * **クイックプロトタイプ**: FLUX.1 Schnell（3秒で生成）
</Accordion>

### コードと技術アプリケーション

<Accordion title="💻 コード生成と技術開発">
  **おすすめモデル**:

  * **Claude 3.7 Sonnet**: 最高のコード品質
  * **GPT-4o**: 幅広い多言語サポート
  * **Gemini 3 Pro Preview**: SWE-benchで76.2%

  **ユースケース**: コード生成、コードレビュー、技術ドキュメント
</Accordion>

## シナリオ別相談

特定のアプリケーションシナリオがあり、どのモデルを選ぶべきか迷う場合は、お気軽にご相談ください。専門的なアドバイスを差し上げます。

<CardGroup cols={3}>
  <Card title="メールサポート" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    ご利用ケースを詳しくご記入ください
  </Card>

  <Card title="法人WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="法人WeChat QRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートに連絡するにはクリックしてください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    迅速な対応、リアルタイムのコミュニケーション
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    即時メッセージ、効率的な回答
  </Card>
</CardGroup>

<Tip>
  **ご相談時には、以下の情報をご提供ください**:

  * 🎯 **アプリケーションシナリオ**: 具体的な用途（例: バッチ画像タイトル生成、カスタマーサポートの対話）
  * 📊 **利用規模**: 想定される1日あたりの呼び出し回数
  * ⚡ **パフォーマンス要件**: 応答速度、品質の期待値
  * 💰 **予算範囲**: コスト管理の目標

  この情報があると、最適なモデルの組み合わせをご提案しやすくなります。
</Tip>

## 実世界の例

<Warning>
  **事例: バッチ画像タイトル生成**

  **顧客のニーズ**: 大量の製品画像に対するタイトル説明を生成すること

  **推奨ソリューション**:

  * **GPT-4o mini**: 低コスト（\$0.15/百万 token）、安定した品質で、バッチ処理に適しています
  * **Gemini 2.0 Flash**: 高速で、さらに低コストなため、超大規模バッチに適しています

  **理由**: この種のタスクは高い創造性を必要としませんが、コストと速度には敏感です。Mini と Flash シリーズが最も高い費用対効果を提供します。
</Warning>

## モデル更新ノート

<Info>
  **最新情報を把握する**

  AIモデルは急速に進化しており、新しいモデルは通常、性能と価格の両方で大幅な改善をもたらします。次をおすすめします。

  * 📖 最新モデルを確認するために、[モデル情報ページ](/ja/api-capabilities/model-info)を定期的に確認してください
  * 🔔 新しいモデルのリリース通知を受け取るために、[更新履歴](/en/changelog)をフォローしてください
  * 🧪 無料クレジットを使って新しいモデルの性能をテストしてください
  * 📈 実際の結果に基づいて、新しいモデルへ段階的に移行してください

  **覚えておいてください**: 古いものより新しいものを優先してください - 新しいモデルのほうが、たいていより高性能でより安価です！
</Info>
