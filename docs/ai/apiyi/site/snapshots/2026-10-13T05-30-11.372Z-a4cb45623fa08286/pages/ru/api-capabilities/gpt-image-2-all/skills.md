> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык агента GPT-Image-2.5-All

> Используйте gpt-image-2.5-all (reverse, линия ChatGPT — самая быстрая, фиксированно $0.025 за изображение; gpt-image-2-all использует тот же вызов) внутри вашего агента. Он делит общий навык gpt-image-2 с gpt-image-2 и gpt-image-2-vip; просто установите для --model значение gpt-image-2.5-all.

<Note>
  **gpt-image-2-all не нужен собственный skill.** Он использует единый **skill серии gpt-image-2** вместе с gpt-image-2 (официальный) и gpt-image-2-vip — все три используют один и тот же OpenAI Images API; отличается только `--model`. Для полной установки, `SKILL.md`, и скрипта см. [**Agent Skill серии GPT-Image-2**](/ru/api-capabilities/gpt-image-2/skills).
</Note>

## Для чего подходит эта модель

<CardGroup cols={3}>
  <Card title="Самый быстрый" icon="bolt">
    Линия Reverse ChatGPT, \~30–60 с — самый быстрый из трех каналов.
  </Card>

  <Card title="Самый дешевый" icon="piggy-bank">
    Фиксированная цена \$0.025 за изображение независимо от размера и качества — отлично подходит для больших объемов.
  </Card>

  <Card title="T2I / слияние" icon="layers">
    Генерация изображений по тексту и слияние до 16 изображений (без inpainting по маске).
  </Card>
</CardGroup>

## Как использовать это в навыке

После установки [навыка серии gpt-image-2](/ru/api-capabilities/gpt-image-2/skills) задайте `--model` равным `gpt-image-2.5-all` (или `gpt-image-2-all`; цена и поведение одинаковы):

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Flat-illustration festival poster, portrait 2:3" -o poster.png --model gpt-image-2.5-all
```

Чтобы сделать его каналом по умолчанию (без `--model` каждый раз), добавьте строку в `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-all
```

<Warning>
  **Критические ограничения**: gpt-image-2-all **не принимает `size` / `quality` / `n`** —

  * указывайте размер/соотношение сторон **в промпте** (например, «портрет 2:3», «баннер 16:9»); переданный `size` игнорируется или вызывает ошибку;
  * передача `n>1` **по-прежнему возвращает только 1 изображение, но тарификация выполняется по количеству**.

  Скрипт навыка уже не передаёт `size`/`quality`/`n` для этой модели, поэтому обычное использование `--model gpt-image-2-all` безопасно; будьте внимательны только при ручном создании запросов вне скрипта. Для фиксированного размера/4K используйте [`gpt-image-2-vip`](/ru/api-capabilities/gpt-image-2-vip/skills); для уровней качества / маски используйте официальный `gpt-image-2`.
</Warning>

## Связанные документы

* [Агентский навык GPT-Image-2 серии (главная страница · полный скрипт)](/ru/api-capabilities/gpt-image-2/skills)
* [Агентский навык GPT-Image-2-VIP](/ru/api-capabilities/gpt-image-2-vip/skills)
* [Обзор генерации изображений GPT-Image-2-All](/ru/api-capabilities/gpt-image-2-all/overview)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.