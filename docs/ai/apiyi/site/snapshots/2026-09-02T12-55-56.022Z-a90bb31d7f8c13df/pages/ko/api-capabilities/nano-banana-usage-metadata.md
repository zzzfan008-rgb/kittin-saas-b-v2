> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 사용 필드 및 출력 설명

> gemini-3-pro-image의 응답 JSON 구조와 usageMetadata 필드를 이해합니다. 또한 이 모델에 내재되어 이상처럼 보이지만 실제로는 정상인 세 가지 카운팅 동작도 다룹니다

이 페이지는 APIYI를 통해 `gemini-3-pro-image` (Nano Banana Pro)를 호출하는 개발자를 위한 페이지입니다. 응답 JSON의 출력 구조와 각 `usageMetadata` 필드가 실제로 무엇을 의미하는지 설명하고, **겉보기에는 이상처럼 보이지만 모델에 내재된** 여러 카운팅 동작을 명확히 합니다. 모든 결론은 프로덕션 게이트웨이에 대한 테스트(텍스트-투-이미지 48건 + 이미지 편집 요청 18건)와 Google의 공식 문서(`ai.google.dev/gemini-api/docs/image-generation`)를 대조한 결과이며, 추측이 아닙니다.

## 전체 응답 구조

APIYI의 Nano Banana 시리즈는 Google 네이티브 형식을 사용합니다. 응답에는 항상 최상위 필드 네 개가 있습니다:

```json theme={null}
{
  "candidates":    [ ... ],          // generation results (image/text parts)
  "usageMetadata": { ... },          // token usage
  "modelVersion":  "gemini-3-pro-image",
  "responseId":    "..."
}
```

### 생성 성공 시

```json theme={null}
"candidates": [{
  "content": {
    "role": "model",
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }
    ]
  },
  "finishReason": "STOP",
  "index": 0
}]
```

<Warning>
  **parts에는 이미지가 두 개 이상 포함될 수 있습니다.** “4-view character sheet”와 같은 복합 작업형 prompt(여러 제약이 있는 작업)의 경우, 모델은 한 번의 응답에 여러 이미지 파트를 반환할 수 있습니다(테스트에서는 2\~10개가 관찰됨) — 이는 모델의 “thinking process”에서 나온 중간 초안과 최종 버전이 함께 포함된 것입니다. Google의 문서에는 “Thinking 내 마지막 이미지가 최종 렌더링 이미지이기도 하다”라고 되어 있으므로, **마지막 것만 가져가면 됩니다**. 순수 텍스트-투-이미지와 간단한 편집(액세서리 추가 / 배경 변경 / 스타일 변경)은 보통 1개만 반환합니다. 어느 경우든 parts를 항상 순회하고, 이미지가 하나만 필요할 때는 마지막 `inlineData`을 가져가십시오. 자세한 내용은 [개발자 가이드 · 응답에 때때로 여러 이미지가 포함되는 이유](/ko/api-capabilities/nano-banana-dev-guide#why-do-responses-occasionally-contain-multiple-images)를 참조하십시오.
</Warning>

#### parts에는 텍스트 세그먼트도 포함될 수 있습니다

위 예시는 단일 이미지 세그먼트를 담고 있는 `parts` 배열을 보여 주지만, **그 구조가 보장되는 것은 아닙니다.** `parts`은 이종 배열이며, 테스트에서 세 가지 레이아웃이 관찰되었습니다:

| parts 레이아웃            | 길이 | 이미지 인덱스 |
| --------------------- | -- | ------- |
| `inlineData`          | 1  | `0`     |
| `text` + `inlineData` | 2  | **`1`** |
| `inlineData` + `text` | 2  | **`0`** |

`TEXT`을 `responseModalities`에 포함시키거나, 모델이 스스로 설명하도록 요구하는 prompt를 사용하면 응답에 텍스트 세그먼트가 추가되며 — 그 텍스트가 이미지 앞에 올지 뒤에 올지도 고정되어 있지 않습니다. **따라서 이미지가 위치하는 인덱스는 고정값이 아닙니다.**

<Warning>
  두 개의 하드코딩 인덱스 패턴은 **상보적**입니다. 이미지는 항상 `[0]` 또는 `[1]` 중 하나에 위치하므로, 어느 하나를 하드코딩하면 이미지가 오지 않는 요청이 생깁니다. 올바른 접근 방식은 아래의 **구문 분석 및 재조정 모범 사례** 섹션을 참조하십시오. 또한 강화 조치로 `generationConfig`에서 `responseModalities: ["IMAGE"]`를 선언해 이미지만 원한다고 명시할 수 있지만, 이는 필터링을 **대체하지는 않습니다**.
</Warning>

### 안전 정책에 의해 차단될 때

HTTP 상태 코드는 **여전히 200**이며, 차이는 candidate 내부에 있습니다:

```json theme={null}
"candidates": [{
  "content": { "parts": null },        // ⚠️ parts is null, not an empty array
  "finishReason": "IMAGE_SAFETY",      // or NO_IMAGE / PROHIBITED_CONTENT
  "finishMessage": "Unable to show the generated image. ...",  // only present in some cases
  "index": 0
}]
```

* 테스트에서 세 가지 `finishReason` 값이 관찰되었습니다: `IMAGE_SAFETY`(출력 이미지가 정책을 위반함), `PROHIBITED_CONTENT`(금지된 사용 정책이 트리거되었으며 설명용 `finishMessage`가 포함됨), 그리고 `NO_IMAGE`(이미지가 생성되지 않으며, 보통 몇 초 안에 반환됨)입니다.
* 거부 설명은 `finishMessage` 필드에 있습니다 — `parts` 내부의 텍스트 파트로 나타나지 **않습니다**.
* 파싱 코드는 `parts`이 `null`일 수 있음을 처리해야 하며, 그렇지 않으면 차단된 응답에서 오류가 발생합니다.

<Tip>
  실패 진단, 콘텐츠 모더레이션 정책, 사용자 친화적 메시지 전략은 [Gemini 이미지 오류 처리 가이드](/ko/api-capabilities/gemini-image-error-handling)를 참조하십시오.
</Tip>

## usageMetadata 필드 의미

성공한 생성에는 항상 6개 필드가 포함됩니다:

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 615,          // total input tokens (text + input images)
  "candidatesTokenCount": 2478,     // total output tokens (images + internal generation tokens)
  "thoughtsTokenCount": 208,        // thinking (reasoning) tokens
  "totalTokenCount": 3301,          // total billed amount for this request
  "promptTokensDetails":     [ { "modality": "TEXT",  "tokenCount": 99 },
                               { "modality": "IMAGE", "tokenCount": 516 } ],
  "candidatesTokensDetails": [ { "modality": "IMAGE", "tokenCount": 2240 } ]
}
```

| 필드                        | 의미                               | 신뢰성                                                               |
| ------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `promptTokenCount`        | 입력 측 총합                          | ✅ 항상 `promptTokensDetails`의 합과 같습니다                               |
| `candidatesTokenCount`    | 출력 측 총합                          | ✅ 과금 수치입니다; **하지만 세부 내역의 합보다 큽니다 — 아래의 동작 1을 참조하십시오**             |
| `thoughtsTokenCount`      | 추론 token, 테스트에서는 일반적으로 50–350입니다 | ✅                                                                 |
| `totalTokenCount`         | 총합                               | ✅ 성공한 생성에서는 항상 앞의 세 항목의 합과 같습니다; **거절은 예외입니다 — 아래의 동작 2를 참조하십시오** |
| `promptTokensDetails`     | 모달리티별 입력 세부 내역                   | ✅ 완전한 세부 내역                                                       |
| `candidatesTokensDetails` | 모달리티별 출력 세부 내역                   | ⚠️ **이미지 부분만 포함합니다 — 완전한 세부 내역은 아닙니다**                            |

**이미지 token은 종횡비가 아니라 해상도 티어로 결정됩니다**: 1K와 2K 티어에서는 이미지당 **1120 tokens**, 4K에서는 이미지당 **2000**입니다. 종횡비는 픽셀 크기만 바꾸며, token 수는 절대 바꾸지 않습니다. 한 번의 응답으로 N개의 이미지가 반환되면, 세부값은 정확히 N × 이미지당 값과 같습니다.

아래 표는 Google의 공식 Pro Image 종횡비 및 이미지 크기 참조입니다(출처: `ai.google.dev/gemini-api/docs/image-generation`). 우리의 `gemini-3-pro-image` 측정 결과와 완전히 일치합니다:

| 종횡비  | 1K 크기     | 1K tokens | 2K 크기     | 2K tokens | 4K 크기     | 4K tokens |
| ---- | --------- | --------- | --------- | --------- | --------- | --------- |
| 1:1  | 1024x1024 | 1120      | 2048x2048 | 1120      | 4096x4096 | 2000      |
| 2:3  | 848x1264  | 1120      | 1696x2528 | 1120      | 3392x5056 | 2000      |
| 3:2  | 1264x848  | 1120      | 2528x1696 | 1120      | 5056x3392 | 2000      |
| 3:4  | 896x1200  | 1120      | 1792x2400 | 1120      | 3584x4800 | 2000      |
| 4:3  | 1200x896  | 1120      | 2400x1792 | 1120      | 4800x3584 | 2000      |
| 4:5  | 928x1152  | 1120      | 1856x2304 | 1120      | 3712x4608 | 2000      |
| 5:4  | 1152x928  | 1120      | 2304x1856 | 1120      | 4608x3712 | 2000      |
| 9:16 | 768x1376  | 1120      | 1536x2752 | 1120      | 3072x5504 | 2000      |
| 16:9 | 1376x768  | 1120      | 2752x1536 | 1120      | 5504x3072 | 2000      |
| 21:9 | 1584x672  | 1120      | 3168x1344 | 1120      | 6336x2688 | 2000      |

<Note>
  Google의 공식 표에서 열 머리글 `1K tokens`은 “1K 해상도 티어의 token 수”를 의미합니다. 실제 이미지당 token 수는 셀 값입니다: 1K/2K에서는 이미지당 1120, 4K에서는 2000입니다. (해당 페이지의 중국어 로컬라이제이션은 이 머리글을 “1,000 tokens”로 표시하는데, 이를 이미지당 개수로 오해하기 쉽습니다.) 또한 512px 티어(이미지당 747 tokens)는 Flash 이미지 모델에서만 존재합니다 — `gemini-3-pro-image`는 1K/2K/4K만 지원하며, Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`)는 특수 사례입니다 — **1K** 티어만 있고 512px는 없습니다.
</Note>

## 이상처럼 보이는 세 가지 동작

### 동작 1: candidatesTokenCount ≠ candidatesTokensDetails의 합 — 정상적이고 불가피합니다

테스트에서 샘플의 **100%**(성공한 생성 49/49)는 `candidatesTokenCount`가 세부 항목 합계보다 **88–630 tokens** 더 큰 것으로 나타났습니다(prompt가 더 복잡하고 반환된 이미지가 많을수록 그 격차도 커졌습니다).

이유: `candidatesTokensDetails`는 **이미지 페이로드 자체**만(이미지당 고정 1120/2000) 계산하는 반면, `candidatesTokenCount`는 이미지 생성 과정과 함께 생성되는 내부 tokens도 포함하며, 이에 대응하는 modality 항목은 없습니다. 이는 Gemini의 기본 계산 방식이며, APIYI는 이를 그대로 전달합니다.

<Info>
  **핵심: 검증용으로 details를 `candidatesTokenCount`의 완전한 분해로 취급하지 마십시오. 정산과 billing에는 항상 `candidatesTokenCount` / `totalTokenCount`를 사용해야 하며, details는 이미지 비중을 추정할 때만 유용합니다.**
</Info>

### 동작 2: totalTokenCount ≠ prompt + candidates + thoughts — 이미지 출력이 없는 응답에서만

* 성공한 생성에서는 방정식이 **엄격히 성립합니다**(49/49): `total = promptTokenCount + candidatesTokenCount + thoughtsTokenCount`.
* 안전 차단된 응답(이미지 출력 없음)에서는 방정식이 **절대 성립하지 않습니다**(6/6), 고정 패턴은 다음과 같습니다:

```text theme={null}
candidatesTokenCount == thoughtsTokenCount     // thinking tokens are written into both fields
totalTokenCount == promptTokenCount + thoughtsTokenCount   // total counts them once — this is correct
```

거부 응답에서는 `candidatesTokenCount`가 `thoughtsTokenCount`와 동일하게 나타나므로, 세 필드를 합치면 thinking tokens이 중복 계산됩니다. 이 역시 상위 시스템에 내재된 동작입니다. **`totalTokenCount` 자체는 정확합니다 — 그대로 직접 사용하면 됩니다.** 로그의 응답 중 약 10%가 "균형이 맞지" 않는다면, 해당 응답의 `parts`가 비어 있는지 확인하십시오 — 거의 확실히 안전 차단된 샘플입니다.

### 동작 3: output tokens가 가끔 6000+에 도달함 — thinking process의 여러 이미지 파트 때문입니다

Google의 공식 문서에 따르면 Gemini 3 image 모델은 thinking 모델입니다: "Thinking"은 기본으로 활성화되어 있으며 API에서는 비활성화할 수 없습니다. 모델은 구도와 논리를 시험하기 위해 중간 이미지를 생성하며, "Thinking 내부의 마지막 이미지가 최종 렌더링 이미지이기도 합니다"(출처: `ai.google.dev/gemini-api/docs/image-generation`의 Thinking Process 섹션).

저희 테스트에서 이러한 중간 thinking 초안은 네이티브 `generateContent` 응답에서 **일반 이미지 파트**로 반환됩니다: 각 파트에는 `thoughtSignature` 필드는 있지만 `thought: true` 플래그는 없으며, **각각이 `candidatesTokensDetails`에서 1120 tokens으로 계산됩니다**. Google의 문서에는 Thinking이 최대 두 개의 중간 이미지만 생성한다고 되어 있지만, 복잡한 작업형 prompt에서는 단일 응답에서 최대 **10개 이미지 파트**를 관찰했습니다. 사용량은 이미지 개수에 따라 엄격히 선형적으로 증가합니다:

| 반환된 이미지 수         | candidatesTokensDetails | candidatesTokenCount | totalTokenCount |
| ----------------- | ----------------------- | -------------------- | --------------- |
| 1 (텍스트-투-이미지, 1K) | 1120                    | \~1210–1275          | \~1350–1450     |
| 2                 | 2240                    | \~2500               | \~3300          |
| 3                 | 3360                    | \~3800               | \~4600          |
| 4                 | 4480                    | \~5000               | \~5900          |
| 5                 | 5600                    | \~6200               | \~7000          |
| 10                | 11200                   | \~12700              | \~13500         |

`thoughtsTokenCount` 필드는 **text thinking**만 계산하며, 테스트에서 400을 넘지 않았습니다 — 높은 output tokens의 원천은 이 필드가 아니라 이미지 파트 수입니다. 6000+ 또는 심지어 5자리 output tokens을 보게 되면, 해당 응답의 파트 수를 확인하십시오 — 거의 확실히 다중 이미지 응답이며 정상 과금입니다(그래도 `totalTokenCount`와는 여전히 대조하십시오).

## thinkingLevel이 tokens에 미치는 영향

### 추론 수준이 tokens에 미치는 영향

추론 수준 제어는 **Gemini 3.1 Flash Image / Flash Lite Image** (`generationConfig.thinkingConfig.thinkingLevel`, 기본값 `minimal` 또는 `high`)에서만 지원됩니다; `gemini-3-pro-image`에서는 추론이 항상 활성화되어 있으며 조정할 수 없습니다. 측정 결과(동일한 prompt, 1K 텍스트-투-이미지, APIYI 게이트웨이 경유):

| 모델 / 설정                          | thoughtsTokenCount  | 이미지 tokens | totalTokenCount | 지연 시간    |
| -------------------------------- | ------------------- | ---------- | --------------- | -------- |
| gemini-3.1-flash-image · 최소(기본값) | 필드 없음               | 1120       | \~1534–1554     | \~12–13s |
| gemini-3.1-flash-image · high    | 700–792             | 1120       | \~2243–2375     | \~18–23s |
| gemini-3-pro-image · high 전달됨    | 181–214(기본 범위와 동일함) | 1120       | \~1427–1471     | \~23s    |

* **`high`는 추론 tokens와 지연 시간만 증가시키며 — image tokens는 그대로 유지됩니다** (이미지당 여전히 1120입니다).
* `thinkingLevel`를 `gemini-3-pro-image`에 전달해도 오류는 발생하지 않지만, 측정 가능한 효과는 없습니다 — 추론 tokens는 기본 범위에 머뭅니다.
* 테스트에서 `includeThoughts: true`는 응답 구조도 과금도 바꾸지 않았습니다; Google은 추론 과정을 보든 보지 않든 추론 tokens가 기본적으로 과금된다고 명시합니다.
* Google은 또한 “최소 추론이라고 해서 모델이 아예 추론을 하지 않는다는 뜻은 아닙니다”라고 설명합니다 — `minimal`에서는 usage가 별도의 `thoughtsTokenCount` field를 더 이상 표시하지 않습니다.

<Info>
  Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`)는 Nano Banana 2와 같은 3.1 Flash 계열이며 `thinkingLevel` 제어도 지원하고, 위 표와 동일한 메커니즘을 사용합니다; 아직 별도로 측정하여 표에 포함하지는 않았습니다. 과금 세부 정보는 [Nano Banana 시리즈 과금](/ko/api-capabilities/nano-banana-pricing)을 참조하십시오.
</Info>

### 이미지 모델의 추론 tokens가 텍스트 모델과 다른 점

* **텍스트 추론 모델**: 추론 출력은 텍스트입니다; `thoughtsTokenCount`는 수천에 이를 수 있으며 output-token 가격으로 과금됩니다. 공식적으로는 API가 thought summaries만 반환하더라도 모델이 생성한 **전체 내부 사고**를 기준으로 과금이 산정됩니다(출처: `ai.google.dev/gemini-api/docs/thinking`의 과금 섹션).
* **이미지 추론 모델**: 추론은 두 종류의 출력을 생성합니다 — `thoughtsTokenCount`에 계산되는 소량의 **텍스트 추론**(측정 결과: Pro에서는 최대 400, Flash에서는 `high`에서 약 800)과, 각 1120/2000 tokens로 과금되는 일반 **중간 초안 이미지**가 `candidatesTokenCount`에 반환됩니다. 따라서 이미지 모델에서의 “추론 비용”은 주로 image parts의 수로 드러나며, `thoughtsTokenCount` field에는 크게 나타나지 않습니다(위의 동작 3 참조).

### 두 가지 API 패러다임

Google의 이미지 모델 문서는 이제 두 가지 형태로 제공됩니다: 기존의 **generateContent API**(상태 비저장)와 새롭게 권장되는 **Interactions API**(에이전트와 도구를 위해 설계됨)입니다. APIYI 게이트웨이는 **Google 기본 generateContent 형식 — 이 페이지의 모든 내용은 이를 기준으로 합니다**를 사용합니다. 추론 관련 차이점은 다음과 같습니다.

|             | generateContent (이 페이지)                                                               | Interactions API                                              |
| ----------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 추론 수준 매개변수  | `generationConfig.thinkingConfig.thinkingLevel`                                       | `generation_config.thinking_level`                            |
| 응답의 추론 내용   | `includeThoughts` 스위치(테스트에서 이미지 모델에는 눈에 띄는 효과가 없었으며, 중간 초안은 항상 일반 image parts로 반환됩니다) | `steps`로 명시적으로 반환됨(`type: "thought"`), includeThoughts 스위치 없음 |
| Usage 필드 이름 | `thoughtsTokenCount` / `candidatesTokenCount` / `totalTokenCount`                     | `total_thought_tokens` / `total_output_tokens`                |

두 패러다임의 전체 비교(엔드포인트, 상태 관리, 데이터 보존, APIYI 게이트웨이 호환성 테스트 포함)는 [Interactions API 대 generateContent](/ko/api-capabilities/gemini/interactions-api)를 참조하십시오.

## 파싱 및 대조 모범 사례

```python theme={null}
data = resp.json()
cand = (data.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []   # handles parts=null

# Select by field shape — never by parts[0] / parts[1]; a text segment may come first
images = [p["inlineData"] for p in parts if "inlineData" in p]
if images:
    final_image = images[-1]["data"]          # last one is the final version
    mime = images[-1]["mimeType"]             # trust the response; don't hardcode image/png
else:
    reason = cand.get("finishReason")         # IMAGE_SAFETY / NO_IMAGE / PROHIBITED_CONTENT
    message = cand.get("finishMessage", "")   # may be empty
```

1. **`totalTokenCount`와 과금을 대조하십시오** (거부 응답에도 정확합니다); 세 필드를 직접 합산하거나 세부 항목을 합산하여 검증하지 마십시오.
2. **파트를 순회하십시오 — 단일 이미지를 가정하지 마십시오**; 이미지별 비즈니스 로직은 실제 `inlineData` 파트 수를 기준으로 해야 합니다.
3. **차단된 응답은 `parts = null` + HTTP 200으로 처리하십시오**, `finishReason`를 기준으로 분기하십시오.
4. 간단한 편집은 약 22–25초가 걸립니다. 복잡한 작업(다중 이미지 응답)은 35–142초가 걸리며, 이미지가 많을수록 더 오래 걸립니다. 클라이언트 타임아웃은 5분 이상으로 설정하십시오(프록시 계층이 있는 경우도 포함).

## 관련 문서

<CardGroup cols={2}>
  <Card title="Nano Banana 개발 가이드" icon="book-open" href="/ko/api-capabilities/nano-banana-dev-guide">
    통합 방법, 입력 이미지 요구사항, 과금 기본 사항, 타임아웃 설정, 그리고 멀티 이미지 설명
  </Card>

  <Card title="Error Handling 가이드" icon="triangle-alert" href="/ko/api-capabilities/gemini-image-error-handling">
    실패한 생성 진단을 위한 세 가지 핵심 지표, 콘텐츠 모더레이션 정책, 그리고 친화적인 prompt 전략
  </Card>

  <Card title="실패한 생성 보장 플랜" icon="shield-check" href="/ko/api-capabilities/nano-banana-pro-guarantee">
    입력으로 인해 발생하지 않은 실패의 경우, 실패한 요청 수에 따라 크레딧이 환급됩니다
  </Card>

  <Card title="Nano Banana 가격" icon="badge-dollar-sign" href="/ko/api-capabilities/nano-banana-pricing">
    해상도와 모델 티어에 따른 이미지당 가격
  </Card>
</CardGroup>
