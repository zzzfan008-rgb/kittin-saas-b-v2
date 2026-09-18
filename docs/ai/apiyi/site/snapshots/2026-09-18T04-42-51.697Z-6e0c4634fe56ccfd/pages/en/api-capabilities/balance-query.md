> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Balance Query API

> Retrieve account balance, usage quota, and request count to enable proactive balance monitoring and alerts

## API Overview

The Balance Query API retrieves your account's current quota usage, including total quota, used quota, remaining balance, and request count.

This API helps you easily monitor your account balance, enabling proactive and flexible balance alert management.

## How to Get Authorization Token

<Steps>
  <Step title="Access Console">
    Visit `api.apiyi.com/account/profile` to access your profile page
  </Step>

  <Step title="Find System Token">
    Locate the "Account Options - System Token" section at the bottom of the page
  </Step>

  <Step title="Generate AccessToken">
    Enter your account password to receive an AccessToken that can be used for subsequent API queries
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="Get System Token" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

## API Information

| Item                | Description                           |
| ------------------- | ------------------------------------- |
| **API URL**         | `https://api.apiyi.com/api/user/self` |
| **Method**          | `GET`                                 |
| **Authentication**  | Authorization Header                  |
| **Response Format** | JSON                                  |

## Request Details

### Request Headers

| Header Name     | Required | Description                                   |
| --------------- | -------- | --------------------------------------------- |
| `Authorization` | Yes      | API access token, format: direct token string |
| `Accept`        | No       | Recommended: `application/json`               |
| `Content-Type`  | No       | Recommended: `application/json`               |

### Request Parameters

<Info>
  This is a GET request and **does not require** any request body parameters.
</Info>

## Response Details

### Success Response Example

```json theme={null}
{
  "success": true,
  "message": null,
  "data": {
    "id": 19489,
    "username": "testnano",
    "display_name": "testnano",
    "role": 1,
    "status": 1,
    "email": "",
    "quota": 24997909,
    "used_quota": 10027091,
    "request_count": 339,
    "group": "ceshi",
    "aff_code": "ZM0H",
    "inviter_id": 0,
    "access_token": "...",
    "ModelFixedPrice": [...]
  }
}
```

### Key Response Fields

| Field Name             | Type    | Description                                                     |
| ---------------------- | ------- | --------------------------------------------------------------- |
| `success`              | Boolean | Whether the request was successful                              |
| `message`              | String  | Error message (null on success)                                 |
| `data.username`        | String  | Username                                                        |
| `data.display_name`    | String  | Display name                                                    |
| `data.quota`           | Integer | **Remaining quota** (current available balance, in quota units) |
| `data.used_quota`      | Integer | **Used quota** (in quota units)                                 |
| `data.request_count`   | Integer | **Total request count**                                         |
| `data.group`           | String  | User group                                                      |
| `data.ModelFixedPrice` | Array   | Model pricing list (can be ignored)                             |

### Quota Conversion

<Card title="Conversion Rule" icon="calculator">
  500,000 quota = \$1.00 USD
</Card>

**Calculation Formulas:**

* USD amount = quota ÷ 500,000
* Remaining quota = quota (quota represents current remaining balance)
* Remaining USD = quota ÷ 500,000

**Examples:**

* `quota: 24997909` → \$49.99 USD (current remaining balance)
* `used_quota: 10027091` → \$20.05 USD (used amount)

## Error Responses

### HTTP 401 - Authentication Failed

```json theme={null}
{
  "success": false,
  "message": "Unauthorized"
}
```

**Reason:** Authorization token is invalid or expired

**Solution:** Verify and update your API token

### HTTP 403 - Permission Denied

```json theme={null}
{
  "success": false,
  "message": "Forbidden"
}
```

**Reason:** Current token lacks permission to access this API

**Solution:** Contact administrator to verify permission settings

## Code Examples

### cURL Example

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **Important:** The `--compressed` option is required because the API returns gzip-compressed content, otherwise you'll receive garbled output.
</Warning>

**Quick Test (replace YOUR\_TOKEN\_HERE):**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  Note: The `-s` option hides progress bar, `--compressed` automatically decompresses gzip response
</Info>

### Python Example (Basic)

```python theme={null}
import requests

# Configuration
url = "https://api.apiyi.com/api/user/self"
authorization = "YOUR_TOKEN_HERE"  # Replace with your token

# Request headers
headers = {
    'Accept': 'application/json',
    'Authorization': authorization,
    'Content-Type': 'application/json'
}

# Send request
response = requests.get(url, headers=headers, timeout=10)

# Check response
if response.status_code == 200:
    data = response.json()
    user_data = data['data']

    # Extract key information
    quota = user_data['quota']
    used_quota = user_data['used_quota']
    request_count = user_data['request_count']

    # Calculate USD amounts (note: quota represents current remaining balance)
    remaining_usd = quota / 500000
    used_usd = used_quota / 500000

    # Print results
    print(f"Remaining quota: ${remaining_usd:.2f} USD ({quota:,} quota)")
    print(f"Used: ${used_usd:.2f} USD ({used_quota:,} quota)")
    print(f"Request count: {request_count:,} times")
else:
    print(f"Request failed: HTTP {response.status_code}")
    print(response.text)
```

### Python Example (Optimized)

This adds the following on top of the basic example:

<CardGroup cols={2}>
  <Card title="Error Handling" icon="shield-check">
    Complete exception handling and error capture
  </Card>

  <Card title="Environment Variables" icon="lock">
    Secure token management, avoid hardcoding
  </Card>

  <Card title="Formatted Output" icon="table">
    Beautiful table display and number formatting
  </Card>

  <Card title="Auto Conversion" icon="calculator">
    Automatic USD amount calculation
  </Card>
</CardGroup>

Save the code below as `quota.py` and it is ready to run:

```python theme={null}
import os
import sys

import requests

URL = "https://api.apiyi.com/api/user/self"
QUOTA_PER_USD = 500_000


def fetch_quota(token):
    """Query the account balance and return the data field."""
    headers = {
        "Accept": "application/json",
        "Authorization": token,
        "Content-Type": "application/json",
    }
    try:
        resp = requests.get(URL, headers=headers, timeout=10)
    except requests.exceptions.Timeout:
        sys.exit("Request timed out, please check your network and retry")
    except requests.exceptions.RequestException as exc:
        sys.exit(f"Request failed: {exc}")

    if resp.status_code == 401:
        sys.exit("Authentication failed: token invalid or expired, regenerate it in the console")
    if resp.status_code != 200:
        sys.exit(f"Request failed: HTTP {resp.status_code}\n{resp.text[:200]}")

    body = resp.json()
    if not body.get("success"):
        sys.exit(f"API error: {body.get('message')}")
    return body["data"]


def report(data):
    quota = data.get("quota", 0)
    used = data.get("used_quota", 0)
    count = data.get("request_count", 0)

    print("=" * 60)
    print("📊 APIYI Account Balance")
    print("=" * 60)
    print(f"Username: {data.get('username')} ({data.get('display_name')})")
    print("-" * 60)
    print(f"Remaining: {quota:,} quota (${quota / QUOTA_PER_USD:.2f} USD)")
    print(f"Used:      {used:,} quota (${used / QUOTA_PER_USD:.2f} USD)")
    print(f"Requests:  {count:,}")
    print("=" * 60)
    print(f"💡 Conversion: {QUOTA_PER_USD:,} quota = $1.00 USD")
    print("=" * 60)


if __name__ == "__main__":
    # Prefer the command-line argument, fall back to the environment variable,
    # so the token never has to be hardcoded
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("APIYI_TOKEN")
    if not token:
        sys.exit("Provide a token: set APIYI_TOKEN, or pass it as the first argument")
    report(fetch_quota(token))
```

**Usage:**

```bash theme={null}
# Method 1: Using environment variable (recommended)
export APIYI_TOKEN='YOUR_TOKEN_HERE'
python quota.py

# Method 2: Command line argument
python quota.py 'YOUR_TOKEN_HERE'
```

**Output Example:**

```
============================================================
📊 APIYI Account Balance Information
============================================================
Username: testnano (testnano)
------------------------------------------------------------
Remaining quota: 24,997,909 quota ($49.99 USD)
Used:           10,027,091 quota ($20.05 USD)
Request count: 339 times
============================================================
💡 Conversion: 500,000 quota = $1.00 USD
============================================================
```

## FAQ

<AccordionGroup>
  <Accordion title="How do I get an Authorization token?">
    Please refer to the "How to Get Authorization Token" section above, or visit the profile page in the console to obtain a system token.
  </Accordion>

  <Accordion title="Does querying balance consume quota?">
    No, the balance query API does not consume your quota.
  </Accordion>

  <Accordion title="How often can I query the balance?">
    We recommend a query interval of at least 1 second to avoid triggering rate limits.
  </Accordion>

  <Accordion title="What is the ModelFixedPrice field for?">
    This field returns pricing information for various AI models. You can ignore it if you only need balance information.
  </Accordion>

  <Accordion title="What does the quota field represent?">
    The `quota` field represents the current remaining balance. If `quota` is 0 or close to 0, your account balance is insufficient and needs recharging.
  </Accordion>

  <Accordion title="Why does curl return garbled text or jq report errors?">
    **Issue:** Executing curl returns garbled text, or jq reports "Invalid numeric literal"

    **Reason:** The API returns gzip-compressed content (`Content-Encoding: gzip`), and curl doesn't automatically decompress it.

    **Solution:** Add the `--compressed` option to make curl decompress automatically:

    ```bash theme={null}
    # ✅ Correct (with --compressed)
    curl --compressed 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq

    # ❌ Wrong (missing --compressed)
    curl 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq
    ```
  </Accordion>
</AccordionGroup>

## Important Notes

<Warning>
  **Security Reminders**

  * Never hardcode Authorization tokens in your code
  * Use environment variables or configuration files to manage sensitive information
  * Don't commit code containing tokens to public repositories
</Warning>

<Info>
  **Request Limits**

  * Set reasonable request timeout (recommended: 10 seconds)
  * Avoid excessively frequent query requests
</Info>

<Card title="Exception Handling Recommendations" icon="bug">
  * Always handle network exceptions, timeouts, and authentication failures
  * Log errors for easier troubleshooting
</Card>

<Card title="Response Format Notes" icon="file-code">
  * API returns gzip-compressed content; curl requires the `--compressed` option
  * Python's requests library automatically handles gzip decompression without additional configuration
</Card>
