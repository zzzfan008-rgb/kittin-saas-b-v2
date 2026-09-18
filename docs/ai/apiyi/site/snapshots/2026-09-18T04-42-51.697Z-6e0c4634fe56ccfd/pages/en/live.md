> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Live Updates

> Real-time model status, industry news, and service updates from APIYI

<Update label="2026/9/18 11:19" description="Docs Update" tags={["ByteDance", "Docs Update"]}>
  📚 **Seedance image link opens in a browser but submission fails with `invalid image format`? The link is the problem, not the image** —— Links from application endpoints with download caps, no `Range` support, or short expiry return an error instead of the image when the provider fetches them. The new FAQ explains how to choose how to pass images (a public URL first) and how to check a link with curl. See [Image Link Opens but Fails](/en/faq/seedance-image-url-invalid-format).

  📖 [View details](/en/live/2026-09/seedance-image-url-invalid-format)
</Update>

<Update label="2026/9/17 19:47" description="Docs Update" tags={["ByteDance", "Docs Update"]}>
  📚 **Seedance 2.5 returns a 400 when you set an aspect ratio and duration? The task was most likely classified as video editing** —— With a reference video, 2.5 uses prompt intent to pick reference-to-video, video editing, or video extension. Editing requires `ratio` to be `adaptive` and `duration` to be `-1`, and no parameter can lock a task to reference-to-video. The new FAQ covers the rules and three reliable approaches: [Reference-to-Video vs. Video Editing](/en/faq/seedance2-reference-vs-edit).

  📖 [View details](/en/live/2026-09/seedance2-reference-vs-edit)
</Update>

<Update label="2026/9/17 18:00" description="Model Status" tags={["OpenAI", "Model Status"]}>
  ✅ **The image generation failures on `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` between 15:30 and 16:00 (UTC+8) on 9/17 have been resolved** —— During that window some requests returned `Upstream model service error. Try again later.` The cause was backend resource fluctuation, not a parameter error or a content-safety block. No code or prompt changes are needed; simply resubmit any tasks that failed at the time.

  📖 [View details](/en/live/2026-09/gpt-image-2-5-upstream-error-recovered)
</Update>

<Update label="2026/9/16 01:10" description="Service Notice" tags={["xAI", "Service Notice"]}>
  🔒 **The Grok Imagine image models are fully integrated but not open by default — access requires the dedicated `Grok_imagine` group** —— The content-safety policy of `grok-imagine-image` / `grok-imagine-image-quality` differs substantially from other models on the platform and some categories are not filtered, so access is now granted selectively: customers with \$1,000+ cumulative spend can ask support to enable it, everyone else applies through [WeCom support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) describing their use case and content-moderation controls. A Token without the group returns `503` — permissions, not an outage.

  📖 [View details](/en/live/2026-09/grok-imagine-image-restricted-access)
</Update>

<Update label="2026/9/15 17:09" description="Model Status" tags={["OpenAI", "Model Status"]}>
  ⚠️ **The `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` reverse routes are still short on supply and unavailable for now; `gpt-image-2-vip` remains in service and stable** —— For GPT Image 2.5 use the official `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` models (without `-vip`), which bill by token usage rather than per image; follow the [docs](/en/api-capabilities/gpt-image-2/overview) to integrate. If you do not need strict `size` control or 2K / 4K, the ChatGPT-web reverse `gpt-image-2.5-all` is also running normally.

  📖 [View details](/en/live/2026-09/gpt-image-2-5-vip-supply-gap)
</Update>

<Update label="2026/9/15 01:11" description="Docs Update" tags={["OpenAI", "Docs Update"]}>
  🧩 **The community ComfyUI pack `Comfyui-Luck-gpt2.0` now supports `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`, and our docs page is rewritten to match** —— Author luckdvr's 9/10 update adds both 2.5 models and dated snapshots to the official node's `model (模型)` dropdown, grows `quality` to six tiers (new `xhigh` / `max`), and takes 16 reference images plus a mask; node names and the default model are unchanged, existing workflows do not switch on their own, and `quality` should not be carried over as-is (2.5 `high` ≈ old `medium`). The docs page now covers the `gpt-image-2-vip` node, three prompt-control nodes and a five-model table, see [Luck GPT-Image 2 - ComfyUI Nodes](/en/scenarios/ecosystem/luckgpt2-comfyui).

  📖 [View details](/en/live/2026-09/luck-gpt-image-2-comfyui-gpt-image-2-5)
</Update>

<Update label="2026/9/14 23:56" description="Docs Update" tags={["OpenAI", "Docs Update"]}>
  📚 **400 `safety_violations=[sexual]` on a prompt that is not explicit? Usually the rendered image was rejected by an output-side classifier, not the prompt** —— On `gpt-image-2.5-sunburst` failed calls took as long as successful ones, the same prompt passed sometimes and failed sometimes, and `moderation: low` did nothing; the web app passes because its chat model rewrites the prompt and fills in clothing and setting for you. A 20-call word ablation found the trigger, and adding one clothing phrase to the otherwise unchanged prompt passed 3 of 3. Full case and checklist in the new [Safety Rejections](/en/api-capabilities/image-safety-troubleshooting) page.

  📖 [View details](/en/live/2026-09/image-safety-troubleshooting)
</Update>

<Update label="2026/9/14 13:30" description="New Model" tags={["OpenAI", "Alibaba", "New Model"]}>
  🚀 **Four Realtime voice models are out of private beta — select the default group on your key and call directly; test, explore and integrate freely** — `gpt-realtime-2.1` / `-mini` (OpenAI GA protocol) and `qwen3.5-omni-plus-realtime` / `-flash-realtime` (Model Studio protocol) share the single `wss://api.apiyi.com/v1/realtime` endpoint, are carried by the default, VIP and SVIP groups, and are billed per token at vendor list prices; the 9/14 re-test succeeded on 120 of 120 sessions at 40 concurrent. Cached input is billed at full price for now and only WebSocket is supported — see the [Realtime voice overview](/en/api-capabilities/realtime/overview), and tell us about any documentation gaps.

  📖 [View details](/en/live/2026-09/realtime-models-launch)
</Update>

<Update label="2026/9/12 16:25" description="Docs Update" tags={["Anthropic", "Docs Update"]}>
  📚 **Long-form output (drama scripts, 10k-word writing) should stream, not use non-streaming** —— for a 10k-word output, 10-20 minutes of real generation is normal; non-streaming buffers the whole thing and races your read timeout, so you often get nothing. With streaming a data event arrives every few tens of seconds (measured max silent gap during thinking \~42s, with keepalives), so a read timeout of 90-120s sized to the inter-event gap is enough. Give `max_tokens` room and treat `stop_reason=end_turn` as success.

  📖 [View details](/en/live/2026-09/long-form-output-practices)
</Update>

<Update label="2026/9/12 14:32" description="Service Notice" tags={["Service Notice"]}>
  ⚠️ **The Account Center now has a Login Devices feature; users signed in before the upgrade may see a 403 message, and signing out and back in clears it** —— after the 12 September system upgrade, old login sessions fail validation under the new feature, so opening the Account Center shows `Error: AxiosError: Request failed with status code 403`. This only affects the Account Center page and does not affect API calls, Keys or balances. Sign out of your account in the current browser and sign in again to clear it.

  📖 [View details](/en/live/2026-09/console-login-devices-403)
</Update>

***

> 📖 For earlier updates, visit the [Live Updates Archive](/en/live/archive) — browse history by month, category, or vendor.

<CardGroup cols={3}>
  <Card title="Deep Dive" icon="newspaper" href="/en/news/gemini-3-1-flash-lite-launch" horizontal>
    AI Radar
  </Card>

  <Card title="Telegram" icon="telegram" iconType="brands" href="https://t.me/apiyinews" horizontal>
    Global users
  </Card>

  <Card title="Media Models" icon="images" href="/en/api-capabilities/image-video-models" horizontal>
    New additions
  </Card>
</CardGroup>
