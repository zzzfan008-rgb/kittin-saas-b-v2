> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Official gemini-3.8-flash Spec Sheet Published

> Google's model docs now list gemini-3.8-flash: 1,048,576-token input limit, 65,536-token output limit, text / image / video / audio / PDF input, and thinking levels limited to low / medium / high. APIYI went live with it on the evening of September 2 across both groups and both endpoints.

**2026/9/3 10:50 (UTC+8)** · New Model · Google

📊 **Google has published the official `gemini-3.8-flash` spec sheet, so the earlier "context specs not yet published" caveat is withdrawn**

The model page at `ai.google.dev/gemini-api/docs/models/gemini-3.8-flash` is up. Key specs (source: Google's official docs, captured 2026/9/3):

| Property               | Official value                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model code             | `gemini-3.8-flash`                                                                                                                                            |
| Inputs                 | Text, image, video, audio, PDF                                                                                                                                |
| Output                 | Text                                                                                                                                                          |
| Input token limit      | 1,048,576                                                                                                                                                     |
| Output token limit     | 65,536                                                                                                                                                        |
| Thinking               | `low` / `medium` / `high` supported; **`minimal` is not supported and returns an error**                                                                      |
| Supported capabilities | Caching, code execution, computer use (preview), file search, function calling, grounding with Google Maps, search grounding, structured outputs, URL context |
| Not supported          | Audio generation, image generation, Live API                                                                                                                  |
| Consumption options    | Batch API, Flex inference, Priority inference all supported (Google's own purchasing modes, with no counterpart in APIYI groups)                              |

The `minimal` error matches what our pre-launch tests found: the native endpoint returns 400 `Thinking level is unsupported`; to turn thinking off entirely use `thinkingConfig: {"thinkingBudget": 0}`. On the OpenAI-compatible endpoint, `reasoning_effort: "minimal"` does not error but is silently ignored and thinking is billed as usual, so check any code migrated from 3.6 Flash.

APIYI went live with the model on the evening of September 2. Both the `default` and `svip` groups and both the OpenAI-compatible and Gemini native endpoints are open, priced line for line with `gemini-3.7-flash`. With the 1M-token context now officially confirmed, the earlier advice to hold off a full cutover for long-context workloads no longer applies.

📖 Launch note with 150 paired test cases: [gemini-3.8-flash Is Live, Same Price as 3.7](/en/live/2026-09/gemini-3-8-flash-launch) · Integration docs: [Gemini 3.8 Flash Overview](/en/api-capabilities/gemini-3-8-flash/overview)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
