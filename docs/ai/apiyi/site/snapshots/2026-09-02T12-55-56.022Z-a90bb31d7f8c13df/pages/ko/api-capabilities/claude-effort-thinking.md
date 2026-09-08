> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Effort & Thinking 가이드

> Anthropic 네이티브 형식에서 output_config.effort와 적응형 추론을 올바르게 사용하는 방법을 전체 실행 가능 예제와 함께 설명합니다.

이 페이지에서는 APIYI 게이트웨이를 통해 AWS Bedrock으로 라우팅되는 **Anthropic 네이티브 Messages API**로 Claude를 호출하는 방법과, `output_config.effort`(노력 수준) 및 `thinking`(적응형 thinking)의 올바른 사용 방법을 다룹니다.

채널, 과금, 기본 온보딩은 먼저 [Claude API Basics](/ko/api-capabilities/claude) 페이지를 참조하십시오.

<Info>
  적용 가능한 모델: Claude Opus 4.8 / 4.7 / 4.6, Sonnet 4.6 등입니다. 이 페이지에서는 예시로 **Opus 4.8**을 사용합니다.
</Info>

## 온라인 테스트 도구

코드를 작성하고 싶지 않으신가요? 먼저 APIYI 온라인 추론 테스터를 사용해 보십시오: 모델과 추론 수준을 선택하고, Max Tokens를 설정한 뒤, 「추론 요약 반환」을 체크하고, 각 추론 수준이 어떻게 추론하는지 브라우저에서 바로 비교할 수 있습니다.

<Card title="추론 테스터 · APIYI 온라인 도구" icon="flask-conical" href="https://imagen.apiyi.com/#reasoning">
  브라우저에서 Claude(GPT / Gemini 포함) 추론 테스트를 코드 없이 바로 실행할 수 있습니다. APIYI 키만 붙여 넣으면 됩니다.
</Card>

<img src="https://mintcdn.com/apiyillc/243pgGcIcpapNSDI/images/claude-effort-reasoning-tool.png?fit=max&auto=format&n=243pgGcIcpapNSDI&q=85&s=5207a7ea87e733a018c55c9480d2bc64" alt="APIYI 온라인 추론 테스터: 추론 수준 선택기가 있는 claude-opus-4-8" width="1400" height="856" data-path="images/claude-effort-reasoning-tool.png" />

## 요청 구조

### 엔드포인트 및 헤더

```
POST https://api.apiyi.com/v1/messages
```

| 헤더                  | 값                  | 비고                       |
| ------------------- | ------------------ | ------------------------ |
| `content-type`      | `application/json` | 고정                       |
| `anthropic-version` | `2023-06-01`       | Anthropic 네이티브 버전 헤더, 필수 |
| `x-api-key`         | `your-apiyi-key`   | Anthropic 네이티브 인증        |

<Info>
  APIYI가 Bedrock으로 라우팅할 때, **클라이언트는 여전히 Anthropic 네이티브 형식**(`x-api-key` + `/v1/messages`)을 사용합니다. 게이트웨이가 내부적으로 Bedrock의 `bedrock-2023-05-31`로의 변환을 처리합니다. `anthropic_version: bedrock-2023-05-31`를 설정할 필요는 없습니다.
</Info>

### 최소 요청 본문

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

## effort 수준

`effort`는 결과를 생성하는 데 Claude가 사용할 token 수를 제어하며, 철저함과 속도/비용 사이를 절충합니다. 이는 답변, 도구 호출, 그리고 확장된 사고를 포함한 **모든** token 소비에 영향을 미칩니다.

<Warning>
  **핵심 규칙**

  1. `effort`는 최상위의 독립된 `output_config` 객체에 넣어야 합니다 — **`thinking` 안이 아닙니다**. 잘못 배치하면 `ValidationException` / 400 오류가 발생합니다.
  2. **베타 헤더는 필요하지 않습니다.** 이제 effort는 지원되는 모든 모델에서 사용할 수 있으며, `anthropic-beta: effort-2025-11-24`는 더 이상 필요하지 않습니다.
  3. 기본값은 `high`입니다; `"high"`를 설정하면 `effort`를 완전히 생략한 것과 동일하게 동작합니다.
</Warning>

### effort가 포함된 요청 본문

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "output_config": {
    "effort": "medium"
  },
  "messages": [
    { "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }
  ]
}
```

### 수준 개요

| Level    | 설명                                     | 일반적인 사용 사례                 |
| -------- | -------------------------------------- | -------------------------- |
| `low`    | 가장 저렴합니다. token을 크게 절약하며, 성능은 약간 낮습니다. | 단순 작업, 높은 동시 실행 수, 하위 에이전트 |
| `medium` | 균형형입니다. 적당한 token 절감 효과가 있습니다.         | 대부분의 에이전트형 워크플로에 적절한 기본값   |
| `high`   | 기본값입니다. 높은 성능을 제공합니다.                  | 복잡한 추론, 어려운 코딩, 품질 민감 작업   |
| `xhigh`  | 장기 범위의 확장 성능으로, high와 max 사이입니다.       | 장시간 코딩 / 에이전트형 작업(30분 이상)  |
| `max`    | 제약 없는 최고 성능입니다.                        | 진정한 최전선 문제, 가장 깊은 추론       |

<Tip>
  **Opus 4.8 권장 사항**: 코딩 / 에이전트형 작업은 `xhigh`에서 시작하고, 그 밖의 지능에 민감한 작업에는 `high`를 사용하며, evals에서 품질이 유지됨을 확인한 뒤에만 `medium` / `low`로 낮추십시오.

  `xhigh` / `max`를 실행할 때는 `max_tokens`를 높게 설정하십시오(시작점으로 64k 권장). 그러면 모델에 생각 + 출력할 여유가 생깁니다.
</Tip>

### 각 모델이 지원하는 수준

모든 모델이 모든 수준을 지원하는 것은 아닙니다. `xhigh`는 Opus 4.7에 추가되었으며, `max`는 Sonnet에서 지원되지 않습니다:

| Level                     | Opus 4.6 | Opus 4.7 / 4.8 | Sonnet 4.6 |
| ------------------------- | :------: | :------------: | :--------: |
| `low` / `medium` / `high` |     ✅    |        ✅       |      ✅     |
| `xhigh`                   |     ❌    |        ✅       |      ❌     |
| `max`                     |     ✅    |        ✅       |      ❌     |

<Warning>
  흔한 실수: `claude-opus-4-6`를 `effort: "xhigh"`와 혼동하는 것입니다. Opus 4.6에는 `xhigh` 수준이 없습니다 — 대신 `high` / `max`를 사용하거나, `xhigh`를 사용하려면 모델을 `claude-opus-4-8`로 전환하십시오.
</Warning>

## 적응형 추론

Opus 4.7 / 4.8은 **적응형 추론**을 사용합니다. 모델이 언제 얼마나 생각할지 결정하며, effort가 깊이를 제어합니다.

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": {
    "type": "adaptive",
    "display": "summarized"
  },
  "output_config": {
    "effort": "xhigh"
  },
  "messages": [
    { "role": "user", "content": "Walk through and pinpoint the root cause of this production bug" }
  ]
}
```

* `thinking.type: "adaptive"` — 적응형 추론을 활성화합니다(생략하면 모델은 추론하지 않습니다).
* `thinking.display: "summarized"` — 응답에 **추론 요약** 블록을 반환합니다. 노출할 필요가 없으면 생략하십시오.
* effort와 추론의 관계: `high` / `xhigh` / `max`은 거의 항상 깊게 추론하며; `low` / `medium`은 단순한 문제에서는 추론을 건너뛸 수 있습니다.
* `display` 기본값은 모델마다 다릅니다: **Opus 4.6은 `summarized`을 기본값으로 사용**하는 반면, Opus 4.7 / 4.8은 `omitted`을 기본값으로 사용합니다(추론 블록은 여전히 존재하지만 그 `thinking` 텍스트는 비어 있어, 답변 전에 잠깐 멈춘 것처럼 보입니다). 요약을 안정적으로 받으려면 `display: "summarized"`을 명시적으로 설정하십시오.
* 네이티브 API에는 `-thinking` 접미사 모델이 없습니다. 모델이 추론할지는 모델 이름 접미사가 아니라 `thinking` **매개변수**가 제어합니다. `xxx-thinking`은 모두 서드파티 별칭일 뿐이므로, 기본 모델 ID와 `thinking` 매개변수만 사용하십시오.

<Warning>
  Opus 4.7 / 4.8은 `thinking.type: "enabled"` + `budget_tokens`를 **지원하지 않습니다**(400을 반환합니다). 대신 adaptive + effort를 사용하십시오.
</Warning>

### 추론 요약이 실제로 무엇인지(중요)

* 요약은 \*\*Anthropic(모델/서빙 레이어)\*\*가 생성하며, 게이트웨이도 아니고 별도 모델도 아닙니다. 원본 추론 과정은 절대 그대로 반환되지 않으며, 받는 것은 공식 요약입니다.
* 시스템 prompt로는 추론 요약의 스타일을 지정할 수 없습니다. `system`는 모델이 *어떻게 생각하는지*와 *최종 답변*의 스타일을 형성하며, 요약은 내부 추론을 읽기 쉽게 표현한 것일 뿐입니다. 톤, 서식, 스타일 요구사항은 **최종 답변**의 제약에 넣어야 `text` 블록에 반영됩니다.
* 모델에게 내부 추론을 답변에 그대로 출력하라고 prompt하지 마십시오. 거부를 유발할 수 있습니다(`stop_reason: "refusal"`, 그리고 `stop_details.category`가 `reasoning_extraction`될 수도 있습니다). 추론을 보려면 대신 `display: "summarized"` 요약을 읽으십시오.

<Info>
  동일한 모델에서 다중 턴 대화를 계속할 때는 이전 턴의 추론 블록을 서명과 빈 텍스트 블록을 포함해 변경하지 않은 채 다시 전달하십시오. API는 **수정된** 추론 블록을 거부합니다. 요약을 표시하는 것은 괜찮지만, 다시 전달하기 전에 편집하는 것은 안 됩니다.
</Info>

## 응답 파싱

응답 `content`은 `type`로 구분되는 블록 배열입니다:

```python theme={null}
for block in data["content"]:
    if block["type"] == "thinking":
        print("[Thinking summary]", block["thinking"])
    elif block["type"] == "text":
        print("[Answer]", block["text"])
```

토큰 사용량은 `usage` 필드에 있습니다:

```json theme={null}
{
  "usage": {
    "input_tokens": 164,
    "output_tokens": 11056,
    "service_tier": "standard"
  }
}
```

<Info>
  `stop_reason`가 `max_tokens`이면, 출력은 `max_tokens`에 의해 잘렸으며(고강도에서는 추론이 예산을 쉽게 채울 수 있습니다), 답변 텍스트가 비어 있을 수도 있습니다. 그때는 그냥 `max_tokens`를 발생시키십시오.
</Info>

## 스트리밍(stream)에서의 thinking 필드

`stream: true`에서는 thinking content가 `delta.text`를 통해 **전달되지 않습니다** — 별도의 이벤트 시퀀스입니다:

| Event                 | Field                                              | Notes                                  |
| --------------------- | -------------------------------------------------- | -------------------------------------- |
| `content_block_start` | `content_block.type = "thinking"`                  | thinking 블록이 시작됩니다                     |
| `content_block_delta` | `delta.type = "thinking_delta"` → `delta.thinking` | 점진적 요약 텍스트(`delta.text` 아님)            |
| `content_block_delta` | `delta.type = "signature_delta"`                   | thinking 블록 서명; 멀티턴을 재생할 때는 그대로 보존하십시오 |
| `content_block_stop`  | —                                                  | thinking 블록이 종료됩니다; `text` 블록이 뒤따릅니다   |

답변 텍스트는 여전히 `delta.type = "text_delta"` → `delta.text`를 통해 전달됩니다. `display: "omitted"`에서는 thinking 블록이 여전히 표시되지만 `delta.thinking`는 빈 문자열입니다.

## 전체 실행 예시

```python theme={null}
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("APIYI_API_KEY")
BASE_URL = "https://api.apiyi.com"

resp = requests.post(
    f"{BASE_URL}/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": API_KEY,
    },
    json={
        "model": "claude-opus-4-8",
        "max_tokens": 16000,
        "thinking": {"type": "adaptive", "display": "summarized"},
        "output_config": {"effort": "xhigh"},
        "messages": [
            {"role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith"}
        ],
    },
    timeout=300,
)

data = resp.json()
print("status:", resp.status_code, "| usage:", data.get("usage"))
for block in data.get("content", []):
    if block.get("type") == "thinking":
        print("\n[Thinking summary]\n", block.get("thinking", ""))
    elif block.get("type") == "text":
        print("\n[Answer]\n", block.get("text", ""))
```

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: your-apiyi-key" \
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 16000,
    "thinking": { "type": "adaptive" },
    "output_config": { "effort": "xhigh" },
    "messages": [{ "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }]
  }'
```

## Bedrock 경로에 대한 참고 사항

| 항목                      | 참고 사항                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `output_config`         | **반드시 그대로 전달되어야 합니다.** 게이트웨이에 `delete output_config` 오버라이드 규칙이 있으면 effort는 조용히 삭제됩니다(200을 반환하지만 효과는 없습니다).                                        |
| `effort` 위치             | 최상위 `output_config` 안에 있어야 하며, `thinking` 안에 있으면 안 됩니다.                                                                                           |
| 베타 헤더                   | effort에는 필요하지 않으며, adaptive thinking에도 필요하지 않습니다.                                                                                                 |
| `temperature` / `top_p` | adaptive thinking이 있는 Opus 4.7 / 4.8은 기본 샘플링을 사용해야 합니다. 게이트웨이는 일반적으로 이 두 매개변수를 이 모델들에서 제거하며, 이는 예상된 동작이고 클라이언트가 따로 설정할 필요는 없습니다.                  |
| 잘못된 effort 값            | Bedrock은 알 수 없는 값에 대해 우아하게 열화됩니다(200을 반환함). 400은 발생하지 않습니다. 따라서 “잘못된 값이면 오류가 나는가”만으로 effort가 통과되는지 판단할 수는 없으며, 대신 token 수가 수준에 따라 달라지는지 확인해야 합니다. |

## 문제 해결

### `"thinking.type.enabled" is not supported for this model`

AWS (Bedrock) 경로를 통해 Opus 4.7 / 4.8을 호출할 때 가장 흔한 400 오류는 다음과 같습니다:

```
status_code=400, InvokeModelWithResponseStream: ... Bedrock Runtime,
StatusCode: 400, ValidationException: "thinking.type.enabled" is not supported
for this model. Use "thinking.type.adaptive" and "output_config.effort" to
control thinking behavior.
```

**원인**: 요청 본문이 여전히 이전의 고정 예산 thinking 형식 `thinking: { "type": "enabled", "budget_tokens": N }`을 사용하고 있습니다. Opus 4.7 / 4.8(및 이후 모델)은 이를 **제거**했으며 적응형 thinking만 지원합니다. AWS 업스트림에서는 `ValidationException` 400을 반환합니다. 이는 위의 [적응형 thinking](#adaptive-thinking) 섹션에 있는 참고 사항과 일치합니다.

<Warning>
  오류의 `thinking.type.enabled`은 요청의 `thinking.type` 필드가 `"enabled"`로 설정되어 있음을 의미합니다. 마찬가지로 `budget_tokens`도 더 이상 지원되지 않으며, `temperature` / `top_p` / `top_k`도 이러한 모델에서는 제거되어 전송하면 400이 발생합니다.
</Warning>

**해결 방법**: `type: "enabled"`와 `budget_tokens`을 제거하고, `adaptive` + `output_config.effort`로 thinking 깊이를 제어합니다.

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": { "type": "adaptive", "display": "summarized" },
  "output_config": { "effort": "xhigh" },
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

| 이전 형식(400 오류)                                              | 새 형식                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| `"thinking": { "type": "enabled", "budget_tokens": 8000 }` | `"thinking": { "type": "adaptive" }`                  |
| `budget_tokens`로 thinking을 제어                              | `output_config.effort`로 제어(`low` – `max`)             |
| `temperature` / `top_p` / `top_k`                          | 그냥 제거하면 됩니다 — prompt로 방향만 제시하면 되며 샘플링 파라미터는 필요하지 않습니다 |

<Info>
  thinking 없이 실행하려면: Opus 4.7 / 4.8은 `thinking: { "type": "disabled" }`를 허용하며, 또는 `thinking` 필드를 그냥 생략하면 됩니다(필드가 없으면 thinking도 없습니다).
</Info>

## 참고 자료

* Anthropic — Effort 문서: `platform.claude.com/docs/en/build-with-claude/effort`
* AWS Bedrock — 적응형 사고: `docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html`
* AWS Bedrock — Claude Opus 4.8: `docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-8.html`
