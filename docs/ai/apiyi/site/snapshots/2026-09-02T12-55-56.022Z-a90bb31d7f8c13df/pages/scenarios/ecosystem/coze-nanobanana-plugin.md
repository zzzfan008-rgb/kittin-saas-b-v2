> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Coze 插件

> 社区贡献的 Coze 平台 Python 插件，封装 Nano Banana Pro（Gemini 3 Pro Image）调用、错误识别与 OSS 上链路，让 Coze 工作流即可完成文生图、图生图与结果直传。

## 概述

这是一个面向 [Coze 平台](https://www.coze.cn) 的自定义 Python 插件，把 API易 的 Nano Banana Pro 模型（`gemini-3-pro-image-preview`）封装成 Coze 工作流可直接调用的节点。插件内置完整的请求构造、错误码识别、违规内容判定与阿里云 OSS 上传链路，**返回的是可直接展示的公网 URL**，省去你在 Coze 工作流里再做一次结果转发的工作。

<Info>
  **项目信息**

  * 📦 形态：代码包形式分享（**未公开在 GitHub**）
  * 👤 作者：Shuaila1996
  * 🎯 适用平台：Coze 国内版 / 海外版自定义插件
  * 🔌 调用模型：`gemini-3-pro-image-preview`（API易）
  * 📝 完整代码已在下方"插件完整源码"章节提供，可直接复制使用
</Info>

## 核心功能

<CardGroup cols={2}>
  <Card title="文生图 / 图生图统一入口" icon="wand-sparkles">
    根据 `fileurls` 是否为空，自动切换文生图与改图模式，无需在 Coze 工作流里写两套节点
  </Card>

  <Card title="多张参考图改图" icon="images">
    传入图片 URL 列表后自动下载并以 `inline_data` 方式注入请求，保留原图细节
  </Card>

  <Card title="精细化错误识别" icon="shield-check">
    区分 `ZERO_CANDIDATES_TOKEN`、`FINISH_REASON`、`INLINE_DATA_EMPTY`、`TEXT_RESPONSE` 等多种失败原因，便于工作流分支处理
  </Card>

  <Card title="违规内容自动归类" icon="ban">
    遇到水印移除、换脸、色情、超出知识库年限等任务时，返回明确的拒绝类型而非让用户自行猜测
  </Card>

  <Card title="OSS 直传" icon="cloud-upload">
    生成的 base64 图片直接上传阿里云 OSS，工作流拿到的是可直接外发或入库的 URL
  </Card>

  <Card title="分辨率超时自适应" icon="hourglass">
    1K / 2K / 4K 各自配置独立超时（360s / 600s / 1200s），4K 高清场景也不会被中断
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称            | 模型标识                         | 用途      | API 文档                                      |
| --------------- | ---------------------------- | ------- | ------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 文生图、图生图 | [查看文档](/api-capabilities/nano-banana-image) |

<Tip>
  插件调用的是 API易 的 `https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent` 端点（Gemini 原生协议），与官方 Google AI Studio 完全一致，便于复用现成 prompt。
</Tip>

## 插件架构

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=7052279e4466fdab5319e94e6a2592fc" alt="Coze 插件配置示意" width="2550" height="1244" data-path="images/community/coze-feishu/coze-plugin-config.png" />

插件核心调用链：

```text theme={null}
Coze 工作流入参 (cleantext / fileurls / aspect_ratio / resolution / apikey)
        ↓
    handler() 入口
        ↓
generate_image()  — 构造 parts + 调用 API易 端点
        ↓
   解析候选项 / 兜底错误码
        ↓
upload_base64_to_oss()  — 上传阿里云 OSS
        ↓
返回 { analysis, url, error }
```

## 输入输出参数

### 入参（`Input`）

| 参数             | 类型        | 必填 | 说明                              |
| -------------- | --------- | -- | ------------------------------- |
| `cleantext`    | string    | 是  | 用户文字提示词或编辑指令                    |
| `fileurls`     | string\[] | 否  | 参考图 URL 列表，留空走文生图               |
| `aspect_ratio` | string    | 是  | 宽高比，如 `1:1`、`16:9`、`9:16`       |
| `resolution`   | string    | 是  | 分辨率，必须大写：`1K` / `2K` / `4K`     |
| `apikey`       | string    | 是  | API易 密钥（建议在 Coze 工作流上游分发，按用户分配） |

### 出参（`Output`）

| 字段         | 类型             | 说明                       |
| ---------- | -------------- | ------------------------ |
| `analysis` | string         | 状态文案：`图片生成成功` / `图片生成失败` |
| `url`      | string \| null | 成功时返回 OSS 公网链接           |
| `error`    | string \| null | 失败时返回友好错误描述              |

## 部署步骤

<Steps>
  <Step title="第一步：准备 API易 与 OSS 凭证">
    * 在 [API易控制台](https://api.apiyi.com/token) 申请密钥（以 `sk-` 开头）
    * 在阿里云开通 OSS Bucket，并创建一个 RAM 子账号，授予该 Bucket 的 `oss:PutObject` 权限
    * 记录 `AccessKey ID`、`AccessKey Secret`、`Bucket 名称`、`Endpoint`（如 `oss-cn-beijing.aliyuncs.com`）
  </Step>

  <Step title="第二步：在 Coze 创建自定义插件">
    1. 进入 Coze 工作台 → 资源库 → 创建自定义插件
    2. 运行模式选择「云侧插件 - 在 Coze IDE 中创建」
    3. 工具运行环境选择 **Python**
    4. 添加依赖包：`requests`、`oss2`
  </Step>

  <Step title="第三步：复制插件代码">
    将下方"插件完整源码"章节的 Python 代码完整粘贴到 Coze IDE 中，并把代码顶部的阿里云 OSS 配置改成你自己的：

    ```python theme={null}
    # 阿里云 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名称"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="第四步：配置元数据与入参出参">
    按下图配置 Input / Output 字段类型与必填项，与代码中的 `args.input` 字段保持一致：

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-metadata.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=991fd5bb9fba689f2629b122b274f088" alt="Coze 插件元数据配置" width="2478" height="1114" data-path="images/community/coze-feishu/coze-plugin-metadata.png" />
  </Step>

  <Step title="第五步：测试与发布">
    * 在 Coze IDE 内填入测试参数（建议先用 1K + 简单 prompt 验证 OSS 链路）
    * 测试通过后点击「发布」即可在工作流中拖拽使用
  </Step>
</Steps>

## 错误码识别策略

插件不只判断 `success=True/False`，还会按以下顺序识别失败原因，便于在 Coze 工作流里做差异化处理：

| 优先级 | 错误类型                    | 触发条件                                      | 推荐处理                                  |
| --- | ----------------------- | ----------------------------------------- | ------------------------------------- |
| 1   | `ZERO_CANDIDATES_TOKEN` | `usageMetadata.candidatesTokenCount == 0` | 提示词或图片触发审核，建议改写                       |
| 2   | `NO_CANDIDATES`         | `candidates` 为空                           | 系统出错，重试                               |
| 3   | `FINISH_REASON`         | `finishReason` 非 `STOP`                   | 按 `PROHIBITED_CONTENT` / `SAFETY` 等映射 |
| 4   | `NO_PARTS`              | `content.parts` 为空                        | 重试                                    |
| 5   | `INLINE_DATA_EMPTY`     | 检测到 `inlineData` 但 `data` 为空              | 重试或换 prompt                           |
| 6   | `TEXT_RESPONSE`         | 只返回了文本说明                                  | 自动归类为水印/换脸/色情/年限超出                    |

## 插件完整源码

下面是 `coze-nanobanana-pro.py` 的完整代码，可以直接复制到 Coze IDE。**只需修改顶部 4 行 OSS 配置**即可投入使用。

```python coze-nanobanana-pro.py theme={null}
from runtime import Args
from typings.nanobanana_apiyi.nanobanana_apiyi import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re
from datetime import datetime



# 阿里云 OSS 配置
ACCESS_KEY_ID = ""  #填入自己的阿里云 Access Key ID
ACCESS_KEY_SECRET = "" #填入自己的阿里云 Access Key Secret
BUCKET_NAME = "" #填入自己的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com" #填入自己的阿里云 OSS Endpoint，例如 "oss-cn-beijing.aliyuncs.com"

# 分辨率超时时间
TIMEOUT = {
    "1K": 360,  # 快速预览
    "2K": 600,  # 推荐使用
    "4K": 1200,  # 超高清
}

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回链接
    支持带 data:image/...;base64, 前缀 和 纯 base64 两种情况
    """
    # 去掉 data:image/...;base64, 前缀
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/generated_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"

# ==============================
# 工具函数：根据 URL 猜测 MIME 类型
# ==============================

def guess_mime_from_url(url: str) -> str:
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    # 默认
    return "image/png"

# ==============================
# 核心：生成 / 编辑图片
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str, apikey:str,apiurl:str,image_urls=None):
    """
    生成 / 编辑图片的核心函数

    - 如果 image_urls 为空：纯文生图
    - 如果 image_urls 不为空：把 URL 指向的图片下载下来，按 inline_data 方式传给 API，实现改图
    """

    # 组装 parts
    parts = []

    # 1. 如果有图片 URL，则按 apiyi 改图 demo 的方式构造 inline_data
    if image_urls:
        for url in image_urls:
            try:
                resp = requests.get(url, timeout=180)
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "error": f"图片上传阶段，获取图片失败（{url}）HTTP {resp.status_code}"
                    }

                image_bytes = resp.content
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                mime_type = guess_mime_from_url(url)

                parts.append({
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": image_base64
                    }
                })
            except Exception as e:
                return {
                    "success": False,
                    "error": f"图片上传阶段，获取图片失败（{url}）: {e}"
                }

    # 2. 文字部分（编辑指令或文生图提示词）
    #    注意：这里不再把图片 URL 塞进 prompt 里，仅用纯文字描述
    if prompt:
        parts.append({"text": prompt})
    else:
        # 没有文字时给一个默认提示（可按需要修改）
        parts.append({"text": "根据图片进行合理的编辑生成。"})

    # 3. 构造请求 payload（和官方改图 demo 一致的结构）
    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "image_size": resolution
            }
        }
    }

    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(apiurl, headers=headers, json=payload, timeout=TIMEOUT[resolution])

        # HTTP 非200
        if response.status_code != 200:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}

        # JSON 解析
        try:
            data = response.json()
        except ValueError:
            return {"success": False, "error": "响应不是有效JSON", "response": (response.text or "")[:500]}

        # 1️⃣ 最高优先级：candidatesTokenCount
        usage = data.get("usageMetadata") or {}
        if usage.get("candidatesTokenCount") == 0:
            return {
                "success": False,
                "errorType": "ZERO_CANDIDATES_TOKEN",
                "error": "❌ 内容审核失败\n您的请求在内容审核阶段被拒绝，请修改提示词或图片",
                "response": data
            }

        # 2️⃣ candidates 检查
        candidates = data.get("candidates")
        if not isinstance(candidates, list) or len(candidates) == 0:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试",
                "response": data
            }

        candidate = candidates[0] if isinstance(candidates[0], dict) else None
        if candidate is None:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试（candidates[0]结构异常）",
                "response": data
            }

        # 3️⃣ finishReason
        finish_reason = candidate.get("finishReason")
        if isinstance(finish_reason, str) and finish_reason != "STOP":
            reason_map = {
                "PROHIBITED_CONTENT": "内容违反安全策略，已被拒绝处理",
                "SAFETY": "内容触发了安全过滤器",
                "RECITATION": "内容可能涉及版权问题",
                "MAX_TOKENS": "内容长度超出限制",
            }
            return {
                "success": False,
                "errorType": "FINISH_REASON",
                "finishReason": finish_reason,
                "error": reason_map.get(finish_reason, f"请求被拒绝：{finish_reason}"),
                "response": data
            }

        # 4️⃣ content.parts
        content = candidate.get("content") or {}
        parts = content.get("parts")
        if not isinstance(parts, list) or len(parts) == 0:
            return {
                "success": False,
                "errorType": "NO_PARTS",
                "error": "生成失败，请重试（content.parts为空）",
                "response": data
            }

        # 5️⃣ 提取图片和文本（更精准：识别 inlineData 存在但 data 为空）
        images = []
        texts = []
        saw_inline_but_empty = False

        for i, part in enumerate(parts):
            if not isinstance(part, dict):
                continue

            # 收集 text（即使有 thoughtSignature，也照收）
            t = part.get("text")
            if isinstance(t, str) and t.strip() and not t.startswith("data:image/"):
                texts.append(t.strip())

            # 兼容 inlineData / inline_data
            inline = None
            if isinstance(part.get("inlineData"), dict):
                inline = part["inlineData"]
            elif isinstance(part.get("inline_data"), dict):
                inline = part["inline_data"]

            if inline is not None:
                b64 = inline.get("data")
                if not isinstance(b64, str) or not b64.strip():
                    saw_inline_but_empty = True
                    continue
                images.append(b64.strip())

        # ✅ 更精准：inlineData 存在但全都没 data
        if not images and saw_inline_but_empty:
            return {
                "success": False,
                "errorType": "INLINE_DATA_EMPTY",
                "error": "生成失败：检测到 inlineData 但图片数据为空（inlineData.data为空）",
                "response": data
            }

        # 6️⃣ 有图片：成功（保持你原来的返回结构）
        if images:
            return {"success": True, "image_data": images[0]}

        # 7️⃣ 无图片：有文本 -> TEXT_RESPONSE
        if texts:
            text_content = "\n".join(texts)

            # —— 可选：不做函数，直接就地识别类型（想更简单可删掉这段 detectedType）——
            low = text_content.lower()
            detected = "general"
            if any(k in low for k in ["watermark", "remove watermark", "去水印", "移除水印", "删除水印"]):
                detected = "拒绝处理水印任务"
            elif any(k in low for k in ["faceswap", "face swap", "换脸", "deepfake"]):
                detected = "拒绝处理换脸任务"
            elif any(k in low for k in ["sexually", "explicit", "porn", "nude", "nsfw", "色情", "不雅", "裸"]):
                detected = "拒绝色情任务"
            elif any(str(y) in low for y in range(2026, 2101)):
                detected = "拒绝超过知识库范围任务"

            return {
                "success": False,
                "errorType": "TEXT_RESPONSE",
                "error": detected,   # 你文档要求：直接展示 API text
                "response": data
            }

        # ✅ 更精准：parts 有结构但既无图也无文本
        return {
            "success": False,
            "error": "生成失败：parts存在但未找到图片数据或文本说明",
            "response": data
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": f"图片生成请求超时（超过 {TIMEOUT[resolution]} 秒）"}
    except Exception as e:
        return {"success": False, "error": f"图片生成请求失败: {str(e)}"}


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / NanobananaPro 节点入口

    - args.input.cleantext: 用户文字提示词
    - args.input.fileurls:  用户上传图片的 URL 列表（用于改图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "9:16"
    - args.input.resolution: 分辨率，如 "1K" / "2K" / "4K"
    """
    API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"
    API_KEY = args.input.apikey
    cleanttext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspectratio = args.input.aspect_ratio
    resolution = args.input.resolution
    # - 图片通过 image_urls 传入 generate_image，走 inline_data 改图逻辑
    prompt = cleanttext.strip()

    # 调用 Gemini 3 Pro 生成 / 编辑图片
    # 如果 fileurls 不为空，会按"改图"模式调用

    result = generate_image(prompt, aspectratio, resolution, API_KEY,API_URL,image_urls=fileurls if fileurls else None)

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {"analysis": "图片生成成功", "url": oss_url, "error": None}
    else:
        return {"analysis": "图片生成失败", "url": None, "error": result["error"]}
```

## 在 Coze 工作流中使用

插件发布后，在 Coze 工作流编辑器里拖入插件节点，按以下方式连线：

```text theme={null}
开始节点 (用户输入提示词 + 图片)
    ↓
图片提示词分离 (代码节点)
    ↓
人员 apikey 分离 (字典查询，按用户分发 API易 密钥)
    ↓
nanobanana_apiyi 插件节点 (本插件)
    ↓
成功 / 失败分支
    ↓
结束节点 (输出 url 或 error)
```

<Tip>
  推荐配合 [飞书多维表格 AI 生图方案](/scenarios/ecosystem/feishu-bitable-image-shortcut) 使用，整套方案让运营/设计同学**在飞书表格里填提示词就能批量出图**，无需打开任何代码。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么不直接返回 base64，而要多走一步 OSS？">
    Coze 工作流后续节点（特别是飞书字段捷径）大多需要 **可访问的 URL** 才能转换为图片附件。直接返回 base64 会让数据在工作流里反复传输，不仅性能差，飞书侧还无法直接渲染。OSS 链接还方便长期归档与对外分享。
  </Accordion>

  <Accordion title="OSS 配置可以用环境变量吗？">
    Coze 自定义插件目前不支持系统环境变量。推荐做法：把 OSS 凭证写在代码顶部常量，并通过 Coze 的「插件加密配置」功能保护。如果你的工作流面向多租户，建议把 OSS 路径前缀也按租户分目录写入。
  </Accordion>

  <Accordion title="apikey 为什么要从入参传入而不是写死？">
    便于按用户分发不同密钥。在 Coze 工作流中可以前置一个「人员 apikey 分离」字典节点，按调用人姓名匹配对应的 API易 密钥，方便用量核算与权限控制。
  </Accordion>

  <Accordion title="4K 分辨率经常超时？">
    Nano Banana Pro 的 4K 出图本身需要较长时间（通常 5-15 分钟）。插件已为 4K 配置了 1200 秒超时，如果还是超时，建议：

    1. 降级到 2K 调试 prompt
    2. 检查 API易 控制台是否有限流
    3. 减少同时调用并发数
  </Accordion>

  <Accordion title="错误返回 `TEXT_RESPONSE` 怎么处理？">
    这通常意味着模型拒绝了任务（违规、超出知识库等），插件会自动判别类型：水印移除、换脸、色情、年份超出 2025 等。按 `error` 字段文案展示给用户即可，**不要重试**——重试结果一致。
  </Accordion>

  <Accordion title="完整源码在哪里？可以直接复制吗？">
    可以。本文档"插件完整源码"章节提供了 `coze-nanobanana-pro.py` 的完整代码（作者 Shuaila1996 贡献），**只需修改顶部 4 行 OSS 配置**就能直接粘贴到 Coze IDE 投入使用，无需额外索取。

    如果你还需要：

    * 飞书字段捷径代码 → 见 [飞书多维表格 AI 生图方案](/scenarios/ecosystem/feishu-bitable-image-shortcut) 中的"飞书字段捷径完整源码"章节
    * 阿里云函数计算代码 → 同上文档中的"阿里云函数计算完整源码"章节
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="飞书多维表格 AI 生图方案" icon="table" href="/scenarios/ecosystem/feishu-bitable-image-shortcut">
    本插件的最佳搭档：把整条 Coze 工作流接入飞书多维表格，运营同学填表即可批量出图
  </Card>

  <Card title="Nano Banana Pro 文档" icon="banana" href="/api-capabilities/nano-banana-image">
    查看 Nano Banana Pro 完整 API 文档、定价与生图样例
  </Card>

  <Card title="生图失败排查" icon="circle-question-mark" href="/faq/nano-banana-image-failure">
    Nano Banana 生图常见问题排查指南，匹配本插件的错误码体系
  </Card>

  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量与余额
  </Card>
</CardGroup>
