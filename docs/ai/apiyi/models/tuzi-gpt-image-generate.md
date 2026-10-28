# GPT Image 文生图（兔子API /v1/images/generations）

来源: https://tuzi-api.apifox.cn/343646952e0.md
抓取: 2026-10-27

POST /v1/images/generations  Content-Type: application/json  Authorization: Bearer <key>

请求体:
- model (string, required)
- prompt (string, required, 最大 5000 字符)
- n (integer, 1-10)
- size (string): gpt-image-2 支持任意分辨率或比例名 1:1/2:3/3:2/3:4/4:3/4:5/5:4/9:16/16:9/21:9；
  常用 1024x1024 / 1536x1024 / 1024x1536 / 2048x2048 / 2048x1152 / 3840x2160 / 2160x3840 / auto
  约束: 最大边 ≤3840、宽高均为 16 的整数倍、长短边比 ≤3:1、总像素 655360-8294400
- quality (string): auto/low/medium/high
- response_format (string): url 或 b64_json
- style (string), user (string)
- image (array<string>): 支持 url 与 base64 传图

响应 200:
{ created: integer, data: [ { url: string } ] }
