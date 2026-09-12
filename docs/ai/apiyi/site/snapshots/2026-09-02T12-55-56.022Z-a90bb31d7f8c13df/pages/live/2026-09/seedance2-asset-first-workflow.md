> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 带图带视频调用，建议先入素材库拿素材 ID 再引用

> 带图或带视频调用 Seedance 时，创建任务接口的耗时主要花在素材上行，内联 Base64 会把秒级提交拖到几十秒甚至客户端读超时。改用 asset:// 素材 ID 引用后请求体只剩几十字节，提交即刻返回任务 ID。新增一页使用技巧文档。

**2026/9/2 11:54 (UTC+8)** · 文档更新 · ByteDance

📊 **带图带视频调用 Seedance，慢的是提交不是生成——先入素材库拿 `asset://` 素材 ID 再引用最稳**

素材要先从你的机器上行到 API易，再由我们转发到火山引擎并完成解码校验，这一整段走完才会返回任务 ID。所以内联 Base64 或大体积图片 URL 时，创建任务接口会从秒级拖到几十秒，有客户把客户端读超时调到 300 秒仍然拿不到任务 ID。生成本身通常 2–5 分钟，是原厂的正常速度，与提交阶段无关。

改用 `asset://` 素材 ID 引用后，请求体从数 MB 降到几十字节，提交即刻返回任务 ID；素材的合规校验也提前到入库那一步完成，不必等生成任务跑到一半才失败；素材 ID 还可长期复用，同一角色跨镜头的一致性更好。素材库随 Seedance 接口免费使用、不另收年费。

新增文档一页，含耗时拆解表、三种素材传法对比、迁移三步，以及超时之后怎么判断任务是否已创建：[素材优先：更快更稳的带图带视频生成](/api-capabilities/seedance2/asset-first-workflow)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
