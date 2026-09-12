> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3 Flash Preview 震撼发布：Pro 级性能，Flash 级速度

> 谷歌最新高性能快速模型 Gemini 3 Flash Preview 正式上线！SWE-bench 78% 超越 Gemini 3 Pro，速度比 2.5 Pro 快 3 倍，MMMU-Pro 81.2% 击败所有竞品。API易同步上线 3 个模型变体，灵活切换推理模式。

## 核心要点

* **🏆 超越 Pro 性能**：SWE-bench Verified 78%，超越 Gemini 3 Pro 和整个 2.5 系列
* **⚡ 极速响应**：速度比 Gemini 2.5 Pro 快 3 倍，Pro 级性能 Flash 级价格
* **🧠 顶尖推理**：MMMU-Pro 81.2% 击败所有竞品，Humanity's Last Exam 33.7%
* **🎯 三种模式**：自动推理、强制推理、默认不推理，灵活切换适配不同场景
* **💰 性价比高**：仅为 Gemini 3 Pro 价格的 1/4（\$0.5/\$3.0 每百万 tokens）
* **🚀 即刻可用**：API易已于12月18日同步上线，价格与官网一致，充值活动享额外折扣

## 背景介绍

2025年12月17日，Google 正式发布 **Gemini 3 Flash Preview**，这是继 Gemini 3 Pro Preview 之后的又一重磅更新。作为 Gemini 3 系列的"快速版本"，Flash Preview 在保持 Pro 级推理能力的同时，实现了 3 倍速度提升和大幅成本降低，重新定义了高性能 AI 模型的性价比标准。

令人惊讶的是，Gemini 3 Flash Preview 在编程能力方面甚至**超越了 Gemini 3 Pro**。在 SWE-bench Verified 测试中，Flash Preview 达到了 78% 的惊人成绩，不仅超越了同系列的 3 Pro，也全面领先于整个 Gemini 2.5 系列。这标志着 Google 在"速度与智能"的平衡上取得了新的突破。

Google 将 Gemini 3 Flash 定位为"人人可用的前沿智能"，已将其设为 Gemini 应用和 AI Mode 搜索的默认模型。企业客户如 JetBrains、Figma、Cursor、Harvey 等已经开始使用这一模型。

API易团队在第一时间完成了模型接入，于**2025年12月18日**正式向所有用户开放 Gemini 3 Flash Preview API 调用服务，并提供 **3 个模型变体**以满足不同的推理需求。定价与 Google 官网保持一致，同时支持充值活动的额外折扣。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="🏆 超越 Pro 的编程能力" icon="code">
    SWE-bench Verified 达到 78%，不仅超越 Gemini 3 Pro（约 76%），也全面领先 Gemini 2.5 系列。在智能体编程场景中表现尤为出色。
  </Card>

  <Card title="⚡ 3倍速度提升" icon="rocket">
    相比 Gemini 2.5 Pro 快 3 倍，同时保持 Pro 级的推理质量。适合需要快速响应的交互式应用和实时场景。
  </Card>

  <Card title="🧠 顶尖多模态理解" icon="brain">
    MMMU-Pro 达到 81.2%，超越所有竞品。支持文本、图像、视频、音频、PDF 等多种输入格式，单一模型处理所有内容。
  </Card>

  <Card title="💰 1/4 价格" icon="dollar-sign">
    定价仅为 Gemini 3 Pro 的 1/4（\$0.5/\$3.0 vs \$2.0/\$12.0），大幅降低企业和开发者的使用成本。
  </Card>
</CardGroup>

### 性能亮点

#### 1. 编程能力对比

Gemini 3 Flash Preview 在编程领域的表现令人惊艳：

| 模型                         | SWE-bench Verified | 智能体编程 | 性能/价格比 |
| -------------------------- | ------------------ | ----- | ------ |
| **Gemini 3 Flash Preview** | **78%**            | ✅ 优秀  | ⭐⭐⭐⭐⭐  |
| Gemini 3 Pro               | \~76%              | ✅ 优秀  | ⭐⭐⭐    |
| Gemini 2.5 Pro             | \~72%              | ✅ 良好  | ⭐⭐     |
| Gemini 2.5 Flash           | \~65%              | ✅ 良好  | ⭐⭐⭐⭐   |

Flash Preview 成为首个在编程能力上超越同系列 Pro 版本的 Flash 模型，为开发者提供了最佳的性价比选择。

#### 2. 推理能力对比

在多个权威评测中，Gemini 3 Flash Preview 展现了卓越的推理能力：

| 评测基准                     | Gemini 3 Flash Preview | Gemini 2.5 Flash | Gemini 3 Pro |
| ------------------------ | ---------------------- | ---------------- | ------------ |
| **MMMU-Pro**             | **81.2%** 🥇           | \~70%            | \~82%        |
| **Humanity's Last Exam** | **33.7%**              | 11%              | 37.5%        |
| **SWE-bench Verified**   | **78%** 🥇             | \~65%            | \~76%        |

在 Humanity's Last Exam（被称为"人类最后的考试"）中，Flash Preview 的 33.7% 成绩已经接近 Pro 版本的 37.5%，远超 2.5 Flash 的 11%。

#### 3. 速度与效率

Google 官方数据显示：

* **响应速度**：比 Gemini 2.5 Pro 快 **3 倍**
* **吞吐量**：适合高并发场景，支持大规模部署
* **延迟**：交互式应用中提供近实时响应

### 技术规格

| 规格项    | Gemini 3 Flash Preview          |
| ------ | ------------------------------- |
| 上下文窗口  | 1,048,576 tokens（约 100 万）       |
| 最大输出   | 65,536 tokens（约 6.5 万）          |
| 输入格式   | 文本、图像、视频、音频、PDF                 |
| 输出格式   | 文本                              |
| API 端点 | `gemini-3-flash-preview` 系列     |
| 可用性    | Google AI Studio、Vertex AI、API易 |

## 模型变体说明

API易为 Gemini 3 Flash Preview 提供 **3 个模型变体**，满足不同的推理需求：

### 1. gemini-3-flash-preview（自动推理）

**推荐使用** - 智能自动判断是否需要推理

<Card title="🎯 自动推理模式" icon="wand-sparkles">
  **工作原理**：模型根据问题复杂度自动决定是否启用推理模式

  **适用场景**：

  * 通用对话和问答（简单问题快速响应，复杂问题深度思考）
  * 代码生成与调试（自动识别复杂度）
  * 混合任务场景（同时包含简单和复杂问题）
  * 不确定任务复杂度的场景

  **优势**：

  * ✅ 平衡速度与质量
  * ✅ 无需手动切换
  * ✅ 成本自动优化
</Card>

### 2. gemini-3-flash-preview-thinking（强制推理）

**深度思考** - 始终启用推理模式，显示完整思考过程

<Card title="🧠 强制推理模式" icon="brain">
  **工作原理**：每次请求都启用推理模式，输出包含 `<thinking>` 标签的完整思考过程

  **适用场景**：

  * 复杂数学和逻辑问题
  * 需要多步骤推理的任务
  * 代码架构设计和优化
  * 需要可解释性的场景（查看推理过程）
  * 科研和学术任务

  **优势**：

  * ✅ 最高质量输出
  * ✅ 完整推理过程可见
  * ✅ 适合复杂任务

  **注意**：

  * ⚠️ 响应时间较长
  * ⚠️ Token 消耗较多
</Card>

### 3. gemini-3-flash-preview-nothinking（默认不推理）

**快速响应** - 默认不启用推理，追求最快速度

<Card title="⚡ 快速响应模式" icon="bolt">
  **工作原理**：默认不启用推理模式，直接输出结果

  **适用场景**：

  * 简单问答和对话
  * 文本摘要和翻译
  * 快速信息检索
  * 需要低延迟的实时应用
  * 批量处理任务

  **优势**：

  * ✅ 最快响应速度
  * ✅ 最低 Token 消耗
  * ✅ 适合高并发场景

  **适用时机**：

  * 问题相对简单明确
  * 对响应时间要求高
  * 成本敏感场景
</Card>

### 模型选择建议

| 场景类型        | 推荐模型                                | 原因          |
| ----------- | ----------------------------------- | ----------- |
| **通用开发**    | `gemini-3-flash-preview`            | 自动平衡，无需手动切换 |
| **复杂编程任务**  | `gemini-3-flash-preview-thinking`   | 显示推理过程，质量最高 |
| **简单问答/聊天** | `gemini-3-flash-preview-nothinking` | 速度最快，成本最低   |
| **代码生成**    | `gemini-3-flash-preview`            | 自动识别复杂度     |
| **数学/逻辑推理** | `gemini-3-flash-preview-thinking`   | 需要深度推理      |
| **实时应用**    | `gemini-3-flash-preview-nothinking` | 低延迟要求       |

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="💻 编程与代码生成" icon="code">
    * AI 编程助手（Cursor、Cline 等）
    * 代码审查和重构
    * 智能体自主编程
    * IDE 集成开发
    * Bug 修复和调试
  </Card>

  <Card title="📊 复杂分析任务" icon="chart-line">
    * 数据分析和报告生成
    * 多步骤推理问题
    * 科研和学术任务
    * 商业决策支持
    * 复杂查询解答
  </Card>

  <Card title="🎨 多模态内容处理" icon="image">
    * 图像理解和描述
    * 视频内容分析
    * PDF 文档解析
    * 音频转录和分析
    * 跨模态内容生成
  </Card>

  <Card title="💬 交互式应用" icon="messages-square">
    * 智能客服机器人
    * 教育辅导系统
    * 知识问答平台
    * 实时对话应用
    * 内容创作助手
  </Card>
</CardGroup>

### 代码示例

以下是使用 API易 调用 Gemini 3 Flash Preview 的 Python 示例：

#### 示例 1：自动推理模式（推荐）

```python theme={null}
import openai

# 配置 API易 端点
client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 使用自动推理模式
response = client.chat.completions.create(
    model="gemini-3-flash-preview",  # 自动判断是否需要推理
    messages=[
        {"role": "user", "content": "帮我优化这段 Python 代码的性能：\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"}
    ],
    temperature=1.0,
)

print(response.choices[0].message.content)
```

#### 示例 2：强制推理模式（复杂任务）

```python theme={null}
# 使用强制推理模式（显示完整思考过程）
response = client.chat.completions.create(
    model="gemini-3-flash-preview-thinking",  # 强制推理
    messages=[
        {"role": "user", "content": "设计一个高并发的分布式缓存系统架构，需要支持每秒 100 万次读写操作"}
    ],
    temperature=1.0,
)

# 输出会包含 <thinking> 标签，显示推理过程
print(response.choices[0].message.content)
```

#### 示例 3：快速响应模式（简单任务）

```python theme={null}
# 使用快速响应模式（不推理，速度最快）
response = client.chat.completions.create(
    model="gemini-3-flash-preview-nothinking",  # 默认不推理
    messages=[
        {"role": "user", "content": "将这段话翻译成英文：人工智能正在改变世界"}
    ],
    temperature=1.0,
)

print(response.choices[0].message.content)
```

#### 示例 4：多模态输入（图像分析）

```python theme={null}
# 多模态：分析图像内容
response = client.chat.completions.create(
    model="gemini-3-flash-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "这张图片中有什么？请详细描述。"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"  # 或 base64 编码
                    }
                }
            ]
        }
    ],
)

print(response.choices[0].message.content)
```

### 最佳实践

<Info>
  **模型选择建议**：

  * 如果不确定任务复杂度，使用 `gemini-3-flash-preview`（自动推理）
  * 需要查看推理过程或处理超复杂任务时，使用 `gemini-3-flash-preview-thinking`
  * 简单任务或对速度要求高时，使用 `gemini-3-flash-preview-nothinking`
  * 可以在同一个应用中根据不同任务混合使用三种变体
</Info>

<Warning>
  **使用限制**：

  * 遵守 Google 使用政策，禁止生成有害内容
  * API 调用有速率限制，具体限制视账户等级而定
  * 推理模式（thinking）会消耗更多 tokens，请合理使用
  * 上下文窗口虽大（100万 tokens），但过长上下文可能影响响应速度
</Warning>

## 价格与可用性

### 定价信息

Gemini 3 Flash Preview 定价显著低于 Pro 版本：

| 模型                         | 输入价格                   | 输出价格                   | 相比 3 Pro     | 相比 2.5 Flash |
| -------------------------- | ---------------------- | ---------------------- | ------------ | ------------ |
| **Gemini 3 Flash Preview** | **\$0.50** / 1M tokens | **\$3.00** / 1M tokens | **1/4 价格** ⭐ | 略高           |
| Gemini 3 Pro               | \$2.00 / 1M tokens     | \$12.00 / 1M tokens    | -            | -            |
| Gemini 2.5 Flash           | \$0.30 / 1M tokens     | \$2.50 / 1M tokens     | -            | -            |

<Info>
  **定价说明**：

  * 价格基于每百万 tokens 计算
  * 三个模型变体（自动推理/强制推理/不推理）价格相同
  * 推理模式（thinking）会产生额外的推理 tokens 消耗
  * 多模态输入（图像、视频等）按 tokens 等价计算
  * 数据来源：Google 官方定价（2025年12月17日发布）
</Info>

### 性价比分析

Gemini 3 Flash Preview 在"性能/价格比"上达到了新的高度：

* **编程任务**：SWE-bench 78%，价格仅为 3 Pro 的 1/4，性价比约 **4 倍**
* **推理任务**：接近 3 Pro 质量，价格仅 1/4，性价比约 **3-4 倍**
* **通用任务**：超越 2.5 系列，价格略高但性能提升显著

### 优惠活动

在 API易 使用 Gemini 3 Flash Preview，除了享受与官网一致的定价外，还可通过**充值活动**获得额外折扣：

* 充值 \$100 可获赠额外额度
* 充值越多，赠送比例越高（最高可达 8 折优惠）
* 详情请访问 API易 官网或联系客服

### 购买渠道

Gemini 3 Flash Preview 已在以下渠道可用：

1. **API易 API 服务**（推荐）
   * 地址：`api.apiyi.com`
   * 支持 OpenAI SDK 直接调用
   * 提供 3 个模型变体灵活切换
   * 享受充值活动折扣

2. **Google Gemini App**
   * 免费用户和 Gemini Advanced 用户均可使用
   * 在模型选择器中选择"Fast"（快速）或"Thinking"（思考）模式

3. **Google AI Studio / Vertex AI**
   * 官网定价，无额外折扣
   * 适合企业级部署

## 总结与建议

Gemini 3 Flash Preview 是 Google 在"速度与智能"平衡上的又一次突破，以 **Flash 级价格**提供 **Pro 级性能**，甚至在编程能力上超越了 Gemini 3 Pro。这标志着高性能 AI 模型正式进入"普惠时代"。

### 核心竞争力

* ✅ **编程之王**：SWE-bench 78%，超越 Gemini 3 Pro
* ✅ **速度优势**：比 2.5 Pro 快 3 倍
* ✅ **性价比无敌**：仅为 3 Pro 价格的 1/4
* ✅ **灵活切换**：3 个模型变体适配不同场景

### 推荐使用场景

* 🎯 **首选场景**：AI 编程助手、代码生成、智能体开发
* 🎯 **推荐场景**：多模态内容分析、复杂推理任务、数据分析
* 🎯 **适合场景**：交互式应用、实时对话、知识问答

### 使用建议

1. **优先使用自动推理模式**：`gemini-3-flash-preview` 适合大多数场景，无需手动切换
2. **复杂任务用强制推理**：需要深度思考或查看推理过程时，使用 `thinking` 变体
3. **简单任务用快速模式**：追求极致速度时，使用 `nothinking` 变体
4. **充分利用多模态**：支持图像、视频、音频、PDF 等多种输入
5. **结合充值活动**：在 API易 充值可享额外折扣，降低长期使用成本

### 与竞品对比

| 对比维度     | Gemini 3 Flash Preview | Claude Sonnet 4.5 | GPT-5.1       |
| -------- | ---------------------- | ----------------- | ------------- |
| **编程能力** | ⭐⭐⭐⭐⭐ (78%)            | ⭐⭐⭐⭐⭐ (77.2%)     | ⭐⭐⭐⭐⭐ (76.3%) |
| **响应速度** | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐              | ⭐⭐⭐⭐          |
| **性价比**  | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐              | ⭐⭐⭐           |
| **多模态**  | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐              | ⭐⭐⭐⭐          |

Gemini 3 Flash Preview 在编程能力、速度和性价比三个维度上都达到了业界顶尖水平，是当前最值得推荐的高性价比 AI 模型之一。

<Info>
  **信息来源与日期**：

  * Google 官方博客发布日期：2025年12月17日
  * API易 接入上线日期：2025年12月18日
  * 官方公告：`blog.google/products/gemini/gemini-3-flash/`
  * 技术分析来源：TechCrunch、SiliconANGLE、9to5Google 等科技媒体
  * 性能数据来源：Google AI Studio、官方评测报告
</Info>

***

立即体验 Gemini 3 Flash Preview 的强大能力，访问 API易 官网获取 API 密钥，开启高性价比 AI 开发之旅！
