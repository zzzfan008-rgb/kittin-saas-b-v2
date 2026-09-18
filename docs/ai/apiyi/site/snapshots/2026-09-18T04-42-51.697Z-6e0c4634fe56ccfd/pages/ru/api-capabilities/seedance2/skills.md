> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык агента для генерации видео Seedance 2.0

> Объедините все четыре модели Seedance (sd25 / mini / fast / standard) в один готовый к использованию навык агента — добавьте его в Codex, OpenClaw, Claude Code или любой агент для программирования и создавайте видео по тексту, видео по изображению и видео с эталонным изображением одним предложением; скрипт опрашивает асинхронную задачу и автоматически скачивает готовый клип.

<Note>
  На этой странице представлен **готовый к использованию навык агента**: один скрипт без зависимостей охватывает все четыре модели Seedance (`sd25` / `mini` / `fast` / стандартная), переключение между которыми выполняется с помощью `--model`. Добавьте его в используемый вами агент разработки, и одно предложение сгенерирует видео — всё состоит всего из двух файлов. Это также **первый навык для видеомоделей** на этом сайте: в отличие от изображений, генерация видео является асинхронной задачей, а скрипт уже включает полный процесс: отправка → опрос → загрузка.
</Note>

## Что делает навык

Один объединённый навык; скрипт выбирает режим генерации по **тому, какие изображения вы передаёте и какие у них роли**:

<CardGroup cols={3}>
  <Card title="Текст в видео" icon="clapperboard">
    Только prompt → совершенно новое видео, со звуком по умолчанию (диалог, звуковые эффекты, фоновые шумы).
  </Card>

  <Card title="Изображение в видео" icon="image-play">
    Передайте изображение первого кадра, чтобы анимировать статичное изображение; добавьте изображение последнего кадра для плавного перехода от начала к концу.
  </Card>

  <Card title="Референс в видео" icon="layers">
    Передайте до 9 референсных изображений → новый видеоряд, который сохраняет их персонажей, объекты или стиль.
  </Card>
</CardGroup>

## Какую модель выбрать

Все четыре модели **вызываются абсолютно одинаково**; они различаются ограничением разрешения, ограничением длительности, лимитами референсов, скоростью и ценой. Скрипт обрабатывает различия для каждой `--model`:

| Модель (`--model`)    | ID модели                         | Макс. разрешение | Скорость (720p/5s, измерено) | Группа                                     | Прайсовая цена 720p/5s                | Лучше всего для                                                                   |
| --------------------- | --------------------------------- | ---------------- | ---------------------------- | ------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------- |
| `mini` (по умолчанию) | `doubao-seedance-2-0-mini-260615` | 720p             | **самая быстрая, \~87–170s** | `SeeDance2` 0.18x<br />или `SD2Mini` 0.10x | \$0.4508<br />со скидкой **\$0.2504** | высокочастотного использования агентами, больших объёмов, быстрых превью          |
| `fast`                | `doubao-seedance-2-0-fast-260128` | 720p             | \~100–290s                   | `SeeDance2` 0.18x<br />или `SD2Fast` 0.15x | \$0.7253<br />со скидкой **\$0.6044** | баланса качества и стоимости                                                      |
| `std`                 | `doubao-seedance-2-0-260128`      | **1080p**        | \~100–290s                   | `SeeDance2` 0.18x                          | \$0.9074                              | 1080p, высочайшего качества                                                       |
| `sd25`                | `doubao-seedance-2-5-260628`      | **1080p**        | \~150s                       | `SeeDance2` 0.18x                          | **\$1.3721**                          | **до 30 s, 30 референсных изображений, вывод mov** — примерно в 1.5× дороже `std` |

<Tip>
  Практическое правило: **используйте модель по умолчанию `mini` для повседневных сценариев и сценариев с агентами**; **нужны 1080p или максимальное качество** → `--model std`; **нужны 30-секундные клипы, 30 референсных изображений или вывод mov** → `--model sd25` — единственный вариант (примерно в 1.5× дороже `std`, та же группа, что и семейство 2.0). Все соотношения сторон имеют одинаковую стоимость в рамках одного уровня разрешения, длительность тарифицируется линейно посекундно, а частота кадров фиксирована на уровне 24fps. Группы со скидкой `SD2Mini` / `SD2Fast` действуют до **7 октября 2026 23:59 (UTC+8)**; после этого группы останутся доступны, а коэффициент тарифа вернётся к 0.18x — см. [примечания к группам на странице обзора](/ru/api-capabilities/seedance2/overview).
</Tip>

## Какие Agent могут использовать его

<Info>
  Skill по сути — это **папка**: заметка, которую агент должен прочитать (`SKILL.md`), плюс скрипт, который выполняет работу. Поэтому **любой coding agent, который умеет читать локальные файлы и выполнять shell-команды, может использовать его** — **Codex, OpenClaw, hermes-agent, Claude Code** и тому подобные.

  Единственное требование: на машине, где запущен агент (ваш ноутбук или сервер), должны быть **Python 3** и **доступ к интернету** (скрипт напрямую вызывает `api.apiyi.com`). Скрипт использует только стандартную библиотеку Python — **ничего не нужно `pip install`**.
</Info>

## Настройка за 3 шага

### ① Создайте папку и добавьте файлы

Создайте папку навыка и добавьте в неё два файла ниже (полное содержимое приведено в следующих двух разделах):

```
seedance2/
├── SKILL.md
├── scripts/
│   └── seedance_video.py
└── .env          # created in step ②, holds your key
```

### ② Разместите рядом с ней свой ключ

Запишите свой **ключ APIYI API** в `seedance2/.env` (создайте его в консоли `api.apiyi.com` с тарификацией по мере использования; **для token должна быть включена группа `SeeDance2`**, которая охватывает все четыре модели — `mini` / `fast` также имеют льготные `SD2Mini` / `SD2Fast`):

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

Скрипт автоматически считывает ключ из этого `.env` — **дополнительная настройка или переменные окружения не требуются**.

<Warning>
  `.env` содержит ваш секретный ключ. Если навык используется внутри репозитория проекта, **добавьте `.env` в `.gitignore` и никогда не фиксируйте этот файл в репозитории**.
</Warning>

### ③ Передайте его своему Agent

* **Agents с автоматическим обнаружением навыков** (например, Claude Code): поместите всю папку `seedance2/` в каталог навыков — личный `~/.claude/skills/` или уровня проекта `.claude/skills/` (общий для репозитория).
* **Другие agents**: следуйте их собственным соглашениям для навыков и плагинов; или, что проще всего, **попросите agent «прочитать файл SKILL.md в этой папке и следовать ему»**.

Готово — перейдите к разделу [Как использовать](#how-to-use-it), чтобы ознакомиться с примерами.

## SKILL.md

Создайте `seedance2/SKILL.md` с полным содержимым ниже (в `description` указано «что делает навык + когда его использовать», и это используется агентом для автоматического запуска навыка):

````markdown theme={null}
---
name: seedance2
description: Generate videos via APIYI's Seedance 2.5 and 2.0 (doubao-seedance-2-5 / doubao-seedance-2-0 series) models — text-to-video, image-to-video (first/last frame), and reference-image-to-video, with synced audio by default. Use this when the user asks to create, generate, or animate a video clip.
allowed-tools: Bash(python3 *)
---

# Seedance Video Skill

Generate videos through the APIYI platform using Seedance 2.5 (`doubao-seedance-2-5-260628`) and 2.0 (`doubao-seedance-2-0` series). Defaults to the fastest and cheapest mini model, with synced audio built in.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If it reports "API key not found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`;
the token must have the `SeeDance2` group enabled with pay-as-you-go billing — **all four models live there**;
`mini` and `fast` also have the discounted `SD2Mini` / `SD2Fast`.

## Usage (important: generation takes 2-5 minutes)

Video generation is an **async task**: the script submits the task and polls until done, so one call usually takes 2-5 minutes in total.
**Run it with a long command timeout (600+ seconds) or in the background** — do not use a default 2-minute timeout, or the script gets killed before the video is ready.

```bash
# Текст в видео (по умолчанию mini / 720p / 5 с / со звуком)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Оранжевая кошка гонится за бабочками на лугу, медленная съёмка с сопровождением, естественный свет" -o cat.mp4

# Изображение в видео (первый кадр — анимируйте статичное изображение)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Камера медленно приближается, свет струится" -i photo.jpg -o animated.mp4

# Переход от первого кадра к последнему
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Плавный переход от первого кадра к последнему" -i first.png --last-frame last.png -o morph.mp4

# Референсные изображения в видео (сохранение персонажа и стиля с референсов, до 9 изображений)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Персонаж с референсных изображений бежит по снегу" --ref-image role.png -o run.mp4

# Высокое качество: стандартная модель + 1080p + 10 с
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Съёмка с дрона над осенней долиной, кинематографичный стиль" --model std --resolution 1080p --duration 10 -o valley.mp4

# Seedance 2.5: 30-секундный клип (стоит в 6 раз дороже 5-секундного — сначала подтвердите у пользователя)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Дрон летит над осенней долиной, один непрерывный дубль" --model sd25 --duration 30 -o long.mp4

# Seedance 2.5: вывод в формате mov для цветокоррекции
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Волны разбиваются о скалы, замедленная съёмка" --model sd25 --output-format mov -o waves.mov
```

Parameters:

- 1st positional argument: the prompt (required). Describing scene + camera motion + mood works best.
- `--model`: `mini` (default, fastest and cheapest) / `fast` / `std` / `sd25` (**Seedance 2.5** — up to 30 s, 30 reference images, 1080p and mov; about 1.5x the price of `std`, same group as the 2.0 family).
- `--resolution`: `480p` / `720p` (default) / `1080p` (`sd25` and `std` only). No model supports 4k.
- `--ratio`: `adaptive` (default) / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9`; all ratios cost the same within a tier.
- `--duration`: integer seconds, 4-30 on `sd25` and 4-15 on the 2.0 family, default 5; `-1` lets the model decide. Longer costs more.
- `--no-audio`: disable synced audio (on by default).
- `-i / --image`: first-frame image (local path / URL / `asset://` asset ID); passing it switches to image-to-video. Combine with `--last-frame` for first/last-frame mode.
- `--ref-image`: reference image, repeatable — up to 30 on `sd25`, 9 on the 2.0 family; mutually exclusive with `-i`.
- `--output-format`: `mp4` (default) / `mov`, **`sd25` only**. mov has better colour fidelity but limited player support — do not use it for web or mobile distribution.
- `-o / --out`: output file name, default `output.mp4`.

## Clip count and cost (important)

- **One call produces exactly 1 video** — there is no batch flag. If the user wants several, run sequential calls and warn about cost first.
- Video bills by tokens and is far pricier than images (about \$0.45-0.91 list per 720p/5s clip; longer or sharper costs more).
  Unless the user explicitly asks, **keep the defaults mini / 720p / 5s** — never bump duration, resolution, or switch models on your own.
- **On `sd25`, a 30-second clip costs about \$8.18 and a 1080p/5s clip about \$3.09** — an order of magnitude above the default tier, so always confirm with the user first.

## Output location (important)

- With a **bare file name** for `-o` (like `cat.mp4`), the video goes to the **`seedance-output/` folder in the project root**.
- With a **path containing directories**, it saves to that path (relative paths resolve against the current working directory).
- Never write videos to `/tmp`, scratchpads, or other temp folders — the user won't find them.
- The returned video URL expires in 24 hours; the script already downloads the file locally — the local file is the deliverable.

## When done

The script prints the saved path, file size, elapsed time, and billed tokens — report the path back to the user verbatim.
If it reports a failure (including content-moderation rejections), relay the error as-is and do not retry the same prompt.
On "no available channel for this model", ask the user to check the token's groups: all four models need `SeeDance2`; `mini` / `fast` may also use `SD2Mini` / `SD2Fast`.
````

<Tip>
  `name` должно состоять из строчных букв и дефисов. В агентах с командами в виде слэшей имя папки является командой — `seedance2` предоставляет вам `/seedance2`. `${CLAUDE_SKILL_DIR}` — это переменная каталога навыка Claude Code; в других агентах просто используйте фактический путь к скрипту.
</Tip>

## scripts/seedance\_video.py

Создайте `seedance2/scripts/seedance_video.py` — только со стандартной библиотекой Python, с тем же кодом запроса, что и в [справочнике API генерации видео этого сайта](/ru/api-capabilities/seedance2/video-generation), проверено и работает:

```python theme={null}
#!/usr/bin/env python3
"""Generate videos via APIYI's Seedance 2.5 / 2.0 (text / image / reference-image to video). Pure stdlib, zero dependencies."""
import argparse
import base64
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.request

# Line-buffer stdout even when redirected, so agents can tail progress from the background
sys.stdout.reconfigure(line_buffering=True)

TASKS_URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"

# Short name -> full model ID
MODELS = {
    "sd25": "doubao-seedance-2-5-260628",
    "mini": "doubao-seedance-2-0-mini-260615",
    "fast": "doubao-seedance-2-0-fast-260128",
    "std": "doubao-seedance-2-0-260128",
}
# Resolution caps per model (mini/fast reject 1080p upstream with 400; fail fast client-side)
MODEL_CAPS = {
    "sd25": ("480p", "720p", "1080p"),
    "mini": ("480p", "720p"),
    "fast": ("480p", "720p"),
    "std": ("480p", "720p", "1080p"),
}
# Duration cap: 30 s on 2.5, 15 s on the 2.0 family
MAX_DURATION = {"sd25": 30, "mini": 15, "fast": 15, "std": 15}
# Reference-image cap: 30 on 2.5, 9 on the 2.0 family
MAX_REF_IMAGES_BY_MODEL = {"sd25": 30, "mini": 9, "fast": 9, "std": 9}
RATIOS = ("adaptive", "16:9", "4:3", "1:1", "3:4", "9:16", "21:9")
MAX_REF_IMAGES = 30

# Generation is async: wait a bit before the first poll; 720p/5s takes ~90-170s in practice
POLL_FIRST_DELAY = 25
POLL_INTERVAL = 15
POLL_TIMEOUT = 15 * 60


def load_api_key():
    """Prefer the environment variable; otherwise look for .env in the script dir and its parent."""
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
    """Walk up from the script location to the first dir containing .git or .claude; else use cwd."""
    d = os.path.dirname(os.path.abspath(__file__))
    while True:
        if os.path.isdir(os.path.join(d, ".git")) or os.path.isdir(os.path.join(d, ".claude")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return os.getcwd()
        d = parent


def resolve_path(out):
    """Bare file name -> save under <project root>/seedance-output/ so it's easy to find; else use the given path."""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "seedance-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def image_source(src):
    """Image inputs: pass URLs / asset:// / data: through as-is; encode local files as base64 data URIs."""
    if src.startswith(("http://", "https://", "asset://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"Image file not found: {src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None):
    """The gateway labels responses content-encoding: gzip without compressing them — Accept-Encoding: identity is required."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers,
                                 method="POST" if body is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Request failed HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """Download the result video: it's a signed URL — do NOT send the Authorization header."""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)
    return os.path.getsize(path)


def build_content(args):
    content = [{"type": "text", "text": args.prompt}]
    if args.image:
        content.append({"type": "image_url",
                        "image_url": {"url": image_source(args.image)},
                        "role": "first_frame"})
        if args.last_frame:
            content.append({"type": "image_url",
                            "image_url": {"url": image_source(args.last_frame)},
                            "role": "last_frame"})
    for src in args.ref_image:
        content.append({"type": "image_url",
                        "image_url": {"url": image_source(src)},
                        "role": "reference_image"})
    return content


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("API key not found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder"
                 " (the token needs the SeeDance2 group; mini / fast may also use SD2Mini / SD2Fast)")

    parser = argparse.ArgumentParser(description="Seedance 2.5 / 2.0 video generation")
    parser.add_argument("prompt", help="prompt (scene + camera motion + mood)")
    parser.add_argument("--model", default="mini", choices=sorted(MODELS),
                        help="mini=fastest & cheapest (default) / fast / std / "
                             "sd25=Seedance 2.5 (up to 30 s, 30 reference images, 1080p and mov)")
    parser.add_argument("--resolution", default="720p", choices=("480p", "720p", "1080p"),
                        help="resolution, default 720p")
    parser.add_argument("--ratio", default="adaptive", choices=RATIOS,
                        help="aspect ratio, default adaptive (same price across ratios per tier)")
    parser.add_argument("--duration", type=int, default=5,
                        help="duration in integer seconds (4-30 on sd25, 4-15 on the 2.0 family), "
                             "or -1 to let the model decide; default 5")
    parser.add_argument("--output-format", default=None, choices=("mp4", "mov"),
                        help="output container, sd25 only; mov has better colour fidelity but limited player support")
    parser.add_argument("--no-audio", action="store_true",
                        help="disable synced audio (on by default)")
    parser.add_argument("--seed", type=int, default=None, help="random seed, for reproducibility")
    parser.add_argument("-i", "--image", help="first-frame image (local path / URL / asset://); enables image-to-video")
    parser.add_argument("--last-frame", help="last-frame image, used together with -i")
    parser.add_argument("--ref-image", action="append", default=[],
                        help=f"reference image (repeatable; up to {MAX_REF_IMAGES} on sd25, 9 on the 2.0 family); "
                             "mutually exclusive with -i")
    parser.add_argument("-o", "--out", default="output.mp4", help="output file name")
    args = parser.parse_args()

    if args.image and args.ref_image:
        sys.exit("First-frame mode (-i) and reference mode (--ref-image) are mutually exclusive.")
    if args.last_frame and not args.image:
        sys.exit("--last-frame must be used together with -i (first-frame image).")
    max_refs = MAX_REF_IMAGES_BY_MODEL[args.model]
    if len(args.ref_image) > max_refs:
        sys.exit(f"{args.model} accepts at most {max_refs} reference images"
                 f"{' (use --model sd25 for 30)' if max_refs == 9 else ''}.")
    max_dur = MAX_DURATION[args.model]
    if args.duration != -1 and not 4 <= args.duration <= max_dur:
        sys.exit(f"{args.model} supports durations of 4-{max_dur} whole seconds, or -1 for smart duration"
                 f"{' (use --model sd25 for 30 s)' if max_dur == 15 else ''}.")
    if args.resolution not in MODEL_CAPS[args.model]:
        sys.exit(f"{args.model} supports up to {MODEL_CAPS[args.model][-1]}; "
                 f"use --model sd25 or --model std for 1080p.")
    # 2.5 forces ratio=adaptive on first-frame / first+last-frame tasks; fail fast client-side
    if args.model == "sd25" and args.image and args.ratio != "adaptive":
        sys.exit("Seedance 2.5 requires --ratio adaptive for first-frame / first+last-frame tasks (upstream constraint).")
    if args.output_format and args.model != "sd25":
        sys.exit("--output-format is supported on Seedance 2.5 (--model sd25) only.")

    body = {
        "model": MODELS[args.model],
        "content": build_content(args),
        "resolution": args.resolution,
        "ratio": args.ratio,
        "duration": args.duration,
    }
    if args.no_audio:
        body["generate_audio"] = False
    if args.seed is not None:
        body["seed"] = args.seed
    if args.output_format:
        body["output_format"] = args.output_format

    try:
        task = api_request(TASKS_URL, api_key, body)
    except (RuntimeError, OSError) as e:
        sys.exit(f"Submission failed: {e}")
    task_id = task.get("id")
    if not task_id:
        sys.exit(f"Submission failed, response: {json.dumps(task, ensure_ascii=False)[:500]}")
    print(f"Task submitted task_id={task_id}; generation usually takes 2-5 minutes, polling...")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(f"{TASKS_URL}/{task_id}", api_key)
        except (RuntimeError, OSError) as e:  # network hiccups don't stop the poll loop
            print(f"  poll error (continuing): {e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = task.get("status", "unknown")
        elapsed = round(time.time() - t0)
        print(f"  [{elapsed:>4}s] status={status}")
        if status in ("succeeded", "failed", "expired"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"Polling timed out ({POLL_TIMEOUT}s). The task is still server-side; query it later:\n"
                     f"  GET {TASKS_URL}/{task_id}")
        time.sleep(POLL_INTERVAL)

    if status != "succeeded":
        err = task.get("error") or task
        sys.exit(f"Generation failed (status={status}): {json.dumps(err, ensure_ascii=False)[:500]}")

    video_url = (task.get("content") or {}).get("video_url")
    if not video_url:
        sys.exit(f"Task succeeded but no video URL returned: {json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(video_url, path)
    tokens = (task.get("usage") or {}).get("completion_tokens", "?")
    print(f"Video saved to {path} ({size / 1e6:.1f} MB, {round(time.time() - t0)}s elapsed, "
          f"billed {tokens} tokens)")


if __name__ == "__main__":
    main()
```

## Как переключать модели

Переключение моделей — это всего лишь `--model`, четыре значения:

```text theme={null}
... seedance_video.py "prompt"                                    # default mini (fastest & cheapest)
... seedance_video.py "prompt" --model fast                       # fast edition
... seedance_video.py "prompt" --model std --resolution 1080p     # standard edition
... seedance_video.py "prompt" --model sd25 --duration 30         # Seedance 2.5 - up to 30 seconds
```

<Info>
  **Группа token определяет, какие модели он может вызывать**: `SeeDance2` (0.18x) включает **все четыре модели** (`sd25` / `std` / `fast` / `mini`); группы со скидкой — это **линии для одной модели**: `SD2Mini` (0.10x) включает только `mini`, `SD2Fast` (0.15x) включает только `fast`, а вызов любой другой модели с помощью token со скидкой возвращает сообщение «для этой модели нет доступного канала». **Достаточно одного token в `SeeDance2`**; открывайте отдельные token со скидкой, когда объём запросов это оправдывает — см. [примечания о группах на обзорной странице](/ru/api-capabilities/seedance2/overview).
</Info>

## Ожидайте 2–5 минут ожидания (важно)

Генерация видео — это **асинхронная задача**, и это главное отличие от возможностей работы с изображениями:

* Скрипт оборачивает весь процесс: отправка → опрос каждые 15 секунд → автоматическое скачивание mp4 при успехе. **Клип 720p/5s занимает примерно 2–3 минуты от начала до конца**; 1080p или более длительные ролики требуют больше времени.
* **Задайте для команды большой timeout (600+ секунд) или запустите её в фоновом режиме** — многие агенты завершают команды по умолчанию через 2 минуты, ещё до того, как видео будет готово. `SKILL.md` это, а агенты с фоновым выполнением (например, Claude Code) обрабатывают это автоматически.
* Если опрос когда-либо истечёт по timeout (15 минут), задача всё равно останется в очереди на стороне сервера; скрипт выведет `task_id` и команду запроса, чтобы вы могли получить её позже. **Деньги не расходуются** — Seedance 2.0 предварительно списывает средства при отправке и возвращает разницу после завершения, а отклонённые отправки (HTTP 400) никогда не тарифицируются.

## Почему одно предложение генерирует видео

Часто задаваемый вопрос: я никогда не вводил команду — как фраза «сделай видео с котом» создала клип?

Вот как это работает: при запуске агент **считывает `description` каждого навыка в его `SKILL.md`** (небольшой фрагмент метаданных, в котором указано «что делает этот навык и когда его использовать»). Когда ваш запрос **соответствует** этому описанию (например, «generate/make a video», «animate this image»), агент **сам решает вызвать навык**, читает полный `SKILL.md` и запускает скрипт — вам не нужно запоминать команду.

Если вы предпочитаете не полагаться на догадки агента, используйте **явный вызов** ниже для **полного контроля**.

## Как использовать

### Естественный язык (неявный триггер)

После установки просто общайтесь с вашим агентом:

| Вы говорите                                                  | Поведение навыка                                           |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| "Создай видео с котом, бегущим по траве"                     | по умолчанию `mini` / 720p / 5 s, один mp4 со звуком       |
| "Преврати этот постер в motion video"                        | добавляет `-i poster.png`, image-to-video по первому кадру |
| "10-секундный drone shot в 1080p"                            | добавляет `--model std --resolution 1080p --duration 10`   |
| "Используй эти изображения персонажей для ролика с паркуром" | добавляет `--ref-image` с референсами                      |
| "Без фонового звука"                                         | добавляет `--no-audio`                                     |

### Явный вызов (больше контроля)

* **Агенты с slash-командами** (например, Claude Code):

  ```text theme={null}
  /seedance2 Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **Любой агент / скажите ему запустить скрипт напрямую** (наиболее универсально):

  ```text theme={null}
  Run python3 seedance2/scripts/seedance_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## Куда попадает сгенерированное видео

* При использовании **имени файла без пути** для `-o` (например, `-o cat.mp4`) видео попадает в **папку `seedance-output/` в корне проекта** (создаётся автоматически) — прямо в вашем проекте.
* «Корень проекта» = первый каталог, содержащий `.git` или `.claude`, найденный при движении вверх от скрипта — **где бы ни запускался агент, видео остаётся в вашем проекте**, никогда не теряясь во временной папке.
* По завершении скрипт **выводит одну строку с полным абсолютным путём**, а также размером файла, прошедшим временем и списанными token, например `Video saved to /Users/you/project/seedance-output/cat.mp4 (3.8 MB, 132s elapsed, billed 108900 tokens)`.
* Возвращаемый URL видео **истекает через 24 часа**, поэтому скрипт всегда сначала скачивает его — **локальный mp4 является итоговым результатом**; никогда не сохраняйте URL как результат.
* При использовании **пути с каталогами** (например, `-o videos/cat.mp4` или абсолютного пути) он сохраняет файл именно туда, пропуская `seedance-output/`.

## Связанные документы

* [Обзор Seedance 2.0](/ru/api-capabilities/seedance2/overview) (модели, тарификация, группы)
* [Справочник API для генерации видео](/ru/api-capabilities/seedance2/video-generation) (полные параметры и эндпоинты)
* [Генерация видео с привязкой к ассетам](/ru/api-capabilities/seedance2/asset-reference) (согласованность персонажей, `asset://` ассеты)
* [Навык агента серии GPT-Image-2](/ru/api-capabilities/gpt-image-2/skills) (image-ориентированный аналог)
* [Навык агента Nano Banana Pro](/ru/api-capabilities/nano-banana-image/skills)
