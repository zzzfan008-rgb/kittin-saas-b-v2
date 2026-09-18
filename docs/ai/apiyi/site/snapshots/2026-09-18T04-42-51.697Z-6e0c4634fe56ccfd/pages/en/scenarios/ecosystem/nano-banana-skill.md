> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Image Gen Skill

> Community open-source AI Agent Skill for generating and editing images with natural language in Codex CLI, OpenCode, Gemini CLI, Cursor, and more, powered by Nano Banana Pro via APIYI.

## Overview

nano-banana-pro-image-gen is a community-contributed open-source AI Agent Skill that lets you generate and edit images with a single natural language command in **Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp**, and more. It calls the Nano Banana Pro model via APIYI — no complex setup needed, just install and go.

<Info>
  **Project Info**

  * 🔗 Source Code: `github.com/wuchubuzai2018/expert-skills-hub`
  * 🌐 Skill Page: `skills.sh/wuchubuzai2018/expert-skills-hub/nano-banana-pro-image-gen`
  * 👤 Author: wuchubuzai2018
  * ⭐ Community contributed
</Info>

## Why This Skill

<CardGroup cols={2}>
  <Card title="One-Line Image Gen" icon="wand-sparkles">
    Describe in natural language inside your AI coding assistant and instantly generate high-quality images without leaving your editor
  </Card>

  <Card title="Image Editing" icon="square-pen">
    Pass in existing images for editing, up to 14 reference images, enabling style transfer and content modification
  </Card>

  <Card title="Multi-Platform" icon="puzzle">
    Works with Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp, and more
  </Card>

  <Card title="Flexible Output" icon="sliders-horizontal">
    10 aspect ratios + 3 resolution tiers (1K/2K/4K), covering everything from quick previews to high-res posters
  </Card>
</CardGroup>

## Supported APIYI Models

| Model Name      | Model ID                     | Usage                         | API Docs                                            |
| --------------- | ---------------------------- | ----------------------------- | --------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | Text-to-image, image-to-image | [View Docs](/en/api-capabilities/nano-banana-image) |

<Tip>
  This Skill uses the Nano Banana Pro model. If you also want faster speed and lower cost with Nano Banana 2, check out the [Nano Banana ComfyUI Nodes](/en/scenarios/ecosystem/nano-banana-comfyui), which supports both models.
</Tip>

## Quick Start: 3 Steps to Generate Images

<Steps>
  <Step title="Step 1: Get Your APIYI Key">
    1. Visit [APIYI Console](https://api.apiyi.com) to register/login
    2. Go to the Token section and generate a new API key
    3. Copy the key (starts with `sk-`)

    <Info>
      New users get free trial credits, enough to experience Nano Banana image generation.
    </Info>
  </Step>

  <Step title="Step 2: Install the Skill">
    Run the following command in your terminal:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill nano-banana-pro-image-gen
    ```

    <Warning>
      Requires Node.js. If not installed, visit `nodejs.org` to download. Python can be used as a fallback runtime.
    </Warning>
  </Step>

  <Step title="Step 3: Configure API Key">
    Set the environment variable:

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Windows PowerShell users:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```

    <Tip>
      Add the environment variable to your `~/.zshrc` or `~/.bashrc` to avoid setting it each time.
    </Tip>
  </Step>
</Steps>

Setup complete! You can now use image generation directly in any Skills-compatible AI coding tool.

## Hands-On Tutorial

### Usage 1: Command-Line Text-to-Image

The most direct approach — enter a description in the terminal and generate an image.

<CodeGroup>
  ```bash Node.js (Recommended) theme={null}
  node scripts/generate_image.js \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```

  ```bash Python theme={null}
  python scripts/generate_image.py \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```
</CodeGroup>

### Usage 2: Edit Existing Images

Pass in one or more reference images and describe the desired modification in natural language.

```bash theme={null}
node scripts/generate_image.js \
  -p "Convert this photo to Studio Ghibli animation style, keep the character composition" \
  -i "photo.jpg" \
  -f "ghibli-style.png" \
  -r 2K
```

Supports multiple reference images (up to 14), automatically converted to Base64:

```bash theme={null}
node scripts/generate_image.js \
  -p "Merge these elements into a poster" \
  -i "bg.jpg" -i "logo.png" -i "text.png" \
  -f "poster.png" \
  -a 3:4 \
  -r 4K
```

### Usage 3: Inside AI Coding Assistants

After installing the Skill, use natural language commands in supported AI coding tools:

* **Codex CLI / OpenCode**: "Generate a 16:9 cyberpunk cityscape wallpaper in 4K"
* **Cursor**: "Generate a product logo, minimalist style, 1:1 ratio"
* **Gemini CLI**: "Edit input.jpg, change the background to a sunset beach"

The AI assistant will automatically invoke the Skill to generate images.

## Command Parameters

| Parameter        | Short | Required | Description                                       | Example          |
| ---------------- | ----- | -------- | ------------------------------------------------- | ---------------- |
| `--prompt`       | `-p`  | Yes      | Image description or edit instruction             | `"a cat"`        |
| `--filename`     | `-f`  | No       | Output file path (auto-generated if omitted)      | `"output.png"`   |
| `--aspect-ratio` | `-a`  | No       | Aspect ratio                                      | `16:9`           |
| `--resolution`   | `-r`  | No       | Resolution (must be uppercase)                    | `1K`, `2K`, `4K` |
| `--input-image`  | `-i`  | No       | Input image path (can specify multiple, up to 14) | `"photo.jpg"`    |
| `--key`          | `-k`  | No       | Inline API Key (env var recommended)              | `"sk-xxx"`       |

### Supported Aspect Ratios

`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`

### Resolution & Processing Time

| Resolution   | Approx. Time | Best For                    |
| ------------ | ------------ | --------------------------- |
| 1K           | \~30 seconds | Quick preview, testing      |
| 2K (default) | 1-4 minutes  | Daily use, social media     |
| 4K           | Longer       | HD posters, print materials |

## FAQ

<AccordionGroup>
  <Accordion title="Installation error?">
    Check the following:

    1. Node.js is installed (run `node -v` to confirm)
    2. Network connection is working
    3. If npx is unavailable, manually clone the repo:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    Then copy the `skills/nano-banana-pro-image-gen` directory to your Skills folder.
  </Accordion>

  <Accordion title="API Key invalid error?">
    Please verify:

    1. The `APIYI_API_KEY` environment variable is correctly set (starts with `sk-`)
    2. Your APIYI account has sufficient balance
    3. You can also test with the `-k` parameter to pass the key directly
  </Accordion>

  <Accordion title="Resolution parameter not working?">
    Resolution must be **uppercase**: `1K`, `2K`, `4K`. Lowercase `1k`, `2k` will not be recognized.
  </Accordion>

  <Accordion title="Image generation is slow?">
    * 4K resolution inherently requires longer processing (may exceed 5 minutes)
    * Use 1K resolution first to test prompts and composition
    * Switch to 2K or 4K for the final version once satisfied
  </Accordion>

  <Accordion title="How to get an APIYI API key?">
    Visit [APIYI Console](https://api.apiyi.com/token), register an account and generate a new key in the Token section. New users receive free trial credits.
  </Accordion>

  <Accordion title="Which AI coding tools are supported?">
    Currently adapted for: Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp. Any tool supporting the Skills protocol can use it.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Nano Banana Pro Docs" icon="banana" href="/en/api-capabilities/nano-banana-image">
    View Nano Banana Pro full API documentation and pricing
  </Card>

  <Card title="APIYI GPT-Image 2 Skills (same author)" icon="puzzle" href="/en/scenarios/ecosystem/apiyi-gpt-image-skills">
    wuchubuzai2018's sister skills for `gpt-image-2` / `gpt-image-2-all`
  </Card>

  <Card title="Nano Banana ComfyUI Nodes" icon="workflow" href="/en/scenarios/ecosystem/nano-banana-comfyui">
    Use Nano Banana image generation in ComfyUI
  </Card>

  <Card title="Image Failure Troubleshooting" icon="circle-question-mark" href="/en/faq/nano-banana-image-failure">
    Nano Banana image generation troubleshooting guide
  </Card>

  <Card title="APIYI - Token Management" icon="settings" href="https://api.apiyi.com/token">
    Manage API keys, view usage and balance
  </Card>
</CardGroup>
