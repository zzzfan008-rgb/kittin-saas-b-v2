> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Пояснение полей Usage и вывода

> Поймите структуру response JSON и поля usageMetadata модели gemini-3-pro-image, включая три варианта подсчёта, которые выглядят как аномалии, но являются неотъемлемыми свойствами модели

Эта страница предназначена для разработчиков, вызывающих `gemini-3-pro-image` (Nano Banana Pro) через APIYI. В ней объясняется структура вывода response JSON и что на самом деле означает каждое поле `usageMetadata`, а также разъясняются несколько особенностей подсчёта, которые **выглядят как аномалии, но являются неотъемлемой частью модели**. Все выводы получены на основе тестирования в производственном шлюзе (48 запросов text-to-image + 18 запросов image-edit), перепроверены по официальной документации Google (`ai.google.dev/gemini-api/docs/image-generation`) и не являются предположениями.

## Общая структура ответа

Серия nano banana в APIYI использует нативный формат Google. Ответ всегда содержит четыре поля верхнего уровня:

```json theme={null}
{
  "candidates":    [ ... ],          // generation results (image/text parts)
  "usageMetadata": { ... },          // token usage
  "modelVersion":  "gemini-3-pro-image",
  "responseId":    "..."
}
```

### При успешной генерации

```json theme={null}
"candidates": [{
  "content": {
    "role": "model",
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }
    ]
  },
  "finishReason": "STOP",
  "index": 0
}]
```

<Warning>
  **parts могут содержать более одного изображения.** При сложных prompt с задачами в стиле задания и несколькими ограничениями, например «4-view character sheet», модель может вернуть несколько image parts в одном ответе (в тестировании наблюдалось 2–10) — это промежуточные черновики из «thinking process» модели плюс финальная версия. В документации Google указано, что «последнее изображение внутри Thinking также является финальным отрендеренным изображением», поэтому **просто берите последнее**. Чистая генерация изображений по тексту и простые правки (добавление аксессуаров / смена фона / смена стиля) обычно возвращают только 1. В любом случае всегда проходите по parts и берите последний `inlineData`, когда вам нужно только одно изображение. Подробности см. в [Dev Guide · Почему ответы иногда содержат несколько изображений](/ru/api-capabilities/nano-banana-dev-guide#why-do-responses-occasionally-contain-multiple-images).
</Warning>

#### parts также может содержать текстовый сегмент

Приведённый выше пример показывает массив `parts`, содержащий один image segment, но **такой структуры никто не гарантирует**. `parts` — это гетерогенный массив, и в тестировании было обнаружено три варианта структуры:

| структура parts       | Длина | Индекс изображения |
| --------------------- | ----- | ------------------ |
| `inlineData`          | 1     | `0`                |
| `text` + `inlineData` | 2     | **`1`**            |
| `inlineData` + `text` | 2     | **`0`**            |

Если включить `TEXT` в `responseModalities` или использовать prompt, который просит модель объяснить себя, в ответ добавится текстовый сегмент — и заранее не фиксировано, окажется он до изображения или после него. **Так что индекс, по которому находится изображение, не является постоянным.**

<Warning>
  Эти два шаблона с жёстко заданным индексом **взаимодополняющи**: изображение всегда оказывается либо на `[0]`, либо на `[1]`, поэтому если жёстко задать любой из них, останутся запросы, в которых вы не получите изображение. Правильный подход см. в разделе **Лучшие практики парсинга и согласования** ниже. В качестве меры усиления надёжности вы также можете указать `responseModalities: ["IMAGE"]` в `generationConfig`, чтобы задать, что вам нужно только изображение, — но это **не заменяет** фильтрацию.
</Warning>

### При блокировке политиками безопасности

HTTP status code по-прежнему **200**; разница находится внутри candidate:

```json theme={null}
"candidates": [{
  "content": { "parts": null },        // ⚠️ parts is null, not an empty array
  "finishReason": "IMAGE_SAFETY",      // or NO_IMAGE / PROHIBITED_CONTENT
  "finishMessage": "Unable to show the generated image. ...",  // only present in some cases
  "index": 0
}]
```

* В тестировании было обнаружено три значения `finishReason`: `IMAGE_SAFETY` (выходное изображение нарушает политику), `PROHIBITED_CONTENT` (была активирована политика запрещённого использования, с пояснительным `finishMessage`) и `NO_IMAGE` (изображение не сгенерировано, обычно возвращается в течение нескольких секунд).
* Объяснение отказа находится в поле `finishMessage` — оно **не** появляется как текстовый сегмент внутри `parts`.
* Ваш код парсинга должен уметь обрабатывать `parts` как `null`, иначе заблокированные ответы приведут к его сбою.

<Tip>
  Для диагностики сбоев, политик модерации контента и стратегий понятных пользователю сообщений см. [Gemini Image Error Handling Guide](/ru/api-capabilities/gemini-image-error-handling).
</Tip>

## Значения поля usageMetadata

Успешные генерации всегда содержат 6 полей:

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 615,          // total input tokens (text + input images)
  "candidatesTokenCount": 2478,     // total output tokens (images + internal generation tokens)
  "thoughtsTokenCount": 208,        // thinking (reasoning) tokens
  "totalTokenCount": 3301,          // total billed amount for this request
  "promptTokensDetails":     [ { "modality": "TEXT",  "tokenCount": 99 },
                               { "modality": "IMAGE", "tokenCount": 516 } ],
  "candidatesTokensDetails": [ { "modality": "IMAGE", "tokenCount": 2240 } ]
}
```

| Поле                      | Значение                                | Надёжность                                                                                                 |
| ------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `promptTokenCount`        | Итого на стороне ввода                  | ✅ Всегда равно сумме `promptTokensDetails`                                                                 |
| `candidatesTokenCount`    | Итого на стороне вывода                 | ✅ Значение для тарификации; **но больше суммы деталей — см. Поведение 1 ниже**                             |
| `thoughtsTokenCount`      | Thinking tokens, обычно 50–350 в тестах | ✅                                                                                                          |
| `totalTokenCount`         | Общий итог                              | ✅ При успешной генерации всегда равно сумме предыдущих трёх; **исключение — отказы, см. Поведение 2 ниже** |
| `promptTokensDetails`     | Разбивка входа по модальности           | ✅ Полная разбивка                                                                                          |
| `candidatesTokensDetails` | Разбивка вывода по модальности          | ⚠️ **Охватывает только часть изображения — не является полной разбивкой**                                  |

**Image tokens определяются уровнем разрешения, а не соотношением сторон**: **1120 tokens на изображение** на уровнях 1K и 2K, **2000 на изображение** на 4K. Соотношение сторон меняет только размеры в пикселях, но не количество tokens. Когда в одном ответе возвращается N изображений, детали в точности равны N × значению на одно изображение.

Приведённая ниже таблица — это официальная справка Google по соотношениям сторон и размерам изображений Pro Image (источник: `ai.google.dev/gemini-api/docs/image-generation`), полностью согласованная с нашими измерениями `gemini-3-pro-image`:

| Соотношение сторон | Размер 1K | tokens 1K | Размер 2K | tokens 2K | Размер 4K | tokens 4K |
| ------------------ | --------- | --------- | --------- | --------- | --------- | --------- |
| 1:1                | 1024x1024 | 1120      | 2048x2048 | 1120      | 4096x4096 | 2000      |
| 2:3                | 848x1264  | 1120      | 1696x2528 | 1120      | 3392x5056 | 2000      |
| 3:2                | 1264x848  | 1120      | 2528x1696 | 1120      | 5056x3392 | 2000      |
| 3:4                | 896x1200  | 1120      | 1792x2400 | 1120      | 3584x4800 | 2000      |
| 4:3                | 1200x896  | 1120      | 2400x1792 | 1120      | 4800x3584 | 2000      |
| 4:5                | 928x1152  | 1120      | 1856x2304 | 1120      | 3712x4608 | 2000      |
| 5:4                | 1152x928  | 1120      | 2304x1856 | 1120      | 4608x3712 | 2000      |
| 9:16               | 768x1376  | 1120      | 1536x2752 | 1120      | 3072x5504 | 2000      |
| 16:9               | 1376x768  | 1120      | 2752x1536 | 1120      | 5504x3072 | 2000      |
| 21:9               | 1584x672  | 1120      | 3168x1344 | 1120      | 6336x2688 | 2000      |

<Note>
  В официальной таблице Google заголовок столбца `1K tokens` означает «количество tokens для уровня разрешения 1K» — фактическое количество tokens на одно изображение соответствует значению в ячейке: 1120 tokens на изображение для 1K/2K, 2000 для 4K. (В китайской локализации этой страницы заголовок отображается как «1,000 tokens», что легко принять за количество tokens на изображение.) Также обратите внимание: уровень 512px (747 tokens на изображение) существует только для моделей Flash image — `gemini-3-pro-image` поддерживает только 1K/2K/4K; Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) — особый случай: у него есть только уровень **1K**, без 512px.
</Note>

## Три поведения, которые выглядят как аномалии

### Поведение 1: candidatesTokenCount ≠ сумма candidatesTokensDetails — нормально и неизбежно

В ходе тестирования **100%** образцов (49/49 успешных генераций) показали, что `candidatesTokenCount` превышает сумму details на **88–630 tokens** (чем сложнее prompt и чем больше изображений возвращается, тем больше разрыв).

Причина: `candidatesTokensDetails` учитывает только **сам image payload** (фиксированные 1120/2000 на каждое изображение), тогда как `candidatesTokenCount` также включает внутренние tokens, сгенерированные вместе с процессом image generation, для которых нет соответствующей записи модальности. Это нативная схема подсчёта Gemini; APIYI передаёт её без изменений.

<Info>
  **Вывод: не считайте details полной разбивкой `candidatesTokenCount` для валидации. Для сверки и тарификации всегда используйте `candidatesTokenCount` / `totalTokenCount`; details полезны только для оценки доли изображений.**
</Info>

### Поведение 2: totalTokenCount ≠ prompt + candidates + thoughts — только в ответах без вывода изображений

* При успешной генерации уравнение **строго выполняется** (49/49): `total = promptTokenCount + candidatesTokenCount + thoughtsTokenCount`.
* В ответах, заблокированных системой безопасности (без вывода изображений), уравнение **никогда не выполняется** (6/6), с фиксированным шаблоном:

```text theme={null}
candidatesTokenCount == thoughtsTokenCount     // thinking tokens are written into both fields
totalTokenCount == promptTokenCount + thoughtsTokenCount   // total counts them once — this is correct
```

В ответах с отказом `candidatesTokenCount` зеркалирует `thoughtsTokenCount`, поэтому суммирование трёх полей даёт двойной учёт tokens рассуждения. Это также присущее upstream поведение. **`totalTokenCount` само по себе корректно — просто используйте его напрямую.** Если примерно 10% ответов в ваших логах «не сходятся», проверьте, пустое ли в этих ответах `parts` — почти наверняка это образцы, заблокированные системой безопасности.

### Поведение 3: output tokens иногда достигают 6000+ — из-за нескольких image parts из процесса thinking

Официальная документация Google указывает, что image models Gemini 3 являются моделями thinking: «Thinking» включён по умолчанию и его нельзя отключить в API. Модель генерирует промежуточные изображения для проверки композиции и логики, и «последнее изображение в Thinking также является финальным отрендеренным изображением» (источник: раздел Thinking Process в `ai.google.dev/gemini-api/docs/image-generation`).

В ходе наших тестов эти промежуточные черновики thinking возвращаются в нативном ответе `generateContent` как **обычные image parts**: каждая часть содержит поле `thoughtSignature`, но не содержит флаг `thought: true`, и **каждая из них учитывается как 1120 tokens в `candidatesTokensDetails`**. В документации Google сказано, что Thinking генерирует не более двух промежуточных изображений, но при сложных prompt в стиле задач мы наблюдали до **10 image parts** в одном ответе. Потребление растёт строго линейно с количеством изображений:

| Возвращено изображений | candidatesTokensDetails | candidatesTokenCount | totalTokenCount |
| ---------------------- | ----------------------- | -------------------- | --------------- |
| 1 (text-to-image, 1K)  | 1120                    | \~1210–1275          | \~1350–1450     |
| 2                      | 2240                    | \~2500               | \~3300          |
| 3                      | 3360                    | \~3800               | \~4600          |
| 4                      | 4480                    | \~5000               | \~5900          |
| 5                      | 5600                    | \~6200               | \~7000          |
| 10                     | 11200                   | \~12700              | \~13500         |

Поле `thoughtsTokenCount` учитывает только **text thinking** и в тестах никогда не превышало 400 — источник высоких output tokens это количество image parts, а не это поле. Когда вы видите 6000+ или даже пятизначные output tokens, проверьте количество частей в этом ответе — это почти наверняка ответ с несколькими изображениями и нормальная тарификация (при этом всё равно сверяйте с `totalTokenCount`).

## Уровни thinking и две API-парадигмы

### Как thinkingLevel влияет на tokens

Управление уровнем thinking поддерживается только **Gemini 3.1 Flash Image / Flash Lite Image** (`generationConfig.thinkingConfig.thinkingLevel`, по умолчанию `minimal` или `high`); на `gemini-3-pro-image` thinking всегда включён и не настраивается. Измерено (тот же prompt, 1K text-to-image, через шлюз APIYI):

| Модель / настройка                         | thoughtsTokenCount              | Токены изображения | totalTokenCount | Задержка |
| ------------------------------------------ | ------------------------------- | ------------------ | --------------- | -------- |
| gemini-3.1-flash-image · minimal (default) | поле отсутствует                | 1120               | \~1534–1554     | \~12–13s |
| gemini-3.1-flash-image · high              | 700–792                         | 1120               | \~2243–2375     | \~18–23s |
| gemini-3-pro-image · high passed in        | 181–214 (same as default range) | 1120               | \~1427–1471     | \~23s    |

* **`high` only increases thinking tokens and latency — image tokens stay unchanged** (по-прежнему 1120 на одно изображение).
* **Передача `thinkingLevel` в `gemini-3-pro-image` не вызывает ошибки, но не даёт измеримого эффекта — thinking tokens остаются в диапазоне по умолчанию.**
* `includeThoughts: true` не изменило ни структуру ответа, ни тарификацию в ходе тестирования; Google прямо указывает, что thinking tokens тарифицируются по умолчанию, независимо от того, просматриваете ли вы процесс thinking.
* Google также отмечает, что «minimal thinking» не означает, что модель совсем не думает; при `minimal` usage просто перестаёт выводить отдельное поле `thoughtsTokenCount`.

<Info>
  Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) находится в том же семействе 3.1 Flash, что и Nano Banana 2, и также поддерживает управление `thinkingLevel` с тем же механизмом, что и в таблице выше; она ещё не была отдельно измерена и пока не включена в таблицу. Подробности о ценах см. в [Тарифы серии Nano Banana](/ru/api-capabilities/nano-banana-pricing).
</Info>

### Чем thinking tokens в image-моделях отличаются от text моделей

* **Text thinking models**: выход thinking — текст; `thoughtsTokenCount` может достигать тысяч и тарифицируется по цене output-token. Официально тарификация основана на **полных внутренних мыслях**, которые генерирует модель, хотя API возвращает только краткие сводки мыслей (источник: раздел о тарификации в `ai.google.dev/gemini-api/docs/thinking`).
* **Image thinking models**: thinking produces two kinds of output — a small amount of **text thinking** counted in `thoughtsTokenCount` (measured: up to 400 on Pro, \~800 on Flash at `high`), and **interim draft images**, which come back as ordinary image parts billed at 1120/2000 tokens each in `candidatesTokenCount`. So for image models the «cost of thinking» mostly shows up in the number of image parts, not in the `thoughtsTokenCount` field (см. поведение 3 выше).

### Две API-парадигмы

Документация по image-моделям Google теперь представлена в двух вариантах: классический **generateContent API** (без состояния) и недавно рекомендованный **Interactions API** (созданный для агентов и инструментов). Шлюз APIYI использует **родной формат generateContent от Google — всё на этой странице основано именно на нём**. Отличия, связанные с thinking:

|                            | generateContent (эта страница)                                                                                                                                   | Interactions API                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Параметр уровня thinking   | `generationConfig.thinkingConfig.thinkingLevel`                                                                                                                  | `generation_config.thinking_level`                                                   |
| Содержимое мыслей в ответе | `includeThoughts` переключатель (в тестировании для image-моделей видимого эффекта не было; промежуточные черновики всегда возвращаются как обычные image parts) | возвращается явно как `steps` (`type: "thought"`), без переключателя includeThoughts |
| Названия полей usage       | `thoughtsTokenCount` / `candidatesTokenCount` / `totalTokenCount`                                                                                                | `total_thought_tokens` / `total_output_tokens`                                       |

Для полного сравнения двух парадигм (эндпоинты, управление состоянием, хранение данных и тесты совместимости шлюза APIYI) см. [Interactions API против generateContent](/ru/api-capabilities/gemini/interactions-api).

## Лучшие практики разбора и сверки

```python theme={null}
data = resp.json()
cand = (data.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []   # handles parts=null

# Select by field shape — never by parts[0] / parts[1]; a text segment may come first
images = [p["inlineData"] for p in parts if "inlineData" in p]
if images:
    final_image = images[-1]["data"]          # last one is the final version
    mime = images[-1]["mimeType"]             # trust the response; don't hardcode image/png
else:
    reason = cand.get("finishReason")         # IMAGE_SAFETY / NO_IMAGE / PROHIBITED_CONTENT
    message = cand.get("finishMessage", "")   # may be empty
```

1. **Сверяйте тарификацию с `totalTokenCount`** (она точна даже при отказах); не проверяйте это, самостоятельно суммируя три поля, или суммируя детали.
2. **Итерируйте по частям — никогда не предполагайте одно изображение**; любая бизнес-логика на уровне изображения должна опираться на фактическое количество частей `inlineData`.
3. **Обрабатывайте заблокированные ответы с `parts = null` + HTTP 200**, выполняя ветвление по `finishReason`.
4. Простые правки занимают \~22–25s; сложные задачи (ответы с несколькими изображениями) занимают 35–142s, дольше при большем количестве изображений. Установите тайм-ауты клиента на ≥ 5 минут (включая любой proxy layer).

## Связанные документы

<CardGroup cols={2}>
  <Card title="Руководство для разработчиков Nano Banana" icon="book-open" href="/ru/api-capabilities/nano-banana-dev-guide">
    Способы интеграции, требования к входному изображению, основы тарификации, настройки тайм-аута и пояснение по нескольким изображениям
  </Card>

  <Card title="Руководство по обработке ошибок" icon="triangle-alert" href="/ru/api-capabilities/gemini-image-error-handling">
    Три ключевых показателя для диагностики неудачных генераций, политики модерации контента и дружественные стратегии промптов
  </Card>

  <Card title="План гарантии при неудачной генерации" icon="shield-check" href="/ru/api-capabilities/nano-banana-pro-guarantee">
    Если сбой не вызван вашим вводом, кредиты возмещаются в соответствии с количеством неудачных запросов
  </Card>

  <Card title="Цены Nano Banana" icon="badge-dollar-sign" href="/ru/api-capabilities/nano-banana-pricing">
    Цена за изображение в зависимости от разрешения и уровня модели
  </Card>
</CardGroup>
