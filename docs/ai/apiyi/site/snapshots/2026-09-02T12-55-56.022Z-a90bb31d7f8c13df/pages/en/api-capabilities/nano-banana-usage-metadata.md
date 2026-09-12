> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Usage Fields & Output Explained

> Understand the response JSON structure and usageMetadata fields of gemini-3-pro-image, including three counting behaviors that look like anomalies but are inherent to the model

This page is for developers calling `gemini-3-pro-image` (Nano Banana Pro) via APIYI. It explains the output structure of the response JSON and what each `usageMetadata` field actually means, and clarifies several counting behaviors that **look like anomalies but are inherent to the model**. All conclusions come from testing against the production gateway (48 text-to-image + 18 image-edit requests), cross-checked against Google's official docs (`ai.google.dev/gemini-api/docs/image-generation`), not speculation.

## Overall Response Structure

APIYI's nano banana series uses the Google native format. The response always has four top-level fields:

```json theme={null}
{
  "candidates":    [ ... ],          // generation results (image/text parts)
  "usageMetadata": { ... },          // token usage
  "modelVersion":  "gemini-3-pro-image",
  "responseId":    "..."
}
```

### On successful generation

```json theme={null}
"candidates": [{
  "content": {
    "role": "model",
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }
    ]
  },
  "finishReason": "STOP",
  "index": 0
}]
```

<Warning>
  **parts may contain more than one image.** With complex task-style prompts (multi-constraint tasks such as "4-view character sheet"), the model may return multiple image parts in a single response (2–10 observed in testing) — they are interim drafts from the model's "thinking process" plus the final version. Google's docs state that "the last image within Thinking is also the final rendered image", so **just take the last one**. Pure text-to-image and simple edits (add accessories / change background / restyle) usually return just 1. Either way, always iterate over parts and take the last `inlineData` when you only need one image. See [Dev Guide · Why Do Responses Occasionally Contain Multiple Images](/en/api-capabilities/nano-banana-dev-guide#why-do-responses-occasionally-contain-multiple-images) for details.
</Warning>

#### parts may also contain a text segment

The example above shows a `parts` array holding a single image segment, but **that structure is not guaranteed**. `parts` is a heterogeneous array, and three layouts have been observed in testing:

| parts layout          | Length | Image index |
| --------------------- | ------ | ----------- |
| `inlineData`          | 1      | `0`         |
| `text` + `inlineData` | 2      | **`1`**     |
| `inlineData` + `text` | 2      | **`0`**     |

Including `TEXT` in `responseModalities`, or a prompt that asks the model to explain itself, will add a text segment to the response — and whether it lands before or after the image is not fixed either. **So the index the image sits at is not a constant.**

<Warning>
  The two hardcoded-index patterns are **complementary**: the image always lands on either `[0]` or `[1]`, so hardcoding either one leaves requests where you get no image. For the correct approach see the **Parsing & Reconciliation Best Practices** section below. You can also declare `responseModalities: ["IMAGE"]` in `generationConfig` to state that you only want an image, as a hardening measure — but it **does not replace** filtering.
</Warning>

### When blocked by safety policies

The HTTP status code is **still 200**; the difference is inside the candidate:

```json theme={null}
"candidates": [{
  "content": { "parts": null },        // ⚠️ parts is null, not an empty array
  "finishReason": "IMAGE_SAFETY",      // or NO_IMAGE / PROHIBITED_CONTENT
  "finishMessage": "Unable to show the generated image. ...",  // only present in some cases
  "index": 0
}]
```

* Three `finishReason` values were observed in testing: `IMAGE_SAFETY` (the output image violates policy), `PROHIBITED_CONTENT` (a prohibited-use policy was triggered, with an explanatory `finishMessage`), and `NO_IMAGE` (no image generated, usually returned within seconds).
* The refusal explanation lives in the `finishMessage` field — it does **not** appear as a text part inside `parts`.
* Your parsing code must handle `parts` being `null`, otherwise blocked responses will crash it.

<Tip>
  For failure diagnostics, content-moderation policies, and user-friendly messaging strategies, see the [Gemini Image Error Handling Guide](/en/api-capabilities/gemini-image-error-handling).
</Tip>

## usageMetadata Field Meanings

Successful generations always carry 6 fields:

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 615,          // total input tokens (text + input images)
  "candidatesTokenCount": 2478,     // total output tokens (images + internal generation tokens)
  "thoughtsTokenCount": 208,        // thinking (reasoning) tokens
  "totalTokenCount": 3301,          // total billed amount for this request
  "promptTokensDetails":     [ { "modality": "TEXT",  "tokenCount": 99 },
                               { "modality": "IMAGE", "tokenCount": 516 } ],
  "candidatesTokensDetails": [ { "modality": "IMAGE", "tokenCount": 2240 } ]
}
```

| Field                     | Meaning                                      | Reliability                                                                                                                   |
| ------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `promptTokenCount`        | Input-side total                             | ✅ Always equals the sum of `promptTokensDetails`                                                                              |
| `candidatesTokenCount`    | Output-side total                            | ✅ The billing figure; **but greater than the sum of details — see Behavior 1 below**                                          |
| `thoughtsTokenCount`      | Thinking tokens, typically 50–350 in testing | ✅                                                                                                                             |
| `totalTokenCount`         | Grand total                                  | ✅ Always equals the sum of the previous three on successful generation; **refusals are the exception — see Behavior 2 below** |
| `promptTokensDetails`     | Input breakdown by modality                  | ✅ Complete breakdown                                                                                                          |
| `candidatesTokensDetails` | Output breakdown by modality                 | ⚠️ **Covers only the image portion — not a complete breakdown**                                                               |

**Image tokens are determined by the resolution tier, not the aspect ratio**: **1120 tokens per image** at both the 1K and 2K tiers, **2000 per image** at 4K. The aspect ratio only changes the pixel dimensions, never the token count. When N images are returned in one response, details equal exactly N × per-image value.

The table below is Google's official Pro Image aspect-ratio and image-size reference (source: `ai.google.dev/gemini-api/docs/image-generation`), fully consistent with our measurements of `gemini-3-pro-image`:

| Aspect ratio | 1K size   | 1K tokens | 2K size   | 2K tokens | 4K size   | 4K tokens |
| ------------ | --------- | --------- | --------- | --------- | --------- | --------- |
| 1:1          | 1024x1024 | 1120      | 2048x2048 | 1120      | 4096x4096 | 2000      |
| 2:3          | 848x1264  | 1120      | 1696x2528 | 1120      | 3392x5056 | 2000      |
| 3:2          | 1264x848  | 1120      | 2528x1696 | 1120      | 5056x3392 | 2000      |
| 3:4          | 896x1200  | 1120      | 1792x2400 | 1120      | 3584x4800 | 2000      |
| 4:3          | 1200x896  | 1120      | 2400x1792 | 1120      | 4800x3584 | 2000      |
| 4:5          | 928x1152  | 1120      | 1856x2304 | 1120      | 3712x4608 | 2000      |
| 5:4          | 1152x928  | 1120      | 2304x1856 | 1120      | 4608x3712 | 2000      |
| 9:16         | 768x1376  | 1120      | 1536x2752 | 1120      | 3072x5504 | 2000      |
| 16:9         | 1376x768  | 1120      | 2752x1536 | 1120      | 5504x3072 | 2000      |
| 21:9         | 1584x672  | 1120      | 3168x1344 | 1120      | 6336x2688 | 2000      |

<Note>
  In Google's official table, the column header `1K tokens` means "the token count for the 1K resolution tier" — the actual per-image token count is the cell value: 1120 per image at 1K/2K, 2000 at 4K. (The Chinese localization of that page renders the header as "1,000 tokens", which is easy to misread as the per-image count.) Also note the 512px tier (747 tokens per image) exists only for the Flash image models — `gemini-3-pro-image` supports 1K/2K/4K only; Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) is a special case — it only has a **1K** tier, no 512px.
</Note>

## Three Behaviors That Look Like Anomalies

### Behavior 1: candidatesTokenCount ≠ sum of candidatesTokensDetails — normal and inevitable

In testing, **100%** of samples (49/49 successful generations) showed `candidatesTokenCount` exceeding the sum of details by **88–630 tokens** (the more complex the prompt and the more images returned, the bigger the gap).

Reason: `candidatesTokensDetails` counts only the **image payload itself** (fixed 1120/2000 per image), while `candidatesTokenCount` also includes internal tokens generated alongside the image-generation process, which have no corresponding modality entry. This is Gemini's native counting convention; APIYI passes it through unchanged.

<Info>
  **Bottom line: do not treat details as a complete breakdown of `candidatesTokenCount` for validation. For reconciliation and billing, always use `candidatesTokenCount` / `totalTokenCount`; details are only useful for estimating the image share.**
</Info>

### Behavior 2: totalTokenCount ≠ prompt + candidates + thoughts — only on responses with no image output

* On successful generation, the equation **holds strictly** (49/49): `total = promptTokenCount + candidatesTokenCount + thoughtsTokenCount`.
* On safety-blocked responses (no image output), the equation **never holds** (6/6), with a fixed pattern:

```text theme={null}
candidatesTokenCount == thoughtsTokenCount     // thinking tokens are written into both fields
totalTokenCount == promptTokenCount + thoughtsTokenCount   // total counts them once — this is correct
```

In refusal responses, `candidatesTokenCount` mirrors `thoughtsTokenCount`, so summing the three fields double-counts the thinking tokens. This is also upstream-inherent behavior. **`totalTokenCount` itself is accurate — just use it directly.** If about 10% of the responses in your logs "don't balance", check whether those responses have empty `parts` — they are almost certainly safety-blocked samples.

### Behavior 3: output tokens occasionally hit 6000+ — caused by multiple image parts from the thinking process

Google's official docs state that Gemini 3 image models are thinking models: "Thinking" is enabled by default and cannot be disabled in the API. The model generates interim images to test composition and logic, and "the last image within Thinking is also the final rendered image" (source: the Thinking Process section of `ai.google.dev/gemini-api/docs/image-generation`).

In our testing, these interim thinking drafts come back in the native `generateContent` response as **ordinary image parts**: every part carries a `thoughtSignature` field but no `thought: true` flag, and **each one is counted at 1120 tokens in `candidatesTokensDetails`**. Google's docs say Thinking generates at most two interim images, but with complex task-style prompts we observed up to **10 image parts** in a single response. Usage grows strictly linearly with the image count:

| Images returned       | candidatesTokensDetails | candidatesTokenCount | totalTokenCount |
| --------------------- | ----------------------- | -------------------- | --------------- |
| 1 (text-to-image, 1K) | 1120                    | \~1210–1275          | \~1350–1450     |
| 2                     | 2240                    | \~2500               | \~3300          |
| 3                     | 3360                    | \~3800               | \~4600          |
| 4                     | 4480                    | \~5000               | \~5900          |
| 5                     | 5600                    | \~6200               | \~7000          |
| 10                    | 11200                   | \~12700              | \~13500         |

The `thoughtsTokenCount` field only counts **text thinking** and never exceeded 400 in testing — the source of high output tokens is the number of image parts, not this field. When you see 6000+ or even five-digit output tokens, check the number of parts in that response — it is almost certainly a multi-image response and normal billing (still reconcile with `totalTokenCount`).

## Thinking Levels & the Two API Paradigms

### How thinkingLevel affects tokens

Thinking-level control is only supported by **Gemini 3.1 Flash Image / Flash Lite Image** (`generationConfig.thinkingConfig.thinkingLevel`, default `minimal`, or `high`); on `gemini-3-pro-image` thinking is always on and cannot be adjusted. Measured (same prompt, 1K text-to-image, via the APIYI gateway):

| Model / setting                            | thoughtsTokenCount              | Image tokens | totalTokenCount | Latency  |
| ------------------------------------------ | ------------------------------- | ------------ | --------------- | -------- |
| gemini-3.1-flash-image · minimal (default) | field absent                    | 1120         | \~1534–1554     | \~12–13s |
| gemini-3.1-flash-image · high              | 700–792                         | 1120         | \~2243–2375     | \~18–23s |
| gemini-3-pro-image · high passed in        | 181–214 (same as default range) | 1120         | \~1427–1471     | \~23s    |

* **`high` only increases thinking tokens and latency — image tokens stay unchanged** (still 1120 per image).
* Passing `thinkingLevel` to `gemini-3-pro-image` does not error, but has no measurable effect — thinking tokens stay in the default range.
* `includeThoughts: true` changed neither the response structure nor billing in testing; Google states explicitly that thinking tokens are billed by default whether or not you view the thinking process.
* Google also notes that "minimal thinking does not mean the model does no thinking at all" — under `minimal` the usage simply stops listing a separate `thoughtsTokenCount` field.

<Info>
  Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) is in the same 3.1 Flash family as Nano Banana 2 and also supports the `thinkingLevel` control, with the same mechanics as the table above; it hasn't been separately measured and included in the table yet. For pricing details, see [Nano Banana Series Pricing](/en/api-capabilities/nano-banana-pricing).
</Info>

### How image-model thinking tokens differ from text models

* **Text thinking models**: the thinking output is text; `thoughtsTokenCount` can reach thousands and is billed at the output-token price. Officially, pricing is based on the **full internal thoughts** the model generates, even though the API only returns thought summaries (source: the pricing section of `ai.google.dev/gemini-api/docs/thinking`).
* **Image thinking models**: thinking produces two kinds of output — a small amount of **text thinking** counted in `thoughtsTokenCount` (measured: up to 400 on Pro, \~800 on Flash at `high`), and **interim draft images**, which come back as ordinary image parts billed at 1120/2000 tokens each into `candidatesTokenCount`. So for image models the "cost of thinking" mostly shows up in the number of image parts, not in the `thoughtsTokenCount` field (see Behavior 3 above).

### The two API paradigms

Google's image-model docs now come in two flavors: the classic **generateContent API** (stateless) and the newly recommended **Interactions API** (built for agents and tools). The APIYI gateway uses the **Google native generateContent format — everything in this page is based on it**. The thinking-related differences:

|                             | generateContent (this page)                                                                                                       | Interactions API                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Thinking-level parameter    | `generationConfig.thinkingConfig.thinkingLevel`                                                                                   | `generation_config.thinking_level`                                            |
| Thought content in response | `includeThoughts` switch (no visible effect for image models in testing; interim drafts always come back as ordinary image parts) | returned explicitly as `steps` (`type: "thought"`), no includeThoughts switch |
| Usage field names           | `thoughtsTokenCount` / `candidatesTokenCount` / `totalTokenCount`                                                                 | `total_thought_tokens` / `total_output_tokens`                                |

For the full comparison of the two paradigms (endpoints, state management, data retention, and APIYI gateway compatibility tests), see [Interactions API vs generateContent](/en/api-capabilities/gemini/interactions-api).

## Parsing & Reconciliation Best Practices

```python theme={null}
data = resp.json()
cand = (data.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []   # handles parts=null

# Select by field shape — never by parts[0] / parts[1]; a text segment may come first
images = [p["inlineData"] for p in parts if "inlineData" in p]
if images:
    final_image = images[-1]["data"]          # last one is the final version
    mime = images[-1]["mimeType"]             # trust the response; don't hardcode image/png
else:
    reason = cand.get("finishReason")         # IMAGE_SAFETY / NO_IMAGE / PROHIBITED_CONTENT
    message = cand.get("finishMessage", "")   # may be empty
```

1. **Reconcile billing with `totalTokenCount`** (it is accurate even for refusals); do not validate by summing the three fields yourself or by summing details.
2. **Iterate over parts — never assume a single image**; any per-image business logic should go by the actual number of `inlineData` parts.
3. **Handle blocked responses with `parts = null` + HTTP 200**, branching on `finishReason`.
4. Simple edits take \~22–25s; complex tasks (multi-image responses) take 35–142s, longer with more images. Set client timeouts to ≥ 5 minutes (including any proxy layer).

## Related Docs

<CardGroup cols={2}>
  <Card title="Nano Banana Dev Guide" icon="book-open" href="/en/api-capabilities/nano-banana-dev-guide">
    Integration methods, input image requirements, billing basics, timeout settings, and the multi-image explainer
  </Card>

  <Card title="Error Handling Guide" icon="triangle-alert" href="/en/api-capabilities/gemini-image-error-handling">
    The three key indicators for diagnosing failed generations, content moderation policies, and friendly prompt strategies
  </Card>

  <Card title="Failed Generation Guarantee Plan" icon="shield-check" href="/en/api-capabilities/nano-banana-pro-guarantee">
    For failures not caused by your input, credits are reimbursed per the number of failed requests
  </Card>

  <Card title="Nano Banana Pricing" icon="badge-dollar-sign" href="/en/api-capabilities/nano-banana-pricing">
    Per-image pricing across resolutions and model tiers
  </Card>
</CardGroup>
