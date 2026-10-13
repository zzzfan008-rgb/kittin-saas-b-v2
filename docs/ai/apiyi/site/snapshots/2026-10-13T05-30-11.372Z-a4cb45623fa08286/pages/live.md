> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 实时动态

> API易模型状态、行业快讯、服务动态实时更新

<Update label="2026/10/13 00:17" description="价格变动" tags={["Google", "价格变动"]}>
  💸 **Nano Banana 2.1（`gemini-nano-banana-2.1`）按次降价 10%：\$0.05 → \$0.045/次** —— 1K / 2K / 4K 仍同价，出 4K 按次比按量便宜近三成；按量价不变（输入 \$0.66、输出 \$13.2 每百万 tokens），叠加充值加赠成本更低。

  📖 [查看详情](/live/2026-10/gemini-nano-banana-2-1-price-cut)
</Update>

<Update label="2026/10/12 20:20" description="服务通知" tags={["服务通知"]}>
  🚀 **个人访问令牌上线，旧系统令牌计划 2026-11-11 (UTC+8) 停用** —— 余额查询、日志查询、令牌管理等管理接口改用个人访问令牌，可按权限勾选、设置到期时间与 IP 白名单；平台会视使用情况决定是否延期，建议尽早更换，只需替换请求头里的值。

  📖 [查看详情](/live/2026-10/personal-access-token-launch)
</Update>

<Update label="2026/10/11 17:59" description="文档更新" tags={["Google", "OpenAI", "Anthropic", "ByteDance", "Alibaba", "Moonshot", "文档更新"]}>
  📊 **图像理解文档已按 24 个模型的实测全面重写** —— 22 个视觉模型用 `image_url` 写法全部可用，标清了 Responses / Anthropic / Gemini 原生写法各自支持的模型；新增大图缩放建议（9000×6000 的图在 `gpt-6-sol` 上一张记 63658 tokens）与 AI Agent 接入提示词。

  📖 [查看详情](/live/2026-10/vision-understanding-multi-model)
</Update>

<Update label="2026/10/11 12:01" description="文档更新" tags={["Google", "ByteDance", "Alibaba", "Moonshot", "OpenAI", "xAI", "文档更新"]}>
  📊 **视频理解文档已按 19 个模型的实测重写，不再只有 Gemini** —— Seed 全系、`qwen3.8-max` 等 Qwen 四款与 `kimi-k3` 实测可看视频；GPT、Grok、Claude、GLM、DeepSeek 不支持，其中 GPT 与 GLM 会静默丢掉视频；通用写法统一为 `video_url`。

  📖 [查看详情](/live/2026-10/video-understanding-multi-model)
</Update>

<Update label="2026/10/11 11:59" description="新模型" tags={["Alibaba", "新模型"]}>
  🚀 **iCover AI 视频测试工具已支持 Wan3.0，多模态素材可直接上传生成视频** —— 参考图片（最多 9 张）、视频、音频、`pdf` / `docx` 文档和网页链接都能作为素材，填链接或本地上传均可，无需写代码即可在 [iCover AI](https://icover.ai/zh/wan-official) 在线测试。

  📖 [查看详情](/live/2026-10/icover-wan3-0)
</Update>

<Update label="2026/10/11 00:46" description="服务通知" tags={["Alibaba", "DeepSeek", "Zhipu", "服务通知"]}>
  ⏸ **阿里云百炼官方下线一批模型，API易 同步下线 36 款** —— Qwen 系列为阿里云官方直转、随官网同步上下线，本次涉及 `qwen3-max`、`qwen3-coder-plus`、`qwen-vl-max` 等 Qwen3 / Qwen-VL 早期版本，以及百炼托管的 `deepseek-v3.2`、`glm-4.7` 等，完整名单见详情；请把代码中的模型名换成仍在售的模型。

  📖 [查看详情](/live/2026-10/bailian-models-offline)
</Update>

<Update label="2026/10/10 22:23" description="新模型" tags={["Alibaba", "新模型"]}>
  🚀 **Wan3.0 视频生成正式上线：`wan3.0-video` 标准版与 `wan3.0-video-prime` 优速版** —— 一个模型 ID 覆盖文生 / 图生 / 参考生 / 视频编辑，最长 30 秒、480P–1080P、默认带音轨；默认官方 98 折，720P 标准版 \$0.0588/秒，令牌分组选 `Wan&HappyHorse`。

  📖 [查看详情](/live/2026-10/wan3-0-video-launch)
</Update>

<Update label="2026/10/10 16:13" description="模型状态" tags={["OpenAI", "模型状态"]}>
  ✅ **`gpt-image-2.5-sunburst-vip` 与 `gpt-image-2.5-flare-vip` 目前比 `gpt-image-2-vip` 更稳定** —— 三款同价 \$0.03/张、同分组同端点，2.5 兼容 2-vip 的调用方式，把 `model` 换成 2.5 的模型名即可；`quality` 档位不完全对齐，2.5 的 `max` 才等于 2-vip 的 `high`。

  📖 [查看详情](/live/2026-10/gpt-image-2-5-vip-more-stable)
</Update>

<Update label="2026/10/10 14:05" description="价格变动" tags={["OpenAI", "价格变动"]}>
  💸 **`gpt-image-2-all` 与 `gpt-image-2.5-all` 降价：\$0.03 → \$0.025/张** —— -all 系列本身出图质量高、比 -vip 更稳定，唯一短板是只出 1K–1.5K；-vip 三款价格不变、照常维护。\$0.025 为折扣前价格，叠加充值加赠 10%–20% 成本更低。

  📖 [查看详情](/live/2026-10/gpt-image-2-all-price-cut)
</Update>

<Update label="2026/10/9 10:47" description="模型状态" tags={["OpenAI", "模型状态"]}>
  ⚠️ **`gpt-image-2-vip` 与 `gpt-image-2.5` 的 -vip 系列自昨天起持续补充资源，目前仍不稳定** —— 官逆线路受号池并发影响，复工后请求量大，我们正持续加号；官转 `gpt-image-2` 与 `gpt-image-2.5` 并发充足，平台建议生产业务仍以官转作兜底。

  📖 [查看详情](/live/2026-10/gpt-image-vip-pool-scaling)
</Update>

***

> 📖 查看更早的动态请访问 [实时动态归档](/live/archive)，按月份、分类、厂商浏览历史动态。

<CardGroup cols={3}>
  <Card title="深度解读" icon="newspaper" href="/news/gemini-3-1-flash-lite-launch" horizontal>
    查看 AI风向标栏目
  </Card>

  <Card title="Telegram 频道" icon="telegram" iconType="brands" href="https://t.me/apiyinews" horizontal>
    适合全球用户
  </Card>

  <Card title="图片/视频模型" icon="images" href="/api-capabilities/image-video-models" horizontal>
    陆续上新
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.