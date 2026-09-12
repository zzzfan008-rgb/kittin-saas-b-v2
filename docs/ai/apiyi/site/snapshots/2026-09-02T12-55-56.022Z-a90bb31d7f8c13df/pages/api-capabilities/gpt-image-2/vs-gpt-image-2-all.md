> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2 官转 vs 官逆 对比

> gpt-image-2（官方正式版）与官逆姐妹模型 gpt-image-2-all / gpt-image-2-vip 对比：性质、计费、端点、上传/输出格式、速度与画质定位、指令遵循等差异，帮你选对模型。

## 一句话结论

| 你需要                                                                 | 选这个                                      |
| ------------------------------------------------------------------- | ---------------------------------------- |
| **`quality` 画质参数 / mask 局部重绘 / 任意自定义尺寸（不限 30 档） / OpenAI 官方完全对齐字段** | `gpt-image-2`（官转，按量计费）                   |
| **可预测的统一价（\$0.03/张）+ 出图快（快就是优势）**                                   | `gpt-image-2-all`（官逆，ChatGPT 网页线，\~90s）  |
| **可预测的统一价 + 锁尺寸（30 档含 4K）+ 画质有时更高（不赶时间）**                           | `gpt-image-2-vip`（官逆，Codex 线，\~120–200s） |

三个模型**底层都是 OpenAI gpt-image-2**，差别在通道性质（官方直连 vs 逆向）、计费方式、参数粒度。

<Note>
  **官逆两兄弟（-all / -vip）**：本页"官逆"列同时覆盖 **`gpt-image-2-all`** 与 **`gpt-image-2-vip`**——两者**调用方式一致**（`-vip` 额外支持 `size` 字段）、同价 \$0.03/张，现在的差异是 **速度 vs 画质 + 是否锁尺寸**：

  * `gpt-image-2-all`：ChatGPT 网页线，**约 90 秒** 出图——**快就是优势**
  * `gpt-image-2-vip`：Codex 线，**约 120–200 秒** 出图，速度慢一些，但**画质有时更高**，且**支持 `size` 锁尺寸（30 档含 4K，2026-07-22 起已恢复）**
  * 共同点：均不支持 `quality`、不支持 `n`、不支持 mask 局部重绘

  需要 `quality` 画质档位、mask 局部重绘或 30 档以外的任意自定义尺寸时，走官转 `gpt-image-2`。
</Note>

<Tip>
  **关于速度**：当前 `-all` / `-vip` 出图速度**比刚上线时慢一些**，这是 **OpenAI 官方算力波动** 导致的全链路放缓——APIYI 的号池和运维侧并无问题，所有逆向通道用户都会感受到。建议把超时设置在 300 秒以上，复杂场景预留更多。
</Tip>

## 完整对比表

| 维度                   | **gpt-image-2-all / -vip**（官逆，高性价比）                                                                                                                                        | **gpt-image-2**（官转，正式版）                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **模型名**              | `gpt-image-2-all`（出图最快） / `gpt-image-2-vip`（画质优先、可锁尺寸）                                                                                                                     | `gpt-image-2`                                                                 |
| **通道性质**             | `-all`：逆向 ChatGPT 官网线路<br />`-vip`：逆向 Codex 线路                                                                                                                             | 官方直连（OpenAI Images API）                                                       |
| **计费方式**             | **按次计费**：固定 \$0.03/次（两模同价）                                                                                                                                                 | **按量计费**：按 token 实计，官网同价；本站充值加赠后约 **8.5 折**                                   |
| **典型成本/张**           | \$0.03（不区分尺寸 / 画质 / 模型）                                                                                                                                                    | 实测 **\$0.03 – \$0.2**（与提示词长度、size、quality 正相关）                                |
| **令牌分组**             | 默认分组（Default）                                                                                                                                                              | 默认分组（Default）                                                                 |
| **令牌类型**             | **按次计费** 或 **按量优先** 均可                                                                                                                                                     | **仅支持按量优先**（本模型按 token 计费，按次计费令牌不可用）                                          |
| **推荐端点**             | **`/v1/images/generations` + `/v1/images/edits`**（更稳定、上游供给更足，且同套代码兼容官转，风控异常时换 `model` 名即可切换）                                                                               | `/v1/images/generations` + `/v1/images/edits`                                 |
| **上传图片格式**           | multipart file（edits 端点）                                                                                                                                                   | multipart file（编辑接口）                                                          |
| **输出图片格式**           | `b64_json`（默认，**纯 base64 无前缀**，2026-07 实测；历史版本曾带前缀）或 `url`（R2 CDN）                                                                                                         | `b64_json`（**纯 base64，无前缀**）                                                  |
| **上传图片数（编辑）**        | 多张                                                                                                                                                                         | **最多 16 张**（`image[]`）                                                        |
| **mask 局部重绘**        | ❌ 不支持                                                                                                                                                                      | ✅ 支持（要求带 alpha 通道）                                                            |
| **指令遵循**             | 好                                                                                                                                                                          | **优秀**                                                                        |
| **生成速度**             | `-all`：约 **90 秒**（快就是优势）<br />`-vip`：约 **120–200 秒**（慢一些，但画质有时更高）<br />📌 当前比刚上线时慢——OpenAI 官方算力波动所致，非 APIYI 侧问题                                                            | 约 **100-120 秒**，复杂场景 + 4K 可达 3-5 分钟                                           |
| **画质倾向**             | `-all`：好<br />`-vip`：**有时更高**（Codex 线，细节表现偶有优势）                                                                                                                            | 稳定，且可用 `quality=high` 拉满                                                      |
| **`size` 参数**        | `-all`：❌ 不接受（写进 prompt）<br />`-vip`：✅ **已恢复**（2026-07-22 起），支持 30 档常见尺寸（含 4K）；仅 images 端点生效，chat 端点不支持                                                                     | ✅ 任意合法尺寸                                                                      |
| **`size = auto` 行为** | `-all`：— 不接受 `size` 字段<br />`-vip`：不显式传 `size` 时自适应出图，要锁尺寸请显式传 30 档之一                                                                                                      | ✅ 默认值，OpenAI 官方语义"按 prompt 智能选"；**社区实测偏向 1:1 方形（1024×1024）**，要其它比例请显式传 `size` |
| **支持 4K**            | `-all`：❌<br />`-vip`：✅ 4K Detail 档（如 `3840x2160` / `2880x2880`），不加价                                                                                                        | ✅ 含 `3840×2160`                                                               |
| **常见输出尺寸**           | `-all`：16:9 → 1672×941、9:16 → 941×1672、1:1 → 1254×1254（自适应）<br />`-vip`：30 档（10 比例 × 1K/2K/4K），见 [30 档完整对照表](/api-capabilities/gpt-image-2-vip/overview#支持的-size30-档完整对照表) | 8 个预设 + 任意合法自定义尺寸                                                             |
| **画质参数 `quality`**   | ❌ 两模均不支持（不要传）                                                                                                                                                              | ✅ `low` / `medium` / `high` / `auto`                                          |
| **`n` 参数**           | ❌ 两模均不支持（单次仅返回 1 张）                                                                                                                                                        | ✅ 支持                                                                          |
| **透明背景**             | ⚠️ 无 `background` 参数，只能在提示词里要求，偶现不稳定                                                                                                                                       | ✅ 参数控制稳定 —— `background: "transparent"` + `png` / `webp`                      |
| **中文提示词**            | ✅ 原生                                                                                                                                                                       | ✅ 原生                                                                          |
| **文字渲染**             | 高还原度                                                                                                                                                                       | 高还原度（`high` 档位最强）                                                             |
| **API 文档**           | [GPT-Image-2-All 概览](/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2-VIP 概览](/api-capabilities/gpt-image-2-vip/overview)                                        | [GPT-Image-2 概览](/api-capabilities/gpt-image-2/overview)                      |

<Info>
  🔑 **如何创建或管理令牌**：[https://api.apiyi.com/token](https://api.apiyi.com/token)\
  在控制台创建令牌时可以选择分组（`Default` 默认即可）和令牌类型（**按次计费** / **按量优先**）。**调用 `gpt-image-2`（官转）必须使用「按量优先」类型的令牌**，否则会因计费方式不匹配被拒。
</Info>

## 选型场景

### 选 `gpt-image-2-all`（官逆）的场景

<CardGroup cols={2}>
  <Card title="💰 成本可预测" icon="dollar-sign">
    单价稳定 \$0.03/张，无尺寸 / 画质阶梯，**适合大批量生产、成本必须封顶的场景**（信息图、营销物料、电商素材批量）。
  </Card>

  <Card title="⚡ 出图速度较快" icon="bolt">
    约 90 秒出图，**比 `-vip` 和官转都略快**，前端实时交互体验更好。
  </Card>

  <Card title="🔁 一套代码随时互切" icon="repeat">
    Images API 标准格式，与 `-vip` 和官转 `gpt-image-2` **同套代码**——改个 `model` 名即可互切或兜底。
  </Card>

  <Card title="🌏 中文 + 营销文字" icon="type">
    中文提示词原生友好、招牌 / 海报 / 信息图文字还原度高，**适合面向中文用户的内容生产**。
  </Card>
</CardGroup>

### 选 `gpt-image-2-vip`（官逆，画质优先）的场景

<CardGroup cols={2}>
  <Card title="🎨 画质有时更高" icon="wand-sparkles">
    Codex 线路的细节表现**偶有优于 `-all`**，适合不赶时间、想在官逆同价里多要一点画质的精品图场景。
  </Card>

  <Card title="⏱️ 用时间换质量" icon="hourglass">
    约 **120–200 秒** 出图，比 `-all` 慢——接受更长等待、追求出图上限时选它。
  </Card>

  <Card title="🖼️ 锁尺寸 / 4K" icon="expand">
    `size` 参数**已恢复**（2026-07-22 起）：支持 30 档常见尺寸（10 比例 × 1K/2K/4K），电商主图、海报模板、4K 壁纸可严格输出，统一 \$0.03/张、4K 不加价。
  </Card>

  <Card title="🔁 与 -all 共用代码" icon="copy">
    调用结构与 `-all` 一致（仅多一个 `size` 字段）——一套代码两个模型来回切，随时按速度 / 画质偏好换 `model` 名。
  </Card>
</CardGroup>

<Note>
  `-vip` 的 `size` 仅在 `/v1/images/generations` 与 `/v1/images/edits` 端点生效，**`/v1/chat/completions` 对话端点不支持 `size`**。需要 30 档以外的任意自定义尺寸、`quality` 画质档位或 mask 局部重绘时走官转 `gpt-image-2`。该参数可用性随上游变动，最新状态以 [实时动态](/live) 为准。
</Note>

### 选 `gpt-image-2`（官转）的场景

<CardGroup cols={2}>
  <Card title="🎚️ 需要画质档位" icon="sliders-horizontal">
    `quality` 支持 low/medium/high/auto。**草稿用 low 省成本，终稿 high 出印刷级效果**——这是官转独有，官逆两模都不支持。
  </Card>

  <Card title="🎯 mask 局部重绘" icon="paintbrush">
    支持 alpha 通道蒙版，**精准修改图片局部区域而保留其余部分**——官逆两模都不支持。
  </Card>

  <Card title="🖼️ 任意自定义尺寸" icon="expand">
    `size` 参数接受**任意合法尺寸**（含 4K），不限预设档位。`-vip` 只支持 30 档常见尺寸，**30 档以外的自定义尺寸走官转**。
  </Card>

  <Card title="🔌 与 OpenAI 官方一致" icon="plug">
    走官方 Images API，字段与行为完全与官方一致。**已有基于 OpenAI 官方 SDK 的代码 / 系统**可零改动迁移，长期更稳。
  </Card>
</CardGroup>

## 关键差异详解

### 1. `b64_json` 格式差异（迁移坑！）

2026-07 实测两个模型都返回**纯 base64（无 `data:` 前缀）**，但 `gpt-image-2-all` 历史版本曾直接带前缀——跨模型 / 跨版本复用代码时，统一做前缀检测最稳：

```python theme={null}
# 通用写法：先检测前缀再处理，gpt-image-2 与 gpt-image-2-all 均适用
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # 兼容曾出现过的带前缀响应
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ 写文件
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ 浏览器渲染
```

<Warning>
  从一个切到另一个时，**`b64_json` 处理代码必须改**，否则会拿到损坏的 data URL 或 decode 失败。
</Warning>

### 2. 分辨率控制方式

**gpt-image-2-all**（写在 prompt 里）：

```
"横版 16:9 电影画幅，黄昏时的海边老灯塔"   → 输出约 1672×941
"竖版 9:16 手机壁纸，赛博朋克城市雨夜"      → 输出约 941×1672
"1024×1024 方形 LOGO，极简猫咪线条"          → 输出约 1254×1254
```

**gpt-image-2-vip**（`size` 已恢复，2026-07-22 起）：

支持 **30 档常见尺寸**（10 比例 × 1K/2K/4K），请求体直接传 `size: "宽x高"`（须为 30 档之一，完整清单见 [30 档对照表](/api-capabilities/gpt-image-2-vip/overview#支持的-size30-档完整对照表)）：

```python theme={null}
client.images.generate(
    model="gpt-image-2-vip",
    prompt="...",
    size="3840x2160"    # ✅ 30 档之一，仅 images 端点生效（chat 端点不支持）
)
```

**gpt-image-2**（`size` 参数严格控制 + `quality` 档位）：

```python theme={null}
client.images.generate(
    model="gpt-image-2",
    prompt="...",
    size="2048x1152",   # ✅ 精确按此输出
    quality="high"      # 仅官转支持
)
```

### 3. 上传 / 输出格式差异

| 操作        | gpt-image-2-all                                                                           | gpt-image-2                       |
| --------- | ----------------------------------------------------------------------------------------- | --------------------------------- |
| **上传参考图** | multipart `image` 文件字段（edits 端点）                                                          | multipart `image[]` 文件字段          |
| **下载生成图** | 默认 `b64_json`（纯 base64，2026-07 实测），显式传 `response_format: "url"` 得 R2 CDN 链接（**24 小时有效期**） | `b64_json`（**纯 base64**，需 decode） |
| **多图融合**  | edits 端点 `image` 字段重复传入多张                                                                 | `image[]` 数组重复传入，**最多 16 张**      |

### 4. 价格示例（粗算）

| 场景               | gpt-image-2-all / -vip                       | gpt-image-2                 |
| ---------------- | -------------------------------------------- | --------------------------- |
| 1024×1024 草图     | \$0.03                                       | \~\$0.006（low）              |
| 1024×1024 中等画质   | \$0.03                                       | \~\$0.053（medium）           |
| 1024×1024 高画质    | \$0.03                                       | \~\$0.211（high）             |
| 2048×1152 高画质    | \$0.03                                       | \~\$0.20+（按 token 实计）       |
| 3840×2160 4K 高画质 | \$0.03（`-vip` 4K Detail 档，不加价；`-all` 不支持 4K） | 按 token 实计，**显著高于 1K**      |
| 编辑 / 多图融合        | \$0.03                                       | 输入 token 显著上升，单次成本可达 \$0.1+ |

<Info>
  **结论**：批量、低画质场景用官逆不一定省（草图 1K low 在官转上反而更便宜）；**中-高画质区段**是官逆 \$0.03 的甜点区。**需要 `quality` 档位 / mask 局部重绘 / 锁尺寸、4K / OpenAI 官方完全对齐字段** 时选官转（按量计费）。
</Info>

## 客户端调用建议

| 设置项         | gpt-image-2-all / -vip                                        | gpt-image-2                  |
| ----------- | ------------------------------------------------------------- | ---------------------------- |
| **超时（保守值）** | `-all`：**300 秒**（典型 \~90s）<br />`-vip`：**300 秒**（典型 120–200s） | **360 秒**（4K 高画质实测可达 3-5 分钟） |
| **重试策略**    | 5xx 与超时指数退避 2 次                                               | 同左                           |
| **并发**      | 单次仅返回 1 张，多张请并发                                               | 单次 1 张，需要多张请并发               |
| **请求 ID**   | `request-id` 响应头                                              | `x-request-id` 响应头           |

<Tip>
  **三个模型通用：图生图 / 多图融合时，单张输入图先压到 1.5MB 以内**（JPEG 质量 80-90 / 分辨率适当下调）。偶发的 `shell_api_error` / `Unknown error` 大多就是图片体积过大触发的，压一下请求成功率和出图速度都会明显改善。**输出分辨率与输入图体积无关**——画质看输出端配置（官转看 `size` + `quality`；`-vip` 看 `size` 档位；`-all` 看 prompt 画幅描述），不看输入端体积。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="输入图要压缩吗？提示词里写 4K / 8K 有用吗？">
    **强烈建议压**。三个模型上传给接口的图都先压到 **1.5MB 以内**（JPEG 质量 80-90 / 分辨率适当下调）：偶发的 `shell_api_error` / `Unknown error` 大多就是图片体积过大触发的，压一下请求成功率和出图速度都会明显改善。

    **别担心压输入会损画质**——输出分辨率与输入图体积无关，三个模型的"输出端"控制方式不同：

    * `gpt-image-2-all`：用 prompt 的画幅描述控制（参见 [-all 概览页的「经过验证的『提示词 → 实际分辨率』对照表」](/api-capabilities/gpt-image-2-all/overview)），prompt 光写 `4K` / `8K` 不算数
    * `gpt-image-2-vip`：用 `size` 字段控制（30 档常见尺寸，含 4K；已于 2026-07-22 恢复），prompt 光写 `4K` / `8K` 同样不算数
    * `gpt-image-2`：用 `size` + `quality` 字段控制（任意合法尺寸）

    总结：压输入只会提速，不会损画质——画质看输出端配置，不看输入端体积。
  </Accordion>

  <Accordion title="同一个 API Key 三个模型都能用吗？">
    可以。三者都走默认分组（Default），同一个 API Key 同时调用即可，无需额外配置。注意：调用 `gpt-image-2`（官转）需要「按量优先」类型的令牌；`-all` / `-vip` 两种令牌类型都能用。
  </Accordion>

  <Accordion title="官逆推荐用哪些端点？">
    **统一使用 OpenAI Images API**（`/v1/images/generations` 文生图 + `/v1/images/edits` 图片编辑），理由有二：

    1. **更稳定**：上游对 Images API 通道的资源供给更充足，调用成功率更高
    2. **兼容官转，便于切换**：与官转 `gpt-image-2` 调用方式、参数格式完全兼容——官逆通道遇到风控异常时，**只需更换 `model` 名即可切到官转**，业务代码零改动

    另有对话式端点（`/v1/chat/completions`，**不主推**），仅适合多轮迭代改图、直接传在线图片 URL 的场景；注意出图意图不够明确时可能返回纯文字而不是图片（可在提示词开头加「生成图片：」前缀强化）。详细参数见 [-all 对话式调用说明](/api-capabilities/gpt-image-2-all/chat-completions) / [-vip 对话式调用说明](/api-capabilities/gpt-image-2-vip/chat-completions)。
  </Accordion>

  <Accordion title="官逆里 -all 和 -vip 怎么挑？">
    两者都是逆向通道、同价 \$0.03/张、**调用方式一致**（`-vip` 额外支持 `size` 字段锁尺寸），差异是**速度 vs 画质 + 是否锁尺寸**：

    * **出图速度**：`-all` 约 90 秒——**快就是优势**；`-vip` 约 120–200 秒。当前比刚上线时慢，源自 OpenAI 官方算力波动
    * **画质**：`-vip`（Codex 线）细节表现**有时更高**，适合不赶时间的精品图
    * **锁尺寸**：`-vip` 支持 30 档 `size`（含 4K）；`-all` 不接受 `size`，画幅写进 prompt

    决策：追求出图速度 → `-all`；画质优先或要锁尺寸 / 4K → `-vip`；要 30 档以外的自定义尺寸、`quality` 档位或 mask → 官转 `gpt-image-2`。详见 [GPT-Image-2-VIP 概览](/api-capabilities/gpt-image-2-vip/overview)。
  </Accordion>

  <Accordion title="要锁尺寸 / 4K，现在怎么办？">
    首选 `gpt-image-2-vip`：`size` 参数已于 2026-07-22 恢复，支持 **30 档常见尺寸（10 比例 × 1K/2K/4K）**，统一 \$0.03/张、4K 不加价。注意 `size` 仅在 images 端点生效，且须为 30 档之一。

    需要 **30 档以外的任意合法尺寸**、**`quality` 档位**（low/medium/high/auto）、**mask 局部重绘**（alpha 通道蒙版）或 **OpenAI 官方完全对齐字段**（已有官方 SDK 代码零改动迁移）时，走官转 `gpt-image-2`（按量计费、按 token 实计）。
  </Accordion>

  <Accordion title="想从 1.5 迁移，应该选哪个？">
    * **沿用官方 SDK / 要求与 OpenAI 官方一致，或要 30 档以外的任意自定义尺寸**：选 `gpt-image-2`（官转），需要删掉 `input_fidelity`，其它字段不动（`background: transparent` 照常可用）
    * **想顺便降低成本，追求出图速度**：选 `gpt-image-2-all`（官逆，\~90s）
    * **想顺便降低成本，画质优先或要锁尺寸 / 4K**：选 `gpt-image-2-vip`（官逆，\~120–200s，30 档 `size` 含 4K）
  </Accordion>

  <Accordion title="可以同时部署多个做兜底吗？">
    可以。常见做法：**主用 `-all` 或 `-vip`**（成本可预测，按速度 / 画质偏好选），**兜底用 `gpt-image-2`**（需要 `quality` 档位 / mask / 30 档以外自定义尺寸时切过去）。官转和官逆两类模型响应字段不同，业务层做一次格式归一即可。
  </Accordion>

  <Accordion title="图片下载链接（R2 CDN）很慢怎么办？">
    详见 [下载 CDN 图片/视频很慢怎么办？](/faq/cdn-download-slow)
  </Accordion>
</AccordionGroup>

## 相关文档

* [GPT-Image-2 概览](/api-capabilities/gpt-image-2/overview) - 官转完整接入文档
* [GPT-Image-2-All 概览](/api-capabilities/gpt-image-2-all/overview) - 官逆 ChatGPT 网页线（出图最快）完整接入文档
* [GPT-Image-2-VIP 概览](/api-capabilities/gpt-image-2-vip/overview) - 官逆 Codex 线（画质有时更高、支持 `size` 锁尺寸）完整接入文档
* [深度解读：gpt-image-2 上线](/news/gpt-image-2-launch) - 官转上线说明
* [深度解读：gpt-image-2-all 上线](/news/gpt-image-2-all-launch) - 官逆上线说明
* [社区贡献：Luck GPT-Image 2 ComfyUI 节点](/scenarios/ecosystem/luckgpt2-comfyui) - 多模型合一的 ComfyUI 节点包
* [社区贡献：APIYI GPT-Image 2 Skills](/scenarios/ecosystem/apiyi-gpt-image-skills) - 多模型合一的 AI Agent Skill 包
* [充值优惠活动](/faq/recharge-promotions) - 充值加赠政策
