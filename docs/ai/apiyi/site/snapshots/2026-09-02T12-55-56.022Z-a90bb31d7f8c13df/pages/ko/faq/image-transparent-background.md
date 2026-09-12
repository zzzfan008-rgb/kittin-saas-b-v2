> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 투명 배경(PNG 컷아웃)으로 이미지를 생성하려면 어떻게 하나요?

> gpt-image-2에 background: transparent를 전달하면 실제 알파 채널이 있는 PNG가 반환되며, 후처리는 필요하지 않습니다. png와 webp는 모두 작동하지만, jpeg에는 알파 채널이 없으므로 투명성과는 상호 배타적입니다. 이 페이지에서는 모든 이미지 모델, 최소 예제, 일반적인 오류를 다룹니다.

## 간단한 답변

**`gpt-image-2`을 사용하고 요청에 두 개의 필드를 추가합니다:**

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

이미지는 실제 알파 채널이 포함된 PNG로 반환됩니다 — 별도의 컷아웃 후처리는 필요하지 않습니다. 텍스트-이미지, 이미지 편집, 그리고 Responses 이미지 도구 모두 이를 지원합니다.

<Info>
  `background: "transparent"`는 OpenAI가 2026-08-21에 GPT-Image-2에 대해 공개한 기능입니다(OpenAI에서 프리뷰로 표시함). APIYI는 이를 엔드투엔드로 검증했습니다. 텍스트-이미지와 이미지 편집 모두 실제 알파 투명도를 반환합니다.
</Info>

## 어떤 모델이 투명 배경을 생성할 수 있습니까

| 모델                                    | 방법                                                                             | 신뢰성                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `gpt-image-2`                         | **매개변수** — `background: "transparent"`에서 `output_format`를 `png` 또는 `webp`으로 설정 | ✅ 안정적이며 권장됩니다                                                            |
| `gpt-image-1.5` / `gpt-image-1`       | 동일한 매개변수                                                                       | ✅ 안정적입니다(이전 모델이며, 새 프로젝트에서는 `gpt-image-2`만 사용하면 됩니다)                     |
| `gpt-image-2-all` / `gpt-image-2-vip` | **`background` 매개변수 없음** — 프롬프트에서만 요청할 수 있습니다                                  | ⚠️ 때때로 안정적이지 않습니다. 동일한 프롬프트라도 여전히 흰색 배경으로 나올 수 있습니다                      |
| `seedream-5-0` / `seedream-5-0-pro`   | 프롬프트에 `output_format: "png"`와 `transparent background, alpha channel`를 추가      | ⚠️ 프롬프트 기반이며, `transparent background, alpha channel`는 모든 호출에서 보장되지 않습니다 |
| Gemini 이미지 모델 (Nano Banana 계열)        | 프롬프트만                                                                          | ⚠️ 위와 동일합니다                                                              |
| `seedream-4-5` / `seedream-4-0`       | `jpeg` 출력만 제공되며, 알파 채널은 없습니다                                                   | ❌ 지원되지 않습니다                                                              |

<Tip>
  **투명 배경이 안정적으로 필요하시면 `gpt-image-2`를 사용하십시오.** 매개변수와 프롬프트 요청은 같은 것이 아닙니다. 첫 번째는 API에서 보장되지만, 두 번째는 모델이 최선을 다하는 것일 뿐입니다. 배치 규모에서는 그 차이가 드러납니다.
</Tip>

## 호출하는 세 가지 방법

### 텍스트-투-이미지 `/v1/images/generations`

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

일반 사진을 전달하고 배경을 제거해 달라고 요청합니다:

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

마스크 기반 인페인팅(`mask`)과 투명한 배경은 함께 동작하며 — 서로 충돌하지 않습니다.

### Responses 이미지 도구

```json theme={null}
{
  "model": "gpt-5.2",
  "input": "Generate a cartoon fox sticker",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

반환된 `image_generation_call`는 `"background": "transparent"`를 그대로 반영합니다.

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

## 과금

**투명성에는 추가 비용이 들지 않습니다.** 동일한 품질 등급과 크기에서 `background: "transparent"`과 `background: "opaque"`는 정확히 같은 수의 이미지 token을 소모하며, `gpt-image-2`에 대한 일반적인 token당 규칙에 따라 과금됩니다.

## 일반적인 오류

<AccordionGroup>
  <Accordion title="400: JPEG 출력 형식에서는 투명 배경이 지원되지 않습니다">
    `output_format`가 `jpeg`으로 설정되어 있었습니다. `png` 또는 `webp`으로 바꾸십시오.
  </Accordion>

  <Accordion title="이미지는 실제로 흰색 배경이며, 투명하지 않습니다">
    세 가지를 확인하십시오. 먼저, `background` 필드가 실제로 API에 전달되었는지 확인하십시오. edits 엔드포인트는 `multipart/form-data`이므로, JSON 본문 필드가 아니라 `-F background=transparent`여야 합니다. 둘째, 응답의 최상위 `background`가 `transparent`를 그대로 반영하는지 확인하십시오. 셋째, `gpt-image-2`를 사용하는지 확인하십시오. `gpt-image-2-all`와 `gpt-image-2-vip`에는 그런 파라미터가 없으므로 이를 조용히 무시합니다.
  </Accordion>

  <Accordion title="이미지에 정말 알파 채널이 있는지 어떻게 확인하나요">
    Python 스니펫 하나면 충분합니다:

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA means it has alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # share of fully transparent pixels
    ```

    모드 `RGB`는 알파 채널이 아예 없다는 뜻입니다. 모든 알파 값이 255인 모드 `RGBA`는 채널은 존재하지만 아무것도 잘려 나가지 않았다는 뜻입니다.
  </Accordion>

  <Accordion title="prompt에 이미 투명 배경이라고 적혀 있는데 — 왜 파라미터도 전달해야 하나요">
    prompt는 모델에 그렇게 그리라고 요청할 뿐이며, 모델은 투명해 보이기만 하는 회색과 흰색 체크무늬를 그릴 수도 있습니다. 그것들은 여전히 불투명한 픽셀입니다. 실제 알파 채널을 보장하는 것은 `background: "transparent"` 파라미터뿐입니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="GPT-Image-2 개요" icon="image" href="/ko/api-capabilities/gpt-image-2/overview">
    모든 매개변수, 크기, 품질 등급, 오류 코드
  </Card>

  <Card title="텍스트-투-이미지 API 레퍼런스" icon="wand-sparkles" href="/ko/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations`의 모든 필드
  </Card>

  <Card title="이미지 편집 API 레퍼런스" icon="scissors" href="/ko/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits` 및 다중 이미지 융합
  </Card>

  <Card title="마스크 인페인팅" icon="square-dashed" href="/ko/api-capabilities/gpt-image-2/mask-editing">
    변경할 영역을 표시하려면 알파 마스크를 사용합니다
  </Card>

  <Card title="공식 vs 리버스 경로" icon="git-compare" href="/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    `gpt-image-2` / `-all` / `-vip` 중에서 선택하기
  </Card>

  <Card title="흰색 배경의 아티팩트" icon="triangle-alert" href="/ko/faq/white-background-image-artifacts">
    순백색 배경에서의 또 다른 문제
  </Card>
</CardGroup>
