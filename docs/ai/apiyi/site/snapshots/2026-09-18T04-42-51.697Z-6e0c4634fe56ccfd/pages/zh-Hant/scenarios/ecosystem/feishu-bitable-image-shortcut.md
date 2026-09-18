> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 飛書多維表格 AI 生圖方案

> 社群貢獻的飛書多維表格自動化生圖整鏈路：飛書欄位捷徑 + 阿里雲函式計算 + Coze 工作流，讓運營同學在表格裡填提示詞就能批次呼叫 Nano Banana Pro 出圖入庫。

## 概述

這是一套**讓飛書多維表格變成生圖生產線**的完整方案：運營/設計同學在表格裡填寫提示詞、上傳素材圖，附件自動轉 OSS 連結，再觸發 Coze 工作流呼叫 Nano Banana Pro 出圖，最後把生成結果回寫到表格中作為圖片附件展示——**全程零程式碼操作**。

方案由作者 Shuaila1996 在企業實際業務中沉澱，包含 3 個互相獨立但配合使用的程式碼片段：飛書欄位捷徑、阿里雲函式計算、Coze 外掛。

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-bitable-architecture.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=c9131b0143cfc76b4d574ec833ec96e3" alt="飛書多維表格 AI 生圖架構圖" width="2291" height="1180" data-path="images/community/coze-feishu/feishu-bitable-architecture.png" />

<Info>
  **專案資訊**

  * 📦 形態：程式碼包形式分享（**未公開在 GitHub**）
  * 👤 作者：Shuaila1996
  * 🎯 適用場景：飛書企業版多維表格 + 阿里雲 + Coze 國內版
  * 🔌 呼叫模型：`gemini-3-pro-image-preview`（Nano Banana Pro，通過 API易 接入）
  * 📝 飛書欄位捷徑、阿里雲函式完整原始碼已嵌入本文件；Coze 外掛完整原始碼見 [Nano Banana Pro Coze 外掛](/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin)
</Info>

## 核心功能

<CardGroup cols={2}>
  <Card title="表格即工作臺" icon="table">
    運營同學只需在飛書多維表格裡填提示詞、上傳素材圖，無需接觸任何程式碼或工作流後臺
  </Card>

  <Card title="附件自動轉 OSS" icon="cloud-upload">
    飛書附件通過自研欄位捷徑下載並轉發到阿里雲函式計算，自動壓縮後上傳 OSS 拿到公網 URL
  </Card>

  <Card title="多人多 Key 管理" icon="users">
    Coze 工作流內建「人員 apikey 分離」字典，按呼叫人自動分配 API易 金鑰，便於用量核算
  </Card>

  <Card title="批量出圖" icon="layers">
    多維表格天然支援批次行操作，配合欄位捷徑可一鍵對幾十上百行進行批次生圖
  </Card>

  <Card title="結果直接入表" icon="image">
    Coze 返回的 OSS 連結通過飛書官方「URL 轉附件」欄位捷徑寫回表格，作為圖片附件直接展示
  </Card>

  <Card title="清晰錯誤反饋" icon="triangle-alert">
    稽核失敗、違規拒絕、超時等情況會以友好文案返回到表格，便於運營快速定位問題
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱            | 模型標識                         | 用途      | API 文件                                      |
| --------------- | ---------------------------- | ------- | ------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 文生圖、圖生圖 | [檢視文件](/api-capabilities/nano-banana-image) |

## 整體架構

```text theme={null}
┌──────────────────┐
│  飛書多維表格    │ 運營填寫：提示詞 + 目標圖 + 素材圖 + 呼叫人
│  （生產入口）    │
└────────┬─────────┘
         │ ① 欄位捷徑觸發
         ↓
┌──────────────────┐
│ 飛書欄位捷徑     │ 下載附件二進位制，轉發到阿里雲 FC
│ (TypeScript)     │
└────────┬─────────┘
         │ ② HTTP POST
         ↓
┌──────────────────┐
│ 阿里雲函式計算   │ 接收附件 → 上傳原圖 → 壓縮處理 → 返回 OSS URL
│ (Node.js)        │
└────────┬─────────┘
         │ ③ 回寫 OSS 連結
         ↓
┌──────────────────┐
│  飛書多維表格    │ 公式欄位合併提示詞 + OSS 連結
│  （欄位合併）    │
└────────┬─────────┘
         │ ④ Coze 工作流欄位捷徑
         ↓
┌──────────────────┐
│  Coze 工作流     │ 拆引數 → 選 API Key → 呼叫 Nano Banana Pro 外掛
│                  │
└────────┬─────────┘
         │ ⑤ 返回圖片 URL
         ↓
┌──────────────────┐
│  飛書多維表格    │ URL 轉附件，作為圖片欄位展示
│  （結果展示）    │
└──────────────────┘
```

## 部署步驟

<Steps>
  <Step title="第一步：阿里雲基礎設施">
    1. 開通 OSS Bucket，建立 RAM 子賬號並授權 `oss:PutObject`、`oss:ProcessObject`
    2. 開通函式計算 FC，建立一個 HTTP 觸發器函式，執行環境選 Node.js 18+
    3. 安裝依賴：`ali-oss`
    4. 配置環境變數（**避免硬編碼金鑰**）：

    ```text theme={null}
    OSS_REGION=oss-cn-beijing
    OSS_BUCKET=your-bucket-name
    OSS_AK=your-access-key-id
    OSS_SK=your-access-key-secret
    ```

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/aliyun-fc-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=3ca1a341f9326ac88f5654de0f582024" alt="阿里雲函式計算配置" width="2485" height="945" data-path="images/community/coze-feishu/aliyun-fc-config.png" />
  </Step>

  <Step title="第二步：部署阿里雲 FC 函式">
    把作者提供的 `aliyun-fc-oss-upload.js` 完整程式碼部署到 FC 函式。函式核心邏輯：

    * 接收飛書欄位捷徑傳來的圖片二進位制
    * `client.put` 上傳原圖
    * `client.processObjectSave` 壓縮到長邊 4500 / 品質 95
    * 把壓縮圖的公網 URL 包裝成飛書可識別的 `feishuWrapper` 結構返回

    部署完成後獲取**函式公網觸發地址**，備用。
  </Step>

  <Step title="第三步：開發飛書欄位捷徑">
    使用 [飛書欄位捷徑開發框架](https://feishu.feishu.cn/docx/SZFpd9v6EoHMI7xEhWhckLLfnBh) 部署作者提供的 `feishu-attachment-to-oss.ts`。兩處需要替換：

    ```typescript theme={null}
    basekit.addDomainList([
      'your-fc.aliyun.com',  // 你的函式公網域名（去掉 https://）
      'internal-api-drive-stream.feishu.cn',
    ]);

    // ...

    const uploadResp = await context.fetch(
      'https://your-fc.aliyun.com',  // 完整公網觸發地址
      // ...
    );
    ```

    <Warning>
      飛書欄位捷徑執行在飛書官方雲沙箱，**部分 Node.js 庫不可用**，因此附件上傳必須拆成「欄位捷徑下載二進位制 → FC 上傳 OSS」兩步，無法在欄位捷徑裡直接呼叫 OSS SDK。
    </Warning>

    打包後交由飛書官方人員上傳到企業欄位捷徑庫。
  </Step>

  <Step title="第四步：配置飛書多維表格">
    在飛書多維表格裡準備以下欄位：

    | 欄位名       | 型別               | 說明           |
    | --------- | ---------------- | ------------ |
    | 需求提示詞填寫   | 文本               | 使用者輸入的影像生成指令 |
    | 目標圖       | 附件               | 期望參考的目標圖     |
    | 素材圖       | 附件               | 改圖所用的素材圖     |
    | 目標圖連結     | 欄位捷徑（附件轉 OSS）    | 自動產出 OSS 連結  |
    | 素材圖連結     | 欄位捷徑（附件轉 OSS）    | 自動產出 OSS 連結  |
    | 合併提示詞     | 公式               | 見下方公式        |
    | 呼叫人       | 人員 / 文本          | 用於分發 API 金鑰  |
    | apichoice | 文本               | 固定填 `apiyi`  |
    | 生成結果連結    | 欄位捷徑（Coze 工作流呼叫） | 觸發 Coze      |
    | 生成圖片      | 欄位捷徑（URL 轉附件）    | 展示最終圖片       |

    合併公式示例：

    ```text theme={null}
    [需求提示詞填寫]&CHAR(10)&"目標圖："&[目標圖連結]&CHAR(10)&"素材圖："&[素材圖連結]
    ```
  </Step>

  <Step title="第五步：部署 Coze 外掛 + 工作流">
    1. 按 [Nano Banana Pro Coze 外掛](/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin) 文件部署 Python 外掛
    2. 匯入作者提供的 Coze 工作流包，包含：
       * 圖片連結和提示詞分離程式碼節點
       * 「人員 apikey 分離」字典節點（按呼叫人匹配 API 金鑰）
       * Nano Banana Pro 外掛節點
       * 成功 / 失敗 / 錯誤聚合邏輯
    3. 在工作流中維護「人員 apikey 分離」字典，按團隊成員姓名對映到對應的 API易 金鑰
  </Step>

  <Step title="第六步：在飛書側配置 Coze 工作流欄位捷徑">
    在飛書多維表格裡新增官方 / 自研的「Coze 工作流呼叫」欄位捷徑，按下圖配置：

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-coze-workflow-call.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=bfbdf1ae14d0d613ce0e84dd25392b22" alt="飛書 Coze 工作流呼叫配置" width="422" height="1040" data-path="images/community/coze-feishu/feishu-coze-workflow-call.png" />

    關鍵點：

    * 填入 Coze 申請的工作流令牌和工作流 ID
    * 請求模板欄位名必須**嚴格匹配** Coze 工作流入口引數名
    * 必填項以 Coze 工作流入口勾選的欄位為準
    * `apichoice` 列填 `apiyi`，**不要寫成** `apiyi(0.35元/張)` 這種展示文案，否則字典匹配失敗
  </Step>

  <Step title="第七步：URL 轉附件展示">
    最後一步是把 Coze 返回的圖片 URL 轉成飛書圖片附件。兩種方式：

    1. **直接購買**：使用 Coze 官方提供的「URL 轉附件」欄位捷徑
    2. **自研**：參考飛書欄位捷徑開發文件自行實現
  </Step>
</Steps>

## 多維表格合併公式

多維表格裡的「合併提示詞」公式：

```text theme={null}
[需求提示詞填寫]&CHAR(10)&"目標圖："&[目標圖連結]&CHAR(10)&"素材圖："&[素材圖連結]
```

`CHAR(10)` 是換行符，可以讓 Coze 的程式碼節點用 `\n` 分割提示詞與圖片連結。

## 飛書欄位捷徑完整原始碼

下面是 `feishu-attachment-to-oss.ts` 的完整程式碼，可以直接複製到飛書欄位捷徑開發框架。**部署前只需把兩處 `feishu-service` 改成你阿里雲 FC 的公網域名/連結**。

```typescript feishu-attachment-to-oss.ts theme={null}
import {
  basekit,
  FieldComponent,
  FieldType,
  FieldCode,
} from '@lark-opdev/block-basekit-server-api';

basekit.addDomainList([
  'feishu-service',/*這裡需要你們替換成阿里函式FC域名名稱，名稱是公網連結去掉"https:"剩餘部分*/
  'internal-api-drive-stream.feishu.cn',
]);

basekit.addField({
  formItems: [
    {
      key: 'attachments',
      label: '上傳圖片',
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
      label: '業務型別',
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

      /* 1️⃣ 下載飛書附件（二進位制） */
      const fileResp = await context.fetch(attachment.tmp_url);
      const arrayBuffer = await fileResp.arrayBuffer();

      /* 2️⃣ 呼叫 FC 事件函式 */
      const uploadResp = await context.fetch(
        'https://feishu-service',/*這裡需要你們替換成自己的事件函式公網連結*/
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

      /* 3️⃣ 解析事件函式返回 */
      const result = await uploadResp.json();
      /**
       * result 結構：
       * {
       *   statusCode: number,
       *   headers: object,
       *   body: string  // ⚠️ JSON 字串
       * }
       */

      if (result.statusCode !== 200) {
        throw new Error(`upload failed: ${result.body}`);
      }

      // ⚠️ 事件函式的 body 需要再 parse 一次
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

## 阿里雲函式計算完整原始碼

下面是 `aliyun-fc-oss-upload.js` 的完整程式碼，可以直接放進阿里雲函式計算的程式碼編輯器（執行時 Node.js 18+）。**所有金鑰都從環境變數讀取，不要硬編碼**。

<Tip>
  函式返回的是 `feishuWrapper(...)` 雙層結構：HTTP 層固定 200，避免飛書 fetch 因非 2xx 拋異常；真正的狀態碼與資料放在 `body` 欄位（**JSON 字串**），飛書側用 `JSON.parse(result.body)` 取數。
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
  // 你的環境：HTTP 觸發器事件通常是 Buffer 包著 JSON
  if (Buffer.isBuffer(event)) {
    const first = event.slice(0, 1).toString();
    if (first === '{' || first === '[') {
      return JSON.parse(event.toString('utf8'));
    }
    // 非 JSON：當成原始 body（這種情況下一般拿不到 headers）
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
  // 原始 body 模式（極少數）
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
 * ✅ 返回給飛書的"wrapper 結構"
 * 讓飛書側能用 result.statusCode 和 JSON.parse(result.body)
 */
function feishuWrapper(statusCode, payloadObj, extraHeaders = {}) {
  return {
    statusCode: 200, // HTTP 層保持 200，讓飛書 fetch 不因非 2xx 拋異常
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadObj), // ⚠️ body 必須是字串
    }),
  };
}

exports.handler = async (event, context) => {
  const requestId = context?.requestId || context?.fcRequestId || '';

  try {
    const eventObj = parseEvent(event);
    const headersLower = normalizeHeaders(eventObj.headers);

    // 處理 OPTIONS 預檢（避免偶發呼叫）
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

    // 可選：只驗收不上傳（飛書側也能解析）
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

    // 關鍵日誌（生產保留最小必要）
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
      objectKey,              // ✅ sourceObject：剛 put 的原圖 key
      compressedKey,          // ✅ targetObject：要寫回 OSS 的新 key
      processStr,             // ✅ 處理串
      process.env.OSS_BUCKET  // ✅ targetBucket
    );

    const publicHost = `${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com`;
    const publicUrl = `https://${publicHost}/${compressedKey}`;

    console.log('[info]', JSON.stringify({
      requestId,
      objectKey,
      ossStatus: result?.res?.status,
    }));

    // ✅ 按飛書期待格式返回
    return feishuWrapper(200, {
      url: publicUrl,
      objectKey: compressedKey,
      size: bodyBuf.length,
    });
  } catch (e) {
    console.error('[error]', requestId, e);
    // ✅ 錯誤也按 wrapper 返回，飛書能走到 upload failed: result.body
    return feishuWrapper(500, { error: e.message, requestId });
  }
};
```

## Coze 外掛原始碼

Coze 側的 Python 外掛 `coze-nanobanana-pro.py` 完整原始碼已嵌入到 [Nano Banana Pro Coze 外掛](/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin) 文件的"外掛完整原始碼"章節，複製即用。

## 安全注意事項

<Warning>
  本方案涉及 **API 金鑰、阿里雲 AccessKey、飛書令牌、Coze 呼叫令牌** 多重憑證，請務必：

  1. **不要硬編碼金鑰**：阿里雲 FC 用環境變數，Coze 外掛用平臺加密配置，飛書欄位捷徑使用前清空真實地址
  2. **OSS 子賬號最小權限**：只授予對應 Bucket 的 `oss:PutObject` 和 `oss:ProcessObject`，不要給全域性權限
  3. **API易 金鑰分人發放**：通過「人員 apikey 分離」字典分發，便於追溯用量與吊銷
  4. **公網觸發器加簽名**：函式計算建議開啟簽名鑑權，避免被外部惡意呼叫
</Warning>

## 常見問題

<AccordionGroup>
  <Accordion title="飛書欄位捷徑無法訪問阿里雲函式">
    檢查兩件事：

    1. `basekit.addDomainList` 中是否加入了函式公網域名（**去掉 https\://**）
    2. `context.fetch` 中是否用的是完整 `https://` 地址

    飛書沙箱預設禁止訪問未宣告的域名。
  </Accordion>

  <Accordion title="Coze 工作流提示賬號或配置錯誤">
    優先檢查：

    * 多維表格裡的 `apichoice` 列是否填 `apiyi`（不要寫展示文案如 `apiyi(0.35元/張)`）
    * 「人員 apikey 分離」節點字典裡是否已新增對應呼叫人姓名
    * 呼叫人姓名是否與多維表格人員欄位輸出完全一致（含空格、繁簡體）
  </Accordion>

  <Accordion title="圖片生成成功但飛書不顯示圖片">
    Coze 工作流預設返回的是文本 URL，飛書需要再過一道「URL 轉附件」欄位捷徑才能渲染成圖片。可以：

    1. 直接購買 Coze 官方的「URL 轉附件」欄位捷徑（最省事）
    2. 自己開發 URL 轉附件欄位捷徑
  </Accordion>

  <Accordion title="阿里雲 FC 函式返回 500 但 OSS 上傳成功">
    通常是 `processObjectSave` 處理引數串與 Bucket 區域不匹配。檢查：

    * Bucket 是否開啟「圖片處理」功能
    * `process.env.OSS_REGION` 與 Bucket 實際區域一致
    * RAM 子賬號是否有 `oss:ProcessObject` 權限
  </Accordion>

  <Accordion title="批量出圖時如何控制併發？">
    Nano Banana Pro 4K 出圖較慢，建議：

    * 在 Coze 工作流入口加併發限制
    * 多維表格裡分批次觸發欄位捷徑，每批 5-10 行
    * 不同調用人配置不同 API易 金鑰，分攤速率限制
  </Accordion>

  <Accordion title="完整程式碼在哪裡？可以直接複製嗎？">
    本方案的所有原始碼都已嵌入文件，作者 Shuaila1996 貢獻，複製即用：

    * `feishu-attachment-to-oss.ts`（飛書欄位捷徑）→ 見本頁"飛書欄位捷徑完整原始碼"章節
    * `aliyun-fc-oss-upload.js`（阿里雲函式計算）→ 見本頁"阿里雲函式計算完整原始碼"章節
    * `coze-nanobanana-pro.py`（Coze 外掛）→ 見 [Nano Banana Pro Coze 外掛](/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin) 文件的"外掛完整原始碼"章節
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro Coze 外掛" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin">
    本方案配套的 Coze 外掛程式碼與詳細說明，單獨使用也能讓任意 Coze 工作流接入 Nano Banana Pro
  </Card>

  <Card title="Nano Banana Pro 文件" icon="banana" href="/api-capabilities/nano-banana-image">
    檢視 Nano Banana Pro 完整 API 文件、定價與生圖樣例
  </Card>

  <Card title="生圖失敗排查" icon="circle-question-mark" href="/zh-Hant/faq/nano-banana-image-failure">
    Nano Banana 生圖常見問題排查指南
  </Card>

  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量與餘額
  </Card>
</CardGroup>
