> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 多图融合测试指南

> 客户常问：参考图数量是否和官方一致（最多14张）？本文给出两套可自行复现的测试方法，并公开一次14图融合的完整实测结果。

不少客户会问：**"你们支持的参考图数量和官方一致吗？"** 谷歌官方 Gemini 图像模型的参考图上限是**每次请求最多 14 张**，这也是目前业内能拿到的最高上限。答案是**支持**，但"支持"不该只是一句口头承诺——本文给出一套你可以自己动手复现的测试方法，并附上一次真实的 14 图融合实测结果。

## 为什么值得自己测一遍

14 张参考图是**极限场景**，实际业务里未必天天用到，但一旦用到（比如把多个独立设计的元素合成同一张海报/大片），你需要确认两件事：

1. **调用本身能不能成功**：14 张图叠在一起，请求体积会明显变大，会不会因为体积过大被拒绝？
2. **融合结果是否合理**：这么多张图一起塞给模型，会不会丢图、错位、张冠李戴？

下面两种方法，分别针对这两个问题设计，且都不依赖主观审美判断——结果一眼就能看出对不对。

## 方法一：客观标记法（推荐先做这个）

**思路**：不用复杂的业务场景，而是生成 N 张**彼此风格迥异、内容可数**的卡片（最简单的是 1 到 14 的数字），再要求模型把它们拼贴/融合成一张图。

* 每张卡片用完全不同的配色和材质风格（比如霓虹灯管、拉丝金属、粉笔字、像素风、木刻雕花……），保证融合结果里**每个数字都能凭颜色和风格反查到对应的输入图**；
* 融合后人眼一眼核对：**1 到 14 是否全部出现、有没有重复或缺失**，不需要判断"好不好看"，只需要判断"全不全、对不对"。

<Frame caption="14 张风格各异的数字卡片融合为一张海报：1–14 全部清晰可辨，颜色与材质与各自输入图一一对应">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-numbers-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=7d15943d875496202258495a5b0267d9" alt="14张创意数字卡片融合成一张3行5列网格海报，每个数字保留独特配色和材质风格" width="1600" height="1600" data-path="images/multi-image-fusion-14-numbers-demo.jpg" />
</Frame>

这套方法的价值在于**排除干扰项**：如果连"数字对不对"这种最基础的核验都能通过，说明模型确实在认真处理每一张输入图，而不是随便挑几张应付了事。

## 方法二：真实场景拆解法

**思路**：把你实际要用的业务场景，拆解成 N 个独立元素分别生成，再要求模型把它们融合回同一个场景。这更贴近真实使用方式——比如角色、服装、道具、背景分开管理，再合成一张成片。

以一个时尚大片场景为例，拆解成 14 个独立元素：模特人像、外套、载具、背景板、宠物/配饰若干、包袋、饰品、鞋履、行李箱等，每个元素单独生成一张图，风格基调保持统一（比如都用"浅灰影棚背景、写实摄影"）。

<Frame caption="14个独立生成的时尚元素（模特、服装、轿车、宠物、包袋、饰品等）融合为同一张时尚大片，元素齐全、构图协调">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-fashion-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=03cb3f755876ce41b2a49fed3c526dfe" alt="14个独立时尚元素融合成一张完整的时尚大片场景，模特斜倚粉色轿车旁，鹦鹉、宠物犬、手提包等元素齐全" width="1194" height="1600" data-path="images/multi-image-fusion-14-fashion-demo.jpg" />
</Frame>

核验重点：**14 个元素是否全部入镜**、位置和比例是否协调、有没有明显的元素丢失或变形。真实场景的融合天然比"数字拼贴"更难（不同元素的光影、透视需要重新统一），所以这一步能更真实地反映复杂业务场景下的融合质量。

<Tip>
  两种方法建议**都做**：方法一负责回答"模型有没有认真处理全部输入图"，方法二负责回答"复杂真实场景下融合是否够用"。只做方法二，一旦出问题很难判断是"模型没看到某张图"还是"构图效果不理想"这两类完全不同的问题。
</Tip>

## 请求格式：14 张图怎么塞进一次请求

Gemini 原生格式下，多图融合的规则很简单：**一个 `text` part（融合指令）+ N 个 `inlineData` part（每张参考图一个）**，每个 part 只能是 `text` 或 `inlineData` 其中一种，不能混在一起。

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# 最多可放 14 张参考图
image_paths = ["01.png", "02.png", "03.png", "..."]  # 最多14张
parts = [{"text": "请把这些图片的元素合理融合成一张场景图，保持风格统一、构图协调"}]
for path in image_paths:
    parts.append({"inlineData": {"mimeType": "image/png", "data": to_b64(path)}})

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "1:1", "imageSize": "2K"}
        }
    },
    timeout=600  # 图片数量多、请求体大，建议放宽超时
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("fused.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

更完整的多图编辑格式说明（`parts` 结构、常见报错）见 [图片编辑 API 参考](/api-capabilities/nano-banana-image/image-edit) 和 [Nano Banana 系列开发指南](/api-capabilities/nano-banana-dev-guide)。

## 客户最关心的问题：图片这么多，请求会不会太大被拒绝

14 张原图不压缩直接传，请求体积确实会明显变大。我们实测过一组真实数据（14 张 2K 分辨率的图片，未做任何压缩）：

| 项目                 | 实测数值                  |
| ------------------ | --------------------- |
| 单张原图体积             | 约 1.7MB – 4.0MB       |
| 14 张合计（Base64 编码后） | **约 42–43MB**         |
| 请求结果               | **全部成功**，未出现因体积被拒绝的情况 |

<Info>
  API易对单次请求的图片总量上限是 **100MB**（同步调用，避免内存占用过大）；单张图片则遵循谷歌官方规则，不超过 **7MB**。本次 14 张 2K 图合计 42–43MB，在两条规则的安全范围内，因此顺利调用成功。
</Info>

**结论**：即便不压缩，14 张 2K 参考图通常也不会撞到体积上限。但**压缩仍然是推荐做法**——不是因为不压会被拒绝，而是压缩后**耗时明显更短**（实测同样的融合任务，压缩后请求耗时约为原图直传的 1/2 到 1/3，因为省去了大体积数据的网络传输和服务端解码时间）。具体压缩参数建议（长边像素、JPEG 质量、多图合计体积目标）见 [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution)。

## 遇到"没出图"，先看是不是安全拦截

多图融合任务偶尔会命中 `finishReason: IMAGE_SAFETY`（HTTP 状态码仍是 200，但 `content.parts` 为空）。实测发现，**同样的输入原样重试 1-2 次，很可能就成功了**——这类拦截存在一定随机性，不代表输入内容真的有问题。

<Tip>
  安全拦截的图片**不计费**，建议在业务代码里对 `IMAGE_SAFETY` 做自动重试，而不是直接判定为失败。更多错误类型（安全拦截、内容审核、超时等）的识别和处理方式，见 [Gemini 生图 API 错误处理指南](/api-capabilities/gemini-image-error-handling)。
</Tip>

## 速查总结

* 谷歌官方上限**每次请求最多 14 张参考图**，API易已验证完全支持，实测调用成功、融合合理。
* 自测时建议**两种方法都做**：数字卡片法验证"全不全"，真实场景拆解法验证"合不合理"。
* 14 张 2K 原图合计约 40MB 级别，**在 API易 100MB / 谷歌单图 7MB 的限制范围内不会被拒绝**，但压缩上传耗时更短，仍是推荐做法。
* 多图请求的 `parts` 结构：**1 个 text + N 个 inlineData**，二者不能混在同一个 part 里。
* 遇到 `IMAGE_SAFETY` 空图返回，先重试 1-2 次，往往就能成功，且不计费。

## 相关文档

* [Nano Banana 系列开发指南](/api-capabilities/nano-banana-dev-guide)
* [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution)
* [Gemini 生图 API 错误处理指南](/api-capabilities/gemini-image-error-handling)
* [如何生成满意的图片](/api-capabilities/image-generation-success-tips)
