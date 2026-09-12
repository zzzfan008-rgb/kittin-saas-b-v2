> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana OSS 分组

> Nano Banana OSS（NB-OSS）内测分组：图片输出为 URL 地址而非 Base64，减轻传输压力、提升体验，适合直接使用 URL 的场景。

## 背景必读

<Info>
  **特点**：本分组为内测，可输出的图片为 **URL 地址**，而非 Base64，可减轻 Base64 传输压力，提升客户体验。**适合直接用 URL 的场景**。如果没有特别需求、能处理 Base64 输出的图片格式，则仍然建议使用「正常默认分组」或「NanoBanana 企业分组」。
</Info>

**支持模型**（Nano Banana Pro 和第一代）：

* `gemini-3-pro-image-preview`
* `gemini-3.1-flash-image-preview`
* `gemini-2.5-flash-image`

## 如何开始

<Steps>
  <Step title="联系管理员开通该可见分组">
    联系管理员为你的账号开通 NB-OSS 可见分组（在「编辑用户信息 → 额外可见分组」中添加 NB-OSS）。

    <Frame caption="编辑用户信息：在「额外可见分组」中添加 NB-OSS">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-contact-admin.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=d4975f7e75786ca3452e99659297f9dc" alt="编辑用户信息界面，在额外可见分组中添加 NB-OSS 分组" width="736" height="310" data-path="images/nano-banana-oss-contact-admin.png" />
    </Frame>
  </Step>

  <Step title="新建令牌：选择 NB-OSS 分组">
    新建令牌时，计费模式选「按次计费」，分组选 **NB-OSS**（Nano Banana PRO，输出图片为 URL，替代 Base64）。只换令牌，请求方式不变。

    <Frame caption="创建令牌：计费模式选「按次计费」，分组选 NB-OSS（1x）——输出图片为 URL，替代 Base64">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-create-token.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6ccac2359d775f8c0f9a185884bb6e4a" alt="创建令牌界面：计费模式选择按次计费，选择分组 NB-OSS，输出图片为 URL 替代 Base64" width="1284" height="886" data-path="images/nano-banana-oss-create-token.png" />
    </Frame>
  </Step>

  <Step title="替换令牌，进行测试">
    替换令牌进行测试。**代码层面需要兼容 URL 输出的解析** —— 不要直接替换 Base64，两者兼容最佳。
  </Step>
</Steps>

## 示例代码

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### 输出示例

在 `text` 字段里有图片的地址，下方的 `thoughtSignature` 是推理过程的 base64。

<Frame caption="响应 JSON：candidates → content → parts，图片 URL 在 text 字段中；thoughtSignature 为推理的 base64">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-output-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=7c466c969fc59d03a889f31c8b192bcb" alt="API 响应 JSON 示例，text 字段包含图片 URL 地址，thoughtSignature 字段为推理的 base64" width="1200" height="637" data-path="images/nano-banana-oss-output-example.png" />
</Frame>

## OSS 存储节点与下载速度

### 图片存储在哪里？

输出的图片 URL 存储在**阿里云 OSS 洛杉矶节点（美西 us-west-1，北美区域）**，URL 形如：

```
https://<bucket名>.oss-us-west-1.aliyuncs.com/xxxx.png
```

<Warning>
  URL 的二级域名（`<bucket名>` 部分，如 `mycdn-gg`）**可能会变化，请不要在代码或防火墙规则中写死完整域名**。如需做域名判断或白名单，请匹配后缀 `oss-us-west-1.aliyuncs.com`（阿里云 OSS 官方域名），或更宽松地放行 `*.aliyuncs.com`。
</Warning>

### 下载慢怎么办？

由于存储节点在北美，从中国大陆等地直连下载时速度可能受限，常见原因和建议：

* **公司网络对海外流量限速 / 白名单拦截**：请联系网络管理员对 `*.oss-us-west-1.aliyuncs.com`（或 `*.aliyuncs.com`）解除限速、加入白名单。
* **及时转存**：拿到 URL 后建议尽快下载并转存到自己的存储 / CDN，再分发给终端用户，不要把 OSS URL 直接长期暴露给最终用户。
* **服务器代下**：如果本地网络下载慢，可以用海外或网络出口较好的服务器先下载再中转。

更多网络链路排查思路（DNS、路由、跨境带宽等），可参考 FAQ：[下载 CDN 图片/视频很慢怎么办？](/faq/cdn-download-slow)

### 网址打不开？

核心是把输出内容 JSON 里的转义字符 `\u0026` 还原成正常的 `&`，同时忽略 `thoughtSignature` 后面的 base64 内容。

<Frame caption="图片链接在 text 字段里；将 JSON 转义的 & 还原成网址里的 &，忽略 thoughtSignature 后的 base64">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-url-unescape.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5998b89a3f6b0cf6448041e47db2d9dd" alt="说明图：图片链接在 text 字段，需将 JSON 转义符 反斜杠 u0026 还原成 & 号，忽略 thoughtSignature 后的 base64 内容" width="1200" height="723" data-path="images/nano-banana-oss-url-unescape.png" />
</Frame>
