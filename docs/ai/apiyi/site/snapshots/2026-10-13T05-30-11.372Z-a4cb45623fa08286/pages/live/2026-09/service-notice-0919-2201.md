> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 新增在线联调排查：客户现场复现，我们实时查看请求

> API易运维团队新增在线联调排查方式：客户按约定时间在线发起一次调用，我们在服务端临时记录并实时查看这次请求与返回内容，当场对齐问题。只查看该客户本次复现的请求，密钥等凭据自动屏蔽，结束后记录立即删除。

**2026/9/19 22:01 (UTC+8)** · 服务通知

🛠️ **新增在线联调排查：您现场复现一次，我们实时查看这次请求，当场对齐问题**

有些问题只看报错说不清：请求被原厂在提交阶段直接拒绝、平台后台没有留下记录，或者返回正常但结果用不了。现在可以约一个时间，由您在线发起一次调用，我们在服务端同步查看这次请求实际发了什么、平台返回了什么，当场定位是参数、素材地址、网络还是平台侧的问题。今天已用这个办法当场解决两单：一次视频任务报参数冲突（见 [报首尾帧与参考素材混用](/faq/seedance-first-frame-mixed-with-reference)），一次图片地址下载失败。

我们同样重视您的数据安全：

* 只在约定的时间窗口内临时开启，只调取您本次复现的那几次请求
* 密钥等凭据自动屏蔽，不查看、不记录
* 排查结束后临时记录立即删除，不留存、不外传

需要时联系客服说明问题和方便的时间即可。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.