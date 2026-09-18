> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Responses API 네이티브 가이드

> APIYI를 통해 /v1/responses를 호출합니다: 상태 관리, 추론 제어, 내장 도구, 의미 기반 스트리밍 이벤트. OpenAI가 신규 프로젝트에 권장하는 엔드포인트입니다.

`/v1/responses`는 OpenAI의 현재 주력 네이티브 엔드포인트입니다. OpenAI의 표현을 그대로 옮기면, “Chat Completions는 계속 지원되지만, **Responses는 모든 새 프로젝트에 권장됩니다.**” APIYI는 이 엔드포인트를 완벽하게 지원합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하기만 하면 됩니다.

이 페이지는 OpenAI 공식 문서(`developers.openai.com/api/docs`, 2026년 6월 기준)를 바탕으로 합니다. 모든 예시는 바로 복사해 붙여넣을 수 있습니다.

## Responses를 선택해야 하는 이유

Chat Completions와 비교하면, OpenAI는 세 가지 수치를 제시합니다.

* **더 나은 추론**: 같은 추론 모델이 Responses를 통해 SWE-bench에서 약 3% 더 높은 점수를 받습니다(추론 상태가 턴 간 유지됩니다)
* **더 저렴한 입력**: 캐시 활용률이 Chat Completions보다 40%–80% 더 높습니다(OpenAI 내부 테스트 기준). 따라서 입력 과금이 직접 줄어듭니다
* **더 많은 도구**: `web_search`와 `code_interpreter` 같은 내장 도구는 Responses에서만 사용할 수 있습니다

Chat Completions가 여전히 적합한 경우는 다음과 같습니다. 기존 프레임워크에 의존하고 있을 때(LangChain과 대부분의 클라이언트는 기본값이 `/v1/chat/completions`입니다), 또는 Claude, Gemini 및 다른 비-OpenAI 모델도 함께 호출하는 하나의 코드베이스를 원할 때입니다. [호환 모드](/ko/api-capabilities/openai/compatible)를 보십시오.

<Note>
  중단 예정인 것은 **Assistants API**(2026년 8월 26일 (UTC)에 종료 예정)이지, Chat Completions가 아닙니다. 두 엔드포인트 모두 장기적으로 지원되며, 새 기능은 단순히 Responses에 먼저 적용됩니다.
</Note>

## 빠른 시작

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "input": "Introduce yourself in one sentence",
      "instructions": "You are a concise assistant"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.responses.create(
      model="gpt-5.4",
      input="Introduce yourself in one sentence",
      instructions="You are a concise assistant"
  )

  print(response.output_text)  # SDK helper that concatenates all text output
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: 'Introduce yourself in one sentence',
    instructions: 'You are a concise assistant'
  });

  console.log(response.output_text);
  ```
</CodeGroup>

<Tip>
  수동으로 작성한 `output[0].content[0].text`보다 `response.output_text`을 사용하는 것이 좋습니다 — 추론 모델에서는 `output`의 첫 항목이 종종 `reasoning` 항목이지 `message` 항목이 아니므로, 하드코딩된 인덱싱은 깨집니다.
</Tip>

## 요청 매개변수

| 매개변수                   | 유형             | 기본값      | 설명                                                                    |
| ---------------------- | -------------- | -------- | --------------------------------------------------------------------- |
| `model`                | string         | required | 예: `gpt-5.4`, `gpt-5.5`                                               |
| `input`                | string / array | required | 사용자 입력; 멀티모달 콘텐츠 배열을 지원합니다                                            |
| `instructions`         | string         | null     | 시스템 지시사항(system prompt에 해당)                                           |
| `max_output_tokens`    | int            | null     | 출력 한도(추론 token 포함)                                                    |
| `reasoning`            | object         | medium   | `{"effort": "none/low/medium/high/xhigh"}`                            |
| `text`                 | object         | —        | `format`(출력 형식), `verbosity`(낮음/중간/높음)                                |
| `tools`                | array          | \[]      | 함수 + 내장 도구                                                            |
| `tool_choice`          | string         | "auto"   | `auto` / `required` / `none` / 특정 도구                                  |
| `parallel_tool_calls`  | boolean        | true     | 병렬 도구 호출을 허용합니다                                                       |
| `store`                | boolean        | true     | 응답을 서버 측에 유지합니다 — ⚠️ **APIYI에서는 사용할 수 없습니다**, 아래의 다중 턴을 참조하십시오        |
| `previous_response_id` | string         | null     | 이전 응답과 연결합니다 — ⚠️ **APIYI에서는 효과가 없습니다**; 히스토리를 `input` 배열에 전달하십시오     |
| `conversation`         | string         | null     | 지속 대화 객체 — ⚠️ **APIYI에서는 지원되지 않습니다**(`/v1/conversations`는 404를 반환합니다) |
| `background`           | boolean        | false    | 비동기 백그라운드 실행(장시간 작업 / Pro 모델)                                         |
| `stream`               | boolean        | false    | 스트리밍(의미론적 이벤트)                                                        |
| `prompt_cache_key`     | string         | null     | 캐시 라우팅 키 — [캐시 과금](/ko/api-capabilities/openai/prompt-caching) 참조     |
| `metadata`             | object         | {}       | 사용자 지정 메타데이터                                                          |

<Warning>
  gpt-5 시리즈 추론 모델은 **`temperature` / `top_p`를 지원하지 않습니다** — 전달하면 오류가 발생합니다. 대신 `reasoning.effort`과 `text.verbosity`를 사용하십시오.
</Warning>

## 응답 구조

`output`는 항목 배열입니다. 세 가지 일반적인 유형은 `reasoning`(추론 요약), `message`(텍스트 응답), 그리고 `function_call`(함수 호출 요청)입니다. 축약 예시는 다음과 같습니다:

```json theme={null}
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.4-2026-03-05",
  "output": [
    { "type": "reasoning", "summary": [] },
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "Hi! I'm an AI assistant." }]
    }
  ],
  "usage": {
    "input_tokens": 24,
    "input_tokens_details": { "cached_tokens": 0 },
    "output_tokens": 58,
    "output_tokens_details": { "reasoning_tokens": 40 },
    "total_tokens": 82
  }
}
```

주의할 만한 두 `usage` 필드는 다음과 같습니다:

* `input_tokens_details.cached_tokens`: 캐시에 적중한 입력(0.1배로 과금)
* `output_tokens_details.reasoning_tokens`: 추론 지출(출력 요율로 과금되며, `reasoning.effort`으로 조정합니다)

## 멀티턴: 히스토리를 직접 유지하십시오

APIYI를 통해 Responses API를 호출할 때는 **전체 히스토리를 `input` 배열로 전달**하십시오(각 항목은 `role` / `content` 포함), Chat Completions와 같은 방식입니다:

```python theme={null}
resp = client.responses.create(
    model="gpt-5.4",
    input=[
        {"role": "user", "content": "My name is Alice. Please remember it."},
        {"role": "assistant", "content": "Got it, your name is Alice."},
        {"role": "user", "content": "What's my name?"},
    ],
)
print(resp.output_text)  # Answers "Alice"
```

<Warning>
  **APIYI에서는 서버 측 상태를 사용할 수 없습니다 — 이에 의존하지 마십시오.** 게이트웨이를 통해 테스트했습니다(여러 모델, 재시도 지연 포함):

  * `previous_response_id`: 오류 없이 수락됨(200 반환), 하지만 다음 턴은 이전 턴을 **기억하지 못합니다**(`input_tokens`는 현재 턴만 반영하며, 히스토리는 로드되지 않음);
  * `GET /v1/responses/{id}`: 400을 반환합니다 — 저장된 응답은 **조회할 수 없습니다**;
  * `conversation` 객체(`/v1/conversations`): 404를 반환합니다 — **지원되지 않습니다**.

  따라서 APIYI에서는 `store` / `previous_response_id` / `conversation`를 **사용해서는 안 됩니다**; 위의 "`input` 배열과 자체 관리 히스토리" 방식을 항상 사용하십시오. 전체 형식 간 가이드: [멀티턴 대화 가이드](/ko/api-capabilities/multi-turn-conversation).
</Warning>

<Warning>
  **멀티턴은 input 과금을 줄이지 않습니다**: 모든 턴에서 전체 히스토리를 다시 보내며, 모두 input tokens로 과금됩니다. 긴 대화는 캐시 할인으로 비용을 절감합니다(히스토리 접두사는 자동으로 0.1× 캐시 요율로 캐시 적중됩니다) — [캐시 과금](/ko/api-capabilities/openai/prompt-caching)을 참조하십시오.
</Warning>

## 추론 및 출력 제어

### reasoning.effort 선택

| 수준             | 사용할 때                               |
| -------------- | ----------------------------------- |
| `none`         | 간단한 Q\&A와 형식 변환 — 빠르고 저렴함           |
| `low`          | 일반적인 채팅, 요약                         |
| `medium` (기본값) | 일상 개발에 적합한 균형 잡힌 선택                 |
| `high`         | 복잡한 코드, 다단계 추론                      |
| `xhigh`        | 가장 어려운 문제, `gpt-5.5` / `gpt-5.4` 사용 |

```python theme={null}
response = client.responses.create(
    model="gpt-5.5",
    input="Prove that the square root of 2 is irrational",
    reasoning={"effort": "xhigh"}
)
```

### text.verbosity

`low` / `medium` (기본값) / `high`가 답변 길이를 제어합니다. 응답 전용:

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="Explain closures",
    text={"verbosity": "low"}  # short version
)
```

## 스트리밍

Responses는 Chat Completions의 일반적인 `choices[0].delta` 청크가 아니라 의미 기반 이벤트를 스트리밍합니다. 핵심 이벤트는 다음과 같습니다.

| 이벤트                                      | 의미                                    |
| ---------------------------------------- | ------------------------------------- |
| `response.created`                       | 응답 시작                                 |
| `response.output_item.added`             | 새 출력 항목(message / function\_call / …) |
| `response.output_text.delta`             | 텍스트 증가분                               |
| `response.function_call_arguments.delta` | 함수 인자 증가분                             |
| `response.completed`                     | 완료됨(최종 사용량 포함)                        |
| `error`                                  | 실패                                    |

```python theme={null}
stream = client.responses.create(
    model="gpt-5.4",
    input="Write a short poem about autumn",
    stream=True
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
    elif event.type == "response.completed":
        print("\n\nUsage:", event.response.usage)
```

## 기본 제공 도구

기본 제공 도구는 Responses 전용 기능입니다. `tools`에 선언하면 OpenAI가 서버 측에서 실행합니다.

| 도구       | 유형                 | 설명                                                                                                                                                      |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 웹 검색     | `web_search`       | 모델이 자율적으로 웹을 검색합니다                                                                                                                                      |
| 파일 검색    | `file_search`      | 업로드된 벡터 스토어를 쿼리합니다                                                                                                                                      |
| 코드 인터프리터 | `code_interpreter` | 샌드박스에서 Python을 실행합니다                                                                                                                                    |
| 컴퓨터 사용   | `computer_use`     | 가상 데스크톱을 제어합니다                                                                                                                                          |
| 원격 MCP   | `mcp`              | 원격 MCP 서버에 연결합니다                                                                                                                                        |
| 이미지 생성   | `image_generation` | 인라인 이미지 생성입니다. **APIYI에서는 권장하지 않습니다** (호출당 고정 요금이 부과되며 안정성이 보장되지 않음) — 대신 [이미지 API](/ko/api-capabilities/gpt-image-2/text-to-image)를 사용하고 사용량에 따라 과금합니다 |
| 도구 검색    | `tool_search`      | 대규모 도구 세트에서 동적으로 검색합니다(gpt-5.4 이상)                                                                                                                      |

최소 `web_search` 예시:

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="What are today's major AI news stories?",
    tools=[{"type": "web_search"}]
)
print(response.output_text)
```

<Info>
  기본 제공 도구는 OpenAI 측에서 실행됩니다. APIYI 채널에서 도구별 패스스루 지원 여부는 테스트를 통해 확인해야 합니다. 사용자 지정 함수 호출은 완전히 지원됩니다 — [함수 호출](/ko/api-capabilities/openai/function-calling)을 참조하십시오.
</Info>

## Pro 모델과 백그라운드 모드

`gpt-5.4-pro` 및 `gpt-5.5-pro`는 전문 업무용 심층 추론 모델이며 (\$30 / 백만 tokens당 \$180, **svip 그룹 전용**), 실제로는 **`/v1/responses`를 통해서만 사용할 수 있습니다**. 단일 요청에 몇 분이 걸릴 수 있으므로 — `background: true`와 함께 사용하십시오:

```python theme={null}
# Submit a background task
response = client.responses.create(
    model="gpt-5.4-pro",
    input="Do a deep review of this architecture proposal: ...",
    background=True
)

# Poll for the result
import time
while response.status in ("queued", "in_progress"):
    time.sleep(10)
    response = client.responses.retrieve(response.id)

print(response.output_text)
```

<Warning>
  Pro 모델은 비용이 높고 느립니다 — 그 대가는 "더 신뢰할 수 있는 답변을 기다리는 데 몇 분이 걸립니다"입니다. 일상적인 개발에는 `gpt-5.4` / `gpt-5.5`를 사용하십시오. 분명한 심층 추론 필요가 없으면 Pro를 선택하지 마십시오.
</Warning>

## 지원 모델 및 가격

| 모델                  | 입력 (토큰 100만 개당) | 출력 (토큰 100만 개당) | 비고                                                                                     |
| ------------------- | --------------- | --------------- | -------------------------------------------------------------------------------------- |
| `gpt-5.6-sol`       | \$4.00          | \$20.00         | 최신 플래그십, 100만 컨텍스트, `gpt-5.6` 별칭이 이 모델을 가리킵니다. 9월 3일 가격 인하, 최소 2026/11/21까지 프로모션 요금 적용 |
| `gpt-5.6-terra`     | \$2.50          | \$15.00         | 5.6 시리즈의 균형 잡힌 주력 모델                                                                   |
| `gpt-5.6-luna`      | \$1.00          | \$6.00          | 경량 5.6 변형 모델                                                                           |
| `gpt-5.4`           | \$2.50          | \$15.00         | 이전 주력 모델, 100만 컨텍스트                                                                    |
| `gpt-5.4-mini`      | \$0.75          | \$4.50          | 경량 모델, 뛰어난 가성비                                                                         |
| `gpt-5.5`           | \$5.00          | \$30.00         | 이전 플래그십, 복잡한 추론                                                                        |
| `gpt-5.2`           | \$1.75          | \$14.00         | 이전 주력 모델                                                                               |
| `gpt-5.1` / `gpt-5` | \$1.25          | \$10.00         | 예산 친화적                                                                                 |
| `gpt-5.4-pro`       | \$30.00         | \$180.00        | svip 전용, responses 전용, 전문가용                                                            |
| `gpt-5.5-pro`       | \$30.00         | \$180.00        | svip 전용, responses 전용, 전문가용                                                            |

고정 날짜 버전(예: `gpt-5.4-2026-03-05`)도 동일한 가격으로 이용할 수 있습니다. 전체 목록: [모델 및 가격](/ko/api-capabilities/model-info).

## Chat Completions에서의 매핑

<Warning>
  **GPT-5.4(`gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` 포함)부터는 명시적인 추론 노력 수준과 결합된 도구 호출이 `/v1/chat/completions`에서 거부될 수 있습니다**: `tools`을 포함하는 요청에서 **명시적으로** `none`이 아닌 `reasoning_effort`을 전송하면 400 오류가 발생합니다 — `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`. 이는 공식 OpenAI 제한 사항이며, 이 페이지에서 다루는 `/v1/responses` 엔드포인트에는 이러한 제한이 없습니다 — 이러한 모델에서 도구 호출을 사용하려면 Responses를 사용하십시오.

  이 문제가 발생하는지는 요청이 어떤 업스트림 경로로 전달되는지에 **따라 달라지므로**, 동일한 모델이 지금은 200을 반환하고 나중에는 400을 반환할 수 있습니다. “지난번에는 작동했다”는 사실을 안전하다는 증거로 절대 간주하지 마십시오. 측정 결과, 두 가지 해결 방법 간의 절충점 및 전체 마이그레이션 단계는 [엔드포인트 및 마이그레이션](/ko/api-capabilities/openai/responses-migration)을 참조하십시오.
</Warning>

`/v1/chat/completions`에서 마이그레이션할 때의 필드 매핑:

| Chat Completions                       | Responses                                          | 참고                          |
| -------------------------------------- | -------------------------------------------------- | --------------------------- |
| `messages` 배열                          | `input`                                            | 단순한 경우에는 일반 문자열을 사용할 수 있습니다 |
| 시스템 메시지                                | `instructions`                                     | 독립 매개변수                     |
| `max_tokens` / `max_completion_tokens` | `max_output_tokens`                                | —                           |
| `response_format`                      | `text.format`                                      | —                           |
| 최상위 `reasoning_effort`                 | `reasoning.effort`                                 | Responses에서는 중첩된 객체         |
| `choices[0].message.content`           | `output_text`                                      | 결과 읽기                       |
| 상태 비저장, 수동 기록                          | 역시 수동 기록(`input` 배열) ⚠️ APIYI에서는 서버 측 상태를 사용할 수 없음 | —                           |
| `usage.prompt_tokens`                  | `usage.input_tokens`                               | 필드 이름이 다름                   |

<CodeGroup>
  ```python Chat Completions (기존) theme={null}
  response = client.chat.completions.create(
      model="gpt-5.4",
      messages=[
          {"role": "system", "content": "You are a concise assistant"},
          {"role": "user", "content": "Hello"}
      ]
  )
  content = response.choices[0].message.content
  ```

  ```python Responses (새 버전) theme={null}
  response = client.responses.create(
      model="gpt-5.4",
      input="Hello",
      instructions="You are a concise assistant"
  )
  content = response.output_text
  ```
</CodeGroup>

## 클라이언트 지원 현황

왜 대부분의 VS Code 계열 IDE와 플러그인(Cline, Trae 등)은 이 페이지에서 다루는 Responses 엔드포인트가 아니라 `/v1/chat/completions`만 지원합니까?

* **chat/completions는 사실상의 업계 표준입니다**: 서드파티 게이트웨이, 로컬 추론 런타임(Ollama / vLLM / LM Studio), 그리고 OpenAI 이외의 벤더 모두 이를 구현하므로, 하나의 핸들러로 수백 개의 제공자를 처리할 수 있습니다. 반면 `/v1/responses`은 여전히 본질적으로 OpenAI 전용 방언에 가깝습니다
* **Responses는 URL만 바꾸는 문제가 아닙니다**: 의미 기반 이벤트 스트리밍(델타 결합이 아님), 항목 기반 출력, 추론 상태 전달은 모두 chat/completions와 근본적으로 다릅니다. 클라이언트는 전체 에이전트 루프를 다시 작성해야 합니다
* **닭이 먼저냐 달걀이 먼저냐의 문제입니다**: 클라이언트는 대부분의 커스텀 엔드포인트(게이트웨이)가 Responses를 제공하지 않기 때문에 구현하지 않고, 게이트웨이도 같은 이유로 서두르지 않습니다. APIYI는 이미 `/v1/responses`(이 페이지)를 호스팅하고 있으므로 게이트웨이 측의 장애물은 없습니다

2026년 7월 기준의 주류 클라이언트 지원 현황:

| 클라이언트                                            | Responses 지원  | 비고                                                                                                                                                                                    |
| ------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Codex CLI](/ko/scenarios/programming/codex-cli) | ✅ 기본 지원       | OpenAI에서 만들었으며 전체 에이전트 루프가 Responses에서 실행됩니다. chat/completions 지원은 2026년 초에 중단되었습니다                                                                                                   |
| [opencode](/ko/scenarios/programming/opencode)   | ✅             | OpenAI 제공자가 기본적으로 Responses를 사용합니다                                                                                                                                                    |
| [Roo Code](/ko/scenarios/programming/roo-code)   | ✅ (gpt-5.4까지) | “OpenAI” 제공자는 Responses를 사용하고 커스텀 Base URL을 허용합니다(“OpenAI 호환” 제공자는 여전히 chat/completions입니다). 더 이상 유지되지 않으며, 사전 설정 모델은 `gpt-5.4`에서 멈춥니다. Trae 및 다른 VS Code 계열 IDE 안에 플러그인으로 설치할 수 있습니다 |
| Continue                                         | ✅             | gpt-5 / o-series에서는 Responses를 기본값으로 사용합니다. Cursor에 인수되었고, 독립 제품은 정리되는 중입니다                                                                                                           |
| [Cline](/ko/scenarios/programming/cline)         | ❌             | OpenAI Compatible 경로는 chat/completions에 하드코딩되어 있습니다. 커뮤니티 기능 요청은 아직 반영되지 않았습니다                                                                                                        |
| [Trae](/ko/scenarios/programming/trae)           | ❌             | 커스텀 모델은 chat/completions와 messages 엔드포인트만 제공합니다                                                                                                                                       |

GPT-5.4+의 “추론 + tool calling” 워크로드에는 Codex CLI / opencode가 첫 번째 선택입니다. Base URL을 `https://api.apiyi.com/v1`에 지정하십시오. `gpt-5.4`만으로 충분하고 VS Code 계열 IDE(Trae 포함)를 계속 쓰고 싶다면 Roo Code 플러그인을 설치한 뒤 OpenAI 제공자를 선택하십시오.

## 문제 해결

| 증상                                                                 | 원인 및 해결 방법                                                                                                                                                                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model_not_supported` 오류                                           | 해당 모델은 responses 엔드포인트를 지원하지 않습니다 — gpt-5 시리즈를 사용하십시오                                                                                                                                                                          |
| 멀티턴에서 컨텍스트를 기억하지 못함                                                | 가장 안전한 방법은 `input` 배열에 전체 기록을 전달하는 것입니다. `previous_response_id`를 사용한 연결은 2026-09-02에 테스트했을 때 작동했지만, `GET /v1/responses/{id}`은 여전히 사용할 수 없습니다 — 사용하기 전에 자신의 그룹에서 확인하십시오                                                         |
| `output_text`이(가) 비어 있음                                            | 출력이 모두 `function_call` 항목입니다(모델이 tools 실행을 요청함) — `output`을(를) 순회하십시오                                                                                                                                                          |
| `temperature` 전달 시 오류 발생                                           | gpt-5 추론 모델에서는 지원되지 않습니다 — 제거하고 `reasoning.effort`을(를) 사용하십시오                                                                                                                                                                  |
| `Function tools with reasoning_effort are not supported ...` (400) | `/v1/chat/completions`에 대한 공식 GPT-5.4+ 제한입니다(tools와 명시적인 비-`none` reasoning\_effort는 함께 사용할 수 없음) — 이 페이지의 `/v1/responses` 엔드포인트로 전환하십시오. 마이그레이션 단계는 [엔드포인트 및 마이그레이션](/ko/api-capabilities/openai/responses-migration)을 참조하십시오 |

## 관련 링크

* 이 그룹: [호환 모드](/ko/api-capabilities/openai/compatible) · [엔드포인트 및 마이그레이션](/ko/api-capabilities/openai/responses-migration) · [캐시 과금](/ko/api-capabilities/openai/prompt-caching) · [함수 호출](/ko/api-capabilities/openai/function-calling)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
* OpenAI 마이그레이션 가이드: `developers.openai.com/api/docs/guides/migrate-to-responses`
