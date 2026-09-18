> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 코드 실행 및 원격 MCP 가이드

> APIYI의 Grok code_interpreter 서버 측 코드 실행과 원격 MCP 도구를 직접 확인했습니다. Python 샌드박스가 실제로 코드를 실행하고 외부 MCP 서버가 성공적으로 연결됩니다. 예제와 응답 구조를 포함합니다.

실시간 검색 외에도 Grok의 Responses API는 서버 측 도구 두 가지를 더 제공합니다: **코드 실행** (`code_interpreter`, 서버 측 Python 샌드박스)과 **Remote MCP** (xAI의 서버가 사용자가 지정한 MCP 서버에 직접 연결됩니다). 두 기능 모두 기본 그룹 키로 APIYI에서 정상 동작함이 확인되었습니다(2026년 7월 13일, UTC+8).

## 코드 실행

모델은 Python을 작성하고 xAI의 서버 측 샌드박스에서 실제로 실행합니다. 정확한 계산과 데이터 처리에 이상적입니다. 테스트에서 100의 거듭제곱인 2를 요청했을 때, 모델은 `print(2 ** 100)`을 실행하고 정확한 값을 반환했습니다(순수 언어 모델이 흔히 틀리는 대정수 연산이며, 코드 실행은 정확합니다):

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "code_interpreter"}],
    input="Compute 2 to the power of 100 exactly, using code",
)
print(resp.output_text)
# 2^100 = 1267650600228229401496703205376

# Inspect the code the model actually ran
for item in resp.output:
    if item.type == "code_interpreter_call":
        print("Executed code:", item.code)
```

단일 코드 실행 작업의 측정 지연 시간: 약 6초입니다. `usage.server_side_tool_usage_details.code_interpreter_calls`는 실행 횟수를 기록합니다.

## 원격 MCP 도구

요청에 외부 MCP 서버를 선언하면 xAI의 서버가 자동으로 연결하여 도구를 나열하고 필요에 따라 호출합니다. 로컬 MCP 클라이언트는 필요하지 않습니다. 공개 MCP 서버에 연결하고 도구 호출을 완료한 것이 검증되었습니다(\~16초):

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never"
    }],
    input="Use deepwiki to find out what the openai/openai-python repo does, in one sentence",
)
print(resp.output_text)

# Inspect MCP call details
for item in resp.output:
    if item.type == "mcp_call":
        print("Tool:", item.name, "| Output:", item.output[:200])
```

| 매개변수               | 설명                                                         |
| ------------------ | ---------------------------------------------------------- |
| `server_label`     | 여러 MCP 서버를 구분하기 위한 레이블입니다                                  |
| `server_url`       | MCP 서버 주소입니다(공개적으로 접근 가능해야 합니다 — xAI의 서버가 직접 연결합니다)        |
| `require_approval` | `"never"`가 도구를 자동으로 호출합니다. 기본값은 두 번째 라운드가 필요한 승인 요청을 반환합니다 |

<Warning>
  * **MCP 서버는 공개적으로 접근 가능해야 합니다**: 연결은 xAI의 서버에서 시작되므로 인트라넷/localhost 주소는 작동하지 않습니다.
  * **데이터 보안에 유의하십시오**: 대화 내용이 xAI의 서버를 통해 해당 MCP 서버로 전송됩니다 — 신뢰하는 서비스만 연결하십시오.
  * 외부 서버의 가용성은 APIYI의 통제 범위를 벗어납니다. 실패 시 먼저 서버 상태를 확인하십시오.
</Warning>

## 컬렉션 검색 (RAG) — 사용 불가

xAI는 `collections_search`(지식 베이스 검색 / file\_search) 도구도 제공합니다. **하지만 APIYI에서는 사용할 수 없습니다**: 이를 사용하려면 파일을 업로드하고 xAI 콘솔에서 미리 컬렉션을 구축해야 하지만, APIYI는 상위 콘솔 접근 권한이 없는 키 풀 모드로 동작합니다. 테스트에서는 요청은 통과하지만 검색은 필연적으로 실패합니다(`file_search_call`는 failed를 반환합니다).

RAG의 경우, 자체적으로 검색을 구성하고(벡터 스토어 + 회수한 콘텐츠를 prompt에 주입), Grok의 1M 컨텍스트와 [자동 캐싱](/ko/faq/cache-billing)을 활용하십시오.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="여러 도구를 한 번에 선언할 수 있습니까?">
    예. `tools` 배열에는 `web_search` / `x_search` / `code_interpreter` / `mcp`을 함께 포함할 수 있으며, 모델은 작업마다 어떤 것을 호출할지 결정합니다. `usage.server_side_tool_usage_details`은 각각 별도로 계산됩니다.
  </Accordion>

  <Accordion title="코드 샌드박스는 네트워크나 내 파일에 접근할 수 있습니까?">
    샌드박스는 계산 작업(Python 수학 / 데이터 처리)을 대상으로 하며 로컬 파일에 접근할 수 없습니다. 외부 데이터가 필요하면 web\_search 또는 MCP tools와 결합하십시오.
  </Accordion>

  <Accordion title="실패한 도구 실행도 과금됩니까?">
    모델 측 추론 tokens는 정상적으로 과금됩니다. 도구 호출 수수료는 APIYI tool 요금과 실제 과금 명세서를 따릅니다 — 확장하기 전에 소량으로 검증하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Web & X 검색" icon="globe" href="/ko/api-capabilities/grok/web-search">
    같은 Responses API의 라이브 검색 도구
  </Card>

  <Card title="Grok 개요" icon="rocket" href="/ko/api-capabilities/grok/overview">
    모델 구성, 가격, 그리고 전체 기능 경계 표
  </Card>
</CardGroup>
