> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文档中心新增「图片API调用须知」分组，《必读&最佳实践》上线

> 文档中心图片 API 栏目新增「图片API调用须知」分组，首篇《必读&最佳实践》上线：所有图片模型均为同步调用，无异步任务 ID，断开连接结果丢失但仍计费，并附各模型 timeout 推荐值与 base64/URL 输出对照表。

**2026/7/15 12:49 (UTC+8)** · 文档更新

📚 **文档中心「图片 API（官转）」栏目新增「图片API调用须知」分组，首篇《必读&最佳实践》上线**

一句话核心结论：API易 所有图片模型均为**同步调用**——没有异步任务 ID、没有轮询接口，客户端提前断开连接则本次结果丢失但请求仍会计费，因此**留足 `timeout` 是图片 API 开发的第一原则**。页面给出各模型的 `timeout` 推荐值，以及 base64 与 URL 两种输出方式的对照表，入口见 [必读&最佳实践](/api-capabilities/image-api-best-practices)。

同时，原有的《[图片压缩与输出分辨率](/api-capabilities/image-compression-resolution)》《[如何生成满意图片](/api-capabilities/image-generation-success-tips)》两篇已一并归入该分组，图片相关通用须知集中一处更好找。

欢迎阅读，也欢迎反馈补充。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
