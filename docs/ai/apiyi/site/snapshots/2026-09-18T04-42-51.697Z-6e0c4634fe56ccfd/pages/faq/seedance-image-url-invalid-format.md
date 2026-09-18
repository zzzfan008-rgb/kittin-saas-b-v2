> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片链接浏览器能打开，Seedance 却报 invalid image format？

> Seedance 的图片素材链接在浏览器里能正常打开，提交任务却返回 400 invalid image format。原因是链接只适合浏览器单次下载，不适合服务器抓取：不支持 Range、限制下载次数、有效期太短。本页说明怎么自查链接，以及公网直链、素材 ID、Base64 三种传法怎么选。

## 简短回答

原厂拿到的不是图片，而是你那边服务器返回的一段报错。浏览器能打开，只能说明**浏览器下载一次**没问题，不能说明**原厂服务器抓取**也没问题。

典型报错如下，提交任务时直接返回 400，不会创建任务：

```text theme={null}
The parameter `content[1]` specified in the request is not valid:
invalid image format (detected format); received: "".
```

`received: ""` 表示原厂没有从下载到的内容里识别出任何图片格式。

**最省事的改法**：把图片放到普通的对象存储或 CDN 上，用一个干净的公网直链（例如 `https://cdn.example.com/xxx.png`）。

## 一个真实案例

一位客户的首帧图链接长这样：

```text theme={null}
https://<客户域名>/api/v1/resource-download-grants/<文件ID>/content?access_token=<带过期时间和签名的令牌>
```

浏览器里打开，图片正常显示，但提交 Seedance 任务就返回上面的 400。我们对这个链接做了测试：

| 测试                     | 结果                          |
| ---------------------- | --------------------------- |
| 普通 GET（和浏览器一样）         | 200，返回 PNG 图片               |
| 带 `Range` 请求头，只取文件开头一段 | **416**，返回的是一段 JSON 报错，不是图片 |
| 连续下载约 10 次之后           | **429**，`文件下载授权次数已耗尽`       |
| 同一张图转成 Base64 提交       | **成功**出片                    |

最后一行说明图片本身和请求参数都没问题，问题只出在这个链接上。

## 为什么会有这种链接

这不是图片地址，而是一个**业务接口**：用户的私有文件存在后台，每次需要下载时，由应用临时签发一个「下载授权」，里面带着过期时间、签名和下载次数上限。这是保护私有文件的常见做法：链接泄露出去也用不了多久、用不了几次，每次下载也能记录审计。

这种设计是给**一个人在浏览器里下载一次**准备的，拿来给服务器抓图就会出问题：

* **不支持 Range 请求**：很多服务在抓取素材时，会先用 `Range` 头取文件开头几个字节来判断格式，或者分段下载。这类接口只会整份返回文件，碰到 Range 就报错
* **限制下载次数**：原厂抓取素材时，可能会探测、下载、失败后重试，不一定只下载一次。次数用完后，返回的就是一段报错 JSON
* **有效期太短**：链接过期后返回的也不是图片

对象存储或 CDN 上的公开直链（R2、S3、OSS、TOS 等）没有这些限制：URL 直接指向静态文件，支持 Range，不限下载次数，也不需要额外的请求头或 Cookie。

## 三种传法怎么选

| 传法                                     | 什么时候用              | 说明                                                                                              |
| -------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| **公网直链**（首选）                           | 一次性使用的图片           | 请求体很小，由原厂服务器直接拉取，原厂的服务器性能和带宽都更好。链接需要满足下面的自查条件                                                   |
| **素材 ID** `asset://...`                | 同一张图要反复引用；含写实人脸的素材 | 先入库一次，之后每次只传一个短字符串，见 [素材优先实践](/api-capabilities/seedance2/asset-first-workflow)                 |
| **Base64** `data:image/png;base64,...` | 实在拿不到合格的公网链接时兜底    | 图片编码后体积会增大约三分之一，全部要从你的机器上传，提交阶段明显变慢。实测一张 2.3 MB 的 PNG 转成 Base64 后，请求体约 3.1 MB，创建任务接口用了约 60 秒才返回 |

如果你的文件存在自己的后台、只能通过这种下载授权接口拿到，可以在提交前换一种方式出链：

* 文件本来就在对象存储里（OSS、S3、R2 等）：直接生成**对象存储的预签名 URL**，有效期设为 1 小时以上。预签名 URL 只按时间过期，不限下载次数，也支持 Range
* 否则先把图片转存到一个公开的对象存储或 CDN，再把新链接传给 Seedance

## 提交前自查链接

在任意一台能上网的机器上跑下面两条命令，把 `<URL>` 换成你的图片链接（整个链接用单引号包起来，避免 `&` 被 shell 解析）：

```bash theme={null}
# 1. 普通下载：应为 200，Content-Type 应为 image/png、image/jpeg 等图片类型
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'

# 2. 分段下载：应为 206（或 200 返回整份图片），不能是 4xx
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type}\n' -H 'Range: bytes=0-1023' '<URL>'
```

同时确认这几点：

* 两条命令返回的都是图片，不是 JSON 或 HTML
* 多次下载都能成功，没有次数限制
* 不需要 Cookie、登录态或额外的请求头
* 有效期至少覆盖到任务提交完成，建议 1 小时以上
* 公网可直接访问，不在内网或 IP 白名单之后

<Warning>
  限次下载的链接，自查时也会消耗下载次数。测试请用单独签发的链接，别把正式要用的那个链接的次数测光。
</Warning>

## 相关文档

<CardGroup cols={2}>
  <Card title="视频生成接口" icon="video" href="/api-capabilities/seedance2/video-generation">
    图片支持的三种传法与全部请求参数
  </Card>

  <Card title="素材优先实践" icon="gauge" href="/api-capabilities/seedance2/asset-first-workflow">
    三种传法在提交阶段的耗时对比，以及入库拿素材 ID 的步骤
  </Card>
</CardGroup>
