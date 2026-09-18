> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Where Can I Find the Request ID?

> Find the Request ID in response headers or bodies by API type, and distinguish request IDs from asynchronous task IDs.

## Short answer

When troubleshooting an API call, record the **model name, endpoint, and call time** first. Then check the HTTP response headers for `x-request-id` or `request-id`. If the endpoint returns an error response, also inspect the JSON body for identifiers such as `request_id`, and use the field that can be found in the APIYI logs.

Wan and HappyHorse video endpoints also return `request_id` in the response body. The `task_id` in the same response is used to query the video task and is not the same as the Request ID. The `id` or `task_id` returned by asynchronous endpoints such as Seedance and Veo is also a video task ID.

<Info>
  The APIYI log page can search the identifiers shown in the “Request ID / Upstream Request ID / Completion ID” filter. Open the log details in the console and search using the identifier provided by the user.
</Info>

## Start with these three steps

<Steps>
  <Step title="Step 1: Confirm the model and endpoint">
    Record the full model name and the actual URL. Text models usually use `/v1/chat/completions`, embedding models use `/v1/embeddings`, image models may use `/v1/images/generations`, and video models may use `/v1/videos` or a model-specific asynchronous endpoint.
  </Step>

  <Step title="Step 2: Record the call time">
    Record when the request was sent and include the timezone, for example 2026-08-25 14:32 (UTC+8). If the request was retried, record the approximate time of each retry.
  </Step>

  <Step title="Step 3: Save the response and log details">
    Save the HTTP status code, complete response headers, complete response body, and the client exception. Then open the APIYI “Logs” page and search by Request ID, Upstream Request ID, or Completion ID.
  </Step>
</Steps>

## Where to find the Request ID by API type

| API type                              | Where to look first                                                                                     | Fields not to confuse                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Text / chat models                    | Usually check the HTTP response headers: `x-request-id` or `request-id`; inspect error bodies as well   | The `id` in the body may be a Completion ID, not the APIYI Request ID                                                                                                          |
| Image models                          | Usually check the HTTP response headers: `x-request-id` or `request-id`; inspect error bodies as well   | Do not identify an image response object ID as the APIYI Request ID based on its name alone                                                                                    |
| Embedding models                      | Check the actual response headers first; inspect error bodies as well                                   | Current embedding examples mainly show `data[].embedding`; the docs do not define one universal Request ID field location                                                      |
| Wan / HappyHorse video                | `request_id` in the response body, plus the response headers                                            | `output.task_id` is the video task ID used for polling                                                                                                                         |
| Seedance video                        | **`X-Shellapi-Request-Id`** in the response headers; save the top-level body `id` separately            | The top-level `id` is the video task ID, not the Request ID; the `X-Request-Id` header is the provider-side request ID and cannot be found in APIYI logs (verified 2026-09-15) |
| Veo and other asynchronous video APIs | If the endpoint returns a Request ID, record the response-header value first; also save the task fields | The body `id` / `task_id` is the video task ID                                                                                                                                 |

<Warning>
  HTTP header names are case-insensitive, but the separators in the field names matter: `x-request-id`, `request-id`, and `request_id` are different spellings. Check both the response headers and error bodies instead of searching for only one field name.
</Warning>

## Read it in code

### Python

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "YOUR_MODEL",
        "messages": [{"role": "user", "content": "Test request"}],
    },
    timeout=60,
)

header_request_id = (
    response.headers.get("x-request-id")
    or response.headers.get("request-id")
)

try:
    body = response.json()
except ValueError:
    body = {}

# Use body.request_id only as a candidate; do not treat body.id as the APIYI Request ID automatically.
request_id = header_request_id or body.get("request_id")

print("status:", response.status_code)
print("request_id:", request_id)
print("body:", response.text)
```

### cURL

Use `-i` to print both response headers and the response body. Look for `x-request-id` or `request-id` in the headers:

```bash theme={null}
curl -i "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [{"role": "user", "content": "Test request"}]
  }'
```

For Wan or HappyHorse video calls, also save the two body fields:

```python theme={null}
body = response.json()
request_id = body.get("request_id")
task_id = body.get("output", {}).get("task_id")
```

## Search the console logs

<Steps>
  <Step title="Open the call logs">
    Sign in to the APIYI console, open “Logs”, and open the details of the call you want to investigate.
  </Step>

  <Step title="Enter an available identifier">
    Paste the identifier into the “Request ID / Upstream Request ID / Completion ID” filter. Prefer the Request ID from the APIYI response headers; if it is unavailable, try the Upstream Request ID or Completion ID.
  </Step>

  <Step title="Compare the details">
    Compare the model, call time, endpoint, channel, HTTP status, error code, and billing record to determine whether the request reached APIYI, reached the upstream provider, and should be retried after changing the request.
  </Step>
</Steps>

<Tip>
  If a user only knows the approximate failure time, you can still narrow the search by model, endpoint, and time. A Request ID usually identifies a single call much faster.
</Tip>

## Why might there be no Request ID?

If the request fails before an HTTP response is received—for example, because of DNS resolution, TCP/TLS connection setup, a local proxy rejection, or a client-side connection timeout—APIYI has no opportunity to return response headers. In that case, there is no Request ID available to the client.

Provide the following instead:

* The original client exception and complete stack trace;
* The request time and timezone;
* The model and endpoint;
* The HTTP client, proxy, or network environment;
* A Request ID from a successful or retried call, if available.

<Warning>
  Do not send a complete API key in troubleshooting material. Mask the middle of the key, and do not expose private data or a request body containing full business content or images.
</Warning>

## What to provide to support

* Request ID;
* Upstream Request ID or Completion ID, if shown in the logs;
* Model name and endpoint;
* Call time with timezone;
* HTTP status, complete response body, and client exception;
* A redacted request and the error code and billing status shown in the console logs.

## Related documentation

<CardGroup cols={2}>
  <Card title="How Do I Troubleshoot Model Errors?" icon="alert-triangle" href="/en/faq/model-error-troubleshooting">
    Troubleshoot parameters, groups, timeouts, and model errors
  </Card>

  <Card title="How Can I View My Call Logs?" icon="file-text" href="/en/faq/call-logs">
    View API calls, errors, and billing details in the console
  </Card>

  <Card title="Log Query API" icon="search" href="/en/api-capabilities/log-query">
    Query call logs by time, model, or request\_id
  </Card>

  <Card title="Image API Best Practices" icon="image" href="/en/api-capabilities/image-api-best-practices">
    Troubleshoot image timeouts, disconnects, billing, and request IDs
  </Card>
</CardGroup>
