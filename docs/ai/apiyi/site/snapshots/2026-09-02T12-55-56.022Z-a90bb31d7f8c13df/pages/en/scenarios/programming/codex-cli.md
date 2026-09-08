> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Codex

> One config, three surfaces: use gpt-5.6-sol / gpt-5.5 / gpt-5.4 via APIYI in the Codex desktop app, IDE extensions (VSCode/Cursor), and the CLI. Recommended path is config.toml + auth.json — no env-var wrangling.

<Warning>
  **On cost, up front**: for long-context coding work and agentic deep exploration, **pay-as-you-go API usage burns through credit fast, and it usually works out worse value than an official subscription**.

  Codex re-reads your project context, digests tool output, and iterates every turn — a single serious task easily runs to hundreds of thousands of tokens. This has genuinely happened: **\$5 of credit ran out before one deep-research run finished**. That is not a fault; it is the normal burn rate for this kind of work.

  * **High usage, and able to reach the official service directly**: buy the official ChatGPT Plus / Pro subscription — a flat monthly fee is better value at that intensity.
  * **Blocked by your network, or you simply want to pay only for what you use**: the API suits you better — direct access with no proxy, no fixed monthly fee, no official account to maintain, and one key for 400+ models.

  Neither option is strictly better. Pick by your actual usage and network situation. We tell you this up front so the bill holds no surprises.
</Warning>

## Overview

<Info>
  **Codex and the ChatGPT app have merged**: in early July 2026, OpenAI folded the Codex desktop app into the ChatGPT app — they are now one product. This guide therefore **applies to both the Codex app and the ChatGPT app**: if you're using Codex inside the ChatGPT app, the configuration is exactly the same.
</Info>

**OpenAI Codex** is OpenAI's official AI coding assistant, available three ways: the **desktop app**, **IDE extensions** (VSCode / Cursor, etc.), and the **command-line CLI**. All three share the **same configuration** under `~/.codex/` (`config.toml` and `auth.json`).

Integrating with APIYI comes down to one sentence:

> **Replace OpenAI's endpoint with APIYI**

APIYI is an **OpenAI-compatible interface (transparent proxy)** — configure it once, and the desktop app, extensions, and terminal all work.

<CardGroup cols={2}>
  <Card title="🔁 One Config, Three Surfaces" icon="layers">
    Desktop / extension / CLI all share `~/.codex/` — set it once
  </Card>

  <Card title="⚡ Latest Models" icon="sparkles">
    Supports `gpt-5.6-sol` / `gpt-5.5` / `grok-4.5`, plus other models
  </Card>

  <Card title="💰 Pay As You Go" icon="calculator">
    Same billing model as OpenAI's own API, no fixed monthly fee
  </Card>

  <Card title="🪟 Cross-Platform" icon="globe">
    Windows / Mac / Linux — all supported
  </Card>
</CardGroup>

<Info>
  **Understand it first**: the key to pointing Codex at a third-party API (like APIYI) is to set the "model provider" to APIYI in `~/.codex/config.toml` and put your Key in `~/.codex/auth.json`. **Both the desktop app and IDE extensions rely on these files** — so this guide leads with config files, not environment variables.
</Info>

## 1. Prerequisites: Get Your APIYI Key

<Steps>
  <Step title="Sign up / Log in to APIYI">
    Go to [api.apiyi.com](https://api.apiyi.com) and register or sign in.
  </Step>

  <Step title="Create an API Key">
    Open the "Token Management" page ([api.apiyi.com/token](https://api.apiyi.com/token)) and click "Create New Token".
  </Step>

  <Step title="Copy the Key">
    Copy the generated API Key (format: `sk-***`) and keep it safe — you'll paste it into the config file.
  </Step>
</Steps>

### Pick Your Surface

All three surfaces use **exactly the same config** — pick whichever fits your workflow:

<CardGroup cols={3}>
  <Card title="🖥️ Desktop App" icon="monitor">
    Standalone app, works out of the box, **best for beginners**
  </Card>

  <Card title="🧩 IDE Extension" icon="puzzle">
    VSCode / Cursor extension, code alongside it
  </Card>

  <Card title="⌨️ CLI" icon="terminal">
    Terminal workflow, great for scripts and automation
  </Card>
</CardGroup>

## 2. Core Config (Recommended: Config Files, Not Env Vars)

Three ways below — **pick one**. Recommended order: hand-write config files (most reliable) → visual → environment variables.

### Option 1 · Hand-write `auth.json` + `config.toml` (recommended, most reliable)

Open Codex's config directory (create it if missing) and add/edit two files inside:

<Tabs>
  <Tab title="🪟 Windows">
    Config directory: `%USERPROFILE%\.codex\` (i.e. `C:\Users\YourName\.codex\`).

    Open it in File Explorer.
  </Tab>

  <Tab title="Mac / Linux">
    Config directory: `~/.codex/`.

    Run `mkdir -p ~/.codex` in the terminal to enter it.
  </Tab>
</Tabs>

<Warning>
  **If `config.toml` already exists, do NOT overwrite the whole thing!** It may already hold your previous model preferences, approval policy, MCP servers, etc. The right approach is **back up first, then merge** (see "How to safely edit an existing config.toml" below) — only add the few lines APIYI needs. Same for `auth.json`: if it exists, just update the `OPENAI_API_KEY` value.
</Warning>

**1) `auth.json` — put your Key here:**

```json theme={null}
{
  "OPENAI_API_KEY": "sk-your-APIYI-key"
}
```

**2) `config.toml` — point the model provider at APIYI:**

For a **brand-new file**, paste the content below. For an **existing file**, add the "global keys" at the **very top** and append the `[model_providers.apiyi]` block at the **very bottom** (reason in the tip below).

```toml theme={null}
# === Global (put at the very top of the file) ===
model = "gpt-5.4"                 # default model, change to gpt-5.5 etc. as needed
model_provider = "apiyi"          # use the apiyi provider defined below
preferred_auth_method = "apikey"  # authenticate with API Key (not chatgpt login)

# === APIYI provider definition (put at the very bottom) ===
[model_providers.apiyi]
name = "apiyi"
base_url = "https://api.apiyi.com/v1"
experimental_bearer_token = "sk-your-APIYI-key"
wire_api = "responses"
```

<Warning>
  **Replace `sk-your-APIYI-key` with your real Key** before saving (the `sk-` string you copied from `api.apiyi.com/token`). The Key must match in both files.
</Warning>

<Accordion title="How to safely edit an existing config.toml (backup + merge best practice)">
  **Step 1: Back up first.** Before changing any config, copy the original so you can always restore it:

  ```bash theme={null}
  # Mac / Linux
  cp ~/.codex/config.toml ~/.codex/config.toml.bak

  # Windows PowerShell
  Copy-Item $env:USERPROFILE\.codex\config.toml $env:USERPROFILE\.codex\config.toml.bak
  ```

  **Step 2: Merge, don't overwrite.** Only add what APIYI needs into the existing file: put the `model` / `model_provider` / `preferred_auth_method` lines at the **very top**, and append the `[model_providers.apiyi]` block at the **very bottom**. Leave everything else as-is.

  <Warning>
    **TOML ordering gotcha**: in TOML, all "bare key-value pairs" (like `model = "..."`) **must appear before any `[xxx]` table header**, or they get absorbed into the preceding table. So keeping global keys at the top and `[model_providers.apiyi]` at the bottom is the least error-prone layout.
  </Warning>

  **Step 3: Just want to test without touching your main config?** Use a profile: create `~/.codex/apiyi.config.toml` with the content above, then run `codex --profile apiyi` — fully isolated (see [Advanced](#6-advanced-configuration)).
</Accordion>

<Note>
  **Field notes**:

  * `base_url`: always `https://api.apiyi.com/v1` — it **must include `/v1`**, or you'll get 404s.
  * `experimental_bearer_token`: puts the Key directly in the provider block and sends it as a Bearer token. **This is the one form that reliably works across the desktop app, IDE extension, and CLI** — no environment variable involved.
  * A provider's auth fields are **mutually exclusive — pick exactly one**: `experimental_bearer_token` (Key in the config, recommended) / `env_key` (reads the Key from the **launching process's environment variable** — note it does **not** fall back to `auth.json`, and the desktop app cannot see variables exported in your terminal) / `requires_openai_auth` (reuses the official login state in `auth.json`). If you followed an older version of this guide that combined `env_key` + `requires_openai_auth`, switch to the current form.
  * `wire_api = "responses"`: Codex's default and preferred protocol, supported by APIYI. If a specific model returns 404 / unknown endpoint, switch it to `"chat"` as a fallback (see [Advanced](#6-advanced-configuration)).
  * Do not hard-code absolute paths like `C:\Users\xxx\.codex\...` in this file — it breaks across machines.
</Note>

### Option 2 · cc-switch Visual Config (GUI, no hand-editing)

If you'd rather not edit files by hand, use **CC Switch** — a GUI that writes APIYI's URL, Key, and model into the Codex config with a few clicks. It also manages Claude Code, Codex, Gemini CLI, and more in one place, with one-click switching, and handles the backup/merge above for you — a good first choice for beginners.

See [CC Switch Visual Config](/en/scenarios/programming/cc-switch). Once set, Codex's desktop app / extension / CLI all pick up the config automatically.

### Option 3 · Environment Variables (optional, fiddly, not recommended)

<Accordion title="Just want a quick terminal test? Expand for the env-var method (not for long-term use)">
  The Codex CLI can also read the `OPENAI_BASE_URL` / `OPENAI_API_KEY` environment variables:

  ```bash theme={null}
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  export OPENAI_API_KEY="sk-your-APIYI-key"
  ```

  <Warning>
    **Not recommended as the primary path**: env vars often don't take effect on recent Codex builds, and **the desktop app / IDE extensions don't read them** — they only honor `config.toml` + `auth.json`. Env vars are fine for a quick CLI test only; for long-term use, prefer Option 1 or Option 2.
  </Warning>
</Accordion>

## 3. Using Each Surface (Desktop First)

Once `~/.codex/` is set up, pick any surface below. **Restart the program after changing config** (Codex reads config only at startup).

### 1. Codex Desktop App (most recommended)

1. Install and open the Codex desktop app.
2. On first launch, choose the auth method: **select apikey** (not chatgpt login).
3. In the model / provider selector, choose the `apiyi` provider and your target model (e.g. `gpt-5.4`).
4. **Restart the app** to apply.
5. Run a minimal task to verify (see [Section 4](#4-minimal-verification)).

### 2. IDE Extension (VSCode / Cursor)

1. Open the extensions marketplace (in VSCode press `Ctrl+Shift+X` / `Cmd+Shift+X`), search `Codex — OpenAI's coding agent`, and click `Install`.
2. After install, a Codex icon appears in the sidebar — click it to open the panel.
3. On first open, answer three prompts: ① auth method — **select apikey**; ② Key source — choose "config file / environment variable"; ③ enable `AGENTS.md` (recommended).
4. **Restart the editor** to apply.
5. Run a minimal task in the Codex panel to verify.

### 3. CLI

Install the official CLI globally (requires Node.js 18+):

```bash theme={null}
npm install -g @openai/codex
codex --version
```

Enter your project and launch, or run a one-shot task:

```bash theme={null}
cd /your/project
codex                                  # interactive mode
codex "write a Python HTTP server"     # pass a task directly
codex -q "fix the build errors"        # non-interactive / silent mode
```

<Tip>
  Mac users hitting global-install permission errors should use nvm / fnm to manage Node and avoid `sudo`.
</Tip>

## 4. Minimal Verification

After configuring and restarting, enter a minimal task in any surface:

```text theme={null}
Create a hello endpoint in this project and include a usage example.
```

CLI users can also run:

```bash theme={null}
codex -q "hello"
```

If it returns runnable code, the APIYI integration is working.

## 5. Models (APIYI Recommendations)

Set these in `config.toml`'s `model` field, or switch at runtime:

| Model                | Strengths                                             | Best For                                                                         |
| -------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| **`gpt-5.6-sol`**    | 5.6 flagship (released July 9, 2026)                  | The hardest problems: complex coding, deep engineering analysis, agent workflows |
| **`gpt-5.6-terra`**  | 5.6 balanced tier                                     | High-volume business tasks, balancing performance and cost                       |
| **`gpt-5.6-luna`**   | 5.6 fast, low-cost tier                               | Summarization, drafting, routine automation — fast and cheap                     |
| **`gpt-5.5`**        | Previous-gen flagship                                 | Complex coding, engineering analysis, agent workflows                            |
| **`gpt-5.4`**        | Stable workhorse                                      | Most coding, debugging, refactoring (default pick)                               |
| **`gpt-5.4-mini`**   | Cheap 5.4 variant                                     | Mid-scale tasks, batch processing, cost-saving                                   |
| **`grok-4.5`**       | xAI flagship, **native responses protocol support**   | Coding agents, complex tasks — the top pick outside the OpenAI lineup            |
| **`grok-build-0.1`** | Grok's code-focused model, lowest price in the series | High-frequency code completion, light coding tasks                               |

<Tip>
  **How to pick**: daily → `gpt-5.4` or `gpt-5.6-terra`; heavy work / agents → `gpt-5.6-sol` (or `gpt-5.5`); cost-saving → `gpt-5.6-luna` / `gpt-5.4-mini`; a change of pace outside OpenAI → `grok-4.5`.
</Tip>

<Note>
  **Why Grok gets a special mention**: xAI's official API is itself an OpenAI-compatible dual-endpoint API (Chat Completions + Responses API), which makes Grok a **rare non-OpenAI model with native `/v1/responses` protocol support** — keep `wire_api = "responses"` as-is in Codex and just switch `model` to `grok-4.5`; Codex's agent features (tool calls, reasoning items, etc.) all run over the native protocol. The responses endpoint is verified on APIYI with `grok-4.5`; other Grok models share the same architecture and are expected to behave identically — if one returns 404, use the fallback in [Section 6](#6-advanced-configuration). See the [Grok API Guide](/en/api-capabilities/grok/overview).

  **Compare with Claude / Gemini**: on APIYI these two only run in **OpenAI-compatible chat mode — no responses endpoint** — so in Codex you must fall back to `wire_api = "chat"`. Since Codex's agent scenarios are designed around the responses protocol, chat mode can show incompatibilities in tool calling and a degraded experience. For coding with Claude / Gemini, use their native tools instead ([Claude Code](/en/scenarios/programming/claude-code) / [Gemini CLI](/en/scenarios/programming/gemini-cli)).
</Note>

<Note>
  **Other OpenAI-compatible models also work**: APIYI aggregates many models, and any model that supports OpenAI-compatible calls works in Codex — for example Zhipu's `glm-5.2`. Just change `config.toml`'s `model` field (or `-m` at runtime) to the target model ID.
</Note>

### 4 Ways to Switch Models

**① Specify at launch** (CLI):

```bash theme={null}
codex -m gpt-5.5
codex --model gpt-5.4 "review this project's structure"
```

**② Specify in non-interactive mode** (CLI):

```bash theme={null}
codex -q -m gpt-5.4 "fix the build errors in this project"
```

**③ Switch inside a session**: type `/model` in the interactive panel and follow the prompts.

**④ Configure a default model (permanent)**: edit `~/.codex/config.toml`, change `model`, save, and restart:

```toml theme={null}
model = "gpt-5.5"
```

## 6. Advanced Configuration

<AccordionGroup>
  <Accordion title="Custom system prompts (instructions.md)">
    Edit `~/.codex/instructions.md` to define coding style, output language, and project conventions, e.g.:

    ```markdown theme={null}
    - Write code comments in English
    - Follow the project's ESLint config
    - Provide detailed explanations
    ```
  </Accordion>

  <Accordion title="Project-level AGENTS.md">
    Run `codex /init` in a project to generate `AGENTS.md` recording structure and conventions. To make Codex respond in a specific language by default, add:

    ```markdown theme={null}
    Always respond to the user in English for this project.
    ```
  </Accordion>

  <Accordion title="Protocol fallback: switch wire_api to chat">
    `wire_api = "responses"` is Codex's default and preferred protocol, and most models work directly. If a model returns 404 / unknown endpoint, change that provider's `wire_api` to `"chat"` (uses `/chat/completions`) and retry.
  </Accordion>

  <Accordion title="Multiple configs (profiles)">
    Create `<name>.config.toml` under `~/.codex/` (e.g. `openai.config.toml` for the official setup), then switch at runtime with `codex --profile <name>`. Handy for jumping between APIYI and other providers.
  </Accordion>

  <Accordion title="Common flags">
    ```bash theme={null}
    codex -h          # full help
    codex -m <model>  # specify model
    codex -q          # non-interactive / silent mode
    codex --full-auto # auto-execute (use cautiously)
    ```
  </Accordion>
</AccordionGroup>

## 7. Troubleshooting

<AccordionGroup>
  <Accordion title="1. Missing environment variable: OPENAI_API_KEY (most common in the desktop app / extension)">
    You wrote `auth.json` + `config.toml` correctly and restarted the app, yet it still shows `Missing environment variable: OPENAI_API_KEY` — the cause is `env_key = "OPENAI_API_KEY"` in the provider block (the form an older version of this guide used).

    `env_key` means **read the Key from the environment variables of the process that launched Codex** — it does **not** fall back to `auth.json` (which only serves OpenAI's official login state). And when the desktop app / IDE is launched from the Dock or a launcher, it **does not inherit variables you exported in a terminal** (`export` in `.zshrc` has no effect on GUI apps), so no amount of restarting will make the variable appear.

    **Fix (recommended)**: edit `~/.codex/config.toml`, remove `env_key` from the provider block (and `requires_openai_auth` if present), and put the Key directly in the config:

    ```toml theme={null}
    [model_providers.apiyi]
    name = "apiyi"
    base_url = "https://api.apiyi.com/v1"
    experimental_bearer_token = "sk-your-APIYI-key"
    wire_api = "responses"
    ```

    Then **restart** the app.

    **Alternative** (if you insist on `env_key`): set the variable system-wide — on macOS run `launchctl setenv OPENAI_API_KEY "sk-your-key"` then restart the app (must be re-run after reboot); on Windows run `setx OPENAI_API_KEY "sk-your-key"` then restart the app. For CLI-only usage, an `export` in your shell profile is enough.
  </Accordion>

  <Accordion title="2. Verify auth.json / config.toml path and contents">
    * `auth.json` must be valid JSON, with `OPENAI_API_KEY` set to your real `sk-` Key.
    * `config.toml` must parse as valid TOML (mind quotes and indentation).
    * Paths: Windows `%USERPROFILE%\.codex\`, Mac/Linux `~/.codex/`.
  </Accordion>

  <Accordion title="3. Confirm the Key is valid with available credit">
    Check in the APIYI console that the Key hasn't expired and your account has balance / quota.
  </Accordion>

  <Accordion title="4. Confirm base_url includes /v1">
    The most common connection error / timeout / 404 is a missing `/v1`. Correct: `https://api.apiyi.com/v1`. Then check local proxy and DNS.
  </Accordion>

  <Accordion title="5. Restart after every config change">
    Codex (CLI / extension / desktop app) reads config only at startup. **After editing `auth.json` / `config.toml`, always restart the program.**
  </Accordion>

  <Accordion title="6. Still unstable: switch wire_api to chat">
    If a particular model isn't compatible with the `responses` protocol, change that provider's `wire_api` to `"chat"` and retry.
  </Accordion>
</AccordionGroup>

## 8. FAQ

<AccordionGroup>
  <Accordion title="Why does Codex work with APIYI?">
    Because APIYI is **fully compatible with the OpenAI API protocol** — `https://api.apiyi.com/v1` and `https://api.openai.com/v1` are interchangeable in request/response format. Replacing the Base URL is enough.
  </Accordion>

  <Accordion title="Why does a simple hello consume tens of thousands of input tokens?">
    This is usually **expected**: at startup Codex **reads some files from your current project to initialize** (directory structure, `AGENTS.md`, relevant source), and sends them as context along with your prompt. So even a one-word `hello` can cost thousands of input tokens.

    **How to reduce it?**

    * Test minimal tasks in an **empty directory** or a **very small project**, so the context stays small.
    * Give a specific small task and **name the exact file** (e.g. "only look at `app.py`, add a hello endpoint") to limit what Codex scans.
    * Use a cheaper model (e.g. `gpt-5.4-mini`) for these throwaway checks.
  </Accordion>

  <Accordion title="`command not found: codex`">
    Confirm install:

    ```bash theme={null}
    npm install -g @openai/codex
    codex --version
    ```

    If it still fails, check whether `npm bin -g` is on your `PATH`.
  </Accordion>

  <Accordion title="Invalid API Key (401 / Invalid Key)">
    1. Make sure you're using an **APIYI Key** (starts with `sk-`), not an OpenAI key.
    2. Confirm the Key in `auth.json` is correct with no stray spaces.
    3. **Restart** the program after changing config.
  </Accordion>

  <Accordion title="Connection error / timeout / 404">
    Most common cause: **Base URL is missing `/v1`**. Correct: `https://api.apiyi.com/v1`. Then check your local proxy and DNS.
  </Accordion>

  <Accordion title="Which models are supported?">
    * **OpenAI series**: ✅ fully supported (recommended `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4`).
    * **Grok series**: ✅ native responses protocol support — `grok-4.5` works without touching `wire_api`; see the [Grok API Guide](/en/api-capabilities/grok/overview).
    * **Other OpenAI-compatible models**: supported by APIYI, e.g. `glm-5.2` — just change the `model` field.
    * Note: **Claude / Gemini on APIYI only offer OpenAI-compatible chat mode — no responses endpoint** — so in Codex you must switch `wire_api` to `"chat"`, and agent behaviors like tool calling may hit incompatibilities. For Claude / Gemini-based coding, use their native tools (e.g. Claude Code / Gemini CLI).
  </Accordion>

  <Accordion title="Desktop app / extension not working?">
    The desktop app and IDE extensions **only read `~/.codex/config.toml` + `auth.json`, not environment variables**. Confirm those two files are correct, the auth method is set to **apikey**, and **restart** the program.
  </Accordion>

  <Accordion title="Suitable for production?">
    * **CLI / app**: best for dev-time productivity.
    * **Production**: prefer direct API calls (more control, monitoring, gradual rollout).
  </Accordion>

  <Accordion title="How do I uninstall or disable the APIYI setup?">
    **Uninstall the CLI**:

    ```bash theme={null}
    npm uninstall -g @openai/codex
    ```

    **Disable APIYI config**: delete or restore `~/.codex/config.toml` and `auth.json` (for the desktop app / extension, manage it in their respective UIs).
  </Accordion>
</AccordionGroup>

## 9. Summary

The whole integration is one sentence:

> **Replace OpenAI's endpoint with APIYI**

The core is configuring `~/.codex/` once: put the Key in `auth.json`, and point `base_url` to `https://api.apiyi.com/v1` in `config.toml`. After that, **the desktop app, IDE extensions, and CLI all work**. Everything else — model picking, prompts, `instructions.md`, `AGENTS.md` — is just polish.

## Related Resources

<CardGroup cols={2}>
  <Card title="APIYI Console" icon="settings" href="https://api.apiyi.com">
    Manage API keys and view usage
  </Card>

  <Card title="CC Switch Visual Config" icon="toggle-left" href="/en/scenarios/programming/cc-switch">
    GUI one-click setup for Codex / Claude Code
  </Card>

  <Card title="Claude Code Integration" icon="bot" href="/en/scenarios/programming/claude-code">
    Use Claude models for CLI coding
  </Card>

  <Card title="Model Comparison" icon="chart-bar" href="/en/api-capabilities/model-info">
    All available models and pricing
  </Card>
</CardGroup>
