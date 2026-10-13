> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 视频生成上线

> API易 联合 AZ8 上线其自研全能视频模型 oxygen-1.0：OpenAI Videos 兼容接口，一个模型覆盖文生、首帧、首尾帧与参考图/视频/音频生视频，320p–768p、4–15 秒，按秒 0.02 美元、不分清晰度，适合低成本走量。

**2026/10/2 17:01 (UTC+8)** · 新模型 · AZ8

🚀 **`oxygen-1.0` 视频生成上线，定价 \$0.02/秒、不分清晰度**

API易 联合新加坡 AI 视频平台 AZ8 上线其自研全能视频模型 Oxygen。接口兼容 OpenAI Videos（`POST /v1/videos` 提交、`GET /v1/videos/{id}` 查询），一个模型同时覆盖文生视频、首帧、首尾帧，以及最多 9 张参考图 + 3 段参考视频 + 3 段参考音频的参考生成，成片自带音轨。

* 规格：320p / 480p / 768p，4–15 秒，按 `seconds` 计费；5 秒 \$0.10、15 秒 \$0.30
* 分组：`default` 或 `svip`，任务失败自动全额退款
* 注意：每次显式传 `size`（不传默认竖版）；首尾帧、参考素材等高级参数要写进 `input_reference` 的 JSON 信封，写在顶层会被静默丢弃

定位是便宜走量的批量视频生成，详见 [上线解读](/news/oxygen-1-0-launch) 与 [接入文档](/api-capabilities/oxygen/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.