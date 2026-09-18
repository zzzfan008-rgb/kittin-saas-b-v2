> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CDN 이미지/동영상 다운로드가 느립니다 — 어떻게 해야 합니까?

> APIYI는 생성된 모든 이미지와 동영상을 Cloudflare R2의 전역 CDN에 호스팅합니다. 이 가이드는 특정 서버에서 다운로드가 느린 원인을 진단하는 데 도움을 드립니다.

## 빠른 답변

APIYI에서 생성된 모든 이미지와 동영상(Veo 3.1, Sora, Nano Banana 등)은 **Cloudflare R2의 글로벌 CDN**에 호스팅되며, 이는 설계상 전 세계적으로 빠릅니다. 서버에서 다운로드가 느리다면, **대부분의 경우 CDN 자체의 문제가 아니라 서버와 Cloudflare 엣지 간의 네트워크 경로 문제**입니다. 특히 중국 본토의 서버가 해외 CDN에 접근할 때는, 국경 간 대역폭, ISP 라우팅, 로컬 DNS 해석 때문에 성능이 자주 저하됩니다.

<Info>
  **핵심 포인트**

  Cloudflare R2 리소스 URL은 일반적으로 `*.r2.cloudflarestorage.com`처럼 보이거나, Cloudflare를 통해 프록시된 사용자 지정 도메인입니다. 다운로드 속도는 서버가 가장 가까운 Cloudflare 엣지 노드에 얼마나 효율적으로 도달하느냐에 따라 달라집니다.
</Info>

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
  <Step title="한 서버에서만 발생합니까, 아니면 어디서나 발생합니까?">
    노트북이나 다른 서버에서 동일한 CDN URL을 다운로드해 보십시오.

    * 노트북은 빠르고 서버는 느림 → **서버 네트워크 경로 문제**
    * 어디서나 느림 → 구체적인 URL과 함께 지원팀에 문의하십시오.
  </Step>

  <Step title="CDN에 대한 기본 네트워크를 테스트합니다">
    지연 시간과 패킷 손실을 확인하려면 `ping`, `mtr`, `traceroute`를 사용하십시오:

    ```bash theme={null}
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    패킷 손실, 200ms를 초과하는 지연 시간, 또는 경로가 해외로 자꾸 우회하는 현상은 모두 링크 수준의 문제를 나타냅니다.
  </Step>

  <Step title="실제 다운로드 속도를 측정합니다">
    타이밍과 처리량을 확인하려면 `curl`를 사용하십시오:

    ```bash theme={null}
    curl -o /dev/null -w "dns:%{time_namelookup} connect:%{time_connect} \
    ttfb:%{time_starttransfer} total:%{time_total} speed:%{speed_download}\n" \
    "<CDN URL>"
    ```

    중점적으로 확인할 항목은 다음과 같습니다:

    * `time_namelookup`: DNS 조회 시간
    * `time_connect`: TCP 연결 시간
    * `time_starttransfer`: 첫 바이트까지의 시간(TTFB)
    * `speed_download`: 평균 처리량(bytes/sec)
  </Step>

  <Step title="DNS 확인을 검사합니다">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    해석된 IP가 지리적으로 가까운지 확인하십시오. APAC 사용자는 APAC 엣지를 받아야 하며, 그렇지 않다면 공용 DNS로 전환하십시오.
  </Step>

  <Step title="서버 측 제한을 확인합니다">
    보안 그룹과 방화벽이 443 포트와 해외 IP 범위를 허용하는지 확인하고, 나가는 트래픽 대역폭 상한이 설정되어 있지 않은지 확인하십시오.
  </Step>
</Steps>

## 솔루션

### 옵션 1: 공용 DNS로 전환(가장 쉬운 방법)

많은 서버의 기본 DNS는 Cloudflare를 먼 노드로 해석합니다. 다음 공용 DNS 서버를 사용해 보십시오:

```bash theme={null}
{/* /etc/resolv.conf */}
nameserver 1.1.1.1        # Cloudflare
nameserver 8.8.8.8        # Google
nameserver 223.5.5.5      # AliDNS
nameserver 119.29.29.29   # DNSPod
```

<Tip>
  `1.1.1.1`을 우선 사용하십시오 — 이는 Cloudflare의 자체 DNS이며 가장 가까운 Cloudflare 엣지로 안정적으로 해석되므로, R2 / Cloudflare CDN 트래픽에 이상적입니다.
</Tip>

### 옵션 2: 다운로드 방식을 최적화합니다

<CardGroup cols={2}>
  <Card title="병렬 다운로드" icon="layers">
    대량의 파일에는 병렬 다운로드 도구(`aria2c -x 8`, Python `asyncio + httpx`)를 사용하여 대역폭을 최대한 활용하십시오.
  </Card>

  <Card title="재개 가능한 다운로드" icon="refresh-cw">
    대용량 동영상에는 재시도와 함께 HTTP Range 요청을 사용하여 실패해도 처음부터 다시 시작하지 않도록 하십시오.
  </Card>

  <Card title="연결 재사용" icon="plug">
    반복적인 핸드셰이크를 피하기 위해 HTTP/2 또는 keep-alive(`httpx`, `requests.Session()`)를 지원하는 클라이언트를 사용하십시오.
  </Card>

  <Card title="디스크로 스트리밍" icon="hard-drive">
    전체 파일을 메모리에 올리는 대신 응답을 디스크로 직접 스트리밍하십시오.
  </Card>
</CardGroup>

**Python 예시(권장)**:

```python theme={null}
import httpx
import asyncio

async def download(url: str, path: str):
    async with httpx.AsyncClient(http2=True, timeout=120) as client:
        async with client.stream("GET", url) as resp:
            resp.raise_for_status()
            with open(path, "wb") as f:
                async for chunk in resp.aiter_bytes(chunk_size=1024 * 256):
                    f.write(chunk)

asyncio.run(download("<CDN URL>", "output.mp4"))
```

**aria2c 예시(CLI)**:

```bash theme={null}
aria2c -x 8 -s 8 -k 1M --file-allocation=none "<CDN URL>"
```

### 옵션 3: 연결성이 더 좋은 리전으로 이동합니다

사용 사례상 가능하다면 Cloudflare와의 연결성이 좋은 리전을 우선하십시오:

<CardGroup cols={2}>
  <Card title="해외(권장)" icon="globe">
    AWS / GCP / Azure / Cloudflare Workers는 모두 매우 낮은 지연 시간으로 Cloudflare R2에 도달합니다(일반적으로 10-50ms).
  </Card>

  <Card title="중국: 프리미엄 데이터 센터" icon="server">
    반드시 중국 본토에 배포해야 한다면, 3중 네트워크 BGP + 프리미엄 국제 회선(CN2 GIA, CMI, AS9929)을 갖춘 데이터 센터를 선택하십시오.
  </Card>

  <Card title="홍콩 / 싱가포르" icon="network">
    좋은 절충안입니다: 중국 본토까지의 지연 시간은 낮고(30-80ms), APAC에서의 Cloudflare 연결성도 뛰어납니다.
  </Card>

  <Card title="저가 VPS는 피하십시오" icon="triangle-alert">
    저가 호스팅은 국제 egress가 심하게 혼잡한 경우가 많아 피크 시간대에는 수십 KB/s까지 떨어질 수 있습니다. CDN 의존도가 높은 워크로드에는 권장하지 않습니다.
  </Card>
</CardGroup>

### 옵션 4: 다른 호스트를 통해 릴레이합니다(최후 수단)

서버가 정말로 Cloudflare에 빠르게 도달할 수 없고 리전을 바꿀 수도 없다면:

1. **해외 서버를 릴레이로 사용합니다**: 먼저 해외 서버에 다운로드한 다음, 사설/프리미엄 링크를 통해 다시 전송합니다
2. **자체 오브젝트 스토리지를 통해 릴레이합니다**: 에셋을 자체 OSS / COS / S3(예: 중국 리전 버킷)로 미러링한 뒤, 거기서 제공합니다
3. **사전 웜업 및 캐시**: 백엔드에서 한 번 다운로드한 뒤 이후 요청은 로컬 캐시에서 제공합니다

<Warning>
  **만료 시간에 유의하십시오**

  APIYI가 이미지/동영상용으로 반환하는 CDN URL은 일반적으로 유효 기간이 제한되어 있습니다(반환된 URL을 확인하십시오). 나중에 링크가 깨지는 것을 방지하려면 콜백이 도착하는 **즉시** 에셋을 다운로드하여 자체 스토리지에 보관하십시오.
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="내 노트북은 빠른데 서버는 왜 느립니까?">
    가정용 광대역은 ISP를 통해 최적화된 국제 경로를 사용하는 경우가 많지만, 클라우드 서버는 데이터센터의 국제 송출을 거치므로 품질 차이가 크게 날 수 있습니다. 먼저 DC의 국제 대역폭을 확인한 뒤 위의 문제 해결 단계를 따르십시오.
  </Accordion>

  <Accordion title="DNS를 바꿨는데도 여전히 느립니다. 왜 그렇습니까?">
    DNS는 어느 CDN 엣지로 해석되는지만 영향을 줍니다. 기본 국제 대역폭이 이미 혼잡하다면 DNS 변경만으로는 도움이 되지 않습니다. 리전을 변경하거나 해외 호스트를 통해 릴레이하는 것을 고려하십시오.
  </Accordion>

  <Accordion title="Cloudflare R2는 중국 본토에서 차단됩니까?">
    Cloudflare는 중국 본토에서 차단되지 않지만, 국제 송출은 피크 시간대에 혼잡해질 수 있고 일부 ISP는 최적이 아닌 경로를 사용하므로 접근 품질이 일관되지 않을 수 있습니다. 이는 일반적인 국경 간 네트워킹 문제이며 R2 자체의 문제는 아닙니다.
  </Accordion>

  <Accordion title="동영상 다운로드가 계속 실패합니다. 무엇을 할 수 있습니까?">
    **재개**를 지원하는 다운로드 도구를 사용하십시오. 예를 들어 `aria2c` 또는 `wget -c`처럼 적절한 타임아웃과 재시도를 설정합니다:

    ```bash theme={null}
    aria2c -x 8 -s 8 -c --max-tries=10 --retry-wait=3 "<CDN URL>"
    ```
  </Accordion>

  <Accordion title="APIYI가 CDN URL 대신 Base64를 반환할 수 있습니까?">
    동영상은 크기가 크며(수십 MB에서 수백 MB), Base64는 재개 지원 없이 약 33%의 오버헤드를 추가하므로 실제로 더 느리고 대역폭을 낭비합니다. 대용량 파일에는 Base64를 **권장하지 않습니다**. 일부 이미지 엔드포인트는 Base64 응답을 지원합니다. 관련 API 문서를 참조하십시오.
  </Accordion>

  <Accordion title="병목이 CDN이 아니라 제 네트워크라는 것을 어떻게 확인합니까?">
    해외 호스트(AWS Tokyo, Singapore 등)에서 동일한 `curl` 테스트를 실행하십시오. 그곳에서는 빠른데 서버에서는 느리다면, 병목은 서버와 Cloudflare 사이에 있는 것이며 CDN 자체의 문제는 아닙니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="네트워크 프록시 구성" icon="network" href="/ko/faq/network-proxy">
    국제 연결이 불안정할 때의 프록시 옵션
  </Card>

  <Card title="APIYI 서버는 어디에 있습니까?" icon="server" href="/ko/faq/server-location">
    APIYI 서버 위치와 지연 시간을 알아봅니다
  </Card>

  <Card title="Veo 동영상 생성 API" icon="video" href="/en/api-capabilities/veo/overview">
    동영상 API의 출력 형식과 URL 유효성
  </Card>

  <Card title="지원팀에 문의" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    아무 도움이 되지 않으면 저희 팀이 도와드립니다
  </Card>
</CardGroup>

<Info>
  **지원팀과 공유할 정보**

  문의하실 때에는 다음을 포함해 주십시오:

  * 구체적인 CDN URL(민감한 매개변수는 가릴 수 있습니다)
  * 서버 지역 / DC / 클라우드 제공업체
  * 전체 `mtr` 또는 `traceroute` 출력
  * 위의 `curl` 타이밍 명령 출력
  * 문제가 발생한 시간대(국경 간 링크 모니터링과의 연관성 파악에 도움이 됩니다)
</Info>
