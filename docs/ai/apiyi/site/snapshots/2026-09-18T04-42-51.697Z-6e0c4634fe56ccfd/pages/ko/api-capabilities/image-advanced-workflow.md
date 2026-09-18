> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 고급 이미지 생성: 워크플로와 사실감

> 같은 모델, 더 나은 결과: 소비자용 이미지 앱이 API 위에 더하는 것들 — 프롬프트 재작성 계층, 레퍼런스 앵커링, 비전 모델 선택이 포함된 병렬 샘플링, 단계별 리터칭입니다. 복사해 붙여넣을 수 있는 사실감 관련 어휘, 나란히 비교하는 테스트, 비용 계산도 포함합니다.

[원하는 이미지를 얻는 방법](/ko/api-capabilities/image-generation-success-tips)은 “이 한 번의 시도는 실패했습니다. 어떻게 복구하나요”에 대한 답변입니다. 이 페이지는 다음 질문에 답합니다: **매번 시도가 성공하도록 하려면 어떻게 해야 하나요**.

늘 나오는 질문이 있습니다. `freepik.com`과 `higgsfield.ai` 같은 소비자용 이미지 제품은 여러분이 사용하는 것과 같은 기반 모델, 즉 같은 Nano Banana, GPT-이미지, FLUX 계열 위에서 동작합니다. 그런데도 출력은 더 완성도 있어 보입니다. 차이는 모델 가중치에 있지 않습니다. **그것은 모델을 감싸고 있는 레이어입니다**. 그리고 그 레이어는 직접 구축할 수 있습니다. 이 페이지에서 그 방법을 보여드립니다.

## 1. 모델을 둘러싼 소비자용 이미지 제품의 구성

이런 제품 하나를 분해해 보면 모델 바깥에 대략 8개의 층이 있습니다. 그 각각은 API에서 재현할 수 있습니다:

| 제품이 하는 일                                                                 | 해결하는 문제                                   | API에서 이를 재현하는 방법                                           |
| ------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------- |
| **프롬프트 재작성 계층** (Prompt Enhancer)                                        | 사용자는 대충 쓰지만, 모델은 구조화된 설명을 원함              | 먼저 텍스트 모델로 재작성한 뒤, 이미지 모델을 호출합니다(섹션 2)                     |
| **스타일 프리셋** (클릭 가능한 프리셋 수십 개와 저장해 둔 사용자 지정 프리셋)                          | 사진 용어를 몰라도 되도록 미적인 스타일을 고정함               | 프리셋은 코드에 있는 고정된 prompt 단편 상수와 고정된 참조 이미지 집합일 뿐입니다          |
| **아이덴티티 고정** (예: Higgsfield의 `Soul ID`처럼 20\~80장의 사진으로 지속적인 아이덴티티를 학습함)  | 같은 인물이 여러 생성 결과에서도 동일하게 유지됨               | 참조 이미지로 근사합니다(아래 경계 참고)                                    |
| **여러 개를 샘플링하고 하나만 보여줌**                                                  | 사용자는 항상 최상의 후보만 보므로 체감 적중률이 100%에 가까워짐    | N개를 병렬로 생성한 다음, 비전 모델이 점수를 매겨 선택하게 합니다(섹션 3, 단계 3–4)       |
| **단계별 편집**                                                               | 한 번에 넣은 복합 지시사항은 안정적으로 분해되지 않음            | 먼저 구도를 고정하고, 그다음 국소적으로 편집한 뒤, 마지막에 텍스트를 추가합니다              |
| **업스케일링 및 후처리** (Freepik은 2024년에 Magnific를 인수하여 2×–16× 창의적 업스케일링을 제공합니다) | 작은 출력을 인쇄 가능한 크기로 바꿈                      | APIYI에는 그런 엔드포인트가 없습니다 — 대신 생성 시 고해상도 티어를 선택하십시오(아래 경계 참고) |
| **네거티브 prompt 및 안전 폴백**                                                  | 알려진 모델 습성을 피해 가고, moderation이 거절할 요청을 걸러냄 | 고정된 네거티브 문구를 템플릿에 미리 넣고, moderation 실패 시의 대체 경로도 마련합니다     |
| **자산 라이브러리 및 재호스팅**                                                      | 사용자 이미지는 만료되거나 사라지지 않음                    | 모든 결과를 즉시 자체 object storage로 복사합니다                         |

<Warning>
  **경쟁사의 기능 목록을 그대로 옮기기 전에 정리해야 할 두 가지 플랫폼 경계:**

  1. **APIYI에는 업스케일링, 배경 제거, 얼굴 복원 엔드포인트가 없습니다.** 큰 이미지가 필요하면 나중에 키우는 계획을 세우지 말고 생성 시점에 고해상도 티어(`gpt-image-2` at 4K, Nano Banana Pro at 4K)를 선택하십시오. 투명 배경이 필요하면 official relay `gpt-image-2`와 `background: "transparent"`를 사용하십시오 — 실제 알파 채널이 있는 PNG를 반환합니다(`seedream-5-0` / `seedream-5-0-pro`는 프롬프트로만 지정할 수 있으며, 매 호출마다 alpha가 보장되지는 않습니다). [투명 배경으로 이미지를 생성하려면 어떻게 하나요](/ko/faq/image-transparent-background)를 참조하십시오.
  2. **APIYI는 LoRA나 아이덴티티 학습을 제공하지 않습니다.** `Soul ID` 뒤에 있는 “한 번 학습하면 얼굴을 영원히 고정” 기능은 참조 이미지로만 근사할 수 있습니다. 같은 캐릭터라도 장면과 조명 변화에 따라 여전히 흔들리며, 새 샷이 정면과 원래 조명에 가깝게 유지될 때 가장 잘 맞습니다. 엄격한 일관성이 필요한 상업용 캐릭터라면 사람 검수 단계를 예산에 반영하십시오.
</Warning>

## 2. 첫 번째 계층만으로도 결과가 이미 분리됩니다: 일반 입력을 구조화로 바꾸기

이것은 가장 효과가 큰 계층이며, 가장 자주 건너뛰는 계층이기도 합니다.

### 나란히 비교한 테스트: 하나의 모델, 하나의 브리프, 두 개의 prompt

브리프는 "커피용 이커머스 상품 사진"입니다. 왼쪽은 사용자가 실제로 입력한 내용이고, 오른쪽은 빠진 결정을 채워 넣은 같은 브리프입니다. 두 경우 모두 `gemini-3-pro-image` (Nano Banana Pro)에서 `2K`, `1:1`에 한 번씩 실행되었습니다:

<Frame caption="Casual prompt: 'Make me a coffee product shot, make it look nice, make it feel premium'">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="일반 prompt에서 나온 커피 이미지: 나무 테이블, 그라인더, 삼베 자루 및 요청하지 않은 다른 소품들, 따뜻한 향수성 그레이딩, 그리고 컵에 인쇄된 만들어낸 브랜드명" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

<Frame caption="Structured prompt: subject, environment, light position, lens, grading, imperfections and composition all specified">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=cb00b095545e5dcad8cb2c113fefe47f" alt="구조화된 prompt에서 나온 커피 이미지: 연한 회색 마이크로시멘트 표면 위의 무광 블랙 세라믹 컵, 깔끔하게 흐릿한 배경, 분명한 광원 방향, 넉넉한 여백" width="1280" height="1280" data-path="images/image-workflow-prompt-after.jpg" />
</Frame>

왼쪽 이미지는 보기 흉하지는 않지만, 사용할 수는 없습니다. 모델은 아무도 승인하지 않은 결정을 잔뜩 내렸습니다. 그라인더와 삼베 자루를 추가하고, 향수 어린 따뜻한 그레이딩으로 정하고, 컵에는 만들어낸 브랜드명을 인쇄했습니다. 그런 자동 생성 텍스트는 상업적으로 그 프레임을 쓸모없게 만듭니다. 오른쪽 이미지는 바로 상품 페이지에 올릴 수 있습니다. 중립적인 배경, 말로 설명할 수 있는 조명 구성, 그리고 카피를 넣을 여유가 있기 때문입니다.

**"보기 좋다"와 "실제로 사용할 수 있다"는 서로 다른 목표입니다.** 일반적인 prompt로는 첫 번째만 도달할 수 있습니다.

### 재작성 계층이 제공해야 하는 여섯 가지 요소

재작성은 prompt를 더 길게 만드는 것을 의미하지 않습니다. 빠진 결정을 채워 넣는 것을 의미합니다. 이미지 prompt에는 여섯 가지 핵심 요소가 있습니다:

| 요소           | 없을 때 일어나는 일                    | 예시                                         |
| ------------ | ------------------------------ | ------------------------------------------ |
| **주제**       | 모델이 즉흥적으로 움직여 원하지 않은 소품을 추가합니다 | "무광 블랙 세라믹 푸어오버 컵, 블랙 커피를 80% 정도 채운 모습"    |
| **환경**       | 배경이 제멋대로라 이미지 세트가 서로 맞지 않습니다   | "연한 회색 마이크로시멘트 표면, 같은 톤의 벽, 흐릿한 배경"        |
| **조명**       | 즉시 인위적으로 보이는 평면적인 전역 조명        | "좌상단 45도에서 소프트박스로 들어오는 키 라이트; 오른쪽의 흰색 반사판" |
| **렌즈와 각도**   | 원근감과 심도를 통제할 수 없습니다            | "85mm 매크로, f/5.6, 정면에서 15도 아래로 기울인 시점"     |
| **그레이딩과 매체** | 기본값은 채도가 높고 렌더링한 듯한 결과물입니다     | "차가운 중립 화이트 밸런스, 낮은 전체 채도"                 |
| **구도**       | 주제는 항상 정중앙에 놓입니다               | "프레임 왼쪽 3분의 1에 컵, 오른쪽에는 큰 여백"              |

<Tip>
  해상도는 **일곱 번째 요소가 아닙니다.** 출력 해상도는 `size` / `imageSize` 같은 매개변수에서만 결정됩니다. prompt에 "4K"나 "8K"를 적어도 픽셀 하나도 늘어나지 않습니다. [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution)를 보십시오.
</Tip>

### 코드로 본 재작성 계층

여기서는 저렴하고 빠른 텍스트 모델만으로 충분합니다. 생성에 비하면 비용은 미미합니다:

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com/v1"
API_KEY = os.environ["APIYI_API_KEY"]          # never hard-code the key

REWRITE_SYSTEM = """You are an image prompt engineer. Rewrite the user's casual brief
into one structured image prompt.

Fill in all six elements. Supply whatever is missing; never ask the user:
1 Subject: material, colour, count, state
2 Environment: what the background is, what is sharp and what is blurred
3 Light: direction, hardness, fill or no fill — there must be one identifiable key light
4 Lens and angle: focal length, aperture, camera height, tilt
5 Grading and medium: white balance bias, saturation, film or digital character
6 Composition: where the subject sits in the frame, where the negative space is

Rules:
- Output only the prompt body: no explanation, no bullet points, no heading
- No brand names, logos, or legible text unless the user asked for them
- Never use vague quality words such as 8K, ultra HD, masterpiece, perfect
- Keep any element the user specified exactly as written"""


def rewrite(user_prompt: str) -> str:
    r = requests.post(
        f"{BASE}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gemini-3.5-flash",
            "messages": [
                {"role": "system", "content": REWRITE_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
        },
        timeout=60,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()
```

"8K, ultra HD, masterpiece, perfect"를 금지하는 규칙에 유의하십시오 — 4절에서 그 이유를 설명합니다.

## 3. 실제로 배포할 수 있는 파이프라인

남은 네 개 레이어를 재작성 레이어에 이어 붙이면 전체가 완성됩니다:

<Steps>
  <Step title="재작성: 자유 입력을 구조화된 prompt로">
    2절을 참조하십시오. 이 단계는 진행되는 동안 사용자 입력의 민감한 내용도 중화하므로, 후단에서 요청이 차단되는 빈도를 눈에 띄게 줄입니다.
  </Step>

  <Step title="앵커: 레퍼런스 이미지와 스타일 상수">
    스타일은 두 가지로 고정됩니다: **모든 prompt에 덧붙는 스타일 상수**(사용자 설정값)와 **고정된 레퍼런스 이미지 집합**입니다.

    레퍼런스 한도는 모델 계열별로 크게 다르므로, 파이프라인을 설계하기 전에 사용 중인 계열을 확인하십시오:

    | 모델 계열                   | 레퍼런스 한도      | 비고                                                                       |
    | ----------------------- | ------------ | ------------------------------------------------------------------------ |
    | Nano Banana (all)       | **14** (측정값) | [다중 이미지 융합 테스트](/ko/api-capabilities/multi-image-fusion-testing)를 참조하십시오 |
    | `gpt-image-2` family    | **16**       | `image[]`을 반복하십시오                                                        |
    | Seedream                | **10**       | 입력과 출력의 합은 15 이하로 유지해야 합니다                                               |
    | FLUX.2 pro / max / flex | **8**        | `input_image_2` … `input_image_8`; klein은 4개를 사용하고, Kontext는 1개를 사용합니다   |
    | Grok Imagine            | **1–4**      | 다섯 번째 이미지를 보내면 400을 반환합니다                                                |

    지켜야 할 두 가지 규칙이 있습니다: **prompt의 “이미지 1 / 이미지 2”는 배열 순서에 엄격히 대응합니다**. 따라서 어느 것이 어느 것인지 명시하십시오. 또한 **Grok은 `/v1/images/edits`에서만 레퍼런스 이미지를 인정합니다** — 이를 `/v1/images/generations`에 넘기면 조용히 버려지지만 여전히 과금됩니다.
  </Step>

  <Step title="샘플: N개를 병렬로 생성하고 n에 의존하지 마십시오">
    소비자용 제품이 「첫 시도에 바로 맞췄다」는 느낌은 사실 제품이 대신 여러 장의 카드를 뽑아 보는 것과 같습니다.

    하지만 **서버 측 `n` 매개변수는 대부분의 이미지 모델에 영향을 주지 않습니다**(Seedream은 아예 무시합니다). 여러 후보를 얻으려면 클라이언트에서 여러 요청을 동시에 보내십시오 — 이 사이트의 스킬 페이지는 한 번에 5개로 제한합니다. 채널별로 동시 실행 수를 조정하십시오. 일부는 2개부터 429를 반환하기 시작하므로 지수 백오프를 추가하십시오.
  </Step>

  <Step title="선택: 비전 모델을 판정자로 사용하십시오">
    N개의 후보를 확보한 뒤에는 자동으로 선택해야 합니다. 그렇지 않으면 선택을 사용자에게 떠넘긴 것에 불과합니다.

    후보들을 표준 `/v1/chat/completions` 이미지 입력으로 비전 모델에 다시 보내 채점하십시오. 지원 가능한 모델은 [비전 이해](/ko/api-capabilities/vision-understanding)를 참조하십시오. 평가 기준은 다섯 가지 차원으로 고정하고 JSON 반환을 요구하십시오: 지시 준수, 구조와 해부학, 텍스트 정확성, 텍스처 사실성, 구도.

    <Warning>
      이 용도로는 `/v1/rerank`를 사용하지 마십시오. `bge-reranker-v2-m3`은 **텍스트 전용** 재정렬 모델이며 이미지를 받지 않습니다. 이미지 채점에는 비전 이해 모델이 필요합니다.
    </Warning>
  </Step>

  <Step title="보정하고 마무리하십시오">
    구도가 확정된 뒤에는 로컬에서 조정하십시오 — 하나의 복합 지시문보다 성공률이 훨씬 높습니다:

    * **픽셀 단위 로컬 재페인트**: \*\*공식 릴레이 `gpt-image-2`\*\*만 마스크를 지원합니다. [마스크 인페인팅 가이드](/ko/api-capabilities/gpt-image-2/mask-editing)를 참조하십시오.
    * **멀티턴 누적 편집**: Nano Banana 모델의 **네이티브 Gemini 엔드포인트**에서 지원됩니다(이전 이미지를 `role: "model"`로 다시 입력합니다). 리버스 엔지니어링한 경로는 이를 지원하지 않습니다.
    * **즉시 재호스팅**: 반환되는 URL은 모두 임시입니다(FLUX는 약 10분이며 CORS가 없고, Seedream과 R2는 약 24시간입니다). 따라서 확보하는 즉시 자신의 오브젝트 스토리지로 다운로드하십시오.
  </Step>
</Steps>

### 최소 엔드 투 엔드 구현

```python theme={null}
import base64
import json
import os
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://api.apiyi.com"
API_KEY = os.environ["APIYI_API_KEY"]
HEAD = {"Authorization": f"Bearer {API_KEY}"}

STYLE_CONST = "Cool neutral white balance, low saturation, clean frame with generous negative space."


def draw(prompt: str, size: str = "2K", aspect: str = "1:1") -> bytes:
    """Generate one image (Nano Banana Pro, native Gemini endpoint)."""
    url = f"{BASE}/v1beta/models/gemini-3-pro-image:generateContent"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect, "imageSize": size},
        },
    }
    r = requests.post(url, headers=HEAD, json=body, timeout=600)   # headroom for 4K
    r.raise_for_status()
    parts = r.json()["candidates"][0]["content"]["parts"]
    part = next((p for p in parts if p.get("inlineData")), None)
    if part is None:                            # HTTP 200 with no image usually means moderation
        raise RuntimeError("no image returned: " + json.dumps(parts)[:300])
    return base64.b64decode(part["inlineData"]["data"])


def score(image: bytes, prompt: str) -> dict:
    """Score a candidate with a vision model; returns per-dimension scores and one issue line."""
    data_url = "data:image/png;base64," + base64.b64encode(image).decode()
    rubric = (
        "Score this image and return strict JSON: "
        '{"instruction":0-10,"anatomy":0-10,"text":0-10,"texture":0-10,'
        '"composition":0-10,"total":0-50,"issue":"one sentence"}. '
        "instruction = does it satisfy the brief below; anatomy = errors in hands, limbs, object structure; "
        "text = is any text in the image correct (score 10 if there is none); "
        "texture = does it read as a real photograph rather than a render; "
        "composition = is the framing usable. The brief:\n" + prompt
    )
    r = requests.post(
        f"{BASE}/v1/chat/completions",
        headers=HEAD,
        json={
            "model": "gemini-3.5-flash",
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": rubric},
                {"type": "image_url", "image_url": {"url": data_url}},
            ]}],
            "response_format": {"type": "json_object"},
        },
        timeout=120,
    )
    r.raise_for_status()
    return json.loads(r.json()["choices"][0]["message"]["content"])


def best_of(user_input: str, n: int = 4) -> bytes:
    prompt = rewrite(user_input) + "\n" + STYLE_CONST         # steps 1 and 2
    with ThreadPoolExecutor(max_workers=n) as pool:           # step 3: client-side fan-out
        results = list(pool.map(lambda _: _safe(draw, prompt), range(n)))

    cands = [img for ok, img in results if ok]
    if not cands:
        raise RuntimeError("all candidates failed; check moderation or fall back to another model")

    with ThreadPoolExecutor(max_workers=len(cands)) as pool:  # step 4: score in parallel
        scores = list(pool.map(lambda im: score(im, prompt), cands))

    ranked = sorted(zip(cands, scores), key=lambda x: x[1]["total"], reverse=True)
    return ranked[0][0]                                       # step 5 retouch/rehost hooks in here


def _safe(fn, *args):
    try:
        return True, fn(*args)
    except Exception as e:                # one failure must not sink the batch
        return False, str(e)
```

## 4. AI 느낌 제거하기

“AI 느낌”은 미스터리가 아닙니다. 그것은 **하나씩 제거할 수 있는 구체적인 특성들의 집합입니다**.

### 나란히 비교 테스트

동일한 모델(`gemini-3-pro-image`), 동일한 피사체, 두 가지 prompt 스타일, 각각 두 장의 이미지, 각 배치에서 첫 번째 이미지를 보여줍니다:

<Frame caption="Bare prompt: 'A photorealistic half-body portrait of a young woman by a cafe window, smiling at the camera, 8K, ultra HD, ultra detailed, flawless skin, beautiful, perfect lighting, masterpiece'">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=0623ee0bf7aa07fab43cd347d9aa4a7d" alt="기본 prompt에서의 인물 사진: 피사체가 정중앙에 있고 카메라를 바라보며, 빛의 방향이 드러나지 않는 균일한 조명, 깔끔한 배경, 전형적인 스톡 사진 같은 느낌" width="1280" height="956" data-path="images/image-workflow-texture-before.jpg" />
</Frame>

<Frame caption="The same subject after adding four blocks of control language: light position, lens, medium, imperfections">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=83efd55ea2ba552a67c04aa2e0f99936" alt="제어된 prompt에서의 인물 사진: 단일한 방향성의 창문광, 얼굴의 절반은 그림자 속에 있고, 모공과 솜털이 보이며, 볼에 작은 점이 있고, 머리카락이 몇 가닥 흩어져 있으며, 필름 그레이딩이 적용되고, 피사체가 중앙보다 오른쪽에 배치됨" width="1280" height="956" data-path="images/image-workflow-texture-after.jpg" />
</Frame>

왼쪽 이미지는 나쁘지 않습니다 — 기본 모델이 충분히 강해서 아무 장식 없는 prompt만으로도 보기 좋은 이미지를 만들어냅니다. 하지만 그 안에는 특징 세트가 고스란히 들어 있습니다. **피사체가 정중앙에 고정되어 있고, 빛은 어디서 오는지 알 수 없을 정도로 고르며, 모든 요소가 무난합니다**. 그리고 이것은 우연도 아닙니다. 그 배치의 두 이미지 모두 본질적으로 같은 구도와 조명 패턴을 공유했습니다.

오른쪽 이미지는 접근 방식을 바꿨습니다. 빛에는 방향이 생겼고, 얼굴의 절반은 그림자에 잠기도록 두었으며, 피부에는 유분과 모공이 드러나고, 볼에는 점이 있으며, 삐져나온 머리카락은 빗질되지 않았고, 피사체는 중앙보다 오른쪽에 있습니다. 이것은 “카페에서 미소 짓는 여성의 스톡 이미지”가 아니라 **특정한 순간에 촬영된 특정 인물**로 읽힙니다.

<Info>
  파이프라인의 진짜 가치는 바로 여기서도 드러납니다. 그것은 못난 출력을 예쁜 출력으로 바꾸는 것이 아니라, **“운 좋게 잘 나온 것”을 “여러분이 지정했고, 설명할 수 있고, 재현할 수 있는 좋은 결과”로 바꿉니다.** 이해관계자는 오른쪽 이미지를 더 선호하지 않을 수도 있지만, 왼쪽 이미지로는 왜 그런 모습인지 설명할 수 없고, 다음 이미지에 그것을 맞추라고 요청할 수도 없습니다.
</Info>

### AI스러운 모습의 증상, 수정안, 그리고 쓰지 말아야 할 것

| AI스러운 모습의 증상           | 수정안(prompt에 이 문구를 작성하십시오)                                             | 쓰지 말아야 할 것                   |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------- |
| 피사체가 항상 중앙에 있고 대칭적인 구도 | 배치를 구체적으로 지정하십시오: "피사체를 중앙의 오른쪽에 배치하고 왼쪽에 네거티브 스페이스를 두기"              | "완벽한 구도", "황금비"              |
| 모공이 없는 플라스틱 같은 피부      | "자연스러운 피부 질감, 보이는 모공과 잔털, 코에 약간의 광택, 보정 없음"                           | "흠잡을 데 없는 피부", "정교한", "아름다운" |
| 식별 가능한 광원이 없는 균일한 조명   | 키 라이트 하나와 그 강도를 지정하십시오: "왼쪽 창광만이 유일한 광원이며 얼굴 오른쪽 절반은 그림자에 있게 하기"      | "완벽한 조명", "부드러운 조명"          |
| 가짜 심도, 배경이 붙여넣은 듯 보임   | 초점거리와 조리개를 제시하십시오: "85mm, f/2.8, 가까운 눈에 초점"                           | "흐릿한 배경", "시네마틱"             |
| 과채도에 빛나는 색감            | 매체와 화이트 밸런스를 제시하십시오: "Kodak Portra 400 특성, 따뜻한 하이라이트와 차가운 그림자, 낮은 채도" | "선명한 색감", "HDR"              |
| 모든 것이 새것처럼 보이고 닳지 않음   | 일부러 사용감을 추가하십시오: "보풀이 생긴 스웨터, 테이블 위의 물자국과 빵 부스러기"                     | "깨끗하고 정돈된", "프리미엄 질감"        |
| 포스터나 렌더처럼 읽힘           | 촬영 상황을 구체적으로 지정하십시오: "자연스러운 순간", "옆 테이블에서 눈높이로"                       | "8K", "울트라 HD", "걸작"         |

<Warning>
  **`8K`, `ultra HD`, `ultra detailed`, `masterpiece` 및 `perfect`와 같은 모호한 품질 표현은 순효과가 마이너스입니다.** 이것들은 아무 해상도도 더하지 못하며(해상도를 더하는 것은 오직 파라미터뿐입니다), 모델을 과도하게 선명하고 과채도인 렌더 쪽으로 밀어붙입니다. 바로 이것이 AI스러운 모습의 핵심입니다. 위의 왼쪽 prompt는 그런 표현들로 가득 차 있었고, 그 결과가 그것을 보여줍니다. 품질을 원하시면, 대신 구체적인 조명, 렌즈, 매체를 작성하십시오.
</Warning>

### 복사-붙여넣기용 제어 언어 네 블록

필요에 따라 프롬프트에 섞어 넣으십시오. 각 블록에서 한두 줄이면 보통 충분합니다:

<CardGroup cols={2}>
  <Card title="조명" icon="sun">
    왼쪽에서 들어오는 창광만이 프레임 안의 유일한 광원입니다 / 오후 3시의 강한 후면광 / 역광, 머리카락에 림라이트 / 프레임 안의 실제 광원으로 놓인 책상 램프 / 뚜렷한 그림자 없는 흐린 날의 확산광
  </Card>

  <Card title="렌즈" icon="aperture">
    35mm f/2.0, 자연스러운, 눈높이 / 85mm f/2.8, 가까운 눈에 초점 / 낮은 카메라 위치의 24mm, 약간의 가장자리 왜곡 / 공간을 압축하는 망원 렌즈, 평평해진 배경 레이어 / 모서리에 약한 비네팅
  </Card>

  <Card title="매체" icon="film">
    Kodak Portra 400의 특성, 고운 입자감 / 따뜻한 하이라이트, 차가운 그림자 / Polaroid 즉석 필름, 낮은 대비, 부드러운 가장자리 / 초기 CCD 디지털 카메라의 노이즈와 색조 편차 / 전반적으로 낮은 채도, 선명화 없음
  </Card>

  <Card title="불완전성" icon="scan-line">
    자연스러운 피부 질감, 보이는 모공과 잔털 / 몇 가닥 풀린 머리카락, 빗질되지 않음 / 보풀이 인 스웨터, 닳은 소맷단 / 테이블 위의 물자국, 지문과 부스러기 / 중심에서 벗어난 구도, 피사체 일부가 가장자리에서 잘림
  </Card>
</CardGroup>

### 세 가지 완전한 예시

<AccordionGroup>
  <Accordion title="인물 사진: 신원증명사진이 아닌 자연스러운 모습">
    자연스러운 반신 인물 사진: 카페 창가에 선 20대 중반의 여성이 옆으로 몸을 돌린 채 바깥을 바라보고 있으며, 입가의 미소를 간신히 참는 듯합니다. 왼쪽에서 들어오는 창문빛만이 프레임의 유일한 광원이며, 얼굴 오른쪽 절반은 그림자에 잠기고 코 다리 아래에는 작고 선명한 그림자가 있습니다. 85mm 렌즈, f/2.8, 눈높이, 가까운 쪽 눈에 초점. Kodak Portra 400의 특성과 같은 미세하고 눈에 보이는 그레인, 따뜻한 하이라이트와 차가운 그림자, 전반적으로 낮은 채도. 자연스러운 피부: 보이는 모공과 솜털, 코 옆면의 약간의 윤기, 왼쪽 볼의 작은 점, 몇 가닥 삐져나온 눈썹 털, 이마에 정리되지 않은 느슨한 머리카락. 피부 보정 없음, 미용 리터칭 없음, 샤프닝 없음. 피사체는 중앙 오른쪽에 배치하고, 왼쪽에는 여백을 둡니다.
  </Accordion>

  <Accordion title="제품 사진: 제품 페이지에 바로 사용할 수 있음">
    이커머스 히어로 샷: 매트한 검은색 세라믹 푸어오버 컵에 블랙 커피가 80% 채워져 있고, 표면에는 얇은 크레마 고리가 떠 있습니다. 컵은 연한 회색 마이크로시멘트 표면 위에 놓여 있으며, 같은 톤의 벽이 뒤에서 흐릿하게 보입니다. 왼쪽 위 45도 방향의 소프트박스에서 들어오는 키라이트, 오른쪽의 흰색 바운스 카드가 컵 오른쪽 가장자리를 따라 좁은 하이라이트를 남기고, 부드러운 캐스트 섀도우가 뒤쪽 오른편으로 떨어집니다. 85mm 매크로 렌즈, f/5.6, 앞면을 15도 아래로 기울인 시점, 컵 전체가 선명합니다. 차갑고 중립적인 화이트 밸런스, 전반적으로 낮은 채도. 유약에는 약간의 수공예적 불균일함과 아주 작은 가마 자국이 있으며, 가장자리에는 매우 희미한 사용 흔적이 보입니다. 넉넉한 여백, 컵은 프레임의 왼쪽 1/3에 배치합니다. 이미지 어디에도 브랜드명이나 텍스트는 없습니다.
  </Accordion>

  <Accordion title="환경: 특정 시간과 날씨를 부여합니다">
    비가 막 그친 오후 6시의 좁은 구시가지 거리로, 양쪽 가게의 라이트박스가 물웅덩이에 비치고 있습니다. 유일한 키라이트는 거리 끝의 따뜻한 가로등이며, 가게 창문빛이 필라이트 역할을 하고, 하늘에는 아직 차가운 황혼의 기운이 남아 있어 따뜻함과 차가움의 대비를 만듭니다. 28mm 렌즈, f/4, 카메라는 눈높이, 약간 위로 기울임. 전반적으로 낮은 채도, 그림자에는 노이즈를 유지하고, 그림자 들어올리기는 하지 않습니다. 벽에는 물때 자국, 찢어진 낡은 포스터, 에어컨 실외기가 있고, 전선이 프레임 상단을 가로지릅니다. 아무도 카메라를 정면으로 바라보지 않으며, 지나가는 사람들은 뒤에서 보이고 약간 모션 블러가 있습니다.
  </Accordion>
</AccordionGroup>

## 5. 파이프라인 설계를 재구성할 주요 사실

이러한 사실을 미리 파악하면 재작업을 줄일 수 있습니다.

| 사실                                                                                                                                                    | 파이프라인에 미치는 영향                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **이 제품군에서는 시드를 사실상 사용할 수 없습니다**: Nano Banana 또는 GPT-Image 모델 중 시드를 노출하는 모델이 없고, Seedream 4.x / 5.x의 시드는 효과가 없는 것으로 측정되었으며, Grok 이미지 생성은 시드를 지원하지 않습니다 | 시드를 기반으로 재현성을 구축하지 마십시오. **신뢰할 수 있는 유일한 재현 방법은 성공한 요청 전체를 보관하는 것입니다** — prompt, 참조 이미지, 모든 매개변수를 포함한 뒤 해당 요청을 그대로 재실행해야 합니다                            |
| **서버 측 `n` 매개변수는 대부분의 이미지 모델에 영향을 주지 않습니다**                                                                                                           | 여러 후보는 클라이언트 측 동시 실행으로 생성해야 합니다. 채널별 동시 실행 수를 부하 테스트하고 지수 백오프를 추가하십시오                                                                                  |
| **모든 이미지 API는 동기식이며 task ID가 없고 연결이 끊겨도 과금됩니다**                                                                                                       | 파이프라인에 자체 작업 큐가 필요합니다. [자체 비동기 큐 구축](/ko/api-capabilities/image-async-queue) 및 [이미지 API 필수 사항](/ko/api-capabilities/image-api-best-practices)을 참조하십시오  |
| **업스케일링, 배경 제거 또는 얼굴 복원 엔드포인트가 없습니다**                                                                                                                 | 생성 시점에 출력 크기를 확정하십시오. 투명한 배경이 필요한 경우 `background: "transparent"`을 `gpt-image-2`에 전달하십시오(누끼 엔드포인트가 아니라 투명 배경에 직접 생성하는 방식입니다)                            |
| **이미지가 없는 HTTP 200 응답은 일반적으로 콘텐츠 조정 차단을 의미합니다**                                                                                                       | 선택 로직은 “이미지가 반환되지 않음”과 “이미지가 반환되었지만 품질이 나쁨”을 구분해야 합니다. 전자의 경우 [Gemini 이미지 오류 처리](/ko/api-capabilities/gemini-image-error-handling)를 참조하십시오             |
| **반환되는 모든 이미지 URL은 임시 링크입니다**                                                                                                                         | 수신하는 즉시 다른 호스트로 이전하십시오. 업스트림 URL을 데이터베이스에 저장하지 마십시오                                                                                                    |
| **GPT-Image prompt의 최대 길이는 32,000자입니다**(제공업체 제한이며 문자 수로 계산됩니다)                                                                                        | 브랜드 가이드북이나 패키징 사양을 이미지 모델에 그대로 입력하지 마십시오. 먼저 텍스트 모델로 이를 1K\~3K자의 구조화된 prompt로 요약한 뒤 사용하십시오. [긴 prompt](/ko/api-capabilities/image-long-prompt)를 참조하십시오 |

## 6. 파이프라인이 가치가 있는 경우의 비용 계산

파이프라인은 성공률을 위해 비용을 치르는 방식입니다. 비용은 이미지 생성 비용에서 출력이 대부분을 차지합니다(`gpt-image-2`는 출력에 토큰 100만 개당 \$30를 청구합니다). 반면 재작성과 채점에 사용되는 텍스트 및 비전 모델 비용은 거의 무시해도 될 수준입니다. 따라서 비용은 본질적으로 “몇 개의 후보를 생성했는가”에 달려 있습니다.

모든 항목에 하나의 설정을 쓰기보다, 세 가지 등급을 사용하세요.

| 등급       | 구성                          | 상대 비용 | 용도                                  |
| -------- | --------------------------- | ----- | ----------------------------------- |
| **초안**   | Lite 모델에서 단일 샷              | 1×    | 내부 미리보기, 대량 플레이스홀더, 일반 사용자 실험       |
| **표준**   | 재작성 + 후보 2개 + 점수 기반 선택      | 약 2×  | 소비자용 제품의 기본 경로                      |
| **프리미엄** | 재작성 + 후보 4개 + 채점 + 로컬 보정 1회 | 약 5×  | 제품 대표 이미지, 광고 크리에이티브, 외부에 전달되는 모든 것 |

테스트는 간단합니다. **이 이미지를 팀 밖의 누군가가 보게 됩니까?** 그렇다면 표준 이상은 충분히 값을 합니다. 내부 검토용이라면 초안이면 충분합니다. 그 사이에 게이트를 하나 더 넣을 수도 있습니다. 즉, 최고 점수가 임계값 아래로 떨어질 때만 더 많은 후보를 생성하면 대부분의 요청이 2개에서 수렴하게 만들 수 있습니다.

## 간단 요약

* 격차는 모델 가중치에 있는 것이 아니라 **모델 주변의 8개 레이어**에 있습니다: rewrite, presets, anchoring, sampling, selection, 단계별 편집, 후처리, rehosting.
* **rewrite 레이어의 반환 효과가 가장 큽니다**: 주제, 환경, 조명, 렌즈, 그레이딩, 구도를 채워 넣으면 “보기 좋다”가 “실제로 사용할 수 있다”가 됩니다.
* **여러 후보 생성과 vision-model 점수화**가 소비자 제품의 높은 체감 성공률이 실제로 나오는 지점입니다. `n`는 작동하지 않으므로 클라이언트 측에서 fan out해야 하며, `/v1/rerank`은 이미지를 점수화할 수 없습니다.
* **AI 같은 느낌을 없애려면 형용사가 아니라 구체성을 추가해야 합니다**: 광원 하나를 지정하고, 초점거리와 조리개를 제시하고, 매체와 그레인을 명시하고, 의도적으로 결함을 추가하고, 피사체를 중앙에서 벗어나게 배치하십시오.
* **`8K` / `masterpiece` / `perfect lighting`는 순손실입니다** — 추가 해상도는 없고, 프레임을 렌더링한 듯한 느낌으로 밀어갑니다.
* 재현을 위해 seed에 의존하지 마십시오. 대신 전체 요청을 보관하십시오. 이미지 API는 동기식이며 연결이 끊겨도 과금되므로, 파이프라인에는 큐가 필요합니다.
* APIYI에는 업스케일링, 배경 제거, 아이덴티티 학습 엔드포인트가 없습니다. 처음부터 그 레이어들을 고려해 설계하십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="원하는 이미지를 얻는 방법" icon="target" href="/ko/api-capabilities/image-generation-success-tips">
    실패한 단일 호출 복구: prompt를 다시 작성하고, 재시도하고, 모델을 전환하고, 테스트 도구로 격리합니다
  </Card>

  <Card title="이미지 API 필수 사항" icon="book-check" href="/ko/api-capabilities/image-api-best-practices">
    동기 호출, 타임아웃 단계, 과금, base64 처리, 입력 이미지 전처리
  </Card>

  <Card title="마스크 인페인팅 가이드" icon="scissors" href="/ko/api-capabilities/gpt-image-2/mask-editing">
    픽셀 수준의 국소 편집, 공식 릴레이의 gpt-image-2 전용
  </Card>

  <Card title="다중 이미지 융합 테스트" icon="images" href="/ko/api-capabilities/multi-image-fusion-testing">
    참조 제한을 어떻게 측정했는지, 그리고 14장 이미지 융합 결과
  </Card>

  <Card title="비전 이해" icon="eye" href="/ko/api-capabilities/vision-understanding">
    후보 이미지를 평가하는 데 사용할 수 있는 비전 모델과 호출 방법
  </Card>

  <Card title="자체 비동기 큐 구축" icon="list-checks" href="/ko/api-capabilities/image-async-queue">
    다중 후보 파이프라인을 지원하도록 동기 생성을 작업 큐로 래핑하기
  </Card>
</CardGroup>
