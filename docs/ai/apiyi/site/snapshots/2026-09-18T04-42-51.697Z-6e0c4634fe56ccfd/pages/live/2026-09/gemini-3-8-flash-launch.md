> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3.8-flash 上线，与 3.7 同价平迁

> 谷歌 9 月 2 日推出的新一版 Flash 已在 API易 开放调用，官方模型文档与发布博客尚未收录这一版。定价与 gemini-3.7-flash 逐项一致，上线前完成 150 例双协议成对实测，能力与 3.7 逐项对齐。

**2026/9/2 22:43 (UTC+8)** · 新模型 · Google

🚀 **`gemini-3.8-flash` 已上线，API易 率先开放调用**

谷歌 9 月 2 日推出的新一版 Flash，距 3.7 Flash 仅约三周。**官方模型文档与发布博客目前都还没有收录这一版**，所以官方基准分数与上下文规格暂无权威口径，我们不做转述也不做推测。

定价与 `gemini-3.7-flash` 逐项一致：输入 \$0.75 / 输出 \$3.75 每百万 tokens、缓存读取 \$0.0750。**从 3.7 平迁只改模型名，请求结构、参数与返回字段都不变，零成本变化。**

正因为官方规格未公布，我们把上线前的验证做实了：以 3.7 Flash 为参照做成对对比，每个用例两个模型同时发起，共 **150 份用例日志、198 次调用**，覆盖 Gemini 原生与 OpenAI 兼容双协议。结果是核心能力、推理、并行工具调用、图片与视频理解逐项对齐，响应字段集差异仅 1 组且无字段类型变化，**未发现 3.8 独有的能力回退**。

`default` / `svip` 两个分组、OpenAI 兼容与 Gemini 原生两个端点均已可用。长上下文重度依赖的场景，建议等官方规格公布后再全量切换，先小流量灰度更稳妥。

📖 完整实测数据与迁移建议：[Gemini 3.8 Flash 上线：API 率先开放调用](/news/gemini-3-8-flash-launch)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
