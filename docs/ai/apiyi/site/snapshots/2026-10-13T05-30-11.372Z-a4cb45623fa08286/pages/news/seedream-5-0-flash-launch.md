> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 5.0 Flash 上线：$0.018 一张图

> BytePlus 新出的快速出图模型 Seedream 5.0 Flash 已上线 API易：按次 $0.018 与官方同价，参考图不收费，实测 15–20 秒出图，中文排版准确，支持交互式编辑与透明图层分层。

## 核心要点

* **新模型已上线**：模型名 `seedream-5-0-flash-260915`，`default` / `svip` 分组可用，与其它 Seedream 型号共用 `/v1/images/generations` 端点
* **全系最便宜**：按次 **\$0.018**，与 BytePlus 官方同价；**参考图不收费**，失败请求不计费。叠加充值加赠后实际约官方的 **91 折到 83 折**
* **实测够快**：文生图 11–20 秒，带 10 张参考图编辑约 28 秒，比 5.0 Pro 的 2 分钟级快得多
* **排版与文字是强项**：实测中文海报三行文字、英日韩三语标题全部渲染正确，交互式编辑能按位置精确加元素
* **透明图层要走分层**：`layer_decomposition` 能拆出背景底图 + 多张透明图层，但**按输出张数计费**，一次十几张

## 背景介绍

Seedream 是字节跳动旗下 BytePlus 的图像生成模型系列。API易 此前已上架 5.0 Pro、5.0、4.5、4.0 四个版本，其中 5.0 Pro 画质最强，但单张约 2 分钟、\$0.12/次，更适合对画质要求极高的专业场景。

5.0 Flash 补上的是另一端：**快、便宜、适合大批量**。BytePlus 官方给它的定位是「更快的出图、更强的版面、规模化时更低的成本」，面向广告素材、编辑配图、UGC 和批量创意内容这类对速度和预算敏感的工作流。

官方同时明确了取舍：Flash 优先速度、成本和排版，**写实人像和精细材质仍推荐 5.0 Pro**。

## 详细解析

### 官方对比：Flash 与 Pro

| 维度 | 5.0 Flash | 5.0 Pro |
| - | - | - |
| 出图时间（官方） | 20 秒以内 | 20–90 秒 |
| 出图时间（API易 实测） | 11–20 秒 | 110–130 秒 |
| API易 价格 | **\$0.018/次** | \$0.12/次 |
| 预设档位 | 1K / 1.5K / 2K | 1K / 2K |
| 最大像素 | 约 462 万，长短边比 ≤ 16:1 | 约 419 万（实测） |
| 交互式编辑、分层、14 种语言 | ✅ | ✅ |
| 批量序列、流式 | ❌ | ❌ |
| 更擅长 | 排版、字体多样性、明亮色彩 | 写实与材质细节 |

官方还提到，在通用场景和平面设计任务中，Flash 减轻了部分偏灰、偏黄的色偏，与参考图的颜色更接近。

### API易 实测结论

我们在上架当天跑了约 40 次调用（2026-09-24，UTC+8），主要结论：

<CardGroup cols={2}>
  <Card title="速度稳定" icon="gauge">
    文生图 11–20 秒，精确像素最大档 `2688x1712` 约 19 秒；1 到 3 张参考图编辑约 16 秒，10 张约 28 秒
  </Card>

  <Card title="文字排版准确" icon="type">
    中文咖啡海报的标题、副标题、日期三行文字全部正确；英文、日文、韩文三语标题同样准确
  </Card>

  <Card title="交互式编辑" icon="mouse-pointer-click">
    「在右上角加一个红色 NEW 徽章」这类按位置描述的修改，只改指定区域，原图其余部分几乎不变
  </Card>

  <Card title="透明图层分层" icon="layers">
    `layer_decomposition: true` 返回 1 张补全后的背景底图 + 11 张 RGBA 透明图层，杯子、枫叶等元素抠得干净
  </Card>
</CardGroup>

### 技术规格

| 项目 | 参数 |
| - | - |
| 模型名 | `seedream-5-0-flash-260915` |
| 端点 | `POST /v1/images/generations`（生成与编辑共用） |
| 预设档位 | `1K` / `1.5K` / `2K`，不传默认 2K；`3K` / `4K` 返回 400 |
| 精确像素 | 总像素 921,600–4,624,220，长短边比 ≤ 16:1 |
| 参考图 | 最多 10 张，URL 或 data URL 均可；第 11 张返回 400 |
| 输出格式 | `png` / `jpeg`，返回 `url` 或 `b64_json` |
| 不支持 | `sequential_image_generation`、`stream`（传任何值都 400）；`n` 被静默忽略 |
| 水印 | 不传 `watermark` 时默认带「AI generated」水印 |

## 实际应用

### 推荐场景

* **电商主图与广告素材批量生成**：\$0.018/次、20 秒以内，适合一次跑几百上千张再挑选
* **海报、封面、带文字的营销图**：排版与文字渲染是这一代的强项，中文和多语种都能用
* **素材二次编辑**：交互式编辑按位置改图，分层把成品图拆成可复用的透明元素
* **不适合**：写实人像、精细材质、需要 3K / 4K 大图的场景，分别选 5.0 Pro 或 4.5 / 4.0

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-flash-260915",
    prompt="一张咖啡店秋季新品海报，大标题「秋日限定」，副标题「栗子拿铁 全场第二杯半价」，暖橙色调，杂志感排版",
    size="2K",
    response_format="url",
    extra_body={
        "watermark": False,   # 不传会带「AI generated」水印
    },
)
print(resp.data[0].url)   # 链接约 24 小时失效，请立即转存
```

编辑和多图融合把参考图 URL 放进 `extra_body` 的 `image` 数组即可，详见 [图片编辑 API](/api-capabilities/seedream-image/image-edit)。

### 最佳实践

<Warning>
  **从 5.0 或 4.x 迁移过来，先删掉两个字段**：`sequential_image_generation`（包括 `"disabled"`）和 `stream`。Flash 不支持这两个参数，传任何值都会直接返回 400。
</Warning>

* **要固定比例就传精确像素**：预设档位下宽高比由模型按画面内容决定，实测 2K 出过 1776×2368、1664×2496 等竖版；需要 16:9 横图请直接传 `2560x1440` 这类尺寸
* **显式传 `watermark: false`**：Flash 默认带水印，商用素材务必关掉
* **透明素材走分层，不要靠提示词**：在提示词里要求透明背景，返回的 png 没有 alpha 通道，背景只是画出来的棋盘格
* **分层按张计费，用 1K 跑**：一次分层实测返回 12 张、扣 \$0.216；1K 约 78 秒；2K 实测 15 分钟都没拿到结果，但照常扣了 \$0.216，务必用 1K，客户端超时建议 300 秒以上
* **超时 60 秒起步**：单张 20 秒以内，但多参考图或用 data URL 上传大图时会更慢（实测一次 data URL 编辑约 54 秒）

## 价格与可用性

### 定价信息

| 项目 | 价格 |
| - | - |
| 每次出图（1 张） | **\$0.018**，与 BytePlus 官方同价 |
| 输入参考图 | 免费（实测 1 / 3 / 10 张参考图均扣 \$0.018） |
| 参数错误等失败请求 | 不计费 |
| 分层 `layer_decomposition` | 按输出张数计，一次常见十几张 |

与同系列对比：5.0 Flash \$0.018/次，5.0 为 \$0.035/张，4.5 为 \$0.04/张，5.0 Pro 为 \$0.12/次。

可用分组：`default`、`svip`。

### 叠加网站充值活动

充值可叠加阶梯加赠，Flash 的实际到手价约为官方的 91 折到 83 折，详见 [充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Seedream 5.0 Flash 把 Seedream 系列的入门价拉到了 \$0.018 一张，同时保住了这个系列最被认可的中文排版能力。实测速度稳定在 20 秒以内，参考图不额外收费，对批量生产电商图、营销海报的团队来说，是目前性价比最高的 Seedream 型号。

建议把它作为日常批量出图的默认选择；遇到写实人像、材质细节要求高的图，再切到 5.0 Pro；需要 3K / 4K 大图时用 4.5 或 4.0。接入时记住三件事：删掉 `sequential_image_generation` 和 `stream`、显式关水印、透明素材走分层并按张预算。

更多参数与版本差异见 [Seedream 总览](/api-capabilities/seedream-image/overview) 和 [历史版本对比](/api-capabilities/seedream-image/historical-versions)。

<Info>
  信息来源：BytePlus 官方 Seedream 5.0 Flash 介绍资料、BytePlus ModelArk 图像生成 API 文档 `docs.byteplus.com/en/docs/ModelArk/1541523`；实测数据为 API易 2026 年 9 月 24 日 (UTC+8) 上架测试结果。公开网络上的第三方评测暂未覆盖该模型。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.