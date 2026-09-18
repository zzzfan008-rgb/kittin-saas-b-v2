> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code

> Claude's official command-line programming assistant, configured with APIYI for stable and efficient AI programming experience

<Warning>
  **On cost, up front**: for long-context coding work and agentic deep exploration, **pay-as-you-go API usage burns through credit fast, and it usually works out worse value than an official subscription**.

  A coding agent re-reads your project context, digests tool output, and iterates every turn — a single serious task easily runs to hundreds of thousands of tokens. This has genuinely happened: **\$5 of credit ran out before one deep-research run finished**. That is not a fault; it is the normal burn rate for this kind of work.

  * **High usage, and able to reach the official service directly**: buy the official Claude Pro / Max subscription — a flat monthly fee is better value at that intensity.
  * **Blocked by your network, or you simply want to pay only for what you use**: the API suits you better — direct access with no proxy, no fixed monthly fee, no official account to maintain, and one key for 400+ models.

  Neither option is strictly better. Pick by your actual usage and network situation. We tell you this up front so the bill holds no surprises.
</Warning>

## Overview

Claude Code is Anthropic's official command-line programming assistant, allowing you to use Claude's powerful programming capabilities directly in the terminal. By configuring APIYI service, you can get:

<CardGroup cols={2}>
  <Card title="🚀 Stable Connection" icon="wifi">
    Direct connection without proxy, no network instability
  </Card>

  <Card title="💳 Pay As You Go" icon="wallet">
    No fixed monthly fee — pay only for what you use
  </Card>

  <Card title="⚡ High Concurrency" icon="bolt">
    Unlimited access powered by APIYI
  </Card>

  <Card title="🔧 Simple Setup" icon="wrench">
    Complete setup in minutes
  </Card>
</CardGroup>

<Info>
  **Pay-as-you-go vs. the official Claude Max plan — which should you pick?**

  * **Claude Max (official subscription)**: a flat monthly fee that caps your spend. **Better value for heavy users who do nothing but write code and burn through enormous volume** — provided you can meet the official network requirements and are willing to maintain the account yourself and carry the ban risk.
  * **APIYI's Claude setup**: pay-as-you-go with no ban risk. Quality is backed by two channels — AWS Bedrock's official access and Anthropic's official-key direct connection — and top-up bonuses bring down what you actually pay. Customers who have used it speak well of it and keep topping up. For enterprises, it also solves direct access and tax compliance (invoicing).
  * **The API is more flexible**: beyond coding, the same key reaches 400+ models — far more choice than a single coding plan.
</Info>

## Token Group: ClaudeCode

When using APIYI with Claude Code, **make sure to select the `ClaudeCode` group when creating your token** (in the "Group" option of the token creation dialog in the console). This group aggregates all models compatible with Anthropic's native `/v1/messages` format into one channel, dedicated to Claude Code scenarios.

<Tip>
  **The ClaudeCode group gets 5% off by default** — no action required. The discount stacks with top-up bonus campaigns (10%–20%), bringing the effective cost roughly 20% below official direct pricing.
</Tip>

<Note>
  **Where can this group be used?**

  * **Inside Claude Code**: this group is the best fit for Claude Code. **Some Chinese domestic models can only be called inside Claude Code with a ClaudeCode-group token** — tokens from other groups will fail.
  * **Outside Claude Code**: a ClaudeCode-group token **works just fine** too — it is not restricted to Claude Code. In that case it's purely a discount: 5% off by default (0.95x), stackable with top-up bonus campaigns (10%–20%).
</Note>

### Chinese Domestic Models Available in Claude Code

Besides the full Claude lineup, the `ClaudeCode` group also includes a set of Chinese domestic coding models that are compatible with Anthropic's native `/v1/messages` format. Simply switch the model name in Claude Code to one of the model IDs below — **a token created under the ClaudeCode group is also required**; calls with tokens from other groups will fail.

| Model ID                 | Vendor   | Input / 1M tokens | Output / 1M tokens |
| ------------------------ | -------- | ----------------- | ------------------ |
| `deepseek-v4-flash`      | DeepSeek | \$0.133           | \$0.266            |
| `deepseek-v4-pro`        | DeepSeek | \$0.408           | \$0.817            |
| `glm-4.7`                | Zhipu    | \$0.570           | \$2.052            |
| `glm-5`                  | Zhipu    | \$0.532           | \$2.394            |
| `glm-5.1`                | Zhipu    | \$0.798           | \$3.192            |
| `kimi-k2.5`              | Moonshot | \$0.570           | \$2.992            |
| `kimi-k2.6`              | Moonshot | \$0.570           | \$2.280            |
| `MiniMax-M2.7`           | MiniMax  | \$0.285           | \$1.140            |
| `MiniMax-M2.7-highspeed` | MiniMax  | \$0.570           | \$2.280            |
| `MiniMax-M3`             | MiniMax  | \$0.285           | \$1.140            |
| `qwen3.6-plus`           | Alibaba  | \$0.285           | \$1.710            |
| `qwen3.7-max`            | Alibaba  | \$1.628           | \$4.885            |

<Info>
  All models above are pay-as-you-go; the table shows base prices, and tokens under the ClaudeCode group automatically get an extra 5% off. The model list is continuously updated — check the model marketplace in the console for the latest pricing.
</Info>

<Card title="Learn About Token Groups" icon="layers" href="/en/faq/groups-explained">
  Why does the ClaudeCode group exist? How do groups and discounts work? See the full explanation of the group mechanism.
</Card>

## Quick Start

<Note>
  **Simplified Configuration Tip**: If you don't want to register for a Claude official account, we recommend checking the [Advanced Configuration](#advanced-configuration) section below to use `~/.claude.json` file configuration, which completely bypasses official verification.
</Note>

### 1. Install Claude Code

Run the following command in terminal to install globally:

```bash theme={null}
npm install -g @anthropic-ai/claude-code
```

<Info>
  Requires Node.js 18 or higher. If not installed, please visit [nodejs.org](https://nodejs.org) to download and install.
</Info>

### 2. Configure API Key

#### Get API Key

Please refer to the [API Key Management Tutorial](/faq/token-management) to get your APIYI key.

#### Set Environment Variables

Add APIYI configuration to your system environment variables.

<Tabs>
  <Tab title="macOS/Linux">
    Edit `~/.zshrc` or `~/.bashrc` file:

    ```bash theme={null}
    # APIYI Configuration
    export ANTHROPIC_AUTH_TOKEN="sk-***"
    export ANTHROPIC_BASE_URL="https://api.apiyi.com"
    ```

    <Tip>
      **Mac User Tip**: Press `⌘ + ⇧ + .` in your user directory to show hidden files, then use a text editor to open the `.zshrc` file.
    </Tip>
  </Tab>

  <Tab title="Windows">
    Edit configuration using PowerShell:

    ```powershell theme={null}
    # Edit configuration file
    notepad $PROFILE

    # Add the following content
    $env:ANTHROPIC_AUTH_TOKEN = "sk-***"
    $env:ANTHROPIC_BASE_URL = "https://api.apiyi.com"
    ```
  </Tab>
</Tabs>

### 3. Apply Configuration

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    source ~/.zshrc
    # or
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    Restart PowerShell or run:

    ```powershell theme={null}
    . $PROFILE
    ```
  </Tab>
</Tabs>

### 4. Launch Claude Code

Enter your project directory and launch:

```bash theme={null}
# Enter project directory
cd ~/Desktop/my-project

# Launch Claude Code
claude
```

## Advanced Configuration

### Configuration Files (Recommended)

Two files need to be configured together to bypass Claude official verification:

**Step 1**: Create `~/.claude.json` in your home directory to bypass official verification:

```json theme={null}
{
  "hasCompletedOnboarding": true
}
```

**Step 2**: Configure APIYI service in `~/.claude/settings.json`:

```json theme={null}
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-APIYI-key",
    "ANTHROPIC_BASE_URL": "https://api.apiyi.com"
  }
}
```

<Tip>
  **Important Note**: `hasCompletedOnboarding: true` completely bypasses Claude official account verification, allowing direct use of APIYI service. This means you don't need to:

  * Register for Claude official account (difficult registration, requires overseas phone number)
  * Worry about Claude official account being banned
  * Perform any additional authorization steps
</Tip>

<Warning>
  **Security Reminder**: Configuration files contain sensitive information like API keys, please do not share with others.
</Warning>

### Global Authorization (Not Recommended)

If you don't configure `hasCompletedOnboarding: true`, authorization page will appear on first use:

1. Need to redirect to Claude official website for confirmation
2. Requires Claude official account (difficult registration and easily banned)
3. Return to terminal after successful authorization

<Info>
  **Recommendation**: Strongly recommend using the configuration files method above to avoid various limitations of Claude official accounts.
</Info>

## User Guide

### Basic Commands

After launching, Claude Code will display current configuration information:

```bash theme={null}
claude
# Displays API Key and API Base URL
# Confirm configuration is correct and select Yes to continue
```

### Workflow

1. **Launch Assistant**: Run `claude` in project directory
2. **Describe Requirements**: Enter your programming needs or questions
3. **Interactive Dialogue**: Claude understands context and provides code suggestions
4. **Apply Changes**: After confirmation, Claude can directly modify files

### Supported Features

* ✅ Code generation and optimization
* ✅ Bug fixing and debugging
* ✅ Code refactoring suggestions
* ✅ Documentation writing
* ✅ Test case generation
* ✅ Technical Q\&A

## Model Selection

Claude Code uses the latest Claude models by default. Through APIYI, you can access:

| Model                        | Features              | Recommended Scenarios   |
| ---------------------------- | --------------------- | ----------------------- |
| **Claude 4 Sonnet**          | Strongest programming | Complex code tasks      |
| **Claude Opus 4.1**          | Performance upgrade   | High-demand programming |
| **Claude 4 Sonnet Thinking** | Chain-of-thought mode | Complex reasoning       |

## Troubleshooting

### Common Issues

<AccordionGroup>
  <Accordion title="Unable to Connect to Anthropic Services">
    This is usually a network configuration issue. Please check:

    1. Environment variables are set correctly
    2. API key is valid
    3. Network connection is normal

    Run the following commands to verify configuration:

    ```bash theme={null}
    echo $ANTHROPIC_AUTH_TOKEN
    echo $ANTHROPIC_BASE_URL
    ```
  </Accordion>

  <Accordion title="Prompted for Claude Official Account Authorization">
    This is because `hasCompletedOnboarding` is not configured. Add `{"hasCompletedOnboarding": true}` to `~/.claude.json`, and configure APIYI environment variables in `~/.claude/settings.json`. See [Advanced Configuration](#advanced-configuration) above for details.
  </Accordion>

  <Accordion title="Invalid API Key">
    Make sure you're using APIYI's key, not Claude official website's key. See the [API Key Management Tutorial](/faq/token-management) to get your key.
  </Accordion>

  <Accordion title="How to Update Claude Code">
    Run the following command to update to latest version:

    ```bash theme={null}
    npm update -g @anthropic-ai/claude-code
    ```
  </Accordion>

  <Accordion title="Which Programming Languages are Supported">
    Claude Code supports all mainstream programming languages, including but not limited to:

    * Python, JavaScript/TypeScript, Java, C++, C#
    * Go, Rust, Swift, Kotlin
    * HTML/CSS, SQL, Shell Scripts
    * And more...
  </Accordion>
</AccordionGroup>

## Best Practices

### Effective Prompts

```markdown theme={null}
Good prompts:
"Help me refactor this Python function to make it more efficient and add type annotations"
"This code has a memory leak, please help me find and fix it"
"Write unit tests for this React component"

Avoid being too broad:
"Improve my code"  # Too vague
```

### Project Structure Recommendations

* Keep codebase clean and organized
* Use clear file naming
* Add appropriate comments
* Provide project README

## Performance Optimization

### Improve Response Speed

1. **Use `~/.claude.json` Configuration**: This avoids verification each time, especially faster startup after setting `hasCompletedOnboarding: true`
2. **Maintain Conversation Coherence**: Handle related tasks in same session
3. **Clear Requirements**: Clear descriptions reduce round-trip interactions

### Cost Control

* Claude Code charges based on Token usage
* Enjoy preferential prices through APIYI
* Check [Pricing Page](/pricing) for details

## Related Resources

<CardGroup cols={2}>
  <Card title="API Key Management" icon="book" href="https://docs.apiyi.com/faq/token-management">
    API Key setup tutorial
  </Card>

  <Card title="Claude Code Official Docs" icon="terminal">
    Official docs: `code.claude.com/docs`
  </Card>

  <Card title="Model Introduction" icon="bot" href="/api-capabilities/model-info">
    Learn about Claude series models
  </Card>

  <Card title="Other Programming Tools" icon="code" href="/scenarios/programming/cursor">
    Explore tools like Cursor
  </Card>
</CardGroup>

## Summary

Claude Code combined with APIYI gives developers a stable, flexible AI coding setup: direct access with no proxy, pay-as-you-go billing, and no fixed monthly fee — a particularly good fit when your network is restricted or your usage is uneven. **If you are a heavy, high-frequency user who can reach the official service directly, weigh that against the cost note at the top of this page.**

<Info>
  **Tip**: For more AI tools in programming scenarios, check out [OpenAI Codex CLI](/scenarios/programming/codex-cli) and other options.
</Info>
