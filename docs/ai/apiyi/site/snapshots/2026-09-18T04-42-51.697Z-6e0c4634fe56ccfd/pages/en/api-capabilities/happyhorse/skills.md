> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse Video Agent Skill

> Use HappyHorse-1.1 (the quality-oriented Alibaba video model) inside your agent — it shares the wan skill with Wan2.7; just set --model happyhorse.

<Note>
  **HappyHorse does not need its own skill**. It shares the **wan video skill** with Wan2.7 — both series use the same endpoint, the same request structure, and the same `Wan&HappyHorse` token group; only the model IDs differ. For the full setup, `SKILL.md`, and script, see the [**Wan2.7 / HappyHorse Video Agent Skill**](/en/api-capabilities/wan/skills).
</Note>

## What this model is good for

<CardGroup cols={3}>
  <Card title="Quality-oriented" icon="sparkles">
    Same endpoint and usage as Wan2.7 with a stronger visual finish — for scenes where image quality matters most.
  </Card>

  <Card title="Up to 9 reference images" icon="images">
    Reference-to-video accepts up to 9 reference images (Wan2.7 caps combined references at 5).
  </Card>

  <Card title="One shared token" icon="key-round">
    A `Wan&HappyHorse` group token serves both series — switching costs nothing.
  </Card>
</CardGroup>

## Using it inside the skill

Once the [wan video skill](/en/api-capabilities/wan/skills) is installed, just set `--model happyhorse`:

```bash theme={null}
python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, golden forest, cinematic" --model happyhorse -o valley.mp4
```

The script picks the right model ID from the assets you pass (`happyhorse-1.1-t2v` / `-i2v` / `-r2v` / `happyhorse-1.0-video-edit`) — no need to memorize the names.

<Warning>
  **Red lines**: HappyHorse **does not support reference videos or audio driving** —

  * `--ref-video` is Wan2.7-only; the script rejects it for happyhorse up front;
  * image-to-video takes a first-frame image only, with no Wan2.7-style `driving_audio`;
  * pricing is roughly 1.5× Wan2.7 (720P \$0.126/s, 1080P \$0.224/s — about \$0.63 for a 5s 720P clip), so high-volume workloads should prefer the default `wan`.

  The skill script gates all of these differences automatically; normal use of `--model happyhorse` won't trip them.
</Warning>

## Related docs

* [Wan2.7 / HappyHorse Video Agent Skill (main page with the full script)](/en/api-capabilities/wan/skills)
* [HappyHorse Video Generation Overview](/en/api-capabilities/happyhorse/overview)
* [Seedance 2.0 Video Agent Skill](/en/api-capabilities/seedance2/skills)
