> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek Harness

> An open-source plugin-based AI Agent harness from DeepSeek AI with Web UI, headless CLI, and Python SDK support

## Overview

DeepSeek Harness (`dsh`) is an open-source AI Agent harness developed by DeepSeek AI. It follows an “everything is a plugin” architecture, allowing models, tools, filesystems, terminals, sessions, and workflows to be composed into an extensible agent runtime.

With APIYI, you can run DeepSeek Harness locally and use APIYI’s OpenAI-compatible endpoint to configure models, execute development tasks, and maintain persistent sessions.

<CardGroup cols={2}>
  <Card title="🧩 Plugin-based architecture" icon="puzzle">
    Compose models, tools, sessions, and workflows through plugins and extend the Agent as needed.
  </Card>

  <Card title="🌐 Web UI" icon="globe">
    Start a local Web UI with one command and configure models, workspaces, and sessions in the browser.
  </Card>

  <Card title="⌨️ Headless CLI" icon="terminal">
    Submit one-off tasks from the command line for automation scripts, batch jobs, and development workflows.
  </Card>

  <Card title="💾 Persistent sessions" icon="database">
    Persist sessions, tool calls, and workspace state to continue tasks and troubleshoot executions.
  </Card>
</CardGroup>

<Info>
  **Project information**: DeepSeek Harness is open source under the MIT license. The project repository is `github.com/deepseek-ai/deepseek-harness`. It is currently in Developer Preview, so future releases may include breaking compatibility changes.
</Info>

## Installation and startup

### Start the Web UI with npm

Install Node.js, then run:

```bash theme={null}
npx @deepseek-ai/dsh web
```

When the server starts, open `http://127.0.0.1:3080`. On the first run, configure APIYI from the model settings in the Web UI.

### Run from source

To run the repository source or contribute to the project:

```bash theme={null}
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

### Use the headless CLI

After building from source, submit a one-off task with:

```bash theme={null}
pnpm dsh --profile headless "Inspect the repository and explain the failing tests."
```

## Connect APIYI

DeepSeek Harness supports a native DeepSeek route and multi-provider routes based on `llm-pi-ai`. The current configuration uses the `apiyi` provider, the `openai-responses` protocol, and the `https://api.apiyi.com/v1` endpoint. Its default model is `deepseek-v4-pro-0813`.

The configuration file is `$DSH_HOME/settings.yaml`. When `DSH_HOME` is not set, the default Windows location is typically `C:\Users\Administrator\.dsh\settings.yaml`.

### Option 1: Configure from the Web UI (recommended)

<Steps>
  <Step title="Prepare an APIYI token">
    Create a token in the APIYI Console. Never commit a real token to a project file, shell history, or public log.
  </Step>

  <Step title="Open model settings">
    Start the Web UI, open **Settings → Models**, and choose **Add custom provider**.
  </Step>

  <Step title="Enter the provider details">
    Use the following values as a starting point:

    | Field                | Recommended value          |
    | -------------------- | -------------------------- |
    | Provider ID          | `apiyi`                    |
    | Display name         | `apiyi`                    |
    | Base URL             | `https://api.apiyi.com/v1` |
    | API protocol         | `openai-responses`         |
    | Credential reference | `APIYI_API_KEY`            |
    | Model                | `deepseek-v4-pro-0813`     |

    Your current configuration uses `deepseek-v4-pro-0813` as the default model. It also maintains other APIYI models in the configuration file; use the current APIYI model list when switching models.
  </Step>

  <Step title="Save and select a model">
    Save the provider, select the newly added model in the model picker, and start a new session to test the connection.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-config.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=283844b8bb9f276b3236661422af5be3" alt="DeepSeek Harness APIYI custom provider configuration" width="655" height="526" data-path="images/deepseek-harness-model-config.png" />

<Tip>
  When you save a key through the Web UI, DeepSeek Harness stores it in its local credential store and only returns a redacted descriptor to the page. Configuration changes take effect on the next request and normally do not require a Web UI restart.
</Tip>

### Option 2: Configure settings.yaml

For file-based configuration, declare an APIYI provider in `$DSH_HOME/settings.yaml` and reference the token through an environment variable:

```yaml theme={null}
llm-pi-ai:
  providers:
    apiyi:
      displayName: apiyi
      apiKeyEnv: APIYI_API_KEY
      api: openai-responses
      baseURL: https://api.apiyi.com/v1
      models:
        - id: deepseek-v4-pro-0813
```

macOS or Linux:

```bash theme={null}
export APIYI_API_KEY=YOUR_API_KEY
```

Windows PowerShell:

```powershell theme={null}
$env:APIYI_API_KEY = "YOUR_API_KEY"
```

`apiKeyEnv` is only a credential reference. Do not put the actual token in `settings.yaml`. To add another model, add its model ID to the `models` list.

## Common usage patterns

### Local Web Agent

Use the browser-based Web UI for code analysis, file organization, test debugging, and project maintenance. Choose a workspace for the session, then describe the goal and constraints in natural language.

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-chat.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=8e9ed8c8428b7a3fd8618db5c6ec5bbb" alt="DeepSeek Harness local Web Agent chat interface" width="934" height="758" data-path="images/deepseek-harness-model-chat.png" />

### Automated tasks

The headless profile runs one task and prints the final response, making it suitable for local scripts and automation workflows:

```bash theme={null}
pnpm dsh --profile headless "Review the changed files and summarize possible regressions."
```

### Python SDK

DeepSeek Harness provides `deepseek-harness-sdk`, which can start a runtime and call an Agent from Python. Note that the bundled Python runtime uses `deepseek-official` by default; it does not automatically inherit the `apiyi` route used by the current Web/headless configuration.

```bash theme={null}
python -m pip install deepseek-harness-sdk
```

```python theme={null}
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness(
    provider="apiyi",
    model="deepseek-v4-pro-0813",
    cwd="/absolute/path/to/workspace",
    session_root="/absolute/path/to/sessions",
    cordis="/absolute/path/to/apiyi.cordis.yml",
) as harness:
    result = harness.run(
        "Inspect the repository and summarize the failing tests.",
        session_id="example-001",
    )

print(result.final_response)
```

To use the `apiyi` route above, the custom Cordis composition must mount `@deepseek-ai/dsh-llm-pi-ai` and provide `apiKeyEnv: APIYI_API_KEY`, `api: openai-responses`, and the APIYI model list through `settings.yaml` or the composition configuration.

The Python SDK guide lists Linux x64, Linux arm64, and macOS 14 or later on arm64 for the bundled persistent-terminal composition. That composition does not support Windows Agents. Windows users should prefer the Web UI or CLI.

## Model selection

APIYI models are updated continuously. Check the latest model list, capabilities, and usage recommendations before choosing a production model:

<Card title="View the latest model recommendations" icon="star" href="/en/api-capabilities/model-info">
  Review current model recommendations, capability comparisons, and usage guidance. Use the model IDs currently available in the APIYI model list.
</Card>

## Best practices

* Use a separate session ID for each independent task. Reuse an existing ID only when you need to continue the same conversation and persistent shell state.
* The Python SDK example uses a writable workspace and a `danger-full-access` composition. Run it in a disposable checkout or container.
* Do not put API keys in `cordis.yml`, `settings.yaml`, source code, or commit logs. Prefer the Web UI credential store or an environment-variable reference.
* DeepSeek Harness is in Developer Preview. Before upgrading, confirm that your plugin configuration and model routes remain compatible.

## Frequently asked questions

<AccordionGroup>
  <Accordion title="Which provider and model does the current configuration use?">
    The current configuration uses the `apiyi` provider, the `openai-responses` protocol, the `https://api.apiyi.com/v1` Base URL, and `deepseek-v4-pro-0813` as the default model.
  </Accordion>

  <Accordion title="Which Base URL and protocol should I use for APIYI?">
    Use `https://api.apiyi.com/v1` as the Base URL and `openai-responses` as the protocol, matching the current configuration. Do not change the protocol without confirming endpoint compatibility.
  </Accordion>

  <Accordion title="Why does the model picker not show my model?">
    Check that the Provider ID is a non-empty lowercase value, the model ID is correct, and the saved configuration belongs to the `llm-pi-ai` provider. The current default is `deepseek-v4-pro-0813`; a custom model must be included in the `models` list before it can be selected.
  </Accordion>

  <Accordion title="How do I fix MISSING_CREDENTIAL?">
    In the Web UI, return to **Settings → Models** and save credentials for the provider. With `settings.yaml`, confirm that `APIYI_API_KEY` is set and that `apiKeyEnv` points to that environment variable.
  </Accordion>

  <Accordion title="What should I do if model discovery returns 401?">
    Check the APIYI token and Base URL first. DeepSeek Harness uses `GET /models` for model discovery on OpenAI-compatible custom providers. If an endpoint does not provide that route, enter the model ID manually.
  </Accordion>

  <Accordion title="Can I run the Python SDK on Windows?">
    The bundled persistent-terminal composition does not support Windows Agents. Windows users can use the Web UI or CLI; for the Python SDK, follow the platform requirements in the project documentation.
  </Accordion>

  <Accordion title="What should I do if an upgrade breaks the configuration?">
    The project is in Developer Preview, so upgrades may include breaking changes. Recheck the provider configuration, model ID, and plugin composition against the latest project documentation.
  </Accordion>
</AccordionGroup>

## Related resources

<CardGroup cols={2}>
  <Card title="APIYI quickstart" icon="book" href="/en/getting-started">
    Get an API key and learn about Base URLs and basic API usage.
  </Card>

  <Card title="APIYI model recommendations" icon="star" href="/en/api-capabilities/model-info">
    Review current models, capabilities, and usage guidance.
  </Card>

  <Card title="DeepSeek Harness repository" icon="github">
    `github.com/deepseek-ai/deepseek-harness`
  </Card>

  <Card title="DeepSeek Harness provider setup" icon="settings">
    Review the project documentation for provider, credential, and model configuration.
  </Card>
</CardGroup>

## Get help

<CardGroup cols={2}>
  <Card title="Enterprise WeChat support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan to add support or [contact support directly](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    APIYI configuration, DeepSeek Harness integration, and usage guidance
  </Card>

  <Card title="Email support" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business inquiries**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  When contacting support, include the provider, model ID, Base URL, API protocol, error message, Node.js version, usage mode, and relevant screenshots so the issue can be diagnosed faster.
</Tip>
