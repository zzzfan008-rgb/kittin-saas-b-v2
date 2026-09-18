> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX 과거 버전

> FLUX.1 [pro] / [pro] 1.1 / [pro] 1.1 Ultra / [dev] 사양, 가격, 그리고 FLUX.2로의 마이그레이션 안내

<Note>
  이 페이지에서는 APIYI에서 **여전히 호출 가능한** FLUX.1 \[pro] 텍스트-투-이미지 모델을 다룹니다. 최신 FLUX.2 세대와 편집 중심의 FLUX.1 Kontext는 [FLUX 개요](/ko/api-capabilities/flux/overview)에서 설명합니다.
</Note>

## 버전 스냅샷

| 모델 ID                | 배포일 (UTC+0) | APIYI 가격 | 상태     | 가장 적합한 용도            |
| -------------------- | ----------- | -------- | ------ | -------------------- |
| `flux-pro-1.1-ultra` | 2024-11     | \$0.0500 | 🟡 유지됨 | 레거시 초고해상도(4MP)       |
| `flux-pro-1.1`       | 2024-10     | \$0.0350 | 🟡 유지됨 | 레거시 텍스트-이미지 기준선      |
| `flux-pro`           | 2024-08     | \$0.0400 | 🟡 유지됨 | 1세대 프로, 레거시 호환       |
| `flux-dev`           | 2024-08     | \$0.0200 | 🟡 유지됨 | 개발/테스트, 오픈 웨이트 로컬 추론 |

<Tip>
  **새 프로젝트에는 FLUX.2를 권장합니다**: `flux-2-pro`는 `flux-pro-1.1`의 등급과 같으며, 품질, 다중 참조, 긴 prompt, 4MP 출력에서 큰 폭의 개선을 제공하면서도 비용은 비슷하거나 더 낮습니다. 아래의 마이그레이션 안내를 참고하십시오.
</Tip>

## 버전별 사양

### `flux-pro-1.1-ultra`

* **출시일**: 2024-11 (UTC+0)
* **APIYI 가격**: \$0.0500 (공식 \$0.06, 17% 절약)
* **최대 출력**: 약 4MP (FLUX.1 시리즈에서 가장 높음)
* **주요 기능**: 초고해상도, 선택적 raw 모드(솔직한 사진에 더 가까움)
* **알려진 제한**: 단일 참조만 지원, hex 색상 제어 불가, grounding 검색 없음
* **공식 문서**: `docs.bfl.ai/flux_models/flux_1_1_pro_ultra_raw`

### `flux-pro-1.1`

* **출시일**: 2024-10 (UTC+0)
* **APIYI 가격**: \$0.0350 (공식 \$0.04, 12.5% 절약)
* **최대 출력**: 약 1.6MP (예: 1024×1536)
* **주요 기능**: 1.0보다 향상된 품질과 prompt 준수, 업계 기준선
* **알려진 제한**: 단일 참조, 짧은 prompt(32K 없음)
* **공식 문서**: `docs.bfl.ai/flux_models/flux_1_1_pro`

### `flux-pro`

* **출시일**: 2024-08 (UTC+0)
* **APIYI 가격**: \$0.0400 (공식 \$0.04, 동일)
* **최대 출력**: 약 1.6MP
* **주요 기능**: BFL의 첫 상용 pro, 기본 텍스트-투-이미지
* **알려진 제한**: 품질과 준수도가 1.1보다 낮음 — 새 프로젝트에 사용할 이유가 없음

### `flux-dev`

* **APIYI 가격**: \$0.0200
* **최대 출력**: 약 1MP
* **주요 기능**: 오픈 가중치 변형판(FLUX.1 \[dev], 비상업 라이선스), 자체 GPU에서 호스팅 가능
* **알려진 제한**: \[pro] 등급보다 품질이 낮으며, 주로 연구, 프로토타이핑, 로컬 추론 검증용
* **공식 가중치**: `huggingface.co/black-forest-labs/FLUX.1-dev`

## 마이그레이션 가이드

<Steps>
  <Step title="차이점을 검토합니다">
    FLUX.2는 FLUX.1 \[pro]를 완전히 대체합니다: 4MP 출력(1.6MP 대비), 최대 8개의 다중 참조(기존 1개 대비), 32K-token prompt(짧은 prompt 대비), 네이티브 16진수 색상 제어, 타이포그래피 전문 티어. 1MP 이내에서는 과금이 비슷하거나 더 낮습니다.
  </Step>

  <Step title="나란히 실행합니다">
    `flux-pro-1.1`과 `flux-2-pro`에서 같은 prompt 세트를 일주일 동안 생성합니다. 텍스트 판독성, 다중 객체 일관성, 브랜드 색상 충실도를 비교합니다. 대부분의 경우 FLUX.2 \[pro]가 전반적으로 우세합니다.
  </Step>

  <Step title="점진적으로 배포합니다">
    먼저 트래픽의 10%를 `flux-2-pro`으로 전환하고 일주일 동안 품질과 비용을 관찰한 뒤, 100%까지 확대합니다. 1MP에서는 비용이 대체로 비슷하고 4MP에서는 눈에 띄게 더 저렴합니다.
  </Step>

  <Step title="파라미터 차이를 처리합니다">
    대부분의 파라미터는 그대로 이어지지만, 다음 사항에 유의합니다:

    * FLUX.1 \[pro]는 참조 이미지를 1장만 받지만, FLUX.2는 여러 참조를 지원합니다(JSON 필드 `input_image` \~ `input_image_8`, 최대 8개)
    * FLUX.1은 `prompt_upsampling`을 지원하지 않지만, FLUX.2 \[pro/max/flex]는 지원합니다
    * 일부 기존 종횡비 식별자(예: `aspect_ratio`)는 FLUX.2에서 `width`/`height` 또는 `size` 문자열로 대체됩니다
  </Step>
</Steps>

## 레거시 호출 예제

```python theme={null}
{/* Call any historical version by changing only the model field — all other params are OpenAI Images API compatible */}
from openai import OpenAI
import requests

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="flux-pro-1.1-ultra",
    prompt="A serene mountain landscape at golden hour, raw photo style",
    size="2048x1536"
)

# data[0].url is valid for only 10 minutes
url = resp.data[0].url
with open("legacy.jpg", "wb") as f:
    f.write(requests.get(url, timeout=30).content)
```

## 비용 비교

일반적인 사용량 기준(이미지당 고정 요금):

| 버전                    | APIYI 가격   | 100장       | 1,000장      | 10,000장      |
| --------------------- | ---------- | ---------- | ----------- | ------------ |
| `flux-pro-1.1-ultra`  | \$0.05     | \$5.00     | \$50.00     | \$500.00     |
| `flux-pro-1.1`        | \$0.035    | \$3.50     | \$35.00     | \$350.00     |
| `flux-pro`            | \$0.04     | \$4.00     | \$40.00     | \$400.00     |
| `flux-dev`            | \$0.02     | \$2.00     | \$20.00     | \$200.00     |
| **`flux-2-pro` (신규)** | **\$0.03** | **\$3.00** | **\$30.00** | **\$300.00** |
| **`flux-2-max` (신규)** | **\$0.07** | **\$7.00** | **\$70.00** | **\$700.00** |

<Info>
  **선택 방법**: 새 프로젝트에는 FLUX.2를 우선하십시오(일반 용도에는 `flux-2-pro`, 플래그십에는 `flux-2-max`). 레거시 통합이 깊게 얽혀 있고 회귀 테스트가 비현실적일 때만 FLUX.1 \[pro]를 계속 운영하십시오. `flux-dev`는 여전히 유효한 저비용 개발/테스트 옵션입니다.
</Info>

## 관련 문서

* [FLUX 개요](/ko/api-capabilities/flux/overview) — 전체 모델 매트릭스 및 선택
* [텍스트-이미지 플레이그라운드](/ko/api-capabilities/flux/text-to-image) — FLUX.2 + FLUX.1에서 사용 가능
* [이미지 편집 플레이그라운드](/ko/api-capabilities/flux/image-edit) — 다중 참조 융합 + 편집
