> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K2.5 텍스트 생성

> Moonshot AI의 네이티브 멀티모달 플래그십으로, 256K 컨텍스트 윈도우와 Thinking 모드를 제공합니다. APIYI는 알리바바 클라우드 공식 릴레이를 통해 연결되며, 0.88배 그룹 요금과 충전 보너스를 더해 실질 비용을 공식 대비 80% 미만으로 낮춥니다.

Kimi K2.5는 Moonshot AI의 네이티브 멀티모달 플래그십으로, 2026년 1월 27일에 출시되었습니다. 이 모델은 Visual Coding과 자율 Agent Swarm 오케스트레이션에 중점을 두며, 프리미엄 없이 제공되는 256K 컨텍스트 윈도우를 지원합니다. APIYI는 이를 **알리바바 클라우드 공식 릴레이 채널**로 통합하여 프로덕션 등급의 안정성을 제공합니다. 기본 그룹 요율 배수는 **공식 가격의 0.88배**이며, 충전 보너스를 누적 적용하면(\$100 충전 시 → \$10 무료부터) **실질 비용이 공식 가격의 80% 미만**으로 내려갑니다.

<Info>
  **Kimi K2.5는 APIYI에서 이용 가능합니다**: 알리바바 클라우드 공식 릴레이 채널, OpenAI 호환 엔드포인트, 모델 ID `kimi-k2.5`. Kimi의 공식 사이트와 달리, **Thinking mode는 요청 본문에서 `enable_thinking: true`를 통해 명시적으로 활성화해야 합니다** — 기본적으로 모델은 Instant mode로 실행됩니다.
</Info>

## 주요 장점

<CardGroup cols={2}>
  <Card title="256K 컨텍스트" icon="scroll">
    256K tokens 추가 요금 없음 — 중간 규모 코드베이스나 긴 문서 전체를 한 번의 호출에 담을 수 있습니다.
  </Card>

  <Card title="사고 모드" icon="brain">
    `enable_thinking: true`로 심층 추론을 활성화합니다 — 복잡한 계획 수립, 근본 원인 분석, 에이전트를 위해 설계되었습니다.
  </Card>

  <Card title="네이티브 멀티모달 + 시각적 코딩" icon="eye">
    이미지와 코드를 네이티브로 이해합니다 — UI 목업, 스크린샷, 다이어그램을 실행 가능한 코드로 바꾸는 데 탁월합니다.
  </Card>

  <Card title="안정적인 Alibaba Cloud 전송" icon="server">
    Alibaba Cloud의 공식 전송 채널을 통해 라우팅됩니다 — 높은 동시 실행 수에서도 엔터프라이즈급 SLA를 제공합니다.
  </Card>
</CardGroup>

## 모델 정보

| 매개변수              | 값                                           |
| ----------------- | ------------------------------------------- |
| **모델 ID**         | `kimi-k2.5`                                 |
| **컨텍스트 윈도우**      | 256,000 tokens                              |
| **모드**            | 즉시 / Thinking / 에이전트 / 에이전트 스웜              |
| **Thinking 토글**   | 요청 본문의 `enable_thinking: true`(기본값 `false`) |
| **입력**            | 텍스트 + 이미지(네이티브 멀티모달)                        |
| **출력**            | 텍스트                                         |
| **스트리밍**          | ✅ 지원                                        |
| **함수 호출 / 도구 사용** | ✅ 지원                                        |
| **채널**            | Alibaba Cloud 공식 전송                         |

<Warning>
  Kimi의 내장 `$web_search` 도구는 현재 Thinking 모드와 호환되지 않습니다. Moonshot의 안내에 따라 web\_search 도구가 필요할 때는 `enable_thinking`를 비활성화하십시오. 이 제한은 공식 플랫폼과 동일합니다.
</Warning>

## 가격

| 항목        | 공식                 | APIYI 그룹 (0.88×)    | 충전 보너스 포함(대략)        |
| --------- | ------------------ | ------------------- | -------------------- |
| 입력        | \$0.60 / 1M tokens | \$0.528 / 1M tokens | \~\$0.48 / 1M tokens |
| 출력        | \$2.50 / 1M tokens | \$2.20 / 1M tokens  | \~\$2.00 / 1M tokens |
| 캐시 적중(입력) | \$0.10 / 1M tokens | \$0.088 / 1M tokens | —                    |

<Info>
  **가격 참고**: APIYI는 **0.88× 배수**(공식 목록 가격의 88%)를 기본 그룹 요율로 사용합니다. 온보딩 / 대량 충전 보너스를 누적하면(예: \$100 충전 시 \$10 무료 및 그 이상) **실효 비용이 공식가의 80% 미만**으로 내려갑니다. 자세한 내용은 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.
</Info>

## 추론 모드를 활성화하는 방법

Kimi의 공식 사이트와 가장 큰 차이점은 APIYI가 기본적으로 Instant 모드를 사용한다는 점입니다. 요청 본문에서 `enable_thinking`를 통해 Thinking을 명시적으로 활성화해야 합니다:

| 사용 사례                   | `enable_thinking` | 참고                                      |
| ----------------------- | ----------------- | --------------------------------------- |
| 일상 채팅 / 빠른 응답           | `false` (기본값)     | Instant 모드, 지연 시간이 가장 짧음                |
| 복잡한 추론 / 코드 계획 / RCA    | `true`            | Thinking 모드, 추론 trace를 출력함              |
| web\_search를 사용하는 Agent | `false`           | 공식 제한: web\_search와 thinking은 서로 배타적입니다 |

### cURL 예제 (Thinking 활성화)

```bash theme={null}
curl --location 'https://api.apiyi.com/v1/chat/completions' \
  --header "Authorization: Bearer sk-xxxx" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2.5",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "What is 1+1?"
      }
    ],
    "enable_thinking": true
  }'
```

## 호출 방법

### 엔드포인트

```
https://api.apiyi.com/v1/chat/completions
```

### 기본 사용법(즉시 모드)

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "kimi-k2.5",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'user', content: 'Introduce yourself in one sentence.' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 고급 사용법(추론 모드)

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations."}
      ],
      extra_body={
          "enable_thinking": True
      }
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Analyze the time complexity of this code and suggest optimizations.' }
    ],
    // @ts-ignore - custom field
    enable_thinking: true
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 스트리밍

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k2.5",
    messages=[{"role": "user", "content": "Write a short poem about spring."}],
    stream=True,
    extra_body={"enable_thinking": True}
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

## 요청 매개변수

| 이름                | 유형      | 필수  | 비고                               |
| ----------------- | ------- | --- | -------------------------------- |
| `model`           | string  | Yes | `kimi-k2.5` 이어야 합니다              |
| `messages`        | array   | Yes | 대화 메시지                           |
| `enable_thinking` | boolean | No  | Thinking 모드를 활성화합니다; 기본값 `false` |
| `stream`          | boolean | No  | 출력 스트리밍                          |
| `temperature`     | number  | No  | 샘플링 temperature, 0–2             |
| `max_tokens`      | integer | No  | 최대 출력 tokens                     |
| `tools`           | array   | No  | Function / tool 목록               |

## 응답 형식

```json theme={null}
{
  "id": "chatcmpl-xxxxxxxx",
  "object": "chat.completion",
  "created": 1706300000,
  "model": "kimi-k2.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1+1 equals 2."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 12,
    "total_tokens": 36
  }
}
```

## 모범 사례

1. **작업별로 모드를 전환합니다**: 일상적인 채팅과 짧은 생성에는 Instant 모드를 켜 두고, 복잡한 추론, 코드 리뷰, 에이전트 계획에는 `enable_thinking: true`로 설정합니다.
2. **256K 컨텍스트를 활용합니다**: 중간 규모의 저장소, 전체 제품 문서, 긴 회의 기록을 추가 비용 없이 한 번의 호출에 담을 수 있습니다.
3. **멀티모달 비주얼 코딩**: UI 스크린샷 / 디자인 목업을 보내고 K2.5가 한 번에 “읽기 → 계획 → 코딩”하도록 합니다.
4. **절감 효과를 극대화합니다**: \$100+ 충전 보너스와 0.88× 그룹 요율을 함께 사용하면 — 실질 비용이 공식의 80% 아래로 내려갑니다.
5. **web\_search 주의사항에 유의합니다**: Moonshot의 내장 `$web_search` 도구가 필요하면 `enable_thinking`을 비활성화합니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 내 요청에서 추론 모드가 사용되지 않습니까?">
    추론 모드는 기본적으로 꺼져 있습니다. 요청 본문에 `"enable_thinking": true`이 포함되어 있는지 확인하십시오. OpenAI Python SDK에서는 이를 `extra_body` 안에 전달하고, Node.js SDK에서는 최상위 필드로 전달할 수 있습니다.
  </Accordion>

  <Accordion title="APIYI의 Kimi K2.5는 Moonshot의 것과 같은 모델입니까?">
    네 — Alibaba Cloud의 공식 전송 채널을 통해 라우팅되는 동일한 상위 모델입니다. 차이점은 추론 모드가 기본적으로 꺼져 있으며 `enable_thinking`을 통해 사용하도록 설정해야 한다는 점뿐입니다.
  </Accordion>

  <Accordion title="0.88× 그룹 요율은 어떻게 적용됩니까?">
    APIYI 콘솔에서 API token을 만들 때 Kimi K2.5를 포함하는 그룹에 할당하십시오 — 과금에는 자동으로 0.88× 요율 배수가 적용됩니다. 충전 보너스와 함께 사용하면 총 비용이 더 줄어듭니다. [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.
  </Accordion>

  <Accordion title="함수 호출 / 도구 사용을 지원합니까?">
    네. 표준 OpenAI 스타일의 `tools` 정의를 전달하십시오. 공식 `$web_search` 내장 도구는 추론 모드와 상호 배타적이라는 점에 유의하십시오 — 별도의 호출에서 사용하십시오.
  </Accordion>

  <Accordion title="추론 모드에 추가 비용이 듭니까?">
    추론 추적은 output tokens로 계산되며 정상적으로 과금됩니다. 복잡한 작업은 더 많은 output tokens를 생성할 수 있으므로 더 깊은 추론이 필요할 때만 활성화하십시오.
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="API 매뉴얼" icon="book" href="/ko/api-manual">
    완전한 API 사용 가이드
  </Card>

  <Card title="충전 프로모션" icon="gift" href="/ko/faq/recharge-promotions">
    보너스를 중복 적용해 가격을 더 낮출 수 있습니다
  </Card>

  <Card title="모델 정보" icon="list" href="/ko/api-capabilities/model-info">
    사용 가능한 모든 모델과 그룹을 둘러보세요
  </Card>

  <Card title="활용 사례" icon="layers" href="/ko/scenarios">
    클라이언트 통합 안내
  </Card>
</CardGroup>
