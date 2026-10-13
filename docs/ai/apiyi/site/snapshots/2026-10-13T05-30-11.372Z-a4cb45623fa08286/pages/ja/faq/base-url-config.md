> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Base URLの設定方法は？ /v1、ルートドメイン、/v1beta の違い

> API.YI の Base URL を設定するための完全ガイド: OpenAI には /v1、Claude にはルートドメイン、Gemini には /v1beta

## クイックアンサー

<Info>
  **覚えておいてください**: OpenAIモデルには`/v1`が必要で、Claudeはルートドメインのみを使用し、Geminiには`/v1beta`が必要です。Base URLの誤りは、最もよくある統合時の問題です。
</Info>

| モデルファミリー | ベースURL | SDK |
| - | - | - |
| GPT / DeepSeek / Llama / Qwen など | `https://api.apiyi.com/v1` | OpenAI SDK |
| Claudeシリーズ | `https://api.apiyi.com` | Anthropic SDK |
| Geminiシリーズ | `https://api.apiyi.com` | Google GenAI SDK (`api_version: "v1beta"`を設定) |

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

APIYIは同一の機能を備えた3つのドメインノードを提供しており、ネットワークルーティングとデプロイアーキテクチャが異なります：

<CardGroup cols={3}>
  <Card title="🌏 デフォルト（推奨）" icon="server">
    **`api.apiyi.com`**

    デフォルトのメイン回線です。**中国本土内外を問わず、すべてのお客様に推奨されます**。
  </Card>

  <Card title="🏢 中国バックアップ / Business" icon="building">
    **`b.apiyi.com`**

    バックアップノードおよびBusinessエンタープライズ回線です。プライマリノードが利用できない場合に使用してください。
  </Card>

  <Card title="⚡ Cloudflare CDN グローバル高速化" icon="bolt">
    **`api-cf.apiyi.com`**

    CloudflareのグローバルCDN高速化です。**テキストのみのAPI呼び出し**向けです。100秒のタイムアウト制限があります。
  </Card>
</CardGroup>

| ノード | ドメイン | 推奨対象 | 備考 |
| - | - | - | - |
| デフォルト | `api.apiyi.com` | すべてのお客様（推奨） | デフォルトのメイン回線 |
| 中国バックアップ/Business | `b.apiyi.com` | エンタープライズ / バックアップ | バックアップ + Business |
| Cloudflare CDN | `api-cf.apiyi.com` | テキストのみの呼び出し | グローバル高速化、100秒タイムアウト |

<Warning>
  **Cloudflare CDNノードの制限事項**：`api-cf.apiyi.com`はCloudflare Workers上にデプロイされており、最大リクエストタイムアウトは**100秒**です。そのため：

  * ✅ **適している用途**：通常のテキストチャット、短いテキスト生成、その他応答の速い呼び出し
  * ❌ **適していない用途**：100秒を超える複雑な長文テキストタスク
  * ❌ **適していない用途**：Nano Banana Proなどの画像生成タスク
  * ❌ **適していない用途**：動画生成のAPI呼び出し

  タスクが100秒を超える可能性がある場合は、代わりに`api.apiyi.com`（またはバックアップノード`b.apiyi.com`）をご利用ください。
</Warning>

<Tip>
  サービスの可用性を向上させるため、コード内でフォールバックノードを設定し、自動切り替えを行うことを推奨します。
</Tip>

## よくあるエラーのトラブルシューティング

| エラー | 考えられる原因 | 解決策 |
| - | - | - |
| **404 Not Found** | OpenAI SDK での `/v1` の不足、または Anthropic SDK での余分な `/v1` | パスが SDK の仕様と一致していることを確認します |
| **400 Bad Request** | Gemini SDK パスのバージョン不一致 | `/v1beta` を使用していることを確認します |
| **接続タイムアウト** | 誤ったドメインノード | 時間のかかるリクエストには `api.apiyi.com` または `b.apiyi.com` を使用します。CF-CDN ノードには 100 秒のタイムアウト制限があります |
| **SSL エラー** | `https://` プレフィックスの欠落 | すべてのノードで HTTPS が必須です |
| **ダブルスラッシュエラー** | base\_url 末尾の `/` | 末尾のスラッシュを削除します |

## 完全な設定リファレンス

### OpenAI互換モデル

| ノード | ベースURL |
| - | - |
| デフォルト（推奨） | `https://api.apiyi.com/v1` |
| 中国バックアップ/ビジネス | `https://b.apiyi.com/v1` |
| Cloudflare CDN（テキストのみ） | `https://api-cf.apiyi.com/v1` |

### Claudeモデル（Anthropic SDK）

| ノード | ベースURL |
| - | - |
| デフォルト（推奨） | `https://api.apiyi.com` |
| 中国バックアップ/ビジネス | `https://b.apiyi.com` |
| Cloudflare CDN（テキストのみ） | `https://api-cf.apiyi.com` |

### Geminiモデル

| ノード | ベースURL |
| - | - |
| デフォルト（推奨） | `https://api.apiyi.com` |
| 中国バックアップ/ビジネス | `https://b.apiyi.com` |
| Cloudflare CDN（テキストのみ） | `https://api-cf.apiyi.com` |

<Info>
  Gemini用のGoogle GenAI SDKを使用する場合は、`base_url`をルートドメインに設定し、`api_version: "v1beta"` — SDKが自動的に完全なパスを構築します。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.