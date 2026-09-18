> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-6-astra 上线，OpenAI 新旗舰开放调用

> OpenAI 9 月 3 日发布的新一代旗舰 GPT-6 Astra 已在 API易 上架，default / svip 分组均可调用。定价输入 $10 / 输出 $50 每百万 tokens，缓存读取 $1，四项计费与官网一致；1.05M 上下文，推理力度新增 xhigh / max 共五档。

**2026/9/5 09:51 (UTC+8)** · 新模型 · OpenAI

🚀 **`gpt-6-astra` 已上线，`default` / `svip` 分组均已开放调用**

OpenAI 9 月 3 日发布的新一代旗舰，官方定位是电脑操作、软件工程与长程 Agent 任务。规格：1,050,000 上下文、128,000 最大输出、知识截止 2026 年 4 月 30 日；`reasoning_effort` 新增 `xhigh` / `max`，共五档可调。

定价与官网标准档逐项一致：输入 \$10 / 输出 \$50 每百万 tokens，缓存读取 \$1、缓存创建 \$12.50。是 `gpt-5.6-sol` 现行优惠价的 2.5 倍，与 Claude Fable 5.1 的输入、输出价持平。`/v1/responses` 与 `/v1/chat/completions` 两个端点均已开放，电脑操作、托管 Shell、异步函数调用等本代新能力走 Responses；从 5.6 Sol 迁移只改 `model` 字段。

两点提醒：Astra 的网络安全能力被 OpenAI 划为 Critical 级，**标准公开版会拒绝漏洞挖掘、漏洞利用代码编写类任务**，常规开发不受影响；与官网一致按输入 tokens 分两档阶梯计费，单次输入超过 272K 后整单按第二档计（输入 \$20、缓存读取 \$2、缓存创建 \$25），具体以模型价格页实时数据为准。

📖 基准数据、选型与迁移建议：[GPT-6 Astra 上线：OpenAI 新旗舰开放调用](/news/gpt-6-astra-launch)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
