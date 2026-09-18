> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3.8-flash 官方参数表已公布

> 谷歌模型文档已收录 gemini-3.8-flash：输入上限 1,048,576 tokens、输出上限 65,536，支持文本 / 图片 / 视频 / 音频 / PDF 输入，思考档位只有 low / medium / high。API易 已于 9 月 2 日晚上线，双分组双端点可用。

**2026/9/3 10:50 (UTC+8)** · 新模型 · Google

📊 **谷歌已公布 `gemini-3.8-flash` 官方参数表，此前「上下文规格官方未公布」的说明可以撤销了**

模型文档页 `ai.google.dev/gemini-api/docs/models/gemini-3.8-flash` 已上线，关键规格如下（数据来源：谷歌官方文档，2026/9/3 抓取）：

| 项目          | 官方口径                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| 模型代码        | `gemini-3.8-flash`                                                       |
| 输入类型        | 文本、图片、视频、音频、PDF                                                          |
| 输出类型        | 文本                                                                       |
| 输入 token 上限 | 1,048,576                                                                |
| 输出 token 上限 | 65,536                                                                   |
| 思考          | 支持 `low` / `medium` / `high`；**`minimal` 不支持，传了直接报错**                    |
| 支持的能力       | 缓存、代码执行、Computer use（预览）、文件搜索、函数调用、Google Maps 接地、搜索接地、结构化输出、URL context |
| 不支持的能力      | 音频生成、图片生成、Live API                                                       |
| 消费选项        | Batch API、Flex、Priority 均支持（谷歌自家采购模式，与 API易 分组无对应关系）                     |

`minimal` 报错这一条与我们上线前实测一致：原生端点返回 400 `Thinking level is unsupported`，要完全关闭思考请用 `thinkingConfig: {"thinkingBudget": 0}`。OpenAI 兼容端传 `reasoning_effort: "minimal"` 不报错但会被静默忽略、思考照常计费，从 3.6 Flash 迁过来的代码请自查。

API易 已于 9 月 2 日晚上线该模型，`default` / `svip` 两个分组、OpenAI 兼容与 Gemini 原生两个端点均可用，定价与 `gemini-3.7-flash` 逐项一致。100 万 token 上下文有了官方背书，上一条「长上下文场景建议等官方规格再全量切换」的保留意见可以解除。

📖 上线播报与 150 例实测：[gemini-3.8-flash 上线，与 3.7 同价平迁](/live/2026-09/gemini-3-8-flash-launch) · 接入文档：[Gemini 3.8 Flash 概览](/api-capabilities/gemini-3-8-flash/overview)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
