> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What's the difference between enterprise and individual users?

> On APIYI, enterprise and individual users have no difference in account attributes. This article explains multi-token management, service groups, internal sharing, and pricing policy.

## Quick Answer

**In terms of account attributes, there is no difference between enterprise and individual users—once registered, you are a user, using the same console and API.**

The only difference lies in "how it's used": enterprises typically separate departments with multiple tokens, connect through enterprise WeChat service groups, and share accounts internally for better collaboration. Pricing is public and transparent for all users, with no separate negotiation.

## Account Attributes: Completely Identical

APIYI does not distinguish between an "enterprise edition" and an "individual edition". Whether you're an individual developer or an enterprise team, you get the same type of account after registration, with the same:

* Access to 400+ models
* The same `https://api.apiyi.com` endpoint
* The same console, token management, and logging features
* The same public pricing

<Info>
  Enterprises do not need to activate a separate "enterprise account"—just register directly. The practices below describe what enterprises commonly do in real-world usage.
</Info>

## Common Ways Enterprises Use APIYI

<CardGroup cols={2}>
  <Card title="Multiple Tokens by Department / Employee" icon="key">
    Create multiple tokens (KEYs) to isolate usage across departments or employees, making it easy to track consumption, control quotas, and manage permissions separately.
  </Card>

  <Card title="Enterprise WeChat Service Group" icon="message-circle">
    Contact APIYI after-sales and operations to create a dedicated enterprise WeChat service group for API integration support and daily Q\&A.
  </Card>

  <Card title="Shared Account Internally" icon="users">
    When the user, reimburser, or payer differ, you can share the account credentials internally and manage recharges and usage from one central account.
  </Card>

  <Card title="Usage Log Query" icon="file-text">
    Query a KEY's consumption logs without logging into the console—convenient for finance or non-technical colleagues to verify usage.
  </Card>
</CardGroup>

### 1. Separate Departments or Employees with Multiple Tokens

Enterprises can create multiple tokens (KEYs) in the console and assign them to different departments or employees. Benefits:

* **Usage isolation**: Each token's consumption is tracked independently, simplifying internal accounting
* **Quota control**: Set a balance cap and expiration date per token
* **Permission management**: If a token leaks or an employee leaves, disable just that one—other business is unaffected

For detailed token creation steps, see [How to create a KEY?](/en/faq/token-management).

### 2. Connect Through an Enterprise WeChat Service Group

Enterprise customers can contact the APIYI after-sales and operations team to create a dedicated **enterprise WeChat service group**, where we assist with API integration and resolve day-to-day issues.

<Tip>
  For basic questions (token creation, billing rules, model selection, common errors), we recommend **checking this documentation first**—you'll get answers faster. For topics not covered here or enterprise-level integration questions, use the service group; it's more efficient that way.
</Tip>

### 3. Internal Account Sharing and Usage Query

Enterprises often face the situation where "the user, reimburser, and payer are not the same person." APIYI's approach is simple:

* **Share account credentials**: Share one account internally, with a single central account handling recharges and token management
* **Login-free usage query**: If logging into the console is inconvenient, you can verify a KEY's (token's) consumption logs through the query page

<Card title="Token Usage Query Page" icon="search" href="https://api.apiyi.com/query">
  Query without logging in: [https://api.apiyi.com/query](https://api.apiyi.com/query)

  Enter a token (KEY) to view its consumption logs—convenient for finance or non-technical colleagues to verify usage.
</Card>

## Do Enterprise Customers Get Separate Pricing?

**No. Our pricing is public and transparent, applied equally to all users.**

APIYI's only form of discount is the **recharge bonus campaign**, which we recommend enterprise customers join—it's more cost-effective for long-term use.

<Info>
  **About us**: APIYI is a site that has operated stably for two years, delivered by a professional team with long-term, reliable service. Unified public pricing eliminates the back-and-forth of negotiation—which is itself a form of certainty we offer enterprise customers.
</Info>

For recharge bonus details, see [Recharge Promotions](/en/faq/recharge-promotions).

## Related Documentation

<CardGroup cols={2}>
  <Card title="How to create a KEY?" icon="key" href="/en/faq/token-management">
    Complete guide to multi-token management
  </Card>

  <Card title="How to view call logs?" icon="file-text" href="/en/faq/call-logs">
    How to query usage and consumption
  </Card>

  <Card title="Recharge Promotions" icon="gift" href="/en/faq/recharge-promotions">
    Recharge bonus campaign details
  </Card>

  <Card title="What payment methods are supported?" icon="credit-card" href="/en/faq/payment-methods">
    Bank transfer and other payment methods
  </Card>
</CardGroup>

## Contact Us

<Card title="Enterprise WeChat Support" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  For enterprise integration, service group requests, and more, contact us:

  * [Contact Enterprise WeChat Support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * Email: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
