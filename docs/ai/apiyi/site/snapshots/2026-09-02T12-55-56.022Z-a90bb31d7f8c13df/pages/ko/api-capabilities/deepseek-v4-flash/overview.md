> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash 텍스트 생성

> DeepSeek V4 Flash GA: 1M 컨텍스트, 총 284B / 활성화 13B MoE, 두 엔드포인트 모두 사용 가능합니다. APIYI에서는 1M tokens당 입력 $0.44 / 출력 $1.32이며 — DeepSeek은 피크/비피크로 과금하고, APIYI는 항상 피크 요율로 과금합니다 — 측정된 322K-token 컨텍스트에 15초 만에 응답했습니다.

DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`)는 `DeepSeek-V4-Flash-0731`에 해당하며,
2026년 7월 31일 DeepSeek가 일반 공개로 전환한 오픈소스 체크포인트입니다. 아키텍처는 4월 프리뷰(총 284B / 활성화 13B MoE, 1M 컨텍스트)와 동일하며,
DeepSeek는 사후 학습 단계만 다시 수행했다고 밝히지만 에이전트 벤치마크는 크게 개선되었습니다. APIYI는 **21개의 테스트 케이스와 전용 듀얼 엔드포인트 재테스트**를 완료했습니다.
Chat Completions와 Responses는 모두 직접 호출할 수 있습니다.

<Info>
  **APIYI가 DeepSeek V4 Flash GA를 출시했습니다**: 모델 이름 `deepseek-v4-flash-ga-260731`,
  `default` / `svip` 그룹에서 사용할 수 있습니다. 이 모델은 기본적으로 **추론을 많이 합니다** —
  단순한 작업에는 `thinking: {"type": "disabled"}`를 명시적으로 전달하십시오(아래의 “추론 제어” 참조).
</Info>

## 주요 장점

<CardGroup cols={2}>
  <Card title="견고한 1M 컨텍스트" icon="scroll-text">
    입력 상한은 1,048,570 tokens입니다. 322K-token 바늘 찾기 테스트는 정확히 적중하며 14.77초 만에 반환되었고, 최대 출력은 393,216 tokens입니다.
  </Card>

  <Card title="두 개의 캐싱 계층" icon="database-zap">
    암시적 캐시는 별도 설정이 필요 없으며 두 번째 라운드에서 99.9%의 캐시 적중률을 보입니다. Responses는 연결형 명시적 캐싱을 추가하여 이전 전체 컨텍스트에 적중합니다.
  </Card>

  <Card title="스로틀링 없는 동시 실행 수" icon="gauge">
    20개의 병렬 요청이 모두 200을 반환했으며, 실제 경과 시간은 단일 호출보다 1.3초만 더 걸렸습니다 — 높은 동시 실행 수의 에이전트와 배치 텍스트 작업에 적합합니다.
  </Card>

  <Card title="과금" icon="circle-dollar-sign">
    1M tokens당 \$0.44 입력 / \$1.32 출력, 캐시 적중은 \$0.0136까지 낮습니다. DeepSeek는 2026년 8월 17일에 피크/비피크 2단계 과금으로 전환했으며, APIYI는 항상 피크 구간으로 과금합니다.
  </Card>
</CardGroup>

## 모델 정보

| Parameter                         | Value                                                  |
| --------------------------------- | ------------------------------------------------------ |
| **모델명**                           | `deepseek-v4-flash-ga-260731`                          |
| **출시일**                           | 2026년 7월 31일(프리뷰에서 일반 공개로 전환)                          |
| **아키텍처**                          | 총 284B / 활성화 13B, MoE                                  |
| **컨텍스트 윈도우**                      | 1M(측정된 절대 한계 1,048,570 tokens)                         |
| **최대 출력**                         | 384K(측정된 절대 한계 393,216 tokens)                         |
| **사용 가능한 그룹**                     | `default`, `svip`                                      |
| **엔드포인트**                         | `POST /v1/chat/completions`, `POST /v1/responses`      |
| **심층 추론**                         | 기본적으로 켜져 있으며 자세하게 동작합니다; `thinking.type`로 비활성화할 수 있습니다 |
| **스트리밍**                          | ✅ 양쪽 엔드포인트                                             |
| **함수 호출 / tool 사용**               | ✅ 양쪽 엔드포인트                                             |
| **이미지 입력**                        | ❌ 텍스트 전용 모델                                            |
| **Anthropic 엔드포인트 / Claude Code** | ❌ 연결되지 않음 — 필요하면 `deepseek-v4-flash`를 사용하십시오           |

## 측정된 기능 매트릭스

2026년 8월 5일에 APIYI에서 테스트한 결과입니다(공식 주장 vs 실제 동작):

| 기능                         | 공식            | Chat Completions        | Responses                           |
| -------------------------- | ------------- | ----------------------- | ----------------------------------- |
| 기본 채팅(non-stream / stream) | ✅             | ✅ / ✅ (TTFB 1.43s)      | ✅ / ✅ (TTFB 2.31s)                  |
| 함수 호출(2회전 루프)              | ✅             | ✅                       | ✅                                   |
| 추론 토글 `thinking.type`      | ✅             | ✅ 비활성화 / 활성화 / 자동 모두 작동 | ✅ 추론 항목을 출력합니다                      |
| 추론 단계                      | ✅             | ⚠️ `minimal`만 결정적입니다    | ⚠️ 동일합니다                            |
| 암시적 캐시                     | ✅             | ✅ 2회차에서 99.9% 캐시 적중     | ✅ 99.9% 캐시 적중                       |
| 명시적 캐시                     | ✅ (Responses) | —                       | ✅ `previous_response_id` 체이닝이 필요합니다 |
| 구조화 출력                     | ❌             | ❌ 허용되지만 강제되지는 않음        | ❌ 허용되지만 강제되지는 않음                    |
| 온라인 검색                     | ✅ (Responses) | —                       | ⚠️ 연결되어 있지만 백엔드가 6/6회 모두 실패했습니다     |
| MCP                        | ✅ (Responses) | —                       | ❌ `AccessDenied`, 계정 수준 권한          |
| 이미지 입력                     | —             | ❌                       | ❌ 명시적 오류                            |

<Warning>
  **공식 표와 일치하지 않는 기능이 3개 있습니다 — 통합 전에 반드시 알아두십시오**:
  구조화 출력은 두 엔드포인트 모두에서 조용히 실패합니다(스키마를
  완전히 무시한 채 200을 반환합니다 — 강제가 필요할 때는 Function Call을 사용하십시오); 온라인 검색 도구는
  연결되어 있지만 백엔드가 계속 오류를 반환하며 `results`를 반환하지 않습니다; MCP는 `AccessDenied`를 반환합니다
  (모델 제한 사항이 아니라 계정 수준의 내장 도구 권한입니다).
</Warning>

## 추론 제어

이 모델은 기본적으로 **많이 추론합니다** — 한 줄 질문인 “9.11이 9.9보다 큰가”는
우리 테스트에서 추론 token 263개를 사용했습니다(형제 `deepseek-v4-flash`은 44개만 사용했습니다).
간단한 작업에서는 명시적으로 비활성화하십시오:

```python theme={null}
extra_body={"thinking": {"type": "disabled"}}   # reliably off
# or
extra_body={"reasoning_effort": "minimal"}      # 0 reasoning tokens in 10/10 runs
```

<Warning>
  **`reasoning_effort`는 단조 증가형 사다리가 아닙니다.** 두 질문 × 다섯 티어 × 다섯 샘플:

  | 티어        | river 중앙값 | prob 중앙값 |
  | --------- | --------- | -------- |
  | `minimal` | **0**     | **0**    |
  | `low`     | 956       | 367      |
  | `medium`  | 506       | 193      |
  | `high`    | **97**    | **153**  |
  | `max`     | 577       | 173      |

  `high`은 두 질문 모두에서 `low`보다 추론이 적었으며, 티어 내 분산
  (`low`는 150에서 1993까지 분포함)이 티어 간 차이보다 훨씬 큽니다.
  **오직 `minimal`만 신뢰할 수 있습니다** — low → max를 비용 다이얼로 취급하지 마십시오.
</Warning>

## 캐싱

### 암시적 캐시(양쪽 엔드포인트에서 자동)

동일한 긴 prefix는 두 번째 요청에서 캐시 적중합니다. 15,634토큰 prefix가 15,616토큰(99.9%)과 일치했으며, 백만 tokens당 \$0.028로 과금되었습니다.

<Tip>
  암시적 캐시는 **바이트 단위로 동일한 prefix**가 필요합니다. 타임스탬프,
  랜덤 ID, 사용자 이름처럼 변동 가능한 항목은 모두 prompt 끝에 두고, 절대 prefix에 섞지 마십시오.
</Tip>

### 명시적 캐시(Responses, 체인이 필요함)

**흔한 실수**: `caching`를 설정한 채 같은 긴 prefix를 두 번 다시 보내면
`cached_tokens`가 0으로 남습니다. 올바른 패턴은 첫 호출에서 기록한 다음,
`previous_response_id`로 체인하는 것입니다:

| 라운드    | 호출 형태                    | input\_tokens | cached\_tokens |
| ------ | ------------------------ | ------------- | -------------- |
| 1 (쓰기) | `caching: enabled`       | 15,629        | 0              |
| 2      | + `previous_response_id` | 15,664        | **15,629**     |
| 3      | + `previous_response_id` | 15,701        | **15,664**     |
| 4      | + `previous_response_id` | 15,738        | **15,701**     |

## 빠른 시작

<CodeGroup>
  ```python Python theme={null}
  import os
  from openai import OpenAI

  client = OpenAI(
      api_key=os.environ["APIYI_API_KEY"],
      base_url="https://api.apiyi.com/v1",
  )

  resp = client.chat.completions.create(
      model="deepseek-v4-flash-ga-260731",
      messages=[{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      extra_body={"thinking": {"type": "disabled"}},
  )
  print(resp.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "deepseek-v4-flash-ga-260731",
      "messages": [{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      "thinking": {"type": "disabled"}
    }'
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.APIYI_API_KEY,
    baseURL: "https://api.apiyi.com/v1",
  });

  const resp = await client.chat.completions.create({
    model: "deepseek-v4-flash-ga-260731",
    messages: [{ role: "user", content: "Explain the MoE architecture in one sentence" }],
    thinking: { type: "disabled" },
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

### 구조화된 출력이 필요하십니까? Function Call을 사용하십시오

`response_format`은 이 모델에서는 아무 효과도 없고 오류도 발생시키지 않으며, 가장 쉽게 빠질 수 있는 함정입니다. 실제로 제약되는 것은 도구 인자입니다:

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "submit_result",
        "description": "Submit the extracted result",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temp_c": {"type": "number"},
            },
            "required": ["city", "temp_c"],
        },
    },
}]

resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "Beijing is 25 degrees today"}],
    tools=tools,
)

import json
print(json.loads(resp.choices[0].message.tool_calls[0].function.arguments))
```

## 가격

| 항목    | 가격                  |
| ----- | ------------------- |
| 입력    | \$0.44 / M tokens   |
| 출력    | \$1.32 / M tokens   |
| 캐시 적중 | \$0.0136 / M tokens |

DeepSeek는 2026년 8월 17일 00:00(UTC+8)에 2단계 과금으로 전환했으며, 비피크 시간대에는 최고 요율의 절반이 적용됩니다. APIYI는 **항상 최고 단계 요율**로 과금하며, 시간대에 따른 변동은 없습니다 — [DeepSeek 가격 변경 공지](/en/news/deepseek-price-increase-2026-08)를 참고하십시오. [충전 프로모션](/ko/faq/recharge-promotions)과 함께 적용되어 실질 비용을 추가로 낮출 수 있습니다.

<Info>
  **“대표 모델의 1/10 미만”에 관하여**: 공급업체의 마케팅은 V4-Pro의 미리보기 시기 \$1.74 / \$3.48과 비교하고 있습니다. V4-Pro의 현재 가격(\$1.32 / \$3.96)과 비교하면, 이 모델은 **대략 1/3 수준**이며 1/10은 아닙니다.
</Info>

## 관련 페이지

<CardGroup cols={2}>
  <Card title="채팅 완성" icon="message-square" href="/ko/api-capabilities/deepseek-v4-flash/chat-completions">
    대화형 플레이그라운드가 포함된 OpenAI 호환 채팅 엔드포인트
  </Card>

  <Card title="응답" icon="git-fork" href="/ko/api-capabilities/deepseek-v4-flash/responses">
    체인형 명시적 캐싱을 사용하는 응답 엔드포인트
  </Card>

  <Card title="출시 해설과 전체 테스트 데이터" icon="newspaper" href="/en/news/deepseek-v4-flash-ga-launch">
    벤치마크, 3자 속도 비교, 그리고 우리가 마주한 함정
  </Card>

  <Card title="모델 요금 표" icon="table" href="/en/models">
    모든 모델의 단가, 엔드포인트 및 그룹
  </Card>
</CardGroup>
