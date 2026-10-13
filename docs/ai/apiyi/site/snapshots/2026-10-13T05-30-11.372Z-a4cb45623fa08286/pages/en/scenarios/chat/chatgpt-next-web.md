> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> One-click deployment web-based ChatGPT integration guide

ChatGPT Next Web is a carefully designed ChatGPT web client that supports one-click deployment and multiple AI models.

## Quick Deployment

### Vercel One-Click Deployment

1. Open the one-click deploy page: `vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web`
2. Set environment variables:
   * `OPENAI_API_KEY`: Your APIYI key
   * `BASE_URL`: `https://api.apiyi.com`
3. Complete deployment

### Docker Deployment

```bash theme={null}
docker run -d \
  --name chatgpt-next-web \
  -p 3000:3000 \
  -e OPENAI_API_KEY="Your APIYI key" \
  -e BASE_URL="https://api.apiyi.com" \
  yidadaa/chatgpt-next-web
```

## Configuration Instructions

### Basic Configuration

Configure on the settings page:

* **API Key**: Enter APIYI key
* **API Address**: `https://api.apiyi.com`

### Non-OpenAI Models

For models like Claude, Gemini:

1. Add in "Custom Models"
2. Format: `+model-name@OpenAI`
3. Example: `+claude-opus-5@OpenAI`

## Core Features

### Preset Prompts

Built-in rich prompt templates

### Mask Feature

Create preset AI roles

### Conversation Export

Supports Markdown, image, PDF formats

### Access Control

Set password protection for your application

## Environment Variables

```bash theme={null}
# API Configuration
OPENAI_API_KEY=Your APIYI key
BASE_URL=https://api.apiyi.com

# Access Control
CODE=Your access password

# Model Configuration
DEFAULT_MODEL=gpt-5.4-mini
CUSTOM_MODELS=+claude-opus-5@OpenAI
```

## Usage Tips

### Model Selection Strategy

<Card title="See the models people are using right now" icon="star" href="/en/api-capabilities/model-info">
  Up-to-date model recommendations, performance comparisons and scenario-based guidance, covering writing, coding, image generation and video generation.
</Card>

### Prompt Optimization

```markdown theme={null}
# Role Setting
You are an experienced [specific role]

# Task Description
Please help me [specific task]

# Output Requirements
- Requirement 1
- Requirement 2
```

## Common Issues

### Models Not Showing

Ensure using v2.13.0+ version

### Connection Failed

Check API address: `https://api.apiyi.com`

### Reply Interrupted

Check account balance and network connection

## Update Maintenance

### Vercel Update

Sync fork in GitHub, Vercel automatically redeploys

### Docker Update

```bash theme={null}
docker pull yidadaa/chatgpt-next-web
docker stop chatgpt-next-web
docker rm chatgpt-next-web
# Re-run container
```


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.