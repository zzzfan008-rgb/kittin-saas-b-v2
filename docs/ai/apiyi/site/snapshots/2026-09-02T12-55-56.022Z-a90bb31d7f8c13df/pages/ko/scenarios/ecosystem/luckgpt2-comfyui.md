> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI 노드

> 커뮤니티에서 기여한 듀얼 노드 팩입니다. ComfyUI에서 gpt-image-2(공식)와 gpt-image-2-all(역방향)을 직접 호출하며, 텍스트-이미지, 참조 이미지 편집, 마스크 인페인팅, 사용자 지정 해상도를 지원합니다.

## 개요

`Comfyui-Luck-gpt2.0`는 커뮤니티 사용자 luckdvr가 기여한 ComfyUI 커스텀 노드 팩입니다. 이를 통해 ComfyUI 안에서 APIYI의 두 GPT 이미지 모델인 \*\*공식 `gpt-image-2`\*\*과 \*\*역공학한 `gpt-image-2-all`\*\*을 직접 호출할 수 있습니다. 두 노드는 역할 분담이 분명합니다. 전자는 세밀한 매개변수(해상도, 품질, 마스크, 다중 참조)에 중점을 두고, 후자는 ChatGPT와의 동등한 대화형 이미지 경험을 제공하며 내장 타임아웃/재시도를 지원합니다. 생산 환경 워크플로에 적합합니다.

<Info>
  **프로젝트 정보**

  * 🔗 소스: `github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 라이선스: Apache-2.0
  * 👤 작성자: luckdvr
  * ⭐ 커뮤니티 기여작이며, APIYI를 위해 제작되었습니다
</Info>

<Tip>
  **작성자의 다른 노드 팩과 어떻게 구분합니까?**

  luckdvr는 APIYI용으로 두 개의 ComfyUI 노드 팩을 기여합니다.

  * **[Luck Nano Banana Pro](/ko/scenarios/ecosystem/lucknanobananapro-comfyui)**: Gemini 계열(`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`)을 호출합니다. 14개의 참조 이미지와 엔지니어링급 재시도/타임아웃을 중점으로 합니다
  * **Luck GPT-Image 2 (이 페이지)**: OpenAI 계열(`gpt-image-2` / `gpt-image-2-all`)을 호출합니다. 이중 엔드포인트 전환(chat\_completions / images\_api)과 마스크 인페인팅을 중점으로 합니다
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="두 노드, 두 경로" icon="layers">
    `Comfyui-Luck gpt-image-2` (공식) 및 `Comfyui-Luck gpt-2.0 all` (역방향) — 상황에 맞는 것을 선택하십시오
  </Card>

  <Card title="참조 이미지 최대 5장" icon="images">
    공식 노드는 복잡한 융합 및 스타일 전이를 위해 최대 5장의 참조 이미지를 허용합니다
  </Card>

  <Card title="마스크 인페인팅" icon="eraser">
    로컬 변경을 위해 편집 영역을 정확히 지정하는 선택적 마스크 입력입니다
  </Card>

  <Card title="다단계 + 사용자 지정 해상도" icon="image">
    1K / 2K / 4K 프리셋과 사용자 지정 크기(각 변 최대 3840px, 총 픽셀 수 655,360–8,294,400)
  </Card>

  <Card title="15개 화면 비율" icon="ratio">
    AUTO, 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, 1:4, 4:1, 1:8, 8:1
  </Card>

  <Card title="품질 및 출력 형식" icon="sliders-horizontal">
    `quality` (자동 / 낮음 / 중간 / 높음) + 출력 형식 (png / jpeg / webp) + 압축 0-100
  </Card>

  <Card title="이중 엔드포인트(역방향 노드)" icon="git-branch">
    `gpt-image-2-all`는 `chat_completions` 및 `images_api` 엔드포인트 간 전환을 지원합니다
  </Card>

  <Card title="내장 타임아웃 및 재시도" icon="refresh-cw">
    타임아웃 및 재시도 매개변수가 내장되어 있어 — 피크 시간대에도 안정적입니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델                    | 모델 ID             | 노드                         | 용도                                          | API 문서                                              |
| --------------------- | ----------------- | -------------------------- | ------------------------------------------- | --------------------------------------------------- |
| GPT-Image 2 (공식)      | `gpt-image-2`     | `Comfyui-Luck gpt-image-2` | 네이티브 2K/4K 텍스트-투-이미지, 레퍼런스 이미지 편집, 마스크 인페인팅 | [보기](/ko/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (역방향) | `gpt-image-2-all` | `Comfyui-Luck gpt-2.0 all` | ChatGPT와 동등한 대화형 이미지 생성, 호출당 과금             | [보기](/ko/api-capabilities/gpt-image-2-all/overview) |

<Info>
  전체 비교는 [gpt-image-2 (공식) vs gpt-image-2-all (역방향) 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)를 참조하십시오.
</Info>

## 노드 매개변수

### `Comfyui-Luck gpt-image-2` (공식)

| 매개변수                  | 유형     | 필수  | 기본값    | 설명                                       |
| --------------------- | ------ | --- | ------ | ---------------------------------------- |
| `api_key`             | string | Yes | -      | APIYI token — 사용 한도가 있는 전용 키를 권장합니다      |
| `prompt`              | string | Yes | -      | 생성 또는 편집 지시                              |
| `image_1` … `image_5` | IMAGE  | No  | -      | 참고 이미지, 최대 5장                            |
| `mask`                | MASK   | No  | -      | 인페인팅용 선택적 마스크(흰색 영역 = 편집 영역)             |
| `size`                | enum   | No  | `2K`   | 출력 해상도(1K / 2K / 4K / custom)            |
| `custom_size`         | string | No  | -      | `size`가 `custom`일 때 사용하며, 예: `2048x3072` |
| `aspect_ratio`        | enum   | No  | `AUTO` | 15개 종횡비 중 하나                             |
| `quality`             | enum   | No  | `auto` | auto / low / medium / high               |
| `output_format`       | enum   | No  | `png`  | png / jpeg / webp                        |
| `output_compression`  | int    | No  | 80     | 0-100(jpeg / webp에만 적용)                  |

### `Comfyui-Luck gpt-2.0 all` (역방향)

| 매개변수              | 유형     | 필수  | 기본값                | 설명                                |
| ----------------- | ------ | --- | ------------------ | --------------------------------- |
| `api_key`         | string | Yes | -                  | APIYI token                       |
| `prompt`          | string | Yes | -                  | 대화형 이미지 prompt                    |
| `endpoint`        | enum   | No  | `chat_completions` | `chat_completions` / `images_api` |
| `response_format` | enum   | No  | -                  | `b64_json` / `url` 등              |
| `timeout_seconds` | int    | No  | -                  | 요청별 타임아웃                          |
| `retry_times`     | int    | No  | -                  | 실패 시 재시도 횟수                       |

## 설치

<Steps>
  <Step title="1단계: custom_nodes에 복제합니다">
    ComfyUI 설치 폴더 안에서:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```
  </Step>

  <Step title="2단계: 의존성을 설치합니다">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="3단계: ComfyUI를 다시 시작합니다">
    노드 팔레트에서 `Luck gpt-image-2` 또는 `Luck gpt-2.0 all`를 검색해 찾습니다.
  </Step>

  <Step title="4단계: APIYI 키를 설정합니다">
    * [APIYI 콘솔](https://www.apiyi.com) → Tokens를 방문해 새 키를 생성합니다(안전을 위해 사용 한도를 설정하십시오)
    * `api_key` 필드에 붙여넣습니다
    * 노드는 기본적으로 `api.apiyi.com`를 사용합니다. 필요하면 백업 도메인 `vip.apiyi.com` / `b.apiyi.com`로 전환할 수 있습니다
  </Step>

  <Step title="5단계: 예제 워크플로를 가져옵니다">
    저장소에는 `example_workflow.json`이 포함되어 있습니다 — 시작점으로 ComfyUI에 가져오십시오.
  </Step>
</Steps>

## 사용 예시

### 예제 1: 공식 4K 고품질 텍스트-투-이미지

```
Node: Comfyui-Luck gpt-image-2
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
size: 4K
aspect_ratio: 2:3
quality: high
output_format: png
```

### 예제 2: 마스크 인페인팅 (공식)

```
Node: Comfyui-Luck gpt-image-2
image_1: original photo
mask: the area to be replaced (white = edit region)
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
size: 2K
quality: high
```

### 예제 3: 역방향 대화형 이미지

```
Node: Comfyui-Luck gpt-2.0 all
endpoint: chat_completions
prompt: "A girl in hanfu standing under a cherry blossom tree, watercolor style, soft lighting"
response_format: b64_json
timeout_seconds: 180
retry_times: 3
```

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="어떤 노드를 선택해야 합니까?">
    * **`gpt-image-2` (공식)**: 제어 가능한 매개변수, 네이티브 마스크 지원, token 단위 과금, 세밀한 해상도/품질 조정 — 특정 크기 요구사항이 있거나 로컬 편집이 필요할 때 가장 적합합니다
    * **`gpt-image-2-all` (역방향)**: 호출당 과금 (\$0.03/호출), 대화형 자연어 프롬프트, ChatGPT 웹 경험과 동일한 수준 — 반복 편집과 강력한 텍스트 렌더링에 가장 적합합니다
    * 전체 비교: [공식 대 역방향 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="설치 후 노드를 찾을 수 없습니까?">
    1. 폴더가 `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0`에 있는지 확인합니다
    2. `pip install -r requirements.txt`가 오류 없이 완료되었는지 확인합니다
    3. ComfyUI를 완전히 다시 시작합니다(프런트엔드만 새로 고치는 것으로는 충분하지 않습니다)
  </Accordion>

  <Accordion title="4K 또는 사용자 지정 크기에서 시간 초과가 자주 발생합니까?">
    * 역방향 노드에서 `timeout_seconds`를 높입니다
    * 서버 네트워크가 느리다면 [CDN 이미지/동영상 다운로드가 느립니다](/ko/faq/cdn-download-slow)를 참고하십시오
    * 기본 엔드포인트가 불안정하면 백업 도메인 `vip.apiyi.com` / `b.apiyi.com`으로 전환합니다
  </Accordion>

  <Accordion title="b64_json에 접두사가 붙어 반환됩니까?">
    역방향 `gpt-image-2-all`은 `b64_json`를 `data:image/png;base64,` 접두사와 함께 반환하지만, 공식 `gpt-image-2`은 그렇지 않습니다. 자세한 내용은 [공식 대 역방향 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)를 참고하십시오.
  </Accordion>

  <Accordion title="호출이 401 / 403을 반환합니까?">
    1. `api_key`의 유효성과 채널 제한 여부를 확인합니다
    2. 선택한 모델이 token에 화이트리스트로 등록되어 있는지 확인합니다
    3. 잔액 문제입니다 — [잔액은 충분해 보이는데 호출이 실패합니다](/ko/faq/balance-insufficient)를 참고하십시오
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="gpt-image-2 (공식) 문서" icon="book" href="/ko/api-capabilities/gpt-image-2/overview">
    네이티브 2K/4K 생성, token당 과금
  </Card>

  <Card title="gpt-image-2-all (리버스) 문서" icon="book" href="/ko/api-capabilities/gpt-image-2-all/overview">
    ChatGPT와 동일한 수준, 호출당 \$0.03
  </Card>

  <Card title="공식 버전 vs 리버스 비교" icon="scale" href="/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17개 항목의 나란히 비교 표
  </Card>

  <Card title="ComfyUI 노드 모음" icon="workflow" href="/ko/scenarios">
    더 많은 APIYI 맞춤형 ComfyUI 노드를 둘러보세요
  </Card>

  <Card title="Luck Nano Banana Pro (같은 작성자)" icon="puzzle" href="/ko/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr의 Gemini 계열 ComfyUI 노드
  </Card>

  <Card title="APIYI GPT-Image 2 스킬 (동일한 모델)" icon="puzzle" href="/ko/scenarios/ecosystem/apiyi-gpt-image-skills">
    같은 두 GPT 이미지 모델을 위한 AI Agent Skill 형식
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://www.apiyi.com">
    키, 사용량, 채널을 관리합니다
  </Card>
</CardGroup>
