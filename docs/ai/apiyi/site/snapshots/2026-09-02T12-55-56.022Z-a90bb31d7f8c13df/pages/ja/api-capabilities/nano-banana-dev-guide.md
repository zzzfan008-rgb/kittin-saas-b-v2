> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana シリーズ開発者ガイド

> Nano Banana シリーズ（Pro / 2 / 2 Lite / Gen 1）向けの、モデル選定、課金、エンドポイント、開発形式、よくある質問をまとめた総合ガイドです。Gemini 画像生成 API を使い始める開発者の手助けとなります。

## モデルカード

| モデル                     | 公式モデルID                          | 課金                                                                      | 備考          |
| ----------------------- | -------------------------------- | ----------------------------------------------------------------------- | ----------- |
| **Nano Banana Pro**     | `gemini-3-pro-image-preview`     | 1リクエストごとの固定 **\$0.09/req**（約 ¥0.63；チャージ後のプロモーション適用時は約 ¥0.55）            | 最高品質        |
| **Nano Banana 2**       | `gemini-3.1-flash-image-preview` | 1リクエストごとの **\$0.055/req**（4K出力に推奨）；または動的な token ベース課金、2K は約 **\$0.04**  | 最もお得        |
| **Nano Banana 2 Lite**  | `gemini-3.1-flash-lite-image`    | 1リクエストごとの固定 **\$0.025/req**；または token ベース課金で約 **\$0.018/req**（公式価格の40%） | 最速かつ最安、1Kのみ |
| **Nano Banana** (Gen 1) | `gemini-2.5-flash-image`         | 1リクエストごとの固定 **\$0.02/req**                                              | 最安          |

<Info>
  完全な価格比較、1リクエスト課金と token ベース課金の比較、ならびに token の選び方については、[Nano Banana シリーズの料金](/ja/api-capabilities/nano-banana-pricing)をご覧ください。
</Info>

### サイズ制御

* **元画像の比率に従う**: `aspectRatio` を単純に省略します。複数画像編集のシナリオでは、**最後の画像のサイズ** が優先されます
* **解像度 `imageSize`**: `1K` / `2K` / `4K` をサポート
  * Nano Banana (Gen 1) は **1Kのみ対応**
  * Nano Banana 2 は **512px を追加**
  * Nano Banana 2 Lite は **1Kのみ対応**（2K/4K/512px は非対応）

<Warning>
  同じコードで第1世代の `gemini-2.5-flash-image` を呼び出す場合は、**`imageSize` パラメータを必ず削除する必要があります**（`2K` / `4K` をサポートしていないためです）。そうしないと、呼び出しは失敗します。
</Warning>

## 統合方法

### 公式ドキュメント

* Google 公式ドキュメント: `ai.google.dev/gemini-api/docs/image-generation`
* APIYI と統合するには、**request URL + キーを APIYI のものに置き換える**だけで構いません。その他のパラメータは公式のものとすべて同じです

### 公式ステータスの確認（上流側の問題の診断）

Nano Banana シリーズは Google の AIStudio / Gemini API の上で動作しています。まれに、**ぼやけた 2K / 4K 出力**や**出力失敗**が、統合レイヤーではなく **Google 側**の問題で発生することがあります。Google の公式ステータスページを確認できます（ご自身でコピーしてアクセスしてください）：`aistudio.google.com/status`。

たとえば、2026年6月19日にはそのページで「Issues with Nano Banana」と報告されており、Gemini API と AI Studio 上の Nano Banana 2 / Pro で 2K または 4K 解像度に問題が発生していました。同様の症状が見られた場合は、まず公式ステータスページと照らし合わせて、上流側の障害かどうかを素早く判断してください。

<Info>
  APIYI は冗長化のため、Nano Banana シリーズを **AIStudio + Vertex のデュアルチャネル** で運用しています。片方の公式チャネルに問題が発生しても、もう一方が引き継いでサービスを利用可能な状態に保ちます。
</Info>

### エンドポイント対応

* **推奨エンドポイント**（Gemini ネイティブ）：`https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
* **OpenAI 互換モード** での呼び出しに対応しています（注意：**URL アップロードはサポートされていません**。代わりに Base64 を使用してください）
* **サポートしていません** `/v1/image/generations`

### 開発形式（デフォルト推奨）

* **\[推奨] Google ネイティブのエンドポイント形式を使用してください**
* 画像: **Base64 でアップロードし、ダウンロードして再ホストする**
* 呼び出し方法: **同期マルチスレッド呼び出し**。非同期呼び出しにはまだ対応していません

## 入力画像の要件

* **単一画像は 7MB を超えられません**（Google のルールです）；Google Cloud Storage 経由で取り込む場合は、1ファイルあたりの上限は 30MB です
* **1 prompt あたり最大 14 枚の画像**
* **対応 MIME type**: `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif`（`jpg` 形式はすでに APIYI でサポートされています）
* **Base64 のサイズ増加**: 画像を Base64 に変換すると、サイズは約 **33.3%** 増加します（7MB の画像は約 9.3MB になります）
* **APIYI の制限**: 1 回のリクエストでアップロードされる画像の総量は **100MB 未満** である必要があります。すべての呼び出しは同期実行であり、過大なペイロードはメモリの急増を引き起こす可能性があります

<Frame caption="Google official technical specs: inline / console upload per-file limit is 7MB, supporting png/jpeg/webp/heic/heif">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-image-size-limit.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=fc422e34e493a907363115118f715690" alt="Google Gemini 3 Pro Image 公式技術仕様表: 単一画像の上限 7MB、1 prompt あたり最大 14 枚の画像、サポートされているアスペクト比と MIME type" width="1400" height="701" data-path="images/nano-banana-image-size-limit.png" />
</Frame>

<Frame caption="Base64 encoding increases size by about 33.3%: a 7MB image is roughly equal to 9.3MB">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-base64-size.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=dffe216ee6e97c2661ce816eb5408a22" alt="Base64 サイズ計算: 7MB の元画像は 4/3 の比率でエンコードすると約 9.33MB になります" width="1448" height="984" data-path="images/nano-banana-base64-size.png" />
</Frame>

**ベストプラクティス**: API に送信する前に画像へ**可逆圧縮**を適用し、過大な解像度によってリクエストが遅くならないようにしてください。

Google 公式仕様リファレンス（コピーしてご自身でアクセスしてください）: `docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image`

## URL 画像入力

Base64 に加えて、**Gemini ネイティブ エンドポイント** では、画像 URL（画像ホスト / OSS アドレス）を `fileData.fileUri` で直接渡すこともサポートしており、ローカルでのエンコードが不要になります。

<Warning>
  **URL アップロードには画像ホストと OSS アドレスに厳しい要件があります**: アドレスがグローバル CDN 上にない場合（例: Tencent Cloud Object Storage は既定で中国国内限定の CDN になります）、Google のサーバーからは画像に到達できない可能性が高く、リクエストが失敗します（典型的な症状: **出力で画像が参照されない**）。

  **可能であれば、より安定する Base64 アップロードを優先してください** — プラットフォームの観点では、これが最も運用への投資が大きく、最も信頼性の高い経路です。
</Warning>

<Info>
  URL アップロードは **Gemini ネイティブ エンドポイント** でのみ動作します。**OpenAI 互換モードでは URL アップロードをサポートしておらず**、Base64 が必要です。
</Info>

### Curl の例 (fileUri)

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### Python の例 (fileUri)

```python theme={null}
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini 3 Pro Image - Image editing (minimal file_uri version)
Purpose: only for a quick check that the endpoint works
"""

import requests
import base64
import json
from pathlib import Path
from datetime import datetime

# ============================================================================
# Configuration
# ============================================================================

API_KEY = "sk-"
API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

# Image URL
IMAGE_URL = "https://raw.githubusercontent.com/apiyi-api/ai-pics/refs/heads/main/1762260696217_dd0352c1f9604540.png"
IMAGE_MIME_TYPE = "image/png"

# Edit instructions
EDIT_PROMPT = "Change the person's clothes to a blue jacket and hair to a purple gradient; keep pose, gaze direction, and other structural features unchanged."
SYSTEM_PROMPT = "You are a professional expert in image description and generation. Your task is to produce high-quality image prompts with rich detail and a clear artistic style, or to make accurate, creative edits to existing images, based on the user's request."

# Output parameters
ASPECT_RATIO = "9:16"
RESOLUTION = "4K"
MAX_OUTPUT_TOKENS = 8000
OUTPUT_FILE = f"minimal_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

# ============================================================================
# Core
# ============================================================================

def main():
    print("=" * 60)
    print("Testing file_uri endpoint")
    print("=" * 60)
    print(f"Image URL: {IMAGE_URL[:80]}...")
    print(f"Edit prompt: {EDIT_PROMPT}")
    print(f"Output params: {RESOLUTION}, {ASPECT_RATIO}")
    print("-" * 60)

    # Build the request body
    # Note: fileData, mimeType, fileUri must be in camelCase
    payload = {
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "imageConfig": {
                "imageSize": RESOLUTION,
                "aspectRatio": ASPECT_RATIO
            },
            "maxOutputTokens": MAX_OUTPUT_TOKENS
        },
        "contents": [
            {
                "role": "model",
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            {
                "role": "user",
                "parts": [
                    {
                        "fileData": {           # camelCase: fileData (not file_data)
                            "mimeType": IMAGE_MIME_TYPE,  # camelCase: mimeType
                            "fileUri": IMAGE_URL          # camelCase: fileUri
                        }
                    },
                    {"text": EDIT_PROMPT}
                ]
            }
        ]
    }

    # Send the request
    print("\nSending request...")
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=300
        )

        print(f"Response status: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return

        # Parse the response
        data = response.json()
        print("✅ Response received")

        # Save full response for debugging
        with open(OUTPUT_FILE + ".response.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"📄 Response saved: {OUTPUT_FILE}.response.json")

        # Extract and print text
        parts = data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "text" in part:
                print(f"\n💬 Text response: {part['text']}")

        # Save image
        for part in parts:
            if "inlineData" in part or "inline_data" in part:
                image_data = part.get("inlineData", part.get("inline_data", {})).get("data")
                if image_data:
                    image_bytes = base64.b64decode(image_data)
                    with open(OUTPUT_FILE, "wb") as f:
                        f.write(image_bytes)
                    print(f"\n✅ Image saved: {OUTPUT_FILE}")
                    print(f"📦 File size: {len(image_bytes) / 1024:.1f} KB")
                    print(f"🔗 File path: {Path(OUTPUT_FILE).resolve()}")
                    return

        print("⚠️  No image data found in the response")

    except requests.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
    print("\n" + "=" * 60)
    print("Test finished")
    print("=" * 60)
```

<Tip>
  `fileData`、`mimeType`、および`fileUri` は **camelCase** である必要があります（`file_data` / `file_uri` ではありません）。そうでない場合、パラメータは無視され、画像は参照されません。
</Tip>

## 課金の基本（重要）

* **同期呼び出しの所要時間**: Pro / 2 の 4K では、通常、約 **30〜150秒** の妥当な生成時間がかかります
* **タイムアウト後の切断でも課金されます**: たとえば、生成に 120秒 かかる一方で、クライアント側がタイムアウトを 100秒 に設定して切断した場合でも、課金は発生します
* **429 / 503 は課金されません**: 失敗したリクエストは課金対象外です（お客様を待たせたり、画像なしのまま行き詰まらせたりしないようにしています）
* **コンテンツ安全性による拒否でも課金されます**: 顧客の入力にコンテンツ安全性の問題があり、Google が画像の生成を拒否した場合でも、**ステータスコード 200** は課金対象です — 下記のエラー処理と保証プランをご覧ください

## Google Search のグラウンディングは、1回ごとの価格に加算されます

Pro は `googleSearch` ツールをサポートしています（3/3 のテスト実行でグラウンディングが発動し、完全な `groundingMetadata` を返しました）。これは、天気カード、株価チャート、その他リアルタイム情報が必要なあらゆる用途に役立ちます。

**ただし、検索呼び出し料金は 1回ごとの価格 \$0.09 に上乗せされ、含まれていません**:

| シナリオ                   | 1回ごとの料金                        |
| ---------------------- | ------------------------------ |
| 通常の生成（ツールなし）           | \$0.09                         |
| search あり、モデルが 1 クエリ実行 | \$0.09 + \$0.014 = **\$0.104** |
| search あり、モデルが 2 クエリ実行 | \$0.09 + \$0.028 = **\$0.118** |

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "A weather card poster for Tokyo today" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

<Warning>
  **モデルが実行する検索回数はモデル自身が決めるため、事前に設定することはできません。** テストでは、1つの画像リクエストで自動的に 1〜3 クエリが発行されました。そのため、このツールを有効にすると、1回ごとのコストは固定の \$0.09 ではなく、範囲（\$0.104–\$0.132）になります。上限値で予算を見積もってください。
</Warning>

<Note>
  **Image Search のグラウンディング（`searchTypes.imageSearch`）は Pro では動作しません** — 0/2 回の実行で発動せず、`imageSearchQueries` は `groundingMetadata` に一度も表示されませんでした。これは Nano Banana 2（`gemini-3.1-flash-image`）専用です。[Nano Banana 2 · 課金に影響する 3 つのパラメータ](/ja/api-capabilities/nano-banana-2-image/overview#three-parameters-that-affect-billing) をご覧ください。
</Note>

## thinkingLevel は Pro では効果がありません — NB2 からコピーしないでください

`generationConfig.thinkingConfig.thinkingLevel` は **Nano Banana 2 シリーズ専用** です。Pro に `high` を渡しても:

* **エラーにはなりません** — リクエストは通常どおり 200 を返します
* **しかし効果はありません**: 測定された `thoughtsTokenCount` は 108〜156 の範囲で、パラメータなしで見られた 130〜159 の範囲と完全に重なっていました
* Pro の thinking は常に有効で、Google の公式ドキュメントにあるとおり調整できません

さらに、**Pro は呼び出しごとの定額課金なので、thinking は課金に反映されません** — Pro でこのパラメータを調整しても、効果もコスト上の理由もありません。thinking のオーバーヘッドを制御したい場合は、代わりに Nano Banana 2 の従量課金を使ってください。

## タイムアウト設定（重要）

4K画像生成は全体として時間がかかり、**画像のアップロード、API 処理、Base64 画像のダウンロード**などの段階を含みます（当社のバックエンドは **API 処理時間** に基づいて課金します）。通常の条件では、4K は（ポーリングを除いて）約 **50秒** かかりますが、クライアント側のタイムアウト設定が短すぎると、生成完了前に **早期に切断** され、次のエラーが報告されます：

```text theme={null}
API Connection Error: HTTPSConnectionPool(host='api.apiyi.com', port=443): Read timed out. (read timeout=120)
```

<Frame caption="Call logs: time-to-first-byte for 4K generation is about 43–61s, so the default 120s timeout is too tight">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-timeout-error.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=79eb88c65cd4ff91caa57e1402658b81" alt="呼び出しログ：gemini-3-pro の 4K 生成の最初のバイトまでの時間は 43～61秒です" width="1400" height="837" data-path="images/nano-banana-timeout-error.png" />
</Frame>

より安全にするため、解像度ごとにタイムアウトを設定することをおすすめします：

```python theme={null}
timeout = {
    "1K": 300,  # 5 minutes - quick preview
    "2K": 300,  # 5 minutes - recommended
    "4K": 600,  # 10 minutes - ultra HD
}
```

## マルチターン会話型編集（ネイティブは対応、リバースモデルは非対応）

Nano Bananaシリーズは **Geminiネイティブ形式** を採用し、**真の会話型マルチターン編集** に対応しています。各ターンで生成された画像を **`role: "model"` `inlineData`** として `contents` に戻し入れ、次のユーザー指示を送ります。モデルは **会話履歴全体** をもとに編集し、変更を **累積** します（たとえば、最初にソファの色を変えてからアクセサリーを追加すると、前の変更は保持されます）。

これは「リバース」画像モデルとは根本的に異なるため、統合前に明確に理解してください：

| 項目           | Nano Banana (Geminiネイティブ)                                    | リバースモデル（例: `gpt-image-2-all`）            |
| ------------ | ------------------------------------------------------------ | ---------------------------------------- |
| エンドポイント      | `/v1beta/...:generateContent`                                | `/v1/chat/completions`（チャット形式）           |
| マルチターンの仕組み   | ✅ **真の会話型**: `role:model` 画像を `contents` に戻し入れる; モデルは履歴を読み取る | ❌ 会話状態なし: `assistant` 履歴内の画像は **無視されます** |
| ターンをまたいだ累積   | ✅ 対応（赤いソファ → 帽子を追加、ソファは赤いまま）                                 | ⚠️ 再投入のみ、1ステップ編集                         |
| 以前の画像を編集する方法 | 会話履歴内で最後の出力を `model` 画像として戻し入れる                              | 前の画像 URL を **新しいユーザーメッセージ** の参照として渡す     |

<Info>
  検証済み: 以前の画像を `model` ロールのターンとして戻し入れると、Nano Banana 2 (`gemini-3.1-flash-image-preview`) は編集を継続し、変更を累積できることが正しく確認されました。リバースモデルは **最後のユーザーメッセージ** の参照画像しか読み取らないため、会話履歴を保持しても、そこでのマルチターンには機能しません。
</Info>

最小例（各出力を同じ `contents` に戻し入れる）:

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"imageSize": "2K"}}

contents = []  # keep one running conversation history

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # key: backfill the output image
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))

turn("Generate an orange cat sitting on a blue sofa, simple line-art style", "step1.png")
turn("Make the sofa red; keep the cat and composition unchanged", "step2.png")   # edits the previous image
turn("Put a small yellow hat on the cat; keep everything else the same", "step3.png")  # accumulates; red sofa kept
```

<Tip>
  詳細（履歴への戻し入れ方式と再投入方式、既存画像からマルチターンを開始する方法）は [Image Editing API · マルチターン会話型編集](/ja/api-capabilities/nano-banana-2-image/image-edit#multi-turn-conversational-editing) にあります。
</Tip>

## 画像を取得するには parts を必ず反復処理する — インデックス参照はしない

`parts` は **異種配列** です。画像セグメントだけを含むこともあれば、テキストと画像セグメントが交互に入ることもあり、**長さも順序も保証されません**。したがって、`parts[0]` / `parts[1]` のようなハードコードされたアクセスは、断続的に必ず失敗します。

テストでは、次の 3 つの構成が確認されています。

| parts の構成             | 長さ | 画像のインデックス |
| --------------------- | -- | --------- |
| `inlineData`          | 1  | `0`       |
| `text` + `inlineData` | 2  | **`1`**   |
| `inlineData` + `text` | 2  | **`0`**   |

テキストセグメントが発生する理由は 1 つではありません。`TEXT` を `responseModalities` に含める場合も、モデルに自己説明させるような prompt でも、画像と一緒にテキストが返されます。そして、そのテキストが画像の前後どちらに来るかも固定ではありません。**つまり、画像が入るインデックスは一定ではありません**。そのため、同じコードでもリクエストごとに異なる構造を受け取ることがあります。

<Warning>
  2 つのハードコードされたインデックスパターンは **相補的** です。画像は必ず `[0]` か `[1]` のどちらかに入るため、どちらを選んでも、一部のリクエストでは画像なしで返ってきます。**`[0]` と `[1]` を入れ替えても何も解決しません** — 安定しているのはフィールドの形状で選ぶ方法だけです。
</Warning>

正しい方法は、位置ではなくフィールドの形状で選択することです。最初の `inlineData` ではなく、**最後の** `inlineData` を取ることに注意してください。複雑なタスクでは複数の画像が返され、最後のものが最終版です（次のセクションを参照）:

```python theme={null}
cand = (resp.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []      # handles parts=null
images = [p["inlineData"] for p in parts if "inlineData" in p]
if not images:
    raise RuntimeError(f"No image returned, finishReason={cand.get('finishReason')}")

final = images[-1]                                 # last one is the final version
image_bytes = base64.b64decode(final["data"])
mime = final["mimeType"]                           # trust the response; don't hardcode image/png
```

```javascript theme={null}
const parts = resp?.candidates?.[0]?.content?.parts ?? [];
const images = parts.filter((p) => p.inlineData?.data);   // ✅ never write parts[1]
if (images.length === 0) throw new Error("Gemini returned no image data");
const { data, mimeType } = images[images.length - 1].inlineData;   // last is the final version
```

<Tip>
  **ハードニング**: `responseModalities: ["IMAGE"]` を `generationConfig` で宣言すると、画像のみがほしいことを示せるため、余分なテキストセグメントを減らせます。

  これはハードニングであり、**代替ではありません** — フィルタリングが先であることに変わりはありません。逆は成り立ちません。`["TEXT","IMAGE"]` を渡してもテキストセグメントが保証されるわけではなく、モデルは画像だけを返すこともあります。
</Tip>

<Warning>
  **`mimeType` もハードコードしないでください。** レスポンス内の画像フォーマットは一定ではなく、`image/png` と `image/jpeg` の両方が発生します。固定の `.png` 拡張子でファイルを書き出すと、拡張子が内容と矛盾するファイルができてしまいます — **常にレスポンスの `mimeType` に拡張子を決めさせてください**。
</Warning>

## レスポンスに複数の画像が含まれることがあるのはなぜですか

`gemini-3-pro-image` を呼び出すと、まれに **1 回のレスポンスに複数の画像パートが含まれる**（テストでは 2〜10 件を確認）ことがあり、ログに散発的に 6000+（極端な場合は 5 桁）output-token エントリが記録されることがあります。これは異常ではありません。Google の公式ドキュメントでは、Gemini 3 の画像モデルはデフォルトで「Thinking」が有効（API では無効化できない）で、モデルは構図とロジックを検証するために途中の画像を生成し、これらの下書きは最終版と並んで `parts` に表示され、さらに「Thinking 内の最後の画像が、最終的にレンダリングされる画像でもある」（公式ドキュメント: `ai.google.dev/gemini-api/docs/image-generation`）とされています。2026 年 7 月に実施したテスト（Google ネイティブ`generateContent`形式）に基づくと:

| シナリオ                                                      | 返される画像数                           |
| --------------------------------------------------------- | --------------------------------- |
| 純粋な text-to-image                                         | 常に 1（prompt で明示的に「複数の画像」と指定しても同じ） |
| 単純な画像編集（アクセサリーの追加 / 背景変更 / スタイル変更）                        | 常に 1                              |
| 複雑なタスク型の編集（例: 「4 方向のキャラクターシート + 衣装変更 + 白背景」など、複数の制約があるもの） | 2〜10、安定して再現可能                     |

トリガーは **prompt のタスクの複雑さ** であり、「画像編集」そのものではありません。複数の画像は依然として **1 つの候補**（複数の候補ではありません）内にあり、各画像は完全な画像です。つまり、同じデザイン（同じ構図で、細部が少しずつ異なる）の連続した下書きであり、**最後のパートが最終版** です。これらの下書きは通常の画像パートとして返されます（`thoughtSignature` フィールドはありますが、`thought: true` フラグはありません）。Google のドキュメントでは Thinking は最大 2 枚の途中画像を生成するとされていますが、複雑なタスクでは最大 10 枚を確認しました。

**課金への影響**: 各画像は固定の token 数で課金されます（1K/2K 解像度では画像 1 枚あたり 1120 token、4K では 2000 token）ので、output token は画像数に比例して厳密に直線的に増加します。ログに散発的に 6000+（極端な場合は約 13.5k）と記録されている output-token エントリは、単に 4〜10 枚の画像レスポンスであり、**課金の異常ではありません**。

**推奨する後続コード**:

```python theme={null}
parts = response["candidates"][0]["content"]["parts"] or []   # parts is null on safety refusals
images = [p["inlineData"]["data"] for p in parts if "inlineData" in p]

if images:
    final_image = images[-1]   # last one = final version
```

* **常にパートを順に処理する** — 1 回のレスポンスにつき 1 画像と決めつけないでください。画像ごとのカウントや保存ロジックは、実際のパート数に基づいて行う必要があります
* **1 枚だけ必要な場合は最後の画像を使う**: 先頭の下書きは細部が未完成で品質もわずかに低いため、最初の画像は使わないでください
* **prompt で画像枚数を制御するのはほとんど効果がありません**（テストでは「1 枚だけ出力して」という指示は無視されました）— コード側で処理してください
* 複数画像のレスポンスは 35〜142 秒かかります（1K 解像度で、画像数が多いほど長くなります）。単一画像のレスポンスよりかなり長いです — 上記のタイムアウト推奨（5 分以上）を維持してください

<Tip>
  使用量の usageMetadata フィールドの完全な内訳（details と totals の差、拒否レスポンスでのカウントの癖、その他）については、[使用量フィールドと出力の解説](/ja/api-capabilities/nano-banana-usage-metadata) を参照してください。
</Tip>

## よくある質問

<CardGroup cols={2}>
  <Card title="エラー処理ガイド" icon="triangle-alert" href="/ja/api-capabilities/gemini-image-error-handling">
    生成失敗、コンテンツモデレーションポリシー、親しみやすい prompt 戦略を診断するための3つの重要な指標
  </Card>

  <Card title="必読の開発者向けよくある質問" icon="circle-question-mark" href="/ja/faq/nano-banana-image-failure">
    生成失敗のトラブルシューティングとよくある質問
  </Card>

  <Card title="生成失敗保証プラン" icon="shield-check" href="/ja/api-capabilities/nano-banana-pro-guarantee">
    入力に起因しない失敗については、失敗したリクエスト数に応じてクレジットを返還します
  </Card>
</CardGroup>

<AccordionGroup>
  <Accordion title="なぜ connection reset by peer / write_response_body_failed (500) が発生するのですか？">
    完全なエラーは次のようになります:

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    これは**通常、画像アップロードのサイズが大きすぎることが原因です — リクエストボディが大きくなりすぎて接続が切断されます**。以下のベストプラクティスに従ってください。

    * **画像数を制限する**: 公式ルールの範囲内に収めてください（prompt あたり最大14枚 — 上記の公式仕様を参照してください）。
    * **画像1枚あたりのサイズを制限する**: 画像1枚ごとに5MB未満にしてください — 公式の1枚あたり上限は7MBで、base64 エンコーディングによりサイズは約3分の1増加するため、余裕を持たせてください。
    * **アップロード前にフロントエンドで圧縮する**: API に送信する前に、フロントエンド（またはサーバーサイドのリレー）で画像を圧縮してください — 一般的には、長辺を制限し、JPEG/WebP に変換し、品質パラメータを調整します。
    * **URL入力に切り替える**: Gemini のネイティブ形式では、`fileData.fileUri` を介して画像 URL を渡せるため、大きすぎる base64 のリクエストボディを完全に回避できます — 上記の [URL画像入力](#url-image-input) を参照してください。
  </Accordion>
</AccordionGroup>

## 利用例

* **AI チャットクライアント**: [Cherry Studio](/ja/scenarios/chat/cherry-studio) などのクライアントを、APIYI 経由で直接画像を生成するように設定できます
* **生成テスト**: チャットクライアントまたはコンソールでモデルの性能をすばやく確認できます

## 高度な要件

* **URL経由で画像をアップロードしたいですか？** Gemini のネイティブ エンドポイントでは `fileData.fileUri` を通じて画像URLを渡すことがサポートされています。ただし、OpenAI互換モードでは URL アップロードはサポートされていないため、代わりに Base64 を使用してください。上記の [URL画像入力](#url-image-input) にあるコード例と注意事項をご覧ください。
* **Base64 ではなく、ダウンロードURLを直接取得したいですか？** NB-OSS グループをご利用ください — [Nano Banana OSS グループ](/ja/api-capabilities/nano-banana-oss-group) をご覧ください。
