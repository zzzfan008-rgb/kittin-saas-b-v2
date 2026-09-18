> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash 텍스트 생성

> Google의 Gemini 3.6 Flash 멀티모달 모델: 1M 컨텍스트, 4가지 추론 단계, 완전한 네이티브 도구 모음. APIYI는 공식 가격으로 네이티브 Gemini 엔드포인트와 OpenAI 호환 엔드포인트를 모두 제공합니다 — 입력 1M tokens당 $1.50 / 출력 1M tokens당 $7.50.

Gemini 3.6 Flash (`gemini-3.6-flash`)은 2026년 7월에 업데이트된 Google의 멀티모달 텍스트 모델입니다(정식 릴리스). text/image/video/audio/PDF 입력을 받아들이며, 1M 컨텍스트 윈도우와 64K 출력을 지원합니다. APIYI는 **완전한 이중 엔드포인트 테스트 패스**(26+5개 사례)를 완료했습니다. 네이티브 Gemini 형식과 OpenAI 호환 형식 모두 별도 설정 없이 바로 동작하며, 네이티브 도구인 Search grounding, code execution, URL context도 정상 동작이 검증되었습니다.

<Info>
  **지금 APIYI에서 사용 가능**: 모델명 `gemini-3.6-flash`, `default` / `svip` 그룹에 있습니다. **추론은 기본적으로 켜져 있습니다**(thinking token은 output으로 과금됩니다) — 지연 시간이나 비용에 민감한 워크로드에서는 추론 단계를 낮추십시오(아래 "추론 제어" 참조). 경량 워크로드에는 더 저렴한 형제 모델 [Gemini 3.5 Flash-Lite](/ko/api-capabilities/gemini-3-5-flash-lite/overview)를 고려하십시오.
</Info>

## 하이라이트

<CardGroup cols={2}>
  <Card title="완전한 네이티브 도구 모음" icon="wrench">
    Google Search 그라운딩, Maps 그라운딩, URL 컨텍스트, 코드 실행, 그리고 Computer Use(미리보기)까지 모두 네이티브 엔드포인트에서 정상 작동이 검증되었으며, Google API Key는 필요하지 않습니다.
  </Card>

  <Card title="완전한 멀티모달 이해" icon="eye">
    이미지, PDF, 오디오 입력이 정확한 것으로 검증되었습니다(동영상은 동일한 파이프라인을 사용합니다). 1M 컨텍스트 윈도우에는 책 한 권이나 코드베이스 전체가 들어갑니다.
  </Card>

  <Card title="4단계 추론 수준" icon="brain">
    thinkingLevel minimal/low/medium/high는 0/403/487/837 추론 token으로 측정되며, 단조적이므로 작업별로 추론 예산을 정밀하게 책정할 수 있습니다.
  </Card>

  <Card title="두 개의 엔드포인트, 마찰 제로" icon="git-fork">
    네이티브 Gemini 형식(공식 SDK, base\_url만 변경하면 됩니다)과 OpenAI 호환 형식이 있으며, 둘 다 공식 요금으로 제공됩니다.
  </Card>
</CardGroup>

## 모델 세부 정보

| 속성           | 값                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **모델 이름**    | `gemini-3.6-flash` (안정적이며, 리다이렉트 별칭 없음)                                                              |
| **입력 모달리티**  | 텍스트, 이미지, 동영상, 오디오, PDF                                                                              |
| **컨텍스트 윈도우** | 입력 1,048,576 / 출력 65,536                                                                             |
| **그룹**       | `default`, `svip`                                                                                    |
| **엔드포인트**    | `POST /v1beta/models/gemini-3.6-flash:generateContent`(네이티브), `POST /v1/chat/completions`(OpenAI 호환) |
| **추론**       | 기본값은 ON이며, 4개의 `thinkingLevel` 단계가 있고 `thinkingBudget: 0`는 비활성화합니다                                   |
| **스트리밍**     | ✅ 두 엔드포인트 모두                                                                                         |

## 검증된 기능 매트릭스

2026년 7월 22일 APIYI 테스트 결과(공식 주장 대비 측정된 동작):

| 기능                                     | 공식                  | Gemini 네이티브                                                                           | OpenAI 호환                                          |
| -------------------------------------- | ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 채팅(비스트리밍 / 스트리밍)                       | ✅                   | ✅ / ✅                                                                                 | ✅ / ✅                                              |
| 시스템 지시                                 | ✅                   | ✅                                                                                     | ✅                                                  |
| 추론(티어 / off / thought echo)            | ✅                   | ✅ 4개 티어 측정값 0–837 token, `includeThoughts` 작동                                         | ✅ `reasoning_effort` 작동, 사용량에 reasoning\_tokens 보고 |
| 이미지 / PDF / 오디오 이해                     | ✅                   | ✅ 모두 검증됨                                                                              | ✅ 이미지(data URL) 검증됨                                |
| 함수 호출                                  | ✅                   | ✅                                                                                     | ✅                                                  |
| 구조화된 출력                                | ✅                   | ✅ responseSchema                                                                      | ✅ json\_schema                                     |
| Google Search grounding                | ✅                   | ✅ 전체 groundingMetadata                                                                | — 네이티브 전용                                          |
| Maps grounding / URL context           | ✅                   | ✅ / ✅                                                                                 | — 네이티브 전용                                          |
| 코드 실행                                  | ✅                   | ⚠️ 실제로 올바른 결과와 함께 실행되는 것은 검증되었지만, `executableCode` 필드는 현재 응답에 그대로 반영되지 않습니다(참고 사항 참조) | — 네이티브 전용                                          |
| Computer Use (미리보기)                    | ✅                   | ✅ action functionCall을 반환합니다                                                          | — 네이티브 전용                                          |
| 암시적 캐싱                                 | ✅                   | ⚠️ 확률적 적중 — 보장된 캐시 적중률은 없습니다                                                          | 동일                                                 |
| 명시적 캐시 API / countTokens / File search | ✅                   | ❌ 아직 플랫폼에서 활성화되지 않았습니다                                                                | —                                                  |
| Batch / Live API / 오디오 생성 / 이미지 생성     | ❌ 또는 게이트웨이에서는 해당 없음 | —                                                                                     | —                                                  |

<Warning>
  **코드 실행 참고 사항**: 테스트 결과 코드는 실제로 상위에서 실행됨을 확인했습니다(암기 불가능한 sha256 작업이 올바른 다이제스트를 반환함). তবে `executableCode` / `codeExecutionResult` 부분은 현재 응답에 그대로 반영되지 않으며, 코드와 그 결과는 대신 텍스트 본문에 나타납니다. 이 두 필드를 별도로 렌더링하는 앱은 유의해야 합니다.
</Warning>

## 가격

| 항목                 | APIYI 가격 (공식과 동일)                |
| ------------------ | -------------------------------- |
| 입력                 | \$1.50 / 1M tokens               |
| 출력 (추론 포함)         | \$7.50 / 1M tokens               |
| Google Search 그라운딩 | \$14 / 1K queries (도구 호출당 과금됩니다) |

<Info>
  **가격 참고**: thinking tokens는 출력으로 과금되므로 추론 티어를 관리해야 하는 주된 이유입니다. APIYI는 공식 가격과 동일하며, 할인은 충전 보너스에서 나옵니다: \$100에 +10%, 최대 +20%(약 17% 할인). [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.
</Info>

## 추론 제어

**추론은 기본적으로 켜져 있습니다**: "1+1"도 먼저 약 200개의 thinking tokens를 생성합니다. 측정된 단계:

| 구성                                                | Thinking tokens (측정값) | 적합한 용도                     |
| ------------------------------------------------- | --------------------- | -------------------------- |
| `thinkingLevel: "minimal"` or `thinkingBudget: 0` | 0                     | 고빈도 단답형 Q\&A, 비용에 민감한 워크로드 |
| `thinkingLevel: "low"`                            | 403                   | 일상적인 추론                    |
| `thinkingLevel: "medium"`                         | 487                   | 중간 복잡도 분석                  |
| `thinkingLevel: "high"`                           | 837+                  | 복잡한 계획, 수학, 코드 분석          |

<Tip>
  `thinkingConfig: {"includeThoughts": true}`를 전달하면 생각 부분을 다시 받을 수 있습니다(`thought: true`로 표시됨); 사용량은 `usageMetadata.thoughtsTokenCount`에 표시됩니다. OpenAI 호환 엔드포인트에서는 `reasoning_effort`(낮음/중간/높음)를 사용하고 `usage.completion_tokens_details.reasoning_tokens`을 확인하십시오.
</Tip>

## 빠른 시작

### 네이티브 Gemini 형식(권장 — 전체 도구 지원)

<CodeGroup>
  ```bash cURL (기본 채팅) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Introduce yourself in one sentence"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingLevel": "minimal"}}
    }'
  ```

  ```python Python (google-genai SDK + Search grounding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents="What was the most important AI release in July 2026?",
      config=types.GenerateContentConfig(
          tools=[types.Tool(google_search=types.GoogleSearch())]
      )
  )
  print(response.text)
  ```

  ```python Python (멀티모달: PDF 이해) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents=[
          types.Part.from_bytes(data=open("report.pdf", "rb").read(),
                                mime_type="application/pdf"),
          "Summarize the key findings of this document"
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
      model="gemini-3.6-flash",
      messages=[{"role": "user", "content": "Analyze the time complexity of this code"}],
      reasoning_effort="high",
      max_tokens=4000
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
    model: 'gemini-3.6-flash',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="네이티브 엔드포인트에 Google API Key가 필요합니까?">
    아니요. APIYI token(`sk-` key)을 `x-goog-api-key` 헤더에 넣으십시오. 공식 google-genai SDK에서는 `base_url`를 `https://api.apiyi.com`로 설정하기만 하면 됩니다.
  </Accordion>

  <Accordion title="OpenAI 호환 엔드포인트에서 Search grounding / code execution이 작동합니까?">
    아니요. google\_search, url\_context, codeExecution, Maps grounding, Computer Use는 네이티브 형식에서만 지원됩니다. OpenAI 호환 엔드포인트는 표준 집합인 chat, streaming, 함수 호출, JSON Schema, 비전을 지원합니다.
  </Accordion>

  <Accordion title="암시적 캐싱으로 얼마나 절감됩니까?">
    반복되는 긴 접두사는 두 번째 요청에서 캐시 적중할 수 있습니다(측정값: 15.9K-token 접두사 중 8,176개)이지만, 적중은 확률적이므로 이를 바탕으로 비용 모델을 설계하지 마십시오. 명시적 cache API(cachedContents)는 아직 플랫폼에서 활성화되어 있지 않습니다.
  </Accordion>

  <Accordion title="Gemini 3.6 Flash 또는 3.5 Flash-Lite입니까?">
    도구, 깊은 사고, 더 강력한 추론에는 3.6 Flash를 선택하십시오. 빈도가 높고 지연 시간과 비용에 민감한 워크로드에는 [3.5 Flash-Lite](/ko/api-capabilities/gemini-3-5-flash-lite/overview)(\$0.30 in / \$2.50 out, 기본적으로 추론을 사용하지 않으며, 대략 2배 빠름)를 선택하십시오.
  </Accordion>
</AccordionGroup>

## 관련

* [Native generateContent 플레이그라운드](/ko/api-capabilities/gemini-3-6-flash/generate-content)
* [Chat Completions 플레이그라운드](/ko/api-capabilities/gemini-3-6-flash/chat-completions)
* [Gemini 3.5 Flash-Lite 개요](/ko/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini 네이티브 호출 가이드](/ko/api-capabilities/gemini/native)
