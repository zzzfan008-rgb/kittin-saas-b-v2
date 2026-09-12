> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 주석 도구 - ComfyUI 노드

> 커뮤니티가 기여한 대화형 주석 노드입니다. 이미지 위에 점/박스/다각형을 직접 그려 편집 영역을 표시할 수 있어, Nano Banana와 함께 사용하면 prompt 작성 시간을 크게 줄여 줍니다.

## 개요

`comfyui-image-annotator`은 커뮤니티 사용자 luckdvr가 기여한 **대화형 이미지 주석 ComfyUI 노드**입니다. 핵심 가치는 **prompt 작성의 진입 장벽을 낮추는 것**입니다. "왼쪽 위 모서리의 빨간 버튼을 교체한다"처럼 설명하느라 애쓰는 대신, 변경할 영역을 **원으로 표시하거나, 클릭하거나, 박스로 지정**하면 모델이 정확히 어디를 수정해야 하는지 볼 수 있습니다. 3단계 파이프라인인 "이미지 → 주석 → API"에서 **Nano Banana Pro 노드 앞**에 배치되도록 설계되었습니다.

<Info>
  **프로젝트 정보**

  * 🔗 출처: `github.com/luckdvr/comfyui-image-annotator`
  * 📜 라이선스: MIT
  * 👤 작성자: luckdvr
  * ⭐ 커뮤니티 기여 — [Luck Nano Banana Pro](/ko/scenarios/ecosystem/lucknanobananapro-comfyui)와 같은 작성자입니다
</Info>

<Tip>
  **추천 워크플로: 이미지 → 주석 도구 → API 노드**

  ```
  LoadImage  ─►  ImageAnnotator  ─►  Luck Nano Banana Pro  ─►  SaveImage
                 (mark the area to edit)      (edit per annotation + prompt)
  ```

  가장 적합한 대상: **영어 prompt나 정확한 "어디를 수정할지" 설명에 어려움을 겪는 사용자**입니다. 마우스가 *어디*를 맡고, 한 줄 prompt가 *무엇*을 맡게 하십시오.
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="세 가지 주석 유형" icon="pen-tool">
    **점 (⦿)**: 한 번 클릭 · **사각형 (▢)**: 드래그하여 그리기 · **다각형 (⬡)**: 여러 번 클릭 후 자동 닫기
  </Card>

  <Card title="실시간 렌더링" icon="eye">
    주석이 캔버스에 실시간으로 렌더링됩니다 — WYSIWYG 방식이며 미리보기로 되돌아갈 필요가 없습니다
  </Card>

  <Card title="확대 / 이동 / 선택" icon="move">
    내장 캔버스 컨트롤로 큰 이미지에서도 정밀하게 주석을 달 수 있습니다
  </Card>

  <Card title="50단계 실행 취소" icon="undo">
    최대 50단계까지 실행 취소할 수 있습니다 — 걱정 없이 자유롭게 실험할 수 있습니다
  </Card>

  <Card title="이중 출력" icon="square-split-horizontal">
    **주석이 적용된 이미지**(모델용)와 **annotation JSON**(후속 파싱용)을 모두 출력합니다
  </Card>

  <Card title="사용자 지정 가능한 스타일링" icon="palette">
    스트로크 색상, 스트로크 너비, 채우기 투명도, 점 크기 — 모두 설정할 수 있습니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

이 노드는 자체적으로는 어떤 API도 호출하지 않습니다 — 주석만 추가합니다. 주석이 추가된 이미지는 이미지 입력을 지원하는 모든 APIYI 모델에 전달할 수 있습니다. 권장 조합:

| 모델                      | 모델 ID                        | 용도                 | API 문서                                                |
| ----------------------- | ---------------------------- | ------------------ | ----------------------------------------------------- |
| Nano Banana Pro         | `gemini-3-pro-image-preview` | 영역 지정 이미지 편집 / 블렌딩 | [보기](/ko/api-capabilities/nano-banana-image/overview) |
| Gemini / Qwen-VL family | various                      | 이미지 이해, 주석 기반 VQA  | [보기](/ko/api-capabilities/gemini/native)              |

## 노드 세부 정보

### 입력

| Parameter | Type  | Required | Description  |
| --------- | ----- | -------- | ------------ |
| `image`   | IMAGE | Yes      | 주석을 달 이미지입니다 |

### 출력

| Output             | Type   | Description                                  |
| ------------------ | ------ | -------------------------------------------- |
| `annotated_image`  | IMAGE  | 렌더링된 주석 표시가 포함된 이미지입니다(후속 API 노드에 직접 전달합니다)  |
| `annotations_json` | STRING | 주석 위치/유형을 설명하는 JSON 문자열입니다(구조화된 입력이 필요한 노드용) |

## 설치

<Steps>
  <Step title="1단계: custom_nodes에 복제합니다">
    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/comfyui-image-annotator.git
    ```
  </Step>

  <Step title="2단계: ComfyUI를 다시 시작합니다">
    추가 의존성은 없습니다. ComfyUI의 내장 환경을 사용합니다. 다시 시작한 후 노드 팔레트에서 `ImageAnnotator`을(를) 검색합니다.
  </Step>

  <Step title="3단계: 3단계 워크플로를 구성합니다">
    노드들을 순서대로 연결합니다:

    ```
    LoadImage → ImageAnnotator → Luck Nano Banana Pro → SaveImage
    ```

    `ImageAnnotator` 캔버스에서 편집할 영역을 동그라미로 표시한 다음, 하위 API 노드에 간단한 prompt를 작성합니다(예: "표시한 영역을 빨간 스포츠카로 바꿔 주세요") 그리고 실행합니다.
  </Step>
</Steps>

## 사용 예시

### 예시 1: 로컬 교체(초보자 친화적)

<Steps>
  <Step title="원본 이미지를 불러옵니다">
    `LoadImage` — 거실 사진을 불러옵니다
  </Step>

  <Step title="대상 영역에 주석을 표시합니다">
    `ImageAnnotator` — 소파 옆의 빈 공간을 둘러싸도록 사각형을 그립니다
  </Step>

  <Step title="한 줄 prompt를 작성합니다">
    `Luck Nano Banana Pro` — prompt: "표시된 영역에 초록색 실내 식물을 넣어 주세요"
  </Step>

  <Step title="실행하고 저장합니다">
    모델은 상자 안에 식물을 정확히 추가하고 나머지는 그대로 둡니다
  </Step>
</Steps>

### 예시 2: 다중 영역 정밀 편집

옷의 윤곽에는 **다각형**을, 모자 위치에는 **점**을, 배경에는 **사각형**을 사용한 뒤 prompt를 입력합니다:

```
Change the clothing in polygon 1 to a black suit, add a hat at point 1,
replace the background in rectangle 1 with a sunset beach
```

모델은 각 영역마다 서로 다른 편집을 수행합니다.

### 예시 3: 시각 Q\&A / 이해

Gemini / Qwen-VL의 경우, 모델에게 "사각형 안에 있는 객체가 무엇이고, 장면에서 어떤 역할을 하는지" 설명해 달라고 요청합니다. 주석은 모델에 정확한 시각적 기준점을 제공합니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="프롬프트를 어려워하는 사람에게 왜 유용합니까?">
    기존의 이미지 편집은 어디를 그리고 어떻게를 모두 설명해야 하므로, 영어가 모국어가 아닌 사람과 AI 초보자에게는 어렵습니다.

    이 노드에서는 **위치 정보가 마우스에서 오므로**, prompt는 *무엇을* 바꿀지만 설명하면 됩니다. 예전에는 3-5문장이 필요하던 설명이 짧은 한 문구만으로 충분해집니다.
  </Accordion>

  <Accordion title="주석 표시는 생성 품질에 영향을 미칩니까?">
    네 — **좋은 방향으로**입니다. 대부분의 멀티모달 모델(Nano Banana, Gemini, Qwen-VL)은 이미지의 주석 기호를 "사용자가 지정한 대상 영역"으로 인식하고 지시를 더 정확하게 따릅니다.

    시각적 간섭이 걱정되면, 노드 설정에서 선 두께를 낮추고 반투명 채우기를 사용하십시오.
  </Accordion>

  <Accordion title="설치 후 노드가 보이지 않습니까?">
    1. 디렉터리를 확인하십시오: `ComfyUI/custom_nodes/comfyui-image-annotator`
    2. ComfyUI를 완전히 다시 시작하십시오(프런트엔드 새로고침만으로는 부족합니다)
    3. ComfyUI의 콘솔에서 오류를 확인하십시오
  </Accordion>

  <Accordion title="렌더링 없이 JSON만 출력할 수 있습니까?">
    네 — `annotations_json` 출력만 후속 단계에 연결하면 됩니다. 좌표를 후처리를 위한 사용자 지정 스크립트에 전달하고 싶을 때 유용합니다.
  </Accordion>

  <Accordion title="Luck Nano Banana Pro와 함께 사용할 때의 모범 사례는 무엇입니까?">
    권장 파이프라인: `LoadImage → ImageAnnotator → Luck Nano Banana Pro`

    * `ImageAnnotator.annotated_image`을 `Luck Nano Banana Pro.image_01`에 연결하십시오
    * "표시된 영역에 무엇을 할지"를 설명하는 자연어 prompt를 사용하십시오
    * 첫 결과가 어긋나면 Luck Nano Banana Pro의 `retry_times` 또는 seed 모드를 사용해 다시 실행하십시오
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="Luck Nano Banana Pro 노드" icon="workflow" href="/ko/scenarios/ecosystem/lucknanobananapro-comfyui">
    작성자의 API 호출 노드 — 이 노드와 완벽하게 어울립니다
  </Card>

  <Card title="Nano Banana Pro API" icon="book" href="/ko/api-capabilities/nano-banana-image/overview">
    Nano Banana Pro의 모든 기능
  </Card>

  <Card title="ComfyUI 노드 모음" icon="layers" href="/ko/scenarios">
    모든 Nano Banana ComfyUI 노드를 둘러보세요
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://www.apiyi.com">
    키, 사용량, 채널을 관리합니다
  </Card>
</CardGroup>
