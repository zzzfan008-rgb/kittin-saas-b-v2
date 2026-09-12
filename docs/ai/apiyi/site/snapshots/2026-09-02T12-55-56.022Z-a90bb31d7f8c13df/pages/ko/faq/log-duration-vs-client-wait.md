> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 로그에는 호출이 완료되고 과금되었다고 나오지만, 제 클라이언트는 응답을 받지 못했습니다 — 어떻게 문제를 해결하나요?

> 콘솔 로그의 지속 시간은 게이트웨이가 처리를 끝내는 시점까지만 포함하며, 반면 클라이언트는 마지막 바이트와 연결의 종료 신호를 기다립니다. 이 페이지에서는 그 차이가 어디에서 발생하는지 측정하는 방법, 두 서버 간 처리량을 벤치마킹하는 방법, 그리고 계측이 기록해야 하는 필드가 무엇인지 보여줍니다.

## 짧은 답변

<Info>
  **콘솔 로그의 지속 시간과 클라이언트의 타임아웃은 같은 구간을 측정하지 않습니다.**

  * 로그의 지속 시간은 **게이트웨이가 처리를 완료하는 시점**까지 계산됩니다.
  * 클라이언트는 **응답 본문의 마지막 바이트가 도착하고 연결이 완료되었음을 알릴 때**까지 끝난 것이 아닙니다.

  따라서 “로그에는 280초에 완료되었다고 나오는데, 600초 타임아웃이 지나도 데이터가 오지 않았다”는 상황은 충분히 가능합니다 — **그리고 그 요청은 실제로 성공했고 실제로 과과금되었습니다**. 그 차이는 로그가 전혀 포함하지 않은 구간에 있습니다.

  이 페이지에서는 그 차이를 **측정**하고, 특정 구간으로 정확히 짚어내며, 올바른 원인으로 처리하는 방법을 보여드립니다.
</Info>

이 페이지는 **대용량 응답을 반환하는 비스트리밍 호출**에 대한 내용입니다. base64를 반환하는 이미지 엔드포인트가 대표적인 경우이며(응답 본문은 수 MB에서 수십 MB까지 커질 수 있음), 비스트리밍 장문 텍스트 출력도 동일하게 동작합니다. 스트리밍 호출과 작은 응답은 일반적으로 영향을 받지 않습니다.

## 로그의 지속 시간이 실제로 포함하는 범위

한 호출의 전체 지연 시간은 다섯 구간으로 나뉩니다:

```
client total = connect + request upload + upstream generation + response download + waiting for finish signal
                                    └─ the console log's duration covers only this ─┘
```

| 구간                  | 시간을 소비하는 항목                                         | 콘솔 로그에 집계됩니까?              |
| ------------------- | --------------------------------------------------- | -------------------------- |
| 연결(DNS / TCP / TLS) | 사용자의 네트워크가 당사 진입 지점에 도달하는 과정                        | ❌                          |
| 요청 업로드              | 사용자의 **업스트림** 대역폭입니다. 참조 이미지가 있으면 요청 본문도 수 MB에 이릅니다 | ❌                          |
| 업스트림 생성             | 모델이 실제로 생성하는 과정                                     | ✅ **이것이 사용자가 보는 지속 시간입니다** |
| 응답 다운로드             | 사용자의 **다운스트림** 대역폭이며, 동시 실행 수와 강하게 연관됩니다            | ❌                          |
| 종료 신호를 기다리는 시간      | HTTP chunked transfer의 마지막 청크                       | ❌                          |

<Warning>
  **이 차이는 어떤 로그 필드에도 나타나지 않습니다.**

  당사는 내부에서 제어된 raw-socket 비교를 수행했습니다. 같은 요청 배치에 대해 백엔드는 성공 상태와 함께 5초의 지속 시간을 기록했지만, 클라이언트는 완전한 응답을 받기까지 실제로 37~~40초를 기다렸습니다. 그 31~~35초는 **게이트웨이가 처리를 마친 뒤**에 발생했으며, 어떤 지속 시간 필드에도 기록되지 않았습니다.

  즉, **“내 쪽에서는 엄청 오래 걸렸다”는 주장을 반박하려고 로그 지속 시간을 인용해도 아무 의미가 없습니다** — 두 숫자는 애초에 충돌한 적이 없습니다. 문제를 찾으려면 클라이언트에서 구간별 시간을 측정해야 합니다.
</Warning>

콘솔과 [Log Query API](/ko/api-capabilities/log-query)에서 확인할 수 있는 필드: `duration_for_view`(호출 지속 시간, 초 단위), `is_stream`, 그리고 `request_id`(문제를 보고할 때는 이 값을 인용하십시오).

## 1단계: curl 한 번으로 간격을 세그먼트에 고정합니다

이것이 아래 모든 내용의 진입점입니다. 먼저 실행한 다음, 어떤 섹션이 적용되는지 판단하십시오.

```bash theme={null}
curl -sS -o /dev/null --max-time 900 \
  -w 'connect=%{time_connect} pretransfer=%{time_pretransfer} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} speed=%{speed_download}\n' \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST https://api.apiyi.com/v1/images/generations \
  -d '{"model":"gpt-image-2-vip","prompt":"a watercolor mountain village","size":"2048x2048"}'
```

세 가지 파생 지표는 그 원시 수치를 의미 있는 세그먼트로 변환합니다:

| 지표          | 공식                               | 의미                                 |
| ----------- | -------------------------------- | ---------------------------------- |
| 업로드 시간      | `pretransfer − connect`          | 요청 본문을 전송하는 데 걸린 시간                |
| 생성 시간       | `ttfb − pretransfer`             | **≈ 콘솔 로그에 표시된 지속 시간**             |
| 다운로드 시간     | `total − ttfb`                   | 응답 본문을 수신하는 데 걸린 시간                |
| 유효 다운스트림 속도 | `size_download / (total − ttfb)` | 또는 `speed_download`(바이트/초)만 확인하십시오 |

### 결과 읽기

아래 표와 여러분의 수치를 대조하십시오. 다음에 무엇을 해야 할지 이 표가 결정합니다:

| 관찰한 내용                                                 | 간격이 떨어진 위치                   | 다음 단계                                                                          |
| ------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------ |
| `ttfb` ≈ 로그 지속 시간이고, `total` ≈ `ttfb`                  | 간격 없음 — 모델 자체가 단순히 느립니다      | 타임아웃을 늘리십시오. [API 타임아웃을 피하려면 어떻게 해야 합니까?](/ko/faq/timeout-configuration)를 보십시오 |
| `total − ttfb`이 크고, `speed_download`이 낮음               | **다운스트림 대역폭**                | 이 페이지의 처리량 및 페이로드 크기 섹션                                                        |
| `total − ttfb`이 크지만, 바이트 수는 한참 전에 도착했고 그 뒤로 새로운 내용이 없음 | **종료 신호가 오지 않았습니다**          | [이미지 요청 완료 정체](/ko/api-capabilities/image-tail-stall)                          |
| `pretransfer − connect`이 큼                             | **업로드가 느립니다** — 참조 이미지가 너무 큼 | 각 입력 이미지를 1.5MB 이하로 압축하십시오                                                     |
| `ECONNRESET` / 전송 중 SSL EOF                            | **다운스트림 연결 끊김**              | [이미지 API 연결 끊김](/ko/api-capabilities/image-connection-drops)                   |
| curl은 정상인데 애플리케이션 코드만 타임아웃 발생                          | **클라이언트 측**                  | 이 페이지의 “놓치기 쉬운 클라이언트 측 원인 3가지”                                                 |

<Tip>
  한 번의 실행만으로는 충분하지 않습니다. 이 종류의 문제는 **시간 창 단위로 나타납니다** — 어떤 창 안에서는 연속 호출이 모두 영향을 받지만, 그 밖에서는 수십 번의 연속 호출도 완전히 정상입니다. 10번 실행하고 분포를 확인한 뒤, 시간대와 함께 시각을 기록하십시오.
</Tip>

## 2단계: “데이터는 도착했지만 연결은 끝나지 않았다” 측정하기

표가 세 번째 행을 가리킨다면 더 세밀하게 관찰해야 합니다: 응답을 청크 단위로 읽으면서 각 청크의 도착 시각과 그 사이의 간격을 기록하십시오. 답해야 할 질문은 — **마지막 byte가 도착한 뒤 연결은 얼마나 더 유지되었습니까?**

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json, os, time, urllib.request

    body = json.dumps({
        "model": "gpt-image-2-vip",
        "prompt": "a watercolor mountain village",
        "size": "2048x2048",
    }).encode()

    req = urllib.request.Request(
        "https://api.apiyi.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": "Bearer " + os.environ["APIYI_API_KEY"],
            "Content-Type": "application/json",
        },
    )

    t0 = time.monotonic()
    resp = urllib.request.urlopen(req, timeout=900)
    ttfb = time.monotonic() - t0            # headers arrived ≈ generation finished

    chunks, total, last = [], 0, time.monotonic()
    while True:
        buf = resp.read(65536)
        now = time.monotonic()
        if not buf:
            break
        total += len(buf)
        chunks.append((round(now - t0, 3), round(now - last, 3), total))
        last = now
    t_end = time.monotonic() - t0

    transfer = t_end - ttfb
    max_gap = max((gap for _, gap, _ in chunks), default=0)
    p99_at = next((t for t, _, cum in chunks if cum >= total * 0.99), ttfb)

    print(json.dumps({
        "ttfb_s": round(ttfb, 2),                 # ≈ the console log duration
        "transfer_s": round(transfer, 2),         # download
        "total_s": round(t_end, 2),               # what you actually experienced
        "body_bytes": total,
        "down_KBps": round(total / 1024 / transfer, 1) if transfer > 0.001 else None,
        "max_gap_s": max_gap,                     # largest silence between chunks
        "tail_99_s": round(t_end - p99_at, 2),    # how long the last 1% took
    }))
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const t0 = Date.now();
    const resp = await fetch("https://api.apiyi.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2-vip",
        prompt: "a watercolor mountain village",
        size: "2048x2048",
      }),
    });
    const ttfb = (Date.now() - t0) / 1000;

    const reader = resp.body.getReader();
    const curve = [];
    let total = 0, maxGap = 0, last = Date.now();
    while (true) {
      const { done, value } = await reader.read();
      const now = Date.now();
      if (done) break;
      total += value.length;
      maxGap = Math.max(maxGap, (now - last) / 1000);
      curve.push([(now - t0) / 1000, total]);
      last = now;
    }
    const totalS = (Date.now() - t0) / 1000;
    const p99At = (curve.find(([, cum]) => cum >= total * 0.99) || [ttfb])[0];

    console.log({
      ttfb_s: ttfb,
      transfer_s: totalS - ttfb,
      total_s: totalS,
      body_bytes: total,
      down_KBps: total / 1024 / (totalS - ttfb),
      max_gap_s: maxGap,
      tail_99_s: totalS - p99At,
    });
    ```
  </Tab>
</Tabs>

**검출 임계값**: 30초를 초과한 `tail_99` 또는 30초를 초과한 `max_gap`는 한 번의 "tail stall"로 간주합니다. 특징은 byte 수가 이미 100%에 도달한 시점에서 발생하는 `max_gap`입니다 — 모든 byte가 도착한 뒤에야 기다림이 시작됩니다.

<Warning>
  **세 단계를 하나의 timeout 값으로 묶지 마십시오.**

  이것이 가장 쉬운 함정입니다: “첫 byte를 기다리는 중”과 “전송을 기다리는 중”에 하나의 timeout을 사용하면, 근본 원인이 완전히 다른 두 문제를 구분할 수 없는 하나의 실패로 합쳐 버립니다.

  | 단계                       | 의미                                      | 권장 값      |
  | ------------------------ | --------------------------------------- | --------- |
  | 첫 byte를 기다리는 중           | 업스트림이 생성 중입니다 — **느리다고 해서 고장난 것은 아닙니다** | 120–180 s |
  | 청크 사이의 침묵                | 전송은 시작되었지만, 그다음에 멈췄습니다                  | 20–30 s   |
  | 데이터가 완료된 뒤 종료 신호를 기다리는 중 | 유예 구간입니다. 이 시간을 넘기면 선제적으로 종료하십시오        | 3–5 s     |

  이들을 분리하면 로그만 봐도 그것이 “느린 생성”인지, 아니면 “전달되었지만 끝나지 않음”인지 바로 알 수 있습니다 — 추측할 필요가 없습니다.
</Warning>

## 3단계: 두 서버 간 처리량 벤치마킹

### 직접 소유한 두 머신 간

실제 처리량을 측정하려면 `iperf3`를 사용하십시오 — 가장 정확한 옵션입니다:

```bash theme={null}
# Server side (the machine being measured)
iperf3 -s

# Client side: forward direction, 30 seconds, 4 parallel streams
iperf3 -c <server-ip> -t 30 -P 4

# Add -R for the reverse direction — check both; image bottlenecks are downstream
iperf3 -c <server-ip> -t 30 -P 4 -R
```

### 서버에서 저희 API로

**`iperf3`는 이 구간에서는 사용할 수 없습니다** — 저희는 iperf 서버를 운영하지 않습니다. 대신 실제 호출을 통해 실효 속도를 측정하십시오:

```bash theme={null}
# 10 runs; take the median speed_download as your effective downstream bandwidth (bytes/sec)
for i in $(seq 1 10); do
  curl -sS -o /dev/null --max-time 900 \
    -w '%{time_starttransfer} %{time_total} %{size_download} %{speed_download}\n' \
    -H "Authorization: Bearer $APIYI_API_KEY" -H "Content-Type: application/json" \
    -X POST https://api.apiyi.com/v1/images/generations \
    -d '{"model":"gpt-image-2-vip","prompt":"test","size":"1024x1024"}'
done
```

링크 품질 확인과 함께 사용하십시오:

```bash theme={null}
mtr -rwzbc 100 api.apiyi.com        # per-hop packet loss and latency
ss -tin state established           # TCP retransmits, RTT, congestion window
```

<Warning>
  **측정 표가 “끝 신호가 오지 않았습니다”를 가리킨다면, `mtr`과 `ping`는 여기서는 쓸모가 없습니다.** 그 경우 바이트 하나도 손실되지 않았고 링크 품질도 양호하므로, 이러한 도구들은 아무 문제도 보여주지 않을 것입니다 — 즉, 엉뚱한 원인을 추적하게 됩니다. 네트워크를 조사하기 전에 위 스크립트로 자신이 어느 범주에 속하는지 확인하십시오.
</Warning>

### 대역폭이 충분한지 확인하십시오

이미지 응답 본문은 base64가 하나로 뭉친 덩어리입니다. 측정된 크기는 다음과 같습니다:

| 경우                      | 응답 본문    |
| ----------------------- | -------- |
| `gpt-image-2` 계열, 기본 크기 | 약 2.6 MB |
| Gemini 계열, 2K           | 약 13 MB  |
| Gemini 계열, 4K           | 약 35 MB  |

Base64 인코딩 자체가 페이로드를 대략 33% 팽창시킵니다. 자기 자신과의 링크를 기준으로 한 다운로드 시간은 다음과 같습니다:

| 아웃바운드 대역폭 | 2.6 MB | 13 MB  | 35 MB |
| --------- | ------ | ------ | ----- |
| 100 Mbps  | 0.2 s  | 1.0 s  | 2.8 s |
| 10 Mbps   | 2.1 s  | 10.4 s | 28 s  |
| 2 Mbps    | 10.4 s | 52 s   | 140 s |

**문제는 이 표가 자기 자신과의 링크가 있다고 가정한다는 점입니다.** 실제로는:

```
bandwidth per request = egress bandwidth ÷ requests in flight
```

예를 들어 10 Mbps 아웃바운드, 이미지 요청 30개 동시 실행, 응답당 2.6 MB라면 — 각 요청은 대략 0.04 MB/s를 받게 되므로 **다운로드만 62초가 걸립니다**, 그리고 그 62초 중 어느 1초도 콘솔 로그에 나타나지 않습니다. 동시 실행 수를 두 배로 늘리면 그 수치도 두 배가 됩니다.

<Tip>
  이것이 바로 “혼잡한 낮에는 시간이 초과되지만 밤에는 같은 코드가 잘 동작합니다”라는 현상의 이유입니다. 모델이 느려진 것이 아니라, 대역폭이 더 많은 요청에 나뉘어 사용되고 있는 것입니다.
</Tip>

## 단계 4: 계측이 기록해야 하는 필드

증상을 정확히 설명하려면 — 자체 분석을 위해서든 저희에게 보내기 위해서든 — 호출마다 최소한 다음 항목을 기록하십시오.

| 필드                   | 가져오는 방법                                                            | 중요한 이유                                                 |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| 요청 ID                | 응답 헤더; 모델에 따라 이름이 다릅니다(`request-id` 또는 `x-request-id`), 둘 다 확인하십시오 | 백엔드 로그에서 저희가 조회하는 값입니다                                 |
| 시작 시간                | 클라이언트 로컬 시간, **시간대 포함**                                            | 백엔드 로그 및 장애 발생 구간과 맞추기 위해서입니다                          |
| 첫 바이트까지의 시간          | `ttfb`                                                             | 백엔드 소요 시간과 비교하기 위해서입니다                                 |
| 마지막 바이트 시간           | 최종 청크가 도착한 시점                                                      | 전체 시간과의 차이가 완료 신호를 기다린 유휴 대기 시간입니다                     |
| 총 시간                 | 완전한 응답을 받을 때까지의 시간                                                 | 실제로 체감한 시간입니다                                          |
| 응답 본문 바이트 수          | 읽어들인 바이트의 합계                                                       | 속도를 계산하고 완전성을 확인하기 위해서입니다                              |
| 다운스트림 속도             | 바이트 ÷ 다운로드 시간                                                      | 속도가 낮으면 대역폭 문제입니다                                      |
| **그 시점의 진행 중인 요청 수** | 자체 동시 실행 수 카운터                                                     | **가장 중요한 열**입니다. 이것이 없으면 느림과 동시 실행 수를 상관관계로 연결할 수 없습니다 |

마지막 열은 사람들이 자주 건너뛰지만, 사실 결론 그 자체인 경우가 많습니다. 속도와 동시 실행 수를 그래프로 그려서 동시 실행 수가 늘어날수록 속도가 비례해서 떨어진다면, 병목은 대역폭이며 더 찾을 것은 없습니다.

**표를 사용하는 방법**: 콘솔 로그의 `duration_for_view`와 나란히 놓고 보십시오 —

* 서로 가깝다면 → 문제는 다운스트림 전송입니다. 대역폭과 동시 실행 수를 살펴보십시오;
* 서로 멀다면 → 문제는 완료 신호 또는 클라이언트 측입니다.

## 즉시 위험을 줄이는 4가지 방법

<Steps>
  <Step title="URL 출력으로 전환하십시오 — 가장 효과가 큰 변경입니다">
    `gpt-image-2-vip` 및 `gpt-image-2-all`은 `response_format: "url"`를 지원하며, base64 대신 이미지 링크를 반환합니다. **응답 본문이 약 2.6 MB에서 약 0.3 KB로 줄어듭니다** — 작은 응답에는 `Content-Length`가 포함되고 클라이언트가 자체적으로 완료 시점을 알 수 있으므로, 다운로드 문제와 종료 신호 문제를 동시에 해결합니다.

    비즈니스가 URL 출력에 의존한다면, token의 그룹을 `image2_OSS`으로 전환하십시오: 리소스 압박이 있어도 base64로 저하되지 않는 결정적 URL 출력이며, **마크업 없는 1x 요율 배수**입니다.

    <Warning>
      공식 릴레이 `gpt-image-2`은 이 매개변수를 **지원하지 않으며**, 전송하면 400 `unknown_parameter`를 반환합니다. 현재 Base64가 유일한 출력 경로입니다.
    </Warning>
  </Step>

  <Step title="응답 본문을 줄이십시오">
    base64를 계속 사용해야 한다면: `output_format=jpeg`과 `output_compression`를 사용하면 PNG보다 크기가 절반 이상 줄어듭니다. 4K를 기본값으로 두지 말고, `size`와 `quality`를 실제로 필요한 수준으로 낮추십시오. 입력 참고 이미지를 1.5MB 이하로 압축하면 업로드 측에도 도움이 됩니다.
  </Step>

  <Step title="동시 실행 수를 대역폭이 지원하는 수준으로 제한하십시오">
    위 공식을 뒤집으면 됩니다: 허용 가능한 다운로드 시간 × 송신 대역폭 ÷ 이미지당 크기가 동시 실행 수의 상한입니다. 이를 넘어서면 동시 실행 수를 늘려도 총 처리량은 늘지 않고 각 요청만 더 느려집니다. 모델별 제한은 [얼마나 많은 동시 실행 수를 사용할 수 있습니까?](/ko/faq/api-concurrency)에서 확인할 수 있습니다.
  </Step>

  <Step title="타임아웃을 세 가지로 나누고, 데이터가 완료되면 능동적으로 종료하십시오">
    첫 바이트, 청크 간, 종료 유예 타임아웃을 위에서 설명한 대로 각각 따로 설정하십시오. 데이터가 완료되었지만 종료 신호가 끝내 도착하지 않으면, 이미 보유한 응답을 애플리케이션에 넘기십시오 — 완전한 호환 코드는 [이미지 요청 종료 지연](/ko/api-capabilities/image-tail-stall)에 있습니다.
  </Step>
</Steps>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="결과를 받지 못했는데 왜 계속 과금됐습니까?">
    과금은 **게이트웨이가 처리를 끝낼 때** 발생하며, 그 시점에는 상위 시스템이 실제로 결과를 생성해 반환한 상태이기 때문입니다. 클라이언트가 그 결과를 실제로 수신하느냐는 이미 발생한 비용을 바꾸지 않습니다. 측정 비교로 보면, 5초에 연결이 끊긴 클라이언트는 끝까지 실행된 클라이언트와 **정확히 같은 금액**이 과금됩니다.

    이를 거꾸로 해석하면 이것이 가장 강력한 진단 단서입니다: **과금 기록이 있다는 것은 요청이 실제로 상위 시스템에 도달해 성공했다는 의미**이므로, 문제는 게이트웨이가 처리를 끝낸 뒤에 있거나, 요청이 실제로 전송되기 전 단계에 있어야 합니다. 상위 시스템을 의심할 필요는 없습니다.

    이미지 엔드포인트에는 비동기 작업 ID가 없으므로 연결을 끊으면 결과를 잃게 됩니다. [비동기 이미지 API가 있습니까?](/ko/faq/image-async-api)를 보십시오.
  </Accordion>

  <Accordion title="타임아웃을 600초에서 1200초로 늘리면 도움이 됩니까?">
    경우에 따라 다르며, 바로 그렇기 때문에 무엇이든 바꾸기 전에 먼저 측정해야 합니다:

    * **느린 다운로드** (전송률이 낮고 바이트 수가 계속 증가함): 예, 늘리면 결과를 받을 수 있습니다.
    * **완료 신호가 끝내 오지 않음** (바이트 전송은 오래전에 끝났고, 끝부분에 새 바이트가 전혀 없음): **아니요**. 이 상태에서 추가로 330초 동안 계속 기다리는 것을 측정했지만 새 바이트는 한 개도 없었습니다. 타임아웃을 더 길게 잡아도 알아차리는 시점만 늦출 뿐입니다. 이 경우에는 클라이언트에서 능동적으로 완료 처리를 해야 합니다.
  </Accordion>

  <Accordion title="이 문제가 제 문제입니까, 아니면 게이트웨이 문제입니까?">
    어느 쪽이든 가능하므로 먼저 측정해야 합니다. 양쪽에 대한 기준은 다음과 같습니다:

    * **사용자 쪽을 가리킴**: 명확하게 낮은 `speed_download`, 동시 실행 수가 늘수록 떨어지는 전송률, `mtr`의 패킷 손실, 또는 curl은 정상인데 애플리케이션 코드만 시간 초과하는 경우입니다.
    * **저희 쪽을 가리킴**: 바이트 전송은 오래전에 끝났는데 끝부분에 새 데이터가 전혀 없는 상태가 길게 이어지는 경우입니다. 게이트웨이에는 실제로 “지연된 완료 신호” 문제가 있었는데, 그 근본 원인은 이미지 경로의 과금 회계가 요청 처리를 막고 있던 것이었습니다. 이는 **2026년 8월 13일** 상위 릴리스로 수정 및 검증되었습니다. 완전히 정상적인 기간에도 요청의 약 4%는 데이터가 이미 모두 전달된 상태에서 완료 신호를 받기 위해 10\~79초를 추가로 기다립니다.

    측정한 세그먼트별 값이 있으면 보내 주십시오. “느립니다”보다 훨씬 실행 가능한 정보입니다. 포함해야 할 항목은 다음 섹션에 있습니다.
  </Accordion>

  <Accordion title="비동기 API가 있습니까? 연결을 계속 열어 두고 싶지 않습니다">
    이미지 생성은 현재 전반적으로 동기식이며, 작업 ID 조회 엔드포인트는 없습니다. 비동기 옵션은 로드맵에 있으며, 출시되면 별도로 공지할 예정입니다.

    그때까지는 자체적으로 비동기 셸을 감싸는 방식을 권장합니다(제출 시 로컬 작업 ID를 반환하고, 백그라운드 워커가 동기 호출을 수행하게 함); [자체 비동기 큐 구축하기](/ko/api-capabilities/image-async-queue)를 보십시오.
  </Accordion>

  <Accordion title="엔드포인트나 머신을 바꿔서 우회할 수 있습니까?">
    어떤 종류의 문제인지에 따라 다릅니다. 대역폭 부족은 사용자 측 송신 회선의 속성이라서, 저희 진입 주소를 바꿔도 아무런 효과가 없습니다 — 더 많은 대역폭, 더 작은 페이로드, 또는 더 낮은 동시 실행 수가 필요합니다. 완료 신호 부류는 창 내의 여러 진입 지점에서 동시에 나타났다가 동시에 복구되었으므로, 도메인을 바꿔도 우회되지 않습니다.

    피해야 할 주소는 CDN 노드입니다: `api-cf.apiyi.com`는 Cloudflare를 통해 동작하며 약 100초에서 `524`를 반환하므로, 긴 이미지 요청에는 적합하지 않습니다.
  </Accordion>
</AccordionGroup>

## 쉽게 놓치는 클라이언트 측 원인 세 가지

curl 측정이 정상이고 애플리케이션 코드에서만 타임아웃이 발생한다면, 여기에서 확인하십시오:

1. **타임아웃이 여러분이 생각하는 의미가 아닐 수 있습니다.** 600초가 전체 타임아웃입니까, 아니면 읽기 타임아웃만입니까? Node의 `undici`에는 서로 독립적인 타임아웃 세 가지 — `headersTimeout`, `bodyTimeout`, `connect.timeout` — 가 있으며, 기본값은 바깥 레이어에서 설정한 값보다 훨씬 낮고, 바깥쪽 값만 바꿔서는 아무 효과가 없습니다.
2. **커넥션 풀 대기열입니다.** 풀이 포화되면 시계는 요청이 실제로 전송되기 전에 시작됩니다. 그 대기 시간은 저희에게 완전히 보이지 않습니다 — 요청이 실제로 나갈 때까지 백엔드 로그에는 해당 요청의 기록이 없습니다. 진단: 일치하는 로그 기록이 없으면 일반적으로 이 경우입니다.
3. **그 사이에 또 다른 레이어가 있습니다.** 자체 호스팅 nginx는 기본적으로 `proxy_read_timeout`를 60초로 설정하며, 로드 밸런서, API 게이트웨이, 서버리스 플랫폼은 각각 자체 상한을 적용합니다. 각 홉의 타임아웃을 모두 확인하십시오. 가장 작은 값이 실제 타임아웃입니다.

## 보고할 때 포함할 내용

자체 점검 후에도 도움이 더 필요하면, 여러 번 주고받는 일을 줄이기 위해 아래 내용을 함께 보내 주십시오.

* **요청 ID** 몇 개면 충분하며, 전체를 모두 보낼 필요는 없습니다
* **세그먼트별 시간**: 첫 바이트까지의 시간 / 마지막 바이트까지의 시간 / 총 시간 / 응답 본문 bytes
* **발생 시각**, 시간대를 포함하여(예: `2026-08-13 15:57 (UTC+8)`)
* 당시의 **동시 실행 수**와 출력 대역폭
* 사용 중이던 **모델**과 **token 그룹**

## 관련 문서

<CardGroup cols={2}>
  <Card title="API 타임아웃을 피하려면 어떻게 해야 합니까?" icon="timer" href="/ko/faq/timeout-configuration">
    시나리오별 권장 타임아웃과 엔드포인트 선택
  </Card>

  <Card title="이미지 요청 종료 지연" icon="hourglass" href="/ko/api-capabilities/image-tail-stall">
    데이터는 완료되었지만 연결이 끝나지 않을 때의 클라이언트 측 처리
  </Card>

  <Card title="이미지 API 연결 끊김" icon="unplug" href="/ko/api-capabilities/image-connection-drops">
    ECONNRESET 및 SSL EOF 유형의 다운스트림 연결 종료 문제 진단
  </Card>

  <Card title="얼마나 많은 동시 실행 수를 사용할 수 있습니까?" icon="gauge" href="/ko/faq/api-concurrency">
    모델별 동시 실행 수 제한과 쿼터 요청
  </Card>

  <Card title="이미지 API 모범 사례" icon="image" href="/ko/api-capabilities/image-api-best-practices">
    모델별 타임아웃 치트시트 및 출력 형식 비교
  </Card>

  <Card title="로그에서 과금 금액 읽기" icon="receipt" href="/ko/faq/log-billing-explained">
    각 콘솔 로그 열의 의미와 과금 기록 방식
  </Card>
</CardGroup>

## 문의하기

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [지원팀에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    이미지 타임아웃 및 느린 다운로드 진단
  </Card>

  <Card title="이메일" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **영업**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
