> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык Agent Skill для Nano Banana Lite

> Упакуйте Nano Banana 2 Lite (gemini-3.1-flash-lite-image) в готовый к использованию Agent Skill — добавьте его в Codex, OpenClaw, hermes-agent, Claude Code или любой coding agent и вызывайте платформу APIYI для генерации изображений и редактирования изображений одной фразой.

<Note>
  Эта страница предлагает **готовый к использованию Agent Skill**: просто добавьте его в используемый вами агент для программирования, и вы сможете вызывать APIYI's **Nano Banana 2 Lite** (`gemini-3.1-flash-lite-image`) на естественном языке (или с явными командами), чтобы генерировать и редактировать изображения. Всё это — всего два файла: скопируйте и сразу начинайте.
</Note>

<Tip>
  Если вам нужно более высокое качество или 2K/4K, см. [Nano Banana 2 Agent Skill](/ru/api-capabilities/nano-banana-2-image/skills) (до 4K) или [Nano Banana Pro Agent Skill](/ru/api-capabilities/nano-banana-image/skills) (максимальное качество). Эта страница — **Lite** (самый быстрый и дешевый, ориентирован на 1K, \$0.025/image за каждый вызов).
</Tip>

## Что делает этот навык

Единый объединенный навык — скрипт автоматически определяет, **передаются ли изображения**, чтобы выбрать между «текст в изображение» и «редактирование изображения»:

<CardGroup cols={3}>
  <Card title="Текст в изображение" icon="wand-sparkles">
    Только prompt → создается совершенно новое изображение с поддержкой **14 соотношений сторон**, холстом 1K, \~4s на изображение.
  </Card>

  <Card title="Редактирование изображения" icon="image">
    Передайте одно изображение + инструкцию → локальные правки, перенос стиля, замена фона и т. д.
  </Card>

  <Card title="Композиция нескольких изображений" icon="layers">
    Передайте несколько изображений + одну инструкцию → компоновка, сравнение, замена одежды и многое другое.
  </Card>
</CardGroup>

Nano Banana 2 Lite создан для **скорости и экономии**: \~4s на изображение, примерно в 2.7x быстрее, чем Nano Banana 2, среднее на основе token — около \$0.018 за вызов на практике (40% от тарифа Google) и \$0.025 за изображение за вызов — идеально подходит для высокой параллельности, быстрой итерации и больших объемов.

## Какие агенты могут это использовать

<Info>
  По сути, Skill — это просто **папка**: описание, написанное для агента (`SKILL.md`), + скрипт, который выполняет работу. Поэтому **любой кодирующий агент, который может читать локальные файлы и запускать командную строку, может использовать его** — например, **Codex, OpenClaw, hermes-agent, Claude Code** и другие.

  Единственное требование: на машине, где запущен агент (ваш компьютер или сервер), должен быть установлен **Python 3** и быть **доступ в интернет** (скрипт подключается напрямую к `api.apiyi.com`). И все — никакой конкретный агент не требуется.
</Info>

## Установите в три шага

### ① Создайте папку, вставьте файлы

Создайте папку skill и добавьте два файла ниже (полное содержимое — в следующих двух разделах):

```
nano-banana-lite/
├── SKILL.md
├── scripts/
│   └── nano_banana_lite.py
└── .env          # created in step ②, holds your Key
```

### ② Добавьте свой ключ в ту же папку

В `nano-banana-lite/.env` добавьте свой **APIYI API-ключ** (созданный в консоли `api.apiyi.com`):

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

Скрипт автоматически читает ключ из этого `.env` — **никакой дополнительной настройки или переменных окружения не требуется**.

<Warning>
  `.env` хранит ваш секретный ключ. Если этот skill будет общим для репозитория проекта, **обязательно добавьте `.env` в `.gitignore` и никогда не коммитьте его в git**.
</Warning>

### ③ Передайте это агенту

* **Агенты с автоматическим обнаружением skill** (например, Claude Code): поместите всю папку `nano-banana-lite/` в его каталог skills — пользовательский `~/.claude/skills/` или проектный `.claude/skills/` (общий для репозитория).
* **Другие агенты**: разместите его в соответствии с их собственными правилами для skill/plugin; или, проще всего, — **просто скажите агенту «прочитай SKILL.md в этой папке и следуй ему»**.

После установки перейдите к [Как использовать](#how-to-use), чтобы посмотреть примеры.

## SKILL.md

Создайте `nano-banana-lite/SKILL.md` с полным содержимым ниже (`description` указывает «что он делает + когда использовать», что агент использует для автозапуска):

````markdown theme={null}
---
name: nano-banana-lite
description: Generate or edit images via APIYI's Nano Banana 2 Lite (gemini-3.1-flash-lite-image) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana Lite Image Skill

Call Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) via APIYI to generate or edit images. ~4s per image, focused on the 1K canvas, great value for volume.

## Key configuration

The script automatically reads `APIYI_API_KEY` from the `.env` file in the skill folder (an environment variable of the same name also works).
If the script reports "Key not found", tell the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`.

## Usage

Call the script in the same folder. The first argument is the prompt; for editing, pass one or more local image paths with `-i`:

```bash
# Генерация изображений по тексту (1 изображение по умолчанию)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Сиба-ину в шлеме астронавта, кинематографичное освещение" -o dog.png --aspect 16:9

# Сверхширокий баннер (8:1 / 4:1 и т. д.)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Пейзажный баннер-свиток в китайском стиле" -o banner.png --aspect 8:1

# Редактирование изображения (передайте 1 изображение)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Замените фон на киберпанк-город ночью" -i input.jpg -o edited.png

# Композитинг из нескольких изображений (передайте несколько, повторяйте -i)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Поместите этих двух людей в одно офисное групповое фото" -i a.png -i b.png -o merged.png

# Генерация нескольких вариантов одновременно (до 5, параллельно)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Иллюстрация пейзажа в китайском стиле" -o shanshui.png -n 3 --aspect 16:9
```

Parameters:

- 1st positional argument: the prompt (required).
- `-i / --image`: input image path, repeatable; omit = text-to-image, pass = image editing.
- `-o / --out`: output filename, default `output.png`.
- `-n / --count`: how many to generate, **default 1**, max 5 (concurrent; anything above is auto-capped to 5). When `-n>1`, filenames get `-1` `-2`… suffixes.
- `--aspect`: aspect ratio, 1 of 14 (`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`), default `1:1`.
- `--size`: resolution `1K` only (Lite is focused on the 1K canvas), default `1K`.

## Number of images (important)

- **Only 1 by default**: when the user doesn't explicitly ask for multiple, keep `-n` at its default (i.e. don't pass it) and generate just 1.
- **Only generate multiple when asked**: use `-n` only when the user says "give me 3 / a few / several versions", and **no more than 5 at once**. For more, call multiple times — don't try to bypass the cap.
- Multiples are concurrent variants of the same prompt (the model is stochastic, so results differ).

## Output location (important)

- When `-o` is a **plain filename** (e.g. `dog.png`), images are saved to the **`nano-banana-output/` folder at the project root**, so the user can find them easily inside the project.
- When `-o` is a **path with a directory** (relative or absolute, e.g. `images/dog.png` or `/abs/path/dog.png`), it saves to that path (relative paths are relative to the current working directory).
- Never write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## When done

The script prints one full path per image; report them faithfully to the user. If the script reports a content-safety rejection, relay the reason as-is and don't retry the same prompt.
````

<Tip>
  `name` должны быть строчными буквами и дефисами и **не должны содержать зарезервированные слова вроде `claude` / `anthropic`**. В агентах с slash-командами имя папки — это имя команды — `nano-banana-lite` означает `/nano-banana-lite`. `${CLAUDE_SKILL_DIR}` — это переменная каталога skill, которую предоставляет Claude Code; другие агенты просто используют фактический путь к скрипту.
</Tip>

## scripts/nano\_banana\_lite.py

Создайте `nano-banana-lite/scripts/nano_banana_lite.py` в нативном формате Gemini (идентично коду text-to-image / image-editing на этом сайте, проверено и работает). **Только стандартная библиотека Python — никаких `pip install` не требуется**:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's Nano Banana 2 Lite (gemini-3.1-flash-lite-image). Pure stdlib, zero deps."""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# Max images generated concurrently per call (a bound to avoid firing too many requests at once)
MAX_COUNT = 5


def load_api_key():
    """Prefer the env var; otherwise look for .env in the script folder and its parent."""
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
    """Walk up from the script to the first dir containing .git or .claude as the project root; fall back to cwd."""
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
    """Send one request, return image bytes; raise RuntimeError on failure."""
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
        raise RuntimeError(f"No candidates returned (possibly rejected by content safety): {resp}")

    cand = candidates[0]
    # Content moderation block: finishReason not STOP, or only a text explanation returned
    if cand.get("finishReason") not in (None, "STOP"):
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"Request rejected (finishReason={cand.get('finishReason')}): {text}")

    image_part = next((p for p in cand["content"]["parts"] if p.get("inlineData")), None)
    if not image_part:
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"No image returned, model replied: {text}")

    return base64.b64decode(image_part["inlineData"]["data"])


def resolve_paths(out, count):
    """Decide the list of output paths.
    - If out has a directory component (relative/absolute), use it as given (relative -> relative to cwd).
    - If out is a plain filename, save to <project root>/nano-banana-output/ so it's easy to find.
    When count>1, add -1 / -2 … suffixes to the filename.
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
        sys.exit("API Key not found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder")

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-3.1-flash-lite-image")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana Lite image generation")
    parser.add_argument("prompt", help="prompt / edit instruction")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="input image path (repeatable; passing one triggers edit mode)")
    parser.add_argument("-o", "--out", default="output.png", help="output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"how many to generate, default 1, max {MAX_COUNT} (concurrent)")
    parser.add_argument("--aspect", default="1:1", help="aspect ratio, 1 of 14, e.g. 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="1K", help="resolution 1K only (Lite is focused on the 1K canvas)")
    args = parser.parse_args()

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"Note: max {MAX_COUNT} per call; capped {args.count} to {MAX_COUNT}.", file=sys.stderr)
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
    except Exception as e:  # noqa: BLE001 — one failure shouldn't affect other concurrent tasks
        return False, str(e)


if __name__ == "__main__":
    main()
```

<Tip>
  Имя модели по умолчанию — `gemini-3.1-flash-lite-image`. Lite ориентирован на холст 1K — оставляйте `--size` равным `1K`; для 2K/4K или более высокого качества используйте возможности Nano Banana 2 / Pro (вы также можете переключить модель через переменную среды `APIYI_IMAGE_MODEL`).
</Tip>

## Почему одно предложение генерирует изображение

Многих это удивляет: я не вводил команду, так почему фраза «нарисуй кота» создает изображение?

Вот как это работает: когда агент запускается, он **сначала читает `description` в `SKILL.md` каждого навыка** (короткий фрагмент метаданных, который сообщает «что делает этот навык и когда его использовать»). Когда ваш запрос **соответствует** этому сценарию описания (например, «нарисуй/сгенерируй/отрендери изображение», «измените это изображение на…»), агент **автоматически решает вызвать этот навык**, читает полный `SKILL.md` и запускает скрипт — и все это без необходимости запоминать какие-либо команды.

Итак:

* **Хорошо написанный `description` = более точное автоматическое срабатывание**. Описание этого навыка уже охватывает формулировки вроде «сгенерируй/нарисуй/отредактируй/собери изображение».
* Когда вы не хотите, чтобы агент гадал, и хотите **100% контроля**, используйте **явный вызов** ниже.

## Как использовать

### Естественный язык (неявный триггер)

После установки просто обращайтесь к агенту:

| Вы говорите                                                        | Поведение навыка                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| "Use nano banana lite to make a 16:9 snow-mountain sunrise poster" | Вызывает скрипт (без `-i`), выводит 1 png                  |
| "Make an 8:1 ultra-wide Chinese-style banner"                      | Вызывает скрипт `--aspect 8:1`, выводит 1 сверхширокий png |
| "Give me 3 different Chinese-style landscapes"                     | Вызывает скрипт `-n 3`, выводит 3 png одновременно         |
| "Blur the background of photo.jpg to highlight the person"         | Вызывает скрипт `-i photo.jpg`, выводит 1 png              |

### Явный вызов (больше контроля)

Если вы не хотите, чтобы агент решал за вас, есть два явных варианта:

* **Агенты с slash-командами** (например, Claude Code):

  ```text theme={null}
  /nano-banana-lite An orange cat napping in a garden, oil-painting style --aspect 3:2
  ```

* **Любой агент / просто скажите ему запустить скрипт** (наиболее универсально):

  ```text theme={null}
  Run python3 nano-banana-lite/scripts/nano_banana_lite.py "An orange cat napping in a garden, oil-painting style" --aspect 3:2
  ```

<Tip>
  **Управление соотношением сторон**: используйте `--aspect`, чтобы выбрать соотношение сторон (1 из 14, включая сверхвысокий/сверхширокий `1:4 / 4:1 / 1:8 / 8:1`). Lite ориентирован на холст 1K, поэтому указывать разрешение не нужно. Просто скажите «портрет 9:16» или «сделайте сверхширокий баннер», и агент автоматически добавит параметр aspect.
</Tip>

## Где находятся сгенерированные изображения

* Когда `-o` — это только **имя файла** (например, `-o dog.png`), изображения сохраняются в папку **`nano-banana-output/` в корне проекта** (создаётся автоматически), так что вы найдёте их прямо там, в проекте.
* «Корень проекта» = первый каталог, содержащий `.git` или `.claude`, найденный при подъёме вверх от скрипта — **независимо от того, в каком каталоге запускается агент, изображения сохраняются внутри проекта**, а не во временном каталоге, где их можно было бы потерять.
* Скрипт **выводит полный абсолютный путь для каждого изображения**, например `Image saved to /Users/you/project/nano-banana-output/dog.png`.
* По умолчанию создаётся **только 1 изображение**; `-n 3` выводит 3 сразу (максимум 5, автоматически ограничивается выше этого значения), с суффиксами `-1`, `-2`, `-3`, добавляемыми к имени файла.
* Когда вы передаёте **путь с каталогом** (например, `-o images/dog.png` или абсолютный путь), он сохраняется по указанному вами пути (относительные пути считаются относительно текущего рабочего каталога), а не в `nano-banana-output/`.
* Редактирование изображений работает так же: результат — новый файл, и он **никогда не перезаписывает исходный**.

<Info>
  Nano Banana 2 Lite имеет строгие средства контроля безопасности контента. Если скрипт сообщает `finishReason`, отличное от `STOP`, или возвращает текст отклонения, скорректируйте контент в соответствии с сообщением — не пытайтесь повторно запускать тот же самый нарушающий prompt.
</Info>

## Связанная документация

* [Обзор генерации изображений Nano Banana Lite](/ru/api-capabilities/nano-banana-lite-image/overview)
* [Справочник API для преобразования текста в изображение](/ru/api-capabilities/nano-banana-lite-image/text-to-image)
* [Справочник API для редактирования изображений](/ru/api-capabilities/nano-banana-lite-image/image-edit)
* [Навык агента Nano Banana 2](/ru/api-capabilities/nano-banana-2-image/skills)
* [Тарифы Nano Banana](/ru/api-capabilities/nano-banana-pricing)
