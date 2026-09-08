> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI GPT-Image 2 生图 Skills

> 社区开源的双 Skill 合集：在 Codex CLI、Cursor、Gemini CLI 等 AI 编程工具中一句话调用 gpt-image-2（官转）与 gpt-image-2-all（官逆）生图与改图。

## 概述

`apiyi-gpt-image-2-gen` 与 `apiyi-gpt-image-2-all-gen` 是社区用户 wuchubuzai2018 贡献的两个开源 AI Agent Skill，让你在 **Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp** 等支持 Skills 的 AI 编程工具中，通过一句自然语言调用 API易 的两款 OpenAI GPT 图像模型 —— **官转 `gpt-image-2`**（精细可控、按 token 计费、支持 4K）与 **官逆 `gpt-image-2-all`**（对话式、按次计费、ChatGPT 一致体验）。

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/wuchubuzai2018/expert-skills-hub`
  * 📦 Skill 标识：`apiyi-gpt-image-2-gen`（官转）、`apiyi-gpt-image-2-all-gen`（官逆）
  * 👤 作者：wuchubuzai2018（无处不在的技术）
  * ⭐ 该项目由社区用户贡献，与同作者的 [Nano Banana Pro 生图 Skill](/scenarios/ecosystem/nano-banana-skill) 属于同一 Skills 合集仓库
</Info>

<Tip>
  **两个 Skill 如何选？**

  * **`apiyi-gpt-image-2-gen`（官转，推荐）**：可控 `size / quality / output-format / compression`，支持 4K（3840×2160）、自定义尺寸、mask 语义编辑，按 token 计费——适合有明确画质/尺寸要求的场景
  * **`apiyi-gpt-image-2-all-gen`（官逆）**：仅需 `prompt` + 可选 `response-format`，通过 Prompt 描述尺寸/比例，按次计费（\$0.03 / 次），与 ChatGPT 网页版体验一致——适合自然语言直出、文字还原、多轮改图
  * 完整差异见 [官转 vs 官逆对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="一句话生图" icon="wand-sparkles">
    在 AI 编程助手中直接用中文/英文自然语言描述，即刻生成或编辑图片
  </Card>

  <Card title="双模型覆盖" icon="layers">
    官转 `gpt-image-2` 与官逆 `gpt-image-2-all` 同时可用，按场景切换
  </Card>

  <Card title="4K + 自定义尺寸（官转）" icon="image">
    官转 Skill 支持 1024² / 1536×1024 / 2048² / **3840×2160** 等预设及自定义尺寸
  </Card>

  <Card title="画质/格式可选（官转）" icon="sliders-horizontal">
    `quality`（low / medium / high / auto）+ 输出格式（png / jpeg / webp）+ 压缩率 0-100
  </Card>

  <Card title="最多 5 张参考图" icon="images">
    两个 Skill 均支持最多 5 张参考图叠加输入，实现多图融合与风格迁移
  </Card>

  <Card title="多平台兼容" icon="puzzle">
    Codex CLI / OpenCode / Gemini CLI / GitHub Copilot / Cursor / Amp 均可用
  </Card>

  <Card title="Node.js 与 Python 双运行时" icon="terminal">
    脚本同时提供 `generate_image.js` 与 `generate_image.py`
  </Card>

  <Card title="零侵入式配置" icon="key">
    环境变量 `APIYI_API_KEY` 一次设置，全局可用；也支持 `-k` 命令行临时覆盖
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称                | 模型标识              | 对应 Skill                    | 计费         | API 文档                                             |
| ------------------- | ----------------- | --------------------------- | ---------- | -------------------------------------------------- |
| GPT-Image 2（官转，推荐）  | `gpt-image-2`     | `apiyi-gpt-image-2-gen`     | 按 token 实计 | [查看文档](/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（官逆） | `gpt-image-2-all` | `apiyi-gpt-image-2-all-gen` | \$0.03 / 次 | [查看文档](/api-capabilities/gpt-image-2-all/overview) |

## 快速上手：3 步开始生图

<Steps>
  <Step title="第一步：获取 API易 密钥">
    1. 访问 [API易控制台](https://api.apiyi.com) 注册/登录
    2. 进入【令牌】栏目，生成新的 API 密钥（以 `sk-` 开头）
    3. 建议单独建一个带用量上限的专用密钥

    <Info>
      新用户注册即可获得免费测试额度，足够体验两款 GPT 图像模型。
    </Info>
  </Step>

  <Step title="第二步：安装 Skill（按需二选一或全装）">
    **官转 `gpt-image-2`（推荐）**：

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-gen
    ```

    **官逆 `gpt-image-2-all`**：

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-all-gen
    ```

    <Warning>
      需要 Node.js 环境；Python 脚本可作为备选运行时。未装 Node.js 可访问 `nodejs.org` 下载。
    </Warning>
  </Step>

  <Step title="第三步：配置 API 密钥">
    设置环境变量（推荐写入 `~/.zshrc` / `~/.bashrc`）：

    ```bash theme={null}
    export APIYI_API_KEY="sk-你的API易密钥"
    ```

    Windows PowerShell：

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-你的API易密钥"
    ```
  </Step>
</Steps>

配置完成！在支持 Skills 的 AI 编程工具中即可通过自然语言触发两个 Skill。

## 命令参数详解

### `apiyi-gpt-image-2-gen`（官转）

| 参数                     | 缩写   | 必填 | 说明                                                                                                      | 示例               |
| ---------------------- | ---- | -- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| `--prompt`             | `-p` | 是  | 文生图描述或编辑指令                                                                                              | `"橘猫在草地上玩耍"`     |
| `--filename`           | `-f` | 否  | 输出路径（省略自动生成带时间戳的名字）                                                                                     | `"cat.png"`      |
| `--size`               | `-s` | 否  | 预设（`1024x1024` / `1536x1024` / `1024x1536` / `2048x2048` / `2048x1152` / `3840x2160` / `2160x3840`）或自定义 | `"2048x1152"`    |
| `--quality`            | `-q` | 否  | `low` / `medium` / `high` / `auto`                                                                      | `"high"`         |
| `--output-format`      | `-o` | 否  | `png`（默认）/ `jpeg` / `webp`                                                                              | `"webp"`         |
| `--output-compression` | `-c` | 否  | 0-100，仅对 jpeg / webp 生效                                                                                 | `80`             |
| `--input-image`        | `-i` | 否  | 参考图路径（最多 5 张）                                                                                           | `"portrait.png"` |
| `--api-key`            | `-k` | 否  | 临时覆盖环境变量密钥                                                                                              | `"sk-xxx"`       |

**支持的宽高比**：`1:1`、`3:2`、`2:3`、`16:9`、`9:16`，以及 ≤ 3:1 的自定义比例。

**自定义尺寸约束**：单边 ≤ 3840px，长宽均为 16 的倍数，总像素 65.5 万 – 829.4 万。

**典型耗时**：120–150 秒 / 请求（4K 复杂场景会更久）。

### `apiyi-gpt-image-2-all-gen`（官逆）

| 参数                  | 缩写   | 必填 | 说明                                    | 示例                 |
| ------------------- | ---- | -- | ------------------------------------- | ------------------ |
| `--prompt`          | `-p` | 是  | 对话式生图或编辑指令（尺寸/比例通过 prompt 描述）         | `"横版 16:9 赛博朋克城市"` |
| `--filename`        | `-f` | 否  | 输出路径（省略自动生成带时间戳的 PNG）                 | `"city.png"`       |
| `--response-format` | `-r` | 否  | `url`（默认，R2 CDN 约 24h 有效）或 `b64_json` | `"b64_json"`       |
| `--input-image`     | `-i` | 否  | 参考图路径（最多 5 张）                         | `"ref.png"`        |
| `--api-key`         | `-k` | 否  | 临时覆盖环境变量密钥                            | `"sk-xxx"`         |

<Info>
  官逆 Skill **不支持** `size` / `quality` / `aspect_ratio` 命令行参数 —— 这些都通过 prompt 文字描述（如 `"竖版 9:16 手机海报"`、`"1024x1024 方图"`）。耗时 60–300 秒。
</Info>

## 使用示例

### 示例 1：官转文生图 + 精细控制

```bash theme={null}
node scripts/generate_image.js \
  -p "Cinematic product shot of a minimalist ceramic teacup, soft morning light, 35mm lens" \
  -f "teacup.png" \
  -s "3840x2160" \
  -q "high" \
  -o "png"
```

### 示例 2：官转图生图（参考图编辑）

```bash theme={null}
node scripts/generate_image.js \
  -p "把背景换成夕阳海滩，人物保持不变" \
  -i "portrait.png" \
  -f "portrait-beach.jpg" \
  -s "2048x1152" \
  -q "high" \
  -o "jpeg" \
  -c 85
```

### 示例 3：官转多图融合

```bash theme={null}
node scripts/generate_image.js \
  -p "把图 1 的人物放进图 2 的场景，光线参考图 3" \
  -i person.png scene.png light.png \
  -f merged.png \
  -q high
```

### 示例 4：官逆对话式生图（尺寸通过 prompt）

```bash theme={null}
node scripts/generate_image.js \
  -p "横版 16:9 电影画幅：一位穿汉服的少女站在樱花树下，水彩画风格，柔和光线" \
  -f "sakura.png" \
  -r url
```

### 示例 5：在 AI 编程工具中调用

安装后，直接对 AI 助手说（以 Cursor / Codex CLI 为例）：

* "用 apiyi-gpt-image-2-gen 生成一张 3840x2160、high 质量的赛博朋克城市壁纸"
* "调用 apiyi-gpt-image-2-all-gen，把 photo.jpg 改成吉卜力动画风格"
* "用官转 Skill 生成一张 logo，1:1，high 质量，webp 格式"

AI 助手会自动识别 Skill 并拼好命令行参数。

## 常见问题

<AccordionGroup>
  <Accordion title="两个 Skill 如何选？">
    * 需要**精确尺寸**（如 3840×2160）、**可控画质**（low/medium/high）、**特定输出格式**（webp / 压缩）→ 选 **官转 `apiyi-gpt-image-2-gen`**
    * 需要**与 ChatGPT 一致的对话式体验**、**按次固定计费**（\$0.03 / 次）、**强文字还原**、**自然语言描述尺寸**即可 → 选 **官逆 `apiyi-gpt-image-2-all-gen`**
    * 完整差异参考 [官转 vs 官逆对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="安装 npx skills 报错？">
    1. 确认已安装 Node.js（`node -v`）
    2. 网络通畅，能访问 GitHub
    3. 若 `npx skills` 不可用，可手动克隆仓库：

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    然后将 `skills/apiyi-gpt-image-2-gen` 或 `skills/apiyi-gpt-image-2-all-gen` 目录复制到你的 Skills 目录。
  </Accordion>

  <Accordion title="报错 API Key 无效？">
    1. 环境变量 `APIYI_API_KEY` 是否正确（以 `sk-` 开头）
    2. 余额是否充足，可参考 [为什么还有余额跑不通](/faq/balance-insufficient)
    3. 临时测试可用 `-k "sk-xxx"` 直接传入
  </Accordion>

  <Accordion title="官转 Skill 的自定义尺寸报错？">
    自定义 `size` 需满足：

    * 单边不超过 3840px
    * 长宽均为 16 的整数倍
    * 总像素在 65.5 万 – 829.4 万之间
      例如 `2048x3072` 合法，`3000x2000` 因 3000 非 16 倍数会被拒。
  </Accordion>

  <Accordion title="官逆 Skill 的 URL 返回多久失效？">
    官逆默认返回的 R2 CDN URL 约 **24 小时** 有效。生产场景建议传 `-r b64_json` 取 Base64 自行落盘，或立即下载到本地。
  </Accordion>

  <Accordion title="支持哪些 AI 编程工具？">
    目前已适配：Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp。任何支持 Skills 协议的工具都可以调用。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="gpt-image-2（官转）文档" icon="book" href="/api-capabilities/gpt-image-2/overview">
    原生 2K/4K 生图，按 token 计费
  </Card>

  <Card title="gpt-image-2-all（官逆）文档" icon="book" href="/api-capabilities/gpt-image-2-all/overview">
    ChatGPT 一致体验，\$0.03 / 次按次计费
  </Card>

  <Card title="官转 vs 官逆 对比" icon="scale" href="/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17 个维度一表看清差异
  </Card>

  <Card title="Nano Banana Pro 生图 Skill（同作者）" icon="puzzle" href="/scenarios/ecosystem/nano-banana-skill">
    同一 Skills 合集下的 Gemini 生图 Skill
  </Card>

  <Card title="Luck GPT-Image 2 ComfyUI 节点" icon="workflow" href="/scenarios/ecosystem/luckgpt2-comfyui">
    同模型的 ComfyUI 节点方案
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理密钥、用量与分组
  </Card>
</CardGroup>
