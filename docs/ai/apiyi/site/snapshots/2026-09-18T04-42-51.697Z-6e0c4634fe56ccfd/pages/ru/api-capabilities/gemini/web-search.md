> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по веб-поиску для Gemini API

> Нативные generateContent + инструмент google_search дают вам живую привязку к вебу с ключом группы по умолчанию, проверены на трех моделях Gemini; OpenAI-совместимый режим не поддерживает это. Включает метод проверки и тарификацию ($14/1K searches).

Эта страница объясняет, как использовать веб-поиск (Grounding with Google Search) с моделями Gemini в APIYI, что подтверждено практическим тестированием в июне 2026 года (3 модели × 2 режима × несколько объявлений tools, 21 зарегистрированный запрос). Для базовой настройки нативного формата сначала см. [Нативные вызовы Gemini](/ru/api-capabilities/gemini/native).

## Кратко

**Нативный эндпоинт Gemini в APIYI полностью поддерживает официальный веб-поиск Google**: используйте **`/v1beta` generateContent с инструментом `google_search`**. gemini-3.5-flash, gemini-3.1-flash-lite и gemini-3.1-pro-preview были проверены и действительно выполняют поиск в вебе, возвращая актуальную информацию с указанием источников. **Ключ из группы по умолчанию работает сразу — никакой специальной активации не требуется.**

```
Endpoint:  POST https://api.apiyi.com/v1beta/models/{model}:generateContent
Tool:      tools: [{"google_search": {}}]
Models:    gemini-3.5-flash / gemini-3.1-flash-lite / gemini-3.1-pro-preview (verified)
```

<Warning>
  **Режим, совместимый с OpenAI (`/v1/chat/completions`), НЕ поддерживает веб-поиск.** В ходе тестирования все три объявления — `web_search_options`, переданный далее `google_search` и `tools: [{"type": "web_search"}]` — возвращали HTTP 200, но были молча проигнорированы; модель просто отвечала на основе обучающих данных. Не считайте «нет ошибки» признаком того, что «поиск сработал» — см. метод проверки ниже.
</Warning>

## Доступность в реальных условиях (тестовые данные, 2026-06-11)

| Модель                 | Веб-результат                                                                    | groundingMetadata                      | Количество поисков на Q\&A | Задержка |
| ---------------------- | -------------------------------------------------------------------------------- | -------------------------------------- | -------------------------- | -------- |
| gemini-3.5-flash       | ✅ Реальные новости за ту же неделю, перекрестная проверка по нескольким запросам | ✅ Полные                               | 4–7                        | 24–45с   |
| gemini-3.1-flash-lite  | ✅ Реальные новости за ту же неделю                                               | ✅ (иногда отсутствует, см. примечания) | 2                          | \~5с     |
| gemini-3.1-pro-preview | ✅ Реальные новости за ту же неделю, точный поиск после глубокого рассуждения     | ✅                                      | 1                          | \~45с    |

<Tip>
  Выбор модели: **выбирайте gemini-3.1-flash-lite для чувствительных к задержке, высокочастотных вызовов (около 5 секунд); выбирайте gemini-3.5-flash для широты поиска и качества ответа** (мультизапросная перекрестная проверка, с более высокими затратами на рассуждение и задержкой — см. тарификацию).
</Tip>

## Быстрый старт

### cURL

```bash theme={null}
curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "content-type: application/json" \
  -H "x-goog-api-key: YOUR_APIYI_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "What important AI news happened in the past week? Search and list 3 items with source URLs."}]}],
    "generationConfig": {"maxOutputTokens": 4096},
    "tools": [{"google_search": {}}]
  }'
```

### Python (google-genai SDK)

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_APIYI_KEY",                     # default group works
    http_options={"base_url": "https://api.apiyi.com"},  # note: no /v1
)

resp = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="What important AI news happened in the past week? Search and list 3 items with source URLs.",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        max_output_tokens=4096,
    ),
)

# 1) Final answer text
print(resp.text)

# 2) Grounding evidence: executed queries and sources
gm = resp.candidates[0].grounding_metadata
if gm:
    print("Queries:", gm.web_search_queries)
    for chunk in gm.grounding_chunks or []:
        print("Source:", chunk.web.title, chunk.web.uri)
else:
    print("⚠️ No web search was triggered in this call")
```

### Как проверить, что поиск действительно был выполнен

При успехе, `candidates[0].groundingMetadata` содержит следующие поля; **если они отсутствуют, поиск не выполнялся**:

| Поле                | Значение                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `webSearchQueries`  | Массив поисковых запросов, которые модель действительно выполнила (длина массива = число поисков) |
| `groundingChunks`   | Полученные источники (URI + title)                                                                |
| `groundingSupports` | Соответствие между фрагментами текста ответа и источниками (startIndex/endIndex)                  |
| `searchEntryPoint`  | HTML/CSS для отображения необходимых подсказок поиска Google                                      |

Справка по контрольной группе: если задать тот же вопрос без инструмента, модели последовательно отвечали: «мои знания заканчиваются в январе 2025 года, я не могу предоставить актуальные новости»; с инструментом они точно сообщали о реальных событиях, произошедших после отсечки их обучения.

## Тарификация (важно)

Web search **влечет плату за вызов инструмента**, которая состоит из двух частей:

| Item                           | Price                                         | Notes                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Плата за вызов инструмента** | **\$14 / 1,000 searches** (\$0.014 за search) | **Имя инструмента: `google_search`**; тарифицируется по числу searches, фактически выполненных, то есть по длине `groundingMetadata.webSearchQueries` — один вопрос может запускать несколько searches (по измерениям: pro-preview 1, flash-lite 2, 3.5-flash 4–7)                                                                                     |
| **Плата за Model token**       | Стандартная цена model                        | В отличие от OpenAI web search, **полученный контент НЕ вставляется как input tokens** (promptTokenCount остается почти неизменным, по измерениям 31–43 tokens); основная часть стоимости приходится на **thinking + output tokens** (один deep web-grounded Q\&A на 3.5-flash потреблял 3,500–4,900 thinking tokens, тарифицируемых по ставке output) |

<Info>
  Ориентировочная общая стоимость одного web-grounded Q\&A (плата за search + tokens): flash-lite ≈ \$0.03; 3.5-flash ≈ \$0.08–0.16; 3.1-pro-preview ≈ \$0.06. Чтобы контролировать стоимость, ограничьте поведение поиска в prompt (например, «ищите не более 2 раз») или выберите model, который выполняет меньше searches.
</Info>

<Tip>
  **Плата может быть отменена**: официальный Gemini API включает бесплатную квоту на search (серия Gemini 3: 5,000 prompt-ов в месяц бесплатно, затем \$14/1K searches). Когда upstream-вызов попадает в бесплатную квоту, плата за search для этого вызова может быть отменена (в ходе тестирования мы наблюдали полные вызовы без платы за search); когда плата взимается, она соответствует таблице выше. Сведения о billing в консоли являются определяющими.
</Tip>

## Примечания

1. **Вы должны использовать нативный эндпоинт**: все search-декларации в OpenAI-compatible режиме silently игнорируются без ошибок. Для проектов на OpenAI-SDK переключитесь на google-genai SDK (`base_url` установлено в `https://api.apiyi.com`, без `/v1`).
2. **Считайте groundingMetadata источником истины**: при тестировании flash-lite иногда (1 из 4 запусков) возвращал groundingMetadata отсутствующим. Для строгих сценариев проверяйте наличие поля и повторяйте попытку, если оно отсутствует.
3. **Давайте моделям рассуждения достаточно `maxOutputTokens`** (рекомендуется минимум 4096): 3.5-flash / 3.1-pro-preview потребляют 1,900–4,900 thinking token при grounding; маленький лимит обрезает ответ.
4. Подходят и `{"google_search": {}}`, и camelCase `{"googleSearch": {}}`; устаревший `google_search_retrieval` относится к эпохе Gemini 1.5 — используйте `google_search` для всех текущих моделей.
5. Web search можно сочетать с другими tools, например с URL Context (официальная документация Google: `ai.google.dev/gemini-api/docs/google-search`).

## ЧЗВ

**Q: Как убедиться, что ответ действительно использовал web?**

A: Проверьте, что существует `candidates[0].groundingMetadata`, `webSearchQueries` не пустой и `groundingChunks` содержит URI источников. Только текст ответа без этих полей означает, что модель ответила по данным обучения.

**Q: Нужна ли мне другая группа или специальный ключ?**

A: Нет. Для моделей Gemini ключ группы по умолчанию может напрямую вызывать поиск в web (так же, как web search в OpenAI; в отличие от собственного поиска Claude, который требует бета-группу ClaudeOfficial).

**Q: Как посмотреть количество поисков и зависит ли оно от модели?**

A: Посчитайте длину `groundingMetadata.webSearchQueries`. Для одного и того же вопроса оно сильно варьируется: pro-preview 1, flash-lite 2, 3.5-flash 4–7.

**Q: Какие модели поддерживаются?**

A: gemini-3.5-flash, gemini-3.1-flash-lite и gemini-3.1-pro-preview подтверждены. Другие модели Gemini 2.5+ тоже в принципе должны поддерживать инструмент `google_search` — выполните проверку из ЧЗВ выше, прежде чем полагаться на него.

## Связанные документы

<CardGroup cols={2}>
  <Card title="Нативные вызовы Gemini" icon="sparkles" href="/ru/api-capabilities/gemini/native">
    настройка SDK google-genai, потоковая передача, управление рассуждением
  </Card>

  <Card title="Вызов функций Gemini" icon="wrench" href="/ru/api-capabilities/gemini/function-calling">
    Пользовательские вызовы инструментов, совместимые с веб-поиском
  </Card>
</CardGroup>
