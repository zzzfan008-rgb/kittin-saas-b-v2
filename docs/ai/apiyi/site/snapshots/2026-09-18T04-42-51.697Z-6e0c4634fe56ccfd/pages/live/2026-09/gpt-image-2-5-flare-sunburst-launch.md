> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2.5 双模型官转上线：flare 更快、sunburst 编辑更强

> OpenAI 新一代出图模型 gpt-image-2.5-flare 与 gpt-image-2.5-sunburst 已在 API易 以官转形式上线，Default 分组可用，image2Enterprise 企业分组更稳。接入方式与官转 gpt-image-2 完全一致，价格同样按 tokens 计费。flare 出图速度更快，sunburst 图片编辑能力更强。官逆侧同步推出 gpt-image-2.5-all，来自 ChatGPT 网页版，价格与 gpt-image-2-all 相同。

**2026/9/9 10:53 (UTC+8)** · 新模型 · OpenAI

🚀 **`gpt-image-2.5-flare` 与 `gpt-image-2.5-sunburst` 官转已上线，`Default` 分组可直接调用**

两款都是 OpenAI 新一代 GPT 图像生成模型，当前分别指向 `gpt-image-2.5-flare-2026-09-08` 和 `gpt-image-2.5-sunburst-2026-09-08`。接入方式与官转 `gpt-image-2` 完全一致，同走 images API，把 `model` 换成新模型名即可；参数细节可参考官方文档 `developers.openai.com/api/docs/guides/image-generation`，或本站的 [gpt-image-2 官转接入指南](/api-capabilities/gpt-image-2/overview)。

价格与 `gpt-image-2` 相同，按 tokens 计费。两款按需自选，也可以放开给你的用户自行选择：

* `gpt-image-2.5-flare`：出图速度更快，适合对时延敏感的批量生成
* `gpt-image-2.5-sunburst`：图片编辑能力更强，适合改图、多图融合等编辑任务

分组方面，`Default` 默认分组可用；对稳定性要求高的生产任务可选 `image2Enterprise` 企业分组（1.2x），供给更稳，两个分组下模型名与端点不变。

官逆侧同步跟进：`gpt-image-2-all` 的来源已是 ChatGPT 网页版，本次顺带推出同名新模型 `gpt-image-2.5-all`，同样来自 ChatGPT 网页版逆向，价格与 `gpt-image-2-all` 保持不变（\$0.03/张按次计费），放在 `Default` 分组即可调用。

📖 完整规格、代码示例与选型建议：[GPT-image-2.5 上线：Flare 更快、Sunburst 更准](/news/gpt-image-2-5-launch)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
