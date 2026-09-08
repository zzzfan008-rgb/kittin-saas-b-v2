> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 타임아웃을 피하려면 어떻게 해야 합니까?

> 클라이언트 타임아웃 설정, 추론 모델이 실제로 얼마나 느린지, 올바른 Base URL 노드 선택, 그리고 429 동시 실행 수 검사 — 타임아웃을 피하는 네 가지 핵심입니다

## 짧은 답변

<Info>
  **타임아웃 문제의 90%를 커버하는 세 가지 황금 규칙입니다:**

  1. **동기식 이미지 엔드포인트에는 360초 타임아웃을 설정하십시오.** 이미지 생성에는 비동기 작업 ID가 없습니다. 너무 일찍 연결이 끊기면 과금은 되지만 이미지는 받지 못합니다.
  2. **추론 모델에는 충분한 시간을 주십시오.** `gemini-3.1-pro-preview`, `gpt-5.6-sol`, `gpt-5.5-pro`는 stream 여부와 상관없이 몇 분이 걸릴 수 있습니다.
  3. **긴 요청은 절대 CDN 노드를 통해 실행하지 마십시오.** `api-cf.apiyi.com`는 Cloudflare 뒤에 있으며 약 100초가 지나면 `524`를 반환합니다. 빠른 텍스트 호출에만 적합합니다.

  별도로: 특정 모델이 계속해서 `429`(동시 실행 수 부족)을 반환한다면 지원팀에 문의하여 쿼터를 검토해 달라고 요청하십시오.
</Info>

## 타임아웃 치트시트

| 시나리오              | 권장 타임아웃      | 권장 노드                             | 참고                 |
| ----------------- | ------------ | --------------------------------- | ------------------ |
| 일반 텍스트 채팅(비추론)    | 60-120s      | 모든 노드                             | 보통 몇 초 안에 반환됩니다    |
| 추론 모델(사고 / 추론)    | **300-600s** | `api.apiyi.com` / `vip.apiyi.com` | 스트리밍 여부와 관계없이 느립니다 |
| 긴 텍스트 출력(10k+ 단어) | **300s 이상**  | `api.apiyi.com` / `vip.apiyi.com` | ❌ CDN 노드가 아닙니다     |
| 이미지 생성 / 편집       | **360s 기준**  | `api.apiyi.com` / `vip.apiyi.com` | ❌ CDN 노드가 아닙니다     |
| 4K 이미지, 다중 이미지 참조 | **600s**     | 위와 동일                             | 이미지 모범 사례를 참조하세요   |

<Warning>
  **타임아웃된 요청도 과금됩니다**

  클라이언트가 연결을 끊은 뒤에도 서버와 상위 제공업체는 **작업을 계속 완료하며**, 해당 요청은 **기존과 동일하게 과금됩니다**.

  즉, **타임아웃을 너무 짧게 설정하면 비용은 지불하고도 아무것도 얻지 못하는 셈입니다**. 거의 성공할 뻔한 요청이 사용자 측 클라이언트에서 잘리지 않도록, 안전한 상한값으로 한 번 설정해 두는 것이 좋습니다.
</Warning>

## 네 가지 키를 자세히

<AccordionGroup>
  <Accordion title="① 동기식 이미지 엔드포인트: 타임아웃을 360초로 설정하십시오">
    APIYI의 모든 이미지 모델은 **동기식**입니다: 요청을 보내고 연결을 유지하면 결과가 응답 본문으로 돌아옵니다. 비동기 task ID도 없고 폴링 엔드포인트도 없습니다 — 연결이 끊기면 결과도 사라집니다.

    **기본값이 발목을 잡는 이유**: 주류 HTTP 클라이언트의 기본값은 30\~60초이지만, 이미지 생성은 실제로 매우 긴 요청입니다:

    * GPT-Image-2의 `high` 품질에서 2K/4K는 실제로 3\~5분이 걸립니다
    * Nano Banana 4K 생성은 대략 50초부터 시작하며, 피크 시간대에는 더 오래 걸립니다
    * 멀티 이미지 레퍼런스 작업은 종종 5분을 넘습니다

    **권장 사항**: 모델의 지연 시간을 확신할 수 없을 때는 **360초**를 기준으로 사용하십시오. 4K와 멀티 이미지 레퍼런스 같은 무거운 작업에는 **600초**를 주십시오. 모델별 값은 [이미지 API 모범 사례](/ko/api-capabilities/image-api-best-practices)에 있습니다.

    <Tip>
      가끔 로그에는 이미지가 30초 만에 완료된 것으로 보이는데 클라이언트는 5분을 기다리는 경우가 있습니다. 이는 로그의 duration이 게이트웨이의 처리 완료 시점까지만 계산되기 때문이며, 사용자는 본문이 끝까지 도착하고 연결의 종료 신호가 올 때까지 기다리게 됩니다. **타임아웃을 늘린다고 항상 도움이 되는 것은 아닙니다**: 느리게 다운로드되는 유형에는 효과가 있지만, 데이터는 이미 모두 도착했고 종료 신호만 누락된 경우에는 그렇지 않습니다. [로그에는 완료되었다고 나오는데 클라이언트는 아무것도 받지 못했습니다](/ko/faq/log-duration-vs-client-wait)를 따라 한 번 측정한 뒤 결정하십시오.
    </Tip>
  </Accordion>

  <Accordion title="② 추론 모델: 스트리밍 유무와 상관없이 느립니다">
    일반 텍스트 모델은 몇 초 안에 응답하므로, 텍스트 호출에는 타임아웃 조정이 필요 없다고 생각하기 쉽습니다. **추론 모델은 예외입니다:**

    * `gemini-3.1-pro-preview`
    * `gpt-5.6-sol`
    * `gpt-5.5-pro` (더 비싸고 더 느립니다)
    * 높은 thinking budget으로 실행되는 모든 모델(높은 reasoning effort)

    이 모델들은 답변을 생성하기 전에 내부적으로 오랫동안 추론하며, **총 지연 시간이 몇 분에 이르는 것은 정상입니다**.

    **핵심 포인트: 스트리밍이 이를 해결하지는 않습니다.** 많은 사람은 `stream=True`이면 데이터가 즉시 도착한다고 생각하지만, 추론 모델은 생각 단계 동안 아예 tokens를 내보내지 않을 수 있으므로 읽기 타임아웃이 여전히 발생합니다 — 그리고 첫 token부터 마지막 token까지의 **총** 시간도 여전히 깁니다.

    **권장 사항**: 추론 모델에는 타임아웃을 **300\~600초**로 설정하고, 허용한 시간에 맞춰 추론 티어(`reasoning_effort` / `thinking`)를 맞추십시오 — 더 높은 티어일수록 더 넉넉한 여유가 필요합니다.
  </Accordion>

  <Accordion title="③ Base URL 선택: CDN 노드는 긴 요청을 처리할 수 없습니다">
    APIYI의 `api-cf.apiyi.com`는 **Cloudflare 전역 CDN** 앞단에 있습니다. 전 세계 가속과 해외에서의 낮은 지연 시간을 제공하지만, 요청 타임아웃이 대략 100초이므로 그 이후에는 `524` 오류가 발생합니다.

    ⚠️ **이 영향은 이미지 엔드포인트에만 그치지 않습니다.** 100초를 넘길 수 있는 모든 호출은 적합하지 않으며, 예를 들면 다음과 같습니다:

    * ❌ 이미지 생성 / 편집
    * ❌ 동영상 생성
    * ❌ 긴 텍스트 출력(긴 기사, 대규모 번역, 대규모 코드 생성)
    * ❌ 추론 모델에서의 깊은 추론 작업

    ✅ **적합한 경우**: 100초 내에 끝나는 일반 채팅과 짧은 생성 작업입니다.

    **권장 사항**: 긴 요청에는 `api.apiyi.com`(중국 본토 권장) 또는 `vip.apiyi.com`(해외 권장)을 사용하십시오. 전체 노드 비교는 [기본 URL 가이드](/ko/faq/base-url-config)에서 확인할 수 있습니다.
  </Accordion>

  <Accordion title="④ 429 동시 실행 수 제한에 걸리는 경우: 지원팀에 문의하십시오">
    타임아웃과 함께 `429 Too Many Requests`가 자주 발생한다면, 문제는 대개 타임아웃이 아니라 **동시 실행 수 쿼터**입니다.

    동시 실행 수 제한은 계정 전체가 아니라 **모델별**로 적용됩니다. 특정 모델 — 특히 새로 출시되었거나 공급이 제한된 모델 — 은 더 낮은 쿼터를 가질 수 있습니다.

    **조치 방법:**

    1. 지수 백오프를 구현하여 짧은 순간에 제한을 포화시키지 않도록 하십시오
    2. 429 오류가 계속되면 **APIYI 지원팀에 문의하십시오** — 해당 모델의 실제 쿼터를 확인하고 조정하는 데 도움을 드릴 수 있습니다

    규칙은 [얼마나 많은 동시 실행 수를 사용할 수 있습니까?](/ko/faq/api-concurrency)에서 확인하십시오.
  </Accordion>
</AccordionGroup>

## 코드 예제

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",  # not the api-cf node for long requests
    )

    # Tier your timeouts by scenario (seconds) instead of one global value
    TIMEOUTS = {
        "text":      120,   # regular text
        "reasoning": 600,   # reasoning models
        "image":     360,   # image generation baseline
        "image_4k":  600,   # 4K / multi-image reference
    }

    resp = client.chat.completions.create(
        model="gpt-5.6-sol",
        messages=[{"role": "user", "content": "Analyze the complexity of this code"}],
        timeout=TIMEOUTS["reasoning"],   # 600s for reasoning models
    )
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      timeout: 600 * 1000,   // milliseconds — 600s for reasoning models
      maxRetries: 0,         // avoid auto-retry on long requests: it double-bills
    });

    const resp = await client.chat.completions.create({
      model: "gemini-3.1-pro-preview",
      messages: [{ role: "user", content: "Write an 8000-word technical analysis" }],
    });
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # --max-time caps the total request duration in seconds
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      --max-time 360 \
      -d '{
        "model": "gpt-image-2",
        "prompt": "a serene mountain lake at sunrise",
        "size": "2048x2048"
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **긴 요청에서 자동 재시도에 주의하십시오**: 많은 SDK는 기본값으로 두 번 재시도합니다. 이미지 또는 추론 작업이 시간 초과로 재시도되면, 결과물 없이 세 번 과금될 수 있습니다. `max_retries`을 0으로 설정하고 애플리케이션 로직에서 재시도를 직접 제어하십시오.
</Warning>

## 타임아웃을 늘린 뒤에도 여전히 시간 초과가 발생합니까? 모든 홉을 확인하십시오

<Steps>
  <Step title="Step 1: SDK 타임아웃이 실제로 적용되는지 확인하십시오">
    일부 프레임워크는 HTTP 클라이언트 위에 다른 타임아웃을 감쌉니다. 실제 적용 구성을 출력하고, 변경한 매개변수가 실제로 사용되는지 확인하십시오.
  </Step>

  <Step title="Step 2: 경로의 모든 홉을 확인하십시오">
    생성 시간보다 짧은 타임아웃을 가진 모든 계층은 클라이언트보다 먼저 연결을 끊습니다:

    * 자체 호스팅 역방향 프록시: Nginx `proxy_read_timeout` (기본값은 60초)
    * 클라우드 로드 밸런서: 유휴 연결 타임아웃
    * API 게이트웨이 / CDN: 오리진 타임아웃
    * 서버리스 함수: 실행 제한(기본값은 보통 30\~60초)
    * 태스크 큐 워커: 작업별 타임아웃

    **모든 홉의 타임아웃을 늘려야 합니다** — 클라이언트만 변경해서는 아무 효과가 없습니다.
  </Step>

  <Step title="Step 3: CDN 노드에 있지 않은지 확인하십시오">
    Base URL이 `api-cf.apiyi.com`인지 확인하십시오. 긴 요청의 경우 `api.apiyi.com` 또는 `vip.apiyi.com`로 전환하십시오.

    경험칙으로는 \*\*`524`\*\*은 거의 항상 Cloudflare 계층 타임아웃을 의미하며, 느린 모델을 의미하지는 않습니다.
  </Step>

  <Step title="Step 4: 타임아웃과 동시 실행 수 제한을 구분하십시오">
    상태 코드를 읽으십시오: `524`와 연결 끊김은 타임아웃 문제이며, `429`는 쿼터 문제입니다. 해결 방법은 완전히 다릅니다.
  </Step>

  <Step title="Step 5: 실제 지연 시간은 호출 로그에서 확인하십시오">
    콘솔의 [호출 로그](/ko/faq/call-logs)에서 요청의 실제 소요 시간과 과금을 확인한 뒤, 그 값을 바탕으로 적절한 타임아웃을 산정하십시오.
  </Step>
</Steps>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="타임아웃된 요청에 대해 환불받을 수 있습니까?">
    아닙니다. 클라이언트가 연결을 끊은 뒤에도 서버와 upstream은 작업을 계속 완료하므로, 비용이 실제로 발생합니다.

    올바른 방법은 작은 값을 두고 재시도에 의존하는 대신, **타임아웃을 한 번에 안전한 상한선으로 설정하는 것**입니다. 재시도는 과금만 늘릴 뿐입니다.
  </Accordion>

  <Accordion title="연결이 끊긴 뒤 ID로 결과를 가져올 수 있도록 비동기 엔드포인트를 제공할 수 있습니까?">
    이미지 엔드포인트는 현재 **동기 패스스루 모드**로 실행되며, 고객 비즈니스 데이터를 저장하지 않으므로 "연결 해제 후 ID로 가져오기"는 사용할 수 없습니다.

    권장 패턴은 동기 호출 + 넉넉한 타임아웃 + 자체 작업 상태 테이블입니다. 이는 사실상 가벼운 비동기 큐와 같습니다. [이미지 엔드포인트는 동기식입니까, 비동기식입니까?](/ko/faq/image-async-api)를 참고하십시오.

    동영상 모델은 기본적으로 비동기이며, 이는 영향을 받지 않습니다.
  </Accordion>

  <Accordion title="스트리밍이 타임아웃을 방지합니까?">
    **부분적으로는 그렇지만, 여기에 의존해서는 안 됩니다.**

    스트리밍은 첫 token을 더 빨리 전달하므로 전체 무응답 위험을 줄여 줍니다. 그러나 추론 모델은 사고 단계 동안 아무것도 출력하지 않을 수 있으므로 읽기 타임아웃은 여전히 발생하며, 전체 출력 시간은 결국 여전히 오래 걸립니다.

    올바른 방법은 스트리밍 **+** 넉넉한 타임아웃입니다.
  </Accordion>

  <Accordion title="매우 큰 타임아웃을 설정하면 단점이 있습니까?">
    과금 영향은 없습니다 — **기다린 시간과는 무관하게 소비한 token과 호출에 대해서만 과금됩니다**.

    유일한 우려는 사용자 측의 리소스 사용입니다. 긴 연결은 워커 또는 커넥션 풀 슬롯을 점유합니다. 높은 동시 실행 수에서는 이미지와 추론 요청을 비동기 I/O 또는 전용 장기 작업 큐로 처리하십시오.
  </Accordion>

  <Accordion title="524와 429의 차이점은 무엇입니까?">
    * **`524`**: Cloudflare 계층 타임아웃으로, `api-cf.apiyi.com`를 사용했고 요청이 약 100초를 초과했다는 뜻입니다. 노드를 전환하십시오.
    * **`429`**: 지속 시간과는 무관한 동시 실행 수 또는 요청 제한입니다. 지수 백오프를 추가하고, 문제가 계속되면 지원팀에 문의하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="이미지 API 모범 사례" icon="image" href="/ko/api-capabilities/image-api-best-practices">
    모델별 타임아웃 표와 출력 형식 참고
  </Card>

  <Card title="Base URL은 어떻게 설정합니까?" icon="link" href="/ko/faq/base-url-config">
    네 개 노드의 차이점과 선택 방법
  </Card>

  <Card title="이미지 엔드포인트는 동기식입니까, 비동기식입니까?" icon="refresh-cw" href="/ko/faq/image-async-api">
    동기식 모드와 클라이언트 측 작업 관리
  </Card>

  <Card title="사용할 수 있는 동시 실행 수는 얼마입니까?" icon="gauge" href="/ko/faq/api-concurrency">
    모델 유형별 동시 실행 수 제한과 쿼터 요청
  </Card>
</CardGroup>

## 문의하기

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [클릭하여 지원에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    타임아웃 문제 해결 및 동시 실행 수 쿼터 요청
  </Card>

  <Card title="이메일" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
