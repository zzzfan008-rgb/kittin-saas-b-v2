> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 出图提示词诊断技能

> 把出图前的提示词审阅封装成开箱即用的 Agent Skill，丢进 Codex、OpenClaw、hermes-agent、Claude Code 等任意编码 Agent：按六要素体检、揪出拉低质量的空泛词、输出可直接使用的优化提示词，也能拿实际出图反向复诊。默认用 gpt-5.6-luna。

<Note>
  本页提供一个**开箱即用的 Agent 技能（Skill）**：出图**之前**先把提示词过一遍体检，补齐缺失要素、删掉会拉低质量的空泛词，再拿优化后的版本去出图。整套东西就两个文件，**零第三方依赖**。
</Note>

出图不满意，八成问题出在提示词，而不是模型或通道。这个技能把 [出图进阶篇](/api-capabilities/image-advanced-workflow) 里讲的「改写层」做成了可以丢进任意编码 Agent 的技能。

## 这个技能能做什么

<CardGroup cols={2}>
  <Card title="出图前诊断" icon="clipboard-check">
    按主体 / 环境 / 光线 / 镜头 / 色调 / 构图六要素逐项判定，给 0-100 分，列出风险项，输出一条可直接复制使用的优化提示词。
  </Card>

  <Card title="出图后复诊" icon="image-off">
    把实际出图连同原提示词一起传进去，模型看图对照，指出**提示词里哪一句没有被执行**、模型自作主张加了什么，再针对性重写。
  </Card>

  <Card title="按目标模型给建议" icon="git-compare">
    指定 `-t` 之后会追加该系列特有的提醒：参考图上限、蒙版支持情况、分辨率参数叫什么名字。
  </Card>

  <Card title="按题材切换检查重点" icon="layers">
    人像查肤质与光位，产品图查背景与文字禁令，插画则自动降低写实系检查的权重。
  </Card>
</CardGroup>

## 实测：一条口语提示词的完整诊断

输入是用户会随手写的原话，外加它实际出的图：

```bash theme={null}
python3 scripts/prompt_doctor.py "帮我出一张咖啡的产品图，好看一点，要高级感" \
  -i result.jpg -t nano-banana -s product
```

<Frame caption="实际出图：这是用上面那条口语提示词出的图">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="口语提示词生成的咖啡图：木桌、磨豆机、麻布袋等大量道具，杯身被模型编造了品牌名" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

诊断输出（节选真实运行结果）：

```text theme={null}
【诊断】18/100 —— 主体可辨，但缺少产品摄影约束，画面被模型扩展成生活方式场景

六要素：主体⚠️  环境❌  光线❌  镜头❌  色调⚠️  构图❌

风险项：
  · 提示词中的"咖啡的产品图"没有具体说明产品形态、材质、颜色和数量，模型自行生成了带拉花的咖啡杯。
  · 提示词没有指定中性、可控的背景，模型自行加入了窗户、木桌、咖啡磨豆机、咖啡豆、布袋和书本，
    导致画面更像生活方式摄影而非电商产品图。
  · 提示词没有写主光方向、光线软硬或补光，成片采用了左侧窗光和较重的暖色阴影，光线不可控。
  · "好看一点"和"高级感"属于抽象质量描述，没有转化为具体的色温、饱和度和摄影介质。
  · 提示词没有声明禁止文字，模型自行生成了咖啡杯上的"AURA COFFEE ROASTERS"、磨豆机标牌
    以及右下角书本上的"AURA"字样，商用时存在错误品牌和乱码风险。

【优化后的提示词】

制作一张电商产品摄影风格的咖啡产品图：画面主体是一只单独的哑光暖白色陶瓷咖啡杯……
（完整正文略）

【参数建议】size=2K  aspect=1:1；电商方图适合1:1；若需要横版广告，可改用4:3并保留右侧文案留白。
```

拿这条优化后的提示词原样重出一次，同一个模型（`gemini-3-pro-image`）：

<Frame caption="按诊断给出的优化提示词重出：干净可用的电商主图">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-prompt-doctor-e2e.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=5ea65d564076d1ce6ed768ff0c7a0e60" alt="优化提示词重出的咖啡图：中性浅灰背景上一只暖白陶瓷拿铁杯，光线方向明确，投影落向右后方，画面无任何文字，四周留白充足" width="1280" height="1280" data-path="images/image-prompt-doctor-e2e.jpg" />
</Frame>

道具全部清掉、背景变成可控的中性灰、投影方向明确、没有任何编造的品牌名，留白也够放文案了。**模型没变，变的只是提示词。**

## 什么时候该跑诊断

不是每次出图都要审一遍。按需求本身的具体程度决定：

| 你的需求长什么样                 | 该怎么做                       |
| ------------------------ | -------------------------- |
| 口语化、只有主体（「来张咖啡的产品图，好看点」） | **先诊断再出图**，收益最大            |
| 出了图但和预期差很远               | **复诊模式**（`-i` 传实际出图），看图找原因 |
| 已经写清了光位、焦段、构图            | 不必多此一举，直接出图                |
| 要批量出同一系列的图               | 先诊断定稿一条，之后复用，不必每张都审        |

<Info>
  这个技能只改提示词，**不负责出图**。出图交给 [Nano Banana Pro 技能](/api-capabilities/nano-banana-image/skills) 或 [GPT-Image-2 系列技能](/api-capabilities/gpt-image-2/skills)，两者串起来就是完整的「先审后出」流程。
</Info>

## 能用在哪些 Agent

<Info>
  一个 Skill 本质上就是**一个文件夹**：一份写给 Agent 看的说明（`SKILL.md`）+ 一个干活的脚本。所以**凡是能读取本地文件、执行命令行的编码 Agent 都能用上**——比如 **Codex、OpenClaw、hermes-agent、Claude Code** 等。

  唯一要求：跑 Agent 的那台机器装了 **Python 3** 并且**能联网**（脚本要直连 `api.apiyi.com`）。本技能**只用 Python 标准库，不需要 pip 装任何包**。
</Info>

## 三步装好

### ① 建目录、贴文件

新建一个技能文件夹，放入下面两个文件（完整内容见后两节）：

```
image-prompt-doctor/
├── SKILL.md
├── scripts/
│   └── prompt_doctor.py
└── .env          # 第②步创建，放你的 Key
```

不需要 `pip install` 任何东西。

### ② 同目录写 Key

在 `image-prompt-doctor/.env` 里写上你的 **API易 API Key**（在 `api.apiyi.com` 控制台创建）：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

脚本会自动从这个 `.env` 读取 Key，**无需任何额外配置或环境变量**。

<Warning>
  `.env` 里是你的密钥。如果这个技能要随项目仓库共享，**务必把 `.env` 加进 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交给 Agent

* **支持技能自动发现的 Agent**（如 Claude Code）：把整个 `image-prompt-doctor/` 目录放进它的技能目录——个人级 `~/.claude/skills/`，或项目级 `.claude/skills/`（随仓库共享）。
* **其他 Agent**：按它各自的技能/插件约定放置；或者最简单——**直接让 Agent「读一下这个文件夹里的 SKILL.md，并照着执行」** 即可。

装好后就能用了，跳到 [怎么用](#怎么用) 看示例。

## SKILL.md

新建 `image-prompt-doctor/SKILL.md`，完整内容如下（`description` 写清「做什么 + 何时用」，Agent 会据此自动触发）：

````markdown theme={null}
---
name: image-prompt-doctor
description: Diagnose and optimize an image-generation prompt before generating, or review a disappointing result against the prompt that produced it. Use this whenever the user is about to generate an image from a casual or vague prompt, asks why an image came out wrong, or asks to improve/rewrite an image prompt.
allowed-tools: Bash(python3 *)
---

# 出图提示词诊断

在真正出图**之前**先审一遍提示词，补齐缺失要素、删掉会拉低质量的空泛词，再拿优化后的版本去出图。
也可以在出图**之后**把实际结果回传，让模型对照提示词指出哪一条没被执行。

API 调用是单次原子调用，提示词原样进模型，没有网页版那种自动改写兜底——所以提示词质量直接决定成功率。

## 什么时候用

- 用户给的出图需求是口语化的（「来张咖啡的产品图，好看点」），**先诊断再出图**；
- 用户抱怨出图不对、和预期差很远，**用复诊模式看图找原因**；
- 用户直接要求「帮我优化这个提示词」。

需求本身已经写得很具体（光位、焦段、构图都有）时不必多此一举，直接出图。

## 两种运行方式

### 方式一：调脚本（默认，用 gpt-5.6-luna）

```bash
# 出图前诊断
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "帮我出一张咖啡的产品图，好一点" -t nano-banana -s product

# 出图后复诊：把实际出图一起传进去
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "把红框里的杯子改成黑色，其他不变" -i result.png

# 给程序消费的 JSON
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "国风山水插画" -s illustration --json
```

参数：

- 第 1 个位置参数：待诊断的提示词（必填）。
- `-i / --image`：实际出图的路径，可重复，最多 4 张；**传了就进入复诊模式**。
- `-t / --target`：目标图片模型，`nano-banana` / `gpt-image` / `seedream` / `flux` / `grok`，会追加该系列特有的提醒（参考图上限、蒙版支持、参数名等）。不确定就不传。
- `-s / --scene`：题材，`portrait` / `product` / `scene` / `illustration`，默认 `auto`。插画类会自动降低写实系检查的权重。
- `--model`：诊断用的文本模型，默认 `gpt-5.6-luna`（便宜、支持图像输入）。也可用 `APIYI_TEXT_MODEL` 环境变量覆盖。
- `--json`：输出原始 JSON。

Key：脚本自动读技能目录下 `.env` 里的 `APIYI_API_KEY`，也支持同名环境变量。
报「未找到 Key」时提示用户在 `.env` 写一行 `APIYI_API_KEY=sk-xxx`。

### 方式二：你自己来（没有 Key，或不想额外花钱时）

诊断量表本身没有秘密，你可以直接按下面这套标准自己审，不调任何 API。
输出格式与脚本保持一致，用户看到的东西一样。

## 诊断量表

**六要素**，逐项判 ✅ 写清楚了 / ⚠️ 提到但含糊 / ❌ 完全没写：

| 要素 | 判定标准 |
|---|---|
| 主体 | 材质、颜色、数量、状态是否具体 |
| 环境 | 背景是什么、虚实关系 |
| 光线 | 光源方向、软硬、有无补光——**必须存在一个可指认的主光** |
| 镜头 | 焦段、光圈、机位高度、俯仰角 |
| 色调 | 白平衡倾向、饱和度、胶片或数码质感 |
| 构图 | 主体在画面什么位置、留白在哪 |

**必须报出的风险项**：

- **空泛质量词**（8K / 超高清 / 超精细 / 杰作 / 大师作品 / 完美）：不提高分辨率，反而把画面推向过锐过饱和的渲染感，是「AI 味」的主要来源。建议删除，换成具体的光、镜头、介质。
- **在提示词里写分辨率**：无效。分辨率只由 `size` / `imageSize` 之类的参数决定。
- **一句话塞多个编辑动作**：单次成功率显著下降，建议拆成多轮，一次只改一类东西。
- **用「这个」「红框里的东西」指代**：编辑类任务最常见的失败原因，要点名具体物体。
- **没有声明画面内文字**：模型会自行编造品牌名和文案，商用等于废片。要么写清出现什么字，要么明确禁止出现文字。
- **真人、名人、受版权保护的角色、未成年人、暴力或成人内容**：会被上游审核拦截，要提前改写。

**优化原则**：补齐缺失要素，不要堆形容词把提示词写长；用户已明确指定的要素原样保留；
要写实质感就加具体光位、焦段光圈、介质和主动添加的瑕疵（毛孔、碎发、磨损、水渍），
不要用「真实感」「高级感」这类抽象词；不要输出独立的负面提示词字段，把「不要什么」直接写进正文。

## 输出与后续动作

把诊断结果如实转述给用户——分数、缺了哪些要素、风险项、优化后的提示词、改了什么、参数建议。

然后**征求用户确认再出图**：优化版可能改变了原意（比如把「咖啡」定成了「拿铁」），
让用户看一眼再决定。用户认可后，用优化后的提示词调出图技能（如 `nano-banana-pro`），
并按「参数建议」里的 `size` / `aspect` 传参。

用户明确说「不用问了直接出」时，就用优化版直接出图，把诊断摘要和图一起给他。

## 边界

- 这个技能只改提示词，**不出图**，也不做审核预判之外的合规判断。
- 优化后的提示词仍然可能一次不中——生成模型单次采样本身有波动，失败就重试或换模型。
- 分辨率、宽高比、参考图这些只能靠参数解决的东西，诊断只会提醒，不会写进提示词正文。
````

## scripts/prompt\_doctor.py

新建 `image-prompt-doctor/scripts/prompt_doctor.py`，完整内容如下（纯 Python 标准库，无需安装依赖）：

````python theme={null}
#!/usr/bin/env python3
"""出图提示词诊断：审阅提示词、指出缺失要素、给出优化版本。

通过 API易 调用文本模型（默认 gpt-5.6-luna）。纯标准库，零依赖。
支持两种模式：
  1) 出图前诊断 —— 只给提示词
  2) 出图后复诊 —— 同时给提示词和实际出图（模型看图反推哪条要素没落实）
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_MODEL = "gpt-5.6-luna"
BASE_URL = "https://api.apiyi.com/v1/chat/completions"
MAX_IMAGES = 4

# 各目标模型的额外提醒，只在 --target 指定时追加
TARGET_NOTES = {
    "nano-banana": "目标模型是 Nano Banana（Gemini 系）：自然语言长句友好，可以写成连贯段落而非关键词堆砌；"
                   "参考图最多 14 张；分辨率走 imageSize 参数（1K/2K/4K），宽高比走 aspectRatio。",
    "gpt-image": "目标模型是 GPT-Image 系：指令遵循强、画面内文字渲染准确，可以放心指定要出现的文字内容；"
                 "参考图最多 16 张；只有官转 gpt-image-2 支持蒙版局部重绘和 background=transparent 透明背景；"
                 "分辨率走 size 参数。",
    "seedream": "目标模型是 Seedream：中文语境理解好；参考图最多 10 张（输入+输出不超过 15）；"
                "5.0 与 5.0-pro 可以在提示词里要求输出透明背景的 PNG。",
    "flux": "目标模型是 FLUX：偏好结构清晰的描述；FLUX.2 pro/max/flex 参考图最多 8 张，Kontext 只有 1 张。",
    "grok": "目标模型是 Grok Imagine：参考图只有走 /v1/images/edits 才生效，"
            "传给 /v1/images/generations 会被静默丢弃且照常计费；参考图最多 4 张。",
}

SCENE_NOTES = {
    "portrait": "这是人像。重点检查：是否指定了唯一主光的方向与软硬、焦段与光圈、是否要求了自然肤质"
                "（毛孔、绒毛、油光）、是否禁用了磨皮美颜、主体是否被挪出画面正中。",
    "product": "这是产品图/电商图。重点检查：背景是否被指定为中性可控、光位与补光是否写清、"
               "投影方向、是否明确禁止出现品牌名和文字（否则模型会自行编造）、是否留出放文案的空白。",
    "scene": "这是环境场景。重点检查：具体时间与天气、唯一主光来源、机位高度与焦段、"
             "是否加入了磨损与杂物等真实痕迹、画面里的人是否被要求不正对镜头。",
    "illustration": "这是插画/非写实。去 AI 味的那套写实手法要降权，改为检查：画风是否被具体指认"
                    "（媒材、笔触、年代、参考流派）、配色方案、线条与上色方式、构图与留白。",
}

SYSTEM = """你是出图提示词诊断专家，服务于通过 API 直接调用图片模型的开发者和设计师。
API 调用是单次原子调用，提示词原样进模型，没有任何网页版那样的自动改写兜底，所以提示词质量直接决定成功率。

## 诊断量表

先按「六要素」逐项判定 ok（写清楚了）/ weak（提到但含糊）/ missing（完全没写）：

1 subject 主体：材质、颜色、数量、状态是否具体
2 environment 环境：背景是什么、虚实关系
3 light 光线：光源方向、软硬、有无补光——必须存在一个可指认的主光
4 lens 镜头与视角：焦段、光圈、机位高度、俯仰角
5 tone 色调与介质：白平衡倾向、饱和度、胶片或数码质感
6 composition 构图：主体在画面什么位置、留白在哪

## 必须报出的风险项

- 出现 8K / 超高清 / 超精细 / 杰作 / 大师作品 / 完美 这类空泛质量词：它们不提高分辨率，
  反而把画面推向过锐过饱和的渲染感，是「AI 味」的主要来源，必须建议删除并换成具体的光、镜头、介质描述。
- 在提示词里写分辨率（4K/8K/高清）：无效。分辨率只由 size / imageSize 之类的参数决定。
- 一句话里塞了多个互不相关的编辑动作：单次成功率会显著下降，建议拆成多轮。
- 用「这个」「红框里的东西」等指代而不点名具体物体：编辑类任务最常见的失败原因。
- 没有声明画面内文字：模型可能自行编造品牌名或文案，商用场景等于废片。要么写清要出现什么字，要么明确禁止出现文字。
- 涉及真人、名人、受版权保护的角色、未成年人、暴力或成人内容：会被上游审核拦截，需要提示改写。

## 优化原则

- 补齐缺失要素，不要靠堆砌形容词把提示词写长。
- 用户已经明确指定过的要素原样保留，不要擅自改写。
- 要写实质感就加具体的光位、焦段光圈、胶片或数码介质、以及主动添加的瑕疵（毛孔、碎发、磨损、水渍），
  不要用「真实感」「高级感」这类抽象词。
- 不要输出负面提示词语法（多数图片模型不支持独立的 negative prompt 字段），把「不要什么」直接写进正文。
- optimized_prompt 与 changes 必须与用户原提示词使用同一种语言，中文提示词就全中文，不要中英混写。

## 输出

严格输出以下 JSON，不要加代码围栏，不要额外解释：

{
  "score": 0-100 的整数，表示这条提示词单次出图的可用程度,
  "verdict": "一句话总评，不超过 40 字",
  "elements": {"subject":"ok|weak|missing","environment":"...","light":"...","lens":"...","tone":"...","composition":"..."},
  "risks": ["每条一句话，说明问题和后果；没有风险则给空数组"],
  "optimized_prompt": "优化后的完整提示词正文，可直接复制使用",
  "changes": ["逐条说明改了什么、为什么"],
  "suggested_params": {"size":"1K|2K|4K","aspect":"如 1:1 / 16:9","note":"参数上的建议，没有则空字符串"}
}"""

REVIEW_EXTRA = """

## 本次是出图后复诊

用户已经用下面这条提示词出了图，实际结果附在后面。请对照提示词逐条核对：
哪些要求落实了、哪些没落实、模型自作主张加了什么。
risks 里要明确写出「提示词的哪一句没有被执行」，optimized_prompt 要针对这些偏差重写，
而不是泛泛地补要素。"""


def load_api_key():
    """优先读环境变量；否则在脚本所在目录及其父目录找 .env。"""
    key = os.environ.get("APIYI_API_KEY")
    if key:
        return key
    here = os.path.dirname(os.path.abspath(__file__))
    for d in (here, os.path.dirname(here)):
        env_path = os.path.join(d, ".env")
        if os.path.exists(env_path):
            with open(env_path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("APIYI_API_KEY") and "=" in line:
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def image_data_url(path):
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def build_messages(prompt, images, target, scene):
    system = SYSTEM
    if images:
        system += REVIEW_EXTRA
    extras = [TARGET_NOTES[target]] if target else []
    if scene and scene != "auto":
        extras.append(SCENE_NOTES[scene])
    if extras:
        system += "\n\n## 本次的额外约束\n\n" + "\n".join("- " + e for e in extras)

    content = [{"type": "text", "text": "待诊断的提示词：\n\n" + prompt}]
    for path in images:
        content.append({"type": "image_url", "image_url": {"url": image_data_url(path)}})
    return [{"role": "system", "content": system},
            {"role": "user", "content": content}]


def diagnose(api_key, model, messages):
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        BASE_URL, data=payload, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"请求失败 HTTP {e.code}：{e.read().decode(errors='replace')[:500]}")

    text = resp["choices"][0]["message"]["content"].strip()
    if text.startswith("```"):                      # 防御：个别模型仍会套代码围栏
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise RuntimeError("模型未返回合法 JSON，原始输出：\n" + text[:800])


MARK = {"ok": "✅", "weak": "⚠️", "missing": "❌"}
LABEL = {"subject": "主体", "environment": "环境", "light": "光线",
         "lens": "镜头", "tone": "色调", "composition": "构图"}


def render(r):
    out = [f"【诊断】{r.get('score', '?')}/100 —— {r.get('verdict', '')}", ""]
    els = r.get("elements", {})
    out.append("六要素：" + "  ".join(
        f"{LABEL.get(k, k)}{MARK.get(v, '?')}" for k, v in els.items()))

    risks = r.get("risks") or []
    if risks:
        out += ["", "风险项："] + [f"  · {x}" for x in risks]
    else:
        out += ["", "风险项：无"]

    out += ["", "【优化后的提示词】", "", r.get("optimized_prompt", "")]

    changes = r.get("changes") or []
    if changes:
        out += ["", "【改了什么】"] + [f"  - {x}" for x in changes]

    p = r.get("suggested_params") or {}
    bits = []
    if p.get("size"):
        bits.append(f"size={p['size']}")
    if p.get("aspect"):
        bits.append(f"aspect={p['aspect']}")
    line = "  ".join(bits)
    if p.get("note"):
        line = (line + "；" if line else "") + p["note"]
    if line:
        out += ["", "【参数建议】" + line]
    return "\n".join(out)


def main():
    parser = argparse.ArgumentParser(description="出图提示词诊断与优化")
    parser.add_argument("prompt", help="待诊断的提示词")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help=f"实际出图的路径，可重复（最多 {MAX_IMAGES} 张）；传入即进入出图后复诊模式")
    parser.add_argument("-t", "--target", choices=sorted(TARGET_NOTES),
                        help="目标图片模型，用于追加该系列特有的提醒")
    parser.add_argument("-s", "--scene", choices=["auto"] + sorted(SCENE_NOTES), default="auto",
                        help="题材，默认 auto（不追加题材专项检查）")
    parser.add_argument("--model", default=os.environ.get("APIYI_TEXT_MODEL", DEFAULT_MODEL),
                        help=f"诊断用的文本模型，默认 {DEFAULT_MODEL}")
    parser.add_argument("--json", action="store_true", help="输出原始 JSON，便于程序消费")
    args = parser.parse_args()

    api_key = load_api_key()
    if not api_key:
        sys.exit("未找到 API Key：请在技能目录的 .env 写一行 APIYI_API_KEY=sk-xxx，或设置同名环境变量")

    if len(args.image) > MAX_IMAGES:
        sys.exit(f"最多 {MAX_IMAGES} 张出图，收到 {len(args.image)} 张")
    for path in args.image:
        if not os.path.exists(path):
            sys.exit(f"图片不存在：{path}")

    messages = build_messages(args.prompt, args.image, args.target, args.scene)
    try:
        result = diagnose(api_key, args.model, messages)
    except RuntimeError as e:
        sys.exit(str(e))

    print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else render(result))


if __name__ == "__main__":
    main()
````

## 怎么换诊断模型

默认用 `gpt-5.6-luna`——便宜（输入 \$0.2 / 输出 \$1.2 每百万 tokens）、支持图像输入，复诊模式要看图，正好够用。想换成别的模型有两种方式：

```bash theme={null}
# 单次覆盖
... prompt_doctor.py "提示词" --model gemini-3.5-flash

# 改默认值：在 image-prompt-doctor/.env 里加一行
APIYI_TEXT_MODEL=gemini-3.5-flash
```

<Warning>
  换模型时注意两点：**复诊模式必须选支持图像输入的模型**（纯文本模型传图会报错），可选清单见 [视觉理解](/api-capabilities/vision-understanding)；另外脚本用了 `response_format: {"type": "json_object"}`，不支持该参数的模型可能返回带代码围栏的文本（脚本已做剥离兜底，但仍以支持 JSON 模式的模型为准）。
</Warning>

## 为什么一句话就会自动诊断

很多人好奇：我又没敲命令，怎么说句「帮我画张图」它就先去审提示词了？

原理是这样：Agent 启动时会**先读取每个技能 `SKILL.md` 里的 `description`**（一段很短的元数据，说明「这个技能做什么、什么时候该用」）。当你说出的需求**匹配上**这段描述的场景（比如「画一张……」「这图为什么不对」「优化下提示词」），Agent 就**自动决定调用这个技能**，去读完整的 `SKILL.md` 并运行脚本——整个过程你不用记任何命令。

SKILL.md 里还写明了「需求已经很具体时不必多此一举」，所以它不会对每条提示词都动手。想要**百分百可控**时，用下面的**显性调用**。

## 怎么用

### 自然语言（隐式触发）

装好后直接对 Agent 说话即可：

| 你说                        | 技能行为                       |
| ------------------------- | -------------------------- |
| "帮我画张咖啡的产品图，好看一点"         | 需求口语化 → 先诊断，报结果，确认后再出图     |
| "这张图为什么不对？"（附上图）          | 走复诊模式 `-i`，看图指出哪句没被执行      |
| "优化一下这个提示词"               | 只诊断不出图                     |
| "用 gpt-image-2 出图，帮我先审下词" | 带 `-t gpt-image`，追加该系列特有提醒 |
| "不用诊断，直接出图"               | 跳过本技能，直接调出图技能              |

### 显性调用（更可控）

* **支持斜杠命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /image-prompt-doctor 一位女性在咖啡馆窗边微笑 -s portrait
  ```

* **任意 Agent / 直接命令它跑脚本**（最通用）：

  ```text theme={null}
  运行 python3 image-prompt-doctor/scripts/prompt_doctor.py "一位女性在咖啡馆窗边微笑" -s portrait
  ```

## 诊断结果在哪里

* 这个技能**不产出文件**，结果直接打印到终端，Agent 会把它转述给你——分数、六要素标记、风险项、优化后的提示词、改了什么、参数建议。

* 需要把结果接进自己的程序时加 `--json`，输出是一个结构化对象（`score` / `elements` / `risks` / `optimized_prompt` / `changes` / `suggested_params`），重定向落盘即可：

  ```bash theme={null}
  python3 image-prompt-doctor/scripts/prompt_doctor.py "提示词" --json > diagnosis.json
  ```

* **优化后的提示词需要你确认再用**：改写可能顺带改变原意（比如把「咖啡」定成了「拿铁」），SKILL.md 里已经要求 Agent 先问一句再出图。

* 复诊模式传的图**不会被修改或覆盖**，只作为只读输入。

## 成本

一次诊断的开销是几千 tokens 级别，按 `gpt-5.6-luna` 的标价折算不到一分钱，而一次 `high` 画质的出图是它的几十倍以上。**先诊断再出图，省下的重试费用远超诊断本身。**

复诊模式要传图，图片按输入 token 计费，成本略高但仍远低于一次出图。

## 相关文档

* [出图进阶：工作流编排与去 AI 味](/api-capabilities/image-advanced-workflow)（这个技能在整条流水线里的位置）
* [如何生成满意的图片](/api-capabilities/image-generation-success-tips)（单次调用失败怎么救）
* [Nano Banana Pro Agent 技能](/api-capabilities/nano-banana-image/skills)（配套出图技能，诊断完直接接上）
* [GPT-Image-2 系列 Agent 技能](/api-capabilities/gpt-image-2/skills)（同上，GPT 线）
* [GPT-5.6 Luna](/models/gpt-5-6-luna)（诊断默认使用的模型：规格、定价与端点支持）
