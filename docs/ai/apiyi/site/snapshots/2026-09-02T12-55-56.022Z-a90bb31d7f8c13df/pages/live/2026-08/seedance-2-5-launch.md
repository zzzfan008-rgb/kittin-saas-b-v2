> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 上线：30 秒直出、30 张参考图

> 字节跳动 Seedance 2.5 已在 APIYI 上线，模型名 doubao-seedance-2-5-260628。时长上限提到 30 秒、参考图提到 30 张，新增 mov 输出与视频编辑/延长的显式任务类型。分组与定价已于 2026-08-30 调整，以后续动态为准。

**2026/8/28 11:21 (UTC+8)** · 新模型 · ByteDance

<Warning>
  **本条的价格已过时**：2.5 的单价此后有过调整，最新口径见 [Seedance 2.5 与 2.0 系统一分组](/live/2026-08/seedance-2-5-group-merge)。下方能力描述仍然有效。
</Warning>

🚀 **Seedance 2.5 已上线，`doubao-seedance-2-5-260628`**

端点、鉴权与请求结构与 2.0 完全一致，**只改 `model` 一个字段即可**，8 月 19 日那条上线安排里说的接入工作已经完成。相比 2.0 系：时长上限 15 秒提到 **30 秒**、参考图 9 张提到 **30 张**、参考视频与音频 3 个提到 10 个，音频可以单独作为参考素材，新增 `mov` 输出格式与 `omni_reference_task_type`（把视频编辑 / 延长的参数校验前置到提交时）。分辨率支持 480p / 720p / 1080p，不支持 4k；1080p 输出为 H.265 编码，其余档位为 H.264。

本条上线时的报价不再适用，现价见 [Seedance 2.5 与 2.0 系统一分组](/live/2026-08/seedance-2-5-group-merge)。

两个容易踩的坑：`duration` 缺省值是 `-1`（2.0 系是 `5`），不显式传时长模型会自己选，实测选了 10 秒、费用翻倍；首帧 / 首尾帧、视频编辑、视频延长这三类任务的 `ratio` 必须是 `adaptive`，传具体宽高比会在提交时直接返回 400。

以上结论来自 2026-08-28 的 19 个用例实测，完整能力与定价见 [Seedance 概览](/api-capabilities/seedance2/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
