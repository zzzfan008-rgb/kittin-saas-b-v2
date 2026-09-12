> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Is there a conversational API that outputs both text and generated images?

> Reading images and generating images are two different things: which models accept image input, which models can actually produce images, which family truly returns text and an image in one response, and how to pick among the four image routes.

## Short answer

<Info>
  **Three sentences:**

  1. **"Can see images" and "can make images" are two different capabilities.** Almost every modern chat model can **read** images (that is what "multimodal" usually means), but they cannot **generate** images — that is a separate class of dedicated image models.
  2. **Only the Gemini image family truly returns text and an image from one endpoint** — `gemini-3-pro-image` (Nano Banana Pro), `gemini-3.1-flash-image` (Nano Banana 2) and friends interleave text parts and image parts in the same response.
  3. **Everything else is orchestration**: a chat model plus a standalone image endpoint working together, or `gpt-5.5` with the Responses native `image_generation` tool so the model decides when to draw.
</Info>

## First separate images going in from images coming out

Most of the confusion comes from the word "multimodal" — in an API context it **defaults to the input side**,
meaning "you can feed the model an image", not "the model can produce an image for you".
These two things use different model pools, different endpoints, and different billing:

| Dimension             | Image input (vision)                                                                              | Image output (generation)                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Which models          | **Almost every modern chat model** — GPT-5 family, Claude family, Gemini text models, Grok family | **A small set of dedicated image models** — around 30 out of nearly 300 models on the platform                   |
| Typical endpoint      | `POST /v1/chat/completions`, `/v1/responses`, `/v1/messages`                                      | `POST /v1/images/generations`, `POST /v1/images/edits`                                                           |
| Where the image lives | In the **request**: an `image_url` or base64 entry in the `content` array                         | In the **response**: `data[0].url` / `data[0].b64_json`, or `parts[].inlineData` for Gemini                      |
| Billing               | Images are converted to tokens and billed at chat rates                                           | Billed per image, or by output tokens                                                                            |
| How to check          | The model detail page lists "image" under **Input modalities**                                    | Not in the detail-page system — see [Image and video generation models](/en/api-capabilities/image-video-models) |

<Note>
  So when someone asks "do you have a multimodal chat API": if they want to **upload an image for the model to analyze**,
  the answer is "nearly all of them support that". If they want the model to **draw an image**, that is an entirely
  different set of models. Asking that one clarifying question saves most of the follow-up conversation.
</Note>

## Four routes to getting an image

| Route                                          | How you call it                                     | Text in the same response?                     | Best for                                         |
| ---------------------------------------------- | --------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| **A. Standalone image endpoint** (recommended) | An image model + `POST /v1/images/generations`      | ❌ Image only                                   | "I just want a picture"                          |
| **B. Gemini image family, native**             | `POST /v1beta/models/{model}:generateContent`       | ✅ **Possibly**, not guaranteed                 | You want commentary and the image together       |
| **C. Responses native tool**                   | `gpt-5.5` + `tools: [{"type": "image_generation"}]` | ✅ Yes                                          | An agent that decides on its own whether to draw |
| **D. Chat endpoint on an image model**         | `gpt-image-2-all` / `-vip` + `/v1/chat/completions` | Image is embedded as Markdown inside `content` | Legacy compatibility, **no longer recommended**  |

<AccordionGroup>
  <Accordion title="A. Standalone image endpoint — pick this for almost everything">
    The most standard, cheapest, and easiest-to-debug route. GPT-Image, FLUX, Seedream and Grok Imagine all live here.

    ```bash theme={null}
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-image-2",
        "prompt": "An orange cat sitting on a blue sofa, simple line-art style",
        "size": "1024x1024"
      }'
    ```

    FLUX and Seedream generally return `data[0].url`; the GPT-Image family returns `data[0].b64_json`.
    **This route returns no conversational text at all** — it is not a chat endpoint.

    Full model table: [Image and video generation models](/en/api-capabilities/image-video-models).
    Per-model endpoint, timeout and output-format differences:
    [Image API notes and best practices](/en/api-capabilities/image-api-best-practices).
  </Accordion>

  <Accordion title="B. Gemini image family — the only one that natively returns text and image together">
    The Nano Banana series (`gemini-3-pro-image`, `gemini-3.1-flash-image` and so on) uses the native Gemini endpoint,
    and `candidates[0].content.parts` is a **heterogeneous array**: it may contain only an image part, or it may
    interleave text parts with image parts. This is the family that genuinely gives you both in one call.

    One trap to know up front: **neither the number of parts nor their order is guaranteed.** Three arrangements
    have been observed in testing:

    | parts structure       | Length | Image index |
    | --------------------- | ------ | ----------- |
    | `inlineData`          | 1      | `0`         |
    | `text` + `inlineData` | 2      | **`1`**     |
    | `inlineData` + `text` | 2      | **`0`**     |

    So hardcoding `parts[0]` or `parts[1]` **will fail intermittently**. The correct approach is to filter by field
    presence and take the **last** `inlineData` (for complex prompts the model returns several images, and the last
    one is the final version):

    ```python theme={null}
    cand = (resp.get("candidates") or [{}])[0]
    parts = (cand.get("content") or {}).get("parts") or []
    images = [p["inlineData"] for p in parts if "inlineData" in p]
    texts  = [p["text"] for p in parts if "text" in p]          # commentary lives here
    if not images:
        raise RuntimeError(f"No image returned, finishReason={cand.get('finishReason')}")
    final = images[-1]                                          # last image is the final one
    ```

    Full details: [Nano Banana series developer guide](/en/api-capabilities/nano-banana-dev-guide).
  </Accordion>

  <Accordion title="C. Responses native image_generation tool — let the agent decide whether to draw">
    Call `POST /v1/responses` with `gpt-5.5` and attach the native image tool:

    ```json theme={null}
    {
      "model": "gpt-5.5",
      "input": "Draw a key visual poster for a product launch event",
      "tools": [{ "type": "image_generation" }]
    }
    ```

    The model decides on its own whether to draw, and the image comes back as base64 inside an
    `image_generation_call` item in the response `output` array, alongside normal text output.
    **This is the closest thing to a "chat model that draws" on the OpenAI side.**

    <Warning>
      **The cost:** this route adds a fixed fee of roughly \$0.20 per image for the tool call, on top of
      usage-based billing, whereas route A's `/v1/images/generations` bills usage only. Use it only when your
      pipeline must run through Responses (for example an agent making autonomous draw / don't-draw decisions).
      If you just want a picture, use route A.
    </Warning>

    See [Native tool image generation](/en/api-capabilities/gpt-image-2/responses-image-tool).
  </Accordion>

  <Accordion title="D. Chat endpoint on an image model — looks conversational, still an image model">
    `gpt-image-2-all` and `gpt-image-2-vip` can be called through `/v1/chat/completions`, with the image embedded
    as a Markdown link inside `choices[0].message.content`.

    It looks like "one chat endpoint that both talks and draws", but **it is not a chat model that can draw** —
    underneath it is still an image model wrapped in a chat schema, with no general conversational ability.
    It also **only reads the `image_url` in the last `user` message** as the base image; images in assistant
    history are ignored.

    This route is **no longer recommended** — new integrations should use route A.
  </Accordion>
</AccordionGroup>

## Building a "chat and draw" product: the recommended shape

What most agents and products actually need is not one magic endpoint but a clear orchestration chain:

<Steps>
  <Step title="Let the chat model classify intent">
    Use the chat model you already use (`gpt-5.5`, `claude-opus-5`, `gemini-3-pro` and so on) to process user
    input and decide whether this turn is conversation or an image request. Have it return a structured flag
    if that helps.
  </Step>

  <Step title="Have the chat model write the image prompt">
    This step pays for itself. The user says "make me a poster"; the image model needs a complete visual
    description. Letting the chat model rewrite a casual request into a well-formed prompt makes output
    quality noticeably more consistent.
  </Step>

  <Step title="Call the image endpoint">
    Use route A's `/v1/images/generations`. Take the returned `url` or `b64_json` and store it in your own
    object storage.
  </Step>

  <Step title="Feed the image back into the conversation">
    Append the image link as an assistant message in the conversation history. To the user it reads as
    "chatting and drawing in one flow".
  </Step>
</Steps>

<Tip>
  The practical benefits of splitting it this way: each model can be swapped independently (changing the image
  model does not touch your conversation logic), billing is clearly separated in your logs, and
  **either step can be retried on its own** instead of replaying the whole turn.
</Tip>

## How to confirm whether a model accepts images

<Steps>
  <Step title="1. Check the model detail page">
    Open `/models/<model-name>` and look at the **Input modalities** row in the spec table at the top — if it
    lists "image", the model supports vision. This is the fastest check.
  </Step>

  <Step title="2. When in doubt, test it">
    Send a minimal request with an image and look at the response:

    ```bash theme={null}
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "the-model-you-are-testing",
        "messages": [{
          "role": "user",
          "content": [
            {"type": "text", "text": "What is in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/test.jpg"}}
          ]
        }]
      }'
    ```
  </Step>

  <Step title="3. Recognize the error string">
    Text-only models fail explicitly. The upstream message is `Model do not support image input`
    (the grammar is theirs, not a typo). When you see that line, the model does not accept images — switch models.
  </Step>
</Steps>

<Warning>
  **Known text-only exceptions (as of 2026-08-20):** `deepseek-v4-pro`, `deepseek-v4-flash`, `glm-5.2`.

  These are the minority of "modern model that still does not take image input", and they catch people out.
  **This list changes as the model catalog changes** — capabilities also differ between generations from the same
  vendor. Always treat the "Input modalities" row on the model detail page and your own test result as the source
  of truth, rather than treating this list as permanent.
</Warning>

## Five common misconceptions

<AccordionGroup>
  <Accordion title="1. A multimodal model can generate images">
    **False.** In an API context, multimodal defaults to **input-side** capability. `gpt-5.5` can read the design
    mockup you send it, but it cannot emit an image on its own — to get one you need a tool call (route C) or a
    separate call to an image endpoint (route A).
  </Accordion>

  <Accordion title="2. An image model can be used as a chat model">
    **False.** Image models have no general conversational ability — do not put `gpt-image-2` behind a support
    chatbot. Even the `-all` / `-vip` variants that accept the chat endpoint (route D) are still image models
    underneath.
  </Accordion>

  <Accordion title="3. Including TEXT in responseModalities guarantees a text part">
    **The reverse does not hold.** Declaring `responseModalities: ["TEXT", "IMAGE"]` does **not** guarantee a text
    part in the response; the model may return only an image. The other direction is useful though: declaring
    `["IMAGE"]` explicitly reduces stray text parts.
  </Accordion>

  <Accordion title="4. Switching between parts[0] and parts[1] fixes broken image extraction">
    **It does not.** The two hardcoded-index approaches are **complementary** — the image always lands at `[0]`
    or `[1]`, so whichever you pick, some requests will miss it. Changing the index only swaps which requests
    fail. **Only filtering by field presence is stable.**
  </Accordion>

  <Accordion title="5. Passing a reference image to /v1/images/generations performs an edit">
    **False, and it fails silently.** Grok Imagine is the clearest example: passing `image` / `image_url` /
    `images` to the generation endpoint **returns 200 with a normal image, but the reference image is silently
    discarded and you are billed as usual** — what you get back is a plain text-to-image result.

    Image editing must go through `/v1/images/edits` (and Grok Imagine additionally requires
    `multipart/form-data` there — sending JSON returns a hard 400).
  </Accordion>
</AccordionGroup>

## Related documentation

<CardGroup cols={2}>
  <Card title="Vision (image understanding) API" icon="eye" href="/en/api-capabilities/vision-understanding">
    The full guide to the input side: supported models, URL vs base64, multi-image input, common errors
  </Card>

  <Card title="Image and video generation models" icon="palette" href="/en/api-capabilities/image-video-models">
    The full output-side model table with pricing — the place to check which models can generate images
  </Card>

  <Card title="Nano Banana series developer guide" icon="banana" href="/en/api-capabilities/nano-banana-dev-guide">
    How to call the Gemini image family correctly: parts traversal, multi-image output, mimeType handling
  </Card>

  <Card title="Native tool image generation" icon="wand-sparkles" href="/en/api-capabilities/gpt-image-2/responses-image-tool">
    Using the Responses image\_generation tool so the model draws on its own, including the extra tool-call fee
  </Card>

  <Card title="Image API notes and best practices" icon="list-checks" href="/en/api-capabilities/image-api-best-practices">
    Endpoint, timeout and output-format matrix across the image models
  </Card>

  <Card title="How to choose the right AI model?" icon="compass" href="/en/faq/model-selection-guide">
    Model selection by use case, cost, and speed
  </Card>
</CardGroup>
