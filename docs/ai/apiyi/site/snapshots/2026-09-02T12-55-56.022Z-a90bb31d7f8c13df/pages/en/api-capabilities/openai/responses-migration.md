> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Choosing an Endpoint: Migrating GPT-5.4+ to Responses

> On GPT-5.4 and later, sending tools together with a reasoning effort on /v1/chat/completions can be rejected outright with a 400. This page covers how to confirm you hit it, how to pick between the two remedies, exactly what changes in your code (with a full before/after tool-calling example), and how to verify the migration.

<Note>
  **The short version**: on GPT-5.4 and later models, sending **`tools` together with an explicit `reasoning_effort`** (anything other than `none`) to `/v1/chat/completions` can be rejected upstream with a 400: `Function tools with reasoning_effort are not supported ...`.

  Two ways out: **move tool-carrying requests to `/v1/responses`** (keeps both reasoning and tools — recommended), or **set `reasoning_effort="none"` explicitly** (keeps the endpoint, gives up reasoning). Requests without `tools` are unaffected.
</Note>

## First, confirm that this is what you hit

There are three ways it shows up. The second one is the easiest to misread.

### Symptom 1: an explicit 400

```text theme={null}
Function tools with reasoning_effort are not supported for gpt-5.6-sol in
/v1/chat/completions. To use function tools, use /v1/responses or set
reasoning_effort to 'none'.
```

The response carries `param: reasoning_effort`. This is an **official OpenAI restriction**, not an APIYI gateway problem — the same request sent straight to OpenAI behaves identically.

### Symptom 2: it works sometimes and fails other times

A single model may sit behind several upstream routes, and **not every route enforces this**. Our own measurements on 2026-09-02, default group, same key, same time window, six calls per combination:

| Model           | `tools` + `reasoning_effort="medium"`   |
| --------------- | --------------------------------------- |
| `gpt-5.6-luna`  | 6/6 returned 400                        |
| `gpt-5.6-sol`   | 6/6 returned 200, tool called correctly |
| `gpt-5.6-terra` | 6/6 returned 200, tool called correctly |
| `gpt-5.4`       | 6/6 returned 200, tool called correctly |

Earlier the same day, a customer did receive this 400 on `gpt-5.6-sol`.

<Warning>
  **"It worked for me just now" is not evidence that you are safe.** The same model and the same code can start returning 400 at a different time or in a different group. Either move to Responses or set `reasoning_effort="none"` explicitly — both are stable across every route.
</Warning>

### Symptom 3: no error, but the tool is never called

If the model should have called a tool and instead replied with small talk (`finish_reason` is `stop`, `tool_calls` empty), do not start rewriting your prompt. Resend once with `reasoning_effort` set explicitly to `none`: if the tool is then called correctly, the problem is the parameter combination, not your prompt.

## What the restriction covers

|                                                                                   | Affected                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4` families | Yes — depends on the route, see above            |
| `gpt-5.2` / `gpt-5.1` / `gpt-5` and earlier                                       | Not covered by the official announcement         |
| Claude, Gemini, Grok and other non-OpenAI models                                  | Unrelated, unaffected                            |
| Requests with no `tools`                                                          | Unaffected, send any `reasoning_effort` you like |
| Requests on `/v1/responses`                                                       | Unaffected, reasoning and tools work together    |

The trigger is **explicitly sending a non-`none` effort level**. All four of `low`, `medium`, `high` and `xhigh` trigger it in our tests.

<Note>
  **Omitting `reasoning_effort` does not trigger it.** On the `gpt-5.6-luna` route that reproduces the 400 deterministically, all four effort levels returned 400, while omitting the parameter returned `tool_calls` correctly 6 times out of 6. So the minimal emergency fix has two forms: set `none` explicitly, or drop the parameter entirely.
</Note>

## Which way out to pick

|                    | Move to `/v1/responses`                                     | Set `reasoning_effort="none"`                                          |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| Keeps reasoning    | Yes, fully, at any effort level                             | No — reasoning is off, the model loses its planning step               |
| Size of the change | Request and response shapes both change, see below          | One extra parameter, one line                                          |
| Stability          | Consistent across every route                               | Consistent across every route                                          |
| Who it suits       | Agents, multi-step tool orchestration, the long-term answer | Production firefighting, simple tool logic, code you cannot change yet |

For complex tool-driven tasks, turning reasoning off degrades the model noticeably — it loses the step where it works out which tool to call and in what order. Treat `none` as a stopgap rather than a destination.

## It is not only about dodging the error

Even if you never hit the restriction, Responses is the endpoint OpenAI recommends for new projects. Officially: the same reasoning model scores higher on SWE-bench through Responses, cache utilization is substantially better than Chat Completions, and built-in tools such as web search and the code interpreter exist only here. The numbers and details are on [Native Calls](/en/api-capabilities/openai/native).

The cache point is the one that shows up on your bill: **multi-turn agents benefit most from cache hits**, and multi-turn agents are exactly the workload most likely to hit the restriction above. How caching is billed and how to read hit rates: [Prompt Caching](/en/api-capabilities/openai/prompt-caching).

## Which group are you in

| How you integrate                               | What to do                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **You write the code** (OpenAI SDK or raw HTTP) | Change the endpoint — see the next section                                                                                                                                                                                                                                                             |
| **You use a framework** (LangChain and friends) | Check whether your framework has a Responses switch. LangChain has `ChatOpenAI(..., use_responses_api=True)`. Frameworks without one leave you with `reasoning_effort="none"` or a different model                                                                                                     |
| **You use a client or IDE plugin**              | Nothing you can change client-side; you need a client that speaks Responses. The full support matrix is under "Client support today" on [Native Calls](/en/api-capabilities/openai/native); for specific tools see [Trae](/en/scenarios/programming/trae) and [Cline](/en/scenarios/programming/cline) |

## What changes in your code

The complete field mapping lives on [Native Calls](/en/api-capabilities/openai/native). Here are only the four differences that matter for tool calling, since that is what this page is about:

|                     | Chat Completions                                  | Responses                                                    |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Reasoning effort    | Top-level `reasoning_effort="medium"`             | Nested `reasoning={"effort": "medium"}`                      |
| Tool definition     | Nested: `{"type": "function", "function": {...}}` | Flat: `{"type": "function", "name": ..., "parameters": ...}` |
| Call returned as    | `message.tool_calls[]`, identified by `id`        | A `function_call` item in `output`, identified by `call_id`  |
| Result sent back as | `{"role": "tool", "tool_call_id": ...}`           | `{"type": "function_call_output", "call_id": ...}`           |

<Warning>
  The two tool formats **cannot be mixed**. Sending a Chat Completions style nested `function: {...}` definition to `/v1/responses` (or the reverse) is the most common cause of an "invalid parameter" error from the SDK. More detail on [Function Calling](/en/api-capabilities/openai/function-calling).
</Warning>

The same weather-tool loop, before and after:

<CodeGroup>
  ```python Before: Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "Look up the weather for a city",
          "parameters": {
              "type": "object",
              "properties": {"city": {"type": "string"}},
              "required": ["city"],
          },
      },
  }]

  messages = [{"role": "user", "content": "What is the weather in Beijing today?"}]

  resp = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",              # sent alongside tools; may be rejected
  )

  call = resp.choices[0].message.tool_calls[0]
  messages.append(resp.choices[0].message)    # the assistant turn, verbatim
  messages.append({
      "role": "tool",
      "tool_call_id": call.id,
      "content": '{"temp": 26, "sky": "clear"}',
  })

  final = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",
  )
  print(final.choices[0].message.content)
  ```

  ```python After: Responses theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{                                  # flat, with no "function" wrapper
      "type": "function",
      "name": "get_weather",
      "description": "Look up the weather for a city",
      "parameters": {
          "type": "object",
          "properties": {"city": {"type": "string"}},
          "required": ["city"],
          "additionalProperties": False,
      },
  }]

  history = [{"role": "user", "content": "What is the weather in Beijing today?"}]

  resp = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},         # nested, and unrestricted here
  )

  call = next(i for i in resp.output if i.type == "function_call")
  history += resp.output                      # append the whole output verbatim
  history.append({
      "type": "function_call_output",
      "call_id": call.call_id,                # note: call_id, not id
      "output": '{"temp": 26, "sky": "clear"}',
  })

  final = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},
  )
  print(final.output_text)
  ```
</CodeGroup>

Both snippets were run against the APIYI default group: the first reproduces the 400 reliably, the second completes the full call, return, final-answer loop.

<Tip>
  Do not skip `history += resp.output`. Besides `function_call`, the output may contain a `reasoning` item — carrying it back verbatim is what lets the model continue its earlier train of thought, and it is precisely why Responses performs better on multi-step tool tasks.
</Tip>

## The traps people hit while migrating

<AccordionGroup>
  <Accordion title="output is not choices — do not index into it">
    `output` is an **array of items** that can hold `reasoning`, `message` and `function_call` entries at once, in no guaranteed order or count. Use `resp.output_text` for text, and iterate filtering on `type == "function_call"` for tool calls. Never hard-code an index.
  </Accordion>

  <Accordion title="Renamed parameters: max_tokens, response_format, temperature">
    `max_tokens` (or `max_completion_tokens`) becomes `max_output_tokens`; `response_format` becomes `text.format`; the system prompt can move out of `messages` into the top-level `instructions`. Separately, gpt-5 reasoning models **do not support `temperature` or `top_p`** on either endpoint — remove them and control the model through `reasoning.effort` instead.
  </Accordion>

  <Accordion title="Every usage field is renamed">
    `usage.prompt_tokens` becomes `usage.input_tokens`, `completion_tokens` becomes `output_tokens`, and cache hits live in `usage.input_tokens_details.cached_tokens`. Update your usage accounting at the same time, or it will silently record zeros.
  </Accordion>

  <Accordion title="Multi-turn: managing history yourself always works; chaining depends on your group">
    The safest approach is to **maintain the `input` array yourself**, appending each turn's `output` verbatim. That holds in every group and for every model, and it is what the example above does.

    Chaining with `previous_response_id` did work in the default group on 2026-09-02 — `gpt-5.6-sol`, `terra`, `luna` and `gpt-5.4` all recalled the previous turn, `store` defaults to `true`, and sending `store: false` then chaining correctly reports that the previous response cannot be found. Retrieving history with `GET /v1/responses/{id}` is still unavailable. **Verify it in your own group before you depend on it.** Background: [Multi-Turn Conversations](/en/api-capabilities/multi-turn-conversation).
  </Accordion>

  <Accordion title="Streaming is a semantic event stream, not delta concatenation">
    Chat Completions streams a series of `delta` increments; Responses streams typed events such as `response.output_text.delta` and `response.function_call_arguments.delta`. Your streaming parser has to be rewritten rather than reused. See [Native Calls](/en/api-capabilities/openai/native).
  </Accordion>
</AccordionGroup>

## Verifying the migration

Do not stop at HTTP 200. Walk these four checks:

<Steps>
  <Step title="Confirm output really contains function_call">
    Print `[i.type for i in resp.output]` — you should see `function_call`, preceded by `reasoning` at higher effort levels. Only a `message` means the tool was never called.
  </Step>

  <Step title="Confirm your usage fields still read values">
    Check that `usage.input_tokens` and `output_tokens` are non-zero, and that `output_tokens_details.reasoning_tokens` moves with the effort level.
  </Step>

  <Step title="Confirm cache hits start appearing">
    Run several turns and watch `usage.input_tokens_details.cached_tokens` rise above zero. This is the most direct billing benefit Responses has over compatibility mode.
  </Step>

  <Step title="Replay the request that used to 400">
    The same `tools` plus `reasoning_effort` combination should now pass consistently. Keep it as a regression case so a future model swap surfaces the problem immediately.
  </Step>
</Steps>

## When not to migrate

This is not all-or-nothing. Staying on compatibility mode is perfectly reasonable when:

* **You do not use tool calling** — the restriction does not apply and you can send any `reasoning_effort`
* **You call several vendors with one code path** — Claude and Gemini only offer `/v1/chat/completions` here, and forking just for OpenAI may not pay off
* **Your framework or client locks the endpoint** — hold the line with `reasoning_effort="none"` until it catches up
* **You are on `gpt-5.2` or earlier** — outside the affected range

The full capability boundary of compatibility mode is on [Compatibility Mode](/en/api-capabilities/openai/compatible).

## FAQ

<AccordionGroup>
  <Accordion title="What exactly do I lose with reasoning_effort=none?">
    The model stops reasoning explicitly and answers directly. Single-step tasks with an obvious tool choice barely change; multi-step orchestration that needs the model to work out a call order degrades noticeably. It is a bridge, not a destination.
  </Accordion>

  <Accordion title="Can I switch endpoints only for requests that carry tools?">
    Yes, and it is a common incremental approach: keep plain chat on `/v1/chat/completions` and move only the tool-carrying path to `/v1/responses`. Both endpoints use the same key and the same base URL, and pricing is identical.
  </Accordion>

  <Accordion title="Does the price change after switching endpoints?">
    No. Input and output rates for a given model are the same on both endpoints, and so is the billing model. See [Models and Pricing](/en/api-capabilities/model-info). The only difference is the cache hit rate, which is usually higher on Responses — so the bill tends to go down.
  </Accordion>

  <Accordion title="Are Claude and Gemini affected?">
    No. This is an OpenAI restriction on its own GPT-5.4+ models. Claude through `/v1/messages` or compatibility mode, and Gemini through native or compatibility mode, can both use tool calling and thinking at the same time.
  </Accordion>

  <Accordion title="Why are the Pro models Responses-only?">
    In practice `gpt-5.4-pro` and `gpt-5.5-pro` are only usable through `/v1/responses`, and require the SVIP group. They run for a long time and are designed to pair with background mode, which compatibility mode cannot carry. See [Native Calls](/en/api-capabilities/openai/native).
  </Accordion>

  <Accordion title="Is Chat Completions going away?">
    No. The endpoint OpenAI has scheduled for shutdown is the **Assistants API**, not Chat Completions. Both endpoints stay supported long-term; new features simply land on Responses first.
  </Accordion>
</AccordionGroup>

## Related pages

<CardGroup cols={3}>
  <Card title="Native Calls" icon="zap" href="/en/api-capabilities/openai/native">
    The full Responses endpoint: parameters, response shape, built-in tools, client support matrix
  </Card>

  <Card title="Compatibility Mode" icon="plug" href="/en/api-capabilities/openai/compatible">
    How Chat Completions works, its capability boundary, and SDK setup per language
  </Card>

  <Card title="Function Calling" icon="wrench" href="/en/api-capabilities/openai/function-calling">
    Complete tool-calling examples and streaming assembly for both endpoints
  </Card>
</CardGroup>
