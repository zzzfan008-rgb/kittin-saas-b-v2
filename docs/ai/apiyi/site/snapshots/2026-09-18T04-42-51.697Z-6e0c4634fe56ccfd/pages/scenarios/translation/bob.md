> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bob 翻译

> macOS 上的专业翻译工具集成指南

# Bob 翻译

Bob 是 macOS 上一款优秀的翻译软件，支持划词翻译、截图翻译等功能。通过集成 API易，您可以使用 AI 模型提供更准确、更自然的翻译结果。

## 快速配置

### 1. 安装 Bob

从 [Bob 官网](https://bobtranslate.com) 下载并安装最新版本。

### 2. 配置 API易

1. 打开 Bob 设置（菜单栏图标 > 偏好设置）
2. 切换到"服务"标签页
3. 添加 OpenAI 翻译服务
4. 配置参数：
   * **API Key**：您的 API易 密钥
   * **API URL**：`https://api.apiyi.com`
   * **模型**：`gpt-3.5-turbo`

### 3. 测试配置

点击"测试"按钮验证配置，显示成功后保存。

## 使用方法

### 划词翻译

1. 选中需要翻译的文本
2. 按下快捷键（默认 `⌥ + D`）
3. Bob 弹出翻译结果

### 截图翻译

1. 按下截图快捷键（默认 `⌥ + S`）
2. 框选需要翻译的区域
3. Bob 识别并翻译图片中的文字

### 输入翻译

1. 调出 Bob 窗口（默认 `⌥ + Space`）
2. 输入或粘贴要翻译的文本
3. 选择目标语言
4. 查看翻译结果

## 模型选择

### 不同场景的推荐

<Card title="查看翻译场景模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐，了解适合不同翻译场景的最佳模型选择，包括日常翻译、专业文档、长文本处理等。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

### 多模型配置

可以配置多个翻译服务，使用不同模型：

1. 添加多个 OpenAI 翻译服务
2. 为每个服务配置不同模型
3. 在翻译时选择使用

## 高级设置

### 自定义提示词

优化翻译质量的提示词模板：

```text theme={null}
你是一位专业的翻译专家，精通多国语言。请将以下{source_lang}文本翻译成{target_lang}。

要求：
1. 保持原文的语气和风格
2. 使用地道的表达方式
3. 对于专业术语，在翻译后用括号标注原文
4. 注意文化差异，适当调整表达

原文：{text}
```

### 快捷键自定义

在设置 > 通用中自定义：

* **划词翻译**：`⌥ + D`
* **截图翻译**：`⌥ + S`
* **输入翻译**：`⌥ + Space`
* **显示/隐藏**：`⌥ + B`

### 翻译行为设置

推荐配置：

* **自动识别语言**：开启
* **翻译后自动复制**：根据需求
* **保留原文格式**：开启
* **历史记录**：开启

## 使用技巧

### 1. 专业领域翻译

针对特定领域，可以在提示词中说明：

```text theme={null}
请作为计算机专业译者，翻译以下技术文档。
保留所有技术术语的英文，用括号标注中文含义。
```

### 2. 批量翻译

需要翻译大量文本时：

1. 使用输入翻译模式
2. 将文本分段粘贴
3. 利用历史记录查看所有翻译

### 3. 对照阅读

阅读外文资料时：

1. 开启"显示原文"选项
2. 使用划词翻译实时查看
3. 对比原文和译文学习

### 4. 术语库管理

建立个人术语库：

1. 收藏常用术语翻译
2. 自定义特定词汇翻译
3. 导出术语库备份

## 常见问题

### 翻译速度慢

**原因分析：**

* 网络连接问题
* 选择的模型较大
* API 服务繁忙

**解决方案：**

1. 检查网络连接
2. 使用 gpt-3.5-turbo 等快速模型
3. 避开高峰时段

### 翻译不准确

**改进方法：**

1. 使用更高级的模型（如 GPT-4）
2. 优化提示词，提供更多上下文
3. 对专业内容说明领域

### API 配额用尽

**处理方式：**

1. 检查 API易 账户余额
2. 合理使用不同模型控制成本
3. 设置每日使用限制

## 最佳实践

### 1. 成本控制

* 日常翻译使用 gpt-3.5-turbo
* 重要文档才使用 gpt-4
* 定期查看使用统计

### 2. 翻译质量

* 提供充足的上下文
* 使用专业术语时说明领域
* 对重要内容进行二次校对

### 3. 工作流优化

* 设置常用语言对
* 自定义专业领域提示词
* 善用历史记录和收藏功能

### 4. 数据安全

* 不翻译包含敏感信息的文本
* 定期清理翻译历史
* 妥善保管 API 密钥

## 进阶功能

### URL Scheme 集成

Bob 支持通过 URL Scheme 集成到其他应用：

```bash theme={null}
# 直接翻译文本
bob://translate?text=Hello&from=en&to=zh

# 打开 Bob 窗口
bob://open
```

### AppleScript 自动化

```applescript theme={null}
tell application "Bob"
    translate "Hello World" from "en" to "zh"
end tell
```

### 导出功能

定期导出翻译记录：

1. 进入历史记录
2. 选择时间范围
3. 导出为 CSV 或 JSON 格式

## 与其他工具集成

### Raycast 集成

通过 Raycast 扩展快速调用 Bob：

```javascript theme={null}
// Raycast 脚本示例
import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";

export default async function Command() {
  exec("open bob://translate", (error) => {
    if (error) {
      showToast(Toast.Style.Failure, "启动 Bob 失败");
    }
  });
}
```

### Alfred 工作流

创建 Alfred 工作流实现快速翻译：

1. 创建新工作流
2. 添加 Keyword 触发器
3. 连接 Run Script 动作
4. 调用 Bob 的 URL Scheme

### PopClip 扩展

安装 PopClip 的 Bob 扩展，选中文本后直接翻译。

## 故障排除

### 服务不可用

检查项目：

1. API 密钥是否正确
2. 网络连接是否正常
3. API易 服务状态

### 快捷键冲突

解决方法：

1. 在系统偏好设置中检查快捷键冲突
2. 为 Bob 设置独特的快捷键组合
3. 禁用冲突应用的快捷键

### 权限问题

确保 Bob 具有必要权限：

* 辅助功能权限
* 屏幕录制权限（截图翻译）
* 键盘输入权限

## 性能优化

### 减少延迟

1. 使用更快的模型
2. 启用本地缓存
3. 优化网络设置

### 节省资源

1. 合理设置翻译历史保留时间
2. 定期清理缓存
3. 避免同时运行多个翻译服务

### 提升体验

1. 调整弹窗显示时间
2. 自定义界面主题
3. 优化字体大小和样式

需要更多帮助？请查看 [详细集成文档](/scenarios/translation/bob)。
