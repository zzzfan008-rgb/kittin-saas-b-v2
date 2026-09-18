> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYIのサーバーはどこにありますか？ どのサーバーを選べばよいですか？

> APIYIのサーバー所在地、データセンター分布、ネットワーク遅延のテスト方法、サーバー購入の推奨事項を学びます

## サーバー所在地

APIYI のサーバーは **米国ロサンゼルス（US West）** にあり、**BandwagonHost の中国向け最適化プレミアムネットワーク** を使用しています。

<Info>
  **プレミアムネットワーク最適化**: 当社のサーバーは中国向けに最適化されたプレミアムネットワークを備えており、中国本土のユーザー向けに特別に最適化されています。大容量の画像転送（Base64 エンコード）でも通常の速度を維持できます。
</Info>

## 地域別ネットワークパフォーマンス

<CardGroup cols={2}>
  <Card title="中国本土のユーザー" icon="map-pin">
    **ネットワークパフォーマンス**: 優秀です ✅

    * プレミアムなネットワーク最適化で、低遅延です
    * 大きな画像転送（Base64）は通常速度です
    * 高頻度の API 呼び出しに適しています
    * 追加のプロキシ設定は不要です
  </Card>

  <Card title="海外のユーザー" icon="globe">
    **ネットワークパフォーマンス**: 地理的位置によって異なります 🌍

    * 米国西部リージョンで最も低遅延です
    * ヨーロッパ/アジア太平洋では遅延がやや高くなります
    * 米国西部のサーバーを選ぶことをおすすめします
    * CDN 加速を利用できます
  </Card>
</CardGroup>

## サーバー購入の推奨

### 海外サーバーの推奨

APIYI サービスを呼び出すために海外サーバーを使用する場合は、次をおすすめします。

<Tip>
  **推奨の選択**: 米国西部（ロサンゼルス、サンノゼ、シアトルなど）のデータセンターサーバー

  * **地理的な近さ**: 当社サーバーと同じリージョンで、レイテンシーが最小
  * **最適化されたネットワークルーティング**: 同一リージョン間で最良のルーティング
  * **コスト効率**: 米国西部のデータセンターはリーズナブルな価格
</Tip>

信頼できる VPS プロバイダーをお探しなら、当社が利用しているのと同じプロバイダーを検討してください。

<Card title="BandwagonHost VPS" icon="server" href="https://bandwagonhost.com/aff.php?aff=80627">
  **BandwagonHost** - 評判の高い VPS プロバイダー

  * ✅ 中国向けに最適化されたプレミアムネットワーク（CN2 GIA、CN2 など）
  * ✅ 複数の米国西部データセンター（ロサンゼルス、サンノゼなど）
  * ✅ 安定・信頼性が高く、コスト効率に優れる
  * ✅ 国内ユーザーと海外ユーザーの両方に適しています

  クリックして BandwagonHost VPS のプランを確認してください
</Card>

### 中国本土サーバー

<Info>
  **中国本土のサーバーも非常におすすめです！**

  中国向けに最適化されたプレミアムネットワークのおかげで、サーバーが中国本土にあっても、APIYI へのアクセスは通常のレイテンシーと速度で、ネットワーク面の懸念はありません。
</Info>

**適したシナリオ**:

* Alibaba Cloud、Tencent Cloud、Huawei Cloud などの国内クラウドプロバイダー上にデプロイされたアプリケーション
* 主に中国本土のユーザー
* 国内のコンプライアンス要件を満たす必要がある

## ネットワーク遅延をテストするには？

サーバーを選ぶ前に、サーバーから APIYI へのネットワーク遅延をテストすることをおすすめします。

### 方法 1: Ping テスト

```bash theme={null}
# Test latency (ICMP)
ping api.apiyi.com
```

**参考遅延**:

* **中国本土**: 通常 50-150ms（プレミアムネットワーク最適化済み）
* **米国西部地域**: 通常 5-30ms（同一地域）
* **ヨーロッパ/アジア太平洋**: 通常 150-300ms（クロスリージョン）

### 方法 2: cURL 遅延テスト

```bash theme={null}
# Single HTTP latency test
curl -o /dev/null -s -w "Connect time: %{time_connect}s\nTotal time: %{time_total}s\n" https://api.apiyi.com

# Multiple tests for average (more accurate)
for i in {1..10}; do
  curl -o /dev/null -s -w "Test $i - Total time: %{time_total}s\n" https://api.apiyi.com
done
```

### 方法 3: 実際の API 呼び出しテスト

```bash theme={null}
# Test actual API call latency
time curl -X POST https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

<Tip>
  **最適化の提案**: 遅延が高い場合（500ms 超）、次を検討してください:

  * 米国西部のデータセンターサーバーに切り替える
  * CDN またはプロキシ加速を使用する
  * ネットワーク最適化ソリューションについてカスタマーサービスに連絡する
</Tip>

## ネットワーク最適化の推奨事項

### 高レイテンシーのシナリオ向け

サーバーのレイテンシーが高い場合は、次の最適化策を試してください:

<Steps>
  <Step title="コネクションプーリングを使用">
    HTTP 接続を再利用して、頻繁な新規接続のオーバーヘッドを回避します
  </Step>

  <Step title="HTTP/2 または HTTP/3 を有効にする">
    多重化機能を活用して、同時リクエストの効率を向上させます
  </Step>

  <Step title="リクエストをバッチ処理する">
    複数の小さなリクエストをバッチリクエストにまとめて、ネットワーク往復回数を削減します
  </Step>

  <Step title="非同期呼び出し">
    ブロッキング待機を避けるために、非同期 API 呼び出しを使用します
  </Step>

  <Step title="ローカルキャッシュ">
    繰り返しのリクエスト結果をキャッシュして、API 呼び出し頻度を削減します
  </Step>
</Steps>

### 大きな画像の転送向け

大きな画像（例: 画像生成、画像認識）を頻繁に転送する場合は、次をおすすめします:

<CardGroup cols={2}>
  <Card title="URL パラメータを使用" icon="link">
    Base64 エンコードよりも画像 URL を優先してください

    リクエストボディサイズを削減し、転送効率を向上させます
  </Card>

  <Card title="画像を圧縮する" icon="file-archive">
    アップロード前に画像品質を適切に圧縮してください

    品質を維持しながらファイルサイズを削減します
  </Card>
</CardGroup>

## よくある質問

<AccordionGroup>
  <Accordion title="なぜ他のリージョンではなく US West を選ぶのですか？">
    **主な理由**:

    1. **プレミアムネットワーク最適化**: US West は中国向けプレミアムネットワークの主な出口であり、中国本土ユーザーに最適なルーティングを提供します
    2. **国際ハブ**: ロサンゼルスは、アジア太平洋、ヨーロッパ、北米などをつなぐ主要な国際ネットワークハブです
    3. **コスト優位性**: US West のデータセンターは帯域幅コストが比較的低く、コストパフォーマンスに優れています
    4. **サービスの安定性**: BandwagonHost のようなプロバイダーは US West での豊富な運用経験があり、安定性も良好です
  </Accordion>

  <Accordion title="中国本土から APIYI にアクセスすると遅くなりますか？">
    **いいえ！**

    当社は BandwagonHost の **中国向けに最適化されたプレミアムネットワーク**（CN2 GIA など）を使用しており、中国本土ユーザー向けに特別最適化されています。

    **実際のパフォーマンス**:

    * 中国本土ユーザーのアクセス遅延は通常 50-150ms です
    * Base64 の大きな画像転送でも通常の速度を維持できます
    * プロキシや VPN の設定は不要です

    上記の方法で実際のネットワーク遅延をテストできます。
  </Accordion>

  <Accordion title="アプリケーションのネットワーク遅延をどのように最適化できますか？">
    **最適化の推奨**:

    1. **サーバー選択**: US West のデータセンターサーバーを選択します（当社と同じリージョンです）
    2. **接続の再利用**: 頻繁な新規接続を避けるために HTTP 接続プーリングを使用します
    3. **バッチリクエスト**: 複数の小さなリクエストをまとめてバッチにします
    4. **非同期呼び出し**: 非同期の API 呼び出しを使用し、メインスレッドをブロックしないでください
    5. **ローカルキャッシュ**: 繰り返し行うリクエスト結果をキャッシュします
    6. **CDN 加速**: 静的リソースに CDN を使用します

    詳細は上記の「ネットワーク最適化の推奨」セクションをご覧ください。
  </Accordion>

  <Accordion title="APIYI は他のリージョンにサーバーを展開する予定はありますか？">
    当社は現在、**高品質で安定した** US West のサーバーサービスの提供に注力しており、プレミアムネットワークを活用してグローバルユーザー（特に中国本土ユーザー）に良好なネットワーク体験を提供しています。

    将来的には、ユーザー需要と事業展開に基づいて、他のリージョン（ヨーロッパ、アジア太平洋など）へのサーバー展開の可能性を評価します。

    特別な地理的要件がある場合は、営業チームまでご連絡いただき、カスタムソリューションをご相談ください。
  </Accordion>

  <Accordion title="私のサーバーは US West ではなく、遅延が高いです。どうすればよいですか？">
    サーバーの遅延が高い場合（500ms 超）、次を検討してください:

    **短期的な解決策**:

    * プロキシまたは CDN 加速を使用します
    * アプリケーションコードを最適化します（接続プーリング、非同期呼び出しなど）
    * ネットワーク往復回数を減らすためにリクエストをバッチ化します

    **長期的な解決策**:

    * サーバーを US West のデータセンターへ移行します
    * マルチリージョン展開を行い、APIYI 呼び出し専用の US West サーバーを用意します
    * カスタマイズされたネットワーク最適化ソリューションについてご相談ください
  </Accordion>

  <Accordion title="BandwagonHost VPS は個人開発者に適していますか？">
    **もちろんです！**

    BandwagonHost には、さまざまな価格帯の VPS プランがあります:

    * **エントリーレベル**: 個人開発者のテストや低トラフィックアプリケーションに適しています
    * **ミドルレンジ**: 小規模から中規模の本番環境に適しています
    * **ハイエンド**: 高トラフィック・高同時実行数のシナリオに適しています

    メリット:

    * 価格が手頃で、コストパフォーマンスに優れています
    * 中国向けに最適化されたプレミアムネットワーク（中国本土から高速アクセス）
    * 柔軟な支払いオプション（月額、年額など）に対応しています
    * スナップショットバックアップ、ワンクリック再インストールなどの便利な機能を提供します
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="ネットワーク接続のトラブルシューティング" icon="network" href="/ja/faq/network-proxy">
    ネットワーク接続の問題のトラブルシューティング、プロキシの設定などについて説明します。
  </Card>

  <Card title="API同時実行数制限" icon="gauge" href="/ja/faq/api-concurrency">
    APIの同時実行数制限とパフォーマンス最適化の推奨事項について説明します
  </Card>
</CardGroup>

## お問い合わせ

サーバー選定、ネットワーク最適化、その他関連するご質問については、以下までお問い合わせください:

<CardGroup cols={2}>
  <Card title="企業WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業WeChatのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートに連絡するにはクリックしてください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    ネットワーク最適化、技術サポート
  </Card>

  <Card title="メールでのお問い合わせ" icon="mail">
    **カスタマーサポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネス提携**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
