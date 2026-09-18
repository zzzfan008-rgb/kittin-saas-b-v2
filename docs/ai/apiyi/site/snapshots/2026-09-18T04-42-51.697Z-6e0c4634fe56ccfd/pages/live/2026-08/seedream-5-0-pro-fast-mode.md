> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 5.0 Pro 速度更新：官方极速模式上线

> BytePlus 官方同步上线极速模式（Fast Mode），APIYI 已在网关侧默认适配，无需用户自行传参，模型名不变。标准模式文生图延迟已优化，极速模式面向时延敏感场景。上线测试的预期延迟：标准模式 1K/2K 各 30/40 秒以上，极速模式 1K/2K 各 20/40 秒以上。

**2026/8/19 15:12 (UTC+8)** · 新模型 · ByteDance

🚀 **Seedream 5.0 Pro 速度更新，官方极速模式（Fast Mode）已上线，APIYI 已默认适配**

本次更新与 BytePlus 官方策略同步：一是优化了标准模式（Standard Mode）下文生图的生成延迟，二是新增专为时延敏感场景打造的极速模式（Fast Mode）。**APIYI 已在网关侧完成适配，默认带上极速模式参数，不需要用户自己在请求体里加**，模型名 `seedream-5-0-pro-260628` 与调用方式都不变。

上线测试阶段的预期延迟数据（理论值，实际会因网络状况、资源可用性与具体请求特征浮动）：

| 模式         | 分辨率 | 预期延迟   |
| ---------- | --- | ------ |
| 标准模式 · 文生图 | 1K  | 30 秒以上 |
| 标准模式 · 文生图 | 2K  | 40 秒以上 |
| 极速模式 · 图生图 | 1K  | 20 秒以上 |
| 极速模式 · 图生图 | 2K  | 40 秒以上 |

**效果权衡**：极速模式对模糊、不明确的提示词理解可能打折扣；但提示词清晰具体时，官方在生成质量、结构与美感上均未观察到明显下降。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
