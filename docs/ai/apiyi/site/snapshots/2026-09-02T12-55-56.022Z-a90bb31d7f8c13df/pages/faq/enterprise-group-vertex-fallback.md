> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 什么是企业分组（Enterprise）？什么时候该用？

> API易 上企业分组是**模型专属**的：gpt-image-2 用 image2Enterprise（1.2x）、Nano Banana 用 NanoBananaEnterprise（1.4x）或 NanoBananaReverse（0.8x）。本文整理各模型企业分组的差异、倍率与适用场景。

## 简短回答

**API易 上的"企业分组"不是一个通用分组，而是每个模型各自专属的企业兜底通道。** 它们通常比默认分组贵一点，但默认分组饱和时企业分组仍可正常出图，是高成功率业务的兜底选项。

<Info>
  本文只整理**有官方文档或实时动态记录可查**的事实。SLA、并发上限等未公开数据请联系客服。
</Info>

## 企业分组是"模型专属"的

跟「ClaudeCode」「Sora2Official」这类**通用分组**不同，企业分组是按模型分别命名的：

| 模型                  | 企业分组名                  | 倍率   | 通道性质                                                                                |
| ------------------- | ---------------------- | ---- | ----------------------------------------------------------------------------------- |
| gpt-image-2         | `image2Enterprise`     | 1.2x | **OpenAI 上游**企业兜底（[实时动态 · 2026-05-13](/live/2026-05/gpt-image-2-default-saturated)） |
| Nano Banana Pro / 2 | `NanoBananaEnterprise` | 1.4x | Google 高可用兜底（[图像与视频模型总览](/api-capabilities/image-video-models)）                     |
| Nano Banana Pro / 2 | `NanoBananaReverse`    | 0.8x | **逆向 Vertex** 通道（[实时动态 · 2026-06](/live/2026-06/nanobanana-reverse)）                |

<Tip>
  **重要澄清**：企业分组**不等于 Vertex 兜底**。`image2Enterprise` 是 OpenAI 上游的企业兜底，跟 Google Vertex 没关系；`NanoBananaReverse` 才是走 Vertex 的逆向通道；`NanoBananaEnterprise` 是高可用兜底，具体通道组成未在文档中明示。
</Tip>

## 默认分组饱和时，企业分组仍能出图

`gpt-image-2` 的实际案例：

* **2026-05-13 14:29–14:31** 调用日志：9 条非流式调用**全部路由到 `image2Enterprise` 企业分组**，首字节 35-293 秒不等、1.2x 倍率，仍可正常出图（[实时动态 · 2026-05](/live/2026-05/gpt-image-2-default-saturated)）。
* 同时 `gpt-image-2` 默认分组饱和时，"**部分默认分组请求已通过兜底路由进入企业分组**"，印证企业分组作为兜底通道的设计（同一篇动态描述）。

`NanoBananaReverse` 的设计目的（[实时动态 · 2026-06](/live/2026-06/nanobanana-reverse)）：

> 为缓解官方直转 Nano Banana Pro / 2 在部分高峰时段的影响，新增逆向 Vertex 分组 NanoBananaReverse，默认分组的 8 折（倍率 0.8x），不分辨率仅按次计费。

<Warning>
  **"企业分组 = 一定稳定"的承诺不存在**。官方文档明确：gpt-image-2 企业分组（官转 OpenAI API）也曾在 2026-05-07 出现「`The server had an error while processing your request.`」报错，根因是 OpenAI 上游故障（[实时动态 · 2026-05](/live/2026-05/gpt-image-2-upstream-error)）。企业分组**降低**默认分组拥塞的影响，但不保证上游永远稳定。
</Warning>

## 怎么切换到企业分组？

企业分组是**令牌级别**的设置：

1. 打开 [https://api.apiyi.com/token](https://api.apiyi.com/token)
2. 找到目标令牌 → 点操作列的「管理（扳手图标）」→「编辑令牌」
3. 「选择分组」里选对应的企业分组（如 `image2Enterprise`、`NanoBananaEnterprise`、`NanoBananaReverse`）
4. 保存

代码层无需任何改动。详细教程见 [实时动态 · 2026-04 · image2-enterprise](/live/2026-04/image2-enterprise)（gpt-image-2 案例，其它模型分组切换路径一致）。

<Tip>
  **NanoBananaReverse 适用范围**：仅支持 `gemini-3-pro-image`（Nano Banana Pro）与 `gemini-3.1-flash-image`（Nano Banana 2），且**仅按次计费**。如果你的 Nano Banana Pro 用了按量计费令牌，这个分组不适用。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="Enterprise 是 Vertex 吗？">
    **不一定**，要看是哪个模型的企业分组：

    * `image2Enterprise`（gpt-image-2 专属）—— **不是 Vertex**，是 OpenAI 上游的企业兜底
    * `NanoBananaEnterprise`（Nano Banana 专属）—— 文档未明示是否走 Vertex
    * `NanoBananaReverse`（Nano Banana Pro / 2）—— **明确走逆向 Vertex**

    不要把"企业分组"和"Vertex 兜底"画等号。
  </Accordion>

  <Accordion title="哪些模型有企业分组？">
    有官方文档/动态可查的：

    * gpt-image-2：`image2Enterprise`（1.2x）
    * Nano Banana Pro / 2：`NanoBananaEnterprise`（1.4x）、`NanoBananaReverse`（0.8x）
    * Nano Banana OSS（输出 URL）：`NB-OSS`（1x，但属内测，需联系客服开通可见分组；[Nano Banana OSS 分组](/api-capabilities/nano-banana-oss-group)）

    具体可用分组**以控制台显示为准**——平台可能会新增/调整分组名。
  </Accordion>

  <Accordion title="什么时候需要切到企业分组？">
    已记录的几类典型场景：

    * 默认分组持续饱和 / 排队 / 超时（如 gpt-image-2 在 2026-05 的情况）
    * 对成功率敏感、不希望默认分组失败拖累业务
    * Nano Banana Pro / 2 在高峰时段体验不佳，可考虑 `NanoBananaReverse`（按次、0.8x、更便宜）

    反过来，**默认分组资源充裕时没必要特意切企业分组**：gpt-image-2 在 2026-05-23 默认分组补充资源后，"**可直接调用，无需特意切到 image2Enterprise 企业分组**"（[实时动态 · 2026-05](/live/2026-05/gpt-image-2-default-restocked-0523-2142)）。
  </Accordion>

  <Accordion title="企业分组一定比默认分组贵吗？">
    不一定。从已有数据看倍率有高有低：

    * `image2Enterprise`：1.2x（比默认贵约 20%）
    * `NanoBananaEnterprise`：1.4x（比默认贵约 40%）
    * `NanoBananaReverse`：**0.8x**（比默认**便宜**20%）

    所以"企业"不等于"贵"——具体倍率要看是哪个模型、哪个分组。
  </Accordion>

  <Accordion title="我能同时配 Default + Enterprise 做兜底吗？">
    可以。令牌支持 **1 个默认分组 + 最多 2 个兜底分组**（详见 [令牌与分组](/faq/token-and-groups)），主分组拥塞时自动切换备用通道。这是"高成功率业务"推荐的标准做法。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="令牌与分组" icon="key" href="/faq/token-and-groups">
    令牌作用、创建/编辑、默认分组与兜底分组的设置规则。
  </Card>

  <Card title="Nano Banana 使用指南" icon="book-open" href="/api-capabilities/nano-banana-dev-guide">
    Nano Banana 系列完整说明，含 AIStudio + Vertex 双通道冗余机制。
  </Card>

  <Card title="实时动态归档" icon="radio" href="/live/archive">
    平台每日状态、切通道、故障恢复时间线记录。
  </Card>

  <Card title="Nano Banana 价格总览" icon="tag" href="/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 第一代定价对比。
  </Card>
</CardGroup>

<Tip>
  **客服联系**：本文档未覆盖的企业分组 SLA、并发上限、新模型企业分组上线计划等，请通过企业微信客服或邮件 [hi@apiyi.com](mailto:hi@apiyi.com) 联系。
</Tip>
