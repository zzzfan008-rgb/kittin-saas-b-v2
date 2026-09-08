> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why do official web apps and the API give different results?

> Same model, so why does Claude.ai or ChatGPT feel smarter than the API? An explanation of the engineering layer web apps add, and how to reproduce it with the API

## Short Answer

<Info>
  **It is the same model. The difference is the entire engineering layer wrapped around it in the web app.**

  An analogy: **the web app is a fully furnished apartment; the API is a bare shell.**

  * **Furnished (claude.ai / chatgpt.com)**: system prompt, web search, code execution, file parsing, conversation memory, and context management are all pre-installed — just move in.
  * **Bare shell (API)**: only the core model capability is delivered (load-bearing walls, plumbing, wiring). Search, tools, memory, and context are yours to configure.

  So "the API feels dumber" usually does not mean the model was downgraded or swapped for a fake — **you simply received the unfurnished version**.
</Info>

## What does the web app actually add?

Official products stack a large amount of invisible engineering on top of the model. None of it lives in the model weights, and the API ships with none of it by default:

<CardGroup cols={2}>
  <Card title="System prompt" icon="file-text">
    Web apps inject a hidden prompt — often thousands of tokens — on every turn: identity, tone, answer length, formatting preferences, refusal boundaries, Markdown rules, and more.

    This is the single biggest reason the web app "sounds more human, formats better, and knows who it is".
  </Card>

  <Card title="Built-in tools" icon="wrench">
    Web search, page fetching, a code sandbox (used as a calculator), file and image parsing, chart rendering, Artifacts / Canvas, and so on.

    The web app automatically calls a tool when you ask about today's news or ask it to compute something. Without tools configured, the API can only guess.
  </Card>

  <Card title="Memory and history" icon="brain">
    Web apps store conversation history, cross-session memory, and project knowledge bases.

    The API is **completely stateless**: if you do not put prior turns into `messages`, the model remembers nothing.
  </Card>

  <Card title="Context management" icon="scissors">
    In long conversations the web app automatically summarizes, trims, and retrieves earlier fragments to stay within limits.

    With the API you implement truncation, summarization, or RAG yourself.
  </Card>

  <Card title="Default parameters and thinking budget" icon="settings">
    The web app picks temperature, max output length, and reasoning effort for you. Some products even **auto-route** a question to a different model or thinking tier.

    The API uses defaults, which often differ from the web app's settings.
  </Card>

  <Card title="Post-processing and rendering" icon="monitor">
    Citation badges, syntax highlighting, table rendering, and collapsible reasoning are all front-end work.

    The API returns plain text or JSON, which naturally looks plainer.
  </Card>
</CardGroup>

## The difference at a glance

| Capability                         | Official web app                 | Direct API call                   |
| ---------------------------------- | -------------------------------- | --------------------------------- |
| Model weights                      | Same                             | Same                              |
| System prompt                      | Injected by vendor (undisclosed) | None — write your own             |
| Web search                         | Built in, auto-triggered         | Enable a tool or wire up search   |
| Math / code execution              | Built-in sandbox                 | Implement tool calling yourself   |
| File and image parsing             | Built in                         | Upload or Base64-encode yourself  |
| Conversation memory                | Saved automatically              | Stateless — pass history yourself |
| Context overflow                   | Compressed automatically         | Truncate or summarize yourself    |
| Parameters (temperature, thinking) | Tuned by vendor                  | Defaults — align them yourself    |
| Output format                      | Rendered by the front end        | Plain text / JSON                 |

## What causes each specific difference?

<AccordionGroup>
  <Accordion title="The API does not know about recent news or events">
    A model's knowledge stops at its training cutoff. The web app fills the gap with **built-in web search**.

    The API does not browse by default. Fix: call a supported search tool (`web_search`, `google_search`), or wire up your own search API and put the results into the context.

    <Warning>
      Search tools are a **per-call paid capability**, billed separately from model tokens. See [Model multipliers](/en/faq/model-multiplier) for pricing.
    </Warning>
  </Accordion>

  <Accordion title="The API gets arithmetic or word counts wrong">
    The web app quietly writes and runs code in a sandbox for calculations. A bare model is doing mental math, so errors are expected.

    Fix: attach a calculator or code-execution tool, or ask the model to show its steps in the prompt.
  </Accordion>

  <Accordion title="API answers are much shorter and less polished">
    The web app's system prompt contains extensive rules about structure, length, and Markdown formatting.

    Fix: put the style you want into your own system prompt — "use section headings", "conclusion first, then details", "always comment your code".
  </Accordion>

  <Accordion title="Over the API the model does not know who it is or states the wrong version">
    "Who am I" was never stored in the model weights; the web app anchors identity via the system prompt.

    See: [Why don't LLMs know their own version number?](/en/faq/model-version-identity) and [Why does Claude call itself Qwen or DeepSeek?](/en/faq/claude-identity-confusion)
  </Accordion>

  <Accordion title="The API forgets what was said earlier">
    The API is stateless — every request is a brand-new conversation. The web app attaches history for you.

    Fix: include the full prior turns in the `messages` array. This increases input tokens, so pair it with [prompt caching](/en/faq/cache-billing) to keep costs down.
  </Accordion>

  <Accordion title="The same question gives a different answer each time">
    That is sampling randomness, not a fault. The web app behaves the same way — you just rarely ask twice.

    Fix: lower `temperature` (e.g. 0.2), or constrain the output format explicitly in the prompt.
  </Accordion>

  <Accordion title="API reasoning feels shallower">
    Many web apps run with a high thinking budget by default, while the API default is usually lower or off.

    Fix: set `reasoning_effort` / `thinking` explicitly to high and raise the max output length. See [max\_tokens](/en/faq/max-tokens).
  </Accordion>
</AccordionGroup>

## How to reproduce the web app experience with the API

<Steps>
  <Step title="Step 1: Write your own system prompt">
    This has the highest return on effort. Define identity, tone, output format, answer length, and boundaries.

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    SYSTEM_PROMPT = """You are a professional technical assistant.
    - Lead with the conclusion, then the reasoning
    - Use Markdown headings to structure the answer
    - Code must be runnable and include key comments
    - Flag anything uncertain; never fabricate"""
    ```
  </Step>

  <Step title="Step 2: Maintain conversation history yourself">
    Append every user message and model reply to `messages` to emulate the web app's memory.

    ```python theme={null}
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    def chat(user_input):
        messages.append({"role": "user", "content": user_input})
        resp = client.chat.completions.create(
            model="claude-opus-5",
            messages=messages,
        )
        reply = resp.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        return reply
    ```
  </Step>

  <Step title="Step 3: Attach the tools you need">
    Wire up search for fresh information, code execution for exact calculations, and RAG for internal documents. See [Function calling](/en/api-capabilities/openai/function-calling) and [Web search](/en/api-capabilities/openai/web-search).
  </Step>

  <Step title="Step 4: Align your parameters">
    Set `temperature`, `max_tokens`, and the thinking tier explicitly instead of relying on defaults. Matching the web app's depth usually requires raising reasoning effort.
  </Step>

  <Step title="Step 5: Handle long context">
    As the conversation grows, summarize it or keep only the last N turns plus key facts so you stay within the context window. Enabling caching greatly reduces the cost of repeated prefixes.
  </Step>
</Steps>

<Tip>
  **Do not want to build it from scratch?** Use a mature client instead — Cherry Studio, ChatWise, LobeChat, Cursor, Claude Code, and others already bundle system prompts, history management, and tool calling. Fill in the APIYI base URL and key to get an experience close to the web app. See [Base URL configuration](/en/faq/base-url-config).
</Tip>

## Boundaries worth knowing

<Warning>
  **The API cannot replicate the web app 100%. These limits are real:**

  1. **Vendors do not publish their system prompts.** Community versions are reverse-engineered guesses and change between releases.
  2. **Some web features have no API.** Certain memory systems and the full Artifacts / Canvas interaction are not exposed.
  3. **Web apps run constant A/B experiments.** Two users can get different prompts and routing policies on the same day.
  4. **Web apps may switch models automatically.** Some products route easy questions to a smaller, faster model, whereas the API uses exactly the model you name — another source of differing results.

  The flip side is that the API gives you **control**: prompt, parameters, tools, and context are all yours, so results are reproducible and version-controllable — a requirement for shipping a product.
</Warning>

<Info>
  **Where APIYI fits in**: APIYI is a pure API gateway. Requests are **passed through as-is, with no prompt injection and no rewriting**. Behavior through APIYI matches a direct call to the official API — a bare shell stays a bare shell; we neither furnish it nor knock down walls behind your back.
</Info>

## Related Questions

<CardGroup cols={2}>
  <Card title="Why don't LLMs know their own version number?" icon="circle-question-mark" href="/en/faq/model-version-identity">
    The underlying principles of model identity
  </Card>

  <Card title="Why does Claude call itself Qwen or DeepSeek?" icon="venetian-mask" href="/en/faq/claude-identity-confusion">
    A detailed explanation of identity confusion
  </Card>

  <Card title="How to choose the right model?" icon="compass" href="/en/faq/model-selection-guide">
    Each model's strengths and use cases
  </Card>

  <Card title="How do I configure the Base URL?" icon="link" href="/en/faq/base-url-config">
    Connect APIYI in various clients
  </Card>
</CardGroup>

## Contact Us

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code or [click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Integration questions and technical support
  </Card>

  <Card title="Email" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
