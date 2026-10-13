> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 인기 모델

> 지원되는 400개 이상의 AI 모델에 대한 자세한 정보를 확인합니다. 여러분을 위한 인기 있고 실용적인 AI 대형 모델을 추천합니다.

APIYI는 400개 이상의 주류 AI 모델을 지원합니다. 이 페이지에서는 상세한 모델 정보, 가격 및 사용 방법을 제공합니다.

<Note>
  **엔터프라이즈급 전문적이고 안정적인 AI 대형 모델 API 허브**
  모든 모델은 공식 소스에서 가져와 릴레이하며, 약 20% 할인된 가격으로 제공됩니다(충전 보너스와 환율 이점을 결합함). 다양한 우수한 대형 모델을 통합하고 있습니다. 속도 제한이 없고, 계정 차단 위험이 없으며, 사용량 기반 과금, 장기적으로 안정적인 서비스를 제공합니다.
</Note>

## 🔥 현재 추천 모델

다음은 현재 안정적으로 공급되고 있는 인기 모델입니다. 전체 모델 목록 및 실시간 가격은 [APIYI 콘솔 가격 책정 페이지](https://www.apiyi.com/account/pricing) 또는 사이트 내 [모델 가격 개요](/en/models)를 확인하시기 바랍니다.

<Warning>
  **모델 업그레이드 권장 사항**: 최고의 성능을 위해 최신 모델 사용을 권장하지만, 다음 사항에 유의하시기 바랍니다:

  1. **초기 불안정성은 흔히 발생합니다**: 새로 출시된 모델은 공급업체의 컴퓨팅 용량 제한으로 인해 응답 지연, 타임아웃 또는 간헐적 오류가 발생할 수 있으며, 이는 일반적으로 며칠에서 몇 주 이내에 안정화됩니다
  2. **파라미터 호환성 확인**: 새 모델에서는 파라미터가 새로 도입되거나 변경될 수 있습니다(예: `max_completion_tokens`가 `max_tokens`를 대체). 업그레이드하기 전에 API 파라미터가 이전 모델과 계속 호환되는지 확인하시기 바랍니다
  3. **실제 서비스 배포 전 반드시 테스트 수행**: 새 모델을 프로덕션 환경에 배포하기 전에 테스트 환경에서 철저히 검증하여 출력 품질과 API 호환성이 기대치에 부합하는지 확인하시기 바랍니다
</Warning>

<Info>
  컨텍스트 열의 "—"는 공급업체가 명확한 수치를 공개하지 않았음을 의미하므로 콘솔 및 공식 문서를 참조하시기 바랍니다. 모든 가격은 1M tokens(입력/출력) 기준이며 충전 보너스와 함께 적용될 수 있습니다.
</Info>

## 모델 카테고리

### 🤖 OpenAI 시리즈

#### 🆕 최신 모델

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **GPT-6 Astra** 🔥 | `gpt-6-astra` | 1.05M | 컴퓨터 사용 및 장기 실행(long-horizon) 에이전트를 위해 구축된 6세대 플래그십, 5단계 reasoning-effort 지원(`xhigh` / `max` 추가), Terminal-Bench 4.0 **57.9%**, ScreenSpot-Pro 92.7%; \$10/\$50 | 최고 수준의 에이전트, 컴퓨터 사용, 연구 |
| **GPT-6 Sol** 🔥 | `gpt-6-sol` | 1.05M | 5.6 Sol의 약 절반 가격(프로모션이 아닌 장기 제공 가격)인 6세대 미드 티어, 128K 출력; \$2/\$10 | 기능 구축, 코드 리뷰, 데이터 분석 |
| **GPT-6 Luna** 🔥 | `gpt-6-luna` | 1.05M | 요약, 추출 및 기타 대량 작업용 6세대 경량 티어, \$0.10/\$0.50 | 높은 동시 실행 수, 비용에 민감한 환경 |
| **GPT-5.5 Pro** | `gpt-5.5-pro` | 1M | 심층 추론 전문 모델, Terminal-Bench 2.0 82.7%; **`/v1/responses` 엔드포인트 + SVIP 그룹 전용**, 매우 고가 | 최고 수준의 추론, 연구 |
| **chat-latest** | `chat-latest` | 400K | 버전 없는 별칭, 항상 최신 ChatGPT Instant 모델을 가리킴 | 빠른 글쓰기, 대화 |

<Note>
  **GPT-6 시리즈 제공 안내**: `default` / `svip` 공식 릴레이 그룹은 4가지 과금 항목 모두 공식 가격과 일치하며, Chat Completions 및 Responses 모두 정상 작동(함수 호출 포함)이 확인되었습니다. 5.6에서의 마이그레이션은 `model` 필드만 변경하시면 됩니다. Astra는 `Codex_Reverse` 그룹에서도 0.5 할인된 요율로 이용하실 수 있습니다. Sol / Luna의 경우, 단일 요청의 컨텍스트가 272K를 초과하면 전체가 상위 티어로 과금됩니다. 자세한 내용은 [GPT-6 Astra 출시 안내](/en/news/gpt-6-astra-launch) 및 [GPT-6 Sol / Luna 출시 안내](/en/news/gpt-6-sol-luna-launch)를 참조하십시오.
</Note>

<Warning>
  **GPT Pro 시리즈(예: `gpt-5.5-pro`, `gpt-5.4-pro`) 사용 시 주의사항**:

  1. **`/v1/responses` 엔드포인트 전용**: `/v1/chat/completions`는 사용할 수 없습니다 — 호출하기 전에 SDK / 코드를 Responses API로 전환하십시오
  2. **매우 고가**: 단일 호출에 수 달러가 발생할 수 있으며, Default 그룹에서의 오사용을 방지하기 위해 SVIP 그룹에만 제공됩니다
  3. **비전문적 요구사항에는 권장하지 않음**: 일상적인 작업에는 GPT-6 Sol 또는 GPT-5.6 Sol을 사용하십시오. Pro는 극도의 추론 깊이를 요구하는 연구 및 최고 난이도의 작업에만 적합합니다
</Warning>

#### ✅ 안정 / 클래식

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **GPT-5.6 Sol** ⭐ | `gpt-5.6-sol` | 1M | 5.6세대 플래그십, Terminal-Bench 2.1 88.8%, `gpt-5.6` 별칭이 이 모델을 가리킴; \$4/\$20 (9월 3일 가격 인하) | 최첨단 인공지능, 에이전트 작업 |
| **GPT-5.6 Terra** | `gpt-5.6-terra` | 1M | 5.6세대 주력 모델, \$2/\$12 | 일상적인 개발 |
| **GPT-5.6 Luna** | `gpt-5.6-luna` | 1M | 5.6세대 경량 티어, \$0.20/\$1.20, 256K 컨텍스트 초과 시 성능 저하 | 높은 동시 실행 수, 비용에 민감한 환경 |
| **GPT-5.5** ⭐ | `gpt-5.5` | 1M | 이전 플래그십, SWE-bench Verified 88.7%, `xhigh` 추론 단계 | 복잡한 에이전트, 전문적인 워크플로 |
| **GPT-5.4** ⭐ | `gpt-5.4` | 1M | 이전 세대 주력 모델, 네이티브 컴퓨터 사용 지원, GDPval 83% | 복잡한 에이전트, 전문적인 워크플로 |
| **GPT-5.4 Mini** | `gpt-5.4-mini` | 1M | 경량형, 뛰어난 가성비 | 성능과 비용의 균형 |
| **GPT-5.2** | `gpt-5.2` | 400K | 전문가 수준을 뛰어넘는 GDPval 70.9% | 프로그래밍 기획, 구조화된 작업 |
| **GPT-5.1** | `gpt-5.1` | 128K | 지능과 속도의 균형, SWE-bench 76.3%, 24시간 캐시 | 범용 애플리케이션, 프로그래밍 |
| **GPT-5.1 Codex** | `gpt-5.1-codex-high` | 128K | Codex 코딩 시리즈 (medium / mini 티어도 제공) | 프로그래밍, 에이전트 작업 |
| **GPT-5** | `gpt-5` | 128K | 클래식 플래그십 안정 버전 | 최고 수준의 추론, 복잡한 작업 |
| **GPT-5 Mini** | `gpt-5-mini` | 128K | GPT-5 경량 버전, 우수한 성능 | 성능과 비용의 균형 |
| **o3** | `o3` | 200K | 추론 모델, 대폭 가격 인하 | 복잡한 추론, 수학, 프로그래밍 |
| **o4-mini** | `o4-mini` | 200K | 경량 추론 모델 | 프로그래밍 |
| **GPT-4.1** | `gpt-4.1` | 128K | 신속하며 오랜 기간 검증된 주력 모델 | 범용 애플리케이션 |
| **GPT-4o** | `gpt-4o` | 128K | 균형 잡힌 멀티모달 기능 | 일반적인 시나리오 |
| **GPT-4o Mini** | `gpt-4o-mini` | 128K | 경량의 빠른 버전 | 신속한 응답 |

<Warning>
  **GPT-5 및 최신 시리즈 사용 시 주의사항**:

  1. temperature 매개변수 `temperature`는 반드시 1로 설정해야 합니다(1만 지원)
  2. `max_tokens` 대신 `max_completion_tokens`를 사용하십시오
  3. `top_p` 매개변수를 전달하지 마십시오
</Warning>

<Info>
  **이미지 및 동영상 생성 모델**은 전용 페이지로 이동되었습니다. 전체 목록과 가격은 [이미지 및 동영상 생성 모델](/ko/api-capabilities/image-video-models)을 방문하여 확인하십시오.
</Info>

### 🎭 Claude 시리즈 (Anthropic)

#### 🆕 최신 모델

| 모델명 | 모델 ID | 컨텍스트 길이 | 주요 특징 | 추천 시나리오 |
| - | - | - | - | - |
| **Claude Opus 5.5** 🔥 | `claude-opus-5-5` | 1M | Terminal-Bench 4.0 **66.4%**, Fable 5.1(55.8%)보다 우수, Opus 5 대비 출력 속도 30%+ 향상, \$4/\$20로 Opus 5보다 저렴 | 최고 수준의 코딩, 복잡한 에이전트 |
| **Claude Opus 5.5 Thinking** 🔥 | `claude-opus-5-5-thinking` | 1M | Opus 5.5의 명시적 thinking 변형 모델 | 최고 수준의 추론 작업 |
| **Claude Fable 5.1** 🔥 | `claude-fable-5-1` | 1M | Mythos급 플래그십, 동일 가격 업그레이드: Terminal-Bench-Science 24.7% → **52.6%**, `-thinking` 변형 모델 제공, \$10/\$50 | 최고 수준의 작업, 장시간 비동기 작업 |
| **Claude Sonnet 5** | `claude-sonnet-5` | — | SWE-bench Verified **85.2%**, Terminal-Bench 2.1 80.4%, 높은 캐시 적중률을 갖춘 순수 AWS 공식 릴레이, \$2/\$10 | 프로그래밍 최우선 선택, 에이전트 개발 |
| **Claude Opus 5** | `claude-opus-5` | 1M | Frontier Bench v0.1 43.3%, 128K 출력, 5단계 effort 등급의 thinking 기본 활성화, `-thinking` 변형 모델 제공, \$5/\$25 | 최고 수준의 코딩, 복잡한 에이전트 |

<Warning>
  **Opus 5.5 / Fable 5.1의 주요 호환성 변경 사항(Breaking changes)**: 강제 tool 호출(`any` / `tool`의 `tool_choice`)은 400을 반환하며, thinking 블록은 모델에 바인딩되고, 기록(history)을 편집하면 thinking 블록이 무효화됩니다. Opus 5.5는 추가로 **thinking을 비활성화할 수 없으며**, 기본 effort가 `high`에서 `medium`로 감소합니다. 마이그레이션하기 전에 [Opus 5.5 출시 노트](/en/news/claude-opus-5-5-launch) 및 [Fable 5.1 출시 노트](/en/news/claude-fable-5-1-launch)를 확인하시기 바랍니다.
</Warning>

<Warning>
  **Fable 5 / Fable 5.1 / Mythos 5에 대한 30일 데이터 보존 규정 준수**: 이 모델들의 고급 기능으로 인해 Bedrock과 Anthropic은 고위험 오용에 대한 추가 검사를 수행합니다. 심각한 남용을 감지하기 위해 이 두 모델의 **입력 및 출력은 30일간 보존됩니다**. 기본적으로 자동화된 안전 시스템이 접근하며, 잠재적 유해성이 플래그 지정된 경우에만 인적 검토가 진행됩니다. 데이터 보존은 AWS / Anthropic 측에서 이루어지며, APIYI는 순수한 투명 프록시로서 자체적으로 어떠한 데이터도 보존하지 않습니다. **다른 Claude 모델은 영향을 받지 않습니다.** 자세한 내용은 [Fable 5.1 출시 노트](/en/news/claude-fable-5-1-launch)를 참조하시기 바랍니다.
</Warning>

#### ✅ 안정 / 클래식

| 모델명 | 모델 ID | 컨텍스트 길이 | 주요 특징 | 추천 시나리오 |
| - | - | - | - | - |
| **Claude Fable 5** | `claude-fable-5` | — | 이전 Mythos급 플래그십, \$10/\$50 | 최고 수준의 작업 |
| **Claude Opus 4.8** | `claude-opus-4-8` | 1M (Beta) | 에이전트 기반 코딩 69.2%, 동적 워크플로 | 최고 수준의 코딩, 복잡한 에이전트 |
| **Claude Opus 4.7** ⭐ | `claude-opus-4-7` | 1M (Beta) | 4.6 대비 코딩 벤치마크 +13%, 도구 오류 1/3로 감소, `-thinking` 변형 모델 제공 | 최고 수준의 코딩, 복잡한 에이전트 |
| **Claude Opus 4.6** | `claude-opus-4-6` | 1M (Beta) | Terminal-Bench 2.0 1위, 128K 출력 | 최고 수준의 코딩, 복잡한 에이전트 |
| **Claude Sonnet 4.6** ⭐ | `claude-sonnet-4-6` | 1M (Beta) | Opus 4.5에 필적하는 성능, 뛰어난 가성비 | 프로그래밍, 에이전트 개발 |
| **Claude Opus 4.5** | `claude-opus-4-5-20251101` | 200K | SWE-bench 80.9%, 가격 1/3로 인하 | 복잡한 프로그래밍, 최고 수준의 추론 |
| **Claude Sonnet 4.5** | `claude-sonnet-4-5-20250929` | 200K | 세계적 수준의 코딩, SWE-bench 77.2%, `-thinking` 변형 모델 제공 | 코드 생성, 에이전트 개발 |
| **Claude Haiku 4.5** ⭐ | `claude-haiku-4-5-20251001` | 200K | 높은 가성비, SWE-bench 73.3%, 2배 빠른 속도 | 실시간 채팅, 페어 프로그래밍 |
| **Claude 4 Sonnet** | `claude-sonnet-4-20250514` | 200K | 오랫동안 검증된 안정적인 버전 | 코드 생성, 분석 |

<Note>
  **최신 모델**: Claude Opus 5.5는 Opus 5보다 저렴한 비용(\$4/\$20)으로 대부분의 코딩 및 지식 작업 벤치마크에서 Fable 5.1을 앞서며, Anthropic에 따르면 일반적인 워크로드 비용이 Opus 5보다 약 40% 낮습니다. Sonnet 5는 Opus 4.8에 근접한 성능을 제공하면서도 더 빠르고 저렴합니다. **안정 버전**: Opus 4.7 및 Sonnet 4.6은 이미 구축된 프로덕션 워크플로에서 실전 검증을 거쳤으며, Haiku 4.5는 뛰어난 가성비와 2배 빠른 속도를 제공합니다.
</Note>

### 🌟 Google Gemini 시리즈

#### 🆕 최신 모델

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **Gemini 3.8 Flash** 🔥 | `gemini-3.8-flash` | — | Google이 9월 2일에 출시한 새로운 Flash 버전으로 공식 사양은 아직 발표되지 않았습니다. 150개의 페어링된 듀얼 프로토콜 테스트에서 3.7과 항목별로 일치하며, 가격은 3.7과 동일한 \$0.75/\$3.75입니다. | 프로그래밍, 에이전트, 가성비 |
| **Gemini 3.7 Flash** 🔥 | `gemini-3.7-flash` | 1M | 64K 출력, Terminal-bench 2.1 **85.8%**, DeepSWE 65.3%, \$0.75/\$3.75는 Google의 기간 한정 프로모션 요금(2026-12-31까지, 이후 \$1.50/\$7.50)입니다. | 프로그래밍, 에이전트, 멀티모달 |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | 1M | ARC-AGI-2 77.1%(3 Pro 대비 2배 이상), Google 최강의 추론 모델입니다. | 복잡한 추론, 멀티모달 분석 |
| **Gemini 3.1 Flash Lite** | `gemini-3.1-flash-lite` | 1M | GA 버전, 2.5 Flash보다 64% 빠름, \$0.25/\$1.50 | 높은 동시 실행 수, 배치, 저비용 |

<Warning>
  **참고**: Gemini 3 Pro Preview는 2026년 3월 9일에 지원이 종료되었습니다. Gemini 3.1 Pro Preview 또는 Gemini 3.8 Flash로 마이그레이션해 주시기 바랍니다.
</Warning>

#### ✅ 안정 / 클래식

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **Gemini 3.6 Flash** | `gemini-3.6-flash` | 1M | 멀티모달 Flash, thinking 기본 활성화(4단계 티어), 모든 네이티브 tools 지원, \$1.50/\$7.50 | 프로그래밍, 에이전트, 멀티모달 |
| **Gemini 3.5 Flash-Lite** | `gemini-3.5-flash-lite` | 1M | 기본적으로 thinking 미사용, 약 2초 응답, \$0.30/\$2.50 | 높은 동시 실행 수, 낮은 지연 시간, 배치 |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` | 1M | Terminal-Bench 2.1 76.2%, \$1.50/\$9.00 | 프로그래밍 |
| **Gemini 3 Flash Preview** | `gemini-3-flash-preview` | 1M | SWE-bench 78%, thinking / nothinking 모델 변형 제공 | 프로그래밍, 가성비 |
| **Gemini 2.5 Pro** ⭐ | `gemini-2.5-pro` | 2M | 정식 출시 버전, 프로그래밍 우위, 강력한 멀티모달 | 긴 텍스트, 프로그래밍, 멀티모달 |
| **Gemini 2.5 Flash** ⭐ | `gemini-2.5-flash` | 1M | 빠른 속도, 저렴한 비용, 정식 출시 버전 | 빠른 응답 시나리오 |
| **Gemini 2.5 Flash Lite** | `gemini-2.5-flash-lite` | 1M | 초경량, 더 빠르고 저렴함 | 대규모 단순 작업 |

<Note>
  **최신**: Gemini 3.8 Flash와 3.7 Flash는 동일한 가격으로 절반의 비용에 코딩 및 에이전트 작업에서 3.6 Flash보다 훨씬 앞서 있으며, 네이티브 Gemini 및 OpenAI 호환 엔드포인트를 모두 지원합니다. [3.8 Flash 출시 노트](/en/news/gemini-3-8-flash-launch) 및 [3.7 Flash 출시 노트](/en/news/gemini-3-7-flash-launch)를 참고하십시오. 높은 동시 실행 수와 짧은 지연 시간이 필요한 작업에는 [3.5 Flash-Lite](/ko/api-capabilities/gemini-3-5-flash-lite/overview)를 사용해 보십시오. **안정 버전**: Gemini 2.5 Pro(2M 컨텍스트) 및 Gemini 2.5 Flash는 안정적인 프로덕션 환경에 적합합니다.
</Note>

### 🚀 xAI Grok 시리즈

#### 🆕 최신 모델

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **Grok 4.7** 🔥 | `grok-4.7` | 500K | 신규 2.1T 베이스 모델; Terminal-Bench 4.0 18% → **33%**, DeepSWE 73%; \$2/\$6로 기존과 동일하지만 작업당 4.6 대비 약 2배의 출력 tokens 사용 | 코딩 에이전트, 장기 작업 |
| **Grok 4.6** 🔥 | `grok-4.6` | 500K | Artificial Analysis Intelligence Index **61**, GPT-5.6 Sol Max와 동급; \$2/\$6 | 일반 작업, 프로그래밍 |
| **Grok 4.5** | `grok-4.5` | 500K | Cursor와 공동 훈련, 에이전틱 도구 호출 1위, 매우 높은 token 효율의 출력; \$2/\$6 | 프로그래밍, 에이전트 작업 |
| **Grok 4.3** | `grok-4.3` | 1M | Intelligence Index 53, τ²-Bench 98%, IFBench 81%; \$1.25/\$2.50, 200K 초과 시 2배 | 복잡한 추론, 일반 작업 |
| **Grok 4 Fast Reasoning** | `grok-4-fast-reasoning` | 200K | 추론 모드, Grok-4 대비 93% 이상 저렴 | 복잡한 추론 |
| **Grok Code Fast 1** | `grok-code-fast-1` | 256K | SWE-bench 70.8%, 고속 생성 | 코드 생성, 에이전트 프로그래밍 |

#### ✅ 안정화 / 클래식

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **Grok 4.20 Beta** | `grok-4.20-beta` | 표준 | 추론 / 멀티 에이전트 / 비추론 변형 제공 | 일반 작업 |
| **Grok 4** | `grok-4` | 표준 | 공식 버전; `grok-4-all`은 네이티브 웹 검색 추가 | 일반 작업, 실시간 정보 |
| **Grok 3** | `grok-3` | 표준 | 공식 안정화 버전 | 일상적 사용 |
| **Grok 3 All** | `grok-3-all` | 표준 | 네이티브 웹 검색 강화 | 뉴스, 시장 분석 |
| **Grok 3 Mini** | `grok-3-mini` | 표준 | 추론 기능을 갖춘 소형 모델 | 경량 작업 |

<Info>
  **작업당 Grok 비용 추정**: Grok 4.5 / 4.6 / 4.7은 동일한 단가(\$2/\$6)를 공유하지만, Grok 4.7은 동일한 작업 세트에서 4.6 대비 약 2배의 출력 tokens를 사용하므로 작업당 지출이 증가합니다. Grok 4.5는 출력 효율이 가장 높습니다. 200K tokens를 초과하는 요청은 공급업체의 2단계 요율로 과금됩니다. 자세한 내용은 [Grok 4.7 출시 노트](/en/news/grok-4-7-launch)를 참고하십시오.
</Info>

### 🔍 DeepSeek 시리즈

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **DeepSeek V4 Pro** 🔥 | `deepseek-v4-pro` | 1M | 1.6T/49B 활성화, Claude/Gemini에 근접한 SWE-Verified 80.6, Hybrid Attention | 복잡한 추론, 코딩, 에이전트 |
| **DeepSeek V4.1 Flash** 🔥 | `deepseek-v4.1-flash` | — | DeepSeek의 최신 Flash, OpenAI 및 Anthropic 포맷 모두 지원(`ClaudeCode` 그룹을 통한 Anthropic 포맷), 캐시된 입력 최저 \$0.006; \$0.30/\$1.20 | 높은 동시 실행 수, 코딩, 에이전트 |
| **DeepSeek V3.2** | `deepseek-v3.2` | 128K | GPT-5 수준, 추론 시 도구 사용 | 복잡한 추론, 코딩 |
| **DeepSeek V3.1** ⭐ | `deepseek-v3-1-250821` | 128K | 혼합 추론, Think/Non-Think 듀얼 모드 | 지능형 추론, 프로그래밍 |
| **DeepSeek R1** | `deepseek-r1` | 64K | 추론 모델 | 수학, 추론 |
| **DeepSeek V3** | `deepseek-v3` | 128K | 뛰어난 종합 성능 | 범용 시나리오 |

### 🐘 중국 모델 시리즈

#### Zhipu AI (GLM)

**🆕 최신**: GLM-5.3, GLM-5.3-Flash | **✅ 안정화 / 클래식**: GLM-5.2, GLM-5.1, GLM-5

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **GLM-5.3** 🔥 | `glm-5.3` | 1M | 5.2와 동일한 753B MoE 기반에 사후 학습(post-training)만 확장, 5.2 대비 Z.ai Code Bench **+50%**, \$1.40/\$4.396 | 프로젝트 단위 코딩, 장기 에이전트 |
| **GLM-5.3-Flash** 🔥 | `glm-5.3-flash` | 1M | 최초의 네이티브 멀티모달 GLM-5 모델(텍스트 / 이미지 / 비디오 / 파일), Terminal-Bench 2.1 **84.3**, Claude Opus 4.8에 근접, \$0.15/\$0.50 | 멀티모달, 가성비 코딩 |
| **GLM-5.2** | `glm-5.2` | 1M | Alibaba Cloud 공식 릴레이 직접 연결, AA Intelligence Index **51**(오픈소스 1위), Terminal-Bench 2.1 81.0, SWE-bench Pro 62.1, \$1.142/\$3.997 | 프로젝트 단위 코딩, 장기 에이전트 |
| **GLM-5.1** ⭐ | `glm-5.1` | 200K | SWE-Bench Pro 58.4, 744B MoE, MIT 오픈소스 | 복잡한 코딩, 에이전트 |
| **GLM-5** | `glm-5` | 200K | 744B 파라미터(40B 활성화), Claude Opus 4.5 수준의 코딩 성능 | 복잡한 코딩, 시스템 엔지니어링 |
| **GLM-4.6** | `glm-4.6` | 200K | 코드 및 추론 성능 강화, 안정적 | 프로그래밍, 추론, 에이전트 |
| **GLM-4.5** | `glm-4.5` | 128K | 표준 버전, 우수한 종합 성능 | 범용 시나리오 |

<Info>
  **GLM-5.3 시리즈 주요 특징**:

  * 플래그십인 GLM-5.3은 5.2의 기본 베이스를 유지하면서 사후 학습만 확장하여 코딩 및 사이버 보안 분야에서 대폭적인 성능 향상을 이루었습니다(ExploitBench 54.4% vs 5.2의 24.4%).
  * GLM-5.3-Flash는 플래그십 가격의 약 1/10 수준인 320B-A18B 하이브리드 희소(sparse) + 선형 어텐션(linear attention) 멀티모달 모델입니다.
  * 가격은 Zhipu 공식 사이트와 항목별로 동일하며, `default` / `svip` 그룹에서 사용할 수 있습니다. 장시간 작업 시에는 타임아웃을 600초 이상으로 늘리십시오. 자세한 내용은 [GLM-5.3 출시 노트](/en/news/glm-5-3-launch)를 참조하시기 바랍니다.
</Info>

#### Alibaba Qwen

**🆕 최신**: Qwen3.8-Max | **✅ 안정화 / 클래식**: Qwen3.7 시리즈, Qwen3.6 시리즈, Qwen Max / Plus / Turbo

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **Qwen3.8-Max** 🔥 | `qwen3.8-max` | 1M | 2.4T 희소 MoE, 131K 출력, GPQA Diamond **92.6**, PaperBench 93.0, 네이티브 이미지/동영상 입력 지원, thinking 기본 활성화, `/v1/responses` 미지원, \$1.65/\$4.95 | 에이전트, 멀티모달, 장문 텍스트 |
| **Qwen3.7-Max** | `qwen3.7-max` | 1M | AA Intelligence Index 56.6(글로벌 톱 5, 중국 1위), 35시간 장기 에이전트 자율성, \$1.714/\$5.142 | 에이전트, 다국어, 장문 텍스트 |
| **Qwen3.7-Plus** | `qwen3.7-plus` | 1M | 3.7세대 가성비 모델, \$0.60/\$2.40 | 범용 작업, 배치 처리 |
| **Qwen3.6-Max-Preview** | `qwen3.6-max-preview` | 1M | 6개 코딩 벤치마크 1위(AIME 2025 93%, GPQA 86%) | 프로그래밍, 추론 |
| **Qwen3.6-Plus** | `qwen3.6-plus` | 1M | MoE 72B / 18B 활성화, Terminal-Bench 61.6, 생각의 사슬(CoT) 상시 활성화 | 코딩 에이전트 |
| **Qwen3.6-Flash** | `qwen3.6-flash` | 1M | 35B-A3B MoE, 멀티모달, \$0.17/\$1.02 | 가성비, 멀티모달 |
| **Qwen3.6 오픈 가중치** | `qwen3.6-27b` / `qwen3.6-35b-a3b` | 1M | APIYI에서 호스팅하는 오픈 가중치 모델 — GPU 대여나 추론 스택 구축 불필요 | 자체 호스팅 대안, 비용 민감 작업 |
| **Qwen Max** | `qwen-max` | 32K | 검증된 안정 버전 | 범용 작업 |
| **Qwen Plus** | `qwen-plus` | 32K | 성능 강화 버전 | 가성비 |
| **Qwen Turbo** | `qwen-turbo` | 32K | 고속 버전 | 낮은 지연 시간 |

#### Moonshot Kimi 시리즈

**🆕 최신**: Kimi K3 | **✅ 안정화 / 클래식**: Kimi K2.6, K2.5, K2

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **Kimi K3** 🔥 | `kimi-k3` | 1M | 2.8T 파라미터 오픈소스 플래그십, Kimi Delta Attention, **LMArena Frontend Code Arena 1위**, GPQA Diamond 93.5%, Terminal-Bench 2.1 88.3%, 전체 컨텍스트 범위에서 단일 요율 적용, 캐시된 입력은 최저 \$0.30 | 프론트엔드 코딩, 장기 에이전트 |
| **Kimi K2.7 Code** | `kimi-k2.7-code` | 256K | 코딩 특화 모델, \$0.95/\$3.99 | 프로그래밍 |
| **Kimi K2.6** ⭐ | `kimi-k2.6` | 256K | 1T MoE / 32B 활성화, SWE-Bench Pro 58.6, \$0.60/\$2.40(정가의 약 60%) | 코딩, 에이전트 |
| **Kimi K2.5** | `kimi-k2.5` | 200K | 네이티브 멀티모달, Agent Swarm 100개 에이전트 | 멀티모달, 에이전트 |
| **Kimi K2 공식 릴리즈** | `kimi-k2-250711` | 200K | Volcano Engine 파트너십, 뛰어난 안정성 | 프로덕션 환경 |

<Info>
  **Kimi K3 사용 시 유의 사항**:

  * 정확히 1,048,576 tokens의 컨텍스트를 제공하며 **전체 범위에서 단일 요율이 적용**되므로, 요금 구간 변동 걱정 없이 전체 리포지토리나 방대한 문서를 입력할 수 있습니다.
  * 최대 출력의 기본값은 131,072 tokens이며 최대 1,048,576 tokens까지 늘릴 수 있습니다. 추론(thinking)이 전력으로 구동되므로 이에 맞춰 출력 tokens 예산을 계획하십시오.
  * 자동 컨텍스트 캐싱을 통해 캐시된 입력은 1M당 \$0.30(비캐시 요율의 1/10)으로 과금되므로, 멀티턴 대화 시 매우 유리합니다.
</Info>

#### ByteDance Seed 시리즈

**🆕 최신**: Seed 2.1 Turbo | **✅ 안정화 / 클래식**: Seed 2.0 Pro / Lite / Mini

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 권장 시나리오 |
| - | - | - | - | - |
| **Seed 2.1 Turbo** 🔥 | `dola-seed-2-1-turbo-260628` | 256K | 고빈도 프로덕션 텍스트 모델, **Chat Completions 및 Responses 모두에서 15/15 테스트 케이스 통과**, 제어 가능한 thinking 및 암시적/명시적 2단계 캐싱, \$0.50/\$2.50 | 높은 동시 실행 수 프로덕션, 배치 추출 |
| **Seed 2.0 Pro** | `seed-2-0-pro-260328` | — | AIME 2025 98.3, Codeforces 3020, 강력한 에이전트 역량, \$0.50/\$3.00 | 복잡한 추론, 코딩 |
| **Seed 2.0 Lite** | `seed-2-0-lite-260428` | — | 가성비 기업용 모델, 이미지/동영상/텍스트 멀티모달 입력, \$0.25/\$2.00 | 대규모 프로덕션 |
| **Seed 2.0 Mini** | `seed-2-0-mini-260428` | — | 초경량 모델, \$0.10/\$0.40 | 대량의 단순 작업 |

<Warning>
  **Seed 2.1 Turbo는 기본적으로 deep thinking이 활성화되어 있습니다**: 파라미터를 별도로 설정하지 않으면 한 줄짜리 질문에도 수백 개의 thinking tokens가 먼저 출력되며(한 문장 자기소개 테스트 시 출력된 444 tokens 중 409 tokens가 thinking이었습니다), thinking은 일반 출력 tokens와 동일하게 과금됩니다. 고빈도 단문 질의응답 작업의 경우 `thinking: {"type": "disabled"}` 설정을 기본으로 적용하는 것을 권장합니다. 자세한 내용은 [연동 가이드](/ko/api-capabilities/dola-seed-2-1-turbo/overview)를 참조하십시오.
</Warning>

### 🌐 MiniMax 시리즈

**🆕 최신**: MiniMax-M3 | **✅ 안정 / 클래식**: MiniMax-M2.7, M2.5

| 모델명 | 모델 ID | 컨텍스트 길이 | 특징 | 추천 시나리오 |
| - | - | - | - | - |
| **MiniMax-M3** 🔥 | `MiniMax-M3` | 1M | 프론티어 에이전트 코딩, 1M 컨텍스트 및 네이티브 멀티모달을 결합한 최초의 오픈 가중치 플래그십 모델입니다. SWE-Bench Pro **59.0**으로 GPT-5.5 및 Gemini 3.1 Pro를 능가하며, MSA 희소 어텐션을 통해 긴 컨텍스트 추론 비용을 이전 세대의 약 1/20 수준으로 절감합니다 | 코딩, 에이전트, 긴 컨텍스트 |
| **MiniMax-M2.7** | `MiniMax-M2.7` | 표준 | 10B 파라미터, SWE-bench Pro 56.22%, 자가 진화, 가장 작은 Tier-1 모델 | 코딩, 에이전트 |
| **MiniMax-M2.5** | `MiniMax-M2.5` | 표준 | 230B(10B 활성화), SWE-bench 80.2%, 뛰어난 가성비 | 코딩, 에이전트, 사무 자동화 |

<Info>
  **MiniMax-M3 과금 안내**:

  * 구간별 과금: 0\~512K 구간의 경우 1M tokens당 입력 \$0.30 / 출력 \$1.20이며, 이를 초과하는 사용량은 더 높은 구간 요율로 과금됩니다
  * 모델명은 대소문자를 구분합니다: `MiniMax-M3` (`MiniMax-M2.7-highspeed` 등의 관련 모델도 동일합니다)
  * 100만 token 컨텍스트 작업을 실행하기 전에 비용을 미리 추정해 보시기 바랍니다
</Info>

<Note>모델 가격은 공식 가격과 연동되어 제공업체의 조정에 따라 변경될 수 있습니다. 상기 표는 참고용일 뿐이며, 상단 내비게이션의 **모델 가격** 탭이 기준이 됩니다: [모델 가격](/en/models/index).</Note>

## 💰 요금 정보

### 과금 방식

* **사용량 기반 과금**: 실제 Token 사용량에 따라 과금됩니다
* **최소 과금 없음**: 사용한 만큼만 지불하면 됩니다
* **잔액 유효 기간**: 충전일로부터 365일 동안 유효하며, 다음 충전 시 자동으로 초기화됩니다(자세한 내용은 [충전 프로모션](/ko/faq/recharge-promotions) 참조)
* **실시간 차감**: 각 호출 후 요금이 잔액에서 즉시 차감됩니다

### 요금 장점

* 공식 릴레이를 통한 약간의 가격 우위
* 대량 사용자는 더 나은 요금을 위해 고객 서비스에 문의할 수 있습니다
* 신규 계정에는 통합이 정상적으로 작동하는지 확인할 수 있을 만큼의 \$0.05 체험 크레딧이 제공됩니다

### 실시간 요금 확인

모든 모델의 최신 요금은 [APIYI 콘솔 요금 페이지](https://www.apiyi.com/account/pricing)에서 확인하거나, 사이트 내 [모델 요금 개요](/en/models)를 확인하십시오.

## 🛠️ 사용 권장 사항

### 모델 선택 가이드

**프로그래밍 개발**

* 최고 성능: Claude Opus 5.5 (Terminal-Bench 4.0 66.4%), GPT-6 Astra (Terminal-Bench 4.0 57.9%), Claude Sonnet 5 (SWE-bench 85.2%), Kimi K3
* 높은 가성비: GPT-6 Sol (5.6 가격의 약 절반), Gemini 3.8 Flash / 3.7 Flash, GLM-5.3 / 5.3-Flash, MiniMax-M3, DeepSeek V4.1 Flash
* 대안: Grok 4.7 / 4.6, Qwen3.8-Max, GPT-5.6 Sol, Kimi K2.6

**텍스트 창작**

* 최적의 선택: GPT-6 Sol, Claude Opus 5.5, Claude Sonnet 5, Gemini 3.8 Flash
* 대안: chat-latest, GPT-5.6 Terra, Claude Sonnet 4.6, GLM-5.3

**빠른 응답**

* 최적의 선택: Gemini 3.5 Flash-Lite (기본적으로 추론 없음, 약 2초), Claude Haiku 4.5 (2배 빠름), GPT-6 Luna
* 대안: Gemini 3.1 Flash Lite, Gemini 2.5 Flash, Seed 2.1 Turbo (추론 명시적 비활성화)

**장문 텍스트 처리**

* 초장문 컨텍스트: Gemini 2.5 Pro (2M), Kimi K3 (1M, 단일 요금제), MiniMax-M3 (1M), GLM-5.3 (1M), GPT-6 시리즈 (1.05M), Claude Opus 5.5 (1M)
* 참고: 일부 모델은 특정 임계값을 초과하면 더 높은 과금 등급으로 전환되므로(Grok 4.5 / 4.6 / 4.7은 200K 초과 시, GPT-6 Sol / Luna는 272K 초과 시, MiniMax-M3는 512K 초과 시), 장문 작업 전에는 비용을 예측해 보시기 바랍니다.

**이미지 생성**

* 최신 권장 모델: gpt-image-2.5-flare / gpt-image-2.5-sunburst (2026년 9월 출시, 네이티브 4K, 정밀한 크기/품질 제어, gpt-image-2와 동일한 가격, 각각 더 빠른 속도 / 더 정밀한 편집), Nano Banana Pro (4K HD, 최고의 텍스트 렌더링)
* 높은 가성비: Nano Banana 2 (이미지당 \$0.055, 종량제 사용 시 \$0.025부터), Nano Banana Lite (이미지당 약 4초, 이미지당 \$0.025)
* 전문 디자인: Seedream 5.0 Pro (호출당 \$0.12, 대화형 편집 + 최대 10장의 참조 이미지), Seedream 5.0 Lite (이미지당 \$0.035)
* 빠른 생성: Seedream 5.0 Flash (2026년 9월 출시, 이미지당 \$0.018, 이미지당 15–20초, 정확한 중국어 타이포그래피)
* 최저가: gpt-image-2-all (역방향 채널, 이미지당 \$0.025)

**동영상 생성**

* 공식 릴레이 최적의 선택: VEO 3.1 Official (호출당 \$0.3 / \$1.2, 4/6/8초, 네이티브 동기화 오디오)
* 중국 벤더 핵심 모델: Seedance 2.5 및 2.0 시리즈 (2.5 / standard / fast / mini), Wan2.7, HappyHorse 1.1
* 참고: Sora 2 채널은 서비스가 종료되었으므로 위의 옵션을 사용하시기 바랍니다. [이미지 및 동영상 생성 모델](/ko/api-capabilities/image-video-models)을 참고하십시오.

**웹 검색**

* 네이티브 웹 접근: Grok 4 All, Grok 3 All (도구 호출 불필요)
* 검색 그라운딩: Gemini 3.8 Flash / 3.7 Flash / 3.6 Flash / 3.5 Flash-Lite

### 비용 최적화 권장 사항

1. **등급별 사용**: 간단한 작업에는 저렴한 모델을, 복잡한 작업에는 고급 모델을 사용하십시오.
2. **테스트 최적화**: 먼저 소형 모델로 테스트를 진행하고, 요구 사항이 확정된 후 대형 모델을 사용하십시오.
3. **배치 처리**: 유사한 작업이 대량으로 발생하는 경우 Luna / Lite / Mini 등급을 선택하십시오.
4. **캐시 재사용**: 각 벤더의 컨텍스트 캐시를 적극 활용하십시오 (Kimi K3, Seed 2.1 Turbo 및 Claude 시리즈는 캐시된 입력에 대해 최저 1/10 수준으로 과금합니다).
5. **불필요한 추론 끄기**: 일부 모델은 기본적으로 추론을 수행하므로 (Seed 2.1 Turbo, Gemini Flash 시리즈, Qwen3.8-Max), 빈도가 높은 간단한 질의응답에서는 이를 비활성화하여 비용과 시간을 모두 절약할 수 있습니다.

## 🔗 관련 자료

* [모델 가격 개요](/en/models) - 실시간 가격이 포함된 전체 모델 목록
* [모델 비교 테스트](https://imagen.apiyi.com/) - 이미지 생성 효과 비교
* [실시간 가격 조회](https://www.apiyi.com/account/pricing) - 최신 가격 정보
* [API 문서](/ko/api-manual) - 상세 인터페이스 사양
* [빠른 시작](/ko/getting-started) - 통합 가이드

<Note>
  모델 목록은 지속적으로 업데이트됩니다. 새로 출시된 우수한 모델은 신속히 추가할 예정입니다. 최신 출시 소식은 [변경 로그](/en/changelog)를 참고하십시오. 특정 모델 요구 사항이나 대량 요청이 필요하시면 고객센터에 문의해 주십시오.
</Note>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.