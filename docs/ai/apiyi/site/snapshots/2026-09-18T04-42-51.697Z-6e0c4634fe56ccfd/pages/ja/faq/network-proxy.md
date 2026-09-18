> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI の API を使うにはプロキシが必要ですか？

> APIYI のネットワークアクセス方法と、プロキシや VPN が必要かどうかを学びます

## 短い回答

**プロキシは不要です。直接接続できます。**

APIYI は、中国本土からプロキシや VPN を使う必要なく、直接アクセスできます。

## ネットワークアクセスの案内

### 中国本土のユーザー

<Info>
  **プロキシなしの直接接続**

  * ✅ プロキシや VPN の設定は不要です
  * ✅ `api.apiyi.com` へ直接アクセスできます
  * ✅ 中国向け接続のためのエンタープライズグレードの専用回線
  * ✅ 低遅延、高い安定性
</Info>

### 海外のユーザー

中国国外からAPIYIを利用している場合:

* 🚀 さらに高速なアクセス速度
* 🌐 直接の国際ルーティング
* ⚡ 追加の設定は不要です

## ネットワーク問題の解決策

まれに、一部のユーザーで次の問題が発生する場合があります:

<CardGroup cols={2}>
  <Card title="HTTPS 証明書の問題" icon="shield-alert">
    SSL/TLS 証明書の検証に失敗する

    考えられる原因: ローカル時刻の誤り、証明書チェーンの不完全さ
  </Card>

  <Card title="接続エラー" icon="wifi-off">
    接続がタイムアウトする、または接続を確立できない

    考えられる原因: ローカルネットワークの制限、DNS 解決の問題
  </Card>
</CardGroup>

### 代替手段: HTTP アドレス

上記の問題を解決できない場合は、代替手段として HTTP アクセスを提供しています:

<Warning>
  **HTTP アドレスの取得**

  HTTP プロトコルは暗号化なしでデータを送信するため、一時的な解決策としてのみ使用してください。HTTP アクセスアドレスを取得するには、テクニカルサポートまでお問い合わせください:

  [Enterprise WeChat でお問い合わせ](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
</Warning>

## よくある質問

### 中国から直接接続できるのはなぜですか？

中国向け接続には、コンプライアンスに準拠したエンタープライズグレードの専用回線を使用しており、中国本土のユーザーに対して安定かつ高速なアクセスを確保しています。

### HTTPS と HTTP の違いは何ですか？

* **HTTPS**（推奨）: 暗号化通信で、データの安全性が高い
* **HTTP**（代替）: 平文通信です。HTTPS に問題が発生した場合に一時的にのみ使用してください

### ネットワーク接続が正常かどうかは、どう確認できますか？

以下のコマンドでテストできます。

```bash theme={null}
# Test API connection
curl -I https://api.apiyi.com

# Test DNS resolution
ping api.apiyi.com
```

正常なレスポンスが返ってくれば、ネットワーク接続は問題ありません。

## ネットワーク最適化のヒント

<Tip>
  **アクセス速度を向上させるヒント**

  * 🕐 ローカルシステム時刻が正確であることを確認してください（証明書検証の失敗を防ぎます）
  * 🌐 安定したDNSサービスを使用してください（例: 114.114.114.114 または 8.8.8.8）
  * 📡 Wi-Fiより有線ネットワークを優先してください
  * 🔄 システムのルート証明書を定期的に更新してください
</Tip>

## 技術サポート

ネットワークアクセスの問題が発生した場合は、テクニカルサポートまでご連絡ください:

<Card title="Enterprise WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  QRコードをスキャンするか、[サポートに連絡するにはクリック](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  テクニカルサポート、迅速な対応
</Card>
