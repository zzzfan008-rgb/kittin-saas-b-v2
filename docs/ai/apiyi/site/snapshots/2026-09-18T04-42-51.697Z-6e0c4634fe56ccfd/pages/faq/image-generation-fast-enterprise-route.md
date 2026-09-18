> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片生成有快速线或企业线吗？

> 说明默认分组、企业分组和图片模型生成速度之间的关系，以及对速度敏感时的模型选择建议。

## 简短回答

默认分组已经是日常图片生成的推荐线路，速度通常足够快。企业分组主要用于默认线路发生异常时兜底，并不是专门用于缩短图片生成时间的“加速线”。

## 为什么企业分组不一定更快

API易 已接入三网加速的优质回国线路，网络传输部分已经过优化。图片生成的主要耗时通常来自上游模型本身的推理过程，而不是 API易 的线路，因此切换到企业分组一般无法突破模型的原生生成时间。

<Info>
  **分组的主要区别是路由与容灾，不是模型推理加速。**

  * **默认分组**：日常调用优先使用，速度和稳定性已经过优化
  * **企业分组**：默认线路异常时作为兜底，重点是可用性保障
</Info>

## 对生成速度要求较高怎么办

如果业务更看重出图速度，可以优先测试 [Nano Banana 图片模型](/api-capabilities/nano-banana-image/overview)，再根据画质、成本和实测耗时决定是否切换。

<Warning>
  模型速度会受到图片尺寸、生成数量、提示词复杂度和上游负载影响。任何线路或分组都无法保证固定的图片生成时间，建议使用真实业务参数进行并发测试。
</Warning>

## 相关文档

* [图片 API 延迟如何优化？](/faq/image-api-network-latency-optimization)
* [Nano Banana 图片生成](/api-capabilities/nano-banana-image/overview)
