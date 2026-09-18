> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 调用的预扣费机制是什么？

> 讲清 API易的预扣费（预扣额度）机制：请求前按模型价格和输入预估扣费、最终按实际结算，并教你看懂 insufficient_user_quota 报错。

## 简短回答

API易在每次请求**真正执行之前**，会先按「模型价格 × 预估 token 数」算出一笔**预扣费**（预估的最大可能花费），并临时冻结这笔额度。请求完成后**按实际消耗的 token 结算，多退少补**——预扣费只是估算，不是最终账单。

<Info>
  **核心两句话**

  * **预扣费**：请求前的估算，用来判断"你这次跑得起跑不起"。
  * **实际计费**：请求完成后按真实 token 结算，最终扣的是这个。
</Info>

如果**预扣费估算金额 > 当前账户余额**，请求会在执行前被直接拒绝，返回 `insufficient_user_quota`。这就是「明明还有余额，却跑不通」的根本原因。

## 预扣费是怎么运作的

<Steps>
  <Step title="请求前：估算并冻结">
    系统读取你这次的**输入内容**（prompt、图片、历史对话等），按当前模型的价格和**预估的输出长度**，算出一个**最大可能花费**，临时从余额里冻结。

    估算逻辑大致是：

    `预扣费 ≈ 模型价格 ×（输入 tokens + 预估输出 tokens）`
  </Step>

  <Step title="执行前校验：余额够不够">
    拿**预扣费**和你的**当前余额**比较：

    * 余额 ≥ 预扣费 → 放行，请求正常发出
    * 余额 \< 预扣费 → 直接拒绝，报 `insufficient_user_quota`，**不会真的发起调用**
  </Step>

  <Step title="请求后：按实际结算，多退少补">
    请求完成后，系统拿到真实的输入/输出 token 用量，按实际重新计费：

    * 实际花费**通常小于**预扣费 → 把多冻结的额度**退还**回余额
    * 失败/中断的请求 → 一般不计费，预扣额度释放
  </Step>
</Steps>

<Tip>
  **所以预扣费偏大不代表真的花这么多**——它是"按最坏情况预留"的估算。真正扣的钱以请求完成后的实际 token 为准。
</Tip>

## 看懂这条报错：insufficient\_user\_quota

当预扣费超过余额时，你会看到类似这样的返回：

```json theme={null}
{
  "error": {
    "message": "user [25359] quota [50264897] preConsumedQuota [154753475] is not enough",
    "localized_message": "Insufficient user quota",
    "type": "shell_api_error",
    "param": "",
    "code": "insufficient_user_quota"
  }
}
```

逐项拆解：

| 字段                              | 含义                       |
| ------------------------------- | ------------------------ |
| `quota [50264897]`              | 你账户**当前可用的余额**（内部额度单位）   |
| `preConsumedQuota [154753475]`  | 本次请求**预估要预扣的额度**         |
| `is not enough`                 | 预扣费 > 余额，余额不够冻结，**请求被拒** |
| `code: insufficient_user_quota` | 错误码：用户额度不足               |

关键看两个数字的**大小关系**：本例中预扣费 `154753475` ≈ 余额 `50264897` 的 **3 倍**，所以被拦下。

<Note>
  这两个数字是 API易 的**内部额度单位**，可以直接比较大小。换算成美元约为：余额 ≈ \$100，本次预扣费估算 ≈ \$310（内部约 500,000 单位 ≈ \$1）。也就是说，这一次请求想预扣 \$300 多，而账户只有 \$100，自然跑不通。
</Note>

## 为什么"有余额却跑不通"

绝大多数情况下，**问题出在输入太大**，而不是余额本身。

举个真实例子：`gpt-5.5` 的上下文窗口高达 1,050,000 tokens。如果你把**一个很大的代码仓库**整个塞进去，输入 token 极高，预扣费就会被顶到非常大的数额——哪怕你有 \$100 余额，预扣费估算到了 \$300，照样在执行前被拒。

<Warning>
  **输入越大，预扣费越高**

  超大输入不仅让预扣费飙升、容易触发 `insufficient_user_quota`，而且：

  * 即使跑通了，**实际花费也很高**（按真实 token 计费）；
  * 塞太多无关内容，模型反而**可能给出一般的结果**，钱花了效果还不好。
</Warning>

## 如何解决和避免

<CardGroup cols={2}>
  <Card title="精简输入" icon="scissors">
    只传**相关**的代码/文档，别把整个仓库或长文档一股脑塞进去。这是最有效的办法。
  </Card>

  <Card title="设置 max_tokens" icon="ruler">
    显式限制输出长度，可以压低"预估输出 tokens"，从而降低预扣费。详见 [max\_tokens 说明](/faq/max-tokens)。
  </Card>

  <Card title="充值余额" icon="credit-card">
    确实需要大输入时，保证余额 > 预扣费即可放行。见 [充值方式](/faq/payment-methods)。
  </Card>

  <Card title="先用小模型试" icon="flask-conical">
    用便宜的模型先验证输入是否合理，确认无误再切高端模型，避免"烧不起"。
  </Card>
</CardGroup>

<Tip>
  **慎跑大内容**：高上下文模型（如 `gpt-5.5` 的 105 万 tokens）能装很多，但"能装"不等于"该装"。塞一个大仓库往往既贵、效果又一般，先想清楚真正需要哪些上下文。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="预扣费会真的扣这么多钱吗？">
    不会。预扣费只是**请求前的临时冻结**，最终以请求完成后的**实际 token 用量**结算，多预扣的部分会退还。你看到的 `preConsumedQuota` 是"按最坏情况预留"的估算值，不是真实账单。
  </Accordion>

  <Accordion title="请求失败了会扣费吗？">
    一般不会。报 `insufficient_user_quota` 是在**执行前**就被拦下，根本没有真正调用模型，不产生实际费用，预扣额度也会释放。
  </Accordion>

  <Accordion title="我余额明明够，为什么还报额度不足？">
    报错比较的是**预扣费**和余额，不是"实际花费"和余额。你的输入太大导致预扣费估算远超余额，就会被拒。先精简输入，或设置 `max_tokens` 降低预估输出，再不行就充值。
  </Accordion>

  <Accordion title="上下文窗口大的模型是不是一定更贵？">
    模型单价由模型本身决定，**窗口大≠单价高**。但窗口大意味着你"能塞"的输入更多，一旦真塞满，输入 token 暴涨，预扣费和实际费用都会很高。贵的是"你塞进去的量"，不是窗口本身。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="为什么还有余额跑不通？" icon="credit-card" href="/faq/balance-insufficient">
    余额不足的完整排查与解决方案。
  </Card>

  <Card title="max_tokens 怎么设置？" icon="ruler" href="/faq/max-tokens">
    控制输出长度，影响预扣费估算。
  </Card>

  <Card title="视频任务按 task_id 查真实消费" icon="receipt" href="/faq/seedance-task-cost-lookup">
    异步视频的预扣 + 结算两条日志与任务 quota 的关系。
  </Card>

  <Card title="令牌计费模式" icon="coins" href="/faq/token-billing-modes">
    了解按量计费的结算方式。
  </Card>

  <Card title="充值方式" icon="credit-card" href="/faq/payment-methods">
    余额不足时如何快速充值。
  </Card>
</CardGroup>
