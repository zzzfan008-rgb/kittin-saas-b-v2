> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision

> Первая модель DeepSeek для работы с изображениями deepseek-v4-flash-vision-exp: распознает изображения, скриншоты и диаграммы. Контекстное окно 1M, максимум 384 tokens на изображение. Стоимость на APIYI: $0.44 за входящие / $1.32 за исходящие за 1M tokens, доступна для вызова в форматах OpenAI и Anthropic.

`deepseek-v4-flash-vision-exp` — это экспериментальная vision-модель DeepSeek, построенная на базе V4 Flash с добавленным вводом изображений: описывайте картинки, извлекайте текст из скриншотов, считывайте значения с графиков, сравнивайте несколько изображений. Всё в текстовой части (контекст 1M, thinking mode, function calling, кэширование контекста) сохранено, а тарификация идентична V4 Flash только для текста —— **vision не требует доплаты; изображения преобразуются в input tokens по своим размерам**.

APIYI уже завершила **124 тест-кейса примерно за 1 100 вызовов**, охватив три канала ввода изображений, четыре формата изображений, два протокола и две группы.

<Warning>
  **Прочитайте это перед вызовом: эта модель обслуживается двумя группами на APIYI с разными возможностями. Выберите группу, которая соответствует вашему протоколу.**

  | Используемый вами протокол                                                   | В какой группе должен находиться ваш ключ |
  | ---------------------------------------------------------------------------- | ----------------------------------------- |
  | Формат OpenAI (`/v1/chat/completions`, `/v1/responses`)                      | **`default`**                             |
  | Формат Anthropic (`/v1/messages`, включая Claude Code и аналогичные клиенты) | **`ClaudeCode`**                          |

  Выбор неправильной группы не вызывает ошибку «неверная группа». Это проявляется так: параметры тихо не срабатывают, на втором ходе возникает 400 или `/v1/responses` жалуется на `messages`.
  Обе группы имеют **одинаковую тарификацию** —— группа влияет только на возможности, но никогда не на тарификацию.
  См. ниже «Выбор группы».
</Warning>

## Основные моменты

<CardGroup cols={2}>
  <Card title="Без надбавки за vision" icon="circle-dollar-sign">
    Та же цена, что и у текстового V4 Flash: \$0.44 за input, \$1.32 за output на 1M tokens. Изображения становятся input tokens, с ограничением 384 на одно изображение.
  </Card>

  <Card title="Надёжное распознавание в тестировании" icon="eye">
    Значения OCR со скриншота все верны, диаграмма из 5 столбцов распознана 5/5, подсчёт определённой фигуры среди 36 фигур — 24/24. На отрицательных вопросах галлюцинаций нет.
  </Card>

  <Card title="Не нужно предварительно сжимать" icon="image">
    2000×2000 и 4000×4000 преобразуются ровно в одинаковое число tokens (346). Upstream масштабирует за вас —— сжатие экономит только трафик, но не деньги.
  </Card>

  <Card title="Оба протокола работают" icon="git-compare">
    Формат OpenAI (chat/completions + responses) и формат Anthropic (/v1/messages) оба проверены, каждый через свою группу.
  </Card>
</CardGroup>

## Информация о модели

| Поле                                           | Значение                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Имя модели**                                 | `deepseek-v4-flash-vision-exp`                                                                                 |
| **Версия модели**                              | DeepSeek-V4-Flash-Vision-Exp (experimental)                                                                    |
| **Контекстное окно**                           | 1M (измеренный жесткий предел 1,048,576 tokens, включая `max_tokens`)                                          |
| **Максимальный вывод**                         | 384K (измеренный жесткий предел 393,216; при превышении возвращает `valid range of max_tokens is [1, 393216]`) |
| **Доступные группы**                           | `default`, `ClaudeCode`, `svip`                                                                                |
| **Эндпоинты**                                  | `POST /v1/chat/completions`, `POST /v1/responses`, `POST /v1/messages`                                         |
| **Ввод изображений**                           | ✅ JPEG / PNG / GIF / WebP                                                                                      |
| **Режим рассуждения**                          | Включен по умолчанию, можно отключить (рабочий синтаксис зависит от группы, см. ниже)                          |
| **Потоковая передача**                         | ✅ на всех трех эндпоинтах                                                                                      |
| **Вызов функций / использование инструментов** | ✅ включая инкрементальную сборку потоковой передачи                                                            |
| **Вывод JSON**                                 | ✅ `json_object`; ❌ `json_schema` (не включено upstream)                                                        |
| **Тарификация**                                | \$0.44 input, \$1.32 output, \$0.014 cache hit, за 1M tokens                                                   |

<Note>
  Поскольку с 2026-08-17 поставщик тарифицирует эту модель в два уровня в зависимости от времени суток (часы пик —
  01:00-04:00 и 06:00-10:00 (UTC)). **APIYI всегда взимает тариф пикового периода**, поэтому ваша стоимость
  не меняется в зависимости от часа.
</Note>

## Выбор группы

Две группы на APIYI направляют запросы к разным вышестоящим эндпоинтам, поэтому их возможности не эквивалентны. Таблица ниже измерена 2026-08-21, по три повтора в каждой ячейке:

| Возможность                                          | группа `default`                                            | группа `ClaudeCode`          |
| ---------------------------------------------------- | ----------------------------------------------------------- | ---------------------------- |
| `/v1/chat/completions` с изображением                | ✅                                                           | ✅                            |
| `/v1/responses` с изображением                       | ✅                                                           | ❌ 400 каждый раз             |
| `/v1/messages` с изображением                        | ⚠️ требуется явный `top_p`, а при многоходовом режиме — 400 | ✅ полностью работает         |
| `detail`: экономия tokens                            | ✅ работает                                                  | ❌ игнорируется               |
| Отключение режима рассуждения (формат OpenAI)        | ✅ работает                                                  | ❌ игнорируется               |
| `logprobs`                                           | ✅ заполнено                                                 | ❌ возвращает пустое значение |
| `reasoning_tokens` в usage                           | ✅ присутствует                                              | ❌ отсутствует всё поле       |
| Изображение по общедоступному URL (формат Anthropic) | ❌                                                           | ✅                            |

### Формат OpenAI → используйте группу `default`

Создайте token для группы `default`, затем:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",          # a token in the default group
    base_url="https://api.apiyi.com/v1",
)
```

### Формат Anthropic → используйте группу `ClaudeCode`

Создайте token для группы `ClaudeCode`, затем:

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",          # a token in the ClaudeCode group
    base_url="https://api.apiyi.com",
)
```

<Tip>
  Одна учетная запись может одновременно содержать несколько tokens в разных группах, и они не мешают друг другу ——
  держать по одному на каждый протокол — рекомендуемая схема. См.
  [Что такое группы](/ru/faq/groups-explained) и
  [Tokens и группы](/ru/faq/token-and-groups), чтобы понять, как их создать, и
  [Codex против ClaudeCode против групп по умолчанию](/ru/faq/codex-claudecode-default-groups)
  чтобы понять, чем они отличаются.
</Tip>

<Warning>
  **Никогда не используйте группу `default` для формата Anthropic.** Там накладываются две проблемы:

  1. Если не указывать `top_p`, каждый раз возвращается 400 `Invalid top_p value`
  2. Даже если `top_p` указан, повторная отправка блока `thinking` из первого хода во второй ход
     возвращает `unknown variant 'thinking'` —— а стандартные клиенты, такие как Claude Code и
     Anthropic SDK, всегда повторно отправляют его, поэтому **многоходовый режим всегда ломается**

  Переключитесь на группу `ClaudeCode`, и ни одной из этих проблем не будет; полный цикл вызова tools
  тоже работает.
</Warning>

## Три способа отправить изображение

### 1. Встроенный base64 (наиболее распространённый)

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is in this image?"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ],
    }],
    max_tokens=2000,
)
print(resp.choices[0].message.content)
```

### 2. Общедоступный URL изображения

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image."},
            {"type": "image_url",
             "image_url": {"url": "https://example.com/image.jpg"}},
        ],
    }],
    max_tokens=2000,
)
```

URL может содержать не более 8192 символов, а загрузка должна завершиться в течение 60 секунд.
Нерабочая ссылка возвращает `Failed to download image`.

### 3. Блок содержимого `file` (эквивалентен встроенному base64)

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

Измеренная стоимость token идентична каналу `image_url` (303 за одно и то же изображение в любом случае).

<Warning>
  **API файлов (загрузка в `/v1/files`, затем ссылка по `file_id`) недоступен в APIYI**,
  что нормально для сторонних шлюзов. Два лимита, которые поставщик оставляет для `file_id`
  —— 64 MiB на изображение и 200 MiB на запрос —— поэтому недостижимы.

  Фактически применяются лимиты **32 MiB на изображение и 48 MiB на тело запроса**.
  При их превышении возвращается `image file size exceeds limit 32 MB`.
</Warning>

## Как тарифицируются изображения

Изображение преобразуется во входные tokens на основе его **размеров после изменения размера**, и тарифицируется вместе
с вашими текстовыми tokens по \$0.44 / 1M. Приведённые ниже числа измерены в APIYI с использованием фиксированного prompt
и с вычитанием базового уровня только для текста:

| Размер изображения             | Tokens | Стоимость за изображение | На 1,000 изображений |
| ------------------------------ | ------ | ------------------------ | -------------------- |
| 64×64                          | 114    | \$0.00005                | \$0.05               |
| 384×384                        | 114    | \$0.00005                | \$0.05               |
| 800×800                        | 346    | \$0.000152               | \$0.15               |
| 2000×2000                      | 346    | \$0.000152               | \$0.15               |
| 4000×4000                      | 346    | \$0.000152               | \$0.15               |
| 1600×1200                      | 354    | \$0.000156               | \$0.16               |
| 1600×1200 with `detail: "low"` | 142    | \$0.0000625              | \$0.06               |

Три правила, в точности соответствующие описанию поставщика:

* **384 tokens на изображение — это жёсткий предел.** Наибольшее измеренное значение было 354; ни одно изображение его не превышает
* **Большие изображения уменьшаются примерно до эквивалента 800×800.** Именно поэтому 2000² и 4000²
  стоят одинаково, и именно поэтому **предварительное сжатие перед загрузкой экономит трафик, но не деньги**
* **Изображения меньше 384×384 увеличиваются.** Поэтому 64×64 стоит столько же, сколько 384×384 —— не нужно дополнительно уменьшать
  маленькие изображения

### Экономия tokens: `detail: "low"`

Когда мелкие детали не важны (определение типа изображения, распознавание объекта, грубая
классификация), добавьте `detail: "low"`, чтобы уменьшить изображение до 512×512 перед inference:

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

Все четыре уровня, измеренные на одном и том же изображении 1600×1200:

| `detail`   | Tokens | по сравнению с default |
| ---------- | ------ | ---------------------- |
| `low`      | 142    | **-60%**               |
| `high`     | 354    | то же                  |
| `original` | 354    | базовый уровень        |
| `auto`     | 354    | то же                  |

<Warning>
  `detail` вступает в силу только при выполнении **обоих** условий: он задан в блоке `image_url`
  (в блоке `file` он молча игнорируется), а ваш token находится в группе **`default`**
  (в группе `ClaudeCode` он ничего не делает).

  Недопустимое значение приводит к явной ошибке:
  `unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.
</Warning>

## Controlling thinking mode

Thinking mode is **on by default**, and the thinking text counts against your `max_tokens` budget.
For pure image-reading tasks, turn it off: with thinking disabled our tests scored 24/24, ran
faster, saved the entire thinking output, and cut 80 input tokens as well (the thinking system
prompt costs exactly that much).

Every syntax, three runs each:

| Syntax                           | chat, `default` group                                     | chat, `ClaudeCode` group | `/v1/messages` |
| -------------------------------- | --------------------------------------------------------- | ------------------------ | -------------- |
| `thinking: {"type": "disabled"}` | ✅                                                         | ❌                        | ✅ both groups  |
| `reasoning_effort: "none"`       | ✅                                                         | ❌                        | —              |
| `reasoning_effort: "low"`        | ⚠️ thinking stays on, only the system prompt gets shorter | ❌                        | —              |
| `reasoning: {"effort": "none"}`  | ❌                                                         | ❌                        | —              |
| `enable_thinking: false`         | ❌                                                         | ❌                        | —              |

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[...],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},   # works in the default group
)
```

<Warning>
  **Do not set `max_tokens` too low.** With thinking on, even a one-line question can emit several
  hundred tokens of thinking first; too small a budget yields `finish_reason: "length"` with an
  empty `content` —— which looks like the model failed to answer. Use 2000 or more with thinking
  on, or simply disable thinking.
</Warning>

## Кэширование контекста

Для кэширования не нужны параметры: повторяющийся длинный префикс автоматически попадает в кэш, а попавшая в кэш часть тарифицируется по \$0.014 / 1M. Но **запросы с изображениями отличаются от только текстовых по двум пунктам**:

|                                       | Запрос только с текстом | Запрос с изображением     |
| ------------------------------------- | ----------------------- | ------------------------- |
| Первое попадание происходит на вызове | 2-й                     | 3-й                       |
| tokens самого изображения             | —                       | **никогда не кэшируются** |

Измерено на текстовом префиксе в 2304 token плюс одном изображении 800×800:

| Вызов | prompt\_tokens | Попадание | Промах |
| ----- | -------------- | --------- | ------ |
| 1     | 2675           | 0         | 2675   |
| 2     | 2675           | 0         | 2675   |
| 3     | 2675           | **2304**  | 371    |
| 4     | 2675           | 2304      | 371    |

Попадание — это ровно тот текст, который находится **перед** изображением; изображение и все, что идет после него, каждый раз тарифицируются по полной цене. Поэтому **помещайте фиксированные длинные инструкции перед изображением**, чтобы они попадали в кэш —— все, что размещено после изображения, никогда не сможет попасть в кэш.

<Note>
  В формате Anthropic эти поля называются `cache_read_input_tokens` и
  `cache_creation_input_tokens`, и работают так же. Обратите внимание, что явные `cache_control`
  маркеры **не влияют** (upstream использует автоматическое кэширование префикса), а два протокола
  по-разному отображают использование: у OpenAI `prompt_tokens` всегда показывает полное количество, тогда как у Anthropic `input_tokens`
  после попадания снижается до некэшированного остатка —— **их нельзя
  напрямую сопоставить**.
</Note>

## Поддерживаемые форматы изображений

| Формат           | Поддерживается | Примечание                                                                           |
| ---------------- | -------------- | ------------------------------------------------------------------------------------ |
| JPEG             | ✅              |                                                                                      |
| PNG              | ✅              |                                                                                      |
| GIF              | ✅              | Анимированные GIF **читаются только как первый кадр** и тарифицируются как один кадр |
| WebP             | ✅              |                                                                                      |
| BMP / TIFF / SVG | ❌              | Возвращает `You have uploaded an unsupported image`                                  |

Все четыре поддерживаемых формата преобразуются в одинаковое число token, поэтому контейнер никогда не влияет на стоимость.

<Tip>
  **Формат определяется по содержимому файла, а не по объявленному вами MIME type.** При тестировании
  PNG, объявленный как `image/jpeg`, работал без проблем — неправильное расширение или неверный MIME не имеют значения,
  если сам файл относится к одному из четырёх поддерживаемых форматов.
</Tip>

## Проверенная матрица возможностей

Измерено APIYI 2026-08-21:

| Возможность                                            | Заявление поставщика | Измерено (группа `default`)                                                                     |
| ------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------------------- |
| Встроенное base64-изображение                          | ✅                    | ✅                                                                                               |
| Изображение по публичному URL                          | ✅                    | ✅                                                                                               |
| Блок `file` с `file_data`                              | ✅                    | ✅                                                                                               |
| `file_id` (API файлов)                                 | ✅                    | ❌ платформа не предлагает API файлов                                                            |
| Несколько изображений за один запрос                   | до 600               | ✅ проверено 20 изображений, порядок и содержимое полностью верны                                |
| Изображение плюс многоходовой контекст                 | ✅                    | ✅                                                                                               |
| Изображение плюс вызов функций                         | ✅                    | ✅, включая инкременты потоковой передачи                                                        |
| Изображение плюс вывод JSON                            | ✅                    | ✅ `json_object`                                                                                 |
| Структурированный вывод `json_schema`                  | —                    | ❌ upstream возвращает `This response_format type is unavailable now`                            |
| Потоковая передача                                     | ✅                    | ✅ во всех трех эндпоинтах                                                                       |
| `logprobs` / `temperature` / `top_p` / `stop` / `seed` | ✅                    | ✅                                                                                               |
| Связывание `previous_response_id` в Responses          | ✅                    | ❌ **молча не работает** (без ошибки, но без контекста). Собирайте полный `input` самостоятельно |

### Выборочные проверки точности

| Задача                                                          | Результат                             |
| --------------------------------------------------------------- | ------------------------------------- |
| OCR скриншота из 6 строк со смешанным буквенно-цифровым текстом | ID заказа, сумма и email — всё верно  |
| Чтение столбчатой диаграммы с 5 столбцами                       | 5/5 верно, включая заголовок          |
| Подсчёт конкретной фигуры в сетке 6×6 (36 фигур)                | 24/24 верно                           |
| Поиск различий между двумя изображениями                        | Верно                                 |
| Распознавание подписей по порядку на 10 и 20 изображениях       | Всё верно                             |
| Негативный вопрос (что-то отсутствующее на изображении)         | Корректно отклонено, без галлюцинаций |

## Ограничения и распространённые ошибки

| Ограничение           | Значение                 | Ошибка при превышении                                   |
| --------------------- | ------------------------ | ------------------------------------------------------- |
| Одно изображение      | 32 MiB                   | `image file size exceeds limit 32 MB`                   |
| Тело запроса          | 48 MiB                   | —                                                       |
| Длина URL             | 8192 characters          | `external link length … too long, max link length 8192` |
| Изображений на запрос | 600 по данным поставщика | —                                                       |
| `max_tokens`          | 393,216                  | `valid range of max_tokens is [1, 393216]`              |
| `top_logprobs`        | 0–20                     | `valid range of top_logprobs is [0, 20]`                |
| Контекст              | 1,048,576                | `This model's maximum context length is 1048576 tokens` |

<Note>
  Предел контекста 1,048,576 измеряется, и сообщение об ошибке показывает, что **`max_tokens`
  засчитывается в этот же общий объём** (`… in the messages, … in the completion`). При упаковке
  длинного контекста оставляйте место для вашего бюджета вывода, иначе вы достигнете предела.
</Note>

Другие распространённые ошибки 400:

* `You have uploaded an unsupported image` —— формат не один из четырёх, либо base64 повреждён
* `Failed to download image` —— URL недоступен или ответ не был получен более 60 секунд
* `Image in assistant message is unsupported` —— изображения могут появляться только в сообщениях `user`

<Note>
  Во время тестирования примерно **1%-3%** запросов соединение молча закрывалось (на стороне
  клиента это проявлялось как SSL EOF или timeout на этапе handshake). Это не связано с изображениями и не связано с
  группой —— это периодическое событие на уровне транспорта. **Всегда задавайте read timeout и повторяйте попытку**,
  иначе один запрос может зависнуть более чем на две минуты.
  См. [Настройка тайм-аута](/ru/faq/timeout-configuration).
</Note>

## Полные примеры

### Формат OpenAI (`default` группа)

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",       # default group
    base_url="https://api.apiyi.com/v1",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "original"}},
        ],
    }],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
print(resp.usage)
```

### Формат Anthropic (`ClaudeCode` группа)

```python theme={null}
import base64
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",       # ClaudeCode group
    base_url="https://api.apiyi.com",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

msg = client.messages.create(
    model="deepseek-v4-flash-vision-exp",
    max_tokens=2000,
    thinking={"type": "disabled"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/png", "data": b64}},
        ],
    }],
)
print(msg.content)
```

## Связанная документация

<CardGroup cols={2}>
  <Card title="Vision Understanding API" icon="eye" href="/ru/api-capabilities/vision-understanding">
    Общие схемы вызова и сравнение между vision-моделями
  </Card>

  <Card title="DeepSeek V4 Flash" icon="zap" href="/ru/api-capabilities/deepseek-v4-flash/overview">
    Текстовая версия на той же базе, с контекстом 1M и двумя эндпоинтами
  </Card>

  <Card title="Выбор группы" icon="users" href="/ru/faq/codex-claudecode-default-groups">
    Чем отличаются группы Codex, ClaudeCode и Default и какую выбрать
  </Card>

  <Card title="Настройка тайм-аута" icon="timer" href="/ru/faq/timeout-configuration">
    Рекомендуемые настройки тайм-аута чтения на клиенте и повторных попыток
  </Card>
</CardGroup>
