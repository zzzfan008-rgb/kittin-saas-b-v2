> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 엔드포인트 선택: GPT-5.4+를 Responses로 마이그레이션하기

> GPT-5.4 이상에서는 /v1/chat/completions에서 tools와 추론 강도를 함께 전송하면 400 오류와 함께 요청이 즉시 거부될 수 있습니다. 이 페이지에서는 해당 문제가 발생했는지 확인하는 방법, 두 가지 해결 방법 중 선택하는 방법, 전체 도구 호출 예시를 포함하여 코드에서 정확히 변경해야 하는 부분, 그리고 마이그레이션을 확인하는 방법을 다룹니다.

<Note>
  **요약하면**: GPT-5.4 및 이후 모델에서는 **`tools`를 명시적인 `reasoning_effort`와 함께 전송하는 경우**(`none` 이외의 모든 값) `/v1/chat/completions`로 보내면 상위 서버에서 400 오류와 함께 거부될 수 있습니다: `Function tools with reasoning_effort are not supported ...`.

  두 가지 해결 방법이 있습니다: **도구가 포함된 요청을 `/v1/responses`로 이동**하면(추론과 도구를 모두 유지하며 권장됨), 또는 **`reasoning_effort="none"`를 명시적으로 설정**하면(엔드포인트는 유지하지만 추론을 포기합니다). `tools`가 없는 요청에는 영향이 없습니다.
</Note>

## 먼저, 이것이 실제로 발생한 문제인지 확인합니다

이 문제는 세 가지 방식으로 나타납니다. 두 번째 방식은 잘못 판단하기 가장 쉽습니다.

### 증상 1: 명시적인 400 오류

```text theme={null}
Function tools with reasoning_effort are not supported for gpt-5.6-sol in
/v1/chat/completions. To use function tools, use /v1/responses or set
reasoning_effort to 'none'.
```

응답에는 `param: reasoning_effort`가 포함됩니다. 이는 APIYI 게이트웨이 문제가 아니라 **OpenAI의 공식 제한**입니다. 동일한 요청을 OpenAI에 직접 보내도 똑같이 동작합니다.

### 증상 2: 어떤 때는 작동하고 어떤 때는 실패함

단일 모델이 여러 업스트림 라우트 뒤에 있을 수 있으며, **모든 라우트가 이 제한을 적용하는 것은 아닙니다**. 2026-09-02에 기본 그룹, 동일한 키와 동일한 시간대에서 조합별로 6회씩 자체 측정한 결과는 다음과 같습니다.

| 모델              | `tools` + `reasoning_effort="medium"` |
| --------------- | ------------------------------------- |
| `gpt-5.6-luna`  | 6/6회 400 반환                           |
| `gpt-5.6-sol`   | 6/6회 200 반환, 도구가 정상적으로 호출됨            |
| `gpt-5.6-terra` | 6/6회 200 반환, 도구가 정상적으로 호출됨            |
| `gpt-5.4`       | 6/6회 200 반환, 도구가 정상적으로 호출됨            |

같은 날 더 이른 시간에는 한 고객이 `gpt-5.6-sol`에서 이 400 오류를 실제로 받았습니다.

<Warning>
  **“방금은 정상적으로 작동했습니다”라는 사실만으로 안전하다고 판단할 수는 없습니다.** 동일한 모델과 동일한 코드라도 다른 시간이나 다른 그룹에서 400을 반환하기 시작할 수 있습니다. Responses API로 전환하거나 `reasoning_effort="none"`를 명시적으로 설정하십시오. 두 방법 모두 모든 라우트에서 안정적으로 작동합니다.
</Warning>

### 증상 3: 오류는 없지만 도구가 전혀 호출되지 않음

모델이 도구를 호출해야 하는데 대신 잡담으로 응답한다면(`finish_reason`는 `stop`이고 `tool_calls`는 비어 있음), 먼저 prompt를 다시 작성하지 마십시오. `reasoning_effort`을 `none`로 명시적으로 설정하여 한 번 다시 보내십시오. 그때 도구가 정상적으로 호출된다면 문제는 prompt가 아니라 매개변수 조합입니다.

## 제한 사항의 적용 범위

|                                                                              | 적용 대상                                        |
| ---------------------------------------------------------------------------- | -------------------------------------------- |
| `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4` 제품군 | 예 — 경로에 따라 다르며, 위 내용을 참조하십시오                 |
| `gpt-5.2` / `gpt-5.1` / `gpt-5` 및 이전 버전                                      | 공식 발표의 적용 대상이 아닙니다                           |
| Claude, Gemini, Grok 및 기타 non-OpenAI 모델                                      | 관련이 없으며 영향을 받지 않습니다                          |
| `tools`이 없는 요청                                                               | 영향을 받지 않으며, 원하는 `reasoning_effort`을 전송하면 됩니다 |
| `/v1/responses`에 대한 요청                                                       | 영향을 받지 않으며, reasoning과 tools가 함께 작동합니다       |

트리거는 **명시적으로 non-`none` effort level을 전송하는 것**입니다. 테스트에서는 `low`, `medium`, `high`, `xhigh` 네 가지 모두 이 제한을 트리거했습니다.

<Note>
  **`reasoning_effort`을 생략해도 트리거되지 않습니다.** 400 오류가 결정적으로 재현되는 `gpt-5.6-luna` 경로에서는 네 가지 effort level 모두 400을 반환했지만, 매개변수를 생략하면 `tool_calls`을 6회 중 6회 올바르게 반환했습니다. 따라서 최소한의 긴급 수정 방법은 두 가지입니다. `none`을 명시적으로 설정하거나 매개변수를 완전히 제거하면 됩니다.
</Note>

## 선택할 방법

|        | `/v1/responses`로 이동             | `reasoning_effort="none"` 설정          |
| ------ | ------------------------------- | ------------------------------------- |
| 추론 유지  | 예, 모든 노력 수준에서 완전히 유지됩니다         | 아니요 — 추론이 꺼지고 모델이 계획 수립 단계를 잃습니다      |
| 변경 규모  | 요청과 응답 형식이 모두 변경됩니다. 아래를 참조하십시오 | 추가 매개변수 하나, 한 줄입니다                    |
| 안정성    | 모든 경로에서 일관됩니다                   | 모든 경로에서 일관됩니다                         |
| 적합한 대상 | 에이전트, 다단계 도구 오케스트레이션, 장기적인 해법   | 프로덕션 긴급 대응, 간단한 도구 로직, 아직 변경할 수 없는 코드 |

복잡한 도구 기반 작업에서는 추론을 끄면 모델의 성능이 눈에 띄게 저하됩니다. 모델이 어떤 도구를 어떤 순서로 호출할지 판단하는 단계를 잃기 때문입니다. `none`는 최종 목적지가 아니라 임시방편으로 간주하십시오.

## 오류를 피하는 것만이 전부는 아닙니다

제한에 한 번도 도달하지 않더라도, Responses는 OpenAI가 새 프로젝트에 권장하는 엔드포인트입니다. 공식적으로 동일한 추론 모델은 Responses를 통해 SWE-bench에서 더 높은 점수를 기록하며, 캐시 활용률은 Chat Completions보다 상당히 높고, 웹 검색 및 코드 인터프리터와 같은 기본 제공 도구는 이곳에서만 사용할 수 있습니다. 수치와 자세한 내용은 [네이티브 호출](/ko/api-capabilities/openai/native)에서 확인할 수 있습니다.

캐시 관련 내용은 청구서에 직접 반영되는 부분입니다. **멀티턴 에이전트는 캐시 적중의 혜택을 가장 크게 받으며**, 멀티턴 에이전트는 바로 위의 제한에 도달할 가능성이 가장 높은 워크로드이기도 합니다. 캐시 과금 방식과 적중률 확인 방법은 [프롬프트 캐싱](/ko/api-capabilities/openai/prompt-caching)에서 확인할 수 있습니다.

## 어느 그룹에 해당합니까

| 통합 방식                                    | 수행할 작업                                                                                                                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **직접 코드를 작성합니다** (OpenAI SDK 또는 원시 HTTP) | 엔드포인트를 변경합니다 — 다음 섹션을 참조하십시오                                                                                                                                                                                                                           |
| **프레임워크를 사용합니다** (LangChain 및 유사 도구)     | 프레임워크에 Responses 전환 옵션이 있는지 확인하십시오. LangChain에는 `ChatOpenAI(..., use_responses_api=True)`이 있습니다. 전환 옵션이 없는 프레임워크에서는 `reasoning_effort="none"` 또는 다른 모델을 사용해야 합니다                                                                                       |
| **클라이언트 또는 IDE 플러그인을 사용합니다**             | 클라이언트 측에서 변경할 수 있는 사항은 없습니다. Responses를 지원하는 클라이언트가 필요합니다. 전체 지원 매트릭스는 [네이티브 호출](/ko/api-capabilities/openai/native)의 “현재 클라이언트 지원”에서 확인할 수 있으며, 특정 도구에 대해서는 [Trae](/ko/scenarios/programming/trae) 및 [Cline](/ko/scenarios/programming/cline)을 참조하십시오 |

## 코드에서 변경되는 사항

전체 필드 매핑은 [네이티브 호출](/ko/api-capabilities/openai/native)에 있습니다. 이 페이지의 주제가 도구 호출이므로, 여기서는 중요한 차이점 네 가지만 설명합니다.

|          | Chat Completions                              | Responses                                                  |
| -------- | --------------------------------------------- | ---------------------------------------------------------- |
| 추론 강도    | 최상위 `reasoning_effort="medium"`               | 중첩된 `reasoning={"effort": "medium"}`                       |
| 도구 정의    | 중첩: `{"type": "function", "function": {...}}` | 플랫: `{"type": "function", "name": ..., "parameters": ...}` |
| 호출 반환 형식 | `message.tool_calls[]`, `id`로 식별              | `output`의 `function_call` 항목, `call_id`로 식별                |
| 결과 전송 형식 | `{"role": "tool", "tool_call_id": ...}`       | `{"type": "function_call_output", "call_id": ...}`         |

<Warning>
  두 도구 형식은 **혼합할 수 없습니다**. Chat Completions 스타일의 중첩된 `function: {...}` 정의를 `/v1/responses`에 전송하거나 그 반대로 전송하는 것이 SDK에서 “유효하지 않은 매개변수” 오류가 발생하는 가장 일반적인 원인입니다. [함수 호출](/ko/api-capabilities/openai/function-calling)에서 자세한 내용을 확인할 수 있습니다.
</Warning>

동일한 날씨 도구 루프를 변경 전과 변경 후로 비교하면 다음과 같습니다.

<CodeGroup>
  ```python 이전: Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "Look up the weather for a city",
          "parameters": {
              "type": "object",
              "properties": {"city": {"type": "string"}},
              "required": ["city"],
          },
      },
  }]

  messages = [{"role": "user", "content": "What is the weather in Beijing today?"}]

  resp = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",              # sent alongside tools; may be rejected
  )

  call = resp.choices[0].message.tool_calls[0]
  messages.append(resp.choices[0].message)    # the assistant turn, verbatim
  messages.append({
      "role": "tool",
      "tool_call_id": call.id,
      "content": '{"temp": 26, "sky": "clear"}',
  })

  final = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",
  )
  print(final.choices[0].message.content)
  ```

  ```python 이후: Responses theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{                                  # flat, with no "function" wrapper
      "type": "function",
      "name": "get_weather",
      "description": "Look up the weather for a city",
      "parameters": {
          "type": "object",
          "properties": {"city": {"type": "string"}},
          "required": ["city"],
          "additionalProperties": False,
      },
  }]

  history = [{"role": "user", "content": "What is the weather in Beijing today?"}]

  resp = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},         # nested, and unrestricted here
  )

  call = next(i for i in resp.output if i.type == "function_call")
  history += resp.output                      # append the whole output verbatim
  history.append({
      "type": "function_call_output",
      "call_id": call.call_id,                # note: call_id, not id
      "output": '{"temp": 26, "sky": "clear"}',
  })

  final = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},
  )
  print(final.output_text)
  ```
</CodeGroup>

두 스니펫 모두 APIYI 기본 그룹을 대상으로 실행했습니다. 첫 번째 스니펫에서는 400 오류가 안정적으로 재현되고, 두 번째 스니펫에서는 전체 호출, 반환, 최종 답변 루프가 완료됩니다.

<Tip>
  `history += resp.output`을 건너뛰지 마십시오. `function_call` 외에도 출력에는 `reasoning` 항목이 포함될 수 있습니다. 이를 변경하지 않고 그대로 다시 전달해야 모델이 이전 사고 흐름을 이어갈 수 있으며, 이것이 바로 Responses가 여러 단계의 도구 작업에서 더 나은 성능을 발휘하는 이유입니다.
</Tip>

## 마이그레이션 중 발생하는 문제

<AccordionGroup>
  <Accordion title="output은 choices가 아니므로 인덱스로 접근하지 마십시오">
    `output`은 `reasoning`, `message`, `function_call` 항목을 동시에 포함할 수 있는 **항목 배열**이며, 순서나 개수는 보장되지 않습니다. 텍스트에는 `resp.output_text`을 사용하고, 도구 호출에는 `type == "function_call"`을 기준으로 필터링하며 반복 처리하십시오. 인덱스를 하드코딩하지 마십시오.
  </Accordion>

  <Accordion title="이름이 변경된 매개변수: max_tokens, response_format, temperature">
    `max_tokens`(또는 `max_completion_tokens`)는 `max_output_tokens`가 되고, `response_format`은 `text.format`이 됩니다. system prompt는 `messages`에서 최상위 `instructions`로 이동할 수 있습니다. 별도로 gpt-5 추론 모델은 어느 엔드포인트에서도 `temperature` 또는 `top_p`을 **지원하지 않으므로**, 해당 항목을 제거하고 대신 `reasoning.effort`을 통해 모델을 제어하십시오.
  </Accordion>

  <Accordion title="모든 사용량 필드의 이름이 변경됩니다">
    `usage.prompt_tokens`은 `usage.input_tokens`이 되고, `completion_tokens`는 `output_tokens`이 되며, 캐시 적중은 `usage.input_tokens_details.cached_tokens`에 저장됩니다. 사용량 집계도 동시에 업데이트하지 않으면 값이 조용히 0으로 기록됩니다.
  </Accordion>

  <Accordion title="다중 턴: 기록을 직접 관리하는 방식은 항상 작동하지만, 체이닝은 그룹에 따라 다릅니다">
    가장 안전한 방법은 **`input` 배열을 직접 관리**하고 각 턴의 `output`을 그대로 추가하는 것입니다. 이 방식은 모든 그룹과 모든 모델에서 작동하며, 위 예제에서도 이 방식을 사용합니다.

    `previous_response_id`을 사용한 체이닝은 2026-09-02에 기본 그룹에서 작동했습니다. `gpt-5.6-sol`, `terra`, `luna`, `gpt-5.4` 모두 이전 턴을 다시 불러왔고, `store`의 기본값은 `true`이며, `store: false`을 전송한 후 체이닝하면 이전 응답을 찾을 수 없다는 내용이 올바르게 보고됩니다. `GET /v1/responses/{id}`을 사용한 기록 조회는 아직 사용할 수 없습니다. **사용하기 전에 본인의 그룹에서 직접 확인하십시오.** 배경 정보: [다중 턴 대화](/ko/api-capabilities/multi-turn-conversation).
  </Accordion>

  <Accordion title="스트리밍은 델타 연결이 아니라 의미가 있는 이벤트 스트림입니다">
    채팅 완성은 일련의 `delta` 증분을 스트리밍하고, 응답은 `response.output_text.delta` 및 `response.function_call_arguments.delta`과 같은 유형이 지정된 이벤트를 스트리밍합니다. 스트리밍 파서는 재사용하지 말고 새로 작성해야 합니다. [네이티브 호출](/ko/api-capabilities/openai/native)을 참조하십시오.
  </Accordion>
</AccordionGroup>

## 마이그레이션 확인

HTTP 200에서 멈추지 마십시오. 다음 네 가지를 확인하십시오.

<Steps>
  <Step title="출력에 실제로 function_call이 포함되어 있는지 확인">
    `[i.type for i in resp.output]`을 출력하십시오. 더 높은 추론 수준에서는 `reasoning`이 앞에 오고 `function_call`가 표시되어야 합니다. `message`만 표시된다면 도구가 호출되지 않은 것입니다.
  </Step>

  <Step title="사용량 필드에 여전히 값이 기록되는지 확인">
    `usage.input_tokens`과 `output_tokens`가 0이 아닌지, 그리고 `output_tokens_details.reasoning_tokens`이 추론 수준에 따라 변하는지 확인하십시오.
  </Step>

  <Step title="캐시 적중이 발생하기 시작하는지 확인">
    여러 번의 대화를 실행하고 `usage.input_tokens_details.cached_tokens`이 0보다 커지는지 확인하십시오. 이는 호환성 모드에 비해 Responses가 제공하는 가장 직접적인 과금 혜택입니다.
  </Step>

  <Step title="이전에 400을 반환했던 요청을 다시 실행">
    동일한 `tools` 및 `reasoning_effort` 조합이 이제 일관되게 통과되어야 합니다. 향후 모델 교체 시 문제가 즉시 드러나도록 회귀 테스트 사례로 유지하십시오.
  </Step>
</Steps>

## 마이그레이션하지 않아도 되는 경우

이는 양자택일이 아닙니다. 다음과 같은 경우에는 호환성 모드를 계속 사용하는 것이 충분히 합리적입니다.

* **도구 호출을 사용하지 않는 경우** — 제한이 적용되지 않으므로 어떤 `reasoning_effort`든 전송할 수 있습니다
* **하나의 코드 경로로 여러 공급업체를 호출하는 경우** — 여기에서는 Claude와 Gemini가 `/v1/chat/completions`만 제공하며, OpenAI만을 위해 코드를 분기하는 것이 반드시 이득이 되지는 않습니다
* **프레임워크 또는 클라이언트에서 엔드포인트를 고정한 경우** — 업데이트될 때까지 `reasoning_effort="none"`를 사용하여 현재 방식을 유지합니다
* **`gpt-5.2` 또는 이전 버전을 사용하는 경우** — 영향을 받는 범위에 해당하지 않습니다

호환성 모드의 전체 기능 범위는 [호환성 모드](/ko/api-capabilities/openai/compatible)에서 확인할 수 있습니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="reasoning_effort=none으로 설정하면 정확히 무엇을 잃게 됩니까?">
    모델이 명시적으로 추론하는 과정을 중단하고 바로 답변합니다. 도구 선택이 명확한 단일 단계 작업은 거의 달라지지 않지만, 모델이 호출 순서를 직접 판단해야 하는 다단계 오케스트레이션은 눈에 띄게 성능이 저하됩니다. 이는 목적지가 아니라 과도기적인 연결 수단입니다.
  </Accordion>

  <Accordion title="도구를 포함하는 요청에 대해서만 엔드포인트를 전환할 수 있습니까?">
    그렇습니다. 일반적으로 점진적으로 적용하는 방식입니다. 일반 채팅은 `/v1/chat/completions`에 유지하고 도구를 포함하는 경로만 `/v1/responses`로 전환합니다. 두 엔드포인트 모두 동일한 키와 동일한 기본 URL을 사용하며, 가격도 동일합니다.
  </Accordion>

  <Accordion title="엔드포인트를 전환하면 가격이 변경됩니까?">
    아닙니다. 특정 모델의 입력 및 출력 요율은 두 엔드포인트에서 동일하며, 과금 모델도 동일합니다. [모델 및 가격](/ko/api-capabilities/model-info)을 참조하십시오. 유일한 차이는 캐시 적중률이며, 일반적으로 Responses에서 더 높으므로 과금액은 감소하는 경향이 있습니다.
  </Accordion>

  <Accordion title="Claude와 Gemini도 영향을 받습니까?">
    아닙니다. 이는 OpenAI 자체의 GPT-5.4+ 모델에 적용되는 제한입니다. `/v1/messages` 또는 호환성 모드를 통한 Claude와 네이티브 또는 호환성 모드를 통한 Gemini는 모두 도구 호출과 사고를 동시에 사용할 수 있습니다.
  </Accordion>

  <Accordion title="Pro 모델은 왜 Responses 전용입니까?">
    실제로 `gpt-5.4-pro` 및 `gpt-5.5-pro`는 `/v1/responses`를 통해서만 사용할 수 있으며 SVIP 그룹이 필요합니다. 이러한 모델은 장시간 실행되며 백그라운드 모드와 함께 사용하도록 설계되었지만, 호환성 모드에서는 백그라운드 모드를 지원할 수 없습니다. [네이티브 호출](/ko/api-capabilities/openai/native)을 참조하십시오.
  </Accordion>

  <Accordion title="Chat Completions는 사라집니까?">
    아닙니다. OpenAI가 종료를 예정한 엔드포인트는 Chat Completions가 아니라 **Assistants API**입니다. 두 엔드포인트 모두 장기적으로 계속 지원되며, 새로운 기능이 Responses에 먼저 추가될 뿐입니다.
  </Accordion>
</AccordionGroup>

## 관련 페이지

<CardGroup cols={3}>
  <Card title="네이티브 호출" icon="zap" href="/ko/api-capabilities/openai/native">
    전체 Responses 엔드포인트: 매개변수, 응답 형식, 기본 제공 tools, 클라이언트 지원 매트릭스
  </Card>

  <Card title="호환성 모드" icon="plug" href="/ko/api-capabilities/openai/compatible">
    Chat Completions의 작동 방식, 기능 범위, 언어별 SDK 설정
  </Card>

  <Card title="함수 호출" icon="wrench" href="/ko/api-capabilities/openai/function-calling">
    두 엔드포인트의 전체 도구 호출 예시 및 스트리밍 조합
  </Card>
</CardGroup>
