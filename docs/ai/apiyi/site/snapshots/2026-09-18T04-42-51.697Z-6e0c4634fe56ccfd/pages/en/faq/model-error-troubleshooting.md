> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Can I Troubleshoot Model API Errors?

> Diagnose parameter, authentication, 429, 5xx, timeout, resource, and group errors.

## Short answer

Do not diagnose a request from the HTTP status code alone. Save the full error, model name, Base URL, token group, and request ID first, then determine whether the problem is a **request configuration error** or a **temporary upstream failure**:

* `400`, `401`, `403`, unsupported parameters, safety blocks, and group mismatches usually require a request or configuration change. Repeating the same request will not fix them.
* `429`, `503`, some `504` responses, and `Upstream model timed out` can be caused by upstream load, resource availability, or long-running requests. Check the logs, then use limited exponential-backoff retries.
* If only one model or group fails, test an authorized fallback group. If several models fail at once, check your API key, Base URL, and network path first.

## Save the complete error

Screenshots often omit the most useful fields. Keep the following information before troubleshooting:

| Information            | Example                        | Why it matters                          |
| ---------------------- | ------------------------------ | --------------------------------------- |
| HTTP status            | `400`, `401`, `429`, `503`     | Identifies the error class              |
| Error message and code | `Unsupported parameter: stop`  | Identifies deterministic request errors |
| Model and group        | `gpt-5.6-luna`, `Default`      | Defines the affected route              |
| Base URL               | `https://api.apiyi.com/v1`     | Helps verify endpoint and node settings |
| Request ID             | ID returned in the response    | Helps support locate the request        |
| Timestamp              | Include the time zone          | Helps match upstream and log records    |
| Log record             | Whether a charge record exists | Shows whether generation started        |

<Warning>
  Never expose a complete API key in a ticket, screenshot, or code sample. Keep only the error message, request ID, and redacted configuration.
</Warning>

## Troubleshoot by error type

| Error                                         | Common cause                                                                                           | First action                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `400` or `Unsupported parameter`              | The model does not support a request field, such as `stop` on some lightweight models                  | Remove the unsupported field and test a minimal request; do not retry unchanged                             |
| `401 Invalid token` or `403`                  | API key, Base URL, token state, or group permission mismatch                                           | Verify the API key and Base URL, then check the token group and model permission                            |
| `429`                                         | Excessive concurrency or upstream saturation; the message may also hide a request-compatibility issue  | Read the full error, reduce concurrency, and use exponential backoff; check quota and groups if it persists |
| `503` or `Service unavailable`                | Temporary unavailability, insufficient upstream resources, or no available channel in the group        | Wait briefly and retry a limited number of times; use an authorized fallback group when needed              |
| `504` or `Upstream model timed out`           | Long upstream processing, upstream instability, or a timeout somewhere in the request path             | Check logs and client timeout; make sure you are not using a CDN node for a long request                    |
| `RESOURCE_EXHAUSTED`                          | Temporary shortage of upstream compute or concurrency resources                                        | Reduce concurrency, wait for recovery, or use another available group/model                                 |
| `rejected by the safety system` or `NO_IMAGE` | The request triggered an upstream content-safety policy                                                | Change the prompt or input; do not submit the same request unchanged                                        |
| Model unavailable or group mismatch           | The token does not include the required group, a model whitelist blocks it, or the model name is wrong | Check the token's primary group, fallback group, and allowed models                                         |

<Info>
  The same status code can have different causes. For example, `429` may mean upstream saturation, but it can also be a request-compatibility problem whose details appear only in the full error message. Use the response body and call logs as the final evidence.
</Info>

## Standard troubleshooting steps

<Steps>
  <Step title="Step 1: Reproduce with a minimal request">
    Temporarily remove optional parameters, tool definitions, complex image inputs, and long prompts. Keep only the model, required messages, and authentication information. This separates request errors from route or model errors.
  </Step>

  <Step title="Step 2: Verify the endpoint, token, and group">
    Make sure the API key is used with the `api.apiyi.com` Base URL. In the console, check the token's primary group, fallback group, and allowed models. Some models require a dedicated group.
  </Step>

  <Step title="Step 3: Decide whether a retry is appropriate">
    Use backoff retries for `429`, `503`, and confirmed temporary upstream failures. For parameter errors, safety blocks, invalid model names, and group mismatches, change the request or configuration instead of retrying unchanged.
  </Step>

  <Step title="Step 4: Check timeout and network path">
    Image generation, reasoning models, and long text requests need larger timeouts. Use `api.apiyi.com` or `vip.apiyi.com` for long requests instead of the `api-cf.apiyi.com` CDN node, which has an approximately 100-second limit.
  </Step>

  <Step title="Step 5: Check call logs before resending">
    Check whether the request created a charge record. A client timeout or disconnect does not always mean that server-side processing stopped; avoid blindly sending the request again before confirming its status.
  </Step>
</Steps>

## Minimal test request

Use the following request to verify the endpoint, token, and basic model call. Replace `YOUR_MODEL` with a model available to your token, and do not add optional fields until the minimal call works.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [
      {"role": "user", "content": "Reply with: test successful"}
    ]
  }'
```

## Prevent recurring errors

* Start with a minimal request, then add `stop`, tools, reasoning controls, images, and other optional fields one at a time.
* Maintain a parameter-compatibility table for your models instead of assuming that every model supports the same fields.
* Do not immediately resend many concurrent requests after a `429`; use exponential backoff and control concurrency per model.
* Give image and reasoning requests enough timeout. Avoid stacking SDK retries with your own business-layer retries.
* Configure a fallback group that has been tested with your actual production parameters.

## Frequently asked questions

<AccordionGroup>
  <Accordion title="Does 429 always mean that concurrency is too high?">
    No. `429` can come from concurrency or upstream saturation, but the error message may also hide a parameter-compatibility issue. Read the complete `error.message` before deciding whether to lower concurrency or change the request.
  </Accordion>

  <Accordion title="Should I always create a new token after a 401?">
    No. First confirm that the request uses APIYI's Base URL, then check whether the token has expired and whether the correct group is selected. If only one model returns `Invalid token` alongside 5xx or timeout errors, the upstream route may also be the cause.
  </Accordion>

  <Accordion title="Can I retry immediately after a timeout?">
    Check the call logs first. A client timeout only means that the client stopped waiting; server-side processing may still continue. If the request has a charge record, an immediate retry can create a duplicate call.
  </Accordion>

  <Accordion title="Are failed requests charged?">
    Do not rely on the error page alone. Parameter validation, authentication, and safety blocks that never reach model generation usually do not create a final charge, but a client disconnect or a request that has already started upstream processing may still be charged. Use the call logs as the source of truth.
  </Accordion>
</AccordionGroup>

## Still stuck? Contact support

If the issue persists after the steps above, contact APIYI support through WeCom or email. Include the following information to speed up troubleshooting:

* Model name, token group, and Base URL
* Full error message, HTTP status, and request ID
* Time of occurrence, including the `UTC+8` time zone
* A minimized request example or a redacted request body
* Whether the call logs contain a charge record

<Warning>
  Never send a complete API key. Keep only the prefix and last few characters visible, and redact the rest.
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code, or click this card to contact support directly.

    Model errors, timeouts, groups, and billing issues
  </Card>

  <Card title="Email Support" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    We recommend including “model error” and the model name in the subject.
  </Card>
</CardGroup>

## Related documentation

<CardGroup cols={2}>
  <Card title="Why is my API key invalid?" icon="key" href="/en/faq/invalid-api-key">
    Check the Base URL, API key, and authentication settings
  </Card>

  <Card title="What are groups?" icon="layers" href="/en/faq/groups-explained">
    Learn about token groups, upstream routes, and fallback groups
  </Card>

  <Card title="How can I avoid request timeouts?" icon="timer" href="/en/faq/timeout-configuration">
    Configure timeouts, nodes, and long-request troubleshooting
  </Card>

  <Card title="How much concurrency can I use?" icon="gauge" href="/en/faq/api-concurrency">
    Review model concurrency limits and 429 guidance
  </Card>

  <Card title="What should I do when the site or API returns 502?" icon="server-crash" href="/en/faq/website-502-error">
    Understand 5xx errors, retries, and billing checks
  </Card>

  <Card title="How do I read billing amounts in the logs?" icon="file-text" href="/en/faq/log-billing-explained">
    Use call logs to confirm whether a request was charged
  </Card>
</CardGroup>
