> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык агента Nano Banana 2

> Упакуйте Nano Banana 2 (gemini-3.1-flash-image-preview) как готовый к использованию навык агента. Поместите его в Codex, OpenClaw, hermes-agent, Claude Code или любой кодирующий агент и вызывайте APIYI для генерации изображений по тексту и редактирования изображений с помощью одного prompt.

<Note>
  Эта страница предлагает **готовый к использованию Agent Skill**: добавьте его в уже используемый вами coding Agent и с помощью естественного языка (или явной команды) вызовите **Nano Banana 2** (`gemini-3.1-flash-image-preview`) на платформе APIYI для генерации изображений и редактирования. Всё это — всего два файла: копируете и начинаете работать.
</Note>

<Tip>
  Если вместо этого вам нужен скилл **Pro** (`gemini-3-pro-image`, качество высшего уровня), см. [Nano Banana Pro Agent Skill](/ru/api-capabilities/nano-banana-image/skills). Эта страница посвящена **Nano Banana 2** (качество уровня Pro при скорости уровня Flash, более выгодное соотношение цены и качества).
</Tip>

## Что делает навык

Единый комбинированный навык. Скрипт автоматически определяет **передаёте ли вы входные изображения**, чтобы выбрать между генерацией изображений по тексту и редактированием изображений:

<CardGroup cols={3}>
  <Card title="Генерация изображений по тексту" icon="wand-sparkles">
    Только prompt → совершенно новое изображение, с **14 соотношениями сторон** и разрешением 512/1K/2K/4K.
  </Card>

  <Card title="Редактирование изображений" icon="image">
    Одно изображение + инструкция → локальные правки, изменение стиля, замена фона и многое другое.
  </Card>

  <Card title="Композиция из нескольких изображений" icon="layers">
    Несколько изображений + одна инструкция → композиция, сравнение, замена одежды и т. д.
  </Card>
</CardGroup>

По сравнению с Pro, Nano Banana 2 добавляет четыре **сверхвысоких/сверхшироких** соотношения сторон (`1:4 / 4:1 / 1:8 / 8:1`) и эксклюзивный низкоразрешающий уровень **512px**, всего за \$0.055/image за вызов (при token-based расчете — всего около \$0.025/image), что лучше подходит для больших объёмов.

## Какие Агенты могут использовать это

<Info>
  По сути, Skill — это просто **папка**: набор инструкций, которые агент должен прочитать (`SKILL.md`), и скрипт, который выполняет работу. Поэтому **любой кодирующий агент, который умеет читать локальные файлы и запускать команды оболочки, может использовать его** — например **Codex, OpenClaw, hermes-agent, Claude Code** и другие.

  Единственное требование: на машине, на которой запущен агент (ваш компьютер или сервер), установлены **Python 3** и **сетевой доступ** (скрипт напрямую вызывает `api.apiyi.com`). Вот и все — это не привязано к какому-либо конкретному агенту.
</Info>

## Настройка в 3 шага

### ① Создайте папку и вставьте файлы

Создайте папку для skill с этими двумя файлами (полное содержимое в следующих двух разделах):

```
nano-banana-2/
├── SKILL.md
├── scripts/
│   └── nano_banana_2.py
└── .env          # created in step ②, holds your key
```

### ② Поместите ваш ключ в ту же папку

Запишите свой **APIYI API-ключ** (создайте его в консоли `api.apiyi.com`) в `nano-banana-2/.env`:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

Скрипт автоматически читает ключ из этого `.env` — **дополнительная настройка или переменные среды не нужны**.

<Warning>
  `.env` хранит ваш секретный ключ. Если вы делитесь этим skill через репозиторий проекта, **обязательно добавьте `.env` в `.gitignore` и никогда не коммитьте его в git**.
</Warning>

### ③ Передайте его вашему Agent

* **Agent, которые автоматически находят skills** (например, Claude Code): поместите всю папку `nano-banana-2/` в его каталог skills — личный `~/.claude/skills/` или проектный `.claude/skills/` (общий через репозиторий).
* **Другие агенты**: разместите его в соответствии с их собственной схемой skills/plugin; или, проще всего, — **просто скажите Agent: "прочитайте SKILL.md в этой папке и следуйте ему"**.

После установки вы готовы — перейдите к [Как использовать](#how-to-use-it) за примерами.

## SKILL.md

Создайте `nano-banana-2/SKILL.md` с полным содержимым ниже (`description` содержит «что он делает + когда его использовать», и именно это Agent использует для автозапуска):

````markdown theme={null}
---
name: nano-banana-2
description: Generate or edit images via APIYI's Nano Banana 2 (gemini-3.1-flash-image-preview) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana 2 Image Skill

Generate or edit images through the APIYI platform using Nano Banana 2 (`gemini-3.1-flash-image-preview`) — Pro-level quality at Flash-tier speed, great value.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If the script reports "no key found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`.

## Usage

Call the script in the same directory. The first argument is the prompt; for editing, pass one or more local image paths with `-i`:

```bash
# Текст в изображение (по умолчанию 1 изображение)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Шиба-ину в шлеме астронавта, кинематографичное освещение" -o dog.png --size 2K --aspect 16:9

# Сверхширокий баннер (эксклюзивные сверхширокие соотношения сторон 8:1 / 4:1 у Nano Banana 2)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Длинный свиток в стиле китайской туши" -o banner.png --aspect 8:1 --size 2K

# Редактирование изображения (одно изображение)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Замените фон на киберпанковский ночной город" -i input.jpg -o edited.png

# Композиция из нескольких изображений (повторяйте -i)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Скомпонуйте этих двух людей в одно групповое офисное фото" -i a.png -i b.png -o merged.png

# Несколько вариантов одного и того же prompt за один раз (максимум 5, генерируются параллельно)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Иллюстрация пейзажа в стиле китайской туши" -o landscape.png -n 3 --aspect 16:9
```

Arguments:

- 1st positional arg: the prompt (required).
- `-i / --image`: input image path, repeatable; omitted = text-to-image, present = image editing.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many images at once, **default 1**, max 5 (generated concurrently in-script; anything above is auto-clamped to 5). When `-n>1`, a `-1` `-2`… suffix is added automatically.
- `--aspect`: aspect ratio, one of 14 (`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`), defaults to `1:1`.
- `--size`: resolution `512` / `1K` / `2K` / `4K`, defaults to `2K`.

## Number of images (important)

- **Default to a single image**: when the user does not explicitly ask for several, leave `-n` at its default (i.e. omit it) and generate just 1.
- **Only generate multiple when asked**: use `-n` only when the user says "give me 3 / a few / several versions", and **never exceed 5 at once**. If more are needed, call the script multiple times; do not try to bypass the limit.
- Multiple images are concurrent variants of the same prompt (the model is stochastic, so each differs).

## Output location (important)

- When `-o` is a **bare filename** (e.g. `dog.png`), images are all saved into a **`nano-banana-output/` folder at the project root**, so the user can find them in the project easily.
- When `-o` is a **path with a directory** (relative or absolute, e.g. `images/dog.png` or `/abs/path/dog.png`), it is saved at that exact path (relative paths are relative to the current working directory).
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user as-is. If the script reports a content-safety rejection, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name` должно состоять из строчных букв и дефисов и **не должно содержать зарезервированные слова, такие как `claude` / `anthropic`**. В Agents, поддерживающих slash-команды, имя каталога — это команда — `nano-banana-2` становится `/nano-banana-2`. `${CLAUDE_SKILL_DIR}` — это переменная каталога навыка, предоставляемая Claude Code; в других Agents просто используйте фактический путь к скрипту.
</Tip>

## scripts/nano\_banana\_2.py

Создайте `nano-banana-2/scripts/nano_banana_2.py`, используя нативный формат Gemini (идентично проверенному рабочему коду на справочных страницах APIYI по text-to-image / image-edit). **Только стандартная библиотека Python — `pip install` не требуется**:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's Nano Banana 2 (gemini-3.1-flash-image-preview). Stdlib only, zero deps."""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# Max images generated concurrently per call (a boundary to avoid firing too many requests at once)
MAX_COUNT = 5


def load_api_key():
    """Prefer the env var; otherwise look for a .env in the script dir and its parent."""
    key = os.environ.get("APIYI_API_KEY")
    if key:
        return key
    here = os.path.dirname(os.path.abspath(__file__))
    for d in (here, os.path.dirname(here)):
        env_path = os.path.join(d, ".env")
        if os.path.exists(env_path):
            with open(env_path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("APIYI_API_KEY") and "=" in line:
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def project_root():
    """Walk up from the script location to the first dir containing .git or .claude; else cwd."""
    d = os.path.dirname(os.path.abspath(__file__))
    while True:
        if os.path.isdir(os.path.join(d, ".git")) or os.path.isdir(os.path.join(d, ".claude")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return os.getcwd()
        d = parent


def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def mime_of(path):
    return "image/png" if path.lower().endswith(".png") else "image/jpeg"


def generate(api_key, endpoint, prompt, images, aspect, size):
    """Make one request, return image bytes; raise RuntimeError on failure."""
    parts = [{"text": prompt}]
    for path in images:
        parts.append({"inlineData": {"mimeType": mime_of(path), "data": to_b64(path)}})

    payload = json.dumps({
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect, "imageSize": size},
        },
    }).encode()

    req = urllib.request.Request(
        endpoint, data=payload, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=360) as r:
            resp = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Request failed HTTP {e.code}: {e.read().decode(errors='replace')}")

    candidates = resp.get("candidates")
    if not candidates:
        raise RuntimeError(f"No candidate returned (may be blocked by content safety): {resp}")

    cand = candidates[0]
    # Safety rejection: finishReason not STOP, or only text returned
    if cand.get("finishReason") not in (None, "STOP"):
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"Request rejected (finishReason={cand.get('finishReason')}): {text}")

    image_part = next((p for p in cand["content"]["parts"] if p.get("inlineData")), None)
    if not image_part:
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"No image returned, model said: {text}")

    return base64.b64decode(image_part["inlineData"]["data"])


def resolve_paths(out, count):
    """Decide the list of output paths.
    - If out has a directory component (relative/absolute), use it as given (relative => cwd).
    - If out is a bare filename, save under <project_root>/nano-banana-output/ so it's easy to find.
    With count>1, append a -1 / -2 ... suffix.
    """
    if os.path.dirname(out):
        base_path = os.path.abspath(out)
    else:
        out_dir = os.path.join(project_root(), "nano-banana-output")
        os.makedirs(out_dir, exist_ok=True)
        base_path = os.path.join(out_dir, out)

    if count == 1:
        return [base_path]
    base, ext = os.path.splitext(base_path)
    return [f"{base}-{i}{ext}" for i in range(1, count + 1)]


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("No API key found: add a line APIYI_API_KEY=sk-xxx to the .env in the skill folder")

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-3.1-flash-image-preview")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana 2 image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable; presence = edit mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many images at once, default 1, max {MAX_COUNT} (concurrent)")
    parser.add_argument("--aspect", default="1:1", help="Aspect ratio (14 options), e.g. 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="2K", help="Resolution 512 / 1K / 2K / 4K")
    args = parser.parse_args()

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"Note: max {MAX_COUNT} at once; clamped {args.count} to {MAX_COUNT}.", file=sys.stderr)
        count = MAX_COUNT

    paths = resolve_paths(args.out, count)

    def task(path):
        data = generate(api_key, endpoint, args.prompt, args.image, args.aspect, args.size)
        with open(path, "wb") as f:
            f.write(data)
        return os.path.abspath(path)

    failures = 0
    with ThreadPoolExecutor(max_workers=count) as pool:
        for path, result in zip(paths, pool.map(lambda p: _safe(task, p), paths)):
            ok, value = result
            if ok:
                print(f"Image saved to {value}")
            else:
                failures += 1
                print(f"Image {os.path.basename(path)} failed: {value}", file=sys.stderr)

    if failures == count:
        sys.exit("All generations failed.")


def _safe(fn, arg):
    try:
        return True, fn(arg)
    except Exception as e:  # noqa: BLE001 — one failure should not abort the other concurrent tasks
        return False, str(e)


if __name__ == "__main__":
    main()
```

<Tip>
  Имя модели по умолчанию — `gemini-3.1-flash-image-preview`. Позже Google выпустила стабильное имя без `-preview`, `gemini-3.1-flash-image`; у обоих одинаковая цена, и оба работают. Чтобы переключиться, задайте `APIYI_IMAGE_MODEL=gemini-3.1-flash-image`.
</Tip>

## Почему одно предложение генерирует изображение

Многие задаются вопросом: я же не вводил команду, так как же «нарисуй кота» создало изображение?

Вот как это работает: при запуске Агент **сначала читает `description` из `SKILL.md` каждого навыка** (очень короткий фрагмент метаданных, который описывает «что делает этот навык и когда его использовать»). Когда ваш запрос **соответствует** этому сценарию (например, «нарисовать / сгенерировать / отрендерить изображение», «отредактировать это изображение, чтобы...»), Агент **автоматически решает вызвать навык**, читает полный `SKILL.md` и запускает сценарий — и все это без необходимости помнить какую-либо команду.

Итак:

* **Хорошо написанный `description` = более точное автосрабатывание.** Описание этого навыка уже покрывает формулировки вроде «сгенерировать / нарисовать / отредактировать / скомпозить изображение».
* Если вы не хотите, чтобы Агент угадывал, и хотите **полный контроль**, используйте **явный вызов** ниже.

## Как использовать

### Естественный язык (неявный триггер)

После установки просто говорите с Агентом:

| Что вы говорите                                                              | Поведение навыка                             |
| ---------------------------------------------------------------------------- | -------------------------------------------- |
| "Нарисуй постер на рассвете со снежной горой в формате 16:9 с nano banana 2" | Запускает скрипт (без `-i`), 1 png           |
| "Сделай сверхширокий баннер в китайском стиле в формате 8:1"                 | Запускает `--aspect 8:1`, 1 сверхширокий png |
| "Дай мне 3 разных пейзажа в стиле китайской тушевой живописи"                | Запускает `-n 3`, 3 png одновременно         |
| "Размой фон photo.jpg, чтобы подчеркнуть объект"                             | Запускает `-i photo.jpg`, 1 png              |

### Явный вызов (больше контроля)

Когда вы не хотите, чтобы Агент решал сам, есть два явных способа:

* **Агенты, которые поддерживают slash-команды** (например, Claude Code):

  ```text theme={null}
  /nano-banana-2 An orange cat napping in a garden, oil painting style --size 2K --aspect 3:2
  ```

* **Любой Agent / просто скажите ему запустить скрипт** (самый универсальный вариант):

  ```text theme={null}
  Run python3 nano-banana-2/scripts/nano_banana_2.py "An orange cat napping in a garden, oil painting style" --size 2K --aspect 3:2
  ```

<Tip>
  **Как управлять соотношением сторон и резкостью**: используйте `--aspect` для соотношения сторон (14 вариантов, включая сверхвысокие/сверхширокие варианты `1:4 / 4:1 / 1:8 / 8:1`, которых нет у Pro), и `--size` для разрешения (`512` / `1K` / `2K` / `4K`, где `512` — эксклюзивный низкоразрешающий тариф Nano Banana 2, который позволяет экономить деньги). Просто скажите «портрет 9:16», «отрендерить в 4K» или «сделать сверхширокий баннер», и Агент автоматически добавит эти флаги.
</Tip>

## Куда сохраняется сгенерированное изображение

* Когда `-o` — это **простое имя файла** (например, `-o dog.png`), все изображения сохраняются в **папку `nano-banana-output/` в корне проекта** (создаётся автоматически), так что вы найдёте их прямо там, в вашем проекте.
* «Корень проекта» = первый каталог, в котором при обходе вверх от расположения самого скрипта найден `.git` или `.claude` — так что **независимо от того, из какого каталога запускается Агент, изображения попадают внутрь проекта**, а не во временный каталог, который вы не сможете найти.
* Скрипт **выводит один полный абсолютный путь для каждого изображения**, например `Image saved to /Users/you/project/nano-banana-output/dog.png`.
* По умолчанию он генерирует **только 1 изображение**; `-n 3` сразу 3 (максимум 5, все, что больше, ограничивается 5), с автоматически добавляемым суффиксом `-1`, `-2`, `-3`.
* Когда `-o` — это **путь с каталогом** (например, `-o images/dog.png` или абсолютный путь), он сохраняется точно по этому пути (относительные пути считаются относительно текущего рабочего каталога) и не попадает в `nano-banana-output/`.
* Редактирование изображений работает так же: результат сохраняется в новый файл и **не перезаписывает ваш исходный файл**.

<Info>
  Nano Banana 2 имеет строгие средства контроля безопасности контента. Если скрипт сообщает о `finishReason`, отличающемся от `STOP`, или возвращает текст отказа, скорректируйте содержимое соответствующим образом и не пытайтесь многократно повторять тот же нарушающий запрос.
</Info>

## Связанные документы

* [Обзор генерации изображений Nano Banana 2](/ru/api-capabilities/nano-banana-2-image/overview)
* [Справочник API для преобразования текста в изображение](/ru/api-capabilities/nano-banana-2-image/text-to-image)
* [Справочник API для редактирования изображений](/ru/api-capabilities/nano-banana-2-image/image-edit)
* [Навык агента Nano Banana Pro](/ru/api-capabilities/nano-banana-image/skills)
* [Тарификация Nano Banana](/ru/api-capabilities/nano-banana-pricing)
