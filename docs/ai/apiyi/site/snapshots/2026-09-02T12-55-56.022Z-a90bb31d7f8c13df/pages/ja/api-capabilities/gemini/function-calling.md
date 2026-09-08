> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 関数呼び出しガイド

> function_declarations の定義、AUTO/ANY/NONE モード、function_response の返り値、および Gemini 3 の thought-signature 要件。

Gemini のネイティブ形式は Function Calling を完全にサポートしています。モデルが「どの関数か + どの引数か」を出力し、ローカルで実行して結果を返すと、モデルが最終回答を生成します。このループは [OpenAI's FC](/ja/api-capabilities/openai/function-calling) と同じですが、**フィールド形式は完全に異なる**ため、混在はできません。

このページは、公式 Google ドキュメント（`ai.google.dev/gemini-api/docs/function-calling`、2026 年 6 月時点）をもとにしています。

## OpenAI とのフォーマットの違い

|            | Gemini ネイティブ                                                        | OpenAI                                                      |
| ---------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| ツール定義      | `tools: [{"function_declarations": [...]}]`                         | `tools: [{"type": "function", ...}]`                        |
| 呼び出し出力     | `function_call` の part 内（`name` + `args` オブジェクト）                    | `tool_calls` / `function_call` item（`arguments` は JSON 文字列） |
| 結果の返却      | `Part(function_response=...)`                                       | `role:"tool"` message / `function_call_output` item         |
| 呼び出し戦略     | `tool_config.function_calling_config.mode`: `AUTO` / `ANY` / `NONE` | `tool_choice`: `auto` / `required` / `none`                 |
| マルチターン推論状態 | **Gemini 3 は thought signatures を返す必要があります**                        | そのような要件はありません                                               |

よくあるミス: Gemini の `function_call.args` は **構造化オブジェクト** であり、JSON 文字列ではありません — `json.loads` は不要です。

## 全体の呼び出しループ

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

# 1. Define tools
tools = [{
    "function_declarations": [{
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. Beijing"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city"]
        }
    }]
}]

# 2. First request: the model decides to call
contents = [types.Content(role="user", parts=[types.Part(text="How hot is it in Beijing right now?")])]

r1 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)

call = r1.candidates[0].content.parts[0].function_call
print(f"Model wants: {call.name}, args: {dict(call.args)}")

# 3. Execute locally (fake data standing in for a real lookup)
weather = {"city": call.args["city"], "temp": 26, "condition": "sunny"}

# 4. Return the result: append the model's reply (function_call + thought signature)
#    and the function result to the history
contents.append(r1.candidates[0].content)
contents.append(types.Content(
    role="user",
    parts=[types.Part(
        function_response=types.FunctionResponse(name=call.name, response=weather)
    )]
))

r2 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)
print(r2.text)
```

<Warning>
  **Gemini 3 の thought signatures は返却する必要があります**: `function_call` の部分には暗号化された `thought_signature` が含まれており、2 回目のリクエストでは **モデルの返信 Content 全体を履歴内で変更せずそのまま含める** 必要があります（上の手順 4）。署名が欠けると reasoning チェーンが壊れ、リクエストが失敗することがあります。公式の `google-genai` SDK は上記のパターンを自動的に処理するため、手書きの REST 呼び出しでそのフィールドを削除しないでください。
</Warning>

## 呼び出しモード

```python theme={null}
config = {
    "tools": tools,
    "tool_config": {"function_calling_config": {"mode": "AUTO"}}
}
```

| モード               | 動作                                                    |
| ----------------- | ----------------------------------------------------- |
| `AUTO` (推奨のデフォルト) | モデルが呼び出すかどうかを決定します                                    |
| `ANY`             | 関数呼び出しを強制します。制限するには `allowed_function_names` と組み合わせます |
| `NONE`            | 呼び出しなし — テキストのみ                                       |

```python theme={null}
# Force get_weather only
config = {
    "tools": tools,
    "tool_config": {
        "function_calling_config": {
            "mode": "ANY",
            "allowed_function_names": ["get_weather"]
        }
    }
}
```

## 並列およびマルチステップ呼び出し

* **並列**: 1回のターンで複数の `function_call` 部分（例: 2つの都市を同時に取得）を返す場合があります。それぞれを実行し、すべての `function_response` 部分をまとめて返します
* **マルチステップ**: モデルは「呼び出し → 結果を確認 → 再度呼び出し」を連鎖できます。応答にこれ以上 `function_call` がなくなるまでループします。暴走した費用を防ぐため、ループには上限を設けます

```python theme={null}
# Generic agent loop skeleton
MAX_ROUNDS = 5
for _ in range(MAX_ROUNDS):
    response = client.models.generate_content(
        model="gemini-3.5-flash", contents=contents, config={"tools": tools}
    )
    parts = response.candidates[0].content.parts
    calls = [p.function_call for p in parts if getattr(p, "function_call", None)]
    if not calls:
        print(response.text)  # no more calls — final answer
        break

    contents.append(response.candidates[0].content)  # includes thought signatures
    result_parts = [
        types.Part(function_response=types.FunctionResponse(
            name=c.name, response=execute(c.name, dict(c.args))
        ))
        for c in calls
    ]
    contents.append(types.Content(role="user", parts=result_parts))
```

## ベストプラクティス

* **説明はモデル向けに書きます**: 「いつ呼び出すか」を明確にし、自由形式の文字列ではなく `enum` でパラメータを絞り込みます
* **ツール定義は安定させます**: これらはキャッシュのプレフィックス一致に関与するため、変更が多いと [キャッシュヒット](/ja/api-capabilities/gemini/prompt-caching) が悪化します
* **外部ツールではなく、決定的な JSON 出力が必要ですか?** FC の代わりに `response_schema` 構造化出力を検討してください（[Native Calls](/ja/api-capabilities/gemini/native) のパラメータ表を参照）
* サンドボックス化された計算には、自作の計算機能を作る代わりに、組み込みの [code\_execution](/ja/api-capabilities/gemini/multimodal) ツールを使ってください

## よくある落とし穴

| 症状                           | 対処法                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| 2回目のやり取りでエラー / 矛盾する回答        | モデルの応答（thought signatures 付き）をそのまま追記していませんでした — `candidates[0].content` 全体をそのまま追記してください |
| `json.loads` on `args` が失敗する | Gemini の `args` は string ではなく object です — `dict(call.args)` を使ってください                    |
| モデルが関数を呼び出しません               | 説明をより具体的にするか、`mode: "ANY"` で強制してください                                                    |
| OpenAI-style tools 定義が拒否される  | 2つの形式は混在できません — 上記のとおり `function_declarations` に書き直してください                               |

## 関連リンク

* このグループ: [Native Calls](/ja/api-capabilities/gemini/native) · [Multimodal & Code Execution](/ja/api-capabilities/gemini/multimodal) · [Cache Billing](/ja/api-capabilities/gemini/prompt-caching)
* OpenAI の対応項目: [OpenAI Function Calling](/ja/api-capabilities/openai/function-calling)
* 公式 Google ドキュメント: `ai.google.dev/gemini-api/docs/function-calling`
