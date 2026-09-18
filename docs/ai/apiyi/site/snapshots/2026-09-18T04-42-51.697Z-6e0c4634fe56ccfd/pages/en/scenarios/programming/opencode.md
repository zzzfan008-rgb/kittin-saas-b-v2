> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenCode

> Open-source AI coding agent supporting terminal/IDE/desktop platforms, configure with APIYI for stable and efficient coding experience

## Overview

OpenCode is a fully open-source AI coding agent built with TypeScript and AI SDK, offering terminal TUI, IDE integration, and desktop applications. The project has 94.9k+ stars on GitHub with an active community.

By configuring APIYI service, you can get:

<CardGroup cols={2}>
  <Card title="🖥️ Multi-Platform Support" icon="monitor">
    Terminal TUI, VS Code extension, and desktop apps
  </Card>

  <Card title="🔌 75+ Model Support" icon="plug">
    Supports 75+ LLM providers via Models.dev
  </Card>

  <Card title="🛠️ Built-in LSP" icon="code">
    Language Server Protocol support for intelligent code understanding
  </Card>

  <Card title="🔄 Multi-Session Parallel" icon="layers">
    Parallel session processing and session sharing
  </Card>
</CardGroup>

<Info>
  **Project Info**: OpenCode is an actively maintained open-source project. Website: `opencode.ai`, Repository: `github.com/anomalyco/opencode`.
</Info>

## Prerequisites

### Install OpenCode

<Tabs>
  <Tab title="Quick Install (Recommended)">
    ```bash theme={null}
    curl -fsSL https://opencode.ai/install | bash
    ```
  </Tab>

  <Tab title="npm">
    ```bash theme={null}
    npm i -g opencode-ai@latest
    ```
  </Tab>

  <Tab title="Homebrew (macOS/Linux)">
    ```bash theme={null}
    brew install anomalyco/tap/opencode
    ```
  </Tab>

  <Tab title="Windows">
    Scoop:

    ```bash theme={null}
    scoop install opencode
    ```

    Chocolatey:

    ```bash theme={null}
    choco install opencode
    ```
  </Tab>

  <Tab title="Arch Linux">
    ```bash theme={null}
    paru -S opencode-bin
    ```
  </Tab>

  <Tab title="Desktop App">
    Download the desktop app for your system from `opencode.ai`:

    * macOS (Apple Silicon / Intel)
    * Windows
    * Linux (AppImage / deb)
  </Tab>
</Tabs>

Verify installation:

```bash theme={null}
opencode --version
```

## Quick Configuration

OpenCode uses JSON configuration files with multiple config locations (priority from low to high):

1. Remote config (`.well-known/opencode`)
2. Global config: `~/.config/opencode/opencode.json`
3. Custom config: path specified by `OPENCODE_CONFIG` environment variable
4. Project config: `opencode.json` in project root
5. `.opencode` directory config
6. Inline config: `OPENCODE_CONFIG_CONTENT` environment variable

### Method 1: Custom Provider (Recommended)

Create or edit the config file `~/.config/opencode/opencode.json`:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "gpt-4.1": {
          "name": "GPT-4.1",
          "limit": { "context": 1047576, "output": 32768 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gemini-2.5-pro-preview-05-06": {
          "name": "Gemini 2.5 Pro",
          "limit": { "context": 1048576, "output": 65536 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

Then set the environment variable:

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    # zsh
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.zshrc
    source ~/.zshrc

    # bash
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.bashrc
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell:

    ```powershell theme={null}
    [System.Environment]::SetEnvironmentVariable('APIYI_API_KEY', 'sk-your-apiyi-key', 'User')
    ```

    Or add `APIYI_API_KEY` in System Environment Variables.
  </Tab>
</Tabs>

### Method 2: /connect Command Authentication

OpenCode provides the `/connect` command to quickly connect new providers:

1. After starting OpenCode, type `/connect`
2. Select "Other"
3. Enter provider ID (e.g., `apiyi`)
4. Enter API key

Then add the provider and models definition in the config file to use.

### Method 3: Override Existing Provider

For quick setup, override the built-in OpenAI provider's baseURL:

```json theme={null}
{
  "provider": {
    "openai": {
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      }
    }
  }
}
```

### Method 4: Project-Level Configuration

Create `opencode.json` in your project root for project-specific settings:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

## Agent System

OpenCode has three built-in agents, each with specific purposes:

| Agent       | Description                                                              | Usage                 |
| ----------- | ------------------------------------------------------------------------ | --------------------- |
| **build**   | Default agent with full access, handles code generation and modification | Direct conversation   |
| **plan**    | Read-only agent for code analysis and planning, won't modify files       | `/plan` command       |
| **general** | Complex search sub-agent for multi-step information retrieval            | `@general` invocation |

### Agent Model Configuration

Configure different models for different agents:

```json theme={null}
{
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gpt-4.1-mini": {
          "name": "GPT-4.1 Mini",
          "limit": { "context": 1047576, "output": 32768 }
        }
      }
    }
  },
  "agents": {
    "build": {
      "model": "apiyi/claude-sonnet-4-20250514"
    },
    "plan": {
      "model": "apiyi/deepseek-chat"
    },
    "general": {
      "model": "apiyi/gpt-4.1-mini"
    }
  }
}
```

## Recommended Models

OpenCode supports 400+ AI models through APIYI. Choose the right model for different tasks.

<Card title="View Programming Model Recommendations" icon="code" href="/api-capabilities/model-info">
  Check the latest programming model recommendations, performance comparisons, and usage suggestions. Includes top-tier models, cost-effective options, and reasoning-enhanced models.
</Card>

### Scenario-Based Model Recommendations

| Agent   | Purpose                          | Recommended Model           |
| ------- | -------------------------------- | --------------------------- |
| build   | Code generation and modification | Claude Sonnet 4, GPT-4.1    |
| plan    | Task planning and analysis       | DeepSeek V3, Gemini 2.5 Pro |
| general | Quick search and Q\&A            | GPT-4.1 Mini (low cost)     |

## Core Features

### Terminal Interactive Interface

Start OpenCode to enter the interactive TUI:

```bash theme={null}
# Start in current directory
opencode

# Specify project directory
opencode /path/to/project
```

### File Operations

OpenCode can read, search, and modify project files:

```text theme={null}
> View the contents of src/index.ts

> Search for all files containing "TODO" in the project

> Refactor the calculateSum function in utils.ts to a more efficient implementation
```

### Command Execution

Execute commands in the terminal and view results:

```text theme={null}
> Run npm test and analyze the failed tests

> Execute npm install and check for dependency conflicts
```

### Session Management

* **Multi-session parallel**: Run multiple sessions simultaneously
* **Session sharing**: Export and share sessions
* **Auto-save**: All sessions are automatically persisted
* **Context retention**: Maintain complete conversation context during sessions

## Usage Tips

### 1. Keyboard Shortcuts

| Shortcut | Function                    |
| -------- | --------------------------- |
| `Ctrl+C` | Interrupt current operation |
| `Ctrl+D` | Exit OpenCode               |
| `Tab`    | Auto-complete               |
| `↑/↓`    | Browse command history      |

### 2. Common Commands

| Command    | Function                    |
| ---------- | --------------------------- |
| `/connect` | Connect new Provider        |
| `/model`   | Switch current model        |
| `/plan`    | Use plan agent for analysis |
| `/clear`   | Clear current session       |
| `/help`    | View help information       |

### 3. Invoke Sub-Agent

Use `@general` to invoke the search sub-agent for complex queries:

```text theme={null}
> @general Find all files handling user authentication in the codebase and summarize their functions
```

### 4. Incremental Development

```text theme={null}
{/* Step 1: Generate basic framework */}
> Create a basic REST API structure

{/* Step 2: Add specific features */}
> Add user authentication middleware

{/* Step 3: Refine details */}
> Add request parameter validation and error handling
```

## Troubleshooting

<AccordionGroup>
  <Accordion title="Failed to connect to APIYI">
    1. Check if environment variable is set correctly:

    ```bash theme={null}
    echo $APIYI_API_KEY  # macOS/Linux
    echo %APIYI_API_KEY%  # Windows
    ```

    2. Verify baseURL in configuration file:

    ```json theme={null}
    "baseURL": "https://api.apiyi.com/v1"
    ```

    3. Test API connectivity:

    ```bash theme={null}
    curl -H "Authorization: Bearer $APIYI_API_KEY" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="Model not found error">
    Verify the model ID is correct. Check the APIYI console for supported models.

    Common model IDs:

    * `claude-sonnet-4-20250514`
    * `gpt-4.1`
    * `deepseek-chat`
    * `gemini-2.5-pro-preview-05-06`
  </Accordion>

  <Accordion title="Configuration file not taking effect">
    Configuration file loading priority (from low to high):

    1. Remote config (`.well-known/opencode`)
    2. Global config: `~/.config/opencode/opencode.json`
    3. `OPENCODE_CONFIG` environment variable
    4. Project config: `opencode.json`
    5. `.opencode` directory config
    6. `OPENCODE_CONFIG_CONTENT` environment variable

    Ensure the config file is in the correct location with valid JSON format.
  </Accordion>

  <Accordion title="Slow response">
    1. Try using a lighter model (e.g., GPT-4.1 Mini)
    2. Reduce context length, start a new session
    3. Check network connection stability
  </Accordion>
</AccordionGroup>

## Best Practices

### 1. Model Selection Strategy

| Task Type               | Recommended Model | Reason                                              |
| ----------------------- | ----------------- | --------------------------------------------------- |
| Complex code generation | Claude Sonnet 4   | Strong coding ability, good context understanding   |
| Code review             | GPT-4.1           | Strong analytical ability, good attention to detail |
| Quick Q\&A              | DeepSeek V3       | Fast response, cost-effective                       |
| Long document analysis  | Gemini 2.5 Pro    | Supports ultra-long context                         |

### 2. Effective Prompts

```text theme={null}
❌ Poor prompt: Help me write code

✅ Good prompt: Write an HTTP middleware in TypeScript that
logs requests, including request method, path,
response time, and status code, using pino for output
```

### 3. Security Considerations

* Don't hardcode API keys in code
* Use environment variables to manage sensitive information
* Review AI-generated code, especially security-related parts
* Be careful not to let AI execute dangerous system commands

### 4. Cost Control

* Configure different models for different agents (strong models for build, lightweight for general)
* Use lightweight models for simple tasks
* Regularly check APIYI console to monitor usage

## Alternatives

If OpenCode doesn't meet your needs, consider these tools:

<CardGroup cols={2}>
  <Card title="Claude Code" icon="bot" href="/scenarios/programming/claude-code">
    Anthropic's official terminal programming assistant
  </Card>

  <Card title="Codex CLI" icon="code" href="/scenarios/programming/codex-cli">
    OpenAI's official command-line tool
  </Card>

  <Card title="Gemini CLI" icon="terminal" href="/scenarios/programming/gemini-cli">
    Google's official terminal programming assistant
  </Card>

  <Card title="Roo Code" icon="wand-sparkles" href="/scenarios/programming/roo-code">
    VS Code AI programming extension
  </Card>
</CardGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="APIYI Console" icon="settings" href="https://api.apiyi.com">
    Manage API keys and view usage
  </Card>

  <Card title="Model Recommendations" icon="chart-bar" href="/api-capabilities/model-info">
    View programming scenario model recommendations
  </Card>
</CardGroup>
