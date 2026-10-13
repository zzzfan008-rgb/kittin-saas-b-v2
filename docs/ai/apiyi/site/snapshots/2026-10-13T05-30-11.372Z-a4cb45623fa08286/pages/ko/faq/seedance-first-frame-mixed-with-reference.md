> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance에서 첫 번째/마지막 프레임과 참조 미디어를 혼용할 수 없다고 표시되는 경우

> 첫 번째/마지막 프레임 모드를 활성화한 적이 없음에도 Seedance에서 400 오류(first/last frame content cannot be mixed with reference media content)가 반환됩니다. 요청에 포함된 이미지에 role이 지정되지 않아 첫 번째 프레임으로 간주되며, 첫 번째 프레임은 참조 동영상과 함께 사용할 수 없습니다. 이 현상은 주로 범용 /v2/videos/generations 엔드포인트를 통해 요청을 전송하는 서드파티 도구에서 발생합니다. 이 페이지에서는 네이티브 엔드포인트로 전환하는 방법, role을 설정하는 방법, 그리고 참조 동영상을 전달하는 방법을 안내합니다.

## 간단한 답변

**Seedance는 요청 내 각 항목의 `role`만 읽습니다.** 도구에서 어떤 스위치를 선택했는지는 인식하지 못하며, 이를 확인하기 위해 prompt를 읽지도 않습니다. `role`이 없는 이미지는 첫 번째 프레임(image-to-video)으로 처리됩니다. 여기에 참조 동영상을 추가하면 요청이 '첫 번째 프레임 + 참조 미디어'가 되어 제공자 측에서 거부됩니다.

제출 시 일반적으로 400 오류가 반환됩니다. 작업은 생성되지 않으며 과금도 발생하지 않습니다:

```text theme={null}
The parameter `content` specified in the request is not valid:
first/last frame content cannot be mixed with reference media content.
```

**해결 방법**: 네이티브 Seedance 엔드포인트 `POST /seedance/api/v3/contents/generations/tasks`를 통해 제출하고, 이미지에는 `"role": "reference_image"`, 동영상에는 `"role": "reference_video"`을 설정하십시오. 그리고 동영상은 제공자가 직접 다운로드할 수 있는 공개 URL로 전달하거나, 에셋 라이브러리에 등록한 후 `asset://`로 참조하십시오.

## 실제 사례

한 고객이 직접 제작한 로컬 크리에이티브 도구를 사용하고 있었습니다. 캐릭터 이미지 1장과 동영상 1개를 전달하고, "omni reference"를 선택한 뒤 "first/last frame"은 선택 해제했으며, prompt에는 "이미지 1은 첫 번째 프레임이 아니므로 첫/마지막 프레임 모드를 사용하지 마십시오"라고 작성하기까지 했습니다. 그럼에도 실행할 때마다 위의 오류가 발생하며 실패했습니다.

게이트웨이 측에서 캡처한 원본 요청은 다음과 같습니다(이미지 Base64 생략):

```json theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "Replace the person in video 1 with the character in image 1 ... (image 1 is not the first frame) ... do not use first/last frame mode",
  "duration": 14,
  "ratio": "9:16",
  "resolution": "720p",
  "images": ["data:image/jpeg;base64,/9j/4AAQ..."],
  "videos": ["/assets/input/ai_ref_xxxx.mp4"]
}
```

이 요청에는 두 가지 문제가 있습니다. 둘 중 어느 하나만으로도 실패하기에 충분합니다:

| 문제점 | 설명 |
| - | - |
| **이미지에 `role`가 없음** | 요청이 범용 동영상 엔드포인트인 `/v2/videos/generations`로 전송되었으나, 이 엔드포인트에는 `images` 및 `videos` 배열만 존재하며 "이것은 참조 이미지입니다"라고 지정할 수 있는 필드가 없습니다. 규칙상 단일 이미지는 첫 번째 프레임으로 처리되므로 참조 동영상과 충돌합니다. 도구의 "omni reference" 스위치는 요청에 전혀 반영되지 않았으며, prompt 텍스트는 매개변수 유효성 검사에 아무런 영향을 주지 못합니다 |
| **동영상이 로컬 경로임** | `/assets/input/ai_ref_xxxx.mp4`은(는) 고객 본인의 컴퓨터에 있는 도구 내부 경로입니다. 제공업체 서버에서는 이 경로에 접근할 수 없으므로, 첫 번째 프레임 문제가 해결되더라도 동영상이 모델에 도달할 수 없습니다 |

고객의 브라우저 콘솔에도 동일한 mp4에 대해 `415 Unsupported Media Type`이 표시되었으며, 이는 도구 자체의 로컬 미리보기 엔드포인트(`/api/media-preview/...`(`localhost`))에서 발생한 것이었습니다. 도구가 동영상을 사용할 수 있는 주소로 변환하지 못하고 로컬 경로를 요청에 그대로 넣었던 것입니다.

## 범용 동영상 엔드포인트를 통해 Seedance를 제출하지 마십시오

`/v2/videos/generations`(및 `/v1/videos`, `/v1/video/generations`)는 게이트웨이의 범용 동영상 엔드포인트입니다. 해당 필드는 여러 동영상 모델이 공유하는 공통 하위 집합이며, **Seedance의 입력 모드를 표현할 수 없습니다**:

* **`role` 없음**: 첫 프레임, 첫/마지막 프레임, 멀티모달 참조를 구분할 수 없으므로, 이미지 1개와 동영상 1개는 항상 "첫 프레임 + 참조"로 처리됩니다
* **해상도가 온전히 전달되지 않음**: 테스트 결과, 480p로 요청한 2.5는 720p로 출력되었고, 1080p로 요청한 2.0 시리즈는 720p로 출력되었으며, 과금은 실제로 생성된 해상도를 기준으로 이루어집니다
* **2.5 전용 매개변수**(`omni_reference_task_type`, `output_format` 등)와 일치하는 필드가 없습니다

따라서 Seedance에는 **항상 네이티브 엔드포인트를 사용하십시오**:

| 단계 | 엔드포인트 |
| - | - |
| 작업 제출 | `POST /seedance/api/v3/contents/generations/tasks` |
| 작업 조회 | `GET /seedance/api/v3/contents/generations/tasks/{id}` |

서드파티 도구를 사용하는 경우, 해당 도구의 Seedance 채널이 "네이티브" 또는 "Volcengine Ark" 형식을 제공하는지 확인하십시오. 범용 동영상 API만 지원하는 도구는 참조 동영상이 포함된 작업을 실행할 수 없습니다.

## 올바른 방법: 모든 항목에 역할 설정

```python theme={null}
import os, requests

BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
headers = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}

body = {
    "model": "doubao-seedance-2-0-260128",
    "content": [
        {"type": "text", "text": "Replace the person in @video1 with the character in @image1, keeping the motion, expressions and background music unchanged"},
        {"type": "image_url", "image_url": {"url": "https://cdn.example.com/character.png"},
         "role": "reference_image"},
        {"type": "video_url", "video_url": {"url": "https://cdn.example.com/source.mp4"},
         "role": "reference_video"},
    ],
    "resolution": "720p",
    "ratio": "9:16",
    "duration": 10,
}

r = requests.post(BASE, headers=headers, json=body, timeout=60)
print(r.status_code, r.json())   # on success: {"id": "cgt-..."}, then poll with that id
```

핵심 사항:

* **세 가지 입력 모드는 상호 배타적입니다**: 첫 프레임/마지막 프레임(이미지 2장, `first_frame` / `last_frame`), 첫 프레임(이미지 1장), 멀티모달 참조(`reference_image` / `reference_video` / `reference_audio`). 참조 동영상이나 참조 오디오가 있는 즉시 모든 이미지는 `reference_image`이어야 합니다.
* **`role`이 없으면 첫 프레임을 의미합니다**: `role`이 없는 단일 이미지는 `first_frame`과 동일합니다.
* prompt에서는 전달된 순서대로 항목을 참조하십시오(예: `@image1` 및 `@video1`).
* 참조 제한: 2.0 시리즈의 경우 최대 이미지 9장 + 동영상 3개 + 오디오 클립 3개이며, 2.5의 경우 최대 이미지 30장 + 동영상 10개 + 오디오 클립 10개입니다.

## 참조 동영상 전달 방법

제공업체는 **자체 서버에서** 미디어를 다운로드하므로, 동영상은 제공업체가 직접 접근할 수 있는 주소에 있어야 합니다.

| 방식 | 지원 여부 | 참고 사항 |
| - | - | - |
| **공개 직접 URL**(권장) | ✅ | 로그인, 쿠키 또는 추가 헤더가 필요하지 않은 오브젝트 스토리지나 CDN(OSS, S3, R2, TOS 등)에 호스팅하고, 작업이 완료될 때까지 유효한 상태를 유지하십시오 |
| **에셋 ID** `asset://...` | ✅ | 동일한 동영상을 재사용하거나 실제 인물이 등장할 때 사용합니다. 에셋은 mp4 / mov 형식이어야 하며, 2\~15초 길이, 50MB 미만이어야 합니다. [에셋 라이브러리](/ko/api-capabilities/seedance2/asset-library)를 참조하십시오 |
| **Base64** | ⚠️ 권장하지 않음 | 동영상은 이미지보다 훨씬 크기 때문에 요청 본문에 인라인으로 포함하면 제출 시 시간 초과가 발생하기 가장 쉽습니다. [에셋 우선 워크플로](/ko/api-capabilities/seedance2/asset-first-workflow)를 참조하십시오 |
| 로컬 컴퓨터의 경로(`/assets/...`, `C:\...`, `file://...`) | ❌ | 제공업체는 사용자의 컴퓨터에 있는 파일을 읽을 수 없습니다 |
| 사설 네트워크 주소(`localhost`, `127.0.0.1`, `192.168.x.x`) | ❌ | 위와 동일합니다 |
| 다운로드 시 로그인이 필요한 링크 | ❌ | 제공업체는 리소스를 가져올 때 사용자의 로그인 세션을 전달하지 않습니다 |

제출하기 전에 인터넷 접속이 가능한 모든 컴퓨터에서 링크를 확인할 수 있습니다(`<URL>`을(를) 동영상 링크로 대체하십시오):

```bash theme={null}
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'
```

`code=200`, `video/mp4` 또는 `video/quicktime`인 `type`, 그리고 원본 파일과 일치하는 `size`이 표시되어야 합니다. HTML 페이지, JSON 본문 또는 임의의 4xx는 제공업체가 해당 링크를 사용할 수 없음을 의미합니다. 이미지 링크에 대한 전체 확인 방법은 [이미지 링크는 열리지만 실패하는 경우](/ko/faq/seedance-image-url-invalid-format)를 참조하십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="동영상 생성 API" icon="video" href="/ko/api-capabilities/seedance2/video-generation">
    네이티브 엔드포인트와 각 입력 모드별 콘텐츠 레이아웃 및 역할 값
  </Card>

  <Card title="에셋 우선 워크플로" icon="gauge" href="/ko/api-capabilities/seedance2/asset-first-workflow">
    참조 동영상을 Base64로 전송해서는 안 되는 이유와 에셋 등록 방법
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.