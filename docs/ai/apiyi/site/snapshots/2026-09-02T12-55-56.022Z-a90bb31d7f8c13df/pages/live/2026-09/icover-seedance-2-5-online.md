> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# iCover AI 视频测试工具已上线 SeeDance 2.5，零代码试跑

> API易 的可视化视频测试工具 iCover AI 已更新，模型下拉里可以直接选 SeeDance 2.5（doubao-seedance-2-5-260628），文生视频 / 首帧 / 首尾帧 / 多模态四种任务都能零代码试跑；参考素材建议先入素材库拿 asset:// 素材 ID 再引用，提交更快。

**2026/9/2 20:37 (UTC+8)** · 服务通知 · ByteDance

🚀 **iCover AI 视频测试工具已更新，模型下拉里可以直接选 SeeDance 2.5**

工具地址 [icover.ai/zh/seedance-official](https://icover.ai/zh/seedance-official)，现在 SeeDance 2.5（`doubao-seedance-2-5-260628`）与 2.0 并列可选，文生视频 / 首帧 / 首尾帧 / 多模态四种任务、画面比例、分辨率、时长都在页面上直接选，不用写代码就能先把效果和参数组合跑一遍，再决定怎么接进自己的服务。时长这一项建议显式选定：SeeDance 2.5 支持 4–30 秒，`智能` 模式通常按约 10 秒计，费用大致是 5 秒的两倍。

<Frame caption="iCover AI 的 SeeDance 2.5 / 2.0 视频生成器：模型、比例、分辨率、时长可视化选择">
  <img src="https://mintcdn.com/apiyillc/2hrltgejiOJbcIE8/images/icover-ai-seedance-2-5-generator.jpg?fit=max&auto=format&n=2hrltgejiOJbcIE8&q=85&s=87cce4f3be2ddf992f3d4a817b79921c" alt="iCover AI SeeDance 2.5 / 2.0 视频生成器界面" width="1400" height="1374" data-path="images/icover-ai-seedance-2-5-generator.jpg" />
</Frame>

参考图 / 视频 / 音频这三类素材，推荐走「先入库，再按素材 ID 引用」：把素材上传到素材库拿到 `asset://` ID，之后在各媒体位的「素材」页签里选择插入。这样请求体只剩几十字节，创建任务即刻返回，合规校验也提前到入库那一步完成，素材 ID 还能跨任务复用、保持人物一致。测试页面的参考图位是演示上限 12 张，API 侧最多支持 30 张图 + 10 个视频 + 10 个音频参考，批量场景请直接按 [接入文档](/api-capabilities/seedance2/overview) 调用。

素材优先的耗时拆解与迁移步骤见 [素材优先：更快更稳的带图带视频生成](/api-capabilities/seedance2/asset-first-workflow)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
