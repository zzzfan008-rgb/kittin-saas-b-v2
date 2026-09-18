> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Do I Handle Compliance for a China-Facing Product Using Overseas Models?

> Compliance essentials for China-facing products calling overseas LLMs via API: product licenses, model filing status, content moderation requirements, and common industry practices.

## Short Answer

Yes, such a product can be built. Break the compliance question into two layers:

* **Standard product licenses** (ICP filing, app store review, etc.) are handled as usual — they have nothing to do with which model runs in your backend
* **Model filing**: Chinese regulators currently only recognize domestic models (the ones whose filing credentials are provided by major cloud platforms); overseas models cannot obtain a filing in China

In addition, any product serving users in mainland China must build its own content moderation pipeline — this is the baseline, regardless of which model you use.

## Layer 1: Standard Licenses Determined by Product Form

<CardGroup cols={2}>
  <Card title="Websites" icon="globe">
    An ICP filing is required; commercial services may additionally need a value-added telecom business license (such as an ICP license). These are standard requirements for launching any website in China.
  </Card>

  <Card title="Mini Programs / Apps" icon="smartphone">
    Follow the category and qualification requirements of WeChat and the app stores. For AI categories, platforms usually ask for model filing information during listing review.
  </Card>
</CardGroup>

This layer is largely independent of which model vendor you use — just prepare the materials according to platform rules.

## Layer 2: The Current State of Model Filing

For generative AI service filings, Chinese regulators currently recognize **domestic models that have completed filing** — the ones whose credentials major cloud platforms can provide. Overseas models (GPT, Claude, Gemini, etc.) cannot obtain a filing in mainland China.

In other words: if the listing process asks for model filing information, an overseas model simply cannot provide that credential.

For the filing procedure itself, see [Algorithm Filing for AI Agent Mini Programs](/en/faq/agent-miniapp-algorithm-filing).

## Common Industry Practice and Its Risks

In practice, many China-facing products still use overseas models. The common approach looks like this:

* Submit the filing credentials of an **already-filed domestic model** during listing and registration
* Keep the actual backend model hidden, exposing only a productized feature name (an alias) to users
* Users see names like "XX Assistant" or "XX Photo Editor" — never the underlying model name

<Warning>
  **Risk notice**: This practice sits in a gray area — the filed credentials do not match the actual model in use, which carries the risk of being ruled non-compliant by platforms or regulators. We describe this industry phenomenon objectively; it is not a recommendation, and any risk is borne by the product operator. For serious products, consult qualified legal counsel before deciding.
</Warning>

## Content Moderation Is the Baseline

Whatever model runs in your backend, a product serving users in mainland China needs its **own content moderation pipeline**:

* **Input side**: intercept sensitive information and prohibited requests before they reach the model
* **Output side**: review generated results to keep non-compliant content from reaching users

A model's built-in safety mechanisms cannot substitute for business-level compliance — model-side filtering standards do not align with Chinese regulatory requirements. Adding a moderation layer on your own platform is the sound compliance posture.

<Tip>
  Major cloud vendors offer mature content moderation services (text and image moderation APIs). Integration cost is low — plan for it at the product design stage.
</Tip>

For more on content compliance, see [Content Safety Policy](/en/faq/content-safety).

## FAQ

<AccordionGroup>
  <Accordion title="When calling models through APIYI, who is the filing entity?">
    The filing entity is **the product operator serving end users** — that is, you. APIYI provides an API relay channel; it cannot substitute for your product's own licenses and filing obligations.
  </Accordion>

  <Accordion title="Are algorithm filing and generative AI service filing the same thing?">
    No. Algorithm filing covers the algorithm service itself (recommendation, generative synthesis, etc.) and is handled by the service provider — the product operator. Generative AI service filing (commonly called model filing) covers the LLM service and is usually completed by the model vendor. The obligation product teams most often face is the former; see [Algorithm Filing for AI Agent Mini Programs](/en/faq/agent-miniapp-algorithm-filing) for the procedure.
  </Accordion>

  <Accordion title="My product only serves overseas users — do I still need all this?">
    If your product does not serve users in mainland China, the filing requirements above generally do not apply, and you can use overseas models directly. You still need to comply with the laws of your target markets (such as EU data protection rules).
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="Algorithm Filing for Mini Programs" icon="file-check" href="/en/faq/agent-miniapp-algorithm-filing">
    General procedure and hands-on experience for algorithm filing.
  </Card>

  <Card title="Content Safety Policy" icon="shield-check" href="/en/faq/content-safety">
    Content compliance notes for LLM-based products.
  </Card>

  <Card title="Data Security" icon="shield" href="/en/faq/data-security">
    Encrypted transport and data minimization mechanisms.
  </Card>

  <Card title="Server Locations" icon="server" href="/en/faq/server-location">
    APIYI's server locations and network routes.
  </Card>
</CardGroup>

<Note>
  This article shares practical experience and does not constitute legal advice. Policies in this area are still evolving — always follow the latest requirements from regulators and platforms.
</Note>
