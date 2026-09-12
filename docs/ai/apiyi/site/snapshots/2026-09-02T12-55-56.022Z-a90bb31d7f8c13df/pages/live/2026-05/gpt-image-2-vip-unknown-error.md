> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 报『Unknown error』经验分享：单张输入图建议压到 1.5MB 以内

> gpt-image-2-vip 偶发 Unknown error / shell_api_error 大多是单张输入图过大导致。建议每张上传图压缩到 1.5MB 以内再调用，输出尺寸由 size 参数决定，不受输入大小约束。附错误日志样例。

**2026/5/8 23:26 (UTC+8)** · 模型状态 · OpenAI

💡 **gpt-image-2-vip 报『Unknown error』排查经验：单张输入图建议压到 1.5MB 以内** —— 偶发的 `shell_api_error` / `Unknown error` 大多是因为输入图片体积过大。建议每张上传给接口的图先压缩到 **1.5MB 以内** 再发送，多图融合时也按这个标准逐张控制；输出图的尺寸由 `size` 参数决定，**不受输入图体积约束**——压小输入只影响请求成功率，不会影响出图清晰度。

📋 **典型错误日志样例**：

```text theme={null}
An error occurred while processing your request. You can retry your request,
or contact us through our help center at help.openai.com if the error persists.
Please include the request ID fc6c3693-4f7b-46aa-a493-88b48f789e4d in your message.
（traceid: d7716a02769ead1890b90074670b7c99）
(request id: 2026050822473732782809166920955)

"localized_message":"Unknown error","type":"shell_api_error","param":"","code":null
```

碰到这类报错，先在客户端把图压一下（JPEG 质量 80-90 / 分辨率适当下调）再重试通常就能恢复。

📖 官转 vs 官逆区别：[/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
