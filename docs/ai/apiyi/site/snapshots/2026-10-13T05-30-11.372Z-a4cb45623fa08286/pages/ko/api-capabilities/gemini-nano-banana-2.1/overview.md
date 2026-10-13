> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 이미지 생성/편집

> 정식 출시된 Google Nano Banana 2.1(gemini-nano-banana-2.1): 더욱 향상된 이미지 품질, 텍스트 렌더링 및 멀티턴 일관성을 제공하는 Nano Banana 2의 업그레이드 버전입니다. 요청당 $0.045(4K 포함) 또는 1M tokens당 입력 $0.66 / 출력 $13.2의 token 기반 과금이 적용됩니다.

## 개요

**Nano Banana 2.1**은 Google이 2026년 10월 6일에 출시한 이미지 생성 모델입니다. 모델 ID는 \*\*`gemini-nano-banana-2.1`\*\*이며, 정식 출시(GA)되었습니다. 이는 [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview)(`gemini-3.1-flash-image`)의 업그레이드 버전으로, Flash급 속도를 유지하면서 이미지 품질, 이미지 내 텍스트 렌더링, 멀티턴 편집 일관성을 향상하고 이전 버전의 타일링 결함을 수정했습니다. Google은 모든 신규 프로젝트에 2.1을 사용할 것을 권장합니다.

<Note>
  **🆕 2026년 10월 6일 출시**: 현재 APIYI에서 이용 가능하며, **요청당** 과금(요청당 \$0.045, 1K / 2K / 4K 동일 가격, 2026년 10월 13일부터 \$0.05에서 인하) 및 **token 기반** 과금(1M tokens당 입력 \$0.66 / 출력 \$13.2)을 모두 지원합니다. Nano Banana 2 역시 동일한 가격으로 계속 이용할 수 있으며, Google은 이에 대한 서비스 종료 일정을 발표하지 않았습니다.
</Note>

<Info>
  모든 이미지 API는 **동기식**입니다. 폴링할 작업 ID가 없으며, 클라이언트 연결이 끊어지면 요청은 그대로 과금되지만 결과는 유실됩니다. 이 모델에는 타임아웃을 넉넉하게 설정하십시오. 자세한 내용은 [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<CardGroup cols={2}>
  <Card title="텍스트-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/gemini-nano-banana-2.1/text-to-image">
    대화형 Playground를 통해 텍스트 prompt로부터 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/gemini-nano-banana-2.1/image-edit">
    대화형 Playground를 통해 이미지와 지시사항을 업로드하여 편집된 결과를 받습니다.
  </Card>
</CardGroup>

## AI 에이전트를 통한 연동

<Note>
  Codex, Claude Code 또는 Cursor를 사용하여 개발하는 경우 아래 prompt를 복사하여 입력하십시오. 먼저 이 페이지의 일반 텍스트 버전을 가져온 다음(모든 문서 URL 끝에 `.md` 추가) 사용자의 기술 스택에 맞는 코드를 작성합니다. 타임아웃, 방어적 `parts` 파싱, 업로드 압축, 해상도 파라미터 등 가장 흔히 발생하는 함정들이 이미 요구사항으로 명시되어 있습니다.
</Note>

<Prompt description="코딩 에이전트가 Nano Banana 2.1 텍스트-이미지 생성 및 이미지 편집을 연동하거나 디버깅하도록 설정합니다. Codex, Claude Code, Cursor 등에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에 Nano Banana 2.1 (`gemini-nano-banana-2.1`) 텍스트-이미지 생성 + 이미지 편집 기능을 연동(또는 디버그)해 주십시오.

  코드를 작성하기 전에 문서를 읽으십시오. 이 페이지의 일반 텍스트 버전을 확인하려면 [https://docs.apiyi.com/en/api-capabilities/gemini-nano-banana-2.1/overview.md](https://docs.apiyi.com/en/api-capabilities/gemini-nano-banana-2.1/overview.md) 를 가져오십시오. 상세 파라미터는 텍스트-이미지 생성 및 이미지 편집 페이지에도 `.md`를 추가하여 확인하십시오.

  요구사항:

  1. 타임아웃: Gemini 네이티브 형식 `POST https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent`를 사용하고 클라이언트 타임아웃을 360초로 설정하십시오. 이미지 호출은 작업 ID가 없는 동기식 방식입니다. 클라이언트 연결이 끊어지면 결과는 유실되지만 요청에 대한 과금은 그대로 발생합니다. 중간의 모든 계층(리버스 프록시, 게이트웨이, 서버리스 실행 제한)에서도 제한 시간을 늘리십시오. 생성 시간보다 짧은 계층이 있으면 요청이 중단됩니다. Node를 사용하는 경우 undici에는 3개의 개별 타임아웃이 존재하며 SDK `timeout`는 이를 처리하지 못한다는 점에 유의하십시오.

  2. 응답 파싱(**가장 실수하기 쉬운 부분**): 이미지는 `candidates[0].content.parts[]` 내부의 `inlineData.data`에 base64로 포함되어 있습니다. 하지만 `parts`은 \*\*길이와 순서가 보장되지 않는 이종 배열(heterogeneous array)\*\*입니다. 텍스트 파트가 먼저 올 수 있어 이미지가 인덱스 0 대신 1에 위치할 수 있습니다. 따라서 **절대로 `parts[0]` 또는 `parts[1]`을 하드코딩하지 마십시오**. 대신 `parts`를 순회하면서 `inlineData`을 가진 모든 파트를 수집한 뒤 **마지막 파트**를 취하십시오(복잡한 작업은 여러 초안을 반환할 수 있으며, 마지막 파트가 최종본입니다). `image/png`을 하드코딩하는 대신 응답에서 `mimeType`을 읽어오십시오. 이미지를 렌더링하고 “디스크에 저장” 액션을 제공하십시오.

  3. 업로드 압축: 편집 시 참조 이미지를 `inlineData`에 base64로 넣으십시오. 업로드 전에 압축을 수행하십시오. 1.5MB를 초과하는 파일만 긴 변을 2048px로 축소하고(업스케일 절대 금지), 원본 포맷의 품질 0.9로 재인코딩하며, 다중 이미지 요청의 경우 총 크기를 6MB 미만으로 유지하십시오. base64 변환 시 크기가 약 3분의 1 정도 증가하므로 각 이미지는 5MB 미만으로 유지하십시오. 특정 이미지 압축에 실패할 경우 전체 요청을 실패 처리하지 말고 원본으로 대체(fallback)하십시오. 또한 **단일 파트에는 `text` 또는 `inlineData` 중 하나만 포함될 수 있으며 둘 다 포함될 수는 없습니다** — 올바른 구조는 1개의 텍스트 파트 + N개의 이미지 파트입니다.

  4. 해상도 파라미터: **항상** `generationConfig.imageConfig.imageSize`(`1K` / `2K` / `4K`, 기본값 `1K`; **이 모델은 `512`을 지원하지 않으며 이를 전달하면 400 에러를 반환합니다**) 및 `aspectRatio`(유효한 14개 비율은 이 페이지에 나열되어 있습니다)를 **전달하십시오**. `aspectRatio`가 없으면 모델이 콘텐츠를 기반으로 비율을 선택하므로 출력 형태를 예측할 수 없습니다. token 기반 과금 방식에서는 **해상도가 가격을 직접 결정합니다**. UI에서 해상도와 비율을 모두 드롭다운으로 제공하십시오.

  5. 오류 처리: 콘텐츠 모더레이션에 의해 요청이 차단되면 HTTP 상태 코드는 여전히 200이지만 `candidates[0].content.parts`이 비어 있습니다. 먼저 `candidatesTokenCount == 0`를 확인한 다음 `finishReason`이 `STOP`이 아닌지 확인하십시오. `IMAGE_SAFETY`과 같은 차단은 **과금되지 않으며**, 동일한 요청을 한두 번 재시도하면 성공하는 경우가 많으므로 자동으로 재시도하도록 구현하십시오.

  6. 키는 `APIYI_API_KEY` 환경 변수에서 읽어와 `Authorization: Bearer ...`로 전송하십시오. 절대로 하드코딩하거나 git에 커밋하지 마십시오.

  7. 완료되면 실제로 텍스트-이미지 생성 호출 1회와 이미지 편집 호출 1회를 실행하고, 두 호출의 결과 이미지와 비용을 보여주십시오.
</Prompt>

<Accordion title="이 prompt를 통해 방지할 수 있는 문제">
  | 요구사항 | 방지하는 문제점 |
  | - | - |
  | `parts` 인덱스 하드코딩 금지 | `parts`의 개수와 순서가 보장되지 않으므로, 인덱스를 고정하면 간헐적으로 실패합니다. [Nano Banana 개발 가이드](/ko/api-capabilities/nano-banana-dev-guide)를 참조하십시오 |
  | 마지막 이미지 파트 선택 | 복잡한 편집 작업에서는 여러 개의 초안이 반환될 수 있으며, 마지막 파트가 최종 결과물입니다 |
  | `512` 절대 전송 금지 | 2.1에서는 512 티어가 제거되었으므로, 이를 사용하는 Nano Banana 2 코드는 400 에러로 실패합니다 |
  | 항상 `imageSize` 및 `aspectRatio` 전달 | token 기반 과금 체계에서는 해상도가 가격을 결정합니다. 비율을 지정하지 않으면 모델이 임의로 선택하므로 동일한 prompt라도 가로 또는 세로 방향으로 일정하지 않게 생성될 수 있습니다 |
  | 업로드 전 압축 | base64 인코딩 시 크기가 약 3분의 1 증가합니다. [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution)를 참조하십시오 |
  | `IMAGE_SAFETY` 자동 재시도 | 모더레이션 차단 시 이미지는 포함되지 않고 200이 반환되며 과금되지 않습니다. 단순 재시도만으로 성공하는 경우가 많습니다. [Gemini 이미지 오류 처리](/ko/api-capabilities/gemini-image-error-handling)를 참조하십시오 |
</Accordion>

## 주요 기능

<CardGroup cols={2}>
  <Card title="향상된 화질" icon="sparkles">
    Nano Banana 2보다 시각적 품질이 더 뛰어나며, 이전 버전의 타일링 현상이 해결되었습니다.
  </Card>

  <Card title="더 정확한 텍스트 표현" icon="type">
    이미지 내 텍스트가 더 선명하고 오탈자가 적어 포스터, 마케팅 자료 및 인포그래픽 제작에 적합합니다.
  </Card>

  <Card title="더 안정적인 멀티턴 편집" icon="message-circle">
    대화형 편집 과정에서 캐릭터와 장면이 더욱 일관되게 유지됩니다.
  </Card>

  <Card title="3가지 사고 수준" icon="brain">
    minimal / medium / high(기본값: medium)를 지원하며, 이전 버전보다 단계가 하나 더 추가되었습니다.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="최대 4K 해상도 출력" icon="expand">
    1K / 2K / 4K를 지원하며, 요청당 과금 방식을 적용하여 4K도 1K와 동일한 비용으로 이용할 수 있습니다.
  </Card>

  <Card title="14가지 화면비" icon="maximize">
    매우 세로로 긴 1:4, 1:8 및 매우 가로로 긴 4:1, 8:1 비율을 포함합니다. Google에 따르면 와이드 포맷은 고해상도에서 더욱 뛰어난 품질을 보여줍니다.
  </Card>

  <Card title="멀티 레퍼런스 융합" icon="users">
    최대 10개의 객체 참조 + 4개의 캐릭터 참조 + 3개의 스타일 참조를 지원합니다.
  </Card>

  <Card title="Google 검색 그라운딩" icon="search">
    날씨 카드나 시장 차트처럼 실시간 정보가 필요한 이미지를 위해 `googleSearch` 도구를 연결하여 사용할 수 있습니다.
  </Card>
</CardGroup>

## Nano Banana 2와의 차이점

| | **Nano Banana 2.1** | Nano Banana 2 |
| - | - | - |
| 모델 ID | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image` |
| 상태 | GA, Google에서 신규 프로젝트에 권장 | GA, 계속 사용 가능 |
| 품질 / 텍스트 렌더링 / 멀티턴 일관성 | 더 우수함 | 양호 |
| 해상도 | 1K / 2K / 4K | 512 / 1K / 2K / 4K |
| 4K 이미지당 출력 tokens | 3780 | 2520 |
| Thinking 레벨 | minimal / medium / high, 기본값 medium | minimal / high, 기본값 minimal |
| Google 가격: 입력 | \$1.50 / 1M | \$0.50 / 1M |
| Google 가격: 이미지 출력 | \$30 / 1M | \$60 / 1M |
| Google 가격: 4K 이미지당 | \$0.113 | \$0.151 |
| **APIYI 요청당** | **\$0.045** | \$0.055 |
| **APIYI token 기반** | 1M당 입력 \$0.66 / 출력 \$13.2 | 1M당 입력 \$0.18 / 출력 \$21.6 |

<Tip>
  **어떤 모델을 선택해야 할까요**:

  * **신규 프로젝트** → Nano Banana 2.1: 더 우수한 품질 및 더 저렴한 요청당 비용
  * **이미 Nano Banana 2를 사용 중인 경우** → 모델 이름을 변경하여 전환할 수 있습니다. 코드에서 `512` 티어를 사용하는 경우 먼저 `1K`(으)로 변경하십시오.
  * **512px 썸네일이 필요한 경우** → Nano Banana 2를 유지하거나 [Nano Banana 2 Lite](/ko/api-capabilities/nano-banana-lite-image/overview)를 사용하십시오.
  * **최고의 품질을 원하는 경우** → [Nano Banana Pro](/ko/api-capabilities/nano-banana-image/overview) (요청당 \$0.09)
</Tip>

## 가격 정책

<Info>
  **과금 방식 선택**: Nano Banana 2.1은 두 가지 과금 방식을 지원하며, token 생성 시 “과금 모델” 설정을 통해 선택할 수 있습니다.

  * **Pay-as-you-go** 또는 **Pay-as-you-go Priority** → token 기반 과금
  * **Pay-per-request** 또는 **Pay-per-request Priority** → 요청당 과금
  * ⚠️ **Hybrid 과금은 선택하지 마십시오**
</Info>

### 요청당 과금

| 모델 | APIYI 가격 | Google 가격 (4K) | Google 대비 |
| - | - | - | - |
| **Nano Banana 2.1** `gemini-nano-banana-2.1` | **요청당 \$0.045** (1K / 2K / 4K 동일) | 이미지당 \$0.113 | **약 40%** |

<Tip>
  **2026년 10월 13일부터 10% 가격 인하: 요청당 \$0.05 → \$0.045** (1K / 2K / 4K 동일).

  * **인하 이유**: token 기반 과금 시 1K / 2K 이미지는 이미 장당 \$0.02–\$0.04에 불과하여 요청당 \$0.05가 상대적으로 비싸 보였기에, 요청당 가격 또한 인하하였습니다. 4K의 경우 요청당 과금이 token 기반 과금(\$0.06 이상)보다 약 30% 저렴합니다.
  * **token 기반 가격 변동 없음**: 1M tokens당 입력 \$0.66 / 출력 \$13.2.
  * **추가 할인 효과**: 10%–20% 충전 보너스를 적용하면 실제 요청당 비용은 약 \$0.038–\$0.041 수준입니다.
</Tip>

### token 기반 과금

| 항목 | Google | APIYI | Google 대비 |
| - | - | - | - |
| 입력 | \$1.50 / 1M tokens | \$0.66 / 1M tokens | **44%** |
| 출력 (이미지, 텍스트 및 thinking 단일 요율) | 이미지 \$30 / 1M; 텍스트 및 thinking \$7.50 / 1M | \$13.2 / 1M tokens | 이미지 요율의 **44%** |

<Note>모델 가격은 공식 웹사이트 기준에 맞춰 책정되며 변동될 수 있습니다. 위 표는 참고용이며, 상단 내비게이션의 **모델 가격** 탭의 정보가 우선 적용됩니다: [모델 가격](/en/models/index).</Note>

### token 기반 과금: 실제 운영 환경 과금 내역

Nano Banana 2.1은 **기본적으로 생성 전에 생각(thinking) 과정을 거칩니다**(기본 수준: medium). 각 이미지는 이미지 tokens 외에도 약 400–1300개의 thinking 및 기타 출력 tokens를 생성하며, 이미지와 함께 1M당 \$13.2로 과금됩니다. 따라서 token 기반 과금 시 이미지당 비용은 **고정되어 있지 않고 변동됩니다**. 아래 표는 2026-10-07에 발생한 실제 token 과금 요청에서 발췌한 것이며, 금액은 콘솔의 실제 청구 금액입니다(해상도는 출력 tokens를 통해 추정):

| 시나리오 | 입력 tokens | 출력 tokens | 실제 청구액 |
| - | - | - | - |
| 1K 텍스트-이미지 생성 | 36 | 1,970 | \$0.0260 |
| 1K 단일 이미지 편집 | 1,137 | 2,015 | \$0.0273 |
| 1K 단일 이미지 편집 (thinking 증가) | 1,132 | 2,409 | \$0.0325 |
| 2K 텍스트-이미지 생성 | 13 | 2,623 | \$0.0346 |
| 2K 단일 이미지 편집 | 1,188 | 2,957 | \$0.0398 |
| 2K 14개 참조 이미지 합성 | 15,735 | 2,827 | \$0.0581 |
| 4K 텍스트-이미지 생성 | 13 | 4,703 | \$0.0621 |
| 4K 복잡한 prompt | 72 | 4,933 | \$0.0652 |

해당 일자 60건의 token 과금 요청 분포:

| 해상도 | 요청 수 | 최솟값 | 중앙값 | 최댓값 | 요청당 가격 |
| - | - | - | - | - | - |
| 1K | 31 | \$0.021 | \$0.029 | \$0.033 | \$0.045 |
| 2K | 19 | \$0.033 | \$0.036 | \$0.058 | \$0.045 |
| 4K | 10 | \$0.061 | \$0.063 | \$0.067 | \$0.045 |

<Tip>
  **과금 방식 선택 권장사항**:

  * **1K / 2K → token 기반**: 일반적으로 이미지당 \$0.02–\$0.04로, 요청당 가격인 \$0.045보다 저렴합니다.
  * **4K → 요청당 과금**: 고정 \$0.045이며, token 기반 과금 시 \$0.06 이상이 소요됩니다.
  * **단일 요청에 참조 이미지가 많은 경우**(예: 10장 이상): 입력 tokens로 인해 token 기반 비용이 \$0.045에 근접하거나 초과하므로, 이 경우에도 요청당 과금을 사용하는 것이 좋습니다.

  APIYI의 [충전 보너스](/ko/faq/recharge-promotions)와 함께 이용하시면 실제 비용은 더욱 낮아집니다.
</Tip>

<Info>
  **이미지 tokens만으로 비용을 추정하면 과소평가되는 이유**: `usageMetadata`의 `thoughtsTokenCount`은 `candidatesTokenCount`에 포함되지 않지만, APIYI 로그에서는 출력 tokens로 집계되어 과금됩니다. 1120 / 1680 / 3780 tokens를 기준으로 추정하면 비용이 20%–40% 과소평가됩니다. 콘솔 로그의 청구 금액을 기준으로 대조하시기 바랍니다.
</Info>

## 과금에 영향을 미치는 파라미터

| 파라미터 | 요청당 비용에 미치는 영향 | 참고 사항 |
| - | - | - |
| `imageConfig.imageSize` | 1K \~\$0.026 → 4K \~\$0.062 (token 기반) | 가장 큰 영향 요인이며, 요청당 과금에는 영향을 주지 않습니다 |
| `thinkingConfig.thinkingLevel` | `high` 적용 시 약 30% 더 많은 thinking tokens를 사용하며, 4K 이미지 기준 약 +6% 증가합니다 | 영향이 미미하므로 필요할 때 활성화하십시오 |
| `tools: [{"googleSearch": {}}]` | 검색 쿼리당 \$0.014 (테스트 시 이미지당 2건의 쿼리 실행) | 요청당 비용이 눈에 띄게 증가합니다 |

### thinkingLevel: 기본값은 medium이며, high로 설정해도 비용 증가는 미미합니다

| 설정 | Thinking tokens(중앙값) | 4K 이미지당 비용(token 기반) |
| - | - | - |
| 미설정(기본값 medium) | \~690 | \~\$0.062 |
| `high` | \~940 | \~\$0.066 |

Nano Banana 2(기본값 minimal, `high` 설정 시 비용 54% 증가)와 달리, 2.1은 기본적으로 이미 추론을 수행하며 `high`은(는) 단지 조금 더 길게 추론할 뿐입니다. 이미지 내 텍스트 레이아웃이나 차트 비율을 정확히 맞춰야 할 때 부담 없이 활성화하십시오.

### Google Search grounding: 검색 쿼리당 과금

실시간 정보가 필요한 이미지(날씨 카드, 시장 차트, 최근 이벤트 포스터 등)의 경우 `googleSearch` 도구를 추가하십시오:

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "A weather card poster for Tokyo today" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

테스트 결과 grounding은 3회 모두 작동했으며, 모델이 요청당 자체적으로 2건의 검색 쿼리를 실행했습니다. 각 쿼리당 비용은 \$0.014(1,000건당 \$14)입니다. **실행할 쿼리 수는 모델이 결정하며 사전에 상한을 제한할 수 없으므로**, 요청당 2\~3건의 쿼리 비용을 예산에 반영하십시오.

<Warning>
  **요청당 과금 방식에도 검색 요금이 추가로 적용됩니다**: 요청당 \$0.045는 이미지만 포함된 금액이며, `googleSearch`이(가) 연결되면 각 검색 쿼리 비용이 별도로 추가됩니다.
</Warning>

## 그룹

Nano Banana 2.1은 APIYI에서 두 가지 그룹으로 제공되며, token 설정에서 전환할 수 있습니다:

| 그룹 | 요율 배수 | 사용 사례 |
| - | - | - |
| `Default` | 1.0x | 표기된 가격의 표준 채널이며, 기본으로 권장됩니다 |
| `NB-Enterprise` | 1.4x | 기본 그룹이 혼잡하거나 시간 초과가 발생할 때 사용하는 대체 채널이며, 안정성을 우선시합니다 |

**권장 token 과금 모드**: `Pay-as-you-go Priority`을 선택하십시오 — Nano Banana 2 / 2.1의 token 기반 과금 및 Nano Banana Pro의 요청당 과금을 모두 지원하므로 **하나의 token으로 전체 제품군을 커버할 수 있습니다**. `Default`을 기본 그룹으로, `NB-Enterprise`을 대체 그룹으로 지정하십시오. 기본 그룹에서 429가 반환되면 요청이 자동으로 대체 그룹으로 전환되어 생성을 계속 진행합니다.

## 해상도 및 화면비

### 출력 해상도

| 해상도 | 설명 | 사용 사례 |
| - | - | - |
| 1K | 기본값 | 소셜 미디어, 웹 |
| 2K | HD | HD 디스플레이, 인쇄 |
| 4K | Ultra HD | 전문 디자인, 상업용 포스터 |

<Warning>
  **`512`은(는) 지원되지 않습니다**: `"imageSize": "512"`은(는) 400 `Image size 512 is not supported for this model`을(를) 반환합니다(과금되지 않음). Nano Banana 2에서 마이그레이션할 때 변경해 주십시오.
</Warning>

### 지원되는 화면비 (14개)

`1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

**`aspectRatio`을(를) 생략하면 모델이 콘텐츠를 기반으로 비율을 선택합니다**: 테스트 결과, 장면 prompt는 대부분 16:9로, 포스터 prompt는 2:3 또는 3:4로 생성되었습니다. 고정된 비율이 필요한 경우 명시적으로 전달하십시오.

### 측정된 출력 크기 (픽셀)

| 비율 | 1K | 2K | 4K |
| - | - | - | - |
| **16:9** | 1376×768 | 2752×1536 | 5504×3072 |
| **2:3** | 848×1264 | — | 3392×5056 |
| **3:4** | 896×1200 | — | — |
| **8:1** | 2928×352 | — | — |

<Info>
  2026-10-07에 측정되었으며, “—”는 아직 측정되지 않았음을 의미합니다. 1K 기준 8:1 비율은 2928×352로 Nano Banana 2의 3072×384와 다르므로, 프론트엔드 레이아웃에 **Nano Banana 2의 크기 표를 재사용하지 마십시오**.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Nano Banana 2.1과 Nano Banana 2는 같은 모델입니까?">
    아닙니다. 2.1은 별도의 모델 ID인 `gemini-nano-banana-2.1`를 사용하며, 향상된 품질, 텍스트 렌더링, 멀티턴 일관성을 제공하고 가격 책정 구조(더 비싼 입력 비용, 더 저렴한 이미지 출력 비용, 4K 이미지당 더 많은 tokens)도 다릅니다. 두 모델 모두 APIYI에서 이용할 수 있으며 서로 영향을 주지 않습니다.
  </Accordion>

  <Accordion title="Nano Banana 2에서 전환하려면 무엇을 변경해야 합니까?">
    1. 모델 이름을 `gemini-3.1-flash-image`(또는 `-preview`)에서 `gemini-nano-banana-2.1`(으)로 변경하십시오.
    2. `"imageSize": "512"`을(를) 사용하는 경우 `1K`(으)로 변경하십시오.
    3. tokens 기준으로 비용을 산정하는 경우 위의 “실제 이미지 1장당 비용” 표와 비교하여 다시 확인하십시오.

    요청 형식, 응답 구조, 다중 이미지 및 멀티턴 편집 기능은 모두 동일하게 유지됩니다.
  </Accordion>

  <Accordion title="Nano Banana 2 서비스가 종료됩니까?">
    2026년 10월 7일 기준으로 Google은 `gemini-3.1-flash-image`의 서비스 종료일을 발표하지 않았으며, 권장 대체 모델로 2.1만 안내하고 있습니다. APIYI의 Nano Banana 2는 동일한 가격으로 계속 이용하실 수 있습니다. 변경 사항이 있을 경우 사전에 공지해 드리겠습니다.
  </Accordion>

  <Accordion title="청구 금액이 이미지 tokens 기준으로 예상한 것보다 높은 이유는 무엇입니까?">
    2.1은 기본적으로 생각(thinking) 과정을 거치기 때문에, 이미지당 대략 400\~1,300개의 생각 및 기타 출력 tokens가 추가되어 이미지와 함께 출력 요율로 과금됩니다. 이는 `thoughtsTokenCount`에서 확인할 수 있습니다. 주로 4K 이미지를 생성하는 경우, 요청당 과금(\$0.045) 방식이 더 유리합니다.
  </Accordion>

  <Accordion title="동시 실행 수 제한이 있습니까?">
    **동시 실행 수 제한은 없습니다** — 동시 요청을 자유롭게 보내실 수 있으며, 대기열에 쌓이거나 서로 차단되지 않습니다. 중요한 것은 `timeout`입니다. 4K 생성이나 피크 시간대 요청은 시간이 다소 걸릴 수 있으므로(테스트 결과 대부분의 4K 요청은 30\~50초 소요, 일부는 2분 이상 소요), **클라이언트 타임아웃을 360초로 설정하십시오**. 간혹 429 오류가 발생하는 경우, token의 대체 그룹으로 `NB-Enterprise`을(를) 추가하십시오.
  </Accordion>

  <Accordion title="출력 이미지에 워터마크가 포함됩니까?">
    모든 출력 이미지에는 눈에 보이지 않는 SynthID 워터마크(AI 생성 콘텐츠에 대한 Google의 식별 마커)가 포함됩니다. 육안으로는 보이지 않으며 사용에 영향을 주지 않습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Nano Banana 2 이미지 생성/편집](/ko/api-capabilities/nano-banana-2-image/overview) - 이전 버전, 512px 지원
* [Nano Banana Pro 이미지 생성/편집](/ko/api-capabilities/nano-banana-image/overview) - 최고 품질
* [Nano Banana 개발 가이드](/ko/api-capabilities/nano-banana-dev-guide) - 크기 제어, 입력 이미지 요구 사항, 이미지 URL
* [Nano Banana 요금 안내](/ko/api-capabilities/nano-banana-pricing)
* [Gemini 이미지 오류 처리](/ko/api-capabilities/gemini-image-error-handling)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.