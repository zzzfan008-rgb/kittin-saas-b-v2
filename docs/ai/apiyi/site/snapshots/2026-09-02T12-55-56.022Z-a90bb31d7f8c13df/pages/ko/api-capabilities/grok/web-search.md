> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 웹 검색 및 X 검색 가이드

> APIYI의 Grok 실시간 검색, 검증된 실사용: Responses API + web_search / x_search 도구는 실제 검색을 수행하고 인용된 최신 결과를 반환합니다. X 검색은 Grok에만 있습니다. 응답 구조와 과금 참고 사항을 포함합니다.

이 페이지는 APIYI에서 Grok의 웹 검색 및 X(Twitter) 검색을 사용하는 방법을 보여주며, 2026년 7월 13일(UTC+8)에 직접 검증했습니다.

## TL;DR

**APIYI는 Grok의 공식 서버 측 검색 도구를 완벽히 지원합니다**: **Responses API (`/v1/responses`)와 `web_search` / `x_search` 도구를 사용합니다**. `grok-4.5`는 실제 검색을 검증 가능하게 수행하고, 출처가 표시된 최신 결과를 반환합니다. 기본 그룹 키는 바로 사용할 수 있습니다.

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tools:     tools: [{"type": "web_search"}] or [{"type": "x_search"}]
Model:     grok-4.5 (verified)
```

<Warning>
  **기존 진입점은 사라졌습니다**: Chat Completions의 `search_parameters` 필드는 xAI에 의해 제거되었으며, 410을 반환하는 것으로 확인되었습니다. 기존 코드를 Responses API 도구 형식으로 마이그레이션하십시오.
</Warning>

## 검증된 결과 (2026-07-13)

| 도구           | 결과                                                                 | 질문-답변당 검색 수 | 지연 시간 |
| ------------ | ------------------------------------------------------------------ | ----------- | ----- |
| `web_search` | ✅ 7월 8일 Grok 4.5 출시 공지를 올바르게 찾아 최신 주간 뉴스를 정확히 반환했으며, 출처 인용도 포함했습니다 | 5           | \~12s |
| `x_search`   | ✅ 지정한 X 계정의 최신 게시물과 스레드 내용을 정확하게 반환했습니다                            | 24          | \~45s |

<Tip>
  **X 검색은 Grok의 차별화 요소입니다**: X(Twitter)의 실시간 게시물, 계정 활동, 주제 토론을 검색합니다. 이는 다른 어떤 벤더의 검색 도구도 다루지 않는 소스입니다. 소셜 모니터링, 트렌드 추적, KOL 분석에 매우 유용합니다. x\_search는 여러 차례 검색 라운드를 수행하며 눈에 띄게 느립니다(측정값 약 45초). 클라이언트 타임아웃은 120초 이상으로 설정하십시오.
</Tip>

## 빠른 시작

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/responses" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.5",
    "tools": [{"type": "web_search"}],
    "input": "What has xAI announced in the past week? Search and cite sources"
  }'
```

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "web_search"}],      # for X search use {"type": "x_search"}
    input="What has xAI announced in the past week? Search and cite sources",
)

# 1) Final answer
print(resp.output_text)

# 2) Actual number of searches performed
searches = [i for i in resp.output if i.type == "web_search_call"]
print(f"Performed {len(searches)} searches")

# 3) Server-side tool usage breakdown (for cost auditing)
print(resp.usage.server_side_tool_usage_details)
```

### X 검색 예제

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "x_search"}],
    input="Search X for the latest posts from the official xAI account and summarize the topics",
)
print(resp.output_text)
```

## 응답 구조

`output` 배열에는 실행 순서대로 다음이 포함됩니다:

| 항목 유형             | 의미                                         |
| ----------------- | ------------------------------------------ |
| `reasoning`       | 모델의 추론(검색 전략 계획)                           |
| `web_search_call` | 실제로 실행된 웹 검색 1회(`x_search`가 유사한 항목을 생성합니다) |
| `message`         | 인라인 출처 인용이 포함된 최종 답변                       |

`usage.server_side_tool_usage_details`는 도구별 호출 횟수(`web_search_calls` / `x_search_calls` / `code_interpreter_calls` / `mcp_calls` 등)를 보고합니다 — 비용 정산을 위해 귀하 쪽에서 기록해 둘 만합니다.

## 과금

실시간 검색 Q\&A에는 두 가지 비용 구성 요소가 있습니다:

| 항목                   | 비고                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **검색된 콘텐츠 token 비용** | 검색 결과가 모델 컨텍스트에 주입되며 모델의 표준 입력 요율로 과금됩니다. **이 비용이 가장 큽니다**: 측정 결과 web\_search Q\&A 1회에서 약 27K input tokens가 사용되었으며(그중 약 11K는 할인된 요율로 캐시 적중됨) |
| **도구 호출 수수료**        | 서버 측 도구는 호출당 수수료가 발생할 수 있습니다. APIYI 도구 요금과 실제 과금 명세서를 참고하십시오                                                                                 |

<Info>
  x\_search는 여러 라운드를 실행합니다(측정된 Q\&A 1회에서 24회 검색), 따라서 web\_search보다 token 주입과 지연 시간이 더 큽니다 — 예상 쿼리 볼륨을 기준으로 비용을 추정하십시오. 검색 횟수와 `cached_tokens`는 응답 사용량에서 자체 검증 가능합니다.
</Info>

## Notes

1. **Responses API만**: Chat Completions의 `search_parameters`는 더 이상 없습니다(410) — 사용하지 마십시오.
2. **지연 시간 예상**: web\_search는 약 12초, x\_search는 약 45초입니다(측정값이며 작업 복잡도에 따라 달라집니다). 클라이언트 타임아웃은 120초 이상으로 설정하십시오.
3. **비용 제어**: 프롬프트에서 검색 동작을 제한하고(예: “최대 2회만 검색”), `server_side_tool_usage_details`를 모니터링하십시오.
4. **실제 검색 수행 여부 확인**: `output` 배열에서 `web_search_call`(또는 이에 상응하는) 항목을 확인하십시오 — 본문 텍스트는 있지만 검색 항목이 없는 답변은 웹이 아니라 학습 데이터에서 온 것입니다.

## 관련 문서

<CardGroup cols={2}>
  <Card title="Grok 개요" icon="rocket" href="/ko/api-capabilities/grok/overview">
    모델 라인업, 가격, 및 기능 매트릭스
  </Card>

  <Card title="코드 실행 & MCP" icon="terminal" href="/ko/api-capabilities/grok/code-execution-mcp">
    Responses API의 나머지 두 서버 측 도구
  </Card>

  <Card title="캐시 과금" icon="database" href="/ko/faq/cache-billing">
    검색에서 오는 대규모 입력 token 주입은 자동 캐싱과 잘 맞습니다
  </Card>

  <Card title="OpenAI 웹 검색" icon="sparkles" href="/ko/api-capabilities/openai/web-search">
    비교용으로 GPT 시리즈의 웹 검색 사용
  </Card>
</CardGroup>
