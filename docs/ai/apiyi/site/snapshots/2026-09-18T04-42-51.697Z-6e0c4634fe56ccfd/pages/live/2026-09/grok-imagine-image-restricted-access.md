> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 图片模型默认不对外开放，改为申请开通专属分组

> grok-imagine-image / grok-imagine-image-quality 已完成接入，但不在 Default 默认分组，改为 Grok_imagine 专属分组定向开放：累计消费满 1000 美元的存量客户联系客服开通，其他客户提交申请审核后开通，未开通调用返回 503。

**2026/9/16 01:10 (UTC+8)** · 服务通知 · xAI

🔒 **Grok Imagine 图片模型已完成接入，但默认不对外开放，需申请开通 `Grok_imagine` 专属分组**

`grok-imagine-image` / `grok-imagine-image-quality` 的内容安全策略与平台其它模型差异较大、部分类别不作过滤，为避免合规风险我们采取定向开放：本系列**不在 `Default` 默认分组**，新增 `Grok_imagine` 专属分组承载。令牌未开通时调用固定返回 `503`，这是权限问题、不是服务故障，重试无效。

开通方式：

* **累计消费满 \$1,000 的存量客户**：联系客服说明用途，核验后开通
* **其他客户**：通过[企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)提交申请，说明**使用场景**与**内容管控措施**，审核通过后我们为你单独开通

开通后把令牌分组切到 `Grok_imagine` 即可，定价与 `Default` 一致（1.0x 倍率）。参数、计费与完整申请流程见 [Grok Imagine 2 概览](/api-capabilities/grok-imagine-image/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
