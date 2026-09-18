> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Do I Delete My Account?

> Delete your APIYI account from the Profile page. All user data, usage logs, and recharge records will be permanently lost — please proceed with caution.

## Quick Answer

Log in to the APIYI console, go to the **Profile** page at `api.apiyi.com/account/profile`, and click the **Delete Account** button at the bottom of the page under "Account Options". A confirmation prompt will appear to finalize the action.

<Warning>
  **Account deletion is irreversible**: Once deleted, all **user data, usage logs, recharge records, and account balance** will be permanently lost and cannot be recovered. Accidental deletion is the user's responsibility — the platform is not liable for data recovery. Please confirm carefully before proceeding.
</Warning>

## Where to Find It

The deletion button is located at the bottom of the **Profile** page, in the **Account Options** section — next to "Change Password", "System Tokens", and "Access Tokens":

<img src="https://mintcdn.com/apiyillc/Az0T-cmcmXqc4ycr/images/account-deletion-button.png?fit=max&auto=format&n=Az0T-cmcmXqc4ycr&q=85&s=36f570e399cf0f60267c39c9a70f3a25" alt="Location of the account deletion button" width="1140" height="258" data-path="images/account-deletion-button.png" />

## Steps

<Steps>
  <Step title="Go to Profile">
    After logging in to the APIYI console, visit your Profile page:

    ```
    https://api.apiyi.com/account/profile
    ```
  </Step>

  <Step title="Find the 'Account Options' Section">
    Scroll to the **bottom** of the page and locate the "Account Options" section.
  </Step>

  <Step title="Click 'Delete Account'">
    Click the red **Delete Account** button (with the trash icon).
  </Step>

  <Step title="Confirm in the Dialog">
    A confirmation dialog will appear. Read it carefully before confirming. **Once confirmed, the action takes effect immediately and cannot be undone.**
  </Step>
</Steps>

## Before You Delete

<CardGroup cols={2}>
  <Card title="Account Balance" icon="wallet" color="#ef4444">
    Any remaining balance will be wiped and is **non-refundable** after deletion. Consider spending it or requesting a refund first.
  </Card>

  <Card title="Usage Logs" icon="file-text" color="#ef4444">
    All historical call records will be deleted and cannot be used for later reconciliation or auditing.
  </Card>

  <Card title="Recharge Records" icon="receipt" color="#ef4444">
    Invoices and order history will be lost along with the account. Export or request invoices in advance.
  </Card>

  <Card title="API Keys" icon="key" color="#ef4444">
    All system and access tokens will be invalidated immediately. Any live workloads using them will fail right away.
  </Card>
</CardGroup>

<Tip>
  **Recommendation**: Before deletion, check for unbilled recharge orders, unexported usage logs, and any production services still calling the API.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Can I re-register with the same email after deletion?">
    In most cases the email will be released and available for re-registration. However, the **new account has no connection to the old one**: balance, logs, recharge records, and promotional eligibility will not carry over. For special cases, please contact customer service on WeChat.
  </Accordion>

  <Accordion title="My account still has a balance — can I get a refund after deletion?">
    If you need a refund, please apply for one based on the [Refund Policy](/en/faq/refund-policy) **before** deleting the account. **Once deleted, the balance cannot be recovered and refund requests will no longer be accepted.**
  </Accordion>

  <Accordion title="I clicked 'Delete Account' by mistake. Can I undo it?">
    There is a confirmation dialog, so simply clicking the "Delete Account" button **does not delete immediately**. However, once you confirm in the dialog, the action is **immediate and irreversible**. Read the dialog carefully before confirming.
  </Accordion>

  <Accordion title="I just don't want to use it for now — is there an alternative to deletion?">
    If you only plan to **pause usage temporarily**, deletion is not necessary:

    * You can **disable or delete API Keys** in the "System Tokens" section to prevent accidental use
    * Your balance will remain in the account and be available next time you log in
    * This preserves your history and records, and saves you from re-registering later
  </Accordion>

  <Accordion title="I forgot my password and can't log in. How do I delete my account?">
    First recover your account using the steps in [Forgot Password?](/en/faq/forgot-password), then proceed with deletion. If you cannot recover access, please contact customer service on WeChat for assistance.
  </Accordion>
</AccordionGroup>

## Related Documents

<CardGroup cols={2}>
  <Card title="Refund Policy" icon="rotate-ccw" href="/en/faq/refund-policy">
    Review the refund rules before deletion
  </Card>

  <Card title="Forgot Password?" icon="key" href="/en/faq/forgot-password">
    Password recovery and reset
  </Card>

  <Card title="Data Security" icon="shield" href="/en/faq/data-security">
    Learn about APIYI's data security and privacy policies
  </Card>

  <Card title="Call Logs" icon="file-text" href="/en/faq/call-logs">
    Export your usage history before deletion
  </Card>
</CardGroup>
