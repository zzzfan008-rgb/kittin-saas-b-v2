> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MAI-Image 2.6 Image Editing Now Takes 1–5 Reference Images

> The image editing endpoint of MAI-Image-2.6 and MAI-Image-2.6-Flash now accepts 1–5 reference images for multi-image fusion. Repeat the image[] field; billed per request, and the number of reference images does not change the price. image + image2 does not work.

**2026/10/7 18:47 (UTC+8)** · New Model · Microsoft

🚀 **`MAI-Image-2.6` / `MAI-Image-2.6-Flash` image editing now takes 1–5 reference images, same price regardless of count**

`/v1/images/edits` now accepts up to 5 reference images per request for multi-image fusion. Images are numbered image 1, image 2, … in upload order, so the prompt can say "put the fox from image 2 into the scene of image 1". One reference image or five, the price is the same.

* How: repeat the `image[]` field, `curl -F "image[]=@a.jpg" -F "image[]=@b.jpg"`; with the OpenAI SDK, pass a list `image=[f1, f2]`
* Note: do not use numbered field names such as `image` + `image2`, as the second image is dropped; more than 5 images returns 400; only JPEG / PNG / WebP are accepted

See the [Image Editing API](/en/api-capabilities/mai-image/image-edit).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.