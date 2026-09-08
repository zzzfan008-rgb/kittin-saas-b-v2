> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision

> DeepSeek の初の vision モデル deepseek-v4-flash-vision-exp: 画像、スクリーンショット、グラフを読み取れます。1M コンテキストウィンドウ、画像あたり最大 384 tokens。APIYI では 100万 tokens あたり入力 $0.44 / 出力 $1.32 で提供され、OpenAI と Anthropic の両形式で呼び出せます。

`deepseek-v4-flash-vision-exp` は DeepSeek の **実験的なビジョンモデル** で、V4 Flash ベースに画像入力を追加したものです。画像の説明、スクリーンショットからの文字読み取り、グラフ値の読み取り、
複数画像の比較ができます。テキスト側のすべて（1M コンテキスト、thinking mode、関数呼び出し、
コンテキストキャッシュ）はそのまま保持され、料金はテキストのみの V4 Flash と同一です——
**vision に追加料金はなく、画像はその寸法に基づいて入力 token に変換されます**。

APIYI は、約 1,100 回の呼び出しにわたる **124 件のテストケース** を完了しており、3 つの画像入力
チャネル、4 種類の画像フォーマット、2 つのプロトコル、2 つのグループをカバーしています。

<Warning>
  **呼び出す前にお読みください。このモデルは APIYI 上で 2 つのグループにより提供されており、機能が異なります。ご利用のプロトコルに合うグループを選択してください。**

  | 使用するプロトコル                                                | キーを配置するグループ      |
  | -------------------------------------------------------- | ---------------- |
  | OpenAI 形式（`/v1/chat/completions`, `/v1/responses`）       | **`default`**    |
  | Anthropic 形式（`/v1/messages`、Claude Code および同様のクライアントを含む） | **`ClaudeCode`** |

  間違ったグループを選んでも「wrong group」エラーにはなりません。パラメータが
  何も起こさないまま無視されたり、2 回目のターンで 400 が返ったり、`/v1/responses` が `messages` について
  エラーを出したりします。
  どちらのグループも **料金は完全に同一** です —— グループが影響するのは機能だけで、課金には影響しません。
  下の「グループの選び方」をご覧ください。
</Warning>

## ハイライト

<CardGroup cols={2}>
  <Card title="ビジョンの追加料金なし" icon="circle-dollar-sign">
    テキスト専用のV4 Flashと同価格: \$0.44入力、\$1.32出力、1M tokenあたりです。画像はinput tokenになり、1画像あたり384が上限です。
  </Card>

  <Card title="テストで堅実な認識" icon="eye">
    スクリーンショットOCRの値はすべて正確で、5本棒グラフは5/5、36個の図形の中から特定の形を数えるテストは24/24でした。否定質問でもハルシネーションはありませんでした。
  </Card>

  <Card title="事前圧縮は不要" icon="image">
    2000×2000と4000×4000は、まったく同じtoken数（346）に変換されます。上流側で自動的にリサイズされます——圧縮で節約できるのは帯域幅だけで、費用は変わりません。
  </Card>

  <Card title="両方のプロトコルが動作します" icon="git-compare">
    OpenAI形式（chat/completions + responses）とAnthropic形式（/v1/messages）の両方が検証済みで、それぞれ独自のグループで確認されています。
  </Card>
</CardGroup>

## モデル情報

| 項目                    | 値                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------- |
| **モデル名**              | `deepseek-v4-flash-vision-exp`                                                        |
| **モデルバージョン**          | DeepSeek-V4-Flash-Vision-Exp（試験運用版）                                                   |
| **コンテキストウィンドウ**       | 1M (測定上のハード上限は 1,048,576 tokens で、`max_tokens` はその内数です)                               |
| **最大出力**              | 384K (測定上のハード上限は 393,216 で、それを超えると `valid range of max_tokens is [1, 393216]` が返されます) |
| **利用可能なグループ**         | `default`, `ClaudeCode`, `svip`                                                       |
| **エンドポイント**           | `POST /v1/chat/completions`, `POST /v1/responses`, `POST /v1/messages`                |
| **画像入力**              | ✅ JPEG / PNG / GIF / WebP                                                             |
| **推論モード**             | 既定でオン、無効化できます（使用構文はグループによって異なります。以下を参照してください）                                         |
| **ストリーミング**           | ✅ 3つのエンドポイントすべてで有効                                                                    |
| **関数呼び出し / tool の使用** | ✅ 増分ストリーミングによる組み立てを含みます                                                               |
| **JSON 出力**           | ✅ `json_object`; ❌ `json_schema`（上流側では有効になっていません）                                     |
| **価格**                | \$0.44 入力、\$1.32 出力、\$0.014 キャッシュヒット、1M tokens あたり                                    |

<Note>
  2026-08-17 以降、ベンダーはこのモデルを時間帯に応じて 2 段階で課金します（ピーク時間は
  01:00-04:00 および 06:00-10:00 (UTC) です）。**APIYI は常にピーク料金で課金するため**、コストは
  時間ごとに変動しません。
</Note>

## グループの選び方

APIYI 上の 2 つのグループは異なる上流エンドポイントにルーティングされるため、機能は同等ではありません。以下の表は 2026-08-21 時点で、各セル 3 回ずつ測定しています。

| 機能                            | `default` グループ                          | `ClaudeCode` グループ |
| ----------------------------- | --------------------------------------- | ----------------- |
| `/v1/chat/completions` 画像付き   | ✅                                       | ✅                 |
| `/v1/responses` 画像付き          | ✅                                       | ❌ 毎回 400          |
| `/v1/messages` 画像付き           | ⚠️ 明示的な `top_p` が必要で、マルチターンでは 400 になります | ✅ 完全に動作します        |
| `detail` token 節約             | ✅ 有効                                    | ❌ 無視されます          |
| thinking の無効化（OpenAI 形式）      | ✅ 有効                                    | ❌ 無視されます          |
| `logprobs`                    | ✅ 値が入っています                              | ❌ 空を返します          |
| `reasoning_tokens` における usage | ✅ あります                                  | ❌ フィールド全体がありません   |
| 公開 URL 経由の画像（Anthropic 形式）    | ❌                                       | ✅                 |

### OpenAI 形式 → `default` グループを使う

グループ `default` で token を作成し、次のようにします:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",          # a token in the default group
    base_url="https://api.apiyi.com/v1",
)
```

### Anthropic 形式 → `ClaudeCode` グループを使う

グループ `ClaudeCode` で token を作成し、次のようにします:

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",          # a token in the ClaudeCode group
    base_url="https://api.apiyi.com",
)
```

<Tip>
  1 つのアカウントで、異なるグループの token を複数同時に保持でき、それらは干渉しません ——
  各プロトコルにつき 1 つずつにしておく構成が推奨です。作成方法は
  [グループとは](/ja/faq/groups-explained) と
  [token とグループ](/ja/faq/token-and-groups) を参照してください。また、
  [Codex vs ClaudeCode vs デフォルト グループ](/ja/faq/codex-claudecode-default-groups)
  で 3 つの違いを確認できます。
</Tip>

<Warning>
  **Anthropic 形式では `default` グループを絶対に使わないでください。** そこでは 2 つの問題が重なります:

  1. `top_p` を省略すると毎回 400 `Invalid top_p value` が返ります
  2. `top_p` を指定しても、最初のターンの `thinking` ブロックを 2 回目のターンに再送すると
     `unknown variant 'thinking'` が返されます —— そして Claude Code や Anthropic SDK などの標準クライアントは
     それを常に再送するため、**マルチターンは常に壊れます**

  `ClaudeCode` グループに切り替えれば、どちらの問題もなくなります。tool 呼び出しの往復全体も
  問題なく動作します。
</Warning>

## 画像を送信する3つの方法

### 1. インライン base64（最も一般的）

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is in this image?"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ],
    }],
    max_tokens=2000,
)
print(resp.choices[0].message.content)
```

### 2. 公開画像 URL

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image."},
            {"type": "image_url",
             "image_url": {"url": "https://example.com/image.jpg"}},
        ],
    }],
    max_tokens=2000,
)
```

URL は最大 8192 文字までで、ダウンロードは 60 秒以内に完了する必要があります。
リンク切れの場合は `Failed to download image` が返されます。

### 3. `file` のコンテンツブロック（インライン base64 と同等）

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

実測の token コストは `image_url` チャネルと同一です（同じ画像であれば、どちらの方法でも 303 です）。

<Warning>
  **Files API（`/v1/files` にアップロードしてから `file_id` で参照する方式）は APIYI では利用できません**、
  これはサードパーティのゲートウェイでは一般的です。ベンダーが `file_id` 向けに確保している 2 つの上限
  —— 画像 1 枚あたり 64 MiB と、リクエストごとに 200 MiB —— は、したがって利用できません。

  実際に適用される上限は **画像 1 枚あたり 32 MiB、リクエストボディあたり 48 MiB** です。
  これを超えると `image file size exceeds limit 32 MB` が返されます。
</Warning>

## 画像の課金方法

画像は **リサイズ後のサイズ** に基づいて input tokens に変換され、テキスト tokens と合わせて \$0.44 / 1M で課金されます。以下の数値は、APIYI で固定 prompt を使い、テキストのみのベースラインを差し引いて測定したものです:

| 画像サイズ                         | token数 | 画像 1 枚あたりの費用 | 1,000 枚あたり |
| ----------------------------- | ------ | ------------ | ---------- |
| 64×64                         | 114    | \$0.00005    | \$0.05     |
| 384×384                       | 114    | \$0.00005    | \$0.05     |
| 800×800                       | 346    | \$0.000152   | \$0.15     |
| 2000×2000                     | 346    | \$0.000152   | \$0.15     |
| 4000×4000                     | 346    | \$0.000152   | \$0.15     |
| 1600×1200                     | 354    | \$0.000156   | \$0.16     |
| `detail: "low"` 付きの 1600×1200 | 142    | \$0.0000625  | \$0.06     |

ベンダーの説明と完全に一致する 3 つのルールは次のとおりです:

* **画像 1 枚あたり 384 tokens が絶対上限です。** 測定された最大値は 354 で、これを超える画像はありません
* **大きな画像はおおむね 800×800 相当に縮小されます。** そのため 2000² と 4000² の費用が同じであり、**アップロード前に事前圧縮すると帯域幅は節約できますが、料金は変わりません**
* **384×384 未満の画像は拡大されます。** したがって 64×64 は 384×384 と同じ費用になります —— 小さい画像をこれ以上縮小する必要はありません

### token 節約: `detail: "low"`

細部の精度が重要でない場合（画像タイプの識別、被写体の認識、おおまかな分類）、推論前に画像を 512×512 に縮小するには `detail: "low"` を追加してください:

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

同じ 1600×1200 画像で測定した 4 つのレベルは次のとおりです:

| `detail`   | Tokens | デフォルト比   |
| ---------- | ------ | -------- |
| `low`      | 142    | **-60%** |
| `high`     | 354    | 同じ       |
| `original` | 354    | ベースライン   |
| `auto`     | 354    | 同じ       |

<Warning>
  `detail` は、**両方** の条件が満たされる場合にのみ有効です。つまり、`image_url` ブロックに設定されていること
  （`file` ブロックでは黙って無視されます）、そしてあなたの token が **`default` グループ** に属していること
  （`ClaudeCode` グループでは何も行いません）です。

  無効な値は明示的にエラーになります:
  `unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.
</Warning>

## 推論モードの制御

推論モードは**既定でオン**で、推論テキストはあなたの `max_tokens` 予算を消費します。
純粋な画像読み取りタスクではオフにしてください。推論を無効にすると、私たちのテストでは 24/24 のスコアを記録し、
より高速に実行され、推論出力をすべて保存でき、入力 token も 80 個削減できました（推論用システムプロンプトがちょうどその分を消費するためです）。

各構文につき、3回ずつ実行します：

| 構文                               | chat, `default` グループ             | chat, `ClaudeCode` グループ | `/v1/messages` |
| -------------------------------- | -------------------------------- | ----------------------- | -------------- |
| `thinking: {"type": "disabled"}` | ✅                                | ❌                       | ✅ 両方のグループ      |
| `reasoning_effort: "none"`       | ✅                                | ❌                       | —              |
| `reasoning_effort: "low"`        | ⚠️ 推論はオンのままで、短くなるのはシステムプロンプトだけです | ❌                       | —              |
| `reasoning: {"effort": "none"}`  | ❌                                | ❌                       | —              |
| `enable_thinking: false`         | ❌                                | ❌                       | —              |

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[...],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},   # works in the default group
)
```

<Warning>
  **`max_tokens` を低く設定しすぎないでください。** 推論をオンにすると、1 行の質問でも最初に数百 token 分の推論を出力することがあります。予算が小さすぎると、空の `content` を伴う `finish_reason: "length"` になってしまい —— これはモデルが回答に失敗したように見えます。推論をオンにする場合は 2000 以上を使うか、あるいは単に推論を無効にしてください。
</Warning>

## コンテキストキャッシュ

キャッシュにはパラメータは不要です。長いプレフィックスが繰り返されると自動的にヒットし、ヒット部分は \$0.014 / 1M で課金されます。ですが、**画像を含むリクエストはテキストのみのものと 2 点で異なります**。

|                     | テキストのみのリクエスト | 画像を含むリクエスト        |
| ------------------- | ------------ | ----------------- |
| 最初にヒットするのは何回目の呼び出しか | 2回目          | 3回目               |
| 画像そのものの token       | —            | **決してキャッシュされません** |

2304-token のテキストプレフィックスと 800×800 の画像 1 枚で測定すると：

| 呼び出し | prompt\_tokens | ヒット      | ミス   |
| ---- | -------------- | -------- | ---- |
| 1    | 2675           | 0        | 2675 |
| 2    | 2675           | 0        | 2675 |
| 3    | 2675           | **2304** | 371  |
| 4    | 2675           | 2304     | 371  |

ヒットするのは、画像の **前** にあるテキストそのものです。画像とその後のすべては、毎回フル価格で課金されます。そのため、**固定の長い指示は画像の前に置いて** キャッシュされるようにしてください —— 画像の後ろに置いたものは決してヒットしません。

<Note>
  Anthropic 形式では、これらのフィールドは `cache_read_input_tokens` と
  `cache_creation_input_tokens` という名前で、同じように動作します。明示的な `cache_control`
  マーカーは **効果がありません**（上流では自動プレフィックスキャッシュが使われます）。また、2つのプロトコルでは使用量の報告方法が異なります。OpenAI の `prompt_tokens` は常に全件数ですが、Anthropic の
  `input_tokens` はヒット後に未キャッシュの残りへと下がります —— **この2つは直接は整合させられません**。
</Note>

## 対応画像形式

| 形式               | 対応 | 注記                                              |
| ---------------- | -- | ----------------------------------------------- |
| JPEG             | ✅  |                                                 |
| PNG              | ✅  |                                                 |
| GIF              | ✅  | アニメーションGIFは**最初のフレームのみとして読み取られ**、1フレームとして課金されます |
| WebP             | ✅  |                                                 |
| BMP / TIFF / SVG | ❌  | `You have uploaded an unsupported image` を返します  |

対応する4つの形式はすべて同一の token 数に変換されるため、コンテナによってコストが変わることはありません。

<Tip>
  **形式は、指定した MIME type ではなくファイルの内容から検出されます。** テストでは、
  `image/jpeg` として指定された PNG も問題なく動作しました —— 拡張子や MIME が誤っていても、
  ファイル自体が対応する4つの形式のいずれかであれば問題ありません。
</Tip>

## 検証済み機能マトリクス

2026-08-21 に APIYI により測定:

| 機能                                                     | ベンダーの主張 | 測定結果（`default` グループ）                                         |
| ------------------------------------------------------ | ------- | ------------------------------------------------------------ |
| インライン base64 画像                                        | ✅       | ✅                                                            |
| 公開 URL 画像                                              | ✅       | ✅                                                            |
| `file` ブロックと `file_data`                               | ✅       | ✅                                                            |
| `file_id`（Files API）                                   | ✅       | ❌ プラットフォームは Files API を提供していません                              |
| リクエストあたりの複数画像                                          | 最大 600  | ✅ 20 枚の画像で検証済み、順序と内容はすべて正確                                   |
| 画像とマルチターンコンテキスト                                        | ✅       | ✅                                                            |
| 画像と関数呼び出し                                              | ✅       | ✅、streaming 増分を含む                                            |
| 画像と JSON 出力                                            | ✅       | ✅ `json_object`                                              |
| 構造化出力 `json_schema`                                    | —       | ❌ 上流は `This response_format type is unavailable now` を返します   |
| ストリーミング                                                | ✅       | ✅、3 つのエンドポイントすべてで                                            |
| `logprobs` / `temperature` / `top_p` / `stop` / `seed` | ✅       | ✅                                                            |
| Responses `previous_response_id` のチェイニング               | ✅       | ❌ **静かに無効**（エラーは出ませんが、コンテキストはありません）。完全な `input` を自分で構築してください |

### 精度のスポットチェック

| タスク                         | 結果                    |
| --------------------------- | --------------------- |
| 6 行の英数字混在スクリーンショットの OCR     | 注文ID、金額、メールアドレスがすべて正確 |
| 5 本棒グラフの読み取り                | 5/5 正解、タイトルも含む        |
| 6×6 グリッド（36 個の図形）で特定の図形を数える | 24/24 正解              |
| 2 枚の画像の違いを見つける              | 正解                    |
| 10 枚および 20 枚の画像を順番にわたるラベル認識 | すべて正確                 |
| 否定質問（画像にないもの）               | 正しく否定され、幻覚なし          |

## 制限とよくあるエラー

| 制限             | 値           | 超過時のエラー                                                 |
| -------------- | ----------- | ------------------------------------------------------- |
| 単一画像           | 32 MiB      | `image file size exceeds limit 32 MB`                   |
| リクエストボディ       | 48 MiB      | —                                                       |
| URL の長さ        | 8192 文字     | `external link length … too long, max link length 8192` |
| 1 リクエストあたりの画像数 | ベンダー仕様で 600 | —                                                       |
| `max_tokens`   | 393,216     | `valid range of max_tokens is [1, 393216]`              |
| `top_logprobs` | 0–20        | `valid range of top_logprobs is [0, 20]`                |
| コンテキスト         | 1,048,576   | `This model's maximum context length is 1048576 tokens` |

<Note>
  1,048,576 のコンテキスト上限が適用されており、エラーメッセージでは **`max_tokens` が同じ合計に加算される** ことが示されています（`… in the messages, … in the completion`）。長いコンテキストを詰め込む場合は、出力予算のための余裕を残しておかないと上限に達してしまいます。
</Note>

よくあるその他の 400 エラー:

* `You have uploaded an unsupported image` —— 形式が 4 つのいずれかではない、または base64 が壊れている
* `Failed to download image` —— URL に到達できないか、60 秒を超えた
* `Image in assistant message is unsupported` —— 画像は `user` メッセージにのみ含められます

<Note>
  テストでは、約 **1%-3%** のリクエストで接続が静かに切断されました（クライアント側では SSL EOF またはハンドシェイクのタイムアウトとして表示されます）。これは画像ともグループとも無関係で、時折発生するトランスポート層の事象です。**必ず read timeout を設定して再試行してください**。そうしないと、1 回のリクエストが 2 分以上ハングすることがあります。
  [タイムアウト設定](/ja/faq/timeout-configuration) を参照してください。
</Note>

## 完全な例

### OpenAI 形式 (`default` グループ)

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",       # default group
    base_url="https://api.apiyi.com/v1",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "original"}},
        ],
    }],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
print(resp.usage)
```

### Anthropic 形式 (`ClaudeCode` グループ)

```python theme={null}
import base64
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",       # ClaudeCode group
    base_url="https://api.apiyi.com",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

msg = client.messages.create(
    model="deepseek-v4-flash-vision-exp",
    max_tokens=2000,
    thinking={"type": "disabled"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/png", "data": b64}},
        ],
    }],
)
print(msg.content)
```

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Vision Understanding API" icon="eye" href="/ja/api-capabilities/vision-understanding">
    ビジョンモデル全体における一般的な呼び出しパターンと比較
  </Card>

  <Card title="DeepSeek V4 Flash" icon="zap" href="/ja/api-capabilities/deepseek-v4-flash/overview">
    同じベース上のテキスト専用の兄弟で、1M コンテキストとデュアルエンドポイントを備えています
  </Card>

  <Card title="グループの選び方" icon="users" href="/ja/faq/codex-claudecode-default-groups">
    Codex、ClaudeCode、Default の各グループの違いと、どれを選ぶべきか
  </Card>

  <Card title="タイムアウト設定" icon="timer" href="/ja/faq/timeout-configuration">
    クライアントの読み取りタイムアウトとリトライ設定の推奨値
  </Card>
</CardGroup>
