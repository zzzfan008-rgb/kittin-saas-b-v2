> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Base URLの設定方法は？ /v1、ルートドメイン、/v1beta の違い

> API.YI の Base URL を設定するための完全ガイド: OpenAI には /v1、Claude にはルートドメイン、Gemini には /v1beta

## クイックアンサー

<Info>
  **覚えておいてください**: OpenAIモデルには`/v1`が必要で、Claudeはルートドメインのみを使用し、Geminiには`/v1beta`が必要です。Base URLの誤りは、最もよくある統合時の問題です。
</Info>

| モデルファミリー                         | ベースURL                     | SDK                                           |
| -------------------------------- | -------------------------- | --------------------------------------------- |
| GPT / DeepSeek / Llama / Qwen など | `https://api.apiyi.com/v1` | OpenAI SDK                                    |
| Claudeシリーズ                       | `https://api.apiyi.com`    | Anthropic SDK                                 |
| Geminiシリーズ                       | `https://api.apiyi.com`    | Google GenAI SDK (`api_version: "v1beta"`を設定) |

## なぜモデルごとにベースURLが異なるのですか？

これは各ベンダーのSDK実装によって決まります。

* **OpenAI SDK**: `base_url` の後ろにリソースパスを追加するため、`/v1` を含める必要があります
* **Anthropic SDK**: 内部で `/v1/messages` を追加します — そのため、`/v1` を自分で付け足すと `/v1/v1/messages`（404エラー）になります
* **Google GenAI SDK**: `/v1beta` パスを使用し、SDKが連結を自動的に処理します

## コード例

### OpenAI互換モデル（GPT / DeepSeek / Llama など）

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"  # Domain + /v1
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

### Claude モデル（Anthropic SDK）

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com"  # Root domain only, NO /v1
)

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

### Gemini モデル（Google GenAI SDK）

```python theme={null}
from google import genai

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"api_version": "v1beta", "base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="Hello!"
)
print(response.text)
```

<Warning>
  **Claude ユーザーによくある間違い**: 公式 Anthropic SDK を使う場合、Base URL は `https://api.apiyi.com` のみを指定してください。`/v1` は追加しないでください。ただし、OpenAI SDK の互換モードで Claude を呼び出す場合は、`/v1` が必要です。
</Warning>

## ドメインノードの選択

APIYI は、機能が同一で、ネットワークルーティングとデプロイメントアーキテクチャが異なる 4 つのドメインノードを提供します:

<CardGroup cols={2}>
  <Card title="🌏 グローバルダイレクト（海外向け推奨）" icon="globe">
    **`vip.apiyi.com`**

    バックエンドへ直接接続し、レイテンシーが最小です。**中国本土以外のお客様に推奨します**。
  </Card>

  <Card title="🇨🇳 中国デフォルト（中国本土向け推奨）" icon="server">
    **`api.apiyi.com`**

    中国本土ネットワーク向けに最適化されています。**中国本土のお客様のデフォルトです**。
  </Card>

  <Card title="🏢 中国バックアップ / ビジネス" icon="building">
    **`b.apiyi.com`**

    バックアップノードとビジネス向けエンタープライズ回線です。プライマリノードが利用できない場合に使用します。
  </Card>

  <Card title="⚡ Cloudflare CDN グローバルアクセラレーション" icon="bolt">
    **`api-cf.apiyi.com`**

    Cloudflare のグローバル CDN アクセラレーションです。**テキストのみの API 呼び出し**に使用します。100秒のタイムアウト制限があります。
  </Card>
</CardGroup>

| ノード            | ドメイン               | 推奨対象              | 備考                        |
| -------------- | ------------------ | ----------------- | ------------------------- |
| グローバルダイレクト     | `vip.apiyi.com`    | 中国本土以外のお客様        | バックエンド直結、最小レイテンシー         |
| 中国デフォルト        | `api.apiyi.com`    | 中国本土のお客様          | 国内ルーティングに最適化（デフォルト）       |
| 中国バックアップ/ビジネス  | `b.apiyi.com`      | エンタープライズ / バックアップ | バックアップ + Business         |
| Cloudflare CDN | `api-cf.apiyi.com` | テキストのみの呼び出し       | グローバルアクセラレーション、100秒タイムアウト |

<Warning>
  **Cloudflare CDN ノードの制限**: `api-cf.apiyi.com` は Cloudflare Workers 上にデプロイされており、最大リクエストタイムアウトは **100 秒**です。そのため:

  * ✅ **適しています**: 通常のテキストチャット、短いテキスト生成、その他の高速応答の呼び出し
  * ❌ **適していません**: 100 秒を超える複雑な長文タスク
  * ❌ **適していません**: Nano Banana Pro およびその他の画像生成タスク
  * ❌ **適していません**: 動画生成 API 呼び出し

  タスクが 100 秒を超える可能性がある場合は、`vip.apiyi.com`（海外向け）または`api.apiyi.com`（中国本土向け）を使用してください。
</Warning>

<Tip>
  サービスの可用性を高めるため、コードで自動切り替え用のフォールバックノードを設定することを推奨します。
</Tip>

## よくあるエラーのトラブルシューティング

| エラー                    | 考えられる原因                                                     | 解決策                                                                                  |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **404 Not Found**      | OpenAI SDK で `/v1` が不足している、または Anthropic SDK に余分な `/v1` がある | パスが SDK の仕様と一致していることを確認してください                                                        |
| **400 Bad Request**    | Gemini SDK のパスバージョンが一致していない                                 | `/v1beta` を使用していることを確認してください                                                         |
| **Connection Timeout** | ドメインノードが正しくない                                               | 中国では `api.apiyi.com`、海外では `vip.apiyi.com` を使用してください。CF-CDN ノードには 100 秒のタイムアウト制限があります |
| **SSL Error**          | `https://` プレフィックスがない                                       | すべてのノードで HTTPS が必要です                                                                 |
| **Double Slash Error** | base\_url の末尾に `/` がある                                      | 末尾のスラッシュを削除してください                                                                    |

## 完全設定リファレンス

### OpenAI 互換モデル

| ノード                    | ベース URL                       |
| ---------------------- | ----------------------------- |
| グローバル直通（海外）            | `https://vip.apiyi.com/v1`    |
| 中国デフォルト（本土）            | `https://api.apiyi.com/v1`    |
| 中国バックアップ/ビジネス          | `https://b.apiyi.com/v1`      |
| Cloudflare CDN（テキストのみ） | `https://api-cf.apiyi.com/v1` |

### Claude モデル（Anthropic SDK）

| ノード                    | ベース URL                    |
| ---------------------- | -------------------------- |
| グローバル直通（海外）            | `https://vip.apiyi.com`    |
| 中国デフォルト（本土）            | `https://api.apiyi.com`    |
| 中国バックアップ/ビジネス          | `https://b.apiyi.com`      |
| Cloudflare CDN（テキストのみ） | `https://api-cf.apiyi.com` |

### Gemini モデル

| ノード                    | ベース URL                    |
| ---------------------- | -------------------------- |
| グローバル直通（海外）            | `https://vip.apiyi.com`    |
| 中国デフォルト（本土）            | `https://api.apiyi.com`    |
| 中国バックアップ/ビジネス          | `https://b.apiyi.com`      |
| Cloudflare CDN（テキストのみ） | `https://api-cf.apiyi.com` |

<Info>
  Google GenAI SDK を Gemini に使用する場合は、`base_url` をルートドメインに設定し、`api_version: "v1beta"` を設定してください。SDK が完全なパスを自動的に構築します。
</Info>
