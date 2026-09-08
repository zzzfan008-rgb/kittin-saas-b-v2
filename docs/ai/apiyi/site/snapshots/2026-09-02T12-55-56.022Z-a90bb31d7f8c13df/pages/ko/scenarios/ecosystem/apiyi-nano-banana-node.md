> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI Nano Banana ComfyUI 노드 (경량 예제)

> 커뮤니티가 기여한 경량 ComfyUI 커스텀 노드입니다 — 워크플로에 Nano Banana Pro / 2 이미지 생성 기능을 바로 추가할 수 있으며, 빠른 시작과 추가 확장에 적합합니다.

## 개요

`api_yi_nano_banana_node`은 커뮤니티 파트너 JerrIsTheBesta가 기여한 **가벼운 ComfyUI 커스텀 노드**입니다. 이 노드는 “바로 넣어 쓸 수 있는 간편함 + 쉬운 확장성”에 중점을 둡니다. `custom_nodes` 디렉터리에 그대로 넣고 ComfyUI를 다시 시작하면, 워크플로에서 APIYI의 Nano Banana Pro / Nano Banana 2 이미지 생성을 직접 호출할 수 있습니다. 학습과 커스터마이징을 시작하기에 안성맞춤인 출발점입니다.

<Info>
  **프로젝트 정보**

  * 🔗 출처: `github.com/JerrIsTheBesta/api_yi_nano_banana_node`
  * 📜 라이선스: MIT
  * 👤 작성자: JerrIsTheBesta
  * ⭐ 커뮤니티 파트너가 기여한 항목이며 — **확장할 수 있는 예제**로 배치됨
</Info>

<Tip>
  **대상은 누구입니까?**

  이 노드는 가장 흔한 두 가지 작업, 즉 텍스트-투-이미지와 다중 이미지 편집에 중점을 둡니다. 코드는 최소한으로 구성되어 있으며 읽기 쉽습니다. 더 풍부한 기능(대화형 편집, 14장 이미지 블렌딩 등)이 필요하다면 [기능이 더 풍부한 Nano Banana ComfyUI 노드](/ko/scenarios/ecosystem/nano-banana-comfyui)를 확인하시거나, 이 노드를 포크해서 확장하십시오.
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="두 개의 핵심 노드" icon="workflow">
    `APIYI Text to Image` + `APIYI Multi Image Edit` — 가장 일반적인 두 가지 워크플로를 지원합니다
  </Card>

  <Card title="두 모델 전환" icon="layers">
    `gemini-3-pro-image-preview` (Nano Banana Pro)와 `gemini-3.1-flash-image-preview` 중에서 선택합니다
  </Card>

  <Card title="고해상도 출력" icon="image">
    해상도에 따라 자동으로 타임아웃을 조정하며 **2K / 4K** 출력을 지원합니다
  </Card>

  <Card title="다양한 화면 비율" icon="ratio">
    기본 제공 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 21:9, 5:4, 4:5 — 총 10개 비율
  </Card>

  <Card title="다중 이미지 편집" icon="images">
    `Multi Image Edit`는 블렌딩 / 스타일 전송을 위해 최대 **5개의 참조 이미지**를 지원합니다
  </Card>

  <Card title="경량 및 수정 용이" icon="code">
    최소한의 의존성(requests / Pillow / numpy)을 사용하는 순수 Python입니다. 구조가 깔끔하고 사용자 지정이 쉽습니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델                    | Model ID                         | 용도              | API 문서                                                |
| --------------------- | -------------------------------- | --------------- | ----------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | 고품질 이미지 생성 및 편집 | [보기](/ko/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | 빠른 생성, 더 낮은 비용  | [보기](/ko/api-capabilities/gemini/native)              |

## Node Details

### APIYI 텍스트를 이미지로

텍스트 prompt에서 이미지를 생성합니다 — **입력 이미지가 필요하지 않습니다**. 출력: 생성된 이미지 + 파일명 식별자.

### APIYI 다중 이미지 편집

혼합, 편집 또는 구성을 위해 **최대 5개의 입력 이미지**를 받습니다. 출력: 결과 이미지, 파일명, 실제로 사용된 이미지 수.

### Node Parameters

| 매개변수           | Type   | Required | Default                      | Description                               |
| -------------- | ------ | -------- | ---------------------------- | ----------------------------------------- |
| `api_key`      | string | Yes      | -                            | 사용량 상한이 있는 전용 키를 권장하는 APIYI token         |
| `prompt`       | string | Yes      | -                            | 텍스트 prompt                                |
| `model`        | enum   | Yes      | `gemini-3-pro-image-preview` | 모델 (Pro / Flash)                          |
| `resolution`   | enum   | No       | `2K`                         | 출력 해상도 (2K / 4K, 4K는 timeout이 자동으로 연장됩니다) |
| `aspect_ratio` | enum   | No       | `1:1`                        | 사용 가능한 10가지 종횡비                           |
| `images`       | IMAGE  | No       | -                            | Multi Image Edit용 참고 이미지(최대 5개)           |

## 설치

<Steps>
  <Step title="1단계: custom_nodes에 넣기">
    ComfyUI 설치 디렉터리에서 `custom_nodes` 아래에 저장소를 클론합니다:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/JerrIsTheBesta/api_yi_nano_banana_node.git
    ```
  </Step>

  <Step title="2단계: Python 의존성 설치">
    의존성은 최소입니다. ComfyUI에는 일반적으로 torch가 함께 제공됩니다. 누락된 항목만 설치합니다:

    ```bash theme={null}
    pip install requests pillow numpy
    ```
  </Step>

  <Step title="3단계: ComfyUI 재시작">
    재시작 후 노드 팔레트에서 `APIYI`를 검색하여 다음 항목을 찾습니다:

    * `APIYI Text to Image`
    * `APIYI Multi Image Edit`
  </Step>

  <Step title="4단계: APIYI 키 구성">
    * [APIYI 콘솔](https://www.apiyi.com) → Tokens로 이동한 다음, **사용량 한도가 있는 전용 키를 생성합니다**(보안 모범 사례)
    * 키를 노드의 `api_key` 필드에 붙여넣습니다
    * 별도의 엔드포인트 설정은 필요하지 않습니다 — 노드는 내부적으로 `https://api.apiyi.com`를 사용합니다
  </Step>

  <Step title="5단계: 간단한 워크플로 만들기">
    * **텍스트-투-이미지**: `APIYI Text to Image` → `Preview Image`
    * **다중 이미지 편집**: 여러 `Load Image` → `APIYI Multi Image Edit` → `Preview Image`
  </Step>
</Steps>

## 사용 예시

### 예시 1: 텍스트를 이미지로 변환

```
Node: APIYI Text to Image
prompt: "A cute corgi astronaut floating in a neon-lit space station, cinematic lighting"
model: gemini-3-pro-image-preview
resolution: 2K
aspect_ratio: 16:9
```

### 예시 2: 다중 이미지 블렌딩

```
Node: APIYI Multi Image Edit
images: [person photo, outfit reference, background reference]
prompt: "Replace the outfit with the reference clothing, and set the scene in the reference background"
resolution: 4K
aspect_ratio: 1:1
```

## 확장 아이디어

이 프로젝트는 **예시이자 시작점**으로 자리 잡고 있습니다. 필요에 따라 포크하여 확장하십시오:

<CardGroup cols={2}>
  <Card title="대화형 편집" icon="messages-square">
    반복적인 다듬기를 위해 노드 내부에 세션 컨텍스트를 유지합니다
  </Card>

  <Card title="참조 이미지 추가" icon="images">
    Nano Banana Pro의 전체 용량에 맞추기 위해 제한을 14개 이미지로 늘립니다
  </Card>

  <Card title="시드 제어" icon="dices">
    재현 가능한 생성을 위해 seed 매개변수를 추가합니다
  </Card>

  <Card title="배치 출력" icon="layers">
    이미지 배치를 하위 ComfyUI 노드로 내보냅니다
  </Card>
</CardGroup>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="노드를 설치했는데 팔레트에서 찾을 수 없습니까?">
    1. 저장소가 `ComfyUI/custom_nodes/` 안에 있는지 확인하십시오
    2. ComfyUI를 완전히 다시 시작하십시오(프런트엔드만 새로 고침하지 마십시오)
    3. ComfyUI의 콘솔에서 Python import 오류가 있는지 확인하십시오
  </Accordion>

  <Accordion title="호출이 401 / 403으로 실패합니까?">
    확인하십시오:

    1. `api_key`이 올바르고 잘못된 채널로 제한되지 않았는지
    2. 선택한 모델이 token의 허용 목록에 있는지
    3. 계정 잔액이 충분한지 — [잔액은 충분해 보이지만 호출이 실패합니다](/ko/faq/balance-insufficient)를 참조하십시오
  </Accordion>

  <Accordion title="4K 해상도가 자주 시간 초과됩니까?">
    이 노드는 4K에 대해 시간 초과를 자동으로 연장하지만, 여전히 실패하면:

    1. API로 가는 네트워크 경로를 확인하십시오([CDN 이미지/동영상 다운로드가 느립니다](/ko/faq/cdn-download-slow) 참조)
    2. 피크 시간에는 2K 또는 Flash로 전환하십시오
  </Accordion>

  <Accordion title="API key 노출은 안전합니까?">
    작성자는 master key를 사용하지 말 것을 명시적으로 권장합니다 — 이 노드용으로 APIYI 콘솔에서 사용 한도가 있는 전용 token을 만들어, 유출 시 피해 범위가 제한되도록 하십시오.
  </Accordion>

  <Accordion title="이것은 다른 ComfyUI-Nano-Banana-apiyi 노드와 어떻게 다릅니까?">
    * 이 노드: **가벼운 예제**, 노드 2개만 포함, 의존성이 최소입니다 — 온보딩과 커스터마이징에 이상적입니다
    * [전체 버전](/ko/scenarios/ecosystem/nano-banana-comfyui): 더 풍부한 기능 세트(대화형 편집, 14개 이미지 블렌딩), 프로덕션 워크플로용으로 설계되었습니다
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/ko/api-capabilities/nano-banana-image/overview">
    Nano Banana Pro의 전체 API 레퍼런스
  </Card>

  <Card title="전체 ComfyUI 노드" icon="workflow" href="/ko/scenarios/ecosystem/nano-banana-comfyui">
    기능이 모두 갖춰진 Nano Banana ComfyUI 노드 팩
  </Card>

  <Card title="시나리오 개요" icon="rocket" href="/ko/scenarios">
    더 많은 APIYI 시나리오를 둘러보십시오
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://www.apiyi.com">
    API 키와 사용량을 관리합니다
  </Card>
</CardGroup>
