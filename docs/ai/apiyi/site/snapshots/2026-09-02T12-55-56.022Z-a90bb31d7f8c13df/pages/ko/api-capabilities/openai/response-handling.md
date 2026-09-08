> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 호환 모드: 응답 처리

> /v1/chat/completions에서 스트리밍 및 비스트리밍 응답을 파싱하는 통합된 방법입니다: 공통점을 우선하며, 몇 가지 모델별 특이사항까지 다루는 견고한 기준 파서를 제공합니다.

[호환 모드](/ko/api-capabilities/openai/compatible)를 호출하면 OpenAI, Claude, Gemini, Grok, Qwen, GLM 등 모든 모델이 동일한 OpenAI 스키마를 반환합니다. **파싱 로직의 거의 전부를 공유할 수 있습니다**: 아래 패턴을 따르면 모델을 바꿔도 코드 변경이 필요하지 않습니다.

이 페이지는 응답 처리를 처음부터 올바르게 설정하는 데 도움이 됩니다. 공통 사항을 먼저 설명한 다음, 반드시 허용해야 하는 몇 가지 차이만 담은 단일 표를 제공합니다. 그중 어느 것도 통합을 막지는 않습니다.

<Info>
  요청 측(base\_url, auth, 모델 전환)은 [Compatible Mode Calls](/ko/api-capabilities/openai/compatible)에서 다룹니다. 이 페이지는 오직 **응답 측**만 다룹니다: 반환되는 내용을 어떻게 파싱하는지에 관한 설명입니다.
</Info>

## 두 가지 모드, 하나의 엔드포인트

동일한 `/v1/chat/completions` 엔드포인트이며, `stream` 플래그만 형식을 바꿉니다:

|          | `stream: false` (기본값)        | `stream: true`                      |
| -------- | ---------------------------- | ----------------------------------- |
| 형식       | 단일 JSON 객체                   | SSE 스트림(여러 `data:` 줄)               |
| 최상위 타입   | `chat.completion`            | `chat.completion.chunk`             |
| 텍스트 가져오기 | `choices[0].message.content` | 각 `choices[0].delta.content`을 누적합니다 |
| 사용 사례    | 백엔드, 배치 작업, 전체 결과            | 채팅 UI, token 단위 렌더링                 |

## 비스트리밍 응답

안정적인 구조입니다 — `choices[0].message.content`만 읽으면 됩니다:

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4.1-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "1+1 equals 2." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 31, "completion_tokens": 8, "total_tokens": 39 }
}
```

<CodeGroup>
  ```python Python theme={null}
  resp = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "What is 1+1?"}]
  )
  print(resp.choices[0].message.content)
  print(resp.usage.total_tokens)
  ```

  ```javascript Node.js theme={null}
  const resp = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'What is 1+1?' }]
  });
  console.log(resp.choices[0].message.content);
  console.log(resp.usage.total_tokens);
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{"model":"gpt-4.1-mini","messages":[{"role":"user","content":"What is 1+1?"}]}'
  ```
</CodeGroup>

<Tip>
  비스트리밍 출력은 모든 주요 모델에서 매우 일관적입니다 — `choices[0].message.content`는 어디서나 작동합니다. 일부 모델(예: OpenAI 계열)은 `message`에서 `annotations`와 `refusal`도 추가합니다. 필요하면 읽고, 그렇지 않으면 무시하면 됩니다.
</Tip>

## 스트리밍 응답 (SSE)

스트리밍은 청크를 Server-Sent Events로 한 줄에 하나씩 `data: {...}` 형태로 전송하며, `data: [DONE]`로 끝납니다:

```text theme={null}
data: {"choices":[{"delta":{"content":"1"},"index":0}], ...}
data: {"choices":[{"delta":{"content":"+1"},"index":0}], ...}
data: {"choices":[{"delta":{},"finish_reason":"stop","index":0}], ...}
data: [DONE]
```

공식 SDK에서는 그냥 순회하기만 하면 됩니다. 핵심은 **`delta.content`를 누적하는 것**입니다:

<CodeGroup>
  ```python Python theme={null}
  stream = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "Write a short poem"}],
      stream=True
  )

  for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
          print(chunk.choices[0].delta.content, end="", flush=True)
  ```

  ```javascript Node.js theme={null}
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'Write a short poem' }],
    stream: true
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  ```
</CodeGroup>

## 통합 참고 사항: 몇 가지 차이는 있지만, 일관되게 처리할 수 있습니다

모델마다 스트리밍 세부 사항은 조금씩 다르지만, **아래 규칙을 따르면 하나의 코드 경로로 모두 처리할 수 있습니다**.

<Warning>
  **최종 청크의 `choices`는 빈 배열일 수 있습니다.** `usage`를 담는 마지막 청크는 일부 모델(gpt-4.1-mini, grok, qwen, glm)에서는 `"choices":[]`입니다. 그곳에서 `choices[0]`를 인덱싱하면 예외가 발생합니다. **읽기 전에 `choices`가 비어 있지 않은지 확인하십시오.**
</Warning>

| 차이점                 | 보이는 현상                                                           | 일관된 처리                                  |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| 최종 청크의 choices      | `[]`가 비어 있거나 비어 있지 않을 수 있습니다                                     | delta를 읽기 전에 `choices`가 비어 있지 않은지 확인합니다 |
| `finish_reason` 중간값 | 일반적으로 `null`입니다. Claude는 `""`(빈 문자열)을 사용합니다                      | `finish_reason === "stop"`로 종료를 감지합니다   |
| `usage` 위치          | 빈 choices 청크 / 비어 있지 않은 청크 / `stop`와 같은 청크                       | 세 가지를 모두 시도하고, 있을 때마다 기록합니다             |
| 청크 단위               | 토큰 단위(OpenAI) 또는 문장 단위(Gemini/Claude)                            | 무관합니다 — 그냥 누적하면 됩니다                     |
| 첫 번째 역할 선언 청크       | 일부는 `role`를 선언하는 내용이 비어 있는 청크를 보냅니다                              | 내용이 비어 있으면 건너뛰고, 텍스트로 취급하지 마십시오         |
| 공급업체 전용 필드          | `obfuscation`, `system_fingerprint`, `first_token_return_time` 등 | 무시하십시오 — 절대 의존하지 마십시오                   |

## 견고한 참조 파서

원시 SSE를 직접 처리할 때(SDK를 사용하지 않을 때), 이는 위의 모든 차이를 포괄합니다:

<CodeGroup>
  ```python Python theme={null}
  import json, requests

  def stream_chat(model, messages, api_key):
      resp = requests.post(
          "https://api.apiyi.com/v1/chat/completions",
          headers={"Authorization": f"Bearer {api_key}",
                   "Content-Type": "application/json"},
          json={"model": model, "messages": messages, "stream": True},
          stream=True, timeout=300,
      )
      text, usage = "", None
      for line in resp.iter_lines(decode_unicode=True):
          if not line or not line.startswith("data: "):
              continue
          data = line[6:]
          if data == "[DONE]":
              break
          chunk = json.loads(data)
          if chunk.get("usage"):          # usage may appear in any chunk
              usage = chunk["usage"]
          choices = chunk.get("choices")
          if not choices:                 # final chunk may be empty; guard it
              continue
          delta = choices[0].get("delta", {})
          piece = delta.get("content")
          if piece:                       # skip role-only / empty-content chunks
              text += piece
              print(piece, end="", flush=True)
          # finish_reason == "stop" is just a marker; don't break (usage often follows)
      return text, usage
  ```

  ```javascript Node.js theme={null}
  async function streamChat(model, messages, apiKey) {
    const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "", usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();             // keep the possibly-incomplete last line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return { text, usage };
        const chunk = JSON.parse(data);
        if (chunk.usage) usage = chunk.usage;        // usage may appear in any chunk
        const choices = chunk.choices;
        if (!choices || choices.length === 0) continue;  // final chunk may be empty
        const piece = choices[0].delta?.content;
        if (piece) { text += piece; process.stdout.write(piece); }
      }
    }
    return { text, usage };
  }
  ```
</CodeGroup>

<Note>
  추론 모델(grok, qwen, glm 등)은 먼저 `delta.reasoning_content`(사고의 흐름)를 스트리밍하고, 그다음 `delta.content`(답변)을 스트리밍합니다. 위의 파서는 `content`만 읽으므로, 추론 과정은 자동으로 건너뜁니다. 추론 과정을 표시하려면 [추론 모델 출력](/ko/api-capabilities/openai/reasoning-models)을 참조하십시오.
</Note>

## 사용 및 과금

* `usage`는 비스트리밍 응답에서는 인라인으로 반환되며, 스트리밍에서는 후행 청크로 도착합니다(위 표의 위치 — "존재할 때마다 기록").
* 필드 구성은 다릅니다: OpenAI 계열은 `completion_tokens_details`를 추가하고, Gemini/Claude는 `input_tokens`/`output_tokens`를 추가하며, 추론 모델은 `reasoning_tokens`를 추가합니다. 세 가지 표준 필드인 `prompt_tokens` / `completion_tokens` / `total_tokens`를 기준으로 삼으십시오.

<Warning>
  **스트리밍된 `total_tokens`를 믿지 마십시오.** 테스트에서 일부 모델(예: gpt-5.4-mini)은 `total ≠ prompt + completion`인 후행 프레임을 내보내지만, 같은 모델은 비스트리밍에서는 올바릅니다. **과금은 스트리밍된 프레임이 아니라 계정 명세서를 기준으로 하십시오.**
</Warning>

## 관련 링크

* 같은 그룹: [호환 모드 호출](/ko/api-capabilities/openai/compatible) · [추론 모델 출력](/ko/api-capabilities/openai/reasoning-models) · [기본 호출](/ko/api-capabilities/openai/native)
* 모델 및 가격: [모델 및 가격 개요](/ko/api-capabilities/model-info)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
