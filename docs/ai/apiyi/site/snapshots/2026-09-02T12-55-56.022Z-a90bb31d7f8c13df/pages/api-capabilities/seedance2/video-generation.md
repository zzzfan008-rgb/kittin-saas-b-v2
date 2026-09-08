> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 / 2.5 视频生成 API 参考

> Seedance 2.0 视频生成 API 参考与在线调试：文生视频 / 首尾帧 / 首帧 / 多模态参考生视频，异步任务式端点，含完整轮询与下载代码。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`（令牌须勾选 `SeeDance2` 分组，2.5 与 2.0 系通用），填好 `model` / `content` 后发起请求。提交成功返回任务 `id`，后续轮询与下载见下方代码示例。
</Info>

<Warning>
  **关于 Playground 报「请求时发生错误: no response received」**：本接口是异步任务式端点，在浏览器里点「发送」可能出现此提示——这是浏览器的跨域安全校验拦截了响应，**任务实际已成功提交到后台**（可用下方查询接口或控制台日志验证）。此外 Playground 仅能创建任务、无法完成轮询与下载视频。要跑通完整的「创建 → 轮询 → 下载」流程，请直接复制下方 **代码示例**（cURL / Python / Node.js）运行。
</Warning>

<Tip>
  本页是 Seedance 2.0 的创建任务接口，文生视频、首尾帧/首帧、多模态参考生视频共用同一端点，靠 `content` 数组区分模式。模型选型、定价、分辨率像素表、FAQ 见 [Seedance 2.0 概览](/api-capabilities/seedance2/overview)。
</Tip>

<Warning>
  * 路径前缀是 `/seedance/api/v3`，**不要漏掉 `/api`**，也不要用 `/v1/videos`
  * 令牌必须勾选 `SeeDance2` 分组，否则报「该模型无可用渠道」：**2.5 与 2.0 系都走 `SeeDance2`**，一把令牌通吃四个模型（`mini` / `fast` 另有特价的 `SD2Mini` / `SD2Fast`）
  * `generate_audio` **默认 true**（输出带声音），不需要请显式传 `false`
  * Python requests 需加请求头 `"Accept-Encoding": "identity"`，否则可能报 gzip 解码错误，或响应体被截断成非法 JSON（如开头丢失 `{"`，只剩 `id":"cgt-xxx"}`），甚至间歇性 400
  * 成功状态是 `succeeded`（不是 `completed`），视频地址在 `content.video_url`，**24 小时过期**
</Warning>

## 代码示例

<CodeGroup>
  ```bash cURL（文生视频） theme={null}
  curl -X POST "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
        {"type": "text", "text": "无人机航拍视角飞越秋天的山谷，金黄色的森林和蜿蜒的河流，电影感"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      "generate_audio": false
    }'
  # 返回：{"id":"cgt-2026xxxx-xxxxx"}，拿 id 轮询查询接口
  ```

  ```python Python（完整流程：创建 → 轮询 → 下载） theme={null}
  import time
  import requests

  BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  HEADERS = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      # 必加：网关 gzip 头与实际编码不符，缺了会报 gzip 解码错误，
      # 或响应体被截断成非法 JSON（如开头丢 {"，只剩 id":"cgt-xxx"}），甚至间歇 400
      "Accept-Encoding": "identity",
  }

  # 1. 创建任务
  body = {
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
          {"type": "text", "text": "海浪拍打礁石，夕阳把海面染成金色，慢镜头，氛围宁静"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      # "generate_audio": False,  # 默认 True；不要声音时取消注释
      # "seed": 12345,            # 固定随机性，可复现类似结果
  }
  task_id = requests.post(BASE, json=body, headers=HEADERS, timeout=60).json()["id"]
  print("task_id:", task_id)

  # 2. 轮询直到终态（succeeded / failed / expired）
  while True:
      time.sleep(20)
      task = requests.get(f"{BASE}/{task_id}", headers=HEADERS, timeout=30).json()
      status = task.get("status")
      print("status:", status)
      if status in ("succeeded", "failed", "expired"):
          break

  # 3. 下载视频（URL 24 小时过期，成功后立即转存）
  if status == "succeeded":
      video_url = task["content"]["video_url"]   # 注意：在 content 下，不在顶层
      print("tokens:", task["usage"]["completion_tokens"])
      with requests.get(video_url, stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(f"{task_id}.mp4", "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print(f"已保存 {task_id}.mp4")
  else:
      print("任务未成功:", task.get("error"))
  ```

  ```python Python（首尾帧 / 参考图模式） theme={null}
  # 首尾帧：2 张图，role 必填；与参考图模式互斥
  body_first_last = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "画面从第一帧平滑过渡到最后一帧，镜头缓慢运动"},
          {"type": "image_url", "image_url": {"url": "https://example.com/first.jpg"},
           "role": "first_frame"},
          {"type": "image_url", "image_url": {"url": "https://example.com/last.jpg"},
           "role": "last_frame"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",   # 按首帧图片比例自动适配，避免裁剪
      "duration": 5,
  }

  # 多模态参考：0~9 参考图 + 0~3 参考视频 + 0~3 参考音频（至少 1 图或 1 视频），可生成全新/编辑/延长视频
  body_reference = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "以参考图的角色和风格，生成角色在雨夜街头行走的镜头"},
          {"type": "image_url", "image_url": {"url": "https://example.com/character.png"},
           "role": "reference_image"},
          # {"type": "video_url", "video_url": {"url": "..."}, "role": "reference_video"},
          # {"type": "audio_url", "audio_url": {"url": "..."}, "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # 图片也支持 Base64（data:image/png;base64,xxx）与平台素材 ID（asset://xxx）
  ```

  ```python Python（Seedance 2.5：30 秒长片 / 视频编辑 / 视频延长） theme={null}
  # 2.5 与 2.0 共用同一端点与请求结构，只需换 model；以下三段是 2.5 独有的能力

  # ① 30 秒长片：2.5 的 duration 上限是 30（2.0 系是 15）
  body_30s = {
      "model": "doubao-seedance-2-5-260628",
      "content": [{"type": "text", "text": "无人机航拍飞越秋天的山谷，晨雾在林间流动，一镜到底"}],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 30,        # 别省略！2.5 的 duration 缺省是 -1，模型会自己选时长
  }

  # ② 视频编辑：ratio 必须 adaptive、duration 必须 -1，参考视频时长需在 4-30 秒
  body_edit = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # 提示词必须带编辑意图词：增加 / 加上 / 删除 / 去掉 / 修改 / 替换 / 改成
          {"type": "text", "text": "在 @视频1 中增加几只飞过的小鸟"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",                    # 必须；传具体比例会同步 400
      "duration": -1,                         # 必须；传具体秒数会同步 400
      "omni_reference_task_type": "edit",     # 显式声明，把参数校验前置到提交时
      "output_format": "mov",                 # 可选：后期加工推荐 mov（部分播放器不兼容）
  }

  # ③ 视频延长：ratio 必须 adaptive
  body_extend = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # 提示词必须带延长意图词：向前/向后延长、延续、续写
          {"type": "text", "text": "向后延长 @视频1，镜头继续向前推进，天色渐暗"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",
      "omni_reference_task_type": "extend",
  }

  # ④ 纯音频参考：2.5 独有，2.0 系必须搭配图片或视频
  body_audio_only = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          {"type": "text", "text": "根据 @音频1 的节奏，生成抽象光影随节拍律动的画面"},
          {"type": "audio_url", "audio_url": {"url": "https://example.com/track.mp3"},
           "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # 提交与轮询流程与上面完全一致，不再重复
  ```

  ```javascript Node.js（fetch） theme={null}
  const BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const HEADERS = {
    "Authorization": "Bearer sk-your-api-key",
    "Content-Type": "application/json",
  };

  // 1. 创建任务
  const { id } = await fetch(BASE, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-fast-260128",
      content: [{ type: "text", text: "雪山脚下的湖泊倒映着星空，延时摄影效果" }],
      resolution: "720p",
      ratio: "9:16",        // 竖屏与横屏同价
      duration: 5,
    }),
  }).then(r => r.json());
  console.log("task_id:", id);

  // 2. 轮询直到终态
  let task;
  do {
    await new Promise(r => setTimeout(r, 20000));
    task = await fetch(`${BASE}/${id}`, { headers: HEADERS }).then(r => r.json());
    console.log("status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 3. 视频直链（24 小时过期，请立即转存）
  if (task.status === "succeeded") console.log(task.content.video_url);
  ```

  ```bash cURL（查询任务） theme={null}
  curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx" \
    -H "Authorization: Bearer sk-your-api-key"
  ```
</CodeGroup>

## 参数说明速查

| 参数                         | 类型     | 必填 | 默认                    | 说明                                                                                                                                                                                                                                |
| -------------------------- | ------ | -- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                    | string | ✓  | —                     | `doubao-seedance-2-5-260628`（**2.5，推荐**，支持 1080p、最长 30 秒）/ `doubao-seedance-2-0-260128`（标准版，支持 1080p）/ `doubao-seedance-2-0-fast-260128`（极速版，最高 720p）/ `doubao-seedance-2-0-mini-260615`（轻量版，最高 720p，单价约标准版一半）。写纯 ID，不要带 `ep-` 前缀 |
| `content`                  | array  | ✓  | —                     | 输入信息数组，见下方「生成模式」                                                                                                                                                                                                                  |
| `resolution`               | string |    | `720p`                | `480p` / `720p` / `1080p`（1080p 仅 2.5 与标准版，fast 与 mini 最高 720p）；**四个模型都不支持 `4k`**                                                                                                                                                 |
| `ratio`                    | string |    | `adaptive`            | `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9` / `adaptive`；同档位全比例同价                                                                                                                                                            |
| `duration`                 | int    |    | 2.5 为 `-1`，2.0 系为 `5` | 2.5 支持 **4–30** 整数秒，2.0 系支持 4–15；`-1` 由模型智能选时长（按实际产出计费）。**2.5 缺省即 `-1`**，不显式传会自动选时长、费用随之变化                                                                                                                                        |
| `generate_audio`           | bool   |    | `true`                | 是否生成同步音频（人声/音效/配乐，单声道）                                                                                                                                                                                                            |
| `watermark`                | bool   |    | `false`               | 是否加「AI 生成」水印                                                                                                                                                                                                                      |
| `seed`                     | int    |    | `-1`                  | \[-1, 2^32-1]；相同 seed 生成类似（不保证一致）结果                                                                                                                                                                                               |
| `return_last_frame`        | bool   |    | `false`               | 返回尾帧 png（无水印），用于多段视频接力                                                                                                                                                                                                            |
| `execution_expires_after`  | int    |    | `172800`              | 任务过期阈值（秒），范围 \[3600, 259200]                                                                                                                                                                                                      |
| `output_format`            | string |    | `mp4`                 | **仅 2.5**：`mp4`（通用）/ `mov`（QuickTime，H.264 + yuv444p + PCM，色彩还原更好，适合后期；部分播放器不兼容）                                                                                                                                                  |
| `omni_reference_task_type` | string |    | `auto`                | **仅 2.5**：`auto` / `edit`（视频编辑）/ `extend`（视频延长）。显式指定后接口会**前置校验**特殊参数限制，提交时就能拿到 400，而不是等任务跑完才失败                                                                                                                                    |

<Warning>
  Seedance 2.5 与 2.0 系均**不支持** `frames`、`camera_fixed` 参数——这些是 Seedance 1.x 的能力，传入会被忽略或报错。

  **2.5 独有的任务类型硬约束**（违反会在提交时返回 `InvalidParameter.TaskTypeConstraint`，不扣费）：

  | 任务类型         | `ratio`           | `duration`                    |
  | ------------ | ----------------- | ----------------------------- |
  | 文生视频 / 参考生视频 | 无限制               | 无限制                           |
  | 首帧 / 首尾帧生视频  | **必须 `adaptive`** | 无限制                           |
  | 视频编辑         | **必须 `adaptive`** | **必须 `-1`**，且待编辑视频时长在 4–30 秒内 |
  | 视频延长         | **必须 `adaptive`** | 无限制                           |
</Warning>

### 生成模式（content 组合）

| 模式              | content 组成                                                                                                      | role 取值                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 文生视频            | 1 个 `text`                                                                                                      | —                                                         |
| 图生视频-首尾帧        | text（可选）+ 2 个 `image_url`                                                                                       | 必填 `first_frame` / `last_frame`                           |
| 图生视频-首帧         | text（可选）+ 1 个 `image_url`                                                                                       | `first_frame` 或不填                                         |
| 多模态参考生视频        | text + 参考素材（2.5：最多 30 `image_url` + 10 `video_url` + 10 `audio_url`；2.0 系：0–9 图 + 0–3 视频 + 0–3 音频，至少 1 图或 1 视频） | `reference_image` / `reference_video` / `reference_audio` |
| 视频编辑（**仅 2.5**） | text（含编辑意图词）+ 至少 1 个 `video_url`                                                                                | `reference_video`，配 `omni_reference_task_type: "edit"`    |
| 视频延长（**仅 2.5**） | text（含延长意图词）+ 至少 1 个 `video_url`                                                                                | `reference_video`，配 `omni_reference_task_type: "extend"`  |

三种图生场景**互斥**。图片支持公网 URL、Base64（`data:image/png;base64,...`）、素材 ID（`asset://...`）；不支持含真人人脸的输入素材。素材引用的端到端代码（上传入库 → `asset://` 出片 → 下载）见 [素材引用实战](/api-capabilities/seedance2/asset-reference)。

**大素材内联会拖慢创建任务**：Base64 或大图 URL 的上行/下载耗时全都算在提交阶段，会把秒级的创建任务接口拖到几十秒甚至读超时。带图带视频时建议先入库拿 `asset://` 素材 ID，见 [素材优先实践](/api-capabilities/seedance2/asset-first-workflow)。

**参考素材数量按模型区分**：2.5 支持 30 图 + 10 视频 + 10 音频，且**音频可以单独作为唯一参考**；2.0 系是 9 图 + 3 视频 + 3 音频，音频必须与至少 1 个图片或视频一起传。

**编辑与延长靠提示词意图触发**，`omni_reference_task_type` 只是把校验前置。提示词里用 `@视频1`、`@图像1` 按传入顺序指代素材；编辑要带「增加 / 删除 / 修改 / 替换」这类词，延长要带「向后延长 / 续写 / 延续」。若模型按提示词判定的任务类型与显式声明不符，任务会异步失败并返回 `InvalidParameter.TaskTypeMismatch`。

## 响应格式

创建成功只返回任务 ID（**不是视频本身**）：

```json theme={null}
{ "id": "cgt-20260606160057-6bbjd" }
```

拿到 `id` 后轮询 `GET /seedance/api/v3/contents/generations/tasks/{id}` 查询状态。

### 轮询节奏建议

| 项目     | 建议值                | 说明                                              |
| ------ | ------------------ | ----------------------------------------------- |
| 首次查询延迟 | 提交后 **20–30 秒**    | 更早查必然是 `queued`，纯属浪费请求                          |
| 轮询间隔   | **10–20 秒**一次      | 视频生成是分钟级任务，秒级轮询没有意义，还可能触发限流                     |
| 超时上限   | **10 分钟**未到终态即视为异常 | 排队高峰可放宽到 15 分钟，或改由 `execution_expires_after` 兜底 |

实测出片耗时（含排队）：2.0 系 720p 5 秒约 **90–140 秒**、15 秒约 **170 秒**；2.5 的 720p 5 秒约 **150 秒**、**30 秒约 330 秒**、1080p 5 秒约 **150 秒**。分辨率越高、时长越长越慢，排队高峰会进一步拉长。下方代码示例采用 20 秒固定间隔，够用且请求数可控。

成功后的完整响应（实测样本）：

```json theme={null}
{
  "id": "cgt-20260606160057-6bbjd",
  "model": "doubao-seedance-2-0-fast-260128",
  "status": "succeeded",
  "content": {
    "video_url": "https://ark-acg-cn-beijing.tos-cn-beijing.volces.com/....mp4?X-Tos-Expires=86400&..."
  },
  "usage": { "completion_tokens": 108900, "total_tokens": 108900 },
  "created_at": 1780732857,
  "updated_at": 1780732991,
  "seed": 97151,
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5,
  "framespersecond": 24,
  "generate_audio": true,
  "draft": false
}
```

<Warning>
  * 视频地址在 **`content.video_url`**，不在顶层；签名直链 **24 小时过期**，成功后立即下载转存
  * 状态机：`queued → running → succeeded / failed / expired`，成功是 **`succeeded`**
  * 下载视频时直接 GET 直链即可，**不要带 `Authorization` 头**
</Warning>

<Info>
  `usage.completion_tokens` 即计费 token 数，满足 `token ≈ 时长 × 宽 × 高 × 24 / 1024`（实测偏差少于 0.1%）。**含参考视频时，输入视频时长按输出分辨率一并计入**，即 `(输入视频时长 + 输出时长) × 宽 × 高 × 24 / 1024`。`duration: -1` 或 `ratio: adaptive` 时，实际时长与比例以响应中的 `duration` / `ratio` 字段为准（编辑任务的时长**可能是非整数秒**）。
</Info>


## OpenAPI

````yaml api-reference/seedance2-video-openapi.yaml POST /seedance/api/v3/contents/generations/tasks
openapi: 3.1.0
info:
  title: Seedance 2.0 视频生成 API
  description: >
    字节跳动 Seedance 2.0 视频生成（火山引擎国内版官方资源）。


    能力要点：

    - 文生视频 / 图生视频（首尾帧、首帧）/ 多模态参考生视频（0-9 参考图 + 0-3 参考视频 + 0-3 参考音频，至少 1 图或 1 视频）

    - 分辨率 480p / 720p / 1080p（fast 不支持 1080p），6 种宽高比 + adaptive，同档位全比例同价

    - 时长 4-15 秒或 -1 智能时长，帧率固定 24fps，默认输出同步音频（generate_audio 默认 true）

    - 异步任务式：创建返回任务 id，轮询 GET /seedance/api/v3/contents/generations/tasks/{id} 直到
    succeeded，从 content.video_url 下载（24 小时过期）


    认证方式：Bearer Token（计费模式选「按量优先」；令牌须勾选对应分组：2.5 用 SeeDance25，2.0 系用 SeeDance2）。

    获取 Key：API易控制台 → 令牌管理。
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /seedance/api/v3/contents/generations/tasks:
    post:
      tags:
        - 视频生成
      summary: 创建 Seedance 2.0 视频生成任务
      description: >
        异步接口：提交后立即返回任务 `id`，**不是视频本身**。


        - 必填：`model` + `content`（文本 / 文本+图片 / 文本+图片+视频+音频等组合）

        - 三种图生场景互斥：首尾帧（2 图，role 必填）/ 首帧（1 图）/ 多模态参考生视频（0-9 图 + 0-3 视频 + 0-3
        音频，至少 1 图或 1 视频，图片 role 均为 reference_image）

        - 不支持含真人人脸的输入素材；音频需与至少 1 个图片或视频一起传

        - 不支持 `frames` / `camera_fixed`（Seedance 1.x 参数）

        - 提交时预扣费、完成后多退少补；参数错误被拒不扣费


        提交成功后轮询 `GET /seedance/api/v3/contents/generations/tasks/{id}`，

        状态机 `queued → running → succeeded / failed / expired`，

        成功后从 `content.video_url` 下载 mp4（约 24 小时过期）。

        详细说明见文档「Seedance 2.0 概览」。
      operationId: createSeedance2VideoTask
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Seedance2CreateTaskRequest'
            example:
              model: doubao-seedance-2-5-260628
              content:
                - type: text
                  text: 无人机航拍视角飞越秋天的山谷，金黄色的森林和蜿蜒的河流，电影感
              resolution: 720p
              ratio: '16:9'
              duration: 5
              generate_audio: false
      responses:
        '200':
          description: 任务创建成功，返回任务 ID（用于轮询查询）
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Seedance2TaskCreated'
              example:
                id: cgt-20260606160057-6bbjd
        '400':
          description: >-
            参数错误（InvalidParameter）：如 fast 模型传 1080p、duration 超出 4-15、非法
            ratio。错误信息会指明具体参数名；不扣费
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截（真人面孔、违规内容）
        '429':
          description: 请求频率超限或额度不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    Seedance2CreateTaskRequest:
      type: object
      required:
        - model
        - content
      properties:
        model:
          type: string
          description: >-
            模型 ID（写纯 ID，不要带 ep- 前缀）。2.5 支持 1080p 与 4-30 秒，参考素材上限 30 图 + 10 视频 +
            10 音频；2.0 标准版支持 1080p；fast 与 mini 最高 720p，mini 单价约标准版一半。四个模型均不支持 4k
          enum:
            - doubao-seedance-2-5-260628
            - doubao-seedance-2-0-260128
            - doubao-seedance-2-0-fast-260128
            - doubao-seedance-2-0-mini-260615
          example: doubao-seedance-2-5-260628
        content:
          type: array
          description: >-
            输入信息数组。文生视频只放 1 个 text；图生视频追加 image_url（role: first_frame /
            last_frame）；多模态参考生视频追加 image_url（role: reference_image），可再加
            video_url / audio_url。参考素材上限：2.5 为 30 图 + 10 视频 + 10 音频且音频可单独使用，2.0
            系为 9 图 + 3 视频 + 3 音频且至少需 1 图或 1 视频。三种图生场景互斥
          items:
            type: object
            properties:
              type:
                type: string
                description: 内容类型
                enum:
                  - text
                  - image_url
                  - video_url
                  - audio_url
                example: text
              text:
                type: string
                description: 文本提示词（type=text 时必填）。中文建议不超过 500 字、英文不超过 1000 词；对话放双引号内可优化配音
                example: 海浪拍打礁石，夕阳把海面染成金色，慢镜头
              image_url:
                type: object
                description: >-
                  图片对象（type=image_url 时必填）。支持公网
                  URL、Base64（data:image/png;base64,...）、素材
                  ID（asset://...）；jpeg/png/webp/bmp/tiff/gif/heic/heif，宽高比
                  (0.4,2.5)，边长 (300,6000)px，单张小于 30MB；不支持真人人脸
                properties:
                  url:
                    type: string
                    description: 图片 URL / Base64 / asset:// 素材 ID
                    example: https://example.com/first.jpg
              video_url:
                type: object
                description: 参考视频对象（type=video_url 时必填），仅多模态参考模式使用
                properties:
                  url:
                    type: string
                    description: 视频 URL
              audio_url:
                type: object
                description: >-
                  参考音频对象（type=audio_url 时必填）。wav/mp3，单段 2-15 秒，最多 3 段且总时长不超过 15
                  秒；必须与至少 1 个图片或视频一起传
                properties:
                  url:
                    type: string
                    description: 音频 URL
              role:
                type: string
                description: 媒体用途。首尾帧必填 first_frame/last_frame；单首帧可不填；参考素材填 reference_*
                enum:
                  - first_frame
                  - last_frame
                  - reference_image
                  - reference_video
                  - reference_audio
        resolution:
          type: string
          description: >-
            分辨率档位（定义像素面积，同档位全比例同价）。1080p 仅 2.5 与 2.0 标准版支持，fast 与 mini 最高
            720p；均不支持 4k
          enum:
            - 480p
            - 720p
            - 1080p
          default: 720p
        ratio:
          type: string
          description: 宽高比。adaptive 按输入自动适配（图生视频推荐，避免裁剪）；实际比例见查询响应 ratio 字段
          enum:
            - '16:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - '9:16'
            - '21:9'
            - adaptive
          default: adaptive
        duration:
          type: integer
          description: >-
            视频时长（整数秒）：2.5 为 4-30，2.0 系为 4-15；或 -1 由模型智能选择（按实际产出计费）。费用与时长线性相关。注意
            2.5 的缺省值是 -1，2.0 系是 5
          default: 5
          example: 5
        generate_audio:
          type: boolean
          description: 是否生成与画面同步的音频（人声/音效/背景音乐，单声道）。注意默认 true，不需要声音时显式传 false
          default: true
        watermark:
          type: boolean
          description: 是否在右下角加「AI 生成」水印
          default: false
        seed:
          type: integer
          description: 随机种子，[-1, 2^32-1]。相同 seed 生成类似（不保证一致）结果；-1 表示随机
          default: -1
        return_last_frame:
          type: boolean
          description: 是否返回尾帧 png（无水印、与视频同宽高），用于把尾帧作为下一段任务首帧、量产连续视频
          default: false
        execution_expires_after:
          type: integer
          description: 任务过期阈值（秒），超时任务标记为 expired。范围 [3600, 259200]
          default: 172800
        output_format:
          type: string
          description: >-
            输出视频格式，仅 doubao-seedance-2-5-260628 支持。mov 为 QuickTime 容器（H.264 +
            yuv444p + PCM），色彩还原更好、适合后期，但部分播放器不兼容
          enum:
            - mp4
            - mov
          default: mp4
        omni_reference_task_type:
          type: string
          description: >-
            全模态参考生视频的任务类型，仅 doubao-seedance-2-5-260628 支持。显式指定 edit 或 extend
            时接口会前置校验：视频编辑要求 ratio=adaptive 且 duration=-1，视频延长要求
            ratio=adaptive，不符合会在提交时返回 InvalidParameter.TaskTypeConstraint
          enum:
            - auto
            - edit
            - extend
          default: auto
    Seedance2TaskCreated:
      type: object
      description: >-
        任务创建成功响应。拿 id 轮询 GET
        /seedance/api/v3/contents/generations/tasks/{id}；任务成功后视频地址在
        content.video_url（24 小时过期），计费 token 在 usage.completion_tokens
      properties:
        id:
          type: string
          description: 视频生成任务 ID（保存 7 天）
          example: cgt-20260606160057-6bbjd
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key（2.5 须勾选 SeeDance25 分组，2.0 系须勾选 SeeDance2 分组）

````