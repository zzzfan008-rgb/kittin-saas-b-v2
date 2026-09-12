> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code の 400 エラーの修正

> APIYI の AWS Claude (Bedrock) 公式リレーで Claude Code が 400 / ValidationException を返す理由と、その修正方法

## 📌 問題

Claude Code の実行中に、次のようなエラーが発生するユーザーがいます:

* `400 ValidationException`
* `Extra inputs are not permitted`
* `cache_control.scope` に言及するエラー

これらはほとんどの場合、**Claude Code の実験的な beta パラメータ**が原因です。これらは、APIYI が提供する公式の Amazon Claude API（AWS Claude / Bedrock）チャネルでは**サポートされていません**。

<Info>
  このガイドは、**AWS Claude (Bedrock) 公式チャネル**を経由するリクエストにのみ適用されます。ネイティブの Anthropic API チャネルはこれらの beta パラメータをサポートしているため、下記の変更は不要です。
</Info>

## ✅ 解決策（推奨）

Claude Code の実験的なベータ機能をオフにします。

### Option 1: settings.json を編集する（推奨）

環境変数を Claude Code `settings.json` に追加してください:

```json theme={null}
"env": {
  "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1"
}
```

### Option 2: 一時的に適用する（現在のターミナルセッション）

ターミナルで次を実行してください:

```bash theme={null}
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
```

その後、Claude Code をもう一度起動してください。

<Tip>
  オプション 2 は現在のターミナルウィンドウにのみ影響し、閉じると失われます。恒久的に修正するには、オプション 1 またはオプション 3 を使用してください。
</Tip>

### Option 3: 永続的に適用する（推奨）

お使いの環境に応じて、シェル設定にこの変数を書き込みます。

#### Mac / Linux (bash)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.bashrc
source ~/.bashrc
```

#### Mac (zsh、デフォルト)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.zshrc
source ~/.zshrc
```

#### Windows (PowerShell)

```powershell theme={null}
[System.Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", "1", "User")
```

その後、ターミナルを再起動してください。

## 🔍 なぜこれが起こるのか（技術的な方へ）

Claude Code は既定で、次のような複数のベータ機能を有効にします。

* `cache_control`
* 拡張された `tool` フィールド
* `scope` のような追加パラメータ

これらのパラメータは次のようになります。

* 👉 ネイティブの Anthropic API ではサポートされています
* 👉 しかし AWS Bedrock Claude では無効なフィールドとして拒否され、HTTP 400 になります

このスイッチをオフにすると。

* ✔ リクエストは標準構造にフォールバックします
* ✔ AWS Claude との完全な互換性が得られます

## 🚨 必要になる場面

以下のいずれかに当てはまる場合、**この変数を設定することを強くおすすめします**:

* Claude Code を AWS Bedrock Claude と一緒に使っている
* サードパーティのプロキシ（API gateway や中継サービス）を経由している
* 400 / ValidationException エラーが発生している

参考:

* Claude 公式 docs — 環境変数: `code.claude.com/docs/en/env-vars`
* 関連 issue: `github.com/anthropics/claude-code/issues/21676`

## 🔎 モデルが属するグループを確認する

特定のモデルがどのグループで利用できるか分からない場合は、モデルの料金ページで確認できます。

[APIYI のモデル料金ページ](https://api.apiyi.com/modelPricing)を開き、モデル名を検索すると、利用可能なグループを確認できます。

たとえば、**ClaudeCode グループ**は、最新の Claude モデルシリーズに加えて、別途設定された`glm-5.1`と`qwen3.7-max`もサポートしています。

## 💡 まだ動作しませんか？

修正を適用した後もエラーが解消しない場合は、次を確認してください。

* 環境変数が実際に反映されていること（`echo $CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` を実行して、`1` が表示されることを確認してください）
* 本当に AWS Claude (Bedrock) のチャンネルを使用していること
* 設定を変更した後に、ターミナルまたは IDE を再起動したこと

## 📞 サポート

まだ解決しない場合は、さらに詳しく調べられるように以下をお送りください:

* エラーのスクリーンショット
* リクエストログ（Request ID）
* ご利用中のモデル名

原因を特定できるようお手伝いします。
