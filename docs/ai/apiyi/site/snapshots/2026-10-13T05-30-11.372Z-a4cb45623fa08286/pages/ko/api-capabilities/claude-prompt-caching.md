> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 프롬프트 캐싱 가이드

> Anthropic 네이티브 형식에서 Prompt Cache를 시작하는 방법입니다. 캐시 가능한 요청을 작성하는 방법, 청구서를 읽는 방법, 그리고 캐시 적중률이 왜 0인지 확인할 수 있습니다. 비용을 최대 90%까지 절감합니다.

Claude Code, Cline, Cursor를 사용 중이거나 직접 Claude API 호출을 구현하는 경우, **프롬프트 캐시는 과금을 낮추는 데 가장 큰 레버입니다**. 캐시된 입력 tokens는 \*\*0.1×\*\*만 과금되므로, 90% 할인이 적용됩니다.

이 페이지는 Anthropic의 공식 문서(`platform.claude.com/docs/en/build-with-claude/prompt-caching`)를 기반으로 하며, 복사-붙여넣기 가능한 예시와 함께 APIYI의 설정에 맞게 조정되었습니다.

## 한 문장으로

긴, 재사용되는 prompt 접두사(시스템 지시사항 / 긴 문서 / few-shot 예시)를 `cache_control`로 표시합니다. 서버가 이를 저장하며, 다음 요청에서 같은 접두사가 오면 다시 처리하지 않으므로 — **대략 10배 더 저렴하고 빠릅니다**. 일정 기간 사용이 없으면 만료됩니다.

## 왜 신경 써야 할까요 — 요율 배수 확인하기

모델의 기본 입력 token 가격(`1×`) 기준:

| 구분 | 가격 | 참고 사항 |
| - | - | - |
| 일반 입력 | **1×** | 캐시되지 않은 모든 부분, 정가 적용 |
| 캐시 쓰기 (5분 TTL) | **1.25×** | 최초 쓰기 시 25% 추가 비용 발생 |
| 캐시 쓰기 (1시간 TTL) | **2×** | 더 오래 보관하기 위해 더 많은 비용 지불 |
| **캐시 읽기 (적중)** | **0.1×** | 가장 핵심적인 이점입니다. 이후 90% 할인 적용 |

**손익분기점:**

* **5분 TTL**: 동일한 접두사를 단 **2회 재사용**하는 것만으로 손익분기점을 넘깁니다(1.25 + 0.1 = 1.35로, 캐시되지 않은 2회 요청 비용인 2.0보다 저렴합니다).
* **1시간 TTL**: **3회 재사용** 시 손익분기점을 넘깁니다(2 + 0.2 = 2.2로, 3.0보다 저렴합니다).

<Info>
  TTL은 **슬라이딩 윈도우** 방식입니다. 캐시 적중이 발생할 때마다 만료 타이머가 초기화되므로, 활성 대화가 진행 중에 만료되지 않습니다. TTL을 초과하는 실질적인 유휴 상태가 발생해야만 캐시에서 제거됩니다.
</Info>

### 적합한 사용 사례

* 동일하고 긴 시스템 prompt를 여러 번 호출하는 경우 (에이전트, 챗봇)
* 멀티턴 대화 (이전의 모든 턴이 재사용 가능한 접두사가 됩니다)
* 단일 문서에 대한 배치 처리 (단일 계약서에 대해 50개의 질문을 하는 경우)
* 안정적으로 검색된 청크가 접두사를 구성하는 RAG

### 부적합한 사용 사례

* 모든 prompt가 첫 글자부터 다른 경우
* 전체 내용이 짧아 모델별 최소 기준(아래 참조)을 넘지 않는 경우
* 매 턴마다 **업로드된 첨부 파일을 다시 조합하는** 채팅 클라이언트 (아래의 “이미지 및 파일도 캐시됩니다” 참조)

## 세 가지 필수 요구 사항

세 가지 모두 필수입니다.

### 1. 명시적인 `cache_control` 마커

`content`는 일반 문자열일 수 없습니다. 캐시하려는 블록에 `cache_control`가 연결된 **콘텐츠 블록 배열**이어야 합니다.

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

### 2. 길이가 모델별 최소 기준을 충족해야 함

콘텐츠가 모델의 최소 기준보다 짧으면 **마커가 있어도 캐시되지 않습니다**(오류 없이 조용히 건너뜁니다). Anthropic의 공식 문서에서 확인했습니다.

| 최소 tokens | 모델 |
| - | - |
| **512** | Opus 5, Fable 5 / 5.1, Mythos 5 |
| **1,024** | Opus 4.8, Sonnet 5, Sonnet 4.6, Sonnet 4.5, Sonnet 4, Opus 4.1, Opus 4 |
| **2,048** | Opus 4.7, Haiku 3.5 |
| **4,096** | Opus 4.6, Opus 4.5, Haiku 4.5 |

<Warning>
  **이 기준은 버전 번호에 따라 단조롭게 감소하지 않으므로 추측하지 마십시오.** 가장 직관에 반하는 조합은 다음과 같습니다. Opus 5는 **512**만 필요하지만, 더 이전 모델인 Opus 4.6 / 4.5는 **4,096**이 필요합니다. 즉 8배 차이입니다. Haiku 4.5도 4,096이 필요하며, 이는 이전 Haiku 3.5(2,048)보다 *높습니다*. 따라서 “최신 모델은 기준이 더 낮다”도, “더 작은 모델은 기준이 더 낮다”도 성립하지 않습니다. 모델을 전환할 때마다 표를 확인하십시오.
</Warning>

<Tip>
  영어 텍스트는 평균적으로 token당 약 0.75단어입니다. 실무적으로는 Opus 5는 안정적인 콘텐츠가 약 **380단어 이상**이면 캐시되고, Sonnet 5 / Sonnet 4.6은 약 **770단어**, Opus 4.6 / Haiku 4.5는 캐싱이 효과를 내기 전에 대략 **3,000단어**가 필요합니다. 최신 기준은 항상 Anthropic의 공식 문서를 참조하십시오. 모델 버전 간에 변경될 수 있습니다.
</Tip>

<Info>
  **APIYI에서 측정(2026-07-29).** 크기를 단계적으로 늘린 고정 접두사로 쓰기 기준을 테스트했습니다. `claude-opus-5`는 301 tokens에서 캐시 쓰기가 발생하지 않았지만 614에서는 발생하여 공식 기준인 **512**를 확인했고, `claude-sonnet-5`는 612에서는 발생하지 않았지만 1,250에서는 발생하여 공식 기준인 **1,024**를 확인했습니다. 둘 다 위 표와 일치합니다.
</Info>

### 3. 접두사가 바이트 단위로 완전히 일치해야 함

캐싱은 **접두사 기반**입니다. 요청 시작부터 `cache_control` 마커까지의 바이트 스트림은 이전 요청과 **동일**해야 합니다. 공백, JSON 키 순서, 타임스탬프 등 단 하나의 문자라도 변경되면 새 접두사로 간주되어 캐시 적중 대신 새로운 쓰기가 발생합니다.

**실무 규칙: 안정적인 내용은 앞에, 변동되는 내용은 뒤에 배치하십시오.**

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

## 적중 여부를 확인하는 방법 — 세 가지 usage 필드

모든 응답에서 `usage`는 다음 정보를 보고합니다:

| 필드 | 의미 | 과금 배수 |
| - | - | - |
| `input_tokens` | 캐시되지 않은 입력 tokens | 1× |
| `cache_creation_input_tokens` | 이번 호출에서 캐시에 기록된 tokens | 1.25× 또는 2× |
| `cache_read_input_tokens` | 이번 호출에서 캐시에서 읽은 tokens | **0.1×** |

**총 입력 tokens = 세 필드의 합계.** `cache_read_input_tokens > 0`인 한, 비용을 절감하고 있는 것입니다.

<Tip>
  **매우 유용한 자체 점검 방법**: 실제 적중 시 이번 턴의 `cache_read_input_tokens`은 **이전 턴의 `cache_creation_input_tokens`과 정확히 일치합니다** — 이전 턴에 입력된 모든 내용이 하나의 블록으로 반환되며, 이번 턴의 새로운 내용만 이번 턴의 기록 대상에 포함되기 때문입니다.

  따라서 `read` ≈ 이전 `write`은 전체 접두사가 적중했음을 의미하며, `read`이 이전 `write`보다 확연히 작다면 앞부분의 일부만 적중했음을 의미합니다. 중간에 무언가 변경되었으며, 그 차이가 발생하는 지점을 확인하시면 됩니다.
</Tip>

## 가장 흔히 발생하는 문제

| 증상 | 원인 |
| - | - |
| `write` 값이 항상 `0`이거나 필드가 누락됨 | `cache_control` 마커 없음 / 최소 임계값 미만 / OpenAI 호환 형식 사용 |
| 2번째 요청에서도 여전히 `write > 0` 및 `read = 0` 발생 | 접두사가 변경됨. 주요 원인: prompt 내의 `datetime.now()`, UUID, 순환되는 사용자 ID, 비결정론적 JSON 직렬화, 타임스탬프가 포함된 시스템 prompt |
| 정상 작동 후 얼마 지나지 않아 다시 쓰기 발생 | TTL 초과 유휴 상태. 더 긴 유지를 위해 `{"type": "ephemeral", "ttl": "1h"}` 사용 |
| 동일한 prompt, 다른 모델 — 캐시 적중 안 됨 | 캐시는 모델별로 격리됩니다. 모델 전환 = 새로운 캐시 키 |
| Fable 5 / 5.1에서 특정 턴에 갑자기 `read = 0`이 표시되고 응답 `model`가 `claude-opus-4-8`(또는 `claude-opus-5`)이거나 `stop_reason`가 `refusal`임 | 콘텐츠 안전 폴백 / 거부 동작이 실행되었습니다. 폴백은 모델과 캐시 키를 전환하므로 해당 턴에서는 이전 캐시를 읽을 수 없습니다. 거부된 턴에서 기록된 캐시는 이후에 다시 읽히지 않습니다. 아래 참고 사항을 확인하십시오 |
| 긴 대화의 최근 턴에서 캐시가 적중되지 않음 | 요청당 `cache_control` 중단점은 최대 **4**개이며, 각 중단점은 이전 캐시 항목을 찾기 위해 **20개 콘텐츠 블록**까지만 역방향으로 탐색합니다 |
| 대화에 업로드된 파일이나 대용량 이미지가 포함되어 캐시 적중률 변동이 심함 | **Claude의 이미지/파일 캐싱 문제가 아닙니다** — 클라이언트가 매 턴 첨부 파일을 재구성하여 접두사가 변경되기 때문입니다. 아래의 “이미지 및 파일도 캐싱됨” 항목을 참조하십시오 |

<Warning>
  **Fable 제품군의 안전 폴백은 캐시를 무효화합니다.** `claude-fable-5` / `claude-fable-5-1`에는 안전 분류기가 내장되어 있습니다. 요청이 고위험 콘텐츠에 도달하면 모델은 **거부**(`stop_reason: "refusal"`이 포함된 HTTP 200)하거나 Opus 제품군으로 **폴백**하며, 응답의 최상위 `model`에는 실제로 응답한 모델이 그대로 반영됩니다. 이는 게이트웨이 문제가 아닌 모델 측의 정상적인 동작입니다.

  캐싱에 미치는 영향: 폴백은 모델과 캐시 키를 전환하므로 해당 턴에서는 이전 턴에서 기록한 내용을 읽을 수 없습니다. 다음 턴이 다시 Fable로 돌아오면 캐시 적중이 재개됩니다. 거부된 턴에서도 여전히 `cache_creation_input_tokens`가 보고될 수 있지만, 해당 쓰기는 이후에 다시 읽히지 않습니다. 멀티턴 에이전트 세션에서는 이것이 **`read`이(가) 0으로 떨어지고 `write`이(가) 다시 급증하는 개별 턴**으로 나타납니다.

  대처 방법: `usage`만으로 캐시 미적중을 판단하기 전에 응답의 `model` 및 `stop_reason`을(를) 확인하십시오. 거부된 입력을 그대로 재시도하지 말고 조정한 후 다시 전송하십시오. 대화 내용을 정책 준수 범위 내로 유지하는 것이 이러한 미적중을 최소화하는 방법입니다. 거부, 폴백 및 과금에 대한 자세한 내용은 [Fable 5.1 출시 노트](/en/news/claude-fable-5-1-launch)에서 확인할 수 있습니다.
</Warning>

<Warning>
  **프롬프트 캐싱은 Anthropic 네이티브 형식(`/v1/messages`)에서만 작동합니다.** OpenAI 호환 형식(`/v1/chat/completions`)을 통해 Claude를 호출하면 무엇을 전송하든 캐시 필드가 반환되지 않습니다. Claude Code, Cline, Cursor 및 이와 유사한 고빈도 클라이언트의 경우, 과금을 고려하신다면 네이티브 형식이 필수적입니다.
</Warning>

## 이미지와 파일도 캐싱됩니다 — 단, 첨부 파일 시나리오에서는 캐시 적중이 덜 안정적입니다

우선 흔한 오해부터 짚어보겠습니다. **Claude의 이미지/파일 캐싱 자체가 "불안정"한 것은 아닙니다.** Anthropic 공식 문서에는 **텍스트, 이미지, 문서 모두 동일한 조건으로 Prompt Cache에 들어갈 수 있다**고 명시되어 있습니다.

진짜 원인은 앞서 언급한 필수 요건 때문입니다. 캐싱은 **요청의 완전한 프리픽스**와 일치해야 하며, 이미지나 파일의 바이트 역시 해당 프리픽스의 일부입니다. 턴 사이에 클라이언트가 첨부 파일을 조합하는 방식이 조금이라도 바뀌면 캐시가 깨집니다. Anthropic에서도 특정 사례를 명시하고 있습니다. **prompt에 이미지가 포함되는지 여부가 변경되면 해당 캐시가 무효화됩니다.**

### 두 시나리오의 차이점

| | 코딩 / 일반 텍스트 | 채팅 클라이언트 + 첨부 파일 |
| - | - | - |
| 일반적인 형태 | 고정된 시스템 prompt + 코드 컨텍스트 + 끝부분에 추가되는 대화 기록 | 첨부 파일(PDF / 대용량 이미지)이 매 턴마다 다시 조합될 가능성 있음 |
| 프리픽스 변경 방식 | 추가 전용(Append-only); 이전의 모든 내용은 바이트 단위까지 동일하게 유지됨 | 첨부 파일이 다시 업로드/다시 인코딩되거나, 콘텐츠 블록의 순서 또는 구조가 변경됨 |
| 캐시 적중 양상 | **안정적임** — 프리픽스 캐싱이 설계된 본래 목적에 정확히 부합함 | **변동 폭이 매우 큼** |

Claude Code, Cline, Cursor 같은 코딩 클라이언트는 첫 번째 열에 해당하므로 캐시 적중률이 대체로 안정적입니다. Chatbox 및 Cherry Studio와 같은 GUI 클라이언트 역시 **일반 텍스트 대화**에서는 마찬가지로 안정적입니다. 캐시 적중률은 대화에 **업로드된 파일이나 대용량 이미지 첨부 파일**이 포함될 때만 저하됩니다.

### 첨부 파일 시나리오에서 적중률을 회복하는 방법

1. **첨부 파일을 고정된 순서로 맨 앞에 배치하십시오** — 가장 용량이 크고 안정적인 콘텐츠이므로 프리픽스 위치에 두는 것이 적절합니다
2. **각 첨부 파일을 한 번만 인코딩하고 동일한 base64를 재사용하십시오.** 매 턴마다 파일을 다시 읽고 다시 인코딩하지 마십시오(재인코딩 시 동일한 바이트가 생성된다고 보장할 수 없습니다)
3. **턴 사이에 콘텐츠 블록 순서를 바꾸지 마십시오.** 특히 "이번 턴에는 이미지를 맨 앞에, 다음 턴에는 이미지를 맨 뒤에" 두는 방식은 피해야 합니다
4. 첨부 파일이 캐시된 프리픽스 안에 포함되도록 **첨부 파일 뒤에 `cache_control`를 배치하십시오**
5. **대화 중간에 첨부 파일을 추가하거나 제거하지 마십시오** — 이미지 하나를 추가하거나 삭제하는 것만으로도 그 뒤의 전체 프리픽스가 무효화됩니다

<Tip>
  **비기술직 동료나 고객에게 이를 설명할 때:**

  Claude의 캐싱은 텍스트, 이미지, 파일을 모두 지원합니다. 다만 Chatbox와 같은 클라이언트에서는 대화에 업로드된 파일이나 대용량 이미지 첨부 파일이 포함될 때, 클라이언트가 이러한 첨부 파일과 주변 컨텍스트를 구성하는 방식이 턴마다 달라질 수 있어 유효 캐시 적중률이 상대적으로 불안정해집니다. 반면 일반 텍스트와 코드 컨텍스트가 주를 이루는 Coding 시나리오에서는 요청 컨텍스트가 대체로 안정적이므로 캐시 적중이 정상적이며 일관되게 유지됩니다.

  이렇게 설명하면 "Claude 공식 이미지/파일 캐싱에 버그가 있다"는 인상을 주는 대신, 원인이 **클라이언트가 요청을 조합하는 방식**에 있음을 명확히 짚어줄 수 있습니다.
</Tip>

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
  <Card title="1. 마킹하기" icon="tag">
    콘텐츠 블록에 `cache_control: {"type": "ephemeral"}` 지정 — **일반 문자열 `content`은 절대 캐시되지 않습니다**.
  </Card>

  <Card title="2. 충분한 길이" icon="ruler">
    Opus 5 ≥ 512; Sonnet 5 / Sonnet 4.6 ≥ 1,024; Opus 4.7 ≥ 2,048; Opus 4.6 / Haiku 4.5 ≥ 4,096 tokens, 그렇지 않으면 별도 알림 없이 건너뜁니다.
  </Card>

  <Card title="3. 안정적인 접두사" icon="lock">
    앞부분은 안정적으로 유지하고 가변적인 내용은 뒤에 배치하십시오. 단 한 글자만 달라져도 캐시 적중에 실패합니다.
  </Card>

  <Card title="4. 사용량 확인" icon="search">
    오직 `cache_read_input_tokens > 0`만이 실제로 비용을 절감했음을 증명하며, 이 값은 이전 턴의 `cache_creation_input_tokens`과 대체로 일치해야 합니다.
  </Card>

  <Card title="5. 첨부 파일 고정 유지" icon="paperclip">
    이미지와 파일도 캐시되지만, 매 턴마다 첨부 파일을 재조합하면 접두사가 깨집니다 — 맨 앞에 배치하고, 순서를 유지하며, 한 번만 인코딩하십시오.
  </Card>
</CardGroup>

## 관련 링크

* 상위 페이지: [Claude API 기본](/ko/api-capabilities/claude)
* 클라이언트 설정 가이드: [Claude Code 연동](/ko/scenarios/programming/claude-code) · [Cherry Studio 연동](/ko/scenarios/chat/cherry-studio)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
* Anthropic 공식 문서: `platform.claude.com/docs/en/build-with-claude/prompt-caching`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.