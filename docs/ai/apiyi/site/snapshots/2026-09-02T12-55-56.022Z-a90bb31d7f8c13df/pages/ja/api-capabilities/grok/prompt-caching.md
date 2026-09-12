> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok プロンプトキャッシュ課金ガイド

> Grok のキャッシュは自動で、書き込み料金は不要です: キャッシュされた入力は 0.25x で課金されます。128 token 単位のブロック粒度、ヒットするリクエストの書き方、cached_tokens の読み方、そして長い会話が responses チェーンに適している理由。

Grok でエージェント、長い system prompt、またはマルチターン会話を実行すると、prompt caching により入力の**キャッシュ済み部分**が **0.25×**（75% の節約）で課金されます。しかも、caching は完全に自動なので**コード変更は不要**です。

あらかじめ期待値を明確にしておきます。xAI は、メモリ圧迫時、再起動時、またはリクエストが別のサーバーに着地した場合に cache エントリが追い出される可能性があると明示しており、**キャッシュヒットは保証されません**。キャッシュ割引はあくまであると便利なものとして扱い、**キャッシュ未使用時の価格で予算を見積もってください**。

このページは xAI の公式ドキュメント（`docs.x.ai/developers/advanced-api-usage/prompt-caching`）に従っており、**2026-08-19 に APIYI ゲートウェイ上で `grok-4.6` を実地テストした結果**に基づいています（124 回の呼び出しを、バックエンドの課金記録と1行ずつ照合済み）。

## 一言でいうと

リクエストの\*\*冒頭部分（プレフィックス）\*\*が最近のリクエストとバイト単位で一致すると、上流は冗長な処理をスキップします。一致した部分は **0.25×** で課金されます。パラメータも、マーカーも不要です。

ほかの2つとの違いは次のとおりです。

* **Claude と比べると**: `cache_control` マーカーはありません — 条件を満たすとそのまま発生します
* **OpenAI と比べると**: 同じく自動で、同じく自由に記述できますが、Grok では `prompt_cache_key` 風のルーティング制御はできません

## なぜ気にするのか — レート倍率を見てください

モデルの生の入力 token 価格を **1×** とすると：

| 種類           | 価格         | 注記                     |
| ------------ | ---------- | ---------------------- |
| 通常の入力        | **1×**     | キャッシュにヒットしないものは、通常料金です |
| キャッシュ書き込み    | **0×（無料）** | 自動的に発生し、費用はかかりません      |
| **キャッシュヒット** | **0.25×**  | キャッシュ済みの部分は 75% 安くなります |

**損益分岐点：2回目のリクエストです。** 相殺すべき書き込み शुल्कはないため、プレフィックスが初めて再利用された時点で、節約できた分はすべて純粋な利益になります。

`grok-4.6` のドル建て価格（1M tokens あたり、両方のコンテキスト階層）：

| 階層          | 通常の入力  | キャッシュヒット   |
| ----------- | ------ | ---------- |
| 0 – 200K    | \$2.00 | **\$0.50** |
| 200K – 512K | \$4.00 | **\$1.00** |

他の Grok モデルの階層の境界とキャッシュ読み取りレートは、[Grok の概要にある段階料金表](/ja/api-capabilities/grok/overview)をご覧ください。

### 適しているケース

* 1つの長い system prompt と tool 定義を、何度も呼び出す場合（エージェント、サポート bot）
* 1つの文書に対するバッチ処理（1つの契約書に対して 50 個の質問）
* 安定した文書チャンクが prompt の先頭に置かれる RAG
* マルチターン会話 — ただし Grok では、この実現方法の2通りの挙動がかなり異なる点に注意してください（下記参照）

### 適していないケース

* 毎回、最初の文字から異なるリクエスト
* 千 token 未満の prompt — テストでは、このようなリクエストを繰り返し呼び出しても、再利用可能なキャッシュは一度も構築されませんでした

## 両方のエンドポイント、ストリーミングと非ストリーミング、すべて照合済み

`/v1/chat/completions` と `/v1/responses` は、それぞれストリーミングと非ストリーミングについて、**2026-08-19 にバックエンドの課金記録と4通りの組み合わせすべてを照合しました**。その結果、キャッシュされた部分はどのケースでもキャッシュ料金で課金されていました。

|                        | 非ストリーミング | ストリーミング |
| ---------------------- | -------- | ------- |
| `/v1/chat/completions` | 照合済み     | 照合済み    |
| `/v1/responses`        | 照合済み     | 照合済み    |

<Info>
  **ゲートウェイ側でクライアントの適応は不要です。** キャッシュの挙動は上流へそのまま引き継がれ、`cached_tokens` は文字どおりそのまま返され、バックエンドの請求書にはキャッシュされた部分が「cache read」という個別の項目として記載されます。
</Info>

## ヒットの条件

| 条件      | 要件                                                                       |
| ------- | ------------------------------------------------------------------------ |
| 発動方法    | **完全自動** — パラメータもマーカーも不要                                                 |
| 照合の開始位置 | `messages` 配列の**先頭**から、バイト単位で                                            |
| 追記のみ    | それ以前のメッセージを編集・削除・並べ替えるとキャッシュは無効になりますが、**末尾への追記は無効になりません**                |
| ブロック粒度  | **128 tokens**（下記参照）                                                     |
| 長さ      | 公式の最小値は公開されていません。テストでは、千 token レンジ未満の prompt では再利用可能なキャッシュは一度も構築されませんでした |
| 時間窓     | 公式にはいつでも失効可能です — **間隔が短いほど、より信頼性が高くなります**                                |

### ヒットは128 Tokensに切り下げられる

```text theme={null}
cached_tokens = floor(matched prefix length / 128) * 128
```

2回のテスト結果は一致しています: 8802-token のプレフィックスは 8704 (= 68 × 128) にヒットし、前回の 2735-token プレフィックスは 2688 (= 21 × 128) にヒットしました。**そのため `cached_tokens` は通常、安定したプレフィックスより少し小さくなります — これは想定どおりです。**

### 追記のみ: 編集履歴で壊れます

同じプレフィックスを立て続けに送信し、1回だけ呼び出しを変更した場合:

| 操作                     | `cached_tokens` |
| ---------------------- | --------------- |
| 変更なし                   | 8704            |
| **プレフィックスの先頭 1 文字を変更** | 128（実質的にはミス）    |
| **プレフィックスの末尾に 1 行を追記** | 8704（影響なし）      |
| 元のプレフィックスを再送信          | 8704            |

**実運用でこれが意味すること: 安定したコンテンツを先に、変動するコンテンツを最後に置くことです。**

```python theme={null}
# WRONG: dynamic content at the start of system, so the prefix changes every time and never hits
messages = [
    {"role": "system", "content": f"Current time {datetime.now()}. You are an assistant." + LONG_INSTRUCTIONS},
    {"role": "user", "content": question},
]

# RIGHT: long instructions and tool definitions stay stable up front, dynamic content goes in the user message
messages = [
    {"role": "system", "content": LONG_INSTRUCTIONS},          # stable, will hit
    {"role": "user", "content": f"Current time {datetime.now()}. {question}"},  # volatile, goes last
]
```

## 最小限の実行可能な例

同じ長いプレフィックスを異なる質問で2回送信します。1回目でキャッシュを書き込み、2回目でキャッシュヒットします。

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# The prefix has to be long enough: below the thousand-token range you get essentially nothing
LONG_SYSTEM = open("long_instructions.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="grok-4.6",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("Summarize the key points", "call 1")   # cold start: cached is 0 or a tiny value
ask("Give me 3 keywords", "call 2")         # expect cached close to the prefix length
```

期待される出力:

```text theme={null}
[call 1] input=8804 cached=128
[call 2] input=8804 cached=8704
```

2回目の呼び出しでは `cached` はシステム prompt の長さに近くなり（128 に切り捨て）、その部分は 0.25× で課金されます。

<Info>
  `/v1/responses` エンドポイントは自動的に同じように動作します。フィールドは `usage.input_tokens_details.cached_tokens` です。**そのエンドポイントでは長い会話に追加のメリットがあります** — 下の「長い会話はレスポンスのチェーンに置くべきです」を参照してください。
</Info>

## ヒットとミスの見分け方 — usageフィールドを読む

| エンドポイント                | ヒットフィールド                                    |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

### その読み方: 小さい値はヒットではありません

「0より大きいか」だけを確認しないでください。**`cached_tokens`を安定したプレフィックス長と比較してください:**

| `cached_tokens`               | 読み取り                 |
| ----------------------------- | -------------------- |
| `0`                           | ミス                   |
| プレフィックスのごく一部（数十、または100〜200程度） | **こちらもミスとして扱ってください** |
| 数千台で、128単位で切り捨てたプレフィックス長に近い   | 真のヒット                |

テストでは、コールドな最初の呼び出しでも100〜200程度の値が返ることがあります。だまされないでください。それはプレフィックスがキャッシュされたことを意味しません。

### 突き合わせ: コンソールのキャッシュ課金詳細

単一の呼び出しに対するバックエンドログでは、**キャッシュ読み取り token 数とその割引倍率が別行として**記録され、レスポンス内の`cached_tokens`と照合できます。1回の呼び出しが正確にどのように課金されたかを知りたい場合は、それが正しい参照です。

3ステップの自己確認:

1. 1000 tokenを超える安定したプレフィックスを用意し、2つのリクエストを続けて送信します
2. 2つ目のレスポンスでは、`cached_tokens`が明確に数千台で表示されるはずです
3. バックエンドの[コールログ](/ja/faq/call-logs)では、そのリクエストに「キャッシュ読み取り」の明細が表示され、1回目より入力コストが明らかに低くなっています

## ヒット率を向上させる

### 安定したプレフィックスを設計する

* 長い指示、few-shot例、ツール定義は先頭に置き、ユーザー入力とタイムスタンプは最後に置きます
* ツール定義の順序とJSONシリアライゼーションは固定してください（シリアライザにキーを並べ替えさせないでください）
* 画像入力もプレフィックス一致の対象になります — 再利用するときはbase64 / URL とパラメータを同一に保ってください
* **同じプレフィックスを短時間にまとめて再利用し**、呼び出しを分散させないでください

この手法はOpenAIのものと一致しています。詳細は[OpenAIのプロンプトキャッシュガイド](/ja/api-capabilities/openai/prompt-caching)をご覧ください。

### 長い会話はResponsesチェーンに載せるべきです

これはGrokで見落としやすい違いです:

| アプローチ                                        | テストで分かったこと                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/v1/chat/completions`、ターンを追加していく方式          | 5ターンにわたり、promptが8.8Kから10Kへ増えても、`cached_tokens`は**元の静的プレフィックスのサイズのままでした** — 各ターンの新しいQ\&Aは再利用可能になりませんでした |
| `/v1/responses` に `previous_response_id` を使う | ヒット数は**各ターンごとに増加します**（計測値: 2ターン目 8704 → 3ターン目 9344）                                                    |

したがって、長い会話やマルチステップのエージェントでは、Responses APIチェーンを優先してください:

```python theme={null}
r1 = client.responses.create(
    model="grok-4.6",
    input=[{"role": "system", "content": LONG_SYSTEM},
           {"role": "user", "content": "First question"}],
    store=True,
)

r2 = client.responses.create(
    model="grok-4.6",
    previous_response_id=r1.id,          # send only the new turn; the upstream carries the history
    input=[{"role": "user", "content": "Follow-up"}],
    store=True,
)
print(r2.usage.input_tokens_details.cached_tokens)
```

endpointの違いについては、[Grokの概要ページにあるendpoint概要](/ja/api-capabilities/grok/overview)で説明されています。

### `x-grok-conv-id`について

xAIのベストプラクティスでは、ヒット率を向上させるために、すべてのリクエストで`x-grok-conv-id`ヘッダー（UUIDまたはセッションID）を送ることが推奨されています。APIYIで対称的なA/Bを実施しました。ヘッダーの有無で複数の独立したプレフィックスをそれぞれ複数回再利用し、**2つのグループ間で観測可能な差は見られませんでした**。送っても害はありませんが、ヒット率向上のために当てにしないでください。

## ヒット率と期待すべきこと

<Warning>
  **キャッシュヒットは保証されません。** xAI のドキュメントでは、エントリはメモリ圧迫、サービスの再起動、またはリクエストが別のサーバーにルーティングされることによって失われる可能性があるとされています。

  テストでは、**安定したプレフィックスを短時間に集中して再利用する場合**にはほとんどのリクエストがヒットしましたが、実際にはばらつきがあり、その原因は上流にあります — 呼び出し側では制御できません。**未キャッシュ時の価格で見積もり、ヒットはおまけとして扱ってください。**
</Warning>

もう一つ、はっきり言っておく価値があることがあります: **キャッシュの価値は速度ではなく、コストです。** 計測した time-to-first-token は、ヒット時とミス時で数百ミリ秒しか違いませんでした — キャッシュによって長いコンテキストのリクエストが速くなるとは期待しないでください。

## よくある落とし穴

| 症状                                  | 原因                                                                  |
| ----------------------------------- | ------------------------------------------------------------------- |
| `cached_tokens` が常に 0、または常に極端に小さい   | prompt が短すぎる（千 token 台未満）／プレフィックスの先頭にタイムスタンプ、UUID、またはランダム ID がある    |
| キャッシュヒットが出たり消えたりする                  | 上流側の削除によるものです。想定どおりなので、再利用の間隔を短くし、バッチ処理は一気に送信してください                 |
| キャッシュヒットがプレフィックスより短い                | 128 token 単位への切り捨てです。正常です                                           |
| `cached_tokens` がマルチターンのチャットで増えなくなる | chat/completions は元の静的プレフィックスしか再利用しません。長い会話は responses チェーンに移してください |
| 以前のメッセージを編集したらキャッシュヒットが消えた          | キャッシュは追記専用です。履歴を編集、削除、または並べ替えると無効になります                              |
| モデルを切り替えたあとにキャッシュヒットが出ない            | キャッシュはモデルごとに**分離**されています。`grok-4.6` と `grok-4.5` は共有されません           |

## 他のチャネルとのクイック比較

|            | Grok                                | OpenAI          | Gemini                    | Claude                    |
| ---------- | ----------------------------------- | --------------- | ------------------------- | ------------------------- |
| どうトリガーされるか | **自動**                              | **自動**          | 暗黙的、自動                    | 手動 `cache_control`        |
| 書き込み料金     | **無料**                              | **無料**          | 無料                        | 1.25× / 2×                |
| ヒット価格      | 0.25×                               | 0.1×            | Google によると最大 90% 割引      | 0.1×                      |
| 最小サイズ      | 未公開；テストでは約1K tokens未満では何もキャッシュされません | 1024 tokens     | 4096（3 系列）/ 2048（2.5 系列）  | 1024–4096                 |
| ブロック粒度     | 128 tokens                          | 128 tokens      | —                         | —                         |
| ヒットの信頼性    | ヒットは決定論的ですが、上流側は保証していません            | 安定              | 保証なし；実運用ではまずまず            | 安定                        |
| ヒット対象フィールド | `cached_tokens`                     | `cached_tokens` | `cachedContentTokenCount` | `cache_read_input_tokens` |

プラットフォーム全体のキャッシング対応については、[キャッシュ課金 FAQ](/ja/faq/cache-billing) をご覧ください。

<Info>
  **このページの内容はすべて `grok-4.6` (2026-08-19) で測定しました。** xAI は、すべての Grok 言語モデルが prefix caching をサポートすると述べています。その他については一つずつベンチマークしていないため、ブロック粒度や短い prompt での挙動などの詳細は、ご自身のワークロードで確認する前提で扱ってください。

  ある prefix に対して表示される課金内容が、ここで説明している内容と明らかに一致しない場合は、レスポンスヘッダーの request-id を添えてサポートにお問い合わせください。
</Info>

## 要約

<CardGroup cols={2}>
  <Card title="1. 完全自動" icon="wand-sparkles">
    マーカーは不要、書き込み料金も不要です。条件を満たせばキャッシュされ、2回目以降の再利用は純粋な節約になります。
  </Card>

  <Card title="2. 追記のみ" icon="layers">
    一致判定はメッセージ先頭からバイト単位で行われます。編集履歴があると無効になり、ヒットは128 tokens単位に切り捨てられます。
  </Card>

  <Card title="3. 長い会話をつなぐ" icon="link">
    マルチターンチャットでは元の静的プレフィックスのみが再利用されます。responses + previous\_response\_id により、ターンを重ねるごとにヒットが増えます。
  </Card>

  <Card title="4. ヒットを当てにしない" icon="scale">
    ヒットは保証されません。未キャッシュ時の価格で予算を見積もり、割引はおまけとして扱ってください。
  </Card>
</CardGroup>

## 関連リンク

* 同じグループ: [Grok の概要](/ja/api-capabilities/grok/overview) · [チャットと推論](/ja/api-capabilities/grok/chat) · [Web と X 検索](/ja/api-capabilities/grok/web-search) · [コード実行と MCP](/ja/api-capabilities/grok/code-execution-mcp)
* 他のチャネルでのキャッシュ: [OpenAI キャッシュ課金](/ja/api-capabilities/openai/prompt-caching) · [Gemini キャッシュ課金](/ja/api-capabilities/gemini/prompt-caching) · [Claude キャッシュ課金](/ja/api-capabilities/claude-prompt-caching)
* プラットフォーム全体の概要: [キャッシュ課金 FAQ](/ja/faq/cache-billing)
* token を取得または管理する: `https://api.apiyi.com/token`
* xAI 公式ドキュメント: `docs.x.ai/developers/advanced-api-usage/prompt-caching`
