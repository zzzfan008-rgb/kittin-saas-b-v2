> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 mini / fast price cut — new SD2Mini and SD2Fast groups

> Two new single-model groups, SD2Mini (0.10x) and SD2Fast (0.15x), cut the rate 44.4% for mini and 16.7% for fast versus the 0.18x SeeDance2 group. Model capabilities and call syntax are unchanged — swap in one Token, no code changes. Runs through 2026-09-07 23:59 (UTC+8); afterwards the groups stay online and the rate reverts to 0.18x.

**2026/8/8 14:54 (UTC+8)** · Price Update · ByteDance

💰 **Seedance 2.0 mini / fast price cut — introducing the `SD2Mini` and `SD2Fast` groups**

Following an upstream pricing adjustment, we have cut prices on Seedance 2.0's two lightweight models and opened two **single-model dedicated groups**:

| Group     | Rate                  | Models served                          | Reduction  |
| --------- | --------------------- | -------------------------------------- | ---------- |
| `SD2Mini` | **0.10x** (was 0.18x) | `doubao-seedance-2-0-mini-260615` only | **−44.4%** |
| `SD2Fast` | **0.15x** (was 0.18x) | `doubao-seedance-2-0-fast-260128` only | **−16.7%** |

At 720p / 5s, mini drops from ¥3.16 to **¥1.75** and fast from ¥5.08 to **¥4.23** (list charge, converted at the fixed 1:7 rate). Model capabilities, parameters, endpoints, and call syntax are **completely unchanged** — what changed is the group rate, and it stacks independently with the top-up bonus. The standard model `doubao-seedance-2-0-260128` is unaffected and still runs on the `SeeDance2` group.

**How to use it**: create a new Token, set the primary group to `SD2Mini` (or `SD2Fast`), pick the Pay-as-you-go Priority (or Pay-as-you-go) billing model, and point your client at the new Key — not a line of code changes. We recommend a **separate discount Token**, keeping your existing `SeeDance2` Token for the standard model and as a fallback: billing stays split per Token so your savings are visible at a glance, and when the offer ends on September 7 you just switch the Key back. Note that both discount groups are single-model channels — calling any other model through them returns "no available channel for this model".

**The offer runs through 2026-09-07 23:59 (UTC+8)**. After that both groups **stay online**; only the rate reverts to 0.18x, with no Token or code changes required. If you have batch production planned, schedule it inside the window.

**About Seedance 2.5**: ByteDance has released Seedance 2.5. APIYI is working through the integration and it is not live yet — we will announce it separately once it is. Around that launch, upstream compute may be weighted toward 2.5, and output quality on `fast` and `mini` may fluctuate. We suggest validating quality on a small sample before committing to a batch run and keeping an eye on live results; please report any clear regression to us.

Groups, price comparison, and Token setup are documented in the [Seedance 2.0 overview](/en/api-capabilities/seedance2/overview).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
