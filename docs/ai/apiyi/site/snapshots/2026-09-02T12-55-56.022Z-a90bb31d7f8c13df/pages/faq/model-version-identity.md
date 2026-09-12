> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为什么大模型不知道自己的版本号？

> 解释通过 API 调用时模型无法准确回答自身版本的原因，以及官网和 API 的区别

## 简短回答

<Info>
  **这是完全正常的现象，不影响模型能力。**

  模型的名字是训练完成后才命名的，模型本身从未"学习过"自己的身份信息。官方网页版（如 claude.ai、chatgpt.com）之所以能正确回答，是因为内置了 System Prompt 告知模型"你是谁"。通过 API 调用时默认没有这些信息，所以模型会"猜错"自己的版本。
</Info>

## 实际案例

<Warning>
  **常见场景**

  通过 API 调用 Claude Sonnet 4.5，问它"你是什么模型？"，它可能回答"我是 Claude 3.5 Sonnet"。这**不代表**你调用的模型有误，而是模型本身不知道自己的名字。

  同样的情况也出现在 GPT-4o、Gemini 等所有模型上——这是大模型的通用特性，而非 API易 的问题。
</Warning>

## 通俗理解

<Card title="演员类比" icon="drama">
  想象一位演技精湛的演员：

  * **能力**来自多年训练（相当于模型的训练过程）
  * **角色名字**由导演在开拍前告诉他（相当于 System Prompt）
  * 如果没人告诉他演什么角色，他虽然演技一流，但**不知道自己叫什么名字**

  大模型也是如此：能力来自训练数据，但"我是 Claude Sonnet 4.5"这个身份信息，需要额外告知。
</Card>

## 技术原理

<AccordionGroup>
  <Accordion title="为什么模型不知道自己的名字？">
    **模型命名发生在训练之后**

    大模型的开发流程是：

    1. **收集数据** → 准备训练语料
    2. **训练模型** → 学习语言理解和生成能力
    3. **评测调优** → 优化模型表现
    4. **命名发布** → 给模型起名字（如 "Claude Sonnet 4.5"）

    模型在第 2 步完成训练时，第 4 步的名字还不存在。模型的训练数据中可能包含旧版本模型的名字（如 Claude 3.5 Sonnet），所以被问到时会"猜"一个它见过的名字。

    **类比**：就像一个人在出生前不可能知道自己的名字——名字是出生后才取的。
  </Accordion>

  <Accordion title="官方网页版为什么能正确回答？">
    **内置 System Prompt 的作用**

    当你在 claude.ai 或 chatgpt.com 上对话时，官方网页会自动在每次对话开头注入一段隐藏的 System Prompt，类似：

    ```
    你是 Claude，由 Anthropic 开发。你的模型版本是 Claude Sonnet 4.5...
    ```

    这段提示词对用户不可见，但模型会"读到"它，从而知道自己是谁。

    **所以**：不是模型"天生"知道自己的名字，而是官方网页每次都在"提醒"它。
  </Accordion>

  <Accordion title="API 调用为什么不一样？">
    **API 调用默认不包含身份信息**

    通过 API 调用模型时，你发送的只有：

    * `model` 参数（告诉服务器调用哪个模型）
    * `messages` 数组（你的对话内容）
    * 可选的 `system` 参数（你自定义的系统提示词）

    `model` 参数是给**服务器**看的路由信息，模型本身读不到这个字段。如果你没有在 `system` 中告诉模型它是谁，模型就只能根据训练数据"猜测"。

    **这对所有 API 平台都一样**——无论是官方 API、API易，还是其他中转站，行为完全一致。
  </Accordion>
</AccordionGroup>

## 如何验证你调用的模型是否正确？

<CardGroup cols={2}>
  <Card title="查看调用日志" icon="file-text" href="/faq/call-logs">
    在 API易 控制台的**调用日志**中，可以看到每次请求实际使用的模型名称，这是最准确的验证方式。
  </Card>

  <Card title="查看 API 响应" icon="code">
    每个 API 响应的 JSON 中都包含 `model` 字段，明确标识了实际调用的模型版本。

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>
</CardGroup>

## API易 服务保障

<Tip>
  **API易 是官方渠道转发，模型质量与源头完全一致。**

  * API易 直接转发请求到 OpenAI、Anthropic、Google 等官方 API
  * 模型回答"不知道自己是谁"是所有 API 平台的通用现象
  * 您可以通过调用日志和 API 响应中的 `model` 字段确认实际调用的模型
  * 如有疑问，随时联系我们的技术团队验证
</Tip>

## 如何让模型正确回答自己的版本？

只需在 API 调用时添加 `system` 参数，告知模型它的身份即可：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://vip.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5-20250514",
    messages=[
        {
            "role": "system",
            "content": "你是 Claude Sonnet 4.5，由 Anthropic 开发的 AI 助手。"
        },
        {
            "role": "user",
            "content": "你是什么模型？"
        }
    ]
)

print(response.choices[0].message.content)
# 输出：我是 Claude Sonnet 4.5，由 Anthropic 开发。
```

<Info>
  **提示**：这和官方网页版的原理完全一样——通过 System Prompt 告知模型身份。添加后，模型就能正确回答"我是谁"了。
</Info>

## 相关问题

<CardGroup cols={2}>
  <Card title="如何选择合适的模型？" icon="compass" href="/faq/model-selection-guide">
    了解不同模型的特点和适用场景
  </Card>

  <Card title="为什么有些模型不可用？" icon="lock" href="/faq/model-availability">
    了解模型权限和用户组等级
  </Card>

  <Card title="如何查看调用日志？" icon="file-text" href="/faq/call-logs">
    验证实际调用的模型版本
  </Card>

  <Card title="API 调用报错怎么办？" icon="triangle-alert" href="/faq/invalid-api-key">
    常见 API 错误排查指南
  </Card>
</CardGroup>

## 联系我们

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    模型验证咨询、技术支持
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
