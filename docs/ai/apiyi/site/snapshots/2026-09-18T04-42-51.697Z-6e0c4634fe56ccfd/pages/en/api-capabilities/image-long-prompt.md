> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Long Prompts and Two-Stage Generation: Where the 32K Limit Comes From

> A customer asked why our prompt is capped at 32K when ChatGPT is not. 32,000 characters is the official OpenAI Images API limit, counted in characters, not tokens; the web app takes long material because the chat model distills it first. Covers the limit, the cost, why longer does not mean better adherence, and a two-stage pipeline: material into a text model, prompt into the image model.

"Your prompt length is different from ChatGPT's, it seems capped at 32K." That 32K is not something APIYI adds. It is the official limit of the OpenAI Images API, and it is counted in **characters**, not tokens. But the real question is not "can I send 32K", it is **whether 32K of raw material should go to the image model at all**. This page explains where the limit comes from, why the web app looks unlimited, the two costs of a long prompt, and how to organise prompts for requirement-heavy jobs like ad creatives.

## The customer's question: why does the API cap at 32K when ChatGPT does not?

The exchange, anonymised:

> Customer: Your prompt length is different from ChatGPT's. Looks like it is capped at 32K.
> Us: There is a limit. Who has an image job with a 32K prompt?
> Customer: Plenty. Ad creatives, packaging dimensions... I will just call codex cli myself.
> Us: To confirm, a 32,000-token prompt?
> Customer: Yes. 32,000 in English is not long at all.

Three different concepts are tangled here. Separate them first:

| Concept            | What it is                                   | In this case                                                                                            |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Characters**     | Length of the prompt string                  | Images API limit: **32,000 characters**                                                                 |
| **Tokens**         | The unit the model bills and reads in        | 32,000 English characters is roughly 8K tokens; Chinese uses more tokens per character                  |
| **Context window** | Everything a text model can hold in one call | Text models take hundreds of thousands to a million tokens; unrelated to the image model's prompt limit |

"32,000 in English is not long" is a statement about characters, and it is fair. But the ChatGPT web app the customer compares against does not go through the same path at all.

## Where the 32K limit comes from

The official OpenAI Images API limit on the `prompt` field (same for `/v1/images/generations` and `/v1/images/edits`):

| Model                                                                           | Prompt limit | Unit       |
| ------------------------------------------------------------------------------- | ------------ | ---------- |
| gpt-image family (including `gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`) | **32,000**   | characters |
| DALL·E 3                                                                        | 4,000        | characters |
| DALL·E 2                                                                        | 1,000        | characters |

Source: OpenAI API reference, `developers.openai.com/api/reference/resources/images/methods/generate`.

<Info>
  APIYI's official relay does not tighten this limit further. Above 32,000 characters the provider returns 400; the exact error text is the provider's, and this page did not probe the boundary byte by byte. If you need the precise cut-off, one call with your own key will tell you, and rejected requests are not billed.
</Info>

**Characters are not tokens.** Billing and model comprehension both run on tokens, and `usage.input_tokens_details.text_tokens` reports the text tokens actually consumed per call. The same 32,000 characters is about 8K tokens in English and noticeably more in Chinese, where each character maps to more tokens and also carries more information. So "32K English is short" and "32K Chinese is long" can both be true.

## Why the ChatGPT web app looks unlimited

Same point as [How to Get Satisfying Images](/en/api-capabilities/image-generation-success-tips) and [Safety Rejections](/en/api-capabilities/image-safety-troubleshooting): **the web app is an agent, the API is a single atomic call**.

* Paste a long document into ChatGPT and the reader is the chat model, not the image model. Having read it, the chat model **writes its own short image prompt** and calls the image tool with that. The image model never sees the original material. Pastes over 10,000 characters are even turned into attachments automatically (OpenAI Help Center, `help.openai.com`), which makes it plain that the text is for the chat model.
* Through the API you talk to the image model directly. Nobody reads the material and makes choices for you in between. The limit belongs to the image model layer, and the web app never exposes the image model to it.
* The customer's parting line, "I will just call codex cli myself", is the right instinct: have a text model read the material and produce the image prompt. That is exactly what the web app does behind the scenes, and the two-stage pipeline below makes it runnable.

## The two costs of a long prompt

Money first, then results.

**Money**: text input on the gpt-image family is billed per token (\$5.00 per million tokens on `gpt-image-2.5`, see the [overview pricing table](/en/api-capabilities/gpt-image-2/overview)). A 32,000-character English prompt is about 8K tokens, roughly \$0.04 per call; Chinese costs more. Small on its own, but multiply by the number of images, and every retry pays it again. When 90% of the prompt is raw material rather than scene description, most of that spend buys nothing.

**Results**: more detail does not mean better adherence. Put hundreds of requirements in front of an image model at once and they compete; the hard constraints that actually matter (logo not distorted, packaging text exact, number of people) are the ones that get buried. OpenAI's own guidance for image prompts is to start with one to three clear sentences and then add the necessary composition, lighting and hard constraints (`openai.com/academy/image-generation`). What the image model needs is **information density with clear priorities**, not word count.

So "professional ads have many requirements" is true, but **detailed is not the same as long**. The six elements in [Advanced Image Generation](/en/api-capabilities/image-advanced-workflow) and the "do not pad the prompt with adjectives" rule in the [Image Prompt Doctor Skill](/en/api-capabilities/image-prompt-doctor) say the same thing.

## Two stages: material into a text model, prompt into the image model

When there really is 32K of material behind an image job, it is usually a brand book, packaging spec, ad brief or character bible. That material should go to a text model first, which distills it into one dense prompt for the image model:

| Stage      | Input                                              | Model                          | Output                                           |
| ---------- | -------------------------------------------------- | ------------------------------ | ------------------------------------------------ |
| ① Distill  | Brand book / packaging spec / ad brief, any length | A text model such as `gpt-5.6` | A structured image prompt of 1K to 3K characters |
| ② Generate | The prompt from stage ① (far below 32K)            | `gpt-image-2.5-sunburst`       | The image                                        |

The distillation output template adds three ad-specific sections on top of the six elements:

| Section                            | What goes in                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Hard constraints (first)**       | Logo not distorted, packaging text spelled out verbatim, number of people, aspect ratio, background colour value |
| **Purpose and placement**          | What kind of ad, where it runs, what the viewer should feel                                                      |
| **Subject and must-keep elements** | What the product is, which packaging elements must appear exactly                                                |
| **Composition and negative space** | Product position, people position, framing, blank area reserved for copy                                         |
| **Visual**                         | Setting, palette, lighting, materials, photographic style                                                        |
| **Do not**                         | What must not be added, what must not change                                                                     |

<Steps>
  <Step title="Hand the material to the text model as-is">
    Brand book, spec sheet, brief: no preprocessing needed, a text model's context is large enough. In the system prompt, spell out the output template, a character budget (2,500 characters or less is a good target) and "hard constraints first".
  </Step>

  <Step title="Run the prompt through a length gate">
    Check `len(prompt)`; if it exceeds 32,000, have the text model compress once more. A distilled prompt is normally one or two thousand characters, so this step is a safeguard.
  </Step>

  <Step title="Store the prompt, then call the image model">
    Persist the distilled prompt and replay only that for generation. Retries, size changes and model swaps never re-read the material or pay tokens for it again.
  </Step>

  <Step title="When the material changes, re-run only stage one">
    Packaging redesign or brief update: re-distill. The generation code and parameters stay untouched.
  </Step>
</Steps>

Minimal implementation (OpenAI SDK, both stages share one key):

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

DISTILL_SYSTEM = """You are an ad-creative prompt engineer. Read all the material the user provides and output one prompt that can be sent directly to an image model.

Write in this order, one line per section:
1 Hard constraints: logo not distorted, packaging text verbatim, number of people, aspect ratio, background colour value
2 Purpose and placement
3 Subject and packaging elements that must be kept
4 Composition and negative space: product position, people position, framing, area reserved for copy
5 Visual: setting, palette, one identifiable key light, materials, photographic style
6 Do not

Rules:
- At most 2500 characters. Output only the prompt body, no explanation, no headings
- Do not invent anything absent from the material, especially brand names and packaging text
- Do not use vague quality words such as 8K, ultra HD, masterpiece, perfect
- Keep anything the material specifies explicitly, do not rewrite it"""

PROMPT_LIMIT = 32000  # OpenAI Images API prompt limit, in characters


def distill(brief: str, model: str = "gpt-5.6") -> str:
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": DISTILL_SYSTEM},
            {"role": "user", "content": brief},
        ],
    )
    prompt = resp.choices[0].message.content.strip()
    if len(prompt) > PROMPT_LIMIT:
        # rare; compress one more round if it happens
        prompt = distill(f"Compress the following prompt to under 2500 characters, keeping every hard constraint:\n\n{prompt}", model)
    return prompt


def generate(prompt: str, size: str = "1536x1024", quality: str = "high") -> bytes:
    import base64
    resp = client.images.generate(
        model="gpt-image-2.5-sunburst",
        prompt=prompt,
        size=size,
        quality=quality,
        timeout=600,
    )
    return base64.b64decode(resp.data[0].b64_json)


if __name__ == "__main__":
    brief = open("brief.md", encoding="utf-8").read()   # brand book + packaging spec + ad requirements, any length
    prompt = distill(brief)
    open("prompt.txt", "w", encoding="utf-8").write(prompt)   # persist; generation replays only this
    open("ad.png", "wb").write(generate(prompt))
```

<Tip>
  Archiving the distilled prompt together with the generation parameters is the **only reliable way to reproduce** on this product line (the GPT-Image family exposes no seed). See section 5 of [Advanced Image Generation](/en/api-capabilities/image-advanced-workflow).
</Tip>

## When a long prompt is genuinely needed

A few cases do make prompts longer, but none of them get anywhere near 32K:

* **Multi-image editing**: refer to reference images as "image 1 / image 2 / image 3" and say what to take from each. A few hundred characters.
* **Text inside the image**: signage, posters, packaging copy must be given verbatim rather than left to the model. Tens to hundreds of characters.
* **A shared prefix for a series**: the style, lighting and composition block common to a batch. Under a thousand characters.

Together these usually add up to two or three thousand characters. If a prompt is approaching 32K, suspect that raw material has been pasted in.

## Quick reference

* **32,000 characters is the official OpenAI Images API limit**, counted in characters not tokens, identical for `/generations` and `/edits`; APIYI's official relay does not tighten it.
* **Characters, tokens and context window are three different things**: 32K English is about 8K tokens, Chinese is more; a text model's context window has nothing to do with the image model's prompt limit.
* **"No limit" on the web app is an illusion**: the chat model reads the material and writes its own short prompt for the image tool; the image model never faces the 32K.
* **Detailed is not long**: text input is billed per token and every retry pays again; hundreds of competing requirements bury the hard constraints.
* **Two stages**: distill the material with a text model into a 1K to 3K character structured prompt, hard constraints first, persist it, and replay only the prompt for generation.

## Related docs

* [How to Get Satisfying Images](/en/api-capabilities/image-generation-success-tips)
* [Safety Rejections](/en/api-capabilities/image-safety-troubleshooting)
* [Advanced Image Generation: Workflow and Realism](/en/api-capabilities/image-advanced-workflow)
* [Image Prompt Doctor Skill](/en/api-capabilities/image-prompt-doctor)
* [Text-to-Image API Reference](/en/api-capabilities/gpt-image-2/text-to-image)
