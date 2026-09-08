> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LobeHub

> カスタムプロバイダーとローカルナレッジベースに対応した、オープンソースのAIチャットクライアント統合ガイド

LobeHub は、複数のモデル、マルチモーダル入力、プラグインマーケットプレイス、ローカルナレッジベースをサポートするオープンソースのクロスプラットフォーム AI チャットクライアント（旧 Lobe Chat）です。APIYI を使えば、LobeHub で 1 つの API key から 400+ の主要な AI モデルにアクセスできます。プロバイダーごとに個別に登録して支払う必要はありません。

<CardGroup cols={3}>
  <Card title="オープンソース & セルフホスト可能" icon="github">
    デスクトップ、web、Docker、または Vercel — あなたのデータ、あなたの管理
  </Card>

  <Card title="プラグイン & マルチモーダル" icon="plug">
    内蔵の web 検索、コードインタープリター、vision、動画生成プラグイン
  </Card>

  <Card title="ローカルナレッジベース" icon="database">
    PDF と Markdown をアップロードして、プライベートデータ上に RAG パイプラインを構築できます
  </Card>
</CardGroup>

## クイックスタート

### 1. APIYI APIキーを取得する

APIキーの取得方法については、[API キー管理ガイド](/ja/faq/token-management)をご覧ください。

### 2. LobeHub をインストールする

LobeHub には 3 つの利用方法があります。

* **デスクトップ**: Windows、macOS、Linux 向けの公式クライアント — `lobechat.com` からダウンロードできます
* **Web（公式）**: `lobechat.com` にアクセスして登録するだけで、セルフホストなしで利用できます
* **セルフホスト**: Docker / Vercel / ローカルソース経由でデプロイします — 企業利用やプライバシー要件に最適です

<Tip>
  個人利用には、公式の Web またはデスクトップクライアントをおすすめします。データプライバシーやコンプライアンス要件がある場合は、Docker でセルフホストしてください（APIYI は環境変数で設定するだけです）。
</Tip>

### 3. カスタムプロバイダーを作成する

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-create-provider.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=ddda3ebd3c4aa4e60aa6c9f87bd14ecb" alt="LobeHub — カスタム AI サービスプロバイダーを作成する" width="763" height="916" data-path="images/lobehub-create-provider.png" />

`Settings → Model Providers` に移動し、右上の `+` アイコンをクリックしてカスタムプロバイダーを追加し、上図のように各項目を入力します。

| Field                    | Value                      | Notes                              |
| ------------------------ | -------------------------- | ---------------------------------- |
| **Provider ID**          | `apiyi`                    | 一意の識別子 — 作成後は変更できません               |
| **Provider Name**        | `apiyi`                    | カスタム表示名                            |
| **Provider Description** | `apiyi`                    | カスタム説明                             |
| **Provider Logo**        | （空欄のまま）                    | 任意 — カスタムロゴ URL                    |
| **Request Format**       | `OpenAI`                   | APIYI は OpenAI と完全互換です             |
| **Proxy URL**            | `https://api.apiyi.com/v1` | ベース URL — **必ず `/v1` で終わる必要があります** |
| **API Key**              | APIYI APIキー                | APIYI コンソールから取得してください              |

右下の **作成** ボタンをクリックして保存します。

<Info>
  **設定のヒント**

  * `Proxy URL` は必ず `/v1` で終わる必要があります。そうしないとリクエストのルーティングに失敗します
  * APIキーを貼り付ける際は、先頭や末尾の空白を削除してください
  * すべての 400+ APIYI モデルにアクセスするには、`OpenAI` をリクエスト形式として選択してください
  * 1 つのキーで有効なすべてのモデルに使えます — 使用した分だけお支払いください
</Info>

### 4. 接続を確認する

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-configured.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=b230b3aac1cd11cb9bd186d020ce8b73" alt="LobeHub — 設定済みプロバイダー画面" width="1473" height="913" data-path="images/lobehub-configured.png" />

プロバイダーを作成すると、詳細ページが表示されます。ここから次の操作ができます。

1. **API Key と Proxy URL を確認または更新する**
2. **高度なオプションを有効にする**（任意）:
   * `Use Responses API spec` — OpenAI の新しいリクエスト形式を有効にします（OpenAI モデルのみ）
   * `Use client-side request mode` — ブラウザがリクエストを直接送信します。応答速度が向上する場合があります
3. **接続確認** — ドロップダウンからモデルを選び、**確認** をクリックします
4. **モデル一覧を取得** — **モデル一覧を取得** ボタンをクリックして、APIYI から利用可能なすべてのモデルを取得します

取得に成功すると、`Model list` に APIYI が現在提供しているすべての内容が表示され、種類ごとに Chat、Image、Video、Embedding、ASR、TTS にグループ化されます。

<Warning>
  接続確認に失敗した場合は、次のチェックリストを確認してください。

  * プロキシ URL は `/v1` で終わっていますか？
  * APIキーはまだ有効ですか？（APIYI コンソールで確認してください）
  * ネットワークから `api.apiyi.com` に到達できますか？
  * ファイアウォールまたはプロキシが HTTPS トラフィックをブロックしていませんか？
</Warning>

### 5. モデルを選んでチャットを始める

チャット UI のモデルドロップダウンで、`claude-opus-5`、`gpt-5-6-terra`、または `deepseek-v4-pro` のようなモデルを選択すれば、すぐに使えます。

<Card title="今日のおすすめモデルを見る" icon="star" href="/ja/api-capabilities/model-info">
  最新のモデルおすすめ、性能比較、シナリオ別の使い方のヒントをご覧ください — 執筆、コーディング、高速応答、画像生成、動画生成などをカバーしています。
</Card>

<Info>
  **ここに具体的なモデル一覧がないのはなぜですか？**

  AI モデルは非常に速く進化します。おすすめを正確に保つため、最新のモデル一覧、性能データ、使い方のヒントを [モデルおすすめページ](/ja/api-capabilities/model-info) で管理しています。
</Info>

## 1つのプロバイダーで400以上のモデルすべてにアクセス

LobeHub には、多くの主要プロバイダー向けの組み込みチャネルがあり、それぞれに独自のキーが必要です。APIYI を使えば、すべてのモデルをカバーする **1つ** のカスタムプロバイダーを作成できます。

| チャネル                | モデル                                          | 主な利点                       | APIエンドポイント                 |
| ------------------- | -------------------------------------------- | -------------------------- | -------------------------- |
| **OpenAI互換（apiyi）** | 400以上のすべてのモデル（Claude、Gemini、GPT、DeepSeek など） | 1つのキーですべてを解放 — 最も簡単なセットアップ | `https://api.apiyi.com/v1` |

<Tip>
  **1つの apiyi チャネルで Claude、Gemini、その他すべてのモデルをカバー**

  APIYI は Claude、Gemini、GPT、DeepSeek、その他の主要モデルを OpenAI 互換プロトコルで提供します。そのため、LobeHub で 1つの`apiyi`カスタムプロバイダーを使うだけで、ドロップダウン内の 400 以上のモデルすべてにアクセスできます — ベンダーごとに個別のチャネルを設定する必要はありません。
</Tip>

## LobeHubの機能を詳しく見る

### プラグインマーケットプレイス

LobeHub には、充実したプラグインマーケットプレイス（`Settings → Plugins`）が付属しています。おすすめのプラグインは次のとおりです。

* **Web Search** — モデルにリアルタイムのインターネットアクセスを与える
* **Code Interpreter** — チャット内で Python を実行して、データ分析と可視化を行う
* **Chart Generation** — フローチャートやマインドマップを自動生成する
* **Image Generation** — `gpt-image-2` や `gemini-3-pro-image` のようなモデルを使って画像を生成する

### ローカルナレッジベース（RAG）

LobeHub は、ファイルからローカルのベクターストアを構築できます。

1. `Knowledge Base` ページに移動して、新しいナレッジベースを作成します
2. PDF、Markdown、Word、Excel、または TXT ファイルをアップロードします
3. システムが自動でチャンク化し、埋め込みします
4. チャットでナレッジベースを選択すると、モデルがファイルに基づいて回答します

<Warning>
  埋め込みステップでは埋め込みモデルが呼び出されます（課金対象です）。APIYI の `text-embedding-3-large`、または同様の埋め込みモデルの利用をおすすめします。
</Warning>

### マルチモーダルチャット

画像をアップロードして、ビジョン理解、認識、OCR を行えます。

* 推奨のビジョンモデル: `gemini-3-6-flash`, `claude-opus-5`, `gpt-5-6-terra`
* 画像をチャット入力欄にドラッグするだけで、モデルが認識します

### エージェントマーケットプレイス

LobeHub には、豊富なプリセットエージェント（翻訳、ライティング、コーディング、面接対策など）が付属しています。さらに、次のこともできます。

* `Agent marketplace` からコミュニティ共有のエージェントをワンクリックで有効化する
* 独自のエージェントを作成する — カスタムペルソナ、prompt、冒頭メッセージ、ナレッジベース、プラグインを設定できます

### 会話管理

* 会話を分岐し、メッセージを編集し、応答を再生成する
* 会話を Markdown、PNG、または JSON としてエクスポートする
* メッセージ履歴全体を横断検索する

## 詳細設定

### カスタムリクエストパラメータ

プロバイダーの詳細ページで、一般的なパラメータを調整できます:

```yaml theme={null}
Default parameters:
  Temperature: 0.7        # Creativity (reasoning models such as the GPT-5.6 series must use 1)
  Top P: 0.9              # Sampling (reasoning models must use 1)
  Max Tokens: 4096        # Maximum output length
  Context Length: 8192    # Context window
```

<Warning>
  一部の推論モデル（GPT-5.6 シリーズなど）は、`Temperature = 1` と `Top P = 1` のみをサポートしています。ほかの値は無視されるか、サーバー側でエラーになります。
</Warning>

### ネットワークプロキシとセルフホスティング

プロキシ利用またはセルフホストの LobeHub では、次のようにします。

1. **デスクトップクライアント**: HTTP/HTTPS プロキシを設定するために `Settings → Network`
2. **セルフホスト（Docker）**: 環境変数を使って APIYI の設定を注入します:
   ```bash theme={null}
   OPENAI_API_KEY=sk-your-apiyi-key
   OPENAI_PROXY_URL=https://api.apiyi.com/v1
   CUSTOM_MODELS=gpt-5-6-terra,claude-opus-5,deepseek-v4-pro
   ```
3. **クライアントサイドリクエストモード**: ブラウザーから直接リクエストできるようにします（ブラウザーが APIYI に到達できる場合のみ）

### キーボードショートカット

| ショートカット                | 操作       |
| ---------------------- | -------- |
| `Ctrl/Cmd + N`         | 新しい会話    |
| `Ctrl/Cmd + K`         | クイック検索   |
| `Ctrl/Cmd + /`         | コマンドパレット |
| `Ctrl/Cmd + Shift + M` | モデルを切り替え |

## モバイル

LobeHub のデスクトップクライアントは Windows / macOS / Linux で動作します。モバイルでは、`lobechat.com` のレスポンシブな Web アプリをご利用ください。別途インストールは不要です。

## トラブルシューティング

### 接続失敗 / 接続確認に失敗する

| 症状         | 確認すること                                                       |
| ---------- | ------------------------------------------------------------ |
| 401 / 403  | API key が無効、または残高切れです — APIYI のコンソールで確認してください                |
| 404        | プロキシ URL に `/v1` のサフィックスがありません                               |
| Timeout    | ネットワークの問題です — プロキシまたはファイアウォールを確認してください                       |
| CORS error | `Client-side request mode` をオフにするか、サーバーサイドのプロキシ経由でアクセスしてください |

### モデル一覧が空です

* **モデル一覧を取得** をクリックして再取得します
* 1〜2 秒待ってから、ページを更新します
* APIYI のコンソールで API key が有効であることを確認します

### 応答が遅い、または stream が中断される

* より高速な model に切り替えます（例: `gemini-3-5-flash-lite`、`claude-haiku-4-5`、`deepseek-v4-flash`）
* 不要なプラグインを無効にします
* ネットワークのレイテンシを確認します
* 長いコンテキストを短くします（古い会話を閉じる）

### ナレッジベースの検索結果が不正確です

* より細かく検索できるようにチャンクサイズを小さくします
* APIYI 上で、より高性能な embedding model に切り替えます
* 関連性の高いドキュメントを追加して、再現率を高めます

## ベストプラクティス

### モデル選定戦略

タスクに応じて適切なモデルを選び、複雑さに合わせて使い分けてください。

* **日常会話 / 簡単な Q\&A**: `gemini-3-5-flash-lite`, `claude-haiku-4-5`, `deepseek-v4-flash`
* **複雑な推論 / 長文ドキュメント分析**: `claude-opus-5`, `gpt-5-6-sol`, `deepseek-v4-pro`
* **コーディング**: `claude-opus-5`, `gpt-5-6-sol`, `claude-sonnet-5`
* **画像理解**: `gemini-3-6-flash`, `claude-opus-5`, `gpt-5-6-terra`
* **画像生成**: `gpt-image-2`, `gemini-3-pro-image`

モデル一覧全体と性能比較については、[モデル推薦ページ](/ja/api-capabilities/model-info)をご覧ください。

### コンテキスト管理

* 古くなった会話は定期的に整理する
* 複雑なタスクは、より短い会話に分割する
* `branch conversation` 機能を使って、代替案の応答を試す

### セキュリティとプライバシー

* API key を公開の場で共有しない
* 定期的に key をローテーションする（APIYI コンソールでワンクリックリセット可能）
* 機密性の高い会話では、LobeHub をセルフホストする - データはローカルに保持されます

### セルフホストのヒント

* 本番環境では、組み込み DB ではなく Docker + PostgreSQL を使う
* Cloudflare をリバースプロキシとして前段に置く
* シークレットは環境変数で管理し、複数インスタンスへのデプロイを容易にする

## 他のクライアントとの比較

3つのクライアントはいずれも同じ方法で APIYI に接続します（OpenAI互換プロトコル）。主な違いは、デプロイ形態と機能の重点にあります。

| 機能                   | LobeHub                                   | [Chatbox AI](/ja/scenarios/chat/chatbox) | [Cherry Studio](/ja/scenarios/chat/cherry-studio) |
| -------------------- | ----------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| **デプロイ方法**           | デスクトップ + Web + Docker / Vercel のセルフホスティング | デスクトップ + モバイル + Web                      | デスクトップ + モバイル                                     |
| **ローカルナレッジベース（RAG）** | 内蔵ベクトルストア                                 | 会話ごとのドキュメント理解                            | 内蔵ナレッジベース                                         |
| **プラグイン / 拡張機能**     | プラグインマーケットプレイス、豊富なエコシステム                  | 一般的な機能を内蔵                                | ほとんどが内蔵機能                                         |
| **チャネルプロトコル**        | OpenAI互換                                  | OpenAI互換                                 | OpenAI / Anthropic / Gemini                       |
| **モバイル**             | レスポンシブWeb                                 | ネイティブアプリ                                 | ネイティブアプリ                                          |

<Tip>
  **LobeHub を選ぶタイミングは？**

  * **永続的なローカルナレッジベース** または **プラグインエコシステム**（Web検索、コードインタープリター、チャートなど）が必要な場合
  * データを完全に管理できる **プライベートデプロイ**（Docker / Vercel）を使いたい場合
  * デスクトップ + Web で共通の **統一インターフェース** を使いたい場合

  3つとも十分に優れた選択肢です。**ネイティブモバイルアプリとローカルストレージ**を重視するなら Chatbox AI、**Claude / Gemini のネイティブプロトコル**（Prompt Cache を含む）が必要なら Cherry Studio を選んでください。
</Tip>

さらにサポートが必要ですか？ `lobechat.com` のドキュメントを確認するか、[APIYIのWebサイト](https://api.apiyi.com)をご覧ください。
