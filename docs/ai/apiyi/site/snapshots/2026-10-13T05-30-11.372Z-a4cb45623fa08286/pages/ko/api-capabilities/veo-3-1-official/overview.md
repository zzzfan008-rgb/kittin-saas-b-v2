> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 공식 동영상 생성

> Google Veo 3.1 공식 릴레이 채널에 대한 완전한 가이드입니다: Google AI Studio로의 투명한 패스스루, 요청별 $0.3 / $1.2 과금, 유연한 4 / 6 / 8초 길이, 720p / 1080p / 4k 등급, 그리고 마찰 없는 온보딩 — 그룹이나 과금 모드 전환이 필요하지 않습니다.

## 개요

**VEO 3.1 Official**은 Google Veo 3.1을 위한 APIYI의 **공식 릴레이 채널**입니다. Google AI Studio의 `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` 비동기 엔드포인트로의 투명한 패스스루를 제공하며, 모델 ID, 응답 필드 및 제한 사항이 업스트림과 동일합니다. **요청당 과금 방식**, **`Default` 그룹에서 호출 가능** — 현재 이용 가능한 가장 진입 장벽이 낮은 공식 품질의 Veo 3.1 채널입니다.

<Note>
  **🎬 주요 특징**: Google AI Studio로의 투명한 패스스루 + 기본 동기화 오디오 + 유연한 4 / 6 / 8초 재생 시간 + 세 가지 해상도 등급(720p / 1080p / 4k) + \$0.3부터 시작하는 요청당 과금 + **`Default` 그룹 + 요청당 과금 또는 종량제 우선 tokens**(전용 그룹 불필요, 순수 종량제는 지원되지 않음). 가장 간편한 도입 방식으로 공식 수준의 품질이 필요한 **광고 숏폼, 이커머스 에셋, 소셜 미디어 콘텐츠 및 제품 데모에 적합**합니다.
</Note>

<Warning>
  **⚠️ `/content`를 통해 다운로드하여 자체 호스팅하십시오**: `status: "completed"` 상태가 되면, **`GET /v1/videos/{task_id}/content`를 호출하여 MP4 바이너리를 가져와** 최종 사용자에게 제공하기 전에 자체 OSS / CDN에 저장하십시오. 완료된 응답에는 `video_url`(인증이 필요 없는 직접 링크)가 포함될 **수도 있습니다**. 이는 **약 24시간 후에 만료되며**(`expires_at` 참조) **모든 작업에서 제공된다고 보장되지 않으므로**, 임시 미리보기용으로만 사용하고 영구 주소로는 절대 사용하지 마십시오. 아래의 [API 엔드포인트](#api-endpoints)를 참조하십시오.
</Warning>

<CardGroup cols={2}>
  <Card title="텍스트 투 비디오 API" icon="wand-sparkles" href="/ko/api-capabilities/veo-3-1-official/text-to-video">
    `POST /v1/videos`, 텍스트만으로 동영상 생성 — JSON 요청 본문, 가장 간단한 진입점입니다.
  </Card>

  <Card title="이미지 투 비디오 API" icon="image" href="/ko/api-capabilities/veo-3-1-official/image-to-video">
    `POST /v1/videos` + 정적 이미지를 클립으로 제작하기 위한 `input_reference` multipart 업로드.
  </Card>

  <Card title="공식 vs 리버스" icon="scale" href="/ko/api-capabilities/veo-3-1-official/vs-veo-reverse">
    기존 [VEO 3.1 (리버스 채널)](/en/api-capabilities/veo/overview)과의 결정 매트릭스입니다.
  </Card>

  <Card title="비주얼 API 테스트" icon="flask-conical" href="https://icover.ai/veo-official">
    코드 작성 없이 iCover 비주얼 테스팅 도구에서 이 엔드포인트를 직접 디버깅할 수 있습니다.
  </Card>

  <Card title="비동기 작업 조회 / 다운로드" icon="list-checks" href="https://api.apiyi.com/task">
    APIYI 콘솔에서 제출된 동영상 작업을 확인하고 동영상 링크를 다운로드할 수 있는 API 외부의 조회 진입점입니다.
  </Card>
</CardGroup>

## AI 에이전트로 연동 진행하기

<Note>
  Codex / Claude Code / Cursor를 사용하여 개발하는 경우 아래 prompt를 복사하여 에이전트에게 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져온 다음(모든 문서 URL 뒤에 `.md` 추가), 프로젝트 자체 스택에 맞추어 코드를 작성합니다. 비동기 폴링, **MP4를 직접 다운로드해야 한다는 사실**, 단계별 제한 시간, 엄격한 4K 제약 조건이 요구사항에 이미 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트에게 VEO 3.1 Official 텍스트-투-비디오 및 이미지-투-비디오 연동 또는 트러블슈팅을 요청합니다. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 VEO 3.1 Official 텍스트-투-비디오 및 이미지-투-비디오 기능을 연동하거나 트러블슈팅하십시오.

  코드를 수정하기 전에 먼저 문서를 읽으십시오. 이 페이지의 일반 텍스트 버전을 확인하려면 [https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md](https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md) 를 가져오십시오. 더 자세한 파라미터 정보는 텍스트-투-비디오 및 이미지-투-비디오 페이지에도 동일한 방식으로 `.md`를 추가하여 확인하십시오.

  요구사항:

  1. 동기식 대기 대신 3단계 비동기 흐름을 사용하십시오. 이 채널은 **비동기 전용**입니다. `POST /v1/videos`으로 작업을 제출하고 `task_id`을 반환받은 뒤, `status`이 `completed`가 될 때까지 **8\~10초**마다 `GET /v1/videos/{task_id}`를 폴링하고, 완료되면 `GET /v1/videos/{task_id}/content`에서 MP4를 다운로드하십시오. **webhook은 지원되지 않으며 폴링만 가능합니다.** 콜백 설정을 찾지 마십시오.

  2. 동영상 가져오기(**이 모델에서 가장 중요한 항목**): `/content` 엔드포인트를 MP4 바이너리 스트림의 신뢰할 수 있는 소스로 취급하십시오. 이 요청에는 **반드시 `Authorization` 헤더가 포함되어야 하므로**, 프론트엔드가 이를 비디오 태그 `src`에 직접 삽입할 수 **없습니다**. 인증 헤더가 없는 브라우저 요청은 401 오류를 받게 됩니다. 완료된 응답에는 인증이 필요 없는 `video_url` 직접 링크가 포함될 **수도** 있지만, 이는 약 24시간 후에 만료되며(`expires_at` 참조) **모든 작업에서 제공된다고 보장되지 않습니다**. 코드에서 여기에 의존하지 마십시오. 링크가 존재할 때 빠른 미리보기 용도로만 사용하고, 그렇지 않은 경우에는 `/content`을 통해 처리하십시오. 올바른 접근 방식은 다음과 같습니다. **상태가 `completed`가 되는 즉시 서버 측에서 MP4를 다운로드하여 자체 오브젝트 스토리지나 CDN에 다시 호스팅**한 후, 최종 사용자에게 자체 URL을 제공하십시오. **원격 동영상은 약 24시간 동안만 보관되므로 `task_id`를 장기 보관용 주소로 절대 신뢰하지 마십시오**. `/content`이 400을 반환하면 최대 약 30초 동안 4초마다 재시도하십시오. `status`이 `completed`으로 바뀐 직후 최대 약 20초 동안 400이 반환되는 구간이 존재합니다(오류 메시지: `task status is IN_PROGRESS`). curl로 다운로드할 때는 반드시 `-f --retry-all-errors`을 추가해야 합니다. 그렇지 않으면 400 오류 시 재시도하지 않고 오류 JSON이 동영상 파일에 그대로 기록됩니다. **`502`은 다릅니다**: 제공자가 파일을 검색할 수 없는 상태이므로 재시도해도 해결되지 않습니다. 따라서 2회 시도 후 중단하고 작업을 실패 처리한 뒤 `task_id`을 기록하십시오. 무제한 재시도 루프를 절대 작성하지 마십시오.

  3. 단계별 제한 시간: POST 제출에 30초를 허용하십시오(multipart 참조 이미지 업로드는 더 오래 걸릴 수 있습니다). 폴링 대기 시간은 해상도에 따라 제한하십시오. 720p 및 1080p는 **3분**, 4K는 **10분**입니다. 단일 값을 하드코딩하지 말고 설정으로 관리하십시오.

  4. 모델 및 파라미터: 모델 이름은 `veo-3.1-fast-generate-preview`(더 저렴하며 일상적인 사용에 적합) 또는 `veo-3.1-generate-preview`(표준 등급) 중 하나입니다. 재생 시간 필드명은 `duration`가 아니라 \*\*`seconds`\*\*이며, **반드시 문자열**(`"4"` / `"6"` / `"8"`)이어야 합니다. 숫자는 서버에서 거부됩니다. **필드명을 `duration`로 지정해도 오류가 발생하지 않으며, 무시된 채 재생 시간이 4초로 기본 설정됩니다.** “8초를 요청했는데 4초짜리가 나왔다”는 문제가 바로 여기서 비롯됩니다. **재생 시간과 해상도는 서로 연동되어 있습니다.** `1080p`와 `4k`는 모두 `"8"` 중 **`seconds`만 허용**하며, `"4"` 또는 `"6"`을 전달하면 오류가 발생합니다. 오직 `720p`만 세 가지 재생 시간을 모두 지원합니다. 따라서 UI에서 사용자가 해상도와 재생 시간을 함께 선택할 수 있도록 하는 경우, 허용되지 않는 조합을 제공하지 말고 두 항목의 조합을 제한하십시오. 4K는 추가로 `veo-3.1-generate-preview` 모델과 10분의 제한 시간이 필요합니다. 4K는 1080p보다 렌더링 속도가 4\~6배 느리고 파일 크기가 약 10배 크지만, **호출당 과금은 재생 시간 및 해상도와 무관합니다(4K라고 비용이 더 들지도, 절감되지도 않습니다)**. 따라서 기본값을 1080p로 설정하고 4K는 사용자가 명시적으로 선택하도록 하십시오.

  5. 이미지-투-비디오의 세 가지 엄격한 제약 조건: 요청은 JSON이 아니라 **`multipart/form-data`** 형식이어야 합니다. 이미지 필드 이름은 \*\*정확히 `input_reference`\*\*이어야 합니다(`image`, `reference`, `input_image`은 모두 무시됨). 그리고 **단 하나의 이미지만 허용**되며, 추가 이미지는 확인 없이 무시됩니다. 원격 URL은 **지원되지 않으므로**, 파일을 직접 업로드하거나 base64를 사용하십시오. 지원되는 형식은 `image/jpeg`, `image/png`, `image/webp`입니다. 또한 이 채널은 **첫 번째/마지막 프레임 지정 및 다중 참조 기능을 제공하지 않으므로**, 해당 기능에 대해 Google의 자체 Veo 3.1 문서를 참조하여 개발하지 마십시오. multipart 모드에서는 `metadata.*` 필드가 `resolution`, `aspectRatio`, `seed`이라는 일반 폼 필드로 평탄화(flatten)됩니다.

  6. **`generateAudio`을 전송하지 마십시오.** Veo 3.1은 자체적으로 오디오를 생성하지만, 해당 파라미터를 전달하면 업스트림에서 `INVALID_ARGUMENT` 오류를 반환합니다. 효과음, 음성 또는 분위기를 제어하려면 prompt에 원하는 의도를 작성하십시오. 이 채널에는 오디오 필드가 전혀 없습니다.

  7. 과금 및 오류: **과금은 모델 이름에 따라 호출당 발생**하며, 재생 시간, 해상도, 참조 이미지 전달 여부와는 무관합니다. 비동기 모드에서는 **생성 실패, 검열 차단, 과부하 오류가 모두 과금되지 않으며 `completed` 상태에만 과금**되므로 자동 재시도로 인한 중복 과금 위험이 없습니다. 오류 처리: `PUBLIC_` 접두사가 있는 오류는 업스트림 검열 차단이며, 과금되지 않고 prompt를 조정한 후 바로 재시도할 수 있습니다. `5xx` 또는 `INTERNAL`는 일시적인 업스트림 오류로 동일한 seed로 1\~2회 재시도해 볼 가치가 있습니다. `failed` 상태로 바뀌는 작업은 일반적으로 검열, 업스트림 용량 부족 또는 동영상 파일을 가져올 수 없는 경우이며 마찬가지로 과금되지 않습니다(과금된 금액은 자동으로 환불됩니다). 원인은 `error.message`에 포함되어 있으므로 로그를 기록하십시오.

  8. 주의해야 할 token 설정: 이 모델은 token이 **호출당 과금** 또는 **종량제 우선**으로 설정되어 있어야 합니다. **일반 종량제는 지원되지 않습니다.** 과금 모드 관련 오류로 호출이 실패하면 콘솔에서 token을 전환하십시오.

  9. `APIYI_API_KEY` 환경 변수에서 키를 읽어오고 [https://api.apiyi.com/v1](https://api.apiyi.com/v1) 을 기본 URL로 사용하십시오. 절대 하드코딩하거나 git에 커밋하지 마십시오.

  10. 완료되면 실제로 텍스트-투-비디오 호출 1회와 이미지-투-비디오 호출 1회를 실행한 다음, 생성된 동영상과 해당 두 번의 호출에 든 비용을 보여주십시오.
</Prompt>

<Accordion title="이 prompt를 통해 방지할 수 있는 문제들">
  | 요구사항 | 방지되는 문제 |
  | - | - |
  | MP4를 즉시 다운로드하여 다시 호스팅 | `video_url`은 보장되지 않으며 약 24시간 후에 만료되고 원격 복사본도 약 24시간 동안만 보관되므로, `task_id` 또는 직접 링크를 영구 주소로 취급하면 결국 오류가 발생합니다 |
  | 프론트엔드가 `/content`에 직접 접근 불가 | 해당 엔드포인트는 인증 헤더가 필요하므로 브라우저 요청 시 401을 반환하며 비디오 엘리먼트가 검은 화면으로 표시됩니다 |
  | 동기 대기 대신 폴링 수행 | 공식 릴레이는 비동기 엔드포인트만 제공하며 webhook이 없으므로 단일 블로킹 HTTP 호출은 작동하지 않습니다 |
  | 재생 시간과 해상도의 연동 | `1080p`와 `4k`는 모두 `"8"` 중 `seconds`만 허용하므로 1080p에서 기본값으로 `"4"`을 사용하면 오류가 발생합니다(720p만 세 가지 모두 허용). |
  | `seconds`은 숫자가 아닌 문자열 | 필드 이름도 `duration`이 아니며, 둘 중 하나라도 틀리면 서버에서 거부됩니다 |
  | 실패 건은 과금되지 않음 | `completed`에 대해서만 과금되므로 안전하게 자동 재시도를 수행할 수 있습니다 |
  | Token은 호출당 또는 종량제 우선이어야 함 | 일반 종량제는 아예 실행되지 않으며, 발생하는 오류는 작성한 코드와는 무관합니다 |
</Accordion>

## 왜 APIYI의 VEO 3.1 공식 채널인가요?

Google 공식 / Vertex AI 채널을 그대로 대체할 수 있으며, **온보딩 마찰**, **안정성**, **비용** 측면에서 프로덕션 시나리오에 맞게 최적화되어 있습니다:

<CardGroup cols={2}>
  <Card title="공식 패스스루 · 동일한 Model ID" icon="shield-check">
    Google AI Studio의 Veo 3.1 비동기 엔드포인트로 투명하게 패스스루됩니다. **모델 ID(`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`)가 업스트림과 정확히 일치하며**, 요청 및 응답 필드와 제약 조건도 일대일로 대응됩니다.
  </Card>

  <Card title="마찰 없는 온보딩 · 그룹 전환 불필요" icon="plug">
    호출은 **`Default` 그룹**에서 **요청당 결제 또는 종량제 Priority Tokens**로 동작합니다(순수 종량제는 지원되지 않습니다). **별도 그룹 전환이 필요 없습니다**; 기존 요청당 결제 Tokens는 그대로 사용할 수 있습니다 — Veo 3.1을 위한 가장 마찰이 적은 공식 품질 채널입니다.
  </Card>

  <Card title="무제한 동시 실행 수 · 프로덕션 규모" icon="infinity">
    투명한 프록시가 적용된 통합 계정 풀로, 배치 촬영, 광고 파이프라인, 대규모 생산을 선형적으로 확장할 수 있습니다. **Google의 계정별 티어 상한이 없습니다**.
  </Card>

  <Card title="요청당 과금 · Google보다 60% 이상 저렴" icon="percent">
    `veo-3.1-fast-generate-preview` \$0.3/req, `veo-3.1-generate-preview` \$1.2/req — 4/6/8초 및 720p/1080p/4k 전 구간 동일합니다. **Google의 공식 8초 1080p와 비교하면 62–68% 절감됩니다**, [충전 보너스](/ko/faq/recharge-promotions)를 더해 추가 절감할 수 있으며; 실패한 작업은 과금되지 않습니다.
  </Card>

  <Card title="전 세계 무마찰 접근" icon="globe">
    **해외 서버나 프록시가 필요 없습니다** — 중국 본토 데이터 센터, 가정용 네트워크 또는 해외 노드에서 `api.apiyi.com`에 직접 연결할 수 있습니다. Google AI Studio / Vertex AI 해외 접속 설정은 완전히 건너뛸 수 있습니다.
  </Card>

  <Card title="전문 지원 · 엔터프라이즈 온보딩" icon="handshake">
    저희 팀은 동영상 생성 분야에 깊은 전문성을 보유하고 있습니다: prompt engineering, 해상도 선택, 배치 생산, 후처리까지 지원합니다. 엔터프라이즈 고객을 위한 PoC부터 프로덕션까지의 완전한 기술 지원을 제공합니다.
  </Card>
</CardGroup>

## 주요 기능

<CardGroup cols={2}>
  <Card title="네이티브 동기화 오디오" icon="volume-2">
    Veo 3.1은 **동기화된 오디오가 포함된 동영상**(주변음, 대사, 음악)을 기본적으로 출력합니다. 별도의 오디오 후반 작업이 필요하지 않습니다 — prompt에 오디오 의도를 설명하십시오.
  </Card>

  <Card title="유연한 4 / 6 / 8초 길이" icon="clock">
    `seconds` 문자열 enum: `"4"` / `"6"` / `"8"`. **요청별 과금이며, 길이는 가격에 영향을 주지 않습니다**. 1080p / 4k 등급에는 `"8"`이 필요합니다.
  </Card>

  <Card title="세 가지 해상도 등급" icon="expand">
    `720p` / `1080p` / `4k`, **요청별 요금이 동일합니다**. 가로(`16:9`)와 세로(`9:16`)를 자유롭게 전환할 수 있습니다.
  </Card>

  <Card title="정확한 지시 준수" icon="target">
    Veo 3.1은 카메라 움직임, 객체 물리, 캐릭터 표정 충실도에서 동급을 선도합니다. 풍부한 카메라 언어 키워드 지원(push/pull/pan/dolly, 로우/하이 앵글).
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="이미지-투-비디오(input_reference)" icon="image">
    정적 콘텐츠를 애니메이션으로 만들기 위한 시각적 기준으로 이미지 1장을 업로드합니다. [이미지-투-비디오](/ko/api-capabilities/veo-3-1-official/image-to-video)를 참조하십시오.
  </Card>

  <Card title="비동기 작업 모델" icon="list-check">
    제출하면 즉시 `task_id`이 반환됩니다. 상태를 별도로 조회하고 최종 동영상을 다운로드하십시오 — 일괄 관리 및 실패 시 재개 흐름에 적합합니다.
  </Card>

  <Card title="OpenAI 호환 프로토콜" icon="plug">
    `base_url=https://api.apiyi.com/v1` + `Bearer` 인증을 사용합니다. 원시 HTTP 또는 OpenAI SDK의 저수준 `client.post()`를 통해 작동합니다.
  </Card>

  <Card title="실패는 무료입니다" icon="circle-check">
    비동기 모드에서는 실패한 생성, 콘텐츠 정책 거부, 매개변수 오류는 **과금되지 않습니다**. **오직 `status=completed` 작업만 과금됩니다**.
  </Card>
</CardGroup>

## 가격

APIYI는 **요청당 과금** 방식을 사용합니다. 지원되는 지속 시간/해상도 조합 내에서는 정액 요금이며, **더 길거나 더 높은 해상도 출력에 대한 추가 요금은 없습니다**. `ai.google.dev/gemini-api/docs/pricing`의 공개 요율에 따르면, Google의 공식 Veo 3.1은 초당 과금하며, 아래 할인율은 **8초 동영상**을 기준으로 계산되었습니다.

| 모델 | APIYI 가격 | Google 공식 8초 1080p | Google 공식 8초 4K |
| - | - | - | - |
| `veo-3.1-fast-generate-preview` | **\$0.3 / req** | \$0.96<br />**68.8% 할인** | \$2.40<br />**87.5% 할인** |
| `veo-3.1-generate-preview` | **\$1.2 / req** | \$3.20<br />**62.5% 할인** | \$4.80<br />**75.0% 할인** |

<Info>
  **과금 참고**:

  * 지속 시간(4/6/8초), 해상도(720p/1080p/4k), 또는 `input_reference` 제공 여부와 무관하게, **모델명 기준으로 요청당 과금됩니다** — **4K를 선택해도 720p와 요금은 동일합니다**
  * 비동기 모드에서는 생성 실패 / 콘텐츠 정책 거부 / 용량 오류가 **모두 과금되지 않습니다**
  * [Top-Up Promotions](/ko/faq/recharge-promotions)의 충전 보너스 단계는 실효 비용을 추가로 낮춥니다
  * 4K 렌더링은 4–6배 더 느리고 파일은 약 10배 더 큽니다 — 일상 사용에는 **1080p를 기본값으로** 사용하십시오
  * Google의 공식 4K 요금은 \$0.30/초(빠름) / \$0.60/초(표준)이며, 즉 8초에 \$2.40 / \$4.80입니다(출처: `ai.google.dev/gemini-api/docs/pricing`)
</Info>

## 그룹 설정

VEO 3.1 Official은 `Default` 그룹(1x)에서 작동하며, **전용 그룹 전환이 필요하지 않습니다**. Token의 과금 모드는 **요청당 과금** 또는 **우선 종량제**여야 합니다 — **순수 종량제는 지원되지 않습니다**([콘솔](https://api.apiyi.com/token)에서 필요 시 Token 모드를 전환하십시오).

<Tip>
  **낮은 온보딩 장벽**: VEO 3.1 Official은 Default 그룹에서 실행되며 요청당 과금과 우선 종량제를 모두 지원하므로, 전용으로 설정할 그룹이 없습니다 — **기존 요청당 과금 Token을 그대로 넣고 `base_url`만 바꾸는 "무설정" 온보딩에 이상적입니다**.
</Tip>

| 항목 | VEO 3.1 Official | 비고 |
| - | - | - |
| 그룹 | `Default` (1x) | 전환 불필요 |
| 과금 방식 | 요청당 과금 ✅ / 우선 종량제 ✅ / 순수 종량제 ❌ | 순수 종량제는 전환해야 합니다 |
| Token 요구사항 | 요청당 과금 또는 우선 종량제 + Default 그룹 | 전용 Token 불필요 |
| 요율 배수 | 1.0x | 위 가격 기준으로 직접 정산됩니다 |

## 기술 사양

| 항목 | `veo-3.1-fast-generate-preview` | `veo-3.1-generate-preview` |
| - | - | - |
| **가격** | \$0.3 / 요청 | \$1.2 / 요청 |
| **지원 재생 시간(초, 문자열)** | `"4"` / `"6"` / `"8"` | `"4"` / `"6"` / `"8"` |
| **지원 해상도(`metadata.resolution`)** | `720p` / `1080p` / `4k` | `720p` / `1080p` / `4k` |
| **지원 화면비(`metadata.aspectRatio`)** | `16:9` / `9:16` | `16:9` / `9:16` |
| **오디오** | ✅ 오디오 + 비디오 동기화 지원 | ✅ |
| **이미지 투 비디오(input\_reference)** | ✅ (참조 이미지 1장) | ✅ (참조 이미지 1장) |
| **일반적인 생성 시간** | 720p 60–90초 · 1080p 80–120초 · 4K 5–6분 | 동일 |
| **동영상 보관 기간** | 약 24시간(`expires_at` 참조) — 즉시 다운로드하십시오 | 동일 |
| **응답 필드** | `id` / `status` / `progress` / `created_at` / `completed_at`, 완료 시 `video_url` / `expires_at` 추가 가능, 실패 시 `error` 추가 가능 | 동일 |

<Warning>
  **1080p / 4k 해상도에서는 `seconds` 값이 반드시 `"8"`이어야 합니다** — `"4"` 또는 `"6"`는 업스트림에서 거부됩니다. 720p에서는 세 가지 재생 시간이 모두 지원됩니다.
</Warning>

## API 엔드포인트

| 엔드포인트 | 메서드 | 목적 | Content-Type |
| - | - | - | - |
| `/v1/videos` | POST | 동영상 생성 작업 제출 (텍스트-동영상 / 이미지-동영상, 통합 엔드포인트) | `application/json` 또는 `multipart/form-data` |
| `/v1/videos/{task_id}` | GET | 작업 상태 및 진행률 조회 | — |
| `/v1/videos/{task_id}/content` | GET | **생성된 MP4 다운로드 (바이너리 stream)** | — |

<Warning>
  **⚠️ `/content`을(를) 통해 다운로드하십시오. `video_url`은(는) 임시 미리보기 전용입니다**

  동영상을 가져오는 표준 방식은 **`GET /v1/videos/{task_id}/content`이며, MP4 바이너리 stream을 반환합니다** (`Authorization: Bearer` 헤더 필요).

  주의 사항:

  * 완료된 응답에는 `video_url`(인증이 필요 없는 직접 링크) 및 `expires_at`(약 24시간 후)가 포함될 **수 있습니다**. 단, **모든 작업에서 보장되는 것은 아니므로** 코드에서 해당 값이 없는 경우를 처리해야 합니다.
  * 프론트엔드는 `/content` 엔드포인트를 `<video>` 태그에 직접 넣을 수 **없습니다**. 인증 헤더가 없는 브라우저 요청은 401 오류가 발생합니다. 만료 전까지는 `video_url`을(를) 임시 미리보기에 사용할 수 있습니다.
  * **`status: "completed"` 상태가 되는 즉시 MP4를 다운로드하여 자체 OSS / CDN에 저장**한 후 해당 URL을 최종 사용자에게 제공하십시오.
  * 원격 사본은 약 24시간 동안 보관됩니다. 동영상을 가져오기 위해 **원격 `task_id` 또는 `video_url`에 장기적으로 의존하지 마십시오**.
</Warning>

<Tip>
  **엔드포인트 선택**: 기본은 `api.apiyi.com`이며, 백업 게이트웨이 `b.apiyi.com`도 동일하게 동작합니다.
</Tip>

## 핵심 매개변수

<Tip>
  **⚡ 전체 매개변수 참조**: `model` / `prompt` / `seconds` / `size` / `metadata.*` 유형, 기본값, 제약 조건이 모두 포함된 전체 표는 [Text-to-Video - 매개변수 참조](/ko/api-capabilities/veo-3-1-official/text-to-video#parameter-reference)로 이동하십시오. 이 섹션에서는 함정이 가장 많은 **3개 매개변수**만 설명합니다.
</Tip>

### `seconds` (비디오 길이)

길이 필드의 이름은 \*\*`seconds`\*\*이며(`duration`이 아니라), **반드시 문자열이어야 합니다**(`"4"` / `"6"` / `"8"`). 숫자를 전달하면 다음이 반환됩니다:

```
parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string
```

| Value | 720p | 1080p | 4k |
| - | - | - | - |
| `"4"` | ✅ | ❌ | ❌ |
| `"6"` | ✅ | ❌ | ❌ |
| `"8"` | ✅ (default) | ✅ (required) | ✅ (required) |

<Warning>
  **흔한 함정: 필드 이름을 `duration`로 지정하면 조용히 무시됩니다.** `duration`는 이 채널에서 인식되지 않으므로 → 버려지고 → 길이는 기본값 **4초**로 되돌아갑니다:

  * 720p(및 4초를 허용하는 다른 단계)에서는: **오류는 없지만 4초만 받습니다**(이것이 정확히 "8초를 보냈는데 4초를 받는" 사례입니다)
  * 1080p / 4k에서는 4초가 허용되지 않으므로 `Resolution 1080p requires duration seconds to be 8 seconds, but got 4` 오류가 발생합니다

  **올바른 사용법: 값이 `"8"`인 `seconds` 필드를 전달하십시오(문자열).**
</Warning>

매개변수 우선순위: `metadata.durationSeconds > seconds > 8`

### `metadata.resolution` (해상도 단계)

| Value | Pixels (landscape) | Pixels (portrait) | Notes |
| - | - | - | - |
| `720p` (default) | `1280x720` | `720x1280` | 세 가지 길이 모두 |
| `1080p` | `1920x1080` | `1080x1920` | **`seconds="8"`만 해당** |
| `4k` | `3840x2160` | `2160x3840` | **`seconds="8"`만 해당**, 렌더링 속도 4–6배 더 느림 |

매개변수 우선순위: `metadata.resolution > size > 720p`

### ⚠️ `generateAudio`를 전달하지 마십시오

Veo 3 / 3.1은 **오디오를 기본적으로 인식**하지만, `generateAudio` 매개변수는 **전달하면 안 됩니다**. 업스트림은 `INVALID_ARGUMENT`로 거부합니다. 오디오를 제어하려면 **의도를 prompt에 작성하십시오**:

> "해 질 무렵의 해안 등대; 파도, 멀리서 들리는 바닷새, 낮은 바람 소리, 영화 같은 분위기"

## 모범 사례

<Steps>
  <Step title="필요에 따른 모델 선택">
    * **반복 작업 / 일괄 미리보기** → `veo-3.1-fast-generate-preview` (요청당 \$0.3)
    * **최종 납품 / 4K** → `veo-3.1-generate-preview` (요청당 \$1.2)
    * 동일한 prompt와 시드로 둘 다 실행한 후 직접 확인하여 선택하십시오.
  </Step>

  <Step title="먼저 4초로 검증">
    새로운 prompt마다 `seconds: "4"`(으)로 시작하여 카메라 연출과 스타일을 먼저 검증하십시오 (렌더링 60–90초, \$0.3). 스타일이 확정되면 8초 또는 1080p로 확장하십시오.
  </Step>

  <Step title="동기 대기가 아닌 비동기 폴링 사용">
    공식 채널은 **비동기 전용**입니다. POST로 제출하여 `task_id` 수신 → `status: "completed"` 상태가 될 때까지 8–10초마다 `GET /v1/videos/{task_id}` 폴링 → `/content`에서 다운로드합니다. **webhook은 지원되지 않으며 폴링만 가능합니다**.
  </Step>

  <Step title="티어별 클라이언트 타임아웃 설정">
    * 720p / 1080p: 3분 하드 타임아웃
    * 4K: 10분 하드 타임아웃
    * POST 제출 (multipart): 최소 30초
  </Step>

  <Step title="완료 즉시 다운로드">
    `status`이(가) `completed`(으)로 바뀌면 **즉시 자체 OSS / CDN으로 다운로드하십시오**. 원격 복사본은 약 24시간 동안만 보관되므로 원격 `task_id`에 장기적으로 의존하지 마십시오. `/content` 엔드포인트는 `status`(으)로 바뀐 직후 **간혹 400을 반환**할 수 있습니다. 4초 후 재시도하십시오 (샘플 클라이언트에는 이 로직이 기본 구현되어 있습니다). 동일한 엔드포인트에서 `502`이(가) 반환되는 것은 제공업체에서 파일을 가져올 수 없음을 의미하므로 재시도해도 해결되지 않습니다.
  </Step>

  <Step title="prompt에 오디오 의도 포함">
    **`generateAudio`을(를) 전달하지 마십시오** (`INVALID_ARGUMENT`이(가) 반환됩니다). 환경음, 대사, BGM의 경우 prompt에 다음과 같이 직접 설명하십시오: “waves, distant seabirds, low wind sounds”.
  </Step>

  <Step title="클라이언트 측 요청 제한 설정">
    동시 실행 수 상한은 공개적으로 문서화되어 있지 않으나, 실제로는 10개의 동시 제출이 모두 정상적으로 대기열에 등록되었습니다. 429 / 5xx에 대한 지수 백오프와 함께 **프로덕션 환경에서는 진행 중(in-flight) 요청 수를 10개 이하로 제한하는 것을 권장합니다**.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 상태 / 증상 | 의미 | 권장 조치 |
| - | - | - |
| `400` + `parse_request_failed` | `seconds`이(가) 숫자 형식임 | 문자열 `"4"` / `"6"` / `"8"` 사용 |
| 4초만 생성됨 / `... but got 4` | 필드명이 `duration`(으)로 지정됨 (경고 없이 무시되어 4초로 폴백됨) | `seconds`을(를) 값 `"8"`(문자열)와 함께 사용 |
| `INVALID_ARGUMENT` | 1080p/4k에서 `generateAudio` 전달 또는 8초가 아님 | `generateAudio` 제거, HD/4K의 경우 `seconds="8"` 설정 |
| `401` | 유효하지 않은 token | `Authorization: Bearer <key>` 확인 (불필요한 공백 없음), 키가 여전히 유효한지 확인 |
| `429` | 요청 제한 발생 / 잔액 부족 | 지수 백오프로 재시도, 충전 후 재시도 |
| `5xx` / `INTERNAL` | 업스트림 일시적 오류 | 동일한 시드로 1\~2회 재시도 (과금되지 않음) |
| `GET /content` 반환값 400 (`task status is IN_PROGRESS`) | `status`이(가) `completed`(으)로 막 전환되었으며, 최대 약 20초 동안 지속됨 | 최대 약 30초 동안 4초마다 재시도, curl에는 `-f --retry-all-errors` 필요 |
| `GET /content` 반환값 `502` | 공급업체에서 해당 동영상 파일을 가져올 수 없음 (현재는 드묾, 아래 FAQ 참조) | **재시도해도 해결되지 않음** (몇 시간 후에도 502 지속). `task_id`을(를) 보관하고 문의하여 과금을 확인하십시오. 새 작업으로 다시 제출하면 정상 작동합니다 |
| 작업 `failed` | 생성 실패 (일반적으로 콘텐츠 검토, 업스트림 용량 부족 또는 생성된 파일을 가져올 수 없음) | `error.message` 참조, prompt를 조정한 후 재시도하십시오. **작업은 과금되지 않으며, 차감된 금액은 자동으로 환불됩니다** |

<Info>
  **권장 클라이언트 설정**:

  * POST 제출 타임아웃: **30초** (멀티파트 업로드는 더 필요할 수 있습니다)
  * 폴링 간격: **8–10초**, 최대 대기 시간: 720p/1080p **3분**, 4K **10분**
  * 5xx 및 `failed`에 대한 지수 백오프 재시도 (1–2회 시도 권장)
  * `/content`에서 400 반환 시 최대 약 30초 동안 4초마다 재시도
  * **`/content`에서 발생하는 `400`과 `502`을(를) 서로 다르게 처리**: `400`은(는) 재시도 시 해결되나, `502`은(는) 해결되지 않습니다. 2회 시도 후 중단하고 작업을 실패로 표시한 뒤 `task_id`을(를) 보관하십시오.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="공식 채널 vs Reverse 채널 — 어떤 차이가 있나요? Reverse 채널은 계속 사용할 수 있나요?">
    **공식(이 페이지)**: Google AI Studio의 업스트림 엔드포인트로 투명하게 전달(passthrough)됩니다. 모델 ID는 Google 업스트림(`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`)과 일치하며, 요청당 \$0.3 / \$1.2로 과금되고 비동기 엔드포인트만 지원합니다.

    **Reverse**(기존 [VEO 3.1](/en/api-capabilities/veo/overview)): Google Flow에 대한 리버스 엔지니어링 접근 방식입니다. 모델 ID는 `veo-3.1-fast` / `veo-3.1` / `-fl` 시리즈이며, 요청당 \$0.15부터 시작하여 더 저렴하고 **스트리밍 동기** 및 비동기 모드를 모두 지원하며, **프레임 투 비디오**(첫 프레임/마지막 프레임)도 지원합니다.

    전체 [공식 vs Reverse 결정 매트릭스](/ko/api-capabilities/veo-3-1-official/vs-veo-reverse)를 확인하십시오. 두 채널 모두 계속 제공되므로 비즈니스 요구에 맞게 선택하시면 됩니다.
  </Accordion>

  <Accordion title="length 필드는 초 단위인가요, duration인가요? 그리고 왜 문자열이어야 하나요?">
    **요청 필드는 `seconds`입니다**(문자열 `"4"` / `"6"` / `"8"`). 이름을 `duration`로 지정하면 인식되지 않고 조용히 무시되어 기본값인 4초로 되돌아가며, 이는 "8초를 요청했는데 4초만 생성되는" 문제의 근본 원인입니다.

    문자열이어야 하는 이유: 백엔드 Go 구조체에서 이 필드(내부명 `duration`)를 `string`로 선언하고 있어, 숫자를 전달하면 디코더 계층에서 `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string` 오류로 거부됩니다(해당 에러의 `duration`는 백엔드 내부 필드명이며, 요청 시에는 `seconds`를 전달해야 합니다). **명심하십시오: `seconds`를 사용하고 값을 따옴표로 감싸 전달해야 합니다: `"4"` / `"6"` / `"8"`**.
  </Accordion>

  <Accordion title="대화 / 환경음 / BGM은 어떻게 추가하나요? generateAudio를 전달할 수 있나요?">
    Veo 3 / 3.1은 **자체적으로 오디오 생성을 지원하는** 동영상 모델이지만, `generateAudio` 매개변수는 **전달해서는 안 됩니다**(업스트림에서 `INVALID_ARGUMENT`를 반환합니다). 소리를 제어하려면 **원하는 내용을 prompt에 직접 작성하십시오**:

    > "Coastal lighthouse at dusk; waves, distant seabirds, low wind sounds, cinematic atmosphere"
  </Accordion>

  <Accordion title="fast vs standard — 어떤 것을 선택해야 하나요? fast가 실제로 더 빠른가요?">
    * 동일한 매개변수 설정 시 **렌더링 시간은 거의 동일합니다**(720p 8초 측정 기준: fast 83초, standard 78초). **fast는 더 빠른 것이 아니라 더 저렴한 것입니다**(\$0.3 vs \$1.2).
    * 기본적으로 `veo-3.1-fast-generate-preview` 사용을 권장합니다.
    * 최종 납품용이거나 디테일의 정밀도 및 물리 법칙 일관성이 중요한 경우 `veo-3.1-generate-preview`로 전환하십시오.
    * 프로덕션 환경에서 A/B 테스트: 동일한 prompt와 seed로 둘 다 실행한 후 육안으로 직접 비교하여 선택하십시오.
  </Accordion>

  <Accordion title="4K를 사용할 가치가 있나요?">
    **대부분의 경우 권장하지 않습니다**:

    * 요청당 가격이 동일하다는 점은 매력적으로 보일 수 있습니다.
    * 하지만 렌더링 속도가 **4\~6배 느립니다**(720p 80초 → 4K 350초).
    * 파일 크기가 약 10배 커져(720p 4MB → 4K 40MB) 대역폭 및 스토리지 비용이 크게 증가합니다.
    * 대부분의 재생 환경에서는 1080p로도 시각적으로 충분합니다.

    **4K가 꼭 필요한 경우**: `veo-3.1-generate-preview`를 사용하고, `seconds="8"`를 설정(필수)한 후 클라이언트 타임아웃을 10분 이상으로 지정하여 백그라운드 비동기 작업으로 실행하십시오.
  </Accordion>

  <Accordion title="작업 완료 시점은 어떻게 알 수 있나요? webhook이 지원되나요?">
    * **webhook은 지원되지 않으며**, `GET /v1/videos/{task_id}` 폴링만 지원합니다.
    * 권장 폴링 주기: **8초**(실측상 충분하며 요청 제한에 걸리지 않습니다).
    * 실측 소요 시간: 720p / 1080p 기준 60~~115초, 4K 기준 5~~6분.
    * 클라이언트 타임아웃: 720p/1080p는 3분, 4K는 10분 권장.
  </Accordion>

  <Accordion title="GET /content 호출 시 400 또는 502 오류가 발생합니다 — 완전히 다르게 처리해야 합니다">
    **`400`: 잠시 대기하십시오.** `status` 상태가 `completed`로 바뀐 직후 `/v1/videos/{task_id}/content`를 호출하면 동영상 파일 동기화가 아직 완료되지 않아 간혹 400이 반환될 수 있습니다. 이 상태는 최대 약 20초간 지속되므로 **4초 간격으로 최대 30초 정도 재시도하십시오**(제공되는 예제 클라이언트는 이미 이 처리가 적용되어 있습니다). curl을 사용할 때는 `--retry` 옵션이 400 에러를 기본적으로 재시도하지 않으므로 `-f --retry-all-errors`를 추가해야 합니다.

    **`502`: 재시도해도 해결되지 않습니다.** 응답 바디는 `{"error":{"message":"Upstream service returned status 502"}}` 형태를 띱니다. 생성 자체는 성공하여 `GET /v1/videos/{task_id}`가 `progress: 100`와 함께 `status: "completed"`를 정상 반환하지만, **공급자 측에서 해당 동영상 파일을 가져오지 못하는 상태**입니다. 실측 결과 몇 시간 후에도 여전히 502 상태로 유지되므로 **스스로 복구되지 않습니다**. 무제한 재시도 루프를 작성하지 마십시오.

    대처 방법:

    1. 최대 2회만 재시도하고, 계속 502 상태라면 해당 작업을 실패로 처리하십시오.
    2. **`task_id`를 보관하고 당사에 문의하십시오** — 생성 작업에 대해 이미 과금되었으므로, 확인 후 처리해 드립니다.
    3. 새 작업으로 다시 제출하면 일반적으로 정상적으로 동영상이 생성되며, prompt를 수정할 필요는 없습니다.

    **현재는 이러한 현상이 드뭅니다**: 대부분의 작업은 `completed` 상태를 보고하기 전에 동영상 파일을 가져올 수 있는지 먼저 확인합니다. 파일을 가져올 수 없으면 작업은 `status: "failed"` 상태가 되고(사유는 `error.message`에 기재됨) **과금은 자동으로 환불 처리**되므로, 다운로드할 수 없는 동영상에 대해 비용이 청구되지 않습니다. 다만 완전히 배제할 수는 없으므로, **`GET /v1/videos/{task_id}`가 `completed`를 반환한다고 해서 동영상을 반드시 가져올 수 있다는 뜻은 아닙니다.** 이 둘을 별개의 성공 검정 단계로 취급하십시오.
  </Accordion>

  <Accordion title="동영상 직접 URL을 얻을 수 있나요? 프론트엔드에서 엔드포인트를 직접 호출할 수 있나요?">
    **간혹 제공되지만 일시적일 뿐입니다**. 완료 응답에 `video_url`(인증이 필요 없는 직접 링크)와 `expires_at`(완료 시점 기준 약 24시간 후의 타임스탬프)가 포함될 **수도 있습니다**. 하지만 **모든 작업에서 제공되는 것은 아니며**, 만료되면 작동하지 않으므로 영구적인 주소로 배포해서는 안 됩니다.

    **동영상을 가져오는 표준 방식**: `status: "completed"` 이후에 `GET /v1/videos/{task_id}/content`를 호출하여 **MP4 바이너리 스트림**을 다운로드하십시오(`Authorization: Bearer` 헤더 필요). 이 방식은 모든 작업에서 항상 정상 작동합니다.

    **표준 프로덕션 패턴**:

    1. 백엔드에서 작업 완료 즉시 MP4를 다운로드 → 자체 OSS / CDN으로 업로드
    2. 최종 사용자에게는 자체 CDN URL 제공
    3. **프론트엔드 `<video>` 태그에 `/content` 주소를 직접 지정하지 마십시오** — 브라우저는 인증 헤더를 포함할 수 없어 401 오류가 발생합니다. `video_url`가 제공되는 경우 즉시 미리보기 용도로는 활용할 수 있습니다.
  </Accordion>

  <Accordion title="동영상은 서버에 얼마나 오래 보관되나요? 즉시 다운로드해야 하나요?">
    응답 내 `expires_at` 필드에 명시된 대로 **약 24시간 동안 보관됩니다**(필드가 없는 경우 24시간으로 간주하십시오). **작업 완료 즉시 다운로드하여** 로컬에 저장할 것을 **강력히 권장합니다** — 원격 `task_id`나 `video_url`에 장기적으로 의존하지 마십시오. 만료 후에는 둘 다 작동하지 않습니다.
  </Accordion>

  <Accordion title="진행률이 왜 불연속적으로 건너뛰나요?">
    `progress` 필드는 세분화되어 있지 않으며, **몇 가지 고정된 단계(예: 0 / 10 / 30 / 50 / 100) 사이를 껑충껑충 건너뜁니다**. 백분율 진행 상태 바로 표시하는 데 사용하지 마십시오. 로딩 스피너를 사용하거나 "경과 시간 / 예상 시간"을 직접 계산하여 표시하는 것을 권장합니다.
  </Accordion>

  <Accordion title="생성에 실패해도 과금되나요?">
    **아닙니다**. **`status=completed` 작업에 대해서만 과금됩니다**. `failed` / 취소 / 콘텐츠 정책 위반으로 인한 거부 / 매개변수 오류 등은 모두 비용이 청구되지 않습니다. **실제 동영상이 출력되지 않으면 과금도 발생하지 않습니다**.
  </Accordion>

  <Accordion title="seed를 사용하면 완전히 동일한 동영상을 재현할 수 있나요?">
    **바이트 단위까지 동일하지는 않습니다**. 실측 결과: 동일한 prompt + 동일한 seed(`88888`) + 동일한 매개변수로 fast를 두 번 실행했을 때 파일 크기는 9.81MB vs 9.25MB였으며 md5 값도 완전히 다르고 렌더링 시간에도 차이가 있었습니다.

    **그렇다고 seed가 무의미한 것은 아닙니다**: 동일한 seed의 결과물들은 **서로 유사하게 군집을 형성하며**(5회 실행 테스트에서 그룹 내 파일 크기 편차는 6%에 불과), 서로 다른 seed는 **체계적인 차이를 보입니다**(그룹 간 편차 +36.8%). 시사점:

    * "일관된 느낌"을 원함 → seed 고정
    * "다양한 변형 탐색"을 원함 → prompt를 수정하는 대신 seed 변경
    * "완벽히 동일한 재현"을 원함 → 재현 시도를 멈추고 mp4 파일을 직접 보관
  </Accordion>

  <Accordion title="여러 장의 참조 이미지를 전달할 수 있나요? 첫 프레임/마지막 프레임 지정은 가능한가요?">
    **현재 둘 다 지원되지 않습니다**. 이미지 투 비디오는 1장의 이미지만 허용하며, 필드명은 `input_reference`로 고정되어 있고, **원격 URL은 불가능하며 파일 또는 base64 형식만 지원합니다**.

    Google 업스트림 Veo 3.1은 다중 참조 / 첫-마지막 프레임 / 동영상 확장을 지원하지만, 본 채널에서는 지원하지 않습니다. **첫 프레임/마지막 프레임 지정이 필요한 경우 [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` 시리즈를 사용하십시오**.
  </Accordion>

  <Accordion title="동시 실행 수 제한이나 QPS 제한이 있나요?">
    10건을 동시에 제출하여 측정한 결과, 모두 성공적으로 큐에 등록되었으며 거절되지 않았습니다. 정확한 상한선은 공개되어 있지 않습니다. **프로덕션 환경에서는 진행 중인 작업(in-flight) 수를 10건 이하로 제한**하고, 429 / 5xx 오류 발생 시 지수 백오프(exponential backoff)를 적용할 것을 권장합니다.
  </Accordion>

  <Accordion title="동영상에 워터마크나 출처 메타데이터가 포함되어 있나요?">
    * 눈에 보이는 워터마크는 없습니다.
    * 단, MP4 메타데이터에 내장된 **Google C2PA 콘텐츠 자격 증명(Content Credentials)**(Google C2PA Media Services 발행, `urn:c2pa:...` 포맷)이 포함되어 있습니다. 일반 사용자의 눈에는 보이지 않으나, **C2PA 도구(예: Adobe Content Authenticity)를 통해 "Veo로 생성됨"을 검증할 수 있습니다**.
    * 재배포가 필요한 환경에서는 이 점을 참고하시기 바라며, 일반적인 재생에는 영향을 주지 않습니다.
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 직접 사용할 수 있나요?">
    부분적으로 가능합니다. 인터페이스는 OpenAI 규약(`Bearer` 인증 + `/v1/...`)을 따르지만, OpenAI 공식 SDK는 **`videos.create` 메서드를 제공하지 않습니다**(`/v1/videos`는 커스텀 경로입니다). OpenAI SDK의 저수준 `client.post()` 메서드를 사용하거나 순수 HTTP 요청을 사용하십시오. **순수 HTTP 요청을 사용하는 것이 가장 간단합니다** — [Text-to-Video Playground](/ko/api-capabilities/veo-3-1-official/text-to-video)의 코드 예제를 참고하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [텍스트-투-비디오 플레이그라운드](/ko/api-capabilities/veo-3-1-official/text-to-video) — `POST /v1/videos` (JSON) 인터랙티브 디버거 + 5개 언어 코드 샘플
* [이미지-투-비디오 플레이그라운드](/ko/api-capabilities/veo-3-1-official/image-to-video) — `POST /v1/videos` (multipart) + `input_reference` 사용법
* [공식 vs 리버스 결정 매트릭스](/ko/api-capabilities/veo-3-1-official/vs-veo-reverse) — [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)와의 차이점
* [충전 프로모션](/ko/faq/recharge-promotions) — 보너스 등급 및 적격 채널
* [API 매뉴얼](/ko/api-manual) — 일반적인 호출 규칙, 타임아웃 및 재시도 안내
* Google 공식 모델 페이지: `ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview`
* Google 동영상 생성 문서: `ai.google.dev/gemini-api/docs/video`

<Info>
  VEO 3.1 Official은 APIYI의 안정적인 공식 릴레이 서비스입니다. Google AI Studio로의 투명한 패스스루이며, 모델 ID, 응답 필드, 제약 조건이 Google 상류와 정확히 일치합니다. **또한 이 채널은 Default 그룹에서 요청당 과금으로 동작합니다**. 이용 가능한 공식 품질 채널 중 가장 진입 장벽이 낮습니다. 콘솔 지원 패널에 피드백을 남겨 주십시오.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.