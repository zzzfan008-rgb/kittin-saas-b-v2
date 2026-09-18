> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 장문 출력 방식

> 장문 출력 작업에서 안정적으로 결과를 받는 방법을 설명합니다 — 드라마 대본, 소설, 1만 단어 분량의 글에서는 스트리밍을 사용하고, 이벤트 간 간격에 맞게 읽기 타임아웃을 설정하며, max_tokens에 충분한 여유를 두고 stop_reason을 확인해야 합니다. Claude 네이티브 예제를 포함합니다.

<Info>
  **한 줄 요약**: 한 번의 호출에서 모델에 수만 자를 생성하도록 요청하는 경우(에피소드 개요, 장편 소설, 대규모 번역, 대규모 코드), **응답을 스트리밍하고 비스트리밍을 사용하지 마십시오**. 클라이언트 읽기 타임아웃은 *전체* 생성 시간이 아니라 *데이터 이벤트 사이의 간격*으로 설정하십시오(수십 초 — 90–120초가 안전한 값입니다). `max_tokens`에 여유를 두고, 텍스트를 사용하기 전에 `stop_reason`을 확인하십시오. 이 네 가지를 수행하면 긴 출력 호출에서 “아무것도 반환되지 않는” 문제가 발생하지 않습니다.
</Info>

이 페이지는 모든 대규모 모델(OpenAI, Claude, Gemini, Grok 및 기타 모델)에 적용됩니다. 코드 예제에서는 Claude의 네이티브 `/v1/messages`를 사용하며, OpenAI 호환 형식과의 차이점은 별도로 설명합니다.

## 먼저 알아야 할 세 가지

1. **1만 단어를 출력하는 경우 실제 생성에 10\~20분이 걸리는 것은 정상입니다.** 모델은 추론/사고 단계와 함께 수만 개의 문자를 token 단위로 생성하므로 엔드투엔드 지연 시간이 실제로 깁니다. 이는 게이트웨이가 느린 것이 아니라 생성 자체가 느린 것입니다.

2. **비스트리밍은 전체 결과를 버퍼링한 후 전송합니다.** 비스트리밍(`stream` 생략 또는 `false`)에서는 서버가 모델의 전체 생성이 완료될 때까지 기다린 다음 전체 본문을 한 번에 전송해야 합니다. 그 몇 분 동안 클라이언트의 읽기 타임아웃이 만료될 수 있으며, 생성 시간이 길수록 결과가 도착하기 전에 연결이 끊길 가능성이 커집니다. 또한 예외가 빈 상태인 경우가 많아(`httpx.ReadError`의 `str(e)`이 비어 있음) 원인을 확인할 수 없습니다.

3. **연결이 끊겨도 과금되므로 무분별하게 재시도하면 이중으로 과금됩니다.** 서버가 출력을 생성한 시점에 결과가 사용자에게 도달하지 않았더라도 호출에는 과금됩니다. 이미 본문의 일부를 받은 후 재시도하면 모델이 다시 실행되고 비용도 다시 지불하게 됩니다.

## 스트리밍을 사용하고 비스트리밍은 사용하지 마십시오

스트리밍(`stream: true`)을 사용하면 첫 번째 바이트가 몇 초 내에 도착하며, 그 후에는 수십 초마다 데이터 이벤트가 도착합니다. 읽기 타임아웃은 여러 분 동안 실행되는 생성 전체가 아니라 *이벤트 간* 공백만 포괄하면 됩니다. 이것이 스트리밍이 긴 출력을 안정적으로 제공하는 핵심 이유입니다.

두 프로토콜은 **서로 다른 종결자**를 사용합니다. 혼동하지 마십시오.

| 프로토콜                             | 종결자                                     | 텍스트 읽기 방법                                                         |
| -------------------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| Claude 네이티브 `/v1/messages`       | `event: message_stop` (**`[DONE]` 없음**) | `delta.type == "text_delta"`인 `content_block_delta`의 `delta.text` |
| OpenAI 호환 `/v1/chat/completions` | `data: [DONE]`                          | `choices[0].delta.content`                                        |

적응형 thinking이 활성화되면 Claude 네이티브는 먼저 `type: "thinking"` 블록을 내보내고(증분은 `thinking_delta`), 그다음 `text` 블록을 내보냅니다. 렌더링할 때는 `thinking_delta` 및 `text_delta`을 별도로 라우팅하고 thinking을 본문 텍스트에 연결하지 마십시오.

최소 Claude 네이티브 `/v1/messages` 스트리밍 예시(기본 httpx, 줄 단위 SSE 파싱):

```python theme={null}
import json
import httpx

def generate_long_text(prompt, api_key, model="claude-opus-5", max_tokens=64000):
    url = "https://api.apiyi.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "accept": "text/event-stream",
    }
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "stream": True,                        # key: long output must stream
        "thinking": {"type": "adaptive"},      # adaptive thinking; the model decides depth
        "messages": [{"role": "user", "content": prompt}],
    }
    # Three-part timeout: read only covers the inter-event gap, not the whole generation
    timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)

    text, stop_reason = [], None
    with httpx.Client(timeout=timeout) as c:
        with c.stream("POST", url, json=payload, headers=headers) as r:
            if r.status_code != 200:
                raise RuntimeError(f"HTTP {r.status_code}: {r.read()[:400]}")
            event, data = None, []
            for line in r.iter_lines():
                if line == "":                 # events are separated by a blank line
                    if data:
                        d = json.loads("\n".join(data))
                        t = d.get("type") or event
                        if t == "content_block_delta" and d.get("delta", {}).get("type") == "text_delta":
                            text.append(d["delta"]["text"])
                        elif t == "message_delta":
                            stop_reason = d.get("delta", {}).get("stop_reason") or stop_reason
                    event, data = None, []
                    continue
                if line.startswith("event:"):
                    event = line[6:].strip()
                elif line.startswith("data:"):
                    data.append(line[5:].strip())
    # A Claude stream ends on message_stop, never [DONE]
    if stop_reason == "max_tokens":
        raise RuntimeError(f"truncated by max_tokens after {len(''.join(text))} chars; raise max_tokens and retry")
    return "".join(text).strip()
```

<Tip>
  공식 Anthropic SDK를 사용하는 경우 `base_url`을 `https://api.apiyi.com`로 지정하고 `client.messages.stream(...).get_final_message()`을 사용하십시오. SDK가 SSE 파싱, 타임아웃 및 `stop_reason`을 처리합니다. 위의 httpx 버전은 SDK를 추가하고 싶지 않은 경우를 위한 것입니다.
</Tip>

## 총 시간이 아닌 이벤트 간 간격에 맞춰 읽기 타임아웃을 설정하세요

많은 사람이 전체 생성 시간을 포괄하도록 읽기 타임아웃을 매우 큰 값(예: 1800초)으로 설정하지만, 여전히 타임아웃이 발생합니다. 스트리밍이 아닌 방식에서는 해당 값이 전체 생성 시간과 경쟁해야 하며, 작은 지연 하나만 있어도 실패할 수 있기 때문입니다. 올바른 접근 방식은 스트리밍과 이벤트 간 간격에 맞춰 설정한 읽기 타임아웃을 함께 사용하는 것입니다.

측정 참고값(`claude-opus-5`가 약 15k자 입력으로 약 20k자 분량의 에피소드 개요를 생성한 경우):

| 측정 항목          | 측정값                         |
| -------------- | --------------------------- |
| 첫 바이트까지 걸린 시간  | 3 – 130초                    |
| 추론 중 최대 무응답 간격 | \~42초(그 사이에 keepalive 핑 포함) |
| 전체 종료까지 걸린 시간  | 9 – 12분                     |

따라서 **90–120초**의 읽기 타임아웃이면 여유를 두고 가장 긴 이벤트 간 간격을 포괄할 수 있으므로, 수분 단위의 값을 설정할 필요가 없습니다. 3단계 타임아웃은 단계를 분리하고 각 단계에 맞게 크기를 설정합니다:

```python theme={null}
# connect: establish; write: upload the request body; read: max gap between reads
timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)
```

## max\_tokens에 충분한 여유를 두고 stop\_reason을 확인합니다

긴 출력은 쉽게 `max_tokens` 한도에 도달하여 잘립니다. 이는 **thinking이 활성화된 Claude와 같은 모델에서 특히 그러합니다. — thinking 자체가 `max_tokens` 예산을 소모하며**, 긴 내용은 이 예산을 모두 소진할 수 있습니다.

* **`max_tokens`를 64000에서 시작합니다** (높은 노력 수준 / 심층 thinking에서는 더 많이 제공합니다. `claude-opus-5`는 128K 출력을 지원합니다).
* **응답을 사용하기 전에 `stop_reason`를 확인합니다:**
  * `end_turn` — 정상적으로 완료되었으며 텍스트가 완전합니다. 이것만 성공입니다.
  * `max_tokens` — 잘렸으므로 텍스트가 불완전하거나 아예 비어 있을 수 있습니다. 이는 **잘림**이지 “빈 결과”가 아닙니다. `max_tokens`를 늘리고 재시도합니다.
  * `refusal` — 안전 정책에 따라 거부되었습니다. 별도로 처리합니다.

`str(e)`만으로 또는 “텍스트가 비어 있음”으로 성공 여부를 판단하면 오해할 수 있습니다. 빈 본문은 대개 `max_tokens` 잘림입니다.

## 재시도 전략

긴 출력에 대해서는 재시도에 신중해야 합니다. “실패 시 재시도”가 “이중 과금과 두 번째 장시간 실행”이 되지 않도록 합니다.

* **응답 헤더가 도착하기 전에 발생한 실패와 `5xx` / `429`에 대해서만 재시도합니다**(백오프를 적용하며 최대 두 번). 이는 재시도가 합리적인 연결 문제 또는 일시적인 문제입니다.
* **본문의 일부를 이미 수신한 후 중단된 스트림을 무작정 재시도하지 마십시오.** 서버는 이미 해당 요청을 생성하고 과금했으므로, 재시도하면 요청을 다시 실행하고 다시 비용을 지불하게 됩니다.
* 조정 및 문제 해결을 위해 응답 헤더의 요청 ID를 기록합니다.

## 시나리오 요약표

| 시나리오               | 일반적인 출력    | max\_tokens      | 읽기 타임아웃   |
| ------------------ | ---------- | ---------------- | --------- |
| 드라마 / 숏드라마 에피소드 개요 | 10k – 30k자 | 64000            | 90 – 120초 |
| 소설(장편 / 장)         | 10k – 50k자 | 64000 – 128000   | 90 – 120초 |
| 장문 번역              | 소스에 따라 조정  | 소스 token의 약 1.5배 | 90 – 120초 |
| 대규모 코드 생성          | 수천 줄       | 32000 – 64000    | 90 – 120초 |

항상 stream을 사용합니다. `api.apiyi.com`(중국 본토 권장) 또는 `vip.apiyi.com`(해외 권장)을 사용하고, \*\*`api-cf.apiyi.com`\*\*는 사용하지 않습니다(CDN 노드가 약 100초 후 `524`을 반환하며 긴 요청을 처리할 수 없습니다).

## 관련 문서

<CardGroup cols={2}>
  <Card title="API 시간 초과를 방지하는 방법" icon="clock" href="/ko/faq/timeout-configuration">
    시나리오별 시간 초과 값
  </Card>

  <Card title="스트리밍과 비스트리밍 비교" icon="git-compare" href="/ko/faq/streaming-vs-non-streaming">
    장단점과 선택 방법
  </Card>

  <Card title="Claude 사고 및 추론 강도" icon="brain" href="/ko/api-capabilities/claude-effort-thinking">
    적응형 사고, 추론 강도 단계, max\_tokens 및 잘림
  </Card>

  <Card title="Claude 응답 처리" icon="code" href="/ko/api-capabilities/claude-response-handling">
    네이티브 응답 형식, SSE 이벤트, stop\_reason
  </Card>
</CardGroup>
