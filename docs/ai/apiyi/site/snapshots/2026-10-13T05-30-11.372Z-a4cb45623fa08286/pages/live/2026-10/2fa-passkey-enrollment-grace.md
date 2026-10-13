> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 2FA 与 Passkey 绑定宽松期

> 即日起至 10 月 15 日 23:59 (UTC+8)，控制台登录后即可直接绑定 2FA 或 Passkey，不再要求登录环境稳定满 72 小时；先绑 2FA 的用户需用双重验证重新登录一次再绑 Passkey。

**2026/10/4 11:00 (UTC+8)** · 服务通知

🔐 **即日起至 10 月 15 日 23:59 (UTC+8) 为 2FA 与 Passkey 绑定宽松期，登录后即可直接绑定**

控制台的账号安全策略要求：仅用密码登录的账号，须在同一登录会话和环境下稳定满 72 小时才能首次绑定 2FA 或 Passkey，换网络还会重新等待，不少用户因此迟迟绑不上。宽松期内不再要求等待，高风险登录仍按原规则拦截。

绑定建议：

* 推荐先绑 Passkey，再绑 2FA
* 如果先绑了 2FA，系统会要求重新验证当前登录状态，此时继续绑 Passkey 会提示「保存验证状态失败」。退出后用「密码 + 2FA 动态码」重新登录一次，即可绑定 Passkey
* 绑定 2FA 时务必保存备用码

宽松期结束后恢复原有规则：在新环境中仅凭密码登录的账号，仍需环境稳定满 72 小时才能新增验证方式；已经绑定的验证方式不受影响。建议趁宽松期尽早完成绑定。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.