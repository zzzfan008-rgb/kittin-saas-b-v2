> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 开源双模上线：API易官转托管 · 免租卡

> Qwen3.6 系列新增 qwen3.6-27b 与 qwen3.6-35b-a3b 两款开源权重模型，由 API易 官转托管：27b 编程对标 397B、35b-a3b 与闭源 Flash 同源 MoE。按量付费 Chat 平价不分档（27b $0.42/$2.52，35b-a3b $0.26/$1.56），免去客户租 GPU、运维推理框架。

## 核心要点

* **Qwen3.6 系列扩展为 5 模型**：在闭源 Max-Preview / Flash / Plus 之外，新增 `qwen3.6-27b`（27B 稠密）与 `qwen3.6-35b-a3b`（35B MoE / 3B 激活）两款**开源权重**模型
* **API易 官转托管**：开源不等于免费跑，权重虽然在 Hugging Face 公开（`Qwen/Qwen3.6-27B`、`Qwen/Qwen3.6-35B-A3B`），但本地推理需要 GPU、显存、推理框架与运维。**API易 官转托管把这些全部托掉**
* **免去客户租卡 / 买算力**：按 token 计费，开发期直接调 API 跑通，未来若需自托管再切换权重，路径平滑
* **平价不分档**：开源版采用按量付费 - Chat **平价计费**（不分阶梯）：`qwen3.6-27b` \$0.42 输入 / \$2.52 输出，`qwen3.6-35b-a3b` \$0.26 输入 / \$1.56 输出 每 1M tokens
* **OpenAI 兼容**：与闭源版共用 `/v1/chat/completions` 端点，仅 `model` 字段区分，5 模型同一份 SDK
* **充值加赠叠加约 8.5 折**：挂牌持平官网，叠加 API易 充值活动后实际单价约官网 8.5 折

<Info>
  上架版本基于 Qwen 团队开源权重：`Qwen/Qwen3.6-27B`（Hugging Face）、`Qwen/Qwen3.6-35B-A3B`（Hugging Face）。本次上线为 **API易 官转托管版本**，权重与官方一致，调用方式 OpenAI Chat Completions 兼容。信息来源：Qwen 团队 Hugging Face 模型卡片，数据获取日期：2026-04-28 (UTC+8)。
</Info>

## 背景介绍

Qwen 团队在发布 Qwen3.6 闭源生产版（Max / Plus / Flash）的同时，也按照惯例把 27B 稠密版与 35B-A3B MoE 版的权重在 Hugging Face 开源放出，给希望"权重可审计、协议可控、可本地部署"的客户一条退路。

但开源 ≠ 跑得起来。本地推理一个 27B 稠密模型至少需要：A100 40G ×1 起步、vLLM / TensorRT-LLM 等推理框架、监控告警、容灾、版本升级流程；35B-A3B 虽然激活 3B 但显存仍按 35B 总参算。**对绝大多数客户而言，"想用开源 Qwen3.6"和"养得起一台开源 Qwen3.6 推理集群"之间，差着一支 SRE 团队的距离。**

API易 这次上架的核心价值就是把这条路径补齐：**开源权重 + 官转托管 = 客户调 API 直接用，不用关心 GPU**。开发期跑通业务、生产期再决定要不要切自托管，路径平滑、成本可控。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="qwen3.6-27b · 编程小钢炮" icon="box">
    **27B 稠密 · 开源权重**

    Qwen 团队开源（Hugging Face `Qwen/Qwen3.6-27B`），27B 编程能力对标 397B 量级模型，单 GPU 友好。
  </Card>

  <Card title="qwen3.6-35b-a3b · 极速 MoE" icon="boxes">
    **35B-A3B 开源 MoE**

    Qwen 团队开源（Hugging Face `Qwen/Qwen3.6-35B-A3B`），与闭源 Flash 同源，3B 激活极低算力成本。
  </Card>

  <Card title="API易 官转托管" icon="cloud-upload">
    **权重在公网，算力在我们这里**

    客户调 API 即可使用，省去租 GPU / 部署推理 / 监控运维 / 版本升级，按 token 计费、按需扩缩。
  </Card>

  <Card title="平价计费不分档" icon="dollar-sign">
    **预算简单可控**

    开源版按量付费 - Chat 平价计费，不分阶梯档位。无需提前评估 P95 token 数，预算可直接按 token 数线性估算。
  </Card>
</CardGroup>

### 性能与定位

| 维度                | qwen3.6-27b           | qwen3.6-35b-a3b        |
| ----------------- | --------------------- | ---------------------- |
| 架构                | 27B 稠密                | MoE 35B 总参 / 3B 激活     |
| 开源协议              | Qwen 团队开源             | Qwen 团队开源              |
| Hugging Face 仓库   | `Qwen/Qwen3.6-27B`    | `Qwen/Qwen3.6-35B-A3B` |
| 编程能力              | 对标 397B 级别（小尺寸编程冠军）   | 与闭源 Flash 同源           |
| 多模态               | 文本                    | 文本                     |
| 推荐场景              | 成本敏感的编程辅助、合规审计、本地部署评估 | 高频低成本对话、未来可切自托管的过渡期    |
| 单 GPU 部署门槛（自托管参考） | A100 40G 起            | 显存按 35B 总参，推理算力按 3B 激活 |

<Tip>
  **小尺寸的编程模型有什么用？**——在 IDE 内联补全、PR 审查、代码搜索这类**低延迟 / 高频次**场景，27B 比闭源旗舰更适合：响应快、成本低、又有接近大模型的代码理解能力。
</Tip>

### 技术规格

<Card title="开源版接入参数" icon="sliders-horizontal">
  * **模型 ID**：`qwen3.6-27b` / `qwen3.6-35b-a3b`
  * **端点**：`POST /v1/chat/completions`（OpenAI Chat Completions 兼容）
  * **输入模态**：文本
  * **流式输出**：✅ 支持
  * **函数调用 / Tool Use**：✅ 支持
  * **计费模式**：按量付费 - Chat（平价，**不分档**）
  * **通道**：API易 官转托管
  * **上下文 / 最大输出**：与官方权重卡片一致，详见 Hugging Face 模型仓库
</Card>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="编程辅助 · 高频低延迟" icon="code">
    用 `qwen3.6-27b` 做 IDE 内联补全、PR Bot、commit 摘要等高频任务，27B 体积响应快，单价远低于 Max-Preview 旗舰。
  </Card>

  <Card title="多并发对话分发" icon="bolt">
    用 `qwen3.6-35b-a3b` 处理客服对话、批量翻译、内容审核等高并发任务，3B 激活算力极低，单价仅 \$0.26/\$1.56。
  </Card>

  <Card title="合规审计 · 权重可控" icon="shield-check">
    需要"权重可审计 / 协议可备案"的客户，可拉取 Hugging Face 公开权重做内部合规检查，运行时仍走 API易 官转托管。
  </Card>

  <Card title="自托管前的 PoC" icon="flask-conical">
    评估开源 Qwen3.6 是否适合业务前，先用 API易 跑通 PoC、量化 token 成本，再决定是否上自有 GPU 集群。
  </Card>
</CardGroup>

### 代码示例

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 27B 编程小钢炮：低延迟代码补全
resp = client.chat.completions.create(
    model="qwen3.6-27b",
    messages=[
        {"role": "system", "content": "你是 Python IDE 内联补全助手，只返回代码差异，不解释。"},
        {"role": "user", "content": "为下面这个函数补全实现：def merge_intervals(intervals): ..."}
    ],
    stream=True
)
for chunk in resp:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)

# 35B-A3B 极速 MoE：高并发对话
resp = client.chat.completions.create(
    model="qwen3.6-35b-a3b",
    messages=[
        {"role": "user", "content": "用一句话介绍量子纠缠"}
    ]
)
print(resp.choices[0].message.content)
```

### 最佳实践

* **小模型先行**：成本敏感场景，先尝试 27B / 35B-A3B；如能力足够则停在开源档；不足时再升级到闭源 Plus / Max-Preview，避免过度投入旗舰单价。
* **平价计费的预算估算**：开源版**不分档**，可以直接按 `输入 token × 单价 + 输出 token × 单价` 线性估算月度成本，不用算 P95 token 落档概率。
* **未来自托管的平滑过渡**：API易 官转 SDK 与自托管 vLLM 的 OpenAI 兼容接口完全一致，未来若有自有算力，把 `base_url` 切到内部网关即可，业务代码零改动。

## 价格与可用性

### 定价信息

| 模型                | 计费模式               | 输入价格                 | 输出价格                 |
| ----------------- | ------------------ | -------------------- | -------------------- |
| `qwen3.6-27b`     | 按量付费 - Chat（平价不分档） | \$0.4200 / 1M tokens | \$2.5200 / 1M tokens |
| `qwen3.6-35b-a3b` | 按量付费 - Chat（平价不分档） | \$0.2600 / 1M tokens | \$1.5600 / 1M tokens |

<Info>
  **平价计费 vs 阶梯计费**：闭源 Max-Preview / Flash / Plus 采用阶梯计费（按单次请求输入 token 数决定档位），开源 27b / 35b-a3b 采用**单一档位平价计费**，预算估算更直接。挂牌价持平阿里云官网，叠加 API易 充值加赠后实际单价约**官网 8.5 折**。
</Info>

### 叠加网站充值活动

API易 充值加赠活动详情：[/faq/recharge-promotions](/faq/recharge-promotions)

充值加赠后实际折算单价（参考 8.5 折）：

| 模型                | 实际输入           | 实际输出           |
| ----------------- | -------------- | -------------- |
| `qwen3.6-27b`     | ≈ \$0.357 / 1M | ≈ \$2.142 / 1M |
| `qwen3.6-35b-a3b` | ≈ \$0.221 / 1M | ≈ \$1.326 / 1M |

## 总结与建议

Qwen3.6 开源双模上线，把"开源权重可控"和"免租卡 / 免运维"这两件原本互斥的事缝合到一起：

* **27B 稠密** —— 编程小钢炮，低延迟、高频次、成本可控，适合 IDE 类内嵌场景
* **35B-A3B 开源 MoE** —— 与闭源 Flash 同源、3B 激活极速，适合大并发分发

<Tip>
  **推荐策略**：成本敏感场景从开源档（27b / 35b-a3b）起步，跑通业务再决定要不要升级到闭源生产版。叠加充值加赠后开源 35B-A3B 实际输入约 \$0.22 / 1M tokens，是当前阿里云官转通道里最便宜的开源方案。
</Tip>

<Info>
  数据来源：Qwen 团队 Hugging Face 模型仓库（`Qwen/Qwen3.6-27B`、`Qwen/Qwen3.6-35B-A3B`）。本次上线为 API易 官转托管版本，与官方权重一致，调用方式 OpenAI Chat 兼容。文章数据获取日期：2026-04-28 (UTC+8)。
</Info>

## 相关阅读

* [Qwen3.6 系列文本模型概览](/api-capabilities/qwen-3-6/overview) - 5 模型完整介绍 + 价格 + 路由策略
* [Qwen3.6 双模上线：Max-Preview + Flash](/news/qwen-3-6-max-flash-launch) - 闭源生产版深度解读
* [Qwen3.6-Plus 上线：阿里千问最强编程 Agent 模型](/news/qwen-3-6-plus-launch) - Plus 均衡主力深度解读
