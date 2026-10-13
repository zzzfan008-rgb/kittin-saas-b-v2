> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 视频生成上线

> API易 联合 AZ8 上线其自研全能视频模型 oxygen-1.0：OpenAI Videos 兼容接口，文生、首帧、首尾帧、参考图/视频/音频生视频一个模型搞定，320p–768p、4–15 秒，按秒 $0.02、不分清晰度。

## 核心要点

* **API易 联合 AZ8 首发**：AZ8 自研的全能视频模型 Oxygen 以 `oxygen-1.0` 上线，`default` 默认分组即可调用
* **一个模型，四种生成方式**：文生视频、首帧、首尾帧，以及最多 9 张参考图 + 3 段参考视频 + 3 段参考音频的参考生成，成片自带音轨
* **OpenAI Videos 兼容**：`POST /v1/videos` 提交、`GET /v1/videos/{id}` 查询，已有 Sora 类接入代码改动很小
* **定价 \$0.02/秒，三档清晰度同价**：4 秒 \$0.08、15 秒 \$0.30；参考素材不另收费，任务失败自动全额退款
* **定位便宜走量**：适合批量出片、A/B 试稿、短视频素材生产

## 背景介绍

AZ8 是新加坡的 AI 视频创作平台（前身为 Videoinu），2026 年 5 月推出了基于无限画布的视频创作工作台，把文本、图片、视频、音频节点放在同一张画布上编排。Oxygen 是 AZ8 自研的视频生成模型。

这次 API易 与 AZ8 联合，把 Oxygen 以标准 API 的形式开放出来。和主打高分辨率、高画质的旗舰视频模型不同，Oxygen 的取向很明确：**能力覆盖要全，单价要低**。它不追求 1080p、4K 这类高规格，而是把 320p–768p 的常用档位做成同一个价，让批量生成的成本可预测。

## 详细解析

### 性能基准

AZ8 尚未公开 Oxygen 的量化基准，第三方评测平台也还没有收录；本文不引用来源不明的排名。以下规格、耗时与计费均为 API易 上架前的实测结果。

### 核心特性

<CardGroup cols={2}>
  <Card title="四种生成方式，一个模型" icon="layers">
    不传素材就是文生视频；给一张图是首帧生视频；给首帧 + 尾帧是首尾帧过渡；给参考图 / 视频 / 音频就是参考生成。
  </Card>

  <Card title="图 + 视频 + 音频混合参考" icon="images">
    参考图最多 9 张、参考视频最多 3 段、参考音频最多 3 段，用来固定角色与道具、复刻运镜、驱动节奏。
  </Card>

  <Card title="三档清晰度同价" icon="monitor">
    320p / 480p / 768p 都是 \$0.02/秒。320p 出片更快、文件更小，适合预览；768p 用于正式成片。
  </Card>

  <Card title="自带音轨" icon="music">
    输出 MP4 自带音频轨，不需要单独配音或后期合成。
  </Card>
</CardGroup>

### 技术规格

| 项目 | 规格（API易 实测） |
| - | - |
| 模型 ID | `oxygen-1.0` |
| 接口 | OpenAI Videos：`POST /v1/videos`、`GET /v1/videos/{id}` |
| 时长 | 4–15 秒整数（顶层 `seconds`），成片通常比请求值长 0.2–0.5 秒 |
| 清晰度与输出尺寸 | 320p：576×320；480p：864×480 / 480×864 / 480×480；768p：1344×768 / 768×1344 / 768×768 |
| 画幅 | 16:9、9:16、1:1；图生视频跟随首帧比例 |
| 图片输入 | 公网 https 链接或图片 data URI |
| 参考素材 | 图片 ≤ 9、视频 ≤ 3、音频 ≤ 3（视频与音频仅支持 https 链接） |
| 输出 | MP4，查询响应的 `video_url` 约 24 小时有效 |
| 生成耗时 | 通常 1–3 分钟，高峰排队时可能 5 分钟以上 |

### 两个必须知道的写法

<Warning>
  * **每次显式传 `size`**：不传时网关默认补 `720x1280`，横屏需求会出竖屏视频。`1280x720` / `720x1280` 是 480p，`1792x1024` / `1024x1792` 是 768p
  * **高级参数写进 `input_reference` 的 JSON 信封**：首尾帧、参考素材、320p、1:1 都要写成一段以 `{` 开头的 JSON 字符串放进 `input_reference`。这些字段写在请求体顶层会被**静默丢弃**——不报错、照常扣费，但尾帧不生效、参考图被忽略
</Warning>

## 实际应用

### 推荐场景

* **短视频素材批量生产**：电商商品、信息流广告、社媒配图动起来，单条成本以美分计
* **分镜试稿与 A/B 测试**：先用 4 秒 320p 快速比较多个创意方向，再出正式版
* **首尾帧过渡**：给定开场与收尾画面，生成中间的转场动画
* **角色一致的系列短片**：多张参考图固定人物与道具，配合参考音频控制节奏

### 代码示例

```python theme={null}
import json
import time
import requests

API_KEY = "sk-your-apiyi-key"
BASE = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# 首尾帧生视频：高级参数写进 input_reference 的 JSON 信封
envelope = {
    "images": ["https://your-cdn.example.com/first.png"],
    "last_image": "https://your-cdn.example.com/last.png",
}
task = requests.post(f"{BASE}/videos", headers=HEADERS, timeout=60, json={
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",            # 整数 4–15，按秒计费
    "size": "1280x720",        # 每次都显式传，决定清晰度与横竖
    "input_reference": json.dumps(envelope),  # 必须是字符串
}).json()

while True:
    task = requests.get(f"{BASE}/videos/{task['id']}", headers=HEADERS, timeout=30).json()
    if task["status"] in ("completed", "failed"):
        break
    time.sleep(5)
print(task.get("video_url") or task.get("error"))
```

文生视频去掉 `input_reference` 即可；只给首帧时，`input_reference` 直接填图片链接或 data URI。完整参数与多语言示例见 [Oxygen 视频生成 API 参考](/api-capabilities/oxygen/video-generation)。

### 最佳实践

1. **先用 4 秒试效果**：按秒计费，确认构图和风格后再出 10–15 秒
2. **首尾帧用比例相近的两张图**：成片比例跟随首帧，尾帧比例差太多时会被裁切
3. **素材放在稳定的公网存储**：防盗链或签名过期会让任务在下载素材时失败（失败自动退款）
4. **用 `video_url` 下载并立即转存**：状态刚变 `completed` 时 `/v1/videos/{id}/content` 可能还返回 400；链接约 24 小时后失效
5. **偶发 `upstream_error` 隔几分钟重提**：失败已自动退款；400 类错误先改参数，不要重试

## 价格与可用性

### 定价信息

| 计费项 | 价格 |
| - | - |
| 输出视频（320p / 480p / 768p 同价） | **\$0.02 / 秒** |
| 首帧、尾帧、参考图 / 视频 / 音频 | 不额外收费 |
| 4 秒视频 | \$0.08 |
| 10 秒视频 | \$0.20 |
| 15 秒视频 | \$0.30 |

<Note>模型价格可能调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

* 按请求的 `seconds` 计费，提交受理时预扣；成片略长于请求值的部分不额外收费
* 任务 `failed` 自动全额退款；提交阶段返回 400 的请求不扣费；查询和下载不收费
* 分组：`default` 默认分组或 `svip` 分组，令牌计费模式用「按量优先」

### 叠加网站充值活动

充值加赠可与上述定价叠加，实际单价更低，详见 [充值加赠活动](/faq/recharge-promotions)。

## 总结与建议

Oxygen 的卖点是**全能 + 便宜**：一个模型覆盖文生、首帧、首尾帧和多模态参考生成，成片自带音轨，三档清晰度统一 \$0.02/秒。对需要大量出片、反复试稿的团队，它能把单条视频成本压到几美分。

如果需要 1080p 以上的成片，或对画质有更高要求，可以对比站内的 [Seedance 2.0 / 2.5](/api-capabilities/seedance2/overview) 与 [MiniMax-H3](/api-capabilities/minimax-h3/overview)，按场景混用：Oxygen 负责试稿和走量，旗舰模型负责终版。

从这里开始：[Oxygen 概览](/api-capabilities/oxygen/overview) · [视频生成 API 参考](/api-capabilities/oxygen/video-generation)

<Info>
  **信息来源（2026-10-02 获取）**：

  * AZ8 平台介绍：`martechseries.com/video/az8-launches-canvas-based-ai-video-creation-workspace/`（画布式工作台的发布时间与定位）
  * 模型能力与参数：AZ8 提供的接口说明
  * API易 侧规格、输出尺寸、耗时与计费：2026-09-30 至 2026-10-02 (UTC+8) 上架实测；定价以 `api.apiyi.com/api/pricing` 为准
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.