> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI gpt-image-2 正式上线：原生 4K + 降价 30%

> OpenAI 旗舰图像生成模型 gpt-image-2 震撼发布！原生支持 2K/4K 任意分辨率、参考图自动高保真、价格较 1.5 降低 20-30%。API易已同步上线，OpenAI SDK 零改动直连。

## 核心要点

* **🖼️ 原生 2K/4K**：单次出图最大 3840×2160（约 8.3MP），不再需要外挂超分
* **🎯 参考图自动高保真**：编辑/融合自动启用 high-fidelity，无需手动设 `input_fidelity`
* **💰 同档降价 20-30%**：相比 `gpt-image-1.5` 同尺寸 + 同画质，token 成本明显下降
* **🌏 中文提示词原生支持**：无需翻译即可获得高质量结果，文字渲染更稳
* **🔌 OpenAI SDK 零改动**：把 `base_url` 指向 `api.apiyi.com/v1` 即可直接调用
* **🛠️ 能力齐全**：文生图 / 参考图编辑 / 多图融合（最多 5 张）/ mask 局部重绘

## 背景介绍

2026 年 4 月，OpenAI 正式发布 **gpt-image-2**，作为 `gpt-image-1.5` 的旗舰升级版。这是 OpenAI 在图像生成赛道的又一次结构性提速：上一代 `gpt-image-1.5` 主打"速度提升 4 倍 + 精准编辑"，而这一代把焦点放到了**分辨率上限**与**单位成本**两个长期痛点上。

`gpt-image-2` 最直接的变化是**任意合法尺寸**——只要满足"最大边 ≤ 3840px、两边都是 16 的倍数、长短比 ≤ 3:1、总像素 0.65MP–8.3MP"四个约束，就能直接出图。这意味着 4K 横屏壁纸、1792×1024 电影画幅、3200×1800 信息图等以往需要超分后处理的尺寸，现在一次出图就能拿到。

API易团队在第一时间完成了模型接入，OpenAI 官方 SDK 仅需修改 `base_url` 即可直接调用 `gpt-image-2`，零代码改动迁移。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="🖼️ 任意分辨率（含 4K）" icon="expand">
    支持任意合法尺寸输出，预设涵盖 1K / 2K / 3840×2160 4K，自定义尺寸只需满足边长 16 倍数、比例 ≤ 3:1 等基本约束。
  </Card>

  <Card title="🎯 参考图自动高保真" icon="wand-sparkles">
    编辑场景下自动启用 high-fidelity 处理，参考图细节、人物身份、文字内容保留度大幅提升。**无需也不能**再传 `input_fidelity` 参数。
  </Card>

  <Card title="💰 同档降价 20-30%" icon="dollar-sign">
    1024×1024 高画质从 1.5 时代的 \$0.25 级别降到 \$0.211/张，2K/4K 按 token 实计但同样下行，长期使用成本明显降低。
  </Card>

  <Card title="🌏 中文 + 文字渲染" icon="type">
    中文提示词原生支持，招牌、海报、UI 截图等场景的中英文文字渲染稳定，`high` 档位下精细文字几乎不糊。
  </Card>
</CardGroup>

### 性能与规格

| 维度        | gpt-image-2                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| 输出分辨率     | 任意合法尺寸（1K/2K/4K，最大 3840×2160）                                                                                   |
| 画质档位      | `auto` / `low` / `medium` / `high`                                                                              |
| 输出格式      | `png`（默认） / `jpeg` / `webp`                                                                                     |
| 单次出图      | 1 张（`n=1`）                                                                                                      |
| 速度        | 约 120 秒（高画质 4K 接近 2 分钟）                                                                                         |
| 中文提示词     | ✅ 原生支持                                                                                                          |
| 参考图上限     | 5 张（`image[]`）                                                                                                  |
| mask 局部重绘 | ✅ 支持（要求带 alpha 通道）                                                                                              |
| 透明背景      | ❌ 发布时不支持（`background: transparent` 会报错）—— **2026-08-21 已开放**，见 [怎么生成透明背景的图片](/faq/image-transparent-background) |

### 与 gpt-image-1.5 的关键差异

| 对比项    | gpt-image-1.5        | **gpt-image-2**              |
| ------ | -------------------- | ---------------------------- |
| 最大分辨率  | 1024×1536            | **3840×2160（4K）**            |
| 自定义尺寸  | 受限的几个预设              | **任意合法尺寸**                   |
| 参考图高保真 | 需手动 `input_fidelity` | **自动启用**                     |
| 同档价格   | 基准                   | **降低 20-30%**                |
| 透明背景   | ✅ 支持                 | ❌ 发布时不支持（**2026-08-21 已开放**） |
| 出图速度   | 约 30 秒               | 约 120 秒（换更大尺寸/更高保真）          |

<Warning>
  超过 `2560×1440`（约 3.69MP）的输出目前官方标记为**实验性**，可能出现质量波动。生产环境建议优先用预设尺寸：`2048x1152` / `2048x2048` / `3840x2160` 等。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="🎬 影视 / 壁纸 / 大图" icon="film">
    一次出图直达 4K（3840×2160 / 2160×3840），适合电影海报、桌面壁纸、视频预览图、大屏物料等以往要走超分管线的场景。
  </Card>

  <Card title="🎨 IP 与角色一致性" icon="user">
    参考图自动高保真，传入角色立绘后做不同场景的二次创作，人物身份、服饰、配色保留度显著提升。
  </Card>

  <Card title="🖌️ 图像编辑 / 多图融合" icon="layers">
    最多 5 张参考图 + mask 软引导，支持"图1人物 + 图2场景 + 图3风格"这类复合编辑指令。
  </Card>

  <Card title="📰 信息图 / 长海报" icon="newspaper">
    支持 3:1 内的任意比例，1792×1024 电影画幅、3200×1800 长图、2048×1152 视频封面均可一次成图。
  </Card>
</CardGroup>

### 代码示例

#### 文生图（Python，OpenAI SDK 直连）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2",
    prompt="赛博朋克城市雨夜，霓虹招牌特写，电影画幅",
    size="2048x1152",
    quality="high",
    output_format="jpeg",
    output_compression=85
)

with open("out.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

#### 多图融合 + 高保真编辑

```python theme={null}
resp = client.images.edit(
    model="gpt-image-2",
    image=[
        open("person.png", "rb"),
        open("scene.png", "rb"),
        open("style.png", "rb"),
    ],
    prompt="把图1人物放进图2场景，沿用图3的色彩风格",
    size="1536x1024",
    quality="high"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

<Info>
  **响应格式说明**：`gpt-image-2` 返回的是**纯 base64 字符串**（无 `data:image/...;base64,` 前缀），需要客户端自行 decode 写文件，或在浏览器端拼前缀渲染。
</Info>

### 最佳实践

<Info>
  **生产环境建议**：

  * 尺寸优先选官方预设（1024×1024 / 1536×1024 / 2048×1152 / 3840×2160 等），速度和质量更稳定
  * 默认 `output_format=jpeg` + `output_compression=85`，比 PNG 快且体积小一半以上
  * 文字 / 招牌 / 海报场景锁 `quality=high`，低档位文字仍可能糊
  * 客户端超时建议 **360 秒起步**（保守值；`quality=high` + 2K/4K 实测可能 3-5 分钟，按 120 秒配会大量误超时）
  * 5xx 与超时做指数退避，最多重试 2 次；记录 `x-request-id` 便于排障
</Info>

<Warning>
  **迁移注意**：

  * 原先传了 `input_fidelity` 的代码必须**移除该参数**，新模型强制高保真，传了会报错
  * ~~原先用 `background: "transparent"` 的代码暂不可用~~ —— **2026-08-21 更新：透明背景已支持**，`background: "transparent"` 可直接沿用（`output_format` 需为 `png` 或 `webp`）
  * 单次仍只能出 1 张（`n=1`），需要多张请并发调用
</Warning>

## 价格与可用性

### 定价信息（按 token 实计，常用预设参考价）

| 画质         | 1024×1024 | 1024×1536 | 1536×1024 |
| ---------- | --------- | --------- | --------- |
| **Low**    | \$0.006   | \$0.005   | \$0.005   |
| **Medium** | \$0.053   | \$0.041   | \$0.041   |
| **High**   | \$0.211   | \$0.165   | \$0.165   |

<Info>
  **定价说明**：

  * 2K/4K 无固定每张价，按输入 + 输出 token 实计
  * 编辑场景因强制高保真，输入 token 会明显高于纯文生图
  * 流式出图（`stream: true` + `partial_images: N`）每张 partial 额外消耗 100 个输出 image token
  * 数据来源：OpenAI 官方定价（2026年4月）
</Info>

### 叠加网站充值活动

在 API易 使用 `gpt-image-2`，除享受与官网一致的按 token 计价外，还可叠加充值活动赠送额度，最高可达 8 折。详情见：

📖 充值活动说明：`docs.apiyi.com/faq/recharge-promotions`

### 与 gpt-image-2-all（官逆）的选型

| 选                       | 场景                                   |
| ----------------------- | ------------------------------------ |
| **gpt-image-2**（官方）     | 需要精确控制 size / quality、对官方契约有强依赖、要 4K |
| **gpt-image-2-all**（官逆） | 追求统一价 \$0.03/张、约 30 秒出图、参数极简         |

## 总结与建议

`gpt-image-2` 把"原生大分辨率 + 自动高保真 + 同档降价"三件事一次给齐，对**大图物料生产**和**带参考图的二创编辑**两类场景是结构性升级。

### 推荐使用场景

* ✅ **设计 / 视频团队**：直接出 4K 海报、视频封面、桌面壁纸，省掉超分后处理
* ✅ **IP / 角色一致性**：参考图自动高保真，做角色二创、不同场景延展
* ✅ **多图融合工作流**：最多 5 张参考图 + mask，复合编辑指令一次到位
* ✅ **从 1.5 平滑迁移**：删掉 `input_fidelity`，其它字段不动即可跑通（`transparent` 自 2026-08-21 起也已可用）

### 使用建议

1. **不需要 4K 时仍用 1K 预设**：1024×1024 /1536×1024 出图最快，成本最低
2. **编辑请求预算要留足**：因强制高保真，输入 token 会明显高于纯文生图
3. **超时配置 ≥ 360 秒**：`quality=high` + 2K/4K 实测可能 3-5 分钟，前端务必给进度反馈
4. **走预设尺寸更稳**：超过 2560×1440 仍属实验性，生产环境慎用

<Info>
  **信息来源与日期**：

  * OpenAI 官方文档：`developers.openai.com/api/docs/guides/image-generation`
  * API易 接入文档：`docs.apiyi.com/knowledge-base/gpt-image-2-API-for-user`
  * 数据获取日期：2026年4月23日
</Info>

***

立即体验 `gpt-image-2` 的原生 4K 出图能力，访问 API易 官网获取 API 密钥，OpenAI SDK 直接 `base_url=https://api.apiyi.com/v1` 即可调用！
