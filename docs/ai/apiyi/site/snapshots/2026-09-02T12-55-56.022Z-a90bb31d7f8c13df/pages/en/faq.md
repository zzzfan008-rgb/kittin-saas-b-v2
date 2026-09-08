> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FAQ Overview

> Complete index of APIYI frequently asked questions: getting started, model calls, tokens and logs, billing, enterprise services, and account login — browsable by topic or by symptom.

Every APIYI FAQ article is indexed here. New to APIYI? Start with **Getting Started** and **Top Questions**. Already integrated and hitting a specific error? Jump to **Troubleshooting by Symptom**. Want to read through everything? See **Browse by Topic** below.

## 🚀 Getting Started in 3 Steps

<CardGroup cols={3}>
  <Card title="Step 1: Register" icon="mail" href="/en/faq/email-registration">
    Gmail, Outlook, Foxmail and university email addresses are supported, or sign in with GitHub
  </Card>

  <Card title="Step 2: Create a KEY" icon="key" href="/en/faq/token-management">
    Grab the default token from the console, or create a dedicated KEY and pick its group
  </Card>

  <Card title="Step 3: Set the Base URL" icon="link" href="/en/faq/base-url-config">
    Use `/v1` for OpenAI format, the root domain for Claude, `/v1beta` for Gemini
  </Card>
</CardGroup>

## 🔥 Top Questions

<CardGroup cols={2}>
  <Card title="How to create a KEY?" icon="key" href="/en/faq/token-management">
    Getting the default token and creating a new KEY, step by step
  </Card>

  <Card title="How to configure the Base URL?" icon="link" href="/en/faq/base-url-config">
    Which of `/v1`, root domain, or `/v1beta` applies to which models
  </Card>

  <Card title="How to choose the right AI model?" icon="compass" href="/en/faq/model-selection-guide">
    Picking a model by use case, cost, and speed
  </Card>

  <Card title="Why is my API Key invalid?" icon="triangle-alert" href="/en/faq/invalid-api-key">
    Nine times out of ten the Base URL and KEY do not match — check this first
  </Card>

  <Card title="Why can't I run requests with a balance?" icon="credit-card" href="/en/faq/balance-insufficient">
    The pre-deduction mechanism and oversized max\_tokens values
  </Card>

  <Card title="What does the model multiplier mean?" icon="calculator" href="/en/faq/model-multiplier">
    The multiplier is an RMB unit — apply the fixed rate to get the USD equivalent
  </Card>

  <Card title="What recharge promotions are available?" icon="gift" href="/en/faq/recharge-promotions">
    First-time bonuses, tiered bonuses, and enterprise policies
  </Card>

  <Card title="Why do the web app and the API differ?" icon="layers" href="/en/faq/webapp-vs-api-difference">
    Why the same model feels smarter on the official site than through the API
  </Card>
</CardGroup>

***

## 🔧 Troubleshooting by Symptom

Find the row that matches what you are actually seeing. A single symptom often spans several topics, so this table re-threads the troubleshooting articles by observable behavior.

| What you're seeing                                            | Likely cause                                                                                    | Where to look                                                                                                                     |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| API Key invalid / 401                                         | Base URL and KEY do not match, or the KEY is mistyped                                           | [Invalid API Key](/en/faq/invalid-api-key) · [Base URL config](/en/faq/base-url-config)                                           |
| Balance remaining but requests fail                           | Pre-deduction mechanism, or max\_tokens set too high                                            | [Balance insufficient](/en/faq/balance-insufficient) · [Pre-deduction](/en/faq/pre-deduction-quota)                               |
| Request times out or drops mid-stream                         | Client timeout too short; reasoning models are slow                                             | [Avoiding API timeouts](/en/faq/timeout-configuration)                                                                            |
| Log shows success and billing, but nothing reached the client | The log duration stops when the gateway finishes; the gap is downstream or in the finish signal | [Log finished but no response](/en/faq/log-duration-vs-client-wait)                                                               |
| Website / API returns 502                                     | Service container briefly auto-restarting; recovers in about 1 minute                           | [What to do about 502](/en/faq/website-502-error)                                                                                 |
| 429 concurrency errors                                        | Concurrency quota reached                                                                       | [API concurrency limits](/en/faq/api-concurrency)                                                                                 |
| Output truncated mid-sentence                                 | max\_tokens unset or too small                                                                  | [What is max\_tokens](/en/faq/max-tokens)                                                                                         |
| A specific model won't run                                    | Account permission locked, or token model whitelist                                             | [Why can't I use some models](/en/faq/model-availability) · [Token model whitelist](/en/faq/token-model-whitelist)                |
| Image generation fails / returns empty                        | Google content safety triggered                                                                 | [Nano Banana failures](/en/faq/nano-banana-image-failure)                                                                         |
| Output differs greatly from the reference image               | Reference images must be uploaded as base64                                                     | [Image differs from reference](/en/faq/image-result-differs-from-reference)                                                       |
| White-background image shows black spots                      | Known behavior on the AI Studio route                                                           | [White background artifacts](/en/faq/white-background-image-artifacts)                                                            |
| Want to poll image results by task ID                         | Image generation is synchronous only                                                            | [Is there an async image API](/en/faq/image-async-api)                                                                            |
| Model claims to be another vendor / can't state its version   | Model self-knowledge is unreliable                                                              | [Claude claims to be Qwen](/en/faq/claude-identity-confusion) · [Models don't know their version](/en/faq/model-version-identity) |
| Web app smart, API dumb                                       | The web app ships system prompts and tooling; the API is the bare model                         | [Web app vs API](/en/faq/webapp-vs-api-difference)                                                                                |
| Unfamiliar calls on your KEY                                  | The KEY may be leaked — trace it and disable it                                                 | [Investigate unexpected KEY usage](/en/faq/troubleshoot-key-usage) · [Manage keys securely](/en/faq/key-security-management)      |
| Billing doesn't add up                                        | Per-usage and per-call billing read differently                                                 | [Reading billing in logs](/en/faq/log-billing-explained) · [Model multiplier](/en/faq/model-multiplier)                           |
| Image or video downloads are slow                             | Overseas CDN routing on specific servers                                                        | [CDN downloads are slow](/en/faq/cdn-download-slow)                                                                               |
| Do I need a proxy?                                            | Direct connection works; no proxy required                                                      | [Do I need a proxy](/en/faq/network-proxy)                                                                                        |
| GitHub login says 'Account already bound'                     | That GitHub account is bound to another email                                                   | [GitHub binding error](/en/faq/github-bindng-bindng-error)                                                                        |
| Forgot your password                                          | Reset by email or ask support for help                                                          | [Forgot password](/en/faq/forgot-password)                                                                                        |

***

## 📚 Browse by Topic

### 🧭 Site Features (3)

| Question                                                                         | In one line                                                 |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [Tokens & Groups](/en/faq/token-and-groups)                                      | How to create a KEY and pick a group                        |
| [What is a Group? User Group vs Token Group Explained](/en/faq/groups-explained) | The group selected on the token is what actually applies    |
| [Why Doesn't APIYI Offer One-Click Integration?](/en/faq/one-click-integration)  | Integration differs per model; use the AI assistant instead |

### ⚙️ Models & API (18)

| Question                                                                                                                                               | In one line                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [Do Google Models Run on AI Studio or Vertex?](/en/faq/google-upstream-aistudio-vertex)                                                                | Default groups use the official AI Studio route                            |
| [Why Does a White-Background Image Show Black Spots, Dirty Patches, or Blurry Color Blocks?](/en/faq/white-background-image-artifacts)                 | Prompt for a light background instead of pure white                        |
| [How Do I Generate Images with a Transparent Background (PNG Cutouts)?](/en/faq/image-transparent-background)                                          | Pass `background: "transparent"` to `gpt-image-2` for a real alpha channel |
| [How to Choose the Right AI Model?](/en/faq/model-selection-guide)                                                                                     | Select by use case, cost, and speed                                        |
| [Is There a Conversational API That Outputs Both Text and Generated Images?](/en/faq/text-and-image-in-one-api)                                        | Reading images and making images differ; four routes to an image           |
| [Why can't I use some models?](/en/faq/model-availability)                                                                                             | Some models need permission unlocked first                                 |
| [Why do official web apps and the API give different results?](/en/faq/webapp-vs-api-difference)                                                       | The web app adds system prompts; the API is the bare model                 |
| [Why Don't AI Models Know Their Own Version?](/en/faq/model-version-identity)                                                                          | Model self-knowledge is unreliable                                         |
| [Why Does Claude Claim to Be Qwen or DeepSeek?](/en/faq/claude-identity-confusion)                                                                     | Identity hallucination, not a swapped model                                |
| [What does the -c suffix in model names mean?](/en/faq/model-name-suffix-c)                                                                            | Marks a different route with different billing                             |
| [How to Configure Base URL? Differences Between /v1, Root Domain, and /v1beta](/en/faq/base-url-config)                                                | One form each for OpenAI, Claude, and Gemini                               |
| [How do I avoid API timeouts?](/en/faq/timeout-configuration)                                                                                          | Raise the client timeout; reasoning models are slow                        |
| [The log says the call finished and was billed, but my client never received a response — how do I troubleshoot?](/en/faq/log-duration-vs-client-wait) | The two clocks measure different windows; measure the gap first            |
| [What Are the API Concurrency Limits?](/en/faq/api-concurrency)                                                                                        | Limits vary by model type and can be raised                                |
| [What is max\_tokens? What Happens If Not Set?](/en/faq/max-tokens)                                                                                    | Caps output length; there is a default if unset                            |
| [Common Reasons for Nano Banana Image Generation Failures](/en/faq/nano-banana-image-failure)                                                          | Usually Google content safety being triggered                              |
| [Why Does the Generated Image Differ Greatly from the Reference?](/en/faq/image-result-differs-from-reference)                                         | Reference images must be base64 encoded                                    |
| [Is There an Async Image API? Can I Query Results by Task ID?](/en/faq/image-async-api)                                                                | Synchronous only; no task ID lookup                                        |

### 🔑 Tokens & Logs (9)

| Question                                                                                  | In one line                                              |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [How to create a KEY?](/en/faq/token-management)                                          | Get the default token or create a new one in the console |
| [Do I Need to Set Available Models for Tokens?](/en/faq/token-model-whitelist)            | Optional, but recommended when isolating projects        |
| [How Do I Manage API Keys Securely?](/en/faq/key-security-management)                     | IP whitelists, model whitelists, and daily habits        |
| [What's the Difference Between Token Billing Modes?](/en/faq/token-billing-modes)         | Five billing modes and when each fits                    |
| [How to view my call records?](/en/faq/call-logs)                                         | Call and billing detail in the console log page          |
| [How do I read the billing amounts in the logs?](/en/faq/log-billing-explained)           | Per-usage vs per-call, and computing cost from usage     |
| [How long are call logs kept, and when are they cleared?](/en/faq/log-retention-policy)   | Current month plus two prior; cleared on the 5th         |
| [Can I View Detailed Logs in the Backend for Troubleshooting?](/en/faq/user-logs-control) | Admins can enable verbose logging temporarily            |
| [How do I investigate unexpected API Key usage?](/en/faq/troubleshoot-key-usage)          | Trace real IPs in the logs and disable the KEY           |

### 🏢 Enterprise Services (7)

| Question                                                                                                          | In one line                                                    |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [What Is the Enterprise Group? When Should You Use It?](/en/faq/enterprise-group-vertex-fallback)                 | Model-specific group with steadier supply, higher multiplier   |
| [Is APIYI's Enterprise Service Trustworthy? Are the Models Authentic?](/en/faq/enterprise-trust)                  | Transparent official relay — no rerouting or model swapping    |
| [What's the difference between enterprise and individual users?](/en/faq/enterprise-vs-individual)                | Same account type; differences are in support and pricing      |
| [How do enterprise customers recharge?](/en/faq/enterprise-recharge)                                              | Bank transfer preferred; VAT invoices available                |
| [How can university customers reimburse worry-free?](/en/faq/university-reimbursement)                            | Invoices, purchase lists, and stamped documents provided       |
| [Does APIYI offer SLA guarantees?](/en/faq/sla-guarantee)                                                         | Yes, including billing-anomaly compensation and credit refills |
| [Does an Agent Mini-Program Need Algorithm Filing?](/en/faq/agent-miniapp-algorithm-filing)                       | Usually yes; this covers the general process                   |
| [How Do I Handle Compliance for a China-Facing Product Using Overseas Models?](/en/faq/overseas-model-compliance) | License layers, model filing status, and content moderation    |

### 💰 Billing & Security (14)

| Question                                                                                                     | In one line                                                      |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [Prices Match the Official Rates — Why Buy from APIYI?](/en/faq/official-pricing-advantages)                 | Same price plus recharge bonuses, stackable with group discounts |
| [How can APIYI price below the official rates?](/en/faq/why-cheaper-than-official)                           | Bulk purchasing and vendor distribution, not degraded models     |
| [What Does the Model 'Multiplier' Mean?](/en/faq/model-multiplier)                                           | An RMB unit; apply the fixed rate for the USD equivalent         |
| [How Much Computing Power Does 100 RMB Get?](/en/faq/rmb-to-computing-power)                                 | Your own system decides the conversion ratio                     |
| [Does APIYI Support Cache Billing?](/en/faq/cache-billing)                                                   | All major routes support it; hit rates vary by vendor            |
| [What is the pre-deduction mechanism for API calls?](/en/faq/pre-deduction-quota)                            | Estimated upfront, settled against actual usage                  |
| [Why can't I run requests with remaining balance?](/en/faq/balance-insufficient)                             | Pre-deduction check, or max\_tokens set too high                 |
| [How to Set Up Balance Alerts?](/en/faq/balance-alerts)                                                      | Email, group bots, or the balance alert API                      |
| [What Payment Methods Does APIYI Support?](/en/faq/payment-methods)                                          | WeChat, Alipay, USDT, Stripe, PayPal and more                    |
| [What recharge promotions are available?](/en/faq/recharge-promotions)                                       | First-time and tiered bonuses, plus invoicing                    |
| [How do I apply for an agent partnership? Can I earn rebates by inviting friends?](/en/faq/referral-program) | Referral rebates are on by default; no application needed        |
| [What Is APIYI's Refund Policy?](/en/faq/refund-policy)                                                      | Conditions, process, fees, and invoice notes                     |
| [How is content safety and compliance ensured?](/en/faq/content-safety)                                      | Moderation mechanisms and violation handling                     |
| [How does APIYI ensure data security?](/en/faq/data-security)                                                | Encrypted transport, minimal storage, access control             |

### 🌐 Network & Connection (4)

| Question                                                                            | In one line                                                                         |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Do I Need a Proxy to Use the API?](/en/faq/network-proxy)                          | Direct connection works; no proxy or VPN needed                                     |
| [Where are APIYI's Servers? Which Server Should I Choose?](/en/faq/server-location) | Node locations, latency testing, and purchase advice                                |
| [CDN Image/Video Downloads Are Slow — What to Do?](/en/faq/cdn-download-slow)       | Diagnosing overseas CDN routing on specific servers                                 |
| [Website or API Returns 502 — What Should I Do?](/en/faq/website-502-error)         | Brief container auto-restart; recovers in \~1 minute, never billed, retry after 30s |

### 👤 Account & Login (6)

| Question                                                                                 | In one line                                      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [Which email providers does APIYI support for registration?](/en/faq/email-registration) | Gmail, Outlook, Foxmail and university addresses |
| [How do I sign in with a Passkey?](/en/faq/passkey-login)                                | Bind once, then use fingerprint or face unlock   |
| [GitHub Login Shows 'Account Already Bound'?](/en/faq/github-bindng-bindng-error)        | That GitHub account is bound to another email    |
| [What If I Forgot My Password?](/en/faq/forgot-password)                                 | Reset by email or ask support for help           |
| [Why is my API Key invalid?](/en/faq/invalid-api-key)                                    | A mismatched Base URL and KEY is the usual cause |
| [How Do I Delete My Account?](/en/faq/account-deletion)                                  | One-click deletion; data cannot be recovered     |

***

## 💬 Still Stuck?

<CardGroup cols={2}>
  <Card title="Use Cases" icon="layout-grid" href="/en/scenarios">
    Integration guides for Cherry Studio, Claude Code, Cursor and more
  </Card>

  <Card title="Model Pricing" icon="circle-dollar-sign" href="/en/models">
    Live pricing table and detail pages for every model
  </Card>

  <Card title="Live Updates" icon="radio-tower" href="/en/live/index">
    Daily updates on model status, supply changes, and incidents
  </Card>

  <Card title="Announcements" icon="megaphone" href="/en/changelog">
    New model launches, price changes, and feature updates
  </Card>
</CardGroup>

Still no luck? Reach us directly:

* 📧 **Email**: [support@apiyi.com](mailto:support@apiyi.com)
* 🌐 **Console**: [api.apiyi.com](https://api.apiyi.com)
* 💰 **Pricing**: [Pricing page](https://api.apiyi.com/account/pricing)

<Note>
  If your question isn't covered, send it to support — we review suggestions and add them to the FAQ. New users get free trial credits, so you can validate your integration before topping up.
</Note>
