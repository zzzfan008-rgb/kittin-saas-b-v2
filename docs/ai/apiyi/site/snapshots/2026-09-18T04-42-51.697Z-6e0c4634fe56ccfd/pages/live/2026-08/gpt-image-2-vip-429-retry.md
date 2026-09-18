> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 存在饱和，429 可重试、内容安全无需重试

> 8 月 25 日下午 gpt-image-2-vip 出现一定程度的饱和，非流式请求首字节耗时实测 82–190 秒。为避免客户长时间等待，我们下调了网关内部重试次数，把重试的选择权交给客户：遇到 429 请自行重试，遇到内容安全拦截则不必重试。

**2026/8/25 15:49 (UTC+8)** · 模型状态 · OpenAI

⚠️ **`gpt-image-2-vip` 存在一定程度的饱和：429 请自行重试，内容安全拦截无需重试**

今天下午 `gpt-image-2-vip` 的请求量偏高，非流式调用的首字节耗时实测在 **82–190 秒**区间。为了避免客户在一次调用里被动等待过久，我们**下调了网关侧的内部重试次数**——重试不再由网关默默替你做完，而是把选择权交给你。

两类错误的处置方式不同：

* **429（限流 / 排队）**：属于瞬时拥挤，**请自行重试**，通常重试即可通过
* **内容安全拦截**：属于原厂内容策略判定，**不必重试**，同一条提示词重试结果不会改变，只会白白增加等待

重试时的两个通道，按需自选：

* `gpt-image-2-vip`：存在饱和，首字节偏慢，重试仍可通过
* 官转 `gpt-image-2`：运行正常，按量计费，4K 与 `quality=high` 单价较高

建议把这两条写进客户端的错误分支：对 429 做有限次退避重试，对内容安全类错误直接返回给用户改提示词。相关参数与错误处理见 [gpt-image-2 概述](/api-capabilities/gpt-image-2/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
