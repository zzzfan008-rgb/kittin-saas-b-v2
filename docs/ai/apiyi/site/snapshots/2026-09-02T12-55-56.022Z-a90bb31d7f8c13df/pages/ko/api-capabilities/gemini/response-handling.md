> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 네이티브 형식: 스트리밍 및 비스트리밍 응답

> Gemini의 네이티브 generateContent / streamGenerateContent 응답 구조: candidates/parts, thoughtSignature, SSE 스트리밍, 그리고 파싱과 필드 참조입니다.

[Gemini의 네이티브 형식](/ko/api-capabilities/gemini/native) (`/v1beta` generateContent)을 호출하면 응답은 OpenAI 호환 모드와 다른 Google의 `candidates / parts` 구조를 사용합니다. 이 페이지에서는 비스트리밍(`generateContent`)과 스트리밍(`streamGenerateContent`) 응답을 모두 파싱하는 방법을 설명합니다.

<Info>
  요청 측(base\_url은 `https://api.apiyi.com`에서 `/v1`, `x-goog-api-key` 인증, `thinking_level` 제어를 제외한 값입니다)은 [Gemini 네이티브 형식 가이드](/ko/api-capabilities/gemini/native)에서 다룹니다. 이 페이지는 순전히 **응답 측**에 대한 내용입니다. 예제에서는 경량 모델 `gemini-3.1-flash-lite`을 사용합니다.
</Info>

## 비스트리밍 응답

엔드포인트 `…:generateContent`. **답변은 `candidates[0].content.parts[]`에 있습니다**:

```json theme={null}
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [
        { "text": "1+1 equals 2.", "thoughtSignature": "EjQKMgEM…" }
      ]
    },
    "finishReason": "STOP",
    "index": 0
  }],
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 6,
    "totalTokenCount": 21
  },
  "modelVersion": "gemini-3.1-flash-lite",
  "responseId": "Il0taoSYJ5Cez7…"
}
```

답변을 얻으려면 **`parts`를 반복**하고 각 `text`를 이어 붙여야 합니다:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
      json={"contents": [{"parts": [{"text": "What is 1+1?"}]}]},
      timeout=60,
  )
  data = resp.json()
  parts = data["candidates"][0]["content"]["parts"]
  text = "".join(p["text"] for p in parts if "text" in p)
  print(text)
  print(data["usageMetadata"])
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{"contents":[{"parts":[{"text":"What is 1+1?"}]}]}'
  ```
</CodeGroup>

<Note>
  `finishReason`은 **대문자** `STOP`입니다( OpenAI의 소문자 `stop`가 아닙니다); 다른 값으로는 `MAX_TOKENS`과 `SAFETY`가 있습니다. `part`에는 `thoughtSignature`만 포함될 수 있고 `text`는 포함되지 않을 수 있으므로, 반복할 때 `if "text" in p`로 필터링하십시오. 그렇지 않으면 KeyError가 발생합니다.
</Note>

## 추론 서명

Gemini 3-series 모델은 일부에 `thoughtSignature`(암호화된 추론 상태)를 첨부합니다 — **테스트에서는 경량 `gemini-3.1-flash-lite`도 이를 반환합니다**.

* **단일 턴**: 필요하지 않습니다. 무시하십시오.
* **멀티 턴 / 함수 호출**: 이전 응답의 `thoughtSignature`를 다음 턴의 `contents`에 그대로 다시 전달해야 모델이 추론 체인을 계속 이어갈 수 있습니다. 공식 `google-genai` SDK가 이를 자동으로 처리합니다. REST를 직접 작성할 때는 필드를 누락하지 마십시오. [Gemini Function Calling](/ko/api-capabilities/gemini/function-calling)을 참조하십시오.

<Tip>
  이것이 [OpenAI 호환 모드](/ko/api-capabilities/openai/reasoning-models)와의 핵심 차이입니다: 호환 모드에서는 reasoning 모델이 상태를 유지하지 않으며 서명도 노출하지 않습니다. 기본 형식에만 `thoughtSignature`가 있으며, 이는 턴 간에 다시 전달해야 합니다.
</Tip>

## 스트리밍 응답(SSE)

엔드포인트 `…:streamGenerateContent`입니다. 각 줄은 `data: {...}`이며, 각 청크의 증분은 `candidates[0].content.parts[0].text`에 있습니다:

```text theme={null}
data: {"candidates":[{"content":{"parts":[{"text":"1"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"text":"+1 equals 2."}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"thoughtSignature":"EjQK…"}]},"finishReason":"STOP","index":0}],"usageMetadata":{...}}
```

<Warning>
  **APIYI 게이트웨이를 통해 스트리밍하면 항상 SSE `data:` 줄이 반환됩니다** (`?alt=sse`이 있든 없든), 그리고 **`[DONE]` 종료 표시**는 없습니다 — `finishReason == "STOP"`인 청크에서 끝납니다. 마지막 청크에는 보통 **`thoughtSignature`만 포함되고 `text`는 없습니다**.
</Warning>

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse",
    headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
    json={"contents": [{"parts": [{"text": "Write a short poem"}]}]},
    stream=True, timeout=120,
)

text, usage = "", None
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    chunk = json.loads(line[6:])
    usage = chunk.get("usageMetadata", usage)        # cumulative; later overrides
    for cand in chunk.get("candidates", []):
        for p in cand.get("content", {}).get("parts", []):
            if "text" in p:                          # skip signature-only chunks
                text += p["text"]
                print(p["text"], end="", flush=True)
print("\n", usage)
```

<Note>
  `usageMetadata`는 **모든 청크에 존재하며 누적됩니다**(`candidatesTokenCount`가 출력과 함께 증가합니다) — 마지막 청크의 값을 **그대로 사용하면 되며**, 수동으로 합산할 필요가 없습니다.
</Note>

## OpenAI 호환 모드와의 주요 차이점

| 항목          | Gemini 네이티브 (`/v1beta`)                   | OpenAI 호환 (`/v1/chat/completions`) |
| ----------- | ----------------------------------------- | ---------------------------------- |
| base\_url   | `https://api.apiyi.com` (`/v1` 없음)        | `https://api.apiyi.com/v1`         |
| Auth header | `x-goog-api-key`                          | `Authorization: Bearer`            |
| 응답 위치       | `candidates[0].content.parts[].text`      | `choices[0].message.content`       |
| 스트림 증가분     | 각 청크의 `parts[].text`                      | `choices[0].delta.content`         |
| 스트림 종료자     | `finishReason == "STOP"`, **`[DONE]` 없음** | `data: [DONE]`                     |
| 종료 사유       | 대문자 `STOP` / `MAX_TOKENS`                 | 소문자 `stop`                         |
| 사고 시그니처     | ✅ `thoughtSignature` (턴 간 다시 전달)          | ❌ 노출되지 않음                          |
| 사용량         | `usageMetadata` (각 스트림 청크마다 누적)           | `usage` (한 번, 스트림 끝에서)             |

## 사용 및 과금

```python theme={null}
u = data["usageMetadata"]
# promptTokenCount  input / candidatesTokenCount output / thoughtsTokenCount thinking / totalTokenCount total
```

* `thoughtsTokenCount`(thinking tokens)는 **출력 요율**로 과금됩니다. 비용을 절감하려면 `thinking_level`를 사용해 상한을 설정하십시오.
* 캐시 적중 필드(`cachedContentTokenCount`) 할인은 [Gemini Cache Billing](/ko/api-capabilities/gemini/prompt-caching)을 참조하십시오.
* 전체 필드 참조는 [Gemini Native Format Guide](/ko/api-capabilities/gemini/native)의 "사용 필드" 섹션에 있습니다.

## 관련 링크

* 동일 그룹: [Gemini 네이티브 형식 가이드](/ko/api-capabilities/gemini/native) · [멀티모달 및 코드 실행](/ko/api-capabilities/gemini/multimodal) · [함수 호출](/ko/api-capabilities/gemini/function-calling)
* 호환 형식 대응 문서: [OpenAI 호환 모드: 응답 처리](/ko/api-capabilities/openai/response-handling)
* token 획득 / 관리: `https://api.apiyi.com/token`
