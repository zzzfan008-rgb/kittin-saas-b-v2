> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 코드에서 에셋 참조 동영상 생성

> Seedance 2.0 에셋 참조를 위한 엔드투엔드 코드 가이드입니다: 로컬 이미지를 업로드하고, asset:// ID를 얻기 위해 ingest한 다음, 이를 참조해 캐릭터 일관성이 유지되는 동영상을 생성하고, 상태를 폴링해 다운로드합니다. Python / cURL / Node.js 전체 스크립트를 포함합니다.

<Info>
  이 페이지는 **코드 경로**에 초점을 맞춥니다. 로컬 이미지를 `asset://` 자산 ID로 변환한 다음, 이를 참조해 캐릭터 일관성이 유지되는 동영상을 생성합니다. 하나의 스크립트로 끝까지 진행하는 방식입니다. 엔드포인트별 문서와 코드 없이 사용하는 웹 UI는 [Asset Library](/ko/api-capabilities/seedance2/asset-library)를 참조하시고, 생성 엔드포인트의 전체 매개변수 표는 [Video Generation API](/ko/api-capabilities/seedance2/video-generation)를 참조하십시오.

  자산 라이브러리는 **Seedance 2.0 API와 함께 무료로 제공되며, 연간 요금이 없습니다**(공식적으로는 별도 구매하는 추가 옵션입니다: 프레임워크 계약이 없는 고객을 위한 수십만 CNY 규모의 연간 계약).
</Info>

## 자산 참조가 필요할 때

캐릭터 일관성이 필요한 동영상을 생성할 때, Seedance 2.0은 **사진처럼 사실적인 인간 얼굴이 포함된 참조 이미지를 직접 허용하지 않습니다**(딥페이크 방지 필터링). 먼저 초상 사진을 신뢰된 자산으로 인제스트하여 `asset://xxx` 자산 ID를 얻은 다음, 이를 생성 요청에서 참조해야 합니다. 그러면 에피소드와 샷 전반에서 캐릭터의 얼굴과 의상을 일관되게 유지할 수 있습니다. 먼저 해당 사례를 찾으십시오:

| 소재 유형                | 예시                         | 사용 방법                                                                                                                    |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 애니메 / 스타일화된 캐릭터      | 애니메, 만화, 3D-만화 캐릭터         | 사진처럼 사실적인 얼굴이 없으므로 일반적으로 차단되지 않습니다. public URL / Base64 참조 이미지를 직접 사용하십시오 — **인제스트가 필요하지 않습니다**; 이 페이지의 4단계(생성)부터 시작하십시오 |
| 가상 아바타(AI 생성 사진풍 초상) | 모델이 생성했으며, 실제로 존재하는 사람이 아님 | 가상 아바타 인제스트(이 페이지의 전체 흐름)를 사용하고 `asset://` ID를 참조하십시오                                                                    |
| 실제 얼굴                | 유명인, 모델, 또는 사용자 본인의 사진     | 먼저 완전 자동화된 실제 인물 확인 API 흐름을 실행하여 실제 인물 자산 그룹을 얻은 다음, 인제스트할 때 그 `groupId`를 전달하십시오 — 나머지 코드는 이 페이지와 동일합니다                  |

## 사전 요구 사항

<Warning>
  **서로 다른 두 키 — 혼동하지 마십시오**:

  * **Asset Library 키** (icover.ai의 Settings → Asset Library 키에서 생성, `sk-...`): 에셋 업로드 / 수집 / 조회에 사용합니다. [Asset Library 페이지의 0단계](/ko/api-capabilities/seedance2/asset-library)를 참조하십시오.
  * **APIYI Seedance 동영상 token** (api.apiyi.com에서 생성, `sk-...`, 2.5 및 2.0 제품군에서 공유되는 `SeeDance2` 그룹이 활성화되어 있어야 함): 동영상 생성 엔드포인트에 사용합니다.
</Warning>

## 파이프라인 개요

로컬 이미지 → 1) `presign` 직접 업로드 URL과 `PUT` 파일을 사용해 public URL을 얻음 → 2) 자산을 수집하고 asset ID를 얻음 → 3) `Active`가 될 때까지 폴링함(이미지당 약 13초) → 4) 생성 요청에서 `asset://<Id>`를 참조하고, 프롬프트에서는 이를 "Image 1"로 지칭함 → 5) 태스크가 `succeeded`가 될 때까지 폴링함 → 6) `content.video_url`를 다운로드함(서명된 링크는 **24시간 후 만료됩니다** — 즉시 저장하십시오).

이미 public image URL이 있다면 1단계를 건너뛰십시오. Asset ID는 영구적입니다 — 한 번 수집하면 영원히 참조할 수 있습니다.

## 전체 코드

<CodeGroup>
  ```python Python (전체 과정: 업로드 → 인제스트 → 생성 → 다운로드) theme={null}
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

  ```bash cURL (단계별) theme={null}
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

  ```javascript Node.js (전체 과정) theme={null}
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
  프롬프트에서 자산을 “Image 1”, “Image 2”로 참조합니다(`content` 배열의 순서와 일치해야 함). — **프롬프트에 원시 자산 ID를 절대 작성하지 마십시오**.
</Warning>

## 여러 자산을 활용한 고급 사용법

* **여러 참고 이미지**: `content`에 여러 `image_url` 항목을 넣고(0–9개의 이미지, 각 항목은 `role: "reference_image"` 포함) 순서대로 “이미지 1”, “이미지 2”로 참조합니다. 한 캐릭터의 경우 전신 정면 샷과 중립적인 정면 얼굴 클로즈업을 함께 참조하면 일관성이 가장 좋습니다.
* **소스 혼합**: `asset://` ID, 공개 URL, Base64(`data:image/png;base64,...`)를 같은 `content` 배열에 섞어 넣을 수 있습니다. 사진처럼 사실적인 얼굴이 포함된 이미지만 `asset://`를 거쳐야 합니다.
* **참고 동영상 / 오디오**: 0–3개의 `video_url` 항목(`role: "reference_video"`)과 0–3개의 `audio_url` 항목(`role: "reference_audio"`)도 추가할 수 있습니다. 이미지 또는 동영상은 최소 1개가 필요하며, 오디오는 이미지 또는 동영상과 함께 전송해야 합니다.
* **실제 인물 자산**: 먼저 [완전 자동 실제 인물 검증 흐름](/ko/api-capabilities/seedance2/asset-library)을 실행합니다. 배우가 생체 인증을 완료하면 전용 실제 인물 자산 그룹 `GroupId`를 받게 되며, 수집할 때는 이를 `groupId`로 전달합니다. 생성 측 코드는 이 페이지와 동일합니다.

## 일반적인 오류

| 오류 / 증상                                    | 원인                                                                      | 해결 방법                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 400 `The specified asset ... is not found` | `asset://` ID가 APIYI 채널의 계정에 속하지 않거나(예: 다른 제공업체를 통해 인제스트됨), ID가 잘못되었습니다 | 이 페이지에 따라 icover.ai에서 다시 인제스트하고 자산 ID를 다시 확인합니다                   |
| “이 모델에 사용할 수 있는 채널이 없습니다”                  | APIYI token에 `SeeDance2` 그룹이 없습니다                                       | api.apiyi.com의 token 설정에서 활성화한 후 다시 시도합니다                         |
| Python gzip 디코딩 오류 / 잘린 비JSON 본문           | 게이트웨이의 gzip 응답 헤더가 실제 인코딩과 일치하지 않습니다                                    | `"Accept-Encoding": "identity"` 요청 헤더를 추가합니다(스크립트에 이미 포함되어 있습니다)  |
| 자산 상태 `Failed`                             | 이미지 형식 또는 크기가 사양을 벗어났습니다                                                | 가로세로 비율 0.4–2.5, 변 길이 300–6000px, 30MB 미만이어야 합니다. 수정한 후 다시 업로드합니다 |
| 직접 얼굴 이미지 거부                               | 실사 얼굴은 직접 참조 이미지로 사용할 수 없습니다(안티 딥페이크 필터링)                               | 먼저 인제스트한 후 `asset://` ID를 참조합니다. 실제 인물 사진은 먼저 실제 인물 인증이 필요합니다     |
| `PUBLIC_`로 시작하는 오류                         | 업스트림 콘텐츠 검수에 의해 차단되었습니다(해당 시도에는 과금되지 않습니다)                              | 소재 또는 prompt를 조정한 후 그대로 다시 시도합니다                                  |

## 관련 페이지

<CardGroup cols={3}>
  <Card title="Seedance 2.0 개요" icon="sparkles" href="/ko/api-capabilities/seedance2/overview">
    모델 선택, 과금, 해상도 표 및 FAQ
  </Card>

  <Card title="동영상 생성 API" icon="video" href="/ko/api-capabilities/seedance2/video-generation">
    전체 매개변수 표, 4가지 생성 모드 및 응답 형식
  </Card>

  <Card title="에셋 라이브러리" icon="images" href="/ko/api-capabilities/seedance2/asset-library">
    모든 에셋 라이브러리 엔드포인트, 코드 없는 웹 UI 및 실제 인물 인증
  </Card>

  <Card title="에셋 우선 워크플로" icon="gauge" href="/ko/api-capabilities/seedance2/asset-first-workflow">
    인라인 이미지보다 에셋 ID가 속도와 안정성 측면에서 뛰어난 이유 및 제출 시간 초과 처리 방법
  </Card>
</CardGroup>
