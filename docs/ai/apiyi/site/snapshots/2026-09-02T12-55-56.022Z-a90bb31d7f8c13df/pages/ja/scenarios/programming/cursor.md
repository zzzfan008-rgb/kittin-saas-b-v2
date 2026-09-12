> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cursor

> AI駆動のコードエディタ統合ガイド

Cursor は AI 主導のコードエディタです。APIYI を統合することで、コードを書きながら強力な AI アシスタンスを利用できます。

## クイック設定

### 1. 設定を開く

右上の歯車アイコン ⚙️ をクリックし、**モデル** オプションを選択します

### 2. API を設定する

* **OpenAI API Key**: APIYI のキーを入力します（デフォルトの token をそのまま使えます）
* **Override OpenAI Base URL**: チェックを入れて `https://api.apiyi.com/v1` を入力します
* **Verify** をクリックして設定を検証します

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cursor-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=47cf7afe1c00e511395e34cc033b877e" alt="Cursor Configuration Interface" width="2066" height="990" data-path="images/cursor-setting.png" />

### 3. モデル設定

<Warning>
  **重要な注意**: Cursor は現在 **エージェントモードをサポートしていません**。利用できるのは Chat 会話モードのみです。会話内で AI にコードを生成させ、その後で実際のコードに手動で適用してください。

  もし初心者で、Vibe Coding のためにエージェントモードに強く依存しているなら、次をおすすめします:

  * Cursor の公式メンバーシップを購入して、ネイティブサービスを使う
  * または代替として、VS Code の **RooCode** や **Cline** プラグインを使う（エージェントモードをサポート）
</Warning>

#### 推奨モデル設定

最新のモデル性能とコストパフォーマンスを踏まえ、次をおすすめします:

**プログラミング向け第一候補モデル**:

* `claude-sonnet-4-20250514` - Claude 4 Sonnet、プログラミング性能が最強です
* `gpt-4.1` - 高速で、総合能力が高いです
* `deepseek-v3` - 中国語でのプログラミングに優れ、コストパフォーマンスが高いです

**コスト最適化モデル**:

* `gpt-4.1-mini` - 軽量ですが十分高性能です
* `claude-3-haiku` - Claude シリーズで最安です
* `gemini-2.5-flash` - Google の高速応答モデルです

**推論強化モデル**:

* `o4-mini` - プログラミングタスク向けの推論モデルとして第一候補です
* `o3` - 複雑な推論やアルゴリズム問題に向いています

#### カスタムモデルを追加する

Cursor の設定で次の model ID を追加します:

```
claude-sonnet-4-20250514
gpt-4.1
deepseek-v3
o4-mini
gemini-2.5-pro
```

## 利用モードの説明

### チャットモードのワークフロー

Cursor は Agent モードをサポートしていないため、以下のワークフローをおすすめします。

1. **対話してコードを生成する**
   * `Ctrl/Cmd + L` を使ってチャットを開く
   * 要件を説明し、AI にコードを生成させる
   * 生成されたコードスニペットを確認する

2. **手動でコードを適用する**
   * チャットウィンドウからコードをコピーする
   * 対象ファイルに貼り付ける
   * または「Apply」ボタンを使う（利用可能な場合）

3. **反復して最適化する**
   * 会話を続けて修正を依頼する
   * 適用プロセスを繰り返す

### 代替比較

| ツール                    | Agent モード | 利点                        | 欠点          |
| ---------------------- | --------- | ------------------------- | ----------- |
| **Cursor**             | ❌         | 洗練されたインターフェース、優れた補完体験     | Agent モードなし |
| **Cline (VS Code)**    | ✅         | 完全な Agent 機能、ファイルを自動で変更可能 | VS Code が必要 |
| **RooCode (VS Code)**  | ✅         | Agent モード、複数ファイルの編集をサポート  | 新しめで、機能は改善中 |
| **Continue (VS Code)** | ✅         | オープンソースで、高度にカスタマイズ可能      | 設定がより複雑     |

## コア機能

### スマートコード補完

* **Tab 補完**: Tab を押して AI の提案を受け入れます
* **複数行補完**: 関数レベルのコード生成に対応しています
* **コンテキスト認識**: プロジェクト構造に基づいて提案を行います

### AI 会話

* **Ctrl/Cmd + K**: コマンドパレットを開きます
* **Ctrl/Cmd + L**: サイドバーの会話を開きます
* **コード説明**: コードを選択して AI に質問します

### コード編集

* **コード生成**: 要件を記述すると、AI が自動生成します
* **リファクタリング提案**: 最適化の推奨事項を取得できます
* **エラー修正**: AI がエラーの特定と修正を支援します

## キーボードショートカット

| ショートカット        | 機能          |
| -------------- | ----------- |
| `Ctrl/Cmd + K` | AI コマンドパレット |
| `Ctrl/Cmd + L` | AI 会話       |
| `Tab`          | コード提案を承認    |
| `Esc`          | 提案をキャンセル    |

## 使い方のヒント

### 1. 明確なコンテキストを提供する

```javascript theme={null}
// @context: React component for user authentication
// @requirements: Need to support OAuth2 login
// @constraints: Compatible with NextJS 13+

// AI will generate more accurate code based on this information
```

### 2. プロンプトを最適化する

```
// Bad prompt
"Fix this function"

// Good prompt
"Fix floating point precision issue in calculateTotal function, ensure amount calculation accurate to 2 decimal places"
```

### 3. チャットモードを最大限活用する

Agentモードはありませんが、次のことができます:

* AIに完全なファイル内容を生成させる
* AIに詳細な修正手順を提示してもらう
* AIを使ってコードレビューやリファクタリングの提案を行う

## トラブルシューティング

### 接続タイムアウト

1. ネットワーク接続を確認する
2. APIアドレスを確認する: `https://api.apiyi.com/v1`
3. APIキーの有効性を確認する

### モデルが応答しない

1. 残高を確認する
2. モデルを切り替えてみる
3. Cursor を再起動する

### コード提案の精度が低い

1. より多くのプロジェクトコンテキストを提供する
2. より具体的なプロンプトを使う
3. 別のモデルを試す

## ベストプラクティス

### プロジェクトレベルの設定

プロジェクトルートに`.cursor-settings.json`を作成します:

```json theme={null}
{
  "model": "gpt-4.1",
  "temperature": 0.7,
  "contextFiles": ["README.md", "package.json"],
  "rules": [
    "Use TypeScript strict mode",
    "Follow ESLint standards",
    "Add appropriate comments"
  ]
}
```

### コード標準

プロンプトでコード標準を明確に指定します:

* TypeScriptを使用する
* Airbnbのスタイルに従う
* JSDocコメントを追加する
* 関数型スタイルを使用する

### セキュリティ意識

* コードに機密情報を含めない
* AI生成コードをレビューする
* サードパーティの依存関係のセキュリティを確認する

## 統合ワークフロー

### Git連携

```bash theme={null}
# AI generates commit message
git add .
# Use Cursor AI to generate descriptive commit message
```

### テスト駆動開発

1. まずテストケースを書きます
2. AIに実装コードを生成させます
3. テストを実行して検証します
4. 繰り返して最適化します

### コードレビュー

AIをコードレビューに使います:

```
Please review this code, focusing on:
1. Performance issues
2. Security vulnerabilities
3. Code standards
4. Best practices
```

## Agentモードが必要ですか？

AI に複数のファイルを自動で変更させ、複雑なリファクタリング作業を行いたい場合は、次をチェックすることをおすすめします。

<CardGroup cols={2}>
  <Card title="Cline" icon="bot" href="/ja/scenarios/programming/cline">
    VS Code 向けのフル機能 AI Agent で、ファイルの自動変更をサポートします
  </Card>

  <Card title="RooCode" icon="code" href="https://marketplace.visualstudio.com/items?itemName=roocode.roocode">
    新興の VS Code AI Agent プラグインで、複数ファイルの編集をサポートします
  </Card>
</CardGroup>

<Info>
  **ヒント**: Vibe Coding の愛好者で、AI に複雑なプログラミングタスクを自律的に完了させたい場合は、Agent モードをサポートするツールの利用をおすすめします。あるいは、フル体験のために Cursor の公式メンバーシップの購入を検討してください。
</Info>

さらにヘルプが必要ですか？サポートについては、[APIYI 公式サイト](https://api.apiyi.com)をご覧ください。
