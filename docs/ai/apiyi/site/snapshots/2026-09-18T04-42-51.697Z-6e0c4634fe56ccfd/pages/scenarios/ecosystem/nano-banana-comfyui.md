> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana ComfyUI 节点

> 社区开源的 ComfyUI 自定义节点，支持通过 API易 调用 Nano Banana Pro 和 Nano Banana 2 图像生成模型，提供文生图、图生图、多轮对话等丰富功能。

## 概述

ComfyUI-Nano-Banana-apiyi 是社区用户贡献的 ComfyUI 自定义节点集合，专为 API易 用户打造。它让你在 ComfyUI 工作流中直接调用谷歌最强图像生成模型 Nano Banana Pro 和 Nano Banana 2，**无需配置谷歌云账号**，只需 API易 密钥即可开始创作。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/pdmaker/ComfyUI-Nano-Banana-apiyi`
  * 📜 许可证：MIT
  * 👤 作者：社区贡献（原作者仓库已删除，现使用备份仓库）
  * ⭐ 该项目由社区用户贡献，专为 API易 适配
</Info>

## 为什么选择这个节点

<CardGroup cols={2}>
  <Card title="零门槛接入" icon="key">
    无需谷歌云账号，使用 API易 密钥即可调用 Nano Banana Pro 和 Nano Banana 2 模型
  </Card>

  <Card title="多模态生图" icon="images">
    支持文生图、图生图、多图融合（最多 14 张参考图），满足各类创作需求
  </Card>

  <Card title="多轮对话编辑" icon="messages-square">
    独创对话式图像生成，支持上下文记忆，逐步迭代优化图片效果
  </Card>

  <Card title="超高分辨率" icon="expand">
    支持 512px、1K、2K、4K 输出，14 种宽高比，覆盖海报、壁纸、社交媒体等各种场景
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称            | 模型标识                             | 特点                  | API文档                                         |
| --------------- | -------------------------------- | ------------------- | --------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview`     | 旗舰画质，功能全面           | [查看文档](/api-capabilities/nano-banana-image)   |
| Nano Banana 2   | `gemini-3.1-flash-image-preview` | Pro 级画质 + Flash 级速度 | [查看文档](/api-capabilities/nano-banana-2-image) |

<Tip>
  **模型怎么选？** 追求极致画质选 Nano Banana Pro；追求性价比和速度选 Nano Banana 2（低至 \$0.025/张）。两个模型都可以在同一个 ComfyUI 工作流中使用。
</Tip>

## 四大核心节点

本插件提供 4 个功能节点，覆盖不同的使用场景：

| 节点名称                              | 对应模型  | 核心能力                      | 适合场景   |
| --------------------------------- | ----- | ------------------------- | ------ |
| **Nano Banana AIO**               | Pro   | 文生图 + 图生图（1-6张参考图）+ 搜索增强  | 高质量创作  |
| **Nano Banana Multi-Turn Chat**   | Pro   | 多轮对话式图像编辑                 | 迭代优化   |
| **Nano Banana 2 AIO**             | Flash | 文生图 + 图生图（最多14张参考图）+ 图像搜索 | 快速批量生图 |
| **Nano Banana 2 Multi-Turn Chat** | Flash | 多轮对话式编辑 + 极端宽高比           | 快速迭代   |

## 从零开始：安装与配置

<Steps>
  <Step title="第一步：确认环境">
    请确保你的电脑已安装以下软件：

    * **ComfyUI**（最新版本）— 如未安装，参考：`github.com/comfyanonymous/ComfyUI`
    * **Python 3.12+**
    * **Git**

    <Warning>
      Python 版本必须 3.12 或更高，低版本可能导致依赖安装失败。
    </Warning>
  </Step>

  <Step title="第二步：下载节点代码">
    打开终端，进入 ComfyUI 的自定义节点目录，克隆仓库：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/pdmaker/ComfyUI-Nano-Banana-apiyi.git
    ```
  </Step>

  <Step title="第三步：安装依赖">
    进入插件目录，安装所需依赖：

    ```bash theme={null}
    cd ComfyUI-Nano-Banana-apiyi
    pip3 install -r requirements.txt
    ```

    如果要使用 Nano Banana 2 节点，还需额外安装：

    ```bash theme={null}
    pip3 install google-genai --upgrade
    ```
  </Step>

  <Step title="第四步：获取 API易 密钥">
    1. 访问 [API易控制台](https://api.apiyi.com) 注册/登录
    2. 进入【令牌】栏目
    3. 点击生成新的 API 密钥
    4. 复制密钥（以 `sk-` 开头）备用

    <Info>
      新用户注册即可获得免费测试额度，足够体验 Nano Banana 图像生成功能。
    </Info>
  </Step>

  <Step title="第五步：配置环境变量">
    在插件目录中，复制模板文件并填入密钥：

    ```bash theme={null}
    cp .env.api.template .env
    ```

    编辑 `.env` 文件，填入你的 API易 密钥和 Base URL：

    ```bash theme={null}
    GOOGLE_API_KEY=sk-你的API易密钥
    CUSTOM_BASE_URL=https://api.apiyi.com
    ```

    <Tip>
      **关键配置**：`CUSTOM_BASE_URL` 必须设为 `https://api.apiyi.com`，这样所有请求会通过 API易 转发，无需谷歌云账号。代码会自动拼接正确的 API 版本路径。
    </Tip>
  </Step>

  <Step title="第六步：重启 ComfyUI 并验证">
    重启 ComfyUI 后，在节点列表中搜索 `Nano Banana`，你应该能看到 4 个新节点：

    * Nano Banana AIO
    * Nano Banana Multi-Turn Chat
    * Nano Banana 2 AIO
    * Nano Banana 2 Multi-Turn Chat

    如果能看到这些节点，说明安装成功！
  </Step>
</Steps>

## 实战教程：从文字到图片

### 场景一：文字生成图片（最基础）

这是最简单的用法——输入一段文字描述，生成一张图片。

<Steps>
  <Step title="添加节点">
    在 ComfyUI 画布上右键，搜索并添加 **Nano Banana AIO** 节点（或 Nano Banana 2 AIO）。
  </Step>

  <Step title="填写提示词">
    在 `prompt` 输入框中填写你想要的图片描述，例如：

    ```
    一只橘猫坐在窗台上，窗外是东京夜景，赛博朋克风格，霓虹灯光，高细节，电影质感
    ```
  </Step>

  <Step title="设置参数">
    * **image\_count**：生成图片数量（1-10张）
    * **aspect\_ratio**：选择宽高比，如 `16:9`（横屏壁纸）或 `9:16`（手机壁纸）
    * **image\_size**：选择分辨率，推荐 `2K` 或 `4K`
    * **temperature**：创意程度，0.0 最保守，2.0 最天马行空
  </Step>

  <Step title="运行工作流">
    点击 ComfyUI 的 **Queue Prompt** 按钮，等待几秒即可看到生成的图片。
  </Step>
</Steps>

### 场景二：图片编辑与融合

使用参考图片来引导生成，适合风格迁移、元素融合等高级用法。

1. 将 **Nano Banana AIO** 节点的 `image_1` 到 `image_6` 输入端连接你的参考图片
2. 在 `prompt` 中描述你想要的效果，例如："将这张照片转换为水彩画风格"
3. 模型会结合参考图片和文字描述生成新图片

<Tip>
  **Nano Banana 2 AIO 独家能力**：支持最多 14 张参考图（10 张物体 + 4 张角色一致性参考），适合需要保持角色外观一致的连续创作场景。
</Tip>

### 场景三：多轮对话式编辑

这是 Nano Banana 节点最独特的功能——像聊天一样逐步优化图片。

1. 添加 **Nano Banana Multi-Turn Chat** 节点
2. 第一轮：输入初始描述，生成基础图片
3. 第二轮：输入修改指令，如"把背景换成海边"
4. 第三轮：继续优化，如"增加夕阳光效"
5. 每一轮都会基于之前的对话记忆进行修改

需要重新开始时，打开 `reset_chat` 选项清除对话历史。

## 节点参数详解

### Nano Banana AIO / Nano Banana 2 AIO

| 参数名                       | 类型      | 必填 | 说明                       |
| ------------------------- | ------- | -- | ------------------------ |
| `prompt`                  | string  | 是  | 图片描述文本                   |
| `image_count`             | integer | 否  | 生成图片数量（1-10），默认 1        |
| `aspect_ratio`            | enum    | 否  | 宽高比（11种 / NB2 支持14种）     |
| `image_size`              | enum    | 否  | 分辨率：512px（仅NB2）、1K、2K、4K |
| `temperature`             | float   | 否  | 创意温度 0.0-2.0             |
| `use_search`              | boolean | 否  | 启用 Google 搜索增强           |
| `image_1` \~ `image_6/14` | image   | 否  | 参考图片输入                   |

### 支持的宽高比

| 标准宽高比（两个节点共享）       | Nano Banana 2 独有 |
| ------------------- | ---------------- |
| 1:1、2:3、3:2、3:4、4:3 | 1:4（超长竖图）        |
| 4:5、5:4、9:16、16:9   | 4:1（超宽横图）        |
| 21:9、Auto（AI自动选择）   | 1:8、8:1（极端比例）    |

## 常见问题

<AccordionGroup>
  <Accordion title="安装后在 ComfyUI 中找不到节点怎么办？">
    请逐项检查：

    1. 插件文件夹是否在 `ComfyUI/custom_nodes/` 目录下
    2. 是否执行了 `pip3 install -r requirements.txt`
    3. 使用 Nano Banana 2 节点需额外执行 `pip install google-genai --upgrade`
    4. 是否**重启**了 ComfyUI（不是刷新网页，是重启后端服务）
  </Accordion>

  <Accordion title="生成图片时报错 API Key 无效？">
    请确认：

    1. `.env` 文件中的 `GOOGLE_API_KEY` 填写的是 API易 密钥（以 `sk-` 开头）
    2. `CUSTOM_BASE_URL` 设置为 `https://api.apiyi.com`
    3. API易 账户余额充足（登录控制台查看）
  </Accordion>

  <Accordion title="生成速度慢或超时？">
    * 4K 分辨率生成时间较长，建议先用 1K 调试效果
    * 多图生成（image\_count 大于 1）会增加耗时
    * 如果频繁超时，可尝试降低分辨率或减少生成数量
  </Accordion>

  <Accordion title="Nano Banana Pro 和 Nano Banana 2 该选哪个？">
    * **Nano Banana Pro**（`gemini-3-pro-image-preview`）：画质更精细，适合高品质创作
    * **Nano Banana 2**（`gemini-3.1-flash-image-preview`）：速度更快、成本更低（\$0.025/张起），支持更多参考图和极端宽高比
    * 日常创作推荐 Nano Banana 2，追求极致质量选 Pro
  </Accordion>

  <Accordion title="如何获取 API易 密钥？">
    访问 [API易控制台](https://api.apiyi.com/token)，注册账号后在【令牌】栏目生成新的密钥。新用户有免费测试额度。
  </Accordion>

  <Accordion title="图片生成失败，提示内容安全限制？">
    Nano Banana 模型内置内容安全检查，部分描述可能触发限制。建议：

    1. 调整提示词，避免敏感内容
    2. 查看 [Nano Banana 生图失败排查](/faq/nano-banana-image-failure) 获取更多帮助
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro 文档" icon="banana" href="/api-capabilities/nano-banana-image">
    查看 Nano Banana Pro 完整 API 文档和定价
  </Card>

  <Card title="Nano Banana 2 文档" icon="banana" href="/api-capabilities/nano-banana-2-image">
    查看 Nano Banana 2 完整 API 文档和定价
  </Card>

  <Card title="生图失败排查" icon="circle-question-mark" href="/faq/nano-banana-image-failure">
    Nano Banana 生图常见问题排查指南
  </Card>

  <Card title="API易-令牌管理" icon="settings" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量和余额
  </Card>
</CardGroup>
