> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Realtime Voice (WebSocket)

> Four realtime voice models, one wss endpoint, one APIYI key: bidirectional streaming audio, barge-in, two turn-detection modes, function calling and image input. All four models are live in the default group. Includes a full field-by-field comparison of the two protocols and a zero-cost text-only self-test path.

## Overview

Realtime models run over a **long-lived WebSocket connection**: audio streams in, audio streams out, and the model can be interrupted mid-sentence — no "record, upload, wait, play back" cycle. The difference from stitching ASR + a text model + TTS is that this is end-to-end: the model hears tone, pauses and emotion directly, and speaks directly. Latency lands in the sub-second range.

APIYI currently offers **4 models across 2 protocols**, sharing one endpoint and one key:

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` — OpenAI Realtime GA protocol
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime` — Alibaba Cloud Model Studio protocol

<Warning>
  **Status (updated 2026-09-14, UTC+8)**: all four models are **live — select the default group on your key and call directly, no request needed**; the VIP and SVIP groups carry them too. You are welcome to test, explore and integrate; if anything is missing from this page or differs from what you measure, tell us. Upstream protocol and behavior may still change; everything in the "Known Limitations" section below is measured, and will be updated as upstream changes. Implement reconnection and graceful degradation before shipping to production. If you need higher concurrency, reach us via [WeCom support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) or email [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com).
</Warning>

<Note>
  **🎤 Highlights**: bidirectional streaming audio over one connection, **barge-in at any time**, `server_vad` and `semantic_vad` turn detection, full function-calling round trip (including result injection), image input, and `usage` broken out per modality. All of the above verified on all four models (first pass 2026-08-24, re-verified 2026-09-14, UTC+8).
</Note>

<Info>
  **One thing to remember first**: the 4 models use **two different request protocols**, with different field names and different event names. **Changing only the `model` parameter without changing the request body will not work** — this is by far the most common integration failure. The differences amount to 6 fields and 3 event names, all listed under "Protocol Comparison" below.
</Info>

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    Integration questions, concurrency increases and documentation gaps — reach a person directly.
  </Card>

  <Card title="API Manual" icon="book-open" href="/en/api-manual">
    Key creation, base URL, billing modes and other general conventions.
  </Card>

  <Card title="Keys and Groups" icon="key-round" href="/en/api-capabilities/token-management">
    Create keys, select groups and set quotas.
  </Card>

  <Card title="Call Logs" icon="receipt-text" href="https://api.apiyi.com/log">
    Inspect token usage and actual charges per call in the console.
  </Card>
</CardGroup>

This page is long. Three sections are required reading: **Protocol Comparison** (read before switching models), **Start With Text** (verify the whole chain without a microphone), and **Known Limitations** (four measured differences that affect client code).

## Let an AI Agent Do the Integration

<Note>
  If you develop with Codex / Claude Code / Cursor, copy the prompt below to it. It will first fetch the plain-text version of this page (append `.md` to any docs URL), then write code for your stack — the **two field families**, the sample-rate red line, cancel semantics and idle disconnects are all baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Realtime voice. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Help me integrate / troubleshoot APIYI Realtime voice (bidirectional streaming over WebSocket) in this project.

  Read the docs before writing code: fetch [https://docs.apiyi.com/en/api-capabilities/realtime/overview.md](https://docs.apiyi.com/en/api-capabilities/realtime/overview.md) for the plain-text version of this page, focusing on the "Protocol Comparison" and "Known Limitations" sections.

  Requirements:

  1. This is a **WebSocket long-lived connection**, not an HTTP request. The endpoint is `wss://api.apiyi.com/v1/realtime?model=<model-name>` and auth is the `Authorization: Bearer <key>` header. **Do not write it as an HTTP POST, and do not try to build `/v1/audio/speech` or `/v1/audio/transcriptions` URLs** — those are a different API.

  2. **Before writing any field, determine which protocol family the model belongs to.** `gpt-realtime-2.1` and `gpt-realtime-2.1-mini` use the Realtime GA protocol; `qwen3.5-omni-plus-realtime` and `qwen3.5-omni-flash-realtime` use the Alibaba Cloud Model Studio protocol. Only the endpoint and auth are shared — request bodies and event names differ throughout: output modality `modalities` vs `output_modalities`; voice at top level `voice` vs `audio.output.voice`; `input_audio_format` vs `audio.input.format`; top-level `turn_detection` vs `audio.input.turn_detection`; `input_audio_transcription` vs `audio.input.transcription`. Event names: `response.text.delta` vs `response.output_text.delta`, `response.audio.delta` vs `response.output_audio.delta`. **Write these as two config templates, do not scatter if-branches through the code.**

  3. Audio format red line: always PCM signed 16-bit, mono, Base64-encoded into `input_audio_buffer.append`. **The sample rate differs between the two** — Model Studio uses 16000, Realtime GA requires at least 24000 and rejects 16000 with `integer_below_min_value`. Resample on the client; do not expect the server to fix it.

  4. Do not block on `response.done` to close out a barge-in. After sending `response.cancel`, **the two Model Studio models currently do not deliver `response.done`** (reproduced consistently in testing). Use `response.output_item.done` as the end-of-turn signal and add a 5-second timeout as a backstop; the two Realtime GA models behave correctly, but the same logic works for both.

  5. Long connections need keepalive and reconnect. **Model Studio drops idle connections after 300 seconds, and WebSocket-level ping/pong does not count as activity** — it will not extend that timer. Either send an application-level event periodically while idle, or accept the disconnect and reconnect automatically. Realtime GA sessions carry `expires_at` (measured at roughly 30 minutes from connect) and also need reconnection. **After reconnecting you must replay `session.update` and any required context**, otherwise the new session runs with defaults.

  6. Pin the voice in the **first `session.update`**. Once a session has produced audio output, changing the voice fails with `cannot_update_voice`. Open a new session to switch voices.

  7. Read the key from the `APIYI_API_KEY` environment variable; never hardcode it and never commit it. **Do not connect from the frontend** — write a backend relay that holds the key and forwards audio frames.

  8. Run a text-only smoke test before touching the microphone: set `output_modalities` to text only, send one `input_text`, and confirm you receive text deltas and the `usage` object inside `response.done`. Then move to audio. When you are done, actually run one call against each protocol family and paste both `usage` objects back to me.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                                 | Pitfall it avoids                                                                   |
  | ------------------------------------------- | ----------------------------------------------------------------------------------- |
  | Identify the protocol family first          | Changing only `model` lets the handshake pass but `session.update` is then rejected |
  | Sample rate pinned per family               | Sending 16 kHz to Realtime GA fails with `integer_below_min_value`                  |
  | Output-modality field was renamed           | Writing `modalities` on the GA protocol is simply an unknown field                  |
  | Event names changed too                     | Listening for `response.text.delta` on the GA protocol never fires                  |
  | Close out on `output_item.done`             | Model Studio omits `response.done` after cancel; waiting for it hangs the turn      |
  | Keepalive needed, ping does not count       | Assuming a heartbeat prevents the 300-second idle disconnect                        |
  | Voice pinned in the first frame             | Changing it after audio has been produced fails with `cannot_update_voice`          |
  | Backend relay, no direct browser connection | Connecting from the browser hands the key to every visitor                          |
</Accordion>

## Why APIYI for Realtime Voice

<CardGroup cols={2}>
  <Card title="One key, four models" icon="key-round">
    Same `wss` endpoint, same auth. Switching models means changing the `model` parameter and the matching field template — no second vendor account to maintain.
  </Card>

  <Card title="Direct access, no overseas setup" icon="globe">
    Reach `api.apiyi.com` from mainland data centers, home broadband or overseas nodes. No upstream vendor account, identity verification or prepayment required.
  </Card>

  <Card title="Protocol differences already mapped" icon="git-compare">
    Field comparison, event-name comparison, sample-rate limits and four measured limitations are all documented here so you do not have to rediscover them.
  </Card>

  <Card title="Zero-cost self-test over text" icon="terminal">
    Verify handshake, auth, fields, tool wiring and concurrency without a microphone — audio tiers cost an order of magnitude more than text, so this is real money saved during integration.
  </Card>

  <Card title="Measured latency and concurrency" icon="gauge">
    Handshake p50 about 1 s and first text delta p50 about 1 s at 40 concurrent sessions, 120 of 120 sessions succeeded, with the test conditions and date stated under Technical Specs.
  </Card>

  <Card title="Direct engineering support" icon="handshake">
    A direct WeCom channel for integration questions, concurrency increases and upstream behavior changes.
  </Card>
</CardGroup>

## Core Capabilities

<CardGroup cols={2}>
  <Card title="Bidirectional streaming, interruptible" icon="radio">
    Audio streams out as it is generated; the client can send `response.cancel` at any time. The session survives and context is preserved. Verified on all four models.
  </Card>

  <Card title="Two turn-detection modes" icon="scissors">
    `server_vad` splits on silence duration, `semantic_vad` splits on intent (better at ignoring filler words like "uh-huh"). Both verified on all four models.
  </Card>

  <Card title="Full function-calling loop" icon="wrench">
    The model triggers a tool, the client executes it, `function_call_output` injects the result, and the model continues speaking. Verified end to end on all four models.
  </Card>

  <Card title="Image input, per-modality usage" icon="image">
    Send images mid-session for the model to read; `usage` returns text / audio / image tokens separately so cost can be attributed. Verified on all four models.
  </Card>
</CardGroup>

## Supported Models

| Model                         | Protocol family | Availability    | Default voice | Input sample rate | Prompt caching | Positioning                                                                 |
| ----------------------------- | --------------- | --------------- | ------------- | ----------------- | -------------- | --------------------------------------------------------------------------- |
| `gpt-realtime-2.1`            | Realtime GA     | ✅ Default group | `marin`       | ≥ 24 kHz          | ✅ Supported    | Flagship; strongest multilingual and reasoning, supports `reasoning.effort` |
| `gpt-realtime-2.1-mini`       | Realtime GA     | ✅ Default group | `marin`       | ≥ 24 kHz          | ✅ Supported    | Cost-effective; ample for everyday dialogue                                 |
| `qwen3.5-omni-plus-realtime`  | Model Studio    | ✅ Default group | `Tina`        | 16 kHz            | ⏸ Not observed | Flagship for Chinese-language scenarios                                     |
| `qwen3.5-omni-flash-realtime` | Model Studio    | ✅ Default group | `Tina`        | 16 kHz            | ⏸ Not observed | Cost-effective for Chinese-language scenarios                               |

Output audio is **PCM signed 16-bit / mono / 24 kHz** on all four models.

<Warning>
  The two protocol families **share only the endpoint and the auth scheme**. Request fields and server event names both differ. When you switch models you must switch field templates too — see "Protocol Comparison" below.
</Warning>

## Pricing

<Info>
  **Pricing in one sentence**: billed per token, and **audio costs an order of magnitude more than text** (for `gpt-realtime-2.1`, audio input \$32 vs text input \$4; audio output \$64 vs text output \$24). Run text-only during integration and switch to audio once the chain is verified — see "Start With Text" below.
</Info>

The tables below are the **vendors' official list prices**, in USD per 1M tokens; APIYI bills per token at the same rates (reconciled per modality on 2026-09-14, UTC+8). **Actual charges on APIYI are whatever the [call logs](https://api.apiyi.com/log) show**; the [recharge bonus](/en/faq/recharge-promotions) lowers the effective cost further.

### Realtime GA protocol

| Model                   | Text input | Text output | Cached read                                 | Image input | Audio input | Audio output |
| ----------------------- | ---------- | ----------- | ------------------------------------------- | ----------- | ----------- | ------------ |
| `gpt-realtime-2.1`      | \$4        | \$24        | \$0.4 (currently billed at \$4 on APIYI)    | \$5         | \$32        | \$64         |
| `gpt-realtime-2.1-mini` | \$0.6      | \$2.4       | \$0.06 (currently billed at \$0.6 on APIYI) | \$0.8       | \$10        | \$20         |

### Model Studio protocol

The billing dimensions differ: image input is folded into the text tier, and output is split into "text only" and "text + audio" (only the audio portion is charged at the latter rate).

| Model                         | Text / image input | Audio input | Text output | Text + audio output |
| ----------------------------- | ------------------ | ----------- | ----------- | ------------------- |
| `qwen3.5-omni-plus-realtime`  | \$1.38             | \$11        | \$8.25      | \$41.26             |
| `qwen3.5-omni-flash-realtime` | \$0.45             | \$3.71      | \$2.75      | \$14.71             |

<Note>
  **Billing notes**: text, audio and image tokens are billed per token at the list prices above; an interrupted turn (`response.cancel`) is billed for what was actually generated, and an empty session is not billed. **Cached input is not yet discounted**: cache hits are reported faithfully in `usage.cached_tokens`, but APIYI currently bills them at the corresponding text-input rate. The official cached rate will apply automatically once the billing path is fixed, and we will announce it in the [changelog](/en/changelog). Pricing may change with vendor policy and supply. This capability is offered to **secure supply and serve customers**, not as a profit-driven listing.
</Note>

## Access Group

| Group       | Models   | Notes                                                                                                  |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------ |
| **default** | All four | Select the default group on your key — no request needed; group ratio 1, same price as the vendor list |
| VIP / SVIP  | All four | Available; charges follow the ratio of the group your key is in                                        |

<Note>
  All four models share one endpoint and one key. Switching groups is a checkbox change under [key management](/en/api-capabilities/token-management); no code changes are needed.
</Note>

## Technical Specs

| Dimension             | Value                                                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transport**         | WebSocket (`wss://`), bidirectional streaming over one connection                                                                                                                                                       |
| **Auth**              | `Authorization: Bearer <key>` header                                                                                                                                                                                    |
| **Event format**      | Compatible with the OpenAI Realtime event model (client events / server events)                                                                                                                                         |
| **Input audio**       | PCM signed 16-bit, mono, Base64. **Model Studio 16 kHz; Realtime GA ≥ 24 kHz**                                                                                                                                          |
| **Output audio**      | PCM signed 16-bit, mono, 24 kHz                                                                                                                                                                                         |
| **Output modalities** | Text / audio (text-only is allowed)                                                                                                                                                                                     |
| **Turn detection**    | `server_vad`, `semantic_vad`, or disabled for manual `commit`                                                                                                                                                           |
| **Function calling**  | Supported, including `function_call_output` result injection                                                                                                                                                            |
| **Image input**       | Supported (syntax differs per family, see below)                                                                                                                                                                        |
| **Session lifetime**  | Realtime GA: session carries `expires_at`; two test passes measured roughly 30 and 60 minutes from connect, so treat the `session.created` echo as authoritative. Model Studio: measured idle disconnect at 300 seconds |

### Measured latency and concurrency

Measured 2026-09-14 (UTC+8) over the public `api.apiyi.com` path, `gpt-realtime-2.1` and `-mini` at 20 and 40 concurrent sessions each, single-turn text-only exchange:

| Metric               | Measured (40 sessions × 2 models)                                       |
| -------------------- | ----------------------------------------------------------------------- |
| WebSocket handshake  | p50 0.96–1.03 s, max 1.40 s                                             |
| First text delta     | p50 0.99–1.08 s, max 1.67 s                                             |
| Full single turn     | p50 1.30–1.44 s, max 2.11 s                                             |
| Session success rate | 100% (120 sessions across the 20- and 40-session tiers, zero 429s)      |
| Idle keepalive       | Still conversational after 5 minutes of silence; ping/pong about 200 ms |

<Warning>
  These are point-in-time measurements at a specific concurrency level and are not a performance commitment. **No availability SLA is offered** — implement reconnection and graceful degradation on the client.
</Warning>

## Endpoint

| Endpoint                                             | Purpose                       | Auth                          |
| ---------------------------------------------------- | ----------------------------- | ----------------------------- |
| `wss://api.apiyi.com/v1/realtime?model=<model-name>` | Open a realtime voice session | `Authorization: Bearer <key>` |

All four models share this endpoint; the `model` query parameter selects which one you reach.

<Warning>
  **On connecting from the browser**: this endpoint also accepts auth via the `Sec-WebSocket-Protocol` subprotocol (`realtime, openai-insecure-api-key.<key>, openai-beta.realtime-v1`), so a browser `WebSocket` can connect directly — but that **hands your key to the browser**, where any visitor can read it from the network panel. **Use it for local verification only.** In production, write a backend relay: the backend holds the key and opens the connection to APIYI, while the frontend talks only to your own service.
</Warning>

## ⚠️ Protocol Comparison (read before switching models)

The two families share the endpoint, the auth scheme and the overall event flow. The differences are concentrated in the `session.update` field structure and a few server event names.

### Request field comparison

| Purpose             | Model Studio protocol               | Realtime GA protocol                                      |
| ------------------- | ----------------------------------- | --------------------------------------------------------- |
| Output modality     | `modalities: ["text","audio"]`      | `output_modalities: ["audio"]`                            |
| Voice               | `voice` (top level)                 | `audio.output.voice`                                      |
| Speed               | Not supported                       | `audio.output.speed` (0.7 / 1.0 / 1.5 measured as linear) |
| Input audio format  | `input_audio_format: "pcm"`, 16 kHz | `audio.input.format: {"type":"audio/pcm","rate":24000}`   |
| Output audio format | `output_audio_format: "pcm"`        | `audio.output.format: {"type":"audio/pcm","rate":24000}`  |
| Turn detection      | `turn_detection` (top level)        | `audio.input.turn_detection`                              |
| Input transcription | `input_audio_transcription`         | `audio.input.transcription`                               |

### Server event comparison

| Content                | Model Studio protocol             | Realtime GA protocol                     |
| ---------------------- | --------------------------------- | ---------------------------------------- |
| Text delta             | `response.text.delta`             | `response.output_text.delta`             |
| Audio delta            | `response.audio.delta`            | `response.output_audio.delta`            |
| Audio transcript delta | `response.audio_transcript.delta` | `response.output_audio_transcript.delta` |

All other events — `session.created`, `session.updated`, `conversation.item.create`, `input_audio_buffer.append`, `input_audio_buffer.commit`, `response.create`, `response.cancel`, `response.done` — are named identically in both.

### Two minimal session.update payloads

The same thing written twice; copy directly. **Model Studio protocol**:

```json theme={null}
{
  "type": "session.update",
  "session": {
    "modalities": ["text", "audio"],
    "voice": "Ethan",
    "input_audio_format": "pcm",
    "output_audio_format": "pcm",
    "input_audio_transcription": { "model": "qwen3-asr-flash-realtime" },
    "turn_detection": { "type": "semantic_vad" }
  }
}
```

**Realtime GA protocol**:

```json theme={null}
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "output_modalities": ["audio"],
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "transcription": { "model": "whisper-1" },
        "turn_detection": { "type": "semantic_vad" }
      },
      "output": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "voice": "alloy",
        "speed": 1.0
      }
    }
  }
}
```

<Warning>
  **Sample rate is a hard constraint**: `audio.input.format.rate` on the Realtime GA protocol must be **≥ 24000**; sending 16000 fails immediately with `integer_below_min_value: Expected a value >= 24000`. The Model Studio protocol requires 16 kHz input. Resample on the client.
</Warning>

## Start With Text: What the Text Channel Is For, and a Three-Step Self-Test

An audio pipeline involves microphone capture, resampling, chunking and turn detection. Any broken link shows up as "nothing happens", which is hard to diagnose. So **do not start with a microphone**.

### Text is the control plane, not a fallback input

In a realtime voice model, text is not "another way to send input" — it is **the entire control channel other than the audio stream**:

| Combination          | Typical use                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text → control plane | `instructions` system prompts, `function_call_output` tool results, retrieved context — all text, none reachable via microphone                                       |
| Text → audio         | Effectively a **TTS with full conversational context**: let a regular model think it through, then have the realtime model say it. Good for announcements and prompts |
| Text → text          | **The cheapest debugging channel.** Plain text chat is better served by a regular chat model; its value here is verifying the chain at no cost                        |

### Three-step self-test

<Steps>
  <Step title="Step 1: text only, no microphone">
    Set `output_modalities` to text only, disable turn detection, and send one `input_text`. That alone verifies the handshake, the key and group, **whether you picked the right field template**, whether `session.update` took effect, whether tools inject correctly, whether multi-turn context holds, and how concurrency behaves. **No audio tokens are produced at all.**
  </Step>

  <Step title="Step 2: replay a local wav file">
    Use a fixed local audio file instead of a microphone, feeding it into `input_audio_buffer.append` in 100 ms chunks. This decouples the **audio pipeline** (format, sample rate, chunking, `commit`, VAD triggering) from your business logic and makes it repeatable — the same file should produce the same result twice.
  </Step>

  <Step title="Step 3: connect the live microphone">
    Once the first two steps pass, only capture and playback remain. If something breaks now, the search space is already small.
  </Step>
</Steps>

<Tip>
  **No test audio handy?** On macOS, built-in tools generate a compliant file in one line:

  ```bash theme={null}
  say -v Samantha -o /tmp/ask.aiff "What is the weather in Beijing today? Answer in one sentence."

  # Realtime GA protocol uses 24000
  afconvert -f WAVE -d LEI16@24000 -c 1 /tmp/ask.aiff ask_24k.wav
  # Model Studio protocol uses 16000
  afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/ask.aiff ask_16k.wav
  ```

  Picking the wrong sample rate is the most common failure in step 2 — the two protocols differ, do not mix them up.
</Tip>

### A runnable text smoke test

Depends only on `websockets` (`pip install websockets`). Flip one variable to switch protocols:

```python theme={null}
import asyncio, json, os, websockets

FAMILY = "ga"           # ga = gpt-realtime-2.1 series; omni = qwen3.5-omni series
MODEL = "gpt-realtime-2.1" if FAMILY == "ga" else "qwen3.5-omni-plus-realtime"
URL = f"wss://api.apiyi.com/v1/realtime?model={MODEL}"
HEADERS = {"Authorization": "Bearer " + os.environ["APIYI_API_KEY"]}

# The two protocols diverge only here: session structure and the text-delta event name.
SESSION = ({"type": "realtime", "output_modalities": ["text"],
            "audio": {"input": {"turn_detection": None}}}
           if FAMILY == "ga" else
           {"modalities": ["text"], "turn_detection": None})
TEXT_DELTA = "response.output_text.delta" if FAMILY == "ga" else "response.text.delta"

async def main():
    async with websockets.connect(URL, additional_headers=HEADERS) as ws:
        while json.loads(await ws.recv())["type"] != "session.created":
            pass
        await ws.send(json.dumps({"type": "session.update", "session": SESSION}))
        await ws.send(json.dumps({"type": "conversation.item.create", "item": {
            "type": "message", "role": "user",
            "content": [{"type": "input_text", "text": "Explain WebSocket in one sentence."}]}}))
        await ws.send(json.dumps({"type": "response.create"}))
        while True:
            e = json.loads(await ws.recv())
            if e["type"] == TEXT_DELTA:
                print(e["delta"], end="", flush=True)
            elif e["type"] == "response.done":
                print("\n\nusage =", json.dumps(e["response"]["usage"]))
                return
            elif e["type"] == "error":
                print("\nERROR:", json.dumps(e))
                return

asyncio.run(main())
```

If this runs, the endpoint, key, group and field template are all correct — move on to step 2.

## Session Features: Voice, Turn Detection, Tools, Images

### Voice

| Item             | Model Studio protocol           | Realtime GA protocol                                              |
| ---------------- | ------------------------------- | ----------------------------------------------------------------- |
| Default voice    | `Tina`                          | `marin`                                                           |
| Verified working | `Tina`, `Ethan` and others      | `alloy`, `marin`, `cedar`, `shimmer`, `verse`                     |
| Speed control    | Not supported                   | `audio.output.speed`; duration scales linearly at 0.7 / 1.0 / 1.5 |
| Invalid voice    | `Voice 'xxx' is not supported.` | `invalid_value`                                                   |

<Warning>
  **Pin the voice in the first `session.update`.** Once a session has produced audio output, changing the voice fails with `cannot_update_voice` — this applies to both protocols. Open a new session to switch voices. Also, on the Model Studio protocol **do not send an empty string as the voice**; it falls back to an unsupported voice and returns 400. Simply omit the field if you do not need to set it.
</Warning>

### Turn detection: server\_vad and semantic\_vad

* `server_vad` — splits on silence duration, with straightforward parameters (`threshold`, `silence_duration_ms`, `prefix_padding_ms`).
* `semantic_vad` — splits on conversational intent, ignoring filler words and meaningless background noise. More robust in multi-speaker environments.
* You can also disable turn detection (`null` or `none`) and run in **manual mode**: send `input_audio_buffer.commit` yourself, then `response.create`. This suits push-to-talk interfaces where the UI controls turns.

<Tip>
  In VAD mode you **must keep streaming**. After the speech ends, keep pushing a short stretch of silence (2 seconds is enough in testing) so the server can detect end-of-speech. If you push only the voiced part and then stop, `speech_stopped` never fires and no response is generated.
</Tip>

### Function calling

Event order: the model emits a `response.output_item.done` of type `function_call` (carrying `call_id` and `arguments`) → the client executes it → the result is injected → another `response.create` lets the model continue.

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_xxx",
    "output": "{\"city\":\"Beijing\",\"weather\":\"light rain\",\"temp_c\":21}"
  }
}
```

The full loop is verified on all four models — after injection the model correctly restates what the tool returned.

### Image input

**Realtime GA protocol**: put `input_image` directly into the message; the value can be a data URI.

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      { "type": "input_image", "image_url": "data:image/jpeg;base64,..." },
      { "type": "input_text", "text": "What does the image say?" }
    ]
  }
}
```

**Model Studio protocol**: images are treated as **video frames**, so audio must be appended first, otherwise you get `Error append image before append audio.`. In testing, the working approach is to interleave `input_image_buffer.append` into the `input_audio_buffer.append` stream at roughly one frame per second.

## Known Limitations

Every item below is measured, and all of them affect client code. Read this before integrating.

| Behavior                                                                                              | Affected family                              | Client workaround                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `response.done` is not delivered after `response.cancel`, so the turn never closes out                | Model Studio (reproduced in all 6 test runs) | Use `response.output_item.done` as the end-of-turn signal, plus a 5-second timeout. The session itself is unaffected and conversation continues normally after the interruption               |
| Idle connections dropped at 300 seconds; WebSocket ping/pong **does not count as activity**           | Model Studio                                 | Send an application-level event periodically while idle, or accept the disconnect and reconnect automatically; replay `session.update` after reconnecting                                     |
| Voice cannot be changed once the session has produced audio; fails with `cannot_update_voice`         | Both families                                | Pin `voice` in the first `session.update`; open a new session to switch                                                                                                                       |
| Input-transcription completion event is not delivered in manual `commit` mode                         | The `flash` model on Model Studio            | Switch to `server_vad` / `semantic_vad`, where transcription works normally. The conversation itself is unaffected — the model understands and answers the audio correctly                    |
| `POST /v1/realtime/client_secrets` (ephemeral keys) and `POST /v1/realtime/calls` (WebRTC) return 404 | All                                          | Only direct WebSocket is supported on APIYI; WebRTC, SIP and ephemeral tokens are unavailable. For browser and mobile clients, run a backend relay that holds the key and opens the WebSocket |
| A custom voice object (`audio.output.voice: {id: …}`) returns an upstream 500                         | Realtime GA                                  | Use built-in voice names only (`marin` / `cedar` / `alloy` and so on, as strings)                                                                                                             |

<Warning>
  These behaviors may change as upstream evolves; this page will be kept current. If you hit something not listed here, please report it via [WeCom support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) or [feedback@apiyi.com](mailto:feedback@apiyi.com), including the timestamp and `session.id` so we can trace it.
</Warning>

## Best Practices

<Steps>
  <Step title="Pick the field template by protocol family first">
    Write the two `session.update` payloads as two config constants selected by model name, rather than scattering if-branches. This is the part most likely to break during maintenance six months later.
  </Step>

  <Step title="Pin session parameters in the first frame">
    Set `output_modalities`, `voice`, `speed`, `turn_detection` and `transcription` in the very first `session.update`. Voice especially — once audio has been produced it is too late.
  </Step>

  <Step title="Pass a text smoke test before adding audio">
    Run the text smoke test on this page to confirm endpoint, key, group and field template are all correct, then move to audio. Audio tiers cost an order of magnitude more than text, so this saves most of your integration budget.
  </Step>

  <Step title="Convert sample rate and channels on the client">
    PCM signed 16-bit, mono; 16 kHz for Model Studio, ≥ 24 kHz for Realtime GA. Do not expect server-side correction — a wrong format usually shows up as silence rather than an explicit error.
  </Step>

  <Step title="Close out on output_item.done with a timeout">
    Do not wait on `response.done` alone. This approach is correct on both families and avoids hanging a turn when the user interrupts.
  </Step>

  <Step title="Add keepalive and reconnect for long sessions">
    Watch the 300-second idle limit on Model Studio and `expires_at` on Realtime GA. **After reconnecting, replay `session.update` and any required context**, otherwise the new session runs with defaults.
  </Step>

  <Step title="Use a backend relay in production">
    Keep the key on the backend and have the frontend talk only to your own service. Direct browser connections work technically but expose the key.
  </Step>
</Steps>

## Errors and Retries

| Symptom                                             | Meaning                                                                                                    | What to do                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Handshake returns 401                               | Invalid key, or the `Authorization` header was not sent                                                    | Check the key itself, whether you used `https://` by mistake, and whether the header is present |
| Handshake returns 503 with no available channel     | The key's group does not include the model (all four are in the default group), or the model name is wrong | Check the key's group and the `model` parameter                                                 |
| Handshake returns 400                               | The `model` query parameter is missing                                                                     | The endpoint must include `?model=<model-name>`                                                 |
| `invalid_request_error` on an unknown field         | **Wrong protocol family**                                                                                  | Switch to the field template for that model using the comparison tables above                   |
| `integer_below_min_value`                           | Input sample rate below 24000 on Realtime GA                                                               | Resample to 24 kHz or higher on the client                                                      |
| `cannot_update_voice`                               | Voice changed after the session produced audio                                                             | Pin the voice in the first frame; open a new session to switch                                  |
| `Error append image before append audio.`           | An image was appended before any audio on Model Studio                                                     | Append audio via `input_audio_buffer.append` first, then image frames                           |
| WebSocket 1006 / 1011                               | Network instability or an upstream disconnect                                                              | Reconnect with exponential backoff (1 s / 4 s / 16 s) and replay `session.update`               |
| Connection drops after roughly 5 minutes of silence | The Model Studio idle limit                                                                                | See the keepalive approach under Known Limitations                                              |

<Info>
  Troubleshooting tip: record the `event_id` of each event and the `session.id` of the session, and include them when reporting an issue — it shortens diagnosis considerably. Note also that **Realtime GA error objects carry `code` and `param`** (naming the exact field and its accepted values), while Model Studio error messages are coarser. Validate field syntax on the former first when debugging.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why is there no interactive playground on this page?">
    Interactive playgrounds are driven by OpenAPI specs, which describe a single request and a single response over HTTP. Realtime is dozens of event types flowing in both directions over one long-lived connection, which does not map onto that model. The alternative is the text smoke test in the "Start With Text" section — a few dozen lines, no microphone, and it confirms the chain works.
  </Accordion>

  <Accordion title="Can I swap between the four models by changing only the model name?">
    **No.** The endpoint and auth are the same, but request fields and event names belong to two protocols. At minimum you must change: `modalities` ↔ `output_modalities`, `voice` ↔ `audio.output.voice`, `input_audio_format` ↔ `audio.input.format`, `turn_detection` ↔ `audio.input.turn_detection`, `input_audio_transcription` ↔ `audio.input.transcription`, plus the event names `response.text.delta` ↔ `response.output_text.delta` and `response.audio.delta` ↔ `response.output_audio.delta`. See the Protocol Comparison section for the full mapping.
  </Accordion>

  <Accordion title="The handshake fails outright. How do I debug it?">
    Check five things in order: 1. the scheme is `wss://`, not `https://`; 2. the endpoint includes `?model=<model-name>`; 3. the `Authorization: Bearer <key>` header is present; 4. the key's group includes the model (all four are in the default group; a mismatch returns 503 with "no available channel"); 5. no reverse proxy in between is stripping the `Upgrade` header — this is a common issue when relaying through your own gateway.
  </Accordion>

  <Accordion title="Can I connect from the browser? Will my key leak?">
    Technically yes — the endpoint accepts auth via the `Sec-WebSocket-Protocol` subprotocol, so a browser `WebSocket` can connect directly. But that **hands your key to the browser**, where any visitor can read it from the network panel, so it is **only suitable for local verification**. In production write a backend relay: the backend holds the key and opens the connection to APIYI, and the frontend talks only to your own service.
  </Accordion>

  <Accordion title="Sending 16 kHz audio to gpt-realtime-2.1 fails. Why?">
    The Realtime GA protocol requires an input sample rate of **at least 24000**; 16000 returns `integer_below_min_value`. The correct form is `"audio": {"input": {"format": {"type": "audio/pcm", "rate": 24000}}}`. The two Model Studio models require 16 kHz instead — the two are not interchangeable.
  </Accordion>

  <Accordion title="I have no microphone / audio is hard to test. What now?">
    Follow the three-step self-test in the "Start With Text" section: verify the chain over text first (no audio tokens produced), then replay a local wav file to verify the audio pipeline, and only then connect a live microphone. Test audio can be generated in one line with the macOS built-ins `say` and `afconvert` — the commands are in that section.
  </Accordion>

  <Accordion title="After sending response.cancel I never receive response.done.">
    This is a known behavior of the two Model Studio models (reproduced in all 6 test runs): after an interruption you receive `response.text.done`, `response.content_part.done` and `response.output_item.done`, but `response.done` is not delivered. **Use `response.output_item.done` as the end-of-turn signal and add a timeout as a backstop.** The session itself is unaffected and the conversation continues normally. The two Realtime GA models behave correctly here.
  </Accordion>

  <Accordion title="My connection drops after about 5 minutes.">
    The Model Studio protocol drops connections after **300 seconds of inactivity**, and **WebSocket-level ping/pong does not count as activity** — a heartbeat will not extend that timer. Either send an application-level event periodically while idle (a `session.update`, for instance), or accept the disconnect and reconnect automatically. Remember to replay `session.update` and any required context after reconnecting.
  </Accordion>

  <Accordion title="How long can a single session stay open?">
    On the Realtime GA protocol the `session.created` event carries `expires_at`, measured at roughly 30 minutes from connect, after which you need to reconnect. On the Model Studio protocol the constraint we mainly observed is the 300-second idle disconnect. Design long conversations on the assumption that sessions expire, and plan how context carries across sessions.
  </Accordion>

  <Accordion title="How do I set the voice, and why does changing it return cannot_update_voice?">
    Set the voice in `session.update`: top-level `voice` on Model Studio, `audio.output.voice` on Realtime GA. **Once the session has produced audio output the voice can no longer be changed** — this applies to both protocols and returns `cannot_update_voice`. Pin it in the first frame and open a new session to switch. Also, do not send an empty string as the voice on Model Studio; it returns 400.
  </Accordion>

  <Accordion title="I get no input transcription in manual commit mode.">
    The `flash` model on Model Studio does not deliver the transcription completion event in manual `commit` mode (reproduced consistently across runs); the `plus` model does, and both work in VAD mode. **Switch to `server_vad` or `semantic_vad`.** Testing shows the transcript text lands in an undocumented field on the delta events in this case, but that field may change at any time and **should not be relied upon**. Note this only affects displaying what the user said in your UI — the conversation is unaffected, and the model understands and answers the audio correctly.
  </Accordion>

  <Accordion title="Is image input supported? Why do I get Error append image before append audio.?">
    All four models support image input, but the syntax differs. On Realtime GA you place `input_image` directly in the message. On Model Studio images are treated as **video frames**, so audio must be appended before any image, which is what triggers that error. In testing the working approach is to interleave image frames into the audio stream at roughly one frame per second.
  </Accordion>

  <Accordion title="Is there prompt caching? How do I confirm a hit?">
    The two Realtime GA models support it and it applies automatically — in testing the second turn within a session already hit, with a value in `usage.input_token_details.cached_tokens` (prefix of at least 1024 tokens, in 128-token increments). **Note that APIYI currently bills cached tokens at the full text-input rate**; the discount will be announced in the changelog once it is live. No cache hits were observed on the two Model Studio models.
  </Accordion>

  <Accordion title="Are WebRTC, SIP or ephemeral keys (client_secrets) supported?">
    **No.** `POST /v1/realtime/client_secrets` and `POST /v1/realtime/calls` both return 404 on APIYI, and SIP is unavailable too; the single `wss://api.apiyi.com/v1/realtime` WebSocket endpoint is the only entry point. For browser or mobile clients, write a backend relay: the backend holds the key and opens the WebSocket, and the frontend talks only to your own service.
  </Accordion>

  <Accordion title="Do the GA session fields such as reasoning.effort and noise_reduction work on gpt-realtime-2.1?">
    Yes. In testing every one of them passed through unchanged and was echoed back in `session.updated`: `reasoning.effort` (`minimal` / `low` / `medium` / `high` / `xhigh`, accepted by both models), `audio.input.noise_reduction`, `audio.input.turn_detection.idle_timeout_ms`, `audio.input.transcription.model` (including `gpt-realtime-whisper`), `truncation`, `tracing`, `max_output_tokens` and `parallel_tool_calls`. Field semantics follow the OpenAI reference; the gateway does not rewrite them.
  </Accordion>

  <Accordion title="How do I estimate cost? Are text and audio billed separately?">
    The `usage` object on `response.done` reports tokens per modality (text / audio / image, separately for input and output), so cost can be attributed; the call-log detail view carries the same per-modality `usage`, one record per completed `response.done`. Audio tiers are substantially higher than text, which is why text-only is recommended during integration. **For actual charges, refer to the [call logs](https://api.apiyi.com/log).**
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="API Manual" icon="book-open" href="/en/api-manual">
    Key creation, base URL, billing modes and other general conventions.
  </Card>

  <Card title="Keys and Groups" icon="key-round" href="/en/api-capabilities/token-management">
    Create keys, select groups and set quotas.
  </Card>

  <Card title="Text Generation" icon="file-text" href="/en/api-capabilities/text-generation">
    Regular chat models — a better fit for text-only conversation.
  </Card>

  <Card title="Model Pricing" icon="table" href="/en/models">
    Live pricing, endpoints and groups for every model on the platform.
  </Card>

  <Card title="Recharge Bonus" icon="percent" href="/en/faq/recharge-promotions">
    Lowers your effective cost further.
  </Card>

  <Card title="WeCom Support" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    Integration questions, concurrency increases and documentation gaps.
  </Card>
</CardGroup>

<Info>
  All four Realtime models are live in the default group. Measured results on this page come from the 2026-08-24 first pass and the 2026-09-14 re-test (UTC+8) and will be updated as upstream changes. If you plan to integrate, hit something this page does not cover, or need higher concurrency, reach us at [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com).
</Info>
