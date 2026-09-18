> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Tokens & Groups

> Learn what an APIYI token (API KEY) does, how to create and edit it, and how groups work — including default groups and fallback groups.

## What is a token (API KEY)

A token is the **API KEY** you use to call APIYI, starting with `sk-`. It is the credential for your identity and permissions. Its main roles include:

<CardGroup cols={2}>
  <Card title="Authentication" icon="shield">
    Every API call must carry a token to verify your identity and account.
  </Card>

  <Card title="Quota & permission control" icon="sliders-horizontal">
    Set a dedicated quota, expiry date, allowed models, and groups per token.
  </Card>

  <Card title="Usage statistics" icon="chart-line">
    Track each token's spend, remaining quota, and call logs independently.
  </Card>

  <Card title="Flexible allocation" icon="users">
    Create separate tokens for different projects or team members.
  </Card>
</CardGroup>

<Info>
  After registration, the system automatically generates a **default token** that works out of the box. You can also create additional tokens as needed.
</Info>

## How to create a token

<Steps>
  <Step title="Open the Token page">
    Open the "Token" page from the top navigation: [https://api.apiyi.com/token](https://api.apiyi.com/token)
  </Step>

  <Step title="Click 'New'">
    Click the "New" button in the top-right corner to open the create-token dialog.
  </Step>

  <Step title="Fill in token details">
    Set the token name, quota (unlimited optional), expiry (never-expire optional), billing mode, and group (see below).
  </Step>

  <Step title="Save and copy the KEY">
    After saving, click the copy icon to the right of the token to copy the full `sk-` KEY.
  </Step>
</Steps>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="Create a new token" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="Create a new token" width="1284" height="1158" data-path="images/key-add-new.png" />

<Tip>
  You **do not need to set allowed models** when creating a token. A whitelist mechanism applies: leave it empty and the token can use all 400+ models; set it and the token is limited to those models. See [Token Model Whitelist](/en/faq/token-model-whitelist).
</Tip>

## Editing a token & viewing code examples

Click the **management menu (wrench icon)** in the "Actions" column to expand all operations:

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="Token management menu and request example" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="Token management menu and request example" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

| Action                            | Description                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Disable token**                 | Temporarily disable the token; calls will be rejected                                                     |
| **Edit token**                    | Change name, quota, expiry, billing mode, group, etc.                                                     |
| **Request example**               | **View code examples** — ready-to-run call code in multiple languages (curl, Python, etc.) for this token |
| **Token logs**                    | View this token's call records                                                                            |
| **Share token / One-click setup** | Quickly share or integrate with third-party tools                                                         |

<Note>
  "Request example" is the **code example** entry point. It generates runnable call code with the current token pre-filled, so you don't have to assemble the KEY and endpoint manually — ideal for quick testing and integration.
</Note>

## Will sharing one token among multiple people get rate-limited?

A common question from customers: **"If one token is shared by multiple people, will it be rate-limited?"**

The answer: **the token itself has no rate limit**. Rate limiting follows the **account**, regardless of how many tokens you have or how many people use them — one token shared by 10 people behaves exactly the same as 10 tokens used by 1 person each.

<CardGroup cols={2}>
  <Card title="RPM (requests per minute)" icon="gauge">
    In general, a single account running at up to **100 RPM** is perfectly fine — enough for the vast majority of teams and applications.
  </Card>

  <Card title="TPM (tokens per minute)" icon="infinity">
    **TPM is not enforced**, so you don't need to worry about long contexts or high concurrent token volume triggering limits.
  </Card>
</CardGroup>

<Tip>
  Sharing a token doesn't affect rate limits, but from a **management** perspective we still recommend separate tokens per member or project: each gets its own quota, call logs, and spend statistics.
</Tip>

## What is a group

**A group is a "resource channel" you can choose for a token.** Different groups map to different upstream resources, available model ranges, and billing multipliers, and are **open for users to choose**.

In short: the same model may be served by multiple upstream channels, and the group lets you choose which channel to use. **Different models may require different groups**, so picking the right group ensures the call works and gets the corresponding discount.

<Info>
  In the vast majority of cases, the **default group (Default)** is all you need — it has full model coverage, including text models, the NanoBanana series, Veo 3.1, and most others.
</Info>

## Default group & fallback groups

A single token can have up to **3 groups**: **1 default group + 2 fallback groups**.

<CardGroup cols={2}>
  <Card title="Default group (primary)" icon="circle-check">
    The group the token uses first; covers most models. Every token must have 1 default group.
  </Card>

  <Card title="Fallback groups (backup)" icon="life-buoy">
    Backup channels that activate automatically when the default group cannot serve a request. Up to 2, improving call success rate.
  </Card>
</CardGroup>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="Selecting a group and fallback group" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="Selecting a group and fallback group" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

In the create/edit token dialog:

* **Select group**: sets the default (primary) group, `Default` by default
* **Fallback group**: add 1–2 backup groups that take over when the primary is unavailable

<Tip>
  **The group affects the token's billing multiplier and available models.** Choose based on the models you actually use. When unsure, keep the default `Default`.
</Tip>

## Different models need different groups

The default group covers most models, but some models (especially **video models**) require a dedicated group:

| Model / scenario                                       | Group to choose     |
| ------------------------------------------------------ | ------------------- |
| Text, multimodal, NanoBanana, Veo 3.1, and most models | **Default**         |
| Sora 2 official video                                  | **Sora2Official**   |
| Alibaba Wan & HappyHorse video series                  | **Wan\&HappyHorse** |

<Warning>
  When calling Sora 2 official, Wan\&HappyHorse, and other dedicated-group models, the model will be unavailable if the token lacks the matching group. Consider adding the commonly used dedicated group as a fallback, or create a separate token for these models.
</Warning>

## Group overview

Below are the groups and descriptions provided by the system (the console display is authoritative):

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="APIYI token group overview" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="APIYI token group overview" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<Note>
  The "Group multiplier" column is a relative value priced in RMB — it is **not a direct USD discount ratio**, so there's no need to over-analyze it. Just pick the group that matches your model. To understand multipliers and price conversion, see [What is a model's multiplier?](/en/faq/model-multiplier).
</Note>

## Related docs

<CardGroup cols={2}>
  <Card title="Token billing modes" icon="calculator" href="/en/faq/token-billing-modes">
    Understand the difference between pay-per-usage and pay-per-call modes.
  </Card>

  <Card title="Token model whitelist" icon="list" href="/en/faq/token-model-whitelist">
    How to limit the models a single token can use.
  </Card>

  <Card title="Model multiplier" icon="percent" href="/en/faq/model-multiplier">
    Understand multiplier meaning and price calculation.
  </Card>

  <Card title="Call logs" icon="file-text" href="/en/faq/call-logs">
    View call records and spend details per token.
  </Card>
</CardGroup>
