> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bob 翻訳ツール

> macOS 連携ガイド向けのプロフェッショナルな翻訳ツール

Bob は macOS 向けの優れた翻訳ソフトウェアで、単語選択による翻訳、スクリーンショット翻訳などの機能をサポートしています。APIYI を統合することで、AI モデルを使ってより正確で自然な翻訳結果を提供できます。

## クイック設定

### 1. Bob をインストールする

[Bob 公式サイト](https://bobtranslate.com) から最新バージョンをダウンロードしてインストールしてください。

### 2. APIYI を設定する

1. Bob の設定を開きます（メニューバーのアイコン > 「環境設定」）
2. 「サービス」タブに切り替えます
3. OpenAI 翻訳サービスを追加します
4. パラメータを設定します:
   * **API Key**: APIYI のキー
   * **API URL**: `https://api.apiyi.com`
   * **Model**: `gpt-3.5-turbo`

### 3. 設定をテストする

「テスト」ボタンをクリックして設定を確認し、成功が表示されたら保存します。

## 使用方法

### 単語選択での翻訳

1. 翻訳したいテキストを選択します
2. ショートカットキーを押します（デフォルト `⌥ + D`）
3. Bob が翻訳結果をポップアップ表示します

### スクリーンショット翻訳

1. スクリーンショット用ショートカットを押します（デフォルト `⌥ + S`）
2. 翻訳したい範囲を選択します
3. Bob が画像内のテキストを認識して翻訳します

### 入力翻訳

1. Bob ウィンドウを開きます（デフォルト `⌥ + Space`）
2. 翻訳したいテキストを入力または貼り付けます
3. 対象言語を選択します
4. 翻訳結果を表示します

## モデル選択

### さまざまなシナリオに対する推奨事項

| 使用ケース | 推奨モデル          | 特徴           |
| ----- | -------------- | ------------ |
| 日常の翻訳 | gpt-3.5-turbo  | 高速で正確        |
| 業務文書  | gpt-4          | 用語の精度が高い     |
| 長文    | claude-3-haiku | コンテキスト理解に優れる |
| 文学作品  | claude-3-opus  | 文体の表現力が高い    |

### マルチモデル設定

異なるモデルを使って複数の翻訳サービスを設定できます。

1. 複数の OpenAI 翻訳サービスを追加する
2. 各サービスごとに異なるモデルを設定する
3. 翻訳時に使用するものを選択する

## 詳細設定

### カスタムプロンプト

翻訳品質を最適化するためのプロンプトテンプレート:

```text theme={null}
You are a professional translation expert proficient in multiple languages. Please translate the following {source_lang} text to {target_lang}.

Requirements:
1. Maintain original tone and style
2. Use idiomatic expressions
3. For technical terms, mark original text in parentheses after translation
4. Be mindful of cultural differences, adjust expressions appropriately

Original text: {text}
```

### ショートカットをカスタマイズ

設定 > 一般でカスタマイズします:

* **単語選択の翻訳**: `⌥ + D`
* **スクリーンショット翻訳**: `⌥ + S`
* **入力翻訳**: `⌥ + Space`
* **表示/非表示**: `⌥ + B`

### 翻訳動作の設定

推奨設定:

* **言語の自動検出**: 有効
* **翻訳後に自動コピー**: 必要に応じて
* **元の形式を保持**: 有効
* **履歴**: 有効

## 使い方のヒント

### 1. 専門分野の翻訳

特定の分野では、prompt に次のように指定できます:

```text theme={null}
Please translate as a computer professional translator.
Preserve all technical terms in English, with Chinese explanations in parentheses.
```

### 2. 一括翻訳

大量のテキストを翻訳する場合:

1. 入力翻訳モードを使用する
2. テキストを分割して貼り付ける
3. 履歴を使ってすべての翻訳を確認する

### 3. 対照読解

外国語資料を読むとき:

1. 「Show Original」オプションを有効にする
2. 単語選択翻訳を使ってリアルタイムで表示する
3. 学習のために原文と翻訳を比較する

### 4. 用語管理

個人用の用語データベースを構築する:

1. よく使う用語の翻訳をブックマークする
2. 特定の語の翻訳をカスタマイズする
3. 用語データベースのバックアップをエクスポートする

## よくある問題

### 翻訳速度が遅い

**分析:**

* ネットワーク接続に問題がある
* 選択したモデルが大きい
* APIサービスが混雑している

**対処法:**

1. ネットワーク接続を確認する
2. gpt-3.5-turbo のような高速なモデルを使う
3. 混雑する時間帯を避ける

### 翻訳の精度が低い

**改善方法:**

1. より高度なモデル（GPT-4 など）を使う
2. prompt を最適化し、より多くのコンテキストを提供する
3. 専門的なコンテンツでは分野を指定する

### APIクォータが上限に達した

**対応:**

1. APIYI アカウントの残高を確認する
2. コストを抑えるために、異なるモデルを適切に使い分ける
3. 1日ごとの利用上限を設定する

## ベストプラクティス

### 1. コスト管理

* 日常の翻訳には gpt-3.5-turbo を使用します
* 重要なドキュメントにのみ gpt-4 を使用します
* 使用状況の統計を定期的に確認します

### 2. 翻訳品質

* 十分なコンテキストを提供します
* 技術用語を使う場合はドメインを指定します
* 重要な内容は校正します

### 3. ワークフローの最適化

* よく使う言語ペアを設定します
* ドメイン固有のプロンプトをカスタマイズします
* 履歴とお気に入りをうまく活用します

### 4. データセキュリティ

* 機密情報を含むテキストは翻訳しません
* 翻訳履歴を定期的に整理します
* API key を安全に保管します

## 高度な機能

### URL Scheme 連携

Bob は URL Scheme を介して他のアプリに統合できます:

```bash theme={null}
# Translate text directly
bob://translate?text=Hello&from=en&to=zh

# Open Bob window
bob://open
```

### AppleScript による自動化

```applescript theme={null}
tell application "Bob"
    translate "Hello World" from "en" to "zh"
end tell
```

### エクスポート機能

翻訳記録を定期的にエクスポートします:

1. 履歴を開く
2. 時間範囲を選択する
3. CSV または JSON 形式でエクスポートする

## 他のツールとの連携

### Raycast 連携

Raycast 拡張機能から Bob をすばやく呼び出します:

```javascript theme={null}
// Raycast script example
import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";

export default async function Command() {
  exec("open bob://translate", (error) => {
    if (error) {
      showToast(Toast.Style.Failure, "Failed to launch Bob");
    }
  });
}
```

### Alfred ワークフロー

素早く翻訳するための Alfred ワークフローを作成します:

1. 新しいワークフローを作成します
2. キーワードトリガーを追加します
3. Run Script アクションを接続します
4. Bob の URL スキームを呼び出します

### PopClip 拡張機能

テキストを選択した直後に直接翻訳するには、PopClip の Bob 拡張機能をインストールします。

## トラブルシューティング

### サービス利用不可

確認項目:

1. API key が正しいこと
2. ネットワーク接続が正常であること
3. APIYI のサービスステータス

### ショートカットの競合

解決策:

1. システム環境設定でショートカットの競合を確認する
2. Bob に固有のショートカットの組み合わせを設定する
3. 競合するアプリのショートカットを無効にする

### 権限の問題

Bob に必要な権限が付与されていることを確認してください:

* アクセシビリティ権限
* 画面収録権限（スクリーンショット翻訳用）
* キーボード入力権限

## パフォーマンス最適化

### レイテンシを短縮する

1. より高速なモデルを使用する
2. ローカルキャッシュを有効にする
3. ネットワーク設定を最適化する

### リソースを節約する

1. 適切な翻訳履歴の保持期間を設定する
2. 定期的にキャッシュをクリーンアップする
3. 複数の翻訳サービスを同時に実行しない

### 体験を向上させる

1. ポップアップの表示時間を調整する
2. インターフェースのテーマをカスタマイズする
3. フォントサイズとスタイルを最適化する

さらにサポートが必要ですか？[詳細な統合ドキュメント](/ja/scenarios/translation/bob)をご確認ください。
