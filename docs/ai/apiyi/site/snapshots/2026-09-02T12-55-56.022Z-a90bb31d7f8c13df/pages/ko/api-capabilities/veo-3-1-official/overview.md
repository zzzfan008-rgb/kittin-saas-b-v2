> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 공식 동영상 생성

> Google Veo 3.1 공식 릴레이 채널에 대한 완전한 가이드입니다: Google AI Studio로의 투명한 패스스루, 요청별 $0.3 / $1.2 과금, 유연한 4 / 6 / 8초 길이, 720p / 1080p / 4k 등급, 그리고 마찰 없는 온보딩 — 그룹이나 과금 모드 전환이 필요하지 않습니다.

## 개요

**VEO 3.1 Official**은 Google Veo 3.1을 위한 APIYI의 **공식 릴레이 채널**입니다. Google AI Studio의 `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` 비동기 엔드포인트로 투명하게 패스스루되며, 모델 ID, 응답 필드, 제약 조건이 업스트림과 동일합니다. **요청당 과금**, **`Default` 그룹에서 호출 가능** — 현재 이용 가능한 가장 낮은 진입 장벽의 공식 품질 Veo 3.1 채널입니다.

<Note>
  **🎬 하이라이트**: Google AI Studio로의 투명한 패스스루 + 네이티브 동기화 오디오 + 유연한 4 / 6 / 8초 길이 + 세 가지 해상도 단계(720p / 1080p / 4k) + \$0.3부터의 요청당 과금 + **`Default` 그룹 + 요청당 과금 또는 사용량 기반 Priority Tokens** (전용 그룹은 필요하지 않으며, 순수 사용량 기반 과금은 지원되지 않습니다). **광고 숏폼, 이커머스 소재, 소셜 미디어 콘텐츠, 제품 데모**처럼 공식급 품질이 필요하면서도 가장 간단한 온보딩이 필요한 용도에 적합합니다.
</Note>

<Warning>
  **⚠️ CDN URL은 반환되지 않습니다 — MP4 stream을 직접 다운로드해야 합니다**: 이 채널은 현재 **배포 가능한 공개 / CDN URL을 반환하지 않습니다**. `status: "completed"` 후에는 **`GET /v1/videos/{task_id}/content`를 호출하여 MP4 binary를 가져온 다음** 이를 직접 보유한 OSS / CDN에 저장한 뒤 최종 사용자에게 제공해야 합니다. 브라우저는 `/content`에 직접 접근할 수 없습니다(인증 헤더 필요). 아래 [API 엔드포인트](#api-endpoints)를 참고하십시오.
</Warning>

<CardGroup cols={2}>
  <Card title="텍스트-투-비디오 API" icon="wand-sparkles" href="/ko/api-capabilities/veo-3-1-official/text-to-video">
    `POST /v1/videos`, 텍스트만으로 비디오를 생성합니다 — JSON 요청 본문을 사용하는 가장 간단한 진입점입니다.
  </Card>

  <Card title="이미지-투-비디오 API" icon="image" href="/ko/api-capabilities/veo-3-1-official/image-to-video">
    `POST /v1/videos` + `input_reference`의 multipart 업로드로 정지 이미지를 클립으로 애니메이션화합니다.
  </Card>

  <Card title="공식 vs 역방향" icon="scale" href="/ko/api-capabilities/veo-3-1-official/vs-veo-reverse">
    기존 [VEO 3.1 (역방향 채널)](/en/api-capabilities/veo/overview)과의 비교 의사결정 매트릭스입니다.
  </Card>

  <Card title="시각적 API 테스트" icon="flask-conical" href="https://icover.ai/veo-official">
    iCover 시각적 테스트 도구에서 이 엔드포인트를 직접 디버그할 수 있습니다 — 코드가 필요하지 않습니다.
  </Card>

  <Card title="비동기 작업 조회 / 다운로드" icon="list-checks" href="https://api.apiyi.com/task">
    APIYI 콘솔에서 제출한 동영상 작업을 보고 동영상 링크를 다운로드할 수 있습니다 — API 외부의 조회 항목입니다.
  </Card>
</CardGroup>

## AI 에이전트가 통합을 수행하게 하십시오

<Note>
  Codex / Claude Code / Cursor로 작업한다면 아래 프롬프트를 복사하여 에이전트에게 전달하십시오. 에이전트는 먼저 이 페이지의 평문 버전(모든 docs URL 뒤에 `.md`를 덧붙이십시오)을 가져온 다음, 프로젝트의 자체 스택으로 코드를 작성합니다 — 비동기 폴링, **MP4를 직접 내려받아야 한다는 사실**, 단계별 타임아웃, 그리고 엄격한 4K 제약은 모두 요구 사항에 이미 반영되어 있습니다.
</Note>

<Prompt description="Codex, Claude Code, Cursor 및 유사한 도구에 붙여 넣을 수 있도록 코딩 에이전트가 VEO 3.1 공식 텍스트-동영상 및 이미지-동영상을 통합하거나 문제를 해결하도록 하십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 VEO 3.1 공식 텍스트-동영상 및 이미지-동영상을 통합하거나 문제를 해결하십시오.

  코드를 손대기 전에 문서를 읽으십시오: 이 페이지의 평문 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md를](https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md를) 읽으십시오. 더 세밀한 파라미터 세부 정보는 텍스트-동영상 및 이미지-동영상 페이지에도 같은 방식으로 `.md`를 덧붙이십시오.

  요구 사항:

  1. 동기식 대기가 아니라 3단계 비동기 흐름을 사용하십시오. 이 채널은 **비동기 전용**입니다: `POST /v1/videos`이 작업을 제출하고 `task_id`를 반환한 다음, `GET /v1/videos/{task_id}`를 **8초에서 10초마다** 폴링하여 `status`이 `completed`가 될 때까지 기다린 뒤, `GET /v1/videos/{task_id}/content`에서 MP4를 다운로드하십시오. **webhook은 없고 폴링만 있습니다** — 콜백 설정을 찾으려 하지 마십시오.

  2. 동영상 가져오기(이 모델에서 가장 중요한 항목): 응답에는 **CDN이나 공개 URL이 전혀 없습니다** — `video_url`도 없고 `data.url`도 없습니다. 동영상은 `/content` 엔드포인트에서 제공되는 MP4 바이너리 스트림으로만 사용할 수 있으며, 해당 요청에는 반드시 `Authorization` 헤더가 포함되어야 합니다. 따라서 프런트엔드는 해당 엔드포인트 URL을 동영상 태그 `src`에 넣을 수 없습니다 — 인증 헤더가 없는 브라우저 요청은 401을 반환합니다. 올바른 방법은 다음과 같습니다: **상태가 `completed`가 되자마자 서버 측에서 MP4를 다운로드하여 자체 오브젝트 스토리지나 CDN에 다시 호스팅한 뒤, 최종 사용자에게는 자체 URL을 제공하십시오**. 원격 동영상이 얼마나 오래 보관되는지는 공식적으로 명시되어 있지 않으므로, **`task_id`를 장기 주소로 절대 의존하지 마십시오**. `/content`에서 다운로드할 때는 4초 간격으로 3\~5회 재시도하십시오. `status`가 `completed`로 바뀌는 직후 순간적으로 400이 발생하는 경우가 있습니다.

  3. 단계별 타임아웃: POST 제출에는 30초를 허용하십시오(멀티파트 참조 이미지 업로드는 더 느릴 수 있습니다). 폴링 대기는 해상도에 따라 제한하십시오 — 720p와 1080p는 **3분**, 4K는 **10분**입니다. 이것들은 하나의 값으로 하드코딩하지 말고 설정으로 두십시오.

  4. 모델과 파라미터: 모델 이름은 `veo-3.1-fast-generate-preview`(더 저렴하며 일상적인 사용에 적합함) 또는 `veo-3.1-generate-preview`(표준 티어)입니다. duration 필드의 이름은 **`seconds`이며, `duration`가 아닙니다**. 또한 **문자열이어야 합니다**(`"4"` / `"6"` / `"8"`) — 숫자는 서버에서 거부됩니다. **필드명을 `duration`로 지정해도 오류는 발생하지 않으며, 해당 값은 조용히 무시되고 duration은 기본 4초로 되돌아갑니다** — 바로 그래서 8초를 요청했는데 4초가 나오는 현상이 생깁니다. **Duration과 resolution은 서로 연동됩니다**: `1080p`와 `4k`는 **`"8"`의 `seconds`만** 허용하며 `"4"` 또는 `"6"`를 넘기면 오류가 발생합니다. **`720p`만 세 가지 duration을 모두 허용합니다**. 따라서 UI에서 사용자가 resolution과 duration을 함께 고를 수 있게 한다면, 허용되지 않는 조합을 보여주지 말고 쌍 자체를 제한하십시오. 4K는 추가로 모델 `veo-3.1-generate-preview`와 10분 타임아웃이 필요합니다. 4K는 1080p보다 4\~6배 느리게 렌더링되고 파일 크기도 대략 10배 더 크지만, **호출당 과금은 duration과 resolution 모두와 무관합니다(4K는 더 비싸지도 않고 절약도 없습니다)** — 따라서 기본값은 1080p로 두고 4K는 사용자가 명시적으로 선택하게 하십시오.

  5. 이미지-동영상에는 세 가지 엄격한 제약이 있습니다: 요청은 **`multipart/form-data`여야 하며 JSON이 아니어야 합니다**. 이미지 필드는 **정확히 `input_reference`라는 이름**이어야 하며(`image`, `reference` 및 `input_image`는 모두 무시됩니다), **이미지는 하나만 허용됩니다** — 추가 이미지는 조용히 무시됩니다. 원격 URL은 **허용되지 않으므로** 파일 또는 Base64를 업로드하십시오. 허용 형식은 `image/jpeg`, `image/png` 및 `image/webp`입니다. 이 채널은 **첫 프레임/마지막 프레임도, 다중 참조도 지원하지 않으므로** Google의 자체 Veo 3.1 문서를 기준으로 해당 기능을 구현하지 마십시오. multipart 모드에서는 `metadata.*` 필드가 `resolution`, `aspectRatio` 및 `seed`라는 이름의 일반 form 필드로 평탄화됩니다.

  6. **`generateAudio`를 보내지 마십시오.** Veo 3.1은 오디오를 네이티브로 생성하지만, 해당 파라미터를 전달하면 upstream이 `INVALID_ARGUMENT`를 반환합니다. 효과음, 음성 또는 주변음을 조정하려면 의도를 prompt에 넣으십시오 — 이 채널에는 오디오 필드가 아예 없습니다.

  7. 과금과 오류: **과금은 모델 이름 기준 호출당 과금이며**, duration, resolution, 참조 이미지를 전달했는지 여부와 무관합니다. 비동기 모드에서는 **생성 실패, 모더레이션 차단, 과부하 오류는 모두 과금되지 않으며 — `completed` 상태만 과금됩니다** — 따라서 자동 재시도는 중복 과금 위험이 없습니다. 오류 처리: `PUBLIC_` 접두사가 붙은 오류는 upstream 모더레이션 차단이며, 과금되지 않고, prompt를 조정한 뒤 바로 재시도할 수 있습니다. `5xx` 또는 `INTERNAL`는 같은 seed로 1\~2회 재시도할 만한 일시적 upstream 오류입니다. 작업이 `failed`로 바뀌면 보통 모더레이션 또는 upstream 용량 문제이며, 이 역시 과금되지 않습니다.

  8. 주의해야 할 token 설정 하나가 있습니다: 이 모델은 token이 **호출당 과금** 또는 **사용량 기반 결제 우선순위**에 있어야 합니다. **일반 사용량 기반 결제는 지원되지 않습니다**. 호출이 billing 모드 문제를 알리며 실패하면 콘솔에서 token을 바꾸십시오.

  9. `APIYI_API_KEY` 환경 변수에서 키를 읽고 [https://api.apiyi.com/v1을](https://api.apiyi.com/v1을) 기본 URL로 사용하십시오. 절대 하드코딩하지 말고, git에 커밋하지 마십시오.

  10. 작업이 끝나면 실제로 텍스트-동영상 호출 1회와 이미지-동영상 호출 1회를 실행한 다음, 해당 동영상들과 두 호출의 비용을 보여주십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아주는 문제">
  | 요구 사항                          | 방지하는 함정                                                                                                  |
  | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
  | MP4를 즉시 다운로드하고 재호스팅            | 응답에 배포 가능한 URL이 없고 원격 보관 기간도 명시되지 않으므로, `task_id`를 지속 가능한 주소로 취급하면 결국 실패합니다                              |
  | 프런트엔드가 `/content`에 직접 접근할 수 없음 | 해당 엔드포인트에는 인증 헤더가 필요하므로 브라우저 요청은 401을 반환하고 동영상 요소는 검은 화면만 보입니다                                           |
  | 동기식 대기 대신 폴링 사용                | 공식 릴레이는 비동기 엔드포인트만 제공하고 webhook도 없으므로, 단일 블로킹 HTTP 호출로는 작동할 수 없습니다                                       |
  | duration은 resolution과 연동됨      | `1080p`와 `4k`는 `"8"`의 `seconds`만 허용하므로, 1080p와 `"4"`를 기본값으로 두면 오류가 발생합니다 — 720p만 세 가지 duration을 모두 허용합니다 |
  | `seconds`는 숫자가 아니라 문자열입니다      | 필드명도 `duration`가 아니며, 둘 중 하나라도 틀리면 서버에서 거부됩니다                                                            |
  | 실패는 과금되지 않음                    | `completed`만 과금되므로 자동 재시도가 안전합니다                                                                         |
  | token은 호출당 또는 PAYG 우선순위여야 함    | 일반 사용량 기반 결제는 아예 실행되지 않으며, 오류는 코드와 무관합니다                                                                 |
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

| 모델                              | APIYI 가격        | Google 공식 8초 1080p       | Google 공식 8초 4K          |
| ------------------------------- | --------------- | ------------------------ | ------------------------ |
| `veo-3.1-fast-generate-preview` | **\$0.3 / req** | \$0.96<br />**68.8% 할인** | \$2.40<br />**87.5% 할인** |
| `veo-3.1-generate-preview`      | **\$1.2 / req** | \$3.20<br />**62.5% 할인** | \$4.80<br />**75.0% 할인** |

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

| 항목         | VEO 3.1 Official               | 비고                 |
| ---------- | ------------------------------ | ------------------ |
| 그룹         | `Default` (1x)                 | 전환 불필요             |
| 과금 방식      | 요청당 과금 ✅ / 우선 종량제 ✅ / 순수 종량제 ❌ | 순수 종량제는 전환해야 합니다   |
| Token 요구사항 | 요청당 과금 또는 우선 종량제 + Default 그룹  | 전용 Token 불필요       |
| 요율 배수      | 1.0x                           | 위 가격 기준으로 직접 정산됩니다 |

## 기술 사양

| 항목                                 | `veo-3.1-fast-generate-preview`                         | `veo-3.1-generate-preview` |
| ---------------------------------- | ------------------------------------------------------- | -------------------------- |
| **가격**                             | \$0.3 / request                                         | \$1.2 / request            |
| **지원 지속 시간(초, string)**            | `"4"` / `"6"` / `"8"`                                   | `"4"` / `"6"` / `"8"`      |
| **지원 해상도(`metadata.resolution`)**  | `720p` / `1080p` / `4k`                                 | `720p` / `1080p` / `4k`    |
| **지원 종횡비(`metadata.aspectRatio`)** | `16:9` / `9:16`                                         | `16:9` / `9:16`            |
| **오디오**                            | ✅ 동기화된 오디오 + 비디오                                        | ✅                          |
| **이미지에서 비디오 생성(input\_reference)** | ✅ (참조 이미지 1장)                                           | ✅ (참조 이미지 1장)              |
| **일반적인 생성 시간**                     | 720p 60–90초 · 1080p 80–120초 · 4K 5–6분                   | 동일함                        |
| **비디오 보관 기간**                      | 공식적으로 문서화되어 있지 않음 — 즉시 다운로드하십시오                         | 동일함                        |
| **응답 필드**                          | `id` / `task_id` / `status` / `progress` / `created_at` | 동일함                        |

<Warning>
  **1080p / 4k 해상도에서는 `seconds`가 `"8"`여야 합니다** — `"4"` 또는 `"6"`는 상위 계층에서 거부됩니다. 720p에서는 세 가지 지속 시간이 모두 지원됩니다.
</Warning>

## API 엔드포인트

| 엔드포인트                          | 메서드  | 용도                                                     | Content-Type                                |
| ------------------------------ | ---- | ------------------------------------------------------ | ------------------------------------------- |
| `/v1/videos`                   | POST | 동영상 생성 작업 제출(text-to-video / image-to-video, 통합 엔드포인트) | `application/json` 또는 `multipart/form-data` |
| `/v1/videos/{task_id}`         | GET  | 작업 상태 및 진행 상황 조회                                       | —                                           |
| `/v1/videos/{task_id}/content` | GET  | **생성된 MP4 다운로드(바이너리 stream)**                          | —                                           |

<Warning>
  **⚠️ MP4 바이너리 다운로드만 가능 — CDN URL은 반환되지 않습니다**

  이 채널은 현재 응답에 **CDN / public URL을 출력하지 않습니다** — 동영상 파일은 **`GET /v1/videos/{task_id}/content`을 통해 MP4 바이너리 stream으로만 가져올 수 있습니다**(`Authorization: Bearer` 헤더 필요).

  의미:

  * 응답에 **`video_url` / `data.url` / 기타 직접 배포 가능한 링크는 반환되지 않습니다**
  * 프런트엔드는 엔드포인트 URL을 `<video>` 태그에 직접 넣을 수 없습니다 — auth header 없이 보내는 브라우저 요청은 401이 됩니다
  * **`status: "completed"` 즉시**, MP4를 다운로드하여 자체 OSS / CDN에 저장한 뒤 최종 사용자에게 URL을 제공하십시오
  * 동영상 보존 정책은 공식 문서에 명시되어 있지 않습니다 — 동영상을 가져오기 위해 원격 `task_id`에 장기적으로 의존하지 마십시오
</Warning>

<Tip>
  **엔드포인트 선택**: 기본 `api.apiyi.com`; 백업 게이트웨이 `vip.apiyi.com` / `b.apiyi.com`는 동일한 동작을 합니다.
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

| Value | 720p        | 1080p        | 4k           |
| ----- | ----------- | ------------ | ------------ |
| `"4"` | ✅           | ❌            | ❌            |
| `"6"` | ✅           | ❌            | ❌            |
| `"8"` | ✅ (default) | ✅ (required) | ✅ (required) |

<Warning>
  **흔한 함정: 필드 이름을 `duration`로 지정하면 조용히 무시됩니다.** `duration`는 이 채널에서 인식되지 않으므로 → 버려지고 → 길이는 기본값 **4초**로 되돌아갑니다:

  * 720p(및 4초를 허용하는 다른 단계)에서는: **오류는 없지만 4초만 받습니다**(이것이 정확히 "8초를 보냈는데 4초를 받는" 사례입니다)
  * 1080p / 4k에서는 4초가 허용되지 않으므로 `Resolution 1080p requires duration seconds to be 8 seconds, but got 4` 오류가 발생합니다

  **올바른 사용법: 값이 `"8"`인 `seconds` 필드를 전달하십시오(문자열).**
</Warning>

매개변수 우선순위: `metadata.durationSeconds > seconds > 8`

### `metadata.resolution` (해상도 단계)

| Value            | Pixels (landscape) | Pixels (portrait) | Notes                                   |
| ---------------- | ------------------ | ----------------- | --------------------------------------- |
| `720p` (default) | `1280x720`         | `720x1280`        | 세 가지 길이 모두                              |
| `1080p`          | `1920x1080`        | `1080x1920`       | **`seconds="8"`만 해당**                   |
| `4k`             | `3840x2160`        | `2160x3840`       | **`seconds="8"`만 해당**, 렌더링 속도 4–6배 더 느림 |

매개변수 우선순위: `metadata.resolution > size > 720p`

### ⚠️ `generateAudio`를 전달하지 마십시오

Veo 3 / 3.1은 **오디오를 기본적으로 인식**하지만, `generateAudio` 매개변수는 **전달하면 안 됩니다**. 업스트림은 `INVALID_ARGUMENT`로 거부합니다. 오디오를 제어하려면 **의도를 prompt에 작성하십시오**:

> "해 질 무렵의 해안 등대; 파도, 멀리서 들리는 바닷새, 낮은 바람 소리, 영화 같은 분위기"

## 모범 사례

<Steps>
  <Step title="필요에 따라 모델을 선택합니다">
    * **Iteration / batch previews** → `veo-3.1-fast-generate-preview` (\$0.3/request)
    * **Final delivery / 4K** → `veo-3.1-generate-preview` (\$1.2/request)
    * 같은 prompt + seed로 둘 다 실행한 뒤 눈으로 보고 선택합니다
  </Step>

  <Step title="먼저 4초로 검증합니다">
    새 prompt마다 카메라 방향과 스타일을 검증하기 위해 `seconds: "4"`부터 시작합니다(60–90초 렌더링, \$0.3). 느낌이 고정되면 8초 또는 1080p로 확장합니다.
  </Step>

  <Step title="비동기 폴링을 사용하고 동기 대기는 사용하지 않습니다">
    공식 릴레이는 **async-only**입니다: 제출하고 `task_id`를 받기 위해 POST한 뒤 `GET /v1/videos/{task_id}`를 8–10초마다 폴링하여 `status: "completed"`가 될 때까지 기다린 다음 `/content`에서 다운로드합니다. **webhooks는 없으며 폴링만 사용합니다**.
  </Step>

  <Step title="티어별로 클라이언트 타임아웃을 설정합니다">
    * 720p / 1080p: 3분 하드 타임아웃
    * 4K: 10분 하드 타임아웃
    * POST 제출 (multipart): 최소 30초
  </Step>

  <Step title="완료되면 즉시 다운로드합니다">
    `status`가 `completed`로 바뀌면, **자체 OSS / CDN으로 즉시 다운로드하십시오** — 원격 `task_id`에 장기적으로 의존하지 마십시오. `/content` 엔드포인트는 `status`가 바뀐 직후 **가끔 400을 반환합니다**; 4초 후 다시 시도하십시오(샘플 클라이언트에 이 동작이 기본 내장되어 있습니다).
  </Step>

  <Step title="오디오 의도를 prompt에 인코딩합니다">
    **`generateAudio`을 전달하지 마십시오**(`INVALID_ARGUMENT`가 반환됩니다). 주변음, 대사, BGM은 prompt에: "파도, 먼 바닷새, 낮은 바람 소리"처럼 설명하십시오.
  </Step>

  <Step title="자체 측에서 요청 제한을 적용합니다">
    동시 실행 수 상한은 공개 문서에 없습니다; 실제로는 동시에 10개 제출을 해도 모두 성공적으로 대기열에 들어갔습니다. **프로덕션 측 진행 중 요청 수를 10 이하로 제한할 것을 권장합니다**, 429 / 5xx에는 지수 백오프로 대응합니다.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 상태 / 증상                        | 의미                                                 | 권장 조치                                                               |
| ------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------- |
| `400` + `parse_request_failed` | `seconds`가 숫자였습니다                                  | 문자열 `"4"` / `"6"` / `"8"`를 사용하십시오                                   |
| 4초만 / `... but got 4`          | 필드 이름이 `duration`로 지정되어 있었습니다(조용히 무시되고 4초로 대체됨)    | 값이 `"8"`인 `seconds`를 사용하십시오(문자열)                                    |
| `INVALID_ARGUMENT`             | `generateAudio`를 전달했거나 1080p/4k에서 8초가 아닌 값을 전달했습니다 | `generateAudio`를 제거하십시오. HD/4K에는 `seconds="8"`를 설정하십시오              |
| `401`                          | 잘못된 token입니다                                       | `Authorization: Bearer <key>`를 확인하십시오(앞뒤 공백이 없어야 합니다). 키는 여전히 유효합니다 |
| `429`                          | 요청 제한에 걸렸거나 잔액이 부족합니다                              | 지수 백오프 재시도를 하십시오. 충전 후 다시 시도하십시오                                    |
| `5xx` / `INTERNAL`             | 상위 계층의 일시적 오류입니다                                   | 같은 seed로 1\~2회 다시 시도하십시오(과금되지 않음)                                   |
| `GET /content` occasional 400  | `status`가 방금 `completed`로 바뀌었습니다                   | 4초 기다린 후 다시 시도하십시오(클라이언트는 3\~5회 재시도해야 합니다)                          |
| Task `failed`                  | 생성에 실패했습니다(일반적으로 콘텐츠 검토 또는 상위 계층 용량 문제)            | prompt를 조정한 뒤 다시 시도하십시오; **작업은 과금되지 않습니다**                          |

<Info>
  **권장 클라이언트 설정**:

  * POST 제출 제한 시간: **30초**(multipart 업로드는 더 필요할 수 있습니다)
  * 폴링 간격: **8\~10초**; 최대 대기 시간 720p/1080p **3분**, 4K **10분**
  * 5xx 및 `failed`에 대해 지수 백오프 재시도(1\~2회 권장)
  * `/content`를 4초 간격으로 3\~5회 재시도
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="공식 vs Reverse 채널 — 차이점은 무엇입니까? Reverse 채널은 아직 사용할 수 있습니까?">
    **공식(이 페이지)**: Google AI Studio의 업스트림 엔드포인트로 투명하게 패스스루합니다. 모델 ID는 Google 업스트림(`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`)과 일치하며, 요청당 \$0.3 / \$1.2이고 비동기 엔드포인트만 지원합니다.

    **Reverse**(기존 [VEO 3.1](/en/api-capabilities/veo/overview)): Google Flow에 대한 리버스 엔지니어링 기반 접근입니다. 모델 ID는 `veo-3.1-fast` / `veo-3.1` / `-fl` 시리즈이며, 요청당 \$0.15부터로 더 저렴하고, **스트리밍 동기**와 비동기 모드를 모두 지원하며, **프레임-투-동영상**(첫/마지막 프레임)도 지원합니다.

    전체 [공식 vs Reverse 결정 매트릭스](/ko/api-capabilities/veo-3-1-official/vs-veo-reverse)를 보십시오. 두 채널은 공존하며, 비즈니스 요구에 맞게 선택하면 됩니다.
  </Accordion>

  <Accordion title="length 필드는 초입니까, 지속 시간입니까? 그리고 왜 문자열이어야 합니까?">
    **요청 필드는 `seconds`입니다**(string `"4"` / `"6"` / `"8"`). 이를 `duration`로 이름 붙이면 인식되지 않으며 — 조용히 무시되고 length는 기본 4초로 되돌아갑니다. 이것이 "8초를 보냈는데 4초만 나왔다"의 근본 원인입니다.

    왜 문자열이어야 하느냐면: 백엔드 Go struct가 이 필드(내부 이름 `duration`)를 `string`로 선언하므로, 숫자는 디코더 계층에서 `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string`로 거부됩니다(그 오류의 `duration`는 백엔드 내부 필드 이름이며 — 요청은 여전히 `seconds`를 보냅니다). **기억하십시오: `seconds`를 보내고, 값은 따옴표로 감싸십시오: `"4"` / `"6"` / `"8"`**.
  </Accordion>

  <Accordion title="대화 / 앰비언트 사운드 / BGM은 어떻게 추가합니까? generateAudio를 전달할 수 있습니까?">
    Veo 3 / 3.1은 **기본적으로 오디오를 지원하는** 동영상 모델이지만, `generateAudio` 매개변수는 **전달하면 안 됩니다**(업스트림이 `INVALID_ARGUMENT`를 반환합니다). 사운드를 제어하려면, **의도를 prompt에 적으십시오**:

    > "해질녘 해안 등대; 파도, 먼 바다새 소리, 낮은 바람 소리, 영화 같은 분위기"
  </Accordion>

  <Accordion title="fast vs standard — 무엇을 선택해야 합니까? fast가 정말 더 빠릅니까?">
    * 동일한 매개변수에서는 **렌더링 시간이 대체로 비슷합니다**(측정값 720p 8초: fast 83초, standard 78초). **fast는 더 빠른 것이 아니라 더 저렴합니다**(\$0.3 vs \$1.2)
    * 기본값은 `veo-3.1-fast-generate-preview`입니다
    * 최종 납품이나 디테일 충실도 / 물리 일관성이 중요할 때는 `veo-3.1-generate-preview`로 전환합니다
    * 프로덕션에서 A/B 테스트를 할 때는: 같은 prompt + seed로 둘 다 실행하고, 눈으로 선택합니다
  </Accordion>

  <Accordion title="4K를 사용하는 것이 가치가 있습니까?">
    **대부분의 경우 권장하지 않습니다**:

    * 요청당 요금이 같아 보여 매력적이지만
    * 렌더링은 **4–6배 더 느립니다**(720p 80초 → 4K 350초)
    * 파일은 약 10배 더 큽니다(720p 4MB → 4K 40MB) — 대역폭과 저장 비용이 두 배로 듭니다
    * 1080p는 대부분의 재생 시나리오에서 시각적으로 충분합니다

    **4K가 필요한 경우**: `veo-3.1-generate-preview`를 사용하고, `seconds="8"`를 설정하며(필수), 클라이언트 타임아웃은 10분 이상으로 하고, 백그라운드 비동기 작업으로 실행합니다.
  </Accordion>

  <Accordion title="작업은 언제 완료됩니까? webhook이 있습니까?">
    * webhook은 없습니다. `GET /v1/videos/{task_id}`만 폴링하십시오
    * 권장 폴링 간격: **8초**(측정상 충분하며 요청 제한에 걸리지 않습니다)
    * 측정 시간: 720p / 1080p 60–115초, 4K 5–6분
    * 클라이언트 타임아웃: 720p/1080p는 3분, 4K는 10분
  </Accordion>

  <Accordion title="왜 GET /content가 400을 반환합니까?">
    `status`가 `completed`로 바뀐 직후에는, `/v1/videos/{task_id}/content` 호출이 업스트림 CDN 동기화 지연 때문에 가끔 400을 반환합니다. **4초 기다린 뒤 한 번 재시도**하면 보통 해결됩니다(샘플 클라이언트는 4초 간격으로 3–5회 재시도합니다).
  </Accordion>

  <Accordion title="동영상용 CDN URL을 받을 수 있습니까? 프런트엔드가 엔드포인트를 직접 호출할 수 있습니까?">
    **현재는 불가능합니다**. 이 채널은 응답에 CDN / 공개 URL을 반환하지 않습니다 — `video_url` / `data.url` / 그 밖의 직접 배포 가능한 링크도 없습니다.

    **동영상을 가져오는 유일한 방법**: `status: "completed"` 후 `GET /v1/videos/{task_id}/content`를 호출해 **MP4 이진 스트림**을 가져옵니다(`Authorization: Bearer` 헤더 필요).

    **표준 프로덕션 패턴**:

    1. 백엔드가 작업 완료 즉시 MP4를 내려받아 자체 OSS / CDN에 업로드합니다
    2. 최종 사용자에게는 CDN URL을 제공합니다
    3. **프런트엔드 `<video>` 태그는 `/content`를 직접 가리키면 안 됩니다** — 브라우저는 auth header를 포함할 수 없어 요청이 401이 됩니다

    업스트림이 CDN URL을 노출하면 이 페이지도 업데이트됩니다.
  </Accordion>

  <Accordion title="동영상은 서버에 얼마나 오래 보관됩니까? 바로 내려받아야 합니까?">
    보관 기간은 **공식적으로 문서화되어 있지 않습니다**. **강력히 권장하는 방법은 완료 즉시 내려받아 로컬에 저장하는 것입니다** — 원격 `task_id`에 장기적으로 의존하지 마십시오; `/content`는 만료 후 결국 404가 됩니다.
  </Accordion>

  <Accordion title="진행률이 왜 50%에 머뭅니까?">
    `progress` 필드는 거칠게 표시되어 있습니다 — **0 / 50 / 100 사이에서만 점프합니다**. 백분율 진행률 표시줄에는 사용하지 마십시오. 대신 스피너를 사용하거나, “경과 / 예상”을 직접 계산하십시오.
  </Accordion>

  <Accordion title="실패한 생성도 과금됩니까?">
    **아닙니다**. **`status=completed` 작업만 과금됩니다**. `failed` / 취소됨 / content-policy 거부 / 매개변수 오류는 모두 무료입니다. **실제 동영상 출력이 없으면 과금도 없습니다**.
  </Accordion>

  <Accordion title="seed로 동일한 동영상을 재현할 수 있습니까?">
    **바이트 단위로는 동일하지 않습니다**. 측정 결과: 같은 prompt + 같은 seed(`88888`) + 같은 매개변수로 fast를 두 번 실행했더니 — 파일 크기는 9.81 MB 대 9.25 MB였고, md5도 완전히 달랐으며, 렌더링 시간도 달랐습니다.

    **하지만 seed는 장식이 아닙니다**: 같은 seed의 출력은 **서로 가까이 묶입니다**(5회 테스트, 그룹 내 파일 크기 편차는 6%에 불과함). 다른 seed는 **체계적으로 이동합니다**(그룹 간 편차 +36.8%). 시사점:

    * “안정적인 느낌”을 원하면 → seed를 고정하십시오
    * “변형을 탐색”하고 싶다면 → prompt를 만지작거리는 대신 seed를 바꾸십시오
    * “정확한 재생”을 원한다면 → 불가능하니 mp4를 저장하십시오
  </Accordion>

  <Accordion title="여러 참고 이미지를 전달할 수 있습니까? 첫/마지막 프레임은요?">
    **현재 둘 다 지원되지 않습니다**. Image-to-video는 이미지 1장만 허용하며, 필드명은 `input_reference`로 고정되어 있고, 파일 또는 Base64로만 가능하며 원격 URL은 지원하지 않습니다.

    Google upstream Veo 3.1은 다중 참고 / 첫-마지막 프레임 / 동영상 확장을 지원하지만, 이 채널은 지원하지 않습니다. **첫/마지막 프레임이 필요하면 [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` 시리즈를 사용하십시오**.
  </Accordion>

  <Accordion title="동시 실행 수 제한? QPS 상한?">
    측정상 10개의 동시 제출이 모두 성공적으로 대기열에 들어갔고 거부는 없었습니다. 정확한 상한은 공개되어 있지 않습니다. **프로덕션에서는 진행 중 요청 수를 10 이하로 제한하고, 429 / 5xx에는 지수 백오프를 적용하는 것을 권장합니다**.
  </Accordion>

  <Accordion title="동영상에 워터마크나 provenance 메타데이터가 포함됩니까?">
    * 보이는 워터마크는 없습니다
    * 하지만 MP4 메타데이터에는 **Google C2PA Content Credentials**(발급 주체: Google C2PA Media Services, 형식 `urn:c2pa:...`)가 포함됩니다. 최종 사용자는 이를 볼 수 없지만; **C2PA 도구(예: Adobe Content Authenticity)는 “Veo로 생성됨”을 검증할 수 있습니다**
    * 재배포 시나리오에서는 유의하십시오. 보통 재생에는 영향을 주지 않습니다
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 직접 사용할 수 있습니까?">
    부분적으로 가능합니다. 인터페이스는 OpenAI 관례(`Bearer` 인증 + `/v1/...`)를 따르지만, OpenAI 공식 SDK는 `videos.create` 메서드를 노출하지 않습니다(`/v1/videos`는 사용자 정의 경로입니다). OpenAI SDK의 저수준 `client.post()` 또는 raw HTTP를 사용하십시오. raw HTTP가 가장 간단합니다 — [Text-to-Video Playground](/ko/api-capabilities/veo-3-1-official/text-to-video)의 코드 예제를 보십시오.
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
