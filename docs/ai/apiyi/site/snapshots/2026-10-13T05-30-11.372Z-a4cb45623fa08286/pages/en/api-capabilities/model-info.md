> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Popular Models

> View detailed information on 400+ supported AI models. Recommended popular and practical AI large models for you.

APIYI supports 400+ mainstream AI models. This page provides detailed model information, pricing, and usage instructions.

<Note>
  **Enterprise-grade Professional and Stable AI Large Model API Hub**
  All models are officially sourced and forwarded, with \~20% off pricing (combining top-up bonuses and exchange rate advantages), aggregating various excellent large models. No speed limits, no account ban risks, pay-as-you-go billing, long-term reliable service.
</Note>

## 🔥 Currently Recommended Models

The following are currently stably supplied popular models. For the complete model list and real-time pricing, visit the [APIYI Console Pricing Page](https://www.apiyi.com/account/pricing) or the on-site [Model Pricing Overview](/en/models).

<Warning>
  **Model Upgrade Recommendations**:  We recommend using the latest models for best performance, but please note:

  1. **Initial instability is common**: Newly launched models may experience slow responses, timeouts, or occasional errors due to limited compute capacity at the vendor — this typically stabilizes within days to weeks
  2. **Check parameter compatibility**: New models may introduce or change parameters (e.g., `max_completion_tokens` replacing `max_tokens`). Before upgrading, verify that your API parameters remain compatible with older models
  3. **Always test before going live**: Before deploying a new model to production, thoroughly validate it in a test environment to ensure output quality and API compatibility meet expectations
</Warning>

<Info>
  A "—" in the context column means the vendor has not published a definitive figure; refer to the console and official documentation. All prices are per 1M tokens (input/output) and can be combined with top-up bonuses.
</Info>

## Model Categories

### 🤖 OpenAI Series

#### 🆕 Latest Models

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **GPT-6 Astra** 🔥 | `gpt-6-astra` | 1.05M | 6-gen flagship built for computer use and long-horizon agents; five reasoning-effort tiers (adds `xhigh` / `max`), Terminal-Bench 4.0 **57.9%**, ScreenSpot-Pro 92.7%; \$10/\$50 | Top-tier agents, computer use, research |
| **GPT-6 Sol** 🔥 | `gpt-6-sol` | 1.05M | 6-gen mid tier at roughly half the price of 5.6 Sol (a long-term price, not a promo), 128K output; \$2/\$10 | Building features, code review, data analysis |
| **GPT-6 Luna** 🔥 | `gpt-6-luna` | 1.05M | 6-gen lightweight tier, \$0.10/\$0.50, for summarization, extraction and other bulk work | High concurrency, cost-sensitive |
| **GPT-5.5 Pro** | `gpt-5.5-pro` | 1M | Deep-reasoning specialist, Terminal-Bench 2.0 82.7%; **`/v1/responses` endpoint + SVIP group only**, very expensive | Top-tier reasoning, research |
| **chat-latest** | `chat-latest` | 400K | Version-less alias, always points to the latest ChatGPT Instant model | Quick writing, conversation |

<Note>
  **GPT-6 series supply**: the `default` / `svip` official-relay groups match official pricing on all four billing items, and both Chat Completions and Responses are tested working (including function calling) — migrating from 5.6 only needs the `model` field changed. Astra is also available in the `Codex_Reverse` group at a 0.5 discount. For Sol / Luna, a single request above 272K context is billed entirely at the higher tier. See the [GPT-6 Astra launch notes](/en/news/gpt-6-astra-launch) and [GPT-6 Sol / Luna launch notes](/en/news/gpt-6-sol-luna-launch).
</Note>

<Warning>
  **GPT Pro series (e.g. `gpt-5.5-pro`, `gpt-5.4-pro`) usage notes**:

  1. **`/v1/responses` endpoint only**: cannot use `/v1/chat/completions` — switch your SDK / code to the Responses API before calling
  2. **Very expensive**: a single call may cost several dollars, and it is open to the SVIP group only to prevent accidental use on the Default group
  3. **Not recommended for non-professional needs**: use GPT-6 Sol or GPT-5.6 Sol for everyday tasks; Pro suits only research and top-tier work demanding extreme reasoning depth
</Warning>

#### ✅ Stable / Classic

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **GPT-5.6 Sol** ⭐ | `gpt-5.6-sol` | 1M | 5.6-gen flagship, Terminal-Bench 2.1 88.8%; the `gpt-5.6` alias points here; \$4/\$20 (price cut 3 Sep) | Frontier intelligence, agent tasks |
| **GPT-5.6 Terra** | `gpt-5.6-terra` | 1M | 5.6-gen workhorse, \$2/\$12 | Everyday development |
| **GPT-5.6 Luna** | `gpt-5.6-luna` | 1M | 5.6-gen lightweight tier, \$0.20/\$1.20; weaker beyond 256K context | High concurrency, cost-sensitive |
| **GPT-5.5** ⭐ | `gpt-5.5` | 1M | Previous flagship, SWE-bench Verified 88.7%, `xhigh` reasoning tier | Complex agents, professional workflows |
| **GPT-5.4** ⭐ | `gpt-5.4` | 1M | Previous workhorse, native computer use, GDPval 83% | Complex agents, professional workflows |
| **GPT-5.4 Mini** | `gpt-5.4-mini` | 1M | Lightweight, great value | Balance performance and cost |
| **GPT-5.2** | `gpt-5.2` | 400K | GDPval 70.9% surpassing professionals | Programming planning, structured tasks |
| **GPT-5.1** | `gpt-5.1` | 128K | Intelligence-speed balance, SWE-bench 76.3%, 24h cache | General apps, programming |
| **GPT-5.1 Codex** | `gpt-5.1-codex-high` | 128K | Codex coding series (medium / mini tiers also available) | Programming, agent tasks |
| **GPT-5** | `gpt-5` | 128K | Classic flagship stable version | Top-tier reasoning, complex tasks |
| **GPT-5 Mini** | `gpt-5-mini` | 128K | GPT-5 lightweight, excellent performance | Balance performance and cost |
| **o3** | `o3` | 200K | Reasoning model, significantly price-reduced | Complex reasoning, math, programming |
| **o4-mini** | `o4-mini` | 200K | Lightweight reasoning model | Programming |
| **GPT-4.1** | `gpt-4.1` | 128K | Fast, long-standing workhorse | General applications |
| **GPT-4o** | `gpt-4o` | 128K | Balanced multimodal capabilities | General scenarios |
| **GPT-4o Mini** | `gpt-4o-mini` | 128K | Lightweight fast version | Quick response |

<Warning>
  **GPT-5 and newer series usage notes**:

  1. Temperature parameter `temperature` must be set to 1 (only supports 1)
  2. Use `max_completion_tokens` instead of `max_tokens`
  3. Do not pass `top_p` parameter
</Warning>

<Info>
  **Image and Video Generation Models** have been moved to a dedicated page. Visit [Image & Video Generation Models](/en/api-capabilities/image-video-models) for the full list and pricing.
</Info>

### 🎭 Claude Series (Anthropic)

#### 🆕 Latest Models

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Claude Opus 5.5** 🔥 | `claude-opus-5-5` | 1M | Terminal-Bench 4.0 **66.4%**, ahead of Fable 5.1 (55.8%); 30%+ faster output than Opus 5; \$4/\$20, cheaper than Opus 5 | Top-tier coding, complex agents |
| **Claude Opus 5.5 Thinking** 🔥 | `claude-opus-5-5-thinking` | 1M | Explicit thinking variant of Opus 5.5 | Top-tier reasoning tasks |
| **Claude Fable 5.1** 🔥 | `claude-fable-5-1` | 1M | Mythos-class flagship, same-price upgrade: Terminal-Bench-Science 24.7% → **52.6%**; `-thinking` variant available; \$10/\$50 | Top-tier tasks, long async work |
| **Claude Sonnet 5** | `claude-sonnet-5` | — | SWE-bench Verified **85.2%**, Terminal-Bench 2.1 80.4%, pure AWS official relay with high cache hit rates; \$2/\$10 | Programming top choice, agent dev |
| **Claude Opus 5** | `claude-opus-5` | 1M | Frontier Bench v0.1 43.3%, 128K output, thinking on by default with five effort tiers, `-thinking` variant available; \$5/\$25 | Top-tier coding, complex agents |

<Warning>
  **Breaking changes in Opus 5.5 / Fable 5.1**: forced tool calls (`tool_choice` of `any` / `tool`) return 400, thinking blocks are bound to the model, and editing history invalidates thinking blocks. Opus 5.5 additionally **cannot turn thinking off**, and its default effort drops from `high` to `medium`. Read the [Opus 5.5 launch notes](/en/news/claude-opus-5-5-launch) and [Fable 5.1 launch notes](/en/news/claude-fable-5-1-launch) before migrating.
</Warning>

<Warning>
  **30-day data retention compliance for Fable 5 / Fable 5.1 / Mythos 5**: because of these models' advanced capabilities, Bedrock and Anthropic run additional checks for high-risk misuse. For these two models, **inputs and outputs are retained for 30 days** to detect serious abuse — accessed by automated safety systems by default, with human review only when a potential harm is flagged. Retention happens on the AWS / Anthropic side; APIYI is a pure transparent proxy and retains nothing itself. **Other Claude models are unaffected.** See the [Fable 5.1 launch notes](/en/news/claude-fable-5-1-launch).
</Warning>

#### ✅ Stable / Classic

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Claude Fable 5** | `claude-fable-5` | — | Previous Mythos-class flagship, \$10/\$50 | Top-tier tasks |
| **Claude Opus 4.8** | `claude-opus-4-8` | 1M (Beta) | Agentic coding 69.2%, dynamic workflows | Top-tier coding, complex agents |
| **Claude Opus 4.7** ⭐ | `claude-opus-4-7` | 1M (Beta) | Coding benchmarks +13% over 4.6, tool errors cut to 1/3, `-thinking` variant available | Top-tier coding, complex agents |
| **Claude Opus 4.6** | `claude-opus-4-6` | 1M (Beta) | Terminal-Bench 2.0 #1, 128K output | Top-tier coding, complex agents |
| **Claude Sonnet 4.6** ⭐ | `claude-sonnet-4-6` | 1M (Beta) | Rivals Opus 4.5, great value | Programming, agent dev |
| **Claude Opus 4.5** | `claude-opus-4-5-20251101` | 200K | SWE-bench 80.9%, price reduced to 1/3 | Complex programming, top-tier reasoning |
| **Claude Sonnet 4.5** | `claude-sonnet-4-5-20250929` | 200K | World-class coding, SWE-bench 77.2%, `-thinking` variant available | Code generation, agent development |
| **Claude Haiku 4.5** ⭐ | `claude-haiku-4-5-20251001` | 200K | High cost-performance, SWE-bench 73.3%, 2x speed | Real-time chat, pair programming |
| **Claude 4 Sonnet** | `claude-sonnet-4-20250514` | 200K | Long-standing stable version | Code generation, analysis |

<Note>
  **Latest**: Claude Opus 5.5 beats Fable 5.1 on most coding and knowledge-work benchmarks while costing less than Opus 5 (\$4/\$20); Anthropic puts typical-workload cost about 40% below Opus 5. Sonnet 5 is close to Opus 4.8 but faster and cheaper. **Stable**: Opus 4.7 and Sonnet 4.6 are battle-tested for production workflows already in place; Haiku 4.5 offers 2x speed at great value.
</Note>

### 🌟 Google Gemini Series

#### 🆕 Latest Models

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Gemini 3.8 Flash** 🔥 | `gemini-3.8-flash` | — | New Flash release shipped by Google on Sep 2, official specs not yet published; 150 paired dual-protocol tests match 3.7 item by item; \$0.75/\$3.75, same as 3.7 | Programming, agents, value |
| **Gemini 3.7 Flash** 🔥 | `gemini-3.7-flash` | 1M | 64K output, Terminal-bench 2.1 **85.8%**, DeepSWE 65.3%; \$0.75/\$3.75 is Google's limited-time promotional rate (through 2026-12-31, then \$1.50/\$7.50) | Programming, agents, multimodal |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | 1M | ARC-AGI-2 77.1% (2x+ over 3 Pro), Google's strongest reasoning model | Complex reasoning, multimodal analysis |
| **Gemini 3.1 Flash Lite** | `gemini-3.1-flash-lite` | 1M | GA version, 64% faster than 2.5 Flash, \$0.25/\$1.50 | High concurrency, batch, low cost |

<Warning>
  **Note**: Gemini 3 Pro Preview was discontinued on March 9, 2026. Please migrate to Gemini 3.1 Pro Preview or Gemini 3.8 Flash.
</Warning>

#### ✅ Stable / Classic

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Gemini 3.6 Flash** | `gemini-3.6-flash` | 1M | Multimodal Flash, thinking on by default (four tiers), all native tools enabled; \$1.50/\$7.50 | Programming, agents, multimodal |
| **Gemini 3.5 Flash-Lite** | `gemini-3.5-flash-lite` | 1M | Zero thinking by default, \~2 second responses; \$0.30/\$2.50 | High concurrency, low latency, batch |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` | 1M | Terminal-Bench 2.1 76.2%; \$1.50/\$9.00 | Programming |
| **Gemini 3 Flash Preview** | `gemini-3-flash-preview` | 1M | SWE-bench 78%, thinking / nothinking variants available | Programming, cost-performance |
| **Gemini 2.5 Pro** ⭐ | `gemini-2.5-pro` | 2M | Official release, programming advantage, strong multimodal | Long text, programming, multimodal |
| **Gemini 2.5 Flash** ⭐ | `gemini-2.5-flash` | 1M | Fast speed, low cost, official release | Quick response scenarios |
| **Gemini 2.5 Flash Lite** | `gemini-2.5-flash-lite` | 1M | Ultra-lightweight, faster and cheaper | Large-scale simple tasks |

<Note>
  **Latest**: Gemini 3.8 Flash and 3.7 Flash share the same price — well ahead of 3.6 Flash on coding and agent work at half the cost — and both native Gemini and OpenAI-compatible endpoints work. See the [3.8 Flash launch notes](/en/news/gemini-3-8-flash-launch) and [3.7 Flash launch notes](/en/news/gemini-3-7-flash-launch). For high-concurrency, low-latency work, try [3.5 Flash-Lite](/en/api-capabilities/gemini-3-5-flash-lite/overview). **Stable**: Gemini 2.5 Pro (2M context) and Gemini 2.5 Flash suit settled production environments.
</Note>

### 🚀 xAI Grok Series

#### 🆕 Latest Models

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Grok 4.7** 🔥 | `grok-4.7` | 500K | New 2.1T base model; Terminal-Bench 4.0 18% → **33%**, DeepSWE 73%; \$2/\$6, same as before, but uses about twice the output tokens per task as 4.6 | Coding agents, long tasks |
| **Grok 4.6** 🔥 | `grok-4.6` | 500K | Artificial Analysis Intelligence Index **61**, level with GPT-5.6 Sol Max; \$2/\$6 | General tasks, programming |
| **Grok 4.5** | `grok-4.5` | 500K | Co-trained with Cursor, #1 on agentic tool calling, highly token-efficient output; \$2/\$6 | Programming, agent tasks |
| **Grok 4.3** | `grok-4.3` | 1M | Intelligence Index 53, τ²-Bench 98%, IFBench 81%; \$1.25/\$2.50, doubling past 200K | Complex reasoning, general tasks |
| **Grok 4 Fast Reasoning** | `grok-4-fast-reasoning` | 200K | Reasoning mode, 93%+ cheaper than Grok-4 | Complex reasoning |
| **Grok Code Fast 1** | `grok-code-fast-1` | 256K | SWE-bench 70.8%, high-speed generation | Code generation, agent programming |

#### ✅ Stable / Classic

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Grok 4.20 Beta** | `grok-4.20-beta` | Standard | Reasoning / multi-agent / non-reasoning variants available | General tasks |
| **Grok 4** | `grok-4` | Standard | Official version; `grok-4-all` adds native web search | General tasks, real-time info |
| **Grok 3** | `grok-3` | Standard | Official stable version | Daily use |
| **Grok 3 All** | `grok-3-all` | Standard | Native web search enhanced | News, market analysis |
| **Grok 3 Mini** | `grok-3-mini` | Standard | Small model with reasoning | Lightweight tasks |

<Info>
  **Estimate Grok costs per task**: Grok 4.5 / 4.6 / 4.7 share the same unit price (\$2/\$6), but Grok 4.7 uses about twice the output tokens of 4.6 on the same task set, so per-task spend goes up; Grok 4.5 is the most output-efficient. Requests above 200K tokens are billed at the vendor's second tier. See the [Grok 4.7 launch notes](/en/news/grok-4-7-launch).
</Info>

### 🔍 DeepSeek Series

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **DeepSeek V4 Pro** 🔥 | `deepseek-v4-pro` | 1M | 1.6T/49B activated, SWE-Verified 80.6 near Claude/Gemini, Hybrid Attention | Complex reasoning, coding, agents |
| **DeepSeek V4.1 Flash** 🔥 | `deepseek-v4.1-flash` | — | DeepSeek's latest Flash; both OpenAI and Anthropic formats work (Anthropic format via the `ClaudeCode` group), cached input as low as \$0.006; \$0.30/\$1.20 | High concurrency, coding, agents |
| **DeepSeek V3.2** | `deepseek-v3.2` | 128K | GPT-5 level, tool-use in reasoning | Complex reasoning, coding |
| **DeepSeek V3.1** ⭐ | `deepseek-v3-1-250821` | 128K | Mixed reasoning, Think/Non-Think dual modes | Intelligent reasoning, programming |
| **DeepSeek R1** | `deepseek-r1` | 64K | Reasoning model | Math, reasoning |
| **DeepSeek V3** | `deepseek-v3` | 128K | Strong comprehensive capabilities | General scenarios |

### 🐘 Chinese Model Series

#### Zhipu AI (GLM)

**🆕 Latest**: GLM-5.3, GLM-5.3-Flash | **✅ Stable / Classic**: GLM-5.2, GLM-5.1, GLM-5

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **GLM-5.3** 🔥 | `glm-5.3` | 1M | Same 753B MoE base as 5.2 with only post-training scaled; Z.ai Code Bench **+50%** over 5.2; \$1.40/\$4.396 | Project-scale coding, long-horizon agents |
| **GLM-5.3-Flash** 🔥 | `glm-5.3-flash` | 1M | First natively multimodal GLM-5 model (text / image / video / file), Terminal-Bench 2.1 **84.3**, close to Claude Opus 4.8; \$0.15/\$0.50 | Multimodal, value coding |
| **GLM-5.2** | `glm-5.2` | 1M | Direct Alibaba Cloud official relay, AA Intelligence Index **51** (#1 open-source), Terminal-Bench 2.1 81.0, SWE-bench Pro 62.1; \$1.142/\$3.997 | Project-scale coding, long-horizon agents |
| **GLM-5.1** ⭐ | `glm-5.1` | 200K | SWE-Bench Pro 58.4, 744B MoE, MIT open-source | Complex coding, agents |
| **GLM-5** | `glm-5` | 200K | 744B params (40B activated), coding aligned with Claude Opus 4.5 | Complex coding, systems engineering |
| **GLM-4.6** | `glm-4.6` | 200K | Code and reasoning enhanced, stable | Programming, reasoning, agents |
| **GLM-4.5** | `glm-4.5` | 128K | Standard version, strong overall | General scenarios |

<Info>
  **GLM-5.3 series highlights**:

  * The flagship GLM-5.3 keeps 5.2's base and only scales post-training, with big gains in coding and cybersecurity (ExploitBench 54.4% vs 24.4% for 5.2)
  * GLM-5.3-Flash is a 320B-A18B hybrid sparse + linear attention multimodal model at roughly 1/10 the flagship price
  * Pricing matches Zhipu's official site item by item, available in the `default` / `svip` groups; raise your timeout above 600 seconds for long tasks. See the [GLM-5.3 launch notes](/en/news/glm-5-3-launch)
</Info>

#### Alibaba Qwen

**🆕 Latest**: Qwen3.8-Max | **✅ Stable / Classic**: Qwen3.7 series, Qwen3.6 series, Qwen Max / Plus / Turbo

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Qwen3.8-Max** 🔥 | `qwen3.8-max` | 1M | 2.4T sparse MoE, 131K output, GPQA Diamond **92.6**, PaperBench 93.0, native image/video input; thinking on by default, `/v1/responses` not yet supported; \$1.65/\$4.95 | Agents, multimodal, long text |
| **Qwen3.7-Max** | `qwen3.7-max` | 1M | AA Intelligence Index 56.6 (global top 5, #1 in China), 35-hour long-horizon agent autonomy; \$1.714/\$5.142 | Agents, multilingual, long text |
| **Qwen3.7-Plus** | `qwen3.7-plus` | 1M | 3.7-gen value tier, \$0.60/\$2.40 | General tasks, batch processing |
| **Qwen3.6-Max-Preview** | `qwen3.6-max-preview` | 1M | #1 on six coding benchmarks (AIME 2025 93%, GPQA 86%) | Programming, reasoning |
| **Qwen3.6-Plus** | `qwen3.6-plus` | 1M | MoE 72B / 18B activated, Terminal-Bench 61.6, chain-of-thought always on | Coding agents |
| **Qwen3.6-Flash** | `qwen3.6-flash` | 1M | 35B-A3B MoE, multimodal, \$0.17/\$1.02 | Cost-effective, multimodal |
| **Qwen3.6 open weights** | `qwen3.6-27b` / `qwen3.6-35b-a3b` | 1M | Open-weight models hosted by APIYI — no GPU rental or inference stack to operate | Self-hosting alternative, cost-sensitive |
| **Qwen Max** | `qwen-max` | 32K | Long-standing stable version | General tasks |
| **Qwen Plus** | `qwen-plus` | 32K | Enhanced version | Cost-effective |
| **Qwen Turbo** | `qwen-turbo` | 32K | Fast version | Low latency |

#### Moonshot Kimi Series

**🆕 Latest**: Kimi K3 | **✅ Stable / Classic**: Kimi K2.6, K2.5, K2

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Kimi K3** 🔥 | `kimi-k3` | 1M | 2.8T-parameter open-source flagship, Kimi Delta Attention, **#1 on LMArena Frontend Code Arena**, GPQA Diamond 93.5%, Terminal-Bench 2.1 88.3%; \$3/\$15 flat across the whole context range, cached input as low as \$0.30 | Frontend coding, long-horizon agents |
| **Kimi K2.7 Code** | `kimi-k2.7-code` | 256K | Coding-specialized tier, \$0.95/\$3.99 | Programming |
| **Kimi K2.6** ⭐ | `kimi-k2.6` | 256K | 1T MoE / 32B activated, SWE-Bench Pro 58.6; \$0.60/\$2.40, \~60% of list | Coding, agents |
| **Kimi K2.5** | `kimi-k2.5` | 200K | Native multimodal, Agent Swarm 100 agents | Multimodal, agents |
| **Kimi K2 Official Release** | `kimi-k2-250711` | 200K | Volcano Engine partnership, strong stability | Production environments |

<Info>
  **Kimi K3 usage notes**:

  * Exactly 1,048,576 tokens of context with **flat pricing across the whole range** — drop in whole repos or long documents without worrying about tier jumps
  * Max output defaults to 131,072 and can be raised to 1,048,576 tokens; thinking runs at full tilt, so budget output tokens accordingly
  * Automatic context caching bills cached input at \$0.30/1M (1/10 of the uncached rate), a big win for multi-turn conversations
</Info>

#### ByteDance Seed Series

**🆕 Latest**: Seed 2.1 Turbo | **✅ Stable / Classic**: Seed 2.0 Pro / Lite / Mini

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **Seed 2.1 Turbo** 🔥 | `dola-seed-2-1-turbo-260628` | 256K | High-frequency production text model; **15/15 test cases passed on both Chat Completions and Responses**, controllable thinking plus implicit/explicit two-layer caching; \$0.50/\$2.50 | High-concurrency production, batch extraction |
| **Seed 2.0 Pro** | `seed-2-0-pro-260328` | — | AIME 2025 98.3, Codeforces 3020, strong agent capability; \$0.50/\$3.00 | Complex reasoning, coding |
| **Seed 2.0 Lite** | `seed-2-0-lite-260428` | — | Cost-effective enterprise tier, image/video/text multimodal input; \$0.25/\$2.00 | Large-scale production |
| **Seed 2.0 Mini** | `seed-2-0-mini-260428` | — | Ultra-light tier, \$0.10/\$0.40 | Large-volume simple tasks |

<Warning>
  **Seed 2.1 Turbo enables deep thinking by default**: with no parameters set, even a one-line question emits hundreds of thinking tokens first (a one-sentence self-introduction measured 444 output tokens, 409 of them thinking), and thinking is billed as normal output tokens. For high-frequency short Q\&A, make `thinking: {"type": "disabled"}` your baseline. See the [integration guide](/en/api-capabilities/dola-seed-2-1-turbo/overview).
</Warning>

### 🌐 MiniMax Series

**🆕 Latest**: MiniMax-M3 | **✅ Stable / Classic**: MiniMax-M2.7, M2.5

| Model Name | Model ID | Context Length | Features | Recommended Scenarios |
| - | - | - | - | - |
| **MiniMax-M3** 🔥 | `MiniMax-M3` | 1M | First open-weight flagship combining frontier agentic coding, 1M context and native multimodality; SWE-Bench Pro **59.0** beats GPT-5.5 and Gemini 3.1 Pro; MSA sparse attention cuts long-context inference cost to \~1/20 of the previous generation | Coding, agents, long context |
| **MiniMax-M2.7** | `MiniMax-M2.7` | Standard | 10B params, SWE-bench Pro 56.22%, self-evolving, smallest Tier-1 model | Coding, agents |
| **MiniMax-M2.5** | `MiniMax-M2.5` | Standard | 230B (10B activated), SWE-bench 80.2%, great value | Coding, agents, office automation |

<Info>
  **MiniMax-M3 billing notes**:

  * Tiered billing: \$0.30 input / \$1.20 output per 1M tokens for the 0-512K range; anything beyond is billed at a higher tier
  * Model names are case-sensitive: `MiniMax-M3` (as are siblings such as `MiniMax-M2.7-highspeed`)
  * Estimate costs before running million-token context jobs
</Info>

<Note>Model prices are aligned with official pricing and may change as vendors adjust; the tables above are for reference only — the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

## 💰 Pricing Information

### Billing Methods

* **Pay-as-you-go**: Charged based on actual Token usage
* **No minimum charge**: Use what you pay for
* **Balance validity**: Valid for 365 days from the top-up date, automatically reset on the next top-up (see [Recharge Promotions](/en/faq/recharge-promotions))
* **Real-time deduction**: Fees deducted from balance immediately after each call

### Pricing Advantages

* Official source forwarding with slight price advantages
* Bulk users can contact customer service for better pricing
* New accounts come with \$0.05 in trial credit, enough to verify your integration works

### View Real-time Pricing

Visit the [APIYI Console Pricing Page](https://www.apiyi.com/account/pricing) for the latest pricing on all models, or the on-site [Model Pricing Overview](/en/models).

## 🛠️ Usage Recommendations

### Model Selection Guide

**Programming Development**

* Top performance: Claude Opus 5.5 (Terminal-Bench 4.0 66.4%), GPT-6 Astra (Terminal-Bench 4.0 57.9%), Claude Sonnet 5 (SWE-bench 85.2%), Kimi K3
* High cost-performance: GPT-6 Sol (about half the price of 5.6), Gemini 3.8 Flash / 3.7 Flash, GLM-5.3 / 5.3-Flash, MiniMax-M3, DeepSeek V4.1 Flash
* Alternatives: Grok 4.7 / 4.6, Qwen3.8-Max, GPT-5.6 Sol, Kimi K2.6

**Text Creation**

* Top choice: GPT-6 Sol, Claude Opus 5.5, Claude Sonnet 5, Gemini 3.8 Flash
* Alternatives: chat-latest, GPT-5.6 Terra, Claude Sonnet 4.6, GLM-5.3

**Quick Response**

* Top choice: Gemini 3.5 Flash-Lite (zero thinking by default, \~2s), Claude Haiku 4.5 (2x faster), GPT-6 Luna
* Alternatives: Gemini 3.1 Flash Lite, Gemini 2.5 Flash, Seed 2.1 Turbo (disable thinking explicitly)

**Long Text Processing**

* Ultra-long context: Gemini 2.5 Pro (2M), Kimi K3 (1M, flat pricing), MiniMax-M3 (1M), GLM-5.3 (1M), GPT-6 series (1.05M), Claude Opus 5.5 (1M)
* Note: some models switch to a higher billing tier past a threshold (Grok 4.5 / 4.6 / 4.7 above 200K, GPT-6 Sol / Luna above 272K, MiniMax-M3 above 512K) — estimate costs before long jobs

**Image Generation**

* Latest recommendation: gpt-image-2.5-flare / gpt-image-2.5-sunburst (live Sep 2026, native 4K, precise size/quality control, same price as gpt-image-2, faster / more precise editing respectively), Nano Banana Pro (4K HD, best text rendering)
* High cost-performance: Nano Banana 2 (\$0.055/image, from \$0.025 pay-as-you-go), Nano Banana Lite (\~4s per image, \$0.025/image)
* Professional design: Seedream 5.0 Pro (\$0.12/call, interactive editing + up to 10 reference images), Seedream 5.0 Lite (\$0.035/image)
* Fast generation: Seedream 5.0 Flash (live Sep 2026, \$0.018/image, 15–20s per image, accurate Chinese typography)
* Cheapest: gpt-image-2-all (reverse channel, \$0.025/image)

**Video Generation**

* Official relay first choice: VEO 3.1 Official (\$0.3 / \$1.2 per call, 4/6/8s, native synced audio)
* Chinese-vendor workhorses: Seedance 2.5 and 2.0 series (2.5 / standard / fast / mini), Wan2.7, HappyHorse 1.1
* Note: the Sora 2 channels have been retired — use the options above. See [Image & Video Generation Models](/en/api-capabilities/image-video-models)

**Web Search**

* Native web access: Grok 4 All, Grok 3 All (no tool call needed)
* Search grounding: Gemini 3.8 Flash / 3.7 Flash / 3.6 Flash / 3.5 Flash-Lite

### Cost Optimization Recommendations

1. **Tiered Usage**: Use cheaper models for simple tasks, advanced models for complex tasks
2. **Test Optimization**: Test with small models first, use large models after determining needs
3. **Batch Processing**: Choose Luna / Lite / Mini tiers for large volumes of similar tasks
4. **Cache Reuse**: Lean on each vendor's context cache (Kimi K3, Seed 2.1 Turbo and the Claude series bill cached input as low as 1/10)
5. **Turn off unneeded thinking**: some models think by default (Seed 2.1 Turbo, the Gemini Flash series, Qwen3.8-Max) — disabling it for short high-frequency Q\&A saves both money and time

## 🔗 Related Resources

* [Model Pricing Overview](/en/models) - Full model list with live pricing
* [Model Comparison Testing](https://imagen.apiyi.com/) - Image generation effect comparison
* [Real-time Price Query](https://www.apiyi.com/account/pricing) - Latest pricing information
* [API Documentation](/en/api-manual) - Detailed interface specifications
* [Quick Start](/en/getting-started) - Integration guide

<Note>
  Model list is continuously updated. We will promptly add newly released excellent models. For the latest launches, follow the [Changelog](/en/changelog). For specific model needs or bulk requirements, please contact customer service.
</Note>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.