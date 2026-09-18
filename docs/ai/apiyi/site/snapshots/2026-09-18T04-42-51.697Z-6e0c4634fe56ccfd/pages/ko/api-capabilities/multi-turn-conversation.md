> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 다중 턴 대화 가이드

> APIYI에서 다중 턴 채팅을 구현합니다: OpenAI 호환 모드(다중 모델)와 OpenAI / Gemini / Anthropic 네이티브 형식의 히스토리 처리, 비교 및 자주 묻는 질문을 포함합니다.

LLM에는 **고유한 기억이 없습니다** — 모델은 방금 전에 사용자가 말한 내용을 기억하지 못합니다. "멀티턴 대화"란 사실상 **매 요청마다 전체 대화 기록을 전송하는 것**을 의미합니다. 이 가이드는 APIYI의 네 가지 호출 형식이 각각 그 기록을 어떻게 유지하는지와 주의해야 할 함정을 설명합니다.

<Info>
  예제는 엔드포인트 `https://api.apiyi.com`와 귀하의 [APIYI 토큰](https://api.apiyi.com/token)을 사용합니다. 참조되는 모델: `gpt-5.4-mini`, `deepseek-v4-pro`, `gemini-3.5-flash`, `claude-sonnet-4-6`.
</Info>

## 핵심 원칙: 히스토리를 직접 유지

한 문장으로 요약됩니다: **모델은 상태를 가지지 않으며, 여러분(클라이언트)이 히스토리를 유지하고 매 턴마다 그 전체를 다시 전송합니다.**

```text theme={null}
Turn 1: send [user Q1]                              → get [reply 1]
Turn 2: send [user Q1, reply 1, user Q2]            → get [reply 2]
Turn 3: send [user Q1, reply 1, user Q2, reply 2, user Q3] → get [reply 3]
```

각 새 턴마다 이전 사용자 메시지와 모델 응답을 히스토리 배열의 끝에 **추가**한 다음, 전체를 전송합니다. 형식 간의 차이는 히스토리 배열의 이름과 역할 표기 방식뿐입니다.

<Warning>
  **APIYI에서는 항상 “히스토리를 직접 유지”하는 방식을 사용하십시오.** OpenAI Responses의 `previous_response_id`처럼 서버 측 대화 상태에 의존하지 마십시오. 이는 아래의 OpenAI 네이티브 섹션에서 설명하듯 게이트웨이를 통해서는 정상 동작이 보장되지 않습니다.
</Warning>

## OpenAI 호환 모드(모델 전반에서 작동)

가장 범용적인 접근 방식은 엔드포인트 `/v1/chat/completions`입니다. 기록은 `messages` 배열에 저장되며, 각 항목에는 `role`(`system` / `user` / `assistant`)가 포함됩니다. **`model` 문자열을 바꾸면 같은 코드로 다른 모델을 구동할 수 있습니다**(gpt, deepseek, claude, gemini…).

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  messages = [{"role": "system", "content": "You are a friendly assistant."}]

  def chat(user_input, model="gpt-5.4-mini"):
      messages.append({"role": "user", "content": user_input})
      resp = client.chat.completions.create(model=model, messages=messages)
      reply = resp.choices[0].message.content
      messages.append({"role": "assistant", "content": reply})  # append reply to history
      return reply

  print(chat("My name is Alice and I'm 28. Please remember."))
  print(chat("How old am I? And plus 5?"))   # remembers → 28, 33
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });
  const messages = [{ role: 'system', content: 'You are a friendly assistant.' }];

  async function chat(userInput, model = 'gpt-5.4-mini') {
    messages.push({ role: 'user', content: userInput });
    const resp = await client.chat.completions.create({ model, messages });
    const reply = resp.choices[0].message.content;
    messages.push({ role: 'assistant', content: reply });   // append reply to history
    return reply;
  }

  console.log(await chat("My name is Alice and I'm 28. Please remember."));
  console.log(await chat('How old am I?'));
  ```

  ```bash cURL theme={null}
  {/* Turn 2: include both the question and answer from turn 1 */}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "deepseek-v4-pro",
      "messages": [
        {"role": "user", "content": "My name is Alice and I am 28. Please remember."},
        {"role": "assistant", "content": "Got it: your name is Alice and you are 28."},
        {"role": "user", "content": "How old am I?"}
      ]
    }'
  ```
</CodeGroup>

<Tip>
  **하나의 코드베이스, 여러 모델**: `model`를 `deepseek-v4-pro`, `claude-sonnet-4-6`, `gemini-3.5-flash` 또는 다른 모델로 바꾸기만 하면 멀티턴 로직은 동일하게 유지됩니다. [모델 및 가격 개요](/ko/api-capabilities/model-info)를 참조하십시오.
</Tip>

### 추론 모델의 기록 처리

`deepseek-v4-pro` 같은 추론 모델은 추가 `reasoning_content`(사고의 흐름) 필드를 반환합니다.

<Warning>
  **기록에는 `content`만 남기고, `reasoning_content`는 다시 전달하지 마십시오.** 생각 과정은 현재 턴의 중간 산출물일 뿐입니다. 이를 다시 전달하면 tokens를 낭비하고 상위 규칙을 위반합니다(DeepSeek의 직접 API는 이에 대해 400을 반환하기도 합니다). 기록에 추가할 때는 `content`만 취하십시오:

  ```python theme={null}
  messages.append({"role": "assistant", "content": resp.choices[0].message.content})
  # do NOT include resp.choices[0].message.reasoning_content
  ```
</Warning>

추론 모델 응답 파싱에 대한 자세한 내용은 [추론 모델 출력](/ko/api-capabilities/openai/reasoning-models)를 참조하십시오.

## OpenAI 네이티브 형식 (Responses API)

엔드포인트 `/v1/responses`. 멀티턴의 경우, **전체 기록을 `input` 배열로 전달합니다**(각 항목에 `role` / `content` 포함) — 호환 모드와 동일한 자체 관리 방식입니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

resp = client.responses.create(
    model="gpt-5.4-mini",
    input=[
        {"role": "user", "content": "Remember the codeword: purple elephant."},
        {"role": "assistant", "content": "Got it, the codeword is purple elephant."},
        {"role": "user", "content": "What's the codeword?"},
    ],
)
print(resp.output_text)   # The codeword is: purple elephant.
```

<Warning>
  **서버 측 상태에 의존하지 마십시오**. 예: `previous_response_id` / `conversation` / `store`. APIYI 게이트웨이를 통해 테스트한 결과, `previous_response_id`를 전달해도 오류는 발생하지 않지만(200을 반환하지만), 다음 턴에서는 이전 내용을 **기억하지 못하며**, `GET /v1/responses/{id}`를 사용할 수 없습니다. 따라서 APIYI에서는 위와 같이 Responses API를 **자체 관리 기록**(`input` 배열)과 함께 사용하십시오.
</Warning>

## Gemini 네이티브 형식

엔드포인트 `/v1beta/models/{model}:generateContent`. 기록은 `contents` 배열에 있습니다. **역할은 `user` / `model`입니다**(`assistant`가 아니며), 각 항목의 content는 `parts`에 들어갑니다.

```python theme={null}
from google import genai

client = genai.Client(api_key="YOUR_API_KEY",
                      http_options={"base_url": "https://api.apiyi.com"})

contents = [
    {"role": "user", "parts": [{"text": "Remember the codeword: purple elephant."}]},
    {"role": "model", "parts": [{"text": "Got it: purple elephant."}]},
    {"role": "user", "parts": [{"text": "What's the codeword?"}]},
]
resp = client.models.generate_content(model="gemini-3.5-flash", contents=contents)
print(resp.text)   # The codeword is: purple elephant.
```

<Tip>
  **더 간단하게는**: 공식 `google-genai` SDK의 `client.chats.create(...)`가 `contents` 이력을 대신 유지합니다 — `send_message`만 호출하면 되며, 수동으로 이어 붙일 필요가 없습니다.
</Tip>

<Note>
  Gemini 3 시리즈 응답은 각 부분에 `thoughtSignature`를 부착합니다. **일반 텍스트 멀티턴에서는 `text`만 다시 전달해도 컨텍스트를 유지하기에 충분하며**(토큰도 더 적게 듭니다); function calling처럼 엄격한 추론 연속성이 필요한 경우에만 `thoughtSignature`를 원문 그대로 되돌려 보내야 합니다 — 공식 SDK가 이를 자동으로 처리합니다. [Gemini Native Calls](/ko/api-capabilities/gemini/native) 및 [함수 호출](/ko/api-capabilities/gemini/function-calling)을 참조하십시오.
</Note>

## Anthropic 네이티브 형식

엔드포인트 `/v1/messages`. 히스토리는 역할이 `user` / `assistant`인 `messages` 배열에 있습니다. `content`는 일반 문자열일 수 있습니다. 참고로 **`max_tokens`는 필수입니다**.

```python theme={null}
import requests

def chat(messages):
    r = requests.post(
        "https://api.apiyi.com/v1/messages",
        headers={
            "content-type": "application/json",
            "anthropic-version": "2023-06-01",
            "x-api-key": "YOUR_API_KEY",
        },
        json={"model": "claude-sonnet-4-6", "max_tokens": 200, "messages": messages},
        timeout=60,
    )
    return "".join(b["text"] for b in r.json()["content"] if b["type"] == "text")

messages = [{"role": "user", "content": "Remember the codeword: purple elephant."}]
reply = chat(messages)
messages.append({"role": "assistant", "content": reply})       # append reply
messages.append({"role": "user", "content": "What's the codeword?"})
print(chat(messages))   # The codeword is: purple elephant.
```

<Tip>
  또한 base\_url을 `https://api.apiyi.com`로 지정하면 공식 `anthropic` SDK를 사용할 수 있습니다. 응답은 `content` 블록 배열입니다. 파싱 세부 정보는 [Claude Streaming & Responses](/ko/api-capabilities/claude-response-handling)에서 확인할 수 있습니다.
</Tip>

## 네 가지 형식 비교

| 항목       | OpenAI 호환              | OpenAI 네이티브 (Responses) | Gemini 네이티브                 | Anthropic 네이티브 |
| -------- | ---------------------- | ----------------------- | --------------------------- | -------------- |
| 엔드포인트    | `/v1/chat/completions` | `/v1/responses`         | `/v1beta/…:generateContent` | `/v1/messages` |
| 히스토리 필드  | `messages`             | `input`                 | `contents`                  | `messages`     |
| 역할       | system/user/assistant  | user/assistant          | **user/model**              | user/assistant |
| 콘텐츠 형식   | `content` 문자열          | `content` 문자열           | `parts: [{text}]`           | `content` 문자열  |
| 히스토리 소유자 | 사용자                    | 사용자                     | 사용자                         | 사용자            |
| 서버 측 상태  | 없음                     | ⚠️ 사용할 수 없음             | 없음                          | 없음             |
| 모델 간     | ✅ 전환 `model`           | OpenAI 전용               | Gemini 전용                   | Claude 전용      |

<Tip>
  **선택 기준**: 여러 벤더에 걸쳐 하나의 코드베이스를 원하면 → **OpenAI 호환 모드**를 선호하십시오. 벤더의 네이티브 전용 기능(Gemini thought signatures / 코드 실행, Claude thinking 블록 및 캐싱, OpenAI 내장 tools)이 필요하면 → 해당 **네이티브 형식**을 사용하십시오.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="대화가 길어질수록 비용이 더 많이 들까요?">
    그렇습니다. 매 턴마다 전체 이력을 다시 전송하므로 **input tokens는 턴 수에 따라 늘어나며** 그에 따라 비용도 증가합니다. 비용을 줄이는 핵심 방법은 **컨텍스트 캐싱**입니다. 동일한 이력 접두사는 자동으로 캐시 요율을 적용받아(정가보다 훨씬 낮음) 처리됩니다. [OpenAI 캐싱](/ko/api-capabilities/openai/prompt-caching), [Claude 캐싱](/ko/api-capabilities/claude-prompt-caching), [Gemini 캐싱](/ko/api-capabilities/gemini/prompt-caching)을 참고하십시오.
  </Accordion>

  <Accordion title="몇 턴까지 유지해야 합니까? 컨텍스트 윈도우를 초과하면 어떻게 됩니까?">
    정해진 규칙은 없지만, 이력이 길수록 비용이 더 많이 들고 모델의 컨텍스트 윈도우를 초과할 수 있습니다. 일반적인 전략은 다음과 같습니다. (1) **슬라이딩 윈도우** — 최근 N턴만 유지합니다. (2) **요약 압축** — 이전 턴을 시스템 prompt의 한 단락으로 압축합니다. (3) 시스템 지시문과 가장 최근 턴은 항상 유지합니다. 사용 사례에 필요한 “메모리” 양과 균형을 맞추십시오.
  </Accordion>

  <Accordion title="시스템 / 시스템 지시문은 어디에 넣습니까?">
    OpenAI 호환 및 Anthropic에서는 대화의 앞부분에 넣습니다(호환 방식은 `role:"system"`를 사용하고, Anthropic은 최상위 `system` 필드 또는 첫 번째 메시지를 사용합니다). Gemini에서는 `config.system_instruction`를 사용하십시오. 시스템 지시문은 **한 번만** 설정하면 되므로 매 턴 다시 추가할 필요가 없습니다.
  </Accordion>

  <Accordion title="추론 모델의 thinking (reasoning_content)을 다시 전달해야 합니까?">
    **아니오.** thinking은 한 턴의 중간 산출물입니다. 이력에는 최종 `content`만 보관하십시오(Gemini의 경우 `text`만 보관합니다). thinking을 다시 전달하면 tokens를 낭비하고 일부 상위 시스템에서는 이를 거부합니다. function-calling에서의 Gemini `thoughtSignature`는 예외이며, 공식 SDK가 자동으로 처리합니다.
  </Accordion>

  <Accordion title="서버가 대화를 기억해서 이력을 다시 전송하지 않아도 됩니까?">
    APIYI에서는 이것이 **권장되지 않습니다**. OpenAI Responses의 `previous_response_id`는 게이트웨이를 통해 동작한다고 보장되지 않습니다(테스트 결과: 메모리 없음). 모든 곳에서 클라이언트 측 자체 관리 이력을 사용하십시오. 이것이 모든 모델에서 가장 안정적이고 일관적입니다.
  </Accordion>
</AccordionGroup>

## 관련 링크

* 호출 기본: [OpenAI 호환 모드](/ko/api-capabilities/openai/compatible) · [OpenAI 네이티브 호출](/ko/api-capabilities/openai/native) · [Gemini 네이티브 호출](/ko/api-capabilities/gemini/native) · [Claude API 기본](/ko/api-capabilities/claude)
* 응답 파싱: [OpenAI 응답 처리](/ko/api-capabilities/openai/response-handling) · [추론 모델 출력](/ko/api-capabilities/openai/reasoning-models) · [Claude 스트리밍 및 응답](/ko/api-capabilities/claude-response-handling) · [Gemini 스트리밍 및 응답](/ko/api-capabilities/gemini/response-handling)
* 모델 및 요금: [모델 및 요금 개요](/ko/api-capabilities/model-info)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
