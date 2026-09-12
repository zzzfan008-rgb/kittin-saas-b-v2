> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FAQ 개요

> APIYI 자주 묻는 질문의 완전한 색인입니다: 시작하기, 모델 호출, token 및 로그, 과금, 기업 서비스, 계정 로그인 — 주제별 또는 증상별로 찾아볼 수 있습니다.

모든 APIYI FAQ 문서는 여기에서 색인됩니다. APIYI가 처음이신가요? **시작하기**와 **자주 묻는 질문**부터 보십시오. 이미 연동했는데 특정 오류가 발생하나요? **증상별 문제 해결**로 바로 이동하십시오. 전체를 훑어보고 싶으신가요? 아래의 **주제별 찾아보기**를 참조하십시오.

## 🚀 3단계로 시작하기

<CardGroup cols={3}>
  <Card title="1단계: 회원가입" icon="mail" href="/ko/faq/email-registration">
    Gmail, Outlook, Foxmail 및 대학 이메일 주소를 지원하며, GitHub으로 로그인할 수도 있습니다
  </Card>

  <Card title="2단계: KEY 생성하기" icon="key" href="/ko/faq/token-management">
    콘솔에서 기본 token을 가져오거나, 전용 KEY를 생성하고 해당 그룹을 선택합니다
  </Card>

  <Card title="3단계: 기본 URL 설정하기" icon="link" href="/ko/faq/base-url-config">
    OpenAI 형식에는 `/v1`을, Claude에는 루트 도메인을, Gemini에는 `/v1beta`를 사용합니다
  </Card>
</CardGroup>

## 🔥 주요 질문

<CardGroup cols={2}>
  <Card title="KEY를 어떻게 생성합니까?" icon="key" href="/ko/faq/token-management">
    기본 token을 받아 새 KEY를 생성하는 단계별 방법
  </Card>

  <Card title="Base URL를 어떻게 설정합니까?" icon="link" href="/ko/faq/base-url-config">
    `/v1`, 루트 도메인 또는 `/v1beta` 중 무엇이 어떤 모델에 적용되는지
  </Card>

  <Card title="올바른 AI 모델을 어떻게 선택합니까?" icon="compass" href="/ko/faq/model-selection-guide">
    사용 사례, 비용, 속도에 따라 모델을 고르는 방법
  </Card>

  <Card title="내 API 키가 왜 유효하지 않습니까?" icon="triangle-alert" href="/ko/faq/invalid-api-key">
    열 번 중 아홉 번은 Base URL과 KEY가 일치하지 않습니다 — 먼저 이것을 확인하십시오
  </Card>

  <Card title="잔액이 있는데 왜 요청을 실행할 수 없습니까?" icon="credit-card" href="/ko/faq/balance-insufficient">
    선차감 메커니즘과 지나치게 큰 max\_tokens 값
  </Card>

  <Card title="모델 요율 배수는 무엇을 의미합니까?" icon="calculator" href="/ko/faq/model-multiplier">
    배수는 RMB 단위입니다 — 고정 요율을 적용하여 USD 환산값을 구하십시오
  </Card>

  <Card title="어떤 충전 프로모션이 있습니까?" icon="gift" href="/ko/faq/recharge-promotions">
    첫 충전 보너스, 단계별 보너스, 기업 정책
  </Card>

  <Card title="웹 앱과 API는 왜 다릅니까?" icon="layers" href="/ko/faq/webapp-vs-api-difference">
    같은 모델이 공식 사이트에서는 API를 통해 사용할 때보다 더 똑똑하게 느껴지는 이유
  </Card>
</CardGroup>

## 🔧 증상별 문제 해결

실제로 보이는 현상과 일치하는 행을 찾으십시오. 하나의 증상은 여러 주제를 아우르는 경우가 많으므로, 이 표는 관찰 가능한 동작 기준으로 문제 해결 문서를 다시 연결합니다.

| 보이는 현상                                    | 가능한 원인                                                    | 확인할 위치                                                                                                        |
| ----------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| API Key 무효 / 401                          | Base URL과 KEY가 일치하지 않거나, KEY를 잘못 입력함                      | [유효하지 않은 API Key](/ko/faq/invalid-api-key) · [Base URL 설정](/ko/faq/base-url-config)                           |
| 잔액이 남아 있는데 요청이 실패함                        | 사전 차감 메커니즘이 적용되었거나, max\_tokens가 너무 크게 설정됨                | [잔액 부족](/ko/faq/balance-insufficient) · [사전 차감](/ko/faq/pre-deduction-quota)                                  |
| 요청이 타임아웃되거나 스트리밍 중간에 끊어짐                  | 클라이언트 타임아웃이 너무 짧음; reasoning 모델은 느립니다                     | [API 타임아웃 피하기](/ko/faq/timeout-configuration)                                                                 |
| 로그에는 성공과 과금이 표시되지만, 클라이언트에는 아무것도 도달하지 않음  | 게이트웨이가 끝나면 로그 지속 시간이 종료됩니다. 차이는 downstream이거나 종료 신호에 있습니다 | [로그는 끝났지만 응답이 없음](/ko/faq/log-duration-vs-client-wait)                                                        |
| 웹사이트 / API가 502를 반환함                      | 서비스 컨테이너가 잠시 자동 재시작 중이며, 약 1분 안에 복구됩니다                    | [502에 대한 대응](/ko/faq/website-502-error)                                                                       |
| 429 concurrency 오류                        | concurrency 쿼터에 도달함                                       | [API concurrency 제한](/ko/faq/api-concurrency)                                                                 |
| 출력이 문장 중간에서 잘림                            | max\_tokens가 설정되지 않았거나 너무 작음                              | [max\_tokens란 무엇인가](/ko/faq/max-tokens)                                                                       |
| 특정 모델이 실행되지 않음                            | 계정 권한이 잠겨 있거나, token 모델 화이트리스트에 없음                        | [일부 모델을 사용할 수 없는 이유](/ko/faq/model-availability) · [token 모델 화이트리스트](/ko/faq/token-model-whitelist)           |
| 이미지 생성이 실패함 / 빈 값이 반환됨                    | Google 콘텐츠 안전 필터가 작동함                                     | [Nano Banana 실패](/ko/faq/nano-banana-image-failure)                                                           |
| 출력이 기준 이미지와 크게 다름                         | 기준 이미지는 base64로 업로드해야 합니다                                 | [이미지가 기준과 다름](/ko/faq/image-result-differs-from-reference)                                                    |
| 흰 배경 이미지에 검은 점이 보임                        | AI Studio 경로에서 알려진 동작입니다                                  | [흰 배경 아티팩트](/ko/faq/white-background-image-artifacts)                                                         |
| task ID로 이미지 결과를 폴링하고 싶음                  | 이미지 생성은 동기 방식만 지원합니다                                      | [비동기 이미지 API가 있나요](/ko/faq/image-async-api)                                                                   |
| 모델이 다른 벤더라고 주장함 / 버전을 말하지 못함              | 모델의 자기 인식은 신뢰할 수 없습니다                                     | [Claude가 Qwen이라고 주장함](/ko/faq/claude-identity-confusion) · [모델은 자신의 버전을 모릅니다](/ko/faq/model-version-identity) |
| 웹 앱은 똑똑한데 API는 단순함                        | 웹 앱은 system prompts와 도구를 함께 제공하지만, API는 순수한 모델입니다         | [웹 앱 vs API](/ko/faq/webapp-vs-api-difference)                                                                |
| KEY에서 낯선 호출이 보임                           | KEY가 유출되었을 수 있습니다 — 추적하고 비활성화하십시오                         | [예상치 못한 KEY 사용 조사](/ko/faq/troubleshoot-key-usage) · [키를 안전하게 관리하기](/ko/faq/key-security-management)          |
| 과금이 맞지 않음                                 | 사용량별 과금과 호출별 과금의 해석이 다릅니다                                 | [로그에서 과금 읽기](/ko/faq/log-billing-explained) · [모델 요율 배수](/ko/faq/model-multiplier)                            |
| 이미지 또는 동영상 다운로드가 느림                       | 특정 서버에서 해외 CDN 라우팅이 적용됨                                   | [CDN 다운로드가 느림](/ko/faq/cdn-download-slow)                                                                     |
| 프록시가 필요한가요?                               | 직접 연결이 작동하며, 프록시는 필요하지 않습니다                               | [프록시가 필요한가요](/ko/faq/network-proxy)                                                                           |
| GitHub 로그인에서 'Account already bound'가 표시됨 | 해당 GitHub 계정이 다른 이메일에 연결되어 있습니다                           | [GitHub 바인딩 오류](/ko/faq/github-bindng-bindng-error)                                                           |
| 비밀번호를 잊음                                  | 이메일로 재설정하거나 지원팀에 도움을 요청하십시오                               | [비밀번호를 잊었습니까](/ko/faq/forgot-password)                                                                        |

***

## 📚 주제별 탐색

### 🧭 사이트 기능 (3)

| Question                                                           | 한 줄 설명                            |
| ------------------------------------------------------------------ | --------------------------------- |
| [Tokens 및 그룹](/ko/faq/token-and-groups)                            | KEY를 생성하고 그룹을 선택하는 방법             |
| [그룹이란 무엇입니까? User Group과 Token Group 설명](/ko/faq/groups-explained) | token에 선택된 그룹이 실제로 적용됩니다          |
| [APIYI는 왜 원클릭 통합을 제공하지 않습니까?](/ko/faq/one-click-integration)       | 통합은 모델마다 다르므로 대신 AI 어시스턴트를 사용하십시오 |

### ⚙️ 모델 및 API (18)

| 질문                                                                                                       | 한 줄 설명                                                         |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [Google 모델은 AI Studio에서 실행됩니까, 아니면 Vertex에서 실행됩니까?](/ko/faq/google-upstream-aistudio-vertex)             | 기본 그룹은 공식 AI Studio 경로를 사용합니다                                  |
| [흰색 배경 이미지에 검은 점, 더러운 얼룩, 또는 흐릿한 색상 블록이 보이는 이유는 무엇입니까?](/ko/faq/white-background-image-artifacts)        | 순수한 흰색 대신 밝은 배경을 prompt로 지정합니다                                 |
| [투명 배경 PNG 컷아웃 이미지는 어떻게 생성합니까?](/ko/faq/image-transparent-background)                                    | 실제 알파 채널을 위해 `background: "transparent"`를 `gpt-image-2`에 전달합니다 |
| [올바른 AI 모델은 어떻게 선택합니까?](/ko/faq/model-selection-guide)                                                   | 사용 사례, 비용, 속도에 따라 선택합니다                                        |
| [텍스트와 생성된 이미지를 모두 출력하는 대화형 API가 있습니까?](/ko/faq/text-and-image-in-one-api)                                | 이미지를 읽는 것과 이미지를 만드는 것은 다릅니다. 이미지를 얻는 네 가지 경로가 있습니다             |
| [일부 모델을 사용할 수 없는 이유는 무엇입니까?](/ko/faq/model-availability)                                                 | 일부 모델은 먼저 권한을 해제해야 합니다                                         |
| [공식 웹 앱과 API의 결과가 다른 이유는 무엇입니까?](/ko/faq/webapp-vs-api-difference)                                       | 웹 앱은 system prompts를 추가하며, API는 순수한 모델입니다                      |
| [AI 모델은 왜 자기 버전을 알지 못합니까?](/ko/faq/model-version-identity)                                               | 모델의 자기 인식은 신뢰할 수 없습니다                                          |
| [Claude가 왜 자신을 Qwen이나 DeepSeek이라고 주장합니까?](/ko/faq/claude-identity-confusion)                             | 모델이 바뀐 것이 아니라 정체성 환각입니다                                        |
| [모델 이름의 -c 접미사는 무엇을 의미합니까?](/ko/faq/model-name-suffix-c)                                                 | 과금이 다른 다른 경로를 표시합니다                                            |
| [Base URL은 어떻게 구성합니까? /v1, 루트 도메인, /v1beta의 차이는 무엇입니까?](/ko/faq/base-url-config)                         | OpenAI, Claude, Gemini마다 각각 한 가지 형식입니다                         |
| [API 타임아웃을 어떻게 피합니까?](/ko/faq/timeout-configuration)                                                     | 클라이언트 timeout을 늘리십시오. reasoning 모델은 느립니다                       |
| [로그에는 호출이 완료되고 과금되었다고 나오는데, 클라이언트는 응답을 전혀 받지 못했습니다. 어떻게 문제를 해결합니까?](/ko/faq/log-duration-vs-client-wait) | 두 시계는 서로 다른 구간을 측정합니다. 먼저 간격을 측정하십시오                           |
| [API 동시 실행 수 제한은 무엇입니까?](/ko/faq/api-concurrency)                                                        | 제한은 모델 유형에 따라 다르며 상향할 수 있습니다                                   |
| [max\_tokens는 무엇입니까? 설정하지 않으면 어떻게 됩니까?](/ko/faq/max-tokens)                                              | 출력 길이를 제한합니다. 설정하지 않으면 기본값이 있습니다                               |
| [Nano Banana 이미지 생성 실패의 일반적인 원인은 무엇입니까?](/ko/faq/nano-banana-image-failure)                              | 대개 Google 콘텐츠 안전 기능이 발동하기 때문입니다                                |
| [생성된 이미지가 참조 이미지와 크게 다른 이유는 무엇입니까?](/ko/faq/image-result-differs-from-reference)                         | 참조 이미지는 base64로 인코딩해야 합니다                                      |
| [비동기 이미지 API가 있습니까? 작업 ID로 결과를 조회할 수 있습니까?](/ko/faq/image-async-api)                                     | 동기식만 지원합니다. 작업 ID 조회는 없습니다                                     |

### 🔑 token과 로그 (9)

| 질문                                                              | 한 줄 답변                                  |
| --------------------------------------------------------------- | --------------------------------------- |
| [KEY는 어떻게 생성합니까?](/ko/faq/token-management)                     | 기본 token을 받거나 콘솔에서 새로 생성합니다             |
| [token에 사용 가능한 모델을 설정해야 합니까?](/ko/faq/token-model-whitelist)    | 선택 사항이지만, 프로젝트를 분리할 때는 권장합니다            |
| [API 키를 안전하게 관리하려면 어떻게 합니까?](/ko/faq/key-security-management)   | IP 허용 목록, 모델 허용 목록, 그리고 일상적인 관리 습관입니다   |
| [token 과금 방식의 차이는 무엇입니까?](/ko/faq/token-billing-modes)          | 다섯 가지 과금 방식과 각각이 적합한 경우입니다              |
| [호출 기록은 어떻게 확인합니까?](/ko/faq/call-logs)                          | 콘솔 로그 페이지에서 호출 및 과금 상세를 확인합니다           |
| [로그의 과금 금액은 어떻게 해석합니까?](/ko/faq/log-billing-explained)          | 사용량 기준과 호출 기준, 그리고 사용량으로 비용을 계산하는 방법입니다 |
| [호출 로그는 얼마나 보관되며, 언제 삭제됩니까?](/ko/faq/log-retention-policy)      | 현재 월과 이전 2개월분을 보관하며, 5일에 삭제됩니다          |
| [문제 해결을 위해 백엔드에서 상세 로그를 볼 수 있습니까?](/ko/faq/user-logs-control)   | 관리자는 일시적으로 상세 로깅을 활성화할 수 있습니다           |
| [예상치 못한 API Key 사용은 어떻게 조사합니까?](/ko/faq/troubleshoot-key-usage) | 로그에서 실제 IP를 추적하고 KEY를 비활성화합니다           |

### 🏢 엔터프라이즈 서비스 (7)

| 질문                                                                            | 한 줄 요약                              |
| ----------------------------------------------------------------------------- | ----------------------------------- |
| [엔터프라이즈 그룹이란 무엇이며, 언제 사용해야 합니까?](/ko/faq/enterprise-group-vertex-fallback)    | 모델별 그룹으로, 공급이 더 안정적이고 요율 배수가 더 높습니다 |
| [APIYI의 엔터프라이즈 서비스는 신뢰할 수 있습니까? 모델은 진짜입니까?](/ko/faq/enterprise-trust)         | 투명한 공식 릴레이이며, 재라우팅이나 모델 교체가 없습니다    |
| [엔터프라이즈 사용자와 개인 사용자의 차이는 무엇입니까?](/ko/faq/enterprise-vs-individual)            | 계정 유형은 동일하며, 차이는 지원과 과금에 있습니다       |
| [엔터프라이즈 고객은 어떻게 충전합니까?](/ko/faq/enterprise-recharge)                          | 은행 송금이 우선이며, VAT 세금계산서를 제공합니다       |
| [대학 고객은 어떻게 부담 없이 정산할 수 있습니까?](/ko/faq/university-reimbursement)              | 인보이스, 구매 목록, 날인된 서류를 제공합니다          |
| [APIYI는 SLA 보장을 제공합니까?](/ko/faq/sla-guarantee)                                | 예, 과금 이상 보상과 크레딧 추가 충전을 포함합니다       |
| [Agent 미니프로그램은 알고리즘 신고가 필요합니까?](/ko/faq/agent-miniapp-algorithm-filing)       | 보통 그렇습니다; 이 항목은 일반적인 절차를 다룹니다       |
| [해외 모델을 사용하는 중국 대상 제품의 컴플라이언스는 어떻게 처리합니까?](/ko/faq/overseas-model-compliance) | 라이선스 계층, 모델 신고 상태, 콘텐츠 모더레이션입니다     |

### 💰 과금 및 보안 (14)

| 질문                                                                       | 한 줄 요약                                        |
| ------------------------------------------------------------------------ | --------------------------------------------- |
| [공식 요율과 가격이 같은데 — 왜 APIYI에서 구매합니까?](/ko/faq/official-pricing-advantages) | 같은 가격에 충전 보너스가 더해지며, 그룹 할인과 중복 적용됩니다          |
| [APIYI가 어떻게 공식 요율보다 더 낮은 가격을 제공합니까?](/ko/faq/why-cheaper-than-official)  | 대량 구매와 벤더 분배 때문이며, 모델 품질 저하 때문이 아닙니다          |
| [모델 '배수'는 무엇을 의미합니까?](/ko/faq/model-multiplier)                          | RMB 단위입니다. USD 환산에는 고정 요율을 적용합니다              |
| [100 RMB로 어느 정도의 컴퓨팅 파워를 얻을 수 있습니까?](/ko/faq/rmb-to-computing-power)     | 환산 비율은 귀하의 시스템이 결정합니다                         |
| [APIYI는 캐시 과금을 지원합니까?](/ko/faq/cache-billing)                            | 주요 경로는 모두 지원하며, 캐시 적중률은 벤더에 따라 다릅니다           |
| [API 호출의 사전 차감 메커니즘은 무엇입니까?](/ko/faq/pre-deduction-quota)                | 예상 금액을 먼저 차감하고, 실제 사용량으로 정산합니다                |
| [잔액이 남아 있는데 왜 요청을 실행할 수 없습니까?](/ko/faq/balance-insufficient)             | 사전 차감 검사에 걸렸거나 max\_tokens가 너무 높게 설정되었기 때문입니다 |
| [잔액 알림은 어떻게 설정합니까?](/ko/faq/balance-alerts)                              | 이메일, 그룹 봇 또는 잔액 알림 API를 사용합니다                 |
| [APIYI는 어떤 결제 수단을 지원합니까?](/ko/faq/payment-methods)                       | WeChat, Alipay, USDT, Stripe, PayPal 등입니다     |
| [어떤 충전 프로모션이 제공됩니까?](/ko/faq/recharge-promotions)                        | 첫 충전 및 단계별 보너스와 함께 인보이스 발행이 가능합니다             |
| [대리점 파트너십은 어떻게 신청합니까? 친구 초대로 리베이트를 받을 수 있습니까?](/ko/faq/referral-program) | 추천 리베이트는 기본으로 활성화되어 있으며, 별도 신청이 필요 없습니다       |
| [APIYI의 환불 정책은 무엇입니까?](/ko/faq/refund-policy)                            | 조건, 절차, 수수료, 인보이스 관련 참고 사항입니다                 |
| [콘텐츠 안전과 규정 준수는 어떻게 보장됩니까?](/ko/faq/content-safety)                      | 모더레이션 메커니즘과 위반 처리로 관리합니다                      |
| [APIYI는 어떻게 데이터 보안을 보장합니까?](/ko/faq/data-security)                       | 암호화된 전송, 최소 저장, 접근 제어                         |

### 🌐 네트워크 및 연결 (4)

| Question                                                           | 한 줄 요약                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| [API를 사용하려면 프록시가 필요합니까?](/ko/faq/network-proxy)                    | 직접 연결이 가능하며, 프록시나 VPN은 필요하지 않습니다                         |
| [APIYI의 서버는 어디에 있습니까? 어떤 서버를 선택해야 합니까?](/ko/faq/server-location)   | 노드 위치, 지연 시간 테스트, 구매 안내                                  |
| [CDN 이미지/동영상 다운로드가 느립니다 — 어떻게 해야 합니까?](/ko/faq/cdn-download-slow)  | 특정 서버에서 해외 CDN 라우팅을 진단합니다                                |
| [웹사이트 또는 API가 502를 반환합니다 — 어떻게 해야 합니까?](/ko/faq/website-502-error) | 컨테이너가 잠시 자동 재시작되며, 약 1분 내 복구되고 과금되지 않으며, 30초 후 다시 시도하십시오 |

### 👤 계정 및 로그인 (6)

| 질문                                                                      | 한 줄 설명                              |
| ----------------------------------------------------------------------- | ----------------------------------- |
| [APIYI는 등록에 어떤 이메일 제공업체를 지원합니까?](/ko/faq/email-registration)            | Gmail, Outlook, Foxmail 및 대학 이메일 주소 |
| [Passkey로 어떻게 로그인합니까?](/ko/faq/passkey-login)                           | 한 번 연결한 뒤 지문 또는 얼굴 잠금 해제로 사용합니다     |
| [GitHub 로그인에서 '계정이 이미 연결됨'이 표시됩니다?](/ko/faq/github-bindng-bindng-error) | 해당 GitHub 계정이 다른 이메일에 연결되어 있습니다     |
| [비밀번호를 잊어버리면 어떻게 합니까?](/ko/faq/forgot-password)                         | 이메일로 재설정하거나 지원팀에 도움을 요청합니다          |
| [API Key가 유효하지 않은 이유는 무엇입니까?](/ko/faq/invalid-api-key)                  | Base URL과 KEY가 일치하지 않는 것이 보통 원인입니다  |
| [내 계정을 어떻게 삭제합니까?](/ko/faq/account-deletion)                            | 원클릭 삭제가 가능하며, 데이터는 복구할 수 없습니다       |

***

## 💬 아직도 막히셨습니까?

<CardGroup cols={2}>
  <Card title="사용 사례" icon="layout-grid" href="/ko/scenarios">
    Cherry Studio, Claude Code, Cursor 등과의 통합 가이드
  </Card>

  <Card title="모델 가격" icon="circle-dollar-sign" href="/en/models">
    모든 모델의 실시간 가격 표와 상세 페이지
  </Card>

  <Card title="실시간 업데이트" icon="radio-tower" href="/en/live/index">
    모델 상태, 공급 변경 사항, 장애에 대한 일일 업데이트
  </Card>

  <Card title="공지" icon="megaphone" href="/en/changelog">
    새 모델 출시, 가격 변경, 기능 업데이트
  </Card>
</CardGroup>

여전히 해결되지 않습니까? 직접 문의해 주십시오:

* 📧 **이메일**: [support@apiyi.com](mailto:support@apiyi.com)
* 🌐 **콘솔**: [api.apiyi.com](https://api.apiyi.com)
* 💰 **가격**: [가격 페이지](https://api.apiyi.com/account/pricing)

<Note>
  질문이 다뤄지지 않았다면 support로 보내 주십시오 — 저희가 제안을 검토하고 FAQ에 추가합니다. 새 사용자는 무료 체험 크레딧을 받으므로 충전하기 전에 통합을 검증할 수 있습니다.
</Note>
