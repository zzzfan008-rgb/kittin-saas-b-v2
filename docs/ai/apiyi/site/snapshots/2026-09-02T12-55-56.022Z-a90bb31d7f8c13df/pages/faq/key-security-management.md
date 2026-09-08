> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何安全地管理 API Key？

> 从令牌权限设置到日常使用习惯，系统说明 API Key 的安全管理方法，包括 IP 白名单、模型白名单、额度限制和防泄漏排查

## 简短回答

一个 KEY 的最大可用额度就是你的**账户余额**——这意味着任何一个 KEY 泄漏，损失上限都是账户里的全部余额。

安全管理 KEY 的核心是四件事：**按用途分开发放、给每个 KEY 加上权限边界、控制单个 KEY 的额度上限、不让 KEY 出现在任何可能被别人看到的地方。**

<Warning>
  **最容易被忽略的一条**：给 KEY 开启「无限额度」等于把账户余额的全部风险敞口交给了这一个 KEY。测试用的 KEY 尤其要设额度上限。
</Warning>

## 一、给令牌加上权限边界

创建令牌时勾选\*\*「启用高级选项」\*\*，可以看到 IP 白名单和可用模型两项设置。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-advanced-options.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=7c84c17523049b5806fea2ebcff96ea8" alt="创建令牌的高级选项：可用模型与 IP 白名单" width="1246" height="1192" data-path="images/token-security-advanced-options.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-advanced-options.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=7c84c17523049b5806fea2ebcff96ea8" alt="创建令牌的高级选项：可用模型与 IP 白名单" width="1246" height="1192" data-path="images/token-security-advanced-options.png" />

### IP 白名单（推荐用于生产环境）

这是**防护效果最强的一项**。设置后，只有来自指定 IP 的请求才能使用该令牌，KEY 即使泄漏，别人在其它机器上也用不了。

| 填写格式    | 示例               |
| ------- | ---------------- |
| 单个 IP   | `192.168.1.1`    |
| CIDR 网段 | `192.168.1.0/24` |
| 多个地址    | 可一并填写多条          |

<Tip>
  生产环境的服务器 IP 通常是固定的，非常适合开启 IP 白名单。填写你的**服务器公网出口 IP**，不是内网 IP。
</Tip>

<Warning>
  **动态 IP 环境不要开**。家用宽带、办公网络的出口 IP 会变化，开启后 IP 一变就会全部调用失败。这类场景请改用额度限制来控制风险。
</Warning>

### 可用模型白名单（用于专用令牌）

「可用模型」**留空表示不限制**，可以调用全站模型；一旦填写，该令牌就**只能**用你指定的这几个模型。

这是一把双刃剑：

<CardGroup cols={2}>
  <Card title="适合的场景" icon="circle-check">
    专款专用的令牌。比如只跑图像生成的服务、分享给外部协作方的令牌、按模型做预算隔离。
  </Card>

  <Card title="不适合的场景" icon="circle-x">
    日常自用和探索性测试。设置后换模型就要回控制台改配置，还容易因模型别名对不上而调用失败。
  </Card>
</CardGroup>

<Note>
  一般情况下**不建议设置**可用模型。详细的取舍分析见 [令牌需要设置可用模型吗？](/faq/token-model-whitelist)
</Note>

## 二、给令牌设置额度上限

这是**所有人都应该做**的一项，尤其是测试用的令牌。

创建令牌时关闭「无限额度」开关，在「授权额度」里填一个数字，也可以直接点下方的快捷选项（\$5 / \$20 / \$50 / \$100 / \$200 / \$500）。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-quota.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=2b37947ea48dc8503723b6fef3e67171" alt="令牌授权额度设置：关闭无限额度并指定金额" width="1256" height="1024" data-path="images/token-security-quota.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/FBHa7JBOo1YFoQia/images/token-security-quota.png?fit=max&auto=format&n=FBHa7JBOo1YFoQia&q=85&s=2b37947ea48dc8503723b6fef3e67171" alt="令牌授权额度设置：关闭无限额度并指定金额" width="1256" height="1024" data-path="images/token-security-quota.png" />

额度的意义在于**把损失锁死在一个可承受的数字上**：

* 设了 \$20 额度的 KEY 泄漏，最多损失 \$20
* 开着「无限额度」的 KEY 泄漏，损失上限是你的**全部账户余额**

<Info>
  令牌的最大可用额度**受限于账户余额**。给令牌设置 \$500 额度并不会预扣或冻结这笔钱，它只是这个令牌的消耗上限；实际能花多少仍取决于账户里还有多少余额。
</Info>

## 三、生产与测试环境的 KEY 分开管理

不要用同一个 KEY 同时跑线上业务和本地测试。分开之后，测试环境出问题时可以直接停用对应令牌，不影响线上。

|            | 生产环境 KEY        | 测试环境 KEY              |
| ---------- | --------------- | --------------------- |
| **IP 白名单** | 建议开启（服务器 IP 固定） | 一般不开（IP 会变）           |
| **授权额度**   | 按业务量预估，留出余量     | **必须设置**，建议 \$5\~\$50 |
| **可用模型**   | 按需，稳定业务可锁定      | 留空，方便切换模型             |
| **有效期**    | 可设永不过期          | 建议设置过期时间              |
| **数量**     | 按项目/服务拆分        | 按测试任务拆分，用完即停用         |

<Tip>
  在控制台给令牌起**有辨识度的名字**（如 `prod-图像服务`、`test-模型对比-0729`），比默认名称更容易在出问题时快速定位和停用。相关操作见 [令牌与分组](/faq/token-and-groups)。
</Tip>

## 四、不要让 KEY 出现在这些地方

### 代码仓库

这是最常见的泄漏渠道。KEY 一旦提交进 Git，**即使后来删掉文件，它仍然留在提交历史里**，任何能访问仓库的人都能翻出来。

正确做法是从环境变量读取：

```python theme={null}
import os

api_key = os.environ["APIYI_API_KEY"]   # 正确
api_key = "sk-your-api-key"             # 错误：真 KEY 写死在代码里
```

把 `.env` 加进 `.gitignore`，并且**在提交前扫一遍**。可以用这条命令自查：

```bash theme={null}
grep -rnE '(^|[^A-Za-z0-9])sk-[A-Za-z0-9]{10,}' .
```

<Note>
  命令里 `(^|[^A-Za-z0-9])` 这段是必要的。少了它，`task-`、`risk-`、`disk-` 这类单词内部的 `sk-` 会产生大量误报，淹没真正的问题。
</Note>

### 对外文档、截图、日志

发布对外文档或技术分享前，检查一遍正文、代码示例和**截图**。控制台截图、终端录屏、报错日志里都可能带着完整的 KEY。示例统一写成 `sk-your-api-key` 这类占位符。

<Warning>
  **公开的 GitHub 仓库尤其危险**。公开仓库会被自动化程序持续扫描，泄漏的 KEY 往往在几分钟内就被利用。发布开源项目前务必确认代码和历史提交里都没有真实 KEY。
</Warning>

### 与 AI / AI Agent 的对话

这是近两年新增的一条风险路径，也是最容易被低估的一条。

把 KEY 直接粘贴进对话框看起来是"临时"的，但实际上：

<CardGroup cols={2}>
  <Card title="会话记录会落盘" icon="hard-drive">
    AI 编码工具通常把完整对话以明文保存在本机文件里，长期留存，不会自动清理。
  </Card>

  <Card title="恢复会话会重传" icon="repeat">
    恢复历史会话时，整段记录会作为上下文重新发送一次，KEY 并非静止不动。
  </Card>

  <Card title="文件快照也有副本" icon="copy">
    工具在改动文件前后往往会存快照，含 KEY 的脚本会因此多出若干份拷贝。
  </Card>

  <Card title="本机进程都能读" icon="folder-open">
    这些文件对**任何以你的身份运行的程序**都可读，防护面比代码仓库还弱。
  </Card>
</CardGroup>

<Tip>
  **给 AI 和 Agent 用的 KEY，一律用临时 KEY**：单独创建、设一个小额度（如 \$5）、设置较短的有效期，任务结束后立刻在控制台删除。绝不要把生产 KEY 交给 AI 工具。
</Tip>

## KEY 已经泄漏了怎么办

<Steps>
  <Step title="立刻删除或禁用该令牌">
    进入 [令牌页面](https://api.apiyi.com/token)，找到对应令牌直接删除或禁用。这是唯一能立即止损的动作，**优先于任何排查工作**。
  </Step>

  <Step title="创建新令牌替换">
    重新创建令牌，这次按上文加上额度上限和必要的权限边界，再更新到你的应用配置里。
  </Step>

  <Step title="查调用日志确认影响">
    在 [调用日志](/faq/call-logs) 里核对泄漏期间是否有异常调用——陌生的模型、异常的调用量、不该出现的时间段。
  </Step>

  <Step title="清理泄漏源">
    找到 KEY 到底泄漏在哪里（代码、文档、截图、对话记录），逐一清理干净，否则换了新 KEY 还会再泄一次。
  </Step>
</Steps>

## 常见问题

<AccordionGroup>
  <Accordion title="设置了 IP 白名单，调用全部失败怎么办？">
    多半是填错了 IP。要填的是服务器的**公网出口 IP**，不是 `192.168.x.x` 这类内网地址。

    如果你在家用宽带或办公网络下调用，出口 IP 会随运营商变动，这类环境不适合开 IP 白名单，建议改用额度限制来控制风险。

    临时排查时可以先把 IP 白名单清空，确认调用恢复正常后再逐步补回正确的 IP。
  </Accordion>

  <Accordion title="给令牌设置额度会预先扣钱或冻结余额吗？">
    不会。授权额度只是这个令牌的**消耗上限**，不是预付或冻结。

    你可以给 5 个令牌各设 \$100 额度，而账户里只有 \$50——它们共享这 \$50，谁先花完就都用不了了。令牌的最大可用额度始终受限于账户余额。
  </Accordion>

  <Accordion title="一个账户可以创建多少个令牌？">
    没有数量限制，按需创建即可。

    建议按**项目 + 环境**的维度拆分，例如 `prod-客服机器人`、`prod-图像服务`、`test-模型评测`。拆得细一点的好处是：出问题时可以精准停用某一个，不影响其它业务；每个令牌的消耗和日志也能独立查看。
  </Accordion>

  <Accordion title="令牌额度用完了，是不是就废了？">
    不是。额度用完后调用会被拒绝，但令牌本身还在，在控制台**编辑令牌、调高授权额度**即可继续使用，不需要重新创建和更换配置。

    这也是设额度上限的好处之一：它是一道可恢复的刹车，而不是一次性的销毁。
  </Accordion>

  <Accordion title="怎么判断某个 KEY 是不是正在被别人使用？">
    看调用日志。重点关注三个信号：**你没用过的模型**、**不在你工作时间段的调用**、**与业务量明显不符的请求数**。

    详细的排查方法见 [如何排查 KEY 的异常消耗？](/faq/troubleshoot-key-usage)
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="令牌与分组" icon="key" href="/faq/token-and-groups">
    令牌的创建、编辑与分组设置的完整说明。
  </Card>

  <Card title="令牌模型白名单" icon="list" href="/faq/token-model-whitelist">
    可用模型该不该设，以及设置后的注意事项。
  </Card>

  <Card title="排查 KEY 异常消耗" icon="search" href="/faq/troubleshoot-key-usage">
    通过日志锁定真实调用方与异常来源。
  </Card>

  <Card title="平台数据安全" icon="shield" href="/faq/data-security">
    API易 平台侧的加密传输与数据保护机制。
  </Card>
</CardGroup>

<Info>
  安全无小事。以上设置都在 [令牌管理页面](https://api.apiyi.com/token) 完成，花几分钟配置好，能挡掉绝大多数风险。
</Info>
