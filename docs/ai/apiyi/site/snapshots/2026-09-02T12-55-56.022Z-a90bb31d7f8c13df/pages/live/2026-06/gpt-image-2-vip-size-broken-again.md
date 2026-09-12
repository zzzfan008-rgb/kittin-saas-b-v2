> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 的 size 又失效 · 暂时只能出 1K

> 因官方规则再次调整，gpt-image-2-vip 此前恢复的 size 又失效，传入尺寸被静默忽视，目前 1K 正常、2K/4K 无法识别。需要 4K/2K 或精准 size 控制的，目前只有官转 gpt-image-2 可用，该模型按输入/输出 tokens 计费而非按次。

**2026/6/23 11:03 (UTC+8)** · 模型状态 · OpenAI

⚠️ **`gpt-image-2-vip` 的 size 又失效 · 目前只能出 1K 图**

今天上午经客户反馈 + 我们实测与代码层面研究确认：受官方规则再次调整（上一次已调整过），`gpt-image-2-vip` 原本恢复的 size 又失效——1K 正常，但传入的 `size` 尺寸无法被识别、被静默忽视，暂时只能出 1K 图。我们会保持跟进与研究。

各通道当前状态（按需自选）：

* `gpt-image-2-vip`：1K 正常出图；传入的 `size` 暂被静默忽视，2K / 4K 无法识别
* 官转 `gpt-image-2`：支持 4K / 2K 与精准 `size` 控制，本站官转稳定运行；按输入 / 输出 tokens 计费，而非按次计费

感谢耐心等待，我们持续运维并跟进官方变化。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
