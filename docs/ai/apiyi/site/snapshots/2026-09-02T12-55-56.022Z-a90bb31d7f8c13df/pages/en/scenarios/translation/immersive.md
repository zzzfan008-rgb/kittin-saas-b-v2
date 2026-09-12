> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Immersive Translate

> Browser bilingual reading extension integration guide

Immersive Translate is an excellent browser translation extension that supports bilingual reading of web pages. By integrating APIYI, you can use powerful AI models to get more accurate and natural translation results.

## Quick Installation

### Supported Browsers

* Chrome / Edge / Brave
* Firefox
* Safari

### Installation Steps

1. Visit your browser's extension store
2. Search for "Immersive Translate"
3. Click install and add to browser

Or visit [Official Website](https://immersive-translate.owenyoung.com/) to get installation links.

## Configure APIYI

### 1. Open Settings

Click the extension icon in browser toolbar, select "Settings".

### 2. Configure Translation Service

1. Select "Translation Services" in left menu
2. Find "OpenAI" service
3. Click "Manage" or "Settings"
4. Select "Custom API Key"

### 3. Fill in Configuration

* **APIKEY**: Enter your APIYI key
* **Custom API Interface Address**: `https://api.apiyi.com/v1/chat/completions`
* **Custom Model**: `gpt-3.5-turbo` (optional)

## Core Features

### Web Page Translation

#### Auto Translation

1. Visit foreign language webpage
2. Extension auto-detects language
3. Click translate button to start

#### Manual Translation

1. Click extension icon in toolbar
2. Select "Translate This Page"
3. Wait for translation to complete

### Translation Modes

#### Bilingual Reading (Recommended)

* Preserve original format
* Translation displayed below original
* Convenient for comparative learning

#### Translation Only

* Completely replace original text
* Suitable for quick reading
* Can switch back to bilingual anytime

### Word Selection Translation

1. Select text to translate
2. Click the translation button that appears
3. View translation in popup

## Advanced Settings

### Custom Prompts

Prompts for different content types:

#### Technical Documentation

```text theme={null}
As a technical documentation translation expert, please:
1. Preserve all technical terms in original language
2. Provide Chinese explanations in parentheses
3. Maintain original format for code and commands
```

#### Academic Papers

```text theme={null}
As an academic translation expert, please:
1. Use academically standard expressions
2. Preserve citation formats
3. Accurately translate professional terminology
```

#### Literary Works

```text theme={null}
As a literary translation expert, please:
1. Maintain literary beauty of original text
2. Be mindful of cultural background conversion
3. Preserve effect of rhetorical devices
```

### Translation Rules

Set translation behavior for specific websites:

1. Enter "Translation Rules" settings
2. Add website domain
3. Select behavior:
   * Always translate
   * Never translate
   * Smart judgment

### Style Customization

Customize translation display style:

```css theme={null}
/* Translation font */
.immersive-translate-target {
    font-family: "Microsoft YaHei", sans-serif;
    font-size: 14px;
    color: #333;
}

/* Translation background */
.immersive-translate-target-wrapper {
    background-color: #f5f5f5;
    padding: 5px;
    margin: 5px 0;
    border-radius: 3px;
}
```

## Special Features

### PDF Translation

Supports online PDF document translation:

* Maintain PDF format
* Support bilingual reading
* Can copy translation

### Video Subtitle Translation

Supports mainstream video websites:

* YouTube
* Netflix
* Bilibili

Configuration method:

1. Enable "Video Subtitle Translation"
2. Select subtitle display method
3. Adjust subtitle style

### E-book Translation

Supports EPUB e-books:

1. Upload EPUB file
2. Select translation settings
3. Download bilingual version

### Input Box Translation

Real-time translation in web input boxes:

1. Enter text in input box
2. Press shortcut to trigger translation
3. View translation suggestions

## Keyboard Shortcuts

Common shortcuts (customizable):

| Function                | Default Shortcut |
| ----------------------- | ---------------- |
| Translate/Show Original | `Alt + T`        |
| Switch Translation Mode | `Alt + M`        |
| Translate Selected Text | `Alt + S`        |
| Open Settings           | `Alt + O`        |

## Model Selection Recommendations

### Selection by Content Type

| Content Type            | Recommended Model | Reason                |
| ----------------------- | ----------------- | --------------------- |
| News Articles           | gpt-3.5-turbo     | Fast, accurate        |
| Technical Documentation | gpt-4             | Accurate terminology  |
| Academic Papers         | claude-3-opus     | Strong comprehension  |
| Literary Works          | claude-3-sonnet   | Good literary style   |
| Daily Webpages          | gpt-3.5-turbo     | High cost-performance |

### Performance and Quality Balance

```javascript theme={null}
// Smart model selection example
const selectModel = (textLength, contentType) => {
  if (textLength < 500) {
    return 'gpt-3.5-turbo'; // Use fast model for short text
  } else if (contentType === 'technical') {
    return 'gpt-4'; // Use accurate model for technical content
  } else if (contentType === 'creative') {
    return 'claude-3-sonnet'; // Use literary model for creative content
  } else {
    return 'gpt-3.5-turbo'; // Default to economical model
  }
};
```

## Performance Optimization

### Cache Settings

* Enable translation cache
* Set cache duration: 24 hours
* Regularly clean cache

### Batch Translation

* Adjust batch size: 5-10 paragraphs
* Set reasonable concurrency: 2-3
* Optimize long text processing

### Trigger Conditions

* Minimum translation length: 10 characters
* Ignore specific elements: navigation menus, ads
* Delayed translation: 200ms

## Common Issues

### Translation Failed

**Possible Causes:**

* Invalid API key
* Network connection issues
* Special page structure

**Solutions:**

1. Verify API key
2. Check network connection
3. Try refreshing page
4. Check browser console errors

### Slow Translation Speed

**Optimization Methods:**

1. Use faster models
2. Reduce amount of text per translation
3. Enable cache function
4. Check network latency

### Format Confusion

**Handling Methods:**

1. Try different translation modes
2. Adjust translation display settings
3. Customize rules for specific websites
4. Report issue to developers

## Best Practices

### 1. Reading Experience Optimization

* Choose appropriate font and size
* Adjust translation color contrast
* Set comfortable line spacing
* Use eye protection mode

### 2. Learning Assistance

* Enable bilingual reading mode
* Use word selection translation for vocabulary lookup
* Export translation content for review
* Add notes and annotations

### 3. Work Efficiency

* Set rules for frequently visited websites
* Customize domain-specific prompts
* Use shortcuts to improve speed
* Batch process documents

### 4. Cost Control

* Select translation models reasonably
* Set translation length limits
* Use cache to reduce repeated translations
* Monitor API usage

## Advanced Tips

### Custom Translation Script

Use JavaScript to enhance functionality:

```javascript theme={null}
// Auto-detect and translate specific content
if (document.querySelector('.article-content')) {
    window.immersiveTranslate.translate({
        selector: '.article-content',
        fromLang: 'auto',
        toLang: 'zh-CN'
    });
}
```

### Integration with Other Tools

Use with other tools:

* **Readwise**: Save translated highlights
* **Notion**: Export translation notes
* **Anki**: Create vocabulary flashcards

### Developer Mode

Participate in translation improvement:

1. Enable debug mode
2. Provide translation feedback
3. Contribute translation corpus
4. Participate in open-source development

## Troubleshooting Guide

### Extension Won't Load

1. Check browser version compatibility
2. Disable conflicting extensions
3. Clear browser cache
4. Reinstall extension

### Translation Results Not Displaying

1. Check if webpage supports translation
2. Confirm translation service configured correctly
3. Check if blocked by ad blocker
4. Try other translation services

### High Memory Usage

1. Regularly clean translation cache
2. Reduce number of pages translating simultaneously
3. Adjust batch translation settings
4. Close unnecessary tabs

Need more help? Please check the [Detailed Integration Documentation](/en/scenarios/translation/immersive).
