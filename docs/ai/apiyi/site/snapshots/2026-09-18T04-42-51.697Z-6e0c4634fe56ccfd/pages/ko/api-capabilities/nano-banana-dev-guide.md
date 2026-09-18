> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 시리즈 개발자 가이드

> Nano Banana 시리즈(Pro / 2 / 2 Lite / Gen 1)를 위한 모델 선택, 과금, 엔드포인트, 개발 형식 및 FAQ에 대한 올인원 가이드로, 개발자가 Gemini 이미지 생성 API를 시작하는 데 도움을 줍니다.

## 모델 카드

| 모델                     | 공식 모델 ID                         | 과금                                                                      | 비고                    |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------- | --------------------- |
| **Nano Banana Pro**    | `gemini-3-pro-image-preview`     | 요청당 고정 **\$0.09/req** (약 ¥0.63; 충전 프로모션 적용 후 약 ¥0.55)                   | 최고 품질                 |
| **Nano Banana 2**      | `gemini-3.1-flash-image-preview` | 요청당 **\$0.055/req** (4K 출력에 권장됩니다); 또는 동적 token 기반 과금, 2K는 약 **\$0.04** | 최고의 가성비               |
| **Nano Banana 2 Lite** | `gemini-3.1-flash-lite-image`    | 요청당 고정 **\$0.025/req**; 또는 token 기반 과금 약 **\$0.018/req** (공식 가격의 40%)   | 가장 빠르고 가장 저렴함, 1K만 지원 |
| **Nano Banana** (1세대)  | `gemini-2.5-flash-image`         | 요청당 고정 **\$0.02/req**                                                   | 가장 저렴함                |

<Info>
  전체 가격 비교, 요청당 과금과 token 기반 과금 비교, token 선택 조언은 [Nano Banana 시리즈 가격](/ko/api-capabilities/nano-banana-pricing)을 참고하십시오.
</Info>

### 크기 제어

* **원본 이미지 비율을 따름**: `aspectRatio`을 그냥 생략하시면 됩니다. 다중 이미지 편집 시나리오에서는 **마지막 이미지의 크기**가 우선합니다
* **해상도 `imageSize`**: `1K` / `2K` / `4K`를 지원합니다
  * Nano Banana (Gen 1) **1K만 지원합니다**
  * Nano Banana 2 **512px를 추가로 지원합니다**
  * Nano Banana 2 Lite **1K만 지원합니다** (2K/4K/512px 미지원)

<Warning>
  같은 코드로 1세대 `gemini-2.5-flash-image`를 호출할 때는 **`imageSize` 파라미터를 반드시 제거해야 합니다** (`2K` / `4K`를 지원하지 않기 때문입니다), 그렇지 않으면 호출이 실패합니다.
</Warning>

## 통합 방법

### 공식 문서

* Google 공식 문서: `ai.google.dev/gemini-api/docs/image-generation`
* APIYI와 통합하려면 **요청 URL + KEY를 APIYI의 것으로** 바꾸기만 하면 됩니다. 다른 모든 매개변수는 공식 문서의 것과 동일합니다.

### 공식 상태 확인(업스트림 문제 진단)

Nano Banana 시리즈는 Google의 AIStudio / Gemini API 위에서 실행됩니다. 드문 경우지만 **흐릿하거나 실패하는 2K / 4K 출력**은 통합 계층이 아니라 **Google 측** 문제일 수 있습니다. Google의 공식 상태 페이지를 확인할 수 있습니다(직접 복사해서 방문하십시오): `aistudio.google.com/status`.

예를 들어, 2026년 6월 19일 해당 페이지에는 「Nano Banana 관련 문제」가 보고되었으며, Gemini API와 AI Studio의 Nano Banana 2 / Pro에서 2K 또는 4K 해상도 문제가 있었습니다. 비슷한 증상이 보이면 먼저 공식 상태 페이지와 비교하여 업스트림 장애인지 빠르게 확인하십시오.

<Info>
  APIYI는 중복성을 위해 **이중 AIStudio + Vertex 채널**에서 Nano Banana 시리즈를 운영합니다. 하나의 공식 채널에 문제가 생기면 다른 채널이 서비스를 계속 사용할 수 있도록 대신 처리합니다.
</Info>

### 엔드포인트 지원

* **권장 엔드포인트**(Gemini 네이티브): `https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
* **OpenAI 호환 모드**를 통한 호출을 지원합니다(참고: **URL 업로드는 지원되지 않으며**, 대신 Base64를 사용하십시오)
* **지원하지 않음** `/v1/image/generations`

### 개발 형식(기본 권장 사항)

* **\[권장] Google 네이티브 엔드포인트 형식을 사용합니다**
* 이미지: **Base64로 업로드하고, 다운로드 후 다시 호스팅합니다**
* 호출 방식: **동기식 멀티스레드 호출**을 사용합니다. 비동기 호출은 아직 지원되지 않습니다

## 입력 이미지 요구 사항

* **단일 이미지는 7MB를 초과할 수 없습니다**(Google의 규정입니다); Google Cloud Storage를 통해 가져오는 경우 파일당 제한은 30MB입니다
* **prompt당 최대 14개 이미지**
* **지원되는 MIME 유형**: `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif` (`jpg` 형식은 이미 APIYI에서 지원됩니다)
* **Base64 크기 증가**: 이미지를 Base64로 변환하면 크기가 약 **33.3%** 증가합니다(7MB 이미지는 약 9.3MB가 됩니다)
* **APIYI 제한**: 단일 요청에서 업로드되는 이미지의 총 용량은 **100MB 미만**이어야 합니다 — 모든 호출은 동기식이며, 너무 큰 페이로드는 메모리 급증을 일으킬 수 있습니다

<Frame caption="Google official technical specs: inline / console upload per-file limit is 7MB, supporting png/jpeg/webp/heic/heif">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-image-size-limit.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=fc422e34e493a907363115118f715690" alt="Google Gemini 3 Pro Image 공식 기술 사양 표: 단일 이미지 제한 7MB, prompt당 최대 14개 이미지, 지원되는 종횡비 및 MIME 유형" width="1400" height="701" data-path="images/nano-banana-image-size-limit.png" />
</Frame>

<Frame caption="Base64 encoding increases size by about 33.3%: a 7MB image is roughly equal to 9.3MB">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-base64-size.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=dffe216ee6e97c2661ce816eb5408a22" alt="Base64 크기 계산: 7MB 원본 이미지는 4/3 비율로 인코딩하면 약 9.33MB입니다" width="1448" height="984" data-path="images/nano-banana-base64-size.png" />
</Frame>

**권장 사항**: API로 전송하기 전에 이미지에 **무손실 압축**을 적용하여, 너무 큰 해상도로 인해 요청이 느려지는 것을 방지하십시오.

Google 공식 사양 참고 자료(직접 복사하여 방문하십시오): `docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image`

## URL 이미지 입력

Base64 외에도 **Gemini 네이티브 엔드포인트**는 `fileData.fileUri`을 통해 이미지 URL(이미지 호스팅 / OSS 주소)을 직접 전달하는 것도 지원하므로, 로컬 인코딩이 필요하지 않습니다.

<Warning>
  **URL 업로드는 이미지 호스팅 및 OSS 주소에 대해 엄격한 요구사항이 있습니다**: 주소가 글로벌 CDN에 있지 않으면(예: Tencent Cloud Object Storage는 기본값이 중국 전용 CDN입니다), Google의 서버가 이미지를 접근하지 못할 가능성이 매우 높아 요청이 실패합니다(대표적인 증상: 출력에서 **이미지가 참조되지 않음**).

  **가능하다면 더 높은 안정성을 위해 Base64 업로드를 우선 사용하십시오** — 플랫폼 관점에서 이것이 가장 많은 운영 투자가 이루어졌고 가장 신뢰할 수 있는 경로입니다.
</Warning>

<Info>
  URL 업로드는 **Gemini 네이티브 엔드포인트**에서만 동작합니다. **OpenAI 호환 모드는 URL 업로드를 지원하지 않으며** Base64가 필요합니다.
</Info>

### Curl 예시 (fileUri)

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### Python 예제 (fileUri)

```python theme={null}
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini 3 Pro Image - Image editing (minimal file_uri version)
Purpose: only for a quick check that the endpoint works
"""

import requests
import base64
import json
from pathlib import Path
from datetime import datetime

# ============================================================================
# Configuration
# ============================================================================

API_KEY = "sk-"
API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

# Image URL
IMAGE_URL = "https://raw.githubusercontent.com/apiyi-api/ai-pics/refs/heads/main/1762260696217_dd0352c1f9604540.png"
IMAGE_MIME_TYPE = "image/png"

# Edit instructions
EDIT_PROMPT = "Change the person's clothes to a blue jacket and hair to a purple gradient; keep pose, gaze direction, and other structural features unchanged."
SYSTEM_PROMPT = "You are a professional expert in image description and generation. Your task is to produce high-quality image prompts with rich detail and a clear artistic style, or to make accurate, creative edits to existing images, based on the user's request."

# Output parameters
ASPECT_RATIO = "9:16"
RESOLUTION = "4K"
MAX_OUTPUT_TOKENS = 8000
OUTPUT_FILE = f"minimal_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

# ============================================================================
# Core
# ============================================================================

def main():
    print("=" * 60)
    print("Testing file_uri endpoint")
    print("=" * 60)
    print(f"Image URL: {IMAGE_URL[:80]}...")
    print(f"Edit prompt: {EDIT_PROMPT}")
    print(f"Output params: {RESOLUTION}, {ASPECT_RATIO}")
    print("-" * 60)

    # Build the request body
    # Note: fileData, mimeType, fileUri must be in camelCase
    payload = {
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "imageConfig": {
                "imageSize": RESOLUTION,
                "aspectRatio": ASPECT_RATIO
            },
            "maxOutputTokens": MAX_OUTPUT_TOKENS
        },
        "contents": [
            {
                "role": "model",
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            {
                "role": "user",
                "parts": [
                    {
                        "fileData": {           # camelCase: fileData (not file_data)
                            "mimeType": IMAGE_MIME_TYPE,  # camelCase: mimeType
                            "fileUri": IMAGE_URL          # camelCase: fileUri
                        }
                    },
                    {"text": EDIT_PROMPT}
                ]
            }
        ]
    }

    # Send the request
    print("\nSending request...")
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=300
        )

        print(f"Response status: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return

        # Parse the response
        data = response.json()
        print("✅ Response received")

        # Save full response for debugging
        with open(OUTPUT_FILE + ".response.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"📄 Response saved: {OUTPUT_FILE}.response.json")

        # Extract and print text
        parts = data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "text" in part:
                print(f"\n💬 Text response: {part['text']}")

        # Save image
        for part in parts:
            if "inlineData" in part or "inline_data" in part:
                image_data = part.get("inlineData", part.get("inline_data", {})).get("data")
                if image_data:
                    image_bytes = base64.b64decode(image_data)
                    with open(OUTPUT_FILE, "wb") as f:
                        f.write(image_bytes)
                    print(f"\n✅ Image saved: {OUTPUT_FILE}")
                    print(f"📦 File size: {len(image_bytes) / 1024:.1f} KB")
                    print(f"🔗 File path: {Path(OUTPUT_FILE).resolve()}")
                    return

        print("⚠️  No image data found in the response")

    except requests.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
    print("\n" + "=" * 60)
    print("Test finished")
    print("=" * 60)
```

<Tip>
  `fileData`, `mimeType`, and `fileUri`는 **camelCase** 형식이어야 합니다(`file_data` / `file_uri` 아님). 그렇지 않으면 매개변수는 무시되며 이미지가 참조되지 않습니다.
</Tip>

## 청구 기본 사항 (중요)

* **동기 호출 지속 시간**: Pro / 2 at 4K는 대략 **30–150초**의 적절한 생성 시간이 걸립니다
* **타임아웃 시 연결이 끊겨도 요금이 부과됩니다**: 예를 들어 생성에 120초가 걸리지만 클라이언트가 타임아웃을 100초로 설정해 연결을 끊더라도, 요금은 계속 부과됩니다
* **429 / 503은 과금되지 않습니다**: 실패한 요청은 청구되지 않습니다(저희는 고객이 오래 기다리거나 이미지 없이 멈춰 있게 두지 않으려 합니다)
* **콘텐츠 안전 거부도 요금이 부과됩니다**: 고객의 입력에 콘텐츠 안전 문제가 있어 Google이 이미지 생성을 거부하는 경우에도, **상태 코드 200은 과금됩니다** — 아래의 오류 처리와 보장 플랜을 참조하십시오

## Google 검색 그라운딩은 호출당 가격에 추가로 청구됩니다

Pro는 `googleSearch` 도구를 지원합니다(3/3번의 테스트 실행에서 grounding이 트리거되어 전체 `groundingMetadata`을 반환함). 날씨 카드, 주가 차트, 그리고 실시간 정보가 필요한 그 밖의 모든 용도에 유용합니다.

**하지만 검색 호출 요금은 \$0.09 호출당 가격에 포함되지 않고 별도로 추가됩니다**:

| 시나리오                | 호출당 요금                         |
| ------------------- | ------------------------------ |
| 일반 생성(도구 없음)        | \$0.09                         |
| 검색 사용, 모델이 쿼리 1개 실행 | \$0.09 + \$0.014 = **\$0.104** |
| 검색 사용, 모델이 쿼리 2개 실행 | \$0.09 + \$0.028 = **\$0.118** |

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "A weather card poster for Tokyo today" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

<Warning>
  **모델이 실행할 검색 횟수를 결정하며, 미리 설정할 수는 없습니다.** 테스트에서는 단일 이미지 요청이 자체적으로 1–3개의 쿼리를 실행했으므로, 이 도구를 활성화하면 호출당 비용이 고정된 \$0.09가 아니라 범위(\$0.104–\$0.132)가 됩니다. 상한을 기준으로 예산을 잡으십시오.
</Warning>

<Note>
  **이미지 검색 그라운딩 (`searchTypes.imageSearch`)은 Pro에서 작동하지 않습니다** — 0/2회 실행에서 트리거되지 않았고, `imageSearchQueries`은 `groundingMetadata`에 한 번도 나타나지 않았습니다. 이는 Nano Banana 2 (`gemini-3.1-flash-image`) 전용입니다. [Nano Banana 2 · 과금에 영향을 주는 세 가지 매개변수](/ko/api-capabilities/nano-banana-2-image/overview#three-parameters-that-affect-billing)를 참조하십시오.
</Note>

## thinkingLevel은 Pro에서 효과가 없습니다 — NB2에서 그대로 복사하지 마십시오

`generationConfig.thinkingConfig.thinkingLevel`는 **Nano Banana 2 시리즈 전용**입니다. `high`을 Pro에 전달하면:

* **오류가 발생하지 않습니다** — 요청은 정상적으로 200을 반환합니다
* **하지만 효과가 없습니다**: 측정된 `thoughtsTokenCount`는 108–156 범위였으며, 파라미터 없이 관측된 130–159 범위와 완전히 겹쳤습니다
* Google의 문서에서도 설명하듯 Pro의 추론은 항상 활성화되어 있으며 조정할 수 없습니다

게다가 **Pro는 호출당 정액 요금이 적용되므로 추론은 청구서에 반영되지 않습니다** — Pro에서 이 파라미터를 조정해도 효과도 없고 비용상의 근거도 없습니다. 추론 오버헤드를 제어하려면 대신 Nano Banana 2의 종량제 과금을 사용하십시오.

## 타임아웃 설정 (중요)

4K 이미지 생성은 **이미지 업로드, API 처리, Base64 이미지 다운로드**와 같은 단계를 포함하므로 전체 소요 시간이 더 깁니다(백엔드는 **API 처리 시간** 기준으로 과금합니다). 일반적인 경우 4K는 약 **50초**(폴링 제외)가 걸리지만, 클라이언트가 타임아웃을 너무 짧게 설정하면 생성이 완료되기 전에 **조기에 연결이 끊기고** 오류를 보고합니다:

```text theme={null}
API Connection Error: HTTPSConnectionPool(host='api.apiyi.com', port=443): Read timed out. (read timeout=120)
```

<Frame caption="Call logs: time-to-first-byte for 4K generation is about 43–61s, so the default 120s timeout is too tight">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-timeout-error.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=79eb88c65cd4ff91caa57e1402658b81" alt="호출 로그: gemini-3-pro 4K 생성의 첫 바이트까지 걸리는 시간은 43초에서 61초입니다" width="1400" height="837" data-path="images/nano-banana-timeout-error.png" />
</Frame>

더 안전하게 하려면 해상도별로 타임아웃을 설정하는 것을 권장합니다:

```python theme={null}
timeout = {
    "1K": 300,  # 5 minutes - quick preview
    "2K": 300,  # 5 minutes - recommended
    "4K": 600,  # 10 minutes - ultra HD
}
```

## 멀티턴 대화형 편집(네이티브는 지원하고, reverse 모델은 지원하지 않습니다)

Nano Banana 시리즈는 **Gemini 네이티브 형식**을 사용하며 **진정한 대화형 멀티턴 편집**을 지원합니다: 각 턴의 생성 이미지를 `contents`에 \*\*`role: "model"` `inlineData`\*\*로 다시 추가한 뒤 다음 사용자 지시를 보냅니다. 모델은 **전체 대화 히스토리**를 기반으로 편집하고 변경 사항을 **누적**합니다(예: 먼저 소파 색을 바꾸고, 그다음 액세서리를 추가해도 — 이전 변경 사항이 유지됩니다).

이는 “reverse” 이미지 모델과 근본적으로 다릅니다 — 통합하기 전에 이 점을 분명히 이해하시기 바랍니다:

| 항목              | Nano Banana (Gemini native)                                      | Reverse model (e.g. `gpt-image-2-all`)          |
| --------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| 엔드포인트           | `/v1beta/...:generateContent`                                    | `/v1/chat/completions` (채팅 스타일)                 |
| 멀티턴 메커니즘        | ✅ **진정한 대화형**: `role:model` 이미지를 `contents`에 백필하면 모델이 히스토리를 읽습니다 | ❌ 대화 상태가 없습니다: `assistant` 히스토리의 이미지는 **무시됩니다** |
| 턴 간 누적          | ✅ 지원됨(빨간 소파 → 모자 추가, 소파는 빨간색으로 유지됨)                              | ⚠️ 재입력만 가능, 한 단계 편집                             |
| 이전 이미지를 편집하는 방법 | 대화 히스토리에서 마지막 출력을 `model` 이미지로 백필합니다                             | 이전 이미지 URL을 새 사용자 메시지의 참조로 전달합니다                |

<Info>
  테스트 결과: 이전 이미지를 `model` 역할 턴으로 백필하면 Nano Banana 2 (`gemini-3.1-flash-image-preview`)가 편집을 계속하고 변경 사항을 누적할 수 있습니다. 반면 reverse 모델은 **마지막 사용자 메시지**의 참조 이미지만 읽으므로, 그곳에서는 대화 히스토리를 유지해도 멀티턴에 작동하지 않습니다.
</Info>

최소 예제(각 출력을 같은 `contents`에 백필):

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"imageSize": "2K"}}

contents = []  # keep one running conversation history

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # key: backfill the output image
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))

turn("Generate an orange cat sitting on a blue sofa, simple line-art style", "step1.png")
turn("Make the sofa red; keep the cat and composition unchanged", "step2.png")   # edits the previous image
turn("Put a small yellow hat on the cat; keep everything else the same", "step3.png")  # accumulates; red sofa kept
```

<Tip>
  자세한 내용(히스토리 백필 vs 재입력 방식, 기존 이미지에서 멀티턴 시작하기)은 [이미지 편집 API · 멀티턴 대화형 편집](/ko/api-capabilities/nano-banana-2-image/image-edit#multi-turn-conversational-editing)에 있습니다.
</Tip>

## 이미지를 얻으려면 항상 parts를 순회하십시오 — 절대로 인덱스로 접근하지 마십시오

`parts`는 **이질적 배열**입니다. 이미지 세그먼트만 담을 수도 있고, 텍스트와 이미지 세그먼트가 섞여 있을 수도 있으며, **길이도 순서도 보장되지 않습니다**. 따라서 `parts[0]` / `parts[1]` 같은 하드코딩된 접근은 간헐적으로 실패할 수밖에 없습니다.

테스트에서 다음 세 가지 레이아웃이 관찰되었습니다.

| parts 구성              | 길이 | 이미지 인덱스 |
| --------------------- | -- | ------- |
| `inlineData`          | 1  | `0`     |
| `text` + `inlineData` | 2  | **`1`** |
| `inlineData` + `text` | 2  | **`0`** |

텍스트 세그먼트는 한 가지가 아닌 여러 이유로 생길 수 있습니다. `TEXT`를 `responseModalities`에 포함하는 경우도 그렇고, 모델이 스스로를 설명하도록 요청하는 prompt도 그렇습니다. 이 경우 모델은 이미지와 함께 텍스트를 반환하며, 그 텍스트가 이미지 앞에 올지 뒤에 올지도 역시 고정되어 있지 않습니다. **따라서 이미지가 놓이는 인덱스는 상수가 아닙니다**, 그리고 같은 code라도 요청마다 서로 다른 구조를 받을 수 있습니다.

<Warning>
  두 개의 하드코딩된 인덱스 패턴은 **상보적**입니다. 이미지는 항상 `[0]` 또는 `[1]` 중 한 곳에 놓이므로, 무엇을 선택하든 일부 요청에서는 이미지가 없는 응답을 받게 됩니다. **`[0]`와 `[1]`를 번갈아 쓰는 것은 아무것도 해결하지 못합니다** — 필드 형태로 선택하는 방법만이 안정적입니다.
</Warning>

올바른 방법은 위치가 아니라 필드 형태로 선택하는 것입니다. 마지막 `inlineData`를 취해야 하며 첫 번째가 아닙니다 — 복잡한 작업은 여러 이미지를 반환하고, 마지막 것이 최종 버전입니다(다음 섹션 참조):

```python theme={null}
cand = (resp.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []      # handles parts=null
images = [p["inlineData"] for p in parts if "inlineData" in p]
if not images:
    raise RuntimeError(f"No image returned, finishReason={cand.get('finishReason')}")

final = images[-1]                                 # last one is the final version
image_bytes = base64.b64decode(final["data"])
mime = final["mimeType"]                           # trust the response; don't hardcode image/png
```

```javascript theme={null}
const parts = resp?.candidates?.[0]?.content?.parts ?? [];
const images = parts.filter((p) => p.inlineData?.data);   // ✅ never write parts[1]
if (images.length === 0) throw new Error("Gemini returned no image data");
const { data, mimeType } = images[images.length - 1].inlineData;   // last is the final version
```

<Tip>
  **하드닝**: `responseModalities: ["IMAGE"]`를 `generationConfig`에 선언하면 이미지만 원한다는 뜻이 되어 추가 텍스트 세그먼트가 줄어듭니다.

  이는 하드닝이지 **대체가 아닙니다** — 필터링이 먼저여야 합니다. 역방향은 성립하지 않습니다: `["TEXT","IMAGE"]`를 전달해도 텍스트 세그먼트가 보장되지는 않으며, 모델은 여전히 이미지만 반환할 수 있습니다.
</Tip>

<Warning>
  **`mimeType`도 하드코딩하지 마십시오.** 응답의 이미지 형식은 일정하지 않으며 — `image/png`와 `image/jpeg`가 모두 나타납니다. 고정된 `.png` 확장자로 파일을 쓰면 확장자가 내용과 어긋나는 파일이 생성됩니다 — **항상 응답의 `mimeType`가 확장자를 결정하게 하십시오**.
</Warning>

## 응답에 가끔 여러 이미지가 포함되는 이유

`gemini-3-pro-image`를 호출할 때, 가끔 \*\*하나의 응답에 여러 이미지 파트(테스트에서는 2–10개 관찰)\*\*가 포함되는 것을 볼 수 있으며, 이는 로그에 간헐적으로 나타나는 6000+ (심지어 5자리 수) output-token 항목과 일치합니다. 이는 이상 현상이 아닙니다. Google 공식 문서에 따르면 Gemini 3 이미지 모델은 기본적으로 “Thinking”이 활성화되어 있으며(API에서 비활성화할 수 없습니다), 모델은 구도와 로직을 시험하기 위해 중간 이미지를 생성하고, 이러한 초안은 최종 버전과 함께 `parts`에 나타나며, “Thinking 내의 마지막 이미지가 최종 렌더링 이미지이기도 합니다”(공식 문서: `ai.google.dev/gemini-api/docs/image-generation`). 2026년 7월에 수행한 테스트에 따르면(Google 네이티브 `generateContent` 형식):

| 시나리오                                                | 반환된 이미지 수                              |
| --------------------------------------------------- | -------------------------------------- |
| 순수 텍스트-투-이미지                                        | 항상 1개(프롬프트가 명시적으로 “여러 이미지”를 요청해도 마찬가지) |
| 단순한 이미지 편집(액세서리 추가 / 배경 변경 / 스타일 변경)                | 항상 1개                                  |
| 복잡한 작업형 편집(예: 여러 제약이 있는 “4면 캐릭터 시트 + 의상 변경 + 흰 배경”) | 2–10개, 일관되게 재현됨                        |

트리거는 **prompt의 작업 복잡도**이지, “이미지 편집” 그 자체가 아닙니다. 여러 이미지는 여전히 **단일 후보** 안에 있으며(여러 후보가 아님), 각 이미지는 완전한 이미지입니다. 즉, 같은 디자인(같은 구도, 약간 다른 세부 사항)에 대한 Thinking 과정의 연속 초안이며, **마지막 파트가 최종 버전입니다**. 이러한 초안은 `thoughtSignature` 필드를 가진 일반적인 이미지 파트로 반환되며, `thought: true` 플래그는 없습니다. Google 문서에는 Thinking이 최대 두 개의 중간 이미지만 생성한다고 되어 있지만, 복잡한 작업에서는 최대 10개까지 관찰되었습니다.

**과금 영향**: 각 이미지는 고정 token 수로 과금됩니다(1K/2K 해상도에서는 이미지당 1120 token, 4K에서는 2000 token). 따라서 output tokens는 이미지 수에 따라 엄밀히 선형적으로 증가합니다. 로그에 간헐적으로 보이는 6000+ (극단적인 경우 약 13.5k까지) output-token 항목은 단순히 4–10장 이미지 응답일 뿐이며, **과금 이상이 아닙니다**.

**권장 후속 코드**:

```python theme={null}
parts = response["candidates"][0]["content"]["parts"] or []   # parts is null on safety refusals
images = [p["inlineData"]["data"] for p in parts if "inlineData" in p]

if images:
    final_image = images[-1]   # last one = final version
```

* **항상 parts를 순회하십시오** — 응답당 이미지 1개라고 가정하지 마십시오. 이미지별 카운팅이나 저장 로직은 반드시 실제 part 수를 기준으로 해야 합니다
* **하나만 필요할 때는 마지막 이미지를 사용하십시오**: 앞선 초안들은 세부 사항이 완성되지 않았고 품질도 약간 낮으므로, 첫 번째 이미지를 선택하지 마십시오
* **prompt를 통해 이미지 수를 제어하는 것은 대체로 효과가 없습니다**(테스트에서는 “이미지 하나만 출력해 주세요” 지시가 무시되었습니다) — 코드에서 처리하십시오
* 여러 이미지 응답은 35–142초가 걸립니다(1K 해상도 기준이며, 이미지 수가 많을수록 더 길어짐). 단일 이미지 응답보다 눈에 띄게 더 오래 걸리므로, 위의 timeout 권장값(5분 이상)을 유지하십시오

<Tip>
  usageMetadata 필드의 전체 내역(세부 정보와 합계 사이의 차이, 거부 응답에서의 카운팅 특이점 등)에 대한 자세한 설명은 [Usage 필드 및 출력 설명](/ko/api-capabilities/nano-banana-usage-metadata)을 참조하십시오.
</Tip>

## 자주 묻는 질문

<CardGroup cols={2}>
  <Card title="오류 처리 가이드" icon="triangle-alert" href="/ko/api-capabilities/gemini-image-error-handling">
    실패한 생성, 콘텐츠 모더레이션 정책, 친화적인 prompt 전략을 진단하는 데 필요한 세 가지 핵심 지표입니다
  </Card>

  <Card title="꼭 읽어야 하는 일반 개발 질문" icon="circle-question-mark" href="/ko/faq/nano-banana-image-failure">
    실패한 생성 문제 해결과 일반적인 질문을 다룹니다
  </Card>

  <Card title="실패한 생성 보장 플랜" icon="shield-check" href="/ko/api-capabilities/nano-banana-pro-guarantee">
    입력으로 인해 발생하지 않은 실패의 경우, 실패한 요청 수에 따라 크레딧이 환불됩니다
  </Card>
</CardGroup>

<AccordionGroup>
  <Accordion title="왜 connection reset by peer / write_response_body_failed (500)가 발생합니까?">
    전체 오류는 다음과 같습니다:

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    이는 **대개 크기가 너무 큰 이미지 업로드로 인해 발생합니다 — 요청 본문이 너무 커져 연결이 끊어집니다**. 다음 모범 사례를 따르십시오:

    * **이미지 수를 제한합니다**: 공식 규칙 범위 내에서 유지하십시오(프롬프트당 최대 14장 — 위의 공식 사양을 참조하십시오).
    * **이미지별 크기를 제한합니다**: 각 이미지를 5MB 미만으로 유지하십시오 — 공식 이미지별 상한은 7MB이며, base64 인코딩은 크기를 대략 1/3 정도 늘리므로 여유를 두십시오.
    * **업로드 전에 프런트엔드에서 압축합니다**: 이미지를 API로 보내기 전에 프런트엔드(또는 서버 측 릴레이)에서 압축하십시오 — 일반적인 방식은 긴 변을 제한하고, JPEG/WebP로 변환하며, quality 매개변수를 조정하는 것입니다.
    * **URL 입력으로 전환합니다**: Gemini 네이티브 형식은 `fileData.fileUri`를 통해 이미지 URL 전달을 지원하므로, 과도하게 큰 base64 요청 본문을 완전히 피할 수 있습니다 — 위의 [URL Image Input](#url-image-input)을 참조하십시오.
  </Accordion>
</AccordionGroup>

## 활용 사례

* **AI 채팅 클라이언트**: [Cherry Studio](/ko/scenarios/chat/cherry-studio) 같은 클라이언트는 APIYI를 통해 직접 이미지 생성하도록 설정할 수 있습니다
* **생성 테스트**: 챗 클라이언트나 콘솔에서 모델 성능을 빠르게 검증합니다

## 고급 요구사항

* **URL을 통해 이미지를 업로드하고 싶으십니까?** Gemini 네이티브 엔드포인트는 `fileData.fileUri`를 통해 이미지 URL 전달을 지원합니다. 그러나 OpenAI 호환 모드는 URL 업로드를 지원하지 않으므로, 대신 Base64를 사용하십시오. 위의 [URL 이미지 입력](#url-image-input)에서 코드 예제와 주의 사항을 확인하십시오.
* **직접 다운로드 URL을 받고 싶으십니까(Base64 대신)?** NB-OSS 그룹을 사용하십시오 — [Nano Banana OSS 그룹](/ko/api-capabilities/nano-banana-oss-group)을 참조하십시오.
