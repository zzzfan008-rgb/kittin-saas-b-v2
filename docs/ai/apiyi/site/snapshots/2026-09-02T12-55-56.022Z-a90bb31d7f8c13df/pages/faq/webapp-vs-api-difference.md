> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为什么官方网页版和 API 返回结果不同？

> 同一个模型，为什么 Claude、ChatGPT 官网聊得又准又聪明，API 调用却像变笨了？解释网页版的工程封装层，以及如何用 API 复刻网页版体验

## 简短回答

<Info>
  **模型是同一个，差别在于网页版在模型外面套了一整层「工程封装」。**

  打个比方：**网页版是精装修房，API 是毛坯房。**

  * **精装修房（claude.ai / chatgpt.com）**：已经装好了系统提示词、联网搜索、代码执行、文件解析、对话记忆、上下文管理——拎包入住。
  * **毛坯房（API）**：只交付最核心的模型能力（承重墙和水电），搜索、工具、记忆、上下文都需要开发者自己配置。

  所以"API 感觉变笨了"，通常不是模型被降级或换成了假模型，而是**你拿到的是没装修的毛坯房**。
</Info>

## 网页版到底多做了什么？

官方产品在模型之上叠加了大量看不见的工程层，这些能力**都不属于模型权重本身**，API 默认一个都不带：

<CardGroup cols={2}>
  <Card title="系统提示词（System Prompt）" icon="file-text">
    网页版每轮对话都会注入一段长达数千 token 的隐藏提示词，规定身份、语气、回答长度、格式偏好、拒答边界、Markdown 排版规则等。

    这是网页版"说话更像人、格式更漂亮、知道自己是谁"的最主要原因。
  </Card>

  <Card title="内置工具（Tools）" icon="wrench">
    联网搜索、网页抓取、代码执行沙箱（当计算器用）、文件与图片解析、图表绘制、Artifacts / Canvas……

    网页版遇到"今天的新闻""这串数字算一下"会自动调工具，API 不配置工具就只能靠模型硬答。
  </Card>

  <Card title="记忆与对话历史" icon="brain">
    网页版自动保存历史对话、跨会话记忆、项目知识库（Projects）。

    API 是**完全无状态**的：你不把上文放进 `messages` 里，模型就什么都不记得。
  </Card>

  <Card title="上下文管理与压缩" icon="scissors">
    长对话时网页版会自动摘要、裁剪、检索历史片段，保证不超限。

    API 需要你自己实现截断、摘要或 RAG 检索。
  </Card>

  <Card title="默认参数与思考档位" icon="settings">
    网页版帮你设定了 temperature、最大输出长度、思考预算（reasoning effort）等参数，有的产品还会根据问题**自动路由**到不同模型或思考档位。

    API 用的是默认值，往往和网页版不一致。
  </Card>

  <Card title="后处理与前端渲染" icon="monitor">
    引用角标、代码高亮、表格渲染、思维链折叠展示，都是前端做的。

    API 返回的是纯文本 / JSON，观感上天然"朴素"很多。
  </Card>
</CardGroup>

## 一张表看懂差异

| 能力          | 官方网页版     | 直接调用 API       |
| ----------- | --------- | -------------- |
| 模型权重        | 相同        | 相同             |
| 系统提示词       | 官方注入（不公开） | 无，需自己写         |
| 联网搜索        | 内置，自动触发   | 需自行开启工具或接搜索    |
| 计算 / 代码执行   | 内置沙箱      | 需自行实现工具调用      |
| 文件、图片解析     | 内置        | 需自己上传或转 Base64 |
| 对话记忆        | 自动保存      | 无状态，需自己传上文     |
| 上下文超限处理     | 自动压缩      | 需自己截断或摘要       |
| 参数（温度、思考预算） | 官方调好      | 使用默认值，需自己对齐    |
| 输出格式        | 前端美化渲染    | 纯文本 / JSON     |

## 常见的"结果不同"分别是什么原因？

<AccordionGroup>
  <Accordion title="API 不知道最新的新闻和事件">
    模型的知识截止到训练时间，网页版是靠**内置联网搜索**补齐时效信息的。

    API 默认不联网。解决方式：调用支持的搜索工具（如 `web_search`、`google_search`），或自己接一个搜索接口，把结果放进上下文。

    <Warning>
      联网搜索工具属于**按次计费**的付费能力，不含在模型 token 费用里，具体价格见 [模型倍率说明](/faq/model-multiplier)。
    </Warning>
  </Accordion>

  <Accordion title="API 算数、统计字数会算错">
    网页版遇到计算任务会悄悄写一段代码在沙箱里跑出结果。裸模型是"心算"，出错很正常。

    解决方式：给模型挂一个计算 / 代码执行工具，或在提示词里要求它列出计算步骤。
  </Accordion>

  <Accordion title="API 回答明显更短、格式更随意">
    网页版的系统提示词里有大量关于结构、长度、Markdown 排版的要求。

    解决方式：把你想要的风格写进自己的 System Prompt，例如"用小标题分段""先给结论再展开""代码必须带注释"。
  </Accordion>

  <Accordion title="API 里模型不知道自己是谁、说错版本号">
    模型权重里从来没有"我是谁"这条信息，网页版是靠系统提示词锚定的。

    详见：[为什么大模型不知道自己的版本号？](/faq/model-version-identity) 和 [为什么 Claude 会自称 Qwen 或 DeepSeek？](/faq/claude-identity-confusion)
  </Accordion>

  <Accordion title="API 回答「忘记」了前面说过的话">
    API 是无状态的，每次请求都是全新的对话。网页版帮你自动带上了历史。

    解决方式：把历史轮次完整放进 `messages` 数组再发送。注意这会增加输入 token，可配合[缓存计费](/faq/cache-billing)降低成本。
  </Accordion>

  <Accordion title="同样的问题，API 每次回答都不一样">
    这是采样随机性，不是故障。网页版同样如此，只是你不会连问两遍。

    解决方式：降低 `temperature`（如 0.2），或在提示词中明确输出格式约束。
  </Accordion>

  <Accordion title="API 的推理感觉更「浅」">
    很多网页版默认开启了较高的思考预算，而 API 的默认档位通常更低（甚至关闭）。

    解决方式：显式设置 `reasoning_effort` / `thinking` 等参数到 high，并适当调高最大输出长度，参见 [max\_tokens 说明](/faq/max-tokens)。
  </Accordion>
</AccordionGroup>

## 如何用 API 复刻网页版体验？

<Steps>
  <Step title="第一步：写好你自己的 System Prompt">
    这是投入产出比最高的一步。明确身份、语气、输出格式、回答长度、边界。

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    SYSTEM_PROMPT = """你是一个专业的技术助手。
    - 先给结论，再给理由
    - 使用 Markdown 小标题分段
    - 代码必须可运行并附关键注释
    - 不确定的信息要明确说明，不要编造"""
    ```
  </Step>

  <Step title="第二步：自己维护对话历史">
    把每一轮的用户输入和模型回复都追加到 `messages` 里，模拟网页版的"记忆"。

    ```python theme={null}
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    def chat(user_input):
        messages.append({"role": "user", "content": user_input})
        resp = client.chat.completions.create(
            model="claude-opus-5",
            messages=messages,
        )
        reply = resp.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        return reply
    ```
  </Step>

  <Step title="第三步：按需挂上工具">
    需要时效信息就接搜索，需要精确计算就接代码执行，需要查内部资料就接 RAG 检索。工具的定义与调用方式见 [Function Calling 文档](/api-capabilities/openai/function-calling)，联网搜索见 [Web Search 文档](/api-capabilities/openai/web-search)。
  </Step>

  <Step title="第四步：对齐参数">
    显式设置 `temperature`、`max_tokens`、思考档位等参数，不要依赖默认值。想要接近网页版的深度思考，通常需要把推理强度调高。
  </Step>

  <Step title="第五步：处理长上下文">
    对话变长后，做摘要压缩或只保留最近 N 轮 + 关键信息，避免超出上下文窗口。开启缓存可以大幅降低重复前缀的成本。
  </Step>
</Steps>

<Tip>
  **不想自己从零搭？** 直接使用成熟的客户端更省事——Cherry Studio、ChatWise、LobeChat、Cursor、Claude Code 等工具已经内置了系统提示词、历史管理、工具调用，把 API易 的 Base URL 和密钥填进去即可获得接近网页版的体验。配置方法见 [Base URL 配置说明](/faq/base-url-config)。
</Tip>

## 需要注意的边界

<Warning>
  **API 无法 100% 复刻网页版，这是客观限制：**

  1. **官方不公开系统提示词**，社区流传的版本只是逆向推测，且会随版本变化。
  2. **部分网页版功能不开放 API**，例如某些产品的记忆系统、Artifacts / Canvas 的完整交互。
  3. **网页版一直在做 A/B 实验**，同一天不同用户拿到的提示词和路由策略可能都不一样。
  4. **网页版可能自动换模型**：部分产品会把简单问题路由到更小更快的模型，而 API 是你指定哪个就用哪个——这也是"结果不同"的来源之一。

  反过来说，API 的优势正是**可控**：提示词、参数、工具、上下文全在你手上，结果可复现、可版本管理，这是做产品时必须的。
</Warning>

<Info>
  **API易 的角色**：API易 是纯粹的 API 网关，**请求原样透传、不注入任何提示词、不做任何改写**。所以你在 API易 得到的行为，与直连官方 API 一致——毛坯房就是毛坯房，我们不会偷偷装修，也不会偷偷拆墙。
</Info>

## 相关问题

<CardGroup cols={2}>
  <Card title="为什么大模型不知道自己的版本号？" icon="circle-question-mark" href="/faq/model-version-identity">
    模型身份问题的底层原理
  </Card>

  <Card title="为什么 Claude 会自称 Qwen 或 DeepSeek？" icon="venetian-mask" href="/faq/claude-identity-confusion">
    身份混淆现象的详细解释
  </Card>

  <Card title="如何选择合适的模型？" icon="compass" href="/faq/model-selection-guide">
    不同模型的特点与适用场景
  </Card>

  <Card title="Base URL 怎么配置？" icon="link" href="/faq/base-url-config">
    在各类客户端中接入 API易
  </Card>
</CardGroup>

## 联系我们

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    接入咨询、技术支持
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
