> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по обработке ошибок API генерации изображений Gemini

> Три ключевых диагностических индикатора сбоев генерации gemini-3-pro-image-preview (Nano Banana Pro), политика модерации контента Google и стратегии пользовательских сообщений, помогающие разработчикам превращать технические ошибки в понятные пользователю подсказки.

## Обзор

`gemini-3-pro-image-preview` (то есть Nano Banana Pro) применяет строгие механизмы контроля безопасности контента и будет отклонять несоответствующие запросы на нескольких уровнях. Простое сообщение «сбой генерации» не помогает пользователям понять проблему. Хорошая обработка ошибок должна:

* **Точно определять причину отклонения** — различать нарушения правил контента, ограничения базы знаний и технические ошибки
* **Предоставлять понятные сообщения пользователю** — превращать технические ошибки в объяснения, которые легко понять
* **Предлагать практические рекомендации** — подсказывать пользователям, как изменить запрос, чтобы он сработал
* **Сохранять полные технические сведения** — для отладки разработчиками

<Info>
  Когда запрос возвращает **HTTP 200**, но изображения нет, обычно это решение, связанное с безопасностью, принятое на стороне Google. Прозрачный прокси APIYI просто передаёт результат как есть — мы тоже хотим, чтобы наши клиенты успешно генерировали изображения. Логику определения и сообщений нужно реализовать на стороне вашего приложения.
</Info>

## Политика модерации контента Google (Обновление 2026)

Генерация изображений Google использует **двухуровневый механизм безопасности**:

1. **Настраиваемые фильтры**: охватывают четыре категории — домогательства, разжигание ненависти, контент сексуально откровенного характера и опасный контент — и настраиваются через `safetySettings`
2. **Встроенные защиты**: всегда активны для базовых вредоносных сценариев (например, безопасности детей) и **не могут быть отключены через параметры**

Явно запрещенный контент включает: сексуальное насилие и эксплуатацию детей (CSAE), насильственный экстремизм/терроризм, интимные изображения без согласия (NCII), самоповреждение, контент сексуально откровенного характера, разжигание ненависти, а также домогательства и травлю.

<Warning>
  **В феврале 2026 года, после запуска Nano Banana 2, Google значительно ужесточила свои политики в отношении людей и авторского права**, добавив/усилив следующие частые сценарии отклонения (данные по состоянию на май 2026 года (UTC+8)):

  * **Публичные фигуры / знаменитости**: фотореалистичные, узнаваемые реальные люди
  * **Подмена лица (faceswap)**
  * **Переодевание / изменение внешности реальных людей**
  * **Подделка финансовой информации или информации о заказе**
  * **Известные объекты интеллектуальной собственности** (например, Disney, начиная с 23 января 2026 года)
  * **Удаление водяных знаков** и контент, связанный с **несовершеннолетними**

  По-прежнему разрешены: вымышленные персонажи, стилизованные портреты и иллюстрированные фигуры.
</Warning>

Официальные документы политики Google (скопируйте и откройте их самостоятельно):

* Запрещенная политика использования Generative AI: `policies.google.com/terms/generative-ai/use-policy`
* Справочник по распространенным ошибкам генеративного контента: `ai.google.dev/api/generate-content`

## Три основных диагностических индикатора

Проверяйте в порядке **приоритета, от высшего к низшему**:

### 1. candidatesTokenCount (наивысший приоритет) ⭐

* **Location**: `response.usageMetadata.candidatesTokenCount`
* **Meaning**: количество token в сгенерированном API содержимом кандидата
* **Rule**: значение `0` означает, что запрос был **полностью отклонён на этапе модерации контента** — содержимое кандидата вообще не было сгенерировано. Это самый строгий тип отклонения.

```json theme={null}
{
  "candidates": null,
  "usageMetadata": {
    "promptTokenCount": 271,
    "candidatesTokenCount": 0,
    "totalTokenCount": 271
  }
}
```

### 2. finishReason (второй приоритет)

* **Location**: `response.candidates[0].finishReason`
* **Rule**: любое значение, отличное от `STOP`, указывает на аномальное завершение, требующее особой обработки

Последние значения `finishReason`, связанные с изображениями (обратите внимание, что серия Nano Banana добавила специфичные для изображений значения с префиксом `IMAGE_`):

| finishReason                                      | Значение                                          | Сообщение для пользователя                                                                       |
| ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `STOP`                                            | Нормальное завершение                             | -                                                                                                |
| `IMAGE_SAFETY`                                    | Фильтр безопасности изображений на стороне вывода | Контент активировал политику безопасности изображений                                            |
| `PROHIBITED_CONTENT` / `IMAGE_PROHIBITED_CONTENT` | Запрещённый контент                               | Контент нарушает политику безопасности и был отклонён                                            |
| `SAFETY`                                          | Фильтр безопасности                               | Контент активировал фильтр безопасности                                                          |
| `RECITATION` / `IMAGE_RECITATION`                 | Ограничение по цитированию/авторским правам       | Контент может быть связан с нарушением авторских прав                                            |
| `IMAGE_OTHER` / `NO_IMAGE`                        | Нет изображения/другое                            | Изображение не удалось сгенерировать; пожалуйста, скорректируйте свой prompt и повторите попытку |
| `MAX_TOKENS`                                      | Превышение длины                                  | Длина контента превышает лимит                                                                   |

### 3. Пояснение отклонения текста (важно)

* **Location**: `response.candidates[0].content.parts[].text`
* **Rule**: когда `finishReason` равно `STOP`, но `parts` содержит только `text` и не содержит данных изображения, API возвращает **пояснение отклонения**, а не изображение. Текст может быть на китайском или английском, например:

```text theme={null}
我不能为你创建带有色情、不雅或冒犯性内容的图像。这违反了我们的安全政策。
I can't generate images that are sexually explicit.
```

## Краткая справка по сценариям ошибок

| Сценарий                            | Условие обнаружения                                                                            | Типичная причина                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Отклонение из-за модерации контента | `candidatesTokenCount === 0`                                                                   | Prompt/референсное изображение содержит чувствительный контент; отклонение на самой ранней стадии |
| Отклонение во время генерации       | `finishReason !== 'STOP'` и `parts` пусто                                                      | Запрещенный контент, фильтр безопасности                                                          |
| Пояснение к отклонению текста       | `finishReason === 'STOP'`, есть текст, но нет изображения                                      | Откровенно сексуальный контент, запрос, не соответствующий требованиям                            |
| Ограничение базы знаний             | текст упоминает будущий год (2026+) или неанонсированный продукт                               | База знаний обновлена до января 2025 года                                                         |
| Запрещенная функция                 | текст содержит ключевые слова вроде `watermark`, `faceswap`, re-dressing, знаменитости и т. д. | Запрещенные функции, такие как удаление водяных знаков/замена лиц/re-dressing/знаменитости        |

## Порядок обработки (порядок принятия решений)

```text theme={null}
Receive API response
  ├─ ① candidatesTokenCount === 0 ─→ Content moderation rejection
  ├─ ② candidates is empty ─────────→ API format error (system issue)
  ├─ ③ finishReason !== 'STOP' ────→ Rejection during generation (check mapping table)
  ├─ ④ content.parts is empty ─────→ Empty content (handle like finishReason)
  ├─ ⑤ Iterate parts to collect text and images
  ├─ ⑥ Has image ──────────────────→ ✅ Return success
  └─ ⑦ No image but has text ──────→ Show rejection explanation (optional keyword detection)
        └─ No text ───────────────→ Generic error + keep full response
```

## Реализация кода (основное)

Объедините проверки выше в одну функцию парсинга:

```javascript theme={null}
async function processGeminiResponse(data) {
  // ① Highest priority: rejected outright at the content moderation stage
  if (data.usageMetadata?.candidatesTokenCount === 0) {
    return {
      success: false,
      errorType: 'ZERO_CANDIDATES_TOKEN',
      userMessage: 'Your request was rejected during content moderation. Please revise it and try again.',
      devMessage: 'candidatesTokenCount: 0 - rejected by Google content moderation',
      rawResponse: data,
    };
  }

  // ② candidates is empty — usually a system/format issue
  if (!data.candidates || !data.candidates.length) {
    return {
      success: false,
      errorType: 'NO_CANDIDATES',
      userMessage: 'A system error occurred. Please try again later.',
      devMessage: 'candidates is null or an empty array',
      rawResponse: data,
    };
  }

  const candidate = data.candidates[0];

  // ③ finishReason is not STOP — rejected during generation
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    const reasonMessages = {
      PROHIBITED_CONTENT: 'Content violates the safety policy and was rejected.',
      IMAGE_PROHIBITED_CONTENT: 'Content violates the safety policy and was rejected.',
      SAFETY: 'Content triggered the safety filter.',
      IMAGE_SAFETY: 'Content triggered the image safety policy.',
      RECITATION: 'Content may involve a copyright issue.',
      IMAGE_RECITATION: 'Content may involve a copyright issue.',
      NO_IMAGE: 'No image could be generated. Please adjust your prompt and try again.',
      IMAGE_OTHER: 'No image could be generated. Please adjust your prompt and try again.',
      MAX_TOKENS: 'Content length exceeds the limit.',
    };
    return {
      success: false,
      errorType: 'FINISH_REASON',
      finishReason: candidate.finishReason,
      userMessage: reasonMessages[candidate.finishReason] || `Request rejected: ${candidate.finishReason}`,
      devMessage: `finishReason: ${candidate.finishReason}`,
      rawResponse: data,
    };
  }

  // ④ content.parts is empty
  if (!candidate.content?.parts) {
    return {
      success: false,
      errorType: 'NO_PARTS',
      userMessage: 'Generation failed. Please try again.',
      devMessage: 'candidate.content.parts is empty',
      rawResponse: data,
    };
  }

  // ⑤ Iterate parts: ⚠️ always collect text first, then check thoughtSignature
  const images = [];
  const texts = [];
  for (const part of candidate.content.parts) {
    if (part.text && !part.text.startsWith('data:image/')) {
      texts.push(part.text);
    }
    if (part.inlineData?.data) {
      images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
    }
  }

  // ⑥ Having an image means success
  if (images.length > 0) {
    return { success: true, images, texts };
  }

  // ⑦ No image but has text — show the rejection explanation
  if (texts.length > 0) {
    const textContent = texts.join('\n');
    return {
      success: false,
      errorType: 'TEXT_RESPONSE',
      userMessage: textContent,          // Use the text returned by the API directly
      detectedType: detectContentType(textContent),
      apiText: textContent,
      rawResponse: data,
    };
  }

  // ⑧ Fallback: never just say "unknown error"
  return {
    success: false,
    errorType: 'UNKNOWN',
    userMessage: 'Generation failed. Please check your prompt and try again.',
    devMessage: 'No image data or text response found',
    rawResponse: data,
  };
}
```

Умное определение ключевых слов (необязательно, для более точных сообщений):

```javascript theme={null}
function detectContentType(text) {
  const t = text.toLowerCase();
  const isRejection =
    t.includes("i can't generate") || t.includes('i cannot create') ||
    t.includes("i'm just a language model") || t.includes('我不能') || t.includes('无法生成');
  if (!isRejection) return null;

  if (t.includes('watermark')) return 'watermark_removal';
  if (t.includes('faceswap') || t.includes('face swap')) return 'faceswap';
  if (t.includes('sexually') || t.includes('explicit') || t.includes('色情') || t.includes('不雅')) return 'nsfw';
  return 'general_rejection';
}
```

<Warning>
  **Самая распространенная ошибка**: часть, содержащая `thoughtSignature`, все еще может содержать важные `text`. Всегда **сначала собирайте текст, а затем решайте, нужно ли пропускать** — иначе пояснение причины отклонения теряется, и пользователи видят только «сбой генерации».
</Warning>

## Сообщения для конечных пользователей

Принципы оформления: **ясно и кратко, позитивные рекомендации, практичность, без обвинений**. Рекомендуемые шаблоны:

```text theme={null}
❌ Content does not meet requirements
Your request contains inappropriate content, so an image cannot be generated.
💡 Suggestion: Use healthy, positive descriptions; avoid sensitive topics; revise your prompt and try again.

❌ Feature not yet supported
This feature (e.g., watermark removal/face swap) is not supported. Please try a different editing approach.

❌ Content out of scope
The content you mentioned may be beyond the AI's knowledge range (updated through January 2025).
💡 Suggestion: Use common objects/concepts and avoid referencing future products.
```

Рекомендации по поэтапному отображению:

* **Конечные пользователи**: по умолчанию показывайте только дружелюбное объяснение + предложение по исправлению
* **Бизнес / поставщики инструментов**: по умолчанию раскрывайте технические подробности (`finishReason`, `candidatesTokenCount` и т. д.)
* **Разработчики**: предоставьте переключатель «развернуть/свернуть» для просмотра полного ответа JSON

## Лучшие практики

1. **Проверяйте строго по приоритету**: `candidatesTokenCount` → `finishReason` → `parts` → извлечение данных → обнаружение ключевых слов
2. **Собирайте текст до проверки thoughtSignature**, чтобы не потерять объяснение отказа
3. **Сохраняйте полный ответ**: инструменты разработки и тестирования всегда должны сохранять необработанный JSON для устранения неполадок
4. **Поддерживайте текст отказа на китайском и английском языках**: Google может вернуть текст на китайском или английском, поэтому сопоставление по ключевым словам должно покрывать оба варианта
5. **Плавная деградация**: выдавайте конкретное сообщение, когда интеллектуальное обнаружение успешно срабатывает; иначе показывайте текст API напрямую; иначе используйте дружественное имя `finishReason`; и только затем переходите к общему сообщению
6. **Никогда не показывайте «неизвестная ошибка»**: всегда включайте практическую рекомендацию или полный ответ

## Частые вопросы

<AccordionGroup>
  <Accordion title="Почему один и тот же prompt иногда проходит, а иногда не проходит?">
    Фильтрация безопасности Google имеет элемент случайности и зависит от контекста: содержимое reference image и способ объединения prompt влияют на решение. Попробуйте изменить формулировку или использовать более косвенное выражение.
  </Accordion>

  <Accordion title="Как понять, это проблема с контентом или техническая проблема?">
    `candidatesTokenCount: 0` или `finishReason: PROHIBITED_CONTENT` → проблема с контентом; `Failed to fetch` или HTTP-ошибка → техническая проблема; текстовое объяснение API → обычно проблема с контентом.
  </Accordion>

  <Accordion title="Сколько технической информации должны видеть пользователи-консьюмеры?">
    Многоуровневое отображение: по умолчанию показывайте дружелюбное объяснение + предложение по исправлению; при необходимости раскрывайте технические детали; в режиме разработки показывайте полный JSON-ответ.
  </Accordion>

  <Accordion title="Нужно ли писать отдельную обработку для каждого finishReason?">
    Нет. Достаточно таблицы сопоставления и универсального fallback: `reasonMessages[finishReason] || `, а затем отображайте исходное значение.
  </Accordion>
</AccordionGroup>

## Связанное чтение

* [Обзор цен серии Nano Banana](/ru/api-capabilities/nano-banana-pricing)
* [План компенсации за сбой генерации Nano Banana Pro](/ru/api-capabilities/nano-banana-pro-guarantee)
* [Группа Nano Banana OSS](/ru/api-capabilities/nano-banana-oss-group)
