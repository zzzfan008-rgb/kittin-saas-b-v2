> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 공식 vs 역방향 채널 비교

> VEO 3.1 공식(이 시리즈)과 기존 VEO 3.1(역방향 채널)의 전방위 비교 — 과금, 기능, 의사결정 트리, 시나리오별 추천.

<Info>
  APIYI는 Veo 3.1 채널 2개를 동시에 제공합니다. 이 페이지는 시나리오별로 **선택**하는 데 도움이 됩니다: 공식 품질 + 비동기 폴링 허용 → **공식**(이 시리즈); 비용에 민감하고 스트리밍 동기화 또는 프레임-투-비디오가 필요함 → **Reverse**([VEO 3.1](/en/api-capabilities/veo/overview)). 두 채널은 **같은 계정에서 충돌 없이 병행 사용**할 수 있습니다.
</Info>

## 전체 비교 매트릭스

| 항목           | **공식** (이 시리즈)                                               | **리버스** ([기존 VEO 3.1](/en/api-capabilities/veo/overview))       |
| ------------ | ------------------------------------------------------------ | --------------------------------------------------------------- |
| **채널 유형**    | Google AI Studio로의 투명한 패스스루                                  | Google Flow에 대한 리버스 엔지니어링 기반 접근                                 |
| **Model ID** | `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` | `veo-3.1` / `veo-3.1-fast` / `-landscape` / `-fl` 시리즈 (8개 변형)   |
| **과금 방식**    | 요청당 과금(지속 시간 / 해상도와 무관)                                      | 요청당 과금(지속 시간 / 해상도와 무관)                                         |
| **가격**       | \$0.3 (fast) / \$1.2 (standard)                              | \$0.15 (fast) / \$0.25 (standard) — **50–75% 저렴**               |
| **엔드포인트 경로** | `POST /v1/videos`만 사용 (비동기)                                  | `POST /v1/chat/completions` (스트리밍 동기) + `POST /v1/videos` (비동기) |
| **스트리밍 동기**  | ❌ 비동기 폴링만 지원                                                 | ✅ 실시간 진행 상황을 위한 `stream: true` 지원                               |
| **지속 시간**    | 4 / 6 / 8초 (문자열)                                             | 고정 8초                                                           |
| **해상도**      | 720p / 1080p / 4k (3단계)                                      | HD 가로형 (1280×720) / 세로형 (720×1280)                              |
| **참조 이미지**   | `input_reference`를 통한 1개 이미지 (multipart)                     | 1\~2개 이미지 (**`-fl` 시리즈로 프레임-투-동영상 지원**)                         |
| **가로 / 세로**  | `aspectRatio` 파라미터를 통해                                       | 모델 ID를 통해 (`-landscape` 시리즈)                                    |
| **그룹**       | `Default`                                                    | `Default`                                                       |
| **과금 모델**    | 요청당 과금 ✅ / 사용량 기반 우선순위 ✅ (순수 사용량 기반 ❌)                       | 요청당 과금 ✅ / 사용량 기반 우선순위 ✅                                        |
| **응답 필드**    | `id` / `task_id` / `status` / `progress` (대략적인 0/50/100)     | 동기: 전체 chat completion; 비동기: `task_id` / `status`               |
| **실패 시 과금**  | ❌ 과금되지 않음                                                    | ❌ 과금되지 않음                                                       |
| **오디오**      | 네이티브 동기화 오디오                                                 | 네이티브 동기화 오디오                                                    |
| **사용 시점**    | 공식 품질이 필요하고 비동기 폴링을 수용할 수 있는 프로덕션                            | 비용에 민감하고, 동기 UI 진행 상황이 필요하며, frame-to-video가 필요한 경우             |

## 3단계 의사결정 트리

<Steps>
  <Step title="Q1: frame-to-video 기능이 필요하십니까?">
    * **예** → **[VEO 3.1 (리버스)](/en/api-capabilities/veo/overview)** `-fl` 시리즈(예: `veo-3.1-landscape-fast-fl`)를 사용하십시오; 공식은 아직 frame-to-video를 제공하지 않습니다
    * **아니오** → Q2로 이동하십시오
  </Step>

  <Step title="Q2: 프런트엔드에 streaming 동기화 진행률 표시줄이 필요하십니까?">
    * **예** (사용자에게 보이는 UI가 비어 있으면 안 됩니다) → **[VEO 3.1 (리버스)](/en/api-capabilities/veo/overview)** `/v1/chat/completions` streaming 엔드포인트를 사용하십시오
    * **백엔드 담당** (큐 소비자, 배치 처리) → Q3로 이동하십시오
  </Step>

  <Step title="Q3: 예산 대 품질 우선순위는?">
    * **예산 우선** (\$0.15와 \$0.3의 차이가 중요함) → \*\*[VEO 3.1 (리버스)](/en/api-capabilities/veo/overview)\*\*를 사용하십시오, 가격이 50% 더 낮습니다
    * **품질 / 안정성 우선** (최종 납품, 4K, 강한 지시 준수) → **공식** (이 시리즈)와 함께 `veo-3.1-generate-preview`를 사용하십시오
    * **반복 / 미리보기** → **공식** `veo-3.1-fast-generate-preview` (\$0.3) 또는 **리버스** `-fast` (\$0.15)를 사용하십시오
  </Step>
</Steps>

## 시나리오별 추천

| 비즈니스 시나리오                     | 추천 채널   | 추천 모델                                        | 이유                       |
| ----------------------------- | ------- | -------------------------------------------- | ------------------------ |
| 쇼트 비디오 매트릭스 일괄 제작(하루 100개 이상) | **역방향** | `veo-3.1-landscape-fast`                     | \$0.15 단가, 통제 가능한 배치 비용  |
| 최종 고객 광고 전달                   | **공식**  | `veo-3.1-generate-preview`                   | 안정적인 공식 품질 + 4K 옵션       |
| 프론트엔드 실시간 표시(로딩 애니메이션 필요)     | **역방향** | `veo-3.1-landscape-fast` + 스트리밍 동기화          | 진행 상황이 보여 빈 대기 불안을 줄입니다  |
| 정적 포스터 + 프레임-투-비디오 → 모션 클립    | **역방향** | `veo-3.1-landscape-fast-fl`                  | 프레임-투-비디오 기능             |
| 4K 시네마틱 클립(히어로 에셋)            | **공식**  | `veo-3.1-generate-preview` + `resolution=4k` | 4K는 공식만 지원합니다            |
| 해외 팀 온보딩(기존 Key 변경 없음)        | **공식**  | `veo-3.1-fast-generate-preview`              | 기본 그룹 + 요청당 과금, 마찰이 없습니다 |
| 동일 prompt 멀티 시드 스타일 탐색        | **공식**  | `veo-3.1-fast-generate-preview`              | 4\~6초 옵션, 반복 비용이 낮음      |
| 반복 + 최종 전달 워크플로               | 혼합      | 역방향으로 빠르게 반복 → 공식 표준 최종                      | 저렴한 반복, 안정적인 전달          |

## 두 채널을 함께 사용할 수 있습니까?

**물론입니다**. 두 채널은 서로 독립적으로 라우팅됩니다.

* 동일한 계정에서는 **단일 Token**(Default 그룹에서)으로 두 채널을 동시에 호출할 수 있으며, 과금은 호출별로 추적됩니다
* 비즈니스 코드에서 필요에 따라 `model` 필드를 전환하십시오:
  * Official을 사용하려면 → `veo-3.1-fast-generate-preview` / `veo-3.1-generate-preview`
  * Reverse를 사용하려면 → `veo-3.1-fast` / `veo-3.1-landscape` / `veo-3.1-fl` 등

<Tip>
  **권장 설정**: “비즈니스 핵심 전달”은 Official로, “반복 / 배치 미리보기 / 동기화 UI”는 Reverse로 라우팅하십시오. 통합된 계정, 깔끔한 과금, 상호 보완적인 기능입니다.
</Tip>

## 관련 문서

* [VEO 3.1 공식 개요](/ko/api-capabilities/veo-3-1-official/overview) — 공식 채널 전체 소개
* [VEO 3.1 (Reverse) 개요](/en/api-capabilities/veo/overview) — 기존 Reverse 채널 전체 소개
* [VEO 3.1 공식 텍스트-투-비디오 플레이그라운드](/ko/api-capabilities/veo-3-1-official/text-to-video)
* [VEO 3.1 공식 이미지-투-비디오 플레이그라운드](/ko/api-capabilities/veo-3-1-official/image-to-video)
* [VEO 3.1 (Reverse) 빠른 시작](/en/api-capabilities/veo/quick-start) — 스트리밍 동기식 사용법
* [VEO 3.1 (Reverse) 비동기 API](/en/api-capabilities/veo/async-api) — 프레임-투-비디오 사용법 포함
