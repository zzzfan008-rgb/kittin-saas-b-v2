> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 没开首尾帧，Seedance 却报首尾帧不能和参考素材混用？

> 提交 Seedance 任务返回 400：first/last frame content cannot be mixed with reference media content。原因是请求里的图片没有写 role，按规则被当成了首帧，再加上参考视频就冲突了。多见于用通用视频端点 /v2/videos/generations 提交的第三方工具。本页说明怎么改成原生端点、怎么写 role，以及参考视频该怎么传。

## 简短回答

**Seedance 只看请求里每个素材的 `role`，不看你工具里勾了什么开关，也不看提示词。** 图片没写 `role` 时，一张图会按「首帧图生视频」处理；这时再带上参考视频，就成了「首帧 + 参考素材」，原厂直接拒绝。

典型报错如下，提交任务时直接返回 400，不会创建任务，也不计费：

```text theme={null}
The parameter `content` specified in the request is not valid:
first/last frame content cannot be mixed with reference media content.
```

**改法**：用 Seedance 原生端点 `POST /seedance/api/v3/contents/generations/tasks` 提交，给图片写 `"role": "reference_image"`、视频写 `"role": "reference_video"`；视频用公网可直接下载的 URL，或先入库再用 `asset://` 素材 ID 引用。

## 一个真实案例

一位客户在自己搭的本地创作工具里，传了一张角色图和一段视频，勾选了「全能参考」，没勾「首尾帧」，提示词里还专门写了「图一不是首帧、不开首尾帧模式」，结果每次都报上面的错。

我们在网关侧抓到了这次请求的原文（图片 Base64 已截断）：

```json theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "把视频1中的人物换成图1中的人物……（图一不是首帧）……不开首尾帧模式",
  "duration": 14,
  "ratio": "9:16",
  "resolution": "720p",
  "images": ["data:image/jpeg;base64,/9j/4AAQ..."],
  "videos": ["/assets/input/ai_ref_xxxx.mp4"]
}
```

这个请求有两处问题，任何一处都会导致失败：

| 问题 | 说明 |
| - | - |
| **图片没有 `role`** | 请求发到了通用视频端点 `/v2/videos/generations`，只有 `images` 和 `videos` 两个数组，没有任何字段能表达「这是参考图」。单张图按规则就是首帧，和参考视频冲突。工具里的「全能参考」开关没有写进请求，提示词里的说明对参数校验也不起作用 |
| **视频是本机路径** | `/assets/input/ai_ref_xxxx.mp4` 是客户电脑上工具的本地路径，原厂服务器访问不到。就算首帧问题解决了，这个视频也送不到模型那里 |

这位客户的浏览器控制台里，同一个 mp4 还有 `415 Unsupported Media Type` 报错，来自工具自己的本地预览接口（`localhost` 上的 `/api/media-preview/...`）。这说明工具没能把这段视频处理成可用的地址，最后把本地路径原样塞进了请求。

## 不要用通用视频端点提交 Seedance

`/v2/videos/generations`（以及 `/v1/videos`、`/v1/video/generations`）是网关的通用视频端点，字段是几家视频模型的最大公约数，**表达不了 Seedance 的输入模式**：

* **没有 `role`**：分不清首帧、首尾帧和多模态参考，一图一视频这种组合一定会被当成「首帧 + 参考」
* **分辨率透传不完整**：实测 2.5 请求 480p 会按 720p 出片、2.0 系请求 1080p 会按 720p 出片，而计费按实际出片结算
* **2.5 独有的参数**（`omni_reference_task_type`、`output_format` 等）没有对应字段

所以 Seedance 任务**一律走原生端点**：

| 步骤 | 端点 |
| - | - |
| 提交任务 | `POST /seedance/api/v3/contents/generations/tasks` |
| 查询任务 | `GET /seedance/api/v3/contents/generations/tasks/{id}` |

如果你用的是第三方工具，找一找它的 Seedance 通道能不能选「原生 / 火山方舟」格式；只提供通用视频接口的工具，做不了带参考视频的任务。

## 正确写法：每个素材都写 role

```python theme={null}
import os, requests

BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
headers = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}

body = {
    "model": "doubao-seedance-2-0-260128",
    "content": [
        {"type": "text", "text": "把 @视频1 中的人物换成 @图像1 中的角色，动作、表情和背景音乐保持不变"},
        {"type": "image_url", "image_url": {"url": "https://cdn.example.com/character.png"},
         "role": "reference_image"},
        {"type": "video_url", "video_url": {"url": "https://cdn.example.com/source.mp4"},
         "role": "reference_video"},
    ],
    "resolution": "720p",
    "ratio": "9:16",
    "duration": 10,
}

r = requests.post(BASE, headers=headers, json=body, timeout=60)
print(r.status_code, r.json())   # 成功返回 {"id": "cgt-..."}，拿 id 去轮询
```

要点：

* **三种输入模式互斥**：首尾帧（2 张图，`first_frame` / `last_frame`）、首帧（1 张图）、多模态参考（`reference_image` / `reference_video` / `reference_audio`）。只要带了参考视频或参考音频，所有图片都必须写 `reference_image`
* **不写 `role` 就是首帧**：单张图不写 `role`，等同于 `first_frame`
* 提示词里用 `@图像1`、`@视频1` 按传入顺序指代素材
* 参考素材数量：2.0 系最多 9 图 + 3 视频 + 3 音频，2.5 最多 30 图 + 10 视频 + 10 音频

## 参考视频怎么传

原厂是在**自己的服务器上**下载素材的，所以视频必须是原厂能直接访问到的地址。

| 传法 | 能不能用 | 说明 |
| - | - | - |
| **公网直链**（首选） | ✅ | 放在对象存储或 CDN 上（OSS、S3、R2、TOS 等），无需登录、Cookie 或额外请求头，有效期覆盖到任务完成 |
| **素材 ID** `asset://...` | ✅ | 同一段视频要反复用、或含真人出镜时用。入库要求 mp4 / mov、2–15 秒、少于 50MB，见 [素材库](/api-capabilities/seedance2/asset-library) |
| **Base64** | ⚠️ 不建议 | 视频体积比图片大一个量级，内联进请求体最容易把提交拖到超时，见 [素材优先实践](/api-capabilities/seedance2/asset-first-workflow) |
| 本机路径（`/assets/...`、`C:\...`、`file://...`） | ❌ | 原厂访问不到你电脑上的文件 |
| 内网地址（`localhost`、`127.0.0.1`、`192.168.x.x`） | ❌ | 同上 |
| 需要登录才能下载的链接 | ❌ | 原厂抓取时不会带你的登录态 |

提交前可以在任意一台能上网的机器上自查（把 `<URL>` 换成你的视频链接）：

```bash theme={null}
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'
```

应返回 `code=200`，`type` 是 `video/mp4` 或 `video/quicktime`，`size` 与原文件一致。返回 HTML、JSON 或 4xx 都说明这个链接给不了原厂。图片链接的完整自查方法见 [图片链接能打开却报格式错误](/faq/seedance-image-url-invalid-format)。

## 相关文档

<CardGroup cols={2}>
  <Card title="视频生成接口" icon="video" href="/api-capabilities/seedance2/video-generation">
    原生端点、各输入模式的 content 组合与 role 取值
  </Card>

  <Card title="素材优先实践" icon="gauge" href="/api-capabilities/seedance2/asset-first-workflow">
    参考视频为什么别用 Base64，以及入库拿素材 ID 的步骤
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.