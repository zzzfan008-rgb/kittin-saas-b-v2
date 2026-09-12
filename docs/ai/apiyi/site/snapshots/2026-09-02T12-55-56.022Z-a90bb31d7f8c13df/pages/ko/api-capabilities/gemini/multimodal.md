> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 멀티모달 입력 및 코드 실행

> 이미지, 오디오, 비디오를 Gemini에 인라인으로 전달합니다: 20MB 제한, media_resolution 비용 제어, 그리고 code_execution을 통한 샌드박스형 Python 실행.

Gemini 네이티브 형식은 이해 및 분석을 위해 이미지, 오디오, 비디오를 직접 수락하며, 샌드박스에서 Python을 실행하는 기본 제공 `code_execution` 도구를 포함합니다. 아래 예시는 [네이티브 호출](/ko/api-capabilities/gemini/native)의 클라이언트 설정을 가정합니다.

<Warning>
  **APIYI 채널의 두 가지 엄격한 제한**:

  1. **Files API는 지원되지 않습니다** (`client.files.upload()`는 Google의 공식 엔드포인트에서만 작동합니다) — 미디어는 **인라인**으로 전달해야 합니다
  2. 인라인 미디어는 파일당 **20MB**로 제한됩니다. 더 크면 먼저 압축하거나 프레임을 추출하십시오
</Warning>

## 이미지 이해

PIL Image를 직접 전달하면 됩니다. SDK가 인코딩을 처리합니다:

```python theme={null}
from google import genai
from PIL import Image

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

img = Image.open("photo.jpg")

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        "Describe this image in detail: key elements, colors, composition.",
        img
    ]
)
print(response.text)
```

바이트는 `types.Part.from_bytes`를 사용해 명시적으로 전달할 수도 있습니다:

```python theme={null}
from google.genai import types

with open("photo.jpg", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "What's in this image?"
    ]
)
```

## 오디오 이해

```python theme={null}
from google.genai import types

with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=audio_bytes, mime_type="audio/mp3"),
        "Transcribe this audio and summarize the main topics."
    ]
)
print(response.text)
```

## 동영상 이해

```python theme={null}
from google.genai import types

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        "Summarize the main content and key information of this video."
    ]
)
print(response.text)
```

동영상은 프레임별로 오디오 트랙과 함께 토큰화되므로, 더 긴 동영상일수록 비용이 더 많이 듭니다. 더 많은 동영상 워크플로: [동영상 이해](/ko/api-capabilities/video-understanding).

## media\_resolution을 사용한 비용 제어

미디어의 token 소비량은 해상도에 따라 증가합니다. “대략적인 확인” 작업(분류, 존재 여부 확인)에서는 낮은 해상도를 사용하면 실제 비용을 절감할 수 있습니다:

```python theme={null}
from google.genai import types

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=["What's the theme of this image?", img],
    config=types.GenerateContentConfig(
        media_resolution="MEDIA_RESOLUTION_LOW"  # LOW / MEDIUM / HIGH
    )
)
```

| 수준       | 사용 용도                    |
| -------- | ------------------------ |
| `LOW`    | 분류, 대략적인 인식 — 가장 저렴함     |
| `MEDIUM` | 일반적인 설명과 이해(균형 잡힌 기본값)   |
| `HIGH`   | OCR, 작은 글자, 세부 정보가 많은 작업 |

## 지원 형식

| 유형  | 형식             | 전달 방법                          |
| --- | -------------- | ------------------------------ |
| 이미지 | JPG, PNG, WebP | PIL Image 또는 `Part.from_bytes` |
| 오디오 | MP3, WAV       | `Part.from_bytes`              |
| 동영상 | MP4, MOV       | `Part.from_bytes`              |

모두 인라인으로 전달하며, 파일당 최대 20MB입니다.

## 코드 실행

`code_execution` 도구를 선언하면 모델이 Python을 작성하고 샌드박스에서 실행한 뒤 결과를 바탕으로 응답합니다 — 계산과 데이터 분석에 이상적입니다:

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="""
Sales data: Product A 100 units × \$50, Product B 200 × \$30, Product C 150 × \$40.
Compute total revenue, average unit price, and each product's revenue share.
""",
    config={"tools": [{"code_execution": {}}]}
)

for part in response.candidates[0].content.parts:
    if getattr(part, "executable_code", None):
        print(f"[Code executed]\n{part.executable_code.code}")
    if getattr(part, "code_execution_result", None):
        print(f"[Result]\n{part.code_execution_result.output}")
    if getattr(part, "text", None):
        print(f"[Explanation]\n{part.text}")
```

<Info>
  코드 실행 제한: Python만 지원합니다; 샌드박스에는 네트워크나 파일 시스템 접근 권한이 없으며; 실행 시간은 제한됩니다. 자체 외부 서비스를 호출하려면 [함수 호출](/ko/api-capabilities/gemini/function-calling)을 사용하십시오.
</Info>

## 관련 링크

* 이 그룹: [Native Calls](/ko/api-capabilities/gemini/native) · [Cache Billing](/ko/api-capabilities/gemini/prompt-caching) · [Function Calling](/ko/api-capabilities/gemini/function-calling)
* 사용 사례: [Video Understanding](/ko/api-capabilities/video-understanding) · [Vision Understanding](/ko/api-capabilities/vision-understanding)
* 공식 Google 문서: `ai.google.dev/gemini-api/docs/vision`
