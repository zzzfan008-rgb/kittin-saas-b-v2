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

| What you're seeing                                                      | Likely cause                                                                                    | Where to look                                                                                                                     |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| API Key invalid / 401                                                   | Base URL and KEY do not match, or the KEY is mistyped                                           | [Invalid API Key](/en/faq/invalid-api-key) · [Base URL config](/en/faq/base-url-config)                                           |
| Error message unclear, no idea where to start                           | Work through the error types in order                                                           | [Troubleshoot model API errors](/en/faq/model-error-troubleshooting)                                                              |
| Balance remaining but requests fail                                     | Pre-deduction mechanism, or max\_tokens set too high                                            | [Balance insufficient](/en/faq/balance-insufficient) · [Pre-deduction](/en/faq/pre-deduction-quota)                               |
| Request times out or drops mid-stream                                   | Client timeout too short; reasoning models are slow                                             | [Avoiding API timeouts](/en/faq/timeout-configuration)                                                                            |
| Log shows success and billing, but nothing reached the client           | The log duration stops when the gateway finishes; the gap is downstream or in the finish signal | [Log finished but no response](/en/faq/log-duration-vs-client-wait)                                                               |
| Website / API returns 502                                               | Service container briefly auto-restarting; recovers in about 1 minute                           | [What to do about 502](/en/faq/website-502-error)                                                                                 |
| Script gets intermittent 502 with an empty body and nothing in the logs | Empty 502 generated by local proxy software (Clash / v2rayN)                                    | [Proxy-generated empty 502](/en/faq/proxy-empty-502)                                                                              |
| Python raises SSLEOFError but curl works                                | OpenSSL 3.5+ post-quantum handshakes cut by middleboxes                                         | [SSLEOFError troubleshooting](/en/faq/openssl-pq-handshake-eof)                                                                   |
| 429 concurrency errors                                                  | Concurrency quota reached                                                                       | [API concurrency limits](/en/faq/api-concurrency)                                                                                 |
| Output truncated mid-sentence                                           | max\_tokens unset or too small                                                                  | [What is max\_tokens](/en/faq/max-tokens)                                                                                         |
| A specific model won't run                                              | Account permission locked, or token model whitelist                                             | [Why can't I use some models](/en/faq/model-availability) · [Token model whitelist](/en/faq/token-model-whitelist)                |
| Image generation fails / returns empty                                  | Google content safety triggered                                                                 | [Nano Banana failures](/en/faq/nano-banana-image-failure)                                                                         |
| Gemini image API returns NO\_IMAGE                                      | A different cause from safety blocks                                                            | [Why NO\_IMAGE](/en/faq/gemini-no-image)                                                                                          |
| Output differs greatly from the reference image                         | Reference images must be uploaded as base64                                                     | [Image differs from reference](/en/faq/image-result-differs-from-reference)                                                       |
| Upload fails with does not match MIME type                              | The image URL carries CDN processing parameters                                                 | [MIME type mismatch](/en/faq/image-mime-type-mismatch-with-query)                                                                 |
| White-background image shows black spots                                | Known behavior on the AI Studio route                                                           | [White background artifacts](/en/faq/white-background-image-artifacts)                                                            |
| Want to poll image results by task ID                                   | Image generation is synchronous only                                                            | [Is there an async image API](/en/faq/image-async-api)                                                                            |
| Image bill far higher than expected                                     | Resolution, quality, aspect ratio and count scale output tokens                                 | [Why GPT Image output tokens are high](/en/faq/gpt-image-output-token-calculation)                                                |
| Seedance blocks a face reference image                                  | Real faces need asset upload plus identity verification                                         | [Why face assets are blocked](/en/faq/seedance2-face-asset-whitelist)                                                             |
| Model claims to be another vendor / can't state its version             | Model self-knowledge is unreliable                                                              | [Claude claims to be Qwen](/en/faq/claude-identity-confusion) · [Models don't know their version](/en/faq/model-version-identity) |
| Web app smart, API dumb                                                 | The web app ships system prompts and tooling; the API is the bare model                         | [Web app vs API](/en/faq/webapp-vs-api-difference)                                                                                |
| Unfamiliar calls on your KEY                                            | The KEY may be leaked — trace it and disable it                                                 | [Investigate unexpected KEY usage](/en/faq/troubleshoot-key-usage) · [Manage keys securely](/en/faq/key-security-management)      |
| Billing doesn't add up                                                  | Per-usage and per-call billing read differently                                                 | [Reading billing in logs](/en/faq/log-billing-explained) · [Model multiplier](/en/faq/model-multiplier)                           |
| Image or video downloads are slow                                       | Overseas CDN routing on specific servers                                                        | [CDN downloads are slow](/en/faq/cdn-download-slow)                                                                               |
| Do I need a proxy?                                                      | Direct connection works; no proxy required                                                      | [Do I need a proxy](/en/faq/network-proxy)                                                                                        |
| GitHub login says 'Account already bound'                               | That GitHub account is bound to another email                                                   | [GitHub binding error](/en/faq/github-bindng-bindng-error)                                                                        |
| Forgot your password                                                    | Reset by email or ask support for help                                                          | [Forgot password](/en/faq/forgot-password)                                                                                        |

***

## 📚 Browse by Topic

### 🧭 Site Features (4)

| Question                                                                                            | One-line answer                                                              |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Tokens & Groups](/en/faq/token-and-groups)                                                         | How to create a KEY and pick a group                                         |
| [What is a Group? User Group vs Token Group Explained](/en/faq/groups-explained)                    | The group selected on the token is what actually applies                     |
| [How Do the Codex, ClaudeCode, and Default Groups Differ?](/en/faq/codex-claudecode-default-groups) | Different origins and protocols; prefer Default official-relay in production |
| [Why Doesn't APIYI Offer One-Click Integration?](/en/faq/one-click-integration)                     | Integration differs per model; use the AI assistant instead                  |

### 🔑 Tokens & Logs (11)

| Question                                                                                           | One-line answer                                                            |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [How to create a KEY?](/en/faq/token-management)                                                   | Get the default token or create a new one in the console                   |
| [Do I Need to Set Available Models for Tokens?](/en/faq/token-model-whitelist)                     | Optional, but recommended when isolating projects                          |
| [How Do I Manage API Keys Securely?](/en/faq/key-security-management)                              | IP whitelists, model whitelists, and daily habits                          |
| [What's the Difference Between Token Billing Modes?](/en/faq/token-billing-modes)                  | Five billing modes and when each fits                                      |
| [How to view my call records?](/en/faq/call-logs)                                                  | Call and billing detail in the console log page                            |
| [Where Can I Find the Request ID?](/en/faq/request-id-troubleshooting)                             | Check response headers or body by API type; don't mistake a task ID for it |
| [How do I read the billing amounts in the logs?](/en/faq/log-billing-explained)                    | Per-usage vs per-call, and computing cost from usage                       |
| [How long are call logs kept, and when are they cleared?](/en/faq/log-retention-policy)            | Current month plus two prior; cleared on the 5th                           |
| [What should I know about log timezone settings and data export?](/en/faq/log-timezone-and-export) | Keep the account timezone at UTC+0; exports are always UTC+0               |
| [Can I View Detailed Logs in the Backend for Troubleshooting?](/en/faq/user-logs-control)          | Admins can enable verbose logging temporarily                              |
| [How do I investigate unexpected API Key usage?](/en/faq/troubleshoot-key-usage)                   | Trace real IPs in the logs and disable the KEY                             |

### 🏢 Enterprise Services (9)

| Question                                                                                                          | One-line answer                                                         |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [What Is the Enterprise Group? When Should You Use It?](/en/faq/enterprise-group-vertex-fallback)                 | Model-specific group with steadier supply, higher multiplier            |
| [Is There a Faster or Enterprise Route for Image Generation?](/en/faq/image-generation-fast-enterprise-route)     | No express lane; the time goes into model inference itself              |
| [Is APIYI's Enterprise Service Trustworthy? Are the Models Authentic?](/en/faq/enterprise-trust)                  | Transparent official relay — no rerouting or model swapping             |
| [What's the difference between enterprise and individual users?](/en/faq/enterprise-vs-individual)                | Same account type; differences are in support and pricing               |
| [How do enterprise customers recharge?](/en/faq/enterprise-recharge)                                              | Bank transfer preferred; framework contracts and VAT invoices available |
| [How can university customers reimburse worry-free?](/en/faq/university-reimbursement)                            | Invoices, purchase lists, and stamped documents provided                |
| [Does APIYI offer SLA guarantees?](/en/faq/sla-guarantee)                                                         | Yes, including billing-anomaly compensation and credit refills          |
| [Does an Agent Mini-Program Need Algorithm Filing?](/en/faq/agent-miniapp-algorithm-filing)                       | Usually yes; this covers the general process                            |
| [How Do I Handle Compliance for a China-Facing Product Using Overseas Models?](/en/faq/overseas-model-compliance) | License layers, model filing status, and content moderation             |

### 💰 Billing & Security (17)

| Question                                                                                                     | One-line answer                                                     |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [Prices Match the Official Rates — Why Buy from APIYI?](/en/faq/official-pricing-advantages)                 | Same price plus recharge bonuses, stackable with group discounts    |
| [How can APIYI price below the official rates?](/en/faq/why-cheaper-than-official)                           | Bulk purchasing and vendor distribution, not degraded models        |
| [What Does the Model 'Multiplier' Mean?](/en/faq/model-multiplier)                                           | An RMB unit; apply the fixed rate for the USD equivalent            |
| [How Much Computing Power Does 100 RMB Get?](/en/faq/rmb-to-computing-power)                                 | Top-ups use a fixed 1 USD = 7 RMB rate; your system sets the ratio  |
| [Does APIYI Support Cache Billing?](/en/faq/cache-billing)                                                   | All major routes support it; hit rates vary by vendor               |
| [What is the pre-deduction mechanism for API calls?](/en/faq/pre-deduction-quota)                            | Estimated upfront, settled against actual usage                     |
| [Why can't I run requests with remaining balance?](/en/faq/balance-insufficient)                             | Pre-deduction check, or max\_tokens set too high                    |
| [How to Set Up Balance Alerts?](/en/faq/balance-alerts)                                                      | Email, group bots, or the balance alert API                         |
| [Does my APIYI balance expire? What is the validity period?](/en/faq/balance-validity-period)                | 365 days; any new top-up resets the whole balance                   |
| [What Payment Methods Does APIYI Support?](/en/faq/payment-methods)                                          | WeChat, Alipay, USDT, Stripe, PayPal and more                       |
| [What if my invoice amount is less than \$100?](/en/faq/invoice-minimum-amount)                              | Combine small orders until they reach \$100                         |
| [I entered the wrong invoice details. Can the invoice be reissued?](/en/faq/invoice-reissue)                 | Submit the original plus correct details for a reversal and reissue |
| [What recharge promotions are available?](/en/faq/recharge-promotions)                                       | First-time and tiered bonuses, plus invoicing                       |
| [How do I apply for an agent partnership? Can I earn rebates by inviting friends?](/en/faq/referral-program) | Referral rebates are on by default; no application needed           |
| [What Is APIYI's Refund Policy?](/en/faq/refund-policy)                                                      | Conditions, process, fees, and invoice notes                        |
| [How is content safety and compliance ensured?](/en/faq/content-safety)                                      | Moderation mechanisms and violation handling                        |
| [How does APIYI ensure data security?](/en/faq/data-security)                                                | Encrypted transport, minimal storage, access control                |

### ⚙️ Models & API (31)

**Choosing a model and general behavior**

| Question                                                                                                        | One-line answer                                                  |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [How to Choose the Right AI Model?](/en/faq/model-selection-guide)                                              | Select by use case, cost, and speed                              |
| [Why can't I use some models?](/en/faq/model-availability)                                                      | Some models need permission unlocked first                       |
| [Is There a Conversational API That Outputs Both Text and Generated Images?](/en/faq/text-and-image-in-one-api) | Reading images and making images differ; four routes to an image |
| [Do Google Models Run on AI Studio or Vertex?](/en/faq/google-upstream-aistudio-vertex)                         | Default groups use the official AI Studio route                  |
| [What does the -c suffix in model names mean?](/en/faq/model-name-suffix-c)                                     | Marks a different route with different billing                   |
| [Why do official web apps and the API give different results?](/en/faq/webapp-vs-api-difference)                | The web app adds system prompts; the API is the bare model       |
| [Does the API Have Memory Like ChatGPT?](/en/faq/api-memory)                                                    | No; memory is local files the client reads and writes            |
| [Why Don't AI Models Know Their Own Version?](/en/faq/model-version-identity)                                   | Model self-knowledge is unreliable                               |
| [Why Does Claude Claim to Be Qwen or DeepSeek?](/en/faq/claude-identity-confusion)                              | Identity hallucination, not a swapped model                      |

**Integration and parameters**

| Question                                                                                                                                               | One-line answer                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [How to Configure Base URL? Differences Between /v1, Root Domain, and /v1beta](/en/faq/base-url-config)                                                | One form each for OpenAI, Claude, and Gemini                     |
| [What's the difference between streaming and non-streaming calls?](/en/faq/streaming-vs-non-streaming)                                                 | Your `stream` flag decides it; content and billing are identical |
| [What is max\_tokens? What Happens If Not Set?](/en/faq/max-tokens)                                                                                    | Caps output length; there is a default if unset                  |
| [What Are the API Concurrency Limits?](/en/faq/api-concurrency)                                                                                        | Limits vary by model type and can be raised                      |
| [How do I avoid API timeouts?](/en/faq/timeout-configuration)                                                                                          | Raise the client timeout; reasoning models are slow              |
| [How Can I Troubleshoot Model API Errors?](/en/faq/model-error-troubleshooting)                                                                        | Work through params, auth, 429, 5xx, and timeouts in order       |
| [The log says the call finished and was billed, but my client never received a response — how do I troubleshoot?](/en/faq/log-duration-vs-client-wait) | The two clocks measure different windows; measure the gap first  |

**Image generation**

| Question                                                                                                                               | One-line answer                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Common Reasons for Nano Banana Image Generation Failures](/en/faq/nano-banana-image-failure)                                          | Usually Google content safety being triggered                              |
| [Why Does the Gemini Image API Return NO\_IMAGE?](/en/faq/gemini-no-image)                                                             | A different cause from safety blocks; troubleshoot separately              |
| [Why Does a White-Background Image Show Black Spots, Dirty Patches, or Blurry Color Blocks?](/en/faq/white-background-image-artifacts) | Prompt for a light background instead of pure white                        |
| [Why does my image turn reddish after editing with banana pro?](/en/faq/banana-pro-edit-red-cast)                                      | Switch to the Vertex route, or use `gpt-image-2`                           |
| [How to fix distorted prints when changing outfits with Nano Banana Pro?](/en/faq/nano-banana-pro-print-distortion)                    | Prompt wording, reference weighting, and cross-route fallback              |
| [Why Does the Generated Image Differ Greatly from the Reference?](/en/faq/image-result-differs-from-reference)                         | Reference images must be base64 encoded                                    |
| [How Do I Generate Images with a Transparent Background (PNG Cutouts)?](/en/faq/image-transparent-background)                          | Pass `background: "transparent"` to `gpt-image-2` for a real alpha channel |
| [How to fix the image content does not match MIME type error?](/en/faq/image-mime-type-mismatch-with-query)                            | Strip the CDN processing parameters from the image URL                     |
| [Why Are GPT Image Output Tokens So High?](/en/faq/gpt-image-output-token-calculation)                                                 | Resolution, quality, aspect ratio, and count all scale output tokens       |
| [Codex Integration for GPT-Image Fails with Incorrect API Key](/en/faq/gpt-image-incorrect-api-key-openai)                             | The error comes from OpenAI; the request never reached APIYI               |
| [Is There an Async Image API? Can I Query Results by Task ID?](/en/faq/image-async-api)                                                | Synchronous only; no task ID lookup                                        |

**Video generation**

| Question                                                                                                      | One-line answer                                         |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [Can I Cancel a Seedance Video Task After Submission?](/en/faq/seedance-video-task-cancel)                    | No cancel endpoint exists; focus on not resubmitting    |
| [How do I look up a Seedance video's real cost by task\_id?](/en/faq/seedance-task-cost-lookup)               | Reconciling two billing rows against the task quota     |
| [Does Seedance 2.0 auto-upload face references to the asset library?](/en/faq/seedance2-asset-face-reference) | No — upload first, then reference the `asset://` ID     |
| [Why Does Seedance 2.0 / 2.5 Block Face Assets?](/en/faq/seedance2-face-asset-whitelist)                      | Real faces need asset upload plus identity verification |

### 🌐 Network & Connection (7)

| Question                                                                              | One-line answer                                                                     |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Do I Need a Proxy to Use the API?](/en/faq/network-proxy)                            | Direct connection works; no proxy or VPN needed                                     |
| [Python Raises SSLEOFError but curl Works?](/en/faq/openssl-pq-handshake-eof)         | OpenSSL 3.5+ post-quantum handshakes get cut by middleboxes                         |
| [Where are APIYI's Servers? Which Server Should I Choose?](/en/faq/server-location)   | Node locations, latency testing, and purchase advice                                |
| [CDN Image/Video Downloads Are Slow — What to Do?](/en/faq/cdn-download-slow)         | Diagnosing overseas CDN routing on specific servers                                 |
| [How Can I Reduce Image API Latency?](/en/faq/image-api-network-latency-optimization) | Connection reuse, HTTP/1.1, and timeout settings                                    |
| [Website or API Returns 502 — What Should I Do?](/en/faq/website-502-error)           | Brief container auto-restart; recovers in \~1 minute, never billed, retry after 30s |
| [Script Gets 502 but Nothing in the Call Logs?](/en/faq/proxy-empty-502)              | Empty 502 from a local proxy; make the script bypass the system proxy               |

### 👤 Account & Login (6)

| Question                                                                                 | One-line answer                                  |
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
