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

<Update label="Aug 21, 2026 · Transparent Backgrounds on gpt-image-2" description="Feature Update · OpenAI">
  ### Transparent Backgrounds on gpt-image-2

  **One Parameter, Real Alpha-Channel PNGs**

  OpenAI opened up the `transparent` value of `background` for GPT-Image-2, and APIYI has verified it. Pass `background: "transparent"` with `png` or `webp` to get a genuinely transparent image; text-to-image, image editing, and the Responses image tool all support it, at no extra cost. `jpeg` has no alpha channel and is mutually exclusive with transparency.

  📖 [Read details](/en/live/2026-08/gpt-image-2-transparent-background) | 🔗 [Transparency FAQ](/en/faq/image-transparent-background)
</Update>

<Update label="Aug 15, 2026 · DeepSeek Price Change" description="Price Update · DeepSeek">
  ### DeepSeek Price Change

  **Peak/Off-Peak Upstream, Peak Tier at APIYI**

  DeepSeek switches to two-tier billing at 00:00 on 17 August (UTC+8), with off-peak at half the peak rate. APIYI follows for `deepseek-v4-flash` and `deepseek-v4-pro` but bills **at the peak tier at all times**: \$0.44/\$1.32 and \$1.32/\$3.96 per 1M tokens. The reason is supply — official capacity shortfalls are covered by the pricier BytePlus and Alibaba Cloud routes, at no margin. Recharge bonuses still stack.

  📖 [Read details](/en/news/deepseek-price-increase-2026-08) | 🔗 [Promotions](/en/faq/recharge-promotions)
</Update>

<Update label="Aug 14, 2026 · Gemini 3.7 Flash Is Live" description="New Model · Google">
  ### Gemini 3.7 Flash Is Live

  **Official Price, Half of What the Previous Gen Costs**

  Google's next-gen Flash workhorse, shipped 13 August. Coding and agents lead the upgrade: DeepSWE v1.1 climbs 48.6% → **65.3%**, business-process automation 17.0% → **30.4%**. 1M context, three thinking tiers, priced at \$0.75/\$3.75 per 1M tokens matching Google — a limited-time promotional rate that reverts to \$1.50/\$7.50 after 31 December.

  📖 [Read details](/en/news/gemini-3-7-flash-launch) | 🔗 [Top-up promotions](/en/faq/recharge-promotions)
</Update>

<Update label="Aug 13, 2026 · Grok 4.6 Is Live" description="New Model · xAI">
  ### Grok 4.6 Is Live

  **Official Price, 20% Off on Group**

  xAI's new flagship, shipped 7 August, reuses Grok 4.5's 1.5T-parameter base — the entire gain comes from heavier SFT and reinforcement learning: the **Artificial Analysis Intelligence Index rises from 56 to 61**, level with GPT-5.6 Sol Max. 500K context, both endpoints, priced at \$2/\$6 per 1M tokens matching xAI; the `GrokOfficial` group runs at 0.8x, bringing input as low as \$1.33 with deposit bonuses.

  📖 [Read details](/en/news/grok-4-6-launch) | 🔗 [Integration docs](/en/api-capabilities/grok/overview)
</Update>

<Update label="Aug 12, 2026 · Grok Imagine 2 Image Models Launch" description="New Model · xAI">
  ### Grok Imagine 2 Image Models Launch

  **From \$0.02 per Image**

  xAI's second-generation image models. `grok-imagine-image` at **\$0.02/image** and `grok-imagine-image-quality` at **\$0.045/image**, billed flat per request regardless of resolution — xAI charges \$0.07 for quality at 2K, so our flat \$0.045 lands at about 64% of list. Five aspect ratios × 1K/2K all take effect, up to 10 images per call, callable on the `Default` group.

  📖 [Read details](/en/news/grok-imagine-2-launch) | 🔗 [Integration docs](/en/api-capabilities/grok-imagine-image/overview)
</Update>

<Update label="Aug 8, 2026 · Seedance 2.0 mini / fast Price Cut" description="Price Update · ByteDance">
  ### Seedance 2.0 mini / fast Price Cut

  **mini Down 44.4%**

  Two new single-model groups: `SD2Mini` (**0.10x**, mini only) and `SD2Fast` (**0.15x**, fast only). Against the 0.18x `SeeDance2` group that is **44.4% off mini and 16.7% off fast** — at 720p/5s, mini drops from ¥3.16 to **¥1.75**. Capabilities and call syntax are unchanged; just create a token on the right group. **Runs through 7 September, 23:59 (UTC+8)**.

  📖 [Read details](/en/live/2026-08/seedance2-cheap-groups) | 🔗 [Groups and pricing](/en/api-capabilities/seedance2/overview)
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
