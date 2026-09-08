> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image 이전 버전

> 기존 GPT-Image-1 / 1-mini / 1.5 모델의 개요 — 모델 ID, 가격, 엔드포인트, 그리고 GPT-Image-2 / GPT-Image-2-All로 이전하기 위한 마이그레이션 팁입니다.

<Info>
  새 프로젝트의 경우 [GPT-Image-2](/ko/api-capabilities/gpt-image-2/overview) (공식) 또는 [GPT-Image-2-All](/ko/api-capabilities/gpt-image-2-all/overview) (역방향 채널, 고정 \$0.03/이미지)을 사용하십시오. 이 페이지는 기존 통합이 문제를 해결하고 원활하게 마이그레이션할 수 있도록 기존 버전의 핵심 사항을 유지합니다.
</Info>

## 레거시 라인업

| Model ID           | 출시일       | Endpoint                                     | 가격                                  | 상태                                     |
| ------------------ | --------- | -------------------------------------------- | ----------------------------------- | -------------------------------------- |
| `gpt-image-1.5`    | 2025년 12월 | `/v1/images/generations`                     | 입력 \$5.00 / 출력 \$10.00 per M tokens | 사용 가능; `gpt-image-2`로 업그레이드하는 것이 권장됩니다 |
| `gpt-image-1`      | 2025년 4월  | `/v1/images/generations`, `/v1/images/edits` | 입력 \$2.50 / 출력 \$8.00 per M tokens  | 사용 가능; `gpt-image-2`로 업그레이드하는 것이 권장됩니다 |
| `gpt-image-1-mini` | 2025년 4월  | `/v1/images/generations`                     | `gpt-image-1`보다 낮음                  | 사용 가능                                  |

<Tip>
  **바로 적용 가능한 마이그레이션**: `model`를 `gpt-image-2` 또는 `gpt-image-2-all`로 변경하십시오. 파라미터(`size` / `quality` / `output_format`, …)는 대부분 호환되므로 구조적인 코드 변경은 필요하지 않습니다.
</Tip>

## 공통 파라미터 (생성)

모든 레거시 버전은 동일한 생성 파라미터를 사용합니다:

| 파라미터                 | 설명                                                   |
| -------------------- | ---------------------------------------------------- |
| `model`              | `gpt-image-1.5` / `gpt-image-1` / `gpt-image-1-mini` |
| `prompt`             | 이미지 설명(최대 1000자)                                     |
| `size`               | `1024x1024` / `1536x1024` / `1024x1536` / `auto`     |
| `quality`            | `low` / `medium` / `high` / `auto`                   |
| `output_format`      | `png` (기본값) / `jpeg` / `webp`                        |
| `output_compression` | JPEG/WebP만, 0–100%                                   |
| `background`         | `transparent` / `opaque` / `auto`                    |
| `n`                  | 이미지 수 (1–10)                                         |

## 빠른 예시

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.images.generate(
    model="gpt-image-1.5",  {/* or gpt-image-1 / gpt-image-1-mini */}
    prompt="A professional product photo on white background, soft studio lighting",
    size="1024x1024",
    quality="high"
)

print(response.data[0].url)
```

## 이미지당 요금 참고

GPT-Image-1 / 1.5는 token 과금과 이미지당 과금을 모두 지원하며, 시스템이 더 저렴한 방식을 자동으로 선택합니다:

### GPT-Image-1.5

| 품질 | 1024×1024 | 1024×1536 / 1536×1024 |
| -- | --------- | --------------------- |
| 낮음 | \$0.009   | \$0.013               |
| 보통 | \$0.034   | \$0.050               |
| 높음 | \$0.133   | \$0.200               |

### GPT-Image-1

| 품질 | 1024×1024 | 1024×1536 / 1536×1024 |
| -- | --------- | --------------------- |
| 낮음 | \$0.005   | \$0.006               |
| 보통 | \$0.011   | \$0.015               |
| 높음 | \$0.036   | \$0.052               |

<Warning>
  이미지당 수치는 참고용입니다. 실제 과금은 시스템이 더 저렴하다고 판단한 과금 방식(token 또는 이미지당)에 따릅니다.
</Warning>

## 이미지 편집 (`gpt-image-1` 전용)

`gpt-image-1`은 `/v1/images/edits` 엔드포인트를 통해 마스크 기반 편집을 지원합니다:

```python theme={null}
response = client.images.edit(
    model="gpt-image-1",
    image=open("original.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A modern glass skyscraper with reflective windows",
    size="1024x1024"
)
```

| 매개변수     | 설명                                          |
| -------- | ------------------------------------------- |
| `image`  | 원본 이미지, PNG/WebP/JPG, 각 50MB 미만, 최대 16개 이미지 |
| `mask`   | 마스크 이미지 — alpha=0인 픽셀은 다시 그려집니다             |
| `prompt` | 마스크 영역에 생성할 내용에 대한 설명                       |

<Note>
  새로운 편집 워크플로에는 [GPT-Image-2 Edit](/ko/api-capabilities/gpt-image-2/image-edit) (공식) 또는 [GPT-Image-2-All Edit](/ko/api-capabilities/gpt-image-2-all/image-edit) (리버스, 블렌딩을 위해 최대 16개의 입력 이미지를 지원함)을 사용합니다.
</Note>

## GPT-Image-2 / 2-All로 이전하기

| 필요한 사항                                       | 권장 대상                                    |
| -------------------------------------------- | ---------------------------------------- |
| 공식 OpenAI 엔드포인트를 유지하면서 정확한 크기/품질 제어가 필요함     | `gpt-image-2` (공식)                       |
| 예측 가능한 정액 요금 (\$0.03/image), 더 나은 지시 따르기를 원함 | `gpt-image-2-all` (리버스)                  |
| 여전히 마스크 기반 이미지 편집이 필요함                       | `gpt-image-2-all` edit 엔드포인트(최대 16개 이미지) |

<CardGroup cols={2}>
  <Card title="GPT-Image-2 개요" icon="bolt" href="/ko/api-capabilities/gpt-image-2/overview">
    최신 공식 버전 — 엔드포인트와 파라미터가 기존 버전과 호환됩니다
  </Card>

  <Card title="GPT-Image-2-All 개요" icon="sparkles" href="/ko/api-capabilities/gpt-image-2-all/overview">
    리버스 채널, 정액 \$0.03/image, 더 빠른 처리 시간
  </Card>

  <Card title="공식 vs 리버스 비교" icon="scale" href="/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    나란히 비교한 선택 가이드
  </Card>
</CardGroup>
