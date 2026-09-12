> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易支持缓存计费吗？

> 支持。Claude、OpenAI、Gemini、DeepSeek、Qwen、Grok 等主流通道都支持缓存计费，命中字段原样回吐、账单按官方折扣倍率计算

## 简短回答

**支持。** API易 的 **Claude、OpenAI、Gemini、DeepSeek、Qwen、Grok** 等主流通道都支持缓存计费：缓存相关请求参数原样转发上游，响应里的缓存命中字段原样回吐，后台账单按官方折扣倍率单列缓存计费项 —— 你的代码无需为中转层做任何适配。

其中 **Claude 和 OpenAI 的缓存命中稳定好用**（站内有专门指南，见下方链接）；DeepSeek、Qwen、Grok 同为全自动前缀缓存，稳定前缀下正常命中 —— 其中 **Grok 的上游明确不保证 100% 命中**，做成本测算建议按无缓存价打底；Gemini 的隐式缓存虽然支持，但**命中率一般**，建议不要把成本预算押在 Gemini 缓存上。

## 三大通道对比

|      | OpenAI（gpt-5 系列）                                       | Claude                                                 | Gemini                                                 |
| ---- | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
| 触发方式 | **全自动**，零代码                                            | 手动打 `cache_control` 标记                                 | 隐式缓存，自动启用                                              |
| 最小阈值 | 1024 tokens                                            | 按模型 1024–4096 tokens                                   | 4096（3 系）/ 2048（2.5 系）                                 |
| 写入费  | 免费                                                     | 1.25×（5 分钟）/ 2×（1 小时）                                  | 免费                                                     |
| 命中价  | 输入价 0.1×                                               | 输入价 0.1×                                               | 按 Google 官方折扣                                          |
| 实际体验 | ✅ 命中稳定                                                 | ✅ 命中稳定                                                 | ⚠️ 命中率一般                                               |
| 详细指南 | [OpenAI 缓存计费](/api-capabilities/openai/prompt-caching) | [Claude 缓存计费](/api-capabilities/claude-prompt-caching) | [Gemini 缓存计费](/api-capabilities/gemini/prompt-caching) |

## 各通道说明

### OpenAI：全自动，最省心

请求前缀不少于 1024 tokens 且保持稳定，就自动命中，命中部分按输入价 **1 折**计费，没有写入费 —— 第 2 次请求即净省。怎么写出会命中的请求、怎么用 `prompt_cache_key` 提高命中率，见 [OpenAI Prompt Caching 缓存计费指南](/api-capabilities/openai/prompt-caching)。

### Claude：手动打标记，省得最狠

在要缓存的 content block 上打 `cache_control` 标记，命中按 **0.1×** 计费（写入收 1.25× / 2×）。Claude Code、Cline、Cursor 等深度场景必备。注意**只在 Anthropic 原生格式（`/v1/messages`）下生效**，用 OpenAI 兼容格式调 Claude 拿不到缓存。详见 [Claude Prompt Caching 缓存计费指南](/api-capabilities/claude-prompt-caching)。

### Gemini：支持但别指望太高

API易 对 Gemini 原生格式自动启用隐式上下文缓存，命中部分按 Google 官方折扣计费。但实际使用中 **Gemini 的缓存命中率明显不如 Claude / OpenAI**（上游隐式缓存的命中行为不可控），建议：

* 把缓存折扣当作"有则更好"的额外优惠，**做成本测算时按无缓存价格估算**
* 对缓存敏感的高频长前缀业务，优先选 OpenAI 或 Claude 通道

## DeepSeek / Qwen / Grok 等其它通道

这几家的缓存都是**全自动**的（无需打标记），通过 API易 调用同样正常命中，实际体验良好：

| 通道             | 触发方式                       | 命中折扣（官方口径）                                                                               | 命中稳定性         |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------- | ------------- |
| **DeepSeek**   | 全自动，前缀匹配                   | 命中省 **90% 以上**，是几家里折扣最狠的                                                                 | ✅ 稳定          |
| **Qwen（通义千问）** | 隐式缓存自动启用，前缀不少于 1024 tokens | 命中按官方折扣价计费                                                                               | ✅ 稳定          |
| **Grok（xAI）**  | 全自动，前缀匹配                   | 命中省约 **75%**（`grok-4.6`，具体按模型档位），详见 [Grok 缓存计费指南](/api-capabilities/grok/prompt-caching) | ✅ 命中确定，但上游不保证 |

提高命中率的思路和 OpenAI 一致：**稳定内容放前面、动态内容放后面**，时间戳和随机 ID 别放 prompt 开头。具体玩法可直接套用 [OpenAI 缓存计费指南](/api-capabilities/openai/prompt-caching) 里的"稳定前缀"方法论。

## 怎么确认自己命中了

看响应 `usage` 里的缓存字段：

| 通道                                 | 命中字段                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| OpenAI `/v1/chat/completions`      | `usage.prompt_tokens_details.cached_tokens`                  |
| OpenAI `/v1/responses`             | `usage.input_tokens_details.cached_tokens`                   |
| Claude `/v1/messages`              | `usage.cache_read_input_tokens`                              |
| Gemini 原生格式                        | `usageMetadata.cachedContentTokenCount`                      |
| DeepSeek                           | `usage.prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` |
| Qwen / Grok `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens`                  |
| Grok `/v1/responses`               | `usage.input_tokens_details.cached_tokens`                   |

字段大于 0 即命中。后台调用日志中，命中部分会按折扣倍率单列计费项，可直接核对。

## 注意事项

<Warning>
  **缓存跟着调用格式走**：用 OpenAI 兼容格式（`/v1/chat/completions`）调 Claude 模型时，无法获得 Claude 的缓存折扣 —— 深度使用 Claude 请走原生 `/v1/messages` 格式。
</Warning>

* 缓存按**模型隔离**：换模型（哪怕同系列不同档位）不共享缓存
* 上表未列出的其它厂商模型（如 Kimi 等），缓存支持情况以调用日志实际回吐的缓存字段为准
* 各家官方机制细节可参考：`platform.openai.com/docs/guides/prompt-caching`、`docs.claude.com/en/docs/build-with-claude/prompt-caching`、`ai.google.dev/gemini-api/docs/caching`、`api-docs.deepseek.com/quick_start/pricing`、`docs.x.ai/developers/advanced-api-usage/prompt-caching`

## 相关文档

<CardGroup cols={2}>
  <Card title="OpenAI 缓存计费指南" icon="database" href="/api-capabilities/openai/prompt-caching">
    全自动缓存：1024 tokens 起步、命中 1 折、prompt\_cache\_key 提高命中率
  </Card>

  <Card title="Grok 缓存计费指南" icon="database" href="/api-capabilities/grok/prompt-caching">
    命中省 75%、128 token 块粒度、长对话该走哪个端点
  </Card>

  <Card title="Gemini 缓存计费指南" icon="database" href="/api-capabilities/gemini/prompt-caching">
    隐式缓存的触发阈值与预期管理
  </Card>

  <Card title="Claude 缓存计费指南" icon="database" href="/api-capabilities/claude-prompt-caching">
    cache\_control 怎么打、回本点计算、多轮对话进阶玩法
  </Card>

  <Card title="模型倍率说明" icon="calculator" href="/faq/model-multiplier">
    了解控制台分组倍率与美元价格的换算关系
  </Card>

  <Card title="调用日志查询" icon="file-text" href="/faq/call-logs">
    查看每次请求的 tokens 消耗和缓存计费明细
  </Card>
</CardGroup>

## 联系我们

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    缓存功能咨询、技术支持
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
