> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 시리즈 요금 안내

> Nano Banana 시리즈 이미지 모델(Pro / 2.1 / 2 / 2 Lite / Gen 1)의 전체 가격 비교를 제공하며, 요청당 요금, token 기반 과금, 충전 보너스 및 token 선택 가이드를 포함합니다. 공식 가격 대비 최저 30.3% 수준까지 저렴합니다.

## 개요

Nano Banana 시리즈는 5개의 이미지 생성 모델을 포함하고 있으며, 모두 공식 요율보다 훨씬 저렴한 가격으로 APIYI를 통해 이용하실 수 있습니다. 본 페이지는 최적의 과금 플랜을 선택하는 데 도움이 되도록 모든 Nano Banana 모델 가격을 요약하여 제공합니다.

<Info>
  API를 호출할 때 사용하는 **token 유형**에 따라 과금 방식이 결정됩니다. Nano Banana Pro, 2.1, 2 및 Lite는 모두 **요청당** 및 **token 기반**의 두 가지 과금 모드를 지원합니다. 각각 기본 안정 등급과 엔터프라이즈 고가용성 등급의 두 가지 티어가 제공됩니다.
</Info>

## 모델 개요

| 기능 | **Nano Banana Pro** | **Nano Banana 2.1** | **Nano Banana 2** | **Nano Banana 2 Lite** | **Nano Banana (1세대)** |
| - | - | - | - | - | - |
| 모델 ID | `gemini-3-pro-image-preview` | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image-preview` | `gemini-3.1-flash-lite-image` | `gemini-2.5-flash-image` |
| 최대 해상도 | 4K | 4K | 4K | 1K | 1K |
| 요청당 과금 | \$0.09/req | \$0.045/req | \$0.055/req | \$0.025/req | \$0.02/req |
| 토큰 기반 | 베타 테스트 중 | ✅ 지원 | ✅ 지원 | ✅ 지원 | ❌ 미지원 |
| 최대 할인 | 공식 대비 31.25% | 공식 대비 33.2% | 공식 대비 30.3% | 공식 대비 40% | 공식 대비 50% |

## Nano Banana Pro 가격

모델: `gemini-3-pro-image-preview`

### 요청당 과금

\$0.09의 요청당 요금으로, 1-4K 해상도에 대해 통합 과금이 적용됩니다. 간단한 과금 방식으로 4K 이미지에서 큰 절감 효과를 얻을 수 있습니다.

| 항목 | APIYI 기본값 | 충전 +10% | 충전 +20% | Google 공식 |
| - | - | - | - | - |
| 이미지당 가격 (\$) | \$0.09 | \$0.0818 | \$0.075 | \$0.24 |
| 이미지당 가격 (¥) | ¥0.63 | ¥0.573 | ¥0.525 | ¥1.68 |
| 공식 대비 | 37.5% | 34.0% | **31.25%** | / |

<Tip>
  4K 이미지에서 최대 \*\*68.75%\*\*를 절감할 수 있습니다! 요청당 과금은 해상도에 따라 구분되지 않으므로, 4K의 비용은 1K와 동일합니다. 따라서 더 높은 해상도일수록 더 높은 가치를 제공합니다.
</Tip>

### 토큰 기반 과금 (아직 공개되지 않음, 베타 사용 가능)

| 항목 | APIYI | Google 공식 |
| - | - | - |
| 입력 | \$0.88/M tokens | \$2/M tokens |
| 출력 | \$52.8/M tokens | \$120/M tokens |
| 공식 대비 | **44%** | / |

이미지당 예상 비용:

| 해상도 | APIYI 예상치 | Google 예상치 |
| - | - | - |
| 1-2K | \~\$0.075 | \~\$0.134 |
| 4K | \~\$0.11 | \~\$0.24 |

<Info>
  토큰 기반 비용은 입력/출력 이미지 token에 따라 달라집니다. 이는 추정치입니다. 토큰 기반 과금은 1-2K 이미지에 더 적합하며, 요청당 과금은 4K에서 더 비용 효율적입니다.
</Info>

## Nano Banana 2.1 요금 안내

모델: `gemini-nano-banana-2.1` (2026년 10월 6일 출시, Nano Banana 2의 업그레이드 버전 — [Nano Banana 2.1 이미지 생성/편집](/ko/api-capabilities/gemini-nano-banana-2.1/overview) 참조)

### 요청당 과금

요청당 \$0.045(2026년 10월 13일부터 \$0.05에서 인하)이며, 1K–4K 모두 동일한 가격이 적용되므로 4K 이미지를 생성할 때 가성비가 가장 뛰어납니다.

| 항목 | APIYI 기본 | 충전 보너스 +10% | 충전 보너스 +20% | Google (4K) |
| - | - | - | - | - |
| 이미지당 (\$) | \$0.045 | \$0.0409 | \$0.0375 | \$0.113 |
| 이미지당 (¥) | ¥0.315 | ¥0.286 | ¥0.263 | ¥0.791 |
| Google 대비 | **39.8%** | **36.2%** | **33.2%** | / |

### token 기반 과금

| 항목 | APIYI | Google |
| - | - | - |
| 입력 | \$0.66/M tokens | \$1.5/M tokens |
| 출력 (이미지, 텍스트 및 추론 단일 요율 적용) | \$13.2/M tokens | 이미지 \$30/M, 텍스트 및 추론 \$7.5/M |
| Google 대비 | **44%** (이미지 요율 기준) | / |

token 기반 과금 시 이미지당 실측 비용 (2026-10-07 기준, 기본 추론 token 포함):

| 해상도 | APIYI (실측치) | Google |
| - | - | - |
| 1K | \~\$0.026 | \~\$0.040 |
| 2K | \~\$0.035 | \~\$0.058 |
| 4K | \~\$0.062 | \~\$0.120 |

<Info>
  Nano Banana 2.1은 기본적으로 추론을 수행하므로 이미지당 약 400–1300개의 추론 token이 추가되어 이미지와 함께 출력 요율로 과금됩니다. 이에 따라 token 기반의 이미지당 비용에 차이가 발생합니다. 1K / 2K는 token 기반 과금이 더 저렴하며, 4K는 요청당 과금(\$0.045)이 더 저렴합니다. 512px는 지원되지 않습니다.
</Info>

<Note>모델 가격은 공식 웹사이트와 동기화되어 변동될 수 있습니다. 위 표는 참고용일 뿐이며, 상단 탐색 메뉴의 **모델 요금** 탭이 가장 정확합니다: [모델 요금](/en/models/index).</Note>

## Nano Banana 2 가격

모델: `gemini-3.1-flash-image-preview`

### 요청당 과금

\$0.055를 요청당 부과하며, 1-4K 해상도에 대해 통합된 요금입니다.

| 항목 | APIYI 기본 | 충전 +10% | 충전 +20% | Google 공식 |
| - | - | - | - | - |
| 이미지당 가격 (\$) | \$0.055 | \$0.05 | \$0.0458 | \$0.151 |
| 이미지당 가격 (¥) | ¥0.385 | ¥0.35 | ¥0.32 | ¥1.68 |
| 공식 대비 | **36.4%** | **33.1%** | **30.3%** | / |

### 토큰 기반 과금

| 항목 | APIYI | Google 공식 |
| - | - | - |
| 입력 | \$0.18/M tokens | \$0.5/M tokens |
| 출력 | \$21.6/M tokens | \$60/M tokens |
| 공식 대비 | **36%** | / |

이미지당 예상 비용:

| 해상도 | APIYI 추정치 | Google 공식 |
| - | - | - |
| 512px | \~\$0.024 | \$0.045 |
| 1K | \~\$0.03 | \$0.067 |
| 2K | \~\$0.036 | \$0.101 |
| 4K | \~\$0.06 | \$0.151 |

<Info>
  이는 실제 입력/출력 tokens를 기반으로 한 추정치입니다. 더 낮은 비용을 위해 충전 보너스(최대 20%)를 함께 적용할 수 있습니다.
</Info>

## Nano Banana 2 Lite 가격

모델: `gemini-3.1-flash-lite-image`

가장 빠르고 저렴한 티어 — 1K 캔버스에 초점을 맞추며, 이미지당 약 4초입니다. **종량제 우선순위를 권장합니다**: 실사용 단가는 더 낮고 예측 가능합니다.

### Token 기반 과금(권장)

| 항목 | APIYI | Google 공식 | 공식 대비 |
| - | - | - | - |
| 입력 | \$0.10/M tokens | \$0.25/M tokens | **40%** |
| 출력 | \$12/M tokens | \$30/M tokens | **40%** |

이미지당 예상 비용:

| 해상도 | APIYI 예상치 | Google 공식 |
| - | - | - |
| 1K | **\~\$0.018** | \~\$0.034 |

<Info>
  **실제로도 예측 가능합니다**: token 기반(per-token) 과금의 1K 이미지는 **실제로 호출당 평균 약 \$0.018입니다**(일반적인 범위는 \~\$0.016–\$0.019이며, 출력 tokens에 의해 결정됨), 호출당 정액 \$0.025/이미지보다 저렴합니다. 더 낮은 비용을 원하면 충전 보너스와 함께 적용하십시오.
</Info>

### 호출당 과금

| 항목 | APIYI | Google 공식 | 비고 |
| - | - | - | - |
| 이미지당 가격 | \$0.025/req | \~\$0.034/image | 정액 요금이며, 나중에 낮아질 수 있지만 현재는 변동이 없습니다. |

<Tip>
  **어느 과금 모드가 좋습니까?** Lite의 경우, **`Pay-as-you-go Priority`를 권장합니다** — 실제로 호출당 약 \$0.018로, 호출당 \$0.025보다 저렴하고 예측 가능하며, token 하나로 Nano Banana Pro / 2의 호출당 과금도 커버되어 전체 시리즈를 실행할 수 있습니다. 호출당 \$0.025/이미지는 정액 요금이며, 나중에 낮아질 수 있지만 현재는 변동이 없습니다.
</Tip>

## Nano Banana Gen 1 요금

모델: `gemini-2.5-flash-image`

이미지는 1K개만 지원하며, 요청당 고정 과과금입니다.

| 항목 | APIYI | Google 공식 | 할인 |
| - | - | - | - |
| 이미지당 가격 | \$0.02/req | \$0.039/req | **약 50% 할인** |

충전 보너스 프로모션도 적용 가능합니다.

## 충전 보너스

이미 할인된 가격에 충전 보너스를 더해 비용을 더욱 절감할 수 있습니다.

<CardGroup cols={2}>
  <Card title="충전 보너스 상세 정보" icon="gift" href="/ko/faq/recharge-promotions">
    현재 충전 보너스 등급 및 프로모션 상세 정보를 확인합니다.
  </Card>

  <Card title="Token 관리" icon="key" href="https://api.apiyi.com/token">
    API tokens를 생성하고 관리합니다.
  </Card>
</CardGroup>

## Token Type 선택 가이드

<Info>
  토큰을 생성할 때는 "Billing model" 설정이 과금 방식을 결정합니다. 주요 사용 사례에 따라 선택하십시오:
</Info>

| Model | 사용 사례 | 권장 토큰 유형 |
| - | - | - |
| Nano Banana Pro | 1-4K 혼합 사용 | 토큰 기반(우선) |
| Nano Banana Pro | 4K 전용 | 요청당 |
| Nano Banana 2 | 0.5K-4K 혼합 사용 | 토큰 기반(우선) |
| Nano Banana 2 | 4K 전용 | 요청당 |
| Nano Banana 2 Lite | 1K 규모 생성 | 토큰 기반(우선) |

<Tip>
  **간단한 규칙**: 주로 4K 이미지를 생성한다면 **요청당 과금**을 선택하십시오(해상도와 관계없이 동일한 가격입니다). 혼합 해상도 사용의 경우 **토큰 기반 과금**이 낮은 해상도에서 더 많은 비용을 절감합니다.
</Tip>

## 청구 금액 변동은 가격 변경이 아닙니다

동일한 모델이라도 가격 변경 없이 청구 금액이 크게 달라질 수 있습니다. **token 기반 과금** 방식에서는 단일 요청 비용이 파라미터에 따라 변동됩니다. 실제로 측정된 가장 큰 두 가지 요인은 다음과 같습니다:

| 파라미터 | 단일 요청 청구 금액에 미치는 영향 | 적용 대상 |
| - | - | - |
| 출력 해상도 | 1K에서 4K: 약 **+90%** (\$0.033 → \$0.064, Nano Banana 2에서 측정; Pro token 기반 1-2K에서 4K는 약 +47%) | token 기반 과금 전용; 2 Lite 및 1세대는 1K로 출력되므로 해당되지 않습니다 |
| `thinkingLevel` | 기본 티어에서 `high`: 약 **+54%** | Nano Banana 2 / 2 Lite 전용; Pro는 항상 생각을 수행하며 조정할 수 없습니다 |

동일한 모델에서 어제 약 \$0.033이 들었던 요청이 오늘 약 \$0.052로 청구되었다면, 이는 대개 가격 조정이 아니라 파라미터가 달라졌음을 의미합니다.

<Info>
  티어별 측정값(tokens, 비용, 지연 시간)은 [Nano Banana 2 이미지 생성/편집](/ko/api-capabilities/nano-banana-2-image/overview) 및 [사용량 필드 및 출력 설명](/ko/api-capabilities/nano-banana-usage-metadata)에서 확인하실 수 있습니다.
</Info>

**예측 가능한 비용이 필요할 때는 요청당 과금을 선택하십시오**: 해상도 및 token 수와 관계없이 1K부터 4K까지 단일 가격(Pro 이미지당 \$0.09, Nano Banana 2 \$0.055)이 적용됩니다.

## 관련 문서

* [Nano Banana 2 이미지 생성/편집](/ko/api-capabilities/nano-banana-2-image/overview) - Nano Banana 2 완전 가이드
* [Nano Banana Pro 이미지 생성](/en/api-capabilities/nano-banana-image) - Nano Banana Pro 가이드
* [Nano Banana Pro 이미지 편집](/en/api-capabilities/nano-banana-image-edit) - 이미지 편집 기능
* [충전 프로모션](/ko/faq/recharge-promotions) - 충전 보너스 상세 정보


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.