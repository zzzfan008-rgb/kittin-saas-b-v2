> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max 上线，挂牌价比官网低 17.5％

> 阿里通义千问旗舰 Qwen3.8-Max 发布当天上架：2.4T 参数稀疏 MoE、1M 上下文、131K 最大输出，原生支持图片与视频输入。挂牌 $1.65/$4.95 每 1M tokens，官网为 $2/$6。上线前完成 586 次实测调用，端点支持与接入注意事项已同步整理。

**2026/8/3 22:44 (UTC+8)** · 新模型 · Alibaba

🚀 **Qwen3.8-Max 上线，挂牌 \$1.65/\$4.95 每 1M tokens，比官网低 17.5％**

阿里通义千问 8 月 3 日发布的新一代旗舰，当天上架。2.4T 参数稀疏 MoE，**1M 上下文** + 131K 最大输出 + 262K 最大思考预算，原生支持图片与视频输入。官方基准 GPQA Diamond **92.6**、PaperBench **93.0**、Terminal-Bench 2.1 86.6、SWE-bench Pro 67.7，FrontierSWE 由上代 40.7 升至 **73.5**——这一代的提升主要在 Agent 与多模态，不在纯推理分数。

定价方面，输入 \$1.65、输出 \$4.95，缓存读 \$0.20625、缓存写 \$2.0625（每 1M tokens）。阿里云官网为 \$2/\$6，**低 17.5％**，可叠加[充值活动](/faq/recharge-promotions)继续下探。

上线前我们跑了 **586 次实测调用**，三个端点当前状态如下：

* `/v1/chat/completions`：完整可用，工具调用、结构化输出、多模态、流式均已验证
* `/v1/messages`：代码集成可用，回传历史消息前需剥掉 `thinking` 块；Claude Code 等现成客户端因无法改变其回显行为，暂不可用
* `/v1/responses`：暂不支持，已反馈渠道方

接入时有三点需要注意。其一，**思考默认开启**（默认 `xhigh` 档），日常对话建议显式设 `reasoning_effort="none"`，实测输出可从约 158 tokens 降到 5 tokens。其二，**`max_tokens` 不约束思考 token**——实测设 `max_tokens=1` 仍被计 1054 个输出 token，控成本请用 `reasoning_effort`。其三，需要 `tool_choice` 强制调用或 `n > 1` 时，必须同时设 `reasoning_effort="none"`，否则报 400 或静默失效。

完整的能力矩阵、基准数据与代码示例见 [Qwen3.8-Max 上线说明](/news/qwen-3-8-max-launch)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
