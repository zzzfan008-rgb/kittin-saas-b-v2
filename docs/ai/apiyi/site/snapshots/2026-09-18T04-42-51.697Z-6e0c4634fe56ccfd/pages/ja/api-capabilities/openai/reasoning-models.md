> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Compatible Mode: Reasoning Model Output

> /v1/chat/completions における reasoning モデルの動作方法: thinking content（reasoning_content）、thought signatures、構造化出力 — モデル別のテスト結果付き。

推論モデルは、回答する前に「think」します。[互換モード](/ja/api-capabilities/openai/compatible) 経由で呼び出すと、通常のモデルに比べて出力にいくつかの追加要素が含まれます。このページでは 3 つのことを扱います: **推論を取得する方法、マルチターンを扱う方法、構造化出力を信頼性高くする方法。**

<Info>
  このページは `/v1/chat/completions` 互換モードに焦点を当てています。Claude のネイティブな推論ブロック（`thinking` フィールドの `/v1/messages`）については、[Claude Effort & Thinking ガイド](/ja/api-capabilities/claude-effort-thinking) を参照してください。Gemini のネイティブな `thinking_level` と `thought_signature` については、[Gemini Native Calls](/ja/api-capabilities/gemini/native) を参照してください。
</Info>

## 概要

互換モードでは、推論モデルは「thinking text を出力するか」によって3つのグループに分かれます。

| 種類          | 代表モデル                                                 | 思考内容                                | 回答の取得方法                               |
| ----------- | ----------------------------------------------------- | ----------------------------------- | ------------------------------------- |
| 思考を出力しない    | gpt-4.1-mini, gemini-3.1-flash-lite, claude-haiku-4-5 | なし                                  | 通常のモデルと同じ                             |
| 思考テキストを出力する | grok-4.3, qwen3.6-plus, glm-5.1                       | `reasoning_content` フィールド           | 回答は `content`、思考は `reasoning_content` |
| トークンのみ      | gpt-5.4-mini                                          | テキストはなく、`usage.reasoning_tokens` のみ | 通常のモデルと同じ                             |

<Tip>
  種類にかかわらず、**回答は常に `content` です**。`content` だけを読めば、すべての推論モデルは通常のモデルと同じように統合されます。思考を表示したい場合にのみ `reasoning_content` を読んでください。
</Tip>

## Thinking content: reasoning\_content

思考テキストを出力するモデルは、思考の連鎖を `reasoning_content` に、`content` と並行して格納します。

**非ストリーミング** — `message` が両方を含みます:

```json theme={null}
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "1+1 equals 2.",
      "reasoning_content": "The user is asking 1+1 ... (a chain of thought)"
    },
    "finish_reason": "stop"
  }]
}
```

```python theme={null}
msg = resp.choices[0].message
print("answer:", msg.content)
# thinking (only some models; may live in model_extra in the SDK)
print("thinking:", getattr(msg, "reasoning_content", None))
```

**ストリーミング** — まず `delta.reasoning_content` の連続が送られ、`delta.content` は思考が終わってから開始されます。必ず **2つを別々にレンダリング** してください（思考部分を折りたたみ、回答をストリームする）. そうしないと、UI に思考の壁が最初にちらつきます:

```python theme={null}
for chunk in stream:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    reasoning = getattr(delta, "reasoning_content", None)
    if reasoning:
        render_thinking(reasoning)   # collapsible / muted text
    if delta.content:
        render_answer(delta.content) # main answer area
```

<Warning>
  **推論 vs content のストリーム時の「相互排他」は 3 つのモデルで異なります** — 3 つすべてに対応してください:

  * **grok-4.3**: 思考中は `reasoning_content` キーのみが存在し、回答中は `content` のみが存在します（もう一方のキーは単に現れません）。
  * **qwen3.6-plus**: 両方のキーが存在し、非アクティブなほうは `null` です。
  * **glm-5.1**: 思考中は `content` が `""` (空文字列) で、`reasoning_content` に値があります。

  共通の方法: 真偽値チェック（`if reasoning:` / `if content:`）で読み取り、欠落、`null`、`""` の 3 つの空の状態をすべて回避します。
</Warning>

<Note>
  推論 token は回答を圧倒することがあります。テストでは、単純な「1+1」の質問で grok-4.3 が数百の `reasoning_tokens` を出し、回答 token はほんの少しでした。思考は output tokens として課金されるため、**レイテンシとコストに敏感なユースケースで有効化/表示するかを評価してください**。
</Note>

## 思考シグネチャとマルチターン

「thought signature」は **Gemini ネイティブ** の概念です。ネイティブなマルチモーダル / function calling では、モデルが暗号化された `thought_signature` を返し、推論の継続性を保つためにターンをまたいで返し続ける必要があります（[Gemini Native Calls](/ja/api-capabilities/gemini/native) および [Gemini Function Calling](/ja/api-capabilities/gemini/function-calling) を参照）。

**`/v1/chat/completions` 互換モードでは、推論モデルはステートレスです:**

* マルチターンでは、前の assistant ターンの **`content`** をメッセージ履歴に入れるだけで十分です;
* **`reasoning_content` を返し直す必要はなく**、**シグネチャフィールドも応答には表示されません**;
* テストでは、gemini-3.1-flash-lite と grok-4.3 の両方で、`content` のみを返してもマルチターンのコンテキストが正しく維持されました。

```python theme={null}
messages = [
    {"role": "user", "content": "Remember the number 42."},
    {"role": "assistant", "content": "Got it, I'll remember 42."},  # content only
    {"role": "user", "content": "What is that number times 2?"}
]
# grok-4.3 / gemini-3.1-flash-lite both answer 84 correctly
```

<Tip>
  Gemini の thought signatures をターンをまたいで保持する必要がある場合、または Claude のネイティブな思考ブロックをマルチターンで使う場合は、互換モードではなく対応する **ネイティブ** エンドポイントに切り替えてください。
</Tip>

## 構造化出力

`response_format` を使って、モデルに JSON のみを出力させます。種類は 2 つです:

```python theme={null}
# 1) json_schema: strictly constrain fields by schema (OpenAI standard)
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "city_info",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "population": {"type": "integer"},
                "is_capital": {"type": "boolean"}
            },
            "required": ["city", "population", "is_capital"],
            "additionalProperties": False
        }
    }
}

# 2) json_object: only guarantees valid JSON, no field constraints
response_format = {"type": "json_object"}
```

### モデル別サポート（検証済み）

`json_schema` のサポートは大きく異なります — **これが構造化出力における最大の落とし穴です**:

| モデル                   | `json_schema`                                   | `json_object` | `content` を直接パースできますか    |
| --------------------- | ----------------------------------------------- | ------------- | ------------------------ |
| gpt-4.1-mini          | ✅ 厳密に遵守                                         | ✅             | ✅ 純粋な JSON               |
| gemini-3.1-flash-lite | ✅                                               | ✅             | ✅                        |
| grok-4.3              | ✅（thinking も出力します）                              | ✅             | ✅ 内容は純粋な JSON です         |
| gpt-5.4-mini          | ⚠️ JSON は正しいですが、先頭に `<think>…</think>` が付きます    | —             | ❌ 先に think ブロックを削除してください |
| qwen3.6-plus          | ⚠️ 400 を返します: messages には「json」という単語を含める必要があります | ✅             | ✅                        |
| claude-haiku-4-5      | ❌ スキーマを無視して Markdown を返します                      | —             | ❌                        |
| glm-5.1               | ❌ スキーマを無視して、本文を返します                             | ✅             | ✅ json\_object では        |

### モデル間で JSON を確実に取得する

<Warning>
  `json_schema` がすべてのモデルで動作すると想定しないでください。モデル横断での信頼性を高めるには、次を組み合わせます:

  1. `json_object` を優先してください — `json_schema` より互換性が広いです;
  2. プロンプトでは、**「JSON のみを返す」と明示し、「json」という単語を含めてください**（qwen では必須で、他でもより信頼性が高まります）;
  3. **防御的に** パースします: ` ```json ` code fences, strip a `<think>…</think>` prefix, then `json.loads` を取り除き、失敗時は適切にフォールバックします。
</Warning>

````python theme={null}
import json, re

def parse_json_loose(content: str):
    # remove a <think>…</think> prefix (gpt-5.4-mini)
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
    # remove ```json code fences
    content = re.sub(r"^```(json)?|```$", "", content, flags=re.M).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None   # degrade: log raw / retry / switch model
````

## 関連リンク

* 同じグループ: [レスポンスの処理](/ja/api-capabilities/openai/response-handling) · [互換モードの呼び出し](/ja/api-capabilities/openai/compatible) · [関数呼び出し](/ja/api-capabilities/openai/function-calling)
* ネイティブ推論: [Claude の Effort と Thinking ガイド](/ja/api-capabilities/claude-effort-thinking) · [Gemini ネイティブ呼び出し](/ja/api-capabilities/gemini/native)
* モデルと料金: [モデルと料金の概要](/ja/api-capabilities/model-info)
