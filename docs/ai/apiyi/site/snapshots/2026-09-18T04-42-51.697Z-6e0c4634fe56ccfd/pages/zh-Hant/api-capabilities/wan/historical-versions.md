> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan 歷史版本（Wan2.6）

> Wan2.6 系列（含 wan2.6-r2v-flash）歷史版本說明與遷移指南：與 Wan2.7 共用同一端點和 schema，只改 model 名即可呼叫。

本頁面向**正在用 Wan2.6 的使用者**，說明各版本差異與遷移到 Wan2.7 的路徑。新使用者請直接從 [Wan 概覽](/zh-Hant/api-capabilities/wan/overview) 起步。

## 版本一覽

| 版本         | 狀態     | 端點 / 協議                          | 推薦場景                              |
| ---------- | ------ | -------------------------------- | --------------------------------- |
| **Wan2.7** | ✅ 當前推薦 | `/wan/api/v1/...video-synthesis` | 新接入首選，能力最全（音訊驅動、多主體參考）            |
| **Wan2.6** | 🟡 維護中 | 同 Wan2.7（只改 model 名）             | 已有 Wan2.6 程式碼、需要 `r2v-flash` 低延遲檔 |

<Info>
  Wan2.6 與 Wan2.7 **共用同一個 DashScope 透傳端點和同一套請求結構**，遷移時**只需把 `model` 欄位從 `wan2.6-*` 改成 `wan2.7-*`**，body 其餘部分一字不改。具體上線日期與最新可用性以 [API易控制台](https://api.apiyi.com/token) 模型列表為準。
</Info>

## Wan2.6 各型號

| 模型 ID              | 能力           | 說明                                  |
| ------------------ | ------------ | ----------------------------------- |
| `wan2.6-t2v`       | 文生影片         | 對應 `wan2.7-t2v`                     |
| `wan2.6-i2v`       | 圖生影片         | 對應 `wan2.7-i2v`                     |
| `wan2.6-r2v`       | 參考圖生影片       | 對應 `wan2.7-r2v`                     |
| `wan2.6-r2v-flash` | 參考圖生影片（低延遲檔） | Wan2.6 專屬的快速檔，生成更快、單價更低，適合聯除錯錯與批次預覽 |

<Tip>
  `wan2.6-r2v-flash` 是 Wan2.6 系列裡的輕量快速檔，沒有對應的 2.7 版本。開發期用它快速驗證 prompt 與參考圖效果，定型後再切到 `wan2.7-r2v` 出正式片。
</Tip>

## 遷移建議

<Steps>
  <Step title="評估差異">
    Wan2.7 在多主體參考、音色參考（`reference_voice`）、音訊驅動等能力上更強。若你只用基礎的 t2v / i2v / r2v，遷移成本幾乎為零。
  </Step>

  <Step title="並行對照">
    用同一組 prompt 和媒體素材，分別提交 `wan2.6-*` 與 `wan2.7-*` 任務，對比畫質與一致性後再決定切換。
  </Step>

  <Step title="漸進切換">
    只改 `model` 欄位即可。端點、請求頭、`input` / `parameters` 結構、輪詢與下載流程完全一致，無 Breaking Change。
  </Step>
</Steps>

## 舊版呼叫示例

```python theme={null}
import requests

# 呼叫 Wan2.6：與 Wan2.7 唯一的區別就是 model 名
body = {
    "model": "wan2.6-r2v-flash",   # 改成 wan2.7-r2v 即升級到 2.7
    "input": {
        "prompt": "參考圖片，一位女孩在花園裡緩步行走，電影級光影",
        "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
    },
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
}
resp = requests.post(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    json=body,
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
             "X-DashScope-Async": "enable"},
    timeout=30,
)
print(resp.json()["output"]["task_id"])
```

## 計費差異

<Note>
  Wan2.6 與 Wan2.7 的價格、分組配置即將上線，本頁稍後補充。一般規律：`r2v-flash` 等快速檔單價更低，高解析度 / 長時長單價更高。最新價格以 [API易控制台](https://api.apiyi.com/token) 賬單頁為準。
</Note>

## 相關文件

<CardGroup cols={2}>
  <Card title="Wan 概覽" icon="video" href="/zh-Hant/api-capabilities/wan/overview">
    非同步流程、引數詳解、最佳實踐
  </Card>

  <Card title="參考圖生影片" icon="users" href="/zh-Hant/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 線上除錯
  </Card>
</CardGroup>
