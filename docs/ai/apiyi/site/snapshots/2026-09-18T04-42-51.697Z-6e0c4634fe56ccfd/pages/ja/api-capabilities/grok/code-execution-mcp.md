> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Code Execution & Remote MCP ガイド

> APIYI における Grok の code_interpreter サーバーサイドコード実行と Remote MCP ツールを、実機で検証しました。Python サンドボックスは実際にコードを実行し、外部 MCP サーバーも正常に接続できます。例とレスポンス構造も含みます。

ライブ検索に加えて、Grok の Responses API には、さらに2つのサーバー側ツールがあります: **コード実行**（`code_interpreter`、サーバー側のPythonサンドボックス）と **Remote MCP**（xAI のサーバーが、あなたが指定した MCP サーバーに直接接続します）。どちらも APIYI で動作確認済みで、デフォルトグループのキーを使用しています（2026年7月13日、UTC+8）。

## Code Execution

このモデルは Python を書き、実際に xAI のサーバーサイドのサンドボックスで実行します — 正確な計算やデータ処理に最適です。テストでは 2 の 100 乗を求めるよう依頼しました。モデルは `print(2 ** 100)` を実行し、正確な値を返しました（純粋な言語モデルではこの手の大整数演算はしばしば誤りが出ますが、コード実行なら正確です）：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "code_interpreter"}],
    input="Compute 2 to the power of 100 exactly, using code",
)
print(resp.output_text)
# 2^100 = 1267650600228229401496703205376

# Inspect the code the model actually ran
for item in resp.output:
    if item.type == "code_interpreter_call":
        print("Executed code:", item.code)
```

単一のコード実行タスクの測定レイテンシ: 約 6 秒。`usage.server_side_tool_usage_details.code_interpreter_calls` は実行回数を記録します。

## リモート MCP ツール

リクエスト内で外部 MCP サーバーを宣言すると、xAI のサーバーが自動的に接続し、そのツールを一覧表示して、必要に応じて呼び出します。ローカルの MCP クライアントは不要です。公開されている MCP サーバーへの接続とツール呼び出しの完了を確認済みです（約16秒）:

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never"
    }],
    input="Use deepwiki to find out what the openai/openai-python repo does, in one sentence",
)
print(resp.output_text)

# Inspect MCP call details
for item in resp.output:
    if item.type == "mcp_call":
        print("Tool:", item.name, "| Output:", item.output[:200])
```

| Parameter          | Notes                                                         |
| ------------------ | ------------------------------------------------------------- |
| `server_label`     | 複数の MCP サーバーを区別するためのラベル                                       |
| `server_url`       | MCP サーバーのアドレス（公開アクセス可能である必要があります — xAI のサーバーが直接接続します）         |
| `require_approval` | `"never"` はツールを自動的に呼び出します。デフォルトでは、2回目のやり取りを必要とする承認リクエストが返されます |

<Warning>
  * **MCP サーバーは公開アクセス可能である必要があります**: 接続元は xAI のサーバーです。イントラネット / localhost のアドレスは使えません。
  * **データセキュリティに注意してください**: 会話内容は xAI のサーバーを経由してその MCP サーバーに送信されます。信頼できるサービスのみを接続してください。
  * 外部サーバーの可用性は APIYI の管理外です。障害が発生した場合は、まずサーバーのステータスを確認してください。
</Warning>

## コレクション検索 (RAG) — 利用不可

xAI も `collections_search`（ナレッジベース検索 / file\_search）ツールを提供しています。**しかし、APIYI では使用できません**。これは、事前に xAI コンソールでファイルをアップロードし、コレクションを構築しておく必要があり、APIYI は上流のコンソールアクセスがない key-pool モードで動作するためです。テストではリクエスト自体は通りますが、検索は必然的に失敗します（`file_search_call` は failed を返します）。

RAG については、自前で検索を構築してください（ベクトルストア + 取得したコンテンツを prompt に注入）。Grok の 1M コンテキストと [自動キャッシュ](/ja/faq/cache-billing) を活用できます。

## よくある質問

<AccordionGroup>
  <Accordion title="複数のツールを一度に宣言できますか？">
    はい。`tools` 配列には `web_search` / `x_search` / `code_interpreter` / `mcp` をまとめて含められます。モデルはタスクごとに呼び出すものを判断します。`usage.server_side_tool_usage_details` はそれぞれ個別にカウントされます。
  </Accordion>

  <Accordion title="コードサンドボックスはネットワークや自分のファイルにアクセスできますか？">
    このサンドボックスは計算処理（Python の数値計算 / データ処理）を対象としており、ローカルファイルにはアクセスできません。外部データについては、web\_search か MCP ツールと組み合わせてください。
  </Accordion>

  <Accordion title="失敗したツール実行も課金されますか？">
    モデル側の推論 tokens は通常どおり課金されます。ツール呼び出し料金は APIYI のツール料金と実際の請求明細に従います — 規模を拡大する前に少量で検証してください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Web & X Search" icon="globe" href="/ja/api-capabilities/grok/web-search">
    同じ Responses API 上のライブ検索ツール
  </Card>

  <Card title="Grok 概要" icon="rocket" href="/ja/api-capabilities/grok/overview">
    モデルラインアップ、価格、完全な機能境界表
  </Card>
</CardGroup>
