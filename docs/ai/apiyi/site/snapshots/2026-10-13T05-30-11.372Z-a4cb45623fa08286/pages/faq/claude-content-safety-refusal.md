> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 拒答为什么返回空内容？

> Claude 触发原厂安全策略时不报错，返回 HTTP 200、空 content 与 stop_reason: refusal，并附拒答类别。本文给出各调用格式的输出体、计费规则与识别方法。

## 简短回答

Claude 遇到触发原厂安全策略的请求时，**不会报错**。接口照常返回 HTTP 200，但：

* `content` 是**空数组** `[]`，`output_tokens` 为 `0`；
* `stop_reason` 是 `refusal`；
* `stop_details` 里写明拒答的**类别**（如 `cyber` 网络安全）和一段英文说明。

这是模型本身的行为，不是接口故障。代码里如果直接取 `message.content[0]`，就会抛出 `IndexError`；用 OpenAI 兼容格式调用时，拿到的是空字符串，`finish_reason` 为 `refusal`。

拒答通常在 1\~2 秒内返回。是否计费取决于拒答类别：**`cyber` 等类别在输出前被拒答时不计费**，详见下文「计费规则」。

## 拒答的输出体

下面是同一条触发网络安全拒答的请求，在四种调用方式下的实测返回（2026-09-29 实测，id 已打码）：

<Tabs>
  <Tab title="原生 · 非流式">
    `POST /v1/messages`，`stream: false`：

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "type": "message",
      "role": "assistant",
      "model": "claude-sonnet-5",
      "content": [],
      "stop_reason": "refusal",
      "stop_sequence": null,
      "stop_details": {
        "type": "refusal",
        "category": "cyber",
        "explanation": "This request triggered cyber-related safeguards. To learn about the Cyber Verification Program and apply for access, visit our help center: ..."
      },
      "usage": {
        "input_tokens": 2863,
        "output_tokens": 0,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0
      }
    }
    ```
  </Tab>

  <Tab title="原生 · 流式">
    `POST /v1/messages`，`stream: true`。**没有任何 `content_block_*` 事件**，`message_start` 之后直接是带拒答信息的 `message_delta`：

    ```text theme={null}
    event: message_start
    data: {"type":"message_start","message":{"id":"msg_xxxxxxxx","content":[],"stop_reason":null,"stop_details":null,"usage":{"input_tokens":2863,"output_tokens":0}, ...}}

    event: message_delta
    data: {"type":"message_delta","delta":{"stop_reason":"refusal","stop_sequence":null,"stop_details":{"type":"refusal","category":"cyber","explanation":"This request triggered cyber-related safeguards. ..."}},"usage":{"input_tokens":2863,"output_tokens":0}}

    event: message_stop
    data: {"type":"message_stop"}
    ```
  </Tab>

  <Tab title="OpenAI 兼容 · 非流式">
    `POST /v1/chat/completions`。`content` 为空字符串，`finish_reason` 为 `refusal`，**没有拒答类别**：

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "object": "chat.completion",
      "model": "claude-sonnet-5",
      "choices": [
        {
          "index": 0,
          "message": { "role": "assistant", "content": "" },
          "finish_reason": "refusal"
        }
      ],
      "usage": { "prompt_tokens": 2863, "total_tokens": 2863 }
    }
    ```
  </Tab>

  <Tab title="OpenAI 兼容 · 流式">
    `POST /v1/chat/completions`，`stream: true`。只有空的 `delta`，某个 chunk 的 `finish_reason` 为 `refusal`：

    ```text theme={null}
    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""}}]}

    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"refusal"}]}

    data: [DONE]
    ```
  </Tab>
</Tabs>

| 字段 | 拒答时的表现 |
| - | - |
| HTTP 状态码 | `200`，不是错误 |
| `content` | 原生格式为空数组 `[]`；OpenAI 兼容格式为空字符串 `""` |
| `stop_reason` / `finish_reason` | `refusal` |
| `stop_details` | 仅原生格式有：`type`、`category`（拒答类别）、`explanation`（英文说明） |
| `usage` | 输入 tokens 如实计数，`output_tokens` 为 0（计数不等于计费，见下文） |
| 耗时 | 通常 1\~2 秒，远快于正常回答 |

<Note>
  拒答也可能发生在**流式输出的中途**：先输出了一部分正文，最后以 `stop_reason: "refusal"` 结束。这时已输出的部分是不完整的，应当丢弃。
</Note>

## 拒答类别

`stop_details.category` 目前有五个取值：

| 类别 | 含义 |
| - | - |
| `cyber` | 可能助长网络安全危害，如恶意软件、漏洞利用开发；正常的安全工作也可能触发 |
| `bio` | 可能助长生物危害；正常的生命科学研究也可能触发 |
| `frontier_llm` | 可能协助开发与之竞争的 AI 模型（原厂商业条款限制） |
| `reasoning_extraction` | 要求模型在回答里复述自己的内部推理过程 |
| `general_harms` | 不属于以上四类的其他使用政策领域 |

拒答对应不到具体类别时，`category` 和 `explanation` 都是 `null`，这是正常值。`explanation` 的文字随时可能变化，只适合展示，**不要拿来做字符串匹配**。

## 常见触发场景

`category: "cyber"`（网络安全）是开发者最常遇到的一类。Claude 对网络安全相关请求有一层实时防护，下面这些任务都可能触发：

* 让模型寻找代码漏洞、判断一段代码「是否存在漏洞」、给出漏洞类型（CWE）
* 编写或补全漏洞利用代码（exploit）、渗透测试步骤
* 分析、改写恶意代码

<Warning>
  **批量评测和数据集蒸馏最容易踩到。** 例如用一整个漏洞数据集逐条让模型判断，往往会有相当一部分样本被拒答。脚本如果默认 `content[0]` 一定存在，就会在拒答那一条上直接崩溃，看起来像「接口时好时坏」。
</Warning>

## 计费规则

按原厂规则（截至 2026 年 9 月，原厂可能根据误拦率调整）：

| 拒答发生的时机与类别 | 计费 |
| - | - |
| 输出前拒答，类别为 `cyber`、`general_harms` 或 `null` | **不计费** |
| 输出前拒答，类别为 `bio`、`frontier_llm`、`reasoning_extraction` | 按输入 tokens 计费 |
| 流式输出中途拒答（任何类别） | 按输入 tokens 与已输出的 tokens 计费 |

无论是否计费，拒答请求都会计入速率限制。`usage` 里照常显示 token 数，这是计数，不代表一定扣费。

## 如何识别与处理

<Steps>
  <Step title="先判断 stop_reason，再取内容">
    原生格式看 `stop_reason == "refusal"`，OpenAI 兼容格式看 `finish_reason == "refusal"`。确认不是拒答之后，再去读 `content`。
  </Step>

  <Step title="把拒答当作一类结果记录">
    拒答是一次成功的调用，不是网络错误。评测类任务建议单独记为「拒答」，连同 `stop_details.category` 一起存档，而不是计入失败重试。
  </Step>

  <Step title="不要原样重试">
    同一内容原样重试，大概率还是同样的拒答，还会占用速率限制；部分类别每次都会产生输入费用。
  </Step>

  <Step title="多轮对话要先重置上下文">
    多轮对话里某一轮被拒答后，要删掉或改写触发拒答的那一轮，或者清空历史，再继续对话。不重置的话，后续请求会持续被拒答。
  </Step>

  <Step title="定期分析拒答集中在哪类内容">
    按 `category` 统计，就能看出是哪类任务在触发。再决定这部分内容是否改用其他模型处理。
  </Step>
</Steps>

<Tabs>
  <Tab title="Anthropic SDK">
    ```python theme={null}
    import os
    import anthropic

    client = anthropic.Anthropic(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com",
    )

    def ask(prompt, model="claude-sonnet-5"):
        message = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        if message.stop_reason == "refusal":
            details = getattr(message, "stop_details", None)
            category = getattr(details, "category", None) if details else None
            return {"refused": True, "category": category, "request_id": message.id}

        text = "".join(b.text for b in message.content if b.type == "text")
        return {"refused": False, "text": text}
    ```
  </Tab>

  <Tab title="OpenAI SDK">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1",
    )

    def ask(prompt, model="claude-sonnet-5"):
        resp = client.chat.completions.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        choice = resp.choices[0]
        if choice.finish_reason == "refusal" or not choice.message.content:
            return {"refused": True, "request_id": resp.id}
        return {"refused": False, "text": choice.message.content}
    ```
  </Tab>
</Tabs>

<Tip>
  需要知道拒答**类别**，请用原生 `/v1/messages` 格式调用。OpenAI 兼容格式只保留了 `finish_reason: "refusal"`，没有 `stop_details`。
</Tip>

## 合规的安全研究怎么办

拒答说明里提到的 **Cyber Verification Program（网络安全验证计划）**，是原厂面向合规安全研究的免费申请计划：通过身份验证后，漏洞利用、攻防工具开发这类「高风险两用」任务可以放宽。但勒索软件开发、大规模数据窃取这类「禁止用途」，任何情况下都会被拦截。

这个计划**由组织管理员以原厂账号申请**。通过第三方平台调用时，原厂说明「并非所有平台都参与」，API易 目前不提供该计划的接入。

所以通过 API易 调用时，对被拒答的样本：

* 在评测结果里如实记为「拒答」，连同类别一起统计；
* 或改用其他模型处理这部分内容。

API易 不会也无法调整原厂的安全策略。

## 与 OpenAI 拒答的区别

| | Claude | OpenAI（GPT 系列） |
| - | - | - |
| HTTP 状态码 | 200 | 200 |
| 正文 | 空（`content: []`） | 一句拒答文字，如 `I can't help with that…` |
| 结束原因 | `refusal` | `stop`，与正常回答相同 |
| 拒答类别 | 有，`stop_details.category` | 无 |
| 计费 | 输出前拒答的 `cyber` 等类别不计费 | 按拒答文字正常计费 |
| 识别方式 | 判断 `stop_reason` 即可 | 只能看正文特征 |

OpenAI 模型的拒答形态详见 [OpenAI 模型拒答长什么样？](/faq/openai-content-safety-refusal)。

## 常见问题

<AccordionGroup>
  <Accordion title="被拒答也会扣费吗？">
    看类别和时机。输出前被拒答、类别为 `cyber`、`general_harms` 或 `null` 的不计费；`bio`、`frontier_llm`、`reasoning_extraction` 按输入计费；流式中途被拒按输入加已输出部分计费。详见上文「计费规则」。
  </Accordion>

  <Accordion title="能关闭拒答吗？">
    不能。拒答由原厂模型根据其安全策略决定，API易 无法关闭，也无法调整它的尺度。被拒答的内容建议记为拒答结果，或改用其他模型处理。
  </Accordion>

  <Accordion title="同一个数据集，为什么有的样本被拒、有的正常？">
    防护按每一条请求的内容单独判断。代码片段本身的特征、提示词的问法都会影响结果，所以同一个数据集里通常只有一部分样本被拒。实测同一条被拒的样本连续重发，结果基本稳定一致。
  </Accordion>

  <Accordion title="拒答时 usage 里的 output_tokens 为什么是 0？">
    模型没有生成任何内容就结束了，所以输出为 0，只有输入被计数。这也是区分「拒答」和「被 max\_tokens 截断」的方法：后者 `stop_reason` 是 `max_tokens`，且输出 tokens 等于你设置的上限。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="Claude 响应数据处理" icon="braces" href="/api-capabilities/claude-response-handling">
    流式与非流式响应结构、stop\_reason 取值
  </Card>

  <Card title="OpenAI 模型拒答长什么样？" icon="message-square-x" href="/faq/openai-content-safety-refusal">
    GPT 系列拒答的形态与识别方法
  </Card>

  <Card title="内容安全如何合规性？" icon="shield-check" href="/faq/content-safety">
    平台内容安全与合规政策
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.