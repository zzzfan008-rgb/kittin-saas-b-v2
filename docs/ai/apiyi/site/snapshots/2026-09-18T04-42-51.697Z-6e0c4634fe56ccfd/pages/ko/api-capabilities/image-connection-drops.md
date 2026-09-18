> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image API 연결 끊김 문제 해결

> connection reset by peer, write_response_body_failed, SSL EOF를 어떻게 문제 해결하는지 설명합니다. 500 write_response_body_failed는 절대 과금되지 않습니다. macOS와 Linux 서버에서 각각 무엇을 확인해야 하는지, undici의 세 가지 Node.js 타임아웃, 그리고 로컬 프록시 진단 매트릭스를 다룹니다.

<Warning>
  ### 과금 우선: `write_response_body_failed` 500은 **과금되지 않습니다**

  게이트웨이가 `500`를 `write_response_body_failed` / `connection reset by peer`와 함께 반환하면, 플랫폼은 **이미 내부적으로 2-3회 재시도한 뒤** 모두 실패했을 때만 오류를 표시합니다. **이 요청에는 전혀 과금되지 않습니다.**

  따라서 로그가 이러한 오류로 가득 차더라도 **청구서에 대응하는 과금은 나타나지 않습니다** — 실패에 대해 비용을 지불하는 것이 아닙니다. 다른 경우는 *과금됩니다* (클라이언트가 너무 일찍 종료하는 경우)이며, 아래의 “Billing 영향” 섹션을 보십시오.
</Warning>

<Info>
  **짧은 답변**: image API 응답은 일반적으로 10MB에서 수십 MB까지이며, 끊김은 거의 항상 **응답을 다운로드하는 동안** 발생합니다(**요청 본문이 너무 커서가 아닙니다** — 일반 텍스트-to-image에서도 끊깁니다). 먼저 콘솔 로그가 어느 범주에 해당하는지 확인한 다음, 아래의 macOS / Linux / Node.js 자체 점검을 실행하십시오.
</Info>

## 오류의 모습

같은 근본 원인이 읽는 쪽에 따라 완전히 다른 두 가지 얼굴로 나타납니다.

### 게이트웨이에서

```json theme={null}
{
  "status_code": 500,
  "error": {
    "message": "write tcp 10.0.0.1:443->203.0.113.5:52310: write: connection reset by peer",
    "type": "shell_api_error",
    "code": "write_response_body_failed"
  }
}
```

### 클라이언트에서

| 언어 / 라이브러리                    | 일반적인 예외                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Python `requests` / `urllib3` | `SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol'))`, `ChunkedEncodingError`, `ConnectionResetError` |
| Python `httpx`                | `RemoteProtocolError`, `ReadError`                                                                                  |
| Node.js (undici / 내장 fetch)   | `UND_ERR_CONNECT_TIMEOUT`, `UND_ERR_HEADERS_TIMEOUT`, `UND_ERR_BODY_TIMEOUT`, `SocketError: other side closed`      |
| Node.js (기타 스택)               | `read ECONNRESET`, `ERR_STREAM_PREMATURE_CLOSE`, `socket hang up`                                                   |
| Go                            | `unexpected EOF`, `http2: server sent GOAWAY`                                                                       |
| curl                          | `curl: (56) Recv failure`, `curl: (18) transfer closed with outstanding read data remaining`                        |

<Tip>
  **Node.js에서는 "killed"와 "closed"를 구분해야 합니다**: `ECONNRESET`은 TCP RST가 도착했다는 뜻입니다. 즉, 경로상의 어떤 지점에서 연결이 **killed**되었고, 네트워크 홉을 가리킵니다. `SocketError: other side closed` / `ERR_STREAM_PREMATURE_CLOSE`는 상대가 **정상적으로** 닫았다는 뜻(FIN)으로, 누락된 chunked terminator 같은 서버 측 마무리 문제를 가리킵니다. 이 둘은 완전히 다른 방향을 가리키므로 하나의 증상으로 취급해서는 안 됩니다.

  또한, `UND_ERR_*`은 undici(Node 18+의 내장 `fetch`를 구동하는 엔진)에서만 나올 수 있는 반면, `read ECONNRESET`은 libuv의 최상위 표현이며, `axios` / `node-fetch` / `http` 모듈이 모두 생성합니다. **두 종류가 함께 나타난다면 먼저 앱에 서로 다른 HTTP 경로가 두 개 있는지 확인하십시오** — 그 경우에는 아예 같은 사고가 아닙니다.
</Tip>

## 먼저 방향을 확인하십시오: 누가 끊었는지

`write_response_body_failed` 코드는 핵심 단서입니다 — 이는 **게이트웨이가 응답 본문을 호출자에게 다시 쓰는 도중 실패했음**을 의미합니다. 이는 업스트림 모델 오류가 아니라 **다운스트림** 방향입니다. 결과는 이미 생성되어 있었고, 사용자에게 전달되는 도중 연결이 끊겼습니다.

<Info>
  **이는 지나치게 큰 요청 본문 때문에 발생한 것이 아닙니다.** 이미지 편집 업로드는 참조 이미지를 전송하므로 업로드 크기를 의심하기 쉽지만, **요청 본문이 몇백 바이트에 불과한 일반 text-to-image도 똑같이 자주 실패합니다**. 문제는 **응답을 내려받는 과정**에 있습니다. 이미지 payload는 10MB에서 수십 MB까지 이르며, 전체 경로에서 가장 취약한 구간입니다.
</Info>

<CardGroup cols={2}>
  <Card title="다운스트림 끊김" icon="arrow-down-from-line">
    `write_response_body_failed`, `connection reset by peer`, 클라이언트 측 SSL EOF.
    게이트웨이가 본문을 전송하던 중 연결이 사라졌습니다. **플랫폼이 이에 대해 500을 반환하더라도 과금되지 않습니다** — 아래의 billing 섹션을 참조하십시오.
  </Card>

  <Card title="업스트림 실패(채널 측)" icon="arrow-up-from-line">
    업스트림 타임아웃, `upstream_error`, 업스트림 payload를 담은 5xx, 또는 비정상적인 `finishReason`를 동반한 HTTP 200.
    이는 진짜 채널 문제입니다 — `x-request-id`를 지원팀에 전달하십시오.
  </Card>
</CardGroup>

### 가장 강한 신호: 콘솔 로그가 이 호출에 대해 말해 주는 것

다른 무엇보다 먼저 콘솔의 호출 로그를 확인하십시오. 비용이 들지 않으며, 어떤 클라이언트 측 단계보다 빠르게 범위를 좁혀 줍니다:

| 로그에 보이는 내용                           | 의미                                             | 과금됨?        | 다음 단계                                                      |
| ------------------------------------ | ---------------------------------------------- | ----------- | ---------------------------------------------------------- |
| **정상적인 호출 기록**                       | 요청이 도착했고, 업스트림이 완료되었으며, 게이트웨이가 전달 완료로 판단함      | 과금됨         | 아래의 네 단계를 따라가며 애플리케이션 계층의 오독과 이른 클라이언트 연결 종료를 중심으로 확인하십시오  |
| **500 `write_response_body_failed`** | 게이트웨이가 **내부 재시도 2-3회** 후 본문을 사용자에게 다시 쓰는 데 실패함 | **과금되지 않음** | 다운스트림 경로 문제입니다 — request-id를 지원팀에 보내십시오                    |
| **아예 기록 없음**                         | 요청이 **사용자 머신을 떠나지 않았음**                        | 과금되지 않음     | 연결 단계입니다 — 아래의 "Node.js 타임아웃" 및 "로컬 프록시 / VPN" 섹션으로 이동하십시오 |

<Warning>
  여기서 사람들이 자주 거꾸로 이해하는 결론이 나옵니다: **`UND_ERR_CONNECT_TIMEOUT` 같은 연결 단계 실패는 과금을 발생시킬 수 없습니다**, 요청이 게이트웨이까지 도달하지 않았기 때문입니다. 따라서 "연결 타임아웃이 많이 발생한다"와 "과금이 많이 발생한다"가 동시에 보인다면, **그것들은 절대 같은 요청이 아닙니다** — 하나의 근본 원인으로 모두 설명하려 하지 말고 별도로 조사하십시오.
</Warning>

### 자신을 배제하는 네 단계

순서대로 확인하십시오. 대부분의 경우 처음 두 단계에서 해결됩니다:

<Steps>
  <Step title="애플리케이션 계층의 오독을 배제하십시오: 실제로 받았지만 유지하지 못했을 수 있습니다">
    "이미지를 받지 못했다"는 보통 코드가 예외를 던지고 "request failed"로 잡힌 뒤 내린 결론입니다 — 바이트가 전혀 도착하지 않았다는 증거가 아닙니다. 가장 흔한 사례는 `gpt-image-2-all`가 기본적으로 `b64_json`를 반환하면서 **`data:` 접두사가 없다는 점**입니다. 그래서 `data[0].url`를 읽는 코드가 `undefined`를 얻고, downstream에서 예외를 던지며, 실패로 판정되고, 재시도가 발생합니다 — **그 과정에서 다시 과금됩니다**.

    증상은 네트워크 장애와 동일하지만, 네트워크 장애가 실제로 필요한 것은 아닙니다. 한 줄만 출력해서 확인하십시오:

    ```javascript theme={null}
    console.log(Object.keys(resp.data[0]), resp.data[0].b64_json?.length);
    ```

    시리즈별 필드와 접두사 차이는 [base64 접두사 참고](/ko/api-capabilities/image-api-best-practices#prefix-differences)에 있습니다.
  </Step>

  <Step title="모든 채널과 모델이 동시에 실패하는지 확인하십시오">
    서로 다른 두 채널에서 서로 다른 두 모델을 실행했는데 같은 시간대에 모두 같은 오류를 낸다면, 채널별 원인은 사실상 배제됩니다 — 업스트림이 그렇게 깔끔하게 동시에 실패하지는 않습니다.
  </Step>

  <Step title="클라이언트 런타임을 확인하십시오: TLS 스택(Python) 또는 undici 타임아웃(Node.js)">
    Python: TLS 스택 버전을 확인하십시오. Node.js: undici의 세 가지 타임아웃을 확인하십시오. 두 내용은 다음 두 섹션에서 다룹니다. 실무에서 가장 흔한 근본 원인이며, 완전히 사용자 머신 안에 있고, 한 번의 명령으로 확인됩니다.
  </Step>

  <Step title="동시 실행 수를 낮추고, 순차 실행으로 전환하고, 로컬 프록시를 끄십시오">
    VPN 또는 프록시를 끈 상태에서 동일한 요청을 동시 실행 수 1-2로 다시 실행하십시오. 그렇게 했을 때는 절대 재현되지 않는다면, 문제는 채널이 아니라 클라이언트의 연결 처리, 로컬 리소스(연결 풀, 파일 디스크립터, 메모리), 또는 네트워크 경로에 있습니다.
  </Step>
</Steps>

## 가장 유력한 용의자: 클라이언트 TLS 스택(특히 macOS에서)

**macOS에 포함된 Python(`/usr/bin/python3`)은 LibreSSL 2.8.3에 링크되며**, OpenSSL은 아닙니다. urllib3 v2와 결합되면, 그 조합은 **대용량 응답 본문의 동시 다운로드** 중에 `SSLEOFError`를 안정적으로 발생시킵니다. 클라이언트가 일방적으로 연결을 끊고, 게이트웨이는 이에 따라 `connection reset by peer`를 대량으로 기록합니다.

### 확인할 명령 하나

```bash theme={null}
python3 -c "import ssl; print(ssl.OPENSSL_VERSION)"
```

| Output              | Verdict                                   |
| ------------------- | ----------------------------------------- |
| `LibreSSL 2.8.3`    | ⚠️ **고위험** — 동시 대용량 응답에서 유령 연결 오류를 발생시킵니다 |
| `OpenSSL 1.1.1x` 이상 | ✅ 문제 없음                                   |

`requests`을 import할 때 이 경고가 보인다면 같은 신호입니다:

```
NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+,
currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'
```

### 해결: 인터프리터를 전환하십시오

urllib3를 내리지 마십시오 — 대신 올바른 OpenSSL로 빌드된 Python을 사용하십시오:

```bash theme={null}
# macOS: build a virtualenv on Homebrew's Python
brew install python@3.13
python3.13 -m venv venv
venv/bin/pip install requests pillow
venv/bin/python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # should print OpenSSL 3.x
```

### 측정 비교 (2026-07-29, UTC+8)

두 채널 비교 테스트에서 얻은 실제 수치입니다. Nano Banana 시리즈(`gemini-3-pro-image` / `gemini-3.1-flash-image`) 기준입니다:

| 인터프리터                               | 시나리오                                                       | 전송 계층 실패율                                       |
| ----------------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| System python3.9 (LibreSSL 2.8.3)   | 동시 실행 수 12에서의 이미지 호출                                       | **양쪽 채널에서 동시에 광범위한 실패 발생**                      |
| Homebrew python3.13 (OpenSSL 3.6.1) | 동일한 108회 호출                                                | 3회(2.8%), 모두 4K 대용량 응답에서 발생, **모두 한 번 재시도에 성공** |
| Homebrew python3.13 (OpenSSL 3.6.1) | 재현 전용 호출 80회(동시 실행 수 24의 소형 응답, 동시 실행 수 12의 4K, 그리고 4K 직렬) | **0**                                           |

결론은 명확합니다: **인터프리터를 바꾸면서 한 자릿수 자릿수의 차이가 났고**, 그 이전에 두 채널이 함께 실패했다는 사실만으로도 원인이 채널 문제가 아님이 이미 입증되었습니다.

## 리눅스 서버에서 확인할 것(완전히 다른 목록)

<Info>
  위의 TLS 스택 검사는 **사실상 모든 리눅스 머신에서 통과합니다** — 배포판 Python은 일반 OpenSSL에 링크되므로 그곳에는 LibreSSL 함정이 없습니다. **그 검사에서 멈추면 안 됩니다.** 서버 측 문제는 **egress 경로**와 **컨테이너 제한**에 있으며, 이는 로컬 개발과는 완전히 다른 세계입니다.
</Info>

### 1. 클라우드 NAT 게이트웨이와 로드 밸런서의 유휴 시간 제한(서버 측의 가장 큰 원인)

이는 운영 환경에서 `connection reset by peer`의 가장 큰 원인입니다. **AWS NAT Gateway**를 예로 들면, 이 서비스는 **고정된, 설정 불가능한 350초 유휴 시간 제한**을 강제하며, 시간이 지나면 **FIN이 아니라 RST를 보냅니다** — 따라서 클라이언트가 보는 현상은 정확히 `ECONNRESET`입니다.

문제는 이것이 **연쇄적으로 번진다는 점**입니다. 풀에 있는 연결이 350초를 넘겨 유휴 상태가 되면 모두 죽어버리므로, 요청이 첫 번째 연결에서 RST를 받으면 클라이언트는 다음 풀 연결로 투명하게 재시도합니다 — **그 연결도 똑같이 유휴 상태여서 역시 RST를 받습니다**. 특징은 "한동안 조용하다가, 몇몇 호출이 연달아 실패하고, 그다음에는 다시 모두 정상으로 돌아오는" 패턴입니다.

<Tip>
  이는 Node.js 섹션의 "keep-alive가 죽은 연결을 다시 사용하는" 사례와 같은 메커니즘입니다 — 서버에서는 범인이 보통 로컬 프록시 소프트웨어가 아니라 **클라우드 제공업체의 NAT 게이트웨이**입니다.
</Tip>

해결 방법(아무거나 가능하며, 앞의 두 가지를 권장합니다):

* **TCP keepalive를 350초 미만으로 설정**하여 조용한 구간에도 트래픽이 흐르도록 합니다;
* **연결이 풀에서 유휴 상태로 머무를 수 있는 시간을 제한**하여 죽었을 가능성이 있는 연결을 버리도록 합니다(Node: `new Agent({ keepAliveTimeout: 60_000 })`; Python `requests`: `HTTPAdapter`를 통해 풀을 구성합니다);
* NAT 게이트웨이를 완전히 우회합니다. 예: VPC endpoints를 사용합니다.

다른 클라우드와 자체 호스팅 로드 밸런서는 다른 유휴 값을 사용하지만, **접근 방식은 동일합니다. 경로에서 가장 짧은 유휴 시간 제한을 찾아 keepalive를 그보다 낮게 설정하면 됩니다**.

### 2. TCP keepalive 기본값은 사실상 "꺼짐"입니다

Linux는 `tcp_keepalive_time`을 기본적으로 \*\*7200초(2시간)\*\*로 설정하는데, 이는 위의 어떤 유휴 시간 제한보다도 훨씬 길어서 실제로는 쓸모가 없습니다.

```bash theme={null}
# Inspect current values
sysctl net.ipv4.tcp_keepalive_time net.ipv4.tcp_keepalive_intvl net.ipv4.tcp_keepalive_probes

# Adjust temporarily (inside containers this needs --sysctl or privileges;
# in production prefer sysctl.d or setting SO_KEEPALIVE in the app)
sudo sysctl -w net.ipv4.tcp_keepalive_time=60
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=15
```

HTTP 클라이언트 자체에서 keepalive를 **켜는 방식**이 더 견고한 접근입니다. 컨테이너에서는 커널 매개변수를 바꿀 수 없는 경우가 많기 때문입니다.

### 3. 컨테이너 네트워크 MTU

Docker / Kubernetes 오버레이 네트워크(flannel VXLAN과 그 외 유사한 방식)는 흔히 1500이 아니라 **1450** MTU로 동작합니다. 여기에 경로상의 PMTUD 블랙홀까지 겹치면, 전형적인 "작은 요청은 항상 정상, 큰 응답은 항상 멈춤" 현상이 발생합니다.

```bash theme={null}
ip link show            # inspect the container interface MTU
# Probe the real usable MTU with do-not-fragment packets
ping -M do -s 1400 api.apiyi.com
```

### 4. 컨테이너 메모리 제한 -> 프로세스가 OOMKilled됨

4K base64 페이로드 하나만으로도 20-30MB에 이를 수 있습니다. 이를 `resp.json()`로 통째로 읽고 동시에 여러 요청이 들어오면 컨테이너 메모리 제한을 쉽게 초과하고, 커널이 프로세스를 종료합니다 — **이 역시 "연결이 그냥 끊어졌다"로 보입니다**:

```bash theme={null}
# Was the container OOM-killed?
dmesg -T | grep -i -E "oom|killed process"
kubectl describe pod <pod> | grep -A3 "Last State"   # look for OOMKilled
```

해결 방법은 아래의 "응답을 통째로 읽지 말고 스트리밍하라"를 참고하십시오.

### 5. 프록시 환경 변수(서버에서 가장 교묘한 원인)

서버에는 종종 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` 값이 `/etc/environment`, systemd 유닛, 또는 Dockerfile에 전역으로 설정되어 있습니다 — 누가 설정했는지도 잊힌 채 남아 있는 경우가 많습니다. **더 문제는, 언어마다 이를 존중하는 방식이 다르다는 점입니다**:

| Client                          | `HTTPS_PROXY`를 자동으로 읽습니까?                                 |
| ------------------------------- | --------------------------------------------------------- |
| Python `requests` / `httpx`     | ✅ 예, 기본적으로 그렇습니다                                          |
| curl                            | ✅ 예, 기본적으로 그렇습니다                                          |
| **Node.js 내장 `fetch` (undici)** | ❌ **아니요**, 명시적인 `ProxyAgent` / `EnvHttpProxyAgent`가 필요합니다 |

그 불일치는 정말로 혼란스러운 결과를 만듭니다. **한 머신에서는 curl과 Python이 프록시를 거치는데 Node는 직접 연결되거나, 그 반대가 되기도 해서** 서로 결과가 달라지고, 문제 해결 과정에서 서로 모순되는 결론이 나옵니다. 먼저 확인하십시오:

```bash theme={null}
env | grep -i -E "proxy|no_proxy"
```

APIYI는 직접 접근 가능하므로, 서버에서는 일반적으로 `api.apiyi.com`를 `NO_PROXY`에 두는 것이 좋습니다 — 아니면 아예 프록시 변수를 두지 않아도 됩니다.

### 서버 측 일회성 자가 점검

```bash theme={null}
echo "--- proxy vars ---";  env | grep -i proxy || echo "none"
echo "--- keepalive ---";   sysctl net.ipv4.tcp_keepalive_time
echo "--- MTU ---";         ip link show | grep mtu
echo "--- fd limit ---";    ulimit -n
echo "--- DNS ---";         getent hosts api.apiyi.com
echo "--- reachability and timing ---"
curl -sS -o /dev/null -w 'connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} ip=%{remote_ip}\n' \
  https://api.apiyi.com/v1/models -H "Authorization: Bearer $KEY"
```

## Node.js: SDK의 `timeout`가 닿지 못하는 세 가지 독립적인 타임아웃

Node 18+의 내장 `fetch`는 undici 위에서 동작하며, 요청의 세 단계를 다루는 **세 가지 독립적인 타임아웃**이 있습니다. “timeout을 5분으로 설정했는데요”라는 말은 보통 그 셋 중 어느 것도 아닌 네 번째 값을 바꿨다는 뜻입니다.

| 오류 코드                     | 단계                 | undici 기본값 | 제어 대상             | 과금?                     |
| ------------------------- | ------------------ | ---------- | ----------------- | ----------------------- |
| `UND_ERR_CONNECT_TIMEOUT` | 연결 설정(TCP + TLS)   | **10초**    | `connect.timeout` | **아니요**(게이트웨이에 도달하지 못함) |
| `UND_ERR_HEADERS_TIMEOUT` | 첫 응답 헤더를 기다림       | 300초       | `headersTimeout`  | 예                       |
| `UND_ERR_BODY_TIMEOUT`    | 연속된 body 청크 사이의 간격 | 300초       | `bodyTimeout`     | 예                       |

<Warning>
  openai-node의 `timeout` 옵션은 AbortController 기반의 전체 요청 타임아웃이며 위의 세 가지에는 전파되지 않습니다. `timeout`을 60초에서 300초로 늘려도 `connectTimeout`은 10초로 유지됩니다. 직접 사용하는 `fetch()`에서의 `AbortSignal.timeout()`도 마찬가지입니다.

  “timeout이 엄청 큰데도 여전히 timeout이 난다”는 상황의 가장 흔한 이유는 잘못된 계층을 조정했기 때문입니다.
</Warning>

### 올바른 설정

undici의 세 타임아웃을 늘리려면 전역 또는 요청별 `Agent`가 필요합니다:

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import OpenAI from "openai";

// Image endpoints mean long silences plus MB-scale bodies — widen all three
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },   // connect in 30s; the default is only 10s
  headersTimeout: 300_000,        // first byte within 300s
  bodyTimeout: 300_000,           // inter-chunk gap up to 300s
}));

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: "https://api.apiyi.com/v1",
  timeout: 300_000,   // total timeout — a different layer; set both
  maxRetries: 0,      // critical, see below
});
```

### `maxRetries`는 기본값이 2이며 연결 오류를 자동으로 재시도합니다

openai-node는 **기본적으로 `maxRetries: 2`를 사용하며, 연결 오류와 타임아웃 모두가 해당 자동 재시도 범위에 포함됩니다**. 따라서 하나의 논리적 호출이 코드에 재시도 로직이 전혀 없어도 **실제 요청 세 번**을 만들어낼 수 있습니다(각 요청이 과금되는지는 어떤 “과금 영향” 범주에 속하는지에 따라 달라집니다).

이미지 엔드포인트는 비용이 큰 동기식 장기 요청이므로, **항상 `maxRetries: 0`을 명시적으로 설정하고 재시도 로직도 직접 관리하십시오**, 자체 backoff와 시도 상한을 두고 운영해야 합니다. 과금 규칙은 [Retry Strategy](/ko/api-capabilities/image-api-best-practices#retry-strategy)에 있습니다.

<Tip>
  먼저 실제로 어떤 스택을 사용 중인지 확인하십시오: `node -v`, `npm ls openai undici axios node-fetch`. `UND_ERR_*` 코드만으로는 아래에 undici가 있다는 사실만 증명할 뿐이며, **OpenAI SDK를 사용하고 있다는 사실은 증명하지 못합니다**. 직접 사용하는 `fetch()`도 같은 코드를 던지며, 순수한 `fetch()`에는 `maxRetries`이 전혀 없습니다.
</Tip>

### 이미 죽은 연결을 재사용하는 keep-alive

undici는 기본적으로 keep-alive로 연결 풀링을 사용합니다. VPN, NAT 또는 proxy가 유휴 연결을 조용히 회수해도 클라이언트는 이를 알지 못한 채 다음 요청에서 그 연결을 풀에서 꺼내게 됩니다 — **write가 즉시 RST를 받으며 `read ECONNRESET`로 나타납니다**.

이것은 호출 간격이 벌어질 때 `ECONNRESET`의 가장 흔한 원인이며, “오류가 한 시간 구간에 몰린다”와 “첫 번째 재시도조차 실패한다”를 모두 설명합니다. 재사용을 비활성화하여 확인하십시오:

```javascript theme={null}
const agent = new Agent({ pipelining: 0, keepAliveTimeout: 1_000 });
// errors disappear ⇒ it was dead-connection reuse
```

## 로컬 프록시 / VPN: 이미지 엔드포인트가 먼저 드러내는 경유 단계

<Info>
  **APIYI는 중국 본토 내부에서 직접 접근 가능하며 프록시나 VPN이 필요하지 않습니다** ([API를 사용하려면 프록시가 필요한가요?](/ko/faq/network-proxy) 참조). 따라서 **프록시를 끄고 다시 테스트하는 것**이 가장 저렴하고 정보량이 가장 높은 단일 단계입니다.

  다만 분명히 해두자면, 프록시는 **가장 유력한 의심 변수**일 뿐, 확정된 근본 원인은 아닙니다. 아래 매트릭스가 실제로 결함의 위치를 특정합니다.
</Info>

이미지 엔드포인트를 텍스트 엔드포인트보다 훨씬 민감하게 만드는 두 가지 특성은 **생성 중 30\~60초 동안 0바이트 상태가 지속되는 것**과, **MB급 본문이 한 번에 버스트로 전달되는 것**입니다. chat 엔드포인트는 잘 동작하는데 이미지 엔드포인트만 실패한다면, 보통 이 둘 중 하나입니다.

<CardGroup cols={2}>
  <Card title="fake-ip / 라우팅 규칙 미스" icon="route-off">
    프록시의 fake-ip 모드에서는 규칙 미스로 인해 `198.18.x.x` 같은 라우팅 불가능한 주소로 연결되며, 정확히 10초의 연결 타임아웃이 발생합니다. 이것은 단순히 연결이 느린 것이 아니라 아예 경로가 없다는 뜻이므로 `connect.timeout`을 높여도 해결되지 않습니다. 실제로 도달한 `remote_ip`를 항상 기록하십시오.
  </Card>

  <Card title="생성 중 유휴 연결로 회수됨" icon="timer-off">
    요청이 전송된 뒤 30\~60초 동안 0바이트가 흐르고, 프록시가 유휴 정책에 따라 연결을 회수합니다. 특징은 **실패 시점이 30 / 60 / 120초 같은 딱 떨어지는 숫자에 맞는다는 점**이며, 이미지 크기와는 무관합니다.
  </Card>

  <Card title="MTU / PMTUD 블랙홀" icon="package-x">
    ICMP의 "fragmentation needed"가 차단된 상태에서 터널 MTU가 경로 MTU보다 낮아 PMTUD가 깨집니다. 전형적인 특징은 **작은 요청은 항상 정상인데 큰 응답은 항상 멈추고, 수신 바이트가 몇 KB에서 수십 KB 사이에 고정되는 것**입니다. 터널 MTU를 1400 정도로 낮추면 보통 해결됩니다.
  </Card>

  <Card title="MITM 복호화 및 전체 버퍼링" icon="shield-off">
    HTTPS 복호화를 켠 프록시는 대개 대용량 본문을 통째로 버퍼링하며 크기 상한에 걸릴 수 있고, 또는 chunked를 `Content-Length`로 다시 써서 길이를 잘못 계산해 RST를 발생시킵니다. 다시 말하지만 이것은 MB급 이미지 응답에만 영향을 주며, 텍스트 호출에는 절대 발생하지 않습니다.
  </Card>
</CardGroup>

### 진단 매트릭스

이 섹션의 핵심입니다. 축은 두 개뿐입니다. **실패가 첫 바이트 이전에 발생했는지 이후에 발생했는지**, 그리고 **몇 바이트가 도착했는지**입니다.

| 관찰                            | 연결 타임아웃                 | 프록시 유휴 회수         | MTU 블랙홀         | 청크 종료자 누락                                                      |
| ----------------------------- | ----------------------- | ----------------- | --------------- | -------------------------------------------------------------- |
| TTFB (첫 바이트)                  | 도착하지 않음                 | 도착하지 않음           | 도착함             | **정상**(생성 시간과 일치)                                              |
| 수신된 바이트                       | 0                       | 0                 | **0 \< N ≪ 전체** | **= 전체, JSON이 정상적으로 파싱됨**                                      |
| 실패 시점                         | **약 10.0초, 매우 안정적**     | 딱 떨어지는 숫자, 크기와 무관 | 가변적             | 마지막 바이트 후 +300초에 연결이 끊기거나; 또는 **무기한 멈춤**(검증됨: 330초 후에도 여전히 없음) |
| 연결 종료 상태                      | ConnectTimeout          | RST               | 멈춤 또는 RST       | FIN(정상 종료); 또는 **종료자 없음, FIN 없음, 연결이 열린 채 유지됨**                |
| 과금됨?                          | **아니요**(게이트웨이에 도달하지 않음) | "과금 영향" 참조        | "과금 영향" 참조      | "과금 영향" 참조                                                     |
| `response_format: "url"` 사용 시 | 여전히 실패                  | 여전히 실패            | **정상 동작**       | **정상 동작**                                                      |

마지막 행은 가장 가치가 높은 단일 테스트입니다. 본문을 여러 MB에서 약 1KB로 줄입니다. **URL 모드는 계속 성공하는데 base64 모드는 계속 실패한다면, 문제는 전송량에 비례하는 것입니다.** 따라서 앞의 두 열은 바로 배제됩니다.

<Info>
  오른쪽 끝 열(**청크 종료자 누락**)은 최근 새로운 형태를 띱니다: **종료자가 없고, 닫힘도 없으며, 무기한 멈추는 형태**입니다. 예전의 "정상적으로 닫히고 +300초 뒤"와는 다릅니다. 두 형태의 공통점은 **데이터가 이미 완전하고 이미지가 직접 사용 가능하다**는 점이며, 처리 방식도 같습니다. 클라이언트 쪽에서 응답을 끝내야 합니다. [끝에서 멈추는 요청](/ko/api-capabilities/image-tail-stall)을 참조하십시오.
</Info>

### 전체 타이밍 프로필을 위한 한 번의 명령

```bash theme={null}
curl -sS -o /tmp/out.json --trace-time \
  -w '\nconnect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} code=%{http_code} ip=%{remote_ip}\n' \
  -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"model":"gpt-image-2-all","prompt":"a red cube on a white table"}' \
  https://api.apiyi.com/v1/images/generations
```

매트릭스에 대조해 읽으십시오: `connect` 값 없음 → 연결 단계; `ttfb` 없음 및 딱 떨어지는 `total` → 유휴 회수; 전체 `bytes`이지만 `total ≈ ttfb + 300`와 `curl: (18)`가 있으면 → 종료자 누락; `bytes`가 수십 KB에서 멈춤 → MTU.

<Warning>
  **프록시 사용과 비사용을 A/B 테스트할 때는 실행을 번갈아 수행하시고 — 절대 묶어서 하지 마십시오.** 프록시 실행 5회 뒤 직접 연결 5회를 연달아 하면 **시간 창 결함**이 결과를 오염시켜 완전히 잘못된 결론으로 이어질 수 있습니다. 저희는 모든 것이 실패했다가 몇 분 뒤에는 모두 성공하고, 다시 실패하는 구간을 측정한 적이 있습니다. 대신 `proxy → direct → proxy → direct`을 실행하고, 매번 `remote_ip`를 기록하십시오.
</Warning>

## 기타 흔한 트리거

<CardGroup cols={2}>
  <Card title="실행 중인 작업이 중간에 강제 중단될 때" icon="octagon-x">
    디버깅 중 Ctrl+C를 누르거나, 프로세스를 재시작하거나, hot reload를 하거나, 실행 중인 스크립트를 종료하면 — 전송 중인 모든 대형 응답은 게이트웨이에 `write_response_body_failed`를 남깁니다. 이것은 가장 자주 “채널이 불안정하다”로 오해되는 오경보입니다.
  </Card>

  <Card title="외부 타임아웃이 먼저 발생할 때" icon="timer-off">
    작업 큐 워커 타임아웃, 서버리스 실행 제한, 게이트웨이/CDN 오리진 타임아웃(일반적으로 기본값은 60초입니다). 생성 시간보다 짧은 어느 계층이든 먼저 연결을 끊습니다 — [반드시 읽기 및 모범 사례](/ko/api-capabilities/image-api-best-practices#troubleshooting-timeouts-and-disconnects)를 참고하십시오.
  </Card>

  <Card title="커넥션 풀과 과도한 동시 실행 수" icon="waypoints">
    커넥션 풀 상한, 로컬 파일 디스크립터 제한, NAT/방화벽이 장시간 유지되는 연결을 조용히 회수하는 경우입니다. 대형 응답은 훨씬 더 오래 열린 상태로 유지되므로 텍스트 엔드포인트보다 이러한 제한에 훨씬 더 자주 걸립니다.
  </Card>

  <Card title="응답 본문이 메모리를 소진할 때" icon="memory-stick">
    단일 4K base64 페이로드는 20-30MB에 이를 수 있습니다. 동시 실행 수가 높은 상태에서 `resp.json()`로 이를 한꺼번에 로드하면 컨테이너 메모리가 고갈되어 프로세스가 OOM-killed될 수 있으며 — 이 역시 “아무 이유 없이 연결이 끊겼다”로 나타납니다.
  </Card>
</CardGroup>

## 과금 영향: 어떤 경우는 비용이 발생하고 어떤 경우는 발생하지 않는가

이 두 상황은 늘 혼동되지만, 실제 과금 방식은 정반대입니다:

<Info>
  ### 플랫폼이 500 `write_response_body_failed`를 반환함 — **과금되지 않습니다**

  이 오류는 게이트웨이가 이미지 데이터를 사용자에게 다시 쓰는 중 연결이 끊겼음을 의미합니다. **플랫폼은 내부적으로 자동 재시도를 2\~3회 수행하며**, 그 모든 시도가 실패한 뒤에야 500을 반환합니다.

  **이 경우에는 비용이 발생하지 않습니다.** 같은 요청에서 이런 오류가 여러 번 연속으로 발생해도 **청구서에는 이에 대응하는 과금 내역이 남지 않습니다** — 이런 실패에 대해서는 절대 비용을 지불하지 않습니다.
</Info>

<Warning>
  ### 클라이언트가 먼저 종료함 — **정상 과금됩니다**

  다른 경우는 게이트웨이가 전송을 완료하기 전에 **사용자 측**에서 먼저 연결을 끊는 경우입니다. 예를 들어 클라이언트 타임아웃이 발생하거나, 디버깅 중 Ctrl+C를 누르거나, 프로세스를 재시작하거나, OOM kill이 발생하는 경우입니다.

  서버와 상위 단계에서의 생성은 **이미 완료된 상태**이므로, 이런 경우는 **정상 과금됩니다** — "이미지를 받지 못했다"는 것이 "과금되지 않았다"는 뜻은 아닙니다. 문제를 확인하는 동안 큰 이미지 요청을 반복하면 실제로 꽤 큰 청구가 발생할 수 있습니다.
</Warning>

둘을 구분하는 방법은 바로 위 표와 같습니다: **콘솔에 정상 호출이 기록되었는지, 아니면 500 `write_response_body_failed`가 기록되었는지 확인하십시오**.

따라서 재시도 정책도 그에 맞게 엄격하게 유지해야 합니다: 전송 계층 수준의 실패는 재시도할 가치가 있지만, **각 재시도는 별도로 과금되는 호출일 수 있습니다**(어느 범주에 해당하느냐에 따라 다릅니다). 무제한 재시도 루프는 절대 작성하지 마십시오.

## 올바르게 재시도하는 방법

핵심 규칙은 **전송 계층 예외만 재시도하고, HTTP 계층 오류는 절대 재시도하지 않는 것**입니다. 4xx를 만 번 다시 보내도 여전히 4xx이며, 시간만 낭비합니다.

```python theme={null}
import time
import requests

TRANSPORT_ERRORS = (
    requests.exceptions.SSLError,
    requests.exceptions.ConnectionError,
    requests.exceptions.ChunkedEncodingError,
    requests.exceptions.ReadTimeout,
)

def call_image_api(url, headers, body, timeout=360, retries=2):
    """Retry transport-level failures up to `retries` times; never retry HTTP
    4xx/5xx — hand those straight back to the caller.

    Note: each retry may be a newly billed request, so keep `retries` small.
    """
    attempts = []
    for i in range(retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=body,
                                 stream=True, timeout=(10, timeout))
            raw = b"".join(resp.iter_content(chunk_size=8192))
            attempts.append({"attempt": i + 1, "status": resp.status_code})
            return resp.status_code, raw, attempts      # 4xx/5xx included
        except TRANSPORT_ERRORS as e:
            attempts.append({"attempt": i + 1, "error": repr(e)})
            if i == retries:
                raise
            time.sleep(2 + 3 * i)                       # back off 2s, then 5s
```

<Tip>
  **모든 시도를 별도로 기록하십시오**(위의 `attempts` 목록). 그렇지 않으면 성공한 클라이언트 재시도는 로그에 깨끗한 200만 남기고, 전송이 실제로 몇 번 끊겼는지는 영영 알 수 없습니다. 이 데이터는 채널 품질을 평가할 때 필수이며, 자체 재시도를 채널 동작으로 오해하는 일을 막아 줍니다.
</Tip>

### 응답을 전체 로드하지 말고 스트리밍하십시오

대용량 본문은 `stream=True`로 청크 단위로 읽으십시오. 이렇게 하면 최대 메모리 사용량을 낮게 유지할 수 있고, **전송의 어느 단계에서 끊겼는지 정확히** 보여 줍니다:

```python theme={null}
resp = requests.post(url, headers=headers, json=body, stream=True, timeout=(10, 360))
chunks, total = [], 0
for chunk in resp.iter_content(chunk_size=8192):
    total += len(chunk)
    chunks.append(chunk)
raw = b"".join(chunks)
# total far below Content-Length  => the transfer broke midway
# total complete but connection stays open => upstream omitted the chunked
#   terminator, which is a channel-side problem
```

**그 두 번째 경우는 재시도하지 마십시오**: 데이터는 이미 완전히 수신되었고 이미지는 그대로 사용할 수 있습니다. 전체 클라이언트 측 완료 코드는 [끝에서 멈추는 요청](/ko/api-capabilities/image-tail-stall)을 참조하십시오.

## 실제로 지원팀에 문의할 가치가 있는 경우

자체 점검을 완료한 후에도, 다음 중 **하나라도** 해당하면 지원팀에 에스컬레이션하십시오.

* 적절한 OpenSSL 인터프리터로 전환하고 serial 실행으로 낮춰도 여전히 안정적으로 재현됩니다;
* 같은 창에서 다른 것은 정상인데 **특정 채널 또는 모델 하나만** 실패합니다;
* 응답 본문이 **완전히 도착했지만**(바이트 수가 `Content-Length`와 일치함) 연결이 시간 초과될 때까지 닫히지 않습니다. 이는 업스트림의 chunked terminator 누락으로, 채널 측 문제입니다. **먼저 [Requests Hanging at the End](/ko/api-capabilities/image-tail-stall)에 설명된 클라이언트 측 완료 처리를 추가하여 이미지를 복구한 다음**, 문제가 계속되면 티켓을 등록하십시오;
* 오류가 업스트림을 향한 문제임이 명확합니다(`upstream_error`, 원시 upstream 5xx).

티켓에는 `x-request-id`, 호출 시간(**시간대 포함**, 예: `2026-07-29 14:32 (UTC+8)`), 모델 이름, `imageSize`와 같은 주요 파라미터, 원시 클라이언트 예외, 그리고 이미 완료한 자체 점검 단계를 포함하십시오.

## 관련 문서

<CardGroup cols={3}>
  <Card title="끝에서 요청이 멈춤" icon="hourglass" href="/ko/api-capabilities/image-tail-stall">
    이미지가 도착했지만 연결이 끝나지 않을 때의 클라이언트 측 완료 처리
  </Card>

  <Card title="반드시 읽어야 할 내용 및 모범 사례" icon="book-check" href="/ko/api-capabilities/image-api-best-practices">
    동기 호출, 모델별 타임아웃, base64 처리, 연결 종료 시 과금
  </Card>

  <Card title="직접 비동기 큐 만들기" icon="list-checks" href="/ko/api-capabilities/image-async-queue">
    동기 호출을 태스크 큐로 감싸고 재시도로 간헐적 끊김을 완화합니다
  </Card>

  <Card title="프록시가 필요합니까?" icon="wifi" href="/ko/faq/network-proxy">
    APIYI는 프록시 없이 직접 연결하며, 인증서 및 DNS 문제를 자체 점검합니다
  </Card>

  <Card title="Gemini 이미지 오류 처리" icon="triangle-alert" href="/ko/api-capabilities/gemini-image-error-handling">
    Gemini 이미지 생성의 오류 코드와 finishReason 처리
  </Card>

  <Card title="오류 캡처" icon="clipboard-list" href="/ko/api-manual/error-reporting">
    이 오류를 전체로 출력하는 방법과 지원 티켓에 포함할 필드
  </Card>
</CardGroup>
