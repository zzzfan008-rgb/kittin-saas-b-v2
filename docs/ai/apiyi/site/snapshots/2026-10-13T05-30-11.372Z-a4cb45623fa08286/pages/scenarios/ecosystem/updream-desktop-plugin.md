> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Updream 桌面端接入 API易

> 通过 hellojint/updream-openai-compatible-plugin 插件，把 Updream 桌面端 v0.2.0 的图片生成任务转发到 APIYI 的 OpenAI 兼容图像接口，适合需要在本地执行任务、本地持有凭据的场景。

## 概述

`hellojint/updream-openai-compatible-plugin`（GitHub） 是一款面向 **Updream 桌面端 v0.2.0** 的开源图片生成插件，以 **通用 OpenAI 兼容图片** 协议工作。安装后可以把桌面端的图片生成请求转发到满足 OpenAI Images 接口规范的第三方 API 上游，**APIYI 在 API 路径上即满足此条件**。

<Info>
  **项目信息**

  * 开源地址：`github.com/hellojint/updream-openai-compatible-plugin`
  * 许可证：MIT
  * 作者：hellojint
  * 插件包名：`updream-openai-compatible-v1.updplugin`
  * 基于：Updream 官方插件开发指南里的 OpenAI image-provider 示例
</Info>

<Tip>
  **两种接入方式**

  如果你不需要"本地执行任务 / 本地持有凭据"这类场景，**优先使用 Updream 网页端**：
  [Updream 接入 API易（网页端）](/scenarios/agent/updream)。网页端通过 **"外部模型直连器" Skill + OpenAI 兼容** 协议接入 APIYI，**无需安装任何插件**，是大多数用户的推荐路径。

  本文档介绍的桌面端 + 插件路径适合需要在本地持有 API Key、批量执行图片生成任务、或在 Web 端遇到 OpenAI Images 协议限制时的场景。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="通用 OpenAI 兼容协议" icon="workflow">
    适用任何暴露 `/v1/images/generations`、鉴权使用 `Bearer` 的上游，APIYI 满足此条件
  </Card>

  <Card title="桌面端本地执行" icon="monitor">
    任务在 Updream 桌面端 v0.2.0 本地执行，结果回到 Web 端画布
  </Card>

  <Card title="API-Key 本地保存" icon="key">
    Key 由 Updream 在系统密钥链保存，运行时读取；插件本身不含任何凭据
  </Card>

  <Card title="多 Provider 共存" icon="layers">
    桌面端可同时配置多个 Provider（如 openai、apiyi-兼容），按需切换
  </Card>

  <Card title="尺寸自动映射" icon="ratio">
    桌面端清晰度 + 比例自动映射成上游 `size` 参数；也支持 `extra.size` 硬写覆盖
  </Card>

  <Card title="多种返回格式" icon="image">
    兼容 `data[].url` / `data[].b64_json` / 顶层 `url` 等多种返回结构，MIME 自动嗅探
  </Card>
</CardGroup>

## 支持的 APIYI 模型示例

下表给出在 **Endpoint ID** 字段可填的常见图像模型 ID，仅作示例：

| 模型名称 | 模型标识 | 用途 |
| - | - | - |
| GPT Image（示例） | `gpt-image-1` | 高质量图像生成 |
| GPT Image v2（示例） | `gpt-image-2` | 最新一代（具体可用性以 APIYI 当前模型文档为准） |
| Nano Banana（示例） | `nano-banana` | Google 系图像模型 |
| Gemini Flash Image（作者截图示例） | `gemini-3.1-flash-image` | 快速生成、成本更低 |

> 实际可用模型请以 [APIYI 模型推荐](/api-capabilities/model-info) 为准，本表仅展示插件能写入的字段格式。

## 插件配置参数

插件加载到桌面端后，在「添加 API-Key」表单里有以下字段：

| 字段 | 必填 | 说明 |
| - | - | - |
| **配置名称** | 是 | 自定义名称，例如 `apiyi-兼容`，用于在 Provider 列表里区分 |
| **协议类型** | 是 | 选择 **通用 OpenAI 兼容图片** |
| **生成类型** | 是 | 选择 `image` |
| **API-Key** | 是 | APIYI 平台 Key，由 Updream 在系统密钥链中保存，运行时读取 |
| **API 地址** | 是 | 上游 Base URL，APIYI 填 `https://api.apiyi.com/v1` |
| **模型** | 是 | 默认 `（跟 Endpoint ID 保持一致）`，也可显式选某项 |
| **Endpoint ID** | 否 | 填写则 **覆盖** 模型字段作为最终 `model` 值；通常填模型 ID 字符串 |
| **使用代理** | 否 | 通过全局代理访问 Provider；按需勾选 |

<Warning>
  API Key 属于敏感凭证。**不要把真实密钥写进任何截图、文档、Issue、README、聊天中**。建议在 [APIYI 控制台](https://www.apiyi.com) 为桌面端专门创建带用量上限的 Key，任务完成后及时撤销或删除。
</Warning>

## 安装与配置（按图步骤）

### 第 0 步：桌面端整体认识

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-task-overview.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=b2431a85db7a53efd727fad1b51cf896" alt="Updream 桌面端任务总览（v0.2.0）" width="1200" height="811" data-path="images/updream-desktop-task-overview.png" />

桌面端 v0.2.0 默认布局：左侧「本地执行」任务列表、顶部「同步 / 添加 Key / 导入插件 / 插件管理」、右下角版本号 `v0.2.0`。

### 第一步：导入插件

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-import-plugin.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=8f63d49aa37892c70145edcf2bb03300" alt="桌面端顶部「导入插件」入口" width="1194" height="70" data-path="images/updream-desktop-import-plugin.png" />

点击顶部「**导入插件**」按钮。在弹出的文件选择对话框中，选中下载好的 `updream-openai-compatible-v1.updplugin`，**按提示确认安装**。插件作者建议先审核 `plugin.py` 后再确认安装。

### 第二步：确认插件安装成功

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-plugin-installed.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=d0a9cd5d819da625a4cb95a13fb1309e" alt="插件安装后状态" width="609" height="169" data-path="images/updream-desktop-plugin-installed.png" />

在「插件管理」页可以看到已安装的 **通用 OpenAI 兼容图片**（`universal-openai-compatible-image · v1.0.0 · image`）。此时已具备桌面端调用任意 OpenAI Images 兼容上游的能力。

### 第三步：添加 Key

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-add-key.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=720b99501217ca1651ba3676211c0b94" alt="桌面端「添加 Key」入口" width="1193" height="144" data-path="images/updream-desktop-add-key.png" />

点击顶部「**添加 Key**」按钮，进入配置表单。

### 第四步：配置 APIYI

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-config-apiyi.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=3c52f8755f39c1d6330ec97772e4484a" alt="APIYI 配置示例" width="514" height="668" data-path="images/updream-desktop-config-apiyi.png" />

按图中示例填入：

| 字段 | 示例值 |
| - | - |
| 配置名称 | `apiyi-兼容` |
| 协议类型 | 通用 OpenAI 兼容图片 |
| 生成类型 | `image` |
| API-Key | 你的 APIYI 平台 Key（运行时读取，不入代码） |
| API 地址 | `https://api.apiyi.com/v1` |
| 模型 | 默认（跟 Endpoint ID 保持一致） |
| Endpoint ID | `gemini-3.1-flash-image`（来自 APIYI 模型文档） |

填写后点击「**测试连接**」「**测试生成**」验证显示 **连接成功！API 可用**，再保存。

### 第五步：确认 Provider 已启用

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-provider-list.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=1357b08d7da971ce18923f71e62e1d80" alt="Provider 列表" width="807" height="407" data-path="images/updream-desktop-provider-list.png" />

「配置」页的 Provider 列表里会出现新加的 `apiyi-兼容`，供应商标识为 `plugin:universal-openai-compatible-image`，状态 **启用**。可在多条 Provider 之间按需切换 / 禁用。

<Tip>
  桌面端配置完成后，请重新进入 Updream **Web 端**，在画布节点的图片生成 Provider 下拉里选择 `apiyi-兼容`，即可从 Web 端发起任务、由桌面端执行。
</Tip>

## 使用：Web → 桌面端 → Web 闭环

完成上面 5 步之后，从 Updream **Web 端**发起一次图片生成，桌面端会按 `apiyi-兼容` 这个 Provider 的配置，把请求转发到 `https://api.apiyi.com/v1/images/generations`，结果回到 Web 端画布节点。

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-web-recv-from-desktop.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=383de779592d3d3a270db2ca330bd158" alt="Web 端接收来自桌面端的生成结果" width="891" height="611" data-path="images/updream-web-recv-from-desktop.png" />

图中画布下方面板：`图片生成` + `apiyi-兼容`（箭头位置）+ `16:9 / 2K / ×1` 等输出参数。这是一张从 Updream Web 端发起、由桌面端执行、最终回到 Web 端画布的可视结果。

## 常见问题

<AccordionGroup>
  <Accordion title="桌面端看不到「导入插件」按钮？">
    请确认桌面端版本 **≥ v0.2.0**。早期版本可能没有插件加载能力，需要先升级 Updream 桌面端。
  </Accordion>

  <Accordion title="导入插件后，配置表单里没有「通用 OpenAI 兼容图片」选项？">
    1. 确认 `.updplugin` 包根目录直接包含 `plugin.py`，与 `manifest.entry` 一致
    2. 重启桌面端
    3. 在「插件管理」页确认插件状态不是「已禁用」
  </Accordion>

  <Accordion title="测试连接成功但生成失败？">
    1. 检查 **Endpoint ID** 是否拼写正确，且在 APIYI 当前模型列表里
    2. 检查账户余额是否充足（参考 [为什么还有余额跑不通](/faq/balance-insufficient)）
    3. 在桌面端「本地执行」页查看具体错误码
  </Accordion>

  <Accordion title="为什么桌面端能调用，Web 端用同一个 Provider 不行？">
    Web 端不走本插件。请使用 Web 端的「外部模型直连器」Skill + OpenAI 兼容协议配置，或参考 [Updream 接入 API易（网页端）](/scenarios/agent/updream)。
  </Accordion>

  <Accordion title="插件包如何重新打包？">
    修改 `manifest.json.version` 后重新打包：

    ```bash theme={null}
    zip -r updream-openai-compatible-v1.updplugin plugin.py manifest.json README.md
    ```

    注意 ZIP 根目录必须直接包含 `plugin.py`。
  </Accordion>

  <Accordion title="API Key 是否会进入插件代码或日志？">
    不会。本插件 **不含任何凭据**，Key 由 Updream 在系统密钥链保存，运行时通过 `cfg.get('api_key')` 读取；不要把真实 Key 写进 `plugin.py`、README、Issue 或聊天中。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Updream 接入 API易（网页端，推荐）" icon="globe" href="/scenarios/agent/updream">
    网页端通过「外部模型直连器」Skill 接入 APIYI，无需安装插件
  </Card>

  <Card title="hellojint/updream-openai-compatible-plugin" icon="github">
    本文档对应插件的开源仓库（MIT 许可）：`github.com/hellojint/updream-openai-compatible-plugin`
  </Card>

  <Card title="APIYI 模型推荐" icon="star" href="/api-capabilities/model-info">
    查看 APIYI 当前支持的图像模型与定价
  </Card>

  <Card title="APIYI API 密钥管理" icon="key" href="/faq/token-management">
    获取和管理 API Key 的最佳实践
  </Card>

  <Card title="APIYI 控制台" icon="settings" href="https://www.apiyi.com">
    创建专用 Key、查看用量、设置余额上限
  </Card>

  <Card title="APIYI 接入与调用说明" icon="book" href="/getting-started">
    查看 API 接入与 OpenAI 兼容协议说明
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.