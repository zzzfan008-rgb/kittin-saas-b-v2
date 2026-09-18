> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API 웹 검색 가이드

> 기본 그룹(AWS Claude)은 기본 제공 web_search 도구를 지원하지 않습니다. 검증된 두 가지 옵션은 ClaudeOfficial 베타 그룹 또는 사용자 지정 검색 도구입니다.

이 페이지는 2026년 6월의 실사용 테스트로 검증한, APIYI에서 Claude 모델로 웹 검색을 사용하는 두 가지 작업 경로를 설명합니다. 채널, 과금, 기본 설정은 먼저 [Claude API 기본](/ko/api-capabilities/claude)을 참조하십시오.

## 핵심 요약

**APIYI의 기본 Claude 그룹은 공식 AWS Claude(Amazon Bedrock)로 라우팅되며, AWS 자체는 Claude의 기본 웹 검색을 지원하지 않습니다** — 이는 게이트웨이 설정 문제가 아니라 Bedrock 아키텍처의 제한입니다. 웹 액세스가 필요하면 두 가지 방법이 있습니다:

| 경로                                                  | 적합한 용도                                             | 안정성                     |
| --------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| **옵션 1: ClaudeOfficial 베타 그룹** (기본 `web_search` 도구) | Anthropic의 기본 검색 경험이 꼭 필요하고 베타 수준의 안정성을 수용할 수 있을 때 | ⚠️ 베타, 기본 그룹보다 덜 안정적입니다 |
| **옵션 2: 사용자 정의 검색 도구** (기본 그룹에서 작동하며, 권장됨)          | 안정성과 제어가 필요한 프로덕션 워크로드                             | ✅ 기본 그룹과 동일한 등급입니다      |

<Warning>
  **흔한 함정**: 기본 그룹에서 `web_search` 도구를 사용해 요청을 보내도 **오류가 발생하지 않습니다** — 게이트웨이가 이를 원활하게 처리하므로 요청은 HTTP 200으로 반환되지만, 검색은 실행되지 않습니다. 모델은 단지 학습 데이터로만 답변합니다. "오류가 없음"을 "검색이 작동함"으로 간주하지 마십시오. 확인 방법은 끝부분의 FAQ를 참고하십시오.
</Warning>

## 기본 그룹이 이를 지원하지 않는 이유는 무엇입니까?

Claude의 `web_search` / `web_fetch`는 **서버 측 도구**입니다. 검색은 Anthropic의 자체 서버 인프라에서 실행됩니다. AWS Bedrock은 모델 추론만 제공하며 이러한 검색 백엔드가 없으므로, Bedrock 인터페이스는 검증 계층에서 이러한 도구를 거부합니다. Bedrock의 도구 유형 허용 목록에는 클라이언트 측 도구만 포함됩니다:

```
bash_20250124, custom, memory_20250818, text_editor_*(20250124/0429/0728),
tool_search_tool_bm25(_20251119), tool_search_tool_regex(_20251119)
```

마찬가지로, Anthropic의 \*\*MCP Connector(`mcp_servers` 매개변수)\*\*도 서버 측 기능이며 기본 그룹에서는 지원되지 않습니다.

## 옵션 1: ClaudeOfficial 베타 그룹(기본 web\_search)

APIYI는 **ClaudeOfficial**라는 베타 그룹(Anthropic 공식 채널 직접 연동)을 제공하며, Claude의 기본 `web_search` / `web_fetch` 도구를 지원합니다.

<Info>
  * **활성화 방법: 고객 지원팀에 문의**하여 키를 ClaudeOfficial 그룹에 추가해 달라고 요청합니다
  * **안정성 참고**: 이 그룹은 베타 그룹이므로 기본 그룹보다 안정성이 떨어집니다 — 중요한 작업에는 대체 수단을 준비하십시오(Option 2를 대체 수단으로 사용하면 좋습니다)
</Info>

### 요청 예시

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_APIYI_KEY(ClaudeOfficial group)" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 2048,
    "tools": [{"type": "web_search_20260209", "name": "web_search"}],
    "messages": [{"role": "user", "content": "What new models has Anthropic released recently? Search and cite sources."}]
  }'
```

Tool versions:

| 도구              | 유형                                              | 참고                           |
| --------------- | ----------------------------------------------- | ---------------------------- |
| Web Search (권장) | `web_search_20260209`                           | 동적 필터링을 사용하며, 4.6+ 모델에 적용됩니다 |
| Web Search (기본) | `web_search_20250305`                           | 이전 모델과 호환됩니다                 |
| Web Fetch       | `web_fetch_20260209` (기존: `web_fetch_20250910`) | 지정된 URL에서 콘텐츠를 가져옵니다         |

선택적 매개변수: `max_uses` (검색 횟수를 제한), `allowed_domains` / `blocked_domains` (도메인 필터링).

### 검색이 실제로 실행되었는지 확인하는 방법

성공적인 응답에는 `server_tool_use` 및 `web_search_tool_result` 블록이 `content`에 포함되며, 답변 본문에 인용이 있고, `usage`에 카운터 필드가 있습니다:

```json theme={null}
"usage": {
  "server_tool_use": { "web_search_requests": 2 }
}
```

응답에 `text` 블록만 있고 `usage`에 `server_tool_use`가 없으면, 요청이 검색 가능한 채널에 도달하지 못한 것입니다.

### 과금

* **도구 이름: `web_search`, `web_fetch`**
* web\_search: **\$10 / 1,000회 검색**(\$0.01/검색, `usage.server_tool_use.web_search_requests` 기준으로 계산됨 — 하나의 답변이 여러 번의 검색을 유발할 수 있음) + 일반 token 요금; 실패한 검색은 과금되지 않습니다
* web\_fetch: 호출당 요금 없음; 가져온 콘텐츠는 입력 token으로 과금됩니다
* web 지원 Q\&A당 참고 비용(Sonnet): 대략 \$0.02–0.08

## 옵션 2: 사용자 정의 검색 도구(기본 그룹에서 작동하며, 프로덕션에 권장됩니다)

기본 그룹(Bedrock)은 \*\*표준 함수 호출(사용자 정의 도구)\*\*을 완전히 지원합니다. 검색 도구를 정의하고, 클라이언트가 실제 검색(Tavily / Brave / Serper / Bing 같은 검색 API를 통해)을 실행한 다음, 결과를 모델에 다시 전달합니다. 테스트에서는 Claude가 도구를 적극적으로 호출하고, 중국어와 영어 모두에서 쿼리를 다시 작성하며, 여러 차례의 검색 라운드 후 출처가 포함된 답변을 생성합니다.

### 전체 예제(Python)

```python theme={null}
import requests

API_KEY = "YOUR_APIYI_KEY"  # default group works
URL = "https://api.apiyi.com/v1/messages"
HEADERS = {
    "content-type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
}

SEARCH_TOOL = {
    "name": "web_search",
    "description": ("Search the web for current information. Call this whenever "
                    "the user asks about recent events or anything after your "
                    "knowledge cutoff. You may call it multiple times."),
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "Search keywords"}},
        "required": ["query"],
    },
}

def do_search(query: str) -> str:
    """Call your search API of choice (Tavily/Brave/Serper, etc.) and return result text."""
    # Tavily example:
    # r = requests.post("https://api.tavily.com/search",
    #                   json={"api_key": TAVILY_KEY, "query": query, "max_results": 5})
    # return "\n".join(f"- {x['title']}\n  {x['url']}\n  {x['content'][:200]}"
    #                  for x in r.json()["results"])
    ...

messages = [{"role": "user", "content": "What new models has Anthropic released recently? Search, then answer with sources."}]

for _ in range(5):  # tool loop, up to 5 rounds
    resp = requests.post(URL, headers=HEADERS, json={
        "model": "claude-sonnet-4-6",
        "max_tokens": 2048,
        "tools": [SEARCH_TOOL],
        "messages": messages,
    }, timeout=180).json()

    if resp.get("stop_reason") != "tool_use":
        print(next(b["text"] for b in resp["content"] if b["type"] == "text"))
        break

    messages.append({"role": "assistant", "content": resp["content"]})
    results = [{"type": "tool_result", "tool_use_id": b["id"],
                "content": do_search(b["input"]["query"])}
               for b in resp["content"] if b["type"] == "tool_use"]
    messages.append({"role": "user", "content": results})
```

### 비용 참고

* 모델 token 요금: 한 번의 다중 라운드 검색 Q\&A는 대략 10k 입력 + 1–2k 출력 tokens를 사용합니다(sonnet 기준 약 \$0.05)
* 검색 API 요금: Tavily 무료 티어는 월 1,000회 호출(유료는 호출당 약 \$0.008), Brave는 1,000회 호출당 \$3입니다. 공식 web\_search와 비슷한 수준입니다
* 장점: 채널에 구애받지 않고, 제어 가능하며 캐시 가능한 검색 소스를 사용할 수 있고, 기본 그룹의 안정성과 캐시 과금 이점을 그대로 유지할 수 있습니다

### 고급: MCP 검색 소스

이미 MCP 생태계(Tavily MCP, Brave MCP 등)를 사용하고 있다면, **클라이언트 측**에서 MCP 서버에 연결한 뒤 그 도구를 위에서 보인 사용자 정의 도구로 변환하시면 됩니다. 원리는 동일합니다. 참고: 요청에서 `mcp_servers` 매개변수를 직접 전달하는 방식(서버 측 MCP)은 기본 그룹에서 **지원되지 않습니다**.

## FAQ

**Q: 기본 그룹에 web\_search tool을 보냈는데 오류가 없었습니다. 그러면 지원된다는 뜻입니까?**

A: 아닙니다. 기본 그룹은 서버 도구를 무리 없이 처리합니다(무시합니다). 요청은 200을 반환하지만 검색은 수행되지 않습니다. 확인하려면 응답 `content`에 `server_tool_use` 블록이 있는지, 그리고 `usage`에 `server_tool_use.web_search_requests` 필드가 있는지 확인하십시오. 없으면 검색이 실행되지 않은 것입니다.

**Q: `mcp_servers` 매개변수를 전달하는 것은 어떻습니까?**

A: 이것도 지원되지 않습니다(이것 역시 Anthropic의 서버 측 기능입니다). 중요한 점은 이 경우 모델이 답변 본문에 그럴듯해 보이는 “tool result” 텍스트를 생성할 수 있다는 것입니다. 이는 환각이며 실제 데이터가 아닙니다. 이에 의존하지 마십시오.

**Q: 두 옵션 중에서는 어떻게 선택해야 합니까?**

A: 운영 환경에서는 옵션 2(안정적이고 제어 가능함)를 권장합니다. Anthropic의 네이티브 검색 품질이나 인용 형식이 필요하거나 직접 검색을 구축하고 싶지 않다면, 고객 지원에 문의하여 ClaudeOfficial 베타 그룹을 활성화하십시오. 그리고 폴백을 준비해 두십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="Claude API 기본" icon="sparkles" href="/ko/api-capabilities/claude">
    채널, 모델 목록, 설정, 그리고 과금 기본 사항
  </Card>

  <Card title="Claude 프롬프트 캐싱" icon="database" href="/ko/api-capabilities/claude-prompt-caching">
    다회차 검색 Q\&A는 캐싱과 잘 어울려 큰 비용 절감 효과를 냅니다
  </Card>
</CardGroup>
