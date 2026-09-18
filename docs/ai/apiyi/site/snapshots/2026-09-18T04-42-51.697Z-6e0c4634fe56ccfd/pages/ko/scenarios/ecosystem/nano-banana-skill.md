> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 이미지 생성 스킬

> APIYI의 Nano Banana Pro로 구동되는, Codex CLI, OpenCode, Gemini CLI, Cursor 등에서 자연어로 이미지를 생성하고 편집하는 커뮤니티 오픈소스 AI Agent 스킬입니다.

## 개요

nano-banana-pro-image-gen은 커뮤니티가 기여한 오픈소스 AI 에이전트 스킬로, **Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp** 등에서 단 하나의 자연어 명령만으로 이미지를 생성하고 편집할 수 있게 해줍니다. APIYI를 통해 Nano Banana Pro 모델을 호출하므로 복잡한 설정이 필요하지 않으며, 설치만 하면 바로 사용할 수 있습니다.

<Info>
  **프로젝트 정보**

  * 🔗 소스 코드: `github.com/wuchubuzai2018/expert-skills-hub`
  * 🌐 스킬 페이지: `skills.sh/wuchubuzai2018/expert-skills-hub/nano-banana-pro-image-gen`
  * 👤 작성자: wuchubuzai2018
  * ⭐ 커뮤니티 기여
</Info>

## 이 스킬이 필요한 이유

<CardGroup cols={2}>
  <Card title="한 줄 이미지 생성" icon="wand-sparkles">
    AI 코딩 어시스턴트 안에서 자연어로 설명하면 에디터를 벗어나지 않고도 고품질 이미지를 즉시 생성합니다
  </Card>

  <Card title="이미지 편집" icon="square-pen">
    기존 이미지를 전달하여 편집할 수 있으며, 최대 14장의 참고 이미지를 사용해 스타일 전이와 콘텐츠 수정을 지원합니다
  </Card>

  <Card title="다중 플랫폼" icon="puzzle">
    Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp 등과 함께 사용할 수 있습니다
  </Card>

  <Card title="유연한 출력" icon="sliders-horizontal">
    10가지 종횡비 + 3단계 해상도(1K/2K/4K)로 빠른 미리보기부터 고해상도 포스터까지 모두 지원합니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델 이름           | 모델 ID                        | 사용 방식                | API 문서                                          |
| --------------- | ---------------------------- | -------------------- | ----------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 텍스트-투-이미지, 이미지-투-이미지 | [문서 보기](/en/api-capabilities/nano-banana-image) |

<Tip>
  이 Skill은 Nano Banana Pro 모델을 사용합니다. 또한 Nano Banana 2를 사용해 더 빠른 속도와 더 낮은 비용을 원하신다면, [Nano Banana ComfyUI Nodes](/ko/scenarios/ecosystem/nano-banana-comfyui)를 확인해 보십시오. 이 노드는 두 모델을 모두 지원합니다.
</Tip>

## 이미지 생성 빠른 시작: 3단계

<Steps>
  <Step title="1단계: APIYI 키 받기">
    1. [APIYI 콘솔](https://api.apiyi.com)에 방문하여 회원가입/로그인하십시오
    2. Token 섹션으로 이동하여 새 API 키를 생성하십시오
    3. 키를 복사하십시오(`sk-`로 시작합니다)

    <Info>
      새 사용자에게는 무료 체험 크레딧이 제공되며, Nano Banana 이미지 생성을 경험하기에 충분합니다.
    </Info>
  </Step>

  <Step title="2단계: 스킬 설치">
    터미널에서 다음 명령을 실행하십시오:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill nano-banana-pro-image-gen
    ```

    <Warning>
      Node.js가 필요합니다. 설치되어 있지 않으면 `nodejs.org`에 방문하여 다운로드하십시오. Python은 대체 런타임으로 사용할 수 있습니다.
    </Warning>
  </Step>

  <Step title="3단계: API 키 설정">
    환경 변수를 설정하십시오:

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Windows PowerShell 사용자의 경우:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```

    <Tip>
      매번 설정하지 않도록 환경 변수를 `~/.zshrc` 또는 `~/.bashrc`에 추가하십시오.
    </Tip>
  </Step>
</Steps>

설정이 완료되었습니다! 이제 Skills와 호환되는 모든 AI 코딩 도구에서 이미지 생성을 직접 사용할 수 있습니다.

## 실습 튜토리얼

### 사용법 1: 명령줄 텍스트-투-이미지

가장 직접적인 방법입니다. 터미널에 설명을 입력하여 이미지를 생성합니다.

<CodeGroup>
  ```bash Node.js (Recommended) theme={null}
  node scripts/generate_image.js \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```

  ```bash Python theme={null}
  python scripts/generate_image.py \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```
</CodeGroup>

### 사용법 2: 기존 이미지 편집

하나 이상의 참조 이미지를 전달하고 원하는 수정 사항을 자연어로 설명합니다.

```bash theme={null}
node scripts/generate_image.js \
  -p "Convert this photo to Studio Ghibli animation style, keep the character composition" \
  -i "photo.jpg" \
  -f "ghibli-style.png" \
  -r 2K
```

여러 참조 이미지를 지원합니다(최대 14개). Base64로 자동 변환됩니다:

```bash theme={null}
node scripts/generate_image.js \
  -p "Merge these elements into a poster" \
  -i "bg.jpg" -i "logo.png" -i "text.png" \
  -f "poster.png" \
  -a 3:4 \
  -r 4K
```

### 사용법 3: AI 코딩 어시스턴트 내부에서

Skill을 설치한 후, 지원되는 AI 코딩 도구에서 자연어 명령을 사용합니다:

* **Codex CLI / OpenCode**: "4K 해상도의 16:9 사이버펑크 도시 풍경 배경화면을 생성"
* **Cursor**: "제품 로고를 생성, 미니멀 스타일, 1:1 비율"
* **Gemini CLI**: "input.jpg를 편집하고, 배경을 석양이 지는 해변으로 변경"

AI 어시스턴트가 자동으로 Skill을 호출하여 이미지를 생성합니다.

## 명령 매개변수

| 매개변수             | 단축   | 필수  | 설명                            | 예시               |
| ---------------- | ---- | --- | ----------------------------- | ---------------- |
| `--prompt`       | `-p` | 예   | 이미지 설명 또는 편집 지시사항             | `"a cat"`        |
| `--filename`     | `-f` | 아니오 | 출력 파일 경로(생략하면 자동 생성됩니다)       | `"output.png"`   |
| `--aspect-ratio` | `-a` | 아니오 | 가로세로 비율                       | `16:9`           |
| `--resolution`   | `-r` | 아니오 | 해상도(대문자여야 합니다)                | `1K`, `2K`, `4K` |
| `--input-image`  | `-i` | 아니오 | 입력 이미지 경로(여러 개 지정 가능, 최대 14개) | `"photo.jpg"`    |
| `--key`          | `-k` | 아니오 | 인라인 API Key(환경 변수 사용 권장)      | `"sk-xxx"`       |

### 지원되는 가로세로 비율

`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`

### 해상도 및 처리 시간

| 해상도      | 대략 시간   | 적합한 용도        |
| -------- | ------- | ------------- |
| 1K       | 약 30초   | 빠른 미리보기, 테스트  |
| 2K (기본값) | 1-4분    | 일상 사용, 소셜 미디어 |
| 4K       | 더 오래 걸림 | HD 포스터, 인쇄물   |

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="설치 오류입니까?">
    다음을 확인하십시오:

    1. Node.js가 설치되어 있습니다(확인하려면 `node -v`를 실행하십시오)
    2. 네트워크 연결이 정상입니다
    3. npx를 사용할 수 없으면 저장소를 수동으로 클론하십시오:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    그런 다음 `skills/nano-banana-pro-image-gen` 디렉터리를 Skills 폴더로 복사합니다.
  </Accordion>

  <Accordion title="API Key가 유효하지 않습니까?">
    다음을 확인하십시오:

    1. `APIYI_API_KEY` 환경 변수가 올바르게 설정되어 있으며(`sk-`로 시작해야 합니다)
    2. APIYI 계정의 잔액이 충분합니다
    3. `-k` 파라미터를 사용하여 키를 직접 전달하는 방식으로도 테스트할 수 있습니다
  </Accordion>

  <Accordion title="Resolution 파라미터가 작동하지 않습니까?">
    Resolution은 **대문자**여야 합니다: `1K`, `2K`, `4K`. 소문자 `1k`, `2k`는 인식되지 않습니다.
  </Accordion>

  <Accordion title="이미지 생성이 느립니까?">
    * 4K 해상도는 본질적으로 더 긴 처리가 필요합니다(5분을 초과할 수 있습니다)
    * 먼저 1K 해상도로 프롬프트와 구성을 테스트하십시오
    * 만족하면 최종 버전에서 2K 또는 4K로 전환하십시오
  </Accordion>

  <Accordion title="APIYI API Key는 어떻게 발급받습니까?">
    [APIYI 콘솔](https://api.apiyi.com/token)을 방문하여 계정을 등록하고 Token 섹션에서 새 키를 생성하십시오. 신규 사용자는 무료 체험 크레딧을 받습니다.
  </Accordion>

  <Accordion title="어떤 AI 코딩 도구를 지원합니까?">
    현재 다음에 맞게 적용되어 있습니다: Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp. Skills 프로토콜을 지원하는 모든 도구가 사용할 수 있습니다.
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="Nano Banana Pro 문서" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Nano Banana Pro 전체 API 문서와 요금 정보를 확인
  </Card>

  <Card title="APIYI GPT-이미지 2 스킬(같은 작성자)" icon="puzzle" href="/ko/scenarios/ecosystem/apiyi-gpt-image-skills">
    wuchubuzai2018의 자매 스킬로, `gpt-image-2` / `gpt-image-2-all`용입니다
  </Card>

  <Card title="Nano Banana ComfyUI 노드" icon="workflow" href="/ko/scenarios/ecosystem/nano-banana-comfyui">
    ComfyUI에서 Nano Banana 이미지 생성을 사용합니다
  </Card>

  <Card title="이미지 실패 문제 해결" icon="circle-question-mark" href="/ko/faq/nano-banana-image-failure">
    Nano Banana 이미지 생성 문제 해결 가이드
  </Card>

  <Card title="APIYI - Token 관리" icon="settings" href="https://api.apiyi.com/token">
    API 키를 관리하고 사용량과 잔액을 확인합니다
  </Card>
</CardGroup>
