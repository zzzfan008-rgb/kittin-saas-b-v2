> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI - Enterprise AI Model API Hub

> Professional and stable AI API aggregation service, operating for 2+ years, 150K monthly visitors, long-term reliable service

<Info>
  **中文用户？** [切换到中文版](/)
</Info>

**APIYI** is an enterprise-grade, professional and stable AI model API hub — compatible with the unified OpenAI API standard while also supporting each vendor's native API formats (Claude, Gemini, and more), covering 400+ popular AI models. With one token, you can easily access OpenAI, Claude, Gemini, DeepSeek, Qwen, Kimi, GLM, Minimax and all mainstream large language models.

## 🏢 Company Background

* Operating Entity: APIYI, LLC (United States)
* Official Partners: Google AI Studio, Microsoft Azure, Amazon AWS (legitimate quota sources, use with confidence)
* Service Guarantee:
  * Stable: Provides high concurrency and stable services for mainstream models like OpenAI, Claude, Google Gemini
  * Trusted:
    * Many well-known applications have stably integrated in production environments (see Use Cases section).
    * Cooperation with renowned universities, hospitals and other institutions, serving well-known enterprises.
    * Domestic entities can make corporate payments, issue invoices, and assist with procurement lists for worry-free reimbursement.

## 🛡️ Tired of Sketchy API Resellers?

<Info>
  The API reseller market is a mixed bag — silently swapped models, degraded quality, and vanishing operators are all too common. APIYI doesn't rely on verbal promises; we give you verifiable evidence.
</Info>

<CardGroup cols={3}>
  <Card title="2+ Years in Operation" icon="calendar-check" href="/en/faq/enterprise-trust">
    150K monthly visitors, long-term stable operation — not a fly-by-night newcomer
  </Card>

  <Card title="30-Day No-Questions Refund" icon="rotate-ccw" href="/en/faq/refund-policy">
    Unused balance refunded to the original payment method within 30 days, no fees via WeChat/Alipay
  </Card>

  <Card title="Pure Official Relay · Model Fidelity" icon="shield-check" href="/en/faq/enterprise-trust">
    No rerouting, no degradation, no model swapping — verify fidelity yourself
  </Card>

  <Card title="Pragmatic SLA Guarantee" icon="file-check" href="/en/faq/sla-guarantee">
    Compensation for billing anomalies, credit reissue for outages, contractual SLA for enterprises
  </Card>

  <Card title="Data Security" icon="lock" href="/en/faq/data-security">
    Transparent proxy, no conversation content retained, minimal logging
  </Card>

  <Card title="Corporate Payment · Easy Reimbursement" icon="receipt" href="/en/faq/university-reimbursement">
    Invoices and corporate transfers supported — reimbursement-friendly for universities, hospitals and enterprises
  </Card>
</CardGroup>

## 🤖 Three ways to let an AI integrate for you

No reading docs, no filling in config by hand. Pick whichever AI you have at hand, copy the matching prompt to it, and it does the rest.

<Tabs>
  <Tab title="Skills · chat agents" icon="sparkles">
    **Call APIYI in natural language from a chat agent such as OpenClaw.** Copy the prompt to the agent; it installs the skill, self-checks the key and walks you through setup.

    <Prompt description="Copy to OpenClaw, Claude Code, Cursor or any agent that supports skills" icon="bot" actions={["copy"]}>
      Install the APIYI skill from [https://docs.apiyi.com](https://docs.apiyi.com): try `npx skills add https://docs.apiyi.com` first;
      if you are OpenClaw, install `git:apiyi-com/skills` instead; otherwise just read [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md).
      Then self-check the key (scripts/apiyi.py --check in the skill, or npx apiyi\@latest check).
      If no key, guide me to copy one at [https://api.apiyi.com/token](https://api.apiyi.com/token) and put it in APIYI\_API\_KEY. Never hardcode it.
      Once the check says ready, send "Hello" with gpt-5.4-mini and show me the reply.
    </Prompt>

    Skill source `github.com/apiyi-com/skills` · install routes and key setup in the [AI Developer Kit](/en/developer-kit#skills)
  </Tab>

  <Tab title="CLI · terminal" icon="terminal">
    **Get the first call working from the terminal without writing a line of code.** `npx apiyi@latest check` needs no install: it checks the key, measures node latency, lists models, sends messages and generates images.

    <Prompt description="Copy to any agent that can run terminal commands, or run the lines yourself" icon="terminal" actions={["copy"]}>
      Please help me install and run the APIYI CLI: [https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
      Requirements: Node 18+; run `npx apiyi@latest check` with nothing to install;
      guide me to configure an API key (`npx apiyi@latest auth set-key` or the APIYI\_API\_KEY env var, copied from [https://api.apiyi.com/token](https://api.apiyi.com/token));
      finally run `npx apiyi@latest models --grep gpt-5` and `npx apiyi@latest chat "Hello" -m gpt-5.4-mini` and paste the output.
    </Prompt>

    Source `github.com/apiyi-com/cli` · npm package `apiyi` · full command table in the [AI Developer Kit](/en/developer-kit#cli)
  </Tab>

  <Tab title="AI Developer Kit · coding agents" icon="code">
    **Make Cursor / Claude Code / Codex read the contract before writing code.** skill.md is the rulebook, llms.txt the index, model-registry.json the source of truth for models. Read, explain, then edit. No invented endpoints.

    <Prompt description="Copy to Cursor, Claude Code, Codex or any other coding agent" icon="code" actions={["copy"]}>
      First read [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) and [https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt) in full.
      You must follow the APIYI integration rules: do not invent endpoints, parameter names, enum values or response shapes.
      Use [https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) as the single source of truth for model IDs (dot-versioned, case-sensitive, e.g. gpt-5.4-mini).
      Pick the base URL by SDK: OpenAI SDK [https://api.apiyi.com/v1](https://api.apiyi.com/v1); Anthropic and Google GenAI SDKs [https://api.apiyi.com](https://api.apiyi.com) (Gemini also sets api\_version to v1beta).
      Read the key only from the APIYI\_API\_KEY env var. After reading, explain the integration flow first. Do not edit code yet.
    </Prompt>

    What is in the kit and how each file is used: [AI Developer Kit](/en/developer-kit)
  </Tab>
</Tabs>

## 🌟 Featured Models

<CardGroup cols={3}>
  <Card title="Nano Banana Pro/2 Series" icon="image" href="/en/api-capabilities/nano-banana-pricing">
    **🎨 Image Generation**

    The best available, 4K for just

    **\$0.09** /image

    🎯 As low as 30.3% of official price
  </Card>

  <Card title="Claude Official Relay" icon="sparkles" href="/en/api-capabilities/claude">
    **🤖 Chat & Coding**

    Pure official relay via AWS + Official dual channels, high cache hit rate

    ⚡ \~80% of official price
  </Card>

  <Card title="GPT-image-2 Full Series" icon="images" href="/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    **🖼️ Image Generation**

    Official relay + reverse (-all/-vip) full coverage

    🎯 Pick what fits your needs
  </Card>

  <Card title="Gemini Full Multimodal Series" icon="gem" href="/en/api-capabilities/model-info">
    **🔥 Multimodal**

    Full lineup for text, image, and video

    🏆 Gemini 3.1 Pro leads in performance
  </Card>

  <Card title="OpenAI Full Multimodal Series" icon="bot" href="/en/api-capabilities/model-info">
    **🚀 Multimodal**

    GPT / o series, image, video, and audio

    ✅ Full lineup, stable support
  </Card>
</CardGroup>

## 📖 Product Basics

<CardGroup cols={2}>
  <Card title="Quick Start" icon="rocket" href="/en/getting-started">
    Complete integration in three steps, start using AI models immediately
  </Card>

  <Card title="API Manual" icon="book" href="/en/api-manual">
    Complete API documentation and developer guide
  </Card>

  <Card title="AI Developer Kit" icon="bot" href="/en/developer-kit">
    🤖 Skill, CLI, and the contract plus model registry for coding agents
  </Card>

  <Card title="Changelog" icon="megaphone" href="/en/changelog">
    🔥 Latest model launches, price adjustments and important updates
  </Card>

  <Card title="Pricing" icon="tag" href="/en/pricing">
    View detailed pricing and promotions for all models
  </Card>
</CardGroup>

## 🔧 Core APIs

<CardGroup cols={2}>
  <Card title="Chat Completions API" icon="message-circle" href="/en/api-manual">
    Chat Completions - Create multi-turn conversations and text generation
  </Card>

  <Card title="Models API" icon="list" href="/en/api-capabilities/model-info">
    Models API - Get all available model information
  </Card>

  <Card title="Image Generation API" icon="image" href="/en/api-capabilities/image-video-models">
    Images API - Nano Banana Pro, gpt-image-2 and more
  </Card>

  <Card title="Embeddings API" icon="vector-square" href="/en/api-manual#embeddings-api">
    Embeddings API - Text vectorization and semantic search
  </Card>
</CardGroup>

## ⚡ API Capabilities

### 🎬 Video Generation API

<CardGroup cols={2}>
  <Card title="Seedance 2.0 Video Generation" icon="film" href="/en/api-capabilities/seedance2/overview">
    🔥 ByteDance's latest flagship: standard / fast / mini tiers, synchronized audio by default, high concurrency with no queuing
  </Card>

  <Card title="Wan2.7 Video Generation" icon="videotape" href="/en/api-capabilities/wan/overview">
    Alibaba official channel: text / image / reference-to-video plus video editing, from \$0.42/video
  </Card>

  <Card title="VEO 3.1 Video Generation" icon="clapperboard" href="/en/api-capabilities/veo-3-1-official/overview">
    Google official channel, per-generation billing from \$0.3/video, 720p / 1080p / 4K
  </Card>

  <Card title="Character-Consistent Video" icon="images" href="/en/api-capabilities/seedance2/asset-library">
    Seedance asset library: upload images once, reference them for character-consistent videos
  </Card>

  <Card title="Video Understanding API" icon="eye" href="/en/api-capabilities/video-understanding">
    Intelligent video analysis, scene recognition, content understanding
  </Card>
</CardGroup>

### 🎨 Image Generation API

<CardGroup cols={2}>
  <Card title="Nano Banana Pro" icon="banana" href="/en/api-capabilities/nano-banana-image/overview">
    🔥 Our strongest, 4K HD, best-in-class text rendering, \$0.09/image
  </Card>

  <Card title="Nano Banana 2" icon="banana" href="/en/api-capabilities/nano-banana-2-image/overview">
    🔥 Usage-based billing, new 1:8/8:1 long-image ratios, \$0.055/image (from \$0.025 usage-based)
  </Card>

  <Card title="Nano Banana Lite" icon="zap" href="/en/api-capabilities/nano-banana-lite-image/overview">
    🆕 Google's fastest and cheapest, \~4s per image, \$0.025/image
  </Card>

  <Card title="gpt-image-2.5 / 2 Series" icon="images" href="/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    OpenAI official relay 2.5-flare / 2.5-sunburst / 2 with native 4K + reverse -all/-vip at \$0.03/image — pick what fits
  </Card>

  <Card title="Seedream 5.0/4.5" icon="sparkles" href="/en/api-capabilities/seedream-image/overview">
    BytePlus official partnership, fast with URL output, from \$0.035/image
  </Card>

  <Card title="Flux 2 Series" icon="wand-sparkles" href="/en/api-capabilities/flux/overview">
    🆕 FLUX.2 max/pro/flex tiers, from \$0.03/generation
  </Card>
</CardGroup>

### 🔧 Basic APIs

<CardGroup cols={2}>
  <Card title="Model Info" icon="database" href="/en/api-capabilities/model-info">
    View detailed information for 400+ supported AI models
  </Card>

  <Card title="OpenAI SDK Integration" icon="code" href="/en/api-capabilities/openai/compatible">
    Seamlessly integrate APIYI using the official SDK
  </Card>

  <Card title="Image Understanding API" icon="eye" href="/en/api-capabilities/vision-understanding">
    Intelligent image analysis, OCR, object recognition, scene description
  </Card>

  <Card title="Claude Native Format" icon="messages-square" href="/en/api-capabilities/claude">
    Anthropic native API format, full feature support
  </Card>

  <Card title="Gemini Native Format" icon="gem" href="/en/api-capabilities/gemini/native">
    Google native API format, full feature support
  </Card>

  <Card title="Text Embedding API" icon="vector-square" href="/en/api-capabilities/text-embedding">
    Text vectorization and semantic search
  </Card>
</CardGroup>

## 🎯 Use Cases

### 💬 Conversational AI

<CardGroup cols={2}>
  <Card title="Cherry Studio" icon="cherry" href="/en/scenarios/chat/cherry-studio">
    Powerful AI chat client with multi-model switching
  </Card>

  <Card title="Chatbox" icon="message-square" href="/en/scenarios/chat/chatbox">
    Cross-platform desktop AI chat application
  </Card>

  <Card title="Open WebUI" icon="globe" href="/en/scenarios/chat/open-webui">
    Self-hosted web chat interface
  </Card>

  <Card title="ChatGPT Next Web" icon="app-window" href="/en/scenarios/chat/chatgpt-next-web">
    One-click deployable web-based ChatGPT
  </Card>
</CardGroup>

### 💻 Programming & Development

<CardGroup cols={2}>
  <Card title="Claude Code" icon="terminal" href="/en/scenarios/programming/claude-code">
    🔥 Anthropic's official AI programming assistant
  </Card>

  <Card title="Cursor" icon="mouse-pointer-click" href="/en/scenarios/programming/cursor">
    AI-powered code editor
  </Card>

  <Card title="Cline (VS Code)" icon="code" href="/en/scenarios/programming/cline">
    AI programming assistant in VS Code
  </Card>

  <Card title="Roo Code" icon="rocket" href="/en/scenarios/programming/roo-code">
    Efficient AI code generation tool
  </Card>

  <Card title="Codex CLI" icon="square-terminal" href="/en/scenarios/programming/codex-cli">
    Command-line AI programming assistant
  </Card>

  <Card title="Gemini CLI" icon="gem" href="/en/scenarios/programming/gemini-cli">
    Google Gemini command-line tool
  </Card>
</CardGroup>

### 🔧 Engineering

<CardGroup cols={2}>
  <Card title="LangChain" icon="link" href="/en/scenarios/engineering/langchain">
    Development framework for building AI applications
  </Card>

  <Card title="Dify" icon="workflow" href="/en/scenarios/engineering/dify">
    Visual AI application development platform
  </Card>
</CardGroup>

### 🌐 Translation

<CardGroup cols={2}>
  <Card title="Bob Translator" icon="languages" href="/en/scenarios/translation/bob">
    Professional translation tool for macOS
  </Card>

  <Card title="Immersive Translate" icon="globe" href="/en/scenarios/translation/immersive">
    Browser extension for bilingual reading
  </Card>
</CardGroup>

## 🚀 Why Choose APIYI?

### One Interface, Multiple Models

No need to apply for separate accounts and manage API keys for each AI service. With APIYI, you only need:

* **One account**: Manage all AI services
* **One API key**: Access all models
* **One standard**: Compatible with OpenAI API format

### 💡 Supported Models

We support 400+ industry-leading AI models:

#### OpenAI Series

* GPT-5.1 full series (latest iteration, intelligence and speed balanced)
* GPT-5 / GPT-5 Mini / GPT-5 Nano
* o3 / o3 Pro / o4-mini (reasoning models)
* GPT-4.1 / GPT-4o series
* Codex series (programming-focused)
* DALL·E 3 / GPT-Image-1

#### Anthropic Series

* **Claude Opus 4.5** (🔥 Latest flagship, SWE-bench 80.9%)
* Claude Sonnet 4.5 (World-class coding model)
* Claude Haiku 4.5 (High cost-performance)
* Claude 4 Sonnet / Claude 4 Opus

#### Google Series

* **Gemini 3 Pro Preview** (🔥 LMArena #1 globally)
* **Nano Banana Pro** (🔥 4K HD image generation)
* Gemini 2.5 Pro (2M context)
* Gemini 2.5 Flash (Fast response)

#### xAI Grok Series

* **Grok 4.5** (🔥 Newest flagship for code & agents)
* Grok 4.3 / Grok 4.20 series (1M context)
* Grok Build 0.1 (Code-focused)
* Grok 4.20 Multi-Agent (Multi-agent collaboration)
* [API guide](/en/api-capabilities/grok/overview) (web search / X search / code execution verified)

#### Chinese Models

* DeepSeek V3.2 / V3.1 / R1 (Hybrid reasoning)
* GLM-4.6 / GLM-4.5 (Zhipu AI)
* Kimi K2 (BytePlus official)
* Qwen series (Alibaba)
* ERNIE 4.0 (Baidu)
* SparkDesk 3.5 (iFlytek)

#### Video Generation Models

* **Seedance 2.0** (🔥 ByteDance's latest, synchronized audio by default)
* **Wan2.7** (Alibaba Wan, includes video editing)
* VEO 3.1 (Google official channel, up to 4K)
* Sora 2 / Sora 2 Pro (OpenAI official channel)

#### Image Generation Models

* Nano Banana Pro (4K HD)
* Flux / SeeDream (Professional-grade)
* Sora Image (Reverse-engineered)

### 🔧 Simple & Easy

Switching models is as simple as changing one parameter:

```python theme={null}
# Using GPT-4
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Switch to Claude 3
response = openai.ChatCompletion.create(
    model="claude-3-opus-20240229",  # Just change the model name
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 🛡️ Stable & Reliable

* **High Availability**: Multi-node deployment, intelligent routing
* **Auto Failover**: Automatic switching when a model is unavailable
* **Load Balancing**: Intelligent request distribution, avoiding rate limits
* **Real-time Monitoring**: 24/7 service status monitoring

### 💰 Cost Optimization

* **Unified Billing**: All models use a unified balance
* **Transparent Pricing**: Clear pricing structure
* **Usage Statistics**: Detailed usage reports
* **Flexible Top-up**: Multiple payment methods supported

## 🎯 Key Features

### 🔥 Latest Models Available Immediately

* **Claude Opus 4.5**: SWE-bench 80.9%, top coding capability, price reduced to 1/3 of predecessor
* **Gemini 3 Pro Preview**: LMArena 1501 Elo #1 globally, 1M context
* **Nano Banana Pro**: 4K HD image generation, best-in-class text rendering
* **Seedance 2.0 Video Generation**: ByteDance's latest flagship, synchronized audio by default, high concurrency with no queuing

### 🚀 Stable, Reliable & Unlimited Concurrency

Official partner resources (AWS, Azure, Google Cloud, BytePlus), high-performance infrastructure support, unlimited concurrency, ensuring stable operation in multi-industry production environments.

### 💰 Ultimate Value

* Top-up bonus: Up to 80% discount
* Exchange rate advantage: USD pricing is more affordable
* Cache optimization: GPT-5.1 prompt caching saves 90% cost
* Pay-as-you-go: Flexible billing by token or per use

## 🚀 Get Started

Ready to begin? Just three steps:

<CardGroup cols={3}>
  <Card title="Register" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    Create your APIYI account
  </Card>

  <Card title="Get API Key" icon="key" href="/en/getting-started">
    Generate your API key
  </Card>

  <Card title="Integration" icon="code" href="/en/api-manual">
    View API docs to start integration
  </Card>
</CardGroup>

## 🔗 Quick Links

<CardGroup cols={2}>
  <Card title="Register Now" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    New accounts come with \$0.05 in trial credit — make your first call without topping up
  </Card>

  <Card title="Dashboard" icon="settings" href="https://api.apiyi.com/token">
    Manage API Keys, view usage statistics and billing
  </Card>
</CardGroup>

***

<Note>
  New accounts come with \$0.05 in trial credit — enough to run a Hello World against a lightweight model such as `gpt-5.4-mini` and confirm your integration works. Top up when you are ready for real usage; see the [recharge bonus policy](/en/faq/recharge-promotions).
</Note>
