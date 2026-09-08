> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 素材引用生影片實戰

> Seedance 2.0 素材引用端到端程式碼指引：本地圖片上傳入庫拿 asset:// 素材 ID，引用生成人物一致性影片，輪詢下載全鏈路可複製執行，含 Python / cURL / Node.js 完整指令碼。

<Info>
  本頁聚焦**程式碼鏈路**：把一張本地圖片變成 `asset://` 素材 ID，再引用它生成人物一致性影片，一個指令碼跑通。素材庫各介面的逐個說明、網頁零程式碼操作見 [素材庫](/zh-Hant/api-capabilities/seedance2/asset-library)，生成介面的完整參數列見 [影片生成 API](/zh-Hant/api-capabilities/seedance2/video-generation)。

  素材庫隨 Seedance 2.0 介面**免費使用，不另收年費**（官方側對非框架簽約客戶需十萬元量級的年費單獨採購）。
</Info>

## 什麼時候需要素材引用

Seedance 2.0 生成「人物一致性」影片時，**不能直接上傳含寫實人臉的參考圖**（防深偽攔截）。需要先把人像入庫成可信素材，拿到 `asset://xxx` 素材 ID，再在生成請求裡引用——同一角色跨集、跨鏡頭保持臉部與服裝一致。先對號入座：

| 素材型別           | 例子             | 怎麼用                                                                |
| -------------- | -------------- | ------------------------------------------------------------------ |
| 動漫 / 風格化角色     | 二次元、卡通、3D 卡通角色 | 不含寫實人臉，一般不觸發攔截：直接用公網 URL / Base64 作參考圖，**無需入庫**，本頁流程從「第 4 步生成」開始即可 |
| 虛擬人（AI 生成寫實人像） | 模型生成、現實中無此人    | 走「虛擬人像入庫」（本頁完整流程），拿 `asset://` ID 引用                               |
| 真人人臉           | 藝人、模特、使用者本人的照片 | 先走「真人認證」全自動 API 流程拿真人素材組，入庫時帶上該組 `groupId`，其餘程式碼與本頁完全一致            |

## 前置條件

<Warning>
  **兩把鑰匙，不要混用**：

  * **素材庫 KEY**（icover.ai「設定 → 素材庫 KEY」建立，`sk-...`）：用於上傳 / 入庫 / 查詢素材，建立方法見 [素材庫第 0 步](/zh-Hant/api-capabilities/seedance2/asset-library)。
  * **APIYI Seedance 影片令牌**（api.apiyi.com 建立，`sk-...`，須勾選 `SeeDance2` 分組，2.5 與 2.0 系通用）：用於影片生成介面。
</Warning>

## 鏈路總覽

本地圖片 → ① `presign` 申請直傳地址並 `PUT` 上傳，拿公網 URL → ② 素材入庫，拿 asset Id → ③ 輪詢到 `Active`（單圖約 13 秒）→ ④ 生成請求裡引用 `asset://<Id>`，提示詞用「圖片1」指代 → ⑤ 輪詢任務到 `succeeded` → ⑥ 下載 `content.video_url`（簽名直鏈 **24 小時過期**，立即轉存）。

已有公網圖片 URL 的可跳過 ①；素材 ID 永久有效，入庫一次即可反覆引用。

## 完整程式碼

<CodeGroup>
  ```python Python（端到端：上傳 → 入庫 → 出片 → 下載） theme={null}
  import time
  from pathlib import Path

  import requests

  ASSET_KEY = "sk-你的素材庫KEY"    # icover.ai「設定 → 素材庫 KEY」
  APIYI_KEY = "sk-你的APIYI令牌"    # api.apiyi.com，令牌勾 SeeDance2 分組
  IMAGE_PATH = "portrait.jpg"       # 本地參考圖（虛擬人像）
  PROMPT = "圖片1中的人物正面微笑，鏡頭緩慢推近，自然光"

  ICOVER = "https://icover.ai/api"
  SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  ASSET_HEADERS = {"Authorization": f"Bearer {ASSET_KEY}"}
  APIYI_HEADERS = {
      "Authorization": f"Bearer {APIYI_KEY}",
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",  # 必加：規避閘道 gzip 頭與實際編碼不符
  }


  def upload_image(path: str) -> str:
      """① presign + PUT 上傳本地圖片，返回公網 URL（已有公網 URL 可跳過）"""
      ext = Path(path).suffix.lstrip(".").lower() or "jpg"
      content_type = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"
      data = requests.post(
          f"{ICOVER}/storage/presign", headers=ASSET_HEADERS,
          json={"ext": ext, "contentType": content_type}, timeout=30,
      ).json()["data"]
      resp = requests.put(
          data["uploadUrl"], data=Path(path).read_bytes(),
          headers={"Content-Type": content_type}, timeout=120,  # 與 presign 一致
      )
      resp.raise_for_status()
      return data["publicUrl"]


  def ingest_asset(image_url: str, label: str = "", group_id: str = None) -> str:
      """② 素材入庫，返回 asset Id。真人素材：帶上真人認證拿到的 group_id"""
      body = {"imageUrl": image_url, "label": label}
      if group_id:
          body["groupId"] = group_id
      r = requests.post(
          f"{ICOVER}/asset-library/assets", headers=ASSET_HEADERS,
          json=body, timeout=60,
      ).json()
      return r["Result"]["Id"]


  def wait_asset_active(asset_id: str, timeout: int = 90) -> None:
      """③ 輪詢入庫狀態到 Active（單圖約 13 秒，無 SLA）"""
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
              raise RuntimeError("素材入庫失敗：檢查格式 / 寬高比 0.4-2.5 / 邊長 300-6000px 後重傳")
          time.sleep(3)
      raise TimeoutError("90 秒未 Active，請排查後重試")


  def create_video_task(asset_id: str) -> str:
      """④ 引用 asset:// 建立生成任務。提示詞用「圖片1」指代，不要寫 asset ID 原文"""
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
      """⑤ 輪詢任務到終態（succeeded / failed / expired）"""
      while True:
          time.sleep(20)
          task = requests.get(f"{SEEDANCE}/{task_id}", headers=APIYI_HEADERS, timeout=30).json()
          print("task status:", task.get("status"))
          if task.get("status") in ("succeeded", "failed", "expired"):
              return task


  def download(task: dict, out: str) -> None:
      """⑥ 下載影片。直鏈 24 小時過期，立即轉存；下載不要帶 Authorization 頭"""
      with requests.get(task["content"]["video_url"], stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(out, "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print("已儲存", out)


  if __name__ == "__main__":
      public_url = upload_image(IMAGE_PATH)
      asset_id = ingest_asset(public_url, label="角色A-正面")
      print("素材 ID:", f"asset://{asset_id}")
      wait_asset_active(asset_id)

      task_id = create_video_task(asset_id)
      print("task_id:", task_id)
      task = wait_video(task_id)
      if task["status"] == "succeeded":
          print("計費 tokens:", task["usage"]["completion_tokens"])
          download(task, f"{task_id}.mp4")
      else:
          print("任務未成功:", task.get("error"))
  ```

  ```bash cURL（分步） theme={null}
  # ① 申請直傳地址（已有公網圖片 URL 可跳過 ①②）
  curl -X POST https://icover.ai/api/storage/presign \
    -H "Authorization: Bearer sk-你的素材庫KEY" \
    -H "Content-Type: application/json" \
    -d '{"ext":"jpg","contentType":"image/jpeg"}'
  # → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

  # ② PUT 上傳檔案（Content-Type 要和申請時一致），成功後 publicUrl 即公網地址
  curl -X PUT "剛才返回的uploadUrl" \
    -H "Content-Type: image/jpeg" \
    --data-binary @portrait.jpg

  # ③ 素材入庫（真人素材加 "groupId":"真人認證拿到的組ID"）
  curl -X POST https://icover.ai/api/asset-library/assets \
    -H "Authorization: Bearer sk-你的素材庫KEY" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://cdn.icover.ai/uploads/seedance/xxx.jpg","label":"角色A-正面"}'
  # → { ..., "Result": { "Id": "asset-2026xxxx-xxxxx" } }

  # ④ 每 3 秒查一次，Result.Status == "Active" 即可用
  curl https://icover.ai/api/asset-library/assets/asset-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-你的素材庫KEY"

  # ⑤ 引用 asset:// 建立生成任務（換成 APIYI 令牌！提示詞用「圖片1」指代素材）
  curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
    -H "Authorization: Bearer sk-你的APIYI令牌" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-260128",
      "content": [
        {"type":"text","text":"圖片1中的人物正面微笑，鏡頭緩慢推近，自然光"},
        {"type":"image_url","image_url":{"url":"asset://asset-2026xxxx-xxxxx"},"role":"reference_image"}
      ],
      "resolution":"720p","ratio":"16:9","duration":5
    }'
  # → {"id":"cgt-2026xxxx-xxxxx"}

  # ⑥ 每 20 秒查一次，status=succeeded 後下載 content.video_url（24 小時過期）
  curl https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-你的APIYI令牌"
  ```

  ```javascript Node.js（端到端） theme={null}
  import { readFileSync, writeFileSync } from "node:fs";

  const ASSET_KEY = "sk-你的素材庫KEY";   // icover.ai「設定 → 素材庫 KEY」
  const APIYI_KEY = "sk-你的APIYI令牌";   // api.apiyi.com，令牌勾 SeeDance2 分組
  const IMAGE_PATH = "portrait.jpg";

  const ICOVER = "https://icover.ai/api";
  const SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const AH = { Authorization: `Bearer ${ASSET_KEY}`, "Content-Type": "application/json" };
  const VH = { Authorization: `Bearer ${APIYI_KEY}`, "Content-Type": "application/json" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ① presign + PUT 上傳本地圖片，拿公網 URL
  const { data } = await fetch(`${ICOVER}/storage/presign`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ ext: "jpg", contentType: "image/jpeg" }),
  }).then((r) => r.json());
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: readFileSync(IMAGE_PATH),
  });

  // ② 素材入庫（真人素材：body 里加 groupId）
  const ingest = await fetch(`${ICOVER}/asset-library/assets`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ imageUrl: data.publicUrl, label: "角色A-正面" }),
  }).then((r) => r.json());
  const assetId = ingest.Result.Id;
  console.log("素材 ID:", `asset://${assetId}`);

  // ③ 輪詢到 Active（約 13 秒）
  let assetStatus;
  do {
    await sleep(3000);
    const info = await fetch(`${ICOVER}/asset-library/assets/${assetId}`, { headers: AH })
      .then((r) => r.json());
    assetStatus = info.Result.Status;
    console.log("asset status:", assetStatus);
  } while (assetStatus !== "Active" && assetStatus !== "Failed");
  if (assetStatus === "Failed") throw new Error("素材入庫失敗，請檢查圖片後重傳");

  // ④ 引用 asset:// 建立生成任務（提示詞用「圖片1」指代，不要寫 asset ID 原文）
  const { id } = await fetch(SEEDANCE, {
    method: "POST", headers: VH,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-260128",
      content: [
        { type: "text", text: "圖片1中的人物正面微笑，鏡頭緩慢推近，自然光" },
        { type: "image_url", image_url: { url: `asset://${assetId}` }, role: "reference_image" },
      ],
      resolution: "720p", ratio: "16:9", duration: 5,
    }),
  }).then((r) => r.json());
  console.log("task_id:", id);

  // ⑤ 輪詢任務到終態
  let task;
  do {
    await sleep(20000);
    task = await fetch(`${SEEDANCE}/${id}`, { headers: VH }).then((r) => r.json());
    console.log("task status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // ⑥ 下載（直鏈 24 小時過期，立即轉存；下載不帶 Authorization 頭）
  if (task.status === "succeeded") {
    const buf = Buffer.from(await fetch(task.content.video_url).then((r) => r.arrayBuffer()));
    writeFileSync(`${id}.mp4`, buf);
    console.log(`已儲存 ${id}.mp4`);
  } else {
    console.log("任務未成功:", task.error);
  }
  ```
</CodeGroup>

<Warning>
  提示詞裡用「圖片1」「圖片2」指代素材（按 `content` 陣列順序對應），**不要寫 asset ID 原文**。
</Warning>

## 多素材進階用法

* **多張參考圖**：`content` 裡放多個 `image_url`（0–9 張，`role` 均為 `reference_image`），提示詞用「圖片1」「圖片2」按順序指代。同一人物建議「全身正面 + 人臉正面無表情特寫」兩張一起引用，一致性最好。
* **混用來源**：`asset://` 素材 ID、公網 URL、Base64（`data:image/png;base64,...`）可以在同一個 `content` 裡混用——只有含寫實人臉的圖必須走 `asset://`。
* **參考影片 / 音訊**：還可加 0–3 個 `video_url`（`role: "reference_video"`）與 0–3 個 `audio_url`（`role: "reference_audio"`），至少要有 1 圖或 1 影片；音訊需與圖片或影片一起傳。
* **真人素材**：先按 [真人認證全自動流程](/zh-Hant/api-capabilities/seedance2/asset-library) 讓藝人完成活體認證、拿到專屬真人素材組 `GroupId`，入庫時帶上 `groupId` 即可；生成側程式碼與本頁完全一致。

## 常見報錯速查

| 報錯 / 現象                                    | 原因                                              | 處理                                          |
| ------------------------------------------ | ----------------------------------------------- | ------------------------------------------- |
| 400 `The specified asset ... is not found` | `asset://` 不在 APIYI 通道對應的賬號下（如在其他渠道商入庫），或 ID 寫錯 | 按本頁流程在 icover.ai 重新入庫；核對素材 ID               |
| 「該模型無可用渠道」                                 | APIYI 令牌未勾選 `SeeDance2` 分組                      | 到 api.apiyi.com 令牌設定勾選後重試                   |
| Python 報 gzip 解碼錯誤 / 返回 JSON 缺頭不完整         | 閘道 gzip 響應頭與實際編碼不符                              | 請求頭加 `"Accept-Encoding": "identity"`（指令碼已帶） |
| 素材狀態 `Failed`                              | 圖片格式 / 尺寸不合規                                    | 寬高比 0.4–2.5、邊長 300–6000px、少於 30MB，修圖後重傳     |
| 直接傳人臉圖被拒                                   | 寫實人臉不能作直接參考圖（防深偽攔截）                             | 先入庫拿 `asset://` 再引用；真人照片須先完成真人認證            |
| `PUBLIC_` 字首錯誤                             | 上游官方內容稽核攔截（該次不計費）                               | 調整素材 / 提示詞後直接重試                             |

## 相關頁面

<CardGroup cols={3}>
  <Card title="Seedance 2.0 概覽" icon="sparkles" href="/zh-Hant/api-capabilities/seedance2/overview">
    模型選型、定價、解析度畫素表與 FAQ
  </Card>

  <Card title="影片生成 API" icon="video" href="/zh-Hant/api-capabilities/seedance2/video-generation">
    完整參數列、四種生成模式與響應格式
  </Card>

  <Card title="素材庫" icon="images" href="/zh-Hant/api-capabilities/seedance2/asset-library">
    素材庫全部介面、網頁零程式碼操作與真人認證
  </Card>

  <Card title="素材優先實踐" icon="gauge" href="/zh-Hant/api-capabilities/seedance2/asset-first-workflow">
    為什麼素材 ID 比內聯圖片更快更穩，以及提交超時怎麼處理
  </Card>
</CardGroup>
