> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API Web検索ガイド

> デフォルトグループ（AWS Claude）はネイティブの web_search ツールをサポートしていません。実証済みの選択肢は2つあります。ClaudeOfficial ベータグループ、またはカスタム検索ツールです。

このページでは、APIYI 上の Claude モデルでウェブ検索を行う 2 つの実現方法を、2026年6月の実地検証に基づいて説明します。チャンネル、課金、基本設定については、まず [Claude API 基本](/ja/api-capabilities/claude) をご覧ください。

## 要点

**APIYI のデフォルトの Claude グループは公式 AWS Claude (Amazon Bedrock) にルーティングされ、AWS 自体は Claude のネイティブウェブ検索をサポートしていません** — これはゲートウェイ設定の問題ではなく、Bedrock のアーキテクチャ上の制約です。ウェブアクセスを得るには、2つの選択肢があります:

| パス                                                         | 最適な用途                                         | 安定性                         |
| ---------------------------------------------------------- | --------------------------------------------- | --------------------------- |
| **選択肢 1: ClaudeOfficial ベータグループ** (ネイティブ `web_search` ツール) | Anthropic のネイティブ検索体験が必要で、ベータレベルの安定性を受け入れられる場合 | ⚠️ ベータ版で、デフォルトのグループより安定性が低い |
| **選択肢 2: カスタム検索ツール** (デフォルトのグループで動作、推奨)                    | 安定性と制御が必要な本番ワークロード                            | ✅ デフォルトのグループと同じ階層           |

<Warning>
  **よくある落とし穴**: デフォルトのグループで `web_search` ツールを使ってリクエストしても、**エラーは発生しません** — ゲートウェイはそれを適切に処理し、リクエストは HTTP 200 を返しますが、検索は行われず、モデルは学習データだけをもとに応答します。「エラーがない」ことを「検索が動作した」とは見なさないでください。確認方法は末尾の FAQ を参照してください。
</Warning>

## なぜデフォルトグループではサポートされないのですか？

Claude の `web_search` / `web_fetch` は **サーバーサイドのツール** です。検索は Anthropic 独自のサーバーインフラで実行されます。AWS Bedrock はモデル推論のみを提供しており、そのような検索バックエンドはないため、Bedrock インターフェースはバリデーション層でこれらのツールを拒否します。Bedrock のツールタイプの許可リストに含まれるのは、クライアントサイドのツールのみです。

```
bash_20250124, custom, memory_20250818, text_editor_*(20250124/0429/0728),
tool_search_tool_bm25(_20251119), tool_search_tool_regex(_20251119)
```

同様に、Anthropic の **MCP Connector（`mcp_servers` パラメータ）** もサーバーサイド機能であり、デフォルトグループではサポートされません。

## オプション 1: ClaudeOfficial ベータグループ（ネイティブ web\_search）

APIYI には **ClaudeOfficial**（Anthropic の公式チャネルに直接接続）というベータグループがあり、Claude のネイティブ `web_search` / `web_fetch` ツールをサポートしています。

<Info>
  * **有効化方法: カスタマーサポートに連絡**して、キーを ClaudeOfficial グループに追加してもらってください
  * **安定性の注意**: これはベータグループのため、デフォルトグループより安定性が低くなります — 重要なワークロードではフォールバックを用意してください（オプション 2 をフォールバックとして使うとよいです）
</Info>

### リクエスト例

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_APIYI_KEY(ClaudeOfficial group)" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 2048,
    "tools": [{"type": "web_search_20260209", "name": "web_search"}],
    "messages": [{"role": "user", "content": "What new models has Anthropic released recently? Search and cite sources."}]
  }'
```

ツールバージョン:

| ツール       | 種類                                            | 備考                       |
| --------- | --------------------------------------------- | ------------------------ |
| ウェブ検索（推奨） | `web_search_20260209`                         | 動的フィルタリング付き、4.6 以降のモデル向け |
| ウェブ検索（基本） | `web_search_20250305`                         | それ以前のモデルと互換性があります        |
| ウェブ取得     | `web_fetch_20260209`（旧: `web_fetch_20250910`） | 指定した URL からコンテンツを取得します   |

オプションパラメータ: `max_uses`（検索回数を制限します）、`allowed_domains` / `blocked_domains`（ドメインフィルタリング）。

### 検索が実際に実行されたかを確認する方法

成功したレスポンスには `server_tool_use` と `web_search_tool_result` のブロックが `content` に含まれ、回答テキスト内に引用があり、`usage` にカウンターフィールドがあります:

```json theme={null}
"usage": {
  "server_tool_use": { "web_search_requests": 2 }
}
```

レスポンスに `text` ブロックしかなく、`usage` に `server_tool_use` がない場合、そのリクエストは検索対応チャネルに到達していません。

### 課金

* **ツール名: `web_search`, `web_fetch`**
* web\_search: **\$10 / 1,000 searches**（\$0.01 / search、`usage.server_tool_use.web_search_requests` によってカウントされます — 1 回の回答で複数回の検索が発生する場合があります）に加えて通常の token 料金がかかります。失敗した検索は課金されません
* web\_fetch: 呼び出しごとの料金はありません。取得したコンテンツは input token として課金されます
* web 対応 Q\&A あたりの参考コスト（sonnet）: 約 \$0.02–0.08

## Option 2: カスタム検索ツール（デフォルトグループで動作、実運用に推奨）

デフォルトグループ（Bedrock）は、標準の関数呼び出し（カスタムツール）を**完全にサポート**しています。検索ツールを定義し、クライアント側で実際の検索（Tavily / Brave / Serper / Bing などの検索 API 経由）を実行して、その結果をモデルに返してください。テストでは、Claude が積極的にツールを呼び出し、中国語と英語の両方でクエリを書き換え、複数回の検索ラウンドの後に出典付きの回答を生成しました。

### 完全な例（Python）

```python theme={null}
import requests

API_KEY = "YOUR_APIYI_KEY"  # default group works
URL = "https://api.apiyi.com/v1/messages"
HEADERS = {
    "content-type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
}

SEARCH_TOOL = {
    "name": "web_search",
    "description": ("Search the web for current information. Call this whenever "
                    "the user asks about recent events or anything after your "
                    "knowledge cutoff. You may call it multiple times."),
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "Search keywords"}},
        "required": ["query"],
    },
}

def do_search(query: str) -> str:
    """Call your search API of choice (Tavily/Brave/Serper, etc.) and return result text."""
    # Tavily example:
    # r = requests.post("https://api.tavily.com/search",
    #                   json={"api_key": TAVILY_KEY, "query": query, "max_results": 5})
    # return "\n".join(f"- {x['title']}\n  {x['url']}\n  {x['content'][:200]}"
    #                  for x in r.json()["results"])
    ...

messages = [{"role": "user", "content": "What new models has Anthropic released recently? Search, then answer with sources."}]

for _ in range(5):  # tool loop, up to 5 rounds
    resp = requests.post(URL, headers=HEADERS, json={
        "model": "claude-sonnet-4-6",
        "max_tokens": 2048,
        "tools": [SEARCH_TOOL],
        "messages": messages,
    }, timeout=180).json()

    if resp.get("stop_reason") != "tool_use":
        print(next(b["text"] for b in resp["content"] if b["type"] == "text"))
        break

    messages.append({"role": "assistant", "content": resp["content"]})
    results = [{"type": "tool_result", "tool_use_id": b["id"],
                "content": do_search(b["input"]["query"])}
               for b in resp["content"] if b["type"] == "tool_use"]
    messages.append({"role": "user", "content": results})
```

### コストの参考

* モデルの token 料金: 1 回の複数ラウンド検索 Q\&A では、おおよそ 10k 入力 + 1–2k 出力 tokens を使用します（Sonnet では約 \$0.05）
* 検索 API 料金: Tavily の無料枠は月 1,000 回で、従量課金は 1 回あたり約 \$0.008、Brave は 1,000 回あたり \$3 です。いずれも公式 web\_search と同程度の水準です
* メリット: チャネル非依存で、検索ソースを制御・キャッシュ可能であり、デフォルトグループの安定性とキャッシュ課金のメリットも維持できます

### 発展編: MCP 検索ソース

すでに MCP エコシステム（例: Tavily MCP、Brave MCP）を使っている場合は、**クライアント側**で MCP サーバーに接続し、そのツールを上記のカスタムツールへ変換してください。原理は同じです。注意: リクエスト内で `mcp_servers` パラメータを直接渡す方法（サーバー側 MCP）は、デフォルトグループでは**利用できません**。

## FAQ

**Q: デフォルトグループに `web_search` ツールを送信したのにエラーが出ませんでした。これはサポートされているということですか？**

A: いいえ。デフォルトグループはサーバーツールを問題なく処理しますが、無視します。リクエストは 200 を返しますが、検索は実行されません。確認するには、レスポンス `content` に `server_tool_use` ブロックが含まれているか、また `usage` に `server_tool_use.web_search_requests` フィールドがあるかを確認してください。なければ、検索は実行されていません。

**Q: `mcp_servers` パラメータを渡すのはどうですか？**

A: これもサポートされていません（これは Anthropic のサーバーサイド機能でもあります）。重要: この場合、モデルが回答本文に見た目だけもっともらしい「ツール結果」テキストを生成することがありますが、それは幻覚であり、実データではありません。依存しないでください。

**Q: 2 つの विकल्पはどうやって選べばよいですか？**

A: 本番環境では、Option 2（安定的で制御しやすい）を優先してください。Anthropic のネイティブな検索品質や引用形式が必要な場合、または自前で検索を実装したくない場合は、カスタマーサポートに連絡して ClaudeOfficial ベータグループを有効化してください。そして、フォールバックを用意しておいてください。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Claude API の基本" icon="sparkles" href="/ja/api-capabilities/claude">
    チャネル、モデル一覧、セットアップ、課金の基本
  </Card>

  <Card title="Claude プロンプトキャッシュ" icon="database" href="/ja/api-capabilities/claude-prompt-caching">
    複数ターンの検索 Q\&A はキャッシュと相性がよく、大幅なコスト削減につながります
  </Card>
</CardGroup>
