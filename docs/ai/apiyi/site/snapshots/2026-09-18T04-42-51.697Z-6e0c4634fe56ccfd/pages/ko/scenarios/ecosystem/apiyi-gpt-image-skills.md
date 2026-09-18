> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI GPT-Image 2 이미지 생성 스킬

> 커뮤니티가 기여한 듀얼 스킬 팩: 단일 문장으로 Codex CLI, Cursor, Gemini CLI 및 기타 AI 코딩 도구에서 공식 gpt-image-2와 리버스 gpt-image-2-all을 호출합니다.

## 개요

`apiyi-gpt-image-2-gen`과 `apiyi-gpt-image-2-all-gen`은 커뮤니티 사용자 wuchubuzai2018이 기여한 두 개의 오픈소스 AI 에이전트 스킬입니다. 이를 통해 APIYI의 두 OpenAI GPT 이미지 모델 — **공식 `gpt-image-2`**(세밀한 제어, token 기반 과금, 4K)와 **리버스 `gpt-image-2-all`**(대화형, 호출당 과금, ChatGPT와의 동등한 경험) — 을 **Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp** 및 모든 Skills 호환 도구에서 단일 자연어 prompt로 직접 호출할 수 있습니다.

<Info>
  **프로젝트 정보**

  * 🔗 소스: `github.com/wuchubuzai2018/expert-skills-hub`
  * 📦 스킬 ID: `apiyi-gpt-image-2-gen` (공식), `apiyi-gpt-image-2-all-gen` (리버스)
  * 👤 작성자: wuchubuzai2018
  * ⭐ 커뮤니티 기여작이며, 작성자의 [Nano Banana Pro 이미지 생성 스킬](/ko/scenarios/ecosystem/nano-banana-skill)과 같은 저장소를 공유합니다
</Info>

<Tip>
  **어떤 스킬을 선택해야 합니까?**

  * **`apiyi-gpt-image-2-gen` (공식, 권장)**: 제어 가능한 `size / quality / output-format / compression`, 4K(3840×2160), 사용자 지정 크기, 의미 기반 편집을 지원합니다. token 기반 과금이 적용되며, 품질이나 크기 요구사항이 명확할 때 가장 적합합니다
  * **`apiyi-gpt-image-2-all-gen` (리버스)**: `prompt`만 필요하며 선택적으로 `response-format`를 추가할 수 있습니다. 크기/비율은 prompt에 설명합니다. 호출당 과금(\$0.03/회)이 적용되며, ChatGPT 웹 경험과 동등합니다. 자연어 기반 직접 출력, 뛰어난 텍스트 렌더링, 반복 편집에 가장 적합합니다
  * 전체 비교: [공식 vs 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="한 문장 이미지 생성" icon="wand-sparkles">
    AI 코딩 어시스턴트 안에서 중국어나 영어로 바로 설명하면 이미지를 받아볼 수 있습니다
  </Card>

  <Card title="듀얼 모델 지원" icon="layers">
    공식 `gpt-image-2`와 역방향 `gpt-image-2-all`를 모두 사용할 수 있습니다 — 상황에 따라 선택하십시오
  </Card>

  <Card title="4K + 사용자 지정 크기 (공식)" icon="image">
    공식 Skill은 1024², 1536×1024, 2048², **3840×2160** 프리셋과 사용자 지정 크기를 지원합니다
  </Card>

  <Card title="품질 / 형식 제어 (공식)" icon="sliders-horizontal">
    `quality` (낮음 / 중간 / 높음 / 자동) + 출력 형식 (png / jpeg / webp) + 압축 0-100
  </Card>

  <Card title="최대 5장의 참조 이미지" icon="images">
    두 기능 모두 다중 이미지 융합과 스타일 전이를 위해 최대 5장의 중첩된 참조 이미지를 지원합니다
  </Card>

  <Card title="다중 도구 호환" icon="puzzle">
    Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp에서 작동합니다
  </Card>

  <Card title="Node.js + Python 런타임" icon="terminal">
    `generate_image.js`와 `generate_image.py`를 모두 제공합니다
  </Card>

  <Card title="간편한 설정" icon="key">
    `APIYI_API_KEY`를 한 번만 설정하고, 임시 재정의에는 `-k`를 사용합니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델                    | Model ID          | 스킬                          | 과금              | API 문서                                              |
| --------------------- | ----------------- | --------------------------- | --------------- | --------------------------------------------------- |
| GPT-Image 2 (공식, 권장)  | `gpt-image-2`     | `apiyi-gpt-image-2-gen`     | 토큰 기준 과금        | [보기](/ko/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (역방향) | `gpt-image-2-all` | `apiyi-gpt-image-2-all-gen` | \$0.03 per call | [보기](/ko/api-capabilities/gpt-image-2-all/overview) |

## 빠른 시작: 3단계

<Steps>
  <Step title="단계 1: APIYI 키를 가져오기">
    1. [APIYI 콘솔](https://api.apiyi.com)에 방문하여 로그인합니다
    2. **Tokens**에서 새 키를 생성합니다(`sk-`로 시작함)
    3. 권장: 사용 한도가 있는 전용 키를 생성합니다

    <Info>
      신규 사용자는 무료 체험 크레딧을 받습니다 — 두 GPT 이미지 모델을 모두 시험해 볼 수 있을 만큼 충분합니다.
    </Info>
  </Step>

  <Step title="단계 2: 스킬을 설치합니다 — 하나를 선택하거나 둘 다 설치합니다">
    **공식 `gpt-image-2` (권장)**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-gen
    ```

    **리버스 `gpt-image-2-all`**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-all-gen
    ```

    <Warning>
      Node.js가 필요합니다. Python 스크립트는 대체 런타임으로 사용할 수 있습니다. Node.js가 설치되어 있지 않다면 `nodejs.org`에서 설치하시면 됩니다.
    </Warning>
  </Step>

  <Step title="단계 3: API 키를 구성합니다">
    환경 변수를 설정합니다(`~/.zshrc` / `~/.bashrc`에 영구 설정하는 것을 권장합니다):

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Windows PowerShell:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```
  </Step>
</Steps>

완료되었습니다! 이제 Skills 호환 AI 코딩 도구라면 자연어로 두 스킬을 호출할 수 있습니다.

## 명령줄 매개변수

### `apiyi-gpt-image-2-gen` (공식)

| 매개변수                   | 단축   | 필수  | 설명                                                                                                             | 예시                         |
| ---------------------- | ---- | --- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `--prompt`             | `-p` | 예   | 생성 prompt 또는 편집 지시사항                                                                                           | `"An orange cat on grass"` |
| `--filename`           | `-f` | 아니오 | 출력 경로(생략 시 자동으로 타임스탬프가 추가됩니다)                                                                                  | `"cat.png"`                |
| `--size`               | `-s` | 아니오 | 프리셋(`1024x1024` / `1536x1024` / `1024x1536` / `2048x2048` / `2048x1152` / `3840x2160` / `2160x3840`) 또는 사용자 지정 | `"2048x1152"`              |
| `--quality`            | `-q` | 아니오 | `low` / `medium` / `high` / `auto`                                                                             | `"high"`                   |
| `--output-format`      | `-o` | 아니오 | `png` (기본값) / `jpeg` / `webp`                                                                                  | `"webp"`                   |
| `--output-compression` | `-c` | 아니오 | 0-100 (jpeg / webp only)                                                                                       | `80`                       |
| `--input-image`        | `-i` | 아니오 | 참조 이미지, 최대 5개                                                                                                  | `"portrait.png"`           |
| `--api-key`            | `-k` | 아니오 | 한 번의 호출에 대해 환경 변수를 재정의                                                                                         | `"sk-xxx"`                 |

**지원되는 가로세로 비율**: `1:1`, `3:2`, `2:3`, `16:9`, `9:16`, 그리고 3:1 이내의 모든 사용자 지정 비율입니다.

**사용자 지정 크기 제약**: 각 변은 3840px 이하여야 하며, 두 차원 모두 16으로 나누어떨어져야 하고, 총 픽셀 수는 655,360에서 8,294,400 사이여야 합니다.

**일반적인 지연 시간**: 요청당 120–150초입니다(복잡한 4K 장면은 더 오래 걸립니다).

### `apiyi-gpt-image-2-all-gen` (역방향)

| 매개변수                | 단축   | 필수  | 설명                                           | 예시                                 |
| ------------------- | ---- | --- | -------------------------------------------- | ---------------------------------- |
| `--prompt`          | `-p` | 예   | 대화형 prompt(크기/비율은 prompt 안에 설명됨)             | `"widescreen 16:9 cyberpunk city"` |
| `--filename`        | `-f` | 아니오 | 출력 경로(생략 시 자동으로 타임스탬프가 추가된 PNG)              | `"city.png"`                       |
| `--response-format` | `-r` | 아니오 | `url`(기본값, R2 CDN에서 약 24시간 유효) 또는 `b64_json` | `"b64_json"`                       |
| `--input-image`     | `-i` | 아니오 | 참조 이미지, 최대 5개                                | `"ref.png"`                        |
| `--api-key`         | `-k` | 아니오 | 한 번의 호출에 대해 환경 변수를 재정의                       | `"sk-xxx"`                         |

<Info>
  reverse 기능은 `size` / `quality` / `aspect_ratio` CLI 플래그를 허용하지 않습니다 — 그 모든 내용을 prompt에 설명하십시오(예: `"vertical 9:16 mobile poster"`, `"1024x1024 square"`). 지연 시간: 60–300초.
</Info>

## 사용 예시

### 예시 1: 정밀 제어가 가능한 공식 텍스트-투-이미지

```bash theme={null}
node scripts/generate_image.js \
  -p "Cinematic product shot of a minimalist ceramic teacup, soft morning light, 35mm lens" \
  -f "teacup.png" \
  -s "3840x2160" \
  -q "high" \
  -o "png"
```

### 예시 2: 공식 이미지 편집(참조 이미지)

```bash theme={null}
node scripts/generate_image.js \
  -p "replace the background with a sunset beach, keep the subject intact" \
  -i "portrait.png" \
  -f "portrait-beach.jpg" \
  -s "2048x1152" \
  -q "high" \
  -o "jpeg" \
  -c 85
```

### 예시 3: 공식 다중 이미지 융합

```bash theme={null}
node scripts/generate_image.js \
  -p "put the person from img 1 into the scene from img 2, lighting style from img 3" \
  -i person.png scene.png light.png \
  -f merged.png \
  -q high
```

### 예시 4: 역방향 대화식(prompt로 크기 지정)

```bash theme={null}
node scripts/generate_image.js \
  -p "widescreen 16:9 cinematic frame: a girl in hanfu under cherry blossoms, watercolor style, soft light" \
  -f "sakura.png" \
  -r url
```

### 예시 5: AI 코딩 도구에서 호출하기

설치한 후에는 Cursor / Codex CLI 등에서 어시스턴트에게 다음과 같이 요청하기만 하면 됩니다:

* "apiyi-gpt-image-2-gen을 사용해 3840x2160 고화질 사이버펑크 도시 배경화를 생성해 주세요"
* "apiyi-gpt-image-2-all-gen을 호출해 photo.jpg를 Studio Ghibli 스타일로 변환해 주세요"
* "공식 스킬을 사용해 1:1 로고를 고화질, webp 형식으로 생성해 주세요"

어시스턴트가 적절한 스킬을 선택하고 CLI 플래그를 알아서 구성해 줍니다.

## FAQ

<AccordionGroup>
  <Accordion title="어떤 스킬을 선택해야 합니까?">
    * **정확한 크기**(예: 3840×2160), **품질 단계**(low/medium/high), 또는 **특정 출력 형식**(webp / compression)이 필요하면 → \*\*공식 `apiyi-gpt-image-2-gen`\*\*를 선택합니다
    * **ChatGPT 수준의 대화 흐름**, **호출당 고정 요금**(\$0.03), **강력한 텍스트 렌더링**을 선호하고, 크기를 자연어로 표현해도 괜찮다면 → \*\*역방향 `apiyi-gpt-image-2-all-gen`\*\*를 선택합니다
    * 전체 비교: [공식 대 역방향 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="`npx skills` 설치 실패">
    1. Node.js가 설치되어 있는지 확인합니다 (`node -v`)
    2. GitHub에 대한 네트워크 접근을 확인합니다
    3. `npx skills`을 사용할 수 없으면 수동으로 clone합니다:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    그런 다음 `skills/apiyi-gpt-image-2-gen` 또는 `skills/apiyi-gpt-image-2-all-gen` 중 하나를 로컬 Skills 디렉터리로 복사합니다.
  </Accordion>

  <Accordion title="API key 무효 오류">
    1. `APIYI_API_KEY`가 올바르게 설정되어 있는지 확인합니다(`sk-`로 시작해야 함)
    2. 잔액 — [잔액은 충분해 보이는데 호출이 실패합니다](/ko/faq/balance-insufficient)를 참고합니다
    3. 빠른 테스트를 위해 `-k "sk-xxx"`를 인라인으로 전달합니다
  </Accordion>

  <Accordion title="공식 스킬이 사용자 지정 크기를 거부합니다">
    사용자 지정 `size`는 다음을 만족해야 합니다:

    * 각 변은 3840px 이하여야 합니다
    * 두 차원은 모두 16으로 나누어떨어져야 합니다
    * 총 픽셀 수는 655,360에서 8,294,400 사이여야 합니다
      예를 들어, `2048x3072`는 유효하지만, `3000x2000`는 3000이 16으로 나누어떨어지지 않아 거부됩니다.
  </Accordion>

  <Accordion title="역방향 스킬의 URL은 얼마나 오래 유효합니까?">
    역방향 스킬의 기본 R2 CDN URL은 대략 **24시간** 동안 유효합니다. 프로덕션에서는 `-r b64_json`을 전달하여 Base64를 받아 로컬에 저장하거나, 자산을 즉시 다운로드합니다.
  </Accordion>

  <Accordion title="어떤 AI 코딩 도구가 지원됩니까?">
    다음 도구로 테스트했습니다: Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp. Skills 호환 도구라면 무엇이든 작동해야 합니다.
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="gpt-image-2 (공식) 문서" icon="book" href="/ko/api-capabilities/gpt-image-2/overview">
    기본 2K/4K 생성, token별 과금
  </Card>

  <Card title="gpt-image-2-all (역방향) 문서" icon="book" href="/ko/api-capabilities/gpt-image-2-all/overview">
    ChatGPT와 동일한 동작, 호출당 \$0.03
  </Card>

  <Card title="공식 vs 역방향 비교" icon="scale" href="/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17개 차원의 나란한 비교
  </Card>

  <Card title="Nano Banana Pro Skill (same author)" icon="puzzle" href="/ko/scenarios/ecosystem/nano-banana-skill">
    동일한 저장소의 자매 Skill — Gemini 이미지 생성
  </Card>

  <Card title="Luck GPT-Image 2 ComfyUI Nodes" icon="workflow" href="/ko/scenarios/ecosystem/luckgpt2-comfyui">
    동일한 모델, ComfyUI 노드 스타일
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://www.apiyi.com">
    키, 사용량, 채널을 관리합니다
  </Card>
</CardGroup>
