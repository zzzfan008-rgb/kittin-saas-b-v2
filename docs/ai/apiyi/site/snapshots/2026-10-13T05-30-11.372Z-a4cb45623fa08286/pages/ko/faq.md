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

실제로 발생하고 있는 현상과 일치하는 행을 찾아보십시오. 단일 증상이 여러 주제에 걸쳐 있을 수 있으므로, 이 표는 관찰 가능한 동작을 기준으로 문제 해결 문서를 다시 분류하여 정리한 것입니다.

| 발생 현상 | 추정 원인 | 관련 문서 |
| - | - | - |
| API Key 유효하지 않음 / 401 | Base URL과 KEY가 일치하지 않거나, KEY를 잘못 입력함 | [유효하지 않은 API Key](/ko/faq/invalid-api-key) · [Base URL 설정](/ko/faq/base-url-config) |
| 잔액, 로그 또는 token 관리 API에서 401 `ACCESS_TOKEN_LEGACY_RETIRED` 또는 403 `ACCESS_TOKEN_SCOPE_DENIED` 반환 | 레거시 시스템 token 지원이 중단되었거나, 개인 액세스 token에 필요한 권한이 없음 | [개인 액세스 token](/ko/faq/personal-access-token) |
| 오류 메시지가 불명확하여 어디서부터 시작해야 할지 모름 | 오류 유형별로 순서대로 확인 | [모델 API 오류 문제 해결](/ko/faq/model-error-troubleshooting) |
| 잔액이 남아 있지만 요청 실패 | 사전 차감 메커니즘이 동작 중이거나 max\_tokens가 너무 높게 설정됨 | [잔액 부족](/ko/faq/balance-insufficient) · [사전 차감](/ko/faq/pre-deduction-quota) |
| 요청 시간 초과 또는 스트리밍 도중 연결 끊김 | 클라이언트 타임아웃이 너무 짧거나 추론 모델의 응답 속도가 느림 | [API 타임아웃 방지](/ko/faq/timeout-configuration) |
| 로그에는 성공 및 과금으로 표시되지만 클라이언트에 도달한 내용이 없음 | 로그 소요 시간은 게이트웨이가 완료될 때 종료되며, 차이는 다운스트림 또는 종료 신호에서 발생함 | [로그는 완료되었으나 응답이 없는 경우](/ko/faq/log-duration-vs-client-wait) |
| 웹사이트 / API에서 502 반환 | 서비스 컨테이너가 일시적으로 자동 재시작 중이며, 약 1분 내에 복구됨 | [502 발생 시 대처 방법](/ko/faq/website-502-error) |
| 스크립트에서 빈 본문의 502가 간헐적으로 발생하고 로그에 아무것도 기록되지 않음 | 로컬 프록시 소프트웨어(Clash / v2rayN)에서 생성된 빈 502 | [프록시에서 생성된 빈 502](/ko/faq/proxy-empty-502) |
| VPN 환경에서 이미지 호출이 90\~180초 후 일괄적으로 끊기지만 과금은 계속됨 | 로컬 프록시가 너무 오랜 시간 데이터가 전송되지 않는 연결을 종료함 | [프록시 유휴 연결 끊김](/ko/faq/proxy-idle-timeout-disconnect) |
| Python에서 SSLEOFError가 발생하지만 curl은 정상 작동함 | OpenSSL 3.5+의 포스트 퀀텀 핸드셰이크가 중간 장비에 의해 차단됨 | [SSLEOFError 문제 해결](/ko/faq/openssl-pq-handshake-eof) |
| 429 동시 실행 오류 | 동시 실행 수 쿼터 도달 | [API 동시 실행 수 제한](/ko/faq/api-concurrency) |
| 문장 중간에서 출력이 잘림 | max\_tokens가 설정되지 않았거나 너무 작음 | [max\_tokens란 무엇인가](/ko/faq/max-tokens) |
| 200을 반환하지만 내용이 거절 메시지이며 JSON 파싱에 실패함 | GPT 모델은 오류나 카테고리 표시 없이 정책 위반 콘텐츠를 거절함 | [OpenAI 거절 응답 형태](/ko/faq/openai-content-safety-refusal) |
| Claude가 빈 콘텐츠와 함께 200을 반환하고 `content[0]` 오류가 발생함 | 요청이 제공자의 안전 정책에 걸렸으며, `stop_reason`의 값이 `refusal`임 | [Claude 거절 시 빈 콘텐츠가 반환되는 이유](/ko/faq/claude-content-safety-refusal) |
| Claude Code / Claude Agent에서 429 `Invalid signature in thinking block` 오류를 보고하고 10회 재시도가 모두 실패함 | 요청 제한 문제가 아님: 대화 기록의 thinking 블록에서 서명이 유실됨 | [Claude 유효하지 않은 thinking 서명](/ko/faq/claude-thinking-signature-invalid) |
| 특정 모델이 실행되지 않음 | 계정 권한이 잠겨 있거나 token 모델 허용 목록에 없음 | [특정 모델을 사용할 수 없는 이유](/ko/faq/model-availability) · [token 모델 허용 목록](/ko/faq/token-model-whitelist) |
| 이미지 생성 실패 / 빈 응답 반환 | Google 콘텐츠 안전 정책 트리거됨 | [Nano Banana 실패 문제](/ko/faq/nano-banana-image-failure) |
| Gemini 이미지 API에서 NO\_IMAGE 반환 | 안전 차단과는 다른 원인임 | [NO\_IMAGE가 발생하는 이유](/ko/faq/gemini-no-image) |
| Gemini 이미지가 후보 없이 몇 초 만에 blockReason: OTHER를 반환함 | 생성 전 입력 단계에서 차단됨(주로 참조 이미지 하나로 인해 발생) | [blockReason: OTHER 문제 해결](/ko/faq/gemini-image-input-blocked) |
| Gemini 이미지가 간헐적으로 IMAGE\_OTHER를 반환함 | 이미지가 생성되었으나 출력 필터링에 걸림(주로 prompt에 실존 인물 이름이 포함된 경우) | [IMAGE\_OTHER 문제 해결](/ko/faq/gemini-image-other) |
| 출력이 참조 이미지와 크게 다름 | 참조 이미지는 base64 형식으로 업로드해야 함 | [이미지가 참조와 다른 경우](/ko/faq/image-result-differs-from-reference) |
| does not match MIME type 오류와 함께 업로드 실패 | 이미지 URL에 CDN 처리 매개변수가 포함되어 있음 | [MIME type 불일치](/ko/faq/image-mime-type-mismatch-with-query) |
| 흰색 배경 이미지에 검은 반점이 나타남 | AI Studio 경로에서 발생하는 알려진 현상임 | [흰색 배경 결함 현상](/ko/faq/white-background-image-artifacts) |
| 작업 ID로 이미지 결과를 폴링하려는 경우 | 이미지 생성은 동기 방식으로만 제공됨 | [비동기 이미지 API 지원 여부](/ko/faq/image-async-api) |
| 이미지 과금 금액이 예상보다 훨씬 높음 | 해상도, 화질, 종횡비 및 수량이 출력 tokens를 비례하여 증가시킴 | [GPT Image 출력 tokens가 높은 이유](/ko/faq/gpt-image-output-token-calculation) |
| Seedance에서 얼굴 참조 이미지를 차단함 | 실제 얼굴은 에셋 업로드 및 신원 인증이 필요함 | [얼굴 에셋이 차단되는 이유](/ko/faq/seedance2-face-asset-whitelist) |
| Seedance 이미지 링크가 브라우저에서는 열리지만 invalid image format 오류로 제출 실패 | 링크가 Range 요청을 거부하거나 다운로드 속도를 제한하거나 너무 빨리 만료되어 제공업체에서 가져올 수 없음 | [이미지 링크는 열리지만 실패하는 경우](/ko/faq/seedance-image-url-invalid-format) |
| 비율과 지속 시간을 설정했음에도 Seedance 2.5에서 400 `TaskTypeConstraint` 반환 | 작업이 동영상 편집으로 인식됨; `ratio`은(는) `adaptive`이어야 하고 `duration`은(는) `-1`이어야 함 | [참조 기반 동영상 생성 vs. 동영상 편집](/ko/faq/seedance2-reference-vs-edit) |
| 첫 프레임 모드가 아님에도 Seedance에서 `first/last frame content cannot be mixed with reference media content` 반환 | 이미지에 `role`이(가) 없어 첫 프레임으로 처리됨; 네이티브 엔드포인트를 사용하고 `reference_image`을(를) 명시적으로 설정하십시오 | [첫 프레임과 참조 혼동 문제](/ko/faq/seedance-first-frame-mixed-with-reference) |
| 모델이 다른 공급업체라고 주장함 / 자신의 버전을 밝히지 못함 | 모델의 자기 인식 정보는 신뢰할 수 없음 | [Claude가 Qwen이라고 주장하는 현상](/ko/faq/claude-identity-confusion) · [모델이 버전을 알지 못하는 현상](/ko/faq/model-version-identity) |
| 웹 앱은 스마트하지만 API는 덜 지능적으로 느껴짐 | 웹 앱에는 시스템 prompt 및 도구가 포함되어 있으며, API는 순수 모델 자체임 | [웹 앱 vs API](/ko/faq/webapp-vs-api-difference) |
| KEY에서 알 수 없는 호출 발생 | KEY가 유출되었을 수 있음 — 호출을 추적하고 비활성화하십시오 | [예상치 못한 KEY 사용량 조사](/ko/faq/troubleshoot-key-usage) · [KEY 보안 관리](/ko/faq/key-security-management) |
| 과금 내역이 맞지 않음 | 사용량 기반 과금과 호출당 과금 방식의 확인 방법이 다름 | [로그의 과금 내역 확인](/ko/faq/log-billing-explained) · [모델 요율 배수](/ko/faq/model-multiplier) |
| 이미지 또는 동영상 다운로드 속도가 느리거나 Read timed out 발생 | 생성은 성공함; 자체 점검 후 결과를 문의처로 전달하십시오 | [CDN 다운로드 지연 또는 타임아웃](/ko/faq/cdn-download-slow) |
| 프록시가 필요한가요? | 직접 연결이 가능하므로 프록시가 필요하지 않습니다 | [프록시 필요 여부](/ko/faq/network-proxy) |
| GitHub 로그인 시 'Account already bound'라고 표시됨 | 해당 GitHub 계정이 다른 이메일에 이미 연동되어 있음 | [GitHub 연동 오류](/ko/faq/github-bindng-bindng-error) |
| 비밀번호를 잊어버린 경우 | 이메일로 재설정하거나 고객 지원팀에 문의하십시오 | [비밀번호 찾기](/ko/faq/forgot-password) |

***

## 📚 주제별 탐색

### 🧭 사이트 기능 (4)

| 질문 | 한 줄 답변 |
| - | - |
| [토큰 및 그룹](/ko/faq/token-and-groups) | KEY를 생성하고 그룹을 선택하는 방법 |
| [그룹이란 무엇입니까? 사용자 그룹과 토큰 그룹 설명](/ko/faq/groups-explained) | 실제로 적용되는 것은 토큰에서 선택한 그룹입니다 |
| [Codex, ClaudeCode 및 기본 그룹은 어떻게 다릅니까?](/ko/faq/codex-claudecode-default-groups) | 출처와 프로토콜이 다르며, 프로덕션에서는 기본 공식 릴레이를 사용하는 것이 좋습니다 |
| [APIYI는 원클릭 통합을 제공하지 않는 이유는 무엇입니까?](/ko/faq/one-click-integration) | 모델마다 통합 방식이 다르므로 AI 어시스턴트를 사용하십시오 |

### 🔑 Tokens 및 로그 (12)

| 질문 | 한 줄 답변 |
| - | - |
| [KEY를 생성하는 방법은 무엇인가요?](/ko/faq/token-management) | 콘솔에서 기본 token을 확인하거나 새 token을 생성합니다 |
| [Tokens에 사용 가능한 모델을 설정해야 하나요?](/ko/faq/token-model-whitelist) | 선택 사항이지만 프로젝트 격리 시 권장합니다 |
| [API Key를 안전하게 관리하는 방법은 무엇인가요?](/ko/faq/key-security-management) | IP 화이트리스트, 모델 화이트리스트 및 일상적인 보안 습관을 활용합니다 |
| [Personal Access Token이란 무엇이며 시스템 token은 어떻게 교체하나요?](/ko/faq/personal-access-token) | 관리 API용 신규 자격 증명이며 시스템 token은 11-11에 폐기됩니다 |
| [Token 과금 모드 간의 차이점은 무엇인가요?](/ko/faq/token-billing-modes) | 5가지 과금 모드와 각각에 적합한 사용 시나리오를 안내합니다 |
| [호출 기록은 어떻게 확인하나요?](/ko/faq/call-logs) | 콘솔 로그 페이지에서 호출 및 과금 상세 내역을 확인합니다 |
| [Request ID는 어디에서 확인할 수 있나요?](/ko/faq/request-id-troubleshooting) | API 유형별 응답 헤더 또는 본문에서 확인하며, 작업 ID와 혼동하지 않도록 주의합니다 |
| [로그의 과금 금액은 어떻게 확인하나요?](/ko/faq/log-billing-explained) | 사용량별 과금과 호출 건당 과금의 차이 및 사용량 기반 비용 계산 방식을 안내합니다 |
| [호출 로그는 얼마 동안 보관되며 언제 정리되나요?](/ko/faq/log-retention-policy) | 당월 및 직전 2개월 동안 보관되며 매월 5일에 정리됩니다 |
| [로그 시간대 설정과 데이터 내보내기 시 유의할 점은 무엇인가요?](/ko/faq/log-timezone-and-export) | 계정 시간대를 UTC+0으로 유지해야 하며, 내보내기는 항상 UTC+0 기준입니다 |
| [문제 해결을 위해 백엔드에서 상세 로그를 확인할 수 있나요?](/ko/faq/user-logs-control) | 관리자는 상세 로깅을 일시적으로 활성화할 수 있습니다 |
| [비정상적인 API Key 사용량은 어떻게 조사하나요?](/ko/faq/troubleshoot-key-usage) | 로그에서 실제 IP를 추적하고 KEY를 비활성화합니다 |

### 🏢 엔터프라이즈 서비스 (9)

| 질문 | 한 줄 답변 |
| - | - |
| [엔터프라이즈 그룹이란 무엇입니까? 언제 사용해야 합니까?](/ko/faq/enterprise-group-vertex-fallback) | 모델별 그룹으로, 더욱 안정적인 공급과 더 높은 요율 배수를 제공합니다 |
| [이미지 생성을 위한 더 빠른 또는 엔터프라이즈 경로가 있습니까?](/ko/faq/image-generation-fast-enterprise-route) | 빠른 전용 경로는 없습니다. 소요 시간은 모델 추론 자체에 사용됩니다 |
| [APIYI의 엔터프라이즈 서비스는 신뢰할 수 있습니까? 모델은 정품입니까?](/ko/faq/enterprise-trust) | 투명한 공식 릴레이로, 재라우팅이나 모델 교체가 없습니다 |
| [엔터프라이즈 사용자와 개인 사용자의 차이점은 무엇입니까?](/ko/faq/enterprise-vs-individual) | 계정 유형은 동일하며, 차이는 지원과 과금에 있습니다 |
| [엔터프라이즈 고객은 어떻게 충전합니까?](/ko/faq/enterprise-recharge) | 은행 송금을 우선 지원하며, 기본 계약과 부가가치세 세금계산서를 제공합니다 |
| [대학 고객은 어떻게 안심하고 비용을 상환받을 수 있습니까?](/ko/faq/university-reimbursement) | 청구서, 구매 목록 및 날인 문서를 제공합니다 |
| [APIYI는 SLA 보장을 제공합니까?](/ko/faq/sla-guarantee) | 예. 과금 이상 보상과 크레딧 재충전을 포함합니다 |
| [에이전트 미니 프로그램에 알고리즘 등록이 필요합니까?](/ko/faq/agent-miniapp-algorithm-filing) | 일반적으로 필요하며, 여기에서 일반적인 절차를 설명합니다 |
| [해외 모델을 사용하는 중국 대상 제품의 규정 준수는 어떻게 처리합니까?](/ko/faq/overseas-model-compliance) | 라이선스 계층, 모델 등록 상태 및 콘텐츠 검토를 확인해야 합니다 |

### 💰 과금 및 보안 (17)

| 질문 | 한 줄 답변 |
| - | - |
| [가격이 공식 요금과 동일한데 — 왜 APIYI에서 구매해야 하나요?](/ko/faq/official-pricing-advantages) | 동일한 가격에 충전 보너스가 추가되며, 그룹 할인과 중복 적용할 수 있습니다 |
| [APIYI는 어떻게 공식 요금보다 낮은 가격을 제공할 수 있나요?](/ko/faq/why-cheaper-than-official) | 대량 구매 및 공급업체 유통 덕분이며, 성능이 저하된 모델이 아닙니다 |
| [모델 '배수'는 무엇을 의미하나요?](/ko/faq/model-multiplier) | RMB 단위이며, USD 상당액에는 고정 요율을 적용합니다 |
| [100 RMB로 어느 정도의 컴퓨팅 성능을 이용할 수 있나요?](/ko/faq/rmb-to-computing-power) | 충전에는 고정 1 USD = 7 RMB 요율이 적용되며, 비율은 시스템에서 설정합니다 |
| [APIYI는 캐시 과금을 지원하나요?](/ko/faq/cache-billing) | 모든 주요 경로에서 지원하며, 적중률은 공급업체별로 다릅니다 |
| [API 호출의 사전 차감 메커니즘은 무엇인가요?](/ko/faq/pre-deduction-quota) | 예상 사용량을 선차감하고 실제 사용량을 기준으로 정산합니다 |
| [잔액이 남아 있는데 요청을 실행할 수 없는 이유는 무엇인가요?](/ko/faq/balance-insufficient) | 사전 차감 검사 때문이거나 max\_tokens가 너무 높게 설정되었기 때문입니다 |
| [잔액 알림은 어떻게 설정하나요?](/ko/faq/balance-alerts) | 이메일, 그룹 봇 또는 잔액 알림 API를 사용할 수 있습니다 |
| [APIYI 잔액은 만료되나요? 유효 기간은 얼마인가요?](/ko/faq/balance-validity-period) | 365일이며, 새로 충전하면 전체 잔액의 유효 기간이 재설정됩니다 |
| [APIYI는 어떤 결제 수단을 지원하나요?](/ko/faq/payment-methods) | WeChat, Alipay, USDT, Stripe, PayPal 등을 지원합니다 |
| [청구서 금액이 \$100 미만이면 어떻게 하나요?](/ko/faq/invoice-minimum-amount) | 소액 주문을 합산하여 \$100에 도달할 때까지 기다리세요 |
| [청구서 정보를 잘못 입력했습니다. 청구서를 재발행할 수 있나요?](/ko/faq/invoice-reissue) | 기존 정보와 올바른 정보를 제출하면 취소 후 재발행할 수 있습니다 |
| [어떤 충전 프로모션을 이용할 수 있나요?](/ko/faq/recharge-promotions) | 첫 충전 및 단계별 보너스와 청구서 발행을 제공합니다 |
| [에이전트 파트너십은 어떻게 신청하나요? 친구를 초대해 리베이트를 받을 수 있나요?](/ko/faq/referral-program) | 추천 리베이트는 기본적으로 활성화되어 있으며, 별도 신청이 필요하지 않습니다 |
| [APIYI의 환불 정책은 무엇인가요?](/ko/faq/refund-policy) | 조건, 절차, 수수료 및 청구서 관련 안내를 제공합니다 |
| [콘텐츠 안전 및 규정 준수는 어떻게 보장하나요?](/ko/faq/content-safety) | 검토 메커니즘 및 위반 처리 방식을 적용합니다 |
| [APIYI는 데이터 보안을 어떻게 보장하나요?](/ko/faq/data-security) | 암호화 전송, 최소한의 저장 및 접근 제어를 적용합니다 |

### ⚙️ 모델 및 API (40)

**모델 선택 및 일반 동작**

| 질문 | 한 줄 답변 |
| - | - |
| [적합한 AI 모델을 선택하는 방법은 무엇인가요?](/ko/faq/model-selection-guide) | 사용 사례, 비용, 속도에 따라 선택합니다 |
| [일부 모델을 사용할 수 없는 이유는 무엇인가요?](/ko/faq/model-availability) | 일부 모델은 권한을 먼저 잠금 해제해야 합니다 |
| [텍스트와 생성된 이미지를 모두 출력하는 대화형 API가 있나요?](/ko/faq/text-and-image-in-one-api) | 이미지 인식과 이미지 생성은 다르며, 이미지 생성에는 네 가지 경로가 있습니다 |
| [Google 모델은 AI Studio 또는 Vertex에서 실행되나요?](/ko/faq/google-upstream-aistudio-vertex) | 기본 그룹은 공식 AI Studio 경로를 사용합니다 |
| [모델 이름의 -c 접미사는 무엇을 의미하나요?](/ko/faq/model-name-suffix-c) | 과금 체계가 다른 별도의 경로임을 나타냅니다 |
| [공식 웹 앱과 API의 결과가 왜 다른가요?](/ko/faq/webapp-vs-api-difference) | 웹 앱은 시스템 prompt를 추가하지만, API는 순수 모델 그대로입니다 |
| [API에도 ChatGPT와 같은 메모리 기능이 있나요?](/ko/faq/api-memory) | 아닙니다. 메모리는 클라이언트가 읽고 쓰는 로컬 파일입니다 |
| [AI 모델이 자신의 버전을 알지 못하는 이유는 무엇인가요?](/ko/faq/model-version-identity) | 모델의 자기 인식 정보는 신뢰할 수 없습니다 |
| [Claude가 자신이 Qwen이나 DeepSeek이라고 주장하는 이유는 무엇인가요?](/ko/faq/claude-identity-confusion) | 모델이 바뀐 것이 아니라 정체성 환각 현상입니다 |

**연동 및 매개변수**

| 질문 | 한 줄 답변 |
| - | - |
| [Base URL 설정 방법은 무엇인가요? /v1, 루트 도메인, /v1beta의 차이점](/ko/faq/base-url-config) | OpenAI, Claude, Gemini 각각에 해당하는 형식이 있습니다 |
| [스트리밍 호출과 비스트리밍 호출의 차이점은 무엇인가요?](/ko/faq/streaming-vs-non-streaming) | `stream` 플래그로 결정되며, 내용과 과금은 동일합니다 |
| [max\_tokens는 무엇이며 설정하지 않으면 어떻게 되나요?](/ko/faq/max-tokens) | 출력 길이를 제한하며, 설정하지 않을 경우 기본값이 적용됩니다 |
| [API 동시 실행 수 제한은 어떻게 되나요?](/ko/faq/api-concurrency) | 모델 유형에 따라 제한이 다르며 상향 조정할 수 있습니다 |
| [API 타임아웃을 방지하려면 어떻게 해야 하나요?](/ko/faq/timeout-configuration) | 클라이언트 타임아웃을 늘리십시오. 추론 모델은 응답이 느립니다 |
| [모델 API 오류는 어떻게 해결하나요?](/ko/faq/model-error-troubleshooting) | 매개변수, 인증, 429, 5xx, 타임아웃 순서대로 점검하십시오 |
| [OpenAI 모델의 거부(Refusal) 응답은 어떤 형태인가요?](/ko/faq/openai-content-safety-refusal) | 200 + stop + 짧은 거부 메시지 형태이며, 오류 코드나 카테고리는 없습니다 |
| [Claude의 거부 응답이 빈 내용을 반환하는 이유는 무엇인가요?](/ko/faq/claude-content-safety-refusal) | 200 + 빈 내용 + `refusal` 형태이며, 거부 카테고리가 포함됩니다 |
| [Claude의 잘못된 사고 시그니처 오류는 어떻게 해결하나요?](/ko/faq/claude-thinking-signature-invalid) | 요청 제한이 아니므로 새 대화를 시작하십시오 |
| [콘텐츠 필터링 시 스트리밍과 비스트리밍 요청의 차이점은 무엇인가요?](/ko/faq/streaming-content-filter) | 비스트리밍은 자동으로 장애 조치되며, 스트리밍은 content\_filter로 종료됩니다 |
| [로그에는 호출이 완료되어 과금되었다고 나오는데 클라이언트가 응답을 받지 못했습니다. 어떻게 해결하나요?](/ko/faq/log-duration-vs-client-wait) | 두 시간 측정 기준이 서로 다른 구간을 측정하므로, 먼저 시간차를 확인하십시오 |

**이미지 생성**

| 질문 | 한 줄 답변 |
| - | - |
| [Nano Banana 이미지 생성 실패의 일반적인 원인](/ko/faq/nano-banana-image-failure) | 주로 Google 콘텐츠 안전 정책이 트리거되었기 때문입니다 |
| [Gemini 이미지 API가 NO\_IMAGE를 반환하는 이유는 무엇인가요?](/ko/faq/gemini-no-image) | 안전 차단과는 다른 원인이므로 별도로 점검해야 합니다 |
| [Gemini 이미지가 blockReason: OTHER를 반환하는 이유는 무엇인가요?](/ko/faq/gemini-image-input-blocked) | 먼저 참조 이미지를 확인한 후 모든 참조 이미지를 다시 인코딩하십시오 |
| [Gemini 이미지가 IMAGE\_OTHER를 반환하는 이유는 무엇인가요?](/ko/faq/gemini-image-other) | prompt에 실명을 입력하지 말고 외형 묘사로 대체하십시오 |
| [흰색 배경 이미지에 검은 반점, 얼룩, 흐릿한 색상 블록이 나타나는 이유는 무엇인가요?](/ko/faq/white-background-image-artifacts) | 순백색 대신 밝은 배경으로 prompt를 작성하십시오 |
| [banana pro로 편집한 후 이미지가 붉게 변하는 이유는 무엇인가요?](/ko/faq/banana-pro-edit-red-cast) | Vertex 경로로 전환하거나 `gpt-image-2`를 사용하십시오 |
| [Nano Banana Pro로 의상을 변경할 때 왜곡된 프린트를 해결하는 방법은 무엇인가요?](/ko/faq/nano-banana-pro-print-distortion) | prompt 문구 조정, 참조 가중치 조절, 교차 경로 폴백을 활용합니다 |
| [생성된 이미지가 참조 이미지와 크게 다른 이유는 무엇인가요?](/ko/faq/image-result-differs-from-reference) | 참조 이미지는 반드시 base64로 인코딩되어야 합니다 |
| [투명 배경 이미지(PNG 누끼)를 생성하려면 어떻게 해야 하나요?](/ko/faq/image-transparent-background) | 실제 알파 채널을 얻으려면 `gpt-image-2`에 `background: "transparent"`을 전달하십시오 |
| [이미지 콘텐츠가 MIME 타입과 일치하지 않는 오류는 어떻게 해결하나요?](/ko/faq/image-mime-type-mismatch-with-query) | 이미지 URL에서 CDN 처리 매개변수를 제거하십시오 |
| [GPT 이미지 출력 tokens가 왜 이렇게 높게 나오나요?](/ko/faq/gpt-image-output-token-calculation) | 해상도, 품질, 화면비, 수량 모두 출력 tokens를 증가시킵니다 |
| [GPT-Image에 대한 Codex 연동 시 잘못된 API 키 오류가 발생합니다](/ko/faq/gpt-image-incorrect-api-key-openai) | 이 오류는 OpenAI에서 반환한 것이며, 요청이 APIYI에 도달하지 않았습니다 |
| [비동기 이미지 API가 있나요? 작업 ID로 결과를 조회할 수 있나요?](/ko/faq/image-async-api) | 동기식만 지원하며, 작업 ID를 통한 조회는 지원하지 않습니다 |

**동영상 생성**

| 질문 | 한 줄 답변 |
| - | - |
| [제출 후 Seedance 동영상 작업을 취소할 수 있나요?](/ko/faq/seedance-video-task-cancel) | 취소 엔드포인트가 존재하지 않으므로 재제출하지 않는 데 집중해야 합니다 |
| [task\_id로 Seedance 동영상의 실제 비용을 조회하려면 어떻게 해야 하나요?](/ko/faq/seedance-task-cost-lookup) | 작업 쿼터에 대해 두 개의 과금 행을 대조합니다 |
| [Seedance 2.0은 얼굴 참조를 에셋 라이브러리에 자동으로 업로드하나요?](/ko/faq/seedance2-asset-face-reference) | 아닙니다. 먼저 업로드한 후 `asset://` ID를 참조해야 합니다 |
| [Seedance 2.0 / 2.5가 얼굴 에셋을 차단하는 이유는 무엇인가요?](/ko/faq/seedance2-face-asset-whitelist) | 실제 인물 얼굴은 에셋 업로드와 신원 확인이 필요합니다 |
| [Seedance에서 invalid image format 오류가 발생하지만 브라우저에서는 링크가 열립니다](/ko/faq/seedance-image-url-invalid-format) | 링크를 서버에서 가져올 수 있어야 하므로 공개 URL을 사용하는 것이 좋습니다 |
| [Seedance 2.5: 참조 기반 동영상 생성 vs. 동영상 편집](/ko/faq/seedance2-reference-vs-edit) | prompt 의도에 따라 결정되며, 편집 시 비율과 재생 시간이 고정됩니다 |
| [Seedance에서 첫 프레임/마지막 프레임을 참조 미디어와 함께 사용할 수 없다고 표시됩니다](/ko/faq/seedance-first-frame-mixed-with-reference) | 이미지가 role을 갖지 않아 첫 프레임이 되므로, role을 명시적으로 설정하십시오 |

### 🌐 네트워크 및 연결 (9)

| 질문 | 한 줄 답변 |
| - | - |
| [API를 사용하려면 프록시가 필요한가요?](/ko/faq/network-proxy) | 직접 연결이 가능하며, 프록시나 VPN이 필요하지 않습니다 |
| [Python에서 SSLEOFError가 발생하지만 curl은 정상 작동하나요?](/ko/faq/openssl-pq-handshake-eof) | OpenSSL 3.5+ 양자 내성 핸드셰이크가 중간 네트워크 장비에 의해 차단됩니다 |
| [APIYI의 서버는 어디에 있나요? 어떤 서버를 선택해야 하나요?](/ko/faq/server-location) | 노드 위치, 지연 시간 테스트 및 구매 권장 사항 |
| [CDN 이미지/동영상 다운로드가 느리거나 타임아웃이 발생합니다 — 어떻게 해야 하나요?](/ko/faq/cdn-download-slow) | 자체 점검 명령어 + 지원팀 전달 내용 안내 |
| [http와 HTTP/1.1은 같은 것인가요?](/ko/faq/http-vs-http11) | 아닙니다. 대부분의 사용자는 https를 사용하시면 됩니다 |
| [이미지 API 지연 시간을 어떻게 줄일 수 있나요?](/ko/faq/image-api-network-latency-optimization) | 클라이언트 프로토콜 버전, 연결 재사용 및 타임아웃 설정 |
| [웹사이트나 API에서 502 오류를 반환합니다 — 어떻게 해야 하나요?](/ko/faq/website-502-error) | 일시적인 컨테이너 자동 재시작이며 약 1분 내 복구됩니다. 과금되지 않으니 30초 후 다시 시도하십시오 |
| [스크립트에서 502 오류가 발생하지만 호출 로그에 아무것도 없나요?](/ko/faq/proxy-empty-502) | 로컬 프록시에서 반환한 빈 502 오류입니다. 스크립트가 시스템 프록시를 우회하도록 설정하십시오 |
| [프록시 환경에서 이미지 호출이 약 90초 후 끊기나요?](/ko/faq/proxy-idle-timeout-disconnect) | 프록시가 유휴 연결을 닫기 때문입니다. api.apiyi.com으로 직접 라우팅하십시오 |

### 👤 계정 및 로그인 (6)

| 질문 | 한 줄 답변 |
| - | - |
| [APIYI는 등록 시 어떤 이메일 제공업체를 지원하나요?](/ko/faq/email-registration) | Gmail, Outlook, Foxmail 및 대학 이메일 주소 |
| [Passkey로 어떻게 로그인하나요?](/ko/faq/passkey-login) | 한 번 연동한 후 지문 또는 얼굴 잠금 해제를 사용합니다 |
| [GitHub 로그인 시 '계정이 이미 연동됨'이 표시되나요?](/ko/faq/github-bindng-bindng-error) | 해당 GitHub 계정은 다른 이메일에 연동되어 있습니다 |
| [비밀번호를 잊어버린 경우 어떻게 하나요?](/ko/faq/forgot-password) | 이메일로 재설정하거나 지원팀에 도움을 요청합니다 |
| [내 API Key가 유효하지 않은 이유는 무엇인가요?](/ko/faq/invalid-api-key) | 일치하지 않는 Base URL과 KEY가 일반적인 원인입니다 |
| [계정을 어떻게 삭제하나요?](/ko/faq/account-deletion) | 원클릭으로 삭제되며, 데이터는 복구할 수 없습니다 |

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.