> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Annotator - ComfyUI 节点

> 社区贡献的图像标注节点：在图上直接画点、框、多边形标出要改的区域，配合 Nano Banana 节点大幅降低改图的提示词门槛。

## 概述

`comfyui-image-annotator` 是社区用户 luckdvr 贡献的**交互式图像标注 ComfyUI 节点**。它的核心价值是——**降低提示词门槛**。你不用再费劲描述"把图片左上角那个红色按钮换成蓝色"，只要在图上**圈出来、点一下、画个框**，让模型清楚看到"我要改这里"即可。最适合搭配在 Nano Banana Pro 节点**前面**，组成"图片 → 标注 → API"的三段式工作流。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/luckdvr/comfyui-image-annotator`
  * 📜 许可证：MIT
  * 👤 作者：luckdvr
  * ⭐ 社区贡献，与 [Luck Nano Banana Pro](/scenarios/ecosystem/lucknanobananapro-comfyui) 同作者
</Info>

<Tip>
  **推荐工作流：图片 → 标注节点 → API 节点**

  ```
  LoadImage  ─►  ImageAnnotator  ─►  Luck Nano Banana Pro  ─►  SaveImage
                 （在图上圈出要改的区域）     （看着标注按指令改图）
  ```

  适合人群：**不擅长写英文提示词、不知道怎么精确描述"改哪里"的用户**。把"描述区域"的工作交给鼠标，把"怎么改"的工作交给一句简单的 prompt。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="三种标注方式" icon="pen-tool">
    **点（⦿）**：单击放置 · **矩形（▢）**：拖拽画框 · **多边形（⬡）**：多点连线自动闭合
  </Card>

  <Card title="实时渲染预览" icon="eye">
    标注实时渲染到画布，所见即所得，不用反复跑图看效果
  </Card>

  <Card title="缩放 / 平移 / 选择" icon="move">
    内置画布操作，处理大图也能精准定位局部
  </Card>

  <Card title="50 步撤销" icon="undo">
    最多 50 步撤销历史，尽情尝试不怕误操作
  </Card>

  <Card title="双输出" icon="square-split-horizontal">
    同时输出**标注后的图片**（供模型参考）+ **JSON 标注数据**（便于后续节点解析）
  </Card>

  <Card title="样式可定制" icon="palette">
    描边颜色、宽度、填充透明度、点大小均可配置
  </Card>
</CardGroup>

## 支持的 API易 模型

该节点本身**不调用 API**，只负责对图像做标注。标注后的图片可喂给任何支持图像输入的 API易 模型，最佳搭档：

| 模型名称                | 模型标识                         | 用途             | API 文档                                               |
| ------------------- | ---------------------------- | -------------- | ---------------------------------------------------- |
| Nano Banana Pro     | `gemini-3-pro-image-preview` | 根据标注区域局部改图/融合  | [查看文档](/api-capabilities/nano-banana-image/overview) |
| Gemini / Qwen-VL 系列 | 多种                           | 图像理解、基于标注的视觉问答 | [查看文档](/api-capabilities/gemini/native)              |

## 节点说明

### 输入

| 参数名     | 类型    | 必填 | 说明     |
| ------- | ----- | -- | ------ |
| `image` | IMAGE | 是  | 要标注的原图 |

### 输出

| 输出端                | 类型     | 说明                                 |
| ------------------ | ------ | ---------------------------------- |
| `annotated_image`  | IMAGE  | 已渲染标注标记的图片（可直接喂给下游 API 节点）         |
| `annotations_json` | STRING | 描述标注位置/类型的 JSON 字符串（供需要结构化输入的节点使用） |

## 安装配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/comfyui-image-annotator.git
    ```
  </Step>

  <Step title="第二步：重启 ComfyUI">
    无额外依赖（使用 ComfyUI 自带环境即可），重启后在节点搜索栏输入 `ImageAnnotator` 即可找到。
  </Step>

  <Step title="第三步：搭建三段式工作流">
    把节点依次连起来：

    ```
    LoadImage → ImageAnnotator → Luck Nano Banana Pro → SaveImage
    ```

    在 `ImageAnnotator` 的画布上圈出要改动的位置，然后在下游 API 节点写一句简单的 prompt（如 "replace the marked area with a red sports car"），运行即可。
  </Step>
</Steps>

## 使用示例

### 示例 1：局部换物（小白友好）

<Steps>
  <Step title="加载原图">
    `LoadImage` 载入一张客厅照片
  </Step>

  <Step title="标注目标区域">
    `ImageAnnotator`：用矩形框住沙发旁的空位
  </Step>

  <Step title="写一句简单 prompt">
    `Luck Nano Banana Pro`：prompt = "Put a green indoor plant in the marked area"
  </Step>

  <Step title="运行输出">
    模型会在你框出的位置放一盆绿植，不动其他区域
  </Step>
</Steps>

### 示例 2：多区域精准标注

用**多边形**标注人物衣服 + **点**标注帽子位置 + **矩形**标注背景区域，然后用 prompt：

```
Change the clothing in polygon 1 to a black suit, add a hat at point 1,
replace the background in rectangle 1 with a sunset beach
```

模型会分别对三个区域做不同的修改。

### 示例 3：视觉问答 / 理解

配合 Gemini / Qwen-VL：让模型解释"被框出来的物体是什么、在图里起什么作用"，标注提供精确的视觉锚点。

## 常见问题

<AccordionGroup>
  <Accordion title="为什么推荐给「不会写提示词」的用户？">
    传统改图需要你用文字精确描述"改哪里、怎么改"。对非英语用户、不熟 AI prompt 的小白非常不友好。

    有了这个节点，**位置信息由鼠标标注直接给出**，prompt 只需描述"改成什么"即可。原本需要 3-5 句话的精确描述，现在一句简单英文就能搞定。
  </Accordion>

  <Accordion title="标注后的图片会影响生成质量吗？">
    会，而且是**往好的方向影响**。大部分多模态模型（Nano Banana、Gemini、Qwen-VL）都能理解图上的标注符号，把它们识别为"用户指示的目标区域"，从而更精准地按指令编辑。

    若担心标注样式干扰最终输出，可在节点内调低描边宽度、使用半透明填充。
  </Accordion>

  <Accordion title="节点装完找不到？">
    1. 确认目录是 `ComfyUI/custom_nodes/comfyui-image-annotator`
    2. 完全重启 ComfyUI（刷新前端不够）
    3. 检查 ComfyUI 控制台有无报错
  </Accordion>

  <Accordion title="可以只输出 JSON 不渲染标注吗？">
    可以。把下游节点只接 `annotations_json` 端口即可。适合需要把坐标传给自定义脚本做后处理的场景。
  </Accordion>

  <Accordion title="和 Luck Nano Banana Pro 搭配的最佳实践？">
    推荐流水线：`LoadImage → ImageAnnotator → Luck Nano Banana Pro`

    * `Luck Nano Banana Pro` 的 `image_01` 接 `ImageAnnotator` 的 `annotated_image` 输出
    * prompt 中用自然语言描述"对标注区域做什么"
    * 首次效果不理想时，用 `Luck Nano Banana Pro` 的 `retry_times` 或 seed 模式多跑几次
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Luck Nano Banana Pro 节点" icon="workflow" href="/scenarios/ecosystem/lucknanobananapro-comfyui">
    同作者的 API 调用节点，与本节点完美搭配
  </Card>

  <Card title="Nano Banana Pro API" icon="book" href="/api-capabilities/nano-banana-image/overview">
    了解 Nano Banana Pro 的完整能力
  </Card>

  <Card title="ComfyUI 节点合集" icon="layers" href="/scenarios">
    查看所有 Nano Banana ComfyUI 节点
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理密钥、用量与分组
  </Card>
</CardGroup>
