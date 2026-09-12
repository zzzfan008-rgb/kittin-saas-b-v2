> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What Payment Methods Does APIYI Support?

> APIYI supports self-serve online recharge (WeChat / Alipay / USDT / Stripe foreign credit cards) and manual recharge (PayPal / Wise / Mercury Bank / bank wire). Invoices can be issued via our Chinese or US legal entity.

## Quick Answer

APIYI currently supports **7 mainstream payment methods**, in two categories:

* **🟢 Self-serve online recharge** (real-time crediting): **WeChat, Alipay, USDT, Stripe (foreign credit cards)**
* **🛠️ Manual recharge** (credited by support after transfer): **PayPal, Wise, Mercury Bank, corporate bank wire**

Invoices can be issued via either our **Chinese legal entity (VAT 增值税发票)** or our **US legal entity (PDF Invoice)** — covering both domestic and overseas finance workflows.

## Payment Methods Overview

| Method           | How it works                                                                                                                                         | Recharge mode                                    | Best for                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------ |
| **WeChat Pay**   | In-site online, **China-only users**                                                                                                                 | Self-serve                                       | China-mainland individuals           |
| **Alipay**       | In-site online, supports **Alipay International** and overseas accounts                                                                              | Self-serve                                       | China + overseas Chinese users       |
| **USDT**         | In-site online, crypto, **global users**, fee ≈ **2 USDT per transfer** (cheaper if you bring your own TRON energy; same flat fee for large amounts) | Self-serve                                       | Global / crypto users                |
| **Stripe**       | In-site online, **foreign-currency credit cards** (real-time, 3D Secure); **\$50 minimum per transaction**                                           | Self-serve                                       | Overseas individuals / companies     |
| **PayPal**       | Transfer to a designated account, **fee ≈ 6%**, paid by the user                                                                                     | Contact support for PayPal handle, manual credit | Overseas individuals                 |
| **Wise**         | Transfer to a designated Wise account                                                                                                                | Contact support for Wise details, manual credit  | Cross-border individuals / companies |
| **Mercury Bank** | Transfer to a designated bank account, **typically no fee**, **Invoice issued automatically**                                                        | Contact support for Payment Link, manual credit  | Top choice for overseas companies    |

## 🟢 Self-serve Online Recharge (Real-time)

<CardGroup cols={2}>
  <Card title="WeChat Pay" icon="wechat" iconType="brands">
    One-click QR-code payment in the console. **China-mainland users only.** Fastest option for domestic individuals.
  </Card>

  <Card title="Alipay" icon="alipay" iconType="brands">
    In-site online. Works with both **Alipay International** and overseas accounts — friendly for global Chinese users.
  </Card>

  <Card title="USDT (Crypto)" icon="bitcoin">
    In-site online, **global access, 24/7**. Fee around **2 USDT per transfer** — same flat fee regardless of amount; bring your own TRON energy to cut fees further.

    Supported networks: **TRC20** (recommended), **Solana**, and other mainstream chains.
  </Card>

  <Card title="Stripe (Foreign Credit Cards)" icon="credit-card">
    In-site online, accepts **foreign-currency credit cards**, **real-time crediting**, backed by 3D Secure. Use a real-name card issued to your **company / yourself / your school**.

    ⚠️ **\$50 minimum per transaction**: Stripe is unavailable when the top-up amount is below \$50.

    📖 [Minimum change notice](/en/live/2026-07/stripe-minimum-topup-50) · [Launch announcement](/en/live/2026-05/stripe-payment-launch)
  </Card>
</CardGroup>

<Warning>
  **Stripe security notice**: Stripe enforces strict risk controls — **unsafe or non-real-name cards will be rejected outright**. Accounts attempting **malicious payments** (stolen cards, chargebacks, fraud testing) will be **banned**. Do not use someone else's card or test cards to retry.
</Warning>

## 🛠️ Manual Recharge (Credited by Support)

<CardGroup cols={2}>
  <Card title="PayPal" icon="paypal" iconType="brands">
    Transfer to the PayPal handle provided by support. **Fee around 6%, paid by the user** (i.e. the transferred amount should cover the fee). Best for small overseas individual top-ups.
  </Card>

  <Card title="Wise (formerly TransferWise)" icon="globe">
    Transfer to the Wise account provided by support. Transparent FX, fast cross-border settlement — great for **freelancers and overseas companies**.
  </Card>

  <Card title="Mercury Bank (recommended for overseas companies)" icon="landmark">
    Transfer to the bank account / Payment Link provided by support. **Typically no fee**, and an **Invoice is issued automatically** on arrival — most finance-friendly for overseas companies.
  </Card>

  <Card title="Corporate Wire (Bank Transfer)" icon="building">
    For **Chinese-entity clients** or **overseas businesses paying via a Chinese trading partner** (see cross-border workflow below).
  </Card>
</CardGroup>

<Tip>
  **Manual recharge workflow**: 1️⃣ Contact support for the receiving account → 2️⃣ Complete the transfer → 3️⃣ Send proof / hash / Payment Link screenshot → 4️⃣ Support verifies and credits your APIYI balance.
</Tip>

## 🌏 Cross-border / Overseas Customer Workflow

For overseas customers (e.g. **Russia, Central Asia, Southeast Asia**) who need to pay through a Chinese trading partner, we offer a complete compliant workflow:

<Steps>
  <Step title="Sign contract with the Chinese entity">
    The overseas customer signs a procurement / service contract with APIYI's **Chinese legal entity**, specifying amount, currency, and payment terms.
  </Step>

  <Step title="Bank wire to corporate account">
    Pay the service fee via corporate bank transfer (**SWIFT / cross-border CNY / RUB settlement**) to our designated corporate account.
  </Step>

  <Step title="Manual credit to APIYI balance">
    Once finance confirms the payment, we **manually credit your APIYI console balance**, which is immediately usable for API calls.
  </Step>

  <Step title="Issue invoice / Invoice">
    We can issue a **Chinese VAT invoice** (Chinese entity) or a **US Invoice** (US entity) — pick whichever fits your local accounting and reimbursement workflow.
  </Step>
</Steps>

<Info>
  **Legal entity note**: APIYI operates as a **Chinese company + US company** dual-entity structure. We can flex invoicing based on customer location and finance needs. Contact support for the exact billing name and tax ID.
</Info>

## 🧾 Invoice Issuance

| Invoice type                      | Issuing entity  | Best for                                                         |
| --------------------------------- | --------------- | ---------------------------------------------------------------- |
| **Chinese VAT invoice (普通 / 专用)** | Chinese company | Domestic CN enterprise reimbursement                             |
| **US Invoice (PDF)**              | US company      | Overseas businesses / cross-border trade / FX-controlled markets |

<Tip>
  **Invoice tip**: Let support know your invoice needs **at the time of payment (or earlier)** — share the billing name / tax ID / email so we can issue everything in one go. Late requests may require cross-period processing.
</Tip>

## Recharge Promotions

Different channels and amounts stack with our **first-recharge bonus / tiered top-up promotions** for an effective discount of up to \~80%.

📖 See: [Recharge Promotions](/en/faq/recharge-promotions)

## FAQ

<AccordionGroup>
  <Accordion title="My Stripe payment / credit card was rejected — what now?">
    Stripe's risk controls are strict. Possible causes:

    * **Your top-up amount is below \$50** (Stripe is only selectable at \$50 or more per transaction)
    * **You used a CNY-denominated card** (Stripe doesn't accept CNY cards on this channel)
    * The card is **not real-name** or not in your / your company's / your school's name
    * **3D Secure verification failed**
    * The card or account is flagged by upstream risk control

    Switch to another channel (Alipay International / Wise / Mercury Bank) or use a compliant real-name foreign credit card. **Do not retry with someone else's card or test cards — repeated attempts will trigger account-level risk control.**
  </Accordion>

  <Accordion title="How long does a corporate wire take to clear?">
    Typically **same business day** for manual crediting (subject to bank clearing — some cross-border SWIFT wires can take T+1 to T+3). **Send proof to support proactively** after the transfer to speed up crediting.
  </Accordion>

  <Accordion title="Which network should I use for USDT?">
    **TRC20** (TRON) is recommended — low fees, fast arrival. **Solana** and other mainstream chains are also supported. **Always get the latest receiving address from support or the in-site recharge page** — never trust third-party sources.
  </Accordion>

  <Accordion title="Can you issue a Chinese VAT special invoice (专用发票)?">
    Yes. Our Chinese entity supports both **general VAT invoices (普通发票)** and **special VAT invoices (专用发票)**. Send support your **company name, tax ID, bank name + account, and registered address / phone** when paying.
  </Accordion>

  <Accordion title="Russian / Central Asia customers without credit card or Alipay?">
    Use the **corporate wire workflow**: sign a contract with our **Chinese legal entity**, wire funds in CNY / USD / RUB via SWIFT (or a local trading partner) to our corporate account, and once received we'll **manually credit your APIYI console balance** and issue a Chinese VAT invoice or US Invoice. Reach out to support for the full process.
  </Accordion>

  <Accordion title="Do you support other crypto? BTC / ETH?">
    By default we support **USDT** (TRC20 / Solana). For USDC, BTC, ETH, or other tokens, please reach out to support for a case-by-case review.
  </Accordion>

  <Accordion title="Minimum / maximum recharge amount?">
    **Minimum top-up:**

    * **Stripe**: **\$50** per transaction (changed on 2026/7/28 due to Stripe's fee and settlement structure; the channel is unavailable below that amount)
    * **All other payment methods**: **\$5** per transaction, unchanged

    **Maximum**: no universal hard limit across channels, but PayPal / Stripe have upstream per-transaction risk thresholds. For **large amounts (≥ ¥10,000 / \$1,500)** we recommend going through corporate wire or Mercury Bank — fewer fees and easier invoicing.
  </Accordion>
</AccordionGroup>

## Contact Support / Get Receiving Accounts

<CardGroup cols={2}>
  <Card title="Enterprise WeChat (Recommended)" icon="phone" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan or click to chat — **get receiving accounts for all manual recharge channels**.
  </Card>

  <Card title="Official Email" icon="mail" href="mailto:hi@apiyi.com">
    **[hi@apiyi.com](mailto:hi@apiyi.com)**

    For formal business comms, invoice requests, large corporate-wire contracts, and partnership inquiries.
  </Card>
</CardGroup>

<Warning>
  **Funds-safety reminder**: All corporate accounts, USDT addresses, and PayPal / Wise / Mercury Bank receiving accounts are **only obtained through official support channels**. Do not trust any third-party "support" or address — verify in-channel to avoid losing funds.
</Warning>

## Related Documents

<CardGroup cols={2}>
  <Card title="Recharge Promotions" icon="gift" href="/en/faq/recharge-promotions">
    First-recharge bonus, tiered rebates, education discount
  </Card>

  <Card title="Why is my balance not working?" icon="circle-question-mark" href="/en/faq/balance-insufficient">
    Balance troubleshooting and billing model notes
  </Card>

  <Card title="Referral Rebate 5% Policy" icon="users" href="/en/faq/referral-program">
    Continuous 5% credit rebate and reward transfer workflow
  </Card>

  <Card title="Refund Policy" icon="rotate-ccw" href="/en/faq/refund-policy">
    Balance refund rules and application workflow
  </Card>
</CardGroup>
