> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 호환 모드: 추론 모델 출력

> /v1/chat/completions에서 추론 모델이 어떻게 동작하는지: 생각 내용(reasoning_content), 생각 서명, 구조화된 출력 — 모델별 테스트 결과 포함.

추론 모델은 답변하기 전에 "생각"합니다. [호환 모드](/ko/api-capabilities/openai/compatible)로 호출하면, 출력에는 일반 모델보다 몇 가지 추가 항목이 포함됩니다. 이 페이지에서는 세 가지를 다룹니다. **추론을 가져오는 방법, 멀티턴을 처리하는 방법, 구조화된 출력을 신뢰성 있게 만드는 방법입니다.**

<Info>
  이 페이지는 `/v1/chat/completions` 호환 모드에 중점을 둡니다. Claude의 기본 추론 블록(`/v1/messages`의 `thinking` 필드)에 대해서는 [Claude Effort & Thinking Guide](/ko/api-capabilities/claude-effort-thinking)를 참조하십시오. Gemini의 기본 `thinking_level`와 `thought_signature`에 대해서는 [Gemini Native Calls](/ko/api-capabilities/gemini/native)를 참조하십시오.
</Info>

## 개요

호환 모드에서는 reasoning 모델이 "thinking text를 출력하는지"에 따라 세 그룹으로 나뉩니다.

| 유형                 | 예시 모델                                                 | 생각 내용                                | 답변 받기                                    |
| ------------------ | ----------------------------------------------------- | ------------------------------------ | ---------------------------------------- |
| 생각을 출력하지 않음        | gpt-4.1-mini, gemini-3.1-flash-lite, claude-haiku-4-5 | 없음                                   | 일반 모델과 동일합니다                             |
| thinking text를 출력함 | grok-4.3, qwen3.6-plus, glm-5.1                       | `reasoning_content` 필드               | 답변은 `content`에, 생각은 `reasoning_content`에 |
| 토큰만                | gpt-5.4-mini                                          | 텍스트는 없고 `usage.reasoning_tokens`만 있음 | 일반 모델과 동일합니다                             |

<Tip>
  유형과 관계없이, **답변은 항상 `content`에 있습니다**. `content`만 읽으면 모든 추론 모델이 일반 모델처럼 통합되며, 생각을 노출하고 싶을 때만 `reasoning_content`을 읽으면 됩니다.
</Tip>

## 추론 내용: reasoning\_content

추론 텍스트를 내보내는 모델은 사고 과정을 `reasoning_content`에 넣으며, `content`와 병렬입니다.

**비스트리밍** — `message`에는 둘 다 포함됩니다:

```json theme={null}
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "1+1 equals 2.",
      "reasoning_content": "The user is asking 1+1 ... (a chain of thought)"
    },
    "finish_reason": "stop"
  }]
}
```

```python theme={null}
msg = resp.choices[0].message
print("answer:", msg.content)
# thinking (only some models; may live in model_extra in the SDK)
print("thinking:", getattr(msg, "reasoning_content", None))
```

**스트리밍** — `delta.reasoning_content`가 먼저 전송되고; 사고가 끝난 뒤에야 `delta.content`가 시작됩니다. 반드시 **둘을 별도로 렌더링**하십시오(사고는 접고, 답변은 스트리밍하십시오). 그렇지 않으면 UI에 먼저 생각의 벽이 번쩍 나타납니다:

```python theme={null}
for chunk in stream:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    reasoning = getattr(delta, "reasoning_content", None)
    if reasoning:
        render_thinking(reasoning)   # collapsible / muted text
    if delta.content:
        render_answer(delta.content) # main answer area
```

<Warning>
  **추론과 콘텐츠의 스트리밍 "상호 배타성"은 세 모델마다 다릅니다** — 세 가지를 모두 허용하십시오:

  * **grok-4.3**: 사고 중에는 `reasoning_content` 키만 존재하고, 답변 중에는 `content`만 존재합니다(다른 키는 아예 나타나지 않습니다).
  * **qwen3.6-plus**: 두 키가 모두 존재합니다. 비활성인 쪽은 `null`입니다.
  * **glm-5.1**: 사고 중에는 `content`가 `""`(빈 문자열)이고 `reasoning_content`에는 값이 있습니다.

  공통 접근 방식: truthiness 검사(`if reasoning:` / `if content:`)로 읽어 세 가지 빈 상태 — 누락, `null`, `""` — 를 모두 건너뜁니다.
</Warning>

<Note>
  추론 token은 답변을 압도할 수 있습니다. 테스트에서 사소한 "1+1" 질문은 grok-4.3에서 답변 token이 몇 개에 불과했음에도 `reasoning_tokens` 수백 개를 생성했습니다. 추론은 출력 token으로 과금되므로, 지연 시간과 비용에 민감한 사용 사례에서는 **활성화 / 표시 여부를 평가하십시오**.
</Note>

## 사고 시그니처와 멀티턴

“thought signature”는 **Gemini 네이티브** 개념입니다. 네이티브 멀티모달 / 함수 호출에서는 모델이 암호화된 `thought_signature`를 반환하며, 추론 연속성을 유지하려면 이를 턴 간에 다시 전달해야 합니다([Gemini 네이티브 호출](/ko/api-capabilities/gemini/native) 및 [Gemini 함수 호출](/ko/api-capabilities/gemini/function-calling) 참조).

**`/v1/chat/completions` 호환 모드에서는 추론 모델이 무상태입니다:**

* 멀티턴에는 이전 assistant 턴의 \*\*`content`\*\*만 메시지 히스토리에 넣으면 됩니다;
* `reasoning_content`를 다시 전달할 필요가 없으며, 응답에는 시그니처 필드도 나타나지 않습니다;
* 테스트에서는 gemini-3.1-flash-lite와 grok-4.3이 모두 `content`만 다시 전달되었을 때도 멀티턴 컨텍스트를 올바르게 유지했습니다.

```python theme={null}
messages = [
    {"role": "user", "content": "Remember the number 42."},
    {"role": "assistant", "content": "Got it, I'll remember 42."},  # content only
    {"role": "user", "content": "What is that number times 2?"}
]
# grok-4.3 / gemini-3.1-flash-lite both answer 84 correctly
```

<Tip>
  Gemini의 사고 시그니처를 턴 간에 유지해야 하거나, 멀티턴에서 Claude의 네이티브 thinking 블록을 사용해야 한다면, 호환 모드 대신 해당 **native** 엔드포인트로 전환하십시오.
</Tip>

## 구조화된 출력

`response_format`를 사용하여 모델이 JSON만 출력하게 합니다. 두 가지 유형입니다:

```python theme={null}
# 1) json_schema: strictly constrain fields by schema (OpenAI standard)
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "city_info",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "population": {"type": "integer"},
                "is_capital": {"type": "boolean"}
            },
            "required": ["city", "population", "is_capital"],
            "additionalProperties": False
        }
    }
}

# 2) json_object: only guarantees valid JSON, no field constraints
response_format = {"type": "json_object"}
```

### 모델별 지원 여부(테스트됨)

`json_schema` 지원은 매우 다양합니다 — **이는 구조화된 출력에서 가장 큰 함정입니다**:

| Model                 | `json_schema`                                     | `json_object` | `content`를 직접 파싱할 수 있습니까 |
| --------------------- | ------------------------------------------------- | ------------- | ------------------------ |
| gpt-4.1-mini          | ✅ 엄격히 준수됨                                         | ✅             | ✅ 순수 JSON                |
| gemini-3.1-flash-lite | ✅                                                 | ✅             | ✅                        |
| grok-4.3              | ✅ (thinking도 함께 출력함)                              | ✅             | ✅ 콘텐츠가 순수 JSON입니다        |
| gpt-5.4-mini          | ⚠️ JSON은 올바르지만 `<think>…</think>`가 앞에 붙습니다        | —             | ❌ 먼저 think 블록을 제거해야 합니다  |
| qwen3.6-plus          | ⚠️ 400을 반환합니다: messages에는 "json"이라는 단어가 포함되어야 합니다 | ✅             | ✅                        |
| claude-haiku-4-5      | ❌ 스키마를 무시하고 Markdown을 반환합니다                       | —             | ❌                        |
| glm-5.1               | ❌ 스키마를 무시하고 산문을 반환합니다                             | ✅             | ✅ json\_object에서         |

### 모델 전반에서 JSON을 안정적으로 가져오는 방법

<Warning>
  `json_schema`이 모든 모델에서 작동한다고 가정하지 마십시오. 모델 간 신뢰성을 높이려면 다음을 결합합니다:

  1. `json_object`를 우선 사용하십시오 — `json_schema`보다 더 폭넓은 호환성을 가집니다;
  2. 프롬프트에서 **"JSON만 반환하라"고 명시하고 "json"이라는 단어를 포함하십시오** (qwen에서는 필수이며, 다른 모델에서도 더 안정적입니다);
  3. **방어적으로** 파싱합니다: 제거한 뒤 ` ```json ` code fences, strip a `<think>…</think>` prefix, then `json.loads`, 실패 시에는 우아하게 처리합니다.
</Warning>

````python theme={null}
import json, re

def parse_json_loose(content: str):
    # remove a <think>…</think> prefix (gpt-5.4-mini)
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
    # remove ```json code fences
    content = re.sub(r"^```(json)?|```$", "", content, flags=re.M).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None   # degrade: log raw / retry / switch model
````

## 관련 링크

* 같은 그룹: [Handling Responses](/ko/api-capabilities/openai/response-handling) · [Compatible Mode Calls](/ko/api-capabilities/openai/compatible) · [Function Calling](/ko/api-capabilities/openai/function-calling)
* 네이티브 추론: [Claude Effort & Thinking Guide](/ko/api-capabilities/claude-effort-thinking) · [Gemini Native Calls](/ko/api-capabilities/gemini/native)
* 모델 및 과금: [Models & Pricing Overview](/ko/api-capabilities/model-info)
