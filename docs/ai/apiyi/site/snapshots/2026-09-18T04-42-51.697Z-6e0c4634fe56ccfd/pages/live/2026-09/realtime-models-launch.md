> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 4 款 Realtime 实时语音模型上架，默认分组直接调用

> gpt-realtime-2.1、gpt-realtime-2.1-mini、qwen3.5-omni-plus-realtime、qwen3.5-omni-flash-realtime 结束内测正式上架，令牌勾选默认分组即可走 wss 端点，VIP / SVIP 分组同样可用。按厂商官方价逐 token 计费，40 路并发实测 120/120 成功。欢迎测试、体验与对接，文档缺漏欢迎反馈。

**2026/9/14 13:30 (UTC+8)** · 新模型 · OpenAI / Alibaba

🚀 **4 款 Realtime 实时语音模型结束内测正式上架，令牌勾选默认分组即可直接调用，欢迎测试、体验与对接**

四款共用一条端点 `wss://api.apiyi.com/v1/realtime?model=<模型名>`、一把令牌，default / VIP / SVIP 分组均已挂载：

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini`：OpenAI Realtime GA 协议原样透传（含 `reasoning.effort`、`semantic_vad` 等新字段），音频 \$32 / \$64 与 \$10 / \$20 每百万 tokens
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime`：阿里云百炼协议，中文场景，文本+音频输出 \$41.26 与 \$14.71 每百万 tokens

文本、音频、图片三类 token 按厂商官方价逐笔计费，分组倍率 1。9/14 复测 GA 两款 20 路与 40 路并发共 120 路会话全部成功，握手与首个文本增量 p50 约 1 秒，空闲 5 分钟不断线。

两条口径请先看：缓存读命中会在 `usage` 里如实回显，但站内**暂按文本输入全价计费**，修复后另行公告；站内**只支持 WebSocket 直连**，`client_secrets` / WebRTC / SIP 端点返回 404，浏览器与移动端请走后端中继。两套协议的字段对照、文本冒烟脚本与全部已知限制见 [Realtime 语音概览](/api-capabilities/realtime/overview)——文档有缺漏或与你的实测不符，欢迎直接反馈。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
