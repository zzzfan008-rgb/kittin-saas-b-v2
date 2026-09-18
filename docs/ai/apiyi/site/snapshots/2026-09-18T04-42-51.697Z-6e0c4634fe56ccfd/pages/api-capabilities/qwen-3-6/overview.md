> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 系列文本模型（历史版本）

> 阿里通义千问 Qwen3.6 系列：Max-Preview 编程旗舰 + Flash 极速多模态 + Plus 均衡主力 + 27B / 35B-A3B 开源版（API易官转托管，免租卡）。全系阿里云官转通道，OpenAI Chat 兼容直接调用，挂牌价持平官网，叠加充值加赠约 8.5 折。

<Warning>
  **本页为历史版本存档。** 通义千问当前旗舰是 [Qwen3.8-Max](/api-capabilities/qwen-3-8/overview)（2026 年 8 月发布）——2.4T 参数、1M 上下文、原生图片与视频输入，挂牌价比官网低 17.5％。本页 Qwen3.6 五款模型仍可正常调用，价格与接入方式不变，新项目建议直接用 Qwen3.8-Max。
</Warning>

Qwen3.6 是阿里通义千问团队在 2026 年第二季度推出的新一代大模型家族，整体路线分为 **Max**（旗舰）、**Plus**（均衡）、**Flash**（极速）三个闭源生产档位，外加 **27B**、**35B-A3B** 两款开源权重版本。API易 通过 **阿里云官转 / 自建官转** 通道接入全部 5 款模型，OpenAI Chat Completions 兼容格式直接调用——闭源版鉴权与限流策略与阿里云官网一致；**开源版由 API易 官转托管，免去客户租 GPU、买算力的负担**。

<Note>
  **🚀 核心亮点**：Max-Preview 在 SWE-bench Pro / Terminal-Bench 2.0 等 **6 项编程基准登顶**，Flash 是 35B-A3B MoE、原生 256K 可扩 1M 多模态上下文，Plus 是 72B/18B 激活的均衡主力（1M 上下文）。开源 **`qwen3.6-27b`**（27B 稠密）与 **`qwen3.6-35b-a3b`**（35B MoE / 3B 激活）由 API易 官转托管，按量付费、不用自己租卡。**适合编程 Agent、长上下文 RAG、多模态批量分发，以及需要可控权重 / 合规审计** 的生产场景。
</Note>

### 闭源生产版（阿里云官转）

<CardGroup cols={3}>
  <Card title="qwen3.6-max-preview" icon="trophy">
    **编程旗舰**

    国产编程登顶：6 项 Coding 基准 #1，AIME 2025 93%，GPQA 86%，LiveCodeBench 79%。
  </Card>

  <Card title="qwen3.6-flash" icon="bolt">
    **极速多模态**

    35B-A3B MoE，文本 / 图像 / 视频原生输入，256K 基础可扩 1M 上下文。
  </Card>

  <Card title="qwen3.6-plus" icon="scale">
    **均衡主力**

    72B 总参 / 18B 激活，1M 上下文，Terminal-Bench 61.6 超越 Claude Opus 4.5。
  </Card>
</CardGroup>

### 开源权重版（API易官转托管 · 免租卡）

<CardGroup cols={2}>
  <Card title="qwen3.6-27b" icon="box">
    **27B 稠密 · 编程小钢炮**

    Qwen 团队开源权重（Hugging Face `Qwen/Qwen3.6-27B`），27B 编程能力对标 397B 量级模型。API易 官转托管，无需本地 GPU。
  </Card>

  <Card title="qwen3.6-35b-a3b" icon="boxes">
    **35B-A3B 开源 MoE**

    Qwen 团队开源权重（Hugging Face `Qwen/Qwen3.6-35B-A3B`），与闭源 Flash 同源不同档位，3B 激活极低算力成本。
  </Card>
</CardGroup>

## 为什么选 API易 的 Qwen3.6 阿里云官转？

对标阿里云百炼官方通道，针对企业生产场景在 **稳定性**、**成本**、**接入体验** 三方面做了深度优化：

<CardGroup cols={2}>
  <Card title="阿里云官转直连" icon="server">
    通过阿里云百炼官方通道接入，鉴权与限流策略与官网一致，国内机房与家宽网络延迟稳定，企业级 SLA。
  </Card>

  <Card title="不限并发 · 企业可放量" icon="infinity">
    无 RPM / TPM 上限封顶（受底层供给限制），企业客户可按需放量；支持工单与专属群协助高并发调度。
  </Card>

  <Card title="同价 + 充值加赠 ≈ 8.5 折" icon="percent">
    挂牌单价与阿里云官网一致，叠加 [充值加赠活动](/faq/recharge-promotions)，长期使用成本约 **官网 8.5 折**。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需海外服务器或代理**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，免去出海改造。
  </Card>

  <Card title="OpenAI 兼容生态齐全" icon="layers">
    OpenAI Chat Completions 兼容格式，配合 GPT / Claude / DeepSeek / GLM 等 [全模型生态](/api-capabilities/model-info) 可无缝切换。
  </Card>

  <Card title="专业服务 · 企业陪跑" icon="handshake">
    团队深耕大模型选型与 Agent 工作流，可为企业客户提供从 PoC、灰度到生产上线的完整技术支持。
  </Card>
</CardGroup>

## 五款模型怎么选

<CardGroup cols={2}>
  <Card title="Max-Preview · 编程与复杂推理" icon="trophy">
    **场景**：Coding Agent 主力、SWE-Verified 类真实软工任务、Cursor / Claude Code 工作流主驱动模型。

    **基准**：SWE-bench Pro 58.4（反超 GLM-5.1 56.6）、AIME 2025 93%、GPQA 86%、LiveCodeBench 79%、Terminal-Bench 2.0 #1。

    **注意**：标记为 Preview，权重仍在迭代，关键链路建议先小流量灰度。
  </Card>

  <Card title="Flash · 高频多模态长上下文" icon="bolt">
    **场景**：图像 / 视频理解、长文档总结、批量翻译、RAG 后整篇综合归纳。

    **结构**：35B 总参 / 3B 激活的 MoE（35B-A3B），原生 256K 可扩展至 1M tokens。

    **多模态**：原生支持文本 / 图像 / 视频输入，单价仅 Max 的约 1/8。
  </Card>

  <Card title="Plus · 主力均衡" icon="scale">
    **场景**：日常对话、客服、内容生成、企业知识库问答、中等复杂度推理。

    **结构**：72B 总参 / 18B 激活的 MoE，推理速度约 Claude Opus 4.6 的 3 倍。

    **基准**：Terminal-Bench 2.0 达 61.6 超越 Claude Opus 4.5（59.3），SWE-bench Verified 78.8。
  </Card>

  <Card title="qwen3.6-27b · 开源编程小钢炮" icon="box">
    **场景**：成本敏感的编程辅助、私有化部署评估前的 API 验证、对开源协议 / 可审计权重有合规要求的客户。

    **特点**：27B 稠密结构，开源权重，编程能力对标 397B 级别。API易 官转托管，按量计费，无需本地 GPU。
  </Card>

  <Card title="qwen3.6-35b-a3b · 开源极速 MoE" icon="boxes">
    **场景**：高频低成本场景、希望未来切换为本地推理的过渡期、合规要求权重可下载的项目。

    **特点**：与闭源 Flash 同源（35B 总参 / 3B 激活），开源版本由 API易 托管，省去租卡 / 部署 / 运维。
  </Card>

  <Card title="混合路由建议" icon="route">
    **推荐策略**：Flash 默认 + Plus 升级 + Max-Preview 兜顶；成本敏感场景再下沉到开源 27b / 35b-a3b。

    常规对话与多模态批量交给 Flash；需要更强推理时升级到 Plus；编程 Agent / 复杂推理 / 多步规划升级到 Max-Preview；对成本极敏感或需可审计权重的场景下沉到开源版。
  </Card>
</CardGroup>

## 模型定价

全系采用 **按量付费 - Chat** 计费模式：闭源生产版（Max-Preview / Flash / Plus）按 **单次请求输入 token 数** 决定整请求单价档位（阶梯计费）；开源版（27b / 35b-a3b）为**单一档位平价计费**，不分档。挂牌价持平阿里云官网，叠加 API易 充值加赠后实际单价约 **官网 8.5 折**。

### qwen3.6-max-preview

| 单次输入 tokens     | 提示价格（输入）             | 补全价格（输出）              |
| --------------- | -------------------- | --------------------- |
| **0 – 128K**    | \$1.2800 / 1M tokens | \$7.6800 / 1M tokens  |
| **128K – 256K** | \$2.1200 / 1M tokens | \$12.7200 / 1M tokens |

### qwen3.6-flash

| 单次输入 tokens      | 提示价格（输入）             | 补全价格（输出）             |
| ---------------- | -------------------- | -------------------- |
| **0 – 256K**     | \$0.1700 / 1M tokens | \$1.0200 / 1M tokens |
| **256K – 1000K** | \$0.6800 / 1M tokens | \$4.0800 / 1M tokens |

### qwen3.6-plus

| 单次输入 tokens      | 提示价格（输入）             | 补全价格（输出）             |
| ---------------- | -------------------- | -------------------- |
| **0 – 256K**     | \$0.3000 / 1M tokens | \$1.8000 / 1M tokens |
| **256K – 1000K** | \$1.2000 / 1M tokens | \$7.2000 / 1M tokens |

### qwen3.6-27b（开源版 · API易官转托管）

| 计费方式        | 提示价格（输入）             | 补全价格（输出）             |
| ----------- | -------------------- | -------------------- |
| **平价（不分档）** | \$0.4200 / 1M tokens | \$2.5200 / 1M tokens |

### qwen3.6-35b-a3b（开源版 · API易官转托管）

| 计费方式        | 提示价格（输入）             | 补全价格（输出）             |
| ----------- | -------------------- | -------------------- |
| **平价（不分档）** | \$0.2600 / 1M tokens | \$1.5600 / 1M tokens |

<Info>
  **计费说明**：

  * **闭源生产版（阶梯计费）**：单价档位由**单次请求的总输入 tokens** 决定，整次请求的所有 tokens（输入 + 输出）按对应档位的单价计费。**跨档不分摊**——例如 Flash 单次输入 300K tokens 落入 `256K – 1000K` 档，整请求按 \$0.68 / \$4.08 计价；不会出现"前 256K 按低价、后 44K 按高价"的拆分。
  * **开源版（平价计费）**：`qwen3.6-27b` 与 `qwen3.6-35b-a3b` 由 API易 官转托管，单价不分档；客户无需自行租 GPU 或部署本地推理，按实际消耗 token 数直接结算。
  * 挂牌价持平阿里云百炼官网，叠加 [充值加赠](/faq/recharge-promotions) 实际单价约 **8.5 折**。
  * 缓存命中价当前未单独披露，按基础档计价。
</Info>

## 技术规格

### 闭源生产版

| 维度                  | qwen3.6-max-preview   | qwen3.6-flash   | qwen3.6-plus     |
| ------------------- | --------------------- | --------------- | ---------------- |
| **模型 ID**           | `qwen3.6-max-preview` | `qwen3.6-flash` | `qwen3.6-plus`   |
| **架构**              | 稠密大模型                 | MoE 35B-A3B     | MoE 72B / 18B 激活 |
| **上下文**             | 262K tokens           | 256K（可扩 1M）     | 1M tokens        |
| **输入模态**            | 文本                    | 文本 / 图像 / 视频    | 文本               |
| **输出格式**            | 文本                    | 文本              | 文本               |
| **流式输出**            | ✅ 支持                  | ✅ 支持            | ✅ 支持             |
| **函数调用 / Tool Use** | ✅ 支持                  | ✅ 支持            | ✅ 支持             |
| **思维链**             | ✅ 推理任务自动启用            | —               | ✅ 始终开启           |
| **计费模式**            | 按量付费 - Chat（阶梯）       | 按量付费 - Chat（阶梯） | 按量付费 - Chat（阶梯）  |
| **通道**              | 阿里云官转                 | 阿里云官转           | 阿里云官转            |

### 开源权重版（API易官转托管）

| 维度                  | qwen3.6-27b                                | qwen3.6-35b-a3b                                |
| ------------------- | ------------------------------------------ | ---------------------------------------------- |
| **模型 ID**           | `qwen3.6-27b`                              | `qwen3.6-35b-a3b`                              |
| **架构**              | 27B 稠密                                     | MoE 35B 总参 / 3B 激活                             |
| **开源协议**            | Qwen 团队开源（Hugging Face `Qwen/Qwen3.6-27B`） | Qwen 团队开源（Hugging Face `Qwen/Qwen3.6-35B-A3B`） |
| **上下文**             | 与官方权重一致（详见模型卡片）                            | 与官方权重一致（详见模型卡片）                                |
| **输入模态**            | 文本                                         | 文本                                             |
| **流式输出**            | ✅ 支持                                       | ✅ 支持                                           |
| **函数调用 / Tool Use** | ✅ 支持                                       | ✅ 支持                                           |
| **计费模式**            | 按量付费 - Chat（平价不分档）                         | 按量付费 - Chat（平价不分档）                             |
| **通道**              | API易 官转托管                                  | API易 官转托管                                      |

<Tip>
  **开源版的价值**：开源版本权重在 Hugging Face 公开可下载，但跑起来需要 GPU、显存与运维。**API易 把开源权重托管到官转通道**，客户用 API 直接调用即可——既保留"权重可审计、协议可控"的合规优势，又免去租卡、部署、运维的成本。
</Tip>

## 端点一览

| 端点                     | 方法     | Content-Type       | 用途                                         |
| ---------------------- | ------ | ------------------ | ------------------------------------------ |
| `/v1/chat/completions` | `POST` | `application/json` | 对话 / 推理 / 工具调用（**5 款模型共用**，仅 `model` 字段区分） |

<Tip>
  **域名选择**：`api.apiyi.com` 为主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平台提供的其他网关域名，响应行为一致。`base_url` 设为 `https://api.apiyi.com/v1` 即可使用 OpenAI / OpenAI 兼容 SDK 直接调用。
</Tip>

## 调用示例

### Python（OpenAI SDK 兼容）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Max-Preview：编程 Agent 主驱动
resp = client.chat.completions.create(
    model="qwen3.6-max-preview",
    messages=[
        {"role": "system", "content": "你是一个资深 Python 工程师，按规范返回 unified diff。"},
        {"role": "user", "content": "为下面这段代码补充类型注解并修复潜在 bug ..."}
    ]
)
print(resp.choices[0].message.content)

# Flash：图像 + 文本多模态输入
resp = client.chat.completions.create(
    model="qwen3.6-flash",
    messages=[
        {"role": "user", "content": [
            {"type": "text", "text": "请用中文描述这张图片的关键信息"},
            {"type": "image_url", "image_url": {"url": "https://your-image-url.png"}}
        ]}
    ]
)
print(resp.choices[0].message.content)

# Plus：日常对话与中等复杂推理
resp = client.chat.completions.create(
    model="qwen3.6-plus",
    messages=[{"role": "user", "content": "用一句话介绍你自己"}]
)
print(resp.choices[0].message.content)
```

### Node.js

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

const resp = await client.chat.completions.create({
  model: 'qwen3.6-plus',
  messages: [{ role: 'user', content: '用一句话介绍你自己' }],
});

console.log(resp.choices[0].message.content);
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.6-max-preview",
    "messages": [
      {"role": "user", "content": "解释一下什么是 MoE 架构"}
    ]
  }'
```

## 最佳实践

<Steps>
  <Step title="按任务选模型档">
    Flash 默认处理常规对话 / 分类 / 多模态批量；Plus 处理中等复杂推理与企业知识库问答；只在编程 Agent / 复杂规划 / 数学竞赛级推理时升级到 Max-Preview。能省一档成本就降一档。
  </Step>

  <Step title="阶梯档位测算">
    上线前先估算 P95 输入 token 数：Max-Preview 跨过 128K、Flash / Plus 跨过 256K 后单价显著上升。建议把超长上下文先做摘要 / 分段，控制 P95 在低档区间内。
  </Step>

  <Step title="多模态分批">
    Flash 支持 1M 上下文与视频输入，但单次过长会触发高档单价。建议把超长视频先切片再喂入，按 256K 分批控制单次成本。
  </Step>

  <Step title="Preview 灰度">
    `qwen3.6-max-preview` 标记为 Preview，权重仍在迭代。关键链路建议先小流量灰度 + AB 比对，待版本稳定后再切主流量。
  </Step>

  <Step title="工具调用与流式">
    三款模型均支持 OpenAI 风格的 `tools` 字段与 `stream: true`，可直接复用现有 OpenAI Agent 框架（OpenClaw / LangChain / LlamaIndex 等）的工具调用逻辑。
  </Step>

  <Step title="充值加赠叠加">
    挂牌价已与官网持平，叠加 [充值加赠活动](/faq/recharge-promotions) 后实际单价约 **8.5 折**。大额充值（\$1000+）档位赠送比例更高，长期使用建议一次性充值到位。
  </Step>
</Steps>

## 错误码与重试

| 状态码   | 含义           | 处理建议                                        |
| ----- | ------------ | ------------------------------------------- |
| `400` | 参数错误 / 模型名错误 | 检查 `model` 字段拼写、`messages` 结构、超长输入是否超出最大上下文 |
| `401` | 令牌无效         | 检查 Bearer Token 是否正确                        |
| `403` | 内容审核拦截       | 调整 prompt 或参考输入，避开违规内容                      |
| `429` | 限流 / 余额不足    | 指数退避重试，并检查账户余额                              |
| `5xx` | 网关 / 后端错误    | 重试 1–2 次，仍失败请提交工单                           |
| 超时    | 长尾响应         | 客户端超时建议 ≥ **120 秒**（思维链或长上下文请求耗时较长）         |

<Info>
  **建议客户端**：

  * 请求超时 **120 秒** 起步（Max-Preview 推理 / Plus 思维链长上下文请求耗时较长）
  * 对 5xx 与超时做 **指数退避重试**（建议 2 次）
  * 记录响应头 `x-request-id` 方便排查
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="五款模型用的是同一个 API 端点吗？">
    是。5 款模型共用 `/v1/chat/completions` 端点，OpenAI Chat Completions 兼容格式，仅 `model` 字段不同（`qwen3.6-max-preview` / `qwen3.6-flash` / `qwen3.6-plus` / `qwen3.6-27b` / `qwen3.6-35b-a3b`），可在同一份代码里按需切换。
  </Accordion>

  <Accordion title="开源版（27b / 35b-a3b）和闭源版有什么区别？">
    主要差别有三：**(1) 权重可下载**——开源版本可在 Hugging Face 拉取权重，便于内部审计、合规备案或后续切换为本地推理；**(2) 算力托管**——API易 把开源权重托管到官转通道，客户调 API 即可，省去租卡、部署与运维成本；**(3) 计费简单**——开源版按量平价计费，不分档，预算可控。能力上 35B-A3B 与闭源 Flash 同源不同档位，27B 是独立的稠密模型，编程能力对标更大参数量级模型。
  </Accordion>

  <Accordion title="既然权重开源，为什么还要走 API易 的官转 API？">
    本地跑开源大模型至少需要：合适的 GPU（27B 至少 A100 40G ×1，35B-A3B 显存更高）、推理框架（vLLM / TensorRT-LLM）、监控告警、容灾、版本升级流程。**API易 官转托管把这些全部托掉**，按 token 计费，按需扩缩，且与闭源版共用同一份 OpenAI 兼容 SDK——开发期用 API 跑通，生产期再决定要不要切自托管，路径平滑。
  </Accordion>

  <Accordion title="阶梯计费具体怎么算？">
    单价档位由**单次请求的总输入 token 数**决定，整次请求的所有 token（输入 + 输出）按对应档位的单价计费。例如 Flash 单次输入 300K tokens 落入 `256K – 1000K` 档，整请求按 \$0.68 / \$4.08 计价，不会拆分前 256K 与后 44K。
  </Accordion>

  <Accordion title="Max-Preview 是 Preview，能用于生产吗？">
    可以，但建议先做小流量灰度。Qwen 团队已明确表示后续版本仍会迭代权重，关键链路上线前建议跑 AB 比对，记录基准任务表现，待版本稳定后再切主流量。
  </Accordion>

  <Accordion title="Flash 的多模态输入怎么调用？">
    使用 OpenAI Vision 兼容格式：`messages` 中 `content` 字段传入数组，每个元素为 `{type: "text", text: ...}` 或 `{type: "image_url", image_url: {url: ...}}`。视频输入按官方文档使用 `video_url` / 帧采样字段。
  </Accordion>

  <Accordion title="API易 与阿里云百炼官网价格一样吗？">
    挂牌价完全持平阿里云百炼官网。区别在于 API易 上叠加 [充值加赠活动](/faq/recharge-promotions) 后，实际单价约官网 **8.5 折**；同时账户支持 OpenAI 全生态切换（GPT / Claude / Gemini / DeepSeek / GLM 等），无需重复开多个供应商账号。
  </Accordion>

  <Accordion title="是否支持函数调用 / Tool Use？">
    支持。三款模型均兼容 OpenAI 标准的 `tools` / `tool_choice` 字段，可直接复用现有 Agent 框架的工具调用逻辑。Max-Preview 在多步工具调用与长程规划上表现最佳。
  </Accordion>

  <Accordion title="是否支持思维链输出？">
    Max-Preview 在推理任务上自动启用思维链；Plus 始终开启思维链；Flash 主打速度，默认不输出思维链。具体字段名以阿里云官网响应格式为准（`reasoning_content` 等）。
  </Accordion>

  <Accordion title="超过 1M 上下文怎么办？">
    Flash 与 Plus 的最大上下文为 1M tokens，Max-Preview 为 262K。超过上限会触发 `400` 错误。建议先做摘要 / 分段 / RAG 检索，避免一次性塞入超长内容。
  </Accordion>

  <Accordion title="可以用 OpenAI 官方 SDK 直连吗？">
    可以。把 `base_url` 设为 `https://api.apiyi.com/v1`，`model` 字段填上述任一模型 ID 即可，零改动迁移。
  </Accordion>

  <Accordion title="失败的请求会扣费吗？">
    `4xx` 类客户端错误（参数错误 / 鉴权失败 / 内容审核拦截）不计费；`5xx` 类服务端错误若请求未实际进入推理阶段亦不计费。已成功返回 token 的请求按实际 token 数计费，即使响应被客户端中断。
  </Accordion>
</AccordionGroup>

## 相关文档

* [深度解读：Qwen3.6 双模上线 Max-Preview + Flash](/news/qwen-3-6-max-flash-launch)
* [深度解读：Qwen3.6-Plus 上线 阿里千问最强编程 Agent 模型](/news/qwen-3-6-plus-launch)
* [充值加赠活动](/faq/recharge-promotions) - 把单价压到约 8.5 折
* [模型信息总览](/api-capabilities/model-info) - 查看所有可用模型及分组
* [API 使用手册](/api-manual) - 通用调用规范

<Info>
  **小结**：Qwen3.6 系列覆盖了从重型 Coding Agent 到高频多模态分发的完整需求曲线——Max-Preview 把国产编程推到新高，Flash 用极低单价撑起多模态长上下文，Plus 是稳定的均衡主力；27B 与 35B-A3B 两款开源版由 API易 官转托管，把"开源权重可控 + 免租卡"这条路径补齐。5 款模型共用 OpenAI Chat 兼容端点，挂牌持平官网 + 充值加赠约 8.5 折，是当前阿里云官转通道里性价比最优的国产模型组合。
</Info>
