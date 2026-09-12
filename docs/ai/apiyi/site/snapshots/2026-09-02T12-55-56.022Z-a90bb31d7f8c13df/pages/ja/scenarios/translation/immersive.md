> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Immersive Translate

> ブラウザーのバイリンガル読書拡張機能の統合ガイド

Immersive Translateは、Webページのバイリンガル読みに対応した優れたブラウザ翻訳拡張機能です。APIYIと連携することで、高性能なAIモデルを活用し、より正確で自然な翻訳結果を得られます。

## クイックインストール

### 対応ブラウザー

* Chrome / Edge / Brave
* Firefox
* Safari

### インストール手順

1. ブラウザーの拡張機能ストアにアクセスします
2. 「Immersive Translate」を検索します
3. インストールをクリックしてブラウザーに追加します

または、[公式サイト](https://immersive-translate.owenyoung.com/) にアクセスしてインストールリンクを取得してください。

## APIYI を設定する

### 1. 設定を開く

ブラウザーのツールバーにある拡張機能アイコンをクリックし、「設定」を選択します。

### 2. 翻訳サービスを設定する

1. 左側メニューで「翻訳サービス」を選択します
2. 「OpenAI」サービスを見つけます
3. 「管理」または「設定」をクリックします
4. 「カスタム API キー」を選択します

### 3. 設定を入力する

* **APIKEY**: APIYI キーを入力します
* **カスタム API インターフェースアドレス**: `https://api.apiyi.com/v1/chat/completions`
* **カスタムモデル**: `gpt-3.5-turbo`（任意）

## コア機能

### Webページ翻訳

#### 自動翻訳

1. 外国語のWebページを開く
2. 拡張機能が言語を自動検出します
3. 翻訳ボタンをクリックして開始します

#### 手動翻訳

1. ツールバーの拡張機能アイコンをクリックします
2. 「このページを翻訳」を選択します
3. 翻訳が完了するまで待ちます

### 翻訳モード

#### バイリンガル表示（推奨）

* 元の形式を保持します
* 原文の下に翻訳を表示します
* 比較しながら学習するのに便利です

#### 翻訳のみ

* 元のテキストを完全に置き換えます
* 素早く読むのに適しています
* いつでもバイリンガル表示に戻せます

### 単語選択翻訳

1. 翻訳したいテキストを選択します
2. 表示される翻訳ボタンをクリックします
3. ポップアップで翻訳を確認します

## 詳細設定

### カスタムプロンプト

異なるコンテンツタイプ向けのプロンプトです:

#### 技術ドキュメント

```text theme={null}
As a technical documentation translation expert, please:
1. Preserve all technical terms in original language
2. Provide Chinese explanations in parentheses
3. Maintain original format for code and commands
```

#### 学術論文

```text theme={null}
As an academic translation expert, please:
1. Use academically standard expressions
2. Preserve citation formats
3. Accurately translate professional terminology
```

#### 文芸作品

```text theme={null}
As a literary translation expert, please:
1. Maintain literary beauty of original text
2. Be mindful of cultural background conversion
3. Preserve effect of rhetorical devices
```

### 翻訳ルール

特定のWebサイトごとの翻訳動作を設定します:

1. 「翻訳ルール」設定を開く
2. Webサイトのドメインを追加する
3. 動作を選択する:
   * 常に翻訳する
   * 翻訳しない
   * スマート判定

### スタイルのカスタマイズ

翻訳表示スタイルをカスタマイズします:

```css theme={null}
/* Translation font */
.immersive-translate-target {
    font-family: "Microsoft YaHei", sans-serif;
    font-size: 14px;
    color: #333;
}

/* Translation background */
.immersive-translate-target-wrapper {
    background-color: #f5f5f5;
    padding: 5px;
    margin: 5px 0;
    border-radius: 3px;
}
```

## 特殊機能

### PDF 翻訳

オンラインの PDF ドキュメント翻訳に対応しています:

* PDF 形式を維持
* バイリンガルでの閲覧に対応
* 翻訳をコピー可能

### 動画字幕翻訳

主要な動画サイトに対応しています:

* YouTube
* Netflix
* Bilibili

設定方法:

1. 「動画字幕翻訳」を有効にする
2. 字幕の表示方法を選択する
3. 字幕スタイルを調整する

### 電子書籍翻訳

EPUB 電子書籍に対応しています:

1. EPUB ファイルをアップロードする
2. 翻訳設定を選択する
3. バイリンガル版をダウンロードする

### 入力欄翻訳

Web の入力欄でリアルタイム翻訳できます:

1. 入力欄にテキストを入力する
2. ショートカットキーを押して翻訳を起動する
3. 翻訳候補を確認する

## キーボードショートカット

よく使うショートカット（カスタマイズ可能）:

| 機能          | デフォルトのショートカット |
| ----------- | ------------- |
| 翻訳/元の文を表示   | `Alt + T`     |
| 翻訳モードを切り替え  | `Alt + M`     |
| 選択したテキストを翻訳 | `Alt + S`     |
| 設定を開く       | `Alt + O`     |

## モデル選定の推奨

### コンテンツタイプ別の選定

| コンテンツタイプ  | 推奨モデル           | 理由           |
| --------- | --------------- | ------------ |
| ニュース記事    | gpt-3.5-turbo   | 高速で正確        |
| 技術ドキュメント  | gpt-4           | 正確な用語        |
| 学術論文      | claude-3-opus   | 高い理解力        |
| 文学作品      | claude-3-sonnet | 優れた文体        |
| 日常のWebページ | gpt-3.5-turbo   | 高いコストパフォーマンス |

### パフォーマンスと品質のバランス

```javascript theme={null}
// Smart model selection example
const selectModel = (textLength, contentType) => {
  if (textLength < 500) {
    return 'gpt-3.5-turbo'; // Use fast model for short text
  } else if (contentType === 'technical') {
    return 'gpt-4'; // Use accurate model for technical content
  } else if (contentType === 'creative') {
    return 'claude-3-sonnet'; // Use literary model for creative content
  } else {
    return 'gpt-3.5-turbo'; // Default to economical model
  }
};
```

## パフォーマンス最適化

### キャッシュ設定

* 翻訳キャッシュを有効にする
* キャッシュ期間を 24 時間に設定する
* キャッシュを定期的にクリーンアップする

### バッチ翻訳

* バッチサイズを 5〜10 段落に調整する
* 適切な同時実行数を 2〜3 に設定する
* 長文処理を最適化する

### トリガー条件

* 最小翻訳長を 10 文字に設定する
* ナビゲーションメニュー、広告などの特定要素を無視する
* 200ms の遅延翻訳

## よくある問題

### 翻訳に失敗した

**考えられる原因:**

* 無効な API key
* ネットワーク接続の問題
* 特殊なページ構造

**解決策:**

1. API key を確認する
2. ネットワーク接続を確認する
3. ページを再読み込みしてみる
4. ブラウザのコンソールのエラーを確認する

### 翻訳速度が遅い

**最適化方法:**

1. より高速なモデルを使用する
2. 1回の翻訳あたりのテキスト量を減らす
3. キャッシュ機能を有効にする
4. ネットワークのレイテンシを確認する

### フォーマットの混乱

**対処方法:**

1. 別の翻訳モードを試す
2. 翻訳表示設定を調整する
3. 特定のウェブサイト向けにルールをカスタマイズする
4. 開発者に問題を報告する

## ベストプラクティス

### 1. 読みやすさの最適化

* 適切なフォントとサイズを選択する
* 翻訳の色コントラストを調整する
* 快適な行間を設定する
* 目の保護モードを使用する

### 2. 学習支援

* バイリンガル読書モードを有効にする
* 語彙検索に単語選択翻訳を使用する
* レビュー用に翻訳内容をエクスポートする
* ノートと注釈を追加する

### 3. 作業効率

* よく訪問する Web サイトにルールを設定する
* ドメイン固有の prompt をカスタマイズする
* ショートカットを使って速度を向上させる
* ドキュメントを一括処理する

### 4. コスト管理

* 翻訳モデルを適切に選択する
* 翻訳の長さに制限を設定する
* キャッシュを使って繰り返し翻訳を減らす
* API の使用状況を監視する

## 高度なヒント

### カスタム翻訳スクリプト

JavaScriptを使って機能を強化します:

```javascript theme={null}
// Auto-detect and translate specific content
if (document.querySelector('.article-content')) {
    window.immersiveTranslate.translate({
        selector: '.article-content',
        fromLang: 'auto',
        toLang: 'zh-CN'
    });
}
```

### 他のツールとの連携

他のツールと併用します:

* **Readwise**: 翻訳したハイライトを保存
* **Notion**: 翻訳メモを書き出す
* **Anki**: 語彙フラッシュカードを作成

### 開発者モード

翻訳改善に参加します:

1. デバッグモードを有効にする
2. 翻訳フィードバックを提供する
3. 翻訳コーパスを提供する
4. オープンソース開発に参加する

## トラブルシューティングガイド

### 拡張機能が読み込まれない

1. ブラウザのバージョン互換性を確認してください
2. 競合する拡張機能を無効にしてください
3. ブラウザのキャッシュをクリアしてください
4. 拡張機能を再インストールしてください

### 翻訳結果が表示されない

1. Webページが翻訳をサポートしているか確認してください
2. 翻訳サービスが正しく設定されているか確認してください
3. 広告ブロッカーによってブロックされていないか確認してください
4. 他の翻訳サービスを試してください

### メモリ使用量が高い

1. 定期的に翻訳キャッシュをクリーンアップしてください
2. 同時に翻訳するページ数を減らしてください
3. バッチ翻訳の設定を調整してください
4. 不要なタブを閉じてください

さらにサポートが必要ですか？[詳細な統合ドキュメント](/ja/scenarios/translation/immersive)をご確認ください。
