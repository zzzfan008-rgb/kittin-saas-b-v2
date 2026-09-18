> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Deprecated Models

> View the list of upcoming and deprecated models, and migrate to recommended alternatives in time.

## Overview

This page lists models that are scheduled for deprecation or have already been deprecated, helping you plan migrations ahead of time.

<Warning>
  If you are using a model that is scheduled for deprecation, please migrate to the recommended alternative as soon as possible to avoid service interruptions.
</Warning>

## ⚠️ Upcoming Deprecations

The following models are scheduled for deprecation. Please complete your migration before the listed date.

| Model Name                          | Model ID                              | Expected Deprecation Date       | Recommended Alternative  | Notes                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------- | ------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gemini 3 Pro Preview                | `gemini-3-pro-preview`                | Transparently aliased (2026-05) | `gemini-3.1-pro-preview` | **In sync with Google official**: since customers are already calling the legacy ID in production, requests to `gemini-3-pro-preview` are automatically routed to `gemini-3.1-pro-preview` to avoid disrupting live workloads. Migrate to the new ID at your convenience.                        |
| Gemini 3.1 Flash Lite Preview       | `gemini-3.1-flash-lite-preview`       | Transparently aliased (2026-05) | `gemini-3.1-flash-lite`  | **In sync with Google official**: Google retired this preview on 2026-05-25. Requests to the legacy ID are automatically routed to `gemini-3.1-flash-lite` at **identical pricing**, tracking the official rate, so live workloads are not disrupted. Migrate to the new ID at your convenience. |
| Gemini 2.0 Flash Lite               | `gemini-2.0-flash-lite`               | TBD                             | `gemini-2.5-flash`       | Gemini 2.0 series sunset                                                                                                                                                                                                                                                                         |
| Gemini 2.0 Flash Lite 001           | `gemini-2.0-flash-lite-001`           | TBD                             | `gemini-2.5-flash`       | Gemini 2.0 series sunset                                                                                                                                                                                                                                                                         |
| Gemini 2.0 Flash                    | `gemini-2.0-flash`                    | TBD                             | `gemini-2.5-flash`       | Gemini 2.0 series sunset                                                                                                                                                                                                                                                                         |
| Gemini 2.0 Flash 001                | `gemini-2.0-flash-001`                | TBD                             | `gemini-2.5-flash`       | Gemini 2.0 series sunset                                                                                                                                                                                                                                                                         |
| Gemini 2.0 Flash Lite Preview 02-05 | `gemini-2.0-flash-lite-preview-02-05` | TBD                             | `gemini-2.5-flash`       | Preview version                                                                                                                                                                                                                                                                                  |

<Info>
  For detailed Gemini model deprecation information, refer to the official documentation: `ai.google.dev/gemini-api/docs/deprecations`
</Info>

## 🚫 Deprecated Models

The following models have been deprecated and are no longer available. If your application is still calling these models, please switch to the alternative immediately.

| Model Name                             | Model ID                                                                                  | Deprecation Date | Alternative Model                       | Notes                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kimi K2                                | `kimi-k2`                                                                                 | 2026-05-28       | `kimi-k2.6`                             | Legacy Kimi K2 — migrate to the latest K2.6                                                                                                                                                                                                                                                                  |
| Kimi K2 128K                           | `kimi-k2-128k`                                                                            | 2026-05-28       | `kimi-k2.6`                             | Legacy long-context K2; K2.6 ships with 256K context by default                                                                                                                                                                                                                                              |
| Kimi K2 Instruct                       | `kimi-k2-instruct`                                                                        | 2026-05-28       | `kimi-k2.6`                             | Legacy instruction-tuned K2 — migrate to K2.6                                                                                                                                                                                                                                                                |
| DeepSeek V3.1                          | `deepseek-v3-1-250821`                                                                    | 2026-05-28       | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 series retired — migrate to V4: pick Pro for heavy reasoning, Flash for high-throughput / cost-sensitive workloads                                                                                                                                                                               |
| DeepSeek V3.1 Terminus                 | `deepseek-v3.1-terminus`                                                                  | 2026-05-28       | `deepseek-v4-pro` / `deepseek-v4-flash` | DeepSeek V3 series retired — migrate to V4                                                                                                                                                                                                                                                                   |
| DeepSeek R1 (250528)                   | `deepseek-r1-250528`                                                                      | 2026-05-28       | `deepseek-v4-pro` / `deepseek-v4-flash` | The R1 reasoning model has been superseded by V4 — use V4 Pro for reasoning workloads                                                                                                                                                                                                                        |
| GPT-4                                  | `gpt-4`                                                                                   | 2026-02-27       | `gpt-5.2`                               | Legacy model, discontinued                                                                                                                                                                                                                                                                                   |
| GPT-4 (32K)                            | `gpt-4-32k`                                                                               | 2026-02-27       | `gpt-5.2`                               | Legacy model, discontinued                                                                                                                                                                                                                                                                                   |
| Grok 4                                 | `grok-4`                                                                                  | 2026-03-12       | `grok-4-1-fast-reasoning`               | Retired — migrate to the newer release                                                                                                                                                                                                                                                                       |
| Grok 4 0709                            | `grok-4-0709`                                                                             | 2026-03-12       | `grok-4-1-fast-reasoning`               | Retired — migrate to the newer release                                                                                                                                                                                                                                                                       |
| Sora 2 Video (Official Relay)          | `sora-2` / `sora-2-pro` / `sora-2-remix`                                                  | 2026-07-01       | `doubao-seedance-2-0` / `wan2.7-t2v`    | **The entire Sora 2 line is retired.** OpenAI's capacity reallocation caused severe timeouts; the official sunset was set for September, and we retired the `Sora2Official` group ahead of schedule on July 1. That group is now disabled. See the [service notice](/en/live/2026-07/sora2-official-offline) |
| Sora 2 Video (Reverse)                 | `sora_video2` / `sora_video2-landscape` / `sora_video2-15s` / `sora_video2-landscape-15s` | 2026-04-26       | `doubao-seedance-2-0` / `wan2.7-t2v`    | Reverse channel retired. Its successor, the official-relay Sora 2, was also retired on 2026-07-01 — migrate directly to [SeeDance 2.0](/en/api-capabilities/seedance2/overview) or [Wan2.7](/en/api-capabilities/wan/overview)                                                                               |
| Sora 2 Character Generation            | `sora-character`                                                                          | 2026-04-26       | `doubao-seedance-2-0`                   | Reverse channel retired. For character-consistency workloads, use the [Seedance Asset Library](/en/api-capabilities/seedance2/asset-library) instead                                                                                                                                                         |
| Sora Image Generation/Edit (Reverse)   | `sora_image`                                                                              | 2026-04-26       | `gpt-image-2-all` (New Reverse)         | Reverse channel retired — migrate to [GPT-Image-2-All](/en/api-capabilities/gpt-image-2-all/overview)                                                                                                                                                                                                        |
| GPT-4o Image Generation/Edit (Reverse) | `gpt-4o-image`                                                                            | 2026-04-26       | `gpt-image-2-all` (New Reverse)         | Reverse channel retired — migrate to [GPT-Image-2-All](/en/api-capabilities/gpt-image-2-all/overview)                                                                                                                                                                                                        |

## 🔗 Official Deprecation Pages by Provider

Quick links to each provider's official model lifecycle and deprecation pages, so you can cross-check the latest schedules directly at the source.

<CardGroup cols={2}>
  <Card title="OpenAI" icon="square-terminal" href="https://platform.openai.com/docs/deprecations">
    GPT model deprecation list and recommended replacements
  </Card>

  <Card title="Anthropic Claude" icon="brain" href="https://platform.claude.com/docs/en/about-claude/model-deprecations">
    Claude model deprecation schedule (official docs)
  </Card>

  <Card title="Google Gemini" icon="gem" href="https://ai.google.dev/gemini-api/docs/deprecations">
    Gemini model sunset timeline and migration guidance
  </Card>

  <Card title="xAI Grok" icon="bolt" href="https://docs.x.ai/developers/migration/models">
    Grok model migration notes and retirement announcements
  </Card>

  <Card title="Alibaba Qwen" icon="cloud" href="https://www.alibabacloud.com/help/en/model-studio/newly-released-models">
    Bailian (Model Studio) Qwen model lifecycle and updates
  </Card>

  <Card title="DeepSeek" icon="fish" href="https://api-docs.deepseek.com/updates">
    DeepSeek API changelog and model migration notes
  </Card>
</CardGroup>

<Info>
  The links above redirect to each vendor's official documentation. We recommend bookmarking and checking them periodically to stay current with model retirement schedules.
</Info>

<Info>
  This page is updated regularly. We recommend checking back periodically for the latest deprecation information.
</Info>
