> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык Agent Skill для видео Wan2.7 и HappyHorse

> Объедините видео-модели Alibaba Wan2.7 и HappyHorse в один готовый к использованию Agent Skill — подключите его в Codex, OpenClaw, Claude Code или любой coding agent и выполняйте text-to-video, image-to-video, reference-to-video и video editing одной фразой, переключая серию через --model, при этом локальные изображения загружаются напрямую.

<Note>
  На этой странице представлен **готовый к использованию Agent Skill**: скрипт без зависимостей покрывает как серии **Wan2.7**, так и **HappyHorse** — у них один эндпоинт, одна структура запроса и одна `Wan&HappyHorse` token группа, переключаемая с помощью `--model`. Скрипт **автоматически выбирает нужную модель** из передаваемых вами ресурсов (текст / изображение / ссылка / редактирование видео) и оборачивает полный асинхронный цикл отправки → опроса → скачивания. Всё это — всего два файла.
</Note>

## Что делает навык

Один объединённый навык; скрипт определяет режим генерации и ID модели по **тем assets, которые вы передаёте**:

<CardGroup cols={2}>
  <Card title="Текст в video" icon="clapperboard">
    Только prompt → совершенно новое video; автоматическое расширение prompt включено по умолчанию, так что короткие prompt тоже хорошо работают.
  </Card>

  <Card title="Изображение в video" icon="image-play">
    Передайте изображение первого кадра, чтобы анимировать статичное изображение — локальные изображения загружаются напрямую, хостинг изображений не нужен.
  </Card>

  <Card title="Референс в video" icon="layers">
    Передайте референсные изображения (Wan также принимает референсные video) → новый видеоматериал с сохранением персонажей, объектов или стиля; указывайте их как «изображение 1 / video 1» в prompt.
  </Card>

  <Card title="Редактирование video" icon="scissors">
    Передайте video + референсные изображения → замените или измените стиль элементов в video; длительность результата соответствует исходнику.
  </Card>
</CardGroup>

## Какую серию выбрать

Обе серии **называются абсолютно одинаково**; они отличаются ценой, визуальной отделкой и возможностями по reference assets. Скрипт обрабатывает различия для `--model`:

| Серия (`--model`)    | Позиционирование                                      | Цена за 720P | Цена за 1080P | \~720P/5s  | Reference assets            | Скорость 720P/5s (измеренная) |
| -------------------- | ----------------------------------------------------- | ------------ | ------------- | ---------- | --------------------------- | ----------------------------- |
| `wan` (по умолчанию) | вариант с лучшей ценой, оптимален для больших объёмов | \$0.084/s    | \$0.14/s      | **\$0.42** | images + videos, 5 combined | 45–155s                       |
| `happyhorse`         | ориентирована на качество                             | \$0.126/s    | \$0.224/s     | **\$0.63** | только images, до 9         | 105–125s                      |

<Tip>
  Практическое правило: **для повседневного использования и больших объёмов выбирайте серию `wan` по умолчанию**; **когда визуальное качество важнее всего** → `--model happyhorse`. Обе серии используют одну и ту же группу `Wan&HappyHorse` (множитель 0.14x ≈ 98% от официальной цены в CNY, а при пополнении с бонусами — ещё ниже) — один token подходит для обеих, и отдельной скидочной группы нет. Тарификация посекундная; за неудавшиеся задачи плата не взимается. Полные цены — в [Обзор Wan](/ru/api-capabilities/wan/overview) и [Обзор HappyHorse](/ru/api-capabilities/happyhorse/overview).
</Tip>

## Какие Agents могут это использовать

<Info>
  Skill — это по сути **папка**: заметка, которую agent должен прочитать (`SKILL.md`), плюс script, который выполняет работу. Поэтому **любой coding agent, который может читать локальные файлы и выполнять shell-команды, может использовать его** — **Codex, OpenClaw, hermes-agent, Claude Code** и тому подобные.

  Единственное требование: на машине, где запущен agent (на вашем ноутбуке или на сервере), должны быть **Python 3** и **доступ в интернет** (script обращается к `api.apiyi.com` напрямую). Script использует только стандартную библиотеку Python — **ничего не нужно `pip install`**.
</Info>

## Настройка за 3 шага

### ① Создайте папку и вставьте файлы

Создайте папку для навыка и поместите в неё два файла ниже (полное содержимое в следующих двух разделах):

```
wan/
├── SKILL.md
├── scripts/
│   └── wan_video.py
└── .env          # created in step ②, holds your key
```

### ② Поместите свой ключ рядом с ним

Впишите свой **API-ключ APIYI** в `wan/.env` (создайте его в консоли `api.apiyi.com`; **у token должна быть включена группа `Wan&HappyHorse`** с тарификацией по факту использования — tokens с тарификацией за каждый вызов нельзя маршрутизировать):

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

Скрипт автоматически считывает ключ из этого `.env` — **не требуется дополнительная настройка или переменные среды**.

<Warning>
  `.env` содержит ваш секретный ключ. Если навык используется совместно в репозитории проекта, **добавьте `.env` в `.gitignore` и никогда не коммитьте его**.
</Warning>

### ③ Передайте это своему Agent

* **Агенты с автоматическим обнаружением навыков** (например, Claude Code): поместите всю папку `wan/` в каталог навыков — личный `~/.claude/skills/` или на уровне проекта `.claude/skills/` (общий с репозиторием).
* **Другие агенты**: следуйте их собственным соглашениям для навыков/плагинов; или, проще всего, — **попросите агента «прочитать SKILL.md в этой папке и следовать ему»**.

Вот и всё — перейдите к [Как использовать](#how-to-use-it) для примеров.

## SKILL.md

Создайте `wan/SKILL.md` с полным содержимым ниже (в `description` указано «что он делает + когда его использовать», что агент использует для автозапуска):

````markdown theme={null}
---
name: wan
description: Generate videos via APIYI's Wan2.7 and HappyHorse (Alibaba) models — text-to-video, image-to-video (first frame), reference-image/video-to-video, and video editing. Use this when the user asks to create, generate, or animate a video clip, or to restyle/edit an existing video.
allowed-tools: Bash(python3 *)
---

# Wan2.7 / HappyHorse Video Skill

Generate videos through the APIYI platform using Alibaba's video models. One script covers two series, switched by `--model`:

- `wan` (default): the Wan2.7 series, cheaper (720P about \$0.084/s).
- `happyhorse`: the HappyHorse-1.1 series, quality-oriented, about 1.5× the price of wan; no reference-video support.

The script picks the model from the assets you pass: no image = text-to-video; `-i` first frame = image-to-video; `--ref-image`/`--ref-video` = reference-to-video; `--video`+`--ref-image` = video editing.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If it reports "API key not found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`;
the token must have the `Wan&HappyHorse` group enabled with pay-as-you-go billing (per-call billing tokens cannot be routed).

## Usage (important: generation takes 2-5 minutes)

Video generation is an **async task**: the script submits and polls until done, so one call usually takes 2-5 minutes (longer for 1080P or long clips).
**Run it with a long command timeout (600+ seconds) or in the background** — do not use a default 2-minute timeout, or the script gets killed before the video is ready.

```bash
# Текст в видео (по умолчанию Wan / 720P / 5 s)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Ночная улица Токио, неоновые огни, пешеходы с зонтиками, дождливая атмосфера" -o tokyo.mp4

# Изображение в видео (первый кадр; локальный путь или публичный URL оба работают — локальные файлы автоматически загружаются как base64)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Камера медленно приближается, свет струится" -i photo.jpg -o animated.mp4

# Референсные изображения в видео (сохраняйте персонажа/стиль; в prompt называйте ресурсы как "image 1 / image 2")
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Персонаж из image 1 бежит через снег" --ref-image role.png -o run.mp4

# Редактирование видео (изменяйте элементы в видео с помощью референсных изображений)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Замените человека в video 1 на персонажа из image 1" --video https://example.com/src.mp4 --ref-image https://example.com/role.png -o edited.mp4

# Переключитесь на HappyHorse, укажите 1080P
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Съёмка с дрона над осенней долиной, кинематографично" --model happyhorse --resolution 1080P --duration 8 -o valley.mp4
```

Parameters:

- 1st positional argument: the prompt (required). With multiple assets, refer to them in order as "image 1 / video 1".
- `--model`: `wan` (default) / `happyhorse`.
- `--resolution`: `720P` (default) / `1080P` (note the uppercase P; there is no 480P tier).
- `--ratio`: `16:9` / `9:16` / `1:1` / `4:3` / `3:4` (ignored when a first-frame image is given; happyhorse docs don't list it — sent only when passed explicitly).
- `--duration`: integer seconds 2-15, default 5; capped at 10 with reference videos; edit mode follows the source video.
- `--negative`: negative prompt. `--no-prompt-extend`: disable prompt auto-expansion (on by default).
- `-i / --image`: first-frame image (local path or URL). `--ref-image`: reference image, repeatable (wan: 5 combined with videos; happyhorse: up to 9). `--ref-video`: reference video URL (wan only). `--video`: video to edit (URL).
- `-o / --out`: output file name, default `output.mp4`.

## Asset inputs (important)

- Image assets: **local files and public URLs both work** — the script converts local files to base64 data URIs (verified working on both series; official docs only document the URL path).
- Video assets (`--ref-video` / `--video`): prefer public URLs; base64-encoding large videos inflates the payload and may exceed request limits.

## Clip count and cost (important)

- **One call produces exactly 1 video** — there is no batch flag. If the user wants several, run sequential calls and warn about cost first.
- Billing is per second: wan 720P \$0.084/s (about \$0.42 for 5 s), 1080P \$0.14/s; happyhorse is about 1.5× wan.
  Unless the user explicitly asks, **keep the defaults wan / 720P / 5s** — never bump duration, resolution, or switch to happyhorse on your own.
- Failed tasks are never billed; duplicate submissions bill twice — do not auto-retry the same request.

## Output location (important)

- With a **bare file name** for `-o` (like `cat.mp4`), the video goes to the **`wan-output/` folder in the project root**.
- With a **path containing directories**, it saves to that path (relative paths resolve against the current working directory).
- Never write videos to `/tmp`, scratchpads, or other temp folders — the user won't find them.
- The result URL expires in 24 hours; the script already downloads the file locally — the local file is the deliverable.

## When done

The script prints the saved path, file size, and elapsed time — report the path back to the user verbatim.
If it reports a failure (including content-moderation rejections), relay the error as-is and do not retry the same prompt.
On "no available channel for this model", ask the user to check the token's group includes `Wan&HappyHorse` and billing mode is pay-as-you-go.
````

<Tip>
  `name` должен состоять из строчных букв и дефисов. В агентах с slash-командами имя папки — это команда — `wan` дает вам `/wan`. `${CLAUDE_SKILL_DIR}` — это переменная каталога навыков Claude Code; в других агентах просто используйте фактический путь к скрипту.
</Tip>

## scripts/wan\_video.py

Создайте `wan/scripts/wan_video.py` — только стандартная библиотека Python, с тем же кодом запроса, что и на страницах справки API этого сайта, проверено и работает:

```python theme={null}
#!/usr/bin/env python3
"""Generate videos via APIYI's Wan2.7 / HappyHorse (text / image / reference to video, video editing). Pure stdlib, zero dependencies."""
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

# DashScope passthrough endpoint. NEVER use the flat /v1/videos path — it drops the media field
CREATE_URL = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
TASK_URL = "https://api.apiyi.com/v1/tasks/{}"

# family x mode -> model ID. Edit-model naming is irregular (happyhorse is 1.0 with a hyphen) — don't hand-build these
FAMILY_MODELS = {
    "wan": {"t2v": "wan2.7-t2v", "i2v": "wan2.7-i2v",
            "r2v": "wan2.7-r2v", "edit": "wan2.7-videoedit"},
    "happyhorse": {"t2v": "happyhorse-1.1-t2v", "i2v": "happyhorse-1.1-i2v",
                   "r2v": "happyhorse-1.1-r2v", "edit": "happyhorse-1.0-video-edit"},
}
# r2v reference caps: wan 5 images+videos combined, happyhorse images only, up to 9
MAX_REFS = {"wan": 5, "happyhorse": 9}
RATIOS = ("16:9", "9:16", "1:1", "4:3", "3:4")

# Generation is async: 720P/5s takes ~70-140s in practice, 1080P/long clips can exceed 5 minutes
POLL_FIRST_DELAY = 15
POLL_INTERVAL = 8
POLL_TIMEOUT = 20 * 60


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
    """Bare file name -> save under <project root>/wan-output/ so it's easy to find; else use the given path."""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "wan-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def media_source(src):
    """Asset inputs: pass URLs / data: through as-is; encode local files as base64 data URIs (verified on both series)."""
    if src.startswith(("http://", "https://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"Asset file not found: {src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp", "mp4": "video/mp4",
            "mov": "video/quicktime"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None, extra_headers=None):
    """The gateway labels responses content-encoding: gzip without compressing them — Accept-Encoding: identity is required."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers,
                                 method="POST" if body is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Request failed HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """Download the result video: it's a signed OSS URL — NEVER send the Authorization header (403 if you do)."""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)
    return os.path.getsize(path)


def detect_mode(args):
    if args.video:
        return "edit"
    if args.image:
        return "i2v"
    if args.ref_image or args.ref_video:
        return "r2v"
    return "t2v"


def build_media(args, mode):
    media = []
    if mode == "i2v":
        media.append({"type": "first_frame", "url": media_source(args.image)})
    elif mode == "r2v":
        for src in args.ref_image:
            media.append({"type": "reference_image", "url": media_source(src)})
        for src in args.ref_video:
            media.append({"type": "reference_video", "url": media_source(src)})
    elif mode == "edit":
        media.append({"type": "video", "url": media_source(args.video)})
        for src in args.ref_image:
            media.append({"type": "reference_image", "url": media_source(src)})
    return media


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("API key not found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder"
                 " (the token must have the Wan&HappyHorse group enabled, pay-as-you-go billing)")

    parser = argparse.ArgumentParser(description="Wan2.7 / HappyHorse video generation")
    parser.add_argument("prompt", help="prompt (scene + camera + mood; refer to assets as 'image 1 / video 1')")
    parser.add_argument("--model", default="wan", choices=sorted(FAMILY_MODELS),
                        help="wan=Wan2.7 (default, cheaper) / happyhorse=HappyHorse-1.1 (quality-oriented)")
    parser.add_argument("--resolution", default="720P", type=str.upper,
                        choices=("720P", "1080P"), help="resolution, default 720P (note: no 480P)")
    parser.add_argument("--ratio", default=None, choices=RATIOS,
                        help="aspect ratio (ignored with a first-frame image; undocumented for happyhorse — sent only when passed)")
    parser.add_argument("--duration", type=int, default=5,
                        help="duration 2-15 integer seconds, default 5; capped at 10 with reference videos; edit mode follows the source")
    parser.add_argument("--negative", help="negative prompt (things to avoid, under 500 chars)")
    parser.add_argument("--no-prompt-extend", action="store_true",
                        help="disable prompt auto-expansion (on by default; helps short prompts)")
    parser.add_argument("--seed", type=int, default=None, help="random seed, for reproducibility")
    parser.add_argument("-i", "--image", help="first-frame image (local path or URL); enables image-to-video")
    parser.add_argument("--ref-image", action="append", default=[],
                        help="reference image, repeatable (wan: 5 combined with videos; happyhorse: up to 9)")
    parser.add_argument("--ref-video", action="append", default=[],
                        help="reference video URL, repeatable (wan only)")
    parser.add_argument("--video", help="video to edit (URL; edit mode, requires --ref-image)")
    parser.add_argument("-o", "--out", default="output.mp4", help="output file name")
    args = parser.parse_args()

    if args.image and (args.ref_image or args.ref_video):
        sys.exit("First-frame mode (-i) and reference mode (--ref-image/--ref-video) are mutually exclusive.")
    if args.video and args.image:
        sys.exit("Video-edit mode (--video) and first-frame mode (-i) are mutually exclusive.")
    if args.video and not args.ref_image:
        sys.exit("Video-edit mode needs at least 1 reference image (--ref-image).")
    if args.model == "happyhorse" and args.ref_video:
        sys.exit("happyhorse does not support reference videos (--ref-video); wan only.")
    n_refs = len(args.ref_image) + len(args.ref_video)
    if n_refs > MAX_REFS[args.model]:
        sys.exit(f"{args.model} allows at most {MAX_REFS[args.model]} reference assets, got {n_refs}.")
    if not 2 <= args.duration <= 15:
        sys.exit("Duration must be an integer of 2-15 seconds.")
    if args.ref_video and args.duration > 10:
        sys.exit("Duration is capped at 10 seconds when reference videos are included.")

    mode = detect_mode(args)
    model = FAMILY_MODELS[args.model][mode]

    input_part = {"prompt": args.prompt}
    if args.negative:
        input_part["negative_prompt"] = args.negative
    media = build_media(args, mode)
    if media:
        input_part["media"] = media

    parameters = {
        "resolution": args.resolution,
        "duration": args.duration,
        "prompt_extend": not args.no_prompt_extend,
    }
    if args.ratio:
        parameters["ratio"] = args.ratio
    if args.seed is not None:
        parameters["seed"] = args.seed

    body = {"model": model, "input": input_part, "parameters": parameters}

    try:
        resp = api_request(CREATE_URL, api_key, body,
                           extra_headers={"X-DashScope-Async": "enable"})
    except (RuntimeError, OSError) as e:
        sys.exit(f"Submission failed: {e}")
    task_id = (resp.get("output") or {}).get("task_id") or resp.get("task_id")
    if not task_id:
        sys.exit(f"Submission failed, response: {json.dumps(resp, ensure_ascii=False)[:500]}")
    print(f"Task submitted model={model} task_id={task_id}; generation usually takes 2-5 minutes, polling...")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(TASK_URL.format(task_id), api_key)
        except (RuntimeError, OSError) as e:  # network hiccups don't stop the poll loop
            print(f"  poll error (continuing): {e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = str(task.get("status", "unknown")).lower()
        progress = task.get("progress", "")
        elapsed = round(time.time() - t0)
        # progress often sits at 30 (upstream only reports 0/10/30/100) — it is not stuck
        print(f"  [{elapsed:>4}s] status={status}" + (f" progress={progress}" if progress != "" else ""))
        if status in ("completed", "failed"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"Polling timed out ({POLL_TIMEOUT}s). The task is still server-side; query it later:\n"
                     f"  GET {TASK_URL.format(task_id)}")
        time.sleep(POLL_INTERVAL)

    if status != "completed":
        err = task.get("error") or task.get("fail_reason") or task
        sys.exit(f"Generation failed (status={status}): {json.dumps(err, ensure_ascii=False)[:500]}"
                 "\n(failed tasks are never billed)")

    result_url = task.get("result_url")
    if not result_url:
        sys.exit(f"Task completed but no video URL returned: {json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(result_url, path)
    print(f"Video saved to {path} ({size / 1e6:.1f} MB, {round(time.time() - t0)}s elapsed, "
          f"model {model})")


if __name__ == "__main__":
    main()
```

## Как переключить серию

Переключение серии — **это просто `--model`**; скрипт выводит идентификатор модели из «series × asset type»:

```text theme={null}
... wan_video.py "prompt"                        # default wan (Wan2.7 series)
... wan_video.py "prompt" --model happyhorse     # HappyHorse-1.1 series
```

<Info>
  **Таблица вывода идентификатора модели** (запоминать не нужно — скрипт выбирает автоматически):

  | Передаваемые вами ресурсы     | Режим              | wan                | happyhorse                  |
  | ----------------------------- | ------------------ | ------------------ | --------------------------- |
  | только prompt                 | text-to-video      | `wan2.7-t2v`       | `happyhorse-1.1-t2v`        |
  | `-i` первый кадр              | image-to-video     | `wan2.7-i2v`       | `happyhorse-1.1-i2v`        |
  | `--ref-image` / `--ref-video` | reference-to-video | `wan2.7-r2v`       | `happyhorse-1.1-r2v`        |
  | `--video` + `--ref-image`     | video editing      | `wan2.7-videoedit` | `happyhorse-1.0-video-edit` |
</Info>

## Входные данные Asset: локальные изображения работают сразу (проверено)

В официальной документации сказано, что media должны быть общедоступными по https URL, но наши тесты показывают, что обе серии **принимают base64 data URI** — поэтому скрипт автоматически преобразует локальные изображения, и `-i photo.jpg` или `--ref-image role.png` с локальным путём работают сразу, без необходимости в image host. Для видео-asset (`--ref-video` / `--video`) по-прежнему рекомендуются публичные URL: base64-кодирование увеличивает размер больших файлов примерно на треть и может превысить лимиты запроса.

## Ожидайте 2–5 минут (важно)

Генерация видео — это **асинхронная задача**:

* Скрипт оборачивает весь процесс: отправка (с заголовком `X-DashScope-Async`) → опрос каждые 8 секунд → автоматическая загрузка mp4 при успехе. **Клип 720P/5s занимает примерно 45–155 секунд от начала до конца (измерено)**; 1080P или более длинный может превысить 5 минут.
* Значение `progress`, **застывшее на 30% надолго, — это нормально** (upstream сообщает только 0/10/30/100) — задача не зависла.
* **Дайте команде большой таймаут (600+ секунд) или запустите её в фоне** — многие агенты завершают команды по умолчанию через 2 минуты, ещё до того, как видео будет готово. Это прямо указывает `SKILL.md`.
* Если опрос когда-либо завершится таймаутом (20 минут), задача всё ещё находится на стороне сервера; скрипт выводит `task_id` и команду для запроса. **Неудачные задачи никогда не тарифицируются**; повторные отправки тарифицируются дважды, поэтому скрипт никогда не выполняет автоматический повтор.

## Почему одно предложение генерирует видео

Частый вопрос: я никогда не вводил команду — как тогда «сделай видео» создало ролик?

Вот как это работает: при запуске агент **читает описание каждого навыка в его `description`** (в его `SKILL.md`) — это короткий фрагмент метаданных, который сообщает, «что делает этот навык и когда его использовать». Когда ваш запрос **соответствует** этому описанию (например, «сгенерируй/сделай видео», «анимируй это изображение», «отредактируй этот ролик»), агент **сам решает вызвать навык**, читает полный `SKILL.md` и запускает скрипт — вам не нужно запоминать команду.

Если вы не хотите полагаться на догадки агента, используйте **явный вызов** ниже для **полного контроля**.

## Как использовать

### Естественный язык (неявный триггер)

После установки просто говорите с вашим агентом:

| Вы говорите                                                                  | Поведение навыка                                                           |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| "Сгенерируйте видео дождливой улицы Токио ночью"                             | по умолчанию `wan` / 720P / 5 s                                            |
| "Превратите этот постер в видео с движением"                                 | добавляет `-i poster.png`, локальное изображение автоматически загружается |
| "Используйте модель более высокого качества в 1080P"                         | добавляет `--model happyhorse --resolution 1080P`                          |
| "Заставьте персонажа с изображения 1 пробежать через сцену на изображении 2" | добавляет два `--ref-image`, референс-к-видео                              |
| "Замените человека в этом видео на этого персонажа"                          | добавляет `--video` + `--ref-image`, редактирование видео                  |

### Явный вызов (больше контроля)

* **Агенты с slash-командами** (например, Claude Code):

  ```text theme={null}
  /wan Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **Любой агент / попросите его запустить скрипт напрямую** (самый универсальный вариант):

  ```text theme={null}
  Run python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## Куда сохраняется сгенерированное видео

* При указании только имени файла для `-o` (например, `-o cat.mp4`) видео попадает в папку `wan-output/` в корне проекта (создаётся автоматически); обе серии используют эту папку.
* «Корень проекта» = первая директория, в которой есть `.git` или `.claude`, найденная при подъёме по каталогам от скрипта — где бы ни запускался агент, видео остаётся в вашем проекте и не теряется во временной папке.
* После завершения скрипт выводит одну строку с полным абсолютным путём, а также размер файла и затраченное время, например `Video saved to /Users/you/project/wan-output/tokyo.mp4 (4.9 MB, 153s elapsed, model wan2.7-t2v)`.
* Полученные файлы поставляются с аудиодорожкой (stereo AAC).
* URL результата истекает через 24 часа, поэтому скрипт всегда сначала скачивает файл — локальный mp4 и есть конечный результат; никогда не оставляйте URL в качестве результата.
* При указании пути с каталогами (например, `-o videos/cat.mp4` или абсолютного пути) он сохраняет файл именно туда, минуя `wan-output/`.

## Связанные документы

* [Обзор генерации видео Wan](/ru/api-capabilities/wan/overview) (модели, тарификация, группы)
* [API-справочник Wan2.7 Text-to-Video](/ru/api-capabilities/wan/text-to-video)
* [API-справочник Wan2.7 Reference-to-Video](/ru/api-capabilities/wan/reference-to-video)
* [Навык видео-агента HappyHorse](/ru/api-capabilities/happyhorse/skills) (вспомогательная страница с отличиями)
* [Навык видео-агента Seedance 2.0](/ru/api-capabilities/seedance2/skills) (родственный раздел на стороне Volcengine)
