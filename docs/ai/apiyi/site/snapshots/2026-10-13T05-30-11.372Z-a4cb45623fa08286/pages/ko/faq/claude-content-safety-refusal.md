> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 거절 시 빈 콘텐츠가 반환되는 이유는 무엇입니까?

> Claude가 제공업체의 안전 정책에 위배될 때 오류를 발생시키지 않고, HTTP 200, 빈 콘텐츠 및 거절 카테고리와 함께 stop_reason: refusal을 반환합니다. 이 페이지에서는 각 API 형식별 출력, 과금 규칙 및 이를 감지하는 방법을 안내합니다.

## 간단한 답변

요청이 제공자의 안전 정책을 트리거할 때 Claude는 **오류를 반환하지 않습니다**. API는 여전히 HTTP 200을 반환하지만:

* `content`은 **빈 배열** `[]`이며 `output_tokens`는 `0`입니다;
* `stop_reason`는 `refusal`입니다;
* `stop_details`은 거부 **카테고리**(예: `cyber`)를 명시하고 짧은 영어 설명을 포함합니다.

이는 모델 동작이며 API 장애가 아닙니다. `message.content[0]`을 직접 읽는 코드는 `IndexError`을 발생시킵니다. OpenAI 호환 형식을 사용하면 빈 문자열이 반환되며 `finish_reason`은 `refusal`입니다.

거부 응답은 보통 1\~2초 이내에 반환됩니다. 과금 여부는 카테고리에 따라 다릅니다. **`cyber` 카테고리(및 기타 일부 카테고리)에서 어떠한 출력이 생성되기 전의 거부는 과금되지 않습니다** — 아래의 "과금 규칙"을 참조하십시오.

## 거부 응답의 형태

다음은 사이버 거부를 유발하는 동일한 요청을 4가지 방식으로 호출한 결과입니다(2026-09-29 측정, ID 마스킹됨):

<Tabs>
  <Tab title="네이티브 · 비스트리밍">
    `POST /v1/messages`, `stream: false`:

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "type": "message",
      "role": "assistant",
      "model": "claude-sonnet-5",
      "content": [],
      "stop_reason": "refusal",
      "stop_sequence": null,
      "stop_details": {
        "type": "refusal",
        "category": "cyber",
        "explanation": "This request triggered cyber-related safeguards. To learn about the Cyber Verification Program and apply for access, visit our help center: ..."
      },
      "usage": {
        "input_tokens": 2863,
        "output_tokens": 0,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0
      }
    }
    ```
  </Tab>

  <Tab title="네이티브 · 스트리밍">
    `POST /v1/messages`, `stream: true`. **`content_block_*` 이벤트가 전혀 발생하지 않으며** — `message_start` 바로 다음에 거부 내용을 담은 `message_delta`이(가) 이어집니다:

    ```text theme={null}
    event: message_start
    data: {"type":"message_start","message":{"id":"msg_xxxxxxxx","content":[],"stop_reason":null,"stop_details":null,"usage":{"input_tokens":2863,"output_tokens":0}, ...}}

    event: message_delta
    data: {"type":"message_delta","delta":{"stop_reason":"refusal","stop_sequence":null,"stop_details":{"type":"refusal","category":"cyber","explanation":"This request triggered cyber-related safeguards. ..."}},"usage":{"input_tokens":2863,"output_tokens":0}}

    event: message_stop
    data: {"type":"message_stop"}
    ```
  </Tab>

  <Tab title="OpenAI 호환 · 비스트리밍">
    `POST /v1/chat/completions`. `content`은(는) 빈 문자열이고, `finish_reason`은(는) `refusal`이며, **거부 카테고리가 없습니다**:

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "object": "chat.completion",
      "model": "claude-sonnet-5",
      "choices": [
        {
          "index": 0,
          "message": { "role": "assistant", "content": "" },
          "finish_reason": "refusal"
        }
      ],
      "usage": { "prompt_tokens": 2863, "total_tokens": 2863 }
    }
    ```
  </Tab>

  <Tab title="OpenAI 호환 · 스트리밍">
    `POST /v1/chat/completions`, `stream: true`. 빈 `delta`만 반환되며, 하나의 청크에서 `finish_reason`이(가) `refusal`(으)로 설정됩니다:

    ```text theme={null}
    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""}}]}

    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"refusal"}]}

    data: [DONE]
    ```
  </Tab>
</Tabs>

| 필드 | 거부 발생 시 |
| - | - |
| HTTP 상태 | 오류가 아닌 `200` |
| `content` | 네이티브 포맷에서는 빈 배열 `[]`, OpenAI 호환 포맷에서는 빈 문자열 `""` |
| `stop_reason` / `finish_reason` | `refusal` |
| `stop_details` | 네이티브 포맷 전용: `type`, `category`(거부 카테고리), `explanation`(영어 텍스트) |
| `usage` | 입력 tokens는 정상 계산되며, `output_tokens`은(는) 0입니다(토큰 계산과 과금은 동일하지 않습니다 — 아래 참조) |
| 지연 시간 | 보통 1\~2초로 일반 응답보다 훨씬 빠름 |

<Note>
  거부는 **스트리밍 도중**에도 발생할 수 있습니다. 텍스트의 일부가 먼저 스트리밍된 후 응답이 `stop_reason: "refusal"`(으)로 종료됩니다. 해당 부분 출력은 불완전하므로 폐기해야 합니다.
</Note>

## 거부 카테고리

`stop_details.category`에는 현재 다섯 가지 값이 있습니다:

| 카테고리 | 의미 |
| - | - |
| `cyber` | 악성코드나 익스플로잇 개발 등 사이버 피해를 유발할 수 있으며, 무해한 보안 작업에서도 트리거될 수 있습니다 |
| `bio` | 생물학적 피해를 유발할 수 있으며, 유익한 생명과학 작업에서도 트리거될 수 있습니다 |
| `frontier_llm` | 경쟁 AI 모델 개발을 지원할 수 있습니다(제공업체의 상업적 약관에 의해 제한됨) |
| `reasoning_extraction` | 모델에 답변 내 내부 추론을 재현하도록 요청합니다 |
| `general_harms` | 위 네 가지 카테고리 이외의 기타 사용 정책 영역입니다 |

거부가 명명된 카테고리에 매핑되지 않는 경우, `category`과 `explanation`은 모두 `null`이며 이는 정상적인 값입니다. `explanation` 텍스트는 언제든지 변경될 수 있으므로, 그대로 표시하되 **문자열 매칭을 수행하지 마십시오**.

## 자주 발생하는 트리거 원인

`category: "cyber"`는 개발자가 가장 자주 마주치는 문제입니다. Claude에는 사이버 보안 요청에 대한 실시간 보호 조치가 적용되어 있으며, 다음과 같은 작업은 모두 이를 트리거할 수 있습니다:

* 모델에 코드의 버그를 찾도록 요청하거나, 특정 코드에 “취약점이 있는지” 판단하도록 하거나, 취약점 유형(CWE)을 명시하도록 요청하는 작업
* 익스플로잇 코드 또는 모의 침투 테스트 절차를 작성하거나 완성하는 작업
* 악성 코드를 분석하거나 재작성하는 작업

<Warning>
  **배치 평가와 데이터셋 증류(distillation) 작업이 가장 큰 영향을 받습니다.** 취약점 데이터셋 전체를 항목별로 모델에 전달하여 처리하면 상당한 비율의 샘플이 거절당하는 경우가 많습니다. `content[0]`이 항상 존재한다고 가정한 스크립트는 이렇게 거절된 항목에서 오류로 비정상 종료되며, 이는 겉보기에 “API가 간헐적으로만 작동하는” 것처럼 보일 수 있습니다.
</Warning>

## 과금 규칙

제공업체의 규칙에 따릅니다(2026년 9월 기준이며, 제공업체가 위양성률을 측정함에 따라 조정될 수 있습니다):

| 거부가 발생한 시점 및 해당 카테고리 | 과금 |
| - | - |
| 출력 전, 카테고리 `cyber`, `general_harms` 또는 `null` | **과금되지 않음** |
| 출력 전, 카테고리 `bio`, `frontier_llm` 또는 `reasoning_extraction` | 입력 tokens 과금 |
| 스트리밍 중 (모든 카테고리) | 입력 tokens 및 이미 스트리밍된 출력 과금 |

과금 여부와 관계없이, 거부된 요청도 요청 제한 계산에 포함됩니다. `usage`에는 여전히 token 수가 표시되지만, 이는 단순 집계 수치일 뿐 반드시 과금을 의미하지는 않습니다.

## 감지 및 처리 방법

<Steps>
  <Step title="콘텐츠를 읽기 전에 stop_reason 확인">
    네이티브 형식에서는 `stop_reason == "refusal"`을 확인하고, OpenAI 호환 형식에서는 `finish_reason == "refusal"`을 확인하십시오. 거부를 배제한 후에만 `content`을 읽으십시오.
  </Step>

  <Step title="거부를 결과 유형으로 기록">
    거부는 네트워크 오류가 아니라 성공적인 호출입니다. 평가 작업의 경우 재시도해야 할 실패로 집계하는 대신, `stop_details.category`와 함께 “refused”로 별도 기록하십시오.
  </Step>

  <Step title="동일한 콘텐츠 재시도 금지">
    동일한 콘텐츠를 다시 보내면 대개 동일한 거부가 발생하며, 여전히 요청 제한을 소모하고 일부 카테고리의 경우 매번 과금됩니다.
  </Step>

  <Step title="다중 턴 대화에서 컨텍스트 재설정">
    특정 턴이 거부된 경우 계속 진행하기 전에 해당 턴을 제거하거나 다시 작성하거나 대화 기록을 지우십시오. 재설정하지 않으면 이후 요청도 계속 거부됩니다.
  </Step>

  <Step title="거부된 콘텐츠 검토">
    어떤 작업이 거부를 유발하는지 확인하기 위해 `category`별로 거부를 그룹화한 다음, 해당 콘텐츠를 다른 모델로 전송할지 여부를 결정하십시오.
  </Step>
</Steps>

<Tabs>
  <Tab title="Anthropic SDK">
    ```python theme={null}
    import os
    import anthropic

    client = anthropic.Anthropic(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com",
    )

    def ask(prompt, model="claude-sonnet-5"):
        message = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        if message.stop_reason == "refusal":
            details = getattr(message, "stop_details", None)
            category = getattr(details, "category", None) if details else None
            return {"refused": True, "category": category, "request_id": message.id}

        text = "".join(b.text for b in message.content if b.type == "text")
        return {"refused": False, "text": text}
    ```
  </Tab>

  <Tab title="OpenAI SDK">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1",
    )

    def ask(prompt, model="claude-sonnet-5"):
        resp = client.chat.completions.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        choice = resp.choices[0]
        if choice.finish_reason == "refusal" or not choice.message.content:
            return {"refused": True, "request_id": resp.id}
        return {"refused": False, "text": choice.message.content}
    ```
  </Tab>
</Tabs>

<Tip>
  거부 **카테고리**가 필요한 경우 네이티브 `/v1/messages` 형식을 호출하십시오. OpenAI 호환 형식은 `finish_reason: "refusal"`만 유지하며 `stop_details`은 없습니다.
</Tip>

## 정당한 보안 연구는 어떻게 되나요?

거절 문구에 언급된 **Cyber Verification Program**은 정당한 보안 작업을 위해 제공자가 운영하는 무료 신청 프로그램입니다. 신원 확인을 거치면 익스플로잇이나 공격용 도구 개발과 같은 “고위험 이중 용도” 작업에 대한 제한이 완화될 수 있습니다. 랜섬웨어 개발이나 대규모 데이터 유출과 같은 “금지된 용도”는 모든 경우에 차단됩니다.

해당 프로그램은 **퍼스트 파티 제공자 계정에서 조직 관리자가 직접 신청**해야 합니다. 서드파티 플랫폼에 대해 제공자는 “모든 플랫폼이 참여하는 것은 아니다”라고 명시하고 있으며, APIYI는 현재 해당 프로그램에 대한 접근을 지원하지 않습니다.

따라서 APIYI를 통해 호출할 때 거부된 샘플의 경우:

* 평가 결과에 카테고리별로 그룹화하여 “거절됨”으로 투명하게 기록합니다.
* 또는 해당 콘텐츠를 다른 모델로 처리합니다.

APIYI는 제공자의 안전 정책을 조정하지 않으며 조정할 수도 없습니다.

## OpenAI 거부와의 차이점

| | Claude | OpenAI (GPT 시리즈) |
| - | - | - |
| HTTP 상태 | 200 | 200 |
| 본문 | 비어 있음 (`content: []`) | `I can't help with that…`과 같은 한 줄 거부 문구 |
| 종료 사유 | `refusal` | `stop`, 일반 응답과 동일 |
| 거부 카테고리 | 있음, `stop_details.category` | 없음 |
| 과금 | `cyber` 및 일부 기타 카테고리의 출력 전 거부는 과금되지 않음 | 거부 텍스트에 대해 정상 과금됨 |
| 감지 방법 | `stop_reason` 확인만으로 가능 | 텍스트 자체를 통해서만 가능 |

OpenAI 거부 응답이 어떤 형태인지 확인하려면 [OpenAI 모델 거부는 어떤 형태인가요?](/ko/faq/openai-content-safety-refusal)를 참고하십시오.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="거부 시에도 과금됩니까?">
    카테고리와 시점에 따라 다릅니다. `cyber`, `general_harms` 또는 `null`의 출력 전 거부는 과금되지 않으며, `bio`, `frontier_llm` 및 `reasoning_extraction`는 입력에 대해 과금됩니다. 스트리밍 도중 발생한 거부는 입력과 이미 스트리밍된 출력을 합산하여 과금됩니다. 위의 “과금 규칙”을 참고하십시오.
  </Accordion>

  <Accordion title="거부를 비활성화할 수 있습니까?">
    아닙니다. 거부는 제공업체의 안전 정책에 따라 해당 모델이 결정하며, APIYI에서 이를 비활성화하거나 엄격도를 변경할 수 없습니다. 거부된 콘텐츠는 거부 결과로 기록하거나 다른 모델로 처리하십시오.
  </Accordion>

  <Accordion title="동일한 데이터셋에서 일부 샘플만 거부되고 다른 샘플은 거부되지 않는 이유는 무엇입니까?">
    보호 조치가 각 요청의 콘텐츠를 개별적으로 판단하기 때문입니다. 코드 스니펫 자체와 prompt의 표현 방식 모두 결과에 영향을 미치므로, 일반적으로 데이터셋의 일부만 거부됩니다. 자체 테스트 결과, 거부된 동일한 샘플을 다시 전송해도 일관된 결과가 나타났습니다.
  </Accordion>

  <Accordion title="거부 발생 시 usage에서 output_tokens가 0인 이유는 무엇입니까?">
    모델이 생성을 시작하기 전에 중단되었으므로 출력은 0이며 입력만 계산됩니다. 이는 거부와 `max_tokens` 중단을 구분하는 방법이기도 합니다. 후자는 `stop_reason: "max_tokens"`을 가지며 출력 tokens 수가 설정한 제한과 같습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Claude 응답 처리" icon="braces" href="/ko/api-capabilities/claude-response-handling">
    스트리밍 및 비스트리밍 응답 구조, stop\_reason 값
  </Card>

  <Card title="OpenAI 모델 거절은 어떤 형태입니까?" icon="message-square-x" href="/ko/faq/openai-content-safety-refusal">
    GPT 거절 형태 및 감지 방법
  </Card>

  <Card title="콘텐츠 안전 및 컴플라이언스는 어떻게 보장됩니까?" icon="shield-check" href="/ko/faq/content-safety">
    플랫폼 콘텐츠 안전 및 컴플라이언스 정책
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.