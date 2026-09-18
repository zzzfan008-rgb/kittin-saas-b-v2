> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 新增 NanoBananaReverse 逆向分组 · 默认 8 折

> 为缓解官方直转 Nano Banana Pro / 2 在部分高峰时段的影响，新增逆向 Vertex 分组 NanoBananaReverse，默认分组的 8 折（倍率 0.8x），不分辨率仅按次计费，仅支持 Nano Banana Pro 与 2 两个模型，代码调用兼容。

**2026/6/23 19:18 (UTC+8)** · 新模型 · Google

🚀 **新增 `NanoBananaReverse` 逆向分组 · 默认分组的 8 折，可做高峰兜底**

为缓解官方直转 Nano Banana Pro / 2 在部分高峰时段的影响，新增官方逆向 Vertex 的分组 `NanoBananaReverse`（倍率 0.8x，即默认分组售价的 8 折）。仅支持 `gemini-3-pro-image`（Nano Banana Pro）与 `gemini-3.1-flash-image`（Nano Banana 2）两个模型，不区分分辨率、仅按次计费，代码调用与默认分组兼容。

计费示例（默认价 → 8 折后，仅按次）：

* Nano Banana Pro：\$0.072 → \$0.072 × 0.8 = \$0.0576 / 次
* Nano Banana 2：\$0.055 → \$0.055 × 0.8 = \$0.044 / 次

如何使用：创建令牌时选择 `NanoBananaReverse` 分组；或在原有 Gemini 图片令牌上增加该分组，作为高峰时段的兜底通道。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
