> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Anthropic 原生配置

> 使用 anthropic-messages API 类型配置 OpenClaw，支持工具调用和 Claude 专属特性

## 为什么选择 Anthropic 原生模式

OpenClaw 支持两种方式调用 Claude 模型。如果你需要使用\*\*工具调用（tool\_use）\*\*等高级功能，强烈建议使用 `anthropic-messages` 原生模式：

| 场景              | OpenAI 兼容模式 | Anthropic 原生模式 |
| --------------- | ----------- | -------------- |
| 纯聊天             | ✅ 正常        | ✅ 正常           |
| 工具调用（tool loop） | ❌ 可能 400 报错 | ✅ 稳定           |
| Prompt Caching  | ❌ 不支持       | ✅ 支持           |
| 多模型切换           | ✅ 400+ 模型   | ⚠️ 仅 Claude 系列 |

<Info>
  走 `openai-completions` 时，纯聊天能通，但一旦进入工具多轮调用（tool\_calls → tool\_result → tool loop），可能被后端拒绝返回 400。改走 `anthropic-messages` 后，`tool_use` + `tool_result` 格式可正常工作。
</Info>

## 推荐配置

编辑 `~/.openclaw/openclaw.json`，添加以下 provider 配置：

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-你的API易密钥",
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

### 关键配置说明

<Warning>
  以下三点**必须**正确设置，否则会遇到 400 报错：

  1. **`baseUrl` 不带 `/v1`**：必须是 `https://api.apiyi.com`，否则会拼成 `.../v1/v1/messages` 导致请求失败
  2. **`headers` 中必须包含 `anthropic-version`**：设为 `2023-06-01`
  3. **`anthropic-beta` 设为空字符串**：禁用 beta 功能头，避免触发不支持的特性
</Warning>

### 关于 `reasoning: false`

<Warning>
  Claude 模型在 API易 上，**请求中如果出现 thinking 相关字段（`thinking` / `output_config`）会直接返回 400 错误**。

  将模型条目设置 `"reasoning": false`，可以让 OpenClaw 不发送 thinking 字段，避免此问题。
</Warning>

## 模型白名单配置

将模型加入 `agents.defaults.models`，否则 OpenClaw 可能提示模型"未登记"，然后静默回退到其他模型：

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

## 与 OpenAI 兼容模式的对比

| 特性             | OpenAI 兼容模式                | Anthropic 原生模式          |
| -------------- | -------------------------- | ----------------------- |
| API 类型         | `openai-completions`       | `anthropic-messages`    |
| baseUrl        | `https://api.apiyi.com/v1` | `https://api.apiyi.com` |
| 支持模型           | 所有 400+ 模型                 | 仅 Claude 系列             |
| 工具调用           | 不稳定（多轮可能 400）              | 稳定                      |
| Prompt Caching | 不支持                        | 支持                      |
| 超长上下文          | 取决于模型                      | 最高 200K tokens          |
| 适用场景           | 多模型切换、纯聊天                  | Claude 深度使用、Agent 工具调用  |

## Claude 模型 ID 列表

| 模型 ID                       | 名称               | 说明          |
| --------------------------- | ---------------- | ----------- |
| `claude-sonnet-4-6`         | Claude Sonnet 4  | 均衡性能，推荐日常使用 |
| `claude-opus-4-6`           | Claude Opus 4    | 最强推理能力      |
| `claude-haiku-4-5-20251001` | Claude Haiku 4.5 | 快速响应，性价比高   |

## 混合配置（推荐）

同时配置 OpenAI 兼容和 Anthropic 原生两个提供商，按需切换：

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
        "apiKey": "sk-你的API易密钥",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      },
      "apiyi-claude": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-你的API易密钥",
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

在聊天中使用 `/model apiyi/gpt-5.4` 或 `/model apiyi-claude/claude-sonnet-4-6` 切换模型。

## 验证配置

配置完成后，验证是否生效：

```bash theme={null}
{/* 查看模型状态 */}
openclaw models status

{/* 发送测试消息，检查返回的 provider/model 是否正确 */}
openclaw agent --message "只回 pong" --json
```

在返回的 JSON 中，检查 `meta.agentMeta.provider` 和 `meta.agentMeta.model` 是否与配置一致。

## 常见问题

<AccordionGroup>
  <Accordion title="报错 400 ValidationException: Operation not allowed">
    这通常是请求中出现了 thinking 相关字段导致的。确保：

    * 模型条目设置了 `"reasoning": false`
    * headers 中 `"anthropic-beta": ""` 已正确配置
  </Accordion>

  <Accordion title="配置改了但没生效">
    已有的聊天 session 可能缓存了旧的模型配置。两种解决方式：

    修改 session 的模型：

    ```bash theme={null}
    openclaw gateway call sessions.patch \
      --params '{"key":"你的session-key","model":"apiyi-claude/claude-sonnet-4-6"}'
    ```

    或重置 session：

    ```bash theme={null}
    openclaw gateway call sessions.reset \
      --params '{"key":"你的session-key","reason":"reset"}'
    ```
  </Accordion>

  <Accordion title="模型静默回退到其他模型">
    检查是否已将模型加入 `agents.defaults.models` 白名单。未登记的模型会被 OpenClaw 自动回退。
  </Accordion>

  <Accordion title="baseUrl 报错路径重复">
    Anthropic 原生模式的 `baseUrl` **不要**带 `/v1`。如果写成 `https://api.apiyi.com/v1`，实际请求会变成 `.../v1/v1/messages`，导致 404 错误。
  </Accordion>
</AccordionGroup>
