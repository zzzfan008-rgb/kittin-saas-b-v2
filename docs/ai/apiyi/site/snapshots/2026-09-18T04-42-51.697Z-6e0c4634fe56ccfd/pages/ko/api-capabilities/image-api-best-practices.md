> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 API 필수 사항 및 모범 사례

> 모든 APIYI 이미지 API는 동기식입니다. 즉, 비동기 작업 ID가 없으며, 연결이 끊기면 요청은 여전히 과금되지만 결과는 사라집니다. 모델별 타임아웃 권장 사항과 base64/URL 출력 참조 표가 포함되어 있습니다.

<Info>
  **한 줄 답변**: APIYI의 모든 이미지 모델은 **동기식**입니다 — 요청을 보내고 연결을 열린 상태로 유지하면 생성된 이미지가 같은 응답으로 돌아옵니다. 비동기 작업 ID나 폴링 엔드포인트는 없으며, 클라이언트가 일찍 연결을 끊으면 그 결과는 사라지지만 요청은 여전히 과금됩니다. **넉넉한 타임아웃은 이미지 API 개발의 첫 번째 원칙입니다.**
</Info>

## 시작하기 전에 알아둘 세 가지 사실

<CardGroup cols={3}>
  <Card title="동기식입니다" icon="arrow-right-left">
    단일 HTTP 요청은 완료될 때까지 차단되며, 공식 상위 API 형식과 일치합니다. 즉, 제출 후 폴링하는 방식은 없습니다. FLUX처럼 상위에서는 비동기인 제공자라도 게이트웨이에서 동기식 호출로 감싸므로, 폴링 루프를 작성할 일이 없습니다.
  </Card>

  <Card title="작업 ID 없음" icon="search-x">
    `task_id` 조회 엔드포인트는 없으며, `request_id`를 사용해 나중에 이미지를 복구할 수 없습니다. APIYI는 요청을 투명하게 프록시할 뿐 생성 결과를 저장하지 않으므로, 연결이 끊기면 결과를 복구할 수 없습니다.
  </Card>

  <Card title="연결이 끊겨도 과금됩니다" icon="unplug">
    클라이언트가 시간 초과로 연결을 끊어도 서버와 상위 제공자는 생성을 끝까지 완료하며, 요청은 **평소대로 과금됩니다**. 시간 초과를 너무 짧게 설정하면 받지도 못한 이미지를 비용을 지불하게 됩니다.
  </Card>
</CardGroup>

## 모델 시리즈 빠른 참조

각 이미지 모델 시리즈에 권장되는 타임아웃, 출력 형식 및 URL 지원:

| 모델 시리즈                                                                                    | 엔드포인트                                        | 권장 타임아웃                                                                                               | 출력 형식                                                                                   | URL 출력 및 유효 기간                                                               |
| ----------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [GPT-Image-2.5 / 2 (공식: flare / sunburst / 2)](/ko/api-capabilities/gpt-image-2/overview) | `/v1/images/generations`, `/v1/images/edits` | **360s** (gpt-image-2 high + 2K/4K는 3\~5분으로 측정되었으며, 2.5는 더 빠르지만 `xhigh` / `max`를 고려해 여유 시간을 유지해야 합니다) | Raw b64\_json (**`data:` 접두사 없음**)                                                      | ❌ 지원되지 않음 (`response_format`은 400을 반환하며, `image2_OSS` 그룹은 아직 공식 채널을 지원하지 않음) |
| [GPT-Image-2-All (리버스)](/ko/api-capabilities/gpt-image-2-all/overview)                    | 위와 동일                                        | **300s**                                                                                              | 기본 `b64_json` (**`data:` 접두사 없음**, 2026-07 확인); 명시적인 `response_format: "url"`을 통해 전환 가능 | ✅ 명시적 `url`: R2 CDN, 약 24시간; URL에 의존하는 경우 `image2_OSS` 그룹을 사용해야 함            |
| [GPT-Image-2-VIP](/ko/api-capabilities/gpt-image-2-vip/overview)                          | 위와 동일                                        | **300s**                                                                                              | All과 동일 (기본 `b64_json`, 접두사 없음, 2026-07 확인)                                             | ✅ All과 동일 (명시적 `url` 또는 `image2_OSS` 그룹)                                     |
| [Nano Banana Pro](/ko/api-capabilities/nano-banana-image/overview)                        | 기본 Gemini `:generateContent`                 | 1K/2K **300s**, 4K **600s**, 다중 이미지 5분 이상                                                             | `inlineData.data`의 Raw base64                                                           | `NB_OSS` 베타 그룹(아래 참조)                                                        |
| [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview)                        | 위와 동일                                        | **360s**                                                                                              | 위와 동일                                                                                   | `NB_OSS` 지원 범위: 지원팀에 문의                                                      |
| [Nano Banana Lite](/ko/api-capabilities/nano-banana-lite-image/overview)                  | 위와 동일                                        | **300s** (일반적으로 약 4초, 피크 혼잡에 대비한 여유 시간)                                                               | 위와 동일                                                                                   | `NB_OSS` 지원 범위: 지원팀에 문의                                                      |
| [FLUX](/ko/api-capabilities/flux/overview)                                                | `/v1/images/generations`                     | **60\~120s**, flex 모델은 180s                                                                           | `data[0].url`만 지원 (**URL은 업스트림 기본값**)                                                   | ⚠️ 약 **10분** 동안만 유효하며 CORS가 지원되지 않음 — 즉시 서버 측에서 다시 호스팅해야 함                   |
| [Seedream](/ko/api-capabilities/seedream-image/overview)                                  | `/v1/images/generations` (통합 생성/편집 엔드포인트)    | **60s** (4K + hd는 약 30\~60초)                                                                          | 기본 `url` (**URL은 업스트림 기본값**); 선택 사항인 `b64_json` (Raw base64, 접두사 없음)                    | ✅ BytePlus TOS, 약 24시간                                                       |

<Tip>
  `response_format`은 **지원 범위가 좁습니다**. GPT-Image-2-All / VIP와 Seedream만 이를 허용하며, 공식 GPT-Image-2 채널에 전달하면 400 `unknown_parameter`을 반환합니다. 지원되는 경우 기본값에 의존하지 말고 **항상 명시적으로 전달해야 합니다**. 기본값은 그룹과 부하 조건에 따라 과거에도 달라진 사례가 있습니다.
</Tip>

## 과금과 가격을 좌우하는 요인

초보자들이 가장 흔히 묻는 과금 질문은 다음과 같습니다: 「참조 이미지마다 정액 요금인가요, 아니면 더 큰 이미지일수록 더 많은 tokens를 소모하나요?」 세 가지 직관부터 보겠습니다:

<CardGroup cols={3}>
  <Card title="비용은 출력이 좌우합니다" icon="trending-up">
    gpt-image-2를 예로 들면 텍스트 입력 \$5/M, 이미지 입력 \$8/M, **출력 \$30/M**입니다. 가장 큰 가격 레버는 항상 **출력 크기와 품질**(품질 × 크기)이며, 참조 이미지 수는 그다음입니다.
  </Card>

  <Card title="입력 이미지는 정액제가 아닙니다" icon="scaling">
    GPT 계열 입력 이미지는 **크기/가로세로 비율**에 따라 tokens로 매핑됩니다(클수록 더 많으며 하한과 상한이 모두 있음). 그리고 **개수는 엄격히 선형으로 합산**됩니다. Gemini 계열은 그 반대입니다. 출력 이미지는 해상도 단계마다 고정된 token 수만큼 비용이 듭니다.
  </Card>

  <Card title="반환된 usage를 신뢰하십시오" icon="receipt">
    입력 tokens와 출력 tokens는 모두 응답에 포함됩니다: GPT 계열은 `usage.input_tokens_details.image_tokens`에, Gemini 계열은 `usageMetadata.promptTokensDetails`에 있습니다. 반드시 이를 기준으로 대조하고 가격을 산정하십시오 — 이미지 수로 추정해서는 안 됩니다.
  </Card>
</CardGroup>

### 두 모델 계열의 token 계산

| 계열                                         | 입력 이미지 Tokens                                                                                                                      | 출력 이미지 Tokens                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **GPT family** (gpt-image-2 etc.)          | 크기/가로세로 비율에 따라 동적으로 결정됩니다: 1024² 이하의 정사각형 이미지는 모두 1024 tokens이며, 2048² 이상은 1521에서 상한이 있습니다(2026-07 검증됨); **N images = N × single** | `size` × `quality`에 따라 결정됩니다: 1024²는 낮을 때 196 tokens부터 높을 때는 수천 tokens까지 범위가 있습니다 |
| **Gemini family** (all Nano Banana models) | `promptTokensDetails`의 IMAGE 모달리티에 따라 계산됩니다                                                                                        | **해상도 단계별 고정**: 가로세로 비율과 무관하게 1K/2K는 이미지당 1120, 4K는 2000                          |

### 여러 입력 이미지에 대한 비용 직관

* 참조 이미지 1장은 대략 **800-1600 image tokens ≈ \$0.008-0.012**입니다(gpt-image-2, 측정값이며 크기/가로세로 비율에 따라 달라짐);
* 개수는 선형으로 합산됩니다: **16 images ≈ \$0.13**은 `high` 출력 1개(≈\$0.21)와 비슷한 규모입니다. 다중 이미지 융합에서는 입력 비용도 더 이상 무시할 수 없습니다;
* **tokens는 파일 크기가 아니라 픽셀 크기로 결정됩니다**: 파일을 압축하면 업로드 안정성에는 도움이 되지만 tokens는 절약되지 않습니다. tokens를 줄이려면 이미지 수를 줄이십시오(너무 큰 이미지는 상한이 있으므로 과도한 과금도 발생하지 않습니다).

전체 측정 표: [gpt-image-2 — 여러 입력 이미지가 가격에 미치는 영향](/ko/api-capabilities/gpt-image-2/overview#how-multiple-input-images-affect-the-price-verified-july-2026); Gemini 계열 token 계산: [usageMetadata 가이드](/ko/api-capabilities/nano-banana-usage-metadata)와 [Nano Banana 요금](/ko/api-capabilities/nano-banana-pricing).

## 시간 초과 구성

### 기본 시간 초과로 인해 문제가 발생하는 이유

대부분의 HTTP 클라이언트는 기본적으로 30\~60초의 시간 초과를 설정합니다(`requests` 자체에는 제한이 없지만, 대개 약 30초의 제한을 추가하는 프레임워크로 래핑됩니다). 반면 이미지 생성은 실제로 매우 오래 걸리는 요청입니다.

* 2K/4K 해상도에서 `high` 품질의 GPT-Image-2는 처음부터 끝까지 **3\~5분**이 소요됩니다.
* Nano Banana 시리즈의 4K 이미지는 약 50초부터 시작하며, 피크 시간대에는 더 오래 걸립니다.
* 여러 이미지의 융합 및 이미지 편집 요청은 일반적으로 텍스트-이미지 변환보다 느립니다.

기본 설정을 사용하면 서버가 정상적으로 생성 중인 동안 클라이언트가 연결을 종료합니다. 그 결과 실제로는 **사용자가 직접 연결을 끊은 성공한 요청**인 "시간 초과"가 연달아 발생하며, 이러한 요청은 모두 과금됩니다.

### 모델별 시간 초과 단계

```python theme={null}
# Set client timeouts (seconds) per model, not one global value
IMAGE_TIMEOUTS = {
    "gpt-image-2": 360,                      # high + 2K/4K measured at 3-5 min
    "gpt-image-2.5-flare": 360,              # 2.5 shares price and parameters; reuse the timeout
    "gpt-image-2.5-sunburst": 360,
    "gpt-image-2-all": 300,
    "gpt-image-2-vip": 300,
    "gemini-3-pro-image": 600,               # Nano Banana Pro, 600s covers 4K
    "gemini-3.1-flash-image-preview": 360,   # Nano Banana 2
    "gemini-3.1-flash-lite-image": 300,      # Nano Banana Lite
    "flux": 120,                             # 180 recommended for flex models
    "seedream": 60,                          # 4K + hd around 30-60s
}

import requests

def generate_image(model: str, payload: dict, api_key: str) -> dict:
    resp = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, **payload},
        timeout=IMAGE_TIMEOUTS.get(model, 300),  # 300s fallback for unknown models
    )
    resp.raise_for_status()
    return resp.json()
```

### 재시도 전략

모든 오류가 재시도할 가치가 있는 것은 아닙니다. 먼저 각 사례가 어떻게 과금되는지 확인해야 합니다.

| 오류                          | 과금 여부                       | 권장 사항                                         |
| --------------------------- | --------------------------- | --------------------------------------------- |
| 429 / 503 (요청 제한, 업스트림 과부하) | 과금되지 않음                     | 지수 백오프(예: 5초, 15초, 45초)를 사용하여 재시도합니다          |
| 클라이언트 시간 초과 / 조기 연결 해제      | **과금됨**                     | 먼저 시간 초과를 늘립니다. 재시도해야 한다면 시도 횟수를 신중하게 제한합니다   |
| 400 / 403 (매개변수 또는 권한 오류)   | 과금되지 않음                     | 다시 전송하기 전에 요청을 수정합니다. 무작정 재시도하는 것은 의미가 없습니다   |
| 콘텐츠 조정 차단                   | **모델에 따라 다름** (아래 참고 사항 참조) | prompt를 수정합니다. 그대로 다시 보내면 다시 차단될 가능성이 매우 높습니다 |

<Info>
  **조정 차단 과금은 모델에 따라 다릅니다**: token 과금 모델(공식 GPT-Image-2 등)은 조정이 트리거되면 일반적으로 400 오류를 반환하며 **과금되지 않습니다**. **이미지당 과금되는 Nano Banana Pro**만 "HTTP 200이지만 생성에 실패함"이라는 Google 측 차단이 발생하며, 이 호출은 **과금됩니다**. APIYI는 [생성 실패 크레딧 환급 플랜](/ko/api-capabilities/nano-banana-pro-guarantee)을 통해 이러한 사용자 과실이 아닌 실패를 보상하며, 이미지별 집계에 따라 크레딧을 환급합니다.
</Info>

## base64 출력 다루기

### 접두사 차이

base64 페이로드는 시리즈마다 **일관되지 않습니다** — 이는 새로운 통합에서 가장 흔한 함정입니다:

| 모델 시리즈                  | base64 필드                                       | `data:image/...;base64,` 접두사 포함 여부?            |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------- |
| GPT-Image-2 (공식)        | `data[0].b64_json`                              | 접두사 없음(원시 base64)                              |
| GPT-Image-2-All / VIP   | `data[0].b64_json`                              | 접두사 없음(2026-07에 검증됨; **이전 버전에는 접두사가 포함되었습니다**) |
| Nano Banana 시리즈         | `candidates[0].content.parts[].inlineData.data` | 접두사 없음(원시 base64)                              |
| Seedream(`b64_json` 모드) | `data[0].b64_json`                              | 접두사 없음(원시 base64)                              |

접두사 동작은 채널 버전마다 변경되었으므로, **항상 먼저 `startsWith("data:")`를 확인하십시오**: 존재하는 경우 디코딩 전에 접두사를 제거하고(또는 값을 직접 `img src`로 사용하고), 원시 값은 있는 그대로 디코딩하십시오. 이렇게 하면 이중 접두사 버그와 접두사가 있는 페이로드의 디코딩 실패를 모두 피할 수 있습니다.

### 파일로 디코딩하기

```python theme={null}
import base64

b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):          # defensive strip: some channel versions included a data: prefix
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

```javascript theme={null}
let b64 = response.data[0].b64_json;
if (b64.startsWith("data:")) {
  b64 = b64.slice(b64.indexOf(",") + 1);
}
require("fs").writeFileSync("output.png", Buffer.from(b64, "base64"));
```

### Playground 렌더링 제한

base64 응답은 종종 수 메가바이트에 달하며, 브라우저 Playground에는 `unable to complete request`가 표시될 수 있습니다 — 이는 **요청 실패를 의미하지 않습니다**. 요청은 성공했고 과금되었으며, 브라우저가 그만큼 긴 문자열을 렌더링할 수 없을 뿐입니다. 코드에서 결과를 확인하거나, `url`를 반환하는 모델/파라미터로 전환하십시오.

## 입력 이미지 전처리

Image-edit / reference-image 엔드포인트(예: gpt-image-2의 `/v1/images/edits`)는 **png / jpg / webp**만 허용합니다. 사용자가 직접 사진을 업로드할 수 있는 제품에서는 특히 교묘한 함정이 하나 있는데, **휴대폰 카메라에서 바로 나온 사진이 종종 표준 JPEG가 아니라는 점**입니다.

### 일반적인 증상: 400 invalid\_image\_file

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "code": "invalid_image_file"
  }
}
```

일반적인 원인은 **MPO 형식**(Multi-Picture Object, 다중 프레임 JPEG 컨테이너)입니다: `.jpg` Huawei Mate 시리즈와 유사한 휴대폰에서 바로 나온 파일은 HDR gain-map 서브프레임을 포함하고 실제로는 MPO입니다. 이것이 교묘한 이유는 파일이 같은 `FFD8` 헤더로 시작하기 때문인데, **확장자, HTTP Content-Type, 그리고 `file` 명령 모두 JPEG라고 보고**하며, 프레임을 인식하는 파싱에서만 진실이 드러납니다:

```python theme={null}
from PIL import Image
Image.open("photo.jpg").format   # "MPO" means you're hit; standard images return "JPEG"/"PNG"
```

2026년 7월 검증 완료(gpt-image-2 edits 엔드포인트): MPO 이미지는 항상 거부되지만, 같은 이미지를 표준 JPEG/PNG로 다시 인코딩하면 **원본 전체 해상도(3072×4096)로** 성공합니다. 즉 문제는 크기가 아니라 형식입니다. 이 400은 입력 검증 단계에서 빠르게 반환되며 **과금되지 않습니다**.

### 권장 사항: 서버 측에서 일관되게 재인코딩하기

사진을 하나씩 디버깅하는 대신 업로드 파이프라인에 재인코딩 단계를 하나 추가하십시오. 이렇게 하면 HEIC, CMYK 및 기타 비표준 입력도 함께 흡수할 수 있습니다.

```python theme={null}
from PIL import Image
import io

def normalize_image(raw: bytes) -> bytes:
    """Any source image → standard JPEG that passes image-edit format validation"""
    im = Image.open(io.BytesIO(raw))
    im.load()                      # multi-frame formats (MPO etc.): keep the first frame only
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")     # normalize CMYK / P and other modes to RGB
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)
    return out.getvalue()
```

재인코딩하는 동안 페이로드도 줄이십시오(긴 변 최대 4096, JPEG 품질 80-92). 또한 각 이미지를 1.5MB 이하로 유지하십시오. 업로드 성공률과 생성 속도 모두 향상되며, 출력 품질은 입력 파일 크기에 의존하지 않습니다. [gpt-image-2 이미지 편집: 참조 이미지 형식 요구사항 및 전처리](/ko/api-capabilities/gpt-image-2/image-edit#reference-image-format-requirements-and-preprocessing)를 참고하십시오.

## 입력 이미지 형식 전처리

이미지 편집 / 참조 이미지 엔드포인트(예: gpt-image-2의 `/v1/images/edits`)는 입력으로 **png / jpg / webp**만 허용합니다. 사용자 촬영 사진을 받는 제품은 특히 교묘한 함정에 걸리기 쉬운데: **휴대폰 카메라에서 바로 나온 사진은 표준 JPEG가 아닌 경우가 많습니다**.

### 일반적인 증상: 400 invalid\_image\_file

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "code": "invalid_image_file"
  }
}
```

일반적인 원인은 **MPO 형식**(Multi-Picture Object, 멀티 프레임 JPEG 컨테이너)입니다: `.jpg` Huawei Mate 시리즈 휴대폰에서 바로 나온 파일은 HDR gain-map 서브프레임을 포함하고 있어 실제로는 MPO입니다. 이 파일들이 교묘한 이유는 헤더가 동일한 `FFD8`라는 점입니다 — **확장자, HTTP Content-Type, 그리고 `file` 명령 모두 JPEG라고 보고합니다** — 그리고 프레임을 인식하는 파싱만 이를 구분할 수 있습니다:

```python theme={null}
from PIL import Image
Image.open("photo.jpg").format   # "MPO" means you're affected; standard files return "JPEG"/"PNG"
```

2026년 7월 확인(gpt-image-2 edit endpoint): MPO 파일은 항상 거부됩니다; 같은 이미지를 표준 JPEG/PNG로 다시 인코딩하면 \*\*원본 전체 해상도(3072×4096)\*\*에서 성공합니다 — 문제는 크기가 아니라 형식입니다. 이 400은 입력 검증 단계에서 빠르게 반환되며 **과금되지 않습니다**.

### 권장 사항: 서버 측에서 일괄 재인코딩

이미지를 하나씩 디버깅하기보다 업로드 파이프라인에 단일 재인코딩 단계를 추가하십시오 — HEIC, CMYK 및 기타 비표준 입력도 함께 처리할 수 있습니다:

```python theme={null}
from PIL import Image
import io

def normalize_image(raw: bytes) -> bytes:
    """Any input image → standard JPEG that passes image-edit endpoint validation"""
    im = Image.open(io.BytesIO(raw))
    im.load()                      # multi-frame formats (MPO etc.): keep only the first frame
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")     # normalize CMYK / P etc. to RGB
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)
    return out.getvalue()
```

재인코딩하는 동안 압축도 함께 수행하고(긴 변은 4096px 이하, JPEG 품질 80-92) 각 이미지를 1.5MB 이내로 유지하십시오 — 업로드 성공률과 생성 속도 모두 향상되며, 출력 품질은 입력 파일 크기와 무관합니다. [gpt-image-2 Image Edit — 참조 이미지 형식 요구 사항 및 전처리](/ko/api-capabilities/gpt-image-2/image-edit#reference-image-format-requirements-and-preprocessing)를 참조하십시오.

## URL 출력 대신 받기

신뢰도 순으로 세 가지 경로가 있습니다:

1. **URL이 상위 서비스의 기본값인 경우** — FLUX(유효 시간은 약 10분이며 CORS 헤더가 없습니다. 서버 측에서 즉시 다운로드하고 다시 호스팅해야 합니다)와 Seedream(BytePlus TOS, 약 24시간)은 별도 설정 없이 URL을 기본으로 반환합니다.
2. **OSS 그룹(결정적 URL 출력 — 운영 환경 권장)**:
   * `image2_OSS` 그룹: **GPT-Image-2-All / VIP**를 포함합니다(1배 요율 배수, 추가 요금 없음). 안정적인 URL 출력을 위해 token을 이 그룹으로 전환하면 base64 대체 없이 사용할 수 있습니다. **공식 GPT-Image-2 채널은 아직 포함되지 않습니다.**
   * `NB_OSS` 베타 그룹: Nano Banana 시리즈를 포함하며, 이미지 URL은 `text` 필드로 전달됩니다 — [NB-OSS 그룹 가이드](/ko/api-capabilities/nano-banana-oss-group)를 보십시오.
3. **명시적 `response_format: "url"`** — GPT-Image-2-All / VIP(R2 CDN, 약 24시간)와 Seedream만 이를 허용합니다. 적용 범위가 **좁으며**, 공식 GPT-Image-2 채널은 이를 전달하면 400을 반환합니다. 이는 기본 그룹에 대한 요청별 전환입니다. URL에 의존하는 비즈니스는 대신 OSS 그룹을 사용해야 합니다.

**GPT-Image-2(공식)은 현재 URL 출력 경로가 전혀 없습니다** — base64만 지원합니다.

<Warning>
  이 플랫폼들이 반환하는 모든 이미지 URL은 **임시 링크**입니다(10분에서 24시간). 장기 보관이 필요한 모든 것 — 제품 이미지, 사용자 생성물, 기록 — 은 생성 직후 **자신의 오브젝트 스토리지 / CDN으로 즉시 다시 호스팅**해야 하며, 자체 URL을 데이터베이스에 저장해야 합니다.
</Warning>

## 시간 초과와 연결 끊김 문제 해결

SDK 타임아웃을 이미 늘렸는데도 여전히 “타임아웃”이 자주 발생한다면, 다음 체크리스트를 따라가십시오:

<Steps>
  <Step title="유효한 클라이언트 측 타임아웃을 확인하십시오">
    프레임워크는 종종 HTTP 클라이언트를 또 다른 타임아웃 계층으로 감쌉니다(작업 큐 워커 제한, 서버리스 실행 상한 등). 모델의 생성 시간보다 짧은 어떤 계층이라도 요청을 종료시킵니다.
  </Step>

  <Step title="중간 경로를 확인하십시오: nginx / 로드 밸런서 / CDN">
    자체 호스팅 리버스 프록시(`proxy_read_timeout`), 클라우드 로드 밸런서의 유휴 타임아웃, CDN 원본 타임아웃은 **대개 기본값이 60초**이며, 클라이언트보다 먼저 연결을 끊습니다. 긴 요청 경로의 모든 홉은 더 크게 설정해야 합니다.
  </Step>

  <Step title="유휴 연결이 회수되지 않도록 keep-alive를 활성화하십시오">
    오랫동안 바이트가 오가지 않는 연결은 NAT 장치나 방화벽에 의해 조용히 끊길 수 있습니다. TCP 또는 HTTP keep-alive는 그 가능성을 크게 줄여줍니다.
  </Step>

  <Step title="요청 ID와 콘솔 로그로 과금을 확인하십시오">
    `x-request-id` 응답 헤더를 기록한 뒤 APIYI 콘솔 호출 로그에서 조회하십시오. 호출이 거기에 보인다면 서버는 생성을 완료하고 요청에 대해 과금을 처리한 것입니다. 연결은 경로의 사용자 쪽에서 끊어진 것입니다.
  </Step>
</Steps>

## 태스크 스타일 비동기 관리를 원하십니까?

플랫폼은 비동기 API를 제공하지 않지만, 동기 엔드포인트 위에 직접 비동기 셸을 구축할 수 있습니다:

<CardGroup cols={3}>
  <Card title="왜 비동기 API가 없는가" icon="circle-question-mark" href="/ko/faq/image-async-api">
    FAQ: 비동기 이미지 API가 있습니까? task ID로 결과를 조회할 수 있습니까?
  </Card>

  <Card title="직접 비동기 큐를 구축하십시오" icon="list-checks" href="/ko/api-capabilities/image-async-queue">
    엔지니어링 가이드: 자체 task\_id, 영속성, 재시도와 함께 동기 호출을 태스크 큐로 감싸십시오
  </Card>

  <Card title="NB-OSS URL 출력 그룹" icon="cloud-upload" href="/ko/api-capabilities/nano-banana-oss-group">
    Nano Banana 출력을 URL로 전환하여 base64 전송 오버헤드를 줄이십시오
  </Card>
</CardGroup>
