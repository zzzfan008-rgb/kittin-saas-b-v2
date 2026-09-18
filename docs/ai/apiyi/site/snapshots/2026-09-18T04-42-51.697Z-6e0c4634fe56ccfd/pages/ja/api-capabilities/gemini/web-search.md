> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini API Web Search ガイド

> ネイティブの generateContent + google_search ツールにより、デフォルトグループのキーでライブのウェブグラウンディングを利用できます。3つの Gemini モデルで検証済みで、OpenAI-compatible モードはこれをサポートしていません。検証方法と課金（$14/1K 検索）も含みます。

このページでは、2026年6月の実地テストで検証済みのAPIYI上のGeminiモデルで、Web検索（Google Search による Grounding）を使用する方法を説明します（3モデル × 2モード × 複数のツール宣言、21件の記録済みリクエスト）。基本的なネイティブ形式のセットアップについては、まず [Gemini Native Calls](/ja/api-capabilities/gemini/native) をご覧ください。

## 要点

**APIYI の Gemini ネイティブエンドポイントは、Google 公式のウェブ検索を完全にサポートしています**: **`/v1beta` generateContent を `google_search` ツール付きで**使用してください。gemini-3.5-flash、gemini-3.1-flash-lite、gemini-3.1-pro-preview は、いずれも実際にウェブを検索し、最新の出典付き情報を返すことが確認されました。**デフォルトグループのキーはそのまま使えます - 特別な有効化は不要です。**

```
Endpoint:  POST https://api.apiyi.com/v1beta/models/{model}:generateContent
Tool:      tools: [{"google_search": {}}]
Models:    gemini-3.5-flash / gemini-3.1-flash-lite / gemini-3.1-pro-preview (verified)
```

<Warning>
  **OpenAI互換モード（`/v1/chat/completions`）はウェブ検索をサポートしていません。** テストでは、`web_search_options`、そのまま渡した `google_search`、および `tools: [{"type": "web_search"}]` の3つの宣言はいずれも HTTP 200 を返しましたが、静かに無視されました。モデルは単に学習データから回答しただけです。「エラーが出ない」ことを「検索できた」とはみなさないでください - 下の確認方法を参照してください。
</Warning>

## 実運用での利用可否（テストデータ、2026-06-11）

| モデル                    | ウェブ結果                    | groundingMetadata | Q\&Aごとの検索回数 | レイテンシ  |
| ---------------------- | ------------------------ | ----------------- | ----------- | ------ |
| gemini-3.5-flash       | ✅ 実際の同週ニュース、複数クエリの相互チェック | ✅ 完全              | 4–7         | 24–45s |
| gemini-3.1-flash-lite  | ✅ 実際の同週ニュース              | ✅（場合によって欠落、注記を参照） | 2           | 約5s    |
| gemini-3.1-pro-preview | ✅ 実際の同週ニュース、深い推論の後の正確な検索 | ✅                 | 1           | 約45s   |

<Tip>
  モデルの選択: **レイテンシ重視で高頻度の呼び出しには gemini-3.1-flash-lite を選びます（約5秒）; 検索の広さと回答品質を重視するなら gemini-3.5-flash を選びます**（複数クエリによる相互検証が可能ですが、推論コストとレイテンシは高めです — 課金を参照してください）。
</Tip>

## クイックスタート

### cURL

```bash theme={null}
curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "content-type: application/json" \
  -H "x-goog-api-key: YOUR_APIYI_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "What important AI news happened in the past week? Search and list 3 items with source URLs."}]}],
    "generationConfig": {"maxOutputTokens": 4096},
    "tools": [{"google_search": {}}]
  }'
```

### Python (google-genai SDK)

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_APIYI_KEY",                     # default group works
    http_options={"base_url": "https://api.apiyi.com"},  # note: no /v1
)

resp = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="What important AI news happened in the past week? Search and list 3 items with source URLs.",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        max_output_tokens=4096,
    ),
)

# 1) Final answer text
print(resp.text)

# 2) Grounding evidence: executed queries and sources
gm = resp.candidates[0].grounding_metadata
if gm:
    print("Queries:", gm.web_search_queries)
    for chunk in gm.grounding_chunks or []:
        print("Source:", chunk.web.title, chunk.web.uri)
else:
    print("⚠️ No web search was triggered in this call")
```

### 検索が実際に実行されたことを確認する方法

成功すると、`candidates[0].groundingMetadata` には以下のフィールドが含まれます。**これらが存在しない場合、検索は実行されていません**:

| フィールド               | 意味                                                  |
| ------------------- | --------------------------------------------------- |
| `webSearchQueries`  | モデルが実際に実行した検索クエリの配列（配列の長さ = 検索回数）                   |
| `groundingChunks`   | 取得したソース（URI + タイトル）                                 |
| `groundingSupports` | 回答テキストのセグメントとソースの対応付け（startIndex/endIndex）          |
| `searchEntryPoint`  | 必要な Google Search Suggestions をレンダリングするための HTML/CSS |

コントロールグループの参照: 同じ質問をツールなしで尋ねると、モデルは一貫して「私の知識は 2025 年 1 月で終わっているため、最新ニュースは提供できません」と回答しました。ツールありでは、学習のカットオフ後に実際に起きた出来事を正確に報告しました。

## 課金（重要）

Web search にはツール呼び出し料金が発生し、2つの要素で構成されます:

| 項目                  | 料金                                             | 備考                                                                                                                                                                                                                                                   |
| ------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ツール呼び出し料金**       | **\$14 / 1,000 searches** (\$0.014 per search) | **ツール名: `google_search`**; 実際に実行された検索回数に応じて課金されます。つまり `groundingMetadata.webSearchQueries` の長さに基づきます — 1つの質問で複数回の検索が発生する場合があります（測定値: pro-preview 1、flash-lite 2、3.5-flash 4–7）                                                                       |
| **Model token fee** | 標準のモデル料金                                       | OpenAI の web search とは異なり、取得されたコンテンツは input tokens として注入されません（promptTokenCount はほぼ同じままで、測定値は 31–43 tokens です）。コストの大半は **thinking + output tokens** です（3.5-flash での1回の deep web-grounded Q\&A では 3,500–4,900 thought tokens を消費し、output rate で課金されます） |

<Info>
  Web を根拠にした Q\&A 1回あたりの参考総コスト（search fee + tokens）: flash-lite ≈ \$0.03; 3.5-flash ≈ \$0.08–0.16; 3.1-pro-preview ≈ \$0.06。コストを抑えるには、prompt で検索動作を制限する（例: 「検索は最大2回まで」）か、検索回数が少ない model を選んでください。
</Info>

<Tip>
  **料金が免除される場合があります**: 公式 Gemini API には無料の検索クォータがあります（Gemini 3 シリーズ: 月5,000 prompt まで無料、その後は \$14/1K searches）。上流の call が無料クォータ内に収まる場合、その call の search fee は免除されることがあります（testing では search fee が発生しない call 全体を確認しました）。料金が請求される場合は、上の表に従います。コンソールの課金詳細が正です。
</Tip>

## 注意事項

1. **ネイティブエンドポイントを使用する必要があります**: OpenAI互換モードでのすべての search 宣言は、エラーなく黙って無視されます。OpenAI-SDK プロジェクトでは、google-genai SDK に切り替えてください（`base_url` を `https://api.apiyi.com` に設定し、`/v1` は使わないでください）。
2. **groundingMetadata を真実のソースとして扱ってください**: テストでは、flash-lite が時々（4回に1回）groundingMetadata を返さないことがありました。厳密なシナリオでは、フィールドの存在を検証し、欠けている場合は再試行してください。
3. **thinking モデルには十分な `maxOutputTokens` を与えてください**（少なくとも 4096 を推奨します）: 3.5-flash / 3.1-pro-preview は grounding 時に 1,900～4,900 の thinking token を消費します。上限が小さいと回答が途中で切れます。
4. `{"google_search": {}}` と camelCase の `{"googleSearch": {}}` の両方が使えます。旧式の `google_search_retrieval` は Gemini 1.5 時代のものです — 現在のすべてのモデルでは `google_search` を使用してください。
5. Web search は、URL Context などの他のツールと組み合わせることができます（Google 公式ドキュメント: `ai.google.dev/gemini-api/docs/google-search`）。

## FAQ

**Q: 答えが本当にウェブを使ったものか、どう確認できますか?**

A: `candidates[0].groundingMetadata` が存在し、`webSearchQueries` が空でなく、`groundingChunks` にソースURIが含まれていることを確認してください。これらの項目がなく、答えのテキストだけがある場合は、モデルが訓練データから回答したことを意味します。

**Q: 別のグループや特別なキーは必要ですか?**

A: いいえ。Geminiモデルでは、デフォルトグループのキーでウェブ検索を直接呼び出せます（OpenAI の web search と同じです。Claude のネイティブ検索とは異なり、こちらは ClaudeOfficial のベータグループが必要です）。

**Q: 検索回数はどう確認しますか。また、モデルによって変わりますか?**

A: `groundingMetadata.webSearchQueries` の長さを数えてください。同じ質問でもかなり変わります。pro-preview は 1、flash-lite は 2、3.5-flash は 4〜7 です。

**Q: どのモデルが対応していますか?**

A: gemini-3.5-flash、gemini-3.1-flash-lite、gemini-3.1-pro-preview は確認済みです。その他の Gemini 2.5+ モデルも、原則として `google_search` ツールをサポートしているはずです。ただし、依存する前に上の FAQ の確認手順を実行してください。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Gemini ネイティブ呼び出し" icon="sparkles" href="/ja/api-capabilities/gemini/native">
    google-genai SDK のセットアップ、ストリーミング、thinking 制御
  </Card>

  <Card title="Gemini 関数呼び出し" icon="wrench" href="/ja/api-capabilities/gemini/function-calling">
    カスタムツール呼び出し、ウェブ検索と組み合わせ可能
  </Card>
</CardGroup>
