> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 控制台弹出时区切换建议时，请选择「暂时忽略」

> 控制台会检测到账户时区与设备时区不一致并弹出「本地设置建议」，建议选择「暂时忽略」，保持账户时区为 London (UTC+0/+1)；切换后日志页顶部「调用数据一览」统计图的展示会受影响。

**2026/8/9 11:06 (UTC+8)** · 服务通知

⚠️ **控制台弹出「本地设置建议」提示切换时区时，请点「暂时忽略」，不要切换**

登录控制台后，系统若检测到**账户时区**（UTC）与**当前设备时区**（如 `Asia/Shanghai`）不一致，会弹出一个「本地设置建议」窗口，并给出「切换到 Asia/Shanghai」的按钮。**请不要点这个按钮**，选择左侧的「暂时忽略」即可。

原因是切换后，日志页顶部的\*\*「调用数据一览」统计图\*\*展示会受影响（时间分桶与图表区间对不上，看起来像数据缺失或错位）。账户时区保持默认的 `London (UTC+0/+1)`，也就是 UTC+0，统计图展示正常。

<Frame caption="控制台弹出的「本地设置建议」窗口，请点左侧的「暂时忽略」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="本地设置建议弹窗：账户时区 UTC、当前设备时区 Asia/Shanghai，底部有暂时忽略与切换到 Asia/Shanghai 两个按钮" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

当前时区可在控制台「用户信息」一栏查看，正常应显示为 `London (UTC+0/+1)`；若此前已误切换，改回该选项即可恢复。日志明细中的时间仍按账户时区显示，换算时请以 UTC+0 为准。

日志的两种导出方式（「导出」与「汇总账单」）时区口径不同，详见 [日志的时区设置和数据导出要注意什么？](/faq/log-timezone-and-export)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
