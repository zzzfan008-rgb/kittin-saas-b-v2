> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 프롬프트 캐싱 과금 가이드

> Grok 캐싱은 자동이며 쓰기 요금이 없습니다: 캐시된 입력은 0.25배로 과금됩니다. 128 token 블록 단위의 그레뉼러리티, 캐시 적중을 위한 요청 작성 방법, cached_tokens를 읽는 방법, 그리고 긴 대화가 responses 체인에 속하는 이유를 설명합니다.

Grok에서 에이전트, 긴 시스템 prompt 또는 멀티턴 대화를 실행할 때 프롬프트 캐싱은 입력의 **캐시된 부분**에 대해 **0.25×**(75% 절감)만 과금되며, 캐싱이 완전히 자동이므로 **코드 변경은 필요하지 않습니다**.

기대치를 미리 설정해 두십시오. xAI는 캐시 항목이 메모리 압박을 받거나, 재시작이 발생하거나, 요청이 다른 서버에 도착할 때 제거될 수 있다고 명시하고 있으므로 **히트가 보장되지는 않습니다**. 캐시 할인은 있으면 좋은 수준으로 받아들이고, **캐시 미적용 가격 기준으로 예산을 잡으십시오**.

이 페이지는 xAI의 공식 문서(`docs.x.ai/developers/advanced-api-usage/prompt-caching`)를 따르며, **2026-08-19에 APIYI 게이트웨이에서 `grok-4.6`에 대한 실측 테스트**(124건의 호출, 백엔드 과금 기록과 행 단위로 대조)를 바탕으로 작성되었습니다.

## 한 문장으로

요청의 **앞부분(접두사)** 이 최근 요청과 바이트 단위로 완전히 일치할 때마다, 상위 시스템은 중복 작업을 건너뜁니다. 일치한 부분은 \*\*0.25×\*\*로 과금됩니다. 매개변수도 없고, 마커도 없습니다.

다른 두 방식과의 차이점은 다음과 같습니다.

* **Claude와 비교하면**: `cache_control` 마커가 없습니다. 조건이 충족되면 그냥 그렇게 동작합니다
* **OpenAI와 비교하면**: 설정 방식은 똑같이 자동이고 작성도 똑같이 자유롭지만, Grok에는 `prompt_cache_key`-스타일의 라우팅 제어가 없습니다

## 굳이 따질 이유 — 배수를 보시면 됩니다

모델의 원본 입력 token 가격을 \*\*1×\*\*로 두면:

| 유형            | 가격          | 비고                   |
| ------------- | ----------- | -------------------- |
| 일반 입력         | **1×**      | 캐시를 놓친 모든 경우, 정가 적용  |
| 캐시 쓰기         | **0× (무료)** | 자동으로 발생하며, 비용이 들지 않음 |
| **Cache hit** | **0.25×**   | 캐시된 부분은 75% 저렴함      |

**손익분기점: 두 번째 요청입니다.** 상각할 쓰기 요금이 없으므로, 접두부가 처음 재사용되는 순간부터 절감되는 금액은 전부 순이익입니다.

`grok-4.6`에 대한 달러 기준 금액입니다(1M tokens당, 두 컨텍스트 구간 모두):

| 구간          | 일반 입력  | Cache hit  |
| ----------- | ------ | ---------- |
| 0 – 200K    | \$2.00 | **\$0.50** |
| 200K – 512K | \$4.00 | **\$1.00** |

다른 Grok 모델의 구간 경계와 캐시 읽기 요율은 [Grok 개요의 단계별 가격 표](/ko/api-capabilities/grok/overview)에 있습니다.

### 적합한 경우

* 하나의 긴 시스템 prompt와 도구 정의를 계속해서 반복 호출하는 경우(에이전트, 지원 봇)
* 하나의 문서를 대상으로 한 일괄 작업(한 계약서에 대해 50개 질문)
* 안정적인 문서 청크가 prompt 앞부분에 위치하는 RAG
* 멀티턴 대화 — 다만 Grok에서는 이를 구현하는 두 가지 방식이 매우 다르게 동작하므로(아래 참고) 주의해야 합니다

### 부적합한 경우

* 매번 맨 처음 문자부터 서로 다른 요청
* 천 token 범위보다 **작은 prompt** — 테스트에서는 이런 요청을 반복 호출해도 재사용 가능한 캐시가 전혀 생성되지 않았습니다

## 양쪽 엔드포인트, 스트리밍과 비스트리밍 모두 대조 완료

`/v1/chat/completions` 및 `/v1/responses`, 각각 스트리밍과 비스트리밍: **2026-08-19에 백엔드 과금 기록과 대조하여 네 가지 조합 모두를 정산했으며**, 캐시된 부분은 모든 경우에 캐시 요율로 과금되었습니다.

|                        | 비스트리밍 | 스트리밍  |
| ---------------------- | ----- | ----- |
| `/v1/chat/completions` | 대조 완료 | 대조 완료 |
| `/v1/responses`        | 대조 완료 | 대조 완료 |

<Info>
  **게이트웨이에는 클라이언트 측 적응이 필요하지 않습니다.** 캐시 동작은 업스트림으로 그대로 전달되며, `cached_tokens`는 원문 그대로 되돌려지고, 백엔드 과금 내역에는 캐시된 부분이 별도의 "cache read" 항목으로 표시됩니다.
</Info>

## 적중 조건

| 조건       | 요구사항                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 트리거 방식   | **완전 자동** — 매개변수도 없고, 마커도 없습니다                                               |
| 일치 시작 위치 | `messages` 배열의 **처음**부터 바이트 단위로                                              |
| 추가만 허용   | 이전 메시지를 수정, 삭제, 재정렬하면 캐시가 무효화됩니다. **끝에 추가하는 것은 무효화되지 않습니다**                  |
| 블록 단위    | **128 tokens**(아래 참고)                                                        |
| 길이       | 공식적인 최소값은 공개되지 않았습니다. 테스트에서는 천 token 미만의 prompt로는 재사용 가능한 캐시가 절대 만들어지지 않았습니다 |
| 시간 창     | 언제든지 공식적으로 제거될 수 있습니다 — **간격이 짧을수록 더 안정적입니다**                                |

### 적중은 128 tokens 단위로 내림됩니다

```text theme={null}
cached_tokens = floor(matched prefix length / 128) * 128
```

두 차례의 테스트가 일치합니다. 8802-token 접두사는 8704 (= 68 × 128)에 적중했고, 더 이른 차례의 2735-token 접두사는 2688 (= 21 × 128)에 적중했습니다. **따라서 `cached_tokens`는 보통 안정적인 접두사보다 약간 더 작습니다 — 이는 예상되는 현상입니다.**

### 추가만 허용: 편집 기록은 이를 깨뜨립니다

같은 접두사를 연속으로 보냈을 때, 한 번의 호출만 변경한 경우입니다:

| 작업                   | `cached_tokens` |
| -------------------- | --------------- |
| 변경 없음                | 8704            |
| **접두사의 첫 번째 문자를 변경** | 128(사실상 미스)     |
| **접두사 끝에 한 줄 추가**    | 8704(영향 없음)     |
| 원래 접두사를 다시 전송        | 8704            |

**실무적으로 이는 다음을 의미합니다. 안정적인 콘텐츠를 먼저 두고, 변동적인 콘텐츠를 마지막에 두어야 합니다.**

```python theme={null}
# WRONG: dynamic content at the start of system, so the prefix changes every time and never hits
messages = [
    {"role": "system", "content": f"Current time {datetime.now()}. You are an assistant." + LONG_INSTRUCTIONS},
    {"role": "user", "content": question},
]

# RIGHT: long instructions and tool definitions stay stable up front, dynamic content goes in the user message
messages = [
    {"role": "system", "content": LONG_INSTRUCTIONS},          # stable, will hit
    {"role": "user", "content": f"Current time {datetime.now()}. {question}"},  # volatile, goes last
]
```

## 최소 실행 예제

서로 다른 질문과 함께 같은 긴 접두사를 두 번 보내십시오. 첫 번째는 캐시에 기록하고, 두 번째는 캐시 적중이 발생합니다.

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# The prefix has to be long enough: below the thousand-token range you get essentially nothing
LONG_SYSTEM = open("long_instructions.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="grok-4.6",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("Summarize the key points", "call 1")   # cold start: cached is 0 or a tiny value
ask("Give me 3 keywords", "call 2")         # expect cached close to the prefix length
```

예상 출력:

```text theme={null}
[call 1] input=8804 cached=128
[call 2] input=8804 cached=8704
```

두 번째 호출에서는 `cached`가 system prompt 길이에 거의 도달하며(128로 내림), 해당 부분은 0.25×로 과금됩니다.

<Info>
  `/v1/responses` 엔드포인트는 자동으로 동일하게 작동하며, 필드는 `usage.input_tokens_details.cached_tokens`입니다. **해당 엔드포인트에서는 긴 대화가 추가 이점을 얻습니다** — 아래의 「긴 대화는 responses 체인에 속합니다」를 참조하십시오.
</Info>

## 적중과 미스를 구분하기 — 사용량 필드를 읽는 방법

| 엔드포인트                  | 적중 필드                                       |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

### 읽는 방법: 작은 값은 적중이 아닙니다

단순히 “0보다 큰지”만 확인하지 마십시오. **`cached_tokens`를 안정적인 접두사 길이와 비교하십시오:**

| `cached_tokens`                   | 판독                |
| --------------------------------- | ----------------- |
| `0`                               | 미스                |
| 접두사의 아주 작은 일부(수십, 또는 백 단위 한두 개)   | **역시 미스로 간주하십시오** |
| 수천 단위로, 접두사 길이를 128로 내림한 값에 가까울 때 | 실제 적중             |

테스트에서는 콜드 상태의 첫 호출조차 때때로 100\~200 수준의 값을 되돌려줍니다. 속지 마십시오 — 그렇다고 해서 접두사가 캐시되었다는 뜻은 아닙니다.

### 대조하기: 콘솔의 캐시 과금 세부 정보

단일 호출에 대한 백엔드 로그는 **캐시 읽기 token 수와 그 요율 배수를 별도 행으로** 나열하며, 이를 응답의 `cached_tokens`과 대조할 수 있습니다. 한 번의 호출이 정확히 어떻게 과금되었는지 알아야 할 때는 그것이 가장 신뢰할 수 있는 기준입니다.

3단계 자체 점검:

1. 안정적인 접두사를 1000 token 이상으로 구성한 뒤 요청 2개를 연달아 보내십시오
2. 두 번째 응답에는 `cached_tokens`가 수천 단위로 분명하게 보여야 합니다
3. 백엔드 [호출 로그](/ko/faq/call-logs)에서 해당 요청에는 “캐시 읽기” 항목이 표시되고, 첫 번째보다 입력 비용이 눈에 띄게 낮아집니다

## 히트율 향상

### 안정적인 Prefix를 설계하십시오

* 긴 지침, few-shot 예시, 도구 정의를 먼저 배치하고, 사용자 입력과 타임스탬프는 마지막에 둡니다
* 도구 정의의 순서와 JSON 직렬화를 고정하십시오(직렬화기가 키를 섞지 않도록 하십시오)
* 이미지 입력도 prefix 일치에 포함됩니다 — 하나를 재사용할 때는 base64 / URL과 매개변수를 동일하게 유지하십시오
* **같은 prefix를 짧은 시간에 몰아서 재사용하십시오**; 호출을 넓게 흩어 놓지 마십시오

방법론은 OpenAI의 것과 같습니다. 자세한 버전은 [OpenAI prompt caching 가이드](/ko/api-capabilities/openai/prompt-caching)를 참조하십시오.

### 긴 대화는 Responses 체인에 두어야 합니다

이것은 Grok에서 쉽게 놓치는 차이입니다:

| 접근 방식                                   | 테스트 결과                                                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/v1/chat/completions`, 턴을 덧붙이는 방식      | 5턴 동안 prompt가 8.8K에서 10K로 커졌지만, `cached_tokens`는 원래의 정적 prefix 크기에 그대로 머물렀습니다 — 각 턴의 새로운 질의응답은 재사용 가능해지지 않았습니다 |
| `/v1/responses`와 `previous_response_id` | 히트는 각 턴마다 증가했습니다(측정값: 2턴 8704 → 3턴 9344)                                                                       |

따라서 긴 대화와 다단계 에이전트에는 Responses API 체인을 선호하십시오:

```python theme={null}
r1 = client.responses.create(
    model="grok-4.6",
    input=[{"role": "system", "content": LONG_SYSTEM},
           {"role": "user", "content": "First question"}],
    store=True,
)

r2 = client.responses.create(
    model="grok-4.6",
    previous_response_id=r1.id,          # send only the new turn; the upstream carries the history
    input=[{"role": "user", "content": "Follow-up"}],
    store=True,
)
print(r2.usage.input_tokens_details.cached_tokens)
```

엔드포인트 차이는 [Grok 개요 페이지의 엔드포인트 개요](/ko/api-capabilities/grok/overview)에서 다룹니다.

### `x-grok-conv-id`에 관하여

xAI의 모범 사례에서는 히트율을 높이기 위해 모든 요청에 `x-grok-conv-id` 헤더(UUID 또는 세션 ID)를 보내라고 권장합니다. APIYI에서 대칭 A/B를 수행했으며 — 헤더가 있는 여러 독립적인 prefix와 없는 여러 독립적인 prefix를 각각 여러 번 재사용했지만 — **두 그룹 사이에서 관찰 가능한 차이는 없었습니다**. 보내도 해롭지는 않지만, 히트율은 기대하지 마십시오.

## 적중률과 예상할 점

<Warning>
  **캐시 적중은 보장되지 않습니다.** xAI의 문서에서는 항목이 메모리 압박, 서비스 재시작, 또는 요청이 다른 서버로 라우팅되는 경우 손실될 수 있다고 명시합니다.

  테스트에서는 안정적인 접두사가 짧은 시간에 집중적으로 재사용될 때 대부분의 요청이 적중했지만, 실제 지터가 있으며 이는 업스트림에서 발생합니다 — 호출자 측에서는 이를 제어할 수 없습니다. **캐시 미적용 가격을 기준으로 예산을 잡고 적중은 보너스로 취급하십시오.**
</Warning>

분명히 말씀드릴 점이 하나 더 있습니다: **캐싱의 가치는 속도가 아니라 비용입니다.** 측정된 첫 토큰까지의 시간은 적중과 미적중 사이에서 불과 수백 밀리초 정도만 차이났습니다 — 캐싱이 긴 컨텍스트 요청을 빠르게 만들어줄 것이라고 기대하지 마십시오.

## 흔한 함정

| 증상                                        | 원인                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `cached_tokens`는 항상 0이거나 항상 매우 작습니다       | prompt가 너무 짧음(천 token 범위 미만) / 타임스탬프, UUID, 또는 랜덤 ID가 프리픽스 시작 부분에 있음 |
| 적중이 들쑥날쑥합니다                               | 상위 축출 — 예상되는 현상입니다; 재사용 간격을 줄이고 배치 작업은 한 번에 몰아서 전송하십시오               |
| 적중 길이가 프리픽스보다 짧습니다                        | 128 token으로 내림 처리됨; 정상입니다                                            |
| `cached_tokens`가 다중 턴 대화에서 더 이상 늘어나지 않습니다 | chat/completions는 원래의 정적 프리픽스만 재사용합니다 — 긴 대화는 responses 체인으로 옮기십시오   |
| 이전 메시지를 수정하니 적중이 사라졌습니다                   | 캐시는 추가 전용입니다: 기록을 수정, 삭제, 재정렬하면 무효화됩니다                               |
| 모델을 전환한 뒤 적중이 없습니다                        | 캐시는 모델별로 격리됩니다 — `grok-4.6`와 `grok-4.5`는 공유하지 않습니다                   |

## 다른 채널과의 간단한 비교

|           | Grok                                                  | OpenAI          | Gemini                        | Claude                    |
| --------- | ----------------------------------------------------- | --------------- | ----------------------------- | ------------------------- |
| 트리거 방식    | **자동**                                                | **자동**          | 암묵적, 자동                       | 수동 `cache_control`        |
| 쓰기 요금     | **무료**                                                | **무료**          | 무료                            | 1.25× / 2×                |
| 캐시 적중 요금  | 0.25×                                                 | 0.1×            | Google에 따르면 최대 90% 할인         | 0.1×                      |
| 최소 크기     | 공개되지 않았습니다. 테스트에서는 \~1K tokens 미만에서는 아무 것도 캐시되지 않았습니다 | 1024 tokens     | 4096 (3 시리즈) / 2048 (2.5 시리즈) | 1024–4096                 |
| 블록 단위     | 128 tokens                                            | 128 tokens      | —                             | —                         |
| 캐시 적중 안정성 | 캐시 적중은 결정적이지만, 상위 서비스는 보장을 제공하지 않습니다                  | 안정적입니다          | 보장되지 않으며, 실제 사용에서는 보통 수준입니다   | 안정적입니다                    |
| 캐시 적중 필드  | `cached_tokens`                                       | `cached_tokens` | `cachedContentTokenCount`     | `cache_read_input_tokens` |

플랫폼 전체의 캐싱 지원에 대해서는 [캐시 과금 FAQ](/ko/faq/cache-billing)를 참조하십시오.

<Info>
  **이 페이지의 모든 수치는 `grok-4.6` (2026-08-19)에서 측정되었습니다.** xAI는 모든 Grok 언어 모델이 prefix 캐싱을 지원한다고 밝히고 있습니다. 저희는 다른 모델들은 하나씩 벤치마크하지 않았으므로, 블록 단위와 짧은 prompt 동작 같은 세부 사항은 자신의 워크로드에서 직접 확인하셔야 합니다.

  특정 prefix에 대해 보이는 과금이 여기 설명과 분명히 다르다면, 응답 헤더의 request-id를 첨부하여 지원팀에 문의하십시오.
</Info>

## 요약

<CardGroup cols={2}>
  <Card title="1. 완전 자동" icon="wand-sparkles">
    마커가 없고 쓰기 요금도 없습니다. 조건을 충족하면 캐시되며, 두 번째 재사용은 순수한 절감입니다.
  </Card>

  <Card title="2. 추가만 허용" icon="layers">
    메시지 시작부터 바이트 단위로 일치 여부를 확인합니다. 편집 이력은 이를 무효화하며, 적중은 128 tokens 단위로 내림됩니다.
  </Card>

  <Card title="3. 긴 대화 이어가기" icon="link">
    멀티턴 chat은 원래의 정적 접두사만 재사용하며, responses + previous\_response\_id는 턴마다 적중을 늘립니다.
  </Card>

  <Card title="4. 적중에 기대지 마십시오" icon="scale">
    적중은 보장되지 않습니다. 캐시 미적용 가격 기준으로 예산을 잡고, 할인은 보너스로 간주하십시오.
  </Card>
</CardGroup>

## 관련 링크

* 같은 그룹: [Grok 개요](/ko/api-capabilities/grok/overview) · [채팅 및 추론](/ko/api-capabilities/grok/chat) · [웹 및 X 검색](/ko/api-capabilities/grok/web-search) · [코드 실행 및 MCP](/ko/api-capabilities/grok/code-execution-mcp)
* 다른 채널의 캐싱: [OpenAI 캐시 과금](/ko/api-capabilities/openai/prompt-caching) · [Gemini 캐시 과금](/ko/api-capabilities/gemini/prompt-caching) · [Claude 캐시 과금](/ko/api-capabilities/claude-prompt-caching)
* 플랫폼 전체 개요: [캐시 과금 FAQ](/ko/faq/cache-billing)
* 토큰을 얻거나 관리하기: `https://api.apiyi.com/token`
* xAI 공식 문서: `docs.x.ai/developers/advanced-api-usage/prompt-caching`
