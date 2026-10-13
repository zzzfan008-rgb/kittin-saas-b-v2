> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 모델 시리즈 가이드

> APIYI의 xAI Grok 4.x 시리즈(grok-4.7 / grok-4.6 / grok-4.5 / grok-4.3 / grok-4.20 / grok-build-0.1): OpenAI 호환 + Responses API 듀얼 엔드포인트를 제공하며, 웹 검색 / X 검색 / 코드 실행 / MCP 서버 측 tools의 정상 작동이 검증되었습니다. 가격 책정은 xAI 공식과 동일하며 기본 그룹은 공식 릴레이 라인입니다.

Grok은 xAI의 플래그십 모델 제품군입니다. 현세대(Grok 4.x)는 플래그십 범용, 롱 컨텍스트 표준, 추론/비추론 변형, 코드 특화, 다중 에이전트 협동에 이르는 5개 제품 라인업으로 구성되어 있으며, 모두 APIYI에서 이용하실 수 있습니다. **xAI의 공식 API는 그 자체로 OpenAI와 호환(Chat Completions + Responses API)되며** 별도의 독점 프로토콜이 없으므로, OpenAI SDK를 사용하여 APIYI를 통해 Grok을 호출하면 공식 서버 측 tools(웹 검색, X 검색, 코드 실행, Remote MCP)를 포함한 모든 기능을 그대로 이용하실 수 있습니다.

이 문서 그룹은 2026년 7월 13일 (UTC+8) APIYI 게이트웨이를 대상으로 진행한 56건의 요청/응답 로그 기반 실측 테스트를 바탕으로 작성되었으므로, 여기에 명시된 모든 기능 지원 범위는 검증을 마쳤습니다.

<Note>
  **🚀 주요 특징**: `grok-4.7`은(는) 2026년 9월 21일에 출시된 SpaceXAI (xAI)의 최신 플래그십입니다. 새로운 2.1T 파라미터 베이스 모델로 전환되어 코딩 에이전트 부문에서 가장 큰 향상을 이루었으며, **가격은 grok-4.6과 동일합니다**. grok-4.3 및 grok-4.20 시리즈는 **1M token 컨텍스트 윈도우**를 제공합니다. Responses API tools인 **web\_search / x\_search / code\_interpreter / MCP는 모두 APIYI에서 정상 작동함이 검증되었으며**, X 검색은 Grok만의 고유한 기능입니다. 또한 네이티브 responses 지원을 통해 Grok을 [OpenAI Codex에 바로 연결](/ko/scenarios/programming/codex-cli)하여 사용할 수도 있습니다. Grok 전 시리즈는 기본 그룹의 xAI 공식 릴레이 회선에서 구동되며 xAI와 동일한 가격으로 제공됩니다. 자세한 내용은 아래의 “그룹 및 할인” 항목을 참고하시기 바랍니다.
</Note>

## 모델 라인업

<CardGroup cols={3}>
  <Card title="grok-4.7" icon="trophy">
    **최신 플래그십 · 코드 및 에이전트**

    2026년 9월 21일에 출시되었으며, 500K 컨텍스트를 지원합니다. grok-4.6과 동일한 가격의 새로운 2.1T 파라미터 베이스 모델로, 긴 코딩 작업에서 뚜렷한 향상을 제공합니다.
  </Card>

  <Card title="grok-4.6" icon="award">
    **이전 플래그십 · 동일한 가격**

    2026년 8월 7일에 출시되었으며, 500K 컨텍스트를 지원합니다. grok-4.5와 동일한 기반을 갖추고 있으며, 장기 실행 작업에서 더 강력한 자체 검증 성능을 발휘합니다.
  </Card>

  <Card title="grok-4.5" icon="medal">
    **이전 플래그십 · 동일한 가격**

    500K 컨텍스트를 제공하며, grok-4.6과 입력 및 출력 가격이 동일하므로 기존 워크로드를 그대로 유지할 수 있습니다.
  </Card>

  <Card title="grok-4.3" icon="scale">
    **표준 주력 모델**

    플래그십 가격의 약 60% 수준으로 1M 컨텍스트를 제공하여, 일상적인 대화와 중간 수준의 추론을 위한 균형 잡힌 선택지입니다.
  </Card>

  <Card title="grok-4.20 변형 모델" icon="split">
    **추론 / 비추론**

    `-reasoning` 및 `-non-reasoning`은 동일한 가격과 1M 컨텍스트를 공유하며, 생각의 사슬(chain-of-thought) 필요 여부에 따라 선택하실 수 있습니다.
  </Card>

  <Card title="grok-build-0.1" icon="code">
    **코드 특화**

    256K 컨텍스트를 제공하며 시리즈 중 가장 저렴한 가격으로, 빈번한 코드 완성 및 가벼운 코딩 작업에 적합합니다.
  </Card>

  <Card title="grok-4.20-multi-agent-beta-0309" icon="users">
    **멀티 에이전트 협업**

    복잡한 연구 작업에 여러 에이전트가 병렬로 작동합니다. 특별 과금 프로필이 적용되므로 [멀티 에이전트 모델](/ko/api-capabilities/grok/multi-agent)을 참조하십시오.
  </Card>

  <Card title="추가 기능 페이지" icon="book-open">
    채팅/추론/비전: [채팅 및 추론](/ko/api-capabilities/grok/chat); 실시간 검색: [웹 및 X 검색](/ko/api-capabilities/grok/web-search).
  </Card>
</CardGroup>

## 가격 정책

가격은 xAI의 공식 가격과 동일하며(2026-07-13에 APIYI 가격 API를 통해 항목별로 검증 완료, `grok-4.6`는 2026-08-13에, `grok-4.7`은 2026-09-24에 재검증 완료), [충전 프로모션](/ko/faq/recharge-promotions) 혜택이 중복 적용됩니다.

아래 표는 **0 – 200K 컨텍스트 구간** 요금입니다(Grok 시리즈 전체는 컨텍스트 길이에 따라 구간별로 과금되며, 상위 구간은 아래에서 다룹니다):

| 모델 ID | 컨텍스트 | 입력 | 출력 | 포지셔닝 |
| - | - | - | - | - |
| `grok-4.7` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | **최신 플래그십**: 코드 / 에이전트 / 범용 |
| `grok-4.6` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 이전 플래그십, 4.7과 동일한 가격 |
| `grok-4.5` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 이전 플래그십, 4.6과 동일한 가격 |
| `grok-4.3` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 표준 주력 모델 |
| `grok-4.20-0309-reasoning` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 추론 변형 모델 |
| `grok-4.20-0309-non-reasoning` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 비추론 (빠르고 경제적) |
| `grok-4.20-multi-agent-beta-0309` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 멀티 에이전트 (과금 증폭 주의!) |
| `grok-build-0.1` | 256K | \$1.00 / 1M tokens | \$2.00 / 1M tokens | 코드 특화 |

### 구간별 과금 및 캐시 요율

Grok 시리즈 전체는 **단일 요청의 컨텍스트 길이**를 기준으로 2개 구간으로 나뉘어 과금되며, 기준점은 200K tokens(200Ki = 204,800)입니다. 해당 기준을 초과하면 입력 및 출력 요율이 2배로 증가합니다:

| 모델 | 구간 | 입력 | 출력 | 캐시 읽기 |
| - | - | - | - | - |
| `grok-4.7` | 0 – 200K | \$2.00 | \$6.00 | \$0.50 |
| `grok-4.7` | 200K – 500K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.6` | 0 – 200K | \$2.00 | \$6.00 | \$0.50 |
| `grok-4.6` | 200K – 512K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.5` | 0 – 200K | \$2.00 | \$6.00 | \$0.30 |
| `grok-4.5` | 200K – 512K | \$4.00 | \$12.00 | \$0.60 |
| `grok-4.3` / `grok-4.20` 시리즈 | 0 – 200K | \$1.25 | \$2.50 | \$0.20 |
| `grok-4.3` / `grok-4.20` 시리즈 | 200K – 1M | \$2.50 | \$5.00 | \$0.40 |
| `grok-build-0.1` | 0 – 200K | \$1.00 | \$2.00 | \$0.20 |
| `grok-build-0.1` | 200K – 256K | \$2.00 | \$4.00 | \$0.40 |

모든 수치는 1M tokens 기준입니다. `grok-4.7`와 `grok-4.6`는 4가지 과금 항목 모두 동일합니다. **`grok-4.6`과 `grok-4.5`의 유일한 가격 차이는 캐시 읽기 요율**(\$0.50 대 \$0.30)이며, 입력 및 출력 요금은 동일합니다.

`grok-4.7`와 `grok-4.6`의 두 구간 모두 입력, 출력, 캐시 읽기에 대해 항목별로 검증되었습니다(`grok-4.7`의 구간 분기점은 200,000 tokens입니다). 기타 모델의 2구간 캐시 읽기 요율은 xAI의 “2구간 2배” 규칙에서 유도된 것이므로, [모델 정보 페이지](/ko/api-capabilities/model-info)의 실시간 가격을 기준으로 삼으시기 바랍니다.

<Info>
  * 별칭인 `grok-code-fast` / `grok-code-fast-1` 역시 호출 가능하며(연결성 검증 완료), 해당 요금은 [모델 정보 페이지](/ko/api-capabilities/model-info)를 참조하시기 바랍니다.
  * 캐시된 입력 tokens는 위 표의 캐시 읽기 요율로 과금됩니다. Grok 접두사 캐싱은 **자동으로 적용되며 별도의 설정이 필요하지 않습니다**(두 엔드포인트 및 스트리밍과 비스트리밍 모두에서 검증 완료). 자세한 내용은 [Grok 캐시 과금 가이드](/ko/api-capabilities/grok/prompt-caching)를 참조하시기 바랍니다.
  * 장문 컨텍스트 작업 시 구간 분기점에 유의하시기 바랍니다. 단일 요청이 210K tokens인 경우 기준을 초과한 10K뿐만 아니라 요청 전체가 2구간 요율로 과금됩니다. 요청을 분할하면 이러한 요율 상승을 방지할 수 있습니다.
</Info>

## 그룹 및 할인

| 그룹 | 요율 배수 | 비고 |
| - | - | - |
| `default` | 1.0x | 기본 그룹이며, xAI 공식 릴레이 회선으로 xAI와 가격이 동일합니다 |
| `CodexResponses` | 1.0x | Codex 및 기타 Responses 클라이언트용이며, 기본 그룹과 모델 및 가격이 동일합니다 |

Grok 시리즈는 기본 그룹에서 xAI 공식 릴레이 회선을 사용하므로 더 이상 별도의 공식 릴레이 그룹이 없습니다. 이전 `GrokOfficial` 그룹은 더 이상 목록에 표시되지 않으며 동일하게 1x로 실행되므로, 이미 이를 사용 중인 Tokens는 변경할 필요가 없습니다.

비용을 더욱 절감하려면 충전 금액별로 차등 지급되는 [충전 보너스](/ko/faq/recharge-promotions)를 함께 활용할 수 있습니다.

## 검증된 기능 매트릭스

2026-07-13 (UTC+8) 기준 APIYI 게이트웨이를 대상으로 테스트되었습니다(✅ 정상 작동 검증됨; ◐ 아직 테스트되지 않음, 동일한 아키텍처에서 동일하게 동작할 것으로 예상됨; — 다루지 않음, 동일한 아키텍처에서 동일하게 동작할 것으로 예상됨):

| 기능 | grok-4.6 | grok-4.5 | grok-4.3 | 4.20-reasoning | 4.20-non-reasoning | grok-build-0.1 | multi-agent |
| - | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 기본 대화 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 스트리밍 (usage 포함) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 사고 과정(Chain-of-thought) `reasoning_content` | ◐ 기본 활성화 | ✅ 기본 활성화 | ✅ 기본 활성화 | ✅ | ❌ 설계상 비활성화 | ✅ 기본 활성화 | 내부 전용 |
| `reasoning_effort` 파라미터 | ◐ | ✅ | — | ❌ 명시적으로 거부됨 | — | — | — |
| 구조화된 출력(json\_schema) | ◐ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| 함수 호출(Function calling) / 도구 사용(Tool Use) | ◐ | ✅ | ✅ | — | — | ✅ | — |
| 비전 입력(이미지 이해) | ◐ | ✅ | ✅ | — | ✅ | — | — |
| 프롬프트 캐싱 (자동) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responses API + 서버 측 tools | ◐ | ✅ | — | — | — | — | — |

<Note>
  **`grok-4.6` 열에 여전히 ◐ 표시가 있는 이유**: 이 56개 요청 테스트는 4.6이 출시되기 전인 2026-07-13에 진행되었습니다. 2026-08-19에 당사는 `/v1/chat/completions` 및 `/v1/responses` 모두에서 스트리밍 및 비스트리밍 방식으로 과금을 항목별로 대조 확인하며 4.6에 대한 **기본 대화, 스트리밍(usage 포함) 및 프롬프트 캐싱**을 재테스트했습니다. 따라서 해당 행들은 이제 검증된 결과를 보여줍니다. 남아 있는 ◐ 표시는 동일한 아키텍처에 대한 기대치를 반영한 것입니다. 4.6은 4.5의 1.5T 파라미터 V9 기반, API 프로토콜 및 엔드포인트를 공유하며, xAI는 파라미터 수준의 호환성을 깨뜨리는 변경 사항을 발표하지 않았습니다. 프로덕션 환경에 적용하기 전에 실제 사용 사례에 맞춰 소규모 샘플 테스트를 실행해 보시기 바랍니다.

  `grok-4.7`(2026-09-21 출시)은 아직 이 매트릭스에 포함되지 않았습니다. 새로운 2.1T 기본 모델로 이전되었으므로 위의 동일 기반 추론은 적용되지 않습니다. 도입하기 전에 실제 사용 사례에 맞춰 소규모 샘플 테스트를 실행해 보시기 바랍니다.
</Note>

## 엔드포인트

| 엔드포인트 | 메서드 | 목적 |
| - | - | - |
| `/v1/chat/completions` | `POST` | 채팅 / 추론 / 함수 호출 / 구조화된 출력 / 비전 (모든 모델에서 공유되며 `model`로 선택합니다) |
| `/v1/responses` | `POST` | Responses API: 웹 검색, X 검색, 코드 실행, Remote MCP 및 기타 서버 측 도구 |

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
  **어떤 모델을 선택해야 하는가**: 기본적으로 `grok-4.3`(1M 컨텍스트, 균형 잡힌 가격)을 선택하십시오; 코딩 에이전트 및 복잡한 작업에는 `grok-4.7`(최신 플래그십으로, `grok-4.6`와 가격은 동일하지만 작업당 더 많은 출력 tokens를 사용하므로 실제 작업에서 비용을 먼저 비교해 보십시오)로 업그레이드하십시오; 빠르고 저렴한 답변에는 `grok-4.20-0309-non-reasoning`(사고 과정(chain-of-thought) 없음, 가장 저렴한 출력)을 사용하십시오; 빈번한 코드 완성에는 `grok-build-0.1`를 사용하고, 복잡한 연구 작업에만 멀티 에이전트 모델을 사용하십시오(과금 증폭에 유의하십시오). 비용을 더욱 절감하려면 충전 보너스를 함께 활용하십시오.
</Tip>

## 과금 안내: 추론 tokens

`grok-4.7` / `grok-4.6` / `grok-4.5` / `grok-4.3` / `grok-build-0.1`은(는) **기본적으로 내부에서 추론을 수행합니다**: 응답에 `reasoning_content`이 포함되며, 추론 tokens는 출력 과금에 포함됩니다. 테스트 시 짧은 답변에서 표시된 tokens는 30개에 불과했으나, 586개의 출력 tokens(이 중 556개는 추론)가 과금되었습니다. 비용에 민감한 짧은 질의응답의 경우 `grok-4.20-0309-non-reasoning`(으)로 전환하십시오. 자세한 내용은 [채팅 및 추론](/ko/api-capabilities/grok/chat)을 참고하십시오.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Grok에 자체 네이티브 API 형식이 있습니까?">
    별도의 독점 프로토콜은 없습니다. xAI의 공식 REST API는 OpenAI 호환입니다: `/v1/chat/completions`(채팅) 및 `/v1/responses`(Responses API 및 서버 측 tools). OpenAI SDK가 `https://api.apiyi.com/v1`를 가리키도록 설정하면 모든 기능을 완전하게 사용할 수 있으며, “호환 모드 다운그레이드”는 존재하지 않습니다.
  </Accordion>

  <Accordion title="웹 검색은 어떻게 활성화합니까?">
    Responses API를 사용하십시오: `tools: [{"type": "web_search"}]`(또는 `x_search`). Chat Completions의 기존 `search_parameters` 필드는 xAI에 의해 제거되었으므로(410 응답 확인됨) 사용하지 마십시오. [웹 및 X 검색](/ko/api-capabilities/grok/web-search)을 참고하십시오.
  </Accordion>

  <Accordion title="모델이 스스로를 Grok 4라고 소개합니다. 요청이 잘못된 모델로 전달된 것입니까?">
    이는 정상적인 현상입니다. 모든 Grok 4.x 모델은 단순히 "Grok 4"로 자신을 밝히며(멀티 에이전트 모델은 스스로를 Oppie라고 부름), 4.6 / 4.5 / 4.3과 같은 정확한 버전 번호를 보고하지 않습니다. 모델의 자체 소개가 아닌 요청 및 응답의 `model` 필드를 통해 모델을 확인하십시오.
  </Accordion>

  <Accordion title="캐싱에 별도의 설정이 필요합니까?">
    아닙니다. Grok 접두사 캐싱은 자동으로 이루어집니다. `usage.prompt_tokens_details.cached_tokens`를 통해 캐시 적중 여부를 확인하십시오(`/v1/responses`의 경우 `usage.input_tokens_details.cached_tokens` 확인). 캐시 적중은 128 tokens 단위로 내림 처리되며, 두 차례의 테스트 라운드 모두에서 동일하게 확인되었습니다: 8802 tokens 접두사는 8704 tokens로 적중되었고, 2735 tokens 접두사는 2688 tokens로 적중되었습니다. xAI는 캐시 항목이 제거될 수 있으며 캐시 적중이 보장되지 않는다고 명시하고 있으므로, **캐시되지 않은 가격 기준으로 예산을 책정하십시오**. 자세한 내용은 [Grok 캐시 과금 가이드](/ko/api-capabilities/grok/prompt-caching)를 참고하십시오.
  </Accordion>

  <Accordion title="컨텍스트 윈도우를 초과하면 어떻게 됩니까?">
    400 오류가 발생합니다. 제한 용량은 모델마다 다릅니다: grok-4.7, grok-4.6 및 grok-4.5는 500K이고, grok-4.3 및 4.20 시리즈는 1M이며, grok-build-0.1은 256K입니다. 길이가 더 긴 콘텐츠의 경우 요약하거나, 청크 단위로 나누거나, RAG 검색을 사용하십시오.
  </Accordion>

  <Accordion title="실패한 요청에도 과금됩니까?">
    4xx 클라이언트 오류(잘못된 파라미터 / 인증 실패)에는 과금되지 않으며, tokens를 성공적으로 반환한 요청에 대해서만 실제 사용량에 따라 과금됩니다. `deferred: true`는 별도의 안내 없이 무시되며, 요청은 실제로 동기식으로 실행되고 정상적으로 과금된다는 점에 유의하십시오.
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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.