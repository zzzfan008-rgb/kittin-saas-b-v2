> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Multi-Turn Conversation Guide

> Implement multi-turn chat on APIYI: history handling for OpenAI compatible mode (multi-model), and the OpenAI / Gemini / Anthropic native formats, with a comparison and FAQ.

LLMs have **no memory of their own** — a model doesn't remember what you said a moment ago. A "multi-turn conversation" really just means **sending the full conversation history with every request**. This guide explains how each of the four call formats on APIYI maintains that history, and the pitfalls to watch for.

<Info>
  Examples use the endpoint `https://api.apiyi.com` and your [APIYI token](https://api.apiyi.com/token). Models referenced: `gpt-5.4-mini`, `deepseek-v4-pro`, `gemini-3.5-flash`, `claude-sonnet-4-6`.
</Info>

## Core principle: maintain history yourself

One sentence covers it: **the model is stateless; you (the client) maintain the history and resend all of it every turn.**

```text theme={null}
Turn 1: send [user Q1]                              → get [reply 1]
Turn 2: send [user Q1, reply 1, user Q2]            → get [reply 2]
Turn 3: send [user Q1, reply 1, user Q2, reply 2, user Q3] → get [reply 3]
```

Each new turn, **append** the previous user message and model reply to the end of the history array, then send the whole thing. The only differences between formats are what the history array is called and how roles are written.

<Warning>
  **On APIYI, always use the "maintain history yourself" approach.** Do not rely on any server-side conversation state (such as OpenAI Responses' `previous_response_id`) — it is not guaranteed to work through the gateway, as detailed in the OpenAI native section below.
</Warning>

## OpenAI compatible mode (works across models)

The most universal approach, endpoint `/v1/chat/completions`. History lives in the `messages` array, each entry carrying a `role` (`system` / `user` / `assistant`). **Switching the `model` string lets the same code drive different models** (gpt, deepseek, claude, gemini…).

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
  **One codebase, many models**: change `model` to `deepseek-v4-pro`, `claude-sonnet-4-6`, `gemini-3.5-flash`, or any other model — the multi-turn logic stays identical. See the [Models & Pricing Overview](/en/api-capabilities/model-info).
</Tip>

### Handling history for reasoning models

Reasoning models like `deepseek-v4-pro` return an extra `reasoning_content` (the chain of thought) field.

<Warning>
  **Keep only `content` in the history — do not pass `reasoning_content` back.** The thinking is just an intermediate product of the current turn; passing it back wastes tokens and violates upstream rules (DeepSeek's direct API even returns a 400 for it). When appending to history, take only `content`:

  ```python theme={null}
  messages.append({"role": "assistant", "content": resp.choices[0].message.content})
  # do NOT include resp.choices[0].message.reasoning_content
  ```
</Warning>

For more on parsing reasoning-model responses, see [Reasoning Model Output](/en/api-capabilities/openai/reasoning-models).

## OpenAI native format (Responses API)

Endpoint `/v1/responses`. For multi-turn, **pass the full history as the `input` array** (each entry with `role` / `content`) — the same self-managed approach as compatible mode:

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
  **Do not rely on server-side state** like `previous_response_id` / `conversation` / `store`. Tested through the APIYI gateway: passing `previous_response_id` does not error (returns 200), but the next turn **does not remember** the previous one, and `GET /v1/responses/{id}` is unavailable. So on APIYI, use the Responses API with **self-managed history** (the `input` array) as shown above.
</Warning>

## Gemini native format

Endpoint `/v1beta/models/{model}:generateContent`. History lives in the `contents` array. Note the **roles are `user` / `model`** (not `assistant`), and each entry's content goes in `parts`.

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
  **Even simpler**: the official `google-genai` SDK's `client.chats.create(...)` maintains the `contents` history for you — just call `send_message`, no manual stitching.
</Tip>

<Note>
  Gemini 3-series responses attach a `thoughtSignature` to parts. For **plain text multi-turn, passing back just `text` is enough** to retain context (and cheaper on tokens); only scenarios needing strict reasoning continuity, like **function calling**, require passing `thoughtSignature` back verbatim — the official SDK handles this automatically. See [Gemini Native Calls](/en/api-capabilities/gemini/native) and [Function Calling](/en/api-capabilities/gemini/function-calling).
</Note>

## Anthropic native format

Endpoint `/v1/messages`. History lives in the `messages` array with roles `user` / `assistant`; `content` can be a plain string. Note that **`max_tokens` is required**.

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
  You can also use the official `anthropic` SDK by pointing base\_url at `https://api.apiyi.com`. The response is a `content` block array — parsing details in [Claude Streaming & Responses](/en/api-capabilities/claude-response-handling).
</Tip>

## Comparison of the four formats

| Aspect            | OpenAI compatible      | OpenAI native (Responses) | Gemini native               | Anthropic native |
| ----------------- | ---------------------- | ------------------------- | --------------------------- | ---------------- |
| Endpoint          | `/v1/chat/completions` | `/v1/responses`           | `/v1beta/…:generateContent` | `/v1/messages`   |
| History field     | `messages`             | `input`                   | `contents`                  | `messages`       |
| Roles             | system/user/assistant  | user/assistant            | **user/model**              | user/assistant   |
| Content form      | `content` string       | `content` string          | `parts: [{text}]`           | `content` string |
| History owner     | you                    | you                       | you                         | you              |
| Server-side state | none                   | ⚠️ unavailable            | none                        | none             |
| Cross-model       | ✅ change `model`       | OpenAI only               | Gemini only                 | Claude only      |

<Tip>
  **Choosing**: want one codebase across vendors → prefer **OpenAI compatible mode**; need a vendor's native-only features (Gemini thought signatures / code execution, Claude thinking blocks & caching, OpenAI built-in tools) → use that **native format**.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Does a longer conversation cost more?">
    Yes. Every turn resends the full history, so **input tokens grow with the number of turns** and cost rises accordingly. The main way to save is **context caching**: an identical history prefix automatically hits the cache rate (far below list price). See [OpenAI caching](/en/api-capabilities/openai/prompt-caching), [Claude caching](/en/api-capabilities/claude-prompt-caching), [Gemini caching](/en/api-capabilities/gemini/prompt-caching).
  </Accordion>

  <Accordion title="How many turns should I keep? What if I exceed the context window?">
    No hard rule, but longer history is costlier and can exceed the model's context window. Common strategies: (1) **sliding window** — keep only the last N turns; (2) **summary compression** — condense earlier turns into a paragraph in the system prompt; (3) always keep the system instruction plus the most recent turns. Balance against how much "memory" your use case needs.
  </Accordion>

  <Accordion title="Where does the system / system instruction go?">
    OpenAI compatible and Anthropic: at the front of the conversation (compatible uses `role:"system"`; Anthropic uses the top-level `system` field or the first message). Gemini: use `config.system_instruction`. The system instruction only needs to be set **once** — no need to re-append it each turn.
  </Accordion>

  <Accordion title="Should I pass a reasoning model's thinking (reasoning_content) back?">
    **No.** The thinking is an intermediate product of the turn; keep only the final `content` in history (for Gemini, only `text`). Passing thinking back wastes tokens and some upstreams reject it. Gemini's `thoughtSignature` in function-calling is the exception — the official SDK handles it automatically.
  </Accordion>

  <Accordion title="Can the server remember the conversation so I don't resend history?">
    On APIYI this is **not recommended**. OpenAI Responses' `previous_response_id` is not guaranteed to work through the gateway (tested: no memory). Use client-side self-managed history everywhere — it's the most stable and consistent across models.
  </Accordion>
</AccordionGroup>

## Related links

* Call basics: [OpenAI Compatible Mode](/en/api-capabilities/openai/compatible) · [OpenAI Native Calls](/en/api-capabilities/openai/native) · [Gemini Native Calls](/en/api-capabilities/gemini/native) · [Claude API Basics](/en/api-capabilities/claude)
* Response parsing: [OpenAI Handling Responses](/en/api-capabilities/openai/response-handling) · [Reasoning Model Output](/en/api-capabilities/openai/reasoning-models) · [Claude Streaming & Responses](/en/api-capabilities/claude-response-handling) · [Gemini Streaming & Responses](/en/api-capabilities/gemini/response-handling)
* Models & pricing: [Models & Pricing Overview](/en/api-capabilities/model-info)
* Get / manage tokens: `https://api.apiyi.com/token`
