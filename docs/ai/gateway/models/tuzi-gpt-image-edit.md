# GPT Image 图片编辑（兔子API /v1/images/edits）

来源: https://tuzi-api.apifox.cn/343646953e0.md
抓取: 2026-10-27

POST /v1/images/edits  Content-Type: multipart/form-data  Authorization: Bearer <key>

表单字段:
- model (string, required)
- prompt (string, required, 最大 1000 字符)
- image (binary, required, 可多张): 有效 PNG，<4MB
- mask (binary): 透明区域指示应编辑位置，PNG，<4MB，尺寸须与 image 相同
- n (string, 1-10)
- size (string): 支持 2:3 / 3:2 / 1:1
- response_format (string): url 或 b64_json
- user (string)

响应 200:
{ created: integer, data: [ { url: string } ] }
