> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash 텍스트 생성

> APIYI에서 제공하는 Google의 Gemini 3.8 Flash 멀티모달 텍스트 모델입니다. 두 엔드포인트 모두 이용 가능하며, 100만 tokens당 입력 $0.75 / 출력 $3.75로 3.6 Flash의 절반입니다. 출시 전 테스트 결과 150건과 3.6 / 3.7에서의 마이그레이션 참고 사항을 포함합니다.

Gemini 3.8 Flash (`gemini-3.8-flash`)는 Google이 2026년 9월 2일 출시한 멀티모달 텍스트 모델로, 텍스트, 이미지, 동영상 및 오디오 입력을 지원합니다. APIYI는 **Gemini 네이티브** 및 **OpenAI 호환** 엔드포인트를 모두 제공하며, 출시 전에 `gemini-3.7-flash`를 기준으로 두 프로토콜에 걸쳐 **150개의 쌍으로 구성된 테스트 케이스**를 실행했습니다.

<Info>
  **Gemini 3.8 Flash를 APIYI에서 사용할 수 있습니다**: 모델 이름은 `gemini-3.8-flash`이며, `default` 및 `svip` 그룹에서 사용할 수 있습니다. **심층 사고가 기본적으로 활성화**되어 있으며 사고 token은 출력으로 과금되므로, 지연 시간 및 비용에 민감한 경로에서는 사고 단계를 낮추거나 끄시기 바랍니다(아래의 “사고 제어” 참조).
</Info>

<Warning>
  **공식 사양은 아직 공개되지 않았습니다**: 이 페이지 기준으로 Google의 Gemini API 모델 목록과 DeepMind 모델 카드 어디에도 3.8 Flash가 포함되어 있지 않으며, 출시 블로그 게시물도 아직 없습니다. 따라서 여기서는 **컨텍스트 윈도우, 최대 출력, 지식 기준일 및 공식 벤치마크 점수가 모두 “공개되지 않음”으로 표시**되어 있습니다. APIYI는 해당 정보를 중계하거나 추측하지 않습니다. 측정값으로 표시된 모든 정보는 APIYI 자체 테스트에서 얻은 것이며, 공식 자료가 공개되면 반영할 예정입니다.
</Warning>

## 차별화되는 점

<CardGroup cols={2}>
  <Card title="3.6 Flash의 절반 가격" icon="dollar-sign">
    1M tokens당 입력 \$0.75 / 출력 \$3.75 — 3.6 Flash(\$1.50 / \$7.50)의 절반이며, 3.7 Flash와 줄 단위로 동일하므로 3.7에서 마이그레이션하는 데 비용이 들지 않습니다.
  </Card>

  <Card title="출시 전 테스트 사례 150개" icon="clipboard-check">
    두 프로토콜 모두에서 3.7 Flash를 대상으로 동시에 실행했습니다. 핵심 기능, 추론, 병렬 도구 호출, 이미지/동영상 이해가 모두 일치하며 3.8에만 해당하는 회귀는 없습니다.
  </Card>

  <Card title="두 엔드포인트 모두 마찰 없이 사용 가능" icon="git-fork">
    Gemini 네이티브 형식(공식 SDK, Google API 키 불필요)과 OpenAI 호환 형식(base\_url만 변경)은 모두 사용할 수 있습니다.
  </Card>

  <Card title="거의 제로에 가까운 마이그레이션 비용" icon="arrow-right-arrow-left">
    3.7 Flash에서 모델 이름을 한 줄만 변경하면 됩니다. 요청 형식, 매개변수, 응답 필드는 변경되지 않으며, 필드 집합 차이 하나와 측정된 타입 변경 0건만 존재합니다.
  </Card>
</CardGroup>

## 모델 정보

| 필드                   | 값                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **모델 이름**            | `gemini-3.8-flash`                                                                                     |
| **입력 모달리티**          | 텍스트, 이미지, 동영상, 오디오 (이미지 및 동영상 확인됨)                                                                     |
| **출력 모달리티**          | 텍스트                                                                                                    |
| **컨텍스트 윈도우 / 최대 출력** | Google에서 공개하지 않음                                                                                       |
| **지식 기준일**           | Google에서 공개하지 않음                                                                                       |
| **그룹**               | `default`, `svip`                                                                                      |
| **엔드포인트**            | `POST /v1beta/models/gemini-3.8-flash:generateContent` (네이티브), `POST /v1/chat/completions` (OpenAI 호환) |
| **심층 사고**            | 기본적으로 켜짐; `thinkingLevel`에는 세 가지 단계(낮음 / 중간 / 높음)가 있으며, `thinkingBudget: 0`은 이를 끔                      |
| **스트리밍**             | ✅ 두 엔드포인트 모두 켜짐                                                                                        |

## 측정된 기능 매트릭스

2026년 9월 2일 APIYI 테스트 결과 — 150개 사례 로그와 198회의 호출을 포함하며, 시간대의 영향을 배제하기 위해 모든 사례를 `gemini-3.7-flash`에 **동시에** 실행했습니다.

| 기능                                    | Gemini 네이티브                                | OpenAI 호환                | 3.7 Flash 대비           |
| ------------------------------------- | ------------------------------------------ | ------------------------ | ---------------------- |
| 기본 채팅(비스트리밍 / 스트리밍)                   | ✅ / ✅                                      | ✅ / ✅                    | 동일                     |
| 시스템 지침                                | ✅                                          | ✅                        | 동일                     |
| 멀티턴                                   | ✅                                          | ✅                        | 동일                     |
| 긴 컨텍스트 조회(14.5K자 접두부, 128-token 제한)   | ✅                                          | ✅                        | 동일한 답변                 |
| 구조화된 출력                               | ✅ responseSchema                           | ✅ json\_schema           | 반환된 JSON이 바이트 단위로 동일   |
| 함수 호출(단일 / 반환 처리 / 순차)                | ✅                                          | ✅                        | 동일                     |
| **병렬 함수 호출**                          | ✅ 두 라운드에 걸쳐 인수와 ID가 그대로 유지된 두 번의 호출        | ✅                        | 동일                     |
| 이미지 이해                                | ✅ 2/2                                      | ✅ 2/2                    | IMAGE 모달리티 token 수가 동일 |
| 동영상 이해                                | ✅ 2/2                                      | ✅ 2/2                    | VIDEO 모달리티 token 수가 동일 |
| 코드 실행(`codeExecution`)                | ✅ 정답                                       | — 네이티브 전용                | 동일                     |
| URL 컨텍스트(`urlContext`)                | ✅ `urlContextMetadata` 반환; 실제로 페이지를 가져옴    | — 네이티브 전용                | 동일                     |
| 추론 단계 low / medium / high             | ✅ 추론 token이 단조롭게 증가                        | ✅ `reasoning_effort` 적용됨 | 동일                     |
| `stopSequences` / `stop`              | ✅ 엄격하게 적용됨                                 | ⚠️ 효과 없음                 | 동일                     |
| `temperature=0` + `topK=1` + `seed`   | ✅ 두 실행 결과가 단어 단위로 동일                       | ⚠️ 두 실행 결과가 다름           | 동일                     |
| `safetySettings`                      | ✅ 수락되며 `safetyRatings` 반환                  | — 네이티브 전용                | 동일                     |
| Google 검색 그라운딩                        | ⚠️ 요청은 수락되지만 `groundingMetadata` 없음(아래 참조) | — 네이티브 전용                | 동일                     |
| 암시적 캐싱                                | ⚠️ 연속 8라운드 동안 적중이 관찰되지 않음                  | 동일                       | 동일                     |
| 명시적 `cachedContents` / `:countTokens` | ❌ 플랫폼에서 활성화되지 않음                           | —                        | 동일                     |

<Warning>
  **검색 그라운딩은 확인되지 않음**: `tools: [{"googleSearch": {}}]`을 전달하면 올바른 답변과 함께 200을 반환하지만, 응답에 **`groundingMetadata`이 없음**은 해당 답변이 실시간 검색이 아니라 모델 자체 지식에서 나왔음을 의미합니다. 동일한 실행에서 `gemini-3.7-flash`도 똑같이 동작했으며, 이는 **모델 기능의 차이가 아니라 라우트 수준의 활성화**임을 나타냅니다. 실시간 검색 결과에 의존한다면 그라운딩이 활성화되어 있다고 전제하고 설계하기보다 먼저 트래픽의 일부에서 확인하십시오.
</Warning>

## 가격

| 항목        | APIYI 가격            |
| --------- | ------------------- |
| 입력        | \$0.75 / 1M tokens  |
| 출력(추론 포함) | \$3.75 / 1M tokens  |
| 캐시 읽기     | \$0.075 / 1M tokens |

`gemini-3.7-flash`와 **한 줄 한 줄 동일하므로**, 3.7에서 마이그레이션해도 비용에는 아무런 변화가 없습니다. 3.6 Flash(\$1.50 / \$7.50)과 비교하면 **정확히 절반**입니다.

<Info>
  **가격 관련 안내**: 추론 token은 출력으로 과금됩니다. 이것이 추론 등급을 관리해야 하는 가장 직접적인 이유입니다. Google은 3.8 Flash의 공식 가격을 발표하지 않았습니다. 참고로 현재 3.7 Flash에 적용 중인 \$0.75 / \$3.75는 Google 자체의 기간 한정 프로모션 요율이며, 2026년 12월 31일까지 유효하다고 명시되어 있습니다. APIYI 가격은 제공업체의 가격과 한 줄 한 줄 일치하며, 할인은 충전 보너스를 통해 적용됩니다. 자세한 내용은 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.
</Info>

## 사고 제어

**심층 사고는 기본적으로 활성화되어 있습니다**: “1+1” 프롬프트도 먼저 수백 개의 사고 token을 소모합니다. 세 가지 계층에서 동일한 질문과 네이티브 엔드포인트를 사용해 측정한 결과입니다.

| 설정                                      | 사고 token(측정값)                   | 적합한 용도                     |
| --------------------------------------- | ------------------------------- | -------------------------- |
| `thinkingConfig: {"thinkingBudget": 0}` | 0 (응답에 `thoughtsTokenCount` 없음) | 빈도가 높은 짧은 프롬프트, 비용에 민감한 경로 |
| `thinkingLevel: "low"`                  | 84                              | 일상적인 추론                    |
| `thinkingLevel: "medium"`               | 127                             | 중간 정도로 복잡한 분석              |
| `thinkingLevel: "high"`                 | 263                             | 복잡한 계획 수립, 수학, 코드 분석       |

<Warning>
  **`minimal` 계층은 사라졌습니다** (3.6 Flash에는 있었지만 3.8에는 없음): 네이티브 엔드포인트는 `thinkingLevel: "minimal"`에 대해 400 `Thinking level is unsupported: THINKING_LEVEL_MINIMAL`을 반환합니다. 사고를 완전히 끄려면 `thinkingConfig: {"thinkingBudget": 0}`를 사용합니다.

  **OpenAI 호환 엔드포인트는 더 주의해야 합니다**: `reasoning_effort: "minimal"`은 **오류를 발생시키지 않습니다** — 200을 반환하지만, 실제로는 여전히 사고 token 76개를 소모하며 출력으로 과금됩니다. 이 매개변수는 조용히 무시되고 사고는 계속 수행됩니다. `minimal`가 여전히 설정된 3.6 Flash용 코드를 그대로 가져오더라도 변경이 필요하다는 오류가 표시되지 않습니다.
</Warning>

<Tip>
  추론을 확인하려면 `thinkingConfig: {"includeThoughts": true}`를 전달합니다. 그러면 응답에 `thought: true`으로 표시된 사고 부분이 포함되며, 사용량은 `usageMetadata.thoughtsTokenCount`에 표시됩니다. OpenAI 호환 엔드포인트에서는 `reasoning_effort`(낮음 / 중간 / 높음)을 사용하고 `usage.completion_tokens_details.reasoning_tokens`를 읽습니다.
</Tip>

## 예시

### Gemini 고유 형식 (권장, 더 폭넓은 tools 지원)

<CodeGroup>
  ```bash cURL (기본 채팅, 사고 끔) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Introduce yourself in one sentence"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingBudget": 0}}
    }'
  ```

  ```python Python (google-genai SDK) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="Analyze the time complexity of this code and suggest optimizations",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python (URL 문맥, 작동 검증 완료) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="Summarize what https://ai.google.dev/gemini-api/docs covers",
      config=types.GenerateContentConfig(
          tools=[types.Tool(url_context=types.UrlContext())]
      )
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI 호환 형식 (기존 코드 변경 없음)

<CodeGroup>
  ```python Python (OpenAI SDK) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.8-flash",
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
    model: 'gemini-3.8-flash',
    messages: [{ role: 'user', content: 'Write a short poem about autumn' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 마이그레이션 가이드

<AccordionGroup>
  <Accordion title="gemini-3.7-flash에서 마이그레이션하는 경우">
    **모델 이름만 변경하면 됩니다.** 요청 형식, 매개변수 및 응답 필드는 변경 없이 테스트되었으며, 한 그룹에서 응답 필드 집합만 다르고 타입 변경은 없으므로 클라이언트를 조정할 필요가 없습니다. 과금은 동일하므로 기존 예산을 그대로 사용할 수 있습니다.
  </Accordion>

  <Accordion title="gemini-3.6-flash에서 마이그레이션하는 경우">
    가격이 **절반으로 인하**되지만(입력 \$1.50 → \$0.75, 출력 \$7.50 → \$3.75), 한 가지를 변경해야 합니다. **`thinkingLevel: "minimal"`은 더 이상 지원되지 않으며** 네이티브 엔드포인트에서 400을 반환하므로 `thinkingConfig: {"thinkingBudget": 0}`로 전환해야 합니다. OpenAI 호환 엔드포인트에서는 `reasoning_effort: "minimal"`에 오류가 발생하지 않지만 자동으로 무시되며 추론에 대한 과금은 계속되므로 이 부분도 수정해야 합니다.
  </Accordion>

  <Accordion title="컨텍스트 한도는 얼마입니까?">
    Google은 이를 공개하지 않았으며, 3.7의 수치로 추론하지도 않을 것입니다. 14.5K자의 접두사가 포함된 긴 컨텍스트 조회 작업은 테스트를 통과했습니다. **긴 컨텍스트에 크게 의존한다면 먼저 트래픽의 일부에서 점진적으로 적용하고**, 한도를 확인한 다음 전환하십시오. 공식 사양이 발표되면 이 페이지를 업데이트하겠습니다.
  </Accordion>

  <Accordion title="네이티브 엔드포인트에 Google API 키가 필요합니까?">
    아닙니다. `sk-`로 시작하는 APIYI 키를 `x-goog-api-key` 헤더에 직접 입력하십시오. 공식 google-genai SDK를 사용하는 경우에는 `base_url`가 `https://api.apiyi.com`를 가리키도록 설정하십시오.
  </Accordion>

  <Accordion title="네이티브 전용 기능은 무엇입니까?">
    코드 실행, URL 컨텍스트, `safetySettings`, 그리고 `stopSequences` 및 `seed`의 엄격한 처리는 Gemini 네이티브 엔드포인트에서만 사용할 수 있습니다. OpenAI 호환 엔드포인트는 일반적인 기능 범위(채팅 / 스트리밍 / 함수 호출 / JSON 스키마 / 비전)를 지원하지만, `stop` 및 `seed`은 해당 엔드포인트에서 효과가 없는 것으로 테스트되었습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Gemini 3.8 Flash 출시 노트(전체 테스트 데이터)](/en/news/gemini-3-8-flash-launch)
* [Gemini 3.6 Flash 개요](/ko/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 3.5 Flash-Lite 개요](/ko/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini 네이티브 호출 가이드](/ko/api-capabilities/gemini/native)
