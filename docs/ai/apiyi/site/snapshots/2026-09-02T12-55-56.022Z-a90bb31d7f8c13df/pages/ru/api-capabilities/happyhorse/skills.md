> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык видео-агента HappyHorse

> Используйте HappyHorse-1.1 (ориентированную на качество видеомодель Alibaba) в вашем агенте — она использует навык wan вместе с Wan2.7; просто задайте --model happyhorse.

<Note>
  **HappyHorse не нуждается в собственном навыке**. Он использует общий **wan video skill** с Wan2.7 — обе серии используют один и тот же эндпоинт, ту же структуру запроса и ту же `Wan&HappyHorse` token группу; отличаются только идентификаторы моделей. Для полной настройки, `SKILL.md` и скрипта см. [**Навык видео-агента Wan2.7 / HappyHorse**](/ru/api-capabilities/wan/skills).
</Note>

## Для чего эта модель подходит

<CardGroup cols={3}>
  <Card title="Ориентация на качество" icon="sparkles">
    Тот же эндпоинт и тот же способ использования, что и у Wan2.7, но с более высоким визуальным качеством — для сцен, где качество изображения важнее всего.
  </Card>

  <Card title="До 9 референсных изображений" icon="images">
    Преобразование референсов в видео принимает до 9 референсных изображений (Wan2.7 ограничивает объединённые референсы 5).
  </Card>

  <Card title="Один общий token" icon="key-round">
    Один `Wan&HappyHorse` групповой token обслуживает обе серии — переключение ничего не стоит.
  </Card>
</CardGroup>

## Использование внутри скилла

После установки [скилла для видео Wan](/ru/api-capabilities/wan/skills) просто задайте `--model happyhorse`:

```bash theme={null}
python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, golden forest, cinematic" --model happyhorse -o valley.mp4
```

Скрипт выбирает нужный model ID из переданных вами ассетов (`happyhorse-1.1-t2v` / `-i2v` / `-r2v` / `happyhorse-1.0-video-edit`) — не нужно запоминать названия.

<Warning>
  **Красные линии**: HappyHorse не поддерживает референсные видео или audio driving —

  * `--ref-video` — только для Wan2.7; скрипт сразу отклоняет его для happyhorse;
  * image-to-video принимает только изображение первого кадра, без `driving_audio` в стиле Wan2.7;
  * тарификация примерно в 1.5× выше, чем у Wan2.7 (720P \$0.126/s, 1080P \$0.224/s — около \$0.63 за 5-секундный 720P-ролик), поэтому для нагрузок с большим объёмом лучше использовать значение `wan` по умолчанию.

  Скрипт скилла автоматически учитывает все эти различия; при обычном использовании `--model happyhorse` вы с ними не столкнётесь.
</Warning>

## Связанные документы

* [Wan2.7 / HappyHorse Video Agent Skill (основная страница с полным скриптом)](/ru/api-capabilities/wan/skills)
* [Обзор генерации видео HappyHorse](/ru/api-capabilities/happyhorse/overview)
* [Seedance 2.0 Video Agent Skill](/ru/api-capabilities/seedance2/skills)
