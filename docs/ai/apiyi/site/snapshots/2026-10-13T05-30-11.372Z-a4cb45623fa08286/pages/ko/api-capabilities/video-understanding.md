> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 동영상 이해 API

> Gemini, Seed (Doubao), Qwen, Kimi 등을 활용해 동영상을 분석합니다 — 콘텐츠 인식, 장면 설명, 동작 분석 및 타임스탬프 참조. 19개 모델에 대해 검증된 지원 목록, 범용 video_url 포맷, 제공업체별 입력 제한 및 동영상을 지원하지 않는 모델 정보를 포함합니다.

APIYI의 여러 모델 제품군은 동영상을 "시청"할 수 있습니다. 단일 prompt만으로 모델이 장면, 동작, 화면 텍스트를 인식하고 타임스탬프별로 주요 순간을 참조할 수 있습니다. Gemini 외에도 **Seed (Doubao) 전 제품군, Qwen의 비전 및 omni 모델, Kimi K3**가 모두 테스트를 통과했습니다. 이 페이지에서는 지원 목록, 범용 요청 형식, 그리고 혼동하기 쉬운 제한 사항을 다룹니다.

<Note>
  **먼저 다음 세 가지 사항을 확인하십시오**:

  1. **범용 형식은 `video_url`입니다**: `{"type": "video_url", "video_url": {"url": "data:video/mp4;base64,..."}}` 형식은 Seed, Qwen, Kimi, MiniMax 및 Gemini에서 작동합니다. 이 페이지의 이전 버전에 안내되었던 기존 `image_url` + `data:video/mp4` 형식은 **Gemini에서만 작동**하며, 그 외 다른 모든 모델에서는 400을 반환합니다.
  2. **GPT, Grok, Claude, GLM 및 DeepSeek는 동영상 입력을 지원하지 않습니다.** GPT와 GLM은 **동영상을 자동으로 제외**한 채 200을 반환하며, GPT는 그럴듯한 답변을 지어낼 수도 있습니다 — "동영상을 지원하지 않는 모델"을 참조하십시오.
  3. **Gemini는 일반 공개 동영상 URL을 직접 지원하지 않습니다**: `Request contains an invalid argument`을 반환하거나, 동영상이 자동으로 제외된 채(`prompt_tokens`가 수십 개에 불과함) 200을 반환하여 동영상을 볼 수 없다고 답변하거나 검은 화면으로 묘사할 수 있습니다. 반면 Seed, Qwen, Kimi는 공개 https URL을 직접 수신할 수 있습니다.
</Note>

<CardGroup cols={2}>
  <Card title="시각적 API 테스트" icon="flask-conical" href="https://icover.ai/video-understanding">
    iCover 시각적 테스트 도구에서 동영상을 업로드하고 이해 엔드포인트를 테스트해 보십시오.
  </Card>
</CardGroup>

## AI 에이전트를 통한 연동

<Note>
  Codex / Claude Code / Cursor로 개발하시는 경우, 아래 prompt를 복사하여 에이전트에 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져온 후(임의의 문서 URL 뒤에 `.md` 추가), 프로젝트 고유의 기술 스택에 맞춰 코드를 작성합니다. 범용 `video_url` 형식, **Gemini의 공개 URL 사용 불가 규칙 및 20 MB 제한**, 그리고 **동영상이 실제로 모델에 전달되었는지 확인하기 위한 `prompt_tokens` 확인** 절차가 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트를 통해 동영상 이해(Gemini / Seed / Qwen / Kimi) 기능을 연동하거나 문제를 해결합니다. Codex, Claude Code, Cursor 및 유사 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 동영상 이해 기능을 연동/문제 해결하십시오: 요약, 장면 설명, 동작 분석 또는 타임스탬프 참조를 위해 멀티모달 모델에 동영상을 전송합니다.

  코드를 작성하기 전에 문서를 먼저 확인하십시오: 이 페이지의 일반 텍스트 버전을 보려면 [https://docs.apiyi.com/en/api-capabilities/video-understanding.md](https://docs.apiyi.com/en/api-capabilities/video-understanding.md) 를 가져오십시오. YouTube 링크의 경우 동일한 `.md` 접미사를 붙여 gemini/native 페이지도 함께 확인하십시오.

  요구사항:

  1. 엔드포인트 및 형식: OpenAI 호환 `POST https://api.apiyi.com/v1/chat/completions`을 사용하고, 텍스트 블록 옆 `messages[].content` 내부에 동영상을 항상 `{"type": "video_url", "video_url": {"url": ...}}` 형식으로 전달하십시오. **기존 `image_url` + `data:video/mp4` 형식은 사용하지 마십시오**(Gemini만 지원하며 다른 모든 모델은 400을 반환합니다). **또한 Responses 엔드포인트에서 `input_video`을 사용하지 마십시오**. 이는 동기 호출이므로 폴링이 필요하지 않습니다.

  2. 모델 선택: 기본값으로 `gemini-3.8-flash`을 사용하십시오(동영상 tokens 소모가 가장 적고 YouTube 링크 지원). 정밀한 타임스탬프가 필요하거나 동영상이 이미 공개 URL에 있는 경우에는 `seed-2-0-pro-260328`을 사용하십시오. 대량의 저비용 작업에는 `qwen3.8-flash` 또는 `seed-2-0-mini-260428`을 고려하십시오. **GPT, Grok, Claude, GLM, DeepSeek는 동영상을 지원하지 않습니다** — GPT와 GLM은 동영상을 조용히 누락하고도 200을 반환하며, GPT는 거짓 답변을 지어내므로 선택하지 마십시오. 꼭 필요하다면 로컬에서 프레임을 추출하여 여러 이미지로 전송하십시오. `MiniMax-M3`는 타임스탬프가 부정확하므로 타임스탬프가 중요할 때는 사용하지 마십시오. 모델 이름은 설정 가능하도록 구성하십시오.

  3. 동영상 전송 방법: **Gemini는 Base64 data URI만 지원하며**(`data:video/mp4;base64,...`), **전체 요청 본문 크기는 20 MB 미만이어야 합니다**(Base64로 인코딩하면 약 1/3 증가하므로 원본 파일 크기는 대략 14 MB 이하로 제한하십시오). **공개 URL은 지원하지 않으며**(동영상이 누락되어 모델이 동영상을 볼 수 없다고 응답하거나 검은 화면으로 설명할 수 있음), **`files.upload`은 지원되지 않습니다**. YouTube 링크는 Gemini 네이티브 형식(`google-genai` SDK, base\_url `https://api.apiyi.com`)을 통해서만 작동합니다. 프로젝트에서 이미 해당 SDK를 사용 중이라면 Base64 동영상도 `Part.from_bytes`을 통해 네이티브 형식으로 전송할 수 있으므로, OpenAI 호환 형식으로 전환할 필요가 없습니다. Seed / Qwen / Kimi는 공개 https URL을 직접 전달받을 수 있지만 제공업체에서 해당 URL에 접근할 수 있어야 합니다. 확실하지 않은 경우 Base64부터 먼저 작동하도록 구현하십시오. 용량이 초과된 동영상은 ffmpeg으로 압축하거나 잘라낸 후 H.264 mp4 형식으로 변환하십시오.

  4. **동영상이 모델에 실제로 전달되었는지 확인**: 매 응답마다 `usage.prompt_tokens`을 확인하십시오. 10초 분량의 540p 영상 클립은 Gemini에서 약 700 tokens, Seed / Qwen에서 약 5,000 tokens, Kimi에서 약 14,000 tokens입니다(다른 해상도에서는 대략 ±30% 차이가 발생할 수 있으며, 자릿수 정도만 중요합니다). **수십 tokens에 불과하다면 동영상이 누락된 것입니다** — 모델의 답변을 사용하는 대신 오류를 발생시키십시오.

  5. **모델이 질문에 맞추어 답변을 지어내지 않도록 방지**: 입력이 잘못되었을 때(잘못된 파일, 검은색/회색 화면으로 디코딩된 동영상, 연동 과정의 임시 이미지 등) prompt가 특정 내용을 전제하고 있으면 Gemini는 `prompt_tokens`이 완전히 정상으로 보이는데도 존재하지 않는 내용을 지어내는 경향이 있습니다. 입력을 직접 제어할 수 없는 배치 파이프라인의 경우, 먼저 “받은 내용을 설명해 주세요”와 같은 중립적인 질문을 던져 입력을 확인한 뒤 구체적인 질문을 하십시오.

  6. 타임스탬프: prompt에서 구간을 `MM:SS` 형태로 참조하고, 출력으로 `MM:SS`을 요청하십시오. Seed에서는 더 조밀한 샘플링(더 많은 tokens 소모)을 위해 `video_url` 내부에 `"fps": 2`을 추가할 수 있으며, 다른 모델은 이 필드를 무시합니다.

  7. 타임아웃 및 비용: 대기 시간은 동영상 길이에 비례하여 증가하므로(테스트 시 10초 클립에 4\~30초 소요), 클라이언트 타임아웃을 최소 300초 이상으로 설정하십시오. 과금은 token 단위로 이루어지며, 동영상 비용은 초당 Gemini 기준 약 70 tokens, Seed / Qwen 기준 약 500 tokens, Kimi 기준 약 1,400 tokens입니다. 이를 기반으로 비용을 추정하고, 길이가 긴 동영상은 전송 전에 필요한 구간으로 잘라내십시오.

  8. 키는 `APIYI_API_KEY` 환경 변수에서 읽어오십시오 — 절대로 하드코딩하거나 git에 커밋하지 마십시오.

  9. 작성이 완료되면 실제로 한 번 실행해 보십시오: 약 10초 분량의 짧은 클립을 전송하고 모델의 답변, `usage.prompt_tokens`, 그리고 해당 호출의 비용을 보여주십시오.
</Prompt>

<Accordion title="이 prompt가 방지해 주는 문제점들">
  | 요구사항 | 방지하는 함정 |
  | - | - |
  | 항상 `video_url` 사용 | 일반적으로 쓰이는 `image_url` + `data:video/mp4` 형식은 Gemini에서만 작동합니다. 모델을 변경하면 400 오류가 발생합니다. |
  | GPT / Grok / Claude / GLM 제외 | GPT와 GLM은 동영상을 조용히 누락하고도 200을 반환하며, GPT는 그럴듯한 답변을 지어내기까지 합니다. |
  | Gemini: Base64만 지원, 본문 20 MB 미만 | 공개 URL은 조용히 누락되거나(모델이 동영상을 볼 수 없다고 하거나 검은 화면으로 설명함) `invalid argument`을 반환하며, `files.upload`은 서드파티에서 사용할 수 없습니다. |
  | `usage.prompt_tokens` 확인 | 동영상이 누락되면 수십 tokens 정도로만 나타납니다 — 이는 코드에서 감지할 수 있는 유일한 신호입니다. |
  | 먼저 중립적인 질문하기 | 잘못된 입력이 주어지면 Gemini는 prompt를 그대로 따라 답변을 지어내며, token 수는 정상으로 보입니다. |
  | 타임아웃 300초 이상 설정 | 긴 동영상, Kimi 및 thinking 모델은 몇 배 더 오래 걸리므로, 기본 타임아웃 설정을 사용하면 결과를 받기 전에 연결이 끊어집니다. |
</Accordion>

## 지원 모델

본 결과는 2026-10-11 (UTC+8)에 진행된 테스트를 기반으로 합니다. 2.5초마다 다른 숫자와 도형이 나타나는 동일한 10초 테스트 동영상을 모든 모델에 전송한 후, 각 타임스탬프와 함께 숫자를 순서대로 나열하도록 하였습니다. 동영상을 실제로 보지 않고 생성된 답변을 배제하기 위해 빈 이미지를 대조군으로 사용했습니다.

| 제공업체 | 모델 ID | 측정된 지연 시간 | 10초 클립 입력 tokens | 주요 특징 | 추천 용도 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 4–9 s | \~700 | 3.5 Flash의 절반 단가로 가장 적은 동영상 token 소모, YouTube 링크 지원 | 일상적인 동영상 분석, YouTube 콘텐츠 |
| Google | `gemini-3.1-pro-preview` | — | — | Google 최강의 추론 + 멀티모달 | 복잡하고 긴 동영상의 심층 분석 |
| Google | `gemini-3.1-flash-lite` | — | — | 초저가 및 초저지연 | 대규모 고 동시 실행 수 워크로드 |
| ByteDance | `seed-2-0-pro-260328` 🔥 | 8–10 s | \~5,000 | 가장 정확한 타임스탬프, `fps`로 샘플링 제어 | Gemini 외 최우선 추천, 정밀한 타임스탬프 |
| ByteDance | `dola-seed-2-1-turbo-260628` | 16–28 s | \~5,000 | Thinking 기본 활성화 — 더 상세하지만 지연 시간 증가 | 추론이 필요한 동영상 Q\&A |
| ByteDance | `seed-2-0-lite-260428` | \~14 s | \~5,000 | 균형 잡힌 성능 | 일반 분석 |
| ByteDance | `seed-2-0-mini-260428` | \~5 s | \~5,000 | 가장 저렴하고 빠른 Seed 모델 | 대량 태깅, 1차 필터링 |
| ByteDance | `seed-1-8-251228` | \~6 s | \~5,000 | 이전 세대 안정화 모델 | 기존 워크로드 |
| Alibaba | `qwen3.8-flash` | 8–12 s | \~5,300 | 극도로 저렴한 가격 | 대량의 비용 민감형 작업 |
| Alibaba | `qwen3.8-max` | 14–16 s | \~5,300 | 플래그십 추론 | 복잡한 동영상 Q\&A |
| Alibaba | `qwen3-vl-plus` | \~4 s | \~5,200 | 전용 비전 모델, 빠른 속도 | 인식 및 OCR 작업 |
| Alibaba | `qwen3.5-omni-plus` | \~4 s | \~5,200 | 옴니모달 | 시청각 통합 이해 |
| Moonshot | `kimi-k3` | 14–30 s | \~14,000 | 정확하지만 타 모델 대비 약 3배의 동영상 tokens 소모 | 비용보다 분석 수준이 중요한 심층 분석 |
| MiniMax | `MiniMax-M3` | \~5 s | \~3,700 | ⚠️ 콘텐츠 순서는 맞추지만 **타임스탬프 오류** (3회 테스트 모두 처음 2초 내로 압축됨) | 타임스탬프가 필요 없는 콘텐츠 전용 작업 |

이전 버전인 `gemini-3.7-flash` 및 `gemini-3.5-flash`뿐만 아니라, 안정적인 클래식 모델인 `gemini-2.5-pro`(2M context) 및 `gemini-2.5-flash`도 계속 사용할 수 있습니다. 테스트 결과 3.8 Flash는 3.5 Flash의 절반 수준인 입력 가격으로 정확히 동일한 동영상 tokens(10초 기준 약 713 tokens)를 소모했습니다. 지연 시간 및 token 수치는 상기 10초 540p 테스트 클립 기준이며, 더 길거나 해상도가 높은 동영상은 대략 비례하여 증가합니다. 실제 지연 시간은 엔드포인트 및 제공업체 측의 대기열 상황에 따라서도 달라지므로 동일한 클립이라도 2\~3배 차이가 날 수 있습니다.

<Note>모델 가격은 공식 사이트와 연동되어 변동될 수 있습니다. 위 표는 참고용일 뿐이며 상단 내비게이션의 **모델 가격** 탭을 기준으로 합니다: [모델 가격](/en/models/index).</Note>

### 동영상을 지원하지 않는 모델

| 모델 | 동영상 전송 시 동작 |
| - | - |
| OpenAI `gpt-6-sol` / `gpt-6-luna` / `gpt-5.6-terra` 등 | chat 엔드포인트는 **200을 반환하지만 동영상을 누락**하며(`prompt_tokens` 수치가 수십 개에 불과함), Responses 엔드포인트는 `input_video` 요청을 명시적으로 거절함 |
| xAI `grok-4.7` / `grok-4.5` 등 | 오류: `unsupported message content type` |
| Anthropic Claude (전체 모델) | 동영상 입력 미지원 |
| Zhipu `glm-5.3` | 200을 반환하지만 동영상을 누락하며, 동영상을 받지 못했다고 모델이 응답함 |
| `deepseek-v4-flash-vision-exp` | 오류: `unknown variant video_url` (이미지만 지원) |

<Warning>
  **동영상이 누락된 후 GPT가 답변을 지어낼 수 있습니다**: 테스트 결과 `gpt-6-sol` 모델은 3회 테스트 모두 동영상에 없는 숫자 시퀀스를 지어냈으며, 런던 거리 풍경을 “튜브가 있는 수영장”으로 묘사하기도 했습니다. 이러한 모델을 꼭 사용해야 한다면 아래의 “프레임을 이미지로 변환” 방식을 사용하십시오.
</Warning>

## 동영상 입력 방식

| 입력 방식 | Gemini | Seed / Qwen / Kimi / MiniMax |
| - | :-: | :-: |
| **`video_url` + Base64** (`data:video/mp4;base64,...`) | ✅ | ✅ |
| **`video_url` + 공개 https URL** | ❌ Google은 일반 URL을 거부합니다 | ✅ 제공업체 측에서 해당 URL에 접근할 수 있어야 합니다 |
| **`image_url` + `data:video/mp4`** (이전 형식) | ✅ | ❌ 400을 반환합니다 |
| **YouTube 링크** | ✅ Gemini 네이티브 형식 전용 | ❌ |
| **Files API** (`files.upload`) | ❌ 공식 Google 엔드포인트 전용 | ❌ |

<Warning>
  **Gemini의 20 MB 제한**: Base64를 사용할 경우 인코딩된 동영상을 포함한 전체 요청 본문 크기가 20 MB 미만이어야 합니다. 용량이 더 큰 동영상의 경우 ① YouTube 링크를 사용하거나, ② 인코딩 전 로컬에서 동영상을 압축 또는 트리밍하여 20 MB 이하로 줄이거나, ③ Seed / Qwen으로 전환하여 공개 URL을 직접 전달하십시오.
</Warning>

<Tip>
  **제공업체가 URL을 가져올 수 있어야 합니다**: 동영상은 모델 제공업체에서 다운로드하므로 해당 주소는 제공업체 측에서 접근할 수 있어야 합니다. 테스트 결과 Volcengine 오브젝트 스토리지의 URL은 Seed, Qwen, Kimi 및 MiniMax에서 정상 작동했으나, Google Cloud Storage URL은 Seed에서 403을 반환했습니다. 확실하지 않은 경우 먼저 Base64가 정상 작동하는지 확인한 다음 URL 방식으로 전환하십시오.
</Tip>

## 빠른 시작: 범용 형식 (`video_url`)

Seed, Qwen, Kimi, MiniMax 및 Gemini에서 작동합니다.

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="seed-2-0-pro-260328",       # or qwen3.8-flash / kimi-k3 / gemini-3.8-flash, etc.
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this video in detail and give timestamps for the key moments"},
            {
                "type": "video_url",
                "video_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                # or pass a public URL directly (not on Gemini): {"url": "https://your-bucket.example.com/demo.mp4"}
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

동일한 curl 호출 예시입니다(`<BASE64_VIDEO>`을 동영상의 base64 문자열로 대체하거나, `url` 전체를 공개 주소로 대체하십시오):

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seed-2-0-pro-260328",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Summarize this video"},
        {"type": "video_url",
         "video_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"}}
      ]
    }]
  }'
```

<Tip>
  **Seed에서는 샘플링 레이트를 조정할 수 있습니다**: 빠른 움직임을 더 자세히 살펴보려면 `video_url` 내부에 `"fps": 2`을 추가하십시오(자체 테스트 결과, 10초 분량의 클립에서 입력 tokens가 약 4,900개에서 약 6,200개로 증가했습니다). Qwen과 Kimi는 이 필드를 무시합니다.
</Tip>

## Gemini 전용 형식

### Base64 인라인 (레거시 `image_url` 형식)

Gemini는 위의 `video_url` 형식과 아래의 `image_url` 형식을 모두 지원하므로 기존 코드가 계속 작동합니다. **새 코드에서는 모델을 자유롭게 전환할 수 있도록 `video_url`을(를) 사용하십시오**.

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this video in detail"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)
```

### Base64 인라인 (Gemini 네이티브 형식)

프로젝트에서 이미 Google의 공식 `google-genai` SDK를 사용하고 있다면 OpenAI 호환 형식으로 전환할 필요가 없습니다. `base_url`이(가) `https://api.apiyi.com`을(를) 가리키도록 설정하고 `Part.from_bytes`(으)로 동영상을 인라인 처리하십시오. 위와 마찬가지로 전체 요청 본문은 20 MB 미만을 유지해야 합니다.

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        types.Part(text="Describe this video in detail and mark the timestamps of key moments"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # includes a VIDEO entry when the video reached the model
```

REST 방식: Base64 문자열은 길이가 길기 때문에 명령줄 인수에 직접 붙여넣지 마십시오. 먼저 JSON 파일로 저장한 다음 `-d @req.json`(으)로 전송하십시오.

```bash theme={null}
# Build the request body (macOS / Linux)
printf '{"contents":[{"parts":[{"inline_data":{"mime_type":"video/mp4","data":"%s"}},{"text":"Summarize this video"}]}]}' \
  "$(base64 < demo.mp4 | tr -d '\n')" > req.json

curl "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **네이티브 형식을 사용하면 동영상이 모델에 도달했는지 확인하기가 더 쉽습니다**: 응답의 `usageMetadata.promptTokensDetails`은(는) 입력을 모달리티별로 구분하여 표시합니다. 당사의 10초짜리 테스트 클립은 OpenAI 호환 형식과 동일한 총합인 `VIDEO` 660과 소수의 `TEXT` tokens로 반환되었습니다. `VIDEO` 항목이 없다면 동영상이 수신되지 않은 것입니다.
</Tip>

### YouTube 링크 (Gemini 네이티브 형식)

YouTube 링크는 다운로드가 필요하지 않으며 20 MB 제한의 적용을 받지 않지만, **Gemini 네이티브 형식을 통해서만 작동합니다**(`google-genai` SDK, 엔드포인트 `https://api.apiyi.com`).

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="Summarize the main content and key information in this video"),
    ]),
)

print(response.text)
```

<Info>
  네이티브 형식의 추가 기능(스트리밍, thinking budget, 함수 호출 등)에 대해서는 [Gemini 네이티브 형식](/ko/api-capabilities/gemini/native)을 참조하십시오.
</Info>

## 동영상을 지원하지 않는 모델: 프레임을 이미지로 전송

GPT 및 Grok과 같은 이미지 전용 모델의 경우, 로컬에서 일정한 간격으로 프레임을 추출하여 여러 이미지로 전송합니다. 자체 테스트 결과 `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-terra`, `grok-4.7` 및 `grok-4.5` 모두 4개의 프레임에서 내용과 순서를 정확하게 설명했습니다. 트레이드오프: **오디오와 프레임 간의 움직임이 손실**되며, 프롬프트에 시간 정보를 직접 명시해야 합니다.

```python theme={null}
import base64, subprocess, glob

# Extract one frame every 2 seconds (requires ffmpeg installed locally)
subprocess.run(["ffmpeg", "-i", "demo.mp4", "-vf", "fps=0.5", "frame-%02d.jpg"], check=True)

frames = []
for path in sorted(glob.glob("frame-*.jpg")):
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    frames.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})

response = client.chat.completions.create(
    model="gpt-6-sol",
    messages=[{
        "role": "user",
        "content": [{"type": "text", "text": "These are frames taken every 2 seconds from one video, in time order. Describe the video."}] + frames,
    }],
)
```

## 고급 팁

### 타임스탬프 참조

`MM:SS`를 사용하여 prompt에서 세그먼트를 직접 참조할 수 있습니다. 이는 순수한 프롬프팅 기법이며 동영상을 지원하는 모든 모델에서 작동합니다:

```text theme={null}
Describe what happens between 00:30 and 01:15, and tell me what text appears at 02:40.
```

정확한 타임스탬프가 중요한 경우 Seed 또는 Qwen을 사용하는 것이 좋습니다. 자체 테스트 결과 MiniMax-M3의 타임스탬프는 신뢰할 수 없었습니다.

### 답변을 신뢰할 수 없는 두 가지 경우

**① 동영상이 모델에 도달하지 않은 경우**: 응답의 `usage.prompt_tokens`를 확인하십시오. 10초 분량의 클립은 Seed / Qwen에서 약 5,000 tokens, Gemini에서 약 700 tokens입니다. **단 수십 tokens에 불과하다면 동영상이 누락된 것이며**(GPT 및 GLM에서 발생하거나 Gemini에 공개 URL을 제공했을 때 발생하는 현상입니다), 이 답변은 신뢰할 수 없습니다. 모델이 아무것도 볼 수 없다고 반드시 말하는 것은 아닙니다. 공개 URL이 제공된 경우 Gemini는 누락된 동영상을 "완전히 검은 화면"으로 설명하고, GPT는 존재하지 않는 콘텐츠를 지어냅니다.

**② 입력이 잘못되었고 prompt가 특정 내용을 전제하는 경우**: 예를 들어 잘못된 파일이 전송되었거나, 동영상이 검은색 또는 회색 화면으로 디코딩되었거나, 연동 과정에서 플레이스홀더 이미지가 사용된 경우입니다. 이 경우 `prompt_tokens`는 완전히 정상적으로 보이므로 token 수로는 이를 감지할 수 없습니다.

<Warning>
  **Gemini 모델은 ②의 경우 질문의 의도에 맞춰 답변을 지어내는 경향이 있습니다.** 자체 테스트에서 동영상을 빈 이미지로 대체해 보았습니다:

  * 중립적으로 질문했을 때("받은 내용을 설명하세요"), Gemini 3.8 Flash / 3.5 Flash / 3.1 Pro / 3.1 Flash Lite는 12회 실행 모두에서 빈 이미지라고 올바르게 답변했습니다. 즉, **이미지 이해 자체에는 문제가 없습니다**;
  * 그러나 질문이 특정 내용을 전제하는 순간("동영상에 어떤 숫자가 순서대로 나타납니까", 또는 심지어 "숫자가 있습니까? 없다면 없다고 말하세요"), 3.5 Flash / 3.1 Pro / 3.1 Flash Lite는 18회 중 12회에서 존재하지 않는 숫자를 지어냈습니다;
  * 더 최신인 `gemini-3.8-flash`는 분명히 개선되었지만 완전히 해결되지는 않았습니다. 동일한 유도 질문에 대해 7회 중 2회에서 여전히 답변을 지어냈습니다;
  * 동일한 질문을 받았을 때 Seed, Qwen 및 Kimi는 모두 보이지 않는다거나 아무것도 없다고 올바르게 답변했습니다.

  실제 동영상에 대한 인식에는 영향이 없습니다. 입력을 직접 제어할 수 없는 배치 파이프라인의 경우, **먼저 중립적인 질문을 던져 모델이 무엇을 보고 있는지 설명하게 함으로써 입력이 올바른지 확인한 후 구체적인 질문을 하거나**, Seed / Qwen을 사용하십시오.
</Warning>

### 일반적인 작업을 위한 prompt 아이디어

코드를 변경할 필요 없이 prompt만 변경해도 동일한 동영상으로 완전히 다른 분석을 수행할 수 있습니다:

* **콘텐츠 요약**: 주제, 핵심 장면 및 시사점을 3\~5개 문장으로 요약
* **강의 분석**: 핵심 개념, 챕터 구분 및 중요한 타임스탬프 추출
* **보안 감시 검토**: 이상 행동, 나타난 사람/물체 및 등장 시점 표시
* **마케팅 검토**: 제품 셀링 포인트의 표현 방식, 템포 및 타깃 고객 적합도 평가
* **동작 분석**: 동작 단계 세분화, 자세 교정 포인트 및 개선점 도출

## 기술 참고 사항

* **Gemini**: 기본적으로 **초당 1프레임**으로 샘플링하며 오디오 트랙도 함께 처리합니다. Gemini 3.x는 기본적으로 프레임을 저해상도로 계산하며, 자체 테스트 결과 **초당 약 70 tokens**가 소모됩니다.
* **Seed / Qwen**: 자체 테스트 기준(540p 동영상) **초당 약 500 tokens**이며, Seed의 샘플링은 `fps`(으)로 조정할 수 있습니다.
* **Kimi K3**: 자체 테스트 기준 **초당 약 1,400 tokens**가 소모되므로, 긴 동영상은 비용이 눈에 띄게 더 발생합니다.
* **지원 형식**: mp4, mov, webm 등 일반적인 형식을 지원하며, H.264 mp4로 변환하면 가장 뛰어난 호환성을 제공합니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="GPT, Grok 또는 Claude가 동영상을 이해할 수 있습니까?">
    불가능합니다. Claude와 Grok은 즉시 오류를 반환하며, GPT의 chat 엔드포인트는 **동영상을 알림 없이 누락한 채** 200을 반환하므로 모델이 답변을 지어낼 수 있습니다. 해당 모델들을 사용해야 하는 경우 먼저 프레임을 추출하여 이미지로 전송하십시오. 자세한 내용은 "동영상을 지원하지 않는 모델: 프레임을 이미지로 변환"을 참고하시기 바랍니다.
  </Accordion>

  <Accordion title="어떤 중국 모델이 동영상 이해를 지원합니까?">
    테스트를 통과한 모델: 전체 Seed 제품군(`seed-2-0-pro-260328`, `dola-seed-2-1-turbo-260628`, `seed-2-0-lite-260428`, `seed-2-0-mini-260428`, `seed-1-8-251228`), Qwen의 `qwen3.8-max`, `qwen3.8-flash`, `qwen3-vl-plus`, `qwen3.5-omni-plus` 및 `kimi-k3`입니다. `MiniMax-M3`은(는) 내용은 인식하지만 타임스탬프가 올바르지 않습니다. `glm-5.3` 및 `deepseek-v4-flash-vision-exp`은(는) 동영상을 지원하지 않습니다.
  </Accordion>

  <Accordion title="모델을 변경하면 동일한 코드에서 400 오류가 반환됩니까?">
    Gemini만 지원하는 기존 `image_url` + `data:video/mp4` 형식을 사용하고 계실 가능성이 높습니다. `{"type": "video_url", "video_url": {"url": ...}}`(으)로 변경하면 모든 제공업체에서 정상 작동합니다.
  </Accordion>

  <Accordion title="Gemini가 동영상에 없는 내용을 설명합니까?">
    먼저 입력 자체에 문제가 없는지 확인하십시오(검은 화면, 빈 프레임, 잘못된 파일이 아닌지 확인). 테스트 결과, 입력이 잘못되었는데 질문에서 특정 내용을 전제하는 경우 Gemini는 질문에 맞춰 답변을 지어내는 경향이 있었습니다. 문제를 해결하려면 "수신한 내용을 설명해 주세요"와 같은 중립적인 prompt로 변경하여 해당 동영상을 설명하는지 확인하십시오. 자세한 내용은 "답변을 신뢰할 수 없는 두 가지 경우"를 참고하시기 바랍니다.
  </Accordion>

  <Accordion title="공개 동영상 URL에서 Request contains an invalid argument / fetch failed 오류가 반환되는 경우">
    Gemini는 **임의의 공개 URL을 지원하지 않으며**(예: `https://example.com/video.mp4`), 이는 APIYI의 차단이 아닙니다. Gemini에서는 인라인 base64(20MB 미만) 또는 YouTube 링크를 대신 사용하거나, 공개 URL을 직접 가져올 수 있는 Seed / Qwen으로 전환하십시오. `/v1/chat/completions`에서는 항상 오류가 발생하는 것은 아닙니다. 200을 반환하면서 모델이 검은 화면이 보인다고 주장할 수 있으며, 이 경우 `prompt_tokens`은(는) 수십 개에 불과하여 결과를 사용할 수 없습니다.
  </Accordion>

  <Accordion title="Gemini는 왜 요청 크기를 20MB로 제한합니까? 이전에는 작동했습니다.">
    인라인 base64를 사용할 경우, Gemini는 항상 전체 요청 본문을 20MB로 제한해 왔습니다(Google의 공식 제한과 동일). "이전에는 작동했다"고 한 것이 공개 URL이었다면, 이는 한 번도 공식 지원된 방식이 아니었습니다. 일부 경우에 우연히 오류가 발생하지 않았을 뿐이며, 현재는 명시적으로 거부됩니다.
  </Accordion>

  <Accordion title="대용량 동영상에 files.upload를 사용할 수 있습니까?">
    불가능합니다. Gemini의 공식 Files API(`client.files.upload()`)는 **서드파티 엔드포인트에서 지원되지 않으며**, Google 자체 엔드포인트에서만 지원됩니다. 대용량 동영상의 경우 YouTube 링크를 사용하거나, base64용으로 20MB 미만으로 압축하거나, 공개 URL과 함께 Seed / Qwen으로 전환하십시오.
  </Accordion>

  <Accordion title="20MB를 초과하는 동영상은 어떻게 처리합니까?">
    세 가지 방법이 있습니다: ① YouTube에 업로드하고 링크를 전달합니다(Gemini 네이티브 형식). ② ffmpeg 등의 도구를 사용하여 핵심 구간을 20MB 미만으로 압축하거나 잘라낸 후 base64로 인코딩합니다. ③ 공개적으로 접근 가능한 객체 스토리지에 동영상을 호스팅하고 Seed / Qwen에 URL을 전달합니다.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="모델 요금 안내" icon="list" href="/en/models/index">
    모든 모델 및 최신 요금 정보
  </Card>

  <Card title="Gemini 네이티브 포맷" icon="sparkles" href="/ko/api-capabilities/gemini/native">
    YouTube 링크, 스트리밍, thinking budget 및 다양한 네이티브 기능
  </Card>

  <Card title="비전 이해 API" icon="image" href="/ko/api-capabilities/vision-understanding">
    이미지 콘텐츠 인식 및 멀티모달 분석
  </Card>

  <Card title="Qwen3.8-Max" icon="brain" href="/ko/api-capabilities/qwen-3-8/overview">
    네이티브 이미지 및 동영상 입력을 지원하는 Qwen 플래그십 모델
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.