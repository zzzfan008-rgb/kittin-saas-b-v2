> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Codex Integration for GPT-Image Fails with Incorrect API Key

> Codex wrote gpt-image-2.5 code that hits OpenAI, so your APIYI key is rejected. Fix it with the Skills, the model page prompt, or the web image tool.

## The Error

```text theme={null}
Authentication failed
Incorrect API key provided: sk-xxxx****************************A6Af.
You can find your API key at https://platform.openai.com/account/api-keys.
(Request ID: req_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

<Info>
  **In one sentence**: this error is returned by **OpenAI's own servers**, not by APIYI. Your code is currently calling `api.openai.com`, so OpenAI rejects the APIYI key. **The key is fine. The request address is wrong.**
</Info>

## How to Tell the Request Never Reached APIYI

Either of these two signs settles it:

| Sign                                                           | Meaning                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| The error points you to `platform.openai.com/account/api-keys` | This is OpenAI's standard `invalid_api_key` text. APIYI errors never send you to OpenAI's website   |
| The request ID is a 32-character string starting with `req_`   | OpenAI's request ID format. You will not find it in APIYI's logs, because the request never arrived |

<Note>
  This is especially common when you ask an AI coding assistant to write the integration. Codex, Cursor, Claude Code and friends see the model name `gpt-image-2.5`, default to the official OpenAI SDK pattern, and leave `base_url` at the SDK default `https://api.openai.com/v1`. The key you paste in is APIYI's. The two do not match.
</Note>

## Three Fixes, Pick by Situation

<Tabs>
  <Tab title="① Using Codex / a coding Agent: install the Skills">
    The lowest-effort path is to let the Agent "learn" APIYI before it writes code. Two levels of skill packs are available:

    <Steps>
      <Step title="Site-wide skill pack (install this first)">
        Have your Agent run the command below to install the APIYI skill pack. If that fails, tell it to read `https://docs.apiyi.com/skill.md` directly:

        ```bash theme={null}
        npx skills add https://docs.apiyi.com
        ```

        This file is written for AI: base URLs, authentication, model naming rules and common pitfalls. Once installed, the code it writes will point `base_url` at `https://api.apiyi.com/v1` automatically.
      </Step>

      <Step title="Dedicated GPT-Image skill">
        The [GPT-Image-2.5 / 2 Series Agent Skill](/en/api-capabilities/gpt-image-2/skills) page ships a ready-to-use Skill: two files and one script covering six models including `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`, switched with `--model`. Text-to-image, multi-image fusion and inpainting are all included.

        Drop it into Codex, OpenClaw, Claude Code or any coding Agent that can run shell commands, then just say "generate an image of..." You never touch the base URL yourself.
      </Step>
    </Steps>

    <Tip>
      Other image and video models each have an "Agent Skill" page too, filed under that model's documentation folder. Find the model in the left navigation and look for a sub-page named "Agent Skill".
    </Tip>
  </Tab>

  <Tab title="② Not a coder: hand the prompt to your AI">
    If you would rather not learn what a Skill is, copy our ready-made **integration prompt** to Codex, Claude Code, Cursor or any AI assistant:

    1. Open the [GPT-Image-2.5 / 2 Overview](/en/api-capabilities/gpt-image-2/overview)
    2. Find the "Let an AI Agent Do the Integration" section and click the copy button on the prompt
    3. Paste it into your AI coding assistant as is

    The prompt already hard-codes `base_url` as `https://api.apiyi.com/v1`, reads the key from the `APIYI_API_KEY` environment variable, and pre-empts the usual traps around timeouts, base64 rendering, upload compression and quality parameters. The AI fetches the plain-text version of the docs page first (append `.md` to any docs URL) and then writes code for your project's stack.

    <Note>
      Every image and video model overview page carries a prompt like this, not only GPT-Image. For the more general three paths (chat Agent, CLI, coding Agent) see the [AI Developer Kit](/en/developer-kit).
    </Note>
  </Tab>

  <Tab title="③ No integration needed: generate on the web">
    If you only need images and do not need them inside your own program yet, skip the code entirely:

    1. Copy a key from the "Tokens" page in the APIYI console
    2. Open `imagen.apiyi.com` and paste the key
    3. Pick `gpt-image-2.5-flare` (text-to-image) or `gpt-image-2.5-sunburst` (editing) and generate

    The web tool uses the same key and the same API, billed against the same account balance. When you later need it in your app, come back to the first two paths.
  </Tab>
</Tabs>

## Fix It Yourself: One Line

If you already have code generated by Codex, the minimal change is adding `base_url` to the client. Leave everything else untouched:

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",
      base_url="https://api.apiyi.com/v1",  # ← add this line
  )

  result = client.images.generate(
      model="gpt-image-2.5-flare",
      prompt="A shiba inu wearing an astronaut helmet, cyberpunk style",
      size="1024x1024",
      quality="medium",
  )
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: "sk-your-apiyi-key",
    baseURL: "https://api.apiyi.com/v1", // ← add this line
  });

  const result = await client.images.generate({
    model: "gpt-image-2.5-flare",
    prompt: "A shiba inu wearing an astronaut helmet, cyberpunk style",
    size: "1024x1024",
    quality: "medium",
  });
  ```

  ```bash Environment variables theme={null}
  # Override the SDK default without touching code
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```
</CodeGroup>

Then confirm the request actually reaches APIYI. A model list in the response means you are done:

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

## Follow-up Questions

<AccordionGroup>
  <Accordion title="I changed base_url but still get the same error. Why?">
    Check in this order:

    1. **Multiple config locations**: Codex-generated projects often set the URL in `.env`, a config file and the client constructor. Changing one leaves the others at the default
    2. **Environment variable precedence**: if `OPENAI_BASE_URL` is already set to something else on your system, it overrides whatever the code omits. Run `echo $OPENAI_BASE_URL` to check
    3. **No restart**: the running process still holds the old config
    4. **Spelling**: `apiyi`, not `apiyii` or `apiyl`

    The simplest proof is the error text itself. As long as `platform.openai.com` still appears, the request is still going to OpenAI.
  </Accordion>

  <Accordion title="Codex says it already switched to APIYI, but the error is unchanged.">
    Send it the exact error together with this page. Every docs page has a "Copy page" button in the top-right corner. Paste the page content plus the error into the AI and it can pinpoint which config did not take effect. This is the fastest troubleshooting path.
  </Accordion>

  <Accordion title="What if the key is still rejected after the request reaches APIYI?">
    Only then is it time to check the key itself: open the "Tokens" page in the console and confirm the key is enabled, the balance is sufficient and no model whitelist blocks it. Full checklist in [Why is my API Key invalid?](/en/faq/invalid-api-key).
  </Accordion>

  <Accordion title="Which model name should I use for gpt-image-2.5?">
    Default to `gpt-image-2.5-flare` for text-to-image and `gpt-image-2.5-sunburst` for editing and inpainting. Both share the same price and parameters. For high-volume, low-cost work use the reverse channel `gpt-image-2.5-all`. The comparison table on the [GPT-Image Series Agent Skill](/en/api-capabilities/gpt-image-2/skills) page covers all six.
  </Accordion>
</AccordionGroup>

## Related

<CardGroup cols={2}>
  <Card title="Why is my API Key invalid?" icon="key" href="/en/faq/invalid-api-key">
    Why base URL and key must match, with examples in every language.
  </Card>

  <Card title="How to configure Base URL?" icon="link" href="/en/faq/base-url-config">
    /v1 for OpenAI, root domain for Claude, /v1beta for Gemini.
  </Card>

  <Card title="Is there one-click integration?" icon="plug" href="/en/faq/one-click-integration">
    Hand the docs to your AI coding assistant and let it do the integration.
  </Card>

  <Card title="GPT-Image-2.5 / 2 Overview" icon="sparkles" href="/en/api-capabilities/gpt-image-2/overview">
    Parameters, pricing, integration prompt and common errors.
  </Card>
</CardGroup>
