> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FastClaw

> Lightweight Go-based multi-agent runtime with a single binary + dashboard, plug-in any major LLM through APIYI

## Overview

FastClaw is a lightweight AI Agent runtime written in Go, positioned as an "Agent Factory" — it creates, manages, and runs multiple AI agents, each with its own personality (SOUL.md), memory, skills, and tools. FastClaw handles LLM communication, tool execution, sandbox isolation, and session management out of the box, ships as a single binary, and comes with a built-in Web Dashboard.

By integrating APIYI, you get:

<CardGroup cols={2}>
  <Card title="🚀 Single-Binary Deployment" icon="rocket">
    One-line install, bundled SQLite, runs locally or in the cloud
  </Card>

  <Card title="🤖 Multi-Agent Management" icon="users">
    Each agent has its own personality, model, skills, and sessions
  </Card>

  <Card title="📱 Multi-Channel IM" icon="message-circle">
    Built-in Telegram / Discord / Slack channel bindings
  </Card>

  <Card title="🛡️ Sandbox Isolation" icon="shield">
    Docker / E2B sandbox support for secure tool execution
  </Card>
</CardGroup>

<Info>
  **Project Info**: FastClaw is source-available under the FastClaw Community License (Apache 2.0 + addendum). Repository: `github.com/fastclaw-ai/fastclaw`.
</Info>

## Install & Start

Install FastClaw with the official one-liner — it drops a single binary into `~/.local/bin`:

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/fastclaw-ai/fastclaw/main/install.sh | bash
```

The first run launches a setup wizard. After configuring your LLM provider, a default agent is created automatically:

```bash theme={null}
fastclaw                    # Foreground (Ctrl+C to stop)
fastclaw daemon start       # Background (logs at ~/.fastclaw/daemon.log)
fastclaw daemon install     # Register as a launchd / systemd service
```

Then open the dashboard at `http://localhost:18953` (default port `18953`).

## Connect to APIYI (Recommended)

APIYI is compatible with both the OpenAI and Anthropic API protocols. FastClaw can use either an **OpenAI-compatible Provider** or an **Anthropic-compatible Provider** — both reach the same full model matrix with a single APIYI key.

### Option 1: Configure via Dashboard (Recommended)

1. Open `http://localhost:18953` and log in with the admin account generated on first run
2. Go to **Models / Providers** and add a new Provider entry:

| Field         | Recommended Value                                                                             |
| ------------- | --------------------------------------------------------------------------------------------- |
| Provider type | `OpenAI` compatible                                                                           |
| Base URL      | `https://api.apiyi.com/v1`                                                                    |
| API Key       | Your APIYI key (`sk-...`)                                                                     |
| Models        | Add as needed, e.g. `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` |

3. Go to the agent's **Models** panel and set it as the default model

### Option 2: Configure via CLI

```bash theme={null}
# 1. Create a new agent, initially bound to APIYI (OpenAI-compatible)
fastclaw agents init alpha \
  --provider openai \
  --model openai/gpt-5.4 \
  --api-key-env APIYI_API_KEY

# 2. Point the OpenAI provider's Base URL at APIYI
fastclaw agents config alpha set provider.openai.apiBase https://api.apiyi.com/v1
fastclaw agents config alpha set provider.openai.apiKeyEnv APIYI_API_KEY

# 3. Add the models you want (append, idempotent)
fastclaw agents config alpha set provider.openai.model gpt-5.4
fastclaw agents config alpha set provider.openai.model claude-sonnet-4-6
fastclaw agents config alpha set provider.openai.model deepseek-v3.2
```

The `APIYI_API_KEY` environment variable must be exported in your shell first (`export APIYI_API_KEY=sk-...`) — FastClaw does not store the key in plaintext in the database.

<Tip>
  **Why APIYI?**

  * **One key, many models**: OpenAI / Anthropic / Google / DeepSeek / Zhipu and more — no need to apply for each provider separately
  * **Pricing advantage**: typically 5%-20% off vs. official pricing, with deposit bonuses on selected models
  * **Direct access in China**: reach overseas LLMs without a VPN
  * **Dual-protocol compatibility**: both FastClaw provider types are supported
</Tip>

### Option 3: Anthropic Native Protocol (Best for Claude-Heavy Workloads)

If you primarily use Claude models, point the Anthropic Provider directly at APIYI:

| Field         | Recommended Value                            |
| ------------- | -------------------------------------------- |
| Provider type | `Anthropic`                                  |
| Base URL      | `https://api.apiyi.com`                      |
| API Key       | Your APIYI key                               |
| Models        | `claude-sonnet-4-6`, `claude-opus-4-7`, etc. |

Equivalent CLI:

```bash theme={null}
fastclaw agents config alpha set provider.anthropic.apiBase https://api.apiyi.com
fastclaw agents config alpha set provider.anthropic.apiKeyEnv APIYI_API_KEY
fastclaw agents config alpha set provider.anthropic.model claude-sonnet-4-6
fastclaw agents config alpha set model claude-sonnet-4-6
```

## Feature Cheat Sheet

<CardGroup cols={2}>
  <Card title="Agent Management" icon="bot">
    Dashboard → Agents: create / edit agents, define SOUL.md (personality), IDENTITY.md, MEMORY.md (long-term memory)
  </Card>

  <Card title="Skills" icon="puzzle">
    Bundled: code-runner, image-gen, data-analysis, web-search, skill-creator. Install more from ClawHub / GitHub.
  </Card>

  <Card title="IM Channel Bindings" icon="message-circle">
    Agent → Channels: paste Telegram / Discord / Slack bot tokens — auto-validated on save.
  </Card>

  <Card title="OpenAI-Compatible API" icon="code">
    `/v1/chat/completions` streaming endpoint works with any OpenAI SDK out of the box.
  </Card>

  <Card title="Sandbox Execution" icon="shield">
    Settings → Runtime to toggle Docker / E2B sandbox, with auto-sync of artifacts after tool calls.
  </Card>

  <Card title="Scheduler" icon="clock">
    Agent → Scheduler: let the agent create cron-based reminders via `create_cron_job`.
  </Card>
</CardGroup>

## Deployment Modes

| Mode           | Use Case            | Key Config                                         |
| -------------- | ------------------- | -------------------------------------------------- |
| **Local**      | Personal use        | `fastclaw daemon start`, default SQLite storage    |
| **Docker**     | Single-host service | `cd deploy/docker && ./start.sh`                   |
| **Kubernetes** | Multi-replica prod  | `FASTCLAW_STORAGE_TYPE=postgres` + S3 object store |

Multi-replica deployments require:

* `FASTCLAW_STORAGE_TYPE=postgres`, `FASTCLAW_STORAGE_DSN=postgres://...`
* A set of `FASTCLAW_OBJECT_STORE_*` variables pointing at an S3-compatible store (used to sync skills and workspaces across pods)
* `FASTCLAW_BIND=all` (listen on `0.0.0.0`)

Full K8s manifests live in the repo's `deploy/k8s/` folder.

## FAQ

<AccordionGroup>
  <Accordion title="What's the difference between FastClaw and OpenClaw?">
    * **FastClaw**: Go-based, single binary, geared toward the "Agent Factory" use case — multi-agent management, IM channel delivery, sandbox isolation. Best when you want to ship agents as a service.
    * **OpenClaw**: Node.js-based, focused on the personal local-assistant use case — local privacy + multi-IM-platform interplay.
    * Both can reach APIYI's full model matrix. Pick whichever fits your deployment shape.
  </Accordion>

  <Accordion title="Does it support APIYI's full model lineup?">
    Yes. APIYI exposes both an OpenAI-compatible endpoint (`https://api.apiyi.com/v1`) and an Anthropic-compatible endpoint (`https://api.apiyi.com`). Either FastClaw provider type works — use the model IDs from APIYI's docs directly (e.g. `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`).
  </Accordion>

  <Accordion title="How do I expose an agent through Telegram / Discord?">
    1. Create a bot on the target platform and obtain a token
    2. Dashboard → pick the agent → Channels → paste the token and save (it's auto-validated via `getMe` / `auth.test`)
    3. Search the bot inside the IM platform and start chatting — sessions are isolated per chatID
  </Accordion>

  <Accordion title="Can I use it in a commercial project?">
    Yes. The FastClaw Community License allows:

    * ✅ Embedding as the backend of your own product (commercial use)
    * ✅ Internal deployment within your organization

    Not allowed (without a commercial license):

    * ❌ Hosting FastClaw itself as a multi-tenant SaaS to unrelated organizations
    * ❌ Removing or altering FastClaw branding in the dashboard

    Commercial licensing: `support@thinkany.ai`
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Project Repository" icon="github">
    `github.com/fastclaw-ai/fastclaw`
  </Card>

  <Card title="APIYI API Docs" icon="book" href="/en/getting-started">
    Get your key and Base URL reference
  </Card>

  <Card title="OpenClaw Alternative" icon="bot" href="/en/scenarios/agent/openclaw/overview">
    A different option for the personal local-assistant use case
  </Card>

  <Card title="Pricing & Top-Ups" icon="coins" href="/en/faq/recharge-promotions">
    See APIYI pricing and first-recharge bonuses
  </Card>
</CardGroup>
