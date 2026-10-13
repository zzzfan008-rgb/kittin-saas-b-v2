> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 没开首尾帧，Seedance 却报首尾帧与参考素材混用？新增 FAQ 讲清原因

> 新增 FAQ：报错 first/last frame content cannot be mixed with reference media content，是因为图片没写 role 被当成首帧、又带了参考视频。多见于用通用视频端点提交的第三方工具。Seedance 一律走原生端点并给每个素材写 role，参考视频用公网直链或素材 ID。

**2026/9/19 21:32 (UTC+8)** · 文档更新 · ByteDance

📚 **没开首尾帧，Seedance 却报「首尾帧不能和参考素材混用」？原因是图片没写 `role`**

真实工单：客户工具里勾的是「全能参考」，请求却发到了通用视频端点 `/v2/videos/generations`，只有 `images` / `videos` 两个数组、没有 `role`。单张图按规则就是首帧，再带参考视频，原厂提交即返回 400。同一请求里视频传的还是客户本机路径，原厂根本访问不到。

新 FAQ 说明为什么 Seedance 一律走原生端点 `/seedance/api/v3/contents/generations/tasks`、每个素材怎么写 `role`，以及参考视频该怎么传（公网直链或 `asset://` 素材 ID），见 [报首尾帧与参考素材混用](/faq/seedance-first-frame-mixed-with-reference)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.