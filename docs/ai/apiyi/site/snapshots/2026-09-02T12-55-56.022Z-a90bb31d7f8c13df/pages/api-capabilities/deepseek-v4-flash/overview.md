> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash 文本生成

> DeepSeek V4 Flash 正式版：1M 上下文、284B 总参 / 13B 激活 MoE、双端点可用。API易 输入 $0.44、输出 $1.32 每 1M tokens，官方峰谷计费本站固定按峰值档，实测 32 万 tokens 上下文 15 秒返回。

DeepSeek V4 Flash 正式版（`deepseek-v4-flash-ga-260731`）对应 DeepSeek 于 2026 年 7 月 31 日
转正式版的开源检查点 `DeepSeek-V4-Flash-0731`。架构与 4 月预览版一致（284B 总参 / 13B 激活 MoE、
1M 上下文），官方明确只重做了后训练阶段，但 agent 类基准大幅提升。API易 已完成
**21 个用例实测 + 双端点专项复测**，Chat Completions 与 Responses 均可直接调用。

<Info>
  **API易已接入 DeepSeek V4 Flash 正式版**：模型名 `deepseek-v4-flash-ga-260731`，
  `default` / `svip` 分组可用。注意该模型**默认思考量偏大**，简单任务请显式传
  `thinking: {"type": "disabled"}`（详见下方「思考控制」）。
</Info>

## 核心优势

<CardGroup cols={2}>
  <Card title="1M 上下文实测扎实" icon="scroll-text">
    输入硬上限 1,048,570 tokens。32.2 万 tokens 大海捞针 14.77 秒返回并准确命中，最大输出 393,216 tokens。
  </Card>

  <Card title="双层缓存降本" icon="database-zap">
    隐式缓存免配置、第 2 轮命中 99.9%；Responses 端显式缓存链式调用可整轮命中上一轮全部上下文。
  </Card>

  <Card title="高并发无限流" icon="gauge">
    20 路并发全部 200，墙钟仅比单发慢 1.3 秒，适合高并发 agent 与批量文本任务。
  </Card>

  <Card title="定价" icon="circle-dollar-sign">
    输入 \$0.44、输出 \$1.32 每 1M tokens，缓存命中低至 \$0.0136。官方自 2026 年 8 月 17 日起改为峰谷两档计费，本站固定按峰值档。
  </Card>
</CardGroup>

## 模型信息

| 参数                             | 值                                                |
| ------------------------------ | ------------------------------------------------ |
| **模型名称**                       | `deepseek-v4-flash-ga-260731`                    |
| **发布时间**                       | 2026 年 7 月 31 日（预览版转正式版）                         |
| **架构**                         | 284B 总参 / 13B 激活，MoE                             |
| **上下文窗口**                      | 1M（硬上限实测 1,048,570 tokens）                       |
| **最大输出**                       | 384K（硬上限实测 393,216 tokens）                       |
| **可用分组**                       | `default`、`svip`                                 |
| **端点**                         | `POST /v1/chat/completions`、`POST /v1/responses` |
| **深度思考**                       | 默认开启且思考量偏大；`thinking.type` 可关                    |
| **流式输出**                       | ✅ 两端点均支持                                         |
| **函数调用 / 工具使用**                | ✅ 两端点均支持                                         |
| **图片输入**                       | ❌ 纯文本模型                                          |
| **Anthropic 端点 / Claude Code** | ❌ 未开通，需要请用 `deepseek-v4-flash`                   |

## 实测能力矩阵

以下为 API易 2026 年 8 月 5 日的实测结果（官方能力声明 vs 实际表现）：

| 能力                     | 官方声明         | Chat Completions                | Responses                     |
| ---------------------- | ------------ | ------------------------------- | ----------------------------- |
| 基础对话（非流式 / 流式）         | ✅            | ✅ / ✅（TTFB 1.43s）               | ✅ / ✅（TTFB 2.31s）             |
| Function Call（两轮闭环）    | ✅            | ✅                               | ✅                             |
| 深度思考开关 `thinking.type` | ✅            | ✅ disabled / enabled / auto 均生效 | ✅ 输出 reasoning item           |
| 思考分档                   | ✅            | ⚠️ 仅 `minimal` 确定生效             | ⚠️ 同左                         |
| 隐式缓存                   | ✅            | ✅ 第 2 轮命中 99.9%                 | ✅ 命中 99.9%                    |
| 显式缓存                   | ✅（Responses） | —                               | ✅ 需 `previous_response_id` 链式 |
| 结构化输出                  | ❌            | ❌ 收参但不约束                        | ❌ 收参但不约束                      |
| 联网搜索                   | ✅（Responses） | —                               | ⚠️ 工具接通但后端 6/6 报错             |
| MCP                    | ✅（Responses） | —                               | ❌ `AccessDenied` 账号级权限        |
| 图片输入                   | —            | ❌                               | ❌ 明确报错                        |

<Warning>
  **三项与官方能力表不符，接入前请注意**：结构化输出双端点均静默失效（返回 200 但完全无视 schema，
  需要强约束请用 Function Call）；联网搜索工具已接通但搜索后端持续报错、不返回 `results`；
  MCP 返回 `AccessDenied`（账号级内置工具权限，非模型限制）。
</Warning>

## 思考控制

该模型**默认思考量偏大**——实测「9.11 和 9.9 哪个大」这类一句话问题也会花掉 263 个思考 token
（同族 `deepseek-v4-flash` 只花 44 个）。简单任务务必显式关闭：

```python theme={null}
extra_body={"thinking": {"type": "disabled"}}   # 可靠关闭
# 或
extra_body={"reasoning_effort": "minimal"}      # 实测 10/10 次思考 token 为 0
```

<Warning>
  **`reasoning_effort` 不是单调档位**。两道题 × 五档 × 5 次采样结果：

  | 档位        | river 题中位数 | prob 题中位数 |
  | --------- | ---------- | --------- |
  | `minimal` | **0**      | **0**     |
  | `low`     | 956        | 367       |
  | `medium`  | 506        | 193       |
  | `high`    | **97**     | **153**   |
  | `max`     | 577        | 173       |

  `high` 在两道题上的思考量都比 `low` 少，档内方差（`low` 从 150 到 1993）远大于档间差异。
  **只有 `minimal` 可靠**，不要把 low → max 当作成本旋钮。
</Warning>

## 缓存用法

### 隐式缓存（两端点自动生效）

同一段长前缀第 2 次请求即命中，实测 15,634 tokens 前缀命中 15,616（99.9%），
命中部分按 \$0.028 / 百万 tokens 计费。

<Tip>
  吃满隐式缓存的前提是**前缀逐字节一致**。把变动内容（时间戳、随机 ID、用户名）
  放到 prompt 末尾，不要混进前缀里。
</Tip>

### 显式缓存（Responses 端，需链式调用）

**常见误用**：把同一段长前缀重复发两次并带上 `caching`，`cached_tokens` 会一直是 0。
正确姿势是首轮写入、后续轮用 `previous_response_id` 链下去：

| 轮次    | 调用方式                     | input\_tokens | cached\_tokens |
| ----- | ------------------------ | ------------- | -------------- |
| 1（写入） | `caching: enabled`       | 15,629        | 0              |
| 2     | + `previous_response_id` | 15,664        | **15,629**     |
| 3     | + `previous_response_id` | 15,701        | **15,664**     |
| 4     | + `previous_response_id` | 15,738        | **15,701**     |

## 快速开始

<CodeGroup>
  ```python Python theme={null}
  import os
  from openai import OpenAI

  client = OpenAI(
      api_key=os.environ["APIYI_API_KEY"],
      base_url="https://api.apiyi.com/v1",
  )

  resp = client.chat.completions.create(
      model="deepseek-v4-flash-ga-260731",
      messages=[{"role": "user", "content": "用一句话介绍 MoE 架构"}],
      extra_body={"thinking": {"type": "disabled"}},
  )
  print(resp.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "deepseek-v4-flash-ga-260731",
      "messages": [{"role": "user", "content": "用一句话介绍 MoE 架构"}],
      "thinking": {"type": "disabled"}
    }'
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.APIYI_API_KEY,
    baseURL: "https://api.apiyi.com/v1",
  });

  const resp = await client.chat.completions.create({
    model: "deepseek-v4-flash-ga-260731",
    messages: [{ role: "user", content: "用一句话介绍 MoE 架构" }],
    thinking: { type: "disabled" },
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

### 需要结构化输出时用 Function Call

`response_format` 在这个模型上不生效且不报错，是最容易踩的坑。工具参数才是真正被约束的：

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "submit_result",
        "description": "提交抽取结果",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temp_c": {"type": "number"},
            },
            "required": ["city", "temp_c"],
        },
    },
}]

resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "北京今天 25 度"}],
    tools=tools,
)

import json
print(json.loads(resp.choices[0].message.tool_calls[0].function.arguments))
```

## 定价

| 项目   | 单价                   |
| ---- | -------------------- |
| 输入   | \$0.44 / 百万 tokens   |
| 输出   | \$1.32 / 百万 tokens   |
| 缓存命中 | \$0.0136 / 百万 tokens |

官方自 2026 年 8 月 17 日 00:00 (UTC+8) 起改为峰/谷两档计费，谷时为峰时半价；
本站**固定按峰值档**，不随时段浮动，详见 [DeepSeek 调价说明](/news/deepseek-price-increase-2026-08)。
可叠加 [充值活动](/faq/recharge-promotions) 进一步降低成本。

<Info>
  **关于「不到旗舰十分之一」**：厂商宣传语对标的是 V4-Pro 预览期的 \$1.74 / \$3.48。
  按当前 V4-Pro 定价（\$1.32 / \$3.96）折算，本模型是**约 1/3**，不是 1/10。
</Info>

## 相关页面

<CardGroup cols={2}>
  <Card title="Chat Completions" icon="message-square" href="/api-capabilities/deepseek-v4-flash/chat-completions">
    OpenAI 兼容对话补全端点，在线调试
  </Card>

  <Card title="Responses" icon="git-fork" href="/api-capabilities/deepseek-v4-flash/responses">
    Responses 端点，支持显式缓存链式调用
  </Card>

  <Card title="上线说明与完整实测" icon="newspaper" href="/news/deepseek-v4-flash-ga-launch">
    基准数据、三方速度对照与踩坑记录
  </Card>

  <Card title="模型价格总表" icon="table" href="/models">
    全部模型的单价、端点与分组
  </Card>
</CardGroup>
