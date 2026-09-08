> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How to Set Up Balance Alerts?

> APIYI supports multiple balance alert methods including email, WeCom/DingTalk/Feishu group bots, and a custom balance reminder API.

## Quick Answer

APIYI supports **three balance alert methods**: email notifications (enabled by default), group bot push via WeCom / DingTalk / Feishu, and a custom balance reminder API. Visit the **Notification Settings** page in the dashboard to configure alert thresholds and channels.

<Card title="Go to Notification Settings" icon="settings" href="https://api.apiyi.com/account/notificationSettings">
  Dashboard path: **Account → Notification Settings**

  Configure alert thresholds and enable/disable each notification channel here.
</Card>

## Alert Methods Explained

<CardGroup cols={3}>
  <Card title="Email Notification" icon="mail">
    **Enabled by default**

    When your balance drops below the threshold, an alert email is automatically sent to your registered account email — no extra setup needed.
  </Card>

  <Card title="Group Bots" icon="bot">
    Supports **WeCom / DingTalk / Feishu** webhook bots to push alerts directly to your team chat in real time.
  </Card>

  <Card title="Balance Reminder API" icon="code">
    Supports a custom **Balance Reminder API** for integration with your own monitoring systems or alerting platforms.
  </Card>
</CardGroup>

## Configuration Steps

<Steps>
  <Step title="Log in to APIYI Dashboard">
    Go to [api.apiyi.com](https://api.apiyi.com) and log in to your account.
  </Step>

  <Step title="Open Notification Settings">
    In the left menu, go to **Account → Notification Settings**, or open the [Notification Settings page](https://api.apiyi.com/account/notificationSettings) directly.
  </Step>

  <Step title="Set the Alert Threshold">
    Configure the balance level that triggers an alert (e.g., alert when balance is less than \$10). We recommend setting a threshold that covers 3-7 days of typical usage.
  </Step>

  <Step title="Enable Notification Channels">
    Enable email, group bot webhook, or balance reminder API as needed, and fill in the corresponding notification address / webhook URL.
  </Step>

  <Step title="Test the Alert">
    Once configured, verify the alert works by using the test button or temporarily lowering the threshold.
  </Step>
</Steps>

## Channel Recommendations

<Tip>
  **For teams, enable multiple channels at the same time**

  * **Individual developers**: email is usually enough
  * **Small teams**: email + WeCom / DingTalk / Feishu group bot
  * **Enterprise users**: email + group bot + balance reminder API (integrated with internal monitoring)
</Tip>

## Common Questions

<AccordionGroup>
  <Accordion title="Why didn't I receive the alert email?">
    Please check:

    1. Your registered email address is correct and can receive mail
    2. The alert email was not flagged as spam (check your spam folder)
    3. **Email notification** is enabled in Notification Settings
    4. Your balance is actually below the configured threshold
  </Accordion>

  <Accordion title="How do I get a group bot webhook URL?">
    * **WeCom**: Group chat → Group Bots → Add Bot → Copy Webhook URL
    * **DingTalk**: Group Settings → Smart Group Assistant → Add Bot → Custom Bot → Copy Webhook
    * **Feishu**: Group Settings → Group Bots → Add Bot → Custom Bot → Copy Webhook URL

    Paste the webhook URL into the corresponding field in Notification Settings.
  </Accordion>

  <Accordion title="How does the Balance Reminder API work?">
    The Balance Reminder API lets you configure a custom HTTP callback URL. When the balance drops below the threshold, the system sends a POST request to that URL, allowing you to integrate with your own monitoring platforms (Grafana, Prometheus, internal alerting systems, etc.).

    For integration details, please refer to the API documentation in the docs center, or contact support for guidance.
  </Accordion>

  <Accordion title="How often will alerts be resent after triggering?">
    The system has built-in anti-spam throttling to avoid repeated alerts in a short period. Once you receive an alert, we recommend topping up promptly to prevent service interruption.
  </Accordion>

  <Accordion title="Can I set multiple alert thresholds?">
    Currently the Notification Settings page supports a single threshold. For multi-level alerting strategies, we recommend implementing them in your own system via the Balance Reminder API.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Balance Seems Enough But Calls Fail" icon="credit-card" href="/en/faq/balance-insufficient">
    Learn about the pre-deduction mechanism
  </Card>

  <Card title="Payment Methods" icon="dollar-sign" href="/en/faq/payment-methods">
    Available top-up channels and guides
  </Card>

  <Card title="Recharge Promotions" icon="gift" href="/en/faq/recharge-promotions">
    Latest top-up bonus campaigns to save cost
  </Card>

  <Card title="Call Logs" icon="file-text" href="/en/faq/call-logs">
    Review consumption details and usage trends
  </Card>
</CardGroup>

<Info>
  **Friendly reminder**

  Balance alerts are only a safeguard. We still recommend periodically checking your account balance and consumption, especially during peak traffic or when onboarding new models, to avoid service disruption caused by insufficient balance.
</Info>
