> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 素材引用生视频实战

> Seedance 2.0 素材引用端到端代码指引：本地图片上传入库拿 asset:// 素材 ID，引用生成人物一致性视频，轮询下载全链路可复制运行，含 Python / cURL / Node.js 完整脚本。

<Info>
  本页聚焦**代码链路**：把一张本地图片变成 `asset://` 素材 ID，再引用它生成人物一致性视频，一个脚本跑通。素材库各接口的逐个说明、网页零代码操作见 [素材库](/api-capabilities/seedance2/asset-library)，生成接口的完整参数表见 [视频生成 API](/api-capabilities/seedance2/video-generation)。

  素材库随 Seedance 2.0 接口**免费使用，不另收年费**（官方侧对非框架签约客户需十万元量级的年费单独采购）。
</Info>

## 什么时候需要素材引用

Seedance 2.0 生成「人物一致性」视频时，**不能直接上传含写实人脸的参考图**（防深伪拦截）。需要先把人像入库成可信素材，拿到 `asset://xxx` 素材 ID，再在生成请求里引用——同一角色跨集、跨镜头保持脸部与服装一致。先对号入座：

| 素材类型           | 例子             | 怎么用                                                                |
| -------------- | -------------- | ------------------------------------------------------------------ |
| 动漫 / 风格化角色     | 二次元、卡通、3D 卡通角色 | 不含写实人脸，一般不触发拦截：直接用公网 URL / Base64 作参考图，**无需入库**，本页流程从「第 4 步生成」开始即可 |
| 虚拟人（AI 生成写实人像） | 模型生成、现实中无此人    | 走「虚拟人像入库」（本页完整流程），拿 `asset://` ID 引用                               |
| 真人人脸           | 艺人、模特、用户本人的照片  | 先走「真人认证」全自动 API 流程拿真人素材组，入库时带上该组 `groupId`，其余代码与本页完全一致             |

## 前置条件

<Warning>
  **两把钥匙，不要混用**：

  * **素材库 KEY**（icover.ai「设置 → 素材库 KEY」创建，`sk-...`）：用于上传 / 入库 / 查询素材，创建方法见 [素材库第 0 步](/api-capabilities/seedance2/asset-library)。
  * **APIYI Seedance 视频令牌**（api.apiyi.com 创建，`sk-...`，须勾选 `SeeDance2` 分组，2.5 与 2.0 系通用）：用于视频生成接口。
</Warning>

## 链路总览

本地图片 → ① `presign` 申请直传地址并 `PUT` 上传，拿公网 URL → ② 素材入库，拿 asset Id → ③ 轮询到 `Active`（单图约 13 秒）→ ④ 生成请求里引用 `asset://<Id>`，提示词用「图片1」指代 → ⑤ 轮询任务到 `succeeded` → ⑥ 下载 `content.video_url`（签名直链 **24 小时过期**，立即转存）。

已有公网图片 URL 的可跳过 ①；素材 ID 永久有效，入库一次即可反复引用。

## 完整代码

<CodeGroup>
  ```python Python（端到端：上传 → 入库 → 出片 → 下载） theme={null}
  import time
  from pathlib import Path

  import requests

  ASSET_KEY = "sk-你的素材库KEY"    # icover.ai「设置 → 素材库 KEY」
  APIYI_KEY = "sk-你的APIYI令牌"    # api.apiyi.com，令牌勾 SeeDance2 分组
  IMAGE_PATH = "portrait.jpg"       # 本地参考图（虚拟人像）
  PROMPT = "图片1中的人物正面微笑，镜头缓慢推近，自然光"

  ICOVER = "https://icover.ai/api"
  SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  ASSET_HEADERS = {"Authorization": f"Bearer {ASSET_KEY}"}
  APIYI_HEADERS = {
      "Authorization": f"Bearer {APIYI_KEY}",
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",  # 必加：规避网关 gzip 头与实际编码不符
  }


  def upload_image(path: str) -> str:
      """① presign + PUT 上传本地图片，返回公网 URL（已有公网 URL 可跳过）"""
      ext = Path(path).suffix.lstrip(".").lower() or "jpg"
      content_type = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"
      data = requests.post(
          f"{ICOVER}/storage/presign", headers=ASSET_HEADERS,
          json={"ext": ext, "contentType": content_type}, timeout=30,
      ).json()["data"]
      resp = requests.put(
          data["uploadUrl"], data=Path(path).read_bytes(),
          headers={"Content-Type": content_type}, timeout=120,  # 与 presign 一致
      )
      resp.raise_for_status()
      return data["publicUrl"]


  def ingest_asset(image_url: str, label: str = "", group_id: str = None) -> str:
      """② 素材入库，返回 asset Id。真人素材：带上真人认证拿到的 group_id"""
      body = {"imageUrl": image_url, "label": label}
      if group_id:
          body["groupId"] = group_id
      r = requests.post(
          f"{ICOVER}/asset-library/assets", headers=ASSET_HEADERS,
          json=body, timeout=60,
      ).json()
      return r["Result"]["Id"]


  def wait_asset_active(asset_id: str, timeout: int = 90) -> None:
      """③ 轮询入库状态到 Active（单图约 13 秒，无 SLA）"""
      deadline = time.time() + timeout
      while time.time() < deadline:
          status = requests.get(
              f"{ICOVER}/asset-library/assets/{asset_id}",
              headers=ASSET_HEADERS, timeout=30,
          ).json()["Result"]["Status"]
          print("asset status:", status)
          if status == "Active":
              return
          if status == "Failed":
              raise RuntimeError("素材入库失败：检查格式 / 宽高比 0.4-2.5 / 边长 300-6000px 后重传")
          time.sleep(3)
      raise TimeoutError("90 秒未 Active，请排查后重试")


  def create_video_task(asset_id: str) -> str:
      """④ 引用 asset:// 创建生成任务。提示词用「图片1」指代，不要写 asset ID 原文"""
      body = {
          "model": "doubao-seedance-2-0-260128",
          "content": [
              {"type": "text", "text": PROMPT},
              {"type": "image_url",
               "image_url": {"url": f"asset://{asset_id}"},
               "role": "reference_image"},
          ],
          "resolution": "720p", "ratio": "16:9", "duration": 5,
      }
      return requests.post(SEEDANCE, headers=APIYI_HEADERS, json=body, timeout=60).json()["id"]


  def wait_video(task_id: str) -> dict:
      """⑤ 轮询任务到终态（succeeded / failed / expired）"""
      while True:
          time.sleep(20)
          task = requests.get(f"{SEEDANCE}/{task_id}", headers=APIYI_HEADERS, timeout=30).json()
          print("task status:", task.get("status"))
          if task.get("status") in ("succeeded", "failed", "expired"):
              return task


  def download(task: dict, out: str) -> None:
      """⑥ 下载视频。直链 24 小时过期，立即转存；下载不要带 Authorization 头"""
      with requests.get(task["content"]["video_url"], stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(out, "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print("已保存", out)


  if __name__ == "__main__":
      public_url = upload_image(IMAGE_PATH)
      asset_id = ingest_asset(public_url, label="角色A-正面")
      print("素材 ID:", f"asset://{asset_id}")
      wait_asset_active(asset_id)

      task_id = create_video_task(asset_id)
      print("task_id:", task_id)
      task = wait_video(task_id)
      if task["status"] == "succeeded":
          print("计费 tokens:", task["usage"]["completion_tokens"])
          download(task, f"{task_id}.mp4")
      else:
          print("任务未成功:", task.get("error"))
  ```

  ```bash cURL（分步） theme={null}
  # ① 申请直传地址（已有公网图片 URL 可跳过 ①②）
  curl -X POST https://icover.ai/api/storage/presign \
    -H "Authorization: Bearer sk-你的素材库KEY" \
    -H "Content-Type: application/json" \
    -d '{"ext":"jpg","contentType":"image/jpeg"}'
  # → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

  # ② PUT 上传文件（Content-Type 要和申请时一致），成功后 publicUrl 即公网地址
  curl -X PUT "刚才返回的uploadUrl" \
    -H "Content-Type: image/jpeg" \
    --data-binary @portrait.jpg

  # ③ 素材入库（真人素材加 "groupId":"真人认证拿到的组ID"）
  curl -X POST https://icover.ai/api/asset-library/assets \
    -H "Authorization: Bearer sk-你的素材库KEY" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://cdn.icover.ai/uploads/seedance/xxx.jpg","label":"角色A-正面"}'
  # → { ..., "Result": { "Id": "asset-2026xxxx-xxxxx" } }

  # ④ 每 3 秒查一次，Result.Status == "Active" 即可用
  curl https://icover.ai/api/asset-library/assets/asset-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-你的素材库KEY"

  # ⑤ 引用 asset:// 创建生成任务（换成 APIYI 令牌！提示词用「图片1」指代素材）
  curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
    -H "Authorization: Bearer sk-你的APIYI令牌" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-260128",
      "content": [
        {"type":"text","text":"图片1中的人物正面微笑，镜头缓慢推近，自然光"},
        {"type":"image_url","image_url":{"url":"asset://asset-2026xxxx-xxxxx"},"role":"reference_image"}
      ],
      "resolution":"720p","ratio":"16:9","duration":5
    }'
  # → {"id":"cgt-2026xxxx-xxxxx"}

  # ⑥ 每 20 秒查一次，status=succeeded 后下载 content.video_url（24 小时过期）
  curl https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-你的APIYI令牌"
  ```

  ```javascript Node.js（端到端） theme={null}
  import { readFileSync, writeFileSync } from "node:fs";

  const ASSET_KEY = "sk-你的素材库KEY";   // icover.ai「设置 → 素材库 KEY」
  const APIYI_KEY = "sk-你的APIYI令牌";   // api.apiyi.com，令牌勾 SeeDance2 分组
  const IMAGE_PATH = "portrait.jpg";

  const ICOVER = "https://icover.ai/api";
  const SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const AH = { Authorization: `Bearer ${ASSET_KEY}`, "Content-Type": "application/json" };
  const VH = { Authorization: `Bearer ${APIYI_KEY}`, "Content-Type": "application/json" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ① presign + PUT 上传本地图片，拿公网 URL
  const { data } = await fetch(`${ICOVER}/storage/presign`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ ext: "jpg", contentType: "image/jpeg" }),
  }).then((r) => r.json());
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: readFileSync(IMAGE_PATH),
  });

  // ② 素材入库（真人素材：body 里加 groupId）
  const ingest = await fetch(`${ICOVER}/asset-library/assets`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ imageUrl: data.publicUrl, label: "角色A-正面" }),
  }).then((r) => r.json());
  const assetId = ingest.Result.Id;
  console.log("素材 ID:", `asset://${assetId}`);

  // ③ 轮询到 Active（约 13 秒）
  let assetStatus;
  do {
    await sleep(3000);
    const info = await fetch(`${ICOVER}/asset-library/assets/${assetId}`, { headers: AH })
      .then((r) => r.json());
    assetStatus = info.Result.Status;
    console.log("asset status:", assetStatus);
  } while (assetStatus !== "Active" && assetStatus !== "Failed");
  if (assetStatus === "Failed") throw new Error("素材入库失败，请检查图片后重传");

  // ④ 引用 asset:// 创建生成任务（提示词用「图片1」指代，不要写 asset ID 原文）
  const { id } = await fetch(SEEDANCE, {
    method: "POST", headers: VH,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-260128",
      content: [
        { type: "text", text: "图片1中的人物正面微笑，镜头缓慢推近，自然光" },
        { type: "image_url", image_url: { url: `asset://${assetId}` }, role: "reference_image" },
      ],
      resolution: "720p", ratio: "16:9", duration: 5,
    }),
  }).then((r) => r.json());
  console.log("task_id:", id);

  // ⑤ 轮询任务到终态
  let task;
  do {
    await sleep(20000);
    task = await fetch(`${SEEDANCE}/${id}`, { headers: VH }).then((r) => r.json());
    console.log("task status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // ⑥ 下载（直链 24 小时过期，立即转存；下载不带 Authorization 头）
  if (task.status === "succeeded") {
    const buf = Buffer.from(await fetch(task.content.video_url).then((r) => r.arrayBuffer()));
    writeFileSync(`${id}.mp4`, buf);
    console.log(`已保存 ${id}.mp4`);
  } else {
    console.log("任务未成功:", task.error);
  }
  ```
</CodeGroup>

<Warning>
  提示词里用「图片1」「图片2」指代素材（按 `content` 数组顺序对应），**不要写 asset ID 原文**。
</Warning>

## 多素材进阶用法

* **多张参考图**：`content` 里放多个 `image_url`（0–9 张，`role` 均为 `reference_image`），提示词用「图片1」「图片2」按顺序指代。同一人物建议「全身正面 + 人脸正面无表情特写」两张一起引用，一致性最好。
* **混用来源**：`asset://` 素材 ID、公网 URL、Base64（`data:image/png;base64,...`）可以在同一个 `content` 里混用——只有含写实人脸的图必须走 `asset://`。
* **参考视频 / 音频**：还可加 0–3 个 `video_url`（`role: "reference_video"`）与 0–3 个 `audio_url`（`role: "reference_audio"`），至少要有 1 图或 1 视频；音频需与图片或视频一起传。
* **真人素材**：先按 [真人认证全自动流程](/api-capabilities/seedance2/asset-library) 让艺人完成活体认证、拿到专属真人素材组 `GroupId`，入库时带上 `groupId` 即可；生成侧代码与本页完全一致。

## 常见报错速查

| 报错 / 现象                                    | 原因                                              | 处理                                         |
| ------------------------------------------ | ----------------------------------------------- | ------------------------------------------ |
| 400 `The specified asset ... is not found` | `asset://` 不在 APIYI 通道对应的账号下（如在其他渠道商入库），或 ID 写错 | 按本页流程在 icover.ai 重新入库；核对素材 ID              |
| 「该模型无可用渠道」                                 | APIYI 令牌未勾选 `SeeDance2` 分组                      | 到 api.apiyi.com 令牌设置勾选后重试                  |
| Python 报 gzip 解码错误 / 返回 JSON 缺头不完整         | 网关 gzip 响应头与实际编码不符                              | 请求头加 `"Accept-Encoding": "identity"`（脚本已带） |
| 素材状态 `Failed`                              | 图片格式 / 尺寸不合规                                    | 宽高比 0.4–2.5、边长 300–6000px、少于 30MB，修图后重传    |
| 直接传人脸图被拒                                   | 写实人脸不能作直接参考图（防深伪拦截）                             | 先入库拿 `asset://` 再引用；真人照片须先完成真人认证           |
| `PUBLIC_` 前缀错误                             | 上游官方内容审核拦截（该次不计费）                               | 调整素材 / 提示词后直接重试                            |

## 相关页面

<CardGroup cols={3}>
  <Card title="Seedance 2.0 概览" icon="sparkles" href="/api-capabilities/seedance2/overview">
    模型选型、定价、分辨率像素表与 FAQ
  </Card>

  <Card title="视频生成 API" icon="video" href="/api-capabilities/seedance2/video-generation">
    完整参数表、四种生成模式与响应格式
  </Card>

  <Card title="素材库" icon="images" href="/api-capabilities/seedance2/asset-library">
    素材库全部接口、网页零代码操作与真人认证
  </Card>

  <Card title="素材优先实践" icon="gauge" href="/api-capabilities/seedance2/asset-first-workflow">
    为什么素材 ID 比内联图片更快更稳，以及提交超时怎么处理
  </Card>
</CardGroup>
