> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 模型拒答长什么样？

> GPT 系列模型遇到违反原厂使用政策的请求时，返回 200 与一段拒答文字，不报错也不分类。本文给出输出体示例与识别方法。

## 简短回答

GPT 系列模型遇到违反原厂使用政策的请求时，**不会报错**。接口照常返回 HTTP 200，`finish_reason` 是 `stop`，正文是模型自己写的一句拒答，比如「I can't help with that…」或「抱歉，我不能…」。

响应里**没有错误码，也没有拒答类别或严重程度**，结构与正常回答完全一样，并且按正常输出计费。所以只看状态码和 `finish_reason`，是判断不出「被拒答了」的。

## 拒答的输出体

下面是 `/v1/chat/completions` 非流式拒答的实测返回（正文已替换为中性示例）：

```json theme={null}
{
  "model": "gpt-5.6-terra",
  "object": "chat.completion",
  "created": 1789712872,
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I can't help with that request. I can, however, help with a related topic or a rewritten version that stays within the usage policy."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 54,
    "total_tokens": 89
  }
}
```

| 字段 | 拒答时的表现 |
| - | - |
| HTTP 状态码 | `200` |
| `finish_reason` | `stop`，与正常回答相同 |
| `message` | 只有 `role` 和 `content`，**没有**单独的 `refusal` 字段 |
| 正文开头 | 常见为 `I can't…`、`Sorry, I can't…`、`抱歉，我不能…` |
| 语言 | 跟随提示词：中文提问多用中文拒答 |
| 长度 | 多在 50–120 tokens；涉及身心健康的话题会附带求助建议，可能长到 400 tokens 左右 |
| 计费 | 按实际输入、输出 tokens 正常计费 |

## 为什么没有分类

OpenAI 的对话接口对违规请求的处理方式，是**让模型自己决定不回答**，而不是由接口返回一个错误。它不会告诉你命中的是哪一类（例如成人向内容、血腥暴力、自我伤害等），也不给严重程度。

这和「报错」是两回事：报错时你拿到的是非 200 状态码和 `error` 对象；拒答时你拿到的是一次**成功的调用**，只是内容不是你想要的。

## 翻译与结构化输出场景

批量翻译、信息抽取这类任务，通常要求模型按固定格式输出（比如一个 JSON 数组）。一旦某批内容触发拒答，模型返回的是一句普通文字，客户端按 JSON 解析就会失败，常见报错如 `Unrecognized token 'I'`、`Expecting value`。

**这不是接口格式问题**，而是这一批内容本身被拒绝处理。同一批内容原样重试，结果通常也一样。

<Info>
  API易 已对**非流式请求**启用内容安全自动切换：某条官方线路在请求阶段或生成阶段触发内容过滤时，会自动切换到其他官方线路重新处理，无需客户端重试。切换后，大多数请求能拿到正常结果；极个别内容仍可能被模型本身拒答，这时就是本文描述的形态。
</Info>

## 如何识别与处理

<Steps>
  <Step title="先校验输出格式">
    要求 JSON 就先按 JSON 解析，要求固定条数就核对条数。格式不符，就当作「未拿到结果」处理，不要直接把正文当译文使用。
  </Step>

  <Step title="再判断是否为拒答">
    格式不符时，看正文是否是一句以 `I can't`、`Sorry`、`抱歉` 等开头的短句。是的话基本可以判定为拒答，而不是模型输出格式跑偏。
  </Step>

  <Step title="不要原样重试">
    同一内容原样重试，大概率得到同样的拒答，还会重复计费。
  </Step>

  <Step title="拆小批次，定位具体条目">
    把失败的批次拆成更小的批次重新提交，找出触发拒答的具体条目；其余条目通常可以正常完成。对触发的条目，可以调整表述后再试。
  </Step>

  <Step title="内部存档失败 Case，再决定是否换模型">
    把失败 Case 在你们内部存档（原文、请求时间、请求 ID、返回正文），定期分析拒答集中在哪类内容，再考虑对这部分内容改用其他模型重试。
  </Step>
</Steps>

<Tip>
  建议把「失败 Case 存档 → 分析 → 换其他模型重试」做成固定流程。拒答往往集中在少数几类内容上，存档之后很容易看出规律，比每次人工排查省事得多，也能避免对同一内容反复重试、重复计费。
</Tip>

下面是一个最小示例：校验 JSON，不符合就记入本地失败清单。

```python theme={null}
import json
import os
import time
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL_PREFIXES = ("I can't", "I can’t", "Sorry", "I'm sorry", "I’m sorry", "抱歉")

def translate_batch(lines):
    prompt = "把下面的字幕逐句翻译成英文，只输出 JSON 数组：\n" + json.dumps(lines, ensure_ascii=False)
    resp = client.chat.completions.create(
        model="gpt-5.6-terra",
        messages=[{"role": "user", "content": prompt}],
    )
    text = resp.choices[0].message.content or ""
    try:
        result = json.loads(text)
        if isinstance(result, list) and len(result) == len(lines):
            return result
    except json.JSONDecodeError:
        pass

    # 未拿到结果：记入本地失败清单，供后续分析或改用其他模型重试
    with open("failed_cases.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "time": time.strftime("%Y-%m-%d %H:%M:%S %z"),
            "request_id": resp.id,
            "is_refusal": text.strip().startswith(REFUSAL_PREFIXES),
            "input": lines,
            "output": text,
        }, ensure_ascii=False) + "\n")
    return None
```

## 流式请求的区别

流式请求一旦开始输出，就无法再切换线路，因此**内容安全自动切换只对非流式请求生效**。流式下你可能会看到：

* 一句简短的拒答，最后一个事件的 `finish_reason` 为 `content_filter`；
* 或者已经输出了一部分正文，最后以 `finish_reason: "content_filter"` 结束。

批量翻译这类不需要逐字展示的任务，建议使用非流式调用。两者的完整对照与实测数据见 [流式和非流式请求，遇到内容过滤有什么不同？](/faq/streaming-content-filter)。

## 常见问题

<AccordionGroup>
  <Accordion title="被拒答也会扣费吗？">
    会。拒答是一次成功的调用，按实际输入、输出 tokens 正常计费，所以不建议对同一内容反复重试。
  </Accordion>

  <Accordion title="能关闭拒答吗？">
    不能。拒答由原厂模型根据其使用政策决定，API易 无法关闭，也无法调整它的尺度。
  </Accordion>

  <Accordion title="同样的内容，为什么有时成功、有时被拒答？">
    模型的判断本身有一定随机性，不同官方线路的过滤尺度也不完全一致，所以边界附近的内容可能时而通过、时而被拒。明显违反使用政策的内容，基本会被稳定拒答。
  </Accordion>

  <Accordion title="怎样才能拿到拒答的类别？">
    OpenAI 的对话接口不返回类别。如果你的业务需要按类别处理，可以在请求前自行对内容做一次分类，或在失败 Case 存档后人工归类。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="响应数据处理" icon="braces" href="/api-capabilities/openai/response-handling">
    流式与非流式响应的统一解析方法
  </Card>

  <Card title="内容安全如何合规性？" icon="shield-check" href="/faq/content-safety">
    平台内容安全与合规政策
  </Card>

  <Card title="Claude 拒答为什么返回空内容？" icon="message-square-x" href="/faq/claude-content-safety-refusal">
    Claude 拒答的形态与识别方法
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.