> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 데이터가 도착한 뒤에도 멈춰 있는 이미지 요청

> 이미지는 완전히 도착했지만 연결이 끝나지 않아, 클라이언트는 자체 타임아웃이 발생할 때까지 기다립니다. 원인, 이를 식별하는 방법, 그리고 기존 호출 위에 얹는 호환 레이어로서 응답을 직접 끝내는 클라이언트 측 코드입니다. 대체 수단이 아닙니다.

<Info>
  **한 줄 답변**: 이미지 데이터는 **완전하며** 문제없이 디코딩되는 정상적인 이미지로 변환됩니다. 멈추는 지점은 HTTP 전송의 아주 마지막 단계, 즉 클라이언트에 “이것으로 끝입니다”라고 알리는 부분입니다. 따라서 올바른 해결책은 더 긴 timeout도 아니고 retry도 아니라, **데이터가 도착한 뒤 응답을 직접 마무리하고, 이미 가지고 있는 이미지를 사용하는 것**입니다.
</Info>

<Warning>
  ### 이것은 **대체**가 아니라 **호환성**입니다

  아래 코드는 **기존 호출 로직 주변에** 보호 계층을 추가합니다. 통합하는 방식이 전혀 다른 것은 아닙니다:

  * endpoint를 바꾸거나, 모델을 전환하거나, SDK를 교체하거나, 어떤 요청 매개변수도 조정할 필요가 **없습니다**;
  * 정상적인 요청은 지금과 똑같은 경로를 그대로 따릅니다 — **동작은 변하지 않습니다**. 이 호환성 로직은 정상적인 요청에서는 아예 트리거되지 않습니다;
  * 데이터가 완전히 도착했지만 연결이 끝나기를 거부할 때에만 개입하여, 이미 받은 이미지를 전달합니다.

  요약하면: **이것이 있으면 문제가 있는 경우도 복구할 수 있지만, 이것이 없으면 문제가 있는 경우는 timeout error로만 끝날 수 있습니다.** 그 외의 모든 것은 그대로 유지됩니다.
</Warning>

## 증상

네이티브 이미지 생성 엔드포인트(`POST /v1beta/models/{model}:generateContent`)를 호출할 때 다음과 같은 조합이 보일 수 있습니다.

* 대시보드 로그에는 요청이 **성공**했고 **과금됨**으로 표시됩니다.
* 그런데도 클라이언트는 멈춘 채로 있으며, 자체 read timeout이 발생할 때에만 실패합니다.
* 오류는 `Read timed out`, `ETIMEDOUT`, 또는 `UND_ERR_BODY_TIMEOUT`처럼 보입니다.

“대시보드에는 30초 만에 끝났다고 나오는데, 5분이 지나도 아직 이미지가 없습니다”처럼 느껴질 수 있습니다.

<Warning>
  **예전에는 같은 코드가 잘 동작했는데, 이제는 마지막 단계에서 멈춥니다.** 이 상황은 최근에 생긴 것이며, 통합 방식에 오래전부터 있던 결함이 아닙니다. 따라서 호출 패턴을 다시 의심하실 필요는 없고, 아래에 설명된 호환성 계층만 추가하시면 됩니다.
</Warning>

### 윈도우 단위로 도착합니다

이 점은 재현 방법과 관찰 결과를 해석하는 방식에 영향을 주기 때문에 중요합니다.

* **윈도우 안에서는** 연속 호출이 예외 없이 **모두** 멈춥니다.
* **윈도우 밖에서는** 수십 번의 연속 호출이 완벽하게 동작하며, **단 한 번도** 발생하지 않습니다.

따라서 이것은 “항상 재현됨”도 아니고 “드문 우발적 오류”도 아닙니다. 테스트가 우연히 윈도우를 놓치면 모든 것이 100% 정상처럼 보이므로, 쉽게 “해결됐다”고 잘못 결론 내릴 수 있습니다. 반대로 윈도우 안에 들어가면 모든 것이 망가진 것처럼 보입니다. **두 인상 모두 사실이지만, 둘 중 하나만으로 장기적인 결론을 내리면 안 됩니다.**

<Info>
  **스트리밍** 요청(`:streamGenerateContent`)과 텍스트 전용 모델은 일반적으로 영향을 받지 않습니다. 이 페이지는 **비스트리밍 이미지 생성**에 관한 내용이며, 이 경우 응답 본문이 큽니다. 2K 이미지의 JSON 본문은 약 13 MB 수준입니다.
</Info>

## 원인

이미지 응답은 `Transfer-Encoding: chunked`로 전송됩니다. HTTP/1.1 사양에 따르면 서버가 마지막 데이터 청크를 보낸 뒤에는 클라이언트에게 "여기가 끝입니다"라고 알리기 위해 **종료 청크**(길이가 0인 청크)를 보내야 합니다.

문제가 발생하는 지점이 바로 이것입니다. **모든 데이터 청크는 도착하지만, 종료 청크는 절대 전송되지 않고 연결도 닫히지 않습니다.**

클라이언트는 **완전하고 사용 가능한 JSON 문서**를 그대로 들고 있게 됩니다(이미지는 base64 디코딩이 정상적으로 됩니다). 하지만 본문이 끝났는지 알 방법이 없습니다. 그래서 계속 기다리게 되고 — 결국 자체 읽기 타임아웃이 발생할 때까지 멈추지 않습니다.

비유하자면, **소포는 이미 문 앞에 도착했는데 택배 기사가 "배송 완료"를 누르는 것을 깜빡한 상황입니다.** 패키지가 바로 밖에 있는데도, 사용자는 추적 페이지만 바라보며 업데이트를 기다리게 됩니다.

<Warning>
  특정 시간대에는 해당 경로가 응답에 이 마지막 단계를 수행하지 않습니다. **우리는 서버 측 수정이 적용되도록 계속 압박하고 있습니다**. 이 페이지에서 설명하는 내용은 그 사이에 사용할 **클라이언트 측 안전망**입니다.

  그 안전망은 그 자체로도 가치가 있으며, **서버 측이 수정된 뒤에 되돌릴 필요가 없습니다**. 종료 신호가 있으면 절대 발동하지 않으므로 저절로 조용해집니다 — 오버헤드도 없고 유지보수 부담도 없습니다.
</Warning>

이를 어떻게 처리할지 직접 결정하는 세 가지 결론은 다음과 같습니다.

<CardGroup cols={3}>
  <Card title="데이터는 완전합니다" icon="circle-check">
    패킷 손실도 아니고, 네트워크 품질 문제도 아니며, 전송이 중간에 끊긴 것도 아닙니다. 현재 가진 바이트는 깔끔하게 파싱되며 이미지도 완전히 사용할 수 있습니다.
  </Card>

  <Card title="기다려도 소용없습니다" icon="timer-off">
    한 번 멈추면 서버는 **단 한 바이트도 더 보내지 않습니다**. **330초** 동안 기다려도 변화가 없다는 점이 확인되었습니다. 타임아웃을 수백 초로 늘려도 탐지 시점만 늦어질 뿐입니다.
  </Card>

  <Card title="한 대의 머신에 묶이지 않습니다" icon="server-off">
    한 시간대 안에서는 여러 PoP가 **동시에** 실패하고 **동시에** 복구됩니다. 도메인이나 진입점을 바꿔도 우회되지 않으며, 클라이언트 측에서 처리해야 합니다.
  </Card>
</CardGroup>

## 판별하는 방법

다음 세 가지가 모두 해당하면, 거의 확실히 이것이 문제입니다:

<Steps>
  <Step title="응답에 Transfer-Encoding: chunked가 있고 Content-Length가 없습니다">
    즉, 본문 길이가 처음부터 선언되지 않았으므로 클라이언트는 종료 청크에만 의존해 완료 여부를 알 수 있습니다.
  </Step>

  <Step title="지금까지 받은 바이트는 이미 완전한 JSON으로 파싱됩니다">
    지금 가진 내용에 대해 `json.loads`을 실행해 보십시오 — 성공하며, 안의 `inlineData.data`는 base64로 디코딩하면 완전하고 사용할 수 있는 이미지가 됩니다.
  </Step>

  <Step title="그 파싱이 성공한 뒤에도 오랫동안 새 바이트가 도착하지 않습니다">
    종료 청크도 없고 연결도 닫히지 않습니다. 그냥 열린 채로 유지됩니다.
  </Step>
</Steps>

### 두 가지 비슷한 경우와의 차이

세 경우 모두 비슷해 보이는 오류를 만들지만, 근본 원인과 해결 방법은 완전히 다릅니다. **세 경우에 같은 기준을 적용하지 마십시오:**

| 관찰 사항    | 이 페이지(무기한 대기)                                | 잘림(`ECONNRESET`)       | 종료부가 늦게 온 뒤 연결 끊김           |
| -------- | -------------------------------------------- | ---------------------- | --------------------------- |
| 수신된 바이트  | **전체 본문, JSON이 완전히 파싱됨**                     | 보통 전체 본문보다 부족함         | 전체 본문                       |
| 최종 연결 상태 | **종료부 없음, FIN 없음, 열린 상태 유지**                 | TCP RST 수신             | FIN(정상 종료)                  |
| 실패 시점    | 절대 없음 — 클라이언트가 포기할 때까지(확인됨: 330초 후에도 여전히 없음) | 경우에 따라 다름              | **마지막 바이트 후 +300초**         |
| 대처 방법    | **이미 가진 이미지를 사용하십시오**(이 페이지)                 | 네트워크 경로와 클라이언트를 조사하십시오 | 이 페이지와 같습니다 — 데이터도 이미 완전합니다 |

오류가 `ECONNRESET`라면, 이는 다른 종류의 문제입니다. [Connection Drops](/ko/api-capabilities/image-connection-drops)를 참조하십시오.

## 호환성 레이어: 클라이언트 측에서 응답을 마무리합니다

아이디어는 간단합니다: **연결이 끝날 때까지 기다리지 말고, 이미 받은 바이트가 완전한 JSON으로 파싱되는 즉시 마무리합니다.**

### 중요: 유예 기간을 유지하십시오

파싱이 성공하는 즉시 끝내지 마십시오. 정상적인 경우 종료 청크는 보통 바로 다음 TCP 세그먼트에 있으며, 불과 몇 밀리초 뒤에 도착합니다. 파싱이 성공하자마자 끊어 버리면 “종료자가 몇 밀리초 늦게 도착했다”를 “서버가 아예 보내지 않았다”로 잘못 분류하게 됩니다.

올바른 방법은 다음과 같습니다. 파싱이 성공하면 **잠시 더 기다리십시오**(3\~5초가 좋은 기본값입니다). 그 시간 동안 바이트가 하나라도 도착하면 정상적으로 계속 진행하십시오. 아무것도 도착하지 않을 때에만 정지 상태로 판단하고 스스로 응답을 마무리하십시오.

<Warning>
  **이것은 선택적인 개선 사항이 아닙니다.** 유예 기간을 건너뛰면 탐지가 완전히 무의미해집니다. — **모든 정상 요청이 실패로 잘못 보고됩니다.** 우리의 첫 구현이 정확히 이랬습니다. 정상 요청으로만 이루어진 전체 배치가 손상된 것으로 표시되었습니다.
</Warning>

### 응답을 마무리하기 전에 통과해야 하는 검사

가장 저렴한 것부터 가장 비싼 것 순서입니다. **이 중 하나라도 실패하면 계속 기다리십시오. 응답을 끝내지 마십시오:**

| # | 검사                                   | 이유                                                                  |
| - | ------------------------------------ | ------------------------------------------------------------------- |
| 1 | 연결이 여전히 데이터를 수신 중이며 정상적으로 종료되지 않았습니다 | 정상적으로 종료된 경우에는 기존의 성공 경로를 그대로 사용하면 됩니다                              |
| 2 | HTTP 상태가 2xx입니다                      | 그 밖의 경우는 기존의 오류 처리에 해당합니다                                           |
| 3 | 응답에 `Content-Length`이 없습니다           | 길이가 선언되어 있다면 이 시나리오가 아닙니다. HTTP 클라이언트가 끝까지 처리하도록 두십시오               |
| 4 | 수신한 바이트 수가 최소 크기를 초과합니다              | 작은 오류 응답을 걸러냅니다                                                     |
| 5 | 마지막 시도 이후 바이트 수가 변경되었습니다             | 수십 MB가 넘는 본문을 반복해서 다시 파싱하는 일을 피합니다                                  |
| 6 | 마지막 공백이 아닌 문자가 `}`입니다                | 매우 저렴한 사전 필터입니다. Base64 이미지 데이터에는 `}`이 없으므로, 부분 전송은 거의 항상 여기서 거부됩니다 |
| 7 | 전체 JSON이 성공적으로 파싱됩니다                 | 최종 판정입니다                                                            |

6번과 7번을 함께 적용하면 **오탐률이 거의 0에 가깝게 내려갑니다**: 응답은 단일 JSON 객체이므로, 데이터가 아직 부족한 상태에서는 파싱이 반드시 실패합니다. 다시 말해, **완전히 도착한 응답만 끝낼 수 있습니다**.

### Python

백그라운드 스레드에서 stream을 읽고, 메인 스레드에서 **큐 타임아웃**으로 유예 기간을 구현합니다:

```python theme={null}
import json
import time
import base64
import queue
import threading
import requests

MIN_BYTES = 1024          # check 4: anything smaller cannot be an image


def _pump(raw, q):
    """Background thread: its only job is to push chunks onto the queue."""
    try:
        for chunk in raw.stream(65536, decode_content=True):
            q.put(chunk)
        q.put(None)                       # the server finished normally
    except Exception as exc:              # transport error, re-raised by main
        q.put(exc)


def _try_parse(buf):
    if len(buf) < MIN_BYTES:                    # check 4
        return None
    if not buf.rstrip().endswith(b"}"):         # check 6: cheap pre-filter
        return None
    try:
        return json.loads(buf.decode("utf-8"))  # check 7: the final verdict
    except ValueError:
        return None


def generate_image(url, headers, payload,
                   ttfb_timeout=180, term_grace=5, body_timeout=60):
    """Non-streaming image generation with client-side completion.

    ttfb_timeout: waiting for the first byte. The upstream is generating during
                  this phase — slow is not the same as broken, so leave room.
    term_grace:   how long to wait for the terminating signal once the body is
                  complete. If it never comes, finish the response ourselves.
    body_timeout: how long the whole body may take after the first byte.
    """
    resp = requests.post(url, headers=headers, json=payload,
                         stream=True, timeout=(10, ttfb_timeout))
    resp.raise_for_status()                     # check 2

    if resp.headers.get("Content-Length"):      # check 3
        return resp.json()                      # length declared: let the library finish

    q = queue.Queue()
    threading.Thread(target=_pump, args=(resp.raw, q), daemon=True).start()

    buf = bytearray()
    deadline = time.monotonic() + body_timeout

    while True:
        try:
            item = q.get(timeout=term_grace)
        except queue.Empty:                     # nothing new within the grace period
            obj = _try_parse(buf)
            if obj is not None:
                resp.close()                    # body is complete: finish it ourselves
                return obj
            if time.monotonic() > deadline:
                raise TimeoutError("incomplete body and no new data for a long time")
            continue                            # still incomplete, keep waiting

        if item is None:                        # healthy path: the server finished it
            break
        if isinstance(item, Exception):
            raise item
        buf += item

    obj = _try_parse(buf)
    if obj is None:
        raise ValueError("Incomplete response")
    return obj


def extract_image(obj):
    for cand in obj.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])
    return None
```

<Warning>
  **왜 추가 스레드가 필요한가요?** `requests`는 “첫 바이트를 기다리는 시간”과 “청크 사이를 기다리는 시간”을 모두 관장하는 **단일 읽기 타임아웃**을 가지기 때문입니다. 응답이 멈추면 읽기 루프는 다음 read에서 블록되고, 유예 기간은 실행될 기회를 얻지 못합니다 — 타이머를 사용하는 단순한 `for chunk in ...` 버전은 바로 잡아내려는 바로 그 경우에 **실행되지 않습니다**.

  백그라운드 스레드에서 읽고 메인 스레드에서 `q.get(timeout=term_grace)`를 호출하는 것이 두 타임아웃을 실제로 분리하는 방법입니다. 우리도 직접 이 문제를 겪었습니다. 두 서로 다른 일을 하나의 타임아웃이 덮어버리면 “느린 생성”과 “끝나지 않음”이 구분되지 않는 하나의 실패로 합쳐집니다.
</Warning>

<Note>
  이 버전은 **유예 기간이 만료될 때 한 번만 파싱**하며, 매 청크마다 파싱하지 않습니다 — 따라서 위의 5번 검사를 자연스럽게 만족합니다. 십여 MB가 넘는 본문도 반복해서 파싱되지 않습니다.
</Note>

### Node.js

Node.js는 추가 스레드가 필요 없습니다 — `reader.read()`는 이미 프로미스이므로, `Promise.race`이 다음 청크를 기다리는 시간을 제한할 수 있습니다:

```javascript theme={null}
const TERM_GRACE_MS = 5000;       // how long to wait for the terminating signal
const TOTAL_TIMEOUT_MS = 180000;  // total timeout: must cover upstream generation
const MIN_BYTES = 1024;

async function generateImage(url, headers, payload) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TOTAL_TIMEOUT_MS),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);        // check 2
  if (resp.headers.get("content-length")) return resp.json();  // check 3

  const reader = resp.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    // Promise.race caps how long we wait for the next chunk
    const next = reader.read();
    const timer = new Promise((r) => setTimeout(() => r("GRACE"), TERM_GRACE_MS));
    const winner = await Promise.race([next, timer]);

    if (winner === "GRACE") {
      const parsed = tryParse(chunks, total);
      if (parsed) {                 // body is complete: server never finished
        reader.cancel().catch(() => {});
        return parsed;
      }
      continue;                     // body still incomplete, keep waiting
    }

    const { done, value } = winner;
    if (done) break;                // healthy path: the server finished it
    chunks.push(value);
    total += value.length;
  }

  const parsed = tryParse(chunks, total);
  if (!parsed) throw new Error("Incomplete response");
  return parsed;
}

function tryParse(chunks, total) {
  if (total < MIN_BYTES) return null;                 // check 4
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  const text = new TextDecoder().decode(buf).trimEnd();
  if (!text.endsWith("}")) return null;               // check 6
  try { return JSON.parse(text); } catch { return null; }   // check 7
}
```

<Tip>
  두 스니펫의 **정상 경로** 주석에 주목하십시오: 서버가 응답을 정상적으로 마치면, 루프는 `done` 또는 반복 종료 시점에서 자연스럽게 빠져나가며, 유예 기간 분기로는 결코 들어가지 않습니다. 이것이 실무에서 “대체가 아니라 호환”이 의미하는 바입니다 — 기존 성공 경로는 바이트 단위로 하나도 바뀌지 않습니다.
</Tip>

## 타임아웃 선택

여기서 가장 쉬운 실수는 **서로 다른 두 일에 하나의 timeout 값을 사용하는 것**입니다: "업스트림이 이미지를 생성할 때까지 기다리는 시간"과 "첫 바이트 이후 두 청크 사이의 침묵"입니다. 이 둘의 정상 지속 시간은 자릿수 하나만큼 다릅니다. 이를 하나의 값으로 합치면 느린 생성을 실패로 오판해 중단하거나, 실제로 멈춘 요청을 몇 분씩 기다리게 됩니다.

| 단계                             | 정상 지속 시간                   | 권장               | 이유                                         |
| ------------------------------ | -------------------------- | ---------------- | ------------------------------------------ |
| **첫 바이트를 기다리는 시간** (업스트림 생성 중) | 2K에서 약 \~20–30s, 4K에서는 더 김 | **120–180s**     | 여기서 느린 것은 실패가 아닙니다. 너무 일찍 끊으면 정상 요청이 중단됩니다 |
| 첫 바이트 이후의 **청크 사이 침묵**         | 밀리초                        | **3–5s** (유예 기간) | 이 정도 규모에서 아무 것도 움직이지 않으면 결정하고 끝낼 때입니다      |

<CardGroup cols={2}>
  <Card title="✅ 권장" icon="check">
    두 값을 따로 설정합니다: 첫 바이트 이전에는 생성할 여유를 남기고,
    그다음 청크 사이 침묵은 몇 초 수준으로 유지한 뒤 클라이언트 측
    완료 설정이 나머지를 처리하게 둡니다. 실패는 몇 초 안에 드러나고
    정상 요청은 손상되지 않습니다.
  </Card>

  <Card title="❌ 피하기" icon="ban">
    모든 것을 "혹시 모르니" 300초 타임아웃 하나로 묶는 방식입니다.
    응답이 멈추면 서버는 더 이상 아무 것도 보내지 않으므로, 더 오래 기다려도
    달라지는 것은 없고 감지만 늦어집니다.
  </Card>
</CardGroup>

<Note>
  제품에 4K 같은 더 느린 등급이 포함된다면: **총 타임아웃은 더 길 수 있습니다**(모델이 실제로 그 시간이 필요합니다). 하지만 **청크 사이 침묵 임계값은 그에 따라 커지면 안 됩니다** — 둘은 서로 다른 것이므로 함께 스케일하지 마십시오.
</Note>

<Note>
  Node.js 사용자의 경우: 내장된 `fetch`의 엔진인 undici(Node 18+에서)는 **서로 독립적인 세 개의 timeout**을 가지며, SDK의 `timeout` 옵션은 그 어떤 것도 건드리지 않습니다. 올바른 설정은 [연결 끊김](/ko/api-capabilities/image-connection-drops)의 "Node.js: 세 가지 독립적인 timeout" 섹션을 참조하십시오.
</Note>

## 재시도 및 과금

서버가 응답을 끝내지 못한 것이 확인되면, 다음 순서로 진행합니다:

<Steps>
  <Step title="이미 가지고 있는 이미지를 사용하십시오 — 대부분의 경우 이것으로 끝납니다">
    데이터는 완전하고 이미지는 완전히 사용할 수 있으므로 **재시도가 필요하지 않습니다**. 이것이 가장 저렴한 경로이며, 두 번 과금되는 일을 피할 수 있는 방법입니다.
  </Step>

  <Step title="구문 분석이 실제로 실패한 경우에만 재시도하십시오">
    가지고 있는 바이트를 정말로 완전한 JSON으로 구문 분석할 수 없다면 재시도하십시오. 새 연결을 사용하고 시도 사이에 2\~3초를 두십시오.
  </Step>

  <Step title="짧은 간격으로 재시도하지 말고 반복 실패 후에는 간격을 늘리십시오">
    문제는 특정 시간대에 몰려 나타나므로, 바로 재시도하면 같은 시간대에 걸릴 가능성이 큽니다. 3번 연속으로 시도가 멈춘다면 다시 시도하기 전에 30초 동안 기다리십시오.
  </Step>
</Steps>

<Warning>
  **과금**: 이 요청에서는 upstream이 이미 이미지를 생성해 되돌려 보내기 시작했으므로, 전달은 완료된 것으로 간주되며 요청은 **정상적으로 과금됩니다**. "내 client가 timeout되었다"는 "과금되지 않았다"는 뜻이 아닙니다. 바로 그렇기 때문에 첫 번째 단계가 가장 중요합니다. 이미 그 이미지에 대해 비용을 지불했으므로, 그것을 버리는 것이야말로 진짜 낭비입니다.

  어떤 연결 끊김이 과금되고 어떤 것은 과금되지 않는지에 대한 전체 내역은 [연결 끊김](/ko/api-capabilities/image-connection-drops)의 『과금 영향』 섹션을 보십시오.
</Warning>

## 롤아웃 노트

이 내용은 언어와 프레임워크에 구애받지 않으며, 저희의 롤아웃 경험에서 나온 것입니다.

* **단일 네트워크 계층 진입점에 두고, 호출 지점마다 흩어 두지 마십시오.** "요청을 보낸다"는 동작 자체의 일부로 만들어야 합니다. 그러면 모든 이미지 경로를 한 번에 포괄하고, 비즈니스 코드는 건드리지 않으며, 서버 측이 수정된 뒤에는 바꿀 곳도 한 군데만 남습니다.

* **실제로 필요한 것은 점진적 읽기 접근입니다.** 필수 조건은 응답이 끝나기 전에 이미 도착한 내용을 볼 수 있어야 한다는 점입니다. 거의 모든 HTTP 클라이언트가 이를 제공합니다(스트리밍 읽기, 청크 콜백, 진행률 이벤트 등). 하지만 **대개 기본값은 아닙니다** — 기본값인 “그냥 전체 본문을 주세요”가 바로 멈추는 경로입니다. **여기가 작업의 대부분을 차지합니다.**

* **요청 시작 시점이 아니라 마지막 청크를 받은 시점부터 시간을 재십시오.** 청크가 올 때마다 유예 시간 타이머를 재설정하십시오. 그러면 느린 네트워크를 부당하게 탓하지 않으면서도, 아무것도 전혀 움직이지 않는 상태를 놓치지 않을 수 있습니다.

* **스위치 뒤에 숨기십시오.** 언제든 끌 수 있는 플래그 뒤에 동작을 두십시오. 릴리스 직후 예상치 못한 일이 생기면 꺼서 이전 동작으로 되돌리면 됩니다. 긴급 배포는 필요 없습니다.

* **텔레메트리를 추가하십시오.** 완료 경로가 실행될 때마다 기록하십시오(타임스탬프, 바이트 수, 대기 시간). 이는 세 가지 목적에 도움이 됩니다. 실제로 얼마나 자주 발생하는지 수치화하고, 계층이 제 역할을 하는지 확인하고, 서버 측 수정 이후에 카운터가 0으로 떨어졌는지도 확인하는 것입니다. 이것이야말로 해당 계층을 철거해도 되는지 판단하는 유일한 객관적 근거입니다.

* **작업하는 김에 한 가지를 더 개선하십시오.** 점진적 읽기를 확보하면 사용자에게 실제 진행 상황을 보여줄 수 있습니다("데이터 수신 중, X.X MB"). 이전에는 그 긴 다운로드가 사용자 측에서는 완전히 블랙박스였습니다.

## 자체적으로 배포한 방식

우리는 이미 자체 AI 이미지 스튜디오(`imagen.apiyi.com`)에서 이 작업을 완료하고 검증했습니다. 오류를 재현하는 모의 서비스를 사용해(전체 본문은 전송하지만, 종료 신호는 보내지 않고 연결도 닫지 않음) 다음과 같이 비교했습니다.

| 시나리오                          | 결과                                              |
| ----------------------------- | ----------------------------------------------- |
| 정상 응답(종료 신호 존재)               | 기존 경로로 반환되며, **completion은 절대 발생하지 않음** — 오탐 없음 |
| 본문은 완료되었지만 종료 신호 없음           | 유예 시간 후 종료되며, 데이터는 완전하고 사용 가능합니다                |
| 동일한 경우, 스위치를 꺼 둔 상태           | 기존 동작이 유지됨(계속 대기) — 스위치가 정상적으로 동작하며 롤백이 가능합니다   |
| 본문 절반만 수신된 상태로 멈춤             | 잘못 종료하지 **않음**; 계속 대기함                          |
| 본문은 완전하지만 `Content-Length` 존재 | 가드레일에 의해 차단되며, 종료되지 않음                          |

결론: **정상 요청에는 영향이 전혀 없고, 실패하는 요청은 "타임아웃까지 기다린 뒤 실패"에서 "몇 초 안에 이미지를 받음"으로 바뀝니다.**

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="실제로 정상인 요청이 여기서 중단될 수 있습니까?">
    아닙니다. 완료되려면 수신한 바이트를 **완전한 JSON 문서**로 파싱할 수 있어야 합니다. 데이터가 아직 부족하면 파싱은 필연적으로 실패합니다. 여기에 3–5초 유예 시간을 더하므로 정상 요청이 오분류되지 않습니다. 위 비교 표의 첫 두 행이 바로 이 두 경우를 나란히 보여줍니다.
  </Accordion>

  <Accordion title="이미지가 반쯤만 남을 수도 있습니까?">
    아닙니다. 확인하는 것은 이미지 자체가 아니라 **전체 응답 본문**의 무결성입니다. JSON이 파싱되면 이미지 데이터는 완전한 것입니다. 이미지가 반쯤만 남는 경우는 파싱 실패에 해당하며, 그런 경우에는 완료가 절대 트리거되지 않습니다.
  </Accordion>

  <Accordion title="이것은 서버 측 문제를 그냥 덮어두는 것 아닙니까?">
    아닙니다. 서버 측 수정 사항을 대체하지 않습니다. 이미 생성되었고 이미 과금된 결과를 사용자에게 전달하는 동시에, 무작정 재시도가 일으키는 중복 과금을 피합니다. 또한 이 로직이 생성하는 텔레메트리는 오류가 언제 발생하는지 파악하는 데 도움이 됩니다.
  </Accordion>

  <Accordion title="서버 측이 수정되면 이것을 제거해야 합니까?">
    서두를 필요는 없습니다. 종료 신호가 존재할 때는 이 로직이 전혀 동작하지 않으므로 비용이 들지 않습니다. 텔레메트리가 일정 기간 동안 0을 유지하면 그때 정리하는 것을 고려하십시오.
  </Accordion>
</AccordionGroup>

## 지원팀에 문의해야 하는 경우

위의 호환성 계층을 추가한 뒤에도 다음 사항 중 하나라도 계속 해당된다면, 자료를 모아 지원팀에 문의하십시오.

* 보유한 바이트가 **끝까지도 완전한 JSON으로 파싱되지 않는** 경우입니다(이 페이지의 시나리오는 아닙니다. 전송이 실제로 조기에 중단된 것입니다);
* 클라이언트 측 완료 처리를 해도, 오랫동안 **응답 헤더를 전혀 받지 못하는** 경우입니다(이는 업스트림이 아직 전송을 시작하지 않았음을 의미합니다. 느린 생성 또는 업스트림 오류이지, 완료 문제는 아닙니다);
* 중단 비율이 시간대별로 몰리지 않고 **일관되게 높게 유지**되며, 장기간에 걸쳐 꾸준히 재현되는 경우입니다.

티켓을 제출할 때는 다음 항목을 포함하십시오: `x-request-id`, 호출 시각(**시간대 포함**, 예: `2026-08-03 13:15 (UTC+8)`), 모델 이름과 `imageSize`와 같은 주요 매개변수, 클라이언트 측에서 발생한 원시 예외, 그리고 멈췄을 때까지 수신한 바이트 수입니다.

## 관련 문서

<CardGroup cols={3}>
  <Card title="연결 끊김" icon="unplug" href="/ko/api-capabilities/image-connection-drops">
    `ECONNRESET`, SSL EOF, undici의 세 가지 타임아웃, 그리고 로컬 프록시 진단 매트릭스
  </Card>

  <Card title="필독 & 모범 사례" icon="book-check" href="/ko/api-capabilities/image-api-best-practices">
    동기 호출, 타임아웃 계층, base64 처리, 그리고 끊긴 연결에 대한 과금
  </Card>

  <Card title="자체 비동기 큐 만들기" icon="list-checks" href="/ko/api-capabilities/image-async-queue">
    동기 호출을 태스크 큐로 감싸고, 재시도와 지속 저장으로 간헐적 실패를 흡수합니다
  </Card>
</CardGroup>
