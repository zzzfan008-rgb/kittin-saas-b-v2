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

| 모델명                                                                                            | 상태               | 기능                                                                                                                                                      | 해상도/사양                                              | 가격                                                   |
| ---------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| [**Nano Banana Pro**](/en/api-capabilities/nano-banana-image-edit) 🔥                          | 베스트셀러            | 지식 이해, 뛰어난 중국어 텍스트, 정밀 편집                                                                                                                               | 1K/2K/4K, 원본 비율 편집 지원                               | \$0.09/이미지                                           |
| [**Nano Banana 2**](/en/api-capabilities/nano-banana-2-image) 🔥                               | 인기, 빠름           | Pro와 동일, 사용량 기반 과금 지원                                                                                                                                   | 0.5K-4K, 새로운 1:8 및 8:1 비율(긴 이미지)                    | \$0.055/이미지(사용량 기반 \$0.025-0.07)                     |
| [**Nano Banana Lite**](/ko/api-capabilities/nano-banana-lite-image/overview) 🆕                | 신규, 가장 빠르고 저렴함   | Google의 가장 빠르고 저렴한 모델, 약 4초 출력, NB2보다 약 2.7배 빠름, 1K 중심                                                                                                  | 1K, 14개 종횡비                                         | \$0.025/이미지(사용량 기반 약 \$0.018)                        |
| [**gpt-image-2.5-flare**](/ko/api-capabilities/gpt-image-2/overview) 🆕                        | 2026년 9월 신규, 공식  | OpenAI GPT-Image 2.5 속도 우선: gpt-image-2보다 높은 품질과 최대 50% 낮은 지연 시간, 정밀한 크기/품질 제어(`xhigh` / `max` 추가), 자동 고충실도 참조, 마스크 인페인팅                                | 1K/2K/**4K**(모든 유효 크기)                              | token 기반 과금, gpt-image-2와 동일 가격; 충전 프로모션 기간 약 15% 할인 |
| [**gpt-image-2.5-sunburst**](/ko/api-capabilities/gpt-image-2/overview) 🆕                     | 2026년 9월 신규, 공식  | OpenAI GPT-Image 2.5 품질 및 편집 정밀도 우선: 더욱 강력한 멀티턴 편집과 피사체 보존, flare와 동일한 파라미터                                                                             | 1K/2K/**4K**(모든 유효 크기)                              | token 기반 과금, gpt-image-2와 동일 가격                      |
| [**gpt-image-2**](/ko/api-capabilities/gpt-image-2/overview)                                   | 공식, 이전 세대        | OpenAI 공식, 정밀한 크기/품질 제어(최대 `high`), 자동 고충실도 참조, 마스크 인페인팅                                                                                                | 1K/2K/**4K**(모든 유효 크기)                              | token 기반 과금, 표준 요율; 충전 프로모션 기간 약 15% 할인              |
| [**gpt-image-2-all**](/ko/api-capabilities/gpt-image-2-all/overview) 🔥                        | 인기, 리버스          | GPT 리버스 ChatGPT-웹 라인, 강력한 텍스트 충실도, 네이티브 중국어, 더 빠른 출력(약 30–60초), prompt에서 크기 지정                                                                          | 1K-2K(prompt 제어)                                    | \$0.03/이미지(호출당)                                      |
| [**gpt-image-2.5-flare-vip / sunburst-vip**](/ko/api-capabilities/gpt-image-2-vip/overview) 🆕 | 2026년 9월 신규, 리버스 | GPT-Image 2.5의 Adobe 라인 리버스: -vip와 동일한 호출 방식, `size`로 **4K**를 포함한 30개 프리셋 고정, 투명 배경 및 6개 `quality` 티어 전체(`xhigh` / `max` 포함) 지원; 별칭 `gpt-image-2.5-vip` | 1K/2K/**4K**(30개 크기 전체 균일)                          | \$0.03/이미지(호출당)                                      |
| [**gpt-image-2-vip**](/ko/api-capabilities/gpt-image-2-vip/overview)                           | 리버스              | GPT 리버스 Adobe 라인(Firefly), -all과 동일한 호출 형식, `size` 필드로 크기 고정, **4K**를 포함한 30개 명시적 크기, 약 90–150초                                                         | 1K/2K/**4K**(30개 크기, 균일 가격)                         | \$0.03/이미지(호출당, 4K 추가 요금 없음)                         |
| [**Nano Banana**](/en/api-capabilities/nano-banana-image)                                      | 사용 가능            | 빠름, 뛰어난 일관성, 이커머스 편집                                                                                                                                    | 다양한 크기                                              | \$0.02/이미지                                           |
| [**Seedream 5.0 Pro**](/ko/api-capabilities/seedream-image/overview) 🆕                        | 신규, Pro 티어       | 제품군 내 최고의 이미지 품질과 복잡한 지시 이행, 인터랙티브 편집(좌표 / 선택 상자 / 화살표), 최대 10개 참조 이미지, png 출력; 이미지당 약 2분, 일상 작업에는 여전히 5.0 Lite가 적합                                     | 1K/2K(총 픽셀 수 ≤ 4.19M, 3K/4K 미지원; 배치 시퀀스 및 스트리밍 미지원) | \$0.12/호출                                            |
| [**Seedream 5.0 Lite**](/en/api-capabilities/seedream-image)                                   | 사용 가능            | 가격 경쟁력, 빠름, URL 출력                                                                                                                                      | 2K/3K                                               | \$0.035/이미지                                          |
| [**Seedream 4.5**](/en/api-capabilities/seedream-image)                                        | 사용 가능            | 가격 경쟁력, 빠름, URL 출력                                                                                                                                      | 2K/4K                                               | \$0.04/이미지                                           |
| [**Seedream 4.0**](/en/api-capabilities/seedream-image)                                        | 사용 가능            | 가격 경쟁력, 빠름, URL 출력                                                                                                                                      | 2K                                                  | \$0.035/이미지                                          |
| [**GPT Image 1.5**](/en/news/gpt-image-1-5-launch) 🔥                                          | 공식               | 정밀 편집, 4배 속도 향상, 향상된 텍스트 렌더링                                                                                                                            | 낮음/중간/높음 품질                                         | 사용량 기반                                               |
| [**GPT Image 1**](/en/api-capabilities/gpt-image-1)                                            | 공식               | 정밀 편집                                                                                                                                                   | 다양한 크기                                              | 사용량 기반                                               |
| **GPT Image 1-Mini**                                                                           | 공식               | sora\_image의 대안                                                                                                                                         | 다양한 크기                                              | 사용량 기반                                               |
| [**flux-2-max**](/ko/api-capabilities/flux/overview) 🆕                                        | 최신 세대(FLUX.2)    | FLUX.2 플래그십, 고품질 출력                                                                                                                                     | 다양한 크기                                              | \$0.07/호출                                            |
| [**flux-2-pro**](/ko/api-capabilities/flux/overview) 🆕                                        | 최신 세대(FLUX.2)    | FLUX.2 Pro, 균형 잡힌 품질/가격                                                                                                                                 | 다양한 크기                                              | \$0.03/호출                                            |
| [**flux-2-flex**](/ko/api-capabilities/flux/overview) 🆕                                       | 최신 세대(FLUX.2)    | FLUX.2 flex, 조정 가능한 파라미터                                                                                                                                | 다양한 크기                                              | \$0.06/호출                                            |
| [**Flux Kontext Pro**](/en/api-capabilities/flux-image-generation)                             | 사용 가능            | 이미지 편집                                                                                                                                                  | 다양한 크기                                              | 문서 참조                                                |
| [**Flux Kontext Max**](/en/api-capabilities/flux-image-generation)                             | 사용 가능            | 고품질 이미지 편집                                                                                                                                              | 다양한 크기                                              | 문서 참조                                                |

<Info>
  **Nano Banana Pro 특별 혜택**: 1K-4K 모든 해상도를 이미지당 \$0.09의 균일 가격으로 제공합니다. 공식 4K 가격은 이미지당 \$0.24이며, 공식 가격의 약 38%입니다! NanoBananaEnterprise 엔터프라이즈 HA 채널도 1.4배 요율(\$0.126/이미지)로 이용할 수 있습니다. [세부 정보 보기](/en/news/nano-banana-pro-launch)
</Info>

<Tip>
  **이미지 생성 테스트 도구**

  * 중국 액세스: <a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * 글로벌 액세스: <a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  상세 문서:

  * [Nano Banana Pro 문서](/en/api-capabilities/nano-banana-image-edit) - 플랫폼 최고 성능, 지식 이해 + 정밀 편집
  * [Nano Banana 2 문서](/en/api-capabilities/nano-banana-2-image) - 사용량 기반 과금, 새로운 울트라와이드 비율
  * [gpt-image-2-all 문서](/ko/api-capabilities/gpt-image-2-all/overview) - GPT 리버스 ChatGPT-웹 라인, \$0.03/이미지, 약 30–60초 더 빠른 출력
  * [gpt-image-2-vip 문서](/ko/api-capabilities/gpt-image-2-vip/overview) - GPT 리버스 Adobe 라인(Firefly), \$0.03/이미지, 4K 포함 30개 크기, 약 90–150초
  * [GPT-Image-2.5 / 2 문서](/ko/api-capabilities/gpt-image-2/overview) - OpenAI 공식 3종(2.5-flare / 2.5-sunburst / 2), 네이티브 4K, 정밀한 크기/품질 제어
  * [⚖️ 공식과 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2와 리버스 형제 모델 -all / -vip 선택 가이드
  * [Nano Banana 문서](/en/api-capabilities/nano-banana-image) - 빠름, 뛰어난 일관성
  * [Nano Banana Lite 문서](/ko/api-capabilities/nano-banana-lite-image/overview) - 가장 빠르고 저렴함, 약 4초 출력, 호출당 \$0.025/이미지
  * [Seedream 문서](/en/api-capabilities/seedream-image) - 가격 경쟁력, 빠름; 5.0 Pro 티어 포함(\$0.12/호출, 이미지당 약 2분)
  * [GPT Image 1.5 문서](/en/news/gpt-image-1-5-launch) - 4배 속도 향상, 정밀 편집
  * [GPT Image 1 문서](/en/api-capabilities/gpt-image-1) - 공식 이미지 생성
  * [Flux 문서](/en/api-capabilities/flux-image-generation) - 이미지 편집
</Tip>

## 🎬 동영상 생성 모델

| 모델 이름                                                                    | 상태                      | 기능                                                                                                                                                                              | 길이                                                                      | 가격                                                                                                    |
| ------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [**Seedance 2.5 / 2.0 시리즈**](/ko/api-capabilities/seedance2/overview) 🔥 | 운영 중, 인기                | ByteDance, 공식 Volcengine 중국 리소스; **2.5** 및 2.0 standard / `fast` / `mini` 병렬 제공 — 텍스트-동영상, 첫/마지막 프레임, 멀티모달 참조(이미지 + 동영상 + 오디오), 동영상 편집 및 확장, **기본 오디오 동기화**, 비공개 에셋 라이브러리 무료 포함 | 2.5는 4~~30초, 2.0 계열은 4~~15초(480p/720p/1080p; 1080p는 2.5 및 standard만 지원) | token 기반 과금(면적 × 길이); 측정 기준 720p/5초: \$0.45 (mini) / \$0.73 (fast) / \$0.91 (standard) / \$1.35 (2.5) |
| [**Wan2.7 동영상**](/ko/api-capabilities/wan/overview) 🆕                   | 신규, 추천                  | Alibaba Wanxiang, 텍스트/이미지/참조/동영상 편집 생성, i2v는 오디오 기반 지원                                                                                                                          | 초당(최대 12초)                                                              | \$0.084-0.14/초(공식의 98%)                                                                               |
| [**Wan2.6 동영상**](/ko/api-capabilities/wan/historical-versions)           | 사용 가능                   | Wan2.7과 엔드포인트를 공유하며, `r2v-flash` 저지연 티어 포함                                                                                                                                      | 초당                                                                      | 콘솔 참조                                                                                                 |
| [**VEO 3.1 공식**](/ko/api-capabilities/veo-3-1-official/overview) 🔥      | 운영 중, 인기(역방향 대안)        | Google AI Studio 공식 엔드포인트 패스스루, 오디오-동영상 동기화, 실사 인물, 기본 그룹에서 호출 가능                                                                                                               | 4/6/8초                                                                  | 호출당 \$0.3 / \$1.2 (720p/1080p/4k 동일 가격)                                                               |
| **Veo 3.1 역방향**                                                          | ⏸️ 일시 중지(Google 리스크 제어) | Google Flow 역방향; 일시 중지 기간에는 **VEO 3.1 공식** 사용                                                                                                                                   | 고정 8초                                                                   | 사용 불가                                                                                                 |
| **Sora 2 공식**                                                            | ⏸️ 종료됨                  | OpenAI 공식 릴레이, 전문적인 제작, 높은 안정성, sora-2-pro 지원, “캐릭터” 참조 미지원                                                                                                                     | 4/8/12초                                                                 | 사용 불가                                                                                                 |
| [**HappyHorse 1.1**](/ko/api-capabilities/happyhorse/overview) 🆕        | 신규                      | Alibaba, 다중 참조 피사체 일관성(최대 9개 이미지), Wan과 그룹 공유                                                                                                                                   | 초당(최대 12초)                                                              | \$0.126-0.224/초(공식의 98%)                                                                              |
| ~~**Sora 2 역방향**~~                                                       | ❌ 종료됨                   | 이전에는 이커머스 / 애니메이션 시나리오용, 대신 Sora 2 공식 사용                                                                                                                                        | —                                                                       | —                                                                                                     |

<Info>
  **동영상 모델 주요 기능**:

  * **Seedance 2.5 / 2.0 시리즈(ByteDance)**: `doubao-seedance-2-5-260628` (2.5 — 최대 30초, 참조 이미지 30개, mov 출력) / `doubao-seedance-2-0-260128` (standard) / `-fast-260128` (fast) / `-mini-260615` (mini) — 가격과 속도가 다릅니다(mini \< fast \< standard \< 2.5, 2.5는 standard의 약 1.5배). mini와 fast는 최대 720p까지 지원합니다. **네 모델 모두 `SeeDance2` 그룹**(0.18x)에서 실행되므로 하나의 token으로 모두 사용할 수 있습니다. token의 과금 모드는 “사용량 우선” 또는 “사용량 기반”이어야 합니다. `SD2Mini` (0.10x) 및 `SD2Fast` (0.15x)는 기간 한정 할인 그룹입니다 — **mini는 44.4%, fast는 16.7% 할인되며, 2026-10-07 23:59 (UTC+8)까지 적용됩니다**. 이후 요율은 0.18x로 돌아가며 그룹은 계속 사용할 수 있습니다.
  * **VEO 3.1 공식**: Google AI Studio 공식 엔드포인트 패스스루, 업계 최고 수준의 오디오-동영상 동기화, 실사 인물 지원, 기본 그룹 + 호출당/사용량 우선 token으로 호출 가능하며, Veo 3.1 역방향이 일시 중지된 동안 권장되는 대안입니다.
  * **Veo 3.1 역방향**: Google 리스크 제어로 인해 **일시 중지**되었으며, 복구 시점은 추후 공지됩니다. 그동안 VEO 3.1 공식을 사용하십시오.
  * **Sora 2 공식**: 종료되어 현재 사용할 수 없습니다.
  * **Wan2.7 / Wan2.6 (Alibaba Wanxiang)**: 기본 가격은 공식의 약 98%이며, 두 시리즈는 HappyHorse와 `Wan&HappyHorse` 그룹을 공유하므로 하나의 token으로 모두 사용할 수 있습니다. Wan2.6과 Wan2.7은 동일한 엔드포인트와 스키마를 공유하며, `model` 이름만 변경하면 마이그레이션할 수 있습니다.
  * **HappyHorse 1.1 (Alibaba)**: 다중 참조 피사체 일관성에 뛰어나며, Wan과 `Wan&HappyHorse` 그룹 및 엔드포인트를 공유합니다.
  * AI 동영상 도구(온라인 테스트): <a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **출시 예정 동영상 모델**:

  * Kling 3.0

  기대해 주십시오! 최신 출시 알림을 받으려면 팔로우하십시오.
</Note>

## 💰 가격 정보

* **사용량 기반 과금**: 실제 사용량에 따라 과금되며, 최소 과금액은 없습니다
* **잔액 유효 기간**: 충전일로부터 365일 동안 유효하며, 다음 충전 시 자동으로 초기화됩니다(자세한 내용은 [충전 프로모션](/ko/faq/recharge-promotions) 참조)
* 모든 모델의 최신 가격은 [APIYI 콘솔 가격 페이지](https://www.apiyi.com/account/pricing)를 방문해 확인하십시오
