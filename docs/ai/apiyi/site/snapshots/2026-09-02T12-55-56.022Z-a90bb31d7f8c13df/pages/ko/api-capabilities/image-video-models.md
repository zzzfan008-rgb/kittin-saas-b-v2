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

| 모델 이름                                                                           | 상태               | 기능                                                                                                                        | 해상도/사양                                           | 가격                                        |
| ------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| [**Nano Banana Pro**](/en/api-capabilities/nano-banana-image-edit) 🔥           | 베스트셀러            | 지식 이해, 우수한 중국어 텍스트, 정밀 편집                                                                                                 | 1K/2K/4K, 원본 비율 편집 지원                            | \$0.09/image                              |
| [**Nano Banana 2**](/en/api-capabilities/nano-banana-2-image) 🔥                | 인기, 빠름           | Pro와 동일, 사용량 기반 과금 지원                                                                                                     | 0.5K-4K, 새로운 1:8 및 8:1 비율(긴 이미지)                 | \$0.055/image (사용량 기반 \$0.025-0.07)       |
| [**Nano Banana Lite**](/ko/api-capabilities/nano-banana-lite-image/overview) 🆕 | 신규, 가장 빠르고 가장 저렴 | Google의 가장 빠르고 가장 저렴한 모델, 약 4초 출력, NB2보다 약 2.7배 빠름, 1K 중심                                                                 | 1K, 14개 종횡비                                      | \$0.025/image (사용량 기반 \~\$0.018)          |
| [**gpt-image-2**](/ko/api-capabilities/gpt-image-2/overview) 🆕                 | 신규, 공식           | OpenAI 플래그십 공식 모델, 정밀한 크기/품질 제어, 고충실도 참조 자동 적용, 마스크 인페인팅                                                                  | 1K/2K/**4K**(유효한 모든 크기)                          | Token 기준 과금, 표준 요율; 충전 프로모션 기간에는 약 15% 할인 |
| [**gpt-image-2-all**](/ko/api-capabilities/gpt-image-2-all/overview) 🔥         | 인기, 리버스          | GPT 리버스 ChatGPT-web 라인, 뛰어난 텍스트 충실도, 중국어 네이티브, 더 빠른 출력(\~30–60초), prompt에서 크기 지정                                          | 1K-2K(prompt 제어)                                 | \$0.03/image(호출당)                         |
| [**gpt-image-2-vip**](/ko/api-capabilities/gpt-image-2-vip/overview) 🆕         | 신규, 리버스          | GPT 리버스 Codex 라인, -all과 동일한 호출 형식, `size` 필드가 크기를 고정하며, 4K를 포함한 30개의 명시적 크기, \~90–150초                                    | 1K/2K/**4K**(30개 크기, 고정 가격)                      | \$0.03/image(호출당, 4K 추가 요금 없음)            |
| [**Nano Banana**](/en/api-capabilities/nano-banana-image)                       | 사용 가능            | 빠름, 뛰어난 일관성, 이커머스 편집                                                                                                      | 여러 크기                                            | \$0.02/image                              |
| [**Seedream 5.0 Pro**](/ko/api-capabilities/seedream-image/overview) 🆕         | 신규, Pro 티어       | 제품군 중 최고 수준의 이미지 품질과 복잡한 지시 이행, 인터랙티브 편집(좌표 / 선택 박스 / 화살표), 참조 이미지 최대 10장, png 출력; 이미지당 약 2분, 5.0 Lite는 여전히 일상 작업의 선택지입니다 | 1K/2K(총 픽셀 ≤ 4.19M, 3K/4K 없음; 배치 시퀀스 또는 스트리밍 없음) | \$0.12/call                               |
| [**Seedream 5.0 Lite**](/en/api-capabilities/seedream-image)                    | 사용 가능            | 가격 경쟁력, 빠름, URL 출력                                                                                                        | 2K/3K                                            | \$0.035/image                             |
| [**Seedream 4.5**](/en/api-capabilities/seedream-image)                         | 사용 가능            | 가격 경쟁력, 빠름, URL 출력                                                                                                        | 2K/4K                                            | \$0.04/image                              |
| [**Seedream 4.0**](/en/api-capabilities/seedream-image)                         | 사용 가능            | 가격 경쟁력, 빠름, URL 출력                                                                                                        | 2K                                               | \$0.035/image                             |
| [**GPT Image 1.5**](/en/news/gpt-image-1-5-launch) 🔥                           | 공식               | 정밀 편집, 4배 속도 향상, 향상된 텍스트 렌더링                                                                                              | 낮음/보통/높음 품질                                      | 사용량 기반                                    |
| [**GPT Image 1**](/en/api-capabilities/gpt-image-1)                             | 공식               | 정밀 편집                                                                                                                     | 여러 크기                                            | 사용량 기반                                    |
| **GPT Image 1-Mini**                                                            | 공식               | sora\_image의 대안                                                                                                           | 여러 크기                                            | 사용량 기반                                    |
| [**flux-2-max**](/ko/api-capabilities/flux/overview) 🆕                         | 최신 세대(FLUX.2)    | FLUX.2 플래그십, 고품질 출력                                                                                                       | 여러 크기                                            | \$0.07/call                               |
| [**flux-2-pro**](/ko/api-capabilities/flux/overview) 🆕                         | 최신 세대(FLUX.2)    | FLUX.2 pro, 품질/가격 균형                                                                                                      | 여러 크기                                            | \$0.03/call                               |
| [**flux-2-flex**](/ko/api-capabilities/flux/overview) 🆕                        | 최신 세대(FLUX.2)    | FLUX.2 flex, 조정 가능한 매개변수                                                                                                  | 여러 크기                                            | \$0.06/call                               |
| [**Flux Kontext Pro**](/en/api-capabilities/flux-image-generation)              | 사용 가능            | 이미지 편집                                                                                                                    | 여러 크기                                            | 문서 참조                                     |
| [**Flux Kontext Max**](/en/api-capabilities/flux-image-generation)              | 사용 가능            | 고품질 이미지 편집                                                                                                                | 여러 크기                                            | 문서 참조                                     |

<Info>
  **Nano Banana Pro 특별 혜택**: 1K-4K의 모든 해상도를 동일 가격인 \$0.09/image으로 제공합니다. 공식 4K 가격은 \$0.24/image로 — 공식 가격의 약 38%입니다! NanoBananaEnterprise 엔터프라이즈 HA 채널도 1.4배 요율(\$0.126/image)로 제공됩니다. [자세히 보기](/en/news/nano-banana-pro-launch)
</Info>

<Tip>
  **이미지 생성 테스트 도구**

  * 중국 접속: <a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * 글로벌 접속: <a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  상세 문서:

  * [Nano Banana Pro 문서](/en/api-capabilities/nano-banana-image-edit) - 플랫폼 최고, 지식 이해 + 정밀 편집
  * [Nano Banana 2 문서](/en/api-capabilities/nano-banana-2-image) - 사용량 기반 과금, 새로운 초광각 비율
  * [gpt-image-2-all 문서](/ko/api-capabilities/gpt-image-2-all/overview) - GPT 리버스 ChatGPT-web 라인, \$0.03/image, \~30–60초 더 빠른 출력
  * [gpt-image-2-vip 문서](/ko/api-capabilities/gpt-image-2-vip/overview) - GPT 리버스 Codex 라인, \$0.03/image, 4K 포함 30개 크기, \~90–150초
  * [gpt-image-2 문서](/ko/api-capabilities/gpt-image-2/overview) - OpenAI 공식, 네이티브 4K, 정밀한 크기/품질 제어
  * [⚖️ 공식 vs 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2와 리버스 계열 -all / -vip 선택 가이드
  * [Nano Banana 문서](/en/api-capabilities/nano-banana-image) - 빠름, 뛰어난 일관성
  * [Nano Banana Lite 문서](/ko/api-capabilities/nano-banana-lite-image/overview) - 가장 빠르고 가장 저렴, 약 4초 출력, 호출당 \$0.025/image
  * [Seedream 문서](/en/api-capabilities/seedream-image) - 가격 경쟁력, 빠름; 5.0 Pro 티어 포함(\$0.12/call, 이미지당 약 2분)
  * [GPT Image 1.5 문서](/en/news/gpt-image-1-5-launch) - 4배 속도 향상, 정밀 편집
  * [GPT Image 1 문서](/en/api-capabilities/gpt-image-1) - 공식 이미지 생성
  * [Flux 문서](/en/api-capabilities/flux-image-generation) - 이미지 편집
</Tip>

## 🎬 동영상 생성 모델

| 모델 이름                                                                    | 상태                     | 기능                                                                                                                                                                                    | 지속 시간                                                                      | 가격                                                                                                       |
| ------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [**Seedance 2.5 / 2.0 시리즈**](/ko/api-capabilities/seedance2/overview) 🔥 | 운영 중, 인기               | ByteDance, 공식 Volcengine 중국 리소스 사용; **2.5**와 2.0 standard / `fast` / `mini`를 병렬로 지원 — 텍스트-동영상, 시작/끝 프레임, 멀티모달 참조(이미지 + 동영상 + 오디오), 동영상 편집 및 확장, **기본 동기화 오디오 제공**, 비공개 에셋 라이브러리 무료 포함 | 2.5에서 4–30초, 2.0 제품군에서 4–15초(480p/720p/1080p; 1080p는 2.5 및 standard에서만 지원) | token 기준 과금(면적 × 지속 시간); 720p/5초 측정 기준: \$0.45 (mini) / \$0.73 (fast) / \$0.91 (standard) / \$1.35 (2.5) |
| [**Wan2.7 동영상**](/ko/api-capabilities/wan/overview) 🆕                   | 신규, 권장                 | Alibaba Wanxiang, 텍스트/이미지/참조/동영상 편집 생성, i2v에서 오디오 기반 구동 지원                                                                                                                            | 초당(최대 12초)                                                                 | \$0.084-0.14/초(공식 가격의 98%)                                                                               |
| [**Wan2.6 동영상**](/ko/api-capabilities/wan/historical-versions)           | 사용 가능                  | Wan2.7과 엔드포인트를 공유하며 `r2v-flash` 저지연 등급 포함                                                                                                                                             | 초당                                                                         | 콘솔 참조                                                                                                    |
| [**VEO 3.1 공식**](/ko/api-capabilities/veo-3-1-official/overview) 🔥      | 운영 중, 인기(리버스 대안)       | Google AI Studio 공식 엔드포인트로 패스스루, 오디오-동영상 동기화, 실제 인물 지원, 기본 그룹에서 호출 가능                                                                                                                 | 4/6/8초                                                                     | 호출당 \$0.3 / \$1.2 (720p/1080p/4k 동일 가격)                                                                  |
| **Veo 3.1 Reverse**                                                      | ⏸️ 일시 중지(Google 위험 관리) | Google Flow 리버스 방식; 일시 중지 기간에는 **VEO 3.1 공식** 사용                                                                                                                                      | 고정 8초                                                                      | 사용 불가                                                                                                    |
| **Sora 2 공식**                                                            | ⏸️ 중단                  | OpenAI 공식 릴레이, 전문적인 제작, 높은 안정성, sora-2-pro 지원, “캐릭터” 참조 미지원                                                                                                                           | 4/8/12초                                                                    | 사용 불가                                                                                                    |
| [**HappyHorse 1.1**](/ko/api-capabilities/happyhorse/overview) 🆕        | 신규                     | Alibaba, 멀티 참조 주제 일관성(최대 이미지 9장), Wan과 그룹 공유                                                                                                                                          | 초당(최대 12초)                                                                 | \$0.126-0.224/초(공식 가격의 98%)                                                                              |
| ~~**Sora 2 Reverse**~~                                                   | ❌ 중단                   | 이전에는 전자상거래 / 애니메이션 시나리오에 사용되었으며, 대신 Sora 2 공식 사용                                                                                                                                      | —                                                                          | —                                                                                                        |

<Info>
  **동영상 모델 주요 기능**:

  * **Seedance 2.5 / 2.0 시리즈(ByteDance)**: `doubao-seedance-2-5-260628` (2.5 — 최대 30초, 참조 이미지 30장, mov 출력) / `doubao-seedance-2-0-260128` (standard) / `-fast-260128` (fast) / `-mini-260615` (mini) — 가격과 속도가 서로 다릅니다(mini \< fast \< standard \< 2.5이며, 2.5는 standard의 약 1.5배). mini와 fast는 최대 720p까지 지원합니다. **네 모델 모두 `SeeDance2` 그룹**(0.18x)에서 실행되므로 하나의 token으로 모두 사용할 수 있습니다. token의 과금 모드는 “usage-first” 또는 “usage-based”여야 합니다. `SD2Mini` (0.10x) 및 `SD2Fast` (0.15x)는 기간 한정 할인 그룹입니다 — **mini는 44.4%, fast는 16.7% 할인되며, 2026-09-07 23:59 (UTC+8)까지 적용됩니다**. 이후 요율은 0.18x로 돌아가며 그룹은 계속 사용할 수 있습니다.
  * **VEO 3.1 공식**: Google AI Studio 공식 엔드포인트로 패스스루, 업계 최고 수준의 오디오-동영상 동기화, 실제 인물 지원, 기본 그룹 + 호출당/usage-first token으로 호출 가능, Veo 3.1 Reverse가 일시 중지된 동안 권장되는 대안
  * **Veo 3.1 Reverse**: Google 위험 관리로 인해 **일시 중지**되었으며, 복구 시점은 추후 공지됩니다. 그동안 VEO 3.1 공식를 사용하시기 바랍니다.
  * **Sora 2 공식**: 중단되었으며 현재 사용할 수 없습니다.
  * **Wan2.7 / Wan2.6(Alibaba Wanxiang)**: 기본 가격은 공식 가격의 약 98%이며, 두 시리즈 모두 HappyHorse와 `Wan&HappyHorse` 그룹을 공유하므로 하나의 token으로 모두 사용할 수 있습니다. Wan2.6과 Wan2.7은 동일한 엔드포인트와 스키마를 공유하며, 마이그레이션하려면 `model` 이름만 변경하면 됩니다.
  * **HappyHorse 1.1(Alibaba)**: 멀티 참조 주제 일관성에 강점이 있으며, Wan과 `Wan&HappyHorse` 그룹 및 엔드포인트를 공유합니다.
  * AI 동영상 도구(온라인 테스트): <a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **출시 예정 동영상 모델**:

  * Kling 3.0

  계속 관심 있게 지켜봐 주시기 바랍니다! 최신 출시 알림을 받으려면 저희를 팔로우하시기 바랍니다.
</Note>

## 💰 가격 정보

* **사용량 기반 과금**: 실제 사용량에 따라 과금되며, 최소 과금액은 없습니다
* **잔액 유효 기간**: 충전일로부터 365일 동안 유효하며, 다음 충전 시 자동으로 초기화됩니다(자세한 내용은 [충전 프로모션](/ko/faq/recharge-promotions) 참조)
* 모든 모델의 최신 가격은 [APIYI 콘솔 가격 페이지](https://www.apiyi.com/account/pricing)를 방문해 확인하십시오
