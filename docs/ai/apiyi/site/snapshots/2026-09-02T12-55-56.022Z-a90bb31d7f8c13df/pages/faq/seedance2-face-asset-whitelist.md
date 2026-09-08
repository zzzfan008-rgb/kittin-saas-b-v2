> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 人脸素材为什么被拦截？

> 说明虚拟人脸白名单、素材入库与账号权限的区别，以及将 AI 虚拟模特用于首帧或参考图的正确方法。

## 简短回答

Seedance 2.0 通道自带的“虚拟人脸白名单”是**平台通道侧的上游能力**，不需要也无法在您的 API易 令牌或账号上手动开启。但是，这不代表含人脸图片可以直接通过公网 URL 或 Base64 作为首帧或参考图提交。

如果 AI 生成的虚拟模特图被识别为“可能含真人”，请先将图片上传到 [Seedance 2.0 素材库](https://icover.ai/zh/seedance-official/asset-library)，等待入库状态变为“可用”，取得 `asset://xxx` 素材 ID，再用该素材 ID创建视频任务。

<Info>
  **通道权限与素材可信状态是两件事**

  * **虚拟人脸白名单**：平台通道已具备，不需要为单个账号或令牌另行开通
  * **素材入库**：将具体人脸图片登记为可信素材，取得可用于视频生成的 `asset://` ID
</Info>

## 为什么 AI 生成人脸仍可能被拦截

上游内容安全系统会根据图片本身判断是否含有人脸或疑似真人，而不是只依据图片由 AI 生成这一声明。写实度较高的虚拟模特可能被识别为“可能含真人”，因此直接传公网 URL 或 Base64 时仍可能触发防深伪拦截。

这类拦截通常不代表您的 API易 账号缺少白名单，也不代表需要修改令牌权限。正确处理方式是让图片先通过素材入库流程，成为可信素材。

<Warning>
  不要通过反复更换 URL、转存图片、压缩图片或修改文件名来绕过人脸检测。这些操作不会改变素材的人脸属性，也不能替代素材入库或真人认证。
</Warning>

## AI 虚拟模特用于首帧或参考图的正确做法

<Steps>
  <Step title="登录素材库">
    打开 [icover.ai 素材库](https://icover.ai/zh/seedance-official/asset-library)，注册或登录您的 icover.ai 账号。
  </Step>

  <Step title="上传虚拟人像">
    在“虚拟人像入库”中上传 AI 生成的模特图。支持 jpeg、png、webp、bmp、tiff、gif、heic；宽高比需为 0.4–2.5，边长需为 300–6000px，单张少于 30MB。
  </Step>

  <Step title="等待素材可用">
    等待十几秒，确认状态变为“可用”或 `Active`，然后复制 `asset://xxx` 素材 ID。素材 ID 可重复使用，无需每次重新入库。
  </Step>

  <Step title="选择生成方式">
    在 [icover.ai 在线测试](https://icover.ai/zh/seedance-official) 中选择“多模态”模式，并将参考图类型设为“素材”；通过 API 调用时，则把 `asset://xxx` 填入 `image_url.url`。
  </Step>

  <Step title="设置图片角色">
    用作首帧时设置 `role: "first_frame"`；用作人物或风格参考时设置 `role: "reference_image"`。提示词中使用“图片1”指代对应素材。
  </Step>
</Steps>

<Tip>
  为提高人物一致性，可以将同一虚拟人物的“全身正面图”和“人脸正面无表情特写”放入同一个素材组。
</Tip>

## 是否必须使用平台预置素材或 Seedance 生成图片

不必须。以下三种来源都可以使用，但含人脸素材应按对应流程处理：

| 素材来源                  | 是否可用  | 推荐处理方式                            |
| --------------------- | ----- | --------------------------------- |
| 自己生成的 AI 虚拟模特图        | 可以    | 上传素材库，取得 `asset://` ID 后使用        |
| 平台素材库中已有的虚拟人素材        | 可以    | 直接选择已有素材或引用其 `asset://` ID        |
| Seedance 或其他模型生成的含脸图片 | 可以    | 如果再次作为人脸参考图使用，仍建议先入库；生成来源不会自动豁免检测 |
| 真人人脸图片                | 有条件可以 | 先完成真人活体认证，再上传到对应真人素材组             |

因此，关键条件不是“图片必须由哪个模型生成”，而是**含人脸图片是否已成为可用的可信素材**。

## 能否为单个账号开启 AI 人脸白名单

无需单独开启，也不存在由用户自行操作的“AI 人脸白名单”账号开关。平台通道已经具备虚拟人脸相关的上游权限；您需要完成的是素材入库，而不是申请修改令牌。

如果虚拟人像入库失败，或已取得 `asset://` ID 仍被拦截，请联系客服并提供以下信息，以便排查素材状态或上游审核结果：

* API易 账号或注册邮箱
* 使用的模型名称
* 素材 ID（`asset://xxx`）
* 视频任务 ID 和完整错误信息
* 素材入库状态截图

<Warning>
  如果图片实际包含真人，或系统将其判定为需要真人授权的素材，平台不能通过普通虚拟人入库绕过上游保护政策。此时需要在素材库的“真人认证”页面完成艺人活体认证，并将素材上传到该艺人的专属真人素材组。
</Warning>

## Seedance 2.0 定向开放说明

Seedance 系列采用原厂直转并受平台保护政策约束，目前主要面向有明确业务需求的定向客户，因此文档中心可能不展示公开导航入口。页面仍可通过以下地址直接访问：

<CardGroup cols={2}>
  <Card title="Seedance 2.0 总览" icon="film" href="/api-capabilities/seedance2/overview">
    查看模型能力、输入限制、计费与常见问题。
  </Card>

  <Card title="视频生成 API" icon="video" href="/api-capabilities/seedance2/video-generation">
    查看首帧、首尾帧和多模态参考生视频的参数格式。
  </Card>

  <Card title="素材库" icon="images" href="/api-capabilities/seedance2/asset-library">
    查看虚拟人入库、真人认证、素材格式和 API 接口。
  </Card>

  <Card title="素材引用实战" icon="code" href="/api-capabilities/seedance2/asset-reference">
    查看上传、入库、轮询 `Active`、引用素材和下载视频的完整流程。
  </Card>
</CardGroup>

## 在线工具

* [Seedance 2.0 在线测试](https://icover.ai/zh/seedance-official)
* [虚拟人及真人人脸素材入库](https://icover.ai/zh/seedance-official/asset-library)
