> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易 - 企业级 AI 大模型 API 中转站

> 专业稳定的 AI API 聚合服务商，已上线两年，月均 15 万访客，长期可靠服务

<Info>
  **International users?** [Switch to English version](/en)
</Info>

**API易** 是企业级专业稳定的 AI 大模型 API 中转站，兼容统一的 OpenAI API 标准，同时支持 Claude、Gemini 等各大厂商的原生 API 格式，覆盖 400+ 热门AI模型。一个令牌，即可轻松调用OpenAI、Claude、Gemini、DeepSeek、Qwen、Kimi、GLM、Minimax 等所有主流大模型。

## 🏢 公司背景

* 主体运营公司：APIYI, LLC（美国）
* 官方资源合作：Google Aistudio、微软Azure、亚马逊AWS（额度来源正规，放心使用）
* 服务保障：
  * 稳定：提供 OpenAI、Claude、Google Gemini 等主流模型的高并发和稳定服务
  * 可信：
    * 已有众多知名应用在生产环境中稳定接入（见 使用场景 栏目）。
    * 已合作知名高校、医院等单位，已服务知名企业。
    * 国内主体可以对公支付，开具发票，协助提供采购清单等报销无忧。

## 🛡️ 中转站鱼龙混杂？求个安心

<Info>
  市面上 API 中转站良莠不齐——偷换模型、静默降智、跑路失联的故事并不少见。API易 不靠口头承诺，只给你可验证的依据。
</Info>

<CardGroup cols={3}>
  <Card title="上线满 2 年" icon="calendar-check" href="/faq/enterprise-trust">
    月均 15 万访客，长期稳定运营，不是短线新站
  </Card>

  <Card title="30 天无理由退款" icon="rotate-ccw" href="/faq/refund-policy">
    充值后 30 天内，未使用余额原路退回，微信/支付宝免手续费
  </Card>

  <Card title="纯官转 · 模型保真" icon="shield-check" href="/faq/enterprise-trust">
    不路由、不降智、不偷换模型，保真度可自行验证
  </Card>

  <Card title="务实的 SLA 保障" icon="file-check" href="/faq/sla-guarantee">
    异常计费补偿、故障额度补发，企业合同可约定 SLA
  </Card>

  <Card title="数据安全" icon="lock" href="/faq/data-security">
    透明代理，不留存对话内容，最小化日志
  </Card>

  <Card title="对公支付 · 报销无忧" icon="receipt" href="/faq/university-reimbursement">
    支持开发票、对公转账，高校/医院/企业报销友好
  </Card>
</CardGroup>

## 🤖 三种方式，让 AI 替你接入

不用翻文档、不用手填配置。看你手边是哪种 AI，把对应那段话复制给它，剩下的它来做。

<Tabs>
  <Tab title="Skills · 聊天 Agent" icon="sparkles">
    **在 OpenClaw 这类对话 Agent 里用自然语言调用 API易。** 复制提示词发给 Agent，它会自动安装技能、自检 Key，并引导你完成配置。

    <Prompt description="复制后发给 OpenClaw、Claude Code、Cursor 等支持 Skills 的 Agent" icon="bot" actions={["copy"]}>
      从 [https://docs.apiyi.com](https://docs.apiyi.com) 安装 API易（APIYI）技能：优先 `npx skills add https://docs.apiyi.com`；
      如果你是 OpenClaw，改装 `git:apiyi-com/skills`；都不行就直接读 [https://docs.apiyi.com/skill.md。](https://docs.apiyi.com/skill.md。)
      装好后先自检 Key（技能里的 scripts/apiyi.py --check 或 npx apiyi\@latest check），
      缺 Key 就引导我去 [https://api.apiyi.com/token](https://api.apiyi.com/token) 复制，存进环境变量 APIYI\_API\_KEY，不要硬编码。
      自检 ready 后用 gpt-5.4-mini 发一句「你好」，把返回贴给我。
    </Prompt>

    技能源码 `github.com/apiyi-com/skills` · 三种安装方式与 Key 配置见 [AI 开发者套件](/developer-kit#skills-技能包)
  </Tab>

  <Tab title="CLI · 终端" icon="terminal">
    **在终端里跑通第一次调用，一行代码都不用写。** `npx apiyi@latest check` 零安装：检查 Key、测节点延迟、列模型、发消息、出图。

    <Prompt description="复制后发给任何能执行终端命令的 Agent，或自己逐行执行" icon="terminal" actions={["copy"]}>
      请帮我安装并跑通 API易 命令行工具：[https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
      要求：Node 18 以上；直接 `npx apiyi@latest check` 零安装；
      引导我配置 API Key（`npx apiyi@latest auth set-key` 或环境变量 APIYI\_API\_KEY，从 [https://api.apiyi.com/token](https://api.apiyi.com/token) 复制）；
      最后跑 `npx apiyi@latest models --grep gpt-5` 和 `npx apiyi@latest chat "你好" -m gpt-5.4-mini`，把输出贴给我。
    </Prompt>

    源码 `github.com/apiyi-com/cli` · npm 包名 `apiyi` · 完整命令表见 [AI 开发者套件](/developer-kit#cli-命令行)
  </Tab>

  <Tab title="AI 开发者套件 · 编程 Agent" icon="code">
    **让 Cursor / Claude Code / Codex 先读契约再写代码。** skill.md 是规则，llms.txt 是索引，model-registry.json 是模型事实来源。读完先解释、再动手，不编造端点。

    <Prompt description="复制后发给 Cursor、Claude Code、Codex 等编程 Agent" icon="code" actions={["copy"]}>
      请先完整阅读 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 和 [https://docs.apiyi.com/llms.txt。](https://docs.apiyi.com/llms.txt。)
      你必须遵守 API易 的接入规则：不要编造 endpoint、参数名、枚举值或响应结构。
      模型 ID 以 [https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) 为唯一事实来源（带点号、区分大小写，如 gpt-5.4-mini）。
      Base URL 按 SDK 选：OpenAI SDK 用 [https://api.apiyi.com/v1，Anthropic](https://api.apiyi.com/v1，Anthropic) 与 Google GenAI SDK 用 [https://api.apiyi.com（Gemini](https://api.apiyi.com（Gemini) 另设 api\_version 为 v1beta）。
      Key 只从环境变量 APIYI\_API\_KEY 读。读完后先解释你理解的接入流程，不要立即编辑代码。
    </Prompt>

    套件里有什么、每个文件怎么用：[AI 开发者套件](/developer-kit)
  </Tab>
</Tabs>

## 🌟 优势模型推荐

<CardGroup cols={3}>
  <Card title="Nano Banana Pro/2 系列" icon="image" href="/api-capabilities/nano-banana-pricing">
    **🎨 图像生成**

    当下最强，4K仅需

    **\$0.09** /张

    🎯 低至官网 30.3%
  </Card>

  <Card title="Claude 官转系列" icon="sparkles" href="/api-capabilities/claude">
    **🤖 对话与编程**

    AWS + 官方双通道纯官转，高缓存命中

    ⚡ 官网 8 折出头
  </Card>

  <Card title="GPT-image-2 全系列" icon="images" href="/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    **🖼️ 图像生成**

    官转 + 官逆（-all/-vip）全覆盖

    🎯 按需选择，丰俭由人
  </Card>

  <Card title="Gemini 全系列多模态" icon="gem" href="/api-capabilities/model-info">
    **🔥 多模态**

    文本/图像/视频全系列模型

    🏆 Gemini 3.1 Pro 性能领先
  </Card>

  <Card title="OpenAI 全系列多模态" icon="bot" href="/api-capabilities/model-info">
    **🚀 多模态**

    GPT / o 系列、图像、视频、语音

    ✅ 全系列稳定支持
  </Card>
</CardGroup>

## 📖 产品基础

<CardGroup cols={2}>
  <Card title="快速开始" icon="rocket" href="/getting-started">
    三步完成接入，立即开始使用 AI 模型
  </Card>

  <Card title="API手册" icon="book" href="/api-manual">
    完整的接口文档和开发者指南
  </Card>

  <Card title="AI 开发者套件" icon="bot" href="/developer-kit">
    🤖 技能包、命令行、给编程 Agent 的契约与模型注册表
  </Card>

  <Card title="网站公告" icon="megaphone" href="/changelog">
    🔥 最新模型上线、价格调整等重要更新
  </Card>

  <Card title="定价信息" icon="tag" href="/pricing">
    查看所有模型的详细定价和优惠信息
  </Card>
</CardGroup>

## 🔧 核心接口

<CardGroup cols={2}>
  <Card title="对话补全 API" icon="message-circle" href="/api-manual">
    Chat Completions - 创建多轮对话和文本生成
  </Card>

  <Card title="模型列表 API" icon="list" href="/api-capabilities/model-info">
    Models API - 获取所有可用模型信息
  </Card>

  <Card title="图像生成 API" icon="image" href="/api-capabilities/image-video-models">
    Images API - Nano Banana Pro、gpt-image-2 等图像生成
  </Card>

  <Card title="嵌入向量 API" icon="vector-square" href="/api-manual#embeddings-api">
    Embeddings API - 文本向量化和语义搜索
  </Card>
</CardGroup>

## ⚡ API 能力

### 🎬 视频生成 API

<CardGroup cols={2}>
  <Card title="Seedance 2.0 视频生成" icon="film" href="/api-capabilities/seedance2/overview">
    🔥 字节跳动最新旗舰，标准 / fast / mini 三档，默认同步音频，高并发不排队
  </Card>

  <Card title="Wan2.7 通义万相" icon="videotape" href="/api-capabilities/wan/overview">
    阿里官方通道，文生 / 图生 / 参考生视频 + 视频编辑，\$0.42/条起
  </Card>

  <Card title="VEO 3.1 视频生成" icon="clapperboard" href="/api-capabilities/veo-3-1-official/overview">
    谷歌官转通道，按次计费 \$0.3/次起，支持 720p / 1080p / 4K
  </Card>

  <Card title="人物一致性视频" icon="images" href="/api-capabilities/seedance2/asset-library">
    Seedance 素材库，上传图片入库后引用生成人物一致性视频
  </Card>

  <Card title="视频理解 API" icon="eye" href="/api-capabilities/video-understanding">
    智能视频分析，场景识别、内容理解
  </Card>
</CardGroup>

### 🎨 图像生成 API

<CardGroup cols={2}>
  <Card title="Nano Banana Pro" icon="banana" href="/api-capabilities/nano-banana-image/overview">
    🔥 本站最强，4K 高清，业界最佳文本渲染，\$0.09/张
  </Card>

  <Card title="Nano Banana 2" icon="banana" href="/api-capabilities/nano-banana-2-image/overview">
    🔥 支持按量计费，新增 1:8/8:1 长图，\$0.055/张（按量 \$0.025 起）
  </Card>

  <Card title="Nano Banana Lite" icon="zap" href="/api-capabilities/nano-banana-lite-image/overview">
    🆕 谷歌最快最省，约 4s 出图，\$0.025/张
  </Card>

  <Card title="gpt-image-2.5 / 2 系列" icon="images" href="/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    OpenAI 官转 2.5-flare / 2.5-sunburst / 2 原生 4K + 官逆 -all/-vip \$0.03/张，按需选择
  </Card>

  <Card title="Seedream 5.0/4.5" icon="sparkles" href="/api-capabilities/seedream-image/overview">
    火山方舟官方合作，速度快、输出 URL，\$0.035/张起
  </Card>

  <Card title="Flux 2 系列" icon="wand-sparkles" href="/api-capabilities/flux/overview">
    🆕 FLUX.2 max/pro/flex 三档，\$0.03/次起
  </Card>
</CardGroup>

### 🔧 基础 API

<CardGroup cols={2}>
  <Card title="模型信息" icon="database" href="/api-capabilities/model-info">
    查看支持的 400+ AI 模型详细信息
  </Card>

  <Card title="OpenAI SDK 接入" icon="code" href="/api-capabilities/openai/compatible">
    使用官方 SDK 无缝接入 API易
  </Card>

  <Card title="图像理解 API" icon="eye" href="/api-capabilities/vision-understanding">
    智能图像分析，OCR、对象识别、场景描述
  </Card>

  <Card title="Claude 原生格式" icon="messages-square" href="/api-capabilities/claude">
    Anthropic 原生 API 格式，完整功能支持
  </Card>

  <Card title="Gemini 原生格式" icon="gem" href="/api-capabilities/gemini/native">
    谷歌原生 API 格式，完整功能支持
  </Card>

  <Card title="文本嵌入 API" icon="vector-square" href="/api-capabilities/text-embedding">
    文本向量化和语义搜索
  </Card>
</CardGroup>

## 🎯 使用场景

### 💬 对话型 AI

<CardGroup cols={2}>
  <Card title="Cherry Studio" icon="cherry" href="/scenarios/chat/cherry-studio">
    功能强大的 AI 对话客户端，支持多模型切换
  </Card>

  <Card title="Chatbox" icon="message-square" href="/scenarios/chat/chatbox">
    跨平台桌面 AI 对话应用
  </Card>

  <Card title="Open WebUI" icon="globe" href="/scenarios/chat/open-webui">
    自托管的 Web 对话界面
  </Card>

  <Card title="ChatGPT Next Web" icon="app-window" href="/scenarios/chat/chatgpt-next-web">
    一键部署的网页版 ChatGPT
  </Card>
</CardGroup>

### 💻 编程开发

<CardGroup cols={2}>
  <Card title="Claude Code" icon="terminal" href="/scenarios/programming/claude-code">
    🔥 Anthropic 官方 AI 编程助手
  </Card>

  <Card title="Cursor" icon="mouse-pointer-click" href="/scenarios/programming/cursor">
    AI 驱动的代码编辑器
  </Card>

  <Card title="Cline (VS Code)" icon="code" href="/scenarios/programming/cline">
    VS Code 中的 AI 编程助手
  </Card>

  <Card title="Roo Code" icon="rocket" href="/scenarios/programming/roo-code">
    高效的 AI 代码生成工具
  </Card>

  <Card title="Codex CLI" icon="square-terminal" href="/scenarios/programming/codex-cli">
    命令行 AI 编程助手
  </Card>

  <Card title="Gemini CLI" icon="gem" href="/scenarios/programming/gemini-cli">
    谷歌 Gemini 命令行工具
  </Card>
</CardGroup>

### 🔧 技术工程

<CardGroup cols={2}>
  <Card title="LangChain" icon="link" href="/scenarios/engineering/langchain">
    构建 AI 应用的开发框架
  </Card>

  <Card title="Dify" icon="workflow" href="/scenarios/engineering/dify">
    可视化 AI 应用开发平台
  </Card>
</CardGroup>

### 🌐 翻译场景

<CardGroup cols={2}>
  <Card title="Bob 翻译" icon="languages" href="/scenarios/translation/bob">
    macOS 上的专业翻译工具
  </Card>

  <Card title="沉浸式翻译" icon="globe" href="/scenarios/translation/immersive">
    浏览器双语对照阅读扩展
  </Card>
</CardGroup>

## 🚀 为什么选择 API易？

### 一个接口，多种模型

无需为每个 AI 服务单独申请账号和管理 API 密钥。通过 API易，您只需要：

* **一个账号**：管理所有 AI 服务
* **一个 API 密钥**：访问所有模型
* **一套接口标准**：兼容 OpenAI API 格式

### 💡 支持的模型

我们支持业界领先的 400+ AI 模型：

#### OpenAI 系列

* GPT-5.1 全系列（最新迭代，智能与速度平衡）
* GPT-5 / GPT-5 Mini / GPT-5 Nano
* o3 / o3 Pro / o4-mini（推理模型）
* GPT-4.1 / GPT-4o 系列
* Codex 系列（编程专用）
* DALL·E 3 / GPT-Image-1

#### Anthropic 系列

* **Claude Opus 4.5**（🔥 最新旗舰，SWE-bench 80.9%）
* Claude Sonnet 4.5（世界级编码模型）
* Claude Haiku 4.5（高性价比）
* Claude 4 Sonnet / Claude 4 Opus

#### Google 系列

* **Gemini 3 Pro Preview**（🔥 LMArena 全球第一）
* **Nano Banana Pro**（🔥 4K 高清图像生成）
* Gemini 2.5 Pro（2M 上下文）
* Gemini 2.5 Flash（快速响应）

#### xAI Grok 系列

* **Grok 4.5**（🔥 最新旗舰，代码与 Agent）
* Grok 4.3 / Grok 4.20 系列（100万上下文）
* Grok Build 0.1（代码专用）
* Grok 4.20 Multi-Agent（多智能体协作）
* [调用指南](/api-capabilities/grok/overview)（联网搜索 / X 搜索 / 代码执行实测可用）

#### 国产模型

* DeepSeek V3.2 / V3.1 / R1（混合推理）
* GLM-4.6 / GLM-4.5（智谱 AI）
* Kimi K2（火山引擎官方）
* 通义千问（Qwen 系列）
* 文心一言 4.0（ERNIE）
* 讯飞星火 3.5

#### 视频生成模型

* **Seedance 2.0**（🔥 字节最新，默认同步音频）
* **Wan2.7**（阿里通义万相，含视频编辑）
* VEO 3.1（谷歌官转，最高 4K）
* Sora 2 / Sora 2 Pro（OpenAI 官转）

#### 图像生成模型

* Nano Banana Pro（4K 高清）
* Flux / SeeDream（专业级）
* Sora Image（逆向生图）

### 🔧 简单易用

切换模型就像修改一个参数一样简单：

```python theme={null}
# 使用 GPT-4
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)

# 切换到 Claude 3
response = openai.ChatCompletion.create(
    model="claude-3-opus-20240229",  # 只需修改模型名称
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 🛡️ 稳定可靠

* **高可用性**：多节点部署，智能路由
* **自动降级**：模型不可用时自动切换
* **负载均衡**：智能分配请求，避免限流
* **实时监控**：24/7 服务状态监控

### 💰 成本优化

* **统一计费**：所有模型使用统一余额
* **透明定价**：清晰的价格体系
* **用量统计**：详细的使用报告
* **灵活充值**：支持多种支付方式

## 🎯 核心特色

### 🔥 最新模型第一时间上线

* **Claude Opus 4.5**：SWE-bench 80.9%，编程能力登顶，价格降至前代 1/3
* **Gemini 3 Pro Preview**：LMArena 1501 Elo 全球第一，100万上下文
* **Nano Banana Pro**：4K 高清图像生成，业界最佳文本渲染
* **Seedance 2.0 视频生成**：字节最新旗舰，默认同步音频，高并发不排队

### 🚀 稳定可靠、并发无上限

官方合作伙伴资源（AWS、Azure、Google Cloud、BytePlus火山方舟），高性能基础架构支撑，不限并发，保障多行业生产环境稳定运行。

### 💰 极致性价比

* 充值加赠活动：最高可达 8 折优惠
* 汇率优势：美元计价更实惠
* 缓存优化：GPT-5.1 提示缓存节省 90% 成本
* 按需付费：按 Token 或按次灵活计费

## 🚀 开始使用

准备好开始了吗？只需三步即可开始：

<CardGroup cols={3}>
  <Card title="注册账号" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    创建您的 API易 账号
  </Card>

  <Card title="获取密钥" icon="key" href="/getting-started">
    生成您的 API 密钥
  </Card>

  <Card title="接入使用" icon="code" href="/api-manual">
    查看 API 文档开始集成
  </Card>
</CardGroup>

## 🔗 快速链接

<CardGroup cols={2}>
  <Card title="立即注册" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    注册账号即自带 \$0.05 试用额度，无需充值即可跑通第一次调用
  </Card>

  <Card title="管理控制台" icon="settings" href="https://api.apiyi.com/token">
    管理API Key（令牌），查看使用统计和账单
  </Card>
</CardGroup>

***

<Note>
  注册后账号自带 \$0.05 试用额度，用 `gpt-5.4-mini` 这类轻量模型足够跑通 Hello World、验证接入是否正常。想正式使用再充值，[充值加赠政策见这里](/faq/recharge-promotions)。
</Note>
