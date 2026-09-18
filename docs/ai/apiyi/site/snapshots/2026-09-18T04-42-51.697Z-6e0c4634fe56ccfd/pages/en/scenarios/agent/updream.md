> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Connect Updream to APIYI

> Use the external model connector in Updream to call APIYI image models for AI creative tasks

<Tip>
  Updream is an AI video creation platform for Bilibili creators, professional creators, and content teams. After connecting an external model through the connector, you can call APIYI image models from Updream's creative workflow.
</Tip>

## What is Updream?

Updream combines Agent conversations, a node-based infinite canvas, a Skill library, and multi-model generation to support the workflow from ideas and scripts to storyboards, assets, and video creation.

You can start with a one-line idea, story outline, existing script, or reference material and use the Agent to refine the creative direction. After confirming the plan, you can continue with scripts, storyboards, characters, scenes, props, and other creative assets. Frequently used creative practices can also be saved as Skills and reused across projects.

The official site describes these core capabilities:

* **Agent-assisted ideation**: Refine creative direction and content plans through natural-language conversations.
* **Script and storyboard generation**: Turn ideas into scripts, storyboard tables, and shot-level assets.
* **Infinite-canvas workflows**: Organize text, images, video, and other creative assets with nodes.
* **Skill library**: Save prompt optimization, character design, and style-consistency practices as reusable Skills.
* **Multi-model creation**: Choose image, video, or other model capabilities for each task.

This guide uses Updream's **External Model Connector** to show how to use APIYI's OpenAI-compatible configuration to generate an image. The screenshot example uses `gpt-image-2`; check the current APIYI model documentation for the exact model ID and parameters.

## Why connect Updream to APIYI?

Connecting Updream to APIYI lets you:

* Configure external models with one API key.
* Enter the Base URL, API key, and model ID directly in Updream.
* Switch between APIYI models based on the creative task.
* Reuse generated images as storyboard, character, scene, or other creative assets.
* Keep Updream's Agent, Skill, and canvas workflow.

## Before you start

Prepare the following:

* Updream installed and signed in.
* A valid APIYI API key.
* Available balance in your APIYI account.
* The model ID you want to use, such as `gpt-image-2`.

<Warning>
  API keys are sensitive credentials. Do not publish a real key in screenshots, documentation, or public chats. Prefer a temporary or restricted key and revoke it after the task is complete.
</Warning>

## Step 1: Open the External Model Connector

1. Open Updream and select **Skills** in the left sidebar.
2. Open **Skill Marketplace**.
3. Search for **External Model Connector**.
4. Select the **External Model Connector** result.
5. Click **Use Now**.

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-market.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=355bcaabca93495564c10abc477d82a4" alt="External Model Connector in the Updream Skill Marketplace" width="1579" height="766" data-path="images/updream-skill-market.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-skill-detail.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ed70b83ecbc1d7f043adcc459aaeb546" alt="Updream External Model Connector details" width="1456" height="804" data-path="images/updream-skill-detail.png" />

The details page shows support for text and image inputs, with image, video, and text output options. This guide only documents the image-generation flow verified by the screenshots.

## Step 2: Choose the connection protocol

In the **Connection** step, choose:

> **OpenAI Compatible (Recommended)**

Enter the APIYI Base URL and API key in the custom response. The APIYI Base URL shown in the screenshot is:

```text theme={null}
https://api.apiyi.com/v1
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-connection.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=066b622f4017d306ec63443122e7cbb5" alt="Select the OpenAI-compatible protocol" width="805" height="466" data-path="images/updream-connection.png" />

<Info>
  This guide uses the OpenAI-compatible configuration shown in the screenshot. Google GenAI, Gemini REST, Seedance, and Generic JSON are outside the scope of this verified configuration. Do not reuse this page's parameters for those protocols without checking their requirements.
</Info>

## Step 3: Choose the task type

In the **Task** step, choose:

> **Generate Image (Recommended)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3d9b5efe007777b45306d8a8da30479" alt="Select the image-generation task" width="806" height="462" data-path="images/updream-task.png" />

This option generates an image directly from a prompt. The External Model Connector also shows options for image editing, text generation, video submission, and task polling. Those tasks require separate configuration based on the actual model, protocol, and endpoint; this guide does not reuse image settings for video tasks.

## Step 4: Choose how to provide the model

In the **Model** step, choose:

> **Model Name as Interface ID**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=8d0a577cd0eb88c74b283a691580fd9c" alt="Choose the model ID option" width="839" height="462" data-path="images/updream-model.png" />

This option requires the model's actual interface ID. The screenshot example uses:

```text theme={null}
gpt-image-2
```

Use the exact model ID from the APIYI model documentation. Do not enter a display name, custom alias, or model name from another platform.

## Step 5: Choose how to provide parameters

In the **Parameters** step, choose:

> **I Provide Complete Parameters (Recommended)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-parameters.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=403ba71983675aa653c9a5f708d98044" alt="Choose the complete-parameters option" width="817" height="447" data-path="images/updream-parameters.png" />

With this option, you provide the image prompt, aspect ratio, size, quality, and image count in the following responses. Updream also offers **Optimize the Prompt for Me** and **Use Common Defaults**, but those options are outside the screenshot-verified path in this guide.

## Step 6: Provide API credentials

In the **Credentials** step, choose:

> **Fill It In Now (Recommended)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-credentials.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=9843e1ab900d327b7c7feace9dd5bc12" alt="Choose to provide the API credentials now" width="842" height="525" data-path="images/updream-credentials.png" />

Then provide the APIYI Base URL and API key as requested by Updream. Use your own APIYI key; do not use any sample value shown in a screenshot.

## Step 7: Provide the model name

In the **Model Name** step, choose:

> **Fill It In Now (Recommended)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-model-name.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=c3fb10101ce86c1a8998a2d2e8330098" alt="Provide the model name" width="872" height="534" data-path="images/updream-model-name.png" />

Enter the model ID you want to use:

```text theme={null}
gpt-image-2
```

To switch models, replace this value with another image model ID currently supported by APIYI and confirm that it is compatible with the selected task.

## Step 8: Provide the image prompt

In the **Prompt** step, choose:

> **Use the Original Text (Recommended)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-prompt.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=32769dbb70cc23e32466328c6f136142" alt="Choose to use the original prompt" width="860" height="535" data-path="images/updream-prompt.png" />

Then enter an image prompt, for example:

```text theme={null}
Wind blowing through a wheat field
```

If you want Updream to add details such as the subject, composition, camera, lighting, and visual constraints, choose **Allow Optimization** instead. With **Use the Original Text**, the prompt is submitted as entered.

## Step 9: Choose the output parameters

In the **Output** step, choose:

> **1:1 · 1K · Single (Recommended)**

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-output.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=cc4352948846b67a69431fe804aed3f2" alt="Choose the image output parameters" width="850" height="534" data-path="images/updream-output.png" />

The screenshot shows this configuration:

| Parameter    | Setting        |
| ------------ | -------------- |
| Aspect ratio | 1:1            |
| Resolution   | 1K             |
| Image count  | 1 image        |
| Quality      | Medium quality |

Updream also shows `16:9 · 2K · Single`, `9:16 · 2K · Single`, and **Custom Complete Parameters**. The available size, quality, and count depend on the selected model. Follow the model documentation and the options currently available in the interface.

## Step 10: Submit the APIYI configuration

After completing the previous choices, Updream asks you to submit the configuration in a specified format. The screenshot shows this example format:

```text theme={null}
Base URL: https://api.apiyi.com/v1
API Key: YOUR_API_KEY
Model: gpt-image-2
Prompt: Wind blowing through a wheat field
```

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-reference.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=be4bba305fc22f776216498ff601a2f3" alt="Example submission format for the external model configuration" width="865" height="630" data-path="images/updream-submit-reference.png" />

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-submit-example.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=ff8094bb573b32a8021091244755a5b5" alt="Example completed external model configuration" width="575" height="125" data-path="images/updream-submit-example.png" />

Before submitting, confirm that:

* The Base URL is `https://api.apiyi.com/v1`.
* The API key has been replaced with your own APIYI key.
* The model ID is correct.
* The prompt contains the complete image requirements.
* The output size, quality, and count are within the selected model's capabilities.

## Step 11: View the generated result

After submission, Updream displays the generated result. The screenshot example shows:

* Model: `gpt-image-2`
* Prompt: `Wind blowing through a wheat field`
* Format: 1:1
* Resolution: 1024 × 1024
* Count: Single image

<img src="https://mintcdn.com/apiyillc/XX6WJA-dfYlwDlZi/images/updream-task-complete.png?fit=max&auto=format&n=XX6WJA-dfYlwDlZi&q=85&s=3a5996a5b0c90c1225194834c23a534a" alt="Generated image result in Updream" width="514" height="489" data-path="images/updream-task-complete.png" />

You can continue using the generated image as reference material in Updream's creative workflow. Whether it can be connected to a particular node or task depends on that task's input type and the selected model's capabilities.

## See the latest model recommendations

<Card title="See the Latest Model Recommendations" icon="star" href="/en/api-capabilities/model-info">
  See current model recommendations, capability comparisons, and usage guidance. The list is continuously updated.
</Card>

<Info>
  Model IDs and interface parameters change over time. Check the APIYI model recommendations and the documentation for the selected model for current IDs, image sizes, quality options, and task limits.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="What Base URL should I use?">
    For the OpenAI-compatible flow verified in this guide, use `https://api.apiyi.com/v1`. Other protocols use different addresses and parameters and should not be mixed with this configuration.
  </Accordion>

  <Accordion title="What should I enter as the model name?">
    Enter the exact model ID from the APIYI documentation, such as the `gpt-image-2` shown in the screenshots. A misspelled model ID can cause a model-not-found or request error.
  </Accordion>

  <Accordion title="Can I keep the API key configured permanently?">
    This is not recommended. Use a temporary or restricted key when possible, and revoke or remove unused credentials after the task is complete.
  </Accordion>

  <Accordion title="Can I use this exact configuration to generate videos?">
    Do not assume that you can. The External Model Connector interface shows video submission and task polling, but video tasks require separate settings based on the actual model, protocol, and parameters. This guide only verifies image generation.
  </Accordion>

  <Accordion title="Why did the task return no result?">
    Check whether the API key is valid, the Base URL is `https://api.apiyi.com/v1`, the model ID is correct, the model supports the selected image task, and your APIYI account has sufficient balance. If the issue continues, check both Updream's task message and the error returned by APIYI.
  </Accordion>

  <Accordion title="Why does the result not exactly match the prompt?">
    Image models interpret and generate from prompts. Try removing unrelated details, making the subject and composition explicit, placing critical requirements earlier in the prompt, or turning off **Allow Optimization** and submitting the original prompt.
  </Accordion>
</AccordionGroup>

## Related resources

<CardGroup cols={2}>
  <Card title="Updream Official Website" icon="globe">
    `www.updream.cn`
  </Card>

  <Card title="APIYI Model Recommendations" icon="star" href="/en/api-capabilities/model-info">
    See current models, capabilities, and usage guidance.
  </Card>

  <Card title="APIYI API Key Management" icon="key" href="/en/faq/token-management">
    Get and manage API keys.
  </Card>

  <Card title="APIYI API Documentation" icon="book" href="/en/getting-started">
    Learn about API integration and API calls.
  </Card>
</CardGroup>
