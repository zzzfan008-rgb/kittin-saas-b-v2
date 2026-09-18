> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Does the API Have Memory Like ChatGPT?

> The API itself has no memory. What agent tools call memory is actually files stored on your machine, re-read at the start of every new conversation and billed as input. This page explains how it works, how to take it to another computer, and how to keep costs down.

## Short Answer

<Info>
  **No. The API is stateless and does not remember anything from earlier requests.**

  The memory you experience in the ChatGPT web app, Claude Code, or Codex is a feature those products build on top of the API: they write memory to files and feed those files back to the model in later conversations. The files stay with you, and APIYI does not store your conversation content.
</Info>

## What the Web App's Memory Is

ChatGPT's web app has two kinds of memory:

* **Saved memories**: facts and preferences you asked it to remember, such as your job or writing style
* **Chat history reference**: information it picks up from your past conversations

Both live in your OpenAI account and belong to the web product. **They are not exposed through the API.** When you call the same model through the API, it knows nothing about your web app conversations.

For more differences between web apps and the API, see [Why do official web apps and the API give different results?](/en/faq/webapp-vs-api-difference)

## Agent Tool Memory Is Just Files

In coding agent tools, memory always means **the client reading and writing local files**:

<CardGroup cols={3}>
  <Card title="Claude Code" icon="terminal">
    Project rules go in `CLAUDE.md`; personal preferences and lessons learned go into a local memory directory. Both are read when a session starts.
  </Card>

  <Card title="Codex" icon="code">
    Project rules go in `AGENTS.md`. Since April 2026, Codex also has built-in memory that extracts content from past sessions and stores it locally in `~/.codex/memories/`.
  </Card>

  <Card title="Claude API memory tool" icon="folder-open">
    The model issues read and write requests for memory files, and your application executes them. You decide where the files live: local disk, a database, or cloud storage.
  </Card>
</CardGroup>

What these tools have in common:

1. **Memory is files**, usually Markdown that you can open and edit directly.
2. **The model does not read every file at once.** The client retrieves only what is relevant to the current task.
3. **Every new conversation reads them again.** The model itself remembers nothing; whatever the client reads is sent to the API along with your question.

## Taking Memory to Another Computer

<Steps>
  <Step title="Project-level memory travels with the repository">
    Files such as `CLAUDE.md` and `AGENTS.md` live in the project directory. Commit them to git and they are available as soon as you pull the code on another computer. Your team can share the same project rules this way.
  </Step>

  <Step title="User-level memory must be copied or synced">
    Memory stored in your user directory (for example Codex's `~/.codex/memories/` or Claude Code's local memory directory) is not in the repository. Copy it to the same location on the new computer, or keep it in sync with cloud storage or a sync tool.
  </Step>

  <Step title="Confirm it works on the new computer">
    Open the same project and ask something only the memory can answer, such as the project's test command. A correct answer means the memory came across.
  </Step>
</Steps>

<Tip>
  Don't put API keys, passwords, or other secrets in memory files. The contents are sent to the model and can leak when synced to cloud storage or committed to a repository.
</Tip>

## Memory and Cost

Memory is not free:

* **Memory that gets read is billed as input tokens.** Every memory file the client reads in a new conversation counts toward that request's input.
* **A conversation gets more expensive as it grows.** Because the API is stateless, each turn resends the entire conversation so far, so input tokens keep adding up.
* **Cache billing cuts the cost of the repeated part.** If the beginning of each request (system prompt, memory files, earlier turns) stays the same, it can hit the cache and is billed far below the normal input price.

On APIYI, cache hits are consistent on major channels such as Claude, OpenAI, DeepSeek, Qwen, and Grok. **Gemini's implicit cache has a mediocre hit rate**, so budget Gemini costs at uncached prices. For each channel's rules, see [Does APIYI Support Cache Billing?](/en/faq/cache-billing)

<Tip>
  To get more cache hits, put unchanging content (system prompt, memory files) at the start of the request and changing content after it. Avoid putting values that change every time, such as timestamps, at the beginning.
</Tip>

## Server-Side Conversation State Is Not Memory

<Info>
  Some provider APIs offer server-side conversation state, such as `previous_response_id` in the OpenAI Responses API: the provider stores the conversation (30 days by default), and the next turn only needs the previous response ID.

  It differs from memory in two ways:

  * **It only continues one conversation chain.** It does not remember your preferences across sessions.
  * **It doesn't save money.** All earlier content in the chain is still billed as input tokens on every turn.

  On APIYI, we recommend maintaining conversation history on the client side. It is the most reliable approach and works the same across models. See the [Multi-Turn Conversation Guide](/en/api-capabilities/multi-turn-conversation) for details.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Does APIYI store my conversations?">
    No. As a relay platform, APIYI only forwards requests and does not store request or response content. See [How does APIYI ensure data security?](/en/faq/data-security)

    If you use a provider's server-side conversation feature (such as `previous_response_id` above), the provider stores that conversation under its own rules.
  </Accordion>

  <Accordion title="Can I make the API remember my preferences?">
    Yes, but you have to build it yourself. The simplest approach is to put your preferences in the system prompt and send it with every request. If you have many preferences, store them in files or a database, retrieve what's relevant, and add it to the request. The Claude API memory tool is an official packaging of this approach.
  </Accordion>

  <Accordion title="Is more memory always better?">
    No. More memory means longer input on every request, higher cost, and more irrelevant content that can distract the model. Review your memory files regularly, remove outdated entries, and keep only the rules and facts you actually use.
  </Accordion>

  <Accordion title="Besides copying a folder, how else can I sync memory?">
    A few options:

    * Commit project-level memory to git so it travels with the code.
    * Keep user-level memory in sync with cloud storage or a sync tool.
    * Run your own memory service: some agent tools can connect to an external memory service over MCP, and multiple computers can share the same service.

    Either way, memory stays somewhere you control, not on the API side.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Why do official web apps and the API give different results?" icon="layers" href="/en/faq/webapp-vs-api-difference">
    What web apps add on top of the API
  </Card>

  <Card title="Multi-Turn Conversation Guide" icon="messages-square" href="/en/api-capabilities/multi-turn-conversation">
    How to maintain conversation history in each API format
  </Card>

  <Card title="Does APIYI Support Cache Billing?" icon="database" href="/en/faq/cache-billing">
    Cache billing rules and hit tips by channel
  </Card>

  <Card title="How does APIYI ensure data security?" icon="shield" href="/en/faq/data-security">
    Encrypted transport and no storage of request content
  </Card>
</CardGroup>
