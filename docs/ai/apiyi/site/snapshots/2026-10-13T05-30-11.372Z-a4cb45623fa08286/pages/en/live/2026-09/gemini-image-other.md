> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Image Returns IMAGE_OTHER Only Some of the Time? New FAQ Explains Why

> New FAQ: when a Gemini image model returns finishReason: IMAGE_OTHER, the image was generated but filtered by the provider on output. The most typical trigger we measured is a real person's name in the prompt; removing it took failures from 5/6 to 0/6.

**2026/9/25 00:39 (UTC+8)** · Docs Update · Google

📚 **New FAQ: why does Gemini image return `IMAGE_OTHER`?**

`IMAGE_OTHER` means the model finished drawing, but the provider's output check filtered the image before it was returned, so the same request succeeds only some of the time. In our tests, a pure text-to-image request on `gemini-3-pro-image` failed 5/6; removing only the sentence that named a real person brought it to 0/6. Neither the negative prompts nor the "1:1 replica" wording were the cause. The provider states these requests are not charged; check the console logs for actual billing.

Together with [NO\_IMAGE](/en/faq/gemini-no-image) and [blockReason: OTHER](/en/faq/gemini-image-input-blocked), it covers the three ways Gemini image generation can fail. See [Why IMAGE\_OTHER?](/en/faq/gemini-image-other)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.