> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 API 지연 시간을 어떻게 줄일 수 있습니까?

> 대량 이미지 생성을 위한 네트워크 최적화 가이드입니다. HTTP 엔드포인트, HTTP/1.1, 연결 재사용, 타임아웃 설정을 포함합니다.

## 간단한 답변

매월 매우 많은 이미지를 생성하고 API 응답 지연 시간을 360ms 미만으로 유지하려는 경우, 다른 경로로 전환해도 대부분의 대체 노드가 해외에 호스팅되어 추가 네트워크 지연이 발생할 수 있으므로 개선 효과는 제한적일 수 있습니다.

먼저, 원래 루트 URL을 다음과 같이 바꿔서 테스트하십시오:

```text theme={null}
https://api.apiyi.com
```

다음 HTTP 엔드포인트를 사용하십시오:

```text theme={null}
http://api.apiyi.com:16888
```

요청 경로는 변경하지 마십시오. 예를 들어, `https://api.apiyi.com/v1/images/generations`를 `http://api.apiyi.com:16888/v1/images/generations`로 바꾸십시오.

<Warning>
  HTTP는 TLS 암호화를 제공하지 않습니다. API 키와 요청 내용은 평문으로 전송됩니다. 이 엔드포인트는 신뢰할 수 있는 네트워크에서만, 또는 올바르게 구성된 사설 회선이나 터널을 통해서만 사용하십시오. 공용 네트워크에서 직접 호출하지 마십시오.
</Warning>

## 클라이언트 최적화

일부 API 게이트웨이는 지속 연결 또는 스트리밍 연결 중에 HTTP/2 동작이 불안정하여 전송이 중단되거나 추가 재시도가 발생할 수 있습니다. 커스텀 HTTP 클라이언트를 다음과 같이 구성하십시오.

* **HTTP/1.1**을 강제하고 HTTP/2를 비활성화합니다
* 연결 풀링과 Keep-Alive를 활성화하여 요청마다 새 연결을 생성하지 않도록 합니다
* 500ms의 전체 타임아웃을 사용하는 대신, 일반적인 이미지 생성 시간을 포괄하도록 읽기 타임아웃을 늘립니다
* 간헐적인 네트워크 실패는 백오프로 제한된 횟수만큼 재시도합니다

<Info>
  **500ms는 네트워크 오버헤드 또는 작업 제출을 위한 목표값으로 간주하고, 보장된 이미지 완료 시간으로 간주하지 마십시오.** 실제 지연 시간은 클라이언트 위치, ISP 라우팅, 동시 실행 수, 선택한 이미지 모델, 상위 처리에도 영향을 받습니다. 운영 환경과 유사한 동시 실행 수에서 테스트를 실행하고, 배포 전에 P95 및 P99 지연 시간을 평가하십시오.
</Info>

## 권장 문제 해결 순서

<Steps>
  <Step title="HTTP 엔드포인트로 전환">
    루트 URL을 `http://api.apiyi.com:16888`로 바꾸고 기존 API 경로와 인증 방식은 그대로 유지합니다.
  </Step>

  <Step title="HTTP/2 비활성화">
    클라이언트에서 HTTP/1.1을 강제하고 연결 재사용을 활성화합니다.
  </Step>

  <Step title="타임아웃 및 재시도 조정">
    연결 타임아웃과 읽기 타임아웃을 각각 따로 설정합니다. 읽기 타임아웃은 일반적인 이미지 처리 시간을 충분히 포함해야 합니다.
  </Step>

  <Step title="동시 실행 수 테스트 실행">
    프로덕션과 유사한 동시 실행 수로 테스트하고 P50, P95, P99 지연 시간과 실패율을 모니터링합니다.
  </Step>
</Steps>

## 관련 문서

* [API를 사용하려면 프록시가 필요합니까?](/ko/faq/network-proxy)
* [API 매뉴얼](/ko/api-manual)
