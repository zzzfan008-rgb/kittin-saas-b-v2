> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Astra 텍스트 생성

> APIYI의 OpenAI GPT-6 Astra 플래그십: Responses와 Chat Completions를 모두 지원하며, 100만 tokens당 입력 $10 / 출력 $50이고 Codex_Reverse 그룹에서는 절반 가격입니다. 공식 릴레이 및 역방향 라인 전반의 220개 이상의 검사, 4단계 추론 데이터, 모든 편차 항목별 귀속을 포함합니다.

GPT-6 Astra(`gpt-6-astra`)는 2026년 9월 3일 OpenAI가 출시한 차세대 플래그십으로, 컴퓨터 사용, 소프트웨어 엔지니어링, 과학, 장기 범위 에이전트 작업을 위해 설계되었습니다. 1,050,000-token 컨텍스트, 128,000-token 최대 출력, 조정 가능한 추론 수준을 제공합니다. APIYI는 **응답** 및 **채팅 완성** 엔드포인트를 모두 제공하며, 출시 당일 OpenAI 직접 공식 릴레이, Azure를 통한 공식 릴레이, `Codex_Reverse`의 세 라인에서 동일한 74개 점검 매트릭스를 실행했습니다.

<Info>
  **GPT-6 Astra가 APIYI에서 제공됩니다**: 모델 이름은 `gpt-6-astra`입니다. `default` / `svip` 공식 릴레이 그룹은 OpenAI와 동일한 가격으로 제공되며, OpenAI 직접 및 Azure의 두 공식 라인에서 서비스됩니다. `Codex_Reverse` 그룹(Codex 리버스 엔지니어링 리소스)은 **0.5배 할인**으로 과금됩니다. **함수 호출과 에이전트 도구 체인은 응답에서만 제공**되므로, 새 프로젝트는 여기서 시작하십시오.
</Info>

<Warning>
  **채팅 완성은 함수 도구를 지원하지 않습니다.** `tools`을 포함한 요청은 `reasoning_effort` 또는 `tool_choice`와 관계없이 공식 릴레이 라인에서 업스트림에 의해 거부되며(400, 응답으로 안내), 이는 플랫폼 문제가 아닌 모델 측 제한입니다. 함수 호출을 사용하는 기존 Chat 코드는 Astra로 이전할 때 응답으로 옮겨야 합니다.
</Warning>

## 차별화되는 이유

<CardGroup cols={2}>
  <Card title="작업 완료를 위해 구축됨" icon="monitor">
    Terminal-Bench 4.0은 37.3%에서 57.9%로, ScreenSpot-Pro는 76.9%에서 92.7%로, OSWorld 2.0은 72.6%를 기록했습니다. 가장 큰 향상은 모두 에이전트 작업에서 나타났으며, OpenAI는 복잡한 작업의 평균 완료 시간이 약 75분에서 40분으로 줄었다고 보고했습니다.
  </Card>

  <Card title="측정된 1.05M 컨텍스트" icon="file-text">
    308K자(210,657-token) 니들 테스트에 10.3초 만에 정확히 답변했습니다. OpenAI는 작업당 GPT-5.6 Sol보다 약 70% 적은 tokens을 사용한다고 보고하므로, 실제 작업당 비용 차이는 단가 2.5배 차이보다 작습니다.
  </Card>

  <Card title="완전한 Responses 도구 체인" icon="bot">
    함수 호출은 단일, 병렬, 왕복 및 스트리밍을 통과하며, 호스팅된 `web_search` 및 `code_interpreter` 도구도 작동합니다. 암호화된 추론 항목은 상태 비저장 방식으로 재실행됩니다. 엄격한 JSON Schema 출력은 필드 집합과 정확히 일치했습니다.
  </Card>

  <Card title="세 가지 라인을 측정하고 모든 차이를 분류함" icon="git-fork">
    동일한 매트릭스를 OpenAI 직접 연결, Azure 및 Codex\_Reverse에서 실행했습니다. 모델 성능은 세 가지 모두 동일하며, 차이는 모두 파이프라인에 있고 이 페이지에서는 각각을 업스트림 제한, 그룹별 또는 라인별로 표시합니다.
  </Card>
</CardGroup>

## 모델 정보

| 매개변수             | 값                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| **모델 이름**        | `gpt-6-astra`                                                                                             |
| **출시**           | 2026년 9월 3일 (OpenAI); 2026년 9월 5일 APIYI에서 제공 시작                                                           |
| **입력 모달리티**      | 텍스트, 이미지 (출시 시점에는 오디오 또는 동영상 미지원)                                                                         |
| **출력 모달리티**      | 텍스트                                                                                                       |
| **컨텍스트 / 최대 출력** | 1,050,000 / 128,000 tokens                                                                                |
| **지식 컷오프**       | 2026년 4월 30일                                                                                              |
| **추론 노력**        | `low` / `medium` / `high` / `xhigh`, 기본값 `medium`; `max`은(는) `xhigh`로 에코됨                                 |
| **그룹**           | `default`, `svip` (공식 릴레이), `Codex_Reverse` (리버스 엔지니어링됨, 0.5x)                                            |
| **엔드포인트**        | `POST /v1/responses` (기본; 여기서 함수 호출 가능), `POST /v1/chat/completions` (호환성; 함수 tools 미지원)                  |
| **스트리밍**         | ✅ 두 엔드포인트 모두 지원; Chat의 최종 청크에 usage 포함                                                                    |
| **사이버 분류**       | 대비 프레임워크 “Critical”; 공개 릴리스는 취약점 발견 작업을 거부합니다. OpenAI 직접 라인은 `access_programs.cyber = standard`을(를) 에코합니다 |

## 측정된 기능 매트릭스

2026년 9월 5일, 라인당 74개 검사(공식 라인은 비용 절감을 위해 70K-token 긴 컨텍스트 변형을 사용함):

| 기능                                              | 응답                                                                                   | 채팅 완료                                                    | 세 라인 전반                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 기본 채팅(비스트리밍 / 스트리밍)                             | ✅ / ✅                                                                                | ✅ / ✅                                                    | 동일함; 최소 prompt는 입력 token 7개가 과금되며, 숨겨진 삽입 없음                                                   |
| 추론 노력 low / medium / high / xhigh               | ✅ 모두 정확                                                                              | ✅                                                        | 동일하며, reasoning\_tokens가 단조 증가                                                                 |
| 추론 노력 `max`                                     | ⚠️ 세 라인 모두에서 `xhigh`로 에코됨                                                            | ⚠️                                                       | 공식 라인은 max에서 xhigh보다 더 많은 추론 token을 사용하므로, 정규화된 에코와 함께 해당 수준이 적용될 수 있음                         |
| 시스템 prompt                                      | ✅ `instructions` / `system` 모두 작동                                                    | ✅ 공식; ⚠️ Codex\_Reverse는 `system`를 삭제하며, `developer`는 작동 | 그룹별 상이                                                                                         |
| **함수 호출**(단일 / 왕복 / 병렬 / 스트리밍)                  | ✅ / ✅ / ✅ 호출 2회 / ✅                                                                  | ❌ 공식 라인에서 400                                            | **업스트림 제한**: 채팅에는 함수 tools 없음                                                                  |
| 구조화된 출력 `json_schema`(엄격)                       | ✅                                                                                    | ✅                                                        | 동일하며, 필드 집합이 정확히 일치                                                                            |
| `json_object`                                   | ✅                                                                                    | ✅                                                        | 동일                                                                                             |
| 이미지 입력(base64)                                  | ✅                                                                                    | ✅                                                        | 동일하며, 세 가지 색상 블록을 계수하고 이름 지정                                                                   |
| 이미지 입력(URL)                                     | ✅ 다운로드 가능한 호스트                                                                       | ✅ 공식; ⚠️ Codex\_Reverse는 조용히 삭제                          | 링크는 서버 측에서 가져올 수 있어야 함; Wikimedia 같은 스크래핑 방지 호스트는 세 라인 모두에서 실패                                 |
| 프롬프트 캐싱                                         | ✅ 두 번째 호출에서 8.7K 접두사 적중                                                              | ✅                                                        | 세 라인 모두에서 적중하며 엔드포인트 간에 공유됨. API의 `cached_tokens` 에코는 지연될 수 있으며, 콘솔의 캐시 과금 세부 정보가 신뢰할 수 있는 기준임 |
| 긴 컨텍스트                                          | ✅ 10.3초에 210K tokens, 6.3초에 70K                                                      | —                                                        | 동일                                                                                             |
| `web_search` / `web_search_preview`             | ✅ OpenAI 직접, Codex\_Reverse                                                          | —                                                        | **Azure 라인에서 일시적으로 비활성화됨**(플랫폼 공지: Bing 과금 검토 중)                                               |
| `code_interpreter`                              | ✅ 공식; ❌ Codex\_Reverse 400                                                           | —                                                        | 그룹별 상이                                                                                         |
| `computer_use_preview`                          | ❌ 400 "gpt-6-astra에서는 지원되지 않음"                                                       | —                                                        | 업스트림에서 지원되지 않음                                                                                 |
| 암호화된 추론(`include: reasoning.encrypted_content`) | ✅ 재실행 시 일관된 답변과 함께 200 반환                                                            | —                                                        | 동일                                                                                             |
| `previous_response_id`                          | ✅ 공식; ⚠️ Codex\_Reverse는 조용히 무시                                                      | —                                                        | 그룹별 상이; `GET /v1/responses/{id}`는 세 라인 모두에서 503 반환                                             |
| 출력 상한                                           | ✅ 공식 `max_output_tokens` / `max_completion_tokens` 적용됨; ⚠️ Codex\_Reverse에서는 적용되지 않음 | 동일                                                       | 그룹별 상이; 레거시 `max_tokens`는 공식 라인에서 400 반환                                                       |
| `temperature`                                   | ❌ 공식에서 400; Codex\_Reverse에서는 허용되지만 무시됨                                              | 동일                                                       | 업스트림 제한, 추론 모델에서 일반적                                                                           |
| `text.verbosity` low / high                     | ✅ 약 550자 대 1350자                                                                     | —                                                        | 동일                                                                                             |
| `service_tier` flex / priority                  | ⚠️ 허용되지만 default로 에코됨                                                                | —                                                        | 세 라인 모두 표준 티어                                                                                  |
| 동시 요청 8개                                        | ✅ 8/8                                                                                | —                                                        | 중앙 지연 시간: OpenAI 직접 2.4초, Azure 2.7초, Codex\_Reverse 3.6초                                      |

## 추론 노력

Responses에서 동일한 강 건너기 퍼즐을 실행했으며, 각 줄은 reasoning\_tokens입니다:

| `reasoning.effort`  | OpenAI 직접 | Azure | Codex\_Reverse | 결과 |
| ------------------- | --------- | ----- | -------------- | -- |
| `low`               | 12        | 28    | 22             | ✅  |
| `medium` (기본값)      | 33        | 43    | 62             | ✅  |
| `high`              | 146       | 169   | 99             | ✅  |
| `xhigh`             | 246       | 320   | 199            | ✅  |
| `max` (에코된 `xhigh`) | 278       | 516   | 207            | ✅  |

<Warning>
  **`none` 또는 `minimal`을 전송하지 마십시오.** `minimal`은 모든 곳에서 거부됩니다(공식 라인에서는 400, Codex\_Reverse에서는 `low`로 재작성됨). `none`은 세 가지 방식으로 다르게 동작합니다. OpenAI 직접에서는 400, Azure에서는 허용되며, Codex\_Reverse에서는 `medium`로 재작성되고 input\_tokens가 14에서 4394로 증가합니다(업스트림에서 약 4.2K tokens의 숨겨진 지침이 주입됨). 사용할 수 있는 수준은 `low` / `medium` / `high` / `xhigh`입니다.
</Warning>

<Tip>
  추론 tokens는 1M 출력당 \$50 요율로 과금됩니다. 결정론적 단계에는 `low` / `medium`을 사용하고, 계획 및 디버깅에는 `xhigh`을 확보해 두십시오. 사용량은 Responses에서는 `usage.output_tokens_details.reasoning_tokens`, Chat에서는 `usage.completion_tokens_details.reasoning_tokens`에서 확인하십시오(공식 라인에 존재함).
</Tip>

## 가격

### 공식 릴레이 그룹(`default` / `svip`)

각 요청의 입력 token 수에 따라 두 가지 티어가 적용됩니다. 입력이 272K를 초과하면 OpenAI와 동일하게 **요청 전체**가 두 번째 티어로 과금됩니다.

| 입력 tokens        | 입력      | 출력(추론 포함) | 캐시 읽기  | 캐시 쓰기(5분) |
| ---------------- | ------- | --------- | ------ | --------- |
| 0 - 272K         | \$10.00 | \$50.00   | \$1.00 | \$12.50   |
| 272,001 - 1,050K | \$20.00 | \$75.00   | \$2.00 | \$25.00   |

### Codex\_Reverse 그룹

공식 가격의 0.5배입니다. 첫 번째 티어는 입력 \$5.00 / 출력 \$25.00 / 캐시 읽기 \$0.50 / 캐시 쓰기 \$6.25입니다.

<Info>
  APIYI는 제공업체 가격을 항목별로 동일하게 적용합니다. 할인은 그룹 및 충전 보너스를 통해 제공되며, [프로모션](/ko/faq/recharge-promotions)을 참조하세요. 그룹 간 차이는 [Codex, ClaudeCode 및 Default 그룹의 차이점](/ko/faq/codex-claudecode-default-groups)에서 설명합니다. 실시간 가격은 [모델 가격 페이지](/en/models/index)에서 확인할 수 있습니다.
</Info>

## 그룹 선택

| 그룹                 | 가격    | 적합한 용도                                                          | 참고                              |
| ------------------ | ----- | --------------------------------------------------------------- | ------------------------------- |
| `default` / `svip` | 공식 가격 | 프로덕션, 안정성이 중요한 작업, 출력 제한 또는 `previous_response_id`가 필요한 모든 작업   | OpenAI 직접 및 Azure 공식 라인으로 제공됩니다 |
| `Codex_Reverse`    | 0.5배  | Codex CLI 코딩, Cherry Studio 같은 클라이언트에서의 채팅, OpenClaw 같은 에이전트 설정 | 아래에 나열된 그룹별 차이점 5가지             |

## 예시

### Responses 엔드포인트(권장)

<CodeGroup>
  ```python Python (기본 + 추론 노력) theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh
      instructions="You are a senior backend engineer. Be concise.",
      input="Migrate this repo from Python 3.9 to 3.13 and list every file that needs changes, with reasons",
      max_output_tokens=4000,
  )
  print(response.output_text)
  print(response.usage.output_tokens_details.reasoning_tokens)
  ```

  ```python Python (함수 호출 + 웹 검색) theme={null}
  from openai import OpenAI
  import json

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  tools = [
      {"type": "web_search"},
      {"type": "function", "name": "get_weather", "description": "Current weather for a city",
       "parameters": {"type": "object", "properties": {"city": {"type": "string"}},
                      "required": ["city"], "additionalProperties": False}, "strict": True},
  ]
  r = client.responses.create(model="gpt-6-astra", tools=tools, reasoning={"effort": "low"},
                              input="Check the current weather in Beijing and Shanghai.")
  for item in r.output:
      if item.type == "function_call":
          print(item.name, json.loads(item.arguments))
  ```

  ```python Python (암호화된 추론을 통한 상태 비저장 멀티턴) theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  history = [{"role": "user", "content": "Multiply 17 by 23. Answer with the number only."}]

  r1 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  # Replay the previous turn's full output (including the encrypted reasoning item); works on all three lines, no server-side storage needed
  history += [item.model_dump(exclude_none=True) for item in r1.output]
  history.append({"role": "user", "content": "Now add 1 to the result. Number only."})

  r2 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  print(r2.output_text)   # 392
  ```

  ```bash cURL (이미지 입력, base64) theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "low"},
      "input": [{"role": "user", "content": [
        {"type": "input_text", "text": "How many colored blocks are in this image?"},
        {"type": "input_image", "image_url": "data:image/png;base64,iVBORw0KGgo..."}
      ]}]
    }'
  ```
</CodeGroup>

### Chat Completions 엔드포인트(기존 코드 마이그레이션, 함수 tools 없음)

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",
      max_completion_tokens=4000,      # not the legacy max_tokens (400)
      messages=[
          # system works on the official lines; Codex_Reverse drops it, and developer works everywhere
          {"role": "developer", "content": "You are a senior backend engineer. Be concise."},
          {"role": "user", "content": "Explain Python 3.13's free-threaded mode"},
      ],
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (스트리밍) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });

  const stream = await client.chat.completions.create({
    model: 'gpt-6-astra',
    reasoning_effort: 'low',
    messages: [{ role: 'user', content: 'Describe the Great Wall in three sentences' }],
    stream: true,
    stream_options: { include_usage: true },
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 편차 귀속

동일한 매트릭스를 세 라인에서 실행하면 모든 편차가 세 가지 버킷 중 하나로 분류됩니다.

### 업스트림 제한(세 라인 모두 동일)

<AccordionGroup>
  <Accordion title="Chat Completions에는 함수 tools가 없습니다">
    `tools`를 포함하는 모든 Chat 요청은 두 공식 라인에서 400을 반환하며, 업스트림 텍스트는 Responses를 사용하라고 안내합니다. `reasoning_effort`를 생략하거나 `tool_choice: required`를 추가해도 달라지는 점이 없습니다. `Codex_Reverse` 그룹은 파이프라인이 내부적으로 Responses로 변환하기 때문에 통과할 뿐이므로, 이를 기능 지원의 증거로 간주하지 마십시오. 함수 호출에는 Responses를 사용하십시오.
  </Accordion>

  <Accordion title="reasoning.effort max는 xhigh로 에코됩니다">
    `max`에 대한 요청 3/3건은 세 라인 모두에서 `xhigh`를 에코했습니다. 공식 라인에서는 max가 xhigh보다 명확히 더 많은 추론 tokens를 사용합니다(OpenAI 직접 연결 278 대 379, Azure 342 대 516 대 320). 따라서 에코가 정규화되더라도 해당 레벨이 적용될 수 있습니다. Codex\_Reverse에서는 차이가 없습니다. 네 가지 레벨을 보장합니다.
  </Accordion>

  <Accordion title="Chat 파라미터: max_tokens 및 temperature는 400을 반환합니다">
    공식 라인은 레거시 `max_tokens`를 400으로 거부하고 `max_completion_tokens`를 요청합니다. `temperature`는 추론 모델에서 일반적인 것처럼 지원되지 않아 400을 반환합니다. Codex\_Reverse는 둘 다 허용하지만 무시합니다. 기존 코드를 마이그레이션할 때 둘 다 제거하십시오.
  </Accordion>

  <Accordion title="computer_use_preview는 사용할 수 없습니다">
    세 라인 모두 400 "Tool 'computer\_use\_preview' is not supported with gpt-6-astra"를 반환합니다. 출시 자료의 컴퓨터 사용 기능은 현재 이 tool 유형을 통해 API에 노출되지 않습니다.
  </Accordion>
</AccordionGroup>

### Codex\_Reverse 그룹만 해당(5개 항목)

<AccordionGroup>
  <Accordion title="1. Chat은 system 메시지를 완전히 삭제합니다">
    지시형 및 정보형 system 메시지는 각각 0/3에 그쳤고, 동일한 내용을 `developer` 메시지로 전송하면 3/3에 성공했습니다. 두 공식 라인에서는 `system`가 3/3으로 통과합니다. **Chat에서는 developer를 사용하십시오.** 세 라인 모두에서 작동합니다.
  </Accordion>

  <Accordion title="2. 세 가지 출력 상한 파라미터 중 어느 것도 적용되지 않습니다">
    `max_output_tokens: 20`, `max_tokens: 20` 또는 `max_completion_tokens: 20`를 사용해도 출력은 403 tokens였고 Responses는 `max_output_tokens: null`를 에코했습니다. 공식 라인에서는 `incomplete` / `length`로 20에서 올바르게 잘립니다. 비용 제어를 위해 상한이 중요할 경우 공식 릴레이 그룹을 사용하십시오.
  </Accordion>

  <Accordion title="3. previous_response_id가 조용히 무시됩니다">
    `store: true`는 여전히 `false`를 에코하며, 두 번째 턴은 첫 번째 턴을 기억하지 못한 채 200을 반환합니다. 두 공식 라인은 올바르게 기억합니다. 이 그룹에서는 클라이언트에서 기록을 유지하고 상태 비저장 재실행을 위해 `include: ["reasoning.encrypted_content"]`와 함께 사용하십시오(세 라인 모두에서 검증됨). `GET /v1/responses/{id}`는 모든 곳에서 503을 반환합니다.
  </Accordion>

  <Accordion title="4. Chat이 이미지 URL을 조용히 삭제합니다">
    Chat에서 http(s) 이미지 링크를 사용하면 prompt\_tokens는 15였고 모델은 이미지를 보지 못했다고 응답했습니다. 동일한 링크는 두 공식 라인에서 작동합니다. base64는 세 라인의 두 엔드포인트 모두에서 작동합니다. **이 그룹의 Chat에서는 이미지를 base64로 전송하십시오.**
  </Accordion>

  <Accordion title="5. effort none은 약 4.2K tokens의 숨겨진 지침을 주입합니다">
    `none`는 `medium`로 다시 작성되고 input\_tokens는 14에서 4394로 증가합니다(캐시 요율로 `usage.attribution.request_fields.instructions`에 4224가 귀속됨). `minimal`는 `low`로 다시 작성됩니다. 이 그룹에는 호스팅된 `code_interpreter` tool도 없습니다(400).
  </Accordion>
</AccordionGroup>

### Azure 라인만 해당(1개 항목)

<AccordionGroup>
  <Accordion title="web_search가 일시적으로 비활성화되었습니다">
    Azure 라인에서 `web_search` / `web_search_preview`를 포함하는 요청은 Azure Bing 과금이 검토 중인 동안 web\_search가 일시적으로 비활성화되었으며 다른 tools는 영향을 받지 않는다는 게이트웨이 알림과 함께 400을 반환합니다. OpenAI 직접 라인과 Codex\_Reverse 그룹은 정상적으로 작동합니다. 복구되면 이 페이지를 업데이트할 예정입니다.
  </Accordion>
</AccordionGroup>

## 마이그레이션 가이드

<AccordionGroup>
  <Accordion title="gpt-5.6-sol에서">
    Responses에서는 `model` 필드만 변경하십시오. Chat에서는 `tools`을 사용하는 모든 항목을 Responses로 옮기고, `max_tokens` 및 `temperature`을 제거해야 합니다. 가격은 Sol의 현재 프로모션 요율의 2.5배(\$4 / \$20 → \$10 / \$50)이므로, 먼저 에이전트, 자동화 및 복잡한 엔지니어링 작업에서 정면 비교를 실행하십시오. 일상적인 채팅, 분류 및 추출 작업은 Terra / Luna에 유지하십시오.
  </Accordion>

  <Accordion title="Chat Completions에서 Responses로">
    `messages` → `input`, `reasoning_effort` → `reasoning: {"effort": ...}`, `response_format` → `text: {"format": ...}`, `system` → `instructions`, `max_completion_tokens` → `max_output_tokens`. 도구 정의는 `{"type": "function", "function": {...}}`에서 `{"type": "function", "name": ..., "parameters": ...}`로 평면화됩니다. 전체 매핑은 [Responses 마이그레이션 가이드](/ko/api-capabilities/openai/responses-migration)에서 확인할 수 있습니다.
  </Accordion>

  <Accordion title="긴 컨텍스트 비용 제어">
    입력이 272K tokens를 초과하면 전체 요청이 두 번째 티어로 과금됩니다(입력은 2배, 출력은 1.5배). 전체 리포지토리가 한 번에 반드시 필요한 경우가 아니라면, 일상적인 컨텍스트는 272K 미만으로 유지하고 안정적인 접두사는 먼저 배치하여 캐시에 적중하도록 하십시오(캐시된 읽기 비용은 표준 입력 가격의 10분의 1입니다).
  </Accordion>

  <Accordion title="보안 작업이 거부되나요?">
    Astra는 OpenAI가 Preparedness Framework의 Critical 사이버보안 수준에 배치한 첫 번째 모델이며, 공개 릴리스에서는 취약점 탐색 및 익스플로잇 코드 작성과 같은 공격적 작업을 거부합니다. 방어적 작업은 영향을 받지 않습니다. 세 가지 라인 모두에서 SQL 인젝션 방어를 위한 엔지니어링 관행을 요청했을 때, 파라미터화된 쿼리, 최소 권한 등을 다루는 완전한 답변이 반환되었습니다.
  </Accordion>
</AccordionGroup>

## 관련 자료

* [GPT-6 Astra 출시 문서(벤치마크 및 모델 선택)](/en/news/gpt-6-astra-launch)
* [gpt-6-astra가 반값 Codex\_Reverse 그룹에 합류](/en/live/2026-09/codex-reverse-gpt-6-astra)
* [OpenAI 추론 모델 가이드](/ko/api-capabilities/openai/reasoning-models)
* [OpenAI 프롬프트 캐싱](/ko/api-capabilities/openai/prompt-caching)
* [OpenAI 함수 호출](/ko/api-capabilities/openai/function-calling)
