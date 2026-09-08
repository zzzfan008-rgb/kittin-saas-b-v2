> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 生图 Skill

> 社区开源的 AI Agent Skill，支持在 Codex CLI、OpenCode、Gemini CLI、Cursor 等主流 AI 编程工具中通过自然语言生成和编辑图片，基于 API易 调用 Nano Banana Pro 模型。

## 概述

nano-banana-pro-image-gen 是一个社区贡献的开源 AI Agent Skill，让你在 **Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp** 等主流 AI 编程工具中，通过一句自然语言就能生成和编辑图片。底层调用 API易 的 Nano Banana Pro 模型，无需复杂配置，安装即用。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/wuchubuzai2018/expert-skills-hub`
  * 🌐 Skill 主页：`skills.sh/wuchubuzai2018/expert-skills-hub/nano-banana-pro-image-gen`
  * 👤 作者：wuchubuzai2018（无处不在的技术）
  * ⭐ 该项目由社区用户贡献
</Info>

## 为什么用这个 Skill

<CardGroup cols={2}>
  <Card title="一句话生图" icon="wand-sparkles">
    在 AI 编程助手中直接用自然语言描述，即刻生成高质量图片，无需离开编辑器
  </Card>

  <Card title="图片编辑" icon="square-pen">
    支持传入已有图片进行编辑，最多 14 张参考图，实现风格迁移和内容修改
  </Card>

  <Card title="多平台兼容" icon="puzzle">
    已适配 Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp 等工具
  </Card>

  <Card title="灵活输出" icon="sliders-horizontal">
    10 种宽高比 + 3 档分辨率（1K/2K/4K），覆盖从快速预览到高清海报的各种场景
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称            | 模型标识                         | 用途      | API文档                                       |
| --------------- | ---------------------------- | ------- | ------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 文生图、图生图 | [查看文档](/api-capabilities/nano-banana-image) |

<Tip>
  该 Skill 使用 Nano Banana Pro 模型。如果你还需要 Nano Banana 2 的更快速度和更低成本，可以查看 [Nano Banana ComfyUI 节点](/scenarios/ecosystem/nano-banana-comfyui)，它同时支持两个模型。
</Tip>

## 快速上手：3 步开始生图

<Steps>
  <Step title="第一步：获取 API易 密钥">
    1. 访问 [API易控制台](https://api.apiyi.com) 注册/登录
    2. 进入【令牌】栏目，生成新的 API 密钥
    3. 复制密钥（以 `sk-` 开头）

    <Info>
      新用户注册即可获得免费测试额度，足够体验 Nano Banana 图像生成功能。
    </Info>
  </Step>

  <Step title="第二步：安装 Skill">
    在终端中运行以下命令安装：

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill nano-banana-pro-image-gen
    ```

    <Warning>
      需要 Node.js 环境。如未安装 Node.js，请先访问 `nodejs.org` 下载安装。Python 可作为备选运行环境。
    </Warning>
  </Step>

  <Step title="第三步：配置 API 密钥">
    设置环境变量：

    ```bash theme={null}
    export APIYI_API_KEY="sk-你的API易密钥"
    ```

    Windows PowerShell 用户：

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-你的API易密钥"
    ```

    <Tip>
      建议将环境变量写入 `~/.zshrc` 或 `~/.bashrc`，避免每次重新设置。
    </Tip>
  </Step>
</Steps>

配置完成！现在你可以在支持 Skills 的 AI 编程工具中直接使用图片生成功能。

## 实战教程

### 用法一：命令行文字生图

最直接的用法——在终端中输入描述，生成图片。

<CodeGroup>
  ```bash Node.js（推荐） theme={null}
  node scripts/generate_image.js \
    -p "一只宇航员猫咪漂浮在太空中，背景是地球，数字艺术风格" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```

  ```bash Python theme={null}
  python scripts/generate_image.py \
    -p "一只宇航员猫咪漂浮在太空中，背景是地球，数字艺术风格" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```
</CodeGroup>

### 用法二：编辑已有图片

传入一张或多张参考图片，用自然语言描述修改效果。

```bash theme={null}
node scripts/generate_image.js \
  -p "把这张照片转换为吉卜力动画风格，保持人物构图不变" \
  -i "photo.jpg" \
  -f "ghibli-style.png" \
  -r 2K
```

支持多张参考图（最多 14 张），图片会自动转为 Base64 编码传送：

```bash theme={null}
node scripts/generate_image.js \
  -p "将这些元素融合成一张海报" \
  -i "bg.jpg" -i "logo.png" -i "text.png" \
  -f "poster.png" \
  -a 3:4 \
  -r 4K
```

### 用法三：在 AI 编程助手中使用

安装 Skill 后，在支持的 AI 编程工具中可以直接用自然语言指令：

* **Codex CLI / OpenCode**："帮我生成一张 16:9 的赛博朋克城市壁纸，4K 分辨率"
* **Cursor**："生成一张产品 logo，简约风格，1:1 比例"
* **Gemini CLI**："编辑 input.jpg，将背景改为夕阳海滩"

AI 助手会自动调用 Skill 完成图片生成。

## 命令参数详解

| 参数               | 缩写   | 必填 | 说明                      | 示例             |
| ---------------- | ---- | -- | ----------------------- | -------------- |
| `--prompt`       | `-p` | 是  | 图片描述或编辑指令               | `"一只猫咪"`       |
| `--filename`     | `-f` | 否  | 输出文件路径（省略则自动生成）         | `"output.png"` |
| `--aspect-ratio` | `-a` | 否  | 宽高比                     | `16:9`         |
| `--resolution`   | `-r` | 否  | 分辨率（必须大写）               | `1K`、`2K`、`4K` |
| `--input-image`  | `-i` | 否  | 输入图片路径（可多次指定，最多14张）     | `"photo.jpg"`  |
| `--key`          | `-k` | 否  | 内联 API Key（不推荐，建议用环境变量） | `"sk-xxx"`     |

### 支持的宽高比

`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`5:4`、`4:5`、`21:9`

### 分辨率与耗时参考

| 分辨率    | 大致耗时   | 适合场景      |
| ------ | ------ | --------- |
| 1K     | 约 30 秒 | 快速预览、测试效果 |
| 2K（默认） | 1-4 分钟 | 日常使用、社交媒体 |
| 4K     | 较慢     | 高清海报、印刷品  |

## 常见问题

<AccordionGroup>
  <Accordion title="安装时报错怎么办？">
    请检查：

    1. 是否已安装 Node.js（运行 `node -v` 确认）
    2. 网络连接是否正常
    3. 如果 npx 命令不可用，可以手动克隆仓库：

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    然后将 `skills/nano-banana-pro-image-gen` 目录复制到你的 Skills 目录中。
  </Accordion>

  <Accordion title="生成图片时报错 API Key 无效？">
    请确认：

    1. 环境变量 `APIYI_API_KEY` 已正确设置（以 `sk-` 开头）
    2. API易 账户余额充足
    3. 也可以使用 `-k` 参数直接传入密钥测试
  </Accordion>

  <Accordion title="分辨率参数不生效？">
    分辨率参数必须使用**大写**：`1K`、`2K`、`4K`。小写 `1k`、`2k` 会导致参数无法识别。
  </Accordion>

  <Accordion title="图片生成很慢怎么办？">
    * 4K 分辨率本身需要较长处理时间（可能超过 5 分钟）
    * 建议先用 1K 分辨率调试提示词和构图
    * 确认满意后再用 2K 或 4K 生成最终版本
  </Accordion>

  <Accordion title="如何获取 API易 密钥？">
    访问 [API易控制台](https://api.apiyi.com/token)，注册账号后在【令牌】栏目生成新的密钥。新用户有免费测试额度。
  </Accordion>

  <Accordion title="支持哪些 AI 编程工具？">
    目前已适配：Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp。任何支持 Skills 协议的工具都可以使用。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro 文档" icon="banana" href="/api-capabilities/nano-banana-image">
    查看 Nano Banana Pro 完整 API 文档和定价
  </Card>

  <Card title="APIYI GPT-Image 2 Skills（同作者）" icon="puzzle" href="/scenarios/ecosystem/apiyi-gpt-image-skills">
    wuchubuzai2018 同一 Skills 合集下的 `gpt-image-2` / `gpt-image-2-all` 双 Skill
  </Card>

  <Card title="Nano Banana ComfyUI 节点" icon="workflow" href="/scenarios/ecosystem/nano-banana-comfyui">
    在 ComfyUI 中使用 Nano Banana 生图
  </Card>

  <Card title="生图失败排查" icon="circle-question-mark" href="/faq/nano-banana-image-failure">
    Nano Banana 生图常见问题排查指南
  </Card>

  <Card title="API易-令牌管理" icon="settings" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量和余额
  </Card>
</CardGroup>
