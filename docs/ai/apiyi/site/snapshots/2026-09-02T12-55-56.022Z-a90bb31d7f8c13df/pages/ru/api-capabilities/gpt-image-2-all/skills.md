> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык Agent GPT-Image-2-All

> Используйте gpt-image-2-all (обратный, линия ChatGPT — самый быстрый, фиксированные $0.03/изображение) внутри вашего Agent. Он использует тот же навык gpt-image-2 вместе с gpt-image-2 и gpt-image-2-vip; просто задайте --model как gpt-image-2-all.

<Note>
  **gpt-image-2-all не нужен собственный skill.** Он использует единый **skill серии gpt-image-2** вместе с gpt-image-2 (официальный) и gpt-image-2-vip — все три используют один и тот же OpenAI Images API; отличается только `--model`. Для полной установки, `SKILL.md`, и скрипта см. [**Agent Skill серии GPT-Image-2**](/ru/api-capabilities/gpt-image-2/skills).
</Note>

## Для чего подходит эта модель

<CardGroup cols={3}>
  <Card title="Самый быстрый" icon="bolt">
    Обратная линия ChatGPT, \~30–60 с — самый быстрый из трех каналов.
  </Card>

  <Card title="Самый дешевый" icon="piggy-bank">
    Фиксированно \$0.03 за изображение независимо от размера/качества — отлично для больших объемов.
  </Card>

  <Card title="T2I / объединение" icon="layers">
    Генерация изображений по тексту и объединение до 16 изображений (без масочного inpainting).
  </Card>
</CardGroup>

## Как использовать в навыке

После установки [навыка серии gpt-image-2](/ru/api-capabilities/gpt-image-2/skills) задайте `--model` в `gpt-image-2-all`:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Flat-illustration festival poster, portrait 2:3" -o poster.png --model gpt-image-2-all
```

Чтобы сделать его каналом по умолчанию (без `--model` каждый раз), добавьте строку в `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Warning>
  **Жесткие ограничения**: gpt-image-2-all **не принимает `size` / `quality` / `n`** —

  * указывайте размер/соотношение сторон в prompt (например, "portrait 2:3", "16:9 banner"); переданный `size` игнорируется или вызывает ошибку;
  * передача `n>1` **все равно возвращает только 1 изображение, но тарифицируется по количеству**.

  Скрипт навыка уже не передает `size`/`quality`/`n` для этой модели, так что обычное использование `--model gpt-image-2-all` безопасно; будьте внимательны только если вы вручную собираете запросы вне скрипта. Для фиксированного размера/4K используйте [`gpt-image-2-vip`](/ru/api-capabilities/gpt-image-2-vip/skills); для уровней качества / маски используйте официальный `gpt-image-2`.
</Warning>

## Связанные документы

* [Агентский навык GPT-Image-2 серии (главная страница · полный скрипт)](/ru/api-capabilities/gpt-image-2/skills)
* [Агентский навык GPT-Image-2-VIP](/ru/api-capabilities/gpt-image-2-vip/skills)
* [Обзор генерации изображений GPT-Image-2-All](/ru/api-capabilities/gpt-image-2-all/overview)
