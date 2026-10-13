> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 控制台时区显示问题已修复，可放心切换本地时区

> 日志页调用数据一览统计图与汇总账单在账户时区非 UTC 时的日期错位已修复。此前保持 UTC+0、弹窗选暂时忽略的建议作废，现在请直接选择所在时区，明细、统计图、导出、汇总账单四处口径一致。

**2026/9/20 00:55 (UTC+8)** · 服务通知

✅ **控制台时区显示问题已修复：现在请直接选择你所在的时区，弹窗里可以放心点「切换到 Asia/Shanghai」**

此前账户时区不是 UTC 时，日志页顶部「调用数据一览」统计图会出现日期错位（例如北京时间下午就出现了次日的柱子），「汇总账单」按天 / 按小时的分组也有 8 小时偏移。根因在服务端的时间换算，已于 2026/9/20 00:55 (UTC+8) 修复。

修复后，日志明细列表、统计图、「导出」、「汇总账单」四处都跟随账户所选时区，口径一致；[日志查询 API](/api-capabilities/log-query) 仍返回 Unix 秒级时间戳。8/9 发布的「弹窗请选暂时忽略、保持 UTC+0」建议同时作废。

切换时区不会改动任何调用记录与扣费。修复前导出的汇总账单，按日分组可能有 8 小时偏移，总金额不受影响；如需按日精确对账，建议重新导出一次。详见 [日志的时区设置和数据导出要注意什么？](/faq/log-timezone-and-export)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.