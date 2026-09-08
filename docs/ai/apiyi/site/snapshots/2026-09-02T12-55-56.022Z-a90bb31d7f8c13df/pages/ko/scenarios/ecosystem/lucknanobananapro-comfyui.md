> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck Nano Banana Pro - ComfyUI 노드

> 커뮤니티가 기여한 고급 ComfyUI 노드입니다: 최대 14개의 참조 이미지, 1K/2K/4K 출력, 15개의 화면 비율, 구성 가능한 재시도/타임아웃 — 프로덕션용으로 설계되었습니다.

## 개요

`Comfyui-LuckNanoBananaPro`은 커뮤니티 사용자 luckdvr가 기여한 ComfyUI 커스텀 노드입니다. APIYI를 통해 Gemini 3 Pro Image Preview / Flash를 호출하여 **텍스트-투-이미지 및 다중 이미지 편집**을 수행합니다. 기본 노드에 비해 가장 큰 강점은 **엔지니어링 완성도**입니다. 내장된 타임아웃/재시도, 실시간 진행 상태, ComfyUI 기본 시드 모드, 최대 14개의 중첩 이미지 입력을 지원하여 더 무거운 프로덕션 워크플로에 적합합니다.

<Info>
  **프로젝트 정보**

  * 🔗 소스: `github.com/luckdvr/Comfyui-LuckNanoBananaPro`
  * 📜 라이선스: MIT / Apache-2.0 (이중)
  * 👤 작성자: luckdvr
  * ⭐ 커뮤니티 기여, APIYI용으로 제작됨
</Info>

<Tip>
  **세 가지 ComfyUI 노드 중 무엇을 선택해야 합니까?**

  Nano Banana용 커뮤니티 ComfyUI 노드 3가지가 제공됩니다. 상황에 맞는 것을 선택하십시오.

  * **[Nano Banana ComfyUI 노드](/ko/scenarios/ecosystem/nano-banana-comfyui)**: 전체 기능 제공(대화형 편집, 다중 턴 메모리), 인터랙티브 제작에 적합함
  * **[APIYI Nano Banana 노드 (Lite)](/ko/scenarios/ecosystem/apiyi-nano-banana-node)**: 최소한의 코드베이스, 학습과 커스터마이징에 적합함
  * **Luck Nano Banana Pro (이 페이지)**: 엔지니어링 중심의 풍부한 매개변수(타임아웃, 재시도, 14개 이미지 입력), 안정적인 프로덕션용으로 제작됨
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="최대 14개 이미지 입력" icon="images">
    `image_01` \~ `image_14` 슬롯은 최대 14개의 참조 이미지를 쌓을 수 있어, Nano Banana Pro의 이론상 입력 상한과 일치합니다
  </Card>

  <Card title="다단계 해상도" icon="image">
    **1K / 2K / 4K** 출력을 적응형 타임아웃으로 제공 — 속도와 품질의 균형
  </Card>

  <Card title="15개 화면 비율" icon="ratio">
    세로, 가로, 정사각형, 시네마틱 와이드스크린을 아우르는 풍부한 프리셋
  </Card>

  <Card title="듀얼 모델 전환" icon="layers">
    `gemini-3-pro-image-preview` (Pro)와 `gemini-3.1-flash-image-preview` (Flash) 간 전환
  </Card>

  <Card title="타임아웃 및 재시도" icon="refresh-cw">
    `timeout_seconds` (10-600s) + `retry_times` (1-20) — 피크 시간대에도 안정적입니다
  </Card>

  <Card title="실시간 진행 상황" icon="gauge">
    상태 / 진행률 / 경과 시간 표시 내장 — 더 이상 블랙박스식 실행이 아닙니다
  </Card>

  <Card title="기본 시드 모드" icon="dices">
    ComfyUI의 표준 fixed / random / increment / decrement 시드 패턴을 지원합니다
  </Card>

  <Card title="MIT / Apache-2.0 이중 라이선스" icon="shield">
    허용적 라이선스 — 상업적 사용과 2차 저작물을 환영합니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델                    | Model ID                         | 용도                     | API 문서                                                  |
| --------------------- | -------------------------------- | ---------------------- | ------------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | 고품질 이미지 생성 및 다중 이미지 편집 | [View](/ko/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | 빠른 생성, 더 낮은 비용         | [View](/ko/api-capabilities/gemini/native)              |

## 노드 매개변수

| 매개변수                    | 유형     | 필수  | 기본값                          | 설명                                  |
| ----------------------- | ------ | --- | ---------------------------- | ----------------------------------- |
| `api_key`               | string | Yes | -                            | APIYI token — 사용 한도가 있는 전용 키를 권장합니다 |
| `prompt`                | string | Yes | -                            | 생성 또는 편집 지시문                        |
| `model`                 | enum   | Yes | `gemini-3-pro-image-preview` | 모델 선택 (Pro / Flash)                 |
| `image_size`            | enum   | No  | `2K`                         | 출력 해상도 (1K / 2K / 4K)               |
| `aspect_ratio`          | enum   | No  | `1:1`                        | 15개 화면 비율 중 하나                      |
| `timeout_seconds`       | int    | No  | 120                          | 요청당 시간 초과 (10-600s)                 |
| `retry_times`           | int    | No  | 3                            | 실패 시 재시도 횟수 (1-20)                  |
| `seed`                  | int    | No  | 0                            | 랜덤 시드 (ComfyUI의 seed 모드와 함께 작동합니다)  |
| `image_01` … `image_14` | IMAGE  | No  | -                            | 선택적 참조 이미지 (최대 14개)                 |

## 설치

<Steps>
  <Step title="Step 1: custom_nodes에 복제">
    ComfyUI 설치 폴더 내부에서:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-LuckNanoBananaPro.git
    ```
  </Step>

  <Step title="Step 2: 의존성 설치">
    ```bash theme={null}
    cd Comfyui-LuckNanoBananaPro
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="Step 3: ComfyUI 재시작">
    노드 팔레트에서 `Luck Nano Banana Pro`를 검색하여 찾으십시오.
  </Step>

  <Step title="Step 4: APIYI 키 설정">
    * [APIYI 콘솔](https://www.apiyi.com) → Tokens로 이동한 다음, **사용 한도가 있는 전용 키를 생성하십시오** (권장 방식)
    * 키를 `api_key` 필드에 붙여넣으십시오
    * 이 노드는 이미 `api.apiyi.com`를 가리키고 있으므로 엔드포인트 설정이 필요하지 않습니다
  </Step>

  <Step title="Step 5: 워크플로 구성">
    * **Text-to-image**: `prompt`만 설정하고 이미지 입력은 비워 두십시오
    * **Multi-image editing**: 여러 `Load Image`를 `image_01`, `image_02` 등에 연결하고, 편집 내용을 설명하는 prompt를 사용하십시오
  </Step>
</Steps>

## 사용 예시

### 예시 1: 고안정성 텍스트-이미지

```
prompt: "Cinematic product shot of a minimalist ceramic teacup on a wooden tray, soft morning light, 35mm lens, shallow depth of field"
model: gemini-3-pro-image-preview
image_size: 4K
aspect_ratio: 3:2
timeout_seconds: 300
retry_times: 5
```

### 예시 2: 다중 이미지 블렌딩

```
image_01: person photo
image_02: outfit reference
image_03: scene reference
image_04: lighting reference
prompt: "Photorealistic portrait: subject from image_01 wearing outfit from image_02, in the setting of image_03, with lighting style of image_04"
image_size: 2K
aspect_ratio: 4:5
```

### 예시 3: 시드 스윕

ComfyUI의 기본 시드 관리를 `increment` 모드에서 사용해 여러 시드를 일괄 실행하고 같은 prompt의 변형을 비교합니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="설치 후 노드를 찾을 수 없습니까?">
    1. 저장소가 `ComfyUI/custom_nodes/Comfyui-LuckNanoBananaPro`에 있는지 확인하십시오
    2. 의존성이 오류 없이 설치되었는지 확인하십시오(특히 requests / Pillow / numpy)
    3. ComfyUI를 완전히 재시작하십시오(새로고침만으로는 충분하지 않습니다)
  </Accordion>

  <Accordion title="4K에서 타임아웃이 자주 발생합니까?">
    이 노드는 `timeout_seconds`을 직접 조정할 수 있습니다:

    * 4K에서는 `timeout_seconds=300`부터 시작하십시오
    * 네트워크 지터에 대비한 자동 재시도를 위해 `retry_times=5`과 함께 사용하십시오
    * 여전히 불안정하면 네트워크 경로를 최적화하기 위해 [CDN 이미지/동영상 다운로드가 느립니다](/ko/faq/cdn-download-slow)를 참고하십시오
  </Accordion>

  <Accordion title="14개의 참조 이미지가 모두 사용됩니까?">
    14개까지 연결할 수 있지만, **실제로 사용되는지**는 prompt에 달려 있습니다. prompt에서 이를 명시적으로 참조하십시오(예: `image_01`, `image_02`) 또는 각 이미지의 역할을 설명하십시오 — 모델이 지시를 반영합니다.
  </Accordion>

  <Accordion title="호출이 401 / 403을 반환합니까?">
    1. `api_key`를 확인하고 잘못된 채널로 제한되어 있지 않은지 확인하십시오
    2. 선택한 모델이 token의 허용 목록에 있어야 합니다
    3. 잔액 — [잔액은 충분해 보이지만 호출이 실패합니다](/ko/faq/balance-insufficient)를 참고하십시오
  </Accordion>

  <Accordion title="이것은 다른 두 Nano Banana ComfyUI 노드와 어떻게 다릅니까?">
    * [nano-banana-comfyui (기능이 풍부한)](/ko/scenarios/ecosystem/nano-banana-comfyui): **대화형 편집**과 멀티턴 메모리에 중점을 둡니다
    * [apiyi-nano-banana-node (라이트)](/ko/scenarios/ecosystem/apiyi-nano-banana-node): 최소한의 코드로 학습/커스터마이징에 적합합니다
    * **Luck Nano Banana Pro (이 페이지)**: 엔지니어링 파라미터(timeout / retry / 14개 이미지), 배치와 프로덕션에 적합하게 설계되었습니다
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/ko/api-capabilities/nano-banana-image/overview">
    전체 모델 기능과 API 레퍼런스
  </Card>

  <Card title="Luck GPT-Image 2 (동일 저자)" icon="puzzle" href="/ko/scenarios/ecosystem/luckgpt2-comfyui">
    luckdvr의 OpenAI 계열 ComfyUI 노드: `gpt-image-2` + `gpt-image-2-all`
  </Card>

  <Card title="ComfyUI 노드 모음" icon="workflow" href="/ko/scenarios">
    모든 Nano Banana ComfyUI 노드를 둘러보세요
  </Card>

  <Card title="FAQ: CDN 다운로드 속도 저하" icon="gauge" href="/ko/faq/cdn-download-slow">
    4K 이미지가 느리게 다운로드되나요? 이 글을 읽어보세요
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://www.apiyi.com">
    키, 사용량, 채널을 관리합니다
  </Card>
</CardGroup>
