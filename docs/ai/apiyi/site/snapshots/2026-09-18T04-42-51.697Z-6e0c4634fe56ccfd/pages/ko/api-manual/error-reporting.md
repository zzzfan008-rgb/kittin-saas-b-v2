> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 오류 세부 정보 캡처

> APIYI는 오류 세부 정보를 API 응답 본문에만 반환합니다. 백엔드 로그는 과금 원장이며 과금된 호출만 기록합니다. 이 페이지에서는 원시 오류를 직접 출력해야 하는 이유, Python / Node.js / cURL에서의 올바른 캡처 패턴, ComfyUI 같은 래퍼에서 원시 출력을 얻는 방법, 보관해야 할 7개 필드, 그리고 복사해 붙여넣을 수 있는 지원 티켓 템플릿을 다룹니다.

<Warning>
  ### 우선 가장 먼저: 원시 오류는 응답 본문에 정확히 한 번만 나타납니다

  APIYI는 오류 세부 정보를 **오직 API 응답 본문을 통해서만** 반환합니다. 백엔드 로그는 **과금 원장**입니다. 과금이 발생한 호출만 기록합니다. 실패한 요청은 과금되지도 않고 거기에 나열되지도 않습니다.

  따라서 "백엔드 로그에서 찾을 수 없다"는 것은 "일어나지 않았다"는 뜻이 아닙니다. **그 오류의 유일한 기록은 클라이언트에만 남아 있다**는 뜻입니다. 그것을 출력하지도, 영구 저장하지도 않았다면 완전히 사라진 것이며, 저희도 복구할 수 없습니다.
</Warning>

<Info>
  **한 줄 요약**: 반환된 그대로의 **원시 응답 본문**을 정확히 출력하십시오. 프로그램이 감싸서 만든 한 줄 문자열만 보관하지 마십시오. `400 Bad Request` 같은 문자열은 진단에 거의 도움이 되지 않습니다. 실제 답은 버려진 JSON 안에 있습니다.
</Info>

## 실제 사례: 400 Bad Request는 아무것도 알려주지 않습니다

한 고객이 딱 한 줄만 보고했습니다:

```text theme={null}
apiyi GPT Image 2 2k: 400 Bad Request from POST https://api.apiyi.com/v1/images/edits
```

그 문자열은 **클라이언트 프레임워크가 오류를 감싼 뒤 생성한 결과**입니다. 모델 이름, HTTP 메서드, URL, 상태 코드는 보존했지만, 정말 중요한 한 가지인 **응답 본문**은 버려 버렸습니다. 지원팀이 제시할 수 있는 최선의 답변은 다음이었습니다:

> 400은 보통 콘텐츠 안전성 문제이거나 파라미터 문제입니다. 가장 가능성이 높은 것은 콘텐츠 안전성입니다.

그것은 **추측**이지 결론이 아닙니다. 왜냐하면 바로 그 동일한 호출에 대해 실제 응답 본문은 다음 셋 중 하나였을 수 있고, 각각은 완전히 다른 조치를 요구하기 때문입니다:

| `error.message` in the response body             | 실제 원인                                                               | 해야 할 조치                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Your request was rejected by the safety system` | 상위 콘텐츠 안전 차단                                                        | prompt나 참조 이미지를 수정하십시오. **재시도하지 마십시오** — 다시 차단될 것입니다. [Content safety](/ko/faq/content-safety)를 참조하십시오 |
| `Invalid value for 'size': expected one of ...`  | 파라미터의 잘못된 enum 값                                                    | 코드 수준의 버그입니다. 파라미터를 수정하십시오. 재시도는 무의미합니다                                                                |
| `invalid_image_file` / `Invalid input image`     | 참조 이미지 자체가 잘못되었습니다(예: 일부 Android 휴대폰의 `.jpg`는 실제로 다중 프레임 MPO 파일입니다) | Pillow 등으로 다시 인코딩한 다음 다시 보내십시오. [이미지 API 필수 사항](/ko/api-capabilities/image-api-best-practices)을 참조하십시오 |

<Warning>
  **같은 400, 세 가지가 완전히 다른 조치입니다.** 응답 본문을 버리면 세 갈래 결정을 추측으로 바꾸게 됩니다. 그리고 잘못된 추측은 고객 지원 메시지의 왕복과, 필요도 없던 재시도까지 비용으로 치르게 합니다.

  더 심각한 점은: **그 셋 중 두 경우는 아예 재시도하면 안 됩니다.** 서로 구분할 수 없다면, 무작정 재시도하는 것밖에 선택지가 없고, 그만큼 시간과 쿼터를 모두 소모하게 됩니다.
</Warning>

## 백엔드 로그에 있는 것과 없는 것

먼저 바로잡아야 할 정신 모델은 다음과 같습니다: **백엔드 로그는 오류 로그가 아니라 과금 원장입니다.**

| 찾고 있는 항목              | 백엔드 [로그 페이지](https://api.apiyi.com/log) | API 응답                       |
| --------------------- | --------------------------------------- | ---------------------------- |
| 이 호출에 대해 과금된 금액       | 예                                       | 아니요(`usage`는 token 수만 제공합니다) |
| token 사용량             | 예                                       | 예(`usage` 필드)                |
| 모델 이름, 호출 시각          | 예(성공한 호출만)                              | 직접 기록해야 합니다                  |
| `request_id`          | 예(성공한 호출만)                              | `x-request-id` 응답 헤더         |
| **오류 코드와 원시 오류 메시지**  | **아니요**                                 | **유일한 원천**                   |
| **업스트림이 거부한 구체적인 이유** | **아니요**                                 | **유일한 원천**                   |
| 실패한 호출 자체             | **기록되지 않음**(과금이 없으면 원장 항목도 없음)          | —                            |

<Tip>
  **거꾸로 읽으면 연결 문제를 진단하는 가장 강력한 단일 테스트가 됩니다**: 로그에 **과금 항목이 있다면** 요청이 업스트림까지 도달했고 리소스를 사용한 것입니다. **없다면** 문제는 거의 확실하게 업스트림에 도달하기 전에 발생한 것입니다(네트워크, 인증, 파라미터 검증). 자세한 내용은 [로그에서 과금 금액 읽기](/ko/faq/log-billing-explained)를 보십시오.
</Tip>

## 반드시 유지해야 하는 7개 필드

이것은 실패한 호출 하나를 진단하는 데 필요한 모든 정보입니다. 이 중 하나라도 빠지면 진단은 다시 추측 수준으로 떨어집니다:

| 필드                                     | 얻는 방법                                                | 없으면 무엇이 깨지는지                                                                |
| -------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------- |
| **HTTP status code**                   | `resp.status_code` / `err.status`                    | 거부된 요청(4xx)과 서버 오류(5xx), 그리고 아예 연결이 성립되지 않은 경우(상태 코드 자체 없음)를 구분할 수 없습니다     |
| **Full response body**                 | `resp.text` / `await resp.text()`                    | **핵심입니다** — 실제 원인이 여기에 있습니다. 이걸 잃으면 추측만 할 수 있습니다                            |
| **`x-request-id` response header**     | `resp.headers.get("x-request-id")`                   | 지원팀은 해당 호출을 정확히 특정할 수 없어서 대신 넓은 시간 범위를 뒤져야 합니다                              |
| **Call time, with timezone**           | 클라이언트 쪽에서 기록하십시오. 예: `2026-08-03 15:44 (UTC+8)`      | 고객은 전 세계에 분포해 있으므로, 시간대가 없는 타임스탬프는 로그와 맞춰 볼 수 없습니다                          |
| **Model name + endpoint path**         | 자신의 요청에서 확인하십시오                                      | 같은 모델이라도 엔드포인트가 다르면 동작이 달라집니다(`/v1/images/edits` vs `/v1/chat/completions`) |
| **Key request parameters**             | `size`, `quality`, 참조 이미지 개수와 크기, `max_tokens`, etc. | 매개변수 문제는 재현할 수 없습니다. 이미지 문제의 경우 자산 자체에 원인이 있는지도 알 수 없습니다                    |
| **Raw client exception + retry count** | `repr(e)`, 그리고 시도마다 로그 한 줄씩                          | 재시도 끝에 성공하면 로그에는 깔끔한 200 하나만 남고, 실제로 전송이 몇 번 실패했는지는 전혀 보이지 않습니다             |

<Note>
  **응답 본문을 잘라내지 마십시오.** 200자로 자르는 것은 일반적인 업무 로그에서는 괜찮지만, 진단용으로는 유용한 세부 정보가 끝부분에 있는 경우가 많습니다. 적어도 앞의 2000자는 유지하십시오. 이미지 엔드포인트에서 base64가 로그를 가득 채울까 걱정된다면, `status_code >= 400`일 때만 전체 본문을 출력하십시오 — 오류 본문은 어차피 짧습니다.
</Note>

## 오류 포착 패턴을 올바르게 처리하기

사실 원칙은 하나뿐입니다. **두 계층에서 모두 잡고, 어느 계층에서도 아무것도 버리지 않는 것입니다.**

* **전송 계층 실패**: 연결 재설정, TLS 핸드셰이크 실패, 타임아웃, DNS 실패입니다. **HTTP 응답은 전혀 없으며**, 예외 텍스트만 받을 수 있습니다.
* **HTTP 계층 오류**: 서버가 4xx / 5xx를 반환했습니다. **응답 본문이 있으므로**, 반드시 읽어야 합니다.

### Python / requests

```python theme={null}
import time
import requests

BASE_URL = "https://api.apiyi.com/v1"
API_KEY = "sk-your-api-key"          # read from an environment variable in production


def call_and_log(path, payload, timeout=300):
    started = time.strftime("%Y-%m-%d %H:%M:%S %z")      # includes timezone
    try:
        resp = requests.post(
            f"{BASE_URL}{path}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=payload,
            timeout=timeout,
        )
    except requests.exceptions.Timeout as exc:
        # Transport layer: timed out, no HTTP response to read
        raise RuntimeError(f"[{started}] timed out after {timeout}s: {exc!r}") from exc
    except requests.exceptions.RequestException as exc:
        # Transport layer: connection reset, SSL error, DNS failure — still no body
        raise RuntimeError(f"[{started}] transport failure: {exc!r}") from exc

    if resp.status_code >= 400:
        # The point: pass the body through verbatim, don't reword it here
        raise RuntimeError(
            f"[{started}] HTTP {resp.status_code} {path} "
            f"model={payload.get('model')}\n"
            f"x-request-id: {resp.headers.get('x-request-id')}\n"
            f"{resp.text}"
        )
    return resp.json()
```

<Warning>
  **본문을 읽기 전에 `raise_for_status()`를 호출하지 마십시오.** 그것이 발생시키는 `HTTPError`에는 `400 Client Error: Bad Request for url: ...`만 담기며, 실제 메시지는 아무도 읽지 않은 채 `resp.text`에 그대로 남습니다. 이것이 바로 이 페이지 상단의 사례가 발생하는 방식 중 하나입니다. 정말 사용해야 한다면, 먼저 `resp.text`를 꺼내십시오.
</Warning>

### Python / OpenAI SDK

공식 SDK는 이미 예외 객체에 세 가지 정보를 모두 붙여 줍니다. 대부분의 사람들은 대신 자신의 한 줄짜리 메시지를 `print`합니다.

```python theme={null}
from openai import OpenAI, APIStatusError, APIConnectionError

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,      # built-in exponential backoff for 429 / 5xx / connection errors
    timeout=60.0,
)

try:
    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Hello"}],
    )
except APIStatusError as e:
    # Server returned 4xx/5xx: status, request-id and body are all right here
    print("status code :", e.status_code)
    print("request-id  :", e.request_id)
    print("raw body    :", e.response.text)
    raise
except APIConnectionError as e:
    # No HTTP response: connection reset, timeout, local proxy failure
    print("transport   :", repr(e), "|", repr(e.__cause__))
    raise
```

<Tip>
  한 줄짜리라도 `print(f"API error: {e}")`이어야 하며 `print("request failed")`이어서는 안 됩니다. SDK 예외의 `str(e)`에는 **이미 서버의 메시지가 포함되어 있습니다**. 실제로 정보를 망가뜨리는 것은 예외 객체를 아예 버려 버리는 것입니다.
</Tip>

### Node.js

SDK를 사용할 때는:

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

try {
  const resp = await client.images.edit({ /* ... */ });
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    // Server returned 4xx/5xx
    console.error('status code :', err.status);
    console.error('request-id  :', err.requestID);
    console.error('raw body    :', JSON.stringify(err.error));
  } else {
    // Transport layer: ECONNRESET, UND_ERR_*, etc. — no HTTP response
    console.error('transport   :', err.code, err.message, err.cause);
  }
  throw err;
}
```

일반 `fetch`를 사용할 때는, **대부분 여기서 잘못됩니다**:

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
  method: 'POST',
  headers: { Authorization: 'Bearer sk-your-api-key' },
  body: form,
});

if (!resp.ok) {
  const raw = await resp.text();        // read the body first, then throw
  throw new Error(
    `HTTP ${resp.status} ${resp.url}\n` +
    `x-request-id: ${resp.headers.get('x-request-id')}\n${raw}`
  );
}
```

<Warning>
  이 페이지 상단의 `400 Bad Request from POST https://api.apiyi.com/v1/images/edits`는 말 그대로 `${resp.status} ${resp.statusText} from ${resp.method} ${resp.url}`입니다. **본문이 전혀 읽히지 않았기 때문입니다.**

  `fetch`는 HTTP 계층 오류에서 **reject하지 않으며**, 단지 `resp.ok`를 `false`로 설정할 뿐입니다. 그 순간 `resp.statusText`를 던지면 응답 객체와 함께 본문도 사라집니다. **throw하기 전에 항상 `await resp.text()` 하십시오**. 이 한 줄이 진단 가능한 보고서와 답을 알 수 없는 보고서의 차이입니다.
</Warning>

### cURL로 재현하기

누군가에게 문제 재현을 요청할 때 이 명령은 가장 적은 수고로 충분합니다. 상태 코드, 헤더, 본문, 시간 정보를 한 번에 보여 줍니다.

```bash theme={null}
curl -i -sS -X POST https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "image=@input.png" \
  -F "prompt=replace the background with plain white" \
  -w '\n---\nHTTP %{http_code}  total %{time_total}s\n'
```

* `-i`는 응답 헤더를 출력하며, `x-request-id`가 있는 곳이 바로 그곳입니다.
* `-sS`는 진행 표시줄을 숨기지만 오류 출력은 유지합니다.
* `-w`는 상태 코드와 전체 시간을 덧붙여 주며, 타임아웃 설정과 비교할 때 유용합니다.

## 래퍼와 사내 게이트웨이

### 좋은 예시

이 오류는 한 고객의 ComfyUI 노드에서 발생했습니다:

```text theme={null}
Upstream HTTP 0: OpenSSL SSL_read: Connection was reset, errno 10054
```

`400 Bad Request`보다 훨씬 더 지저분하지만 — 그럼에도 **완전**하므로, 방향은 몇 초 만에 결정됩니다:

| 조각                               | 의미                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `HTTP 0`                         | HTTP 응답이 전혀 수신되지 않았습니다. `0`은 상태 줄조차 도착하지 않았음을 뜻하는 가상 상태 코드입니다. 이는 400/500식 비즈니스 오류가 아닙니다 |
| `SSL_read: Connection was reset` | TLS 읽기 단계 동안 상대 피어 또는 중간 장비에 의해 연결이 끊겼습니다                                                |
| `errno 10054`                    | Windows `WSAECONNRESET`, Linux의 `ECONNRESET`에 해당합니다. TCP RST가 수신되었습니다                    |

결론은 바로 나옵니다. 이것은 콘텐츠 안전성이나 매개변수와 무관한 **전송 계층** 문제이며, 과금도 발생하지 않습니다(요청이 끝까지 완료되지 않았기 때문입니다). 문제 해결 경로: [Image API 연결 끊김](/ko/api-capabilities/image-connection-drops).

<Info>
  **두 경우를 비교해 보십시오**: 하나는 보기 좋게 포장되어 있지만 아무것도 설명하지 못하고(`400 Bad Request`), 다른 하나는 길고 지저분하지만 원인을 바로 가리킵니다(`errno 10054`). **진단에서는 친절하고 깔끔하게 다시 쓴 오류보다, 원시적이고 지저분하지만 완전한 오류가 언제나 더 낫습니다.**
</Info>

### 일반 도구에서 원시 출력을 찾는 위치

| 도구                     | 원시 오류가 있는 위치                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| ComfyUI                | 노드에 표시되는 빨간 글자는 보통 잘려서 나오며, 전체 스택 트레이스는 **ComfyUI를 실행한 터미널 창** 또는 설치 디렉터리의 `comfyui.log`에 있습니다 |
| Dify / Coze / n8n      | 실행 기록을 열고 해당 노드의 실행 세부 정보를 확장한 뒤, 노드의 오류 요약이 아니라 원시 HTTP 응답을 읽으십시오                             |
| LangChain / LlamaIndex | 맨몸의 `Exception` 대신 `openai.APIStatusError`를 잡으십시오 — 위의 SDK 패턴을 보십시오                            |
| 데스크톱 클라이언트             | 설정에서 디버그 / 개발자 로그를 활성화하거나, `curl`로 한 번 재현해 보십시오                                                |

### 사내 게이트웨이를 위한 세 가지 규칙

<Steps>
  <Step title="그대로 통과시키고, 절대 다시 쓰지 마십시오">
    중간 계층은 문맥(어떤 서비스인지, 어떤 테넌트인지, 몇 번째 재시도인지)을 **추가**할 수는 있지만, 상위 `error.message`를 **대체**해서는 안 됩니다. 한 번 다시 쓰면 원문을 복구할 두 번째 장소가 없어집니다.
  </Step>

  <Step title="사용자에게 보이는 메시지를 원시 메시지와 별도로 저장하십시오">
    [Gemini 이미지 오류 처리](/ko/api-capabilities/gemini-image-error-handling)에서 사용하는 세 부분 구조를 따르십시오: `userMessage`(최종 사용자용 친절한 문구), `devMessage`(개발자용 분류), `rawResponse`(수정하지 않은 응답 본문)입니다. 앞의 두 개는 마음껏 다듬고, 세 번째는 그대로 저장하십시오.
  </Step>

  <Step title="알 수 없는 오류를 절대 내보내지 마십시오">
    폴백 분기에서는 `status`, `x-request-id` 및 본문의 처음 2000자를 기록하십시오. 원문 텍스트를 담고 있는 “분류되지 않은 오류”는 진단할 수 있지만, 깔끔한 “알 수 없는 오류”는 그렇지 않습니다.
  </Step>
</Steps>

## 진단을 불가능하게 만드는 안티패턴

* `except Exception as e: print("request failed")` — 예외 객체가 사라져서 어떤 계층이 실패했는지도 알 수 없습니다;
* 상태 코드는 기록하지만 본문은 기록하지 않기 — 이 페이지 맨 위에 있는 바로 그 경우입니다;
* `raise_for_status()`을 `resp.text`를 먼저 읽지 않고 호출하기 — 메시지는 여전히 메모리에 있지만, 아직 조회되지 않았을 뿐입니다;
* `fetch`에서 `if (!resp.ok) throw new Error(resp.statusText)`하기 — 본문이 응답 객체와 함께 버려집니다;
* 성공한 재시도 후 깨끗한 200만 남겨두기 — **각 시도를 별도로 기록하십시오**, 그렇지 않으면 전송이 몇 번 실패했는지 보이지 않고, 자신의 재시도를 게이트웨이 동작으로 착각할 수 있습니다;
* stdout에만 기록하거나, 덮어쓰기로 매일 순환하기 — 고객이 문제를 보고할 때쯤이면 원본 기록은 대개 이미 지나가 버립니다;
* 화면의 휴대전화 사진으로 문제를 보고하기 — 대신 **텍스트**를 붙여넣으십시오; 스크린샷은 오류의 한 줄을 절반쯤 잘라내는 경우가 자주 있습니다.

## 지원팀에 문의할 때

먼저 위의 캡처 및 해석 단계를 수행하십시오. 다음 중 **어느 하나라도** 해당하면 자료를 지원팀에 전달하십시오.

* 전체 응답 본문과 `error.message`가 상위를 가리키고(`upstream_error`, 원시 상위 5xx, 또는 명시적인 채널 오류);
* 동일한 요청 매개변수가 **다른 모델이나 다른 시점에서는 작동하고**, 특정한 한 모델에서만 일관되게 실패하는 경우;
* 오류가 `500` + `write_response_body_failed`이거나 이와 유사한 다운스트림 전달 실패이며, **일관되게 재현되는** 경우입니다(이것들은 과금되지 않습니다; [연결 끊김](/ko/api-capabilities/image-connection-drops)을 참조하십시오);
* 실제 호출과 과금이 일치하지 않는다고 의심되는 경우 — 정확히 일치하는 유일한 기준점은 `request_id`입니다.

### 지원 티켓 템플릿(복사하여 붙여넣기)

```text theme={null}
[Summary]      gpt-image-2 image edit endpoint consistently returns 400
[Endpoint]     POST https://api.apiyi.com/v1/images/edits
[Model]        gpt-image-2
[Call time]    2026-08-03 15:44 (UTC+8)
[request-id]   copy from the x-request-id response header
[HTTP status]  400
[Raw body]
{"error":{"message":"...","type":"...","code":"..."}}
[Key params]   size=2048x2048, quality=high, 1 reference image / 3.2 MB / PNG
[Reproduction] 5 consecutive calls, 5 failures; works again with a different reference image
[Already checked] key valid, balance sufficient, same key works on text models
```

<Card title="WeCom 지원" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  코드를 스캔하거나 이 카드를 클릭하여 WeCom 지원에 연결하십시오.

  Telegram에서는 `@apiyi001`로, 이메일로는 `hi@apiyi.com`로도 연락하실 수 있습니다.
</Card>

<Tip>
  위 템플릿을 **텍스트로** 보내십시오 — 어떤 설명보다 훨씬 효율적입니다. `request_id`만 있으면 해당 단일 호출의 전체 추적으로 바로 갈 수 있으므로, "대략 몇 시였고 어떤 모델이었습니까?"라고 다시 묻지 않아도 됩니다. `request_id`를 조회하는 방법은 [내 호출 기록을 보는 방법](/ko/faq/call-logs)을 참조하십시오.
</Tip>

## 관련 문서

<CardGroup cols={3}>
  <Card title="API 매뉴얼" icon="book" href="/ko/api-manual">
    일반 오류 코드, 인증 및 요청 제한
  </Card>

  <Card title="연결 끊김" icon="unplug" href="/ko/api-capabilities/image-connection-drops">
    `ECONNRESET`, `errno 10054` 및 SSL EOF에 대한 전체 문제 해결 경로
  </Card>

  <Card title="호출 기록 보기" icon="file-text" href="/ko/faq/call-logs">
    콘솔 로그 페이지에서 각 호출을 확인하는 방법 — `request_id`를 찾고 과금 내역을 대조하는 방법
  </Card>

  <Card title="과금된 금액 읽기" icon="receipt" href="/ko/faq/log-billing-explained">
    실패한 호출이 왜 로그에 도달하지 않는지, 그리고 이를 진단 테스트로 사용하는 방법
  </Card>

  <Card title="타임아웃 설정" icon="hourglass" href="/ko/faq/timeout-configuration">
    모델 유형별 타임아웃 단계와, 값을 올려도 도움이 되지 않을 때 확인할 사항
  </Card>

  <Card title="이미지 API 필수 사항" icon="book-check" href="/ko/api-capabilities/image-api-best-practices">
    동기 호출, base64 접두사 차이, `400 invalid_image_file` 전처리
  </Card>
</CardGroup>
