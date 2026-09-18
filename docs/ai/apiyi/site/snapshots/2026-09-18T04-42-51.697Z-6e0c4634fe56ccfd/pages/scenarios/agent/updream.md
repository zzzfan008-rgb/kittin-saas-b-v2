> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Updream 接入 API易

> 在 Updream 中通过外部模型直连器调用 API易 图片模型，完成 AI 创作任务

<Tip>
  Updream 是面向 B 站 UP 主、专业创作者和内容团队的 AI 视频创作平台。通过外部模型直连器接入 API易 后，你可以在 Updream 的创作流程中调用 API易 图片模型。
</Tip>

## Updream 是什么？

Updream 将 Agent 对话、节点化无限画布、Skill 技能库和多模型生成能力结合起来，帮助创作者完成从灵感构思、脚本和分镜，到素材与视频生成的创作流程。

你可以从一句话创意、故事梗概、已有脚本或参考素材开始，让 Agent 协助梳理创作方向。确定方案后，可以继续生成脚本、分镜、角色、场景、道具和其他创作素材。常用的创作经验还可以沉淀为 Skill，在不同项目中重复使用。

官方站点介绍的核心能力包括：

* **Agent 创作引导**：通过自然语言对话完善创作方向和内容方案。
* **脚本与分镜生成**：将创意整理为脚本、分镜表和镜头级素材。
* **无限画布工作流**：通过节点组织文本、图片、视频和其他创作资产。
* **Skill 技能库**：将提示词优化、角色设定和风格统一等经验沉淀为可复用技能。
* **多模型创作**：根据任务需要选择图片生成、视频生成或其他模型能力。

本文以 Updream 的「外部模型直连器」为例，介绍如何使用 API易 的 OpenAI 兼容配置生成图片。截图中的示例模型为 `gpt-image-2`，具体模型 ID 和参数请以 API易 当前模型文档为准。

## 为什么在 Updream 中接入 API易？

通过 API易 接入 Updream，你可以：

* 使用统一的 API Key 配置外部模型。
* 在 Updream 中填写 Base URL、API Key 和模型 ID。
* 根据创作任务切换 API易 支持的模型。
* 将生成的图片继续用于分镜、角色、场景或其他创作资产。
* 保留 Updream 的 Agent、Skill 和画布工作流。

## 前置准备

开始前，请准备：

* 已安装并登录 Updream。
* 一个有效的 API易 API Key。
* API易 账户中有可用余额。
* 需要使用的模型 ID，例如 `gpt-image-2`。

<Warning>
  API Key 属于敏感凭证。请勿将真实密钥发布到截图、文档或公共聊天中。建议使用临时或权限受限的密钥，任务完成后及时撤销。
</Warning>

## 第一步：打开外部模型直连器

1. 打开 Updream，进入左侧的「技能」。
2. 进入「技能广场」。
3. 在搜索框中输入「外部模型直连器」。
4. 点击搜索结果中的「外部模型直连器」。
5. 点击「立即使用」。

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-market.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=355bcaabca93495564c10abc477d82a4" alt="Updream 技能广场中的外部模型直连器" width="1579" height="766" data-path="images/updream-skill-market.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-detail.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ed70b83ecbc1d7f043adcc459aaeb546" alt="Updream 外部模型直连器详情页" width="1456" height="804" data-path="images/updream-skill-detail.png" />

从详情页可以看到，该技能支持文本和图片输入，并提供图片、视频和文本输出选项。本文只验证并介绍其中的图片生成流程。

## 第二步：选择连接协议

在「连接」步骤中选择：

> **OpenAI 兼容（推荐）**

在自定义回答中填写 API易 的 Base URL 和 API Key。截图中的 API易 Base URL 为：

```text theme={null}
https://api.apiyi.com/v1
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-connection.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=066b622f4017d306ec63443122e7cbb5" alt="选择 OpenAI 兼容协议" width="805" height="466" data-path="images/updream-connection.png" />

<Info>
  本文使用截图中显示的 OpenAI 兼容配置。Google GenAI、Gemini REST、Seedance 和通用 JSON 等其他协议不属于本文的验证范围，请不要直接套用本页的参数。
</Info>

## 第三步：选择任务类型

在「任务」步骤中选择：

> **生成图片（推荐）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3d9b5efe007777b45306d8a8da30479" alt="选择生成图片任务" width="806" height="462" data-path="images/updream-task.png" />

该选项用于根据提示词直接生成图片。Updream 的外部模型直连器还显示了编辑图片、生成文本、提交视频和轮询任务等选项；这些任务需要根据实际模型、协议和接口要求单独配置，本文不将图片配置当作视频配置使用。

## 第四步：选择模型填写方式

在「模型」步骤中选择：

> **模型名即接口 ID**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=8d0a577cd0eb88c74b283a691580fd9c" alt="选择模型名即接口 ID" width="839" height="462" data-path="images/updream-model.png" />

这种方式要求填写模型的实际接口 ID。截图示例使用：

```text theme={null}
gpt-image-2
```

请使用 API易 模型文档中的准确模型 ID，不要填写展示名称、自定义别名或其他平台中的模型名称。

## 第五步：选择参数填写方式

在「参数」步骤中选择：

> **我提供完整参数（推荐）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-parameters.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=403ba71983675aa653c9a5f708d98044" alt="选择完整参数填写方式" width="817" height="447" data-path="images/updream-parameters.png" />

选择该方式后，需要在后续回答中提供图片提示词、比例、尺寸、质量和数量等参数。Updream 也提供「你帮我优化提示词」和「使用常规默认值」等选项，但它们不属于本文截图验证的配置路径。

## 第六步：填写 API 凭证

在「凭证」步骤中选择：

> **现在填写（推荐）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-credentials.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=9843e1ab900d327b7c7feace9dd5bc12" alt="选择现在填写 API 凭证" width="842" height="525" data-path="images/updream-credentials.png" />

随后按 Updream 提示填写 API易 的 Base URL 和 API Key。请使用你自己的 API Key，不要使用截图中的示例内容。

## 第七步：填写模型名称

在「模型名」步骤中选择：

> **现在填写（推荐）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model-name.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3fb10101ce86c1a8998a2d2e8330098" alt="填写模型名称" width="872" height="534" data-path="images/updream-model-name.png" />

填写实际使用的模型 ID：

```text theme={null}
gpt-image-2
```

如果要更换模型，只需要替换为 API易 当前支持的其他图片模型 ID，并确认该模型与当前任务类型兼容。

## 第八步：填写图片提示词

在「提示词」步骤中选择：

> **直接使用原文（推荐）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-prompt.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=32769dbb70cc23e32466328c6f136142" alt="选择直接使用原文" width="860" height="535" data-path="images/updream-prompt.png" />

然后填写图片提示词。例如：

```text theme={null}
风吹麦浪
```

如果希望 Updream 自动补充主体、构图、镜头、光影和画面约束，可以改用「允许优化」。选择「直接使用原文」时，提示词会按你填写的内容提交。

## 第九步：选择输出参数

在「输出」步骤中选择：

> **1:1 · 1K · 单张（推荐）**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-output.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=cc4352948846b67a69431fe804aed3f2" alt="选择图片输出参数" width="850" height="534" data-path="images/updream-output.png" />

截图中的示例配置如下：

| 参数   | 设置   |
| ---- | ---- |
| 宽高比  | 1:1  |
| 分辨率  | 1K   |
| 图片数量 | 1 张  |
| 质量   | 中等质量 |

Updream 同时显示了 `16:9 · 2K · 单张`、`9:16 · 2K · 单张` 和「自定义完整参数」选项。实际可用的尺寸、质量和数量取决于所选模型，请以模型文档和界面可选项为准。

## 第十步：提交 API易 配置

完成前面的选项后，Updream 会要求按照指定格式提交配置。截图中的示例格式为：

```text theme={null}
Base URL: https://api.apiyi.com/v1
API Key: YOUR_API_KEY
Model: gpt-image-2
Prompt: 风吹麦浪
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-reference.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=be4bba305fc22f776216498ff601a2f3" alt="提交外部模型配置的格式示例" width="865" height="630" data-path="images/updream-submit-reference.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-example.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ff8094bb573b32a8021091244755a5b5" alt="提交外部模型配置的填写示例" width="575" height="125" data-path="images/updream-submit-example.png" />

提交前请确认：

* Base URL 为 `https://api.apiyi.com/v1`。
* API Key 已替换为你自己的 API易 密钥。
* Model 使用准确的模型 ID。
* Prompt 包含完整的图片要求。
* 输出尺寸、质量和数量符合当前模型的能力范围。

## 第十一步：查看生成结果

提交后，Updream 会显示生成结果。截图中的示例结果为：

* 模型：`gpt-image-2`
* 提示词：风吹麦浪
* 规格：1:1
* 分辨率：1024 × 1024
* 数量：单张

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task-complete.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=3a5996a5b0c90c1225194834c23a534a" alt="Updream 图片生成结果" width="514" height="489" data-path="images/updream-task-complete.png" />

生成的图片可以继续作为 Updream 创作流程中的参考素材。具体能否继续用于某个节点或任务，取决于该任务在 Updream 中的输入类型和所选模型能力。

## 查看最新模型推荐

<Card title="查看最新模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、性能对比和使用建议。模型列表持续更新，确保您使用最新的 AI 模型。
</Card>

<Info>
  AI 模型和接口参数会持续更新。具体模型 ID、图片尺寸、质量选项和任务限制，请以 API易 模型推荐页面及对应模型文档为准。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="Base URL 应该填写什么？">
    按本文截图验证的 OpenAI 兼容流程，填写 `https://api.apiyi.com/v1`。其他协议对应的地址和参数不属于本文范围，请不要混用。
  </Accordion>

  <Accordion title="模型名称应该填写什么？">
    填写 API易 文档中的准确模型 ID，例如截图使用的 `gpt-image-2`。如果模型 ID 拼写错误，可能导致模型不存在或请求失败。
  </Accordion>

  <Accordion title="API Key 是否可以长期保留？">
    不建议。建议使用临时密钥或权限受限的密钥，并在任务完成后及时撤销或删除不再使用的配置。
  </Accordion>

  <Accordion title="可以直接用这套配置生成视频吗？">
    不可以直接这样推断。外部模型直连器界面显示支持提交视频和轮询任务，但视频任务需要根据实际模型、协议和参数单独配置。本文只验证图片生成流程。
  </Accordion>

  <Accordion title="为什么任务提交后没有结果？">
    依次检查 API Key 是否有效、Base URL 是否为 `https://api.apiyi.com/v1`、模型 ID 是否准确、模型是否支持当前图片任务，以及 API易 账户余额是否充足。若仍失败，请同时查看 Updream 的任务提示和 API易 返回的错误信息。
  </Accordion>

  <Accordion title="为什么生成结果与提示词不完全一致？">
    图片模型会对提示词进行理解和生成。可以尝试减少无关描述、明确主体和构图、把关键要求放在提示词前面，或关闭「允许优化」后直接提交原始提示词。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Updream 官方网站" icon="globe">
    `www.updream.cn`
  </Card>

  <Card title="API易 模型推荐" icon="star" href="/api-capabilities/model-info">
    查看最新模型、能力和使用建议。
  </Card>

  <Card title="API易 API 密钥管理" icon="key" href="/faq/token-management">
    获取和管理 API Key。
  </Card>

  <Card title="API易 API 文档" icon="book" href="/getting-started">
    查看 API 接入和调用说明。
  </Card>
</CardGroup>
