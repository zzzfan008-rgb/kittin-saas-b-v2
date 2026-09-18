> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiMo-V2 系列上线：小米万亿参数智能体模型，性能逼近 Opus 4.6

> 小米发布 MiMo-V2-Pro（万亿参数推理模型）和 MiMo-V2-Omni（全模态理解模型），Pro 版性能逼近 Claude Opus 4.6 但价格仅为 1/6。API易已全面上架。

## 核心要点

* **万亿参数**：MiMo-V2-Pro 总参数超 1 万亿，活跃参数 42B，MoE 架构
* **性能逼近顶级**：AA 智能指数 49（全球第 8），ClawEval 61.5 逼近 Opus 4.6（66.3），编码能力超越 Sonnet 4.6
* **价格仅 1/6**：Pro 版输入 \$1 / 输出 \$3 每百万 tokens，约为 GPT-5.2、Opus 4.6 的 1/6
* **全模态理解**：MiMo-V2-Omni 支持文本、图片、视频、音频输入，10+ 小时连续音频理解
* **100 万上下文**：Pro 版支持 100 万 token 上下文窗口

## 背景介绍

2026 年 3 月 18-19 日，小米正式发布 MiMo-V2 系列基础模型。此前 MiMo-V2-Pro 曾以代号 "Hunter Alpha" 在 OpenRouter 上匿名测试，凭借出色表现引发广泛关注和猜测，最终小米确认了其身份。

MiMo-V2-Pro 定位为智能体基础模型，专为编排复杂工作流、工具调用和代码执行优化；MiMo-V2-Omni 则是统一多模态理解模型，原生处理文本/图片/视频/音频，号称首个支持 10+ 小时连续音频理解的全模态模型。

API易已在第一时间上架两款模型。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="万亿参数 MoE" icon="microchip">
    Pro 版总参数超 1T，活跃参数 42B，7:1 混合注意力比率
  </Card>

  <Card title="极致性价比" icon="coins">
    Pro 版 \$1/\$3 每百万 tokens，约为同级竞品的 1/6
  </Card>

  <Card title="全模态理解" icon="layers">
    Omni 版支持文本、图片、视频、音频四模态输入
  </Card>

  <Card title="100 万上下文" icon="scroll-text">
    Pro 版 100 万 token 上下文，最大输出 131,072 tokens
  </Card>
</CardGroup>

### MiMo-V2-Pro 性能数据

| 评测项目         | MiMo-V2-Pro   | Claude Opus 4.6 | GPT-5.2 | 说明               |
| ------------ | ------------- | --------------- | ------- | ---------------- |
| **AA 智能指数**  | **49**        | —               | —       | 全球第 8，中国 LLM 第 2 |
| **ClawEval** | **61.5**      | 66.3            | 50.0    | 智能体评测            |
| **编码能力**     | 超越 Sonnet 4.6 | —               | —       | 代码生成与理解          |

### MiMo-V2-Omni 性能数据

| 评测项目               | MiMo-V2-Omni    | 对比               | 说明         |
| ------------------ | --------------- | ---------------- | ---------- |
| **AA 智能指数**        | **43**          | 平均 14            | 远超同类       |
| **BigBench Audio** | **94.0**        | —                | 音频理解       |
| **MMAU-Pro**       | **69.4**        | —                | 多模态音频理解    |
| **图像理解**           | 超越 Opus 4.6     | MMMU-Pro、CharXiv | 视觉推理       |
| **音频理解**           | 超越 Gemini 3 Pro | —                | 环境音分类、多说话人 |

### 技术规格

| 规格        | MiMo-V2-Pro        | MiMo-V2-Omni      |
| --------- | ------------------ | ----------------- |
| **上下文窗口** | 1,000,000 tokens   | 256,000 tokens    |
| **最大输出**  | 131,072 tokens     | —                 |
| **输入模态**  | 文本 + 图片            | 文本 + 图片 + 视频 + 音频 |
| **输出模态**  | 文本                 | 文本                |
| **架构**    | MoE（1T+ 总参，42B 活跃） | 统一多模态             |
| **特色**    | 推理链、智能体工作流         | 10+ 小时连续音频理解      |

## 实际应用

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# MiMo-V2-Pro - 适合复杂推理和编码任务
response = client.chat.completions.create(
    model="mimo-v2-pro",
    messages=[
        {"role": "user", "content": "设计一个高并发消息队列系统的架构方案，要求支持百万级 TPS..."}
    ]
)
print(response.choices[0].message.content)
```

```python theme={null}
# MiMo-V2-Omni - 多模态理解
response = client.chat.completions.create(
    model="mimo-v2-omni",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "描述这张图片中的内容"},
                {"type": "image_url", "image_url": {"url": "https://example.com/image.png"}}
            ]
        }
    ]
)
print(response.choices[0].message.content)
```

### 推荐使用场景

<CardGroup cols={2}>
  <Card title="MiMo-V2-Pro" icon="brain">
    复杂编码、智能体工作流、深度推理、长文档分析（100 万上下文）
  </Card>

  <Card title="MiMo-V2-Omni" icon="film">
    视频内容理解、音频转写分析、多模态文档解析、图表分析
  </Card>
</CardGroup>

## 价格与可用性

### 定价信息

| 模型                     | 输入价格               | 输出价格               | 说明        |
| ---------------------- | ------------------ | ------------------ | --------- |
| `mimo-v2-pro`（256K 内）  | \$1.00 / 百万 tokens | \$3.00 / 百万 tokens | 推理模型，含思维链 |
| `mimo-v2-pro`（256K-1M） | \$2.00 / 百万 tokens | \$6.00 / 百万 tokens | 超长上下文场景   |
| `mimo-v2-omni`         | \$0.40 / 百万 tokens | \$2.00 / 百万 tokens | 全模态理解     |

<Info>
  MiMo-V2-Pro 的定价约为 Claude Opus 4.6 和 GPT-5.2 的 1/6，性价比极高。
</Info>

### 叠加网站充值活动

充值加赠活动同样适用，详见 [充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

MiMo-V2 系列是小米 AI 领域的重磅之作。Pro 版以万亿参数和 100 万上下文在智能体评测中逼近 Opus 4.6，但价格仅为其 1/6，性价比极其突出。Omni 版的全模态理解（尤其是 10+ 小时音频）在同类产品中独树一帜。

**推荐策略**：需要高性价比推理和编码时选 Pro，需要多模态理解（尤其音视频）时选 Omni。

<Warning>
  MiMo-V2 系列刚发布不久，建议在生产环境中做好容错处理，关注后续更新。
</Warning>

<Info>
  信息来源：小米官方 `mimo.xiaomi.com`、Artificial Analysis 评测数据、OpenRouter 定价信息。数据获取时间：2026 年 3 月。
</Info>
