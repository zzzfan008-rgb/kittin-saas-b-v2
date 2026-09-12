> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.1 Flash Lite 正式 GA：高吞吐 Agent 与低延迟场景的最优解

> Gemini 3.1 Flash Lite 于 5 月 8 日正式 GA，输出速度比 2.5 Flash 快 64%，GPQA Diamond 86.9%，定价 $0.25/$1.50 每 1M tokens。API易官方直连同步上线，叠加充值活动可享 85-79 折。

## 核心要点

* **正式 GA 上线**：谷歌于 2026 年 5 月 8 日 (UTC+8) 宣布 Gemini 3.1 Flash Lite 进入正式可用 (GA) 阶段，可放心用于生产环境
* **模型标识符更新**：从 `gemini-3.1-flash-lite-preview` 升级为 `gemini-3.1-flash-lite`，预览版用户建议尽快迁移
* **速度大幅提升**：输出速度比 2.5 Flash 快 **64%**（381.9 vs 232.3 tokens/sec），首字延迟缩短至原来的 **40%**
* **官方定价直连**：输入 \$0.25 / 1M tokens，输出 \$1.50 / 1M tokens，与谷歌官网完全一致
* **充值活动叠加**：API易支持充值加赠，叠加后实付可低至官方 **85-79 折**

## 背景介绍

2026 年 3 月 3 日，谷歌发布 Gemini 3.1 Flash Lite Preview，主打"高吞吐 Agent + 低延迟"细分赛道。在两个月的预览期里，Latitude、Cartwheel、Whering、HubX 等代理类客户给了相当积极的反馈——指令遵循精度高、首字快、单位成本低、多模态稳定。

2026 年 5 月 8 日 (UTC+8)，谷歌正式宣布 Gemini 3.1 Flash Lite **进入 GA（Generally Available）阶段**，模型名也从 `gemini-3.1-flash-lite-preview` 改为 `gemini-3.1-flash-lite`。这意味着：API 接口、行为契约、计费规则趋于稳定，可以放心接入生产环境。

API易第一时间通过官方直连（官转）通道完成同步接入，定价与谷歌官网完全一致，叠加充值加赠后还可以再下探一档，是接入 Gemini 3.1 系列轻量档最高性价比的方式之一。

## 详细解析

### GA 与 Preview 的差异

<CardGroup cols={2}>
  <Card title="模型标识符" icon="tag">
    * 旧：`gemini-3.1-flash-lite-preview`
    * 新：`gemini-3.1-flash-lite`
    * 旧名仍可用，但建议迁移
  </Card>

  <Card title="API 稳定性" icon="shield-check">
    * 接口契约冻结
    * 速率限制/计费规则稳定
    * 适合生产级流量接入
  </Card>

  <Card title="性能调优" icon="gauge">
    * 输出速度进一步提升
    * 首字延迟优化
    * 函数调用与结构化输出更稳
  </Card>

  <Card title="生态成熟" icon="layers">
    * Batch API、Caching 全面就绪
    * 思维档位（Thinking Levels）生产可用
    * 全模态输入支持稳定
  </Card>
</CardGroup>

### 性能亮点（GA 版基准）

依据 Artificial Analysis 与谷歌官方公布的数据：

| 指标                       | Gemini 3.1 Flash Lite  | Gemini 2.5 Flash | 提升   |
| ------------------------ | ---------------------- | ---------------- | ---- |
| 输出速度 (tokens/sec)        | **381.9**              | 232.3            | +64% |
| 首字延迟（TTFT）               | 比 2.5 Flash 快 **2.5×** | 基准               | -60% |
| GPQA Diamond             | **86.9%**              | —                | 同档领先 |
| MMMU Pro（多模态推理）          | **76.8%**              | —                | 同档领先 |
| Arena Elo                | **1432**               | —                | —    |
| Artificial Analysis 智能指数 | **34**（同价位中位数 21）      | —                | 远超中位 |

谷歌官方在内部跑的 11 项基准里，Gemini 3.1 Flash Lite 在 6 项上**击败 GPT-5 mini 与 Claude Haiku 4.5**，且单位成本明显更低。

### 技术规格

| 规格项                                   | 参数                      |
| ------------------------------------- | ----------------------- |
| 模型名称                                  | `gemini-3.1-flash-lite` |
| 上下文窗口                                 | 1,048,576 tokens（1M+）   |
| 最大输出                                  | 65,536 tokens（64K）      |
| 输入模态                                  | 文本、图像、视频、音频、PDF         |
| 输出模态                                  | 文本                      |
| 知识截止                                  | 2025 年 1 月              |
| 最新更新                                  | 2026 年 5 月              |
| 思维（Thinking）                          | ✅ 支持档位调节                |
| 函数调用                                  | ✅                       |
| 结构化输出                                 | ✅                       |
| 代码执行                                  | ✅                       |
| 文件搜索 / URL 上下文                        | ✅                       |
| 搜索 Grounding / Maps Grounding         | ✅                       |
| Batch API / Caching / Flex / Priority | ✅                       |
| 接入渠道                                  | API易 官方直连（官转）           |

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="生产级 Agent 流水线" icon="bot">
    * 工具调用 / 路由 / 多步编排
    * 可大规模并发的轻量级决策节点
    * SLA 敏感、需要稳定接口的代理任务
  </Card>

  <Card title="高吞吐数据处理" icon="database">
    * 表格/表单/PDF 结构化抽取
    * 批量内容审核、分类、打标
    * 海量日志摘要与归一化
  </Card>

  <Card title="低延迟交互" icon="bolt">
    * 实时翻译与同声传译辅助
    * UI 生成、Dashboard 拼装
    * 客服首响、意图识别
  </Card>

  <Card title="多模态轻量任务" icon="images">
    * 图片/视频内容理解
    * 音频转写 + 关键信息提取
    * PDF 文档解析与字段抽取
  </Card>
</CardGroup>

### 代码示例

通过 API易调用 GA 版 Gemini 3.1 Flash Lite：

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite",  # GA 版，不再带 -preview
    messages=[
        {"role": "system", "content": "你是一个高效的结构化数据提取助手。"},
        {"role": "user", "content": "从订单文本中提取 order_id、金额、币种，输出 JSON。"}
    ],
    temperature=0.2,
    response_format={"type": "json_object"}
)

print(response.choices[0].message.content)
```

**Agent 工具调用示例**

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "search_internal_kb",
        "description": "在企业知识库检索相关文档",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "top_k": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        }
    }
}]

resp = client.chat.completions.create(
    model="gemini-3.1-flash-lite",
    messages=[{"role": "user", "content": "帮我找一下退款流程相关的内部文档"}],
    tools=tools,
    tool_choice="auto"
)
print(resp.choices[0].message.tool_calls)
```

### 最佳实践

<Info>
  **生产环境接入建议**

  1. **从 Preview 平滑迁移**：把 `gemini-3.1-flash-lite-preview` 替换为 `gemini-3.1-flash-lite`，先在影子流量中对比观测
  2. **思维档位按需开启**：简单分类/路由关闭 Thinking 进一步提速；多步推理任务再开启
  3. **结构化输出优先**：搭配 `response_format={"type": "json_object"}`，下游解析更稳
  4. **Batch + Cache 双管齐下**：高吞吐场景优先用 Batch API，重复上下文启用 Caching（缓存输入价格再降 90%）
  5. **关注 token 体感**：Flash Lite 偏"健谈"，对成本敏感的接口建议显式约束 `max_tokens`
</Info>

## 价格与可用性

### API易官方直连定价

<Card title="与谷歌官网完全一致" icon="tag">
  | 类型             | 价格                            |
  | -------------- | ----------------------------- |
  | 文本 / 图像 / 视频输入 | \$0.250 / 1M tokens           |
  | 输出             | \$1.500 / 1M tokens           |
  | 缓存输入           | \$0.025 / 1M tokens（约官方价 10%） |

  * 官方直连（官转）通道，稳定可靠
  * 定价与谷歌官网完全一致
  * 支持 Batch API 进一步降本
</Card>

### 叠加充值活动（85-79 折）

API易长期上线充值加赠活动，叠加官方直连定价后，Gemini 3.1 Flash Lite 实付可下探到官方价的 **85 折至 79 折**：

| 活动档位 | 加赠比例 | 等效折扣       |
| ---- | ---- | ---------- |
| 入门档  | +18% | 约 **85 折** |
| 进阶档  | +22% | 约 **82 折** |
| 高吞吐档 | +27% | 约 **79 折** |

详情参考充值优惠说明页：[充值活动](/faq/recharge-promotions)。

<Warning>
  **迁移提醒**

  * 预览期模型名 `gemini-3.1-flash-lite-preview` 谷歌官方仍保留一段时间，但**新接入项目请直接使用 GA 版** `gemini-3.1-flash-lite`
  * GA 后接口契约更稳定，但仍建议关键链路保留监控与回退方案
</Warning>

## 总结与建议

Gemini 3.1 Flash Lite 在 GA 阶段把"**速度 / 价格 / 多模态 / 代理能力**"四件事一次性做到了同价位天花板：

* **比 2.5 Flash 快 64%、首字快 2.5×**，长链路 Agent 响应肉眼可感
* **GPQA Diamond 86.9% / MMMU Pro 76.8%**，在同价位推理与多模态任务里第一梯队
* **\$0.25 / \$1.50 每 1M tokens**，叠加 API易充值活动可至 **79 折**
* **GA 后接口稳定**，可直接进入生产链路

**我们的建议**

* **正在用 Preview 的团队**：尽快切到 GA 版模型名，享受更稳的接口契约
* **大流量 Agent 团队**：把路由 / 工具调用 / 数据提取等节点统一切到 Flash Lite，配合 Batch + Cache 把单位成本压到极致
* **多模态轻量任务团队**：用一个模型同时覆盖文本、图像、视频、音频、PDF，少维护一套 SDK

<Info>
  **信息来源与更新日期**

  * 谷歌官方公告：`blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/`
  * 谷歌 GA 公告：`cloud.google.com/blog/products/ai-machine-learning/gemini-3-1-flash-lite-is-now-generally-available`
  * 模型文档：`ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite`
  * 评测来源：Artificial Analysis（`artificialanalysis.ai/models/gemini-3-1-flash-lite-preview`）
  * 数据获取时间：2026 年 5 月 9 日 (UTC+8)
</Info>

**立即开始使用**

访问 API易官网，获取 API Key，把 model 字段切到 `gemini-3.1-flash-lite`，即可享受 GA 版稳定 API + 官方一致定价 + 充值活动叠加折扣。
