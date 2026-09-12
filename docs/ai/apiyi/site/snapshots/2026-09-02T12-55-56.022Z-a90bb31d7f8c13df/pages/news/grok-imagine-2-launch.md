> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 图片模型上线：附完整实测

> xAI 第二代图像模型 Grok Imagine 2 登陆 API易，按次 $0.02 / $0.045 一张，不区分分辨率——官网 quality 版 2K 要 $0.07，我们仍是 $0.045，约合 6.4 折，叠加充值加赠后常规约 5.8 折。Arena 文生图与图像编辑双榜第二。实测 5 种宽高比全部精确生效、2K 达 2816×1584、单次最多 10 张，同时测出两个必须绕开的口径差异。

## 核心要点

* **两个模型上线**：`grok-imagine-image`（**\$0.02/张**）与 `grok-imagine-image-quality`（**\$0.045/张**），`Default` 默认分组即可调用
* **按次固定计费，不区分分辨率**：官网 quality 版 1K \$0.05 / 2K \$0.07，我们两档统一 **\$0.045**——1K 约 9 折，**2K 约 6.4 折**，分辨率越高越划算；**叠加充值加赠后出 2K 常规约 5.8 折、拉满约 5.4 折**
* **Arena 双榜第二**：xAI 称 Image 2.0 在 Arena 的文生图与图像编辑两个榜单均排名全球第二，第一是 OpenAI 的 gpt-image-2（数据截至 2026 年 8 月 7 日）
* **参数真实生效**：5 种宽高比 × 1K/2K 双档共 20 组实测，输出像素与请求值 **20/20 精确吻合**，16:9 出 2K 达 2816×1584
* **编辑是真编辑**：改指定部分、其余逐像素保留，画风 / 构图 / 配色 / 主体身份都不走样，支持 1–4 张多图融合
* **两个必须知道的口径差异**：编辑必须走 `multipart/form-data`（发 JSON 会 400）；参考图**不能**传给文生图端点（会 200 出图但静默丢弃）

## 背景介绍

xAI 在 **2026 年 8 月 7 日**发布了新一代图像模型 **Grok Imagine Image 2.0**，作为 Grok 图像生成的「Quality Mode」上线 `grok.com/imagine` 与 iOS / Android 客户端。API易 接入的正是**官转通道的 Quality Mode**。

与初代最大的不同在于**它是一个以编辑为中心的模型**，而不是只把一次性文生图做得更好。xAI 官方给出的 Arena 成绩是：**文生图与图像编辑两个榜单均位列全球第二**，第一名是 OpenAI 的 gpt-image-2。

对开发者来说，这一代最实际的价值不是"画得更好看"，而是**参数终于可控了**。我们在 API易 上对这两个模型做了约 220 次真实调用的完整实测——上一代在网关侧的表现是宽高比与分辨率参数静默失效、2K 根本出不来、多图请求直接 500，而这一代**这些问题全部消失**。

<Info>
  信息来源：xAI 官方发布说明与模型文档 `docs.x.ai/developers/models/grok-imagine-image`，Arena 排行榜数据引自 xAI 官方公告（截至 2026 年 8 月 7 日）。本文所有 API 行为数据来自 API易 的实测（2026 年 8 月 12 日，约 220 次调用）。
</Info>

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="双档分辨率，同一价格" icon="expand">
    `1k` 约 1 兆像素、`2k` 约 4.2–4.5 兆像素，**按次计费不区分分辨率**，出 2K 不加钱（官网要加）
  </Card>

  <Card title="5 种宽高比精确生效" icon="maximize">
    `1:1` / `16:9` / `9:16` / `4:3` / `3:4`，20 组实测输出像素与请求值完全吻合
  </Card>

  <Card title="单次最多 10 张" icon="images">
    `n` 支持 1–10，一次请求返回多张，批量选图不用自己写并发循环
  </Card>

  <Card title="真参考图编辑" icon="wand">
    只改提示词指定的部分，其余逐像素保留，支持 1–4 张多图融合
  </Card>
</CardGroup>

### 出图几何：20/20 精确吻合

这是本代相对上一代最实质的改进。5 种宽高比 × 2 档分辨率共 20 组调用，两个模型逐格一致：

| 宽高比    | `resolution: 1k` | `resolution: 2k` |
| ------ | ---------------- | ---------------- |
| `1:1`  | 1024×1024        | 2048×2048        |
| `16:9` | 1280×720         | **2816×1584**    |
| `9:16` | 720×1280         | 1584×2816        |
| `4:3`  | 1152×864         | 2368×1776        |
| `3:4`  | 864×1152         | 1776×2368        |

2K 档实际面积约为 1K 的 **4.0–4.8 倍**，是真正的高分辨率输出，不是插值放大。

<Warning>
  **1K 出 JPEG、2K 出 PNG**，格式随分辨率档位变化。2K 是 PNG 无损，**单张 5–6 MB**，1K 是 JPEG、单张约 220–300 KB，相差约 20 倍。移动端或需要批量回传的场景建议用 1K——反正两档同价，选择只取决于画质与带宽的权衡；反过来追求画质选 2K 也不加价，相对官网折扣反而更深。
</Warning>

### 编辑能力实测

编辑效果是这一代的重点，我们用**对照实验**验证（同一提示词分带图 / 不带图两组各跑 3 次），而不是只看 HTTP 200：

| 输入素材                   | 编辑指令           | 结果                               |
| ---------------------- | -------------- | -------------------------------- |
| 水彩风蓝围巾狐狸插画（16:9）       | 把围巾改成红色，其余保持不变 | 围巾变红，**水彩画风、雪林构图、白边、画幅全部保留** 3/3 |
| 卡通橘猫贴纸（金冠、薄荷绿底）        | 加一副圆形黑色墨镜      | 加上墨镜，**卡通描边、金冠、背景色完全不变** 3/3     |
| 狐狸插画 + 橘猫贴纸            | 把猫放进狐狸的场景      | 贴纸猫真的进入了水彩雪林，**两张图的特征都在**        |
| 狐狸 + 猫 + 黄鸭 + 紫茶壶（4 张） | 全部合进同一个场景      | **4 个主体全部出现且特征保留**，见下            |

对照组（不带参考图、同一提示词）产出的是写实风格的全新图片，与带图组**在画风、主体、画幅上完全可区分**——这证明参考图确实被消费了。

**多图融合是真融合**：用 4 张特征互不重叠的参考图（水彩蓝围巾狐狸 / 卡通金冠橘猫 / 黄色橡皮鸭 / 紫色圆点茶壶）按 2、3、4 张递进测试，**每多传一张，输出就多一个对应主体**，各自的鲜明特征都保留下来——不是只接受文件不消费。

<Info>
  **编辑输出的画幅跟随「第一张」参考图**：输入 1280×720 就输出 1280×720，`resolution` 与 `aspect_ratio` 在编辑端点上传了不生效。多图融合时把 4 张顺序完全颠倒，输出画幅会从 1280×720 变成 1024×1024，**跟着新的第一张走**——所以建议**把最重要的主体放第一张**。需要改变画幅请先自行裁剪参考图。
</Info>

### 速度与并发

| 场景    | 中位耗时          |
| ----- | ------------- |
| 1K 出图 | 约 **9 秒**     |
| 2K 出图 | 约 **15–17 秒** |

实测 **100 RPM 无压力**，无 429、无排队拒绝，渠道资源充足，可以直接并发调用，不需要自建串行队列。

<Warning>
  图片 API 是**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。**建议客户端超时设到 360 秒**，按 60 秒配置会产生大量误超时。
</Warning>

## 两个必须绕开的口径差异

这两条是实测中最容易让人踩坑的地方，**接入前务必先看**。

### 一、图片编辑必须用 multipart，发 JSON 一律 400

`/v1/images/edits` 只接受 `multipart/form-data` 文件上传。发送 JSON（包括部分上游厂商文档里写的 `{"image": {"type": "image_url", "url": "..."}}` 形式）会**固定返回 400**：

```text theme={null}
request Content-Type isn't multipart/form-data
```

我们穷举了 20 种 JSON 写法，无一例外。正确写法是文件上传：

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=把围巾改成红色，其余部分完全保持不变" \
  -F "image=@fox.jpg"
```

好消息是文件上传**不需要图床**——直接传本地文件即可，比准备公网 URL 更省事。文件字段名只能是 `image` 或 `image[]`，写成 `images` / `image_file` 会返回 415。

### 二、参考图不要传给文生图端点

这条更隐蔽：给 `/v1/images/generations` 传 `image` / `image_url` / `images` **不会报错**，而是返回 200 并按提示词生成一张全新的图，**参考图被完全忽略，并且照常计费**。

实测传入一张水彩风狐狸插画、要求"把围巾改成红色"，输出的是**一个穿红围巾的写实中年男人**——与输入图毫无关系。由于没有任何错误信号，这类问题往往要到发现"出的图和输入图对不上"时才被察觉。

**只要涉及参考图，一律走 `/v1/images/edits`。**

<Warning>
  另外注意**参数校验很宽松**：非法的 `aspect_ratio`（如 `5:7`）、`resolution`（如 `1K`、`1024x1024`）、`response_format` 都会**静默回退默认值**并正常出图，不会返回 400。拿到的图不符合预期时，**先检查参数拼写**。

  唯一例外是 `resolution: "4k"`，它返回 `503 model_service_unavailable`——这是**该档位不支持**而非渠道故障，重试无效，改回 `1k` / `2k` 即可。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="成本敏感的批量出图" icon="percent">
    按次固定价 + 2K 不加价，预算可精确到张；`n` 最多 10 让批量选图只需一次请求
  </Card>

  <Card title="局部微调而非重画" icon="wand">
    编辑保真度高，适合"只改一处、其余不动"的物料迭代（换配色、加配饰、改背景）
  </Card>

  <Card title="多图合成" icon="layers">
    1–4 张参考图融合，把 A 图主体放进 B 图的场景与画风
  </Card>

  <Card title="固定画幅的物料生产" icon="maximize">
    宽高比参数可靠，适合按 16:9 / 9:16 批量产出封面、竖版海报
  </Card>
</CardGroup>

### 代码示例

**文生图**（OpenAI SDK 直连）：

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat on a glassy alpine lake at dawn, cinematic photography",
    n=1,
    # aspect_ratio / resolution 不是 OpenAI SDK 标准字段，放进 extra_body
    extra_body={"aspect_ratio": "16:9", "resolution": "1k", "response_format": "url"}
)

urllib.request.urlretrieve(resp.data[0].url, "out.jpg")
```

**图片编辑**（必须 multipart）：

```python theme={null}
import requests

with open("fox.jpg", "rb") as fp:
    r = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},  # 不要手动设 Content-Type
        data={
            "model": "grok-imagine-image",
            "prompt": "把围巾改成红色，其余部分完全保持不变",
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},   # 用 files= 而不是 json=
        timeout=360
    ).json()

print(r["data"][0]["url"])
```

### 最佳实践

1. **先分清端点**：无参考图走生成、有参考图走编辑，选错不会报错只会拿到错图
2. **编辑指令写明「其余保持不变」**：模型对这类约束遵循度很好，能最大限度保留原图
3. **多图融合显式指代「图1 / 图2」**：对应 `image[]` 的上传顺序，比让模型自己猜更稳
4. **不要依赖 `seed` 复现**：本系列不支持 `seed`，同一提示词两次结果不同
5. **不要用 `usage` 核账**：`prompt_tokens` 恒为 `1000 × n` 是占位值，真实扣费以控制台账单为准

## 价格与可用性

| 模型                           | 分辨率         | API易定价          | xAI 官网定价 | 折扣          |
| ---------------------------- | ----------- | --------------- | -------- | ----------- |
| `grok-imagine-image`         | `1k` / `2k` | **\$0.02 / 张**  | \$0.02   | 与官网持平       |
| `grok-imagine-image-quality` | `1k`        | **\$0.045 / 张** | \$0.05   | **9 折**     |
| `grok-imagine-image-quality` | `2k`        | **\$0.045 / 张** | \$0.07   | **约 6.4 折** |

两个型号均为**按次固定计费**，编辑与文生图同价。

**这里有个容易被忽略的点**：xAI 官网的 quality 版是**按分辨率分档收费**的（1K \$0.05、2K \$0.07），而 API易 **两档统一 \$0.045**。也就是说，**你出的图分辨率越高，相对官网越省**——出 1K 约 9 折，出 2K 约 **6.4 折**。对于本来就要出高清图的场景，这个差价比"便宜一点点"要实在得多。

**分组**：`Default` 默认分组（1.0x 倍率），**无需切换分组**。令牌「计费模式」选 `按量优先`（Pay-as-you-go Priority）即可。

### 叠加充值加赠后的实际成本

按次计费同样可以叠加 [充值阶梯加赠](/faq/recharge-promotions)（加赠按**单次充值金额**计算）。以 quality 版出 2K 为例：

| 充值档位               | 到账倍数   | 单张实付         | 相当于官网 \$0.07 |
| ------------------ | ------ | ------------ | ------------ |
| 不参与活动（挂牌价）         | 1.0 倍  | \$0.045      | **6.4 折**    |
| 单次充 \$100（送 10%）   | 1.1 倍  | ≈ \$0.041    | **约 5.8 折**  |
| 单次充 \$1,000（送 15%） | 1.15 倍 | ≈ \$0.039    | **约 5.6 折**  |
| 单次充 \$3,000（送 20%） | 1.2 倍  | **\$0.0375** | **约 5.4 折**  |

也就是说，**常规充值档（\$100）下出一张 2K 高清图约合官网 5.8 折，加赠拉满可到约 5.4 折**。标准版 `grok-imagine-image` 同样可叠加，\$0.02 挂牌价在 20% 加赠下实付约 \$0.0167/张。

## 总结与建议

Grok Imagine 2 在 API易 上是一个**参数可控、成本可预测、编辑保真度高**的图像模型。相较上一代在网关侧的表现，宽高比 / 分辨率 / 多图三项能力全部修好，2K 真实可达，延迟也快了约一倍。

**该选它的场景**：需要成本精确到张（按次固定价、2K 不加价）、需要单次出多张、或者需要"只改一处、其余不动"的高保真编辑。

**该继续用 [GPT-Image-2](/api-capabilities/gpt-image-2/overview) 的场景**：需要 mask 局部重绘、需要像素级自定义尺寸、或者需要超过 4 张参考图融合——这三项 Grok Imagine 2 目前不支持。Arena 榜单上 gpt-image-2 也确实仍排在第一。

两者共存不冲突，同一把令牌都能调用。已经接入 GPT-Image-2 的团队可以直接看文档里的 **[从 GPT-Image-2 迁移](/api-capabilities/grok-imagine-image/overview#从-gpt-image-2-迁移)** 章节——端点一样，但参数体系是另一套，其中「响应默认格式相反」这条最容易漏。

<Info>
  **数据说明**：本文的 API 行为、几何、耗时、编辑效果数据均来自 API易 在 2026 年 8 月 12 日 (UTC+8) 的实测，共约 220 次真实调用；模型发布信息与 Arena 排名引自 xAI 官方公告（2026 年 8 月 7 日）。定价可能随官方政策调整，以控制台实际计费为准。
</Info>

## 相关文档

* [Grok Imagine 2 接入总览](/api-capabilities/grok-imagine-image/overview) - 完整参数、分组、FAQ
* [文生图 API 参考](/api-capabilities/grok-imagine-image/text-to-image) - 带在线 Playground
* [图片编辑 API 参考](/api-capabilities/grok-imagine-image/image-edit) - multipart 完整示例
* [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)
