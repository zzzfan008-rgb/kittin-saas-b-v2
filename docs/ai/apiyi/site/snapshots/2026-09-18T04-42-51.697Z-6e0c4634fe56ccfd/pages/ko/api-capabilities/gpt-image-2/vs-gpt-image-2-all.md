> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2.5 / 2 공식 버전 vs 리버스 버전

> 공식 gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2와 리버스 엔지니어링된 자매 모델 gpt-image-2.5-all, gpt-image-2-all, gpt-image-2.5-vip 및 gpt-image-2-vip를 비교합니다. 채널 특성, 가격, 엔드포인트, 업로드/출력 형식, 속도와 품질 포지셔닝, prompt 준수도를 살펴보고 적합한 모델을 선택하세요.

## 요약

| 필요한 경우                                                                          | 선택                                                                                                                                                              |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`quality` 조절 / 마스크 인페인팅 / 임의의 사용자 지정 크기(30개 프리셋 초과) / 엄격한 OpenAI-API 필드 호환성** | 공식, token 기반 과금: `gpt-image-2.5-flare` (속도 우선) / `gpt-image-2.5-sunburst` (편집 정밀도 우선) / `gpt-image-2` (이전 세대)                                                   |
| **예측 가능한 이미지당 \$0.03 정액 + 빠른 출력(속도가 장점)**                                       | `gpt-image-2-all` / `gpt-image-2.5-all` (리버스, ChatGPT 웹 라인, 약 90초; 2.5-all은 Images 2.5 기반)                                                                      |
| **예측 가능한 이미지당 \$0.03 정액 + 고정 크기(4K 포함 30개 프리셋)**                                | `gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` (리버스, Adobe 라인; 두 2.5 모델은 `quality`의 6개 티어를 모두 지원하며, `gpt-image-2-vip`는 최대 `high`) |

8개 모델은 모두 내부적으로 **OpenAI의 GPT-Image 2.5 / 2 시리즈를 기반으로 구축되었습니다**. 차이점은 채널 특성(공식 직접 연결 vs 리버스 엔지니어링), 가격 모델 및 파라미터 세분성에 있습니다. 3개의 공식 모델은 가격과 파라미터를 공유하며, 5개의 리버스 모델은 가격과 호출 형식을 공유합니다.

<Note>
  **세 가지 리버스 라인(-all / 2.5-all / -vip 트리오)**: 이 페이지의 “리버스” 열은 **`gpt-image-2-all`**, **`gpt-image-2.5-all`** 및 **`gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`**(별칭 `gpt-image-2.5-vip` = sunburst-vip)을 다룹니다. 모두 이미지당 \$0.03 정액 가격과 동일한 호출 형식을 공유합니다(세 개의 `-vip` 모델은 추가로 `size`를 지원합니다):

  * `gpt-image-2-all` / `gpt-image-2.5-all`: ChatGPT 웹 라인, **약 90초** 생성 — **속도가 장점**입니다. 2.5-all은 Images 2.5 기반입니다.
  * `gpt-image-2-vip` 및 두 2.5 -vip 모델: Adobe 라인(Firefly), **`size` 고정(4K 포함 30개 프리셋)**; 세 모델 모두 `quality`를 지원합니다(채널 동작이며 보장 사항이 아닙니다): 두 2.5 모델은 2026-09-10 재테스트에서 `xhigh` / `max`를 개방했으며 이제 6개 티어를 모두 지원하고, `gpt-image-2-vip`는 최대 `high`까지 지원합니다. 세 모델 모두 투명 배경을 반환합니다. flare-vip은 더 부드러운 느낌으로 가장 빠르며, sunburst-vip은 시각적으로 `gpt-image-2-vip`와 가깝습니다.
  * 공통 사항: 어느 모델도 `n`를 지원하지 않습니다. 모든 모델에서 `mask`는 전체 이미지 재생성이며, 마스크된 영역만 수정된다는 보장은 없습니다.

  정밀한 마스크 인페인팅, 30개 프리셋을 초과하는 임의의 사용자 지정 크기 또는 `n` > 1이 필요하면 공식 모델(`gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`)을 사용하십시오.
</Note>

<Tip>
  **현재 속도 관련 안내**: `-all` / `-vip` 생성은 **OpenAI 업스트림 컴퓨팅 변동**으로 인해 **출시 당시보다 느립니다**. 이는 APIYI에만 해당하는 것이 아니라 모든 리버스 채널 사용자에게 영향을 줍니다. 계정 풀과 운영 상태는 정상입니다. 클라이언트 timeout을 300초 이상으로 설정하고 복잡한 prompt에는 더 충분한 여유 시간을 두십시오.
</Tip>

## 전체 비교표

| 구분                  | **gpt-image-2-all / 2.5-all / -vip** (역방향, 비용 효율적)                                                                                                                                                                                                                                                       | **gpt-image-2.5-flare / sunburst / gpt-image-2** (공식)                                                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **모델명**             | `gpt-image-2-all` (가장 빠름) / `gpt-image-2.5-all` (동일 라인의 2.5 버전) / `gpt-image-2-vip` (품질 우선, 크기 고정) / `gpt-image-2.5-flare-vip` · `gpt-image-2.5-sunburst-vip` (동일 라인의 2.5 버전, 별칭 `gpt-image-2.5-vip`)                                                                                                    | `gpt-image-2.5-flare` (속도 우선) / `gpt-image-2.5-sunburst` (편집 정밀도 우선) / `gpt-image-2` (이전 세대)                                                                                                    |
| **채널 특성**           | `-all` / `2.5-all`: 역공학으로 구현된 ChatGPT 웹 라인<br />세 가지 `-vip` 모델: 역공학으로 구현된 Adobe 라인(Firefly; 업스케일링이 아닌 고품질 GPT-Image 2.5 역방향 라인)                                                                                                                                                                          | 공식 직접 연결(OpenAI Images API), 세 모델 모두 동일한 가격 및 파라미터                                                                                                                                              |
| **가격**              | **호출당**: 정액 \$0.03/호출(5개 역방향 모델 모두 동일 가격)                                                                                                                                                                                                                                                                | **Token 계량**: 공식 가격과 일치하며, APIYI 충전 보너스 적용 후 정가의 약 **85%**                                                                                                                                      |
| **일반적인 이미지당 비용**    | \$0.03(크기 / 품질 / 모델과 무관)                                                                                                                                                                                                                                                                                 | 측정 기준 **\$0.03 – \$0.2**(prompt 길이, 크기, 품질과 연관)                                                                                                                                                 |
| **Token 그룹**        | 기본값                                                                                                                                                                                                                                                                                                      | 기본값                                                                                                                                                                                             |
| **Token 유형**        | **호출당** 또는 **Token 우선순위** 모두 사용 가능                                                                                                                                                                                                                                                                       | **Token 우선순위만 가능**(이 모델은 token 과금 방식이므로 호출당 tokens은 거부됨)                                                                                                                                        |
| **권장 엔드포인트**        | **`/v1/images/generations` + `/v1/images/edits`** (더 안정적이고 업스트림 공급이 많으며 공식과 코드가 동일함 — 리스크 제어 변동 시 `model` 이름만 바꿔 전환)                                                                                                                                                                                     | `/v1/images/generations` + `/v1/images/edits`                                                                                                                                                   |
| **업로드 형식**          | multipart 파일(편집 엔드포인트)                                                                                                                                                                                                                                                                                   | multipart 파일(편집 엔드포인트)                                                                                                                                                                          |
| **출력 형식**           | `b64_json` (기본값, **접두사 없는 원본 base64**, 2026-07 확인; 이전 버전에는 접두사가 포함됨) 또는 `url` (R2 CDN)                                                                                                                                                                                                                   | `b64_json` (**접두사 없는 원본 base64**)                                                                                                                                                               |
| **참조 이미지 수**        | 여러 개                                                                                                                                                                                                                                                                                                     | **최대 16개**(`image[]`)                                                                                                                                                                           |
| **마스크 인페인팅**        | `-all` / `2.5-all`: ❌ 지원하지 않음<br />세 가지 `-vip` 모델: ⚠️ 허용되지만 전체 이미지 재생성 — 실제 사진에서 3회 실행 시 내부/외부 변경 비율이 약 1로 측정됨(2026-09-09); 마스크 영역만 수정된다는 보장 없음                                                                                                                                                          | ✅ 지원됨(알파 채널 필요)                                                                                                                                                                                 |
| **Prompt 준수도**      | 우수함                                                                                                                                                                                                                                                                                                      | **매우 우수함**                                                                                                                                                                                      |
| **생성 속도**           | `-all`: 약 **90초**(속도가 장점)<br />`gpt-image-2-vip`: 약 **90–150초**<br />두 개의 2.5 -vip 모델: 직렬 1024² 실행에서 flare는 22–138초, sunburst는 37–120초로 측정되어 편차가 큼; 500 RPM 내에서는 동시 실행 수 계획이 필요 없으며, 간헐적인 429는 백오프로 재시도하거나 [실시간 업데이트](/en/live)를 확인<br />📌 현재 출시 당시보다 느림 — APIYI 측 문제가 아닌 OpenAI 업스트림 컴퓨팅 이슈            | `gpt-image-2.5-flare`: 가장 빠른 공식 모델, 1K `low` 약 10초 측정(2026-09-09)<br />`gpt-image-2.5-sunburst`: 1K `low` 약 14초 측정, 고품질에서는 더 느림<br />`gpt-image-2`: 약 **100-120초**, 복잡한 작업 + 4K는 3-5분까지 소요 가능   |
| **품질 경향**           | `-all` / `2.5-all`: 우수함(동일 라인으로, 두 이름은 동일한 이미지를 생성)<br />`-vip`: 동일 크기 prompt 6개를 육안 평가한 결과 sunburst-vip은 `gpt-image-2-vip`에 가깝고, flare-vip은 더 부드러우며 장식 디테일이 적음; 중국어 헤드라인 획은 세 모델 모두 정확함                                                                                                                 | 안정적이며, 두 2.5 모델은 모두 gpt-image-2보다 우수하고 sunburst가 가장 높으며 `quality=xhigh` / `max`는 이를 극대화함                                                                                                        |
| **`size` 파라미터**     | `-all` / `2.5-all`: ❌ 허용되지 않음(prompt에 설명)<br />세 가지 `-vip` 모델: ✅ **복원됨**(2026-07-22부터), 30개 사전 설정 크기(4K 포함); 이미지 엔드포인트에서만 가능하며 chat 엔드포인트에서는 지원하지 않음. `size`를 생략하면 `gpt-image-2-vip` / sunburst-vip은 2048×2048, flare-vip은 고정 1024×1536을 반환함(기본값은 이전에도 업스트림에서 변경된 적 있음) — 고정하려면 사전 설정값을 전달               | ✅ 유효한 모든 사용자 지정 크기                                                                                                                                                                              |
| **4K 지원**           | `-all` / `2.5-all`: ❌<br />세 가지 `-vip` 모델: ✅ 4K Detail 티어(예: `3840x2160` / `2880x2880`), 추가 요금 없음                                                                                                                                                                                                        | ✅ `3840×2160` 포함                                                                                                                                                                                |
| **일반 출력 크기**        | `-all`: 16:9 → 1672×941, 9:16 → 941×1672, 1:1 → 1254×1254(적응형)<br />세 가지 `-vip` 모델: 30개 사전 설정(10개 비율 × 1K/2K/4K), [전체 30개 크기 표](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) 참조; 사전 설정 외의 크기는 오류가 발생하지 않지만 16의 배수로 정렬되거나 최소 변 길이로 상향 조정됨                            | 8개 사전 설정 + 유효한 모든 사용자 지정 크기                                                                                                                                                                     |
| **`quality` 파라미터**  | `-all` / `2.5-all`: ❌ 거부됨(전달하지 마십시오)<br />세 가지 `-vip` 모델: ✅ 측정됨, 채널 동작이며 보장 사항이 아님 — 두 2.5 모델은 6개 티어 `auto` / `low` / `medium` / `high` / `xhigh` / `max`를 모두 지원함(`xhigh` / `max`은 2026-09-10 개방), `gpt-image-2-vip`은 `high`까지 지원                                                                        | ✅ `low` / `medium` / `high` / `xhigh` / `max` / `auto`(두 2.5 모델에서만 `xhigh` / `max`)                                                                                                             |
| **`quality` 티어 정렬** | 2048×1152에서의 출력 tokens: `gpt-image-2-vip` low 157 / medium 1,413 / high 5,650; 두 2.5 -vip 모델은 low 157 / medium 367 / high 1,413 / xhigh 2,511 / max 5,650 — **2.5 `high` = `gpt-image-2-vip` `medium`, 2.5 `max` = `gpt-image-2-vip` `high`**, 공식 2.5와 gpt-image-2 간의 관계와 동일함; 호출당 과금이므로 티어는 가격을 변경하지 않음 | 1024²에서의 출력 tokens: 공식 2.5 low 196 / medium 439 / high 1,756 / xhigh 3,122 / max 7,024; `gpt-image-2` low 196 / medium 1,756 / high 7,024 — 공식 2.5 `high` = `gpt-image-2` `medium`; token 계량 방식 |
| **`n` 파라미터**        | ❌ 5개 역방향 모델 모두 지원하지 않음(호출당 이미지 1개)                                                                                                                                                                                                                                                                       | ✅ 지원됨                                                                                                                                                                                           |
| **투명 배경**           | `-all` / `2.5-all`: ⚠️ `background` 파라미터 없음, prompt 전용이며 간혹 신뢰할 수 없음<br />세 가지 `-vip` 모델: ✅ 테스트에서 `background: "transparent"`는 알파 PNG를 반환함(보장 사항 아님)                                                                                                                                                     | ✅ 파라미터로 제어되며 신뢰성 높음 — `background: "transparent"`와 `png` / `webp`                                                                                                                               |
| **중국어 prompt**      | ✅ 네이티브                                                                                                                                                                                                                                                                                                   | ✅ 네이티브                                                                                                                                                                                          |
| **텍스트 렌더링**         | 높은 충실도                                                                                                                                                                                                                                                                                                   | 높은 충실도(`high` 티어에서 가장 강력함)                                                                                                                                                                      |
| **API 문서**          | [GPT-Image-2.5-All 개요](/ko/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2.5-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview)                                                                                                                                                            | [GPT-Image-2.5 / 2 개요](/ko/api-capabilities/gpt-image-2/overview)                                                                                                                               |

<Info>
  🔑 **API tokens 생성 또는 관리**: [https://api.apiyi.com/token](https://api.apiyi.com/token)\
  콘솔에서 token을 생성할 때 그룹(`Default`이면 충분함)과 token 유형(**호출당** / **Token 우선순위**)을 선택하십시오. **세 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`)을 호출하려면 “Token 우선순위” token이 필요합니다** — 과금 방식 불일치로 인해 호출당 tokens은 거부됩니다.
</Info>

## 각 항목을 선택할 시점

### 다음 경우 `gpt-image-2-all` / `gpt-image-2.5-all` (리버스)를 선택합니다

<CardGroup cols={2}>
  <Card title="💰 예측 가능한 비용" icon="dollar-sign">
    크기/품질 티어와 관계없이 이미지당 안정적으로 \$0.03입니다. **엄격한 비용 상한이 있는 일괄 제작에 적합합니다**(인포그래픽, 마케팅 에셋, 이커머스 썸네일).
  </Card>

  <Card title="⚡ 더 빠른 출력" icon="bolt">
    약 90초 생성 — `-vip` 및 공식 버전보다 모두 **약간 더 빠릅니다**. **실시간 UX에 더 적합합니다.**
  </Card>

  <Card title="🔁 하나의 코드베이스, 언제든 전환" icon="repeat">
    표준 Images API 형식 — 세 개의 `-vip` 모델 및 세 개의 공식 모델과 **동일한 코드**를 사용하며, `model` 이름을 변경해 전환하거나 폴백할 수 있습니다. `gpt-image-2-all` 및 `gpt-image-2.5-all`는 가격과 동작을 공유하며, 새 이름은 단순히 ChatGPT 웹이 Images 2.5로 이동했음을 반영합니다.
  </Card>

  <Card title="🌏 중국어 + 마케팅 텍스트" icon="type">
    중국어 prompt를 기본 지원하고 간판 / 포스터 / 인포그래픽의 텍스트 렌더링이 뛰어납니다 — **중국어권 대상 콘텐츠 제작에 적합합니다**.
  </Card>
</CardGroup>

### 다음 경우 세 개의 `-vip` 모델(리버스, 크기 고정)을 선택합니다

<CardGroup cols={2}>
  <Card title="🎚️ 품질이 작동하는 경우(2.5에서는 6개 티어 모두)" icon="sliders-horizontal">
    테스트에서 `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`는 `auto`부터 `max`까지 6개 티어를 모두 허용합니다(`xhigh` / `max`는 2026-09-10에 열림). `gpt-image-2-vip`는 `high`까지 지원합니다. 이는 모두 채널 동작일 뿐, 보장 사항이 아닙니다. 티어 대응 관계: 2.5 `high`는 `gpt-image-2-vip` `medium`에만 해당하고, 2.5 `max`는 `gpt-image-2-vip` `high`에 해당합니다. 티어가 변경되어도 고정 \$0.03은 변하지 않습니다.
  </Card>

  <Card title="⏱️ 세 모델 중 선택하기" icon="hourglass">
    flare-vip는 더 부드러운 느낌으로 가장 빠르며, sunburst-vip는 품질과 편집 정밀도가 더 높고 `gpt-image-2-vip`와 유사하게 보입니다. 세 모델 모두 동일한 최고 token 티어에 도달합니다(2.5에서는 `max`, `gpt-image-2-vip`에서는 `high`). 모두 `-all`보다 느립니다 — 1024²에서 `max`는 80–160초로 측정되었습니다 — 따라서 더 긴 대기 시간이 허용될 때 선택하십시오.
  </Card>

  <Card title="🖼️ 고정 크기 / 4K" icon="expand">
    `size` 파라미터가 **복원되었습니다**(2026-07-22부터): 30개 사전 설정 크기(10개 비율 × 1K/2K/4K). 이커머스 히어로 샷, 포스터 템플릿 및 4K 배경화면을 정확한 크기로 출력할 수 있으며, 이미지당 고정 \$0.03으로 4K 추가 요금이 없습니다.
  </Card>

  <Card title="🔁 -all과 코드 공유" icon="copy">
    `-all`와 동일한 요청 구조입니다(추가 `size` 필드 하나만 필요) — 속도 / 품질 선호도에 따라 `model` 이름을 바꿔 **하나의 코드베이스로 다섯 리버스 모델 전체를 전환**할 수 있습니다.
  </Card>
</CardGroup>

<Note>
  `-vip`의 `size`는 `/v1/images/generations` 및 `/v1/images/edits` 엔드포인트에서만 작동합니다 — **`/v1/chat/completions` chat 엔드포인트는 `size`를 지원하지 않습니다**. 30개 사전 설정을 벗어나는 임의의 사용자 지정 크기 또는 정밀한 마스크 인페인팅이 필요하면 공식 모델(`gpt-image-2.5-flare` / `sunburst`)을 사용하십시오. 이 파라미터의 사용 가능 여부는 업스트림 변경 사항을 따릅니다 — 최신 상태는 [실시간 업데이트](/en/live)를 참조하십시오.
</Note>

### 다음 경우 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`)을 선택합니다

<CardGroup cols={2}>
  <Card title="🎚️ 품질 티어" icon="sliders-horizontal">
    6개의 `quality` 티어를 모두 사용할 수 있으며 **공식적으로 보장**됩니다. 티어와 token 수는 공식 사양에 따라 안정적입니다. 리버스 2.5 -vip 모델도 6개 티어를 모두 열었지만(2026-09-10 측정), 이는 보장되지 않는 채널 동작이며 `gpt-image-2-vip`는 여전히 `high`에서 멈춥니다.
  </Card>

  <Card title="🎯 마스크 인페인팅" icon="paintbrush">
    알파 채널 마스크를 지원합니다 — **나머지 영역을 유지하면서 특정 영역을 정밀하게 수정**할 수 있습니다. 리버스 모델은 전체 이미지만 다시 생성하며, 마스크된 영역만 변경된다는 보장은 없습니다.
  </Card>

  <Card title="🖼️ 임의의 사용자 지정 크기" icon="expand">
    `size`는 사전 설정에 제한되지 않고 **모든 유효한 해상도**(4K 포함)를 허용합니다. `-vip` 3종은 30개 사전 설정만 보장하며 그 외 크기는 다시 작성합니다 — **엄격한 사용자 지정 크기가 필요하면 공식 모델을 사용하십시오**.
  </Card>

  <Card title="🔌 OpenAI 공식과 동일" icon="plug">
    공식 Images API를 통해 처리되며 필드와 동작이 OpenAI 공식과 동일합니다. **기존 OpenAI-SDK 기반 코드 / 시스템은 변경 없이 마이그레이션할 수 있으며 장기적으로 안정성을 유지합니다**.
  </Card>
</CardGroup>

## 주요 차이점 상세

### 1. b64\_json 형식 주의사항(마이그레이션 함정!)

2026년 7월에 확인한 바에 따르면, 공식 및 리버스 모델은 모두 \*\*원시 base64(`data:` 접두사 없음)\*\*를 반환합니다. 하지만 `gpt-image-2-all`에는 이전에 접두사가 포함되어 있었으므로, 가장 안전한 공용 코드는 먼저 이를 확인합니다.

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
  공식과 리버스 간에 전환할 때는 **`b64_json` 처리 코드를 반드시 변경해야** 합니다. 그렇지 않으면 손상된 데이터 URL 또는 디코딩 실패가 발생합니다.
</Warning>

### 2. 해상도 제어

**`gpt-image-2-all` / `gpt-image-2.5-all`**(`size` 필드 없음 — 구도는 prompt에 입력하며, 두 이름은 동일하게 동작합니다):

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**세 가지 `-vip` 모델**(`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`; `size`는 2026-07-22부터 복원됨):

**30개의 사전 설정 크기**(10개 비율 × 1K/2K/4K)를 지원합니다. `size: "WIDTHxHEIGHT"`를 직접 전달하세요(30개 사전 설정 중 하나여야 하며, 전체 목록은 [30개 크기 표](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) 참조). 세 모델 모두 테스트 중인 `quality`도 허용합니다(채널 동작이며 보장 사항은 아님). 두 2.5 모델은 6개 티어를 모두 지원하며(`xhigh` / `max`는 2026-09-10에 개방), `gpt-image-2-vip`는 `high`까지 지원합니다. 2.5 모델의 `high` 출력 tokens는 `gpt-image-2-vip` `medium`와 동일하며, `max`는 해당 `high`와 같습니다.

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-vip",   # alias = gpt-image-2.5-sunburst-vip; swap in gpt-image-2.5-flare-vip / gpt-image-2-vip on this line only
    prompt="...",
    size="3840x2160",   # ✅ one of the 30 presets; images endpoints only (not chat)
    quality="max"       # optional; all six tiers on the 2.5 models, gpt-image-2-vip stops at high; flat $0.03 regardless of tier
)
```

**공식 모델**(`size`를 엄격히 준수 + `quality` 티어; 샘플은 `gpt-image-2.5-flare`를 사용하며 모델 이름만 변경하여 `sunburst` / `gpt-image-2`로 교체 가능):

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="max"       # all six tiers; xhigh / max on the two 2.5 models only; 2.5 high only equals gpt-image-2 medium
)
```

### 3. 업로드 / 출력 형식 차이

| 작업             | 5개 리버스 모델(`-all` / `2.5-all` / `-vip` 트리오)                                                      | 3개 공식 모델(`2.5-flare` / `2.5-sunburst` / `gpt-image-2`) |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **참조 이미지 업로드** | multipart `image` 파일 필드(edits 엔드포인트)                                                            | multipart `image[]` 파일 필드                              |
| **출력 다운로드**    | 기본값 `b64_json`(원시 base64, 2026-07 확인됨); 명시적 `response_format: "url"`는 R2 CDN 링크 반환(**24시간 유효**) | `b64_json`(**원시 base64**, 디코딩 필요)                      |
| **다중 이미지 합성**  | edits 엔드포인트에서 `image` 필드를 반복                                                                    | `image[]` 배열, **최대 16개**                               |

### 4. 대략적인 비용

| 시나리오                      | 5개 리버스 모델(`-all` / `2.5-all` / `-vip` 트리오)                                      | 공식 `gpt-image-2.5-flare` / `sunburst`             | 공식 `gpt-image-2`                           |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| 1024×1024 초안(`low`)       | \$0.03                                                                          | \~\$0.006 (196 tok)                               | \~\$0.006 (196 tok)                        |
| 1024×1024 중간 품질(`medium`) | \$0.03                                                                          | \~\$0.013 (439 tok)                               | \~\$0.053 (1,756 tok)                      |
| 1024×1024 고품질(`high`)     | \$0.03                                                                          | \~\$0.053 (1,756 tok)                             | \~\$0.211 (7,024 tok)                      |
| 1024×1024 `xhigh` / `max` | \$0.03(2.5 -vip 모델에서 허용됨; `gpt-image-2-vip`는 `high`에서 중단, `-all`는 `quality` 거부) | \~\$0.094 (3,122 tok) / \~\$0.211 (7,024 tok)     | ❌ 지원하지 않음                                  |
| 2048×1152 고품질             | \$0.03                                                                          | tokens 기준 과금; `high`는 약 `gpt-image-2` `medium` 수준 | \~\$0.20+ (tokens 기준 과금)                   |
| 3840×2160 4K 고품질          | \$0.03(`-vip` 4K Detail 티어, 추가 요금 없음; `-all` / `2.5-all`에는 4K 없음)               | tokens 기준 과금, **1K보다 상당히 높음**                     | tokens 기준 과금, **1K보다 상당히 높음**              |
| 편집 / 다중 이미지 합성            | \$0.03                                                                          | 입력 tokens가 크게 증가하며, 단일 호출이 \$0.1+에 이를 수 있음        | 입력 tokens가 크게 증가하며, 단일 호출이 \$0.1+에 이를 수 있음 |

공식 수치는 대략적인 값입니다. 2026-09-09에 측정한 출력 tokens × 100만 개당 \$30 기준이며, prompt 입력 tokens(일반적으로 \$0.001 미만)는 제외했습니다.

<Info>
  **결론**: 배치 / 저품질 워크로드에서는 리버스 채널이 항상 더 저렴한 것은 아닙니다(1K `low`는 실제로 공식 티어가 더 저렴하며, 두 2.5 모델은 `medium` / `high`에서도 약 \$0.013 / \~\$0.053에 불과합니다). **중간\~고품질 범위**(`gpt-image-2`는 `medium`부터, 2.5 모델은 `xhigh`부터)에서 리버스 채널의 \$0.03이 가장 유리해집니다. **`quality` 티어 / 마스크 인페인팅 / 고정된 크기, 4K / 엄격한 OpenAI-API 필드 동등성**이 필요한 경우 공식(tokens 기준 과금)을 선택하세요.
</Info>

## 클라이언트 설정

| 설정            | 5개 리버스 모델(`-all` / `2.5-all` / `-vip` 트리오)                                              | 3개 공식 모델(`2.5-flare` / `2.5-sunburst` / `gpt-image-2`)                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **타임아웃(보수적)** | `-all` / `2.5-all`: **300초** (일반적으로 약 90초)<br />3개 `-vip` 모델: **300초** (일반적으로 120–200초) | `low` / `medium`의 2.5 모델: **240초**; `high` / `xhigh`: **300초**; `max` 및 `gpt-image-2` `high`: 대체용 **600초** (4K 고품질은 실제로 3-5분 소요) — [공식 개요](/ko/api-capabilities/gpt-image-2/overview)의 티어 표를 참조하십시오 |
| **재시도 전략**    | 5xx / 타임아웃 시 지수 백오프, 최대 2회 재시도                                                          | 동일                                                                                                                                                                                                  |
| **동시 실행 수**   | 호출당 이미지 1개 — 여러 개가 필요한 경우 병렬 요청 발행                                                      | 호출당 이미지 1개 — 여러 개가 필요한 경우 병렬 요청 발행                                                                                                                                                                  |
| **요청 ID**     | `request-id` 응답 헤더                                                                      | `x-request-id` 응답 헤더                                                                                                                                                                                |

<Tip>
  **8개 모델 모두 공통: 이미지 편집 / 다중 이미지 융합의 경우 각 입력 이미지를 1.5MB 미만으로 압축하십시오** (JPEG 품질 80-90 / 해상도 축소). 간헐적인 `shell_api_error` / `Unknown error` 응답은 대부분 과도하게 큰 입력으로 인해 발생합니다 — 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다. **출력 해상도는 입력 크기와 무관합니다** — 품질은 입력 파일 크기가 아니라 출력 측에서 설정됩니다(공식 모델은 `size` + `quality`, `-vip` 트리오는 `size` 티어 + `quality`, `-all` / `2.5-all`는 prompt 문구).
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="입력 이미지를 압축해야 하나요? prompt에 4K / 8K를 작성하면 도움이 되나요?">
    **예, 강력히 권장합니다.** 8개 모델 모두에서 각 입력 이미지를 **1.5MB 미만**으로 압축하세요(JPEG 품질 80\~90 / 해상도 축소). 간헐적인 `shell_api_error` / `Unknown error` 응답은 대부분 지나치게 큰 입력으로 인해 발생하며, 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다.

    **압축으로 품질이 저하될까 걱정하지 마세요** — 출력 해상도는 입력 크기와 무관합니다. 세 계열의 ‘출력 측’ 제어 방식은 서로 다릅니다.

    * `gpt-image-2-all` / `gpt-image-2.5-all`: prompt의 구도 표현으로 제어됩니다([ -all 개요 페이지](/ko/api-capabilities/gpt-image-2-all/overview)의 검증된 표현 표 참조) — prompt의 `4K` / `8K`는 적용되지 않습니다.
    * 3개 `-vip` 모델(`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`): `size` 필드로 제어됩니다(4K를 포함한 30개 사전 설정 크기). 선택적으로 `quality`도 사용할 수 있습니다(2.5 모델은 6개 등급, `gpt-image-2-vip`에서는 최대 `high`) — prompt의 `4K` / `8K` 역시 적용되지 않습니다.
    * 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`): `size` + `quality`로 제어됩니다(유효한 모든 크기).

    요약하면, 입력을 줄이면 속도만 빨라집니다. 품질은 입력 파일 크기가 아니라 출력 측 구성으로 결정됩니다.
  </Accordion>

  <Accordion title="동일한 API 키로 8개 모델을 모두 호출할 수 있나요?">
    예. 8개 모두 Default 그룹에서 실행되며, 추가 구성 없이 동일한 API 키로 호출할 수 있습니다. 참고: 공식 모델을 호출하려면 ‘token 우선’ token이 필요하며, `-all` / `-vip`는 두 token 유형 모두 허용합니다.
  </Accordion>

  <Accordion title="역방향 채널에서는 어떤 엔드포인트를 사용해야 하나요?">
    다음 두 가지 이유로 **OpenAI 이미지 API**(텍스트-이미지는 `/v1/images/generations`, 편집은 `/v1/images/edits`)를 사용하세요.

    1. **더 안정적입니다**: Images API 채널의 업스트림 리소스 공급이 더 풍부하므로 호출 성공률이 더 높습니다.
    2. **공식 릴레이와 호환되어 쉽게 전환할 수 있습니다**: 호출 방식과 파라미터 형식이 3개 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`)과 완전히 호환됩니다. 역방향 채널에서 리스크 제어 문제가 발생하면 **`model` 이름만 바꾸어 공식 릴레이로 전환**하면 되며, 코드 변경은 전혀 필요하지 않습니다.

    채팅 기반 엔드포인트(`/v1/chat/completions`, **더 이상 권장하지 않음**)도 있으며, 다중 턴 반복 편집이나 온라인 이미지 URL을 직접 전달할 때만 유용합니다. 이미지 의도가 모호한 경우 이미지 대신 일반 텍스트를 반환할 수 있습니다(이를 강화하려면 ‘이미지 생성:’과 같은 고정 접두사를 앞에 추가하세요). 전체 파라미터는 [-all 채팅 기반 API 레퍼런스](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip 채팅 기반 API 레퍼런스](/en/api-capabilities/gpt-image-2-vip/chat-completions)를 참조하세요.
  </Accordion>

  <Accordion title="역방향 채널에서 -all과 -vip 중 무엇을 선택해야 하나요?">
    두 라인 모두 동일한 정액 가격(\$0.03/이미지)의 리버스 엔지니어링 채널이며 호출 형식도 같습니다(`-vip` 트리오는 추가로 `size` 고정 및 `quality`을 지원하며, 2.5 모델에서는 6개 등급 모두 지원). 차이점은 **속도 대 품질 + 크기 고정**입니다.

    * **생성 시간**: `-all` / `2.5-all` 약 90초 — **속도가 장점**입니다. `-vip` 트리오는 약 120\~200초입니다. 현재는 OpenAI 업스트림 컴퓨팅 변동으로 출시 당시보다 느립니다.
    * **품질**: `-vip`(Adobe 라인)의 디테일 렌더링은 **때때로 더 우수합니다** — 급하지 않은 전시용 이미지에 적합합니다. 트리오 내에서는 sunburst-vip가 `gpt-image-2-vip`와 비슷해 보이며 flare-vip는 더 부드럽습니다.
    * **크기 고정**: `-vip` 트리오는 4K를 포함한 30개 사전 설정 `size` 값을 지원합니다. `-all` / `2.5-all`는 `size`를 거부하므로 구도는 prompt에 넣어야 합니다.

    선택 기준: 빠른 출력을 원하면 `-all` / `2.5-all`, 고정 크기 / 4K가 필요하면 `-vip` 트리오, 30개 사전 설정을 초과하는 사용자 지정 크기 또는 정밀 마스크가 필요하면 공식 모델을 선택하세요. 자세한 내용은 [GPT-Image-2.5-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview)를 참조하세요.
  </Accordion>

  <Accordion title="-vip 내에서 2개 2.5 모델과 gpt-image-2-vip 중 무엇을 선택해야 하나요?">
    가격, 그룹, 호출 형식이 모두 같습니다(2026-09-09에 동일 채널과 token에서 수행한 253개 요청의 3방향 비교 결과, 계약은 셀 단위까지 동일한 것으로 확인됨). 다른 점은 세 가지뿐입니다.

    * **등급**: 2.5 모델은 6개 모두 사용합니다(`xhigh` / `max`은 2026-09-10에 개방됨). `gpt-image-2-vip`은 `high`까지 지원합니다. 이름이 같은 등급도 동일하지 않습니다. 2048×1152에서 2.5 `high` 1,413 = `gpt-image-2-vip` `medium`이며, 2.5 `max` 5,650 = `gpt-image-2-vip` `high`입니다. 세 모델 모두 동일한 최상위 token 등급에 도달합니다.
    * **품질 및 속도**: flare-vip가 가장 빠르지만 더 부드러운 느낌이며 장식적 디테일이 적습니다. sunburst-vip는 `gpt-image-2-vip`와 비슷해 보입니다.
    * **기본 크기**: flare-vip는 1024×1536으로 고정되며, 나머지 두 모델은 2048×2048입니다. 항상 `size`을 전달해 고정하세요.

    별칭 `gpt-image-2.5-vip`은 sunburst-vip입니다. 전체 행별 표는 [GPT-Image-2.5-VIP 개요의 ‘3개 -vip 모델 비교’ 섹션](/ko/api-capabilities/gpt-image-2-vip/overview)에 있습니다.
  </Accordion>

  <Accordion title="고정 크기 / 4K가 필요합니다. 어떻게 해야 하나요?">
    `-vip` 트리오부터 시작하세요(기본값은 `gpt-image-2.5-vip`이며, 최고 token 등급에는 `high`과 함께 `gpt-image-2-vip`을 선택). `size` 파라미터는 2026-07-22에 복원되었으며, 4K를 포함한 \*\*30개 사전 설정 크기(10개 비율 × 1K/2K/4K)\*\*를 지원합니다. 가격은 4K 추가 요금 없이 정액 \$0.03/이미지입니다. `size`은 이미지 엔드포인트에서만 작동하며 30개 사전 설정 중 하나여야 합니다.

    **30개 사전 설정을 초과하는 모든 유효 크기**, **공식적으로 보장된 `quality` 등급**(`-vip` 등급은 보장 없는 채널 동작임), **정밀 마스크 인페인팅**(알파 채널 마스크), 또는 **엄격한 OpenAI API 필드 동등성**(기존 OpenAI SDK 코드의 변경 없는 마이그레이션)이 필요하면 공식 모델(`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`, token 기준 과금)을 사용하세요.
  </Accordion>

  <Accordion title="1.5에서 마이그레이션할 때 무엇을 선택해야 하나요?">
    * **OpenAI SDK를 계속 사용해야 하거나 OpenAI 공식과 일치해야 하는 경우, 또는 30개 사전 설정을 초과하는 사용자 지정 크기가 필요한 경우**: 공식 모델을 선택하세요(텍스트-이미지는 `gpt-image-2.5-flare`, 편집은 `gpt-image-2.5-sunburst`). `input_fidelity`만 제거하고 나머지는 그대로 두세요(`background: transparent`은 계속 작동합니다).
    * **비용을 절감하고 빠른 출력을 원하는 경우**: `gpt-image-2.5-all`을 선택하세요(역방향, 약 90초, `gpt-image-2-all`와 동일한 가격 및 동작).
    * **비용을 절감하면서 품질을 우선하거나 고정 크기 / 4K가 필요한 경우**: `gpt-image-2.5-vip`을 선택하세요(역방향, 약 120\~200초, 4K를 포함한 30개 사전 설정 크기, 6개 `quality` 등급 모두 지원, `gpt-image-2-vip`은 `high`에서 중단).
  </Accordion>

  <Accordion title="페일오버를 위해 여러 모델을 배포할 수 있나요?">
    예. 일반적인 패턴은 다음과 같습니다. **기본 `2.5-all` 또는 `2.5-vip`**(예측 가능한 비용 — 속도 / 품질 선호도에 따라 선택), **공식 `gpt-image-2.5-flare` / `sunburst`로 폴백**(`quality` 등급, 마스크 또는 30개 사전 설정을 초과하는 사용자 지정 크기가 필요할 때 전환). 역방향과 공식 응답 형식은 다르므로 비즈니스 레이어에서 정규화해야 합니다.
  </Accordion>

  <Accordion title="R2 CDN 이미지 링크가 느립니다. 어떻게 해야 하나요?">
    [느린 CDN 다운로드 — 해결 방법](/ko/faq/cdn-download-slow)을 참조하세요.
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
