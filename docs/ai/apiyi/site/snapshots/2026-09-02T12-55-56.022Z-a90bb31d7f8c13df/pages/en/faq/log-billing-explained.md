> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How do I read the billing amounts in the logs?

> Understanding the Cost column in the console log: usage-based vs per-call billing, how to compute cost yourself from the usage field, why log amounts are pre-discount, and why failed calls never show up.

## Short answer

The **Cost column** on the [log page](https://api.apiyi.com/log) is the USD amount for that call. Four things explain everything you see there:

1. **Usage-based models** (most text models, plus gpt-image-2, the SeeDance 2.0 family and others) return token counts in the response's **`usage` field**, so cost is computable client-side;
2. **Per-call models** return **no amount in the response**, but the unit price is fixed, so cost = calls × fixed price — equally easy to compute;
3. Log amounts are **pre-discount**: your real cost is that figure divided by your top-up bonus ratio (a 10% bonus means ÷1.1, roughly a 9% discount);
4. **The log only records successfully billed calls.** Errors are returned in the API response; a failed call that produced no charge never appears in the log and is not billed.

<Info>
  **One-liner**: per-call billing = fixed cost; usage-based billing = computed from tokens, returned in the response.
</Info>

## Reading each column

| Column     | Meaning                                                                                                                                   | Notes                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Time       | Settlement timestamp for the call, shown in your account timezone (UTC+0 by default, [keep it that way](/en/faq/log-timezone-and-export)) | Quote this when opening a ticket — it is the fastest way to locate a call |
| Model      | The model actually billed                                                                                                                 | Models with a group suffix are billed at that group's multiplier          |
| Info       | Streaming or not, time to first byte, etc.                                                                                                | Check time to first byte when investigating slow responses                |
| Prompt     | Input tokens                                                                                                                              | Images and audio in multimodal calls are converted into tokens here       |
| Completion | Output tokens                                                                                                                             | Reasoning tokens normally land in this column                             |
| Cost       | Amount for this call in USD, **pre-discount**                                                                                             | Group multiplier already applied; top-up bonus not yet applied            |

<Note>
  **Per-call models** may still show token counts in Prompt / Completion, but **the amount is not derived from those columns**. An easy tell: if repeated calls with the same parameters cost exactly the same, and the figure is a round number like 0.030000, it is per-call billing.
</Note>

## The two billing modes

<CardGroup cols={2}>
  <Card title="Usage-based (per token)" icon="gauge">
    The response's `usage` field returns token counts directly. Cost = input tokens × input rate + output tokens × output rate.

    **Applies to**: most text models, plus token-priced image and video models such as **gpt-image-2** and the **SeeDance 2.0** family.
  </Card>

  <Card title="Per-call (fixed unit price)" icon="hash">
    **No amount is returned** in the response, but each call has a fixed price, so cost = calls × unit price — the easiest case to budget.

    **Applies to**: most image and video models priced per image or per second. Look up rates on the Model Pricing page in the console.
  </Card>
</CardGroup>

## Can the API return the cost directly?

**It does not return an amount, but the cost is fully computable:**

* **Usage-based**: multiply the `usage` values by the rates yourself — these are the vendor's own token counts, more accurate than any estimate;
* **Per-call**: the unit price is fixed, so just multiply by the number of calls.

We deliberately keep the amount out of the response because the final cost of a call also depends on the **group multiplier** and on **your account's top-up bonus ratio**. Embedding a half-finished number in the response would make reconciliation more confusing, not less.

### Computing it from usage

Usage-based models return something like this:

```json theme={null}
{
  "usage": {
    "prompt_tokens": 905,
    "completion_tokens": 1629,
    "total_tokens": 2534,
    "prompt_tokens_details": {
      "cached_tokens": 512
    }
  }
}
```

The corresponding formula:

```text theme={null}
cost = (uncached input tokens × input rate)
     + (cached input tokens × cache-hit rate)
     + (output tokens × output rate)
```

<Tip>
  Cached input is billed at the **cache-hit rate** (typically around 0.1× the input rate), so on long-context workloads the logged amount can be far below a full-price estimate based on `prompt_tokens`. See [cache billing](/en/faq/cache-billing).
</Tip>

<Card title="Checking token counts for gpt-image-2" icon="image" href="/en/api-capabilities/gpt-image-2/overview">
  The pricing section of the model overview has measured data on how input and output images convert into tokens
</Card>

## Why log amounts are "pre-discount"

The log records the **raw amount computed from model rates**. Your real cost gets one more discount on top, because your top-up came with bonus credit:

```text theme={null}
actual cost = logged amount ÷ (1 + bonus ratio)
```

For example: a call logged at \$0.011 with a 10% top-up bonus actually costs `0.011 ÷ 1.1 = 0.01` — roughly a 9% discount.

| Top-up bonus  | Conversion | Effective discount |
| ------------- | ---------- | ------------------ |
| 10%           | ÷ 1.1      | about 9% off       |
| 12%           | ÷ 1.12     | about 11% off      |
| 15%           | ÷ 1.15     | about 13% off      |
| **20% (cap)** | ÷ 1.2      | **about 17% off**  |

<Card title="See the top-up bonus tiers" icon="gift" href="/en/faq/recharge-promotions">
  Bonus percentages per tier, first-time bonuses, and how credit is issued
</Card>

<Note>
  **No need to apply group discounts a second time**: a model group's multiplier is already applied at billing time, so the logged amount includes it. The only layer left to convert is the top-up bonus. See [model multipliers](/en/faq/model-multiplier).
</Note>

## Are failed calls billed?

**No — and they do not appear in the cost log at all.** This is the key to reading the log correctly:

<Warning>
  **Errors are returned in the API response; the console log exists to record successful billing.** So "no entry in the log" generally means "this call was not charged."
</Warning>

A typical example: calling **gpt-image-2** and getting

```text theme={null}
400 Your request was rejected by the safety system
```

Requests like this are **returned immediately with no retry**, so no cost record is created and nothing is billed. Likewise, when video models such as VEO or Sora 2 return a `PUBLIC_`-prefixed error, that is upstream content moderation — not billed, and safe to retry after adjusting the prompt.

<Tip>
  **The reverse is just as useful for debugging**: if a billing record **exists**, the request definitely reached upstream and consumed resources. If it **does not**, the failure almost certainly happened before reaching upstream (network, authentication, parameter validation). "Is there a billing record?" is often the strongest single signal when diagnosing connection issues.
</Tip>

<Note>
  **A pre-deduction hold is not a charge.** Before a request runs, the system freezes an estimated amount; if the request fails the hold is released, and settlement always follows actual usage. A balance that briefly dips and recovers is expected — see [the pre-deduction mechanism](/en/faq/pre-deduction-quota).
</Note>

## Common questions

<AccordionGroup>
  <Accordion title="Two calls to the same model cost very different amounts — is that normal?">
    Yes. Under usage-based billing the amount tracks usage. Common causes:

    * **Different input length**: long context, multi-turn history, images and audio all push input tokens up sharply
    * **Reasoning tokens**: models with reasoning enabled produce extra output tokens, counted in the Completion column
    * **Cache hits**: cached input is billed at a much lower rate, so the second run of the same prompt can be far cheaper
    * **Image/video parameters**: resolution, duration and image count directly drive token counts or call counts
  </Accordion>

  <Accordion title="The token counts in the log do not match my own count.">
    Trust the **`usage` field in the response** and the log — they come from the same source. Mismatches usually come from: multimodal content (images, audio) being converted into tokens by vendor-specific rules; system prompts and tool schemas counting as input; and reasoning tokens counting as output without appearing in the visible text.
  </Accordion>

  <Accordion title="Where do I find unit prices for per-call models?">
    Log in and check the Model Pricing page in the console, or the [model pricing overview](/en/pricing) on this site. Per-call prices are fixed, so cost is simply price × number of calls.
  </Accordion>

  <Accordion title="A call failed but I think I was charged. What now?">
    First check the log by timestamp to confirm whether a cost record was actually created. If there really is an abnormal charge, contact support with the **timestamp and model name from the log**. Losses caused by issues on our side are compensated with reissued credit — see [SLA guarantees](/en/faq/sla-guarantee).
  </Accordion>

  <Accordion title="Can I see the content I sent in the log?">
    No. For privacy and storage reasons the log keeps only what billing requires — time, model, token counts and amount — and **does not record request or response content**. See [how to view call records](/en/faq/call-logs).
  </Accordion>
</AccordionGroup>

## Related documents

* [How to view my call records?](/en/faq/call-logs)
* [What is the pre-deduction mechanism for API calls?](/en/faq/pre-deduction-quota)
* [Does APIYI support cache billing?](/en/faq/cache-billing)
* [What does the model multiplier mean?](/en/faq/model-multiplier)
* [What recharge promotions are available?](/en/faq/recharge-promotions)
* [What's the difference between token billing modes?](/en/faq/token-billing-modes)
