> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax H3 视频生成上线

> API易上线 MiniMax H3（海螺 3.0）开源权重自部署通道：一个端点覆盖文生、首尾帧与图/视频/音频混合参考生成，原生立体声，768P、4–15 秒，按秒 $0.03，参考素材不另收费。

## 核心要点

* **全模态一个端点**：文生视频、首帧 / 尾帧 / 首尾帧、最多 9 张参考图 + 3 段参考视频 + 3 段参考音频的混合参考生成，全部走同一个 `POST /hailuo/v2/video_generation`
* **原生立体声**：每条视频自带配乐与音效，画面可以跟着参考音频的节奏生成
* **开源权重自部署通道**：768P、4–15 秒任意整数时长、7 种画幅
* **定价 \$0.03/秒**：10 秒视频 \$0.30；参考图、参考视频、参考音频都不另收费；任务失败自动全额退款
* **`default` 默认分组即可调用**，`svip` 分组同样可用

## 背景介绍

MiniMax 于 2026-07-31 (UTC+8) 发布 H3（海螺 3.0）。和上一代「一种任务一个接口」的做法不同，H3 用一个模型同时理解文本、图片、视频和音频，输出带立体声音轨的视频。官方随后开放了模型权重（MiniMax H3 Community License），这让第三方可以自行部署推理服务。

API易这次上线的就是**基于开源权重的自部署通道**，而不是原厂官方 API 的转发。两者的差别主要在两点：分辨率只开放 768P（原厂 API 另有 2K 档位），以及定价独立。其余能力——参考素材上限、画幅、时长范围、音频输出——与官方模型一致。

## 详细解析

### 性能基准

MiniMax 官方公告以能力展示和性价比为主，未公布可复现的量化基准；本文不引用来源不明的第三方排名。API易侧的实测数据见下文「技术规格」。

### 核心特性

<CardGroup cols={2}>
  <Card title="一个端点，四种生成方式" icon="layers">
    系统按 `content[]` 里的素材自动识别：只有文本就是文生视频；带 `first_frame` / `last_frame` 就是关键帧生视频；带 `reference_*` 就是参考生成。
  </Card>

  <Card title="图 + 视频 + 音频混合参考" icon="images">
    参考图最多 9 张、参考视频最多 3 段、参考音频最多 3 段，合计 12 个。提示词里用 `<Picture 1>`、`<Video 1>`、`<Audio 1>` 指代。
  </Card>

  <Card title="原生立体声" icon="music">
    输出 MP4 自带 32 kHz 立体声音轨；音乐、音效和节奏由提示词与参考音频驱动，不需要后期配音。
  </Card>

  <Card title="7 种画幅、按秒计时" icon="ratio">
    `21:9` 到 `9:16` 六档固定比例，外加跟随参考图的 `adaptive`；时长 4–15 秒任意整数。
  </Card>
</CardGroup>

### 技术规格

| 项目 | 规格（API易 实测） |
| - | - |
| 模型 ID | `MiniMax-H3` |
| 模型结构 | 33B 稠密 Transformer（官方模型卡） |
| 分辨率 | 768P |
| 画幅与输出尺寸 | `21:9` 1536×672、`16:9` 1344×768、`4:3` 1024×768、`1:1` 768×768、`3:4` 768×1024、`9:16` 768×1344 |
| 时长 | 4–15 秒整数，成片通常比请求值长 0.1–0.5 秒 |
| 参考素材 | 图片 ≤ 9、视频 ≤ 3（累计 ≤ 15 秒）、音频 ≤ 3，仅公网 HTTPS 链接 |
| 提示词 | 1 条，最长 7000 字符 |
| 生成耗时 | 实测中位数约 3 分钟（2–6 分钟） |

<Warning>
  两个需要提前知道的限制：本通道**不支持 2K**；请求头 `Idempotency-Key` 目前**不生效**，重复提交会创建新任务并分别计费，业务层请自行做幂等。
</Warning>

## 实际应用

### 推荐场景

* **音乐可视化、舞蹈短片**：用参考音频驱动画面节奏
* **角色一致的短剧分镜**：多张参考图固定角色与道具
* **动作 / 运镜迁移**：用参考视频复刻镜头运动
* **商品与海报动起来**：首帧图 + 运镜描述，`adaptive` 保持原图比例

### 代码示例

```python theme={null}
import time
import requests

API_KEY = "sk-your-apiyi-key"
BASE = "https://api.apiyi.com/hailuo/v2"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

task_id = requests.post(f"{BASE}/video_generation", headers=HEADERS, timeout=60, json={
    "model": "MiniMax-H3",
    "content": [{"type": "text", "text": "黄昏海边的灯塔，镜头缓慢推进，海浪声与低沉的弦乐"}],
    "resolution": "768P",
    "duration": 10,        # 整数 4–15，按秒计费
    "ratio": "16:9",
}).json()["task_id"]

while True:
    task = requests.get(f"{BASE}/query/video_generation/{task_id}", headers=HEADERS, timeout=30).json()["task"]
    if task["status"] in ("succeeded", "failed"):
        break
    time.sleep(10)
print(task.get("content", {}).get("url") or task["error"])
```

完整参数、素材要求与多语言示例见 [MiniMax-H3 视频生成 API 参考](/api-capabilities/minimax-h3/video-generation)。

### 最佳实践

1. **路径带 `/hailuo` 前缀**，不带前缀会返回网页而不是 JSON
2. **先用 4–5 秒试效果**，确认构图再出 10–15 秒的正式版本
3. **纯文本请求用固定比例**，`adaptive` 只在带图片或视频时可用
4. **素材放在稳定的公网存储**，防盗链或过期签名会让任务在下载素材时失败（失败自动退款）
5. **拿到 `task.content.url` 后立即转存**，检查链接用 GET，HEAD 请求会返回 403

## 价格与可用性

### 定价信息

| 计费项 | API易（自部署，768P） | 原厂官方 API（768P） |
| - | - | - |
| 输出视频 | **\$0.03 / 秒** | \$0.08 / 秒 |
| 参考图片 | 不收费（最多 9 张） | 前 5 张免费，第 6 张起 \$0.04 / 张 |
| 参考视频 | 不收费 | 按输入时长 \$0.08 / 秒 |
| 参考音频 | 不收费 | 不收费 |
| 10 秒文生视频 | **\$0.30** | \$0.80 |

<Note>本通道为开源权重自部署，定价独立于原厂官方 API，且可能调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

* 按请求的 `duration` 计费，提交受理时预扣；任务失败**自动全额退款**，提交阶段报错不扣费
* 分组：`default` 默认分组或 `svip` 分组，令牌计费模式推荐「按量优先」

### 叠加网站充值活动

充值加赠可与上述定价叠加，实际单价更低，详见 [充值加赠活动](/faq/recharge-promotions)。

## 总结与建议

MiniMax H3 的价值在于**把多种视频任务收进一个模型**：同一个端点既能文生，也能用图、视频、音频混合参考，还自带立体声。API易的自部署通道以 \$0.03/秒提供 768P 输出，参考素材不另收费，适合需要大量试稿、批量出片的团队。需要 2K 成片、或依赖幂等键防重复扣费的场景，请在接入前评估这两点限制。

从这里开始：[MiniMax-H3 概览](/api-capabilities/minimax-h3/overview) · [视频生成 API 参考](/api-capabilities/minimax-h3/video-generation)

<Info>
  **信息来源（2026-09-29 获取）**：

  * MiniMax 官方博客：`minimax.io/blog/minimax-h3`（发布日期、能力范围）
  * 官方模型卡：`huggingface.co/MiniMaxAI/MiniMax-H3`（33B 结构、参考素材上限、32 kHz 立体声、许可协议）
  * 原厂官方 API 定价：`platform.minimax.io/docs/guides/pricing-paygo`
  * API易 侧规格、耗时、计费：2026-09-29 (UTC+8) 实测
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.