> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 出图进阶：工作流编排与去 AI 味

> 同一个模型，C 端出图产品比裸调 API 好在哪：提示词改写层、参考图锚定、并发采样加视觉模型择优、分步精修。附去 AI 味的可复制词表、实测对比图与成本账。

[如何生成满意的图片](/api-capabilities/image-generation-success-tips) 解决的是「这一次没出好，怎么救」。这一篇解决下一个问题：**怎么让每一次都稳定地出好**。

一个反复被问到的现象：`freepik.com`、`higgsfield.ai` 这类 C 端出图产品，用的是和你一样的底层模型——同一批 Nano Banana、GPT-Image、FLUX——但出来的图看着就是更「成品」。差距不在模型权重，**在模型外面那一层**。那一层是可以自己搭的，本文讲怎么搭。

## 一、C 端出图产品在模型外面套了什么

把这类产品拆开，模型之外大致是这八层。每一层都能在 API 上复刻：

| 产品侧做的事                                                 | 解决什么问题                 | 在 API 上怎么复刻                        |
| ------------------------------------------------------ | ---------------------- | ---------------------------------- |
| **提示词改写层**（Prompt Enhancer）                            | 用户写的是口语，模型要的是结构化描述     | 先调一次文本模型改写，再进图片模型（见第二节）            |
| **风格预设**（几十个可点选的 preset，可保存自己的）                        | 把审美固化，用户不必懂摄影术语        | 预设 = 你代码里的提示词片段常量 + 固定的参考图         |
| **身份锚定**（如 Higgsfield 的 `Soul ID`，用 20–80 张照片训练一个持久身份） | 同一个人跨次生成不漂移            | 用参考图逼近（见下方边界说明）                    |
| **多次采样 + 择优**                                          | 用户只看到最好那张，感知成功率接近 100% | 并发出 N 张 + 视觉模型打分自动挑（见第三节 Step 3/4） |
| **分步编辑**                                               | 一次下达复合指令必然掉链子          | 先定构图，再局部改，最后加文字                    |
| **放大与后处理**（Freepik 2024 年收购 Magnific，提供 2×–16× 的创造性放大） | 把小图补成可印刷尺寸             | API易 无此接口，改为直接出高分辨率档（见下方边界说明）      |
| **负面词与安全兜底**                                           | 避开模型的常见坏习惯、拦下会被审核打回的请求 | 提示词模板里内置固定的负面描述 + 审核失败的降级路径        |
| **素材库与转存**                                             | 用户的图不会过期丢失             | 拿到结果立刻转存自己的对象存储                    |

<Warning>
  **两条必须先说清的平台边界**，别按竞品的功能表照抄：

  1. **API易 没有超分 / 抠图 / 修脸接口**。要大图就在生成时直接选高分辨率档（`gpt-image-2` 的 4K、Nano Banana Pro 的 4K），不要指望事后放大；要透明底用官转 `gpt-image-2`，传 `background: "transparent"` 直接出带 alpha 通道的 PNG（`seedream-5-0` / `seedream-5-0-pro` 只能靠提示词要求，不保证每次都有 alpha），见 [怎么生成透明背景的图片](/faq/image-transparent-background)。
  2. **API易 不提供 LoRA / 身份训练**。`Soul ID` 那种「训练一次、永久锁脸」的能力，用参考图只能逼近：同一角色换场景、换光线时仍会漂移，越接近正脸、越接近原始光照条件，保持得越好。做需要严格一致的商业角色，要预留人工挑图的环节。
</Warning>

## 二、第一层就能拉开差距：把口语变成结构化提示词

这是投入产出比最高的一层，也是最容易被跳过的一层。

### 实测：同一个模型，同一个需求，两种提示词

需求是「给咖啡出一张电商产品图」。左边是用户会写的原话，右边是补齐要素之后的版本，都用 `gemini-3-pro-image`（Nano Banana Pro）、`2K`、`1:1`，各出一次：

<Frame caption="口语提示词：「帮我出一张咖啡的产品图，好看一点，要高级感」">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="口语提示词生成的咖啡图：木桌、磨豆机、麻布袋等大量道具，画面暖调，杯身被模型自行编造了一个品牌名" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

<Frame caption="结构化提示词：主体、环境、光位、镜头、色调、瑕疵、构图逐项写死">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=cb00b095545e5dcad8cb2c113fefe47f" alt="结构化提示词生成的咖啡图：浅灰台面上一只哑光黑陶瓷杯，背景干净虚化，光影方向明确，画面留白充足" width="1280" height="1280" data-path="images/image-workflow-prompt-after.jpg" />
</Frame>

左图不难看，但**不可用**：模型替你做了一堆你没授权的决定——加了磨豆机和麻布袋、把色调定成怀旧暖调，还在杯身上编了一个并不存在的品牌名（这种自动生成的文字在商用场景基本等于废片）。右图是能直接进商详页的图：中性背景、光位可复述、留白够放文案。

**「好看」和「可用」是两件事**。口语提示词只能约束前者。

### 六要素：改写层要补齐的东西

改写不是把提示词写长，是把缺失的决策补上。图片提示词的骨架就六项：

| 要素        | 缺了会怎样           | 写法示例                       |
| --------- | --------------- | -------------------------- |
| **主体**    | 模型自由发挥，加你不想要的道具 | 「一只哑光黑色陶瓷手冲杯，盛八分满黑咖啡」      |
| **环境**    | 背景随机，同系列图对不上    | 「浅灰色微水泥台面，同色系墙面并虚化」        |
| **光线**    | 全局均匀光，一眼假       | 「左上方 45 度柔光箱主光，右侧白色反光板补光」  |
| **镜头与视角** | 透视和景深不可控        | 「85mm 微距，f/5.6，正面略俯视 15 度」 |
| **色调与介质** | 默认高饱和「渲染感」      | 「冷调中性白平衡，整体偏低饱和」           |
| **构图**    | 主体永远居中          | 「杯子位于画面左三分之一，右侧大面积留白」      |

<Tip>
  分辨率**不是**第六要素。输出分辨率只由 `size` / `imageSize` 这类参数决定，在提示词里写「4K」「8K」不会提高实际像素——详见 [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution)。
</Tip>

### 把改写层写成代码

用一个便宜快的文本模型做这件事就够了，成本相对出图可以忽略：

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com/v1"
API_KEY = os.environ["APIYI_API_KEY"]          # 绝不要把 Key 写死在代码里

REWRITE_SYSTEM = """你是图片提示词工程师。把用户的口语需求改写成一段结构化的中文出图提示词。

必须补齐六要素，缺什么补什么，不要询问用户：
1 主体：具体到材质、颜色、数量、状态
2 环境：背景是什么、虚实关系
3 光线：光源方向、软硬、有没有补光，必须是可指认的单一主光
4 镜头与视角：焦段、光圈、机位高度、俯仰角
5 色调与介质：白平衡倾向、饱和度、胶片或数码质感
6 构图：主体在画面什么位置，留白在哪

规则：
- 只输出提示词正文，不要解释、不要分点、不要加标题
- 不要出现品牌名、商标、可识别的文字内容，除非用户明确要求
- 不要使用 8K、超高清、杰作、完美 这类空泛的质量词
- 用户明确指定过的要素原样保留，不要改写"""


def rewrite(user_prompt: str) -> str:
    r = requests.post(
        f"{BASE}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gemini-3.5-flash",
            "messages": [
                {"role": "system", "content": REWRITE_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
        },
        timeout=60,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()
```

注意 system prompt 里那条「不要使用 8K、超高清、杰作、完美 这类空泛的质量词」——原因见第四节。

## 三、一条可落地的五步流水线

改写层之外，把剩下四层串起来就是一条完整流水线：

<Steps>
  <Step title="改写：口语 → 结构化提示词">
    见第二节。这一步还顺便承担「把用户输入里的敏感内容中和掉」的职责，能显著降低后面被审核拦下的比例。
  </Step>

  <Step title="锚定：参考图 + 风格常量">
    风格靠两样东西固定：**一段每次都拼进去的风格常量**（你的 preset），和**一组固定的参考图**。

    各系列的参考图上限差别很大，设计流水线前先确认：

    | 模型系列                    | 参考图上限        | 备注                                                         |
    | ----------------------- | ------------ | ---------------------------------------------------------- |
    | Nano Banana 全系          | **14 张**（实测） | 见 [多图融合测试指南](/api-capabilities/multi-image-fusion-testing) |
    | `gpt-image-2` 系列        | **16 张**     | 重复传 `image[]`                                              |
    | Seedream                | **10 张**     | 输入 + 输出总数不超过 15                                            |
    | FLUX.2 pro / max / flex | **8 张**      | `input_image_2` … `input_image_8`；klein 4 张，Kontext 仅 1 张  |
    | Grok Imagine            | **1–4 张**    | 传第 5 张直接 400                                               |

    两个必须遵守的约定：**提示词里的「图1 / 图2」严格按数组顺序对应**，要显式写出来指代谁；**Grok 的参考图只在 `/v1/images/edits` 生效**，传给 `/v1/images/generations` 会被静默丢弃并照常计费。
  </Step>

  <Step title="采样：并发出 N 张，不要指望 n 参数">
    C 端产品「一发就中」的观感，本质是它替你抽了好几次卡。

    但**服务端的 `n` 参数在多数图片模型上不生效**（Seedream 明确静默忽略）。要多张就在客户端并发发多次请求——站内 skills 页给出的做法是一次最多 5 并发。并发数按渠道调，有的渠道并发 2 就开始 429，加指数退避。
  </Step>

  <Step title="择优：用视觉模型当评委">
    有了 N 张就要自动挑，否则等于把选择成本转嫁给用户。

    做法是把候选图回传给一个视觉模型打分，走标准的 `/v1/chat/completions` 图片输入即可，可选模型见 [视觉理解](/api-capabilities/vision-understanding)。评分维度建议固定成五项、要求返回 JSON：指令符合度、结构与解剖、文字正确性、质感真实度、构图。

    <Warning>
      不要用 `/v1/rerank` 做这件事。`bge-reranker-v2-m3` 是**纯文本**重排模型，不接受图片输入。图片打分只能用视觉理解模型。
    </Warning>
  </Step>

  <Step title="精修与落地">
    定稿之后再做局部调整，比一次性下达复合指令成功率高得多：

    * **像素级可控的局部重绘**：只有**官转 `gpt-image-2`** 支持蒙版，见 [蒙版局部重绘指南](/api-capabilities/gpt-image-2/mask-editing)；
    * **多轮对话式累积编辑**：Nano Banana 系列的**原生 Gemini 端点**支持（把上一轮的图以 `role: "model"` 回填），逆向线路不支持；
    * **立刻转存**：所有平台返回的 URL 都是临时链接（FLUX 约 10 分钟且无 CORS，Seedream 与 R2 约 24 小时），拿到就下载进自己的对象存储。
  </Step>
</Steps>

### 串起来的最小实现

```python theme={null}
import base64
import json
import os
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://api.apiyi.com"
API_KEY = os.environ["APIYI_API_KEY"]
HEAD = {"Authorization": f"Bearer {API_KEY}"}

STYLE_CONST = "冷调中性白平衡，整体偏低饱和，画面干净留白充足。"   # 你的 preset


def draw(prompt: str, size: str = "2K", aspect: str = "1:1") -> bytes:
    """出一张图（Nano Banana Pro 原生 Gemini 端点）"""
    url = f"{BASE}/v1beta/models/gemini-3-pro-image:generateContent"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect, "imageSize": size},
        },
    }
    r = requests.post(url, headers=HEAD, json=body, timeout=600)   # 4K 按 600s 留余量
    r.raise_for_status()
    parts = r.json()["candidates"][0]["content"]["parts"]
    part = next((p for p in parts if p.get("inlineData")), None)
    if part is None:                                   # HTTP 200 但没图 = 多半被审核拦了
        raise RuntimeError("未返回图片：" + json.dumps(parts, ensure_ascii=False)[:300])
    return base64.b64decode(part["inlineData"]["data"])


def score(image: bytes, prompt: str) -> dict:
    """用视觉模型给候选图打分，返回 {总分, 各维度分, 一句话讲问题}"""
    data_url = "data:image/png;base64," + base64.b64encode(image).decode()
    rubric = (
        "给这张图打分，严格返回 JSON："
        '{"instruction":0-10,"anatomy":0-10,"text":0-10,"texture":0-10,'
        '"composition":0-10,"total":0-50,"issue":"一句话"}。'
        "instruction=是否满足下面这条需求；anatomy=手指、肢体、物体结构有无错误；"
        "text=画面内文字是否正确（没有文字给 10）；texture=质感是否像真实拍摄而非渲染；"
        "composition=构图是否可用。需求如下：\n" + prompt
    )
    r = requests.post(
        f"{BASE}/v1/chat/completions",
        headers=HEAD,
        json={
            "model": "gemini-3.5-flash",
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": rubric},
                {"type": "image_url", "image_url": {"url": data_url}},
            ]}],
            "response_format": {"type": "json_object"},
        },
        timeout=120,
    )
    r.raise_for_status()
    return json.loads(r.json()["choices"][0]["message"]["content"])


def best_of(user_input: str, n: int = 4) -> bytes:
    prompt = rewrite(user_input) + "\n" + STYLE_CONST        # Step 1 + Step 2
    with ThreadPoolExecutor(max_workers=n) as pool:          # Step 3：客户端并发，不用 n 参数
        results = list(pool.map(lambda _: _safe(draw, prompt), range(n)))

    cands = [img for ok, img in results if ok]
    if not cands:
        raise RuntimeError("全部失败，检查审核拦截或降级到别的模型")

    with ThreadPoolExecutor(max_workers=len(cands)) as pool:  # Step 4：并发打分
        scores = list(pool.map(lambda im: score(im, prompt), cands))

    ranked = sorted(zip(cands, scores), key=lambda x: x[1]["total"], reverse=True)
    return ranked[0][0]                                      # Step 5 的精修与转存按业务接上


def _safe(fn, *args):
    try:
        return True, fn(*args)
    except Exception as e:                # 单张失败不拖垮整批
        return False, str(e)
```

## 四、去 AI 味：让图看起来不像 AI 生成

「AI 味」不是玄学，是**一组可以逐条消掉的具体特征**。

### 实测对比

同一个模型（`gemini-3-pro-image`）、同一个题材，两种写法各出两张，各取第一张：

<Frame caption="裸提示词：「一位年轻女性的半身写实人像，在咖啡馆窗边，微笑看向镜头，8K，超高清，超精细，皮肤细腻，唯美，完美光线，杰作」">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=0623ee0bf7aa07fab43cd347d9aa4a7d" alt="裸提示词生成的人像：人物正对镜头且居中，全画面光线均匀没有明确方向，背景元素齐整，整体是通用图库照片的观感" width="1280" height="956" data-path="images/image-workflow-texture-before.jpg" />
</Frame>

<Frame caption="加了光位、镜头、介质、瑕疵四组控制词之后的同题材出图">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=83efd55ea2ba552a67c04aa2e0f99936" alt="控制词生成的人像：单一侧向窗光，半边脸落进阴影，可见毛孔与面部绒毛、颊上小痣与碎发，胶片色调，人物偏画面右侧" width="1280" height="956" data-path="images/image-workflow-texture-after.jpg" />
</Frame>

左图并不差——底模已经足够强，裸提示词也能出「好看的图」。但它带着一整套典型特征：**人物死死居中、光线均匀到找不出光源在哪、每样东西都恰到好处**。而且这不是偶然：那一轮出的两张，构图和布光模式几乎一样。

右图换了一套写法之后：光有明确方向、半边脸敢丢进阴影、皮肤上有油光和毛孔、颊上有痣、碎发没梳齐、人物偏在画面右侧。它看起来像**某个人在某个具体时刻被拍到了**，而不是「一张咖啡馆女性微笑素材」。

<Info>
  这里也说明了流水线真正的价值：它不是把丑图变好看，而是**把「碰运气的好看」变成「你指定的、可复述、可复现的好看」**。左图换个需求方来看未必更差，但你说不出它为什么长这样，也无法要求下一张跟它保持一致。
</Info>

### 症状 → 对策 → 反面写法

| AI 味的症状     | 对策（写进提示词）                                  | 反面写法（别这么写）          |
| ----------- | ------------------------------------------ | ------------------- |
| 主体永远居中、构图对称 | 指定位置：「人物偏画面右侧，左侧留白」                        | 「完美构图」「黄金分割」        |
| 皮肤塑料感、零毛孔   | 「自然肤质，可见毛孔与面部绒毛，鼻翼一点油光，不做磨皮」               | 「皮肤细腻」「精致」「唯美」      |
| 光线均匀、找不到光源  | 指定唯一主光的方向与软硬：「左侧窗光是唯一光源，右半边脸落进阴影」          | 「完美光线」「柔和打光」        |
| 景深假、虚化像贴上去的 | 给焦段和光圈：「85mm，f/2.8，焦点在近侧眼睛」                | 「背景虚化」「电影感」         |
| 颜色过饱和、发光    | 给介质和白平衡：「Kodak Portra 400 质感，高光偏暖阴影偏青，低饱和」 | 「色彩鲜艳」「HDR」         |
| 一切都是新的、无磨损  | 主动加瑕疵：「毛衣起球，桌面有水渍和面包屑」                     | 「干净整洁」「高级质感」        |
| 整体像海报、像渲染图  | 指定拍摄情境：「抓拍」「从邻桌高度平视」                       | 「8K」「超高清」「杰作」「大师作品」 |

<Warning>
  **`8K`、`超高清`、`超精细`、`杰作`、`完美` 这类空泛质量词是负资产**。它们既不提高分辨率（分辨率只由参数决定），又会把模型推向过锐、过饱和的渲染风格——正好是「AI 味」的核心来源。上面左图的提示词里塞满了这些词，结果就是那个样子。要质量就写具体的光、镜头和介质。
</Warning>

### 四组可直接复制的控制词块

按需拼进提示词，一般四组各取一到两句就够：

<CardGroup cols={2}>
  <Card title="光线" icon="sun">
    左侧窗光是画面里唯一的光源 / 午后三点的侧后方硬光 / 逆光，发丝出现轮廓光 / 桌面台灯作为画面内实用光源 / 阴天的散射光，没有明显投影
  </Card>

  <Card title="镜头" icon="aperture">
    35mm f/2.0 平视抓拍 / 85mm f/2.8，焦点在近侧眼睛 / 24mm 低机位，边缘有轻微畸变 / 长焦压缩空间，背景层次被压平 / 画面四角有轻微暗角
  </Card>

  <Card title="介质" icon="film">
    Kodak Portra 400 胶片质感，细腻颗粒 / 高光偏暖、阴影偏青 / 宝丽来即时成像，反差低、边缘发虚 / 早期 CCD 数码相机的噪点与偏色 / 整体低饱和，不做锐化
  </Card>

  <Card title="瑕疵" icon="scan-line">
    自然肤质，可见毛孔与面部绒毛 / 额前几缕碎发没有梳齐 / 毛衣起球，袖口有磨损 / 桌面有水渍、指纹和面包屑 / 构图不居中，边缘被裁掉一部分
  </Card>
</CardGroup>

### 三个场景的完整示例

<AccordionGroup>
  <Accordion title="人像：要像抓拍，不像证件照">
    半身人像抓拍：一位二十多岁的女性在咖啡馆窗边，侧身看向窗外，嘴角有一点没收住的笑。窗光是画面里唯一的光源，来自左侧，右半边脸落进阴影，鼻梁下有一小块硬边阴影。85mm 镜头，f/2.8，平视，焦点落在近侧眼睛。柯达 Portra 400 胶片质感，可见细腻颗粒，高光偏暖、阴影偏青，整体低饱和。自然肤质：可见毛孔与面部绒毛，鼻翼有一点油光，左颊有一颗小痣，眉毛有几根杂乱散毛，额前几缕碎发没有梳齐。不做磨皮，不做美颜，不做锐化。构图偏右，左侧留白。
  </Accordion>

  <Accordion title="产品图：要能直接上商详页">
    电商主图：一只哑光黑色陶瓷手冲咖啡杯，杯中盛八分满的黑咖啡，表面有一圈细密油脂。放在浅灰色微水泥台面上，背景是同色系墙面并虚化。主光为左上方 45 度柔光箱，右侧用白色反光板补光，杯身右缘留一条细窄的高光；台面上落一道柔和的杯体投影，向右后方延伸。85mm 微距镜头，f/5.6，正面略俯视 15 度，全杯清晰。冷调中性白平衡，整体偏低饱和。陶瓷表面有细微的手工釉面不均和一处极小的窑变斑点，杯沿有一道极浅的使用痕迹。画面留白充足，杯子位于画面左三分之一处。不要出现任何品牌名或文字。
  </Accordion>

  <Accordion title="环境场景：要有具体时间和天气">
    傍晚六点的老城区窄街，刚下过雨，地面积水倒映着两侧店铺的灯箱。唯一的主光是街口一盏偏暖的路灯，其余靠店铺灯光补，天空还剩一点冷调余晖，形成暖冷对比。28mm 镜头，f/4，机位在人的视线高度，略微仰拍。整体低饱和，暗部保留噪点，不做提亮。墙面有水渍、旧海报的撕痕和空调外机，电线在画面上方横过。画面中没有人正对镜头，行人都是背影和运动模糊。
  </Accordion>
</AccordionGroup>

## 五、几个会打乱流水线设计的事实

设计之前先知道这些，能省掉一轮返工：

| 事实                                                                                                            | 对流水线的影响                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **seed 在这条产品线上基本不可用**：Nano Banana 全系与 GPT-Image 全系不暴露 seed，Seedream 4.x / 5.x 的 seed 实测不生效，Grok Imagine 明确不支持 | 别把「复现」建立在 seed 上。**唯一可靠的复现是把成功那次的完整请求体存档**（提示词、参考图、全部参数），下次原样重放                                                          |
| **服务端 `n` 参数在多数图片模型上不生效**                                                                                     | 多候选必须客户端并发，并发数要按渠道压测，配指数退避                                                                                               |
| **图片 API 全部同步，没有任务 ID，断连仍计费**                                                                                 | 流水线必须自建任务队列，见 [自实现异步队列](/api-capabilities/image-async-queue) 与 [图片 API 调用须知](/api-capabilities/image-api-best-practices) |
| **没有超分 / 抠图 / 修脸接口**                                                                                          | 尺寸在生成时一次到位；透明底走 `gpt-image-2` 的 `background: "transparent"` 参数（不是抠图接口，是生成时直接出透明底）                                        |
| **HTTP 200 但没图，通常是内容审核拦截**                                                                                    | 择优逻辑要能区分「没出图」和「出了但不好」，前者见 [Gemini 生图错误处理](/api-capabilities/gemini-image-error-handling)                                 |
| **返回的图片 URL 都是临时链接**                                                                                          | 拿到结果立刻转存，别把上游 URL 直接落库                                                                                                   |
| **GPT-Image 系列提示词上限 32,000 字符**（原厂上限，按字符计）                                                                    | 品牌手册、包装规格这类资料不要直接塞图片模型，先经文本模型提炼成 1K～3K 字符的结构化提示词，见 [长提示词篇](/api-capabilities/image-long-prompt)                          |

## 六、成本账：什么时候值得上流水线

流水线是拿钱换成功率。出图成本的大头永远是**输出**（`gpt-image-2` 输出 \$30 / 百万 tokens），改写和打分用的文本 / 视觉模型相对可以忽略。所以成本基本等于「你出了几张候选」。

按场景分三档用，不要一刀切：

| 档位      | 组成                       | 相对成本 | 适用                |
| ------- | ------------------------ | ---- | ----------------- |
| **草稿档** | Lite 模型单张直出              | 1×   | 内部预览、批量占位图、用户随手试  |
| **标准档** | 改写 + 2 张候选 + 打分挑 1 张     | 约 2× | C 端产品的默认路径        |
| **精品档** | 改写 + 4 张候选 + 打分 + 一次局部精修 | 约 5× | 商详主图、投放素材、要对外交付的图 |

判断标准很简单：**这张图会不会被外部的人看到**。会，就值得上标准档以上；只是内部看一眼，草稿档足够。中间还可以加一道闸门——打分低于阈值才追加候选，大部分请求两张就收敛了。

## 速查总结

* 差距不在模型权重，**在模型外面那八层**：改写、预设、锚定、采样、择优、分步编辑、后处理、转存。
* **改写层性价比最高**：补齐主体 / 环境 / 光线 / 镜头 / 色调 / 构图六要素，「好看」才会变成「可用」。
* **多候选 + 视觉模型打分**是 C 端产品高成功率观感的真正来源；`n` 参数不生效，要客户端并发；`/v1/rerank` 不能给图片打分。
* **去 AI 味靠加具体，不靠加形容词**：指定唯一光源、给焦段光圈、指定介质与颗粒、主动加瑕疵、把主体挪出画面中心。
* **`8K` / `杰作` / `完美光线` 这类词是负资产**，既不提分辨率又把画面推向渲染感。
* **别指望 seed 复现**，存完整请求体才是复现；图片 API 全同步、断连仍计费，流水线必须配队列。
* API易 没有超分 / 抠图 / 身份训练接口，涉及这几层要在方案里提前绕开。

## 相关文档

<CardGroup cols={2}>
  <Card title="如何生成满意的图片" icon="target" href="/api-capabilities/image-generation-success-tips">
    单次调用失败怎么救：改提示词、重试、换模型、用测试工具定位
  </Card>

  <Card title="图片 API 调用须知与最佳实践" icon="book-check" href="/api-capabilities/image-api-best-practices">
    同步调用、timeout 分档、计费口径、base64 处理、输入图预处理
  </Card>

  <Card title="蒙版局部重绘指南" icon="scissors" href="/api-capabilities/gpt-image-2/mask-editing">
    像素级可控的局部修改，官转 gpt-image-2 专属
  </Card>

  <Card title="多图融合测试指南" icon="images" href="/api-capabilities/multi-image-fusion-testing">
    参考图上限实测方法与 14 图融合结果
  </Card>

  <Card title="视觉理解" icon="eye" href="/api-capabilities/vision-understanding">
    可用于给候选图打分的视觉模型清单与调用方式
  </Card>

  <Card title="自实现异步队列" icon="list-checks" href="/api-capabilities/image-async-queue">
    把同步出图包进任务队列，支撑多候选流水线
  </Card>
</CardGroup>
