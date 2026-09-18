> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Astra 上线：OpenAI 新旗舰开放调用

> OpenAI 2026 年 9 月 3 日发布的 GPT-6 Astra 已在 API易 上架：1.05M 上下文、五档推理力度、电脑操作能力，输入 $10 / 输出 $50 每 1M tokens，缓存读取 $1，四项计费与官网一致。

## 核心要点

* **新一代旗舰**：OpenAI 于 2026 年 9 月 3 日发布 `gpt-6-astra`，官方称其为「迄今最智能、最对齐的模型」，主打电脑操作、软件工程、科研与长程 Agent 任务。API易 已上架，`default` / `svip` 官转分组与 `Codex_Reverse` 半价分组均可调用
* **定价与官网逐项一致**：输入 \$10 / 输出 \$50（每 1M tokens），缓存读取 \$1、缓存创建 \$12.50 —— 是 `gpt-5.6-sol` 现行优惠价（\$4 / \$20）的 2.5 倍，与 Claude Fable 5.1 的输入、输出价持平
* **规格全面升级**：上下文 1,050,000 tokens、最大输出 128,000 tokens、知识截止 2026 年 4 月 30 日；推理力度新增 `xhigh` 与 `max` 两档，共五档可调
* **Agent 基准大幅领先上代**：Terminal-Bench 4.0 由 37.3% 提到 **57.9%**、ScreenSpot-Pro 由 76.9% 提到 **92.7%**、FrontierMath Tier 4 由 83.0% 提到 **97.6%**；官方称同等任务 token 消耗比 Sol 低约 70%
* **网络安全能力被划为「Critical」**：这是 OpenAI 首个触及 Preparedness Framework 网络安全「关键」阈值的模型，公开 API 会拒绝漏洞挖掘、PoC 编写类任务，不影响常规开发使用

## 背景介绍

GPT-5.6 系列在 7 月以 Sol / Terra / Luna 三档发布后，OpenAI 用不到两个月的时间把代际数字推进到了 6。与 5.6 系列「三档齐发」不同，GPT-6 目前只有 `gpt-6-astra` 一个型号，官方也没有公布 mini 或轻量档的计划。

Astra 的定位非常明确：**不是聊天模型，是干活的模型**。官方发布词的核心一句是「你能在电脑上做的任何事，Astra 都能替你做，而且很快」。评测重点全部落在电脑操作（OSWorld、ScreenSpot-Pro）、终端与软件工程（Terminal-Bench 4.0、DeepSWE）、科研（FrontierMath、Terminal-Bench Science）与专业工作任务上，传统的对话类基准几乎没有出现在官方材料中。

另一个前所未有的特征是**分级发布**。9 月 3 日首先向 Trusted Access 计划内的企业与 Daybreak 网络安全计划的防御方开放，随后几天陆续扩展到 ChatGPT Plus / Pro / Business / Enterprise、OpenAI API 与 AWS。API易 于 9 月 5 日完成上架。

<Info>
  Daybreak 是 OpenAI 同期宣布的网络安全防御计划，官方称将投入 10 亿美元额度补贴防御方与关键基础设施机构。经审核的机构可获得安全限制更宽松的模型访问权限，本站提供的是**标准公开版**。
</Info>

## 详细解析

### 性能基准（数据获取于 2026 年 9 月 5 日）

| 基准测试                | GPT-6 Astra | GPT-5.6 Sol | 提升    |
| ------------------- | ----------- | ----------- | ----- |
| Terminal-Bench 4.0  | **57.9%**   | 37.3%       | +20.6 |
| OSWorld 2.0         | **72.6%**   | 65.7%       | +6.9  |
| ScreenSpot-Pro      | **92.7%**   | 76.9%       | +15.8 |
| DeepSWE v1.1        | **74.1%**   | 72.7%       | +1.4  |
| FrontierMath Tier 4 | **97.6%**   | 83.0%       | +14.6 |
| GPQA Diamond        | **96.0%**   | 94.6%       | +1.4  |
| ExploitBench        | **100%**    | 78.5%       | +21.5 |
| 幻觉率（越低越好）           | **4.2%**    | 12.2%       | −8.0  |

提升最大的三项全部是 Agent 类任务：终端操作、屏幕定位、漏洞利用。传统的知识问答（GPQA Diamond）与编码补丁（DeepSWE）提升幅度只有一到两个点 —— **这一代的进步方向是「把任务做完」，不是「答题更准」**。

<Info>
  以上数据来自 OpenAI 官方公告及第三方科技媒体转述（MarkTechPost、Yotta Labs，2026 年 9 月 3-4 日），尚无独立复现。ARC-AGI-3 一项官方口径为 99.9%，但据 Latent Space 整理，这是配合官方适配器 harness 的结果，直接作答约为 63-66%，引用时请注意口径。
</Info>

第三方独立评测的结论更克制一些。Artificial Analysis 的综合智能指数上，Astra 得 61 分，比 Claude Fable 5.1 的 66 分低 5 分；编码 Agent 指数 67 分，与 Claude Opus 5 持平，Fable 5.1 以 70 分领先。**Astra 的优势在电脑操作与任务效率，而非通用智能的绝对值。**

### 核心特性

<CardGroup cols={2}>
  <Card title="电脑操作" icon="monitor">
    覆盖浏览器、电子表格、桌面应用与终端；OSWorld 2.0 72.6%、ScreenSpot-Pro 92.7%。官方称复杂任务平均完成时间从约 75 分钟压到 40 分钟
  </Card>

  <Card title="五档推理力度" icon="brain">
    `reasoning_effort` 支持 `low` / `medium` / `high` / `xhigh` / `max`，其中 `xhigh` 与 `max` 为本代新增；官方称切换档位不会打断提示缓存
  </Card>

  <Card title="Token 效率" icon="zap">
    官方称同等任务 token 消耗比 GPT-5.6 Sol 低约 70%（Codex harness 下约为 Sol 的三分之一）。单价高 2.5 倍，实际任务成本差距会小于价差
  </Card>

  <Card title="Agent 工具链" icon="bot">
    Responses 侧支持网页搜索、文件搜索、代码解释器、托管 Shell、电脑操作、MCP 与工具搜索；新增异步函数调用与中途引导（mid-turn steering）
  </Card>
</CardGroup>

### 技术规格

| 项目    | 参数                                                                              |
| ----- | ------------------------------------------------------------------------------- |
| 模型 ID | `gpt-6-astra`                                                                   |
| 上下文窗口 | 1,050,000 tokens                                                                |
| 最大输出  | 128,000 tokens                                                                  |
| 知识截止  | 2026 年 4 月 30 日                                                                 |
| 输入模态  | 文本、图像（暂不支持音频、视频）                                                                |
| 输出模态  | 文本                                                                              |
| 推理力度  | low / medium / high / xhigh / max                                               |
| 功能支持  | 流式输出、函数调用、结构化输出、提示缓存                                                            |
| 可用分组  | `default` / `svip`（官转，官网同价）、`Codex_Reverse`（逆向，0.5 折扣）                          |
| 支持端点  | `/v1/responses`（主端点，函数调用与 Agent 工具链在此）、`/v1/chat/completions`（兼容平迁，**不支持函数工具**） |

<Warning>
  **网络安全限制**：Astra 是首个被 OpenAI 划入 Preparedness Framework 网络安全「Critical」级别的模型。标准公开版会拒绝漏洞挖掘、漏洞利用代码编写等进攻性任务，API 侧内置了相关安全检查。常规软件开发、安全配置审查、日志分析等防御性用途不受影响。
</Warning>

## 实际应用

### 推荐场景

* **长程 Agent 任务**：多步骤的浏览器 / 桌面自动化、跨系统的数据搬运与核对，这是 Astra 相对上代提升最大的方向
* **复杂软件工程**：大规模代码迁移（官方称迁移准确率 68%，领先第二名 10 个点）、跨仓库重构、SRE 故障排查
* **科研与专业分析**：FrontierMath Tier 4 接近满分，适合数学推导、科学计算脚本、专业文档撰写
* **超长上下文处理**：1.05M 上下文可一次装下整个中型代码库或数百页文档

**不推荐**用于高并发的简单任务（分类、抽取、短对话）。\$50 的输出价是 `gpt-5.6-luna` 的 8 倍多，这类负载留给 Luna / Terra 更划算。

### 代码示例

<CodeGroup>
  ```python Responses API theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh / max
      input="把这个仓库从 Python 3.9 迁移到 3.13，列出需要修改的文件与原因",
  )
  print(response.output_text)
  print(response.usage)
  ```

  ```python Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",   # low / medium / high / xhigh / max
      messages=[
          {"role": "user", "content": "把这个仓库从 Python 3.9 迁移到 3.13，列出需要修改的文件与原因"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```bash cURL（Responses） theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "high"},
      "input": "用一句话说明 GPT-6 Astra 与 GPT-5.6 Sol 的定位差异"
    }'
  ```
</CodeGroup>

Responses 是这一代的主端点：函数调用、托管工具、异步函数调用这些能力只在 Responses 上提供，多轮对话也可以直接用 `previous_response_id` 串起来。Chat Completions 适合存量代码平迁，两个端点计费相同。

<Warning>
  **Chat Completions 端点不支持函数工具**：带 `tools` 的请求在官转线路会被上游直接拒绝（400，提示改用 Responses）。这是模型侧限制，不是平台问题。需要函数调用的场景请走 Responses；Chat 端点另有两处要注意：输出上限用 `max_completion_tokens`（旧参数 `max_tokens` 会 400），不要传 `temperature`。
</Warning>

### 最佳实践

* **按任务选推理档位**：`low` / `medium` 处理确定性强的步骤，`xhigh` / `max` 留给需要长时间思考的规划与调试环节。`max` 档的推理 token 会显著增加，输出按 \$50 计费，务必先小样本测量再放量
* **用好缓存**：缓存读取 \$1 是标准输入价的十分之一。Agent 场景里系统提示、工具定义、代码库上下文这些稳定前缀应放在消息开头，让每一轮都命中缓存
* **控制输入规模**：与官网一致，输入超过 272K tokens 的请求会整单进入更高一档计费（输入、缓存翻倍）。除非确实需要一次装下整个仓库，日常把上下文压在 272K 以内
* **从 5.6 Sol 迁移只改模型名**：Responses 与 Chat Completions 两个端点都沿用原有请求结构，存量代码替换 `model` 字段即可；新增的 `xhigh` / `max` 两档按需启用。新项目直接用 Responses，电脑操作、托管 Shell 等能力只在这个端点上

<Warning>
  Astra 目前**没有 mini 或轻量档**，也没有对应的 Terra / Luna 型号。需要低成本走量的场景请继续使用 `gpt-5.6-terra`（\$2 / \$12）或 `gpt-5.6-luna`（\$0.20 / \$1.20）。
</Warning>

## 价格与可用性

### 定价信息

| 计费项        | 价格（每 1M tokens） |
| ---------- | --------------- |
| 输入（提示）     | \$10.00         |
| 输出（补全，含推理） | \$50.00         |
| 缓存读取       | \$1.00          |
| 缓存创建（5 分钟） | \$12.50         |

**四项计费与 OpenAI 官网标准档逐项一致。** 官网另有 Batch / Flex 半价档与 Fast 两倍价档，本文价格为标准档。

以上是 `default` / `svip` 官转分组的价格。`Codex_Reverse` 分组（Codex 逆向资源经济通道）也已上线本模型，按官网价 0.5 折扣计费，即输入 \$5 / 输出 \$25、缓存读取 \$0.50；适合 Codex 编程、客户端聊天对话与 Agent 等成本敏感场景，生产环境建议用官转分组。分组差异见[分组说明](/faq/codex-claudecode-default-groups)。

### 与同档模型的价格对比

| 模型                 | 输入      | 输出      | 缓存读取   |
| ------------------ | ------- | ------- | ------ |
| `gpt-6-astra`      | \$10.00 | \$50.00 | \$1.00 |
| `claude-fable-5-1` | \$10.00 | \$50.00 | \$0.25 |
| `gpt-5.6-sol`      | \$4.00  | \$20.00 | \$0.40 |
| `gpt-5.6-terra`    | \$2.00  | \$12.00 | \$0.20 |

Astra 与 Claude Fable 5.1 的输入、输出定价完全相同，差别在缓存读取：Fable 5.1 是 \$0.25，Astra 是 \$1.00。缓存命中率高的多轮 Agent 场景，这一项会拉开实际成本。

### 长上下文阶梯计费

与官网一致，`gpt-6-astra` 按单次请求的输入 tokens 数分两档计费，超过 272K 后**整单**按第二档计：

| 输入 tokens        | 输入      | 输出      | 缓存读取   | 缓存创建    |
| ---------------- | ------- | ------- | ------ | ------- |
| 0 - 272K         | \$10.00 | \$50.00 | \$1.00 | \$12.50 |
| 272,001 - 1,050K | \$20.00 | \$75.00 | \$2.00 | \$25.00 |

阶梯按请求判定、不按账户累计：同一个 Key 里 200K 的请求走第一档，300K 的请求走第二档。日常使用把上下文压在 272K 以内，成本就是上表第一行。具体数值以 [模型价格页](/models/index) 实时数据为准。

### 叠加网站充值活动

API易 的模型价格与原厂逐项对齐，**折扣通过充值加赠体现**，可与上面的价格叠加：

📖 [充值优惠活动详情](/faq/recharge-promotions)

## 总结与建议

GPT-6 Astra 不是一次「全面碾压」式的升级。通用智能的绝对值上，第三方评测显示它仍略逊于 Claude Fable 5.1；单价也比 5.6 Sol 高出 2.5 倍。它真正拉开差距的地方是**把多步骤任务做完的能力**：终端操作、屏幕定位、长程 Agent 任务的基准提升都在 15 到 20 个点，配合官方宣称的 70% token 效率提升，实际任务成本差距会小于单价差距。

建议很直接：**已经在跑 Agent、自动化或复杂工程任务的场景，值得用 `gpt-6-astra` 做一轮对照**，重点看任务完成率与端到端 token 消耗，而不是只看单价。日常对话、分类、抽取这类负载，`gpt-5.6-terra` / `gpt-5.6-luna` 仍是更合理的选择。

<Info>
  信息来源：OpenAI 官方公告与开发者文档 `developers.openai.com/api/docs/models/gpt-6-astra`（2026 年 9 月 3 日）、OpenAI 开发者社区公告、MarkTechPost、Latent Space、Yotta Labs、CloudZero（2026 年 9 月 3-4 日）、Artificial Analysis 指数。模型可用性与定价来自 API易 平台（2026 年 9 月 5 日），以模型价格页实时数据为准。
</Info>
