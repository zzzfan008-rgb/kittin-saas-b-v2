> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Feishu Bitable AI画像生成ワークフロー

> コミュニティ提供のエンドツーエンド自動化: Feishuのフィールドショートカット + Aliyun Function Compute + Cozeワークフロー — 担当者はBitableの行にpromptを入力してNano Banana Proを一括呼び出しし、画像結果を書き戻すだけの、完全ノーコードの仕組みです。

## 概要

これは、**Feishu Bitable を画像制作ラインに変える**完全なワークフローです。運用担当者は1行に prompt と参照添付ファイルを入力し、添付ファイルは自動で OSS URL に変換され、その後 Coze ワークフローが Nano Banana Pro を呼び出し、最終的に生成された画像が添付ファイルとして再びその行に戻ります。**ユーザー側のコード修正は一切不要です**。

作者の Shuaila1996 が、実運用での利用からこの構成を整理したもので、Feishu のフィールドショートカット、アリババクラウド Function Compute 関数、そして Coze プラグインという、独立しつつ連携する 3 つの要素で成り立っています。

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-bitable-architecture.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=c9131b0143cfc76b4d574ec833ec96e3" alt="Feishu Bitable AI画像生成アーキテクチャ" width="2291" height="1180" data-path="images/community/coze-feishu/feishu-bitable-architecture.png" />

<Info>
  **プロジェクト情報**

  * 📦 形式: コードパッケージとして共有（**GitHub では公開していません**）
  * 👤 作者: Shuaila1996
  * 🎯 利用シーン: Feishu Enterprise Bitable + アリババクラウド + Coze CN
  * 🔌 モデル: `gemini-3-pro-image-preview` (Nano Banana Pro, via APIYI)
  * 📝 Feishu ショートカットとアリババクラウド関数の完全なソースはこのドキュメント内に埋め込まれています。Coze プラグインのソースは [Nano Banana Pro Coze プラグイン](/ja/scenarios/ecosystem/coze-nanobanana-plugin) にあります
</Info>

## 主な機能

<CardGroup cols={2}>
  <Card title="Bitable を作業台として使用" icon="table">
    オペレーターは Feishu Bitable で prompt を入力し、参考画像をアップロードします。コードもワークフローエディターも不要です
  </Card>

  <Card title="自動添付 → OSS" icon="cloud-upload">
    Feishu のカスタムフィールドショートカットがバイナリをダウンロードし、Aliyun FC に転送して圧縮し、OSS にアップロードします
  </Card>

  <Card title="ユーザーごとのマルチキー" icon="users">
    Coze のワークフローには「ユーザーごとの API key」辞書があり、APIYI の key を呼び出し元ごとに振り分けます。利用集計をきれいに行えます
  </Card>

  <Card title="一括生成" icon="layers">
    Bitable の標準バッチ行操作 + フィールドショートカット = ワンクリックで数十〜数百枚の画像を生成できます
  </Card>

  <Card title="行への直接書き戻し" icon="image">
    Coze から返された OSS URL は、Feishu の公式「URL → 添付」ショートカットで書き戻され、画像添付としてインライン表示されます
  </Card>

  <Card title="明確なエラー通知" icon="triangle-alert">
    モデレーション失敗、拒否、タイムアウトは行内にわかりやすいテキストとして返り、切り分けしやすいです
  </Card>
</CardGroup>

## 対応 APIYI モデル

| モデル             | 識別子                          | 用途              | API ドキュメント                                          |
| --------------- | ---------------------------- | --------------- | --------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | テキストから画像、画像から画像 | [ドキュメントを見る](/en/api-capabilities/nano-banana-image) |

## アーキテクチャ

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

## デプロイ手順

<Steps>
  <Step title="手順 1: Aliyun のインフラ">
    1. OSS バケットを用意し、RAM サブアカウントに `oss:PutObject` と `oss:ProcessObject` の権限を付与します
    2. Function Compute (FC) を用意し、Node.js 18+ で HTTP トリガーの関数を作成します
    3. 依存関係をインストールします: `ali-oss`
    4. 環境変数を設定します（**キーは絶対にハードコードしないでください**）:

    ```text theme={null}
    OSS_REGION=oss-cn-beijing
    OSS_BUCKET=your-bucket-name
    OSS_AK=your-access-key-id
    OSS_SK=your-access-key-secret
    ```

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/aliyun-fc-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=3ca1a341f9326ac88f5654de0f582024" alt="Aliyun Function Compute の設定" width="2485" height="945" data-path="images/community/coze-feishu/aliyun-fc-config.png" />
  </Step>

  <Step title="手順 2: Aliyun FC 関数をデプロイする">
    著者の `aliyun-fc-oss-upload.js` を FC 関数に配置します。この関数は次を行います:

    * Feishu ショートカットから転送されたバイナリを受け取ります
    * `client.put` 経由で元ファイルをアップロードします
    * `client.processObjectSave` 経由で圧縮コピーを保存します（長辺 4500 / 品質 95）
    * 圧縮済みの公開 URL を、Feishu が解析できる `feishuWrapper` 構造でラップします

    完了したら、この関数の**公開トリガー URL**を控えておきます。
  </Step>

  <Step title="手順 3: Feishu フィールドショートカットを作成する">
    [Feishu フィールドショートカットフレームワーク](https://feishu.feishu.cn/docx/SZFpd9v6EoHMI7xEhWhckLLfnBh) を使って `feishu-attachment-to-oss.ts` をデプロイします。置き換えは 2 か所です:

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
      Feishu のフィールドショートカットは Feishu 公式サンドボックス内で実行され、**多くの Node.js ライブラリは利用できません**。そのため、添付のアップロードは「ショートカットがバイナリをダウンロード → FC が OSS にアップロード」という 2 段階に分ける必要があります。ショートカットから OSS SDK を直接呼び出すことはできません。
    </Warning>

    パッケージ化して Feishu の公式チームに提出し、企業のショートカットライブラリへアップロードします。
  </Step>

  <Step title="手順 4: Feishu Bitable のフィールドを設定する">
    Bitable に次のフィールドを設定します:

    | フィールド            | 種類                            | 備考               |
    | ---------------- | ----------------------------- | ---------------- |
    | Prompt           | テキスト                          | ユーザーの画像生成指示      |
    | Target image     | 添付                            | 参照ターゲット          |
    | Source image     | 添付                            | 編集用素材            |
    | Target image URL | フィールドショートカット（添付 → OSS）        | OSS URL を自動入力    |
    | Source image URL | フィールドショートカット（添付 → OSS）        | OSS URL を自動入力    |
    | Merged prompt    | 数式                            | 下記参照             |
    | Caller           | ユーザー / テキスト                   | API key の振り分けに使用 |
    | apichoice        | テキスト                          | 固定値 `apiyi`      |
    | Result URL       | フィールドショートカット（Coze ワークフロー呼び出し） | Coze を起動         |
    | Generated image  | フィールドショートカット（URL → 添付）        | 最終画像をレンダリング      |

    `Merged prompt` の数式例:

    ```text theme={null}
    [Prompt]&CHAR(10)&"Target: "&[Target image URL]&CHAR(10)&"Source: "&[Source image URL]
    ```
  </Step>

  <Step title="手順 5: Coze プラグインとワークフローをデプロイする">
    1. [Nano Banana Pro Coze Plugin](/ja/scenarios/ecosystem/coze-nanobanana-plugin) に従って Python プラグインをデプロイします
    2. 著者の Coze ワークフロー書き出しをインポートします。内容は次のとおりです:
       * 画像と prompt を分割するコードノード
       * 「ユーザーごとの API key」辞書ノード（caller 名 → APIYI key）
       * Nano Banana Pro プラグインノード
       * 成功 / 失敗 / エラーの集約
    3. ワークフロー内の「ユーザーごとの API key」辞書を維持します
  </Step>

  <Step title="手順 6: Feishu の Coze ワークフローショートカットを接続する">
    Feishu 公式またはカスタムの「Coze ワークフロー呼び出し」フィールドショートカットを Bitable に追加し、以下のように設定します:

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-coze-workflow-call.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=bfbdf1ae14d0d613ce0e84dd25392b22" alt="Feishu Coze ワークフロー呼び出しの設定" width="422" height="1040" data-path="images/community/coze-feishu/feishu-coze-workflow-call.png" />

    要点:

    * Coze からワークフロー token とワークフロー ID を入力します
    * リクエストテンプレート内のフィールド名は Coze ワークフローの入力名と**完全に一致**させる必要があります
    * 必須フィールドは Coze ワークフローの required フラグに従います
    * `apichoice` 列には `apiyi` を入れ、`apiyi(0.35元/张)` のような表示文字列は**入れない**でください。そうしないと辞書のルックアップに失敗します
  </Step>

  <Step title="手順 7: URL → 添付で結果をレンダリングする">
    最後の手順です。Coze が返す URL を Feishu の画像添付に変換します。選択肢は 2 つあります:

    1. **直接購入**: 公式 Coze の「URL → 添付」フィールドショートカットを使います
    2. **自作する**: Feishu のドキュメントに従って、カスタムの URL→添付フィールドショートカットを実装します
  </Step>
</Steps>

## Bitable マージ式

Bitable の「マージ済み prompt」式:

```text theme={null}
[Prompt]&CHAR(10)&"Target: "&[Target image URL]&CHAR(10)&"Source: "&[Source image URL]
```

`CHAR(10)` は改行で、Coze のコードノードが prompt と image URLs を `\n` で分割できるようにします.

## Feishu フィールドショートカット完全ソース

以下は完全な `feishu-attachment-to-oss.ts` で、Feishu のフィールドショートカットフレームワークにそのまま差し込めます。**デプロイ前に、`feishu-service` のプレースホルダー 2 つだけを Aliyun FC の公開ドメイン / URL に置き換えてください。**

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

## Aliyun Function Compute 完全ソース

以下は完全な `aliyun-fc-oss-upload.js` で、Aliyun Function Compute (Node.js 18+) にそのまま貼り付けられます。**認証情報はすべて環境変数から読み込みます — 絶対にハードコードしないでください。**

<Tip>
  この関数は `feishuWrapper(...)` の二重構造を返します。HTTP レイヤーは常に 200 を返し（そのため Feishu の `fetch` は 2xx 以外で例外を投げません）、実際のステータスとペイロードは `body`（**JSON string**）の中に入り、Feishu は `JSON.parse(result.body)` でこれを展開します。
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

## Coze プラグインソース

Python プラグイン `coze-nanobanana-pro.py` は、[Nano Banana Pro Coze プラグイン](/ja/scenarios/ecosystem/coze-nanobanana-plugin) の「プラグイン完全ソース」セクションに完全に組み込まれており、別途ダウンロードする必要はありません。

## セキュリティ注意事項

<Warning>
  このスタックには **API keys、Aliyun AccessKey、Feishu tokens、Coze tokens** など、複数の認証情報が含まれます。常に次を守ってください。

  1. **キーをハードコードしない**: Aliyun FC では env vars を使い、Coze ではプラットフォームの暗号化設定を使い、Feishu のショートカットではコミット前に実URLを消去します
  2. **OSS のサブアカウント、最小権限**: 対象バケットには `oss:PutObject` + `oss:ProcessObject` のみを付与し、グローバル権限は付与しません
  3. **APIYI キーは個人ごとに配布**: ユーザー別の辞書を使うと、監査と失効が簡単です
  4. **FC の公開トリガーに署名を付与**: Function Compute トリガーで署名認証を有効にして、外部からの悪用を防ぎます
</Warning>

## よくある質問

<AccordionGroup>
  <Accordion title="Feishu ショートカットが Aliyun FC に到達できない">
    確認は 2 点です:

    1. FC の公開ドメインは `basekit.addDomainList` にありますか（**https\://** なしで）?
    2. `context.fetch` は完全な `https://` URL を使っていますか?

    Feishu のサンドボックスは、宣言していないドメインをすべてブロックします。
  </Accordion>

  <Accordion title="Coze ワークフローでアカウントまたは設定エラーと表示される">
    まず確認してください:

    * `apichoice` 列に `apiyi` が入っていますか（`apiyi(0.35元/张)` のような表示文字列ではなく）?
    * 呼び出し元は「per-user API key」辞書に登録されていますか?
    * 呼び出し元の名前は Bitable の人員フィールドと完全一致していますか（空白や簡体字・繁体字の違いも含めて）?
  </Accordion>

  <Accordion title="画像は生成されたのに Feishu に表示されない">
    Coze はデフォルトでテキストの URL を返します。Feishu で表示するには、別の「URL → attachment」ショートカットが必要です。いずれかを選んでください:

    1. Coze の公式「URL → attachment」ショートカットを購入する（最も簡単）
    2. 独自の URL-to-attachment ショートカットを作成する
  </Accordion>

  <Accordion title="Aliyun FC は 500 を返すが OSS アップロードは成功した">
    通常は `processObjectSave` パラメータかバケットリージョンの不一致です。確認してください:

    * バケットで画像処理が有効になっていますか?
    * `process.env.OSS_REGION` はバケットの実際のリージョンと一致していますか?
    * RAM サブアカウントに `oss:ProcessObject` 権限がありますか?
  </Accordion>

  <Accordion title="バッチ生成のスロットリングはどうすればよいですか?">
    Nano Banana Pro 4K は遅いです。推奨は次のとおりです:

    * Coze ワークフローの入口で同時実行数制限を追加する
    * Bitable のトリガーフィールドショートカットを一度に 5〜10 行ずつバッチ実行する
    * APIYI の異なるキーを呼び出し元ごとに分散し、レート制限を分散させる
  </Accordion>

  <Accordion title="完全なコードはどこですか？ そのままコピーできますか?">
    はい — すべての要素がドキュメント内に埋め込まれており（Shuaila1996 提供）、そのままコピペできます:

    * `feishu-attachment-to-oss.ts`（Feishu フィールドショートカット）→ このページ上部の「Feishu Field Shortcut 完全ソース」を参照してください
    * `aliyun-fc-oss-upload.js`（Aliyun FC）→ このページ上部の「Aliyun Function Compute 完全ソース」を参照してください
    * `coze-nanobanana-pro.py`（Coze プラグイン）→ [Nano Banana Pro Coze Plugin](/ja/scenarios/ecosystem/coze-nanobanana-plugin) の「プラグイン完全ソース」を参照してください
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Nano Banana Pro Coze プラグイン" icon="puzzle" href="/ja/scenarios/ecosystem/coze-nanobanana-plugin">
    Nano Banana Pro を必要とするあらゆる Coze ワークフローでも単体で役立つ、付属の Coze プラグインコードと詳細ガイドです
  </Card>

  <Card title="Nano Banana Pro ドキュメント" icon="banana" href="/en/api-capabilities/nano-banana-image">
    完全な API ドキュメント、料金、生成サンプル
  </Card>

  <Card title="画像生成失敗のよくある質問" icon="circle-question-mark" href="/ja/faq/nano-banana-image-failure">
    Nano Banana の失敗トラブルシューティングガイド
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://api.apiyi.com/token">
    API キーを管理し、使用状況と残高を確認します
  </Card>
</CardGroup>
