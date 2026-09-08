> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini API Web Search 가이드

> 네이티브 generateContent + google_search 도구는 기본 그룹 키로 실시간 웹 근거 제공을 지원하며, 세 개의 Gemini 모델에서 검증되었습니다. OpenAI 호환 모드는 이를 지원하지 않습니다. 검증 방법과 과금($14/1K 검색)이 포함되어 있습니다.

이 페이지에서는 2026년 6월의 실사용 테스트를 통해 검증한 APIYI에서 Gemini 모델과 함께 웹 검색(Google Search를 사용한 Grounding)을 사용하는 방법을 설명합니다(3개 모델 × 2개 모드 × 여러 도구 선언, 21건의 기록된 요청). 기본 네이티브 형식 설정은 먼저 [Gemini Native Calls](/ko/api-capabilities/gemini/native)를 참조하십시오.

## TL;DR

**APIYI의 Gemini 네이티브 엔드포인트는 Google의 공식 웹 검색을 완전히 지원합니다**: **`/v1beta` generateContent와 `google_search` 도구를 사용합니다**. gemini-3.5-flash, gemini-3.1-flash-lite, 그리고 gemini-3.1-pro-preview는 모두 실제로 웹을 검색하고 최신 출처 인용 정보를 반환하는 것으로 검증되었습니다. **기본 그룹 키는 바로 사용할 수 있으며, 별도의 활성화는 필요하지 않습니다.**

```
Endpoint:  POST https://api.apiyi.com/v1beta/models/{model}:generateContent
Tool:      tools: [{"google_search": {}}]
Models:    gemini-3.5-flash / gemini-3.1-flash-lite / gemini-3.1-pro-preview (verified)
```

<Warning>
  **OpenAI 호환 모드(`/v1/chat/completions`)는 웹 검색을 지원하지 않습니다.** 테스트에서 세 가지 선언 모두 — `web_search_options`, 전달된 `google_search`, 그리고 `tools: [{"type": "web_search"}]` — 는 HTTP 200을 반환했지만 조용히 무시되었습니다. 모델은 단지 학습 데이터로 응답했습니다. ‘오류 없음’을 ‘검색이 동작함’으로 간주하지 마십시오 — 아래의 검증 방법을 확인하십시오.
</Warning>

## 실제 사용 가능 여부 (테스트 데이터, 2026-06-11)

| 모델                     | 웹 결과                         | groundingMetadata    | Q\&A당 검색 수 | 지연 시간  |
| ---------------------- | ---------------------------- | -------------------- | ---------- | ------ |
| gemini-3.5-flash       | ✅ 실제 동일 주간 뉴스, 다중 쿼리 교차 검증   | ✅ 완전함                | 4–7        | 24–45s |
| gemini-3.1-flash-lite  | ✅ 실제 동일 주간 뉴스                | ✅ (가끔 누락됨, 참고 사항 참조) | 2          | \~5s   |
| gemini-3.1-pro-preview | ✅ 실제 동일 주간 뉴스, 깊은 추론 후 정밀 검색 | ✅                    | 1          | \~45s  |

<Tip>
  모델 선택: **지연 시간에 민감하고 호출 빈도가 높은 경우에는 gemini-3.1-flash-lite를 선택하십시오(약 5초); 검색 범위와 답변 품질이 중요하면 gemini-3.5-flash를 선택하십시오** (다중 쿼리 교차 검증, 더 높은 추론 비용과 지연 시간 — 과금을 참조하십시오).
</Tip>

## 빠른 시작

### cURL

```bash theme={null}
curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "content-type: application/json" \
  -H "x-goog-api-key: YOUR_APIYI_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "What important AI news happened in the past week? Search and list 3 items with source URLs."}]}],
    "generationConfig": {"maxOutputTokens": 4096},
    "tools": [{"google_search": {}}]
  }'
```

### Python (google-genai SDK)

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_APIYI_KEY",                     # default group works
    http_options={"base_url": "https://api.apiyi.com"},  # note: no /v1
)

resp = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="What important AI news happened in the past week? Search and list 3 items with source URLs.",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        max_output_tokens=4096,
    ),
)

# 1) Final answer text
print(resp.text)

# 2) Grounding evidence: executed queries and sources
gm = resp.candidates[0].grounding_metadata
if gm:
    print("Queries:", gm.web_search_queries)
    for chunk in gm.grounding_chunks or []:
        print("Source:", chunk.web.title, chunk.web.uri)
else:
    print("⚠️ No web search was triggered in this call")
```

### 검색이 실제로 실행되었는지 확인하는 방법

성공하면, `candidates[0].groundingMetadata`에는 아래 필드가 포함됩니다. **이 필드가 없으면 검색이 실행되지 않은 것입니다**:

| 필드                  | 의미                                           |
| ------------------- | -------------------------------------------- |
| `webSearchQueries`  | 모델이 실제로 실행한 검색 쿼리 배열입니다(배열 길이 = 검색 횟수)       |
| `groundingChunks`   | 검색된 소스(URI + 제목)입니다                          |
| `groundingSupports` | 답변 텍스트 구간과 소스 사이의 매핑입니다(startIndex/endIndex) |
| `searchEntryPoint`  | 필요한 Google 검색 제안을 렌더링하기 위한 HTML/CSS입니다       |

대조군 참고: 도구 없이 같은 질문을 했을 때 모델들은 일관되게 "제 지식은 2025년 1월에서 끝나며, 최신 뉴스를 제공할 수 없습니다"라고 답했습니다. 도구를 사용했을 때는 학습 컷오프 이후에 발생한 실제 사건을 정확하게 보고했습니다.

## 과금 (중요)

웹 검색에는 **도구 호출 수수료**가 부과되며, 이는 두 부분으로 구성됩니다:

| 항목               | 가격                                             | 비고                                                                                                                                                                                                           |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **도구 호출 수수료**    | **\$14 / 1,000 searches** (\$0.014 per search) | **도구 이름: `google_search`**; 실제로 실행된 검색 수에 따라 과금되며, 즉 `groundingMetadata.webSearchQueries`의 길이를 기준으로 합니다 — 한 질문이 여러 검색을 유발할 수 있습니다(측정값: pro-preview 1, flash-lite 2, 3.5-flash 4–7)                           |
| **모델 token 수수료** | 일반 모델 가격                                       | OpenAI 웹 검색과 달리, 검색된 콘텐츠는 입력 token으로 주입되지 않습니다(p promptTokenCount는 거의 동일하게 유지되며, 31–43 tokens로 측정됨); 비용의 대부분은 **추론 + 출력 tokens**입니다(3.5-flash에서 웹 기반 Q\&A 1회는 3,500–4,900 thought tokens를 소모했으며, 출력 요율로 과금됨) |

<Info>
  웹 기반 Q\&A 1회당 참고 총비용(search 수수료 + tokens): flash-lite ≈ \$0.03; 3.5-flash ≈ \$0.08–0.16; 3.1-pro-preview ≈ \$0.06입니다. 비용을 제어하려면 prompt에서 검색 동작을 제한하십시오(예: “search를 최대 2번만 수행”) 또는 검색을 덜 수행하는 model을 선택하십시오.
</Info>

<Tip>
  **수수료가 면제될 수 있습니다**: 공식 Gemini API에는 무료 search 쿼터가 포함됩니다(Gemini 3 시리즈: 매월 5,000 prompts 무료, 이후 \$14/1K searches). 상위 호출이 무료 쿼터 안에 들어가면 해당 호출의 검색 수수료가 면제될 수 있습니다(테스트에서는 검색 수수료가 전혀 없는 전체 호출도 관찰했습니다); 수수료가 부과되면 위 표를 따릅니다. 콘솔 과금 세부 정보가 최종 기준입니다.
</Tip>

## 참고 사항

1. **네이티브 엔드포인트를 사용해야 합니다**: OpenAI 호환 모드의 모든 검색 선언은 오류 없이 조용히 무시됩니다. OpenAI-SDK 프로젝트의 경우 google-genai SDK로 전환하십시오(`base_url`를 `https://api.apiyi.com`로 설정하고 `/v1` 없이).
2. **groundingMetadata를 진실의 원천으로 취급하십시오**: 테스트에서 flash-lite는 때때로(4번 중 1번) groundingMetadata를 반환하지 않았습니다. 엄격한 시나리오에서는 필드의 존재를 검증하고 없으면 다시 시도하십시오.
3. **추론 모델에 충분한 `maxOutputTokens`를 제공하십시오**(최소 4096 권장): 3.5-flash / 3.1-pro-preview는 grounding 시 1,900–4,900 thinking tokens를 소비합니다. 제한이 너무 작으면 답변이 잘립니다.
4. `{"google_search": {}}`과 camelCase `{"googleSearch": {}}` 둘 다 작동합니다. 이전 `google_search_retrieval`는 Gemini 1.5 시대의 것이므로, 현재 모든 모델에는 `google_search`를 사용하십시오.
5. 웹 검색은 URL Context와 같은 다른 도구와 함께 결합할 수 있습니다(공식 Google 문서: `ai.google.dev/gemini-api/docs/google-search`).

## FAQ

**Q: 답변이 정말 웹을 사용했는지 어떻게 확인합니까?**

A: `candidates[0].groundingMetadata`가 존재하고, `webSearchQueries`가 비어 있지 않으며, `groundingChunks`에 source URI가 포함되어 있는지 확인하십시오. 이 필드들이 없고 답변 텍스트만 있다면, 모델이 학습 데이터에서 답변한 것입니다.

**Q: 다른 그룹이나 특수 키가 필요합니까?**

A: 아닙니다. Gemini 모델의 경우 기본 그룹 키로 웹 검색을 직접 호출할 수 있습니다. 이는 OpenAI web search와 같고, Claude 네이티브 검색과는 다릅니다. Claude 네이티브 검색은 ClaudeOfficial 베타 그룹이 필요합니다.

**Q: 검색 횟수는 어떻게 확인하며, 모델에 따라 달라집니까?**

A: `groundingMetadata.webSearchQueries`의 길이를 셉니다. 같은 질문이라도 모델에 따라 크게 달라집니다. pro-preview는 1, flash-lite는 2, 3.5-flash는 4–7입니다.

**Q: 어떤 모델이 지원됩니까?**

A: gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview는 검증되었습니다. 다른 Gemini 2.5+ 모델도 원칙적으로 `google_search` 도구를 지원해야 합니다. 다만 의존하기 전에 위 FAQ의 검증 확인을 실행하십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="Gemini 네이티브 호출" icon="sparkles" href="/ko/api-capabilities/gemini/native">
    google-genai SDK 설정, 스트리밍, thinking 제어
  </Card>

  <Card title="Gemini 함수 호출" icon="wrench" href="/ko/api-capabilities/gemini/function-calling">
    사용자 정의 도구 호출, 웹 검색과 조합 가능
  </Card>
</CardGroup>
