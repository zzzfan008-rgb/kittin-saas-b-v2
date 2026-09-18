> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Python에서 SSLEOFError가 발생하지만 curl은 작동하는 이유

> OpenSSL 3.5 이상에서는 포스트퀀텀 키 교환이 기본적으로 활성화됩니다. 더 커진 핸드셰이크가 일부 네트워크 미들박스에 의해 중단되어 UNEXPECTED_EOF_WHILE_READING이 발생합니다

## 증상

같은 머신에서 `api.apiyi.com`에 대한 `curl`는 정상적으로 작동하지만, Python 프로그램(특히 Conda 환경에서는)은 다음 오류와 함께 실패합니다.

```text theme={null}
ssl.SSLEOFError: [SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol (_ssl.c:1016)
urllib3.exceptions.MaxRetryError: HTTPSConnectionPool(host='api.apiyi.com', port=443): Max retries exceeded
```

때때로 포트 443에서의 연결 시간 초과 또는 핸드셰이크 중 연결 끊김으로 나타납니다. VPN은 사용하지 않으며, 네트워크를 전환하면(예: 휴대폰 핫스팟으로) 다시 정상 작동합니다.

## 간단한 답변

**이 문제는 APIYI 서버 측 이슈도 아니고 인증서 이슈도 아닙니다. 사용 중인 OpenSSL 버전이 네트워크상의 미들박스와 호환되지 않습니다.**

양쪽의 OpenSSL 버전을 비교하세요:

```bash theme={null}
curl --version | head -1          # e.g. OpenSSL/3.0.2
python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # e.g. OpenSSL 3.6.2
```

실패하는 쪽이 **OpenSSL 3.5 이상**이고 정상 작동하는 쪽이 3.5 미만이라면, 이것이 원인일 가능성이 거의 확실합니다.

## 발생 원인

OpenSSL 3.5부터 TLS 핸드셰이크에는 기본적으로 포스트퀀텀 키 교환(X25519MLKEM768)이 포함됩니다. 이로 인해 첫 번째 핸드셰이크 메시지(ClientHello)가 약 300바이트에서 약 1500바이트로 커지며, 단일 TCP 세그먼트보다 커지므로 두 개의 세그먼트로 분할되어야 합니다.

일부 기업 방화벽, TLS 검사 어플라이언스 및 ISP 측 심층 패킷 검사 장치는 분할된 ClientHello를 처리하지 못하거나 새로운 키 교환 알고리즘을 인식하지 못해 연결을 그대로 종료합니다. 클라이언트에는 ‘EOF occurred in violation of protocol’이 표시됩니다.

모든 APIYI 엣지 노드는 이 포스트퀀텀 핸드셰이크를 지원합니다. 2026-09-11 (UTC+8)에 OpenSSL 3.6.4를 사용하여 각 노드를 확인했으며, 모두 테스트를 통과했습니다. 핸드셰이크 패킷은 당사에 도달하기 전에 고객님의 네트워크 내부에서 삭제되고 있으므로, 서버 측에서는 이를 해결할 수 없습니다.

## 확인을 위한 세 가지 명령

**실패하는 환경**의 `openssl` 바이너리로 다음을 실행하십시오(먼저 Conda 환경을 활성화하십시오):

```bash theme={null}
# 1. Default settings, with post-quantum key exchange
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com </dev/null | grep -E "Negotiated|Verify"

# 2. X25519 only, no post-quantum key exchange
openssl s_client -connect api.apiyi.com:443 -servername api.apiyi.com -groups X25519 </dev/null | grep Verify

# 3. Default handshake against any other HTTPS site
openssl s_client -connect www.google.com:443 -servername www.google.com </dev/null | grep Verify
```

| 결과            | 진단                                                            |
| ------------- | ------------------------------------------------------------- |
| 1 실패, 2 성공    | 확인됨: 큰 핸드셰이크가 네트워크에 의해 차단되고 있습니다. 아래에 설명된 대로 클라이언트 측에서 수정하십시오 |
| 1과 3 모두 실패    | 네트워크가 모든 포스트 양자 핸드셰이크를 차단합니다. 동일한 클라이언트 측 수정이 필요합니다           |
| 1, 2, 3 모두 성공 | 다른 문제입니다. 전체 오류와 `pip show urllib3 requests`의 출력을 지원팀에 보내십시오  |

## 수정 방법(하나 선택)

<Steps>
  <Step title="옵션 1: 구성 파일을 통해 양자 내성 키 교환 비활성화(권장)">
    예를 들어 다음과 같이 파일을 생성합니다 `~/no-pq.cnf`:

    ```ini theme={null}
    openssl_conf = openssl_init
    [openssl_init]
    ssl_conf = ssl_sect
    [ssl_sect]
    system_default = system_default_sect
    [system_default_sect]
    Groups = X25519:P-256:P-384
    ```

    프로그램을 실행하기 전에 환경 변수를 설정합니다:

    ```bash theme={null}
    export OPENSSL_CONF=~/no-pq.cnf
    python your_script.py
    ```

    해당 환경의 모든 OpenSSL 기반 프로그램(Python, curl, pip 등)은 양자 내성 키 공유 전송을 중지하며, ClientHello는 약 300바이트로 다시 줄어듭니다. 암호화 강도는 변경되지 않습니다. 이는 단순히 3.5 이전의 기본 동작을 복원합니다.
  </Step>

  <Step title="옵션 2: Conda에서 OpenSSL 다운그레이드">
    ```bash theme={null}
    conda install "openssl<3.5"
    ```

    3.5 이전 버전에서는 기본적으로 양자 내성 키 교환을 활성화하지 않습니다. 이 변경으로 OpenSSL에 의존하는 패키지도 조정될 수 있으므로, 먼저 스테이징 환경에서 테스트하십시오.
  </Step>

  <Step title="옵션 3: 네트워크 팀에 미들박스 업데이트 요청">
    주류 방화벽과 TLS 검사 어플라이언스는 2025년 이후에 출시된 펌웨어에서 하이브리드 양자 내성 핸드셰이크를 지원합니다. 이는 영구적인 해결 방법이며 다른 사이트에서 동일한 오류가 발생하는 것도 방지합니다.
  </Step>
</Steps>

## 후속 질문

<AccordionGroup>
  <Accordion title="브라우저에서는 api.apiyi.com이 열리는데 프로그램에서는 왜 접속할 수 없나요?">
    브라우저와 프로그램이 동일한 네트워크 경로를 사용하지 않을 수 있으며(브라우저는 시스템 프록시를 사용할 수 있음), 브라우저는 포스트 양자 공유가 실패하면 자동으로 이를 제외하고 핸드셰이크를 재시도합니다. 프로그램은 그렇지 않습니다.
  </Accordion>

  <Accordion title="Node.js, Go 또는 Java에서도 이런 문제가 발생할 수 있나요?">
    최신 OpenSSL을 기반으로 빌드된 curl 8.x를 포함하여, TLS 라이브러리가 OpenSSL 3.5 이상인 모든 클라이언트에서 발생할 수 있습니다. Go와 Java는 자체 TLS 스택을 사용하며, 포스트 양자 교환이 기본적으로 활성화되는지는 버전에 따라 다릅니다. 진단 방법은 동일합니다. 위의 세 가지 명령을 사용하여 기본 핸드셰이크만 실패하는지 확인하십시오.
  </Accordion>

  <Accordion title="IP로 연결하거나 verify=False를 설정하면 도움이 되나요?">
    아니요. 인증서 검증이 시작되기도 전인 핸드셰이크 중에 연결이 종료됩니다. 검증을 비활성화해도 문제가 해결되지 않으며 보안 위험만 추가됩니다.
  </Accordion>

  <Accordion title="APIYI가 서버에서 포스트 양자 핸드셰이크를 비활성화할 수 있나요?">
    첫 번째 핸드셰이크 메시지는 클라이언트가 전송합니다. 네트워크 내부에서 이 메시지가 드롭되면 서버는 이를 받지 못하므로 서버 설정으로는 해결할 수 없습니다. 세 가지 명령의 결과에서 기본 핸드셰이크는 다른 사이트에서는 성공하지만 api.apiyi.com에서만 실패하는 것으로 나타나면, 결과를 보내 주시면 추가로 조사하겠습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="API 사용에 프록시가 필요합니까?" icon="wifi" href="/ko/faq/network-proxy">
    APIYI는 프록시 또는 VPN 없이 직접 연결을 지원합니다
  </Card>

  <Card title="타임아웃 구성" icon="clock" href="/ko/faq/timeout-configuration">
    연결 및 읽기 타임아웃 설정 방법
  </Card>
</CardGroup>
