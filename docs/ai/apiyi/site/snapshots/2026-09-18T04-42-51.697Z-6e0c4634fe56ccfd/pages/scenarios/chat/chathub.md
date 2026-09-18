> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatHub

> 一款浏览器扩展 AI 客户端，支持同屏对比多家模型回答，通过 API易 统一接入 400+ 模型

ChatHub 是一款 Chrome / Edge 浏览器扩展，能在同一个对话里同时向多个 AI 模型提问，并把各家回答并排展示，帮你快速判断哪个模型最适合当前问题。通过 API易，你可以在 ChatHub 中统一接入 OpenAI、Claude、Gemini、DeepSeek、Qwen 等 400+ 主流模型。

## 核心能力：同屏对比模型

ChatHub 与其他客户端最大的区别是**多模型并行问答**：

* 在同一个标签页里向 2\~6 个模型同时发送问题
* 把各家的回答以**并排 / 表格**两种视图对比
* 支持任意组合：GPT-5.5 + Claude Opus 4.7 + Gemini 3 Pro + DeepSeek V4 一起跑
* 对比视图支持 Markdown 渲染、代码高亮、图片预览

<Tip>
  **适用场景**

  * 写代码 / 改 Bug 时同时看 GPT-5.5 和 Claude Opus 4.7 的修复方案
  * 长文写作时对比 Claude Sonnet 与 Qwen3.7 的中文表达
  * 翻译 / 摘要时把同一段话丢给 GPT-5.5、Gemini 3 Flash 和 DeepSeek V4
  * 选型阶段：拿同一道题测试多个模型，决定后续主力用谁
</Tip>

## 安装

访问 `https://chathub.gg/zh-CN/download` 下载安装 ChatHub。

## 快速接入（OpenAI 兼容格式）

这是最通用的接入方式，支持 API易 全部 400+ 模型。

### 第 1 步：获取 API 密钥

请参考 [API 密钥获取与管理流程](/faq/token-management) 获取你的 API易 密钥。

### 第 2 步：打开 ChatHub 设置

1. 点击浏览器右上角的 ChatHub 图标
2. 在弹出窗口中点击右上角的 **Settings**（齿轮图标）
3. 进入 **Custom Providers** 选项卡

### 第 3 步：添加 API易 提供商

<img src="https://mintcdn.com/apiyillc/1n99GeVSDKf0eLgj/images/chathub-add-apiyi-provider-zh.png?fit=max&auto=format&n=1n99GeVSDKf0eLgj&q=85&s=ac7db1a0937fc11a8012b39741f15b91" alt="ChatHub 添加 API易 提供商配置示例" width="688" height="691" data-path="images/chathub-add-apiyi-provider-zh.png" />

参考上图，在弹出的添加提供商窗口中填写：

* **名称**：`apiyi`（自定义，便于在多个提供商中识别）
* **API Host**：下拉框选择 `OpenAI`，下方地址栏填 `https://api.apiyi.com/v1`
* **API Key**：粘贴你的 API易 密钥
* **模型**：填一个常用模型，例如 `deepseek-v4-pro`

可选高级选项：

* **支持图片输入**：当模型支持视觉理解时勾选（例如 `gpt-5-chat-latest`、`gemini-3-pro-preview`、`claude-sonnet-4-5`）
* **支持 function calling**：当模型支持工具调用时勾选
* **高级设置**：默认折叠，按需展开

填写完成后点击右下角「确认」保存。

<Info>
  **配置要点**

  * API Host 地址栏必须包含 `/v1` 后缀
  * 「模型」字段是默认模型，可以随时在对话中切换其他模型
  * 配置完成后无需重启浏览器，立即生效
  * 如需添加多个提供商，重复本步骤即可
</Info>

### 第 4 步：选择模型

设置完成后，回到 ChatHub 主界面，从下拉菜单中即可看到你添加的模型列表，任意切换使用。

## 三种使用模式

| 模式        | 触发方式                    | 适用场景                |
| --------- | ----------------------- | ------------------- |
| **单模型对话** | 像普通 ChatGPT 一样与一个模型对话   | 日常问答、单模型擅长的任务       |
| **多模型对比** | 在输入框右侧勾选 2\~6 个模型一起发送   | 选型测试、寻找最佳答案         |
| **网页助手**  | 选中任意网页文字，弹出 ChatHub 工具栏 | 阅读论文时翻译 / 总结、写邮件时润色 |

<Tip>
  **对比模式小技巧**

  * 对比模式下，每个模型的回复都是**独立**的，左侧主对话栏显示默认模型
  * 想要导出所有模型的回答？点击对话右上角的 **Export** 按钮，支持 Markdown / JSON / PNG
  * 对比时建议选 **风格差异大**的模型组合，例如「GPT-5.5 + Claude Opus 4.7 + DeepSeek V4」，更容易看出区别
</Tip>

## 进阶配置：多家对比的最强玩法

ChatHub 的杀手锏是「同时跑多家厂商」。通过 API易 一次接入就能在对比中混搭任意厂商的模型。

### 对比组合推荐

| 任务类型              | 推荐模型组合                                           | 理由             |
| ----------------- | ------------------------------------------------ | -------------- |
| **代码生成 / Bug 修复** | GPT-5.5 + Claude Opus 4.7 + DeepSeek V4          | 主流编程能力 + 国产性价比 |
| **长文写作 / 创意**     | Claude Sonnet 4.5 + Qwen3.7-Max + GPT-5.5        | 中文表达 + 西式叙事    |
| **翻译 / 多语言**      | GPT-5.5 + Gemini 3 Flash + DeepSeek V4           | 三家互为校验         |
| **推理 / 数学**       | GPT-5.5 (xhigh) + Claude Opus 4.7 + Gemini 3 Pro | 三大推理顶配         |

## 支持的模型

通过 API易，ChatHub 支持 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、国产模型等。

<Card title="查看当下热门模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、性能对比和场景化使用建议。覆盖文本创作、编程开发、快速响应、图像生成、视频生成等全场景。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保你获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 核心功能

### 快捷键操作

| 快捷键                        | 功能                  |
| -------------------------- | ------------------- |
| `Ctrl/Cmd + Shift + Y`     | 在任意网页打开 ChatHub 侧边栏 |
| `Ctrl/Cmd + B`             | 切换侧边栏显示             |
| `Ctrl/Cmd + Enter`         | 发送消息（单模型模式）         |
| `Ctrl/Cmd + Shift + Enter` | 发送消息到所有选中模型（对比模式）   |

### 网页助手

在任意网页选中文字，ChatHub 会自动弹出工具栏，可以：

* 翻译选中文本
* 总结选中段落
* 改写 / 润色
* 解释代码

### 对话管理

* 多组对话独立上下文保持
* 对话历史本地存储（不依赖云端）
* 支持 Markdown 渲染与代码高亮
* 一键导出为 Markdown / PDF

### 提示词库

内置提示词模板市场，也可以保存自己的常用 prompt，支持变量。

## 高级设置

### 参数调节

```yaml theme={null}
对话参数设置:
  - Temperature: 0.7        # 创造性控制（推理模型 GPT-5 只能用 1）
  - Max Tokens: 4096        # 最大输出长度
  - Top P: 0.9              # 核采样阈值
  - Frequency Penalty: 0    # 重复惩罚
  - Presence Penalty: 0     # 新话题倾向
```

### 流式输出

ChatHub 默认开启流式输出，体验更顺滑。

### 网络代理设置

如需使用代理访问：

1. 进入 Settings > Advanced
2. 配置 HTTP/HTTPS 代理
3. 设置代理认证（如需要）

## 故障排除

### 连接失败

* 检查 API Base URL：`https://api.apiyi.com/v1`
* 验证 API 密钥有效性
* 确认网络连接状态

### 模型不显示

* 等待模型列表自动刷新
* 手动点击「刷新模型」按钮
* 检查 API 密钥权限

### 对比模式只显示一家

* 检查是否在输入框右侧勾选了多个模型
* 确认所有模型都来自同一个 provider（或不同 provider 但都已配置）

### 响应速度慢

* 尝试切换到更快的模型
* 检查网络延迟
* 减少上下文长度

## 最佳实践

### 性能优化

1. **合理选择模型**
   * 根据任务复杂度选择合适的模型
   * 查看 [模型推荐页面](/api-capabilities/model-info) 获取最新的模型选择建议

2. **对比策略**
   * 同质模型（如两个 GPT）对比意义不大
   * 选择**能力侧重不同**的模型：编程、写作、推理、翻译各选一家
   * 不要一次性对比超过 4 个模型，token 消耗会成倍增长

3. **资源管理**
   * 监控 API 使用量
   * 设置使用限额提醒
   * 定期更新扩展版本

### 安全建议

* 不要分享 API 密钥
* 定期更换密钥
* 使用强密码保护浏览器
* 谨慎处理敏感信息

### 团队协作

虽然 ChatHub 主要面向个人用户，但可以通过以下方式支持团队：

* 共享提示词模板
* 导出对话记录分享
* 统一 API 配置标准

## 对比优势

### vs 其他客户端

| 特性          | ChatHub  | 单模型客户端 | 其他扩展 |
| ----------- | -------- | ------ | ---- |
| **同屏对比多模型** | ✅ 核心能力   | ❌      | 少数支持 |
| **浏览器侧边栏**  | ✅        | ❌      | 部分   |
| **网页助手**    | ✅        | ❌      | 部分   |
| **自定义 API** | ✅        | ✅      | ✅    |
| **跨平台同步**   | ✅（浏览器同步） | ❌      | 视实现  |
| **对话历史本地**  | ✅        | 视实现    | 视实现  |

### 选择 ChatHub 的理由

1. **选型利器**：同时跑多家模型是它无法替代的价值
2. **多模型混合调用**：OpenAI / Claude / Gemini / 国产模型任意组合
3. **网页沉浸**：作为浏览器扩展，任何网页都能调用
4. **隐私优先**：对话本地存储，扩展不收集你的数据
5. **持续更新**：活跃的开发维护

***

需要更多帮助？请访问 ChatHub GitHub 仓库：`github.com/chathub-dev/chathub` 或访问 API易 官网：`api.apiyi.com`。
