> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Interactions API 대 generateContent

> Google Gemini의 두 API 패러다임에 대한 자세한 비교입니다. 엔드포인트, 요청/응답 구조, 상태 관리, 추론, 사용 필드, 그리고 APIYI 게이트웨이 호환성 테스트 결과를 다룹니다.

2026년 6월부터 Google은 **Interactions API**를 일반 제공으로 전환했으며, 모든 새 프로젝트에는 이를 권장하고 있습니다. 반면 기존의 **generateContent API**는 이제 레거시로 간주되지만 여전히 완전히 지원됩니다. 공식 문서(예: Nano Banana 이미지 생성 페이지)에서는 이제 두 방식 사이를 전환하는 옵션을 제공하며, 이에 따라 많은 개발자들이 정확히 무엇이 다른지, APIYI를 통해서는 무엇을 사용해야 하는지 궁금해하고 있습니다. 이 페이지에서는 자세한 비교와 검증된 결론을 제공합니다.

<Info>
  **APIYI 게이트웨이 상태(2026년 7월 4일 테스트)**: Interactions API는 아직 게이트웨이에서 지원되지 않습니다 — `/v1beta2/interactions`과 `/v1beta/interactions` 모두 404를 반환합니다. APIYI를 통해 Gemini를 호출할 때는 계속 [generateContent 네이티브 형식](/ko/api-capabilities/gemini/native)을 사용하십시오. 이 사이트의 모든 Gemini 문서는 이를 기반으로 작성되어 있습니다. 게이트웨이에 Interactions API 지원이 추가되면 이 페이지를 업데이트하겠습니다.
</Info>

## 두 패러다임이란 무엇인가

**generateContent**는 클래식한 상태 비저장 인터페이스입니다. 하나의 요청이 전체 컨텍스트를 전달하고, 하나의 응답이 전체 결과를 반환하며, `POST /v1beta/models/{model}:generateContent`에서 동작합니다. Google은 "현재는 레거시로 간주되지만, 여전히 완전히 지원됩니다"라고 밝힙니다.

**Interactions API**는 Google의 새로운 인터페이스로, 2026년 6월부터 GA이며 `POST /v1beta2/interactions`에 있습니다. 이 인터페이스는 핵심 `Interaction` 리소스(하나의 완전한 대화 턴 또는 작업)를 중심으로 구성되어 있으며, 응답은 시간순 **실행 단계 타임라인**입니다. 모델의 추론, 도구 호출과 결과, 최종 출력이 모두 명시적인 단계로 표현됩니다. Google은 **핵심 메인라인 패밀리를 넘어서는 새로운 모델과 새로운 agentic 기능은 앞으로 Interactions API에서 출시될 것**이라고 명시합니다(출처: `ai.google.dev/gemini-api/docs/interactions-overview`).

## 한눈에 보는 핵심 차이점

| 항목          | generateContent (classic)                                                              | Interactions API (new)                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 엔드포인트       | `POST /v1beta/models/{model}:generateContent`                                          | `POST /v1beta2/interactions`                                                                                                           |
| 입력 구조       | `contents[].parts[]` (role 기반 멀티모달 파트)                                                 | `input` (문자열 또는 콘텐츠 블록; 본문에 모델 이름 포함)                                                                                                  |
| 출력 구조       | `candidates[0].content.parts[]`                                                        | `steps[]` 타임라인: `user_input` / `thought` / `function_call` / `function_result` / `model_output`                                        |
| 멀티턴         | 클라이언트가 매 턴 **전체 기록**을 다시 전송합니다                                                         | `previous_interaction_id`가 서버 측에서 계속 이어집니다(상태 비저장 모드도 가능함)                                                                             |
| Thinking    | `thoughtsTokenCount` 카운터; 이미지 모델의 중간 thinking 초안은 이미지 파트에 섞여 반환됩니다                     | `steps`(`type: "thought"`)로 명시적으로 반환되며, 생각 텍스트와 중간 이미지를 포함합니다                                                                          |
| 스트리밍        | 전용 `:streamGenerateContent` 엔드포인트                                                      | 본문에 `"stream": true`를 넣는 동일한 엔드포인트                                                                                                     |
| 백그라운드 실행    | 지원하지 않음                                                                                | 장시간 작업을 위한 `"background": true`                                                                                                        |
| 캐싱          | 명시적 캐싱 + 암시적 캐싱                                                                        | 명시적 캐싱 없음; `previous_interaction_id`가 암시적 캐시 적중률을 크게 향상시킵니다                                                                            |
| 서버 측 데이터 보존 | 요청이 저장되지 않음                                                                            | 기본값으로 `store: true`: 유료 티어는 **55일**, 무료 티어는 1일이며 삭제 가능함; `store: false`는 이를 제외합니다(단, background 및 previous\_interaction\_id와는 호환되지 않음) |
| 사용량 필드      | `promptTokenCount` / `candidatesTokenCount` / `thoughtsTokenCount` / `totalTokenCount` | `total_thought_tokens` / `total_output_tokens` 등(snake\_case)                                                                          |
| 에이전트 호출     | 지원하지 않음                                                                                | Deep Research, Antigravity 같은 공식 에이전트를 동일한 인터페이스로 호출합니다                                                                                |
| 아직 사용할 수 없음 | — (가장 완전한 기능 세트)                                                                       | Batch API, 명시적 캐싱, `video_metadata`, 자동 함수 호출(Python), Gemini 3의 원격 MCP                                                                |
| SDK 진입점     | `client.models.generate_content`(google-genai)                                         | `client.interactions.create`(google-genai ≥ 2.3.0 / @google/genai ≥ 2.3.0)                                                             |

<Note>
  Interactions API의 서버 측 상태에서 흔히 빠지는 함정은 `previous_interaction_id`가 **대화 기록만** 이어서 가져간다는 점입니다. `tools`, `system_instruction`, `generation_config`(`thinking_level`, `temperature` 등 포함)은 interaction 범위이므로, 매 턴마다 다시 전송해야 하며 그렇지 않으면 조용히 적용이 중단됩니다.
</Note>

## 요청 및 응답 구조(단일 텍스트 턴)

generateContent 예제는 APIYI 게이트웨이를 직접 대상으로 하며, Interactions API 예제는 Google의 엔드포인트를 직접 대상으로 합니다(APIYI에서는 아직 지원되지 않음):

<CodeGroup>
  ```bash generateContent (APIYI에서 작동) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{
        "parts": [{ "text": "Tell me a joke." }]
      }]
    }'
  ```

  ```bash Interactions API (Google 직접) theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "input": "Tell me a joke."
    }'
  ```
</CodeGroup>

같은 요청에 대해 두 응답 형식이 어떻게 다른지:

<CodeGroup>
  ```json generateContent 응답 theme={null}
  {
    "candidates": [
      {
        "content": {
          "parts": [{ "text": "Why did the chicken cross the road? ..." }],
          "role": "model"
        },
        "finishReason": "STOP",
        "index": 0
      }
    ],
    "usageMetadata": {
      "promptTokenCount": 4,
      "candidatesTokenCount": 12,
      "totalTokenCount": 16
    }
  }
  ```

  ```json Interactions API 응답 theme={null}
  {
    "id": "int_123",
    "status": "completed",
    "steps": [
      {
        "type": "user_input",
        "status": "done",
        "content": [{ "type": "text", "text": "Tell me a joke." }]
      },
      {
        "type": "model_output",
        "status": "done",
        "content": [{ "type": "text", "text": "Why did the chicken cross the road?" }]
      }
    ]
  }
  ```
</CodeGroup>

## 다중 턴 대화 비교

이 지점에서 두 패러다임의 차이가 가장 크게 느껴집니다. generateContent는 매 턴마다 **전체 기록**을 다시 보내야 하지만, Interactions API는 이전 턴의 `id`만 있으면 됩니다:

<CodeGroup>
  ```bash generateContent (전체 기록 재전송) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [
        { "role": "user",  "parts": [{ "text": "Hi, my name is Phil." }] },
        { "role": "model", "parts": [{ "text": "Hello Phil! How can I help?" }] },
        { "role": "user",  "parts": [{ "text": "What is my name?" }] }
      ]
    }'
  ```

  ```bash Interactions API (서버 측 연속 처리) theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "previous_interaction_id": "int_123",
      "input": "What is my name?"
    }'
  ```
</CodeGroup>

기록을 주고받는 코드가 줄어드는 것 외에도, 서버 측 연속 처리는 암시적 캐싱이 대화 접두사에 적중하기 훨씬 쉽게 만듭니다. Google은 이것이 다중 턴 시나리오에서 token 비용을 낮춘다고 말합니다. 대신 기본적으로 데이터가 Google 측에 저장되며(유료 요금제에서는 55일), 데이터 컴플라이언스 요구사항이 있는 기업은 `store` 의미를 평가해야 합니다.

## 이미지 모델의 차이점

Gemini 3 이미지 모델(예: `gemini-3-pro-image`)은 기본적으로 추론하며, 두 패러다임은 “중간 추론 초안”을 완전히 다르게 제시합니다.

* **generateContent(APIYI의 현재 게이트웨이 형식)**: 중간 추론 초안은 `candidates[0].content.parts` 안의 **일반적인 이미지 파트**로 반환됩니다(`thoughtSignature`는 포함되지만 `thought` 플래그는 없음). 테스트에서는 하나의 응답에 2\~10개의 이미지가 포함될 수 있으며, 각 이미지는 출력에 1120/2000 tokens로 과금됩니다. 항상 파트를 순회하면서 **마지막 것을 최종 버전으로 사용**해야 합니다. 전체 측정값과 정산 규칙은 [사용 필드 및 출력 설명](/ko/api-capabilities/nano-banana-usage-metadata)을 참조하십시오.
* **Interactions API**: 추론은 `type: "thought"` 단계(생각 텍스트와 중간 이미지)로 명시되며, 최종 이미지는 `model_output` 단계에 있습니다. SDK도 `.output_image` / `.output_text` 편의 속성을 제공합니다. 텍스트와 이미지가 교차하는 출력(예: 삽화가 있는 스토리)은 여전히 단계를 수동으로 순회해야 합니다.

## APIYI 게이트웨이 호환성 테스트

`api.apiyi.com`에 대해 테스트 키로 2026년 7월 4일(UTC+8)에 점검했습니다:

| Test                                               | Request                    | Result                                   |
| -------------------------------------------------- | -------------------------- | ---------------------------------------- |
| `POST /v1beta2/interactions` + Bearer 인증           | 최소한의 `gemini-2.5-flash` 요청 | ❌ 404 (잘못된 URL)                          |
| `POST /v1beta/interactions` + Bearer 인증            | 동일                         | ❌ 404 (잘못된 URL)                          |
| `POST /v1beta2/interactions` + `x-goog-api-key` 인증 | 동일                         | ❌ 404 (잘못된 URL)                          |
| `POST /v1beta/models/{model}:generateContent`      | 텍스트/이미지 모델                 | ✅ 작동함 (이 사이트의 모든 Gemini 문서는 이를 기반으로 합니다) |

**결론: APIYI 게이트웨이는 아직 Interactions API를 전달하지 않으므로**, 서버 측 이어서 진행, 에이전트 호출, 백그라운드 실행과 같은 Interactions 전용 기능은 현재 게이트웨이를 통해 사용할 수 없습니다.

## 권장 사항

1. **APIYI 경유: 계속 generateContent를 사용하십시오.** Batch, 명시적 캐싱, video\_metadata는 실제로 generateContent 전용이며, 가장 완전한 기능 집합을 갖추고 있고, Google도 이를 완전히 지원하겠다고 약속했으므로 가까운 시일 내에 지원 중단 위험은 없습니다.
2. **generateContent를 사용하는 다중 턴**: 대화 기록을 클라이언트 측에서 조립하십시오. [Gemini Native Format](/ko/api-capabilities/gemini/native) 및 [다중 턴 대화](/ko/api-capabilities/multi-turn-conversation)를 참조하십시오.
3. **Google에 직접 호출하고 Interactions API로의 이전을 고려한다면**, 네 가지를 주의하십시오: `tools` / `system_instruction` / `generation_config`는 매 턴마다 다시 전송해야 합니다. `store`는 기본적으로 켜져 있으며 유료 요금제에서는 55일 보관됩니다. Batch API와 명시적 캐싱은 아직 사용할 수 없습니다. google-genai / @google/genai를 2.3.0+로 업그레이드하십시오.
4. **Interactions API를 주목할 가치가 생기는 시점**: 공식 에이전트(Deep Research, Antigravity)가 필요하거나, `background: true` 같은 장기 실행 작업이 필요하거나, 서버 측 상태를 사용해 다중 턴 token 비용을 줄이고 싶을 때입니다. APIYI가 지원을 추가하는 즉시 이 페이지를 업데이트하겠습니다.

## 관련 문서

<CardGroup cols={2}>
  <Card title="Gemini 네이티브 형식" icon="sparkles" href="/ko/api-capabilities/gemini/native">
    APIYI를 통한 generateContent 네이티브 형식의 완전한 가이드
  </Card>

  <Card title="Gemini 응답 처리" icon="braces" href="/ko/api-capabilities/gemini/response-handling">
    candidates, parts, finishReason를 올바르게 파싱하는 방법
  </Card>

  <Card title="사용 필드 및 출력 설명" icon="receipt-text" href="/ko/api-capabilities/nano-banana-usage-metadata">
    이미지 모델 usageMetadata 의미와 측정된 thinking-draft 동작
  </Card>

  <Card title="멀티턴 대화" icon="messages-square" href="/ko/api-capabilities/multi-turn-conversation">
    무상태 인터페이스에서 멀티턴 채팅 구현
  </Card>
</CardGroup>
