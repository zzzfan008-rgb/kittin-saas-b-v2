> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 个人中心新增「登录设备」功能，已登录用户可能看到 403 提示，重新登录即可

> 9 月 12 日系统升级后，个人中心新增「登录设备」功能。升级前已登录的用户打开个人中心时可能看到 AxiosError: Request failed with status code 403 的提示，这是旧登录会话在新功能下校验失败所致，不影响 API 调用与余额。在当前浏览器退出账号后重新登录即可恢复正常。

**2026/9/12 14:32 (UTC+8)** · 服务通知

⚠️ **个人中心新增「登录设备」功能，升级前已登录的用户可能看到 403 提示，退出重新登录即可**

9/12 系统升级后，个人中心增加了「登录设备」功能，可查看并管理当前账号的登录会话。升级前已登录的浏览器仍持有旧的登录会话，打开个人中心时新功能的接口会校验失败，页面上会弹出 `错误：AxiosError: Request failed with status code 403`。

这个提示**只影响个人中心页面，不影响 API 调用**：Key、余额、分组和所有接口请求都照常工作。解决办法是在当前浏览器退出账号，然后重新登录，提示即消失。

感谢理解，我们持续运维。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
