> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini CLI

> Use Gemini CLI through APIYI for AI-assisted programming, including code generation, code review, Q&A, and more

## Overview

Gemini CLI is Google's official command-line tool that allows you to interact directly with Gemini AI models in your terminal. Through APIYI, you can:

* 🚀 Quickly call Gemini models in terminal
* 💻 AI-assisted programming and code generation
* 🔍 Code review and optimization suggestions
* 📝 Technical Q\&A and documentation generation
* 🌐 Cross-platform support (Linux, macOS, Windows)

<Info>
  **Why Choose APIYI?**

  Using Gemini CLI through APIYI provides more stable network connections, better pricing, and 24/7 technical support.
</Info>

## Quick Start

### Prerequisites

* Node.js >= 18.0.0
* npm or yarn package manager
* APIYI account and API Key

### Step 1: Install Gemini CLI

<CodeGroup>
  ```bash npm theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install Gemini CLI globally
  npm install -g @google/gemini-cli

  # Verify installation
  gemini --version
  ```

  ```bash yarn theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install with yarn
  yarn global add @google/gemini-cli

  # Verify installation
  gemini --version
  ```
</CodeGroup>

### Step 2: Get APIYI API Key

<Steps>
  <Step title="Register/Login to APIYI">
    Visit `api.apiyi.com` to register or login
  </Step>

  <Step title="Create API Key">
    Go to dashboard "Token Management" page (`api.apiyi.com/token`) and click "Create New Token"
  </Step>

  <Step title="Copy Key">
    Copy the generated API Key (format: `sk-***`) and keep it safe
  </Step>
</Steps>

### Step 3: Configure Environment Variables

<Warning>
  **Important Configuration**: `GOOGLE_GEMINI_BASE_URL` must be set to `https://api.apiyi.com` without any additional paths (like `/v1` or `/gemini`), otherwise connection will fail.
</Warning>

<Tabs>
  <Tab title="Zsh (macOS/Linux)">
    ```bash theme={null}
    # Edit .zshrc file
    nano ~/.zshrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.zshrc
    ```
  </Tab>

  <Tab title="Bash (Linux)">
    ```bash theme={null}
    # Edit .bashrc file
    nano ~/.bashrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="PowerShell (Windows)">
    ```powershell theme={null}
    # Set environment variables
    $env:GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    $env:GEMINI_API_KEY="sk-your-api-key"

    # Save permanently (optional)
    [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
    [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
    ```
  </Tab>

  <Tab title="CMD (Windows)">
    ```cmd theme={null}
    # Temporary environment variables
    set GOOGLE_GEMINI_BASE_URL=https://api.apiyi.com
    set GEMINI_API_KEY=sk-your-api-key

    # Save permanently (requires admin)
    setx GOOGLE_GEMINI_BASE_URL "https://api.apiyi.com"
    setx GEMINI_API_KEY "sk-your-api-key"
    ```
  </Tab>
</Tabs>

### Step 4: Initialize and Test

<Steps>
  <Step title="Launch Gemini CLI">
    ```bash theme={null}
    gemini
    ```
  </Step>

  <Step title="First-time Authentication">
    In the interactive interface, type:

    ```bash theme={null}
    /auth
    ```

    Select: **Gemini API Key (AI Studio)**
  </Step>

  <Step title="Test Connection">
    ```bash theme={null}
    # Simple test
    gemini "Hello, test connection"

    # Programming-related test
    gemini "Explain how React Hooks work"
    gemini "Write a Python function to calculate Fibonacci sequence"
    ```
  </Step>
</Steps>

## Core Features

### Code Generation

<Tabs>
  <Tab title="Function Generation">
    ```bash theme={null}
    gemini "Write a quick sort algorithm in Python with detailed comments"
    ```

    **Example Output**:

    ```python theme={null}
    def quick_sort(arr):
        """
        Quick sort algorithm
        Time complexity: Average O(n log n), Worst O(n²)
        Space complexity: O(log n)
        """
        if len(arr) <= 1:
            return arr

        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]

        return quick_sort(left) + middle + quick_sort(right)
    ```
  </Tab>

  <Tab title="Project Scaffolding">
    ```bash theme={null}
    gemini "Create an Express.js REST API project structure with user auth and database config"
    ```
  </Tab>

  <Tab title="Unit Tests">
    ```bash theme={null}
    gemini "Write Jest unit tests for this function:
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }"
    ```
  </Tab>
</Tabs>

### Code Review

```bash theme={null}
# Review code quality
gemini "Review the following code for performance issues and potential bugs:
[paste your code]
"

# Security audit
gemini "Check this code for security vulnerabilities, especially SQL injection and XSS"

# Best practices
gemini "What can be improved in this React component? Does it follow best practices?"
```

### Technical Q\&A

```bash theme={null}
# Concept explanation
gemini "Explain JavaScript closures with practical use cases"

# Error troubleshooting
gemini "Why isn't my Promise being resolved correctly?"

# Performance optimization
gemini "How to optimize React component rendering performance?"

# Architecture design
gemini "Compare microservices vs monolithic architecture"
```

### Documentation Generation

```bash theme={null}
# Generate README
gemini "Generate a professional README.md for my Node.js library with installation, usage, and API docs"

# API documentation
gemini "Generate OpenAPI 3.0 spec documentation for this REST API endpoint"

# Code comments
gemini "Add detailed JSDoc comments to the following code"
```

## Interactive Commands

In Gemini CLI interactive mode, you can use these commands:

| Command  | Description                | Example                       |
| -------- | -------------------------- | ----------------------------- |
| `/auth`  | Re-authenticate            | `/auth`                       |
| `/model` | Switch model               | `/model gemini-3-pro-preview` |
| `/clear` | Clear conversation history | `/clear`                      |
| `/help`  | Show help information      | `/help`                       |
| `/exit`  | Exit CLI                   | `/exit` or `Ctrl+C`           |
| `/save`  | Save conversation to file  | `/save conversation.txt`      |

<Tip>
  **Model Switching**: Use `/model` command to switch between different Gemini models like `gemini-3-pro-preview`, `gemini-2.5-flash`, `gemini-2.5-pro`, etc.
</Tip>

## Supported Models

Through APIYI, you can use the latest Gemini models:

### Gemini 3 Series (Recommended)

| Model                             | Use Case                                  | Features                                      |
| --------------------------------- | ----------------------------------------- | --------------------------------------------- |
| **gemini-3-pro-preview**          | High-quality code, complex reasoning      | 🏆 Top performance, #1 on LMArena leaderboard |
| **gemini-3-pro-preview-thinking** | Ultra-complex reasoning, algorithm design | 🧠 Chain-of-thought output, deep reasoning    |

### Gemini 2.5 Series

| Model                     | Use Case                         | Features                          |
| ------------------------- | -------------------------------- | --------------------------------- |
| **gemini-2.5-pro**        | Professional code generation     | ⚡ High performance, 1M context    |
| **gemini-2.5-flash**      | Fast response, daily development | 🚀 Fast speed, low cost           |
| **gemini-2.5-flash-lite** | Lightweight tasks, batch calls   | 💰 Ultra-low cost, high-frequency |

<Info>
  **Recommended Configuration**:

  * Complex programming, architecture design: `gemini-3-pro-preview`
  * Daily code generation, Q\&A: `gemini-2.5-flash`
  * Batch processing, rapid iteration: `gemini-2.5-flash-lite`
</Info>

<Card title="View Complete Model List" icon="list" href="/en/api-capabilities/model-info">
  View all Gemini models supported by APIYI, detailed pricing and performance comparison
</Card>

## Advanced Usage

### VS Code Integration

Use Gemini CLI extension in VS Code:

```json theme={null}
{
  "gemini.apiKey": "sk-your-api-key",
  "gemini.baseUrl": "https://api.apiyi.com",
  "gemini.model": "gemini-3-pro-preview",
  "gemini.temperature": 0.7,
  "gemini.maxTokens": 4000
}
```

### GitHub Actions Integration

Automated code review:

```yaml theme={null}
name: Gemini Code Review
on:
  pull_request:
    branches: [ main ]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Code Review
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          GOOGLE_GEMINI_BASE_URL: https://api.apiyi.com
        run: |
          gemini "Review this Pull Request for code quality, security, and performance:
          $(git diff origin/main...HEAD)"
```

### Batch Scripts

Create automation scripts:

```bash theme={null}
#!/bin/bash

# Batch code review
for file in src/**/*.js; do
  echo "Reviewing $file..."
  gemini "Review code quality of $file" < "$file"
done

# Generate project documentation
gemini "Generate technical documentation outline for the entire project" < README.md
```

## FAQ

<AccordionGroup>
  <Accordion title="Connection failed or authentication error?">
    **Checklist**:

    1. **Verify environment variables**:

       ```bash theme={null}
       echo $GOOGLE_GEMINI_BASE_URL
       echo $GEMINI_API_KEY
       ```

       Should output:

       * `GOOGLE_GEMINI_BASE_URL`: `https://api.apiyi.com` (no /v1 or other paths)
       * `GEMINI_API_KEY`: Complete key starting with `sk-`

    2. **Reload environment variables**:
       ```bash theme={null}
       source ~/.zshrc  # or source ~/.bashrc
       ```

    3. **Restart terminal**: Close and reopen terminal completely

    4. **Verify API Key**: Login to APIYI dashboard to confirm key is valid with sufficient balance
  </Accordion>

  <Accordion title="How to switch between Gemini models?">
    Use `/model` command in interactive mode:

    ```bash theme={null}
    /model gemini-3-pro-preview
    /model gemini-3-pro-preview-thinking
    /model gemini-2.5-flash
    ```

    Or specify directly in command:

    ```bash theme={null}
    gemini --model gemini-3-pro-preview "your question"
    gemini --model gemini-2.5-flash "quick test"
    ```
  </Accordion>

  <Accordion title="How to save conversation history?">
    **Method 1**: Use `/save` command

    ```bash theme={null}
    /save conversation-2025-01-01.txt
    ```

    **Method 2**: Redirect output

    ```bash theme={null}
    gemini "your question" > output.txt
    gemini "your question" | tee output.txt  # Display and save
    ```

    **Method 3**: Use session management

    ```bash theme={null}
    gemini --session my-project "continue previous discussion"
    ```
  </Accordion>

  <Accordion title="Node.js version doesn't meet requirements?">
    **Recommended: Use nvm to manage Node.js versions**:

    ```bash theme={null}
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Install Node.js 18+
    nvm install 18
    nvm use 18
    nvm alias default 18

    # Verify version
    node --version
    ```
  </Accordion>

  <Accordion title="Why is response slow?">
    **Possible causes and solutions**:

    1. **Network issues**: APIYI provides optimized domestic nodes, usually fast
    2. **Model selection**: Use `gemini-2.5-flash` or `gemini-2.5-flash-lite` for fastest response
    3. **Token limit**: Reduce complexity of single request
    4. **Concurrent requests**: Avoid sending too many requests simultaneously

    **Test connection speed**:

    ```bash theme={null}
    time gemini --model gemini-2.5-flash "Hello"
    ```
  </Accordion>

  <Accordion title="How to use on Windows?">
    **Recommended: Use PowerShell**:

    1. Install Node.js (download installer from official website)
    2. Run PowerShell as administrator
    3. Set environment variables:
       ```powershell theme={null}
       [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
       [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
       ```
    4. Restart PowerShell
    5. Install and use Gemini CLI

    **Or use WSL** (Windows Subsystem for Linux) for better experience.
  </Accordion>
</AccordionGroup>

## Best Practices

### Prompt Optimization

<CardGroup cols={2}>
  <Card title="Be Specific" icon="target">
    ❌ "Optimize this code"

    ✅ "Optimize this code for performance, focusing on loop efficiency and memory usage"
  </Card>

  <Card title="Provide Context" icon="book">
    ❌ "What's wrong with this function?"

    ✅ "This is a user login function encountering async errors, help me find the issue"
  </Card>

  <Card title="Step-by-Step" icon="list-ordered">
    ❌ "Help me complete the entire project"

    ✅ "Step 1: Design database models; Step 2: Create API routes; Step 3: ..."
  </Card>

  <Card title="Request Examples" icon="code">
    ❌ "Explain closures"

    ✅ "Explain JavaScript closures with 3 practical use cases and code examples"
  </Card>
</CardGroup>

### Workflow Recommendations

<Steps>
  <Step title="Define Problem">
    Clearly describe the problem to solve or feature to implement
  </Step>

  <Step title="Get Solution">
    Use Gemini CLI to generate initial solution or code
  </Step>

  <Step title="Review & Optimize">
    Ask AI to review its own code and find potential issues
  </Step>

  <Step title="Iterate">
    Gradually optimize based on feedback until requirements are met
  </Step>

  <Step title="Add Documentation">
    Generate necessary comments and documentation
  </Step>
</Steps>

## Pricing

Cost of using Gemini models through APIYI depends on your chosen model and usage.

<Card title="View Detailed Pricing" icon="dollar-sign" href="/en/api-capabilities/model-info">
  View detailed pricing and cost-effectiveness comparison for all Gemini models
</Card>

<Info>
  APIYI offers recharge bonuses: the more you recharge, the higher the bonus (10%-20%). First-time recharge gets extra bonus. View [recharge promotion details](/en/faq/recharge-promotions).
</Info>

## Related Resources

* [Gemini CLI Official Documentation](https://ai.google.dev/gemini-api/docs/cli)
* [APIYI Quick Start Guide](/en/getting-started)
* [Model Recommendations and Pricing](/en/api-capabilities/model-info)
* [Recharge Promotions](/en/faq/recharge-promotions)
* [API Manual](/en/api-manual)

## Get Help

<CardGroup cols={2}>
  <Card title="Enterprise WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Technical consultation, usage guidance
  </Card>

  <Card title="Email Inquiry" icon="mail">
    **Customer Service**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **Quick Start**: Follow the "Quick Start" section above to complete setup and start using Gemini CLI in 5 minutes!
</Tip>
