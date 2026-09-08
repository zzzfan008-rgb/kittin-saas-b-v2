> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official 正式上线：透传 Google AI Studio

> API易接入 Google Veo 3.1 官转通道（透传 Google AI Studio），按次计费 $0.3 / $1.2，支持 720p / 1080p / 4k 三档分辨率与同步音视频原生输出。默认分组 + 按次计费即可调用，零接入门槛。

## 核心要点

* **Google AI Studio 官转通道**：透传到 Google Veo 3.1 异步端点，模型 ID 与官方完全一致
* **两个模型**：`veo-3.1-fast-generate-preview`（\$0.3/次）和 `veo-3.1-generate-preview`（\$1.2/次）—— 按次计费，与时长 / 分辨率无关
* **能力完整**：4 / 6 / 8 秒灵活时长 + 720p / 1080p / 4k 三档分辨率 + 横竖屏 + 原生同步音轨
* **零接入门槛**：**默认分组 `Default` 即可调用**，**按次计费 或 按量优先 令牌都可调用**（按量计费暂不支持），无需切换专属分组——老用户现有 Key 一行 `base_url` 就能接入
* **失败不计费**：仅 `status=completed` 的成功任务才扣费，失败 / 取消 / 内容审核拦截均免费
* **与既有官逆通道互补**：[VEO 3.1（官逆）](/api-capabilities/veo/overview) 仍保留，价格 \$0.15 起、支持同步流式与首尾帧；新官转通道追求官方画质稳定。详见 [选型对比](/api-capabilities/veo-3-1-official/vs-veo-reverse)

## 背景介绍

Google 在 2026 年发布了 Veo 3.1 系列，作为旗舰级电影感视频生成引擎，主打 4K 输出、原生同步音轨、复杂镜头运动与极致时间一致性。官方提供两个变体：

* `veo-3.1-generate-preview` —— 最高画质 standard 档
* `veo-3.1-fast-generate-preview` —— 性价比 fast 档

API易此前通过 [官逆通道（VEO 3.1）](/api-capabilities/veo/overview) 为用户接入了 Google Flow，单价 \$0.15 起、支持同步流式与首尾帧，是预算敏感场景的首选。但官逆通道因走的是逆向接口，**在画质稳定性、模型 ID 一致性、企业合规性** 方面与官方有差异。

**为弥补这一段，API易团队上线 VEO 3.1 Official 官转通道**：透传 Google AI Studio 官方端点，模型 ID、响应字段、约束条件与 Google 官方完全一致。**2026 年 5 月 21 日 (UTC+8) 正式开放调用**。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="🎬 同步音视频原生输出" icon="volume-2">
    Veo 3.1 原生输出带同步音轨的视频（环境音、对话、配乐），无需后期单独配音。音频效果通过 prompt 描述即可，**不要传 `generateAudio` 参数**。
  </Card>

  <Card title="📐 三档分辨率分级" icon="expand">
    `720p` / `1080p` / `4k` 三档单价均一。横屏 `16:9`、竖屏 `9:16` 灵活切换。
  </Card>

  <Card title="⏱️ 4 / 6 / 8 秒灵活时长" icon="clock">
    时长字段名是 `seconds`（不是 `duration`），字符串枚举，按次计费、时长不影响单价。1080p / 4k 分辨率仅支持 8 秒。
  </Card>

  <Card title="🎯 精准指令遵循" icon="target">
    Veo 3.1 在镜头运动、物体物理、人物表情等细节上的指令遵循能力领先同档模型，支持丰富镜头语言关键词。
  </Card>
</CardGroup>

### 关键卖点：开箱即用

相对 [Sora 2 官转](/api-capabilities/sora-2/overview)（需切专属 `Sora2Official` 分组 + 必须按量优先令牌），**VEO 3.1 Official 走 `Default` 默认分组 + 按次计费 或 按量优先 令牌都可调用**，老用户的现有按次令牌不改配置就能直接跑：

```python theme={null}
{/* 一行 base_url 接入，无需切分组、不需要专属令牌 */}
from openai import OpenAI
client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.post(
    "/videos",
    body={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪声，电影级光影",
        "seconds": "8",
        "size": "1280x720",
        "metadata": {"resolution": "720p", "aspectRatio": "16:9"}
    },
    cast_to=dict
)
```

### 模型与价格 — 对比 Google 官方立省 60％+

API易 使用 **Pay-per-request** 计费，在支持的时长和分辨率组合内统一价格，**不按时长或分辨率额外加价**。按 `ai.google.dev/gemini-api/docs/pricing` 公开价格测算，Google 官方 Veo 3.1 以秒计费；以下折扣按 **8 秒视频** 计算。

| 模型                              | API易 价格       | Google 官方 8 秒 1080p      | Google 官方 8 秒 4K         |
| ------------------------------- | ------------- | ------------------------ | ------------------------ |
| `veo-3.1-fast-generate-preview` | **\$0.3 / 次** | \$0.96<br />便宜 **68.8%** | \$2.40<br />便宜 **87.5%** |
| `veo-3.1-generate-preview`      | **\$1.2 / 次** | \$3.20<br />便宜 **62.5%** | \$4.80<br />便宜 **75.0%** |

**按模型名按次计费**，时长（4/6/8 秒）、分辨率（720p/1080p/4k）、是否传 `input_reference` 都不影响单价——**选 4K 不加价**。**只对 `status=completed` 的成功任务计费**，叠加 [充值加赠](/faq/recharge-promotions) 实际成本进一步下降。

### 技术规格

| 维度     | `veo-3.1-fast-generate-preview`         | `veo-3.1-generate-preview` |
| ------ | --------------------------------------- | -------------------------- |
| 支持时长   | `"4"` / `"6"` / `"8"` 秒（字符串）            | 同                          |
| 支持分辨率  | 720p / 1080p / 4k                       | 同                          |
| 支持比例   | 16:9 / 9:16                             | 同                          |
| 端点     | `POST /v1/videos`（仅异步）                  | 同                          |
| 音轨     | ✅ 同步音视频                                 | ✅                          |
| 图生视频   | ✅（仅 1 张 `input_reference`）              | ✅                          |
| 典型生成耗时 | 720p 60–90s · 1080p 80–120s · 4K 5–6 分钟 | 同                          |

### 三步异步调用流程

```
第 1 步：POST /v1/videos          → 返回 task_id + status="queued"
第 2 步：GET /v1/videos/{task_id} → 轮询，每 8 秒，直到 status="completed"
第 3 步：GET /v1/videos/{task_id}/content → 下载 MP4 二进制
```

## 实际应用

### 适用场景

<CardGroup cols={2}>
  <Card title="✅ 推荐用 Official（官转）" icon="check">
    * 客户广告片最终交付
    * 4K 高清电影感片段
    * 对画质稳定性 / 物理一致性敏感
    * 海外团队、现有 Key 不动配置接入
    * 强指令遵循（镜头运动、人物表情）
  </Card>

  <Card title="🔄 推荐用官逆（VEO 3.1）" icon="refresh-cw">
    * 短视频矩阵批量生产（\$0.15 单价）
    * 前端在线展示需要同步流式进度条
    * 需要首尾帧（Frame-to-Video）能力
    * 极致预算敏感场景
  </Card>
</CardGroup>

详细选型对照见 [官转 vs 官逆 决策树](/api-capabilities/veo-3-1-official/vs-veo-reverse)。

### 三个最容易踩的坑

1. **时长字段名是 `seconds`（不是 `duration`），必须传字符串** `"4"` / `"6"` / `"8"`。写成 `duration` 会被静默忽略、回落默认 4 秒；传数字会报 `parse_request_failed`
2. **不要传 `generateAudio` 参数**，上游会回 `INVALID_ARGUMENT`。音频效果直接写进 prompt
3. **1080p / 4k 时 `seconds` 必须 `"8"`**，传 `"4"` / `"6"` 会被上游拒

完整代码示例与 20+ FAQ 详见 [官转概览页](/api-capabilities/veo-3-1-official/overview) 与 [文生视频 Playground](/api-capabilities/veo-3-1-official/text-to-video)。

## 价格与可用性

* **上线时间**：2026 年 5 月 21 日 (UTC+8)
* **分组**：`Default`（1x，**无需切换**）
* **计费模式**：**按次计费 ✅ / 按量优先 ✅**（按量计费 ❌ 暂不支持）
* **充值加赠**：叠加 [充值加赠活动](/faq/recharge-promotions) 实际成本进一步下降
* **可用网关**：`api.apiyi.com`（主）+ `vip.apiyi.com` / `b.apiyi.com`（备）

## 总结与建议

VEO 3.1 Official 是 API易接入 Veo 3.1 系列的 **官转通道**（透传 Google AI Studio），定位与 [Sora 2 Official](/api-capabilities/sora-2/overview) 类似但**接入门槛更低**：

* ✅ 模型 ID、响应字段与 Google 官方完全一致
* ✅ 默认分组 + **按次计费 / 按量优先 令牌均可调用**（按量计费不支持），老 Key 不动配置就能跑
* ✅ 4 / 6 / 8 秒灵活时长 + 720p / 1080p / 4k 三档分辨率
* ✅ 失败不计费，按成功结果结算
* ✅ 与既有 [官逆通道](/api-capabilities/veo/overview) 并存，按场景互补

**推荐先用 `veo-3.1-fast-generate-preview` 跑通最小 demo（\$0.3 / 4–8 秒）**，定型后再切 `veo-3.1-generate-preview` 出最终交付片。

## 相关文档

* [VEO 3.1 Official 概览](/api-capabilities/veo-3-1-official/overview) - 系列完整介绍
* [文生视频 Playground](/api-capabilities/veo-3-1-official/text-to-video) - 在线调试 + 5 段代码示例
* [图生视频 Playground](/api-capabilities/veo-3-1-official/image-to-video) - multipart 上传用法
* [官转 vs 官逆 选型对照](/api-capabilities/veo-3-1-official/vs-veo-reverse) - 三步决策树
* [VEO 3.1（官逆）](/api-capabilities/veo/overview) - 既有官逆通道，\$0.15 起、支持同步流式与首尾帧
* [Sora 2 Official](/api-capabilities/sora-2/overview) - OpenAI 官转视频生成
* [充值加赠活动](/faq/recharge-promotions) - 充值最高档位

<Info>
  Google 官方模型页：`ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview` · Google 视频生成总入口：`ai.google.dev/gemini-api/docs/video`
</Info>
