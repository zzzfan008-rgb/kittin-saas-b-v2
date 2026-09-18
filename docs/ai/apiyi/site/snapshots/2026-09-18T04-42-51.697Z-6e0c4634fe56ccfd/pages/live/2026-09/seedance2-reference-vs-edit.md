> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 参考生视频被判成视频编辑？新增 FAQ 讲清怎么区分

> 新增 FAQ：Seedance 2.5 带参考视频时按提示词意图判定参考生视频、视频编辑或视频延长，判为编辑后 ratio 必须 adaptive、duration 必须 -1，否则提交即 400；没有参数能锁定为参考生视频，FAQ 给出三种稳妥写法。

**2026/9/17 19:47 (UTC+8)** · 文档更新 · ByteDance

📚 **Seedance 2.5 传了具体画幅和时长却报 400？多半是任务被判成了视频编辑**

真实工单：请求带一段 `reference_video`，提示词写「高清化视频，保持元素不变」，同时传了 `ratio: "4:3"`、`duration: 15`，提交即返回 400 `TaskTypeConstraint`。2.5 会按提示词意图把带参考视频的任务判为参考生视频、视频编辑或视频延长，编辑任务的画幅和时长锁定跟随原视频，`ratio` 必须是 `adaptive`、`duration` 必须是 `-1`。`omni_reference_task_type` 只有 `auto` / `edit` / `extend` 三个值，没有能锁定为参考生视频的选项。

新 FAQ 给出判定规则、提示词改写对照和三种稳妥写法（通用 `adaptive` + `-1`、改写提示词以固定画幅时长、代码兜底重试），见 [Seedance 2.5 参考生视频和视频编辑怎么区分？](/faq/seedance2-reference-vs-edit)。文档侧栏「Seedance 2.0 / 2.5」下新增「SD常见问题」子栏目，Seedance 相关 FAQ 已集中收录。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
