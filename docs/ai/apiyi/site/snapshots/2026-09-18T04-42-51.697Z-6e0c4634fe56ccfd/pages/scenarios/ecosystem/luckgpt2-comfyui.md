> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI 节点

> 社区贡献的 ComfyUI 节点包：三个出图节点覆盖官转 gpt-image-2 / gpt-image-2.5-flare / gpt-image-2.5-sunburst 与官逆 gpt-image-2-all / gpt-image-2-vip，外加三个提示词控制节点。2026-09-10 起支持 GPT-Image 2.5 六档画质、16 张参考图、mask 局部重绘与自定义分辨率。

## 概述

`Comfyui-Luck-gpt2.0` 是社区用户 luckdvr 贡献的 ComfyUI 自定义节点包，在 ComfyUI 中一键调用 API易 的 GPT 图像模型。当前包含 **三个出图节点** 与 **三个提示词控制节点**：

* **`Comfyui-Luck gpt-image-2`**（官转）：模型下拉可选 `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`，真正传 `size` / `quality`，支持 mask 局部重绘与最多 16 张参考图
* **`Comfyui-Luck gpt-2.0 all`**（官逆）：调用 `gpt-image-2-all`，按次计费、出图快、对话式改图
* **`Comfyui-Luck gpt-image-2-vip`**（官逆）：调用 `gpt-image-2-vip`，按次计费，Adobe 线路
* **提示词控制节点**：`GPT-Image-2 文生图提示词控制器` / `图生图提示词控制器` / `文本停留编辑器`，用多模态模型把需求整理成结构化出图提示词，并支持在工作流中途暂停手改

<Info>
  **2026-09-10 更新：支持 GPT-Image 2.5**。官转节点新增 `gpt-image-2.5-flare`（速度优先）与 `gpt-image-2.5-sunburst`（画质与编辑精度优先），`quality` 扩到六档（新增 `xhigh` / `max`）。节点名称、ID、控件顺序与默认模型 `gpt-image-2` 都没变，**已有工作流不会自动切换模型或画质**，更新插件后在 `model (模型)` 下拉里手动选即可。详见下方「GPT-Image 2.5 在节点里怎么用」。
</Info>

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 许可证：Apache-2.0
  * 👤 作者：luckdvr
  * ⭐ 该项目由社区用户贡献，专为 API易 适配；接口行为变化或节点报错请优先到仓库 Issues 反馈
</Info>

<Tip>
  **同一作者的两套节点如何区分？**

  luckdvr 为 API易 贡献了两套 ComfyUI 节点：

  * **[Luck Nano Banana Pro](/scenarios/ecosystem/lucknanobananapro-comfyui)**：调用 Gemini 系列（`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`），强调 14 张参考图与工程化超时重试
  * **Luck GPT-Image 2（本页）**：调用 OpenAI 系列（`gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2-all` / `gpt-image-2-vip`），强调真实 `size` / `quality` 控制、mask 重绘与提示词控制器
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="三节点三路线" icon="layers">
    官转 `gpt-image-2`、官逆 `gpt-2.0 all`、官逆 `gpt-image-2-vip` 各管一路，按预算与需求自由选择
  </Card>

  <Card title="GPT-Image 2.5 双子模型" icon="sparkles">
    官转节点下拉切换 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`，另提供 `-2026-09-08` 日期快照用于锁定版本
  </Card>

  <Card title="六档画质" icon="sliders-horizontal">
    `quality` 可选 auto / low / medium / high / xhigh / max，其中 `xhigh` / `max` 仅 2.5 两款接受
  </Card>

  <Card title="最多 16 张参考图" icon="images">
    官转节点 `image_01` … `image_16`；官逆两节点最多 14 张，满足多图融合与风格迁移
  </Card>

  <Card title="Mask 局部重绘" icon="eraser">
    官转节点支持可选 `mask` 输入，精准圈定重绘区域（透明区域重绘、不透明区域保留）
  </Card>

  <Card title="真实分辨率 + 自定义尺寸" icon="image">
    auto / 1K / 2K / 4K 预设 + 自定义尺寸（单边最大 3840px，像素数 65.5 万–829.4 万）
  </Card>

  <Card title="提示词控制器" icon="wand-sparkles">
    默认用 `gemini-3.5-flash` 把文字需求或最多 5 张参考图整理成结构化出图提示词，可在中途暂停手改
  </Card>

  <Card title="超时重试内建" icon="refresh-cw">
    官转节点默认 600 秒超时；`408` / `429` / `5xx` 按 `retry_times` 自动重试，应对高峰期抖动
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称                       | 模型标识                                       | 对应节点                           | 用途                          | API 文档                                             |
| -------------------------- | ------------------------------------------ | ------------------------------ | --------------------------- | -------------------------------------------------- |
| GPT-Image 2.5 Flare（官转）    | `gpt-image-2.5-flare`（快照 `-2026-09-08`）    | `Comfyui-Luck gpt-image-2`     | 速度优先的文生图，六档画质，16 参考图 + mask | [查看文档](/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2.5 Sunburst（官转） | `gpt-image-2.5-sunburst`（快照 `-2026-09-08`） | `Comfyui-Luck gpt-image-2`     | 画质与编辑精度优先，改图、多图融合首选         | [查看文档](/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2（官转）            | `gpt-image-2`                              | `Comfyui-Luck gpt-image-2`     | 上一代官转，四档画质，节点默认值            | [查看文档](/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（官逆）        | `gpt-image-2-all`                          | `Comfyui-Luck gpt-2.0 all`     | ChatGPT 网页线，按次计费，约 30–60 秒  | [查看文档](/api-capabilities/gpt-image-2-all/overview) |
| GPT-Image 2 VIP（官逆）        | `gpt-image-2-vip`                          | `Comfyui-Luck gpt-image-2-vip` | Adobe 线路，按次计费，约 90–150 秒    | [查看文档](/api-capabilities/gpt-image-2-vip/overview) |

<Info>
  三款官转模型**同价同参数**，按 token 计费；两款官逆均为 **\$0.03 / 张** 按次计费。官转与官逆的完整差异见 [gpt-image-2.5 / 2 官转 vs 官逆 对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
</Info>

## GPT-Image 2.5 在节点里怎么用

更新插件并完全重启 ComfyUI 后，在 `Comfyui-Luck gpt-image-2` 节点的 `model (模型)` 下拉框切换即可，其余控件不变。两款 2.5 都支持文生图、图片编辑、16 张参考图和 mask；节点按 `mode` 与是否接入参考图自动选择文生图或图片编辑接口。

| 模型                              | `quality` 可选值                                        | 定位                    |
| ------------------------------- | ---------------------------------------------------- | --------------------- |
| `gpt-image-2`                   | `auto` / `low` / `medium` / `high`                   | 上一代，节点默认值             |
| `gpt-image-2.5-flare`（含日期快照）    | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 速度优先，文生图默认选它          |
| `gpt-image-2.5-sunburst`（含日期快照） | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 画质与编辑精度优先，改图 / 多图融合选它 |

<Warning>
  **从 `gpt-image-2` 切到 2.5 时不要原样照搬 `quality`。** 按 API易 2026-09-09 同尺寸实测的输出 token 量，2.5 的 `high` 对应旧版 `medium`，2.5 的 `max` 才对应旧版 `high`——这是 token 预算的对应关系，不是逐像素画质相同的保证。想要与旧 `high` 同等预算的画质，2.5 要选 `max`；同预算下 2.5 的 `high` / `xhigh` 则多了两个更便宜的中间档。
</Warning>

几条节点层面的行为，写工作流前先知道：

* **不会静默降档**：旧模型 `gpt-image-2` 选了 `xhigh` / `max`，或传入无效模型 / 画质，节点会在发送请求前直接报错，不会替你换档跑
* **`auto` 建议少用**：`auto` 是动态推理档，同一条提示词的费用与耗时会在档位间漂移；要控成本就显式选档
* **生产锁日期快照**：下拉里的 `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` 用于固定模型版本，别名指向变化时不会被动跟着变
* **超时保留 600 秒**：2.5 的 `xhigh` / `max`、2K / 4K 或复杂编辑建议保留默认值，必要时调高。同步请求在客户端超时后仍可能计费，自动重试可能产生额外费用；不希望自动重试就把 `retry_times` 设为 `1`

## 节点参数

### `Comfyui-Luck gpt-image-2`（官转）

节点面板上的控件名带中文标签，如 `api_key (API密钥)`，下表只列英文字段名。

| 参数名                     | 类型     | 必填 | 默认值                | 说明                                                                                                                                        |
| ----------------------- | ------ | -- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`               | string | 是  | -                  | API易 令牌，建议单独创建带用量上限的专用 Key                                                                                                                |
| `prompt`                | string | 是  | -                  | 生成或编辑的文本指令                                                                                                                                |
| `mode`                  | enum   | 是  | `AUTO`             | `AUTO` / `text2img` / `img2img`；`AUTO` 按有无参考图自动判断                                                                                         |
| `model`                 | enum   | 是  | `gpt-image-2`      | `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` |
| `api_base`              | enum   | 是  | `api.apiyi.com/v1` | 接口域名，见「安装配置」第四步                                                                                                                           |
| `image_size`            | enum   | 是  | `2K`               | `auto (不传size)` / `1K` / `2K` / `4K` / `custom (自定义)`                                                                                     |
| `aspect_ratio`          | enum   | 是  | `16:9`             | 20 种：AUTO、1:4、4:1、1:8、8:1、1:1、1:2、2:1、1:3、3:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、9:21、21:9                                                 |
| `custom_size`           | string | 否  | `1600x1200`        | 仅 `image_size` 选 `custom` 时生效，格式 `宽x高`                                                                                                    |
| `quality`               | enum   | 是  | `auto`             | `auto` / `low` / `medium` / `high` / `xhigh` / `max`；后两档仅 2.5                                                                             |
| `output_format`         | enum   | 是  | `png`              | `png` / `jpeg` / `webp`                                                                                                                   |
| `output_compression`    | int    | 是  | 85                 | 0–100，仅对 jpeg / webp 生效                                                                                                                   |
| `seed`                  | int    | 是  | 0                  | 仅 ComfyUI 本地控制（触发重跑），**不会发给 API**                                                                                                         |
| `timeout_seconds`       | int    | 是  | 600                | 读取超时，范围 60–1800；连接超时固定 30 秒                                                                                                               |
| `retry_times`           | int    | 是  | 3                  | 范围 1–10；`408` / `429` / `5xx` 自动重试                                                                                                        |
| `image_01` … `image_16` | IMAGE  | 否  | -                  | 参考图输入，最多 16 张                                                                                                                             |
| `mask`                  | MASK   | 否  | -                  | 局部重绘蒙版，必须与 `image_01` 一起用；ComfyUI 里 mask 值为 1 的区域即重绘区                                                                                     |

`custom_size` 的四条约束：单边不超过 3840px、宽高都是 16 的倍数、长边 / 短边不超过 3:1、总像素在 655,360 到 8,294,400 之间。`1:4` / `4:1` / `1:8` / `8:1` 这几个比例超出官方 3:1 限制，节点会自动收敛到最接近的合法边界尺寸；`4K + 1:1` 用的是 `2880x2880` 而非 `3840x3840`，因为后者超总像素上限。

<Note>
  节点不发送 `background` / `moderation` / `response_format` / `input_fidelity` 这几个字段，全部走 API 默认值。需要透明背景等能力时请直接调用 API，见 [透明背景 FAQ](/faq/image-transparent-background)。
</Note>

### `Comfyui-Luck gpt-2.0 all`（官逆）

| 参数名                     | 类型     | 必填 | 默认值                | 说明                                                                                              |
| ----------------------- | ------ | -- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `api_key`               | string | 是  | -                  | API易 令牌                                                                                         |
| `prompt`                | string | 是  | -                  | 对话式生图 / 改图指令                                                                                    |
| `mode`                  | enum   | 是  | `AUTO`             | `AUTO` / `text2img` / `img2img`                                                                 |
| `model`                 | enum   | 是  | `gpt-image-2-all`  | 固定一项                                                                                            |
| `api_base`              | enum   | 是  | `api.apiyi.com/v1` | 接口域名                                                                                            |
| `endpoint`              | enum   | 是  | `images_api`       | `images_api`（`/v1/images/generations` 或 `/v1/images/edits`）/ `chat_completions`（对话式或在线 URL 参考图） |
| `aspect_ratio`          | enum   | 是  | `AUTO`             | 22 种（比官转多 `2:5` / `5:2`）。**只作为 prompt 前缀写进提示词**，不是硬尺寸控制                                         |
| `response_format`       | enum   | 是  | `url`              | `url` / `b64_json`，仅 `images_api` 端点发送                                                          |
| `seed`                  | int    | 是  | 0                  | 仅本地控制，不发给 API                                                                                   |
| `timeout_seconds`       | int    | 是  | 300                | 范围 30–1200                                                                                      |
| `retry_times`           | int    | 是  | 3                  | 范围 1–10                                                                                         |
| `image_01` … `image_14` | IMAGE  | 否  | -                  | 参考图，最多 14 张                                                                                     |

`gpt-image-2-all` 不接受 `size` / `quality` / `n` / `aspect_ratio` 这些 API 字段，节点不会发送它们；2K / 4K 只能作为 prompt 描述，无法保证输出像素。`url` 输出通常是临时 CDN 链接，约 1 天有效，需要长期保存请尽快转存。

### `Comfyui-Luck gpt-image-2-vip`（官逆）

控件与 `gpt-2.0 all` 基本一致，多两个尺寸控件：

| 参数名            | 类型   | 必填 | 默认值               | 说明                                                                                                                                                                       |
| -------------- | ---- | -- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`        | enum | 是  | `gpt-image-2-vip` | 固定一项                                                                                                                                                                     |
| `image_size`   | enum | 是  | `2K Recommended`  | `1K Fast` / `2K Recommended` / `4K Detail`，**当前只作界面提示与旧工作流兼容，节点不发送 `size`**                                                                                              |
| `aspect_ratio` | enum | 是  | `16:9`            | 10 种：1:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、21:9，只作 prompt 前缀兜底                                                                                                           |
| 其余             | -    | -  | -                 | `api_key` / `prompt` / `mode` / `api_base` / `endpoint` / `response_format` / `seed` / `timeout_seconds`（300）/ `retry_times`（3）/ `image_01` … `image_14`，同 `gpt-2.0 all` |

<Note>
  作者按 API易 2026-06-23 的「`size` 失效」公告实现了这个节点，所以默认不发送 `size`。API易 侧 `gpt-image-2-vip` 的 `size` 已于 2026-07-22 恢复（30 档常见尺寸，见 [gpt-image-2-vip 文档](/api-capabilities/gpt-image-2-vip/overview)），插件尚未跟进。当前要在 ComfyUI 里真实锁定尺寸，请用官转节点 `Comfyui-Luck gpt-image-2`。官逆 `b64_json` 带 `data:image/png;base64,` 前缀，节点会自动兼容解码。
</Note>

### 提示词控制节点

| 节点                      | 默认模型               | 作用                                                                                         |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `GPT-Image-2 文生图提示词控制器` | `gemini-3.5-flash` | 把文字需求整理成更适合 GPT-Image 系列的结构化生图提示词                                                          |
| `图生图提示词控制器`             | `gemini-3.5-flash` | 读取最多 5 张参考图（`reference_image_01` 必填，`02`–`05` 可选）和可选 `subject_image` 主体图，生成带风格、构图、版式约束的提示词 |
| `文本停留编辑器`               | -                  | 工作流执行到此暂停，手动编辑文本后点节点上的 `Continue` 继续                                                       |

* 两个控制器走 API易 `POST /v1/chat/completions`，模型下拉可选 `gemini-3.5-flash` / `gpt-5.5` / `gpt-4o` / `gpt-4.1-mini` / `gemini-2.5-flash` / `gemini-2.5-pro`
* `图生图提示词控制器` 只做图像理解与提示词增强；要真正多图参考 / 融合，同一批图还要接到后面的出图节点
* `文本停留编辑器` 的 `edited_text` 是单条字符串，接普通出图节点的 `prompt`；`edited_texts` 是列表输出，留给批量文本工作流。暂停后**点节点上的 `Continue`**，不要再点主运行按钮，否则 ComfyUI 会重新排队并重跑上游的提示词增强

## 安装配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    进入 ComfyUI 安装目录：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```

    已安装过的用户在该目录 `git pull` 即可拿到 2.5 支持。
  </Step>

  <Step title="第二步：安装依赖">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="第三步：完全重启 ComfyUI">
    在节点搜索栏输入 `Comfyui-Luck` 即可看到三个出图节点与三个提示词节点。只刷新前端不够，更新插件后必须重启进程。
  </Step>

  <Step title="第四步：配置 API易 密钥与域名">
    * 访问 [API易控制台](https://www.apiyi.com) →【令牌】新建密钥（建议配用量上限）
    * 粘贴到节点的 `api_key` 参数
    * `api_base` 三选一：`https://api.apiyi.com/v1`（主域名）/ `https://b.apiyi.com/v1`（国内备用）/ `https://vip.apiyi.com/v1`（海外直连）。节点底层兼容带或不带 `/v1` 的写法
  </Step>

  <Step title="第五步：导入示例工作流">
    仓库内有两份示例：

    * `example_workflow.json`：三个出图节点各一个示例（官转示例用 `size=2048x1152` + `quality=high` + `jpeg`），附中文 Note 说明怎么选
    * `example_workflow_gpt_image_2_5.json`：独立的 2.5 示例，Flare 文生图 → Sunburst 编辑 → 预览，默认 `1K + 1:1`、`quality=high`、超时 600 秒、`retry_times=1`

    示例里的 API Key 为空，填上即可运行；分享自己的工作流前记得清空 Key。
  </Step>
</Steps>

## 使用示例

### 示例 1：2.5 Flare 4K 高画质文生图

```
节点: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-flare
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
image_size: 4K
aspect_ratio: 2:3
quality: max
output_format: png
```

`max` 是 2.5 里与旧版 `gpt-image-2` `high` 同等 token 预算的档位；想更快更省可先用 `high` 或 `xhigh` 试。

### 示例 2：2.5 Sunburst mask 局部重绘

```
节点: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-sunburst
mode: img2img
image_01: 原始照片
mask: 要替换的区域
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
image_size: 2K
quality: high
```

### 示例 3：Flare 文生图 → Sunburst 编辑串联

对应仓库里的 `example_workflow_gpt_image_2_5.json`：

```
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-flare]
  prompt: "product shot of a matte black ceramic mug on a walnut table, soft window light"
  image_size: 1K · aspect_ratio: 1:1 · quality: high
  image ─────────────────────────────┐
                                      ▼
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-sunburst]
  mode: img2img · image_01: ← 上一节点输出
  prompt: "add a thin gold rim to the mug, keep lighting and background unchanged"
  quality: high
  image ──▶ PreviewImage
```

### 示例 4：官逆对话式出图

```
节点: Comfyui-Luck gpt-2.0 all
endpoint: images_api
aspect_ratio: 9:16
prompt: "一位穿汉服的少女站在樱花树下，水彩画风格，柔和光线"
response_format: url
timeout_seconds: 300
retry_times: 3
```

### 示例 5：提示词控制器 → 暂停手改 → 出图

```
5 张参考图
  ├─ 接到 图生图提示词控制器 reference_image_01 ~ reference_image_05
  └─ 同时接到 Comfyui-Luck gpt-image-2 image_01 ~ image_05

图生图提示词控制器 optimized_prompt
  └─ 接到 文本停留编辑器 text_list

文本停留编辑器 edited_text
  └─ 接到 Comfyui-Luck gpt-image-2 prompt（model 选 gpt-image-2.5-sunburst）
```

对最终的 `PreviewImage` / `SaveImage` 发起队列执行，流程停在 `文本停留编辑器` 时改好文本，点节点上的 `Continue` 继续。若其中一张是必须锁定的主体图，额外接到控制器的 `subject_image`，并放到出图节点的 `image_01`。

## 常见问题

<AccordionGroup>
  <Accordion title="三个出图节点如何选？">
    * **`Comfyui-Luck gpt-image-2`（官转）**：真实 `size` / `quality`、原生 mask、最多 16 张参考图、按 token 计费——有明确尺寸要求、要局部重绘或要 2.5 六档画质的工作流选它；文生图默认 `gpt-image-2.5-flare`，改图选 `gpt-image-2.5-sunburst`
    * **`Comfyui-Luck gpt-2.0 all`（官逆）**：按次计费（\$0.03 / 张）、约 30–60 秒、ChatGPT 网页线——多轮改图、文字还原要求高、不需要硬控尺寸的场景
    * **`Comfyui-Luck gpt-image-2-vip`（官逆）**：按次计费（\$0.03 / 张）、约 90–150 秒、Adobe 线路——作为官逆的第二条线路备用；插件当前不发 `size`
    * 完整差异看 [官转 vs 官逆 对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="更新插件后，已有工作流会自动切到 2.5 吗？">
    不会。节点名称、ID、控件顺序和默认模型 `gpt-image-2` 都保持不变，旧工作流加载后仍跑 `gpt-image-2` 与原来的画质。要用 2.5 请在 `model (模型)` 下拉里手动切换，并按上方对照表重新选 `quality`。
  </Accordion>

  <Accordion title="切到 2.5 后同样选 high，为什么更便宜、也更糊了？">
    2.5 重新划分了画质档位：按 API易 2026-09-09 同尺寸实测，2.5 的 `high` 输出 token 只有 `gpt-image-2` `high` 的约四分之一，对应旧版 `medium`；要拿到与旧 `high` 同等预算的画质，2.5 要选 `max`。反过来，同预算下 2.5 多了 `high` / `xhigh` 两个更便宜的中间档。上生产前用自己的提示词各跑一轮，比对 `usage.output_tokens` 再定档。
  </Accordion>

  <Accordion title="插件支持 gpt-image-2.5-all / gpt-image-2.5-vip 吗？">
    官逆两个节点的模型下拉当前只有 `gpt-image-2-all` 与 `gpt-image-2-vip`。其中 `gpt-image-2-all` 的来源 ChatGPT 网页版已整体升级到 Images 2.5，所以它现在出的就是 2.5 的图，与 `gpt-image-2.5-all` 同价同行为，见 [gpt-image-2.5-all 文档](/api-capabilities/gpt-image-2-all/overview)。`gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` 暂未进节点下拉，需要的话直接调用 API。
  </Accordion>

  <Accordion title="节点找不到？">
    1. 确认目录 `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0` 存在
    2. `pip install -r requirements.txt` 无报错
    3. 完全重启 ComfyUI（只刷新前端不够）
  </Accordion>

  <Accordion title="4K、xhigh / max 或自定义分辨率经常超时？">
    * 官转节点默认 600 秒读取超时，2.5 的 `xhigh` / `max` 与 2K / 4K 建议保留或调高；`408 Timeout` 通常是原厂生成任务超时，不是节点参数填错
    * 同步请求在客户端超时后仍可能计费，自动重试可能产生额外费用；不想自动重试把 `retry_times` 设为 `1`
    * 服务器网络慢可参考 [下载 CDN 图片/视频很慢怎么办](/faq/cdn-download-slow)
    * 默认域名不稳时切换 `api_base` 到 `b.apiyi.com/v1` / `vip.apiyi.com/v1`
  </Accordion>

  <Accordion title="加载旧工作流报 Value 3 smaller than min of 30？">
    旧工作流的 widget 顺序与当前节点不匹配，`retry_times=3` 被错读成了 `timeout_seconds=3`。使用当前仓库的 `example_workflow.json`，或删掉节点重新添加即可。
  </Accordion>

  <Accordion title="接入文本停留编辑器后，gpt-image-2 节点报 Value not in list？">
    把 `prompt` 转成输入口后，旧工作流少了一个 prompt 占位，后面的控件整体前移（例如 `mode` 被读成 `gpt-image-2`、`api_base` 被读成 `2K`）。当前版本节点会在校验阶段放行并在运行时自动恢复错位参数；若界面上仍显示错位，重载当前工作流或重新添加 `Comfyui-Luck gpt-image-2` 节点即可。
  </Accordion>

  <Accordion title="官逆节点返回的 b64_json 带前缀？">
    官逆 `gpt-image-2-all` / `gpt-image-2-vip` 的 `b64_json` 字段会带 `data:image/png;base64,` 前缀，官转 `gpt-image-2` 系列不带。三个节点都会自动兼容解码，直接接 `PreviewImage` 即可。详细说明见 [官转 vs 官逆 对比文档](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
  </Accordion>

  <Accordion title="调用返回 401 / 403？">
    1. 检查 `api_key` 是否正确，是否被分组限制误拦
    2. 所选模型是否在令牌的白名单内
    3. 余额问题参考 [为什么还有余额跑不通](/faq/balance-insufficient)
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="gpt-image-2.5 / 2（官转）文档" icon="book" href="/api-capabilities/gpt-image-2/overview">
    flare / sunburst / gpt-image-2 三款同价同参数，原生 2K/4K，按 token 计费
  </Card>

  <Card title="GPT-image-2.5 上线解读" icon="newspaper" href="/news/gpt-image-2-5-launch">
    Flare 更快、Sunburst 更准，六档画质与迁移建议
  </Card>

  <Card title="gpt-image-2-all（官逆）文档" icon="book" href="/api-capabilities/gpt-image-2-all/overview">
    ChatGPT 网页线，\$0.03 / 张按次计费
  </Card>

  <Card title="gpt-image-2-vip（官逆）文档" icon="book" href="/api-capabilities/gpt-image-2-vip/overview">
    Adobe 线路，\$0.03 / 张，支持 30 档 size
  </Card>

  <Card title="官转 vs 官逆 对比" icon="scale" href="/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    一表看清官转与官逆的差异
  </Card>

  <Card title="ComfyUI 节点合集" icon="workflow" href="/scenarios">
    查看更多 API易 适配的 ComfyUI 节点
  </Card>

  <Card title="Luck Nano Banana Pro（同作者）" icon="puzzle" href="/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr 的 Gemini 系列 ComfyUI 节点
  </Card>

  <Card title="APIYI GPT-Image 2 Skills（同模型）" icon="puzzle" href="/scenarios/ecosystem/apiyi-gpt-image-skills">
    GPT 图像模型的 AI Agent Skill 封装版本
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理密钥、用量与分组
  </Card>
</CardGroup>
