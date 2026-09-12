> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 使用指南

> OpenClaw 使用方式、核心技能、常用命令与实际使用示例

## 使用方式

### 方式一：Web UI（推荐）

最简单的使用方式，无需任何外部服务：

```bash theme={null}
openclaw dashboard
```

浏览器会打开 `http://127.0.0.1:18789/`，直接在网页聊天窗口发消息即可。

<Tip>
  Web UI 是国内用户的推荐方式，不需要代理，直接可用。
</Tip>

### 方式二：Telegram Bot

1. 在 Telegram 搜索 `@BotFather`
2. 发送 `/newbot` 创建机器人
3. 获取 Bot Token
4. 在 `openclaw onboard` 时输入 Token

<Warning>
  国内使用 Telegram 需要代理支持：

  ```bash theme={null}
  export https_proxy=http://127.0.0.1:代理端口
  export http_proxy=http://127.0.0.1:代理端口
  openclaw gateway restart
  ```
</Warning>

### 方式三：其他平台

OpenClaw 还支持：

* WhatsApp（扫码连接）
* Discord（需要创建 Bot）
* Slack、Signal、iMessage、微软 Teams 等

## 核心技能

OpenClaw 内置丰富的技能，可以执行各种任务：

### 文件操作

| 技能         | 功能          |
| ---------- | ----------- |
| `fs.read`  | 读取文件（文本/图片） |
| `fs.write` | 写入/创建文件     |
| `fs.edit`  | 编辑文件内容      |

### 系统操作

| 技能              | 功能                   |
| --------------- | -------------------- |
| `shell.exec`    | 执行终端命令               |
| `shell.process` | 管理运行中的命令             |
| `browser.*`     | 自动控制浏览器（打开网页、截图、点击等） |

### 智能功能

| 技能              | 功能            |
| --------------- | ------------- |
| `web_search`    | 网页搜索          |
| `web_fetch`     | 抓取网页内容        |
| `memory_search` | 搜索记忆          |
| `memory_get`    | 读取记忆          |
| `cron.*`        | 定时任务（提醒、自动执行） |
| `tts`           | 文字转语音         |

## 常用命令

### 终端命令

| 命令                         | 功能            |
| -------------------------- | ------------- |
| `openclaw onboard`         | 运行安装向导        |
| `openclaw gateway start`   | 启动 Gateway 服务 |
| `openclaw gateway restart` | 重启 Gateway 服务 |
| `openclaw gateway stop`    | 停止 Gateway 服务 |
| `openclaw status`          | 查看运行状态        |
| `openclaw doctor`          | 诊断配置问题        |
| `openclaw doctor --fix`    | 自动修复配置问题      |
| `openclaw dashboard`       | 打开 Web 控制面板   |
| `openclaw logs --follow`   | 查看实时日志        |
| `openclaw configure`       | 修改配置          |
| `openclaw update`          | 更新到最新版本       |

### 聊天命令

在聊天窗口中可以使用的命令：

| 命令                | 功能     |
| ----------------- | ------ |
| `/help`           | 显示帮助   |
| `/new`            | 开始新对话  |
| `/reset`          | 重置对话   |
| `/stop`           | 停止当前任务 |
| `/think <level>`  | 设置思考深度 |
| `/model <id>`     | 切换模型   |
| `/verbose on/off` | 开关详细模式 |
| `/status`         | 查看状态   |
| `/skills`         | 查看可用技能 |

## 使用示例

直接用中文与 OpenClaw 对话，它会自动理解并执行任务：

### 文件操作

```text theme={null}
> 帮我在桌面创建一个 test.txt 文件，内容写 hello world

> 读取 ~/Documents/notes.txt 的内容

> 把桌面上所有 .png 文件移动到 Pictures 文件夹
```

### 终端命令

```text theme={null}
> 列出我桌面上的所有文件

> 查看当前系统内存使用情况

> 帮我安装 python 的 requests 库
```

### 浏览器控制

```text theme={null}
> 打开浏览器访问 baidu.com

> 搜索一下最新的 MacBook Pro 价格

> 截图当前网页
```

### 定时任务

```text theme={null}
> 每天早上 9 点提醒我喝水

> 每隔 1 小时提醒我休息一下

> 明天下午 3 点提醒我开会
```

### 编程辅助

```text theme={null}
> 帮我写一个 Python 脚本，批量重命名文件

> 这段代码有什么问题：[粘贴代码]

> 帮我写一个简单的 HTML 页面
```

## 推荐模型

OpenClaw 通过 API易 支持 400+ 主流 AI 模型，可根据不同任务选择合适的模型。

<Card title="查看模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的场景化模型推荐，包括文本创作、编程开发、快速响应、长文本处理等全场景的最佳模型选择。
</Card>

### 场景化模型推荐

| 任务类型   | 推荐模型            | 原因         |
| ------ | --------------- | ---------- |
| 复杂任务执行 | Claude Sonnet 4 | 理解能力强，执行准确 |
| 日常对话   | GPT-5.4         | 响应自然，通用性好  |
| 代码编写   | DeepSeek V3.2   | 编程能力强，性价比高 |
| 长文档处理  | Gemini 3.1 Pro  | 支持超长上下文    |
