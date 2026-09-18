> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How do I investigate unexpected API Key usage?

> A clear playbook when your API Key shows unexplained usage: trace where the key went, disable it promptly, harden the account, and pin down the real caller via the true IP in the logs.

## Short Answer

When a token (API Key) shows unexplained usage, three steps are the safest path:

1. **Trace it first**: copy the KEY and search across chat history, code repos, and config files to confirm who received it and where it's used.
2. **Disable it if untraceable**: if you genuinely can't find the user, just **disable that token** — the impact is usually minimal.
3. **Harden the account**: change the account password and tighten console permissions; non-essential people shouldn't log into the console.

Below is the detailed playbook, plus how to pin down the real caller using the **true request IP** in the logs.

## Investigation Steps

<Steps>
  <Step title="Step 1: Trace where the KEY went">
    Copy the token's KEY and run a global search across the following to confirm who it was given to and where it was configured:

    * **Chat history** with colleagues / contractors / clients (WeChat, Lark, email, etc.)
    * **Code repositories** and commit history (including deleted branches, `.env`, config files)
    * **Environment variables / secrets** stored in deployment platforms, CI/CD, and third-party tools

    Most "mystery usage" turns out to be an old config left running somewhere — one search for the KEY usually identifies it.
  </Step>

  <Step title="Step 2: If untraceable, just disable that token">
    If you still don't know who's using it after Step 1, **disabling that token** is the fastest way to stop the bleeding.

    Tokens are independent of one another — disabling one **does not affect the other tokens** under your account, so the impact is usually minimal. Once you've confirmed no one is using it legitimately, disable it, and create a replacement token if needed.
  </Step>

  <Step title="Step 3: Harden the account and permissions">
    While stopping the loss, tighten account security:

    * **Change the account password** to a strong one
    * **Tighten console permissions** — non-essential people should not log into the console
    * Let staff check KEY usage only through the **Query section**, with no need to enter the console
  </Step>
</Steps>

## How to Pin Down the Real Caller via Logs

In the console's **Logs** section, you can see the **token, model, and IP** for each call. Hover over the IP of a log entry to reveal the IP details for that call:

```text theme={null}
📍 Main IP:
   IP: 104.194.93.159          ← APIYI's traffic-distribution IP (not the caller)

🔁 Proxy IP:
   X-Forwarded-For: 18.163.84.xx
   X-Real-IP:       18.163.84.xx   ← your true request IP (the actual user)
```

<Info>
  **How to read the two IPs?**

  * **Main IP**: APIYI's **traffic-distribution IP** — the same for all customers, and does not indicate the call's origin.
  * **`X-Real-IP` (and `X-Forwarded-For`) under Proxy IP**: this is the **IP that actually made the call**, i.e. the real user's IP.

  When investigating, rely on `X-Real-IP`: match it to a machine / network to identify who is calling.
</Info>

<Tip>
  **Cross-reference the token for speed**: the log also shows the **token** and **model** used. Filter logs by the suspicious token first, then see which addresses its `X-Real-IP` clusters around — that usually points straight to a specific person or service.
</Tip>

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Will disabling a token affect my other workloads?">
    No. Each token is independent; disabling one does not affect the other tokens or normal workloads under your account. As long as the token has no legitimate use, you can disable it safely and create a replacement if needed.
  </Accordion>

  <Accordion title="The Main IP in the logs is fixed — am I being attacked?">
    No. The **Main IP** (e.g. `104.194.93.159`) is APIYI's traffic-distribution IP, identical for all calls — this is normal. To judge the call's origin, look at `X-Real-IP` under Proxy IP.
  </Accordion>

  <Accordion title="Do staff need to log into the console to check KEY usage?">
    No. We recommend giving staff only the **Query section** for self-service usage checks, and reserving console admin access for essential people — this reduces the risk of account and key abuse at the source.
  </Accordion>

  <Accordion title="How do I prevent KEY abuse in the first place?">
    A few habits: don't hardcode the KEY in code — use environment variables; split tokens by purpose so they can be disabled individually; rotate KEYs periodically; and reclaim the relevant token when someone leaves or a project ends.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Token Management" icon="key" href="/en/faq/token-management">
    Full guide to creating, disabling, and assigning tokens
  </Card>

  <Card title="Call Logs" icon="file-text" href="/en/faq/call-logs">
    How to view the token, model, and IP for each call
  </Card>

  <Card title="Logs & Privacy Control" icon="eye-off" href="/en/faq/user-logs-control">
    Logging scope and privacy settings
  </Card>

  <Card title="Data Security" icon="shield" href="/en/faq/data-security">
    APIYI's data security and access-control mechanisms
  </Card>
</CardGroup>

## Contact Us

If you still have questions after investigating, reach out to our technical support:

<Card title="Technical Support" icon="headphones">
  * [Contact WeChat Work support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * Email: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
