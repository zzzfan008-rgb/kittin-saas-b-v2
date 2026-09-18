> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Плагин Coze для Nano Banana Pro

> Созданный сообществом Python-плагин для платформы Coze, который оборачивает вызовы Nano Banana Pro (Gemini 3 Pro Image), классификацию ошибок и загрузку в OSS — позволяя вашему workflow в Coze выполнять генерацию изображений по тексту, преобразование изображения в изображение и прямую доставку результата в одном узле.

## Обзор

Это кастомный Python-плагин для [платформы Coze](https://www.coze.cn), который оборачивает модель Nano Banana Pro от APIYI (`gemini-3-pro-image-preview`) в узел, который любой workflow Coze может вызывать напрямую. Плагин включает полноценный конструктор запросов, детальную классификацию ошибок, обнаружение нарушений контента и загрузку в Aliyun OSS — **на выходе вы получаете публичный URL, готовый к отображению**, поэтому вам не нужен дополнительный узел пересылки на последующих этапах.

<Info>
  **Информация о проекте**

  * 📦 Форма: распространяется как пакет кода (**не опубликован на GitHub**)
  * 👤 Автор: Shuaila1996
  * 🎯 Платформы: пользовательские плагины Coze CN / Global
  * 🔌 Модель: `gemini-3-pro-image-preview` (через APIYI)
  * 📝 Полный исходный код встроен ниже в разделе «Полный исходный код плагина» — просто скопируйте и вставьте, отдельная загрузка не нужна
</Info>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Единый text-to-image / image-to-image" icon="wand-sparkles">
    Автоматически переключается между режимами txt2img и img2img в зависимости от того, пуст ли `fileurls` — вам не нужны две параллельные ветки в рабочем процессе
  </Card>

  <Card title="Редактирование по нескольким референсам" icon="images">
    Передайте массив URL изображений, и они будут загружены и внедрены как `inline_data`, с сохранением исходных деталей
  </Card>

  <Card title="Гранулярная классификация ошибок" icon="shield-check">
    Различает `ZERO_CANDIDATES_TOKEN`, `FINISH_REASON`, `INLINE_DATA_EMPTY`, `TEXT_RESPONSE` и другие, чтобы ветки workflow могли реагировать точно
  </Card>

  <Card title="Автоматическая маркировка нарушений" icon="ban">
    Для prompts на удаление водяных знаков / face-swap / NSFW / выход за пределы knowledge cutoff возвращает понятный тип отказа вместо того, чтобы заставлять пользователей гадать
  </Card>

  <Card title="Прямая загрузка в OSS" icon="cloud-upload">
    Результат base64 загружается напрямую в Aliyun OSS — ваш рабочий процесс получает URL, готовый к публикации или хранению
  </Card>

  <Card title="Таймаут с учетом разрешения" icon="hourglass">
    Независимые таймауты для 1K / 2K / 4K (360s / 600s / 1200s), чтобы задания 4K HD не обрывались раньше времени
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Модель          | Идентификатор                | Использование                                  | Документация API                                                  |
| --------------- | ---------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | текст-в-изображение, изображение-в-изображение | [Посмотреть документацию](/en/api-capabilities/nano-banana-image) |

<Tip>
  Плагин вызывает эндпоинт `https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent` APIYI (нативный протокол Gemini), идентичный Google AI Studio — поэтому существующие prompt переносятся без проблем.
</Tip>

## Архитектура плагина

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=7052279e4466fdab5319e94e6a2592fc" alt="Конфигурация плагина Coze" width="2550" height="1244" data-path="images/community/coze-feishu/coze-plugin-config.png" />

Основной поток:

```text theme={null}
Coze workflow input (cleantext / fileurls / aspect_ratio / resolution / apikey)
        ↓
    handler() entry
        ↓
generate_image()  — build parts + call APIYI endpoint
        ↓
   parse candidates / fallback errors
        ↓
upload_base64_to_oss()  — upload to Aliyun OSS
        ↓
return { analysis, url, error }
```

## Входные и выходные данные

### Вход

| Поле           | Тип       | Обязательное | Описание                                                                             |
| -------------- | --------- | ------------ | ------------------------------------------------------------------------------------ |
| `cleantext`    | string    | yes          | Пользовательский prompt или инструкция по редактированию                             |
| `fileurls`     | string\[] | no           | URL-адреса reference image; пустое значение запускает text-to-image                  |
| `aspect_ratio` | string    | yes          | Соотношение сторон, например `1:1`, `16:9`, `9:16`                                   |
| `resolution`   | string    | yes          | Разрешение, должно быть в верхнем регистре: `1K` / `2K` / `4K`                       |
| `apikey`       | string    | yes          | Ключ APIYI (рекомендуется: распределять по каждому пользователю через upstream node) |

### Выход

| Поле       | Тип            | Описание                                      |
| ---------- | -------------- | --------------------------------------------- |
| `analysis` | string         | Метка статуса: `图片生成成功` / `图片生成失败`            |
| `url`      | string \| null | Общедоступный URL OSS при успешном выполнении |
| `error`    | string \| null | Понятное сообщение об ошибке при сбое         |

## Развертывание

<Steps>
  <Step title="Шаг 1: Подготовьте учётные данные APIYI и OSS">
    * Сгенерируйте ключ APIYI (начинается с `sk-`) в [APIYI Console](https://api.apiyi.com/token)
    * Создайте бакет Aliyun OSS и RAM-подучётную запись с разрешением `oss:PutObject` для этого бакета
    * Запишите `AccessKey ID`, `AccessKey Secret`, `Bucket name` и `Endpoint` (например, `oss-cn-beijing.aliyuncs.com`)
  </Step>

  <Step title="Шаг 2: Создайте пользовательский плагин в Coze">
    1. Перейдите в Coze Workspace → Library → Create custom plugin
    2. Выберите «Cloud-side plugin — create in Coze IDE»
    3. Runtime: **Python**
    4. Добавьте зависимости: `requests`, `oss2`
  </Step>

  <Step title="Шаг 3: Вставьте код плагина">
    Скопируйте полный Python-код из раздела «Полный исходный код плагина» ниже в Coze IDE, затем замените 4 строки конфигурации OSS в начале файла на свои значения:

    ```python theme={null}
    # Aliyun OSS configuration
    ACCESS_KEY_ID = "your-AK"
    ACCESS_KEY_SECRET = "your-SK"
    BUCKET_NAME = "your-bucket"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="Шаг 4: Настройте метаданные, входные и выходные данные">
    Настройте поля Input / Output и обязательные флаги, как указано ниже, в соответствии с полями `args.input` в коде:

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-metadata.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=991fd5bb9fba689f2629b122b274f088" alt="Конфигурация метаданных плагина Coze" width="2478" height="1114" data-path="images/community/coze-feishu/coze-plugin-metadata.png" />
  </Step>

  <Step title="Шаг 5: Проверьте и опубликуйте">
    * В Coze IDE заполните тестовые параметры (рекомендуется: 1K + простой prompt, чтобы сначала проверить путь OSS)
    * Когда индикатор станет зелёным, нажмите «Опубликовать», и узел можно будет перетаскивать в любой workflow
  </Step>
</Steps>

## Стратегия классификации ошибок

Плагин не просто возвращает boolean — он определяет причины сбоя в таком порядке приоритета, чтобы ветви workflow могли реагировать по-разному:

| Приоритет | Тип ошибки              | Триггер                                   | Рекомендуемое действие                                                                 |
| --------- | ----------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| 1         | `ZERO_CANDIDATES_TOKEN` | `usageMetadata.candidatesTokenCount == 0` | Prompt или image помечены в moderation; переписать                                     |
| 2         | `NO_CANDIDATES`         | `candidates` is empty                     | Системная ошибка; повторить попытку                                                    |
| 3         | `FINISH_REASON`         | `finishReason` not `STOP`                 | Сопоставлено: `PROHIBITED_CONTENT` / `SAFETY` / и т. д.                                |
| 4         | `NO_PARTS`              | `content.parts` is empty                  | Повторить попытку                                                                      |
| 5         | `INLINE_DATA_EMPTY`     | `inlineData` present but `data` empty     | Повторить попытку или перефразировать                                                  |
| 6         | `TEXT_RESPONSE`         | Возвращён только текст                    | Автоматически классифицируется как водяной знак / замена лица / NSFW / отсечка по году |

## Полный исходный код плагина

Ниже приведен полный `coze-nanobanana-pro.py`. Вы можете скопировать его в Coze IDE как есть — **просто обновите 4 строки конфигурации OSS вверху**, и он будет готов к публикации.

```python coze-nanobanana-pro.py theme={null}
from runtime import Args
from typings.nanobanana_apiyi.nanobanana_apiyi import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re
from datetime import datetime



# 阿里云 OSS 配置
ACCESS_KEY_ID = ""  #填入自己的阿里云 Access Key ID
ACCESS_KEY_SECRET = "" #填入自己的阿里云 Access Key Secret
BUCKET_NAME = "" #填入自己的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com" #填入自己的阿里云 OSS Endpoint，例如 "oss-cn-beijing.aliyuncs.com"

# 分辨率超时时间
TIMEOUT = {
    "1K": 360,  # 快速预览
    "2K": 600,  # 推荐使用
    "4K": 1200,  # 超高清
}

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回链接
    支持带 data:image/...;base64, 前缀 和 纯 base64 两种情况
    """
    # 去掉 data:image/...;base64, 前缀
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/generated_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"

# ==============================
# 工具函数：根据 URL 猜测 MIME 类型
# ==============================

def guess_mime_from_url(url: str) -> str:
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    # 默认
    return "image/png"

# ==============================
# 核心：生成 / 编辑图片
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str, apikey:str,apiurl:str,image_urls=None):
    """
    生成 / 编辑图片的核心函数

    - 如果 image_urls 为空：纯文生图
    - 如果 image_urls 不为空：把 URL 指向的图片下载下来，按 inline_data 方式传给 API，实现改图
    """

    # 组装 parts
    parts = []

    # 1. 如果有图片 URL，则按 apiyi 改图 demo 的方式构造 inline_data
    if image_urls:
        for url in image_urls:
            try:
                resp = requests.get(url, timeout=180)
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "error": f"图片上传阶段，获取图片失败（{url}）HTTP {resp.status_code}"
                    }

                image_bytes = resp.content
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                mime_type = guess_mime_from_url(url)

                parts.append({
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": image_base64
                    }
                })
            except Exception as e:
                return {
                    "success": False,
                    "error": f"图片上传阶段，获取图片失败（{url}）: {e}"
                }

    # 2. 文字部分（编辑指令或文生图提示词）
    #    注意：这里不再把图片 URL 塞进 prompt 里，仅用纯文字描述
    if prompt:
        parts.append({"text": prompt})
    else:
        # 没有文字时给一个默认提示（可按需要修改）
        parts.append({"text": "根据图片进行合理的编辑生成。"})

    # 3. 构造请求 payload（和官方改图 demo 一致的结构）
    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "image_size": resolution
            }
        }
    }

    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(apiurl, headers=headers, json=payload, timeout=TIMEOUT[resolution])

        # HTTP 非200
        if response.status_code != 200:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}

        # JSON 解析
        try:
            data = response.json()
        except ValueError:
            return {"success": False, "error": "响应不是有效JSON", "response": (response.text or "")[:500]}

        # 1️⃣ 最高优先级：candidatesTokenCount
        usage = data.get("usageMetadata") or {}
        if usage.get("candidatesTokenCount") == 0:
            return {
                "success": False,
                "errorType": "ZERO_CANDIDATES_TOKEN",
                "error": "❌ 内容审核失败\n您的请求在内容审核阶段被拒绝，请修改提示词或图片",
                "response": data
            }

        # 2️⃣ candidates 检查
        candidates = data.get("candidates")
        if not isinstance(candidates, list) or len(candidates) == 0:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试",
                "response": data
            }

        candidate = candidates[0] if isinstance(candidates[0], dict) else None
        if candidate is None:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系统出错，请稍后重试（candidates[0]结构异常）",
                "response": data
            }

        # 3️⃣ finishReason
        finish_reason = candidate.get("finishReason")
        if isinstance(finish_reason, str) and finish_reason != "STOP":
            reason_map = {
                "PROHIBITED_CONTENT": "内容违反安全策略，已被拒绝处理",
                "SAFETY": "内容触发了安全过滤器",
                "RECITATION": "内容可能涉及版权问题",
                "MAX_TOKENS": "内容长度超出限制",
            }
            return {
                "success": False,
                "errorType": "FINISH_REASON",
                "finishReason": finish_reason,
                "error": reason_map.get(finish_reason, f"请求被拒绝：{finish_reason}"),
                "response": data
            }

        # 4️⃣ content.parts
        content = candidate.get("content") or {}
        parts = content.get("parts")
        if not isinstance(parts, list) or len(parts) == 0:
            return {
                "success": False,
                "errorType": "NO_PARTS",
                "error": "生成失败，请重试（content.parts为空）",
                "response": data
            }

        # 5️⃣ 提取图片和文本（更精准：识别 inlineData 存在但 data 为空）
        images = []
        texts = []
        saw_inline_but_empty = False

        for i, part in enumerate(parts):
            if not isinstance(part, dict):
                continue

            # 收集 text（即使有 thoughtSignature，也照收）
            t = part.get("text")
            if isinstance(t, str) and t.strip() and not t.startswith("data:image/"):
                texts.append(t.strip())

            # 兼容 inlineData / inline_data
            inline = None
            if isinstance(part.get("inlineData"), dict):
                inline = part["inlineData"]
            elif isinstance(part.get("inline_data"), dict):
                inline = part["inline_data"]

            if inline is not None:
                b64 = inline.get("data")
                if not isinstance(b64, str) or not b64.strip():
                    saw_inline_but_empty = True
                    continue
                images.append(b64.strip())

        # ✅ 更精准：inlineData 存在但全都没 data
        if not images and saw_inline_but_empty:
            return {
                "success": False,
                "errorType": "INLINE_DATA_EMPTY",
                "error": "生成失败：检测到 inlineData 但图片数据为空（inlineData.data为空）",
                "response": data
            }

        # 6️⃣ 有图片：成功（保持你原来的返回结构）
        if images:
            return {"success": True, "image_data": images[0]}

        # 7️⃣ 无图片：有文本 -> TEXT_RESPONSE
        if texts:
            text_content = "\n".join(texts)

            # —— 可选：不做函数，直接就地识别类型（想更简单可删掉这段 detectedType）——
            low = text_content.lower()
            detected = "general"
            if any(k in low for k in ["watermark", "remove watermark", "去水印", "移除水印", "删除水印"]):
                detected = "拒绝处理水印任务"
            elif any(k in low for k in ["faceswap", "face swap", "换脸", "deepfake"]):
                detected = "拒绝处理换脸任务"
            elif any(k in low for k in ["sexually", "explicit", "porn", "nude", "nsfw", "色情", "不雅", "裸"]):
                detected = "拒绝色情任务"
            elif any(str(y) in low for y in range(2026, 2101)):
                detected = "拒绝超过知识库范围任务"

            return {
                "success": False,
                "errorType": "TEXT_RESPONSE",
                "error": detected,   # 你文档要求：直接展示 API text
                "response": data
            }

        # ✅ 更精准：parts 有结构但既无图也无文本
        return {
            "success": False,
            "error": "生成失败：parts存在但未找到图片数据或文本说明",
            "response": data
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": f"图片生成请求超时（超过 {TIMEOUT[resolution]} 秒）"}
    except Exception as e:
        return {"success": False, "error": f"图片生成请求失败: {str(e)}"}


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / NanobananaPro 节点入口

    - args.input.cleantext: 用户文字提示词
    - args.input.fileurls:  用户上传图片的 URL 列表（用于改图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "9:16"
    - args.input.resolution: 分辨率，如 "1K" / "2K" / "4K"
    """
    API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"
    API_KEY = args.input.apikey
    cleanttext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspectratio = args.input.aspect_ratio
    resolution = args.input.resolution
    # - 图片通过 image_urls 传入 generate_image，走 inline_data 改图逻辑
    prompt = cleanttext.strip()

    # 调用 Gemini 3 Pro 生成 / 编辑图片
    # 如果 fileurls 不为空，会按"改图"模式调用

    result = generate_image(prompt, aspectratio, resolution, API_KEY,API_URL,image_urls=fileurls if fileurls else None)

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {"analysis": "图片生成成功", "url": oss_url, "error": None}
    else:
        return {"analysis": "图片生成失败", "url": None, "error": result["error"]}
```

## Использование в workflow Coze

После публикации перетащите узел плагина в ваш рабочий процесс Coze и подключите его так:

```text theme={null}
Start node (user prompt + images)
    ↓
Prompt / image splitter (code node)
    ↓
Per-user API key dictionary (route by caller name)
    ↓
nanobanana_apiyi plugin node (this plugin)
    ↓
Success / failure branch
    ↓
End node (output url or error)
```

<Tip>
  Сочетайте его с [рабочим процессом генерации изображений с ИИ для Feishu Bitable](/ru/scenarios/ecosystem/feishu-bitable-image-shortcut) для конвейера без кода — операторам достаточно заполнять строки в Feishu Bitable, чтобы массово генерировать изображения.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Почему загружать в OSS, а не возвращать base64?">
    Нисходящим узлам workflow Coze (особенно ярлыкам полей Feishu) обычно нужен **доступный URL**, чтобы преобразовать результаты во вложения изображений. При возврате base64 данные неэффективно проходят через workflow, и Feishu не может отобразить их напрямую. Ссылки OSS также делают долговременное архивирование и внешнее распространение тривиальными.
  </Accordion>

  <Accordion title="Можно ли использовать переменные окружения для конфигурации OSS?">
    Пользовательские плагины Coze пока не предоставляют системные переменные окружения. Рекомендуемый подход: храните учетные данные OSS как константы в верхней части файла и защищайте их с помощью функции шифрования плагинов Coze. Для многопользовательских workflow также записывайте префиксы для каждого tenant в путь OSS.
  </Accordion>

  <Accordion title="Почему apikey передается, а не задается жестко?">
    Чтобы распределять разные ключи для каждого вызывающего. Добавьте выше по потоку узел-словарь «API key для каждого пользователя», который сопоставляет имя вызывающего с его ключом APIYI — это удобно для учета использования и контроля доступа.
  </Accordion>

  <Accordion title="Генерация 4K по-прежнему завершается по тайм-ауту?">
    Генерация 4K в Nano Banana Pro действительно медленная (обычно 5–15 минут). Плагин уже настраивает тайм-аут 1200 секунд для 4K. Если тайм-аут все еще возникает:

    1. Переключитесь на 2K, чтобы отладить свой prompt
    2. Проверьте лимиты запросов в консоли APIYI
    3. Уменьшите количество параллельных запросов
  </Accordion>

  <Accordion title="Что делать с ошибками TEXT_RESPONSE?">
    Обычно это означает, что модель отказала (нарушение, ограничение по году и т. д.). Плагин автоматически классифицирует тип: удаление водяных знаков / замена лица / NSFW / год > 2025. Покажите пользователю поле `error` — **не повторяйте попытку**, результат будет тем же.
  </Accordion>

  <Accordion title="Где находится полный исходный код? Можно ли скопировать его напрямую?">
    Да. Раздел «Полный исходный код плагина» выше содержит полный `coze-nanobanana-pro.py` (предоставлен Shuaila1996). **Просто обновите 4 строки конфигурации OSS вверху** и вставьте его в Coze IDE — отдельная загрузка не нужна.

    Если вам также нужны:

    * Ярлык полей Feishu → см. «Полный исходный код ярлыка полей Feishu» в [Workflow генерации изображений AI в Feishu Bitable](/ru/scenarios/ecosystem/feishu-bitable-image-shortcut)
    * Код Aliyun FC → см. «Полный исходный код Aliyun Function Compute» в том же документе
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Генерация изображений с ИИ в Feishu Bitable" icon="table" href="/ru/scenarios/ecosystem/feishu-bitable-image-shortcut">
    Идеальный компаньон: подключите этот рабочий процесс Coze к Feishu Bitable, чтобы операторам достаточно было заполнять строки для пакетной генерации
  </Card>

  <Card title="Документация Nano Banana Pro" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Полная документация по API Nano Banana Pro, тарификация и примеры генерации
  </Card>

  <Card title="Частые вопросы по ошибкам генерации изображений" icon="circle-question-mark" href="/ru/faq/nano-banana-image-failure">
    Руководство по устранению неполадок Nano Banana, согласованное с кодами ошибок этого плагина
  </Card>

  <Card title="Консоль APIYI" icon="settings" href="https://api.apiyi.com/token">
    Управляйте ключами API, просматривайте использование и баланс
  </Card>
</CardGroup>
