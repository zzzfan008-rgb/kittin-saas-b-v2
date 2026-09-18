> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык агента GPT-Image-2.5-VIP

> Используйте gpt-image-2.5-vip (обратный вызов, линейка Adobe — фиксируемый размер/4K, фиксированная цена $0.03 за изображение; gpt-image-2-vip использует тот же вызов) в своём агенте. Для gpt-image-2.5-vip, gpt-image-2 и gpt-image-2-all используется один общий навык gpt-image-2; просто задайте --model gpt-image-2.5-vip.

<Note>
  **gpt-image-2-vip не нужен собственный skill.** Он использует общий **skill серии gpt-image-2** вместе с gpt-image-2 (официальный) и gpt-image-2-all — все три используют один и тот же OpenAI Images API; отличается только `--model`. Для полной установки, `SKILL.md` и скрипта см. [**Agent Skill для серии GPT-Image-2**](/ru/api-capabilities/gpt-image-2/skills).
</Note>

## Для чего лучше всего подходит эта модель

<CardGroup cols={3}>
  <Card title="Фиксируемый размер / 4K" icon="expand">
    Обратная линейка Adobe (Firefly), поддерживает 30 `size` уровней (включая 4K, например 3840×2160) — управляемые размеры.
  </Card>

  <Card title="Самая низкая цена" icon="piggy-bank">
    Фиксированная цена \$0.03 за изображение, одинаковая стоимость для всех размеров, без доплаты за 4K.
  </Card>

  <Card title="T2I / слияние" icon="layers">
    Преобразование текста в изображение и слияние до 16 изображений (без уровней качества / маски).
  </Card>
</CardGroup>

## Как использовать в навыке

После установки [навыка серии gpt-image-2](/ru/api-capabilities/gpt-image-2/skills) задайте для `--model` значение `gpt-image-2.5-vip` (или `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`) и зафиксируйте размер с помощью `--size`:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2.5-vip --size 3840x2160
```

Чтобы сделать его каналом по умолчанию, добавьте строку в `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-vip
```

<Warning>
  **Ограничения**: уровни `quality` зависят от модели — две модели 2.5 поддерживают все шесть (`xhigh` / `max` открыты 2026-09-10), `gpt-image-2-vip` ограничивается `high` и отклоняет `xhigh` / `max`; 2.5 `high` соответствует только `gpt-image-2-vip` `medium`, а 2.5 `max` соответствует своему `high`. **никогда не отправляйте `n`** (передача `n>1` всё равно возвращает 1 изображение, но тарифицируется по количеству), а **mask выполняет регенерацию всего изображения** (для точного инпейнтинга используйте официальные модели). Скрипт навыка автоматически применяет эти ограничения, поэтому обычное использование `--model gpt-image-2.5-vip` безопасно.

  Также: `size` иногда отключается на стороне провайдера и принудительно переключается на адаптивный 1K; в таком случае также укажите размер/соотношение **в prompt** (например, «16:9») в качестве резервного варианта.
</Warning>

## Связанные документы

* [GPT-Image-2 Серия Agent Skill (главная страница · полный скрипт)](/ru/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All Agent Skill](/ru/api-capabilities/gpt-image-2-all/skills)
* [Обзор генерации изображений GPT-Image-2-VIP](/ru/api-capabilities/gpt-image-2-vip/overview)
