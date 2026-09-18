> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Obsidian Copilot

> Connect the Copilot plugin in Obsidian to APIYI and chat with your personal knowledge base

Obsidian Copilot is an open-source AI assistant plugin for Obsidian with a clean, privacy-first design. It lets you connect any OpenAI-compatible model service with your own API key, create custom prompts, and chat with your entire vault to get answers and insights from your personal knowledge base.

Through APIYI, you can access 400+ mainstream models — GPT, Claude, Gemini, DeepSeek, and more — inside Obsidian with a single account, no need to register on multiple platforms.

## Key Features

<CardGroup cols={2}>
  <Card title="Chat with Your Vault" icon="messages-square">
    Vault QA mode retrieves across your entire vault via vector indexing, answering questions from your personal knowledge base
  </Card>

  <Card title="Custom Prompts" icon="wand-sparkles">
    Built-in commands for summarizing, translating, and rewriting, plus custom prompts to process selected text in one click
  </Card>

  <Card title="Privacy First" icon="shield-check">
    Open-source plugin, local data storage, and API keys kept only in your local configuration
  </Card>

  <Card title="Flexible Model Access" icon="plug">
    Works with any OpenAI-compatible endpoint — switch freely between 400+ models via APIYI
  </Card>
</CardGroup>

## Quick Start

### Step 1: Get Your APIYI Key

1. Open the [APIYI website](https://api.apiyi.com) and sign up (or log in if you already have an account)
2. Go to the "Tokens" page in the console and create a new API key
3. Copy the key (it starts with `sk-...`) for later use

### Step 2: Install the Obsidian Copilot Plugin

<Steps>
  <Step title="Install Obsidian">
    Download and install Obsidian from the official site: `obsidian.md`
  </Step>

  <Step title="Open the Community Plugin Market">
    Go to Obsidian **Settings → Community plugins**, turn off "Restricted mode", and click "Browse"
  </Step>

  <Step title="Install and Enable Copilot">
    Search for **Copilot** (by Logan Yang), then install and enable it
  </Step>
</Steps>

### Step 3: Configure an APIYI LLM Model

<Steps>
  <Step title="Open Copilot Settings">
    Go to **Settings → Copilot** and switch to the **Model** tab
  </Step>

  <Step title="Add a Custom Model">
    In the Chat Models section, click **Add Custom Model** and fill in:

    | Field          | Value                                             |
    | -------------- | ------------------------------------------------- |
    | **Model Name** | A model name, e.g. `gpt-5.2` or `claude-sonnet-5` |
    | **Provider**   | Select **3rd party (openai-format)**              |
    | **Base URL**   | `https://api.apiyi.com/v1`                        |
    | **API Key**    | Your APIYI key (`sk-...`)                         |
  </Step>

  <Step title="Verify and Add">
    Click **Verify** to test connectivity, then click **Add Model** to finish
  </Step>
</Steps>

<Info>
  **Configuration Notes**

  * The Base URL must include the `/v1` suffix: `https://api.apiyi.com/v1`
  * The model name must exactly match a model supported by APIYI — check the [model list](https://api.apiyi.com/account/models)
  * You can add multiple models and switch between them anytime in the chat panel
</Info>

### Step 4: Configure an Embedding Model (Required for Vault QA)

To use Vault QA (knowledge-base Q\&A) mode, you also need an embedding model:

1. In the **Embedding Models** section of Copilot settings, click **Add Custom Model**
2. Enter an embedding model name: `text-embedding-3-small` (cost-effective) or `text-embedding-3-large` (higher accuracy) recommended
3. Select **3rd party (openai-format)** as the provider
4. Set Base URL to `https://api.apiyi.com/v1` and enter your APIYI key
5. Click **Add Model** to finish

### Step 5: Save and Start Using

Select the newly added model as your default, then click **Save and Reload**. You can now:

* Click the Copilot icon in the left sidebar to open the chat panel
* Talk to the model directly in **Chat** mode
* Ask questions across your entire vault in **Vault QA** mode (the first use requires waiting for the index to build)

## Supported Models

Obsidian Copilot supports 400+ mainstream AI models through APIYI, including OpenAI, Claude, Gemini, DeepSeek, and Chinese models.

<Card title="View Latest Model Recommendations" icon="star" href="/en/api-capabilities/model-info">
  See the latest model recommendations, performance comparisons, and usage advice. The model list is continuously updated so you always use the newest and strongest AI models.
</Card>

<Info>
  **Why don't we list specific models here?**

  AI models iterate very quickly. To ensure you get the most accurate recommendations, we maintain the latest model list, performance data, and usage advice on the [model recommendation page](/en/api-capabilities/model-info).
</Info>

<Tip>
  **Scenario-based Suggestions**

  * **Everyday note Q\&A**: pick a fast, low-cost lightweight model
  * **Long-form summarizing / deep writing**: pick a flagship model with a long context window
  * **Vault QA embedding**: `text-embedding-3-small` covers the vast majority of knowledge-base scenarios
</Tip>

## Advanced Features

### Custom Commands and Prompts

Copilot lets you save frequent operations as custom commands:

1. Open the **Commands** section in Copilot settings
2. Create a custom prompt, e.g. "Rewrite the selection as a weekly report"
3. Select text in the editor and invoke it via the command palette (`Ctrl/Cmd + P`)

### Working with Selected Text

Select any passage in a note and call the built-in commands directly:

* **Summarize**: summarize the selection in one click
* **Translate**: translate into a specified language
* **Simplify / Fix grammar**: simplify wording or fix grammar
* **Generate table of contents**: create a TOC

### CORS Compatibility Mode

If chat requests fail after configuration, enable the **CORS** option when adding the model.

<Warning>
  With CORS mode enabled, Obsidian does not support streaming output — the reply appears all at once after generation completes. APIYI's standard endpoint usually does not need this option; only try it if requests fail.
</Warning>

## Troubleshooting

<AccordionGroup>
  <Accordion title="Verify fails or chat gets no response">
    * Check that the Base URL is `https://api.apiyi.com/v1` (including `/v1`)
    * Make sure the API key was copied correctly with no extra spaces
    * Confirm your account has sufficient balance
    * If it still fails, try enabling the CORS option in the model settings
  </Accordion>

  <Accordion title="Model not found error">
    * The model name must exactly match a name supported by APIYI (case-sensitive)
    * Check the exact model name in the [model list](https://api.apiyi.com/account/models)
  </Accordion>

  <Accordion title="Vault QA doesn't work or indexing fails">
    * Make sure a separate embedding model is configured (an LLM model cannot double as the embedding model)
    * Indexing a large vault for the first time takes a while — please be patient
    * After changing the embedding model, rebuild the index (Force Re-index)
  </Accordion>

  <Accordion title="Slow responses">
    * Switch to a faster lightweight model
    * Reduce the conversation context length
    * In Vault QA mode, lower the number of retrieved chunks
  </Accordion>
</AccordionGroup>

## Tips

1. **Divide work between models**: add multiple models — use a lightweight model for everyday Q\&A and switch to a flagship model for deep writing to save cost
2. **Scope the index**: exclude attachments and template folders in Copilot settings to reduce embedding cost and improve retrieval quality
3. **Leverage custom prompts**: turn high-frequency operations (e.g. "organize meeting notes") into commands — configure once, reuse forever
4. **Rebuild the index regularly**: run Force Re-index after major vault changes to keep Vault QA retrieval accurate

## Related Resources

<CardGroup cols={2}>
  <Card title="Model Recommendations" icon="star" href="/en/api-capabilities/model-info">
    See the latest model list and scenario-based recommendations
  </Card>

  <Card title="Getting Started" icon="rocket" href="/en/getting-started">
    Register an APIYI account and create a key in 3 minutes
  </Card>

  <Card title="Base URL Configuration" icon="circle-question-mark" href="/en/faq/base-url-config">
    Learn how to correctly fill in the API endpoint in different tools
  </Card>

  <Card title="Cherry Studio" icon="cherry" href="/en/scenarios/chat/cherry-studio">
    Another powerful desktop AI chat client
  </Card>
</CardGroup>

<Info>
  Obsidian Copilot open-source repository: `github.com/logancyang/obsidian-copilot`
</Info>
