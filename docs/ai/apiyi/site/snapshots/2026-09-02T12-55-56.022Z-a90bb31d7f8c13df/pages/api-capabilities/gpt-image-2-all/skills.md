> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-All Agent 技能

> 在 Agent 里用 gpt-image-2-all（官逆·ChatGPT 线，最快、flat $0.03/张）出图——与 gpt-image-2、gpt-image-2-vip 共用同一个 gpt-image-2 技能，只需把 --model 设为 gpt-image-2-all。

<Note>
  **gpt-image-2-all 不需要单独的技能**。它和 gpt-image-2（官转）、gpt-image-2-vip 共用同一个 **gpt-image-2 系列技能**——三者都走同一套 OpenAI Images API，只是 `--model` 不同。完整的安装、`SKILL.md` 与脚本，见 [**GPT-Image-2 系列 Agent 技能**](/api-capabilities/gpt-image-2/skills)。
</Note>

## 这个模型适合什么

<CardGroup cols={3}>
  <Card title="最快出图" icon="bolt">
    官逆 ChatGPT 线，约 30–60 秒，是三条通道里最快的。
  </Card>

  <Card title="价格最省" icon="piggy-bank">
    flat \$0.03/张，不分尺寸/画质档，走量友好。
  </Card>

  <Card title="文生图 / 多图融合" icon="layers">
    支持文生图与最多 16 张的多图融合（不支持掩码局部重绘）。
  </Card>
</CardGroup>

## 在技能里怎么用

装好 [gpt-image-2 系列技能](/api-capabilities/gpt-image-2/skills) 后，把 `--model` 设为 `gpt-image-2-all` 即可：

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "扁平插画风节日海报，竖版 2:3" -o poster.png --model gpt-image-2-all
```

想把它设成默认通道（不必每次加 `--model`），在 `gpt-image-2/.env` 里加一行：

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Warning>
  **红线**：gpt-image-2-all **不接受 `size` / `quality` / `n`**——

  * 尺寸/比例请**写进提示词**（如「竖版 2:3」「16:9 横幅」），传 `size` 会被忽略或报错；
  * 传 `n>1` **仍只出 1 张但会按张数扣费**。

  技能脚本已对本模型自动「不传 size/quality/n」，所以正常用 `--model gpt-image-2-all` 不会踩坑；只有你绕过脚本手搓请求时需要注意。需要锁尺寸/4K 请改用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/skills)，需要画质档/掩码请用官转 `gpt-image-2`。
</Warning>

## 相关文档

* [GPT-Image-2 系列 Agent 技能（主页 · 完整脚本）](/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-VIP Agent 技能](/api-capabilities/gpt-image-2-vip/skills)
* [GPT-Image-2-All 图片生成总览](/api-capabilities/gpt-image-2-all/overview)
