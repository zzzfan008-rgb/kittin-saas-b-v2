> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 모델 시리즈 가이드

> APIYI의 xAI Grok 4.x 시리즈 (grok-4.6 / grok-4.5 / grok-4.3 / grok-4.20 / grok-build-0.1)는 OpenAI 호환 + Responses API 이중 엔드포인트를 제공하며, 웹 검색 / X 검색 / 코드 실행 / MCP 서버 측 도구가 작동하는 것으로 검증되었습니다. 표기된 가격은 xAI 공식과 일치하며, GrokOfficial 그룹은 0.8배로 운영됩니다.

Grok은 xAI의 플래그십 모델 패밀리입니다. 현재 세대(Grok 4.x)는 다섯 가지 제품 라인 — 플래그십 범용, 장문 컨텍스트 표준, 추론/비추론 변형, 코드 중심, 멀티 에이전트 협업 — 으로 구성되며, 모두 APIYI에서 사용할 수 있습니다. **xAI의 공식 API 자체는 OpenAI 호환입니다** (Chat Completions + Responses API)이며 별도의 독자 프로토콜이 없으므로, OpenAI SDK로 APIYI를 통해 Grok를 호출하면 공식 서버 측 도구(web search, X search, code execution, Remote MCP)를 포함한 전체 기능을 사용할 수 있습니다.

이 문서 그룹은 2026년 7월 13일 (UTC+8)에 APIYI 게이트웨이를 상대로 수행한 완전한 실전 테스트 — 요청/응답 로그 56건 — 를 기반으로 하며, 따라서 여기에 명시된 모든 기능 경계는 검증되었습니다.

<Note>
  **🚀 주요 내용**: `grok-4.6`는 xAI의 최신 플래그십으로, 2026년 8월 7일에 출시되었습니다. 이는 grok-4.5의 1.5T 파라미터 V9 기반을 그대로 재사용하며, 향상분 전부가 post-training에서 비롯되었고, **정가는 grok-4.5와 동일합니다**; grok-4.3과 grok-4.20 시리즈는 **1M-token context window**를 제공합니다; Responses API 도구 **web\_search / x\_search / code\_interpreter / MCP는 모두 APIYI에서 정상 동작함이 검증되었습니다**, 그리고 X search는 Grok에만 있는 기능입니다; 네이티브 responses 지원은 또한 Grok가 [OpenAI Codex에 바로 연결](/ko/scenarios/programming/codex-cli)될 수 있음을 의미합니다. 전체 시리즈는 \*\*`GrokOfficial` 그룹에서 0.8배 요율 배수(20% 할인)\*\*로 실행할 수 있습니다 — 아래의 “그룹 및 할인”을 참조하십시오.
</Note>

## 모델 라인업

<CardGroup cols={3}>
  <Card title="grok-4.6" icon="trophy">
    **최신 플래그십 · 코드 & 에이전트**

    2026/8/7에 출시되었으며, 500K 컨텍스트 윈도우를 제공합니다. grok-4.5와 같은 기반과 같은 가격이며, 장시간 실행되는 작업에서 자체 검증이 더 강력합니다.
  </Card>

  <Card title="grok-4.5" icon="medal">
    **이전 플래그십 · 같은 가격**

    500K 컨텍스트 윈도우를 제공하며, grok-4.6과 같은 가격으로 책정되어 있습니다 — 기존 워크로드는 계속 이를 사용할 수 있습니다.
  </Card>

  <Card title="grok-4.3" icon="scale">
    **표준 주력 모델**

    1M 컨텍스트 윈도우를 플래그십 가격의 약 60% 수준으로 제공합니다 — 일상적인 채팅과 중급 추론에 적합한 균형 잡힌 선택입니다.
  </Card>

  <Card title="grok-4.20 Variants" icon="split">
    **추론 / 비추론**

    `-reasoning`과 `-non-reasoning`는 동일한 가격과 1M 컨텍스트 윈도우를 공유합니다. chain-of-thought가 필요한지에 따라 선택하십시오.
  </Card>

  <Card title="grok-build-0.1" icon="code">
    **코드 중심**

    256K 컨텍스트 윈도우와 시리즈 내 최저 가격을 제공합니다 — 고빈도 코드 완성과 가벼운 코딩 작업에 이상적입니다.
  </Card>

  <Card title="grok-4.20-multi-agent-beta-0309" icon="users">
    **멀티 에이전트 협업**

    여러 에이전트가 복잡한 리서치 작업을 병렬로 처리합니다. 특수 과금 프로필 — [Multi-Agent Model](/ko/api-capabilities/grok/multi-agent)을 참조하십시오.
  </Card>

  <Card title="더 많은 기능 페이지" icon="book-open">
    채팅/추론/비전: [채팅 & 추론](/ko/api-capabilities/grok/chat); 실시간 검색: [웹 & X 검색](/ko/api-capabilities/grok/web-search).
  </Card>
</CardGroup>

## 가격

표시된 가격은 xAI의 공식 가격과 일치합니다(APIYI 가격 API를 기준으로 2026-07-13에 항목별로 검증되었으며; `grok-4.6` 2026-08-13에 다시 검증되었습니다). APIYI의 할인은 **`GrokOfficial` 그룹의 0.8x**와 [충전 프로모션](/ko/faq/recharge-promotions)에서 비롯되며, 두 할인은 중복 적용됩니다.

아래 표는 **0 – 200K 컨텍스트 티어**입니다(전체 Grok 시리즈는 컨텍스트 길이에 따라 티어별로 과금되며, 상위 티어는 아래에 나와 있습니다):

| 모델 ID                             | 컨텍스트 | 입력                 | 출력                 | 포지셔닝                        |
| --------------------------------- | ---- | ------------------ | ------------------ | --------------------------- |
| `grok-4.6`                        | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | **최신 플래그십**: 코드 / 에이전트 / 범용 |
| `grok-4.5`                        | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 이전 플래그십, 4.6과 동일한 가격        |
| `grok-4.3`                        | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 표준 주력 모델                    |
| `grok-4.20-0309-reasoning`        | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 추론 변형                       |
| `grok-4.20-0309-non-reasoning`    | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 비추론(빠르고 저비용)                |
| `grok-4.20-multi-agent-beta-0309` | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 멀티에이전트(과금 증폭!)              |
| `grok-build-0.1`                  | 256K | \$1.00 / 1M tokens | \$2.00 / 1M tokens | 코드 중심                       |

### 티어별 과금 및 캐시 요율

전체 Grok 시리즈는 단일 요청의 컨텍스트 길이를 기준으로 두 티어로 과금되며, 분기점은 200K tokens(200Ki = 204,800)입니다. 그 지점을 넘으면 입력 및 출력 요율이 두 배가 됩니다:

| 모델                              | 티어          | 입력     | 출력      | 캐시 읽기  |
| ------------------------------- | ----------- | ------ | ------- | ------ |
| `grok-4.6`                      | 0 – 200K    | \$2.00 | \$6.00  | \$0.50 |
| `grok-4.6`                      | 200K – 512K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.5`                      | 0 – 200K    | \$2.00 | \$6.00  | \$0.30 |
| `grok-4.5`                      | 200K – 512K | \$4.00 | \$12.00 | \$0.60 |
| `grok-4.3` / `grok-4.20` series | 0 – 200K    | \$1.25 | \$2.50  | \$0.20 |
| `grok-4.3` / `grok-4.20` series | 200K – 1M   | \$2.50 | \$5.00  | \$0.40 |
| `grok-build-0.1`                | 0 – 200K    | \$1.00 | \$2.00  | \$0.20 |
| `grok-build-0.1`                | 200K – 256K | \$2.00 | \$4.00  | \$0.40 |

모든 수치는 1M tokens당 기준입니다. **`grok-4.6`과 `grok-4.5`의 유일한 가격 차이는 캐시 읽기 요율**(\$0.50 대 \$0.30)이며, 입력과 출력은 동일합니다.

`grok-4.6`의 두 티어는 입력, 출력 및 캐시 읽기에 대해 APIYI 콘솔에서 항목별로 검증되었습니다. 다른 모델의 2티어 캐시 읽기 요율은 xAI의 “2티어는 두 배” 관례를 바탕으로 산정되었으므로, [모델 정보 페이지](/ko/api-capabilities/model-info)의 실시간 목록을 기준으로 삼으십시오.

<Info>
  * 별칭 `grok-code-fast` / `grok-code-fast-1`도 호출 가능합니다(연결성 검증됨). 가격은 [모델 정보 페이지](/ko/api-capabilities/model-info)를 참조하십시오.
  * 캐시된 입력 tokens는 위 표의 캐시 읽기 요율로 과금됩니다. Grok 프리픽스 캐싱은 **자동이며 — 별도 설정이 필요하지 않습니다**, 두 엔드포인트와 streaming/non-streaming 모두에서 검증되었습니다. [Grok 캐시 과금 가이드](/ko/api-capabilities/grok/prompt-caching)를 참조하십시오.
  * 장문 컨텍스트 작업에서는 티어 경계를 주의하십시오. 210K-token 요청 1건은 경계선 위의 10K만이 아니라 전체가 2티어 요율로 과금됩니다. 요청을 분할하면 이 급등을 피할 수 있습니다.
</Info>

## 그룹 및 할인

| 그룹             | 배수       | 비고                                    |
| -------------- | -------- | ------------------------------------- |
| `Default`      | 1.0x     | 기본 그룹; xAI 공식과 일치하는 정가입니다             |
| `GrokOfficial` | **0.8x** | xAI 직접 릴레이 라인 — **기본 그룹 가격에서 20% 할인** |

`GrokOfficial`는 **기본 그룹과 동일한 모델 동작과 호출 구문을 가집니다**. Grok 시리즈의 사용을 늘리기 위한 프로모션일 뿐입니다. token을 생성할 때 선택하거나(또는 기존 Grok token에 추가하거나) **코드 한 줄도 변경할 필요가 없으며**; `grok-4.6`와 나머지 시리즈는 이 그룹에서 Codex에서도 계속 사용할 수 있습니다.

할인은 [충전 프로모션](/ko/faq/recharge-promotions) (10%–20%)과 중복 적용됩니다. 첫 단계에서 `grok-4.6`를 적용하면:

| 기준                  | 입력 / 1M tokens | 출력 / 1M tokens |
| ------------------- | -------------- | -------------- |
| xAI 공식 = APIYI 정가   | \$2.00         | \$6.00         |
| `GrokOfficial` 0.8x | \$1.60         | \$4.80         |
| 0.8x + 10% 충전 보너스   | \$1.45         | \$4.36         |
| 0.8x + 20% 충전 보너스   | **\$1.33**     | **\$4.00**     |

## 검증된 기능 매트릭스

2026-07-13 (UTC+8)에 APIYI 게이트웨이를 대상으로 테스트했습니다(✅ 검증 완료; ◐ 아직 테스트하지 않음, 동일한 아키텍처에서 동일할 것으로 예상됨; — 포함되지 않음, 동일한 아키텍처에서 동일할 것으로 예상됨):

| 기능                      |  grok-4.6  |  grok-4.5  |  grok-4.3  | 4.20-reasoning | 4.20-non-reasoning | grok-build-0.1 | multi-agent |
| ----------------------- | :--------: | :--------: | :--------: | :------------: | :----------------: | :------------: | :---------: |
| 기본 채팅                   |      ✅     |      ✅     |      ✅     |        ✅       |          ✅         |        ✅       |      ✅      |
| 사용량 포함 스트리밍             |      ✅     |      ✅     |      ✅     |        ✅       |          ✅         |        ✅       |      ✅      |
| 추론 `reasoning_content`  | ◐ 기본적으로 켜짐 | ✅ 기본적으로 켜짐 | ✅ 기본적으로 켜짐 |        ✅       |      ❌ 설계상 꺼짐      |   ✅ 기본적으로 켜짐   |    내부 전용    |
| `reasoning_effort` 파라미터 |      ◐     |      ✅     |      —     |   ❌ 명시적으로 거부됨  |          —         |        —       |      —      |
| 구조화된 출력(json\_schema)   |      ◐     |      ✅     |      ✅     |        ✅       |          —         |        ✅       |      ✅      |
| 함수 호출 / 도구 사용           |      ◐     |      ✅     |      ✅     |        —       |          —         |        ✅       |      —      |
| 비전 입력(이미지 이해)           |      ◐     |      ✅     |      ✅     |        —       |          ✅         |        —       |      —      |
| 프롬프트 캐싱(자동)             |      ✅     |      ✅     |      ✅     |        ✅       |          ✅         |        ✅       |      ✅      |
| Responses API + 서버 측 도구 |      ◐     |      ✅     |      —     |        —       |          —         |        —       |      —      |

<Note>
  **`grok-4.6` 열에 여전히 ◐ 표시가 남아 있는 이유**: 이 56회 요청 테스트 실행은 4.6이 존재하기 전인 2026-07-13의 것입니다. 2026-08-19에는 4.6에서 **기본 채팅, 사용량 포함 스트리밍, 프롬프트 캐싱**을 다시 테스트했으며 — `/v1/chat/completions`와 `/v1/responses` 모두에서, 스트리밍과 비스트리밍 모두에 대해, 과금을 항목별로 대조하여 — 해당 행들은 이제 검증된 결과를 보고합니다. 남아 있는 ◐ 표시들은 동일 아키텍처에 따른 기대치를 그대로 따릅니다. 4.6은 4.5의 1.5T-파라미터 V9 기반, API 프로토콜 및 엔드포인트를 공유하며, xAI는 파라미터 수준의 파괴적 변경이 없다고 발표했습니다. 운영 환경에 투입하기 전에 자체 사용 사례로 소규모 샘플을 실행하십시오.
</Note>

## 엔드포인트

| 엔드포인트                  | 메서드    | 목적                                                           |
| ---------------------- | ------ | ------------------------------------------------------------ |
| `/v1/chat/completions` | `POST` | 채팅 / 추론 / 함수 호출 / 구조화된 출력 / 비전 (모든 모델에서 공유되며 `model`로 선택합니다) |
| `/v1/responses`        | `POST` | Responses API: 웹 검색, X 검색, 코드 실행, Remote MCP 및 기타 서버 측 도구    |

### Codex에서 직접 사용하기

Grok은 `/v1/responses`을 네이티브로 지원하므로, 네이티브 responses 프로토콜을 통해 **OpenAI Codex**(데스크톱 앱 / IDE 확장 / CLI)에서 동작하는 몇 안 되는 비-OpenAI 모델 중 하나입니다 — `config.toml`에서 `model = "grok-4.6"`과 `wire_api = "responses"`를 설정하면 5분 안에 연결되며, Codex의 에이전트 기능(도구 호출, 추론 항목 등)도 모두 네이티브 프로토콜에서 동작합니다. 반면 APIYI의 Claude / Gemini는 OpenAI 호환 채팅 모드(`wire_api = "chat"` 폴백)에서만 실행되며, 이는 Codex / 에이전트 시나리오에서 프로토콜 비호환성을 초래합니다. 전체 설정 단계는 [Codex 통합 가이드](/ko/scenarios/programming/codex-cli)를 참조하십시오.

<Warning>
  **다음은 APIYI에서 지원되지 않습니다** (검증됨 — 다음 함정을 피하십시오):

  * **레거시 Completions (`/v1/completions`)**: 상위 계층에서 거부됩니다 — Grok 4.x 전체 라인은 추론 아키텍처이며 공식 수준에서 원시 텍스트 완성을 지원하지 않습니다
  * **레거시 live-search 파라미터 `search_parameters`**: xAI에 의해 제거되었습니다(410 확인). 모든 live search는 Responses API 도구를 통해 이루어집니다 — [웹 및 X 검색](/ko/api-capabilities/grok/web-search)을 참조하십시오
  * **Batch API / Files**: 게이트웨이를 통해 라우팅되지 않으며, 키-풀 모드에는 적용되지 않습니다
  * **Deferred Completions (`deferred: true`)**: 해당 파라미터는 **조용히 무시됩니다** — 요청은 동기적으로 실행되며 정상적으로 과금됩니다. 이에 의존하지 마십시오
  * **Collections Search (RAG / file\_search)**: xAI 콘솔에서 미리 구축된 collections가 필요하며, 키-풀 모드에는 적용되지 않습니다
  * **Context Compaction (`/v1/responses/compact`)**, **Priority Processing (`service_tier: "priority"` — 테스트에서는 기본값으로 폴백합니다)**, **WebSocket 모드**, **mTLS 인증**: 모두 지원되지 않습니다
</Warning>

## 빠른 시작

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "grok-4.6",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-api-key",
      base_url="https://api.apiyi.com/v1"
  )

  resp = client.chat.completions.create(
      model="grok-4.6",
      messages=[{"role": "user", "content": "Introduce yourself in one sentence"}]
  )
  print(resp.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-api-key',
    baseURL: 'https://api.apiyi.com/v1',
  });

  const resp = await client.chat.completions.create({
    model: 'grok-4.6',
    messages: [{ role: 'user', content: 'Introduce yourself in one sentence' }],
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

<Tip>
  **선택할 모델**: 기본값은 `grok-4.3`입니다(1M 컨텍스트, 균형 잡힌 가격). 코딩 에이전트와 복잡한 작업에는 `grok-4.6`로 업그레이드하십시오(가장 최신 플래그십이며 `grok-4.5`와 동일한 가격이므로, 기존 4.5 워크로드는 모델 이름만 바꾸면 됩니다). 빠르고 저렴한 답변에는 `grok-4.20-0309-non-reasoning`을 사용하십시오(사고의 연쇄 없이, 출력이 가장 저렴합니다). 고빈도 코드 완성에는 `grok-build-0.1`를 사용하십시오. 복잡한 연구 작업에는 멀티 에이전트 모델만 사용하십시오(과금 증폭에 유의하십시오). 가장 낮은 유효 요율을 원하면 Token을 `GrokOfficial` 그룹(0.8배)으로 옮기고 충전 보너스를 중첩하십시오.
</Tip>

## 과금 참고: 추론 tokens

`grok-4.6` / `grok-4.5` / `grok-4.3` / `grok-build-0.1` **기본적으로 내부적으로 추론합니다**: 응답에는 `reasoning_content`가 포함되며, 추론 tokens는 출력 과금에 포함됩니다. 테스트에서는 짧은 답변이 표시된 tokens는 30개에 불과했지만 과금된 출력 tokens는 586개였고(그중 556개가 추론이었습니다). 비용에 민감한 짧은 Q\&A의 경우 `grok-4.20-0309-non-reasoning`로 전환하세요. 자세한 내용은 [채팅 및 추론](/ko/api-capabilities/grok/chat)에서 확인하세요.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Grok에는 자체 네이티브 API 형식이 있습니까?">
    별도의 독점 프로토콜은 없습니다. xAI의 공식 REST API는 OpenAI와 호환됩니다: `/v1/chat/completions` (채팅)와 `/v1/responses`(Responses API 및 서버 측 도구)를 제공합니다. OpenAI SDK를 `https://api.apiyi.com/v1`에 연결하면 전체 기능 세트를 사용할 수 있으며, “호환성 모드로의 기능 축소”는 없습니다.
  </Accordion>

  <Accordion title="웹 검색은 어떻게 활성화합니까?">
    응답 API를 사용합니다: `tools: [{"type": "web_search"}]` (또는 `x_search`). Chat Completions의 기존 `search_parameters` 필드는 xAI에 의해 제거되었습니다(410 확인됨) — 사용하지 마십시오. [웹 및 X 검색](/ko/api-capabilities/grok/web-search)을 참조하십시오.
  </Accordion>

  <Accordion title="모델이 자신을 Grok 4라고 소개합니다 — 요청이 잘못된 모델에 도달한 것입니까?">
    이는 정상입니다. 모든 Grok 4.x 모델은 자신을 단순히 “Grok 4”라고 식별하며(멀티 에이전트 모델은 자신을 Oppie라고 부릅니다), 4.6 / 4.5 / 4.3 같은 정확한 버전 번호는 표시하지 않습니다. 모델의 자기소개가 아니라 요청과 응답의 `model` 필드를 통해 신원을 확인하십시오.
  </Accordion>

  <Accordion title="캐싱에 구성이 필요합니까?">
    아닙니다. Grok 프리픽스 캐싱은 자동입니다. `usage.prompt_tokens_details.cached_tokens`를 통해 적중을 확인하십시오(`/v1/responses`에서는 `usage.input_tokens_details.cached_tokens`를 읽으십시오). 적중은 128 tokens 단위로 내림 처리되며, 두 차례 테스트 모두 이를 확인했습니다. 8802-token 프리픽스는 8704에 적중했고, 2735-token 프리픽스는 2688에 적중했습니다. xAI는 캐시 항목이 제거될 수 있고 적중이 보장되지 않는다고 명시하므로, **캐시 미적용 가격을 기준으로 예산을 잡으십시오**. 자세한 내용은 [Grok 캐시 과금 가이드](/ko/api-capabilities/grok/prompt-caching)를 참조하십시오.
  </Accordion>

  <Accordion title="컨텍스트 윈도우를 초과하면 어떻게 됩니까?">
    400 오류가 발생합니다. 제한은 모델마다 다릅니다. grok-4.6과 grok-4.5는 500K, grok-4.3과 4.20 시리즈는 1M, grok-build-0.1은 256K입니다. 더 긴 콘텐츠는 요약하거나, 청크로 나누거나, RAG 검색을 사용하십시오.
  </Accordion>

  <Accordion title="실패한 요청도 과금됩니까?">
    4xx 클라이언트 오류(잘못된 매개변수 / 인증 실패)는 과금되지 않습니다. tokens를 성공적으로 반환하는 요청은 실제 사용량 기준으로 과금됩니다. `deferred: true`은 아무런 경고 없이 무시되며, 요청은 실제로 동기식으로 실행되고 정상적으로 과금됩니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="채팅 & reasoning" icon="message-square" href="/ko/api-capabilities/grok/chat">
    스트리밍, 사고 연쇄, 구조화된 출력, 함수 호출, 비전, 프롬프트 캐싱
  </Card>

  <Card title="캐시 과금" icon="database" href="/ko/api-capabilities/grok/prompt-caching">
    캐시 적중 시 75% 할인, 128-token 블록 단위, 그리고 장문 대화에 적합한 엔드포인트
  </Card>

  <Card title="웹 & X 검색" icon="globe" href="/ko/api-capabilities/grok/web-search">
    Responses API의 web\_search / x\_search 도구를 실습해 봅니다
  </Card>

  <Card title="코드 실행 & MCP" icon="terminal" href="/ko/api-capabilities/grok/code-execution-mcp">
    서버 측 Python 샌드박스와 원격 MCP 통합
  </Card>

  <Card title="멀티 에이전트 모델" icon="users" href="/ko/api-capabilities/grok/multi-agent">
    멀티 에이전트 모델의 기능과 과금 프로필
  </Card>

  <Card title="Codex에서 Grok 사용하기" icon="code" href="/ko/scenarios/programming/codex-cli">
    네이티브 응답 프로토콜, 5분 만에 Codex에 연결
  </Card>

  <Card title="Grok 4.6 출시 심층 분석" icon="newspaper" href="/en/news/grok-4-6-launch">
    xAI의 최신 플래그십에 대한 벤치마크, 가격 및 마이그레이션 노트
  </Card>

  <Card title="Grok 4.5 출시 심층 분석" icon="newspaper" href="/en/news/grok-4-5-launch">
    이전 플래그십에 대한 심층적인 살펴보기
  </Card>

  <Card title="모델 정보" icon="database" href="/ko/api-capabilities/model-info">
    사용 가능한 모든 모델 및 그룹
  </Card>
</CardGroup>
