> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Does Claude Claim to Be Qwen or DeepSeek?

> Why Claude (especially via AWS) gives random answers to 'What model are you', sometimes claiming to be Qwen or DeepSeek: an industry-wide LLM quirk unrelated to model authenticity

## Short Answer

<Info>
  **This is completely normal. It does not mean the model is fake, and it does not affect model capability.**

  LLM answers to "What model are you?" are **inherently unreliable** — a systematic academic study of 27 major LLMs found that about 26% exhibit "identity confusion", and the root cause is **hallucination**, not model swapping or repackaging. When Claude is called directly via API, there is no system prompt anchoring its identity; when asked in Chinese, it is further influenced by Chinese-language training data, so it may "guess" names it has frequently seen — such as Qwen or DeepSeek.
</Info>

## Symptoms

<Warning>
  **Typical scenario**

  Call Claude via the AWS channel and ask "What model are you?":

  * Sometimes it answers "I am Claude 4.5"
  * Sometimes it claims "I am Qwen"
  * Sometimes it says "I am DeepSeek"
  * This is especially noticeable when asking in Chinese, and the answer may change on every run

  **Key observation**: the very same model performs perfectly well in normal usage, coding, and other complex tasks — only the "self-identification" answer is chaotic. This shows the issue lies in "identity awareness", not "model capability".
</Warning>

<Info>
  **Reproducible in the official AWS console — nothing to do with any relay channel**

  You can easily reproduce this in the **AWS Bedrock console's built-in inference interface (Playground / Chat)**: ask Claude "What model are you?" directly in Amazon's official console — with no APIYI or any third-party relay involved — and you will see the same answers claiming to be Qwen or DeepSeek.

  This directly proves that the chaotic self-identification is native upstream model behavior, not a channel issue. We have recorded a reproduction video in the Bedrock console:

  * 📹 **Request the video file from support**: add our WeCom support below to get the full reproduction video
  * 📺 **Watch it on our support team's WeCom Channels feed**: the demo video is published there — feel free to watch and leave a comment
</Info>

## Root Cause Analysis

<AccordionGroup>
  <Accordion title="Reason 1: The model has no stable inner identity to begin with">
    A model's name is assigned **after** training is complete — the weights never contained "who I am". The `model` parameter in your API request is routing information for the server; the model itself never sees it.

    The official web app (claude.ai) answers correctly because every conversation injects a hidden system prompt telling it "You are Claude". Direct API calls have no such prompt by default, so the model can only "guess" from its training data.

    See the detailed explanation: [Why don't LLMs know their own version number?](/en/faq/model-version-identity)
  </Accordion>

  <Accordion title="Reason 2: Chinese training-data contamination biases guesses toward Chinese models">
    Qwen and DeepSeek are the most-discussed models on the Chinese internet. Their self-introductions, API examples, and chat screenshots saturate Chinese-language corpora — which Claude's training data also includes.

    When identity anchoring is weak (no system prompt) and the question is asked **in Chinese**, the most "natural" completion in a Chinese context may well be one of these high-frequency Chinese model names. This also explains why switching to English, or rephrasing the question, changes the answer.
  </Accordion>

  <Accordion title="Reason 3: Academic research confirms this is an industry-wide issue">
    The 2024 systematic study "I'm Spartacus, No, I'm Spartacus: Measuring and Understanding LLM Identity Confusion" tested 27 major LLMs and found about **26%** exhibit identity confusion, confirming the root cause is **hallucination, not model copying or substitution**.

    Reverse examples are just as common: early DeepSeek versions claimed to be ChatGPT, GLM has claimed to be Claude, Gemini has claimed to be other vendors' models in certain languages. Self-identification has never been reliable information.

    Paper (copy to visit): `arxiv.org/abs/2411.10683`
  </Accordion>

  <Accordion title="Is it intentional? (The anti-distillation theory)">
    A popular community theory: vendors don't bake identity into model weights partly because it's technically unnecessary (the web app relies on a system prompt), and partly because a loosely-defined self-identification is harder for distilled models to imitate.

    To be clear, this is community speculation — no vendor has ever promised accurate self-identification as a feature. What is certain: **no major vendor guarantees that a bare-API model can answer its own name correctly**.
  </Accordion>
</AccordionGroup>

## Why Chaotic Answers Actually Match Genuine Bare-Model Behavior

<Card title="Only repackaged models need a consistent story" icon="shield-check">
  A genuine model called via bare API has no identity prompt at all, so its answers are naturally random and drift across languages — Claude 4.5 today, Qwen tomorrow.

  Repackaged or swapped-model platforms are the opposite: to avoid exposure, they often **inject a prompt forcing the model to consistently claim "I am Claude"**. So a suspiciously polished, always-consistent self-introduction is not necessarily trustworthy — while chaotic answers actually match the behavior of a bare model with no identity injection.

  That said, chaotic answers alone don't prove authenticity either — see the reliable verification methods below.
</Card>

## How to Verify You're Getting Genuine Claude

<CardGroup cols={2}>
  <Card title="Check the model field in API responses" icon="code">
    Every API response JSON includes a `model` field identifying the actual model used:

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>

  <Card title="Check your call logs" icon="file-text" href="/en/faq/call-logs">
    The **call logs** in the APIYI console show the actual model used for every request.
  </Card>

  <Card title="Compare on complex tasks" icon="flask-conical">
    Self-identification is unreliable, but **capability doesn't lie**. Run the same coding problem or long-context task across models — Claude's code style and reasoning chains differ clearly from Qwen/DeepSeek.
  </Card>

  <Card title="Contact our technical team" icon="message-circle">
    If you still have doubts, the APIYI technical team can help verify the channel and model source.
  </Card>
</CardGroup>

## How to Make the Model Answer Its Identity Correctly

Exactly how the official web app does it — add a system prompt to your request:

```python theme={null}
messages=[
    {
        "role": "system",
        "content": "You are Claude, an AI assistant developed by Anthropic."
    },
    {
        "role": "user",
        "content": "What model are you?"
    }
]
```

<Tip>
  **APIYI service guarantee**: APIYI's Claude (including the AWS channel) is forwarded from official sources, with requests passed through as-is and no prompts injected. A model "not knowing who it is" is common to all bare-API platforms and has nothing to do with channel authenticity.
</Tip>

## Related Questions

<CardGroup cols={2}>
  <Card title="Why don't LLMs know their own version number?" icon="circle-question-mark" href="/en/faq/model-version-identity">
    The underlying principles of the identity problem
  </Card>

  <Card title="How to check call logs?" icon="file-text" href="/en/faq/call-logs">
    Verify the actual model version used
  </Card>

  <Card title="How to choose the right model?" icon="compass" href="/en/faq/model-selection-guide">
    Learn each model's strengths and use cases
  </Card>

  <Card title="What does the -c suffix in model names mean?" icon="tag" href="/en/faq/model-name-suffix-c">
    Understand model naming suffixes
  </Card>
</CardGroup>

## Contact Us

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code or [click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Model verification and technical support
  </Card>

  <Card title="Email" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
