> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-All Agent Skill

> Use gpt-image-2-all (reverse, ChatGPT line — fastest, flat $0.03/image) inside your Agent. It shares the one gpt-image-2 skill with gpt-image-2 and gpt-image-2-vip; just set --model to gpt-image-2-all.

<Note>
  **gpt-image-2-all does not need its own skill.** It shares the single **gpt-image-2 series skill** with gpt-image-2 (official) and gpt-image-2-vip — all three use the same OpenAI Images API; only `--model` differs. For the full install, `SKILL.md`, and script, see [**GPT-Image-2 Series Agent Skill**](/en/api-capabilities/gpt-image-2/skills).
</Note>

## What this model is good for

<CardGroup cols={3}>
  <Card title="Fastest" icon="bolt">
    Reverse ChatGPT line, \~30–60s — the fastest of the three channels.
  </Card>

  <Card title="Cheapest" icon="piggy-bank">
    Flat \$0.03/image regardless of size/quality — great for volume.
  </Card>

  <Card title="T2I / fusion" icon="layers">
    Text-to-image and up to 16-image fusion (no mask inpainting).
  </Card>
</CardGroup>

## How to use it in the skill

After installing the [gpt-image-2 series skill](/en/api-capabilities/gpt-image-2/skills), set `--model` to `gpt-image-2-all`:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Flat-illustration festival poster, portrait 2:3" -o poster.png --model gpt-image-2-all
```

To make it the default channel (no `--model` each time), add a line to `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Warning>
  **Red lines**: gpt-image-2-all does **not accept `size` / `quality` / `n`** —

  * put size/ratio **in the prompt** (e.g. "portrait 2:3", "16:9 banner"); a passed `size` is ignored or errors;
  * passing `n>1` **still returns only 1 image but bills per count**.

  The skill script already omits `size`/`quality`/`n` for this model, so normal use of `--model gpt-image-2-all` is safe; only watch out if you hand-craft requests outside the script. For locked size/4K use [`gpt-image-2-vip`](/en/api-capabilities/gpt-image-2-vip/skills); for quality tiers / mask use official `gpt-image-2`.
</Warning>

## Related docs

* [GPT-Image-2 Series Agent Skill (main page · full script)](/en/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-VIP Agent Skill](/en/api-capabilities/gpt-image-2-vip/skills)
* [GPT-Image-2-All Image Generation overview](/en/api-capabilities/gpt-image-2-all/overview)
