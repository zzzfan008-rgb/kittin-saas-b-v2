> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max 텍스트 생성

> Alibaba Qwen의 플래그십 Qwen3.8-Max: 2.4T-파라미터 희소 MoE, 1M 컨텍스트, 131K 출력, 네이티브 이미지 및 동영상 입력을 지원합니다. APIYI에 1M tokens당 $1.65/$4.95로 등록되어 있으며 — 공식 대비 17.5% 낮습니다. 586건의 실측 테스트 호출에서 얻은 기능 매트릭스와 주의 사항을 포함합니다.

Qwen3.8-Max (`qwen3.8-max`)는 2026년 8월 3일에 출시된 Alibaba Qwen의 새로운 플래그십입니다. 이는 총 2.4조 파라미터를 가진 희소 MoE 모델로, **100만 컨텍스트 윈도우**, 최대 출력 131K, 그리고 텍스트, 이미지, 동영상 입력에 대한 기본 지원을 제공합니다. APIYI는 출시 당일 이를 등록했고 이에 대해 **586회의 실시간 테스트 호출**을 수행했습니다. 이 페이지의 기능 매트릭스, 파라미터 동작, 과금 참고 사항은 모두 공식 문서를 그대로 옮긴 것이 아니라 이러한 테스트에서 나온 것입니다.

<Info>
  **Qwen3.8-Max는 APIYI에서 사용 가능합니다**: 모델 이름은 `qwen3.8-max`입니다. **추론은 기본적으로 켜져 있으며**(`xhigh` 티어에서 적용되고, 추론 token은 출력으로 과금됨), 일상적인 채팅에서는 `reasoning_effort="none"`를 명시적으로 설정하십시오. 테스트에서는 이 설정으로 출력이 대략 158 token에서 5 token으로 줄었습니다. 이전 세대는 [Qwen3.6 시리즈(레거시)](/ko/api-capabilities/qwen-3-6/overview)를 참조하십시오.
</Info>

## 이 모델을 선택하는 이유

<CardGroup cols={2}>
  <Card title="공식 대비 17.5％ 저렴" icon="tag">
    1M token당 입력 \$1.65, 출력 \$4.95로 Alibaba Cloud의 \$2/\$6보다 저렴합니다. [충전 프로모션](/ko/faq/recharge-promotions)이 추가로 적용됩니다.
  </Card>

  <Card title="1M 컨텍스트, 검증됨" icon="scroll">
    마커가 문서 중간과 끝에 숨겨진 8K / 32K / 128K 본문 전반에서 두 엔드포인트 모두 **6/6 전부를 정확히** 회수했습니다. 128K 호출은 약 80초가 걸립니다.
  </Card>

  <Card title="세 가지 모달리티, 하나의 모델" icon="eye">
    텍스트, 이미지, 동영상 입력 모두 정상 작동이 검증되었습니다 — “긴 컨텍스트 모델”과 “비전 모델”을 오갈 필요가 없습니다.
  </Card>

  <Card title="훨씬 더 강력한 에이전틱 작업" icon="wrench">
    FrontierSWE는 이전 세대의 40.7에서 **73.5**로, DeepSWE는 21.6에서 56.6으로 상승했습니다. 도구 호출 체인은 완성되었으며, 2회 왕복이 검증되었습니다.
  </Card>
</CardGroup>

## 엔드포인트 지원

| 엔드포인트                  | 상태              | 메모                                                                                                                                            |
| ---------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/chat/completions` | ✅ 완전히 작동함       | **권장합니다.** 도구 호출, 구조화된 출력, 멀티모달, 스트리밍이 모두 검증됨                                                                                                 |
| `/v1/messages`         | ⚠️ 코드 통합에 사용 가능 | 대화 기록을 재생하기 전에 `thinking` 블록을 제거해야 합니다. 그렇지 않으면 두 번째 턴에서 400이 반환됩니다. Claude Code 같은 기성 클라이언트는 아직 사용할 수 없습니다 — 아래의 "Anthropic 엔드포인트 사용"을 참조하세요 |
| `/v1/responses`        | ❌ 아직 지원되지 않음    | 30개의 테스트 호출이 모두 실패했습니다. 상위 시스템에 보고됨                                                                                                           |

## 가격

1M tokens당, 할인 전 정가:

| 항목        | APIYI         | Alibaba Cloud | 차이       |
| --------- | ------------- | ------------- | -------- |
| 입력        | **\$1.65**    | \$2.00        | 17.5％ 낮음 |
| 출력(추론 포함) | **\$4.95**    | \$6.00        | 17.5％ 낮음 |
| 캐시 읽기     | **\$0.20625** | \$0.25        | 17.5％ 낮음 |
| 캐시 쓰기     | **\$2.0625**  | —             | —        |

[충전 프로모션](/ko/faq/recharge-promotions)은 추가로 적용되어 더 낮은 실효 비용을 제공합니다.

## 사양

| Item                | Value                                                    |
| ------------------- | -------------------------------------------------------- |
| Model name          | `qwen3.8-max`                                            |
| Architecture        | Sparse MoE, 총 2.4조 파라미터                                  |
| Context window      | 1M tokens (생각 없이 입력 991K, 포함 시 983K)                     |
| Max output          | 131,072 tokens (범위를 벗어난 요청은 명시적 상한 `[1, 131072]`을 반환합니다) |
| Max thinking budget | 262K tokens                                              |
| Thinking mode       | 기본적으로 켜짐, 티어 `xhigh`                                     |
| Input modalities    | 텍스트, 이미지, 동영상                                            |
| Output rate         | \~19–22 tokens/s (측정됨)                                   |
| Time to first token | \~1.85 s 스트리밍 (측정된 P50)                                  |

공식 벤치마크: GPQA Diamond 92.6, PaperBench 93.0, OmniDocBench 1.5 92.1, Terminal-Bench 2.1 86.6, OSWorld-Verified 86.1, IFBench 82.8, FrontierSWE 73.5, SWE-bench Pro 67.7.

## 추론 제어(가장 중요한 섹션)

Qwen3.8-Max는 기본적으로 `xhigh` 티어에서 추론합니다. 추론 token은 출력으로 과금되며, 대개 그 90％ 이상을 차지합니다.

### 7개 값, 4개의 실제 티어

이 매개변수는 7개 값을 받지만 실제로는 4개의 실제 티어에만 매핑됩니다:

| 전달한 값                    | 실제 티어            | 실측 추론량          |
| ------------------------ | ---------------- | --------------- |
| `none`                   | 추론 끔             | 0 token         |
| `minimal` / `low`        | 낮음               | 약 100 token     |
| `medium`                 | 중간               | 약 150 token     |
| `high` / `xhigh` / `max` | 기본 티어(세 값 모두 동일) | 약 150–175 token |

`max`을 전달해도 `xhigh`보다 더 많이 추론하지는 않습니다. 그 외의 값은 허용된 집합을 나열한 400을 반환합니다.

### 추론을 끄는 방법

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Hello"}],
    reasoning_effort="none",
    max_tokens=500,
)
```

`enable_thinking: false`는 `extra_body` 및 `chat_template_kwargs: {"enable_thinking": false}`와 동등하며, 역시 작동합니다.

<Warning>
  **`max_tokens`는 추론 token을 제한하지 않습니다.** `max_tokens=1`을 설정했지만 여전히 **1,054**개 출력 token이 과금되었고, 그중 1,045개는 추론이었습니다.

  `max_tokens`은(는) 보이는 답변만 잘라냅니다. **비용을 제어하려면 `reasoning_effort`을 사용하십시오 — `max_tokens`에 의존하지 마십시오.**
</Warning>

### `thinking_budget`는 영향을 주지 않습니다

128 / 512 / 4096을 전달해도 모두 `low` 티어와 동일하게 동작합니다. 숫자 자체는 무시됩니다. **대신 `reasoning_effort`을 사용하십시오.**

## 코드 예시

### Python (OpenAI SDK 호환)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# Everyday chat: thinking off, fast and cheap
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Explain load balancing in one sentence."}],
    reasoning_effort="none",
    max_tokens=500,
)
print(resp.choices[0].message.content)

# Hard reasoning: keep the default thinking tier
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Prove that among any 5 integers, some 3 sum to a multiple of 3."}],
    max_tokens=4000,
)
print(resp.choices[0].message.reasoning_content)  # thinking trace
print(resp.choices[0].message.content)            # final answer
```

### 이미지 입력

```python theme={null}
import base64

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "What number is written in this image?"},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
    ]}],
    max_tokens=500,
)
```

원격 이미지 URL도 이 엔드포인트에서 작동합니다 — `url`를 `https://...` 주소로 설정하기만 하면 됩니다.

### 동영상 입력

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "What happens in this video?"},
        {"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{b64_video}"}},
    ]}],
    max_tokens=1000,
)
```

<Tip>
  테스트에서 동영상 이해는 호출당 **144–285초**가 걸렸습니다. 클라이언트 타임아웃을 300초 이상으로 설정하고, 스트리밍 또는 비동기 작업 큐를 우선 사용하십시오.
</Tip>

또한 프레임 시퀀스 형식인 `{"type": "video", "video": [frame1, frame2, ...]}`도 있으며, **4–8000프레임**이 필요합니다. 4보다 적으면 400이 반환됩니다.

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.8-max",
    "messages": [{"role": "user", "content": "Hello"}],
    "reasoning_effort": "none"
  }'
```

## 도구 호출

Chat Completions 엔드포인트의 도구 호출은 **완전히 작동합니다**: 단일 도구, 병렬 도구, 2라운드 왕복, 20개 도구 중 1개 선택, 스트리밍 델타, 그리고 `parallel_tool_calls: false` 모두 검증되었습니다.

<Warning>
  **강제 도구 호출에는 추론을 꺼야 합니다.** `tool_choice`가 `"required"`이거나 특정 함수를 지정하면, `reasoning_effort="none"`도 설정해야 합니다. 그렇지 않으면 400(`tool_choice does not support being set to required or object in thinking mode`)이 발생하거나 호출이 조용히 건너뛰어집니다.

  `tool_choice`를 `"auto"` / `"none"`로 설정해도 영향이 없습니다. 같은 내용이 `n > 1`에도 적용됩니다.
</Warning>

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "What's the weather in Beijing?"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
    reasoning_effort="none",   # required
)
```

## 구조화된 출력

`response_format`를 테스트에서 `json_schema`가 **엄격하게** 유지된 상태로 사용하면: 중첩 객체, 열거형, 배열, 그리고 `additionalProperties: false`가 모두 적용되었으며, 추가 필드나 Markdown 코드 펜스는 없었습니다.

<Tip>
  **구조화된 출력에서는 추론을 비활성화합니다.** 같은 스키마를 나란히 측정한 결과입니다:

  | 구성                                        | 출력 tokens | 그중 추론 | 지연 시간 |
  | ----------------------------------------- | --------- | ----- | ----- |
  | `json_schema` + 기본 추론                     | 4,066     | 3,971 | 100 s |
  | `json_schema` + `reasoning_effort="none"` | 154       | 0     | 4.7 s |

  준수성은 동일했으며, 비용과 지연 시간은 한 자릿수 차이였습니다.
</Tip>

## 컨텍스트 캐싱

* **1,024 token 전후의 적중 임계값**: 818 token 접두어는 적중하지 않았고, 1,070 tokens 이상은 적중했습니다
* **실제 멀티턴 대화는 적중합니다**: 메시지를 턴마다 추가하면 매 라운드마다 적중했습니다
* **긴 문서에서 가장 큰 이점을 얻습니다**: 128K에서는 입력의 98.6％가, 32K에서는 99.3％가 캐시되었습니다

<Warning>
  **API 응답의 캐시 필드로 적중 여부를 판단하지 마십시오.** 일부 경로에서는 `cache_read_input_tokens`이 항상 0이고, 다른 경로에서는 응답에 캐시 필드가 전혀 없지만 — 바로 같은 요청이 콘솔 과금 기록에서는 실제 캐시 읽기로 표시됩니다.

  **콘솔의 “캐시 과금 세부정보”를 신뢰하십시오.** 여기에는 캐시 생성(1.25x)과 캐시 읽기(0.125x)에 대해 token 수와 금액이 각각 따로 나열됩니다.
</Warning>

<Tip>
  **캐시 과금 방식은 엔드포인트별로 고정되어 있지 않으며 — 경로에 따라 달라집니다.** 테스트에서는 같은 경로의 동일한 형태 요청이 다른 날에 두 가지 서로 다른 방식으로 과금되었습니다.

  | 방식           | 정산 방식                                       |
  | ------------ | ------------------------------------------- |
  | OpenAI 캐시    | prompt tokens에 포함됩니다; 캐시된 부분은 0.125x로 과금됩니다 |
  | Anthropic 캐시 | 기본 token과 별도로 정산됩니다: 생성은 1.25x, 읽기는 0.125x  |

  콘솔 로그에서 요청 하나를 열면 “캐시 과금 세부정보”에 어떤 방식이 적용되었는지 표시되고 전체 계산이 나옵니다. **특정 호출이 실제로 어떻게 과금되었는지 확인할 수 있는 유일한 곳입니다.**
</Tip>

<Tip>
  Anthropic 엔드포인트에서는 `cache_control` 없이도 암묵적 캐시 적중이 가능합니다. 모든 곳에 마커를 추가하기 전에 콘솔에서 실제 과금을 비교하십시오 — 마커를 붙이는 것이 항상 더 저렴하다고 가정하지 마십시오.
</Tip>

## Anthropic 엔드포인트 사용하기

`/v1/messages`는 코드 통합에 사용할 수 있지만, 히스토리를 다시 재생하기 전에 반드시 `thinking` 블록을 제거해야 합니다. 그렇지 않으면 400(`if content is list. item must be dict and key[type] should in dict`)이 발생합니다.

```python theme={null}
def strip_thinking(blocks):
    return [b for b in blocks if b.get("type") != "thinking"]

messages.append({"role": "assistant", "content": strip_thinking(resp["content"])})
```

이 필터를 적용한 상태에서, 3턴 간 턴 간 메모리, 2회 왕복 도구 호출, 그리고 도구 결과가 이후 턴까지 유지되는 것을 확인했습니다.

### 2026-08-08 후속 확인: 멀티턴 도구 호출 자체는 정상입니다

전용 300회 재시험 결과 **멀티턴 `tool_use` / `tool_result` 체인 자체가 작동함**이 확인되었습니다. 유일한 장애 요인은 `thinking` 블록입니다:

* **`tool_result`에는 추가 형식 제한이 없습니다.** 문자열 또는 블록 배열 `content`, `is_error` 참/거짓, 빈 결과, 50KB 결과, 순서가 뒤섞인 재재생, 부분 재재생, 조작된 `tool_use_id` — 15가지 형태 모두 통과했습니다. 제어 문자, 이모지, 200,000자 단일 줄도 통과했습니다.
* **`signature` 값은 아무 소용이 없습니다.** 빈 문자열, `null`, 키를 아예 제거한 경우, 또는 조작된 값 모두 같은 400을 반환합니다. **전체 블록을 제거해야 합니다.**
* **스트레스 테스트는 제거 후 통과했습니다.** 24K-token 시스템 prompt와 8개 tools가 있는 자율 에이전트 루프에서, 12턴 × 2회 실행, 컨텍스트가 28.7K까지 증가했는데도 — **24/24 성공했습니다**.
* **SSE 이벤트는 완전합니다**: `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`, `message_stop`, 그리고 `ping`입니다. `text_delta`, `thinking_delta`, `signature_delta`, `input_json_delta` 모두 올바르게 동작합니다.
* **요청 제한이나 동시 실행 수 제한은 관찰되지 않았습니다**: 동일한 요청을 순차적으로 40번 반복해도 모두 성공했으며, 동시 실행 수 1 / 4 / 8 / 16 / 32에서도 모두 성공했고 429는 없었습니다.

<Warning>
  **Claude Code와 같은 기성 클라이언트는 아직 사용할 수 없습니다.** 이들은 히스토리 콘텐츠 블록을 그대로 재전송하며 동작을 변경할 수 없으므로, **첫 번째 턴은 `tool_use`를 정상적으로 반환하지만, 두 번째 턴에서 `tool_result`를 다시 보내면 400이 반환됩니다** — 이는 이 엔드포인트에서 가장 흔한 실패 보고입니다.

  최신 Claude Code 빌드도 `thinking: {"type": "adaptive"}`를 보냅니다. 일부 라우트는 `enabled` / `disabled` / `auto`만 허용하며 **첫** 턴에서 400을 반환합니다.

  대신 `/v1/chat/completions`를 사용하십시오.
</Warning>

### Claude Code 안에서 사용하고 싶다면

“하나의 특정 클라이언트에서만 작동하지 않는” 이 부류의 문제는 **제한이 우리의 적응이 아니라 모델 측에 있을 가능성이 큽니다.** 먼저 Alibaba Cloud의 Bailian 플랫폼에서 동일한 사용법을 검증해 보시기 바랍니다(콘솔: `bailian.console.aliyun.com`):

* 공식 플랫폼에서도 거부되면, 이는 모델 측의 제한이며 우리가 우회할 방법은 없습니다.
* 거기에서는 되지만 여기에서는 안 되면, 요청 본문을 보내 주시면 채널 제공업체에 확인하겠습니다.

목표가 단순히 **Claude Code 및 유사한 클라이언트 안에서 작업을 끝내는 것**이라면, APIYI **Claude 시리즈** 또는 **OpenAI 시리즈**가 더 쉬운 경로입니다 — 기본 그룹은 공식 릴레이로 연결되어 추가 적응이 필요 없습니다.

### 기타 차이점 및 현장 메모

* `response_format`는 조용히 무시됩니다(구조화된 출력을 위해 도구 호출을 강제하십시오)
* `tool_choice`는 OpenAI 포맷만 허용합니다; **강제 도구 호출(`required` 또는 이름이 지정된 함수)은 두 엔드포인트 모두의 추론 모드에서 지원되지 않습니다**
* 이미지는 base64여야 합니다. 원격 URL은 400을 반환합니다
* `reasoning_effort`는 아무 효과가 없습니다 — 추론을 끄려면 `thinking: {"type": "disabled"}`를 사용하십시오
* `stop_sequences`는 **잘립니다**, 하지만 `stop_reason`는 `end_turn`로 잘못 보고되고 `stop_sequence` 필드는 `null`로 돌아오므로, 생성이 중단된 이유를 감지하는 데 의존하지 마십시오
* 스트리밍 사용량은 라우트에 따라 다릅니다: 일부 라우트에서는 `input_tokens` in `message_start`가 신뢰할 수 없고, 다른 라우트에서는 최종 스트리밍 `output_tokens`가 항상 0입니다. **정확한 정산을 위해서는 비스트리밍 사용량이나 과금 기록을 사용하십시오**
* 측정된 입력 상한은 983,616 tokens입니다. 이를 넘으면 `Range of input length should be [1, 983616]`가 반환됩니다

<Tip>
  **타임아웃은 넉넉하게 설정하십시오.** 테스트에서 첫 SSE 바이트가 나오기까지 6\~17초가 걸렸고, 그 전까지 연결은 완전히 무응답 상태였습니다. 더 큰 요청 본문은 더 느려서 — 256KB에서는 약 44초, 1MB에서는 160초가 걸렸습니다. Docker 뒤, 배스천 호스트 뒤, 또는 기업 게이트웨이 뒤에서는 어느 구간에서든 유휴 타임아웃이 발생하면 “오랫동안 멈춘 뒤 오류와 함께 종료됩니다”처럼 보입니다. 클라이언트 타임아웃은 300초 이상으로 설정하십시오.
</Tip>

## 매개변수 호환성

| 매개변수                                               | 상태 | 비고                                                                                        |
| -------------------------------------------------- | -- | ----------------------------------------------------------------------------------------- |
| `temperature`                                      | ✅  | 유효 범위 `[0.0, 2.0)`; 2를 전달하면 400이 반환됩니다                                                    |
| `top_p`                                            | ✅  | 유효 범위 `(0.0, 1.0]`                                                                        |
| `top_k` / `presence_penalty` / `frequency_penalty` | ✅  |                                                                                           |
| `stop` / `stop_sequences`                          | ⚠️ | 절단은 동작하지만, Anthropic 엔드포인트에서 `stop_reason`가 `end_turn`로 잘못 보고됩니다                          |
| `logprobs` / `top_logprobs`                        | ✅  |                                                                                           |
| `stream` + `stream_options`                        | ⚠️ | 긴 스트림은 끝부분 지연 없이 깔끔하게 종료되지만, 스트리밍 사용량은 경로에 따라 달라집니다 — 정확한 집계를 위해서는 비스트리밍 또는 과금 기록을 사용하십시오 |
| `partial: true`                                    | ✅  | 접두사 이어쓰기; 이어쓰기 중에는 추론이 없습니다                                                               |
| `n > 1`                                            | ⚠️ | `reasoning_effort="none"`이 필요합니다                                                          |
| `seed`                                             | ❌  | 동일한 seed로도 다른 출력이 생성되었습니다 — 결정성이 보장되지 않습니다                                                |
| `prefix: true`                                     | ❌  | 영향이 없습니다; `partial: true`를 사용하십시오                                                         |
| `thinking_budget`                                  | ❌  | 숫자 값은 무시됩니다                                                                               |
| 내장 웹 검색                                            | ❌  | `enable_search`과 `tools: [{"type": "web_search"}]`이 모두 조용히 삭제됩니다                          |

## 모범 사례

<CardGroup cols={2}>
  <Card title="일상 대화 및 대량 호출" icon="zap">
    `reasoning_effort="none"`을 명시적으로 설정하십시오. 측정된 지연 시간은 약 5초에서 2초로 줄었고, output tokens는 대략 1/30로 감소했습니다.
  </Card>

  <Card title="긴 문서 및 코드베이스" icon="scroll">
    128K recall은 테스트에서 정확했으며, 긴 문서의 캐시 적중률이 높습니다. 큰 문서는 메시지 목록 앞쪽에 두고 질문은 끝에 두십시오.
  </Card>

  <Card title="데이터 추출" icon="braces">
    `json_schema`로 제약을 걸고 thinking을 비활성화하십시오. 준수도는 영향을 받지 않습니다.
  </Card>

  <Card title="에이전트 및 도구 오케스트레이션" icon="wrench">
    `/v1/chat/completions`를 사용하십시오. 도구 호출을 강제할 때는 thinking을 비활성화하는 것을 잊지 마십시오.
  </Card>
</CardGroup>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="max_tokens를 설정했는데도 왜 여전히 많은 tokens가 과금됩니까?">
    `max_tokens`는 보이는 답변만 제한하고 추론 부분은 제한하지 않습니다. 우리는 1,054 output tokens가 `max_tokens=1`로 과금되는 것으로 측정했습니다. 비용을 제어하려면 `reasoning_effort="none"`를 사용하십시오.
  </Accordion>

  <Accordion title="이름이 지정된 함수가 있는 tool_choice는 왜 400을 반환합니까?">
    추론이 켜져 있는 동안에는 강제 tool\_choice를 지원하지 않습니다. 함께 `reasoning_effort="none"`를 전달하십시오.
  </Accordion>

  <Accordion title="왜 /v1/responses에 접근할 수 없습니까?">
    이 엔드포인트는 아직 모델에 연결되지 않았습니다 — 30회의 테스트 호출이 모두 실패했으며, 오류 코드는 404와 400 사이를 번갈아 가며 나타났습니다. 이는 상위 측에 보고되었으며, 사용 가능해지면 [라이브 업데이트](/en/live)에서 공지하겠습니다. 대신 `/v1/chat/completions`를 사용하십시오.
  </Accordion>

  <Accordion title="이 모델을 Claude Code에서 사용할 수 있습니까?">
    아직은 불가능합니다. `/v1/messages` 엔드포인트는 `thinking` 블록을 포함한 기록 메시지를 거부하며, Claude Code는 이를 그대로 다시 재생합니다 — 그래서 첫 턴에서는 `tool_use`가 발생하고, 두 번째 턴에서 `tool_result`가 다시 돌아오면 400이 반환됩니다. 직접 작성한 코드에서 호출할 때는 이러한 블록을 제거하면 엔드포인트가 정상적으로 동작합니다.

    Claude Code 안에서 작업을 진행해야 한다면, APIYI Claude 시리즈나 OpenAI 시리즈가 더 쉬운 방법입니다 — 기본 그룹은 공식적으로 라우팅되며 추가 조정이 필요 없습니다. 또한 Alibaba Cloud의 Bailian 플랫폼(`bailian.console.aliyun.com`)에서 동일한 사용 방식으로 먼저 확인할 수도 있습니다. 공식 플랫폼도 이를 거부한다면 모델 측 제한입니다.
  </Accordion>

  <Accordion title="첫 턴은 왜 작동하다가 tool 결과를 보낸 뒤 멈추거나 오류가 발생합니까?">
    이것은 `/v1/messages`에서 나타나는 전형적인 증상입니다. 재생된 assistant 메시지에 `thinking` 블록이 포함되어 있으며, 이 엔드포인트는 이를 400으로 거부합니다. `signature`을 빈 문자열로 설정하거나 `null`로 설정하거나, 필드를 제거해도 도움이 되지 않습니다 — **전체 `thinking` 블록을 반드시 제거해야 합니다**.

    한 번 제거하면, 24K 컨텍스트에서 12턴 tool 루프는 테스트에서 끝까지 실행되었습니다. 다중 턴 `tool_use` / `tool_result` 체인 자체가 문제는 아닙니다.
  </Accordion>

  <Accordion title="왜 reasoning_tokens나 cache 필드가 때때로 usage에서 누락됩니까?">
    이 모델은 둘 이상의 상위 경로를 통해 제공되며, 이들은 동일한 usage 필드를 보고하지 않습니다: 일부는 `reasoning_tokens`과 `cached_tokens`를 생략하고, 일부는 항상 `cache_read_input_tokens`를 0으로 보고하며, 일부는 최종 스트리밍된 `output_tokens`를 항상 0으로 보고합니다. 정합성을 위해 이는 상위 측에 보고되었습니다.

    **API가 보고하는 내용이 실제 과금 내역은 아닙니다.** 정확한 계산을 위해서는 콘솔 로그의 개별 요청에 있는 과금 상세를 사용하십시오. 여기에는 기본 요금과 캐시 요금 모두에 대한 전체 계산이 표시됩니다.
  </Accordion>

  <Accordion title="동영상 호출은 왜 이렇게 느립니까?">
    동영상 이해는 호출당 144–285초로 측정되었으며, 이는 모델 자체의 처리 시간입니다. timeout을 300초 이상으로 설정하고 비동기 큐를 고려하십시오.
  </Accordion>
</AccordionGroup>

## 관련

* [Qwen3.8-Max 플레이그라운드](/ko/api-capabilities/qwen-3-8/chat-completions) — 요청을 직접 전송합니다
* [Qwen3.6 시리즈(레거시)](/ko/api-capabilities/qwen-3-6/overview) — 이전 다섯 개 모델입니다
* [Qwen3.8-Max 출시 노트](/en/news/qwen-3-8-max-launch) — 벤치마크와 전체 설명입니다
* [모델 요금](/en/models) — 모델별 요율, 캐시 요금, 사용 가능한 엔드포인트입니다
* [충전 프로모션](/ko/faq/recharge-promotions) — 중복 적용 가능한 할인입니다

<Info>
  이 페이지의 측정값은 2026-08-03(12:50–14:35 UTC+8)에 수행한 586회의 실시간 호출에서 가져왔습니다. 과금 관련 결론은 API가 반환한 usage 필드를 기준으로 하며, 송장과 한 줄씩 대조하지는 않았습니다. 채널 조정에 따라 모델 및 게이트웨이 동작은 변경될 수 있으므로, 실시간 호출을 기준 소스로 보아야 합니다.
</Info>
