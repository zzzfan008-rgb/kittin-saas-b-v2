> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro/2 的 4K、2K 出图变糊 · 1K 正常

> 今天上午起 Nano Banana 2 / Pro（gemini-3.1-flash-image、gemini-3-pro-image）频现糊图，目前 4K、2K 基本必现、1K 仍正常，经研判为谷歌官方侧 100% 的问题。期间可选 gpt-image-2-vip、官转 gpt-image-2 或 1K 分辨率出图，等待谷歌恢复。

**2026/6/19 15:15 (UTC+8)** · 模型状态 · Google

⚠️ **Nano Banana Pro / 2 的 4K、2K 出图变糊 · 1K 正常 · 谷歌官方问题**

今天上午起 `gemini-3-pro-image`（Nano Banana Pro）与 `gemini-3.1-flash-image`（Nano Banana 2）频现糊图，到现在 **4K / 2K 基本必现**、**1K 仍正常**。经研判为谷歌官方侧 100% 的问题，非本站通道因素。

期间可选的其它出图通道（按需自选，状态如下）：

* `gpt-image-2-vip`：昨晚刚恢复 `size` 参数，支持 2K / 4K
* 官转 `gpt-image-2`：按 tokens 计费，与 OpenAI 官网同价
* Nano Banana 系列限 1K：当前 1K 分辨率仍可正常出图

等谷歌官方恢复后我们会第一时间同步动态。面向 C 端的产品，建议接入多个模型以便随时切换。

<Frame caption="与海外平台交叉确认：该问题为谷歌全局故障，所有 API 提供商均受影响（It's global / down on all API providers）">
  <img src="https://mintcdn.com/apiyillc/pIxD4Z3gJQ--dzAT/images/live/nano-banana-4k-2k-blurry-global-chat-20260619.png?fit=max&auto=format&n=pIxD4Z3gJQ--dzAT&q=85&s=3a15a62a364322c8556a3f33b4b37bd7" alt="客服对话截图：确认 Nano Banana 糊图为谷歌侧全局问题，海外所有 API 提供商同样受影响" width="1658" height="1078" data-path="images/live/nano-banana-4k-2k-blurry-global-chat-20260619.png" />
</Frame>

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
