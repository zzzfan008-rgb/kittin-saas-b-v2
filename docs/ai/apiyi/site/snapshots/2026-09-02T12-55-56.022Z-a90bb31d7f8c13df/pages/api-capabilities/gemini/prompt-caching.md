> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 隐式缓存计费指南

> Gemini 隐式缓存自动启用，命中按官方折扣计费。但命中率不如 Claude/OpenAI，做成本预算请按无缓存价格估算。

API易 的 Gemini 通道自动启用**隐式上下文缓存**（implicit caching）：请求前缀命中时按官方折扣计费，`cached_content_token_count` 字段原样回吐，零代码改动。

先说结论：**Gemini 缓存"有，但别指望"** —— 隐式缓存的命中行为由上游控制，实际命中率明显不如 [OpenAI](/api-capabilities/openai/prompt-caching) 和 [Claude](/api-capabilities/claude-prompt-caching)。把它当作"有则更好"的额外优惠，**做成本测算时一律按无缓存价格估算**。

本页基于 Google 官方文档整理（`ai.google.dev/gemini-api/docs/caching`，2026年6月数据）。

## 机制一句话

请求开头部分（前缀）与近期请求相同且达到最小长度时，上游自动复用缓存：命中部分按官方折扣计费（官方口径**最高可省 90%**），无需打任何标记。

## 触发条件

| 条件     | 要求                                                         |
| ------ | ---------------------------------------------------------- |
| 最小前缀长度 | **Gemini 3 / 3.1 / 3.5 系列：4096 tokens**；2.5 系列：2048 tokens |
| 前缀稳定   | 从第一个字符起逐字节相同，动态内容（时间戳、随机 ID）会切断匹配                          |
| 时间窗口   | 缓存会在闲置一段时间后过期，短时间内的连续请求更容易命中                               |

注意 Gemini 的起缓阈值（4096）比 OpenAI（1024）高不少 —— **短系统提示词在 Gemini 上基本不会命中**，这是"Gemini 缓存体感差"的原因之一。

## 怎么判断命中

看 `usage_metadata.cached_content_token_count`：

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[LONG_STABLE_PREFIX, question]
)

usage = response.usage_metadata
print(f"输入: {usage.prompt_token_count}")
print(f"缓存命中: {usage.cached_content_token_count}")  # > 0 即命中
```

命中部分在后台账单中按折扣倍率单列计费项；REST 响应里的对应字段为 `usageMetadata.cachedContentTokenCount`。

## 尽量提高命中率

方法论和 OpenAI 一致（详细解释见 [OpenAI 缓存计费指南](/api-capabilities/openai/prompt-caching)）：

* **稳定内容放前面**：长系统指令、文档、few-shot 示例在前；用户输入、时间戳在后
* **前缀做长**：不足 4096 tokens（Gemini 3 系）的前缀永远不会命中
* **短时间内集中复用**：批量任务连续发，不要拉开间隔
* 多轮对话天然是追加式前缀，相对容易命中

即便全部做对，**也不保证命中** —— 隐式缓存是 best-effort 的，这点和 OpenAI/Claude 的确定性行为不同。

## 显式缓存（cachedContents）

Google 官方还有显式缓存 API（`cachedContents`，创建一个有 TTL 的缓存对象再引用）。该接口是**有状态的服务端资源**，API易 通道**暂不支持**，请使用隐式缓存。

## 与其它通道对比

|       | Gemini                       | OpenAI          | Claude                    |
| ----- | ---------------------------- | --------------- | ------------------------- |
| 触发    | 隐式自动                         | 全自动             | 手动标记                      |
| 最小阈值  | **4096**（3 系）/ 2048（2.5 系）   | 1024            | 1024–4096                 |
| 命中折扣  | 官方口径最高省 90%                  | 命中 0.1×         | 命中 0.1×                   |
| 命中稳定性 | ⚠️ 不保证，体感一般                  | ✅ 稳定            | ✅ 稳定                      |
| 命中字段  | `cached_content_token_count` | `cached_tokens` | `cache_read_input_tokens` |

**缓存敏感的高频长前缀业务（Agent、RAG、批量文档），建议优先选 OpenAI 或 Claude 通道。** 全平台缓存支持总览见 [缓存计费 FAQ](/faq/cache-billing)。

## 相关链接

* 同组页面：[原生调用](/api-capabilities/gemini/native) · [多模态与代码执行](/api-capabilities/gemini/multimodal) · [FC函数调用](/api-capabilities/gemini/function-calling)
* 其它通道：[OpenAI 缓存计费](/api-capabilities/openai/prompt-caching) · [Claude 缓存计费](/api-capabilities/claude-prompt-caching)
* Google 官方文档：`ai.google.dev/gemini-api/docs/caching`
