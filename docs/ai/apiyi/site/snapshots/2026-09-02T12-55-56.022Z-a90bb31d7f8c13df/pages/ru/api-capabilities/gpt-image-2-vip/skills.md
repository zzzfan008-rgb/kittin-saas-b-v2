> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-VIP Agent Skill

> Используйте gpt-image-2-vip (reverse, строка Codex — фиксируемый размер/4K, фиксированные $0.03 за изображение) внутри вашего Agent. Он использует общий skill gpt-image-2 вместе с gpt-image-2 и gpt-image-2-all; просто задайте --model как gpt-image-2-vip.

<Note>
  **gpt-image-2-vip не нужен собственный skill.** Он использует общий **skill серии gpt-image-2** вместе с gpt-image-2 (официальный) и gpt-image-2-all — все три используют один и тот же OpenAI Images API; отличается только `--model`. Для полной установки, `SKILL.md` и скрипта см. [**Agent Skill для серии GPT-Image-2**](/ru/api-capabilities/gpt-image-2/skills).
</Note>

## Для чего подходит эта модель

<CardGroup cols={3}>
  <Card title="Фиксируемый размер / 4K" icon="expand">
    Обратная линейка Codex, поддерживает 30 `size` уровней (в т. ч. 4K, например 3840×2160) — управляемые размеры.
  </Card>

  <Card title="Самый дешевый" icon="piggy-bank">
    Фиксированная цена \$0.03 за изображение, все размеры по одной цене, без доплаты за 4K.
  </Card>

  <Card title="T2I / слияние" icon="layers">
    Text-to-image и слияние до 16 изображений (без уровней качества / маски).
  </Card>
</CardGroup>

## Как использовать это в скиле

После установки [скила серии gpt-image-2](/ru/api-capabilities/gpt-image-2/skills) задайте `--model` как `gpt-image-2-vip` и зафиксируйте размер с помощью `--size`:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2-vip --size 3840x2160
```

Чтобы сделать это каналом по умолчанию, добавьте строку в `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-vip
```

<Warning>
  **Красные линии**: gpt-image-2-vip **не принимает `quality` / `n`** и **не поддерживает inpainting по маске** (для масок используйте официальный `gpt-image-2`). Передача `n>1` по-прежнему возвращает 1 изображение, но тарифицируется по количеству. Скрипт скила автоматически блокирует это, так что обычное использование `--model gpt-image-2-vip` безопасно.

  Также: `size` иногда отключается на стороне upstream и принудительно переводится в adaptive 1K; если это произошло, также укажите размер/соотношение сторон **в prompt** (например, «16:9») как запасной вариант.
</Warning>

## Связанные документы

* [GPT-Image-2 Серия Agent Skill (главная страница · полный скрипт)](/ru/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All Agent Skill](/ru/api-capabilities/gpt-image-2-all/skills)
* [Обзор генерации изображений GPT-Image-2-VIP](/ru/api-capabilities/gpt-image-2-vip/overview)
