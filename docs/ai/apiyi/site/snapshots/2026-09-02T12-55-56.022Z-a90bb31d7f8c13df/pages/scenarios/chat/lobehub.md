> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LobeHub

> 开源 AI 对话客户端集成指南，支持自定义服务商与本地知识库

LobeHub 是一款开源、跨平台的 AI 对话客户端（原 Lobe Chat），支持多模型、多模态、插件系统与本地知识库。通过 API易，您可以在 LobeHub 中使用一个 API 密钥访问 400+ 主流 AI 模型，无需为每个厂商单独注册和付费。

<CardGroup cols={3}>
  <Card title="开源可自托管" icon="github">
    桌面端、网页端、Docker、Vercel 均可部署，数据完全可控
  </Card>

  <Card title="插件与多模态" icon="plug">
    内置联网搜索、代码解释器、图像理解、视频生成等插件
  </Card>

  <Card title="本地知识库" icon="database">
    支持上传 PDF / Markdown 建立 RAG，对话引用私有资料
  </Card>
</CardGroup>

## 快速开始

### 1. 获取 API易 密钥

请参考 [API密钥获取与管理教程](/faq/token-management) 获取您的 API 密钥。

### 2. 安装 LobeHub

LobeHub 提供三种使用方式：

* **桌面版**：Windows、macOS、Linux 官方客户端，可在 `lobechat.com` 下载安装包
* **网页版（官方）**：直接访问 `lobechat.com` 注册登录即可使用，无需自部署
* **自托管**：通过 Docker / Vercel / 本地源码部署，适合企业或隐私场景

<Tip>
  个人用户推荐直接使用官方网页版或桌面版；如有数据隐私或合规需求，建议 Docker 自托管（环境变量中配置 API易 即可）。
</Tip>

### 3. 创建自定义服务商

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-create-provider.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=ddda3ebd3c4aa4e60aa6c9f87bd14ecb" alt="LobeHub 创建自定义 AI 服务商配置界面" width="763" height="916" data-path="images/lobehub-create-provider.png" />

进入「设置 → 模型服务商」，点击右上角 `+` 添加自定义服务商，按上图填写以下信息：

| 字段           | 填写内容                       | 说明                        |
| ------------ | -------------------------- | ------------------------- |
| **服务商 ID**   | `apiyi`                    | 作为服务商唯一标识，创建后不可修改         |
| **服务商名称**    | `apiyi`                    | 自定义显示名称                   |
| **服务商简介**    | `apiyi`                    | 自定义描述                     |
| **服务商 Logo** | （留空）                       | 可选，自定义 Logo 地址            |
| **请求格式**     | `OpenAI`                   | API易 完全兼容 OpenAI 协议       |
| **代理地址**     | `https://api.apiyi.com/v1` | Base URL，**务必以 `/v1` 结尾** |
| **API Key**  | 您的 API易 密钥                 | 在 API易 控制台获取              |

填写完成后点击右下角 **新建** 按钮保存。

<Info>
  **配置要点**

  * 「代理地址」必须以 `/v1` 结尾，否则请求会路由失败
  * 「API Key」粘贴时请删除前后空格
  * 「请求格式」选择 `OpenAI` 即可访问 API易 全部 400+ 模型
  * 一个密钥可同时启用多种模型，按用量计费，无需为单模型单独付费
</Info>

### 4. 验证连通性

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-configured.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=b230b3aac1cd11cb9bd186d020ce8b73" alt="LobeHub 配置完成后的界面" width="1473" height="913" data-path="images/lobehub-configured.png" />

新建成功后，会跳转到服务商详情页。可以：

1. **填写 API Key 与代理地址**：再次确认或修改
2. **开启高级选项**（可选）：
   * 「使用 Responses API 规范」：开启后可使用 OpenAI 新一代请求格式（仅 OpenAI 模型支持）
   * 「使用客户端请求模式」：浏览器直接发起会话，可提升响应速度
3. **连通性检查**：在下拉框中选择一个模型，点击 **检查** 按钮测试连通性
4. **获取模型列表**：点击 **获取模型列表** 按钮，自动拉取 API易 提供的全部模型

成功获取后，「模型列表」会显示 API易 当前在售的全部模型，按类型分组：对话、图片、视频、向量化、ASR、TTS。

<Warning>
  如果「连通性检查」失败，请按以下顺序排查：

  * 代理地址末尾是否包含 `/v1`
  * API Key 是否有效（可在 API易 控制台验证）
  * 网络环境是否能访问 `api.apiyi.com`
  * 防火墙 / 代理设置是否拦截 HTTPS
</Warning>

### 5. 选择模型开始对话

在对话界面的模型下拉框中，选择您想使用的模型（如 `claude-opus-5`、`gpt-5-6-terra`、`deepseek-v4-pro`），即可开始对话。

<Card title="查看当下热门模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、性能对比和场景化使用建议，涵盖文本创作、编程开发、快速响应、图像生成、视频生成等全场景。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 一站式接入 400+ 模型

LobeHub 内置了多家服务商的官方渠道，需要逐个填密钥；接 API易 则只需建**一个**自定义服务商，即可覆盖全部模型：

| 渠道                   | 适用模型                                       | 核心优势             | API 地址                     |
| -------------------- | ------------------------------------------ | ---------------- | -------------------------- |
| **OpenAI 兼容（apiyi）** | 全部 400+ 模型（含 Claude、Gemini、GPT、DeepSeek 等） | 一个密钥通吃全部模型，配置最简单 | `https://api.apiyi.com/v1` |

<Tip>
  **一个 apiyi 渠道就能访问 Claude / Gemini 等所有模型**

  API易 把 Claude、Gemini、GPT、DeepSeek 等主流模型统一封装为 OpenAI 兼容协议，所以你只要在 LobeHub 里建一个 `apiyi` 自定义服务商，就能在模型下拉框里选到全部 400+ 模型，无需为不同厂商分别配置渠道。
</Tip>

## LobeHub 特色玩法

### 插件系统

LobeHub 提供丰富的插件市场（设置 → 插件），推荐开启：

* **Web 搜索**：让模型实时联网获取最新信息
* **代码解释器**：对话中运行 Python 代码、做数据可视化
* **图表生成**：自动生成流程图、思维导图
* **图像生成**：通过 `gpt-image-2`、`gemini-3-pro-image` 等模型生成图片

### 本地知识库（RAG）

LobeHub 支持上传文件建立本地向量库：

1. 进入「知识库」页面，新建知识库
2. 上传 PDF、Markdown、Word、Excel、TXT 等文件
3. 系统自动切片、向量化
4. 对话时勾选知识库，模型将基于您的私有资料回答

<Warning>
  知识库的「向量化」步骤会调用 Embedding 模型（计费）。建议使用 API易 提供的 `text-embedding-3-large` 等向量化模型。
</Warning>

### 多模态对话

支持上传图片进行视觉理解、识图、OCR：

* 视觉模型推荐：`gemini-3-6-flash`、`claude-opus-5`、`gpt-5-6-terra`
* 直接在对话框拖入图片，模型会自动识别

### 助手市场（Agent Market）

LobeHub 内置丰富的预设助手（翻译、写作、编程、面试等），您也可以：

* 在「助手市场」一键启用社区分享的助手
* 自建助手：自定义人设、Prompt、开场白、知识库、插件

### 对话管理与导出

* 多分支对话、消息编辑与重新生成
* 对话导出：Markdown、PNG、JSON
* 全局搜索历史消息

## 高级配置

### 自定义请求参数

进入服务商详情页可调节通用参数：

```yaml theme={null}
默认参数:
  Temperature: 0.7        # 创造性控制（推理模型如 GPT-5.6 系列只能用 1）
  Top P: 0.9              # 采样参数（推理模型只能用 1）
  Max Tokens: 4096        # 最大输出长度
  Context Length: 8192    # 上下文长度
```

<Warning>
  部分推理模型（如 GPT-5.6 系列）只支持 `Temperature = 1` 和 `Top P = 1`，其他取值会被服务端忽略或报错。
</Warning>

### 网络代理与自托管

如需使用代理或自托管 LobeHub：

1. **桌面版**：设置 → 网络 → 配置 HTTP/HTTPS 代理
2. **自托管（Docker）**：通过环境变量注入 API易 配置：
   ```bash theme={null}
   OPENAI_API_KEY=sk-your-apiyi-key
   OPENAI_PROXY_URL=https://api.apiyi.com/v1
   CUSTOM_MODELS=gpt-5-6-terra,claude-opus-5,deepseek-v4-pro
   ```
3. **客户端请求模式**：开启后浏览器直连 API（需保证浏览器能访问 API易）

### 快捷键

| 快捷键                    | 功能   |
| ---------------------- | ---- |
| `Ctrl/Cmd + N`         | 新建对话 |
| `Ctrl/Cmd + K`         | 快速搜索 |
| `Ctrl/Cmd + /`         | 命令面板 |
| `Ctrl/Cmd + Shift + M` | 切换模型 |

## 移动端

LobeHub 桌面端支持 Windows / macOS / Linux，移动端可通过浏览器访问 `lobechat.com` 网页版（响应式适配），无需单独安装 App。

## 故障排除

### 连接失败 / 连通性检查不通过

| 现象           | 排查方向                          |
| ------------ | ----------------------------- |
| 提示 401 / 403 | API Key 无效或余额不足，前往 API易 控制台核对 |
| 提示 404       | 代理地址未以 `/v1` 结尾，缺少 `/v1` 后缀   |
| 提示超时         | 网络环境问题，检查代理或防火墙设置             |
| 提示 CORS 错误   | 关闭「使用客户端请求模式」，或通过服务端中转        |

### 模型列表为空

* 点击 **获取模型列表** 按钮手动拉取
* 等待 1-2 秒后刷新页面
* 确认 API Key 在 API易 控制台状态正常

### 响应慢或流式断流

* 切换到更快模型（如 `gemini-3-5-flash-lite`、`claude-haiku-4-5`、`deepseek-v4-flash`）
* 关闭不必要的插件
* 检查网络延迟
* 减少上下文长度（关闭过长的旧对话）

### 知识库检索不准确

* 调小切片大小，让检索粒度更细
* 在 API易 中切换更优的 Embedding 模型
* 增加相关文档数量，提高召回率

## 最佳实践

### 模型选择策略

不同任务用不同模型，按复杂度梯度选择：

* **日常聊天 / 简单问答**：`gemini-3-5-flash-lite`、`claude-haiku-4-5`、`deepseek-v4-flash`
* **复杂推理 / 长文档分析**：`claude-opus-5`、`gpt-5-6-sol`、`deepseek-v4-pro`
* **代码开发**：`claude-opus-5`、`gpt-5-6-sol`、`claude-sonnet-5`
* **图像理解**：`gemini-3-6-flash`、`claude-opus-5`、`gpt-5-6-terra`
* **图像生成**：`gpt-image-2`、`gemini-3-pro-image`

完整模型列表与性能对比请参考 [模型推荐页面](/api-capabilities/model-info)。

### 上下文管理

* 定期清理无用的旧对话
* 复杂任务拆分成多个短对话
* 善用「分叉对话」功能探索不同回答

### 安全与隐私

* 不要在公共场合分享 API Key
* 定期更换密钥（API易 控制台可一键重置）
* 敏感对话建议自托管 LobeHub，数据完全本地存储

### 自托管建议

* 生产环境使用 Docker + PostgreSQL，不要用内置数据库
* 反向代理建议套 Cloudflare
* 通过环境变量集中管理密钥，便于多实例部署

## 与其他客户端的对比

三款客户端接入 API易 的方式一致（都走 OpenAI 兼容协议），差别主要在部署形态和功能侧重：

| 特性             | LobeHub                       | [Chatbox AI](/scenarios/chat/chatbox) | [Cherry Studio](/scenarios/chat/cherry-studio) |
| -------------- | ----------------------------- | ------------------------------------- | ---------------------------------------------- |
| **部署形态**       | 桌面 + 网页 + Docker / Vercel 自托管 | 桌面 + 移动 + 网页                          | 桌面 + 移动                                        |
| **本地知识库（RAG）** | 内置向量库                         | 单次对话内的文档理解                            | 内置知识库                                          |
| **插件 / 扩展**    | 插件市场，生态丰富                     | 内置常用能力                                | 内置能力为主                                         |
| **渠道协议**       | OpenAI 兼容                     | OpenAI 兼容                             | OpenAI / Anthropic / Gemini 三种                 |
| **移动端**        | 网页响应式                         | 原生 App                                | 原生 App                                         |

<Tip>
  **什么时候选 LobeHub？**

  * 需要 **持久化的本地知识库** 或 **插件生态**（联网搜索、代码解释器、图表等）
  * 希望 **私有化部署**（Docker / Vercel），数据完全自控
  * 想要一个 **跨桌面 + 网页** 统一体验的界面

  三款都是成熟选择：更看重 **移动端原生 App 与本地存储** 可以选 Chatbox AI；需要 **Claude / Gemini 原生协议**（含 Prompt Cache）可以选 Cherry Studio。
</Tip>

需要更多帮助？请访问 `lobechat.com` 官方文档或 [API易官网](https://api.apiyi.com) 获取更多支持。
