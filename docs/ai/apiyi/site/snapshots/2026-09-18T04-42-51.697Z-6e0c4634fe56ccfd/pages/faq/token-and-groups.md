> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 令牌与分组

> 了解 API易 令牌（API KEY）的作用、创建与编辑方法，以及分组的概念、默认分组与兜底分组的设置规则

## 令牌（API KEY）是什么

令牌就是您调用 API易 时使用的 **API KEY**，格式以 `sk-` 开头。它是您身份和权限的凭证，主要作用包括：

<CardGroup cols={2}>
  <Card title="身份认证" icon="shield">
    每次 API 调用都需要携带令牌，用于验证您的身份和账户。
  </Card>

  <Card title="额度与权限控制" icon="sliders-horizontal">
    可为单个令牌设置专属额度、过期时间、可用模型和分组。
  </Card>

  <Card title="调用统计" icon="chart-line">
    每个令牌的消耗、剩余额度、调用日志都可独立查看。
  </Card>

  <Card title="灵活分配" icon="users">
    可为不同项目、团队成员创建独立令牌，便于管理和隔离。
  </Card>
</CardGroup>

<Info>
  注册后系统会自动生成一个**默认令牌**，开箱即用。您也可以按需创建多个新令牌。
</Info>

## 如何创建令牌

<Steps>
  <Step title="进入令牌页面">
    打开顶部导航的「令牌」页面：[https://api.apiyi.com/token](https://api.apiyi.com/token)
  </Step>

  <Step title="点击「新增」">
    在页面右上角点击「新增」按钮，打开创建令牌弹窗。
  </Step>

  <Step title="填写令牌信息">
    设置令牌名称、额度（可开启无限额度）、有效期（可设永不过期）、计费模式和分组（详见下文）。
  </Step>

  <Step title="保存并复制 KEY">
    保存后，点击令牌右侧的复制图标，即可复制完整的 `sk-` 开头的 KEY。
  </Step>
</Steps>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增令牌" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增令牌" width="1284" height="1158" data-path="images/key-add-new.png" />

<Tip>
  创建新令牌时**不需要设定可用模型**。采用白名单机制：不设置则该令牌可使用全站 400+ 模型；设置后则只能使用指定模型。详见 [令牌模型白名单](/faq/token-model-whitelist)。
</Tip>

## 编辑令牌与查看代码示例

点击令牌最右侧「操作」列的**管理菜单（扳手图标）**，即可展开全部操作：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="令牌管理菜单与请求示例" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="令牌管理菜单与请求示例" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

| 操作              | 说明                                           |
| --------------- | -------------------------------------------- |
| **禁用令牌**        | 临时停用该令牌，调用将被拒绝                               |
| **编辑令牌**        | 修改名称、额度、有效期、计费模式、分组等                         |
| **请求示例**        | **查看代码示例**，提供该令牌的多语言调用代码（curl、Python 等），复制即用 |
| **令牌日志**        | 查看该令牌的调用记录                                   |
| **分享令牌 / 一键对接** | 快速分享或对接到第三方工具                                |

<Note>
  「请求示例」即**代码示例**入口。点击后会带上当前令牌生成可直接运行的调用代码，无需手动拼接 KEY 和接口地址，适合快速测试和接入。
</Note>

## 一个令牌多人共用，会限速吗

经常有客户问：**"我一个令牌给多个人用，会被限速吗？"**

答案是：**令牌本身没有限速**。限速跟随的是**账户**的限速，与令牌数量、使用人数无关——一个令牌给 10 个人用，和 10 个令牌各给 1 个人用，限速效果完全相同。

<CardGroup cols={2}>
  <Card title="RPM（每分钟请求数）" icon="gauge">
    一般来说，单个账户的限速在 **100 RPM** 以内都没有问题，足以覆盖绝大多数团队和应用场景。
  </Card>

  <Card title="TPM（每分钟 Token 数）" icon="infinity">
    **TPM 不考核**，无需担心单次请求上下文过长或并发 Token 量过大触发限制。
  </Card>
</CardGroup>

<Tip>
  多人共用令牌不影响速率，但从**管理角度**仍建议为不同成员或项目创建独立令牌：便于分别设置额度、独立查看调用日志和消耗统计。
</Tip>

## 什么是分组

**分组是令牌可选择的"资源通道"。** 不同分组对应不同的上游资源、可用模型范围和计费倍率，**开放给用户自行选择**。

简单理解：同一个模型可能由多条上游通道提供，分组就是让您选择走哪条通道。**不同的模型可能需要用到不同的分组**，选对分组才能正常调用并享受对应的折扣。

<Info>
  绝大多数情况下使用\*\*默认分组（Default）\*\*即可，它模型齐全，覆盖文本模型、NanoBanana 系列、Veo 3.1 等绝大部分模型。
</Info>

## 默认分组与兜底分组

同一个令牌最多可设置 **3 个分组**：**1 个默认分组 + 2 个兜底分组**。

<CardGroup cols={2}>
  <Card title="默认分组（主分组）" icon="circle-check">
    令牌优先使用的分组，通用绝大部分模型。每个令牌必须有 1 个默认分组。
  </Card>

  <Card title="兜底分组（备用）" icon="life-buoy">
    当默认分组无法满足请求时自动切换的备用通道，最多可设置 2 个，提高调用成功率。
  </Card>
</CardGroup>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="选择分组与兜底分组设置" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="选择分组与兜底分组设置" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

在创建或编辑令牌的弹窗中：

* **选择分组**：设置默认（主）分组，默认为 `Default`
* **兜底分组**：可添加 1\~2 个备用分组，当主分组不可用时自动兜底

<Tip>
  **分组会影响令牌的计费倍率和可用模型**，请根据实际使用的模型来选择。不确定时保持默认 `Default` 即可。
</Tip>

## 不同模型对应不同分组

默认分组通用绝大部分模型，但部分模型（尤其是**视频模型**）需要切换到专属分组才能调用：

| 模型 / 场景                           | 需要选择的分组             |
| --------------------------------- | ------------------- |
| 文本、多模态、NanoBanana、Veo 3.1 等绝大部分模型 | **Default**（默认分组）   |
| Sora 2 官转视频                       | **Sora2Official**   |
| 阿里 Wan & HappyHorse 视频系列          | **Wan\&HappyHorse** |

<Warning>
  调用 Sora 2 官转、Wan\&HappyHorse 等专属分组模型时，若令牌没有对应分组，会出现模型不可用的情况。建议将常用专属分组设为兜底分组，或为这类模型单独创建令牌。
</Warning>

## 分组一览

下图为系统提供的分组及说明（以控制台实际显示为准）：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="API易 令牌分组一览" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="API易 令牌分组一览" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<Note>
  表格中的「组倍率」为人民币计价的相对值，**并非直接的美元折扣比例**，无需深究。您只需选择与所用模型匹配的分组即可；想了解倍率与价格的换算，请参考 [系统里模型的【倍率】是什么？](/faq/model-multiplier)。
</Note>

## 相关文档

<CardGroup cols={2}>
  <Card title="令牌计费模式" icon="calculator" href="/faq/token-billing-modes">
    了解按量优先、按次优先等计费模式的区别。
  </Card>

  <Card title="令牌模型白名单" icon="list" href="/faq/token-model-whitelist">
    如何限制单个令牌可用的模型范围。
  </Card>

  <Card title="模型倍率说明" icon="percent" href="/faq/model-multiplier">
    理解倍率含义与价格计算规则。
  </Card>

  <Card title="调用日志查询" icon="file-text" href="/faq/call-logs">
    查看每个令牌的调用记录与消耗明细。
  </Card>
</CardGroup>
