> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI Nano Banana ComfyUI 节点（轻量示例版）

> 社区伙伴贡献的轻量级 ComfyUI 节点示例，开箱即用地在工作流中调用 Nano Banana Pro / 2，适合快速上手与二次拓展。

## 概述

`api_yi_nano_banana_node` 是社区好伙伴 JerrIsTheBesta 贡献的**轻量级 ComfyUI 节点示例**，聚焦于"开箱即用 + 易于拓展"。只需在 `custom_nodes` 目录放入节点并重启 ComfyUI，即可在工作流中直接调用 API易 的 Nano Banana Pro / Nano Banana 2 图像生成能力，非常适合作为学习与二次开发的起点。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/JerrIsTheBesta/api_yi_nano_banana_node`
  * 📜 许可证：MIT
  * 👤 作者：JerrIsTheBesta
  * ⭐ 该项目由社区好伙伴贡献，定位为**示例 + 可自行拓展**
</Info>

<Tip>
  **适合谁使用**

  该节点专注最核心的文生图与多图编辑能力，代码简洁、易读。如需更复杂的能力（对话式编辑、14 图融合等），推荐参考 [Nano Banana ComfyUI 节点（完整版）](/scenarios/ecosystem/nano-banana-comfyui)，或基于本示例自行拓展。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="两个核心节点" icon="workflow">
    `APIYI Text to Image` 文生图 + `APIYI Multi Image Edit` 多图编辑，覆盖最常用两种场景
  </Card>

  <Card title="双模型切换" icon="layers">
    内置选择 `gemini-3-pro-image-preview`（Nano Banana Pro）与 `gemini-3.1-flash-image-preview`
  </Card>

  <Card title="高分辨率支持" icon="image">
    支持 **2K / 4K** 输出，并根据分辨率自动调整超时时间
  </Card>

  <Card title="丰富宽高比" icon="ratio">
    内置 1:1、16:9、9:16、4:3、3:4、3:2、2:3、21:9、5:4、4:5 等 10 种比例
  </Card>

  <Card title="多图编辑输入" icon="images">
    `Multi Image Edit` 支持最多 **5 张参考图** 融合/编辑，适合合成、风格迁移
  </Card>

  <Card title="轻量易拓展" icon="code">
    Python 纯实现、依赖极少（requests / Pillow / numpy），代码结构清晰，便于二次开发
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称                 | 模型标识                             | 用途         | API 文档                                               |
| -------------------- | -------------------------------- | ---------- | ---------------------------------------------------- |
| Nano Banana Pro      | `gemini-3-pro-image-preview`     | 高质量图像生成与编辑 | [查看文档](/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2（Flash） | `gemini-3.1-flash-image-preview` | 快速生成，成本更低  | [查看文档](/api-capabilities/gemini/native)              |

## 节点说明

### APIYI Text to Image（文生图）

纯文本提示词生成图片，**不需要输入图像**。输出：生成的图片 + 文件名标识。

### APIYI Multi Image Edit（多图编辑）

支持**最多 5 张输入图**进行融合、编辑或合成。输出：结果图、文件名、实际使用的图片数量。

### 节点参数

| 参数名            | 类型     | 必填 | 默认值                          | 说明                         |
| -------------- | ------ | -- | ---------------------------- | -------------------------- |
| `api_key`      | string | 是  | -                            | API易 令牌，建议单独创建带用量上限的专用 Key |
| `prompt`       | string | 是  | -                            | 文本提示词                      |
| `model`        | enum   | 是  | `gemini-3-pro-image-preview` | 模型选择（Pro / Flash）          |
| `resolution`   | enum   | 否  | `2K`                         | 输出分辨率（2K / 4K，4K 自动延长超时）   |
| `aspect_ratio` | enum   | 否  | `1:1`                        | 宽高比（10 种可选）                |
| `images`       | IMAGE  | 否  | -                            | 多图编辑节点的参考图输入（最多 5 张）       |

## 安装配置

<Steps>
  <Step title="第一步：放入 custom_nodes 目录">
    进入 ComfyUI 安装目录，克隆或下载本仓库到 `custom_nodes`：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/JerrIsTheBesta/api_yi_nano_banana_node.git
    ```
  </Step>

  <Step title="第二步：安装 Python 依赖">
    节点依赖极少，通常 ComfyUI 已自带 torch。其他依赖如有缺失可手动安装：

    ```bash theme={null}
    pip install requests pillow numpy
    ```
  </Step>

  <Step title="第三步：重启 ComfyUI">
    重启后在节点搜索栏输入 `APIYI` 即可看到两个新节点：

    * `APIYI Text to Image`
    * `APIYI Multi Image Edit`
  </Step>

  <Step title="第四步：配置 API易 密钥">
    * 访问 [API易控制台](https://www.apiyi.com) 的【令牌】栏目，**新建一个专用密钥并设置用量上限**（安全最佳实践）
    * 将密钥复制粘贴到节点的 `api_key` 参数
    * API 端点无需手动配置，节点已内置 `https://api.apiyi.com` 路径
  </Step>

  <Step title="第五步：搭建简单工作流">
    * **文生图**：`APIYI Text to Image` → `Preview Image`
    * **多图编辑**：多个 `Load Image` → `APIYI Multi Image Edit` → `Preview Image`
  </Step>
</Steps>

## 使用示例

### 示例 1：文生图

```
节点：APIYI Text to Image
prompt: "A cute corgi astronaut floating in a neon-lit space station, cinematic lighting"
model: gemini-3-pro-image-preview
resolution: 2K
aspect_ratio: 16:9
```

### 示例 2：多图融合

```
节点：APIYI Multi Image Edit
images: [人物照片, 服装参考图, 背景参考图]
prompt: "Replace the outfit with the reference clothing, and set the scene in the reference background"
resolution: 4K
aspect_ratio: 1:1
```

## 拓展建议

该项目定位为**示例与起点**，欢迎 Fork 后按需拓展：

<CardGroup cols={2}>
  <Card title="对话式编辑" icon="messages-square">
    在节点中维护 session 上下文，支持多轮迭代优化图片
  </Card>

  <Card title="更多参考图" icon="images">
    参考 Nano Banana Pro 能力，将参考图上限扩展到 14 张
  </Card>

  <Card title="Seed 控制" icon="dices">
    添加 seed 参数以支持可复现的生成
  </Card>

  <Card title="批量输出" icon="layers">
    支持一次生成多张并输出为 batch，配合 ComfyUI 的后续节点链
  </Card>
</CardGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="节点安装后在搜索栏找不到？">
    1. 确认仓库放在 `ComfyUI/custom_nodes/` 目录下
    2. 完全重启 ComfyUI（不是仅刷新前端）
    3. 查看 ComfyUI 控制台输出，确认没有 Python 依赖报错
  </Accordion>

  <Accordion title="调用失败，提示 401 / 403？">
    请检查：

    1. `api_key` 是否填写正确，且未被错误分组限制
    2. 所选模型是否在当前令牌的模型白名单内
    3. 账户余额是否充足，参考 [为什么还有余额跑不通](/faq/balance-insufficient)
  </Accordion>

  <Accordion title="4K 分辨率经常超时？">
    节点已对 4K 自动延长超时，但若仍超时：

    1. 检查服务器到 API 的网络质量（参考 [下载 CDN 图片/视频很慢怎么办](/faq/cdn-download-slow)）
    2. 在高峰期可暂时回退到 2K 或使用 Flash 模型
  </Accordion>

  <Accordion title="是否安全地暴露了 API Key？">
    作者明确建议：**不要使用主 Key**，而是在 API易 控制台单独创建一个带用量上限的专用 Key 给该节点使用，避免泄漏带来额外损失。
  </Accordion>

  <Accordion title="和已有的 ComfyUI-Nano-Banana-apiyi 节点有什么区别？">
    * 本节点：**轻量示例**，仅 2 个节点，代码简洁、依赖极少，适合上手和二次开发
    * [完整版节点](/scenarios/ecosystem/nano-banana-comfyui)：功能更全（对话式编辑、14 图融合等），适合生产工作流
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API 文档" icon="book" href="/api-capabilities/nano-banana-image/overview">
    查看 Nano Banana Pro 的完整 API 能力
  </Card>

  <Card title="ComfyUI 完整版节点" icon="workflow" href="/scenarios/ecosystem/nano-banana-comfyui">
    功能更完整的 Nano Banana ComfyUI 节点集合
  </Card>

  <Card title="使用场景总览" icon="rocket" href="/scenarios">
    查看更多 API易 使用场景
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理 API 密钥和查看用量
  </Card>
</CardGroup>
