> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 스트리밍 호출과 비스트리밍 호출의 차이점은 무엇입니까?

> 동일한 키가 때로는 스트리밍 응답을, 때로는 비스트리밍 응답을 생성하는 이유, 두 모드의 차이점, 어떤 상황에 어떤 모드가 적합한지, 통합 작업량, 과금, 그리고 자주 하는 오해 6가지를 설명합니다.

## 짧은 답변

<Info>
  **세 문장입니다:**

  1. **streaming vs non-streaming은 전적으로 사용자의 코드로 결정됩니다**—즉 요청 본문의 `stream` 필드입니다. 같은 키, 같은 모델, 같은 엔드포인트라면, 이 값이 앞뒤로 바뀐다면 클라이언트 코드(또는 이를 감싼 SDK / 프레임워크)가 바꾸고 있는 것입니다. **게이트웨이는 이를 임의로 전환하지 않습니다.**
  2. **두 모드는 최종 콘텐츠가 완전히 동일하며 과금도 동일합니다.** 차이는 텍스트를 *언제* 받는지와 *어떻게* 파싱하는지만 다릅니다.
  3. **선택 기준**: 사람이 화면을 보고 있다 → streaming; 프로그램이 결과를 소비한다(JSON 파싱, 배치 작업, tools 호출) → non-streaming.
</Info>

## 차이점 한눈에 보기

| 항목                   | 스트리밍 `stream: true`                                                 | 비스트리밍(기본값)                           |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| 요청 파라미터              | `stream: true`                                                      | 생략하거나 `stream: false`                |
| 응답 형식                | SSE 이벤트 스트림(`text/event-stream`), 많은 `data:` 청크, `data: [DONE]`로 종료 | 하나의 완전한 JSON 객체                      |
| 텍스트 읽기               | `choices[0].delta.content`를 청크 단위로 누적                               | `choices[0].message.content`를 직접 읽음  |
| 첫 바이트까지 걸리는 시간(TTFB) | 빠름, 일반 모델에서는 보통 1\~3초                                               | ≈ 전체 생성 시간                           |
| 전체 지연 시간             | 비스트리밍과 대체로 동일                                                       | 스트리밍과 대체로 동일                         |
| `usage`              | 기본적으로 **반환되지 않음**; `stream_options: {"include_usage": true}`가 필요함   | 응답 본문에 항상 포함됨                        |
| 오류 형태                | 연결이 이미 열린 상태이므로 오류가 스트리밍 중간에 발생할 수 있으며, 읽기 루프 안에서 처리해야 함            | 하나의 HTTP 상태 코드 + 오류 JSON — 가장 단순한 경우 |
| 긴 무음 구간              | 드묾(데이터가 계속 흐름)                                                      | 흔함(생성 전체 동안 연결이 무음 상태임)              |
| 통합 작업량               | 중간: 점진적 조립, SSE 파싱, 버퍼링 비활성화                                        | 낮음: 요청 1회, 파싱 1회                     |
| 과금                   | token당                                                              | **완전히 동일함**                          |
| 콘솔 로그                | `is_stream = true`                                                  | `is_stream = false`                  |

## 왜 제 요청은 스트리밍과 비스트리밍 사이를 오갑니까?

이것은 가장 흔한 질문이며, 답은 다음과 같습니다: **여러분 쪽의 어떤 것이 이를 바꾸고 있습니다.** 아래 목록을 순서대로 점검하십시오 — 거의 항상 그중 하나가 맞습니다:

<AccordionGroup>
  <Accordion title="1. `stream`은 코드의 변수 또는 설정값입니다">
    전형적인 사례는 다음과 같습니다: `stream=config.get("stream", False)` 또는 `stream=is_web_request`. 서로 다른 진입점이 같은 함수에 서로 다른 값으로 도달하며, 로그상으로는 모드가 무작위로 바뀌는 것처럼 보입니다.

    **확인 방법**: 실제로 보내는 요청 본문을 출력하고 `stream` 필드를 확인하십시오.
  </Accordion>

  <Accordion title="2. 서로 다른 SDK와 프레임워크는 기본값이 다릅니다">
    같은 비즈니스 로직도 클라이언트에 따라 다르게 동작합니다:

    * OpenAI SDK `chat.completions.create()`: 기본값은 **비스트리밍**입니다
    * `client.chat.completions.stream()` 또는 `with_streaming_response`: **스트리밍**
    * LangChain / LlamaIndex 같은 래퍼: `invoke` 또는 `stream` 중 무엇을 호출하는지, 그리고 모델 객체를 생성할 때 `streaming=True`을 전달했는지에 따라 다릅니다
    * 데스크톱 클라이언트, 에이전트 도구, 워크플로 플랫폼: 보통 설정에 “스트리밍 출력” 토글을 제공하며, 기본값은 제각각입니다

    **확인 방법**: 실제로 어떤 진입점이 호출을 발생시켰는지 확인하십시오.
  </Accordion>

  <Accordion title="3. 여러 애플리케이션이 하나의 키를 공유하는 경우">
    웹 채팅 UI(스트리밍)와 야간 배치 작업(비스트리밍)이 같은 키를 함께 사용하면, 로그를 같이 볼 때 무작위처럼 보입니다.

    **확인 방법**: 사용 사례별로 별도의 token을 만드십시오 — 그러면 로그가 자연스럽게 분리됩니다. [Token 관리](/ko/faq/token-management)를 참조하십시오.
  </Accordion>

  <Accordion title="4. 중간 장비가 스트림을 평탄화했습니다">
    실제로는 `stream: true`를 보냈지만, Nginx나 기업 게이트웨이, 또는 어떤 프록시가 응답을 **버퍼링**했습니다 — 서버는 이를 청크 단위로 보냈고, 프록시는 이를 보관했다가 한 번에 내보냈기 때문에 비스트리밍처럼 느껴집니다.

    **확인 방법**: 프록시를 우회하여 한 번 테스트하십시오. Nginx에서 버퍼링을 끄십시오 (`proxy_buffering off;`). 이 경우 콘솔 로그에는 여전히 `is_stream = true`가 표시되는데, 이는 게이트웨이가 실제로 스트리밍으로 내보냈기 때문입니다.
  </Accordion>
</AccordionGroup>

<Tip>
  **특정 호출이 실제로 무엇을 했는지 확인하려면**: 콘솔 로그의 `is_stream` 필드를 확인하거나, [Log Query API](/ko/api-capabilities/log-query)로 일괄 조회하십시오. 그것이 기준이며 — 인상보다 훨씬 더 신뢰할 수 있습니다.
</Tip>

## 시나리오별 선택

<CardGroup cols={2}>
  <Card title="스트리밍을 사용하십시오" icon="zap">
    * 채팅 UI와 지원 봇 — 사용자가 즉각적인 피드백을 필요로 합니다
    * IDE 플러그인 / 코딩 어시스턴트(Claude Code, Cursor 등)
    * 장문 생성(긴 문서, 긴 번역, 큰 코드 블록)
    * 긴 추론 모델 작업 — 최소한 진행 상황은 볼 수 있습니다
    * 사용자가 생성 도중 “stop”을 누를 수 있는 모든 경우
  </Card>

  <Card title="비스트리밍을 사용하십시오" icon="package">
    * 구조화된 출력: `json.loads()`을 위해 전체 JSON이 필요합니다
    * 함수 호출 / 도구 호출 인자 파싱
    * 배치 처리, 오프라인 작업, 예약 작업
    * 최종 결과만 중요하고 기다리는 사람이 없는 백엔드 흐름
    * 빠른 검증, 디버깅, 테스트 케이스 작성
  </Card>
</CardGroup>

몇 가지 특수한 경우는 다음과 같습니다:

| 시나리오                 | 권장 사항                            | 비고                                                                                                                     |
| -------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 이미지 생성 / 편집          | 비스트리밍                            | OpenAI 호환 `/v1/images/generations`은 `stream`을 허용하지 않습니다; Gemini의 기본 이미지 API에는 별도의 `:streamGenerateContent` 엔드포인트가 있습니다 |
| 동영상 생성               | 스트리밍과 관련이 없습니다                   | 비동기 작업 + 폴링, [비동기 이미지/동영상 API](/ko/faq/image-async-api)를 참고하십시오                                                        |
| 임베딩 / 재정렬            | 비스트리밍                            | 이 엔드포인트에는 스트리밍 개념이 없습니다                                                                                                |
| 추론 모델(thinking / 추론) | 스트리밍이 더 낫지만 **타임아웃을 해결하지는 못합니다** | 모델은 생각하는 동안 아무것도 출력하지 않을 수 있습니다 — 아래의 오해 1을 참고하십시오                                                                     |

## 통합 작업량: 같은 작업, 두 방식 모두

<Tabs>
  <Tab title="Python 비스트리밍 방식">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-apiyi-key",
        base_url="https://api.apiyi.com/v1",
    )

    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Explain quantum computing"}],
        timeout=120,
    )

    # Full text in one line
    print(resp.choices[0].message.content)
    # usage is right there in the response body
    print(resp.usage.total_tokens)
    ```
  </Tab>

  <Tab title="Python 스트리밍 방식">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-apiyi-key",
        base_url="https://api.apiyi.com/v1",
    )

    stream = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Explain quantum computing"}],
        stream=True,
        stream_options={"include_usage": True},   # without this, no usage
        timeout=120,
    )

    chunks = []
    for chunk in stream:
        # the final usage chunk has an empty choices array — check before indexing
        if chunk.choices and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            chunks.append(piece)
            print(piece, end="", flush=True)
        if chunk.usage:
            print(f"\nUsage: {chunk.usage.total_tokens} tokens")

    full_text = "".join(chunks)   # assemble it yourself if you need the whole thing
    ```
  </Tab>

  <Tab title="Node.js 스트리밍 방식">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: "sk-your-apiyi-key",
      baseURL: "https://api.apiyi.com/v1",
    });

    const stream = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [{ role: "user", content: "Explain quantum computing" }],
      stream: true,
      stream_options: { include_usage: true },
    });

    let full = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        process.stdout.write(delta);
      }
      if (chunk.usage) console.log("\nUsage:", chunk.usage.total_tokens);
    }
    ```
  </Tab>

  <Tab title="cURL 나란히 비교">
    ```bash theme={null}
    # Non-streaming: one complete JSON
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "Hello"}]
      }'

    # Streaming: a series of data: chunks, ending with data: [DONE]
    # -N disables curl's own buffering, otherwise it still looks like one blob
    curl -N https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": true,
        "stream_options": {"include_usage": true}
      }'
    ```
  </Tab>
</Tabs>

<Note>
  **Claude의 기본 형식(`/v1/messages`)은 다른 스트리밍 프로토콜을 사용합니다**: Anthropic의 **named-event SSE** (`message_start` / `content_block_delta` / `message_delta` 및 관련 이벤트), OpenAI의 균일한 `data:` 청크가 아니라, `usage`는 `message_start` 및 `message_delta` 이벤트에 걸쳐 분할됩니다. 전체 파싱 가이드: [Claude 기본 형식: 스트리밍 및 비스트리밍 응답](/ko/api-capabilities/claude-response-handling).
</Note>

## 과금과 사용량: 어느 쪽이든 동일합니다

<Warning>
  **스트리밍은 더 저렴하지도 더 비싸지도 않습니다.** 과금은 token 기준이며, 바이트가 어떻게 전송되는지와는 무관합니다.

  **중간에 끊어도 여전히 과금됩니다**—`Ctrl+C`에 도달하거나 클라이언트가 타임아웃되면 상위 생성은 끝까지 계속 실행되며 요청은 정상적으로 과금됩니다. 따라서 “돈을 아끼려고 스트리밍을 일찍 끊는다”는 방법은 통하지 않습니다.
</Warning>

`usage`와 관련된 두 가지 함정:

1. **스트리밍은 기본적으로 usage를 반환하지 않습니다.** OpenAI 호환 엔드포인트에서는 `stream_options: {"include_usage": true}`를 전달해야 합니다. 그러면 usage는 최종 청크에 도착하며(그 청크의 `choices` 배열은 비어 있으므로 인덱싱하기 전에 확인하십시오). 이는 APIYI의 여러 모델에서 정상 동작함이 확인되었습니다.
2. **API가 되돌려주는 `usage`를 기준으로 과금을 정산하지 마십시오.** 특히 캐시 관련 필드는 더욱 그렇습니다. 되돌려진 값은 실제 과금과 항상 일치하지 않으며, 캐시 적중 여부는 콘솔 로그의 \*\*“캐시 과금 상세 정보”\*\*로 판단됩니다. [캐시 과금 설명](/ko/faq/cache-billing)을 참조하십시오.

어느 쪽이든 콘솔 로그에는 모든 호출의 token 수, 지연 시간, 과금이 기록됩니다. 전송 방식은 차이가 없습니다. 필드 의미는 [로그 과금 상세 정보 이해하기](/ko/faq/log-billing-explained)를 참조하십시오.

## 자주 있는 6가지 오해

<AccordionGroup>
  <Accordion title="1. 스트리밍은 타임아웃을 방지합니다">
    **그렇지 않습니다.** 스트리밍은 *첫* token이 더 빨리 도착하게 할 뿐입니다. 전체 생성 시간을 줄이지도 않고, 데이터가 안정적으로 계속 흐른다는 보장도 없습니다.

    추론 모델(`gemini-3.1-pro-preview`, `gpt-5.6-sol`, `gpt-5.5-pro` 등)은 **추론 단계 동안 아무것도 전혀 내보내지 않을 수 있으며**, 그 경우에도 클라이언트의 읽기 타임아웃이 동일하게 발생합니다.

    올바른 해결책은 시나리오별 타임아웃 값입니다 — [API 타임아웃을 피하는 방법](/ko/faq/timeout-configuration)을 참고하십시오.
  </Accordion>

  <Accordion title="2. 스트리밍이 더 빠릅니다">
    **첫 바이트는 더 빠르지만, 전체는 그렇지 않습니다.** 같은 모델과 prompt를 사용하면 스트리밍과 비스트리밍은 대체로 비슷한 시간에 완료됩니다.

    스트리밍은 *체감* 속도를 높여줍니다. 사용자는 30초 동안 로딩 스피너만 바라보는 대신 1초 안에 움직임을 보게 됩니다. 화면을 보는 사람이 없다면 그 가치는 0입니다.
  </Accordion>

  <Accordion title="3. 스트리밍은 더 저렴하거나, 받은 만큼만 과금됩니다">
    **아닙니다.** 위의 “과금 및 사용량”을 보십시오: 과금은 동일하며, 중간에 연결을 끊어도 여전히 과금됩니다.
  </Accordion>

  <Accordion title="4. 모든 모델과 엔드포인트가 스트리밍을 지원합니다">
    **아닙니다.** 텍스트 채팅 모델은 일반적으로 지원하지만, 이미지 생성, embedding, rerank 엔드포인트에는 스트리밍 개념이 없으며 `stream`를 무시하거나 거부합니다.

    일부 모델은 스트리밍에서 특정 파라미터 조합에 대해 추가 제약이 있습니다. 확실하지 않다면 먼저 비스트리밍으로 호출이 동작하는지 확인한 다음 `stream: true`를 추가하십시오.
  </Accordion>

  <Accordion title="5. 비스트리밍이 더 안정적입니다">
    **둘 다 각자의 실패 방식이 있습니다.**

    * 비스트리밍의 위험: 연결이 생성 내내 조용하므로 프록시, CDN, 기업용 게이트웨이가 유휴 타임아웃으로 연결을 끊을 수 있습니다. 매우 큰 응답 본문(base64 이미지 출력은 쉽게 수십 MB에 이릅니다)에서는 멈춘 종료부에 걸릴 수도 있습니다 — [전송은 끝났지만 응답이 오지 않는 요청](/ko/api-capabilities/image-tail-stall)과 [로그에는 완료로 표시되지만 클라이언트는 아무것도 받지 못하는 경우](/ko/faq/log-duration-vs-client-wait)를 참고하십시오.
    * 스트리밍의 위험: SSE를 지원하지 않거나 버퍼링을 강제로 적용하는 중간 장비와는 잘 맞지 않습니다. 클라이언트 파싱은 더 복잡하며, 미묘하게 잘못 구현하기 쉽습니다.

    또한 `api-cf.apiyi.com`(CDN 엔드포인트)는 약 100초의 요청 상한이 있으며, 이는 **두 모드 모두에 영향을 줍니다**. 긴 요청에는 `api.apiyi.com` 또는 `vip.apiyi.com`를 사용하십시오 — [Base URL 구성 가이드](/ko/faq/base-url-config)를 참고하십시오.
  </Accordion>

  <Accordion title="6. 스트림에서 완전한 답변을 얻을 수 없습니다">
    **얻을 수 있습니다 — 직접 조합하면 됩니다.** 각 청크의 `delta.content`를 순서대로 이어 붙이면 비스트리밍 `message.content`와 정확히 같습니다.

    조합된 텍스트가 불완전해 보인다면 세 가지를 확인하십시오: `finish_reason`를 무시했는지, `data: [DONE]`를 받기 전에 루프를 종료했는지, 그리고 중간 장비가 응답을 잘라냈는지입니다.
  </Accordion>
</AccordionGroup>

## 스트리밍이 작동하지 않습니까? 네 단계

<Steps>
  <Step title="요청 본문에 정말 stream: true가 포함되어 있는지 확인하십시오">
    실제로 전송하는 JSON을 출력하십시오. 래퍼 라이브러리에서는 “전달했다고 생각했습니다”와 “실제로 전달되었습니다”가 종종 다른 일입니다.
  </Step>

  <Step title="curl -N으로 직접 테스트하십시오">
    위의 “cURL 나란히 보기” 탭에 있는 명령을 사용하여 직접 작성한 코드와 모든 프록시를 우회하십시오. curl에서 청크가 점진적으로 도착하는 것이 보이면 서버 측은 정상이며 문제는 클라이언트 또는 중간 장치에 있습니다.
  </Step>

  <Step title="중간 장치 버퍼링을 확인하십시오">
    Nginx에 `proxy_buffering off;`를 추가하십시오. 기업용 게이트웨이와 보안 장비는 `text/event-stream`를 전체 페이로드로 검사할 수 있습니다 — 네트워크 관리자에게 이를 통과하도록 허용해 달라고 요청하십시오.
  </Step>

  <Step title="파싱 로직을 검토하십시오">
    SSE를 한 줄씩 읽고, 빈 줄과 `:`로 시작하는 주석 줄은 건너뛰며, `data: [DONE]`에서 중단하십시오. `usage`를 담고 있는 마지막 청크에는 비어 있는 `choices` 배열이 있으므로, 그 안에 인덱싱하지 마십시오.
  </Step>
</Steps>

<Tip>
  여기까지 왔는데도 답을 얻지 못했다면, **`request_id`를 첨부하여 지원팀에 문의하십시오** — 콘솔 로그에는 해당 호출이 스트림으로 처리되었는지 여부와 총 지연 시간, 첫 바이트까지의 시간이 직접 표시됩니다.
</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="API 시간 초과를 피하는 방법" icon="timer" href="/ko/faq/timeout-configuration">
    시나리오별 시간 초과 값과 스트리밍이 해결하지 못하는 이유
  </Card>

  <Card title="Base URL 설정 가이드" icon="link" href="/ko/faq/base-url-config">
    엔드포인트 간 차이와 CDN 노드의 100초 한도
  </Card>

  <Card title="로그에는 완료로 표시되지만 응답이 없음" icon="stethoscope" href="/ko/faq/log-duration-vs-client-wait">
    세그먼트 타이밍을 포함한 전형적인 대용량 비스트리밍 응답 문제
  </Card>

  <Card title="Claude 스트리밍 및 비스트리밍" icon="braces" href="/ko/api-capabilities/claude-response-handling">
    Anthropic의 네이티브 named-event SSE 프로토콜 구문 분석
  </Card>

  <Card title="텍스트 생성 API" icon="message-square" href="/ko/api-capabilities/text-generation">
    전체 파라미터 목록 및 호출 예시
  </Card>

  <Card title="로그 과금 세부 정보 이해하기" icon="file-text" href="/ko/faq/log-billing-explained">
    is\_stream을 포함하여 콘솔 로그의 각 필드 의미
  </Card>
</CardGroup>
