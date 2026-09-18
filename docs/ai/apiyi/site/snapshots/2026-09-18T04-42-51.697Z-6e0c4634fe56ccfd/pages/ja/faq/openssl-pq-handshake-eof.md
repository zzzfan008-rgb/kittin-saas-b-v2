> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Python で SSLEOFError が発生するのに curl は動作するのはなぜですか？

> OpenSSL 3.5 以降では耐量子鍵交換がデフォルトで有効になっています。より大きなハンドシェイクが一部のネットワークミドルボックスによって切断され、UNEXPECTED_EOF_WHILE_READING が発生します。

## 症状

同じマシン上で、`curl`に対する`api.apiyi.com`は正常に動作しますが、Pythonプログラム（特にConda環境）では次のエラーが発生します。

```text theme={null}
ssl.SSLEOFError: [SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol (_ssl.c:1016)
urllib3.exceptions.MaxRetryError: HTTPSConnectionPool(host='api.apiyi.com', port=443): Max retries exceeded
```

ポート443での接続タイムアウトや、ハンドシェイク中の切断として現れる場合もあります。VPNは使用しておらず、ネットワークを切り替える（たとえばスマートフォンのテザリングを使用する）と、再び正常に動作します。

## 短い回答

**これは APIYI のサーバー側の問題でも証明書の問題でもありません。お使いの OpenSSL バージョンが、ネットワーク上の中間機器と互換性がありません。**

両側の OpenSSL バージョンを比較してください。

```bash theme={null}
curl --version | head -1          # e.g. OpenSSL/3.0.2
python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # e.g. OpenSSL 3.6.2
```

失敗している側が **OpenSSL 3.5 以降**で、動作している側が 3.5 未満の場合、これが原因である可能性はほぼ確実です。

## 発生する理由

OpenSSL 3.5 以降、TLS ハンドシェイクにはデフォルトで耐量子鍵交換（X25519MLKEM768）が含まれます。これにより、最初のハンドシェイクメッセージ（ClientHello）は約 300 バイトから約 1500 バイトへと大きくなり、単一の TCP セグメントよりも大きくなるため、2 つのセグメントに分割されます。

一部の企業ファイアウォール、TLS インスペクションアプライアンス、および ISP 側のディープパケットインスペクションデバイスは、分割された ClientHello を処理できない、または新しい鍵交換アルゴリズムを認識できず、単に接続を閉じます。クライアントには「プロトコル違反により EOF が発生しました」と表示されます。

すべての APIYI エッジノードは、この耐量子ハンドシェイクをサポートしています。2026-09-11 (UTC+8) に、各ノードを OpenSSL 3.6.4 で検証し、すべて合格しました。ハンドシェイクパケットは当社に到達する前にお客様のネットワーク内で破棄されているため、サーバー側で解決できることはありません。

## 確認する3つのコマンド

**失敗している環境**で、`openssl`バイナリを使用して以下を実行します（最初にConda環境を有効化してください）。

```bash theme={null}
# 1. Default settings, with post-quantum key exchange
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com </dev/null | grep -E "Negotiated|Verify"

# 2. X25519 only, no post-quantum key exchange
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com -groups X25519 </dev/null | grep Verify

# 3. Default handshake against any other HTTPS site
openssl s_client -connect www.google.com:443 -servername www.google.com </dev/null | grep Verify
```

| 結果           | 診断                                                           |
| ------------ | ------------------------------------------------------------ |
| 1は失敗し、2は成功   | 確認済み：大きなハンドシェイクがネットワークによって切断されています。以下に示すように、クライアント側で修正してください |
| 1と3の両方が失敗    | ネットワークがすべてのポスト量子ハンドシェイクをブロックしています。同じクライアント側の修正を行ってください       |
| 1、2、3のすべてが成功 | 別の問題です。完全なエラーと`pip show urllib3 requests`の出力をサポートに送信してください   |

## 修正方法（いずれか1つを選択）

<Steps>
  <Step title="オプション1：設定ファイルでポスト量子鍵交換を無効にする（推奨）">
    たとえば、次のファイルを作成します `~/no-pq.cnf`：

    ```ini theme={null}
    openssl_conf = openssl_init
    [openssl_init]
    ssl_conf = ssl_sect
    [ssl_sect]
    system_default = system_default_sect
    [system_default_sect]
    Groups = X25519:P-256:P-384
    ```

    プログラムを実行する前に、環境変数を設定します：

    ```bash theme={null}
    export OPENSSL_CONF=~/no-pq.cnf
    python your_script.py
    ```

    その環境内のすべてのOpenSSLベースのプログラム（Python、curl、pipなど）は、ポスト量子鍵共有の送信を停止し、ClientHelloのサイズは約300バイトに戻ります。暗号化強度は変わりません。これは、3.5以前のデフォルト動作に戻すだけです。
  </Step>

  <Step title="オプション2：CondaでOpenSSLをダウングレードする">
    ```bash theme={null}
    conda install "openssl<3.5"
    ```

    3.5より前のバージョンでは、ポスト量子鍵交換はデフォルトで有効になりません。OpenSSLに依存するパッケージも変更される可能性があるため、まずステージング環境でテストしてください。
  </Step>

  <Step title="オプション3：ネットワークチームにミドルボックスの更新を依頼する">
    主流のファイアウォールとTLSインスペクションアプライアンスは、2025年以降にリリースされたファームウェアで、ハイブリッドポスト量子ハンドシェイクをサポートしています。これは恒久的な修正であり、他のサイトでも同じ障害が発生するのを防ぎます。
  </Step>
</Steps>

## 追加の質問

<AccordionGroup>
  <Accordion title="ブラウザでは api.apiyi.com を開けるのに、プログラムでは開けないのはなぜですか？">
    ブラウザとプログラムでは、ネットワーク経路が異なる場合があります（ブラウザではシステムプロキシが使用されることがあります）。また、ブラウザは接続に失敗すると、ポスト量子共有なしでハンドシェイクを自動的に再試行します。プログラムはそのように動作しません。
  </Accordion>

  <Accordion title="Node.js、Go、Java でも同じ問題が発生しますか？">
    TLS ライブラリが OpenSSL 3.5 以降であるクライアントであれば、curl 8.x のように新しい OpenSSL に対してビルドされたものを含め、発生する可能性があります。Go と Java はそれぞれ独自の TLS スタックを使用しており、ポスト量子交換がデフォルトで有効になるかどうかはバージョンによって異なります。診断方法は同じです。上記の 3 つのコマンドを使用して、デフォルトのハンドシェイクだけが失敗するかどうかを確認してください。
  </Accordion>

  <Accordion title="IP で接続するか、verify=False を設定すると解決しますか？">
    いいえ。接続は、証明書の検証が始まる前のハンドシェイク中に切断されています。検証を無効にしても解決せず、セキュリティリスクが増加します。
  </Accordion>

  <Accordion title="APIYI はサーバー側でポスト量子ハンドシェイクを無効にできますか？">
    最初のハンドシェイクメッセージはクライアントから送信されます。ネットワーク内部でそのメッセージが破棄されると、サーバーは受信できないため、サーバー設定では解決できません。3 つのコマンドによって、他のサイトに対するデフォルトのハンドシェイクは成功する一方で、api.apiyi.com に対してのみ失敗することが示された場合は、結果をお送りください。さらに調査します。
  </Accordion>
</AccordionGroup>

## 関連

<CardGroup cols={2}>
  <Card title="APIを使用するにはプロキシが必要ですか？" icon="wifi" href="/ja/faq/network-proxy">
    APIYIはプロキシやVPNなしの直接接続に対応しています
  </Card>

  <Card title="タイムアウト設定" icon="clock" href="/ja/faq/timeout-configuration">
    接続タイムアウトと読み取りタイムアウトの設定方法
  </Card>
</CardGroup>
