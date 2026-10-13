> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Agent Skill для Nano Banana 2.1

> Упакуйте Nano Banana 2.1 (gemini-nano-banana-2.1) в готовый к использованию Agent Skill. Подключите его к Codex, OpenClaw, hermes-agent, Claude Code или любому coding Agent и вызывайте APIYI для генерации изображений по тексту и редактирования изображений с помощью одного prompt.

<Note>
  На этой странице представлен **готовый к использованию Agent Skill**: добавьте его в используемый вами coding Agent и используйте естественный язык (или прямую команду) для вызова **Nano Banana 2.1** (`gemini-nano-banana-2.1`) на платформе APIYI для генерации изображений и их редактирования. Всё решение состоит всего из двух файлов — скопируйте и пользуйтесь.
</Note>

<Tip>
  Если вместо этого вам нужен навык **Pro** (`gemini-3-pro-image`, высочайшее качество), см. [Nano Banana Pro Agent Skill](/ru/api-capabilities/nano-banana-image/skills). На этой странице рассматривается **Nano Banana 2.1** (обновление для Nano Banana 2 с улучшенным качеством и рендерингом текста). Всё ещё используете предыдущую версию? См. [Nano Banana 2 Agent Skill](/ru/api-capabilities/nano-banana-2-image/skills).
</Tip>

## Что делает навык

Единый комбинированный навык. Скрипт автоматически определяет, **передаете ли вы входные изображения**, чтобы выбрать между генерацией по тексту и редактированием изображений:

<CardGroup cols={3}>
  <Card title="Текст в изображение" icon="wand-sparkles">
    Только prompt → совершенно новое изображение с **14 соотношениями сторон** и разрешением 1K/2K/4K.
  </Card>

  <Card title="Редактирование изображений" icon="image">
    Одно изображение + инструкция → точечные правки, стилизация, замена фона и многое другое.
  </Card>

  <Card title="Композитинг нескольких изображений" icon="layers">
    Несколько изображений + одна инструкция → композитинг, сравнение, смена одежды и т. д.
  </Card>
</CardGroup>

По сравнению с Pro, модель Nano Banana 2.1 добавляет четыре **сверхвысоких/сверхшироких** соотношения сторон (`1:4 / 4:1 / 1:8 / 8:1`) всего за \$0.045 за изображение за вызов (одинаковая цена для 1K / 2K / 4K), что лучше подходит для больших объемов. Обратите внимание, что она **не поддерживает 512px**; используйте Nano Banana 2, если вам требуется уровень миниатюр.

## Какие агенты могут его использовать

<Info>
  Skill по сути представляет собой просто **папку**: набор инструкций для чтения агентом (`SKILL.md`) + скрипт, выполняющий работу. Поэтому **его может использовать любой агент для написания кода, способный читать локальные файлы и выполнять shell-команды** — например, **Codex, OpenClaw, hermes-agent, Claude Code** и другие.

  Единственное требование: на машине, где запущен агент (ваш компьютер или сервер), должен быть установлен **Python 3** и иметься **доступ к сети** (скрипт обращается напрямую к `api.apiyi.com`). Вот и всё — он не привязан к какому-либо конкретному агенту.
</Info>

## Настройка за 3 шага

### ① Создайте папку и вставьте файлы

Создайте папку навыка со следующими двумя файлами (полное содержимое приведено в следующих двух разделах):

```
nano-banana-2-1/
├── SKILL.md
├── scripts/
│   └── nano_banana_2_1.py
└── .env          # created in step ②, holds your key
```

### ② Поместите ваш ключ в ту же папку

Запишите ваш **APIYI API Key** (создайте его в консоли `api.apiyi.com`) в `nano-banana-2-1/.env`:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

Скрипт автоматически считывает ключ из этого `.env` — **никакой дополнительной настройки или переменных окружения не требуется**.

<Warning>
  `.env` содержит ваш секретный ключ. Если вы делитесь этим навыком через репозиторий проекта, **обязательно добавьте `.env` в `.gitignore` и ни в коем случае не коммитьте его в git**.
</Warning>

### ③ Передайте его вашему агенту

* **Агенты с автообнаружением навыков** (например, Claude Code): поместите всю папку `nano-banana-2-1/` в директорию навыков — личную `~/.claude/skills/` или на уровне проекта `.claude/skills/` (доступную через репозиторий).
* **Другие агенты**: разместите папку в соответствии с правилами для навыков/плагинов конкретного агента; или проще всего — **просто скажите агенту «прочитай SKILL.md в этой папке и следуй инструкциям»**.

После установки всё готово — перейдите к разделу [Как использовать](#how-to-use-it), чтобы посмотреть примеры.

## SKILL.md

Создайте `nano-banana-2-1/SKILL.md` со следующим полным содержимым (в `description` указывается «что он делает + когда его использовать», на основе чего агент выполняет автоматический запуск):

````markdown theme={null}
---
name: nano-banana-2-1
description: Generate or edit images via APIYI's Nano Banana 2.1 (gemini-nano-banana-2.1) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana 2.1 Image Skill

Generate or edit images through the APIYI platform using Nano Banana 2.1 (`gemini-nano-banana-2.1`) — an upgrade to Nano Banana 2 with better quality, text rendering and multi-turn consistency; the 512 resolution is not supported.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If the script reports "no key found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`.

## Usage

Call the script in the same directory. The first argument is the prompt; for editing, pass one or more local image paths with `-i`:

```bash
# Генерация изображения по тексту (по умолчанию 1 изображение)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "A shiba inu wearing an astronaut helmet, cinematic lighting" -o dog.png --size 2K --aspect 16:9

# Сверхширокий баннер (эксклюзивные для Nano Banana 2.1 сверхширокие соотношения сторон 8:1 / 4:1)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Chinese ink long-scroll banner" -o banner.png --aspect 8:1 --size 2K

# Редактирование изображения (одно изображение)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Replace the background with a cyberpunk night city" -i input.jpg -o edited.png

# Композитинг нескольких изображений (повторите -i)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Composite these two people into one office group photo" -i a.png -i b.png -o merged.png

# Несколько вариантов одного prompt одновременно (максимум 5, генерируются параллельно)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Chinese ink landscape illustration" -o landscape.png -n 3 --aspect 16:9
```

Arguments:

- 1st positional arg: the prompt (required).
- `-i / --image`: input image path, repeatable; omitted = text-to-image, present = image editing.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many images at once, **default 1**, max 5 (generated concurrently in-script; anything above is auto-clamped to 5). When `-n>1`, a `-1` `-2`… suffix is added automatically.
- `--aspect`: aspect ratio, one of 14 (`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`), defaults to `1:1`.
- `--size`: resolution `1K` / `2K` / `4K`, defaults to `2K`.

## Number of images (important)

- **Default to a single image**: when the user does not explicitly ask for several, leave `-n` at its default (i.e. omit it) and generate just 1.
- **Only generate multiple when asked**: use `-n` only when the user says "give me 3 / a few / several versions", and **never exceed 5 at once**. If more are needed, call the script multiple times; do not try to bypass the limit.
- Multiple images are concurrent variants of the same prompt (the model is stochastic, so each differs).

## Output location (important)

- When `-o` is a **bare filename** (e.g. `dog.png`), images are all saved into a **`nano-banana-2-1-output/` folder at the project root**, so the user can find them in the project easily.
- When `-o` is a **path with a directory** (relative or absolute, e.g. `images/dog.png` or `/abs/path/dog.png`), it is saved at that exact path (relative paths are relative to the current working directory).
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user as-is. If the script reports a content-safety rejection, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name` должно состоять из строчных букв и дефисов и **не должно содержать зарезервированные слова, такие как `claude` / `anthropic`**. В агентах, поддерживающих слэш-команды, имя каталога является командой — `nano-banana-2-1` становится `/nano-banana-2`. `${CLAUDE_SKILL_DIR}` — это переменная каталога навыка, предоставляемая Claude Code; в других агентах просто укажите фактический путь к скрипту.
</Tip>

## scripts/nano\_banana\_2\_1.py

Создайте `nano-banana-2-1/scripts/nano_banana_2_1.py` с использованием нативного формата Gemini (идентично проверенному рабочему коду на справочных страницах APIYI по text-to-image / image-edit). **Чистая стандартная библиотека Python — `pip install` не требуется**:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's Nano Banana 2.1 (gemini-nano-banana-2.1). Stdlib only, zero deps."""
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
    - If out is a bare filename, save under <project_root>/nano-banana-2-1-output/ so it's easy to find.
    With count>1, append a -1 / -2 ... suffix.
    """
    if os.path.dirname(out):
        base_path = os.path.abspath(out)
    else:
        out_dir = os.path.join(project_root(), "nano-banana-2-1-output")
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

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-nano-banana-2.1")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana 2.1 image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable; presence = edit mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many images at once, default 1, max {MAX_COUNT} (concurrent)")
    parser.add_argument("--aspect", default="1:1", help="Aspect ratio (14 options), e.g. 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="2K", help="Resolution 1K / 2K / 4K")
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
  Имя модели по умолчанию — `gemini-nano-banana-2.1`. Чтобы временно вернуться к предыдущей версии, укажите `APIYI_IMAGE_MODEL=gemini-3.1-flash-image` (предыдущая версия также поддерживает `--size 512`).
</Tip>

## Почему одна фраза генерирует изображение

Часто возникает вопрос: я не вводил никаких команд, так как же фраза «нарисуй кота» создала изображение?

Вот как это устроено: при запуске Агент **сначала считывает `description` из `SKILL.md` каждого навыка** (очень короткий фрагмент метаданных, описывающий, «что делает этот навык и когда его использовать»). Когда ваш запрос **соответствует** этому сценарию (например, «нарисуй / сгенерируй / отрендери изображение», «отредактируй это изображение так, чтобы...»), Агент **автоматически принимает решение вызвать этот навык**, считывает полный `SKILL.md` и запускает скрипт — и всё это без необходимости запоминать какие-либо команды.

Таким образом:

* **Хорошо составленный `description` = более точное автоматическое срабатывание.** Описание этого навыка уже охватывает такие формулировки, как «сгенерировать / нарисовать / отредактировать / скомпоновать изображение».
* Если вы не хотите, чтобы Агент угадывал, и вам нужен **полный контроль**, используйте **явный вызов**, описанный ниже.

## Как использовать

### Естественный язык (неявный вызов)

После установки просто обратитесь к агенту:

| Что вы говорите | Поведение навыка |
| - | - |
| «Нарисуй постер 16:9 с рассветом в заснеженных горах с nano banana 2» | Запускает скрипт (без `-i`), 1 png |
| «Сделай ультраширокий баннер 8:1 в китайском стиле» | Запускает `--aspect 8:1`, 1 ультраширокий png |
| «Создай 3 различных пейзажа тушью в китайском стиле» | Запускает `-n 3`, 3 png параллельно |
| «Размой фон у photo.jpg, чтобы выделить объект» | Запускает `-i photo.jpg`, 1 png |

### Явный вызов (больше контроля)

Если вы не хотите, чтобы агент принимал решение самостоятельно, есть два явных способа:

* **Агенты с поддержкой слэш-команд** (например, Claude Code):

  ```text theme={null}
  /nano-banana-2-1 An orange cat napping in a garden, oil painting style --size 2K --aspect 3:2
  ```

* **Любой агент / просто укажите ему запустить скрипт** (наиболее универсальный вариант):

  ```text theme={null}
  Run python3 nano-banana-2-1/scripts/nano_banana_2_1.py "An orange cat napping in a garden, oil painting style" --size 2K --aspect 3:2
  ```

<Tip>
  **Как управлять соотношением сторон и чёткостью**: используйте `--aspect` для соотношения сторон (14 вариантов, включая ультравысокие и ультраширокие `1:4 / 4:1 / 1:8 / 8:1`, которых нет в Pro) и `--size` для разрешения (`1K` / `2K` / `4K`; `512` не поддерживается). Просто скажите «портрет 9:16», «отрендери в 4K» или «сделай ультраширокий баннер», и агент автоматически добавит эти флаги.
</Tip>

## Куда сохраняется сгенерированное изображение

* Если `-o` представляет собой **просто имя файла** (например, `-o dog.png`), все изображения сохраняются в **папку `nano-banana-2-1-output/` в корне проекта** (создается автоматически), поэтому вы найдете их прямо в своем проекте.
* «Корень проекта» — это первый найденный при подъеме вверх от расположения скрипта каталог, содержащий `.git` или `.claude`, поэтому **независимо от того, из какой директории запускается Agent, изображения попадают внутрь проекта**, а не во временную директорию, которую невозможно найти.
* Скрипт **выводит по одному полному абсолютному пути на каждое изображение**, например `Image saved to /Users/you/project/nano-banana-2-1-output/dog.png`.
* По умолчанию генерируется **только 1 изображение**; `-n 3` создает 3 одновременно (максимум 5, любое большее значение ограничивается до 5), при этом суффиксы `-1`, `-2`, `-3` добавляются автоматически.
* Если `-o` является **путем с указанием директории** (например, `-o images/dog.png` или абсолютным путем), файл сохраняется точно по этому пути (относительные пути рассчитываются относительно текущего рабочего каталога) и не помещается в `nano-banana-2-1-output/`.
* Редактирование изображений работает точно так же: результат записывается в новый файл и **не перезаписывает исходный**.

<Info>
  В Nano Banana 2.1 действуют строгие правила безопасности контента. Если скрипт сообщает о `finishReason`, отличном от `STOP`, или возвращает текст с отклонением запроса, скорректируйте контент соответствующим образом и не повторяйте многократно попытки с тем же нарушающим правила prompt.
</Info>

## Связанная документация

* [Обзор генерации изображений Nano Banana 2.1](/ru/api-capabilities/gemini-nano-banana-2.1/overview)
* [Справочник API Text-to-Image](/ru/api-capabilities/gemini-nano-banana-2.1/text-to-image)
* [Справочник API редактирования изображений](/ru/api-capabilities/gemini-nano-banana-2.1/image-edit)
* [Навык агента Nano Banana Pro](/ru/api-capabilities/nano-banana-image/skills)
* [Тарифы Nano Banana](/ru/api-capabilities/nano-banana-pricing)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.