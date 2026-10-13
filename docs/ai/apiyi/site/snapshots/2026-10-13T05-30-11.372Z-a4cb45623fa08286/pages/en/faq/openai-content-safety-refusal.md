> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What Does an OpenAI Model Refusal Look Like?

> When a GPT model declines a request that violates the provider's usage policy, it returns 200 with a short refusal, with no error and no category. See the response body and how to detect it.

## Short Answer

When a GPT model receives a request that violates the provider's usage policy, it **does not return an error**. The API responds with HTTP 200, `finish_reason` is `stop`, and the content is a refusal written by the model itself, such as "I can't help with that…".

The response has **no error code and no refusal category or severity**. It has exactly the same structure as a normal answer and is billed like one. Looking at the status code and `finish_reason` alone, you cannot tell that the request was refused.

## The Refusal Response Body

Below is a real non-streaming refusal from `/v1/chat/completions` (the content has been replaced with a neutral example):

```json theme={null}
{
  "model": "gpt-5.6-terra",
  "object": "chat.completion",
  "created": 1789712872,
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I can't help with that request. I can, however, help with a related topic or a rewritten version that stays within the usage policy."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 54,
    "total_tokens": 89
  }
}
```

| Field | What a refusal looks like |
| - | - |
| HTTP status | `200` |
| `finish_reason` | `stop`, same as a normal answer |
| `message` | Only `role` and `content`; there is **no** separate `refusal` field |
| Opening words | Usually `I can't…` or `Sorry, I can't…`; in Chinese, `抱歉，我不能…` |
| Language | Follows the prompt: a Chinese prompt usually gets a Chinese refusal |
| Length | Mostly 50–120 tokens; topics related to personal wellbeing come with support suggestions and can reach about 400 tokens |
| Billing | Billed normally on actual input and output tokens |

## Why There Is No Category

For policy-violating requests, the OpenAI chat API **lets the model decide not to answer** instead of returning an error. It does not tell you which category was hit (for example adult content, graphic violence, or self-harm), and it gives no severity.

This is different from an error. With an error you get a non-200 status and an `error` object. With a refusal you get a **successful call** whose content simply isn't what you asked for.

## Translation and Structured Output

Batch translation and extraction tasks usually ask the model for a fixed format, such as a JSON array. When a batch triggers a refusal, the model returns a plain sentence, so parsing it as JSON fails with errors like `Unrecognized token 'I'` or `Expecting value`.

**This is not an API format problem.** The content of that batch was declined. Retrying the same batch unchanged usually gives the same result.

<Info>
  APIYI has enabled automatic failover for content safety on **non-streaming requests**. When one official route triggers a content filter, either on the prompt or on the generated output, the request is automatically retried on another official route, with no retry needed on your side. After failover most requests return a normal result; a small number may still be refused by the model itself, which is the case this page describes.
</Info>

## How to Detect and Handle It

<Steps>
  <Step title="Validate the output format first">
    If you asked for JSON, parse it as JSON; if you asked for a fixed number of items, check the count. If the format doesn't match, treat the call as "no result" and don't use the content as your output.
  </Step>

  <Step title="Then check whether it is a refusal">
    If the format doesn't match, check whether the content is a short sentence starting with `I can't`, `Sorry`, or similar. If so, it is almost certainly a refusal rather than the model drifting off format.
  </Step>

  <Step title="Don't retry unchanged">
    Retrying the same content unchanged will most likely produce the same refusal, and each attempt is billed.
  </Step>

  <Step title="Split the batch to find the specific items">
    Resubmit the failed batch in smaller batches to find which items trigger the refusal; the rest usually complete normally. For the items that trigger it, adjust the wording and try again.
  </Step>

  <Step title="Archive failed cases, then decide whether to switch models">
    Keep an internal archive of failed cases (input, request time, request ID, returned content), review which kinds of content the refusals concentrate on, and then consider retrying that content with another model.
  </Step>
</Steps>

<Tip>
  We recommend making "archive failed cases → analyze → retry with another model" a standard process. Refusals tend to cluster around a few kinds of content, so an archive makes the pattern easy to see. It saves repeated manual investigation and avoids paying for the same content again and again.
</Tip>

Here is a minimal example: validate the JSON, and record anything that doesn't match in a local failure log.

```python theme={null}
import json
import os
import time
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL_PREFIXES = ("I can't", "I can’t", "Sorry", "I'm sorry", "I’m sorry", "抱歉")

def translate_batch(lines):
    prompt = "Translate each subtitle line below into English. Output a JSON array only:\n" + json.dumps(lines, ensure_ascii=False)
    resp = client.chat.completions.create(
        model="gpt-5.6-terra",
        messages=[{"role": "user", "content": prompt}],
    )
    text = resp.choices[0].message.content or ""
    try:
        result = json.loads(text)
        if isinstance(result, list) and len(result) == len(lines):
            return result
    except json.JSONDecodeError:
        pass

    # No usable result: record it for later analysis or a retry with another model
    with open("failed_cases.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "time": time.strftime("%Y-%m-%d %H:%M:%S %z"),
            "request_id": resp.id,
            "is_refusal": text.strip().startswith(REFUSAL_PREFIXES),
            "input": lines,
            "output": text,
        }, ensure_ascii=False) + "\n")
    return None
```

## Streaming Requests

Once a streaming response starts, it can no longer be switched to another route, so **automatic content safety failover only applies to non-streaming requests**. With streaming you may see:

* a short refusal whose last event has `finish_reason` set to `content_filter`; or
* part of the content already delivered, ending with `finish_reason: "content_filter"`.

For tasks like batch translation that don't need to be displayed token by token, we recommend non-streaming calls. For a full comparison with test results, see [How Do Streaming and Non-Streaming Requests Differ When Content Is Filtered?](/en/faq/streaming-content-filter).

## FAQ

<AccordionGroup>
  <Accordion title="Am I billed for a refusal?">
    Yes. A refusal is a successful call and is billed on actual input and output tokens, so avoid retrying the same content repeatedly.
  </Accordion>

  <Accordion title="Can refusals be turned off?">
    No. Refusals are decided by the provider's model under its usage policy. APIYI cannot turn them off or adjust how strict they are.
  </Accordion>

  <Accordion title="Why does the same content sometimes pass and sometimes get refused?">
    The model's judgment has some randomness, and different official routes filter slightly differently, so borderline content may pass one time and be refused the next. Content that clearly violates the usage policy is refused consistently.
  </Accordion>

  <Accordion title="How can I get the refusal category?">
    The OpenAI chat API does not return one. If your workflow needs categories, classify the content yourself before sending it, or sort the archived failed cases manually.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Response Handling" icon="braces" href="/en/api-capabilities/openai/response-handling">
    One parsing approach for streaming and non-streaming responses
  </Card>

  <Card title="How is content safety and compliance ensured?" icon="shield-check" href="/en/faq/content-safety">
    Platform content safety and compliance policy
  </Card>

  <Card title="Why Does a Claude Refusal Return Empty Content?" icon="message-square-x" href="/en/faq/claude-content-safety-refusal">
    What a Claude refusal looks like and how to detect it
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.