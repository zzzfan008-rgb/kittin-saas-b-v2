> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash 비전

> DeepSeek의 첫 비전 모델 deepseek-v4-flash-vision-exp: 이미지, 스크린샷 및 차트를 읽을 수 있습니다. 1M 컨텍스트, 이미지당 최대 384 tokens입니다. APIYI에서 1M tokens당 입력 $0.44 / 출력 $1.32로 책정되며, OpenAI 및 Anthropic 형식 모두에서 호출 가능합니다.

`deepseek-v4-flash-vision-exp`은 DeepSeek의 **실험적 비전 모델**로, 이미지 입력이 추가된 V4 Flash 기반으로 구축되었습니다: 그림을 설명하고, 스크린샷의 텍스트를 읽고, 차트 값을 읽고, 여러 이미지를 비교할 수 있습니다. 텍스트 측의 모든 기능(1M 컨텍스트, 추론 모드, 함수 호출, 컨텍스트 캐싱)은 유지되며, 과금은 텍스트 전용 V4 Flash와 동일합니다 —— **비전에는 추가 요금이 없으며, 이미지는 크기에 따라 input tokens로 변환됩니다**.

APIYI는 약 1,100회 호출에 걸쳐 **124개의 테스트 케이스를 완료**했으며, 세 가지 이미지 입력 채널, 네 가지 이미지 형식, 두 가지 프로토콜, 두 개의 그룹을 포함합니다.

<Warning>
  **호출하기 전에 먼저 읽으십시오: 이 모델은 APIYI에서 기능이 다른 두 그룹으로 제공됩니다. 사용하는 프로토콜에 맞는 그룹을 선택하십시오.**

  | 사용하는 프로토콜                                                | 키가 속해야 하는 그룹     |
  | -------------------------------------------------------- | ---------------- |
  | OpenAI 형식 (`/v1/chat/completions`, `/v1/responses`)      | **`default`**    |
  | Anthropic 형식 (`/v1/messages`, Claude Code 및 유사 클라이언트 포함) | **`ClaudeCode`** |

  잘못된 그룹을 선택해도 "잘못된 그룹" 오류가 발생하지 않습니다. 대신 매개변수가 조용히 아무 동작도 하지 않거나, 두 번째 턴에서 400 오류가 나거나, `/v1/responses`이 `messages`를 문제 삼는 형태로 나타납니다.
  두 그룹의 과금은 **동일합니다** —— 그룹은 기능에만 영향을 미치며, 과금에는 영향을 주지 않습니다.
  아래의 "그룹 선택"을 참조하십시오.
</Warning>

## 하이라이트

<CardGroup cols={2}>
  <Card title="비전 추가 요금 없음" icon="circle-dollar-sign">
    텍스트 전용 V4 Flash와 동일한 가격입니다: \$0.44 입력, 100만 token당 \$1.32 출력입니다. 이미지는 입력 token이 되며, 이미지당 최대 384개로 제한됩니다.
  </Card>

  <Card title="테스트에서 인식 성능이 우수합니다" icon="eye">
    스크린샷 OCR 값이 모두 정확했고, 5개 막대 차트는 5/5로 읽혔으며, 36개 도형 중 특정 도형 세기기는 24/24였습니다. 부정 질문에서도 환각이 없었습니다.
  </Card>

  <Card title="사전 압축이 필요하지 않습니다" icon="image">
    2000×2000과 4000×4000은 정확히 같은 token 수(346)로 변환됩니다. 업스트림이 대신 리사이즈해 주므로 —— 압축은 대역폭만 절약하고 비용은 절약하지 않습니다.
  </Card>

  <Card title="두 프로토콜 모두 작동합니다" icon="git-compare">
    OpenAI 형식(chat/completions + responses)과 Anthropic 형식(/v1/messages)은 둘 다 검증되었으며, 각각 자체 그룹을 통해 확인되었습니다.
  </Card>
</CardGroup>

## 모델 정보

| 항목                | 값                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------- |
| **모델 이름**         | `deepseek-v4-flash-vision-exp`                                                      |
| **모델 버전**         | DeepSeek-V4-Flash-Vision-Exp (실험용)                                                  |
| **컨텍스트 윈도우**      | 1M (측정된 하드 상한 1,048,576 tokens, `max_tokens`가 포함되어 계산됩니다)                           |
| **최대 출력**         | 384K (측정된 하드 한도 393,216; 이를 초과하면 `valid range of max_tokens is [1, 393216]`를 반환합니다) |
| **사용 가능한 그룹**     | `default`, `ClaudeCode`, `svip`                                                     |
| **엔드포인트**         | `POST /v1/chat/completions`, `POST /v1/responses`, `POST /v1/messages`              |
| **이미지 입력**        | ✅ JPEG / PNG / GIF / WebP                                                           |
| **추론 모드**         | 기본값으로 켜져 있으며 비활성화할 수 있습니다(작동 구문은 그룹에 따라 다르며, 아래를 참조하십시오)                            |
| **스트리밍**          | ✅ 세 엔드포인트 모두에서 사용 가능                                                                |
| **함수 호출 / 도구 사용** | ✅ 증분 스트리밍 조립 포함                                                                     |
| **JSON 출력**       | ✅ `json_object`; ❌ `json_schema` (상위 업스트림에서 활성화되지 않음)                               |
| **요금**            | \$0.44 입력, \$1.32 출력, \$0.014 캐시 적중, 100만 tokens당                                   |

<Note>
  Since 2026-08-17 the vendor bills this model in two tiers by time of day (peak hours are
  01:00-04:00 and 06:00-10:00 (UTC)). **APIYI charges the peak rate at all times**, so your cost
  never varies by the hour.
</Note>

## 그룹 선택

APIYI의 두 그룹은 **서로 다른 상위 엔드포인트**로 라우팅되므로, 기능이 서로 동일하지 않습니다. 아래 표는 2026-08-21에 측정했으며, 각 칸마다 3회 반복한 결과입니다:

| 기능                            | `default` 그룹                            | `ClaudeCode` 그룹 |
| ----------------------------- | --------------------------------------- | --------------- |
| `/v1/chat/completions` 이미지 포함 | ✅                                       | ✅               |
| `/v1/responses` 이미지 포함        | ✅                                       | ❌ 매번 400        |
| `/v1/messages` 이미지 포함         | ⚠️ 명시적인 `top_p`가 필요하며, 멀티턴에서는 400 오류 발생 | ✅ 정상 작동         |
| `detail` token 절감             | ✅ 효과 있음                                 | ❌ 무시됨           |
| thinking 비활성화(OpenAI 형식)      | ✅ 효과 있음                                 | ❌ 무시됨           |
| `logprobs`                    | ✅ 채워짐                                   | ❌ 빈 값 반환        |
| `reasoning_tokens` in usage   | ✅ 존재함                                   | ❌ 필드 전체 누락      |
| 공개 URL을 통한 이미지(Anthropic 형식)  | ❌                                       | ✅               |

### OpenAI 형식 → `default` 그룹 사용

그룹 `default`으로 token을 생성한 다음:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",          # a token in the default group
    base_url="https://api.apiyi.com/v1",
)
```

### Anthropic 형식 → `ClaudeCode` 그룹 사용

그룹 `ClaudeCode`으로 token을 생성한 다음:

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",          # a token in the ClaudeCode group
    base_url="https://api.apiyi.com",
)
```

<Tip>
  하나의 계정에는 서로 다른 그룹의 token을 여러 개 동시에 둘 수 있으며 서로 간섭하지 않습니다 ——
  프로토콜마다 하나씩 두는 구성이 권장됩니다. 다음을 참고하십시오
  [그룹이란 무엇입니까](/ko/faq/groups-explained) 및
  [token과 그룹](/ko/faq/token-and-groups)에서 생성 방법을 확인하고,
  [Codex vs ClaudeCode vs 기본 그룹](/ko/faq/codex-claudecode-default-groups)에서
  세 그룹의 차이를 확인하십시오.
</Tip>

<Warning>
  **Anthropic 형식에서는 `default` 그룹을 절대 사용하지 마십시오.** 여기서는 두 가지 문제가 겹칩니다:

  1. `top_p`를 생략하면 매번 400 `Invalid top_p value`가 반환됩니다
  2. `top_p`가 제공되어도, 첫 턴의 `thinking` 블록을 두 번째 턴에 다시 넣으면
     `unknown variant 'thinking'`가 반환됩니다 —— 그리고 Claude Code와 Anthropic SDK 같은 표준 클라이언트는
     항상 이를 다시 전송하므로 **멀티턴은 항상 깨집니다**

  `ClaudeCode` 그룹으로 바꾸면 두 문제 모두 없으며, 전체 도구 호출 왕복도 정상 작동합니다.
</Warning>

## 이미지를 전송하는 세 가지 방법

### 1. 인라인 base64(가장 일반적)

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is in this image?"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ],
    }],
    max_tokens=2000,
)
print(resp.choices[0].message.content)
```

### 2. 공개 이미지 URL

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image."},
            {"type": "image_url",
             "image_url": {"url": "https://example.com/image.jpg"}},
        ],
    }],
    max_tokens=2000,
)
```

URL은 최대 8192자까지 가능하며 다운로드는 60초 이내에 완료되어야 합니다.
끊어진 링크는 `Failed to download image`를 반환합니다.

### 3. `file` 콘텐츠 블록(인라인 base64와 동일)

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

측정된 token 비용은 `image_url` 채널과 동일합니다(같은 이미지에 대해 어느 방식이든 303입니다).

<Warning>
  **Files API(`/v1/files`에 업로드한 뒤 `file_id`로 참조)는 APIYI에서 사용할 수 없습니다**,
  이는 서드파티 게이트웨이에서 일반적인 방식입니다. 공급업체가 `file_id`에 대해 예약해 둔 두 가지 허용치
  —— 이미지당 64 MiB와 요청당 200 MiB —— 는 따라서 이용할 수 없습니다.

  실제로 적용되는 제한은 **이미지당 32 MiB 및 요청 본문당 48 MiB**입니다.
  이를 초과하면 `image file size exceeds limit 32 MB`를 반환합니다.
</Warning>

## 이미지 과금 방식

이미지는 리사이즈 후 치수를 기준으로 input tokens로 변환되며, 텍스트 tokens와 함께 \$0.44 / 1M로 과금됩니다. 아래 수치는 APIYI에서 고정 prompt를 사용하고 텍스트만 기준값을 차감하여 측정한 것입니다:

| 이미지 크기                         | Tokens | 이미지당 비용     | 1,000개 이미지당 |
| ------------------------------ | ------ | ----------- | ----------- |
| 64×64                          | 114    | \$0.00005   | \$0.05      |
| 384×384                        | 114    | \$0.00005   | \$0.05      |
| 800×800                        | 346    | \$0.000152  | \$0.15      |
| 2000×2000                      | 346    | \$0.000152  | \$0.15      |
| 4000×4000                      | 346    | \$0.000152  | \$0.15      |
| 1600×1200                      | 354    | \$0.000156  | \$0.16      |
| 1600×1200 with `detail: "low"` | 142    | \$0.0000625 | \$0.06      |

공급업체 설명과 정확히 일치하는 세 가지 규칙은 다음과 같습니다:

* **이미지당 384 tokens는 절대 상한입니다.** 측정된 최대값은 354였으며, 어떤 이미지도 이를 초과하지 않습니다
* **큰 이미지는 대략 800×800에 해당하도록 축소됩니다.** 그래서 2000²와 4000²의 비용이 같으며, **업로드 전에 미리 압축하면 대역폭은 절약되지만 비용은 절약되지 않습니다**
* **384×384보다 작은 이미지는 확대됩니다.** 따라서 64×64의 비용은 384×384와 같으므로 —— 작은 이미지를 더 줄일 필요는 없습니다

### token 절약 기능: `detail: "low"`

세부 사항이 중요하지 않을 때(이미지 유형 식별, 대상 인식, 대략적인 분류), 추론 전에 이미지를 512×512로 축소하도록 `detail: "low"`를 추가하십시오:

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

같은 1600×1200 이미지로 측정한 4개 수준은 다음과 같습니다:

| `detail`   | Tokens | 기본값 대비   |
| ---------- | ------ | -------- |
| `low`      | 142    | **-60%** |
| `high`     | 354    | 동일       |
| `original` | 354    | 기준값      |
| `auto`     | 354    | 동일       |

<Warning>
  `detail`는 **두** 조건이 모두 충족될 때만 적용됩니다. 즉, `image_url` 블록에 설정되어 있어야 하며
  (`file` 블록에서는 조용히 무시됩니다), 그리고 token이 **`default` 그룹**에 속해 있어야 합니다
  (`ClaudeCode` 그룹에서는 아무 동작도 하지 않습니다).

  유효하지 않은 값은 오류를 발생시킵니다:
  `unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.
</Warning>

## Controlling thinking mode

Thinking mode is **on by default**, and the thinking text counts against your `max_tokens` budget.
For pure image-reading tasks, turn it off: with thinking disabled our tests scored 24/24, ran
faster, saved the entire thinking output, and cut 80 input tokens as well (the thinking system
prompt costs exactly that much).

Every syntax, three runs each:

| Syntax                           | chat, `default` group                                     | chat, `ClaudeCode` group | `/v1/messages` |
| -------------------------------- | --------------------------------------------------------- | ------------------------ | -------------- |
| `thinking: {"type": "disabled"}` | ✅                                                         | ❌                        | ✅ both groups  |
| `reasoning_effort: "none"`       | ✅                                                         | ❌                        | —              |
| `reasoning_effort: "low"`        | ⚠️ thinking stays on, only the system prompt gets shorter | ❌                        | —              |
| `reasoning: {"effort": "none"}`  | ❌                                                         | ❌                        | —              |
| `enable_thinking: false`         | ❌                                                         | ❌                        | —              |

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[...],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},   # works in the default group
)
```

<Warning>
  **Do not set `max_tokens` too low.** With thinking on, even a one-line question can emit several
  hundred tokens of thinking first; too small a budget yields `finish_reason: "length"` with an
  empty `content` —— which looks like the model failed to answer. Use 2000 or more with thinking
  on, or simply disable thinking.
</Warning>

## 컨텍스트 캐싱

캐싱에는 매개변수가 필요 없습니다. 반복되는 긴 접두사는 자동으로 적중하며, 적중한 부분은 \$0.014 / 1M으로 과금됩니다. 하지만 **이미지가 포함된 요청은 텍스트 전용 요청과 두 가지 면에서 다릅니다**:

|               | 텍스트 전용 요청 | 이미지가 포함된 요청    |
| ------------- | --------- | -------------- |
| 첫 적중이 발생하는 호출 | 2번째       | 3번째            |
| 이미지 자체의 token | —         | **절대 캐시되지 않음** |

2304-token 텍스트 접두사와 800×800 이미지 하나를 함께 사용해 측정한 결과:

| 호출 | prompt\_tokens | 적중       | 미적중  |
| -- | -------------- | -------- | ---- |
| 1  | 2675           | 0        | 2675 |
| 2  | 2675           | 0        | 2675 |
| 3  | 2675           | **2304** | 371  |
| 4  | 2675           | 2304     | 371  |

적중은 이미지 **앞에** 있는 텍스트와 정확히 일치합니다. 이미지와 그 뒤의 모든 내용은 매번 전액으로 과금됩니다. 따라서 **고정된 긴 지시문은 이미지 앞에 배치하여** 캐시되게 하십시오 —— 이미지 뒤에 배치된 것은 절대 적중하지 않습니다.

<Note>
  Anthropic 형식에서는 이러한 필드의 이름이 `cache_read_input_tokens`와
  `cache_creation_input_tokens`이며, 동작 방식도 같습니다. 명시적인 `cache_control`
  마커는 **효과가 없습니다**(업스트림은 자동 접두사 캐싱을 사용합니다). 또한 두 프로토콜은 사용량을 다르게 보고합니다. OpenAI의 `prompt_tokens`는 항상 전체 수치인 반면, Anthropic의
  `input_tokens`는 적중 후 캐시되지 않은 나머지로 줄어듭니다 —— **두 값은 직접적으로 일치시킬 수 없습니다**.
</Note>

## 지원되는 이미지 형식

| 형식               | 지원 여부 | 비고                                       |
| ---------------- | ----- | ---------------------------------------- |
| JPEG             | ✅     |                                          |
| PNG              | ✅     |                                          |
| GIF              | ✅     | 애니메이션 GIF는 **첫 프레임만 읽히며**, 한 프레임으로 과금됩니다 |
| WebP             | ✅     |                                          |
| BMP / TIFF / SVG | ❌     | `You have uploaded an unsupported image` |

지원되는 네 가지 형식은 모두 동일한 token 수로 변환되므로, 컨테이너는 비용에 영향을 주지 않습니다.

<Tip>
  **형식은 사용자가 선언한 MIME 타입이 아니라 파일 내용에서 감지됩니다.** 테스트에서는 `image/jpeg`로 선언된 PNG도 문제없이 동작했습니다 —— 잘못된 확장자나 잘못된 MIME은 파일 자체가 네 가지 지원 형식 중 하나이기만 하면 상관없습니다.
</Tip>

## 검증된 기능 매트릭스

APIYI가 2026-08-21에 측정했습니다:

| 기능                                                     | 벤더 주장  | 측정값 (`default` 그룹)                                            |
| ------------------------------------------------------ | ------ | ------------------------------------------------------------- |
| 인라인 base64 이미지                                         | ✅      | ✅                                                             |
| 공개 URL 이미지                                             | ✅      | ✅                                                             |
| `file` 블록과 `file_data`                                 | ✅      | ✅                                                             |
| `file_id` (파일 API)                                     | ✅      | ❌ 플랫폼은 Files API를 제공하지 않습니다                                   |
| 요청당 여러 이미지                                             | 최대 600 | ✅ 20개 이미지 검증, 순서와 내용 모두 정확함                                   |
| 이미지 + 멀티턴 컨텍스트                                         | ✅      | ✅                                                             |
| 이미지 + 함수 호출                                            | ✅      | ✅ 스트리밍 증분 포함                                                  |
| 이미지 + JSON 출력                                          | ✅      | ✅ `json_object`                                               |
| 구조화된 출력 `json_schema`                                  | —      | ❌ 업스트림이 `This response_format type is unavailable now`를 반환합니다 |
| 스트리밍                                                   | ✅      | ✅ 세 개의 엔드포인트 모두에서                                             |
| `logprobs` / `temperature` / `top_p` / `stop` / `seed` | ✅      | ✅                                                             |
| Responses `previous_response_id` 연결                    | ✅      | ❌ **조용히 무효입니다**(오류는 없지만 컨텍스트가 없습니다). 전체 `input`를 직접 구성해야 합니다  |

### 정확도 부분 검증

| 작업                        | 결과                    |
| ------------------------- | --------------------- |
| 6줄짜리 영숫자 혼합 스크린샷 OCR      | 주문 ID, 금액, 이메일 모두 정확함 |
| 5개 막대 차트 읽기               | 5/5 정확, 제목 포함         |
| 6×6 격자(36개 도형)에서 특정 도형 세기 | 24/24 정확              |
| 두 이미지의 차이 찾기              | 정확함                   |
| 10장과 20장의 이미지를 순서대로 라벨 인식 | 모두 정확함                |
| 부정 질문(이미지에 없는 무언가)        | 정확히 부정함, 환각 없음        |

## 제한 및 일반적인 오류

| 제한             | 값               | 초과 시 오류                                                 |
| -------------- | --------------- | ------------------------------------------------------- |
| 단일 이미지         | 32 MiB          | `image file size exceeds limit 32 MB`                   |
| 요청 본문          | 48 MiB          | —                                                       |
| URL 길이         | 8192 characters | `external link length … too long, max link length 8192` |
| 요청당 이미지 수      | 공급업체 기준 600개    | —                                                       |
| `max_tokens`   | 393,216         | `valid range of max_tokens is [1, 393216]`              |
| `top_logprobs` | 0–20            | `valid range of top_logprobs is [0, 20]`                |
| 컨텍스트           | 1,048,576       | `This model's maximum context length is 1048576 tokens` |

<Note>
  1,048,576 컨텍스트 상한은 측정 대상이며, 오류 메시지에는 **`max_tokens`이 같은 총량에 포함된다고** 표시됩니다 (`… in the messages, … in the completion`). 긴
  컨텍스트를 채울 때는 출력 예산을 위한 여유를 남겨 두지 않으면 상한에 도달합니다.
</Note>

기타 흔한 400 오류:

* `You have uploaded an unsupported image` —— 형식이 네 가지 중 하나가 아니거나 base64가 손상되었습니다
* `Failed to download image` —— URL에 연결할 수 없거나 60초 넘게 소요되었습니다
* `Image in assistant message is unsupported` —— 이미지는 `user` 메시지에만 나타날 수 있습니다

<Note>
  테스트에서는 요청의 약 \*\*1%-3%\*\*에서 연결이 조용히 종료되었습니다(클라이언트에는 SSL EOF 또는 핸드셰이크 타임아웃으로 나타났습니다). 이는 이미지와도 무관하고
  그룹과도 무관합니다 —— 가끔 발생하는 전송 계층 수준의 이벤트입니다. **반드시 읽기 타임아웃을 설정하고 재시도하십시오**,
  그렇지 않으면 단일 요청이 2분 넘게 멈춰 있을 수 있습니다.
  [타임아웃 설정](/ko/faq/timeout-configuration)을 참조하십시오.
</Note>

## 전체 예시

### OpenAI 형식 (`default` 그룹)

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",       # default group
    base_url="https://api.apiyi.com/v1",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "original"}},
        ],
    }],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
print(resp.usage)
```

### Anthropic 형식 (`ClaudeCode` 그룹)

```python theme={null}
import base64
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",       # ClaudeCode group
    base_url="https://api.apiyi.com",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

msg = client.messages.create(
    model="deepseek-v4-flash-vision-exp",
    max_tokens=2000,
    thinking={"type": "disabled"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/png", "data": b64}},
        ],
    }],
)
print(msg.content)
```

## 관련 문서

<CardGroup cols={2}>
  <Card title="비전 이해 API" icon="eye" href="/ko/api-capabilities/vision-understanding">
    비전 모델 전반의 일반적인 호출 패턴과 비교
  </Card>

  <Card title="DeepSeek V4 Flash" icon="zap" href="/ko/api-capabilities/deepseek-v4-flash/overview">
    같은 기반의 텍스트 전용 형제 모델로, 1M 컨텍스트와 이중 엔드포인트를 지원합니다
  </Card>

  <Card title="그룹 선택" icon="users" href="/ko/faq/codex-claudecode-default-groups">
    Codex, ClaudeCode 및 Default 그룹의 차이와 어떤 그룹을 선택할지
  </Card>

  <Card title="타임아웃 설정" icon="timer" href="/ko/faq/timeout-configuration">
    권장 클라이언트 읽기 타임아웃 및 재시도 설정
  </Card>
</CardGroup>
