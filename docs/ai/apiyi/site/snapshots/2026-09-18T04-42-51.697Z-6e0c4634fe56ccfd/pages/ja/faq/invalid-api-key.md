> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# なぜ API Key は無効なのですか？

> API Key が無効というエラーを解決し、Base URL と API Key の正しい設定方法を学びます

## よくあるエラー症状

このようなエラーメッセージが表示されたら:

```json theme={null}
{
  "error": {
    "message": "Incorrect API key provided: sk-QqHvK***...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

これは通常、API Key が間違っている**のではなく**、**Base URL が誤って設定されている**ことを意味します。

<Warning>
  **最もよくあるミス**: APIYI の Key を使っているのに、OpenAI の公式エンドポイントへリクエストを送っている `https://api.openai.com`
</Warning>

## Base URLとは？

**Base URL**（Base URL / リクエスト先アドレス）は、APIリクエストの送信先サーバーアドレスです。APIサービスプロバイダーによって、Base URL は異なります。

### Base URLとAPI Keyは一致する必要があります

| Service Provider | Base URL                 | API Key Format  | Match?   |
| ---------------- | ------------------------ | --------------- | -------- |
| **APIYI**        | `https://api.apiyi.com`  | `sk-xxxx......` | ✅ 正しい    |
| **OpenAI 公式**    | `https://api.openai.com` | `sk-xxxx......` | ✅ 正しい    |
| ❌ APIYI キー       | `https://api.openai.com` | `sk-xxxx......` | ❌ **誤り** |
| ❌ OpenAI キー      | `https://api.apiyi.com`  | `sk-xxxx......` | ❌ **誤り** |

<Info>
  **重要な原則**: API Key のプロバイダーに一致する Base URL を使用してください。
</Info>

## 正しい設定

### 方法1: Base URL を変更する（推奨）

OpenAI のエンドポイントを APIYI のものに置き換えるだけで、他はそのままです:

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",  # Get Key from APIYI dashboard
      base_url="https://api.apiyi.com/v1"  # Change to APIYI address
  )

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hello"}]
  )
  ```

  ```javascript JavaScript/Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-apiyi-key',  // Get Key from APIYI dashboard
    baseURL: 'https://api.apiyi.com/v1'  // Change to APIYI address
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }]
  });
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -d '{
      "model": "gpt-4o",
      "messages": [{"role": "user", "content": "Hello"}]
    }'
  ```
</CodeGroup>

### 方法2: 環境変数を使う

コード内で Base URL を指定しなくて済むように、環境変数を設定します:

<CodeGroup>
  ```bash Linux/macOS theme={null}
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```powershell Windows PowerShell theme={null}
  $env:OPENAI_API_KEY="sk-your-apiyi-key"
  $env:OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```cmd Windows CMD theme={null}
  set OPENAI_API_KEY=sk-your-apiyi-key
  set OPENAI_BASE_URL=https://api.apiyi.com/v1
  ```
</CodeGroup>

## サポートされる Base URL 形式

APIYI は、コードに応じて 3 種類の Base URL 形式をサポートしています。

<Tabs>
  <Tab title="形式 1: /v1 付き（推奨）">
    ```
    https://api.apiyi.com/v1
    ```

    **ユースケース**: ほとんどのライブラリは、Base URL に特定のパスを自動で追加します

    **完全なリクエスト例**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="形式 2: /v1/ 付き（末尾スラッシュ）">
    ```
    https://api.apiyi.com/v1/
    ```

    **ユースケース**: 一部のフレームワークでは、Base URL の末尾にスラッシュが必要です

    **完全なリクエスト例**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="形式 3: 完全パス">
    ```
    https://api.apiyi.com/v1/chat/completions
    ```

    **ユースケース**: 完全な API エンドポイントを直接使用します（例: cURL リクエスト）

    <Note>
      この方法は通常、cURL または生の HTTP ライブラリのリクエストで使用され、Base URL を設定する必要はありません
    </Note>
  </Tab>
</Tabs>

## トラブルシューティング

<AccordionGroup>
  <Accordion title="Base URL が正しいことは確認しましたが、まだエラーが出ます">
    **考えられる原因**:

    1. **複数の設定箇所**: 設定ファイル、環境変数、コードの初期化などで Base URL が設定されていないか確認してください。
    2. **プロキシまたはミドルウェア**: 一部のプロキシツールはリクエストをリダイレクトする場合があります
    3. **キャッシュの問題**: プログラムを再起動するか、キャッシュをクリアして再試行してください
    4. **タイプミス**: `apiyi` が正しく綴られているか確認してください（`apiyii` や `apiyl` ではありません）
  </Accordion>

  <Accordion title="Key が有効かどうかを確認するには？">
    APIYI ダッシュボードで確認します:

    1. APIYI ダッシュボード `console.apiyi.com` にログインする
    2. 「Tokens」ページへ移動する
    3. Key のステータスが「Enabled」か確認する
    4. アカウントに十分な残高があることを確認する
  </Accordion>

  <Accordion title="サードパーティ製ツール（ChatBox、OpenCat など）を設定するには？">
    多くのサードパーティ製ツールには「Custom API」または「Self-hosted Server」オプションがあります:

    * **API Address / Base URL**: `https://api.apiyi.com/v1`
    * **API Key**: APIYI ダッシュボードから Key をコピーします
    * **Model Name**: APIYI ドキュメントのモデル一覧を参照してください

    <Tip>
      設定オプションは通常、「Settings」→「API」または「Server」セクションにあります
    </Tip>
  </Accordion>

  <Accordion title="コード例はどこで見つけられますか？">
    APIYI は複数の言語で完全なコード例を提供しています:

    1. **Quick Start Documentation**: ホームページ → Code Examples
    2. **Online Testing Tool**: ダッシュボード → ApiFox Online Testing
    3. **GitHub Repository**: `github.com/apiyi/docs` → knowledge-base ディレクトリ
  </Accordion>
</AccordionGroup>

## 誤りと正解の例

<CardGroup cols={2}>
  <Card title="❌ 誤った設定" icon="x" color="#ef4444">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.openai.com/v1"
        # ❌ Using OpenAI official endpoint
    )
    ```

    **結果**: OpenAI サーバーは APIYI のキーを拒否します
  </Card>

  <Card title="✅ 正しい設定" icon="check" color="#10b981">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.apiyi.com/v1"
        # ✅ Using APIYI endpoint
    )
    ```

    **結果**: リクエストは APIYI サーバーに正常に送信されました
  </Card>
</CardGroup>

## 簡易テスト方法

cURL コマンドを使って、設定をすばやく確認します:

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

**期待される結果**: 利用可能なモデルの一覧を返します

```json theme={null}
{
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      ...
    }
  ]
}
```

エラーが出る場合は、次を確認してください:

1. API Key が正しくコピーされているか（先頭または末尾の空白に注意してください）
2. ネットワーク接続が正常に動作しているか
3. アカウントに十分な残高があるか

## 関連ドキュメント

* [クイックスタートガイド](/ja/getting-started)
* [APIマニュアル](/ja/api-manual)
* [残高が残っているのに API を利用できないのはなぜですか?](/ja/faq/balance-insufficient)
* [対応モデル一覧](/ja/api-capabilities/model-info)

<Tip>
  **基本原則を忘れないでください**: URL を Key の提供元に合わせてください。APIYI の Key は `https://api.apiyi.com/v1` を使用します
</Tip>
