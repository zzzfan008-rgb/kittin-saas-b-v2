> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 비전 이해(이미지 인식) API

> 지능형 이미지 분석과 이해를 위해 AI 모델을 사용하며, 객체 인식, 장면 설명, 텍스트 추출 등을 지원합니다

APIYI는 강력한 이미지 이해 기능을 제공하며, 다양한 고급 AI 모델을 사용한 이미지의 심층 분석과 이해를 지원합니다. 통합된 OpenAI API 형식을 통해 이미지 인식, 장면 설명, OCR 텍스트 인식 등 다양한 기능을 쉽게 구현할 수 있습니다.

<Note>
  **🔍 지능형 시각 분석**
  객체 인식, 장면 이해, 텍스트 추출, 감성 분석 등을 포함한 다양한 시각 작업을 지원하여 AI가 이미지의 “의미”를 진정으로 이해할 수 있도록 합니다.
</Note>

## 🌟 핵심 기능

* **🎯 멀티모델 지원**: Gemini 3, GPT-5, Claude 4 시리즈 같은 최상급 멀티모달 모델을 지원합니다
* **📸 유연한 입력**: URL 링크와 Base64 인코딩된 이미지를 지원합니다
* **🌏 중국어 최적화**: 중국어 장면 이해와 텍스트 인식을 완벽하게 지원합니다
* **⚡ 빠른 응답**: 고성능 추론으로 초 단위 결과를 제공합니다
* **💰 비용 제어**: 다양한 모델 옵션으로 서로 다른 예산 요구를 충족합니다

## 📋 지원되는 비전 모델

다음은 현재 주류 멀티모달 추천 모델입니다. 모델 ID는 새 릴리스와 함께 변경될 수 있으므로 — 항상 콘솔을 기준으로 하십시오.

| 모델 이름                        | 모델 ID                    | 특징                       | 추천 시나리오            |
| ---------------------------- | ------------------------ | ------------------------ | ------------------ |
| **Gemini 3.1 Pro Preview** ⭐ | `gemini-3.1-pro-preview` | 가장 강력한 멀티모달 추론, 풍부한 디테일  | 복잡한 이미지/장면 분석      |
| **Gemini 3.5 Flash** 🔥      | `gemini-3.5-flash`       | 빠르고 저렴하며, 가성비 최고         | 실시간 인식, 배치 처리      |
| **GPT-5.5** ⭐                | `gpt-5.5`                | 전반적인 비전 이해력이 뛰어나고 안정적입니다 | 일반 이미지 이해          |
| **Claude Opus 4.7**          | `claude-opus-4-7`        | 깊이 있는 이해, 정밀한 설명         | 전문가 수준의 이미지+텍스트 분석 |
| **Claude Sonnet 4.6**        | `claude-sonnet-4-6`      | Opus와 견줄 만하며, 가성비가 높습니다  | 비용 효율적인 인식         |
| **GPT-4o**                   | `gpt-4o`                 | 클래식 멀티모달, 성숙하고 안정적입니다    | 일반적인 시나리오          |
| **Gemini 2.5 Flash**         | `gemini-2.5-flash`       | 초고속이고 저렴하며, GA 출시        | 대량의 단순 인식          |

<Info>
  **대부분의 채팅 모델은 이제 멀티모달 이미지 입력을 지원합니다**: 위 표는 일반적인 추천 모델만 나열한 것이며, 전체 목록은 아닙니다. GPT-5, Gemini 3, Claude 4 시리즈, Grok 4, Kimi를 포함한 주류 모델은 모두 이미지 입력을 허용합니다.

  * ⚠️ 그러나 **같은 벤더의 세대별로 기능이 다릅니다** — `deepseek-v4-pro`, `deepseek-v4-flash` 및 `glm-5.2`는 아직 텍스트 전용이며, 이미지를 전달하면 `Model do not support image input`가 반환됩니다. 특정 모델을 확인하려면 상세 페이지의 입력 모드 행을 사용하십시오. [하나의 API에서 텍스트 + 이미지](/ko/faq/text-and-image-in-one-api)를 참조하십시오
  * 📚 전체 모델 목록 및 기능 비교: [인기 모델(항상 최신 유지)](/ko/api-capabilities/model-info)
  * 🔗 실시간 모델 목록 및 요금: [APIYI 콘솔 요금 페이지](https://www.apiyi.com/account/pricing) (비전 지원은 콘솔에서 확인하십시오)
</Info>

## 🚀 빠른 시작

### 1. 기본 예제 - 이미지 URL

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gpt-5.5",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Please describe this image in detail"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result['choices'][0]['message']['content'])
```

### 2. 로컬 이미지 예시 - Base64 인코딩

```python theme={null}
import base64
import requests

def image_to_base64(image_path):
    """Convert local image to base64 encoding"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Read local image
base64_image = image_to_base64("path/to/your/image.jpg")

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze all text content in this image"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 3. 고급 예제 - 다중 이미지 비교

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please compare the differences between these two images:"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image1.jpg"}
                },
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image2.jpg"}
                }
            ]
        }
    ],
    "max_tokens": 1000
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 4. cURL 예제 (명령줄)

**이미지 URL 방식**:

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.1-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Please describe this image in detail" },
          { "type": "image_url", "image_url": { "url": "https://example.com/image.jpg" } }
        ]
      }
    ]
  }'
```

**로컬 이미지 Base64 방식** (이미지를 Base64로 인코딩한 다음 요청 본문에 포함합니다):

```bash theme={null}
# 1. Convert local image to base64 (macOS / Linux)
BASE64_IMAGE=$(base64 -i path/to/your/image.jpg | tr -d '\n')

# 2. Pass the image content via a data URI
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Analyze all text content in this image" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,'"$BASE64_IMAGE"'" } }
        ]
      }
    ]
  }'
```

<Tip>
  **신뢰성을 위해 Base64 업로드를 권장합니다**: 이미지 URL 방식에서는 서버가 먼저 실시간으로 이미지를 다운로드해야 합니다. 이미지 호스트의 응답이 느리거나 접근을 제한하면 다운로드가 실패할 수 있습니다. Base64는 이미지 데이터를 외부 다운로드에 의존하지 않고 요청 본문에 직접 포함하므로 더 안정적입니다. 두 방식은 모두 공식적으로 지원됩니다. Base64는 원본 이미지 크기의 약 1.33배이므로, 인코딩하기 전에 큰 이미지는 압축하는 것을 고려하십시오.
</Tip>

### 5. 흔한 오류: 이미지 URL 다운로드 시간 초과

이미지 URL 방식을 사용할 때 다음과 같은 오류가 발생할 수 있습니다:

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

이는 **서버가 URL에서 이미지를 다운로드하는 동안 시간 초과가 발생했음**을 의미합니다. 모델, API 키, 또는 쿼터와는 전혀 관련이 없습니다. 흔한 원인은 다음과 같습니다.

1. 이미지 호스트/원본 서버의 응답이 느리거나 특정 네트워크 지역에 대해 호환성이 좋지 않습니다
2. 이미지가 너무 커서 다운로드가 시간 제한을 초과합니다
3. URL에 핫링크 보호가 있거나, 로그인이 필요하거나, 공개된 직접 링크가 아닙니다

**해결 방법**:

* ✅ **Base64(data URI) 업로드로 전환하십시오**(권장, 위의 예제 2 참조) — 이미지 데이터를 요청 본문에 직접 전송하므로 다운로드 단계를 완전히 우회할 수 있으며, 가장 안정적인 방법입니다
* 더 빠르고 공개적으로 접근 가능한 직접 이미지 링크를 사용하십시오
* 이미지를 압축한 뒤 다시 시도하십시오

### 6. 흔한 오류: 잘못된 base64 데이터(Base64 필드에 URL이 잘못 들어간 경우)

아래와 같은 400 오류를 받는다면(여기서는 Claude 시리즈의 표현을 보여드리며, 다른 모델 시리즈는 약간 다르게 표현하지만 핵심 시그니처는 `invalid base64 data`입니다):

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  },
  "request_id": "req_011CczN..."
}
```

이는 보통 **이미지 URL이 data URI의 Base64 데이터 칸에 붙여넣어졌다는 뜻입니다**:

```json theme={null}
// ❌ Wrong: what follows base64, is an image link, not Base64-encoded data
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,` 접두사 뒤에 오는 내용은 반드시 **이미지 파일 자체의 Base64 인코딩된 내용**이어야 하며, 이미지 링크가 아니어야 합니다. URL 방식과 Base64 방식은 이미지를 전달하는 서로 배타적인 두 방법이므로 섞을 수 없습니다. 흔한 원인은 클라이언트 코드가 항상 data URI 연결 경로를 타기 때문에 원격 이미지 URL도 함께 연결된다는 점입니다.

**올바른 사용법, 나란히 보기**:

```json theme={null}
// ✅ Image is a remote URL → pass the link directly, no prefix at all
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ Image is a local file / binary → Base64-encode it first, then build the data URI (see Example 2 above)
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **자가 점검**: 전송하기 전에 이미지 출처로 판단하십시오 — 문자열이 `http`로 시작하면 URL 방식을 사용하고; 그렇지 않으면 Base64로 인코딩해 data URI를 만드십시오. 또한 유효한 Base64 문자열에는 `://`나 `?` 같은 문자가 절대 포함되지 않습니다 — `base64,` 뒤에서 그런 문자가 보인다면 링크가 거의 확실하게 함께 연결된 것입니다.
</Tip>

### 7. 선언한 미디어 타입이 실제 이미지 형식과 일치하지 않는 일반적인 오류

다음과 같은 400 오류를 받는 경우(핵심 서명은 `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`입니다):

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: e87a35ed-..., ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

**의미**: 이 오류는 상위 모델 서비스의 입력 검증에서 발생합니다(예시의 `Bedrock Runtime: InvokeModel, ValidationException`은 요청이 Claude 시리즈 상위 채널에 도달했지만 매개변수 검증 단계에서 거부되었음을 나타냅니다). 메시지는 놀랄 만큼 직설적입니다:

* 데이터 URI가 이미지가 PNG라고 **선언**합니다(`data:image/png;base64,...`)
* 하지만 Base64를 디코딩한 뒤 상위가 파일 헤더(매직 바이트)를 검사해 보니 **실제 내용은 JPEG**였습니다
* 선언과 내용이 불일치함 → 400. Base64 인코딩 자체는 정상입니다 — 문제는 접두사에 있는 미디어 타입입니다

**일반적인 원인**:

1. **파일 확장자로 MIME 타입을 추론했지만, 확장자가 거짓인 경우** — 파일 이름은 `xxx.png`이지만 실제로는 확장자만 바뀐 JPEG입니다(다운로드 도구, 채팅 앱, 스크린샷 도구가 모두 이렇게 합니다)
2. 클라이언트 코드에 **`image/png`(또는 `image/jpeg`)를 하드코딩**해서, 형식과 상관없이 모든 이미지에 같은 접두사를 붙이는 경우
3. 이미지가 처리 파이프라인을 거치면서 형식이 바뀌었지만 파일 이름은 그대로인 경우

**해결 방법**: 확장자를 절대 믿지 말고, data URI를 만들기 전에 파일의 매직 바이트에서 실제 MIME 타입을 확인하십시오:

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """Detect the real format from magic bytes so the media type always matches the content"""
    with open(image_path, "rb") as f:
        data = f.read()

    if data[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif data[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    elif data[:6] in (b"GIF87a", b"GIF89a"):
        mime = "image/gif"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        raise ValueError(f"Unrecognized image format: {image_path}")

    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
```

또는 PIL로 다시 인코딩하십시오 — 이렇게 하면 한 단계로 선언과 내용이 일치하며(그 과정에서 압축하고 이상한 프레임도 제거할 수 있습니다):

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(image_path):
    img = Image.open(image_path)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"
```

<Tip>
  **자가 점검**: `file xxx.png`(macOS / Linux 명령줄)은 파일의 실제 형식을 1초 만에 보여 주며, Python에서는 `Image.open(path).format`가 같은 역할을 합니다. 모델 시리즈마다 미디어 타입 검증의 엄격함이 다릅니다 — 어떤 것은 불일치를 통과시키지만, Claude 시리즈(특히 Bedrock 채널 경유)는 가장 엄격합니다. 선언이 항상 내용과 일치하도록 코드를 작성하면 모든 모델에서 안전합니다.
</Tip>

<Warning>
  **GPT-5 시리즈 매개변수 차이**: 예제를 `gpt-5.5` / `gpt-5.4` 같은 GPT-5 시리즈 모델로 바꾼다면 다음에 유의하십시오:

  1. `max_completion_tokens`를 `max_tokens` 대신 사용하십시오
  2. `temperature`는 `1`만 지원합니다(기본값으로 두고, 다른 값은 전달하지 마십시오)
  3. `top_p` 매개변수는 전달하지 마십시오

  Gemini 및 Claude 시리즈에는 이러한 제한이 없으며 `max_tokens`, `temperature` 등과 함께 정상적으로 작동합니다.
</Warning>

## 🎯 일반적인 사용 사례

### 1. 제품 인식 및 분석

```python theme={null}
prompt = """
Please analyze this product image, including:
1. Product type and brand
2. Main features and selling points
3. Suitable target audience
4. Suggested marketing copy
"""
```

### 2. 문서 OCR 인식

```python theme={null}
prompt = """
Please extract all text content from the image and organize it in the original format.
If there are tables, please present them in Markdown table format.
"""
```

### 3. 의료 영상 지원

```python theme={null}
prompt = """
This is a medical imaging picture, please:
1. Describe basic image information (such as imaging type, body part, etc.)
2. Label visible anatomical structures
3. Note: For reference only, not for diagnostic purposes
"""
```

### 4. 보안 감시 분석

```python theme={null}
prompt = """
Analyze the surveillance footage to identify:
1. Number of people and their positions in the scene
2. Any abnormal behavior
3. Environmental safety hazards
4. Timestamp information (if visible)
"""
```

## 💡 모범 사례

### 이미지 전처리 권장 사항

1. **형식 지원**: JPEG, PNG, GIF, WebP와 같은 일반적인 형식
2. **크기 제한**: 단일 이미지 권장 크기는 20MB 미만입니다
3. **해상도**: 해상도가 높은 이미지는 더 나은 인식 성능을 보입니다
4. **압축**: 전송 속도를 높이기 위해 적절한 압축을 적용합니다

### 프롬프트 최적화

```python theme={null}
# ❌ Not Recommended: Vague prompt
prompt = "What is this"

# ✅ Recommended: Specific and clear prompt
prompt = """
Please analyze this image from the following aspects:
1. Main Objects: Identify main objects or people in the image
2. Scene Environment: Describe the shooting location and environmental features
3. Color Composition: Analyze color scheme and composition characteristics
4. Emotional Atmosphere: Emotions or atmosphere conveyed by the image
5. Possible Uses: What scenarios this image is suitable for
"""
```

### 오류 처리

```python theme={null}
import requests
from requests.exceptions import RequestException

def analyze_image_with_retry(image_url, prompt, max_retries=3):
    """Image analysis function with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://api.apiyi.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-5.5",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }]
                },
                timeout=30
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print(f"Rate limited, waiting to retry... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Error: {response.status_code} - {response.text}")

        except RequestException as e:
            print(f"Request exception: {e}")

    return None
```

## 🔧 고급 기능

### 1. 스트리밍 출력

장시간 분석의 경우, 스트리밍 출력은 더 나은 사용자 경험을 제공합니다:

```python theme={null}
payload = {
    "model": "gpt-5.5",
    "messages": [...],
    "stream": True
}

response = requests.post(url, headers=headers, json=payload, stream=True)
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### 2. 멀티턴 대화

심층 분석을 위해 컨텍스트를 유지합니다:

```python theme={null}
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What animal is this?"},
            {"type": "image_url", "image_url": {"url": "animal.jpg"}}
        ]
    },
    {
        "role": "assistant",
        "content": "This is a Golden Retriever."
    },
    {
        "role": "user",
        "content": [{"type": "text", "text": "How old does it look? How is its health condition?"}]
    }
]
```

### 3. Function Calling과 결합

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "save_image_analysis",
            "description": "Save image analysis results to database",
            "parameters": {
                "type": "object",
                "properties": {
                    "objects": {"type": "array", "items": {"type": "string"}},
                    "scene": {"type": "string"},
                    "text_content": {"type": "string"}
                }
            }
        }
    }
]

payload = {
    "model": "gpt-5.5",
    "messages": messages,
    "tools": tools,
    "tool_choice": "auto"
}
```

## 📊 성능 비교

| 모델                     | 응답 속도 | 인식 정확도 | 중국어 지원 | 가격   |
| ---------------------- | ----- | ------ | ------ | ---- |
| Gemini 3.1 Pro Preview | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  | \$\$ |
| Gemini 3.5 Flash       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐   | \$   |
| GPT-5.5                | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  | \$\$ |
| Claude Sonnet 4.6      | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐   | \$\$ |
| Gemini 2.5 Flash       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | \$   |

## 🚨 중요 안내

1. **개인정보 보호**: 민감한 정보가 포함된 이미지는 업로드하지 마십시오
2. **준법 사용**: 관련 법률과 규정을 준수하고, 불법적인 목적으로 사용하지 마십시오
3. **결과 검증**: AI 분석 결과는 참고용일 뿐이며, 중요한 결정은 수동 검토가 필요합니다
4. **비용 관리**: 불필요한 지출을 피하기 위해 모델을 합리적으로 선택하십시오

## 🔗 관련 자료

* [전체 코드 예제](https://github.com/apiyi-api/ai-api-code-samples/tree/main/Vision-API-OpenAI)
* [API 과금 정보](https://api.apiyi.com/account/pricing)

<Note>
  💡 **팁**: 먼저 Gemini 3.5 Flash 또는 Gemini 2.5 Flash 같은 비용 효율적인 모델로 테스트하고, 품질을 확인한 뒤 운영 환경에서는 Gemini 3.1 Pro 또는 GPT-5.5 같은 고급 모델로 전환합니다. 더 많은 사용 가능한 모델은 [인기 모델](/ko/api-capabilities/model-info) 또는 [콘솔 모델 목록](https://www.apiyi.com/account/pricing)을 참조하십시오.
</Note>
