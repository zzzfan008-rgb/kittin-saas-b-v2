> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI API 웹 검색 가이드

> Responses API + web_search 도구는 기본 그룹 키로 실시간 웹 접근을 제공합니다. gpt-5.5 / gpt-5.4는 실제 검색과 인용된 출처로 검증되었으며, 과금이 포함됩니다.

이 페이지는 2026년 6월에 직접 테스트를 통해 검증한, APIYI의 GPT 모델에서 웹 검색을 사용하는 방법을 설명합니다.

## 요약

**APIYI는 OpenAI의 공식 웹 검색을 완전히 지원합니다**: **Responses API(`/v1/responses`)와 `web_search` 도구를 사용합니다.** gpt-5.5와 gpt-5.4 모두 웹을 실제로 검색하고 출처 인용과 함께 최신 정보를 반환하는 것이 검증되었습니다. **기본 그룹 키는 별도 활성화 없이 바로 사용할 수 있습니다.**

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tool:      tools: [{"type": "web_search"}]
Models:    gpt-5.5 / gpt-5.4 (verified)
```

## 실제 가용성(테스트 데이터, 2026-06-11)

| 모델      | 웹 결과                                             | 인용                   | Q\&A당 검색 횟수 | 지연 시간 |
| ------- | ------------------------------------------------ | -------------------- | ----------- | ----- |
| gpt-5.4 | ✅ 동일 주간 뉴스를 정확하게 반영                              | ✅ 구조화된 url\_citation | 1           | \~11s |
| gpt-5.5 | ✅ 동일 주간 뉴스를 정확하게 반영(자동 시간 범위 범위 지정, 다중 소스 교차 검증) | ✅ 구조화된 url\_citation | \~8         | \~51s |

<Tip>
  모델 선택: **속도와 비용은 gpt-5.4를 선택하고, 범위와 엄밀성은 gpt-5.5를 선택합니다**(검색 라운드가 더 많고 검색한 콘텐츠 주입량이 더 크므로 비용과 지연 시간이 더 높습니다 — 과금 섹션을 참조하십시오).
</Tip>

## 빠른 시작

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "content-type: application/json" \
  -H "authorization: Bearer YOUR_APIYI_KEY" \
  -d '{
    "model": "gpt-5.4",
    "max_output_tokens": 8192,
    "tools": [{"type": "web_search"}],
    "input": "What new models has Anthropic released in the past week? Search and include source links."
  }'
```

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_APIYI_KEY",         # default group works
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="gpt-5.4",                  # or gpt-5.5
    max_output_tokens=8192,           # recommend >=8k; gpt-5.5 uses many reasoning tokens, too small -> incomplete
    tools=[{"type": "web_search"}],
    input="What new models has Anthropic released in the past week? Search and include source links.",
)

# 1) Final answer text
print(resp.output_text)

# 2) Actual number of searches in this call (billing basis, see below)
search_calls = [item for item in resp.output if item.type == "web_search_call"]
print(f"Searches in this call: {len(search_calls)}")

# 3) Source citations (structured url_citation)
for item in resp.output:
    if item.type == "message":
        for content in item.content:
            for ann in getattr(content, "annotations", []) or []:
                print(f"Source: {ann.title} | {ann.url}")
```

### 응답 구조

`output` 배열에는 실행 순서대로 다음이 포함됩니다:

| 항목 유형             | 의미                                                                   |
| ----------------- | -------------------------------------------------------------------- |
| `web_search_call` | 실제로 실행된 검색 1개 (**과금은 이 항목들을 집계합니다**)                                 |
| `reasoning`       | 모델의 추론 과정(gpt-5 시리즈)                                                 |
| `message`         | 최종 답변이며, 그 `content[].annotations`에는 `url_citation`(제목 + url)가 포함됩니다 |

`status: "completed"`는 정상적으로 종료되었음을 의미합니다; `incomplete`은 보통 `max_output_tokens`가 너무 작았음을 의미합니다 — 값을 늘리십시오.

## 과금 (중요)

Web search는 두 부분으로 구성된 도구 호출 수수료가 발생합니다:

| 항목                    | 가격                                       | 비고                                                                                                                                       |
| --------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **도구 호출 수수료**         | **\$10 / 1,000 calls** (\$0.01 per call) | **도구 이름: `web_search`**; 응답의 `web_search_call` 항목 수를 기준으로 계산합니다 `output` — 한 번의 질문이 여러 검색을 유발할 수 있습니다 (gpt-5.4는 보통 1회, gpt-5.5는 보통 5–8회) |
| **검색된 콘텐츠 token 수수료** | Standard model input price               | 검색 결과는 모델 컨텍스트에 주입되며 input tokens로 과금됩니다. **이는 보통 더 큰 비중을 차지합니다**: gpt-5.4의 경우 Q\&A당 대략 9k input tokens, gpt-5.5의 경우 48–54k로 측정됩니다       |

<Info>
  Web 지원 Q\&A 1회당 측정된 총 비용: gpt-5.4 ≈ \$0.01 검색 수수료 + 9k tokens; gpt-5.5 ≈ \$0.08 검색 수수료 + \~50k tokens. 예상 쿼리량에 맞춰 추정하십시오.
</Info>

## 메모

1. **Responses API를 사용하십시오 — Chat Completions의 `web_search_options`는 사용하지 마십시오**: gpt-5 시리즈 모델은 해당 매개변수를 지원하지 않습니다(공식 OpenAI 동작이며, 400 `Unknown parameter: 'web_search_options'`를 반환합니다). `web_search_options`는 전용 `*-search-preview` 모델에만 적용됩니다.
2. **`max_output_tokens`를 최소 8192로 설정하십시오**: gpt-5.5는 많은 추론 tokens를 소비합니다. 제한이 너무 작으면 최종 답변 없이 `status: "incomplete"`를 반환하지만, token은 계속 과금됩니다.
3. 레거시 도구 유형 `web_search_preview`도 동일한 동작으로 사용할 수 있습니다. 새 통합에서는 `web_search`를 직접 사용하십시오.
4. 비용을 제어하려면 prompt에서 검색 동작을 제한하십시오(예: "최대 2회만 검색") 또는 gpt-5.4를 사용하십시오.

## 자주 묻는 질문

**질문: 답변이 정말 웹을 사용했는지 어떻게 확인하나요?**

답변 `output`에 `type="web_search_call"`가 포함된 항목이 있는지, 그리고 `message` 주석에 `url_citation`가 포함되는지 확인하십시오. 두 항목이 모두 있으면 실제 웹 액세스입니다. 이 두 마커 없이 답변 텍스트만 있으면 모델이 학습 데이터로 답한 것입니다.

**질문: 다른 그룹이나 특별한 키가 필요한가요?**

답변: 아닙니다. OpenAI 모델의 경우 기본 그룹 키로 웹 검색을 직접 호출할 수 있습니다.

**질문: 어떤 모델이 지원되나요?**

답변: gpt-5.5와 gpt-5.4는 검증되었습니다. 다른 gpt-5 시리즈 모델도 원칙적으로 Responses API `web_search` 도구를 지원해야 합니다. 다만 신뢰하기 전에 위 FAQ의 검증 절차를 먼저 실행하십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="OpenAI 네이티브 호출 (Responses API)" icon="sparkles" href="/ko/api-capabilities/openai/native">
    Responses API 엔드포인트, 파라미터, 설정
  </Card>

  <Card title="OpenAI 프롬프트 캐싱" icon="database" href="/ko/api-capabilities/openai/prompt-caching">
    웹 검색으로 주입되는 큰 input-token 양은 캐싱과 잘 맞습니다
  </Card>
</CardGroup>
