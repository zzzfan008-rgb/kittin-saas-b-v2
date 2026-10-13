> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2.5 / 2 공식 버전 vs 리버스 버전

> 공식 gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2와 리버스 엔지니어링된 자매 모델 gpt-image-2.5-all, gpt-image-2-all, gpt-image-2.5-vip 및 gpt-image-2-vip를 비교합니다. 채널 특성, 가격, 엔드포인트, 업로드/출력 형식, 속도와 품질 포지셔닝, prompt 준수도를 살펴보고 적합한 모델을 선택하세요.

## 핵심 요약

| 필요한 항목 | 추천 모델 |
| - | - |
| **`quality` 노브 / 마스크 인페인팅 / 임의의 사용자 지정 크기(30개 프리셋 외) / 엄격한 OpenAI-API 필드 일치** | 공식 직결, token 기반 과금: `gpt-image-2.5-flare`(속도 우선) / `gpt-image-2.5-sunburst`(편집 정밀도 우선) / `gpt-image-2`(이전 세대) |
| **예측 가능한 이미지당 \$0.025 고정 요금 + 빠르고 안정적인 출력(속도가 강점)** | `gpt-image-2-all` / `gpt-image-2.5-all`(역공학, ChatGPT 웹 라인, 약 90초, 2.5-all은 Images 2.5 기반) |
| **예측 가능한 이미지당 \$0.03 고정 요금 + 고정 크기(4K 포함 30개 프리셋)** | `gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`(역공학, Adobe 라인, 두 2.5 모델은 6개 `quality` 등급 모두 지원, `gpt-image-2-vip`는 최대 `high`까지 지원) |

8개 모델 모두 **내부적으로 OpenAI의 GPT-Image 2.5 / 2 시리즈를 기반으로 구축**되었습니다. 차이점은 채널 특성(공식 직결 대 역공학), 과금 모델 및 파라미터 세분성에 있습니다. 3개의 공식 모델은 가격과 파라미터를 공유하며, 5개의 역공학 모델은 동일한 호출 형식을 공유합니다(두 `-all` 모델은 이미지당 \$0.025, `-vip` 3종 모델은 이미지당 \$0.03).

<Note>
  **3가지 역공학 라인(-all / 2.5-all / -vip 3종)**: 이 페이지의 "역공학" 열은 **`gpt-image-2-all`**, **`gpt-image-2.5-all`** 및 **`gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`**(별칭 `gpt-image-2.5-vip` = sunburst-vip)를 다룹니다. 모두 동일한 호출 형식을 공유하며(3개의 `-vip` 모델은 추가로 `size` 지원) 호출당 과금됩니다. 두 `-all` 모델은 이미지당 \$0.025, `-vip` 3종 모델은 이미지당 \$0.03입니다:

  * `gpt-image-2-all` / `gpt-image-2.5-all`: ChatGPT 웹 라인, 생성 시간 **약 90초** — **속도가 강점**입니다. 2.5-all은 Images 2.5 기반입니다.
  * `gpt-image-2-vip` 및 두 2.5 -vip 모델: Adobe 라인(Firefly), **`size` 고정(4K 포함 30개 프리셋)**. 3개 모델 모두 `quality`를 수용합니다(채널 동작 특성이며 보장 사항은 아님). 두 2.5 모델은 2026-09-10 재테스트에서 `xhigh` / `max`를 지원하기 시작하여 현재 6개 등급을 모두 수용하며, `gpt-image-2-vip`는 최대 `high`까지 지원합니다. 3개 모델 모두 투명 배경을 반환합니다. flare-vip는 더 부드러운 느낌으로 가장 빠르며, sunburst-vip는 시각적으로 `gpt-image-2-vip`에 가깝습니다.
  * 공통점: 모두 `n`을 지원하지 않습니다. 모든 모델에서 `mask`는 전체 이미지 재생성이며, 마스크 처리된 영역만 수정된다는 보장은 없습니다.

  정밀한 마스크 인페인팅, 30개 프리셋을 벗어난 임의의 사용자 지정 크기 또는 `n` > 1이 필요한 경우에는 공식 모델(`gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`)을 사용하십시오.
</Note>

<Tip>
  **현재 속도 관련 안내**: **OpenAI 업스트림 연산 자원 변동**으로 인해 `-all` / `-vip` 생성이 **출시 초기보다 느려졌습니다**. 이는 APIYI뿐만 아니라 모든 역공학 채널 사용자에게 영향을 미칩니다. 당사의 계정 풀과 운영 상태는 정상입니다. 클라이언트 타임아웃을 300초 이상으로 설정하시고, 복잡한 prompt에는 시간적 여유를 더 충분히 두시기 바랍니다.
</Tip>

## 전체 비교 표

| 구분 | **gpt-image-2-all / 2.5-all / -vip** (역공학, 가성비) | **gpt-image-2.5-flare / sunburst / gpt-image-2** (공식) |
| - | - | - |
| **모델명** | `gpt-image-2-all` (가장 빠름) / `gpt-image-2.5-all` (동일 라인의 2.5 버전) / `gpt-image-2-vip` (화질 우선, 크기 고정) / `gpt-image-2.5-flare-vip` · `gpt-image-2.5-sunburst-vip` (동일 라인의 2.5 버전, 별칭 `gpt-image-2.5-vip`) | `gpt-image-2.5-flare` (속도 우선) / `gpt-image-2.5-sunburst` (편집 정밀도 우선) / `gpt-image-2` (이전 세대) |
| **채널 특성** | `-all` / `2.5-all`: ChatGPT 웹 라인 역공학<br />`-vip` 3개 모델: Adobe 라인 역공학 (Firefly, 업스케일링이 아닌 고화질 GPT-Image 2.5 역공학 라인) | 공식 직결 (OpenAI Images API), 3개 모델 모두 동일한 가격 및 파라미터 적용 |
| **가격 책정** | **호출당 과금**: `-all` 2개 모델은 호출당 균일 \$0.025, `-vip` 3개 모델은 호출당 \$0.03 | **token 종량 과금**: 공식 가격과 동일, APIYI 충전 보너스 적용 시 정가의 **약 85%** |
| **이미지당 일반적인 비용** | 크기/품질에 관계없이 \$0.025 (`-all`) / \$0.03 (`-vip`) | 실측 **\$0.03 – \$0.2** (prompt 길이, 크기, 품질과 연동) |
| **token 그룹** | 기본(Default) | 기본(Default) |
| **token 유형** | **호출당(Per-call)** 또는 **token 우선(Token-priority)** 모두 사용 가능 | **token 우선(Token-priority) 전용** (해당 모델은 token 과금 방식이며, 호출당 token은 거부됩니다) |
| **권장 엔드포인트** | **`/v1/images/generations` + `/v1/images/edits`** (더 안정적이고 업스트림 공급이 원활하며 공식 코드와 동일함 — 리스크 제어 변동 시 `model` 이름만 변경하여 전환 가능) | `/v1/images/generations` + `/v1/images/edits` |
| **업로드 형식** | multipart file (edits 엔드포인트) | multipart file (edit 엔드포인트) |
| **출력 형식** | `b64_json` (기본값, **접두사 없는 순수 base64**, 2026-07 검증 완료, 이전 버전에는 접두사 포함됨) 또는 `url` (R2 CDN) | `b64_json` (**접두사 없는 순수 base64**) |
| **참조 이미지 수** | 다중 지원 | **최대 16개** (`image[]`) |
| **마스크 인페인팅** | `-all` / `2.5-all`: ❌ 미지원<br />`-vip` 3개 모델: ⚠️ 파라미터는 수용하나 전체 이미지 재생성 방식 — 실제 사진 대상 3회 테스트 결과 내부/외부 변경 비율이 약 1로 측정됨 (2026-09-09), 마스크 영역만 수정된다는 보장 없음 | ✅ 지원 (알파 채널 필요) |
| **prompt 준수율** | 우수함 | **매우 뛰어남** |
| **생성 속도** | `-all`: 약 **90초** (속도가 장점)<br />`gpt-image-2-vip`: 약 **90–150초**<br />2.5 -vip 2개 모델: 연속 1024² 테스트 결과 flare 22–138초, sunburst 37–120초로 측정되어 편차가 큼. 500 RPM 이내에서는 동시 실행 수 계획이 필요하지 않으며 간헐적인 429 오류는 백오프 후 재시도하거나 [실시간 업데이트](/en/live) 확인<br />📌 현재 출시 시점보다 느림 — 이는 APIYI 측 문제가 아닌 OpenAI 업스트림 연산 자원 문제임 | `gpt-image-2.5-flare`: 공식 모델 중 가장 빠름, 1K `low` 기준 약 10초 측정 (2026-09-09)<br />`gpt-image-2.5-sunburst`: 1K `low` 기준 약 14초 측정, 고화질에서는 더 느림<br />`gpt-image-2`: 약 **100–120초**, 복잡한 4K 작업은 3–5분에 달할 수 있음 |
| **품질 성향** | `-all` / `2.5-all`: 양호 (동일 라인이며 두 이름은 동일한 이미지를 생성함)<br />`-vip`: 동일 크기 prompt 6개 육안 평가 시 sunburst-vip는 `gpt-image-2-vip`에 가깝고, flare-vip는 장식적인 디테일이 적고 더 부드러움. 중국어 제목 획은 3개 모델 모두 정확함 | 안정적임. 두 2.5 모델 모두 gpt-image-2보다 뛰어나며 sunburst가 가장 높고, `quality=xhigh` / `max`에서 최고 성능을 발휘함 |
| **`size` 파라미터** | `-all` / `2.5-all`: ❌ 지원 안 됨 (prompt에 기술)<br />`-vip` 3개 모델: ✅ **복구됨** (2026-07-22 이후), 30개 프리셋 크기 제공(4K 포함). images 엔드포인트 전용이며 chat 엔드포인트에서는 미지원. `size` 생략 시 `gpt-image-2-vip` / sunburst-vip는 2048×2048, flare-vip는 고정 1024×1536 반환 (업스트림 기본값이 이전에 변경된 적 있음) — 프리셋을 전달하여 고정 권장 | ✅ 모든 유효한 커스텀 크기 지원 |
| **4K 지원** | `-all` / `2.5-all`: ❌<br />`-vip` 3개 모델: ✅ 4K Detail 등급 지원 (예: `3840x2160` / `2880x2880`), 추가 요금 없음 | ✅ `3840×2160` 포함 |
| **일반적인 출력 크기** | `-all`: 16:9 → 1672×941, 9:16 → 941×1672, 1:1 → 1254×1254 (적응형)<br />`-vip` 3개 모델: 30개 프리셋 (10개 비율 × 1K/2K/4K), [30개 전체 크기 표](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) 참조. 프리셋 외의 크기는 오류가 발생하지 않으나 16의 배수로 정렬되거나 최소 가장자리 크기로 상향 조정됨 | 8개 프리셋 + 유효한 모든 커스텀 크기 |
| **`quality` 파라미터** | `-all` / `2.5-all`: ❌ 거부됨 (전달하지 마십시오)<br />`-vip` 3개 모델: ✅ 실측 결과 채널 동작 확인(보장 사항 아님) — 2.5 2개 모델은 6개 등급 `auto` / `low` / `medium` / `high` / `xhigh` / `max`을 모두 지원(`xhigh` / `max`은 2026-09-10 오픈), `gpt-image-2-vip`는 `high`까지 지원 | ✅ `low` / `medium` / `high` / `xhigh` / `max` / `auto` (`xhigh` / `max`은 2.5 2개 모델에서만 지원) |
| **`quality` 등급 대응 관계** | 2048×1152 기준 출력 tokens: `gpt-image-2-vip` low 157 / medium 1,413 / high 5,650, 2.5 -vip 2개 모델 low 157 / medium 367 / high 1,413 / xhigh 2,511 / max 5,650 — \*\*2.5 `high` = `gpt-image-2-vip` `medium`, 2.5 `max` = `gpt-image-2-vip` `high`\*\*로 공식 2.5 대 gpt-image-2와 동일한 관계임. 호출당 과금이므로 등급에 따라 가격이 변하지 않음 | 1024² 기준 출력 tokens: 공식 2.5 low 196 / medium 439 / high 1,756 / xhigh 3,122 / max 7,024, `gpt-image-2` low 196 / medium 1,756 / high 7,024 — 공식 2.5 `high` = `gpt-image-2` `medium`, token 종량 과금 |
| **`n` 파라미터** | ❌ 리버스 5개 모델 모두 미지원 (호출당 이미지 1개) | ✅ 지원 |
| **투명 배경** | `-all` / `2.5-all`: ⚠️ `background` 파라미터 없음, prompt로만 제어 가능하며 간혹 불안정함<br />`-vip` 3개 모델: ✅ 테스트 시 `background: "transparent"` 설정으로 알파 PNG가 반환됨 (보장 사항 아님) | ✅ 파라미터로 제어되며 안정적임 — `background: "transparent"` 및 `png` / `webp` |
| **중국어 prompt** | ✅ 네이티브 지원 | ✅ 네이티브 지원 |
| **텍스트 렌더링** | 높은 충실도 | 높은 충실도 (`high` 등급에서 가장 뛰어남) |
| **API 문서** | [GPT-Image-2.5-All 개요](/ko/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2.5-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview) | [GPT-Image-2.5 / 2 개요](/ko/api-capabilities/gpt-image-2/overview) |

<Info>
  🔑 **API token 생성 또는 관리**: [https://api.apiyi.com/token](https://api.apiyi.com/token)\
  콘솔에서 token을 생성할 때 그룹(`Default` 선택 가능)과 token 유형(**호출당(Per-call)** / **token 우선(Token-priority)**)을 선택하십시오. **공식 3개 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`)을 호출하려면 “token 우선(Token-priority)” token이 필요합니다.** 과금 모드 불일치로 인해 호출당 token은 거부됩니다.
</Info>

## 상황별 모델 선택 가이드

### `gpt-image-2-all` / `gpt-image-2.5-all` (Reverse) 모델을 선택하는 경우

<CardGroup cols={2}>
  <Card title="💰 예측 가능한 비용" icon="dollar-sign">
    크기/품질 등급 구분 없이 이미지당 \$0.025(2026-10-10에 \$0.03에서 인하됨)의 안정적인 가격을 제공하며, 충전 보너스를 적용하면 더 저렴해집니다. **엄격한 비용 한도가 정해진 대량 제작**(인포그래픽, 마케팅 에셋, 이커머스 썸네일)에 이상적입니다.
  </Card>

  <Card title="⚡ 더 빠른 출력" icon="bolt">
    약 90초의 생성 시간으로 `-vip` 및 공식 버전보다 **약간 더 빠릅니다**. **더 나은 실시간 사용자 경험을 제공합니다.**
  </Card>

  <Card title="🔁 하나의 코드베이스로 언제든 전환 가능" icon="repeat">
    표준 Images API 형식 — 3개의 `-vip` 모델 및 3개의 공식 모델과 **동일한 코드**를 사용하며, `model` 이름만 변경하여 전환하거나 폴백할 수 있습니다. `gpt-image-2-all` 및 `gpt-image-2.5-all`은 가격과 동작 방식이 동일하며, 새 모델명은 ChatGPT 웹이 Images 2.5로 전환된 점을 반영한 것입니다.
  </Card>

  <Card title="🌏 중국어 및 마케팅 텍스트" icon="type">
    기본 중국어 prompt 지원, 간판/포스터/인포그래픽을 위한 뛰어난 텍스트 렌더링 — **중국어권 타깃 콘텐츠 제작에 매우 적합합니다**.
  </Card>
</CardGroup>

### 3가지 `-vip` 모델(Reverse, 크기 고정)을 선택하는 경우

<CardGroup cols={2}>
  <Card title="🎚️ quality 지원(2.5 버전의 6개 등급 모두 지원)" icon="sliders-horizontal">
    테스트 결과 `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`은 `auto`부터 `max`까지 6개 등급을 모두 수용합니다(`xhigh` / `max`은 2026-09-10 오픈). `gpt-image-2-vip`은 `high`까지 지원합니다. 이는 채널 자체의 동작 방식이며 보장된 사양은 아닙니다. 등급 매핑: 2.5 `high`은 `gpt-image-2-vip` `medium`와만 같고, 2.5 `max`은 `gpt-image-2-vip` `high`와 같습니다. 등급에 관계없이 \$0.03 단일 가격이 유지됩니다.
  </Card>

  <Card title="⏱️ 3가지 모델 중 선택 기준" icon="hourglass">
    flare-vip은 가장 빠르고 부드러운 느낌을 주며, sunburst-vip은 더 높은 품질과 편집 정밀도를 보여주어 `gpt-image-2-vip`에 가깝습니다. 세 모델 모두 동일한 최상위 token 등급(2.5의 `max`, `gpt-image-2-vip`의 `high`)에 도달합니다. 세 모델 모두 `-all`보다 느리며(1024² 해상도의 `max` 측정 기준 80\~160초), 대기 시간이 길어져도 괜찮을 때 선택하십시오.
  </Card>

  <Card title="🖼️ 크기 고정 / 4K" icon="expand">
    `size` 매개변수가 **복구되었습니다**(2026-07-22부터). 30가지 사전 설정 크기(10개 비율 × 1K/2K/4K)를 지원합니다. 이커머스 히어로 샷, 포스터 템플릿, 4K 배경화면을 정확한 크기로 생성할 수 있으며, 4K 추가 요금 없이 이미지당 \$0.03 단일 요금이 적용됩니다.
  </Card>

  <Card title="🔁 -all 모델과 코드 공유" icon="copy">
    `-all`와 동일한 요청 구조(`size` 필드 하나만 추가)로, 속도/품질 선호도에 따라 `model` 이름만 변경하여 **하나의 코드베이스로 5개의 모든 reverse 모델을 전환**할 수 있습니다.
  </Card>
</CardGroup>

<Note>
  `-vip`의 `size`은 `/v1/images/generations` 및 `/v1/images/edits` 엔드포인트에서만 작동하며, **`/v1/chat/completions` chat 엔드포인트는 `size`을 지원하지 않습니다**. 30개 사전 설정 이외의 임의 사용자 지정 크기나 정밀한 마스크 인페인팅이 필요한 경우 공식 모델(`gpt-image-2.5-flare` / `sunburst`)을 사용하십시오. 이 매개변수의 가용성은 업스트림 변경 사항을 따르므로 최신 상태는 [실시간 업데이트](/en/live)를 확인하시기 바랍니다.
</Note>

### 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`)을 선택하는 경우

<CardGroup cols={2}>
  <Card title="🎚️ 품질 등급" icon="sliders-horizontal">
    6개의 `quality` 등급이 모두 제공되며 **공식적으로 보장**되므로 공식 사양에 따라 등급과 token 수가 안정적으로 유지됩니다. reverse 2.5 -vip 모델도 6개 등급을 모두 오픈했지만(2026-09-10 측정 기준), 이는 별도 보장이 없는 채널 동작이며 `gpt-image-2-vip`은 여전히 `high`까지만 지원합니다.
  </Card>

  <Card title="🎯 마스크 인페인팅" icon="paintbrush">
    알파 채널 마스크를 지원하여 **나머지 영역을 보존하면서 특정 영역을 정밀하게 수정**할 수 있습니다. reverse 모델은 전체 이미지를 재생성할 뿐 마스크 영역만 수정하는 것을 보장하지 않습니다.
  </Card>

  <Card title="🖼️ 임의의 사용자 지정 크기" icon="expand">
    `size`은 사전 설정에 국한되지 않고 **유효한 모든 해상도**(4K 포함)를 수용합니다. `-vip` 3종 모델은 30개의 사전 설정만 보장하며 그 외의 크기는 재작성하므로, **엄격한 사용자 지정 크기가 필요하다면 공식 모델을 사용하십시오**.
  </Card>

  <Card title="🔌 OpenAI 공식과 동일" icon="plug">
    공식 Images API를 통해 전달되며, 필드와 동작이 OpenAI 공식과 동일합니다. **기존 OpenAI SDK 기반 코드 및 시스템을 변경 없이 그대로 마이그레이션**하여 장기적으로 안정적으로 운영할 수 있습니다.
  </Card>
</CardGroup>

## 세부 주요 차이점

### 1. b64\_json 형식 주의사항 (마이그레이션 함정!)

2026년 7월 확인 결과, 공식 및 리버스 모델 모두 \*\*순수 base64(`data:` 접두사 없음)\*\*를 반환합니다. 하지만 `gpt-image-2-all`에는 접두사가 포함되었던 적이 있으므로, 가장 안전한 공통 코드는 이를 먼저 확인하는 방식입니다:

```python theme={null}
# Universal pattern: detect the prefix before processing — works for all official and reverse models
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # handles historical prefixed responses
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ write file
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ browser render
```

<Warning>
  공식 모델과 리버스 모델 사이를 전환할 때 **`b64_json` 처리 코드를 반드시 변경해야 합니다**. 그렇지 않으면 손상된 데이터 URL이 생성되거나 디코딩 오류가 발생합니다.
</Warning>

### 2. 해상도 제어

**`gpt-image-2-all` / `gpt-image-2.5-all`** (`size` 필드 없음 — 구도는 prompt에 입력하며, 두 이름의 동작은 동일합니다):

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**`-vip` 3개 모델** (`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`; `size`은 2026-07-22부로 복구됨):

**30개 사전 설정 크기**(10가지 비율 × 1K/2K/4K)를 지원합니다. `size: "WIDTHxHEIGHT"`를 직접 전달하십시오(반드시 30개 사전 설정 중 하나여야 하며, 전체 목록은 [30개 크기 표](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)에 있습니다). 테스트 결과 3개 모델 모두 `quality`도 지원합니다(채널 동작 특성이며 보장 사항은 아님). 2.5 버전의 두 모델은 6개 티어를 모두 지원하며(`xhigh` / `max`는 2026-09-10 오픈), `gpt-image-2-vip`은 최대 `high`까지 지원합니다. 2.5 버전 모델의 `high` 출력 tokens는 `gpt-image-2-vip`의 `medium` 수준에 불과하며, `max`는 해당 모델의 `high` 수준과 같습니다:

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-vip",   # alias = gpt-image-2.5-sunburst-vip; swap in gpt-image-2.5-flare-vip / gpt-image-2-vip on this line only
    prompt="...",
    size="3840x2160",   # ✅ one of the 30 presets; images endpoints only (not chat)
    quality="max"       # optional; all six tiers on the 2.5 models, gpt-image-2-vip stops at high; flat $0.03 regardless of tier
)
```

**공식 모델** (`size` 엄격 준수 + `quality` 티어, 예제에서는 `gpt-image-2.5-flare`를 사용하며, 모델 이름만 변경하여 `sunburst` / `gpt-image-2`로 교체 가능):

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="max"       # all six tiers; xhigh / max on the two 2.5 models only; 2.5 high only equals gpt-image-2 medium
)
```

### 3. 업로드 / 출력 형식 차이점

| 작업 | 5개 리버스 모델 (`-all` / `2.5-all` / `-vip` 3종) | 3개 공식 모델 (`2.5-flare` / `2.5-sunburst` / `gpt-image-2`) |
| - | - | - |
| **참조 업로드** | multipart `image` 파일 필드 (edits 엔드포인트) | multipart `image[]` 파일 필드 |
| **출력 다운로드** | 기본값 `b64_json` (순수 base64, 2026-07 확인), 명시적 `response_format: "url"` 설정 시 R2 CDN 링크 반환 (**24시간 유효**) | `b64_json` (**순수 base64**, 디코딩 필요) |
| **다중 이미지 합성** | edits 엔드포인트에서 `image` 필드 반복 사용 | `image[]` 배열, **최대 16개** |

### 4. 대략적인 비용 비교

| 시나리오 | 5개 리버스 모델 (`-all` / `2.5-all` \$0.025, `-vip` 3종 \$0.03) | 공식 `gpt-image-2.5-flare` / `sunburst` | 공식 `gpt-image-2` |
| - | - | - | - |
| 1024×1024 초안 (`low`) | \$0.025 / \$0.03 | 약 \$0.006 (196 tok) | 약 \$0.006 (196 tok) |
| 1024×1024 중간 품질 (`medium`) | \$0.025 / \$0.03 | 약 \$0.013 (439 tok) | 약 \$0.053 (1,756 tok) |
| 1024×1024 고품질 (`high`) | \$0.025 / \$0.03 | 약 \$0.053 (1,756 tok) | 약 \$0.211 (7,024 tok) |
| 1024×1024 `xhigh` / `max` | \$0.03 (2.5 -vip 모델에서 지원, `gpt-image-2-vip`은 `high`까지만 지원, `-all`은 `quality` 거부) | 약 \$0.094 (3,122 tok) / 약 \$0.211 (7,024 tok) | ❌ 미지원 |
| 2048×1152 고품질 | \$0.03 (`-vip`, `-all`은 1K–1.5K만 출력) | token 종량 과금, `high` 기준 약 `gpt-image-2` `medium` | 약 \$0.20+ (token 종량 과금) |
| 3840×2160 4K 고품질 | \$0.03 (`-vip` 4K Detail 티어, 추가 요금 없음, `-all` / `2.5-all`는 4K 미지원) | token 종량 과금, **1K 대비 대폭 상승** | token 종량 과금, **1K 대비 대폭 상승** |
| 편집 / 다중 이미지 합성 | \$0.025 / \$0.03 | 입력 tokens 급증, 단일 호출 시 \$0.1+ 도달 가능 | 입력 tokens 급증, 단일 호출 시 \$0.1+ 도달 가능 |

공식 수치는 대략적인 값입니다. 2026-09-09에 측정한 출력 tokens × 100만 개당 \$30 기준이며, prompt 입력 tokens는 제외된 수치입니다(일반적으로 \$0.001 미만).

<Note>모델 가격은 공식 가격에 맞춰 조정되며 제공업체가 가격을 변경할 경우 변동될 수 있습니다. 위 표는 참고용일 뿐이며 상단 내비게이션의 **모델 요금** 탭이 기준이 됩니다: [모델 요금](/en/models/index).</Note>

<Info>
  **요약**: 배치 작업이나 저품질 작업의 경우 리버스 채널이 항상 더 저렴한 것은 아닙니다(1K `low`는 공식 티어가 실제로 더 저렴하며, 2.5 버전의 두 모델은 `medium` / `high`에서도 약 \$0.013 / \~\$0.053에 불과합니다). 리버스 채널의 \$0.025–0.03 가격대는 **중상급 품질 범위**(`gpt-image-2`의 `medium` 이상, 2.5 모델의 `xhigh` 이상)에서 가장 유리합니다. **`quality` 티어 / 마스크 인페인팅 / 고정 크기, 4K / 엄격한 OpenAI API 필드 일치**가 필요한 경우에는 공식 모델(token 종량 과금)을 선택하십시오.
</Info>

## 클라이언트 설정

| 설정 | 5개 리버스 모델(`-all` / `2.5-all` / `-vip` 트리오) | 3개 공식 모델(`2.5-flare` / `2.5-sunburst` / `gpt-image-2`) |
| - | - | - |
| **타임아웃(보수적)** | `-all` / `2.5-all`: **300초** (일반적으로 약 90초)<br />3개 `-vip` 모델: **300초** (일반적으로 120–200초) | `low` / `medium`의 2.5 모델: **240초**; `high` / `xhigh`: **300초**; `max` 및 `gpt-image-2` `high`: 대체용 **600초** (4K 고품질은 실제로 3-5분 소요) — [공식 개요](/ko/api-capabilities/gpt-image-2/overview)의 티어 표를 참조하십시오 |
| **재시도 전략** | 5xx / 타임아웃 시 지수 백오프, 최대 2회 재시도 | 동일 |
| **동시 실행 수** | 호출당 이미지 1개 — 여러 개가 필요한 경우 병렬 요청 발행 | 호출당 이미지 1개 — 여러 개가 필요한 경우 병렬 요청 발행 |
| **요청 ID** | `request-id` 응답 헤더 | `x-request-id` 응답 헤더 |

<Tip>
  **8개 모델 모두 공통: 이미지 편집 / 다중 이미지 융합의 경우 각 입력 이미지를 1.5MB 미만으로 압축하십시오** (JPEG 품질 80-90 / 해상도 축소). 간헐적인 `shell_api_error` / `Unknown error` 응답은 대부분 과도하게 큰 입력으로 인해 발생합니다 — 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다. **출력 해상도는 입력 크기와 무관합니다** — 품질은 입력 파일 크기가 아니라 출력 측에서 설정됩니다(공식 모델은 `size` + `quality`, `-vip` 트리오는 `size` 티어 + `quality`, `-all` / `2.5-all`는 prompt 문구).
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="입력 이미지를 압축해야 합니까? prompt에 4K / 8K를 작성하면 도움이 됩니까?">
    **예, 강력히 권장합니다.** 8개 모델 모두 각 입력 이미지를 **1.5MB 미만**(JPEG 품질 80-90 / 축소된 해상도)으로 압축하십시오. 간헐적인 `shell_api_error` / `Unknown error` 응답은 입력 크기가 너무 클 때 가장 빈번하게 발생하며, 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다.

    **압축으로 인한 화질 저하는 걱정하지 마십시오** — 출력 해상도는 입력 크기와 무관합니다. 세 계열 간 “출력 측” 제어 방식은 서로 다릅니다:

    * `gpt-image-2-all` / `gpt-image-2.5-all`: prompt 구도 표현으로 제어합니다([-all 개요 페이지](/ko/api-capabilities/gpt-image-2-all/overview)의 검증된 표현 표 참조) — prompt 내 `4K` / `8K` 표기는 적용되지 않습니다
    * 세 가지 `-vip` 모델(`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`): `size` 필드(4K 포함 30개 사전 설정 크기)로 제어하며, 선택적으로 `quality`을 함께 사용합니다(2.5 모델에서는 6개 등급, `gpt-image-2-vip`에서는 최대 `high`까지) — prompt 내 `4K` / `8K` 표기 역시 적용되지 않습니다
    * 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`): `size` + `quality`(유효한 모든 크기)로 제어합니다

    요약: 입력을 줄이면 속도만 빨라집니다 — 화질은 입력 파일 크기가 아니라 출력 측 구성에 의해 결정됩니다.
  </Accordion>

  <Accordion title="동일한 API Key로 8개 모델을 모두 호출할 수 있습니까?">
    예. 8개 모델 모두 Default 그룹에서 실행되므로, 동일한 API Key로 추가 구성 없이 호출할 수 있습니다. 참고: 공식 모델을 호출하려면 “Token-priority” token이 필요하며, `-all` / `-vip`은 두 token 유형을 모두 지원합니다.
  </Accordion>

  <Accordion title="역방향 채널에서는 어떤 엔드포인트를 사용해야 합니까?">
    두 가지 이유로 **OpenAI Images API**(텍스트-이미지 변환의 경우 `/v1/images/generations` + 편집의 경우 `/v1/images/edits`)를 **사용하십시오**:

    1. **더 안정적임**: Images API 채널의 업스트림 리소스 공급이 더 풍부하여 호출 성공률이 더 높습니다
    2. **쉬운 전환을 위한 공식 릴레이와의 호환성**: 호출 방식 및 매개변수 형식이 세 가지 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`)과 완벽히 호환되므로, 역방향 채널에서 위험 제어 불안정이 발생하더라도 코드 변경 없이 **`model` 이름만 바꾸면 공식 릴레이로 전환**할 수 있습니다

    채팅 기반 엔드포인트(`/v1/chat/completions`, **더 이상 권장되지 않음**)도 제공되지만, 다중 턴 반복 편집이나 온라인 이미지 URL을 직접 전달할 때만 유용합니다. 이미지 생성 의도가 모호할 경우 이미지 대신 일반 텍스트가 반환될 수 있으니 주의하십시오(“Generate an image:”와 같은 고정 접두사를 앞에 추가하여 의도를 강화하십시오). 전체 매개변수는 [-all 채팅 기반 API 참조](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip 채팅 기반 API 참조](/en/api-capabilities/gpt-image-2-vip/chat-completions)를 확인하십시오.
  </Accordion>

  <Accordion title="역방향 채널에서 -all과 -vip 중 어느 것을 선택해야 합니까?">
    두 라인 모두 동일한 호출 형식을 갖춘 리버스 엔지니어링 채널(-all \$0.025/이미지, -vip \$0.03/이미지)입니다(`-vip` 3개 모델은 `size` 고정 및 `quality`을 추가로 지원하며, 2.5 모델에서는 6개 등급 모두 지원). 차이점은 **속도 대 화질 + 크기 고정**입니다:

    * **생성 시간**: `-all` / `2.5-all` 약 90초 — **속도가 장점**입니다. `-vip` 3개 모델은 약 120–200초입니다. 현재 OpenAI 업스트림 연산 자원 변동으로 인해 출시 시점보다 느립니다
    * **화질**: `-vip`(Adobe 라인)의 디테일 렌더링이 **더 뛰어난 경우가 있습니다** — 서두르지 않고 쇼케이스용 이미지를 제작할 때 적합합니다. 3개 모델 중 sunburst-vip은 `gpt-image-2-vip`에 가깝고 flare-vip은 더 부드럽습니다
    * **크기 고정**: `-vip` 3개 모델은 30개의 사전 설정 `size` 값(4K 포함)을 지원합니다. `-all` / `2.5-all`은 `size`을 지원하지 않으므로 구도를 prompt에 지정해야 합니다

    결정 가이드: 빠른 출력을 원하는 경우 → `-all` / `2.5-all`, 고정된 크기 / 4K가 필요한 경우 → `-vip` 3개 모델, 30개 사전 설정 이외의 커스텀 크기 또는 정밀한 마스크가 필요한 경우 → 공식 모델. 자세한 내용은 [GPT-Image-2.5-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview)를 참조하십시오.
  </Accordion>

  <Accordion title="-vip 내에서 2.5 2개 모델과 gpt-image-2-vip 중 어느 것을 선택해야 합니까?">
    가격, 그룹, 호출 형식이 동일합니다(2026-09-09 동일 채널 및 token에서 253개 요청을 3개 모델에 걸쳐 비교한 결과 규약이 완전히 동일한 것으로 확인되었습니다). 세 가지만 다릅니다:

    * **등급**: 2.5 모델은 6개 등급을 모두 지원하며(2026-09-10에 `xhigh` / `max` 오픈), `gpt-image-2-vip`은 최대 `high`까지 지원합니다. 동일한 이름의 등급이라도 실제 값이 다릅니다 — 2048×1152에서 2.5 `high` 1,413 = `gpt-image-2-vip` `medium`이며, 2.5 `max` 5,650 = `gpt-image-2-vip` `high`입니다. 세 모델 모두 동일한 최상위 token 등급에 도달합니다
    * **화질 및 속도**: flare-vip이 가장 빠르며 더 부드러운 느낌과 적은 장식적 디테일을 보여줍니다. sunburst-vip은 `gpt-image-2-vip`와 비슷해 보입니다
    * **기본 크기**: flare-vip은 1024×1536으로 고정되어 있으며, 나머지 둘은 2048×2048입니다. 고정하려면 항상 `size`을 전달하십시오

    별칭 `gpt-image-2.5-vip`은 sunburst-vip입니다. 행별 전체 비교표는 [GPT-Image-2.5-VIP 개요, “-vip 3개 모델 비교” 섹션](/ko/api-capabilities/gpt-image-2-vip/overview)에 나와 있습니다.
  </Accordion>

  <Accordion title="크기 고정 / 4K가 필요합니다 — 어떻게 해야 합니까?">
    우선 `-vip` 3개 모델(기본값은 `gpt-image-2.5-vip`, 최고 token 등급을 원할 경우 `high`과 함께 `gpt-image-2-vip` 선택)부터 시작하십시오: `size` 매개변수는 2026-07-22에 복원되었으며, 4K 추가 요금 없이 이미지당 일괄 \$0.03로 \*\*30개의 사전 설정 크기(10개 비율 × 1K/2K/4K)\*\*를 지원합니다. `size`은 images 엔드포인트에서만 작동하며 30개 사전 설정 중 하나여야 합니다.

    **30개 사전 설정 이외의 모든 유효한 크기**, **공식적으로 보장된 `quality` 등급**(`-vip` 등급은 별도 보장이 없는 채널 동작임), **정밀한 마스크 인페인팅**(알파 채널 마스크) 또는 **엄격한 OpenAI-API 필드 동등성**(기존 OpenAI-SDK 코드에 대한 무변경 마이그레이션)이 필요한 경우에는 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`, token 기반 과금)을 사용하십시오.
  </Accordion>

  <Accordion title="1.5에서 마이그레이션 — 어떤 것을 선택해야 합니까?">
    * **OpenAI SDK를 유지해야 하거나 OpenAI 공식과 일치해야 하는 경우, 또는 30개 사전 설정 이외의 커스텀 크기가 필요한 경우**: 공식 모델(텍스트-이미지 변환은 `gpt-image-2.5-flare`, 편집은 `gpt-image-2.5-sunburst`)을 선택하십시오. `input_fidelity`을 제거하고 나머지는 그대로 유지하십시오(`background: transparent`는 계속 작동함).
    * **비용 절감 및 빠른 출력을 원하는 경우**: `gpt-image-2.5-all`(역방향, 약 90초, `gpt-image-2-all`와 동일한 가격 및 동작)을 선택하십시오.
    * **비용 절감, 화질 우선 또는 크기 고정 / 4K가 필요한 경우**: `gpt-image-2.5-vip`(역방향, 약 120–200초, 4K 포함 30개 사전 설정 크기, `quality` 6개 등급 모두 지원, `gpt-image-2-vip`은 `high`까지만 지원)를 선택하십시오.
  </Accordion>

  <Accordion title="장애 조치(failover)를 위해 여러 모델을 배포할 수 있습니까?">
    예. 일반적인 패턴은 다음과 같습니다: **기본 `2.5-all` 또는 `2.5-vip`**(예측 가능한 비용 — 속도 / 화질 선호도에 따라 선택), **공식 `gpt-image-2.5-flare` / `sunburst`로의 폴백**(`quality` 등급, 마스크 또는 30개 사전 설정 이외의 커스텀 크기가 필요할 때 전환). 역방향과 공식의 응답 구조가 다르므로 비즈니스 계층에서 정규화하십시오.
  </Accordion>

  <Accordion title="R2 CDN 이미지 링크가 느립니다 — 어떻게 해야 합니까?">
    [CDN 다운로드 속도가 느린 경우 해결 방법](/ko/faq/cdn-download-slow)을 참조하십시오
  </Accordion>
</AccordionGroup>

## 관련 문서

* [GPT-Image-2.5 / 2 개요](/ko/api-capabilities/gpt-image-2/overview) - 세 가지 공식 모델을 위한 전체 통합 문서
* [GPT-Image-2.5-All 개요](/ko/api-capabilities/gpt-image-2-all/overview) - 역방향 ChatGPT-web 라인(가장 빠른 출력, `gpt-image-2.5-all` / `gpt-image-2-all`) 전체 통합 문서
* [GPT-Image-2.5-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview) - 역방향 Adobe 라인(`gpt-image-2.5-vip` 시리즈 및 `gpt-image-2-vip`, `size` 잠금, `quality` 등급) 전체 통합 문서
* [심층 분석: GPT-image-2.5 출시](/en/news/gpt-image-2-5-launch) - 2.5 듀얼 모델 출시
* [심층 분석: gpt-image-2 출시](/en/news/gpt-image-2-launch) - 공식 버전 출시
* [심층 분석: gpt-image-2-all 출시](/en/news/gpt-image-2-all-launch) - 리버스 엔지니어링 버전 출시
* [커뮤니티: Luck GPT-Image 2 ComfyUI 노드](/ko/scenarios/ecosystem/luckgpt2-comfyui) - 멀티 모델 ComfyUI 노드 팩
* [커뮤니티: APIYI GPT-Image 2 Skills](/ko/scenarios/ecosystem/apiyi-gpt-image-skills) - 멀티 모델 AI Agent Skill 팩
* [입금 프로모션](/ko/faq/recharge-promotions) - 충전 보너스 정책


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.