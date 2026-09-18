> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code 超高缓存命中率，单次调用低至 \$0.08

> 实测 Claude Opus 在 Claude Code 场景下缓存命中率极高，连续多次调用单价稳定在 \$0.08–0.12 区间（含 0.95x 分组折扣），长上下文反复调用、大段代码 review 都能命中缓存，综合成本远低于按 token 直算。

**2026/5/3 22:40 (UTC+8)** · 行业快讯 · Anthropic

🚀 **Claude Code 超高缓存命中率，等你来用\~** —— 实测 `claude-opus-4-7` 在 Claude Code 场景下缓存命中率极高，连续多次调用单价稳定在 \$0.08–0.12 区间（已含 `ClaudeCode` 分组 0.95x 折扣），首字节多在 1–4 秒。长上下文反复调用、大段代码 review、多轮对话都能命中缓存，综合成本远低于按 token 直算。

🔐 **资源说明**：本站 Claude Code 通道直连 Anthropic 官方 KEY（T4 等级）+ AWS Bedrock 高配额大账户，专做 Claude 官转资源 API，**非逆向**——稳定性、配额、缓存命中机制与官方上游一致，长跑业务可放心接入。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_VzXicItDKpC5c0P/images/claude-code-cache-hit-log.png?fit=max&auto=format&n=_VzXicItDKpC5c0P&q=85&s=090af11dce1008cbcf3fac126659474c" alt="Claude Code 调用日志：单次约 $0.08–0.12，0.95x 折扣" width="1642" height="1600" data-path="images/claude-code-cache-hit-log.png" />
</Frame>

📖 接入指南：[/scenarios/programming/claude-code](/scenarios/programming/claude-code)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
