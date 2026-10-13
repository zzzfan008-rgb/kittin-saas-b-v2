> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MAI-Image 2.6 이미지 생성 및 편집

> Microsoft MAI-Image 2.6(MAI-Image-2.6 / MAI-Image-2.6-Flash) 완벽 가이드: 텍스트 투 이미지 및 참조 이미지 편집(합성을 위한 1~5장 이미지), 최대 1536×1536 면적의 사용자 지정 가로/세로 크기, 강력한 중국어 텍스트 렌더링, 크기와 무관한 이미지당 $0.12 / $0.06 고정 가격을 제공합니다.

## 개요

**MAI-Image 2.6**은 Microsoft AI의 자체 이미지 생성 모델로, 2026-09-04에 출시되어 Microsoft Foundry에서 공개 프리뷰로 제공되고 있습니다. 출시 당시 **Arena에서 텍스트 투 이미지(text-to-image) 및 이미지 편집 부문 모두 2위**를 기록했으며, **Artificial Analysis의 이미지 편집 부문에서는 1위**를 차지했습니다(Microsoft 발표 기준 2026-09-04 일자).

APIYI는 Microsoft의 공식 채널을 통해 두 가지 변형 모델을 제공합니다. 두 모델 모두 동일한 엔드포인트와 파라미터를 공유합니다:

* **`MAI-Image-2.6`**: 품질과 정밀도에 최적화된 플래그십 모델
* **`MAI-Image-2.6-Flash`**: 빠른 속도의 변형 모델. Microsoft에 따르면 GPT-Image-2-Medium보다 2.8배 빠르게 생성되며 높은 처리량이 요구되는 프로덕션 워크로드에 적합합니다.

<Note>
  **주요 특징**: **탁월한 중국어 텍스트 렌더링**(간판, 대련(couplet), 손글씨 등이 글자 단위로 정확하게 표현됨), **고충실도 편집**(요청한 부분만 변경되며 나머지 부분은 픽셀 단위로 동일하게 유지됨), `width` + `height`을 통한 자유로운 캔버스 설정(최대 1536×1536 영역), 그리고 **크기와 관계없이 이미지당 고정 가격 책정**. 1024×1024 크기의 이미지는 Flash에서 약 17초, 2.6에서 약 30초가 소요됩니다.
</Note>

<Warning>
  **📌 시작하기 전에 알아두어야 할 세 가지**

  1. **오직 두 개의 엔드포인트만 지원됩니다**: `/v1/images/generations`(텍스트 투 이미지, JSON) 및 `/v1/images/edits`(편집, `multipart/form-data`). **`/v1/chat/completions` 및 `/v1/responses`는 지원되지 않으며** 404를 반환합니다.
  2. **`response_format`, `seed`, `negative_prompt`를 전송하지 마십시오**. 세 가지 모두 즉시 400을 반환합니다. 응답은 항상 `data[0].b64_json`(PNG)입니다.
  3. **`size` 대신 `width` + `height`로 크기를 설정하십시오**. 텍스트 투 이미지 엔드포인트에서 `size`는 조용히 무시되며 항상 1024×1024 크기가 반환됩니다.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다. 비동기 작업 ID는 제공되지 않습니다. 클라이언트 연결이 끊어지면 결과가 유실되지만 요청에 대한 과금은 그대로 발생합니다. 이 모델에는 넉넉한 타임아웃을 설정하십시오. 자세한 내용은 [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/ko/api-capabilities/mai-image/text-to-image">
    대화형 Playground를 통해 텍스트 prompt로부터 이미지를 생성합니다.
  </Card>

  <Card title="Image Editing API" icon="image" href="/ko/api-capabilities/mai-image/image-edit">
    1\~5장의 참조 이미지와 지시사항을 업로드하여 다중 이미지 융합을 수행합니다. Playground가 포함되어 있습니다.
  </Card>
</CardGroup>

## AI 에이전트를 통한 연동

<Note>
  Codex / Claude Code / Cursor를 사용하여 개발하는 경우 아래 prompt를 복사하여 입력하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져온 다음(모든 문서 URL 끝에 `.md` 추가), 사용자의 기술 스택에 맞는 코드를 작성합니다. 타임아웃, **400을 반환하는 세 가지 파라미터**, `size` 대신 `width`/`height` 사용, 파일 업로드 전용 편집 등 흔히 발생하는 함정들이 명시되어 있습니다.
</Note>

<Prompt description="코딩 에이전트를 통해 MAI-Image 2.6 텍스트-이미지 생성 및 이미지 편집 기능을 연동하거나 디버깅하십시오. Codex, Claude Code, Cursor 등에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에 Microsoft MAI-Image 2.6 텍스트-이미지 생성 및 이미지 편집을 연동(또는 디버그)하십시오.

  코드를 작성하기 전에 문서를 확인하십시오. 이 페이지의 일반 텍스트 버전인 [https://docs.apiyi.com/en/api-capabilities/mai-image/overview.md](https://docs.apiyi.com/en/api-capabilities/mai-image/overview.md) 를 가져오십시오. 세부 파라미터는 동일한 방식으로 텍스트-이미지 생성 및 이미지 편집 페이지 URL 끝에 `.md`를 추가하여 확인하십시오.

  요구사항:

  1. 모델 이름: 플래그십 `MAI-Image-2.6`, 고속 버전 `MAI-Image-2.6-Flash`. **모델 이름은 대소문자를 구분합니다**. 모두 소문자로 작성하면 503을 반환하며, 이는 서비스 장애처럼 보이지만 단순한 모델 이름 오류입니다.

  2. 엔드포인트: `/v1/images/generations`(JSON) 및 `/v1/images/edits`(`multipart/form-data`)만 사용하십시오. **`/v1/chat/completions` 또는 `/v1/responses`를 호출하지 마십시오**. 404를 반환합니다.

  3. 타임아웃: 클라이언트 타임아웃을 Flash의 경우 120초, 2.6의 경우 180초로 설정하십시오. 1024×1024 이미지는 약 17초 / 30초가 소요되었으나, 트래픽 급증 시점이나 더 큰 크기의 경우 더 오래 걸립니다. 이미지 API는 작업 ID가 없는 동기식 API입니다. 클라이언트 연결이 끊어지면 결과가 유실되더라도 요청 요금은 그대로 과금됩니다. 리버스 프록시, 게이트웨이 및 서버리스 실행 제한 시간도 함께 늘리십시오.

  4. 금지된 파라미터: **절대 `response_format`, `seed` 또는 `negative_prompt`를 전송하지 마십시오**. 각각 400 `Invalid parameters`을 반환합니다. gpt-image / DALL·E에서 마이그레이션된 코드는 대개 `response_format="b64_json"`를 명시적으로 설정하므로 이를 제거하십시오. `quality`, `output_format`, `background`, `style`은 오류 없이 무시되므로 이 역시 제거하십시오.

  5. 응답 처리: 응답은 항상 `data[0].b64_json`이며, `data:` 접두사가 없는 순수 base64이므로 디코딩하면 PNG가 됩니다(1024×1024 기준 약 1.5–1.7 MB). `url` 모드는 지원되지 않습니다. `usage`에는 플레이스홀더 값이 들어가므로 정산용으로 사용할 수 없으며, 콘솔 청구 내역이 기준이 됩니다.

  6. 크기: `width` + `height`(정수, 반드시 함께 사용)를 사용하십시오. 각 변은 최소 768이어야 하며, 너비 × 높이가 2,359,296(1536×1536 면적)을 초과해서는 안 됩니다. 16의 배수가 아닌 값은 16의 배수로 내림 처리됩니다. 둘 다 전달하지 않으면 기본값은 1024×1024입니다. **텍스트-이미지 생성 엔드포인트에서는 `size`가 오류 없이 무시됩니다.**

  7. 수량: 텍스트-이미지 생성은 항상 이미지 1장만 반환하며 `n`은 적용되지 않습니다. 더 많이 필요하다면 병렬 요청을 전송하십시오. 편집 엔드포인트에서는 `n`이 작동하며 이미지당 과금됩니다.

  8. 편집: 참조 이미지는 반드시 multipart 형태의 **파일로 업로드**해야 하며, 필드 이름은 `image`입니다. **URL 및 base64 JSON 입력은 지원되지 않습니다**(400). **다중 이미지 융합에는 1–5장의 참조 이미지가 사용됩니다**. 여러 장의 경우 `image[]` 필드를 반복하십시오(OpenAI SDK의 경우 목록 `image=[f1, f2]` 전달). 이미지는 업로드 순서대로 image 1, image 2, …로 번호가 매겨지며, prompt에서 “image N”으로 참조하십시오. 5장을 초과하면 400을 반환합니다. **`image` + `image2`와 같이 번호가 붙은 필드 이름을 사용하지 마십시오**. 두 번째 이미지가 누락됩니다(200을 반환하지만 첫 번째 페이지만 사용됨). 참조 이미지 수는 가격에 영향을 주지 않습니다. JPEG / PNG / WebP만 허용됩니다. 마스크는 지원되지 않습니다. 업로드 전 압축: 1.5 MB를 초과하는 파일만 처리하고, 긴 변을 2048 px 이하로 줄이며, 품질 0.9로 재인코딩하고 압축 실패 시 원본으로 대체하십시오.

  9. 오류: 콘텐츠 검열 시 400 `content_safety_violation`을 반환합니다(실제 유명인, 유혈 표현, 유명 IP 캐릭터, 누드는 차단됨). prompt를 수정하십시오. 재시도해도 소용없습니다. 허용 범위를 벗어난 크기는 메시지에 정확한 제한 조건과 함께 400 `unsupported_request_value`를 반환합니다.

  10. `APIYI_API_KEY` 환경 변수에서 키를 읽고 base\_url로 [https://api.apiyi.com/v1](https://api.apiyi.com/v1) 을 사용하십시오. 절대 하드코딩하거나 git에 커밋하지 마십시오.

  11. 완료되면 실제로 텍스트-이미지 생성 호출 1회와 편집 호출 1회를 실행한 후, 두 호출의 결과와 비용을 보여주십시오.
</Prompt>

<Accordion title="이 prompt가 방지하는 문제점">
  | 요구사항 | 방지되는 문제 |
  | - | - |
  | `response_format` 제거 | 마이그레이션된 코드에서 가장 흔히 보이는 명시적 파라미터입니다. 이를 전송하면 400을 반환하고 전체 배치가 실패합니다 |
  | `size` 대신 `width` / `height` 사용 | 텍스트-이미지 생성 시 `size`은 오류 없이 무시됩니다. 1536×1024를 요청했다고 생각하지만 1024×1024 정사각형 이미지를 받게 됩니다 |
  | 편집 시 파일 업로드만 지원 | OpenAI 방식으로 이미지 URL이나 base64 JSON을 전달하면 400을 반환합니다 |
  | 여러 이미지 사용 시 `image[]` 필드를 반복하고 `image2`는 절대 사용 금지 | `image` + `image2`는 200을 반환하지만 두 번째 이미지가 누락되며, 누락된 콘텐츠는 간과하기 쉽습니다 |
  | chat / responses 미사용 | 채팅 클라이언트는 모든 모델 이름에 대해 채팅 요청을 보내므로, 여기서는 404를 반환합니다 |
  | 모델별 넉넉한 타임아웃 설정 | 연결이 끊긴 요청에도 요금이 과금됩니다. [이미지 API 핵심 가이드 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오 |
</Accordion>

## APIYI에서 MAI-Image 2.6을 사용해야 하는 이유

<CardGroup cols={2}>
  <Card title="Microsoft 공식 채널" icon="shield-check">
    Microsoft 공식 채널을 통해 제공됩니다. Microsoft Foundry의 동명 모델과 동일한 모델입니다. 표준 `/v1/images/generations` 및 `/v1/images/edits` 엔드포인트를 지원하며, OpenAI Images API와 동일한 응답 형식을 제공합니다.
  </Card>

  <Card title="이미지당 정액 요금" icon="receipt">
    원공급업체는 tokens 단위로 과금하므로 이미지가 클수록 비용이 더 높아집니다. APIYI는 **크기에 관계없이 이미지당 균일한 고정 요금**을 부과합니다. 768×768과 1536×1536의 요금이 동일하며, 1장 또는 5장의 참조 이미지를 사용한 편집도 비용이 동일하여 이미지 단위로 손쉽게 예산을 계획할 수 있습니다.
  </Card>

  <Card title="어디서나 접근 가능" icon="globe">
    **Azure 계정이나 해외 서버가 필요하지 않습니다.** 데이터 센터, 홈 네트워크, 해외 노드 어디서든 `api.apiyi.com`에 직접 연결할 수 있으며, 하나의 키로 모든 모델을 사용할 수 있습니다.
  </Card>

  <Card title="다양한 모델 라인업" icon="layers">
    다양한 사용 사례에 맞춰 [GPT-Image-2](/ko/api-capabilities/gpt-image-2/overview), [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview), [Seedream](/ko/api-capabilities/seedream-image/overview), [FLUX](/ko/api-capabilities/flux/overview)와 함께 결합하여 활용할 수 있습니다.
  </Card>
</CardGroup>

## 주요 기능

<CardGroup cols={2}>
  <Card title="중국어 텍스트 렌더링" icon="languages">
    중국어 상점 간판, 대련, 칠판 손글씨가 글자 단위로 정확하게 표현됩니다. 포스터, 제품 이미지, 굿즈 제작에 적합합니다.
  </Card>

  <Card title="고정밀 편집" icon="wand">
    "주전자를 코발트 블루로 변경해 줘"라고 하면 주전자만 변경되며, 치수 라벨 및 기타 개체는 픽셀 단위로 동일하게 유지됩니다.
  </Card>

  <Card title="사용자 지정 캔버스" icon="maximize">
    긴 변 기준 최대 3072(예: 3072×768 배너) 및 1536×1536 면적 제한 내에서 어떤 `width` + `height` 조합이든 지원합니다.
  </Card>

  <Card title="두 가지 속도 등급" icon="zap">
    1024×1024 크기 기준 Flash에서는 약 17초, 2.6에서는 약 30초가 소요되며, 10개의 동시 요청에서도 지연 시간이 안정적으로 유지됩니다.
  </Card>
</CardGroup>

### 샘플 결과

**중국어 텍스트 렌더링**(`MAI-Image-2.6-Flash`, APIYI 방문을 환영하는 중국어 간판을 요청한 prompt): 간판, 등불, 대련, 칠판 모두 가독성 높은 중국어를 보여줍니다.

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-zh-text-render.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=7b83a1cb725f1391524c334b7399ea61" alt="MAI-Image-2.6-Flash 중국어 텍스트 렌더링: 중국어 환영 간판이 있는 전통 찻집" width="768" height="780" data-path="images/mai-image-zh-text-render.jpg" />
</Frame>

**참조 이미지 편집**(`MAI-Image-2.6-Flash`, "주전자를 짙은 코발트 블루 유약 색상으로 변경하고 나머지는 모두 동일하게 유지해 줘"라는 지시): 왼쪽이 원본, 오른쪽이 결과입니다. 주전자의 색상만 변경되며 치수 라벨 및 기타 개체는 그대로 유지됩니다.

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flash 편집 예시: 크림색에서 코발트 블루로 색상이 변경된 주전자, 그 외 모든 것은 변경 없음" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

## 요금 안내

| 모델 | 포지셔닝 | APIYI 가격 | 과금 방식 |
| - | - | - | - |
| **`MAI-Image-2.6`** | 플래그십, 품질 우선 | **\$0.12 / 이미지** | 크기 무관, 이미지당 |
| **`MAI-Image-2.6-Flash`** | 고속, 처리량 우선 | **\$0.06 / 이미지** | 크기 무관, 이미지당 |

<Note>모델 가격은 변동될 수 있으며 위 표는 참고용일 뿐입니다. 상단 내비게이션의 **모델 가격** 탭이 기준이 됩니다: [모델 가격](/en/models/index).</Note>

<Info>
  **과금 유의사항**

  * **크기에 관계없이 이미지당 과금**: 768×768과 1536×1536의 비용은 동일하며, prompt 길이는 가격에 영향을 주지 않습니다.
  * **편집 비용은 텍스트-이미지 생성과 동일**: 출력 이미지를 기준으로 과금되며, **참조 이미지가 1장이든 5장이든 비용은 동일합니다**. 편집 엔드포인트에서 `n=2`은(는) 2장의 이미지로 과금됩니다.
  * **400 오류로 실패한 요청**(검열 또는 유효하지 않은 매개변수)은 이미지를 생성하지 않습니다.
  * **응답의 `usage` 필드를 기준으로 대조하지 마십시오**: `prompt_tokens`은(는) 항상 이미지 수 × 1000으로 표시되는 플레이스홀더 값입니다. 콘솔 청구 내역이 기준이 됩니다.
  * [충전 보너스 프로모션](/ko/faq/recharge-promotions)과 중복 적용됩니다.
</Info>

## 그룹 및 Tokens

이 시리즈는 **`Default` 그룹**에 속해 있습니다. 새로 생성된 모든 token으로 호출할 수 있으며, 별도의 신청은 필요하지 않습니다.

<Info>
  **Token 과금 모드**: 이 시리즈에는 `Pay-as-you-go Priority` 및 `Per-request`가 모두 지원됩니다. 동일한 token으로 플랫폼의 token 과금 모델도 함께 사용할 수 있도록 `Pay-as-you-go Priority`를 권장합니다.

  **요청 속도**: 단일 키는 **50 RPM** 이하로 유지해 주십시오. 대규모 배치 작업의 경우 사전에 지원팀에 문의해 주시기 바랍니다.
</Info>

## 기술 사양

| 항목 | 사양 |
| - | - |
| 모델 ID | `MAI-Image-2.6`, `MAI-Image-2.6-Flash` (**대소문자 구분**) |
| 엔드포인트 | `/v1/images/generations` (JSON), `/v1/images/edits` (멀티파트) |
| 크기 매개변수 | `width` + `height`, 정수, 항상 함께 사용 |
| 크기 범위 | 각 변 ≥ 768, 너비 × 높이 ≤ 2,359,296 (= 1536×1536), 16의 배수로 내림 처리 |
| 기본 크기 | 1024×1024 |
| 출력 형식 | PNG (RGB), `b64_json` 전용, 1024×1024 기준 약 1.5–1.7 MB |
| 요청당 이미지 수 | 텍스트-투-이미지는 항상 1개, `n`은 편집 엔드포인트에서 동작 |
| 참조 이미지 | 편집 엔드포인트에서 파일 업로드, **1–5개**(여러 개인 경우 `image[]` 반복), JPEG / PNG / WebP, 개수에 관계없이 요금은 동일합니다 |
| 마스크 인페인팅 | ❌ 지원하지 않음 |
| `seed` / `negative_prompt` | ❌ 400 반환 |
| 스트리밍 | ❌ 지원하지 않음 |
| 지연 시간 (1024×1024) | Flash P50 약 17초, 2.6 P50 약 30초 |
| 권장 클라이언트 타임아웃 | Flash ≥ 120초, 2.6 ≥ 180초 |

## 엔드포인트

| 기능 | 메서드 | 경로 | Content-Type |
| - | - | - | - |
| 텍스트 투 이미지 | `POST` | `/v1/images/generations` | `application/json` |
| 이미지 편집 | `POST` | `/v1/images/edits` | **`multipart/form-data`** |

<Warning>
  **❌ Chat 엔드포인트는 지원되지 않습니다**

  이 시리즈에서 `/v1/chat/completions` 및 `/v1/responses`은 \*\*404 `Requested path is not found`\*\*을 반환합니다. Cherry Studio 및 LobeChat과 같은 Chat 클라이언트는 목록에 있는 모든 모델에 chat 요청을 보내므로, **해당 클라이언트에서는 MAI-Image를 선택하지 마십시오**. Images API를 지원하는 도구를 사용하거나 자체 코드에서 직접 호출하십시오.
</Warning>

<Warning>
  **✅ 편집 엔드포인트는 multipart 파일 업로드만 지원합니다**

  `/v1/images/edits`에 JSON(URL, data URI 또는 원시 base64 형태의 `image` 포함)을 전송하면 400이 반환됩니다:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  `-F "image=@photo.jpg"`을(를) 사용하여 로컬 파일을 직접 업로드하십시오. **이미지 호스팅은 필요하지 않습니다.** 전체 예제는 [이미지 편집 API](/ko/api-capabilities/mai-image/image-edit)를 참조하십시오.
</Warning>

<Tip>
  기본 도메인은 `https://api.apiyi.com`이며, 백업 도메인은 `https://b.apiyi.com`입니다.
</Tip>

## 주요 파라미터

### `width` 및 `height` (출력 크기)

| 규칙 | 세부사항 |
| - | - |
| 항상 함께 사용 | 하나만 전송하면 400이 반환됩니다 |
| 최솟값 | 각 변은 최소 768이어야 합니다. 767은 400을 반환합니다 `'width' must be at least 768 pixels` |
| 면적 상한 | width × height ≤ 2,359,296; 1600×1600은 400을 반환합니다 `exceeds the maximum of 2359296` |
| 라운딩 | 16의 배수가 아닌 경우 내림 처리됩니다: 1000×1000 → 992×992, 1024×1023 → 1024×1008 |
| 가로세로 비율 | 제한 없음; 3072×768(4:1 배너)도 지원됩니다 |

**일반적인 캔버스 크기**(모두 면적 상한 이내):

| 용도 | `width` × `height` |
| - | - |
| 정사각형 | 1024×1024 / 1536×1536 |
| 가로형 3:2 | 1536×1024 |
| 세로형 2:3 | 1024×1536 |
| 가로형 16:9 | 1792×1008 |
| 세로형 9:16 | 1008×1792 |
| 배너 4:1 | 3072×768 |

<Warning>
  **`size`은(는) 두 엔드포인트에서 다르게 작동합니다**: 텍스트-이미지 생성에서는 **경고 없이 무시되며**(항상 1024×1024), 편집 엔드포인트에서는 정상 적용됩니다. 혼란을 피하려면 **두 엔드포인트 모두에서 `width` + `height`을(를) 사용하십시오**.
</Warning>

### `n` (이미지 수)

* **텍스트-이미지 생성**: `n`은(는) 적용되지 않습니다. 2, 4 또는 10을 전송해도 1개의 이미지만 반환됩니다(과금도 1건). 더 많은 이미지가 필요한 경우 병렬 요청을 전송하십시오.
* **편집**: `n`이(가) 정상 작동합니다. `n=2`은(는) 2개의 이미지를 반환하며, 2건으로 과금됩니다.

## 모범 사례

<Steps>
  <Step title="사용 사례별 모델 변형 선택">
    일괄 생성이나 지연 시간에 민감한 작업 → `MAI-Image-2.6-Flash`. 메인 포스터, 복잡한 구도 또는 높은 품질 기준이 필요한 작업 → `MAI-Image-2.6`. 매개변수가 동일하므로 모델 이름만 변경하여 전환할 수 있습니다.
  </Step>

  <Step title="렌더링할 텍스트에 따옴표 사용">
    이미지에 표시되어야 하는 텍스트는 따옴표로 묶고 표시될 위치를 명시하십시오(예: “Grand Opening”이라고 적힌 표지판). 모델은 따옴표로 묶인 텍스트를 매우 충실하게 재현합니다.
  </Step>

  <Step title="편집 시 ‘다른 모든 것은 그대로 유지’ 명시">
    원본을 가능한 한 유지하려면 “Make the teapot cobalt blue, keep everything else exactly the same(찻주전자를 코발트 블루로 변경하고, 다른 모든 것은 완전히 동일하게 유지해 줘)”과 같이 지시사항을 작성하십시오.
  </Step>

  <Step title="캔버스 변경 시 이미지 재구성">
    원본과 가로세로 비율이 다른 `width` / `height`을 전달하면 모델은 자르거나 패딩하는 대신 **장면을 재배치**합니다. 로컬 편집의 경우 크기를 생략하면 출력이 16의 배수로 맞춰진 원본 비율을 따릅니다(예: 1344×756 입력 → 1360×768 출력).
  </Step>

  <Step title="여러 장의 이미지가 필요한 경우 병렬 요청 전송">
    Text-to-image는 호출당 하나의 이미지를 반환하므로, 4장의 이미지가 필요하다면 병렬 요청 4개를 전송하십시오. 자체 테스트 결과, 동시 실행 수 10개에서도 지연 시간은 단일 요청과 동일했습니다.
  </Step>
</Steps>

## 오류 코드 및 재시도

| HTTP | code / message | 의미 | 해결 방법 |
| - | - | - | - |
| `400` | `unsupported_request_value` | 크기 범위 초과, 잘못된 유형, 또는 `width`/`height`이(가) 함께 전송되지 않음 | 메시지의 제약 조건에 따라 수정하십시오. 재시도하지 마십시오 |
| `400` | `invalid_request`: `Invalid parameters: xxx` | `response_format` / `seed` / `negative_prompt` 전송됨 | 해당 필드를 제거하십시오 |
| `400` | `invalid_request`: `Prompt must be …` | `prompt`이(가) 비어 있거나 누락됨 | prompt를 추가하십시오 |
| `400` | `invalid_request_error`: `at most 5 reference images are accepted for <model>` | 편집 엔드포인트에 5개를 초과하는 참조 이미지 전송됨 | 5개 이하로 전송하십시오 |
| `400` | `invalid_request_error`: `reference image xxx is image/gif; only JPEG, PNG and WebP are accepted` | 지원되지 않는 참조 이미지 형식 | 업로드하기 전에 JPEG / PNG / WebP로 변환하십시오 |
| `400` | `invalid_request_error`: `<model> does not support mask edits` | 편집 엔드포인트에 `mask` 사용됨 | 마스크를 제거하고 prompt에 해당 영역을 설명하십시오 |
| `400` | `content_safety_violation` | 콘텐츠 검토에 의해 차단됨 | prompt를 변경하십시오. 재시도해도 해결되지 않습니다 |
| `400` | `request Content-Type isn't multipart/form-data` | 편집 엔드포인트로 JSON 전송됨 | multipart 파일 업로드로 전환하십시오 |
| `404` | `Requested path is not found` | chat / responses로 전송됨 | Images API를 사용하십시오 |
| `500` | `image is required` | 편집 요청에 이미지 파일 필드가 없거나 `image1` + `image2`과 같은 번호가 매겨진 필드 이름 사용됨 | 이미지 1장에는 `image`을 사용하고, 여러 장인 경우 `image[]`을(를) 반복하십시오 |
| `503` | `no available channels` | 잘못된 모델 이름 대소문자(예: 모두 소문자) | `MAI-Image-2.6` / `MAI-Image-2.6-Flash`을(를) 사용하십시오 |

<Info>
  **클라이언트 권장사항**: 위의 4xx / 500 오류는 결정론적이므로 재시도해도 소용이 없습니다. 대신 경고 알림을 발생시키십시오. 지수 백오프와 최대 3회의 시도로 재시도할 가치가 있는 것은 네트워크 타임아웃과 `429`뿐입니다. **클라이언트 타임아웃으로 중단된 요청도 여전히 과금된다**는 점에 유의하시고, 먼저 타임아웃 값을 늘리십시오.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="response_format을 전송할 때 400이 반환되는 이유는 무엇입니까?">
    이 시리즈는 `b64_json`만 반환하며 **`response_format` 매개변수를 지원하지 않습니다**. `"b64_json"`을 전달하더라도 400 `Invalid parameters: response_format`이 반환됩니다.

    gpt-image / DALL·E에서 마이그레이션한 코드에서는 이를 명시적으로 설정하는 경우가 많습니다. 해당 매개변수를 제거하십시오. 이미지는 그대로 `data[0].b64_json`에 포함되어 반환됩니다. `seed` 및 `negative_prompt`에도 동일하게 적용됩니다.
  </Accordion>

  <Accordion title="size: 1536x1024를 전달했는데 결과가 왜 여전히 정사각형입니까?">
    텍스트-이미지 생성 엔드포인트는 **`size`을 읽지 않습니다**. 이를 무시하고 기본값인 1024×1024로 렌더링합니다. 대신 `"width": 1536, "height": 1024`을 사용하십시오.

    이미지 편집 엔드포인트에서는 `size`이 작동하지만, 일관성을 위해 두 엔드포인트 모두에서 `width` + `height`을 사용하십시오.
  </Accordion>

  <Accordion title="이미지 URL을 사용하여 편집할 수 있습니까?">
    **불가능합니다.** 편집 엔드포인트는 `multipart/form-data` 파일 업로드만 지원합니다. `image`로 URL, data URI 또는 base64 문자열을 전달하면 400이 반환됩니다.

    URL만 가지고 있는 경우, 먼저 서버에 다운로드한 후 업로드하십시오:

    ```python theme={null}
    import requests
    img = requests.get("https://example.com/photo.jpg", timeout=30).content
    files = {"image": ("photo.jpg", img, "image/jpeg")}
    ```
  </Accordion>

  <Accordion title="합성을 위해 여러 장의 참조 이미지를 보낼 수 있습니까?">
    **가능하며, 1\~5장까지 지원됩니다**(2026-10-07부터). 단일 이미지와 동일한 가격으로 제공됩니다.

    * **방법**: `image[]` 필드를 반복하여 `curl -F "image[]=@a.jpg" -F "image[]=@b.jpg"`와 같이 지정합니다. OpenAI SDK의 경우 리스트 `client.images.edit(image=[f1, f2])`를 전달합니다.
    * **이미지 참조 방법**: 업로드 순서대로 image 1, image 2, …와 같이 번호가 매겨집니다. 예: “image 2의 여우를 image 1의 장면에 배치하고, image 1의 다른 모든 요소는 그대로 유지하십시오”
    * **`image` + `image2`을 사용하지 마십시오**: 200이 반환되지만 두 번째 이미지는 무시되고 첫 번째 이미지만 사용됩니다.
    * **5장을 초과하는 이미지**를 전달하면 400 `at most 5 reference images are accepted for <model>`이 반환됩니다.

    전체 예제는 [이미지 편집 API](/ko/api-capabilities/mai-image/image-edit)를 참고하십시오.
  </Accordion>

  <Accordion title="마스크 인페인팅이 지원됩니까?">
    **지원되지 않습니다.** `mask` 필드를 전달하면 400 `<model> does not support mask edits`이 반환됩니다. 특정 영역만 수정하려면 prompt에 해당 영역을 설명하십시오(예: “주전자만 파란색으로 변경하고, 다른 모든 요소는 그대로 유지하십시오”). 테스트 결과 모델은 이러한 제약 조건을 충실히 준수합니다.
  </Accordion>

  <Accordion title="Cherry Studio / LobeChat에서 사용할 수 있습니까?">
    **권장하지 않습니다.** 해당 채팅 클라이언트는 `/v1/chat/completions`을 사용하므로 이 시리즈에서는 404가 반환됩니다. OpenAI Images API를 지원하는 도구를 사용하거나, 이 문서의 코드 예제를 참고하여 직접 호출하십시오.
  </Accordion>

  <Accordion title="요청당 몇 개의 이미지가 반환됩니까?">
    텍스트-이미지 생성은 **항상 1개만 반환합니다**. `n`에 어떤 값을 전달하든 1개의 이미지만 수신되며 1개 분량만 과금됩니다. 더 많은 이미지가 필요한 경우 병렬 요청을 전송하십시오.

    편집 엔드포인트에서는 `n`이 정상 작동합니다. `n=2` 설정 시 2개의 이미지가 반환되며 2개 분량으로 과금됩니다.
  </Accordion>

  <Accordion title="usage의 token 수를 바탕으로 과금 내역을 대조할 수 있습니까?">
    **불가능합니다.** `usage.prompt_tokens`은 항상 이미지 수 × 1000이며 `output_tokens`은 항상 0입니다. 이 값들은 플레이스홀더에 불과합니다. 이 시리즈는 이미지당 과금되며, APIYI 콘솔의 과금 내역이 기준이 됩니다.
  </Accordion>

  <Accordion title="콘텐츠 검열은 얼마나 엄격합니까? 차단 시 어떻게 표시됩니까?">
    이 시리즈는 Microsoft의 공식 콘텐츠 안전 정책을 따르며, 이는 **상당히 엄격합니다**. 실제 유명인, 유혈/잔혹한 묘사, 유명 IP 캐릭터(예: Disney), 누드 등은 차단됩니다.

    차단되면 `400 content_safety_violation`이 반환되며 메시지에 구체적인 사유가 포함됩니다. prompt 수준의 차단은 대개 5\~8초 이내에 반환되며, 일부는 생성 후 적용되어 일반적인 이미지 생성과 거의 동일한 시간이 소요됩니다. 동일한 prompt로 재시도해도 해결되지 않으므로 다른 표현으로 수정하십시오.
  </Accordion>

  <Accordion title="스트리밍이 지원됩니까?">
    **지원되지 않습니다.** 일반적인 동기식 요청으로 호출하고 전체 응답을 기다리십시오.
  </Accordion>

  <Accordion title="503 no available channels 오류가 발생합니까?">
    가장 흔한 원인은 **모델 이름의 대소문자 오류**입니다. 모델 이름은 반드시 정확히 `MAI-Image-2.6` 또는 `MAI-Image-2.6-Flash`이어야 하며, `mai-image-2.6-flash`을 전달하면 503이 반환됩니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [MAI-Image 2.6 텍스트-이미지 API](/ko/api-capabilities/mai-image/text-to-image) - 플레이그라운드가 포함된 API 레퍼런스
* [MAI-Image 2.6 이미지 편집 API](/ko/api-capabilities/mai-image/image-edit) - 참조 이미지 편집
* [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices) - 타임아웃, 연결 끊김, 압축
* [충전 보너스 프로모션](/ko/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.