> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Hermes Agent

> Nous Research's self-improving AI agent with a built-in learning loop and multi-platform gateway, pluggable to any LLM via APIYI

## Overview

Hermes Agent is an open-source AI agent built by Nous Research, positioned as "the agent that grows with you." It's one of the few agents with a built-in **learning loop** — autonomously creating skills from experience, improving them during use, nudging itself to persist knowledge, searching its own past conversations via FTS5 full-text index, and maintaining a deepening user model across sessions. Hermes doesn't have to live on your laptop — it runs equally well on a \$5 VPS, a GPU cluster, or serverless infrastructure that costs nearly nothing when idle.

By integrating APIYI, you get:

<CardGroup cols={2}>
  <Card title="🧠 Self-Improving Loop" icon="brain">
    Autonomous skill creation + refinement, long-term memory across sessions
  </Card>

  <Card title="📱 Multi-Platform Gateway" icon="message-circle">
    Telegram / Discord / Slack / WhatsApp / Signal / Email / CLI
  </Card>

  <Card title="⏰ Cron Scheduling" icon="clock">
    Built-in scheduler delivers reports/audits via any platform
  </Card>

  <Card title="☁️ Runs Anywhere" icon="cloud">
    Seven terminal backends — local / Docker / SSH / Modal / Daytona / Vercel Sandbox
  </Card>
</CardGroup>

<Info>
  **Project Info**: Hermes Agent is MIT-licensed open source. Repository: `github.com/NousResearch/hermes-agent`. Docs: `hermes-agent.nousresearch.com/docs/`.
</Info>

## Install

### Linux / macOS / WSL2 / Termux

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Windows (PowerShell, early beta for native)

```powershell theme={null}
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

The installer handles `uv`, Python 3.11, Node.js, `ripgrep`, `ffmpeg`, and a portable Git Bash automatically.

Once installed, reload your shell and start:

```bash theme={null}
source ~/.bashrc    # or source ~/.zshrc
hermes              # Launches the TUI, ready to chat
```

## Connect to APIYI

Hermes ships with the `hermes model` command, supporting Nous Portal / OpenRouter / OpenAI / custom endpoints. APIYI exposes an **OpenAI-compatible API** — plug it in as a "custom OpenAI endpoint" and you get APIYI's full model matrix in one go.

### Option 1: Configure via `hermes model` (Recommended)

```bash theme={null}
hermes model        # Enter the model selection wizard
```

The wizard will ask:

| Step         | Input                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Provider     | Pick `OpenAI` (or `Custom OpenAI endpoint`)                                                           |
| API Base URL | `https://api.apiyi.com/v1`                                                                            |
| API Key      | Your APIYI key (`sk-...`)                                                                             |
| Model        | The model ID you want, e.g. `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` |

### Option 2: Configure via `hermes config set`

```bash theme={null}
hermes config set llm.provider openai
hermes config set llm.base_url https://api.apiyi.com/v1
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model gpt-5.4
```

Then run `hermes` once to verify the connection.

### Option 3: Environment Variables (Best for Docker / Serverless)

```bash theme={null}
export OPENAI_API_BASE=https://api.apiyi.com/v1
export OPENAI_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=gpt-5.4
hermes
```

Switch models any time via `hermes model` or by updating `HERMES_MODEL` — **no code changes needed**.

### Option 4: Anthropic Native Protocol (Best for Claude-Heavy Workloads)

Hermes treats Anthropic as a **first-class provider**. Internally, the wire protocol is called `anthropic_messages`, and it ships with perks the OpenAI-compatible path doesn't get:

<Info>
  **Why native Anthropic is the better path for Claude**: For native Anthropic, OpenRouter, and Nous Portal providers, Hermes automatically attaches `cache_control` breakpoints with a 1-hour TTL on the system prompt, skill blocks, and the early portion of long context. Subsequent sends across sessions and forked subagents reuse the cache at the discounted cached-read rate. **This optimization does NOT kick in on the OpenAI-compatible path.**
</Info>

CLI configuration:

```bash theme={null}
hermes config set llm.provider anthropic
hermes config set llm.base_url https://api.apiyi.com
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model claude-sonnet-4-6
```

Environment-variable equivalent:

```bash theme={null}
export ANTHROPIC_BASE_URL=https://api.apiyi.com
export ANTHROPIC_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=claude-sonnet-4-6
hermes
```

<Warning>
  **Do NOT include `/v1` in `base_url`** — it must be `https://api.apiyi.com`. The Anthropic protocol appends `/v1/messages` automatically; including `/v1` yourself produces `.../v1/v1/messages` and triggers a 404.
</Warning>

Hermes auto-detects the wire protocol from the URL (paths ending in `/anthropic` route to `anthropic_messages`). For non-standard endpoints like LiteLLM proxies, set the mode explicitly:

```bash theme={null}
hermes config set llm.api_mode anthropic_messages
```

**Bonus**: When creating a token at `api.apiyi.com/token`, **pick the `ClaudeCode` group** to automatically get a 5% discount, stackable with the 10%-20% top-up bonus.

<Tip>
  **Why APIYI?**

  * **One key, many models**: OpenAI / Anthropic / Google / DeepSeek / Zhipu / Kimi and more
  * **Pricing advantage**: typically 5%-20% off vs. official pricing, with deposit bonuses on selected models
  * **Direct access in China**: reach overseas LLMs without a VPN
  * **Dual-protocol compatibility**: both OpenAI-wire and Anthropic-wire endpoints are supported. Heavy Claude users get the 1-hour cross-session cache discount when using the native Anthropic path.
</Tip>

## Feature Cheat Sheet

<CardGroup cols={2}>
  <Card title="Terminal UI" icon="terminal">
    Full TUI: multiline editing, slash-command completion, conversation history, streaming tool output
  </Card>

  <Card title="Messaging Gateway" icon="bot">
    Run `hermes gateway setup` to bind bot tokens and chat from any IM platform
  </Card>

  <Card title="Skills System" icon="puzzle">
    Procedural memory + Skills Hub (`agentskills.io`) — gets smarter as you use it
  </Card>

  <Card title="MCP Integration" icon="plug">
    Plug in any MCP server, including community Linux desktop-control MCP
  </Card>

  <Card title="Scheduled Tasks" icon="clock">
    Built-in cron — natural language like "send me a daily report at 9am"
  </Card>

  <Card title="Subagents" icon="users">
    Spawn isolated subagents for parallel work; call tools via RPC from Python scripts
  </Card>
</CardGroup>

## Migrating from OpenClaw

If you're coming from OpenClaw, Hermes includes a built-in migration tool:

```bash theme={null}
hermes claw migrate              # Interactive full migration
hermes claw migrate --dry-run    # Preview what would be migrated
hermes claw migrate --preset user-data   # User data only, no secrets
hermes claw migrate --overwrite  # Overwrite conflicts
```

It imports `SOUL.md`, memories (`MEMORY.md` / `USER.md`), user-created skills, command allowlists, messaging platform configs, API keys (Telegram / OpenRouter / OpenAI / Anthropic / ElevenLabs), TTS assets, and workspace instructions.

## FAQ

<AccordionGroup>
  <Accordion title="How is Hermes Agent different from OpenClaw and FastClaw?">
    * **Hermes Agent**: Python implementation by Nous Research — focused on the **self-improving loop** with skill evolution and cross-session memory, research-friendly (supports trajectory generation)
    * **OpenClaw**: Node.js implementation — focused on local privacy + multi-IM-platform interplay
    * **FastClaw**: Go single binary — focused on multi-agent management with a Dashboard form factor

    All three can reach APIYI's full model matrix. Pick whichever fits your use case.
  </Accordion>

  <Accordion title="Does it support APIYI's full model lineup?">
    Yes. Hermes supports both the **OpenAI-compatible** and **Anthropic-native** protocols:

    * OpenAI endpoint: `https://api.apiyi.com/v1` — full model matrix
    * Anthropic endpoint: `https://api.apiyi.com` (no `/v1`) — Claude family

    Use the model IDs from APIYI's docs directly (e.g. `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`). Claude-heavy users should go through the Anthropic-native path to unlock Hermes's 1-hour cross-session prompt cache.
  </Accordion>

  <Accordion title="How does the cross-platform messaging work?">
    Hermes runs a **single Gateway process** that manages bot connections across Telegram / Discord / Slack / WhatsApp / Signal. `hermes gateway setup` walks you through pasting tokens, and `hermes gateway start` routes messages from every platform into the same agent instance — **conversations stay continuous across platforms**, so you can pick up a Telegram thread on Discord.

    It includes voice-memo transcription, and cron deliveries flow through the same gateway.
  </Accordion>

  <Accordion title="Can I run it in the cloud?">
    Yes — and Hermes is built for that. It offers seven terminal backends:

    * **Local / Docker / SSH / Singularity**: traditional deployments
    * **Modal / Daytona**: serverless persistence — hibernates when idle, wakes on demand, nearly zero cost between sessions
    * **Vercel Sandbox**: edge runtime

    A \$5 VPS is enough to stand it up 24/7. Sending tasks from your phone via Telegram to a cloud VM works out of the box.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Project Repository" icon="github">
    `github.com/NousResearch/hermes-agent`
  </Card>

  <Card title="Official Docs" icon="book">
    `hermes-agent.nousresearch.com/docs/`
  </Card>

  <Card title="OpenClaw Alternative" icon="bot" href="/en/scenarios/agent/openclaw/overview">
    For the local-privacy + IM interplay use case
  </Card>

  <Card title="FastClaw Alternative" icon="bolt" href="/en/scenarios/agent/fastclaw">
    For the multi-agent factory + Dashboard use case
  </Card>
</CardGroup>
