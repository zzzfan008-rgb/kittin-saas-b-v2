> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 出图报 safety_violations=[sexual] 但提示词并不色情？新增《内容安全排查篇》

> 新增《内容安全拦截排查》文档。gpt-image 系列的 sexual 拦截多发生在成图之后，失败耗时与成功一样长、同一提示词时过时不过，moderation: low 对它无效；用分词消融法 20 次实测定位到触发词，原句只加一句服装描述即 3/3 通过。

**2026/9/14 23:56 (UTC+8)** · 文档更新 · OpenAI

📚 **出图被 safety system 拦下，多数不是提示词违规，是某个词把「成图」推过了线**

真实工单：`gpt-image-2.5-sunburst` 生成「美艳女主 + 全身三视图 + 纯白背景」的角色设定图，API 稳定返回 400 `safety_violations=[sexual]`，ChatGPT 网页版却能出。实测发现失败耗时 42～51 秒与成功 46～57 秒无区别，说明图先生成、再被输出侧分类器拦下，所以同一提示词会时过时不过，`moderation: low` 也管不到它。网页版能过，是对话模型先改写扩充了提示词（自动补上服装、场景），API 是原文直达。

用分词消融法一次只动一个词、并行跑变体，20 次调用定位到触发词是「美艳」；**原句一字不动，只加一句「身穿米色高领针织衫和深色长裤」，3/3 通过**，人物气质与构图不变。

完整案例、耗时判层级表、20 次消融记录与通用排查清单见新页《内容安全排查篇》：`/api-capabilities/image-safety-troubleshooting`。`gpt-image-2` 概览的常见问题与错误码表已同步更新。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
