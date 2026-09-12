> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Is APIYI's Enterprise Service Trustworthy? Are the Models Authentic?

> We are a pure, transparent official-relay proxy — no rerouting, no downgrading, no swapping models. This page gives verifiable reasons to trust us, from uptime and traffic data to pricing logic and data security.

## Short Answer

**Yes — and we welcome you to verify it yourself, rather than just take our word for it.**

APIYI is a **pure, transparent official-relay proxy**: requests only travel through traceable official channels (for example, Claude routes through AWS Bedrock's official access by default). We **do not reroute to cheaper models, do not downgrade, do not swap models, and do not retain your data**. We are not a low-price platform — the real cost of low prices is usually the "dilution" you can't see. Below are several **objectively verifiable** reasons to trust us, and you can always start with a small balance to build trust step by step.

<Info>
  **We completely understand this concern.**

  "Will the gateway secretly reroute my requests to a cheaper model?" — every enterprise that takes vendor selection seriously asks this. Rather than promises, we prefer to offer **verifiable evidence** and **a way to test it yourself**.
</Info>

## Why We Won't "Secretly Swap in a Cheaper Model"

The core reason is simple: **our business model doesn't make money by diluting quality.**

<Warning>
  **"Dilution" is something only low-price platforms need to do**

  Reverse-engineered access, shared accounts, model downgrading, silently replacing an expensive model with a cheap one — all of these can push prices down, but when you use them you have no idea what's been mixed into the channel: output quality fluctuates, service can be cut off anytime, and you may not even notice when your conversation data gets resold.

  **The lower the price, the less transparent it usually is.** A low-price platform almost certainly has a hidden cost you can't see.
</Warning>

<Info>
  **APIYI takes the other road: pure official relay — we'd rather be a bit more expensive but clean**

  Take Claude as an example: by default we route through **AWS Bedrock's official access**, with **Anthropic's official-key direct connection** as backup. Both channels are pure official relay — traceable, pay-as-you-go, and they don't retain data. The all-in cost is about **85% of the official price** (roughly the 79%–86% range after top-up bonuses).

  Our savings come from **high cache-hit rates** (Prompt Cache under Claude's native format) and top-up bonuses — **not from downgrading or swapping models**. See [Claude API Basics](/api-capabilities/claude).
</Info>

## 5 Reasons You Can Verify

<CardGroup cols={2}>
  <Card title="2 years online, ~145K monthly visits" icon="chart-line">
    Not a new site — with a base of long-term, repeat customers.
  </Card>

  <Card title="A carefully maintained docs center" icon="book-open">
    Hundreds of docs and FAQs, continuously updated — a direct sign of a serious platform.
  </Card>

  <Card title="We don't take the low-price route" icon="shield-check">
    Pure official relay, \~85% of list price — we'd rather be a bit pricier but clean.
  </Card>

  <Card title="Transparent proxy, no data retention" icon="lock">
    Secure forwarding only; we don't store your conversation content.
  </Card>
</CardGroup>

### 1. Uptime and Traffic Level

APIYI has been **online for over 2 years** — not a hastily set-up new site, but a platform backed by long-term, repeat customers. Third-party traffic monitoring shows `api.apiyi.com` with **\~145K monthly visits and a domain registered over 2 years ago**:

<img src="https://mintcdn.com/apiyillc/dOkZIz7MGldG6ZGu/images/apiyi-traffic-similarweb.png?fit=max&auto=format&n=dOkZIz7MGldG6ZGu&q=85&s=81086e48816ad5859f399a3b78a03eb7" alt="Third-party traffic stats: api.apiyi.com with ~145K monthly visits and a domain registered over 2 years" style={{maxWidth: "560px"}} width="1016" height="1212" data-path="images/apiyi-traffic-similarweb.png" />

<Note>
  Data comes from a third-party traffic-monitoring tool, for reference only. A platform that runs scams or plays "dilution" tricks would struggle to sustain two years of stable traffic and continued customer retention.
</Note>

### 2. The Professionalism of the Docs Center

The very documentation you're reading is direct evidence of whether the platform is "carefully maintained": hundreds of API guides, model notes, and FAQs are continuously updated, with pricing, billing rules, and channel details all out in the open. **A platform looking to make a quick buck wouldn't spend the effort to explain all this.**

### 3. On Pricing, We Are Not a Low-Price Platform

Our pricing in one sentence: **about 85% of list price for pure official-relay AWS Claude, reliable quality, with savings driven by high cache-hit rates.**

We aren't expensive for its own sake — we hold the price at the line between "stable and reliable" and "reasonably priced," and **we don't touch cheap goods of unknown origin**. If a platform's price is absurdly low, be very cautious: that gap is very likely recovered in ways you can't see.

See [Claude API Basics](/api-capabilities/claude).

### 4. Data Security: A Transparent Proxy That Retains Nothing

APIYI is a **transparent proxy**: our job is to securely and efficiently forward requests to upstream official channels, and we **do not retain your conversation content**. This is both a privacy guarantee and, fundamentally, the reason we have no incentive to "tamper" with your requests.

See [How does APIYI protect data security?](/faq/data-security).

### 5. Trust Is Built Step by Step

We don't ask you to commit a large amount up front. **Trust should be built on verification:**

<Tip>
  **A suggested onboarding rhythm**

  1. Top up a small **\$10 balance** and run your real business scenarios;
  2. Compare against official output, check the call logs, confirm quality and billing meet expectations;
  3. Once confirmed, gradually scale up toward a long-term partnership.

  This way every step of your investment rests on already-verified results, keeping risk under control.
</Tip>

## How to Verify "Model Authenticity" Yourself

Instead of relying on promises, you can **check it hands-on**:

<Steps>
  <Step title="Small-balance side-by-side test">
    Use a **\$10 balance** to run real tasks and compare the output against the official channel — check whether quality is consistent and stable.
  </Step>

  <Step title="Review call logs">
    In the console, review the model, token consumption, and billing details for each call — transparent and traceable accounting. See [How do I check call logs?](/faq/call-logs).
  </Step>

  <Step title="Verify caching and billing">
    When using Claude's **Anthropic native format** (`/v1/messages`), cache billing can be triggered, and bills drop noticeably in long-context / repeated system-prompt scenarios — a feature only official-relay channels offer. See [Claude API Basics](/api-capabilities/claude).
  </Step>
</Steps>

<Note>
  If you're an enterprise customer with high monthly consumption, you can also contact us to agree on SLA guarantees and credit-compensation terms, and write the responsibility boundaries into a contract. See [Does APIYI offer an SLA?](/faq/sla-guarantee).
</Note>

## Related Docs

<CardGroup cols={2}>
  <Card title="How does APIYI protect data security?" icon="lock" href="/faq/data-security">
    Transparent proxy, minimized storage, and access control
  </Card>

  <Card title="Claude API Basics" icon="sparkles" href="/api-capabilities/claude">
    Pure official-relay AWS Claude, \~85% of list price, and cache billing
  </Card>

  <Card title="Does APIYI offer an SLA?" icon="shield-check" href="/faq/sla-guarantee">
    Abnormal-billing compensation and enterprise contract terms
  </Card>

  <Card title="Enterprise vs. individual accounts" icon="building-2" href="/faq/enterprise-vs-individual">
    Enterprise accounts, multi-token, and internal sharing
  </Card>
</CardGroup>

## Contact Us

<Card title="WeCom Customer Service" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  For enterprise evaluation, small-test onboarding, SLA and contract terms, feel free to reach out:

  * [Contact WeCom customer service](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * Email: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
