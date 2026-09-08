> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ネイティブツール画像生成

> OpenAI Responses API のネイティブな image_generation ツールを使って、モデル自身に画像を生成させます。gpt-5.5 によってトリガーされ、base64 で返され、ツール呼び出しの課金に関する注意事項が含まれます。

## 概要

スタンドアロンの [text-to-image](/ja/api-capabilities/gpt-image-2/text-to-image) / [image-edit](/ja/api-capabilities/gpt-image-2/image-edit) エンドポイントに加えて、APIYI は **OpenAI Responses API のネイティブな `image_generation` ツール** もサポートしています。メインモデル `gpt-5.5` がいつ描画するかを自律的に判断し、内部で GPT Image モデルを選択し、画像を **base64** としてレスポンスの `output` 配列で返します。

<Note>
  **動作確認済み（2026-06-17）**: `gpt-5.5` + `POST /v1/responses` + `tools: [{"type": "image_generation"}]` で有効な base64 PNG が返ります。どちらの画像パスも OpenAI の公式アップストリームに直接ルーティングされます。
</Note>

<Info>
  **どちらを使うべきですか？** 「ただ画像がほしい」ケースの大半では、スタンドアロンの [`/v1/images/generations`](/ja/api-capabilities/gpt-image-2/text-to-image) エンドポイントを推奨します。これは実際の使用量のみに基づいて課金されるため、より安く、制御しやすいです。**このページのネイティブなツール方式は、パイプラインが Responses を経由しなければならない場合にのみ使用してください**（たとえば、Agent 会話の中で `gpt-5.5` が描画するかどうかを自律的に判断させる場合など）。画像 1 枚あたり約 \$0.20 の固定の tool-call 手数料が追加されます。
</Info>

## 2つの方式の比較

| 項目          | ネイティブツール方式（このページ）                                | images API                                   |
| ----------- | ------------------------------------------------ | -------------------------------------------- |
| **チャネル**    | OpenAI 公式リレーに直接転送                                | OpenAI 公式リレーに直接転送                            |
| **エンドポイント** | `/v1/responses`                                  | `/v1/images/generations`, `/v1/images/edits` |
| **ツール**     | `image_generation`                               | なし（prompt を直接渡します）                           |
| **課金**      | 従量課金 **+ ツール呼び出し料金**                             | 従量課金                                         |
| **課金の詳細**   | テキスト/画像の入出力は公式と同じ料金で、**固定のツール呼び出し料金 ≈ \$0.20/回** | テキスト/画像の入出力は公式と同じ料金                          |
| **最適な用途**   | Responses が必要なケース（例: Agent の自律動作）                | **ほとんどの画像シナリオ** — より合理的な課金                   |

> コアな違いは、**ネイティブツール方式では画像 1 枚ごとに固定の ≈\$0.20 のツール料金が追加される**のに対し、images API は実際の使用量のみに基づいて課金されるため、ほとんどのケースでより安価です。

## 最小リクエスト

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "Authorization: Bearer $APIYI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
    "tools": [
      { "type": "image_generation" }
    ]
  }'
```

### Python (requests)

```python theme={null}
import base64, requests

resp = requests.post(
    "https://api.apiyi.com/v1/responses",
    headers={
        "Authorization": "Bearer $APIYI_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-5.5",
        "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
        "tools": [{"type": "image_generation"}],
    },
    timeout=300,           # Generation is slow; allow plenty of timeout (~60-90s per image)
)
data = resp.json()

# Pull the image tool result out of the output array
for item in data["output"]:
    if item.get("type") == "image_generation_call":
        raw = base64.b64decode(item["result"])   # result field is a base64 image
        with open("output.png", "wb") as f:
            f.write(raw)
        print("Saved output.png,", len(raw), "bytes")
```

<Tip>
  オプションパラメータは `tools` 項目に入ります: `{"type": "image_generation", "output_format": "png|jpeg|webp", "size": "1024x1024", ...}`。省略すると、デフォルト（png）が使われます。
</Tip>

## レスポンス構造（主要フィールド）

成功時（HTTP 200）は、レスポンス本文に次が含まれます:

```jsonc theme={null}
{
  "id": "resp_...",
  "model": "gpt-5.5-2026-04-23",
  "status": "completed",
  "output": [
    {
      "type": "image_generation_call",   // <- key: the tool actually fired
      "result": "<a very long base64 PNG string>"  // <- the image itself, base64, png by default
    },
    { "type": "message", "content": [ /* may be empty; image responses don't always include text */ ] }
  ],
  "usage": { "input_tokens": 2347, "output_tokens": 74 }
}
```

画像が実際に生成されたかどうかを見分ける方法:

* ✅ **成功**: `output` には `type="image_generation_call"` が含まれ、`result` は `\x89PNG` で始まる有効な画像としてデコードできます。
* ⚠️ **サイレントで除去**: HTTP 200 ですが、`output` に `image_generation_call` がなく、テキストのみです（チャネルがこのツールをサポートしていない場合によくあります）。
* ❌ **エラー**: non-200、または `unknown tool` / `no available channels` などを返します。後者 2 つの場合は、`/v1/images/generations` にフォールバックしてください。

## 透過背景

`image_generation` ツールは `background: "transparent"` を受け付けます。`/v1/images/generations` と同じです。

```json theme={null}
{
  "model": "gpt-5.5",
  "input": "Generate a cartoon fox sticker",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

返される `image_generation_call` には `"background": "transparent"` がそのまま含まれ、`result` をデコードすると、実際のアルファチャンネルを持つ PNG になります。`output_format` は `png` または `webp` である必要があります。`jpeg` と組み合わせるとエラーになり、jpeg にはアルファチャンネルがないためです。

モデルごとの透過サポートについては、[透過背景の画像を生成するにはどうすればよいですか](/ja/faq/image-transparent-background) をご覧ください。

## 💰 課金

実際の 1 回の呼び出しを例にすると、（入力 2347 token、出力 74 token、1122×1402 の PNG を 1 枚生成）**最終請求額 = \$0.213954** となり、これは正しいです。内訳は次のとおりです。

| Component              | クォータ計算                                                                                       | USD                  |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| Text portion           | `(input 2347 + output 74×completion multiplier 6) × input multiplier 2.5` = **6977.5 quota** | ≈ \$0.014            |
| **Image tool portion** | **≈ 100,000 quota** (per image, independent of tokens)                                       | **≈ \$0.20 / image** |
| **Total**              | **106,977 quota**                                                                            | **\$0.213954**       |

> 換算: `500,000 quota = \$1`（`106977 quota = \$0.213954` から算出）。

<Warning>
  **コンソールの詳細ページにおける表示上の癖（これを顧客に事前に説明してください）**

  APIYI の「条件付き課金詳細」ページでは:

  * 上部には、計算式の **Text portion**（`base cost = (2347 + 74×6) × 2.5 = 6977.50`）しか表示されません。
  * **Image tool 呼び出し料金（≈100,000 quota / ≈\$0.20）は、詳細一覧では空白行として表示されますが、描画されません。**
  * ただし、下部の「最終 quota 106977 / \$0.213954」には **正しく反映されています**。

  **結論: 課金は正常かつ正確です**。詳細 UI が「image tool」の行を表示しないだけなので、各明細を合計しても最終合計と一致しません。顧客には、**合計金額は正しいこと、差分はこの画像のツール料金（≈\$0.20/image）であり、個別の項目として表示されていないだけ**だと強調してください。
</Warning>

### コストの注意点

* 生成料金は **1 枚あたり固定**（≈\$0.20/image）で、prompt の長さによって変動しません。text token のコストはそれに比べると小さいです。
* 各画像の生成には約 60〜90 秒かかるため、クライアントのタイムアウトは 300 秒以上に設定してください。
* 画像だけが必要で、モデルに自律的な判断をさせる必要がない場合は、単独の [`/v1/images/generations`](/ja/api-capabilities/gpt-image-2/text-to-image) エンドポイントのほうが、より安く、より制御しやすい可能性があります。

## トラブルシューティング

| 症状                                 | 可能性の高い原因                            | 対処法                                              |
| ---------------------------------- | ----------------------------------- | ------------------------------------------------ |
| 200 だが `image_generation_call` がない | 現在のチャネルはそのツールをサポートしていません（黙って除去されます） | キー/チャネルを切り替えるか、`/v1/images/generations` を使ってください |
| `no available channels`            | キーのグループに一致するチャネルがありません              | GPT/画像チャネルのあるキーグループに切り替えてください                    |
| リクエストのタイムアウト                       | 生成が遅いです                             | クライアントのタイムアウトを300秒に設定してください                      |
| `result` が PNG にデコードできない           | 出力形式が変わった / チャネルの異常                 | `output_format` を確認し、マジックバイトを検証してください            |

## 関連ドキュメント

* [GPT-Image-2 概要](/ja/api-capabilities/gpt-image-2/overview) - モデル概要と料金
* [テキストから画像 API リファレンス](/ja/api-capabilities/gpt-image-2/text-to-image) - `/v1/images/generations`、ほとんどの場合のデフォルト選択です
* [画像編集 API リファレンス](/ja/api-capabilities/gpt-image-2/image-edit) - `/v1/images/edits`、参照画像編集 / 複数画像融合 / マスク
