> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Trae

> 字节跳动推出的 AI 原生 IDE，内置 Builder/Chat/Inline Chat 多模式智能体编程；通过自定义模型对接 API易，一键覆盖 OpenAI 与 Anthropic 两套协议、400+ 主流模型。

## 概述

**Trae** 是字节跳动于 2025 年 1 月推出的 **AI 原生 IDE**（AI-native IDE），定位为面向专业开发者的「Vibe Coding」生产力工具——用自然语言描述需求，AI 自动完成代码补全、缺陷修复、项目构建与一键预览。Trae 同时提供 **国内版**（`trae.cn`）与 **国际版**（`trae.ai`），并衍生出 **SOLO** 系列（SOLO Desktop / SOLO App / SOLO Web）让 AI 直接接管任务全流程。

通过 Trae 的「自定义模型」能力接入 API易后，你可以获得：

<CardGroup cols={2}>
  <Card title="🔌 双协议覆盖" icon="plug">
    同时配置 OpenAI 与 Anthropic 协议，一把令牌驱动两套服务商
  </Card>

  <Card title="🤖 400+ 主流模型" icon="layers">
    GPT、Claude、Gemini、DeepSeek、Doubao、Qwen 等一站打通
  </Card>

  <Card title="💰 ClaudeCode 95 折" icon="piggy-bank">
    创建令牌时选择 ClaudeCode 分组，Claude 系列享 95 折，可叠加充值优惠
  </Card>

  <Card title="🛡️ 国内外稳定直连" icon="shield">
    免去自建翻墙/代理网关，主域名 `api.apiyi.com` 国内可直连
  </Card>
</CardGroup>

<Info>
  **产品信息**

  * 🔗 国内版官网：`www.trae.cn`
  * 🔗 国际版官网：`www.trae.ai`
  * 👥 开发方：字节跳动（ByteDance）
  * 📅 首次发布：2025 年 1 月
  * 🧩 内置模式：Builder（智能体）/ Chat（侧边栏对话）/ Inline Chat（行内对话）
  * 🌐 兼容协议：OpenAI、Anthropic 等多种第三方接入
</Info>

## 核心功能

### 三种交互模式

* **Builder 模式**：AI 智能体接管任务，自动读写多文件、执行命令、构建项目
* **Chat 模式**：侧边栏对话，类似 Cursor Chat / Cline，适合查询与代码片段生成
* **Inline Chat**：在编辑器内直接 `Cmd/Ctrl + I` 唤起，行内补全和重构最快路径

### MCP 与工具生态

* 内置 **MCP（Model Context Protocol）** 支持，可接入外部工具与 API
* 支持 **Remote-SSH**：远程开发场景与本地体验一致
* `.rules` 项目级规则文件，约束 AI 行为风格

### 自定义模型（本文重点）

Trae 国际版自带 **Anthropic、OpenAI、Gemini、xAI、OpenRouter、Ollama、DeepSeek、火山引擎、阿里云、腾讯云、硅基流动、PPIO、Novita、BytePlus** 等服务商预设，每个预设都允许填写**自定义模型 ID + API Key + 自定义请求地址**——这正是把 API易 接进 Trae 的关键入口。

<Tip>
  **为什么要接 API易**：Trae 自带模型受地区与版本限制，且没法一键叠加上下游账单。接 API易 后，**一个令牌同时覆盖 OpenAI / Anthropic 两套协议**，模型切换不再需要回到设置面板换 Provider，直接在 Trae 顶部模型下拉里选即可。
</Tip>

<Warning>
  **⚠️ 模型兼容性必读（接入前先看）**

  1. **Trae 不支持 Responses 协议**：自定义模型只有 `/v1/chat/completions`（OpenAI 协议）和 `/v1/messages`（Anthropic 协议）两条通道。而 OpenAI 从 GPT-5.4 系列起把「推理 + 工具调用」限制在 `/v1/responses` 端点，所以 **`gpt-5.4` / `gpt-5.5` / `gpt-5.6` 全系在 Trae 的 Builder / Chat（带工具）场景直接报 400，等于用不了**——哪怕 `gpt-5.4` 也不行（详见下方常见问题）。
  2. **OpenAI 兼容 chat 模式做 Agent 体验差**：即便换不受限的 GPT 模型，chat 兼容模式对 Agent 工作流和高级工具权限的支持也不完整，Builder 模式容易跑不通、体验打折。
  3. **在 Trae 里推荐用 Claude 系列**：走 Anthropic 原生协议 `/v1/messages`，Builder 工具调用完整、稳定，是我们的首选推荐。
  4. **在 Trae 里用不了的模型（最新 GPT 系），请改用 [Codex APP](/scenarios/programming/codex-cli)**：Codex 原生走 Responses 协议，`gpt-5.6-sol` / `gpt-5.5` 等都能完整发挥。
</Warning>

## 快速开始

### 第一步：安装 Trae

<Tabs>
  <Tab title="国内版（推荐中国大陆用户）">
    访问 `www.trae.cn` 下载，支持 macOS 与 Windows。国内版内置豆包、DeepSeek 等模型，账号登录用手机号。
  </Tab>

  <Tab title="国际版">
    访问 `www.trae.ai` 下载，支持 macOS、Windows、Linux。国际版默认提供 GPT/Claude/Gemini 等海外模型预设。
  </Tab>
</Tabs>

### 第二步：获取 API易 令牌

1. 访问 API易 控制台令牌页面：`api.apiyi.com/token`
2. 点击「新建令牌」
3. **如果主要使用 Claude 系列**：选择 **【ClaudeCode】分组**，可享 **95 折优惠**（可叠加充值赠送 10%-20%）
4. **如果混用 GPT/Gemini/DeepSeek 等**：选择 **【Default】默认分组** 即可
5. 复制以 `sk-` 开头的密钥备用

### 第三步：在 Trae 中打开「自定义模型」入口

* **IDE 模式下**：点击右上角 ⚙️ 设置图标 → 左侧导航 **模型** → 点击「添加模型」/「自定义模型」
* **SOLO 模式下**：点击对话面板右上角 ⚙️ → **模型** → 添加

### 第四步：添加 OpenAI 协议入口（GPT / Gemini / DeepSeek / Doubao 等）

按下图填写，**自定义请求地址末尾必须带 `/v1/chat/completions` 完整路径**，不是只填域名：

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-openai.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=3b59889c3ae27a374a6da691beca2ffa" alt="Trae 自定义模型 - OpenAI 协议对接 API易，自定义请求地址 https://api.apiyi.com/v1/chat/completions" width="477" height="521" data-path="images/trae-custom-model-openai.png" />

| 字段          | 填写值                                                    | 说明                             |
| ----------- | ------------------------------------------------------ | ------------------------------ |
| **服务商**     | `OpenAI`                                               | 选择 OpenAI 预设                   |
| **模型**      | `自定义模型`                                                | 下拉里选最末尾的「自定义模型」                |
| **模型 ID**   | 如 `gpt-5.1`、`deepseek-v4-flash`、`gemini-3-pro-preview` | 填写要使用的模型完整 ID                  |
| **API 密钥**  | `sk-...`                                               | 粘贴上一步获取的 API易 令牌               |
| **自定义请求地址** | `https://api.apiyi.com/v1/chat/completions`            | **必须含 `/v1/chat/completions`** |

<Warning>
  **Base URL 必须带完整路径**：Trae 从 v3.3.51 起的自定义模型 baseURL 字段要求填**完整接口路径**，只填 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1` 都会报错。
</Warning>

<Note>
  **此入口适用的模型**：`gpt-5.1` / `gpt-5.2`、Gemini、DeepSeek、Doubao、Qwen 等走 chat 协议不受限的模型。**`gpt-5.4` 及更新的 GPT（5.5 / 5.6 系）不适用**——原因见上方「模型兼容性必读」，这些模型请改用 [Codex APP](/scenarios/programming/codex-cli)。
</Note>

### 第五步：添加 Anthropic 协议入口（Claude 系列）

如果你要用 Claude Opus 4.6 / Sonnet 4.6 / Haiku 4.5 等，再添加一个 Anthropic 服务商条目：

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-anthropic.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=18c4c41f103b88df7402ab92a99aa059" alt="Trae 自定义模型 - Anthropic 协议对接 API易，自定义请求地址 https://api.apiyi.com/v1/messages" width="476" height="440" data-path="images/trae-custom-model-anthropic.png" />

| 字段          | 填写值                                   | 说明                                                 |
| ----------- | ------------------------------------- | -------------------------------------------------- |
| **服务商**     | `Anthropic`                           | 选择 Anthropic 预设                                    |
| **模型**      | `Claude-Sonnet-4.6`（或下拉里其他 Claude 版本） | 直接选官方预设，不必走「自定义模型」                                 |
| **API 密钥**  | `sk-...`                              | 粘贴 API易 令牌（建议用 ClaudeCode 分组的令牌）                   |
| **自定义请求地址** | `https://api.apiyi.com/v1/messages`   | **必须含 `/v1/messages`**，注意不是 `/v1/chat/completions` |

<Info>
  **两套协议的差别**：OpenAI 协议走 `/v1/chat/completions`，Anthropic 协议走 `/v1/messages`。API易 同时托管两套端点，所以同一把令牌可以在 Trae 里同时绑两个服务商条目，互不干扰。
</Info>

### 第六步：切换模型开干

回到编辑器，点击顶部模型下拉框，刚才添加的两个服务商和它们下面的模型都会出现在列表里。选中即可开始对话或进入 Builder 模式。

## 推荐模型搭配

<CardGroup cols={2}>
  <Card title="日常编程（性价比）" icon="code">
    **Claude Sonnet 4.6**（Anthropic 协议）+ **GPT-5.1**（OpenAI 协议）

    Sonnet 4.6 编程能力极强、性价比高；GPT-5.1 在 Chat 模式回复更快
  </Card>

  <Card title="复杂架构（旗舰）" icon="crown">
    **Claude Opus 4.6**（Anthropic 协议）

    复杂重构、跨文件分析、架构决策首选；建议配合 Builder 模式
  </Card>

  <Card title="深度推理" icon="brain">
    **Claude Sonnet 4.6 Thinking** / **GPT-5.1 Thinking**

    强制启用思维链，适合算法题、逻辑推理、安全审计
  </Card>

  <Card title="国产高性价比" icon="banknote">
    **DeepSeek V4** / **Doubao 1.5 Pro** / **Qwen3 Coder**

    走 OpenAI 协议接入，单价低、中文输出自然
  </Card>
</CardGroup>

<Info>
  **为什么推荐清单里没有最新 GPT（5.4 及更新）**：Trae 不支持 Responses 协议，`gpt-5.4` / `gpt-5.5` / `gpt-5.6` 全系在 Builder / Chat 的工具调用场景会直接 400（见上方「模型兼容性必读」）。想用这批模型请转 [Codex APP](/scenarios/programming/codex-cli)；在 Trae 内做 Agent 任务，Claude 系列（Anthropic 原生协议）是最稳的选择。
</Info>

<Card title="查看完整模型列表与编程模型推荐" icon="star" href="/api-capabilities/model-info">
  API易 通过统一接口提供 400+ 主流模型，模型推荐页持续更新最新性能与价格对比。
</Card>

## 使用技巧

<Steps>
  <Step title="两个服务商条目同时保留">
    OpenAI 与 Anthropic 两个入口建议**都加上**，这样切换 GPT/Gemini ↔ Claude 时不用回设置改 baseURL。
  </Step>

  <Step title="模型 ID 找不到？">
    Trae 默认列出的官方模型号往往跟不上 API易 最新模型节奏。**选「自定义模型」手动填模型 ID** 是最稳妥的做法——以 API易 控制台 / 模型推荐页公布的 ID 为准。
  </Step>

  <Step title="Builder 模式优先选 Claude">
    Builder 智能体会自动多轮工具调用，Claude 系列（尤其是 Sonnet 4.6 / Opus 4.6）在指令跟随和工具调用稳定性上明显优于其他家。
  </Step>

  <Step title="复杂任务挂 Thinking 模型">
    模型 ID 后面加 `-thinking` 后缀（如 `claude-sonnet-4-6-thinking`），可强制启用思维链。在 Builder 模式做架构决策、安全审计时显著降低翻车率。
  </Step>

  <Step title="令牌按分组拆开管理">
    Claude 系列单独建一把 **ClaudeCode 分组令牌**（95 折）；GPT/Gemini/DeepSeek 用 **Default 分组令牌**。两把令牌分别贴到两个服务商条目，账单与配额一目了然。
  </Step>
</Steps>

## 常见问题

<AccordionGroup>
  <Accordion title="Trae 国内版 vs 国际版，对接 API易 有差别吗？">
    **没差别**——两个版本都支持自定义模型，且都允许同时添加 OpenAI 与 Anthropic 两类服务商条目。区别主要在内置预设模型不同（国内版主推豆包/DeepSeek，国际版主推 GPT/Claude/Gemini）。

    选择建议：中国大陆网络环境优先国内版（`trae.cn`），全球团队协作或需要海外模型预设走国际版（`trae.ai`）。
  </Accordion>

  <Accordion title="为什么 baseURL 必须填到 /v1/chat/completions 这一级？">
    Trae 从 **v3.3.51** 起调整了自定义模型的 baseURL 解析规则：直接把这个字段拼到请求里，不再做「自动补 `/chat/completions`」的兼容处理。

    所以正确写法：

    * OpenAI 协议：`https://api.apiyi.com/v1/chat/completions`
    * Anthropic 协议：`https://api.apiyi.com/v1/messages`

    错误写法（会触发 404 或路由错误）：

    * ❌ `https://api.apiyi.com`
    * ❌ `https://api.apiyi.com/v1`
  </Accordion>

  <Accordion title="Anthropic 服务商下能用「自定义模型」填任意模型 ID 吗？">
    可以。Trae 的 Anthropic 服务商条目同样支持「自定义模型」选项，填入 `claude-opus-4-6` / `claude-sonnet-4-6-thinking` / `claude-haiku-4-5-20251001` 等具体模型 ID 即可。API易 的 `/v1/messages` 端点对官方模型 ID 完全兼容。
  </Accordion>

  <Accordion title="如何享受 Claude 系列 95 折？">
    在 API易 控制台 `api.apiyi.com/token` 创建令牌时，**分组选 ClaudeCode** 即可自动享受 95 折优惠（5% off），可叠加充值赠送 10%-20%。

    把这把 ClaudeCode 分组令牌粘到 Trae 的 Anthropic 服务商条目里，Claude 调用就自动走折扣。
  </Accordion>

  <Accordion title="为什么我在 Trae 里看不到 GPT-5.1 / Claude 4.6 等新模型？">
    Trae 内置预设的模型号更新会滞后于实际供给方。**最佳实践是直接选「自定义模型」手动填 ID**——只要 API易 后端支持的模型，你就能在 Trae 里跑起来，不必等 Trae 客户端更新预设。
  </Accordion>

  <Accordion title="Builder 模式经常卡住 / 工具调用失败怎么办？">
    1. **优先用 Claude Sonnet 4.6 或 Opus 4.6**：这两款在工具调用稳定性上明显领先
    2. **避开非推理版本的小模型**：DeepSeek-Chat / Qwen 系列做 Builder 容易死循环，建议切到带 `thinking` 后缀的推理版本
    3. **检查上下文长度**：单文件超长或多文件大改时切到 Opus 4.6（200K 上下文）
    4. **观察 API易 实时动态**：偶发的上游波动会影响所有客户端，确认是否为通道问题
  </Accordion>

  <Accordion title="调用 gpt-5.6 / gpt-5.5 / gpt-5.4 报 400：Function tools with reasoning_effort are not supported？">
    完整报错通常长这样：`Function tools with reasoning_effort are not supported for gpt-5.6-sol in /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'.`（400，`invalid_request_error`）。

    这是 **OpenAI 从 GPT-5.4 系列起的官方限制**，不是 API易 通道问题：在 `/v1/chat/completions` 端点上，function tools（工具/函数调用）不能与非 `none` 的 `reasoning_effort` 同时使用。OpenAI 给的两条出路：改用 `/v1/responses` 端点，或显式把 `reasoning_effort` 设为 `none`（放弃推理）。这条限制的完整判断方法与迁移步骤见 [端点选型与迁移](/api-capabilities/openai/responses-migration)。

    问题在于 Trae 这两条都做不到：自定义模型只支持 `/v1/chat/completions`（OpenAI 协议）和 `/v1/messages`（Anthropic 协议），不支持 Responses API，也没有 `reasoning_effort` 设置项；而 Builder / Chat 模式必然携带工具定义——**客户端侧无法绕过**。JetBrains AI Assistant、opencode 等同类客户端也在 GPT-5.4+ 上踩过同一个坑。

    解决办法：

    1. **在 Trae 中改用不受限模型**：`gpt-5.1` / `gpt-5.2`（OpenAI 协议），或 Claude 系列（Anthropic 协议走 `/v1/messages`）、Gemini / DeepSeek 等
    2. **不离开 Trae**：在 Trae 中安装 [Roo Code](/scenarios/programming/roo-code) 插件，其「OpenAI」provider 走 `/v1/responses`，实测在 Trae 内工具调用正常——相当于补上 Responses 通道。注意 Roo Code 已停更，预置模型止步 `gpt-5.4`
    3. **必须用 gpt-5.5 / 5.6 的推理 + 工具调用**：改用支持 Responses API 的客户端——[Codex APP / CLI](/scenarios/programming/codex-cli)、[opencode](/scenarios/programming/opencode) 均可，完整支持清单与调用方式见 [OpenAI Responses API 原生调用指南](/api-capabilities/openai/native)
  </Accordion>

  <Accordion title="Trae 的隐私 / 数据上传如何处理？">
    Trae 是字节跳动开发的客户端，会按其官方隐私政策上传必要的遥测与对话数据。如果你对客户端遥测敏感，建议：

    * 在企业网络出口做白名单控制
    * 关键代码片段开 Builder 模式前做脱敏
    * 选择 [`Claude Code`](/scenarios/programming/claude-code) / [`Cline`](/scenarios/programming/cline) 等开源/可审计客户端作为备选
  </Accordion>

  <Accordion title="Trae 与 Cursor / Cline / Claude Code 怎么选？">
    | 工具              | 类型         | Agent 模式  | 接 API易 难度      | 适合场景                         |
    | --------------- | ---------- | --------- | -------------- | ---------------------------- |
    | **Trae**        | 独立 IDE     | ✅ Builder | 中（双协议两条目）      | 想要 Cursor 体验但首选国产 IDE / 中文场景 |
    | **Cursor**      | 独立 IDE     | ❌（仅 Chat） | 易（仅 OpenAI 协议） | 注重补全和代码差异预览                  |
    | **Cline**       | VS Code 插件 | ✅         | 易              | 已是 VS Code 重度用户              |
    | **Claude Code** | CLI        | ✅         | 易              | 终端流派、CI / 远程开发               |

    详见各页面：[Cursor](/scenarios/programming/cursor) · [Cline](/scenarios/programming/cline) · [Claude Code](/scenarios/programming/claude-code) · [Codex CLI](/scenarios/programming/codex-cli)
  </Accordion>

  <Accordion title="请求报 401 / 403 怎么排查？">
    1. 确认 API 密钥以 `sk-` 开头且没有粘多余空格
    2. 确认 baseURL 拼写正确，特别是末尾路径（`/v1/chat/completions` vs `/v1/messages`）
    3. 在 API易 控制台检查令牌状态是否启用、是否在分组里绑定了对应模型
    4. 余额不足也会返回 401，确认账户余额
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="模型推荐" icon="star" href="/api-capabilities/model-info">
    400+ 模型的性能对比与编程场景推荐
  </Card>

  <Card title="API易 控制台" icon="settings" href="https://api.apiyi.com">
    创建令牌、查看用量、管理分组
  </Card>

  <Card title="Cursor 接入" icon="mouse-pointer-click" href="/scenarios/programming/cursor">
    另一款主流 AI IDE 的对接教程
  </Card>

  <Card title="Cline 插件接入" icon="puzzle" href="/scenarios/programming/cline">
    VS Code 内功能完整的 Agent 模式插件
  </Card>

  <Card title="Codex APP 接入" icon="code" href="/scenarios/programming/codex-cli">
    原生 Responses 协议，最新 GPT 系（5.4+）的正确打开方式
  </Card>
</CardGroup>

<Info>
  **更多帮助**：访问 API易 官网 `api.apiyi.com` 或加入官方社群获取技术支持。
</Info>
