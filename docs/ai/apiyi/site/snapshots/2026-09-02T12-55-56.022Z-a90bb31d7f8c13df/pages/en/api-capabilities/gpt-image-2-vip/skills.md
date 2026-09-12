> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-VIP Agent Skill

> Use gpt-image-2-vip (reverse, Codex line — lockable size/4K, flat $0.03/image) inside your Agent. It shares the one gpt-image-2 skill with gpt-image-2 and gpt-image-2-all; just set --model to gpt-image-2-vip.

<Note>
  **gpt-image-2-vip does not need its own skill.** It shares the single **gpt-image-2 series skill** with gpt-image-2 (official) and gpt-image-2-all — all three use the same OpenAI Images API; only `--model` differs. For the full install, `SKILL.md`, and script, see [**GPT-Image-2 Series Agent Skill**](/en/api-capabilities/gpt-image-2/skills).
</Note>

## What this model is good for

<CardGroup cols={3}>
  <Card title="Lockable size / 4K" icon="expand">
    Reverse Codex line, supports 30 `size` tiers (incl. 4K like 3840×2160) — controllable dimensions.
  </Card>

  <Card title="Cheapest" icon="piggy-bank">
    Flat \$0.03/image, all sizes same price, no 4K surcharge.
  </Card>

  <Card title="T2I / fusion" icon="layers">
    Text-to-image and up to 16-image fusion (no quality tiers / mask).
  </Card>
</CardGroup>

## How to use it in the skill

After installing the [gpt-image-2 series skill](/en/api-capabilities/gpt-image-2/skills), set `--model` to `gpt-image-2-vip` and lock the size with `--size`:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2-vip --size 3840x2160
```

To make it the default channel, add a line to `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-vip
```

<Warning>
  **Red lines**: gpt-image-2-vip does **not accept `quality` / `n`** and does **not support mask inpainting** (use official `gpt-image-2` for masks). Passing `n>1` still returns 1 image but bills per count. The skill script gates this automatically, so normal `--model gpt-image-2-vip` use is safe.

  Also: `size` is occasionally disabled upstream and forced to adaptive 1K; if so, also put the size/ratio **in the prompt** (e.g. "16:9") as a fallback.
</Warning>

## Related docs

* [GPT-Image-2 Series Agent Skill (main page · full script)](/en/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All Agent Skill](/en/api-capabilities/gpt-image-2-all/skills)
* [GPT-Image-2-VIP Image Generation overview](/en/api-capabilities/gpt-image-2-vip/overview)
