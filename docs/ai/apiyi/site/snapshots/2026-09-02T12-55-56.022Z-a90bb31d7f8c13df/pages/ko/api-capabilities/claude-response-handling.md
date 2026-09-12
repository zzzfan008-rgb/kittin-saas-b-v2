> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 네이티브 형식: 스트리밍 및 비스트리밍 응답

> Anthropic의 네이티브 /v1/messages의 응답 구조: content 블록 배열, 이름이 지정된 이벤트 SSE 프로토콜, 각 응답을 파싱하는 방법, 그리고 필드 참조입니다.

When you call [Claude의 네이티브 형식](/ko/api-capabilities/claude) (`/v1/messages`), the response is **OpenAI 호환 모드와는 완전히 다릅니다**: the answer is a type된 `content` block array, and 스트리밍 uses Anthropic의 **명명된 이벤트 SSE 프로토콜**. 이 페이지는 두 모드를 모두 파싱하는 방법을 설명합니다.

<Info>
  요청 측(엔드포인트, `anthropic-version` 헤더, `x-api-key` 인증, 노력 / 추론 매개변수)은 [Claude API 기본](/ko/api-capabilities/claude) 및 [Claude 노력 & 추론 가이드](/ko/api-capabilities/claude-effort-thinking)에서 다룹니다. 이 페이지는 순전히 **응답 측**에 관한 것입니다. 예제는 경량 모델 `claude-haiku-4-5-20251001`을 사용합니다.
</Info>

## 비스트리밍 응답

최상위 수준은 `message` 객체이며, **답변은 `content` 배열에 있고**, `type`로 블록이 나뉩니다:

```json theme={null}
{
  "id": "msg_bdrk_xxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-4-5-20251001",
  "content": [
    { "type": "text", "text": "1+1 equals 2." }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 26,
    "output_tokens": 11,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

응답을 얻으려면 **`content` 배열을 반복 처리해야 합니다** — OpenAI처럼 단일 문자열 필드를 읽을 수는 없습니다:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1/messages",
      headers={
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": "YOUR_API_KEY",
      },
      json={
          "model": "claude-haiku-4-5-20251001",
          "max_tokens": 100,
          "messages": [{"role": "user", "content": "What is 1+1?"}],
      },
      timeout=60,
  )
  data = resp.json()
  for block in data["content"]:
      if block["type"] == "text":
          print(block["text"])
      elif block["type"] == "thinking":      # only present when thinking is on
          print("[thinking]", block["thinking"])
  print(data["usage"])
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/messages \
    -H "content-type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -H "x-api-key: YOUR_API_KEY" \
    -d '{
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 100,
      "messages": [{"role": "user", "content": "What is 1+1?"}]
    }'
  ```
</CodeGroup>

<Note>
  `stop_reason` 값: `end_turn` (정상), `max_tokens` (`max_tokens`에 의해 잘림 — 텍스트가 비어 있을 수 있으므로 제한을 늘리십시오), `stop_sequence`, `tool_use` (도구를 호출하려고 합니다). thinking을 켜면 `content` 배열에 `type: "thinking"` 블록이 추가되어 `text` 블록 앞에 배치됩니다.
</Note>

## 스트리밍 응답(이름 있는 이벤트 SSE)

Claude 스트리밍은 **Anthropic 이벤트 프로토콜**을 사용합니다: 각 메시지에는 `event:` 이름과 `data:` 페이로드가 있으며, OpenAI처럼 모든 청크를 동일하게 처리하는 대신 **이벤트 유형으로 디스패치**합니다.

```text theme={null}
event: message_start
data: {"type":"message_start","message":{"id":"...","content":[],"usage":{"input_tokens":26,"output_tokens":8}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"1+1 equals 2."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":11}}

event: message_stop
data: {"type":"message_stop"}
```

고정된 이벤트 순서와 각 이벤트가 담는 내용은 다음과 같습니다:

| Event                 | Role                                                            |
| --------------------- | --------------------------------------------------------------- |
| `message_start`       | 메시지 뼈대입니다. `usage.input_tokens`와 초기 `output_tokens`가 여기에 있습니다   |
| `content_block_start` | 콘텐츠 블록이 시작됩니다(`index` + 블록 유형 text / thinking)                  |
| `content_block_delta` | 증분입니다. 텍스트는 `delta.text`이며 `delta.type == "text_delta"`에서 갱신됩니다 |
| `content_block_stop`  | 현재 블록이 끝납니다                                                     |
| `message_delta`       | 최종 `stop_reason`와 \*\*누적된 `output_tokens`\*\*가 여기에 있습니다         |
| `message_stop`        | 전체 메시지가 끝납니다(**`[DONE]`는 없습니다. 이 이벤트가 종료자입니다**)                 |

핵심은 **`text_delta`를 `content_block_delta` 안에서 누적하는 것**입니다:

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": "YOUR_API_KEY",
    },
    json={
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 100,
        "stream": True,
        "messages": [{"role": "user", "content": "Write a short poem"}],
    },
    stream=True, timeout=120,
)

text, usage = "", {}
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue                       # the event: line can be skipped; type is in data's "type"
    evt = json.loads(line[6:])
    t = evt["type"]
    if t == "message_start":
        usage.update(evt["message"]["usage"])
    elif t == "content_block_delta" and evt["delta"]["type"] == "text_delta":
        piece = evt["delta"]["text"]
        text += piece
        print(piece, end="", flush=True)
    elif t == "message_delta":
        usage.update(evt["usage"])     # final output_tokens
    elif t == "message_stop":
        break                          # terminator, no [DONE]
```

<Tip>
  이벤트 유형은 `event:` 줄과 `data:` 페이로드의 `"type"` 필드 **둘 다**에 있습니다. 어느 쪽을 사용해도 디스패치할 수 있습니다. 공식 `anthropic` SDK를 사용하면 base\_url을 `https://api.apiyi.com`로 지정하기만 하면 SDK가 이벤트 스트림을 대신 처리해 주므로, 직접 작성한 루프가 필요하지 않습니다.
</Tip>

<Note>
  thinking(적응형 thinking)을 켠 경우, 먼저 `type: "thinking"` 블록이 나타납니다. 그 증분은 `thinking_delta`이며, 블록이 닫히기 전에 `signature_delta`(thinking 블록 서명)가 나타납니다. thinking을 표시하려면 `thinking_delta`와 `text_delta`를 각각 따로 렌더링하십시오. [Claude Effort & Thinking 가이드](/ko/api-capabilities/claude-effort-thinking)를 참조하십시오.
</Note>

## OpenAI 호환 모드와의 주요 차이점

| 항목           | Claude 네이티브 (`/v1/messages`)                                              | OpenAI 호환 (`/v1/chat/completions`)                     |
| ------------ | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| 답변 위치        | `content` **블록 배열**, 타입이 지정됨                                              | `choices[0].message.content` 문자열                       |
| 스트리밍 프로토콜    | 명명된 이벤트(`event:` + `data:`)                                               | 동일한 청크 객체                                              |
| 스트림 종료자      | `message_stop` 이벤트, **`[DONE]` 없음**                                       | `data: [DONE]`                                         |
| 증분 필드        | `content_block_delta.delta.text`                                          | `choices[0].delta.content`                             |
| 사용량 필드       | `input_tokens` / `output_tokens` (message\_start와 message\_delta에 걸쳐 분리됨) | `prompt_tokens` / `completion_tokens` / `total_tokens` |
| 종료 사유        | `stop_reason` (`end_turn` 등)                                              | `finish_reason` (`stop` 등)                             |
| `max_tokens` | **필수**                                                                    | 선택 사항                                                  |

<Warning>
  마이그레이션에서 가장 쉽게 빠지는 함정 두 가지는 다음과 같습니다. (1) 답변은 문자열이 아니라 **배열**이므로, `type=="text"` 블록을 처리하려면 `content`을 순회하십시오. (2) 스트리밍에는 \*\*`[DONE]`\*\*가 없으므로, `message_stop` 이벤트를 통해 종료를 감지하십시오.
</Warning>

## 사용 및 과금

* 비스트리밍: `usage`이 결과와 함께 반환되며, 여기에는 `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`가 포함됩니다.
* 스트리밍: `input_tokens`는 `message_start`에 있고, 최종 `output_tokens`은 `message_delta`에 있습니다 — **둘 다 병합합니다**.
* 캐시 적중 필드(`cache_read_input_tokens`)의 할인 및 사용량은 [Claude Cache Billing](/ko/api-capabilities/claude-prompt-caching)을 참조하십시오.

## 관련 링크

* 같은 그룹: [Claude API 기초](/ko/api-capabilities/claude) · [Claude 캐시 과금](/ko/api-capabilities/claude-prompt-caching) · [Claude 요율 배수 및 추론 가이드](/ko/api-capabilities/claude-effort-thinking)
* 호환 형식 대응 항목: [OpenAI 호환 모드: 응답 처리](/ko/api-capabilities/openai/response-handling)
* 토큰 가져오기 / 관리: `https://api.apiyi.com/token`
