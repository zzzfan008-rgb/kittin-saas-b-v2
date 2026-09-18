> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Much Computing Power Does 100 RMB Get?

> APIYI only provides model services and corresponding pricing. RMB recharges use a fixed rate of 1 USD = 7 RMB; the conversion rate to computing power is defined by your own platform.

## Short Answer

APIYI cannot provide a standard answer to "how much computing power 100 RMB gets".

"Computing power" is typically a unit defined inside your own platform. The conversion rate, deduction rules, and consumption logic are all designed and managed by you. APIYI is a model service provider and does not know or control your internal computing-power rules.

## Why APIYI Cannot Define the Conversion Rate

APIYI provides model invocation services and the corresponding model prices. We do not provide:

* A conversion rule between RMB and computing power
* The deduction logic inside your platform
* A billing unit for your end users

Whether 1 RMB is mapped to 10 units, 100 units, or any other value is entirely up to your platform rules and business strategy.

## How to Configure Your Own Computing Power Rules

If you plan to configure computing-power consumption in your own backend, you can refer to the following points:

* **Reference model prices**: Estimate the cost of each call using APIYI model pricing
* **Define a conversion rate**: Decide how much computing power each RMB corresponds to
* **Design deduction rules**: Configure consumption per model, per call, or per input/output token
* **Align with your operations**: Adjust based on your product positioning and margin

<Info>
  APIYI only provides model pricing information and does not advise on your computing-power conversion design. Please make decisions based on your own product positioning, operating costs, and pricing strategy.
</Info>

## About Model Pricing

APIYI model prices generally fall into these categories:

* **Image models**: Some models offer special pricing
* **Text models**: Pricing is usually consistent with the official model site
* **Recharge promotions**: Additional discounts are available through current recharge campaigns

Refer to the APIYI platform for exact pricing after signing in.

## RMB Recharge Rate and Version Pricing

RMB recharges use a fixed exchange rate: **1 USD = 7 RMB**. This rate does not follow real-time exchange-rate fluctuations.

For GPT pricing, the **official-relay** models match OpenAI's list price item for item, while the **reverse** models are billed per call at a lower rate.

<Info>
  Conversion example: at the fixed rate of 1:7, 200 USD corresponds to 1,400 RMB (200 × 7 = 1,400).
</Info>

## Related Questions

<CardGroup cols={2}>
  <Card title="Model Multiplier" icon="calculator" href="/en/faq/model-multiplier">
    Understand pricing multipliers and token conversion for different models.
  </Card>

  <Card title="Payment Methods" icon="dollar-sign" href="/en/faq/payment-methods">
    View supported payment methods and credit arrival times on APIYI.
  </Card>

  <Card title="Recharge Promotions" icon="gift" href="/en/faq/recharge-promotions">
    Learn about current recharge campaigns and discount rules.
  </Card>

  <Card title="Insufficient Balance" icon="credit-card" href="/en/faq/balance-insufficient">
    Handle insufficient-balance errors during API calls.
  </Card>
</CardGroup>
