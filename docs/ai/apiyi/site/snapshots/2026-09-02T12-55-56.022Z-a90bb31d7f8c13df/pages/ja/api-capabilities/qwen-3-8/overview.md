> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max テキスト生成

> Alibaba Qwenの旗艦モデルQwen3.8-Max: 2.4Tパラメータの疎な MoE、100万コンテキストウィンドウ、131K出力、ネイティブな画像・動画入力。APIYIでは1M tokenあたり$1.65/$4.95で掲載されており、公式より17.5%安くなっています。586件のライブテスト呼び出しに基づく機能マトリクスと落とし穴も含みます。

Qwen3.8-Max (`qwen3.8-max`) は Alibaba Qwen の新しいフラッグシップで、2026年8月3日にリリースされました。これは総パラメータ数2.4兆のスパース MoE モデルで、**1M context window**、最大出力131K、さらに text、image、video 入力をネイティブにサポートします。APIYI は公開当日にこれを掲載し、**586回のライブテスト呼び出し**を実施しました — このページの機能マトリクス、パラメータの挙動、課金に関する注記は、公式ドキュメントを言い換えたものではなく、すべてそれらのテストに基づいています。

<Info>
  **Qwen3.8-Max は APIYI で利用可能です**: モデル名は `qwen3.8-max` です。**Thinking はデフォルトでオン**（`xhigh`ティアでは、Thinking tokens は出力として課金されます）なので、日常的なチャットでは `reasoning_effort="none"` を明示的に設定してください — テストでは、これにより出力はおおよそ 158 tokens から 5 へ減少しました。前世代については、[Qwen3.6 シリーズ（旧版）](/ja/api-capabilities/qwen-3-6/overview) をご覧ください。
</Info>

## このモデルを選ぶ理由

<CardGroup cols={2}>
  <Card title="公式より17.5％低い" icon="tag">
    \$1.65の入力、\$4.95の出力が1M tokensあたりで、Alibaba Cloudの\$2/\$6より安いです。[チャージプロモーション](/ja/faq/recharge-promotions)も上乗せできます。
  </Card>

  <Card title="1Mコンテキスト、検証済み" icon="scroll">
    8K / 32K / 128K の本文全体で、マーカーが文書中盤と末尾に埋め込まれていても、両方のエンドポイントが **6/6を完全一致で** 再現しました。128K の呼び出しには約80秒かかります。
  </Card>

  <Card title="3つのモダリティ、1つのモデル" icon="eye">
    テキスト、画像、動画の入力はいずれも動作確認済みです — 「long-context model」と「vision model」を切り替える必要はありません。
  </Card>

  <Card title="エージェント的な作業が大幅に強化" icon="wrench">
    FrontierSWEは前世代の40.7から**73.5**へ、DeepSWEは21.6から56.6へ向上しました。ツール呼び出しチェーンは完全で、2往復の検証も済んでいます。
  </Card>
</CardGroup>

## エンドポイントの対応状況

| Endpoint               | 状態               | 備考                                                                                                                                  |
| ---------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/chat/completions` | ✅ 完全に動作します       | **推奨。** tool calling、構造化出力、マルチモーダル、ストリーミングのすべてが検証済みです                                                                               |
| `/v1/messages`         | ⚠️ コード統合には使用可能です | 履歴を再生する前に `thinking` ブロックを削除してください。削除しないと、2回目のターンで 400 が返ります。Claude Code のような既製クライアントはまだ使用できません — 下の「Anthropic エンドポイントの使用」を参照してください |
| `/v1/responses`        | ❌ まだサポートされていません  | 30件のテスト呼び出しはすべて失敗しました。上流に報告済みです                                                                                                     |

## 料金

1M token あたりの割引前リスト価格:

| 項目               | APIYI         | Alibaba Cloud | 差分      |
| ---------------- | ------------- | ------------- | ------- |
| 入力               | **\$1.65**    | \$2.00        | 17.5％安い |
| 出力（thinking を含む） | **\$4.95**    | \$6.00        | 17.5％安い |
| キャッシュ読み取り        | **\$0.20625** | \$0.25        | 17.5％安い |
| キャッシュ書き込み        | **\$2.0625**  | —             | —       |

[チャージ特典](/ja/faq/recharge-promotions) を重ねて適用すると、実質コストをさらに下げられます。

## Specifications

| Item                | Value                                                 |
| ------------------- | ----------------------------------------------------- |
| Model name          | `qwen3.8-max`                                         |
| Architecture        | 疎な MoE、総パラメータ数 2.4 兆                                  |
| Context window      | 1M tokens（thinking なしの入力 991K、あり 983K）                |
| Max output          | 131,072 tokens（範囲外のリクエストでは明示的な上限 `[1, 131072]` を返します） |
| Max thinking budget | 262K tokens                                           |
| Thinking mode       | デフォルトでオン、`xhigh` レベル                                  |
| Input modalities    | テキスト、画像、動画                                            |
| Output rate         | 約 19〜22 tokens/s（実測）                                  |
| Time to first token | 約 1.85 s のストリーミング（P50 実測）                             |

公式ベンチマーク: GPQA Diamond 92.6、PaperBench 93.0、OmniDocBench 1.5 92.1、Terminal-Bench 2.1 86.6、OSWorld-Verified 86.1、IFBench 82.8、FrontierSWE 73.5、SWE-bench Pro 67.7。

## 推論の制御（最重要セクション）

Qwen3.8-Max はデフォルトで推論します。`xhigh` ティアです。推論 token は出力として課金され、その 90％超を占めることがよくあります。

### 7つの値、4つの実質ティア

このパラメータは 7つの値を受け付けますが、実際には **4つの実質ティア** にしか対応していません。

| 渡した値                     | 実効ティア            | 実測された推論         |
| ------------------------ | ---------------- | --------------- |
| `none`                   | 推論オフ             | 0 tokens        |
| `minimal` / `low`        | 低                | 約100 tokens     |
| `medium`                 | 中                | 約150 tokens     |
| `high` / `xhigh` / `max` | デフォルトティア（3つとも同一） | 約150–175 tokens |

`max` を渡しても、`xhigh` より深く推論することはありません。その他の値では、許可された値の一覧を示す 400 が返ります。

### 推論をオフにする方法

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Hello"}],
    reasoning_effort="none",
    max_tokens=500,
)
```

`enable_thinking: false` は `extra_body` と `chat_template_kwargs: {"enable_thinking": false}` で同等で、どちらでも使えます。

<Warning>
  **`max_tokens` では推論 tokens を制限できません。** `max_tokens=1` を設定しても、**1,054** output tokens が課金され、そのうち 1,045 が推論でした。

  `max_tokens` は表示される回答を切り詰めるだけです。**コストを制御するには `reasoning_effort` を使ってください — `max_tokens` に頼らないでください。**
</Warning>

### `thinking_budget` は影響しません

128 / 512 / 4096 を渡しても、いずれも `low` ティアと同じように動作し、数値自体は無視されます。**代わりに `reasoning_effort` を使ってください。**

## コード例

### Python（OpenAI SDK 互換）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# Everyday chat: thinking off, fast and cheap
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Explain load balancing in one sentence."}],
    reasoning_effort="none",
    max_tokens=500,
)
print(resp.choices[0].message.content)

# Hard reasoning: keep the default thinking tier
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Prove that among any 5 integers, some 3 sum to a multiple of 3."}],
    max_tokens=4000,
)
print(resp.choices[0].message.reasoning_content)  # thinking trace
print(resp.choices[0].message.content)            # final answer
```

### 画像入力

```python theme={null}
import base64

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "What number is written in this image?"},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
    ]}],
    max_tokens=500,
)
```

リモートの画像 URL もこのエンドポイントで使用できます。`url` を `https://...` アドレスに設定するだけです。

### 動画入力

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "What happens in this video?"},
        {"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{b64_video}"}},
    ]}],
    max_tokens=1000,
)
```

<Tip>
  テストでは、動画の理解には呼び出しごとに **144–285 秒** かかりました。クライアントのタイムアウトは 300 秒より長く設定し、ストリーミングまたは非同期タスクキューを優先してください。
</Tip>

フレームシーケンス形式 `{"type": "video", "video": [frame1, frame2, ...]}` もあり、こちらは **4–8000 フレーム** が必要です。4 未満だと 400 が返ります。

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.8-max",
    "messages": [{"role": "user", "content": "Hello"}],
    "reasoning_effort": "none"
  }'
```

## ツール呼び出し

Chat Completions エンドポイントでのツール呼び出しは **完全に動作します**: 単一ツール、並列ツール、2ラウンドの往復、20個のツールから1つを選ぶこと、ストリーミングデルタ、そして `parallel_tool_calls: false` まですべて検証済みです。

<Warning>
  **強制ツール呼び出しでは thinking をオフにする必要があります。** `tool_choice` が `"required"` であるか、特定の関数名を指定している場合は、`reasoning_effort="none"` も設定する必要があります。そうしないと、400（`tool_choice does not support being set to required or object in thinking mode`）になるか、呼び出しが静かにスキップされます。

  `tool_choice` を `"auto"` / `"none"` に設定する場合は影響を受けません。同じことが `n > 1` にも当てはまります。
</Warning>

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "What's the weather in Beijing?"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
    reasoning_effort="none",   # required
)
```

## 構造化出力

`response_format`は、`json_schema`を用いたテストで**厳密に**満たされました: 入れ子のオブジェクト、enum、配列、そして`additionalProperties: false`はすべて有効になり、余分なフィールドも Markdown のフェンスもありませんでした。

<Tip>
  **構造化出力では推論を無効にします。** 同じスキーマで、並べて測定しました:

  | 構成                                        | 出力 tokens | うち推論  | レイテンシー |
  | ----------------------------------------- | --------- | ----- | ------ |
  | `json_schema` + デフォルト推論                   | 4,066     | 3,971 | 100 s  |
  | `json_schema` + `reasoning_effort="none"` | 154       | 0     | 4.7 s  |

  準拠性は同一で、コストとレイテンシーは1桁異なります。
</Tip>

## コンテキストキャッシュ

* **約1,024 token 付近でのヒット閾値**: 818 token のプレフィックスはミスし、1,070 token 以上でヒットします
* **実際のマルチターン会話ではヒットします**: メッセージをターンごとに追加すると、毎ラウンドでヒットしました
* **長文書ほど恩恵が大きいです**: 128K でキャッシュ済み入力が 98.6％、32K で 99.3％

<Warning>
  **API レスポンス内のキャッシュフィールドを使ってヒットが発生したかどうかを判断しないでください。** あるルートでは `cache_read_input_tokens` は常に 0 で、別のルートではレスポンスにキャッシュフィールドがまったく含まれません — それでも、同じリクエストがコンソールの課金記録では実際のキャッシュ読み取りとして表示されます。

  **コンソールの「キャッシュ課金の詳細」を信頼してください。** ここには、キャッシュ作成 (1.25x) とキャッシュ読み取り (0.125x) について、token 数と金額がそれぞれ別々に記載されています。
</Warning>

<Tip>
  **キャッシュ課金の仕様はエンドポイントごとに固定ではなく、ルートごとに異なります。** テストでは、同じルート上で同じ形のリクエストが、別の日には 2 つの異なる方式で課金されました:

  | 方式              | 課金の仕組み                                          |
  | --------------- | ----------------------------------------------- |
  | OpenAI cache    | prompt tokens に含まれます。キャッシュされた部分は 0.125x で課金されます |
  | Anthropic cache | ベース tokens とは別に精算されます: 作成時は 1.25x、読み取り時は 0.125x |

  コンソールログで 1 件のリクエストを開くと、「キャッシュ課金の詳細」に適用された方式と全体の計算内容が表示されます。**それは、任意の呼び出しが実際にどのように課金されたかを確認できる唯一の場所です。**
</Tip>

<Tip>
  Anthropic のエンドポイントでは、`cache_control` なしでも暗黙的なキャッシュヒットが可能です。マーカーをあちこちに追加する前に、コンソールで実際の課金額を比較してください — マークすれば常に安くなるとは限りません。
</Tip>

## Anthropic エンドポイントの使い方

`/v1/messages` はコード統合で使えますが、履歴を再生する前に **`thinking` ブロックを必ず削除してください**。そうしないと 400（`if content is list. item must be dict and key[type] should in dict`）になります。

```python theme={null}
def strip_thinking(blocks):
    return [b for b in blocks if b.get("type") != "thinking"]

messages.append({"role": "assistant", "content": strip_thinking(resp["content"])})
```

このフィルターを入れた状態で、3ターンのターンをまたいだメモリ、2ラウンドの tool 往復、そして tool の結果が後続ターンに保持されることを確認しました。

### 2026-08-08 の追記: マルチターンの tool 呼び出し自体は問題ありません

専用の 300 回再テストで、**マルチターンの `tool_use` / `tool_result` チェーン自体は動作する**ことが確認されました。唯一の障害は `thinking` ブロックです。

* **`tool_result` には追加の形式制約がありません。** 文字列形式でもブロック配列形式でも、`content`、`is_error` が true でも false でも、空の結果、50KB の結果、順序が前後した再送、一部再送、捏造した `tool_use_id` ― 15 パターンすべてが通過しました。制御文字、絵文字、20万文字の1行も通過しました。
* **`signature` の値では解決しません。** 空文字列、`null`、キーを完全に削除した場合、または捏造した値でも、すべて同じ 400 が返ります。**ブロック全体を落とす必要があります。**
* **ストレステストは削除後に通ります。** 24K-token の system prompt と 8 tools を使う自律エージェントループで、12 ターン × 2 回実行、コンテキストが 28.7K まで増加しても — **24/24 が成功**しました。
* **SSE イベントは完全です**: `message_start`、`content_block_start`、`content_block_delta`、`content_block_stop`、`message_delta`、`message_stop`、それに `ping` も含まれます。`text_delta`、`thinking_delta`、`signature_delta`、`input_json_delta` もすべて正しく動作します。
* **レート制限や同時実行数制限は確認されませんでした**: 同一リクエストを 40 回連続で繰り返してもすべて成功し、同時実行数 1 / 4 / 8 / 16 / 32 でも 429 なしで成功しました。

<Warning>
  **Claude Code などの既製クライアントはまだ使えません。** 履歴の content blocks をそのまま再送し、その挙動は変更できないため、**最初のターンでは `tool_use` が通常どおり返りますが、2回目のターンで `tool_result` を送り返すと 400 になります** — これがこのエンドポイントで最も多い失敗報告です。

  新しい Claude Code ビルドでは `thinking: {"type": "adaptive"}` も送信されます。ルートによっては `enabled` / `disabled` / `auto` しか受け付けず、**最初**のターンで 400 を返します。

  代わりに `/v1/chat/completions` を使ってください。
</Warning>

### Claude Code の中で使いたい場合にすべきこと

「特定のクライアントだけで動かない」系の問題では、**制限は私たちの適応ではなくモデル側にある可能性が高いです**。まずは Alibaba Cloud の Bailian 公式プラットフォームで同じ使い方を確認することをおすすめします（コンソール: `bailian.console.aliyun.com`）。

* 公式プラットフォームでも拒否されるなら、それはモデル側の制限であり、こちらで回避する方法はありません。
* そこで動くのにこちらで動かないなら、リクエストボディを送ってください。チャネル提供元に確認します。

もし目的が単に **Claude Code や類似クライアント内で作業を進めること** なら、APIYI の **Claude シリーズ** や **OpenAI シリーズ** のほうが簡単です。デフォルトグループは公式ルーティングされており、追加の適応は不要です。

### その他の違いと補足メモ

* `response_format` は黙って無視されます（構造化出力にするには tool 呼び出しを強制してください）
* `tool_choice` は OpenAI 形式のみ受け付けます。**強制ツール呼び出し（`required` または名前付き関数）は、両方のエンドポイントの推論モードではサポートされていません**
* 画像は base64 でなければなりません。リモート URL は 400 を返します
* `reasoning_effort` は効果がありません — 推論をオフにするには `thinking: {"type": "disabled"}` を使ってください
* `stop_sequences` **は切り詰められます** が、`stop_reason` は `end_turn` と誤って報告され、`stop_sequence` フィールドは `null` で返ってくるため、生成が止まった理由の検出には頼らないでください
* ストリーミング時の使用量はルートによって異なります。あるルートでは `message_start` 中の `input_tokens` が信頼できず、別のルートでは最終的なストリーミング `output_tokens` が常に 0 です。**正確な集計には、非ストリーミングの usage か課金記録を使ってください**
* 測定された入力上限は 983,616 tokens です。これを超えると `Range of input length should be [1, 983616]` が返ります

<Tip>
  **十分に長いタイムアウトを設定してください。** テストでは最初の SSE バイトまで 6〜17 秒かかり、その間は接続が完全に無応答でした。さらにリクエストボディが大きいほど遅くなり、256KB で約 44 秒、1MB で 160 秒でした。Docker の背後、踏み台ホスト、または社内ゲートウェイの先では、どの中継点でもアイドルタイムアウトがあると「長時間ハングしてからエラーで終了する」として現れます。クライアントのタイムアウトは 300 秒以上に設定してください。
</Tip>

## パラメータ互換性

| パラメータ                                              | 状態 | 備考                                                                                       |
| -------------------------------------------------- | -- | ---------------------------------------------------------------------------------------- |
| `temperature`                                      | ✅  | 有効範囲は`[0.0, 2.0)`です; 2 を渡すと 400 を返します                                                    |
| `top_p`                                            | ✅  | 有効範囲は`(0.0, 1.0]`です                                                                      |
| `top_k` / `presence_penalty` / `frequency_penalty` | ✅  |                                                                                          |
| `stop` / `stop_sequences`                          | ⚠️ | 切り詰めは機能しますが、Anthropic エンドポイントでの `stop_reason` が `end_turn` と誤って報告されます                    |
| `logprobs` / `top_logprobs`                        | ✅  |                                                                                          |
| `stream` + `stream_options`                        | ⚠️ | 長いストリームは末尾で停止することなく正常に終了しますが、ストリーミングされた使用量はルートごとに異なります — 正確な集計には非ストリーミングまたは課金記録を使用してください |
| `partial: true`                                    | ✅  | プレフィックス継続; 継続中は推論しません                                                                    |
| `n > 1`                                            | ⚠️ | `reasoning_effort="none"` が必要です                                                          |
| `seed`                                             | ❌  | 同じ seed でも異なる出力が生成されました — 決定性は保証されません                                                    |
| `prefix: true`                                     | ❌  | 効果はありません; `partial: true` を使用してください                                                      |
| `thinking_budget`                                  | ❌  | 数値は無視されます                                                                                |
| 内蔵ウェブ検索                                            | ❌  | `enable_search` と `tools: [{"type": "web_search"}]` の両方が黙って破棄されます                        |

## ベストプラクティス

<CardGroup cols={2}>
  <Card title="日常的なチャットと大量コール" icon="zap">
    `reasoning_effort="none"` を明示的に設定します。計測レイテンシーは約5秒から2秒に下がり、出力 token もおよそ 1/30 になりました。
  </Card>

  <Card title="長文ドキュメントとコードベース" icon="scroll">
    128K の再現精度はテストで完全で、長文ドキュメントのキャッシュヒット率も高いです。大きなドキュメントはメッセージリストの先頭に置き、質問は末尾に置いてください。
  </Card>

  <Card title="データ抽出" icon="braces">
    `json_schema` で制約し、thinking を無効にします。準拠性には影響しません。
  </Card>

  <Card title="エージェントとツールオーケストレーション" icon="wrench">
    `/v1/chat/completions` を使います。ツール呼び出しを強制する際は、thinking を無効にするのを忘れないでください。
  </Card>
</CardGroup>

## よくある質問

<AccordionGroup>
  <Accordion title="max_tokens を設定したのに、なぜまだ大量の tokens が課金されるのですか？">
    `max_tokens` は表示される回答部分だけを制御し、推論部分は対象外です。私たちの計測では、`max_tokens=1` で 1,054 の出力 tokens が課金されました。コストを抑えるには `reasoning_effort="none"` を使用してください。
  </Accordion>

  <Accordion title="名前付き関数を指定した tool_choice が 400 を返すのはなぜですか？">
    強制された tool 選択は、推論が有効な間はサポートされていません。代わりに `reasoning_effort="none"` を併用してください。
  </Accordion>

  <Accordion title="なぜ /v1/responses に到達できないのですか？">
    このエンドポイントはまだそのモデルに接続されていません — 30 回のテスト呼び出しはすべて失敗し、エラーコードは 404 と 400 の間で交互になりました。これは上流に報告済みで、利用可能になり次第 [最新情報](/en/live) でお知らせします。代わりに `/v1/chat/completions` を使用してください。
  </Accordion>

  <Accordion title="このモデルを Claude Code で使えますか？">
    まだです。`/v1/messages` エンドポイントは `thinking` ブロックを含む履歴メッセージを拒否し、Claude Code はそれらをそのまま再生します — そのため最初のターンでは `tool_use` が発生し、2 回目のターンでは `tool_result` が戻ってきた時点で 400 が返されます。自分のコードから呼び出す場合は、それらのブロックを取り除けば、エンドポイントは問題なく動作します。

    もし Claude Code 内で作業を進める必要があるなら、APIYI Claudeシリーズまたは OpenAIシリーズのほうが簡単です — デフォルトのグループは公式にルーティングされており、追加の調整は不要です。Alibaba Cloud の Bailian プラットフォーム（`bailian.console.aliyun.com`）で同じ利用方法を先に確認することもできます。公式プラットフォームでも拒否されるなら、モデル側の制限です。
  </Accordion>

  <Accordion title="最初のターンは動作するのに、ツール結果を送ったあとにハングするかエラーになるのはなぜですか？">
    これは `/v1/messages` で見られる典型的な症状です。再生されたアシスタントメッセージには `thinking` ブロックが含まれており、エンドポイントはそれを 400 で拒否します。`signature` を空文字列または `null` に設定しても、あるいはフィールドを削除しても解決しません — **`thinking` ブロック全体を削除する必要があります**。

    削除すれば、24K コンテキストでの 12 ターンのツールループはテストで最後まで実行できました。複数ターンの `tool_use` / `tool_result` チェーン自体は問題ではありません。
  </Accordion>

  <Accordion title="reasoning_tokens や cache フィールドが usage から時々欠けるのはなぜですか？">
    このモデルは複数の上流ルート経由で提供されており、同じ usage フィールドを返すわけではありません。`reasoning_tokens` と `cached_tokens` を省略するものもあれば、`cache_read_input_tokens` を常に 0 と報告するものもあり、最後にストリーミングされた `output_tokens` を常に 0 と報告するものもあります。整合のため、これは上流に報告済みです。

    **API が報告する内容と、実際に課金される内容は異なります。** 正確な集計には、コンソールログ内の個別リクエストの課金詳細を使用してください。そこには base と cache 課金の両方の完全な計算が表示されます。
  </Accordion>

  <Accordion title="動画の呼び出しはなぜこんなに遅いのですか？">
    動画理解では 1 回の呼び出しあたり 144〜285 秒を計測しました。これはモデル自身の処理時間です。タイムアウトは 300 秒超に設定し、非同期キューの利用を検討してください。
  </Accordion>
</AccordionGroup>

## 関連

* [Qwen3.8-Max プレイグラウンド](/ja/api-capabilities/qwen-3-8/chat-completions) — リクエストを直接送信します
* [Qwen3.6 series (legacy)](/ja/api-capabilities/qwen-3-6/overview) — 以前の5つのモデル
* [Qwen3.8-Max リリースノート](/en/news/qwen-3-8-max-launch) — ベンチマークと詳細な解説
* [モデル料金](/en/models) — モデル別レート、キャッシュ料金、利用可能なエンドポイント
* [チャージプロモーション](/ja/faq/recharge-promotions) — 併用可能な割引

<Info>
  このページの測定値は、2026-08-03（12:50–14:35 UTC+8）の586件の実ライブ呼び出しに基づいています。課金関連の結論は、APIから返されるusageフィールドに基づいており、請求書と行ごとの照合はしていません。チャネルの調整により、モデルおよびゲートウェイの挙動は変わる場合があります。実ライブ呼び出しを信頼できる情報源として扱ってください。
</Info>
