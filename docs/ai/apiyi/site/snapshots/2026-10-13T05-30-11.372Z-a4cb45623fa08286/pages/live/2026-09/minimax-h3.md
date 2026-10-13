> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 视频生成上线

> MiniMax H3（海螺 3.0）开源权重自部署通道上线：768P、4–15 秒、原生立体声，一个端点覆盖文生、首尾帧与图/视频/音频混合参考；按秒 0.03 美元，参考素材不另收费，default 与 svip 分组可用。

**2026/9/29 16:32 (UTC+8)** · 新模型 · MiniMax

🚀 **`MiniMax-H3` 视频生成上线，定价 \$0.03/秒**

这是基于 MiniMax 开源权重的自部署通道：768P、4–15 秒、自带立体声，同一个端点 `POST /hailuo/v2/video_generation` 覆盖文生、首尾帧，以及最多 9 张参考图 + 3 段参考视频 + 3 段参考音频的混合参考生成。参考素材不另收费，任务失败自动全额退款。

* 分组：`default` 默认分组或 `svip` 分组
* 原厂官方 API 768P 标价 \$0.08/秒，本通道独立定价
* 注意：暂不支持 2K；`Idempotency-Key` 请求头不生效，请在业务层做幂等

详见 [上线解读](/news/minimax-h3-launch) 与 [接入文档](/api-capabilities/minimax-h3/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.