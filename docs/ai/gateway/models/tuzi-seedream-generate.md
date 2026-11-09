# Seedream 创建图片（兔子API 即梦官方格式）

来源: https://tuzi-api.apifox.cn/349741169e0.md
抓取: 2026-10-27

POST /v1/images/generations（OpenAI 兼容），可使用 size 与 response_format

## 分辨率档位（本产品策略，2026-10-28 实测确认）

官方 `size` 约束：**像素面积 [921,600, 4,624,220]**，无独立比例字段。

| 请求 | 结果 |
|---|---|
| `512x512`（262,144 像素） | 400 `image area must be at least 921600 pixels` |
| `1024x1024` | ✅ |
| `2048x2048`（4,194,304） | ✅ |
| `2048x864`（1,769,472） | ✅ |
| `3072x3072`（9,437,184） | 400 `image area must be at most 4624220 pixels` |

因此本产品只给 seedream 两档：**1K（长边 1024）/ 2K（长边 2048）**，不发 4K；
尺寸按「长边 × 画幅」推导后夹进上述面积区间，取 16 的倍数。
