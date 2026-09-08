> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-VIP Agent 技能

> 在 Agent 里用 gpt-image-2-vip（官逆·Codex 线，可锁尺寸/4K，flat $0.03/张）出图——与 gpt-image-2、gpt-image-2-all 共用同一个 gpt-image-2 技能，只需把 --model 设为 gpt-image-2-vip。

<Note>
  **gpt-image-2-vip 不需要单独的技能**。它和 gpt-image-2（官转）、gpt-image-2-all 共用同一个 **gpt-image-2 系列技能**——三者都走同一套 OpenAI Images API，只是 `--model` 不同。完整的安装、`SKILL.md` 与脚本，见 [**GPT-Image-2 系列 Agent 技能**](/api-capabilities/gpt-image-2/skills)。
</Note>

## 这个模型适合什么

<CardGroup cols={3}>
  <Card title="能锁尺寸 / 4K" icon="expand">
    官逆 Codex 线，支持 30 档 `size`（含 3840×2160 等 4K），尺寸可控。
  </Card>

  <Card title="价格最省" icon="piggy-bank">
    flat \$0.03/张，所有尺寸同价，4K 也不加价。
  </Card>

  <Card title="文生图 / 多图融合" icon="layers">
    支持文生图与最多 16 张的多图融合（不支持画质档/掩码）。
  </Card>
</CardGroup>

## 在技能里怎么用

装好 [gpt-image-2 系列技能](/api-capabilities/gpt-image-2/skills) 后，把 `--model` 设为 `gpt-image-2-vip`，并用 `--size` 锁定尺寸：

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "城市夜景航拍" -o city.png --model gpt-image-2-vip --size 3840x2160
```

想把它设成默认通道，在 `gpt-image-2/.env` 里加一行：

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-vip
```

<Warning>
  **红线**：gpt-image-2-vip **不接受 `quality` / `n`**，也**不支持掩码局部重绘**（要掩码请用官转 `gpt-image-2`）。传 `n>1` 仍只出 1 张但会按张数扣费。技能脚本已对本模型自动门控，正常 `--model gpt-image-2-vip` 不会踩坑。

  另：`size` 偶有上游临时停用、被强制自适应 1K 的情况；此时把尺寸/比例**也写进提示词**（如「16:9」）兜底即可。
</Warning>

## 相关文档

* [GPT-Image-2 系列 Agent 技能（主页 · 完整脚本）](/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All Agent 技能](/api-capabilities/gpt-image-2-all/skills)
* [GPT-Image-2-VIP 图片生成总览](/api-capabilities/gpt-image-2-vip/overview)
