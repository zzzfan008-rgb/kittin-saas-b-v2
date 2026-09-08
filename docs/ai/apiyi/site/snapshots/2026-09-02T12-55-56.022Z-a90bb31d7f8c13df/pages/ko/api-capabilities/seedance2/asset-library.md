> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 에셋 라이브러리 (캐릭터 일관성 동영상)

> icover.ai 에셋 라이브러리 오픈 API(APIYI 제품)를 사용하여 이미지를 등록하고 asset:// ID를 얻은 다음, APIYI 게이트웨이를 통해 캐릭터 일관성 동영상을 생성합니다. 코드 없이 웹에서 조작할 수 있고 REST API 배치 통합도 지원하며, Seedance 2.0 API와 함께 무료로 제공되므로 연간 요금이 없습니다.

<Info>
  **icover.ai**는 APIYI의 하위 제품으로, AI 동영상 생성을 테스트하기 위한 온라인 도구입니다. 이 에셋 라이브러리와 해당 API는 개발자와 고객이 “캐릭터 일관성 동영상” 기능을 출시하는 데 도움이 됩니다.
</Info>

<Note>
  **에셋 라이브러리는 APIYI에서 무료이며 — 연간 요금이 없습니다.** 공식적으로 이 기능은 별도 구매하는 애드온입니다: 프레임워크 계약이 없는 고객의 경우 수십만 위안 규모의 연간 계약이며, (Volcengine도 직접 판매합니다). 저희는 장기 사용자를 중요하게 여기므로, 이미 [Seedance 2.0](/ko/api-capabilities/seedance2/overview) API 가격에 포함되어 있습니다. SD2 API를 정상적으로 사용하는 고객의 경우, 일반적인 비즈니스 사용량에서는 추가 요금이 없습니다.
</Note>

## 에셋 라이브러리가 필요한 이유

캐릭터 일관성이 유지되는 동영상을 생성할 때 Seedance 2.0은 **사람 얼굴이 포함된 참조 이미지를 직접 허용하지 않습니다**(딥페이크 방지 필터링). 먼저 이미지를 신뢰할 수 있는 에셋으로 등록하고 `asset://xxx` 에셋 ID를 받은 다음, 동영상 생성 요청에서 해당 ID를 참조해야 합니다.

이 서비스가 등록 과정을 대신 처리합니다. **이미지 업로드 → 에셋 ID 받기 → 동영상 생성**만 진행하면 됩니다. 사용하는 방법은 두 가지이며, 두 방법의 데이터는 완전히 공유됩니다.

| 방법       | 적합한 대상                   | 요구 사항        |
| -------- | ------------------------ | ------------ |
| **웹 UI** | 모든 사용자, 코드 불필요           | 가입 및 로그인만 필요 |
| **API**  | 프로그래밍 방식의 일괄 통합이 필요한 개발자 | 에셋 라이브러리 키   |

<Tip>
  **공유 데이터**: 동일한 계정에서는 웹과 API를 통해 업로드한 에셋이 같은 라이브러리에 저장됩니다. API로 생성한 에셋은 웹 에셋 목록 / 보관함과 동영상 생성기의 참조 이미지 선택기에 표시되며, 웹에서 생성한 에셋은 API를 통해 목록을 조회할 수 있습니다.

  **에셋 라이브러리는 키가 아니라 icover.ai 계정에 연결됩니다**: 동일한 계정에서 생성한 모든 에셋 라이브러리 키는 서로 동일하며 같은 라이브러리에 액세스합니다. 키는 단순한 호출 자격 증명일 뿐이며 격리 기능을 제공하지 않습니다. 에셋은 계정별로 격리되므로 본인의 에셋만 확인하고 조작할 수 있습니다. 격리 및 여러 팀 간 공유 옵션은 아래의 [자주 묻는 질문](#faq)을 참조하십시오.
</Tip>

<Warning>
  **서로 다른 두 키를 혼동하지 마십시오**:

  * **에셋 라이브러리 키**(icover.ai에서 생성, `sk-...`): 이 페이지의 에셋 라이브러리 엔드포인트(업로드 / 등록 / 조회 / 삭제)에만 사용됩니다.
  * **APIYI Seedance 동영상 token**(api.apiyi.com에서 생성, `sk-...`, `SeeDance2` 그룹이 활성화되어 있으며 2.5 및 2.0 제품군에서 공유됨): 동영상 생성 엔드포인트에만 사용됩니다.
</Warning>

## 방법 1: 웹 UI(초보자에게 권장)

<Steps>
  <Step title="가입 및 로그인">
    [icover.ai 자산 라이브러리 페이지](https://icover.ai/en/seedance-official/asset-library)를 열어 가입하고 로그인합니다.
  </Step>

  <Step title="업로드 및 수집">
    "Virtual Avatar Ingest" 탭에서 이미지를 선택합니다(다중 선택 지원) → "Upload & Ingest"를 클릭합니다.

    * 자산 그룹은 선택 사항입니다. 시스템이 기본 그룹을 자동으로 사용합니다. 캐릭터별로 자산을 정리하려면 먼저 그룹을 만드십시오.
    * 이미지 요구사항: jpeg / png / webp / bmp / tiff / gif / heic; 종횡비 0.4–2.5; 변 길이 300–6000px; 각 파일 30MB 미만입니다.
  </Step>

  <Step title="자산 ID 복사">
    약 10초 이상 기다리십시오. 상태가 "Active"로 바뀌면 `asset://xxx` 자산 ID를 복사합니다.
  </Step>

  <Step title="동영상 생성">
    [icover.ai 동영상 생성기](https://icover.ai/en/seedance-official)로 이동합니다: "Multimodal" 모드로 전환하고, 참조 이미지 유형을 "Asset"으로 설정한 뒤, 자산을 선택하고 prompt에서는 캐릭터를 "Image 1"로 참조합니다.
  </Step>
</Steps>

**실인물 자산(웹 버전)**: "Real-Person Verification" 탭에서 3단계로 진행합니다 — 1) "Generate verification link"를 클릭한 다음 배우가 QR 코드를 스캔하거나 휴대폰으로 링크를 열고 Volcengine 계정에 로그인하여 실재성 검증을 완료합니다. 2) "Query verification result"를 클릭해 배우 전용 실인물 자산 그룹을 받습니다. 3) 해당 그룹을 선택하고 자산(이미지 / 동영상 / 오디오)을 업로드하면 얼굴 일관성 검사를 통과하며 `asset://` ID를 얻습니다. 같은 배우라도 스타일이 달라져도 같은 그룹을 재사용하므로 재검증이 필요하지 않습니다.

<Frame caption="The asset library web UI: the ingest tab for manual uploads, the asset list / archive tab for browsing assets and copying asset:// IDs, and the real-person verification tab for verifying and uploading real-face assets">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-web-ui.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=1a1b0294e87aeba902589f59f22ca330" alt="SeeDance 2.0 자산 라이브러리 웹 UI: Active 상태 배지가 있는 자산 카드, asset:// ID 복사 버튼, 삭제 버튼이 표시된 자산 목록 페이지" width="1600" height="1013" data-path="images/seedance2-asset-library-web-ui.jpg" />
</Frame>

<Tip>
  **캐릭터 일관성 팁**: 최상의 결과를 위해 같은 캐릭터의 전신 정면 샷과 중립적인 정면 얼굴 클로즈업을 하나의 자산 그룹에 넣으십시오.
</Tip>

## 방법 2: API(개발자용)

### 0단계: 자산 라이브러리 키 생성

icover.ai에 로그인한 뒤 설정 → 자산 라이브러리 키 (`icover.ai/en/settings/apikeys`)로 이동하여 `sk-...` 형식의 키를 생성합니다.

<Frame caption="Settings → Asset Library KEY: click the create button and copy the generated sk-... key (note this is separate from the APIYI Token entry in the sidebar)">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-key-create.png?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=b7aef248abd888990cc0890de84d93cc" alt="icover.ai 설정의 자산 라이브러리 키 관리 페이지로, 생성 버튼과 기존 키 목록이 있습니다" width="1600" height="679" data-path="images/seedance2-asset-library-key-create.png" />
</Frame>

모든 asset-library 요청에 포함합니다:

```
Authorization: Bearer sk-your-asset-library-KEY
```

### 1단계: 파일을 업로드하고 public URL을 얻습니다

에셋 파일(이미지이며, 실사 인물 에셋은 동영상 / 오디오도 지원합니다)은 먼저 공개 URL을 통해 접근 가능해야 합니다. 다음 두 경로 중 하나를 선택하십시오.

**A. 이미 public URL이 있습니다**(자체 CDN / 파일 호스트) → 2단계로 건너뜁니다.

**B. 당사 스토리지에 업로드합니다**(두 번의 호출: 서명된 업로드 URL을 요청 → 파일을 PUT):

```bash theme={null}
# 1. Request a presigned upload URL
curl -X POST https://icover.ai/api/storage/presign \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{"ext":"jpg","contentType":"image/jpeg"}'
# → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

# 2. PUT the file to uploadUrl (Content-Type must match the presign request)
curl -X PUT "the-uploadUrl-you-just-received" \
  -H "Content-Type: image/jpeg" \
  --data-binary @portrait.jpg
# Once it succeeds, publicUrl is your file's public address
# Same for video/audio: swap ext/contentType to mp4/video/mp4, mp3/audio/mpeg, etc.
```

### 단계 2: 자산을 수집합니다

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "actor-A-front"
  }'
# → Raw Volcengine response: { ..., "Result": { "Id": "asset-20260702xxxx-xxxxx" } }
```

* `groupId`은 선택 사항입니다. 기본 그룹이 자동으로 사용/생성됩니다. 캐릭터별로 정리하려면: 먼저 `POST /api/asset-library/groups {"name":"actor-A"}`하여 그룹 ID를 가져온 다음, 여기에서 `"groupId":"group-xxx"`를 포함하십시오.
* `label`은 선택 사항이며, 웹 UI에서 자산을 식별하는 데 도움이 됩니다.

### 단계 3: 활성 상태가 될 때까지 폴링합니다

Ingest는 비동기식입니다(이미지당 약 13초, SLA 없음). 반환된 Id로 폴링합니다:

```bash theme={null}
curl https://icover.ai/api/asset-library/assets/asset-20260702xxxx-xxxxx \
  -H "Authorization: Bearer sk-your-asset-library-KEY"
# → Result.Status == "Active" means ready; "Failed" means re-upload
```

3초마다 폴링하는 것을 권장합니다. `Active` 없이 90초가 지나면 조사해야 할 타임아웃으로 간주합니다.

### 4단계: 자산 ID로 동영상 생성(APIYI 사용)

자산 ID를 `asset://<Id>`로 작성하고 **자체 APIYI Seedance 동영상 token**(자산 라이브러리 키가 아님)을 사용하여 APIYI를 호출합니다.

```bash theme={null}
curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
  -H "Authorization: Bearer sk-your-APIYI-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "content": [
      {"type":"text","text":"The character in Image 1 smiles at the camera, slow push-in, natural light"},
      {"type":"image_url","image_url":{"url":"asset://asset-20260702xxxx-xxxxx"},"role":"reference_image"}
    ],
    "ratio":"16:9","duration":5,"resolution":"720p"
  }'
# Returns a task id; poll GET .../tasks/{id} until status=succeeded, then read content.video_url
```

<Warning>
  프롬프트에서 자산을 “Image 1”로 참조해야 하며, **프롬프트에 원시 자산 ID를 작성하지 마십시오**.
</Warning>

모델 선택, 과금 및 해상도 표는 [Seedance 2.0 개요](/ko/api-capabilities/seedance2/overview)를 참조하고, 전체 생성 매개변수는 [동영상 생성 API](/ko/api-capabilities/seedance2/video-generation)를 참조하십시오. 업로드 → 수집 → 생성 → 다운로드의 전체 실행 가능한 엔드투엔드 스크립트는 [자산 참조 가이드](/ko/api-capabilities/seedance2/asset-reference)를 참조하십시오.

### 전체 엔드포인트 참조

| 엔드포인트                                          | 메서드                   | 설명                                                                                                                                                                                                                          |
| ---------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/storage/presign`                         | POST                  | 사전 서명된 파일 업로드 URL `{ext?, contentType?}`을 요청합니다                                                                                                                                                                             |
| `/api/asset-library/groups`                    | POST / GET            | 그룹 `{name, description?}`를 생성합니다 / 내 그룹(실명 그룹 포함)을 조회합니다                                                                                                                                                                    |
| `/api/asset-library/assets`                    | POST / GET            | `{groupId?, imageUrl, label?, assetType?}`를 수집합니다 (assetType은 선택 사항: `Image` / `Video` / `Audio`, 기본값은 Image) / 자산을 조회합니다 (`?groupId=`, `?pageNumber=`, `?pageSize=` 모두 선택 사항이며; 기본값은 1페이지, 페이지당 100개, pageSize는 최대 100입니다) |
| `/api/asset-library/assets/{id}`               | GET / DELETE / PATCH  | 상태를 확인합니다 / 삭제합니다 / 레이블 `{label}`을 업데이트합니다                                                                                                                                                                                  |
| `/api/asset-library/real-person/sessions`      | POST / GET            | 실명 인증 `{name?}`을 시작합니다 → H5 인증 링크와 조회용 자격 증명을 반환합니다 / 내 인증 세션을 조회합니다                                                                                                                                                        |
| `/api/asset-library/real-person/sessions/{id}` | POST / PATCH / DELETE | 인증 결과를 조회합니다(성공 시 실명 자산 그룹 GroupId를 반환합니다) / `{name}` 이름을 변경합니다 / 레코드를 삭제합니다                                                                                                                                                |
| `/api/asset-library/records`                   | GET                   | 내 자산 + 실명 인증 아카이브(웹 UI 데이터 소스)                                                                                                                                                                                              |

**응답 규칙**:

* **단일 항목 엔드포인트**(그룹 생성 / 수집 / 상태 조회 / 삭제)는 성공과 실패 모두에서 **원본 Volcengine JSON**을 그대로 전달합니다.
* **목록 엔드포인트**(`GET` on `groups` / `assets`)는 병합되어 내 자산에 맞게 필터링되므로, **상위 원본 출력과 바이트 단위로 동일하지는 않습니다**: 원본 Volcengine 필드는 모두 유지되며, 여기에 `_`로 시작하는 몇 가지 자체 메타데이터 필드가 추가됩니다(예: `_library`). 파싱할 때 알 수 없는 `_`-접두사 필드는 무시하십시오 — 이를 더 추가해도 호환성을 깨는 변경은 아닙니다.
* 자체 오류는 `[client] `가 앞에 붙는 일반 텍스트입니다(400/401/403/404/502).
* `records`, `real-person/sessions`의 GET/PATCH/DELETE, 그리고 자산 `PATCH`는 `{code, message, data}` JSON을 반환합니다(코드 0 = 성공).

## 실제 인물 자산(완전 자동화된 API)

실제 인물 초상은 촬영 대상자(배우)가 한 번의 **생체성 검증**을 완료해야 하며, 이를 통해 초상권 소유를 원천에서 확정합니다. 이제 전체 흐름은 완전히 API 기반으로 동작합니다. 웹 UI의 「Real-Person Verification」 탭은 동일한 흐름을 인터페이스로 제공하는 것입니다.

### Step 1: 검증 세션을 시작하고 H5 링크를 가져옵니다

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"actor-A"}'
# → Raw Volcengine response: { "Result": { "BytedToken":"2026...", "H5Link":"https://ark.volcengine.com/..." } }
```

* `H5Link`를 배우에게 보내 **휴대폰에서 열도록** 하십시오(또는 QR 코드로 바꿔 스캔하게 하십시오). 배우는 개인 Volcengine 계정에 로그인한 뒤 생체성 검증을 완료합니다. 조명 / 카메라 각도 때문에 시도가 실패할 수 있으며, 이 경우 다시 시도하면 됩니다.
* `BytedToken`는 조회용 자격 증명이며, 저희가 세션과 함께 저장합니다. `GET /api/asset-library/real-person/sessions`를 사용하면 언제든 세션을 조회할 수 있습니다(id / status / h5Link 포함).

### Step 2: 배우가 완료한 뒤 결과를 조회합니다

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions/{session-id} \
  -H "Authorization: Bearer sk-your-asset-library-KEY"
# Verified → { "Result": { "GroupId": "group-xxxx" } }  ← the actor's dedicated real-person asset group
# Not yet  → 404 NotFound.<token> (raw Volcengine text; this is normal — query again after verification)
```

`GroupId`를 받으면 세션 상태가 `authorized`로 바뀌고, 실제 인물 자산 그룹은 자동으로 계정에 아카이브됩니다(웹 UI의 자산 그룹에도 표시됩니다). **참고**: 검증 대기 상태는 만료된 자격 증명과 동일한 `NotFound`를 반환합니다. 둘은 구분할 수 없습니다. 오랫동안 사용하지 않은 링크는 만료될 수 있으므로 새 세션을 시작하면 됩니다.

### Step 3: 실제 인물 그룹에 자산을 제출합니다

가상 아바타와 동일한 수집 엔드포인트를 사용하며, 실제 인물 그룹의 `groupId`만 전달하면 됩니다. 이미지, 동영상, 오디오를 지원합니다:

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-your-asset-library-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group-xxxx",
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "actor-A-front-full-body",
    "assetType": "Image"
  }'
```

그다음에는 평소처럼 `Active`가 될 때까지 폴링하고 `asset://<Id>`로 동영상을 생성합니다(4단계는 변경되지 않습니다).

**실제 인물 자산 규칙 및 형식**:

* 하나의 실제 인물 그룹에는 **한 사람만** 포함됩니다. 같은 배우가 다른 스타일링을 적용해도 동일한 그룹을 재사용하며, 재검증은 필요하지 않습니다.
* 모든 업로드는 **얼굴 일관성 검사**를 거칩니다(동영상은 1초마다 샘플링되며, 샘플링된 모든 프레임이 통과해야 합니다). 측면 얼굴, 여러 사람, 흐릿한 자료는 실패하므로 선명한 정면 자료를 사용하십시오.
* 이미지는 30MB 미만입니다. 동영상은 mp4 / mov, 2~~15초, ≤50MB, 가로세로 비율 0.4~~2.5입니다. 오디오는 mp3 / wav, 2\~15초, ≤15MB입니다.

## 참고 사항

<Warning>
  **asset:// ID는 비밀로 취급하십시오**: asset은 이 서비스 계층에서 분리되어 있으며(목록 조회와 삭제로부터 보호됨), Volcengine은 ID로 권한을 부여할 수 없습니다. 따라서 ID가 유출되면 동일한 채널의 다른 호출자가 생성 요청에서 이를 참조할 수 있습니다. 전체 소유 및 격리 모델은 아래의 [FAQ](#faq)를 참조하십시오.
</Warning>

* **이미지 URL 수명**: query / list 엔드포인트가 반환하는 미리보기 URL은 약 12시간 동안만 유효한 임시 주소입니다. 장기 캐시는 하지 마십시오. asset ID 자체는 영구적입니다.
* **요청 제한**(Volcengine 계정 수준): status query는 100 QPS, ingest 및 기타 작업은 약 10 QPS입니다. 동시 실행 수를 제어하고 실패 시 재시도하십시오.
* **웹 UI 상태 동기화**: API로 ingest한 뒤 status를 한 번도 조회하지 않았다면 웹 아카이브에 "processing"으로 표시될 수 있습니다. asset 목록 페이지를 열고 "Refresh List"를 클릭하여 실제 상태를 동기화하십시오.

Volcengine 공식 참고 자료(브라우저에 복사하여 열기): 비공개 asset 라이브러리 가이드 `volcengine.com/docs/82379/2333565`, 실명 자산 온보딩 `volcengine.com/docs/82379/2315856`.

## FAQ

<AccordionGroup>
  <Accordion title="에셋 라이브러리는 참조 이미지를 직접 전달하는 방식과 어떻게 다릅니까?">
    직접 전달하는 참조 이미지에는 사실적인 사람의 얼굴을 포함할 수 없습니다(안티 딥페이크 필터가 이를 거부합니다). 초상 이미지를 신뢰할 수 있는 에셋으로 등록하면 해당 `asset://` ID를 여러 생성 작업에서 재사용할 수 있으며, 에피소드와 장면 전반에서 캐릭터의 얼굴과 의상을 일관되게 유지할 수 있습니다. 따라서 애니메이션 드라마, 숏 드라마, IP 캐릭터와 같은 연재형 콘텐츠에 적합합니다. 실제 사람도 카메라에 등장할 수 있습니다. 위에 설명된 실제 인물 인증 절차만 완료하면 됩니다.
  </Accordion>

  <Accordion title="에셋 라이브러리를 사용하는 데 추가 비용이 듭니까? 직접 공식적으로 활성화하는 것과 어떻게 다릅니까?">
    APIYI에서는 **무료**입니다. Seedance 2.0 API와 함께 사용하기만 하면 됩니다. 연회비도, 별도 계약도 필요하지 않습니다.

    공식적으로는 **프레임워크 계약이 없는 고객에게 프라이빗 에셋 라이브러리 비용이 별도로 부과됩니다**. 연간 구매 비용은 수십만 위안 규모이며, Volcengine에서도 직접 판매합니다. 즉, 직접 활성화하려면 모델 사용료 외에 연회비가 발생하며, 일반적으로 기업 자격 심사와 조달 절차도 함께 필요합니다. APIYI를 이용하면 Seedance 동영상 token 하나만 있으면 됩니다. 에셋 라이브러리가 즉시 사용할 수 있는 상태로 제공됩니다.

    장기 사용자를 중요하게 생각하므로 이 비용은 이미 API 요금에 포함되어 있습니다. SD2 API를 일반적인 비즈니스 규모로 사용하는 고객에게는 추가 요금이 없습니다.
  </Accordion>

  <Accordion title="에셋 라이브러리는 계정을 따릅니까, 아니면 KEY를 따릅니까? 에셋 격리는 어떻게 구현됩니까?">
    한 줄로 요약하면 다음과 같습니다. **icover.ai가 에셋을 격리하고, APIYI가 통합 호출을 처리합니다. 생성 측에서는 에셋 ID만 확인하므로 ID를 보유하고 있으면 이를 참조할 수 있습니다.**

    에셋 라이브러리는 **계정**을 따릅니다. 기본 아키텍처는 다음과 같습니다. 모든 icover.ai 사용자는 하나의 통합된 APIYI Volcengine 계정을 공유하며, 에셋 라이브러리는 해당 계정에 속합니다. icover.ai는 서비스 수준에서 **계정별 격리** 계층을 추가합니다. 각 계정은 자신의 에셋만 나열, 조회, 삭제할 수 있으며 다른 사용자의 에셋 ID는 볼 수 없습니다.

    KEY는 격리를 제공하지 않습니다. 동일한 계정 아래에 있는 여러 Asset Library KEY는 서로 동일하며 같은 라이브러리에 액세스합니다. 에셋 격리가 필요하다면(예: 고객 또는 사업 부문별로 데이터를 분리해야 하는 경우), **각 대상별로 별도의 icover.ai 계정을 등록**하고 각 계정 아래에 KEY를 생성해야 합니다. 동일한 계정에서 새 KEY를 생성해도 아무것도 격리되지 않습니다.

    보안 경계를 유의해야 합니다. 이 격리는 나열, 조회, 삭제에 적용되지만 Volcengine은 ID를 기준으로 권한을 부여할 수 없습니다. 따라서 `asset://` ID가 유출되면 동일한 채널의 다른 호출자도 생성 요청에서 이를 참조할 수 있습니다. 에셋 ID를 비밀 정보로 취급하십시오.
  </Accordion>

  <Accordion title="에셋은 APIYI / icover.ai의 자체 서버에 저장됩니까?">
    파일을 전달하는 방식에 따라 다릅니다.

    * **공개 URL**(자체 CDN / 이미지 호스트)을 제공하는 경우: 원본 파일은 **당사를 거치지 않습니다**. 해당 URL만 Volcengine으로 전달합니다.
    * **`/api/storage/presign`를 통해 업로드하는 경우**: 공개 URL을 얻기 위해 파일이 먼저 당사의 오브젝트 스토리지(`cdn.icover.ai`)에 저장된 후 Volcengine으로 전달됩니다. **해당 원본 파일은 당사의 스토리지에 남아 있습니다.**

    어느 방식이든 에셋 자체는 최종적으로 Volcengine 측에서 처리되며, Volcengine은 `asset://` ID를 반환합니다. **당사의 데이터베이스에는 해당 ID와 계정 소유권만 저장됩니다**(위에서 설명한 계정별 격리에 사용됨). 에셋 콘텐츠 자체는 기록하지 않습니다.

    실제 얼굴 에셋에는 추가적인 필수 조건이 있습니다. 촬영 대상자는 반드시 **대면 실시간 얼굴 인증**을 완료해야 합니다(자신의 Volcengine 계정에 로그인하여 얼굴 인식을 수행). 이를 통해 원본 단계에서 초상권 소유를 확인하며, 다른 사람이 대신 인증을 완료할 수 없습니다. 전체 절차는 위의 “실제 얼굴 에셋”을 참조하십시오.
  </Accordion>

  <Accordion title="회사 내 여러 부서 또는 팀이 에셋 라이브러리를 공유하거나 격리하려면 어떻게 해야 합니까?">
    **하나의 라이브러리 공유(권장, 가장 간단한 방식)**: 계정 하나와 KEY 하나면 충분합니다. 자체 시스템에서 에셋 ID를 중앙에서 관리하고 각 부서에 `asset://` ID를 배포하십시오. 동영상 생성 요청에서 이를 참조하려면 ID를 보유하고 있기만 하면 됩니다(동영상 생성에는 각 부서의 자체 APIYI Seedance 동영상 token이 사용되며, Asset Library KEY와는 관련이 없습니다). 동일한 계정 아래에 여러 KEY를 생성하여 서로 다른 부서에 전달할 수도 있습니다(자격 증명 교체 또는 폐기에 편리함). 이러한 KEY도 동일한 라이브러리에 액세스합니다.

    **부서 간 격리**: 각 부서별로 별도의 icover.ai 계정을 등록하고, 각 계정에 고유한 KEY를 생성하십시오. 격리는 나열, 조회, 삭제에 적용된다는 점에 유의하십시오. 유출된 에셋 ID는 여전히 참조할 수 있으므로 부서 간에도 ID를 무분별하게 공유하지 마십시오.
  </Accordion>

  <Accordion title="이것은 모든 기능을 제공하는 SeeDance 2.0입니까?">
    그렇습니다. APIYI의 Seedance 채널은 공식 전체 기능 버전인 `doubao-seedance-2-5-260628` 및 `doubao-seedance-2-0-260128`을 실행합니다. 모델 매개변수, 해상도, 길이는 공식 제공 버전과 동일하며, 축소된 기능이 없습니다. 모델 세부 정보와 요금은 [Seedance 2.0 / 2.5 개요](/ko/api-capabilities/seedance2/overview)를 참조하십시오.
  </Accordion>

  <Accordion title="AI로 생성한 사실적인 초상은 실제 사람으로 간주됩니까? 업로드하면 승인을 의미합니까?">
    아니요. 실제 사람으로 간주되지 않습니다. 현실 세계에 대응하는 실제 인물이 없는 AI 생성 사실적 초상(예: Nano Banana와 같은 모델로 생성한 캐릭터)은 **가상 아바타**이며, 승인 절차 없이 가상 아바타 등록 절차를 바로 진행하면 됩니다. 실제로 존재하는 **실제 사람**의 사진만 실제 얼굴로 간주됩니다. 이러한 사진은 업로드만으로 승인을 의미하지 않습니다. 가상 아바타 등록 채널에서 거부되며, 촬영 대상자가 실시간 인증을 완료해야 합니다(위의 실제 얼굴 섹션 참조).

    캐릭터 자료는 다음 세 가지로 구분됩니다.

    | 자료 유형                | 예시                                  | 사용 방법                                                                       |
    | -------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
    | 애니메이션 / 스타일화된 캐릭터    | 애니메이션, 만화, 3D 만화 캐릭터                | 사실적인 얼굴이 없으므로 일반적으로 차단되지 않습니다. 공개 URL / Base64 참조 이미지를 직접 사용하며 등록할 필요가 없습니다 |
    | 가상 아바타(AI 생성 사실적 초상) | 모델로 생성되었으며 실제 인물이 존재하지 않음(아래 예시 참조) | 이 페이지의 가상 아바타 등록 기능을 사용하고 `asset://` ID를 참조하십시오                             |
    | 실제 얼굴                | 유명인, 모델 또는 사용자 본인의 사진               | 완전 자동화된 실제 인물 인증 API 절차를 사용합니다. 촬영 대상자가 실시간 인증을 완료하면 사용할 수 있습니다             |

    <Frame caption="Virtual-avatar example: an AI-generated photorealistic portrait with no real-world counterpart. Put the frontal face close-up plus full-body front / side / back views into one asset group for the best character consistency">
      <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-virtual-avatar-example.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=64f656c3a49a8c678bf439d2d9b66552" alt="가상 아바타 예시: 전통 의상을 입은 동일한 AI 생성 여성의 얼굴 클로즈업 및 전신 정면, 측면, 후면 모습" width="1600" height="900" data-path="images/seedance2-virtual-avatar-example.jpg" />
    </Frame>
  </Accordion>

  <Accordion title="실사와 같은 디지털 휴먼(가상 아바타)은 검토가 필요합니까?">
    아니요. 가상 아바타 등록은 완전 자동으로 처리됩니다. 수동 검토나 승인 절차가 없습니다. 업로드 후 시스템이 이미지를 자동으로 전처리하며, 약 13초 후 상태가 Active로 변경되고 `asset://` ID를 즉시 동영상 생성에 사용할 수 있습니다. **실제 얼굴** 에셋만 촬영 대상자의 실시간 인증이 필요합니다(위의 실제 얼굴 섹션 참조).
  </Accordion>

  <Accordion title="다른 제공업체에서 이미 등록 또는 인증한 에셋을 이전할 수 있습니까?">
    직접 재사용할 수 없습니다. Volcengine 에셋 라이브러리와 실제 인물 인증은 모두 **기본 계정에 연결**되어 있습니다. 다른 제공업체를 통해 얻은 `asset://` ID는 해당 제공업체의 Volcengine 계정에 속하므로 APIYI 채널을 통해 이를 참조하면 `asset not found`가 반환됩니다. 에셋을 이 서비스에 다시 등록해야 합니다.

    * **가상 아바타 에셋**: 프로그래밍 방식으로 일괄 이전할 수 있습니다. 이 페이지의 API를 통해 원본 이미지를 다시 업로드하는 스크립트를 작성한 다음, 시스템에서 기존 ID를 새 `asset://` ID로 업데이트하십시오. 자체 시스템에 에셋 ID 매핑 계층을 유지하는 것을 권장합니다. 비즈니스 데이터에는 내부 ID만 저장하므로, 이후 제공업체를 변경하더라도 매핑만 업데이트하면 됩니다.
    * **실제 인물 인증 에셋**: 실제 인물 인증도 계정에 연결되어 있으며 **이전할 수 없고 재인증이 필요합니다**. 촬영 대상자가 다시 실시간 인증을 완료해야 합니다(위의 실제 얼굴 섹션 참조).
    * **소비자 대상 제품에 대한 조언**: 기존 에셋이 많이 있는 경우 백엔드 작업을 통해 가상 에셋을 사용자에게 알리지 않고 이전하십시오. 사용자는 이를 알아차리지 못합니다. 실제 인물 인증 에셋의 경우 시스템 업그레이드나 새 버전 출시 시점에 사용자에게 재인증을 요청하는 방식이 훨씬 자연스럽습니다.
  </Accordion>
</AccordionGroup>

## 문의하기

연동 중 문제가 발생하면(ingest 실패, 실인증, 배치 연동, 운영 token 신청 등) 언제든지 문의해 주십시오. 연락처는 [api.apiyi.com](https://api.apiyi.com) 홈페이지에 있습니다.
