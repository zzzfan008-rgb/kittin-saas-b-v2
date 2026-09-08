> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 다중 이미지 융합 테스트 가이드

> 고객들은 종종 참조 이미지 제한이 Google의 공식 상한선(14장)과 일치하는지 묻습니다. 여기에는 재사용 가능한 두 가지 테스트 방법과, 저희가 직접 수행한 실제 14장 이미지 융합 테스트가 있습니다.

우리가 자주 받는 질문입니다: **“지원하는 참조 이미지 수가 공식 제한과 같습니까?”** Google의 공식 Gemini 이미지 모델은 **요청당 참조 이미지 14장**까지 지원하며, 이는 현재 업계에서 제공되는 가장 높은 한도입니다. 답은 **예입니다. 저희는 이를 지원합니다** — 하지만 “지원합니다”라는 말만으로는 충분하지 않습니다. 이 페이지에서는 직접 재현할 수 있는 테스트 방법론과, 실제로 수행한 14장 이미지 융합 테스트 결과를 함께 제공합니다.

## 직접 테스트해 볼 가치가 있는 이유

참조 이미지 14장은 **극단적인 시나리오**입니다. 일상적인 사용에서는 이런 상황을 만나지 않을 수 있지만, 서로 독립적으로 설계된 여러 요소를 하나의 합성물(포스터, 캠페인 비주얼 등)로 합쳐야 한다면 두 가지를 확인해야 합니다.

1. **실제로 호출이 성공합니까?** 14장의 이미지를 쌓으면 요청 본문이 눈에 띄게 커집니다. 너무 커서 거부되지는 않습니까?
2. **융합 결과가 합리적입니까?** 입력 이미지가 그렇게 많을 때 모델이 일부를 누락하거나, 요소를 잘못 배치하거나, 서로 섞어 버리지는 않습니까?

아래의 두 방법은 각각 이 두 질문 중 하나를 겨냥하며, 어느 쪽도 주관적인 미적 판단에 의존하지 않습니다. 결과가 올바른지는 한눈에 확인할 수 있습니다.

## 방법 1: 객관적 마커 테스트(먼저 수행하십시오)

**아이디어**: 복잡한 실제 장면 대신, **시각적으로 구분되고 개별적으로 셀 수 있는** N장의 카드를 생성합니다. 가장 간단한 버전은 1부터 14까지의 숫자입니다. 그런 다음 모델에게 이들을 하나의 이미지로 콜라주/융합하도록 요청합니다.

* 각 카드에 완전히 다른 색상 구성과 재질 스타일(네온 튜브, 브러시드 메탈, 분필 손글씨, 픽셀 아트, 조각된 나무 등)을 부여하여, 융합된 결과에서 **모든 숫자가 색상과 스타일만으로 원래 카드까지 추적될 수 있도록** 하십시오;
* 융합 후에는 그냥 눈으로 확인하십시오: **14개의 숫자가 모두 있고, 중복이나 누락이 없는가?** "보기 좋은가"를 판단할 필요는 없고, 오직 "완전하고 정확한가"만 보면 됩니다.

<Frame caption="14 visually distinct number cards fused into a single poster: 1–14 all clearly legible, each retaining the color and material style of its source image">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-numbers-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=7d15943d875496202258495a5b0267d9" alt="14개의 창의적인 숫자 카드를 3행 5열 격자 포스터로 융합하되, 각 숫자는 고유한 색상과 재질 스타일을 유지합니다" width="1600" height="1600" data-path="images/multi-image-fusion-14-numbers-demo.jpg" />
</Frame>

이 방법의 가치는 **잡음을 제거하는 것**입니다. 모델이 가장 기본적인 확인, 즉 "숫자가 맞는가"를 제대로 해낸다면, 이는 몇 장만 무작위로 고르는 것이 아니라 모든 입력 이미지를 실제로 처리하고 있다는 강력한 증거입니다.

## 방법 2: 실제 시나리오 분해 테스트

**아이디어**: 만들고자 하는 실제 장면을 N개의 독립된 요소로 분해해 각각 따로 생성한 다음, 모델이 이를 다시 하나의 장면으로 합치게 하는 방식입니다. 이는 실제 사용에 더 가깝습니다. 예를 들어 캐릭터, 의상, 소품, 배경을 각각 따로 관리한 뒤 최종 샷으로 합성하는 방식입니다.

예를 들어, 우리는 패션 에디토리얼 장면을 14개의 독립된 요소로 분해했습니다. 모델 초상, 아우터, 차량, 배경, 반려동물/액세서리, 가방, 주얼리, 신발, 여행 가방 등이 포함되며, 각각은 일관된 스타일 기준(예: 모두 "밝은 회색 스튜디오 배경, 사실적인 사진")을 적용한 독립 이미지로 생성됩니다.

<Frame caption="14 independently generated fashion elements (model, outfit, car, pet, bag, accessories, etc.) fused into a single fashion editorial scene — all elements present, composition coherent">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-fashion-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=03cb3f755876ce41b2a49fed3c526dfe" alt="14개의 독립된 패션 요소가 하나의 완전한 패션 에디토리얼 장면으로 합쳐졌으며, 모델이 분홍색 차에 기대고 있고, 앵무새, 개, 핸드백 및 다른 요소들이 모두 포함되어 있습니다" width="1194" height="1600" data-path="images/multi-image-fusion-14-fashion-demo.jpg" />
</Frame>

확인할 사항: **샷 안에 14개 요소가 모두 포함되어 있는지**, 배치/스케일이 일관적인지, 그리고 눈에 띄는 요소 손실이나 왜곡이 있는지입니다. 실제 시나리오의 합성은 자연스럽게 "숫자 콜라주"보다 더 어렵습니다(서로 다른 요소에 대해 조명과 원근을 하나로 통일해야 하기 때문). 따라서 이 단계는 복잡한 실제 비즈니스 시나리오에서의 합성 품질을 더 현실적으로 시험하는 테스트입니다.

<Tip>
  우리는 **두 방법을 모두** 실행할 것을 권장합니다. 방법 1은 "모델이 모든 입력 이미지를 실제로 처리했는가"에 답하고, 방법 2는 "복잡한 실제 시나리오에서도 합성 품질이 충분한가"에 답합니다. 방법 2만 실행하면 실패 원인을 진단하기 어렵습니다. "모델이 이미지를 놓쳤는지" 아니면 "구성이 그다지 좋지 않은지"를 구분할 수 없기 때문입니다.
</Tip>

## 요청 형식: 한 번의 요청에 이미지 14개 넣기

Gemini의 네이티브 형식에서는 멀티 이미지 융합 규칙이 간단합니다: **하나의 `text` 부분(융합 지시문) + N개의 `inlineData` 부분(참조 이미지마다 하나씩)**. 각 부분은 `text` 또는 `inlineData`일 수 있을 뿐이며, 둘 다 동시에 될 수는 없습니다.

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# Up to 14 reference images
image_paths = ["01.png", "02.png", "03.png", "..."]  # max 14
parts = [{"text": "Fuse the elements from these images into a single coherent scene, keeping the style consistent and the composition balanced"}]
for path in image_paths:
    parts.append({"inlineData": {"mimeType": "image/png", "data": to_b64(path)}})

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "1:1", "imageSize": "2K"}
        }
    },
    timeout=600  # more images and a larger request body — allow a generous timeout
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("fused.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

전체 멀티 이미지 편집 형식(`parts` 구조, 흔한 오류)에 대해서는 [Image Edit API 레퍼런스](/ko/api-capabilities/nano-banana-image/image-edit)와 [Nano Banana 시리즈 개발자 가이드](/ko/api-capabilities/nano-banana-dev-guide)를 참고하십시오.

## 고객이 가장 궁금해하는 질문: 대형 요청은 거부됩니까?

압축되지 않은 원본 이미지 14장을 보내면 요청 본문이 눈에 띄게 커집니다. 실제 수치를 바탕으로 한 실험도 진행했습니다(2K 해상도 이미지 14장, 압축 없음):

| 항목                   | 측정값                                   |
| -------------------- | ------------------------------------- |
| 원본 이미지 1장의 크기        | 약 1.7MB – 4.0MB                       |
| 14장 합계(Base64 인코딩 후) | **약 42–43MB**                         |
| 요청 결과                | **모두 성공했습니다** — 페이로드 크기로 인한 거부는 없었습니다 |

<Info>
  APIYI의 요청당 이미지 페이로드 상한은 **100MB**입니다(과도한 메모리 사용을 피하기 위한 동기 호출 기준입니다). 단일 이미지는 Google의 공식 규칙인 **7MB 이하**를 따릅니다. 2K 해상도 14장의 총합은 42–43MB였으므로 두 제한 모두 한참 이내였고, 요청은 문제없이 처리되었습니다.
</Info>

**결론**: 압축이 없어도 2K 기준 14장의 참고 이미지는 일반적으로 페이로드 한계에 걸리지 않습니다. 다만 **압축은 여전히 권장됩니다** — 압축되지 않은 업로드가 거부되기 때문이 아니라, 압축된 업로드가 **눈에 띄게 더 빠르게** 완료되기 때문입니다(저희 테스트에서는 더 큰 페이로드의 전송과 서버 측 디코딩을 생략하므로 같은 융합 작업이 압축 후 대략 1/2에서 1/3 수준의 시간이 걸렸습니다). 구체적인 압축 매개변수(목표 최장 변, JPEG 품질, 여러 이미지의 합산 크기 예산)는 [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution)를 참고하십시오.

## 이미지가 돌아오지 않으면 먼저 안전 차단 여부를 확인하세요

멀티 이미지 융합 작업은 때때로 `finishReason: IMAGE_SAFETY`에 걸립니다(HTTP 상태는 여전히 200이지만, `content.parts`은 비어 있습니다). 테스트에서는 **완전히 같은 입력을 한두 번 다시 시도하면 성공하는 경우가 많습니다**. 이런 차단은 어느 정도 무작위성이 있으며, 반드시 입력에 실제 문제가 있다는 뜻은 아닙니다.

<Tip>
  안전 이유로 차단된 이미지는 **과금되지 않습니다**. 이런 경우를 하드 실패로 처리하기보다, `IMAGE_SAFETY`에 대한 자동 재시도를 연동에 넣는 것을 권장합니다. 더 많은 오류 유형(안전 차단, 콘텐츠 검토, 시간 초과)과 처리 방법은 [Gemini Image API 오류 처리 가이드](/ko/api-capabilities/gemini-image-error-handling)를 참고하세요.
</Tip>

## 빠른 참고

* Google의 공식 한도는 요청당 **참조 이미지 14개**입니다. APIYI는 이를 완전히 지원하는 것으로 검증했으며, 호출은 성공하고 결합 결과도 일관적입니다.
* 직접 테스트할 때는 **두 가지 방법 모두** 실행하십시오. 숫자 카드 테스트는 완전성을 검증하고, 실제 시나리오 분해 테스트는 결합 품질을 검증합니다.
* 2K 기준 원본 이미지 14장은 총 약 40MB입니다. **APIYI의 100MB 요청 한도와 Google의 이미지당 7MB 제한을 충분히 밑돌기 때문에** 거부되지 않습니다. 더 빠른 처리를 위해서는 압축을 권장합니다.
* 다중 이미지 요청 구조: **1개의 text part + N개의 inlineData part**입니다. 같은 part 안에 둘을 함께 넣지 마십시오.
* `IMAGE_SAFETY`와 함께 빈 이미지가 돌아오면 먼저 한두 번 다시 시도하십시오. 종종 성공하며, 차단된 이미지는 과과금되지 않습니다.

## 관련 문서

* [Nano Banana 시리즈 개발자 가이드](/ko/api-capabilities/nano-banana-dev-guide)
* [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution)
* [Gemini Image API 오류 처리 가이드](/ko/api-capabilities/gemini-image-error-handling)
* [만족스러운 이미지를 얻는 방법](/ko/api-capabilities/image-generation-success-tips)
