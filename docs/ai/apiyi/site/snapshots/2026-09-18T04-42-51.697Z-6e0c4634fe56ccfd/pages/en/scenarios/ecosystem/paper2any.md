> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Paper2Any - Paper Multimodal Workflow

> Community open-source paper conversion tool that transforms academic papers into architecture diagrams, technical roadmaps, PPT presentations, rebuttals, and more, powered by GPT, Claude, and other LLMs via APIYI.

## Overview

Paper2Any is an open-source multimodal workflow platform for academic papers. It converts paper PDFs, screenshots, or text into model architecture diagrams, technical roadmaps, experimental plots, PPT presentations, and more — all with one click.

<Info>
  **Project Info**

  * 🔗 Source Code: `github.com/OpenDCAI/Paper2Any`
  * 📜 License: Open Source
  * 👤 Organization: OpenDCAI
  * ⭐ Community contributed, supports multiple LLMs via APIYI
</Info>

## Why Paper2Any

<CardGroup cols={2}>
  <Card title="Multiple Output Formats" icon="layers">
    Convert papers to architecture diagrams, roadmaps, PPTs, rebuttals, and more — one tool for the entire research workflow
  </Card>

  <Card title="Flexible Model Selection" icon="sliders-horizontal">
    Dynamically switch between GPT-4o, Claude Sonnet, Qwen-VL and more via API parameters — no hardcoding needed
  </Card>

  <Card title="CLI + Web Dual Mode" icon="terminal">
    Both command-line scripts and web interface available to suit different workflows
  </Card>

  <Card title="OpenAI-Compatible API" icon="plug">
    Native support for OpenAI-compatible API format — just configure APIYI's Base URL to access 400+ models
  </Card>
</CardGroup>

## Core Modules

| Module             | Description                                           | Output Formats                                      |
| ------------------ | ----------------------------------------------------- | --------------------------------------------------- |
| **Paper2Figure**   | Generate scientific visualizations from papers        | Architecture diagrams, roadmaps (PPTX + SVG), plots |
| **Paper2Diagram**  | Create flowcharts from papers/text/images             | draw\.io / PNG / SVG                                |
| **Paper2PPT**      | Convert papers to presentations                       | PPTX (supports 40+ slides)                          |
| **Paper2Rebuttal** | Generate structured rebuttal responses                | Rebuttal docs with evidence grounding               |
| **PDF2PPT**        | Layout-preserving PDF to editable PPT                 | PPTX                                                |
| **Image2PPT**      | Transform images/screenshots into slides              | PPTX                                                |
| **PPTPolish**      | AI-driven layout optimization                         | PPTX                                                |
| **Knowledge Base** | File ingestion, semantic search, KB-driven generation | Multiple formats                                    |

## Connect to LLMs via APIYI

Paper2Any supports OpenAI-compatible API format. After configuring APIYI as the LLM endpoint, you can use GPT, Claude, Gemini, DeepSeek, and 400+ other models.

### Docker Deployment

<Steps>
  <Step title="Step 1: Get Your APIYI API Key">
    1. Visit [APIYI Console](https://api.apiyi.com) to register/login
    2. Go to the **Tokens** section
    3. Generate a new API key
    4. Copy the key (starts with `sk-`)
  </Step>

  <Step title="Step 2: Clone and Configure Backend">
    After cloning the repository, edit `fastapi_app/.env` to set APIYI as the LLM endpoint:

    ```bash theme={null}
    # fastapi_app/.env
    DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    BACKEND_API_KEY=sk-your-apiyi-key
    ```

    Optionally, specify default models for different workflows:

    ```bash theme={null}
    PAPER2PPT_DEFAULT_MODEL=gpt-4o
    PDF2PPT_DEFAULT_MODEL=gpt-4o
    ```
  </Step>

  <Step title="Step 3: Configure Frontend">
    Edit `frontend-workflow/.env` to default the web UI to APIYI:

    ```bash theme={null}
    # frontend-workflow/.env
    VITE_DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    VITE_LLM_API_URLS=https://api.apiyi.com/v1
    ```
  </Step>

  <Step title="Step 4: Launch">
    Start everything with Docker Compose:

    ```bash theme={null}
    docker compose up -d --build
    ```

    Once started, open the frontend to begin using Paper2Any.
  </Step>
</Steps>

### CLI Usage

Paper2Any provides standalone CLI scripts with `--api-url` and `--api-key` parameters for direct APIYI integration:

```bash theme={null}
# Paper to PPT
python script/run_paper2ppt_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --model gpt-4o

# Paper to Figure
python script/run_paper2figure_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --graph-type model_arch
```

<Tip>
  **Model Recommendations**: For paper-to-PPT conversion, GPT-4o or Claude Sonnet 4.5 are recommended for their strong long-document understanding and structured output capabilities. For diagram generation, vision models like Qwen-VL are also worth trying.
</Tip>

## Deployment Options

| Method                   | Requirements                               | Best For                   |
| ------------------------ | ------------------------------------------ | -------------------------- |
| **Docker (Recommended)** | One-click frontend + backend startup       | Quick start, production    |
| **Linux Native**         | Python 3.11+, LaTeX, Inkscape, LibreOffice | Development, customization |
| **Windows**              | Python 3.12, Inkscape                      | Local use                  |

<Warning>
  GPU-dependent features like PDF2PPT and Image2PPT require a separate SAM3 model server. See the project README for GPU deployment instructions.
</Warning>

## FAQ

<AccordionGroup>
  <Accordion title="How do I connect Paper2Any to APIYI models?">
    Set `DEFAULT_LLM_API_URL` to `https://api.apiyi.com/v1` and `BACKEND_API_KEY` to your APIYI key in the environment variables. For CLI mode, use the `--api-url` and `--api-key` parameters.
  </Accordion>

  <Accordion title="Which models are supported?">
    Via APIYI, you can access 400+ models including GPT-4o, Claude Sonnet 4.5, Gemini, DeepSeek, Qwen, and more. Models can be dynamically switched in the web interface without code changes.
  </Accordion>

  <Accordion title="Docker startup fails — what should I check?">
    Verify that:

    1. Docker and Docker Compose are properly installed
    2. `.env` files are correctly configured
    3. Required ports are not in use
    4. Check `docker compose logs` for detailed error messages
  </Accordion>

  <Accordion title="PPT generation errors or incomplete content?">
    * Ensure your APIYI account has sufficient balance
    * For long papers, use models with larger context windows (e.g., GPT-4o 128K)
    * Check that the paper PDF is searchable text (scanned PDFs may produce poor results)
  </Accordion>

  <Accordion title="How do I get an APIYI API key?">
    Visit the [APIYI Console](https://api.apiyi.com/token), create an account, and generate a new key in the Tokens section. New users receive free trial credits.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="APIYI Model List" icon="list" href="/en/api-capabilities/model-info">
    View the complete list of 400+ models supported by APIYI
  </Card>

  <Card title="Base URL Configuration" icon="settings" href="/en/faq/base-url-config">
    Learn how to configure APIYI Base URL in various tools
  </Card>

  <Card title="APIYI Token Management" icon="key" href="https://api.apiyi.com/token">
    Manage API keys, check usage and balance
  </Card>

  <Card title="APIYI Pricing" icon="banknote" href="https://api.apiyi.com/account/pricing">
    View model pricing and top-up offers
  </Card>
</CardGroup>
