> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What Does the Model 'Multiplier' Mean?

> Understand the meaning, calculation rules, and relationship to official pricing of model multipliers on API.YI

## Quick Answer

<Info>
  **Multipliers are an industry-standard way to calculate pricing.** If you don't want to deal with multipliers, simply check the **Price** column in the model list. We charge in USD. View all model prices: [Model Pricing](https://api.apiyi.com/modelPricing)
</Info>

## Pricing Strategy

| Model Type                 | Pricing Rule                    | Discounts                                                       |
| -------------------------- | ------------------------------- | --------------------------------------------------------------- |
| **Text / Multimodal LLMs** | Same as official pricing        | [Top-up bonuses](/en/faq/recharge-promotions) + Group discounts |
| **Image / Video models**   | Per-call pricing, special rates | See [Model Pricing](https://api.apiyi.com/modelPricing)         |

<Tip>
  Text model discounts come in two forms: **top-up bonus promotions** (extra credits when recharging) and **group discounts** (e.g., domestic models in a separate group with 0.88x discount).
</Tip>

## Text Model Billing

Cost per call = **Input Tokens × Input price + Output Tokens × Output price**

For detailed billing information, see [Pricing](/en/pricing).

## Basic Concepts

Two key terms to understand:

| System Term    | Meaning       |
| -------------- | ------------- |
| **Prompt**     | Input Tokens  |
| **Completion** | Output Tokens |

## Multiplier Calculation Rules

Multipliers are relative values used to derive actual prices:

* **Prompt Multiplier × 2** = Input price (USD / million Tokens)
* **Completion Multiplier** = Output price ÷ Input price (i.e., how many times the output costs compared to input)

## Example Calculation

Using `claude-opus-4-6` as an example:

| Item   | Multiplier                  | Calculation              | Final Price               |
| ------ | --------------------------- | ------------------------ | ------------------------- |
| Input  | Prompt multiplier **2.5**   | 2.5 × 2 = 5              | **\$5 / million Tokens**  |
| Output | Completion multiplier **5** | 5 × 5 (input price) = 25 | **\$25 / million Tokens** |

Using this formula, API.YI pricing matches the official pricing exactly.

## Image / Video Model Billing

Image and video models use **per-call pricing**, with special discounted rates for some models. Check the [Model Pricing](https://api.apiyi.com/modelPricing) page in your dashboard for specific prices.

## Summary

* Multipliers are an **industry-standard** pricing calculation method
* You don't need to understand multipliers to use the service — just check the **Price** column
* **Text models** match official pricing; discounts via top-up bonuses and group discounts
* **Image/Video models** are billed per call with special rates — see [Model Pricing](https://api.apiyi.com/modelPricing)
