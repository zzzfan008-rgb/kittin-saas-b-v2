> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 系列开发指南

> Nano Banana 系列（Pro / 2 / 2 Lite / 第一代）的模型选型、计费、接入端点、开发格式与常见问题一站式指南，帮助开发者快速上手 Gemini 生图 API。

## 模型卡

| 模型                     | 官方模型名                            | 计费                                                   | 备注        |
| ---------------------- | -------------------------------- | ---------------------------------------------------- | --------- |
| **Nano Banana Pro**    | `gemini-3-pro-image-preview`     | 固定按次 **\$0.09/次**（约 0.63 元；叠加充值活动后约 0.55 元）          | 质量最高      |
| **Nano Banana 2**      | `gemini-3.1-flash-image-preview` | 按次 **\$0.055/次**（推荐 4K 出图使用）；或按量动态计费，2K 约 **\$0.04** | 性价比       |
| **Nano Banana 2 Lite** | `gemini-3.1-flash-lite-image`    | 固定按次 **\$0.025/次**；或按量约 **\$0.018/次**（官网 4 折）        | 最快最省，仅 1K |
| **Nano Banana**（第一代）   | `gemini-2.5-flash-image`         | 固定按次 **\$0.02/次**                                    | 最便宜       |

<Info>
  完整价格对比、按次/按量计费与令牌选择建议，见 [Nano Banana 系列价格总览](/api-capabilities/nano-banana-pricing)。
</Info>

### 尺寸控制

* **遵循原图比例**：不传 `aspectRatio` 即可；在多图编辑场景里，以**最后一张图的尺寸**为准
* **分辨率 `imageSize`**：支持 `1K` / `2K` / `4K`
  * Nano Banana（第一代）**仅支持 1K**
  * Nano Banana 2 **新增 512px**
  * Nano Banana 2 Lite **仅支持 1K**（不支持 2K/4K/512px）

<Warning>
  用同一套代码调用第一代 `gemini-2.5-flash-image` 时，**必须去掉 `imageSize` 参数**（它不支持 `2K` / `4K`），否则会调用失败。
</Warning>

## 接入方式

### 官方文档

* 谷歌官方文档：`ai.google.dev/gemini-api/docs/image-generation`
* 接入 API易 只需把**请求地址 + KEY 替换为 API易 的**即可，其余参数与官方一致

### 官方状态查询（排查上游故障）

Nano Banana 系列底层依赖谷歌 AIStudio / Gemini API。少数情况下 **2K / 4K 出图变糊或报错**，可能是**谷歌官方侧**的问题、而非接入层——可在谷歌官方状态页核对（请自行复制访问）：`aistudio.google.com/status`。

例如 2026 年 6 月 19 日，该页报道过「Issues with Nano Banana」：Gemini API 与 AI Studio 上的 Nano Banana 2 / Pro 在 2K 或 4K 分辨率下出现问题。遇到类似现象，先比对官方状态页即可快速判断是否为上游故障。

<Info>
  API易 为 Nano Banana 系列提供 **AIStudio + Vertex 双通道**冗余：官方单通道异常时可由另一通道顶上，尽量保障服务可用性。
</Info>

### 端点支持

* **推荐端点**（Gemini 原生）：`https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
* 支持 **OpenAI 兼容模式**调用（注意：**不支持 URL 上传**，需用 Base64）
* **不支持** `/v1/image/generations`

### 开发格式（默认推荐）

* **【推荐】使用谷歌原生端点格式**
* 图片：**Base64 上传、下载转存**
* 调用方式：**同步多线程调用**，暂不支持异步调用

## 输入图片要求

* **单图不能超过 7MB**（谷歌规则）；若通过 Google Cloud Storage 导入，单文件上限 30MB
* **每个提示最多 14 张图**
* **支持的 MIME 类型**：`image/png`、`image/jpeg`、`image/webp`、`image/heic`、`image/heif`（`jpg` 格式 API易 已兼容）
* **Base64 体积膨胀**：图片转 Base64 后体积增加约 **33.3%**（7MB 的图约为 9.3MB）
* **API易 限制**：单次请求上传图片总量需**低于 100MB**——均为同步调用，过大会导致内存爆炸

<Frame caption="谷歌官方技术规范：内嵌/控制台上传单文件上限 7MB，支持 png/jpeg/webp/heic/heif">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-image-size-limit.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=fc422e34e493a907363115118f715690" alt="谷歌 Gemini 3 Pro Image 官方技术规范表：单图上限 7MB，每个提示最多 14 张图，支持的宽高比与 MIME 类型" width="1400" height="701" data-path="images/nano-banana-image-size-limit.png" />
</Frame>

<Frame caption="Base64 编码使体积增加约 33.3%：7MB 图片约等于 9.3MB">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-base64-size.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=dffe216ee6e97c2661ce816eb5408a22" alt="Base64 体积计算说明：7MB 原图按 4/3 比例编码后约 9.33MB" width="1448" height="984" data-path="images/nano-banana-base64-size.png" />
</Frame>

**最佳实践**：传给接口前对图片做**无损压缩**，避免超大分辨率拖慢请求速度。

谷歌官方规格说明（请自行复制访问）：`docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image`

## URL 图片输入说明

除了 Base64，**Gemini 原生端点**还支持通过 `fileData.fileUri` 直接传入图片 URL（图床 / OSS 地址），省去本地编码上传的步骤。

<Warning>
  **URL 上传对图床、OSS 地址的要求较高**：如果不是全球 CDN（例如腾讯云对象存储默认走国内 CDN），很可能无法被谷歌服务器识别，进而请求失败（典型表现为**不参考图**）。

  **如果条件允许，尽量用 Base64 方式上传，稳定性更高**——在平台视角，这是通用能力上投入运维资源最多、最可靠的方式。
</Warning>

<Info>
  URL 上传仅在 **Gemini 原生端点**可用；**OpenAI 兼容模式不支持 URL 上传**，需改用 Base64。
</Info>

### Curl 示例（fileUri）

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### Python 示例（fileUri）

```python theme={null}
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini 3 Pro Image - 图片编辑（file_uri 最小化版本）
用途：仅用于快速验证接口可用性
"""

import requests
import base64
import json
from pathlib import Path
from datetime import datetime

# ============================================================================
# 配置区域
# ============================================================================

API_KEY = "sk-"
API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

# 图片 URL
IMAGE_URL = "https://raw.githubusercontent.com/apiyi-api/ai-pics/refs/heads/main/1762260696217_dd0352c1f9604540.png"
IMAGE_MIME_TYPE = "image/png"

# 编辑指令
EDIT_PROMPT = "将照片中的人的衣服换成蓝色夹克，头发换成紫色渐变色，人物的动作、眼睛朝向等其他结构不变"
SYSTEM_PROMPT = "您是一位专业的图像描述和生成专家。您的任务是根据用户的请求，创作出细节丰富、艺术风格明确的高质量图像提示，或对现有图像进行准确、有创意的编辑。"

# 输出参数
ASPECT_RATIO = "9:16"
RESOLUTION = "4K"
MAX_OUTPUT_TOKENS = 8000
OUTPUT_FILE = f"minimal_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

# ============================================================================
# 核心代码
# ============================================================================

def main():
    print("=" * 60)
    print("开始测试 file_uri 格式接口")
    print("=" * 60)
    print(f"图片 URL: {IMAGE_URL[:80]}...")
    print(f"编辑指令: {EDIT_PROMPT}")
    print(f"输出参数: {RESOLUTION}, {ASPECT_RATIO}")
    print("-" * 60)

    # 构建请求体
    # 注意：fileData、mimeType、fileUri 必须使用驼峰命名
    payload = {
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "imageConfig": {
                "imageSize": RESOLUTION,
                "aspectRatio": ASPECT_RATIO
            },
            "maxOutputTokens": MAX_OUTPUT_TOKENS
        },
        "contents": [
            {
                "role": "model",
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            {
                "role": "user",
                "parts": [
                    {
                        "fileData": {           # 驼峰命名：fileData（不是 file_data）
                            "mimeType": IMAGE_MIME_TYPE,  # 驼峰命名：mimeType
                            "fileUri": IMAGE_URL          # 驼峰命名：fileUri
                        }
                    },
                    {"text": EDIT_PROMPT}
                ]
            }
        ]
    }

    # 发送请求
    print("\n正在发送请求...")
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=300
        )

        print(f"响应状态码: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ 错误: {response.text}")
            return

        # 解析响应
        data = response.json()
        print("✅ 成功获取响应")

        # 保存完整响应（方便调试）
        with open(OUTPUT_FILE + ".response.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"📄 响应已保存: {OUTPUT_FILE}.response.json")

        # 提取并打印文本
        parts = data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "text" in part:
                print(f"\n💬 文本响应: {part['text']}")

        # 保存图片
        for part in parts:
            if "inlineData" in part or "inline_data" in part:
                image_data = part.get("inlineData", part.get("inline_data", {})).get("data")
                if image_data:
                    image_bytes = base64.b64decode(image_data)
                    with open(OUTPUT_FILE, "wb") as f:
                        f.write(image_bytes)
                    print(f"\n✅ 图片已保存: {OUTPUT_FILE}")
                    print(f"📦 文件大小: {len(image_bytes) / 1024:.1f} KB")
                    print(f"🔗 文件路径: {Path(OUTPUT_FILE).resolve()}")
                    return

        print("⚠️  响应中未找到图片数据")

    except requests.Timeout:
        print("❌ 请求超时")
    except Exception as e:
        print(f"❌ 错误: {e}")

if __name__ == "__main__":
    main()
    print("\n" + "=" * 60)
    print("测试结束")
    print("=" * 60)
```

<Tip>
  `fileData`、`mimeType`、`fileUri` 必须使用**驼峰命名**（不是 `file_data` / `file_uri`），否则参数不生效、表现为不参考图。
</Tip>

## 计费基础（重要）

* **同步调用耗时**：Pro / 2 在 4K 下的合理生成时间约 **30–150s**
* **超时主动断开仍计费**：例如生成需 120s，但客户端把超时设为 100s 主动断开，仍会计费
* **429 / 503 不收费**：请求不通时不计费（我们尽量不让客户久等、不卡死迟迟不出图）
* **内容安全拒绝仍计费**：客户输入存在内容安全问题、谷歌拒绝出图时，**状态码 200 仍会计费**——详见下方错误处理与保障计划

## Google 搜索接地会在按次价之外另收费

Pro 支持 `googleSearch` 工具（实测 3/3 触发接地，返回完整 `groundingMetadata`），用来画天气卡、股价图这类需要实时信息的图。

**但搜索调用费是加在 \$0.09 按次价之上的，不含在里面**：

| 场景           | 单次账单                           |
| ------------ | ------------------------------ |
| 普通出图（无工具）    | \$0.09                         |
| 带搜索、模型查了 1 次 | \$0.09 + \$0.014 = **\$0.104** |
| 带搜索、模型查了 2 次 | \$0.09 + \$0.028 = **\$0.118** |

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "画一张东京今天天气的卡片海报" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

<Warning>
  **搜索次数由模型自己决定，客户无法预先控制**。实测一次出图请求会自主发起 1–3 次检索，所以开了这个工具之后单次成本是一个区间（\$0.104–\$0.132），不再是固定的 \$0.09。做成本预估时按上限算。
</Warning>

<Note>
  **图片搜索接地（`searchTypes.imageSearch`）在 Pro 上不生效**，实测 0/2 未触发，`groundingMetadata` 里不出现 `imageSearchQueries`。这是 Nano Banana 2（`gemini-3.1-flash-image`）的独有能力，用法见 [Nano Banana 2 · 影响计费的三个参数](/api-capabilities/nano-banana-2-image/overview#影响计费的三个参数)。
</Note>

## thinkingLevel 对 Pro 无效，不要照搬 NB2 的写法

`generationConfig.thinkingConfig.thinkingLevel` 是 **Nano Banana 2 系列独有**的开关。给 Pro 传 `high`：

* **不报错**，请求正常返回 200
* **但完全不生效**：实测 `thoughtsTokenCount` 在 108–156 之间，与不传时的 130–159 完全重叠
* Pro 的思考恒开、无法调节，官方文档亦如此说明

而且 **Pro 按次固定计价，思考多少都不进账单**——所以在 Pro 上调这个参数既无效果、也无成本意义。需要控制思考开销请改用 Nano Banana 2 的按量计费。

## 超时设置（重要）

4K 出图的整体耗时较长，包含**图片上传、API 处理、Base64 图片下载**等环节（我们后台按 **API 处理用时**计费）。正常情况下 4K 用时约 **50s**（不含轮询），但客户端若把超时设得过短，就会在出图完成前**主动断开**并报错：

```text theme={null}
API Connection Error: HTTPSConnectionPool(host='api.apiyi.com', port=443): Read timed out. (read timeout=120)
```

<Frame caption="调用日志：4K 出图首字节耗时约 43–61s，默认 120s 超时偏紧">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-timeout-error.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=79eb88c65cd4ff91caa57e1402658b81" alt="调用日志：gemini-3-pro 4K 出图首字节耗时 43 到 61 秒" width="1400" height="837" data-path="images/nano-banana-timeout-error.png" />
</Frame>

为更保险，建议按分辨率设置超时时间：

```python theme={null}
timeout = {
    "1K": 300,  # 5 分钟 - 快速预览
    "2K": 300,  # 5 分钟 - 推荐使用
    "4K": 600,  # 10 分钟 - 超高清
}
```

## 多轮对话式编辑（原生支持，逆向不支持）

Nano Banana 系列走 **Gemini 原生格式**，支持**真正的对话式多轮编辑**：把模型每一轮产出的图作为 **`role: "model"` 的 `inlineData`** 回填进 `contents`，再发下一条 user 指令，模型会基于**完整对话历史**继续修改并**累积效果**（如先改沙发颜色、再加配饰，上一步的改动会保留）。

这一点与"逆向"图像模型有本质区别，接入前务必分清：

| 维度         | Nano Banana（Gemini 原生）                         | 逆向模型（如 `gpt-image-2-all`）        |
| ---------- | ---------------------------------------------- | -------------------------------- |
| 端点         | `/v1beta/...:generateContent`                  | `/v1/chat/completions`（对话式）      |
| 多轮机制       | ✅ **真·对话式**：`contents` 回填 `role:model` 图，模型读历史 | ❌ 无对话状态：`assistant` 历史里的图**被忽略** |
| 跨轮累积修改     | ✅ 支持（红沙发→再加帽子，红沙发保留）                           | ⚠️ 只能"重新喂图"做单步改图                 |
| 正确改上一张图的姿势 | 把上轮产出作为 `model` 图回填进对话历史                       | 把上一张图 URL 作为**新一轮 user 的参考图**重新传 |

<Info>
  实测：把上一张图放进 `model` 角色回填，Nano Banana 2（`gemini-3.1-flash-image-preview`）能正确基于它继续编辑并累积修改；而逆向模型只认**最后一条 user 消息里的参考图**，靠保留对话历史做多轮在逆向上无效。
</Info>

最小示例（每轮把产出图回填进同一个 `contents`）：

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"imageSize": "2K"}}

contents = []  # 全程维护同一个对话历史

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # 关键：把产出图回填进历史
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))

turn("生成一只橙色的猫，坐在蓝色沙发上，简笔画风格", "step1.png")
turn("把沙发改成红色，猫和构图保持不变", "step2.png")     # 基于上一轮的图
turn("给猫戴一顶黄色小帽子，其它保持不变", "step3.png")     # 继续累积，红沙发会保留
```

<Tip>
  完整说明（含"对话历史回填" vs "重新喂图"两种写法、从已有图片开始多轮）见 [图片编辑 API · 多轮对话式编辑](/api-capabilities/nano-banana-2-image/image-edit#多轮对话式编辑)。
</Tip>

## 取图必须遍历 parts，不要按下标

`parts` 是一个**异构数组**：里面可能只有图片段，也可能文本段与图片段混排，**段数和顺序都不做保证**。因此 `parts[0]` / `parts[1]` 这类写死下标的取法一定会间歇性失败。

实测出现过的三种排列：

| parts 结构              | 长度 | 图片下标    |
| --------------------- | -- | ------- |
| `inlineData`          | 1  | `0`     |
| `text` + `inlineData` | 2  | **`1`** |
| `inlineData` + `text` | 2  | **`0`** |

文本段的来源不止一种：`responseModalities` 里含 `TEXT`、提示词要求模型给出文字说明，都会让模型在图片之外再返回一段文本；文本段排在图片前还是图片后也不固定。**因此图片落在哪个下标并非定值**，同一份代码在不同请求下可能拿到不同结构。

<Warning>
  写死下标的两种写法是**互补**的：图片必落在 `[0]` 或 `[1]`，无论选哪个，都存在拿不到图的请求。**在 `[0]` 和 `[1]` 之间来回改解决不了问题**，只有按字段特征筛选才稳定。
</Warning>

正确写法是**按字段特征筛选**，而不是按位置索引。注意取的是**最后一个** `inlineData` 而非第一个——复杂任务下模型会返回多张图，最后一张才是最终稿（见下一节）：

```python theme={null}
cand = (resp.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []      # 兼容 parts=null
images = [p["inlineData"] for p in parts if "inlineData" in p]
if not images:
    raise RuntimeError(f"未返回图片，finishReason={cand.get('finishReason')}")

final = images[-1]                                 # 多图时最后一张为最终稿
image_bytes = base64.b64decode(final["data"])
mime = final["mimeType"]                           # 以响应为准，别写死 image/png
```

```javascript theme={null}
const parts = resp?.candidates?.[0]?.content?.parts ?? [];
const images = parts.filter((p) => p.inlineData?.data);   // ✅ 不要写 parts[1]
if (images.length === 0) throw new Error("Gemini 未返回图片数据");
const { data, mimeType } = images[images.length - 1].inlineData;   // 最后一张为最终稿
```

<Tip>
  **加固手段**：在 `generationConfig` 里显式声明 `responseModalities: ["IMAGE"]`，表明只要图片，可减少多余文本段。

  但这是加固、**不是替代**——遍历筛选仍需先落地。反向并不成立：传 `["TEXT","IMAGE"]` 并**不保证**一定返回文本段，模型也可能只给图片。
</Tip>

<Warning>
  **`mimeType` 同样不要写死**。响应里的图片格式并不恒定，`image/png` 与 `image/jpeg` 都出现过。若按固定 `.png` 后缀落盘，会得到扩展名与实际内容不符的文件——**一律以响应里的 `mimeType` 为准**决定后缀。
</Warning>

## 偶现多图输出是怎么回事

调用 `gemini-3-pro-image` 时，偶尔会看到**同一个响应里返回多张图片 part（实测 2–10 张）**，日志里对应偶发的 6000+ 乃至上万的输出 tokens。这不是异常：谷歌官方文档说明 Gemini 3 图片模型默认启用"思考"（无法在 API 中关闭），模型会生成临时图片来测试构图和逻辑，这些中间稿与最终稿一并出现在 `parts` 里，且"思考中的最后一张图片也是最终渲染的图片"（官方文档：`ai.google.dev/gemini-api/docs/image-generation`）。基于 2026 年 7 月实测（Google 原生 `generateContent` 格式）：

| 场景                               | 返回图片数                    |
| -------------------------------- | ------------------------ |
| 纯文生图                             | 恒为 1 张（即使提示词明确要求"输出多张图"） |
| 简单图片编辑（加饰品/换背景/换风格）              | 恒为 1 张                   |
| 复杂任务型编辑（如"人物四视图 + 换装 + 白底"等多重约束） | 2–10 张，必现                |

触发因素是**提示词的任务复杂度**，不是"图片编辑"本身。多张图仍在**同一个 candidate** 内（不是多 candidates），每张都是完整的成图——它们是思考过程中对同一设计的逐稿修正（构图相同、细节略有差异），**最后一张 part 即最终稿**。这些中间稿以普通图片 part 返回（带 `thoughtSignature` 字段、无 `thought: true` 标记）；官方称思考最多生成两张临时图片，实测复杂任务下最多见 10 张。

**对计费的影响**：每张图按固定 tokens 计费（1K/2K 分辨率每张 1120 tokens，4K 每张 2000 tokens），输出 tokens 随图片数严格线性增长。日志里偶发的 6000+（极端可达 1.3 万+）输出 tokens 就是 4–10 图响应，**不是异常计费**。

**下游代码建议**：

```python theme={null}
parts = response["candidates"][0]["content"]["parts"] or []   # 安全拒绝时 parts 为 null
images = [p["inlineData"]["data"] for p in parts if "inlineData" in p]

if images:
    final_image = images[-1]   # 最后一张 = 最终稿
```

* **必须遍历 parts**，不要假设单响应单图；按张计数、落盘的逻辑要以实际 part 数为准
* **只要一张时取最后一张**：前面的迭代稿细节未修完，质量略低，不建议取第一张
* **提示词控制张数基本无效**（实测"只输出一张"类指令不敏感），请在代码层处理
* 多图响应耗时 35–142s（1K 分辨率，张数越多越久），显著长于单图，超时请沿用上文建议（≥ 5 分钟）

<Tip>
  usageMetadata 各字段的完整口径（details 与总量的差值、拒绝响应的计数特例等）见 [usage 字段与输出解读](/api-capabilities/nano-banana-usage-metadata)。
</Tip>

## 常见问题

<CardGroup cols={2}>
  <Card title="错误处理指南" icon="triangle-alert" href="/api-capabilities/gemini-image-error-handling">
    出图失败的三大判断指标、内容审核政策与友好提示方案
  </Card>

  <Card title="常见开发问题必读" icon="circle-question-mark" href="/faq/nano-banana-image-failure">
    出图失败排查与常见疑问
  </Card>

  <Card title="出图失败保障计划" icon="shield-check" href="/api-capabilities/nano-banana-pro-guarantee">
    非主观原因导致的失败，按条数核算后补发额度
  </Card>
</CardGroup>

<AccordionGroup>
  <Accordion title="报错 connection reset by peer / write_response_body_failed（500）是什么原因？">
    完整报错形如：

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    这种错误**往往是上传的图片体积过大，请求体超限把连接压崩了**。请按以下最佳实践处理：

    * **控制图片张数**：保持在官方规则内（每个提示最多 14 张图，见上方官方技术规范）。
    * **控制单图体积**：每张图尽量不要超过 5MB——官方单图上限为 7MB，且 base64 编码后体积还会膨胀约 1/3，原图请留足余量。
    * **前端先压缩再上传**：在前端（或服务端中转层）压缩后再提交给接口，常见做法是限制最长边、转 JPEG/WebP 并控制质量参数。
    * **改用 URL 传图**：Gemini 原生格式支持 `fileData.fileUri` 直接传图片 URL，可避开 base64 请求体过大的问题，见上文 [URL 图片输入说明](#url-图片输入说明)。
  </Accordion>
</AccordionGroup>

## 应用场景

* **AI 对话客户端**：[Cherry Studio](/scenarios/chat/cherry-studio) 等客户端可直接配置 API易 出图
* **出图测试**：可在对话客户端或控制台快速验证模型效果

## 高级需求

* **图片上传想用 URL？** Gemini 原生端点支持通过 `fileData.fileUri` 传入图片 URL；但 OpenAI 兼容模式不支持 URL 上传，需改用 Base64。代码示例与注意事项见上文 [URL 图片输入说明](#url-图片输入说明)。
* **图片下载想直接拿到 URL（而非 Base64）？** 使用 NB-OSS 分组——详见 [Nano Banana OSS 分组](/api-capabilities/nano-banana-oss-group)。
