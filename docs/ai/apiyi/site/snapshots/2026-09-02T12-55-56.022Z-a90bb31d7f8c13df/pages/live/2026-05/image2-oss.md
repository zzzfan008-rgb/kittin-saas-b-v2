> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 新增 image2_OSS 分组：确定性输出图片 URL

> 新增 image2_OSS 分组（1x 倍率，不加价），专为需要确定性 URL 输出的场景设计。gpt-image-2-vip / gpt-image-2-all 在默认分组资源紧张时响应可能降级为 base64，强依赖 URL 输出的业务把令牌分组切到 image2_OSS 即可稳定拿到图片 URL，不降级。

**2026/5/25 11:48 (UTC+8)** · 新模型 · OpenAI

🆕 **新增 `image2_OSS` 分组：确定性输出图片 URL** —— `gpt-image-2-vip` / `gpt-image-2-all` 默认返回图片 `url`，但**默认分组资源紧张时响应可能降级为 `b64_json`**（base64）。强依赖 URL 输出的业务，把令牌分组切到 **`image2_OSS`**（**1x 倍率、不加价**）即可稳定拿到图片 URL，不降级为 base64。

<Frame caption="令牌创建：计费模式选「按量优先」，分组选 image2_OSS（1x）——需要确定性 URL 输出时使用">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="令牌创建界面：计费模式「按量优先」，选择分组 image2_OSS（1x 倍率），支持输出为图片 URL 的分组，适合 gpt-image-2-all 与 gpt-image-2-vip" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

📖 详见分组介绍：[gpt-image-2-vip](/api-capabilities/gpt-image-2-vip/overview) · [gpt-image-2-all](/api-capabilities/gpt-image-2-all/overview)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
