> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite 텍스트 생성

> Google의 Gemini 3.5 Flash-Lite 저비용 멀티모달 모델입니다: 컨텍스트 윈도우 1M, 기본값으로 추론 없음, 매우 빠름. APIYI는 공식 과금으로 기본 Gemini 및 OpenAI 호환 엔드포인트를 제공합니다 — 입력 $0.30 / 출력 $2.50 per 1M tokens.

Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`)는 2026년 7월에 업데이트된 Google의 경량 멀티모달 모델(안정판)로, 고빈도, 저지연, 저비용 워크로드를 위해 설계되었습니다. 이 모델은 텍스트/이미지/동영상/오디오/PDF 입력을 지원하며 1M 컨텍스트 윈도우와 64K 출력을 제공합니다. APIYI는 **전체 이중 엔드포인트 테스트**(25+5개 사례)를 완료했습니다. 네이티브 Gemini 형식과 OpenAI 호환 형식이 모두 별도 설정 없이 작동하며, 네이티브 도구인 Search grounding, URL 컨텍스트도 작동이 검증되었습니다.

<Info>
  **현재 APIYI에서 사용 가능합니다**: 모델명 `gemini-3.5-flash-lite`, `default` / `svip` 그룹에 있습니다. 3.6 Flash와 달리 — **기본적으로 추론 출력이 없습니다**, 간단한 요청은 저희 테스트에서 약 2초 만에 반환되었습니다. 심층 추론을 명시적으로 활성화하려면 `thinkingLevel: "high"`를 전달하십시오.
</Info>

## 주요 내용

<CardGroup cols={2}>
  <Card title="동급 최고 가성비" icon="circle-dollar-sign">
    100만 token당 입력 \$0.30 / 출력 \$2.50(오디오 입력도 동일한 요율입니다) — 3.6 Flash의 5분의 1에서 3분의 1 수준입니다. 고빈도 및 배치 워크로드에 적합하게 설계되었습니다.
  </Card>

  <Card title="추론 없음, 지연 최소화" icon="zap">
    기본적으로 추론 token을 사용하지 않습니다. 간단한 요청은 \~2초로 측정되며(3.6 Flash에서는 \~4.5초), 지원 봇, 분류, 추출에 바로 사용할 수 있습니다.
  </Card>

  <Card title="완전한 멀티모달 이해" icon="eye">
    이미지, PDF, 오디오에서 정확성이 검증되었습니다(동영상은 동일한 파이프라인을 사용합니다). 주력 모델과 동일한 1M 컨텍스트를 제공합니다.
  </Card>

  <Card title="네이티브 도구 사용 가능" icon="wrench">
    Google Search 연동, Maps 연동, URL 컨텍스트, 코드 실행이 네이티브 엔드포인트에서 작동함이 확인되었습니다 — Google API Key가 필요하지 않습니다.
  </Card>
</CardGroup>

## 모델 세부 정보

| Property     | Value                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **모델 이름**    | `gemini-3.5-flash-lite` (안정적이며 리디렉트 별칭이 없습니다)                                                             |
| **입력 모달리티**  | 텍스트, 이미지, 동영상, 오디오, PDF                                                                                   |
| **컨텍스트 윈도우** | 1,048,576 입력 / 65,536 출력                                                                                  |
| **그룹**       | `default`, `svip`                                                                                         |
| **엔드포인트**    | `POST /v1beta/models/gemini-3.5-flash-lite:generateContent` (원본), `POST /v1/chat/completions` (OpenAI 호환) |
| **추론**       | **기본값은 OFF입니다**; `thinkingLevel: "high"`로 활성화합니다                                                          |
| **스트리밍**     | ✅ 두 엔드포인트 모두                                                                                              |

## 검증된 기능 매트릭스

2026년 7월 22일 APIYI 테스트 결과(공식 주장 대비 측정된 동작):

| 기능                               | 공식                | Gemini 네이티브                                                                | OpenAI 호환                                                 |
| -------------------------------- | ----------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| 채팅(비-stream / stream)            | ✅                 | ✅ / ✅                                                                      | ✅ / ✅                                                     |
| 시스템 지시사항                         | ✅                 | ✅                                                                          | ✅                                                         |
| 추론                               | ✅                 | ✅ `thinkingLevel: "high"`가 트리거됩니다(\~1000 tokens), `includeThoughts`가 작동합니다 | ⚠️ `reasoning_effort`는 수락되지만 reasoning\_tokens가 보고되지 않습니다 |
| 이미지 / PDF / 오디오 이해               | ✅                 | ✅ 모두 검증됨                                                                   | ✅ 이미지(data URL) 검증됨                                       |
| 함수 호출                            | ✅                 | ✅                                                                          | ✅                                                         |
| 구조화된 출력                          | ✅                 | ✅ responseSchema                                                           | ✅ json\_schema                                            |
| Google Search 그라운딩               | ✅                 | ✅ 전체 groundingMetadata                                                     | — 네이티브 전용                                                 |
| Maps 그라운딩 / URL 컨텍스트             | ✅                 | ✅ / ✅                                                                      | — 네이티브 전용                                                 |
| 코드 실행                            | ✅                 | ⚠️ 실제로 올바른 결과로 실행되는 것이 검증되었지만, `executableCode` 필드는 다시 반환되지 않습니다           | — 네이티브 전용                                                 |
| 컴퓨터 사용                           | ❌ 공식적으로 지원되지 않음   | —                                                                          | —                                                         |
| 암시적 캐싱                           | ✅                 | ⚠️ 테스트에서 적중이 관찰되지 않았습니다 — 이를 바탕으로 비용 모델을 세우지 마십시오                          | 동일                                                        |
| 명시적 캐시 API / countTokens / 파일 검색 | 부분 지원             | ❌ 아직 플랫폼에서 활성화되지 않음                                                        | —                                                         |
| 배치 / Live API / 오디오 생성 / 이미지 생성  | ❌ 또는 게이트웨이에서는 N/A | —                                                                          | —                                                         |

## 요금

| 항목                  | APIYI 가격(공식과 동일)              |
| ------------------- | ----------------------------- |
| 입력(텍스트/이미지/동영상/오디오) | \$0.30 / 1M tokens            |
| 출력(추론 포함)           | \$2.50 / 1M tokens            |
| Google Search 기반    | \$14 / 1K queries (도구 호출당 청구) |

<Info>
  **요금 참고**: APIYI는 공식 요금을 그대로 적용합니다. 할인은 충전 보너스에서 발생하며, \$100 충전 시 +10%, 최대 +20% (≈17% 할인)입니다. [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.
</Info>

## 추론 제어

**3.6 Flash의 반대입니다. 이 모델은 기본적으로 생각하지 않기 때문에** 빠르고 저렴합니다. 측정 결과는 다음과 같습니다.

| Config                                 | 추론 token (측정값) | Notes                                          |
| -------------------------------------- | -------------- | ---------------------------------------------- |
| Default / `minimal` / `low` / `medium` | 0              | 이 티어들에서는 단순한 prompt에 대해 어떤 경우에도 추론이 트리거되지 않습니다 |
| `thinkingLevel: "high"`                | \~1000         | 깊은 추론이 안정적으로 트리거됩니다                            |

<Tip>
  실용적인 규칙은 다음과 같습니다. **추론이 필요하면 바로 `high`를 사용하십시오** — 중간 티어들은 단순한 prompt에서 이를 트리거하지 않습니다. `includeThoughts: true`와 함께 사용하면 사고 과정을 확인할 수 있습니다. 워크로드가 지속적으로 깊은 추론을 필요로 한다면 [Gemini 3.6 Flash](/ko/api-capabilities/gemini-3-6-flash/overview)가 더 적합합니다.
</Tip>

## 빠른 시작

### 네이티브 Gemini 형식(권장 — 전체 도구 지원)

<CodeGroup>
  ```bash cURL (기본 채팅, 기본적으로 추론 없음) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.5-flash-lite:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Translate to French: The weather is nice today"}]}]
    }'
  ```

  ```python Python (google-genai SDK, 필요 시 추론) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents="Pipe A fills a pool in 8 hours, pipe B in 12. How long with both open?",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python (이미지 이해) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents=[
          types.Part.from_bytes(data=open("photo.png", "rb").read(),
                                mime_type="image/png"),
          "Describe this image"
      ]
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI 호환 형식(기존 코드에 바로 적용 가능)

<CodeGroup>
  ```python Python (OpenAI SDK) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content":
                 "Classify this review as positive/negative/neutral: fast shipping, mediocre packaging"}]
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (스트리밍) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.5-flash-lite',
    messages: [{ role: 'user', content: 'Summarize how RAG works in three sentences' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Flash-Lite를 3.6 Flash보다 언제 선택해야 합니까?">
    처리량 우선 워크로드에는 Flash-Lite를 선택하십시오 — 고빈도 질의응답, 분류, 추출, 번역, 지원 봇에 적합합니다(약 2배 빠르고 비용은 5분의 1까지 내려갑니다). 심층 추론, 복잡한 계획, 또는 컴퓨터 사용에는 [3.6 Flash](/ko/api-capabilities/gemini-3-6-flash/overview)를 선택하십시오.
  </Accordion>

  <Accordion title="네이티브 엔드포인트에 Google API 키가 필요합니까?">
    아니요. APIYI token(`sk-` 키)을 `x-goog-api-key` 헤더에 넣으십시오. 공식 google-genai SDK에서는 `base_url`를 `https://api.apiyi.com`로 설정하기만 하면 됩니다.
  </Accordion>

  <Accordion title="추론 비용을 어떻게 모니터링합니까?">
    네이티브 엔드포인트에서는 `usageMetadata.thoughtsTokenCount`를 확인하십시오. 참고로 OpenAI 호환 엔드포인트는 이 모델에 대해 `reasoning_tokens`를 보고하지 않으므로, 정확한 관찰에는 네이티브 엔드포인트를 사용하십시오.
  </Accordion>

  <Accordion title="암시적 캐시가 적중합니까?">
    15.9K-token의 공유 접두사를 가진 연속된 세 요청에서 적중은 0건이었습니다(같은 조건에서 3.6 Flash는 한 번 적중했습니다). 캐시 적중을 바탕으로 비용 모델을 세우지 마십시오. 명시적 캐시 API는 아직 플랫폼에서 활성화되지 않았습니다.
  </Accordion>
</AccordionGroup>

## 관련

* [Native generateContent 플레이그라운드](/ko/api-capabilities/gemini-3-5-flash-lite/generate-content)
* [Chat Completions 플레이그라운드](/ko/api-capabilities/gemini-3-5-flash-lite/chat-completions)
* [Gemini 3.6 Flash 개요](/ko/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 네이티브 호출 가이드](/ko/api-capabilities/gemini/native)
