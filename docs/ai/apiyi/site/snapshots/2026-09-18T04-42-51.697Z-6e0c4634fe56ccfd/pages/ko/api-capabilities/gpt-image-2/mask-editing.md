> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 마스크 인페인팅 가이드

> gpt-image-2 마스크 기반 인페인팅에 대한 완전한 가이드 — 알파 채널 기초, 마스크 생성 및 검증, Python/cURL/Node.js 예제, 오류 문제 해결

<Info>
  이 페이지는 `gpt-image-2`를 `POST /v1/images/edits`를 통해 사용하는 로컬 편집(inpainting)에 대한 실습 가이드입니다. **image + mask + prompt**를 업로드하여 사용합니다. 전체 파라미터 참고 자료와 대화형 Playground는 [이미지 편집 API 참고](/ko/api-capabilities/gpt-image-2/image-edit)를 확인하십시오.
</Info>

## 핵심 원리: 알파 채널이 편집 영역을 정의합니다

지역화된 편집 요청은 세 부분으로 구성됩니다:

```text theme={null}
original image
+ mask image
+ edit prompt
= fully edited image
```

마스크는 PNG **알파(투명도) 채널**을 통해 편집 가능한 영역을 표시합니다:

| 마스크 영역 |  알파 값 | 효과                            |
| ------ | ----: | ----------------------------- |
| 완전 투명  |     0 | 모델이 편집할 수 있습니다                |
| 완전 불투명 |   255 | 원본을 최대한 보존합니다                 |
| 반투명    | 1–254 | 전이 영역입니다. 정확한 규칙으로 의존하지 마십시오. |

<Warning>
  **가장 흔한 실수**: 편집 영역을 결정하는 것은 **알파 채널**이며, 눈에 보이는 검은색 또는 흰색 픽셀이 아닙니다.

  ```text theme={null}
  Transparent region = the area to modify
  Opaque region      = the area to keep unchanged
  ```

  "흑백처럼 보이는" PNG이지만 알파 채널이 없으면 `invalid_image_file`로 실패합니다.
</Warning>

### 시각적 예시

원본 이미지가 1024×1024라고 가정합니다:

```text theme={null}
┌──────────────────────────┐
│      Opaque region        │
│   keep original intact    │
│                          │
│      ┌──────────┐        │
│      │transparent│       │
│      │→ flowers  │       │
│      └──────────┘        │
└──────────────────────────┘
```

다음과 같은 prompt를 사용하면:

```text theme={null}
Replace the cup in the transparent region with a bouquet of white tulips.
Keep everything else unchanged, preserving the original lighting,
camera angle, and photographic style.
```

## 마스크는 하드 크롭이 아닙니다

GPT Image 마스크는 Photoshop 선택 영역처럼 절대적인 픽셀 수준 제약이 아닙니다. 공식적으로 마스크 편집은 여전히 **프롬프트 유도 편집**입니다. 즉, 모델은 마스크를 참조로 사용하지만 모든 픽셀 경계를 엄격하게 준수한다고 보장하지는 않습니다.

따라서 다음과 같은 현상이 나타날 수 있습니다:

* 마스크 바깥의 미세한 그림자 변화
* 마스크를 넘어서는 객체 가장자리
* 조명과 반사 변화의 연동
* 배경의 미세한 다시 칠하기
* 마스크 경계 부근의 전이 효과

이는 자연스러운 블렌딩에는 좋지만, 픽셀 단위의 완전한 보존이 필요할 때는 적합하지 않습니다(아래의 “마스크 바깥 콘텐츠를 엄격하게 보존하기” 참조).

### 편집 안정성 향상

그냥 “빨간 셔츠로 바꿔 주세요”라고만 쓰지 마십시오. 대신 다음처럼 쓰십시오:

```text theme={null}
Only modify the transparent region of the mask. Replace the person's top
with a plain red crew-neck cotton T-shirt. Keep the face, hair, body pose,
arms, background, composition, camera angle, lighting direction, and image
dimensions unchanged. The new shirt must fit the body naturally and
preserve the original photographic realism.
```

실용적인 팁:

1. 마스크를 대상 객체의 가장자리보다 약간 크게 만드십시오
2. 객체의 중앙만 덮지 말고 가장자리, 그림자, 반사도 포함하십시오
3. 변경되지 않아야 하는 내용을 명시적으로 밝히십시오
4. 편집 영역이 너무 작으면 마스크를 더 크게 하십시오
5. 절대적인 보존이 필요하면, 최종 픽셀 합성은 직접 수행하십시오(아래 참조)

## 마스크를 쓸까 말까? Prompt-Only 편집과의 트레이드오프

흔히 나오는 질문입니다: **현대 AI는 이미 일반적인 언어만으로도 “가리키는 대상을 정확히 편집”할 수 있는데 — 왜 굳이 마스크를 만들어야 합니까?**

사실 `gpt-image-2`은 마스크 없이도, 단지 "테이블 왼쪽에 있는 컵을 꽃으로 바꿔 주세요"라고만 주어지면 보통 맞는 위치를 편집합니다 — 지시 이행 능력이 강력하고, 가벼운 편집에는 prompt만으로도 충분하기 때문입니다. 하지만 마스크는 **언어가 모호하거나, 모호하지 않더라도 여전히 충분히 신뢰할 수 없는** 경우를 해결합니다:

| 시나리오                                       | Prompt만                   | Prompt + 마스크               |
| ------------------------------------------ | ------------------------- | -------------------------- |
| 프레임에 대상 객체가 하나뿐인 경우                        | ✅ 충분합니다; 마스크는 과합니다        | 불필요합니다                     |
| 비슷한 객체가 여러 개이고 하나만 편집할 때(가운데 사람의 옷차림만 바꾸기) | ⚠️ 엉뚱한 쌍둥이를 쉽게 건드립니다      | ✅ 공간적으로 고정되어 모호성이 전혀 없습니다  |
| 엄격한 경계가 필요한 경우(제품 사진 / UI 스크린샷 / 신분증 레이아웃) | ❌ 전체 이미지 재생성; 영역이 드리프트합니다 | ✅ 픽셀 합성을 쓰면 엄격하게 그대로 유지됩니다 |
| 배치 파이프라인(고정된 레이아웃에서 같은 영역을 반복해서 교체)        | ⚠️ 실행마다 불안정합니다            | ✅ 마스크는 프로그래밍 가능하고 재현 가능합니다 |
| 정밀한 모양 / 위치 제어(객체를 정확한 좌표로 이동)             | ❌ 언어로는 픽셀 위치를 표현할 수 없습니다  | ✅ 마스크 자체가 픽셀 좌표입니다         |

연구 결과도 같은 방향을 가리킵니다: 마스크 없는(순수 텍스트 기반) 편집은 정밀한 공간 제어에 약합니다 — 예를 들어 prompt-to-prompt 스타일 기법은 객체를 프레임 안에서 **공간적으로 이동**시킬 수 없으며, 암묵적 편집 영역이 빗나가면 "바뀌어야 할 부분은 안 바뀌고, 바뀌면 안 되는 부분이 바뀌는" 상황이 생깁니다. 마스크 기반 편집은 약간의 편의성을 포기하는 대신 명시적인 공간 정밀도를 얻습니다.

<Tip>
  **한 문장으로 말하면**: 마스크는 더 이상 구식 기술이 아닙니다 — "필수"에서 "정밀 제어 도구"로 역할이 바뀌었습니다. 가벼운 채팅형 편집 → prompt만 사용하면 됩니다; 재현 가능하고, 제어 가능하며, 경계가 엄격해야 하는 프로덕션 작업 → 마스크를 사용하십시오. 또한 `gpt-image-2`를 사용한 prompt-only 편집은 본질적으로 **전체 이미지 재생성**이므로, 지정하지 않은 영역도 함께 바뀔 수 있습니다 — 이것이 바로 마스크 + 픽셀 합성이 존재하는 이유입니다.
</Tip>

## 파일 요구 사항 한눈에 보기

| Item      | Requirement                                     |
| --------- | ----------------------------------------------- |
| 이미지 형식    | PNG / JPG / WebP, 각각 50MB 미만                    |
| 입력 이미지 수  | 최대 16개(`image[]` 필드를 반복합니다)                     |
| 마스크 형식    | **알파 채널이 있는 PNG(필수)**                           |
| 마스크 크기    | **첫 번째** 이미지와 **정확히** 일치해야 합니다(1픽셀만 어긋나도 실패합니다) |
| 마스크 파일 크기 | 4MB 미만                                          |
| 마스크 적용 범위 | `image[0]`에만 적용됩니다(첫 번째 이미지)                    |

여러 이미지를 사용해 편집할 때의 역할 지정:

```text theme={null}
image[0]  = the main editing canvas
image[1…] = reference images
mask      = applies only to image[0]
```

<Tip>
  “정확히 일치하는 크기”라는 말이 번거롭게 들릴 수 있지만, 크기를 수작업으로 맞출 필요는 없습니다. 마스크는 **원본 이미지에서 파생**되기 때문입니다(복사본에서 지우기 / 브러시 / 세그먼트화를 통해 생성됩니다). 따라서 크기 일치는 자동으로 보장됩니다. 아래의 [마스크는 어디에서 오나요](#where-do-masks-come-from-five-common-methods)를 참고하십시오.
</Tip>

## Python Example

```python theme={null}
import base64
from pathlib import Path
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("input.png", "rb") as image_file, \
     open("mask.png", "rb") as mask_file:

    result = client.images.edit(
        model="gpt-image-2.5-sunburst",
        image=image_file,
        mask=mask_file,
        prompt=(
            "Only modify the transparent region of the mask. "
            "Replace the white cup on the table with a bouquet of white tulips. "
            "Keep the table, background, camera angle, composition, and lighting unchanged. "
            "The bouquet should sit naturally where the cup was, casting shadows "
            "consistent with the original lighting."
        ),
        size="1536x1024",
        quality="high",
        output_format="png",
        n=1,
    )

image_bytes = base64.b64decode(result.data[0].b64_json)
Path("edited.png").write_bytes(image_bytes)
print("Saved: edited.png")
```

<Warning>
  **Do not pass `input_fidelity="high"`** — all three models always process input images at high fidelity by default. The API does not allow adjusting this parameter; passing it returns a 400 error (verified on 2.5 on 2026-09-09). Simply omit it.
</Warning>

## cURL 예시

이미지 편집 엔드포인트에는 `multipart/form-data`가 필요합니다 — 이미지와 마스크를 일반 JSON 필드로 제출할 수 없습니다:

```bash theme={null}
curl -s \
  -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-sunburst" \
  -F "image[]=@input.png;type=image/png" \
  -F "mask=@mask.png;type=image/png" \
  -F "prompt=Only modify the transparent region of the mask. Replace the cup on the table with a bouquet of white tulips. Keep everything else unchanged, preserving the original composition, lighting, and photographic realism." \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "output_format=png" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > edited.png
```

단일 이미지인 경우에도 공식 예시와 같이 `image[]` 필드 이름을 사용합니다.

<Warning>
  `-F`을 사용할 때는 **직접 설정하지 마십시오** `-H "Content-Type: multipart/form-data"`. curl은 `boundary`을 자동으로 생성해야 합니다. 헤더를 수동으로 설정하면 경계가 삭제되고 서버에서 파일을 구문 분석할 수 없습니다.
</Warning>

## Node.js 예제

```javascript theme={null}
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({
  apiKey: "sk-your-api-key",
  baseURL: "https://api.apiyi.com/v1",
});

const image = await toFile(
  fs.createReadStream("input.png"),
  "input.png",
  { type: "image/png" }
);

const mask = await toFile(
  fs.createReadStream("mask.png"),
  "mask.png",
  { type: "image/png" }
);

const result = await client.images.edit({
  model: "gpt-image-2.5-sunburst",
  image,
  mask,
  prompt:
    "Only modify the transparent region of the mask. Replace the white cup " +
    "on the table with a bouquet of white tulips. Keep the background, " +
    "composition, camera angle, and lighting unchanged.",
  size: "1536x1024",
  quality: "high",
  output_format: "png",
});

const imageBuffer = Buffer.from(result.data[0].b64_json, "base64");
fs.writeFileSync("edited.png", imageBuffer);
console.log("Saved: edited.png");
```

## 마스크는 어디에서 오나요? 다섯 가지 일반적인 방법

사람들은 종종 마스크를 어렵게 느낍니다 — "원본 이미지와 픽셀 단위까지 정확히 일치해야 한다"는 생각 때문입니다. 핵심은 이것입니다: **마스크를 처음부터 직접 그리는 일은 거의 없고, 원본 이미지에서 파생한다는 점입니다**. 코드, 사진 편집기, 웹 캔버스 중 무엇을 쓰든 흐름은 항상 "원본을 연다 → 그 위에 영역을 표시한다 → 내보낸다"이므로, 크기 일치는 **자동**입니다.

| 방법                       | 적합한 용도                        | 난이도                      |
| ------------------------ | ----------------------------- | ------------------------ |
| ① 코드로 생성하기 (PIL로 영역 그리기) | 고정 레이아웃의 배치 작업, 좌표가 이미 알려진 경우 | 낮음(몇 줄)                  |
| ② 사진 편집기에서 수동으로 지우기      | 일회성 정밀 편집, 복잡한 형태             | 낮음(기본 선택 기술)             |
| ③ 웹 브러시 캔버스              | 자체 제품에 "브러시로 편집" 기능을 넣을 때     | 중간(프런트엔드 Canvas)         |
| ④ AI 자동 세그멘테이션(SAM 계열)   | 한 번 클릭 / 한 문장으로 정밀 마스크 생성     | 중간(세그멘테이션 서비스를 배포하거나 호출) |
| ⑤ 흑백 마스크를 알파로 변환하기       | 다른 도구에서 나온 흑백 마스크를 사용할 때      | 낮음(몇 줄)                  |

### 방법 1: 프로그래밍으로 투명 마스크 생성하기

직사각형 영역을 투명하게 설정합니다(편집 가능):

```python theme={null}
from PIL import Image, ImageDraw

original = Image.open("input.png").convert("RGBA")

# Fully opaque by default: preserve everything
mask = Image.new("RGBA", original.size, (255, 255, 255, 255))

draw = ImageDraw.Draw(mask)

# Make the target region fully transparent: editable
# Coordinates: (left, top, right, bottom)
draw.rectangle((300, 250, 750, 800), fill=(0, 0, 0, 0))

mask.save("mask.png")
print("Mask size:", mask.size)
```

* `(255, 255, 255, 255)` = 불투명, 보존 영역
* `(0, 0, 0, 0)` = 투명, 편집 가능 영역

### 방법 2: 사진 편집기에서 수동으로 지우기

투명 PNG를 지원하는 편집기라면 무엇이든(Photoshop, GIMP, Krita, Photopea 등) 마스크를 만들 수 있습니다. 사실상 한 가지 작업으로 귀결됩니다: **편집하려는 영역을 지워 투명하게 만드는 것**입니다. Photoshop에서는 다음과 같습니다.

1. **원본 이미지의 복사본**을 엽니다(원본 자체에서 작업하면 크기가 정확히 일치합니다)
2. 레이어가 잠긴 "Background"라면, 더블클릭하여 일반 레이어로 변환합니다(Background 레이어는 투명을 지원하지 않습니다)
3. 올가미 / 빠른 선택 / 개체 선택 도구로 수정할 영역을 선택합니다
4. Delete를 누릅니다 — 선택 영역이 투명한 체크무늬로 바뀝니다
5. "PNG로 내보내기"(투명도 사용) — 결과는 유효한 알파 마스크입니다

GIMP에서도 같은 방식입니다: `Layer → Transparency → Add Alpha Channel`, 선택, Delete, PNG로 내보내기.

<Tip>
  모양은 직사각형에 전혀 국한되지 않습니다 — 올가미로 객체를 따라가거나 스마트 선택으로 피사체를 한 번 클릭하면, 지워진 투명 영역이 어떤 불규칙한 형태든 만들 수 있습니다. 선택 영역을 **객체 윤곽보다 몇 픽셀 더 크게** 확장하십시오(Photoshop: `Select → Modify → Expand`). 그러면 그림자와 가장자리도 함께 포함됩니다.
</Tip>

### 방법 3: 웹 브러시 캔버스

AI 사진 앱에서 보이는 "바꾸고 싶은 부분을 브러시로 칠하는" 상호작용은, 브라우저에서 실시간으로 생성되는 알파 마스크일 뿐입니다. 이는 단 하나의 Canvas API 속성을 중심으로 구성됩니다. 아래의 [브러시 스타일 편집은 어떻게 동작하는가](#mask-shapes-and-how-brush-style-editing-works)를 보십시오.

### 방법 4: AI 세그멘테이션으로 한 번에 마스크 만들기

브러시조차 번거롭게 느껴진다면, 세그멘테이션 모델에 맡기면 됩니다. Meta의 오픈소스 **SAM (Segment Anything Model)** 계열이 대표적인 선택입니다.

* **클릭으로 마스크 생성**: 객체를 한 번 클릭하면 모델이 픽셀 단위로 정확한 윤곽선(머리카락 한 올 수준의 가장자리까지)을 반환합니다
* **텍스트로 마스크 생성**: **SAM 3**는 2025년 11월에 오픈소스로 공개되었으며, "노란 택시 전체"나 "빨간 유니폼을 입은 선수들" 같은 개념 수준의 텍스트 prompt를 받아 일치하는 모든 인스턴스의 마스크를 반환합니다(모델과 코드는 `github.com/facebookresearch`, 개요는 `ai.meta.com`)
* **피사체 / 배경 분리**: `rembg` 같은 오픈소스 도구는 한 번의 명령으로 피사체와 배경을 분리합니다 — 배경 영역은 바로 "배경만 변경" 마스크로 사용할 수 있습니다

세그멘테이션 출력은 보통 흑백 비트맵입니다. 아래의 "방법 5"로 변환하십시오. Stable Diffusion 커뮤니티의 **Inpaint Anything** 확장과 ComfyUI의 마스크 편집기는 바로 이 파이프라인 — "SAM 세그멘테이션 + 브러시 보정 → 마스크 → 인페인트" — 을 성숙하게 구현한 사례이며, 참고할 만합니다.

### 방법 5: 흑백 마스크를 알파 마스크로 변환하기

이미 "검정 = 편집, 흰색 = 유지"인 마스크가 있다면:

```python theme={null}
from PIL import Image

bw_mask = Image.open("mask_bw.png").convert("L")

rgba_mask = Image.new("RGBA", bw_mask.size, (255, 255, 255, 255))

# Black (0)   → alpha 0   → transparent → edit
# White (255) → alpha 255 → opaque      → keep
rgba_mask.putalpha(bw_mask)

rgba_mask.save("mask.png")
```

### 업로드하기 전에 마스크 검증하기

많은 `invalid_image_file` 오류는 파일에 `.png` 확장자가 있지만 알파 채널 없이 RGB 채널만 있기 때문에 발생합니다. 업로드하기 전에 다음을 실행하십시오:

```python theme={null}
from PIL import Image

image = Image.open("input.png")
mask = Image.open("mask.png")

print("Mask format:", mask.format)
print("Mask mode:", mask.mode)
print("Mask size:", mask.size)

assert mask.format == "PNG", "Mask must be a PNG"
assert mask.mode in ("RGBA", "LA"), "Mask must contain an alpha channel"
assert image.size == mask.size, "Image and mask dimensions must match exactly"

alpha = mask.getchannel("A")
assert alpha.getextrema()[0] == 0, "Mask has no fully transparent editable region"

print("Mask check passed")
```

## 브러시 스타일 편집이 어떻게 작동하는지와 마스크 형태

### 마스크는 어떤 불규칙한 형태도 될 수 있습니다

마스크는 본질적으로 **픽셀 단위 비트맵**이며, 기하학적 도형이 아닙니다. 즉, 모든 픽셀이 고유한 알파 값을 가집니다. 따라서:

* 사각형과 원은 가장 단순한 예시일 뿐입니다
* 사람 형태의 실루엣, 머리카락 가닥의 경계, 자유롭게 그린 낙서, 서로 떨어진 여러 조각 모두 유효합니다
* 실제로는 **대부분의 마스크가 불규칙합니다**: 대상 객체의 윤곽을 따르되 약간 확장한 형태입니다

<Tip>
  유일한 "형태 조언"은 규칙이 아니라 결과에 관한 것입니다. 투명 영역은 **객체 전체와 그 가장자리, 그림자, 반사까지 완전히 덮어야 합니다**. 모델이 자연스럽게 섞일 여유를 주기 위해 넉넉하게 잡는 편이 좋습니다.
</Tip>

### 브러시 스타일 편집이 구현되는 방식

사진 앱에서 "변경할 부분을 브러시로 칠하는" 상호작용은 프런트엔드 관점에서 의외로 단순합니다. 즉, **두 개의 레이어를 겹쳐 놓고 브러시가 위 레이어를 투명도로 '지워' 나가는 방식**입니다.

```text theme={null}
Bottom <img>     shows the original (visual reference only, not exported)
Top <canvas>     same pixel dimensions as the original, initially fully opaque
                 wherever the brush passes → pixels become transparent
Export canvas    → a valid alpha-mask PNG
```

핵심은 한 줄입니다. 캔버스 합성 모드를 `destination-out`로 설정하면 됩니다(새로 그린 스트로크가 기존 픽셀을 "도려냅니다"):

```javascript theme={null}
const canvas = document.getElementById("mask-canvas");
const ctx = canvas.getContext("2d");

// 1. Canvas size = the image's natural pixel size (not its CSS display size);
//    matching dimensions come for free
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;

// 2. Start fully opaque = preserve everything
ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 3. The key line: switch the brush to "erase" mode — strokes become transparent
ctx.globalCompositeOperation = "destination-out";
ctx.lineWidth = 40;          // brush size
ctx.lineCap = "round";
ctx.strokeStyle = "rgba(0, 0, 0, 1)";

// 4. Draw on pointer events (convert display coordinates back to natural pixels)
canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;
  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  ctx.lineTo(event.offsetX * scaleX, event.offsetY * scaleY);
  ctx.stroke();
});

// 5. Export: a PNG mask with an alpha channel, ready to upload
canvas.toBlob((blob) => {
  const formData = new FormData();
  formData.append("mask", blob, "mask.png");
  // POST to /v1/images/edits together with the image and prompt
}, "image/png");
```

중요한 구현 세부 사항은 다음과 같습니다:

1. **좌표 변환**: 캔버스는 보통 페이지에서 CSS로 축소되어 있습니다. 스트로크 좌표를 `naturalWidth / clientWidth`으로 되돌려 변환하지 않으면 마스크가 어긋납니다
2. **실행 취소**: 각 스트로크를 그리기 전에 `ctx.getImageData()`로 스냅샷을 저장하고 `putImageData()`로 복원합니다
3. **마스크 팽창**: 사용자는 보통 객체의 중심만 브러시로 칠합니다. 따라서 제출하기 전에 마스크를 몇 픽셀 정도 프로그램적으로 확장해야 합니다(전문 도구의 "마스크 확장" 버튼과 같습니다). Python 쪽에서는 `PIL.ImageFilter.MaxFilter`이나 OpenCV의 `cv2.dilate`를 사용합니다
4. **반투명 미리보기**: 사용자에게 보이는 하이라이트(예: 반투명 빨강)는 **별도의 미리보기 레이어**에 그려야 하며, 내보내는 마스크 레이어는 엄격하게 이진의 불투명/투명 상태를 유지해야 합니다

### 더 나아가기: 클릭 또는 텍스트로 마스크 만들기

브러시를 한 단계 넘어서는 방식은 "사람의 스트로크"를 "모델 추론"으로 바꾸는 것입니다:

```text theme={null}
User clicks an object            → SAM returns a pixel-accurate outline mask
User types "the cup on the left" → SAM 3 finds all instances matching the concept
Program dilates + feathers       → submit to /v1/images/edits
```

이것이 바로 Inpaint Anything과 ComfyUI의 Mask Editor가 작동하는 방식입니다. **정밀도는 세분화가 담당하고, 브러시는 보정이 담당합니다**. 즉, 먼저 정확한 마스크를 자동 생성한 뒤 추가/정리 브러시 스트로크로 미세 조정합니다. 자체 제품을 만든다면, SAM을 백엔드 서비스로 배포하면서 브러시 캔버스를 대체 수단으로 유지하는 구성이 현재로서는 최고의 사용자 경험 조합입니다.

## 여러 참조 이미지 + 마스크

일반적인 시나리오: 의상 교체(첫 번째 이미지는 인물이고, 그 다음 이미지는 스타일/원단 참조 이미지이며, 마스크는 의상 영역을 표시합니다):

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("person.png", "rb") as person, \
     open("clothes_reference.png", "rb") as clothes, \
     open("fabric_reference.png", "rb") as fabric, \
     open("mask.png", "rb") as mask:

    result = client.images.edit(
        model="gpt-image-2.5-sunburst",
        image=[person, clothes, fabric],
        mask=mask,
        prompt=(
            "The first image is the subject to edit. "
            "Only modify the clothing inside the transparent mask region "
            "of the first image. Use the garment style from the second image "
            "and the fabric texture from the third image. Keep the face, "
            "hairstyle, pose, body proportions, background, and lighting "
            "of the first image unchanged."
        ),
        quality="high",
        size="1024x1536",
        output_format="png",
    )

with open("result.png", "wb") as output:
    output.write(base64.b64decode(result.data[0].b64_json))
```

<Tip>
  여러 이미지를 사용하는 경우, 프롬프트에서 **각 이미지의 역할을 명확하게 설명해야 합니다**(첫 번째 = 대상, 두 번째 = 스타일 참조, 세 번째 = 원단 참조). 그렇지 않으면 모델이 이미지를 혼동할 수 있습니다.
</Tip>

## 마스크 밖 내용을 엄격히 보존하기 (픽셀 수준 후처리)

모델이 마스크 밖의 내용을 약간 변경할 수 있으므로, 제품 사진, 신분증 레이아웃, 고정 UI 스크린샷처럼 픽셀 정확도가 필요한 경우에는 생성 후 마스크 밖 영역을 원본에서 다시 합성합니다:

```python theme={null}
from PIL import Image, ImageFilter

original = Image.open("input.png").convert("RGBA")
edited = Image.open("edited.png").convert("RGBA")
mask = Image.open("mask.png").convert("RGBA")

if edited.size != original.size:
    edited = edited.resize(original.size, Image.Resampling.LANCZOS)

# Original mask alpha: 0 = edit region, 255 = preserved region
alpha = mask.getchannel("A")

# Inverted: 255 = use edited result, 0 = use original
edit_area = alpha.point(lambda value: 255 - value)

# Slight feathering to avoid hard edges
edit_area = edit_area.filter(ImageFilter.GaussianBlur(radius=3))

final = Image.composite(edited, original, edit_area)
final.save("final.png")
```

결과: 마스크 안에는 AI 편집 결과가, 마스크 밖에는 원본 이미지가 유지되며, 경계는 약하게 페더링됩니다.

## 일반적인 오류

<AccordionGroup>
  <Accordion title="invalid_image_file / 잘못된 이미지 파일 또는 모드">
    일반적인 원인은 다음과 같습니다:

    * 마스크가 유효한 PNG가 아니거나 파일이 손상되었습니다
    * 확장자는 PNG이지만 실제 인코딩은 PNG가 아닙니다
    * 비정상적인 이미지 모드(CMYK, 팔레트 모드, 알파 누락)
    * 업로드 시 MIME type이 잘못되었습니다
    * 요청 전에 파일 스트림이 이미 사용되었거나 닫혔습니다

    다시 인코딩하면 대부분 해결됩니다:

    ```python theme={null}
    from PIL import Image

    Image.open("input_source.jpg").convert("RGBA").save("input.png")
    Image.open("mask_source.png").convert("RGBA").save("mask.png")
    ```
  </Accordion>

  <Accordion title="이미지와 마스크의 크기가 일치하지 않습니다">
    1픽셀 차이만 있어도 실패합니다. 해결 방법:

    ```python theme={null}
    from PIL import Image

    image = Image.open("input.png")
    mask = Image.open("mask.png").convert("RGBA")

    mask = mask.resize(image.size, Image.Resampling.NEAREST)
    mask.save("mask_fixed.png")
    ```
  </Accordion>

  <Accordion title="흑백 마스크에는 알파 채널이 없습니다">
    `RGB` / `L` / `P` 모드만으로는 충분하지 않습니다 — 마스크는 `RGBA`여야 합니다. 위의 “방법 2”를 사용하여 변환하십시오.
  </Accordion>

  <Accordion title="마스크 투명도와 출력 투명도는 서로 다른 것입니다">
    이 둘은 혼동하기 쉽습니다:

    ```text theme={null}
    Mask transparency:   marks "the model may change this area" — the alpha channel of the mask file
    Output transparency: the result itself carries an alpha channel — controlled by the background parameter
    ```

    둘은 **함께 작동합니다**: 편집 영역을 표시하기 위해 알파가 있는 `mask`를 전달하고, 투명한 결과를 얻으려면 `background: "transparent"`를 사용하십시오. 검증됨 — 둘은 서로 충돌하지 않습니다.

    출력 투명도를 사용하려면 `output_format`이 `png` 또는 `webp`여야 하며, 이를 `jpeg`와 함께 사용하면 400(jpeg에는 알파 채널이 없음)이 반환됩니다. 자세한 내용: [투명한 배경의 이미지는 어떻게 생성합니까](/ko/faq/image-transparent-background).
  </Accordion>

  <Accordion title="response_format=url은 이미지를 반환하지 않습니다">
    GPT Image 모델은 항상 Base64 데이터를 반환합니다. `response_format`은 레거시 DALL·E 2 동작에만 적용됩니다. 결과는 다음과 같이 읽습니다:

    ```python theme={null}
    result.data[0].b64_json
    ```
  </Accordion>

  <Accordion title="Content-Type이 multipart/form-data가 아닙니다">
    대개 `Content-Type` 헤더를 수동으로 설정하여(boundary가 사라짐) 발생하거나, 중간 계층이 multipart 요청을 전달하기 전에 JSON으로 파싱해서 발생합니다. HTTP 클라이언트가 multipart 헤더를 자동으로 생성하도록 두십시오.
  </Accordion>
</AccordionGroup>

## 크기 매개변수

`gpt-image-2`은 다음 모든 조건에 따라 유연한 치수를 지원합니다:

```text theme={null}
Width and height must both be multiples of 16
Longest side no more than 3840px
Aspect ratio no more than 3:1
Total pixels at least 655,360
Total pixels no more than 8,294,400
```

일반적인 크기: `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, `2048x1152`, `3840x2160`, `2160x3840`, `auto`. 정사각형 이미지는 일반적으로 더 빠르게 생성됩니다.

## 프로덕션 요청 템플릿

```python theme={null}
result = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=open("input.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="""
Only edit the transparent region of the mask.

Edit task:
Replace the white mug inside the transparent region with a bouquet
of white tulips.

Must preserve:
- Original composition
- Camera position and lens perspective
- Table surface and background
- Lighting direction and color temperature
- All people and objects outside the mask
- Realistic photographic style

Blending requirements:
The bouquet should sit naturally where the mug was, with shadows,
reflections, and contact points consistent with the scene lighting.
Do not add any other objects.
""",
    size="1536x1024",
    quality="high",
    output_format="png",
)
```

## 관련 페이지

<CardGroup cols={2}>
  <Card title="이미지 편집 API 레퍼런스" icon="image" href="/ko/api-capabilities/gpt-image-2/image-edit">
    전체 매개변수 레퍼런스 및 인터랙티브 플레이그라운드
  </Card>

  <Card title="GPT-Image-2 개요" icon="sparkles" href="/ko/api-capabilities/gpt-image-2/overview">
    모델 기능, 가격 및 버전 참고 사항
  </Card>
</CardGroup>

<Info>
  공식 참조 문서(브라우저에 복사하여 붙여넣으십시오):

  * 모델 페이지: `developers.openai.com/api/docs/models/gpt-image-2.5-sunburst`, `developers.openai.com/api/docs/models/gpt-image-2`
  * 이미지 편집 API 레퍼런스: `developers.openai.com/api/reference/python/resources/images/methods/edit/`
  * 이미지 생성 가이드: `developers.openai.com/api/docs/guides/image-generation`
</Info>
