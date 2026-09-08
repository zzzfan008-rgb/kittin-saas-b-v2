> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Fixing Claude Code 400 Errors

> Why Claude Code returns 400 / ValidationException on the APIYI AWS Claude (Bedrock) official channel, and how to fix it

## 📌 The Problem

Some users hit errors like these while running Claude Code:

* `400 ValidationException`
* `Extra inputs are not permitted`
* Errors mentioning `cache_control.scope`

These are almost always caused by **Claude Code's experimental beta parameters**, which are **not supported** by the official Amazon Claude API (AWS Claude / Bedrock) channel that APIYI provides.

<Info>
  This guide applies only to requests going through the **AWS Claude (Bedrock) official channel**. The native Anthropic API channel supports these beta parameters, so none of the changes below are needed there.
</Info>

## ✅ Solution (Recommended)

Turn off Claude Code's experimental beta features.

### Option 1: Edit settings.json (recommended)

Add the environment variable to your Claude Code `settings.json`:

```json theme={null}
"env": {
  "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1"
}
```

### Option 2: Temporary (current terminal session)

Run this in your terminal:

```bash theme={null}
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
```

Then start Claude Code again.

<Tip>
  Option 2 only affects the current terminal window and is lost once you close it. For a lasting fix, use Option 1 or Option 3.
</Tip>

### Option 3: Permanent (recommended)

Write the variable into your shell config, depending on your environment.

#### Mac / Linux (bash)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.bashrc
source ~/.bashrc
```

#### Mac (zsh, the default)

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.zshrc
source ~/.zshrc
```

#### Windows (PowerShell)

```powershell theme={null}
[System.Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", "1", "User")
```

Then restart your terminal.

## 🔍 Why This Happens (for the technically inclined)

Claude Code enables a number of beta features by default, such as:

* `cache_control`
* extended `tool` fields
* extra parameters like `scope`

These parameters:

* 👉 are supported by the native Anthropic API
* 👉 but are rejected as invalid fields by AWS Bedrock Claude → HTTP 400

Once the switch is off:

* ✔ requests fall back to the standard structure
* ✔ full compatibility with AWS Claude

## 🚨 When You Need This

If any of the following describes you, **we strongly recommend setting this variable**:

* You use Claude Code with AWS Bedrock Claude
* You go through a third-party proxy (an API gateway or forwarding service)
* You see 400 / ValidationException errors

References:

* Claude official docs — environment variables: `code.claude.com/docs/en/env-vars`
* Related issue: `github.com/anthropics/claude-code/issues/21676`

## 🔎 Checking Which Groups a Model Belongs To

Not sure which groups a given model is available in? Look it up on the model pricing page:

Open the [APIYI model pricing page](https://api.apiyi.com/modelPricing) and search for the model name to see its available groups.

For example, the **ClaudeCode group** supports the latest Claude model series, plus separately configured `glm-5.1` and `qwen3.7-max`.

## 💡 Still Not Working?

If the error persists after applying the fix, check that:

* The environment variable actually took effect (run `echo $CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` and confirm it prints `1`)
* You really are on the AWS Claude (Bedrock) channel
* You restarted your terminal or IDE after changing the config

## 📞 Support

If you're still stuck, send us the following so we can dig deeper:

* A screenshot of the error
* The request log (Request ID)
* The model name you're using

We'll help you track it down.
