> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GitHub Login Shows 'Account Already Bound'?

> Fix the 'This GitHub account is already bound' error when logging into APIYI with GitHub

## Quick Answer

You need to log in to `github.com` in the **same browser** first, then use the GitHub one-click login on the APIYI website. **Make sure to use Chrome browser**.

## Symptom

When trying to log in to APIYI with your GitHub account, you see the error message:

> This GitHub account is already bound

This prevents you from logging in normally.

## Solution Steps

<Steps>
  <Step title="Open Chrome Browser">
    Make sure to use **Chrome browser** for this process. Avoid using other browsers (such as Safari, Firefox, etc.) to ensure the login flow works correctly.
  </Step>

  <Step title="Log in to GitHub">
    Open `github.com` in Chrome and confirm you are logged into the correct GitHub account.

    If you were previously logged into a different GitHub account, log out first, then log in with the account bound to APIYI.
  </Step>

  <Step title="Log in to APIYI">
    In the **same Chrome browser**, open the APIYI website and click the "GitHub One-Click Login" button to complete the login.

    <Warning>
      You must complete both steps in the same browser. Do not use different browsers for each step.
    </Warning>
  </Step>
</Steps>

## FAQ

<AccordionGroup>
  <Accordion title="Why must I use Chrome browser?">
    Chrome has the best compatibility with the GitHub OAuth login flow. Other browsers may have Cookie or session synchronization issues that cause login failures.
  </Accordion>

  <Accordion title="I'm using Chrome but it still doesn't work. What should I do?">
    Try the following:

    * Clear Chrome's cache and cookies
    * Make sure Chrome is not in incognito mode
    * Check if any browser extensions are blocking third-party cookies
    * Log out of GitHub, log back in, and try the APIYI one-click login again
  </Accordion>

  <Accordion title="How do I change the bound GitHub account?">
    If you need to change the bound GitHub account, please contact customer support for assistance.
  </Accordion>
</AccordionGroup>

## Contact Us

<Card title="Contact Support" icon="message-circle">
  If the issue persists after following the steps above, please contact our support team for help.
</Card>
