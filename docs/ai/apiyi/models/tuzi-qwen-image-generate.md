# Qwen Image 生成或编辑（兔子API）

来源: https://tuzi-api.apifox.cn/498659603e0.md
抓取: 2026-10-27

支持 qwen-image-3.0-pro / qwen-image-3.0
端点: POST /v1/images/generations（生成）、POST /v1/images/edits（编辑，multipart）

## 分辨率档位（本产品策略，2026-10-28 实测确认）

官方 `size` 约束：**像素面积 [262,144, 4,194,304]**，且必须写成 `宽*高`（星号，不是 `x`）。

| 请求 | 结果 |
|---|---|
| `512*512`（已是最小面积） | ✅ |
| `1024*1024` / `2048*1152` | ✅ |
| `4096*4096` | 500 `pixel area must be between 262144 and 4194304` |
| `2K`（档位串） | 400 |

因此本产品只给 qwen 两档：**1K / 2K**，不发 4K。
