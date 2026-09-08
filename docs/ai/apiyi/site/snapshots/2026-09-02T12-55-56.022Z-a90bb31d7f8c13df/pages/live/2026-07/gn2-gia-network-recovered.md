> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 跨境回程网络已恢复：13:00 (UTC+8) 前后回到正常水平

> 7/31 上午 11:50 (UTC+8) 前后出现的跨境回程链路（GN2 GIA）卡顿，已于下午 13:00 (UTC+8) 前后恢复正常，Base64 图片接口的下行耗时回到日常水平。本次为运营商侧链路波动，平台与上游模型服务全程正常，文本接口不受影响。

**2026/7/31 16:06 (UTC+8)** · 服务通知

✅ **跨境回程网络已于 13:00 (UTC+8) 前后恢复正常，图片接口下行耗时回到日常水平**

根因说明：本次卡顿出在回国方向的运营商链路（GN2 GIA 线路），属于运营商侧的链路波动。平台与上游模型服务全程正常 —— 卡顿期间 `nano-banana`、`gpt-image-2` 等图片接口的提交与生成均无异常，慢的只是 Base64 响应体的下行传输，纯文本接口自始至终不受影响。这类跨境链路问题不在我们与上游的可控范围内，只能实时监测并等待运营商侧恢复。

当前状态：

* 图片接口（Base64 回传）：已恢复，下行耗时回到日常水平
* 文本接口：全程正常
* 上午为应对卡顿而放宽的客户端超时，可按自身情况自行调回

感谢期间的耐心等待与反馈，我们持续监测跨境链路状况。事件起始播报见 [跨境回程网络疑似卡顿](/live/2026-07/gn2-gia-network-latency)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
