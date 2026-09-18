> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Web Search & X Search ガイド

> APIYI 上の Grok ライブ検索を実機で検証済みです。Responses API + web_search / x_search ツールは実際の検索を実行し、引用付きの最新結果を返します。X search は Grok 固有です。レスポンス構造と課金に関する注意事項も含みます。

このページでは、2026年7月13日 (UTC+8) に実機で検証済みの、APIYI 上での Grok のウェブ検索と X（Twitter）検索の使い方を説明します。

## 要点

**APIYI は Grok の公式サーバー側検索ツールを完全にサポートしています**: **Responses API (`/v1/responses`) と `web_search` / `x_search` ツール**を使用してください。 `grok-4.5` は、実際の検索を確実に実行し、出典付きの最新結果を返します。デフォルトグループのキーは追加設定なしですぐに使えます。

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tools:     tools: [{"type": "web_search"}] or [{"type": "x_search"}]
Model:     grok-4.5 (verified)
```

<Warning>
  **旧エントリーポイントは廃止されました**: Chat Completions（旧 Live Search）の `search_parameters` フィールドは xAI により削除され、410 を返すことが確認されています。既存コードを Responses API のツール形式に移行してください。
</Warning>

## 検証結果 (2026-07-13)

| ツール          | 結果                                                          | Q\&Aごとの検索回数 | レイテンシ |
| ------------ | ----------------------------------------------------------- | ----------- | ----- |
| `web_search` | ✅ 今週のニュースを正確に取得しました（7月8日のGrok 4.5発表告知を正しく見つけました）。ソースの引用付きです | 5           | \~12s |
| `x_search`   | ✅ 指定したXアカウントの最新投稿とスレッド内容を正確に取得しました                          | 24          | \~45s |

<Tip>
  **X検索はGrokの差別化要素です**: X（Twitter）上のリアルタイム投稿、アカウントのアクティビティ、トピックに関する議論を検索します。これは他のベンダーの検索ツールではカバーしないソースです。ソーシャルモニタリング、トレンド追跡、KOL分析に最適です。x\_search は多数の検索ラウンドを実行するため、かなり遅いことに注意してください（実測約45秒）。クライアントのタイムアウトは120秒以上に設定してください。
</Tip>

## クイックスタート

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/responses" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.5",
    "tools": [{"type": "web_search"}],
    "input": "What has xAI announced in the past week? Search and cite sources"
  }'
```

### Python（OpenAI SDK）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "web_search"}],      # for X search use {"type": "x_search"}
    input="What has xAI announced in the past week? Search and cite sources",
)

# 1) Final answer
print(resp.output_text)

# 2) Actual number of searches performed
searches = [i for i in resp.output if i.type == "web_search_call"]
print(f"Performed {len(searches)} searches")

# 3) Server-side tool usage breakdown (for cost auditing)
print(resp.usage.server_side_tool_usage_details)
```

### X 検索例

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "x_search"}],
    input="Search X for the latest posts from the official xAI account and summarize the topics",
)
print(resp.output_text)
```

## レスポンス構造

`output` 配列には、実行順に次の内容が含まれます:

| 項目タイプ             | 意味                                           |
| ----------------- | -------------------------------------------- |
| `reasoning`       | モデルの推論（検索戦略の計画）                              |
| `web_search_call` | 実際に実行された Web 検索 1 回（`x_search` も同様の項目を生成します） |
| `message`         | 本文中の出典引用付きの最終回答                              |

`usage.server_side_tool_usage_details` は、ツールごとの呼び出し回数（`web_search_calls` / `x_search_calls` / `code_interpreter_calls` / `mcp_calls` など）を報告します。コストの照合用に、そちらで記録しておく価値があります。

## 課金

ライブ検索のQ\&Aには、2つのコスト要素があります。

| 項目                   | 補足                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **取得コンテンツのtokenコスト** | 検索結果はモデルのコンテキストに挿入され、モデルの標準入力レートで課金されます。**これが主要なコストです**: ある web\_search のQ\&Aでは、約27Kの入力tokensが計測されました（そのうち約11Kは割引レートでキャッシュヒットしました） |
| **ツール呼び出し料金**        | サーバーサイドのtoolsには、呼び出しごとの料金が発生する場合があります。APIYIのツール料金と、実際の課金明細をご参照ください                                                                 |

<Info>
  x\_search は多くのラウンドを実行し（1回の計測済みQ\&Aで24回の検索）、web\_search よりもそれに応じて高いtoken挿入量とレイテンシーが発生します。想定クエリ量に対してコストを見積もってください。検索回数と`cached_tokens`の両方は、レスポンスのusageで自己監査できます。
</Info>

## 注意事項

1. **Responses API のみ**: Chat Completions 上の `search_parameters` は廃止されています（410）— 使用しないでください。
2. **レイテンシの目安**: web\_search は約 12 秒、x\_search は約 45 秒です（実測値; タスクの複雑さによって変動します）。クライアントのタイムアウトは 120 秒以上に設定してください。
3. **コスト管理**: プロンプトで検索の挙動を制限し（例: 「検索は最大 2 回まで」）、`server_side_tool_usage_details` を監視してください。
4. **実際に検索が行われたことを確認する**: `output` 配列で `web_search_call`（または同等）の項目を確認してください — 本文テキストはあるのに検索項目がない回答は、Web ではなく学習データから生成されています。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Grok 概要" icon="rocket" href="/ja/api-capabilities/grok/overview">
    モデルラインナップ、価格、機能比較表
  </Card>

  <Card title="コード実行 & MCP" icon="terminal" href="/ja/api-capabilities/grok/code-execution-mcp">
    Responses API における他の 2 つのサーバーサイドツール
  </Card>

  <Card title="キャッシュ課金" icon="database" href="/ja/faq/cache-billing">
    検索による大量の input-token 注入は、自動キャッシュと相性が良いです
  </Card>

  <Card title="OpenAI ウェブ検索" icon="sparkles" href="/ja/api-capabilities/openai/web-search">
    比較用の GPT シリーズ向け Web search 利用
  </Card>
</CardGroup>
