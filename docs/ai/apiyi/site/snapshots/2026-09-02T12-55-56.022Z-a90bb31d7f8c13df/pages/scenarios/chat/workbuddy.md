> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# WorkBuddy

> 腾讯出品的全场景 AI 办公工作台，说出要求、自动规划执行、交付完整成果，可通过 API易 一把密钥接入任意大模型

<Tip>
  腾讯出品的全场景 AI 办公工作台，说出要求、自动规划执行、交付完整成果，可通过 API易 一把密钥接入任意大模型。
</Tip>

## 概述

WorkBuddy 是腾讯出品的 AI Agent 办公新范式产品，主打「**说出要求、开始执行任务、交付完整成果**」——区别于传统对话式 AI 只给建议、只出文字回复，WorkBuddy 能理解自然语言指令，自主拆解任务、规划步骤并执行操作，支持文档、表格、PPT、数据分析等多模态任务处理，还能读取授权的本地文件夹进行批量处理，直接交付可验收的成果（周报、会议纪要、PPT、数据看板等）。

WorkBuddy 内置了混元、GLM、MiniMax、Kimi、DeepSeek 等主流模型（通过腾讯云 Token Plan 提供），同时也支持在「模型配置」中自行接入任意第三方大模型作为调用底座。通过对接 API易，您可以获得：

| 能力         | 说明                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| 🧩 一把密钥全模型 | 无需分别注册各家账号，一个 API易 密钥即可在 WorkBuddy 中调用 GPT / Claude / Gemini / DeepSeek 等全模型矩阵 |
| 🔐 密钥本地保存  | 配置（含 API Key）仅保存在本机 `workbuddy/models.json`，不上传云端                              |
| ⚡ 图形化一键接入  | 设置 → 模型 → 自定义，填入接口地址、密钥、模型名即可保存使用，无需改配置文件                                      |
| 💰 按量自主付费  | 自定义模型产生的费用由您直接向 API易 结算，不占用 WorkBuddy 自身积分/套餐额度                                |

> ℹ️ **产品信息**：WorkBuddy 由腾讯出品，官网 `www.workbuddy.cn`，官方文档 `www.workbuddy.cn/docs/workbuddy/Overview`。

## 安装

WorkBuddy 目前提供 **Windows / macOS** 桌面客户端，从官网下载安装包后双击安装即可，无需命令行操作：

| 平台      | 获取方式                                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| 官网首页    | `www.workbuddy.cn`，点击下载按钮获取当前平台的安装包                                                       |
| Windows | 参考官方《Windows 安装指南》：`/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide` |
| macOS   | 参考官方《Mac 安装指南》：`/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Mac-Guide`     |
| 历史版本    | 官方文档《历史版本下载》：`/docs/workbuddy/Download-History`                                           |

安装完成后打开 WorkBuddy，登录账号即可在「新建任务栏」直接用一句话下达任务，或按官方《快速开始》/《开启你的第一个任务》引导熟悉基本操作。

## 接入 API易

WorkBuddy 的模型配置弹窗**仅支持 OpenAI 兼容协议 API**（弹窗顶部会标注「仅支持 OpenAI 兼容协议 API」）。API易 提供标准的 **OpenAI 兼容 API**，选择「自定义 / Custom」供应商即可接入，一次拿到全模型矩阵（GPT / Claude / Gemini / DeepSeek / 智谱 / Kimi 等）。

### 图形界面配置（唯一方式，推荐）

在 WorkBuddy 中打开 **设置 → 模型**，点击「添加模型」，按下表填写：

| 字段      | 填写内容                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 提供商     | 选择 `自定义 / Custom`                                                                                                                     |
| 接口地址    | `https://api.apiyi.com/v1/chat/completions`（需**完整填写**到 `/chat/completions`，不要只填 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1`） |
| API Key | 你的 API易 密钥（`sk-...`）                                                                                                                  |
| 模型名称    | 填入想用的模型 ID，如 `claude-sonnet-5`、`gpt-5.4`、`deepseek-v3.2`、`kimi-k2.6`                                                                  |
| 高级配置    | 按所选模型的实际能力手动勾选，见下方说明                                                                                                                  |

<img src="https://mintcdn.com/apiyillc/hVgOxBLyKM6-uzFJ/images/workbuddy-model-config-zh.png?fit=max&auto=format&n=hVgOxBLyKM6-uzFJ&q=85&s=d52fe72d995e805cc4a587d6aada814b" alt="WorkBuddy 自定义模型配置弹窗示例（仅支持 OpenAI 兼容协议 API）" width="660" height="639" data-path="images/workbuddy-model-config-zh.png" />

> ℹ️ **关于「高级配置」能力标记**：选择腾讯云 Token Plan 等**标准供应商**时，工具调用 / 图片输入等能力标记会自动写入；但选择**自定义 / Custom** 接入 API易 时不会自动识别，需要根据所选模型的实际能力**手动勾选**：
>
> * 请以你所填模型 ID 的**真实能力**为准逐项勾选，不确定时建议**宁可少勾、不要多勾**——如上方截图 `claude-sonnet-5` 示例仅勾选了工具调用
> * 确认所用模型确实支持图片输入，或具备推理增强能力后，再补勾**图片输入** / **推理模式**
> * 勾选与模型实际能力不符（如给不支持工具调用的模型勾选工具调用）可能导致调用报错，请按需勾选

「输入」「输出」两个区域用于设置上下文长度与最大输出 tokens，留空即为「使用提供商默认值」，也可手动点选 32K/64K/128K/256K（输入）、8K/16K/32K/64K（输出）等挡位。填写完成后点击「保存」，回到对话界面即可在模型选择器的自定义分组中看到并使用该模型。

> ⚠️ **接口地址请完整填写为 `https://api.apiyi.com/v1/chat/completions`**（即末尾带 `/chat/completions` 的完整路径，如截图所示），不要只填 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1` 这类不完整地址，否则会请求失败。

**额外提示**：API易 控制台 `api.apiyi.com/token` 创建令牌时，**部分分组有折扣**（如 ClaudeCode 分组），且可与充值赠送叠加，具体以控制台显示为准。

> 💡 **为什么选 API易？**
>
> * **一把密钥多家模型**：OpenAI / Anthropic / Google / DeepSeek / 智谱 / Kimi 等全模型矩阵，WorkBuddy 中只需配置一次
> * **价格优势**：相对官方价格通常有 5%-20% 优惠，部分模型支持充值加赠
> * **国内直连**：免代理直接访问海外大模型，配合 WorkBuddy 桌面客户端无需额外网络配置
> * **标准 OpenAI 兼容协议**：完全匹配 WorkBuddy「自定义 / Custom」供应商的接入要求，无需开启自定义协议开关

> ℹ️ **费用与隐私说明**：自定义模型产生的全部费用（Token 消耗等）由您直接向 API易 结算，请留意 API易 账户余额和用量；API Key 仅保存在本机 `workbuddy/models.json`，WorkBuddy 不会上传至云端，请妥善保管，不再使用时建议在设置中删除或清理该配置。

## 常用功能速查

| 功能          | 说明                                                    |
| ----------- | ----------------------------------------------------- |
| ✨ 自然语言下任务   | 新建任务栏一句话下达需求，无需拆分复杂步骤                                 |
| 📋 自主规划执行   | 自动拆解任务、规划步骤并执行操作，交付可验收成果                              |
| 🗂️ 多模态任务处理 | 文档 / 表格 / PPT / 数据分析等多种任务类型                           |
| 📁 本地文件操作   | 读取授权的本地文件夹，批量整理、重命名、格式转换                              |
| 📨 助理多平台接入  | 支持微信、企微、飞书、钉钉、QQ、元宝机器人等 7 种接入方式                       |
| 🧩 技能市场与连接器 | 零成本 Skill 精选（Agent Browser、Web Search 等）+ 腾讯文档/知识库连接器 |

## 常见问题

### 接入 API易 后，我的 API Key 会不会被上传到 WorkBuddy 云端？

不会。官方文档明确说明模型配置参数（含 API Key）仅保存在本地 `workbuddy/models.json` 中，不上传云端。使用时 WorkBuddy 仅作为通信链路，将输入转发至你配置的 API易 接口，输出由该模型直接返回；除必要传输、安全审计、故障排查、依法留存所必需外，WorkBuddy 不读取、不存储对话内容。

### 通过 API易 调用模型产生的费用怎么计算？是否会消耗 WorkBuddy 的积分/套餐？

不会消耗 WorkBuddy 自身的积分或套餐额度。自定义模型产生的全部费用（Token 消耗、订阅费用等）由您直接向 API易 支付和结算，请自行关注 API易 账户中的余额与用量，避免产生超出预期的支出。

### 是否支持 Anthropic 原生协议（anthropic\_messages）接入？

目前 WorkBuddy 的自定义模型配置弹窗仅支持 **OpenAI 兼容协议 API**（弹窗顶部有明确标注）。因此接入 API易 时请使用其 OpenAI 兼容端点 `https://api.apiyi.com/v1/chat/completions`，暂不支持 Anthropic 原生协议端点。

### 「自定义协议」开关什么时候需要打开？接口地址要填到什么程度？

「自定义协议」仅当你对接的模型服务经过网关或代理层封装、使用了非标准 URL 路径时才需要打开——开启后 WorkBuddy 会跳过路径校验，直接按你填写的地址发起请求。API易 提供的是标准 `/chat/completions` 路径，保持该开关**默认关闭**即可。无论开关是否打开，接口地址都建议**完整填写**为 `https://api.apiyi.com/v1/chat/completions`（末尾带 `/chat/completions`），不要只填 base 地址（如 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1`），也不要重复拼接 `/v1` 导致变成 `.../v1/v1/chat/completions` 触发 404。

### 工具调用 / 图片输入 / 推理模式这几个能力标记该怎么勾选？

选择腾讯云 Token Plan 等标准供应商时这些标记会自动写入；但选择「自定义 / Custom」接入 API易 时不会自动识别，需要根据你填写的模型 ID 的实际能力手动勾选，不确定时建议**宁可少勾、不要多勾**。例如上方截图中的 `claude-sonnet-5` 只勾选了工具调用；如果你确认所用模型也支持图片输入或具备推理增强能力，再补勾对应选项。勾选与模型实际能力不符可能导致调用报错。

### 模型名称一栏应该填什么？

填入 API易 文档中对应的模型 ID 即可，例如 `claude-sonnet-5`、`gpt-5.4`、`deepseek-v3.2`、`gemini-3.1-pro-preview`、`kimi-k2.6` 等。切换模型只需回到设置中修改该字段并保存，无需重新配置接口地址和 API Key。

## 相关资源

| 资源                    | 链接                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 🌐 WorkBuddy 官网       | `www.workbuddy.cn`                                                                                                           |
| 📖 官方文档首页             | `www.workbuddy.cn/docs/workbuddy/Overview`                                                                                   |
| ⚙️ 模型配置官方文档           | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model`                                   |
| ⬇️ Windows / Mac 安装指南 | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide`（Mac 版路径同目录下 `Installation-Mac-Guide`） |
