> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# glm-5.3 与 glm-5.3-flash 上线，定价与智谱官网一致

> 智谱 8 月发布的 GLM-5.3 编程旗舰与 GLM-5.3-Flash 多模态轻量版已在 API易 开放调用，default / svip 分组可用。定价与官网逐项一致，旗舰输入 $1.40 / 输出 $4.396，Flash 输入 $0.15 / 输出 $0.50 每百万 tokens，叠加充值加赠实付约为定价的 83%～91%。上线前用 16 万 tokens 长提示实测 Flash 流式链路正常。

**2026/9/8 22:17 (UTC+8)** · 新模型 · Zhipu

🚀 **`glm-5.3` 与 `glm-5.3-flash` 已上线，`default` / `svip` 分组均可调用**

两款都是智谱 8 月发布的新模型：`glm-5.3` 沿用 5.2 的 753B MoE 基座、只扩后训练，Z.ai Code Bench 比 5.2 提升 50%，网络安全基准 ExploitBench 翻倍；`glm-5.3-flash` 是 GLM-5 系列首个原生多模态，320B-A18B 架构，Terminal-Bench 2.1 拿下 84.3，与 Claude Opus 4.8 仅差 0.7。两款思考都不可关闭，`reasoning_effort` 只有 `low` / `high` / `max` 三档。

定价与智谱官网逐项一致：`glm-5.3` 输入 \$1.40 / 输出 \$4.396 / 缓存读取 \$0.259，`glm-5.3-flash` 输入 \$0.15 / 输出 \$0.50 / 缓存读取 \$0.03 每百万 tokens。这是折扣前定价，叠加充值加赠后实付约为定价的 83%～91%。

上线前我们用约 16 万 tokens 的长提示对 `glm-5.3-flash` 做了流式实测：首字节 3～5 秒、单次消费约 \$0.005，长上下文链路正常。

📖 完整基准数据、规格与代码示例：[GLM-5.3 与 GLM-5.3-Flash 上线](/news/glm-5-3-launch)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
