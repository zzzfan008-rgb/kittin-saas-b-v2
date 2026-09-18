> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 上传图片报 image content does not match MIME type 怎么解决？

> 图片 URL 末尾带 x-oss-process 等 CDN 处理参数时会触发该报错，去掉参数或用原始直链即可

## 简要回答

上传给 API 的图片 URL 末尾带了 `?x-oss-process=...` 这类云存储处理参数，会触发 `image content does not match MIME type` 报错。

解决办法是去掉 URL 末尾的处理参数、使用原始直链传给 API，或者先把图在自己服务端处理好再上传。

## 这个报错是什么样？

报错内容如下：

```json theme={null}
{
  "error": {
    "message": "decode image: image content does not match MIME type 'image/png'",
    "type": "invalid_request_error",
    "code": 429
  }
}
```

常见的触发 URL 形如：

```text theme={null}
https://oss.fzputi.com/tools/aiCraft/...jpg?x-oss-process=image/resize,w_800
```

这种 URL 末尾的 `?x-oss-process=...` 是阿里云 OSS 等对象存储的图片处理参数；目前已知带上这类参数后，图片生成类接口会报上述错误。

## 已知受影响的参数名

以下参数名出现在图片 URL 末尾时，**已被反馈会触发该报错**：

* `x-oss-process`

若你使用其他云存储的图片处理参数（例如腾讯云 COS、华为云 OBS 等的等效参数），同样建议按以下步骤处理后再传入 API。

## 解决步骤

<Steps>
  <Step title="去掉 URL 末尾的处理参数">
    复制图片的原始直链（不带 `?x-oss-process=` 这类参数），重新传入 API。

    例如把：

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg?x-oss-process=image/resize,w_800
    ```

    改成：

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg
    ```
  </Step>

  <Step title="如果需要尺寸调整，先在服务端处理后再上传">
    如果你的业务确实需要 OSS 端做压缩或裁剪，先在服务端把处理后的图片下载到本地，再用本地路径或新的直链（不带参数）传给 API。
  </Step>
</Steps>

## 注意事项

<Warning>
  传进 API 的图片 URL 应尽量保持「直链、零参数」，避免触发该报错。
</Warning>

## 仍然无法解决时

* 确认你传入的 URL 在浏览器中可以直接打开，且浏览器右键 → 查看图片时显示的真实格式与 URL 后缀（jpg / png / webp）一致
* 如果使用其他云存储的图片处理参数，请联系技术支持附上具体报错 JSON 与请求 ID

## 相关文档

* [图片生成有异步接口吗？支持任务 ID 查询结果吗？](/faq/image-async-api)
* [接入模型后生成的图片和参考图相差很大怎么办？](/faq/image-result-differs-from-reference)
