> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 動画理解 API

> Gemini 3.5 Flash や Gemini 3.1 Pro Preview などの高度なモデルを使って、コンテンツ認識、シーン説明、動作分析、タイムスタンプ参照を含むインテリジェントな動画分析を行います

APIYI は Gemini のマルチモーダルモデルを通じて動画理解を提供します。1 つの prompt だけで、モデルは動画内のシーン、アクション、画面上のテキスト、音声を「視聴」し、タイムスタンプ付きで重要な瞬間を参照できます。このページでは、対応モデル、実際に動作する動画入力方法、そしてつまずきやすい制限について説明します。

<Note>
  **まずこちらをお読みください**: 動画は **Base64 インライン（リクエスト全体 ≤ 20 MB）** または **YouTube リンク**（Gemini ネイティブ形式）でしか渡せません。一般公開の動画 URL（例: `https://example.com/demo.mp4`）を渡すと `Request contains an invalid argument` が返ります —— これは Google が直接リンクを拒否しているためであり、APIYI 側のブロックではありません。下の「Video input methods」をご覧ください。
</Note>

<CardGroup cols={2}>
  <Card title="Visual API テスト" icon="flask-conical" href="https://icover.ai/video-understanding">
    動画をアップロードし、iCover のビジュアルテストツールで理解エンドポイントをテストします。
  </Card>
</CardGroup>

## 対応モデル

| Model                      | Model ID                 | 特徴                          | 推奨用途               |
| -------------------------- | ------------------------ | --------------------------- | ------------------ |
| **Gemini 3.5 Flash** 🔥    | `gemini-3.5-flash`       | 高速、最高のコストパフォーマンス、強力なマルチモーダル | 日常的な動画解析の標準的な選択肢   |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | Googleの最も強力な推論 + マルチモーダル    | 複雑で長尺動画の詳細解析       |
| **Gemini 3.1 Flash Lite**  | `gemini-3.1-flash-lite`  | 超低価格と低レイテンシ                 | 大量処理・高同時実行数のワークロード |

安定版の定番 `gemini-2.5-pro`（2M コンテキスト）と `gemini-2.5-flash` は引き続き利用できます。完全な料金は[Models & Pricing](/ja/api-capabilities/model-info)をご覧ください。

## 動画入力方法

問題の多くはここから発生します。以下の表で、ご利用の入力方法がサポートされているか確認してください。

| 入力方法                          |  対応 | 備考                                                                                            |
| ----------------------------- | :-: | --------------------------------------------------------------------------------------------- |
| **Base64 インライン**              |  ✅  | ローカルの動画を読み込み、base64エンコードして渡します。**リクエスト本文全体は 20 MB 以下である必要があります。** OpenAI互換形式とネイティブ形式の両方で動作します |
| **YouTube リンク**               |  ✅  | **Gemini のネイティブ形式のみ**で、`file_uri` 経由で渡します                                                     |
| **公開動画 URL**（例: `.mp4` のアドレス） |  ❌  | **Google はこれを受け付けず**、`Request contains an invalid argument` を返します — これは APIYI 側のブロックではありません   |
| **Files API**（`files.upload`） |  ❌  | サードパーティではサポートされていません。Google の公式エンドポイントのみが対応しています                                              |

<Warning>
  **20 MB の制限**: Base64 を使用する場合、エンコードされた動画を含むリクエスト本文全体は 20 MB 未満に収める必要があります。**20 MB を超える動画**の場合の選択肢は、① YouTube リンクを使う、② base64 エンコードする前に動画をローカルで圧縮 / 切り出して 20 MB 未満にする、の 2 つだけです。
</Warning>

## クイックスタート: Base64 インライン（OpenAI互換形式）

最も一般的な方法は、ローカルの動画を読み込む → base64 エンコードする → `image_url` フィールドに渡す、という流れです。

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

{/* Read the local video and base64-encode it (entire request ≤ 20 MB) */}
with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.5-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe the content of this video in detail"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

同等の curl（`<BASE64_VIDEO>` を動画の base64 文字列に置き換えてください。大きなファイルでは、SDK に自動でエンコードさせる方法を推奨します）:

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Summarize this video"},
        {"type": "image_url",
         "image_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"},
         "mime_type": "video/mp4"}
      ]
    }]
  }'
```

## YouTubeリンク（Gemini ネイティブ形式）

YouTubeリンクはダウンロード不要で、20 MB の制限も受けませんが、Gemini ネイティブ形式（`google-genai` SDK、endpoint `https://api.apiyi.com`）でのみ渡せます。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="Summarize the main content and key points of this video"),
    ]),
)

print(response.text)
```

<Info>
  より多くのネイティブ形式の使い方（ストリーミング、thinking budget、関数呼び出しなど）については、[Gemini Native Format](/ja/api-capabilities/gemini/native) をご覧ください。
</Info>

## 高度なヒント

### タイムスタンプ参照

モデルはデフォルトで1秒あたり1フレームでサンプリングし、音声トラックも理解するため、プロンプト内で `MM:SS` を使って直接、特定の場面を参照できます。これは純粋なプロンプト手法であり、どの入力方法でも使えます:

```text theme={null}
Describe what happens between 00:30 and 01:15, and identify the on-screen text that appears at 02:40.
```

### 一般的なタスク向けのプロンプト案

同じ動画でも、プロンプトを変えるだけで異なる分析が可能です。コード変更は不要です:

* **コンテンツ要約**: トピック、重要な場面、結論を3〜5文で要約する
* **教育的分析**: 重要な概念、章ごとの構成、重要なタイムスタンプを抽出する
* **監視分析**: 異常な行動、そこにいる人物・物体、発生時刻を特定する
* **マーケティングレビュー**: 訴求ポイントの見せ方、テンポ、ターゲット層との適合性を分析する
* **動作分析**: 手順、姿勢の詳細、改善点を分解して確認する

## 技術メモ

* **Sampling rate**: デフォルトでは、モデルは **1秒あたり1フレーム（FPS）** でサンプルし、音声トラックも理解します。
* **Token usage**: デフォルト解像度ではおおよそ **300 token/秒**、低解像度ではおおよそ **100 token/秒** です。動画が長いほど必要な token も増えるため、見積もりはそれに応じて行ってください。
* **Supported formats**: mp4, mpeg, mov (quicktime), avi, webm, wmv, 3gpp, およびその他の一般的な形式。

## FAQ

<AccordionGroup>
  <Accordion title="公開動画リンクで「リクエストに無効な引数が含まれています」/ 取得に失敗する">
    Google の動画理解は**任意の公開直リンクを受け付けません**（例: `https://example.com/video.mp4`）し、`Request contains an invalid argument` を返します。これは APIYI や Nginx によるブロックではありません。次のいずれかを使用してください: ① Base64 インライン（≤20 MB）; ② YouTube リンク（ネイティブ形式）。
  </Accordion>

  <Accordion title="なぜ 20 MB の制限があるのですか？以前は動いていました">
    Base64 インラインの場合、リクエストボディ全体は常に 20 MB を上限としていました（Google の公式制限と一致します）。「以前は動いていた」のが公開直リンクを指しているなら、それは実際にはサポートされていた方法ではありませんでした。一部のケースでたまたまエラーにならなかっただけで、現在は仕様どおり拒否されます。
  </Accordion>

  <Accordion title="大きな動画をアップロードするために files.upload を使えますか？">
    いいえ。Google の公式 Files API（`client.files.upload()`）は**第三者にはサポートされていません**。対応しているのは Google 自身の endpoint だけです。大きな動画には YouTube リンクを使うか、20 MB 未満に圧縮して Base64 を使用してください。
  </Accordion>

  <Accordion title="20 MB を超える動画はどうすればよいですか？">
    方法は 2 つあります: ① YouTube にアップロードしてリンクを渡す（ネイティブ形式なので 20 MB 制限の対象外です）; ② ffmpeg などのツールを使って、重要な区間をローカルで 20 MB 未満に圧縮または切り出してから、base64 エンコードする。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="モデルと価格" icon="list" href="/ja/api-capabilities/model-info">
    すべての Gemini モデルと最新の価格を確認できます
  </Card>

  <Card title="Gemini ネイティブ形式" icon="sparkles" href="/ja/api-capabilities/gemini/native">
    YouTube リンク、ストリーミング、推論バジェット、その他のネイティブな利用方法
  </Card>

  <Card title="視覚理解 API" icon="image" href="/ja/api-capabilities/vision-understanding">
    画像コンテンツ認識とマルチモーダル解析
  </Card>

  <Card title="API リファレンス" icon="book" href="/ja/api-manual">
    完全な API 仕様とエンドポイントの詳細
  </Card>
</CardGroup>
