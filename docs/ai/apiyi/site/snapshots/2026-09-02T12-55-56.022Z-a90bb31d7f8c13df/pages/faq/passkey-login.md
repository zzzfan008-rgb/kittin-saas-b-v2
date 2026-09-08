> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何使用 Passkey 登录？

> API易 已支持 Passkey（通行密钥）登录：在个人中心一键绑定，之后用指纹、面容或设备锁屏密码即可登录，无需记密码，也不怕钓鱼和撞库。

## 简短回答

API易 新增了 **Passkey（通行密钥）** 登录方式。绑定后，在常用电脑上登录只需**指纹 / 面容 / 设备锁屏密码**验证一下，不用再输入账号密码。

绑定入口：登录后进入 **个人中心 → 页面底部「账户选项」→ 绑定 Passkey**，地址是 `https://api.apiyi.com/account/profile`。

<Info>
  **为什么值得绑**：不用再记密码（忘记密码是最常见的登录求助），且 Passkey 天生防钓鱼、防撞库——私钥只留在你的设备或密码管理器里，服务器上没有可被盗取的密码。
</Info>

## 什么是 Passkey

Passkey 是基于 WebAuthn / FIDO2 标准的无密码登录方式。绑定时设备会生成一对密钥：

* **私钥**保存在你的设备安全芯片或密码管理器里，**永不上传**；
* **公钥**保存在 API易 服务器上，只能用于校验，无法反推出私钥。

登录时由设备用私钥完成一次签名，你只需通过**指纹、面容或锁屏密码**授权本次签名即可。

<CardGroup cols={3}>
  <Card title="不怕忘密码" icon="face-slightly-smiling">
    有指纹设备就能一键登录，不必再走邮箱重置流程
  </Card>

  <Card title="天生防钓鱼" icon="shield">
    Passkey 与域名绑定，仿冒站点即使长得一模一样也无法触发验证
  </Card>

  <Card title="不怕撞库" icon="database">
    服务器上没有可被拖走的密码，其他站点泄露也波及不到这里
  </Card>
</CardGroup>

## 如何绑定

<Warning>
  **前提**：绑定操作必须在**已登录状态**下进行。也就是说，Passkey 是给已有账号增加一种登录方式，不能用来直接注册新账号。
</Warning>

<Steps>
  <Step title="进入个人中心">
    登录后打开 `https://api.apiyi.com/account/profile`，或从左侧导航点击\*\*「个人中心」\*\*。
  </Step>

  <Step title="滑到页面底部，找到「账户选项」">
    在页面最下方的\*\*「账户选项」\*\*卡片里，点击 **「绑定 Passkey」** 按钮。

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="个人中心底部的账户选项与绑定 Passkey 按钮" width="1100" height="818" data-path="images/passkey-bind-entry.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-bind-entry.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=da1fed1a77375353d8c18757f1c97bb6" alt="个人中心底部的账户选项与绑定 Passkey 按钮" width="1100" height="818" data-path="images/passkey-bind-entry.png" />
  </Step>

  <Step title="在弹窗里选择保存位置">
    浏览器会弹出系统对话框，询问「选择保存 apiyi.com 通行密钥的位置」。根据你的设备和习惯选择一种：

    <img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="选择保存通行密钥的位置" width="896" height="1010" data-path="images/passkey-save-location.png" />

    <img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-save-location.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=e072625a14951e7bd893eac489745d79" alt="选择保存通行密钥的位置" width="896" height="1010" data-path="images/passkey-save-location.png" />

    | 保存位置          | 适合谁                    | 特点                 |
    | ------------- | ---------------------- | ------------------ |
    | iCloud 钥匙串    | Mac / iPhone / iPad 用户 | 在自己的 Apple 设备间自动同步 |
    | Google 密码管理工具 | Chrome / Android 用户    | 跨设备同步，换电脑也能用       |
    | 手机、平板或安全密钥    | 想在别人的电脑上临时登录           | 电脑端扫码，用手机完成验证      |
    | 本机浏览器配置文件     | 固定使用的常用电脑              | 只存在这台机器上，不同步       |
  </Step>

  <Step title="完成验证，绑定成功">
    按提示用**指纹、面容或锁屏密码**确认，即绑定完成。之后在登录页选择 Passkey 登录，验证一下就能进入。
  </Step>
</Steps>

## 如何查看与解绑

绑定后再回到**个人中心 → 账户选项**，按钮会变成 **「解绑 Passkey」**，并在旁边显示**最后使用时间**——可以用它确认自己的 Passkey 是否被使用过、什么时候用的。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="已绑定状态下显示解绑 Passkey 与最后使用时间" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/U-zems6En1cBGq94/images/passkey-unbind-status.png?fit=max&auto=format&n=U-zems6En1cBGq94&q=85&s=8837d8cccc7975fc3cf6c1443975753a" alt="已绑定状态下显示解绑 Passkey 与最后使用时间" width="1642" height="300" data-path="images/passkey-unbind-status.png" />

需要解绑时点击 **「解绑 Passkey」** 即可。解绑后账号回到原有的登录方式，不影响余额、令牌和调用记录。

<Tip>
  **建议换设备前先解绑或补绑**：如果 Passkey 只保存在某台机器的浏览器配置文件里（不同步），换电脑或重装系统后这把钥匙就没了。用 iCloud 钥匙串或 Google 密码管理工具保存则不受影响。
</Tip>

## 注意事项

<Warning>
  **务必保留一种备用登录方式**。Passkey 是新增的登录方式，不是替代品——请确保你的密码仍然可用、注册邮箱仍能收信，或已绑定 GitHub 登录。设备丢失且没有备用方式时，找回流程会麻烦得多。
</Warning>

* **不要在公用电脑上绑定**：Passkey 存在设备上，公用或他人电脑绑定后等于把登录能力留在了那台机器。临时登录请用「手机、平板电脑或安全密钥」方式，扫码后在自己手机上验证。
* **认准域名再验证**：正常绑定和登录时，弹窗里显示的域名应为 `apiyi.com`。域名不对就不要继续——这也正是 Passkey 防钓鱼的机制所在。
* **同步范围看保存位置**：iCloud 钥匙串在 Apple 设备间同步，Google 密码管理工具跨设备同步，浏览器本地配置文件则不同步。选哪种取决于你是否需要在多台设备上登录。
* **Passkey 与 API Key 是两回事**：Passkey 只用于登录网站后台，不影响 API 调用；API 调用的密钥安全另见 [如何安全地管理 API Key](/faq/key-security-management)。
* **浏览器要求**：需要较新版本的 Chrome、Edge、Safari 或 Firefox，且设备支持指纹 / 面容 / 锁屏密码验证。老旧浏览器可能不显示绑定入口。

## 常见问题

<AccordionGroup>
  <Accordion title="绑定 Passkey 后还能用密码登录吗？">
    可以。Passkey 是**增加**一种登录方式，原有的密码登录、GitHub 登录都照常可用。建议至少保留一种备用方式。
  </Accordion>

  <Accordion title="换了电脑，Passkey 还能用吗？">
    取决于绑定时选的保存位置：存在 **iCloud 钥匙串**或 **Google 密码管理工具**里的会跨设备同步，新电脑登录同一账户后即可使用；只存在**本机浏览器配置文件**里的则不会同步，需要在新设备上重新绑定。
  </Accordion>

  <Accordion title="手机丢了 / 设备坏了怎么办？">
    用备用方式登录（密码或 GitHub），进入个人中心解绑旧的 Passkey，再在新设备上重新绑定。这也是我们强调要保留备用登录方式的原因。
  </Accordion>

  <Accordion title="可以绑定多个设备吗？">
    如果保存在 iCloud 钥匙串或 Google 密码管理工具中，同一把 Passkey 会自动同步到你的其他设备，通常无需重复绑定。若需要在互不同步的体系间使用（例如既有 Mac 又有 Android），可在解绑后于另一体系重新绑定，或用「手机、平板电脑或安全密钥」的扫码方式临时登录。
  </Accordion>

  <Accordion title="Passkey 会泄露我的指纹信息吗？">
    不会。指纹和面容数据**只在你的设备本地校验**，从不上传给网站。API易 服务器上保存的只是一段无法反推私钥的公钥。
  </Accordion>

  <Accordion title="点了绑定却没有弹窗？">
    常见原因：浏览器版本过旧、设备未设置锁屏密码或生物识别、浏览器禁用了相关权限、或使用了不支持 WebAuthn 的内嵌浏览器（如部分 App 内置浏览器）。请换用最新版 Chrome / Edge / Safari 并在系统里开启锁屏验证后重试。
  </Accordion>
</AccordionGroup>

## 相关文档

* [忘记密码了怎么办？](/faq/forgot-password)
* [GitHub 登录提示「该账户已绑定」怎么办？](/faq/github-bindng-bindng-error)
* [如何安全地管理 API Key？](/faq/key-security-management)
* [API易 支持哪些邮箱注册？](/faq/email-registration)
* [API易 如何保障数据安全？](/faq/data-security)
