> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Four Realtime Voice Models Are Live in the Default Group

> gpt-realtime-2.1, gpt-realtime-2.1-mini, qwen3.5-omni-plus-realtime and qwen3.5-omni-flash-realtime are out of private beta: select the default group on your key and connect to the wss endpoint; VIP and SVIP groups carry them too. Billed per token at vendor list prices; 120 of 120 sessions succeeded at 40 concurrent. Feedback on documentation gaps is welcome.

**2026/9/14 13:30 (UTC+8)** · New Model · OpenAI / Alibaba

🚀 **Four Realtime voice models are out of private beta — select the default group on your key and call directly. Test, explore and integrate freely**

All four share one endpoint, `wss://api.apiyi.com/v1/realtime?model=<model>`, and one key; the default, VIP and SVIP groups all carry them:

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini`: OpenAI Realtime GA protocol passed through as is (including the newer `reasoning.effort` and `semantic_vad` fields); audio \$32 / \$64 and \$10 / \$20 per 1M tokens
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime`: Alibaba Model Studio protocol, tuned for Chinese; text+audio output \$41.26 and \$14.71 per 1M tokens

Text, audio and image tokens are billed per token at vendor list prices, group ratio 1. The 9/14 re-test ran the two GA models at 20 and 40 concurrent sessions, 120 of 120 succeeded, handshake and first text delta p50 about 1 second, and a session stayed alive through 5 minutes of silence.

Two things to know up front: cache hits are reported faithfully in `usage`, but APIYI **currently bills cached input at the full text-input rate** (a separate notice will follow once the discount is live); and **only direct WebSocket is supported** — `client_secrets`, WebRTC and SIP endpoints return 404, so browser and mobile clients should go through a backend relay. Field comparison for both protocols, the text smoke test and the full list of known limitations are in the [Realtime voice overview](/en/api-capabilities/realtime/overview) — if anything is missing or differs from what you measure, tell us.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
