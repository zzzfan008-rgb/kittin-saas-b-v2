> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 웹사이트 또는 API가 502를 반환합니다 — 무엇을 해야 합니까?

> 502는 서비스 컨테이너가 자동 재시작되는 동안 나타나는 일시적인 증상이며, 보통 1분 이내에 해결됩니다 — 실패한 호출은 절대 과금되지 않으며, 클라이언트의 30초 재시도가 이를 자연스럽게 넘깁니다

## 간단한 답변

<Info>
  **502는 일시적입니다 — 사용자 측에서 구성 변경은 필요하지 않습니다:**

  1. **근본 원인은 서비스 컨테이너의 자동 재시작입니다** — 재시작 기간 동안 웹 콘솔에 접속할 수 없고 API는 502를 반환합니다. 이는 동일한 이벤트입니다.
  2. **복구는 보통 1분 이내에 자동으로 완료됩니다** — 30\~60초 기다린 뒤 요청을 다시 보내십시오.
  3. **실패한 호출은 절대 과금되지 않습니다** — 502가 발생하는 동안 요청은 실제로 서비스에 도달하지 않으므로 과금 기록이 생성되지 않습니다.
  4. **클라이언트 측에 자동 재시도를 추가하십시오** — 약 30초 후 한 번 재시도하면 전체 재시작 기간을 매끄럽게 넘길 수 있습니다.
</Info>

## 무슨 일이 발생하고 있습니까

`502 Bad Gateway` 는 다음을 의미합니다: **게이트웨이 계층이 요청을 받았지만 백엔드 서비스로 전달할 때 응답을 받지 못했다는 뜻입니다**.

APIYI에서는 일시적인 502의 압도적인 대부분이 **백엔드 서비스 컨테이너의 자동 재시작**으로 인해 발생합니다. 백엔드 프로세스가 잠시 사용할 수 없는 동안에는 다음이 발생합니다.

* **웹 콘솔**(대시보드, 충전 페이지 등)이 로드되지 않거나 오류를 표시합니다
* **API**(`api.apiyi.com` 및 다른 모든 엔드포인트)이 502를 반환합니다

둘 다 동일한 서비스에 의해 지원되므로 **함께 실패하고 함께 복구됩니다**. 이상이 감지되면 시스템이 자동으로 재시작을 완료하며 — 전체 과정은 **보통 1분 이내에 수동 개입 없이 끝납니다**.

<Note>
  **이런 종류의 502는 코드, Key, 잔액, 또는 네트워크 설정과는 전혀 관련이 없습니다.** 처음 보시는 경우라면 클라이언트 측에서 디버깅할 것은 없습니다 — 30\~60초 기다렸다가 다시 시도하십시오. 대부분의 경우 서비스는 이미 복구되어 있습니다.
</Note>

## 수행해야 할 작업

<Steps>
  <Step title="1단계: 30~60초 기다린 다음 요청을 다시 보내십시오">
    컨테이너 재시작은 보통 1분 이내에 완료됩니다. API 호출을 다시 보내기만 하십시오 — 실패한 호출에는 과금되지 않으므로, 재시도해도 중복 과금이 발생하지 않습니다.
  </Step>

  <Step title="2단계: 웹 콘솔이 로드되지 않으면 페이지를 강제 새로고침하십시오">
    복구 후에도 브라우저에 캐시된 오류 페이지가 계속 표시될 수 있습니다. **Ctrl+Shift+R**(Windows) 또는 **Cmd+Shift+R**(Mac)을 사용하여 강제 새로고침한 뒤 정상 인터페이스를 확인하십시오.
  </Step>

  <Step title="3단계: 502가 5분 이상 지속되면 지원팀에 문의하십시오">
    일시적인 재시작은 몇 분 이상 지속되지 않습니다. 502가 **5분 이상 지속되면**, 이는 일반적인 자동 재시작이 아닙니다 — 이 페이지 하단의 연락 옵션을 통해 문의해 주시고, 발생한 대략적인 시각(시간대 포함, 예: `14:30 (UTC+8)`)을 함께 알려 주십시오.
  </Step>
</Steps>

## 프로그래밍 방식 호출에 자동 재시도 추가

가용성에 민감한 워크로드라면, 클라이언트 측에서 502 같은 일시적 오류에 대해 자동 재시도를 추가하십시오 — 약 30초 후 한 번 재시도하면 전체 재시작 윈도우를 커버합니다.

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import time
    from openai import OpenAI, InternalServerError

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",
        max_retries=0,  # disable SDK default retries; the logic below takes over
    )

    def chat_with_retry(messages, retries=2, wait=30):
        for attempt in range(retries + 1):
            try:
                return client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                )
            except InternalServerError:
                # 502 / 503 and other 5xx: the request never reached the
                # service and is not billed, so retrying is always safe
                if attempt == retries:
                    raise
                time.sleep(wait)  # restarts finish within ~1 min; wait 30s

    resp = chat_with_retry([{"role": "user", "content": "Hello"}])
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      maxRetries: 0, // disable SDK default retries; the logic below takes over
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function chatWithRetry(messages, retries = 2, waitMs = 30_000) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await client.chat.completions.create({
            model: "gpt-4o",
            messages,
          });
        } catch (err) {
          // 502 / 503 and other 5xx: the request never reached the
          // service and is not billed, so retrying is always safe
          if (err.status < 500 || attempt >= retries) throw err;
          await sleep(waitMs); // restarts finish within ~1 min; wait 30s
        }
      }
    }

    const resp = await chatWithRetry([{ role: "user", content: "Hello" }]);
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # curl's --retry automatically retries transient errors like 502/503/504
    curl https://api.apiyi.com/v1/chat/completions \
      --retry 2 --retry-delay 30 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Hello"}]
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **이 재시도 전략은 요청이 서비스에 도달하지 못한 502/503 유형 오류에만 적용하십시오.** 클라이언트 타임아웃(또는 `524`)으로 끊긴 요청은 서버 측에서 아직 실행 중일 수 있으며 정상적으로 과금됩니다 — 이를 무작정 재시도하면 중복 과금이 발생합니다. 이런 문제에 대해서는 [API 타임아웃을 방지하는 방법](/ko/faq/timeout-configuration)을 참조하십시오.
</Warning>

<Tip>
  고빈도 워크로드의 경우 **지수 백오프**(1초, 그다음 2초, 그다음 4초)로 빠르게 탐지할 수도 있습니다 — 네트워크 순간 장애로 인한 502는 보통 몇 초 내에 해소됩니다. 그래도 실패하면, 컨테이너 재시작 상황을 커버하기 위해 30초 간격으로 전환하십시오.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="502 발생 중에 이루어진 요청도 과금됩니까?">
    **아닙니다.** 502는 요청이 실제로 백엔드 서비스에 도달하지 못했다는 뜻입니다 — 모델 사용이 발생하지 않았으므로 **과금 기록에 아무것도 표시되지 않습니다**.

    이것은 유용한 진단 방법이기도 합니다. 실패한 요청이 [호출 로그](/ko/faq/call-logs)에 과금 항목이 없다면 서버 측에서 전혀 처리되지 않은 것이므로, 안전하게 다시 전송하시면 됩니다.
  </Accordion>

  <Accordion title="502는 타임아웃, 429 또는 524와 어떻게 다릅니까?">
    * **`502`**: 백엔드 서비스가 잠시 사용할 수 없습니다(컨테이너 재시작 중입니다). 30\~60초 기다린 뒤 다시 시도하세요. 과금되지 않습니다.
    * **타임아웃 / 연결 끊김**: 클라이언트 타임아웃이 너무 짧습니다 — 서버는 여전히 요청을 처리하고 정상적으로 과금하고 있을 수 있습니다. [API 타임아웃을 방지하는 방법](/ko/faq/timeout-configuration)을 참고하세요.
    * **`429`**: 동시 실행 수 또는 요청 제한에 도달했습니다. 서비스 가용성과는 무관합니다. [API 동시 실행 수 제한](/ko/faq/api-concurrency)을 참고하세요.
    * **`524`**: 약 100초를 초과하는 요청으로 CDN 엔드포인트(`api-cf.apiyi.com`)를 사용 중입니다 — 엔드포인트를 전환하세요.

    이 경우에는 완전히 다른 대응이 필요합니다: **502/503만 직접 재시도하시면 됩니다**.
  </Accordion>

  <Accordion title="웹 콘솔과 API가 동시에 실패하는 이유는 무엇입니까?">
    웹 콘솔과 API는 동일한 서비스에서 구동됩니다. 컨테이너 재시작 중에는 둘 다 **함께 사용할 수 없게 되고 함께 복구됩니다** — 따라서 “웹사이트도 다운됐다”는 것은 이것이 클라이언트 설정 문제가 아니라 일시적인 플랫폼 측 이벤트임을 정확히 확인해 줍니다.
  </Accordion>

  <Accordion title="이런 일이 자주 발생합니까?">
    아닙니다 — 정기적으로 발생하는 일은 아닙니다. 일시적인 502는 대개 갑작스러운 트래픽 급증과 관련이 있으며 산발적으로 발생합니다.

    **2026년 8월 기준으로 백엔드 서버를 업그레이드하고 확장 중이며**, 이로 인해 이러한 일시적인 502의 빈도가 크게 줄어들 것입니다. 플랫폼 측 사고가 발생할 때마다 [실시간 상태 피드](/en/live)에 상태 업데이트와 복구 진행 상황을 즉시 게시합니다.
  </Accordion>

  <Accordion title="플랫폼 문제인지 제 네트워크 문제인지 어떻게 구분합니까?">
    두 가지 빠른 확인 방법이 있습니다:

    1. **웹 콘솔을 여세요**: `api.apiyi.com`가 502를 반환하고 콘솔도 로드되지 않으면, 거의 확실히 일시적인 플랫폼 측 재시작입니다 — 1분 정도 기다리세요.
    2. **네트워크를 전환하세요**: 모바일 데이터(다른 통신사)를 사용해 콘솔을 불러오거나, 아래 명령을 실행해 보세요. 그곳에서는 작동한다면 문제는 로컬 네트워크나 프록시입니다.

    ```bash theme={null}
    curl -I https://api.apiyi.com/v1/models \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

    다른 네트워크에서도 5분 이상 계속 502가 반환되면 지원팀에 문의하세요.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="API 타임아웃을 피하는 방법" icon="timer" href="/ko/faq/timeout-configuration">
    타임아웃 설정, reasoning-model 지연 시간, 524 진단
  </Card>

  <Card title="API를 사용하려면 프록시가 필요합니까?" icon="wifi" href="/ko/faq/network-proxy">
    직접 연결 관련 참고사항과 네트워크 요구사항
  </Card>

  <Card title="APIYI의 서버는 어디에 있습니까?" icon="server" href="/ko/faq/server-location">
    노드 위치, 지연 시간 테스트, 및 구매 조언
  </Card>

  <Card title="서비스 가용성 및 SLA" icon="shield-check" href="/ko/faq/sla-guarantee">
    가용성 약속 및 장애 대응
  </Card>
</CardGroup>

## 문의하기

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 이 카드를 클릭하여 지원팀에 바로 문의하십시오

    지속적인 502 보고 및 사고 분류
  </Card>

  <Card title="이메일" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
