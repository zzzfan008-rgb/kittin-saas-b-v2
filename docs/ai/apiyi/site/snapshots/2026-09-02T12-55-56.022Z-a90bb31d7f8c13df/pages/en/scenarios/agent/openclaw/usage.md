> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Usage Guide

> OpenClaw usage methods, core skills, common commands, and practical examples

## Usage Methods

### Method 1: Web UI (Recommended)

The simplest method, no external services required:

```bash theme={null}
openclaw dashboard
```

Your browser will open `http://127.0.0.1:18789/` where you can chat directly in the web interface.

<Tip>
  Web UI is the recommended method as it works directly without any proxy requirements.
</Tip>

### Method 2: Telegram Bot

1. Search for `@BotFather` on Telegram
2. Send `/newbot` to create a bot
3. Get the Bot Token
4. Enter the Token during `openclaw onboard`

<Warning>
  If you're in a region where Telegram requires a proxy:

  ```bash theme={null}
  export https_proxy=http://127.0.0.1:proxy-port
  export http_proxy=http://127.0.0.1:proxy-port
  openclaw gateway restart
  ```
</Warning>

### Method 3: Other Platforms

OpenClaw also supports:

* WhatsApp (scan QR to connect)
* Discord (requires creating a Bot)
* Slack, Signal, iMessage, Microsoft Teams, etc.

## Core Skills

OpenClaw comes with rich built-in skills for various tasks:

### File Operations

| Skill      | Function                 |
| ---------- | ------------------------ |
| `fs.read`  | Read files (text/images) |
| `fs.write` | Write/create files       |
| `fs.edit`  | Edit file content        |

### System Operations

| Skill           | Function                                                 |
| --------------- | -------------------------------------------------------- |
| `shell.exec`    | Execute terminal commands                                |
| `shell.process` | Manage running commands                                  |
| `browser.*`     | Browser automation (open pages, screenshot, click, etc.) |

### Smart Features

| Skill           | Function                                |
| --------------- | --------------------------------------- |
| `web_search`    | Web search                              |
| `web_fetch`     | Fetch web content                       |
| `memory_search` | Search memory                           |
| `memory_get`    | Retrieve memory                         |
| `cron.*`        | Scheduled tasks (reminders, automation) |
| `tts`           | Text-to-speech                          |

## Common Commands

### Terminal Commands

| Command                    | Function                      |
| -------------------------- | ----------------------------- |
| `openclaw onboard`         | Run setup wizard              |
| `openclaw gateway start`   | Start Gateway service         |
| `openclaw gateway restart` | Restart Gateway service       |
| `openclaw gateway stop`    | Stop Gateway service          |
| `openclaw status`          | Check running status          |
| `openclaw doctor`          | Diagnose configuration issues |
| `openclaw doctor --fix`    | Auto-fix configuration issues |
| `openclaw dashboard`       | Open Web control panel        |
| `openclaw logs --follow`   | View real-time logs           |
| `openclaw configure`       | Modify configuration          |
| `openclaw update`          | Update to latest version      |

### Chat Commands

Commands available in the chat window:

| Command           | Function               |
| ----------------- | ---------------------- |
| `/help`           | Show help              |
| `/new`            | Start new conversation |
| `/reset`          | Reset conversation     |
| `/stop`           | Stop current task      |
| `/think <level>`  | Set thinking depth     |
| `/model <id>`     | Switch model           |
| `/verbose on/off` | Toggle verbose mode    |
| `/status`         | Check status           |
| `/skills`         | View available skills  |

## Usage Examples

Chat naturally with OpenClaw and it will understand and execute tasks:

### File Operations

```text theme={null}
> Create a test.txt file on my desktop with content "hello world"

> Read the content of ~/Documents/notes.txt

> Move all .png files from desktop to Pictures folder
```

### Terminal Commands

```text theme={null}
> List all files on my desktop

> Check current system memory usage

> Install the Python requests library
```

### Browser Control

```text theme={null}
> Open browser and visit google.com

> Search for the latest MacBook Pro prices

> Take a screenshot of the current webpage
```

### Scheduled Tasks

```text theme={null}
> Remind me to drink water every day at 9am

> Remind me to take a break every hour

> Remind me about the meeting tomorrow at 3pm
```

### Programming Assistance

```text theme={null}
> Write a Python script to batch rename files

> What's wrong with this code: [paste code]

> Create a simple HTML page for me
```

## Recommended Models

OpenClaw supports 400+ mainstream AI models through APIYI. Choose the right model for different tasks.

<Card title="View Model Recommendations" icon="star" href="/en/api-capabilities/model-info">
  Check the latest scenario-based model recommendations, including text creation, programming, quick response, long document processing, and more.
</Card>

### Scenario-Based Recommendations

| Task Type                | Recommended Model | Reason                                   |
| ------------------------ | ----------------- | ---------------------------------------- |
| Complex Task Execution   | Claude Sonnet 4   | Strong comprehension, accurate execution |
| Daily Conversation       | GPT-5.4           | Natural responses, good versatility      |
| Code Writing             | DeepSeek V3.2     | Strong coding ability, cost-effective    |
| Long Document Processing | Gemini 3.1 Pro    | Supports ultra-long context              |
