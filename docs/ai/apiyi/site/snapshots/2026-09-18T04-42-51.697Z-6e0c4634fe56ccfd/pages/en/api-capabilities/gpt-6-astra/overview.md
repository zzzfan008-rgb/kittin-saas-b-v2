> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Astra Text Generation

> OpenAI's GPT-6 Astra flagship on APIYI: Responses and Chat Completions both open, $10 in / $50 out per 1M tokens, half price in the Codex_Reverse group. Includes 220+ checks across the official-relay and reverse lines, four-level reasoning data, and per-item attribution of every deviation.

GPT-6 Astra (`gpt-6-astra`) is the new-generation flagship OpenAI released on September 3, 2026, positioned for computer use, software engineering, science, and long-horizon agent work: 1,050,000-token context, 128,000-token max output, adjustable reasoning effort. APIYI has both the **Responses** and **Chat Completions** endpoints open and ran the same 74-check matrix on launch day across three lines: official relay via OpenAI direct, official relay via Azure, and `Codex_Reverse`.

<Info>
  **GPT-6 Astra is live on APIYI**: model name `gpt-6-astra`. The `default` / `svip` official-relay groups are priced line for line with OpenAI and are served by two official lines, OpenAI direct and Azure; the `Codex_Reverse` group (Codex reverse-engineered resources) bills at a **0.5x discount**. **Function calling and the agent toolchain live only on Responses**, so start new projects there.
</Info>

<Warning>
  **Chat Completions does not support function tools.** A request carrying `tools` is rejected upstream on the official-relay lines (400, pointing you to Responses), regardless of `reasoning_effort` or `tool_choice`. This is a model-side limit, not a platform issue. Existing Chat code that uses function calling has to move to Responses when it moves to Astra.
</Warning>

## Why it stands out

<CardGroup cols={2}>
  <Card title="Built to finish tasks" icon="monitor">
    Terminal-Bench 4.0 from 37.3% to 57.9%, ScreenSpot-Pro from 76.9% to 92.7%, OSWorld 2.0 at 72.6%. The biggest gains are all agentic; OpenAI reports average completion time on complex tasks dropping from about 75 minutes to 40.
  </Card>

  <Card title="1.05M context, measured" icon="file-text">
    A 308K-character (210,657-token) needle test answered correctly in 10.3 s. OpenAI reports roughly 70% fewer tokens than GPT-5.6 Sol per task, so the real per-task cost gap is smaller than the 2.5x unit-price gap.
  </Card>

  <Card title="Complete Responses toolchain" icon="bot">
    Function calling passes single, parallel, round-trip, and streaming; the hosted `web_search` and `code_interpreter` tools work; encrypted reasoning items replay statelessly. Strict JSON Schema output matched the field set exactly.
  </Card>

  <Card title="Three lines measured, every deviation attributed" icon="git-fork">
    The same matrix ran on OpenAI direct, Azure, and Codex\_Reverse. Model capability is identical across all three; the deviations are all in the pipeline, and this page labels each as upstream limit, group-specific, or line-specific.
  </Card>
</CardGroup>

## Model information

| Parameter                | Value                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model name**           | `gpt-6-astra`                                                                                                                                                 |
| **Release**              | September 3, 2026 (OpenAI); live on APIYI September 5, 2026                                                                                                   |
| **Input modalities**     | Text, image (no audio or video at launch)                                                                                                                     |
| **Output modality**      | Text                                                                                                                                                          |
| **Context / max output** | 1,050,000 / 128,000 tokens                                                                                                                                    |
| **Knowledge cutoff**     | April 30, 2026                                                                                                                                                |
| **Reasoning effort**     | `low` / `medium` / `high` / `xhigh`, default `medium`; `max` is echoed as `xhigh`                                                                             |
| **Groups**               | `default`, `svip` (official relay), `Codex_Reverse` (reverse-engineered, 0.5x)                                                                                |
| **Endpoints**            | `POST /v1/responses` (primary; function calling here), `POST /v1/chat/completions` (compatibility; no function tools)                                         |
| **Streaming**            | ✅ both endpoints; Chat's final chunk carries usage                                                                                                            |
| **Cyber classification** | Preparedness Framework "Critical"; the public release refuses vulnerability-discovery tasks; the OpenAI direct line echoes `access_programs.cyber = standard` |

## Measured capability matrix

September 5, 2026, 74 checks per line (the official lines used a 70K-token long-context variant to hold cost down):

| Capability                                                        | Responses                                                                                         | Chat Completions                                                | Across the three lines                                                                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Basic chat (non-stream / stream)                                  | ✅ / ✅                                                                                             | ✅ / ✅                                                           | Identical; minimal prompt bills 7 input tokens, no hidden injection                                                                                      |
| Reasoning effort low / medium / high / xhigh                      | ✅ all correct                                                                                     | ✅                                                               | Identical, reasoning\_tokens rise monotonically                                                                                                          |
| Reasoning effort `max`                                            | ⚠️ echoed as `xhigh` on all three                                                                 | ⚠️                                                              | Official lines spend more reasoning tokens on max than xhigh, so the level may apply with a normalized echo                                              |
| System prompt                                                     | ✅ `instructions` / `system` both work                                                             | ✅ official; ⚠️ Codex\_Reverse drops `system`, `developer` works | Group-specific                                                                                                                                           |
| **Function calling** (single / round-trip / parallel / streaming) | ✅ / ✅ / ✅ 2 calls / ✅                                                                             | ❌ 400 on official lines                                         | **Upstream limit**: Chat has no function tools                                                                                                           |
| Structured output `json_schema` (strict)                          | ✅                                                                                                 | ✅                                                               | Identical, field set matched exactly                                                                                                                     |
| `json_object`                                                     | ✅                                                                                                 | ✅                                                               | Identical                                                                                                                                                |
| Image input (base64)                                              | ✅                                                                                                 | ✅                                                               | Identical, three color blocks counted and named                                                                                                          |
| Image input (URL)                                                 | ✅ downloadable hosts                                                                              | ✅ official; ⚠️ Codex\_Reverse silently drops                    | The link must be fetchable server-side; anti-scraping hosts such as Wikimedia fail on all three lines                                                    |
| Prompt caching                                                    | ✅ 8.7K prefix hits on the second call                                                             | ✅                                                               | Hits on all three lines and is shared across endpoints. The `cached_tokens` echo in the API can lag; the console's cache billing detail is authoritative |
| Long context                                                      | ✅ 210K tokens in 10.3 s; 70K in 6.3 s                                                             | —                                                               | Identical                                                                                                                                                |
| `web_search` / `web_search_preview`                               | ✅ OpenAI direct, Codex\_Reverse                                                                   | —                                                               | **Temporarily disabled on the Azure line** (platform notice: Bing billing under review)                                                                  |
| `code_interpreter`                                                | ✅ official; ❌ Codex\_Reverse 400                                                                  | —                                                               | Group-specific                                                                                                                                           |
| `computer_use_preview`                                            | ❌ 400 "not supported with gpt-6-astra"                                                            | —                                                               | Not supported upstream                                                                                                                                   |
| Encrypted reasoning (`include: reasoning.encrypted_content`)      | ✅ replay returns 200 with a coherent answer                                                       | —                                                               | Identical                                                                                                                                                |
| `previous_response_id`                                            | ✅ official; ⚠️ Codex\_Reverse silently ignores                                                    | —                                                               | Group-specific; `GET /v1/responses/{id}` returns 503 on all three                                                                                        |
| Output caps                                                       | ✅ official `max_output_tokens` / `max_completion_tokens` enforced; ⚠️ Codex\_Reverse not enforced | same                                                            | Group-specific; legacy `max_tokens` returns 400 on official lines                                                                                        |
| `temperature`                                                     | ❌ 400 on official; accepted but ignored on Codex\_Reverse                                         | same                                                            | Upstream limit, usual for reasoning models                                                                                                               |
| `text.verbosity` low / high                                       | ✅ about 550 vs 1350 characters                                                                    | —                                                               | Identical                                                                                                                                                |
| `service_tier` flex / priority                                    | ⚠️ accepted, echoed as default                                                                    | —                                                               | Standard tier on all three                                                                                                                               |
| 8 concurrent requests                                             | ✅ 8/8                                                                                             | —                                                               | Median latency OpenAI direct 2.4 s, Azure 2.7 s, Codex\_Reverse 3.6 s                                                                                    |

## Reasoning effort

Same river-crossing puzzle on Responses, reasoning\_tokens per line:

| `reasoning.effort`     | OpenAI direct | Azure | Codex\_Reverse | Result |
| ---------------------- | ------------- | ----- | -------------- | ------ |
| `low`                  | 12            | 28    | 22             | ✅      |
| `medium` (default)     | 33            | 43    | 62             | ✅      |
| `high`                 | 146           | 169   | 99             | ✅      |
| `xhigh`                | 246           | 320   | 199            | ✅      |
| `max` (echoed `xhigh`) | 278           | 516   | 207            | ✅      |

<Warning>
  **Do not send `none` or `minimal`.** `minimal` is rejected everywhere (400 on official lines, rewritten to `low` on Codex\_Reverse). `none` behaves three different ways: 400 on OpenAI direct, accepted on Azure, and on Codex\_Reverse rewritten to `medium` with input\_tokens jumping from 14 to 4394 (about 4.2K tokens of hidden instructions injected upstream). The usable levels are `low` / `medium` / `high` / `xhigh`.
</Warning>

<Tip>
  Reasoning tokens bill at the \$50 / 1M output rate. Use `low` / `medium` for deterministic steps and reserve `xhigh` for planning and debugging. Read usage from `usage.output_tokens_details.reasoning_tokens` on Responses or `usage.completion_tokens_details.reasoning_tokens` on Chat (present on the official lines).
</Tip>

## Pricing

### Official-relay groups (`default` / `svip`)

Two tiers by the input token count of each request; once input passes 272K the **whole request** bills at tier two, matching OpenAI:

| Input tokens     | Input   | Output (incl. reasoning) | Cached read | Cache write (5 min) |
| ---------------- | ------- | ------------------------ | ----------- | ------------------- |
| 0 - 272K         | \$10.00 | \$50.00                  | \$1.00      | \$12.50             |
| 272,001 - 1,050K | \$20.00 | \$75.00                  | \$2.00      | \$25.00             |

### Codex\_Reverse group

0.5x the official price: tier one is \$5.00 in / \$25.00 out / \$0.50 cached read / \$6.25 cache write.

<Info>
  APIYI matches provider pricing item for item; discounts come through groups and recharge bonuses, see [Promotions](/en/faq/recharge-promotions). Group differences are explained in [What is the difference between the Codex, ClaudeCode and Default groups](/en/faq/codex-claudecode-default-groups). Live prices are on the [model pricing page](/en/models/index).
</Info>

## Choosing a group

| Group              | Price          | Suited to                                                                                    | Note                                                 |
| ------------------ | -------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `default` / `svip` | Official price | Production, stability-sensitive work, anything needing output caps or `previous_response_id` | Served by the OpenAI direct and Azure official lines |
| `Codex_Reverse`    | 0.5x           | Codex CLI coding, chat in clients such as Cherry Studio, agent setups such as OpenClaw       | 5 group-specific deviations, listed below            |

## Examples

### Responses endpoint (recommended)

<CodeGroup>
  ```python Python (basics + reasoning effort) theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh
      instructions="You are a senior backend engineer. Be concise.",
      input="Migrate this repo from Python 3.9 to 3.13 and list every file that needs changes, with reasons",
      max_output_tokens=4000,
  )
  print(response.output_text)
  print(response.usage.output_tokens_details.reasoning_tokens)
  ```

  ```python Python (function calling + web search) theme={null}
  from openai import OpenAI
  import json

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  tools = [
      {"type": "web_search"},
      {"type": "function", "name": "get_weather", "description": "Current weather for a city",
       "parameters": {"type": "object", "properties": {"city": {"type": "string"}},
                      "required": ["city"], "additionalProperties": False}, "strict": True},
  ]
  r = client.responses.create(model="gpt-6-astra", tools=tools, reasoning={"effort": "low"},
                              input="Check the current weather in Beijing and Shanghai.")
  for item in r.output:
      if item.type == "function_call":
          print(item.name, json.loads(item.arguments))
  ```

  ```python Python (stateless multi-turn via encrypted reasoning) theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  history = [{"role": "user", "content": "Multiply 17 by 23. Answer with the number only."}]

  r1 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  # Replay the previous turn's full output (including the encrypted reasoning item); works on all three lines, no server-side storage needed
  history += [item.model_dump(exclude_none=True) for item in r1.output]
  history.append({"role": "user", "content": "Now add 1 to the result. Number only."})

  r2 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  print(r2.output_text)   # 392
  ```

  ```bash cURL (image input, base64) theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "low"},
      "input": [{"role": "user", "content": [
        {"type": "input_text", "text": "How many colored blocks are in this image?"},
        {"type": "input_image", "image_url": "data:image/png;base64,iVBORw0KGgo..."}
      ]}]
    }'
  ```
</CodeGroup>

### Chat Completions endpoint (migrating existing code, no function tools)

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",
      max_completion_tokens=4000,      # not the legacy max_tokens (400)
      messages=[
          # system works on the official lines; Codex_Reverse drops it, and developer works everywhere
          {"role": "developer", "content": "You are a senior backend engineer. Be concise."},
          {"role": "user", "content": "Explain Python 3.13's free-threaded mode"},
      ],
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (streaming) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });

  const stream = await client.chat.completions.create({
    model: 'gpt-6-astra',
    reasoning_effort: 'low',
    messages: [{ role: 'user', content: 'Describe the Great Wall in three sentences' }],
    stream: true,
    stream_options: { include_usage: true },
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## Deviation attribution

Running the same matrix on three lines sorts every deviation into one of three buckets.

### Upstream limits (identical on all three lines)

<AccordionGroup>
  <Accordion title="Chat Completions has no function tools">
    Every Chat request carrying `tools` returns 400 on both official lines, with upstream text telling you to use Responses; omitting `reasoning_effort` or adding `tool_choice: required` changes nothing. The `Codex_Reverse` group passes only because its pipeline converts to Responses internally, so do not treat that as evidence of capability. Use Responses for function calling.
  </Accordion>

  <Accordion title="reasoning.effort max is echoed as xhigh">
    3/3 requests for `max` echoed `xhigh` on all three lines. On the official lines max spends clearly more reasoning tokens than xhigh (OpenAI direct 278 to 379 vs 246, Azure 342 to 516 vs 320), so the level may apply with a normalized echo; on Codex\_Reverse there is no difference. We promise four levels.
  </Accordion>

  <Accordion title="Chat parameters: max_tokens and temperature return 400">
    The official lines reject the legacy `max_tokens` with 400 and ask for `max_completion_tokens`; `temperature` returns 400 unsupported, as usual for reasoning models. Codex\_Reverse accepts both and ignores them. Strip both when migrating existing code.
  </Accordion>

  <Accordion title="computer_use_preview is unavailable">
    All three lines return 400 "Tool 'computer\_use\_preview' is not supported with gpt-6-astra". The computer-use capability in the launch material is not exposed to the API through this tool type right now.
  </Accordion>
</AccordionGroup>

### Codex\_Reverse group only (5 items)

<AccordionGroup>
  <Accordion title="1. Chat drops system messages entirely">
    Instruction-style and information-style system messages hit 0/3 each; the same content as a `developer` message hit 3/3; both official lines pass `system` 3/3. **Use developer on Chat**, which works on all three lines.
  </Accordion>

  <Accordion title="2. None of the three output-cap parameters are enforced">
    With `max_output_tokens: 20`, `max_tokens: 20`, or `max_completion_tokens: 20`, output was 403 tokens, and Responses echoed `max_output_tokens: null`. The official lines truncate correctly at 20 with `incomplete` / `length`. Use the official-relay groups when caps matter for cost control.
  </Accordion>

  <Accordion title="3. previous_response_id is silently ignored">
    `store: true` still echoes `false`, and the second turn returns 200 with no memory of the first; both official lines recall correctly. In this group keep history on the client and pair it with `include: ["reasoning.encrypted_content"]` for stateless replay (verified on all three lines). `GET /v1/responses/{id}` returns 503 everywhere.
  </Accordion>

  <Accordion title="4. Chat silently drops image URLs">
    With an http(s) image link on Chat, prompt\_tokens was 15 and the model said it saw no image; the same link works on both official lines. base64 works on both endpoints of all three lines. **Send images as base64 on Chat in this group.**
  </Accordion>

  <Accordion title="5. effort none injects about 4.2K tokens of hidden instructions">
    `none` is rewritten to `medium` and input\_tokens rise from 14 to 4394 (4224 attributed to `usage.attribution.request_fields.instructions` at the cached rate); `minimal` is rewritten to `low`. This group also lacks the hosted `code_interpreter` tool (400).
  </Accordion>
</AccordionGroup>

### Azure line only (1 item)

<AccordionGroup>
  <Accordion title="web_search temporarily disabled">
    Requests carrying `web_search` / `web_search_preview` on the Azure line return 400 with a gateway notice that web\_search is temporarily disabled while Azure Bing billing is under review, and that other tools are unaffected. The OpenAI direct line and the Codex\_Reverse group work normally. This page will be updated when it is restored.
  </Accordion>
</AccordionGroup>

## Migration guide

<AccordionGroup>
  <Accordion title="From gpt-5.6-sol">
    On Responses, change only the `model` field. On Chat, anything using `tools` must move to Responses, and strip `max_tokens` and `temperature`. The price is 2.5x Sol's current promotional rate (\$4 / \$20 → \$10 / \$50), so run a head-to-head on agent, automation, and complex engineering tasks first; leave everyday chat, classification, and extraction on Terra / Luna.
  </Accordion>

  <Accordion title="From Chat Completions to Responses">
    `messages` → `input`, `reasoning_effort` → `reasoning: {"effort": ...}`, `response_format` → `text: {"format": ...}`, `system` → `instructions`, `max_completion_tokens` → `max_output_tokens`. Tool definitions flatten from `{"type": "function", "function": {...}}` to `{"type": "function", "name": ..., "parameters": ...}`. Full mapping in the [Responses migration guide](/en/api-capabilities/openai/responses-migration).
  </Accordion>

  <Accordion title="Controlling long-context cost">
    Once input exceeds 272K tokens the whole request bills at tier two (input doubles, output 1.5x). Unless you genuinely need the whole repo in one shot, keep everyday context under 272K, and put stable prefixes first so they hit the cache (cached reads are one tenth of the standard input price).
  </Accordion>

  <Accordion title="Will security tasks be refused?">
    Astra is the first model OpenAI has placed at the Critical cybersecurity level of its Preparedness Framework, and the public release refuses offensive tasks such as vulnerability discovery and exploit-code writing. Defensive work is unaffected: on all three lines, a request for engineering practices against SQL injection returned a complete answer covering parameterized queries, least privilege, and more.
  </Accordion>
</AccordionGroup>

## Related

* [GPT-6 Astra launch article (benchmarks and model selection)](/en/news/gpt-6-astra-launch)
* [gpt-6-astra joins the half-price Codex\_Reverse group](/en/live/2026-09/codex-reverse-gpt-6-astra)
* [OpenAI reasoning models guide](/en/api-capabilities/openai/reasoning-models)
* [OpenAI prompt caching](/en/api-capabilities/openai/prompt-caching)
* [OpenAI function calling](/en/api-capabilities/openai/function-calling)
