> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX Historical Versions

> FLUX.1 [pro] / [pro] 1.1 / [pro] 1.1 Ultra / [dev] specs, pricing, and migration guidance to FLUX.2

<Note>
  This page covers FLUX.1 \[pro] text-to-image models that are **still callable** on APIYI. The latest FLUX.2 generation and the editing-focused FLUX.1 Kontext are documented in the [FLUX Overview](/en/api-capabilities/flux/overview).
</Note>

## Version Snapshot

| Model ID             | Released (UTC+0) | APIYI Price | Status        | Best For                               |
| -------------------- | ---------------- | ----------- | ------------- | -------------------------------------- |
| `flux-pro-1.1-ultra` | 2024-11          | \$0.0500    | 🟡 Maintained | Legacy ultra-resolution (4MP)          |
| `flux-pro-1.1`       | 2024-10          | \$0.0350    | 🟡 Maintained | Legacy text-to-image baseline          |
| `flux-pro`           | 2024-08          | \$0.0400    | 🟡 Maintained | First-gen pro, legacy compat           |
| `flux-dev`           | 2024-08          | \$0.0200    | 🟡 Maintained | Dev/test, open-weights local inference |

<Tip>
  **For new projects, prefer FLUX.2**: `flux-2-pro` matches `flux-pro-1.1`'s tier with major upgrades in quality, multi-reference, long prompts, and 4MP output — at similar or lower cost. See migration guidance below.
</Tip>

## Per-Version Specs

### `flux-pro-1.1-ultra`

* **Released**: 2024-11 (UTC+0)
* **APIYI Price**: \$0.0500 (official \$0.06, saves 17%)
* **Max output**: \~4MP (highest in FLUX.1 series)
* **Key features**: Ultra-resolution, optional raw mode (closer to candid photography)
* **Known limits**: Single reference only, no hex color control, no grounding search
* **Official docs**: `docs.bfl.ai/flux_models/flux_1_1_pro_ultra_raw`

### `flux-pro-1.1`

* **Released**: 2024-10 (UTC+0)
* **APIYI Price**: \$0.0350 (official \$0.04, saves 12.5%)
* **Max output**: \~1.6MP (e.g., 1024×1536)
* **Key features**: Improved quality and prompt adherence over 1.0, industry baseline
* **Known limits**: Single reference, short prompts (no 32K)
* **Official docs**: `docs.bfl.ai/flux_models/flux_1_1_pro`

### `flux-pro`

* **Released**: 2024-08 (UTC+0)
* **APIYI Price**: \$0.0400 (official \$0.04, same)
* **Max output**: \~1.6MP
* **Key features**: BFL's first commercial pro, baseline text-to-image
* **Known limits**: Quality and adherence below 1.1 — no reason for new projects

### `flux-dev`

* **APIYI Price**: \$0.0200
* **Max output**: \~1MP
* **Key features**: Open-weights variant (FLUX.1 \[dev], non-commercial license), self-host on your own GPU
* **Known limits**: Quality below the \[pro] tier, mainly for research, prototyping, local inference validation
* **Official weights**: `huggingface.co/black-forest-labs/FLUX.1-dev`

## Migration Guidance

<Steps>
  <Step title="Assess differences">
    FLUX.2 fully supersedes FLUX.1 \[pro]: 4MP output (vs 1.6MP), up to 8 multi-references (vs 1), 32K-token prompts (vs short), native hex color control, typography specialist tier. Pricing within 1MP is similar or lower.
  </Step>

  <Step title="Run side-by-side">
    Generate the same prompt set on `flux-pro-1.1` and `flux-2-pro` for a week. Compare text legibility, multi-object consistency, brand color fidelity. FLUX.2 \[pro] wins across the board in most cases.
  </Step>

  <Step title="Roll out gradually">
    Cut 10% of traffic to `flux-2-pro` first, observe quality and cost for a week, then ramp to 100%. Costs are roughly equivalent at 1MP and noticeably cheaper at 4MP.
  </Step>

  <Step title="Handle parameter differences">
    Most parameters carry over, but note:

    * FLUX.1 \[pro] takes a single reference image; FLUX.2 supports multiple references (JSON fields `input_image` \~ `input_image_8`, up to 8)
    * FLUX.1 doesn't support `prompt_upsampling`; FLUX.2 \[pro/max/flex] does
    * Some legacy aspect-ratio identifiers (e.g., `aspect_ratio`) are replaced by `width`/`height` or the `size` string in FLUX.2
  </Step>
</Steps>

## Legacy Call Example

```python theme={null}
{/* Call any historical version by changing only the model field — all other params are OpenAI Images API compatible */}
from openai import OpenAI
import requests

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="flux-pro-1.1-ultra",
    prompt="A serene mountain landscape at golden hour, raw photo style",
    size="2048x1536"
)

# data[0].url is valid for only 10 minutes
url = resp.data[0].url
with open("legacy.jpg", "wb") as f:
    f.write(requests.get(url, timeout=30).content)
```

## Cost Comparison

By typical volume (flat per-image price):

| Version                | APIYI Price | 100 images | 1,000 images | 10,000 images |
| ---------------------- | ----------- | ---------- | ------------ | ------------- |
| `flux-pro-1.1-ultra`   | \$0.05      | \$5.00     | \$50.00      | \$500.00      |
| `flux-pro-1.1`         | \$0.035     | \$3.50     | \$35.00      | \$350.00      |
| `flux-pro`             | \$0.04      | \$4.00     | \$40.00      | \$400.00      |
| `flux-dev`             | \$0.02      | \$2.00     | \$20.00      | \$200.00      |
| **`flux-2-pro` (new)** | **\$0.03**  | **\$3.00** | **\$30.00**  | **\$300.00**  |
| **`flux-2-max` (new)** | **\$0.07**  | **\$7.00** | **\$70.00**  | **\$700.00**  |

<Info>
  **How to choose**: For new projects, prefer FLUX.2 (`flux-2-pro` for general use, `flux-2-max` for flagship). Keep FLUX.1 \[pro] running only when legacy integrations are deeply wired and regression testing is impractical. `flux-dev` remains a viable low-cost dev/test option.
</Info>

## Related Docs

* [FLUX Overview](/en/api-capabilities/flux/overview) — full model matrix and selection
* [Text-to-Image Playground](/en/api-capabilities/flux/text-to-image) — works for FLUX.2 + FLUX.1
* [Image Editing Playground](/en/api-capabilities/flux/image-edit) — multi-reference fusion + edit
