> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 네이티브 형식 가이드

> APIYI를 통해 공식 Gemini generateContent 형식을 호출합니다: google-genai SDK 설정, 스트리밍, thinking_level 제어, 사고 서명.

APIYI는 **공식 Gemini 네이티브 형식**(즉, `/v1beta` generateContent 엔드포인트)을 완전히 지원합니다. base\_url을 `https://api.apiyi.com`로 지정하면 기존 Gemini 코드와 공식 SDK가 매끄럽게 이전되며, 형식 변환이 필요하지 않습니다.

이 페이지는 공식 Google 문서(`ai.google.dev/gemini-api/docs`, 2026년 6월 기준)를 바탕으로 작성되었습니다. 모든 예시는 복사해 바로 붙여넣을 수 있습니다.

## 네이티브 형식을 사용하는 이유

OpenAI 호환 형식으로도 Gemini를 호출할 수 있지만, 다음 기능은 **네이티브 전용**입니다:

* **완전한 추론 제어**: `thinking_level` (Gemini 3 series) / `thinking_budget` (2.5 series), 사고 요약, 사고 서명
* **네이티브 멀티모달 Parts**: 인라인 이미지 / 오디오 / 비디오, `media_resolution` 비용 제어 포함 — [멀티모달 및 코드 실행](/ko/api-capabilities/gemini/multimodal) 참조
* **코드 실행 도구**: `code_execution`가 샌드박스에서 Python을 실행합니다
* **세분화된 사용량 필드**: `thoughts_token_count`, `cached_content_token_count` 등

일반 텍스트 채팅이나 여러 벤더에서 하나의 코드베이스를 사용할 때는 대신 [OpenAI 호환 모드](/ko/api-capabilities/openai/compatible)를 사용하십시오.

## 빠른 시작

Google의 공식 통합 SDK `google-genai`를 사용하십시오(기존 `google-generative-ai`는 2025년 11월 30일(UTC)에 종료되었습니다):

```bash theme={null}
pip install google-genai
```

<CodeGroup>
  ```python Python theme={null}
  from google import genai

  client = genai.Client(
      api_key="YOUR_API_KEY",  # your APIYI key
      http_options={"base_url": "https://api.apiyi.com"}
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash",
      contents="Introduce yourself in one sentence"
  )
  print(response.text)
  ```

  ```javascript Node.js theme={null}
  import { GoogleGenAI } from '@google/genai';

  const ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY',
    httpOptions: { baseUrl: 'https://api.apiyi.com' }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: 'Introduce yourself in one sentence'
  });
  console.log(response.text);
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{
      "contents": [{
        "parts": [{"text": "Introduce yourself in one sentence"}]
      }]
    }'
  ```
</CodeGroup>

<Warning>
  base\_url은 `https://api.apiyi.com` (**없이** `/v1`) — OpenAI 호환 형식의 `https://api.apiyi.com/v1`와는 다릅니다. **APIYI 키**를 사용하고, Google AI Studio 키는 사용하지 마십시오.
</Warning>

## Streaming

```python theme={null}
stream = client.models.generate_content_stream(
    model="gemini-3.5-flash",
    contents="Write a short essay on quantum computing"
)

for chunk in stream:
    print(chunk.text, end="", flush=True)
```

## 추론 제어

Gemini 모델은 기본적으로 추론하며, **두 세대는 서로 다른 매개변수를 사용하므로 혼용하면 오류가 발생합니다**:

| 모델 시리즈               | 매개변수              | 값                                                |
| -------------------- | ----------------- | ------------------------------------------------ |
| Gemini 3 / 3.1 / 3.5 | `thinking_level`  | `minimal` (Flash 패밀리만 해당) / `low` / `high` (기본값) |
| Gemini 2.5           | `thinking_budget` | token 한도(예: 0–8192); 미설정 시 모델이 자동으로 제어합니다        |

<Warning>
  Gemini 3 시리즈 모델에 `thinking_level`와 `thinking_budget`를 모두 전달하면 **오류를 반환합니다** — 하나만 선택하십시오(3 시리즈에는 `thinking_level`를 사용하십시오).
</Warning>

```python theme={null}
from google.genai import types

# Gemini 3 series: level-based control
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Prove that the square root of 2 is irrational",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high")
    )
)

# Gemini 2.5 series: token-budget control
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Simple question, be quick",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)  # thinking off
    )
)
```

수준 선택: `minimal`은 지연 시간이 짧은 단순 작업(분류, 추출)에 적합합니다; `low`은 일반적인 채팅에 적합합니다; `high`은 복잡한 추론과 코드에 적합합니다. Thinking token은 **출력 요율**로 과금되므로, 수준이 높을수록 비용이 더 듭니다.

### 추론 요약 및 추론 서명

* **추론 요약**: `include_thoughts=True`는 추론의 요약을 반환합니다(`part.thought`이 `True`인 부분)
* **추론 서명**: Gemini 3에서 도입된 암호화된 추론 상태입니다. 멀티턴 대화(특히 function calling)에서는 응답의 `thought_signature`를 변경하지 않은 채 다시 전달해야 모델이 추론 체인을 계속할 수 있습니다. **공식 SDK는 이를 자동으로 처리합니다**; 수동으로 작성한 REST 호출에서는 해당 필드를 제거하지 마십시오 — [함수 호출](/ko/api-capabilities/gemini/function-calling)을 참조하십시오

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Analyze the time complexity of: def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high", include_thoughts=True)
    )
)

for part in response.candidates[0].content.parts:
    if getattr(part, "thought", False):
        print(f"[Thought summary] {part.text}")
    else:
        print(f"[Final answer] {part.text}")
```

## 공통 구성 매개변수

`config` (`GenerateContentConfig`)을 통해 전달됩니다:

| 매개변수                 | 설명                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------- |
| `system_instruction` | 시스템 prompt                                                                         |
| `temperature`        | 0–2. **Google은 Gemini 3 시리즈에서 기본값 1.0을 유지할 것을 권장합니다** — 이 값을 낮추면 추론 품질이 저하될 수 있습니다 |
| `max_output_tokens`  | 출력 상한(생각 token 포함)                                                                 |
| `thinking_config`    | 추론 제어, 위를 참조하십시오                                                                   |
| `response_mime_type` | JSON 출력을 강제하려면 `application/json`을 설정하십시오                                          |
| `response_schema`    | 구조화된 JSON 출력에 대한 스키마 제약                                                            |
| `tools`              | 함수 선언 / `code_execution` 및 기타 tools                                                |
| `media_resolution`   | 멀티모달 입력 비용 제어, [Multimodal 페이지](/ko/api-capabilities/gemini/multimodal)를 참조하십시오    |

## 사용 항목 (usage\_metadata)

```python theme={null}
usage = response.usage_metadata
print(f"Input: {usage.prompt_token_count}")
print(f"Output: {usage.candidates_token_count}")
print(f"Thinking: {usage.thoughts_token_count}")
print(f"Cache hits: {usage.cached_content_token_count}")
```

| Field                        | Description     | 과금                                                            |
| ---------------------------- | --------------- | ------------------------------------------------------------- |
| `prompt_token_count`         | Input tokens    | 입력 요율                                                         |
| `candidates_token_count`     | Output tokens   | 출력 요율                                                         |
| `thoughts_token_count`       | Thinking tokens | **출력 요율** — 수준을 조정하여 절약                                       |
| `cached_content_token_count` | Cached tokens   | 공식 할인, [캐시 과금](/ko/api-capabilities/gemini/prompt-caching) 참조 |
| `total_token_count`          | Total           | —                                                             |

## 지원되는 모델 및 요금

| 모델                       | 입력(1M tokens당) | 출력(1M tokens당) | 비고                                             |
| ------------------------ | -------------- | -------------- | ---------------------------------------------- |
| `gemini-3.5-flash`       | \$1.50         | \$9.00         | 현재 주력 모델 — 여러 벤치마크에서 3.1 Pro를 앞서며, 1M 컨텍스트 윈도우 |
| `gemini-3.1-pro-preview` | \$1.80         | \$10.80        | Pro 플래그십                                       |
| `gemini-3-pro-preview`   | \$1.80         | \$10.80        | 이전 Pro                                         |
| `gemini-3-flash-preview` | \$0.44         | \$2.64         | 가볍고 빠름                                         |
| `gemini-3.1-flash-lite`  | \$0.25         | \$1.50         | 초저가                                            |
| `gemini-2.5-pro`         | \$1.25         | \$10.00        | 2.5 시리즈 Pro                                    |
| `gemini-2.5-flash`       | \$0.30         | \$2.40         | 2.5 시리즈 주력 모델                                  |
| `gemini-2.5-flash-lite`  | \$0.10         | \$0.40         | 가장 저렴함                                         |

<Tip>
  일부 모델에는 `-thinking` / `-nothinking` 별칭 변형(예: `gemini-3-flash-preview-nothinking`)이 있으며, 이를 통해 thinking을 켜거나 끈 상태로 고정할 수 있습니다. 요청 매개변수를 바꿀 수 없는 클라이언트에 유용합니다. 전체 목록: [Models & Pricing](/ko/api-capabilities/model-info).
</Tip>

## 네이티브 vs OpenAI 호환

| 기능         | Gemini 네이티브                          | OpenAI 호환                  |
| ---------- | ------------------------------------ | -------------------------- |
| base\_url  | `https://api.apiyi.com`              | `https://api.apiyi.com/v1` |
| SDK        | `google-genai`                       | `openai`                   |
| 추론 제어      | `thinking_level` / `thinking_budget` | `reasoning_effort`         |
| 사고 요약 / 서명 | ✅                                    | ❌                          |
| 코드 실행 도구   | ✅                                    | ❌                          |
| 미디어 입력     | 네이티브 인라인 Parts (PIL / bytes)         | Base64 image\_url          |
| 캐시 적중 필드   | `cached_content_token_count`         | `cached_tokens`            |

## 참고

* **Files API는 지원되지 않습니다** (`client.files.upload()`); 미디어는 인라인으로 전달해야 하며 **각 파일은 20MB 미만이어야 합니다** — [Multimodal & Code Execution](/ko/api-capabilities/gemini/multimodal)을 참조하십시오
* 캐시 할인과 캐시 적중률 기대치: [캐시 과금](/ko/api-capabilities/gemini/prompt-caching)

## 관련 링크

* 이 그룹: [Multimodal & Code Execution](/ko/api-capabilities/gemini/multimodal) · [Cache Billing](/ko/api-capabilities/gemini/prompt-caching) · [Function Calling](/ko/api-capabilities/gemini/function-calling)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
* Google 공식 문서: `ai.google.dev/gemini-api/docs`
