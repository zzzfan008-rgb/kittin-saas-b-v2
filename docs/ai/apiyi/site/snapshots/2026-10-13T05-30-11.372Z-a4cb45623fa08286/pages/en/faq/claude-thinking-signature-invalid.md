> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Do I Fix Claude's Invalid Thinking Signature Error?

> When Claude Code or a Claude Agent client reports Invalid signature in thinking block with a 429, it is not rate limiting: a thinking block in the conversation history has lost its signature. Start a new conversation to fix it.

## Short Answer

The error looks like this:

```text theme={null}
API Error: Request rejected (429) · messages.1.content.0: Invalid `signature` in `thinking` block
```

Although it says 429, **this is not rate limiting**. A thinking block in the **conversation history failed the provider's signature check**. The same history is sent on every retry, so client-side automatic retries always fail.

**Fix: start a new conversation.** You do not need to change the agent, model, or key settings.

## Typical Symptoms

With Claude Code, the Claude Agent SDK, or the Claude Agent mode of clients such as Cherry Studio, with thinking enabled:

* The main conversation never produces a reply. The client shows messages such as "too many requests" or "retrying in 9 seconds (5/10)" and gives up after 10 retries.
* The console logs **do show successful, billed requests** for this key, but they are all small requests with few tokens. Those are auxiliary requests the client sends with its Small model (titles, intent checks, and so on). They carry no history, so they succeed.
* Clicking "continue" or rephrasing in the same conversation gives the same error. A new conversation works immediately.

## Why This Happens

With thinking enabled, each Claude reply starts with a `thinking` block that carries a `signature`. On the next turn, the client must send the previous `thinking` block back in the history **exactly as received, signature included**. The provider verifies the signature to confirm that the thinking content has not been altered.

Any of the following makes the signature check fail:

<CardGroup cols={2}>
  <Card title="Missing or empty signature" icon="file-x">
    The client did not store the signature when saving the conversation, so it sends back an empty `signature` string or omits the field. Several clients have had this kind of bug, most often when thinking is combined with tool calls such as file reading.
  </Card>

  <Card title="Altered thinking content" icon="pencil">
    Editing history by hand, client-side history compression or trimming, or a proxy that reformats the request body will all make the thinking content and its signature disagree.
  </Card>

  <Card title="Switching models mid-conversation" icon="shuffle">
    If model A produced the thinking block and you continue the same conversation with model B, model B may not accept the signature model A left behind.
  </Card>

  <Card title="Switching keys or groups mid-conversation" icon="key">
    If you change the key or token group partway through a conversation, later requests may be served by a different route, and earlier signatures may not pass verification there.
  </Card>
</CardGroup>

`messages.1.content.0` in the error points to **the first content block of the first assistant reply** in the history, which is the thinking block from the opening turn. Once it is broken, every later turn in that conversation fails.

## How to Fix It

<Steps>
  <Step title="Start a new conversation">
    Create a new conversation in your client, upload your files again, and ask again. Keep the same agent, model, and key. This is the fastest and most reliable fix.
  </Step>

  <Step title="Use one model and one key per conversation">
    If you need a different model or key, switch in a new conversation. Do not switch inside a conversation that already contains thinking history.
  </Step>

  <Step title="Do not edit history by hand">
    Do not edit or delete the thinking content of past assistant messages. To shorten the context, use the client's built-in compaction or start a new conversation.
  </Step>

  <Step title="Update your client">
    If the error comes back after a few turns in a new conversation, the client is most likely dropping signatures when it saves history. Update to the latest version and report the steps to reproduce it to the client's developers.
  </Step>
</Steps>

<Tip>
  **If you call the API from your own code**: when you replay history, either keep each `thinking` block **exactly as is** (including the `signature` field) or **remove the whole block**. Never keep the thinking text and drop the signature. With the official SDK, put the previous response's `content` array back into `messages` unchanged.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="The error says 429. Should I lower my request rate?">
    No. The request content is invalid; it has nothing to do with request rate. Backing off or trying later will not help. When you see `Invalid signature in thinking block`, start a new conversation.
  </Accordion>

  <Accordion title="Am I charged for the failed requests?">
    No. The signature check fails before the model generates anything, so these requests cost nothing and do not appear in the console logs. The billed entries you see come from successful requests, usually the client's small auxiliary requests.
  </Accordion>

  <Accordion title="Can I work around it by turning thinking off?">
    Turning thinking off inside the same conversation may not help, because the thinking blocks already in the history are still sent. A new conversation is more reliable. If the task does not need thinking, you can also switch to the model without the `-thinking` suffix, starting from a new conversation.
  </Accordion>

  <Accordion title="It keeps happening even in new conversations. What now?">
    Contact support with the approximate time of the error (with time zone, e.g. `17:00 (UTC+8)`), the client and its version, and the model name. We can locate the conversation's requests by time and help investigate.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Claude Effort & Thinking Guide" icon="brain" href="/en/api-capabilities/claude-effort-thinking">
    Turning thinking on and off, streaming events, and passing signatures back
  </Card>

  <Card title="Claude Native Format: Streaming & Non-Streaming Responses" icon="sparkles" href="/en/api-capabilities/claude-response-handling">
    The structure of `thinking` blocks and `signature_delta`
  </Card>

  <Card title="Claude Code" icon="terminal" href="/en/scenarios/programming/claude-code">
    Set up APIYI in Claude Code
  </Card>

  <Card title="What Are the API Concurrency Limits?" icon="gauge" href="/en/faq/api-concurrency">
    Concurrency and rate limits explained
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.