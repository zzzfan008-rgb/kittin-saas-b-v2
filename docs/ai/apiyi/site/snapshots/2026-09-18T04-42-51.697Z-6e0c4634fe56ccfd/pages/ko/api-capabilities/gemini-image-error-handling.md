> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 이미지 생성 API 오류 처리 가이드

> gemini-3-pro-image-preview (Nano Banana Pro) 생성 실패에 대한 세 가지 핵심 진단 지표, Google의 콘텐츠 검토 정책, 그리고 개발자가 기술적 오류를 실행 가능한 사용자 prompt로 전환하도록 돕는 사용자 친화적 메시지 전략입니다.

## 개요

`gemini-3-pro-image-preview` (즉, Nano Banana Pro)는 엄격한 콘텐츠 안전성 제어를 적용하며, 여러 계층에서 규정에 맞지 않는 요청을 거부합니다. 단순한 "생성 실패" 메시지는 사용자가 문제를 이해하는 데 도움이 되지 않습니다. 적절한 오류 처리는 다음을 충족해야 합니다.

* **거부 사유를 정확히 식별해야 합니다** — 콘텐츠 위반, 지식 베이스 제한, 기술 오류를 구분해야 합니다
* **친절한 사용자 메시지를 제공해야 합니다** — 기술적 오류를 이해하기 쉬운 설명으로 바꿔야 합니다
* **실행 가능한 제안을 제공해야 합니다** — 성공할 수 있도록 요청을 어떻게 조정해야 하는지 알려야 합니다
* **완전한 기술 세부 정보를 유지해야 합니다** — 개발자 디버깅용입니다

<Info>
  요청이 **HTTP 200이지만 이미지가 없는 경우**라면, 이는 보통 Google 쪽에서 내린 안전성 판단입니다. APIYI의 투명한 프록시는 결과를 있는 그대로 전달할 뿐입니다 — 저희도 고객이 이미지를 성공적으로 생성하길 바랍니다. 감지 및 메시징 로직은 애플리케이션 측에서 구현해야 합니다.
</Info>

## Google 콘텐츠 검토 정책 (2026 업데이트)

Google의 이미지 생성은 **2단계 안전 메커니즘**을 사용합니다.

1. **구성 가능한 필터**: 괴롭힘, 혐오 발언, 성적으로 노골적인 콘텐츠, 위험한 콘텐츠의 네 가지 범위를 다루며, `safetySettings`을 통해 조정할 수 있습니다
2. **내장 보호 조치**: 아동 안전과 같은 핵심 유해 행위에 대해서는 항상 활성화되어 있으며, **매개변수를 통해 비활성화할 수 없습니다**

명시적으로 금지되는 콘텐츠에는 다음이 포함됩니다: 아동 성적 학대 및 착취(CSAE), 폭력적 극단주의/테러리즘, 비동의 친밀 이미지(NCII), 자해, 성적으로 노골적인 콘텐츠, 혐오 발언, 그리고 괴롭힘과 따돌림입니다.

<Warning>
  **2026년 2월, Nano Banana 2 출시 이후 Google은 사람과 저작권에 관한 정책을 크게 강화했으며**, 다음과 같은 자주 발생하는 거절 시나리오를 추가/강화했습니다(데이터 기준: 2026년 5월 (UTC+8)):

  * **공인 / 유명인**: 사실적인 사진풍의 식별 가능한 실제 인물
  * **얼굴 바꾸기(faceswap)**
  * **실제 인물의 재의상/얼굴 변경**
  * **금융 또는 주문 정보 조작**
  * **잘 알려진 IP**(예: Disney, 2026년 1월 23일 이후)
  * **워터마크 제거** 및 **미성년자** 관련 콘텐츠

  여전히 허용되는 항목: 가상 캐릭터, 스타일화된 초상, 그리고 일러스트 형 인물입니다.
</Warning>

Google의 공식 정책 문서입니다(직접 복사하여 방문하십시오):

* 생성형 AI 금지 사용 정책: `policies.google.com/terms/generative-ai/use-policy`
* 생성형 콘텐츠 일반 오류 참고 자료: `ai.google.dev/api/generate-content`

## 세 가지 핵심 진단 지표

다음 순서로 **우선순위, 높은 것부터 낮은 것까지** 확인하십시오:

### 1. candidatesTokenCount (최우선) ⭐

* **위치**: `response.usageMetadata.candidatesTokenCount`
* **의미**: API가 생성한 후보 콘텐츠의 token 수입니다
* **규칙**: 값이 `0`이면 요청이 **콘텐츠 검열 단계에서 즉시 거부되었으며** 후보 콘텐츠가 아예 생성되지 않았다는 뜻입니다. 이는 가장 엄격한 거부입니다.

```json theme={null}
{
  "candidates": null,
  "usageMetadata": {
    "promptTokenCount": 271,
    "candidatesTokenCount": 0,
    "totalTokenCount": 271
  }
}
```

### 2. finishReason (두 번째 우선순위)

* **위치**: `response.candidates[0].finishReason`
* **규칙**: `STOP` 이외의 값은 특수 처리가 필요한 비정상 종료를 의미합니다

최신 이미지 관련 `finishReason` 값입니다(참고로 Nano Banana 시리즈는 `IMAGE_` 접두사가 붙은 이미지 전용 값을 추가했습니다):

| finishReason                                      | 의미             | 사용자 친화적 메시지                              |
| ------------------------------------------------- | -------------- | ---------------------------------------- |
| `STOP`                                            | 정상 완료          | -                                        |
| `IMAGE_SAFETY`                                    | 출력 측 이미지 안전 필터 | 콘텐츠가 이미지 안전 정책을 트리거했습니다                  |
| `PROHIBITED_CONTENT` / `IMAGE_PROHIBITED_CONTENT` | 금지된 콘텐츠        | 콘텐츠가 안전 정책을 위반하여 거부되었습니다                 |
| `SAFETY`                                          | 안전 필터          | 콘텐츠가 안전 필터를 트리거했습니다                      |
| `RECITATION` / `IMAGE_RECITATION`                 | 인용/저작권 제한      | 콘텐츠에 저작권 문제가 관련되었을 수 있습니다                |
| `IMAGE_OTHER` / `NO_IMAGE`                        | 이미지 없음/기타      | 이미지를 생성할 수 없습니다. prompt를 조정한 후 다시 시도하십시오 |
| `MAX_TOKENS`                                      | 길이 초과          | 콘텐츠 길이가 제한을 초과했습니다                       |

### 3. 텍스트 거부 설명 (중요)

* **위치**: `response.candidates[0].content.parts[].text`
* **규칙**: `finishReason`가 `STOP`이지만 `parts`에 `text`만 있고 이미지 데이터가 없을 때, API는 이미지 대신 **거부 설명**을 반환합니다. 텍스트는 중국어 또는 영어일 수 있으며, 예를 들면:

```text theme={null}
我不能为你创建带有色情、不雅或冒犯性内容的图像。这违反了我们的安全政策。
I can't generate images that are sexually explicit.
```

## 오류 시나리오 빠른 참고

| 시나리오         | 탐지 조건                                               | 일반적인 원인                                         |
| ------------ | --------------------------------------------------- | ----------------------------------------------- |
| 콘텐츠 모더레이션 거부 | `candidatesTokenCount === 0`                        | Prompt/참조 이미지에 민감한 콘텐츠가 포함되어 있음; 가장 이른 단계에서 거부됨 |
| 생성 중 거부      | `finishReason !== 'STOP'` and `parts` is empty      | 금지된 콘텐츠, 안전 필터                                  |
| 텍스트 거부 설명    | `finishReason === 'STOP'`, 텍스트는 있지만 이미지가 없음         | 성적으로 노골적인 콘텐츠, 규정에 맞지 않는 요청                     |
| 지식 베이스 제한    | 텍스트가 미래 연도(2026년 이상) 또는 아직 출시되지 않은 제품을 언급함          | 지식 베이스는 2025년 1월까지 업데이트됨                        |
| 금지된 기능       | 텍스트에 `watermark`, `faceswap`, 재드레싱, 연예인 등의 키워드가 포함됨 | 워터마크 제거/얼굴 합성/재드레싱/연예인과 같은 금지 기능                |

## 처리 흐름(결정 순서)

```text theme={null}
Receive API response
  ├─ ① candidatesTokenCount === 0 ─→ Content moderation rejection
  ├─ ② candidates is empty ─────────→ API format error (system issue)
  ├─ ③ finishReason !== 'STOP' ────→ Rejection during generation (check mapping table)
  ├─ ④ content.parts is empty ─────→ Empty content (handle like finishReason)
  ├─ ⑤ Iterate parts to collect text and images
  ├─ ⑥ Has image ──────────────────→ ✅ Return success
  └─ ⑦ No image but has text ──────→ Show rejection explanation (optional keyword detection)
        └─ No text ───────────────→ Generic error + keep full response
```

## 핵심 코드 구현

위의 검사들을 하나의 파싱 함수로 결합합니다:

```javascript theme={null}
async function processGeminiResponse(data) {
  // ① Highest priority: rejected outright at the content moderation stage
  if (data.usageMetadata?.candidatesTokenCount === 0) {
    return {
      success: false,
      errorType: 'ZERO_CANDIDATES_TOKEN',
      userMessage: 'Your request was rejected during content moderation. Please revise it and try again.',
      devMessage: 'candidatesTokenCount: 0 - rejected by Google content moderation',
      rawResponse: data,
    };
  }

  // ② candidates is empty — usually a system/format issue
  if (!data.candidates || !data.candidates.length) {
    return {
      success: false,
      errorType: 'NO_CANDIDATES',
      userMessage: 'A system error occurred. Please try again later.',
      devMessage: 'candidates is null or an empty array',
      rawResponse: data,
    };
  }

  const candidate = data.candidates[0];

  // ③ finishReason is not STOP — rejected during generation
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    const reasonMessages = {
      PROHIBITED_CONTENT: 'Content violates the safety policy and was rejected.',
      IMAGE_PROHIBITED_CONTENT: 'Content violates the safety policy and was rejected.',
      SAFETY: 'Content triggered the safety filter.',
      IMAGE_SAFETY: 'Content triggered the image safety policy.',
      RECITATION: 'Content may involve a copyright issue.',
      IMAGE_RECITATION: 'Content may involve a copyright issue.',
      NO_IMAGE: 'No image could be generated. Please adjust your prompt and try again.',
      IMAGE_OTHER: 'No image could be generated. Please adjust your prompt and try again.',
      MAX_TOKENS: 'Content length exceeds the limit.',
    };
    return {
      success: false,
      errorType: 'FINISH_REASON',
      finishReason: candidate.finishReason,
      userMessage: reasonMessages[candidate.finishReason] || `Request rejected: ${candidate.finishReason}`,
      devMessage: `finishReason: ${candidate.finishReason}`,
      rawResponse: data,
    };
  }

  // ④ content.parts is empty
  if (!candidate.content?.parts) {
    return {
      success: false,
      errorType: 'NO_PARTS',
      userMessage: 'Generation failed. Please try again.',
      devMessage: 'candidate.content.parts is empty',
      rawResponse: data,
    };
  }

  // ⑤ Iterate parts: ⚠️ always collect text first, then check thoughtSignature
  const images = [];
  const texts = [];
  for (const part of candidate.content.parts) {
    if (part.text && !part.text.startsWith('data:image/')) {
      texts.push(part.text);
    }
    if (part.inlineData?.data) {
      images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
    }
  }

  // ⑥ Having an image means success
  if (images.length > 0) {
    return { success: true, images, texts };
  }

  // ⑦ No image but has text — show the rejection explanation
  if (texts.length > 0) {
    const textContent = texts.join('\n');
    return {
      success: false,
      errorType: 'TEXT_RESPONSE',
      userMessage: textContent,          // Use the text returned by the API directly
      detectedType: detectContentType(textContent),
      apiText: textContent,
      rawResponse: data,
    };
  }

  // ⑧ Fallback: never just say "unknown error"
  return {
    success: false,
    errorType: 'UNKNOWN',
    userMessage: 'Generation failed. Please check your prompt and try again.',
    devMessage: 'No image data or text response found',
    rawResponse: data,
  };
}
```

스마트 키워드 감지(선택 사항, 더 구체적인 메시지를 위해):

```javascript theme={null}
function detectContentType(text) {
  const t = text.toLowerCase();
  const isRejection =
    t.includes("i can't generate") || t.includes('i cannot create') ||
    t.includes("i'm just a language model") || t.includes('我不能') || t.includes('无法生成');
  if (!isRejection) return null;

  if (t.includes('watermark')) return 'watermark_removal';
  if (t.includes('faceswap') || t.includes('face swap')) return 'faceswap';
  if (t.includes('sexually') || t.includes('explicit') || t.includes('色情') || t.includes('不雅')) return 'nsfw';
  return 'general_rejection';
}
```

<Warning>
  **가장 흔한 함정**: `thoughtSignature`이 포함된 부분에도 중요한 `text`이 여전히 포함될 수 있습니다. 항상 **먼저 텍스트를 수집한 뒤, 건너뛸지 결정하십시오** — 그렇지 않으면 거부 설명이 사라지고 사용자는 “generation failed.”만 보게 됩니다.
</Warning>

## 소비자 친화적 메시지

설계 원칙: **명확하고 간결함, 긍정적인 안내, 실행 가능함, 비난 없음**. 권장 템플릿:

```text theme={null}
❌ Content does not meet requirements
Your request contains inappropriate content, so an image cannot be generated.
💡 Suggestion: Use healthy, positive descriptions; avoid sensitive topics; revise your prompt and try again.

❌ Feature not yet supported
This feature (e.g., watermark removal/face swap) is not supported. Please try a different editing approach.

❌ Content out of scope
The content you mentioned may be beyond the AI's knowledge range (updated through January 2025).
💡 Suggestion: Use common objects/concepts and avoid referencing future products.
```

단계별 표시 권장 사항:

* **소비자 사용자**: 기본적으로 친절한 설명 + 수정 제안만 표시합니다
* **비즈니스 / 도구 제공자**: 기본적으로 기술 세부 정보(`finishReason`, `candidatesTokenCount` 등)를 펼쳐서 표시합니다
* **개발자**: 전체 JSON 응답을 볼 수 있도록 “펼치기/접기” 토글을 제공합니다

## 모범 사례

1. **우선순위에 따라 엄격하게 확인합니다**: `candidatesTokenCount` → `finishReason` → `parts` → 데이터 추출 → 키워드 감지
2. **thoughtSignature를 확인하기 전에 텍스트를 먼저 수집합니다**: 거부 설명을 잃지 않기 위함입니다
3. **전체 응답을 유지합니다**: 개발/테스트 도구는 문제 해결을 위해 항상 원시 JSON을 저장해야 합니다
4. **중국어와 영어 거부 텍스트를 지원합니다**: Google은 중국어나 영어를 반환할 수 있으므로 키워드 매칭은 둘 다를 포괄해야 합니다
5. **점진적 폴백을 적용합니다**: 스마트 감지가 성공하면 구체적인 메시지를 표시하고, 그렇지 않으면 API 텍스트를 직접 표시하며, 그다음에는 친숙한 `finishReason` 이름을 사용하고, 마지막에만 일반 메시지로 폴백합니다
6. **"알 수 없는 오류"는 절대 표시하지 않습니다**: 항상 실행 가능한 제안이나 전체 응답을 포함해야 합니다

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 같은 prompt가 때로는 성공하고 때로는 실패합니까?">
    Google의 안전 필터링은 무작위성과 문맥 의존성이 있습니다. 참조 이미지의 내용과 prompt를 결합하는 방식이 모두 판단에 영향을 미칩니다. 문구를 조정하거나 더 간접적인 표현을 사용해 보십시오.
  </Accordion>

  <Accordion title="어떻게 콘텐츠 문제인지 기술 문제인지 구분합니까?">
    `candidatesTokenCount: 0` 또는 `finishReason: PROHIBITED_CONTENT` → 콘텐츠 문제; `Failed to fetch` 또는 HTTP 오류 → 기술 문제; API 텍스트 설명 → 보통 콘텐츠 문제입니다.
  </Accordion>

  <Accordion title="일반 사용자는 기술 정보를 얼마나 보아야 합니까?">
    단계적 표시: 기본적으로는 친절한 설명 + 수정 제안을 보여주고, 필요하면 기술 세부 정보를 펼쳐 보이며, 개발 모드에서는 전체 JSON 응답을 표시합니다.
  </Accordion>

  <Accordion title="모든 finishReason마다 별도 처리를 작성해야 합니까?">
    아닙니다. 매핑 테이블과 일반적인 폴백이면 충분합니다: `reasonMessages[finishReason] || ` 그런 다음 원시 값을 표시합니다.
  </Accordion>
</AccordionGroup>

## 관련 읽을거리

* [Nano Banana 시리즈 과금 개요](/ko/api-capabilities/nano-banana-pricing)
* [Nano Banana Pro 생성 실패 보상 방안](/ko/api-capabilities/nano-banana-pro-guarantee)
* [Nano Banana OSS 그룹](/ko/api-capabilities/nano-banana-oss-group)
