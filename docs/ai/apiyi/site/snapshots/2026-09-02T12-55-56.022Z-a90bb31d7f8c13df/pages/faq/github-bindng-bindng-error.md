> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GitHub 登录提示「该账户已绑定」怎么办？

> 解决使用 GitHub 一键登录 API易 时提示「该 GitHub 账户已绑定」的问题

## 简短回答

您需要在**同一个浏览器**中先登录 `github.com`，然后再到 API易 网站使用 GitHub 一键登录。**务必使用 Chrome 浏览器**操作。

## 问题现象

使用 GitHub 账号登录 API易 时，页面提示：

> 该 GitHub 账户已绑定

导致无法正常登录。

## 解决步骤

<Steps>
  <Step title="打开 Chrome 浏览器">
    请务必使用 **Chrome 浏览器**进行操作，避免使用其他浏览器（如 Safari、Firefox 等），以确保登录流程正常。
  </Step>

  <Step title="登录 GitHub">
    在 Chrome 浏览器中打开 `github.com`，确认您已登录到正确的 GitHub 账号。

    如果之前登录了其他 GitHub 账号，请先退出，再登录您绑定 API易 的那个账号。
  </Step>

  <Step title="登录 API易">
    在**同一个 Chrome 浏览器**中，打开 API易 网站，点击「GitHub 一键登录」按钮完成登录。

    <Warning>
      必须在同一个浏览器中完成以上两步操作，不能在不同浏览器中分别登录。
    </Warning>
  </Step>
</Steps>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么必须用 Chrome 浏览器？">
    Chrome 浏览器对 GitHub OAuth 登录流程的兼容性最好，其他浏览器可能会出现 Cookie 或会话同步问题，导致登录异常。
  </Accordion>

  <Accordion title="我用了 Chrome 但还是不行怎么办？">
    请尝试以下操作：

    * 清除 Chrome 浏览器的缓存和 Cookie
    * 确认 Chrome 没有使用无痕模式
    * 检查是否有浏览器插件阻止了第三方 Cookie
    * 退出 GitHub 后重新登录，再尝试一键登录 API易
  </Accordion>

  <Accordion title="我想换一个 GitHub 账号绑定怎么办？">
    如需更换绑定的 GitHub 账号，请联系客服协助处理。
  </Accordion>
</AccordionGroup>

## 联系我们

<Card title="联系客服" icon="message-circle">
  如果按照上述步骤操作后仍无法解决，请联系客服获取帮助。
</Card>
