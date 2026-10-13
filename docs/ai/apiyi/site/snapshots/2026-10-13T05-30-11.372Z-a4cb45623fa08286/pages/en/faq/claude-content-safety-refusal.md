> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Does a Claude Refusal Return Empty Content?

> When Claude hits the provider's safety policy it does not error: it returns HTTP 200, empty content and stop_reason: refusal, with a refusal category. This page shows the output for each API format, the billing rules and how to detect it.

## Short Answer

When a request triggers the provider's safety policy, Claude **does not return an error**. The API still returns HTTP 200, but:

* `content` is an **empty array** `[]` and `output_tokens` is `0`;
* `stop_reason` is `refusal`;
* `stop_details` names the refusal **category** (for example `cyber`) and carries a short English explanation.

This is model behavior, not an API failure. Code that reads `message.content[0]` directly will raise an `IndexError`. With the OpenAI-compatible format you get an empty string and `finish_reason` is `refusal`.

A refusal usually comes back within 1–2 seconds. Whether it is billed depends on the category: **a refusal before any output in the `cyber` category (and some others) is not billed** — see "Billing Rules" below.

## What a Refusal Looks Like

Below is the same request that triggers a cyber refusal, called in four ways (measured on 2026-09-29, ids masked):

<Tabs>
  <Tab title="Native · Non-streaming">
    `POST /v1/messages`, `stream: false`:

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "type": "message",
      "role": "assistant",
      "model": "claude-sonnet-5",
      "content": [],
      "stop_reason": "refusal",
      "stop_sequence": null,
      "stop_details": {
        "type": "refusal",
        "category": "cyber",
        "explanation": "This request triggered cyber-related safeguards. To learn about the Cyber Verification Program and apply for access, visit our help center: ..."
      },
      "usage": {
        "input_tokens": 2863,
        "output_tokens": 0,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0
      }
    }
    ```
  </Tab>

  <Tab title="Native · Streaming">
    `POST /v1/messages`, `stream: true`. **There are no `content_block_*` events at all** — `message_start` is followed directly by a `message_delta` carrying the refusal:

    ```text theme={null}
    event: message_start
    data: {"type":"message_start","message":{"id":"msg_xxxxxxxx","content":[],"stop_reason":null,"stop_details":null,"usage":{"input_tokens":2863,"output_tokens":0}, ...}}

    event: message_delta
    data: {"type":"message_delta","delta":{"stop_reason":"refusal","stop_sequence":null,"stop_details":{"type":"refusal","category":"cyber","explanation":"This request triggered cyber-related safeguards. ..."}},"usage":{"input_tokens":2863,"output_tokens":0}}

    event: message_stop
    data: {"type":"message_stop"}
    ```
  </Tab>

  <Tab title="OpenAI-compatible · Non-streaming">
    `POST /v1/chat/completions`. `content` is an empty string, `finish_reason` is `refusal`, and **there is no refusal category**:

    ```json theme={null}
    {
      "id": "msg_xxxxxxxx",
      "object": "chat.completion",
      "model": "claude-sonnet-5",
      "choices": [
        {
          "index": 0,
          "message": { "role": "assistant", "content": "" },
          "finish_reason": "refusal"
        }
      ],
      "usage": { "prompt_tokens": 2863, "total_tokens": 2863 }
    }
    ```
  </Tab>

  <Tab title="OpenAI-compatible · Streaming">
    `POST /v1/chat/completions`, `stream: true`. Only empty `delta`s, and one chunk has `finish_reason` set to `refusal`:

    ```text theme={null}
    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""}}]}

    data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"refusal"}]}

    data: [DONE]
    ```
  </Tab>
</Tabs>

| Field | On refusal |
| - | - |
| HTTP status | `200`, not an error |
| `content` | Empty array `[]` in the native format; empty string `""` in the OpenAI-compatible format |
| `stop_reason` / `finish_reason` | `refusal` |
| `stop_details` | Native format only: `type`, `category` (refusal category), `explanation` (English text) |
| `usage` | Input tokens are counted as usual, `output_tokens` is 0 (counting is not the same as billing — see below) |
| Latency | Usually 1–2 seconds, much faster than a normal answer |

<Note>
  A refusal can also happen **mid-stream**: part of the text is streamed first and the response then ends with `stop_reason: "refusal"`. That partial output is incomplete and should be discarded.
</Note>

## Refusal Categories

`stop_details.category` currently has five values:

| Category | Meaning |
| - | - |
| `cyber` | Could enable cyber harm, such as malware or exploit development; benign security work can also trigger it |
| `bio` | Could enable biological harm; beneficial life-sciences work can also trigger it |
| `frontier_llm` | Could assist the development of competing AI models (restricted by the provider's commercial terms) |
| `reasoning_extraction` | Asks the model to reproduce its internal reasoning in the answer |
| `general_harms` | Other usage-policy areas outside the four categories above |

When a refusal does not map to a named category, both `category` and `explanation` are `null` — that is a normal value. The `explanation` text may change at any time: display it, **don't string-match on it**.

## Common Triggers

`category: "cyber"` is the one developers hit most often. Claude has a real-time safeguard for cybersecurity requests, and all of these tasks can trigger it:

* Asking the model to find bugs in code, decide whether a piece of code "has a vulnerability", or name the vulnerability type (CWE)
* Writing or completing exploit code, or penetration-testing steps
* Analyzing or rewriting malicious code

<Warning>
  **Batch evaluation and dataset distillation are the most exposed.** Running a whole vulnerability dataset through the model item by item often gets a sizeable share of samples refused. A script that assumes `content[0]` always exists will crash on the refused item, which looks like "the API works only some of the time".
</Warning>

## Billing Rules

Per the provider's rules (as of September 2026; the provider may adjust them as it measures false-positive rates):

| When the refusal happens and its category | Billing |
| - | - |
| Before any output, category `cyber`, `general_harms` or `null` | **Not billed** |
| Before any output, category `bio`, `frontier_llm` or `reasoning_extraction` | Input tokens billed |
| Mid-stream (any category) | Input tokens plus the output already streamed are billed |

Billed or not, a refused request still counts toward your rate limits. `usage` still shows token counts — that is a count, not necessarily a charge.

## How to Detect and Handle It

<Steps>
  <Step title="Check stop_reason before reading content">
    In the native format check `stop_reason == "refusal"`; in the OpenAI-compatible format check `finish_reason == "refusal"`. Read `content` only after ruling out a refusal.
  </Step>

  <Step title="Record refusals as a result type">
    A refusal is a successful call, not a network error. For evaluation work, record it separately as "refused" together with `stop_details.category`, instead of counting it as a failure to retry.
  </Step>

  <Step title="Don't retry the same content">
    Resending the same content usually gets the same refusal, still uses up rate limits, and for some categories is billed every time.
  </Step>

  <Step title="Reset context in multi-turn conversations">
    After a turn is refused, remove or rewrite that turn, or clear the history, before continuing. Without a reset, later requests will keep being refused.
  </Step>

  <Step title="Review which content gets refused">
    Group refusals by `category` to see which tasks trigger them, then decide whether to send that content to a different model.
  </Step>
</Steps>

<Tabs>
  <Tab title="Anthropic SDK">
    ```python theme={null}
    import os
    import anthropic

    client = anthropic.Anthropic(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com",
    )

    def ask(prompt, model="claude-sonnet-5"):
        message = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        if message.stop_reason == "refusal":
            details = getattr(message, "stop_details", None)
            category = getattr(details, "category", None) if details else None
            return {"refused": True, "category": category, "request_id": message.id}

        text = "".join(b.text for b in message.content if b.type == "text")
        return {"refused": False, "text": text}
    ```
  </Tab>

  <Tab title="OpenAI SDK">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1",
    )

    def ask(prompt, model="claude-sonnet-5"):
        resp = client.chat.completions.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        choice = resp.choices[0]
        if choice.finish_reason == "refusal" or not choice.message.content:
            return {"refused": True, "request_id": resp.id}
        return {"refused": False, "text": choice.message.content}
    ```
  </Tab>
</Tabs>

<Tip>
  If you need the refusal **category**, call the native `/v1/messages` format. The OpenAI-compatible format keeps only `finish_reason: "refusal"` and has no `stop_details`.
</Tip>

## What About Legitimate Security Research?

The **Cyber Verification Program** mentioned in the refusal text is the provider's free application program for legitimate security work: after identity verification, "high-risk dual-use" tasks such as exploitation or offensive tooling development can be relaxed. "Prohibited uses" such as ransomware development or mass data exfiltration are blocked in all cases.

The program is **applied for by an organization admin on a first-party provider account**. For third-party platforms the provider notes that "not all platforms participate", and APIYI does not currently offer access to the program.

So when calling through APIYI, for refused samples:

* record them honestly as "refused" in your evaluation results, grouped by category;
* or process that content with a different model.

APIYI does not and cannot adjust the provider's safety policy.

## How It Differs from an OpenAI Refusal

| | Claude | OpenAI (GPT series) |
| - | - | - |
| HTTP status | 200 | 200 |
| Body | Empty (`content: []`) | A one-line refusal such as `I can't help with that…` |
| Finish reason | `refusal` | `stop`, same as a normal answer |
| Refusal category | Yes, `stop_details.category` | No |
| Billing | Pre-output refusals in `cyber` and some other categories are not billed | Billed normally for the refusal text |
| Detection | Just check `stop_reason` | Only by the text itself |

For what an OpenAI refusal looks like, see [What Does an OpenAI Model Refusal Look Like?](/en/faq/openai-content-safety-refusal).

## FAQ

<AccordionGroup>
  <Accordion title="Am I billed for a refusal?">
    It depends on the category and timing. Pre-output refusals in `cyber`, `general_harms` or `null` are not billed; `bio`, `frontier_llm` and `reasoning_extraction` bill the input; a mid-stream refusal bills the input plus the output already streamed. See "Billing Rules" above.
  </Accordion>

  <Accordion title="Can refusals be turned off?">
    No. Refusals are decided by the provider's model under its safety policy; APIYI cannot turn them off or change how strict they are. Record refused content as a refusal result, or process it with a different model.
  </Accordion>

  <Accordion title="Why are some samples in the same dataset refused and others not?">
    The safeguard judges each request on its own content. The code snippet itself and how the prompt is phrased both affect the outcome, so usually only part of a dataset is refused. In our tests, resending the same refused sample gave a consistent result.
  </Accordion>

  <Accordion title="Why is output_tokens 0 in usage on a refusal?">
    The model stopped before generating anything, so output is 0 and only input is counted. This is also how you tell a refusal from a `max_tokens` cutoff: the latter has `stop_reason: "max_tokens"` and output tokens equal to the limit you set.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Claude Response Handling" icon="braces" href="/en/api-capabilities/claude-response-handling">
    Streaming and non-streaming response structure, stop\_reason values
  </Card>

  <Card title="What Does an OpenAI Model Refusal Look Like?" icon="message-square-x" href="/en/faq/openai-content-safety-refusal">
    What a GPT refusal looks like and how to detect it
  </Card>

  <Card title="How is content safety and compliance ensured?" icon="shield-check" href="/en/faq/content-safety">
    Platform content safety and compliance policy
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.