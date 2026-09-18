> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3 Flash Preview Launches: Pro-Level Performance at Flash Speed

> Google's latest high-performance fast model Gemini 3 Flash Preview is here! SWE-bench 78% surpasses Gemini 3 Pro, 3x faster than 2.5 Pro, MMMU-Pro 81.2% beats all competitors. API.YI launches 3 model variants with flexible reasoning modes.

## Key Highlights

* **🏆 Surpasses Pro Performance**: SWE-bench Verified 78%, exceeds Gemini 3 Pro and the entire 2.5 series
* **⚡ Lightning Fast**: 3x faster than Gemini 2.5 Pro, Pro-level performance at Flash pricing
* **🧠 Top-Tier Reasoning**: MMMU-Pro 81.2% beats all competitors, Humanity's Last Exam 33.7%
* **🎯 Three Modes**: Auto reasoning, forced reasoning, no reasoning - flexible switching for different scenarios
* **💰 Outstanding Value**: Only 1/4 the price of Gemini 3 Pro (\$0.5/\$3.0 per million tokens)
* **🚀 Available Now**: API.YI launched on December 18th with official pricing plus additional recharge discounts

## Background

On December 17, 2025, Google officially released **Gemini 3 Flash Preview**, a major update following Gemini 3 Pro Preview. As the "fast version" of the Gemini 3 series, Flash Preview achieves 3x speed improvement and significant cost reduction while maintaining Pro-level reasoning capabilities, redefining the cost-performance standard for high-performance AI models.

Surprisingly, Gemini 3 Flash Preview **surpasses Gemini 3 Pro** in coding capabilities. In the SWE-bench Verified test, Flash Preview achieved an impressive 78%, not only exceeding the 3 Pro from the same series but also comprehensively leading the entire Gemini 2.5 series. This marks Google's new breakthrough in balancing "speed and intelligence."

Google positions Gemini 3 Flash as "frontier intelligence for everyone" and has made it the default model in the Gemini app and AI Mode search. Enterprise customers like JetBrains, Figma, Cursor, and Harvey have already started using this model.

The API.YI team completed model integration immediately and officially opened Gemini 3 Flash Preview API access to all users on **December 18, 2025**, providing **3 model variants** to meet different reasoning needs. Pricing matches Google's official rates while supporting additional discounts through recharge promotions.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="🏆 Coding Beyond Pro" icon="code">
    SWE-bench Verified reaches 78%, not only surpassing Gemini 3 Pro (\~76%) but also comprehensively leading the Gemini 2.5 series. Particularly excellent in agentic coding scenarios.
  </Card>

  <Card title="⚡ 3x Speed Boost" icon="rocket">
    3x faster than Gemini 2.5 Pro while maintaining Pro-level reasoning quality. Perfect for interactive applications and real-time scenarios requiring fast response.
  </Card>

  <Card title="🧠 Top Multimodal Understanding" icon="brain">
    MMMU-Pro reaches 81.2%, surpassing all competitors. Supports text, image, video, audio, PDF and other input formats, handling all content with a single model.
  </Card>

  <Card title="💰 1/4 Price" icon="dollar-sign">
    Priced at only 1/4 of Gemini 3 Pro (\$0.5/\$3.0 vs \$2.0/\$12.0), significantly reducing costs for enterprises and developers.
  </Card>
</CardGroup>

### Performance Highlights

#### 1. Coding Capability Comparison

Gemini 3 Flash Preview's coding performance is impressive:

| Model                      | SWE-bench Verified | Agentic Coding | Performance/Price |
| -------------------------- | ------------------ | -------------- | ----------------- |
| **Gemini 3 Flash Preview** | **78%**            | ✅ Excellent    | ⭐⭐⭐⭐⭐             |
| Gemini 3 Pro               | \~76%              | ✅ Excellent    | ⭐⭐⭐               |
| Gemini 2.5 Pro             | \~72%              | ✅ Good         | ⭐⭐                |
| Gemini 2.5 Flash           | \~65%              | ✅ Good         | ⭐⭐⭐⭐              |

Flash Preview is the first Flash model to surpass its Pro counterpart in coding capabilities, offering developers the best value.

#### 2. Reasoning Capability Comparison

Across multiple authoritative benchmarks, Gemini 3 Flash Preview demonstrates exceptional reasoning abilities:

| Benchmark                | Gemini 3 Flash Preview | Gemini 2.5 Flash | Gemini 3 Pro |
| ------------------------ | ---------------------- | ---------------- | ------------ |
| **MMMU-Pro**             | **81.2%** 🥇           | \~70%            | \~82%        |
| **Humanity's Last Exam** | **33.7%**              | 11%              | 37.5%        |
| **SWE-bench Verified**   | **78%** 🥇             | \~65%            | \~76%        |

On Humanity's Last Exam (known as "humanity's last exam"), Flash Preview's 33.7% score is already close to Pro's 37.5%, far exceeding 2.5 Flash's 11%.

#### 3. Speed & Efficiency

Official Google data shows:

* **Response Speed**: **3x faster** than Gemini 2.5 Pro
* **Throughput**: Suitable for high-concurrency scenarios, supports large-scale deployment
* **Latency**: Near real-time response in interactive applications

### Technical Specifications

| Specification  | Gemini 3 Flash Preview              |
| -------------- | ----------------------------------- |
| Context Window | 1,048,576 tokens (\~1 million)      |
| Maximum Output | 65,536 tokens (\~65k)               |
| Input Formats  | Text, image, video, audio, PDF      |
| Output Format  | Text                                |
| API Endpoints  | `gemini-3-flash-preview` series     |
| Availability   | Google AI Studio, Vertex AI, API.YI |

## Model Variants

API.YI provides **3 model variants** for Gemini 3 Flash Preview to meet different reasoning needs:

### 1. gemini-3-flash-preview (Auto Reasoning)

**Recommended** - Intelligently determines whether reasoning is needed

<Card title="🎯 Auto Reasoning Mode" icon="wand-sparkles">
  **How it works**: Model automatically decides whether to enable reasoning mode based on question complexity

  **Use Cases**:

  * General conversation and Q\&A (quick response for simple questions, deep thinking for complex ones)
  * Code generation and debugging (automatically identifies complexity)
  * Mixed task scenarios (both simple and complex questions)
  * Uncertain task complexity scenarios

  **Advantages**:

  * ✅ Balances speed and quality
  * ✅ No manual switching needed
  * ✅ Automatic cost optimization
</Card>

### 2. gemini-3-flash-preview-thinking (Forced Reasoning)

**Deep Thinking** - Always enables reasoning mode, shows complete thought process

<Card title="🧠 Forced Reasoning Mode" icon="brain">
  **How it works**: Every request enables reasoning mode, output includes complete thought process in `<thinking>` tags

  **Use Cases**:

  * Complex math and logic problems
  * Multi-step reasoning tasks
  * Code architecture design and optimization
  * Scenarios requiring explainability (view reasoning process)
  * Research and academic tasks

  **Advantages**:

  * ✅ Highest quality output
  * ✅ Complete reasoning process visible
  * ✅ Suitable for complex tasks

  **Notes**:

  * ⚠️ Longer response time
  * ⚠️ Higher token consumption
</Card>

### 3. gemini-3-flash-preview-nothinking (No Reasoning)

**Fast Response** - Does not enable reasoning by default, pursues maximum speed

<Card title="⚡ Fast Response Mode" icon="bolt">
  **How it works**: Does not enable reasoning mode by default, outputs results directly

  **Use Cases**:

  * Simple Q\&A and conversation
  * Text summarization and translation
  * Quick information retrieval
  * Real-time applications requiring low latency
  * Batch processing tasks

  **Advantages**:

  * ✅ Fastest response speed
  * ✅ Lowest token consumption
  * ✅ Suitable for high-concurrency scenarios

  **When to use**:

  * Questions are relatively simple and clear
  * High response time requirements
  * Cost-sensitive scenarios
</Card>

### Model Selection Guide

| Scenario Type              | Recommended Model                   | Reason                                   |
| -------------------------- | ----------------------------------- | ---------------------------------------- |
| **General Development**    | `gemini-3-flash-preview`            | Auto-balanced, no manual switching       |
| **Complex Coding Tasks**   | `gemini-3-flash-preview-thinking`   | Shows reasoning process, highest quality |
| **Simple Q\&A/Chat**       | `gemini-3-flash-preview-nothinking` | Fastest, lowest cost                     |
| **Code Generation**        | `gemini-3-flash-preview`            | Auto-identifies complexity               |
| **Math/Logic Reasoning**   | `gemini-3-flash-preview-thinking`   | Requires deep reasoning                  |
| **Real-time Applications** | `gemini-3-flash-preview-nothinking` | Low latency requirement                  |

## Practical Applications

### Recommended Use Cases

<CardGroup cols={2}>
  <Card title="💻 Programming & Code Gen" icon="code">
    * AI coding assistants (Cursor, Cline, etc.)
    * Code review and refactoring
    * Autonomous agentic coding
    * IDE integration development
    * Bug fixing and debugging
  </Card>

  <Card title="📊 Complex Analysis" icon="chart-line">
    * Data analysis and report generation
    * Multi-step reasoning problems
    * Research and academic tasks
    * Business decision support
    * Complex query resolution
  </Card>

  <Card title="🎨 Multimodal Content" icon="image">
    * Image understanding and description
    * Video content analysis
    * PDF document parsing
    * Audio transcription and analysis
    * Cross-modal content generation
  </Card>

  <Card title="💬 Interactive Apps" icon="messages-square">
    * Intelligent customer service bots
    * Educational tutoring systems
    * Knowledge Q\&A platforms
    * Real-time chat applications
    * Content creation assistants
  </Card>
</CardGroup>

### Code Examples

Here are Python examples using API.YI to call Gemini 3 Flash Preview:

#### Example 1: Auto Reasoning Mode (Recommended)

```python theme={null}
import openai

# Configure API.YI endpoint
client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Use auto reasoning mode
response = client.chat.completions.create(
    model="gemini-3-flash-preview",  # Auto-determines reasoning needs
    messages=[
        {"role": "user", "content": "Optimize this Python code for performance:\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"}
    ],
    temperature=1.0,
)

print(response.choices[0].message.content)
```

#### Example 2: Forced Reasoning Mode (Complex Tasks)

```python theme={null}
# Use forced reasoning mode (shows complete thought process)
response = client.chat.completions.create(
    model="gemini-3-flash-preview-thinking",  # Forced reasoning
    messages=[
        {"role": "user", "content": "Design a distributed cache system architecture supporting 1 million read/write operations per second"}
    ],
    temperature=1.0,
)

# Output includes <thinking> tags showing reasoning process
print(response.choices[0].message.content)
```

#### Example 3: Fast Response Mode (Simple Tasks)

```python theme={null}
# Use fast response mode (no reasoning, fastest speed)
response = client.chat.completions.create(
    model="gemini-3-flash-preview-nothinking",  # No reasoning
    messages=[
        {"role": "user", "content": "Translate to English: Artificial intelligence is changing the world"}
    ],
    temperature=1.0,
)

print(response.choices[0].message.content)
```

#### Example 4: Multimodal Input (Image Analysis)

```python theme={null}
# Multimodal: Analyze image content
response = client.chat.completions.create(
    model="gemini-3-flash-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image? Please describe in detail."},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"  # or base64 encoding
                    }
                }
            ]
        }
    ],
)

print(response.choices[0].message.content)
```

### Best Practices

<Info>
  **Model Selection Tips**:

  * If uncertain about task complexity, use `gemini-3-flash-preview` (auto reasoning)
  * When you need to see reasoning process or handle very complex tasks, use `gemini-3-flash-preview-thinking`
  * For simple tasks or high speed requirements, use `gemini-3-flash-preview-nothinking`
  * You can mix and match all three variants in the same application for different tasks
</Info>

<Warning>
  **Usage Restrictions**:

  * Follow Google usage policies, prohibited from generating harmful content
  * API calls have rate limits, specific limits depend on account tier
  * Reasoning mode (thinking) consumes more tokens, use wisely
  * While context window is large (1M tokens), very long contexts may affect response speed
</Warning>

## Pricing & Availability

### Pricing Information

Gemini 3 Flash Preview is significantly cheaper than the Pro version:

| Model                      | Input Price            | Output Price           | vs 3 Pro        | vs 2.5 Flash    |
| -------------------------- | ---------------------- | ---------------------- | --------------- | --------------- |
| **Gemini 3 Flash Preview** | **\$0.50** / 1M tokens | **\$3.00** / 1M tokens | **1/4 price** ⭐ | Slightly higher |
| Gemini 3 Pro               | \$2.00 / 1M tokens     | \$12.00 / 1M tokens    | -               | -               |
| Gemini 2.5 Flash           | \$0.30 / 1M tokens     | \$2.50 / 1M tokens     | -               | -               |

<Info>
  **Pricing Notes**:

  * Prices based on per million tokens
  * All three model variants (auto/forced/no reasoning) have the same price
  * Reasoning mode (thinking) generates additional reasoning token consumption
  * Multimodal inputs (images, videos, etc.) calculated as token equivalents
  * Data source: Google official pricing (released December 17, 2025)
</Info>

### Value Analysis

Gemini 3 Flash Preview achieves new heights in "performance/price ratio":

* **Coding Tasks**: SWE-bench 78%, price only 1/4 of 3 Pro, value \~**4x better**
* **Reasoning Tasks**: Near 3 Pro quality, price only 1/4, value \~**3-4x better**
* **General Tasks**: Surpasses 2.5 series, slightly higher price but significant performance gain

### Promotional Offers

Using Gemini 3 Flash Preview on API.YI, in addition to official pricing parity, you can get extra discounts through **recharge promotions**:

* Recharge \$100 to receive bonus credits
* Higher recharge amounts get higher bonus percentages (up to 20% off)
* Visit API.YI website or contact customer service for details

### Access Channels

Gemini 3 Flash Preview is available through:

1. **API.YI API Service** (Recommended)
   * Address: `api.apiyi.com`
   * Direct integration with OpenAI SDK
   * 3 model variants for flexible switching
   * Enjoy recharge promotion discounts

2. **Google Gemini App**
   * Available to free users and Gemini Advanced users
   * Select "Fast" or "Thinking" mode in model picker

3. **Google AI Studio / Vertex AI**
   * Official pricing, no additional discounts
   * Suitable for enterprise deployment

## Summary & Recommendations

Gemini 3 Flash Preview is Google's another breakthrough in balancing "speed and intelligence," offering **Pro-level performance** at **Flash-level pricing**, even surpassing Gemini 3 Pro in coding capabilities. This marks the official entry of high-performance AI models into the "inclusive era."

### Core Competitiveness

* ✅ **Coding Champion**: SWE-bench 78%, surpasses Gemini 3 Pro
* ✅ **Speed Advantage**: 3x faster than 2.5 Pro
* ✅ **Unbeatable Value**: Only 1/4 the price of 3 Pro
* ✅ **Flexible Switching**: 3 model variants adapt to different scenarios

### Recommended Use Cases

* 🎯 **Top Choice**: AI coding assistants, code generation, agentic development
* 🎯 **Recommended**: Multimodal content analysis, complex reasoning, data analysis
* 🎯 **Suitable**: Interactive apps, real-time chat, knowledge Q\&A

### Usage Recommendations

1. **Prioritize auto reasoning mode**: `gemini-3-flash-preview` suits most scenarios, no manual switching
2. **Use forced reasoning for complex tasks**: When deep thinking or viewing reasoning process needed, use `thinking` variant
3. **Use fast mode for simple tasks**: When pursuing ultimate speed, use `nothinking` variant
4. **Leverage multimodal capabilities**: Supports image, video, audio, PDF and other inputs
5. **Take advantage of recharge promotions**: Recharge on API.YI for extra discounts, reduce long-term costs

### Competitor Comparison

| Dimension      | Gemini 3 Flash Preview | Claude Sonnet 4.5 | GPT-5.1       |
| -------------- | ---------------------- | ----------------- | ------------- |
| **Coding**     | ⭐⭐⭐⭐⭐ (78%)            | ⭐⭐⭐⭐⭐ (77.2%)     | ⭐⭐⭐⭐⭐ (76.3%) |
| **Speed**      | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐              | ⭐⭐⭐⭐          |
| **Value**      | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐              | ⭐⭐⭐           |
| **Multimodal** | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐              | ⭐⭐⭐⭐          |

Gemini 3 Flash Preview reaches industry-leading levels in coding capabilities, speed, and value across three dimensions, making it one of the most recommended high-value AI models available.

<Info>
  **Information Sources & Dates**:

  * Google official blog release date: December 17, 2025
  * API.YI integration launch date: December 18, 2025
  * Official announcement: `blog.google/products/gemini/gemini-3-flash/`
  * Technical analysis sources: TechCrunch, SiliconANGLE, 9to5Google and other tech media
  * Performance data sources: Google AI Studio, official benchmark reports
</Info>

***

Experience the powerful capabilities of Gemini 3 Flash Preview now - visit the API.YI website to get your API key and start your high-value AI development journey!
