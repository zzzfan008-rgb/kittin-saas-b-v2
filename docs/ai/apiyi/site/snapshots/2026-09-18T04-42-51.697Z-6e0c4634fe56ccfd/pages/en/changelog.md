> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Website Announcements

> APIYI product updates, model launches, pricing changes and other announcements

Welcome to the APIYI changelog. This is where we announce new model launches, pricing changes, and feature updates. We're committed to giving you the most capable AI services at the best value.

<Note>
  **Bookmark this page**: press Ctrl+D to keep it handy — new model launches and promotions are announced here first.
</Note>

## 🔥 Latest Updates

<Update label="Sep 14, 2026 · Four Realtime Voice Models Are Live" description="New Model · OpenAI / Alibaba">
  ### Four Realtime Voice Models Are Live

  **Default Group, Vendor List Prices, Feedback Welcome**

  `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` (OpenAI GA protocol) and `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime` (Model Studio protocol) are out of private beta: select the default group on your key and connect to `wss://api.apiyi.com/v1/realtime`; VIP and SVIP groups carry them too. Text, audio and image tokens are billed at vendor list prices (2.1 audio \$32/\$64, mini \$10/\$20); 120 of 120 sessions succeeded at 40 concurrent. Cached input is billed at full price for now and only WebSocket is supported — tell us about any documentation gaps.

  📖 [Realtime voice overview](/en/api-capabilities/realtime/overview) | ⚡ [Live update](/en/live/2026-09/realtime-models-launch)
</Update>

<Update label="Sep 9, 2026 · GPT-image-2.5 Dual Models Are Live" description="New Model · OpenAI">
  ### GPT-image-2.5 Dual Models Are Live

  **Flare Is Faster, Sunburst Is Sharper, Same Price as gpt-image-2**

  OpenAI's next-gen image models, released 8 September, are live via the official relay: `gpt-image-2.5-flare` is speed-first with up to **50%** lower latency than `gpt-image-2`; `gpt-image-2.5-sunburst` is quality- and editing-first. `quality` gains `xhigh` / `max`, pricing stays at \$5/\$8/\$30 per 1M tokens, in the `Default` / `image2Enterprise` groups. The reverse-engineered `gpt-image-2.5-all` ships alongside at an unchanged \$0.03 per image.

  📖 [Read details](/en/news/gpt-image-2-5-launch) | 🔗 [Promotions](/en/faq/recharge-promotions)
</Update>

<Update label="Sep 8, 2026 · GLM-5.3 and GLM-5.3-Flash Are Live" description="New Model · Zhipu">
  ### GLM-5.3 and GLM-5.3-Flash Are Live

  **Zhipu's Coding Flagship and Multimodal Lite, at Official Price**

  Zhipu's two August releases arrive together: `glm-5.3` keeps the 753B MoE base and scales post-training only, gaining **50%** over 5.2 on Z.ai Code Bench; `glm-5.3-flash` is the first natively multimodal GLM-5, scoring **84.3** on Terminal-Bench 2.1, within reach of Claude Opus 4.8. Priced item for item with Zhipu's official rates — the flagship at \$1.40 in / \$4.396 out, Flash at \$0.15 in / \$0.50 out per 1M tokens — in the `default` / `svip` groups, with recharge bonuses bringing the effective cost to roughly 83%–91% of list.

  📖 [Read details](/en/news/glm-5-3-launch) | 🔗 [Promotions](/en/faq/recharge-promotions)
</Update>

<Update label="Sep 5, 2026 · GPT-6 Astra Is Live" description="New Model · OpenAI">
  ### GPT-6 Astra Is Live

  **OpenAI's New Flagship for Computer Use and Long-Horizon Agents, at Official Price**

  OpenAI's next-gen flagship, released 3 September: 1.05M context, five reasoning-effort levels with new `xhigh` / `max`, Terminal-Bench 4.0 up from 37.3% to **57.9%**. Priced at \$10 in / \$50 out per 1M tokens with \$1 cached reads, **matching OpenAI's list price item for item**, in the `default` / `svip` official-relay groups, with the `Codex_Reverse` group at a 0.5x discount.

  📖 [Read details](/en/news/gpt-6-astra-launch) | 🔗 [Promotions](/en/faq/recharge-promotions)
</Update>

<Update label="Sep 3, 2026 · GPT-5.6 Sol Price Cut Synced" description="Price Update · OpenAI">
  ### GPT-5.6 Sol Price Cut Synced

  **Input Down 20%, Output Down 33%, Now Cheaper Than gpt-5.5**

  OpenAI cut GPT-5.6 Sol pricing on 3 September and APIYI has synced: `gpt-5.6-sol` now costs **\$4** input (was \$5) and **\$20** output (was \$30) per 1M tokens, cached reads \$0.40, with the limited-time promotional rate guaranteed at least through 21 November 2026. The flagship tier is now cheaper than the previous-generation `gpt-5.5` (\$5 / \$30); existing code migrates by changing only the `model` field.

  📖 [Read details](/en/live/2026-09/gpt-5-6-sol-price-cut) | 🔗 [Model details](/en/models/gpt-5-6-sol)
</Update>

<Update label="Sep 2, 2026 · Gemini 3.8 Flash Is Live" description="New Model · Google">
  ### Gemini 3.8 Flash Is Live

  **Ahead of the Docs, Same Price as 3.7**

  Google's newest Flash, out 2 September. **Google's own model docs and launch blog have not listed it yet**; APIYI has it open for calls. Priced line-for-line with `gemini-3.7-flash` at \$0.75 in / \$3.75 out per 1M tokens, so migrating costs nothing. **150 paired test cases across both protocols** found capability parity with 3.7 and no regression unique to it.

  📖 [Read details](/en/news/gemini-3-8-flash-launch) | 🔗 [Promotions](/en/faq/recharge-promotions)
</Update>

<Update label="Sep 2, 2026 · Claude Fable 5.1 Is Live" description="New Model · Anthropic">
  ### Claude Fable 5.1 Is Live

  **Same Price, Cache Reads Cut to a Quarter**

  Anthropic's new Mythos-class flagship, shipped 1 September. The headline change is cache reads falling from \$1.00 to **\$0.25 per 1M tokens**, with input at \$10 and output at \$50 unchanged. APIYI has matched the cut — **every line item is priced in line with the provider**. Three breaking changes: forced tool use now 400s, thinking blocks are model-bound, and editing earlier turns invalidates them.

  📖 [Read details](/en/news/claude-fable-5-1-launch) | 🔗 [Promotions](/en/faq/recharge-promotions)
</Update>

<Update label="Aug 31, 2026 · Seedance 2.5 and the 2.0 Family Share One Group" description="Price Update · ByteDance">
  ### Seedance 2.5 and the 2.0 Family Share One Group

  **A Single Token Covers All Four Models**

  All four models — 2.5 plus the 2.0 standard / fast / mini — now sit on the **`SeeDance2` group (0.18x)**, reachable from a single token with no separate token for 2.5 and no code changes. Measured rates come in two tiers: \$12.60 per million tokens with no video in the input (480p / 720p / 1080p alike), and a lower \$7.56 when the input contains video (multi-modal reference, video editing / extension).

  📖 [Read details](/en/live/2026-08/seedance-2-5-group-merge) | 🔗 [Groups and pricing](/en/api-capabilities/seedance2/overview)
</Update>

<Update label="Aug 28, 2026 · Seedance 2.5 Is Live" description="New Model · ByteDance">
  ### Seedance 2.5 Is Live

  **30-Second Clips, 30 Reference Images, A Broad Capability Jump**

  The model is `doubao-seedance-2-5-260628`, with an endpoint and request shape identical to 2.0 — **changing the `model` field is the whole migration**. The duration cap rises from 15 to **30 seconds** and reference images from 9 to **30**, audio can stand alone as a reference, and it adds `mov` output plus explicit video edit/extend task types. **For current group and pricing, see the 31 August entry above.**

  📖 [Read details](/en/live/2026-08/seedance-2-5-launch) | 🔗 [Capabilities and pricing](/en/api-capabilities/seedance2/overview)
</Update>

<Update label="Aug 21, 2026 · DeepSeek Vision Model Is Live" description="New Model · DeepSeek">
  ### DeepSeek Vision Model Is Live

  **No Vision Premium, Priced Like Text-Only V4 Flash**

  `deepseek-v4-flash-vision-exp` is DeepSeek's first vision model, adding image input on top of the V4 Flash base while keeping the 1M context, thinking, function calling and caching. Images convert to input tokens by size and are **capped at 384 each**; pricing matches the text-only version at \$0.44 input and \$1.32 output per 1M tokens. Use a `default` group token for the OpenAI format and a `ClaudeCode` one for the Anthropic format.

  📖 [Read details](/en/live/2026-08/deepseek-v4-flash-vision-exp) | 🔗 [Integration docs](/en/api-capabilities/deepseek-v4-flash-vision/overview)
</Update>

***

> 📖 These are the 10 most recent announcements. For everything earlier, see the [announcement archive](/en/changelog/archive), browsable by month, category, or vendor.

<CardGroup cols={3}>
  <Card title="Deep dives" icon="newspaper" href="/en/news/gemini-3-7-flash-launch" horizontal>
    Browse the AI Radar section
  </Card>

  <Card title="Live updates" icon="radio-tower" href="/en/live" horizontal>
    Model status and service notices
  </Card>

  <Card title="Promotions" icon="gift" href="/en/faq/recharge-promotions" horizontal>
    See current deposit bonuses
  </Card>
</CardGroup>
