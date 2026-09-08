> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek Raises Prices: Three Options for Third-Party Gateways

> DeepSeek moves to peak/off-peak billing at 00:00 on 17 August (UTC+8), with off-peak rates still above the old prices and peak output up 4.7x. A breakdown of the change, the concurrency ceiling behind it, and the three pricing options gateways face.

## Key Points

* **Effective date**: the official notice reads `16:00 UTC on August 16, 2026` — that is **00:00 on 17 August, UTC+8**
* **Not a time-of-day discount — an across-the-board increase, then split into tiers**: off-peak is half of peak, but **off-peak itself is above the old price**. `deepseek-v4-flash` output goes from \$0.28 to \$0.66 off-peak and \$1.32 at peak
* **Cache-hit input rises the most**: `deepseek-v4-pro` cache-hit input goes from \$0.003625 to \$0.044 at peak, roughly 12x
* **The driver is concurrency, not unit cost**: the official docs set account-level concurrency at 500 for `deepseek-v4-pro` and 2,500 for `deepseek-v4-flash`, with 429s beyond that; DeepSeek describes the change as allocating resources more reasonably
* **APIYI bills at the peak tier, fixed**: no time-of-day variation, because covering official capacity shortfalls requires pricier backup routes — we take no margin on this, and recharge bonuses still stack

## Background

DeepSeek's last pricing move went the other way. When the V4 family launched this year it put input at \$0.14 and output at \$0.28 per million tokens — among the cheapest in its class, which is exactly why it became the default substrate for batch workloads and long-running agent chains.

This time the direction reverses. The official pricing page now carries a notice: the API moves to peak and off-peak billing, off-peak set at half the peak rate, effective `16:00 UTC on August 16, 2026`. DeepSeek's stated reason is restrained — to allocate resources more reasonably, and to encourage users to schedule work around actual usage.

What matters here is not how much prices rose but **the form the increase takes**. Time-of-day billing pushes cost uncertainty onto the caller. For an individual developer hitting the API directly, that means batch jobs can move to the small hours. For a gateway aggregating traffic from many customers, it is a pricing question that has to be answered before the deadline.

Data in this article comes from DeepSeek's official pricing page `api-docs.deepseek.com/quick_start/pricing` and rate-limit documentation `api-docs.deepseek.com/quick_start/rate_limit`, retrieved 15 August 2026.

## The Change in Detail

### New rates

`deepseek-v4-flash` (per 1M tokens):

| Item             | Before   | Off-peak (new) | Peak (new) | Peak multiple |
| ---------------- | -------- | -------------- | ---------- | ------------- |
| Cache-hit input  | \$0.0028 | \$0.007        | \$0.014    | 5.0x          |
| Cache-miss input | \$0.14   | \$0.22         | \$0.44     | 3.1x          |
| Output           | \$0.28   | \$0.66         | \$1.32     | 4.7x          |

`deepseek-v4-pro` (per 1M tokens):

| Item             | Before     | Off-peak (new) | Peak (new) | Peak multiple |
| ---------------- | ---------- | -------------- | ---------- | ------------- |
| Cache-hit input  | \$0.003625 | \$0.022        | \$0.044    | 12.1x         |
| Cache-miss input | \$0.435    | \$0.66         | \$1.32     | 3.0x          |
| Output           | \$0.87     | \$1.98         | \$3.96     | 4.6x          |

<Warning>
  The phrase "off-peak at half the peak rate" is easy to misread: **off-peak is not a discount — it is still higher than the old price**. Take `deepseek-v4-flash` output: even if every call lands off-peak, the rate goes from \$0.28 to \$0.66, 2.4x what it was.
</Warning>

### How the windows are drawn

Peak hours are **01:00–04:00 and 06:00–10:00 UTC**; everything else is off-peak. In UTC+8:

| Window        | UTC                | UTC+8              |
| ------------- | ------------------ | ------------------ |
| Peak window 1 | 01:00–04:00        | 09:00–12:00        |
| Peak window 2 | 06:00–10:00        | 14:00–18:00        |
| Off-peak      | remaining 17 hours | remaining 17 hours |

Look closely at those two windows: **09:00–12:00 and 14:00–18:00 (UTC+8) are precisely the two blocks of a Chinese working day**. Peak covers only 7 hours out of 24, which sounds modest — but for workloads serving users in that timezone, the bulk of real traffic sits inside those 7 hours. Off-peak falls across the night, early morning, and the lunch break; the only thing that can realistically move there is offline batch processing.

The window design is not incidental. It is aimed squarely at shaving the peak.

### The root cause: concurrency is a hard ceiling

The rate-limit documentation is more revealing than the price table:

| Model               | Account-level concurrency |
| ------------------- | ------------------------- |
| `deepseek-v4-pro`   | 500                       |
| `deepseek-v4-flash` | 2,500                     |

A request counts as one concurrent connection from dispatch until the response completes; going over returns 429. The same document notes that capacity expansion can be requested and that **expansion itself carries no additional cost**, with per-`user_id` isolation once granted.

Read that last point in reverse and it says a lot: **the lever rationing capacity is approval and physical compute, not price**. Industry coverage points the same way — demand growth has outrun capacity expansion, and under a supply constraint a price rise follows. Time-of-day billing is not there to earn more; it is there to push some of the load out of those 7 hours into the other 17.

For a third-party gateway, that concurrency ceiling is the painful part. A gateway aggregates traffic from hundreds or thousands of customers, so an account-level cap gets saturated easily during business hours, and expansion runs through an approval cycle. **That is why a gateway needs backup routes in the first place.**

## Three Options for Third-Party Gateways

Once time-of-day billing reaches the middle layer, there are only three exits.

<CardGroup cols={3}>
  <Card title="Option 1: Follow the tiers" icon="clock">
    Mirror the peak/off-peak split upstream; user cost varies by time of call.
  </Card>

  <Card title="Option 2: Fix at off-peak" icon="arrow-down">
    Quote everything at the off-peak rate — cheapest on paper.
  </Card>

  <Card title="Option 3: Fix at peak" icon="shield">
    Quote everything at the peak rate; the price never moves.
  </Card>
</CardGroup>

### Option 1: follow the tiers

The most faithful approach, with two obstacles in practice. First, the billing system has to switch rates by time window and attribute every call to the correct tier on the invoice — not a small change. Second, and more importantly, **cost becomes unpredictable for the user**: the same job billed at 10:00 (UTC+8) versus 03:00 (UTC+8) differs by 2x, which complicates budgeting and cost attribution alike.

For a middle layer whose selling point is a stable unit price, this hands the complexity to the customer.

### Option 2: fix at the off-peak rate

Best-looking on paper — until you combine it with the window layout above. **Those 7 peak hours are where the traffic actually is.** Charging the off-peak rate means selling the densest block of demand at half price, and the gap has to come from somewhere.

Short term it works as customer acquisition spend. Long term it either climbs back up or gets paid for on the supply side — throttling, queueing, or quiet downgrades to a cheaper source. A headline price that looks cheap alongside inconsistent latency is usually this structure at work.

### Option 3: fix at the peak tier (APIYI's choice)

We took the third path: `deepseek-v4-flash` and `deepseek-v4-pro` move to **the official peak tier, fixed, with no time-of-day variation**, effective at the same moment as upstream — 00:00 on 17 August (UTC+8).

The secondary reason first: our billing system does not currently support time-varying rates. That is true, but it is not the deciding factor — it could be built.

The main reason is supply structure:

* **We route to the official endpoint first**, the lowest-cost and most standard path
* **When official concurrency falls short, BytePlus and Alibaba Cloud's official resale take over as backup routes**, so requests are not queued or dropped into 429s
* **Those backup routes cost noticeably more to source than the official endpoint** — that has consistently been the case for DeepSeek

So a single published rate has to cover both paths. **Pricing at the peak tier is what keeps the backup route available the moment it is needed** — availability comes before headline price, and we take no margin on this.

<Info>
  Pricing at the official off-peak rate would leave only two moves once official concurrency saturates: queue requests behind the official endpoint, or subsidise the backup route. The first sacrifices availability; the second is not sustainable. A fixed peak tier buys **the same availability at every hour of the day**.
</Info>

## Practical Guidance

### Model selection and cost control

**1. Use flash unless you need pro.** The gap between pro and flash is about 3x both before and after the change (cache-miss input \$1.32 : \$0.44, output \$3.96 : \$1.32), so the selection logic is unchanged. The V4 Flash GA build beat the Pro preview on all five agent benchmarks we measured — see the [V4 Flash GA launch notes](/en/news/deepseek-v4-flash-ga-launch).

**2. Caching still pays, though less spectacularly.** Relative to cache-miss input, pro's cache-hit rate moves from roughly 1/120 to 1/30, and flash from 1/50 to 1/31. The ratio compressed, but a hit still removes over 96% of input cost — long system prompts and long document prefixes should still be cached.

**3. Do not reschedule batch jobs to the small hours.** To be explicit: **on APIYI the rate is fixed at the peak tier, so moving work to a different hour saves nothing**. Rescheduling only helps callers hitting the official endpoint directly. To cut cost here, shorten output tokens, lean on caching, and push simple tasks down to flash.

**4. Recharge bonuses stack as usual.** The unit price tracks the official peak tier; discounts come through recharge bonuses, so effective cost stays below the nominal rate.

### Code

Model IDs and call patterns are unchanged — the price move needs no code change:

<CodeGroup>
  ```python Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="deepseek-v4-flash",
      messages=[
          {"role": "user", "content": "Group these log lines by error type and count them."}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```python Responses with chained caching theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  first = client.responses.create(
      model="deepseek-v4-flash",
      input="Here is an 80,000-word product manual. Read it through first.",
      caching={"type": "enabled"},
  )

  # Pass previous_response_id on each later turn to hit the full prior context
  second = client.responses.create(
      model="deepseek-v4-flash",
      input="Per the manual: how many steps are in the refund flow?",
      previous_response_id=first.id,
  )
  print(second.output_text)
  ```
</CodeGroup>

## Pricing and Availability

APIYI rates after the change (per 1M tokens, fixed peak tier):

| Model               | Cache-hit input | Cache-miss input | Output |
| ------------------- | --------------- | ---------------- | ------ |
| `deepseek-v4-flash` | \$0.014         | \$0.44           | \$1.32 |
| `deepseek-v4-pro`   | \$0.044         | \$1.32           | \$3.96 |

Effective at the same time as upstream: **00:00 on 17 August 2026 (UTC+8)**. Model IDs, endpoints, and parameter structures are unchanged, and both Chat Completions and Responses remain available.

### Stacking recharge promotions

APIYI prices track the official rate; **discounts come through recharge bonuses**:

📖 [Recharge promotion details](/en/faq/recharge-promotions)

## Conclusion

The signal matters more than the numbers: **the window of cheap supply is closing**. DeepSeek is surcharging peak load, which is another way of saying price is now rationing compute that is not sufficient to go around — and the concurrency figures suggest this is structural rather than a passing squeeze.

Three recommendations:

1. **Re-run your model selection.** The 3x gap between pro and flash held, but with absolute prices this much higher, reaching for pro by reflex costs far more than it used to
2. **Treat caching as mandatory, not an optimisation.** A hit removes over 96% of input cost — the most certain engineering return available after this change
3. **Do not plan on saving money by shifting hours.** The rate here is constant; cost work belongs in token counts and model choice

Our commitment is simple: priced at the official peak tier, no time-of-day variation, backup routes available whenever they are needed. **Availability first, at no margin**, with discounts continuing through recharge bonuses.

<Info>
  Sources: DeepSeek official pricing page `api-docs.deepseek.com/quick_start/pricing` and rate-limit documentation `api-docs.deepseek.com/quick_start/rate_limit`. Notice effective `16:00 UTC on August 16, 2026`; data retrieved 15 August 2026. APIYI rates are authoritative on the live model pricing page.
</Info>
