> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 프롬프트 캐싱 과금 가이드

> OpenAI 프롬프트 캐싱은 완전 자동이며, 추가 요금이 없고, 작성은 무료입니다: 캐시된 입력은 입력 가격의 10%로 과금됩니다. 적중하는 요청을 작성하는 방법과 cached_tokens를 읽는 방법을 설명합니다.

gpt-5 시리즈에서 에이전트, 멀티턴 채팅, 또는 배치 문서 작업을 실행하면, Prompt Caching이 입력 과금의 캐시된 부분을 \*\*기본 가격의 10%\*\*로 줄여 줍니다. 또한 **코드 변경이 전혀 필요하지 않으며**, 캐싱은 완전히 자동으로 작동합니다.

이 페이지는 공식 OpenAI 문서(`developers.openai.com/api/docs/guides/prompt-caching`, 2026년 6월 기준)를 바탕으로 하며, 예시는 APIYI에 맞게 수정되었습니다.

## 한 문장 버전

요청의 **시작 구간(접두사)이 최근 요청과 정확히 일치하고 길이가 최소 1024 tokens인 경우**, 서버는 이를 다시 처리하지 않습니다. 일치한 부분은 \*\*0.1×\*\*로 과금되고 지연 시간은 최대 80%까지 줄어듭니다.

Claude의 캐싱과 가장 큰 차이점은 두 가지입니다.

* **마커가 없습니다**: `cache_control` 같은 표시가 없으며, 조건이 충족되면 자동으로 캐싱이 적용됩니다
* **쓰기 요금이 없습니다**: Claude는 쓰기에 1.25× / 2×를 청구하지만, OpenAI는 무료로 기록합니다

## 굳이 신경 써야 하는 이유 — 과금 배수

모델의 원시 input token 가격을 \*\*1×\*\*로 두면:

| 유형        | 가격          | 참고                  |
| --------- | ----------- | ------------------- |
| 일반 입력     | **1×**      | 일치하지 않은 부분, 정상가     |
| 캐시 쓰기     | **0× (무료)** | 자동으로 발생하며, 비용이 없습니다 |
| **캐시 적중** | **0.1×**    | 일치한 부분은 90% 할인됩니다   |

**손익분기점: 두 번째 요청입니다.** 상각할 쓰기 비용이 없으므로, 접두부를 재사용할 때마다 순수한 절감이 됩니다. Claude처럼 선불로 1.25×를 내고 두 번 재사용해야 손익분기점에 도달하는 것보다 단순합니다.

APIYI의 실시간 가격(1M tokens당):

| 모델                  | 일반 입력  | 캐시 적중       |
| ------------------- | ------ | ----------- |
| `gpt-5.4`           | \$2.50 | **\$0.25**  |
| `gpt-5.4-mini`      | \$0.75 | **\$0.075** |
| `gpt-5.5`           | \$5.00 | **\$0.50**  |
| `gpt-5.1` / `gpt-5` | \$1.25 | **\$0.125** |

### 적합한 경우

* 긴 시스템 prompt와 도구 정의를 여러 호출에서 재사용하는 경우(에이전트, 지원 봇)
* 여러 턴 대화(새 턴마다 이전 기록 전체에 자동으로 캐시 적중)
* 하나의 문서를 일괄 처리하는 경우(하나의 계약서에 대해 50개의 질문을 하는 경우)
* prompt 앞부분에 고정 문서 청크를 배치한 RAG

### 적합하지 않은 경우

* 첫 글자부터 완전히 다른 요청
* 전체가 1024 tokens 미만인 prompt(캐싱 임계값 미만)

## 적중을 위한 세 가지 엄격한 조건

세 가지 모두 필요합니다.

### 1. 최소 1024 token의 접두사

1024 token보다 짧은 요청은 **절대 캐시되지 않습니다**(오류는 없으며, 조용히 적용되지 않을 뿐입니다). 1024를 넘으면 적중 길이는 **128-token 단위**로 늘어납니다. 일치한 길이는 1024, 1152, 1280 … 같은 단계에 도달하므로, `cached_tokens`은 보통 전체 안정 접두사보다 약간 짧게 읽힙니다. 이는 정상입니다.

### 2. 바이트 단위로 완전히 동일한 접두사

캐싱은 **접두사 일치** 방식입니다. 비교는 첫 글자에서 시작해 처음 차이가 나는 지점에서 멈춥니다. 타임스탬프, 사용자 이름, JSON 키 순서 같은 어떤 변경도 그 뒤의 모든 항목을 정가로 과금하게 만듭니다.

**실용적인 규칙: 안정적인 콘텐츠를 먼저, 변동 가능한 콘텐츠는 마지막에 둡니다.**

```python theme={null}
# ❌ Wrong: dynamic content at the start of system — prefix changes every time, never hits
messages = [
    {"role": "system", "content": f"Current time {datetime.now()}. You are an assistant." + long_instructions},
    {"role": "user", "content": question},
]

# ✅ Right: long instructions and tool definitions stay stable up front; dynamic bits go last
messages = [
    {"role": "system", "content": long_instructions},          # stable — will hit
    {"role": "user", "content": f"Current time {datetime.now()}. {question}"},  # volatile — last
]
```

### 3. 보존 기간 내 재사용

* 기본 보존: 유휴 상태가 **5\~10분** 지나면 제거되며, 최대 1시간입니다
* **2026년 5월 29일(UTC)부터**, gpt-5.1 및 이후 모델(Pro 변형 포함)은 ZDR이 아닌 조직에 대해 기본적으로 **24시간 확장 보존**(`prompt_cache_retention: "24h"`)을 사용하며, 추가 비용은 없습니다 — 당일 재사용은 사실상 항상 적중합니다

## 최소 동작 예제

같은 긴 프리픽스를 서로 다른 질문과 함께 두 번 보내십시오 — 첫 번째 쓰기는 자동이고, 두 번째는 캐시 적중입니다:

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# Must be long enough: at least 1024 tokens (~750+ English words)
LONG_SYSTEM = open("long_instructions.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="gpt-5.4",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("Summarize the key points", "1st")   # expect cached=0
ask("Give 3 keywords", "2nd")            # expect cached ≈ prefix length
```

예상 출력:

```text theme={null}
[1st] input=2330 cached=0
[2nd] input=2335 cached=2304
```

두 번째 호출의 `cached`는 시스템 prompt 길이(128로 반올림)와 가깝습니다 — 해당 부분은 10%로 과금됩니다.

<Info>
  `/v1/responses` 엔드포인트도 자동으로 캐시합니다; 필드는 `usage.input_tokens_details.cached_tokens`입니다. OpenAI의 내부 테스트에 따르면 Responses에서의 캐시 활용률은 Chat Completions보다 40%–80% 더 높습니다 — 멀티턴 에이전트의 경우 [네이티브 호출](/ko/api-capabilities/openai/native)을 선호합니다.
</Info>

## 적중했습니까? usage 필드를 읽어보세요

| Endpoint               | Hit 필드                                      |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

**`cached_tokens > 0`는 절약을 의미합니다**: 해당 부분은 0.1×로 과금되며, 나머지 `prompt_tokens - cached_tokens`는 정가로 과금됩니다.

## 고급: 적중률 높이기

### prompt\_cache\_key 라우팅

적중하려면 요청이 동일한 캐시 머신에 도달해야 합니다. 기본 prefix-hash 라우팅이면 보통 충분하지만, **많은 사용자가 비슷한 prefix를 공유**하거나 동시 실행 수가 높을 때는 명시적인 `prompt_cache_key`가 적중률을 눈에 띄게 높입니다:

```python theme={null}
r = client.chat.completions.create(
    model="gpt-5.4",
    messages=messages,
    prompt_cache_key="user-12345"  # pin routing per user/session
)
```

<Warning>
  하나의 "prefix + prompt\_cache\_key" 조합이 대략 **15 requests/minute**를 넘으면 트래픽이 다른 머신으로 분산되어 적중률이 떨어집니다. 높은 동시 실행 수에서는 **사용자 또는 세션별로 키를 분리**해야 하며, 전역 키 하나를 공유하면 안 됩니다.
</Warning>

### 안정적인 prefix 설계

* 도구 정의 순서와 JSON 직렬화를 고정하십시오(직렬화기가 key 순서를 임의로 섞지 않도록 하십시오)
* 이미지 입력도 prefix 매칭에 포함됩니다 — 재사용할 때는 URL / base64와 `detail` 매개변수를 동일하게 유지하십시오
* 시나리오별로 사용할 수 있는 tools를 바꾸려면 `allowed_tools`를 사용해 하위 집합을 제한하고 `tools` 목록은 수정하지 마십시오 — 전자는 캐시 prefix를 깨지 않습니다

### 다중 턴 채팅은 자동으로 적중됩니다

append-only messages 배열은 prefix 안정성을 자연스럽게 만족합니다. 각 턴의 기록은 이전 턴의 전체 prefix이기 때문입니다. 추가 작업 없이 자동으로 적중이 발생합니다.

## 흔한 함정

| 증상                              | 원인                                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `cached_tokens`가 항상 0           | 총 1024 token 미만 / prefix 시작 부분의 동적 콘텐츠(타임스탬프, UUID, 랜덤 ID)                                                                  |
| 간헐적 적중                          | 분할된 `prompt_cache_key` 없이 높은 동시 실행 수 / 보존 기간이 지난 뒤의 유휴 상태                                                                   |
| 예상보다 낮은 적중 수                    | 128-token 단위 절단(정상) / 동적 콘텐츠가 prefix 중간에 유출됨                                                                                |
| 모델 전환 후 적중 없음                   | 캐시는 모델별로 분리됩니다 — `gpt-5.4`와 `gpt-5.4-mini`는 공유하지 않습니다                                                                       |
| Claude를 호출할 때 cached\_tokens 없음 | Claude에 대한 OpenAI 호환 호출은 Claude의 캐시를 사용할 수 없습니다 — [Claude Native Calls](/ko/api-capabilities/claude-prompt-caching)을 사용하십시오 |

## 한눈에 보는 OpenAI 대 Claude 캐싱

|        | OpenAI (gpt-5 series)     | Claude                    |
| ------ | ------------------------- | ------------------------- |
| 트리거    | **완전 자동**, 코드 없음          | 수동 `cache_control` 마커     |
| 기록 수수료 | **무료**                    | 1.25배 (5분) / 2배 (1시간)     |
| 적중 가격  | 0.1배                      | 0.1배                      |
| 최소 임계값 | 1024 tokens               | 모델별 1024–4096 tokens      |
| 보존 기간  | 5분부터; gpt-5.1+에서는 기본 24시간 | 5분 / 1시간(슬라이딩 갱신)         |
| 확인할 항목 | `cached_tokens`           | `cache_read_input_tokens` |

Claude 측의 전체 가이드는 [Claude 캐시 과금 가이드](/ko/api-capabilities/claude-prompt-caching)를 참조하십시오.

## APIYI와 캐싱

<Info>
  **APIYI OpenAI 채널은 캐시 적중을 지원합니다.** 요청은 그대로 상위로 전달되며, `cached_tokens` 필드는 변경 없이 반환되고, 과금 대시보드에는 일치한 부분이 공식 0.1배 요율의 별도 “cache read” 항목으로 표시됩니다. 코드에서 미들웨어 전용 조정은 필요하지 않습니다.
</Info>

자체 확인:

1. 최소 1024 token의 안정적인 접두사를 구성하여 요청을 연달아 2번 보냅니다
2. 2번째 응답에는 `cached_tokens > 0`가 표시되어야 합니다
3. 호출 로그에서 2번째 요청의 입력 비용이 1번째보다 눈에 띄게 낮아야 합니다

## 핵심 요점

<CardGroup cols={2}>
  <Card title="1. 완전 자동" icon="wand-sparkles">
    마커도 없고 쓰기 요금도 없습니다 — caching은 자동으로 적용되며 두 번째 사용부터는 그대로 절감입니다.
  </Card>

  <Card title="2. 충분한 길이" icon="ruler">
    caching을 시작하려면 최소 1024 tokens의 prefix가 필요합니다. hits는 128-token 단위로 계산됩니다.
  </Card>

  <Card title="3. 안정적인 prefix" icon="lock">
    안정적인 콘텐츠를 앞에 두고 변동되는 콘텐츠는 뒤에 두십시오. 시작 부분에는 타임스탬프와 랜덤 ID를 넣지 마십시오.
  </Card>

  <Card title="4. 사용량 확인" icon="search">
    `cached_tokens > 0`만이 hit를 증명합니다 — 그 부분은 10%로 과금됩니다.
  </Card>
</CardGroup>

## 관련 링크

* 이 그룹: [네이티브 호출](/ko/api-capabilities/openai/native) · [호환 모드](/ko/api-capabilities/openai/compatible) · [함수 호출](/ko/api-capabilities/openai/function-calling)
* Claude 측 캐싱: [Claude 캐시 과금 안내](/ko/api-capabilities/claude-prompt-caching)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
* 공식 OpenAI 문서: `developers.openai.com/api/docs/guides/prompt-caching`
