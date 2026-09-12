> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash 上线：编码与 Agent 大幅进步

> 谷歌 2026 年 8 月 13 日发布的 gemini-3.7-flash 已在 API易 上线，DeepSWE 65.3%、AutomationBench 30.4% 大幅超越 3.6 Flash，$0.75/$3.75 与官网同价，折扣走充值加赠。

## 核心要点

* **新一代 Flash 主力**：谷歌于 2026 年 8 月 13 日发布 `gemini-3.7-flash`，官方定位为"最聪明的 workhorse 模型"，主打编码与 Agent 场景，现已在 API易 开放调用
* **编码提升幅度罕见**：DeepSWE v1.1 从 48.6% → **65.3%**，FrontierCode 1.1 从 34.4% → **43.6%**，Terminal-bench 2.1 从 78.0% → **85.8%**
* **业务流程自动化翻倍**：AutomationBench 从 17.0% → **30.4%**，官方对比中高于 Claude Sonnet 5（10.7%）与 GPT-5.6 Terra（23.6%）
* **价格与官网一致**：输入 \$0.75 / 输出 \$3.75（每 1M tokens），这是谷歌官方的**限时优惠价，有效期至 2026 年 12 月 31 日**；2027 年 1 月 1 日起恢复 \$1.50 / \$7.50
* **规格不变**：1M 上下文 / 64K 输出，文本、图像、音频、视频多模态输入，思考档位可调（low / medium / high）

## 背景介绍

Flash 是谷歌 Gemini 系列的**中间档主力**——上有 Pro 顶配、下有 Flash-Lite 高频轻量款，Flash 负责"能力够用、价格能长期跑量"的绝大多数生产场景。这一档过去半年连续迭代了好几个版本（3.5 → 3.6 → 3.7），是 Gemini 全系更新最勤的一条线，也是我们持续推荐的默认选择。

本次 3.7 Flash 距上一版 3.6 Flash 仅约三周。谷歌把重心明确压在**编码与 Agent**上：不只是"能写代码"，而是首轮就能产出可部署的生产级代码，以及在长周期、多步骤的自动化任务中把流程真正跑完。

本文数据来自谷歌 DeepMind 官方模型卡与 Gemini API 官方文档，采集日期 2026 年 8 月 14 日。

## 详细解析

### 官方基准对比（3.7 Flash vs 3.6 Flash）

| 基准                     | 3.7 Flash | 3.6 Flash | 说明           |
| ---------------------- | --------- | --------- | ------------ |
| DeepSWE v1.1           | **65.3%** | 48.6%     | 长周期软件工程      |
| FrontierCode 1.1       | **43.6%** | 34.4%     | 生产级代码质量      |
| Terminal-bench 2.1     | **85.8%** | 78.0%     | 终端环境任务       |
| Terminal-bench 3.0     | **14.9%** | 5.4%      | 更难的终端任务      |
| Code Arena Web（Elo）    | **1588**  | 1538      | Web 开发       |
| AutomationBench        | **30.4%** | 17.0%     | 真实业务流程自动化    |
| OSWorld-2.0            | **47.9%** | 33.8%     | 图形界面操作       |
| GDM-MRCR v2            | **97.0%** | 91.8%     | 长上下文检索（128k） |
| GDP.pdf                | **34.0%** | 22.0%     | PDF 文档理解     |
| HLE-Verified           | **53.6%** | 51.2%     | 高难知识推理       |
| CharXiv Reasoning（无工具） | 84.5%     | 85.2%     | 图表推理，小幅回退    |

<Info>
  唯一出现回退的是 CharXiv 图表推理（84.5% vs 85.2%，带工具时 88.7% vs 89.4%），差距在误差量级内。以图表密集型分析为主力场景的用户，建议自行做一次 A/B 再切换。
</Info>

### 技术规格

| 项目    | 参数                           |
| ----- | ---------------------------- |
| 模型 ID | `gemini-3.7-flash`           |
| 上下文窗口 | 1,000,000 tokens             |
| 最大输出  | 64,000 tokens                |
| 输入模态  | 文本 / 图像 / 音频 / 视频            |
| 输出模态  | 文本                           |
| 知识截止  | 2026 年 3 月（部分领域为 2025 年 1 月） |
| 思考档位  | low / medium（默认）/ high       |
| 发布日期  | 2026 年 8 月 13 日              |

思考档位的取舍很直接：`low` 压低时延，适合对响应速度敏感的链路；`medium` 是默认值，日常任务的质量/成本平衡点；`high` 留给复杂推理与困难编码任务。

<Warning>
  谷歌官方说明 3.7 Flash 沿用与 3.6 Flash **同一套内置工具**（代码执行、Google 搜索、Maps 等），结构化输出与多模态同样支持。API易 侧的原生工具逐项实测报告随后补充，重度依赖某个具体工具的用户建议先小流量验证。
</Warning>

## 实际应用

### 推荐场景

* **编码与代码审查**：本次提升最大的方向，尤其是需要一次产出可部署代码的场景
* **Agent / 工作流自动化**：AutomationBench 接近翻倍，多步骤流程的完成率是这一版的核心卖点
* **长文档与长上下文处理**：GDM-MRCR v2 97.0%，1M 上下文下的检索基本无损；PDF 理解提升明显
* **日常主力对话与批量任务**：中间档定位，能力与单价的平衡点

### 代码示例

<CodeGroup>
  ```python OpenAI 兼容格式 theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gemini-3.7-flash",
      messages=[
          {"role": "user", "content": "用 Python 写一个带重试和指数退避的 HTTP 客户端"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```bash Gemini 原生格式 theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.7-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "用 Python 写一个带重试和指数退避的 HTTP 客户端"}]}]
    }'
  ```
</CodeGroup>

原生端点直接用 API易 令牌（`x-goog-api-key: sk-...`），无需 Google API Key。

### 最佳实践

* **从 3.6 Flash 平迁**：模型名改一处即可，参数结构不变；限时优惠期内单价还降了一半
* **重复前缀走缓存**：系统提示词、长文档等固定前缀部分，缓存读取仅 \$0.075 / 1M tokens，是输入价的 1/10
* **按任务分配思考档位**：批量分类、抽取这类任务用 `low`，复杂重构、多步 Agent 用 `high`，别全局一刀切

## 价格与可用性

| 计费项        | 价格（每 1M tokens） |
| ---------- | --------------- |
| 输入（提示）     | \$0.7500        |
| 输出（补全，含思考） | \$3.7500        |
| 缓存读取       | \$0.0750        |
| 缓存创建（5m）   | \$0.7500        |

**与谷歌官网完全一致。** 需要特别说明的是：\$0.75 / \$3.75 是谷歌自己的**限时优惠价**，官方注明有效期至 2026 年 12 月 31 日，2027 年 1 月 1 日起恢复到 \$1.50 / \$7.50（即与 3.6 Flash 同价）。也就是说，**在限时优惠期内用 3.7 Flash，比用上一代 3.6 Flash 还便宜一半，而能力全面更强**——这半年是迁移的最佳窗口。

### 叠加网站充值活动

API易 的价格始终对齐官网，**折扣通过充值加赠体现**，可与上面的限时优惠价叠加：

📖 [充值优惠活动详情](/faq/recharge-promotions)

## 总结与建议

Flash 这一档连续三个版本稳步升级，3.7 是其中提升幅度最大的一次——编码类基准普遍提升 10 个百分点以上，Agent 与业务流程自动化接近翻倍，而单价在限时优惠期内反而只有上一代的一半。

给出的建议很简单：**Gemini 系文本任务默认改用 `gemini-3.7-flash`**。唯一需要单独验证的是图表密集型分析（CharXiv 有小幅回退）和你重度依赖的具体内置工具。

<Info>
  数据来源：谷歌 DeepMind 官方模型卡 `deepmind.google/models/model-cards/gemini-3-7-flash/`、Gemini API 官方文档 `ai.google.dev/gemini-api/docs/latest-model`。发布日期 2026 年 8 月 13 日，数据采集日期 2026 年 8 月 14 日。价格以 API易 模型价格页实时数据为准。
</Info>
