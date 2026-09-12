> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 一次调用返回多张图

> Nano Banana 系列可以在一次调用里返回多张各自独立的成品图，实测最多 10 张。本文讲触发条件、张数控制、两种模型完全不同的计费方式，以及怎么和思考中间稿区分开。

很多人以为 Gemini 图片模型「一次只能出一张图」。**实测不是**：只要提示词是「给我 N 个变体 / 分几步讲 / 做个分镜」这种形态，模型会在**同一个响应里返回多张各自独立的成品图**，每张前面还配一段说明文字。实测一次最多拿到 **10 张**。

本文结论来自 2026-08-27 对 API易 生产网关的 92 次实测（6 类提示词 × 8 次触发率测试 + 张数上限 + 两个模型对照 + 分辨率叠加 + OpenAI 兼容路径），以及对生产日志 24 小时内 1212 条高输出记录的归因。

<Info>
  这和 [开发指南 · 偶现多图输出](/api-capabilities/nano-banana-dev-guide#偶现多图输出是怎么回事) 讲的**不是同一回事**。那里说的是复杂编辑任务下模型自己产生的**思考中间稿**（同一张图的逐稿修正，取最后一张即可）；本文讲的是**你主动要求、每张都是独立成品**的多图输出——这种情况下「取最后一张」会把用户真正要的图丢掉。两者怎么区分见下文 [和思考中间稿怎么区分](#和思考中间稿怎么区分)。
</Info>

## 结论速览

| 问题               | 结论                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| 一次能出几张？          | 实测最多 **10 张**，要 6 张给 6 张、要 10 张给 10 张，`finishReason` 仍是 `STOP`（没有被截断）                                                |
| 怎么触发？            | 提示词形态决定，**不是随机**。「分步图文教程」实测 8/8 触发，「N 个设计变体」5/8                                                                      |
| 是多个 candidate 吗？ | **不是**。`candidateCount` 会被拒（`Multiple candidates is not enabled for this model`），多张图在**同一个 candidate 的 `parts` 数组**里 |
| 图是重复的吗？          | 不是。10 张图 sha256 各不相同，是 10 张不同的成品                                                                                     |
| 怎么收费？            | **`gemini-3.1-flash-image` 按张线性叠加；`gemini-3-pro-image` 按次固定，出几张都是 \$0.09**                                           |
| 分辨率跟着走吗？         | 跟。`imageSize` 对每一张都生效，token 是「单张量 × 张数」                                                                              |

## 响应长什么样

一条「给 3 个 logo 变体」的提示词，实际返回：

```text theme={null}
candidates = 1,  finishReason = "STOP",  parts 长度 = 6

  parts[0]  text        "Here are three distinct logo design variations…"
  parts[1]  inlineData  image/jpeg  914,915 B  1408×768   sha256 前 12 位 f6ab6076c1e6
  parts[2]  text        "### Variation 2: The Modern Minimalist…"
  parts[3]  inlineData  image/jpeg  632,568 B  1408×768   sha256 前 12 位 e3d5eda56d83
  parts[4]  text        "### Variation 3: The Geometric Abstract…"
  parts[5]  inlineData  image/jpeg  796,069 B  1408×768   sha256 前 12 位 5fdf9d3fe811
```

对应的 usage：

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 23,
  "candidatesTokenCount": 4132,
  "candidatesTokensDetails": [
    { "modality": "IMAGE", "tokenCount": 3360 }   // 3360 = 3 张 × 1120
  ],
  "totalTokenCount": 4155
}
```

三张图的 sha256 完全不同，文件大小也不同（914KB / 632KB / 796KB），**是三个不同的设计方案，不是同一张图的三次迭代**。

## 什么提示词会触发

触发是**概率性的、由提示词形态决定**。同一条提示词跑 8 次的实测触发率：

| 提示词形态         | 示例                                 | 触发率     | 典型张数           |
| ------------- | ---------------------------------- | ------- | -------------- |
| **分步图文教程**    | "分 3 步讲手冲咖啡，每步文字后配一张插图"            | **8/8** | 3              |
| **分镜 / 连续画面** | "画一个 3 格分镜：猫醒来、伸懒腰、吃饭，每格一张图"       | **7/8** | 3（有 1 次给了 6 张） |
| **N 个设计变体**   | "给咖啡店 Ember 做 3 个 logo 变体，每个变体一张图" | 5/8     | 3              |
| **N 种艺术风格**   | "同一座灯塔画 3 种风格：水彩、扁平矢量、50 年代插画"     | 1/8     | 3              |
| **前后对比**      | "客厅极简改造前后，两张独立的图"                  | **0/8** | 1              |
| **罗列 N 个物体**  | "生成 4 张独立的图：红苹果、青梨、香蕉、紫葡萄"         | **0/8** | 1              |

<Tip>
  **想稳定拿到多图，写成「每一张之间有叙述关系」的形态**——分步骤、分镜头、分变体、分风格。

  **单纯罗列 N 个不相干的物体反而不触发**（0/8），模型会把它们画进同一张图里。这条最反直觉：提示词里写死「生成 4 张独立的图」并不管用，写成「第 1 步…第 2 步…」才管用。
</Tip>

## 一次最多几张

明确要求 6 张和 10 张，各跑 6 次：

| 要求张数 | 触发次数 | 实际返回                 | 图片 tokens         | `finishReason` |
| ---- | ---- | -------------------- | ----------------- | -------------- |
| 6 张  | 3/6  | **恰好 6 张**，6 张全不重复   | 6720 = 6 × 1120   | `STOP`         |
| 10 张 | 3/6  | **恰好 10 张**，10 张全不重复 | 11200 = 10 × 1120 | `STOP`         |

触发的时候张数就是你要的数；没触发的时候退回 1 张。`finishReason` 始终是 `STOP`，说明 10 张不是上限被截断，只是我们没往上试。

## 计费：两种模型完全相反

这是本文最需要注意的一条。

### `gemini-3.1-flash-image`（Nano Banana 2）—— 按量，张数直接乘上去

每张图按固定 tokens 计入 `candidatesTokensDetails`，**输出 tokens 随张数严格线性增长**：

| 张数   | 图片 tokens（1K） | 实测单次扣费  |
| ---- | ------------- | ------- |
| 1 张  | 1120          | \$0.035 |
| 3 张  | 3360          | \$0.090 |
| 6 张  | 6720          | \$0.173 |
| 10 张 | 11200         | \$0.278 |

`imageSize` 对每一张都生效，单张量按档位走：

| `imageSize` | 单张像素      | 单张 tokens | 3 张时 |
| ----------- | --------- | --------- | ---- |
| `1K`（默认）    | 1408×768  | **1120**  | 3360 |
| `2K`        | 2816×1536 | **1680**  | 5040 |
| `4K`        | 5632×3072 | **2520**  | 7560 |

<Note>
  **这张表只适用于 `gemini-3.1-flash-image`（NB2）。Pro 的档位换算完全不同**，实测同一提示词各 2 次：

  | 模型                            | 1K   | 2K       | 4K       |
  | ----------------------------- | ---- | -------- | -------- |
  | `gemini-3.1-flash-image`（NB2） | 1120 | **1680** | **2520** |
  | `gemini-3-pro-image`（Pro）     | 1120 | **1120** | **2000** |

  两者像素尺寸相同（1408×768 / 2816×1536 / 5632×3072），但 NB2 在 2K 和 4K 档上单张 token 更贵。
  Pro 的明细见 [usage 字段与输出解读](/api-capabilities/nano-banana-usage-metadata)；
  由于 Pro 按次固定计价，这些 token 数不进 Pro 的账单。
</Note>

<Warning>
  **多图 + 4K 会让单次费用上一个数量级**。3 张 4K = 7560 图片 tokens，实测单次 **\$0.18**，是单张 1K（\$0.035）的 5 倍多。

  如果你的应用把用户输入直接透传给模型，用户随手写一句「给我几个方案」就可能触发多图。**按量计费下建议在提示词层显式约束张数**，或改用下面的 Pro 按次计费。
</Warning>

### `gemini-3-pro-image`（Nano Banana Pro）—— 按次固定，多图不加价

Pro 是**按次计费 \$0.09/次，不看 tokens**。实测同一条「3 个 logo 变体」提示词跑 8 次：

|                      | 返回张数           | 图片 tokens | 实测扣费         |
| -------------------- | -------------- | --------- | ------------ |
| `gemini-3-pro-image` | **8/8 都是 3 张** | 3360      | **\$0.0900** |
| 对照：Pro 单张出图          | 1 张            | 1120      | \$0.0900     |

**3 张图和 1 张图一个价。** 加上 Pro 本来就 1–4K 同价，所以在 Pro 上「一次要 3 个 4K 变体」和「一次要 1 张 1K 图」的费用完全相同，都是 \$0.09。

<Tip>
  **需要多方案比选的场景（logo / 海报 / 配图选型），Pro 的按次计费明显更划算。**

  同样是 3 张 4K：Pro 按次 **\$0.09**；NB2 按量约 **\$0.18**。而单张 1K 时反过来，NB2（\$0.035）比 Pro（\$0.09）便宜。**按次 vs 按量的性价比分界点，就在「一次要几张、多大」上。**
</Tip>

## 和思考中间稿怎么区分

两种多图长得很像——都在同一个 candidate 里、都带 `thoughtSignature`、都没有 `thought: true` 标记。**判据是图和图之间有没有文字段**：

|            | 交替生成（本文）                  | 思考中间稿（[开发指南](/api-capabilities/nano-banana-dev-guide#偶现多图输出是怎么回事)） |
| ---------- | ------------------------- | ------------------------------------------------------------------ |
| `parts` 排列 | `文 图 文 图 文 图`（每张图前面有对应说明） | `图 图 图`（图片连续，中间没有文字）                                               |
| 图与图的关系     | 各自独立的成品，构图/内容完全不同         | 同一设计的逐稿修正，构图相同、细节略有差异                                              |
| 张数         | 与提示词要求的数量一致（要 6 给 6）      | 模型自己决定，2–10 张不等                                                    |
| 典型触发       | 分步教程 / 分镜 / N 个变体         | 复杂任务型编辑（多重约束的图片编辑）                                                 |
| **该怎么取**   | **全都要**                   | **取最后一张**                                                          |

实测对照：一条复杂编辑提示词（去背景 + 换影棚渐变 + 加标题文字 + 加价格角标 + 光照匹配）跑 6 次，**6/6 都只返回 1 张**，排列是 `图`；而分步教程提示词 8/8 返回 3 张，排列是 `文 图 文 图 文 图`。

<Warning>
  **既有文档里「取最后一张即可」的建议，只适用于思考中间稿那一类。** 在交替生成场景下照做，会把用户要的 3 个 logo 丢掉 2 个。

  安全的写法是**先看排列再决定**：图片之间夹着文字 → 全部保留；图片连续无文字 → 取最后一张。
</Warning>

## 取图代码

```python theme={null}
parts = (response.get("candidates") or [{}])[0].get("content", {}).get("parts") or []

images, has_text_between = [], False
prev_was_image = False
for p in parts:
    if "inlineData" in p:
        images.append(p["inlineData"])          # 存 data 和 mimeType，后缀以 mimeType 为准
        prev_was_image = True
    elif p.get("text", "").strip():
        if prev_was_image:
            has_text_between = True             # 图后面又出现文字 = 交替生成
        prev_was_image = False

if not images:
    raise RuntimeError("未返回图片，检查是否被安全策略拦截")

# 交替生成 → 每张都是成品，全部保留；否则是思考中间稿 → 取最后一张
results = images if (len(images) > 1 and has_text_between) else images[-1:]
```

```javascript theme={null}
const parts = resp?.candidates?.[0]?.content?.parts ?? [];
const images = parts.filter((p) => p.inlineData?.data);
const hasTextBetween = parts.some(
  (p, i) => p.text?.trim() && i > 0 && parts[i - 1].inlineData,
);
const results =
  images.length > 1 && hasTextBetween ? images : images.slice(-1);
```

<Warning>
  **不要写死 `parts[0]` 或 `parts[1]`**，也不要写死 `mimeType`——实测 `image/png` 和 `image/jpeg` 都出现过，落盘后缀一律以响应里的 `mimeType` 为准。详见 [usage 字段与输出解读](/api-capabilities/nano-banana-usage-metadata)。
</Warning>

## `responseModalities` 能去掉说明文字

如果你只要图、不要那几段解说，在 `generationConfig` 里传 `responseModalities: ["IMAGE"]`。同一条多变体提示词各跑 12 次：

| 配置          | 出多图   | 响应里含文本段   | 三图子集的输出 tokens |
| ----------- | ----- | --------- | -------------- |
| 默认（不传）      | 5/12  | **12/12** | 4067           |
| `["IMAGE"]` | 10/12 | **0/12**  | 3809           |

* **文本段被完全抑制（12/12 零文本段），但三张图照出。**
* 输出 tokens 少 **258（−6.3%）**，省的是实打实的整段解说文字。
* 注意：**这会让上面那条「看图之间有没有文字」的判据失效**（因为文字全没了）。如果你打算靠排列来区分中间稿，就别加这个参数。

<Note>
  对**单张出图**的普通提示词，`["IMAGE"]` 只省约 2.8%（且统计上不显著）——因为单图响应本来就很少带文本。**这个参数只在多图交替场景下有实际收益。**
</Note>

## OpenAI 兼容路径也能拿到全部图

走 `/v1/images/generations` 时，多张图会作为 `data` 数组的多个元素返回，实测 5/6 拿到 3 个元素、互不重复：

```json theme={null}
{
  "data": [
    { "b64_json": "…" },   // 变体 1
    { "b64_json": "…" },   // 变体 2
    { "b64_json": "…" }    // 变体 3
  ],
  "usage": { "completion_tokens_details": { "image_tokens": 3360 } }
}
```

<Warning>
  **OpenAI 路径会丢掉说明文字**，所以「看图之间有没有文字」这条判据在这条路径上用不了，无法区分交替生成和思考中间稿。**需要区分就走原生 `generateContent` 路径。**

  另外别只读 `data[0]`——那样会静默丢掉后面的图，而费用是按全部张数收的。
</Warning>

## 速查总结

* Nano Banana 系列**可以一次返回多张独立成品图**，实测最多 10 张，全在同一个 candidate 的 `parts` 里
* **触发靠提示词形态**：分步教程（8/8）> 分镜（7/8）> N 个变体（5/8）；单纯罗列 N 个物体不触发（0/8）
* 要几张给几张，`finishReason` 仍是 `STOP`
* **计费两种模型完全相反**：NB2 按量、张数直接乘（10 张 \$0.278）；Pro 按次固定、**多图不加价（3 张仍是 \$0.09）**
* NB2 单张 tokens：1K = 1120、2K = 1680、4K = 2520，`imageSize` 对每张都生效（**Pro 的档位换算不同**，见正文表格）
* **别无脑「取最后一张」**：图之间夹文字 = 交替生成要全取，图片连续 = 思考中间稿取最后一张
* 只要图不要文字用 `responseModalities: ["IMAGE"]`，省约 6%，但会让上面那条判据失效

## 相关文档

<CardGroup cols={2}>
  <Card title="Nano Banana 开发指南" icon="book-open" href="/api-capabilities/nano-banana-dev-guide">
    请求构造、解析加固，以及思考中间稿那一类多图的详解
  </Card>

  <Card title="usage 字段与输出解读" icon="receipt-text" href="/api-capabilities/nano-banana-usage-metadata">
    响应结构、usage 各字段含义与对账口径
  </Card>

  <Card title="Nano Banana 系列价格总览" icon="tags" href="/api-capabilities/nano-banana-pricing">
    四个型号的按次 / 按量价格明细
  </Card>

  <Card title="图片压缩与输出分辨率" icon="crop" href="/api-capabilities/image-compression-resolution">
    imageSize 与 aspectRatio 的取值与效果
  </Card>
</CardGroup>
