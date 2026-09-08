> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LobeHub

> Open-source AI chat client integration guide with custom providers and local knowledge base

LobeHub is an open-source, cross-platform AI chat client (formerly Lobe Chat) that supports multiple models, multimodal input, a plugin marketplace, and a local knowledge base. With APIYI, you can use a single API key in LobeHub to access 400+ mainstream AI models — no need to sign up and pay each provider separately.

<CardGroup cols={3}>
  <Card title="Open-source & Self-hostable" icon="github">
    Desktop, web, Docker, or Vercel — your data, your control
  </Card>

  <Card title="Plugins & Multimodal" icon="plug">
    Built-in web search, code interpreter, vision, and video generation plugins
  </Card>

  <Card title="Local Knowledge Base" icon="database">
    Upload PDFs and Markdown to build a RAG pipeline over your private data
  </Card>
</CardGroup>

## Quick Start

### 1. Get your APIYI API key

See the [API Key Management Guide](/en/faq/token-management) to get your API key.

### 2. Install LobeHub

LobeHub offers three ways to use it:

* **Desktop**: Official client for Windows, macOS, and Linux — download from `lobechat.com`
* **Web (official)**: Just visit `lobechat.com`, sign up, and use it without any self-hosting
* **Self-hosted**: Deploy via Docker / Vercel / local source — great for enterprise or privacy needs

<Tip>
  For personal use, we recommend the official web or desktop client. If you have data privacy or compliance requirements, self-host with Docker (just configure APIYI via environment variables).
</Tip>

### 3. Create a custom provider

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-create-provider.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=ddda3ebd3c4aa4e60aa6c9f87bd14ecb" alt="LobeHub — Create custom AI service provider" width="763" height="916" data-path="images/lobehub-create-provider.png" />

Go to `Settings → Model Providers`, click the `+` icon at the top right to add a custom provider, and fill in the fields as shown above:

| Field                    | Value                      | Notes                                              |
| ------------------------ | -------------------------- | -------------------------------------------------- |
| **Provider ID**          | `apiyi`                    | Unique identifier — cannot be changed once created |
| **Provider Name**        | `apiyi`                    | Custom display name                                |
| **Provider Description** | `apiyi`                    | Custom description                                 |
| **Provider Logo**        | (leave blank)              | Optional — custom logo URL                         |
| **Request Format**       | `OpenAI`                   | APIYI is fully OpenAI-compatible                   |
| **Proxy URL**            | `https://api.apiyi.com/v1` | Base URL — **must end with `/v1`**                 |
| **API Key**              | Your APIYI API key         | Get it from the APIYI console                      |

Click the **Create** button at the bottom right to save.

<Info>
  **Configuration tips**

  * The `Proxy URL` MUST end with `/v1`, otherwise requests will fail to route
  * Trim any leading/trailing spaces from your API key when pasting
  * Choose `OpenAI` as the request format to access all 400+ APIYI models
  * One key works across all enabled models — pay only for what you use
</Info>

### 4. Verify connectivity

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-configured.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=b230b3aac1cd11cb9bd186d020ce8b73" alt="LobeHub — Configured provider view" width="1473" height="913" data-path="images/lobehub-configured.png" />

After creating the provider, you'll land on its detail page. From here you can:

1. **Confirm or update the API Key and Proxy URL**
2. **Enable advanced options** (optional):
   * `Use Responses API spec` — enables OpenAI's newer request format (OpenAI models only)
   * `Use client-side request mode` — browser sends requests directly, can improve response speed
3. **Connectivity check** — pick a model from the dropdown and click **Check**
4. **Fetch model list** — click the **Fetch model list** button to pull all available models from APIYI

After a successful fetch, the `Model list` shows everything APIYI currently offers, grouped by type: Chat, Image, Video, Embedding, ASR, TTS.

<Warning>
  If the connectivity check fails, work through this checklist:

  * Does the proxy URL end with `/v1`?
  * Is the API key still valid? (verify in the APIYI console)
  * Can your network reach `api.apiyi.com`?
  * Is a firewall or proxy blocking HTTPS traffic?
</Warning>

### 5. Pick a model and start chatting

In the chat UI's model dropdown, select a model like `claude-opus-5`, `gpt-5-6-terra`, or `deepseek-v4-pro` and you're ready to go.

<Card title="See today's top model recommendations" icon="star" href="/en/api-capabilities/model-info">
  Browse the latest model recommendations, performance comparisons, and scenario-based usage tips — covering writing, coding, fast response, image generation, video generation, and more.
</Card>

<Info>
  **Why no concrete model list here?**

  AI models iterate extremely fast. To keep recommendations accurate, we maintain the latest model list, performance data, and usage tips in the [Model Recommendation page](/en/api-capabilities/model-info).
</Info>

## Access All 400+ Models With One Provider

LobeHub ships with built-in channels for many mainstream providers, each needing its own key. With APIYI you create **one** custom provider that covers every model:

| Channel                       | Models                                                | Key advantage                               | API endpoint               |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------- | -------------------------- |
| **OpenAI-compatible (apiyi)** | All 400+ models (Claude, Gemini, GPT, DeepSeek, etc.) | One key unlocks everything — simplest setup | `https://api.apiyi.com/v1` |

<Tip>
  **One apiyi channel covers Claude, Gemini, and every other model**

  APIYI wraps Claude, Gemini, GPT, DeepSeek, and other top models under the OpenAI-compatible protocol. So a single `apiyi` custom provider in LobeHub gives you access to all 400+ models in the dropdown — no need to set up separate channels per vendor.
</Tip>

## LobeHub Features Deep Dive

### Plugin marketplace

LobeHub ships with a rich plugin marketplace (`Settings → Plugins`). Recommended plugins:

* **Web Search** — give models real-time internet access
* **Code Interpreter** — run Python in-chat for data analysis and visualization
* **Chart Generation** — auto-generate flowcharts and mind maps
* **Image Generation** — generate images via models like `gpt-image-2` and `gemini-3-pro-image`

### Local knowledge base (RAG)

LobeHub can build a local vector store from your files:

1. Go to the `Knowledge Base` page and create a new knowledge base
2. Upload PDF, Markdown, Word, Excel, or TXT files
3. The system chunks and embeds them automatically
4. In chat, select the knowledge base and the model will answer grounded in your files

<Warning>
  The embedding step calls an embedding model (which is billed). We recommend using APIYI's `text-embedding-3-large` or similar embedding models.
</Warning>

### Multimodal chat

Upload images for vision understanding, recognition, and OCR:

* Recommended vision models: `gemini-3-6-flash`, `claude-opus-5`, `gpt-5-6-terra`
* Just drag an image into the chat input and the model will recognize it

### Agent marketplace

LobeHub ships with a rich set of preset agents (translation, writing, coding, interview prep, etc.). You can also:

* One-click enable any community-shared agent from the `Agent marketplace`
* Build your own agent — custom persona, prompt, opening line, knowledge base, and plugins

### Conversation management

* Branch conversations, edit messages, regenerate responses
* Export conversations as Markdown, PNG, or JSON
* Global search across message history

## Advanced configuration

### Custom request parameters

You can tune common parameters on the provider detail page:

```yaml theme={null}
Default parameters:
  Temperature: 0.7        # Creativity (reasoning models such as the GPT-5.6 series must use 1)
  Top P: 0.9              # Sampling (reasoning models must use 1)
  Max Tokens: 4096        # Maximum output length
  Context Length: 8192    # Context window
```

<Warning>
  Some reasoning models (such as the GPT-5.6 series) only support `Temperature = 1` and `Top P = 1`. Other values are ignored or cause errors server-side.
</Warning>

### Network proxy and self-hosting

For proxy use or self-hosted LobeHub:

1. **Desktop client**: `Settings → Network` to configure HTTP/HTTPS proxy
2. **Self-hosted (Docker)**: inject APIYI config via environment variables:
   ```bash theme={null}
   OPENAI_API_KEY=sk-your-apiyi-key
   OPENAI_PROXY_URL=https://api.apiyi.com/v1
   CUSTOM_MODELS=gpt-5-6-terra,claude-opus-5,deepseek-v4-pro
   ```
3. **Client-side request mode**: enables browser-direct requests (only if the browser can reach APIYI)

### Keyboard shortcuts

| Shortcut               | Action           |
| ---------------------- | ---------------- |
| `Ctrl/Cmd + N`         | New conversation |
| `Ctrl/Cmd + K`         | Quick search     |
| `Ctrl/Cmd + /`         | Command palette  |
| `Ctrl/Cmd + Shift + M` | Switch model     |

## Mobile

LobeHub's desktop client runs on Windows / macOS / Linux. For mobile, use the responsive web app at `lobechat.com` — no separate install required.

## Troubleshooting

### Connection failure / connectivity check fails

| Symptom    | What to check                                                          |
| ---------- | ---------------------------------------------------------------------- |
| 401 / 403  | API key invalid or balance exhausted — verify in the APIYI console     |
| 404        | Proxy URL missing the `/v1` suffix                                     |
| Timeout    | Network issue — check proxy or firewall                                |
| CORS error | Turn off `Client-side request mode`, or go through a server-side proxy |

### Model list is empty

* Click **Fetch model list** to pull again
* Wait 1-2 seconds, then refresh the page
* Confirm the API key is active in the APIYI console

### Slow response or stream interruptions

* Switch to a faster model (e.g., `gemini-3-5-flash-lite`, `claude-haiku-4-5`, `deepseek-v4-flash`)
* Disable unneeded plugins
* Check network latency
* Trim long context (close stale conversations)

### Knowledge base retrieval is inaccurate

* Reduce chunk size for finer-grained retrieval
* Switch to a stronger embedding model on APIYI
* Add more relevant documents to boost recall

## Best Practices

### Model selection strategy

Use the right model for the right task — match by complexity:

* **Daily chat / simple Q\&A**: `gemini-3-5-flash-lite`, `claude-haiku-4-5`, `deepseek-v4-flash`
* **Complex reasoning / long-doc analysis**: `claude-opus-5`, `gpt-5-6-sol`, `deepseek-v4-pro`
* **Coding**: `claude-opus-5`, `gpt-5-6-sol`, `claude-sonnet-5`
* **Image understanding**: `gemini-3-6-flash`, `claude-opus-5`, `gpt-5-6-terra`
* **Image generation**: `gpt-image-2`, `gemini-3-pro-image`

For the full model list and performance comparisons, see the [Model Recommendation page](/en/api-capabilities/model-info).

### Context management

* Periodically prune stale conversations
* Break complex tasks into shorter conversations
* Use the `branch conversation` feature to explore alternative replies

### Security and privacy

* Don't share your API key in public
* Rotate keys periodically (one-click reset in the APIYI console)
* For sensitive conversations, self-host LobeHub — data stays local

### Self-hosting tips

* Use Docker + PostgreSQL in production, not the built-in DB
* Put Cloudflare in front as a reverse proxy
* Manage secrets via environment variables for easy multi-instance deployment

## Comparison with other clients

All three clients connect to APIYI the same way (OpenAI-compatible protocol). They differ mainly in deployment model and feature focus:

| Feature                        | LobeHub                                      | [Chatbox AI](/en/scenarios/chat/chatbox) | [Cherry Studio](/en/scenarios/chat/cherry-studio) |
| ------------------------------ | -------------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| **Deployment**                 | Desktop + web + Docker / Vercel self-hosting | Desktop + mobile + web                   | Desktop + mobile                                  |
| **Local knowledge base (RAG)** | Built-in vector store                        | Per-conversation document understanding  | Built-in knowledge base                           |
| **Plugins / extensions**       | Plugin marketplace, rich ecosystem           | Common capabilities built in             | Mostly built-in capabilities                      |
| **Channel protocols**          | OpenAI-compatible                            | OpenAI-compatible                        | OpenAI / Anthropic / Gemini                       |
| **Mobile**                     | Responsive web                               | Native apps                              | Native apps                                       |

<Tip>
  **When to choose LobeHub?**

  * You need a **persistent local knowledge base** or a **plugin ecosystem** (web search, code interpreter, charts, etc.)
  * You want **private deployment** (Docker / Vercel) with full data control
  * You want one **unified interface** across desktop + web

  All three are solid choices: pick Chatbox AI if you value **native mobile apps and local storage**; pick Cherry Studio if you need **Claude / Gemini native protocols** (including Prompt Cache).
</Tip>

Need more help? Check the `lobechat.com` docs or visit the [APIYI website](https://api.apiyi.com).
