> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How can APIYI price below the official rates?

> Some models cost less than official list prices because of volume-based purchasing and vendor distribution partnerships — not throttled models or reverse-engineered endpoints. Also: why price alone is the wrong yardstick, and how to judge what a suspiciously low quote really costs.

## Short answer

**It comes from volume and distribution, not from touching the model itself.**

Model vendors — Chinese vendors in particular — need distribution channels to reach developers. As a channel with steady traffic, APIYI commits to volume or minimum spend in exchange for a limited purchasing discount, and passes that discount on. We take **no advertising fees and no paid placement** from vendors; pricing is driven purely by what we pay upstream.

To be clear: **not every model is cheaper than official.** OpenAI, Anthropic and Google essentially do not offer resale discounts, so those models are priced **at parity** with the official rates, and the savings come from [top-up bonuses](/en/faq/official-pricing-advantages) instead. The models that genuinely land below official list price are mostly Chinese models and certain partner groups.

## Where the discount comes from

<CardGroup cols={3}>
  <Card title="Volume and spend commitments" icon="chart-column">
    Aggregated traffic lets us commit to volume or minimum spend and earn tiered purchase pricing — this is the main source
  </Card>

  <Card title="Distribution partnerships" icon="handshake">
    Vendors treat channel discounts as a distribution cost, not a marketing budget. We charge no ad fees, so the discount lands on the price list
  </Card>

  <Card title="Shared operating cost" icon="layers">
    One gateway, one billing system and one set of docs serve every model — far cheaper at the margin than standing that up per vendor
  </Card>
</CardGroup>

<Note>
  **No paid placement.** Whether a model is listed and where it ranks depends on our test results and user demand — vendors cannot buy position. That is precisely what keeps the pricing explainable.
</Note>

## From the vendor's point of view: what a router is worth

Vendors grant channel discounts for a reason: an aggregation gateway takes on work that would cost them more to do themselves.

<CardGroup cols={2}>
  <Card title="Reach to incremental developers" icon="users">
    Small teams and individual developers will not register, add a card and clear compliance for a single vendor. A channel is often their only entry point
  </Card>

  <Card title="Front-line support absorbed" icon="headset">
    Integration questions, parameter debugging and fault isolation land on us — the vendor need not staff support for a long tail of small accounts
  </Card>

  <Card title="A real feedback loop" icon="microscope">
    We test new models on parameter compatibility, billing semantics, field completeness and stability, then take findings upstream — far more actionable than scattered tickets
  </Card>

  <Card title="Simplified settlement" icon="file-text">
    One contracting entity and one invoice replace thousands of small cross-border payments
  </Card>

  <Card title="A level playing field" icon="scale">
    A new model sits where it can be compared head-to-head with the incumbents. Being chosen by developers proves more than any ad spend
  </Card>

  <Card title="Cold-start volume" icon="rocket">
    A freshly launched model needs real traffic most, and a channel can supply usable load and feedback quickly
  </Card>
</CardGroup>

<Tip>
  Put differently: the discount is **earned through partnership**, not squeezed out of model quality. Same model, same upstream.
</Tip>

## Price is not the only variable: what a very low quote can cost

Quotes lower than ours do exist. A low price is not the problem — **where the low price comes from** is. The common sources and their risks:

| Source of the low price                           | Typical signs                                                              | Potential cost                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Reverse-engineered / web endpoints wrapped as API | No proper usage fields, no cache billing, some parameters silently ignored | Breaks the moment upstream changes; no way to debug and no official-grade billing record |
| Shared or unexplained accounts                    | Priced well below official cost with no explanation of sourcing            | Accounts can be banned at any time; possible compliance exposure                         |
| Silent downgrades                                 | Billed as model A but served by a smaller model or reduced settings        | Output falls short of expectations and is hard to prove                                  |
| Monetizing your data                              | Free or near-free, with vague language about log retention                 | Request content may be retained or used for training                                     |
| Loss-leader pricing                               | Clearly below purchase cost, paired with a push for large prepayments      | Later price hikes, throttling, or prepaid credit you cannot use up                       |

<Warning>
  **Weigh data security heavily.** Price is negotiable; a data leak is not reversible. Before integrating, confirm the provider's log retention policy, whether content is used for training, and whether they will sign a confidentiality agreement — especially if you send code, customer records or internal documents.
</Warning>

### How to validate a quote yourself

<Steps>
  <Step title="Start small — do not negotiate volume first">
    Run a minimal top-up end to end before committing to a large prepayment.
  </Step>

  <Step title="Check usage fields against the official semantics">
    Compare returned token counts and cache-hit fields with the vendor's own. Missing fields, or fields stuck at zero, usually mean it is not an official direct connection.
  </Step>

  <Step title="Test stability, not just whether a call succeeds">
    Run sustained load, then watch behavior under long context and high concurrency, including time to first token and tail latency.
  </Step>

  <Step title="Ask about data retention">
    How long are logs kept, who can access them, is content used for training, and will they sign an NDA.
  </Step>

  <Step title="Look for accountable paperwork">
    Can they invoice, sign a contract, and state refund and compensation rules. When something breaks, this is what you have to stand on.
  </Step>
</Steps>

## What we care about more: service and stability

Price is one line item. Long-run cost is decided by what happens when something goes wrong:

<CardGroup cols={2}>
  <Card title="Multi-channel redundancy" icon="git-branch">
    The same model is wired to multiple upstream channels, so traffic can be switched when one degrades
  </Card>

  <Card title="Real testing and post-mortems" icon="clipboard-check">
    We test parameters and billing before a model goes live, and publish reproducible analysis after an incident rather than a bare "resolved"
  </Card>

  <Card title="Human support" icon="message-circle">
    Tickets and WeChat support reach engineers, not a template bot
  </Card>

  <Card title="Transparent billing" icon="receipt">
    Per-call logs and deduction details are auditable in the console, with published billing semantics
  </Card>

  <Card title="Minimal data retention" icon="shield">
    Request content is not used for training, and enterprise customers can negotiate retention terms
  </Card>

  <Card title="Enterprise settlement" icon="building">
    Bank transfer, invoices, contracts and NDAs are supported for procurement and reimbursement workflows
  </Card>
</CardGroup>

<Card title="See SLA and compensation rules" icon="shield-check" href="/en/faq/sla-guarantee">
  How losses caused by our issues are compensated, and what enterprise customers can negotiate
</Card>

## So how does APIYI actually set prices

<AccordionGroup>
  <Accordion title="Major overseas models (OpenAI / Claude / Gemini, etc.)">
    Priced **at parity** with official rates. These vendors offer no resale margin, so parity is the normal floor — a quote below official cost usually signals a non-official source. Savings come from **top-up bonuses**, and some groups carry an additional discount that stacks on top.
  </Accordion>

  <Accordion title="Chinese models and selected partner groups">
    These can be priced **below official list**. The exact gap depends on current purchasing terms; the Model Pricing page in the console is authoritative.
  </Accordion>

  <Accordion title="RMB pricing">
    Converted at a **fixed 1:7 rate** that does not track spot FX, which keeps budgeting and reconciliation predictable. See [how RMB converts to credits](/en/faq/rmb-to-computing-power).
  </Accordion>

  <Accordion title="We do not claim to be the cheapest anywhere">
    What we do commit to is that **every price is explainable and every discount traceable** to its source. We will not match a low price we cannot account for.
  </Accordion>
</AccordionGroup>

## Common questions

<AccordionGroup>
  <Accordion title="Someone quoted me less than you — does that mean you have no edge?">
    They may simply have better purchasing terms, which is perfectly normal, or they may be sourcing differently. Run the validation steps above — check whether usage fields are complete, how it holds up under load, and what the retention terms say. If everything checks out, it is a legitimate price difference. If the sourcing cannot be explained, the gap is a risk premium.
  </Accordion>

  <Accordion title="Does a lower price mean lower model quality?">
    No. We forward directly to official endpoints — no throttling, no model substitution, no reduced settings. You can verify output yourself; see [is APIYI's enterprise service trustworthy](/en/faq/enterprise-trust).
  </Accordion>

  <Accordion title="Can the discount disappear overnight?">
    Pricing follows upstream purchasing terms, and any change is announced on the site. Credit already in your account is unaffected — we do not raise prices unilaterally to burn through prepaid balances.
  </Accordion>

  <Accordion title="Why not just price every model below official?">
    Because we will not fake what we cannot deliver. Major overseas vendors leave no resale margin, so forcing the price down would mean switching to a different sourcing channel — paid for in stability and data security. We would rather hold parity there and put the savings into top-up bonuses.
  </Accordion>

  <Accordion title="How do you make money then?">
    On a reasonable spread between purchase and sale price, plus the operating efficiency that scale brings. A few models run at close to zero margin purely to keep them available, and we accept that — a complete model lineup matters more to us than the margin on any single one.
  </Accordion>
</AccordionGroup>

## Related documents

* [Prices Match the Official Rates — Why Buy from APIYI?](/en/faq/official-pricing-advantages)
* [What top-up promotions are available?](/en/faq/recharge-promotions)
* [What is a Group? User Group vs Token Group Explained](/en/faq/groups-explained)
* [Is APIYI's enterprise service trustworthy?](/en/faq/enterprise-trust)
* [How does APIYI ensure data security?](/en/faq/data-security)
* [Does APIYI offer SLA guarantees?](/en/faq/sla-guarantee)
