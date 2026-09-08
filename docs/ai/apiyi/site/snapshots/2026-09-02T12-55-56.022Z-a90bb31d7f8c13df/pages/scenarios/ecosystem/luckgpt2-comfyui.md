> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI 节点

> 社区贡献的双节点合集：一键在 ComfyUI 调用 gpt-image-2（官转）与 gpt-image-2-all（官逆），覆盖文生图、参考图编辑、mask 重绘、自定义分辨率。

## 概述

`Comfyui-Luck-gpt2.0` 是社区用户 luckdvr 贡献的 ComfyUI 自定义节点合集，在 ComfyUI 中一键调用 API易 的两款 GPT 图像模型 —— **官转 `gpt-image-2`** 与 **官逆 `gpt-image-2-all`**。两个节点分工明确：前者主打精细参数（分辨率、画质、mask、多参考图），后者主打 ChatGPT 一致的对话式出图体验，配合超时重试，适合放进生产级工作流。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 许可证：Apache-2.0
  * 👤 作者：luckdvr
  * ⭐ 该项目由社区用户贡献，专为 API易 适配
</Info>

<Tip>
  **同一作者的两套节点如何区分？**

  luckdvr 为 API易 贡献了两套 ComfyUI 节点：

  * **[Luck Nano Banana Pro](/scenarios/ecosystem/lucknanobananapro-comfyui)**：调用 Gemini 系列（`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`），强调 14 张参考图与工程化超时重试
  * **Luck GPT-Image 2（本页）**：调用 OpenAI 系列（`gpt-image-2` / `gpt-image-2-all`），强调双端点切换（chat\_completions / images\_api）与 mask 重绘
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="双节点双路线" icon="layers">
    `Comfyui-Luck gpt-image-2`（官转）与 `Comfyui-Luck gpt-2.0 all`（官逆）各管一路，按场景自由选择
  </Card>

  <Card title="最多 5 张参考图" icon="images">
    官转节点支持最多 5 张参考图叠加输入，满足复杂融合与风格迁移
  </Card>

  <Card title="Mask 局部重绘" icon="eraser">
    支持可选 mask 输入，精准圈定重绘区域，做精细化局部编辑
  </Card>

  <Card title="多档分辨率 + 自定义尺寸" icon="image">
    1K / 2K / 4K 预设 + 自定义尺寸（单边最大 3840px，像素数 65.5 万–829.4 万）
  </Card>

  <Card title="15 种宽高比" icon="ratio">
    AUTO、1:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、21:9、1:4、4:1、1:8、8:1
  </Card>

  <Card title="画质与输出格式可选" icon="sliders-horizontal">
    `quality`（auto / low / medium / high）+ 输出格式（png / jpeg / webp）+ 压缩率 0-100
  </Card>

  <Card title="双端点切换（官逆节点）" icon="git-branch">
    `gpt-image-2-all` 节点支持 `chat_completions` / `images_api` 端点切换，兼容不同调用习惯
  </Card>

  <Card title="超时重试内建" icon="refresh-cw">
    内置超时与重试参数，应对高峰期网络抖动
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称                | 模型标识              | 对应节点                       | 用途                         | API 文档                                             |
| ------------------- | ----------------- | -------------------------- | -------------------------- | -------------------------------------------------- |
| GPT-Image 2（官转）     | `gpt-image-2`     | `Comfyui-Luck gpt-image-2` | 原生 2K/4K 文生图、参考图编辑、mask 重绘 | [查看文档](/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（官逆） | `gpt-image-2-all` | `Comfyui-Luck gpt-2.0 all` | ChatGPT 一致的对话式出图，按次计费      | [查看文档](/api-capabilities/gpt-image-2-all/overview) |

<Info>
  两款模型的完整差异详解见 [gpt-image-2（官转）vs gpt-image-2-all（官逆）对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
</Info>

## 节点参数

### `Comfyui-Luck gpt-image-2`（官转）

| 参数名                   | 类型     | 必填 | 默认值    | 说明                                  |
| --------------------- | ------ | -- | ------ | ----------------------------------- |
| `api_key`             | string | 是  | -      | API易 令牌，建议单独创建带用量上限的专用 Key          |
| `prompt`              | string | 是  | -      | 生成或编辑的文本指令                          |
| `image_1` … `image_5` | IMAGE  | 否  | -      | 参考图输入，最多 5 张                        |
| `mask`                | MASK   | 否  | -      | 可选 mask，用于局部重绘（白色区域为编辑区）            |
| `size`                | enum   | 否  | `2K`   | 输出分辨率（1K / 2K / 4K / custom）        |
| `custom_size`         | string | 否  | -      | `size` 选 `custom` 时生效，如 `2048x3072` |
| `aspect_ratio`        | enum   | 否  | `AUTO` | 15 种宽高比之一                           |
| `quality`             | enum   | 否  | `auto` | auto / low / medium / high          |
| `output_format`       | enum   | 否  | `png`  | png / jpeg / webp                   |
| `output_compression`  | int    | 否  | 80     | 0-100（仅对 jpeg / webp 生效）            |

### `Comfyui-Luck gpt-2.0 all`（官逆）

| 参数名               | 类型     | 必填 | 默认值                | 说明                                |
| ----------------- | ------ | -- | ------------------ | --------------------------------- |
| `api_key`         | string | 是  | -                  | API易 令牌                           |
| `prompt`          | string | 是  | -                  | 对话式生图指令                           |
| `endpoint`        | enum   | 否  | `chat_completions` | `chat_completions` / `images_api` |
| `response_format` | enum   | 否  | -                  | `b64_json` / `url` 等              |
| `timeout_seconds` | int    | 否  | -                  | 单次请求超时                            |
| `retry_times`     | int    | 否  | -                  | 失败重试次数                            |

## 安装配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    进入 ComfyUI 安装目录：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```
  </Step>

  <Step title="第二步：安装依赖">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="第三步：重启 ComfyUI">
    在节点搜索栏输入 `Luck gpt-image-2` 或 `Luck gpt-2.0 all` 即可找到两个节点。
  </Step>

  <Step title="第四步：配置 API易 密钥">
    * 访问 [API易控制台](https://www.apiyi.com) →【令牌】新建密钥（建议配用量上限）
    * 粘贴到节点的 `api_key` 参数
    * 节点默认指向 `api.apiyi.com`；不稳定时可切换备用域名 `vip.apiyi.com` / `b.apiyi.com`
  </Step>

  <Step title="第五步：导入示例工作流">
    仓库内提供 `example_workflow.json`，可直接在 ComfyUI 中导入作为工作流起点。
  </Step>
</Steps>

## 使用示例

### 示例 1：官转 4K 高质量文生图

```
节点: Comfyui-Luck gpt-image-2
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
size: 4K
aspect_ratio: 2:3
quality: high
output_format: png
```

### 示例 2：mask 局部重绘（官转）

```
节点: Comfyui-Luck gpt-image-2
image_1: 原始照片
mask: 要替换的区域（白色为编辑区）
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
size: 2K
quality: high
```

### 示例 3：官逆对话式出图

```
节点: Comfyui-Luck gpt-2.0 all
endpoint: chat_completions
prompt: "一位穿汉服的少女站在樱花树下，水彩画风格，柔和光线"
response_format: b64_json
timeout_seconds: 180
retry_times: 3
```

## 常见问题

<AccordionGroup>
  <Accordion title="两个节点如何选？">
    * **`gpt-image-2`（官转）**：参数可控、原生支持 mask、按 token 计费、分辨率 / 画质精细可调 —— 适合有明确尺寸要求或需要局部重绘的工作流
    * **`gpt-image-2-all`（官逆）**：按次计费（\$0.03 / 次），对话式自然语言出图、与 ChatGPT 网页版能力一致 —— 适合多轮改图、文字还原要求高的场景
    * 完整差异看 [官转 vs 官逆 对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="节点找不到？">
    1. 确认目录 `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0` 存在
    2. `pip install -r requirements.txt` 无报错
    3. 完全重启 ComfyUI（只刷新前端不够）
  </Accordion>

  <Accordion title="4K 或自定义分辨率经常超时？">
    * 调大官逆节点的 `timeout_seconds` 参数
    * 服务器网络慢可参考 [下载 CDN 图片/视频很慢怎么办](/faq/cdn-download-slow)
    * 默认域名不稳时可切换到备用 `vip.apiyi.com` / `b.apiyi.com`
  </Accordion>

  <Accordion title="官逆节点返回的 b64_json 带前缀？">
    官逆 `gpt-image-2-all` 的 `b64_json` 字段会带 `data:image/png;base64,` 前缀，而官转 `gpt-image-2` 不带。详细说明见 [官转 vs 官逆 对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
  </Accordion>

  <Accordion title="调用返回 401 / 403？">
    1. 检查 `api_key` 是否正确，是否被分组限制误拦
    2. 所选模型是否在令牌的白名单内
    3. 余额问题参考 [为什么还有余额跑不通](/faq/balance-insufficient)
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="gpt-image-2（官转）文档" icon="book" href="/api-capabilities/gpt-image-2/overview">
    原生 2K/4K 高清生图，按 token 计费
  </Card>

  <Card title="gpt-image-2-all（官逆）文档" icon="book" href="/api-capabilities/gpt-image-2-all/overview">
    ChatGPT 一致体验，\$0.03 / 次按次计费
  </Card>

  <Card title="官转 vs 官逆 对比" icon="scale" href="/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17 个维度一表看清两款模型的差异
  </Card>

  <Card title="ComfyUI 节点合集" icon="workflow" href="/scenarios">
    查看更多 API易 适配的 ComfyUI 节点
  </Card>

  <Card title="Luck Nano Banana Pro（同作者）" icon="puzzle" href="/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr 的 Gemini 系列 ComfyUI 节点
  </Card>

  <Card title="APIYI GPT-Image 2 Skills（同模型）" icon="puzzle" href="/scenarios/ecosystem/apiyi-gpt-image-skills">
    两款 GPT 图像模型的 AI Agent Skill 封装版本
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理密钥、用量与分组
  </Card>
</CardGroup>
