> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片生成有快速線或企業線嗎？

> 說明預設分組、企業分組和圖片模型生成速度之間的關係，以及對速度敏感時的模型選擇建議。

## 簡短回答

預設分組已經是日常圖片生成的推薦線路，速度通常足夠快。企業分組主要用於預設線路發生異常時兜底，並不是專門用於縮短圖片生成時間的“加速線”。

## 為什麼企業分組不一定更快

API易 已接入三網加速的優質回國線路，網路傳輸部分已經過最佳化。圖片生成的主要耗時通常來自上游模型本身的推理過程，而不是 API易 的線路，因此切換到企業分組一般無法突破模型的原生生成時間。

<Info>
  **分組的主要區別是路由與容災，不是模型推理加速。**

  * **預設分組**：日常呼叫優先使用，速度和穩定性已經過最佳化
  * **企業分組**：預設線路異常時作為兜底，重點是可用性保障
</Info>

## 對生成速度要求較高怎麼辦

如果業務更看重出圖速度，可以優先測試 [Nano Banana 圖片模型](/zh-Hant/api-capabilities/nano-banana-image/overview)，再根據畫質、成本和實測耗時決定是否切換。

<Warning>
  模型速度會受到圖片尺寸、生成數量、提示詞複雜度和上游負載影響。任何線路或分組都無法保證固定的圖片生成時間，建議使用真實業務引數進行併發測試。
</Warning>

## 相關文件

* [圖片 API 延遲如何最佳化？](/zh-Hant/faq/image-api-network-latency-optimization)
* [Nano Banana 圖片生成](/zh-Hant/api-capabilities/nano-banana-image/overview)
