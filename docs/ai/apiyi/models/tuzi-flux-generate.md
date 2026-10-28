# FLUX 生成图像（兔子API）

来源: https://tuzi-api.apifox.cn/343646931e0.md
抓取: 2026-10-27

原生异步: POST /flux/v1/{model_name} → GET /flux/v1/get_result?id=
另有 OpenAI 兼容: POST /v1/images/generations、编辑 POST /v1/images/edits (multipart, image 字段)
resolution: 768sq | 1k | 1.5k | 2k | 4k（默认 1k）；最多 10 张参考图
