> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 13 个图片 / 视频模型上线「AI Agent 开发提示词」，复制一段话让 Codex 帮你接入

> 9 个出图模型与 4 个视频模型的 overview 页，概述下方新增一段可一键复制的提示词。粘给 Codex、Claude Code、Cursor，它会先抓该页纯文本版再按你项目技术栈写代码，超时值、返回值处理、上传压缩标准与各模型参数红线都已写进要求。六语种同步上线。

**2026/8/23 22:40 (UTC+8)** · 文档更新

🚀 **13 个图片 / 视频模型的文档页上线「AI Agent 开发提示词」，复制一段话就能让编程 Agent 替你接入或排查**

每个模型 overview 页的「概述」下方，新增了一段可一键复制的提示词。粘给 Codex、Claude Code、Cursor 等编程 Agent，它会先抓该页纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码，而不是照搬文档里的示例。

提示词把每个模型最常被踩的接入红线写死了：

* **超时值**：图片与视频耗时差异很大，默认 30-60 秒的客户端超时会掐断正常请求，而断连的请求仍然计费
* **返回值怎么拿**：出图多为 base64，`FLUX` 只给约 10 分钟就失效的 URL；视频是异步轮询加 24 小时签名直链，都要立即转存
* **上传前压缩**：统一按长边 2048px、质量 0.9 的标准，避免手机原图直传
* **各模型参数红线**：如 `gpt-image-2` 不要传 `auto`、VEO 不要传 `generateAudio`、Wan 不能走 `/v1/videos`

覆盖出图的 `gpt-image-2` 三兄弟、Nano Banana Pro / 2 / Lite、FLUX、Seedream、Grok Imagine，以及视频的 Seedance 2.0、Wan2.7、HappyHorse、VEO 3.1 官转。新接入可以照着一次跑通，已接入但出问题时，也能拿它做一次排查体检。

六个语种同步上线。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
