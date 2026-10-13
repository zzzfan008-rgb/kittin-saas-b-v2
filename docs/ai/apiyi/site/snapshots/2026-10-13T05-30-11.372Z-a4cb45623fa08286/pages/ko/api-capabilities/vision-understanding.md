> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 비전 이해(이미지 인식) API

> Gemini, GPT, Claude, Seed (Doubao), Qwen, Kimi 등을 통해 이미지를 인식합니다(OCR, 계수, 장면 설명 및 다중 이미지 비교). 검증된 24개 모델 목록, 이미지당 tokens, 4가지 요청 형식(OpenAI 호환 / Responses / Anthropic / Gemini 네이티브)별 지원 모델, 이미지 크기 초과 및 이미지 URL과 같은 일반적인 오류를 함께 안내합니다.

APIYI의 대부분의 주요 대화형 모델은 이미지를 "볼" 수 있습니다. 텍스트 추출(OCR), 객체 수 세기, 장면 묘사, 여러 이미지 비교 등의 작업이 가능합니다. 이 페이지에서는 2026-10-11 (UTC+8) 테스트 기준 지원 목록, 이미지 1장당 소모되는 token 수, 네 가지 요청 형식별로 지원되는 모델, 그리고 가장 흔히 발생하는 오류를 안내합니다.

<Note>
  **먼저 다음 세 가지 사항을 확인하십시오**:

  1. **범용 형식은 OpenAI 호환 `image_url`입니다**: 테스트한 22개 비전 모델 전체에서 `{"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}` 방식으로 정상 작동했습니다. Responses 및 Anthropic 형식은 **일부 모델만 지원**하므로, "각 형식이 지원하는 모델" 항목을 참조하십시오.
  2. **`deepseek-v4-pro` 및 `glm-5.3`과 같은 텍스트 전용 모델은 이미지를 지원하지 않습니다**: 요청 시 200이 반환되지만 이미지는 무시되며, 모델은 이미지를 볼 수 없다고 응답합니다. 이미지가 모델에 전달되었는지 확인하려면 응답의 `usage.prompt_tokens`를 확인하십시오.
  3. **base64 사용을 권장합니다**: 공개 URL을 사용하는 경우 제공업체 측에서 이미지를 다운로드해야 하므로, 호스트 서버가 느리거나 핫링크 방지가 적용되어 있거나 `Content-Length` 헤더가 누락된 경우 실패할 수 있습니다(Qwen의 경우 400 오류를 반환합니다).
</Note>

<CardGroup cols={2}>
  <Card title="이미지 인식 · APIYI 온라인 도구" icon="scan-eye" href="https://imagen.apiyi.com/#understand">
    코드를 작성하고 싶지 않으신가요? 브라우저에서 이미지를 업로드(다중 이미지 분석 지원)하고, 일반 인식, 상품명, 핵심 특징(5가지 포인트) 설명, 속성 분석, OCR용 기본 제공 템플릿을 활용하여 모델별 결과를 비교해 보십시오. APIYI 키만 붙여넣으면 바로 사용할 수 있습니다.
  </Card>

  <Card title="동영상 이해 API" icon="video" href="/ko/api-capabilities/video-understanding">
    동영상을 분석해야 하나요? 동영상 지원 목록과 형식을 확인하십시오.
  </Card>
</CardGroup>

## AI 에이전트를 통한 연동 진행

<Note>
  Codex / Claude Code / Cursor를 사용하여 개발하는 경우, 아래 prompt를 복사하여 에이전트에 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져온 다음(임의의 문서 URL 끝에 `.md` 추가), 프로젝트 자체 스택에 맞춰 코드를 작성합니다. 범용 `image_url` 형식 사용, **대용량 이미지 우선 축소**, **이미지가 모델에 실제로 도달했는지 확인하기 위한 `prompt_tokens` 확인** 작업이 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트를 통해 비전 이해(이미지 인식 / OCR)를 연동하거나 문제를 해결합니다. Codex, Claude Code, Cursor 및 유사 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 비전 이해 기능을 연동하거나 문제를 해결하십시오: OCR, 개수 측정, 장면 설명 또는 다중 이미지 비교를 위해 멀티모달 모델에 이미지를 전송합니다.

  코드를 수정하기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 확인하려면 [https://docs.apiyi.com/en/api-capabilities/vision-understanding.md](https://docs.apiyi.com/en/api-capabilities/vision-understanding.md) 를 가져오십시오.

  요구사항:

  1. 엔드포인트 및 형식: 기본적으로 OpenAI 호환 `POST https://api.apiyi.com/v1/chat/completions`을 사용하고 각 이미지를 텍스트 블록 옆의 `messages[].content` 내부에 `{"type": "image_url", "image_url": {"url": ...}}`로 전달하십시오. 이미지가 여러 개인 경우 여러 개의 `image_url` 블록을 추가하십시오. 순서는 이미지 1, 이미지 2 순입니다. 모든 비전 모델은 이 형식을 지원합니다. 프로젝트에서 이미 Responses 또는 Anthropic SDK를 사용 중인 경우에만 형식을 전환하고, 먼저 이 페이지의 “각 형식이 지원하는 모델”을 확인하십시오. **Responses 엔드포인트는 Gemini / Claude / Seed에 접근할 수 없고, Anthropic 엔드포인트는 Seed / DeepSeek에 접근할 수 없으며, Grok은 Anthropic 엔드포인트에서 이미지를 경고 없이 누락합니다**.

  2. 모델 선택: 기본적으로 `gemini-3.8-flash`를 사용하십시오(모든 테스트 통과, 저렴한 가격). 가장 안정적인 OCR 및 이해가 필요한 경우 `claude-sonnet-5-5` 또는 `gpt-6-sol`을 사용하십시오. 대량의 저비용 작업에는 `claude-haiku-5-5`, `qwen3.8-flash` 또는 `gemini-3.5-flash-lite`을 사용하십시오. `deepseek-v4-pro` 및 `glm-5.3`와 같은 텍스트 전용 모델은 이미지를 지원하지 않으므로 선택하지 마십시오. `gpt-6-luna`은 OCR에서 글자를 누락하고 `gemini-3.1-flash-lite`는 객체 수를 잘못 계산하므로 정확도가 중요할 때는 이들을 피하십시오. 모델 이름을 설정 가능하게 만드십시오.

  3. 이미지 전송 방식: **Base64 데이터 URI를 우선 사용하고**(`data:image/png;base64,...`), 접두사의 형식은 확장자가 아닌 파일의 실제 내용(헤더 바이트)을 기반으로 판별하십시오. 공개 URL도 동작하지만 제공업체가 직접 다운로드해야 합니다. 즉, 호스트가 공개적으로 접근 가능하고 빨라야 하며, **응답에 `Content-Length` 헤더가 반드시 포함되어야 합니다**(그렇지 않으면 Qwen 모델이 `Missing Content-Length of multimodal url`을 반환합니다). URL과 Base64는 상호 배타적입니다. 절대로 `data:...;base64,` 뒤에 링크를 넣지 마십시오.

  4. **전송 전 대용량 이미지 축소**: 긴 변을 약 2048 px로 크기를 조정하고 JPEG(품질 85–90)로 변환하십시오. 이 과정을 건너뛰면 실제 비용이 발생합니다. GPT는 이미지 타일 단위로 과금하며 테스트 시 9000×6000 이미지 한 장에 63,658 입력 tokens가 과금되었습니다. Claude는 Base64 인코딩 후 10 MB를 초과하는 모든 이미지를 거부합니다(상태 코드 429 반환 — 이를 요청 제한으로 취급하여 재시도하지 마십시오). Seed는 총 픽셀 수를 3,600만 개로 제한합니다. Kimi는 단일 이미지가 16,384 tokens를 초과하면 400을 반환합니다.

  5. **이미지가 모델에 실제로 도달했는지 확인**: 모든 응답에서 `usage.prompt_tokens`를 확인하십시오. 대부분의 제공업체에서 1200×760 이미지는 대략 900–1,300 tokens가 소모됩니다. **수십 tokens에 불과하다면 이미지가 누락된 것입니다** — 이미지를 받지 못한 모델이 그럴듯한 내용을 지어내는 경우가 있으므로 응답을 사용하는 대신 에러를 발생시키십시오.

  6. 매개변수: chat 엔드포인트에서 `max_tokens` 및 `temperature`은 GPT / Claude / Gemini에서 정상적으로 동작합니다. `detail: "low"`는 `gpt-5.4-mini` 및 Seed에서만 반영되며(tokens가 절반 이하로 줄어들지만 작은 텍스트를 잘못 읽을 수 있음), 다른 모델은 이를 무시합니다. 구조화된 결과가 필요한 경우 prompt에서 JSON을 요청하고 방어적으로 파싱하십시오.

  7. 타임아웃 및 비용: 테스트 시 단일 이미지는 2~~12초가 걸렸으며 대용량 이미지는 더 오래 걸립니다(10 MB 이미지의 경우 30~~70초). 따라서 클라이언트 타임아웃을 최소 120초로 설정하십시오. 과금은 token당 부과되며, 이미지 한 장의 입력 비용은 약 \$0.0001(Claude Haiku 5.5 / Qwen3.8 Flash)에서 약 \$0.005(Claude Opus 5.5) 수준입니다.

  8. 키는 `APIYI_API_KEY` 환경 변수에서 읽어오십시오 — 절대로 하드코딩하거나 git에 커밋하지 마십시오.

  9. 완료되면 실제로 한 번 실행해 보십시오: 텍스트가 포함된 이미지 한 장을 전송하고 모델의 답변, `usage.prompt_tokens` 및 해당 호출의 비용을 보여주십시오.
</Prompt>

<Accordion title="이 prompt가 방지하는 문제들">
  | 요구사항 | 방지하는 함정 |
  | - | - |
  | 기본적으로 chat `image_url` 사용 | Responses 및 Anthropic 엔드포인트는 일부 모델에만 접근할 수 있어, 모델 변경 시 400 오류가 발생하거나 이미지가 경고 없이 누락됩니다 |
  | Base64 우선 사용, 헤더 바이트에서 형식 감지 | URL 방식은 제공업체가 직접 다운로드해야 하며, Qwen의 경우 `Content-Length` 헤더도 요구됩니다 |
  | 대용량 이미지 축소 | GPT는 대용량 이미지 한 장에 60,000+ tokens를 과금하며, Claude, Seed, Kimi는 요청을 완전히 거부합니다 |
  | Claude의 크기 오류는 429 상태 코드임 | 이를 요청 제한으로 취급하여 재시도하지 마십시오 — 이미지 축소가 해결책입니다 |
  | `usage.prompt_tokens` 확인 | 텍스트 전용 모델은 이미지를 누락해도 200을 반환합니다. token 수는 코드에서 감지할 수 있는 유일한 신호입니다 |
  | 텍스트 전용 모델 제외 | `deepseek-v4-pro` 및 `glm-5.3`은 이미지를 볼 수 없다는 답변만 반환합니다 |
</Accordion>

## 지원 모델

본 결과는 2026-10-11 (UTC+8)에 진행된 테스트를 기반으로 합니다. 모든 모델은 동일한 1200×760 크기의 중영문 혼합 주문서 이미지(표 포함)를 한 글자도 빠짐없이 텍스트로 변환하고, 도형의 개수를 세며, 두 이미지 간의 차이점을 찾아내고, 공개 이미지 URL을 읽는 작업을 수행했습니다. 이미지를 보지 않고 임의로 생성한 답변을 배제하기 위해 공백 이미지를 대조군으로 사용했습니다.

| 제공업체 | 모델 ID | 측정된 지연 시간 | 이미지당 입력 tokens | 테스트 결과 | 추천 용도 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 5–8 s | \~1,090 | 모든 테스트 통과, 저렴한 가격; Gemini 네이티브 형식 지원 | 기본 선택지, 일상적인 이미지 인식 |
| Google | `gemini-3.1-pro-preview` | 9–12 s | \~1,090 | 모든 테스트 통과 | 복잡한 차트, 추론이 필요한 인식 작업 |
| Google | `gemini-3.5-flash-lite` | 2–5 s | \~1,090 | 모든 테스트 통과, 가장 빠른 편에 속함 | 대용량 및 저지연 작업 |
| OpenAI | `gpt-6-sol` 🔥 | 5–6 s | \~1,100 | 모든 테스트 통과 | 일반적인 인식, Responses 프로젝트 |
| OpenAI | `gpt-5.6-terra` | 5 s | \~1,100 | 모든 테스트 통과 | 일반적인 인식 |
| OpenAI | `gpt-6-luna` | \~4 s | \~1,100 | ⚠️ 가격이 저렴하지만 OCR 시 글자 누락 발생(5회 테스트 모두 주문 번호 및 전화번호 오독) | 대략적인 설명 용도, OCR 비추천 |
| Anthropic | `claude-sonnet-5-5` 🔥 | 3–4 s | \~1,210 | 모든 테스트 통과 | 고난도 OCR 및 이해 작업 |
| Anthropic | `claude-opus-5-5` | 5–9 s | \~1,210 | 모든 테스트 통과 | 전문적인 이미지 및 텍스트 분석 |
| Anthropic | `claude-haiku-5-5` | 3–8 s | \~1,210 | 모든 테스트 통과, 매우 저렴한 단가 | 대량 인식 및 태깅 |
| xAI | `grok-4.7` | 4–6 s | \~950 | 모든 테스트 통과 | 일반적인 인식 |
| ByteDance | `seed-2-0-pro-260328` | 9–11 s | \~1,260 | 모든 테스트 통과; `detail: low` 지원(\~600 tokens) | 중국어 모델 중 최우선 선택 |
| ByteDance | `seed-2-0-mini-260428` | 5–10 s | \~1,260 | 모든 테스트 통과 | 저비용 대량 작업 |
| ByteDance | `dola-seed-2-1-turbo-260628` | \~10 s | \~1,260 | 모든 테스트 통과; thinking 기능 기본 활성화 | 추론이 필요한 인식 작업 |
| Alibaba | `qwen3.8-max` | 7–9 s | \~880 | 모든 테스트 통과(URL은 `Content-Length` 필요) | 복잡한 인식 작업 |
| Alibaba | `qwen3.8-flash` | 4–11 s | \~910 | 모든 테스트 통과(동일한 주의 사항 적용), 매우 저렴한 단가 | 비용에 민감한 대량 작업 |
| Alibaba | `qwen3-vl-plus` | 6–9 s | \~910 | 모든 테스트 통과(동일한 주의 사항 적용) | 전용 비전 모델 |
| Moonshot | `kimi-k3` | 6–8 s | \~1,220 | 모든 테스트 통과 | 심층 분석 |
| MiniMax | `MiniMax-M3` | 4–7 s | \~1,200 | 모든 테스트 통과; `<think>` 추론 내용이 본문에 혼합되어 출력되므로 분리 필요 | 일반적인 인식 |
| DeepSeek | `deepseek-v4-flash-vision-exp` | 3–5 s | \~570 | 모든 테스트 통과, 이미지 tokens 소모량 가장 적음 | 저비용 인식 작업 |

`gemini-3.1-flash-lite` 및 `gpt-5.4-mini` 또한 이미지를 읽을 수 있고 OCR도 완벽하게 수행했으나, **객체 개수를 잘못 계산하므로**(각각 3회 중 0회, 3회 중 1회만 정답) 개수 측정 작업에는 사용하지 않는 것이 좋습니다. `qwen-vl-ocr`은 전용 OCR 모델로 **표만 출력하고 표 외부의 모든 텍스트는 건너뛰며**, 다중 이미지 요청 시 첫 번째 이미지만 읽으므로 순수 표나 신분증/서류 인식 시나리오에만 사용하십시오.

<Note>모델 가격은 공식 사이트 기준에 맞춰져 있으며 변동될 수 있습니다. 위 표는 참고용일 뿐이며, 상단 내비게이션의 **모델 가격** 탭이 기준이 됩니다: [모델 가격](/en/models/index).</Note>

### 이미지를 지원하지 않는 모델

| 모델 | 이미지 전송 시 동작 |
| - | - |
| `deepseek-v4-pro` | 200을 반환하지만 이미지를 무시합니다(`prompt_tokens` 소모량이 5만 증가함). 모델은 이미지를 볼 수 없다고 답변합니다 |
| Zhipu `glm-5.3` | chat 엔드포인트는 200을 반환하지만 이미지를 무시하며, Responses 엔드포인트는 명시적으로 `only supports text modality`을 반환합니다 |

다른 모델의 경우 모델 상세 페이지의 “입력 양식(Input modalities)” 행을 확인하십시오. [단일 API에서 텍스트 + 이미지 처리](/ko/faq/text-and-image-in-one-api)를 참조하시기 바랍니다.

## 각 형식이 지원하는 모델

| 형식 | 작동함 (테스트 완료) | 작동하지 않음 |
| - | - | - |
| **OpenAI 호환 chat** (`/v1/chat/completions` + `image_url`) | 위 표의 모든 모델 | — |
| **OpenAI Responses** (`/v1/responses` + `input_image`) | GPT, Grok, Qwen3.8, Kimi, MiniMax, DeepSeek Vision | Gemini, Claude, Seed 및 Qwen3-VL은 400 반환 |
| **Anthropic Messages** (`/v1/messages` + `image`, base64) | Claude, Gemini, GPT, Qwen, Kimi, MiniMax | Seed는 401 반환, DeepSeek는 400 반환; **Grok은 알림 없이 이미지를 누락함** |
| **Anthropic Messages** (`image`, url 소스) | Claude만 지원 | **Gemini는 알림 없이 이미지를 누락함**; GPT 및 Qwen은 400 반환 |
| **Gemini 네이티브** (`generateContent` + `inline_data`) | Gemini (3.8 Flash 및 3.1 Pro 테스트 완료) | — |

<Tip>
  **신규 프로젝트에는 OpenAI 호환 chat 형식을 사용하는 것을 권장합니다** — 모델 전환은 모델 이름을 변경하기만 하면 됩니다. Responses는 이미 OpenAI Responses SDK를 사용 중인 프로젝트에 적합하며, Anthropic 형식은 Claude 생태계(Claude Code, Anthropic SDK)에 적합하고, Gemini 네이티브는 이미 `google-genai` SDK를 사용 중인 프로젝트에 적합합니다.
</Tip>

## 빠른 시작: 범용 형식 (`image_url`)

### 로컬 이미지 (Base64, 권장)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.8-flash",          # or claude-sonnet-5-5 / gpt-6-sol / qwen3.8-flash, etc.
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Transcribe all text in the image word for word, and output tables as Markdown tables"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
        ],
    }],
)

print(response.choices[0].message.content)
print(response.usage.prompt_tokens)    # ~900-1,300 for a 1200x760 image; a few dozen means the image never arrived
```

### 공개 이미지 URL

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image in detail"},
            {"type": "image_url", "image_url": {"url": "https://your-bucket.example.com/demo.png"}},
        ],
    }],
)
```

### 여러 이미지 비교하기

이미지당 하나의 `image_url` 블록을 순서대로 추가하고, prompt에서 이를 "이미지 1" 및 "이미지 2"로 참조하십시오:

```python theme={null}
response = client.chat.completions.create(
    model="claude-sonnet-5-5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Below are image 1 and image 2. What is different between them?"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image1_b64}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image2_b64}"}},
        ],
    }],
)
```

### curl

```bash theme={null}
# 1. Build the request body: the Base64 string is long, so write it to a file instead of a command-line argument (macOS / Linux)
printf '{"model":"gemini-3.8-flash","messages":[{"role":"user","content":[{"type":"text","text":"Describe this image"},{"type":"image_url","image_url":{"url":"data:image/png;base64,%s"}}]}]}' \
  "$(base64 < demo.png | tr -d '\n')" > req.json

# 2. Send it
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **Base64를 권장하는 이유**: 이미지 URL을 사용할 경우 제공업체가 이미지를 실시간으로 다운로드하므로, 호스트가 느리거나 핫링크 방지 기능을 사용하거나 접근을 제한하면 실패할 수 있습니다. 또한 Qwen 모델은 호스트가 `Content-Length` 헤더를 전송해야 합니다(일부 CDN은 이 헤더 없이 청크 전송을 사용하여 테스트 시 `Missing Content-Length of multimodal url`을 반환했습니다). Base64는 외부 다운로드 없이 이미지를 요청 본문에 직접 포함합니다. Base64는 원본 크기의 약 1.33배이므로 인코딩 전에 큰 이미지를 축소하십시오. "큰 이미지 먼저 축소하기"를 참조하십시오.
</Tip>

## 기타 형식

### OpenAI Responses (`input_image`)

이미 OpenAI Responses SDK를 사용 중인 프로젝트에 적합합니다. **GPT, Grok, Qwen3.8, Kimi, MiniMax 및 DeepSeek Vision에만 지원되며** — Gemini / Claude / Seed는 400을 반환합니다.

```python theme={null}
response = client.responses.create(
    model="gpt-6-sol",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "Transcribe all text in the image word for word"},
            {"type": "input_image", "image_url": f"data:image/png;base64,{image_b64}"},
        ],
    }],
)

print(response.output_text)
```

### Anthropic Messages (`image`)

Claude 생태계(Anthropic SDK, Claude Code 등)의 경우 엔드포인트는 `https://api.apiyi.com`입니다. base64 소스는 Claude, Gemini, GPT, Qwen, Kimi 및 MiniMax를 지원하며, **url 소스는 Claude에서만 작동합니다**(Gemini는 이미지를 알림 없이 무시합니다).

```python theme={null}
import anthropic, base64

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_b64}},
            {"type": "text", "text": "Transcribe all text in the image word for word"},
        ],
    }],
)

print(message.content[0].text)
# Claude can also take a public URL: {"type": "image", "source": {"type": "url", "url": "https://..."}}
```

### Gemini 네이티브 형식 (`inline_data`)

프로젝트에서 이미 Google의 공식 `google-genai` SDK를 사용하고 있다면, `base_url`가 `https://api.apiyi.com`를 가리키도록 설정하기만 하면 됩니다:

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
        types.Part(text="Transcribe all text in the image word for word"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # includes an IMAGE entry when the image reached the model
```

REST 형식: 헤더 `x-goog-api-key: YOUR_API_KEY`와 함께 `POST https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent`를 호출하고, 이미지는 `contents[].parts[]` 내부에 `{"inline_data": {"mime_type": "image/png", "data": "<BASE64>"}}`로 전달합니다. 더 자세한 네이티브 사용법은 [Gemini 네이티브 형식](/ko/api-capabilities/gemini/native)을 참고하십시오.

## 대용량 이미지는 먼저 다운스케일링하십시오

제공업체마다 대용량 이미지를 처리하는 방식이 크게 다릅니다. 약 10 MB 크기의 9000×6000 JPEG 이미지 1장에 대한 결과는 다음과 같습니다:

| 모델 | 결과 |
| - | - |
| `gemini-3.8-flash` | 정상적으로 인식됨, 자동 다운스케일링됨, 약 1,100 tokens |
| `grok-4.7` / `qwen3.8-flash` / `MiniMax-M3` | 정상적으로 인식됨, 약 2,600–3,700 tokens, 24–67초 |
| `gpt-6-sol` | 정상적으로 인식되었으나, **이미지 1장에 63,658 입력 tokens가 과금되었습니다** (약 \$0.13) |
| `claude-sonnet-5-5` | 거부됨: `image exceeds 10 MB maximum` (**상태 코드 429**, 요청 제한이 아님) |
| `kimi-k3` | 거부됨: 이미지 1장이 16,384 tokens를 초과함 |
| `seed-2-0-pro-260328` | 거부됨: 총 픽셀 수가 3,600만을 초과함 |

<Warning>
  **업로드 전에 긴 변을 약 2048 px로 조정하십시오**: 동일한 이미지를 2048×1365로 다운스케일링한 후 표에 있는 8개 모델 모두 이미지당 약 700–3,700 tokens로 완벽하게 정확한 OCR 결과를 보이며 통과했고, `gpt-6-sol`은 63,658에서 3,320으로 감소했습니다. Claude가 429를 반환하는 경우 먼저 오류 본문을 확인하십시오. `image exceeds`는 이미지가 너무 크다는 의미이므로 재시도해도 해결되지 않습니다.
</Warning>

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(path, max_side=2048):
    """Resize the long side to max_side and convert to JPEG, so the declared type always matches the content"""
    img = Image.open(path)
    img.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
```

## 자주 발생하는 오류

### 이미지 URL 다운로드 시간 초과

이미지 URL을 전달할 때 다음과 같은 오류가 발생하는 경우:

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

이는 **제공업체 측에서 해당 이미지 URL을 다운로드하는 동안 시간 초과가 발생했음**을 의미하며, 모델, 키 또는 잔액과는 전혀 관련이 없습니다. 일반적인 원인은 호스트 서버가 느리거나 특정 지역에서의 접근성이 떨어지는 경우, 이미지 용량이 너무 큰 경우, 또는 URL에 핫링크 방지나 로그인 보호가 걸려 있는 경우 등입니다.

**해결 방법**: base64로 전환(권장 — 다운로드 단계가 완전히 생략됨), 더 빠르고 공개적으로 접근 가능한 URL 사용, 또는 이미지를 압축한 후 다시 시도하십시오.

### 멀티모달 URL의 Content-Length 누락 (Qwen)

Qwen 모델은 이미지 호스트가 `Content-Length` 응답 헤더를 전송하도록 요구합니다. 일부 CDN(예: Cloudflare)은 해당 헤더 없이 청크 전송 방식으로 이미지를 제공하여 이 오류를 발생시킵니다. 동일한 이미지를 오브젝트 스토리지에서 제공하거나 base64로 대신 전송하십시오.

### invalid base64 data (Base64 필드에 URL이 입력된 경우)

다음과 같은 400 오류가 발생하는 경우(핵심 문구는 `invalid base64 data`이며, 문구는 모델에 따라 약간 다를 수 있습니다):

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  }
}
```

이는 대개 **data URI의 base64 데이터 부분에 이미지 URL이 붙여넣어졌음**을 의미합니다:

```json theme={null}
// ❌ Wrong: what follows base64, is a link, not Base64-encoded data
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,` 접두사 뒤에 오는 내용은 반드시 **이미지 파일 자체의 base64 인코딩 결과**여야 합니다. URL 형식과 base64 형식은 상호 배타적이며 함께 혼용할 수 없습니다:

```json theme={null}
// ✅ The image is a web URL → pass the link directly, with no prefix
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ The image is a local file / binary → Base64-encode it, then build the data URI
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **자체 확인**: 전송하기 전에 이미지 소스를 확인하십시오. 문자열이 `http`(으)로 시작하면 URL 형식을 사용하고, 그렇지 않으면 base64로 인코딩하여 data URI를 생성하십시오. 유효한 base64에는 `://` 또는 `?`와 같은 문자가 포함되지 않으므로, `base64,` 뒤에 이러한 문자가 보인다면 거의 확실히 링크가 붙여넣어진 것입니다.
</Tip>

### 선언된 이미지 형식이 실제 형식과 일치하지 않음 (미디어 타입 불일치)

다음과 같은 400 오류가 발생하는 경우(핵심 문구는 `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`입니다):

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, ... ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

이는 data URI가 이미지를 PNG(`data:image/png;base64,...`)로 **선언**했으나, 제공업체가 이를 디코딩하고 파일 헤더를 확인한 결과 **실제 콘텐츠가 JPEG**임을 발견하여 요청을 거부했음을 의미합니다. 일반적인 원인은 변경된 파일 확장자로부터 형식을 추론했거나 코드에 `image/png`(을)를 하드코딩한 경우입니다.

<Info>
  이 검사 여부는 모델이 사용하는 업스트림 채널에 따라 다릅니다. 당사의 2026-10-11 (UTC+8) 테스트에서는 PNG로 선언된 JPEG를 전송했을 때 22개 비전 모델 모두에서 정상 작동했으나, Bedrock 채널을 통해 제공되는 Claude 모델에서는 위의 오류가 반환되었습니다. “선언된 형식은 실제 콘텐츠와 일치해야 한다”는 규칙을 기준으로 코드를 작성하면 모든 채널에서 안전하게 사용할 수 있습니다.
</Info>

**해결 방법**: data URI를 생성하기 전에 파일 헤더에서 실제 형식을 감지하거나, “대용량 이미지 먼저 축소하기” 아래의 함수처럼 PIL을 사용하여 모두 JPEG로 변환하십시오:

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """Detect the real format from the file header so the media type always matches the content"""
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

<Tip>
  `file xxx.png`(macOS / Linux 명령줄)을 사용하면 파일의 실제 형식을 바로 확인할 수 있으며, Python에서는 `Image.open(path).format`(으)로 동일한 결과를 얻을 수 있습니다.
</Tip>

## 고급 팁

### 이미지가 모델에 실제로 전달되었는지 확인

응답에서 `usage.prompt_tokens`을(를) 확인하십시오. 대부분의 제공자에서 1200×760 이미지는 대략 900–1,300 tokens를 소모합니다(DeepSeek Vision에서는 약 570 tokens). **텍스트 전용 요청과 비교하여 수가 거의 증가하지 않거나 전혀 증가하지 않는다면 이미지가 누락된 것입니다**. 이는 텍스트 전용 모델(`deepseek-v4-pro`, `glm-5.3`), Anthropic 엔드포인트를 통한 Grok, Anthropic URL 소스를 통한 Gemini에서 발생합니다.

<Warning>
  **이미지를 수신하지 못한 모델은 답변을 지어낼 수 있습니다.** 테스트에서 이미지를 첨부하지 않고 "이미지의 모든 텍스트를 전사해 주세요"라고 요청했을 때, 다른 모든 모델은 이미지를 볼 수 없다고 답변한 반면 `gemini-3.8-flash`은(는) 6회 중 1회에서 존재하지 않는 표 전체를 지어냈습니다. 따라서 배치 파이프라인에서는 답변에만 의존하지 마시고, 먼저 `prompt_tokens`(으)로 전달 여부를 확인하십시오.
</Warning>

### `detail` 매개변수

`image_url` 내부의 `detail: "low"`은(는) 일부 모델에서만 적용됩니다. `gpt-5.4-mini`(1,147 → 233 tokens이지만 작은 텍스트를 잘못 읽기 시작함) 및 Seed(1,340 → 602 tokens, OCR은 여전히 완전히 정확함)에서 지원되며, GPT-6 / 5.6, Gemini, Claude 및 Qwen은 이를 무시합니다. tokens를 절약하는 보다 범용적인 방법은 이미지를 직접 축소하는 것입니다.

### 매개변수

chat 엔드포인트에서 `max_tokens` 및 `temperature`은(는) GPT(GPT-6 포함), Claude 및 Gemini에서 정상적으로 작동합니다(테스트 시 이들 모두에서 `temperature=0.3`이(가) 통과되었습니다). MiniMax-M3는 `<think>...</think>` 추론을 content에 넣으므로 직접 제거해야 합니다.

### 일반적인 작업을 위한 prompt 아이디어

동일한 이미지라도 prompt만 변경하면 코드를 수정할 필요 없이 완전히 다른 작업을 수행할 수 있습니다.

* **OCR**: "이미지의 모든 텍스트를 한 글자도 빠짐없이 전사하고, 표는 Markdown 표로 출력해 주세요"
* **개수 세기 / 구조화된 출력**: "각 객체가 몇 개씩 있는지 세고 JSON으로만 출력해 주세요: `{"object": count}`"
* **제품 분석**: "제품 유형과 브랜드를 식별하고, 주요 셀링 포인트와 타깃 고객을 나열해 주세요"
* **다중 이미지 비교**: "아래는 이미지 1과 이미지 2입니다. 모든 차이점을 나열해 주세요"
* **차트 판독**: "축, 데이터 추세, 최댓값 및 최솟값을 판독해 주세요"

<Warning>
  의료 영상, 신분증 또는 안전 관련 사항에 대한 결과는 참고용일 뿐입니다. 중요한 결정은 사람이 직접 검토해야 하며, 민감한 개인정보가 포함된 이미지는 업로드하지 마십시오.
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="어떤 모델이 이미지를 인식할 수 있습니까?">
    이 페이지에서 테스트한 22개 비전 모델 모두 지원합니다: Gemini, GPT, Claude, Grok, Seed, Qwen, Kimi, MiniMax 및 DeepSeek Vision입니다. `deepseek-v4-pro` 및 `glm-5.3`과 같은 텍스트 전용 모델은 지원하지 않습니다. 기타 모델의 경우 모델 상세 페이지의 “입력 모달리티(Input modalities)” 행을 확인하십시오.
  </Accordion>

  <Accordion title="이미지를 전송했는데 모델이 이미지가 보이지 않는다고 합니다.">
    먼저 응답에서 `usage.prompt_tokens`을(를) 확인하십시오. 수십 token 정도에 불과하다면 이미지가 모델에 전달되지 않았음을 의미합니다. 일반적인 원인은 다음과 같습니다: ① 텍스트 전용 모델을 선택한 경우; ② Anthropic 엔드포인트를 통해 Grok을 호출했거나, Anthropic url 소스를 통해 Gemini를 호출한 경우(둘 다 오류 없이 이미지를 무시함); ③ 공급자가 공개 URL을 다운로드하지 못한 경우입니다. Base64를 사용하는 chat `image_url` 방식으로 전환하면 이러한 문제 대부분이 해결됩니다.
  </Accordion>

  <Accordion title="동일한 코드인데 모델을 변경하자마자 400 오류가 반환됩니까?">
    일부 모델만 지원하는 Responses 또는 Anthropic 형식을 사용하고 있을 가능성이 높습니다(“각 형식이 지원하는 모델” 참조). OpenAI 호환 chat `image_url` 형식으로 전환하면 모든 공급자에서 정상적으로 작동합니다.
  </Accordion>

  <Accordion title="Claude에서 429 오류가 반환되었습니다. 요청 제한에 걸린 것입니까?">
    먼저 오류 본문을 확인하십시오. `image exceeds 10 MB maximum` 메시지가 표시된다면 (Base64 인코딩 후 측정된) 이미지 크기가 너무 큰 것입니다. 이 경우 재시도해도 해결되지 않으므로, 긴 쪽 길이를 약 2048 px로 조정한 후 다시 전송하십시오.
  </Accordion>

  <Accordion title="이미지 한 장에 수만 개의 tokens가 소모된 이유는 무엇입니까?">
    GPT 모델은 이미지 타일 단위로 과금하므로 원본 이미지가 클수록 더 많은 tokens가 소모됩니다. 자체 테스트 결과, 9000×6000 크기의 이미지 한 장에 대해 `gpt-6-sol`에서 63,658 입력 tokens가 과금되었습니다. 긴 쪽 길이를 약 2048 px로 조정한 후에는 동일한 이미지가 `gpt-6-sol`에서 3,320 tokens로 감소했으며, 여러 공급자에 걸쳐 대략 700\~3,700 tokens 수준으로 줄어들었습니다.
  </Accordion>

  <Accordion title="어떤 이미지 형식이 지원됩니까?">
    JPEG, PNG, GIF, WebP 등 주요 형식을 모두 지원합니다. 스마트폰 카메라로 촬영한 MPO 파일(.jpg 확장자로 유지된 파일)도 테스트에서 정상 인식되었습니다. 가장 안정적인 방법은 전송 전 PIL을 사용하여 모든 이미지를 JPEG으로 변환하는 것입니다.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="모델 요금" icon="list" href="/en/models/index">
    모든 모델 및 최신 요금 안내
  </Card>

  <Card title="동영상 이해 API" icon="video" href="/ko/api-capabilities/video-understanding">
    동영상 콘텐츠 인식, 장면 설명 및 타임스탬프
  </Card>

  <Card title="Gemini 네이티브 형식" icon="sparkles" href="/ko/api-capabilities/gemini/native">
    네이티브 형식에서의 스트리밍, 추론 예산 등
  </Card>

  <Card title="텍스트 + 이미지를 하나의 API로" icon="circle-help" href="/ko/faq/text-and-image-in-one-api">
    모델이 지원하는 입력 모달리티 확인 방법
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.