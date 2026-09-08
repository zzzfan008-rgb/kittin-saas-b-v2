> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Google 系模型走的是 AI Studio 还是 Vertex？

> API易 上 Nano Banana 等 Google 系图片模型默认分组走的是官转 AI Studio 线路；Vertex 作为独立算力池在 AIStudio 故障时顶上，二者双通道、互为冗余，本文整理事实与切换路径。

## 简短回答

**Nano Banana 等 Google 系模型的默认分组走的是「官转 AI Studio」线路；Vertex 作为独立算力池，在 AIStudio 出问题时顶上。两者是双通道、互为冗余**，不是二选一。

<Info>
  本文只整理**有官方文档或实时动态记录可查**的事实。如果你想了解背后的调度逻辑、上游算力池细节等不在文档范围内的内容，请联系客服。
</Info>

## 默认分组 = 官转 AI Studio

API易 自 2025 年 11 月 Nano Banana 上线以来，提供的 `gemini-3-pro-image`（Nano Banana Pro）、`gemini-3.1-flash-image`（Nano Banana 2）及 lite 系列**一直走官转 AI Studio 线路**，从未接入过逆向通道（详见 [实时动态 · 2026-07](/live/2026-07/nano-banana-pro-2-official-aistudio)）。

<Tip>
  **为什么强调"官转 AI Studio"**：Nano Banana 价格比官网低不少并不等于逆向——价格优势来自聚合调度与汇率差，不是来自绕过 Google 鉴权。
</Tip>

默认分组下绝大多数情况下**直接调用即可**，无需任何特殊配置。

## Vertex 在哪里？怎么开？

Vertex（Google Cloud 企业级通道）作为**独立算力池**，在 API易 上以独立分组的形式提供，可在创建或编辑令牌时按需选择。具体可用分组以控制台显示为准。

<Note>
  **关于出图体积**：Vertex 通道的 4K 出图体积比 AI Studio 通道大——Vertex 单张约 **20 MB**，AI Studio 单张约 **10 MB**，下载、存储与 CDN 带宽请按 20 MB 上限做容量规划（详见 [实时动态 · 2026-05-28](/live/2026-05/gemini-image-vertex-supply)）。
</Note>

## AIStudio 与 Vertex 是双通道、互为冗余

文档明确表述：**API易 为 Nano Banana 系列提供 AIStudio + Vertex 双通道冗余**，官方单通道异常时可由另一通道顶上、尽量保障服务可用性（[Nano Banana 使用指南](/api-capabilities/nano-banana-dev-guide)）。

实际触发切换的案例：

* **2026-06-19 案例**：谷歌 `AIStudio` 侧算力问题导致官方 2K / 4K 出糊图、1K 正常，**临时改用 Vertex 通道顶上**后 2K/4K 恢复正常（[实时动态 · 2026-06](/live/2026-06/nano-banana-2k-4k-via-vertex)）。
* **2026-05-28 案例**：Gemini 图片预览模型均切到 **Vertex 高价通道**保障供应，可用性回归稳定（[实时动态 · 2026-05](/live/2026-05/gemini-image-vertex-supply)）。

<Warning>
  **不要凭直觉判断「Vertex 永远不会受影响」**。Vertex 在 AIStudio 出问题时顶上不代表 Vertex 永远不会出故障——平台没有对 Vertex 给出"SLA 100% 不受影响"的承诺。遇到问题时仍以 `aistudio.google.com/status` 与本站实时动态为准。
</Warning>

## 怎么查上游是否在出问题？

最权威的入口是 Google 官方的 AI Studio 状态页：

> **`aistudio.google.com/status`**

该页面会发布 Gemini 系列模型的官方状态通报。例：

* **2026-06-19 15:54**：状态页标记为 Detected，原文「We are experiencing issues with Nano Banana 2 and Nano Banana Pro models on Gemini API and AI Studio when using 2k or 4k resolution. Investigation is underway.」（[实时动态 · 2026-06-19](/live/2026-06/aistudio-status-nano-banana)）

<Tip>
  **实战用法**：当客户报"Banana 慢了/出图有问题"时，先去 `aistudio.google.com/status` 看一眼是否有 Detected 通报，能 1 分钟定位是不是上游问题。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="默认号池都是 AI Studio 吗？还是 Vertex 和 AI Studio 都有？">
    默认分组（Default）**走的是官转 AI Studio 线路**，是 Nano Banana 等 Google 系图片模型的默认通道。Vertex 是独立的可选分组，**不在默认分组里**，需要切换到对应 Vertex 分组才走 Vertex。
  </Accordion>

  <Accordion title="Vertex 在哪个分组？怎么用 Vertex？">
    Vertex 在 API易 控制台里以**独立的可选分组**形式提供（具体分组名称以控制台为准）。新建或编辑令牌时，在「选择分组」里挑到 Vertex 相关的分组即可，调用方式不变，**代码层无需修改**。
  </Accordion>

  <Accordion title="Nano Banana 慢的时候，是不是 Vertex 受影响小一点？AI Studio 是影响最大的？">
    **从已有事件记录看，AI Studio 通道曾在 2026-06-19 出过 2K/4K 算力问题**，当时由 Vertex 顶上后恢复。但"Vertex 受影响小"目前**只针对已记录的几次 AIStudio 算力事件**——平台没有公开 Vertex 的 SLA 数据，也没有"Vertex 永远不受影响"的承诺。

    如果你的业务对成功率敏感，建议在令牌上**为 Nano Banana 模型挂兜底分组**（详见 [令牌与分组](/faq/token-and-groups)），主分组拥塞时自动切换备用通道。
  </Accordion>

  <Accordion title="怎么确认我的调用走的是哪条通道？">
    调用的具体通道**不会在响应里直接标注**。可以通过以下方式间接判断：

    1. 令牌设置里选的哪个分组，调用就走哪个分组的默认通道
    2. 看返回的图片体积——**AI Studio 4K 约 10 MB、Vertex 4K 约 20 MB**，差异较明显
    3. 遇到上游故障时参考 [实时动态](/live) 看平台切到了哪条通道
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="Nano Banana 使用指南" icon="book-open" href="/api-capabilities/nano-banana-dev-guide">
    Nano Banana 系列完整使用说明，含 AIStudio + Vertex 双通道冗余机制说明。
  </Card>

  <Card title="Nano Banana 价格总览" icon="tag" href="/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 第一代完整定价对比。
  </Card>

  <Card title="实时动态归档" icon="radio" href="/live/archive">
    平台每日运行状态、切通道、故障恢复等时间线记录。
  </Card>

  <Card title="令牌与分组" icon="key" href="/faq/token-and-groups">
    令牌分组、默认分组与兜底分组的设置规则。
  </Card>
</CardGroup>

<Tip>
  **客服联系**：本文档范围内未覆盖的 Vertex / AIStudio 调度细节、上游算力池容量、SLA 等信息，请通过企业微信客服或邮件 [hi@apiyi.com](mailto:hi@apiyi.com) 联系。
</Tip>
