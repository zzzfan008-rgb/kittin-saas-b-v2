> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 동영상 이해 API

> Gemini 3.5 Flash 및 Gemini 3.1 Pro Preview와 같은 고급 모델을 사용해 지능적인 동영상 분석을 수행합니다 — 콘텐츠 인식, 장면 설명, 동작 분석, 타임스탬프 참조까지 지원합니다

APIYI는 Gemini의 멀티모달 모델을 통해 동영상 이해 기능을 제공합니다. 하나의 prompt만으로 모델은 동영상의 장면, 동작, 화면상의 텍스트, 오디오를 “시청”하며, timestamp로 주요 순간을 참조할 수 있습니다. 이 페이지에서는 지원되는 모델, 실제로 동작하는 동영상 입력 방법, 그리고 사람들이 자주 막히는 제한 사항을 다룹니다.

<Note>
  **먼저 읽으십시오**: 동영상은 **Base64 inline(전체 요청 ≤ 20 MB)** 또는 **YouTube 링크**(Gemini 기본 형식)로만 전달할 수 있습니다. 일반 공개 동영상 URL(예: `https://example.com/demo.mp4`)을 전달하면 `Request contains an invalid argument`가 반환됩니다 —— 이는 APIYI 차단이 아니라 Google이 직접 링크를 거부하는 것입니다. 아래의 "Video input methods"를 참조하십시오.
</Note>

<CardGroup cols={2}>
  <Card title="시각적 API 테스트" icon="flask-conical" href="https://icover.ai/video-understanding">
    동영상을 업로드하고 iCover 시각적 테스트 도구에서 이해 엔드포인트를 테스트하십시오.
  </Card>
</CardGroup>

## 지원 모델

| Model                      | Model ID                 | 주요 특징                           | 추천 용도                 |
| -------------------------- | ------------------------ | ------------------------------- | --------------------- |
| **Gemini 3.5 Flash** 🔥    | `gemini-3.5-flash`       | 빠르고, 가성비가 뛰어나며, 강력한 멀티모달        | 일상적인 동영상 분석을 위한 기본 선택 |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | Google의 가장 강력한 reasoning + 멀티모달 | 복잡하고 긴 동영상의 심층 분석     |
| **Gemini 3.1 Flash Lite**  | `gemini-3.1-flash-lite`  | 매우 낮은 가격과 지연 시간                 | 대용량, 고동시 실행 수 워크로드    |

안정적인 클래식인 `gemini-2.5-pro`(2M 컨텍스트)와 `gemini-2.5-flash`는 여전히 사용할 수 있습니다. 전체 과금은 [모델 및 과금](/ko/api-capabilities/model-info)을 참조하십시오.

## 동영상 입력 방식

대부분의 문제는 여기서 발생합니다. 아래 표를 확인하여 입력 방식이 지원되는지 확인하십시오:

| 입력 방식                          |  지원 | 비고                                                                                             |
| ------------------------------ | :-: | ---------------------------------------------------------------------------------------------- |
| **Base64 인라인**                 |  ✅  | 로컬 동영상을 읽어 base64로 인코딩한 뒤 전달합니다. **전체 요청 본문은 ≤ 20 MB여야 합니다.** OpenAI 호환 형식과 네이티브 형식 모두에서 동작합니다 |
| **YouTube 링크**                 |  ✅  | **Gemini 네이티브 형식에서만 지원**되며, `file_uri`를 통해 전달합니다                                               |
| **공개 동영상 URL** (예: `.mp4` 주소)  |  ❌  | **Google은 이를 허용하지 않으며** `Request contains an invalid argument`를 반환합니다 — 이는 APIYI 차단이 아닙니다      |
| **Files API** (`files.upload`) |  ❌  | 서드파티에서는 지원되지 않으며, Google의 공식 엔드포인트만 지원합니다                                                      |

<Warning>
  **20 MB 제한**: Base64를 사용할 경우, 인코딩된 동영상을 포함한 전체 요청 본문은 20 MB 미만으로 유지되어야 합니다. **20 MB를 초과하는 동영상**의 경우 선택지는 다음뿐입니다: ① YouTube 링크를 사용합니다. ② base64로 인코딩하기 전에 동영상을 로컬에서 20 MB 미만으로 압축하거나 클립합니다.
</Warning>

## 빠른 시작: Base64 인라인 (OpenAI 호환 형식)

가장 일반적인 방법은 로컬 동영상을 읽어 → base64로 인코딩한 다음 → `image_url` 필드에 전달하는 것입니다.

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

{/* Read the local video and base64-encode it (entire request ≤ 20 MB) */}
with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.5-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe the content of this video in detail"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

동등한 curl(`<BASE64_VIDEO>`을 동영상의 base64 문자열로 바꾸십시오. 큰 파일의 경우에는 SDK가 자동으로 인코딩하도록 두는 편이 좋습니다):

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Summarize this video"},
        {"type": "image_url",
         "image_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"},
         "mime_type": "video/mp4"}
      ]
    }]
  }'
```

## YouTube 링크(Gemini 네이티브 형식)

YouTube 링크는 다운로드가 필요 없고 20 MB 제한의 적용을 받지 않지만, Gemini 네이티브 형식으로만 전달할 수 있습니다(`google-genai` SDK, 엔드포인트 `https://api.apiyi.com`).

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="Summarize the main content and key points of this video"),
    ]),
)

print(response.text)
```

<Info>
  더 많은 네이티브 형식 사용법(스트리밍, 추론 예산, 함수 호출 등)은 [Gemini Native Format](/ko/api-capabilities/gemini/native)을 참조하십시오.
</Info>

## 고급 팁

### 타임스탬프 참조

모델은 기본적으로 초당 1프레임으로 샘플링하며 오디오 트랙도 이해하므로, prompt에서 `MM:SS`로 순간을 직접 참조할 수 있습니다. 이는 순수한 프롬프팅 기법이며 모든 입력 방식에서 작동합니다:

```text theme={null}
Describe what happens between 00:30 and 01:15, and identify the on-screen text that appears at 02:40.
```

### 일반적인 작업을 위한 프롬프팅 아이디어

동일한 동영상은 prompt만 바꾸면 서로 다른 분석을 지원하므로 코드 변경이 필요하지 않습니다:

* **콘텐츠 요약**: 주제, 핵심 순간, 결론을 3\~5문장으로 요약합니다
* **교육적 분석**: 핵심 개념, 장별 분해, 중요한 타임스탬프를 추출합니다
* **감시 분석**: 비정상적인 행동, 존재하는 사람/객체, 그리고 발생 시점을 식별합니다
* **마케팅 검토**: 판매 포인트가 어떻게 제시되는지, 페이싱, 타깃 청중과의 적합성을 분석합니다
* **동작 분석**: 동작 단계, 자세 세부사항, 개선할 지점을 분해합니다

## 기술 노트

* **샘플링 속도**: 기본적으로 모델은 **초당 1프레임(FPS)** 으로 샘플링하며 오디오 트랙도 이해합니다.
* **토큰 사용량**: 기본 해상도에서는 대략 **초당 300 tokens** 정도이며, 저해상도에서는 대략 **초당 100 tokens** 정도입니다. 동영상이 길수록 더 많은 tokens가 사용되므로 이에 맞춰 예상해야 합니다.
* **지원 형식**: mp4, mpeg, mov (quicktime), avi, webm, wmv, 3gpp 및 기타 일반적인 형식을 지원합니다.

## FAQ

<AccordionGroup>
  <Accordion title="공개 비디오 링크가 Request contains an invalid argument / fails to fetch를 반환합니다">
    Google의 video understanding은 **임의의 공개 직링크를 허용하지 않으며**(예: `https://example.com/video.mp4`) `Request contains an invalid argument`를 반환합니다. 이는 APIYI 또는 Nginx 차단이 아닙니다. 다음 중 하나를 사용하십시오: ① Base64 인라인(≤20 MB); 또는 ② YouTube 링크(네이티브 형식).
  </Accordion>

  <Accordion title="왜 20 MB 제한이 있습니까? 예전에는 작동했습니다">
    Base64 인라인의 경우 전체 요청 본문은 항상 20 MB로 제한되어 있었습니다(Google의 공식 제한과 동일합니다). "예전에는 작동했다"는 것이 공개 직링크를 뜻한다면, 그것은 애초에 지원되는 방식이 아니었습니다. 일부 경우에는 우연히 오류가 나지 않았을 뿐이며, 이제는 사양에 따라 거부됩니다.
  </Accordion>

  <Accordion title="files.upload를 사용하여 대용량 비디오를 업로드할 수 있습니까?">
    아닙니다. Google의 공식 Files API(`client.files.upload()`)는 **서드파티에서 지원되지 않습니다**. Google 자체 엔드포인트에서만 지원됩니다. 대용량 비디오는 YouTube 링크를 사용하거나, 20 MB 이하로 압축한 뒤 Base64를 사용하십시오.
  </Accordion>

  <Accordion title="20 MB를 초과하는 비디오는 어떻게 합니까?">
    두 가지 방법이 있습니다: ① YouTube에 업로드한 뒤 링크를 전달합니다(네이티브 형식이며 20 MB 제한의 적용을 받지 않음); ② ffmpeg 같은 도구를 사용해 로컬에서 핵심 구간을 20 MB 이하로 압축하거나 잘라낸 뒤 base64로 인코딩합니다.
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="모델 및 요금" icon="list" href="/ko/api-capabilities/model-info">
    모든 Gemini 모델과 최신 요금을 살펴보세요
  </Card>

  <Card title="Gemini 네이티브 형식" icon="sparkles" href="/ko/api-capabilities/gemini/native">
    YouTube 링크, 스트리밍, 추론 예산 및 기타 네이티브 사용법
  </Card>

  <Card title="Vision 이해 API" icon="image" href="/ko/api-capabilities/vision-understanding">
    이미지 콘텐츠 인식 및 멀티모달 분석
  </Card>

  <Card title="API 레퍼런스" icon="book" href="/ko/api-manual">
    전체 API 사양 및 엔드포인트 상세 정보
  </Card>
</CardGroup>
