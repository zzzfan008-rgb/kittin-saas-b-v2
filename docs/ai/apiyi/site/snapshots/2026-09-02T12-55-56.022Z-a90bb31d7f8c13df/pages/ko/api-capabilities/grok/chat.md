> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 채팅 및 추론 가이드

> APIYI의 Grok 시리즈에 대해 검증된 Chat Completions 기능: 스트리밍, chain-of-thought reasoning_content 및 그 과금, json_schema를 통한 구조화된 출력, 함수 호출, 비전 입력, 자동 프롬프트 캐싱.

이 페이지에서는 Grok 시리즈가 `/v1/chat/completions` 엔드포인트에서 수행할 수 있는 모든 기능을 다룹니다. 모든 결론은 2026년 7월 13일(UTC+8)에 APIYI 게이트웨이를 대상으로 한 실사용 테스트에서 나온 것입니다.

## 기본 채팅과 스트리밍

6개 모델 모두 표준 OpenAI 형식과 스트리밍을 지원합니다. `stream_options: {"include_usage": true}`은 작동이 검증되었습니다(최종 청크에 전체 사용량이 포함됩니다):

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

stream = client.chat.completions.create(
    model="grok-4.3",
    messages=[{"role": "user", "content": "Count from 1 to 5, one number per line"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    if chunk.usage:
        print(f"\nUsage: {chunk.usage.total_tokens} tokens")
```

측정된 스트리밍 첫 토큰까지의 시간은 모든 모델에서 1.5–2.3초이며, 비스트리밍 단답형 Q\&A는 전체적으로 1.7–5.1초에 완료됩니다.

## 체인 오브 사고(추론)

이것은 Grok 시리즈에서 가장 자주 오해되는 과금 측면입니다 — 이 섹션 전체를 읽어 보시기 바랍니다.

### 어떤 모델이 체인 오브 사고를 출력하는가

| 모델                                         | 추론 동작                                                      |
| ------------------------------------------ | ---------------------------------------------------------- |
| `grok-4.5` / `grok-4.3` / `grok-build-0.1` | **기본적으로 켜짐**; 응답에 `reasoning_content`가 포함됩니다; 비활성화할 수 없습니다 |
| `grok-4.20-0309-reasoning`                 | 켜짐, `reasoning_content`를 포함합니다                             |
| `grok-4.20-0309-non-reasoning`             | 꺼짐; `reasoning_tokens`는 0입니다; 직접 답변합니다                     |
| `grok-4.20-multi-agent-beta-0309`          | 내부 추론은 노출되지 않지만, `reasoning_tokens`는 여전히 과금됩니다             |

<Warning>
  **추론 token은 출력 과금에 포함됩니다.** 한 번 측정한 짧은 Q\&A에서는 보이는 답변이 30 token에 불과했지만 586 출력 token이 과금되었으며(그중 556개는 추론이었습니다). 고빈도 짧은 Q\&A에서는 `grok-4.20-0309-non-reasoning`이 상당히 절약됩니다.
</Warning>

### 체인 오브 사고와 추론 사용량 읽기

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.20-0309-reasoning",
    messages=[{"role": "user", "content": "Pipe A fills a pool in 8h, pipe B in 12h. How long together?"}]
)
msg = resp.choices[0].message
print("Answer:", msg.content)
print("Chain-of-thought:", msg.reasoning_content)
print("Reasoning tokens:", resp.usage.completion_tokens_details.reasoning_tokens)
```

### reasoning\_effort 매개변수

`reasoning_effort`(예: `"low"` / `"high"`)는 **`grok-4.5`에서만 허용됩니다**; `grok-4.20-0309-reasoning`는 이를 400 `Model ... does not support parameter reasoningEffort`로 명시적으로 거부합니다. 모델 간 코드에 이 매개변수를 하드코딩하지 마십시오.

## 구조화된 출력

OpenAI 표준 `response_format: json_schema`(strict mode)이 지원됩니다. `grok-4.5` / `grok-4.3` / `grok-build-0.1` / `grok-4.20-0309-reasoning` 및 멀티 에이전트 모델에서 검증된 통과가 확인되었으며, 모두 스키마를 엄격하게 준수하는 JSON을 반환합니다:

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{"role": "user", "content": "Zhang San is 25 and lives in Hangzhou. Extract the info."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "city": {"type": "string"}
                },
                "required": ["name", "age", "city"],
                "additionalProperties": False
            }
        }
    }
)
print(resp.choices[0].message.content)   # {"name":"Zhang San","age":25,"city":"Hangzhou"}
```

## 함수 호출

OpenAI 표준 `tools` / `tool_choice` 필드와 전체 2라운드 도구 호출 흐름을 지원합니다(`grok-4.5` / `grok-4.3` / `grok-build-0.1`에서 검증됨):

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "City name"}},
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in Shanghai right now?"}]

# Round 1: the model decides to call the tool
resp = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
msg = resp.choices[0].message
tool_call = msg.tool_calls[0]
print(tool_call.function.name, tool_call.function.arguments)  # get_weather {"city":"Shanghai"}

# Round 2: feed the tool result back
messages += [
    msg,
    {"role": "tool", "tool_call_id": tool_call.id,
     "content": '{"city": "Shanghai", "temp_c": 31, "condition": "sunny"}'}
]
resp2 = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
print(resp2.choices[0].message.content)  # It's sunny in Shanghai, 31°C.
```

`tool_choice`(`{"type": "function", "function": {"name": "get_weather"}}`)를 통한 강제 도구 호출도 동작함이 검증되었습니다.

<Tip>
  이 섹션은 **클라이언트 측 함수 호출**에 관한 것입니다(사용자 코드가 도구를 실행합니다). xAI의 서버가 대신 검색하거나, 코드를 실행하거나, MCP에 연결하게 하려면 Responses API를 사용하십시오. [웹 및 X 검색](/ko/api-capabilities/grok/web-search)과 [코드 실행 및 MCP](/ko/api-capabilities/grok/code-execution-mcp)를 참조하십시오.
</Tip>

## Vision Input (이미지 이해)

Grok 4.x chat 모델은 OpenAI Vision 형식으로 이미지 입력(jpg / png, 이미지당 최대 20MiB)을 허용합니다. `grok-4.5` / `grok-4.3` / `grok-4.20-0309-non-reasoning`에서 검증되었으며, 모두 도형과 색상을 정확하게 식별했습니다:

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
        ]
    }]
)
print(resp.choices[0].message.content)
```

<Warning>
  **base64 data URL을 우선 사용하십시오.** 외부 URL을 사용하면 이미지는 xAI의 상위 서버에 의해 직접 가져와집니다. 테스트에서는 일부 이미지 호스트(예: Wikimedia)가 서버 측 가져오기를 거부하여 `image_download_error`로 요청이 실패했습니다. 외부 URL을 반드시 사용해야 한다면, 호스트가 서버 측 접근을 허용하는지 확인하고 URL이 이미지 파일을 직접 가리키는지 확인하십시오.
</Warning>

## 프롬프트 캐싱(자동)

Grok 프리픽스 캐싱은 **자동 — 별도 설정 불필요**이며, 캐시된 부분은 할인된 요율로 과금됩니다(`grok-4.6`에서는 0.25×, 즉 75% 절감):

```python theme={null}
resp = client.chat.completions.create(model="grok-4.6", messages=messages)
print("Cache hits:", resp.usage.prompt_tokens_details.cached_tokens)
```

최적화: 안정적인 콘텐츠(시스템 prompt, few-shot 예시)는 메시지 앞부분에, 변동이 있는 콘텐츠는 뒷부분에 배치하여 접두사 적중을 최대화하십시오. xAI는 캐시 항목이 제거될 수 있고 적중이 보장되지 않는다고 밝히므로, **캐시 미적용 가격을 기준으로 예산을 잡으십시오**.

적중 해석 방법, 128-token 블록 단위, 그리고 긴 대화에 어떤 엔드포인트가 적합한지에 대해서는 [Grok 캐시 과금 가이드](/ko/api-capabilities/grok/prompt-caching)를 참조하십시오.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="grok-4.5의 추론 과정을 어떻게 끌 수 있습니까?">
    그럴 수 없습니다. 내부 추론은 `grok-4.5` / `grok-4.3` / `grok-build-0.1`에 본질적으로 포함되어 있습니다. 추론 과정이 필요 없고 빠르고 저렴한 답변을 원한다면 대신 `grok-4.20-0309-non-reasoning`을 사용하십시오.
  </Accordion>

  <Accordion title="reasoning_content를 다음 턴의 컨텍스트에 다시 넣어야 합니까?">
    아닙니다. 다중 턴 대화에서 기록을 다시 재생할 때는 `content`만 반환하십시오(도구 호출 필드 추가). `reasoning_content`은 표준 필드가 아니며 — 이를 다시 보내면 입력 tokens만 불필요하게 늘어납니다.
  </Accordion>

  <Accordion title="max_tokens를 어떻게 설정해야 합니까?">
    추론 과정도 출력 예산을 소모합니다. `max_tokens`가 너무 작으면 추론이 전체 예산을 다 써서 보이는 답변이 잘릴 수 있습니다. reasoning 모델은 2048 이상으로 시작하십시오.
  </Accordion>

  <Accordion title="temperature / top_p가 작동합니까?">
    네, 정상적으로 허용됩니다. reasoning 계열 모델은 기존 모델보다 샘플링 매개변수에 덜 민감하므로 조정 여지는 제한적입니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Grok 개요" icon="rocket" href="/ko/api-capabilities/grok/overview">
    모델 라인업, 가격, 그리고 기능 매트릭스
  </Card>

  <Card title="캐시 과금" icon="database" href="/ko/api-capabilities/grok/prompt-caching">
    캐시 적중 시 75% 할인, 이를 읽는 방법, 그리고 긴 대화를 구성하는 방법
  </Card>

  <Card title="Web & X 검색" icon="globe" href="/ko/api-capabilities/grok/web-search">
    서버 측 실시간 검색 도구를 실습해보기
  </Card>
</CardGroup>
