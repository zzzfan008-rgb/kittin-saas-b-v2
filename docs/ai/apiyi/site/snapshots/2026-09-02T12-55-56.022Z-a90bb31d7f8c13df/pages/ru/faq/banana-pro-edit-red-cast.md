> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Почему мое изображение становится красноватым после редактирования в Nano Banana Pro?

> Распространенные способы уменьшить красноватый/теплый оттенок при редактировании изображений в Nano Banana Pro: переключитесь на канал Vertex или перейдите на gpt-image-2.

## Краткий ответ

Общий красноватый/тёплый оттенок в правках изображений Nano Banana Pro (`gemini-3-pro-image`) — часто встречающийся симптом. Два распространённых способа устранения:

1. Направьте Nano Banana Pro через канал Vertex
2. Переключитесь на gpt-image-2 для задачи редактирования

## Подробное объяснение

### Какой канал по умолчанию использует banana pro?

Nano Banana Pro на apiyi по умолчанию маршрутизируется через **официальный канал AI Studio**. Vertex — это отдельный, необязательный пул, который подключается, когда у AI Studio возникают проблемы (см. [Google маршрутизируется через AI Studio или Vertex?](/ru/faq/google-upstream-aistudio-vertex)).

### Как переключиться на Vertex?

Vertex доступен как **отдельная группа** в консоли apiyi. При создании или редактировании token выберите группу, связанную с Vertex; менять код не требуется (см. [Google маршрутизируется через AI Studio или Vertex?](/ru/faq/google-upstream-aistudio-vertex)).

### Исправит ли это gpt-image-2?

gpt-image-2 обычно лучше сохраняет исходные цвета в задачах редактирования. Рассматривайте его как запасной вариант — см. [GPT-Image-2 API для редактирования изображений](/ru/api-capabilities/gpt-image-2-all/image-edit).

## Устранение неполадок

<Steps>
  <Step title="Повторите в веб-песочнице">
    Откройте `imagen.apiyi.com` и снова запустите тот же prompt + референсное изображение.

    * Повторяется в вебе → вероятно, поведение модели; попробуйте Vertex / gpt-image-2
    * В вебе всё нормально → проверьте вашу интеграцию (см. [Изображение на выходе сильно отличается от референсного изображения](/ru/faq/image-result-differs-from-reference))
  </Step>

  <Step title="Убедитесь, что референсное изображение загружено как base64">
    Nano Banana Pro **не** принимает загрузки референсного изображения в стиле OpenAI — требуется base64 (см. [Изображение на выходе сильно отличается от референсного изображения](/ru/faq/image-result-differs-from-reference)). Если вы напрямую укажете URL в `image_url`, модель по сути «воображает» референс, что также может проявляться как цветовой оттенок.
  </Step>

  <Step title="Попробуйте канал Vertex">
    Переключите группу вашего token на группу Vertex и снова запустите тот же prompt. Сравните цветовой оттенок с AI Studio.
  </Step>

  <Step title="Попробуйте gpt-image-2">
    Если в Vertex по-прежнему виден цветовой оттенок, вернитесь к gpt-image-2. Учтите, что визуальный стиль будет отличаться от banana pro; ожидайте, что вам придется заново настроить prompt.
  </Step>
</Steps>

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="gpt-image-2 против banana pro при редактировании">
    banana pro больше тяготеет к «стилизованному перерендеру», а gpt-image-2 — к «деликатному редактированию на месте». gpt-image-2 обычно лучше сохраняет исходные цвета.
  </Accordion>
</AccordionGroup>

## Связанные документы

* [Google маршрутизируется через AI Studio или Vertex?](/ru/faq/google-upstream-aistudio-vertex)
* [Выходное изображение сильно отличается от эталонного изображения](/ru/faq/image-result-differs-from-reference)
* [API редактирования изображений Nano Banana Pro](/ru/api-capabilities/nano-banana-image/image-edit)
* [API редактирования изображений GPT-Image-2](/ru/api-capabilities/gpt-image-2-all/image-edit)

## Свяжитесь с нами

Если вам нужна помощь в подтверждении, доступна ли группа Vertex в вашей учётной записи, или в устранении цветовых оттенков при редактировании, пожалуйста, обратитесь в службу поддержки.
