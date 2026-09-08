> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 飞书多维表格 AI 生图方案

> 社区贡献的飞书多维表格自动化生图整链路：飞书字段捷径 + 阿里云函数计算 + Coze 工作流，让运营同学在表格里填提示词就能批量调用 Nano Banana Pro 出图入库。

## 概述

这是一套**让飞书多维表格变成生图生产线**的完整方案：运营/设计同学在表格里填写提示词、上传素材图，附件自动转 OSS 链接，再触发 Coze 工作流调用 Nano Banana Pro 出图，最后把生成结果回写到表格中作为图片附件展示——**全程零代码操作**。

方案由作者 Shuaila1996 在企业实际业务中沉淀，包含 3 个互相独立但配合使用的代码片段：飞书字段捷径、阿里云函数计算、Coze 插件。

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-bitable-architecture.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=c9131b0143cfc76b4d574ec833ec96e3" alt="飞书多维表格 AI 生图架构图" width="2291" height="1180" data-path="images/community/coze-feishu/feishu-bitable-architecture.png" />

<Info>
  **项目信息**

  * 📦 形态：代码包形式分享（**未公开在 GitHub**）
  * 👤 作者：Shuaila1996
  * 🎯 适用场景：飞书企业版多维表格 + 阿里云 + Coze 国内版
  * 🔌 调用模型：`gemini-3-pro-image-preview`（Nano Banana Pro，通过 API易 接入）
  * 📝 飞书字段捷径、阿里云函数完整源码已嵌入本文档；Coze 插件完整源码见 [Nano Banana Pro Coze 插件](/scenarios/ecosystem/coze-nanobanana-plugin)
</Info>

## 核心功能

<CardGroup cols={2}>
  <Card title="表格即工作台" icon="table">
    运营同学只需在飞书多维表格里填提示词、上传素材图，无需接触任何代码或工作流后台
  </Card>

  <Card title="附件自动转 OSS" icon="cloud-upload">
    飞书附件通过自研字段捷径下载并转发到阿里云函数计算，自动压缩后上传 OSS 拿到公网 URL
  </Card>

  <Card title="多人多 Key 管理" icon="users">
    Coze 工作流内置「人员 apikey 分离」字典，按调用人自动分配 API易 密钥，便于用量核算
  </Card>

  <Card title="批量出图" icon="layers">
    多维表格天然支持批量行操作，配合字段捷径可一键对几十上百行进行批量生图
  </Card>

  <Card title="结果直接入表" icon="image">
    Coze 返回的 OSS 链接通过飞书官方「URL 转附件」字段捷径写回表格，作为图片附件直接展示
  </Card>

  <Card title="清晰错误反馈" icon="triangle-alert">
    审核失败、违规拒绝、超时等情况会以友好文案返回到表格，便于运营快速定位问题
  </Card>
</CardGroup>

## 支持的 API易 模型

| 模型名称            | 模型标识                         | 用途      | API 文档                                      |
| --------------- | ---------------------------- | ------- | ------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 文生图、图生图 | [查看文档](/api-capabilities/nano-banana-image) |

## 整体架构

```text theme={null}
┌──────────────────┐
│  飞书多维表格    │ 运营填写：提示词 + 目标图 + 素材图 + 调用人
│  （生产入口）    │
└────────┬─────────┘
         │ ① 字段捷径触发
         ↓
┌──────────────────┐
│ 飞书字段捷径     │ 下载附件二进制，转发到阿里云 FC
│ (TypeScript)     │
└────────┬─────────┘
         │ ② HTTP POST
         ↓
┌──────────────────┐
│ 阿里云函数计算   │ 接收附件 → 上传原图 → 压缩处理 → 返回 OSS URL
│ (Node.js)        │
└────────┬─────────┘
         │ ③ 回写 OSS 链接
         ↓
┌──────────────────┐
│  飞书多维表格    │ 公式字段合并提示词 + OSS 链接
│  （字段合并）    │
└────────┬─────────┘
         │ ④ Coze 工作流字段捷径
         ↓
┌──────────────────┐
│  Coze 工作流     │ 拆参数 → 选 API Key → 调用 Nano Banana Pro 插件
│                  │
└────────┬─────────┘
         │ ⑤ 返回图片 URL
         ↓
┌──────────────────┐
│  飞书多维表格    │ URL 转附件，作为图片字段展示
│  （结果展示）    │
└──────────────────┘
```

## 部署步骤

<Steps>
  <Step title="第一步：阿里云基础设施">
    1. 开通 OSS Bucket，创建 RAM 子账号并授权 `oss:PutObject`、`oss:ProcessObject`
    2. 开通函数计算 FC，创建一个 HTTP 触发器函数，运行环境选 Node.js 18+
    3. 安装依赖：`ali-oss`
    4. 配置环境变量（**避免硬编码密钥**）：

    ```text theme={null}
    OSS_REGION=oss-cn-beijing
    OSS_BUCKET=your-bucket-name
    OSS_AK=your-access-key-id
    OSS_SK=your-access-key-secret
    ```

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/aliyun-fc-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=3ca1a341f9326ac88f5654de0f582024" alt="阿里云函数计算配置" width="2485" height="945" data-path="images/community/coze-feishu/aliyun-fc-config.png" />
  </Step>

  <Step title="第二步：部署阿里云 FC 函数">
    把作者提供的 `aliyun-fc-oss-upload.js` 完整代码部署到 FC 函数。函数核心逻辑：

    * 接收飞书字段捷径传来的图片二进制
    * `client.put` 上传原图
    * `client.processObjectSave` 压缩到长边 4500 / 质量 95
    * 把压缩图的公网 URL 包装成飞书可识别的 `feishuWrapper` 结构返回

    部署完成后获取**函数公网触发地址**，备用。
  </Step>

  <Step title="第三步：开发飞书字段捷径">
    使用 [飞书字段捷径开发框架](https://feishu.feishu.cn/docx/SZFpd9v6EoHMI7xEhWhckLLfnBh) 部署作者提供的 `feishu-attachment-to-oss.ts`。两处需要替换：

    ```typescript theme={null}
    basekit.addDomainList([
      'your-fc.aliyun.com',  // 你的函数公网域名（去掉 https://）
      'internal-api-drive-stream.feishu.cn',
    ]);

    // ...

    const uploadResp = await context.fetch(
      'https://your-fc.aliyun.com',  // 完整公网触发地址
      // ...
    );
    ```

    <Warning>
      飞书字段捷径运行在飞书官方云沙箱，**部分 Node.js 库不可用**，因此附件上传必须拆成「字段捷径下载二进制 → FC 上传 OSS」两步，无法在字段捷径里直接调用 OSS SDK。
    </Warning>

    打包后交由飞书官方人员上传到企业字段捷径库。
  </Step>

  <Step title="第四步：配置飞书多维表格">
    在飞书多维表格里准备以下字段：

    | 字段名       | 类型               | 说明          |
    | --------- | ---------------- | ----------- |
    | 需求提示词填写   | 文本               | 用户输入的图像生成指令 |
    | 目标图       | 附件               | 期望参考的目标图    |
    | 素材图       | 附件               | 改图所用的素材图    |
    | 目标图链接     | 字段捷径（附件转 OSS）    | 自动产出 OSS 链接 |
    | 素材图链接     | 字段捷径（附件转 OSS）    | 自动产出 OSS 链接 |
    | 合并提示词     | 公式               | 见下方公式       |
    | 调用人       | 人员 / 文本          | 用于分发 API 密钥 |
    | apichoice | 文本               | 固定填 `apiyi` |
    | 生成结果链接    | 字段捷径（Coze 工作流调用） | 触发 Coze     |
    | 生成图片      | 字段捷径（URL 转附件）    | 展示最终图片      |

    合并公式示例：

    ```text theme={null}
    [需求提示词填写]&CHAR(10)&"目标图："&[目标图链接]&CHAR(10)&"素材图："&[素材图链接]
    ```
  </Step>

  <Step title="第五步：部署 Coze 插件 + 工作流">
    1. 按 [Nano Banana Pro Coze 插件](/scenarios/ecosystem/coze-nanobanana-plugin) 文档部署 Python 插件
    2. 导入作者提供的 Coze 工作流包，包含：
       * 图片链接和提示词分离代码节点
       * 「人员 apikey 分离」字典节点（按调用人匹配 API 密钥）
       * Nano Banana Pro 插件节点
       * 成功 / 失败 / 错误聚合逻辑
    3. 在工作流中维护「人员 apikey 分离」字典，按团队成员姓名映射到对应的 API易 密钥
  </Step>

  <Step title="第六步：在飞书侧配置 Coze 工作流字段捷径">
    在飞书多维表格里添加官方 / 自研的「Coze 工作流调用」字段捷径，按下图配置：

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-coze-workflow-call.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=bfbdf1ae14d0d613ce0e84dd25392b22" alt="飞书 Coze 工作流调用配置" width="422" height="1040" data-path="images/community/coze-feishu/feishu-coze-workflow-call.png" />

    关键点：

    * 填入 Coze 申请的工作流令牌和工作流 ID
    * 请求模板字段名必须**严格匹配** Coze 工作流入口参数名
    * 必填项以 Coze 工作流入口勾选的字段为准
    * `apichoice` 列填 `apiyi`，**不要写成** `apiyi(0.35元/张)` 这种展示文案，否则字典匹配失败
  </Step>

  <Step title="第七步：URL 转附件展示">
    最后一步是把 Coze 返回的图片 URL 转成飞书图片附件。两种方式：

    1. **直接购买**：使用 Coze 官方提供的「URL 转附件」字段捷径
    2. **自研**：参考飞书字段捷径开发文档自行实现
  </Step>
</Steps>

## 多维表格合并公式

多维表格里的「合并提示词」公式：

```text theme={null}
[需求提示词填写]&CHAR(10)&"目标图："&[目标图链接]&CHAR(10)&"素材图："&[素材图链接]
```

`CHAR(10)` 是换行符，可以让 Coze 的代码节点用 `\n` 分割提示词与图片链接。

## 飞书字段捷径完整源码

下面是 `feishu-attachment-to-oss.ts` 的完整代码，可以直接复制到飞书字段捷径开发框架。**部署前只需把两处 `feishu-service` 改成你阿里云 FC 的公网域名/链接**。

```typescript feishu-attachment-to-oss.ts theme={null}
import {
  basekit,
  FieldComponent,
  FieldType,
  FieldCode,
} from '@lark-opdev/block-basekit-server-api';

basekit.addDomainList([
  'feishu-service',/*这里需要你们替换成阿里函数FC域名名称，名称是公网链接去掉"https:"剩余部分*/
  'internal-api-drive-stream.feishu.cn',
]);

basekit.addField({
  formItems: [
    {
      key: 'attachments',
      label: '上传图片',
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Attachment],
      },
      validator: {
        required: true,
      },
    },
    {
      key: 'bizType',
      label: '业务类型',
      component: FieldComponent.Input,
      props: {
        placeholder: '如 avatar / report / invoice',
      },
    },
  ],

  resultType: {
    type: FieldType.Text,
  },

  execute: async (formItemParams: any, context: any) => {
    const { attachments = [], bizType = 'default' } = formItemParams;

    const urls: string[] = [];

    for (const attachment of attachments) {
      if (!attachment?.tmp_url) continue;

      /* 1️⃣ 下载飞书附件（二进制） */
      const fileResp = await context.fetch(attachment.tmp_url);
      const arrayBuffer = await fileResp.arrayBuffer();

      /* 2️⃣ 调用 FC 事件函数 */
      const uploadResp = await context.fetch(
        'https://feishu-service',/*这里需要你们替换成自己的事件函数公网链接*/
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-File-Name': encodeURIComponent(attachment.name || 'file'),
            'X-Biz-Type': encodeURIComponent(bizType),
          },
          body: arrayBuffer,
        }
      );

      /* 3️⃣ 解析事件函数返回 */
      const result = await uploadResp.json();
      /**
       * result 结构：
       * {
       *   statusCode: number,
       *   headers: object,
       *   body: string  // ⚠️ JSON 字符串
       * }
       */

      if (result.statusCode !== 200) {
        throw new Error(`upload failed: ${result.body}`);
      }

      // ⚠️ 事件函数的 body 需要再 parse 一次
      const bodyObj = JSON.parse(result.body);
      urls.push(bodyObj.url);
    }

    return {
      code: FieldCode.Success,
      data: urls.join('\n'),
    };
  },
});

export default basekit;
```

## 阿里云函数计算完整源码

下面是 `aliyun-fc-oss-upload.js` 的完整代码，可以直接放进阿里云函数计算的代码编辑器（运行时 Node.js 18+）。**所有密钥都从环境变量读取，不要硬编码**。

<Tip>
  函数返回的是 `feishuWrapper(...)` 双层结构：HTTP 层固定 200，避免飞书 fetch 因非 2xx 抛异常；真正的状态码与数据放在 `body` 字段（**JSON 字符串**），飞书侧用 `JSON.parse(result.body)` 取数。
</Tip>

```javascript aliyun-fc-oss-upload.js theme={null}
'use strict';

const OSS = require('ali-oss');
const path = require('path');

const client = new OSS({
  region: process.env.OSS_REGION,
  bucket: process.env.OSS_BUCKET,
  accessKeyId: process.env.OSS_AK,
  accessKeySecret: process.env.OSS_SK,
  authorizationV4: true,
  secure: true,
  internal:true,
});

function normalizeHeaders(headers) {
  const out = {};
  if (!headers || typeof headers !== 'object') return out;
  for (const [k, v] of Object.entries(headers)) out[String(k).toLowerCase()] = v;
  return out;
}

function getHeader(headersLower, name, defVal) {
  const v = headersLower[String(name).toLowerCase()];
  return v == null ? defVal : v;
}

function isTrue(v) {
  return v === true || v === 'true' || v === 1 || v === '1';
}

function safeDecode(v) {
  if (v == null) return v;
  try {
    return decodeURIComponent(String(v));
  } catch {
    return String(v);
  }
}

function parseEvent(event) {
  // 你的环境：HTTP 触发器事件通常是 Buffer 包着 JSON
  if (Buffer.isBuffer(event)) {
    const first = event.slice(0, 1).toString();
    if (first === '{' || first === '[') {
      return JSON.parse(event.toString('utf8'));
    }
    // 非 JSON：当成原始 body（这种情况下一般拿不到 headers）
    return { __rawBody: event };
  }

  if (typeof event === 'string') {
    try {
      const obj = JSON.parse(event);
      if (obj && typeof obj === 'object') return obj;
    } catch {}
    return { __rawBody: Buffer.from(event) };
  }

  if (event && typeof event === 'object') return event;

  return {};
}

function bodyToBuffer(eventObj) {
  // 原始 body 模式（极少数）
  if (eventObj.__rawBody) return eventObj.__rawBody;

  const raw = eventObj.body;
  if (raw == null) {
    const err = new Error('Missing request body');
    err.statusCode = 400;
    throw err;
  }

  const base64 = isTrue(eventObj.isBase64Encoded);

  if (base64) {
    if (typeof raw !== 'string') {
      const err = new Error('isBase64Encoded=true but body is not string');
      err.statusCode = 400;
      throw err;
    }
    return Buffer.from(raw, 'base64');
  }

  if (Buffer.isBuffer(raw)) return raw;
  if (typeof raw === 'string') return Buffer.from(raw);

  if (typeof raw === 'object' && raw.type === 'Buffer' && Array.isArray(raw.data)) {
    return Buffer.from(raw.data);
  }

  if (ArrayBuffer.isView(raw)) return Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength);
  if (raw instanceof ArrayBuffer) return Buffer.from(new Uint8Array(raw));

  const err = new Error('Unsupported body type');
  err.statusCode = 415;
  throw err;
}

/**
 * ✅ 返回给飞书的"wrapper 结构"
 * 让飞书侧能用 result.statusCode 和 JSON.parse(result.body)
 */
function feishuWrapper(statusCode, payloadObj, extraHeaders = {}) {
  return {
    statusCode: 200, // HTTP 层保持 200，让飞书 fetch 不因非 2xx 抛异常
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadObj), // ⚠️ body 必须是字符串
    }),
  };
}

exports.handler = async (event, context) => {
  const requestId = context?.requestId || context?.fcRequestId || '';

  try {
    const eventObj = parseEvent(event);
    const headersLower = normalizeHeaders(eventObj.headers);

    // 处理 OPTIONS 预检（避免偶发调用）
    const method =
      eventObj?.httpMethod ||
      eventObj?.method ||
      eventObj?.requestContext?.http?.method ||
      '';
    if (method && method.toUpperCase() === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: '',
      };
    }

    const bodyBuf = bodyToBuffer(eventObj);
    if (!bodyBuf || bodyBuf.length === 0) {
      return feishuWrapper(400, { error: 'Empty body', requestId });
    }

    // 可选：只验收不上传（飞书侧也能解析）
    const dryRun = isTrue(getHeader(headersLower, 'x-dry-run', 'false'));
    if (dryRun) {
      return feishuWrapper(200, {
        ok: true,
        dryRun: true,
        requestId,
        size: bodyBuf.length,
        contentType: getHeader(headersLower, 'content-type', ''),
      });
    }

    const fileName = safeDecode(getHeader(headersLower, 'x-file-name', 'file')) || 'file';
    const bizTypeRaw = safeDecode(getHeader(headersLower, 'x-biz-type', 'default')) || 'default';
    const bizType = bizTypeRaw.replace(/[^a-zA-Z0-9-_]/g, '') || 'default';

    const ext = path.extname(fileName) || '.bin';
    const objectKey = `${bizType}/${Date.now()}${Math.random().toString(16).slice(2, 6)}${ext}`;

    // 关键日志（生产保留最小必要）
    console.log('[info]', JSON.stringify({
      requestId,
      size: bodyBuf.length,
      objectKey,
      contentType: getHeader(headersLower, 'content-type', ''),
      isBase64Encoded: isTrue(eventObj.isBase64Encoded),
    }));


    const result = await client.put(objectKey, bodyBuf);
    const processStr = 'image/resize,m_lfit,w_4500,h_4500/quality,Q_95';
    const compressedKey = `${bizType}/compressed/${path.basename(objectKey)}`;
    console.log('[img-save]', { objectKey, compressedKey, processStr, bucket: process.env.OSS_BUCKET });

    await client.processObjectSave(
      objectKey,              // ✅ sourceObject：刚 put 的原图 key
      compressedKey,          // ✅ targetObject：要写回 OSS 的新 key
      processStr,             // ✅ 处理串
      process.env.OSS_BUCKET  // ✅ targetBucket
    );

    const publicHost = `${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com`;
    const publicUrl = `https://${publicHost}/${compressedKey}`;

    console.log('[info]', JSON.stringify({
      requestId,
      objectKey,
      ossStatus: result?.res?.status,
    }));

    // ✅ 按飞书期待格式返回
    return feishuWrapper(200, {
      url: publicUrl,
      objectKey: compressedKey,
      size: bodyBuf.length,
    });
  } catch (e) {
    console.error('[error]', requestId, e);
    // ✅ 错误也按 wrapper 返回，飞书能走到 upload failed: result.body
    return feishuWrapper(500, { error: e.message, requestId });
  }
};
```

## Coze 插件源码

Coze 侧的 Python 插件 `coze-nanobanana-pro.py` 完整源码已嵌入到 [Nano Banana Pro Coze 插件](/scenarios/ecosystem/coze-nanobanana-plugin) 文档的"插件完整源码"章节，复制即用。

## 安全注意事项

<Warning>
  本方案涉及 **API 密钥、阿里云 AccessKey、飞书令牌、Coze 调用令牌** 多重凭证，请务必：

  1. **不要硬编码密钥**：阿里云 FC 用环境变量，Coze 插件用平台加密配置，飞书字段捷径使用前清空真实地址
  2. **OSS 子账号最小权限**：只授予对应 Bucket 的 `oss:PutObject` 和 `oss:ProcessObject`，不要给全局权限
  3. **API易 密钥分人发放**：通过「人员 apikey 分离」字典分发，便于追溯用量与吊销
  4. **公网触发器加签名**：函数计算建议开启签名鉴权，避免被外部恶意调用
</Warning>

## 常见问题

<AccordionGroup>
  <Accordion title="飞书字段捷径无法访问阿里云函数">
    检查两件事：

    1. `basekit.addDomainList` 中是否加入了函数公网域名（**去掉 https\://**）
    2. `context.fetch` 中是否用的是完整 `https://` 地址

    飞书沙箱默认禁止访问未声明的域名。
  </Accordion>

  <Accordion title="Coze 工作流提示账号或配置错误">
    优先检查：

    * 多维表格里的 `apichoice` 列是否填 `apiyi`（不要写展示文案如 `apiyi(0.35元/张)`）
    * 「人员 apikey 分离」节点字典里是否已添加对应调用人姓名
    * 调用人姓名是否与多维表格人员字段输出完全一致（含空格、繁简体）
  </Accordion>

  <Accordion title="图片生成成功但飞书不显示图片">
    Coze 工作流默认返回的是文本 URL，飞书需要再过一道「URL 转附件」字段捷径才能渲染成图片。可以：

    1. 直接购买 Coze 官方的「URL 转附件」字段捷径（最省事）
    2. 自己开发 URL 转附件字段捷径
  </Accordion>

  <Accordion title="阿里云 FC 函数返回 500 但 OSS 上传成功">
    通常是 `processObjectSave` 处理参数串与 Bucket 区域不匹配。检查：

    * Bucket 是否开启「图片处理」功能
    * `process.env.OSS_REGION` 与 Bucket 实际区域一致
    * RAM 子账号是否有 `oss:ProcessObject` 权限
  </Accordion>

  <Accordion title="批量出图时如何控制并发？">
    Nano Banana Pro 4K 出图较慢，建议：

    * 在 Coze 工作流入口加并发限制
    * 多维表格里分批次触发字段捷径，每批 5-10 行
    * 不同调用人配置不同 API易 密钥，分摊速率限制
  </Accordion>

  <Accordion title="完整代码在哪里？可以直接复制吗？">
    本方案的所有源码都已嵌入文档，作者 Shuaila1996 贡献，复制即用：

    * `feishu-attachment-to-oss.ts`（飞书字段捷径）→ 见本页"飞书字段捷径完整源码"章节
    * `aliyun-fc-oss-upload.js`（阿里云函数计算）→ 见本页"阿里云函数计算完整源码"章节
    * `coze-nanobanana-pro.py`（Coze 插件）→ 见 [Nano Banana Pro Coze 插件](/scenarios/ecosystem/coze-nanobanana-plugin) 文档的"插件完整源码"章节
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro Coze 插件" icon="puzzle" href="/scenarios/ecosystem/coze-nanobanana-plugin">
    本方案配套的 Coze 插件代码与详细说明，单独使用也能让任意 Coze 工作流接入 Nano Banana Pro
  </Card>

  <Card title="Nano Banana Pro 文档" icon="banana" href="/api-capabilities/nano-banana-image">
    查看 Nano Banana Pro 完整 API 文档、定价与生图样例
  </Card>

  <Card title="生图失败排查" icon="circle-question-mark" href="/faq/nano-banana-image-failure">
    Nano Banana 生图常见问题排查指南
  </Card>

  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量与余额
  </Card>
</CardGroup>
