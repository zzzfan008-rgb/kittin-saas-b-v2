> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 및 동영상 생성 모델

> 지원되는 이미지 및 동영상 생성 AI 모델의 가격과 사용 지침을 확인합니다.

APIYI는 여러 이미지 및 동영상 생성 모델을 지원합니다. 이 페이지에서는 자세한 모델 정보, 가격, 사용 방법을 제공합니다.

<Tip>
  텍스트 및 멀티모달 모델은 [인기 모델](/ko/api-capabilities/model-info)을 방문하십시오.
</Tip>

## 🎨 이미지 생성 모델

| 모델명 | 상태 | 기능 | 해상도/사양 | 가격 |
| - | - | - | - | - |
| [**Nano Banana Pro**](/en/api-capabilities/nano-banana-image-edit) 🔥 | 베스트셀러 | 지식 이해, 뛰어난 중국어 텍스트 처리, 정밀 편집 | 1K/2K/4K, 원본 비율 편집 지원 | \$0.09/이미지 |
| [**Nano Banana 2**](/en/api-capabilities/nano-banana-2-image) 🔥 | 인기, 빠름 | Pro와 동일, 사용량 기반 과금 지원 | 0.5K-4K, 새로운 1:8 및 8:1 비율(긴 이미지) | \$0.055/이미지 (사용량 기반 \$0.025-0.07) |
| [**Nano Banana Lite**](/ko/api-capabilities/nano-banana-lite-image/overview) 🆕 | 신규, 최고 속도 및 최저가 | Google 최고 속도 및 최저가, 약 4초 출력, NB2 대비 약 2.7배 빠름, 1K 특화 | 1K, 14가지 화면 비율 | \$0.025/이미지 (사용량 기반 약 \$0.018) |
| [**gpt-image-2.5-flare**](/ko/api-capabilities/gpt-image-2/overview) 🆕 | 2026년 9월 신규, 공식 | OpenAI GPT-Image 2.5 속도 우선형: gpt-image-2보다 높은 품질과 최대 50% 낮은 지연 시간, 정밀한 크기/품질 제어(`xhigh` / `max` 추가), 자동 고충실도 참조, 마스크 인페인팅 | 1K/2K/**4K** (모든 유효한 크기) | token 과금, gpt-image-2와 동일한 가격, 충전 프로모션 기간 동안 약 15% 할인 |
| [**gpt-image-2.5-sunburst**](/ko/api-capabilities/gpt-image-2/overview) 🆕 | 2026년 9월 신규, 공식 | OpenAI GPT-Image 2.5 품질 및 편집 정밀도 우선형: 더욱 강력한 다중 턴 편집 및 피사체 보존, flare와 동일한 매개변수 | 1K/2K/**4K** (모든 유효한 크기) | token 과금, gpt-image-2와 동일한 가격 |
| [**gpt-image-2**](/ko/api-capabilities/gpt-image-2/overview) | 공식, 이전 세대 | OpenAI 공식, 정밀한 크기/품질 제어(최대 `high`), 자동 고충실도 참조, 마스크 인페인팅 | 1K/2K/**4K** (모든 유효한 크기) | token 과금, 표준 요율, 충전 프로모션 기간 동안 약 15% 할인 |
| [**gpt-image-2.5-all / 2-all**](/ko/api-capabilities/gpt-image-2-all/overview) 🔥 | 인기, 리버스 | ChatGPT 웹 라인의 GPT 리버스, 현재 Images 2.5 기반, 두 모델명 모두 가격과 동작이 동일하며 신규 프로젝트에는 `gpt-image-2.5-all` 사용 권장, 강력한 텍스트 정확도, 네이티브 중국어 지원, 더 빠른 출력(약 30\~60초), prompt로 크기 지정 | 1K–1.5K (prompt로 제어) | \$0.025/이미지 (호출당) |
| [**gpt-image-2.5-flare-vip / sunburst-vip**](/ko/api-capabilities/gpt-image-2-vip/overview) 🆕 | 2026년 9월 신규, 리버스 | GPT-Image 2.5의 Adobe 라인 리버스: -vip와 동일한 호출 방식, `size`로 **4K**를 포함한 30가지 프리셋 고정 지원 및 투명 배경을 포함한 6개 `quality` 티어 전체(`xhigh` / `max` 포함) 제공, 별칭 `gpt-image-2.5-vip` | 1K/2K/**4K** (30개 크기 일괄 적용) | \$0.03/이미지 (호출당) |
| [**gpt-image-2-vip**](/ko/api-capabilities/gpt-image-2-vip/overview) | 리버스 | Adobe 라인(Firefly)의 GPT 리버스, -all과 동일한 호출 형식, `size` 필드로 크기 고정, **4K**를 포함한 30가지 명시적 크기 지원, 약 90\~150초 | 1K/2K/**4K** (30개 크기, 균일가) | \$0.03/이미지 (호출당, 4K 추가 요금 없음) |
| [**Nano Banana**](/en/api-capabilities/nano-banana-image) | 이용 가능 | 빠름, 뛰어난 일관성, 전자상거래 편집 | 다양한 크기 | \$0.02/이미지 |
| [**Seedream 5.0 Pro**](/ko/api-capabilities/seedream-image/overview) 🆕 | 신규, Pro 티어 | 패밀리 제품군 중 최고의 이미지 품질 및 복잡한 지시문 준수 능력, 대화형 편집(좌표 / 선택 영역 상자 / 화살표), 최대 10장의 참조 이미지 지원, png 출력, 이미지당 약 2분 소요, 일상적인 작업에는 5.0 Lite 권장 | 1K/2K (총 픽셀 수 ≤ 4.19M, 3K/4K 미지원, 배치 시퀀스 및 스트리밍 미지원) | \$0.12/호출 |
| [**Seedream 5.0 Flash**](/ko/api-capabilities/seedream-image/overview) 🆕 | 2026년 9월 신규, 패밀리 내 최저가 | BytePlus 고속 티어, 이미지당 약 15\~20초, 정확한 중국어 타이포그래피, 참조 이미지 무료, 배치 시퀀스 및 스트리밍 미지원, 기본 워터마크 포함(해제 시 `watermark: false` 전달) | 다양한 크기 | \$0.018/이미지 |
| [**Seedream 5.0 Lite**](/en/api-capabilities/seedream-image) | 이용 가능 | 가격 경쟁력, 빠름, URL 출력 | 2K/3K | \$0.035/이미지 |
| [**Seedream 4.5**](/en/api-capabilities/seedream-image) | 이용 가능 | 가격 경쟁력, 빠름, URL 출력 | 2K/4K | \$0.04/이미지 |
| [**Seedream 4.0**](/en/api-capabilities/seedream-image) | 이용 가능 | 가격 경쟁력, 빠름, URL 출력 | 2K | \$0.035/이미지 |
| [**GPT Image 1.5**](/en/news/gpt-image-1-5-launch) 🔥 | 공식 | 정밀 편집, 4배 속도 향상, 향상된 텍스트 렌더링 | Low/Med/High 품질 | 사용량 기반 |
| [**GPT Image 1**](/en/api-capabilities/gpt-image-1) | 공식 | 정밀 편집 | 다양한 크기 | 사용량 기반 |
| **GPT Image 1-Mini** | 공식 | sora\_image의 대안 | 다양한 크기 | 사용량 기반 |
| [**Grok Imagine 2**](/ko/api-capabilities/grok-imagine-image/overview) 🆕 | 신규, 🔒 신청 필요 | xAI의 2세대 이미지 모델, 표준 `grok-imagine-image` / 고품질 `grok-imagine-image-quality` 제공, 5가지 화면 비율, 호출당 최대 10장 이미지 생성, 진정한 참조 편집 기능 지원, 전용 `Grok_imagine` 그룹 필요 | 1K/2K (동일 가격) | 이미지당 \$0.02 / \$0.045 |
| [**flux-2-max**](/ko/api-capabilities/flux/overview) 🆕 | 최신 세대 (FLUX.2) | FLUX.2 플래그십, 고품질 출력 | 다양한 크기 | \$0.07/호출 |
| [**flux-2-pro**](/ko/api-capabilities/flux/overview) 🆕 | 최신 세대 (FLUX.2) | FLUX.2 pro, 품질과 가격의 균형 | 다양한 크기 | \$0.03/호출 |
| [**flux-2-flex**](/ko/api-capabilities/flux/overview) 🆕 | 최신 세대 (FLUX.2) | FLUX.2 flex, 매개변수 조정 가능 | 다양한 크기 | \$0.06/호출 |
| [**flux-2-klein-4b / 9b**](/ko/api-capabilities/flux/overview) | 최신 세대 (FLUX.2) | FLUX.2 경량형, 1초 미만 출력, 최대 4장의 참조 이미지 지원 | 다양한 크기 | \$0.01/호출 |
| [**Flux Kontext Pro**](/en/api-capabilities/flux-image-generation) | 이용 가능 | 이미지 편집 | 다양한 크기 | 문서 참조 |
| [**Flux Kontext Max**](/en/api-capabilities/flux-image-generation) | 이용 가능 | 고품질 이미지 편집 | 다양한 크기 | 문서 참조 |

<Note>모델 가격은 공식 사이트의 가격과 연동되어 함께 변동될 수 있습니다. 위 표는 참고용일 뿐이며 상단 내비게이션의 **모델 요금** 탭의 내용이 기준이 됩니다: [모델 요금](/en/models/index).</Note>

<Info>
  **Nano Banana Pro 특가**: 1K\~4K의 모든 해상도를 \$0.09/이미지의 단일 가격으로 제공합니다. 공식 4K 가격은 \$0.24/이미지로, 공식 가격 대비 약 38% 수준입니다! 1.4배 요율(\$0.126/이미지)로 제공되는 NanoBananaEnterprise 엔터프라이즈 HA 채널도 이용 가능합니다. [자세히 보기](/en/news/nano-banana-pro-launch)
</Info>

<Tip>
  **이미지 생성 테스트 도구**

  * 중국 내 접속: <a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * 글로벌 접속: <a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  상세 문서:

  * [Nano Banana Pro 문서](/en/api-capabilities/nano-banana-image-edit) - 플랫폼 최고 품질, 지식 이해 + 정밀 편집
  * [Nano Banana 2 문서](/en/api-capabilities/nano-banana-2-image) - 사용량 기반 과금, 새로운 울트라 와이드 비율
  * [gpt-image-2.5-all / 2-all 문서](/ko/api-capabilities/gpt-image-2-all/overview) - ChatGPT 웹 라인의 GPT 리버스(현재 Images 2.5 기반), \$0.025/이미지, 약 30\~60초의 더 빠른 출력
  * [gpt-image-2-vip 문서](/ko/api-capabilities/gpt-image-2-vip/overview) - Adobe 라인(Firefly)의 GPT 리버스, \$0.03/이미지, 4K를 포함한 30가지 크기, 약 90\~150초
  * [GPT-Image-2.5 / 2 문서](/ko/api-capabilities/gpt-image-2/overview) - OpenAI 공식 3종(2.5-flare / 2.5-sunburst / 2), 네이티브 4K, 정밀한 크기/품질 제어
  * [⚖️ 공식 vs 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2 대 리버스 제품군 -all / -vip 선택 가이드
  * [Nano Banana 문서](/en/api-capabilities/nano-banana-image) - 빠름, 뛰어난 일관성
  * [Nano Banana Lite 문서](/ko/api-capabilities/nano-banana-lite-image/overview) - 최고 속도 및 최저가, 약 4초 출력, 호출당 \$0.025/이미지
  * [Seedream 문서](/en/api-capabilities/seedream-image) - 가격 경쟁력, 빠름, 5.0 Flash(\$0.018/이미지, 약 15\~20초) 및 5.0 Pro 티어(\$0.12/호출, 이미지당 약 2분) 포함
  * [Grok Imagine 2 문서](/ko/api-capabilities/grok-imagine-image/overview) - xAI 2세대 이미지 모델, 이미지당 \$0.02 / \$0.045, 신청 시 전용 그룹 제공
  * [GPT Image 1.5 문서](/en/news/gpt-image-1-5-launch) - 4배 속도 향상, 정밀 편집
  * [GPT Image 1 문서](/en/api-capabilities/gpt-image-1) - 공식 이미지 생성
  * [FLUX.2 문서](/ko/api-capabilities/flux/overview) - klein / pro / flex / max 전체 라인업, 텍스트-이미지 변환 및 다중 이미지 융합
  * [Flux Kontext 문서](/en/api-capabilities/flux-image-generation) - 이미지 편집
</Tip>

## 🎬 동영상 생성 모델

| 모델명 | 상태 | 주요 기능 | 재생 시간 | 가격 |
| - | - | - | - | - |
| [**Seedance 2.5 / 2.0 시리즈**](/ko/api-capabilities/seedance2/overview) 🔥 | 서비스 중, 인기 | ByteDance, 공식 Volcengine 중국 리소스, **2.5** 및 2.0 standard / `fast` / `mini` 병행 제공 — 텍스트 투 비디오, 첫/마지막 프레임, 멀티모달 참조(이미지 + 동영상 + 오디오), 동영상 편집 및 확장, **기본 오디오 동기화**, 비공개 에셋 라이브러리 무료 제공 | 2.5는 4~~30초, 2.0 제품군은 4~~15초 (480p/720p/1080p, 1080p는 2.5 및 standard 전용) | token 과금(면적 × 재생 시간), 720p/5초 실측 기준: \$0.45 (mini) / \$0.73 (fast) / \$0.91 (standard) / \$1.35 (2.5) |
| [**Wan2.7 Video**](/ko/api-capabilities/wan/overview) 🆕 | 신규, 추천 | Alibaba Wanxiang, 텍스트/이미지/참조/동영상 편집 생성, i2v 오디오 구동 지원 | 초당 과금(최대 12초) | 초당 \$0.084-0.14(공식 가격의 98%) |
| [**Wan2.6 Video**](/ko/api-capabilities/wan/historical-versions) | 이용 가능 | Wan2.7과 엔드포인트 공유, `r2v-flash` 저지연 티어 포함 | 초당 과금 | 콘솔 참조 |
| [**VEO 3.1 Official**](/ko/api-capabilities/veo-3-1-official/overview) 🔥 | 서비스 중, 인기(리버스 대체) | Google AI Studio 공식 엔드포인트 직결 패스스루, 오디오-비디오 동기화, 실제 인물 지원, 기본 그룹에서 호출 가능 | 4/6/8초 | 호출당 \$0.3 / \$1.2 (720p/1080p/4k 동일 가격) |
| **Veo 3.1 Reverse** | ⏸️ 일시 중단(Google 리스크 관리) | Google Flow 리버스, 중단 기간에는 **VEO 3.1 Official** 사용 | 8초 고정 | 이용 불가 |
| **Sora 2 Official** | ⏸️ 서비스 종료 | OpenAI 공식 릴레이, 전문 창작용, 높은 안정성, sora-2-pro 지원, "character" 참조 미지원 | 4/8/12초 | 이용 불가 |
| [**HappyHorse 1.1**](/ko/api-capabilities/happyhorse/overview) 🆕 | 신규 | Alibaba, 다중 참조 피사체 일관성(최대 9장 이미지), Wan과 그룹 공유 | 초당 과금(최대 12초) | 초당 \$0.126-0.224(공식 가격의 98%) |
| [**MiniMax H3**](/ko/api-capabilities/minimax-h3/overview) 🆕 | 2026년 9월 신규, 자체 호스팅 오픈 가중치 | 자체 배포 오픈 가중치 기반 Hailuo 3.0, 텍스트·첫/마지막 프레임·이미지/동영상/오디오 혼합 참조를 단일 엔드포인트에서 지원, 스테레오 사운드, 768P, 참조 미디어 무료, 기본 그룹 | 4–15초 | 초당 \$0.03 |
| [**Oxygen**](/ko/api-capabilities/oxygen/overview) 🆕 | 2026년 10월 신규, 대량 생성 특화 | AZ8의 자체 범용 동영상 모델, OpenAI Videos 호환: 텍스트, 첫 프레임, 첫/마지막 프레임, 참조 이미지 + 동영상 + 오디오 지원, 오디오 내장, 320p–768p 단일 가격, 기본 그룹 | 4–15초 | 초당 \$0.02 |
| ~~**Sora 2 Reverse**~~ | ❌ 서비스 종료 | 기존 전자상거래/애니메이션 시나리오용, 대신 Sora 2 Official 사용 권장 | — | — |

<Note>모델 가격은 공식 사이트 기준에 맞춰 책정되며 변동될 수 있습니다. 위 표는 참고용일 뿐이며, 상단 내비게이션의 **모델 요금** 탭 정보가 우선합니다: [모델 요금](/en/models/index).</Note>

<Info>
  **동영상 모델 주요 특징**:

  * **Seedance 2.5 / 2.0 시리즈 (ByteDance)**: `doubao-seedance-2-5-260628`(2.5 — 최대 30초, 참조 이미지 30장, mov 출력) / `doubao-seedance-2-0-260128`(standard) / `-fast-260128`(fast) / `-mini-260615`(mini) — 가격과 속도가 서로 다르며(mini \< fast \< standard \< 2.5, 2.5는 standard의 약 1.5배), mini와 fast는 최대 720p까지 지원합니다. **4개 모델 모두 `SeeDance2` 그룹**(0.18배)에서 실행되므로 하나의 token으로 모두 이용할 수 있습니다. 해당 token의 과금 모드는 "usage-first" 또는 "usage-based"여야 합니다.
  * **VEO 3.1 Official**: Google AI Studio 공식 엔드포인트 직결 패스스루, 업계 최고 수준의 오디오-비디오 동기화, 실제 인물 지원, 기본 그룹 + 호출당/usage-first tokens으로 호출 가능하며, Veo 3.1 Reverse 일시 중단 중 권장 대체 모델입니다.
  * **Veo 3.1 Reverse**: Google 리스크 관리로 인해 **일시 중단**되었으며, 복구 시점은 미정입니다. 중단 기간 동안 VEO 3.1 Official 사용을 권장합니다.
  * **Sora 2 Official**: 서비스가 종료되어 현재 이용할 수 없습니다.
  * **Wan2.7 / Wan2.6 (Alibaba Wanxiang)**: 기본 가격은 공식의 약 98% 수준이며, 두 시리즈 모두 HappyHorse와 `Wan&HappyHorse` 그룹을 공유하므로 하나의 token으로 모두 이용할 수 있습니다. Wan2.6과 Wan2.7은 동일한 엔드포인트 및 스키마를 공유하므로 `model` 이름만 변경하여 이전할 수 있습니다.
  * **HappyHorse 1.1 (Alibaba)**: 다중 참조 피사체 일관성에 뛰어나며, Wan과 `Wan&HappyHorse` 그룹 및 엔드포인트를 공유합니다.
  * **MiniMax H3 (자체 호스팅 오픈 가중치)**: `MiniMax-H3`(`POST /hailuo/v2/video_generation` 기반), 최대 9장의 참조 이미지 + 3개의 참조 동영상 + 3개의 참조 오디오 클립 지원, 요청 재생 시간 기준 과금. 현재 2K는 지원되지 않으며 `Idempotency-Key` 헤더는 영향을 주지 않으므로 애플리케이션 레벨에서 멱등성을 처리해야 합니다.
  * **Oxygen (AZ8)**: `oxygen-1.0`(`POST /v1/videos` 기반). 항상 `size`을(를) 전달해야 하며(그렇지 않으면 세로 모드가 기본값임), 첫/마지막 프레임, 참조 미디어, 320p 및 기타 고급 옵션은 `input_reference` 내부의 JSON 엔벨로프에 넣어야 합니다. 실패한 작업은 자동으로 전액 환불됩니다.
  * AI 동영상 툴(온라인 테스트): <a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **출시 예정 동영상 모델**:

  * Kling 3.0

  많은 기대 부탁드립니다! 최신 출시 알림을 받아보려면 팔로우해 주세요.
</Note>

## 💰 가격 정보

* **사용량 기반 과금**: 실제 사용량에 따라 과금되며, 최소 과금액은 없습니다
* **잔액 유효 기간**: 충전일로부터 365일 동안 유효하며, 다음 충전 시 자동으로 초기화됩니다(자세한 내용은 [충전 프로모션](/ko/faq/recharge-promotions) 참조)
* 모든 모델의 최신 가격은 [APIYI 콘솔 가격 페이지](https://www.apiyi.com/account/pricing)를 방문해 확인하십시오


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.