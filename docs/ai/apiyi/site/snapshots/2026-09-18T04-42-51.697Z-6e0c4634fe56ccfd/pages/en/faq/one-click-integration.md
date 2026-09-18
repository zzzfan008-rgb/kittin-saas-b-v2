> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Is There One-Click Integration?

> Yes, but not as a button. You hand the documentation to your AI coding assistant and it does the integration for you.

## Short Answer

**Yes, but it is not a button.**

We do not offer a "click once and it is configured" integration in the traditional sense. Different models use different protocols, parameters and authentication, so such a button could only cover basic chat and would not solve real needs.

What we offer instead works better: **give the documentation to your AI coding assistant and let it do the integration**. You only register an account and copy a key. Choosing the model, filling in the base URL, writing the code and debugging can all be left to the AI.

<CardGroup cols={2}>
  <Card title="Let an AI integrate for you" icon="bot" href="/en/getting-started">
    The getting-started page has a copyable prompt for Codex, Claude Code and Cursor.
  </Card>

  <Card title="AI Developer Kit" icon="blocks" href="/en/developer-kit">
    A skill, a CLI, and a contract plus model registry for coding agents, each with its own prompt.
  </Card>
</CardGroup>

## Four Ways to Use It

<Steps>
  <Step title="The site-wide skill (recommended)">
    Have your agent run `npx skills add https://docs.apiyi.com` to install the APIYI skill. If that fails, have it read `https://docs.apiyi.com/skill.md` directly.

    That file is written for machines: endpoints, authentication, model-naming rules, known pitfalls and a verification checklist. Reading it gives the agent all the background it needs.
  </Step>

  <Step title="Send one page to an AI">
    Every documentation page has a **Copy page** button at the top right. The arrow next to it also offers "Open in ChatGPT / Claude / Perplexity / Google AI Studio".

    When you hit a problem with a specific model, open that page, click Copy page, and send it together with your error message. This is the fastest debugging path.
  </Step>

  <Step title="Connect as an MCP server">
    Add `https://docs.apiyi.com/mcp` as an MCP server and your agent can search the latest content of this site whenever it needs to, without you feeding it pages by hand.
  </Step>

  <Step title="Command line, zero install">
    If you do not want to write code, run `npx apiyi@latest check` in a terminal (Node 18+). It checks the key, probes the node and lists models; then `npx apiyi@latest chat "Hello" -m gpt-5.4-mini` sends the first message. The command table is in the [AI Developer Kit](/en/developer-kit#cli).
  </Step>
</Steps>

<Info>
  **Why this is better**: a one-click button can only cover a fixed set of scenarios. An AI reads your project's actual stack, writes code that runs, and handles timeouts and retries along the way, which a button never could.
</Info>

## Why Not a One-Click Button?

Model integration differs in several ways:

* **Different protocols**: OpenAI, Claude, Gemini and others use different API protocols
* **Different parameters**: request fields and response shapes vary across models
* **Different authentication**: auth headers and their locations are not standardized
* **Different capabilities**: Function Calling, Prompt Caching and Web Search are implemented differently on each model

A forced one-click flow would usually only cover basic chat, which is not enough for real use.

<Note>
  **You still register the account yourself.** There is no API for an agent to create an account or a key on its own. Accounts and billing involve identity and risk control, so a human has to do that step. Everything from "I have a key" to "the code works" can be handed to the AI.
</Note>

## Related Questions

<CardGroup cols={2}>
  <Card title="Getting Started" icon="rocket" href="/en/getting-started">
    Two paths: let an AI integrate, or do it yourself.
  </Card>

  <Card title="How to Choose a Model" icon="compass" href="/en/faq/model-selection-guide">
    Pick the most suitable AI model for your use case.
  </Card>

  <Card title="How to Configure the Base URL" icon="link" href="/en/faq/base-url-config">
    How to connect APIYI in various clients.
  </Card>

  <Card title="How to View Call Logs" icon="file-text" href="/en/faq/call-logs">
    Check API call records and balance consumption.
  </Card>
</CardGroup>
