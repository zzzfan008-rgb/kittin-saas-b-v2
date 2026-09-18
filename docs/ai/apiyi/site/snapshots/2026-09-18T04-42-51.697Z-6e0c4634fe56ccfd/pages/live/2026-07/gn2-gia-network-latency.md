> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 跨境回程网络疑似卡顿：Base64 图片接口下行变慢，文本接口正常

> 7/31 11:50 (UTC+8) 前后跨境回程链路（GN2 GIA）出现疑似卡顿，上游模型服务本身正常，nano-banana、gpt-image-2 等图片接口可正常提交与生成，慢在返回数据的下行传输，以 Base64 回传图片的接口受影响最明显；文本接口不受影响。

**2026/7/31 12:25 (UTC+8)** · 服务通知

⚠️ **11:50 (UTC+8) 前后跨境回程网络疑似卡顿，Base64 图片接口下行变慢，文本接口正常**

根因说明：目前判断问题出在回国方向的运营商链路（GN2 GIA 线路），上游模型服务本身正常 —— `nano-banana`、`gpt-image-2` 等图片接口提交与生成均无异常，慢的是返回数据的下行传输。因此以 Base64 形式回传图片的接口受影响最明显（响应体大，下行耗时被成倍放大），纯文本接口不受影响。

当前状态：

* 图片接口（Base64 回传）：可正常调用，返回耗时变长
* 文本接口：正常
* 线上并发：仍处高位，已有个别客户反馈

耗时敏感的图片任务建议适当放宽客户端超时时间后重试。我们正在跟进链路情况，恢复后会在本页更新。感谢耐心等待，我们持续运维。

**更新（7/31 13:00 前后 UTC+8）**：链路已恢复正常，图片接口下行耗时回到日常水平，详见 [跨境回程网络已恢复](/live/2026-07/gn2-gia-network-recovered)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
