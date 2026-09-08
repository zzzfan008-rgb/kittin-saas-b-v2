> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck Nano Banana Pro - ComfyUI 节点

> 社区贡献的高阶 ComfyUI 节点：支持最多 14 张参考图、1K/2K/4K 输出、15 种宽高比、超时重试与实时进度，适合重度图像创作工作流。

## 概述

`Comfyui-LuckNanoBananaPro` 是社区用户 luckdvr 贡献的 ComfyUI 自定义节点，通过 API易 调用 Gemini 3 Pro Image Preview / Flash 进行**文生图与多图编辑**。相比基础版节点，它的最大亮点是**工程化**：内置超时重试、实时进度指示、ComfyUI 原生 seed 管理，以及最多 14 张图片堆叠输入，适合对稳定性和批量控制有要求的生产工作流。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/luckdvr/Comfyui-LuckNanoBananaPro`
  * 📜 许可证：MIT / Apache-2.0 双许可
  * 👤 作者：luckdvr
  * ⭐ 该项目由社区用户贡献，专为 API易 适配
</Info>

<Tip>
  **如何在三款 ComfyUI 节点中选择？**

  API易 社区目前有 3 款 Nano Banana ComfyUI 节点，可按需选择：

  * **[Nano Banana ComfyUI 节点](/scenarios/ecosystem/nano-banana-comfyui)**：功能全面（对话式编辑、多轮记忆），适合交互创作
  * **[APIYI Nano Banana Node（轻量版）](/scenarios/ecosystem/apiyi-nano-banana-node)**：代码极简，适合学习和二次开发
  * **Luck Nano Banana Pro（本页）**：工程化参数齐全（超时、重试、14 图输入），适合稳定生产
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="14 张图同时输入" icon="images">
    `image_01` \~ `image_14` 参数位可堆叠最多 14 张参考图，覆盖 Nano Banana Pro 的理论输入上限
  </Card>

  <Card title="多档分辨率" icon="image">
    支持 **1K / 2K / 4K** 三档输出，搭配自适应超时，兼顾速度与画质
  </Card>

  <Card title="15 种宽高比" icon="ratio">
    预置丰富的宽高比选项，覆盖竖屏、横屏、方图、电影宽幅等常见需求
  </Card>

  <Card title="双模型切换" icon="layers">
    `gemini-3-pro-image-preview`（Pro）与 `gemini-3.1-flash-image-preview`（Flash）自由切换
  </Card>

  <Card title="超时与重试" icon="refresh-cw">
    `timeout_seconds`（10-600s）+ `retry_times`（1-20 次）可配置，高峰期也稳
  </Card>

  <Card title="实时进度指示" icon="gauge">
    节点内置状态、百分比、计时显示，长任务不再黑盒
  </Card>

  <Card title="原生 Seed 管理" icon="dices">
    支持 ComfyUI 标准的 fixed / random / increment / decrement 四种 seed 模式
  </Card>

  <Card title="MIT / Apache-2.0 双许可" icon="shield">
    宽松许可，商用与二次开发都无忧
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称                 | 模型标识                             | 用途           | API 文档                                               |
| -------------------- | -------------------------------- | ------------ | ---------------------------------------------------- |
| Nano Banana Pro      | `gemini-3-pro-image-preview`     | 高质量图像生成与多图编辑 | [查看文档](/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2（Flash） | `gemini-3.1-flash-image-preview` | 快速生成，成本更低    | [查看文档](/api-capabilities/gemini/native)              |

## 节点参数

| 参数名                     | 类型     | 必填 | 默认值                          | 说明                          |
| ----------------------- | ------ | -- | ---------------------------- | --------------------------- |
| `api_key`               | string | 是  | -                            | API易 令牌，建议单独创建带用量上限的专用 Key  |
| `prompt`                | string | 是  | -                            | 生成或编辑的文本指令                  |
| `model`                 | enum   | 是  | `gemini-3-pro-image-preview` | 模型选择（Pro / Flash）           |
| `image_size`            | enum   | 否  | `2K`                         | 输出分辨率（1K / 2K / 4K）         |
| `aspect_ratio`          | enum   | 否  | `1:1`                        | 15 种宽高比之一                   |
| `timeout_seconds`       | int    | 否  | 120                          | 单次请求超时（10-600 秒）            |
| `retry_times`           | int    | 否  | 3                            | 失败重试次数（1-20 次）              |
| `seed`                  | int    | 否  | 0                            | 随机种子（配合 ComfyUI 标准 seed 模式） |
| `image_01` … `image_14` | IMAGE  | 否  | -                            | 可选参考图输入，最多 14 张             |

## 安装配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    进入 ComfyUI 安装目录：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-LuckNanoBananaPro.git
    ```
  </Step>

  <Step title="第二步：安装依赖">
    ```bash theme={null}
    cd Comfyui-LuckNanoBananaPro
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="第三步：重启 ComfyUI">
    重启后在节点搜索栏输入 `Luck Nano Banana Pro` 即可找到节点。
  </Step>

  <Step title="第四步：配置 API易 密钥">
    * 访问 [API易控制台](https://www.apiyi.com) →【令牌】，**新建一个带用量上限的专用密钥**（安全最佳实践）
    * 粘贴到节点 `api_key` 参数即可
    * 节点内部已指向 `api.apiyi.com`，无需额外配置
  </Step>

  <Step title="第五步：搭建工作流">
    * **文生图**：直接填 `prompt`，不连接任何参考图
    * **多图编辑**：将多个 `Load Image` 连到 `image_01`, `image_02`…，搭配 `prompt` 描述编辑指令
  </Step>
</Steps>

## 使用示例

### 示例 1：高稳定性文生图

```
prompt: "Cinematic product shot of a minimalist ceramic teacup on a wooden tray, soft morning light, 35mm lens, shallow depth of field"
model: gemini-3-pro-image-preview
image_size: 4K
aspect_ratio: 3:2
timeout_seconds: 300
retry_times: 5
```

### 示例 2：多图融合

```
image_01: 人物照片
image_02: 服装参考
image_03: 场景参考
image_04: 光线参考
prompt: "Photorealistic portrait: subject from image_01 wearing outfit from image_02, in the setting of image_03, with lighting style of image_04"
image_size: 2K
aspect_ratio: 4:5
```

### 示例 3：Seed 批量探索

通过 ComfyUI 原生 seed 管理，在 `increment` 模式下批量跑多个种子，快速对比同一 prompt 的变化。

## 常见问题

<AccordionGroup>
  <Accordion title="节点找不到？">
    1. 确认仓库在 `ComfyUI/custom_nodes/Comfyui-LuckNanoBananaPro`
    2. 依赖安装无报错（尤其是 requests / Pillow / numpy）
    3. 完全重启 ComfyUI（刷新前端不够）
  </Accordion>

  <Accordion title="4K 经常超时？">
    该节点已支持可调 `timeout_seconds`：

    * 4K 场景建议 `timeout_seconds=300` 起步
    * 搭配 `retry_times=5` 自动重试，应对网络抖动
    * 若仍频繁超时，参考 [下载 CDN 图片/视频很慢怎么办](/faq/cdn-download-slow) 优化服务器网络
  </Accordion>

  <Accordion title="14 张参考图都会被使用吗？">
    节点允许连接最多 14 张，但**实际是否参与生成**取决于 prompt 的描述。建议在 prompt 中明确引用 `image_01` / `image_02`…，或用自然语言描述每张图的作用，模型会按你的指令选择性使用。
  </Accordion>

  <Accordion title="调用返回 401 / 403？">
    1. `api_key` 是否正确、未被分组限制误拦
    2. 所选模型是否在令牌的白名单内
    3. 余额是否充足，参考 [为什么还有余额跑不通](/faq/balance-insufficient)
  </Accordion>

  <Accordion title="和其他两款 Nano Banana ComfyUI 节点有什么区别？">
    * [nano-banana-comfyui（功能完整版）](/scenarios/ecosystem/nano-banana-comfyui)：强调**对话式编辑**与多轮记忆
    * [apiyi-nano-banana-node（轻量示例）](/scenarios/ecosystem/apiyi-nano-banana-node)：代码最简，适合学习/拓展
    * **Luck Nano Banana Pro（本页）**：参数工程化（超时 / 重试 / 14 图），适合批量与稳定生产
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API 文档" icon="book" href="/api-capabilities/nano-banana-image/overview">
    模型完整能力与 API 参数说明
  </Card>

  <Card title="Luck GPT-Image 2（同作者）" icon="puzzle" href="/scenarios/ecosystem/luckgpt2-comfyui">
    luckdvr 的 OpenAI 系列 ComfyUI 节点：`gpt-image-2` + `gpt-image-2-all`
  </Card>

  <Card title="ComfyUI 节点合集" icon="workflow" href="/scenarios">
    查看更多 Nano Banana ComfyUI 节点
  </Card>

  <Card title="FAQ：CDN 下载慢" icon="gauge" href="/faq/cdn-download-slow">
    4K 图片下载慢？看这里
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理密钥、用量与分组
  </Card>
</CardGroup>
