> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Prompt Caching ガイド

> Anthropic のネイティブ形式で Prompt Cache を使い始めましょう。キャッシュ可能なリクエストの書き方、課金の見方、そしてキャッシュヒット率がゼロになる理由を解説します。コストを最大 90% 削減できます。

Claude Code、Cline、Cursor を使っている場合でも、自作の Claude API 呼び出しをしている場合でも、**プロンプトキャッシュは請求額を下げるための最も大きな調整ポイントです** — キャッシュされた入力 token はわずか **0.1×** で課金され、90% の割引になります。

このページは Anthropic の公式ドキュメント（`platform.claude.com/docs/en/build-with-claude/prompt-caching`）を基にしており、コピペしてすぐ使える例を APIYI の設定向けに調整しています。

## 一文で言うと

**長く、繰り返し使う prompt のプレフィックス**（システム指示 / 長い文書 / few-shot の例）を `cache_control` でマークします。サーバーがそれを保存し、同じプレフィックスで次のリクエストが来たときは再処理をスキップします — **おおよそ 10 倍安く、速く**なります。一定期間使われないと期限切れになります。

## なぜ気にするのか — 倍率を見てください

モデルのベース入力token価格（`1×`）に対して:

| 種類                 | 価格        | 備考                        |
| ------------------ | --------- | ------------------------- |
| 通常入力               | **1×**    | キャッシュされていない部分はすべて、通常料金    |
| キャッシュ書き込み（5分TTL）   | **1.25×** | 初回の書き込みは25%高くなります         |
| キャッシュ書き込み（1時間TTL）  | **2×**    | より長く保存するために、より多く支払います     |
| **キャッシュ読み取り（ヒット）** | **0.1×**  | まさにここが要点です。その後は90%オフになります |

**損益分岐点:**

* **5分TTL**: 同じプレフィックスを **2回再利用** するだけで損益分岐します（1.25 + 0.1 = 1.35、キャッシュなしの2回のリクエストより安いです）。
* **1時間TTL**: **3回再利用** で損益分岐します（2 + 0.2 = 2.2、3回のリクエストより安いです）。

<Info>
  TTLは**スライディングウィンドウ**です。キャッシュヒットするたびに有効期限のタイマーがリセットされるため、アクティブな会話が途中で期限切れになることはありません。TTLを超えて本当にアイドル状態になった場合のみ、エビクションが発生します。
</Info>

### 向いているケース

* 同じ長いシステムpromptを何度も呼び出す場合（エージェント、チャットボット）
* マルチターンの会話（過去の各ターンが再利用可能なプレフィックスになる）
* 1つのドキュメントをバッチ処理する場合（1つの契約について50個の質問をする）
* 安定した取得チャンクがプレフィックスを形成するRAG

### 向いていないケース

* すべてのpromptが最初の文字から異なる
* 全体が短く、モデルごとの最小値（下記）を一度も超えない

## 3つの必須要件

3つすべてが必須です。

### 1. 明示的な `cache_control` マーカー

`content` は単なる文字列にはできません。これは**コンテンツブロック配列**である必要があり、キャッシュしたいブロックに `cache_control` を付与します。

```python theme={null}
# ❌ Wrong: plain string is never cached
"content": "a long passage..."

# ✅ Right: content block + cache_control
"content": [
    {
        "type": "text",
        "text": "a long passage...",
        "cache_control": {"type": "ephemeral"},
    },
    {"type": "text", "text": "the question"},
]
```

### 2. 長さがモデルごとの最小値を超える必要がある

コンテンツがモデルの最小値より短い場合、**マーカーがあってもキャッシュされません**（エラーは発生せず、単に静かにスキップされます）。Anthropic の公式ドキュメントで確認済みです。

| 最小 tokens | モデル                                                              |
| --------- | ---------------------------------------------------------------- |
| **512**   | Opus 5、Fable 5 / 5.1、Mythos 5                                    |
| **1,024** | Opus 4.8、Sonnet 5、Sonnet 4.6、Sonnet 4.5、Sonnet 4、Opus 4.1、Opus 4 |
| **2,048** | Opus 4.7、Haiku 3.5                                               |
| **4,096** | Opus 4.6、Opus 4.5、Haiku 4.5                                      |

<Warning>
  **このしきい値はバージョン番号に対して単調に下がるわけではありません。推測しないでください。** 最も直感に反する組み合わせは、Opus 5 が必要とするのはわずか **512** である一方、より古い Opus 4.6 / 4.5 は **4,096** を必要とすることです。これは8倍の差です。Haiku 4.5 も 4,096 であり、より古い Haiku 3.5（2,048）よりも*高く*なっています。したがって、「新しいモデルほどしきい値が低い」も「小さいモデルほどしきい値が低い」も成り立ちません。モデルを切り替えるたびに表を確認してください。
</Warning>

<Tip>
  英語テキストは平均して token あたり約0.75語です。実際には、Opus 5 は約 **380語以上** の安定したコンテンツからキャッシュされ、Sonnet 5 / Sonnet 4.6 は約 **770語**、Opus 4.6 / Haiku 4.5 はキャッシュが機能するまでに約 **3,000語** 必要です。最新のしきい値については、常に Anthropic の公式ドキュメントを参照してください。モデルバージョン間で変更される可能性があります。
</Tip>

<Info>
  **APIYI で測定（2026-07-29）。** サイズを段階的に増やした固定プレフィックスを使用して書き込みしきい値を検証しました。`claude-opus-5` は301 tokensではキャッシュ書き込みが発生せず、614では発生したため、公式の **512** を挟み込んでいます。`claude-sonnet-5` は612では発生せず、1,250では発生したため、公式の **1,024** を挟み込んでいます。どちらも上記の表と一致しています。
</Info>

### 3. プレフィックスはバイト単位で完全に一致する必要がある

キャッシュは**プレフィックスベース**です。リクエストの先頭から `cache_control` マーカーまでのバイトストリームは、前回のリクエストと**完全に同一**でなければなりません。空白、JSON キーの順序、タイムスタンプなど、1文字でも変更すると新しいプレフィックスとして扱われ、ヒットではなく新規書き込みが発生します。

**実践的なルール：安定したものは先頭に、変動するものは末尾に配置します。**

```python theme={null}
# ❌ Wrong: question first means the prefix changes every turn; never hits
content = [
    {"type": "text", "text": "Please answer this question: " + question},  # volatile
    {"type": "text", "text": long_doc, "cache_control": {"type": "ephemeral"}},
]

# ✅ Right: long stable content first with marker, question after
content = [
    {"type": "text", "text": long_doc, "cache_control": {"type": "ephemeral"}},  # stable
    {"type": "text", "text": question},                                            # volatile
]
```

## 最小の実行例

同じ長いドキュメントを使って、異なる質問で 2 回リクエストを送信します。1 回目は書き込み、2 回目はヒットします:

```python theme={null}
import json, os, requests

URL = "https://api.apiyi.com/v1/messages"
KEY = os.environ["APIYI_API_KEY"]
HEADERS = {
    "content-type": "application/json",
    "x-api-key": KEY,
    "anthropic-version": "2023-06-01",
}

# Must be long enough. Sonnet 4.6 needs >= 1,024 tokens (~770+ English words).
LONG_TEXT = open("long_document.txt").read()


def ask(question: str, label: str):
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 256,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": LONG_TEXT, "cache_control": {"type": "ephemeral"}},
                {"type": "text", "text": question},
            ],
        }],
    }
    r = requests.post(URL, headers=HEADERS, data=json.dumps(payload), timeout=120)
    u = r.json().get("usage", {})
    print(f"[{label}] input={u.get('input_tokens')} "
          f"write={u.get('cache_creation_input_tokens')} "
          f"read={u.get('cache_read_input_tokens')}")


ask("Summarize the main idea", "1st")  # expect write>0, read=0
ask("Give 3 keywords",        "2nd")    # expect write=0, read>0
```

期待される出力:

```text theme={null}
[1st] input=35 write=6512 read=0
[2nd] input=22 write=0    read=6512
```

2 回目の呼び出しの `read` ≈ 1 回目の呼び出しの `write` — 同じプレフィックスが再利用されています。

## ヒットしたかどうかの見分け方 — 3つの usage フィールド

各レスポンスで、`usage` は次を報告します:

| Field                         | 意味                           | 課金倍率         |
| ----------------------------- | ---------------------------- | ------------ |
| `input_tokens`                | キャッシュされていない入力 token          | 1×           |
| `cache_creation_input_tokens` | この呼び出しで cache に書き込まれた token  | 1.25× または 2× |
| `cache_read_input_tokens`     | この呼び出しで cache から読み取られた token | **0.1×**     |

**input token の合計 = 3 つすべての合計です。** `cache_read_input_tokens > 0`である限り、コストを節約できます。

## 最も一般的な落とし穴

| 症状                                                                                                                                 | 原因                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `write` が常に `0`、またはフィールドがない                                                                                                        | `cache_control` マーカーがない / 最小しきい値未満 / OpenAI 互換形式を使用した                                                                                |
| 2 回目のリクエストでも `write > 0` があり、`read = 0` もある                                                                                        | プレフィックスが変更されました。一般的な原因: prompt 内の `datetime.now()`、UUID、ローテーションするユーザー ID、非決定的な JSON シリアライズ、タイムスタンプ付きシステム prompt                      |
| 動作していたが、しばらくすると再び書き込みが発生する                                                                                                         | TTL を超えてアイドル状態でした。より長く保持するには `{"type": "ephemeral", "ttl": "1h"}` を使用してください                                                          |
| 同じ prompt、異なるモデル — ヒットしない                                                                                                          | キャッシュはモデルごとに分離されています。モデルの切り替え = 新しいキャッシュキーです                                                                                         |
| Fable 5 / 5.1 で、あるターンが突然 `read = 0` を示し、レスポンスの `model` が `claude-opus-4-8`（または `claude-opus-5`）、あるいは `stop_reason` が `refusal` になる | コンテンツ安全性のフォールバック / 拒否が発生しました。フォールバックではモデルが切り替わるためキャッシュキーも変わり、そのターンでは以前のキャッシュを読み取れません。拒否されたターンで書き込まれたキャッシュは、後で読み戻されません。以下の注記を参照してください |
| 長い会話の直近ターンがヒットしない                                                                                                                  | 1 リクエストあたり最大 **4** 個の `cache_control` ブレークポイントです。各ブレークポイントは、以前のキャッシュエントリについて遡って確認できるのが **20 個のコンテンツブロック**までです                        |

<Warning>
  **Fable ファミリーでの安全性フォールバックはキャッシュを壊します。** `claude-fable-5` / `claude-fable-5-1` には組み込みの安全性分類器が搭載されています。リクエストが高リスクコンテンツに該当した場合、モデルは **拒否**（`stop_reason: "refusal"` を伴う HTTP 200）するか、Opus ファミリーへ **フォールバック**します。レスポンス内の最上位 `model` は、実際に応答したモデルを正確に反映します。これはゲートウェイの問題ではなく、通常のモデル側の動作です。

  キャッシュへの影響: フォールバックではモデルが切り替わるためキャッシュキーも変わり、そのターンでは以前のターンが書き込んだ内容を読み取れません。次のターンで Fable に戻るとヒットが再開します。拒否されたターンでも `cache_creation_input_tokens` が報告される場合がありますが、その書き込みは後で読み戻されることはありません。複数ターンのエージェントセッションでは、これは **`read` が 0 に低下し、`write` が再び増加する孤立したターン**として現れます。

  対処方法: `usage` だけでミスを判断する前に、レスポンスの `model` と `stop_reason` を確認してください。拒否された入力はそのまま再試行するのではなく、再送前に調整してください。会話コンテンツをポリシーの範囲内に保つことが、これらのミスを最小限に抑える方法です。拒否、フォールバック、課金の詳細は [Fable 5.1 リリースノート](/en/news/claude-fable-5-1-launch)を参照してください。
</Warning>

<Warning>
  **Prompt Cache は Anthropic ネイティブ形式（`/v1/messages`）でのみ動作します。** OpenAI 互換形式（`/v1/chat/completions`）を通じて Claude を呼び出す場合、送信内容にかかわらずキャッシュフィールドは返されません。Claude Code、Cline、Cursor、および同様の高頻度クライアントでは、料金を重視する場合はネイティブ形式が必須です。
</Warning>

## 詳細: マルチターン会話

`cache_control` を**直近のユーザーメッセージの最後のコンテンツブロック**に置きます。新しいターンが追加されるたびに、キャッシュされた読み取り範囲は前のターンの末尾まで自動的に拡張されます:

```python theme={null}
# When constructing the Nth turn's request
messages[-1]["content"][-1]["cache_control"] = {"type": "ephemeral"}
```

覚えておくべき厳しい制限は2つあります:

* 1リクエストあたり、**4** `cache_control` ブレークポイントまでです。
* 各ブレークポイントのプレフィックス検索ウィンドウは **最大20コンテンツブロック前まで** です。それより古いものはヒットの対象になりません。つまり、非常に長い会話では、最新のターンだけをマークしても、以前の履歴全体はカバーできません。

よくあるパターン: ツール定義、system prompt、長いドキュメント、最新の会話ターンそれぞれに1つずつブレークポイントを置き、4つのスロットをすべて使って、異なる頻度で変更されるセクションが互いのキャッシュを無効化しないようにします。

## APIYI とキャッシュについて

<Info>
  **APIYI はキャッシュ項目をエンドツーエンドで転送します。** あなたが送信した`cache_control`は、上流の Claude（AWS Claude または Claude 公式リレー）にそのまま渡され、返された`cache_creation_input_tokens` / `cache_read_input_tokens`はそのままあなたに返されます。コード側で特別な対応は不要です。
</Info>

自己検証する方法:

1. 1回目のリクエストでは、`usage.cache_creation_input_tokens > 0`（書き込み成功）となります。
2. 数秒以内に、同じプレフィックスをもう一度送信すると、`usage.cache_read_input_tokens > 0`（ヒット）が表示されるはずです。
3. 課金ダッシュボードでは、**キャッシュ書き込み** と **キャッシュ読み取り** が個別に明細化され、公式と同じ倍率（1.25× / 2× / 0.1×）で表示されます。

## 要約

<CardGroup cols={2}>
  <Card title="1. それをマークする" icon="tag">
    `cache_control: {"type": "ephemeral"}` コンテンツブロック上で — **plain-string `content` はキャッシュされません**。
  </Card>

  <Card title="2. 十分な長さにする" icon="ruler">
    Opus 5 ≥ 512; Sonnet 5 / Sonnet 4.6 ≥ 1,024; Opus 4.7 ≥ 2,048; Opus 4.6 / Haiku 4.5 ≥ 4,096 tokens, それ以外は静かにスキップされます。
  </Card>

  <Card title="3. 安定したプレフィックス" icon="lock">
    先頭は安定させ、後ろは変動してもよく、1 文字でもずれるとヒットしなくなります。
  </Card>

  <Card title="4. 使用状況を確認する" icon="search">
    `cache_read_input_tokens > 0` だけが、実際にコストを節約できたことを証明します。
  </Card>
</CardGroup>

## 関連リンク

* 親ページ: [Claude API 基礎](/ja/api-capabilities/claude)
* クライアント設定ガイド: [Claude Code 連携](/ja/scenarios/programming/claude-code) · [Cherry Studio 連携](/ja/scenarios/chat/cherry-studio)
* token の取得・管理: `https://api.apiyi.com/token`
* Anthropic 公式ドキュメント: `platform.claude.com/docs/en/build-with-claude/prompt-caching`
