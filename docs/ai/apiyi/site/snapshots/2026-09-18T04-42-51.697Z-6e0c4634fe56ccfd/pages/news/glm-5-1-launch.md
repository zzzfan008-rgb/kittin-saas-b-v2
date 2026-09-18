> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.1 上线：智谱开源最强编程 Agent 模型

> 智谱 Z.AI 最新旗舰开源模型 GLM-5.1 上线 API易，SWE-Bench Pro 58.4 击败 GPT-5.4、Claude Opus 4.6、Gemini 3.1 Pro，744B MoE 架构，200K 上下文，支持长达 8 小时长程编程任务，MIT 开源协议。

## 核心要点

* **SWE-Bench Pro 全球第一**：58.4 分超越 GPT-5.4、Claude Opus 4.6、Gemini 3.1 Pro，开源模型登顶
* **超大 MoE 架构**：744B 总参数 / 256 专家 / 每 token 激活 8 个，有效计算量约 40B
* **长程任务能力**：可自主执行单个编程任务长达 8 小时，覆盖规划、执行、测试、优化全流程
* **200K 上下文**：200,000 token 上下文窗口，支持 128,000 token 输出
* **开源 + 高性价比**：MIT 协议开源，API 输入 \$1.00/百万 tokens、输出 \$3.20/百万 tokens

## 背景介绍

2026 年 4 月 7 日，智谱 Z.AI 正式发布旗舰开源模型 **GLM-5.1**，这是 GLM-5 系列的重要升级版本。在权威的 SWE-Bench Pro 编程评测中，GLM-5.1 以 58.4 分的成绩超越了 GPT-5.4、Claude Opus 4.6 和 Gemini 3.1 Pro，成为该评测的新晋全球第一，也是首个在该榜单击败所有闭源旗舰模型的开源模型。

GLM-5.1 专为「智能体工程」和「长程软件开发」场景设计，可以自主完成单个编程任务长达 8 小时，期间持续进行规划、执行、测试和优化。模型完全使用 100,000 颗华为昇腾 910B 芯片训练，展现了国产算力在前沿大模型训练上的实力。

API易现已上线 `glm-5.1`，支持 OpenAI 兼容模式直接调用。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="SWE-Bench Pro 第一" icon="trophy">
    58.4 分超越所有闭源旗舰，开源模型登顶 SWE-Bench Pro 编程评测
  </Card>

  <Card title="744B MoE 架构" icon="bolt">
    744B 总参数 / 256 专家 / 激活 8 个，有效计算约 40B，性能与效率兼得
  </Card>

  <Card title="8 小时长程任务" icon="clock">
    可自主完成单个编程任务最长 8 小时，规划-执行-测试-优化全流程闭环
  </Card>

  <Card title="MIT 开源协议" icon="git-branch">
    权重已上传 HuggingFace 和 ModelScope，支持 vLLM、SGLang 推理框架
  </Card>
</CardGroup>

### 性能亮点

| 评测项目                   | GLM-5.1  | 对比                                                 |
| ---------------------- | -------- | -------------------------------------------------- |
| **SWE-Bench Pro**      | **58.4** | 全球第一，超越 GPT-5.4 / Claude Opus 4.6 / Gemini 3.1 Pro |
| **Terminal-Bench 2.0** | **63.5** | 终端操作能力顶尖                                           |
| **NL2Repo**            | **42.7** | 仓库级代码生成                                            |
| **CyberGym**           | **68.7** | 安全编程评测                                             |
| **BrowseComp**         | **68.0** | 浏览器 Agent 任务                                       |
| **vs GLM-5**           | **+28%** | 相比前代编程能力大幅跃升                                       |

<Info>
  数据来源：智谱 Z.AI 官方文档（`docs.z.ai`）、Dataconomy、Z.AI 开发者文档。GLM-5.1 于 2026 年 4 月 7 日正式发布，独立基准测试结果同日更新。
</Info>

**与竞品对比**：

* **vs Claude Opus 4.6**：编程评测 GLM-5.1 (58.4) 超越 Opus 4.6 (47.9)，达到 94.6%-122% 性能水平
* **vs GPT-5.4 / Gemini 3.1 Pro**：在 SWE-Bench Pro 上均超越
* **价格优势**：API 价格远低于闭源旗舰，性价比突出

### 技术规格

| 参数        | GLM-5.1               |
| --------- | --------------------- |
| **架构**    | MoE（混合专家）             |
| **总参数**   | 744B                  |
| **专家数量**  | 256 个（每 token 激活 8 个） |
| **有效参数**  | \~40B                 |
| **上下文窗口** | 200,000 tokens        |
| **最大输出**  | 128,000 tokens        |
| **训练硬件**  | 100,000 颗华为昇腾 910B    |
| **开源协议**  | MIT License           |
| **模型名称**  | `glm-5.1`             |

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="长程编程任务" icon="code">
    8 小时连续编程任务，适合复杂项目重构、大型功能开发、自动化代码迁移
  </Card>

  <Card title="编程 Agent" icon="bot">
    SWE-Bench Pro 第一，是 Claude Code、Cursor 等编程助手的优质开源替代
  </Card>

  <Card title="代码安全审计" icon="shield">
    CyberGym 68.7 的安全编程能力，适合代码审计、漏洞分析、安全修复
  </Card>

  <Card title="本地部署" icon="server">
    MIT 协议开源，企业可下载权重本地部署，数据完全自主可控
  </Card>
</CardGroup>

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="glm-5.1",
    messages=[
        {"role": "system", "content": "你是一个资深软件工程师，擅长长程编程任务。"},
        {"role": "user", "content": "请帮我重构这个 Python 项目，实现从单体架构到微服务架构的迁移。"}
    ],
    max_tokens=16384
)

print(response.choices[0].message.content)
```

```javascript theme={null}
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "your-api-key",
  baseURL: "https://api.apiyi.com/v1",
});

const response = await client.chat.completions.create({
  model: "glm-5.1",
  messages: [
    { role: "user", content: "Audit this codebase for security vulnerabilities and propose fixes." }
  ],
  max_tokens: 16384,
});

console.log(response.choices[0].message.content);
```

### 最佳实践

<Warning>
  GLM-5.1 专为长程任务设计，长任务建议设置较长的 timeout（如 600 秒以上），充分利用其 8 小时连续推理能力。
</Warning>

* **长程编程**：将完整项目代码作为上下文，让 GLM-5.1 自主规划重构方案并执行
* **Agent 工作流**：充分利用 BrowseComp 68.0 的浏览器操作能力，构建自主 Web Agent
* **本地化部署**：开源 MIT 协议允许企业下载权重本地部署，结合 vLLM 或 SGLang 实现高效推理

## 价格与可用性

### 定价信息

| 计费项    | 价格                 |
| ------ | ------------------ |
| **输入** | \$1.00 / 百万 tokens |
| **输出** | \$3.20 / 百万 tokens |

### 叠加网站充值活动

当前充值加赠活动持续进行中，充值越多加赠越多，详情请查看 [充值优惠政策](/faq/recharge-promotions)。

## 总结与建议

GLM-5.1 是当前最强的开源编程 Agent 模型，在 SWE-Bench Pro 上击败所有闭源旗舰，744B MoE 架构带来出色性能与效率平衡。最长 8 小时的长程任务执行能力 + 200K 上下文 + MIT 开源协议，使其成为编程 Agent、长程代码任务和企业本地化部署的理想选择。

**推荐人群**：

* 需要顶级编程 Agent 能力的开发者和团队
* 寻求 Claude Opus / GPT-5.4 高性价比开源替代的用户
* 构建长程编程任务、自主 Agent 工作流的技术团队
* 需要本地化部署、数据自主可控的企业用户

<Info>
  信息来源：智谱 Z.AI 官方开发者文档（`docs.z.ai`）、Dataconomy、TechBriefly、OpenRouter。数据获取日期：2026 年 4 月 9 日。GLM-5.1 完全使用国产华为昇腾 910B 芯片训练。
</Info>
