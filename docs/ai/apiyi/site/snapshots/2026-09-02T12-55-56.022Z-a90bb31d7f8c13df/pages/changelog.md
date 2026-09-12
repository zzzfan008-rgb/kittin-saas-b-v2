> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 网站公告

> API易最新动态、模型更新、价格调整等重要公告

欢迎来到 API易 的更新日志页面。在这里，您可以了解到我们的最新模型上线、价格调整、功能更新等重要信息。我们致力于为您提供最优质、最具性价比的 AI 服务。

<Note>
  **收藏更新**：Ctrl+D 收藏本网页，查看我们的公告，第一时间获取模型上新和优惠信息，不错过任何重要更新！
</Note>

## 🔥 最新动态

<Update label="2026/9/2 · Claude Fable 5.1 上线" description="新模型 · Anthropic">
  ### Claude Fable 5.1 上线

  **同价升级，缓存读取直降四分之一**

  Anthropic 9/1 发布的 Mythos 级新旗舰，最显著的变化是缓存读取从 \$1.00 降到 **\$0.25 / 百万 tokens**；输入 \$10 / 输出 \$50 保持不变。API易 已同步下调，**四项计费与官网逐项一致**。注意三项破坏性变更：强制工具调用报 400、思考块与模型绑定、编辑历史会让思考块失效。

  📖 [查看详情](/news/claude-fable-5-1-launch) | 🔗 [充值活动](/faq/recharge-promotions)
</Update>

<Update label="2026/8/31 · Seedance 2.5 与 2.0 系统一分组" description="价格变动 · ByteDance">
  ### Seedance 2.5 与 2.0 系统一分组

  **一把令牌通吃四个模型**

  2.5 与 2.0 系四个模型统一收在 **`SeeDance2`（0.18x）** 分组下管理，一把令牌即可全调，不必为 2.5 单独建令牌，代码不用改。实测单价分两档：输入不含视频 \$12.60 / 百万 tokens（480p / 720p / 1080p 同价），输入含视频（多模态参考、视频编辑 / 延长）走更低的 \$7.56。

  📖 [查看详情](/live/2026-08/seedance-2-5-group-merge) | 🔗 [分组与定价](/api-capabilities/seedance2/overview)
</Update>

<Update label="2026/8/28 · Seedance 2.5 上线" description="新模型 · ByteDance">
  ### Seedance 2.5 上线

  **30 秒直出、30 张参考图，能力全面拉高**

  模型名 `doubao-seedance-2-5-260628`，端点与请求结构和 2.0 完全一致，**只改 `model` 一个字段**。时长上限 15 秒提到 **30 秒**、参考图 9 张提到 **30 张**，音频可单独作参考，新增 `mov` 输出与视频编辑 / 延长的显式任务类型。**最新的分组与定价见上方 8/31 那条。**

  📖 [查看详情](/live/2026-08/seedance-2-5-launch) | 🔗 [能力与定价](/api-capabilities/seedance2/overview)
</Update>

<Update label="2026/8/21 · DeepSeek 视觉模型上线" description="新模型 · DeepSeek">
  ### DeepSeek 视觉模型上线

  **看图不额外加价，与纯文本 V4 Flash 同价**

  `deepseek-v4-flash-vision-exp` 是 DeepSeek 首个视觉模型，在 V4 Flash 底座上加了图像输入，1M 上下文与思考、函数调用、缓存全部保留。图片按尺寸折成输入 tokens、**单图最多 384**，定价与纯文本版一致：输入 \$0.44、输出 \$1.32 每 1M tokens。OpenAI 格式用 `default` 分组，Anthropic 格式用 `ClaudeCode` 分组。

  📖 [查看详情](/live/2026-08/deepseek-v4-flash-vision-exp) | 🔗 [接入文档](/api-capabilities/deepseek-v4-flash-vision/overview)
</Update>

<Update label="2026/8/21 · gpt-image-2 支持透明背景" description="功能更新 · OpenAI">
  ### gpt-image-2 支持透明背景

  **一个参数直接出带 alpha 通道的 PNG**

  OpenAI 为 GPT-Image-2 开放了 background 的 transparent 取值，本站已实测可用。传 `background: "transparent"` 配 `png` 或 `webp` 即可拿到真透明底图，文生图、图片编辑、Responses 出图工具三条路都支持，且不额外计费。`jpeg` 无 alpha 通道，与透明互斥。

  📖 [查看详情](/live/2026-08/gpt-image-2-transparent-background) | 🔗 [透明背景 FAQ](/faq/image-transparent-background)
</Update>

<Update label="2026/8/15 · DeepSeek 价格调整" description="价格变动 · DeepSeek">
  ### DeepSeek 价格调整

  **官方启用峰谷计费，本站固定按峰值档**

  官方自北京时间 8 月 17 日 00:00 (UTC+8) 起改为峰/谷两档计费，谷时为峰时半价。本站 `deepseek-v4-flash` 与 `deepseek-v4-pro` 同步调整并**固定按峰值档**：\$0.44/\$1.32 与 \$1.32/\$3.96 每 1M tokens。主因是官方并发不足时需用价格明显更高的 BytePlus 与阿里云官转顶上保供，这部分不赚钱；充值活动加赠仍可叠加。

  📖 [查看详情](/news/deepseek-price-increase-2026-08) | 🔗 [充值活动](/faq/recharge-promotions)
</Update>

<Update label="2026/8/14 · Gemini 3.7 Flash 上线" description="新模型 · Google">
  ### Gemini 3.7 Flash 上线

  **官方同价，限时优惠期比上一代还便宜一半**

  谷歌 8/13 发布的新一代 Flash 主力，编码与 Agent 是升级重点：DeepSWE v1.1 由 48.6% 提到 **65.3%**，业务流程自动化由 17.0% 提到 **30.4%**。1M 上下文、思考三档可调，定价 \$0.75/\$3.75 每 1M tokens 与官网一致 —— 这是谷歌的限时优惠期价格，12/31 后恢复 \$1.50/\$7.50。

  📖 [查看详情](/news/gemini-3-7-flash-launch) | 🔗 [充值活动](/faq/recharge-promotions)
</Update>

<Update label="2026/8/13 · Grok 4.6 上线" description="新模型 · xAI">
  ### Grok 4.6 上线

  **官方同价 + 分组 8 折**

  xAI 8/7 发布的新旗舰，沿用 Grok 4.5 的 1.5T 参数基座，提升全部来自更充分的 SFT 与强化学习：**Artificial Analysis 智能指数由 56 升至 61**，追平 GPT-5.6 Sol Max。500K 上下文、双端点可用，定价 \$2/\$6 每 1M tokens 与官网一致；`GrokOfficial` 分组倍率 0.8x，叠加充值加赠后输入低至 \$1.33。

  📖 [查看详情](/news/grok-4-6-launch) | 🔗 [接入文档](/api-capabilities/grok/overview)
</Update>

<Update label="2026/8/12 · Grok Imagine 2 图片模型上线" description="新模型 · xAI">
  ### Grok Imagine 2 图片模型上线

  **按次 \$0.02 起**

  xAI 第二代图像模型。`grok-imagine-image` **\$0.02/张**、`grok-imagine-image-quality` **\$0.045/张**，按次固定计费且不区分分辨率 —— 官网 quality 版 2K 收 \$0.07，我们两档统一 \$0.045，出 2K 约合官网 6.4 折。5 种宽高比 × 1K/2K 参数真实生效，单次最多 10 张，`Default` 分组即可调用。

  📖 [查看详情](/news/grok-imagine-2-launch) | 🔗 [接入文档](/api-capabilities/grok-imagine-image/overview)
</Update>

<Update label="2026/8/8 · Seedance 2.0 mini / fast 限时降价" description="价格变动 · ByteDance">
  ### Seedance 2.0 mini / fast 限时降价

  **mini 直降 44.4％**

  新增 `SD2Mini`（**0.10x**，仅 mini）与 `SD2Fast`（**0.15x**，仅 fast）两个单模型专属分组，相比原 `SeeDance2` 的 0.18x，**mini 降 44.4%、fast 降 16.7%**：720p/5 秒 mini 由 ¥3.16 降至 **¥1.75**。能力与调用方式不变，新建令牌选对分组即可。**限时至 9 月 7 日 23:59 (UTC+8)**。

  📖 [查看详情](/live/2026-08/seedance2-cheap-groups) | 🔗 [分组与价格对照](/api-capabilities/seedance2/overview)
</Update>

***

> 📖 以上是最近 10 条公告。查看更早的更新请访问 [公告归档](/changelog/archive)，可按月份、分类、厂商三种维度浏览。

<CardGroup cols={3}>
  <Card title="深度解读" icon="newspaper" href="/news/gemini-3-7-flash-launch" horizontal>
    查看 AI风向标栏目
  </Card>

  <Card title="实时动态" icon="radio-tower" href="/live" horizontal>
    模型状态与服务播报
  </Card>

  <Card title="充值活动" icon="gift" href="/faq/recharge-promotions" horizontal>
    查看当前加赠比例
  </Card>
</CardGroup>
