> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# コードでのアセット参照動画生成

> Seedance 2.0 のアセット参照のためのエンドツーエンドのコードガイドです。ローカル画像をアップロードして取り込み、asset:// ID を取得し、それを参照してキャラクターの一貫性を保った動画を生成し、ポーリングとダウンロードまで行います。Python / cURL / Node.js の完全なスクリプト付きです。

<Info>
  このページでは **コードパス** に焦点を当てます。ローカル画像を `asset://` のアセットIDに変換し、それを参照してキャラクターの一貫性が保たれた動画を生成します。1本のスクリプトで、端から端まで完結させます。エンドポイントごとのドキュメントとコード不要のWeb UIについては [Asset Library](/ja/api-capabilities/seedance2/asset-library) をご覧ください。生成エンドポイントの完全なパラメータ表については [Video Generation API](/ja/api-capabilities/seedance2/video-generation) をご覧ください。

  アセットライブラリは **Seedance 2.0 API では無料です — 年間料金はかかりません**（正式には別売りのアドオンで、フレームワーク契約のないお客様向けには年間6桁CNYの契約です）。
</Info>

## アセット参照が必要な場合

キャラクターの一貫性がある動画を生成する場合、Seedance 2.0 は**写実的な人間の顔を含む参照画像を直接受け付けません**（ディープフェイク対策フィルタリング）。まずポートレートを信頼済みアセットとして取り込み、`asset://xxx` のアセット ID を取得してから、生成リクエストでそれを参照する必要があります。これにより、エピソードやショットをまたいでキャラクターの顔と服装の一貫性を保てます。まずは自分のケースを確認してください。

| 素材タイプ                      | 例                           | 使い方                                                                                                 |
| -------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| アニメ / スタイライズされたキャラクター      | アニメ、カートゥーン、3D カートゥーンのキャラクター | 写実的な顔ではないため、通常はブロックされません。公開 URL / Base64 の参照画像を直接使用してください — **取り込みは不要**です。このページのステップ 4（生成）から始めてください |
| バーチャルアバター（AI 生成の写実的ポートレート） | モデル生成で、そのような実在人物は存在しない      | バーチャルアバターの取り込み（このページの完全なフロー）を使用し、`asset://` ID を参照してください                                            |
| 実在の顔                       | 有名人、モデル、またはユーザー本人の写真        | まず完全自動の実在人物確認 API フローを実行して、実在人物アセットグループを取得します。取り込み時にその `groupId` を渡してください。残りのコードはこのページと同じです         |

## 前提条件

<Warning>
  **2種類の異なるキー — 混同しないでください**:

  * **アセットライブラリ KEY**（icover.ai の Settings → アセットライブラリ KEY で作成、`sk-...`）：アセットのアップロード／取り込み／クエリに使用します。[アセットライブラリページのステップ 0](/ja/api-capabilities/seedance2/asset-library)を参照してください。
  * **APIYI Seedance 動画 token**（api.apiyi.com で作成、`sk-...`、`SeeDance2` グループを有効化。2.5 と 2.0 ファミリーで共有）：動画生成エンドポイント用です。
</Warning>

## パイプラインの概要

ローカル画像 → 1) `presign` して直接アップロード用URLを取得し、`PUT` してファイルを公開URLに変換する → 2) アセットを取り込んでアセットIDを取得する → 3) `Active` までポーリングする（画像1枚あたり約13秒） → 4) 生成リクエストで `asset://<Id>` を参照し、プロンプト内では「Image 1」として扱う → 5) タスクを `succeeded` までポーリングする → 6) `content.video_url` をダウンロードする（署名付きリンクは**24時間で期限切れ**になります — すぐに保存してください）。

すでに公開画像URLがある場合は、ステップ1をスキップしてください。アセットIDは永続的です — 1回取り込めば、ずっと参照できます。

## 完全なコード

<CodeGroup>
  ```python Python（エンドツーエンド：アップロード → 取り込み → 生成 → ダウンロード） theme={null}
  import time
  from pathlib import Path

  import requests

  ASSET_KEY = "sk-your-asset-library-KEY"  # icover.ai Settings → Asset Library KEY
  APIYI_KEY = "sk-your-APIYI-token"        # api.apiyi.com: token needs the SeeDance2 group
  IMAGE_PATH = "portrait.jpg"              # local reference image (virtual avatar)
  PROMPT = "The character in Image 1 smiles at the camera, slow push-in, natural light"

  ICOVER = "https://icover.ai/api"
  SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  ASSET_HEADERS = {"Authorization": f"Bearer {ASSET_KEY}"}
  APIYI_HEADERS = {
      "Authorization": f"Bearer {APIYI_KEY}",
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",  # required: works around a gateway gzip header mismatch
  }


  def upload_image(path: str) -> str:
      """1) presign + PUT the local image; returns a public URL (skip if you have one)"""
      ext = Path(path).suffix.lstrip(".").lower() or "jpg"
      content_type = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"
      data = requests.post(
          f"{ICOVER}/storage/presign", headers=ASSET_HEADERS,
          json={"ext": ext, "contentType": content_type}, timeout=30,
      ).json()["data"]
      resp = requests.put(
          data["uploadUrl"], data=Path(path).read_bytes(),
          headers={"Content-Type": content_type}, timeout=120,  # must match the presign
      )
      resp.raise_for_status()
      return data["publicUrl"]


  def ingest_asset(image_url: str, label: str = "", group_id: str = None) -> str:
      """2) ingest the asset; returns the asset Id. Real-person assets: pass the verified group_id"""
      body = {"imageUrl": image_url, "label": label}
      if group_id:
          body["groupId"] = group_id
      r = requests.post(
          f"{ICOVER}/asset-library/assets", headers=ASSET_HEADERS,
          json=body, timeout=60,
      ).json()
      return r["Result"]["Id"]


  def wait_asset_active(asset_id: str, timeout: int = 90) -> None:
      """3) poll the ingest status until Active (about 13 seconds per image, no SLA)"""
      deadline = time.time() + timeout
      while time.time() < deadline:
          status = requests.get(
              f"{ICOVER}/asset-library/assets/{asset_id}",
              headers=ASSET_HEADERS, timeout=30,
          ).json()["Result"]["Status"]
          print("asset status:", status)
          if status == "Active":
              return
          if status == "Failed":
              raise RuntimeError("Ingest failed: check format / aspect ratio 0.4-2.5 / side 300-6000px, then re-upload")
          time.sleep(3)
      raise TimeoutError("Not Active after 90 seconds — investigate and retry")


  def create_video_task(asset_id: str) -> str:
      """4) create the generation task referencing asset://. Say "Image 1" in the prompt, never the raw asset ID"""
      body = {
          "model": "doubao-seedance-2-0-260128",
          "content": [
              {"type": "text", "text": PROMPT},
              {"type": "image_url",
               "image_url": {"url": f"asset://{asset_id}"},
               "role": "reference_image"},
          ],
          "resolution": "720p", "ratio": "16:9", "duration": 5,
      }
      return requests.post(SEEDANCE, headers=APIYI_HEADERS, json=body, timeout=60).json()["id"]


  def wait_video(task_id: str) -> dict:
      """5) poll the task until a terminal state (succeeded / failed / expired)"""
      while True:
          time.sleep(20)
          task = requests.get(f"{SEEDANCE}/{task_id}", headers=APIYI_HEADERS, timeout=30).json()
          print("task status:", task.get("status"))
          if task.get("status") in ("succeeded", "failed", "expired"):
              return task


  def download(task: dict, out: str) -> None:
      """6) download the video. The signed link expires in 24 hours; no Authorization header here"""
      with requests.get(task["content"]["video_url"], stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(out, "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print("saved", out)


  if __name__ == "__main__":
      public_url = upload_image(IMAGE_PATH)
      asset_id = ingest_asset(public_url, label="character-A-front")
      print("asset ID:", f"asset://{asset_id}")
      wait_asset_active(asset_id)

      task_id = create_video_task(asset_id)
      print("task_id:", task_id)
      task = wait_video(task_id)
      if task["status"] == "succeeded":
          print("billed tokens:", task["usage"]["completion_tokens"])
          download(task, f"{task_id}.mp4")
      else:
          print("task did not succeed:", task.get("error"))
  ```

  ```bash cURL（ステップごと） theme={null}
  # 1) Request a presigned upload URL (skip 1-2 if you already have a public image URL)
  curl -X POST https://icover.ai/api/storage/presign \
    -H "Authorization: Bearer sk-your-asset-library-KEY" \
    -H "Content-Type: application/json" \
    -d '{"ext":"jpg","contentType":"image/jpeg"}'
  # → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

  # 2) PUT the file (Content-Type must match the presign); publicUrl is then your public address
  curl -X PUT "the-uploadUrl-you-just-received" \
    -H "Content-Type: image/jpeg" \
    --data-binary @portrait.jpg

  # 3) Ingest the asset (real-person assets: add "groupId":"the-verified-group-ID")
  curl -X POST https://icover.ai/api/asset-library/assets \
    -H "Authorization: Bearer sk-your-asset-library-KEY" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://cdn.icover.ai/uploads/seedance/xxx.jpg","label":"character-A-front"}'
  # → { ..., "Result": { "Id": "asset-2026xxxx-xxxxx" } }

  # 4) Poll every 3 seconds until Result.Status == "Active"
  curl https://icover.ai/api/asset-library/assets/asset-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-your-asset-library-KEY"

  # 5) Create the generation task referencing asset:// (switch to your APIYI token!
  #    Refer to the asset as "Image 1" in the prompt)
  curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
    -H "Authorization: Bearer sk-your-APIYI-token" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-260128",
      "content": [
        {"type":"text","text":"The character in Image 1 smiles at the camera, slow push-in, natural light"},
        {"type":"image_url","image_url":{"url":"asset://asset-2026xxxx-xxxxx"},"role":"reference_image"}
      ],
      "resolution":"720p","ratio":"16:9","duration":5
    }'
  # → {"id":"cgt-2026xxxx-xxxxx"}

  # 6) Poll every 20 seconds; once status=succeeded, download content.video_url (expires in 24h)
  curl https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-your-APIYI-token"
  ```

  ```javascript Node.js（エンドツーエンド） theme={null}
  import { readFileSync, writeFileSync } from "node:fs";

  const ASSET_KEY = "sk-your-asset-library-KEY"; // icover.ai Settings → Asset Library KEY
  const APIYI_KEY = "sk-your-APIYI-token";       // api.apiyi.com: token needs the SeeDance2 group
  const IMAGE_PATH = "portrait.jpg";

  const ICOVER = "https://icover.ai/api";
  const SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const AH = { Authorization: `Bearer ${ASSET_KEY}`, "Content-Type": "application/json" };
  const VH = { Authorization: `Bearer ${APIYI_KEY}`, "Content-Type": "application/json" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 1) presign + PUT the local image to get a public URL
  const { data } = await fetch(`${ICOVER}/storage/presign`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ ext: "jpg", contentType: "image/jpeg" }),
  }).then((r) => r.json());
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: readFileSync(IMAGE_PATH),
  });

  // 2) Ingest the asset (real-person assets: add groupId to the body)
  const ingest = await fetch(`${ICOVER}/asset-library/assets`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ imageUrl: data.publicUrl, label: "character-A-front" }),
  }).then((r) => r.json());
  const assetId = ingest.Result.Id;
  console.log("asset ID:", `asset://${assetId}`);

  // 3) Poll until Active (about 13 seconds)
  let assetStatus;
  do {
    await sleep(3000);
    const info = await fetch(`${ICOVER}/asset-library/assets/${assetId}`, { headers: AH })
      .then((r) => r.json());
    assetStatus = info.Result.Status;
    console.log("asset status:", assetStatus);
  } while (assetStatus !== "Active" && assetStatus !== "Failed");
  if (assetStatus === "Failed") throw new Error("Ingest failed — check the image and re-upload");

  // 4) Create the generation task referencing asset://
  //    (say "Image 1" in the prompt, never the raw asset ID)
  const { id } = await fetch(SEEDANCE, {
    method: "POST", headers: VH,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-260128",
      content: [
        { type: "text", text: "The character in Image 1 smiles at the camera, slow push-in, natural light" },
        { type: "image_url", image_url: { url: `asset://${assetId}` }, role: "reference_image" },
      ],
      resolution: "720p", ratio: "16:9", duration: 5,
    }),
  }).then((r) => r.json());
  console.log("task_id:", id);

  // 5) Poll the task until a terminal state
  let task;
  do {
    await sleep(20000);
    task = await fetch(`${SEEDANCE}/${id}`, { headers: VH }).then((r) => r.json());
    console.log("task status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 6) Download (the signed link expires in 24 hours; no Authorization header here)
  if (task.status === "succeeded") {
    const buf = Buffer.from(await fetch(task.content.video_url).then((r) => r.arrayBuffer()));
    writeFileSync(`${id}.mp4`, buf);
    console.log(`saved ${id}.mp4`);
  } else {
    console.log("task did not succeed:", task.error);
  }
  ```
</CodeGroup>

<Warning>
  プロンプト内ではアセットを「Image 1」「Image 2」として参照してください（`content` 配列内の順序に対応）— **生のアセットIDはプロンプトに決して記述しないでください**。
</Warning>

## 複数アセットを使った高度な利用

* **複数の参照画像**: 複数の `image_url` 項目を `content` に入れ（0〜9枚、各項目に `role: "reference_image"` 付き）、「画像 1」「画像 2」のように順番に参照します。1人のキャラクターでは、全身の正面ショットとニュートラルな正面顔のクローズアップを併用すると、最も一貫性が高くなります。
* **ソースの混在**: `asset://` ID、公開URL、Base64（`data:image/png;base64,...`）を同じ `content` 配列に混在できます。写実的な顔を含む画像だけは `asset://` を経由する必要があります。
* **参照動画 / 音声**: 0〜3個の `video_url` 項目（`role: "reference_video"`）と 0〜3個の `audio_url` 項目（`role: "reference_audio"`）も追加できます。画像または動画は少なくとも1つ必要で、音声は画像または動画と一緒に送信する必要があります。
* **実在人物アセット**: まず [完全自動の実在人物認証フロー](/ja/api-capabilities/seedance2/asset-library) を実行してください — 演者がライブネス認証を完了すると、専用の実在人物アセットグループ `GroupId` が付与されます。取り込み時には `groupId` として渡してください。生成側のコードはこのページと同じです。

## よくあるエラー

| エラー / 症状                                          | 原因                                                                             | 対処方法                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 400 `The specified asset ... is not found`        | `asset://` ID が APIYI チャネルのアカウントに属していません（別のプロバイダーで取り込まれた場合など）。または ID が正しくありません | このページに従って icover.ai で再度取り込み、アセット ID を再確認してください                         |
| 「このモデルに利用可能なチャネルがありません」                           | APIYI token に `SeeDance2` グループがありません                                           | api.apiyi.com の token 設定で有効にしてから、再試行してください                             |
| Python の gzip デコードエラー / JSON 以外のレスポンスボディが途中で切れている | ゲートウェイの gzip レスポンスヘッダーが実際のエンコーディングと一致していません                                    | `"Accept-Encoding": "identity"` リクエストヘッダーを追加してください（スクリプトにはすでに追加されています） |
| アセットのステータス `Failed`                               | 画像形式またはサイズが仕様外です                                                               | アスペクト比は 0.4～2.5、辺の長さは 300～6000px、30MB 未満にしてください。修正して再アップロードしてください      |
| 直接の顔画像が拒否される                                      | 写実的な顔は直接の参照画像として使用できません（ディープフェイク対策フィルタリング）                                     | まず取り込みを行い、`asset://` ID を参照してください。実在人物の写真には、先に実在人物の確認が必要です             |
| `PUBLIC_` で始まるエラー                                 | 上流のコンテンツモデレーションによってブロックされています（この試行には課金されません）                                   | 素材または prompt を調整して、そのまま再試行してください                                       |

## 関連ページ

<CardGroup cols={3}>
  <Card title="Seedance 2.0 概要" icon="sparkles" href="/ja/api-capabilities/seedance2/overview">
    モデル選択、料金、解像度テーブル、FAQ
  </Card>

  <Card title="動画生成 API" icon="video" href="/ja/api-capabilities/seedance2/video-generation">
    完全なパラメータテーブル、4つの生成モード、レスポンス形式
  </Card>

  <Card title="アセットライブラリ" icon="images" href="/ja/api-capabilities/seedance2/asset-library">
    すべてのアセットライブラリ用エンドポイント、ゼロコード Web UI、本人確認
  </Card>

  <Card title="アセットファーストワークフロー" icon="gauge" href="/ja/api-capabilities/seedance2/asset-first-workflow">
    インライン画像よりもアセット IDのほうが速度と信頼性に優れている理由、および送信タイムアウトへの対処方法
  </Card>
</CardGroup>
