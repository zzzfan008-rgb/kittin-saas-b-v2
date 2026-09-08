> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Prices Match the Official Rates — Why Buy from APIYI?

> Text models cost the same as official rates, but top-up bonuses of up to 20% (roughly a 17% discount) stack with group discounts, plus official direct routing, cache billing support, and no overseas account required

## Short Answer

The **unit prices for text (including multimodal) models are indeed the same as the official rates**, but your actual cost is lower: top-up bonuses go up to 20% (equivalent to paying about 83% of the list price, i.e., a 17% discount), and they stack with group-based discounts such as 5% off on certain model groups — bringing your combined cost down to roughly 79% of the official price. On top of that, official direct routing, cache billing support, one key for all models, and no overseas account or credit card required are advantages you cannot get all at once by going direct.

## Where the Savings Come From

<Card title="💰 Same Price ≠ Same Cost" icon="calculator">
  APIYI does not play games with unit prices — text models are billed at the official list price, keeping billing transparent and unadulterated. The real savings come from **top-up bonuses** and **group discounts**, which stack with each other.
</Card>

### 1. Tiered Top-Up Bonuses (Up to 20％)

A single top-up of \$100 or more earns a tiered bonus of 10%-20%:

| Single Top-Up Amount   | Bonus   | Effective Discount |
| ---------------------- | ------- | ------------------ |
| \$100 ≤ X \< \$500     | 10%     | \~9% off           |
| \$500 ≤ X \< \$1,000   | 12%     | \~11% off          |
| \$1,000 ≤ X \< \$3,000 | 15%     | \~13% off          |
| X ≥ \$3,000            | **20%** | **\~17% off**      |

Take the 20% bonus as an example: top up \$3,000 and receive \$3,600 in credit — you are effectively paying 1/1.2 ≈ 83.3% of the official price, i.e., about a 17% discount.

<Card title="Top-Up Bonus Details" icon="gift" href="/en/faq/recharge-promotions">
  First top-up bonus, tiered bonus rates, and crediting schedule
</Card>

### 2. Group Discounts (Stackable)

Certain model groups carry an additional discount — for example, some dedicated groups offer **5% off** — and this **stacks** with the top-up bonus:

* 20% top-up bonus → effective cost is about 83.3% of the official price
* Stack a 5%-off group on top → 83.3% × 0.95 ≈ **about 79% of the official price**

<Card title="Understanding Groups and Multipliers" icon="layers" href="/en/faq/groups-explained">
  What are model groups? How is pricing calculated across groups?
</Card>

## How Text Models Are Billed

Text models are billed by token usage:

```text theme={null}
Cost per request = input tokens × input price + output tokens × output price
```

The input/output unit prices for each model match the official rates — see the [model pricing overview](/en/pricing).

<Note>
  **Image and video models** are billed per use (not per token). Check the exact prices on the "Model Pricing" page in the console. Top-up bonuses apply to these models as well.
</Note>

## Advantages Beyond Price

<CardGroup cols={2}>
  <Card title="Official Direct Routing" icon="zap">
    Requests are routed directly to official channels — model capability and response quality match the official service, with no degradation or dilution
  </Card>

  <Card title="Cache Billing Support" icon="database">
    Cache billing is supported for all three major vendors — OpenAI, Claude, and Gemini. Cache hits significantly reduce input costs (hit rates vary by vendor and usage pattern)
  </Card>

  <Card title="One Key, All Models" icon="key">
    A single API key covers all mainstream models — OpenAI, Claude, Gemini, and more — without registering and maintaining separate official accounts
  </Card>

  <Card title="No Overseas Account or Card Needed" icon="credit-card">
    Local payment methods such as Alipay and WeChat Pay are supported, with RMB top-ups at a fixed 1:7 exchange rate — no overseas credit card required
  </Card>

  <Card title="Lower Suspension Risk" icon="shield">
    No need to maintain your own official accounts, so no worrying about risk-control suspensions triggered by payment methods or network environment
  </Card>

  <Card title="Ready to Use" icon="rocket">
    Compatible with the OpenAI API format — just swap the Base URL in mainstream SDKs and tools, backed by documentation and customer support
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="Why not simply set unit prices below the official rates?">
    Matching the official unit prices is a guarantee of **official direct routing and transparent billing** — prices below official cost usually signal degraded relays or reverse-engineered channels. APIYI puts the savings into top-up bonuses instead: the rates are public and identical for every customer, and your actual cost still ends up below going direct.
  </Accordion>

  <Accordion title="Is bonus credit any different from the principal?">
    No difference in use: bonus credit, like your principal, **works site-wide** across text, image, video, and all other models, and follows the same validity rule as the principal (365 days from the date of payment, reset by any new top-up). The only difference is that bonus credit is non-refundable. See [balance validity](/en/faq/recharge-promotions).
  </Accordion>

  <Accordion title="How are image and video models billed?">
    Image and video models are **billed per use** (a fixed charge per generation) rather than per token. Log in to the console and check the "Model Pricing" page for exact rates. Top-up bonuses reduce these costs as well.
  </Accordion>

  <Accordion title="How do the top-up bonus and group discount stack?">
    They apply independently and stack:

    * **20% top-up bonus**: top up \$3,000, receive \$3,600 — roughly a 17% discount
    * **5%-off group**: calls in that group are billed at 95%
    * **Combined**: 83.3% × 0.95 ≈ 79%, i.e., about 79% of the official price overall
  </Accordion>
</AccordionGroup>

## Related Documentation

* [What Top-Up Promotions Are Available?](/en/faq/recharge-promotions)
* [What Are Model Multipliers?](/en/faq/model-multiplier)
* [Cache Billing Explained](/en/faq/cache-billing)
* [Model Groups Explained](/en/faq/groups-explained)
* [How to Top Up Your Balance](/en/faq/payment-methods)

<Tip>
  **Money-saving tip**: A single top-up of \$3,000 or more earns the 20% bonus (\~17% off); choosing a discounted model group on top of that minimizes your combined cost. Credit is valid for 365 days (any new top-up resets the validity of your whole balance), so pick a tier you can spend within a year — see [balance validity](/en/faq/recharge-promotions).
</Tip>
