> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo 텍스트 생성

> ByteDance Seed 2.1 Turbo는 프로덕션급 텍스트 모델입니다: 256K 컨텍스트, 제어 가능한 딥 씽킹, 2단 캐싱. APIYI는 Chat Completions 및 Responses 엔드포인트를 모두 제공하며, 1M tokens당 입력 $0.50 / 출력 $2.50입니다.

Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`)는 2026년 6월 23일 바이트댄스의 Seed 팀이 출시한 프로덕션급 텍스트 모델입니다(BytePlus 제품명: Dola-Seed-2.1-turbo). 이 모델은 높은 요청량을 처리하는 저비용, 저지연 엔터프라이즈 워크로드를 대상으로 하며, 제품군 기준 256K 컨텍스트 윈도우를 제공합니다. APIYI는 **두 엔드포인트를 모두 완전히 검증했습니다**(15/15 테스트 케이스 통과) — Chat Completions와 Responses를 모두 호출할 준비가 되어 있습니다.

<Info>
  **Seed 2.1 Turbo가 APIYI에 제공됩니다**: 모델명 `dola-seed-2-1-turbo-260628`이며, `default` / `svip` 그룹에서 사용할 수 있습니다. 이 모델은 대부분의 모델과 구분되는 점이 하나 있습니다 — **심층 추론이 기본값으로 켜져 있습니다**. 지연 시간이나 비용에 민감한 호출의 경우, `thinking: {"type": "disabled"}`를 명시적으로 전달하십시오(아래의 "심층 추론 제어"를 참조하십시오).
</Info>

## 핵심 강점

<CardGroup cols={2}>
  <Card title="프로덕션급 가격" icon="circle-dollar-sign">
    \$0.50 입력 / \$2.50 출력, 1M tokens당 — 동세대 Seed 2.1 Pro의 절반 가격으로, 고빈도 호출에 맞게 설계되었습니다.
  </Card>

  <Card title="두 개의 네이티브 엔드포인트" icon="git-fork">
    Chat Completions와 Responses를 모두 네이티브로 지원합니다. 이벤트 스트림, 추론 항목, 그리고 멀티턴 previous\_response\_id가 Responses 쪽에서 모두 작동합니다.
  </Card>

  <Card title="제어 가능한 심층 추론" icon="brain">
    추론 스위치와 reasoning\_effort 단계(low와 high는 측정된 추론 token 수가 4배 차이입니다)가 작업별로 추론 예산을 조정할 수 있게 해줍니다.
  </Card>

  <Card title="2단계 캐싱" icon="database-zap">
    암묵적 캐시 적중은 2번째 요청부터 자동으로 발생합니다. Responses에서 연쇄 호출과 함께 사용하는 명시적 캐싱은 전체 이전 컨텍스트를 적중하며 지연 시간을 대략 절반으로 줄입니다.
  </Card>
</CardGroup>

## 모델 정보

| Parameter         | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| **Model name**    | `dola-seed-2-1-turbo-260628`                                     |
| **출시일**           | 2026년 6월 23일 (ByteDance Seed 팀)                                  |
| **컨텍스트 윈도우**      | 256K (계열 기준)                                                     |
| **사용 가능한 그룹**     | `default`, `svip`                                                |
| **엔드포인트**         | `POST /v1/chat/completions`, `POST /v1/responses`                |
| **심층 추론**         | 기본값은 ON이며; `thinking.type`로 전환하고, `reasoning_effort`로 등급을 지정합니다. |
| **스트리밍**          | ✅ 두 엔드포인트 모두                                                     |
| **함수 호출 / 도구 사용** | ✅ 두 엔드포인트 모두                                                     |

## 검증된 기능 매트릭스

2026년 7월 21일 기준 APIYI의 측정 결과(공식 주장 대비 실제 동작):

| 기능                            | 공식 주장   | Chat Completions              | 응답                                |
| ----------------------------- | ------- | ----------------------------- | --------------------------------- |
| 기본 채팅(non-stream / stream)    | ✅       | ✅ / ✅                         | ✅ / ✅ (전체 이벤트 stream)             |
| 구조화된 출력(json\_schema, strict) | ✅       | ✅                             | ✅ (`text.format`)                 |
| 추론 스위치 `thinking.type`        | ✅       | ✅ 토글이 작동함                     | 기본적으로 reasoning items             |
| 추론 단계 `reasoning_effort`      | ✅       | ✅ low/high 측정값 226/960 tokens | ✅ low/high 측정값 371/1317 tokens    |
| 함수 호출(2턴 루프)                  | ✅       | ✅                             | ✅                                 |
| 암시적 캐싱                        | ✅       | ✅ 2번째 요청에서 적중                 | ✅ 2번째 요청에서 적중                     |
| 명시적 캐싱                        | ✅ (응답만) | —                             | ✅ `previous_response_id` 체이닝이 필요함 |
| 멀티턴 `previous_response_id`    | —       | —                             | ✅                                 |
| MCP                           | ✅ (응답만) | —                             | 공식적으로 지원되지만, 아직 저희가 검증하지 못했습니다    |
| 웹 검색 / 지식 베이스 / 파인튜닝 / 배치     | ❌       | —                             | —                                 |

## 요금

| 항목 | APIYI 가격           |
| -- | ------------------ |
| 입력 | \$0.50 / 1M tokens |
| 출력 | \$2.50 / 1M tokens |

<Info>
  **과금 참고**: 추론 콘텐츠는 일반 출력 tokens으로 과금됩니다 — 바로 그렇기 때문에 작업별로 사고 깊이를 예산에 반영해야 합니다. 충전 보너스는 실효 비용을 더 낮춰 주므로, [충전 프로모션](/ko/faq/recharge-promotions)을 참고하십시오.
</Info>

## 심층 추론 제어

**이 모델에서 가장 중요한 사항은 이것입니다**: 심층 추론은 기본적으로 켜져 있으므로, 한 줄짜리 질문도 먼저 수백 개의 추론 토큰을 생성합니다. 저희 테스트에서는 한 문장짜리 자기소개가 출력 토큰 444개(그중 409개는 추론) 를 사용했고, 비스트리밍에서는 7\~19초가 걸렸습니다.

<Warning>
  지연 시간이나 비용에 민감한 워크로드(지원 봇, 고빈도 짧은 Q\&A, 배치 작업)에서는 `"thinking": {"type": "disabled"}`를 명시적으로 전달합니다. 측정 결과: reasoning 토큰이 0으로 떨어지고 응답 속도가 크게 빨라집니다.
</Warning>

### 세 가지 사고 단계, 측정값 기준

| 설정                               | Reasoning 토큰(측정값)         | 적합한 용도                  |
| -------------------------------- | ------------------------- | ----------------------- |
| `thinking: {"type": "disabled"}` | 0                         | 고빈도 짧은 Q\&A, 비용에 민감한 호출 |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371  | 일반적인 추론 작업              |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317 | 복잡한 계획, 수학, 코드 분석       |

<Tip>
  **`max_output_tokens` 여유를 두십시오**: reasoning은 출력 예산에 포함됩니다. Responses에서는 예산이 작으면 사고에 의해 전부 소진되어 호출이 `status: "incomplete"` (`reason: length`)와 함께 **빈 텍스트**를 반환합니다. 출력이 없는 것처럼 보이지만, 실제로는 예산 문제입니다. 1500부터 시작하고, 상위 단계에서는 4000+를 사용하십시오.
</Tip>

## 캐싱으로 비용 절감하기

모델은 서로 다른 메커니즘을 가진 두 가지 캐싱 계층을 지원합니다. 서로 혼동하지 마십시오.

### 암묵적 캐싱(자동, 두 엔드포인트 모두)

추가 매개변수는 필요하지 않습니다. 반복되는 긴 접두사(예: 고정된 system prompt)는 2번째 요청부터 자동으로 캐시에 적중합니다. 측정 결과, 약 2,600 token의 system prompt를 사용했을 때 2번째와 3번째 요청에서 2,360 `cached_tokens`가 보고되었습니다. 캐시 적중 여부는 `usage.prompt_tokens_details.cached_tokens`(Chat) 또는 `usage.input_tokens_details.cached_tokens`(Responses)에서 확인하십시오.

### 명시적 캐싱(Responses 전용, 체인 필요)

명시적 캐싱을 사용하는 올바른 방법은 `caching: {"type": "enabled"}`를 **`previous_response_id` 체인과 함께 사용하는 것**입니다. 2번째 턴이 이전 response id를 전달하면 이전 컨텍스트 전체가 캐시에 적중합니다(측정 결과: 7,873 token이 완전히 캐시되었고, 지연 시간은 8초에서 4초로 감소했습니다).

<Warning>
  **체인 없이 활성화하면 두 측면 모두에서 손해입니다**: `caching.enabled`를 설정했지만 `previous_response_id`가 없으면, 같은 접두사를 반복해도 매번 `cached_tokens`가 0으로만 나옵니다. 그리고 암묵적 접두사 캐시도 더 이상 적용되지 않습니다. 캐싱 매개변수를 생략하고 암묵적 캐싱에 의존하거나, 이를 활성화한 뒤 반드시 체인으로 연결하십시오.
</Warning>

## 코드 예제

### 채팅 컴플리션

<CodeGroup>
  ```bash cURL (추론 끔, 빠른 응답) theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
      ],
      "max_tokens": 500,
      "thinking": {"type": "disabled"}
    }'
  ```

  ```python 파이썬 (단계별 추론) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="dola-seed-2-1-turbo-260628",
      messages=[
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations"}
      ],
      max_tokens=3000,
      reasoning_effort="high",  # low / medium / high
  )

  msg = response.choices[0].message
  print(msg.content)
  # Reasoning text is in msg.reasoning_content (via model_extra with the OpenAI SDK)
  ```

  ```javascript 자바스크립트 (streaming) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'dola-seed-2-1-turbo-260628',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    max_tokens: 1500,
    stream: true,
    stream_options: { include_usage: true }
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

### 응답 (기본 다중 턴 + 명시적 캐싱)

<CodeGroup>
  ```bash cURL (기본 호출) theme={null}
  curl -X POST "https://api.apiyi.com/v1/responses" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "input": "Introduce yourself in one sentence",
      "max_output_tokens": 1500
    }'
  ```

  ```python 파이썬 (명시적 캐싱이 있는 연쇄 호출) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  # Turn 1: enable explicit caching
  r1 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input=[
          {"role": "system", "content": "A long, fixed background document goes here..."},
          {"role": "user", "content": "First question"},
      ],
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}, "store": True},
  )
  print(r1.output_text)

  # Turn 2: carry the previous id - the whole prior context hits the cache (~2x faster measured)
  r2 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input="Second question",
      previous_response_id=r1.id,
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}},
  )
  print(r2.output_text)
  print(r2.usage.input_tokens_details.cached_tokens)  # cache hits
  ```
</CodeGroup>

## 모범 사례

1. **Thinking을 기본값으로 끄고, 예외적으로 켭니다**: `thinking: {"type": "disabled"}`을 기본 설정으로 두고, 정말로 복잡한 작업에만 `reasoning_effort` 티어로 전환하십시오. 단순한 질문에 대해 생각 비용을 지불하지 마십시오.
2. **`max_output_tokens` 여유분을 확보합니다**: thinking을 켠 경우 3000+, 높은 티어에서는 4000+로 설정하여 reasoning이 실제 답변을 압박하지 않도록 하십시오.
3. **고정 system prompt를 먼저 배치합니다**: 암시적 캐싱은 접두사로 일치합니다. 변경되지 않는 부분을 앞에 두면 2번째 요청부터 자동으로 비용을 절감할 수 있습니다.
4. **멀티턴에는 Responses 체이닝을 사용합니다**: `previous_response_id`은 history를 다시 전송하지 않으며, 명시적 캐싱과 함께 사용하면 장문 컨텍스트 대화에서 비용과 지연 시간을 모두 줄입니다.
5. **오류 로직에서 503을 처리합니다**: 잘못 철자된 model 이름이나 누락된 group 권한은 503(사용 가능한 채널 없음)을 반환하며, OpenAI의 관례적인 404를 반환하지 않습니다. 재시도 로직의 기준을 404로 두지 마십시오.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 간단한 질문은 느리고 token을 많이 소모합니까?">
    기본적으로 **심층 추론이 켜져 있기 때문입니다**. 한 줄짜리 질문도 먼저 수백 개의 reasoning token(측정값 약 400개)을 생성합니다 — 느리고 비용도 큽니다. 요청 본문에 `"thinking": {"type": "disabled"}`를 추가하면, 측정되는 reasoning token이 0으로 떨어집니다.
  </Accordion>

  <Accordion title="Responses가 빈 텍스트와 함께 incomplete로 반환됩니다 - 무슨 일이 있었습니까?">
    `max_output_tokens`가 너무 작아서 추론이 전체 예산을 소진했습니다(`incomplete_details.reason`가 `length`입니다). 예산을 1500 이상으로 올리거나 추론 등급을 비활성화하거나 낮추십시오.
  </Accordion>

  <Accordion title="Chat Completions 아니면 Responses - 어느 쪽입니까?">
    단일 턴 또는 직접 관리하는 기록(가장 폭넓은 생태계 호환성)에는 Chat Completions를 사용하십시오. 다중 턴 대화, 명시적 캐싱, 또는 MCP 도구에는 Responses를 사용하십시오 — 명시적 캐싱과 MCP는 Responses에서만 지원됩니다.
  </Accordion>

  <Accordion title="명시적 캐싱이 활성화되어 있지만 cached_tokens가 계속 0입니다 - 왜 그렇습니까?">
    명시적 캐싱은 **체이닝**을 요구합니다: 2턴부터는 이전 턴의 `previous_response_id`을 전달해야 합니다. `caching.enabled`와 함께 독립적으로 반복된 요청은 절대 캐시 적중하지 않으며, 암묵적 prefix 캐시도 더 이상 적용되지 않습니다. 체이닝이 앱에 맞지 않으면 caching 매개변수를 제거하고 암묵적 캐싱에 의존하십시오.
  </Accordion>

  <Accordion title="MCP가 지원됩니까?">
    공식 기능표에는 Responses API에서의 MCP 지원이 명시되어 있습니다. APIYI의 테스트 라운드는 MCP를 다루지 않았습니다(외부 MCP 서버가 필요합니다) — 운영 전에 낮은 트래픽으로 검증하십시오.
  </Accordion>

  <Accordion title="503을 받았습니다 - 서비스가 중단되었습니까?">
    먼저 model 이름 철자를 확인하십시오. 이 model은 알 수 없는 model 이름에 대해 404 대신 503("no available channels")을 반환합니다. 이름이 올바른데도 503이 계속되면 그룹 권한을 확인하십시오(이 model은 `default` 또는 `svip`가 필요합니다) 또는 지원팀에 문의하십시오.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="Chat 플레이그라운드" icon="terminal" href="/ko/api-capabilities/dola-seed-2-1-turbo/chat-completions">
    Chat Completions 엔드포인트를 대화형으로 디버그합니다
  </Card>

  <Card title="Responses 플레이그라운드" icon="messages-square" href="/ko/api-capabilities/dola-seed-2-1-turbo/responses">
    Responses 엔드포인트를 대화형으로 디버그합니다
  </Card>

  <Card title="모델 정보" icon="list" href="/ko/api-capabilities/model-info">
    사용 가능한 모든 모델과 그룹을 살펴봅니다
  </Card>

  <Card title="API 매뉴얼" icon="book" href="/ko/api-manual">
    완전한 API 사용 가이드입니다
  </Card>
</CardGroup>
