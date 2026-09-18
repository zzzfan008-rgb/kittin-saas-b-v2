> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 调用 SD API 时人脸参考图会自动上传素材库吗？会被风控拦截吗？

> Seedance 2.0 不支持直接传含写实人脸的参考图，必须先把图片入库拿 asset:// 素材 ID 再引用，本文整理素材库正确链路与防深伪拦截的应对路径。

## 简短回答

两个问题分开回答：

1. **不会自动上传**：调用 Seedance 2.0 接口时，**人脸参考图不会自动入库到素材库**。需要单独走素材库上传流程拿到 `asset://` 素材 ID，再在视频生成请求里引用它。
2. **会被拦截**：含写实人脸的参考图直接传入会被上游内容安全机制拦截。直接传真人照片生视频会失败。

正确链路有两种走法，按你的人物类型选：

* **虚拟人像**（AI 生成的写实人像，现实中无对应真人）：用素材库的「虚拟人像入库」拿 `asset://` ID 后引用
* **真人人脸**（艺人、模特、用户本人）：先做活体扫脸认证 → 入库时带真人素材组 `groupId` → 拿 `asset://` ID 后引用
* **近 30 天内 Seedance 生成的产物**：可以用做二次创作的参考图（走 Seedance 模型近 30 天内生成的含人脸产物路径）

## 详细说明

### 为什么不能直接传人脸图？

Seedance 2.0 生成人物一致性视频时，**不能直接上传含写实人脸的参考图**（防深伪拦截）。这是上游内容安全机制的限制，不是 API易 这边的策略。

### 正确的工作流

<Steps>
  <Step title="判断素材类型">
    先确认你的人像属于哪一类：

    * **动漫 / 风格化角色**（二次元、卡通）：不含写实人脸，**不需要入库**，直接传公网 URL 或 base64 即可
    * **虚拟人像**（AI 生成写实人像）：走「虚拟人像入库」，全自动无审核
    * **真人人脸**（艺人、模特、用户本人）：必须先做活体扫脸认证
  </Step>

  <Step title="上传到素材库拿 asset:// ID">
    * 网页：在 [icover.ai 素材库](https://icover.ai/zh/seedance-official/asset-library) 上传图片，等待状态变「可用」后复制 `asset://xxx`
    * API：用 `presign` + `POST /api/asset-library/assets` 走完整代码链路，详见 [素材引用实战](/api-capabilities/seedance2/asset-reference)
  </Step>

  <Step title="在视频生成请求里引用素材 ID">
    Seedance 2.0 接口的 `content` 里用 `image_url` 字段传 `asset://<Id>`，提示词里用「图片1」指代人物。详见 [Seedance 2.0 视频生成 API](/api-capabilities/seedance2/video-generation)。
  </Step>
</Steps>

<Info>
  **两把钥匙，不要混用**：

  * **素材库 KEY**（icover.ai 创建）：只用于上传 / 入库 / 查询素材
  * **APIYI Seedance 视频令牌**（api.apiyi.com 创建，须勾选 `SeeDance2` 分组，2.5 与 2.0 系通用）：只用于视频生成接口

  详细说明见 [素材库](/api-capabilities/seedance2/asset-library)。
</Info>

### 真人素材的特殊流程

真人照片不能仅靠"上传入库"绕过防深伪拦截——必须由**被拍摄者本人**完成活体扫脸认证（登录本人火山账号做人脸识别），从源头锁定肖像权归属，无法由他人代为认证。具体流程：

<Steps>
  <Step title="生成真人认证链接">
    让艺人用手机扫码 / 打开链接，登录其火山账号完成活体认证
  </Step>

  <Step title="查询认证结果">
    得到该艺人专属的真人素材组 `groupId`
  </Step>

  <Step title="入库时带 groupId">
    上传素材时带上该组 `groupId`，通过人脸一致性校验后拿到 `asset://` ID。同一艺人换妆造复用同一组，无需重复认证
  </Step>
</Steps>

<Warning>
  **真人 ≠ AI 生成的写实人像**。现实中不存在对应人物的 AI 生成写实人像（例如 Nano Banana 生成的人物）属于「虚拟人」，直接走「虚拟人像入库」即可，没有授权环节。只有真实存在的人的照片才是「真人人脸」——这类图片上传不等于授权，必须被拍摄者本人完成活体认证。
</Warning>

## 常见问题

<AccordionGroup>
  <Accordion title="素材 ID 会过期吗？">
    不会。`asset://` 素材 ID 永久有效，入库一次即可反复引用。但视频生成成功后返回的 `content.video_url` 是 24 小时有效的签名直链，过期后无法访问——**请在任务成功后立即下载转存**。
  </Accordion>

  <Accordion title="上传时一张图没通过人脸一致性校验，能换一张吗？">
    可以。同一个素材组可以上传多张图（侧脸 / 多人 / 模糊可能失败，建议清晰正面）。`asset://` ID 是素材级 ID，不是图片级 ID——同一素材组内的不同图共享同一个 ID。
  </Accordion>

  <Accordion title="素材库要另外收费吗？">
    不收。虚拟人像入库、真人认证等私域素材库能力在 API易 随 Seedance 2.0 接口免费使用，不另收年费。
  </Accordion>

  <Accordion title="为什么直接传人脸图会报 400？">
    上游内容安全机制拦截。HTTP 400 不扣费，但请求被拒绝——你需要在请求前完成素材入库，再引用 `asset://` ID。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Seedance 2.0 视频生成 API](/api-capabilities/seedance2/video-generation)
* [Seedance 2.0 素材库](/api-capabilities/seedance2/asset-library)
* [素材引用实战（含完整代码）](/api-capabilities/seedance2/asset-reference)
* [Seedance 2.0 模型总览](/api-capabilities/seedance2/overview)
