> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedanceで「最初/最後のフレームは参照メディアと混在できません」と表示される

> 最初/最後のフレームモードを有効にしていないにもかかわらず、Seedanceは「400: first/last frame content cannot be mixed with reference media content」を返します。リクエスト内の画像にroleが設定されていないため最初のフレームとして扱われ、最初のフレームは参照動画と混在できません。これは主に、汎用の /v2/videos/generations エンドポイント経由で送信するサードパーティ製ツールで発生します。このページでは、ネイティブエンドポイントへの切り替え方法、roleの設定方法、および参照動画の渡し方について説明します。

## 簡潔な回答

**Seedance はリクエスト内の各アイテムの `role` のみを読み取ります。** ツールでどのスイッチをオンにしたかは認識されず、このために prompt を読み取ることもありません。`role` のない画像は、第1フレーム（画像から動画への変換）として扱われます。そこに参照動画を追加すると、リクエストは「第1フレーム + 参照メディア」となり、プロバイダーによって拒否されます。

典型的なエラーは送信時に 400 として返されます。タスクは作成されず、課金も発生しません：

```text theme={null}
The parameter `content` specified in the request is not valid:
first/last frame content cannot be mixed with reference media content.
```

**解決策**：ネイティブの Seedance エンドポイント `POST /seedance/api/v3/contents/generations/tasks` 経由で送信し、画像には `"role": "reference_image"`、動画には `"role": "reference_video"` を設定した上で、プロバイダーが直接ダウンロードできる公開 URL として動画を渡すか、アセットライブラリに登録して `asset://` として参照してください。

## 実際の事例

あるお客様がご自身で構築されたローカルの制作ツールを使用されていました。キャラクター画像1枚と動画1本を渡し、「omni reference」にチェックを入れ、「最初のフレーム/最後のフレーム」のチェックは外したままにし、さらに prompt に「画像1は最初のフレームではありません。最初/最後のフレームモードを使用しないでください」とまで記述していました。それにもかかわらず、実行するたびに上記のエラーで失敗していました。

ゲートウェイ側で生のリクエストをキャプチャしました（画像の base64 は省略）：

```json theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "Replace the person in video 1 with the character in image 1 ... (image 1 is not the first frame) ... do not use first/last frame mode",
  "duration": 14,
  "ratio": "9:16",
  "resolution": "720p",
  "images": ["data:image/jpeg;base64,/9j/4AAQ..."],
  "videos": ["/assets/input/ai_ref_xxxx.mp4"]
}
```

このリクエストには2つの問題があります。どちらか一方だけでも失敗の原因となります：

| 問題点 | 説明 |
| - | - |
| **画像に `role` が存在しない** | リクエストは汎用動画エンドポイント `/v2/videos/generations` に送信されましたが、ここには `images` 配列と `videos` 配列しか存在せず、「これは参照画像である」と指定できるフィールドがありません。ルール上、単一の画像は最初のフレームとして扱われるため、参照動画と競合します。ツールの「omni reference」スイッチはリクエストに全く反映されておらず、prompt のテキストはパラメータのバリデーションに何の影響も与えません |
| **動画がローカルパスになっている** | `/assets/input/ai_ref_xxxx.mp4` はお客様ご自身のコンピュータ上にあるツール内のパスです。プロバイダーのサーバーからはアクセスできないため、たとえ最初のフレームの問題を解決したとしても、動画がモデルに届くことはありません |

お客様のブラウザのコンソールにも同じ mp4 に対して `415 Unsupported Media Type` が表示されており、これはツール独自のローカルプレビューエンドポイント（`/api/media-preview/...`（`localhost` 上））からのものでした。ツールが動画を利用可能なアドレスに変換できず、ローカルパスをそのままリクエストに含めてしまっていました。

## Seedance を汎用動画エンドポイント経由で送信しないでください

`/v2/videos/generations`（および `/v1/videos`、`/v1/video/generations`）はゲートウェイの汎用動画エンドポイントです。これらのフィールドは複数の動画モデルで共有される共通サブセットであり、**Seedance の入力モードを表現することはできません**:

* **`role` がない**: 先頭フレーム、先頭/末尾フレーム、マルチモーダルリファレンスを区別できないため、画像 1 枚と動画 1 本の組み合わせは常に「先頭フレーム + リファレンス」として扱われてしまいます
* **解像度が完全には透過されない**: 当社のテストでは、2.5 で 480p をリクエストしても 720p で出力され、2.0 シリーズで 1080p をリクエストしても 720p で出力されました。一方で、課金は実際に生成された解像度に基づいて行われます
* **2.5 固有のパラメータ**（`omni_reference_task_type`、`output_format` など）に対応するフィールドがありません

そのため、Seedance には**必ずネイティブエンドポイントを使用してください**:

| ステップ | エンドポイント |
| - | - |
| タスクの送信 | `POST /seedance/api/v3/contents/generations/tasks` |
| タスクの照会 | `GET /seedance/api/v3/contents/generations/tasks/{id}` |

サードパーティ製ツールをご使用の場合は、その Seedance チャンネルが「ネイティブ」または「Volcengine Ark」フォーマットを提供しているか確認してください。汎用動画 API にのみ対応しているツールでは、参照動画を含むタスクを実行できません。

## 正しい方法: すべてのアイテムに role を設定する

```python theme={null}
import os, requests

BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
headers = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}

body = {
    "model": "doubao-seedance-2-0-260128",
    "content": [
        {"type": "text", "text": "Replace the person in @video1 with the character in @image1, keeping the motion, expressions and background music unchanged"},
        {"type": "image_url", "image_url": {"url": "https://cdn.example.com/character.png"},
         "role": "reference_image"},
        {"type": "video_url", "video_url": {"url": "https://cdn.example.com/source.mp4"},
         "role": "reference_video"},
    ],
    "resolution": "720p",
    "ratio": "9:16",
    "duration": 10,
}

r = requests.post(BASE, headers=headers, json=body, timeout=60)
print(r.status_code, r.json())   # on success: {"id": "cgt-..."}, then poll with that id
```

重要なポイント:

* **3つの入力モードは相互に排他的です**: 最初/最後のフレーム（画像2枚、`first_frame` / `last_frame`）、最初のフレーム（画像1枚）、およびマルチモーダル参照（`reference_image` / `reference_video` / `reference_audio`）。参照動画または参照音声が含まれる場合、すべての画像は `reference_image` である必要があります
* **`role` がない場合は最初のフレームを意味します**: `role` のない単一の画像は `first_frame` と同じです
* prompt では、渡された順序でアイテムを参照してください（例: `@image1` や `@video1`）
* 参照制限: 2.0シリーズでは最大9枚の画像 + 3本の動画 + 3つの音声クリップ、2.5では最大30枚の画像 + 10本の動画 + 10個の音声クリップまでです

## 参照動画を渡す方法

プロバイダーは**自身のサーバー上で**メディアをダウンロードするため、動画はプロバイダーが直接アクセスできるアドレスにある必要があります。

| 方法 | 利用可否 | 備考 |
| - | - | - |
| **公開ダイレクトURL**（推奨） | ✅ | ログイン、Cookie、追加のヘッダーが不要なオブジェクトストレージまたはCDN（OSS、S3、R2、TOSなど）でホストし、タスクが完了するまで有効な状態を維持してください |
| **Asset ID** `asset://...` | ✅ | 同じ動画を再利用する場合や、実在の人物が出演する場合に使用します。アセットは mp4 / mov、2〜15秒、50MB未満である必要があります。[アセットライブラリ](/ja/api-capabilities/seedance2/asset-library)をご覧ください |
| **Base64** | ⚠️ 非推奨 | 動画は画像よりも桁違いにサイズが大きく、リクエストボディにインラインで含めると送信がタイムアウトする最も起こりやすい原因となります。[Asset-Firstワークフロー](/ja/api-capabilities/seedance2/asset-first-workflow)をご覧ください |
| お使いのマシン上のパス（`/assets/...`、`C:\...`、`file://...`） | ❌ | プロバイダーはお使いのコンピューター上のファイルを読み取ることができません |
| プライベートネットワークアドレス（`localhost`、`127.0.0.1`、`192.168.x.x`） | ❌ | 同上 |
| ダウンロードにログインが必要なリンク | ❌ | プロバイダーは取得時にログインセッションを引き継ぎません |

送信する前に、インターネットにアクセスできる任意のマシンからリンクを確認できます（`<URL>` を動画リンクに置き換えてください）：

```bash theme={null}
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'
```

`code=200`、`type`（`video/mp4` または `video/quicktime`）、および元のファイルと一致する `size` が表示されるはずです。HTMLページ、JSONボディ、またはいずれかの4xxが表示される場合は、プロバイダーがそのリンクを使用できないことを意味します。画像に関するリンク確認の詳細は、[画像リンクは開くが失敗する場合](/ja/faq/seedance-image-url-invalid-format)をご覧ください。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="動画生成 API" icon="video" href="/ja/api-capabilities/seedance2/video-generation">
    ネイティブエンドポイントに加え、各入力モードのコンテンツレイアウトと role 値
  </Card>

  <Card title="アセットファーストワークフロー" icon="gauge" href="/ja/api-capabilities/seedance2/asset-first-workflow">
    参照動画を Base64 として送信すべきではない理由と、アセットの登録方法
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.