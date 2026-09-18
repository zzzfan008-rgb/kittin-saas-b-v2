> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Make.com 接入 Gemini 图像理解

> 在 Make.com 自动化工作流中通过 HTTP 请求节点调用 API易 的 Gemini 图像理解 API，实现图片内容分析、OCR 识别等自动化任务。

## 概述

Make.com（原 Integromat）是一款强大的无代码自动化平台。通过其内置的 **HTTP 请求节点（Make a request）**，你可以直接调用 API易 的 Gemini 原生格式 API，实现图像理解、图片内容分析等多模态自动化工作流，无需编写任何代码。

<Info>
  **集成信息**

  * 🔧 工具：Make.com（`make.com`）
  * 🔌 接入方式：HTTP 请求节点（Make a request）
  * 🤖 模型：Gemini 系列（通过 API易 Gemini 原生格式调用）
  * 📡 API 端点：`https://api.apiyi.com/v1beta/models/{model}:generateContent`
</Info>

## 为什么选择 Make.com + API易

<CardGroup cols={2}>
  <Card title="零代码集成" icon="wand-sparkles">
    通过可视化拖拽配置 HTTP 请求节点，无需编写代码即可调用 AI 模型
  </Card>

  <Card title="自动化工作流" icon="refresh-cw">
    结合 Make.com 的触发器和条件逻辑，构建完整的图像处理自动化流程
  </Card>

  <Card title="多模型支持" icon="layers">
    API易 支持 400+ 模型，一个密钥即可在 Make.com 中切换不同的 AI 能力
  </Card>

  <Card title="灵活扩展" icon="puzzle">
    可与 Google Sheets、Slack、Email 等 1000+ 应用无缝衔接
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称                   | 模型标识                     | 用途        | API文档                                   |
| ---------------------- | ------------------------ | --------- | --------------------------------------- |
| Gemini 3.1 Pro Preview | `gemini-3.1-pro-preview` | 图像理解、文本生成 | [查看文档](/api-capabilities/gemini/native) |
| Gemini 3 Pro Preview   | `gemini-3-pro-preview`   | 图像理解、图像生成 | [查看文档](/api-capabilities/gemini/native) |
| Gemini 3 Flash Preview | `gemini-3-flash-preview` | 图像理解（高速）  | [查看文档](/api-capabilities/gemini/native) |

<Tip>
  推荐使用 `gemini-3.1-pro-preview`，拥有最强的图像理解能力。如果对速度要求更高，可以选择 Flash 系列。
</Tip>

## 配置步骤

<Steps>
  <Step title="第一步：获取 API易 密钥">
    1. 访问 [API易控制台](https://api.apiyi.com) 注册/登录
    2. 进入【令牌】栏目，生成新的 API 密钥
    3. 复制密钥（以 `sk-` 开头），后续配置需要用到
  </Step>

  <Step title="第二步：创建 Make.com 场景">
    1. 登录 Make.com，点击 **Create a new scenario**
    2. 点击 **+** 添加模块
    3. 搜索并选择 **HTTP** 模块
    4. 在 Actions 中选择 **Make a request**
  </Step>

  <Step title="第三步：配置 HTTP 请求节点">
    在 HTTP 请求节点中填写以下配置：

    **URL**：

    ```
    https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent
    ```

    **Method**：`POST`

    **Headers**：

    | Header 名称       | 值                    |
    | --------------- | -------------------- |
    | `Content-Type`  | `application/json`   |
    | `Authorization` | `Bearer sk-你的API易密钥` |

    **Body type**：`Raw`

    **Content type**：`JSON (application/json)`

    **Request content（Body）**：

    ```json theme={null}
    {
      "contents": [
        {
          "parts": [
            {
              "text": "这张图片里有什么？"
            },
            {
              "fileData": {
                "mimeType": "image/png",
                "fileUri": "https://你的图片URL地址"
              }
            }
          ]
        }
      ]
    }
    ```
  </Step>

  <Step title="第四步：测试运行">
    点击 **Run once** 测试请求，确认返回正确的图像理解结果。
  </Step>
</Steps>

## 完整请求示例

以下是一个完整的图像理解请求示例，分析一张水獭图片的内容：

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "这张图片里有什么？"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png"
          }
        }
      ]
    }
  ]
}
```

### 请求参数说明

| 字段                          | 类型     | 必填 | 说明                                           |
| --------------------------- | ------ | -- | -------------------------------------------- |
| `contents`                  | array  | 是  | 对话内容数组                                       |
| `contents[].parts`          | array  | 是  | 消息组成部分（文本 + 图片）                              |
| `parts[].text`              | string | 是  | 用户的文字提示                                      |
| `parts[].fileData.mimeType` | string | 是  | 图片格式：`image/png`、`image/jpeg`、`image/webp` 等 |
| `parts[].fileData.fileUri`  | string | 是  | 图片的公开访问 URL                                  |

<Warning>
  `fileUri` 必须是**公开可访问**的图片 URL。如果图片需要登录才能访问，请先将图片上传到公开的存储服务（如对象存储）。
</Warning>

## 实用场景

### 场景一：自动分析邮件附件中的图片

1. **触发器**：Gmail - Watch emails（监听新邮件）
2. **处理**：HTTP 节点调用 Gemini 图像理解
3. **输出**：将分析结果写入 Google Sheets 或发送到 Slack

### 场景二：电商产品图自动标签

1. **触发器**：Google Drive - Watch files（监听新上传的图片）
2. **处理**：HTTP 节点分析产品图片内容
3. **输出**：自动为产品图添加分类标签

### 场景三：社交媒体内容审核

1. **触发器**：定时获取用户提交的图片
2. **处理**：HTTP 节点分析图片内容是否合规
3. **输出**：不合规内容自动标记告警

## 进阶技巧

### 动态替换图片 URL

在 Make.com 中，你可以使用上游模块的输出变量动态替换 `fileUri`，实现批量图片分析：

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "请描述这张图片的内容，并提取其中的文字"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "{{上游模块的图片URL变量}}"
          }
        }
      ]
    }
  ]
}
```

### 切换不同模型

只需修改 URL 中的模型名称即可切换模型：

| 需求     | URL                                                                          |
| ------ | ---------------------------------------------------------------------------- |
| 最强理解能力 | `https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent` |
| 高速分析   | `https://api.apiyi.com/v1beta/models/gemini-3-flash-preview:generateContent` |

## 常见问题

<AccordionGroup>
  <Accordion title="HTTP 请求返回 401 错误？">
    请检查：

    1. Authorization Header 格式是否正确：`Bearer sk-你的密钥`（注意 Bearer 后有空格）
    2. API 密钥是否有效（在 API易控制台确认）
    3. 账户余额是否充足
  </Accordion>

  <Accordion title="图片无法识别或返回错误？">
    请确认：

    1. `fileUri` 是公开可访问的 URL（在浏览器中可以直接打开）
    2. `mimeType` 与实际图片格式一致
    3. 图片大小不超过模型限制
  </Accordion>

  <Accordion title="如何在 Make.com 中处理返回结果？">
    Gemini API 返回 JSON 格式的响应，你可以：

    1. 使用 Make.com 的 **JSON** 模块解析返回数据
    2. 提取 `candidates[0].content.parts[0].text` 字段获取分析结果
    3. 将结果传递给下游模块（如写入数据库、发送通知等）
  </Accordion>

  <Accordion title="如何获取 API易 密钥？">
    访问 [API易控制台](https://api.apiyi.com/token)，注册账号后在【令牌】栏目生成新的密钥。新用户有免费测试额度。
  </Accordion>

  <Accordion title="支持 Base64 编码的图片吗？">
    支持。将 `fileData` 替换为 `inlineData`：

    ```json theme={null}
    {
      "inlineData": {
        "mimeType": "image/png",
        "data": "Base64编码的图片数据"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Gemini 原生格式文档" icon="book" href="/api-capabilities/gemini/native">
    查看 Gemini 原生 API 格式的完整说明
  </Card>

  <Card title="图像理解 API" icon="eye" href="/api-capabilities/vision-understanding">
    查看 API易 图像理解能力总览
  </Card>

  <Card title="常见问题" icon="circle-question-mark" href="/faq/model-selection-guide">
    查看 FAQ 获取更多帮助
  </Card>

  <Card title="API易-令牌管理" icon="settings" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量和余额
  </Card>
</CardGroup>
