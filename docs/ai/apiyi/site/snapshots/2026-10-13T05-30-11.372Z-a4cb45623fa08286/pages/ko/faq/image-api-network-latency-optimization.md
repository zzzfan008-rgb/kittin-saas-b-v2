> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 API 지연 시간을 어떻게 줄일 수 있습니까?

> 대량 이미지 생성을 위한 네트워크 최적화 지침으로, 클라이언트 프로토콜 버전, 연결 재사용 및 타임아웃 설정을 포함합니다.

## 요약 답변

매월 매우 많은 양의 이미지를 생성하며 API 응답 지연 시간을 360ms 미만으로 낮추려는 경우, 대부분의 대체 노드가 해외에 호스팅되어 추가 네트워크 지연이 발생할 수 있으므로 다른 경로로 전환하더라도 개선 효과는 제한적일 수 있습니다.

클라이언트 측에서 최적화하고 기본 주소를 유지하십시오:

```text theme={null}
https://api.apiyi.com
```

먼저 클라이언트가 실제로 사용하는 프로토콜 버전을 확인한 다음, 필요에 따라 연결 재사용, 타임아웃 및 재시도를 조정하십시오. **HTTP/1.1을 사용하기 위해 `http://`(으)로 전환할 필요는 없습니다**: http/https는 암호화를 제어하는 반면, HTTP/1.1과 HTTP/2는 별개의 문제입니다. [http와 HTTP/1.1은 같은가요?](/ko/faq/http-vs-http11)를 참조하십시오.

## 클라이언트 최적화

* **프로토콜 버전 확인**: Python(requests, httpx, OpenAI SDK)은 기본적으로 HTTP/1.1을 사용하므로 변경할 필요가 없습니다. Go, Java, OkHttp 및 Node 26 이상의 내장 fetch는 기본적으로 **HTTP/2**를 사용합니다. 높은 동시 실행 수로 이미지를 업로드할 때 HTTP/2는 모든 요청을 하나의 연결로 묶으므로, https 주소는 유지하면서 이러한 클라이언트 코드에서 HTTP/1.1을 강제 적용하십시오.
* 매 요청마다 새 연결을 생성하지 않도록 연결 풀링과 Keep-Alive를 활성화하십시오.
* 500ms의 전체 타임아웃을 사용하는 대신 일반적인 이미지 생성 시간을 고려하여 읽기 타임아웃을 늘리십시오.
* 간헐적인 네트워크 오류는 백오프를 적용하여 제한된 횟수로 재시도하십시오.

<Info>
  **500ms는 네트워크 오버헤드나 작업 제출을 위한 목표치로 간주해야 하며, 이미지 완료가 보장되는 시간이 아닙니다.** 실제 지연 시간은 클라이언트 위치, ISP 라우팅, 동시 실행 수, 선택한 이미지 모델, 업스트림 처리에 따라서도 달라집니다. 프로덕션과 유사한 동시 실행 수에서 테스트를 진행하고 롤아웃 전에 P95 및 P99 지연 시간을 평가하십시오.
</Info>

## 권장 문제 해결 순서

<Steps>
  <Step title="프로토콜 버전 확인">
    `curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models -H "Authorization: Bearer YOUR_API_KEY"`을 실행하거나 클라이언트 문서를 확인하여 HTTP/1.1 또는 HTTP/2 사용 여부를 확인하십시오.
  </Step>

  <Step title="필요 시 HTTP/2 비활성화">
    기본적으로 HTTP/2를 사용하는 클라이언트(Go, Java 등)에만 이 단계가 필요합니다. 클라이언트에서 HTTP/1.1을 강제 적용하고 연결 재사용을 활성화하십시오. Go 프로그램은 단순히 환경 변수 `GODEBUG=http2client=0`을 설정하면 됩니다.
  </Step>

  <Step title="타임아웃 및 재시도 조정">
    연결 타임아웃과 읽기 타임아웃을 별도로 구성하십시오. 읽기 타임아웃은 일반적인 이미지 처리 시간을 수용할 수 있어야 합니다.
  </Step>

  <Step title="동시 실행 수 테스트 실행">
    운영 환경과 유사한 동시 실행 수로 테스트하고 P50, P95, P99 지연 시간 및 실패율을 모니터링하십시오.
  </Step>
</Steps>

## 16888 포트의 평문 엔드포인트 안내

`http://api.apiyi.com:16888`는 https와 동일한 요청 경로를 사용하는 공식 제공 평문 엔드포인트입니다. 이미지 생성이 더 빨라지지는 않습니다. 이미 HTTP/1.1을 사용 중인 클라이언트의 경우 TLS 핸드셰이크를 한 번 줄여줄 뿐입니다. HTTPS 핸드셰이크 자체가 실패할 때의 임시 해결책으로만 사용하거나, 신뢰할 수 있는 내부 네트워크 또는 전용선 내부에서만 사용하십시오.

<Warning>
  HTTP는 TLS 암호화를 제공하지 않습니다. API 키와 요청 내용이 평문으로 전송됩니다. 이 엔드포인트는 신뢰할 수 있는 네트워크나 올바르게 구성된 전용선 또는 터널을 통해서만 사용하십시오. 공용 네트워크를 통해 직접 호출하지 마십시오.
</Warning>

## 관련 문서

* [http는 HTTP/1.1과 동일합니까?](/ko/faq/http-vs-http11)
* [API를 사용하려면 프록시가 필요합니까?](/ko/faq/network-proxy)
* [API 매뉴얼](/ko/api-manual)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.