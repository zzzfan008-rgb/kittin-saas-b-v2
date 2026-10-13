> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 沒開首尾幀，Seedance 卻報首尾幀不能和參考素材混用？

> 提交 Seedance 任務返回 400：first/last frame content cannot be mixed with reference media content。原因是請求裡的圖片沒有寫 role，按規則被當成了首幀，再加上參考影片就衝突了。多見於用通用影片端點 /v2/videos/generations 提交的第三方工具。本頁說明怎麼改成原生端點、怎麼寫 role，以及參考影片該怎麼傳。

## 簡短回答

**Seedance 只看請求裡每個素材的 `role`，不看你工具裡勾了什麼開關，也不看提示詞。** 圖片沒寫 `role` 時，一張圖會按「首幀圖生影片」處理；這時再帶上參考影片，就成了「首幀 + 參考素材」，原廠直接拒絕。

典型報錯如下，提交任務時直接返回 400，不會建立任務，也不計費：

```text theme={null}
The parameter `content` specified in the request is not valid:
first/last frame content cannot be mixed with reference media content.
```

**改法**：用 Seedance 原生端點 `POST /seedance/api/v3/contents/generations/tasks` 提交，給圖片寫 `"role": "reference_image"`、影片寫 `"role": "reference_video"`；影片用公網可直接下載的 URL，或先入庫再用 `asset://` 素材 ID 引用。

## 一個真實案例

一位客戶在自己搭的本地創作工具裡，傳了一張角色圖和一段影片，勾選了「全能參考」，沒勾「首尾幀」，提示詞裡還專門寫了「圖一不是首幀、不開首尾幀模式」，結果每次都報上面的錯。

我們在閘道側抓到了這次請求的原文（圖片 Base64 已截斷）：

```json theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "把影片1中的人物換成圖1中的人物……（圖一不是首幀）……不開首尾幀模式",
  "duration": 14,
  "ratio": "9:16",
  "resolution": "720p",
  "images": ["data:image/jpeg;base64,/9j/4AAQ..."],
  "videos": ["/assets/input/ai_ref_xxxx.mp4"]
}
```

這個請求有兩處問題，任何一處都會導致失敗：

| 問題 | 說明 |
| - | - |
| **圖片沒有 `role`** | 請求發到了通用影片端點 `/v2/videos/generations`，只有 `images` 和 `videos` 兩個陣列，沒有任何欄位能表達「這是參考圖」。單張圖按規則就是首幀，和參考影片衝突。工具裡的「全能參考」開關沒有寫進請求，提示詞裡的說明對引數校驗也不起作用 |
| **影片是本機路徑** | `/assets/input/ai_ref_xxxx.mp4` 是客戶電腦上工具的本地路徑，原廠伺服器訪問不到。就算首幀問題解決了，這個影片也送不到模型那裡 |

這位客戶的瀏覽器控制台裡，同一個 mp4 還有 `415 Unsupported Media Type` 報錯，來自工具自己的本地預覽介面（`localhost` 上的 `/api/media-preview/...`）。這說明工具沒能把這段影片處理成可用的地址，最後把本地路徑原樣塞進了請求。

## 不要用通用影片端點提交 Seedance

`/v2/videos/generations`（以及 `/v1/videos`、`/v1/video/generations`）是閘道的通用影片端點，欄位是幾家影片模型的最大公約數，**表達不了 Seedance 的輸入模式**：

* **沒有 `role`**：分不清首幀、首尾幀和多模態參考，一圖一影片這種組合一定會被當成「首幀 + 參考」
* **解析度透傳不完整**：實測 2.5 請求 480p 會按 720p 出片、2.0 系請求 1080p 會按 720p 出片，而計費按實際出片結算
* **2.5 獨有的引數**（`omni_reference_task_type`、`output_format` 等）沒有對應欄位

所以 Seedance 任務**一律走原生端點**：

| 步驟 | 端點 |
| - | - |
| 提交任務 | `POST /seedance/api/v3/contents/generations/tasks` |
| 查詢任務 | `GET /seedance/api/v3/contents/generations/tasks/{id}` |

如果你用的是第三方工具，找一找它的 Seedance 通道能不能選「原生 / 火山方舟」格式；只提供通用影片介面的工具，做不了帶參考影片的任務。

## 正確寫法：每個素材都寫 role

```python theme={null}
import os, requests

BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
headers = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}

body = {
    "model": "doubao-seedance-2-0-260128",
    "content": [
        {"type": "text", "text": "把 @影片1 中的人物換成 @影像1 中的角色，動作、表情和背景音樂保持不變"},
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
print(r.status_code, r.json())   # 成功返回 {"id": "cgt-..."}，拿 id 去輪詢
```

要點：

* **三種輸入模式互斥**：首尾幀（2 張圖，`first_frame` / `last_frame`）、首幀（1 張圖）、多模態參考（`reference_image` / `reference_video` / `reference_audio`）。只要帶了參考影片或參考音訊，所有圖片都必須寫 `reference_image`
* **不寫 `role` 就是首幀**：單張圖不寫 `role`，等同於 `first_frame`
* 提示詞裡用 `@影像1`、`@影片1` 按傳入順序指代素材
* 參考素材數量：2.0 系最多 9 圖 + 3 影片 + 3 音訊，2.5 最多 30 圖 + 10 影片 + 10 音訊

## 參考影片怎麼傳

原廠是在**自己的伺服器上**下載素材的，所以影片必須是原廠能直接訪問到的地址。

| 傳法 | 能不能用 | 說明 |
| - | - | - |
| **公網直鏈**（首選） | ✅ | 放在物件儲存或 CDN 上（OSS、S3、R2、TOS 等），無需登入、Cookie 或額外請求頭，有效期覆蓋到任務完成 |
| **素材 ID** `asset://...` | ✅ | 同一段影片要反覆用、或含真人出鏡時用。入庫要求 mp4 / mov、2–15 秒、少於 50MB，見 [素材庫](/zh-Hant/api-capabilities/seedance2/asset-library) |
| **Base64** | ⚠️ 不建議 | 影片體積比圖片大一個量級，內聯進請求體最容易把提交拖到超時，見 [素材優先實踐](/zh-Hant/api-capabilities/seedance2/asset-first-workflow) |
| 本機路徑（`/assets/...`、`C:\...`、`file://...`） | ❌ | 原廠訪問不到你電腦上的檔案 |
| 內網地址（`localhost`、`127.0.0.1`、`192.168.x.x`） | ❌ | 同上 |
| 需要登入才能下載的連結 | ❌ | 原廠抓取時不會帶你的登入態 |

提交前可以在任意一臺能上網的機器上自查（把 `<URL>` 換成你的影片連結）：

```bash theme={null}
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'
```

應返回 `code=200`，`type` 是 `video/mp4` 或 `video/quicktime`，`size` 與原檔案一致。返回 HTML、JSON 或 4xx 都說明這個連結給不了原廠。圖片連結的完整自查方法見 [圖片連結能開啟卻報格式錯誤](/zh-Hant/faq/seedance-image-url-invalid-format)。

## 相關文件

<CardGroup cols={2}>
  <Card title="影片生成介面" icon="video" href="/zh-Hant/api-capabilities/seedance2/video-generation">
    原生端點、各輸入模式的 content 組合與 role 取值
  </Card>

  <Card title="素材優先實踐" icon="gauge" href="/zh-Hant/api-capabilities/seedance2/asset-first-workflow">
    參考影片為什麼別用 Base64，以及入庫拿素材 ID 的步驟
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.