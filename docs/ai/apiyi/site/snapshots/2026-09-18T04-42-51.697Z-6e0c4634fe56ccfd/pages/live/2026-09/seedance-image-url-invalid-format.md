> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片链接浏览器能打开，Seedance 却报格式错误？新增 FAQ 讲清原因与自查方法

> 新增 FAQ：限次下载、不支持 Range、短有效期的业务接口链接，浏览器能打开，但原厂抓图时拿到的是报错，提交即返回 400 invalid image format。推荐用干净的公网直链，反复引用用素材 ID，Base64 仅作兜底，并附 curl 自查方法。

**2026/9/18 11:19 (UTC+8)** · 文档更新 · ByteDance

📚 **Seedance 首帧图链接浏览器能打开，提交却报 `invalid image format`？问题在链接，不在图片**

真实工单：图片链接是业务接口签发的下载授权（`access_token` 带过期时间，限 10 次下载），带 `Range` 请求头时返回 416 和一段 JSON。原厂抓图拿到的不是图片，提交即返回 400，报错里是 `received: ""`。同一张图改用 Base64 提交，成功出片。

新 FAQ 说明这类链接为什么不适合服务器抓取、公网直链 / `asset://` 素材 ID / Base64 三种传法怎么选，并附两条 curl 自查命令，见 [图片链接浏览器能打开，Seedance 却报 invalid image format？](/faq/seedance-image-url-invalid-format)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
