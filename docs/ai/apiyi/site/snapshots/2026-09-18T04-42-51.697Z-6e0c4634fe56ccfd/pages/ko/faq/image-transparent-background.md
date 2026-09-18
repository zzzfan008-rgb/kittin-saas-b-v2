> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 투명 배경(PNG 컷아웃)으로 이미지를 생성하려면 어떻게 하나요?

> gpt-image-2에 background: transparent를 전달하면 실제 알파 채널이 있는 PNG가 반환되며, 후처리는 필요하지 않습니다. png와 webp는 모두 작동하지만, jpeg에는 알파 채널이 없으므로 투명성과는 상호 배타적입니다. 이 페이지에서는 모든 이미지 모델, 최소 예제, 일반적인 오류를 다룹니다.

## 짧은 답변

**`gpt-image-2`을 사용하고 요청에 필드 두 개를 추가합니다.**

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

이미지는 실제 알파 채널이 포함된 PNG로 반환되므로 별도의 누끼 후처리가 필요하지 않습니다. 텍스트-이미지 생성과 이미지 편집 모두 이를 지원합니다.

<Info>
  `background: "transparent"`은 OpenAI가 2026-08-21에 GPT-Image-2에 대해 공개한 기능입니다(OpenAI에서 프리뷰로 표시). APIYI는 이를 처음부터 끝까지 검증했으며, 텍스트-이미지 생성과 이미지 편집 모두 실제 알파 투명도를 반환합니다.
</Info>

## 투명한 배경을 생성할 수 있는 모델

| 모델                                                               | 방법                                                                                              | 신뢰성                                                               |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2` | **매개변수** — `output_format`이 `png` 또는 `webp`로 설정된 `background: "transparent"` (세 모델 모두 동일한 매개변수) | ✅ 신뢰할 수 있으며 권장됩니다 (prompt에서 장면을 설명하지 않는 경우에 한함 — 아래 참조)           |
| `gpt-image-1.5` / `gpt-image-1`                                  | 동일한 매개변수                                                                                        | ✅ 신뢰할 수 있습니다 (이전 모델이므로 새 프로젝트에서는 `gpt-image-2.5-flare`만 사용하면 됩니다) |
| `gpt-image-2-all` / `gpt-image-2-vip`                            | **`background` 매개변수 없음** — prompt에서만 요청할 수 있습니다                                                 | ⚠️ 간혹 신뢰할 수 없습니다. 동일한 prompt가 흰색 배경으로 반환될 수도 있습니다                 |
| `seedream-5-0` / `seedream-5-0-pro`                              | prompt에 `output_format: "png"`과 `transparent background, alpha channel` 추가                      | ⚠️ prompt에 따라 달라지며, 모든 호출에서 alpha가 보장되지는 않습니다                     |
| Gemini 이미지 모델 (Nano Banana 제품군)                                  | prompt만 사용                                                                                      | ⚠️ 위와 동일합니다                                                       |
| `seedream-4-5` / `seedream-4-0`                                  | `jpeg` 출력만 지원하며 alpha 채널은 없음                                                                    | ❌ 지원되지 않습니다                                                       |

<Tip>
  **투명성이 안정적으로 필요하다면 `gpt-image-2`를 사용하십시오.** 매개변수와 prompt 요청은 동일하지 않습니다. 전자는 API에서 보장되지만 후자는 모델이 최선을 다해 처리하는 것입니다. 배치 규모에서는 그 차이가 나타납니다.
</Tip>

## 호출하는 두 가지 방법

### 텍스트-이미지 `/v1/images/generations`

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a cute cartoon fox sticker, flat vector illustration, single centered subject, clean cutout edges, no background, no shadow",
    "background": "transparent",
    "output_format": "png",
    "quality": "low"
  }'
```

### 이미지 편집 `/v1/images/edits`

일반 사진을 제공하고 배경을 제거하도록 요청합니다:

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

마스크 기반 인페인팅(`mask`)과 투명한 배경은 함께 사용할 수 있으며 서로 충돌하지 않습니다.

## 왜 `jpeg`가 작동하지 않는가

JPEG에는 **알파 채널이 없습니다** — 투명도를 저장할 곳이 없습니다. `output_format: "jpeg"`을 `background: "transparent"`와 함께 사용하면 400을 반환합니다:

```json theme={null}
{
  "error": {
    "message": "Transparent background is not supported for JPEG output format",
    "param": "background",
    "code": "invalid_value"
  }
}
```

투명도가 필요하면 `png`(무손실, 더 큼) 또는 `webp`(손실 있음이며 조정 가능, 더 작음, 알파도 지원)를 선택하십시오. `webp`는 파일 크기를 줄이기 위해 `output_compression`도 추가로 허용합니다.

## 편집은 정밀한 컷아웃이 아니라 재그림입니다

여기서 기대치를 미리 맞춰 두십시오. `/v1/images/edits`가 `background: transparent`와 함께 실행될 때 모델은 포토샵처럼 원본 윤곽을 따라가는 것이 아니라 **장면을 이해하고 대상을 다시 그립니다**. 즉:

* 대상의 **포즈, 스타일, 세부 묘사가 달라질 수 있습니다** — 이는 픽셀 수준의 보존이 아닙니다
* 원본에 더 가깝게 유지하려면 `quality: "high"`를 사용하고, prompt에 "원본 구도를 유지하고, 대상의 외형은 변경하지 마십시오"라고 명시하십시오
* 워크플로에 픽셀 단위로 정확한 추출이 필요하다면 `rembg`, `PIL`, 또는 `sharp`로 직접 컷아웃을 수행하십시오. 모델 생성은 정확한 매팅보다 "재사용 가능한 자산을 생성"하는 용도에 더 적합합니다

## prompt에서 장면을 묘사하지 마세요 — 이 파라미터는 이를 재정의할 수 없습니다

`background: "transparent"`는 알파 채널만 보장하고 모델이 컷아웃을 생성하도록 유도합니다. **prompt 또는 참조 이미지가 전체 장면을 묘사하면 모델은 그 장면을 그리며**, 이 파라미터는 이를 막을 수 없습니다. 이것이 투명 출력이 “가끔 작동하고 가끔 작동하지 않는” 가장 흔한 이유이며, 품질 등급과는 무관합니다.

2026-09-11에 `gpt-image-2.5-sunburst`로 측정, 30회 호출(중간 15회, 높음 15회, 텍스트-이미지 및 참조 이미지 편집 포함):

| Prompt 스타일                                                                                                     | 실제 투명도                             |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 피사체만(사과, 이어버드, 검객), 격리됨 / 배경 없음 포함                                                                             | 16 / 16, 중간과 높음 모두 동일하게 안정적        |
| 장면 묘사: “붉은 단풍잎이 있는 가을 숲 속의 검객”                                                                                 | 0 / 3, **숲 전체가 그려짐**, 중간과 높음 모두 동일 |
| 동일한 장면을 다시 작성: 검객 주변으로 흩날리는 몇 장의 단풍잎 + `isolated character on a transparent background, no scenery, no ground` | 2 / 2                              |
| 참조 이미지에 전체 배경이 있고, prompt는 장면만 묘사하며 컷아웃을 전혀 요청하지 않음                                                            | 1 / 2, 반반의 확률                      |
| 참조 이미지에 전체 배경이 있고, prompt에 `remove the scenery entirely, keep only the subject`라고 명시                           | 8 / 8                              |

세 가지 작성 규칙:

* ❌ **환경 단어**를 피하세요 — 바닥, 하늘, 방, 숲. 분위기를 원한다면 피사체에 연결하세요(“단풍 숲”이 아니라 “몇 장의 떨어지는 단풍잎”)
* ✅ 모든 prompt를 `isolated subject on a transparent background, no scenery, no ground, no shadow`로 끝내세요
* ✅ 참조 이미지에 배경이 있는 경우, 편집 prompt에 `remove the background entirely, keep only the character`를 명시하세요

`quality`를 `medium`에서 `high`로 높여도 투명도가 더 안정적이지는 **않습니다**. 단지 tokens 비용이 4배(439 → 1,756) 증가합니다.

## 과금

**투명성에는 추가 비용이 들지 않습니다.** 동일한 품질 등급과 크기에서 `background: "transparent"`과 `background: "opaque"`는 정확히 같은 수의 이미지 token을 소모하며, `gpt-image-2`에 대한 일반적인 token당 규칙에 따라 과금됩니다.

## 일반적인 오류

<AccordionGroup>
  <Accordion title="400: JPEG 출력 형식에서는 투명 배경이 지원되지 않습니다">
    `output_format`이 `jpeg`으로 설정되었습니다. `png` 또는 `webp`으로 변경하십시오.
  </Accordion>

  <Accordion title="이미지가 वास्तव로 투명이 아니라 흰색 배경입니다">
    세 가지를 확인하십시오. 첫째, `background` 필드가 실제로 API에 전달되었는지 확인합니다. 편집 엔드포인트는 `multipart/form-data`이므로 JSON 본문 필드가 아니라 `-F background=transparent`이어야 합니다. 둘째, 응답의 최상위 `background`이 `transparent`을 반환하는지 확인합니다. 셋째, `gpt-image-2`을 사용 중인지 확인합니다. `gpt-image-2-all` 및 `gpt-image-2-vip`에는 이러한 파라미터가 없으며 이를 자동으로 무시합니다.

    세 가지를 모두 확인했는데도 여전히 흰색 또는 전체 배경이 표시된다면, prompt(또는 참조 이미지)가 거의 확실하게 **장면을 설명하고 있는 것**입니다. 모델은 요청받은 환경을 그렸으며, 파라미터로 이를 재정의할 수 없습니다. 위의 “prompt에서 장면을 설명하지 마십시오”를 참조하십시오.
  </Accordion>

  <Accordion title="이미지에 실제로 알파 채널이 있는지 어떻게 확인하나요">
    Python 코드 조각 하나면 충분합니다.

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA means it has alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # share of fully transparent pixels
    ```

    모드 `RGB`은 알파 채널이 전혀 없음을 의미합니다. 모든 알파 값이 255인 모드 `RGBA`은 채널은 존재하지만 잘려 나간 부분이 없음을 의미합니다.
  </Accordion>

  <Accordion title="prompt에 이미 투명 배경이라고 적었는데, 왜 파라미터도 전달해야 하나요">
    prompt는 모델에 그렇게 그려 달라고 요청할 뿐이며, 모델은 투명해 보이는 회색과 흰색 체크무늬를 그릴 수 있습니다. 이러한 픽셀은 여전히 불투명합니다. 실제 알파 채널을 보장하는 것은 `background: "transparent"` 파라미터뿐입니다. 반대도 마찬가지입니다. 파라미터는 채널을 보장하지만 prompt에 설명된 장면을 재정의할 수는 없습니다. 둘은 함께 작동해야 합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="GPT-Image-2 개요" icon="image" href="/ko/api-capabilities/gpt-image-2/overview">
    전체 매개변수, 크기, 품질 등급 및 오류 코드
  </Card>

  <Card title="텍스트-이미지 API 레퍼런스" icon="wand-sparkles" href="/ko/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations`의 모든 필드
  </Card>

  <Card title="이미지 편집 API 레퍼런스" icon="scissors" href="/ko/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits` 및 다중 이미지 융합
  </Card>

  <Card title="마스크 인페인팅" icon="square-dashed" href="/ko/api-capabilities/gpt-image-2/mask-editing">
    알파 마스크를 사용하여 변경할 영역 표시
  </Card>

  <Card title="공식 릴레이와 리버스 라우트" icon="git-compare" href="/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    `gpt-image-2.5-flare` / `sunburst` / `gpt-image-2` / `-all` / `-vip` 중 선택
  </Card>

  <Card title="흰색 배경의 아티팩트" icon="triangle-alert" href="/ko/faq/white-background-image-artifacts">
    순백색 배경에서 발생하는 다른 문제
  </Card>
</CardGroup>
