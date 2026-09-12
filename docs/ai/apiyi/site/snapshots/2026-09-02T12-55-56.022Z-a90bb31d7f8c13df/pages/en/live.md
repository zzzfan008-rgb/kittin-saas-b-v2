> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Live Updates

> Real-time model status, industry news, and service updates from APIYI

<Update label="2026/9/2 20:37" description="Service Notice" tags={["ByteDance", "Service Notice"]}>
  🚀 **iCover AI has been updated — SeeDance 2.5 is now selectable right in the model dropdown** —— at `icover.ai/zh/seedance-official`, SeeDance 2.5 (`doubao-seedance-2-5-260628`) now sits alongside 2.0, and all four task types (text-to-video, first frame, first/last frame, multimodal) plus aspect ratio, resolution and duration run with no code. For reference media, ingest into the asset library first and reference the `asset://` ID: the request body shrinks to a few dozen bytes, create-task returns immediately, and asset IDs stay reusable across tasks for character consistency.

  📖 [View details](/en/live/2026-09/icover-seedance-2-5-online)
</Update>

<Update label="2026/9/2 19:45" description="Docs Update" tags={["OpenAI", "Docs Update"]}>
  📖 **On GPT-5.4+, tool calling with an explicit reasoning effort can be rejected on the chat endpoint** — a request carrying `tools` while explicitly sending a non-`none` `reasoning_effort` gets a 400: `Function tools with reasoning_effort are not supported ...`. All four effort levels trigger it, omitting the parameter does not, and whether it fires depends on the upstream route — so "it worked last time" is not evidence you are safe. Move tool-carrying requests to `/v1/responses`, or set `reasoning_effort="none"`. A new migration guide is up.

  📖 [View details](/en/live/2026-09/gpt-5-6-tools-responses-migration)
</Update>

<Update label="2026/9/2 11:54" description="Docs Update" tags={["ByteDance", "Docs Update"]}>
  📊 **When a Seedance call carries media, it is submission that is slow, not generation** — your media travels upstream to APIYI, then on to Volcengine to be decoded and validated before the task ID comes back; inline Base64 stretches a one-second submission into tens of seconds, and one customer still got nothing at a 300-second read timeout. Ingest first and reference an `asset://` asset ID: the body shrinks to a few dozen bytes, the task ID returns immediately, and content checks move up to ingest time. A new how-to page is now live.

  📖 [View details](/en/live/2026-09/seedance2-asset-first-workflow)
</Update>

<Update label="2026/9/2 11:16" description="New Model" tags={["Anthropic", "New Model"]}>
  🚀 **`claude-fable-5-1` is live: cache reads fall from \$1.00 to \$0.25, and APIYI has matched the cut** — Anthropic's new Mythos-class flagship, shipped 1 September, alongside `claude-fable-5-1-thinking`. The cache read price is the headline change this generation; input \$10 / output \$50 per 1M tokens are unchanged, and **our pricing matches the provider line for line**. A 1M token context window, 128k max output, and availability across the `default` / `svip` / `ClaudeCode` groups on both endpoints. Check three breaking changes before migrating: forced tool use returns 400, thinking blocks are model-bound, and editing earlier turns invalidates them.

  📖 [View details](/en/live/2026-09/claude-fable-5-1-launch)
</Update>

<Update label="2026/8/31 11:20" description="Price Update" tags={["ByteDance", "Price Update"]}>
  🗂️ **Seedance 2.5 and the 2.0 family share the `SeeDance2` group (0.18x) — one token covers all four models** — all four sit under one group for simpler management, with no separate token for 2.5 and no change to model name, endpoint or code. Measured rates come in two tiers: \$12.60 per million tokens with no video in the input (480p / 720p / 1080p alike), and a lower \$7.56 when the input contains video (multi-modal reference, video editing / extension).

  📖 [View details](/en/live/2026-08/seedance-2-5-group-merge)
</Update>

<Update label="2026/8/28 11:21" description="New Model" tags={["ByteDance", "New Model"]}>
  🚀 **Seedance 2.5 is live — `doubao-seedance-2-5-260628`** —— The endpoint and request shape are identical to 2.0, so changing the `model` field is the whole migration. The duration cap rises from 15 to **30 seconds** and reference images from 9 to **30**, audio can stand alone as a reference, and it adds `mov` output plus explicit video edit/extend task types; resolutions are 480p / 720p / 1080p with no 4k. Note that `duration` defaults to `-1`, so omitting it can double what you pay. **Its group and pricing changed on 8/30 — see the entry above.**

  📖 [View details](/en/live/2026-08/seedance-2-5-launch)
</Update>

<Update label="2026/8/26 13:15" description="Model Status" tags={["OpenAI", "Model Status"]}>
  ✅ **`gpt-image-2-vip` is back to normal speed, so you can push concurrency again** —— Yesterday afternoon's saturation has cleared: in today's 13:13–13:14 (UTC+8) logs, non-streaming time-to-first-byte sits mostly at 37–55 seconds (a few at 66–71), back to everyday levels after yesterday's 82–190 seconds, so the temporary advice to hold concurrency down no longer needs to be kept. The provider has also restored 4K output and `quality` (`low` / `medium` / `high`) on both the generation and editing endpoints, billed at \$0.03 per request.

  📖 [View details](/en/live/2026-08/gpt-image-2-vip-speed-recovered)
</Update>

<Update label="2026/8/25 18:45" description="New Model" tags={["New Model"]}>
  🚀 **`bge-m3` is back at \$0.01 / 1M tokens, with a measured tuning guide alongside it** —— BAAI's open-source multilingual embedding model: 1024 dims, 8192 context, 100+ languages, at half the unit price of `text-embedding-3-small`; measured Chinese retrieval is in the same tier while consuming only 42% of the tokens, which lands the same corpus at about one fifth the spend. Two traps: its scores sit \~0.13 higher than OpenAI's, so old thresholds must be recalibrated; and LangChain needs `check_embedding_ctx_length=False`, or Chinese Recall\@1 drops from 80% to 15%.

  📖 [View details](/en/live/2026-08/bge-m3-relaunch)
</Update>

<Update label="2026/8/25 15:49" description="Model Status" tags={["OpenAI", "Model Status"]}>
  ⚠️ **`gpt-image-2-vip` is running saturated: retry on 429, skip retries on content-safety blocks** —— traffic is high this afternoon and non-streaming time-to-first-byte is measuring 82–190 seconds. To stop a single call from blocking you that long we lowered the gateway's internal retry count and handed the decision back to you: 429 is transient congestion and usually goes through on retry, while a content-safety block is a provider policy verdict that will not change. Retries can go to `-vip` or to the official-relay `gpt-image-2`, which is running normally.

  📖 [View details](/en/live/2026-08/gpt-image-2-vip-429-retry)
</Update>

<Update label="2026/8/25 00:45" description="Model Status" tags={["OpenAI", "Model Status"]}>
  ✅ **`gpt-image-2-vip` recovered at 00:45 (UTC+8) on 25 August** —— the provider-side abuse controls and rate limiting that began at 20:30 (UTC+8) last night have ended; failure rates and image latency are back to their usual levels, and 2K / 4K with precise `size` control works normally. For teams whose main endpoint is `-vip`, our standing advice is to also wire up the official-relay `gpt-image-2` as a second channel with failover in code — consumer-facing products can expose both and let the end user choose.

  📖 [View details](/en/live/2026-08/gpt-image-2-vip-recovered)
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
