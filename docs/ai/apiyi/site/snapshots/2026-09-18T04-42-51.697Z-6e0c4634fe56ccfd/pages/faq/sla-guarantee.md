> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI 有 SLA 保障吗？

> API易提供务实的 SLA 保障：大用量图像客户的异常计费补偿、我方问题导致损失的额度补发，企业客户还可在合同中约定 SLA 内容与赔偿上限。

## 简短回答

**有，按需求提供。**

客观地说，当前 AI 行业没有任何厂商能承诺 99.99% 的 SLA（连 OpenAI、Claude 原厂也做不到）。API易 不做无法兑现的承诺，而是提供**能真正落地的保障**：对大用量图像客户的异常计费补偿、我方问题导致损失的额度补发，以及企业合同内可约定的 SLA 与赔偿上限。

## 一个客观前提

<Info>
  **为什么不直接承诺 99.99%？**

  AI 发展日新月异，上游模型频繁更新、限流、调整策略。**即便是 OpenAI、Claude 原厂，也无法做到 99.99% 的 SLA**，这是整个行业的客观事实。

  与其给出无法兑现的数字，我们更愿意提供**清晰、可执行**的保障机制，确保客户在出现问题时不会白白损失。
</Info>

## 我们提供的 SLA 保障

<CardGroup cols={2}>
  <Card title="大用量图像客户异常计费补偿" icon="image">
    针对 **Nano Banana Pro / 2**、**GPT-Image-2.5 / 2 系列** 大用量客户（月消耗 \$10,000 以上），对明显异常的计费（如超时却计费）核对并补偿。
  </Card>

  <Card title="我方问题额度补发" icon="rotate-ccw">
    明显由我方原因（如后端服务器异常）造成客户损失的，我们**统一导出日志、补发额度**，让用户不白白损失。
  </Card>

  <Card title="企业合同约定 SLA" icon="file-pen">
    企业客户可在合同中**约定 SLA 保障内容与赔偿上限**，对双方都是一份明确的保障。
  </Card>

  <Card title="实时状态透明" icon="radio-tower">
    服务状态与异常公告在「实时动态」公开发布，便于客户随时了解上游与平台状况。
  </Card>
</CardGroup>

### 1. 大用量图像客户的异常计费补偿

针对 **Nano Banana Pro / 2**、**GPT-Image-2.5 / 2 系列** 等图像模型的大用量客户（**月消耗 \$10,000（约 1 万美金）以上**可参与），我们对**明显异常的计费**提供补偿保障。

**举个例子**：图像请求**异常超时**（例如超过 300 秒）但系统仍按出图**计费**了——这类明显异常的计费，我们会核对日志并予以补偿，不让大用量客户白白买单。

<Note>
  **这只是一个示例场景，并非出图时限承诺。**

  我们**无法承诺"300 秒内一定出图、否则赔付"**——AI 图像生成受上游波动影响，无法对出图速度做硬性承诺。这项保障针对的是**明显异常计费造成的损失**，而不是保证生成速度。具体范围请联系客服确认。
</Note>

### 2. 我方问题导致损失的额度补发

如果损失是**明显由我方原因造成**的，我们会主动补偿。典型场景：

* **后端服务器异常**导致客户额度损失
* **图片模型异常超时**仍返回了数据并计费

**我们的承诺**：对于明显的我方问题对客户造成影响的情况，我们会**统一导出日志、核对受影响范围，并补发额度**给受影响的客户，确保用户不会白白损失。

<Warning>
  **界定原则**：该补发针对的是**明显可归因于我方的问题**（如平台后端异常）。上游官方的内容审核拦截、上游限流等**非我方可控因素**，处理方式以对应说明为准（例如部分上游审核拦截本身不计费）。
</Warning>

### 3. 企业合同内约定 SLA

对于企业客户，可以在**合同中明确约定** SLA 的具体内容，包括：

* 保障范围与可用性指标
* 故障响应与处理时效
* **赔偿上限**等条款

这样，SLA 保障与责任边界在签约时即清晰确定，**对客户和 API易 双方都是一份明确的保障**。

## 常见问题

<AccordionGroup>
  <Accordion title="为什么不能保证 99.99% 的 SLA？">
    AI 行业上游模型频繁更新、限流和调整，**连 OpenAI、Claude 原厂都无法做到 99.99%**，这是客观事实。我们不做无法兑现的承诺，而是用清晰可执行的补偿机制来保障客户利益。
  </Accordion>

  <Accordion title="大用量图像客户的异常计费补偿怎么参与？">
    该保障面向 **Nano Banana Pro / 2、GPT-Image-2.5 / 2 系列等图像模型的大用量客户**，**月消耗 \$10,000 以上**可参与，针对明显异常的计费（例如请求超时却仍按出图计费）进行核对补偿。**这不是"300 秒内必出图否则赔付"的承诺**，而是对异常计费损失的补偿。具体请联系客服开通与对接。
  </Accordion>

  <Accordion title="我方问题导致的损失怎么补？">
    对于明显由我方原因（如后端服务器异常、图片模型异常超时返回数据）造成的损失，我们会**统一导出日志、核对受影响范围并补发额度**，让用户不白白损失。
  </Accordion>

  <Accordion title="企业可以在合同里约定 SLA 吗？">
    可以。企业客户可在合同中约定 **SLA 保障内容与赔偿上限**，让保障范围和责任边界在签约时就清晰确定，对双方都是保障。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="实时动态" icon="radio-tower" href="/live/index">
    服务状态与异常公告
  </Card>

  <Card title="企业客户如何充值？" icon="landmark" href="/faq/enterprise-recharge">
    对公充值与合同签订
  </Card>

  <Card title="退款政策" icon="rotate-ccw" href="/faq/refund-policy">
    原路退款规则与申请流程
  </Card>

  <Card title="企业客户和个人用户有什么区别？" icon="building-2" href="/faq/enterprise-vs-individual">
    企业账号、多令牌与内部共享
  </Card>
</CardGroup>

## 联系我们

<Card title="企业微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  SLA 保障开通、合同条款约定、额度补发等需求，欢迎联系：

  * [联系企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 邮箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
