> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Image Returns blockReason: OTHER in Seconds, or NO_IMAGE Only Sometimes? Two FAQs Explain Why

> New FAQ: when a Gemini image model returns promptFeedback.blockReason=OTHER with no candidates within seconds, a single reference image is often the trigger. It covers how to find it and how to preprocess reference images. The NO_IMAGE page now also covers intermittent failures caused by prompts that ask for a design proposal.

**2026/9/23 15:12 (UTC+8)** · Docs Update · Google

📚 **Two common Gemini image failures: a blocked input image, and a prompt that asks the model to write**

**Blocked input image**: `gemini-3-pro-image` checks the input before generating. When it blocks, it returns HTTP 200 within seconds with `promptFeedback.blockReason: OTHER` and no `candidates`. In a 6-image fashion-catalog request we tested, the only trigger was one AI-generated person reference image, independent of the prompt, and flash passed. After that image was re-exported as JPEG, it passed and the full request generated normally. The new FAQ covers how to find the image by splitting the set in half, plus preprocessing advice for manual and code workflows: [Why Does Gemini Image Return blockReason: OTHER?](/en/faq/gemini-image-input-blocked)

**A prompt that asks for text**: when the prompt contains sentences such as "produce a design proposal" or "analyze in depth," image-only calls return `NO_IMAGE` some of the time. In our tests this happened about 21% of the time, with the same request failing and then succeeding. Appending one sentence, "output the final image only," brought it to 0/24. This is now covered in [NO\_IMAGE troubleshooting](/en/faq/gemini-no-image).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.