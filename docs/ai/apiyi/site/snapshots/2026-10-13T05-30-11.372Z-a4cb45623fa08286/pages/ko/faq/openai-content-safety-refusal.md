> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 모델 거절 응답은 어떤 형태입니까?

> GPT 모델이 제공자의 사용 정책을 위반한 요청을 거절하면 오류나 카테고리 표시 없이 짧은 거절 메시지와 함께 200을 반환합니다. 응답 본문과 이를 감지하는 방법을 확인해 보십시오.

## 간단한 답변

GPT 모델이 제공자의 이용 정책을 위반하는 요청을 받더라도 **오류를 반환하지 않습니다**. API는 HTTP 200으로 응답하고 `finish_reason`은 `stop`이며, 내용은 “해당 요청은 도와드릴 수 없습니다…”와 같이 모델이 직접 작성한 거절 문구입니다.

응답에는 **오류 코드가 없으며 거절 카테고리나 심각도도 없습니다**. 일반적인 답변과 완전히 동일한 구조를 가지며 동일하게 과금됩니다. 상태 코드와 `finish_reason`만 보고는 요청이 거절되었는지 알 수 없습니다.

## 거절 응답 본문

다음은 `/v1/chat/completions`의 실제 비스트리밍 거절 응답입니다(내용은 중립적인 예시로 대체되었습니다):

```json theme={null}
{
  "model": "gpt-5.6-terra",
  "object": "chat.completion",
  "created": 1789712872,
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I can't help with that request. I can, however, help with a related topic or a rewritten version that stays within the usage policy."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 54,
    "total_tokens": 89
  }
}
```

| 필드 | 거절 응답의 형태 |
| - | - |
| HTTP 상태 | `200` |
| `finish_reason` | `stop`, 일반 답변과 동일합니다 |
| `message` | `role` 및 `content`만 제공되며, 별도의 `refusal` 필드는 **없습니다** |
| 시작 문구 | 대체로 `I can't…` 또는 `Sorry, I can't…`이며, 중국어의 경우 `抱歉，我不能…`입니다 |
| 언어 | prompt를 따릅니다. 중국어 prompt에는 보통 중국어 거절 응답이 반환됩니다 |
| 길이 | 대부분 50–120 tokens이며, 개인의 안녕과 관련된 주제는 지원 안내가 함께 제공되어 약 400 tokens에 달할 수 있습니다 |
| 과금 | 실제 입력 및 출력 tokens를 기준으로 정상 과금됩니다 |

## 카테고리가 없는 이유

정책을 위반하는 요청의 경우, OpenAI 채팅 API는 오류를 반환하는 대신 **모델이 답변하지 않도록 결정하게 합니다**. 어떤 카테고리에 해당하는지(예: 성인 콘텐츠, 노골적인 폭력, 자해)를 알려주지 않으며, 심각도도 제공하지 않습니다.

이는 오류와 다릅니다. 오류가 발생하면 200이 아닌 상태 코드와 `error` 객체를 받게 됩니다. 거절의 경우 **호출 자체는 성공**하지만, 그 내용이 요청한 내용이 아닐 뿐입니다.

## 번역 및 구조화된 출력

배치 번역 및 추출 작업에서는 일반적으로 모델에 JSON 배열과 같은 고정된 형식을 요청합니다. 배치에서 거부가 발생하면 모델이 일반 문장을 반환하므로, 이를 JSON으로 파싱할 때 `Unrecognized token 'I'` 또는 `Expecting value`과 같은 오류가 발생하며 실패합니다.

**이는 API 형식 문제가 아닙니다.** 해당 배치의 콘텐츠가 거부된 것입니다. 변경하지 않고 동일한 배치를 재시도해도 보통 동일한 결과가 반환됩니다.

<Info>
  APIYI는 **비스트리밍 요청**에 대해 콘텐츠 안전을 위한 자동 페일오버를 활성화했습니다. prompt 또는 생성된 출력에서 하나의 공식 경로가 콘텐츠 필터를 트리거하면, 사용자 측에서 재시도할 필요 없이 다른 공식 경로로 요청을 자동으로 재시도합니다. 페일오버 후 대부분의 요청은 정상적인 결과를 반환하지만, 일부 요청은 여전히 모델 자체에 의해 거부될 수 있으며, 이 페이지에서 설명하는 내용이 바로 이러한 경우에 해당합니다.
</Info>

## 감지 및 처리 방법

<Steps>
  <Step title="출력 형식을 먼저 검증합니다">
    JSON을 요청한 경우 JSON으로 파싱하고, 고정된 개수의 항목을 요청한 경우 개수를 확인합니다. 형식이 일치하지 않으면 해당 호출을 "결과 없음"으로 처리하고 해당 콘텐츠를 출력으로 사용하지 않습니다.
  </Step>

  <Step title="그런 다음 거부 여부를 확인합니다">
    형식이 일치하지 않으면 콘텐츠가 `I can't`, `Sorry` 등으로 시작하는 짧은 문장인지 확인합니다. 그렇다면 모델이 형식을 벗어난 것이 아니라 거부일 가능성이 거의 확실합니다.
  </Step>

  <Step title="변경 없이 그대로 재시도하지 않습니다">
    동일한 콘텐츠를 변경 없이 그대로 재시도하면 동일한 거부가 발생할 가능성이 높으며, 각 시도마다 과금됩니다.
  </Step>

  <Step title="배치를 분할하여 특정 항목을 찾습니다">
    실패한 배치를 더 작은 배치로 다시 제출하여 어떤 항목이 거부를 유발하는지 확인합니다. 나머지 항목은 대개 정상적으로 완료됩니다. 거부를 유발하는 항목의 경우 표현을 조정한 후 다시 시도합니다.
  </Step>

  <Step title="실패 사례를 아카이빙한 후 모델 전환 여부를 결정합니다">
    실패 사례(입력값, 요청 시간, 요청 ID, 반환된 콘텐츠)의 내부 아카이브를 보관하고, 거부가 어떤 종류의 콘텐츠에 집중되는지 검토한 다음 다른 모델로 해당 콘텐츠를 재시도하는 것을 고려합니다.
  </Step>
</Steps>

<Tip>
  "실패 사례 아카이빙 → 분석 → 다른 모델로 재시도"를 표준 프로세스로 정착시키는 것을 권장합니다. 거부는 몇 가지 유형의 콘텐츠에 집중되는 경향이 있으므로 아카이브를 구축하면 패턴을 쉽게 파악할 수 있습니다. 이를 통해 반복적인 수동 조사를 줄이고 동일한 콘텐츠에 대해 중복으로 비용을 지불하는 것을 방지할 수 있습니다.
</Tip>

다음은 최소한의 예시입니다. JSON을 검증하고 일치하지 않는 모든 항목을 로컬 실패 로그에 기록합니다.

```python theme={null}
import json
import os
import time
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL_PREFIXES = ("I can't", "I can’t", "Sorry", "I'm sorry", "I’m sorry", "抱歉")

def translate_batch(lines):
    prompt = "Translate each subtitle line below into English. Output a JSON array only:\n" + json.dumps(lines, ensure_ascii=False)
    resp = client.chat.completions.create(
        model="gpt-5.6-terra",
        messages=[{"role": "user", "content": prompt}],
    )
    text = resp.choices[0].message.content or ""
    try:
        result = json.loads(text)
        if isinstance(result, list) and len(result) == len(lines):
            return result
    except json.JSONDecodeError:
        pass

    # No usable result: record it for later analysis or a retry with another model
    with open("failed_cases.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "time": time.strftime("%Y-%m-%d %H:%M:%S %z"),
            "request_id": resp.id,
            "is_refusal": text.strip().startswith(REFUSAL_PREFIXES),
            "input": lines,
            "output": text,
        }, ensure_ascii=False) + "\n")
    return None
```

## 스트리밍 요청

스트리밍 응답이 시작되면 더 이상 다른 경로로 전환할 수 없으므로, **자동 콘텐츠 안전 페일오버는 비스트리밍 요청에만 적용됩니다**. 스트리밍 사용 시 다음과 같은 현상이 나타날 수 있습니다:

* 마지막 이벤트의 `finish_reason`이 `content_filter`(으)로 설정된 짧은 거부 응답 또는
* 이미 콘텐츠 일부가 전달된 후 `finish_reason: "content_filter"`(으)로 종료되는 현상.

token 단위로 표시할 필요가 없는 일괄 번역과 같은 작업에는 비스트리밍 호출을 권장합니다. 테스트 결과를 포함한 전체 비교 내용은 [콘텐츠가 필터링될 때 스트리밍과 비스트리밍 요청은 어떻게 다른가요?](/ko/faq/streaming-content-filter)를 참조하십시오.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="거절 시에도 과금됩니까?">
    네. 거절 역시 성공적인 호출이며 실제 입력 및 출력 tokens를 기준으로 과금되므로, 동일한 내용을 반복해서 재시도하지 마십시오.
  </Accordion>

  <Accordion title="거절을 비활성화할 수 있습니까?">
    불가능합니다. 거절은 제공업체의 사용 정책에 따라 해당 모델이 결정합니다. APIYI에서는 거절을 비활성화하거나 엄격도를 조정할 수 없습니다.
  </Accordion>

  <Accordion title="동일한 내용인데 어떤 때는 통과되고 어떤 때는 거절되는 이유는 무엇입니까?">
    모델의 판단에는 어느 정도 무작위성이 있고 공식 경로마다 필터링 방식이 약간씩 다르기 때문에, 경계선상의 콘텐츠는 한 번은 통과되고 다음 번에는 거절될 수 있습니다. 사용 정책을 명백히 위반하는 콘텐츠는 일관되게 거절됩니다.
  </Accordion>

  <Accordion title="거절 카테고리는 어떻게 확인할 수 있습니까?">
    OpenAI chat API는 이를 반환하지 않습니다. 워크플로에 카테고리가 필요한 경우 전송 전에 콘텐츠를 직접 분류하거나, 보관된 실패 사례를 수동으로 정리하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="응답 처리" icon="braces" href="/ko/api-capabilities/openai/response-handling">
    스트리밍 및 비스트리밍 응답을 위한 단일 파싱 방식
  </Card>

  <Card title="콘텐츠 안전 및 규정 준수는 어떻게 보장됩니까?" icon="shield-check" href="/ko/faq/content-safety">
    플랫폼 콘텐츠 안전 및 규정 준수 정책
  </Card>

  <Card title="Claude 거부는 왜 빈 콘텐츠를 반환합니까?" icon="message-square-x" href="/ko/faq/claude-content-safety-refusal">
    Claude 거부 형태와 이를 감지하는 방법
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.