> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cherry Studio

> OpenAI、Anthropic、Gemini のチャネルタイプに対応した、強力な AI 会話クライアント統合ガイド

Cherry Studioは、複数の大規模言語モデルをサポートする高機能なAI会話クライアントです。APIYIを通じて、Cherry Studioでさまざまな主要AIモデルを利用でき、最適な体験とコスト最適化のために異なるチャネルタイプを選択できます。

## クイック統合（OpenAI互換形式）

これは最も汎用的な統合方法で、APIYI の 400 以上のすべてのモデルに対応しています。

### 1. API Key の取得

API Key を取得するには、[API Key 管理チュートリアル](/ja/faq/token-management)をご覧ください。

### 2. 設定手順

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cherry-studio-config.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=697ce7c87d0a7ddadbc2a4ae4eeca322" alt="Cherry Studio の OpenAI互換設定画面" width="2400" height="1668" data-path="images/cherry-studio-config.png" />

上の画像に従って、以下の設定手順を完了してください。

1. Cherry Studio アプリを開く
2. 左側の設定アイコンをクリックして、設定ページに入る
3. 「モデルサービス」オプションを選択する
4. モデルプロバイダー一覧でカスタムチャネル \[APIYI] を作成する
5. 設定情報を入力する:
   * **APIアドレス**: `https://api.apiyi.com`
   * **API Key**: APIYI のキーを入力してください（[取得方法](/ja/faq/token-management)）
6. 下部の「➕ 追加」ボタンをクリックして設定を保存する

<Info>
  **設定のポイント**

  * API アドレスは次を使用してください: `https://api.apiyi.com`
  * API Key の設定については、[API Key 管理チュートリアル](/ja/faq/token-management)をご覧ください
  * 正しく設定できていることを確認するため、まず接続テストを行うことをおすすめします
</Info>

## 3つのチャネルタイプの比較

Cherry Studio は複数のチャネルタイプをサポートしており、すべて APIYI から利用できます。用途に最適な方法を選んでください。

| Feature     | OpenAI Compatible                  | Anthropic Format        | Gemini Format    |
| ----------- | ---------------------------------- | ----------------------- | ---------------- |
| **APIアドレス** | すべて `https://api.apiyi.com` を使用します |                         |                  |
| **対応モデル**   | 400+ 以上のすべてのモデル                    | Claude モデルのみ            | Gemini モデルのみ     |
| **主な利点**    | 汎用互換性                              | キャッシュコストの節約             | ネイティブ機能 + 画像生成   |
| **キャッシュ課金** | 対象外                                | キャッシュ済みの token は約10%の価格 | 対象外              |
| **特別機能**    | 最も幅広いモデル対応                         | チャットのコスト最適化             | テキストから画像生成、コード実行 |
| **最適用途**    | 一般用途、マルチモデル                        | Claude を大量に使う場合         | Gemini 固有の機能     |

<Tip>
  **どのように選ぶか？**

  * 複数のモデルを使う場合は、**OpenAI Compatible Format** を選んでください（推奨のデフォルトです）
  * 主に Claude を使い、会話が頻繁に発生する場合（5分以内）は、コストを抑えるために **Anthropic Format** を選んでください
  * Gemini のテキストから画像生成やその他のネイティブ機能が必要な場合は、**Gemini Format** を選んでください
</Tip>

## Anthropic チャネルタイプ

Anthropic ネイティブ形式は **[プロンプトキャッシュ](/ja/api-capabilities/claude-prompt-caching)** をサポートしています。5 分以内の継続会話では、キャッシュされた入力 token の料金は通常価格の約 10% にすぎず、使用コストを大幅に削減できます。

### 設定手順

<img src="https://mintcdn.com/apiyillc/7TkKa5JmqO5PH0BI/images/cherry-studio-anthropic-provider.png?fit=max&auto=format&n=7TkKa5JmqO5PH0BI&q=85&s=2f3eeb3f3536cbe6cb0ec1f2bd2478f8" alt="Cherry Studio の Anthropic プロバイダー追加ダイアログ" width="1570" height="1020" data-path="images/cherry-studio-anthropic-provider.png" />

1. Cherry Studio の設定 → モデルサービス を開きます
2. 下部の「➕ 追加」ボタンをクリックし、ダイアログに以下を入力します:
   * **プロバイダー名**: カスタム名（例: `APIYI-CLAUDE` など、識別しやすいように）
   * **プロバイダータイプ**: **Anthropic** を選択します
3. 「OK」をクリックして作成したら、新しいチャネルで設定を入力します:
   * **API アドレス**: `https://api.apiyi.com`
   * **API キー**: APIYI キーを入力します
4. 必要な Claude モデルを追加します（例: `claude-sonnet-4-5-20250929`, `claude-opus-4-5-20251101`）

<Warning>
  **注意**: Anthropic チャネルは Claude シリーズのモデルのみをサポートしています。その他のモデルには、OpenAI 互換形式のチャネルを使用してください。
</Warning>

### 使用する場面

* **継続会話**: 5 分以内の頻繁なチャットではキャッシュヒット率が高く、コストを大幅に節約できます
* **長いコンテキストの会話**: コンテキストが長いほど、キャッシュによる節約効果が高くなります
* **たまに使うチャット**: 断続的にチャットするだけなら、OpenAI 互換形式でも同じように使えます

<CardGroup cols={2}>
  <Card title="Claude API ドキュメント" icon="book" href="/ja/api-capabilities/claude">
    ストリーミング、拡張推論、その他の高度な機能を含む、Anthropic ネイティブ形式の API ドキュメント全体を表示します。
  </Card>

  <Card title="プロンプトキャッシュの深掘り" icon="database" href="/ja/api-capabilities/claude-prompt-caching">
    プロンプトキャッシュが請求額を 10% に削減する仕組みを、発火条件、最小限の例、よくある落とし穴とともに学べます。
  </Card>
</CardGroup>

## Gemini チャンネルタイプ

Gemini のネイティブフォーマットは、`gemini-3-pro-image-preview` を使った **テキストから画像生成**、コード実行、ネイティブな推論制御など、Gemini 専用のすべての機能をサポートしています。

### 設定手順

1. Cherry Studio の設定 → モデルサービス を開きます
2. 新しいチャンネルを作成し、**チャンネルタイプとして Google Gemini を選択**します
3. 設定を入力します:
   * **API アドレス**: `https://api.apiyi.com`
   * **API Key**: APIYI キーを入力します
4. 必要な Gemini モデルを追加します（例: `gemini-2.5-flash`、`gemini-3-pro-preview`、`gemini-3-pro-image-preview`）

<Warning>
  **注意**: Gemini チャンネルは Gemini シリーズのモデルのみサポートします。その他のモデルには、OpenAI 互換フォーマットのチャンネルを使用してください。
</Warning>

### 特殊機能

* **テキストから画像**: `gemini-3-pro-image-preview` モデルを使って、会話内で直接画像を生成できます
* **コード実行**: モデルはデータ分析のために Python コードを自動的に実行できます
* **推論制御**: `thinking_budget` を通じて推論の深さを細かく調整できます
* **マルチモーダル対応**: 画像、音声、動画、その他のメディア入力を完全にサポートします

<Card title="Gemini ネイティブフォーマットのドキュメント" icon="sparkles" href="/ja/api-capabilities/gemini/native">
  マルチモーダル処理、推論制御、コード実行などを含む、Gemini ネイティブフォーマットの完全な API ドキュメントを表示します。
</Card>

## モデルの追加

チャネルを設定したら、必要なモデルを対応するチャネルに追加します:

1. モデル検索ボックスでモデルを検索します
2. モデル名の横にあるアイコンをクリックして、選択または設定します
3. 必要に応じて、さまざまなモデルバリアントを有効または無効にします

<Card title="最新のモデル推奨を見る" icon="star" href="/ja/api-capabilities/model-info">
  最新のモデル推奨、パフォーマンス比較、利用の提案を確認できます。モデルは継続的に更新されるため、常に最新かつ最も高性能なAIモデルを利用できます。
</Card>

<Info>
  **なぜここに特定のモデルを一覧表示しないのですか？**

  AIモデルは非常に頻繁に更新されます。最も正確なモデル推奨をお届けするため、最新のモデル一覧、パフォーマンスデータ、および利用の提案は、[モデル推奨ページ](/ja/api-capabilities/model-info)で管理しています。
</Info>

## 高度な機能

### 画像対応

画像をサポートするモデル（例: GPT-4V）を使用する場合:

1. 設定で「Image」オプションを有効にする
2. vision対応のモデルを選択する
3. 会話内で画像をアップロードする

### ストリーミング出力

Cherry Studio はデフォルトでストリーミング出力をサポートしており、より良い体験を提供します。

## トラブルシューティング

### 接続に失敗しました

* API key が正しいか確認してください
* APIアドレスを確認してください: `https://api.apiyi.com`
* ネットワーク接続の状態を確認してください

### モデルを利用できません

* 残高が十分か確認してください
* モデルが正しいチャンネルタイプにあるか確認してください（例: Claude モデルは OpenAI または Anthropic チャンネルにある必要があります）
* 他のモデルを試してください

## 使用のヒント

1. **チャネルを賢く選択する**: 主なモデルに基づいて適切なチャネルタイプを選択してください。複数のチャネルを同時に設定できます
2. **モデルを賢く選択する**: タスク要件に基づいて適切なモデルを選択してください
3. **定期的に更新する**: 新しいモデルのリリースを追跡してください
4. **使用状況を監視する**: APIYI で使用状況を確認してください

さらにヘルプが必要ですか？ [APIYI 公式サイト](https://api.apiyi.com)をご覧ください。
