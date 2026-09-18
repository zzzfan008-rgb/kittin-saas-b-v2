> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Function Calling 가이드

> 도구 정의, 엄격 모드, 병렬 호출, 스트리밍 조합 — 그리고 responses와 chat/completions 엔드포인트 간의 형식 차이입니다.

Function Calling(FC)은 에이전트 구축의 기반입니다: **모델은 절대 함수를 실행하지 않으며, 오직 “어떤 함수를 어떤 인자로 호출할지”만 출력합니다**. 실행은 사용자 자신의 코드에서 이루어지며, 사용자는 그 결과를 다시 보내고 모델은 최종 답변을 생성합니다.

이 페이지는 공식 OpenAI 문서(`developers.openai.com/api/docs/guides/function-calling`, 2026년 6월 기준)를 바탕으로 합니다. 두 엔드포인트의 예시는 그대로 복사해 붙여넣을 수 있습니다.

## 전체 호출 루프

<Steps>
  <Step title="도구 정의">
    함수 이름, 설명, 매개변수 JSON Schema를 요청과 함께 보냅니다
  </Step>

  <Step title="모델이 호출을 반환합니다">
    모델이 호출하기로 결정하면 함수 이름과 JSON 인수를 반환합니다
  </Step>

  <Step title="로컬에서 실행">
    코드는 인수를 파싱한 뒤 실제로 함수를 실행합니다(DB를 조회하거나 외부 API를 호출하는 등)
  </Step>

  <Step title="결과를 다시 보냅니다">
    두 번째 요청에서 대화와 함께 결과를 보내면 모델이 이를 바탕으로 응답합니다
  </Step>
</Steps>

## 두 엔드포인트 간 주요 형식 차이

`/v1/chat/completions`와 `/v1/responses`에서 동일한 기능의 필드 형식이 다릅니다 — 가장 흔한 통합 함정입니다:

|       | 채팅 완성                                                            | 응답                                                                     |
| ----- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 도구 정의 | 중첩됨: `{"type": "function", "function": {name, parameters, ...}}` | 평면형: `{"type": "function", "name": ..., "parameters": ...}`            |
| 호출 출력 | `message.tool_calls[]`(`id` 포함)                                  | 최상위 출력 항목: `{"type": "function_call", "call_id", "name", "arguments"}` |
| 결과 반환 | `{"role": "tool", "tool_call_id": ..., "content": ...}`          | `{"type": "function_call_output", "call_id": ..., "output": ...}`      |
| 엄격 모드 | `"strict": true`을 명시적으로 설정합니다                                    | 서버가 가능한 경우 스키마를 strict로 정규화합니다                                         |

<Warning>
  두 형식은 **혼합할 수 없습니다**. Chat Completions의 중첩된 `function: {...}` 정의를 `/v1/responses`에 전송하거나(그 반대의 경우도 마찬가지), 하는 것이 “잘못된 매개변수” SDK 오류가 발생하는 가장 흔한 원인입니다.
</Warning>

기존 도구 호출 흐름을 Chat Completions에서 Responses로 이전하는 방법은 [엔드포인트 및 마이그레이션](/ko/api-capabilities/openai/responses-migration)에서 전체 이전/이후 코드 비교와 함께 설명합니다. 예를 들어 `tools`와 `reasoning_effort`를 함께 사용하는 것에 대한 GPT-5.4+ 제한에 도달한 경우가 이에 해당합니다.

## Full Example: Chat Completions

완전한 define → call → execute → return 루프를 통한 날씨 조회 예시입니다:

<CodeGroup>
  ```python Python theme={null}
  import json
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
              "type": "object",
              "properties": {
                  "city": {"type": "string", "description": "City name, e.g. Beijing"}
              },
              "required": ["city"],
              "additionalProperties": False
          },
          "strict": True
      }
  }]

  messages = [{"role": "user", "content": "What's the weather in Beijing?"}]

  # 1st request: the model decides to call the function
  r1 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  tool_call = r1.choices[0].message.tool_calls[0]
  args = json.loads(tool_call.function.arguments)

  # Execute locally (fake data standing in for a real lookup)
  weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

  # 2nd request: return the result; the model writes the final answer
  messages.append(r1.choices[0].message)
  messages.append({
      "role": "tool",
      "tool_call_id": tool_call.id,
      "content": json.dumps(weather)
  })

  r2 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  print(r2.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const tools = [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name, e.g. Beijing' }
        },
        required: ['city'],
        additionalProperties: false
      },
      strict: true
    }
  }];

  const messages = [{ role: 'user', content: "What's the weather in Beijing?" }];

  const r1 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  const toolCall = r1.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);

  const weather = { city: args.city, temp: '26°C', condition: 'sunny' };

  messages.push(r1.choices[0].message);
  messages.push({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify(weather)
  });

  const r2 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  console.log(r2.choices[0].message.content);
  ```

  ```bash cURL (1st request) theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [{"role": "user", "content": "What is the weather in Beijing?"}],
      "tools": [{
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
            "additionalProperties": false
          },
          "strict": true
        }
      }]
    }'
  ```
</CodeGroup>

## 전체 예시: 응답

세 가지 차이점에 주목하십시오: 도구 정의는 **평면 구조**이며, 호출은 최상위 `function_call` 항목으로 돌아오고, 결과는 `function_call_output`로 반환됩니다. `previous_response_id`를 사용하면 두 번째 요청에서 전체 기록을 다시 보낼 필요가 없습니다:

```python theme={null}
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

tools = [{
    "type": "function",          # flat definition — no nested "function" field
    "name": "get_weather",
    "description": "Get current weather for a city",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name, e.g. Beijing"}
        },
        "required": ["city"],
        "additionalProperties": False
    }
}]

# 1st request
r1 = client.responses.create(
    model="gpt-5.4",
    input="What's the weather in Beijing?",
    tools=tools
)

# Find the function_call item in the output array
call = next(item for item in r1.output if item.type == "function_call")
args = json.loads(call.arguments)

weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

# 2nd request: chain with previous_response_id, return only the function result
r2 = client.responses.create(
    model="gpt-5.4",
    previous_response_id=r1.id,
    input=[{
        "type": "function_call_output",
        "call_id": call.call_id,
        "output": json.dumps(weather)
    }],
    tools=tools
)
print(r2.output_text)
```

## strict 모드 (구조화된 출력)

`strict: true`는 모델의 인수가 **JSON Schema를 정확히 준수하도록** 보장합니다 — 환각된 필드나 누락된 필드는 없습니다. 세 가지 요구사항이 있습니다:

1. 스키마에는 `"additionalProperties": false`가 포함되어야 합니다
2. 모든 필드는 `required`에 나타나야 합니다(옵셔널성은 `"type": ["string", "null"]`로 표현합니다)
3. 지원되는 JSON Schema 하위 집합만 사용할 수 있습니다(원시 타입, enum, 배열, 중첩 객체, …)

```json theme={null}
// ✅ Valid strict schema
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
    "date": {"type": ["string", "null"], "description": "Optional, defaults to today"}
  },
  "required": ["city", "unit", "date"],
  "additionalProperties": false
}
```

```json theme={null}
// ❌ Invalid: missing additionalProperties, date not in required
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "date": {"type": "string"}
  },
  "required": ["city"]
}
```

<Warning>
  **strict mode는 parallel function calls와 호환되지 않습니다**: strict 스키마 보장이 필요할 때는 `parallel_tool_calls: false`도 설정합니다.
</Warning>

## parallel\_tool\_calls and tool\_choice

### 병렬 호출

`parallel_tool_calls`은 기본값으로 켜져 있습니다: 모델은 한 번의 턴에서 여러 함수를 요청할 수 있습니다(예: 베이징과 상하이의 날씨를 동시에 요청). 각 함수를 실행한 뒤, 다음 요청 전에 **모든 결과를 반환**해야 합니다 — 각 결과는 반드시 해당 `call_id`(응답) 또는 `tool_call_id`(채팅)과 짝을 이루어야 합니다.

### tool\_choice 전략

| 값                                             | 동작                         |
| --------------------------------------------- | -------------------------- |
| `"auto"` (기본값)                                | 모델이 무엇을 호출할지와 호출 여부를 결정합니다 |
| `"required"`                                  | 최소 하나의 함수를 호출해야 합니다        |
| `{"type": "function", "name": "get_weather"}` | 특정 함수를 강제로 호출합니다           |
| `"none"`                                      | 호출 없음 — 텍스트만 사용합니다         |

### allowed\_tools 하위 집합

이번 턴에 도구는 많지만 그중 일부만 노출하고 싶다면, `allowed_tools` 형식의 `tool_choice`를 사용하여 호출 가능한 하위 집합을 제한하십시오 — 이렇게 해도 도구 목록 자체는 **수정되지 않으므로**, [캐싱](/ko/api-capabilities/openai/prompt-caching)을 위한 안정적인 접두사가 깨지지 않습니다:

```python theme={null}
tool_choice={
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [{"type": "function", "name": "get_weather"}]
}
```

## 스트리밍에서 함수 호출

### Chat Completions: 인덱스로 조립

함수 인자는 조각 형태로 스트리밍됩니다. `arguments` 문자열을 `index`별로 누적한 다음, 스트림이 끝난 뒤 `json.loads`합니다:

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4", messages=messages, tools=tools, stream=True
)

calls = {}  # index -> {name, arguments}
for chunk in stream:
    delta = chunk.choices[0].delta if chunk.choices else None
    if delta and delta.tool_calls:
        for tc in delta.tool_calls:
            entry = calls.setdefault(tc.index, {"name": "", "arguments": ""})
            if tc.function.name:
                entry["name"] = tc.function.name
            if tc.function.arguments:
                entry["arguments"] += tc.function.arguments

print(calls)  # arguments are complete JSON only after the stream ends
```

### Responses: 의미 기반 이벤트를 수신

`response.function_call_arguments.delta` 이벤트는 인자 증분을 전달하며, `response.function_call_arguments.done`는 완전한 인자를 제공합니다 — 인덱스를 수동으로 조립할 필요가 없습니다.

## 모범 사례와 함정

좋은 도구 정의를 작성하는 방법입니다:

* **이름과 설명은 모델을 위해 작성합니다**: “언제 호출해야 하는지”를 명확히 적으십시오. 예: `"Get real-time weather; call only when the user explicitly asks about weather"`
* **enum으로 매개변수를 좁히십시오**: 값이 열거 가능하면 자유 형식 문자열을 사용하지 마십시오. 대부분의 환각된 인수를 제거합니다.
* **도구 정의는 프롬프트 앞부분에 두고 안정적으로 유지하십시오**: 도구는 캐시 접두사에 참여합니다. 정의가 안정적이면 입력 비용이 90% 절감됩니다([Cache Billing](/ko/api-capabilities/openai/prompt-caching) 참조)
* **에이전트 루프에 상한을 두십시오**: 최대 라운드 수를 설정하여 모델이 호출 → 반환 → 호출을 반복하면서 비용을 소모하지 못하게 하십시오

흔한 함정입니다:

| 증상                          | 해결 방법                                                                       |
| --------------------------- | --------------------------------------------------------------------------- |
| `arguments`가 유효한 JSON이 아닙니다 | `strict: true`을 켜십시오 — 근본적으로 해결합니다                                          |
| 모델이 존재하지 않는 함수를 호출합니다       | `tool_choice`로 더 엄격하게 제한하고, 설명이 오해를 유발하는지 확인하십시오                            |
| 병렬 호출 후 `call_id` 불일치       | 각 결과는 해당 `call_id` / `tool_call_id`와 일대일로 짝지어져야 합니다 — 하나라도 짝이 없으면 요청이 실패합니다 |
| 혼합 형식으로 인한 매개변수 오류          | 위의 차이 표를 확인하고, 정의 형태(중첩/평면)를 엔드포인트에 맞추십시오                                   |

## 모델 지원 및 선택

전체 gpt-5 시리즈는 함수 호출을 지원합니다. 시나리오별로 보면 다음과 같습니다.

| 시나리오              | 권장 모델                                   | 이유                  |
| ----------------- | --------------------------------------- | ------------------- |
| 일상적인 에이전트 / 도구 사용 | `gpt-5.4` (\$2.50 / \$15.00 per 1M)     | 기능과 비용의 균형이 가장 좋습니다 |
| 고빈도 경량 라우팅        | `gpt-5.4-mini` (\$0.75 / \$4.50 per 1M) | 저렴하며 단순 분배에 충분합니다   |
| 복잡한 다단계 추론 에이전트   | `gpt-5.5` (\$5.00 / \$30.00 per 1M)     | 긴 계획 체인에서 더 안정적입니다  |

## 관련 링크

* 이 그룹: [Native Calls](/ko/api-capabilities/openai/native) · [호환 모드](/ko/api-capabilities/openai/compatible) · [캐시 과금](/ko/api-capabilities/openai/prompt-caching)
* token 조회 / 관리: `https://api.apiyi.com/token`
* OpenAI 공식 문서: `developers.openai.com/api/docs/guides/function-calling`
