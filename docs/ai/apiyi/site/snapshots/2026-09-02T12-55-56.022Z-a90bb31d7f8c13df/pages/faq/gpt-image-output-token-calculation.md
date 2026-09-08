> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 输出 token 为什么这么高？

> 解释 GPT Image 的输入与输出 token 如何区分，以及分辨率、质量、宽高比和生成数量为什么会显著影响图片费用。

## 简短回答

这是正常现象。GPT Image 的 4K + `high` 本身就是高成本组合，即使只输出一张图片，也可能产生大量 `output_tokens`。

图片输出 token 不是按“最终文件只有一张”或“总像素数简单等比例”计算，而是主要由以下因素共同决定：

1. `quality`：`low`、`medium`、`high` 或 `auto`
2. 输出尺寸与宽高比
3. 生成数量 `n`
4. 模型内部对画布的划分和图像复杂度

<Info>
  `usage.output_tokens` 标注的是**模型生成输出图片所消耗的图像 token**，不是参考图输入。参考图消耗会单独记录在 `usage.input_tokens_details.image_tokens` 中。
</Info>

## 为什么只输出一张图也会有大量 token

“一张图片”只表示结果数量，不表示生成工作量小。模型需要在内部图像表示空间中生成整张画布，画质越高、分辨率越大，需要计算和输出的图像 token 通常越多。

例如以下两次调用都只返回一张图，但成本可能相差数倍：

```json theme={null}
{
  "size": "1024x1024",
  "quality": "low",
  "n": 1
}
```

```json theme={null}
{
  "size": "3840x2160",
  "quality": "high",
  "n": 1
}
```

第二个请求仍然只生成一张图，但使用了 4K 横版画布和高质量档位，输出 token 明显更高是预期行为。

## 四个主要影响因素

### 1. 质量参数 `quality`

`quality` 通常是最明显的成本变量：

| 参数       | 特点           | 输出 token 趋势 |
| -------- | ------------ | ----------- |
| `low`    | 快速预览、草稿      | 最低          |
| `medium` | 质量与成本平衡      | 中等          |
| `high`   | 精细纹理、文字和复杂细节 | 最高          |
| `auto`   | 模型自行选择档位     | 每次可能不同      |

<Warning>
  如果使用 `quality: "auto"` 或不传 `quality`，模型可能根据提示词自动选择不同档位。即使尺寸和参考图完全相同，不同请求的 `output_tokens` 也可能相差数倍。需要稳定预算时，请显式指定 `low`、`medium` 或 `high`。
</Warning>

项目中已有真实记录：三次请求的输入都为 1061 token，但输出分别为 1286、5146 和 1287 token。中间一次因自动选择了更高画质，费用约为其他两次的 3.5 倍。

### 2. 输出尺寸

分辨率越高，通常需要覆盖的内部画布越大，因此输出 token 越多。4K `high` 会比 1K `low` 贵很多。

但不能直接使用以下公式精确预测：

```text theme={null}
输出 token = 宽 × 高 × 固定系数
```

像素数量只能用于粗略估算。真正的 `output_tokens` 由模型在生成时返回，应以响应中的 `usage.output_tokens` 为准。

### 3. 宽高比与内部画布划分

输出 token 还受内部画布如何分块、缩放和覆盖影响。因此，token 与最终像素总数并不总是严格单调对应。

同一质量下，更大的非正方形图片有时可能比更小或更接近正方形的图片消耗更少的输出 token。这并不矛盾，而是因为模型内部使用的是离散画布或分块规则，不是简单按最终像素逐个计费。

<Tip>
  比较不同尺寸时，应该同时看 `quality` 和宽高比，不能只看“4K”“2K”标签或像素总量。
</Tip>

### 4. 生成数量 `n`

通用规则下，生成数量越多，总输出 token 越高；生成 N 张图片相当于承担 N 份输出成本。

不过，当前 `gpt-image-2` 仅支持 `n=1`。需要多张图片时，应发起多次独立请求，每次都单独计算输入和输出 token。其他图片模型是否支持 `n>1`，以对应模型文档为准。

## 参考图多会影响哪个 token

参考图数量主要增加的是**输入图片 token**，不是输出图片 token：

| 字段                                         | 代表什么           |
| ------------------------------------------ | -------------- |
| `usage.input_tokens_details.text_tokens`   | 提示词文本输入        |
| `usage.input_tokens_details.image_tokens`  | 参考图输入          |
| `usage.output_tokens_details.image_tokens` | 生成结果图片输出       |
| `usage.output_tokens`                      | 本次所有图片输出 token |

`gpt-image-2` 对参考图采用高保真处理。参考图张数会近似线性增加输入 image token，但最终输出图的 `output_tokens` 仍主要由输出质量、尺寸、宽高比和模型内部生成过程决定。

因此，如果日志明确显示高消耗位于“输出图片”，就不能归因于参考图数量。参考图费用应在输入图片 token 中单独看到。

## 如何计算真实费用

以 `gpt-image-2` 当前计费口径为例：

```text theme={null}
总费用
= 文本输入 token × 文本输入单价
+ 参考图输入 token × 图片输入单价
+ 输出图片 token × 图片输出单价
```

响应示例：

```json theme={null}
{
  "usage": {
    "input_tokens": 1040,
    "input_tokens_details": {
      "text_tokens": 16,
      "image_tokens": 1024
    },
    "output_tokens": 5146,
    "output_tokens_details": {
      "text_tokens": 0,
      "image_tokens": 5146
    },
    "total_tokens": 6186
  }
}
```

这表示：

* 16 token 来自提示词
* 1024 token 来自参考图
* 5146 token 来自最终生成图片
* 输出只有一张，但该图片采用的质量与画布需要 5146 个输出 image token

<Info>
  2K 和 4K 没有适用于所有尺寸与内容的固定每张 token 数。预算表只能用于预估，最终计费应以每次接口响应或控制台日志中的实际 `usage` 为准。
</Info>

## 如何降低 token 消耗

<Steps>
  <Step title="固定质量档位">
    不使用 `auto`，明确传入 `low`、`medium` 或 `high`，避免模型自动升档导致费用波动。
  </Step>

  <Step title="降低不必要的分辨率">
    预览或内部审核先用 1K / 2K，最终交付时再生成 4K `high`。
  </Step>

  <Step title="选择合适的宽高比">
    使用业务真正需要的画布，不要为了“看起来更高清”盲目放大尺寸。
  </Step>

  <Step title="控制生成数量">
    多张候选图会线性增加总输出成本。先小批量验证提示词，再进行批量生成。
  </Step>

  <Step title="记录 usage 字段">
    持久化每次请求的 `size`、`quality`、`output_tokens` 和费用，按实际数据建立自己的成本基线。
  </Step>
</Steps>

## 相关文档

* [GPT-Image-2 概览与计费说明](/api-capabilities/gpt-image-2/overview)
* [GPT-Image-2 文生图 API](/api-capabilities/gpt-image-2/text-to-image)
* [GPT-Image-2 图片编辑 API](/api-capabilities/gpt-image-2/image-edit)
* [如何查看调用记录？](/faq/call-logs)
