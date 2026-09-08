> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 怎么生成透明背景的图片（PNG 抠图）？

> gpt-image-2 传 background: transparent 就能直接输出带 alpha 通道的透明底图，png 与 webp 都支持，jpeg 因为没有 alpha 通道与透明互斥。本页汇总各图像模型的透明背景支持情况、最小示例与常见报错。

## 简短回答

**用 `gpt-image-2`，请求里加两个字段就行**：

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

返回的图就是带 alpha 通道的透明底 PNG，不需要任何后处理抠图。文生图、图片编辑、Responses 出图工具三条路都支持。

<Info>
  `background: "transparent"` 是 OpenAI 于 2026-08-21 为 GPT-Image-2 开放的能力（官方标注为 preview）。本站已实测可用，文生图与图片编辑均产出真 alpha 透明。
</Info>

## 哪些模型能出透明背景

| 模型                                    | 支持方式                                                                       | 稳定性                              |
| ------------------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| `gpt-image-2`                         | **参数控制** —— `background: "transparent"` + `output_format` 为 `png` 或 `webp` | ✅ 稳定，推荐                          |
| `gpt-image-1.5` / `gpt-image-1`       | 参数控制，同上                                                                    | ✅ 稳定（老模型，新项目建议直接用 `gpt-image-2`） |
| `gpt-image-2-all` / `gpt-image-2-vip` | **没有 `background` 参数**，只能在提示词里要求透明背景                                       | ⚠️ 偶现不稳定，同一条提示词可能出白底             |
| `seedream-5-0` / `seedream-5-0-pro`   | `output_format: "png"` + 提示词里写 `transparent background, alpha channel`     | ⚠️ 靠提示词，不保证每次都有 alpha            |
| Gemini 系出图（Nano Banana 系列）            | 只能在提示词里要求                                                                  | ⚠️ 同上                            |
| `seedream-4-5` / `seedream-4-0`       | 仅 `jpeg` 输出，没有 alpha 通道                                                    | ❌ 不支持                            |

<Tip>
  **需要稳定拿到透明底就用 `gpt-image-2`。** 参数控制和提示词要求是两回事：前者由接口保证，后者是"让模型尽量照做"，批量跑的时候差别很明显。
</Tip>

## 三种调用方式

### 文生图 `/v1/images/generations`

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a cute cartoon fox sticker, flat vector illustration, single centered subject, clean cutout edges, no background, no shadow",
    "background": "transparent",
    "output_format": "png",
    "quality": "low"
  }'
```

### 图片编辑 `/v1/images/edits`

给一张普通照片，让模型去掉背景：

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

蒙版局部重绘（`mask`）与透明背景可以同时用，互不冲突。

### Responses 出图工具

```json theme={null}
{
  "model": "gpt-5.2",
  "input": "生成一个卡通狐狸贴纸",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

返回的 `image_generation_call` 里会回显 `"background": "transparent"`。

## 为什么 `jpeg` 不行

JPEG 格式本身**没有 alpha 通道**，装不下透明信息。传 `output_format: "jpeg"` 加 `background: "transparent"` 会直接报 400：

```json theme={null}
{
  "error": {
    "message": "Transparent background is not supported for JPEG output format",
    "param": "background",
    "code": "invalid_value"
  }
}
```

想要透明就选 `png`（无损，体积大）或 `webp`（有损可调，体积小，同样支持 alpha）。`webp` 还能配合 `output_compression` 压体积。

## 编辑接口是「重绘去背」，不是精确抠像

这一点要提前对齐预期：`/v1/images/edits` 传 `background: transparent` 时，模型是**理解画面之后重新画一遍主体**，而不是像 Photoshop 那样沿着原图轮廓把主体切下来。所以：

* 主体的**姿态、风格、细节会有变化**，不是原图像素级保留
* 想尽量贴近原图，用 `quality: "high"`，并在提示词里明确「保持原有构图 / 不要改变主体外观」
* 如果业务要求像素级还原，建议自己用 `rembg`、`PIL`、`sharp` 这类工具做抠图，模型出图更适合"生成可复用素材"这类场景

## 计费

**透明背景不额外收费。** 相同画质档与尺寸下，`background: "transparent"` 与 `background: "opaque"` 消耗的 image token 完全一致，按 `gpt-image-2` 的正常按量计费规则走。

## 常见报错

<AccordionGroup>
  <Accordion title="报 400：Transparent background is not supported for JPEG output format">
    `output_format` 传了 `jpeg`。改成 `png` 或 `webp` 即可。
  </Accordion>

  <Accordion title="出图确实是白底，不是透明的">
    先确认三件事：一是 `background` 字段真的传上去了（编辑接口是 `multipart/form-data`，字段要用 `-F background=transparent` 而不是塞进 JSON）；二是响应顶层的 `background` 回显是不是 `transparent`；三是你用的是不是 `gpt-image-2` —— `gpt-image-2-all` 和 `gpt-image-2-vip` 没有这个参数，传了会被忽略。
  </Accordion>

  <Accordion title="怎么确认拿到的图真的有 alpha 通道">
    用 Python 一行就能验：

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA 才有 alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # alpha=0 的像素占比
    ```

    模式是 `RGB` 说明没有 alpha 通道；`RGBA` 但 alpha 全是 255，说明有通道但没镂空。
  </Accordion>

  <Accordion title="提示词里已经写了 transparent background，为什么还要传参数">
    提示词只是"请求模型这么画"，模型可能画一个看起来像透明的灰白棋盘格，那仍然是不透明像素。真正的 alpha 通道只有 `background: "transparent"` 参数能保证。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="GPT-Image-2 概览" icon="image" href="/api-capabilities/gpt-image-2/overview">
    完整参数、尺寸、画质档与错误码
  </Card>

  <Card title="文生图 API 参考" icon="wand-sparkles" href="/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations` 全部字段
  </Card>

  <Card title="图片编辑 API 参考" icon="scissors" href="/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits` 与多图融合
  </Card>

  <Card title="蒙版局部重绘" icon="square-dashed" href="/api-capabilities/gpt-image-2/mask-editing">
    用 alpha 蒙版标记要改的区域
  </Card>

  <Card title="官转 vs 官逆对比" icon="git-compare" href="/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    `gpt-image-2` / `-all` / `-vip` 怎么选
  </Card>

  <Card title="白底图出现脏块怎么办" icon="triangle-alert" href="/faq/white-background-image-artifacts">
    纯白背景的另一类问题
  </Card>
</CardGroup>
