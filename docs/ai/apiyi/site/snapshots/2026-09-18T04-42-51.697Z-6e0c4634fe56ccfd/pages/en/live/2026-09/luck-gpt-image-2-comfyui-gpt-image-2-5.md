> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Community node update: Luck GPT-Image 2 ComfyUI nodes now support gpt-image-2.5

> Community author luckdvr updated Comfyui-Luck-gpt2.0 on 2026-09-10: the official node's model dropdown adds gpt-image-2.5-flare and gpt-image-2.5-sunburst (with dated snapshots), quality grows to six tiers, and it supports 16 reference images and mask inpainting; old workflows do not switch on their own. Our docs page has been rewritten to match, adding the vip node and three prompt-control nodes.

**2026/9/15 01:11 (UTC+8)** · Docs Update · OpenAI

🧩 **The community ComfyUI pack `Comfyui-Luck-gpt2.0` now supports `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`, and our docs page has been rewritten to match**

Author luckdvr updated the plugin on 2026-09-10: the official node `Comfyui-Luck gpt-image-2` adds both 2.5 models and their `-2026-09-08` dated snapshots to the `model (模型)` dropdown, `quality` grows to six tiers (new `xhigh` / `max`), and the node takes up to 16 reference images plus a mask for inpainting. Node names, IDs and the default model `gpt-image-2` are unchanged, so **existing workflows do not switch on their own**. When moving to 2.5, do not carry `quality` over unchanged: 2.5 `high` maps to the old `medium`, and only `max` maps to the old `high`.

The docs page had been stuck on April's two-node version. It is now rewritten against the current plugin: the `gpt-image-2-vip` node, three prompt-control nodes (default `gemini-3.5-flash`), a five-model table, a 2.5 quality migration table and the new example workflow. Repo: `github.com/luckdvr/Comfyui-Luck-gpt2.0`.

📄 Docs: [Luck GPT-Image 2 - ComfyUI Nodes](/en/scenarios/ecosystem/luckgpt2-comfyui)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
