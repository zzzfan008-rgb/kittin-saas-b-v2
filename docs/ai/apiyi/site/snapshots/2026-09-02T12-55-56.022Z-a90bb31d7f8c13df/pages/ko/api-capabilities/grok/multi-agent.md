> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 멀티 에이전트 모델 가이드

> grok-4.20-multi-agent-beta-0309 on APIYI, 복잡한 리서치 작업을 위한 병렬 멀티 에이전트 협업이 검증된 실사용 경험입니다 — 내부 에이전트 트래픽이 모두 과금된다는 중요한 설명이 포함됩니다.

`grok-4.20-multi-agent-beta-0309`은 xAI의 다중 에이전트 협업 모델입니다. 단일 요청이 내부적으로 **여러 에이전트를 병렬로 실행**하며, 모델은 이를 Oppie라는 “협업형 AI 팀 리더”라고 부릅니다. 이후 리드 에이전트가 최종 답변을 종합합니다. 복잡한 리서치와 다각도 비교 분석에 적합합니다. APIYI에서 표준 OpenAI 호환 형식으로 제공됩니다.

## 과금 프로필(먼저 읽어 보십시오)

<Warning>
  **모든 내부 에이전트 트래픽은 청구서에 포함됩니다.** 이는 일반 모델과의 가장 큰 차이입니다:

  * 측정된 약 40 tokens의 일반 prompt가 실제로는 **39,263 prompt tokens + 9,997 completion tokens**로 청구됩니다(모든 내부 멀티 에이전트 왕복을 포함함)
  * 가장 단순한 한 줄 요청에도 약 **3,900 prompt tokens**의 고정 오버헤드가 붙습니다
  * 단가는 grok-4.3과 같지만(\$1.25 / \$2.50 per 1M tokens), **한 번의 요청 비용이 일반 모델보다 수십 배 더 높아질 수 있습니다**

  간단한 작업에는 이 모델을 사용하지 마십시오 — 일반 Q\&A에는 `grok-4.3` 또는 `grok-4.20-0309-reasoning`를 사용하십시오.
</Warning>

좋은 소식은 내부 트래픽의 캐시 적중률이 높다는 점입니다(측정된 39K prompt tokens 중 26.8K가 할인된 캐시 요율을 적용받았습니다. 이는 한 요청의 적중 횟수가 아니라 여러 내부 호출 전체의 합계입니다). 따라서 실제 비용은 단순한 token 수 변환보다 낮게 나오지만, 그래도 일반 모델보다 훨씬 높습니다. 캐싱 자체의 동작 방식은 [Grok 캐시 과금 가이드](/ko/api-capabilities/grok/prompt-caching)를 참고하십시오.

## 호출 방법

다른 어떤 모델과도 동일합니다 — `model` 필드만 다릅니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.chat.completions.create(
    model="grok-4.20-multi-agent-beta-0309",
    messages=[{
        "role": "user",
        "content": "Compare Rust and Go for building highly concurrent network services: 3 points each, then a one-line verdict"
    }],
)
print(resp.choices[0].message.content)
print("Billed tokens:", resp.usage.total_tokens)
```

다중 에이전트 오케스트레이션은 **완전히 서버 측**입니다 — 추가 매개변수는 없습니다. 스트리밍과 구조화된 출력(`json_schema`)도 정상 작동함이 확인되었습니다.

## 측정된 특성 (2026-07-13)

| 항목               | 측정값                                  |
| ---------------- | ------------------------------------ |
| 중간 복잡도 작업 지연 시간  | \~29 s                               |
| 간단한 질의응답 지연 시간   | \~5 s                                |
| 간단한 질의응답 고정 오버헤드 | \~3,900 prompt tokens                |
| 중간 작업 token 소모량  | \~39K prompt + \~10K completion      |
| 내부 캐시 적중         | 할인된 캐시 요율의 prompt tokens 중 약 2/3     |
| 추론 과정 노출         | 노출되지 않음(`reasoning_tokens`은 여전히 과금됨) |

## 언제 사용해야 하는가

<CardGroup cols={2}>
  <Card title="적합함" icon="check">
    여러 관점의 심층 비교 분석, 복잡한 연구 질문, 서로의 결과를 교차 검증하는 여러 사고 흐름이 도움이 되는 개방형 작업 — 병렬 에이전트 탐색은 답변의 완성도를 의미 있게 높입니다.
  </Card>

  <Card title="부적합함" icon="ban">
    일상적인 Q\&A, 번역, 요약, 코드 완성 — 출력 품질은 일반 모델과 비슷하지만 비용은 수십 배로 증가하는 단일 경로 작업입니다. 이러한 작업에는 grok-4.3 / grok-4.5를 사용하십시오.
  </Card>
</CardGroup>

<Tip>
  실제로 사용하기 전에, 몇 가지 실제 작업에서 `grok-4.20-0309-reasoning`와 다중 에이전트 모델의 출력 품질을 비교한 다음, 품질 차이가 과금 증폭을 정당화하는지 판단하십시오 — 대부분의 시나리오에서는 추론 버전이면 충분합니다.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="왜 모델이 스스로를 Oppie라고 부르나요?">
    이는 모델의 기본 내장 페르소나(멀티 에이전트 팀의 리더 역할)입니다. 전혀 정상입니다. 요청과 응답의 `model` 필드를 통해 모델 신원을 확인하시면 됩니다.
  </Accordion>

  <Accordion title="내부 에이전트 수를 제어할 수 있나요?">
    아닙니다. 멀티 에이전트 오케스트레이션은 xAI의 서버 내부에서 이루어지며, 제어 매개변수는 노출되지 않습니다.
  </Accordion>

  <Accordion title="특별한 max_tokens 설정이 있나요?">
    넉넉하게 설정하십시오(예: 8192). 모델의 내부 추론은 token을 많이 소모하며, 예산이 너무 작으면 최종 답변이 쉽게 잘립니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Grok 개요" icon="rocket" href="/ko/api-capabilities/grok/overview">
    전체 모델 라인업과 가격
  </Card>

  <Card title="채팅 및 추론" icon="message-square" href="/ko/api-capabilities/grok/chat">
    일반 모델의 chain-of-thought 및 과금
  </Card>
</CardGroup>
