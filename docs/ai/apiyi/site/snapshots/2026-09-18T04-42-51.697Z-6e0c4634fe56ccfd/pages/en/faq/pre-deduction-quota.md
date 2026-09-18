> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What is the pre-deduction mechanism for API calls?

> How APIYI's pre-deduction (pre-consumed quota) works: it estimates a hold from model price and input before the request, then settles by actual usage — plus how to read the insufficient_user_quota error.

## Quick answer

Before a request **actually runs**, APIYI computes a **pre-deduction** ("model price × estimated tokens" — the maximum possible cost) and temporarily holds that amount from your balance. Once the request finishes, it **settles by the actual tokens consumed and refunds the difference** — the pre-deduction is only an estimate, not the final bill.

<Info>
  **Two key lines**

  * **Pre-deduction**: a pre-request estimate, used to decide "can you afford this call."
  * **Actual billing**: settled by real tokens after the request completes — this is what's truly charged.
</Info>

If the **pre-deduction estimate > your current balance**, the request is rejected before it runs, returning `insufficient_user_quota`. That's the root cause of "I clearly have balance, yet it won't go through."

## How pre-deduction works

<Steps>
  <Step title="Before the request: estimate and hold">
    The system reads your **input** (prompt, images, conversation history, etc.) and, using the model's current price and an **estimated output length**, computes a **maximum possible cost** and temporarily holds it from your balance.

    The estimate is roughly:

    `pre-deduction ≈ model price × (input tokens + estimated output tokens)`
  </Step>

  <Step title="Pre-flight check: is the balance enough">
    It compares the **pre-deduction** against your **current balance**:

    * balance ≥ pre-deduction → allowed, the request goes out
    * balance \< pre-deduction → rejected with `insufficient_user_quota`, and **no call is actually made**
  </Step>

  <Step title="After the request: settle by actual, refund the difference">
    Once complete, the system takes the real input/output token usage and re-bills by actual:

    * actual cost is **usually less than** the pre-deduction → the over-held quota is **refunded** to your balance
    * failed/aborted requests → generally not billed, and the held quota is released
  </Step>
</Steps>

<Tip>
  **A large pre-deduction does not mean you actually spent that much** — it's a "reserve for the worst case" estimate. What's truly charged is the actual tokens after the request completes.
</Tip>

## Reading the insufficient\_user\_quota error

When the pre-deduction exceeds your balance, you'll see something like:

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

Field by field:

| Field                           | Meaning                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| `quota [50264897]`              | Your **currently available balance** (internal quota unit)        |
| `preConsumedQuota [154753475]`  | The **quota this request wants to pre-deduct**                    |
| `is not enough`                 | pre-deduction > balance, not enough to hold, **request rejected** |
| `code: insufficient_user_quota` | Error code: insufficient user quota                               |

What matters is the **ratio** between the two numbers: here the pre-deduction `154753475` is about **3×** the balance `50264897`, so it's blocked.

<Note>
  These numbers are APIYI's **internal quota units** and are directly comparable. In USD terms: balance ≈ \$100, this request's pre-deduction estimate ≈ \$310 (internally \~500,000 units ≈ \$1). In other words, this single request tried to hold over \$300 while the account only had \$100 — so it couldn't run.
</Note>

## Why "I have balance but it won't run"

In the vast majority of cases, **the problem is an oversized input**, not the balance itself.

A real example: `gpt-5.5` has a context window of up to 1,050,000 tokens. If you stuff **an entire large code repository** into it, the input token count is enormous and the pre-deduction balloons — even with a \$100 balance, an estimate of \$300 still gets rejected before the request runs.

<Warning>
  **The bigger the input, the higher the pre-deduction**

  Oversized input not only inflates the pre-deduction and easily triggers `insufficient_user_quota`, but also:

  * even if it goes through, the **actual cost is high** (billed by real tokens);
  * stuffing in too much irrelevant content can make the model **return a mediocre result** — money spent, poor outcome.
</Warning>

## How to fix and avoid it

<CardGroup cols={2}>
  <Card title="Trim the input" icon="scissors">
    Send only the **relevant** code/docs — don't dump an entire repo or a long document all at once. This is the most effective fix.
  </Card>

  <Card title="Set max_tokens" icon="ruler">
    Explicitly cap the output length to lower the "estimated output tokens" and thus the pre-deduction. See [max\_tokens guide](/en/faq/max-tokens).
  </Card>

  <Card title="Top up your balance" icon="credit-card">
    If you genuinely need a large input, just ensure balance > pre-deduction. See [payment methods](/en/faq/payment-methods).
  </Card>

  <Card title="Test with a small model first" icon="flask-conical">
    Validate that your input is reasonable on a cheap model, then switch to the high-end one — avoid "burning more than you can afford."
  </Card>
</CardGroup>

<Tip>
  **Be cautious with large inputs**: high-context models (like `gpt-5.5`'s 1.05M tokens) can hold a lot, but "can hold" doesn't mean "should hold." Stuffing in a whole repo is often both expensive and mediocre — think first about which context you actually need.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Will the pre-deduction actually charge that much?">
    No. The pre-deduction is just a **temporary hold before the request**; the final charge is settled by the **actual token usage** after the request completes, and the over-held portion is refunded. The `preConsumedQuota` you see is a "worst-case reserve" estimate, not the real bill.
  </Accordion>

  <Accordion title="Am I charged if the request fails?">
    Generally no. An `insufficient_user_quota` error is blocked **before execution**, so the model is never actually called, no real cost is incurred, and the held quota is released.
  </Accordion>

  <Accordion title="My balance is clearly enough — why the quota error?">
    The error compares the **pre-deduction** against your balance, not "actual cost" against balance. An oversized input makes the pre-deduction estimate far exceed your balance, so it's rejected. Trim the input first, or set `max_tokens` to lower the estimated output, and top up if still needed.
  </Accordion>

  <Accordion title="Are large-context models always more expensive?">
    A model's unit price is set by the model itself — a **bigger window ≠ a higher unit price**. But a bigger window means you *can* feed more input, and once you actually fill it, input tokens spike and both the pre-deduction and the actual cost get high. What's expensive is "how much you put in," not the window itself.
  </Accordion>
</AccordionGroup>

## Related docs

<CardGroup cols={2}>
  <Card title="Why won't it run despite having balance?" icon="credit-card" href="/en/faq/balance-insufficient">
    Full troubleshooting and fixes for insufficient balance.
  </Card>

  <Card title="How to set max_tokens?" icon="ruler" href="/en/faq/max-tokens">
    Control output length, which affects the pre-deduction estimate.
  </Card>

  <Card title="Look up a video task's real cost by task_id" icon="receipt" href="/en/faq/seedance-task-cost-lookup">
    How the pre-charge and settlement log entries relate to the task's quota.
  </Card>

  <Card title="Token billing modes" icon="coins" href="/en/faq/token-billing-modes">
    Understand how usage-based settlement works.
  </Card>

  <Card title="Payment methods" icon="credit-card" href="/en/faq/payment-methods">
    How to top up quickly when balance is low.
  </Card>
</CardGroup>
