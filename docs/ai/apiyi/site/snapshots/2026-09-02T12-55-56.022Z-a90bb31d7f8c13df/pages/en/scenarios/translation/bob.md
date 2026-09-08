> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bob Translator

> Professional translation tool for macOS integration guide

Bob is an excellent translation software for macOS that supports word selection translation, screenshot translation and other functions. By integrating APIYI, you can use AI models to provide more accurate and natural translation results.

## Quick Configuration

### 1. Install Bob

Download and install the latest version from [Bob Official Website](https://bobtranslate.com).

### 2. Configure APIYI

1. Open Bob settings (menu bar icon > Preferences)
2. Switch to "Services" tab
3. Add OpenAI translation service
4. Configure parameters:
   * **API Key**: Your APIYI key
   * **API URL**: `https://api.apiyi.com`
   * **Model**: `gpt-3.5-turbo`

### 3. Test Configuration

Click "Test" button to verify configuration, save after showing success.

## Usage Methods

### Word Selection Translation

1. Select text to translate
2. Press shortcut key (default `⌥ + D`)
3. Bob pops up translation result

### Screenshot Translation

1. Press screenshot shortcut (default `⌥ + S`)
2. Select area to translate
3. Bob recognizes and translates text in image

### Input Translation

1. Bring up Bob window (default `⌥ + Space`)
2. Input or paste text to translate
3. Select target language
4. View translation result

## Model Selection

### Recommendations for Different Scenarios

| Use Case               | Recommended Model | Features                   |
| ---------------------- | ----------------- | -------------------------- |
| Daily Translation      | gpt-3.5-turbo     | Fast, accurate             |
| Professional Documents | gpt-4             | More accurate terminology  |
| Long Text              | claude-3-haiku    | Good context understanding |
| Literary Works         | claude-3-opus     | Better literary style      |

### Multi-Model Configuration

Can configure multiple translation services using different models:

1. Add multiple OpenAI translation services
2. Configure different model for each service
3. Select which to use when translating

## Advanced Settings

### Custom Prompts

Prompt template for optimizing translation quality:

```text theme={null}
You are a professional translation expert proficient in multiple languages. Please translate the following {source_lang} text to {target_lang}.

Requirements:
1. Maintain original tone and style
2. Use idiomatic expressions
3. For technical terms, mark original text in parentheses after translation
4. Be mindful of cultural differences, adjust expressions appropriately

Original text: {text}
```

### Customize Shortcuts

Customize in Settings > General:

* **Word Selection Translation**: `⌥ + D`
* **Screenshot Translation**: `⌥ + S`
* **Input Translation**: `⌥ + Space`
* **Show/Hide**: `⌥ + B`

### Translation Behavior Settings

Recommended configuration:

* **Auto-detect Language**: Enabled
* **Auto-copy After Translation**: Based on needs
* **Preserve Original Format**: Enabled
* **History**: Enabled

## Usage Tips

### 1. Professional Domain Translation

For specific domains, can specify in prompt:

```text theme={null}
Please translate as a computer professional translator.
Preserve all technical terms in English, with Chinese explanations in parentheses.
```

### 2. Batch Translation

When translating large amounts of text:

1. Use input translation mode
2. Paste text in segments
3. Use history to view all translations

### 3. Comparative Reading

When reading foreign language materials:

1. Enable "Show Original" option
2. Use word selection translation to view in real-time
3. Compare original and translation for learning

### 4. Terminology Management

Build personal terminology database:

1. Bookmark common terminology translations
2. Customize specific word translations
3. Export terminology database backup

## Common Issues

### Slow Translation Speed

**Analysis:**

* Network connection issues
* Selected model is large
* API service busy

**Solutions:**

1. Check network connection
2. Use fast models like gpt-3.5-turbo
3. Avoid peak hours

### Inaccurate Translation

**Improvement Methods:**

1. Use more advanced models (like GPT-4)
2. Optimize prompts, provide more context
3. Specify domain for professional content

### API Quota Exhausted

**Handling:**

1. Check APIYI account balance
2. Use different models reasonably to control costs
3. Set daily usage limits

## Best Practices

### 1. Cost Control

* Use gpt-3.5-turbo for daily translation
* Only use gpt-4 for important documents
* Regularly check usage statistics

### 2. Translation Quality

* Provide sufficient context
* Specify domain when using technical terms
* Proofread important content

### 3. Workflow Optimization

* Set common language pairs
* Customize domain-specific prompts
* Make good use of history and favorites

### 4. Data Security

* Don't translate text containing sensitive information
* Regularly clean translation history
* Keep API key secure

## Advanced Features

### URL Scheme Integration

Bob supports integration into other apps via URL Scheme:

```bash theme={null}
# Translate text directly
bob://translate?text=Hello&from=en&to=zh

# Open Bob window
bob://open
```

### AppleScript Automation

```applescript theme={null}
tell application "Bob"
    translate "Hello World" from "en" to "zh"
end tell
```

### Export Function

Regularly export translation records:

1. Enter history
2. Select time range
3. Export as CSV or JSON format

## Integration with Other Tools

### Raycast Integration

Quickly call Bob through Raycast extension:

```javascript theme={null}
// Raycast script example
import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";

export default async function Command() {
  exec("open bob://translate", (error) => {
    if (error) {
      showToast(Toast.Style.Failure, "Failed to launch Bob");
    }
  });
}
```

### Alfred Workflow

Create Alfred workflow for quick translation:

1. Create new workflow
2. Add Keyword trigger
3. Connect Run Script action
4. Call Bob's URL Scheme

### PopClip Extension

Install PopClip's Bob extension to translate directly after selecting text.

## Troubleshooting

### Service Unavailable

Check items:

1. API key is correct
2. Network connection is normal
3. APIYI service status

### Shortcut Conflicts

Solutions:

1. Check for shortcut conflicts in System Preferences
2. Set unique shortcut combinations for Bob
3. Disable conflicting app shortcuts

### Permission Issues

Ensure Bob has necessary permissions:

* Accessibility permission
* Screen recording permission (for screenshot translation)
* Keyboard input permission

## Performance Optimization

### Reduce Latency

1. Use faster models
2. Enable local caching
3. Optimize network settings

### Save Resources

1. Set reasonable translation history retention time
2. Regularly clean cache
3. Avoid running multiple translation services simultaneously

### Improve Experience

1. Adjust popup display time
2. Customize interface theme
3. Optimize font size and style

Need more help? Please check the [Detailed Integration Documentation](/en/scenarios/translation/bob).
