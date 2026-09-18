> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Anthropic Native Configuration

> Configure OpenClaw with anthropic-messages API type for stable tool calling and Claude exclusive features

## Why Choose Anthropic Native Mode

OpenClaw supports two ways to call Claude models. If you need **tool calling (tool\_use)** and other advanced features, Anthropic native mode (`anthropic-messages`) is strongly recommended:

| Scenario                 | OpenAI Compatible Mode | Anthropic Native Mode |
| ------------------------ | ---------------------- | --------------------- |
| Basic Chat               | ✅ Works                | ✅ Works               |
| Tool Calling (tool loop) | ❌ May return 400       | ✅ Stable              |
| Prompt Caching           | ❌ Not supported        | ✅ Supported           |
| Multi-model Switching    | ✅ 400+ models          | ⚠️ Claude series only |

<Info>
  With `openai-completions`, basic chat works fine, but multi-turn tool calling (tool\_calls → tool\_result → tool loop) may be rejected with a 400 error. Switching to `anthropic-messages` allows `tool_use` + `tool_result` format to work properly.
</Info>

## Recommended Configuration

Edit `~/.openclaw/openclaw.json` and add the following provider configuration:

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

### Critical Configuration Notes

<Warning>
  The following three points **must** be set correctly, or you will encounter 400 errors:

  1. **`baseUrl` without `/v1`**: Must be `https://api.apiyi.com` — adding `/v1` would result in `.../v1/v1/messages` causing request failure
  2. **`headers` must include `anthropic-version`**: Set to `2023-06-01`
  3. **`anthropic-beta` set to empty string**: Disables beta feature headers to avoid triggering unsupported features
</Warning>

### About `reasoning: false`

<Warning>
  Claude models on APIYI will **return a 400 error if the request contains thinking-related fields (`thinking` / `output_config`)**.

  Setting `"reasoning": false` in the model entry prevents OpenClaw from sending thinking fields, avoiding this issue.
</Warning>

## Model Allowlist Configuration

Add models to `agents.defaults.models`, otherwise OpenClaw may report the model as "unregistered" and silently fall back to another model:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/claude-sonnet-4-6" },
      "models": {
        "apiyi/claude-sonnet-4-6": { "streaming": false },
        "apiyi/claude-opus-4-6": { "streaming": false }
      }
    }
  }
}
```

## Comparison with OpenAI Compatible Mode

| Feature          | OpenAI Compatible Mode            | Anthropic Native Mode                 |
| ---------------- | --------------------------------- | ------------------------------------- |
| API Type         | `openai-completions`              | `anthropic-messages`                  |
| baseUrl          | `https://api.apiyi.com/v1`        | `https://api.apiyi.com`               |
| Supported Models | All 400+ models                   | Claude series only                    |
| Tool Calling     | Unstable (multi-turn may 400)     | Stable                                |
| Prompt Caching   | Not supported                     | Supported                             |
| Extended Context | Depends on model                  | Up to 200K tokens                     |
| Best For         | Multi-model switching, basic chat | Deep Claude usage, Agent tool calling |

## Claude Model ID List

| Model ID                    | Name             | Description                                     |
| --------------------------- | ---------------- | ----------------------------------------------- |
| `claude-sonnet-4-6`         | Claude Sonnet 4  | Balanced performance, recommended for daily use |
| `claude-opus-4-6`           | Claude Opus 4    | Strongest reasoning capability                  |
| `claude-haiku-4-5-20251001` | Claude Haiku 4.5 | Fast response, cost-effective                   |

## Mixed Configuration (Recommended)

Configure both OpenAI compatible and Anthropic native providers, switching as needed:

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi-claude/claude-sonnet-4-6" },
      "models": {
        "apiyi-claude/claude-sonnet-4-6": { "streaming": false },
        "apiyi-claude/claude-opus-4-6": { "streaming": false }
      }
    }
  },
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-your-apiyi-key",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      },
      "apiyi-claude": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

Use `/model apiyi/gpt-5.4` or `/model apiyi-claude/claude-sonnet-4-6` in chat to switch models.

## Verify Configuration

After setup, verify that the configuration is working:

```bash theme={null}
{/* Check model status */}
openclaw models status

{/* Send a test message and check the returned provider/model */}
openclaw agent --message "just reply pong" --json
```

In the returned JSON, check that `meta.agentMeta.provider` and `meta.agentMeta.model` match your configuration.

## Troubleshooting

<AccordionGroup>
  <Accordion title="400 ValidationException: Operation not allowed">
    This is usually caused by thinking-related fields in the request. Ensure:

    * Model entries have `"reasoning": false` set
    * Headers include `"anthropic-beta": ""` correctly configured
  </Accordion>

  <Accordion title="Configuration changed but not taking effect">
    Existing chat sessions may have cached the old model configuration. Two solutions:

    Patch the session model:

    ```bash theme={null}
    openclaw gateway call sessions.patch \
      --params '{"key":"your-session-key","model":"apiyi-claude/claude-sonnet-4-6"}'
    ```

    Or reset the session:

    ```bash theme={null}
    openclaw gateway call sessions.reset \
      --params '{"key":"your-session-key","reason":"reset"}'
    ```
  </Accordion>

  <Accordion title="Model silently falls back to another model">
    Check if the model has been added to the `agents.defaults.models` allowlist. Unregistered models will be automatically fallen back by OpenClaw.
  </Accordion>

  <Accordion title="baseUrl path duplication error">
    The Anthropic native mode `baseUrl` **must not** include `/v1`. Using `https://api.apiyi.com/v1` will result in `.../v1/v1/messages`, causing a 404 error.
  </Accordion>
</AccordionGroup>
