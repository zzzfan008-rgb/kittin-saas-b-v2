> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 服装换装时印花变形如何优化？

> 服装换装场景下提示词优化、参考图权重设置、多轮抽卡与跨通道兜底，附正反提示词对比与排查步骤

## 简短回答

Nano Banana Pro 印花变形不是模型坏了，而是**单次生成本身有随机性 + 提示词越界**两个原因叠加。实用上按以下顺序处理：

1. 先在 [imagen.apiyi.com](https://imagen.apiyi.com) 用同一提示词 + 参考图自测一次，排除客户端问题
2. 改写提示词：去掉"严格锁定""逐像素还原"等绝对化表述，改用具体颜色 / 位置 / 保留项描述
3. 上传清晰、特征明确的参考图，**使用 Base64 编码**（Nano Banana 系列不支持 OpenAI 格式 URL 直传）
4. 启用多轮抽卡：建议业务代码对同一提示词做 1\~3 次自动重试
5. 还不行就换通道或换模型：banana pro 默认走 AI Studio，可切 [Vertex 分组](/faq/google-upstream-aistudio-vertex)；或试 [gpt-image-2 系列](/api-capabilities/gpt-image-2-all/image-edit)（改图风格更贴近原图）

## 为什么印花会变形

AI 生图是**单次原子采样**，每次调用都是一次独立抽样，没有"严格还原"这一档开关。高频踩坑的原因有两类：

* **提示词表述越界**：用"严格锁定不变""逐像素还原""1:1 还原"这类绝对化措辞，模型反而会理解成"重画一遍"，把印花一起重画
* **参考图传错了方式**：Nano Banana 系列**只支持 Base64 编码上传**，把 URL 直接塞进 OpenAI 兼容格式的 `image_url` 字段会让模型"看不见"参考图，印花自然变形

<Info>
  即使你描述得再详细，AI 仍然有约 5%\~15% 的概率在单次采样里"走偏"。这不是模型不行，而是**生成式模型的固有特性**——同提示词多次调用，结果天然不同。
</Info>

## 具体排查步骤

<Steps>
  <Step title="在测试工具复现，排除客户端问题">
    打开 [imagen.apiyi.com/#generate](https://imagen.apiyi.com/#generate)，用**完全相同的提示词 + 参考图**重新跑一次：

    * 工具上印花也变形 → 大概率是**提示词本身**的问题，进 Step 2
    * 工具上印花保持得很好 → 排查你的接入方式（图片是否真的传进去了、参数是否对），见 [图片与参考图差异过大排查](/faq/image-result-differs-from-reference)
  </Step>

  <Step title="改写提示词，去掉绝对化表述">
    把"严格还原""逐像素"这种命令式措辞，换成**具体属性描述**（见下方"提示词优化示例"）。
  </Step>

  <Step title="确保参考图正确上传">
    * Nano Banana 系列**不支持 OpenAI 格式的 URL 上传**，必须用 **Base64** 编码
    * 参考图本身要**清晰、特征明确**：模糊或元素过多的参考图会让模型"猜"，印花更容易变形
    * 单张图 ≤ **7MB**（Gemini 官方限制），建议上传前做无损压缩
    * 每个提示词最多 **14 张参考图**；如果只想保留印花，可只传 1 张含印花的局部图，提高权重
  </Step>

  <Step title="启用多轮抽卡（自动重试）">
    在业务代码里对同一提示词实现 **1\~3 次自动重试**。一次失败不代表模型不行，多抽几次命中率显著上升。
  </Step>

  <Step title="换通道或换模型兜底">
    * 切到 **Vertex 分组**（在控制台给令牌选 Vertex 分组即可，代码无需改动）——Vertex 渠道审核尺度与 AI Studio 不同，部分"被安全误伤"的换装请求能稳定通过
    * 或换 **gpt-image-2 系列**——改图风格更贴近原图，色偏和风格漂移更小，适合"尽量接近原图"的需求
  </Step>
</Steps>

## 提示词优化示例

下表是服装换装 + 印花保留场景下的常见问题改法对比：

| 写法     | ❌ 反面示例       | ✅ 改进写法                          |
| ------ | ------------ | ------------------------------- |
| 颜色具体化  | "换成黑色"       | "改为**哑光纯黑色**，保留原有材质质感"          |
| 印花描述位置 | "印花必须严格锁定不变" | "胸前印花**位置、颜色、比例、构图**全部保持不变"     |
| 保留项清单  | "其他不变"       | "画面其余所有物体的**颜色、位置、文字标注**全部保持不变" |
| 动作拆分   | 一句话堆 5 个动作   | 拆成多步编辑，**每次只改一件事**              |

**改进后的完整提示词示例**：

> 编辑这张图，完成两件事：① 把红色方框内的两只茶壶改为哑光纯黑色，保留原有材质质感和形状；② 删除红色方框线本身。画面其余所有物体的颜色、位置、尺寸标注和文字**全部保持不变**。

<Tip>
  **通用原则：一次只改一类东西**。如果你的换装同时涉及"换色 + 换背景 + 加文字"，拆成多次编辑，每次的成功率都会显著高于一次堆复杂指令。
</Tip>

## 关于出图变红 / 整体偏色

如果你发现换装后画面整体偏红或偏暖，那是另一个问题，根因通常是 [banana pro 改图后画面偏红](/faq/banana-pro-edit-red-cast)——和"印花变形"的成因不同，解决路径也不同（切 Vertex 通道或换 gpt-image-2）。

## 相关文档

* [Nano Banana 系列开发指南](/api-capabilities/nano-banana-dev-guide) — 模型清单、计费、Base64 上传要求
* [图片与参考图差异过大排查](/faq/image-result-differs-from-reference) — 参考图传错格式的排查
* [Google 系模型走 AI Studio 还是 Vertex](/faq/google-upstream-aistudio-vertex) — Vertex 分组切换方法
* [如何生成满意的图片](/api-capabilities/image-generation-success-tips) — 改提示词、重试、换模型、测试定位四大策略
* [Gemini 生图 API 错误处理指南](/api-capabilities/gemini-image-error-handling) — 出图失败/被拦截的排查
* [Nano Banana 系列出图失败常见原因](/faq/nano-banana-image-failure) — 内容安全拦截场景
* [banana pro 改图后画面偏红怎么办](/faq/banana-pro-edit-red-cast) — 整体偏色问题

## 联系客服

如果按以上步骤仍然无法解决，可在工作台联系客服或邮件 [hi@apiyi.com](mailto:hi@apiyi.com)，提供：

* 同一提示词在 [imagen.apiyi.com](https://imagen.apiyi.com) 工具上的复现结果（截图或链接）
* 当前使用的模型名（`gemini-3-pro-image-preview` / Nano Banana 2 等）
* API 调用时间 + 请求 ID（如有）
