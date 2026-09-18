> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AI Developer Kit

> Hand APIYI integration to an AI: chat agents install a skill, the terminal gets a CLI, and coding agents read the contract and model registry before writing code. Each path has a copyable prompt.

<Note>
  The account and the key still have to be created by you in the [console](https://api.apiyi.com/token). Everything from "I have a key" to "the code works" can be delegated to an AI through any of the three paths below.
</Note>

## Pick a path

<CardGroup cols={3}>
  <Card title="Skills · chat agents" icon="sparkles" href="#skills">
    OpenClaw, Claude Code and other agents with a skills system. Install the skill once, then call APIYI in natural language.
  </Card>

  <Card title="CLI · terminal" icon="terminal" href="#cli">
    No code. Verify a key, list models, send a message and generate an image from the terminal. `npx apiyi@latest check` needs no install.
  </Card>

  <Card title="Developer kit · coding agents" icon="code" href="#rules-for-coding-agents">
    Cursor, Claude Code and Codex read the contract and the model registry before writing integration code. No invented endpoints.
  </Card>
</CardGroup>

## What is in the kit

Every file is public. No login is needed, and any agent can fetch them directly:

| File                     | URL                                          | Role                                                                                                                                                                                 |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Integration contract** | `https://docs.apiyi.com/skill.md`            | Endpoint table, authentication, model-naming rules, known pitfalls, self-check statuses, verification checklist. It is both the rulebook for coding agents and the body of the skill |
| **Model registry**       | `https://docs.apiyi.com/model-registry.json` | Machine-readable source of truth for model IDs, endpoints, groups, billing type and list prices. Regenerated with the pricing table                                                  |
| **Page index**           | `https://docs.apiyi.com/llms.txt`            | Site-wide index so the agent can decide which page to read                                                                                                                           |
| **Full text**            | `https://docs.apiyi.com/llms-full.txt`       | Every page concatenated. Large; fetch on demand                                                                                                                                      |
| **Single page as text**  | Append `.md` to any page URL                 | When you only need one page. Cheaper than HTML                                                                                                                                       |
| **MCP server**           | `https://docs.apiyi.com/mcp`                 | Connect this site as an MCP server so the agent can search the latest content                                                                                                        |

<Tip>
  The plain-text version of this page is `https://docs.apiyi.com/en/developer-kit.md`.
</Tip>

## Rules for coding agents

The most common failure of a coding agent is not bad code. It is **writing from memory**: inventing an endpoint that does not exist, typing `gpt-5-4-mini` instead of `gpt-5.4-mini`, or adding an extra `/v1` to the Anthropic SDK base URL. Five rules stop that:

1. **Do not invent endpoints, parameter names, enum values or response shapes.** Use only the paths in the `skill.md` endpoint table; parameters follow the official definition of the protocol in use (OpenAI, Anthropic or Gemini).
2. **`model-registry.json` is the single source of truth for model IDs.** IDs are dot-versioned and case-sensitive. The hyphens in documentation URLs are URL-safe replacements, not model IDs.
3. **Pick the base URL by SDK, not by model.** The OpenAI SDK uses `https://api.apiyi.com/v1`; the Anthropic SDK uses the root `https://api.apiyi.com`; the Google GenAI SDK uses the root with `api_version` set to `v1beta`.
4. **Read the key only from the `APIYI_API_KEY` environment variable.** Never hardcode it, commit it or paste it into a chat.
5. **Explain first, then edit.** Have the agent state which endpoint, which model and what timeout it intends to use. It edits code only after you confirm.

<Prompt description="Full prompt for Cursor, Claude Code, Codex and other coding agents. Copy and paste as is." icon="code" actions={["copy"]}>
  Before writing any code, read [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) and
  [https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt) in full. You must follow these rules:

  * Do not invent endpoints, parameter names, enum values or response shapes.
    Use only the paths listed in the skill.md endpoint table.
  * Treat [https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) as the single source of truth for
    model IDs. IDs are dot-versioned and case-sensitive (gpt-5.4-mini, not gpt-5-4-mini).
    Never type one from memory.
  * Pick the base URL by SDK: the OpenAI SDK uses [https://api.apiyi.com/v1](https://api.apiyi.com/v1); the Anthropic SDK
    uses [https://api.apiyi.com](https://api.apiyi.com) with no /v1; the Google GenAI SDK uses [https://api.apiyi.com](https://api.apiyi.com)
    with api\_version set to v1beta.
  * Read the key only from the APIYI\_API\_KEY environment variable. Never hardcode or commit it.
  * For page-level detail, find the page in llms.txt and append .md to read it as plain text.

  When you have finished reading, first explain in your own words the integration flow you
  intend to follow (which endpoint, which model, what timeout). Do not edit code yet.
  Wait for my confirmation.
</Prompt>

<Accordion title="What this prompt protects you from">
  | Requirement                 | Pitfall it blocks                                                                                          |
  | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
  | No invented endpoints       | The agent assembles `/v1/complete` or `/v1/generate` from training memory and loops on 404s                |
  | Model IDs from the registry | `gpt-5-4-mini` or `minimax-m3` return 404, and the error does not say what is wrong                        |
  | Base URL by SDK             | An extra `/v1` on the Anthropic SDK becomes `/v1/v1/messages`; a missing `/v1` on the OpenAI SDK also 404s |
  | Key only from env           | A hardcoded key leaks with the repository; this site's pre-commit hook blocks it too                       |
  | Explain before editing      | Stops the agent from touching ten files before discovering it picked the wrong protocol                    |
</Accordion>

## Skills

The skill is `skill.md` itself: an integration reference written for machines. Once installed, the agent recalls these rules whenever it needs to call APIYI. Three ways to install it:

<Tabs>
  <Tab title="npx skills (generic)" icon="package">
    For Claude Code, Cursor, Codex and any other tool that supports the Agent Skills spec:

    ```bash theme={null}
    npx skills add https://docs.apiyi.com
    ```

    Discovery goes through this site's `/.well-known/agent-skills/index.json`. This installs `skill.md` itself without scripts; use `npx apiyi@latest check` for the self-check.
  </Tab>

  <Tab title="OpenClaw" icon="bot">
    OpenClaw's skill installer accepts git sources and expects `SKILL.md` at the repository root. The skill repository `github.com/apiyi-com/skills` is laid out that way and ships a self-check script:

    ```bash theme={null}
    openclaw skills install git:apiyi-com/skills
    ```

    Or clone it into the workspace by hand:

    ```bash theme={null}
    git clone https://github.com/apiyi-com/skills ~/.openclaw/workspace/skills/apiyi
    ```

    After installing, the agent runs `scripts/apiyi.py --check` and guides you through key setup based on the result.
  </Tab>

  <Tab title="Manual copy" icon="clipboard">
    Works with any agent that can read files. Put the contents of `https://docs.apiyi.com/skill.md` into its skills directory:

    | Agent       | Location                                     |
    | ----------- | -------------------------------------------- |
    | Claude Code | `.claude/skills/apiyi/SKILL.md`              |
    | Codex CLI   | `.agents/skills/apiyi/SKILL.md`              |
    | Cursor      | A project rules file, or paste it as context |
    | Others      | Include the full text in the system prompt   |
  </Tab>
</Tabs>

<Prompt description="For OpenClaw, Claude Code, Cursor and other agents that support skills. Copy and paste as is." icon="bot" actions={["copy"]}>
  Install the APIYI skill on yourself first, then use it to integrate APIYI for me.

  1. Run `npx skills add https://docs.apiyi.com` (skill name: apiyi).
     If you are OpenClaw, install `git:apiyi-com/skills` with the skills installer,
     or clone the repo into \~/.openclaw/workspace/skills/apiyi/.
     If neither works, fetch and read [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) in full. Same content.
  2. Self-check before anything else: run the skill's `scripts/apiyi.py --check`
     (or `npx apiyi@latest check` if the script is not present).
     On no\_key, ask me for a key (I copy it from [https://api.apiyi.com/token](https://api.apiyi.com/token)) and put it
     in the APIYI\_API\_KEY environment variable. Never hardcode it, never commit it.
  3. Once the check says ready, send one "Hello" with gpt-5.4-mini, show me the reply,
     and tell me what you can do for me with this skill from here on.
</Prompt>

### How the key reaches the agent

* **The environment variable `APIYI_API_KEY` comes first.** The skill, the CLI and every example in these docs read it from there.
* **OpenClaw** stores the key at `skills.entries.apiyi.apiKey` in `~/.openclaw/openclaw.json` and injects it as `APIYI_API_KEY` at run time. That is what the `primaryEnv` field in the skill frontmatter declares. See [OpenClaw configuration file](/en/scenarios/agent/openclaw/config-json) for the file layout.
* **The CLI** saves it with `npx apiyi@latest auth set-key` to `~/.config/apiyi/config.json` with mode 0600.

### Self-check statuses

The skill script, the CLI and a manual curl all return the same status set:

| Status          | Meaning                     | What the agent does                                                                   |
| --------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| `ready`         | `/v1/models` returned 200   | Tells you how many models are visible and asks what to build                          |
| `no_key`        | No key found anywhere       | Guides you to copy a key from the console, then re-checks                             |
| `invalid_key`   | 401 or 403                  | Key is wrong, disabled or exhausted. Asks you to copy it again                        |
| `network_error` | Timeout, DNS failure or 5xx | Retries once, then suggests `vip.apiyi.com` (outside mainland China) or `b.apiyi.com` |

<Warning>
  A normal `sk-` key **cannot read the balance**, so there is no `no_balance` status. Balance and logs use a separate system token, see [How to view call logs](/en/faq/call-logs). A 429 can mean either rate limiting or an empty balance. The agent should not guess; it should point you to the [console](https://api.apiyi.com/account/profile).
</Warning>

## CLI

Get the first call working from the terminal without writing code. Node 18 or newer, nothing to install:

```bash theme={null}
npx apiyi@latest check
```

<Prompt description="For any agent that can run terminal commands, or run the lines yourself." icon="terminal" actions={["copy"]}>
  Please help me install and run the APIYI CLI: [https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
  Requirements: Node 18+; run `npx apiyi@latest check` with nothing to install;
  guide me to configure an API key (`npx apiyi@latest auth set-key` or the APIYI\_API\_KEY env var, copied from [https://api.apiyi.com/token](https://api.apiyi.com/token));
  finally run `npx apiyi@latest models --grep gpt-5` and `npx apiyi@latest chat "Hello" -m gpt-5.4-mini` and paste the output.
</Prompt>

### Commands

| Command                                             | Needs        | What it does                                                                                                                                            |
| --------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiyi check`                                       | key optional | Reports where the key came from, node reachability, whether `/v1/models` returns 200, latency and status. Shows balance if a system token is configured |
| `apiyi models [--grep text]`                        | key optional | With a key, lists the models your key can reach via `/v1/models`; without one, reads the public registry                                                |
| `apiyi chat "prompt" [-m model] [--stream]`         | key          | Sends one Chat Completions request and prints the reply and token usage. Default model `gpt-5.4-mini`                                                   |
| `apiyi responses "input" [-m model] [--effort low]` | key          | Uses the Responses endpoint and prints `output_text`                                                                                                    |
| `apiyi image "prompt" -m gpt-image-2 [-o file]`     | key          | Generates an image and writes it to a local file, 360 s timeout                                                                                         |
| `apiyi balance`                                     | system token | Shows the balance (500000 quota units = 1 USD)                                                                                                          |
| `apiyi auth set-key` / `show` / `clear`             | none         | Saves the key with hidden input; `show` masks it; `clear` removes it                                                                                    |

Global flags: `--api-key`, `--node api|vip|b|cf` (pick a node), `--base-url`, `--timeout`, `--json` (machine-readable output).

### Key lookup order

`--api-key` flag, then the `APIYI_API_KEY` environment variable, then `~/.config/apiyi/config.json`, then OpenClaw's `~/.openclaw/openclaw.json`. If you already installed the OpenClaw skill, the CLI reuses that key.

### Exit codes

Scripts and agents branch on the exit code instead of parsing text:

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| 0    | Success                                            |
| 2    | `no_key`                                           |
| 3    | `invalid_key` (401 / 403)                          |
| 4    | `network_error` (DNS, timeout, or 5xx after retry) |
| 5    | Model not found (404, usually a misspelled ID)     |
| 6    | Rate limited or out of balance (429)               |
| 7    | Bad request (400, prints `error.message` verbatim) |
| 8    | Bad command-line arguments                         |

Source is at `github.com/apiyi-com/cli`; the npm package is `apiyi`. The docs always write `npx apiyi@latest` because `npx` caches old versions.

## model-registry.json fields

Regenerated every time the pricing table is refreshed, from the same data as the [model pricing](/en/models) page. Top-level fields:

| Field            | Meaning                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `schema_version` | Schema version, currently 1. Within a version, fields are only added, never renamed                                            |
| `generated_at`   | Generation time (UTC)                                                                                                          |
| `base_urls`      | The base URL for each of the three SDKs, plus the Gemini `api_version`                                                         |
| `nodes`          | Available node hostnames                                                                                                       |
| `endpoints`      | Endpoint name to path and method: `chat` / `responses` / `messages` / `gemini` / `images` / `embeddings` / `rerank` / `models` |
| `groups`         | Group name to display label and ratio                                                                                          |
| `models[]`       | See below                                                                                                                      |

Each model entry:

| Field                                                                   | Meaning                                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `id`                                                                    | Model ID, used verbatim in requests, case-sensitive                               |
| `vendor_en`                                                             | Vendor name in English                                                            |
| `category`                                                              | Capability type such as `text`, `image`, `video`, `embedding`                     |
| `endpoints`                                                             | Endpoint names this model accepts, matching the keys of the top-level `endpoints` |
| `groups`                                                                | Token groups that can call it                                                     |
| `billing.type`                                                          | `per_token` (per million tokens) or `per_call`                                    |
| `billing.input_usd_per_m` / `output_usd_per_m` / `cache_read_usd_per_m` | USD list prices for per-token models                                              |
| `billing.per_call_usd`                                                  | USD list price per call for per-call models                                       |
| `billing.tiered`                                                        | Whether tiered pricing applies (see the model page when true)                     |
| `docs_url`                                                              | Detail page URL when one exists                                                   |

<Info>
  Prices in the registry are **list prices**. They exclude recharge bonuses and group discounts; actual charges follow the console. Groups are explained in [Groups explained](/en/faq/groups-explained).
</Info>

## Related pages

<CardGroup cols={2}>
  <Card title="Getting started" icon="rocket" href="/en/getting-started">
    Two paths: let an AI integrate, or do it yourself.
  </Card>

  <Card title="Is there one-click integration?" icon="plug" href="/en/faq/one-click-integration">
    Yes, in the form of handing the docs to an AI rather than a button.
  </Card>

  <Card title="OpenClaw" icon="bot" href="/en/scenarios/agent/openclaw/overview">
    Open-source local AI assistant; with the skill installed it calls APIYI in natural language.
  </Card>

  <Card title="Model pricing" icon="circle-dollar-sign" href="/en/models">
    The human-readable version of the registry, grouped by vendor with tiered prices.
  </Card>
</CardGroup>
