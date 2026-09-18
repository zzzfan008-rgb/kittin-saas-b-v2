> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 럭 GPT-Image 2 - ComfyUI 노드

> 커뮤니티에서 제공하는 ComfyUI 노드 팩으로, 공식 gpt-image-2 / gpt-image-2.5-flare / gpt-image-2.5-sunburst를 지원하는 이미지 노드 3개, 역방향 gpt-image-2-all / gpt-image-2-vip를 지원하는 이미지 노드 2개와 프롬프트 제어 노드 3개를 제공합니다. 2026-09-10부터 6가지 품질 등급, 16개의 참조 이미지, 마스크 인페인팅 및 사용자 지정 해상도를 지원합니다.

## 개요

`Comfyui-Luck-gpt2.0`는 커뮤니티 사용자 luckdvr가 기여한 ComfyUI 커스텀 노드 팩입니다. ComfyUI 내부에서 APIYI의 GPT 이미지 모델을 직접 호출합니다. 이 팩에는 현재 **이미지 노드 3개**와 **프롬프트 제어 노드 3개**가 포함되어 있습니다.

* **`Comfyui-Luck gpt-image-2`** (공식): 모델 드롭다운에서 `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`을 선택할 수 있으며, 실제 `size` / `quality`을 전송하고, 마스크 인페인팅과 최대 16개의 참조 이미지를 지원합니다
* **`Comfyui-Luck gpt-2.0 all`** (역방향): `gpt-image-2-all`을 호출하며, 호출별 과금, 빠른 속도, 대화형 편집을 지원합니다
* **`Comfyui-Luck gpt-image-2-vip`** (역방향): `gpt-image-2-vip`을 호출하며, 호출별 과금과 Adobe 경로를 지원합니다
* **프롬프트 제어 노드**: `GPT-Image-2 文生图提示词控制器` (텍스트-이미지 프롬프트 컨트롤러) / `图生图提示词控制器` (이미지-이미지 프롬프트 컨트롤러) / `文本停留编辑器` (텍스트 일시 중지 편집기). 멀티모달 모델을 사용하여 사용자의 간단한 설명을 구조화된 이미지 프롬프트로 변환하며, 수동 편집을 위해 워크플로를 일시 중지할 수 있습니다

<Info>
  **2026-09-10 업데이트: GPT-Image 2.5 지원.** 공식 노드에 `gpt-image-2.5-flare` (속도 우선)과 `gpt-image-2.5-sunburst` (품질 및 편집 정밀도 우선)이 추가되었으며, `quality`는 6단계로 늘어났습니다(새로운 `xhigh` / `max`). 노드 이름, ID, 위젯 순서 및 기본 모델 `gpt-image-2`는 변경되지 않으므로 **기존 워크플로는 자동으로 모델이나 품질이 변경되지 않습니다**. 플러그인을 업데이트한 후 `model (模型)` 드롭다운에서 모델을 선택하십시오. 아래의 “노드에서 GPT-Image 2.5 사용”을 참조하십시오.
</Info>

<Info>
  **프로젝트 정보**

  * 🔗 소스: `github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 라이선스: Apache-2.0
  * 👤 작성자: luckdvr
  * ⭐ APIYI용으로 제작된 커뮤니티 기여 프로젝트입니다. API 동작 변경이나 노드 오류는 먼저 저장소의 이슈에 보고하십시오
</Info>

<Tip>
  **작성자의 다른 노드 팩과 어떻게 구분합니까?**

  luckdvr는 APIYI용 ComfyUI 노드 팩을 2개 기여했습니다.

  * **[Luck Nano Banana Pro](/ko/scenarios/ecosystem/lucknanobananapro-comfyui)**: Gemini 라인(`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`)을 호출하며, 14개의 참조 이미지와 엔지니어링 수준의 재시도/타임아웃을 중점적으로 지원합니다
  * **Luck GPT-Image 2 (이 페이지)**: OpenAI 라인(`gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2-all` / `gpt-image-2-vip`)을 호출하며, 실제 `size` / `quality` 제어, 마스크 인페인팅 및 프롬프트 컨트롤러를 중점적으로 지원합니다
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="3개 노드, 3개 경로" icon="layers">
    공식 `gpt-image-2`, 리버스 `gpt-2.0 all`, 리버스 `gpt-image-2-vip`가 각각 하나의 경로를 담당합니다. 예산과 필요에 따라 선택합니다
  </Card>

  <Card title="GPT-Image 2.5 트윈 모델" icon="sparkles">
    공식 노드를 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`으로 전환할 수 있으며, 버전 고정을 위해 날짜별 `-2026-09-08` 스냅샷도 제공됩니다
  </Card>

  <Card title="6개 품질 등급" icon="sliders-horizontal">
    `quality`은 auto / low / medium / high / xhigh / max를 지원하며, `xhigh` / `max`는 2.5 모델 2종에서만 지원됩니다
  </Card>

  <Card title="최대 16개의 참조 이미지" icon="images">
    공식 노드는 `image_01` … `image_16`을 받으며, 두 리버스 노드는 최대 14개까지 받아 다중 이미지 융합 및 스타일 전송을 지원합니다
  </Card>

  <Card title="마스크 인페인팅" icon="eraser">
    공식 노드의 선택적 `mask` 입력으로 편집 영역을 정확하게 지정할 수 있습니다(투명 영역은 다시 칠하고 불투명 영역은 유지합니다)
  </Card>

  <Card title="실제 해상도 + 사용자 지정 크기" icon="image">
    auto / 1K / 2K / 4K 프리셋과 사용자 지정 크기를 지원합니다(각 변 최대 3840px, 총 655,360–8,294,400픽셀)
  </Card>

  <Card title="프롬프트 컨트롤러" icon="wand-sparkles">
    기본 `gemini-3.5-flash`은 텍스트 개요 또는 최대 5개의 참조 이미지를 구조화된 이미지 prompt로 변환하며, 수동 편집을 위해 선택적으로 일시 중지할 수 있습니다
  </Card>

  <Card title="내장된 타임아웃 및 재시도" icon="refresh-cw">
    공식 노드의 기본 타임아웃은 600초이며, `408` / `429` / `5xx`은 `retry_times`에 따라 재시도하므로 피크 시간대의 변동에도 대응합니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델                          | 모델 ID                                        | 노드                             | 용도                                           | API 문서                                              |
| --------------------------- | -------------------------------------------- | ------------------------------ | -------------------------------------------- | --------------------------------------------------- |
| GPT-Image 2.5 Flare (공식)    | `gpt-image-2.5-flare` (스냅샷 `-2026-09-08`)    | `Comfyui-Luck gpt-image-2`     | 속도 우선 텍스트-이미지 생성, 6개 품질 등급, 참조 이미지 16개 + 마스크 | [보기](/ko/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2.5 Sunburst (공식) | `gpt-image-2.5-sunburst` (스냅샷 `-2026-09-08`) | `Comfyui-Luck gpt-image-2`     | 품질과 편집 정밀도 우선, 편집 및 다중 이미지 융합에 가장 적합         | [보기](/ko/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 (공식)            | `gpt-image-2`                                | `Comfyui-Luck gpt-image-2`     | 이전 세대, 4개 품질 등급, 노드 기본값                      | [보기](/ko/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (리버스)       | `gpt-image-2-all`                            | `Comfyui-Luck gpt-2.0 all`     | ChatGPT 웹 경로, 호출당 과금, 약 30\~60초              | [보기](/ko/api-capabilities/gpt-image-2-all/overview) |
| GPT-Image 2 VIP (리버스)       | `gpt-image-2-vip`                            | `Comfyui-Luck gpt-image-2-vip` | Adobe 경로, 호출당 과금, 약 90\~150초                 | [보기](/ko/api-capabilities/gpt-image-2-vip/overview) |

<Info>
  세 가지 공식 모델은 **동일한 가격과 매개변수**를 공유하며 토큰당 과금됩니다. 두 리버스 모델은 **이미지당 \$0.03**을 과금합니다. 공식 모델과 리버스 모델의 전체 비교는 [gpt-image-2.5 / 2 공식 모델과 리버스 모델 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)를 참조하십시오.
</Info>

## 노드에서 GPT-Image 2.5 사용하기

플러그인을 업데이트하고 ComfyUI를 완전히 다시 시작한 다음, `Comfyui-Luck gpt-image-2`에서 `model (模型)` 드롭다운을 전환합니다. 다른 모든 위젯은 그대로 유지됩니다. 두 2.5 모델 모두 텍스트-이미지 변환, 이미지 편집, 참조 이미지 16개 및 마스크를 지원합니다. 노드는 `mode`와 참조 이미지 연결 여부에 따라 생성 또는 편집 엔드포인트를 선택합니다.

| 모델                                        | `quality` 값                                          | 포지셔닝                                  |
| ----------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| `gpt-image-2`                             | `auto` / `low` / `medium` / `high`                   | 이전 세대, 노드 기본값                         |
| `gpt-image-2.5-flare` (날짜가 지정된 스냅샷 포함)    | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 속도 우선, 텍스트-이미지 변환의 기본 선택              |
| `gpt-image-2.5-sunburst` (날짜가 지정된 스냅샷 포함) | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 품질과 편집 정밀도 우선, 편집 및 다중 이미지 융합에 적합한 선택 |

<Warning>
  **`gpt-image-2`에서 2.5로 이동할 때 `quality`을 변경 없이 그대로 적용하지 마십시오.** 2026-09-09 APIYI의 동일 크기 출력 token 측정에 따르면 2.5의 `high`은 이전 `medium`에 대응하고, 2.5의 `max`만 이전 `high`에 대응합니다. 이는 token 예산의 대응 관계일 뿐, 픽셀 단위의 품질이 동일하다는 보장은 아닙니다. 2.5에서 이전 `high` 예산에 맞추려면 `max`를 선택합니다. 동일한 예산에서 2.5의 `high` / `xhigh`는 더 저렴한 중간 단계 두 가지를 제공합니다.
</Warning>

워크플로를 구축하기 전에 알아 두어야 할 노드 수준의 동작은 다음과 같습니다.

* **자동 하향 조정 없음**: 이전 `gpt-image-2`에서 `xhigh` / `max`을 선택하거나 유효하지 않은 모델 / 품질을 선택하면, 노드는 전송 전에 오류를 발생시킵니다. 노드가 해당 단계를 임의로 바꾸는 일은 없습니다
* **`auto`은 신중하게 사용**: `auto`은 동적 추론 단계이므로 동일한 prompt에 대한 비용과 지연 시간이 단계마다 달라질 수 있습니다. 지출을 제어하려면 단계를 명시적으로 선택합니다
* **프로덕션에서는 날짜가 지정된 스냅샷 고정**: 드롭다운의 `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08`은 모델 버전을 고정하므로, 업스트림의 별칭이 변경되어도 모델이 바뀌지 않습니다
* **600초 타임아웃 유지**: 2.5 `xhigh` / `max`, 2K / 4K 또는 복잡한 편집의 경우 기본값을 유지하거나 늘립니다. 클라이언트의 타임아웃 이후에도 동기 요청에 대한 과금이 계속될 수 있으며, 자동 재시도로 비용이 추가될 수 있습니다. 재시도를 원하지 않으면 `retry_times`을 `1`로 설정합니다

## 노드 매개변수

### `Comfyui-Luck gpt-image-2` (공식)

패널의 위젯 레이블에는 `api_key (API密钥)`와 같은 중국어 접미사가 붙으며, 아래 표에는 영어 필드 이름만 나열되어 있습니다.

| 매개변수                    | 유형     | 필수  | 기본값                | 설명                                                                                                                                        |
| ----------------------- | ------ | --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`               | string | 예   | -                  | APIYI token입니다. 사용량 한도가 설정된 전용 키를 사용하는 것이 좋습니다                                                                                            |
| `prompt`                | string | 예   | -                  | 생성 또는 편집 지시문                                                                                                                              |
| `mode`                  | enum   | 예   | `AUTO`             | `AUTO` / `text2img` / `img2img`; 참조 이미지가 연결되어 있는지에 따라 `AUTO`이 결정합니다                                                                       |
| `model`                 | enum   | 예   | `gpt-image-2`      | `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` |
| `api_base`              | enum   | 예   | `api.apiyi.com/v1` | API 도메인입니다. 설치 4단계를 참조하십시오                                                                                                                |
| `image_size`            | enum   | 예   | `2K`               | `auto (不传size)` / `1K` / `2K` / `4K` / `custom (自定义)`                                                                                     |
| `aspect_ratio`          | enum   | 예   | `16:9`             | 20개 옵션: AUTO, 1:4, 4:1, 1:8, 8:1, 1:1, 1:2, 2:1, 1:3, 3:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 9:21, 21:9                           |
| `custom_size`           | string | 아니요 | `1600x1200`        | `image_size`가 `custom`일 때만 사용되며, 형식은 `WxH`입니다                                                                                             |
| `quality`               | enum   | 예   | `auto`             | `auto` / `low` / `medium` / `high` / `xhigh` / `max`; 마지막 두 항목은 2.5에서만 지원됩니다                                                              |
| `output_format`         | enum   | 예   | `png`              | `png` / `jpeg` / `webp`                                                                                                                   |
| `output_compression`    | int    | 예   | 85                 | 0–100이며 jpeg / webp에만 적용됩니다                                                                                                               |
| `seed`                  | int    | 예   | 0                  | ComfyUI 로컬 제어 항목(재실행을 강제함)입니다. **API로는 절대 전송되지 않습니다**                                                                                     |
| `timeout_seconds`       | int    | 예   | 600                | 읽기 시간 제한이며 범위는 60–1800입니다. 연결 시간 제한은 30초로 고정됩니다                                                                                           |
| `retry_times`           | int    | 예   | 3                  | 범위는 1–10입니다. `408` / `429` / `5xx`는 자동으로 재시도됩니다                                                                                           |
| `image_01` … `image_16` | IMAGE  | 아니요 | -                  | 참조 이미지, 최대 16개                                                                                                                            |
| `mask`                  | MASK   | 아니요 | -                  | 인페인팅 마스크입니다. `image_01`와 함께 사용해야 하며, ComfyUI 마스크 값이 1인 영역을 다시 칠합니다                                                                        |

`custom_size`에는 네 가지 제약 조건이 적용됩니다. 어느 변도 3840px를 초과할 수 없고, 너비와 높이는 모두 16의 배수여야 하며, 긴 변 / 짧은 변은 최대 3:1이고, 총 픽셀 수는 655,360에서 8,294,400 사이여야 합니다. `1:4` / `4:1` / `1:8` / `8:1` 비율은 공식 3:1 제한을 초과하므로, 노드는 가장 가까운 허용 경계 크기로 조정합니다. `4K + 1:1`는 후자의 값이 총 픽셀 수 제한을 초과하기 때문에 `3840x3840` 대신 `2880x2880`를 사용합니다.

<Note>
  이 노드는 `background` / `moderation` / `response_format` / `input_fidelity`를 전송하지 않으며, 모두 API 기본값으로 대체됩니다. 투명한 배경 및 유사한 옵션을 사용하려면 API를 직접 호출하십시오. [투명한 배경 FAQ](/ko/faq/image-transparent-background)를 참조하십시오.
</Note>

### `Comfyui-Luck gpt-2.0 all` (역방향)

| 매개변수                    | 유형     | 필수  | 기본값                | 설명                                                                                                         |
| ----------------------- | ------ | --- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `api_key`               | string | 예   | -                  | APIYI token                                                                                                |
| `prompt`                | string | 예   | -                  | 대화형 생성 / 편집 지침                                                                                             |
| `mode`                  | enum   | 예   | `AUTO`             | `AUTO` / `text2img` / `img2img`                                                                            |
| `model`                 | enum   | 예   | `gpt-image-2-all`  | 단일 고정 옵션                                                                                                   |
| `api_base`              | enum   | 예   | `api.apiyi.com/v1` | API 도메인                                                                                                    |
| `endpoint`              | enum   | 예   | `images_api`       | `images_api` (`/v1/images/generations` 또는 `/v1/images/edits`) / `chat_completions` (대화형 또는 온라인-URL 참조 이미지) |
| `aspect_ratio`          | enum   | 예   | `AUTO`             | 22개 옵션(공식 노드에 `2:5` / `5:2` 추가). **prompt 앞에 텍스트로만 추가되며**, 엄격한 크기 제어가 아닙니다                                 |
| `response_format`       | enum   | 예   | `url`              | `url` / `b64_json`이며, `images_api` 엔드포인트에서만 전송됩니다                                                          |
| `seed`                  | int    | 예   | 0                  | 로컬 제어 전용이며 전송되지 않습니다                                                                                       |
| `timeout_seconds`       | int    | 예   | 300                | 범위 30–1200                                                                                                 |
| `retry_times`           | int    | 예   | 3                  | 범위 1–10                                                                                                    |
| `image_01` … `image_14` | IMAGE  | 아니요 | -                  | 참조 이미지, 최대 14개                                                                                             |

`gpt-image-2-all`는 `size` / `quality` / `n` / `aspect_ratio` API 필드를 허용하지 않으며 노드는 이를 전송하지 않습니다. 2K / 4K는 픽셀을 보장하지 않고 prompt에만 설명할 수 있습니다. `url` 출력은 일반적으로 약 하루 동안 유효한 임시 CDN 링크이므로, 장기간 사용해야 한다면 다시 호스팅해야 합니다.

### `Comfyui-Luck gpt-image-2-vip` (반전)

`gpt-2.0 all`와 동일한 위젯에 크기 제어 항목 두 개가 추가됩니다.

| 매개변수           | 유형   | 필수 | 기본값               | 설명                                                                                                                                                                                 |
| -------------- | ---- | -- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`        | enum | 예  | `gpt-image-2-vip` | 단일 고정 옵션                                                                                                                                                                           |
| `image_size`   | enum | 예  | `2K Recommended`  | `1K Fast` / `2K Recommended` / `4K Detail`; **현재는 이전 워크플로를 위해 유지되는 UI 힌트이며, 노드는 `size`을 전송하지 않습니다**                                                                                |
| `aspect_ratio` | enum | 예  | `16:9`            | 10개 옵션: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9; 프롬프트 접두사의 대체값으로만 사용됩니다                                                                                                |
| 기타             | -    | -  | -                 | `api_key` / `prompt` / `mode` / `api_base` / `endpoint` / `response_format` / `seed` / `timeout_seconds` (300) / `retry_times` (3) / `image_01` … `image_14`, `gpt-2.0 all`와 동일합니다 |

<Note>
  작성자는 `size`이 비활성화되었다는 APIYI의 2026-06-23 공지를 기준으로 이 노드를 구축했으므로, 기본적으로 `size`을 전송하지 않습니다. APIYI 측에서는 `gpt-image-2-vip`에 대한 `size`을 2026-07-22에 복원했습니다(일반적인 크기 30개, [gpt-image-2-vip 문서](/ko/api-capabilities/gpt-image-2-vip/overview) 참조). 그러나 플러그인은 아직 이를 반영하지 않았습니다. 현재 ComfyUI에서 실제 출력 크기를 고정하려면 공식 노드 `Comfyui-Luck gpt-image-2`을 사용하십시오. 반전 `b64_json`에는 `data:image/png;base64,` 접두사가 포함되며, 노드가 이를 자동으로 디코딩합니다.
</Note>

### 프롬프트 제어 노드

| 노드                      | 기본 모델              | 용도                                                                                                                        |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `GPT-Image-2 文生图提示词控制器` | `gemini-3.5-flash` | 텍스트 설명을 GPT-Image 계열에 적합한 구조화된 이미지 prompt로 변환합니다                                                                          |
| `图生图提示词控制器`             | `gemini-3.5-flash` | 최대 5개의 참조 이미지(`reference_image_01` 필수, `02`–`05` 선택 사항)와 선택 사항인 `subject_image`을 읽고, 스타일·구도·레이아웃 제약 조건이 포함된 prompt를 작성합니다 |
| `文本停留编辑器`               | -                  | 여기서 워크플로를 일시 중지합니다. 텍스트를 편집한 다음 노드에서 `Continue`을 클릭하여 재개합니다                                                               |

* 두 컨트롤러 모두 APIYI `POST /v1/chat/completions`을 호출하며, 모델 드롭다운에는 `gemini-3.5-flash` / `gpt-5.5` / `gpt-4o` / `gpt-4.1-mini` / `gemini-2.5-flash` / `gemini-2.5-pro`이 표시됩니다
* 이미지 간 변환 컨트롤러는 이미지를 이해하고 prompt를 개선하는 작업만 수행합니다. 실제 다중 이미지 참조 또는 융합을 사용하려면 동일한 이미지를 다운스트림 이미지 노드에도 연결합니다
* 일시 중지 편집기의 `edited_text`은 이미지 노드의 `prompt`에 전달되는 단일 문자열이며, `edited_texts`은 배치 텍스트 워크플로를 위해 예약된 목록 출력입니다. 일시 중지 후에는 **노드에서 `Continue`을 클릭합니다**. 기본 Run 버튼을 다시 누르지 마십시오. 그러면 ComfyUI가 업스트림 prompt 개선 작업을 다시 큐에 추가하고 재실행합니다

## 설치

<Steps>
  <Step title="1단계: custom_nodes에 복제">
    ComfyUI 설치 폴더에서 다음을 실행합니다.

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```

    기존 사용자는 해당 폴더에서 `git pull`하여 2.5 지원을 받을 수 있습니다.
  </Step>

  <Step title="2단계: 종속 항목 설치">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="3단계: ComfyUI 완전히 재시작">
    노드 팔레트에서 `Comfyui-Luck`을 검색하여 이미지 노드 3개와 prompt 노드 3개를 찾습니다. 프런트엔드 새로 고침만으로는 충분하지 않으므로 플러그인 업데이트 후 프로세스를 다시 시작해야 합니다.
  </Step>

  <Step title="4단계: APIYI 키 및 도메인 구성">
    * [APIYI 콘솔](https://www.apiyi.com) → Tokens로 이동하여 키를 생성합니다(사용량 상한 설정을 권장합니다).
    * 노드의 `api_key` 필드에 키를 붙여 넣습니다.
    * `api_base` 중 하나를 선택합니다: `https://api.apiyi.com/v1`(기본) / `https://b.apiyi.com/v1`(중국 본토 백업) / `https://vip.apiyi.com/v1`(해외 직접 연결). 노드는 `/v1`이 있거나 없는 기본 URL을 모두 허용합니다.
  </Step>

  <Step title="5단계: 예제 워크플로 가져오기">
    이 저장소에는 두 가지 예제가 포함되어 있습니다.

    * `example_workflow.json`: 각 이미지 노드당 하나의 예제입니다(공식 예제에서는 `size=2048x1152` + `quality=high` + `jpeg`를 사용함). 선택 방법을 설명하는 중국어 Note 노드가 포함되어 있습니다.
    * `example_workflow_gpt_image_2_5.json`: 독립 실행형 2.5 예제로, Flare 텍스트-이미지 생성 → Sunburst 편집 → 미리 보기 순서이며, 기본값은 `1K + 1:1`, `quality=high`, 600초 타임아웃 및 `retry_times=1`입니다.

    예제의 API 키는 비어 있으므로 실행하려면 자신의 키를 입력해야 합니다. 자신의 워크플로를 공유하기 전에 키를 삭제하십시오.
  </Step>
</Steps>

## 사용 예시

### 예시 1: 2.5 Flare 4K 고품질 텍스트-이미지

```
Node: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-flare
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
image_size: 4K
aspect_ratio: 2:3
quality: max
output_format: png
```

`max`은 이전 `gpt-image-2` `high`와 동일한 token 예산을 사용하는 2.5 등급입니다. 더 빠르고 저렴한 결과를 원한다면 먼저 `high` 또는 `xhigh`을 사용해 보시기 바랍니다.

### 예시 2: 2.5 Sunburst 마스크 인페인팅

```
Node: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-sunburst
mode: img2img
image_01: original photo
mask: the area to replace
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
image_size: 2K
quality: high
```

### 예시 3: Flare 텍스트-이미지 → Sunburst 편집 체인

저장소의 `example_workflow_gpt_image_2_5.json`과 일치합니다.

```
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-flare]
  prompt: "product shot of a matte black ceramic mug on a walnut table, soft window light"
  image_size: 1K · aspect_ratio: 1:1 · quality: high
  image ─────────────────────────────┐
                                      ▼
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-sunburst]
  mode: img2img · image_01: ← output of the node above
  prompt: "add a thin gold rim to the mug, keep lighting and background unchanged"
  quality: high
  image ──▶ PreviewImage
```

### 예시 4: 대화형 이미지 역변환

```
Node: Comfyui-Luck gpt-2.0 all
endpoint: images_api
aspect_ratio: 9:16
prompt: "A girl in hanfu standing under a cherry blossom tree, watercolor style, soft lighting"
response_format: url
timeout_seconds: 300
retry_times: 3
```

### 예시 5: 프롬프트 컨트롤러 → 일시 중지 및 편집 → 생성

```
5 reference images
  ├─ into 图生图提示词控制器 reference_image_01 ~ reference_image_05
  └─ also into Comfyui-Luck gpt-image-2 image_01 ~ image_05

图生图提示词控制器 optimized_prompt
  └─ into 文本停留编辑器 text_list

文本停留编辑器 edited_text
  └─ into Comfyui-Luck gpt-image-2 prompt (model: gpt-image-2.5-sunburst)
```

최종 `PreviewImage` / `SaveImage`에서 실행을 대기열에 추가합니다. 플로우가 일시 중지 편집기에서 멈추면 텍스트를 편집하고 노드에서 `Continue`을 클릭합니다. 이미지 하나를 고정해야 하는 주제 이미지로 사용하려는 경우에는 해당 이미지를 컨트롤러의 `subject_image`에도 연결하고 이미지 노드의 `image_01`에 배치합니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="세 가지 이미지 노드 중 어떤 것을 선택해야 합니까?">
    * **`Comfyui-Luck gpt-image-2` (공식)**: 실제 `size` / `quality`, 네이티브 마스크, 최대 16개의 참조 이미지, token별 과금입니다. 정확한 크기, 로컬 편집 또는 6개의 2.5 품질 등급이 필요할 때 선택하십시오. 텍스트-이미지에는 기본적으로 `gpt-image-2.5-flare`를, 편집에는 `gpt-image-2.5-sunburst`를 사용하십시오.
    * **`Comfyui-Luck gpt-2.0 all` (리버스)**: 호출별 과금(\$0.03/이미지), 약 30–60초, ChatGPT 웹 경로입니다. 엄격한 크기 제어가 필요하지 않고 반복 편집과 강력한 텍스트 렌더링이 필요할 때 선택하십시오.
    * **`Comfyui-Luck gpt-image-2-vip` (리버스)**: 호출별 과금(\$0.03/이미지), 약 90–150초, Adobe 경로입니다. 예비로 유지할 두 번째 리버스 경로이며, 플러그인은 현재 `size`를 전송하지 않습니다.
    * 전체 비교: [공식과 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="플러그인을 업데이트하면 기존 워크플로가 2.5로 전환됩니까?">
    아닙니다. 노드 이름, ID, 위젯 순서 및 기본 모델 `gpt-image-2`은 변경되지 않으므로 기존 워크플로는 원래 품질인 `gpt-image-2`로 계속 실행됩니다. 2.5를 사용하려면 `model (模型)` 드롭다운을 수동으로 전환하고 위 표를 사용하여 `quality`를 다시 선택하십시오.
  </Accordion>

  <Accordion title="동일한 high로 2.5로 전환했는데 왜 더 저렴하고 흐릿합니까?">
    2.5에서는 품질 등급이 다시 나뉘었습니다. 2026-09-09에 APIYI가 동일한 크기로 측정한 결과, 2.5 `high` 출력은 `gpt-image-2` `high`의 약 4분의 1에 해당하는 token을 사용하며 기존 `medium`와 일치합니다. 2.5에서 기존 `high` 예산을 사용하려면 `max`를 선택하십시오. 반대로 동일한 예산에서는 2.5가 더 저렴한 중간 등급 두 개로 `high` / `xhigh`를 추가합니다. 프로덕션에 배포하기 전에 등급별로 자체 prompt를 한 번씩 실행하고 `usage.output_tokens`를 비교하십시오.
  </Accordion>

  <Accordion title="플러그인은 gpt-image-2.5-all / gpt-image-2.5-vip를 지원합니까?">
    두 리버스 노드에는 현재 `gpt-image-2-all` 및 `gpt-image-2-vip`만 표시됩니다. `gpt-image-2-all`의 기반인 ChatGPT 웹 앱이 Images 2.5로 업그레이드되었으므로 해당 모델은 이미 2.5 이미지를 생성하며 `gpt-image-2.5-all`와 동일하게 동작하고 동일한 비용이 부과됩니다. [gpt-image-2.5-all 문서](/ko/api-capabilities/gpt-image-2-all/overview)를 참조하십시오. `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`는 아직 노드 드롭다운에 포함되지 않았습니다. 필요한 경우 API를 직접 호출하십시오.
  </Accordion>

  <Accordion title="설치 후 노드를 찾을 수 없습니까?">
    1. 폴더가 `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0`에 있는지 확인하십시오.
    2. `pip install -r requirements.txt`가 오류 없이 완료되었는지 확인하십시오.
    3. ComfyUI를 완전히 다시 시작하십시오(프런트엔드만 새로 고치는 것으로는 충분하지 않습니다).
  </Accordion>

  <Accordion title="4K, xhigh / max 또는 사용자 지정 크기에서 시간 초과가 자주 발생합니까?">
    * 공식 노드의 읽기 timeout 기본값은 600초입니다. 2.5 `xhigh` / `max` 및 2K / 4K에서는 이 값을 유지하거나 늘리십시오. `408 Timeout`는 일반적으로 잘못된 노드 매개변수가 아니라 제공업체 측 이미지 생성 작업의 시간 초과를 의미합니다.
    * 클라이언트에서 시간 초과가 발생한 후에도 동기 요청에 과금될 수 있으며, 자동 재시도로 인해 비용이 추가될 수 있습니다. 재시도를 비활성화하려면 `retry_times`를 `1`로 설정하십시오.
    * 서버 네트워크가 느린 경우 [CDN 이미지/동영상 다운로드가 느린 경우](/ko/faq/cdn-download-slow)를 참조하십시오.
    * 기본 도메인이 불안정하면 `api_base`을 `b.apiyi.com/v1` / `vip.apiyi.com/v1`로 전환하십시오.
  </Accordion>

  <Accordion title="기존 워크플로를 불러올 때 ‘최솟값 30보다 작은 값 3’이 보고됩니까?">
    기존 워크플로의 위젯 순서가 더 이상 노드와 일치하지 않아 `retry_times=3`가 `timeout_seconds=3`로 읽혔습니다. 저장소에서 현재 `example_workflow.json`를 사용하거나 노드를 삭제한 후 다시 추가하십시오.
  </Accordion>

  <Accordion title="일시 중지 편집기를 연결한 후 gpt-image-2에서 ‘목록에 없는 값’이 보고됩니까?">
    `prompt`를 입력 소켓으로 변환하면 기존 워크플로에서 prompt 자리 표시자가 하나 부족해지므로 그 뒤의 위젯이 하나씩 밀립니다(예: `mode`가 `gpt-image-2`를 읽고, `api_base`가 `2K`을 읽습니다). 현재 노드는 유효성 검사를 통과하고 실행 시 밀린 값을 복원합니다. 패널에 여전히 값이 밀린 상태로 표시되면 현재 워크플로를 다시 불러오거나 `Comfyui-Luck gpt-image-2`를 다시 추가하십시오.
  </Accordion>

  <Accordion title="리버스 노드의 b64_json이 접두사와 함께 반환됩니까?">
    리버스 `gpt-image-2-all` / `gpt-image-2-vip`는 `data:image/png;base64,` 접두사가 포함된 `b64_json`을 반환하지만, 공식 `gpt-image-2` 줄에는 접두사가 없습니다. 세 노드 모두 두 형식을 자동으로 디코딩하므로 출력을 `PreviewImage`에 바로 연결하십시오. 자세한 내용은 [공식과 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)를 참조하십시오.
  </Accordion>

  <Accordion title="호출에서 401 / 403이 반환됩니까?">
    1. `api_key`의 유효성과 그룹에 의해 제한되어 있는지 확인하십시오.
    2. 선택한 모델이 token에서 허용 목록에 있는지 확인하십시오.
    3. 잔액 문제는 [잔액이 충분해 보이지만 호출이 실패하는 경우](/ko/faq/balance-insufficient)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="gpt-image-2.5 / 2 (공식) 문서" icon="book" href="/ko/api-capabilities/gpt-image-2/overview">
    flare / sunburst / gpt-image-2 가격 및 매개변수 공유, 네이티브 2K/4K, 토큰당 과금
  </Card>

  <Card title="GPT-image-2.5 출시 설명" icon="newspaper" href="/en/news/gpt-image-2-5-launch">
    Flare는 더 빠르고 Sunburst는 더 정밀합니다. 6가지 품질 등급과 마이그레이션 안내를 제공합니다.
  </Card>

  <Card title="gpt-image-2-all (리버스) 문서" icon="book" href="/ko/api-capabilities/gpt-image-2-all/overview">
    ChatGPT 웹 경로, 이미지당 \$0.03
  </Card>

  <Card title="gpt-image-2-vip (리버스) 문서" icon="book" href="/ko/api-capabilities/gpt-image-2-vip/overview">
    Adobe 경로, 이미지당 \$0.03, 30가지 지원 크기
  </Card>

  <Card title="공식 및 리버스 비교" icon="scale" href="/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    공식과 리버스의 차이점을 정리한 하나의 표
  </Card>

  <Card title="ComfyUI 노드 모음" icon="workflow" href="/ko/scenarios">
    APIYI에 맞게 조정된 ComfyUI 노드를 더 찾아볼 수 있습니다.
  </Card>

  <Card title="Luck Nano Banana Pro (동일 작성자)" icon="puzzle" href="/ko/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr의 Gemini 계열 ComfyUI 노드
  </Card>

  <Card title="APIYI GPT-Image 2 스킬 (동일 모델)" icon="puzzle" href="/ko/scenarios/ecosystem/apiyi-gpt-image-skills">
    GPT 이미지 모델용 AI 에이전트 스킬 버전
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://www.apiyi.com">
    키, 사용량 및 그룹을 관리합니다.
  </Card>
</CardGroup>
