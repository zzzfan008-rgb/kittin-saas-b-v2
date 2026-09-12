> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Is There One-Click Integration?

> Yes — but it is not a button. You hand the docs to your AI coding agent and it does the integration for you.

## Short answer

**Yes, but it is not a button.**

We do not offer a traditional click-once-and-it-is-configured integration. Different models use different protocols, parameters and authentication methods, so a button like that could only ever cover basic chat — not real-world needs.

Instead there is a better route: **hand the documentation to your AI coding agent and let it do the integration**. You only need to register an account and copy a key. Choosing a model, getting the base URL right, writing the code and debugging it can all be delegated to the AI.

<Card title="Let an AI integrate it for you" icon="bot" href="/en/getting-started">
  The Quick Start page has a ready-to-copy prompt for Codex, Claude Code, Cursor and similar tools.
</Card>

## Three ways to do it

<Steps>
  <Step title="Install the site-wide skill (recommended)">
    Have your agent run `npx skills add https://docs.apiyi.com` to install the APIYI skill. If that command does not work, point it at `https://docs.apiyi.com/skill.md` and let it read the file directly.

    That file is written specifically for machines: endpoints, authentication, the model-naming rule, known pitfalls and a verification checklist. Reading it gives an agent everything it needs.
  </Step>

  <Step title="Send a single page to an AI">
    Every documentation page has a **Copy page** button in the **top right**. The arrow next to it also offers **Open in ChatGPT / Claude / Perplexity / Google AI Studio**.

    When you hit a problem with a specific model, open that page, hit **Copy page**, and send it to an AI along with your error. It is the fastest debugging path available.
  </Step>

  <Step title="Connect it as an MCP server">
    Add `https://docs.apiyi.com/mcp` as an MCP server and your agent can search this site's current content on demand, instead of you pasting docs each time.
  </Step>
</Steps>

<Info>
  **Why this beats a button**: a one-click button can only cover a fixed set of scenarios. An AI can read your project's actual stack, write code that runs in it, and handle things a button never could — timeout configuration, retry logic, error handling.
</Info>

## Why not a one-click button?

Model integration differs in several ways:

* **Different protocols**: OpenAI, Claude, Gemini, and others use different API protocols
* **Different parameters**: Request fields and response shapes vary across models
* **Different authentication**: Auth headers and locations are not standardized
* **Different capabilities**: Features like Function Calling, Prompt Caching, and Web Search are implemented differently on each model

Forcing a one-click flow usually only covers basic chat, which is not enough for real-world use.

<Note>
  **You still register the account yourself.** There is no API that lets an agent create an account or mint a key on its own — accounts and billing involve identity and risk controls that need a human. But everything from "I have a key" to "the code runs" can be handed to an AI.
</Note>

## Related Questions

<CardGroup cols={2}>
  <Card title="Quick Start" icon="rocket" href="/en/getting-started">
    Two paths: let an AI do it, or wire it up yourself.
  </Card>

  <Card title="How to Choose a Model" icon="compass" href="/en/faq/model-selection-guide">
    Pick the most suitable AI model for your use case.
  </Card>

  <Card title="How to Configure the Base URL" icon="link" href="/en/faq/base-url-config">
    Connect APIYI in various client tools.
  </Card>

  <Card title="How to View Call Logs" icon="file-text" href="/en/faq/call-logs">
    Check API call records and balance consumption.
  </Card>
</CardGroup>
