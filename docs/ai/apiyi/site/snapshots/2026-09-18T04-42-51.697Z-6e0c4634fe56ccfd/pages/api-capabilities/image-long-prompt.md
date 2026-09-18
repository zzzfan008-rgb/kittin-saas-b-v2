> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 长提示词与两段式出图：32K 上限从哪来，广告图资料怎么进图片模型

> 客户问「你们 prompt 限了 32K，ChatGPT 没有」。32,000 字符是 OpenAI Images API 的官方上限，按字符不按 token；网页版能吃长资料是对话模型先替你提炼。讲清上限、成本、为什么长不等于遵循度高，以及资料先进文本模型提炼、再进图片模型出图的两段式做法。

「你们的 prompt 长度和 ChatGPT 不一样，好像限了 32K」。这个 32K 不是 API易 加的，是 OpenAI Images API 的官方上限，而且按**字符**计不按 token。但真正值得讨论的不是「能不能塞 32K」，而是**该不该把 32K 资料原样塞给图片模型**。本文讲清上限从哪来、网页版为什么看起来没有限制、长提示词的两笔账，以及广告图这类「要求很多」的场景该怎么组织提示词。

## 客户的问题：为什么 API 限 32K，ChatGPT 不限

对话原样（已脱敏）：

> 客户：你们的 prompt 长度和 ChatGPT 不一样，好像限了 32K。
> 我们：是有限制的。谁会有 32K 输入提示词的出图场景？
> 客户：肯定有呀，广告图，包装的尺寸……自己 call codex cli 算了。
> 我们：确认是 32000 个 tokens 的提示词吗？
> 客户：是呀，32000 英文其实不长呀。

这几句话里混了三个概念，先拆开：

| 概念          | 是什么            | 这个案例里的值                                |
| ----------- | -------------- | -------------------------------------- |
| **字符数**     | 提示词字符串的长度      | Images API 上限 **32,000 字符**            |
| **token 数** | 模型实际计费与理解的单位   | 32,000 英文字符约 8K tokens；中文每字符消耗更多 token |
| **上下文窗口**   | 文本模型一次能装下的全部内容 | 文本模型动辄几十万到上百万 tokens，与图片模型的提示词上限是两回事   |

客户说「32000 英文其实不长」，说的是字符数，这个判断本身没错。但他拿来对比的 ChatGPT 网页版，走的根本不是同一条链路。

## 32K 上限从哪来

OpenAI Images API 对 `prompt` 字段的官方上限（`/v1/images/generations` 与 `/v1/images/edits` 相同）：

| 模型                                                                 | prompt 上限  | 单位 |
| ------------------------------------------------------------------ | ---------- | -- |
| gpt-image 系列（含 `gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`） | **32,000** | 字符 |
| DALL·E 3                                                           | 4,000      | 字符 |
| DALL·E 2                                                           | 1,000      | 字符 |

出处：OpenAI API 参考 `developers.openai.com/api/reference/resources/images/methods/generate`。

<Info>
  API易 官转链路不在这个上限之上再收紧。超过 32,000 字符由原厂返回 400，报错原文以原厂为准，本页未做逐字节的边界实测；要精确到哪一个字符开始报错，用你自己的 Key 试一次即可，被拒的请求不计费。
</Info>

**字符不等于 token**。计费和模型理解都按 token 走，`usage.input_tokens_details.text_tokens` 是每次调用实际消耗的文本 token 数。同样 32,000 字符，英文约 8K tokens，中文因为每个字符对应的 token 更多，会明显高于这个数，装的信息量也更大。所以「32K 英文不长」和「32K 中文很长」可以同时成立。

## 为什么 ChatGPT 网页版「没有限制」

和 [如何生成满意的图片](/api-capabilities/image-generation-success-tips)、[内容安全排查篇](/api-capabilities/image-safety-troubleshooting) 讲的是同一件事：**网页版是 Agent，API 是单次原子调用**。

* 在 ChatGPT 里贴一份很长的资料，读它的是对话模型，不是图片模型。对话模型读完后**自己写一条短的出图提示词**去调用图片工具，图片模型拿到的从来不是那份原始资料。粘贴超过 10,000 字符时网页版还会自动转成附件（OpenAI 帮助中心 `help.openai.com`），更说明那是给对话模型看的。
* API 是你直接对图片模型说话，中间没有人替你读资料、做取舍。上限是图片模型这一层的上限，网页版从来没有让图片模型直面这个上限。
* 客户最后说「自己 call codex cli 算了」，这个直觉是对的：让一个文本模型先读资料，再产出出图提示词，正是网页版在后台做的事。下文把它写成可以跑的两段式。

## 长提示词的两笔账

先算钱，再算效果。

**钱**：gpt-image 系列的文本输入按 token 计费（`gpt-image-2.5` 为 \$5.00 / 百万 tokens，见 [概览定价表](/api-capabilities/gpt-image-2/overview)）。一条 32,000 英文字符的提示词约 8K tokens，单次约 \$0.04；中文 token 更多，费用更高。这个数单看不大，量产要乘张数，而且每一次重试都会再付一遍。提示词里 90% 是原始资料而不是画面描述时，这笔钱大部分是白花的。

**效果**：更多细节不等于更高遵循度。几百条要求同时摆在图片模型面前时会互相竞争，真正重要的硬约束（Logo 不变形、包装文字准确、人物数量）反而容易被埋没。OpenAI 自己对出图提示词的建议是 1～3 句清晰描述起步，再补必要的构图、光线和硬性约束（`openai.com/academy/image-generation`）。图片模型需要的是**优先级明确的信息密度**，不是字数。

所以「专业广告要求多」是对的，但**细不等于长**。[出图进阶篇](/api-capabilities/image-advanced-workflow) 的六要素和 [提示词诊断技能](/api-capabilities/image-prompt-doctor) 里「不要堆形容词把提示词写长」讲的都是这一条。

## 两段式：资料进文本模型，提示词进图片模型

真有 32K 的东西要交给出图，它多半是品牌手册、包装规格、广告 brief、角色设定库。这类资料应该先进文本模型，由它提炼成一条高密度提示词，再进图片模型：

| 阶段   | 输入                          | 模型                       | 输出                |
| ---- | --------------------------- | ------------------------ | ----------------- |
| ① 提炼 | 品牌手册 / 包装规格 / 广告 brief，长度不限 | `gpt-5.6` 等文本模型          | 1K～3K 字符的结构化出图提示词 |
| ② 出图 | 上一步的提示词（远在 32K 之内）          | `gpt-image-2.5-sunburst` | 图片                |

提炼层的输出模板，在六要素之外加上广告图特有的三项：

| 段落             | 要写什么                               |
| -------------- | ---------------------------------- |
| **硬约束（放最前）**   | Logo 不变形、包装上的文字逐字给出、人物数量、画面比例、背景色值 |
| **目的与投放位**     | 这是什么广告、放在哪里、要让消费者感受到什么             |
| **主体与必须保留的元素** | 产品是什么、包装上哪些元素必须准确出现                |
| **构图与留白**      | 产品位置、人物位置、景别、给文案留的空白区域             |
| **视觉**         | 场景、色调、光线、材质、摄影风格                   |
| **禁止项**        | 不要增加什么、不要改变什么                      |

<Steps>
  <Step title="把资料原样交给文本模型">
    品牌手册、规格表、brief 不用预处理，文本模型的上下文足够大。system prompt 里写清输出模板、字符上限（建议 2,500 字符以内）和「硬约束放最前」。
  </Step>

  <Step title="拿到提示词先过长度闸门">
    检查 `len(prompt)`，超过 32,000 就让文本模型再压缩一轮。正常情况下提炼结果只有一两千字符，这一步是防御。
  </Step>

  <Step title="提示词落库，再调图片模型">
    提炼结果存下来，出图只重放这条提示词。重试、换尺寸、换模型都不需要重新读资料，也不会再为资料付 token。
  </Step>

  <Step title="资料变了只重跑第一段">
    包装改版、brief 更新时重跑提炼，出图这一段的代码和参数不动。
  </Step>
</Steps>

最小实现（OpenAI SDK，两段共用一个 Key）：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

DISTILL_SYSTEM = """你是广告图提示词工程师。读完用户给的全部资料，输出一条可以直接交给图片模型的中文提示词。

按这个顺序写，每段一行：
1 硬约束：Logo 不变形、包装文字逐字给出、人物数量、画面比例、背景色值
2 目的与投放位
3 主体与必须保留的包装元素
4 构图与留白：产品位置、人物位置、景别、文案留白区域
5 视觉：场景、色调、单一可指认的主光、材质、摄影风格
6 禁止项

规则：
- 总长不超过 2500 字符，只输出提示词正文，不要解释、不要标题
- 资料里没有的信息不要编造，尤其是品牌名和包装文字
- 不要使用 8K、超高清、杰作、完美 这类空泛的质量词
- 资料明确规定的内容原样保留，不要改写"""

PROMPT_LIMIT = 32000  # OpenAI Images API 的 prompt 上限，按字符计


def distill(brief: str, model: str = "gpt-5.6") -> str:
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": DISTILL_SYSTEM},
            {"role": "user", "content": brief},
        ],
    )
    prompt = resp.choices[0].message.content.strip()
    if len(prompt) > PROMPT_LIMIT:
        # 极少发生，发生了就再压一轮
        prompt = distill(f"把下面这条提示词压缩到 2500 字符以内，保留全部硬约束：\n\n{prompt}", model)
    return prompt


def generate(prompt: str, size: str = "1536x1024", quality: str = "high") -> bytes:
    import base64
    resp = client.images.generate(
        model="gpt-image-2.5-sunburst",
        prompt=prompt,
        size=size,
        quality=quality,
        timeout=600,
    )
    return base64.b64decode(resp.data[0].b64_json)


if __name__ == "__main__":
    brief = open("brief.md", encoding="utf-8").read()   # 品牌手册 + 包装规格 + 广告需求，多长都行
    prompt = distill(brief)
    open("prompt.txt", "w", encoding="utf-8").write(prompt)   # 落库，出图只重放这条
    open("ad.png", "wb").write(generate(prompt))
```

<Tip>
  提炼结果和出图参数一起存档，是这条产品线上**唯一可靠的复现方式**（GPT-Image 系列不暴露 seed），详见 [出图进阶篇](/api-capabilities/image-advanced-workflow) 第五节。
</Tip>

## 什么时候真的需要长提示词

有几类场景提示词确实会长一些，但都远够不到 32K：

* **多图编辑**：用「图1 / 图2 / 图3」逐一指代参考图，说明各取什么，几百字。
* **画面内文字**：招牌、海报、包装上的文字要逐字给出，别让模型编，几十到几百字。
* **系列图的固定前缀**：同一批图共用的风格、光线、构图段落，一千字以内。

这些加起来通常也就两三千字符。提示词真的逼近 32K，先怀疑是不是把资料塞进去了。

## 速查总结

* **32,000 字符是 OpenAI Images API 的官方上限**，按字符不按 token，`/generations` 与 `/edits` 相同，API易 官转不额外收紧。
* **字符、token、上下文窗口是三件事**：32K 英文约 8K tokens，中文更多；文本模型的上下文窗口和图片模型的提示词上限无关。
* **网页版没有限制是错觉**：对话模型先读资料、再自己写短提示词调图片工具，图片模型从没直面那 32K。
* **细不等于长**：文本输入按 token 计费且每次重试再付一遍；几百条要求互相竞争，硬约束反而被埋。
* **两段式**：资料进文本模型提炼成 1K～3K 字符的结构化提示词，硬约束放最前，落库后只重放提示词出图。

## 相关文档

* [如何生成满意的图片](/api-capabilities/image-generation-success-tips)
* [内容安全排查篇](/api-capabilities/image-safety-troubleshooting)
* [出图进阶：工作流编排与去 AI 味](/api-capabilities/image-advanced-workflow)
* [出图提示词诊断技能](/api-capabilities/image-prompt-doctor)
* [文生图 API 参考](/api-capabilities/gpt-image-2/text-to-image)
