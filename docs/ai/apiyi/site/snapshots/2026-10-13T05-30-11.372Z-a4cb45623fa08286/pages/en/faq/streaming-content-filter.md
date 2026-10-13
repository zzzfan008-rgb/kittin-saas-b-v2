> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Do Streaming and Non-Streaming Requests Differ When Content Is Filtered?

> When a non-streaming request is caught by a content safety filter, the platform automatically regenerates it on another route. A streaming request cannot switch once output has started and ends with content_filter. Test results, response shapes, and how to choose.

## Short Answer

<Info>
  **The same content can end very differently in streaming and non-streaming mode when a content filter kicks in:**

  1. **Non-streaming**: when an official route triggers the content safety filter, APIYI **automatically regenerates the request on another official route**. Your client gets the complete result and is **billed only once**.
  2. **Streaming**: output is sent to your client as soon as it is generated, so **the route cannot be switched mid-stream**. The request ends with `finish_reason: "content_filter"`, and the part already generated **is billed as usual**.
  3. **How to choose**: use streaming for content shown to users token by token (chat, agent replies); use non-streaming for content your program consumes after it is complete (scripts, storyboards, translation, structured data).
</Info>

## Two Points Where Filtering Happens

The provider's content safety filter can step in at two points, and both show up in streaming mode:

| When | What you see in a stream | Typical time |
| - | - | - |
| **Request stage** (input is screened) | The content is a single sentence, `I'm sorry, but I cannot assist with that request.` (about 15 tokens), with `finish_reason` set to `content_filter` | A few seconds |
| **Generation stage** (output is screened) | The model has already produced part of the content and is cut off, with `finish_reason` set to `content_filter` | Depends on how much was generated |

In both cases the HTTP status is `200` and the stream closes normally with `data: [DONE]`. **Nothing appears in HTTP error logs**; only the last event of the stream tells you what happened.

## Streaming vs Non-Streaming

| | Streaming `stream: true` | Non-streaming `stream: false` |
| - | - | - |
| What the platform does when filtered | Output has started, so the route cannot be switched | Automatically regenerates on another official route |
| What your client receives | A truncated partial response, or a one-line refusal | The complete result, `finish_reason: "stop"` |
| Billing | The truncated request is billed for its actual input and output tokens; continuations or retries are billed separately | Only the successful attempt is billed |
| Client-side handling | Detect `content_filter`, clean up the text, then continue or retry | None needed |
| Best for | Content shown token by token | Content used after it is complete |

<Note>
  Automatic failover for non-streaming requests greatly raises the success rate, but it is not 100%. Content that clearly violates the provider's usage policy may still be refused by the model itself on another route; see [What Does an OpenAI Model Refusal Look Like?](/en/faq/openai-content-safety-refusal) for that response shape.
</Note>

## Test Results

On 2026-09-25 (UTC+8), we sent the same set of film storyboard scripts to `gpt-5.6-terra` in both modes with identical parameters (`max_tokens=35000`, `temperature=0`, `reasoning_effort=high`):

| Script theme | Streaming | Non-streaming |
| - | - | - |
| Martial-arts fight, with detailed moves, injuries, and falls | **5/5 cut off at the generation stage** (around 1,700 tokens) | **4/4 complete** |
| Action and war scenes with bloodshed and death | **10/10 blocked at the request stage** (fixed one-line refusal) | **6/6 complete** |
| Everyday life and mystery themes | 8/8 finished normally | — |

Retrying the same content in streaming mode gives essentially the same result. **Whether filtering triggers depends mainly on the content, not on luck.**

## What a Truncated Stream Looks Like

The last event that carries `choices` has no content, only the finish reason:

```text theme={null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[{"delta":{},"finish_reason":"content_filter","index":0}],"usage":null}
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"gpt-5.6-terra","choices":[],"usage":{"prompt_tokens":27831,"completion_tokens":6966,"total_tokens":34797}}
data: [DONE]
```

<Warning>
  **When output is cut off at the generation stage, an English refusal is appended directly to the end of the assembled text, with no line break.** For example, a Chinese storyboard ends mid-sentence and is immediately followed by `I'm sorry, but I cannot assist with that request.`

  If you pass this text unchanged into a continuation request, the model sees a refusal in its context and is more likely to be blocked again. **Remove that sentence before continuing.**
</Warning>

## How to Choose

<CardGroup cols={2}>
  <Card title="Use streaming" icon="zap">
    * Chat, customer support, and agent replies where users need to see output immediately
    * Scenarios where users can stop generation midway
    * Everyday conversation rarely triggers content filtering, so the streaming experience matters more
  </Card>

  <Card title="Use non-streaming" icon="package">
    * Scripts, storyboards, novel chapters, and other long creative writing
    * Batch translation, information extraction, structured JSON
    * Results that are parsed and stored before being shown to users
    * **Content likely to touch sensitive plot points** (fights, injuries, crime)
  </Card>
</CardGroup>

One product can **use both**: stream the chat, and generate scripts or storyboards without streaming. Just set `stream` to `false` for the latter and leave everything else unchanged.

A non-streaming request only returns after the whole response is generated. Long outputs from reasoning models can take 30 to 100 seconds or more, so set the client timeout for these requests to **at least 300 seconds**; see [How do I avoid API timeouts?](/en/faq/timeout-configuration). If your UI needs a sense of progress, show a "generating" state and display the result once it is complete.

## If You Must Stream

<Steps>
  <Step title="Record finish_reason while reading the stream">
    If `finish_reason` in the last event carrying `choices` is `content_filter`, the response was filtered. Don't rely on the HTTP status code.
  </Step>

  <Step title="Strip the trailing refusal">
    When output is cut off at the generation stage, the text ends with an English refusal. Remove it before deciding what to do with the partial output.
  </Step>

  <Step title="Retry without streaming">
    Re-send the truncated part as a non-streaming request so the platform can switch routes automatically. This succeeds far more often than a streaming continuation.
  </Step>

  <Step title="Rephrase if it keeps getting blocked">
    If even the non-streaming request fails for the same task, describe the sensitive details in more general terms and try again. Don't resend the same content unchanged.
  </Step>
</Steps>

Here is a minimal example: read the stream, strip the refusal when filtered, then retry without streaming.

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"], base_url="https://api.apiyi.com/v1")

REFUSAL = "I'm sorry, but I cannot assist with that request."

def generate(messages, model="gpt-5.6-terra"):
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        stream_options={"include_usage": True},
    )
    parts, finish = [], None
    for chunk in stream:
        if not chunk.choices:
            continue
        choice = chunk.choices[0]
        if choice.delta and choice.delta.content:
            parts.append(choice.delta.content)
            print(choice.delta.content, end="", flush=True)
        if choice.finish_reason:
            finish = choice.finish_reason

    text = "".join(parts)
    if finish != "content_filter":
        return text

    # Filtered: strip the trailing refusal and retry without streaming so the platform can switch routes
    partial = text.removesuffix(REFUSAL)
    print(f"\n[Cut off by content filter after {len(partial)} characters; retrying without streaming]")
    resp = client.chat.completions.create(model=model, messages=messages, timeout=600)
    return resp.choices[0].message.content
```

<Tip>
  The example simply regenerates the whole response without streaming, which is the easiest approach. If your workflow must keep the partial output, pass `partial` as context and ask the model to continue, but send that continuation without streaming as well.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Is a truncated streaming request billed?">
    Yes. The provider actually generated that content, so it is billed for the actual input and output tokens. For content that tends to trigger filtering, non-streaming is cheaper: only the successful attempt is billed.
  </Accordion>

  <Accordion title="Can content filtering be turned off?">
    No. Filtering is enforced by the provider, and APIYI cannot turn it off or change its strictness. What the platform can do is retry a filtered non-streaming request on another official route.
  </Accordion>

  <Accordion title="Why does the same content sometimes pass and sometimes get cut off?">
    Filtering strictness varies somewhat between official routes, and the model words its output differently each time, so borderline content may pass one time and be cut off the next. Clearly sensitive content is blocked consistently.
  </Accordion>

  <Accordion title="Why doesn't the platform retry streaming requests automatically?">
    A generation-stage cutoff happens after content has already been sent, and your client has already received and displayed the first half. Regenerating from scratch on another route at that point would not match what was shown. So streaming requests have to be handled by your client once it sees `content_filter`.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="What Does an OpenAI Model Refusal Look Like?" icon="message-square-x" href="/en/faq/openai-content-safety-refusal">
    Response shape and detection when the model itself refuses
  </Card>

  <Card title="Streaming vs Non-Streaming Calls" icon="audio-lines" href="/en/faq/streaming-vs-non-streaming">
    Integration, billing, and common misconceptions for both modes
  </Card>

  <Card title="How Do I Avoid API Timeouts?" icon="timer" href="/en/faq/timeout-configuration">
    Timeout settings for long non-streaming outputs
  </Card>

  <Card title="Content Safety and Compliance" icon="shield-check" href="/en/faq/content-safety">
    Platform content safety and compliance policy
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.