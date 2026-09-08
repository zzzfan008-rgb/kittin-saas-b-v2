> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code 报错 400 解决指南

> 使用 API易 AWS Claude（Bedrock）官方通道时，Claude Code 出现 400 / ValidationException 报错的原因与解决方法

## 📌 问题说明

部分用户在使用 Claude Code 时，可能会遇到类似以下报错：

* `400 ValidationException`
* `Extra inputs are not permitted`
* `cache_control.scope` 相关错误

该问题通常由 **Claude Code 的实验性 Beta 功能参数** 引起，这些参数在 API易 所提供的官方亚马逊 Claude API（即 AWS Claude / Bedrock）接口中**不被支持**。

<Info>
  本指南仅适用于通过 **AWS Claude（Bedrock）官方通道** 调用的场景。Anthropic 原生 API 通道支持这些 Beta 参数，无需做以下调整。
</Info>

## ✅ 解决方案（推荐）

通过关闭 Claude Code 的实验性 Beta 功能即可解决。

### 方法一：修改 settings.json（推荐）

在 Claude Code 的 `settings.json` 中添加环境变量：

```json theme={null}
"env": {
  "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1"
}
```

### 方法二：临时生效（当前终端会话）

在终端执行：

```bash theme={null}
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
```

然后重新运行 Claude Code。

<Tip>
  方法二仅对当前终端窗口有效，关闭终端后失效。如需长期使用，请采用方法一或方法三。
</Tip>

### 方法三：永久生效（推荐）

根据你使用的终端环境，将变量写入配置文件。

#### Mac / Linux（bash）

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.bashrc
source ~/.bashrc
```

#### Mac（zsh，默认）

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.zshrc
source ~/.zshrc
```

#### Windows（PowerShell）

```powershell theme={null}
[System.Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", "1", "User")
```

然后重启终端。

## 🔍 原理说明（给技术同学）

Claude Code 默认会启用一些 Beta 特性，例如：

* `cache_control`
* `tool` 扩展字段
* `scope` 等额外参数

这些参数：

* 👉 在 Anthropic 原生 API 支持
* 👉 但在 AWS Bedrock Claude 中会被判定为非法字段 → 返回 400

关闭该开关后：

* ✔ 请求结构将变为标准格式
* ✔ 与 AWS Claude 完全兼容

## 🚨 适用场景

如果你符合以下情况，**强烈建议开启该变量**：

* 使用 Claude Code + AWS Bedrock Claude
* 使用第三方代理（如 API 网关 / 转发服务）
* 出现 400 / ValidationException 错误

参考资料：

* Claude 官方文档 - 环境变量：`code.claude.com/docs/zh-CN/env-vars`
* 相关 issue 说明：`github.com/anthropics/claude-code/issues/21676`

## 🔎 如何查看模型支持的分组

不确定某个模型可以用在哪些分组？可以在模型定价页面查询：

打开 [API易 模型定价页面](https://api.apiyi.com/modelPricing)，输入模型名称，即可查看该模型的可用分组。

例如：**ClaudeCode 分组** 支持最新的 Claude 模型系列，并单独配置了 `glm-5.1` 和 `qwen3.7-max`。

## 💡 补充建议

如果设置后仍然报错，请检查：

* 环境变量是否真正生效（可在终端执行 `echo $CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` 确认输出为 `1`）
* 是否确实在使用 AWS Claude（Bedrock）通道
* 修改配置后是否已重启终端或 IDE

## 📞 支持

如果问题仍未解决，请提供以下信息以便进一步排查：

* 报错截图
* 请求日志（Request ID）
* 使用的模型名称

我们会协助你进一步排查。
