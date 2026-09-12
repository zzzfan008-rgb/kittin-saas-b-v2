> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# チャットボックス AI

> クロスプラットフォームの AI クライアントアプリケーション統合ガイド

Chatbox AI は、複数の大規模言語モデルと API をサポートする、強力なクロスプラットフォームの AI クライアントアプリケーションです。APIYI を通じて、ローカルストレージによるプライバシー保護を享受しながら、Chatbox でさまざまな主要 AI モデルにアクセスできます。

## クイックスタート

### ダウンロードとインストール

Chatbox AIは複数プラットフォームのインストールに対応しています:

* **デスクトップ**: Windows, macOS, Linux
* **モバイル**: iOS, Android
* **Web**: ブラウザから直接アクセス

お使いのプラットフォームに適したバージョンをダウンロードするには、[Chatbox AI 公式サイト](https://chatboxai.app/en)をご覧ください。

### APIYIを設定する

#### 手順1: 設定を開く

1. Chatbox AIアプリケーションを起動します
2. 左下隅の設定アイコン（⚙️）をクリックします
3. 「モデル設定」画面を開きます

#### 手順2: カスタムプロバイダーを追加する

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/chatbox-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=dd787d3ef7889fbe04f9d2c3143b5cc5" alt="Chatbox AI設定画面 - APIYI設定例" width="2708" height="1536" data-path="images/chatbox-setting.png" />

上記の設定画面に従って、以下の設定手順を完了してください:

1. 「モデルプロバイダー」セクションの **+ 追加** ボタンをクリックします

2. プロバイダー情報を入力します:
   * **名前**: APIYI（任意で変更可能な名前）
   * **API モード**: **OpenAI API 互換** を選択します
   * **API キー**: APIYI の API キーを入力します
   * **API ホスト**: `https://api.apiyi.com/v1`
   * **API パス**: `/chat/completions`（デフォルト値）

3. **詳細設定**（オプション）:
   * 「ネットワーク互換性を向上」オプションを有効にします（画像のとおり）
   * 専用の画像生成エンドポイントを設定できます

<Info>
  **設定のポイント**

  * API Host フィールドは Base URL に対応し、`/v1` のサフィックスを含める必要があります
  * API Path フィールドは特定のエンドポイントパスを指定します
  * API Key は [APIYI コンソール](https://api.apiyi.com) から取得できます
  * 設定後、右下の **+ 新規** ボタンをクリックしてモデルを追加します
</Info>

#### 手順3: モデルを選択する

設定が完了したら、チャット画面でモデルを選択できます。

## 対応モデル

Chatbox AI は APIYI 経由で 400 種類以上の主要な AI モデルをサポートしています。OpenAI、Google Gemini、Claude、DeepSeek、そして中国国内モデルを含みます。

<Card title="今おすすめのモデルを見る" icon="star" href="/ja/api-capabilities/model-info">
  最新のモデルおすすめ、パフォーマンス比較、シナリオ別ガイダンス — ライティング、プログラミング、高速応答、画像生成、動画生成などをカバーします。
</Card>

<Info>
  **ここで個別のモデルを一覧にしないのはなぜですか？**

  AI モデルは非常に速いペースで更新されます。常に正確なおすすめをお届けできるよう、モデル一覧、パフォーマンスデータ、利用ガイダンスを [モデルおすすめページ](/ja/api-capabilities/model-info) にまとめて管理しています。
</Info>

## コア機能

### マルチプラットフォーム同期

Chatbox AI の主な利点:

* **ローカル保存**: データを完全にローカルへ保存し、プライバシーを保護します
* **クロスプラットフォームアクセス**: 異なるデバイス間で切り替えられます
* **オフライン機能**: 一部の機能はオフラインでの利用に対応しています

### 会話管理

**インテリジェントな会話機能**:

* マルチターン会話のコンテキスト保持
* 会話履歴の検索と管理
* 会話のエクスポート（Markdown, PDF）
* Prompt ライブラリとメッセージ参照

### ドキュメント処理

**ドキュメント理解機能**:

* PDF, TXT, DOCX ドキュメントのアップロード
* 画像の理解と分析
* LaTeX と Markdown のレンダリング
* コードのハイライト表示とプレビュー

### 画像生成

**AI 画像作成**:

* DALL-E シリーズモデルの画像生成をサポート
* 専用の画像生成エンドポイントを設定可能
* さまざまな画像サイズとスタイルをサポート
* バッチ画像生成機能

**画像生成の設定**:

1. 設定で専用の画像生成プロバイダを追加します
2. 標準の `/images/generations` エンドポイントを使用します
3. チャットで画像要件を直接記述します
4. システムが自動的に画像生成 API を呼び出します

### 詳細設定

**パラメータ調整**:

```yaml theme={null}
Conversation Parameter Settings:
  - Temperature: 0.7        # Creativity control (reasoning models GPT-5 only use 1)
  - Max Tokens: 4096       # Maximum output length
  - Top P: 0.9            # Sampling parameter (reasoning models gpt-5 only use 1)
  - Context Length: 8192   # Context length
```

## 使用上のヒント

### prompt 最適化

Chatbox AI には組み込みの prompt ライブラリがあり、カスタム prompt も作成できます:

```markdown theme={null}
# Programming Assistant
You are an experienced software engineer, please help me:
- Write high-quality code
- Explain complex concepts
- Provide best practice recommendations

# Output Format
Please format code using code blocks and provide detailed comments.
```

### プライバシー保護

Chatbox AI は「プライバシー・バイ・デザイン」の哲学を採用しています:

* データはローカルに保存され、クラウドにはアップロードされません
* セルフホストの API エンドポイントをサポートしています
* 完全にオフラインでも使用できます（ローカルモデル使用時）

## 詳細設定

### カスタム API エンドポイント

基本的なチャット機能に加えて、専用の画像生成エンドポイントも設定できます:

#### Chat Completion エンドポイント設定

```yaml theme={null}
Basic Chat Configuration:
  Provider Name: APIYI
  API Mode: OpenAI API Compatible
  API Key: sk-your-apiyi-key
  API Host: https://api.apiyi.com/v1
  API Path: /chat/completions
```

#### 画像生成エンドポイント設定

**方法1: 専用の画像 API を使用**

```yaml theme={null}
Image Generation Configuration:
  Provider Name: APIYI-Image
  API Mode: OpenAI API Compatible
  API Key: sk-your-apiyi-key
  API Host: https://api.apiyi.com/v1
  API Path: /images/generations  # Standard image generation endpoint
  Applicable Models: gpt-image-1, flux-kontext-pro
```

**方法2: Responses エンドポイントを使用**

```yaml theme={null}
Responses Configuration:
  Provider Name: APIYI-Responses
  API Mode: OpenAI API Compatible
  API Key: sk-your-apiyi-key
  API Host: https://api.apiyi.com
  API Path: /v1/responses  # General response endpoint
```

<Tip>
  **エンドポイント選択の推奨**

  * 通常の会話: `/chat/completions` エンドポイントを使用
  * sora\_image のような逆解析された画像生成モデル: `/chat/completions` エンドポイントを使用
  * 画像生成: `/images/generations` 標準エンドポイントを優先
  * 特別な要件: `gpt-image-1` または `/v1/responses` エンドポイントを使用可能
  * Chatbox では、「API Path」フィールドが特定のエンドポイントパスに対応します
</Tip>

### ネットワークプロキシ設定

アクセスにプロキシが必要な場合:

1. 設定 > ネットワーク設定 に移動します
2. HTTP/HTTPS プロキシを設定します
3. 必要に応じてプロキシ認証を設定します

### キーボードショートカット設定

主なショートカット:

* `Ctrl/Cmd + N`: 新しい会話
* `Ctrl/Cmd + T`: モデルを切り替え
* `Ctrl/Cmd + /`: コマンドパレットを表示
* `Ctrl/Cmd + K`: クイック検索

## モバイル設定

### iOS/Android 設定

モバイル設定はデスクトップと同じです:

1. Chatbox AI モバイルアプリをダウンロードします
2. 設定 > モデル設定 に移動します
3. APIYI のカスタムプロバイダーを追加します
4. 同じ API Base URL とキーを設定します

### モバイル固有の機能

* **音声入力**: 音声をテキストに変換できます
* **カメラ連携**: 画像分析のために写真を直接撮影できます
* **オフラインキャッシュ**: 会話履歴をオフラインで利用できます
* **プッシュ通知**: 重要なメッセージの通知を受け取れます

## トラブルシューティング

### よくある問題

**接続に失敗しました**

* API Base URLを確認してください: `https://api.apiyi.com/v1`
* APIキーの有効性を確認してください
* ネットワーク接続が正常であることを確認してください

**モデルが表示されない**

* モデル一覧が自動更新されるまで待ってください
* 手動で「モデルを更新」ボタンをクリックしてください
* APIキーの権限を確認してください

**応答が遅い**

* より高速なモデルに切り替えてみてください
* ネットワークの遅延を確認してください
* コンテキスト長を短くしてください

### ログのデバッグ

デバッグモードを有効にします:

1. 設定 > 詳細オプション
2. 「デバッグモード」を有効にする
3. 詳細なログ情報を表示する

### データのバックアップ

会話データを定期的にバックアップしてください:

1. 設定 > データ管理
2. 会話履歴をエクスポートする
3. 設定ファイルをバックアップする

## ベストプラクティス

### パフォーマンス最適化

1. **モデルを賢く選ぶ**
   * タスクの複雑さに合ったモデルを選びます
   * モデル選択の最新ガイダンスについては、[モデル推奨ページ](/ja/api-capabilities/model-info)を参照してください

2. **コンテキスト管理**
   * 使っていない会話は定期的に整理します
   * コンテキスト長は適切に設定します
   * 会話グルーピング機能を使用します

3. **リソース管理**
   * APIの使用状況を監視します
   * 使用クォータのリマインダーを設定します
   * アプリのバージョンを定期的に更新します

### セキュリティの推奨事項

* APIキーを共有しないでください
* キーは定期的に変更します
* 強力なパスワードでアプリを保護します
* 機密情報は慎重に扱います

### チームでの共同作業

Chatbox AI は主に個人ユーザー向けですが、次の方法でチーム利用も可能です:

* prompt テンプレートを共有する
* 会話記録をエクスポートして共有する
* API設定の標準を統一する

## 比較上の利点

### 他のクライアントとの比較

| 機能              | Chatbox AI | ChatGPT Web | 他のクライアント |
| --------------- | ---------- | ----------- | -------- |
| **ローカル保存**      | ✅          | ❌           | 一部サポート   |
| **マルチプラットフォーム** | ✅          | ❌           | 一部サポート   |
| **カスタム API**    | ✅          | ❌           | ✅        |
| **オフライン機能**     | ✅          | ❌           | ❌        |
| **プライバシー保護**    | ✅          | ❌           | 不明       |

### Chatbox AI を選ぶ理由

1. **プライバシー最優先**: データは完全にローカルに保存されます
2. **柔軟な設定**: さまざまな API エンドポイントをサポートします
3. **クロスプラットフォーム**: 統一されたユーザー体験
4. **豊富な機能**: プロンプトライブラリ、ドキュメント処理など
5. **継続的な更新**: 積極的な開発とメンテナンス

さらにヘルプが必要ですか？[Chatbox AI ヘルプセンター](https://chatboxai.app/en/help-center)をご確認いただくか、[APIYI 公式サイト](https://api.apiyi.com)をご覧ください。
