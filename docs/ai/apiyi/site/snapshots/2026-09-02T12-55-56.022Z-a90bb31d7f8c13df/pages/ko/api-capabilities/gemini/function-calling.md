> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 함수 호출 가이드

> function_declarations 정의, AUTO/ANY/NONE 모드, function_response 반환, 그리고 Gemini 3의 thought-signature 요구 사항.

Gemini 네이티브 형식은 Function Calling을 완전히 지원합니다: 모델은 “어떤 함수 + 어떤 인자”를 출력하고, 로컬에서 실행한 뒤 결과를 반환하면 모델이 최종 답변을 생성합니다. 이 루프는 [OpenAI의 함수 호출](/ko/api-capabilities/openai/function-calling)과 일치하지만, **필드 형식은 완전히 다르며** 섞어서 사용할 수 없습니다.

이 페이지는 공식 Google 문서(`ai.google.dev/gemini-api/docs/function-calling`, 2026년 6월 기준)를 바탕으로 합니다.

## OpenAI와의 형식 차이

|                            | Gemini 기본 형식                                                        | OpenAI                                                             |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 도구 정의                      | `tools: [{"function_declarations": [...]}]`                         | `tools: [{"type": "function", ...}]`                               |
| 호출 출력                      | `function_call` in a part (`name` + `args` object)                  | `tool_calls` / `function_call` item (`arguments` is a JSON string) |
| 결과 반환                      | `Part(function_response=...)`                                       | `role:"tool"` message / `function_call_output` item                |
| 호출 전략                      | `tool_config.function_calling_config.mode`: `AUTO` / `ANY` / `NONE` | `tool_choice`: `auto` / `required` / `none`                        |
| Multi-turn reasoning state | **Gemini 3는 thought signature를 다시 반환해야 합니다**                        | 그런 요구 사항은 없습니다                                                     |

흔히 하는 실수 하나는 Gemini의 `function_call.args`가 **구조화된 객체**이지 JSON 문자열이 아니라는 점입니다. 따라서 `json.loads`가 필요하지 않습니다.

## 전체 호출 루프

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

# 1. Define tools
tools = [{
    "function_declarations": [{
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. Beijing"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city"]
        }
    }]
}]

# 2. First request: the model decides to call
contents = [types.Content(role="user", parts=[types.Part(text="How hot is it in Beijing right now?")])]

r1 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)

call = r1.candidates[0].content.parts[0].function_call
print(f"Model wants: {call.name}, args: {dict(call.args)}")

# 3. Execute locally (fake data standing in for a real lookup)
weather = {"city": call.args["city"], "temp": 26, "condition": "sunny"}

# 4. Return the result: append the model's reply (function_call + thought signature)
#    and the function result to the history
contents.append(r1.candidates[0].content)
contents.append(types.Content(
    role="user",
    parts=[types.Part(
        function_response=types.FunctionResponse(name=call.name, response=weather)
    )]
))

r2 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)
print(r2.text)
```

<Warning>
  **Gemini 3 thought signatures를 반환해야 합니다**: `function_call` 부분에는 암호화된 `thought_signature`가 포함되며, 두 번째 요청에는 **모델의 전체 reply Content를 히스토리에서 변경 없이 그대로 포함해야 합니다**(위의 4단계). signature가 누락되면 reasoning chain이 끊어져 요청이 실패할 수 있습니다. 공식 `google-genai` SDK는 위의 패턴을 사용해 이를 자동으로 처리합니다. 수동으로 작성한 REST 호출에서 이 필드를 제거하지 마십시오.
</Warning>

## Calling Modes

```python theme={null}
config = {
    "tools": tools,
    "tool_config": {"function_calling_config": {"mode": "AUTO"}}
}
```

| Mode                         | Behavior                                                                  |
| ---------------------------- | ------------------------------------------------------------------------- |
| `AUTO` (recommended default) | Model decides whether to call                                             |
| `ANY`                        | Forces a function call; combine with `allowed_function_names` to restrict |
| `NONE`                       | No calls — text only                                                      |

```python theme={null}
# Force get_weather only
config = {
    "tools": tools,
    "tool_config": {
        "function_calling_config": {
            "mode": "ANY",
            "allowed_function_names": ["get_weather"]
        }
    }
}
```

## 병렬 및 다단계 호출

* **병렬**: 한 턴에서 여러 `function_call` 부분을 반환할 수 있습니다(예: 한 번에 두 도시); 각 부분을 실행하고 모든 `function_response` 부분을 함께 반환합니다
* **다단계**: 모델은 "호출 → 결과 확인 → 다시 호출"을 연쇄할 수 있습니다. 응답에 더 이상 `function_call`이 없을 때까지 반복하십시오. 무한한 비용 증가를 막기 위해 루프에 상한을 둡니다

```python theme={null}
# Generic agent loop skeleton
MAX_ROUNDS = 5
for _ in range(MAX_ROUNDS):
    response = client.models.generate_content(
        model="gemini-3.5-flash", contents=contents, config={"tools": tools}
    )
    parts = response.candidates[0].content.parts
    calls = [p.function_call for p in parts if getattr(p, "function_call", None)]
    if not calls:
        print(response.text)  # no more calls — final answer
        break

    contents.append(response.candidates[0].content)  # includes thought signatures
    result_parts = [
        types.Part(function_response=types.FunctionResponse(
            name=c.name, response=execute(c.name, dict(c.args))
        ))
        for c in calls
    ]
    contents.append(types.Content(role="user", parts=result_parts))
```

## 모범 사례

* **설명은 모델을 위해 작성합니다**: "언제 호출해야 하는지"를 명확히 적고, 자유 형식 문자열 대신 `enum`로 매개변수를 좁히십시오
* **도구 정의는 안정적으로 유지합니다**: 이들은 캐시 접두사 매칭에 참여하므로, 잦은 변경은 [캐시 적중](/ko/api-capabilities/gemini/prompt-caching)에 불리합니다
* **외부 도구 대신 결정적인 JSON 출력을 원하십니까?** FC 대신 `response_schema` 구조화된 출력을 고려하십시오( [네이티브 호출](/ko/api-capabilities/gemini/native) 매개변수 표 참조 )
* 샌드박스 환경의 계산에는 자체 계산기 함수를 작성하는 대신 내장 [code\_execution](/ko/api-capabilities/gemini/multimodal) 도구를 사용하십시오

## 흔한 함정

| 증상                           | 해결 방법                                                                  |
| ---------------------------- | ---------------------------------------------------------------------- |
| 2차 응답 오류 / 모순된 답변            | 모델 응답(사고 시그니처 포함)을 그대로 덧붙이지 않았습니다 — 전체 `candidates[0].content`를 덧붙이십시오 |
| `json.loads`가 `args`에서 실패합니다 | Gemini의 `args`는 문자열이 아니라 객체입니다 — `dict(call.args)`를 사용하십시오             |
| 모델이 함수를 호출하지 않습니다            | 설명을 더 구체적으로 하거나 `mode: "ANY"`로 강제하십시오                                  |
| OpenAI식 tools 정의가 거부됩니다      | 두 형식은 섞을 수 없습니다 — 위의 내용에 따라 `function_declarations`로 다시 작성하십시오         |

## 관련 링크

* 이 그룹: [네이티브 호출](/ko/api-capabilities/gemini/native) · [멀티모달 및 코드 실행](/ko/api-capabilities/gemini/multimodal) · [캐시 과금](/ko/api-capabilities/gemini/prompt-caching)
* OpenAI 대응 항목: [OpenAI Function Calling](/ko/api-capabilities/openai/function-calling)
* 공식 Google 문서: `ai.google.dev/gemini-api/docs/function-calling`
