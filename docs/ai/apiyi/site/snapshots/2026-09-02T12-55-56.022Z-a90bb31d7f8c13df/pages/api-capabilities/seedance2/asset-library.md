> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 素材库（人物一致性视频）

> 通过 icover.ai 素材库开放 API（API易旗下），上传图片入库拿到 asset:// 素材 ID，再经 API易 网关生成人物一致性视频。支持网页零代码操作与 REST API 批量接入，随 Seedance 2.0 接口免费使用、不另收年费。

<Info>
  **icover.ai** 是 API易（apiyi）旗下的子产品，一个用于测试 AI 视频生成的在线工具。本素材库及配套 API，是帮助开发者与客户落地「人物一致性视频」业务的服务。
</Info>

<Note>
  **素材库在 API易 免费使用，不另收年费。** 官方侧这项能力对非框架签约客户需十万元量级的年费单独采购（官网也提供购买入口）；我们重视长期用户，已把它包含在 [Seedance 2.0](/api-capabilities/seedance2/overview) 的接口价格里。面向正常调用 SD2 接口的客户，正常业务量内不额外计费。
</Note>

## 为什么需要素材库

Seedance 2.0 生成「人物一致性」视频时，**不能直接上传含人脸的参考图**（防深伪拦截），必须先把图片入库成「可信素材」，拿到一个 `asset://xxx` 形式的素材 ID，再在视频生成请求里引用它。

本服务替你完成入库：你只需要**上传图片 → 拿到素材 ID → 生成视频**。有两种用法，数据完全互通：

| 用法         | 适合谁           | 需要什么        |
| ---------- | ------------- | ----------- |
| **网页操作**   | 所有人，零代码       | 注册登录即可      |
| **API 调用** | 需要程序化批量接入的开发者 | 一个「素材库 KEY」 |

<Tip>
  **互通说明**：同一个账号，网页上传的素材和 API 上传的素材在同一个素材库里——API 建的素材会出现在网页的「素材列表 / 存档」和视频生成器的参考图选择器中，网页建的素材也能通过 API 列出。

  **素材库跟着 icover.ai 账号走，不跟 KEY 走**：同一账号下创建的所有素材库 KEY 等价，访问的是同一套素材库——KEY 只是调用凭证，不承担隔离。素材按账号隔离，你永远只能看到 / 操作自己的素材。隔离与多部门共享的具体方案见下方[常见问题](#常见问题)。
</Tip>

<Warning>
  **两把钥匙，不要混用**：

  * **素材库 KEY**（icover.ai 创建，`sk-...`）：只用于本页的素材库接口（上传 / 入库 / 查询 / 删除）。
  * **APIYI Seedance 视频令牌**（api.apiyi.com 创建，`sk-...`，须勾选 `SeeDance2` 分组，2.5 与 2.0 系通用）：只用于视频生成接口。
</Warning>

## 方式一：网页操作（推荐新手）

<Steps>
  <Step title="注册登录">
    打开 [icover.ai 素材库页面](https://icover.ai/zh/seedance-official/asset-library)，注册 / 登录。
  </Step>

  <Step title="上传入库">
    在「虚拟人像入库」Tab：选择图片（可多选）→ 点「上传并入库」。

    * 素材组可以不选，系统自动使用你的「默认素材组」；想按人物分组管理就先新建一个组
    * 图片要求：jpeg / png / webp / bmp / tiff / gif / heic；宽高比 0.4–2.5；边长 300–6000px；单张少于 30MB
  </Step>

  <Step title="复制素材 ID">
    等待十几秒，状态变「可用」后，复制 `asset://xxx` 素材 ID。
  </Step>

  <Step title="生成视频">
    到 [icover.ai 视频生成器](https://icover.ai/zh/seedance-official) 生成视频：参考图选「多模态」模式，类型选「素材」，选中你的素材，提示词里用「图片1」指代人物。
  </Step>
</Steps>

**真人素材（网页版）**：「真人认证」Tab 三步走——① 点「生成真人认证链接」，让艺人手机扫码 / 打开链接，登录其火山账号完成活体认证；② 点「查询认证结果」，得到该艺人专属的真人素材组；③ 选中该组，上传素材（图片 / 视频 / 音频），通过人脸一致性校验后拿到 `asset://` ID。同一艺人换妆造复用同一组，无需重复认证。

<Frame caption="素材库网页端：「虚拟人像入库」Tab 手动上传入库，「素材列表 / 存档」Tab 查询素材、复制 asset:// ID，「真人认证」Tab 完成真人素材认证与上传">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-web-ui.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=1a1b0294e87aeba902589f59f22ca330" alt="SeeDance 2.0 素材库网页操作界面：素材列表页展示素材卡片，含可用状态标签、asset:// 素材 ID 复制按钮与删除按钮" width="1600" height="1013" data-path="images/seedance2-asset-library-web-ui.jpg" />
</Frame>

<Tip>
  **人物一致性小技巧**：同一人物的「全身正面图 + 人脸正面无表情特写」放进同一个素材组，效果最好。
</Tip>

## 方式二：API 调用（开发者）

### 第 0 步：创建素材库 KEY

登录 icover.ai 后到「设置 → 素材库 KEY」（`icover.ai/zh/settings/apikeys`）创建一个 KEY，格式 `sk-...`。

<Frame caption="设置 → 素材库 KEY：点「创建素材库 KEY」，复制生成的 sk-... 密钥（注意与左侧「API易 Token」区分）">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-key-create.png?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=b7aef248abd888990cc0890de84d93cc" alt="icover.ai 设置页面的素材库 KEY 管理界面，包含创建素材库 KEY 按钮和已创建密钥列表" width="1600" height="679" data-path="images/seedance2-asset-library-key-create.png" />
</Frame>

之后所有素材库请求带上请求头：

```
Authorization: Bearer sk-你的素材库KEY
```

### 第 1 步：上传文件，拿公网 URL

素材文件（图片；真人素材还支持视频 / 音频）需要先变成一个公网可访问的 URL。两种途径任选：

**A. 已有公网 URL**（你自己的 CDN / 图床）→ 跳过，直接到第 2 步。

**B. 传到我们的存储**（两步：申请直传地址 → PUT 文件）：

```bash theme={null}
# 1. 申请直传地址
curl -X POST https://icover.ai/api/storage/presign \
  -H "Authorization: Bearer sk-你的素材库KEY" \
  -H "Content-Type: application/json" \
  -d '{"ext":"jpg","contentType":"image/jpeg"}'
# → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

# 2. 把文件 PUT 到 uploadUrl（注意 Content-Type 要和申请时一致）
curl -X PUT "刚才返回的uploadUrl" \
  -H "Content-Type: image/jpeg" \
  --data-binary @portrait.jpg
# 成功后，publicUrl 就是你的文件公网地址
# 视频/音频同理：ext/contentType 换成 mp4/video/mp4、mp3/audio/mpeg 等
```

### 第 2 步：素材入库

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-你的素材库KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "艺人A-正面"
  }'
# → 火山原始响应: { ..., "Result": { "Id": "asset-20260702xxxx-xxxxx" } }
```

* `groupId` 可不传：自动使用 / 创建你的「默认素材组」。想分组：先 `POST /api/asset-library/groups {"name":"艺人A"}` 拿组 ID，再在这里带上 `"groupId":"group-xxx"`
* `label` 可选，便于在网页端识别

### 第 3 步：轮询到「可用」

入库是异步的（单图约 13 秒，无 SLA），拿到 Id 后轮询：

```bash theme={null}
curl https://icover.ai/api/asset-library/assets/asset-20260702xxxx-xxxxx \
  -H "Authorization: Bearer sk-你的素材库KEY"
# → Result.Status == "Active" 即可用；"Failed" 需重传
```

建议每 3 秒查一次，90 秒未 `Active` 视为超时排查。

### 第 4 步：用素材 ID 生成视频（经 APIYI）

素材 ID 写成 `asset://<Id>`，用**你自己的 APIYI Seedance 视频令牌**（不是素材库 KEY）调 APIYI：

```bash theme={null}
curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
  -H "Authorization: Bearer sk-你的APIYI令牌" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "content": [
      {"type":"text","text":"图片1中的人物正面微笑，镜头缓慢推近，自然光"},
      {"type":"image_url","image_url":{"url":"asset://asset-20260702xxxx-xxxxx"},"role":"reference_image"}
    ],
    "ratio":"16:9","duration":5,"resolution":"720p"
  }'
# 返回 task id，轮询 GET .../tasks/{id} 直到 status=succeeded，取 content.video_url
```

<Warning>
  提示词里用「图片1」指代素材，**不要写 asset ID 原文**。
</Warning>

模型选型、定价、分辨率表见 [Seedance 2.0 概览](/api-capabilities/seedance2/overview)，视频生成接口详细参数见 [视频生成 API](/api-capabilities/seedance2/video-generation)。完整可运行的端到端脚本（上传 → 入库 → 出片 → 下载）见 [素材引用实战](/api-capabilities/seedance2/asset-reference)。

### 完整接口一览

| 接口                                             | 方法                    | 说明                                                                                                                                                                                  |
| ---------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/storage/presign`                         | POST                  | 申请文件直传地址 `{ext?, contentType?}`                                                                                                                                                     |
| `/api/asset-library/groups`                    | POST / GET            | 建素材组 `{name, description?}` / 列自己的组（含真人组）                                                                                                                                           |
| `/api/asset-library/assets`                    | POST / GET            | 入库 `{groupId?, imageUrl, label?, assetType?}`（assetType 可选 `Image` / `Video` / `Audio`，默认 Image）/ 列素材（`?groupId=`、`?pageNumber=`、`?pageSize=` 均可选，默认第 1 页、每页 100 条，pageSize 上限 100） |
| `/api/asset-library/assets/{id}`               | GET / DELETE / PATCH  | 查状态 / 删除 / 改标签 `{label}`                                                                                                                                                            |
| `/api/asset-library/real-person/sessions`      | POST / GET            | 发起真人认证 `{name?}` → 返回 H5 认证链接与查询凭证 / 列自己的认证会话                                                                                                                                       |
| `/api/asset-library/real-person/sessions/{id}` | POST / PATCH / DELETE | 查询认证结果（成功返回真人素材组 GroupId）/ 改名 `{name}` / 删除记录                                                                                                                                       |
| `/api/asset-library/records`                   | GET                   | 你的素材 + 真人认证归档（网页端数据源）                                                                                                                                                               |

**响应约定**：

* **单条接口**（建组 / 入库 / 查状态 / 删除）成功与失败均为**火山引擎原始 JSON 原文透传**。
* **列表接口**（`groups` / `assets` 的 GET）是我们合并、并过滤到你本人之后的结果，**不是逐字节原文**：火山原有字段一个不动，另附加少量以 `_` 开头的自有元信息字段（如 `_library`）。**解析时请忽略未知的 `_` 前缀字段**，后续新增这类字段不视为破坏性变更。
* 我们自身的错误为纯文本、以 `[client] ` 前缀标识（400/401/403/404/502）。
* `records`、`real-person/sessions` 的 GET/PATCH/DELETE、资产 `PATCH` 为 `{code, message, data}` JSON（code 0 = 成功）。

## 真人人脸素材（全自动 API）

真人肖像必须由被拍摄者（艺人）本人完成一次**活体认证**，从根源锁定肖像权归属。整条链路已全部 API 化，网页端「真人认证」Tab 是同一流程的界面版：

### 第 1 步：发起认证，拿 H5 链接

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions \
  -H "Authorization: Bearer sk-你的素材库KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"艺人A"}'
# → 火山原文: { "Result": { "BytedToken":"2026...", "H5Link":"https://ark.volcengine.com/..." } }
```

* `H5Link` 发给艺人，**手机打开**（或转成二维码扫码），登录其个人火山账号后完成活体认证。受光线 / 角度影响可能不通过，重试即可
* `BytedToken` 是查询凭证，我们已随会话保存；`GET /api/asset-library/real-person/sessions` 可随时列出你的会话（含 id / status / h5Link）

### 第 2 步：艺人完成认证后，查询结果

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions/{会话id} \
  -H "Authorization: Bearer sk-你的素材库KEY"
# 认证完成 → { "Result": { "GroupId": "group-xxxx" } }  ← 该艺人专属真人素材组
# 尚未完成 → 404 NotFound.<token>（火山原文；属正常现象，完成认证后再查）
```

拿到 `GroupId` 后，会话状态变 `authorized`，真人素材组已自动归档到你的账号（网页端「素材组」里也能看到）。**注意**：艺人未完成认证时查询同样返回 `NotFound`，与凭证失效无法区分；链接长期未用可能失效，重新发起一次会话即可。

### 第 3 步：向真人组提交素材

与虚拟人像同一个入库接口，带上真人组的 `groupId`；支持图片 / 视频 / 音频：

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-你的素材库KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group-xxxx",
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "艺人A-正面全身",
    "assetType": "Image"
  }'
```

之后同样轮询到 `Active`，用 `asset://<Id>` 生成视频（第 4 步不变）。

**真人素材规则与格式**：

* 一个真人组只能录**同一个人**；同一艺人换妆造复用同一组，无需重复认证
* 每次上传都做**人脸一致性校验**（视频隔秒抽帧全部通过才入库），侧脸 / 多人 / 模糊会导致失败，建议清晰正面素材
* 图片少于 30MB；视频 mp4 / mov、2–15 秒、≤50MB、宽高比 0.4–2.5；音频 mp3 / wav、2–15 秒、≤15MB

## 注意事项

<Warning>
  **asset:// ID 请当作秘密保管**：素材已在本服务层做隔离（防列出、防删除），但火山侧无法按 ID 鉴权，ID 泄露后同通道的其他调用方可以在生成请求里引用它。素材归属与隔离模型详见下方[常见问题](#常见问题)。
</Warning>

* **图片 URL 有效期**：查询 / 列表返回的素材图片预览 URL 是约 12 小时有效的临时地址，不要长期缓存；素材 ID 永久有效
* **限流**（火山账号级）：查状态 100 QPS，入库等其他操作约 10 QPS，请控制并发并做失败重试
* **网页端状态同步**：API 入库后若从未查询过状态，网页「存档」里可能显示「处理中」，到列表页点「拉取列表」即同步为真实状态

火山官方参考文档（复制到浏览器打开）：私域素材库指南 `volcengine.com/docs/82379/2333565`、录入真人形象素材 `volcengine.com/docs/82379/2315856`。

## 常见问题

<AccordionGroup>
  <Accordion title="和直接传参考图相比，素材库有什么不同？">
    直接传参考图不能包含写实人脸（防深伪拦截会拒绝）。素材库把人像入库成可信素材后，`asset://` ID 可以在任意多个生成任务里反复引用，同一角色跨集、跨镜头保持脸部和服装一致——适合漫剧、短剧、IP 角色等系列内容。真人也可以出镜：先走上文的「真人认证」流程即可。
  </Accordion>

  <Accordion title="素材库要额外付费吗？和自己去官方开通有什么区别？">
    在 API易 **免费**，随 Seedance 2.0 接口使用即可，不另收年费、不需要单独签约。

    官方侧的私域素材库对**非框架签约客户是单独收费**的，需要十万元量级的年费采购（官网也提供购买入口）——也就是说，自己去开通的话，除了模型调用费还要多一笔年费，且通常伴随企业资质与商务流程。走 API易 则只需一把 Seedance 视频令牌，素材库能力开箱即用。

    我们重视长期用户，这项成本已包含在接口价格里；面向正常调用 SD2 接口的客户，正常业务量内不额外计费。
  </Accordion>

  <Accordion title="素材库是跟账号走还是跟 KEY 走？素材隔离是怎么实现的？">
    一句话概括：**icover.ai 隔离素材，API易 统一调用——生成侧只认素材 ID，持有即可引用。**

    跟**账号**走。底层架构是：icover.ai 所有用户背后是 API易 统一的火山引擎大账号，素材库归属这个大账号；icover.ai 在服务层做了一层**按账号的隔离**——每个账号只能列出 / 查询 / 删除自己的素材，看不到其他人的素材 ID。

    KEY 不承担隔离：同一账号下的多个素材库 KEY 等价，访问的是同一套素材库。如果你有素材隔离需求（比如多客户、多业务线的数据要分开），**为每一方注册独立的 icover.ai 账号**、各自创建 KEY——在同一账号下新建 KEY 是无法实现隔离的。

    安全边界要注意：这层隔离覆盖的是"列出 / 查询 / 删除"，但火山侧无法按 ID 鉴权——`asset://` ID 一旦泄露，同通道的其他调用方就可以在生成请求里引用它，务必把素材 ID 当作秘密保管。
  </Accordion>

  <Accordion title="素材会保存在你们（API易 / icover.ai）自己的服务器上吗？">
    分两种情况，取决于你怎么把文件给我们：

    * **你自己提供公网 URL**（你的 CDN / 图床）：原文件**不经过我们**，我们只把这个地址转给火山。
    * **走 `/api/storage/presign` 上传**：文件会先存进我们的对象存储（`cdn.icover.ai`）拿到公网地址，再把地址转给火山。**这份原文件会保留在我们的存储上。**

    两种方式素材本体最终都进入火山侧处理，处理完成后返回一个 `asset://` ID。**我们自己的数据库只保存这个 ID 与你账号的归属关系**（用于上一条的「按账号隔离」），不记录素材内容本身。

    真人素材还有额外的强约束：必须由被拍摄者本人完成**活体扫脸认证**（登录本人火山账号做人脸识别），从源头锁定肖像权归属，无法由他人代为认证，具体流程见上文「真人人脸素材」。
  </Accordion>

  <Accordion title="公司内多个部门 / 团队，怎么共享或隔离素材库？">
    **共享一套素材库（推荐，最简单）**：一个账号 + 一个 KEY 即可。素材 ID 由你们自己的系统统一管理，把 `asset://` ID 分发给各部门——ID 持有即可在视频生成请求里引用（生成视频用的是各部门自己的 APIYI Seedance 视频令牌，与素材库 KEY 无关）。也可以在同一账号下建多个 KEY 分发给不同部门（便于凭证轮换 / 回收），这些 KEY 访问的仍是同一套素材库。

    **部门间素材隔离**：为每个部门注册独立的 icover.ai 账号、各自创建 KEY。注意隔离的是"列出 / 查询 / 删除"——素材 ID 泄露后仍可被引用，跨部门也不要随意扩散 ID。
  </Accordion>

  <Accordion title="是满血版的 SeeDance 2.0 吗？">
    是。APIYI 的 Seedance 通道就是官方完整能力的 `doubao-seedance-2-5-260628` 与 `doubao-seedance-2-0-260128`，模型参数、分辨率、时长与官方一致，无任何裁剪。模型详情与定价见 [Seedance 2.0 / 2.5 概览](/api-capabilities/seedance2/overview)。
  </Accordion>

  <Accordion title="用 AI 生成的写实人像算「真人」吗？上传就代表授权吗？">
    不算真人。现实中不存在对应人物的 AI 生成写实人像（比如用 Nano Banana 等模型生成的人物）属于**虚拟人**，直接走「虚拟人像入库」即可，没有授权环节。只有**真实存在的人**的照片才是「真人人脸」——这类图片上传不等于授权，虚拟人像入库通道也不接受，必须被拍摄者本人完成活体认证（见上文「真人人脸素材」）。

    三类人物素材的区别：

    | 素材类型           | 例子                 | 怎么用                                         |
    | -------------- | ------------------ | ------------------------------------------- |
    | 动漫 / 风格化角色     | 二次元、卡通、3D 卡通角色     | 不含写实人脸，一般不触发拦截：直接用公网 URL / Base64 作参考图，无需入库 |
    | 虚拟人（AI 生成写实人像） | 模型生成、现实中无此人（见下图示例） | 走本页「虚拟人像入库」，拿 `asset://` ID 引用              |
    | 真人人脸           | 艺人、模特、用户本人的照片      | 走「真人认证」全自动 API 流程，本人活体认证后即可使用               |

    <Frame caption="虚拟人像素材示例：AI 生成的写实人像，现实中不存在对应真人。人脸正面特写 + 全身正面 / 侧面 / 背面放进同一素材组，人物一致性最好">
      <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-virtual-avatar-example.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=64f656c3a49a8c678bf439d2d9b66552" alt="虚拟人像素材示例：同一 AI 生成古装女性角色的人脸特写与全身正面、侧面、背面视图" width="1600" height="900" data-path="images/seedance2-virtual-avatar-example.jpg" />
    </Frame>
  </Accordion>

  <Accordion title="像真人的数字人（虚拟人），需要审核吗？">
    不需要。虚拟人像入库是全自动的，没有人工审核、没有授权环节：上传后系统自动预处理，约 13 秒状态变「可用」，拿到 `asset://` ID 即可直接用于视频生成。只有**真人人脸**素材需要被拍摄者本人完成活体认证（见上文「真人人脸素材」）。
  </Accordion>

  <Accordion title="在其他渠道商已入库 / 已认证的素材，能迁移过来吗？">
    不能直接复用。火山的素材库和真人认证都**跟随底层账号**：在其他渠道商入库拿到的 `asset://` ID 属于对方的火山账号，在 APIYI 通道引用会报 `asset not found`，需要在本服务重新入库。

    * **虚拟人像素材**：可以程序化批量迁移——写一个脚本把原素材图片按本页 API 重新上传入库，拿到新的 `asset://` ID 后，把你系统里的旧 ID 更新为新 ID 即可。建议在自己系统里维护一层「素材 ID 映射」，业务侧只存自己的内部 ID，日后切换渠道只需更新映射，不用动业务数据。
    * **真人认证素材**：真人认证同样跟随账号，**无法迁移，必须重新认证**——需要被拍摄者本人重新完成活体认证（见上文「真人人脸素材」）。
    * **C 端产品建议**：存量素材多的 C 端产品，虚拟素材由后台程序静默迁移，用户无感知；涉及真人认证的部分，可以借「系统升级 / 新版本上线」的时机引导用户重新完成认证，体验上更自然。
  </Accordion>
</AccordionGroup>

## 联系我们

接入过程中遇到任何问题（入库失败、真人认证、批量接入、正式令牌申请等），欢迎随时与我们交流：联系方式见 [api.apiyi.com](https://api.apiyi.com) 网站首页。
