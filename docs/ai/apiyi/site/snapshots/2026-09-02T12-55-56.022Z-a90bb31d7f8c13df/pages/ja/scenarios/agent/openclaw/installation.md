> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# インストールガイド

> macOS、Linux、Windows に OpenClaw ローカル AI アシスタントをインストールします

## システム要件

* Node.js 22 以上
* macOS / Linux / Windows

## Node.js をインストール

<Tabs>
  <Tab title="macOS（Homebrew）">
    ```bash theme={null}
    brew install node@22
    ```
  </Tab>

  <Tab title="Linux（nvm）">
    ```bash theme={null}
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    nvm install 22
    nvm use 22
    ```
  </Tab>

  <Tab title="Windows">
    Node.js の公式サイトから 22.x 以上のバージョンをダウンロードしてインストールしてください。

    または、PowerShell を使って fnm をインストールします。

    ```powershell theme={null}
    winget install Schniz.fnm
    fnm install 22
    fnm use 22
    ```
  </Tab>
</Tabs>

## OpenClaw をインストール

<Tabs>
  <Tab title="npm（推奨）">
    ```bash theme={null}
    npm install -g openclaw
    ```
  </Tab>

  <Tab title="クイックインストールスクリプト">
    ```bash theme={null}
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell theme={null}
    irm https://openclaw.ai/install.ps1 | iex
    ```
  </Tab>
</Tabs>

## インストールを確認

```bash theme={null}
openclaw --version
```

診断コマンドを実行して、環境が準備できているか確認します。

```bash theme={null}
openclaw doctor
```

現在の実行状態を確認します。

```bash theme={null}
openclaw status
```

<Info>
  `openclaw doctor`で問題が報告された場合は、自動修正を試してください。

  ```bash theme={null}
  openclaw doctor --fix
  ```
</Info>

## 次のステップ

インストール後、構成方法を選択してください:

<CardGroup cols={3}>
  <Card title="JSON 設定" icon="file-code" href="/ja/scenarios/agent/openclaw/config-json">
    JSON 設定を手動で編集します
  </Card>

  <Card title="CLI 対話型セットアップ" icon="terminal" href="/ja/scenarios/agent/openclaw/config-cli">
    ウィザードに従ってセットアップします
  </Card>

  <Card title="Anthropic ネイティブ設定" icon="bot" href="/ja/scenarios/agent/openclaw/config-anthropic">
    Claude に直接接続します
  </Card>
</CardGroup>
