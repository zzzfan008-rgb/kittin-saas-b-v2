> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 2 Coze 插件

> 社区贡献的 Coze 平台 Python 插件，通过 API易 封装 GPT Image 2 调用、错误识别与 OSS 上传链路，让 Coze 工作流即可完成文生图、图生图与结果直传。

## 概述

这是一个面向 Coze 平台（`coze.cn`） 的自定义 Python 插件，通过 **API易** 代理平台把 OpenAI 的 GPT Image 2 模型（`gpt-image-2`）封装成 Coze 工作流可直接调用的节点。插件内置完整的请求构造、错误码识别、内容安全过滤判定与阿里云 OSS 上传链路，**返回的是可直接展示的公网 URL**，省去你在 Coze 工作流里再做一次结果转发的工作。

<Info>
  **项目信息**

  * 📦 形态：代码包形式分享（**未公开在 GitHub**）
  * 👤 作者：社区贡献
  * 🎯 适用平台：Coze 国内版 / 海外版自定义插件
  * 🔌 调用模型：`gpt-image-2`（API易，2026 年 4 月 21 日发布）
  * 🌐 代理平台：[API易](https://api.apiyi.com) — 国内直连，无需科学上网
  * 📝 完整代码已在下方"插件完整源码"章节提供，可直接复制使用
</Info>

## 关于 API易 代理平台

[API易](https://api.apiyi.com) 是 GPT Image 2 的国内代理平台，提供三条线路共用一套 API Key：

| 域名              | 说明     |
| --------------- | ------ |
| `api.apiyi.com` | 默认线路   |
| `vip.apiyi.com` | VIP 线路 |
| `b.apiyi.com`   | 备用线路   |

API易 提供三种 GPT Image 2 模型接入方式：

| 模型标识              | 渠道             | 计费         | 出图速度    | 特点                                |
| ----------------- | -------------- | ---------- | ------- | --------------------------------- |
| `gpt-image-2`     | 官转（官方转发）       | 按 token 计费 | \~120s  | 完全兼容 OpenAI 官方，支持 quality/size/4K |
| `gpt-image-2-all` | 官逆（逆向 ChatGPT） | \$0.03/张   | 30-60s  | 中文友好，通过 Chat 接口调用，图片 URL 直出       |
| `gpt-image-2-vip` | 官逆（逆向 Codex）   | \$0.03/张   | 90-150s | 30 档 size 锁定，含 4K                 |

> 本插件默认使用 **`gpt-image-2`（官转版）**，与 OpenAI 官方 API 完全兼容，支持完整的参数控制。如果需要更快速的出图体验，可切换到 `gpt-image-2-all` 模式（见后文）。

<Tip>
  在 [API易 控制台](https://api.apiyi.com/token) 申请 API Key（以 `sk-` 开头），建议设置每日额度限制（如 ¥20-50）以控制成本。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="文生图 / 图生图统一入口" icon="wand-sparkles">
    根据 fileurls 是否为空，自动切换文生图（/v1/images/generations）与改图（/v1/images/edits）模式，无需在 Coze 工作流里写两套节点
  </Card>

  <Card title="国内直连，无需科学上网" icon="bolt">
    全部请求走 API易 代理（api.apiyi.com），国内网络环境直连，延迟低、稳定可靠
  </Card>

  <Card title="多张参考图改图" icon="images">
    传入图片 URL 列表后自动下载并以 multipart/form-data 文件上传方式注入请求，最多支持 16 张参考图（单张 ≤ 50MB），保留原图细节
  </Card>

  <Card title="精细化错误识别" icon="shield-check">
    区分 MODERATION\_BLOCKED、INVALID\_API\_KEY、RATE\_LIMIT、SERVER\_ERROR、TIMEOUT、NO\_DATA 等多种失败原因，便于工作流分支处理
  </Card>

  <Card title="内容安全两阶段判定" icon="ban">
    区分输入阶段 moderation\_blocked（400）与输出阶段 content\_filter（200），触发时返回明确的拒绝文案，避免无效重试
  </Card>

  <Card title="OSS 直传" icon="cloud-upload">
    生成的 base64 图片直接上传阿里云 OSS，工作流拿到的是可直接外发或入库的 URL
  </Card>

  <Card title="多参数精细控制" icon="sliders-horizontal">
    支持 quality（low/medium/high/auto）、moderation（auto/low）、output\_format（png/jpeg/webp）等参数，按需调控出图策略
  </Card>
</CardGroup>

## 支持的模型

| 模型名称                | 模型标识              | 用途                         | API 文档                                                     |
| ------------------- | ----------------- | -------------------------- | ---------------------------------------------------------- |
| GPT Image 2（官转）     | `gpt-image-2`     | 文生图、图生图（编辑），完全兼容 OpenAI 官方 | [查看文档](/api-capabilities/gpt-image-2/overview)             |
| GPT Image 2-All（官逆） | `gpt-image-2-all` | 文生图、图生图，Chat 接口，中文友好       | [查看文档](/api-capabilities/gpt-image-2-all/chat-completions) |
| GPT Image 2-VIP（官逆） | `gpt-image-2-vip` | 锁尺寸出图，支持 30 档尺寸含 4K        | [查看文档](/api-capabilities/gpt-image-2-vip/overview)         |

<Tip>
  插件默认使用 `gpt-image-2`（官转版），端点为 `https://api.apiyi.com/v1/images/generations`（文生图）与 `https://api.apiyi.com/v1/images/edits`（图生图），需要有效的 API易 API Key（以 `sk-` 开头）。如需切换线路，可将代码中的 `API_BASE` 改为 `https://vip.apiyi.com/v1` 或 `https://b.apiyi.com/v1`。
</Tip>

## GPT Image 2 关键特性

| 特性                  | 说明                                                    |
| ------------------- | ----------------------------------------------------- |
| **发布日**             | 2026 年 4 月 21 日                                       |
| **最大分辨率**           | 3840×2160（4K），总像素 ≤ 8,294,400                         |
| **宽高比**             | 1:1 / 16:9 / 9:16 / 4:3 / 3:2 / 3:1 / 1:3             |
| **质量等级**            | low / medium / high / auto（默认）                        |
| **输出格式**            | png（默认）/ jpeg / webp                                  |
| **输出压缩**            | 0-100（仅 jpeg / webp 生效）                               |
| **背景模式**            | auto / opaque / transparent（模型已支持透明背景，**本插件暂未开放该入参**） |
| **审核强度**            | auto（默认）/ low                                         |
| **文字渲染**            | 准确率 > 99%                                             |
| **生成数量**            | 1 张（`n` 仅支持 1）                                        |
| **响应格式**            | b64\_json（纯 base64，无 data:image 前缀）                   |
| **input\_fidelity** | 已锁定为 high，**不可传入**（传了会 400 报错）                        |

## API 端点

| 端点                                            | 方法   | Content-Type          | 用途                                      |
| --------------------------------------------- | ---- | --------------------- | --------------------------------------- |
| `https://api.apiyi.com/v1/images/generations` | POST | `application/json`    | 文生图（纯文字 prompt 出图）                      |
| `https://api.apiyi.com/v1/images/edits`       | POST | `multipart/form-data` | 图生图（`-F "image[]=@file"` 上传参考图，最多 16 张） |

> 如需切换线路：`https://vip.apiyi.com/v1/...` 或 `https://b.apiyi.com/v1/...`。所有线路功能相同。

## 插件架构

<img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-architecture.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=50eb8b0eafa03c71cb5a6863af7b872a" alt="GPT Image 2 Coze 插件架构图" width="1840" height="2100" data-path="images/coze-gptimage2-architecture.png" />

插件核心调用链：

```text theme={null}
Coze 工作流入参 (cleantext / fileurls / aspect_ratio / resolution / quality / apikey)
        ↓
    handler() 入口
        ↓
    判断是否有参考图 (fileurls)
        ↓            ↓
   文生图分支     图生图分支
    ↓            ↓
 POST api.apiyi.com/v1/images/generations   POST api.apiyi.com/v1/images/edits
   (application/json)                         (multipart/form-data)
    ↓            ↓
   解析响应 / 兜底错误码
        ↓
upload_base64_to_oss()  — 上传阿里云 OSS
        ↓
返回 { analysis, url, error }
```

## 分辨率与尺寸参考

插件根据 `aspect_ratio` 和 `resolution` 自动选择尺寸（基于 API易 官方预设）：

| 宽高比  | 1K（尺寸 / 像素）      | 2K（尺寸 / 像素）      | 4K（尺寸 / 像素）      |
| ---- | ---------------- | ---------------- | ---------------- |
| 1:1  | 1024×1024 ≈ 1.0M | 2048×2048 ≈ 4.2M | 3840×2160 ≈ 8.3M |
| 16:9 | 1536×1024 ≈ 1.6M | 2048×1152 ≈ 2.4M | 3840×2160 ≈ 8.3M |
| 9:16 | 1024×1536 ≈ 1.6M | 1152×2048 ≈ 2.4M | 2160×3840 ≈ 8.3M |
| 4:3  | 1024×768 ≈ 0.8M  | 2048×1536 ≈ 3.1M | 3264×2448 ≈ 8.0M |
| 3:2  | 1536×1024 ≈ 1.6M | 2048×1360 ≈ 2.8M | 3456×2304 ≈ 8.0M |
| 3:1  | 1536×512 ≈ 0.8M  | 3072×1024 ≈ 3.1M | 3840×1280 ≈ 4.9M |
| 1:3  | 512×1536 ≈ 0.8M  | 1024×3072 ≈ 3.1M | 1280×3840 ≈ 4.9M |

> **约束规则**：所有尺寸边长可被 16 整除、宽高比 ≤ 3:1、总像素 ≤ 8,294,400。
>
> **注意**：1:1 在 4K 下输出为 3840×2160（横版 16:9），不是正方形——这是 API 限制，此时实际宽高比为 16:9。超过 `2560×1440` 的输出仍属实验性，生产环境推荐优先使用预设尺寸。

## 输入输出参数

### 入参（`Input`）

| 参数              | 类型        | 必填 | 默认     | 说明                                                                   |
| --------------- | --------- | -- | ------ | -------------------------------------------------------------------- |
| `cleantext`     | string    | 是  | —      | 用户文字提示词或编辑指令（最长 32,000 字符）                                           |
| `fileurls`      | string\[] | 否  | —      | 参考图 URL 列表，留空走文生图                                                    |
| `aspect_ratio`  | string    | 是  | —      | 宽高比，如 `1:1`、`16:9`、`9:16`                                            |
| `resolution`    | string    | 是  | —      | 分辨率，必须大写：`1K` / `2K` / `4K`                                          |
| `quality`       | string    | 否  | `auto` | 质量等级：`low` / `medium` / `high` / `auto`                              |
| `moderation`    | string    | 否  | `auto` | 审核强度：`auto` / `low`（低强度审核）                                           |
| `output_format` | string    | 否  | `png`  | 输出格式：`png` / `jpeg` / `webp`                                         |
| `apikey`        | string    | 是  | —      | API易 API Key（以 `sk-` 开头，在 [API易控制台](https://api.apiyi.com/token) 申请） |

### 出参（`Output`）

| 字段         | 类型             | 说明                       |
| ---------- | -------------- | ------------------------ |
| `analysis` | string         | 状态文案：`图片生成成功` / `图片生成失败` |
| `url`      | string \| null | 成功时返回 OSS 公网链接           |
| `error`    | string \| null | 失败时返回友好错误描述              |

## 部署步骤

<Steps>
  <Step title="第一步：准备 API易 API Key 与 OSS 凭证">
    * 在 [API易 控制台](https://api.apiyi.com/token) 申请 API Key（以 `sk-` 开头），建议设置每日额度限制（如 ¥20-50）
    * 在阿里云开通 OSS Bucket，并创建一个 RAM 子账号，授予该 Bucket 的 `oss:PutObject` 权限
    * 记录 `AccessKey ID`、`AccessKey Secret`、`Bucket 名称`、`Endpoint`（如 `oss-cn-beijing.aliyuncs.com`）
  </Step>

  <Step title="第二步：在 Coze 插件市场中搜索并安装插件">
    1. 进入 Coze 工作台 → 插件 → 插件市场
    2. 在搜索框中搜索「GPT Image 2」或「API易」找到此插件
    3. 点击插件卡片查看详情，确认无误后点击「添加」安装到当前工作空间

           <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-plugin-market.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=58d8111524c893c61aae7c52f4fb68db" alt="Coze 插件市场搜索" width="1450" height="738" data-path="images/coze-gptimage2-plugin-market.png" />
  </Step>

  <Step title="第三步：复制插件代码">
    将下方"插件完整源码"章节的 Python 代码完整粘贴到 Coze IDE 中，并把代码顶部的阿里云 OSS 配置改成你自己的：

    ```python theme={null}
    # API易 线路配置（可选）
    API_BASE = "https://api.apiyi.com/v1"
    # 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

    # 阿里云 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名称"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="第四步：配置元数据与入参出参">
    按下图配置 Input / Output 字段类型与必填项，与代码中的 `args.input` 字段保持一致：

    输入参数配置：

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-basic-info.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=f06e617314b795c936cb5605a28746d0" alt="Coze 插件基本信息" width="1611" height="458" data-path="images/coze-gptimage2-basic-info.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-input-params.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=410d34cca5c9aa191df0add21a51a848" alt="Coze 插件输入参数配置" width="1617" height="505" data-path="images/coze-gptimage2-input-params.png" />

    输出参数配置：

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-1.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=c590fca7d3196326aebddb3a7dbdefda" alt="Coze 插件输出参数配置（上）" width="1606" height="695" data-path="images/coze-gptimage2-output-params-1.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-2.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=5546f08b19320ba2f6332555eef8f3c2" alt="Coze 插件输出参数配置（下）" width="1577" height="373" data-path="images/coze-gptimage2-output-params-2.png" />
  </Step>

  <Step title="第五步：测试与发布">
    * 在 Coze IDE 内填入测试参数（建议先用 `quality=low` + `resolution=1K` + 简单 prompt 验证 API易 链路）
    * 测试通过后点击「发布」即可在工作流中拖拽使用
  </Step>
</Steps>

## 错误码识别策略

插件不只判断 `success=True/False`，还会按以下顺序识别失败原因，便于在 Coze 工作流里做差异化处理：

| 优先级 | 错误类型                    | 触发条件                     | 推荐处理                              |
| --- | ----------------------- | ------------------------ | --------------------------------- |
| 1   | `MODERATION_BLOCKED`    | HTTP 400 / 403，内容安全拦截    | 提示词或图片触发审核，改写后重试，**不要用原输入重试**     |
| 2   | `INVALID_API_KEY`       | HTTP 401                 | 检查 API易 API Key 是否正确或已过期          |
| 3   | `RATE_LIMIT`            | HTTP 429                 | 请求频率超限，可尝试切换线路或降低并发               |
| 4   | `SERVER_ERROR`          | HTTP 500 / 502 / 503     | API易 / OpenAI 服务端故障，退避重试 2-3 次    |
| 5   | `BAD_REQUEST`           | HTTP 400（非 moderation 类） | 检查参数：尺寸是否合规、是否误传了 input\_fidelity |
| 6   | `TIMEOUT`               | 请求超过 quality 对应超时        | 降低 quality 或 resolution 重试        |
| 7   | `NO_DATA`               | 响应中 `data` 为空            | 重试                                |
| 8   | `NO_IMAGE_DATA`         | `b64_json` 字段为空          | 重试                                |
| 9   | `IMAGE_DOWNLOAD_FAILED` | 参考图 URL 无法下载             | 检查 URL 可访问性                       |
| 10  | `EDIT_FAILED`           | 图生图端点返回非 200             | 检查参考图格式、数量（≤16张）、单张大小（≤50MB）      |

### 两阶段内容过滤

GPT Image 2 采用**两阶段内容安全过滤**，与 Nano Banana Pro 不同：

```text theme={null}
用户请求
    ↓
【阶段 1: 输入过滤 Input Filter】
    ├── 被拦 → HTTP 400 / 403（moderation_blocked）
    │          ↑ 改写 prompt 可解（免费，不计费）
    ├── 通过 ↓
【模型推理生成图片】（此时已计费）
    ↓
【阶段 2: 输出过滤 Output Filter】
    ├── 被拦 → HTTP 200 但 b64_json 为空（content_filter，已计费）
    ├── 通过 ↓
返回图片 (HTTP 200)
```

| 维度      | moderation\_blocked | content\_filter |
| ------- | ------------------- | --------------- |
| 触发阶段    | 输入阶段                | 输出阶段            |
| HTTP 状态 | 400                 | 200             |
| 是否计费    | 否                   | **是**（推理已完成）    |
| 修复方向    | 改写 prompt 用词        | 重新设计整个场景        |

### 常见 moderation\_blocked 触发场景

| # | 场景             | 说明                 |
| - | -------------- | ------------------ |
| 1 | 真实人物肖像 / 名人姓名  | 马斯克、Taylor Swift 等 |
| 2 | 在世艺术家姓名        | 宫崎骏 = 拦，梵高 = 不拦    |
| 3 | 版权角色 / IP      | 蜘蛛侠、皮卡丘、米老鼠等       |
| 4 | 暴力 / 血腥 / 武器细节 | 自动拦截               |
| 5 | 性暗示 / 暴露服装     | 比基尼、紧身、性感等描述词      |
| 6 | 儿童写实图像         | 近零容忍               |
| 7 | 仇恨符号 / 极端政治    | 自动拦截               |

### API易 特有错误

| 错误                      | 原因                    | 解决                            |
| ----------------------- | --------------------- | ----------------------------- |
| 401 + `invalid_api_key` | Key 缺少 `sk-` 前缀或已过期   | 完整复制 API易 控制台中的 Key           |
| 404 Not Found           | base\_url 漏掉 `/v1` 后缀 | 确保 `https://api.apiyi.com/v1` |
| 429 + 频繁触发              | 触发 API易 限流            | 切换线路重试                        |
| 连接超时                    | DNS / 网络波动            | 尝试其他线路重试                      |

## 各分辨率/质量预计耗时

| 分辨率            | 质量     | 预计耗时      | 插件超时  |
| -------------- | ------ | --------- | ----- |
| 1K (1024×1024) | low    | 3-8 秒     | 180 秒 |
| 1K (1024×1024) | medium | 20-40 秒   | 360 秒 |
| 1K (1024×1024) | high   | 145-280 秒 | 900 秒 |
| 2K (2048×2048) | medium | 80-120 秒  | 360 秒 |
| 2K (2048×2048) | high   | 200-250 秒 | 900 秒 |
| 4K (3840×2160) | medium | 150-200 秒 | 360 秒 |
| 4K (3840×2160) | high   | 300-600 秒 | 900 秒 |

> 建议：日常使用 `resolution=1K + quality=medium`（20-40 秒出图），最终交付用 `resolution=4K + quality=high`。
>
> `quality=auto`（不传或传 auto）时，插件超时统一按 360 秒处理，API 自行决定实际质量等级。

## 插件完整源码

下面是 `coze-gptimage2.py` 的完整代码，可以直接复制到 Coze IDE。**只需修改顶部 OSS 配置**即可投入使用。

```python coze-gptimage2.py theme={null}
from runtime import Args
from typings.gptimage2.gptimage2 import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re


# ╔══════════════════════════════════════════════════════════╗
# ║           API易 线路配置（按需切换）                      ║
# ╚══════════════════════════════════════════════════════════╝
API_BASE = "https://api.apiyi.com/v1"
# 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

# ╔══════════════════════════════════════════════════════════╗
# ║              阿里云 OSS 配置（请修改为你的值）            ║
# ╚══════════════════════════════════════════════════════════╝
ACCESS_KEY_ID = ""          # 填入你的阿里云 Access Key ID
ACCESS_KEY_SECRET = ""      # 填入你的阿里云 Access Key Secret
BUCKET_NAME = ""            # 填入你的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com"  # 填入你的 OSS Endpoint

# ╔══════════════════════════════════════════════════════════╗
# ║       质量超时配置（GPT Image 2 基于 quality 分级）       ║
# ╚══════════════════════════════════════════════════════════╝
TIMEOUT = {
    "low": 180,     # 低质量快速出图（3-8 秒实际耗时）
    "medium": 360,  # 中等质量（20-40 秒实际耗时，推荐）
    "high": 900,    # 高质量精细渲染（145-280 秒实际耗时）
}

# ╔══════════════════════════════════════════════════════════╗
# ║     分辨率 → 尺寸映射表（宽高比 × 分辨率 → W×H）          ║
# ╚══════════════════════════════════════════════════════════╝
RESOLUTION_SIZES = {
    "1:1":  {"1K": "1024x1024", "2K": "2048x2048", "4K": "3840x2160"},
    "16:9": {"1K": "1536x1024", "2K": "2048x1152", "4K": "3840x2160"},
    "9:16": {"1K": "1024x1536", "2K": "1152x2048", "4K": "2160x3840"},
    "4:3":  {"1K": "1024x768",  "2K": "2048x1536", "4K": "3264x2448"},
    "3:2":  {"1K": "1536x1024", "2K": "2048x1360", "4K": "3456x2304"},
    "3:1":  {"1K": "1536x512",  "2K": "3072x1024", "4K": "3840x1280"},
    "1:3":  {"1K": "512x1536",  "2K": "1024x3072", "4K": "1280x3840"},
}


# ==============================
# OSS 上传工具
# ==============================

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回公网 URL
    支持带 data:image/...;base64, 前缀和纯 base64 两种情况
    """
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/gptimage2_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"


# ==============================
# 工具函数
# ==============================

def get_size(aspect_ratio: str, resolution: str) -> str:
    """根据宽高比和分辨率获取推荐尺寸"""
    ratio_map = RESOLUTION_SIZES.get(aspect_ratio, RESOLUTION_SIZES["1:1"])
    return ratio_map.get(resolution, ratio_map.get("1K", "1024x1024"))


def guess_mime_from_url(url: str) -> str:
    """根据 URL 后缀猜测 MIME 类型"""
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    return "image/png"


# ==============================
# 核心：GPT Image 2 生图 / 编辑
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str,
                   quality: str, apikey: str, output_format: str = "png",
                   moderation: str = "auto", image_urls=None):
    """
    GPT Image 2 文生图 / 图生图核心函数

    - image_urls 为空：纯文生图 → API易 /v1/images/generations（JSON）
    - image_urls 不为空：参考图编辑 → API易 /v1/images/edits（multipart/form-data）
    """

    size = get_size(aspect_ratio, resolution)
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # ── 分支 1：有参考图 → 图生图（编辑） ──
    if image_urls:
        return _generate_edit(prompt, size, quality, apikey,
                              output_format, moderation, image_urls, headers)

    # ── 分支 2：无参考图 → 文生图（/v1/images/generations，JSON）──
    payload = {
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": size,
    }
    if quality and quality != "auto":
        payload["quality"] = quality
    if output_format and output_format != "png":
        payload["output_format"] = output_format
    if moderation and moderation != "auto":
        payload["moderation"] = moderation

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/generations"

    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=timeout_seconds
        )

        # ── HTTP 错误分发 ──
        if response.status_code in (400, 403):
            try:
                err_body = response.json()
                err = err_body.get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text

            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过\n"
                             "您的提示词触发了内容安全策略，"
                             "请修改提示词后重试（不要用原提示词重试）",
                }
            return {
                "success": False,
                "errorType": "BAD_REQUEST",
                "error": f"❌ 请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity，或 background:transparent 配了 output_format:jpeg",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效\n请检查您的 API易 API 密钥是否正确，"
                        "或是否已过期。可在 https://api.apiyi.com/token 查看",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限\nAPI 调用过于频繁，"
                        "可尝试切换线路或降低并发",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}），"
                        "请稍后重试或尝试切换线路",
            }

        if response.status_code != 200:
            return {
                "success": False,
                "errorType": "HTTP_ERROR",
                "error": f"HTTP {response.status_code}: "
                        f"{(response.text or '')[:500]}",
            }

        # ── JSON 解析 ──
        try:
            data = response.json()
        except ValueError:
            return {
                "success": False,
                "errorType": "INVALID_JSON",
                "error": "响应不是有效 JSON",
            }

        images = data.get("data", [])
        if not isinstance(images, list) or len(images) == 0:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "生成失败：未返回图片数据（可能触发了 output filter）",
                "response": data,
            }

        # ── 提取 b64_json（API易 返回纯 base64，无 data:image 前缀）──
        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "生成失败：b64_json 为空（可能被 content_filter 过滤）",
                "response": data,
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片生成请求超时"
                     f"（超过 {timeout_seconds} 秒，"
                     f"当前 quality={quality}）\n"
                     f"建议降低 quality 或 resolution 重试",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片生成请求失败: {str(e)}",
        }


def _generate_edit(prompt: str, size: str, quality: str,
                   apikey: str, output_format: str, moderation: str,
                   image_urls: list, headers: dict):
    """
    GPT Image 2 图生图（编辑）子函数
    调用 API易 /v1/images/edits 端点（multipart/form-data 方式上传参考图）

    注意：API易 的 /v1/images/edits 要求 Content-Type: multipart/form-data，
    通过 -F "image[]=@file" 方式传图，不支持 JSON base64 data URI。
    参考图数量最多 16 张，单张 ≤ 50MB（建议压到 1.5MB 以内）。
    """

    # ── 下载参考图到内存 ──
    image_files = []
    for i, url in enumerate(image_urls):
        try:
            resp = requests.get(url, timeout=180)
            if resp.status_code != 200:
                return {
                    "success": False,
                    "errorType": "IMAGE_DOWNLOAD_FAILED",
                    "error": f"图片获取失败（{url}）HTTP {resp.status_code}",
                }
            mime = guess_mime_from_url(url)
            ext = mime.split("/")[-1]  # png / jpeg / webp
            if ext == "jpeg":
                ext = "jpg"
            image_files.append(
                ("image[]", (f"image{i}.{ext}", io.BytesIO(resp.content), mime))
            )
        except Exception as e:
            return {
                "success": False,
                "errorType": "IMAGE_DOWNLOAD_FAILED",
                "error": f"图片获取失败（{url}）: {e}",
            }

    # ── 构造 multipart/form-data 请求（-F 方式）──
    form_data = {
        "model": "gpt-image-2",
        "prompt": prompt,
    }
    if size:
        form_data["size"] = size
    if quality and quality != "auto":
        form_data["quality"] = quality
    if output_format and output_format != "png":
        form_data["output_format"] = output_format
    if moderation and moderation != "auto":
        form_data["moderation"] = moderation

    # multipart/form-data 不传 Content-Type（让 requests 自动生成 boundary）
    auth_headers = {
        "Authorization": headers["Authorization"],
    }

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/edits"

    try:
        response = requests.post(
            api_url,
            headers=auth_headers,
            data=form_data,
            files=image_files,
            timeout=timeout_seconds
        )

        # ── 错误处理 ──
        if response.status_code in (400, 403):
            try:
                err = response.json().get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text[:500]
            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过",
                }
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity、"
                         "超过 16 张参考图或单张超过 50MB",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限，可尝试切换线路重试",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}）",
            }

        if response.status_code != 200:
            try:
                err = response.json().get("error", {}).get("message", "")
            except Exception:
                err = response.text[:500]
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑失败（HTTP {response.status_code}）: {err}",
            }

        # ── 提取图片（b64_json 是纯 base64，无前缀）──
        data = response.json()
        images = data.get("data", [])
        if not images:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "编辑结果为空",
            }

        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "编辑结果图片数据为空",
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片编辑请求超时（超过 {timeout_seconds} 秒）",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片编辑请求失败: {str(e)}",
        }


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / GPT Image 2（API易 代理）节点入口

    - args.input.cleantext:    用户文字提示词
    - args.input.fileurls:     参考图 URL 列表（用于图生图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "16:9" / "9:16"
    - args.input.resolution:   分辨率，如 "1K" / "2K" / "4K"
    - args.input.quality:      质量等级，如 "low" / "medium" / "high"（默认 auto）
    - args.input.moderation:   审核强度，如 "auto" / "low"（默认 auto）
    - args.input.output_format: 输出格式，如 "png" / "jpeg" / "webp"（默认 png）
    - args.input.apikey:       API易 API Key（sk-开头）
    """
    API_KEY = args.input.apikey
    cleantext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspect_ratio = args.input.aspect_ratio or "1:1"
    resolution = args.input.resolution or "1K"
    quality = getattr(args.input, 'quality', None) or "auto"
    output_format = getattr(args.input, 'output_format', None) or "png"
    moderation = getattr(args.input, 'moderation', None) or "auto"

    prompt = cleantext.strip()
    if not prompt:
        prompt = "根据参考图片进行合理的编辑与优化。"

    # 调用 GPT Image 2 生图 / 编辑
    result = generate_image(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        quality=quality,
        apikey=API_KEY,
        output_format=output_format,
        moderation=moderation,
        image_urls=fileurls if fileurls else None
    )

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {
            "analysis": "图片生成成功",
            "url": oss_url,
            "error": None,
        }
    else:
        return {
            "analysis": "图片生成失败",
            "url": None,
            "error": result.get("error", "未知错误"),
        }
```

## 可选：gpt-image-2-all 快速模式

如果你需要**更快的出图速度（30-60s）且不关心尺寸参数控制**，可以将插件切换为 API易 的 `gpt-image-2-all`（官逆版），通过 Chat Completions 端点调用。该模式价格为 \$0.03/张，图片 URL 直出无需解析 base64。

核心改动（替换 `generate_image` 函数即可）：

```python theme={null}
def generate_image_chat(prompt: str, apikey: str, image_urls=None):
    """
    gpt-image-2-all 快速模式（通过 API易 Chat Completions 端点）
    价格 $0.03/张，出图 30-60s，尺寸由 prompt 描述驱动
    """
    api_url = f"{API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # 构造消息
    if image_urls:
        # 图生图：多模态 message
        content = [{"type": "text", "text": prompt}]
        for url in image_urls:
            content.append({
                "type": "image_url",
                "image_url": {"url": url}
            })
    else:
        # 文生图：纯文本 message
        content = prompt

    payload = {
        "model": "gpt-image-2-all",
        "messages": [{"role": "user", "content": content}],
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=300)
        if response.status_code != 200:
            err = response.json().get("error", {}).get("message", response.text)
            return {"success": False, "errorType": "API_ERROR", "error": str(err)[:500]}

        data = response.json()
        content_text = data["choices"][0]["message"]["content"]

        # 从 Markdown ![image](url) 中提取图片 URL
        match = re.search(r'!\[[^\]]*\]\((.*?)\)', content_text)
        if not match:
            return {"success": False, "errorType": "NO_URL", "error": "未从响应中提取到图片 URL"}

        image_url = match.group(1)

        # 如果是 base64 data URL，直接使用
        if image_url.startswith("data:image/"):
            return {"success": True, "image_data": image_url.split(",", 1)[1]}

        # 如果是 HTTP URL，下载图片 → 转 base64
        img_resp = requests.get(image_url, timeout=60)
        if img_resp.status_code != 200:
            return {"success": False, "errorType": "DOWNLOAD_FAILED", "error": f"下载图片失败: HTTP {img_resp.status_code}"}

        image_b64 = base64.b64encode(img_resp.content).decode("utf-8")
        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {"success": False, "errorType": "TIMEOUT", "error": "请求超时"}
    except Exception as e:
        return {"success": False, "errorType": "EXCEPTION", "error": str(e)}
```

> 切换方法：将 `handler()` 中的 `generate_image(...)` 替换为 `generate_image_chat(...)`，入参只需 `prompt`、`apikey`、`fileurls`（可选）。

## 在 Coze 工作流中使用

插件发布后，在 Coze 工作流编辑器里拖入插件节点，按以下方式连线：

```text theme={null}
开始节点 (用户输入提示词 + 图片)
    ↓
图片提示词分离 (代码节点，将用户消息拆分为 cleantext 和 fileurls)
    ↓
人员 apikey 分发 (字典查询，按用户匹配对应的 API易 API Key)
    ↓
gptimage2 插件节点 (本插件)
    ↓
成功 / 失败分支
    ↓
结束节点 (输出 url 或 error)
```

<Tip>
  推荐配合 [飞书多维表格 AI 生图方案](/scenarios/ecosystem/feishu-bitable-image-shortcut) 使用，整套方案让运营/设计同学**在飞书表格里填提示词就能批量出图**，无需打开任何代码。只需将方案中的 Nano Banana Pro 插件替换为本插件即可。
</Tip>

## 与 Nano Banana Pro 的差异对比

| 维度    | Nano Banana Pro（API易）                         | GPT Image 2（API易）                           |
| ----- | --------------------------------------------- | ------------------------------------------- |
| 模型    | `gemini-3-pro-image-preview`                  | `gpt-image-2`                               |
| 代理平台  | API易（同一平台，同一 Key）                             | API易（同一平台，同一 Key）                           |
| 文生图接口 | Gemini `generateContent`（JSON）                | `/v1/images/generations`（JSON）              |
| 图生图接口 | 同一端点 + inline\_data（JSON）                     | `/v1/images/edits`（**multipart/form-data**） |
| 分辨率体系 | 1K / 2K / 4K（固定）                              | 灵活分辨率（最大 3840×2160）                         |
| 超时策略  | 按分辨率（360s / 600s / 1200s）                     | 按质量（180s / 360s / 900s）                     |
| 内容过滤  | 单阶段（ZERO\_CANDIDATES\_TOKEN + TEXT\_RESPONSE） | 两阶段（HTTP 400/403 + content\_filter）         |
| 参考图数量 | 不限（inline\_data）                              | 最多 16 张                                     |
| 透明背景  | ✅ 支持                                          | ✅ 模型支持（本插件未开放入参）                            |
| 文字渲染  | 良好                                            | 优秀（>99%）                                    |
| 输出压缩  | 不支持                                           | ✅ 支持 jpeg/webp 压缩                           |
| 审核控制  | 不支持                                           | ✅ moderation 参数（auto/low）                   |

## 常见问题

<AccordionGroup>
  <Accordion title="完整源码在哪里？可以直接复制吗？">
    可以。本文档「插件完整源码」章节提供了 `coze-gptimage2.py` 的完整代码，**只需修改顶部 OSS 配置和 API\_BASE** 就能直接粘贴到 Coze IDE 投入使用，无需额外索取。

    如果你还需要：

    * 飞书字段捷径代码 → 见 [飞书多维表格 AI 生图方案](/scenarios/ecosystem/feishu-bitable-image-shortcut) 中的「飞书字段捷径完整源码」章节
    * Nano Banana Pro 插件 → 见 [Nano Banana Pro Coze 插件](/scenarios/ecosystem/coze-nanobanana-plugin)
  </Accordion>

  <Accordion title="apikey 为什么要从入参传入而不是写死？">
    便于按用户分发不同 API易 API Key。在 Coze 工作流中可以前置一个「人员 apikey 分发」字典节点，按调用人姓名匹配对应的 API Key，方便用量核算与权限控制。
  </Accordion>

  <Accordion title="API易 API Key 和 OpenAI 官方 Key 有什么区别？">
    API易 是国内代理平台，API Key 格式同样以 `sk-` 开头，但：

    * 国内直连，无需科学上网
    * 在 [API易控制台](https://api.apiyi.com/token) 申请和管理
    * 支持 daily/monthly 额度限制，方便成本控制
    * 一个 Key 同时支持 Nano Banana Pro 和 GPT Image 2
  </Accordion>

  <Accordion title="三条线路有什么区别？">
    三条线路功能完全相同，任意一条均可使用，共用同一套 API Key：

    | 域名              | 说明     |
    | --------------- | ------ |
    | `api.apiyi.com` | 默认线路   |
    | `vip.apiyi.com` | VIP 线路 |
    | `b.apiyi.com`   | 备用线路   |

    在代码中修改 `API_BASE` 变量即可切换。
  </Accordion>

  <Accordion title="为什么不直接返回 base64，而要多走一步 OSS？">
    Coze 工作流后续节点（特别是飞书字段捷径）大多需要 **可访问的 URL** 才能转换为图片附件。直接返回 base64 会让数据在工作流里反复传输，不仅性能差，飞书侧还无法直接渲染。OSS 链接还方便长期归档与对外分享。
  </Accordion>

  <Accordion title="错误返回 MODERATION_BLOCKED 怎么处理？">
    这表示输入的 prompt 或参考图触发了内容安全过滤。这个错误**不需要重试**——重试结果一致。建议：

    1. 改写 prompt 用词
    2. 避免真实人物姓名、版权角色名称、在世艺术家姓名
    3. 避免性暗示、暴力、血腥等敏感描述
  </Accordion>

  <Accordion title="返回 NO_IMAGE_DATA 或 NO_DATA 怎么排查？">
    这通常意味着模型完成了推理（已计费），但输出被内容安全过滤器拦截（`content_filter`）。建议：

    1. 重新设计整个视觉场景而非微调措辞
    2. 换一个完全不同的 prompt 方向
    3. 降低 quality 有时可绕过更严格的输出过滤
  </Accordion>

  <Accordion title="high 质量经常超时？">
    GPT Image 2 的 high 质量在 1K 下就需要 145-280 秒，4K 可能超过 600 秒。插件已为 high 质量配置了 900 秒超时。如果仍然超时，建议：

    1. 先用 `quality=medium` 调试 prompt
    2. 在 API易 控制台检查是否有限流
    3. 可尝试切换线路重试
    4. 减少同时调用并发数
    5. 考虑使用 `gpt-image-2-all` 模式（30-60s 出图）
  </Accordion>

  <Accordion title="支持透明背景吗？">
    **模型支持，但本插件目前没有开放这个入参。** `gpt-image-2` 自 2026-08-21 起支持 `background: "transparent"`，直接调 API 就能拿到带 alpha 通道的透明底图，见 [怎么生成透明背景的图片](/faq/image-transparent-background)。

    在插件里要透明背景，目前有两条路：一是自行修改插件源码，在请求体里加上 `"background": "transparent"`（同时确保 `output_format` 是 `png` 或 `webp`）；二是改用 [Nano Banana Pro 插件](/scenarios/ecosystem/coze-nanobanana-plugin)。
  </Accordion>

  <Accordion title="支持 thinking 推理深度参数吗？">
    **不支持。** API易 官转版 gpt-image-2 的参数列表与 OpenAI 官方不完全一致，`thinking` 参数不在 API易 支持的参数中。如需精细控制出图质量，请使用 `quality` 参数（low / medium / high / auto）替代。

    其他不支持的参数还包括：

    * `response_format` — 响应固定返回 `b64_json`
    * `n` — 固定为 1
    * `background: "transparent"` — **模型已支持**，但本插件未开放该入参，需自行改源码传入
    * `input_fidelity` — 已锁定为 high，**传了会 400 报错**
  </Accordion>

  <Accordion title="GPT Image 2 和 Nano Banana Pro 应该选哪个？">
    两个插件都使用 **同一个 API易 平台**，一个 API Key 通用。选择建议：

    | 场景                | 推荐                                       |
    | ----------------- | ---------------------------------------- |
    | 文字渲染要求高（海报、封面、UI） | GPT Image 2（文字准确率 > 99%）                 |
    | 需要 4K 超高清         | GPT Image 2（最大 3840×2160）                |
    | 需要多张参考图编辑         | GPT Image 2（最多 16 张）                     |
    | 需要输出压缩（减小文件体积）    | GPT Image 2（支持 jpeg / webp 压缩）           |
    | 需要透明背景            | 两者皆可（GPT Image 2 需自行改插件源码传 `background`） |
    | 预算敏感              | GPT Image 2-All（\$0.03/张）                |
    | 需要中文友好 prompt     | GPT Image 2-All（官逆版）                     |
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="飞书多维表格 AI 生图方案" icon="table" href="/scenarios/ecosystem/feishu-bitable-image-shortcut">
    本插件的最佳搭档：把整条 Coze 工作流接入飞书多维表格，运营同学填表即可批量出图
  </Card>

  <Card title="Nano Banana Pro Coze 插件" icon="banana" href="/scenarios/ecosystem/coze-nanobanana-plugin">
    另一套 Coze 生图方案，基于 Gemini 3 Pro Image，与 GPT Image 2 共用同一个 API易 Key
  </Card>

  <Card title="API易 GPT Image 2 文档" icon="book" href="/api-capabilities/gpt-image-2/overview">
    API易 官转版 GPT Image 2 完整文档、参数说明与代码示例
  </Card>

  <Card title="API易 GPT Image 2-All 文档" icon="code" href="/api-capabilities/gpt-image-2-all/chat-completions">
    API易 官逆版 Chat Completions 端点文档（\$0.03/张，30-60s 出图）
  </Card>

  <Card title="API易 控制台" icon="settings" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量与余额、设置额度限制
  </Card>

  <Card title="GPT Image 2 常见错误修复" icon="circle-question-mark" href="https://help.apiyi.com/fix-gpt-image-2-moderation-blocked-400-error.html">
    moderation\_blocked 400 错误诊断与规避策略
  </Card>
</CardGroup>
