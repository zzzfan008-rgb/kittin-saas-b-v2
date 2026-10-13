> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# http는 HTTP/1.1과 같습니까?

> http/https는 암호화를 제어하고, HTTP/1.1과 HTTP/2는 연결이 요청을 전송하는 방식을 제어합니다. 둘은 서로 다른 개념입니다. 대부분의 사용자는 단순히 https://api.apiyi.com을 사용하시면 됩니다.

## 간단한 답변

**아닙니다.** `http://`와 `https://`는 **트래픽 암호화 여부**를 결정합니다. HTTP/1.1과 HTTP/2는 **프로토콜 버전**이며, 연결을 통해 요청이 전송되는 방식을 결정합니다. 두 가지의 어떤 조합도 가능합니다.

거의 모든 사용자는 아무것도 변경하지 않고 이 주소를 그대로 사용하시면 됩니다:

```text theme={null}
https://api.apiyi.com
```

## 두 가지 서로 다른 차원

| 차원 | 결정하는 내용 | 값 |
| - | - | - |
| `http://` 또는 `https://` | 트래픽 암호화 여부 (TLS 적용 여부) | 일반 텍스트 / 암호화 |
| HTTP/1.1 또는 HTTP/2 | 하나의 연결을 통해 요청이 전송되는 방식 | HTTP/1.1: 연결당 한 번에 하나의 요청을 처리하므로 동시 실행 수는 더 많은 연결을 의미합니다<br />HTTP/2: 여러 요청이 하나의 연결을 공유합니다 (다중화) |

프로토콜 버전은 **연결이 설정될 때 클라이언트와 서버 간의 협상을 통해 결정됩니다**. 이는 URL 작성 방식에 의해 결정되지 않습니다. APIYI의 `https://` 엔드포인트는 HTTP/1.1과 HTTP/2를 모두 지원하며, 클라이언트가 지원하는 프로토콜을 사용합니다.

따라서 "http는 HTTP/1.1을 의미하고 https는 HTTP/2를 의미한다"는 일반적인 인식은 오해입니다:

* `http://` 주소의 경우, 주류 클라이언트는 거의 항상 HTTP/1.1을 사용하지만 이는 결과적인 우연에 불과합니다
* `https://` 주소의 경우, 클라이언트 자체에 따라 일부 클라이언트는 HTTP/1.1을 사용하고 다른 클라이언트는 HTTP/2를 사용합니다

## 주요 클라이언트의 기본 버전(https 기준)

| 클라이언트 | 기본 버전 |
| - | - |
| Python `requests`, `httpx`, OpenAI Python SDK | HTTP/1.1 |
| Node.js `axios` | HTTP/1.1 |
| Node.js 내장 `fetch`, OpenAI Node SDK | Node 25 이하: HTTP/1.1; **Node 26 이상에서는 기본적으로 HTTP/2 협상** |
| Go 표준 라이브러리 `net/http`(new-api 및 one-api 등의 게이트웨이에서 사용) | HTTP/2 |
| Java `HttpClient`, OkHttp | HTTP/2 |
| curl, 브라우저 | HTTP/2 |

실제로 사용하는 버전을 확인하려면 curl을 실행하십시오:

```bash theme={null}
curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
# 2 means HTTP/2, 1.1 means HTTP/1.1
```

## 어떤 주소를 사용해야 합니까?

<Steps>
  <Step title="일반 사용자: https를 사용하고 아무것도 변경하지 마십시오">
    API를 직접 호출하는 개인 및 기업은 `https://api.apiyi.com`을(를) 사용해야 합니다. Python, Node 및 기타 언어용 일반 SDK는 프로토콜 조정이 필요 없이 있는 그대로 잘 작동합니다.
  </Step>

  <Step title="높은 동시 실행 수로 이미지를 업로드하는 Go / Java 클라이언트: https를 유지하고 클라이언트에서 HTTP/2를 비활성화하십시오">
    HTTP/2는 단일 연결에서 여러 동시 요청을 처리합니다. 수 MB 크기의 이미지를 업로드할 때 해당 연결에서 지연이 한 번만 발생해도 그 연결의 모든 요청이 느려집니다. 클라이언트의 기본값이 HTTP/2이고 높은 동시 실행 수로 이미지 생성 또는 편집을 실행하는 경우, 클라이언트를 HTTP/1.1로 전환하십시오. **https 주소를 유지하십시오. http로 전환할 필요는 없습니다.**
  </Step>

  <Step title="http://api.apiyi.com:16888: 대체용으로만 사용">
    이는 공식적으로 제공되는 평문 엔드포인트입니다. HTTPS 핸드셰이크 자체가 실패할 때 임시 해결 방법으로만 사용하거나(예: [Python에서 SSLEOFError가 발생하지만 curl은 작동합니까?](/ko/faq/openssl-pq-handshake-eof)), 신뢰할 수 있는 내부 네트워크 또는 전용선 내부에서만 사용하십시오.
  </Step>
</Steps>

<Warning>
  `http://`은(는) 암호화되지 않습니다. API 키, prompts 및 이미지가 공용 네트워크를 평문으로 통과하므로 경로상의 모든 네트워크 장치에 노출됩니다. 평문 엔드포인트를 장기적인 프로덕션 설정으로 의존하지 마십시오.
</Warning>

### Go 클라이언트를 HTTP/1.1로 전환하는 방법

코드 수정이 필요 없는 방법은 프로세스에 환경 변수를 설정하는 것입니다. 이는 new-api 및 one-api와 같은 기성 게이트웨이 프로그램에 적합합니다:

```bash theme={null}
GODEBUG=http2client=0
```

직접 작성한 코드에서는 `Transport.TLSNextProto`을(를) nil이 아닌 빈 맵으로 설정하십시오:

```go theme={null}
import (
    "crypto/tls"
    "net/http"
)

tr := &http.Transport{
    // A non-nil empty map disables HTTP/2, so https requests use HTTP/1.1
    TLSNextProto:        map[string]func(string, *tls.Conn) http.RoundTripper{},
    MaxIdleConnsPerHost: 100,
}
client := &http.Client{Transport: tr}
```

## 흔히 하는 오해

<AccordionGroup>
  <Accordion title="http://가 더 빠릅니까?">
    Python 및 Node와 같이 이미 HTTP/1.1을 사용하는 클라이언트의 경우, http로 전환해도 단 한 번의 TLS 핸드셰이크(1초 미만)만 절약됩니다. 이는 수십 초에 달하는 이미지 생성 시간에 비하면 무시할 수 있는 수준이며, 암호화 보호를 잃게 됩니다.
  </Accordion>

  <Accordion title="HTTP/2를 끄려면 http://로 전환해야 합니까?">
    아닙니다. HTTP/2는 클라이언트에서 비활성화할 수 있습니다. 위의 Go 예제를 참조하십시오. 다른 언어에도 유사한 설정 옵션이 있습니다. 그 후 `https://api.apiyi.com`을 계속 사용하시면 암호화가 적용된 HTTP/1.1을 이용하실 수 있습니다.
  </Accordion>

  <Accordion title="HTTP/2는 좋지 않습니까?">
    아닙니다. 요청 크기가 작고 빈번한 브라우저 및 일반 텍스트 대화의 경우, HTTP/2 연결 재사용이 리소스를 절약해 줍니다. 단일 다중화 연결은 높은 동시 실행 수와 대용량 요청 또는 응답 본문이 결합될 때만 병목 현상을 일으킵니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Base URL은 어떻게 설정합니까?](/ko/faq/base-url-config)
* [이미지 API 지연 시간은 어떻게 줄일 수 있습니까?](/ko/faq/image-api-network-latency-optimization)
* [Python에서는 SSLEOFError가 발생하지만 curl은 정상 작동합니까?](/ko/faq/openssl-pq-handshake-eof)
* [스크립트에서 502 오류가 발생하지만 호출 로그에는 아무것도 없습니까?](/ko/faq/proxy-empty-502)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.