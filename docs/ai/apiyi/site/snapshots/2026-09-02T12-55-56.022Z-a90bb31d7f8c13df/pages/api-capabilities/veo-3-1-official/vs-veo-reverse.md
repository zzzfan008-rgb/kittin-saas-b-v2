> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official vs 官逆 选型对照

> VEO 3.1 Official（官转）与既有 VEO 3.1（官逆）通道的全维度对比表 + 三步决策树，帮你为不同业务场景选对通道。

<Warning>
  **官逆通道已下线（2026年6月）**：VEO 3.1 官逆通道因 Google Flow 逆向风控原因已暂时下线，当前请使用 **官转**（本系列）通道。本页官逆相关内容暂作保留以供参考，恢复时间请关注后续公告。
</Warning>

<Info>
  API易 同时提供两条 Veo 3.1 通道。本页帮你**按场景选型**：追求官方画质稳定性、能接受异步轮询 → 走 **官转**（本系列）；预算敏感、需要同步流式或首尾帧 → 走 **官逆**（[VEO 3.1](/api-capabilities/veo/overview)）。两条通道可以**同账号并行使用**，不冲突。
</Info>

## 全维度对照表

| 维度         | **官转**（本系列）                                                  | **官逆**（[既有 VEO 3.1](/api-capabilities/veo/overview)）        |
| ---------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| **通道类型**   | 透传 Google AI Studio 官方端点                                     | 逆向工程接入 Google Flow                                          |
| **模型 ID**  | `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` | `veo-3.1` / `veo-3.1-fast` / `-landscape` / `-fl` 系列共 8 个变种 |
| **计费方式**   | 按次（与时长、分辨率无关）                                                | 按次（与时长、分辨率无关）                                               |
| **价格**     | \$0.3（fast）/ \$1.2（standard）                                 | \$0.15（fast）/ \$0.25（standard）— **省 50–75%**                |
| **端点路径**   | 仅 `POST /v1/videos`（异步）                                      | `POST /v1/chat/completions`（同步流式）+ `POST /v1/videos`（异步）    |
| **同步流式**   | ❌ 仅异步轮询                                                      | ✅ 支持 `stream: true` 实时见进度                                   |
| **时长**     | 4 / 6 / 8 秒（字符串）                                             | 固定 8 秒                                                      |
| **分辨率**    | 720p / 1080p / 4k 三档                                         | HD 横屏（1280×720）/ 竖屏（720×1280）                               |
| **参考图**    | 1 张 `input_reference`（multipart）                             | 1–2 张（**支持首尾帧** `-fl` 系列）                                   |
| **横/竖屏切换** | 通过 `aspectRatio` 参数                                          | 通过模型 ID 选择（`-landscape` 系列）                                 |
| **分组**     | `Default`                                                    | `Default`                                                   |
| **计费模式**   | 按次计费 ✅ / 按量优先 ✅（按量计费 ❌）                                      | 按次计费 ✅ / 按量优先 ✅                                             |
| **响应字段**   | `id` / `task_id` / `status` / `progress`（粗粒度 0/50/100）       | 同步：完整 chat completion；异步：`task_id` / `status`               |
| **失败计费**   | ❌ 不计费                                                        | ❌ 不计费                                                       |
| **音频**     | 原生同步音轨                                                       | 原生同步音轨                                                      |
| **适用场景**   | 追求官方质量稳定、能接受异步轮询的生产场景                                        | 预算敏感、需要同步流式 UI 进度、需要首尾帧创作                                   |

## 三步决策树

<Steps>
  <Step title="Q1: 你需要首尾帧（Frame-to-Video）能力吗？">
    * **需要** → 走 **[官逆 VEO 3.1](/api-capabilities/veo/overview)** 的 `-fl` 系列（如 `veo-3.1-landscape-fast-fl`），官转**暂未开放**首尾帧
    * **不需要** → 进入 Q2
  </Step>

  <Step title="Q2: 你的前端需要同步流式进度条吗？">
    * **需要**（用户等待 UI 不能空白） → 走 **[官逆 VEO 3.1](/api-capabilities/veo/overview)** 的 `/v1/chat/completions` 同步流式端点
    * **后端任务化**（队列消费、批量出片） → 进入 Q3
  </Step>

  <Step title="Q3: 你的预算 vs 画质优先级如何？">
    * **预算优先**（\$0.15 vs \$0.3 差距明显）→ 走 **[官逆 VEO 3.1](/api-capabilities/veo/overview)**，单价低 50%
    * **画质 / 稳定性优先**（最终交付、4K 高清、强指令遵循） → 走 **官转**（本系列）的 `veo-3.1-generate-preview`
    * **试水预览** → 走 **官转**的 `veo-3.1-fast-generate-preview`（\$0.3）或 **官逆**的 `-fast`（\$0.15）
  </Step>
</Steps>

## 典型场景配对建议

| 业务场景                 | 推荐通道   | 推荐模型                                         | 理由               |
| -------------------- | ------ | -------------------------------------------- | ---------------- |
| 短视频矩阵批量生产（每天 100+ 条） | **官逆** | `veo-3.1-landscape-fast`                     | 单价 \$0.15，量产成本可控 |
| 客户广告片最终交付            | **官转** | `veo-3.1-generate-preview`                   | 官方画质稳定 + 4K 可选   |
| 前端在线展示（要 loading 动效） | **官逆** | `veo-3.1-landscape-fast` + 同步流式              | 可见进度，避免空等焦虑      |
| 静态海报 + 首尾帧 → 动效短片    | **官逆** | `veo-3.1-landscape-fast-fl`                  | 首尾帧能力            |
| 4K 高清电影感片段（关键素材）     | **官转** | `veo-3.1-generate-preview` + `resolution=4k` | 仅官转支持 4K         |
| 海外团队接入（现有 Key 不动配置）  | **官转** | `veo-3.1-fast-generate-preview`              | 默认分组 + 按次，零门槛    |
| 同 prompt 多 seed 探索风格 | **官转** | `veo-3.1-fast-generate-preview`              | 4–6 秒可选，试错成本低    |
| 试水 + 最终切换的工作流        | 混用     | 官逆 fast 试水 → 官转 standard 出片                  | 试错便宜、交付稳定        |

## 两个通道是否可以混用？

**完全可以**。两个通道是独立路由：

* 同一账号下，**同一把令牌**（走默认分组）可以同时调用两个通道，按调用次数分别计费
* 业务代码里按需切 `model` 字段即可：
  * 想走官转 → `veo-3.1-fast-generate-preview` / `veo-3.1-generate-preview`
  * 想走官逆 → `veo-3.1-fast` / `veo-3.1-landscape` / `veo-3.1-fl` 等

<Tip>
  **推荐配法**：把"业务关键交付"打到官转，把"试错 / 批量预览 / 同步 UI"打到官逆，账号统一、账单清晰、能力互补。
</Tip>

## 相关文档

* [VEO 3.1 Official 概览](/api-capabilities/veo-3-1-official/overview) - 官转通道完整介绍
* [VEO 3.1（官逆）概览](/api-capabilities/veo/overview) - 既有官逆通道完整介绍
* [VEO 3.1 Official 文生视频 Playground](/api-capabilities/veo-3-1-official/text-to-video)
* [VEO 3.1 Official 图生视频 Playground](/api-capabilities/veo-3-1-official/image-to-video)
* [VEO 3.1（官逆）快速开始](/api-capabilities/veo/quick-start) - 同步流式调用示例
* [VEO 3.1（官逆）异步 API](/api-capabilities/veo/async-api) - 含首尾帧用法
