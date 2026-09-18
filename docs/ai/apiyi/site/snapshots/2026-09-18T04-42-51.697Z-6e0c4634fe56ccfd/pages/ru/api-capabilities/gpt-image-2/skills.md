> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5 / 2 Серия навыка агента

> Объедините gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 (официальный) и gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip (обратный) в один готовый к использованию навык агента. Добавьте его в Codex, OpenClaw, hermes-agent, Claude Code или любой агент для программирования и переключайте каналы с помощью --model для преобразования текста в изображение, объединения нескольких изображений и дорисовки.

<Note>
  На этой странице представлен **готовый к использованию навык агента**: один скрипт поддерживает шесть моделей — **gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 (официальные)** и **gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip** (обратный прокси). Все они используют один и тот же OpenAI Images API; отличается только `--model`. Добавьте скрипт в уже используемый вами агент для программирования и генерируйте изображения с помощью одного промпта — всего два файла.
</Note>

## Что делает навык

Один объединенный навык. Скрипт автоматически определяет **передаете ли вы входные изображения**, чтобы выбрать между генерацией изображений по тексту и редактированием изображений:

<CardGroup cols={3}>
  <Card title="Текст в изображение" icon="wand-sparkles">
    Только prompt → совершенно новое изображение с качественным рендерингом текста и фотореалистичным качеством.
  </Card>

  <Card title="Слияние нескольких изображений" icon="layers">
    Несколько изображений (до 16) + одна инструкция → поместить человека с изображения 1 в сцену с изображения 2, сохранить стиль изображения 3 и т. д.
  </Card>

  <Card title="Инпейтинг" icon="image">
    Одно изображение + `--mask` + инструкция → изменить только замаскированную область (**только официальный gpt-image-2 поддерживает это**).
  </Card>
</CardGroup>

## Какую модель выбрать

Все шесть моделей **вызываются одинаково**; они различаются только исходным каналом, ценой/скоростью и тем, какие параметры учитываются. Три официальные модели (2.5-flare / 2.5-sunburst / 2) используют общие цену и параметры, как и три реверс-модели. Скрипт автоматически обрабатывает эти различия с помощью `--model`:

| Модель (`--model`)                                       | Канал                       | Цена                                 | Скорость                                                | `size`                       | `quality` / `mask`                                                                                             | Лучше всего подходит для                                                                                        |
| -------------------------------------------------------- | --------------------------- | ------------------------------------ | ------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `gpt-image-2.5-flare` (по умолчанию)                     | Официальный passthrough     | на основе tokens \~\$0.03–0.2/изобр. | **самая быстрая официальная** (измерено: 1K low \~10 с) | ✅ любой пресет               | ✅ да, включая `xhigh` / `max`                                                                                  | повседневной генерации текста в изображение, уровней качества, прозрачного фона                                 |
| `gpt-image-2.5-sunburst`                                 | Официальный passthrough     | на основе tokens, как у flare        | медленнее flare                                         | ✅ любой пресет               | ✅ да, включая `xhigh` / `max`                                                                                  | редактирования / объединения нескольких изображений / inpainting по маске, максимальной точности редактирования |
| `gpt-image-2`                                            | Официальный passthrough     | на основе tokens, как у flare        | \~100–120 с                                             | ✅ любой пресет               | ✅ да (до `high`)                                                                                               | предыдущего поколения, существующих интеграций                                                                  |
| `gpt-image-2.5-all`                                      | Реверс (веб ChatGPT 2.5)    | фиксированно \$0.03/изобр.           | \~30–90 с                                               | ❌ указывайте в prompt        | ❌                                                                                                              | больших объёмов, скорости, качества 2.5, задания размера через текст prompt                                     |
| `gpt-image-2-all`                                        | Реверс (линейка ChatGPT)    | фиксированно \$0.03/изобр.           | **самая быстрая \~30–60 с**                             | ❌ указывайте в prompt        | ❌                                                                                                              | больших объёмов, скорости, задания размера через текст prompt                                                   |
| `gpt-image-2-vip`                                        | Реверс (линейка Adobe)      | фиксированно \$0.03/изобр.           | \~90–150 с                                              | ✅ 30 уровней, включая **4K** | ❌                                                                                                              | фиксированного размера результата / 4K по низкой цене                                                           |
| `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` | Реверс (линейка Adobe, 2.5) | фиксированно \$0.03/изобр.           | \~20–140 с                                              | ✅ 30 уровней, включая **4K** | все шесть уровней `quality` (включая `xhigh` / `max`), прозрачный фон ✅; `mask` только для всего изображения ❌ | качества 2.5 по фиксированной цене, фиксируемого размера                                                        |

<Tip>
  Быстрое правило: **повседневная генерация текста в изображение** → `gpt-image-2.5-flare`; **редактирование / inpainting по маске** → `gpt-image-2.5-sunburst`; **быстро и дёшево** → `gpt-image-2.5-all` / `gpt-image-2-all`; **фиксированный размер/4K и дёшево** → `gpt-image-2-vip`.
</Tip>

## Какие Agent'ы могут использовать это

<Info>
  По сути, Skill — это просто **папка**: набор инструкций, которые Agent должен прочитать (`SKILL.md`), + скрипт, который выполняет работу. Поэтому **любой кодирующий Agent, который может читать локальные файлы и выполнять команды shell, может использовать его** — например **Codex, OpenClaw, hermes-agent, Claude Code** и другие.

  Единственное требование: на машине, где запущен Agent (ваш компьютер или сервер), должны быть установлены **Python 3** и **сетевой доступ** (скрипт напрямую вызывает `api.apiyi.com`). Вот и все — это не привязано к какому-либо конкретному Agent.
</Info>

## Настройка в 3 шага

### ① Создайте папку, вставьте файлы, установите зависимость

Создайте папку для skill с этими двумя файлами (полное содержимое — в следующих двух разделах). Этот skill вызывает через OpenAI SDK, поэтому сначала установите одну зависимость:

```bash theme={null}
pip install openai
```

```
gpt-image-2/
├── SKILL.md
├── scripts/
│   └── gpt_image.py
└── .env          # created in step ②, holds your key
```

### ② Поместите ваш ключ в ту же папку

Запишите ваш **API-ключ APIYI** (создайте его в консоли `api.apiyi.com`) в `gpt-image-2/.env`:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

Скрипт автоматически читает ключ из этого `.env` — **не требуется дополнительная настройка или переменные окружения**.

<Warning>
  `.env` содержит ваш секретный ключ. Если вы делитесь этим skill через репозиторий проекта, **обязательно добавьте `.env` в `.gitignore` и никогда не коммитьте его в git**.
</Warning>

### ③ Передайте его вашему Agent

* **Агенты, которые автоматически обнаруживают skills** (например, Claude Code): поместите всю папку `gpt-image-2/` в его каталог skills — личный `~/.claude/skills/` или проектный `.claude/skills/` (общий через репозиторий).
* **Другие агенты**: разместите его в соответствии с их собственным соглашением о skill/plugin; или проще всего — **просто скажите Agent: "прочитайте SKILL.md в этой папке и следуйте ему"**.

После установки все готово — перейдите к [Как использовать это](#how-to-use-it) за примерами.

## SKILL.md

Создайте `gpt-image-2/SKILL.md` с полным содержимым ниже (`description` содержит сведения о том, «что он делает и когда его использовать», которые Agent использует для автоматического запуска этого навыка):

````markdown theme={null}
---
name: gpt-image-2
description: Generate or edit images via APIYI's GPT-Image 2.5 / 2 series — gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 (official) and gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip (reverse). Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, fuse, or inpaint existing images.
allowed-tools: Bash(python3 *)
---

# GPT-Image-2 Series Image Skill

Generate or edit images through the APIYI platform using the GPT-Image 2.5 / 2 series. One script covers six models, switched by `--model`:

- `gpt-image-2.5-flare` (default, official): speed-first; supports `size` / `quality` (incl. `xhigh` / `max`) / `mask` inpainting; token-based billing.
- `gpt-image-2.5-sunburst` (official): editing-precision-first, same parameters as flare; the pick for edits / multi-image fusion.
- `gpt-image-2` (official): previous generation, same parameters (`quality` up to `high`).
- `gpt-image-2.5-all` (reverse): ChatGPT web 2.5 reverse line, flat \$0.03/img, same parameters as `-all`.
- `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` (reverse, Adobe line 2.5): flat \$0.03/img, lockable `size`, all six `quality` tiers (incl. `xhigh` / `max`) and transparent background; `mask` only regenerates the whole image.
- `gpt-image-2-all` (reverse, ChatGPT line): fastest, flat \$0.03/img; **no `size`/`quality`** — put size in the prompt.
- `gpt-image-2-vip` (reverse, Adobe line): can lock `size` (30 tiers incl. 4K), flat \$0.03/img; **no `quality`/`mask`**.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
The script depends on the OpenAI SDK; if it reports a missing package, ask the user to run `pip install openai`.

## Usage

The first argument is the prompt; for editing/fusion, pass one or more local image paths with `-i`:

```bash
# Текст в изображение (по умолчанию официальный gpt-image-2.5-flare, с качеством)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Оранжевый кот в солнцезащитных очках в баре на берегу моря, кинематографичный стиль" -o cat.png --size 1536x1024 --quality high

# Быстрее всего и дешевле: обратный «all» (укажите размер в промпте, не передавайте size)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Плакат фестиваля в плоской иллюстративной стилистике, портретная ориентация 2:3" -o poster.png --model gpt-image-2-all

# Нужен фиксированный 4K: обратный «vip»
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Ночной вид на город с высоты птичьего полёта" -o city.png --model gpt-image-2-vip --size 3840x2160

# Объединение нескольких изображений (до 16, повторяйте -i)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Поместите человека с изображения 1 в сцену изображения 2, сохраните цвета изображения 3" -i person.png -i scene.png -i style.png -o fused.png

# Заполнение области (маска, только официальные модели; рекомендуется gpt-image-2.5-sunburst)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Замените область под маской круглым окном" -i room.png --mask mask.png -o edited.png

# Несколько изображений за один запуск (максимум 5, параллельно)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Черновики плаката фестиваля" -o draft.png -n 3 --model gpt-image-2-all
```

Arguments:

- 1st positional arg: the prompt (required).
- `--model`: `gpt-image-2` (default) / `gpt-image-2-all` / `gpt-image-2-vip`. You can also set a default with `APIYI_IMAGE_MODEL=...` in `.env`.
- `-i / --image`: input image path, repeatable (up to 16); omitted = text-to-image, present = edit/fusion.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many at once, **default 1**, max 5 (client-side concurrency; the script never sends `n`, avoiding per-image overbilling on reverse channels).
- `--size`: size, default `auto` (`gpt-image-2-all` ignores it — write size/ratio into the prompt).
- `--quality`: `low`/`medium`/`high`/`xhigh`/`max`/`auto`, **effective on the three official models and the two 2.5 -vip models** (`xhigh` / `max` on the 2.5 series only; the script omits it for `-all` / `gpt-image-2-vip`).
- `--format`: `png`/`jpeg`/`webp`, official only.
- `--mask`: mask image, official edit only (PNG with alpha, applies to the first image).
- `--background`: `transparent`/`opaque`/`auto`, official only. With `transparent`, `--format` must be `png` or `webp`.

## Choice & red lines (important)

- **Default `gpt-image-2.5-flare` (official)**: everyday text-to-image; switch to `gpt-image-2.5-sunburst` for edits and mask inpainting.
- **Fast/cheap** → `gpt-image-2.5-all` / `gpt-image-2-all`; **locked size/4K** → `gpt-image-2-vip`.
- For reverse `-all` / `gpt-image-2-vip`, **never pass `quality`** (the two 2.5 -vip models accept it); for **`gpt-image-2-all` never pass `size`** (put it in the prompt). The script gates this automatically, but follow it when calling the script directly too.
- **Transparent backgrounds**: only the three official models have a `background` parameter. Add `--background transparent` to get a real alpha-channel image (`--format` must be `png`/`webp`). The reverse models all/vip have no such parameter — you can only ask for it in the prompt, and it is occasionally unreliable.

## Number of images & cost

- **Default to a single image**; use `-n` only when the user explicitly asks, max 5.
- Reverse 2.5-all/all/vip are flat \$0.03/img; the official models are token-based and `--quality high` is pricier (~\$0.05–0.21/img at 1K, `xhigh` / `max` more) — drop to `medium`/`low` or use a reverse model when budget matters.

## Output location (important)

- A **bare filename** for `-o` saves into a **`gpt-image-output/` folder at the project root**; a **path with a directory** is saved as given.
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user. If a request is rejected by moderation, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name` должен состоять из строчных букв и дефисов. В Agents, поддерживающих slash-команды, имя каталога является командой — `gpt-image-2` становится `/gpt-image-2`. `${CLAUDE_SKILL_DIR}` — это переменная каталога навыка, предоставляемая Claude Code; в других Agents просто используйте фактический путь к скрипту.
</Tip>

## scripts/gpt\_image.py

Создайте `gpt-image-2/scripts/gpt_image.py` с помощью SDK OpenAI, настроенного на APIYI (`base_url="https://api.apiyi.com/v1"`):

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's gpt-image-2 series (gpt-image-2 official / gpt-image-2-all / gpt-image-2-vip reverse).
All use the OpenAI Images API (/v1/images/generations + /v1/images/edits), switched by --model. Needs: pip install openai"""
import argparse
import base64
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from openai import OpenAI

# Max images generated concurrently per call (server returns 1 per call; this simulates more client-side)
MAX_COUNT = 5

# Per-model capability gating: whether these params are accepted (never send the unaccepted ones)
MODEL_CAPS = {
    "gpt-image-2.5-flare":    {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official, speed-first
    "gpt-image-2.5-sunburst": {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official, editing-first
    "gpt-image-2":     {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official, previous gen
    "gpt-image-2.5-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, ChatGPT 2.5
    "gpt-image-2-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, ChatGPT
    "gpt-image-2-vip": {"size": True,  "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, Adobe
    "gpt-image-2.5-flare-vip":    {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # reverse, Adobe 2.5 (all six quality tiers; mask is not inpainting)
    "gpt-image-2.5-sunburst-vip": {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # reverse, Adobe 2.5
    "gpt-image-2.5-vip":          {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # alias of sunburst-vip
}


def caps_of(model):
    # Unknown models fall back to the official capability set
    return MODEL_CAPS.get(model, MODEL_CAPS["gpt-image-2.5-flare"])


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


def resolve_paths(out, count):
    """Decide output paths. Bare filename -> <project_root>/gpt-image-output/; a path with a dir -> as given."""
    if os.path.dirname(out):
        base_path = os.path.abspath(out)
    else:
        out_dir = os.path.join(project_root(), "gpt-image-output")
        os.makedirs(out_dir, exist_ok=True)
        base_path = os.path.join(out_dir, out)

    if count == 1:
        return [base_path]
    base, ext = os.path.splitext(base_path)
    return [f"{base}-{i}{ext}" for i in range(1, count + 1)]


def decode_image(item):
    """Get image bytes: b64_json may be pure base64 or a data:image-prefixed data URL (reverse models); or only a url."""
    raw = getattr(item, "b64_json", None)
    if raw:
        if raw.startswith("data:"):
            raw = raw.split(",", 1)[1]  # strip the data:image/png;base64, prefix
        return base64.b64decode(raw)
    url = getattr(item, "url", None)
    if url:
        with urllib.request.urlopen(url, timeout=360) as r:
            return r.read()
    raise RuntimeError("response has neither b64_json nor url")


def one_image(client, model, args):
    """Make one request, return image bytes; raise on failure (caught by _safe). Never sends n (default 1; concurrency for more)."""
    cap = caps_of(model)
    if args.image:
        # Edit / multi-image fusion: reopen files each call to avoid sharing handles across threads
        files = [open(p, "rb") for p in args.image]
        try:
            kwargs = dict(model=model, image=files if len(files) > 1 else files[0], prompt=args.prompt)
            if cap["size"] and args.size:
                kwargs["size"] = args.size
            if cap["quality"] and args.quality:
                kwargs["quality"] = args.quality
            if cap["output_format"] and args.format:
                kwargs["output_format"] = args.format
            if cap["background"] and args.background and args.background != "auto":
                kwargs["background"] = args.background
            if cap["mask"] and args.mask:
                kwargs["mask"] = open(args.mask, "rb")
            resp = client.images.edit(**kwargs)
        finally:
            for fh in files:
                fh.close()
    else:
        # Text to image
        kwargs = dict(model=model, prompt=args.prompt)
        if cap["size"] and args.size:
            kwargs["size"] = args.size
        if cap["quality"] and args.quality:
            kwargs["quality"] = args.quality
        if cap["output_format"] and args.format:
            kwargs["output_format"] = args.format
        if cap["background"] and args.background and args.background != "auto":
            kwargs["background"] = args.background
        resp = client.images.generate(**kwargs)
    return decode_image(resp.data[0])


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("No API key found: add a line APIYI_API_KEY=sk-xxx to the .env in the skill folder")

    default_model = os.environ.get("APIYI_IMAGE_MODEL", "gpt-image-2.5-flare")
    # Synchronous blocking call; image generation is slow, so give a generous 360s timeout
    client = OpenAI(api_key=api_key, base_url="https://api.apiyi.com/v1", timeout=360)

    parser = argparse.ArgumentParser(description="GPT-Image 2.5 / 2 series image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("--model", default=default_model,
                        help="gpt-image-2.5-flare (official, default) / gpt-image-2.5-sunburst (official, edits) / gpt-image-2 (official, previous gen) / gpt-image-2.5-all / gpt-image-2-all (reverse, fastest) / gpt-image-2-vip (reverse, lockable size) / gpt-image-2.5-flare-vip / gpt-image-2.5-sunburst-vip (reverse 2.5, lockable size + quality)")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable, up to 16; presence = edit/fusion mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many at once, default 1, max {MAX_COUNT} (client-side concurrency)")
    parser.add_argument("--size", default="auto",
                        help="Size, e.g. 1024x1024 / 2048x1152 / auto (gpt-image-2-all ignores it; put it in the prompt)")
    parser.add_argument("--quality", default="high",
                        help="Quality low / medium / high / auto (only effective on gpt-image-2 official)")
    parser.add_argument("--format", default="png", help="Output format png / jpeg / webp (official only)")
    parser.add_argument("--mask", help="Mask image (official edit only, PNG with alpha, applies to the first image)")
    parser.add_argument("--background", default="auto", choices=["transparent", "opaque", "auto"],
                        help="Background; transparent yields an alpha-channel image (official only, needs --format png/webp)")
    args = parser.parse_args()

    # jpeg has no alpha channel and is mutually exclusive with transparency — catch it locally, do not hand the user a 400
    if args.background == "transparent" and args.format == "jpeg":
        sys.exit("--background transparent cannot be combined with --format jpeg (no alpha channel); use png or webp")

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"Note: max {MAX_COUNT} at once; clamped {args.count} to {MAX_COUNT}.", file=sys.stderr)
        count = MAX_COUNT

    paths = resolve_paths(args.out, count)

    def task(path):
        data = one_image(client, args.model, args)
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

## Как переключить модель

Переключение модели — это **просто `--model`**, одно из шести значений:

```text theme={null}
... gpt_image.py "prompt"                              # default gpt-image-2.5-flare (official, speed-first)
... gpt_image.py "make it watercolor" -i in.png --model gpt-image-2.5-sunburst   # official, editing-first
... gpt_image.py "prompt" --model gpt-image-2            # official, previous generation
... gpt_image.py "prompt" --model gpt-image-2.5-all      # reverse, ChatGPT web 2.5
... gpt_image.py "prompt" --model gpt-image-2-all      # reverse, fastest, cheapest
... gpt_image.py "prompt" --model gpt-image-2-vip --size 3840x2160   # reverse, locked 4K
```

Чтобы изменить канал по умолчанию (чтобы не передавать `--model` каждый раз), добавьте строку в `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Info>
  Скрипт **автоматически обрабатывает оба варианта** ответов: base64 и URL (`b64_json` обратных моделей содержит префикс `data:image;base64,`, который скрипт удаляет). Переключить платёжную группу вашего token на `image2_OSS` в консоли APIYI необходимо только в том случае, если вам **строго требуется вывод в формате URL** — для обычной генерации это не нужно.
</Info>

## Почему одна фраза генерирует изображение

Многие задаются вопросом: я ведь не вводил команду, так как же «нарисуй кота» создала изображение?

Вот как это работает: при запуске Агент **сначала читает `description` из `SKILL.md` каждого навыка** (очень короткий фрагмент метаданных, который описывает «что делает этот навык и когда его использовать»). Когда ваш запрос **соответствует** этому сценарию (например, «нарисовать / сгенерировать / визуализировать изображение», «объединить эти изображения»), Агент **автоматически решает вызвать навык**, читает полный `SKILL.md` и запускает скрипт — и все это без необходимости запоминать какую-либо команду.

Когда вы не хотите, чтобы Агент угадывал, и хотите **полный контроль**, используйте **явный вызов** ниже.

## Как это использовать

### Естественный язык (неявный триггер)

После установки просто поговорите с агентом:

| Что вы говорите                              | Поведение навыка                                                 |
| -------------------------------------------- | ---------------------------------------------------------------- |
| «Нарисуй кинематографичного кота»            | По умолчанию gpt-image-2.5-flare, 1 png                          |
| «Сделай постер быстро и дёшево»              | Агент добавляет `--model gpt-image-2-all`                        |
| «Сгенерируй ночной вид города в 4K»          | Агент добавляет `--model gpt-image-2-vip --size 3840x2160`       |
| «Помести человека из person.png в scene.png» | Запускает `-i person.png -i scene.png`, объединённое изображение |

### Явный вызов (больше контроля)

* **Агенты, поддерживающие команды со слешем** (например, Claude Code):

  ```text theme={null}
  /gpt-image-2 Cyberpunk city rainy night, neon sign close-up --model gpt-image-2-vip --size 2048x1152
  ```

* **Любой агент / просто попросите его запустить скрипт** (наиболее универсальный вариант):

  ```text theme={null}
  Run python3 gpt-image-2/scripts/gpt_image.py "Cyberpunk city rainy night, neon sign close-up" --model gpt-image-2-all
  ```

## Куда попадает сгенерированное изображение

* Когда `-o` — это **простое имя файла** (например, `-o cat.png`), все изображения сохраняются в папку **`gpt-image-output/` в корне проекта** (создаётся автоматически), поэтому вы найдёте их прямо в своём проекте.
* «Корень проекта» = первый каталог, содержащий `.git` или `.claude`, найденный при подъёме вверх от местоположения самого скрипта — так что **независимо от того, из какого каталога запускается Agent, изображения попадут в проект**, а не во временную папку, которую вы не сможете найти.
* Скрипт **выводит по одному полному абсолютному пути на каждое изображение**, например `Image saved to /Users/you/project/gpt-image-output/cat.png`.
* По умолчанию он создаёт **только 1 изображение**; `-n 3` создаёт 3 одновременно (максимум 5), при этом суффикс `-1`, `-2`, `-3` добавляется автоматически.
* Когда `-o` — это **путь с каталогом** (например, `-o images/cat.png` или абсолютный путь), файл сохраняется точно по этому пути и не попадает в `gpt-image-output/`.
* Редактирование / слияние работает так же: результат сохраняется как новый файл и **не перезаписывает ваш исходный**.

## Связанные документы

* [Навык агента GPT-Image-2-All](/ru/api-capabilities/gpt-image-2-all/skills) (обратный, самый быстрый)
* [Навык агента GPT-Image-2-VIP](/ru/api-capabilities/gpt-image-2-vip/skills) (обратный, заблокирован 4K)
* [Обзор генерации изображений GPT-Image-2](/ru/api-capabilities/gpt-image-2/overview)
* [Навык агента Nano Banana Pro](/ru/api-capabilities/nano-banana-image/skills)
