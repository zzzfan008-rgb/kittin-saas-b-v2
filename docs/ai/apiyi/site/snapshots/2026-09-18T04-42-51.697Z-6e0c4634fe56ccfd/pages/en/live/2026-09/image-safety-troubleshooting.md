> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image call returns safety_violations=[sexual] on a non-explicit prompt? New Safety Rejections guide

> New Safety Rejections troubleshooting doc. On gpt-image models the sexual block usually happens after the image is rendered: failed calls take as long as successful ones, the same prompt passes sometimes and fails sometimes, and moderation: low does not help. A 20-call word ablation found the trigger; adding one clothing phrase to the unchanged prompt passed 3 of 3.

**2026/9/14 23:56 (UTC+8)** · Docs Update · OpenAI

📚 **When the safety system blocks an image call, the prompt is usually not the violation; one word pushed the rendered image over the line**

A real ticket: `gpt-image-2.5-sunburst` generating a character sheet ("glamorous woman + full-body turnaround + white background") consistently returned 400 `safety_violations=[sexual]` through the API, while the ChatGPT web app rendered it. Failed calls took 42 to 51 seconds versus 46 to 57 for successful ones, so the image was rendered first and then rejected by an output-side classifier. That is why the same prompt passes sometimes and fails sometimes, and why `moderation: low` does nothing here. The web app passes because its chat model rewrites and expands the prompt first (adding clothing and setting); the API sends it verbatim.

A word ablation, changing one block per variant and running variants in parallel, pinpointed the trigger word ("glamorous") in 20 calls. **Leaving the prompt untouched and adding one phrase, "wearing a beige turtleneck sweater and dark trousers", passed 3 of 3** with the look and layout unchanged.

The full case, the latency-based layer test, the 20-call ablation log and a general checklist are in the new Safety Rejections page: `/en/api-capabilities/image-safety-troubleshooting`. The `gpt-image-2` overview FAQ and error table have been updated to match.

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)
