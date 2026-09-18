> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 模型名称后缀 -c 是什么意思？

> 解释 gemini-3-pro-image-preview-c 等带 -c 后缀模型名称的含义和计费区别

## 简短回答

<Info>
  **`-c` 代表 "call"（按次计费）。**

  带 `-c` 后缀的模型名称（如 `gemini-3-pro-image-preview-c`）和不带后缀的版本（如 `gemini-3-pro-image-preview`）本质上是**同一个模型**，能力完全一致。区别仅在于计费方式：`-c` 版本专门用于**按次计费**。而目前 Nano Banana Pro 也仅支持按次计费。
</Info>

## 官方解释

<img src="https://mintcdn.com/apiyillc/-8MuET9SQdeEzoC1/images/model-name-suffix-c-explain.png?fit=max&auto=format&n=-8MuET9SQdeEzoC1&q=85&s=892eb766d8a1d4f3ebd5a249d21b1d5a" alt="模型名称 -c 后缀解释" width="1062" height="476" data-path="images/model-name-suffix-c-explain.png" />

核心要点：

* `-c` 是按次计费（call）的单独模型名称
* 本质上和不带后缀的版本是**同一个模型**
* 都是官方转发，只是用不同模型名来区分计费方式
* 未来可能只用令牌计费模式区分

## 为什么会有 -c 后缀？

API易 正在推出按量计费模式，部分模型同时支持按量和按次两种计费方式。为了区分不同计费通道，系统使用模型名称后缀来标识：

| 模型名称                           | 计费方式 | 说明            |
| ------------------------------ | ---- | ------------- |
| `gemini-3-pro-image-preview`   | 按量计费 | 根据 Token 用量计费 |
| `gemini-3-pro-image-preview-c` | 按次计费 | 每次调用固定价格      |

<Note>
  两个名称调用的是**完全相同的官方模型**，都是官方转发，模型能力和输出质量没有任何区别。
</Note>

## 如何选择？

<CardGroup cols={2}>
  <Card title="按量计费（无后缀）" icon="chart-line">
    **适合场景**：

    * 输入输出 Token 数量较少的请求
    * 需要精确控制成本
    * 主要做文本理解/分析任务

    使用不带 `-c` 的模型名称
  </Card>

  <Card title="按次计费（-c 后缀）" icon="hand">
    **适合场景**：

    * 图片生成等固定输出场景
    * 希望每次调用成本透明固定
    * 不想计算 Token 消耗

    使用带 `-c` 的模型名称
  </Card>
</CardGroup>

<Tip>
  **推荐做法**：创建令牌时选择"**按量优先**"计费模式，系统会自动为您选择最合适的计费方式，无需手动区分模型名称后缀。详见 [令牌计费模式说明](/faq/token-billing-modes)。
</Tip>

## 未来计划

<Info>
  API易 正在持续优化计费体系。未来可能**仅通过令牌的计费模式**来区分按量/按次计费，届时无需再关注模型名称后缀。具体调整请关注平台公告。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="带 -c 后缀的模型和不带后缀的是同一个模型吗？">
    **是的，完全是同一个模型。**

    `-c` 只是计费通道的标识，不影响模型能力。两个名称最终都会转发到相同的官方 API，输出质量完全一致。
  </Accordion>

  <Accordion title="我应该用哪个模型名称？">
    取决于您的令牌计费模式：

    * **按量优先令牌**：使用不带后缀的名称（如 `gemini-3-pro-image-preview`），系统自动处理
    * **按次计费令牌**：使用带 `-c` 的名称（如 `gemini-3-pro-image-preview-c`）
    * **不确定**：推荐使用"按量优先"令牌 + 不带后缀的模型名称
  </Accordion>

  <Accordion title="所有模型都有 -c 版本吗？">
    不是。只有同时支持按量和按次两种计费方式的模型才会有 `-c` 后缀版本。纯文本模型（如 GPT-4o、Claude）通常只支持按量计费，不会有 `-c` 版本。
  </Accordion>

  <Accordion title="-c 后缀会一直存在吗？">
    API易 正在调整计费体系，未来可能不再需要通过模型名称后缀区分计费方式，改为完全通过令牌计费模式来控制。建议使用"按量优先"令牌，这样无论后续如何调整都不受影响。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="令牌计费模式详解" icon="calculator" href="/faq/token-billing-modes">
    了解按量优先、按次计费等 5 种计费模式的区别
  </Card>

  <Card title="如何创建令牌？" icon="key" href="/faq/token-management">
    创建和管理 API 令牌的完整指南
  </Card>
</CardGroup>
