> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Feishu Bitable AI 이미지 생성 워크플로

> 커뮤니티 기여형 엔드투엔드 자동화: Feishu 필드 바로가기 + Aliyun Function Compute + Coze 워크플로 — 운영자가 Bitable 행에 prompt를 입력해 Nano Banana Pro를 일괄 호출하고 이미지 결과를 다시 기록하는, 완전 노코드 방식입니다.

## 개요

이 문서는 완전한 **Feishu Bitable을 이미지 생산 라인으로 전환하는** 워크플로입니다. 운영자는 한 행에 prompt와 참조 첨부파일을 채워 넣으면, 첨부파일이 자동으로 OSS URL로 변환되고, 그다음 Coze 워크플로가 Nano Banana Pro를 호출하며, 최종적으로 생성된 이미지가 첨부파일로 다시 해당 행에 들어갑니다. **사용자 측에서는 코드 작업이 전혀 필요하지 않습니다**.

작성자 Shuaila1996이 실제 운영 경험을 바탕으로 이 구성을 정리했으며, Feishu 필드 바로가기, Aliyun Function Compute 함수, Coze 플러그인이라는 서로 독립적이지만 협력하는 3가지 구성 요소로 이루어져 있습니다.

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-bitable-architecture.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=c9131b0143cfc76b4d574ec833ec96e3" alt="Feishu Bitable AI 이미지 생성 아키텍처" width="2291" height="1180" data-path="images/community/coze-feishu/feishu-bitable-architecture.png" />

<Info>
  **프로젝트 정보**

  * 📦 형식: 코드 패키지로 공유됨 (**깃허브에 게시되지 않음**)
  * 👤 작성자: Shuaila1996
  * 🎯 사용 사례: Feishu Enterprise Bitable + Aliyun + Coze CN
  * 🔌 모델: `gemini-3-pro-image-preview` (Nano Banana Pro, APIYI를 통해)
  * 📝 Feishu 바로가기와 Aliyun 함수의 전체 소스는 이 문서에 포함되어 있으며, Coze 플러그인 소스는 [Nano Banana Pro Coze Plugin](/ko/scenarios/ecosystem/coze-nanobanana-plugin)에 있습니다
</Info>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="작업대로서의 Bitable" icon="table">
    운영자가 Feishu Bitable에서 prompt를 입력하고 참조 이미지를 업로드합니다 — 코드도, 워크플로 편집기도 필요 없습니다
  </Card>

  <Card title="자동 첨부 → OSS" icon="cloud-upload">
    맞춤형 Feishu 필드 바로가기가 바이너리를 다운로드해 Aliyun FC로 전달하고, FC가 이를 압축한 뒤 OSS에 업로드합니다
  </Card>

  <Card title="사용자별 다중 키" icon="users">
    Coze 워크플로에는 “사용자별 API key” 딕셔너리가 포함되어 있어 호출자별로 APIYI 키를 라우팅합니다 — 깔끔한 사용량 집계를 위해서입니다
  </Card>

  <Card title="일괄 생성" icon="layers">
    Bitable의 기본 일괄 행 작업 + 필드 바로가기 = 한 번의 클릭으로 수십 개에서 수백 개의 이미지를 생성합니다
  </Card>

  <Card title="행에 직접 다시 쓰기" icon="image">
    Coze에서 반환된 OSS URL은 Feishu의 공식 “URL → 첨부파일” 바로가기를 통해 다시 기록되며, 이미지 첨부파일로 인라인 표시됩니다
  </Card>

  <Card title="명확한 오류 피드백" icon="triangle-alert">
    모더레이션 실패, 거부, 타임아웃은 행에 친절한 텍스트로 돌아와 우선 분류하기 쉽습니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델              | 식별자                          | 용도                   | API 문서                                          |
| --------------- | ---------------------------- | -------------------- | ----------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 텍스트-투-이미지, 이미지-투-이미지 | [문서 보기](/en/api-capabilities/nano-banana-image) |

## 아키텍처

```text theme={null}
┌──────────────────┐
│  Feishu Bitable  │ Operator fills: prompt + target/source images + caller
│  (Entry point)   │
└────────┬─────────┘
         │ ① Field shortcut trigger
         ↓
┌──────────────────┐
│ Feishu shortcut  │ Download attachment binary, forward to Aliyun FC
│ (TypeScript)     │
└────────┬─────────┘
         │ ② HTTP POST
         ↓
┌──────────────────┐
│ Aliyun FC        │ Receive binary → upload original → compress → return OSS URL
│ (Node.js)        │
└────────┬─────────┘
         │ ③ Write OSS URL back
         ↓
┌──────────────────┐
│  Feishu Bitable  │ Formula field merges prompt + OSS URLs
│  (Field merge)   │
└────────┬─────────┘
         │ ④ Coze workflow shortcut
         ↓
┌──────────────────┐
│  Coze workflow   │ Split params → pick API key → call Nano Banana Pro plugin
│                  │
└────────┬─────────┘
         │ ⑤ Return image URL
         ↓
┌──────────────────┐
│  Feishu Bitable  │ URL-to-attachment shortcut, displayed as image field
│  (Result render) │
└──────────────────┘
```

## 배포 단계

<Steps>
  <Step title="1단계: Aliyun 인프라">
    1. OSS 버킷을 프로비저닝하고; `oss:PutObject` 및 `oss:ProcessObject` 권한이 있는 RAM 하위 계정을 생성합니다
    2. Function Compute(FC)를 프로비저닝하고; Node.js 18+에서 HTTP 트리거 함수 하나를 생성합니다
    3. 의존성을 설치합니다: `ali-oss`
    4. 환경 변수를 설정합니다(**키를 절대 하드코딩하지 마십시오**):

    ```text theme={null}
    OSS_REGION=oss-cn-beijing
    OSS_BUCKET=your-bucket-name
    OSS_AK=your-access-key-id
    OSS_SK=your-access-key-secret
    ```

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/aliyun-fc-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=3ca1a341f9326ac88f5654de0f582024" alt="Aliyun Function Compute 구성" width="2485" height="945" data-path="images/community/coze-feishu/aliyun-fc-config.png" />
  </Step>

  <Step title="2단계: Aliyun FC 함수를 배포합니다">
    작성자의 `aliyun-fc-oss-upload.js`를 FC 함수에 넣습니다. 이 함수는 다음을 수행합니다.

    * Feishu 단축키에서 전달된 바이너리를 받습니다
    * `client.put`를 통해 원본을 업로드합니다
    * `client.processObjectSave`를 통해 압축본을 저장합니다(긴 변 4500 / 품질 95)
    * 압축된 공개 URL을 Feishu가 파싱할 수 있는 `feishuWrapper` 구조로 감쌉니다

    완료되면 함수의 **공개 트리거 URL**을 기록해 두십시오.
  </Step>

  <Step title="3단계: Feishu 필드 단축키를 빌드합니다">
    [Feishu 필드 단축키 프레임워크](https://feishu.feishu.cn/docx/SZFpd9v6EoHMI7xEhWhckLLfnBh)를 사용해 `feishu-attachment-to-oss.ts`를 배포합니다. 두 군데만 교체합니다:

    ```typescript theme={null}
    basekit.addDomainList([
      'your-fc.aliyun.com',  // Your FC public domain (without https://)
      'internal-api-drive-stream.feishu.cn',
    ]);

    // ...

    const uploadResp = await context.fetch(
      'https://your-fc.aliyun.com',  // Full public trigger URL
      // ...
    );
    ```

    <Warning>
      Feishu 필드 단축키는 Feishu의 공식 샌드박스에서 실행되며 **많은 Node.js 라이브러리를 사용할 수 없으므로**, 첨부 업로드는 “단축키가 바이너리를 다운로드 → FC가 OSS에 업로드”로 분리해야 합니다. 단축키에서 OSS SDK를 직접 호출할 수는 없습니다.
    </Warning>

    패키징한 뒤 Feishu의 공식 팀에 제출해 기업 단축키 라이브러리에 업로드합니다.
  </Step>

  <Step title="4단계: Feishu Bitable 필드를 구성합니다">
    Bitable에 다음 필드를 설정합니다:

    | 필드         | 유형                    | 비고                 |
    | ---------- | --------------------- | ------------------ |
    | Prompt     | 텍스트                   | 사용자의 이미지 생성 지시문    |
    | 대상 이미지     | 첨부                    | 참조 대상              |
    | 원본 이미지     | 첨부                    | 편집용 소재             |
    | 대상 이미지 URL | 필드 단축키(첨부 → OSS)      | OSS URL을 자동으로 채웁니다 |
    | 원본 이미지 URL | 필드 단축키(첨부 → OSS)      | OSS URL을 자동으로 채웁니다 |
    | 병합된 prompt | 수식                    | 아래를 참조하십시오         |
    | 호출자        | 사람 / 텍스트              | API 키 라우팅에 사용됩니다   |
    | apichoice  | 텍스트                   | 고정 값 `apiyi`       |
    | 결과 URL     | 필드 단축키(Coze 워크플로우 호출) | Coze를 트리거합니다       |
    | 생성된 이미지    | 필드 단축키(URL → 첨부)      | 최종 이미지를 렌더링합니다     |

    `Merged prompt`의 수식 예시는 다음과 같습니다:

    ```text theme={null}
    [Prompt]&CHAR(10)&"Target: "&[Target image URL]&CHAR(10)&"Source: "&[Source image URL]
    ```
  </Step>

  <Step title="5단계: Coze 플러그인과 워크플로우를 배포합니다">
    1. [Nano Banana Pro Coze Plugin](/ko/scenarios/ecosystem/coze-nanobanana-plugin)에 따라 Python 플러그인을 배포합니다
    2. 작성자의 Coze 워크플로우 내보내기를 가져오는데, 다음이 포함됩니다:
       * 이미지와 prompt를 분리하는 코드 노드
       * “사용자별 API key” 딕셔너리 노드(호출자 이름 → APIYI key)
       * Nano Banana Pro 플러그인 노드
       * 성공 / 실패 / 오류 집계
    3. 워크플로우 내부에서 “사용자별 API key” 딕셔너리를 유지합니다
  </Step>

  <Step title="6단계: Feishu의 Coze 워크플로우 단축키를 연결합니다">
    Feishu 공식 또는 사용자 지정 “Coze 워크플로우 호출” 필드 단축키를 Bitable에 추가하고, 아래와 같이 구성합니다:

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-coze-workflow-call.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=bfbdf1ae14d0d613ce0e84dd25392b22" alt="Feishu Coze 워크플로우 호출 구성" width="422" height="1040" data-path="images/community/coze-feishu/feishu-coze-workflow-call.png" />

    핵심 사항:

    * Coze의 workflow token과 workflow ID를 입력합니다
    * 요청 템플릿의 필드 이름은 Coze 워크플로우 입력 이름과 **정확히 일치**해야 합니다
    * 필수 필드는 Coze 워크플로우의 required 플래그를 따릅니다
    * `apichoice` 열에는 `apiyi`를 넣어야 하며, `apiyi(0.35元/张)` 같은 표시 문자열은 **절대** 넣으면 안 됩니다 — 그렇지 않으면 딕셔너리 조회가 실패합니다
  </Step>

  <Step title="7단계: URL → 첨부로 결과를 렌더링합니다">
    마지막 단계: Coze가 반환한 URL을 Feishu 이미지 첨부로 변환합니다. 두 가지 방법이 있습니다:

    1. **직접 구매**: 공식 Coze “URL → 첨부” 필드 단축키를 사용합니다
    2. **직접 구현**: Feishu 문서를 따라 사용자 지정 URL-첨부 필드 단축키를 구현합니다
  </Step>
</Steps>

## Bitable 병합 수식

Bitable의 “Merged prompt” 수식입니다:

```text theme={null}
[Prompt]&CHAR(10)&"Target: "&[Target image URL]&CHAR(10)&"Source: "&[Source image URL]
```

`CHAR(10)`는 줄바꿈이며, Coze 코드 노드가 prompt와 image URLs를 `\n`로 구분하도록 합니다.

## Feishu 필드 바로가기 전체 소스

아래에는 완전한 `feishu-attachment-to-oss.ts`가 있으며, Feishu 필드 바로가기 프레임워크에 바로 넣을 수 있습니다. **배포 전에, 두 개의 `feishu-service` 플레이스홀더만 Aliyun FC 공개 도메인 / URL로 교체하면 됩니다.**

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

## Aliyun Function Compute 전체 소스

아래는 Aliyun Function Compute(Node.js 18+)에 바로 붙여 넣을 수 있는 완전한 `aliyun-fc-oss-upload.js`입니다. **모든 자격 증명은 환경 변수에서 읽습니다 — 절대 하드코딩하지 마십시오.**

<Tip>
  이 함수는 `feishuWrapper(...)` 이중 계층 구조를 반환합니다. HTTP 계층은 항상 200을 반환하므로 Feishu의 `fetch`는 2xx가 아닌 응답에서 예외를 던지지 않습니다. 실제 상태와 페이로드는 `body` 안에 있으며(**JSON 문자열**), Feishu는 `JSON.parse(result.body)`로 이를 풀어냅니다.
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

## Coze Plugin Source

Python 플러그인 `coze-nanobanana-pro.py`은 [Nano Banana Pro Coze Plugin](/ko/scenarios/ecosystem/coze-nanobanana-plugin)의 “플러그인 전체 소스” 섹션에 완전히 포함되어 있습니다. 복사하여 붙여넣기만 하면 되며, 별도 다운로드는 필요 없습니다.

## 보안 참고사항

<Warning>
  이 스택에는 **API 키, Aliyun 액세스 키, Feishu tokens, Coze tokens**가 포함되어 있어 여러 자격 증명을 다룹니다. 항상:

  1. **키를 하드코딩하지 마십시오**: Aliyun FC는 환경 변수를 사용하고, Coze는 플랫폼 암호화 설정을 사용하며, Feishu 바로가기는 커밋 전에 실제 URL을 지웁니다
  2. **OSS 서브 계정, 최소 권한**: 대상 버킷에는 `oss:PutObject` + `oss:ProcessObject`만 부여하고, 전역 권한은 절대 사용하지 마십시오
  3. **APIYI 키를 사람별로 배포하십시오**: 사용자별 딕셔너리를 사용하면 감사하고 폐기하기 쉽습니다
  4. **FC 공개 트리거에 서명하십시오**: Function Compute 트리거에서 서명 인증을 활성화하여 외부 오용을 차단합니다
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Feishu 바로가기가 Aliyun FC에 연결되지 않습니다">
    두 가지를 확인합니다:

    1. FC 공개 도메인이 `basekit.addDomainList`에 있습니까 (**https\:// 제외**)?
    2. `context.fetch`이 전체 `https://` URL을 사용하고 있습니까?

    Feishu의 샌드박스는 선언하지 않은 모든 도메인을 차단합니다.
  </Accordion>

  <Accordion title="Coze 워크플로에서 계정 또는 설정 오류가 표시됩니다">
    먼저 확인합니다:

    * `apichoice` 열에 `apiyi`가 들어 있습니까(`apiyi(0.35元/张)` 같은 표시 문자열이 아니라)?
    * 호출자가 "사용자별 API key" 사전에 나열되어 있습니까?
    * 호출자의 이름이 Bitable 사람 필드와 정확히 일치합니까(공백, 간체/번체 포함)?
  </Accordion>

  <Accordion title="이미지는 생성되었지만 Feishu에 표시되지 않습니다">
    Coze는 기본적으로 텍스트 URL을 반환합니다. Feishu가 렌더링하려면 또 다른 "URL → 첨부파일" 바로가기가 필요합니다. 다음 중 하나를 선택합니다:

    1. Coze의 공식 "URL → 첨부파일" 바로가기를 구매합니다(가장 쉬움)
    2. 직접 URL-첨부파일 변환 바로가기를 만듭니다
  </Accordion>

  <Accordion title="Aliyun FC가 500을 반환하지만 OSS 업로드는 성공했습니다">
    보통 `processObjectSave` 매개변수 또는 버킷 리전 불일치 때문입니다. 다음을 확인합니다:

    * 버킷에서 이미지 처리가 활성화되어 있습니까?
    * `process.env.OSS_REGION`이 버킷의 실제 리전과 일치합니까?
    * RAM 하위 계정에 `oss:ProcessObject` 권한이 있습니까?
  </Accordion>

  <Accordion title="배치 생성을 어떻게 제한합니까?">
    Nano Banana Pro 4K는 느립니다. 권장 사항은 다음과 같습니다:

    * Coze 워크플로 진입점에 동시 실행 수 제한을 추가합니다
    * Bitable의 필드 바로가기를 한 번에 5\~10행씩 배치로 트리거합니다
    * 서로 다른 APIYI 키를 호출자별로 분산하여 요청 제한을 분산합니다
  </Accordion>

  <Accordion title="전체 코드는 어디에 있습니까? 직접 복사할 수 있습니까?">
    네 — 모든 구성 요소가 문서에 포함되어 있으며(Shuaila1996 기여), 바로 복사하여 붙여넣을 수 있습니다:

    * `feishu-attachment-to-oss.ts`(Feishu 필드 바로가기) → 이 페이지 위쪽의 "Feishu Field Shortcut Full Source"를 참조합니다
    * `aliyun-fc-oss-upload.js`(Aliyun FC) → 이 페이지 위쪽의 "Aliyun Function Compute Full Source"를 참조합니다
    * `coze-nanobanana-pro.py`(Coze 플러그인) → [Nano Banana Pro Coze Plugin](/ko/scenarios/ecosystem/coze-nanobanana-plugin)의 "Plugin Full Source"를 참조합니다
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="Nano Banana Pro Coze Plugin" icon="puzzle" href="/ko/scenarios/ecosystem/coze-nanobanana-plugin">
    동반 Coze 플러그인 코드와 상세 가이드 — Nano Banana Pro가 필요한 모든 Coze 워크플로에서도 단독으로 유용합니다
  </Card>

  <Card title="Nano Banana Pro Doc" icon="banana" href="/en/api-capabilities/nano-banana-image">
    전체 API 문서, 과금, 생성 샘플
  </Card>

  <Card title="Image generation failure FAQ" icon="circle-question-mark" href="/ko/faq/nano-banana-image-failure">
    Nano Banana 실패 문제 해결 가이드
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://api.apiyi.com/token">
    API 키를 관리하고 사용량과 잔액을 확인합니다
  </Card>
</CardGroup>
