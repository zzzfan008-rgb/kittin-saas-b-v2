> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI API Web Search ガイド

> Responses API + web_search ツールは、デフォルトグループのキーでライブな Web アクセスを提供します。gpt-5.5 / gpt-5.4 は、実際の検索と出典付きソースで検証済みで、課金も含まれています。

このページでは、2026年6月に実際にテストして検証した、APIYI で GPT モデルと web search を使う方法を説明します。

## 要点

**APIYI は OpenAI の公式ウェブ検索を完全にサポートしています**: **Responses API (`/v1/responses`) と `web_search` ツール**を使用してください。gpt-5.5 と gpt-5.4 の両方で、実際にウェブを検索し、出典の引用付きで最新情報を返すことが確認済みです。**default-group のキーはそのまま使えます — 特別な有効化は不要です。**

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tool:      tools: [{"type": "web_search"}]
Models:    gpt-5.5 / gpt-5.4 (verified)
```

## 実運用での利用可能性（テストデータ、2026-06-11）

| モデル     | Web結果                                     | 引用                     | Q\&Aごとの検索回数 | レイテンシ |
| ------- | ----------------------------------------- | ---------------------- | ----------- | ----- |
| gpt-5.4 | ✅ 同週のニュースを正確に取得                           | ✅ 構造化された url\_citation | 1           | \~11s |
| gpt-5.5 | ✅ 同週のニュースを正確に取得（自動の時間範囲スコープ設定、複数ソースの相互確認） | ✅ 構造化された url\_citation | \~8         | \~51s |

<Tip>
  モデルの選択: **速度とコスト重視なら gpt-5.4 を、網羅性と厳密さ重視なら gpt-5.5 を選んでください**（検索ラウンドが増え、取得コンテンツの注入量も大きくなるため、コストとレイテンシが高くなります — 課金セクションを参照してください）。
</Tip>

## クイックスタート

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "content-type: application/json" \
  -H "authorization: Bearer YOUR_APIYI_KEY" \
  -d '{
    "model": "gpt-5.4",
    "max_output_tokens": 8192,
    "tools": [{"type": "web_search"}],
    "input": "What new models has Anthropic released in the past week? Search and include source links."
  }'
```

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_APIYI_KEY",         # default group works
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="gpt-5.4",                  # or gpt-5.5
    max_output_tokens=8192,           # recommend >=8k; gpt-5.5 uses many reasoning tokens, too small -> incomplete
    tools=[{"type": "web_search"}],
    input="What new models has Anthropic released in the past week? Search and include source links.",
)

# 1) Final answer text
print(resp.output_text)

# 2) Actual number of searches in this call (billing basis, see below)
search_calls = [item for item in resp.output if item.type == "web_search_call"]
print(f"Searches in this call: {len(search_calls)}")

# 3) Source citations (structured url_citation)
for item in resp.output:
    if item.type == "message":
        for content in item.content:
            for ann in getattr(content, "annotations", []) or []:
                print(f"Source: {ann.title} | {ann.url}")
```

### レスポンス構造

`output` 配列には、実行順に次が含まれます:

| item type         | 意味                                                                  |
| ----------------- | ------------------------------------------------------------------- |
| `web_search_call` | 実際に実行された検索 1 件（**課金ではこれらのエントリがカウントされます**）                           |
| `reasoning`       | モデルの推論プロセス（gpt-5 シリーズ）                                              |
| `message`         | 最終回答。その `content[].annotations` には `url_citation`（タイトル + URL）が含まれます |

`status: "completed"` は正常に終了したことを意味します。`incomplete` は通常、`max_output_tokens` が小さすぎたことを意味します — 増やしてください。

## 課金（重要）

Web 検索には 2 つの内訳からなるツール呼び出し料金が発生します:

| 項目                    | 価格                              | 備考                                                                                                                                         |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **ツール呼び出し料金**         | **\$10 / 1,000 回** (\$0.01 / 回) | **ツール名: `web_search`**; レスポンス `output` 内の `web_search_call` エントリ数でカウントされます — 1 回の質問で複数回の検索が発生する場合があります (gpt-5.4 は通常 1 回、gpt-5.5 は通常 5–8 回) |
| **取得コンテンツの token 料金** | 標準のモデル入力価格                      | 検索結果はモデルのコンテキストに注入され、入力 tokens として課金されます。**通常はこちらのほうが大きな割合を占めます**: gpt-5.4 では Q\&A あたり約 9k の入力 token、gpt-5.5 では 48–54k で測定されています           |

<Info>
  Web 対応の Q\&A 1 回あたりの実測総コスト: gpt-5.4 は検索料金 ≈ \$0.01 + 9k tokens、gpt-5.5 は検索料金 ≈ \$0.08 + 約 50k tokens です。想定されるクエリ量に照らして見積もってください。
</Info>

## 注意事項

1. **Responses API を使用してください — Chat Completions の `web_search_options` は使用しないでください**: gpt-5 シリーズのモデルはそのパラメータをサポートしていません（OpenAI の公式な挙動で、400 `Unknown parameter: 'web_search_options'` を返します）。`web_search_options` は専用の `*-search-preview` モデルにのみ適用されます。
2. **`max_output_tokens` は少なくとも 8192 に設定してください**: gpt-5.5 は多くの reasoning tokens を消費します。小さい上限では最終回答なしで `status: "incomplete"` が返り、tokens は引き続き課金されます。
3. 従来のツールタイプ `web_search_preview` も同じ挙動で利用できます。新しい統合では、`web_search` を直接使用してください。
4. コストを抑えるには、プロンプトで検索動作を制約するか（たとえば「最大 2 回まで検索する」）、gpt-5.4 を使用してください。

## FAQ

**Q: 回答が本当にウェブを使ったものか、どう確認できますか？**

A: レスポンス `output` に `type="web_search_call"` を含む項目があるか、また `message` の注釈に `url_citation` が含まれているかを確認してください。両方がそろっていれば実際のウェブアクセスです。これら 2 つのマーカーがなく、回答文だけがある場合は、モデルが学習データから答えています。

**Q: 別のグループや特別なキーは必要ですか？**

A: いいえ。OpenAI モデルでは、デフォルトグループのキーでウェブ検索を直接呼び出せます。

**Q: どのモデルがサポートされていますか？**

A: gpt-5.5 と gpt-5.4 は検証済みです。ほかの gpt-5 シリーズのモデルも、原則として Responses API `web_search` ツールをサポートしているはずです。依存する前に、上の FAQ にある検証チェックを実行してください。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="OpenAI ネイティブ呼び出し (Responses API)" icon="sparkles" href="/ja/api-capabilities/openai/native">
    Responses API のエンドポイント、パラメータ、設定
  </Card>

  <Card title="OpenAI プロンプトキャッシュ" icon="database" href="/ja/api-capabilities/openai/prompt-caching">
    ウェブ検索によって挿入される大量の input token は、キャッシュと相性が良いです
  </Card>
</CardGroup>
