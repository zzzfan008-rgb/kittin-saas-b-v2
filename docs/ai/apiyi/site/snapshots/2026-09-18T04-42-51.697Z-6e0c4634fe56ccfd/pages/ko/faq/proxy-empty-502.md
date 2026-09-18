> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 스크립트에서 502가 발생하지만 호출 로그에는 아무것도 없나요?

> 본문이 비어 있고 Connection: close 및 Content-Length: 0 헤더만 포함된 502는 APIYI가 아니라 사용자의 컴퓨터에 있는 프록시 소프트웨어에서 발생합니다. 문제를 해결하려면 스크립트가 시스템 프록시를 우회하도록 설정하십시오.

## 증상

배치 스크립트(일반적으로 Windows + Python `requests`)가 간헐적으로 다음과 유사하게 출력되는 502 응답을 받습니다.

```text theme={null}
HTTP 502: {'_non_json_response': '', '_status_code': 502,
           '_headers': {'Connection': 'close', 'Content-Length': '0'}}
```

또한 다음 사항을 확인할 수 있습니다.

* 응답 **본문이 비어 있으며**, 유일한 헤더는 `Connection` 및 `Content-Length`입니다.
* 웹 콘솔은 전체 시간 동안 계속 정상 작동합니다.
* 실패한 요청은 [호출 로그](/ko/faq/call-logs)에 **전혀 나타나지 않습니다**.
* 스크립트는 502에서 재시도하며, 하나가 성공하기 전에 여러 번 연속으로 실패하는 경우가 많고, 매번 백오프 시간이 더 길어집니다

## 간단한 답변

<Info>
  **이 502는 APIYI에서 발생한 것이 아닙니다. 사용자의 컴퓨터에 있는 프록시 소프트웨어(Clash, v2rayN 및 유사 도구)에서 생성된 것입니다.**

  해결하려면 스크립트가 시스템 프록시를 우회하도록 설정하십시오. `requests`에서는 `session.trust_env = False`를 설정하십시오. 다른 옵션은 아래에서 다룹니다.
</Info>

## 이것이 본인의 경우인지 확인하는 방법

모든 APIYI 계층은 식별 가능한 특성을 가진 응답을 반환하며, 그중 어느 것도 위의 빈 502와 일치하지 않습니다.

| 소스                   | 응답 특성                                                             |
| -------------------- | ----------------------------------------------------------------- |
| APIYI 액세스 노드 (nginx) | 항상 `Server` 및 `Date` 헤더를 포함합니다. 노드에서 생성된 5xx 오류에는 HTML 본문도 포함됩니다. |
| APIYI 게이트웨이          | `error.message`가 포함된 JSON 오류 본문                                   |
| 전달에 실패한 프록시 소프트웨어    | 빈 본문이며, 일반적으로 `Connection: close` 및 `Content-Length: 0`만 포함합니다.   |

502에 **`Server` 헤더도 없고, `Date` 헤더도 없으며, 본문이 비어 있다면**, 이는 APIYI가 아니라 프록시 소프트웨어에서 발생했을 가능성이 거의 확실합니다.

<Note>
  서비스 컨테이너가 잠시 재시작될 때 플랫폼에서도 실제 502를 반환할 수 있습니다. 이 경우 웹 콘솔도 동시에 중단되고, 서비스는 약 1분 내에 복구되며, 응답에는 전체 헤더와 본문이 포함됩니다. [웹사이트 또는 API가 502를 반환함](/ko/faq/website-502-error)을 참조하십시오.
</Note>

## 프록시가 개입하는 이유

1. **Python `requests`은 시스템 프록시를 자동으로 감지합니다.** Windows에서는 레지스트리에서 시스템 프록시 설정을 읽습니다. Clash, v2rayN 또는 유사한 도구가 “시스템 프록시”를 활성화하면 스크립트는 아무런 표시 없이 이를 경유하며, 코드 어디에도 드러나지 않습니다.
2. **프록시는 일반 HTTP 요청을 직접 전달합니다.** `http://api.apiyi.com:16888` 같은 일반 HTTP 주소에서는 프록시가 단순히 투명 터널을 여는 것이 아니라 사용자를 대신해 요청을 다시 전송합니다. 프록시 노드가 멈추거나 전환되거나 시간 초과되면 프록시는 빈 502 응답을 스크립트에 반환합니다.
3. **대용량 요청 본문과 높은 동시 실행 수는 문제를 악화시킵니다.** 이미지 편집은 수 MB의 이미지 데이터를 업로드하고, 한 번의 생성에는 45\~70초가 걸립니다. 하나의 프록시 노드를 공유하는 수십 개의 동시 요청에서는 작은 장애만 있어도 전체 배치가 한 번에 실패합니다.

<Tip>
  `https://`에서는 프록시가 암호화된 터널만 열므로, 장애는 일반적으로 조작된 502가 아니라 `ProxyError` 같은 연결 오류로 나타납니다. 하지만 HTTPS 트래픽도 여전히 프록시를 통과하므로, 근본적인 해결책은 스크립트가 프록시를 사용하지 않도록 하는 것입니다.
</Tip>

## 해결

<Steps>
  <Step title="스크립트가 프록시를 사용하는지 확인합니다">
    스크립트와 동일한 환경에서 다음을 실행합니다:

    ```python theme={null}
    import urllib.request
    print(urllib.request.getproxies())
    ```

    출력에 `http` 또는 `https` 항목(예: `127.0.0.1:7890`)이 포함되어 있으면, `requests`은 기본적으로 해당 프록시를 통해 라우팅됩니다.
  </Step>

  <Step title="프록시를 우회합니다(하나 선택)">
    <Tabs>
      <Tab title="requests">
        ```python theme={null}
        import requests

        session = requests.Session()
        session.trust_env = False   # ignore system and environment proxy settings

        resp = session.post(
            "https://api.apiyi.com/v1/images/edits",
            headers={"Authorization": "Bearer YOUR_API_KEY"},
            data={"model": "gpt-image-2-vip", "prompt": "...", "size": "1024x1536"},
            files=[("image[]", open("a.jpg", "rb"))],
            timeout=(10, 600),
        )
        ```

        단일 요청만 변경하려면 `requests.post(..., proxies={"http": None, "https": None})`을 사용합니다.
      </Tab>

      <Tab title="OpenAI SDK">
        ```python theme={null}
        import httpx
        from openai import OpenAI

        client = OpenAI(
            api_key="YOUR_API_KEY",
            base_url="https://api.apiyi.com/v1",
            http_client=httpx.Client(trust_env=False, timeout=600),
        )
        ```
      </Tab>

      <Tab title="환경 변수">
        코드를 변경하지 않으려면 스크립트를 실행하기 전에 `NO_PROXY`을 설정하여 APIYI 도메인이 프록시를 건너뛰도록 합니다:

        ```bash theme={null}
        # Windows PowerShell
        $env:NO_PROXY="api.apiyi.com,.apiyi.com"

        # macOS / Linux
        export NO_PROXY="api.apiyi.com,.apiyi.com"
        ```
      </Tab>

      <Tab title="프록시 소프트웨어">
        Clash, v2rayN 또는 유사한 도구에서 `apiyi.com`에 대한 DIRECT 규칙을 추가하거나, 배치 작업 실행 중에는 “시스템 프록시”를 끕니다.
      </Tab>
    </Tabs>
  </Step>

  <Step title="소규모 배치로 확인합니다">
    동시 실행 수 5\~10으로 수십 개의 요청을 실행합니다. 빈 502 오류가 사라지면 프록시가 원인이었습니다. APIYI는 직접 연결할 수 있으며 프록시가 필요하지 않습니다. [API를 사용하려면 프록시가 필요한가요?](/ko/faq/network-proxy)를 참조하십시오.
  </Step>
</Steps>

<Note>
  `http://api.apiyi.com:16888`은 이미지 워크로드의 지연 시간을 줄이는 공식 제공 일반 HTTP 엔드포인트입니다([이미지 API 지연 시간을 줄이려면 어떻게 해야 하나요?](/ko/faq/image-api-network-latency-optimization) 참조). **계속 사용할 수 있습니다**. 단, 위에 설명한 대로 프록시를 우회해야 합니다.
</Note>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="실패한 이 요청에도 과금되나요?">
    프록시가 실패한 시점에 따라 다릅니다:

    * 프록시가 **요청이 APIYI에 도달하기 전에** 실패했다면 APIYI는 요청을 수신하지 않았으므로 과금되거나 호출 로그가 기록되지 않습니다.
    * 요청이 전송된 **후 결과를 기다리는 동안** 프록시가 연결을 끊었다면, APIYI는 이미 이미지를 생성 중일 수 있으며 일반적으로 과금되지만 결과는 스크립트에 도달하지 않습니다.

    따라서 스크립트의 오류 출력만으로 판단하지 마십시오. [호출 로그](/ko/faq/call-logs)에서 실제 과금된 호출 수를 확인하십시오.
  </Accordion>

  <Accordion title="몇 번 재시도하면 왜 성공하나요?">
    프록시 노드의 일시적인 문제인 경우가 많으므로, 노드가 복구된 후 실행된 재시도는 통과합니다. 하지만 재시도할 때마다 전체 이미지를 다시 업로드하고 대기 시간이 매번 늘어나므로, 배치 작업 전체 시간이 훨씬 길어집니다. 프록시를 우회하는 것이 근본적인 해결책입니다.
  </Accordion>

  <Accordion title="APIYI가 서버 측에서 이 문제를 해결할 수 있나요?">
    아니요. 실패는 사용자 컴퓨터와 APIYI 사이의 프록시에서 발생합니다. 요청이 APIYI에 전혀 도달하지 않거나 프록시가 자체적으로 연결을 닫으므로, 서버에서 할 수 있는 작업이 없습니다.
  </Accordion>

  <Accordion title="프록시를 우회한 후에도 계속 502가 발생합니다. 이제 어떻게 해야 하나요?">
    먼저 헤더를 확인하십시오. 응답에 `Server` 및 `Date`가 포함되고 HTML 또는 JSON 본문이 있다면 플랫폼 측 502입니다. [웹사이트 또는 API에서 502 반환](/ko/faq/website-502-error)을 참조하십시오. 계속 발생하면 실패 시간(시간대 포함, 예: `14:30 (UTC+8)`)과 전체 응답을 지원팀에 보내십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="웹사이트 또는 API에서 502가 반환됩니다. 어떻게 해야 하나요?" icon="refresh-cw" href="/ko/faq/website-502-error">
    플랫폼 측 502: 일시적인 컨테이너 재시작이며, 약 1분 내에 복구됩니다.
  </Card>

  <Card title="API를 사용하려면 프록시가 필요한가요?" icon="wifi" href="/ko/faq/network-proxy">
    직접 연결로 작동하며, 프록시나 VPN이 필요하지 않습니다.
  </Card>

  <Card title="이미지 API 지연 시간을 어떻게 줄일 수 있나요?" icon="gauge" href="/ko/faq/image-api-network-latency-optimization">
    HTTP 엔드포인트, 연결 재사용 및 타임아웃 설정
  </Card>

  <Card title="API 타임아웃을 어떻게 방지하나요?" icon="timer" href="/ko/faq/timeout-configuration">
    타임아웃 설정 및 계층별 문제 해결
  </Card>
</CardGroup>
