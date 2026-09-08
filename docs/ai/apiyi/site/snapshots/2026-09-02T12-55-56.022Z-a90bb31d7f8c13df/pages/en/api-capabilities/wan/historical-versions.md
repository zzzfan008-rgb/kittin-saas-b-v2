> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan Historical Versions (Wan2.6)

> Notes and migration guide for the Wan2.6 series (including wan2.6-r2v-flash): shares the same endpoint and schema as Wan2.7, so just change the model name to call it.

This page is for **users currently on Wan2.6**, explaining the differences between versions and the path to migrate to Wan2.7. New users should start from the [Wan Overview](/en/api-capabilities/wan/overview).

## Version overview

| Version    | Status                  | Endpoint / protocol                         | Recommended for                                                                                     |
| ---------- | ----------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Wan2.7** | ✅ Currently recommended | `/wan/api/v1/...video-synthesis`            | First choice for new integrations, most complete feature set (audio drive, multi-subject reference) |
| **Wan2.6** | 🟡 Maintenance          | Same as Wan2.7 (change only the model name) | Existing Wan2.6 code, or need the `r2v-flash` low-latency tier                                      |

<Info>
  Wan2.6 and Wan2.7 **share the same DashScope passthrough endpoint and the same request structure**. To migrate, **just change the `model` field from `wan2.6-*` to `wan2.7-*`** and leave the rest of the body untouched. Exact launch dates and the latest availability are authoritative in the [APIYI console](https://api.apiyi.com/token) model list.
</Info>

## Wan2.6 models

| Model ID           | Capability                            | Notes                                                                                                                    |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `wan2.6-t2v`       | Text-to-video                         | Corresponds to `wan2.7-t2v`                                                                                              |
| `wan2.6-i2v`       | Image-to-video                        | Corresponds to `wan2.7-i2v`                                                                                              |
| `wan2.6-r2v`       | Reference-to-video                    | Corresponds to `wan2.7-r2v`                                                                                              |
| `wan2.6-r2v-flash` | Reference-to-video (low-latency tier) | A fast tier exclusive to Wan2.6: faster generation, lower unit price, ideal for iterating, debugging, and batch previews |

<Tip>
  `wan2.6-r2v-flash` is the lightweight fast tier in the Wan2.6 series, with no 2.7 equivalent. Use it during development to quickly validate prompts and reference-image results, then switch to `wan2.7-r2v` for the final render once finalized.
</Tip>

## Migration tips

<Steps>
  <Step title="Assess the differences">
    Wan2.7 is stronger at multi-subject reference, voice reference (`reference_voice`), and audio drive. If you only use basic t2v / i2v / r2v, the migration cost is nearly zero.
  </Step>

  <Step title="Run a side-by-side comparison">
    Using the same set of prompts and media assets, submit `wan2.6-*` and `wan2.7-*` tasks separately, compare quality and consistency, and then decide whether to switch.
  </Step>

  <Step title="Switch gradually">
    Just change the `model` field. The endpoint, headers, `input` / `parameters` structure, and polling and download flow are identical, with no breaking change.
  </Step>
</Steps>

## Legacy call example

```python theme={null}
import requests

# Calling Wan2.6: the only difference from Wan2.7 is the model name
body = {
    "model": "wan2.6-r2v-flash",   # change to wan2.7-r2v to upgrade to 2.7
    "input": {
        "prompt": "The reference image: a girl walking slowly through a garden, cinematic lighting",
        "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
    },
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
}
resp = requests.post(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    json=body,
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
             "X-DashScope-Async": "enable"},
    timeout=30,
)
print(resp.json()["output"]["task_id"])
```

## Billing differences

<Note>
  Pricing and group configuration for both Wan2.6 and Wan2.7 are coming soon and will be added to this page. As a general rule: fast tiers like `r2v-flash` have a lower unit price, while higher resolution / longer durations cost more. The latest prices are authoritative on the [APIYI console](https://api.apiyi.com/token) billing page.
</Note>

## Related docs

<CardGroup cols={2}>
  <Card title="Wan Overview" icon="video" href="/en/api-capabilities/wan/overview">
    Async flow, parameter details, best practices
  </Card>

  <Card title="Reference-to-Video" icon="users" href="/en/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` live debugging
  </Card>
</CardGroup>
