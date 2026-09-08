> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Рабочий процесс генерации изображений с ИИ в Feishu Bitable

> Сквозная автоматизация, созданная сообществом: ярлык полей Feishu + Aliyun Function Compute + workflow в Coze — операторы заполняют prompt в строке Bitable, чтобы пакетно вызывать Nano Banana Pro и записывать результаты генерации изображений обратно, все без кода.

## Обзор

Это полноценный рабочий процесс уровня **превратить-Feishu-Bitable-в-линию-генерации-изображений**: операторы заполняют prompt и прикрепляют референсные файлы в строке, вложения автоматически конвертируются в OSS URL, затем workflow Coze вызывает Nano Banana Pro, а в итоге сгенерированное изображение возвращается в строку как вложение — **пользователю не нужно вносить изменения в код**.

Автор (Shuaila1996) собрал это на основе реального боевого использования; решение включает 3 независимых, но работающих вместе части: шорткат поля Feishu, функцию Aliyun Function Compute и плагин Coze.

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-bitable-architecture.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=c9131b0143cfc76b4d574ec833ec96e3" alt="Архитектура генерации изображений Feishu Bitable AI" width="2291" height="1180" data-path="images/community/coze-feishu/feishu-bitable-architecture.png" />

<Info>
  **Информация о проекте**

  * 📦 Формат: распространяется как пакет кода (**не опубликован на GitHub**)
  * 👤 Автор: Shuaila1996
  * 🎯 Сценарий использования: Feishu Enterprise Bitable + Aliyun + Coze CN
  * 🔌 Модель: `gemini-3-pro-image-preview` (Nano Banana Pro, через APIYI)
  * 📝 Полный исходный код для шортката Feishu и функции Aliyun встроен в этот документ; исходный код плагина Coze находится в [Nano Banana Pro Coze Plugin](/ru/scenarios/ecosystem/coze-nanobanana-plugin)
</Info>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Bitable как рабочая среда" icon="table">
    Операторы заполняют prompt и загружают эталонные изображения в Feishu Bitable — без кода и без редактора workflow
  </Card>

  <Card title="Автоматическое вложение → OSS" icon="cloud-upload">
    Пользовательский ярлык поля Feishu загружает бинарный файл, пересылает его в Aliyun FC, где он сжимается и отправляется в OSS
  </Card>

  <Card title="Мультиключ для каждого пользователя" icon="users">
    В workflow Coze есть словарь «API key для каждого пользователя», который направляет ключи APIYI по каждому вызывающему — для прозрачного учета использования
  </Card>

  <Card title="Пакетная генерация" icon="layers">
    Нативные пакетные операции со строками в Bitable + ярлык поля = один клик для генерации от десятков до сотен изображений
  </Card>

  <Card title="Прямая запись обратно в строку" icon="image">
    OSS URL, возвращенный из Coze, записывается обратно через официальный ярлык Feishu «URL → attachment» и отображается встроенно как вложение изображения
  </Card>

  <Card title="Понятная обработка ошибок" icon="triangle-alert">
    Ошибки модерации, отказы и тайм-ауты возвращаются в строку в виде понятного текста, их легко отсортировать и обработать
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Модель          | Идентификатор                | Назначение                                     | Документация API                                                   |
| --------------- | ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| Nano Banana Pro | `gemini-3-pro-image-preview` | Текст-в-изображение, изображение-в-изображение | [Просмотреть документацию](/en/api-capabilities/nano-banana-image) |

## Архитектура

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

## Шаги развертывания

<Steps>
  <Step title="Шаг 1: инфраструктура Aliyun">
    1. Подготовьте OSS bucket; создайте под-аккаунт RAM с разрешениями `oss:PutObject` и `oss:ProcessObject`
    2. Подготовьте Function Compute (FC); создайте функцию с HTTP-триггером на Node.js 18+
    3. Установите зависимость: `ali-oss`
    4. Настройте переменные окружения (**никогда не встраивайте ключи в код**):

    ```text theme={null}
    OSS_REGION=oss-cn-beijing
    OSS_BUCKET=your-bucket-name
    OSS_AK=your-access-key-id
    OSS_SK=your-access-key-secret
    ```

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/aliyun-fc-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=3ca1a341f9326ac88f5654de0f582024" alt="Конфигурация Aliyun Function Compute" width="2485" height="945" data-path="images/community/coze-feishu/aliyun-fc-config.png" />
  </Step>

  <Step title="Шаг 2: разверните функцию Aliyun FC">
    Разместите авторский `aliyun-fc-oss-upload.js` в вашей FC-функции. Функция:

    * Получает бинарные данные, переданные из ярлыка Feishu
    * Загружает оригинал через `client.put`
    * Сохраняет сжатую копию через `client.processObjectSave` (длинная сторона 4500 / качество 95)
    * Оборачивает сжатый публичный URL в структуру `feishuWrapper`, которую Feishu может разобрать

    После завершения обратите внимание на **публичный URL триггера** функции.
  </Step>

  <Step title="Шаг 3: создайте ярлык поля Feishu">
    Используйте [фреймворк ярлыков полей Feishu](https://feishu.feishu.cn/docx/SZFpd9v6EoHMI7xEhWhckLLfnBh), чтобы развернуть `feishu-attachment-to-oss.ts`. Две замены:

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
      Ярлыки полей Feishu работают в официальной песочнице Feishu, где **многие библиотеки Node.js недоступны**, поэтому загрузку вложений нужно разделить на «ярлык загружает бинарные данные → FC загружает в OSS». Вы не можете вызывать OSS SDK напрямую из ярлыка.
    </Warning>

    Соберите пакет и отправьте его официальной команде Feishu, чтобы загрузить в вашу корпоративную библиотеку ярлыков.
  </Step>

  <Step title="Шаг 4: настройте поля Feishu Bitable">
    Настройте следующие поля в вашем Bitable:

    | Поле             | Тип                              | Примечание                                        |
    | ---------------- | -------------------------------- | ------------------------------------------------- |
    | Prompt           | Текст                            | Инструкция пользователя для генерации изображений |
    | Target image     | Вложение                         | Целевое изображение                               |
    | Source image     | Вложение                         | Исходный материал для редактирования              |
    | Target image URL | Ярлык поля (вложение → OSS)      | Автоматически заполняет URL OSS                   |
    | Source image URL | Ярлык поля (вложение → OSS)      | Автоматически заполняет URL OSS                   |
    | Merged prompt    | Формула                          | См. ниже                                          |
    | Caller           | Пользователь / Текст             | Используется для маршрутизации API-ключей         |
    | apichoice        | Текст                            | Фиксированное значение `apiyi`                    |
    | Result URL       | Ярлык поля (вызов workflow Coze) | Запускает Coze                                    |
    | Generated image  | Ярлык поля (URL → вложение)      | Рендерит итоговое изображение                     |

    Пример формулы для `Merged prompt`:

    ```text theme={null}
    [Prompt]&CHAR(10)&"Target: "&[Target image URL]&CHAR(10)&"Source: "&[Source image URL]
    ```
  </Step>

  <Step title="Шаг 5: разверните плагин и workflow Coze">
    1. Разверните Python-плагин согласно [Nano Banana Pro Coze Plugin](/ru/scenarios/ecosystem/coze-nanobanana-plugin)
    2. Импортируйте экспорт workflow Coze от автора, который включает:
       * Узел кода для разбиения изображений и prompt
       * Узел словаря «API key для каждого пользователя» (имя вызывающего → ключ APIYI)
       * Узел плагина Nano Banana Pro
       * Агрегацию успеха / сбоя / ошибки
    3. Поддерживайте словарь «API key для каждого пользователя» внутри workflow
  </Step>

  <Step title="Шаг 6: подключите ярлык workflow Coze Feishu">
    Добавьте в Bitable либо официальный, либо собственный ярлык поля «Coze workflow call», настроенный как показано ниже:

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/feishu-coze-workflow-call.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=bfbdf1ae14d0d613ce0e84dd25392b22" alt="Конфигурация вызова workflow Coze Feishu" width="422" height="1040" data-path="images/community/coze-feishu/feishu-coze-workflow-call.png" />

    Ключевые моменты:

    * Укажите workflow token и workflow ID из Coze
    * Имена полей в шаблоне запроса должны **точно совпадать** с именами входных данных workflow Coze
    * Обязательные поля следуют флагу required workflow Coze
    * В столбце `apichoice` должно храниться `apiyi`, **а не** отображаемые строки вроде `apiyi(0.35元/张)` — иначе поиск в словаре не сработает
  </Step>

  <Step title="Шаг 7: URL → вложение для рендеринга результатов">
    Последний шаг: преобразуйте URL, который возвращает Coze, в изображение-вложение Feishu. Два варианта:

    1. **Купить напрямую**: используйте официальный ярлык поля Coze «URL → attachment»
    2. **Сделать самостоятельно**: реализуйте собственный ярлык поля URL-to-attachment, следуя документации Feishu
  </Step>
</Steps>

## Формула объединенного prompt

Формула «Merged prompt» в Bitable:

```text theme={null}
[Prompt]&CHAR(10)&"Target: "&[Target image URL]&CHAR(10)&"Source: "&[Source image URL]
```

`CHAR(10)` — это перевод строки, позволяющий узлу кода Coze разделять prompt и URL изображений по `\n`.

## Полный исходный код Feishu Field Shortcut

Ниже приведен полный `feishu-attachment-to-oss.ts`, готовый для вставки в фреймворк Feishu Field Shortcut. **Перед развертыванием нужно заменить только два `feishu-service` плейсхолдера на ваш публичный домен / URL Aliyun FC.**

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

## Полный исходный код для Aliyun Function Compute

Ниже приведен полный `aliyun-fc-oss-upload.js`, готовый к вставке в Aliyun Function Compute (Node.js 18+). **Все учётные данные читаются из переменных окружения — никогда не задавайте их в коде вручную.**

<Tip>
  Функция возвращает `feishuWrapper(...)` двухуровневую структуру: слой HTTP всегда возвращает 200 (так что Feishu's `fetch` не вызывает ошибку при non-2xx); реальный статус и полезная нагрузка находятся внутри `body` (это **строка JSON**), которую Feishu разворачивает с помощью `JSON.parse(result.body)`.
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

## Исходный код Coze-плагина

Python-плагин `coze-nanobanana-pro.py` полностью встроен в [Nano Banana Pro Coze плагин](/ru/scenarios/ecosystem/coze-nanobanana-plugin) в разделе «Полный исходный код плагина» — просто скопируйте и вставьте, отдельная загрузка не нужна.

## Примечания по безопасности

<Warning>
  Этот стек включает **API keys, Aliyun AccessKey, Feishu tokens, Coze tokens** — несколько учетных данных. Всегда:

  1. **Никогда не встраивайте ключи в код**: Aliyun FC использует env vars, Coze использует зашифрованную конфигурацию платформы, ярлык Feishu очищает реальные URL перед commit
  2. **OSS-подаккаунт, минимальные права**: только `oss:PutObject` + `oss:ProcessObject` для целевого bucket, никогда глобально
  3. **Выдавайте APIYI keys отдельно для каждого пользователя**: используйте словарь на пользователя, его легко проверять и отзывать
  4. **Подписывайте публичный trigger FC**: включите signature auth на trigger Function Compute, чтобы блокировать внешнее злоупотребление
</Warning>

## Частые вопросы

<AccordionGroup>
  <Accordion title="Шорткат Feishu не может достучаться до Aliyun FC">
    Проверьте два момента:

    1. Публичный домен FC указан в `basekit.addDomainList` (**без https\://**)?
    2. `context.fetch` использует полный URL `https://`?

    Песочница Feishu блокирует любой домен, который вы не объявили.
  </Accordion>

  <Accordion title="workflow Coze сообщает об ошибке аккаунта или конфигурации">
    Сначала проверьте:

    * Содержит ли столбец `apichoice` `apiyi` (а не отображаемые строки вроде `apiyi(0.35元/张)`)?
    * Включен ли вызывающий в словарь «per-user API key»?
    * Точно ли имя вызывающего совпадает с полем person в Bitable (пробелы, упрощенное и традиционное написание)?
  </Accordion>

  <Accordion title="Изображение сгенерировано, но Feishu его не показывает">
    По умолчанию Coze возвращает текстовый URL; для отображения Feishu нужен еще один шорткат «URL → attachment». Можно:

    1. Купить официальный шорткат Coze «URL → attachment» (проще всего)
    2. Сделать свой шорткат URL-to-attachment
  </Accordion>

  <Accordion title="Aliyun FC возвращает 500, но загрузка в OSS прошла успешно">
    Обычно проблема в параметре `processObjectSave` или несоответствии региона bucket. Проверьте:

    * Включена ли на bucket обработка изображений?
    * Совпадает ли `process.env.OSS_REGION` с фактическим регионом bucket?
    * Есть ли у RAM-субаккаунта разрешение `oss:ProcessObject`?
  </Accordion>

  <Accordion title="Как ограничить массовую генерацию?">
    Nano Banana Pro 4K работает медленно. Рекомендуется:

    * Добавить ограничения на параллельные запросы на входе workflow в Coze
    * Запускать шорткаты полей в Bitable партиями по 5–10 строк за раз
    * Распределять разные ключи APIYI между вызывающими, чтобы распределить лимиты запросов
  </Accordion>

  <Accordion title="Где полный код? Можно ли скопировать его напрямую?">
    Да — все фрагменты встроены в документацию (предоставлено Shuaila1996), готовы к копированию и вставке:

    * `feishu-attachment-to-oss.ts` (шорткат поля Feishu) → см. «Полный исходный код шортката поля Feishu» выше на этой странице
    * `aliyun-fc-oss-upload.js` (Aliyun FC) → см. «Полный исходный код Aliyun Function Compute» выше на этой странице
    * `coze-nanobanana-pro.py` (плагин Coze) → см. «Полный исходный код плагина» в [Плагин Coze для Nano Banana Pro](/ru/scenarios/ecosystem/coze-nanobanana-plugin)
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Плагин Coze для Nano Banana Pro" icon="puzzle" href="/ru/scenarios/ecosystem/coze-nanobanana-plugin">
    Код сопутствующего плагина Coze и подробное руководство — также полезно как самостоятельный материал для любого рабочего процесса Coze, которому нужен Nano Banana Pro
  </Card>

  <Card title="Документация Nano Banana Pro" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Полная документация API, тарификация и примеры генерации
  </Card>

  <Card title="FAQ по сбоям генерации изображений" icon="circle-question-mark" href="/ru/faq/nano-banana-image-failure">
    Руководство по устранению неполадок Nano Banana
  </Card>

  <Card title="Консоль APIYI" icon="settings" href="https://api.apiyi.com/token">
    Управляйте API-ключами, просматривайте использование и баланс
  </Card>
</CardGroup>
