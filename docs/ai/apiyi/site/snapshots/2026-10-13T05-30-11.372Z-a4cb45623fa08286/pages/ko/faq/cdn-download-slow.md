> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CDN 이미지/동영상 다운로드가 느리거나 타임아웃이 발생할 때 — 어떻게 해야 합니까?

> 이미지 API 호출은 성공했으나 반환된 URL 다운로드가 느리거나 Read timed out이 발생합니까? 자가 점검 명령어(Windows 포함), 안정화된 다운로드 패턴 및 문의 시 전달해야 할 정보를 안내합니다.

## 빠른 답변

APIYI를 통해 생성된 대부분의 이미지 및 동영상(Veo 3.1, Sora, Nano Banana, gpt-image-2-vip 등)은 Cloudflare와 같은 글로벌 CDN에 호스팅된 URL로 반환됩니다. 다운로드 속도가 느리거나 타임아웃이 발생하는 원인은 대개 다음 두 가지 중 하나입니다:

* **사용자 서버에서 CDN으로 이어지는 네트워크 경로**: 중국 본토에 있는 서버가 해외 CDN에 접속할 때는 국가 간 대역폭, ISP 라우팅, 로컬 DNS의 영향을 받습니다.
* **스토리지 측 문제**: CDN 배후의 스토리지 노드가 느려지면 모든 경로가 영향을 받을 수 있습니다.

두 경우 모두 프로그램의 오류 로그에서는 거의 동일하게 나타나며, 단일 머신에서 진행한 테스트만으로는 이를 구분하기 어렵습니다. **아래의 자체 점검 단계를 실행한 후 결과를 전달해 주십시오** — 스토리지 측 데이터와 대조하여 확인해 드리겠습니다. 이를 통해 불필요하게 소요되는 소통 시간을 크게 줄일 수 있습니다.

<Info>
  **핵심 사항**

  Cloudflare R2 리소스 URL은 일반적으로 `*.r2.cloudflarestorage.com` 형식이나 Cloudflare를 통해 프록시된 커스텀 도메인 형태를 띱니다. 다운로드 속도는 사용자 서버가 가장 가까운 Cloudflare 엣지 노드에 얼마나 효율적으로 연결될 수 있는지에 따라 결정됩니다.
</Info>

## API 호출은 성공했지만 이미지가 다운로드되지 않습니까?

이미지 생성은 두 단계로 진행됩니다:

1. 프로그램이 APIYI API를 호출하여 이미지가 생성되고 URL이 반환됩니다
2. 프로그램이 해당 URL에서 이미지를 다운로드합니다

2단계는 **사용자 서버에서 이미지 스토리지 호스트로 직접 진행되며 APIYI 게이트웨이를 거치지 않습니다**. 이러한 이유로 다음과 같은 현상이 발생합니다:

* APIYI 로그에는 요청이 **성공 및 과금됨**으로 표시됩니다 — 이미지는 실제로 정상 생성되었습니다
* 프로그램에서 `Read timed out` 또는 `Connection reset`와 같은 오류를 보고하며, 오류 메시지의 호스트는 `api.apiyi.com`가 아닌 **이미지 도메인**입니다
* `Read timed out`는 연결은 수립되었으나 오랫동안 데이터가 수신되지 않았음을 의미합니다. 이는 "연결할 수 없음"과 동일하지 않으며, 이 오류 자체만으로는 어느 쪽에 문제가 있는지 알 수 없습니다

<Tip>
  **URL 유효 기간 동안에는 동일한 URL을 다시 다운로드할 수 있습니다**(예: gpt-image-2-vip의 경우 48시간). 다운로드에 실패하더라도 **이미지를 다시 생성할 필요가 없으며** — 다운로드만 다시 시도하면 됩니다. 코드 패턴은 아래의 "옵션 2"를 참조하십시오.
</Tip>

<Warning>
  **알림 메시지를 확인하십시오**: API 호출이 실패할 때는 `api.apiyi.com`를 보고하고, 다운로드가 실패할 때는 이미지 도메인과 "생성 성공"을 함께 보고하십시오. 둘을 혼동하여 기록하면 다운로드 문제가 API 장애처럼 보일 수 있습니다.
</Warning>

## 일반적인 원인

<CardGroup cols={2}>
  <Card title="국경 간 혼잡" icon="network">
    중국 본토의 서버가 해외 CDN에 연결할 때 피크 시간대에 국제 회선 출구에서 혼잡을 겪는 경우가 많아, 속도가 느려지거나 시간 초과가 발생합니다.
  </Card>

  <Card title="최적화되지 않은 ISP 라우팅" icon="route">
    일부 클라우드 제공업체는 국제 트래픽을 미국 서부나 유럽을 경유하도록 라우팅하여 수십 밀리초의 불필요한 지연을 추가합니다.
  </Card>

  <Card title="부적절한 DNS 해석" icon="globe">
    로컬 DNS가 Cloudflare 호스트명을 가장 가까운 APAC 노드가 아니라 먼 엣지(예: 미국 서부)로 해석할 수 있습니다.
  </Card>

  <Card title="방화벽 / 보안 그룹 제한" icon="shield">
    일부 서버는 해외 IP 대역, port 443 또는 특정 CDN 도메인으로의 아웃바운드 트래픽을 제한하여 연결 품질을 저하시킵니다.
  </Card>

  <Card title="HTTP/2 및 연결 재사용" icon="plug">
    HTTP/2나 연결 재사용이 없는 클라이언트는 파일마다 TCP/TLS 핸드셰이크 비용을 지불합니다.
  </Card>

  <Card title="단일 스레드 다운로드" icon="gauge">
    직렬 단일 스레드 다운로드는 CDN 멀티플렉싱의 이점을 누릴 수 없어 처리량이 낮게 유지됩니다.
  </Card>
</CardGroup>

## 문제 해결 단계

<Steps>
  <Step title="송신 IP 및 CDN 노드 확인">
    이미지 도메인이 Cloudflare를 통해 서비스되는 경우, 해당 도메인의 `/cdn-cgi/trace` 경로를 통해 단일 명령으로 송신 IP 및 할당된 노드를 확인할 수 있습니다. Linux, macOS 및 Windows cmd에서 작동합니다:

    ```bash theme={null}
    curl -s -m 30 https://<image-domain>/cdn-cgi/trace
    ```

    다음 세 줄을 확인하십시오: `ip=`(송신 IP), `colo=`(HKG, SIN, LAX, FRA 등의 노드 코드), `loc=`(지역).

    * **30초 이내에 출력이 없는 경우**: 서버가 도메인에 전혀 연결할 수 없는 상태입니다. 단계 4와 5를 집중적으로 확인하십시오.
    * **즉시 출력되는 경우**: 연결 상태는 정상이므로 전송 단계에 문제가 있는 것입니다. 단계 3으로 이동하여 단계별 소요 시간을 확인하십시오.
  </Step>

  <Step title="노트북과 서버 비교">
    노트북과 서버에서 **동일한 이미지 URL**을 다운로드합니다(명령어는 단계 3 참조).

    * **노트북은 빠르고 서버는 느린 경우**: 서버의 네트워크 경로 문제일 가능성이 가장 높지만, 일부 경로에 대해서만 스토리지 측 성능이 저하되었을 수도 있습니다. 두 결과 모두 당사에 전송해 주십시오.
    * **모든 환경에서 느린 경우**: 스토리지 측 문제일 가능성이 가장 높습니다. 해당 URL과 함께 당사에 문의해 주십시오.
  </Step>

  <Step title="CDN 기본 네트워크 테스트">
    `ping`, `mtr`, `traceroute`을(를) 사용하여 지연 시간과 패킷 손실을 검사합니다:

    ```bash theme={null}
    # Linux / macOS
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    ```bash theme={null}
    # Windows cmd
    tracert -d -w 1000 <cdn-host>
    ```

    Cloudflare에 대한 서버의 전반적인 처리량을 확인하려면 5MB의 테스트 데이터를 다운로드하십시오:
    `curl -o /dev/null -m 60 -w "total=%{time_total} speed=%{speed_download}\n" "https://speed.cloudflare.com/__down?bytes=5000000"`
    (Windows에서는 `/dev/null`을(를) `NUL`(으)로 대체하십시오). 이 역시 느리다면 서버의 송신 네트워크가 문제입니다. 이 작업은 빠르고 이미지 URL만 느리다면 결과를 당사에 전송해 주십시오.

    패킷 손실, 200ms 이상의 지연 시간, 또는 해외로 우회하는 경로는 모두 링크 수준의 문제를 나타냅니다.
  </Step>

  <Step title="실제 다운로드 속도 측정">
    `curl`을(를) 사용하여 소요 시간과 처리량을 검사합니다:

    <Tabs>
      <Tab title="Linux / macOS">
        ```bash theme={null}
        curl -4 -o /dev/null -m 60 -w "dns:%{time_namelookup} connect:%{time_connect} \
        tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total} \
        size:%{size_download} speed:%{speed_download} ip:%{remote_ip}\n" \
        "<CDN URL>"
        ```
      </Tab>

      <Tab title="Windows cmd">
        ```bash theme={null}
        curl -4 -o NUL -m 60 -w "dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} size=%{size_download} speed=%{speed_download} ip=%{remote_ip}\n" "<CDN URL>"
        ```

        cmd 창에 직접 붙여넣으십시오. .bat 파일 내에서는 `%`을(를) `%%`(으)로 변경하십시오. Windows 10 및 이후 버전에는 curl이 기본 탑재되어 있으며, Windows Server 2012 R2와 같은 이전 시스템에서는 별도로 설치해야 합니다.
      </Tab>
    </Tabs>

    `-m 60`을(를) 사용하면 curl이 60초 후에 중단되더라도 소요 시간을 출력하므로 무한 대기 상태에 빠지지 않습니다. `-4` 대신 `-6`(으)로 다시 실행해 보십시오. 특정 프로토콜만 지연되는 경우 정상 작동하는 프로토콜을 사용하도록 프로그램을 고정할 수 있습니다.

    다음 항목을 중점적으로 확인하십시오:

    * `time_namelookup`: DNS 확인 소요 시간
    * `time_connect`: TCP 연결 소요 시간
    * `time_appconnect`: TLS 핸드셰이크 완료 시점(0은 핸드셰이크 실패를 의미)
    * `time_starttransfer`: 첫 바이트 도달 시간(TTFB)
    * `size_download`: 실제 수신된 바이트 수(0 또는 매우 작은 값은 연결되었으나 전송이 중단되었음을 의미)
    * `speed_download`: 평균 처리량(바이트/초)
  </Step>

  <Step title="DNS 확인 결과 검사">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    확인된 IP가 지리적으로 가까운지 확인하십시오. APAC 사용자는 APAC 엣지에 연결되어야 하며, 그렇지 않다면 퍼블릭 DNS로 전환하십시오.
  </Step>

  <Step title="서버 자체 확인">
    “어제는 작동했는데 오늘은 안 됨”과 같은 현상은 대개 서버에서 무언가가 변경되었음을 의미합니다. 각 항목을 확인하십시오:

    * 클라우드 콘솔: 트래픽 쿼터가 소진되었는지, 대역폭이 제한되었는지, 계정이 연체 상태인지 확인하십시오.
    * 다른 프로세스가 대역폭을 모두 점유하고 있는지 확인하십시오(Windows: 작업 관리자 → 성능 → 이더넷, Linux: `iftop`, `nload`).
    * 보안 그룹 및 방화벽이 443 포트와 해외 IP 대역을 허용하는지, 최근 아웃바운드 규칙이 변경되었는지 확인하십시오.
    * 프로그램이 응답하지 않는 프록시를 거치고 있는지 확인하십시오(`HTTP_PROXY` / `HTTPS_PROXY` 확인, Windows의 경우 `netsh winhttp show proxy`도 확인).
  </Step>
</Steps>

## 해결 방법

### 옵션 1: 퍼블릭 DNS로 전환 (가장 간단)

많은 서버의 기본 DNS는 Cloudflare를 먼 노드로 연결합니다. 다음 퍼블릭 DNS 서버를 사용해 보십시오:

```bash theme={null}
{/* /etc/resolv.conf */}
nameserver 1.1.1.1        # Cloudflare
nameserver 8.8.8.8        # Google
nameserver 223.5.5.5      # AliDNS
nameserver 119.29.29.29   # DNSPod
```

<Tip>
  `1.1.1.1`을 권장합니다. Cloudflare 자체 DNS로서 가장 가까운 Cloudflare 엣지로 안정적으로 연결하므로 R2 / Cloudflare CDN 트래픽에 가장 이상적입니다.
</Tip>

### 옵션 2: 다운로드 방식 최적화

<CardGroup cols={2}>
  <Card title="병렬 다운로드" icon="layers">
    여러 파일을 일괄 다운로드할 때는 대역폭을 최대한 활용할 수 있도록 병렬 다운로더(`aria2c -x 8`, Python `asyncio + httpx`)를 사용하십시오.
  </Card>

  <Card title="짧은 타임아웃 + 재시도" icon="refresh-cw">
    연결(connect) 및 읽기(read) 타임아웃을 분리하여 설정하고, 읽기 타임아웃은 30초 내외로 유지하며 3\~4회 재시도하십시오. 멈춘 연결은 새로 연결하면 정상적으로 작동하는 경우가 많으므로 120초 동안 기다리는 것보다 훨씬 낫습니다.
  </Card>

  <Card title="연결 재사용" icon="plug">
    반복되는 핸드셰이크를 방지하기 위해 HTTP/2 또는 keep-alive(`httpx`, `requests.Session()`)를 지원하는 클라이언트를 사용하십시오.
  </Card>

  <Card title="디스크로 직접 스트리밍" icon="hard-drive">
    전체 파일을 메모리에 로드하는 대신 응답을 디스크로 직접 스트리밍하십시오.
  </Card>
</CardGroup>

**Python 예시 (권장)**:

`timeout=120`를 사용한 단순 일회성 다운로드는 지양하십시오. 연결이 중단되면 무의미하게 120초 동안 대기하게 되며 전체 생성 작업이 실패로 표시되어, 이미 생성되고 과금된 이미지를 낭비하게 됩니다.

```python theme={null}
import time
import httpx

# connect 10s; read 30s = give up after 30s with no data (not total duration)
TIMEOUT = httpx.Timeout(connect=10, read=30, write=30, pool=10)

def download(url: str, path: str, attempts: int = 4) -> str:
    for i in range(attempts):
        try:
            with httpx.stream("GET", url, timeout=TIMEOUT, follow_redirects=True) as resp:
                resp.raise_for_status()
                with open(path, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=256 * 1024):
                        f.write(chunk)
            return path
        except httpx.HTTPError as e:
            print(f"Download failed (attempt {i + 1}): {e!r}")
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"Image generated, but download failed repeatedly: {url}")

download("<CDN URL>", "output.png")
```

**aria2c 예시 (CLI)**:

```bash theme={null}
aria2c -x 8 -s 8 -k 1M --file-allocation=none "<CDN URL>"
```

### 옵션 3: 네트워크 연결 상태가 더 우수한 리전으로 이전

사용 환경에서 지원한다면 Cloudflare와의 연결성이 우수한 리전을 권장합니다:

<CardGroup cols={2}>
  <Card title="해외 (권장)" icon="globe">
    AWS / GCP / Azure / Cloudflare Workers는 모두 매우 낮은 지연 시간(일반적으로 10-50ms)으로 Cloudflare R2에 도달합니다.
  </Card>

  <Card title="중국: 프리미엄 DC" icon="server">
    중국 본토에 반드시 배포해야 한다면 3망 BGP 및 프리미엄 국제 회선(CN2 GIA, CMI, AS9929)을 갖춘 DC를 선택하십시오.
  </Card>

  <Card title="홍콩 / 싱가포르" icon="network">
    중국 본토와의 낮은 지연 시간(30-80ms) 및 우수한 APAC Cloudflare 연결성을 제공하는 좋은 절충안입니다.
  </Card>

  <Card title="저가형 VPS 지양" icon="triangle-alert">
    저가형 호스팅은 국제 아웃바운드(egress) 대역폭 정체가 심해 사용량이 몰리는 시간대에 수십 KB/s 수준까지 속도가 떨어질 수 있습니다. CDN 트래픽이 많은 워크로드에는 권장하지 않습니다.
  </Card>
</CardGroup>

### 옵션 4: 다른 호스트를 통한 릴레이 (최후의 수단)

서버에서 Cloudflare로 빠르게 접근하기 어렵고 리전을 변경할 수도 없는 경우:

1. **해외 서버를 릴레이로 사용**: 해외 서버로 먼저 다운로드한 다음, 전용선/프리미엄 회선을 통해 다시 전송합니다.
2. **자체 오브젝트 스토리지를 통한 릴레이**: 에셋을 자체 OSS / COS / S3(예: 중국 리전 버킷)로 미러링한 후 해당 스토리지에서 서비스합니다.
3. **프리웜 및 캐싱**: 백엔드에서 한 번 다운로드한 후 후속 요청은 로컬 캐시에서 서비스합니다.

<Warning>
  **만료 시간 주의**

  APIYI에서 반환하는 이미지/동영상용 CDN URL은 일반적으로 유효 기간이 제한되어 있습니다(반환된 URL 참조). 향후 링크가 끊어지는 현상을 방지하려면 콜백이 도착하는 **즉시** 에셋을 다운로드하여 자체 스토리지에 영구 보관하십시오.
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="노트북에서는 빠른데 서버에서는 왜 느립니까?">
    가정용 광대역 인터넷과 데이터센터의 국제 아웃바운드 회선 품질에는 상당한 차이가 있을 수 있으며, 이것이 가장 흔한 원인입니다.

    하지만 이것이 **유일한 원인은 아닙니다**. 스토리지 측 노드의 성능이 저하되면 특정 경로에만 영향을 미칠 수 있으며, 이 또한 “노트북은 빠르고 서버는 느린” 현상으로 나타날 수 있습니다. 이 현상만으로 단정 짓지 마시고, 위의 단계를 실행한 후 스토리지 측을 확인할 수 있도록 결과를 보내주시기 바랍니다.
  </Accordion>

  <Accordion title="오류 메시지에는 api.apiyi.com에 연결할 수 없다고 나오는데 세부 정보의 호스트는 이미지 도메인인 이유는 무엇입니까?">
    해당 문구는 대개 사용자 프로그램에서 직접 조합하여 생성한 메시지입니다. 실제로 실패한 것은 **이미지 다운로드**이며, 생성 API 호출은 성공했습니다. 세부 정보에 표시된 호스트를 신뢰하시고, 두 종류의 오류 메시지를 분리하여 처리하는 것을 권장합니다.
  </Accordion>

  <Accordion title="DNS를 변경했는데도 여전히 느린 이유는 무엇입니까?">
    DNS는 어떤 CDN 엣지로 확인(resolve)되는지에만 영향을 줍니다. 기저의 국제 대역폭이 이미 혼잡한 상태라면 DNS 변경만으로는 해결되지 않습니다. 리전을 변경하거나 해외 호스트를 경유(릴레이)하는 방법을 고려해 보십시오.
  </Accordion>

  <Accordion title="중국 본토에서 Cloudflare R2가 차단되어 있습니까?">
    Cloudflare는 중국 본토에서 차단되지 않았지만, 피크 시간대에는 국제 아웃바운드 회선이 혼잡해질 수 있고 일부 인터넷 서비스 제공업체(ISP)가 최적이 아닌 경로를 사용하므로 접속 품질이 일정하지 않을 수 있습니다. 이는 R2만의 문제가 아닌 일반적인 국경 간 네트워크 문제입니다.
  </Accordion>

  <Accordion title="동영상 다운로드가 계속 실패합니다. 어떻게 해야 합니까?">
    적절한 타임아웃 및 재시도 설정과 함께 `aria2c` 또는 `wget -c`처럼 **이어받기**를 지원하는 다운로더를 사용하십시오:

    ```bash theme={null}
    aria2c -x 8 -s 8 -c --max-tries=10 --retry-wait=3 "<CDN URL>"
    ```
  </Accordion>

  <Accordion title="APIYI에서 CDN URL 대신 Base64를 반환할 수 있습니까?">
    동영상은 파일 크기가 커서(수십에서 수백 MB), Base64로 인코딩하면 약 33%의 오버헤드가 발생하며 이어받기도 지원되지 않습니다. 따라서 실제로 속도가 더 느려지고 대역폭이 낭비됩니다. 대용량 파일에는 Base64 사용을 **권장하지 않습니다**. 일부 이미지 엔드포인트에서는 Base64 응답을 지원하므로 관련 API 문서를 참조하십시오.
  </Accordion>

  <Accordion title="병목 지점이 CDN이 아니라 사용자의 네트워크임을 어떻게 확인합니까?">
    해외 호스트(AWS 도쿄, 싱가포르 등)에서 동일한 `curl` 테스트를 실행해 보십시오. 해외 호스트에서는 빠르지만 서버에서는 느리다면, 병목 지점은 CDN 자체가 아닌 서버와 Cloudflare 사이의 네트워크입니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="네트워크 프록시 설정" icon="network" href="/ko/faq/network-proxy">
    해외 네트워크 연결이 불안정할 때 사용할 수 있는 프록시 옵션입니다
  </Card>

  <Card title="APIYI 서버는 어디에 있습니까?" icon="server" href="/ko/faq/server-location">
    APIYI 서버 위치 및 지연 시간에 대해 알아봅니다
  </Card>

  <Card title="Veo 동영상 생성 API" icon="video" href="/en/api-capabilities/veo/overview">
    동영상 API의 출력 형식 및 URL 유효 기간입니다
  </Card>

  <Card title="고객 지원 문의" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    문제가 해결되지 않으면 지원팀이 도와드리겠습니다
  </Card>
</CardGroup>

<Info>
  **고객 지원팀 문의 시 공유해야 할 정보**

  자가 점검으로 문제가 해결되지 않는 경우, 불필요한 문답 과정을 줄이기 위해 아래 항목을 한 번에 정리하여 보내주시기 바랍니다:

  * 문제가 발생한 이미지 URL 및 생성 일시(또는 요청 ID)
  * 전체 `/cdn-cgi/trace` 출력 결과(노트북에서 1건, 서버에서 1건)
  * `curl` 단계별 타이밍 출력 결과(`-4` 실행 결과 1건, `-6` 실행 결과 1건)
  * `tracert` / `mtr` 출력 결과 및 5 MB 테스트 다운로드 결과
  * 사용 중인 서버의 클라우드 제공업체 및 리전
  * 문제가 발생하기 시작한 대략적인 시점(시간대 포함, 예: `21:23 (UTC+8)`)

  스크린샷에 표시된 API Key는 전송하기 전에 반드시 가려주시기 바랍니다.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.