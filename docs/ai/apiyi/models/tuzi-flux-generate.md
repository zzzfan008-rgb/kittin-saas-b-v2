# FLUX 生成图像（兔子API / flux-3-image）

来源: https://tuzi-api.apifox.cn/343646931e0.md
抓取: 2026-10-27
实测校正: 2026-10-28（下面的「实测结论」覆盖上面的通用描述）

## 三条通道（只有第 2 条能满足「参考图编辑」）

| 通道 | 端点 | 能否带参考图 | 结论 |
|---|---|---|---|
| 原生 flux | `POST /flux/v1/{model_name}` → `GET /flux/v1/get_result?id=` | **不能** | 只接受 `prompt` + `width`/`height`（16 的倍数）。`aspect_ratio` / `images` / `input_image` / `image` / `image_2` / `input_images` / `reference_images` / `image_url` 一律 400 `... is not supported by this FLUX endpoint` |
| OpenAI 兼容 generations | `POST /v1/images/generations`（JSON） | **能** | 参考图逐字段命名：`input_image`、`input_image_2` …；可带 `aspect_ratio` / `resolution` / `output_format` |
| OpenAI 兼容 edits | `POST /v1/images/edits`（multipart，`image`） | **能，但多图会丢** | 塞多张同名 `image` 时参考图被**整体丢弃**（成片等于纯文生图，且 `status=succeeded`，静默错误）。单张 `image` 可用 |

⚠️ 本文件早期版本写的「编辑 POST /v1/images/edits (multipart, image 字段)」只对**单图**成立，
多图必须走第 2 条。契约 `model-contracts.json` 的 `flux-3-image.edit` 已按此固定为
`/v1/images/generations` + `singleImageField: input_image` / `multipleImageField: input_image_2`。

原生通道的模型枚举（该文档页）只有 `bfl-flux-2-pro/max/flex`、`flux-kontext-pro/max`，
**不含 flux-3-image** —— 这也是 flux-3 走原生只能文生图的原因。

## 证据归档

上面的实测已归档为正式证据：`docs/ai/apiyi/evidence/2026-10-28-flux-3-image-endpoint-probe.json`
（`kind: model-endpoint-probe`，含原生端点拒绝 `aspect_ratio` 的 400 原文与
`/v1/images/generations` + `input_image` 的 200 结果）。据此两个契约文件的
`evidenceStatus` 由 `unverified` 升为 `verified`。

## 实测证据（2026-10-28，每次都是真实付费调用）

判据：给两张 256px 纯色 JPEG（红=图1、绿=图2），让模型「只输出某一号图的颜色」，读回图求通道均值。

| 提交方式 | 结果 | 结论 |
|---|---|---|
| multipart edits，1 张 `image` | rgb(232,32,27) 纯红 | 单图编辑正常 |
| multipart edits，2 张同名 `image` | rgb(186,155,124) 米灰 | **两张都没被采纳** |
| generations + `image: [..]` / `images: [..]` | 502（网关 504 超时） | 不可用/不稳定 |
| 原生 `/flux/v1/flux-3-image` + `images` | 400 `images is not supported` | 原生不收参考图 |
| generations + `input_image` + `input_image_2` | 200 / 41s，输出带参考图色彩 | **这条是唯一可用形态** |

## 已知缺陷：多图索引辨识不稳定

即使走对了第 2 条通道，flux-3-image 对「第几张图」的辨识仍不稳定：同一提示词问 image 1，
可能给 image 2 的颜色；把 `input_image` / `input_image_2` 互换也不稳。结果是 `succeeded`
却可能张冠李戴 —— 属**静默错误**。

产品处置（2026-10-28 P0）：`imageModelReferenceWarning()` 在参考图 >1 张时于生成节点面板
给出非阻断告警，提示改用 GPT2.5 快速/专业。多图语义（如模特试穿）不要用 flux 做金标准。

## 其它参数

- `resolution`: `768sq` | `1k` | `1.5k` | `2k` | `4k`，默认 `1k`；**4k 单张约 $0.607，1k 约 $0.048（12 倍差）**
- `aspect_ratio`: 默认 `auto`（跟随第一张参考图 / 文生图按模型自选）
- 返回：`data[0].url` 或 `data[0].b64_json`，两种都要覆盖（实测两者都出现过）
