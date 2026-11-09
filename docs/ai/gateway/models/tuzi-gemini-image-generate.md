# Gemini 图像生成（兔子API 谷歌官方格式）

来源: https://tuzi-api.apifox.cn/360926406e0.md
抓取: 2026-10-27

POST /v1beta/models/{model_name}:generateContent  Content-Type: application/json

请求体:
- contents: [ { parts: [ { text?: string, inline_data?: { mime_type: string, data: base64 } } ] } ]  (required)
- generationConfig:
  - responseModalities: [IMAGE] | [TEXT]
  - imageConfig:
    - aspectRatio: 1:1/2:3/3:2/3:4/4:3/4:5/5:4/9:16/16:9/21:9
      （对应像素 1:1=1024x1024, 3:4=864x1184, 4:3=1184x864, 9:16=768x1344, 16:9=1344x768, 21:9=1536x672）
    - imageSize: 1K/2K/4K（gemini-3-pro-image-preview 以上支持）

响应: candidates[].content.parts[].inlineData.{mimeType,data}
