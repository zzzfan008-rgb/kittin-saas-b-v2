> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash 正式版上线：附完整实测

> DeepSeek-V4-Flash-0731 正式版登陆 API易，输入 $0.14 / 输出 $0.28 每百万 tokens。实测 32 万 tokens 上下文 14.8 秒返回、隐式缓存二轮命中 99.9%、20 并发零限流，同时也测出了三个必须绕开的坑。

## 核心要点

* **正式版上线**：`deepseek-v4-flash-ga-260731` 已上架，对应开源版 `DeepSeek-V4-Flash-0731`，2026 年 7 月 31 日转正式版
* **架构未变，后训练重做**：仍是 284B 总参 / 13B 激活的 MoE，官方明确只重做了后训练阶段，agent 类基准大幅提升
* **五项 agent 基准反超 Pro 预览版**：Terminal Bench 2.1 达 82.7（Flash 预览版 61.8 / Pro 预览版 72.1）
* **实测长文能力扎实**：32.2 万 tokens 上下文 14.77 秒返回并准确捞出中段信息；上下文硬上限 1,048,570 tokens
* **隐式缓存免配置**：同前缀第二轮命中 15616/15634，命中率 99.9%，命中部分按 \$0.028 / 百万 tokens 计费
* **价格**：输入 \$0.14 / 输出 \$0.28 每百万 tokens，与 BytePlus 官方同价，叠加充值活动可再降
* **双端点可用**：Chat Completions 与 Responses 均已开通，Responses 端显式缓存链式调用可整轮命中
* **三个坑要绕开**：结构化输出静默失效、联网搜索后端持续报错、`reasoning_effort` 不是单调档位

<Info>
  本文的性能与兼容性数据来自 API易 在 2026-08-05 的实测，测试脚本与原始日志可复现。
  基准分数为厂商自评数据，来源：`huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731`。
</Info>

## 背景介绍

2026 年 4 月，DeepSeek 发布 V4 预览版，一次带来 V4-Pro 和 V4-Flash 两款模型。三个月后的
7 月 31 日，Flash 线率先转正式版，检查点命名为 **DeepSeek-V4-Flash-0731**。

这次更新有个容易被忽略的关键点：**它不是一个新模型**。官方说得很直白——架构、参数量、
上下文长度全部与 4 月的预览版一致（284B 总参 / 13B 激活 MoE、1M 上下文、384K 最大输出），
**改动只发生在后训练阶段**。

但后训练带来的提升幅度相当反直觉。在厂商自评的 agent 类基准上，正式版不仅大幅超过自己的
预览版，还**越过了同代的 V4-Pro 预览版**：

| 基准                  | Flash-0731 正式版 | Flash 预览版 | Pro 预览版 |
| ------------------- | -------------- | --------- | ------- |
| Terminal Bench 2.1  | **82.7**       | 61.8      | 72.1    |
| Cybergym            | **76.7**       | 38.7      | 52.7    |
| Toolathlon-Verified | **70.3**       | 49.7      | 55.9    |
| DeepSWE             | **54.4**       | 7.3       | 12.8    |
| NL2Repo             | **54.2**       | 39.4      | 38.5    |

DeepSWE 从 7.3 到 54.4，这个跨度已经不是「调优」能解释的量级。不过要提醒一句：
这些是厂商自评数据，目前**没有第三方复现**。Artificial Analysis 给出的通用智能指数是 50，
属于通用能力测量，不是 agent 专项。

## 详细解析

### 我们实测了什么

模型能力表是一回事，接到网关上能不能用是另一回事。我们跑了 21 个用例 + 三方对照 + 思考档位专项，
下面是结论。

### 长上下文：这是它最强的部分

先确认上限——发一个超长请求，网关直接给出硬数字：

```
Input length 1280009 exceeds the maximum length 1048570
```

**1,048,570 tokens**，1M 名副其实。最大输出同样探到硬上限 **393,216 tokens**（384K），
与官方说明一致。

然后做大海捞针，在长文中段埋一句暗号，让模型找出来：

| prompt tokens | 耗时         | 是否命中 |
| ------------- | ---------- | ---- |
| 74,031        | 4.85s      | ✅    |
| 322,055       | **14.77s** | ✅    |

32 万 tokens 上下文、14.8 秒返回、准确捞出中段埋的信息。这个成绩放在同价位段里相当突出。

### 隐式缓存：免配置，第二轮就命中

用同一段 15.6k tokens 的前缀连发三轮，间隔 5 秒：

| 轮次 | prompt\_tokens | cached\_tokens | 命中率       | 耗时    |
| -- | -------------- | -------------- | --------- | ----- |
| 1  | 15,634         | 0              | —         | 2.99s |
| 2  | 15,634         | 15,616         | **99.9%** | 2.56s |
| 3  | 15,634         | 15,616         | **99.9%** | 2.55s |

不需要任何参数，第二轮几乎全量命中。命中部分按 \$0.028 / 百万 tokens 计费，
相当于重复前缀省 80%。做长文档多轮问答、固定 system prompt 的批量任务，这一项直接决定成本。

<Tip>
  吃满隐式缓存的前提是**前缀逐字节一致**。把变动内容（时间戳、随机 ID、用户名）
  放到 prompt 末尾，不要混进前缀里。
</Tip>

### 显式缓存：走 Responses 链式调用

Chat 与 Responses 两个端点都已开通。Responses 端还多一层**显式缓存**，但它的用法
容易搞错——**不是**把同一段长前缀重复发两次（那样 `cached_tokens` 一直是 0），
而是首轮带 `caching: {"type": "enabled"}` 写入，后续轮用 `previous_response_id` 链下去：

| 轮次    | 调用方式                     | input\_tokens | cached\_tokens | 耗时    |
| ----- | ------------------------ | ------------- | -------------- | ----- |
| 1（写入） | `caching: enabled`       | 15,629        | 0              | 4.10s |
| 2     | + `previous_response_id` | 15,664        | **15,629**     | 5.18s |
| 3     | + `previous_response_id` | 15,701        | **15,664**     | 4.57s |
| 4     | + `previous_response_id` | 15,738        | **15,701**     | 4.54s |

每一轮把上一轮的全部上下文整体命中。做多轮长上下文会话（如长文档连续追问），
这个模式比每轮重发全文省得多。

### 并发：20 路零限流

同一把 Key 无预热直接打并发：

| 并发数 | 状态分布   | 墙钟耗时  | 最慢单请求 |
| --- | ------ | ----- | ----- |
| 5   | 全部 200 | 2.63s | 2.62s |
| 10  | 全部 200 | 3.41s | 3.38s |
| 20  | 全部 200 | 3.92s | 3.85s |

20 并发全部成功，墙钟只比单发慢 1.3 秒，没有排队感。「高并发 agent 场景」这个定位站得住。

### 速度对照：不是一边倒

四道题与 `deepseek-v4-flash`（0423 预览版通道）、`deepseek-v4-pro` 对照，均为默认思考档：

| 题目  | 模型           | 耗时        | 输出 tokens | 其中思考 |
| --- | ------------ | --------- | --------- | ---- |
| 数学  | **GA 正式版**   | **3.46s** | 201       | 200  |
|     | v4-flash     | 4.75s     | 302       | 230  |
|     | v4-pro       | 6.46s     | 308       | 306  |
| 代码  | **GA 正式版**   | **3.06s** | 147       | 47   |
|     | v4-flash     | 4.84s     | 227       | 127  |
|     | v4-pro       | 8.00s     | 401       | 281  |
| 逻辑  | GA 正式版       | 25.74s    | 1996      | 1826 |
|     | **v4-flash** | **9.52s** | 682       | 587  |
|     | v4-pro       | 18.07s    | 872       | 754  |
| 陷阱题 | GA 正式版       | 4.64s     | 269       | 263  |
|     | **v4-flash** | **2.54s** | 50        | 44   |
|     | v4-pro       | 2.91s     | 61        | 54   |

四题答案全部正确（含 9.11 与 9.9 比大小这道经典陷阱题）。但速度结论**不是一边倒**：

* **数学、代码这类结构明确的题**，正式版比预览版通道快 30\~37%，且成本更低
* **逻辑题和陷阱题上正式版反而更慢**，因为它默认思考得更多——陷阱题上花了 263 个思考 token，
  预览版只花 44 个

这是正式版的一个性格变化：**它默认更"愿意想"**。好处是复杂任务质量更稳，
代价是简单问题也要付思考成本。解决办法很简单，见下面的代码示例。

## 三个必须绕开的坑

<Warning>
  这一节是本文最值得看的部分。以下三项都会**静默失效**——不报错，但也不生效，
  只看 HTTP 状态码会误判。
</Warning>

### 坑一：结构化输出参数收但不约束

官方能力表把结构化输出标为不支持，实测确认，且失效方式很隐蔽：

1. 带 `response_format: json_schema` **不会报错**（HTTP 200）
2. 但 prompt 里不含 "json" 字样时上游会 400 ——
   这说明它是 OpenAI 兼容层的提示词式实现，不是原生约束解码
3. prompt 里带 "json" 后，模型**完全无视 schema**

我们用 `{"answer": string}` 加 `strict: true` 在**两个端点各测 3 次**，返回的键是
`name / englishName / country / coordinates / population…`，和 schema 毫无关系；
Chat 端 2/3 次、Responses 端 3/3 次被代码围栏包裹，`json.loads()` 直接失败。

**替代方案**：需要结构化输出请走 Function Call。工具参数是**真正被约束**的，实测稳定。

### 坑二：联网搜索工具接通了，但后端取不到结果

这一项和能力表的差异最微妙：`web_search` 工具本身**已经接通**——响应的 `output`
里能看到 `web_search_call` item，`status` 也是 `completed`，看起来一切正常。

但搜索后端持续失败。6 次独立测试、共 17 次搜索调用，模型每次都回复「搜索服务暂时出现异常」
「多次尝试均报错，未能获取实时信息」；`web_search_call` 的字段只有
`action / id / status / type`，**不含 `results`**。

6/6 全部失败，不是偶发。链路通、后端不可用，当前不建议用于生产。

同一批测试里 **MCP** 稳定返回 `AccessDenied`（`you do not have access to the built in tool`），
换成合法的公共 MCP server 地址结果相同——这是账号 / 渠道级的内置工具权限问题，
不是模型能力限制。

### 坑三：reasoning\_effort 不是单调档位

两道题 × 五档 × 5 次采样，思考 token 中位数：

| 档位        | river 题中位数 | prob 题中位数 | 说明                 |
| --------- | ---------- | --------- | ------------------ |
| `minimal` | **0**      | **0**     | 10/10 次恰好为 0，确定性生效 |
| `low`     | 956        | 367       | 档内从 150 到 1993     |
| `medium`  | 506        | 193       |                    |
| `high`    | **97**     | **153**   | 两题都是四档里最低          |
| `max`     | 577        | 173       |                    |

**`high` 的思考量在两道题上都比 `low` 少**，档内方差远大于档间差异。
把它当成本旋钮用会得到不可预期的结果。

**只有 `minimal` 是可靠的**——它等价于关闭思考。要控成本就用它，
不要指望 low → max 线性加深。

### 附带发现：n>1 静默忽略

传 `n=2` 返回 200，但 `choices` 数组里只有 1 个元素。其余采样参数
（`temperature`、`top_p`、`stop`、`logprobs`、`seed`、双 penalty）实测均正常。

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="适合" icon="circle-check">
    * 高并发日常问答与文本处理
    * 长文档摘要与问答（32 万 tokens 实测 15 秒）
    * 需要工具调用的轻量 agent
    * 固定 system prompt 的批量任务（吃隐式缓存）
    * 多轮长上下文会话（Responses 链式显式缓存）
  </Card>

  <Card title="避开" icon="circle-x">
    * 需要 `json_schema` 强约束（改用 Function Call）
    * 依赖联网搜索或 MCP（后端 / 权限未就绪）
    * Claude Code 接入（未开 Anthropic 端点）
    * 任何图片输入场景（纯文本模型）
  </Card>
</CardGroup>

### 代码示例

简单任务显式关闭思考，避免为一句话答案付出几百 token 的思考开销：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

# 简单任务：显式关思考，实测可省掉 200+ 思考 token
resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "把这段话改写得更简洁：……"}],
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
```

复杂任务放开思考，并读取思考链：

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "分析这段代码的时间复杂度并给出优化方案"}],
    extra_body={"thinking": {"type": "enabled"}},
)
msg = resp.choices[0].message
print("思考过程：", getattr(msg, "reasoning_content", None))
print("最终回答：", msg.content)
```

需要结构化输出时用 Function Call，而不是 `response_format`：

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
# 工具参数是真正被约束的，可直接解析
import json
args = json.loads(resp.choices[0].message.tool_calls[0].function.arguments)
print(args)
```

### 最佳实践

<Steps>
  <Step title="简单任务显式关思考">
    正式版默认思考量偏大，`thinking: {"type": "disabled"}` 或
    `reasoning_effort: "minimal"` 都能可靠关闭。
  </Step>

  <Step title="把变动内容放 prompt 末尾">
    隐式缓存要求前缀逐字节一致。时间戳、随机 ID 混进前缀会让命中率归零。
  </Step>

  <Step title="结构化输出一律走 Function Call">
    `response_format` 在这个模型上不生效且不报错，是最容易踩的坑。
  </Step>

  <Step title="多轮长会话走 Responses 链式调用">
    首轮带 `caching: {"type": "enabled"}`，后续用 `previous_response_id` 链下去，
    上一轮上下文可整轮命中缓存。
  </Step>

  <Step title="不要依赖联网搜索与 MCP">
    `web_search` 工具接通但后端持续报错，MCP 返回 `AccessDenied`，两项当前都取不到结果。
  </Step>
</Steps>

## 价格与可用性

### 定价信息

| 模型                            | 输入                  | 输出                 | 缓存命中                |
| ----------------------------- | ------------------- | ------------------ | ------------------- |
| `deepseek-v4-flash-ga-260731` | \$0.14 / 百万 tokens  | \$0.28 / 百万 tokens | \$0.028 / 百万 tokens |
| `deepseek-v4-pro`             | \$0.435 / 百万 tokens | \$0.87 / 百万 tokens | —                   |

与 BytePlus 官方标价一致。可用分组：`default`、`svip`。

<Info>
  **关于「不到旗舰十分之一」这个说法**：厂商宣传语对标的是 V4-Pro 预览期的
  \$1.74 / \$3.48。按当前 V4-Pro 挂牌价折算，正式版是**约 1/3**，不是 1/10。
  我们按实际挂牌价说明，不沿用旧口径。
</Info>

### 叠加网站充值活动

在上述价格基础上，还可叠加 API易 的充值加赠活动进一步降低实际成本，
详见 [充值活动说明](/faq/recharge-promotions)。

## 总结与建议

DeepSeek-V4-Flash-0731 是一次「只改后训练但效果显著」的更新。从我们的实测看，
它的强项非常明确：**长上下文、隐式缓存、并发吞吐**——32 万 tokens 15 秒返回、
二轮缓存命中 99.9%、20 并发零限流，这三项配合 \$0.14 的输入价，
做长文档处理和高并发文本任务的性价比很高。

同时要清楚它现在的边界：**这是一个纯文本模型**，不吃图片，也没开 Anthropic 端点，
接不了 Claude Code。结构化输出在两个端点上都不生效，`reasoning_effort` 不是个可靠旋钮，
联网搜索和 MCP 目前也取不到结果。这些不是缺陷描述，而是接入前需要知道的事实——
知道了就能绕开，不知道就会在联调时浪费半天。

选型建议：**日常高并发问答、长文档、多轮长会话、轻量工具调用 agent 选正式版**；
**需要 Claude Code 接入选 `deepseek-v4-flash`**。

<Info>
  数据来源与获取日期：API易 实测（2026-08-05，21 个用例 + 三方对照 + 思考档位专项

  * Responses 端点专项复测）；基准分数为厂商自评，来自
    `huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731`；V4 预览版背景信息来自
    `api-docs.deepseek.com/news/news260424`。基准数据目前无第三方复现，
    请结合自身场景实测后再做选型决策。
</Info>

<Note>
  **更正说明**：本文首发时曾记录「Responses 端点未接通」，该现象为渠道侧配置问题，
  已于 2026-08-05 当日修正。复测后 Responses 全面可用、显式缓存正常，相关章节已更新。
</Note>
