> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Coze プラグイン

> コミュニティ提供の Coze プラットフォーム向け Python プラグインで、Nano Banana Pro（Gemini 3 Pro Image）呼び出し、エラー分類、OSS アップロードをラップし、Coze ワークフローで text-to-image、image-to-image、結果の直接配信を 1 つのノードで実現します。

## 概要

これは、[Cozeプラットフォーム](https://www.coze.cn)向けのカスタム Python プラグインで、APIYI の Nano Banana Pro モデル（`gemini-3-pro-image-preview`）を、どの Coze ワークフローからも直接呼び出せるノードにラップしています。このプラグインには、完全なリクエストビルダー、きめ細かなエラー分類、コンテンツ違反検知、そして Aliyun OSS へのアップロードが含まれています。**返ってくるのはそのまま表示できる公開 URL です**ので、下流に追加の転送ノードを用意する必要はありません。

<Info>
  **プロジェクト情報**

  * 📦 形式: コードパッケージとして共有されています（**GitHub では公開していません**）
  * 👤 作成者: Shuaila1996
  * 🎯 対応プラットフォーム: Coze CN / Global のカスタムプラグイン
  * 🔌 モデル: `gemini-3-pro-image-preview`（APIYI 経由）
  * 📝 完全なソースコードは下の「プラグイン完全ソース」セクションに埋め込まれています。コピー＆ペーストするだけでよく、別途ダウンロードは不要です
</Info>

## 主な機能

<CardGroup cols={2}>
  <Card title="テキストから画像 / 画像から画像の統合" icon="wand-sparkles">
    `fileurls`が空かどうかに応じて txt2img と img2img モードを自動で切り替えます — ワークフローで 2 つの並列分岐を用意する必要はありません
  </Card>

  <Card title="マルチリファレンス編集" icon="images">
    画像 URL の配列を渡すと、それらがダウンロードされ、`inline_data`として挿入され、元のディテールを保持します
  </Card>

  <Card title="詳細なエラー分類" icon="shield-check">
    `ZERO_CANDIDATES_TOKEN`、`FINISH_REASON`、`INLINE_DATA_EMPTY`、`TEXT_RESPONSE`などを区別し、ワークフローの分岐が正確に反応できるようにします
  </Card>

  <Card title="違反の自動ラベリング" icon="ban">
    ウォーターマーク除去 / 顔交換 / NSFW / 知識カットオフ外のプロンプトに対して、推測を強いるのではなく、明確な拒否タイプを返します
  </Card>

  <Card title="OSS への直接アップロード" icon="cloud-upload">
    base64 の結果はそのまま Aliyun OSS にアップロードされ、ワークフローは共有や保存に使える URL を受け取れます
  </Card>

  <Card title="解像度を考慮したタイムアウト" icon="hourglass">
    1K / 2K / 4K ごとに個別のタイムアウトを設定し（360s / 600s / 1200s）、4K HD ジョブが途中で切れないようにします
  </Card>
</CardGroup>

## 対応 APIYI モデル

| モデル             | 識別子                          | 用途              | API ドキュメント                                          |
| --------------- | ---------------------------- | --------------- | --------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | テキストから画像、画像から画像 | [ドキュメントを見る](/en/api-capabilities/nano-banana-image) |

<Tip>
  プラグインは APIYI の`https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent` エンドポイント（Gemini ネイティブプロトコル）を呼び出します。Google AI Studio と同一なので、既存の prompt はそのまま移行できます。
</Tip>

## プラグインアーキテクチャ

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=7052279e4466fdab5319e94e6a2592fc" alt="Coze プラグイン設定" width="2550" height="1244" data-path="images/community/coze-feishu/coze-plugin-config.png" />

基本フロー:

```text theme={null}
Coze workflow input (cleantext / fileurls / aspect_ratio / resolution / apikey)
        ↓
    handler() entry
        ↓
generate_image()  — build parts + call APIYI endpoint
        ↓
   parse candidates / fallback errors
        ↓
upload_base64_to_oss()  — upload to Aliyun OSS
        ↓
return { analysis, url, error }
```

## 入力と出力

### 入力

| Field          | Type      | Required | Description                            |
| -------------- | --------- | -------- | -------------------------------------- |
| `cleantext`    | string    | yes      | ユーザーの prompt または編集指示                   |
| `fileurls`     | string\[] | no       | 参照画像の URL；空の場合は text-to-image をトリガーします |
| `aspect_ratio` | string    | yes      | アスペクト比。例: `1:1`、`16:9`、`9:16`          |
| `resolution`   | string    | yes      | 解像度。大文字である必要があります: `1K` / `2K` / `4K`  |
| `apikey`       | string    | yes      | APIYI キー（推奨: 上流ノードを介してユーザーごとに配布）       |

### 出力

| Field      | Type           | Description                   |
| ---------- | -------------- | ----------------------------- |
| `analysis` | string         | ステータスラベル: `图片生成成功` / `图片生成失败` |
| `url`      | string \| null | 成功時の OSS 公開 URL               |
| `error`    | string \| null | 失敗時の分かりやすいエラーメッセージ            |

## デプロイ

<Steps>
  <Step title="ステップ 1: APIYI と OSS の認証情報を準備する">
    * [APIYI Console](https://api.apiyi.com/token) で、`sk-` で始まる APIYI キーを生成します
    * Aliyun OSS Bucket と、そのバケットに対する `oss:PutObject` 権限を持つ RAM サブアカウントを作成します
    * `AccessKey ID`、`AccessKey Secret`、`Bucket name`、および `Endpoint` を控えておきます（例: `oss-cn-beijing.aliyuncs.com`）
  </Step>

  <Step title="ステップ 2: Coze でカスタムプラグインを作成する">
    1. Coze Workspace → Library → カスタムプラグインを作成 に移動します
    2. 「Cloud-side plugin — create in Coze IDE」を選択します
    3. 実行環境: **Python**
    4. 依存関係を追加: `requests`, `oss2`
  </Step>

  <Step title="ステップ 3: プラグインコードを貼り付ける">
    以下の「プラグイン全文ソース」セクションにある完全な Python コードを Coze IDE にコピーし、その後、ファイル上部にある 4 行の OSS 設定を自分の値に更新してください:

    ```python theme={null}
    # Aliyun OSS configuration
    ACCESS_KEY_ID = "your-AK"
    ACCESS_KEY_SECRET = "your-SK"
    BUCKET_NAME = "your-bucket"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="ステップ 4: メタデータ、入力、出力を設定する">
    以下のように、入力 / 出力フィールドと必須フラグを設定し、コード内の `args.input` フィールドと一致させます:

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-metadata.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=991fd5bb9fba689f2629b122b274f088" alt="Coze プラグインのメタデータ設定" width="2478" height="1114" data-path="images/community/coze-feishu/coze-plugin-metadata.png" />
  </Step>

  <Step title="ステップ 5: テストして公開する">
    * Coze IDE でテストパラメータを入力します（推奨: まず OSS パスを検証するために 1K + シンプルな prompt を使用します）
    * 緑になったら、「Publish」をクリックすると、ノードは任意のワークフローでドラッグ可能になります
  </Step>
</Steps>

## エラー分類戦略

このプラグインは単に boolean を返すだけではありません。失敗原因を次の優先順位で識別するため、ワークフローの分岐がそれぞれ異なる反応を返せます。

| 優先度 | エラータイプ                  | トリガー                                      | 推奨アクション                                        |
| --- | ----------------------- | ----------------------------------------- | ---------------------------------------------- |
| 1   | `ZERO_CANDIDATES_TOKEN` | `usageMetadata.candidatesTokenCount == 0` | プロンプトまたは画像がモデレーションでフラグ付けされました; 書き直し            |
| 2   | `NO_CANDIDATES`         | `candidates` is empty                     | システムエラー; 再試行                                   |
| 3   | `FINISH_REASON`         | `finishReason` not `STOP`                 | 対応付け済み: `PROHIBITED_CONTENT` / `SAFETY` / etc. |
| 4   | `NO_PARTS`              | `content.parts` is empty                  | 再試行                                            |
| 5   | `INLINE_DATA_EMPTY`     | `inlineData` は存在するが `data` は空             | 再試行または言い換え                                     |
| 6   | `TEXT_RESPONSE`         | テキストのみが返された場合                             | 透かし / 顔入れ替え / NSFW / 年のカットオフ として自動分類           |

## プラグイン完全ソース

以下は完全な `coze-nanobanana-pro.py` です。これをそのまま Coze IDE にコピーできます。**先頭の 4 つの OSS 設定行だけを更新**すれば、公開準備は完了です。

```python coze-nanobanana-pro.py theme={null}
from runtime import Args
from typings.nanobanana_apiyi.nanobanana_apiyi import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re
from datetime import datetime



# 阿里云 OSS 配置
ACCESS_KEY_ID = ""  #填入自己的阿里云 Access Key ID
ACCESS_KEY_SECRET = "" #填入自己的阿里云 Access Key Secret
BUCKET_NAME = "" #填入自己的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com" #填入自己的阿里云 OSS Endpoint，例如 "oss-cn-beijing.aliyuncs.com"

# 分辨率超时时间
TIMEOUT = {
    "1K": 360,  # 快速预览
    "2K": 600,  # 推荐使用
    "4K": 1200,  # 超高清
}

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回链接
    支持带 data:image/...;base64, 前缀 和 纯 base64 两种情况
    """
    # 去掉 data:image/...;base64, 前缀
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/generated_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"

# ==============================
# 工具函数：根据 URL 猜测 MIME 类型
# ==============================

def guess_mime_from_url(url: str) -> str:
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    # 默认
    return "image/png"

# ==============================
# 核心：生成 / 编辑图片
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str, apikey:str,apiurl:str,image_urls=None):
    """
    生成 / 编辑图片的核心函数

    - 如果 image_urls 为空：纯文生图
    - 如果 image_urls 不为空：把 URL 指向的图片下载下来，按 inline_data 方式传给 API，实现改图
    """

    # 组装 parts
    parts = []

    # 1. 如果有图片 URL，则按 apiyi 改图 demo 的方式构造 inline_data
    if image_urls:
        for url in image_urls:
            try:
                resp = requests.get(url, timeout=180)
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "error": f"图片上传阶段，获取图片失败（{url}）HTTP {resp.status_code}"
                    }

                image_bytes = resp.content
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                mime_type = guess_mime_from_url(url)

                parts.append({
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": image_base64
                    }
                })
            except Exception as e:
                return {
                    "success": False,
                    "error": f"图片上传阶段，获取图片失败（{url}）: {e}"
                }

    # 2. 文字部分（编辑指令或文生图提示词）
    #    注意：这里不再把图片 URL 塞进 prompt 里，仅用纯文字描述
    if prompt:
        parts.append({"text": prompt})
    else:
        # 没有文字时给一个默认提示（可按需要修改）
        parts.append({"text": "根据图片进行合理的编辑生成。"})

    # 3. 构造请求 payload（和官方改图 demo 一致的结构）
    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "image_size": resolution
            }
        }
    }

    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(apiurl, headers=headers, json=payload, timeout=TIMEOUT[resolution])

        # HTTP 非200
        if response.status_code != 200:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}

        # JSON 解析
        try:
            data = response.json()
        except ValueError:
            return {"success": False, "error": "响应不是有效JSON", "response": (response.text or "")[:500]}

        # 1️⃣ 最高优先级：candidatesTokenCount
        usage = data.get("usageMetadata") or {}
        if usage.get("candidatesTokenCount") == 0:
            return {
                "success": False,
                "errorType": "ZERO_CANDIDATES_TOKEN",
                "error": "❌ 内容审核失败\n您的请求在内容审核阶段被拒绝，请修改提示词或图片",
                "response": data
            }

        # 2️⃣ candidates 检查
        candidates = data.get("candidates")
        if not isinstance(candidates, list) or len(candidates) == 0:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试",
                "response": data
            }

        candidate = candidates[0] if isinstance(candidates[0], dict) else None
        if candidate is None:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试（candidates[0]结构异常）",
                "response": data
            }

        # 3️⃣ finishReason
        finish_reason = candidate.get("finishReason")
        if isinstance(finish_reason, str) and finish_reason != "STOP":
            reason_map = {
                "PROHIBITED_CONTENT": "内容违反安全策略，已被拒绝处理",
                "SAFETY": "内容触发了安全过滤器",
                "RECITATION": "内容可能涉及版权问题",
                "MAX_TOKENS": "内容长度超出限制",
            }
            return {
                "success": False,
                "errorType": "FINISH_REASON",
                "finishReason": finish_reason,
                "error": reason_map.get(finish_reason, f"请求被拒绝：{finish_reason}"),
                "response": data
            }

        # 4️⃣ content.parts
        content = candidate.get("content") or {}
        parts = content.get("parts")
        if not isinstance(parts, list) or len(parts) == 0:
            return {
                "success": False,
                "errorType": "NO_PARTS",
                "error": "生成失败，请重试（content.parts为空）",
                "response": data
            }

        # 5️⃣ 提取图片和文本（更精准：识别 inlineData 存在但 data 为空）
        images = []
        texts = []
        saw_inline_but_empty = False

        for i, part in enumerate(parts):
            if not isinstance(part, dict):
                continue

            # 收集 text（即使有 thoughtSignature，也照收）
            t = part.get("text")
            if isinstance(t, str) and t.strip() and not t.startswith("data:image/"):
                texts.append(t.strip())

            # 兼容 inlineData / inline_data
            inline = None
            if isinstance(part.get("inlineData"), dict):
                inline = part["inlineData"]
            elif isinstance(part.get("inline_data"), dict):
                inline = part["inline_data"]

            if inline is not None:
                b64 = inline.get("data")
                if not isinstance(b64, str) or not b64.strip():
                    saw_inline_but_empty = True
                    continue
                images.append(b64.strip())

        # ✅ 更精准：inlineData 存在但全都没 data
        if not images and saw_inline_but_empty:
            return {
                "success": False,
                "errorType": "INLINE_DATA_EMPTY",
                "error": "生成失败：检测到 inlineData 但图片数据为空（inlineData.data为空）",
                "response": data
            }

        # 6️⃣ 有图片：成功（保持你原来的返回结构）
        if images:
            return {"success": True, "image_data": images[0]}

        # 7️⃣ 无图片：有文本 -> TEXT_RESPONSE
        if texts:
            text_content = "\n".join(texts)

            # —— 可选：不做函数，直接就地识别类型（想更简单可删掉这段 detectedType）——
            low = text_content.lower()
            detected = "general"
            if any(k in low for k in ["watermark", "remove watermark", "去水印", "移除水印", "删除水印"]):
                detected = "拒绝处理水印任务"
            elif any(k in low for k in ["faceswap", "face swap", "换脸", "deepfake"]):
                detected = "拒绝处理换脸任务"
            elif any(k in low for k in ["sexually", "explicit", "porn", "nude", "nsfw", "色情", "不雅", "裸"]):
                detected = "拒绝色情任务"
            elif any(str(y) in low for y in range(2026, 2101)):
                detected = "拒绝超过知识库范围任务"

            return {
                "success": False,
                "errorType": "TEXT_RESPONSE",
                "error": detected,   # 你文档要求：直接展示 API text
                "response": data
            }

        # ✅ 更精准：parts 有结构但既无图也无文本
        return {
            "success": False,
            "error": "生成失败：parts存在但未找到图片数据或文本说明",
            "response": data
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": f"图片生成请求超时（超过 {TIMEOUT[resolution]} 秒）"}
    except Exception as e:
        return {"success": False, "error": f"图片生成请求失败: {str(e)}"}


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / NanobananaPro 节点入口

    - args.input.cleantext: 用户文字提示词
    - args.input.fileurls:  用户上传图片的 URL 列表（用于改图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "9:16"
    - args.input.resolution: 分辨率，如 "1K" / "2K" / "4K"
    """
    API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"
    API_KEY = args.input.apikey
    cleanttext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspectratio = args.input.aspect_ratio
    resolution = args.input.resolution
    # - 图片通过 image_urls 传入 generate_image，走 inline_data 改图逻辑
    prompt = cleanttext.strip()

    # 调用 Gemini 3 Pro 生成 / 编辑图片
    # 如果 fileurls 不为空，会按"改图"模式调用

    result = generate_image(prompt, aspectratio, resolution, API_KEY,API_URL,image_urls=fileurls if fileurls else None)

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {"analysis": "图片生成成功", "url": oss_url, "error": None}
    else:
        return {"analysis": "图片生成失败", "url": None, "error": result["error"]}
```

## Coze ワークフローでの使い方

公開後、プラグインノードを Coze ワークフローにドラッグし、次のように接続します。

```text theme={null}
Start node (user prompt + images)
    ↓
Prompt / image splitter (code node)
    ↓
Per-user API key dictionary (route by caller name)
    ↓
nanobanana_apiyi plugin node (this plugin)
    ↓
Success / failure branch
    ↓
End node (output url or error)
```

<Tip>
  [Feishu Bitable AI 画像生成ワークフロー](/ja/scenarios/ecosystem/feishu-bitable-image-shortcut) と組み合わせれば、ノーコードの生産ラインとして使えます。運用担当者は Feishu Bitable の行を埋めるだけで、画像を一括生成できます。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="なぜ base64 を返すのではなく OSS にアップロードするのですか？">
    下流の Coze ワークフローノード（特に Feishu のフィールドショートカット）は、結果を画像添付に変換するために通常 **アクセス可能な URL** を必要とします。base64 を返すと、データがワークフロー内を非効率に移動することになり、Feishu では直接レンダリングできません。OSS リンクがあれば、長期アーカイブや外部共有も簡単です。
  </Accordion>

  <Accordion title="OSS 設定に環境変数を使えますか？">
    Coze のカスタムプラグインは、現時点ではシステム環境変数を公開していません。推奨される方法は、ファイルの先頭に OSS 認証情報を定数として保持し、Coze のプラグイン暗号化機能で保護することです。マルチテナントのワークフローでは、テナントごとのプレフィックスも OSS パスに書き込んでください。
  </Accordion>

  <Accordion title="なぜ apikey はハードコードせずに渡すのですか？">
    呼び出し元ごとに異なるキーを配布するためです。上流に「ユーザーごとの API key」辞書ノードを追加し、呼び出し元の名前を APIYI キーにマッピングしてください。利用計測とアクセス制御の両方で扱いやすくなります。
  </Accordion>

  <Accordion title="4K 生成がタイムアウトし続けますか？">
    Nano Banana Pro の 4K 生成は本当に遅いです（通常 5〜15 分）。このプラグインでは、すでに 4K 向けに 1200 秒のタイムアウトを設定しています。それでもタイムアウトする場合は:

    1. プロンプトのデバッグのために 2K に下げる
    2. APIYI コンソールでレート制限を確認する
    3. 同時実行数を減らす
  </Accordion>

  <Accordion title="TEXT_RESPONSE エラーはどう対処しますか？">
    これは通常、モデルが拒否したことを意味します（違反、年のカットオフなど）。プラグインはタイプを自動分類します: 透かし削除 / 顔交換 / NSFW / 年 > 2025。`error` フィールドをユーザーに表示してください — **再試行しないでください**。結果は同じになります。
  </Accordion>

  <Accordion title="完全なソースコードはどこですか？直接コピーできますか？">
    はい。「Plugin Full Source」セクションには完全な `coze-nanobanana-pro.py` が含まれています（Shuaila1996 により提供）。**上部の 4 つの OSS 設定行を更新するだけ**で、Coze IDE に貼り付けられます。別途ダウンロードは不要です。

    さらに必要な場合:

    * Feishu のフィールドショートカット → [Feishu Bitable AI 画像生成ワークフロー](/ja/scenarios/ecosystem/feishu-bitable-image-shortcut) の「Feishu Field Shortcut Full Source」を参照してください
    * Aliyun FC コード → 同じドキュメントの「Aliyun Function Compute Full Source」を参照してください
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Feishu Bitable AI画像生成" icon="table" href="/ja/scenarios/ecosystem/feishu-bitable-image-shortcut">
    最適な相棒です。Coze のこのワークフローを Feishu Bitable に接続すれば、運用担当者は行を埋めるだけで一括生成できます
  </Card>

  <Card title="Nano Banana Pro ドキュメント" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Nano Banana Pro の完全な API ドキュメント、料金、生成サンプル
  </Card>

  <Card title="画像生成失敗 FAQ" icon="circle-question-mark" href="/ja/faq/nano-banana-image-failure">
    このプラグインのエラーコードに対応した Nano Banana の障害対応ガイドです
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://api.apiyi.com/token">
    APIキーを管理し、使用量と残高を確認できます
  </Card>
</CardGroup>
