> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 프롬프트 캐싱 가이드

> Anthropic 네이티브 형식에서 Prompt Cache를 시작하는 방법입니다. 캐시 가능한 요청을 작성하는 방법, 청구서를 읽는 방법, 그리고 캐시 적중률이 왜 0인지 확인할 수 있습니다. 비용을 최대 90%까지 절감합니다.

Claude Code, Cline, Cursor를 사용 중이거나 직접 Claude API 호출을 구현하는 경우, **프롬프트 캐시는 과금을 낮추는 데 가장 큰 레버입니다**. 캐시된 입력 tokens는 \*\*0.1×\*\*만 과금되므로, 90% 할인이 적용됩니다.

이 페이지는 Anthropic의 공식 문서(`platform.claude.com/docs/en/build-with-claude/prompt-caching`)를 기반으로 하며, 복사-붙여넣기 가능한 예시와 함께 APIYI의 설정에 맞게 조정되었습니다.

## 한 문장으로

긴, 재사용되는 prompt 접두사(시스템 지시사항 / 긴 문서 / few-shot 예시)를 `cache_control`로 표시합니다. 서버가 이를 저장하며, 다음 요청에서 같은 접두사가 오면 다시 처리하지 않으므로 — **대략 10배 더 저렴하고 빠릅니다**. 일정 기간 사용이 없으면 만료됩니다.

## 왜 신경 써야 하는가 — 배수를 보십시오

모델의 기본 입력 token 가격 대비(`1×`):

| 유형                | 가격        | 참고                   |
| ----------------- | --------- | -------------------- |
| 일반 입력             | **1×**    | 캐시되지 않은 부분은 전부 정가입니다 |
| 캐시 쓰기 (5분 TTL)    | **1.25×** | 처음 쓰기는 25% 더 비쌉니다    |
| 캐시 쓰기 (1시간 TTL)   | **2×**    | 더 오래 저장하려면 더 지불합니다   |
| **캐시 읽기 (캐시 적중)** | **0.1×**  | 핵심입니다. 이후 90% 할인됩니다  |

**손익분기점:**

* **5분 TTL**: 같은 prefix를 **2번 재사용**하면 손익분기점입니다(1.25 + 0.1 = 1.35, 캐시되지 않은 요청 2회분인 2.0보다 저렴합니다).
* **1시간 TTL**: **3번 재사용**하면 손익분기점입니다(2 + 0.2 = 2.2, 3.0보다 저렴합니다).

<Info>
  TTL은 **슬라이딩 윈도우**입니다: 캐시 적중할 때마다 만료 타이머가 초기화되므로, 활성 대화가 중간에 만료되지 않습니다. TTL을 넘는 진짜 유휴 상태일 때만 제거됩니다.
</Info>

### 적합한 경우

* 같은 긴 시스템 prompt를 여러 번 호출하는 경우(에이전트, 챗봇)
* 멀티턴 대화인 경우(이전 턴마다 재사용 가능한 prefix가 됨)
* 하나의 문서를 일괄 처리하는 경우(한 계약서에 대해 50개 질문하기)
* 안정적인 검색 결과 청크가 prefix를 이루는 RAG

### 부적합한 경우

* 첫 글자부터 모든 prompt가 달라지는 경우
* 전체가 짧아서 모델별 최소값(아래)을 한 번도 넘지 않는 경우

## 세 가지 필수 요건

세 가지 모두 필수입니다.

### 1. 명시적인 `cache_control` 마커

`content`는 단순 문자열일 수 없습니다. `cache_control`를 캐시하려는 블록에 연결한 **콘텐츠 블록 배열**이어야 합니다:

```python theme={null}
# ❌ Wrong: plain string is never cached
"content": "a long passage..."

# ✅ Right: content block + cache_control
"content": [
    {
        "type": "text",
        "text": "a long passage...",
        "cache_control": {"type": "ephemeral"},
    },
    {"type": "text", "text": "the question"},
]
```

### 2. 길이는 모델별 최소값을 넘어야 합니다

콘텐츠가 모델의 최소값보다 짧으면, **마커가 있어도 캐시되지 않습니다**(오류는 발생하지 않고 조용히 건너뜁니다). Anthropic의 공식 문서를 기준으로 확인했습니다:

| 최소 token 수 | 모델                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| **512**    | Opus 5, Fable 5, Mythos 5                                              |
| **1,024**  | Opus 4.8, Sonnet 5, Sonnet 4.6, Sonnet 4.5, Sonnet 4, Opus 4.1, Opus 4 |
| **2,048**  | Opus 4.7, Haiku 3.5                                                    |
| **4,096**  | Opus 4.6, Opus 4.5, Haiku 4.5                                          |

<Warning>
  **이 임계값은 버전 번호가 올라간다고 단조롭게 낮아지지 않으므로, 추측하지 마십시오.** 가장 직관에 반하는 조합은 다음과 같습니다. Opus 5는 **512**만 필요하지만, 더 오래된 Opus 4.6 / 4.5는 **4,096**이 필요합니다. 즉 8배 차이입니다. Haiku 4.5도 4,096이며, 이는 더 오래된 Haiku 3.5(2,048)보다 *높습니다*. 따라서 "더 최신 모델일수록 임계값이 낮다"도, "더 작은 모델일수록 임계값이 낮다"도 성립하지 않습니다. 모델을 바꿀 때마다 표를 확인하십시오.
</Warning>

<Tip>
  영어 텍스트는 대략 token당 0.75단어입니다. 실제로는 안정적인 콘텐츠가 약 **380단어 이상**이면 Opus 5에서 캐시되기 시작하고, Sonnet 5 / Sonnet 4.6은 약 **770단어**, Opus 4.6 / Haiku 4.5는 캐싱이 실제로 동작하기 전에 대략 **3,000단어**가 필요합니다. 최신 임계값은 항상 Anthropic의 공식 문서를 참조하십시오. 모델 버전 사이에서 바뀔 수 있습니다.
</Tip>

<Info>
  **APIYI에서 측정했습니다(2026-07-29).** 고정된 접두사를 점진적으로 키워 가며 쓰기 임계값을 탐색했습니다: `claude-opus-5`는 301 token에서는 캐시 쓰기가 발생하지 않았지만 614에서는 발생하여 공식 **512**를 전후로 확인했습니다. `claude-sonnet-5`는 612에서는 없었지만 1,250에서는 발생하여 공식 **1,024**를 전후로 확인했습니다. 둘 다 위 표와 일치합니다.
</Info>

### 3. 접두사는 바이트 단위로 정확히 일치해야 합니다

캐싱은 **접두사 기반**입니다. 요청의 시작부터 `cache_control` 마커까지의 바이트 스트림은 이전 요청과 **완전히 동일**해야 합니다. 공백, JSON 키 순서, 타임스탬프처럼 단 하나의 문자라도 바뀌면 새로운 접두사로 간주되어 적중이 아니라 새 쓰기가 발생합니다.

**실무 규칙: 변하지 않는 내용은 앞에, 변동하는 내용은 뒤에 두십시오.**

```python theme={null}
# ❌ Wrong: question first means the prefix changes every turn; never hits
content = [
    {"type": "text", "text": "Please answer this question: " + question},  # volatile
    {"type": "text", "text": long_doc, "cache_control": {"type": "ephemeral"}},
]

# ✅ Right: long stable content first with marker, question after
content = [
    {"type": "text", "text": long_doc, "cache_control": {"type": "ephemeral"}},  # stable
    {"type": "text", "text": question},                                            # volatile
]
```

## 최소 실행 예제

같은 긴 문서를 사용하지만 서로 다른 질문으로 두 번 요청을 보냅니다. 첫 번째는 쓰고, 두 번째는 적중합니다:

```python theme={null}
import json, os, requests

URL = "https://api.apiyi.com/v1/messages"
KEY = os.environ["APIYI_API_KEY"]
HEADERS = {
    "content-type": "application/json",
    "x-api-key": KEY,
    "anthropic-version": "2023-06-01",
}

# Must be long enough. Sonnet 4.6 needs >= 1,024 tokens (~770+ English words).
LONG_TEXT = open("long_document.txt").read()


def ask(question: str, label: str):
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 256,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": LONG_TEXT, "cache_control": {"type": "ephemeral"}},
                {"type": "text", "text": question},
            ],
        }],
    }
    r = requests.post(URL, headers=HEADERS, data=json.dumps(payload), timeout=120)
    u = r.json().get("usage", {})
    print(f"[{label}] input={u.get('input_tokens')} "
          f"write={u.get('cache_creation_input_tokens')} "
          f"read={u.get('cache_read_input_tokens')}")


ask("Summarize the main idea", "1st")  # expect write>0, read=0
ask("Give 3 keywords",        "2nd")    # expect write=0, read>0
```

예상 출력:

```text theme={null}
[1st] input=35 write=6512 read=0
[2nd] input=22 write=0    read=6512
```

두 번째 호출의 `read`는 첫 번째 호출의 `write`와 거의 같습니다. 같은 접두사가 다시 사용되고 있기 때문입니다.

## 적중 여부를 확인하는 방법 — 세 가지 사용 필드

모든 응답에서, `usage`는 다음을 보고합니다:

| 필드                            | 의미                    | 과금 배수       |
| ----------------------------- | --------------------- | ----------- |
| `input_tokens`                | 캐시되지 않은 입력 token      | 1×          |
| `cache_creation_input_tokens` | 이번 호출에서 캐시에 기록된 token | 1.25× 또는 2× |
| `cache_read_input_tokens`     | 이번 호출에서 캐시에서 읽은 token | **0.1×**    |

**총 입력 token = 세 항목의 합입니다.** `cache_read_input_tokens > 0`인 한, 비용을 절감하고 있는 것입니다.

## 가장 흔한 함정

| 증상                                      | 원인                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `write`가 항상 `0`이거나 필드가 누락됨              | `cache_control` 마커 없음 / 최소 임계값 미만 / OpenAI 호환 형식 사용                                              |
| 2번째 요청에도 `write > 0`와 `read = 0`가 남아 있음 | 접두사가 변경되었습니다. 흔한 원인: `datetime.now()`, UUID, 프롬프트의 순환 사용자 ID; 비결정적 JSON 직렬화; 타임스탬프가 포함된 시스템 프롬프트 |
| 한동안 작동하다가 나중에 다시 기록됨                    | TTL을 넘겨 유휴 상태가 지속됨. 더 오래 보관하려면 `{"type": "ephemeral", "ttl": "1h"}`를 사용하십시오                      |
| 같은 prompt, 다른 model — 적중 없음             | 캐시는 모델별로 분리됩니다. 모델을 전환하면 새 캐시 키가 생성됩니다                                                           |
| 긴 대화에서 최근 턴이 적중하지 않음                    | 요청당 최대 **4** `cache_control` 중단점; 각 중단점은 이전 캐시 항목을 찾기 위해 **20 콘텐츠 블록**만 되돌아봅니다                   |

<Warning>
  **Prompt Cache는 Anthropic 네이티브 형식(`/v1/messages`)에서만 작동합니다.** Claude를 OpenAI 호환 형식(`/v1/chat/completions`)으로 호출하면, 무엇을 보내든 캐시 필드는 반환되지 않습니다. Claude Code, Cline, Cursor 및 이와 유사한 고빈도 클라이언트에서는 과금을 신경 쓴다면 네이티브 형식이 필수입니다.
</Warning>

## 고급: 다중 턴 대화

`cache_control`을 **가장 최근 사용자 메시지의 마지막 콘텐츠 블록**에 배치합니다. 각 새 턴은 캐시된 읽기 범위를 이전 턴의 끝까지 자동으로 확장합니다:

```python theme={null}
# When constructing the Nth turn's request
messages[-1]["content"][-1]["cache_control"] = {"type": "ephemeral"}
```

유의할 두 가지 엄격한 제한은 다음과 같습니다.

* 요청당 최대 **4**개의 `cache_control` 중단점만 허용됩니다.
* 각 중단점의 접두사 조회 창은 뒤로 최대 20개 콘텐츠 블록까지만입니다. 그보다 오래된 내용은 히트 대상으로 고려되지 않습니다. 다시 말해, 대화가 매우 길어지면 최신 턴만 표시해서는 이전 전체 기록을 포괄하지 못합니다.

흔히 쓰는 패턴은 도구 정의, 시스템 프롬프트, 긴 문서, 그리고 최신 대화 턴에 각각 중단점 하나씩 배치하는 것입니다. 이렇게 4개 슬롯을 모두 사용하면 변경 속도가 서로 다른 섹션이 서로의 캐시를 무효화하지 않습니다.

## APIYI와 캐싱에 대하여

<Info>
  **APIYI는 캐시 필드를 엔드투엔드로 전달합니다.** 사용자가 보내는 `cache_control`는 상위 Claude(AWS Claude 또는 Claude Official)로 그대로 전달되며, 반환되는 `cache_creation_input_tokens` / `cache_read_input_tokens`는 수정 없이 그대로 다시 전달됩니다. 따라서 코드에서 별도의 조정이 필요하지 않습니다.
</Info>

직접 검증하는 방법:

1. 첫 번째 요청에서는 `usage.cache_creation_input_tokens > 0`(쓰기 성공)로 표시됩니다.
2. 몇 초 안에 동일한 prefix를 다시 보내면 `usage.cache_read_input_tokens > 0`(적중)를 보게 됩니다.
3. 과금 대시보드에서는 **캐시 쓰기**와 **캐시 읽기**가 각각 항목별로 표시되며, 동일한 공식 요율 배수(1.25× / 2× / 0.1×)가 적용됩니다.

## 요약

<CardGroup cols={2}>
  <Card title="1. 표시하기" icon="tag">
    `cache_control: {"type": "ephemeral"}` 콘텐츠 블록에 — **일반 문자열 `content`은 캐시되지 않습니다**.
  </Card>

  <Card title="2. 충분한 길이" icon="ruler">
    Opus 5 ≥ 512; Sonnet 5 / Sonnet 4.6 ≥ 1,024; Opus 4.7 ≥ 2,048; Opus 4.6 / Haiku 4.5 ≥ 4,096 tokens, 그렇지 않으면 조용히 건너뜁니다.
  </Card>

  <Card title="3. 안정적인 접두부" icon="lock">
    앞부분은 안정적으로 유지하고 뒷부분은 변동적으로 유지합니다; 한 글자만 달라도 캐시 적중이 깨집니다.
  </Card>

  <Card title="4. 사용량 확인" icon="search">
    오직 `cache_read_input_tokens > 0`만이 실제로 비용을 절감했음을 증명합니다.
  </Card>
</CardGroup>

## 관련 링크

* 상위 페이지: [Claude API 기본](/ko/api-capabilities/claude)
* 클라이언트 설정 가이드: [Claude Code 연동](/ko/scenarios/programming/claude-code) · [Cherry Studio 연동](/ko/scenarios/chat/cherry-studio)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
* Anthropic 공식 문서: `platform.claude.com/docs/en/build-with-claude/prompt-caching`
