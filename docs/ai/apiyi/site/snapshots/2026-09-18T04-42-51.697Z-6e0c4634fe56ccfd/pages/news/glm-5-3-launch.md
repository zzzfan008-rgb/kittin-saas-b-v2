> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.3 与 GLM-5.3-Flash 上线：智谱编程旗舰与多模态轻量版

> 智谱 Z.AI 8 月发布的 GLM-5.3 旗舰与 GLM-5.3-Flash 轻量版同步上线 API易。旗舰 Z.ai Code Bench 比 5.2 提升 50%，Flash 原生多模态、Terminal-Bench 2.1 84.3 逼近 Claude Opus 4.8。定价与官网逐项一致：GLM-5.3 输入 $1.40 / 输出 $4.396，Flash 输入 $0.15 / 输出 $0.50 每百万 tokens，叠加充值加赠实付约为定价的 83%～91%。

## 核心要点

* **两款同步上线**：`glm-5.3`（编程旗舰）与 `glm-5.3-flash`（多模态轻量版）已在 API易 开放调用，`default` / `svip` 分组均可用
* **旗舰只做后训练扩展**：GLM-5.3 沿用 5.2 的 753B MoE 基座，官方一句话总结「Scaling post-training is all we did」，Z.ai Code Bench 相比 5.2 提升 50%
* **网络安全能力跃升**：CyberGym 84.5%、ExploitBench 54.4%，后者比 5.2 的 24.4% 翻了一倍多
* **Flash 是 GLM-5 系列首个原生多模态**：320B-A18B 混合稀疏 + 线性注意力，文本 / 图片 / 视频 / 文件都能进，Terminal-Bench 2.1 拿下 84.3，与 Claude Opus 4.8 的 85.0 仅差 0.7
* **定价与智谱官网逐项一致**：GLM-5.3 输入 \$1.40 / 输出 \$4.396 / 缓存读取 \$0.259，Flash 输入 \$0.15 / 输出 \$0.50 / 缓存读取 \$0.03 每百万 tokens，叠加充值加赠后实付约为定价的 83%～91%

## 背景介绍

2026 年 8 月 14 日，智谱 Z.AI 发布 **GLM-5.3**，口号是「Built to Code. Ready for Cyber Defense.」。这一代没有换基座，仍是 GLM-5.2 那套 753B 参数、约 40B 激活的 MoE + 动态稀疏注意力架构，全部升级都来自后训练规模的扩展。官方内部的 Z.ai Code Bench 上，GLM-5.3 比 5.2 提升 50%，同时把「思考不可关闭」定为默认：推理力度只剩 `low` / `high` / `max` 三档。

8 月 26 日，智谱又推出 **GLM-5.3-Flash**，这是 GLM-5 系列第一个原生多模态模型。320B 总参数、18B 激活的混合稀疏 + 线性注意力架构，用官方的说法是「用更少的算力给出更多的智能」——在编程与 Agent 基准上追平甚至超过 5.2 旗舰，成本却只有约十分之一。权重以 MIT 协议开放在 Hugging Face（`zai-org/GLM-5.3-Flash`）。

API易 现已同步上线两款模型，OpenAI 兼容模式直接调用。上线前我们用 16 万 tokens 级别的长提示对 `glm-5.3-flash` 做了流式实测：首字节 3～5 秒、单次消费约 \$0.005，长上下文链路工作正常。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="GLM-5.3：编程与 Agent 旗舰" icon="code">
    Terminal Bench 3.0 28.3、DeepSWE v1.1 66.9、Agents' Last Exam 28.5（与 Claude Fable 5 的 28.6 持平），Artificial Analysis 智能指数 45，开源权重模型第一
  </Card>

  <Card title="GLM-5.3：网络安全防御" icon="shield">
    CyberGym 84.5%、ExploitBench 54.4%；官方在 269 个真实开源项目里挖出 2,436 个漏洞，其中 1,097 个为中高危
  </Card>

  <Card title="Flash：原生多模态" icon="image">
    文本、图片、视频、文件都能作为输入，视觉理解直接融入编程工作流，GLM-5 系列首次
  </Card>

  <Card title="Flash：一成成本逼近旗舰" icon="zap">
    Terminal-Bench 2.1 84.3、DeepSWE v1.1 63.4、AutomationBench 48.8，全面超过 5.2 旗舰，输出价只有 GLM-5.3 的九分之一
  </Card>
</CardGroup>

### 性能亮点

| 评测项目                         | GLM-5.3   | GLM-5.3-Flash | 参照                   |
| ---------------------------- | --------- | ------------- | -------------------- |
| **Z.ai Code Bench（max）**     | 34.5      | 29.0          | Claude Opus 4.8：29.5 |
| **Terminal Bench 3.0**       | **28.3**  | —             | GPT-5.6 Sol：34.6     |
| **Terminal-Bench 2.1**       | —         | **84.3**      | Claude Opus 4.8：85.0 |
| **DeepSWE v1.1**             | **66.9**  | 63.4          | GLM-5.2：46.2         |
| **AutomationBench**          | 48.2      | 48.8          | GLM-5.2：26.2         |
| **Agents' Last Exam（CLI）**   | 28.5      | —             | Claude Fable 5：28.6  |
| **CyberGym**                 | **84.5%** | —             | GLM-5.2：77.2%        |
| **ExploitBench**             | **54.4%** | —             | GLM-5.2：24.4%        |
| **Artificial Analysis 智能指数** | 45        | 42            | 开源权重第一 / 第四          |

<Info>
  数据来源：智谱 Z.AI 官方文档（`docs.z.ai`）、Hugging Face 模型卡（`huggingface.co/zai-org`）、Artificial Analysis（`artificialanalysis.ai`）。GLM-5.3 于 2026 年 8 月 14 日发布，GLM-5.3-Flash 于 8 月 26 日发布，数据获取日期：2026 年 9 月 8 日。不同榜单口径不同，横向比较请以同一行为准。
</Info>

### 技术规格

| 参数               | GLM-5.3                     | GLM-5.3-Flash               |
| ---------------- | --------------------------- | --------------------------- |
| **架构**           | MoE + 动态稀疏注意力               | MoE + 混合稀疏 / 线性注意力          |
| **总参数 / 激活参数**   | 753B / \~40B                | 320B / 18B                  |
| **上下文窗口**        | 1,000,000 tokens            | 1,000,000 tokens            |
| **最大输出**         | 128K tokens                 | 128K tokens                 |
| **输入模态**         | 文本                          | 文本、图片、视频、文件                 |
| **思考模式**         | 不可关闭，`low` / `high` / `max` | 不可关闭，`low` / `high` / `max` |
| **工具调用 / 结构化输出** | 支持 / 支持                     | 支持 / 支持                     |
| **开源权重**         | 已开放，智谱自定义许可证                | 已开放，MIT 协议                  |
| **模型名称**         | `glm-5.3`                   | `glm-5.3-flash`             |

<Warning>
  两款模型的思考都**不能关闭**，即使很短的问答也会先产出推理 tokens。对延迟和成本敏感的场景请把 `reasoning_effort` 设为 `low`；默认为 `max`，长任务下单次输出可达数万 tokens。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="编程 Agent 主力" icon="bot">
    GLM-5.3 在 Claude Code、OpenCode 等编程 Agent 里的表现是这一代的升级重点，长程任务用 `high` 档在效果与 tokens 消耗之间最平衡
  </Card>

  <Card title="安全审计与漏洞挖掘" icon="shield-check">
    CyberGym / ExploitBench 大幅领先上一代，适合做代码安全审计、依赖漏洞排查的自动化流水线
  </Card>

  <Card title="截图 / 视频驱动的开发" icon="video">
    Flash 原生看图看视频，可以直接把 UI 截图、录屏喂给模型复现界面或定位 bug
  </Card>

  <Card title="高频长上下文批处理" icon="layers">
    Flash 1M 上下文 + \$0.15 输入价，16 万 tokens 的长提示单次约 \$0.005，适合日志分析、文档抽取等高频任务
  </Card>
</CardGroup>

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 旗舰：长程编程任务
response = client.chat.completions.create(
    model="glm-5.3",
    reasoning_effort="high",
    messages=[
        {"role": "system", "content": "你是一名资深软件工程师，擅长仓库级重构与安全审计。"},
        {"role": "user", "content": "请审计这个仓库的鉴权模块，列出可被利用的漏洞并给出修复补丁。"}
    ],
    max_tokens=32768
)
print(response.choices[0].message.content)
```

```python theme={null}
# 轻量版：多模态输入（图片 + 文本）
response = client.chat.completions.create(
    model="glm-5.3-flash",
    reasoning_effort="low",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "根据这张设计稿生成对应的 React 组件。"},
            {"type": "image_url", "image_url": {"url": "https://example.com/mockup.png"}}
        ]
    }],
    max_tokens=8192
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
  model: "glm-5.3-flash",
  reasoning_effort: "low",
  messages: [
    { role: "user", content: "分析这 70 万行服务器日志，找出根因。" }
  ],
  max_tokens: 16384,
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
```

### 最佳实践

* **按任务分档**：交互式问答、批量抽取用 `glm-5.3-flash` + `low`；仓库级重构、安全审计上 `glm-5.3` + `high`，`max` 档留给确实需要极限效果的任务
* **长任务开流式**：思考不可关闭，长任务的首字节会在几秒之后到达，流式返回能明显改善体感；timeout 建议设到 600 秒以上
* **用好缓存读取**：两款模型都支持上下文缓存，缓存读取价只有输入价的两成左右，多轮对话与共享长 system prompt 的场景收益明显
* **旗舰权重许可证另核**：GLM-5.3 权重虽已开放，但用的是智谱自定义许可证而非 MIT，本地部署商用前请核对条款；Flash 是 MIT，可放心自部署

## 价格与可用性

### 定价信息

API易 定价与智谱官网逐项一致，不加价：

| 计费项      | GLM-5.3             | GLM-5.3-Flash      |
| -------- | ------------------- | ------------------ |
| **输入**   | \$1.40 / 百万 tokens  | \$0.15 / 百万 tokens |
| **输出**   | \$4.396 / 百万 tokens | \$0.50 / 百万 tokens |
| **缓存读取** | \$0.259 / 百万 tokens | \$0.03 / 百万 tokens |

<Info>
  计费类型：按量付费 - Chat。`default` / `svip` 分组均已开放，OpenAI 兼容 `chat/completions` 端点调用。智谱官网对 GLM-5.3-Flash 有一轮到 2026 年 9 月 9 日 24:00 (UTC+8) 为止的限时五折活动，本站按标准定价上线。
</Info>

### 叠加网站充值活动

以上是折扣前定价。叠加充值加赠后，**实付约为定价的 83%～91%**，充值越多加赠越多，详情请查看 [充值优惠政策](/faq/recharge-promotions)。

## 总结与建议

GLM-5.3 把后训练规模推到新高度，编程与网络安全两条线都有实打实的提升，是当前开源权重阵营里最强的编程 Agent 底座之一；GLM-5.3-Flash 则用一成的成本追平旗舰、顺手补上多模态，是长上下文高频任务的高性价比选择。两款模型在 API易 定价与官网一致，叠加充值加赠后成本更低。

**推荐人群**：

* 用 Claude Code、OpenCode 等编程 Agent、想找高性价比开源替代的开发者
* 做代码安全审计、漏洞挖掘自动化的安全团队
* 需要看图看视频的多模态开发场景，以及大批量日志 / 文档处理的团队
* 需要本地部署的企业用户：Flash 走 MIT，旗舰请先核对许可证

<Info>
  信息来源：智谱 Z.AI 官方文档（`docs.z.ai`）、Hugging Face 模型卡（`huggingface.co/zai-org/GLM-5.3`、`huggingface.co/zai-org/GLM-5.3-Flash`）、Artificial Analysis（`artificialanalysis.ai`）。数据获取日期：2026 年 9 月 8 日。
</Info>
