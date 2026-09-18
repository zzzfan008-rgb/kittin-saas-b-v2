> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What is a Group? User Group vs Token Group Explained

> A deep dive into APIYI's group concept. From a user's view it feels like 'my group', but what actually takes effect for every call is the group selected on the token. Includes ClaudeCode, Sora2Official, Wan&HappyHorse dedicated-group cases and a real ticket analyzing the 'upstream group is saturated' 429 error.

## In one sentence

**A group is a "call channel" you select on a token. It decides the available models, billing multiplier, and upstream routing.** From a user's view it feels like "my own group", but **for every single call, what actually takes effect is the group selected on the token**.

## User view vs platform view

<CardGroup cols={2}>
  <Card title="User view" icon="user">
    A group is the **channel I choose** when creating or editing a token. It decides which models this token can call, what multiplier applies, and which upstream line it takes.
  </Card>

  <Card title="Platform view" icon="layers">
    Groups are a tool for **resource management and feature surfacing** — bundling similar models, dedicated capacity, and targeted discounts into one channel so billing stays precise and pricing can be differentiated.
  </Card>
</CardGroup>

## "User group" ≠ "Token group" — don't confuse them

A common first reaction is: "Is there a group on my account I need to switch somewhere?"

* The account level does have a "user group" concept, which decides **base permission scope** (whether SVIP models show up, whether enterprise fallback groups are unlocked, etc.)
* But **every API call's routing, multiplier, and model availability are decided by the group selected on the token**.

<Tip>
  When troubleshooting, first inspect the token's "Select group" and "Fallback group" settings — don't go hunting for "my account's group". See [Tokens & Groups](/en/faq/token-and-groups).
</Tip>

## Case 1: Why does the `ClaudeCode` group exist?

**Purpose**: Bundle models that support the Anthropic-native `/v1/messages` call format into one channel, so you can use domestic coding models inside Claude Code, Cherry Studio, and other Anthropic-native clients **just like calling Claude — no code changes required**.

**Models included**:

* Full Claude lineup (official transit / AWS Claude)
* Domestic models compatible with `/v1/messages`, e.g. `qwen3.x-max`, `glm-5.x`, `deepseek-v4`

**Discount**:

* Default **5% off (95 折)** — no action needed
* **Stacks with recharge bonus (10%–20%)**, so real cost lands around 20% below official direct purchase

**How to use**:

1. Open [https://api.apiyi.com/token](https://api.apiyi.com/token) and create or edit a token
2. Set "Select group" to `ClaudeCode`
3. Call from your client in Anthropic-native format

## Case 2: Why do video models need a dedicated group?

Video models use billing rules (per second, per image, per duration) that are completely different from text models, and their upstream channels are independent. Groups let the **special billing rules take effect precisely**:

| Model                                 | Group required                                   |
| ------------------------------------- | ------------------------------------------------ |
| Sora 2 official video                 | `Sora2Official` (per-second billing)             |
| Alibaba Wan & HappyHorse video series | `Wan&HappyHorse`                                 |
| Seedance 2 video                      | dedicated group (see console for the exact name) |

<Warning>
  Wrong group usually means: model unavailable (404), wrong billing, or the call is rejected outright. Make sure the token's "Select group" or "Fallback group" includes the group that matches your target model.
</Warning>

## Case 3: Is "Current group's upstream is saturated" a throttle on me?

This is a high-frequency question in SaaS multi-user scenarios. **It comes from a real support ticket.**

**Scenario**:

* Developer: My tool is SaaS-style, with many users calling concurrently. Once traffic ramps, I get:
  > `error 429 (content-type-not-allowed)`: Current group's upstream is saturated, please try again later
* I assumed the platform was throttling my concurrency — should I "set up a group" somewhere to bypass it?

**The truth**:

* This error is **not an account-level concurrency throttle**
* It says: the **upstream channel** mapped to that model in that group is currently busy
* Common trigger: using a model still in preview at the vendor's side (versions named like `*-preview-*`), whose official capacity itself fluctuates

**The right response**:

<Steps>
  <Step title="Loosen client timeouts and retries">
    Raise timeouts (e.g. 60–120s) and switch immediate retries to exponential backoff. Don't pile on concurrent retries the moment an error fires.
  </Step>

  <Step title="Attach a fallback group for hot models">
    On the token, add 1–2 **fallback groups** corresponding to the target model. When the primary is congested, traffic shifts to a backup channel and success rate improves.
  </Step>

  <Step title="Evaluate models for high-concurrency workloads">
    If your business is latency- or stability-sensitive, **neutrally evaluate** more load-stable variants within the same model family on your own scenario (most vendors offer lighter, more dispersed sibling versions). Your business owns the trade-off.
  </Step>
</Steps>

<Info>
  We do not put a concurrency wall on customer calls. This 429 comes from the upstream channel — **it is not a billing-level throttle**. Retries usually recover.
</Info>

## How to pick a group — quick decision

| Your scenario                                                          | Group to choose                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------- |
| Text, multimodal, NanoBanana, Veo 3.1, and most models                 | `Default`                                           |
| Claude + domestic coding models in Claude Code (`/v1/messages` format) | `ClaudeCode` (5% off by default, stacks with bonus) |
| Sora 2 official video                                                  | `Sora2Official`                                     |
| Wan\&HappyHorse / Seedance 2 video                                     | their dedicated groups                              |
| Unstable high-concurrency workloads                                    | attach 1–2 **fallback groups** on the token         |

## About the "group multiplier"

The "group multiplier" shown in the console is a **relative value priced in RMB**, not a direct USD discount ratio — `0.14x` does NOT mean "an 86% discount". You generally **don't need to dig into it**; just pick the group that matches your model. To understand multipliers and price conversion, see [What is a model's multiplier?](/en/faq/model-multiplier).

## Related docs

<CardGroup cols={2}>
  <Card title="Tokens & Groups" icon="key" href="/en/faq/token-and-groups">
    Token roles, creation/editing, viewing code examples, group overview.
  </Card>

  <Card title="Token billing modes" icon="calculator" href="/en/faq/token-billing-modes">
    Differences between pay-per-usage and pay-per-call modes.
  </Card>

  <Card title="Model multiplier" icon="percent" href="/en/faq/model-multiplier">
    Multiplier meaning, RMB pricing unit, and USD price conversion.
  </Card>

  <Card title="Model availability" icon="list" href="/en/faq/model-availability">
    Model tiers and access by user group.
  </Card>
</CardGroup>
