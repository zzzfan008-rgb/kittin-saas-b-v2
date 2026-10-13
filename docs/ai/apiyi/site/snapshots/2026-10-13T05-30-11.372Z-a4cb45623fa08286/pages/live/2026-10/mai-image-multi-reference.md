> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MAI-Image 2.6 图片编辑支持 1–5 张参考图

> MAI-Image-2.6 与 MAI-Image-2.6-Flash 的图片编辑接口支持 1–5 张参考图做多图融合，多图时重复 image[] 字段，按次计费、参考图张数不影响价格；image + image2 写法不生效。

**2026/10/7 18:47 (UTC+8)** · 新模型 · Microsoft

🚀 **`MAI-Image-2.6` / `MAI-Image-2.6-Flash` 图片编辑支持 1–5 张参考图，按次计费、张数不影响价格**

`/v1/images/edits` 现在可以一次传入最多 5 张参考图做多图融合，按上传顺序为图1、图2……，提示词里可直接写「把图2里的狐狸放进图1的场景里」。参考图传 1 张还是 5 张都是同一个价。

* 写法：重复 `image[]` 字段，`curl -F "image[]=@a.jpg" -F "image[]=@b.jpg"`；OpenAI SDK 传列表 `image=[f1, f2]`
* 注意：不要用 `image` + `image2` 这类编号字段名，第二张会被丢弃；超过 5 张返回 400；只接受 JPEG / PNG / WebP

详见 [图片编辑 API](/api-capabilities/mai-image/image-edit)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.