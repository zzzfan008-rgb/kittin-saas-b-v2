> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 高度な機能とトラブルシューティング

> OpenClaw のトラブルシューティング、カスタムスキル、メモリー機能、マルチデバイス同期、セキュリティのヒント

## トラブルシューティング

<AccordionGroup>
  <Accordion title="Telegramに接続できない">
    Telegramは一部の地域でプロキシが必要な場合があります。ターミナルのプロキシを設定して、Gatewayを再起動してください:

    ```bash theme={null}
    export https_proxy=http://127.0.0.1:proxy-port
    export http_proxy=http://127.0.0.1:proxy-port
    openclaw gateway restart
    ```

    または、Web UIを直接使用してください（プロキシは不要です）。
  </Accordion>

  <Accordion title="設定ファイルの形式エラー">
    自動修正するには、診断コマンドを実行してください:

    ```bash theme={null}
    openclaw doctor --fix
    ```
  </Accordion>

  <Accordion title="API接続に失敗しました">
    1. API keyが正しいか確認してください
    2. `baseUrl` が `https://api.apiyi.com/v1` に設定されていることを確認してください
    3. 接続性をテストします:

    ```bash theme={null}
    curl -H "Authorization: Bearer your-key" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="ランタイムログの表示方法">
    ```bash theme={null}
    openclaw logs --follow
    ```
  </Accordion>

  <Accordion title="OpenClawの更新方法">
    ```bash theme={null}
    openclaw update
    ```
  </Accordion>

  <Accordion title="新しいチャットチャネルを追加する方法">
    ```bash theme={null}
    openclaw channels add --channel telegram
    ```
  </Accordion>
</AccordionGroup>

## カスタムスキル

OpenClaw はカスタムスキルをサポートしています。`~/.openclaw/workspace/skills/` ディレクトリに作成してください。

## メモリ機能

OpenClaw は会話と好みを記憶します。`/memory` を使ってメモリを表示・管理できます。

## マルチデバイス同期

OpenClaw を複数のデバイスで実行し、リモートアクセスには Tailscale などのツールを使用します。

## セキュリティのヒント

<Warning>
  * **API Key のセキュリティ**: 設定ファイルを他人と共有しないでください
  * **権限管理**: OpenClaw はターミナルコマンドを実行できます - 危険な操作は避けてください
  * **ネットワークセキュリティ**: デフォルトでは localhost でのみ待ち受けます。リモートアクセスには適切なセキュリティ対策を設定してください
</Warning>

## 関連リソース

<CardGroup cols={2}>
  <Card title="APIYI コンソール" icon="settings" href="https://api.apiyi.com">
    APIキーを管理し、使用状況を表示します
  </Card>

  <Card title="モデル推奨" icon="chart-bar" href="/ja/api-capabilities/model-info">
    シナリオ別のモデル推奨を表示します
  </Card>
</CardGroup>
