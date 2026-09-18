> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 长文输出实战：漫剧脚本、万字创作用流式，别用非流式

> 新增《长文输出实战建议》文档。大模型出万字长文真实生成 10～20 分钟是常态，非流式要整段攒齐才回写、客户端 read timeout 与之竞速容易拿不到结果；改用流式并把 read timeout 按事件间隔设即可稳定拿到结果。

**2026/9/12 16:25 (UTC+8)** · 文档更新 · Anthropic

📚 **长文输出（漫剧脚本、文学创作、万字长文）用流式，别用非流式**

大模型一次产出上万字，真实生成 10～20 分钟是常态。非流式要把整段攒齐才回写，客户端 read timeout 与之竞速，生成越久越容易在拿到结果前先断开。改用流式后首字节几秒内到达、之后每隔几十秒必有数据事件（实测 `claude-opus-5` 思考阶段最大静默约 42 秒且期间有 keepalive），read timeout 按事件间隔设 90～120 秒即可，不必设成覆盖整段生成的巨大值。

配套要点：`max_tokens` 给足（64000 起步，思考会挤占预算），拿到响应先看 `stop_reason`，`end_turn` 才算成功、`max_tokens` 是被截断要调大重试。

完整做法（流式代码、三段式超时、重试策略、场景速查表）见新页《长文输出实战建议》：`/api-capabilities/long-form-output-practices`。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
