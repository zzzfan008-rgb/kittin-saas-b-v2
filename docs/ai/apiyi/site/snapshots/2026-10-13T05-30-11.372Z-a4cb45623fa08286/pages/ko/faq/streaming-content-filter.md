> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 콘텐츠 필터링 시 스트리밍 요청과 비스트리밍 요청은 어떻게 다릅니까?

> 비스트리밍 요청이 콘텐츠 안전 필터에 걸리면 플랫폼에서 다른 경로를 통해 자동으로 다시 생성합니다. 스트리밍 요청은 출력이 시작된 후에는 전환할 수 없으며 content_filter로 종료됩니다. 테스트 결과, 응답 형태 및 선택 방법.

## 요약 답변

<Info>
  **콘텐츠 필터가 작동할 때 스트리밍 모드와 비스트리밍 모드에서 동일한 콘텐츠라도 전혀 다르게 종료될 수 있습니다:**

  1. **비스트리밍**: 공식 경로에서 콘텐츠 안전 필터가 트리거되면 APIYI는 **다른 공식 경로에서 요청을 자동으로 재생성합니다**. 클라이언트는 완전한 결과를 받게 되며 **1회만 과금됩니다**.
  2. **스트리밍**: 출력이 생성되는 즉시 클라이언트로 전송되므로 **스트리밍 도중에는 경로를 전환할 수 없습니다**. 요청은 `finish_reason: "content_filter"`로 종료되며, 이미 생성된 부분은 **정상적으로 과금됩니다**.
  3. **선택 방법**: 사용자에게 token 단위로 표시되는 콘텐츠(채팅, 에이전트 응답)에는 스트리밍을 사용하십시오. 생성이 완료된 후 프로그램에서 처리하는 콘텐츠(스크립트, 스토리보드, 번역, 구조화된 데이터)에는 비스트리밍을 사용하십시오.
</Info>

## 필터링이 발생하는 두 가지 시점

제공업체의 콘텐츠 안전 필터는 두 가지 시점에서 개입할 수 있으며, 두 경우 모두 스트리밍 모드에서 나타납니다:

| 시점 | stream에서 확인되는 내용 | 일반적인 소요 시간 |
| - | - | - |
| **요청 단계** (입력 검사) | 콘텐츠는 단일 문장인 `I'm sorry, but I cannot assist with that request.` (약 15 tokens)이며, `finish_reason`이 `content_filter`(으)로 설정됩니다 | 몇 초 |
| **생성 단계** (출력 검사) | 모델이 이미 콘텐츠의 일부를 생성한 상태에서 중단되며, `finish_reason`이 `content_filter`(으)로 설정됩니다 | 생성된 양에 따라 달라집니다 |

두 경우 모두 HTTP 상태는 `200`이며 stream은 `data: [DONE]`과 함께 정상적으로 종료됩니다. **HTTP 오류 로그에는 아무것도 나타나지 않으며**, 오직 stream의 마지막 이벤트만이 어떤 일이 발생했는지 알려줍니다.

## 스트리밍 vs 비스트리밍

| | 스트리밍 `stream: true` | 비스트리밍 `stream: false` |
| - | - | - |
| 필터링 시 플랫폼 동작 | 출력이 이미 시작되었으므로 라우트를 전환할 수 없습니다 | 다른 공식 라우트에서 자동으로 재생성합니다 |
| 클라이언트가 수신하는 내용 | 잘린 부분 응답 또는 한 줄짜리 거절 메시지 | 완전한 결과, `finish_reason: "stop"` |
| 과금 | 중단된 요청은 실제 입력 및 출력 tokens에 대해 과금되며, 이어하기 또는 재시도는 별도로 과금됩니다 | 성공한 시도에 대해서만 과금됩니다 |
| 클라이언트 측 처리 | `content_filter` 감지, 텍스트 정리 후 이어하기 또는 재시도 | 필요 없음 |
| 적합한 용도 | token 단위로 표시되는 콘텐츠 | 완료된 후 사용되는 콘텐츠 |

<Note>
  비스트리밍 요청의 자동 장애 조치는 성공률을 크게 높여주지만, 100%는 아닙니다. 제공업체의 사용 정책을 명백히 위반하는 콘텐츠는 다른 라우트에서도 모델 자체에 의해 거절될 수 있습니다. 해당 응답 형태에 대해서는 [OpenAI 모델 거절은 어떤 형태인가요?](/ko/faq/openai-content-safety-refusal)를 참조하십시오.
</Note>

## 테스트 결과

2026-09-25 (UTC+8)에 두 가지 모드에서 `gpt-5.6-terra`에 동일한 파라미터(`max_tokens=35000`, `temperature=0`, `reasoning_effort=high`)를 적용하여 동일한 영화 스토리보드 스크립트 세트를 전송했습니다:

| 스크립트 주제 | 스트리밍 | 비스트리밍 |
| - | - | - |
| 무술 격투, 상세한 동작, 부상 및 낙하 포함 | **5/5 생성 단계에서 중단됨** (약 1,700 tokens) | **4/4 완료** |
| 유혈 및 사망이 포함된 액션 및 전쟁 장면 | **10/10 요청 단계에서 차단됨** (고정된 한 줄 거부 문구) | **6/6 완료** |
| 일상 및 미스터리 주제 | 8/8 정상 완료 | — |

스트리밍 모드에서 동일한 콘텐츠로 재시도해도 기본적으로 동일한 결과가 나타납니다. **필터링 트리거 여부는 운이 아니라 주로 콘텐츠에 따라 결정됩니다.**

## 잘린 스트림의 형태

`choices`을 포함하는 마지막 이벤트에는 내용이 없으며, 종료 사유만 포함됩니다:

```text theme={null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[{"delta":{},"finish_reason":"content_filter","index":0}],"usage":null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[],"usage":{"prompt_tokens":27831,"completion_tokens":6966,"total_tokens":34797}}
data: [DONE]
```

<Warning>
  **출력이 생성 단계에서 중단되면 줄바꿈 없이 조합된 텍스트의 끝에 영어 거절 문구가 바로 추가됩니다.** 예를 들어, 중국어 스토리보드가 문장 중간에서 끝나고 그 직후에 `I'm sorry, but I cannot assist with that request.`이 이어집니다.

  이 텍스트를 수정하지 않고 이어쓰기 요청에 그대로 전달하면, 모델이 컨텍스트에서 거절 문구를 인식하여 다시 차단될 가능성이 커집니다. **계속 진행하기 전에 해당 문장을 제거하십시오.**
</Warning>

## 선택 방법

<CardGroup cols={2}>
  <Card title="스트리밍 사용" icon="zap">
    * 사용자가 출력을 즉시 확인해야 하는 채팅, 고객 지원 및 에이전트 응답
    * 사용자가 중간에 생성을 중단할 수 있는 시나리오
    * 일상적인 대화는 콘텐츠 필터링을 트리거하는 경우가 드물어 스트리밍 경험이 더 중요한 환경
  </Card>

  <Card title="비스트리밍 사용" icon="package">
    * 대본, 스토리보드, 소설 챕터 및 기타 긴 창작물 작성
    * 일괄 번역, 정보 추출, 구조화된 JSON
    * 사용자에게 표시되기 전에 파싱 및 저장되는 결과
    * **민감한 줄거리를 다룰 가능성이 있는 콘텐츠**(격투, 부상, 범죄)
  </Card>
</CardGroup>

하나의 제품에서 **둘 다 사용**할 수 있습니다. 채팅은 스트리밍하고, 대본이나 스토리보드는 스트리밍 없이 생성할 수 있습니다. 후자의 경우 `stream`을 `false`로 설정하기만 하면 되며 다른 모든 설정은 변경하지 않고 그대로 유지하시면 됩니다.

비스트리밍 요청은 전체 응답이 모두 생성된 후에만 반환됩니다. 추론 모델의 긴 출력은 30초에서 100초 이상 걸릴 수 있으므로, 이러한 요청에 대한 클라이언트 타임아웃은 **최소 300초**로 설정하십시오. 자세한 내용은 [API 타임아웃을 방지하려면 어떻게 해야 하나요?](/ko/faq/timeout-configuration)를 참고하십시오. UI에서 진행 상황을 표시해야 하는 경우, "생성 중" 상태를 표시하고 완료된 후 결과를 보여주십시오.

## 반드시 stream을 사용해야 하는 경우

<Steps>
  <Step title="stream을 읽는 동안 finish_reason 기록">
    `finish_reason`이(가) `choices`을(를) 포함하는 마지막 이벤트에서 `content_filter`인 경우, 응답이 필터링된 것입니다. HTTP 상태 코드에 의존하지 마십시오.
  </Step>

  <Step title="끝부분의 거부 메시지 제거">
    생성 단계에서 출력이 중단되면 텍스트 끝에 영어 거부 메시지가 포함됩니다. 부분적으로 생성된 출력을 어떻게 처리할지 결정하기 전에 이 메시지를 제거하십시오.
  </Step>

  <Step title="스트리밍 없이 재시도">
    플랫폼이 경로를 자동으로 전환할 수 있도록 잘린 부분을 비스트리밍 요청으로 다시 전송하십시오. 이는 스트리밍을 통해 이어서 생성하는 것보다 성공할 확률이 훨씬 높습니다.
  </Step>

  <Step title="계속 차단되는 경우 표현 수정">
    동일한 작업에 대해 비스트리밍 요청마저 실패하는 경우, 민감한 세부 정보를 더 일반적인 표현으로 바꾸어 다시 시도하십시오. 동일한 내용을 변경 없이 그대로 재전송하지 마십시오.
  </Step>
</Steps>

다음은 stream을 읽고, 필터링 시 거부 메시지를 제거한 후 스트리밍 없이 재시도하는 최소한의 예제입니다.

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL = "I'm sorry, but I cannot assist with that request."

def generate(messages, model="gpt-5.6-terra"):
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        stream_options={"include_usage": True},
    )
    parts, finish = [], None
    for chunk in stream:
        if not chunk.choices:
            continue
        choice = chunk.choices[0]
        if choice.delta and choice.delta.content:
            parts.append(choice.delta.content)
            print(choice.delta.content, end="", flush=True)
        if choice.finish_reason:
            finish = choice.finish_reason

    text = "".join(parts)
    if finish != "content_filter":
        return text

    # Filtered: strip the trailing refusal and retry without streaming so the platform can switch routes
    partial = text.removesuffix(REFUSAL)
    print(f"\n[Cut off by content filter after {len(partial)} characters; retrying without streaming]")
    resp = client.chat.completions.create(model=model, messages=messages, timeout=600)
    return resp.choices[0].message.content
```

<Tip>
  이 예제는 가장 간단한 접근 방식인 스트리밍 없이 전체 응답을 다시 생성하는 방식을 사용합니다. 워크플로에서 부분 출력을 반드시 유지해야 하는 경우, `partial`을(를) 컨텍스트로 전달하여 모델에 계속 이어 작성하도록 요청하되, 이 후속 요청 또한 스트리밍 없이 전송하십시오.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="중단된 스트리밍 요청도 과금됩니까?">
    그렇습니다. 제공업체에서 해당 콘텐츠를 실제로 생성했으므로 실제 입력 및 출력 tokens에 대해 과금됩니다. 필터링을 유발하기 쉬운 콘텐츠의 경우 비스트리밍 방식이 더 저렴합니다. 성공한 시도에 대해서만 과금되기 때문입니다.
  </Accordion>

  <Accordion title="콘텐츠 필터링을 끌 수 있습니까?">
    아닙니다. 필터링은 제공업체에서 적용하므로 APIYI에서 이를 끄거나 엄격도를 변경할 수 없습니다. 플랫폼에서 할 수 있는 조치는 필터링된 비스트리밍 요청을 다른 공식 라우트에서 재시도하는 것뿐입니다.
  </Accordion>

  <Accordion title="동일한 콘텐츠가 어떤 때는 통과하고 어떤 때는 중단되는 이유는 무엇입니까?">
    공식 라우트마다 필터링 엄격도에 다소 차이가 있고, 모델이 매번 출력을 다르게 표현하므로 경계선에 있는 콘텐츠는 어떤 때는 통과하고 다음에는 중단될 수 있습니다. 명백하게 민감한 콘텐츠는 일관되게 차단됩니다.
  </Accordion>

  <Accordion title="플랫폼에서 스트리밍 요청을 자동으로 재시도하지 않는 이유는 무엇입니까?">
    생성 단계에서의 중단은 이미 콘텐츠가 전송된 후에 발생하며, 클라이언트는 이미 앞부분을 수신하여 표시한 상태입니다. 그 시점에서 다른 라우트에서 처음부터 다시 생성하면 이미 표시된 내용과 일치하지 않게 됩니다. 따라서 스트리밍 요청은 클라이언트가 `content_filter`을(를) 확인한 후 직접 처리해야 합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="OpenAI 모델 거부는 어떤 형태입니까?" icon="message-square-x" href="/ko/faq/openai-content-safety-refusal">
    모델 자체가 거부할 때의 응답 형태 및 감지
  </Card>

  <Card title="스트리밍 vs 비스트리밍 호출" icon="audio-lines" href="/ko/faq/streaming-vs-non-streaming">
    두 가지 모드의 연동, 과금 및 흔한 오해
  </Card>

  <Card title="API 타임아웃은 어떻게 방지합니까?" icon="timer" href="/ko/faq/timeout-configuration">
    긴 비스트리밍 출력을 위한 타임아웃 설정
  </Card>

  <Card title="콘텐츠 안전 및 규정 준수" icon="shield-check" href="/ko/faq/content-safety">
    플랫폼 콘텐츠 안전 및 규정 준수 정책
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.