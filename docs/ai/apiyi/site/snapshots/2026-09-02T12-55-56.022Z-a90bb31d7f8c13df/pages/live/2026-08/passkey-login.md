> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 新增 Passkey 登录：指纹一键登录，不用再记密码

> API易 上线 Passkey（通行密钥）登录。在个人中心底部「账户选项」点击绑定，选择保存位置后即可用指纹、面容或锁屏密码登录；私钥只留在设备本地，天生防钓鱼、防撞库，可随时查看最后使用时间并解绑。

**2026/8/1 00:24 (UTC+8)** · 服务通知

🚀 **新增 Passkey 登录，绑定后用指纹 / 面容一键进后台，不用再记密码**

绑定路径：登录后进入**个人中心**，滑到页面底部的「账户选项」，点击**绑定 Passkey**，在系统弹窗里选一种保存位置（iCloud 钥匙串 / Google 密码管理工具 / 手机、平板或安全密钥 / 本机浏览器配置文件）即可完成。

安全性来自机制本身：私钥只留在你的设备或密码管理器里，服务器上只有一段无法反推私钥的公钥，因此天生防钓鱼、防撞库——仿冒站点即使长得一模一样也触发不了验证。指纹、面容数据全程只在设备本地校验，不会上传。

绑定后同一位置会显示**最后使用时间**，并可随时**解绑**，解绑不影响余额、令牌与调用记录。

两点提醒：请保留一种备用登录方式（密码 / 注册邮箱 / GitHub），设备丢失时才好找回；不要在公用电脑上绑定，临时登录请用「手机、平板电脑或安全密钥」扫码方式在自己手机上验证。

📖 相关：[如何使用 Passkey 登录](/faq/passkey-login) · [忘记密码了怎么办](/faq/forgot-password) · [如何安全地管理 API Key](/faq/key-security-management)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
