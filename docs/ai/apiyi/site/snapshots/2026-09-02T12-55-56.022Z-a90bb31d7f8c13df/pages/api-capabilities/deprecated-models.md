> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 废弃模型列表

> 查看即将下线和已废弃的模型列表，及时迁移到推荐替代模型。

## 说明

本页面列出即将下线和已废弃的模型，帮助您了解模型生命周期，提前做好迁移准备。

<Warning>
  如果您正在使用即将废弃的模型，请尽快迁移到推荐的替代模型，以避免服务中断。
</Warning>

## ⚠️ 废弃模型预告

以下模型即将下线，请在预计下线日期前完成迁移。

| 模型名称                                | 模型ID                                  | 预计下线日期         | 推荐替代模型                   | 备注                                                                                                               |
| ----------------------------------- | ------------------------------------- | -------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Gemini 3 Pro Preview                | `gemini-3-pro-preview`                | 已透明替换（2026-05） | `gemini-3.1-pro-preview` | **与谷歌官方同步**：考虑到已有客户在线上使用旧 ID，调用 `gemini-3-pro-preview` 会自动路由到 `gemini-3.1-pro-preview`，避免业务中断；建议尽快迁移到新 ID        |
| Gemini 3.1 Flash Lite Preview       | `gemini-3.1-flash-lite-preview`       | 已透明替换（2026-05） | `gemini-3.1-flash-lite`  | **与谷歌官方同步**：谷歌已于 2026-05-25 下线该 Preview，调用旧 ID 会自动路由到 `gemini-3.1-flash-lite`，**价格相同**、跟随官网变化，避免业务中断；建议尽快迁移到新 ID |
| Gemini 2.0 Flash Lite               | `gemini-2.0-flash-lite`               | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整体下线                                                                                                |
| Gemini 2.0 Flash Lite 001           | `gemini-2.0-flash-lite-001`           | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整体下线                                                                                                |
| Gemini 2.0 Flash                    | `gemini-2.0-flash`                    | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整体下线                                                                                                |
| Gemini 2.0 Flash 001                | `gemini-2.0-flash-001`                | 待定             | `gemini-2.5-flash`       | Gemini 2.0 系列整体下线                                                                                                |
| Gemini 2.0 Flash Lite Preview 02-05 | `gemini-2.0-flash-lite-preview-02-05` | 待定             | `gemini-2.5-flash`       | Preview 版本                                                                                                       |

<Info>
  谷歌 Gemini 模型废弃详情请参考官方文档：`ai.google.dev/gemini-api/docs/deprecations`
</Info>

## 🚫 已下线模型

以下模型已废弃，不再可用。如果您的应用仍在调用这些模型，请尽快切换到替代模型。

| 模型名称                   | 模型ID                                                                                      | 下线日期       | 替代模型                                    | 备注                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------- | ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Kimi K2                | `kimi-k2`                                                                                 | 2026-05-28 | `kimi-k2.6`                             | 旧版 Kimi K2 系列，请迁移到最新的 K2.6                                                                                                                     |
| Kimi K2 128K           | `kimi-k2-128k`                                                                            | 2026-05-28 | `kimi-k2.6`                             | 旧版长上下文 K2，K2.6 已默认 256K 上下文                                                                                                                    |
| Kimi K2 Instruct       | `kimi-k2-instruct`                                                                        | 2026-05-28 | `kimi-k2.6`                             | 旧版指令微调 K2，请迁移到 K2.6                                                                                                                            |
| DeepSeek V3.1          | `deepseek-v3-1-250821`                                                                    | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 系列下线，请迁移至 V4：复杂推理选 Pro，高并发/性价比选 Flash                                                                                              |
| DeepSeek V3.1 Terminus | `deepseek-v3.1-terminus`                                                                  | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 系列下线，请迁移至 V4                                                                                                                       |
| DeepSeek R1 (250528)   | `deepseek-r1-250528`                                                                      | 2026-05-28 | `deepseek-v4-pro` / `deepseek-v4-flash` | R1 推理模型已被 V4 系列取代，推理能力请用 V4 Pro                                                                                                                |
| GPT-4                  | `gpt-4`                                                                                   | 2026-02-27 | `gpt-5.2`                               | 一代目强者，已停用                                                                                                                                      |
| GPT-4（32K）             | `gpt-4-32k`                                                                               | 2026-02-27 | `gpt-5.2`                               | 一代目强者，已停用                                                                                                                                      |
| Grok 4                 | `grok-4`                                                                                  | 2026-03-12 | `grok-4-1-fast-reasoning`               | 已下线，请迁移至新版                                                                                                                                     |
| Grok 4 0709            | `grok-4-0709`                                                                             | 2026-03-12 | `grok-4-1-fast-reasoning`               | 已下线，请迁移至新版                                                                                                                                     |
| Sora 2 视频生成（官转）        | `sora-2` / `sora-2-pro` / `sora-2-remix`                                                  | 2026-07-01 | `doubao-seedance-2-0` / `wan2.7-t2v`    | **Sora 2 全系已下线**。OpenAI 官方算力持续倾斜导致超时严重，官方定于 9 月正式下线，本站提前于 7 月 1 日下线 `Sora2Official` 分组，该分组现已停用。详见 [服务通知](/live/2026-07/sora2-official-offline) |
| Sora 2 视频生成（逆向）        | `sora_video2` / `sora_video2-landscape` / `sora_video2-15s` / `sora_video2-landscape-15s` | 2026-04-26 | `doubao-seedance-2-0` / `wan2.7-t2v`    | 逆向通道下线。其后继的官转 Sora 2 也已于 2026-07-01 下线，请直接迁移到 [SeeDance 2.0](/api-capabilities/seedance2/overview) 或 [Wan2.7](/api-capabilities/wan/overview)  |
| Sora 2 角色生成            | `sora-character`                                                                          | 2026-04-26 | `doubao-seedance-2-0`                   | 逆向通道下线。人物一致性场景请改用 [Seedance 素材库](/api-capabilities/seedance2/asset-library)                                                                    |
| Sora Image 生图/编辑（逆向）   | `sora_image`                                                                              | 2026-04-26 | `gpt-image-2-all`（新版官逆）                 | 逆向通道下线，请迁移至 [GPT-Image-2-All](/api-capabilities/gpt-image-2-all/overview)                                                                      |
| GPT-4o Image 生图/编辑（逆向） | `gpt-4o-image`                                                                            | 2026-04-26 | `gpt-image-2-all`（新版官逆）                 | 逆向通道下线，请迁移至 [GPT-Image-2-All](/api-capabilities/gpt-image-2-all/overview)                                                                      |

## 🔗 各大模型官方弃用页面

各模型供应商的官方模型生命周期与弃用公告页面，便于对照查询最新动态。点击卡片直接跳转到官方文档。

<CardGroup cols={2}>
  <Card title="OpenAI" icon="square-terminal" href="https://platform.openai.com/docs/deprecations">
    GPT 系列模型弃用列表与替代建议
  </Card>

  <Card title="Anthropic Claude" icon="brain" href="https://platform.claude.com/docs/zh-CN/about-claude/model-deprecations">
    Claude 模型弃用计划（中文官方文档）
  </Card>

  <Card title="Google Gemini" icon="gem" href="https://ai.google.dev/gemini-api/docs/deprecations">
    Gemini 系列模型下线时间表与迁移指引
  </Card>

  <Card title="xAI Grok" icon="bolt" href="https://docs.x.ai/developers/migration/models">
    Grok 模型迁移说明与历次下线公告
  </Card>

  <Card title="阿里云 Qwen" icon="cloud" href="https://help.aliyun.com/zh/model-studio/newly-released-models">
    百炼平台 Qwen 模型上下架与更新公告
  </Card>

  <Card title="DeepSeek" icon="fish" href="https://api-docs.deepseek.com/updates">
    DeepSeek API 更新日志与模型变更记录
  </Card>
</CardGroup>

<Info>
  以上链接将跳转至各厂商官方文档，建议收藏并定期查看，以掌握最新的模型下线安排。
</Info>

<Info>
  本页面会持续更新，建议定期查看以获取最新的模型废弃信息。
</Info>
