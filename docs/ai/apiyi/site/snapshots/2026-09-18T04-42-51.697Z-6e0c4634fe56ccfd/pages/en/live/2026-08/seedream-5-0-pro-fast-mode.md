> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 5.0 Pro Speed Update: Official Fast Mode Live

> BytePlus has rolled out Fast Mode; APIYI already applies it by default at the gateway, so no client-side change is needed and the model name is unchanged. Launch-test latency: standard mode 30s+/40s+ at 1K/2K, Fast Mode 20s+/40s+ at 1K/2K.

**2026/8/19 15:12 (UTC+8)** · New Model · ByteDance

🚀 **Seedream 5.0 Pro speed update: official Fast Mode is live, already applied by default on APIYI**

This update ships alongside BytePlus's official rollout: standard-mode text-to-image latency has been optimized, and a new Fast Mode targets latency-sensitive workloads. **APIYI has already adapted this at the gateway and applies the fast-mode parameter by default — you don't need to add it yourself**; the model name `seedream-5-0-pro-260628` and calling method are unchanged.

Expected latency from launch testing (theoretical values; actual results vary with network conditions, resource availability, and request specifics):

| Mode                     | Resolution | Expected latency |
| ------------------------ | ---------- | ---------------- |
| Standard · text-to-image | 1K         | 30s+             |
| Standard · text-to-image | 2K         | 40s+             |
| Fast · image-to-image    | 1K         | 20s+             |
| Fast · image-to-image    | 2K         | 40s+             |

**Trade-off**: Fast Mode may understand vague or ambiguous prompts less well. For clear, specific prompts, no noticeable drop in generation quality, structure, or aesthetics has been observed.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
