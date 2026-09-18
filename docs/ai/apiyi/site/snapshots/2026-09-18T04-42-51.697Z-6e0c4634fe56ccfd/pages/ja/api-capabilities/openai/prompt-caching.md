> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI プロンプトキャッシュ課金ガイド

> OpenAI のキャッシュは完全自動で、上乗せなし、書き込みは無料です。キャッシュされた入力は入力価格の 10% で課金されます。ヒットするリクエストの書き方と、cached_tokens の読み方を説明します。

gpt-5シリーズでエージェント、マルチターンチャット、またはバッチ文書ジョブを実行する場合、プロンプトキャッシュによって入力料金のキャッシュ対象部分が通常価格の\*\*10%\*\*になります。しかも、**コード変更は一切不要**で、キャッシュは完全に自動で動作します。

このページは OpenAI の公式ドキュメント（`developers.openai.com/api/docs/guides/prompt-caching`、2026年6月時点）をもとにしており、例は APIYI 向けに調整されています。

## 1文での要約

あるリクエストの**先頭セグメント（prefix）が直近のリクエストと完全一致し、かつ長さが1024 token以上である場合**、サーバーは再処理をスキップします。一致した部分の課金は\*\*0.1×\*\*となり、レイテンシは最大80%短縮されます。

Claude のキャッシュとの主な違いは 2 つです。

* **マーカーなし**: `cache_control` のようなものはなく、条件を満たすと自動的にキャッシュが有効になります
* **書き込み料金なし**: Claude は書き込みに 1.25× / 2× を課金しますが、OpenAI は無料で書き込みます

## わざわざ使う理由 — 課金倍率

モデルの生の入力 token 価格を **1×** とすると:

| 種類            | 価格         | 備考                |
| ------------- | ---------- | ----------------- |
| 通常入力          | **1×**     | 未一致部分、通常料金        |
| キャッシュ書き込み     | **0×（無料）** | 自動的に発生し、費用はかかりません |
| **Cache hit** | **0.1×**   | 一致部分は90%オフ        |

**損益分岐点: 2回目のリクエストです。** 償却する書き込みコストがないため、接頭辞を再利用するたびにそのまま節約になります。Claude のように最初に 1.25× を支払い、損益分岐点に達するまで2回の再利用が必要な方式よりもシンプルです。

APIYI の現在の料金（100万 token あたり）では:

| モデル                 | 通常入力   | Cache hit   |
| ------------------- | ------ | ----------- |
| `gpt-5.4`           | \$2.50 | **\$0.25**  |
| `gpt-5.4-mini`      | \$0.75 | **\$0.075** |
| `gpt-5.5`           | \$5.00 | **\$0.50**  |
| `gpt-5.1` / `gpt-5` | \$1.25 | **\$0.125** |

### 相性が良いケース

* 長いシステム prompt + ツール定義を呼び出し間で再利用する場合（エージェント、サポートボット）
* 複数ターンの会話（新しい各ターンで、それ以前の履歴すべてに自動でヒットします）
* 1つのドキュメントをバッチ処理する場合（1つの契約について50個の質問をするなど）
* prompt の先頭に安定したドキュメントチャンクを置く RAG

### 相性が悪いケース

* 最初の文字からして異なるリクエスト
* 合計 1024 token 未満の prompt（キャッシュのしきい値未満）

## ヒットするための3つの厳しい条件

3つすべてが必要です。

### 1. 少なくとも1024 tokensのプレフィックス

1024 tokens未満のリクエストは**決して**キャッシュされません（エラーは出ず、静かに適用されません）。1024を超えると、ヒットは**128-token刻み**で伸びます。つまり、照合された長さは1024、1152、1280 …のような段階に乗るため、`cached_tokens`は通常、安定したプレフィックス全体より少し短くなります。これは正常です。

### 2. バイト単位で完全に一致するプレフィックス

キャッシュは**プレフィックス一致**です。比較は最初の文字から始まり、最初の差分で止まります。タイムスタンプ、ユーザー名、JSONキーの順序など、どんな変更でも、その後ろはすべて通常料金で課金されます。

**実践ルール: 安定した内容を先に、変動する内容を最後に置きます。**

```python theme={null}
# ❌ Wrong: dynamic content at the start of system — prefix changes every time, never hits
messages = [
    {"role": "system", "content": f"Current time {datetime.now()}. You are an assistant." + long_instructions},
    {"role": "user", "content": question},
]

# ✅ Right: long instructions and tool definitions stay stable up front; dynamic bits go last
messages = [
    {"role": "system", "content": long_instructions},          # stable — will hit
    {"role": "user", "content": f"Current time {datetime.now()}. {question}"},  # volatile — last
]
```

### 3. 保持期間内に再利用すること

* 基本保持期間: アイドル状態が**5〜10分**で削除され、最大でも1時間
* **2026年5月29日 (UTC) 以降**、gpt-5.1 以降のモデル（proバリアントを含む）は、非ZDR組織向けに追加料金なしで**24時間の拡張保持**（`prompt_cache_retention: "24h"`）をデフォルトで使用します。同日内の再利用は実質的に常にヒットします

## 最小動作例

同じ長いプレフィックスを異なる質問で 2 回送信してください。1 回目の書き込みは自動で、2 回目はヒットします:

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# Must be long enough: at least 1024 tokens (~750+ English words)
LONG_SYSTEM = open("long_instructions.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="gpt-5.4",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("Summarize the key points", "1st")   # expect cached=0
ask("Give 3 keywords", "2nd")            # expect cached ≈ prefix length
```

期待される出力:

```text theme={null}
[1st] input=2330 cached=0
[2nd] input=2335 cached=2304
```

2 回目の呼び出しの `cached` は system prompt の長さに近く（128 に丸めた値）、その部分は 10% で課金されます。

<Info>
  `/v1/responses` エンドポイントも自動でキャッシュします; フィールドは `usage.input_tokens_details.cached_tokens` です。OpenAI の社内テストでは、Responses 上の cache 利用率は Chat Completions より 40%–80% 高くなっています — マルチターンのエージェントでは、[Native Calls](/ja/api-capabilities/openai/native) を優先してください。
</Info>

## ヒットしましたか？使用量フィールドを確認する

| エンドポイント                | ヒットフィールド                                    |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

**`cached_tokens > 0` は節約できていることを意味します**: その部分は0.1倍で課金され、残りの `prompt_tokens - cached_tokens` は通常料金で課金されます。

## 高度編: ヒット率を上げる

### prompt\_cache\_key のルーティング

ヒットするには、リクエストが同じキャッシュマシンに到達する必要があります。デフォルトの prefix-hash ルーティングで通常は十分ですが、**多くのユーザーが似たプレフィックスを共有している**場合や同時実行数が高い場合は、明示的な `prompt_cache_key` を使うとヒット率が目に見えて向上します:

```python theme={null}
r = client.chat.completions.create(
    model="gpt-5.4",
    messages=messages,
    prompt_cache_key="user-12345"  # pin routing per user/session
)
```

<Warning>
  1 つの「prefix + prompt\_cache\_key」の組み合わせが約 **15 requests/minute** を超えると、トラフィックは他のマシンへあふれ、ヒット率が低下します。高い同時実行数では、**ユーザーごとまたはセッションごとにキーを分割**してください。1 つのグローバルキーを共有してはいけません。
</Warning>

### 安定したプレフィックスを設計する

* ツール定義の順序と JSON シリアライズを固定してください（シリアライザにキー順をランダム化させない）
* 画像入力もプレフィックス照合に含まれます。再利用するときは URL / base64 と `detail` パラメータを同一に保ってください
* シナリオごとに利用可能なツールを変えたい場合は、`allowed_tools` を使ってサブセットを制限し、`tools` リストを編集しないでください。前者はキャッシュプレフィックスを壊しません

### マルチターンチャットは追加作業なしでヒットする

追記専用の messages 配列は、自然にプレフィックスの安定性を満たします。各ターンの履歴は、前のターンの完全なプレフィックスです。何もしなくても自動的にヒットします。

## よくある落とし穴

| 症状                                | 原因                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `cached_tokens` が常に 0             | 合計が 1024 token 未満 / プレフィックス先頭の動的コンテンツ（タイムスタンプ、UUID、ランダム ID）                                                            |
| ヒットが断続的に発生する                      | `prompt_cache_key`を分割しない高い同時実行数 / 保持期間を過ぎたアイドル状態                                                                       |
| 期待よりヒット数が少ない                      | 128-token 単位の切り捨て（正常） / 動的コンテンツがプレフィックス中央に漏れ込んでいる                                                                      |
| モデルを切り替えた後にヒットしない                 | キャッシュはモデルごとに分離されています — `gpt-5.4` と `gpt-5.4-mini` は共有されません                                                             |
| Claude を呼び出しても cached\_tokens がない | Claude への OpenAI互換呼び出しでは Claude のキャッシュは使えません — [Claude ネイティブ呼び出し](/ja/api-capabilities/claude-prompt-caching) を使ってください |

## OpenAI と Claude のキャッシュをひと目で比較

|        | OpenAI (gpt-5シリーズ)           | Claude                    |
| ------ | ---------------------------- | ------------------------- |
| トリガー   | **完全自動**、コード不要               | 手動の `cache_control` マーカー  |
| 書き込み料金 | **無料**                       | 1.25× (5分) / 2× (1時間)     |
| ヒット価格  | 0.1×                         | 0.1×                      |
| 最小しきい値 | 1024 tokens                  | モデルにより 1024–4096 tokens   |
| 保持期間   | 5分から; gpt-5.1+ ではデフォルトで 24時間 | 5分 / 1時間（スライド式更新）         |
| 注目する項目 | `cached_tokens`              | `cache_read_input_tokens` |

Claude 側の完全な手順については、[Claude キャッシュ課金ガイド](/ja/api-capabilities/claude-prompt-caching) をご覧ください。

## APIYI とキャッシング

<Info>
  **APIYI の OpenAI チャネルはキャッシュヒットをサポートしています。** リクエストはそのまま上流へ転送され、`cached_tokens` フィールドは変更されないままあなたに返され、課金ダッシュボードでは一致した部分が公式の 0.1× レートで別の「cache read」項目として表示されます。コード側でミドルウェア固有の適応は不要です。
</Info>

セルフチェック:

1. 少なくとも 1024 tokens の安定したプレフィックスを作成し、2 回続けてリクエストを送信します
2. 2 回目のレスポンスに `cached_tokens > 0` が表示されるはずです
3. 呼び出しログでは、2 回目のリクエストの入力コストが 1 回目より明らかに低くなっているはずです

## 重要ポイント

<CardGroup cols={2}>
  <Card title="1. 完全自動" icon="wand-sparkles">
    マーカー不要、書き込み料金なし — キャッシュは自動的に適用され、2回目の利用はそのまま節約になります。
  </Card>

  <Card title="2. 十分な長さ" icon="ruler">
    キャッシュを開始するには、少なくとも 1024 tokens のプレフィックスが必要です。ヒットは 128-token 刻みでカウントされます。
  </Card>

  <Card title="3. 安定したプレフィックス" icon="lock">
    安定した内容を先に、変動する内容を最後に置き、冒頭にはタイムスタンプやランダム ID を入れないでください。
  </Card>

  <Card title="4. 使用量を確認" icon="search">
    `cached_tokens > 0` だけがヒットを示し、その部分は 10% で課金されます。
  </Card>
</CardGroup>

## 関連リンク

* このグループ: [ネイティブ呼び出し](/ja/api-capabilities/openai/native) · [互換モード](/ja/api-capabilities/openai/compatible) · [Function Calling](/ja/api-capabilities/openai/function-calling)
* Claude側キャッシュ: [Claude Cache 課金ガイド](/ja/api-capabilities/claude-prompt-caching)
* token の取得・管理: `https://api.apiyi.com/token`
* OpenAI 公式ドキュメント: `developers.openai.com/api/docs/guides/prompt-caching`
