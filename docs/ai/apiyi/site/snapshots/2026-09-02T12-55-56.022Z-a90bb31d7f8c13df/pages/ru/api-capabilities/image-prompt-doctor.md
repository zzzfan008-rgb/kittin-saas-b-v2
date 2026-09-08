> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Навык Image Prompt Doctor

> Упаковывает предварительную проверку prompt перед генерацией в готовый к подключению Agent Skill для Codex, OpenClaw, hermes-agent, Claude Code и других: оценивает prompt по шести элементам, отмечает расплывчатые слова, снижающие качество, и выдает переписанный prompt, который можно использовать как есть. Также может проверить фактический результат по prompt, который его сгенерировал. По умолчанию использует gpt-5.6-luna.

<Note>
  На этой странице вы получаете **готовый к использованию Agent Skill**: выполните проверку prompt **до** генерации, заполните недостающие элементы, уберите расплывчатые слова, которые снижают качество, и сгенерируйте результат по переписанной версии. Всё это — два файла с **нулевой зависимостью от сторонних пакетов**.
</Note>

Когда изображение разочаровывает, проблема обычно в prompt — не в модели и не в канале. Этот skill превращает «слой переписывания» из [Продвинутой генерации изображений](/ru/api-capabilities/image-advanced-workflow) в нечто, что можно встроить в любой coding agent.

## Что делает навык

<CardGroup cols={2}>
  <Card title="Диагностика перед генерацией" icon="clipboard-check">
    По отдельности оценивает объект, окружение, свет, объектив, грейдинг и композицию, выставляет рейтинг от 0 до 100, перечисляет риски и возвращает переписанный prompt, готовый к копированию.
  </Card>

  <Card title="Проверка после генерации" icon="image-off">
    Передайте фактическое изображение вместе с исходным prompt, и модель прочитает его обратно, указывая, **какое предложение prompt не было выполнено**, а также что модель добавила от себя, после чего перепишет текст соответствующим образом.
  </Card>

  <Card title="Советы по целевой модели" icon="git-compare">
    С `-t` оно добавляет примечания, специфичные для этого семейства: ограничения на референсные изображения, поддержку mask и то, как называется параметр разрешения.
  </Card>

  <Card title="Проверки с учётом объекта" icon="layers">
    Портреты получают проверки кожи и освещения, снимки товаров — проверки фона и запрета на текст, а иллюстрация автоматически снижает вес чек-листа фотореализма.
  </Card>
</CardGroup>

## Полная диагностика от начала до конца

Входные данные — это то, что пользователь действительно ввёл бы, плюс изображение, которое получилось:

```bash theme={null}
python3 scripts/prompt_doctor.py "Make me a coffee product shot, make it look nice, make it feel premium" \
  -i result.jpg -t nano-banana -s product
```

<Frame caption="The actual result produced by that casual prompt">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="Изображение кофе по обычному prompt: деревянный стол, кофемолка, мешок из мешковины и другие реквизиты, с вымышленным названием бренда, напечатанным на чашке" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

Результат диагностики (фрагмент реального запуска):

```text theme={null}
[Diagnosis] 18/100 - subject is legible, but with no product-photography constraints the
model expanded the frame into a lifestyle scene

Six elements: subject WEAK  environment MISSING  light MISSING  lens MISSING
              grading WEAK  composition MISSING

Risks:
  - "coffee product shot" never states the product form, material, colour or count, so the
    model invented a latte-art cup on its own.
  - No neutral, controllable background was specified, so the model added a window, a wooden
    table, a grinder, coffee beans, a cloth sack and books - the frame reads as lifestyle
    photography rather than an e-commerce product shot.
  - No key light direction, hardness or fill was given; the result used window light from the
    left with heavy warm shadows, none of it controllable.
  - "look nice" and "feel premium" are abstract quality claims that were never converted into
    a colour temperature, saturation level or photographic medium.
  - The prompt never forbade text, so the model produced "AURA COFFEE ROASTERS" on the cup,
    a plate on the grinder, and "AURA" on the book at lower right - a wrong-brand and
    garbled-text risk for any commercial use.

[Optimized prompt]

An e-commerce product photograph of coffee: the subject is a single matte warm-white ceramic
cup ... (full text omitted)

[Parameter suggestions] size=2K  aspect=1:1; 1:1 suits a square hero image, switch to 4:3 for
a landscape ad and keep the negative space on the right.
```

Если подать этот переписанный prompt обратно в ту же модель (`gemini-3-pro-image`) без изменений:

<Frame caption="Regenerated from the rewritten prompt: a clean, usable e-commerce hero shot">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-prompt-doctor-e2e.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=5ea65d564076d1ce6ed768ff0c7a0e60" alt="Изображение кофе по переписанному prompt: тёпло-белая керамическая чашка для латте на нейтральном светло-сером фоне, чёткое направление света, тень падает назад вправо, нигде нет текста, много свободного пространства" width="1280" height="1280" data-path="images/image-prompt-doctor-e2e.jpg" />
</Frame>

Все реквизиты исчезли, фон стал управляемым нейтральным серым, у тени появилось направление, вымышленное название бренда не возникло, и осталось место для текста. **Модель не изменилась. Изменился только prompt.**

## Когда запускать диагностику

Не каждый запрос требует проверки. Решайте по тому, насколько конкретно уже сформулирован запрос:

| Как выглядит ваш запрос                                                     | Что делать                                                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Непринуждённый, только тема («кадр продукта с кофе, сделайте его красивым») | **Сначала диагностируйте, затем генерируйте** — наибольшая польза                          |
| Вы что-то сгенерировали, и результат сильно далёк от нужного                | **Режим проверки** (`-i` с фактическим результатом), чтобы найти причину                   |
| Положение света, фокусное расстояние и композиция уже заданы                | Пропустите это и генерируйте                                                               |
| Генерируете целую серию в одном стиле                                       | Один раз выполните диагностику, чтобы зафиксировать prompt, затем используйте его повторно |

<Info>
  Этот навык только переписывает prompt; он **не генерирует изображения**. Используйте его вместе с [Навыком Nano Banana Pro](/ru/api-capabilities/nano-banana-image/skills) или [Навыком серии GPT-Image-2](/ru/api-capabilities/gpt-image-2/skills), чтобы получить полный процесс проверки и последующей генерации.
</Info>

## В каких агентах он работает

<Info>
  По сути, Skill — это просто **папка**: один файл сообщает агенту, что это такое (`SKILL.md`), плюс скрипт, который выполняет работу. Поэтому **любой coding agent, который умеет читать локальные файлы и выполнять команды, может использовать его** — Codex, OpenClaw, hermes-agent, Claude Code и другие.

  Единственное требование: на машине, где запущен agent, должны быть **Python 3** и **доступ к сети** (скрипт обращается к `api.apiyi.com` напрямую). Этот skill использует **только стандартную библиотеку Python — ничего не нужно устанавливать через pip**.
</Info>

## Установка в три шага

### 1. Создайте папку и поместите файлы

Создайте папку навыка с этими двумя файлами (полное содержимое в двух разделах ниже):

```
image-prompt-doctor/
├── SKILL.md
├── scripts/
│   └── prompt_doctor.py
└── .env          # created in step 2, holds your key
```

Никакой `pip install` не требуется.

### 2. Добавьте свой ключ рядом с ней

Поместите ваш **APIYI API-ключ** (созданный в консоли `api.apiyi.com`) в `image-prompt-doctor/.env`:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

Скрипт автоматически считывает ключ из этого `.env` — **никакой другой настройки или переменной окружения не требуется**.

<Warning>
  `.env` хранит ваш секрет. Если этот навык распространяется через репозиторий проекта, **добавьте `.env` в `.gitignore` и никогда не включайте его в коммит**.
</Warning>

### 3. Передайте это агенту

* **Агенты с автоматическим обнаружением навыков** (например, Claude Code): поместите всю папку `image-prompt-doctor/` в их каталог навыков — на уровне пользователя в `~/.claude/skills/` или на уровне проекта в `.claude/skills/` (доступно через репозиторий).
* **Любой другой агент**: разместите его в соответствии с собственной схемой для навыков/плагинов этого агента; или, проще всего, — **просто скажите агенту: «прочитайте SKILL.md в этой папке и следуйте ему.»**

Вот и вся установка. Перейдите к [как использовать его](#how-to-use-it) за примерами.

## SKILL.md

Создайте `image-prompt-doctor/SKILL.md` с полным содержимым ниже (`description` содержит «что он делает + когда его использовать», и именно это агент использует для автоматического срабатывания):

````markdown theme={null}
---
name: image-prompt-doctor
description: Diagnose and optimize an image-generation prompt before generating, or review a disappointing result against the prompt that produced it. Use this whenever the user is about to generate an image from a casual or vague prompt, asks why an image came out wrong, or asks to improve/rewrite an image prompt.
allowed-tools: Bash(python3 *)
---

# Image Prompt Doctor

Review the prompt **before** generating: fill in the missing elements, strip the vague words that
drag quality down, and generate with the rewritten version. You can also feed the actual result
back **after** generating so the model can point out which requirement was not executed.

An API call is a single atomic call. The prompt reaches the model verbatim, with none of the
automatic rewriting a web app does for you — so prompt quality decides the hit rate outright.

## When to use it

- The user's request is casual ("a coffee product shot, make it nice") — **diagnose first, then generate**;
- The user says the image is wrong or far off — **use review mode and read the image back**;
- The user directly asks to improve a prompt.

Skip it when the request is already specific (light position, focal length and composition all present) and just generate.

## Two ways to run it

### Option 1: call the script (default, uses gpt-5.6-luna)

```bash
# Диагностика перед генерацией
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "снимок кофейного продукта, сделайте его красивым" -t nano-banana -s product

# Проверка после генерации: передайте фактический результат
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "измените чашку в красной рамке на чёрную, оставьте всё остальное" -i result.png

# JSON для программного использования
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "иллюстрация китайского пейзажа тушью" -s illustration --json
```

Arguments:

- First positional argument: the prompt to diagnose (required).
- `-i / --image`: path to an actual result, repeatable, up to 4; **passing any switches on review mode**.
- `-t / --target`: target image model, one of `nano-banana` / `gpt-image` / `seedream` / `flux` / `grok`; appends notes specific to that family (reference limits, mask support, parameter names). Omit if unsure.
- `-s / --scene`: subject, one of `portrait` / `product` / `scene` / `illustration`; defaults to `auto`. Illustration automatically down-weights the photorealism checks.
- `--model`: the text model used for diagnosis, default `gpt-5.6-luna` (cheap, accepts images). The `APIYI_TEXT_MODEL` environment variable overrides it.
- `--json`: emit raw JSON.

Key: the script reads `APIYI_API_KEY` from a `.env` file in the skill folder, or from an
environment variable of the same name. If it reports "no key found", ask the user to add a line
`APIYI_API_KEY=sk-xxx` to `.env`.

### Option 2: do it yourself (no key, or no appetite for the extra spend)

There is nothing secret in the rubric — apply the standard below directly, with no API call at all.
Keep the output format identical so the user sees the same thing either way.

## The rubric

**Six elements**, each marked OK (clearly stated) / WEAK (mentioned but vague) / MISSING (absent):

| Element | Test |
|---|---|
| Subject | Are material, colour, count and state specific |
| Environment | What the background is, what is sharp and what is blurred |
| Light | Direction, hardness, fill — **there must be one identifiable key light** |
| Lens | Focal length, aperture, camera height, tilt |
| Grading | White balance bias, saturation, film or digital character |
| Composition | Where the subject sits, where the negative space is |

**Risks you must report:**

- **Vague quality words** (8K / ultra HD / ultra detailed / masterpiece / perfect): they add no resolution and push the frame toward an over-sharpened, oversaturated render — the core of the AI look. Recommend deleting them in favour of specific light, lens and medium.
- **Resolution written into the prompt**: has no effect. Resolution comes only from parameters such as `size` / `imageSize`.
- **Several edits crammed into one sentence**: the single-shot hit rate drops sharply; split into rounds and change one class of thing at a time.
- **Pronouns like "this" or "the thing in the red box"**: the most common failure in editing tasks; name the object.
- **No statement about text in the image**: the model will invent brand names and copy, which makes the frame commercially unusable. Either state what text should appear, or forbid text explicitly.
- **Real people, celebrities, copyrighted characters, minors, violence or adult content**: these get blocked upstream; flag them for rewriting first.

**Rewriting principles**: fill in what is missing rather than padding with adjectives; leave anything
the user specified exactly as written; for realism add specific light positions, focal length and
aperture, a medium, and deliberate imperfections (pores, stray hair, wear, water rings) instead of
abstractions like "realistic" or "premium"; do not emit a separate negative-prompt field — write
what to avoid into the prompt body.

## Output and what to do next

Relay the diagnosis to the user faithfully: score, missing elements, risks, the rewritten prompt,
what changed, and the parameter suggestions.

Then **confirm before generating**: a rewrite can shift the intent (turning "coffee" into "a latte",
for instance), so let the user look first. Once they approve, pass the rewritten prompt to a
generation skill such as `nano-banana-pro`, using the `size` / `aspect` from the parameter suggestions.

If the user says "don't ask, just generate", go straight to generation with the rewritten prompt and
hand back the diagnosis summary alongside the image.

## Boundaries

- This skill only rewrites prompts. It **does not generate images**, and it makes no compliance judgment beyond flagging likely moderation blocks.
- A rewritten prompt can still miss on the first try — single-sample variance is inherent to these models. Retry or switch models.
- Anything that can only be fixed by a parameter (resolution, aspect ratio, reference images) is flagged, never written into the prompt body.
````

## scripts/prompt\_doctor.py

Создайте `image-prompt-doctor/scripts/prompt_doctor.py` с полным содержимым ниже (только стандартная библиотека Python, ничего устанавливать не нужно):

````python theme={null}
#!/usr/bin/env python3
"""Image prompt doctor: review a prompt, flag missing elements, return a rewritten version.

Calls a text model through APIYI (default gpt-5.6-luna). Standard library only, no dependencies.
Two modes:
  1) pre-generation diagnosis  -- prompt only
  2) post-generation review    -- prompt plus the actual result, so the model can read it back
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_MODEL = "gpt-5.6-luna"
BASE_URL = "https://api.apiyi.com/v1/chat/completions"
MAX_IMAGES = 4

# Extra notes per target family, appended only when --target is given
TARGET_NOTES = {
    "nano-banana": "Target is Nano Banana (Gemini family): long natural-language sentences work well, "
                   "so write flowing paragraphs rather than keyword piles; up to 14 reference images; "
                   "resolution goes in imageSize (1K/2K/4K) and aspect ratio in aspectRatio.",
    "gpt-image": "Target is the GPT-Image family: strong instruction following and accurate in-image text, "
                 "so specifying exact text is safe; up to 16 reference images; only the official-relay "
                 "gpt-image-2 supports mask inpainting and background=transparent; resolution goes in size.",
    "seedream": "Target is Seedream: strong with Chinese-language briefs; up to 10 reference images "
                "(inputs plus outputs must stay at or below 15); 5.0 and 5.0-pro can be prompted to "
                "return a PNG with a transparent background.",
    "flux": "Target is FLUX: prefers clearly structured description; FLUX.2 pro/max/flex take up to 8 "
            "reference images, Kontext takes 1.",
    "grok": "Target is Grok Imagine: reference images only take effect on /v1/images/edits — passing them "
            "to /v1/images/generations silently discards them and still bills; up to 4 reference images.",
}

SCENE_NOTES = {
    "portrait": "This is a portrait. Check especially: is there one key light with a stated direction and "
                "hardness, are focal length and aperture given, is natural skin requested (pores, fuzz, "
                "shine), is retouching disabled, is the subject moved off dead centre.",
    "product": "This is a product or e-commerce shot. Check especially: is the background specified as "
               "neutral and controllable, are key light and fill written out, is the shadow direction given, "
               "is text and branding explicitly forbidden (otherwise the model invents them), is negative "
               "space left for copy.",
    "scene": "This is an environment. Check especially: specific time and weather, one identifiable key "
             "light, camera height and focal length, whether wear and clutter were added for realism, "
             "whether people are asked not to face the camera.",
    "illustration": "This is illustration, not photorealism. Down-weight the realism checklist and instead "
                    "check: is the style named specifically (medium, brushwork, era, school), the palette, "
                    "the line and colouring method, composition and negative space.",
}

SYSTEM = """You are an image prompt diagnostician serving developers and designers who call image
models directly over an API. An API call is a single atomic call: the prompt reaches the model
verbatim, with none of the automatic rewriting a web app does, so prompt quality decides the hit rate.

## Rubric

First mark each of the six elements ok (clearly stated) / weak (mentioned but vague) / missing:

1 subject: are material, colour, count and state specific
2 environment: what the background is, what is sharp and what is blurred
3 light: direction, hardness, fill -- there must be one identifiable key light
4 lens: focal length, aperture, camera height, tilt
5 tone: white balance bias, saturation, film or digital character
6 composition: where the subject sits in the frame, where the negative space is

## Risks you must report

- Vague quality words such as 8K / ultra HD / ultra detailed / masterpiece / perfect: they add no
  resolution and push the frame toward an over-sharpened, oversaturated render, which is the core of
  the AI look. Always recommend deleting them in favour of specific light, lens and medium.
- Resolution written into the prompt (4K/8K/high definition): no effect. Resolution comes only from
  parameters such as size / imageSize.
- Several unrelated edits crammed into one sentence: the single-shot hit rate drops sharply; split
  into rounds.
- Pronouns such as "this" or "the thing in the red box" instead of naming the object: the most
  common failure in editing tasks.
- No statement about text in the image: the model may invent brand names or copy, which makes the
  frame commercially unusable. Either state what text should appear, or forbid text explicitly.
- Real people, celebrities, copyrighted characters, minors, violence or adult content: these get
  blocked upstream and need rewriting first.

## Rewriting principles

- Fill in what is missing; do not pad the prompt with adjectives to make it longer.
- Leave anything the user specified exactly as written.
- For realism, add specific light positions, focal length and aperture, a film or digital medium, and
  deliberate imperfections (pores, stray hair, wear, water rings) rather than abstractions such as
  "realistic" or "premium".
- Do not emit negative-prompt syntax (most image models have no separate negative prompt field);
  write what to avoid into the prompt body.
- optimized_prompt and changes must use the same language as the user's original prompt.

## Output

Emit exactly this JSON, with no code fence and no extra commentary:

{
  "score": integer 0-100 for how usable this prompt is in a single shot,
  "verdict": "one-line summary, at most 20 words",
  "elements": {"subject":"ok|weak|missing","environment":"...","light":"...","lens":"...","tone":"...","composition":"..."},
  "risks": ["one sentence each, stating the problem and its consequence; empty array if none"],
  "optimized_prompt": "the full rewritten prompt, ready to use as-is",
  "changes": ["what changed and why, one per entry"],
  "suggested_params": {"size":"1K|2K|4K","aspect":"e.g. 1:1 / 16:9","note":"parameter advice, empty string if none"}
}"""

REVIEW_EXTRA = """

## This run is a post-generation review

The user already generated an image from the prompt below; the actual result is attached. Check it
against the prompt line by line: what was honoured, what was not, and what the model added on its
own. In risks, state explicitly which sentence of the prompt was not executed, and rewrite
optimized_prompt to target those deviations rather than generically filling in elements."""


def load_api_key():
    """Prefer the environment variable; otherwise look for .env beside the script or one level up."""
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


def image_data_url(path):
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def build_messages(prompt, images, target, scene):
    system = SYSTEM
    if images:
        system += REVIEW_EXTRA
    extras = [TARGET_NOTES[target]] if target else []
    if scene and scene != "auto":
        extras.append(SCENE_NOTES[scene])
    if extras:
        system += "\n\n## Extra constraints for this run\n\n" + "\n".join("- " + e for e in extras)

    content = [{"type": "text", "text": "Prompt to diagnose:\n\n" + prompt}]
    for path in images:
        content.append({"type": "image_url", "image_url": {"url": image_data_url(path)}})
    return [{"role": "system", "content": system},
            {"role": "user", "content": content}]


def diagnose(api_key, model, messages):
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        BASE_URL, data=payload, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"request failed HTTP {e.code}: {e.read().decode(errors='replace')[:500]}")

    text = resp["choices"][0]["message"]["content"].strip()
    if text.startswith("```"):                      # defensive: some models still wrap in a fence
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise RuntimeError("model did not return valid JSON, raw output:\n" + text[:800])


MARK = {"ok": "OK", "weak": "WEAK", "missing": "MISSING"}
LABEL = {"subject": "subject", "environment": "environment", "light": "light",
         "lens": "lens", "tone": "grading", "composition": "composition"}


def render(r):
    out = [f"[Diagnosis] {r.get('score', '?')}/100 - {r.get('verdict', '')}", ""]
    els = r.get("elements", {})
    out.append("Six elements: " + "  ".join(
        f"{LABEL.get(k, k)} {MARK.get(v, '?')}" for k, v in els.items()))

    risks = r.get("risks") or []
    if risks:
        out += ["", "Risks:"] + [f"  - {x}" for x in risks]
    else:
        out += ["", "Risks: none"]

    out += ["", "[Optimized prompt]", "", r.get("optimized_prompt", "")]

    changes = r.get("changes") or []
    if changes:
        out += ["", "[What changed]"] + [f"  - {x}" for x in changes]

    p = r.get("suggested_params") or {}
    bits = []
    if p.get("size"):
        bits.append(f"size={p['size']}")
    if p.get("aspect"):
        bits.append(f"aspect={p['aspect']}")
    line = "  ".join(bits)
    if p.get("note"):
        line = (line + "; " if line else "") + p["note"]
    if line:
        out += ["", "[Parameter suggestions] " + line]
    return "\n".join(out)


def main():
    parser = argparse.ArgumentParser(description="Diagnose and optimize an image prompt")
    parser.add_argument("prompt", help="the prompt to diagnose")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help=f"path to an actual result, repeatable (up to {MAX_IMAGES}); switches on review mode")
    parser.add_argument("-t", "--target", choices=sorted(TARGET_NOTES),
                        help="target image model, to append notes specific to that family")
    parser.add_argument("-s", "--scene", choices=["auto"] + sorted(SCENE_NOTES), default="auto",
                        help="subject, default auto (no subject-specific checks appended)")
    parser.add_argument("--model", default=os.environ.get("APIYI_TEXT_MODEL", DEFAULT_MODEL),
                        help=f"text model used for diagnosis, default {DEFAULT_MODEL}")
    parser.add_argument("--json", action="store_true", help="emit raw JSON for programmatic use")
    args = parser.parse_args()

    api_key = load_api_key()
    if not api_key:
        sys.exit("no API key found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder, "
                 "or set the environment variable of the same name")

    if len(args.image) > MAX_IMAGES:
        sys.exit(f"at most {MAX_IMAGES} images, got {len(args.image)}")
    for path in args.image:
        if not os.path.exists(path):
            sys.exit(f"image not found: {path}")

    messages = build_messages(args.prompt, args.image, args.target, args.scene)
    try:
        result = diagnose(api_key, args.model, messages)
    except RuntimeError as e:
        sys.exit(str(e))

    print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else render(result))


if __name__ == "__main__":
    main()
````

## Переключение модели диагностики

По умолчанию — `gpt-5.6-luna`: недорогая (\$0.2 на вход / \$1.2 на выход за миллион tokens) и принимает изображения, что необходимо для режима проверки. Есть два способа сменить её:

```bash theme={null}
# Override for one run
... prompt_doctor.py "your prompt" --model gemini-3.5-flash

# Change the default: add a line to image-prompt-doctor/.env
APIYI_TEXT_MODEL=gemini-3.5-flash
```

<Warning>
  На что обратить внимание при переключении: **режиму проверки требуется модель, которая принимает изображения** (текстовая модель выдаст ошибку при прикрепленном изображении) — см. [Понимание изображений](/ru/api-capabilities/vision-understanding) со списком. И скрипт отправляет `response_format: {"type": "json_object"}`, поэтому модель без режима JSON может вместо этого вернуть текст в блоке кода (скрипт на всякий случай удаляет обрамление блока кода, но лучше использовать модель, которая поддерживает режим JSON).
</Warning>

## Почему одна фраза запускает диагностику

Распространённый вопрос: я никогда не вводил команду, так почему фраза «draw me an image» заставила сначала проверить prompt?

Вот как это работает: при запуске агент **читает `description` в каждом `SKILL.md` навыка** — короткий фрагмент метаданных, который говорит, что делает этот навык и когда он применяется. Когда то, что вы говорите, **совпадает** с этим описанием («draw me a …», «why did this image come out wrong», «improve this prompt»), агент **самостоятельно решает вызвать навык**, читает полный `SKILL.md` и запускает скрипт. Вам не нужно запоминать команду.

В SKILL.md также указано, что запрос, который уже достаточно конкретный, не требует такой обработки, поэтому он не будет вмешиваться в каждый prompt. Когда вам нужен **полный контроль**, используйте явный вызов ниже.

## Как использовать

### Естественный язык (неявный триггер)

После установки просто обращайтесь к агенту:

| Вы говорите                                                   | Что делает навык                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| "Нарисуй мне продуктовый кадр с кофе, сделай его красивым"    | Неформальный запрос → диагностирует, сообщает, подтверждает, затем генерирует |
| "Почему это изображение вышло неправильным?" (с изображением) | Режим проверки через `-i`, считывание изображения обратно                     |
| "Улучшите этот prompt"                                        | Только диагностика, без генерации                                             |
| "Сгенерируй с gpt-image-2, но сначала проверь мой prompt"     | Добавляет `-t gpt-image` для заметок, специфичных для семейства               |
| "Пропусти диагностику, просто сгенерируй"                     | Обходит этот навык и вызывает навык генерации                                 |

### Явный вызов (больше контроля)

* **Агенты с slash-командами** (например, Claude Code):

  ```text theme={null}
  /image-prompt-doctor a woman smiling by a cafe window -s portrait
  ```

* **Любой агент / просто скажите ему запустить скрипт** (наиболее универсальный):

  ```text theme={null}
  Run python3 image-prompt-doctor/scripts/prompt_doctor.py "a woman smiling by a cafe window" -s portrait
  ```

## Куда попадает диагностика

* Этот навык **не записывает файлы**. Результат выводится в терминал, а агент пересылает его вам — оценка, оценки по шести элементам, риски, переписанный prompt, что изменилось и рекомендации по параметрам.

* Чтобы передать результат в вашу собственную программу, добавьте `--json`; output — это структурированный объект (`score` / `elements` / `risks` / `optimized_prompt` / `changes` / `suggested_params`), который можно перенаправить в файл:

  ```bash theme={null}
  python3 image-prompt-doctor/scripts/prompt_doctor.py "your prompt" --json > diagnosis.json
  ```

* **Подтвердите переписанный prompt перед использованием**: переписывание может изменить намерение (превратив «кофе» в «латте»), а SKILL.md уже говорит агенту сначала спросить.

* Изображения, переданные в режим review, **никогда не изменяются и не перезаписываются** — это входные данные только для чтения.

## Стоимость

Одна диагностика стоит несколько тысяч token. По прайс-листу `gpt-5.6-luna` это доли цента, тогда как одна генерация качества `high` стоит в десятки раз дороже. **Диагностика перед генерацией позволяет сэкономить больше на избежанных повторных попытках, чем она стоит.**

В режиме Review загружается изображение, и это тарифицируется как input tokens — немного дороже, но всё ещё намного ниже одной генерации.

## Связанная документация

* [Продвинутая генерация изображений: рабочий процесс и реализм](/ru/api-capabilities/image-advanced-workflow) (где этот skill находится во всем pipeline)
* [Как получить нужное изображение](/ru/api-capabilities/image-generation-success-tips) (восстановление одного неудачного вызова)
* [Agent Skill Nano Banana Pro](/ru/api-capabilities/nano-banana-image/skills) (сопутствующий skill генерации, который можно выстроить в цепочку после диагностики)
* [Agent Skill серии GPT-Image-2](/ru/api-capabilities/gpt-image-2/skills) (то же самое, для линейки GPT)
* [GPT-5.6 Luna](/ru/models/gpt-5-6-luna) (модель диагностики по умолчанию: specs, pricing и поддержка endpoint)
