> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana ComfyUI 노드

> APIYI를 통해 Nano Banana Pro 및 Nano Banana 2 이미지 생성 모델을 호출하는 커뮤니티 오픈소스 ComfyUI 커스텀 노드로, 텍스트-이미지, 이미지-이미지, 다중 턴 채팅 기능을 제공합니다.

## 개요

ComfyUI-Nano-Banana-apiyi는 APIYI 사용자를 위해 특별히 제작된, 커뮤니티가 기여한 ComfyUI 커스텀 노드 모음입니다. 이를 통해 Google의 가장 강력한 이미지 생성 모델인 Nano Banana Pro와 Nano Banana 2를 Google Cloud 계정 없이 ComfyUI 워크플로 안에서 직접 호출할 수 있습니다. 시작하려면 APIYI API key만 있으면 됩니다.

<Info>
  **프로젝트 정보**

  * 🔗 소스 코드: `github.com/pdmaker/ComfyUI-Nano-Banana-apiyi`
  * 📜 라이선스: MIT
  * 👤 저자: 커뮤니티 기여(원래 저장소는 삭제되었으며, 현재는 백업 미러를 사용 중입니다)
  * ⭐ 커뮤니티 기여, APIYI에 맞게 조정됨
</Info>

## 이 노드를 선택해야 하는 이유

<CardGroup cols={2}>
  <Card title="진입 장벽 없음" icon="key">
    Google Cloud 계정이 필요하지 않습니다 — APIYI 키로 Nano Banana Pro 및 Nano Banana 2 모델에 액세스할 수 있습니다
  </Card>

  <Card title="멀티모달 생성" icon="images">
    모든 창작 요구에 맞는 텍스트-투-이미지, 이미지-투-이미지, 멀티 이미지 융합(최대 14개의 참고 이미지)을 지원합니다
  </Card>

  <Card title="멀티턴 채팅 편집" icon="messages-square">
    반복적 개선을 위한 컨텍스트 메모리를 갖춘 독특한 대화형 이미지 생성입니다
  </Card>

  <Card title="초고해상도" icon="expand">
    14개의 화면 비율로 512px, 1K, 2K, 4K 출력을 지원하며 포스터, 월페이퍼, 소셜 미디어 등 다양한 용도를 포괄합니다
  </Card>
</CardGroup>

## 지원되는 APIYI 모델

| 모델명             | 모델 ID                            | 특징                  | API 문서                                            |
| --------------- | -------------------------------- | ------------------- | ------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview`     | 플래그십 품질, 풀 기능       | [문서 보기](/en/api-capabilities/nano-banana-image)   |
| Nano Banana 2   | `gemini-3.1-flash-image-preview` | Pro급 품질 + Flash급 속도 | [문서 보기](/en/api-capabilities/nano-banana-2-image) |

<Tip>
  **어떤 모델을 선택해야 합니까?** 최고의 품질이 필요하면 Nano Banana Pro를 선택하십시오. 최고의 비용 대비 성능이 필요하면 Nano Banana 2를 선택하십시오(이미지당 \$0.025까지). 두 모델 모두 동일한 ComfyUI 워크플로에서 사용할 수 있습니다.
</Tip>

## 네 개의 핵심 노드

이 플러그인은 서로 다른 사용 사례를 다루는 4개의 기능 노드를 제공합니다:

| 노드 이름                             | 모델    | 핵심 기능                                 | 적합한 용도   |
| --------------------------------- | ----- | ------------------------------------- | -------- |
| **Nano Banana AIO**               | Pro   | 텍스트-이미지 + 이미지-이미지(1-6개 참조) + 검색 그라운딩  | 고품질 생성   |
| **Nano Banana Multi-Turn Chat**   | Pro   | 대화형 이미지 편집                            | 반복적 다듬기  |
| **Nano Banana 2 AIO**             | Flash | 텍스트-이미지 + 이미지-이미지(최대 14개 참조) + 이미지 검색 | 빠른 일괄 생성 |
| **Nano Banana 2 Multi-Turn Chat** | Flash | 대화형 편집 + 극단적인 가로세로 비율                 | 빠른 반복 작업 |

## 시작하기: 설치 및 설정

<Steps>
  <Step title="1단계: 사전 요구 사항 확인">
    다음 항목이 설치되어 있는지 확인하십시오:

    * **ComfyUI** (최신 버전) — 설치되어 있지 않다면 다음을 참조하십시오: `github.com/comfyanonymous/ComfyUI`
    * **Python 3.12+**
    * **Git**

    <Warning>
      Python 버전은 3.12 이상이어야 합니다. 더 낮은 버전에서는 의존성 설치에 실패할 수 있습니다.
    </Warning>
  </Step>

  <Step title="2단계: 노드 코드 다운로드">
    터미널을 열고 ComfyUI의 커스텀 노드 디렉터리로 이동한 다음 저장소를 복제합니다:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/pdmaker/ComfyUI-Nano-Banana-apiyi.git
    ```
  </Step>

  <Step title="3단계: 의존성 설치">
    플러그인 디렉터리로 들어가 필요한 의존성을 설치합니다:

    ```bash theme={null}
    cd ComfyUI-Nano-Banana-apiyi
    pip3 install -r requirements.txt
    ```

    Nano Banana 2 노드 지원을 위해 다음도 설치하십시오:

    ```bash theme={null}
    pip3 install google-genai --upgrade
    ```
  </Step>

  <Step title="4단계: APIYI 키 받기">
    1. 가입/로그인을 위해 [APIYI 콘솔](https://api.apiyi.com)을 방문하십시오.
    2. Token 섹션으로 이동하십시오.
    3. 새 API 키를 생성하십시오.
    4. 키를 복사하십시오(`sk-`로 시작합니다).

    <Info>
      새 사용자는 무료 체험 크레딧을 받으며, Nano Banana 이미지 생성을 체험하기에 충분합니다.
    </Info>
  </Step>

  <Step title="5단계: 환경 변수 설정">
    플러그인 디렉터리에서 템플릿 파일을 복사하고 자격 증명을 입력하십시오:

    ```bash theme={null}
    cp .env.api.template .env
    ```

    APIYI 키와 기본 URL에 맞게 `.env` 파일을 편집하십시오:

    ```bash theme={null}
    GOOGLE_API_KEY=sk-your-apiyi-key
    CUSTOM_BASE_URL=https://api.apiyi.com
    ```

    <Tip>
      **핵심 설정**: `CUSTOM_BASE_URL`를 `https://api.apiyi.com`로 설정해야 합니다. 그래야 모든 요청이 APIYI를 통해 라우팅되며 Google Cloud 계정이 필요하지 않습니다. 코드는 올바른 API 버전 경로를 자동으로 덧붙입니다.
    </Tip>
  </Step>

  <Step title="6단계: ComfyUI 재시작 및 확인">
    ComfyUI를 다시 시작한 후 노드 목록에서 `Nano Banana`를 검색하십시오. 다음 4개의 새 노드가 보여야 합니다:

    * Nano Banana AIO
    * Nano Banana Multi-Turn Chat
    * Nano Banana 2 AIO
    * Nano Banana 2 Multi-Turn Chat

    이 노드들이 보이면 설치가 성공한 것입니다!
  </Step>
</Steps>

## 실습 튜토리얼: 텍스트에서 이미지로

### 시나리오 1: 텍스트-이미지 생성(기본)

가장 간단한 사용 방법입니다 — 텍스트 설명을 입력하면 이미지를 생성합니다.

<Steps>
  <Step title="노드 추가">
    ComfyUI 캔버스를 마우스 오른쪽 버튼으로 클릭하고, **Nano Banana AIO** 노드(또는 Nano Banana 2 AIO)를 검색하여 추가합니다.
  </Step>

  <Step title="프롬프트 작성">
    원하는 이미지 설명을 `prompt` 필드에 입력합니다. 예를 들면 다음과 같습니다.

    ```
    An orange tabby cat sitting on a windowsill, Tokyo nightscape outside, cyberpunk style, neon lights, high detail, cinematic quality
    ```
  </Step>

  <Step title="매개변수 구성">
    * **image\_count**: 생성할 이미지 수입니다(1-10)
    * **aspect\_ratio**: 비율을 선택합니다. 예: `16:9`(가로형 배경화면) 또는 `9:16`(휴대폰 배경화면)
    * **image\_size**: 해상도입니다 — `2K` 또는 `4K`를 권장합니다
    * **temperature**: 창의성 수준입니다. 0.0은 가장 보수적이고, 2.0은 가장 창의적입니다
  </Step>

  <Step title="워크플로 실행">
    ComfyUI의 **Queue Prompt** 버튼을 클릭하고 몇 초만 기다리면 생성된 이미지를 볼 수 있습니다.
  </Step>
</Steps>

### 시나리오 2: 이미지 편집 및 융합

참조 이미지를 사용해 생성을 유도합니다 — 스타일 전환, 요소 융합 등에 매우 유용합니다.

1. 참조 이미지를 **Nano Banana AIO** 노드의 `image_1`부터 `image_6`까지 입력에 연결합니다
2. 원하는 효과를 `prompt`에 설명합니다. 예: "이 사진을 수채화 스타일로 변환합니다"
3. 모델은 참조 이미지와 텍스트 설명을 결합하여 새 이미지를 생성합니다

<Tip>
  **Nano Banana 2 AIO 전용**: 최대 14개의 참조 이미지(객체 10개 + 캐릭터 일관성 참조 4개)를 지원하며, 캐릭터 외형을 일관되게 유지해야 하는 창작 프로젝트에 이상적입니다.
</Tip>

### 시나리오 3: 다중 턴 대화형 편집

가장 독특한 기능입니다 — 채팅하듯 이미지를 단계별로 다듬을 수 있습니다.

1. **Nano Banana Multi-Turn Chat** 노드를 추가합니다
2. 1라운드: 초기 설명을 입력하고 기본 이미지를 생성합니다
3. 2라운드: 수정 내용을 입력합니다. 예: "배경을 해변으로 바꿔주세요"
4. 3라운드: 계속 다듬습니다. 예: "일몰 조명을 추가하세요"
5. 각 라운드는 대화 메모리를 바탕으로 이어집니다

대화 기록을 지우고 새로 시작하려면 `reset_chat`를 전환합니다.

## 노드 매개변수 참조

### Nano Banana AIO / Nano Banana 2 AIO

| 매개변수                      | 유형      | 필수  | 설명                             |
| ------------------------- | ------- | --- | ------------------------------ |
| `prompt`                  | string  | Yes | 이미지 설명 텍스트                     |
| `image_count`             | integer | No  | 이미지 수(1-10), 기본값 1             |
| `aspect_ratio`            | enum    | No  | 종횡비(11개 옵션 / NB2는 14개)         |
| `image_size`              | enum    | No  | 해상도: 512px(NB2 전용), 1K, 2K, 4K |
| `temperature`             | float   | No  | 창의성 0.0-2.0                    |
| `use_search`              | boolean | No  | Google 검색 그라운딩 사용              |
| `image_1` \~ `image_6/14` | image   | No  | 참조 이미지 입력                      |

### 지원되는 종횡비

| 표준(두 노드 공통)             | Nano Banana 2 전용  |
| ----------------------- | ----------------- |
| 1:1, 2:3, 3:2, 3:4, 4:3 | 1:4(초세로형)         |
| 4:5, 5:4, 9:16, 16:9    | 4:1(초가로형)         |
| 21:9, 자동(AI 자동 선택)      | 1:8, 8:1(극단적인 비율) |

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="설치 후 노드를 찾을 수 없습니까?">
    다음을 확인하십시오:

    1. 플러그인 폴더가 `ComfyUI/custom_nodes/` 디렉터리에 있습니다
    2. `pip3 install -r requirements.txt`를 실행했습니다
    3. Nano Banana 2 노드의 경우 `pip install google-genai --upgrade`도 실행하십시오
    4. ComfyUI를 **재시작**했습니다(브라우저만 새로고침한 것이 아니라 백엔드를 재시작해야 합니다)
  </Accordion>

  <Accordion title="API Key가 유효하지 않다는 오류가 발생합니까?">
    다음을 확인하십시오:

    1. `GOOGLE_API_KEY` 파일의 `.env`가 APIYI Key인지 확인하십시오(`sk-`로 시작합니다)
    2. `CUSTOM_BASE_URL`가 `https://api.apiyi.com`로 설정되어 있습니다
    3. APIYI 계정에 충분한 잔액이 있는지 확인하십시오(콘솔에서 확인)
  </Accordion>

  <Accordion title="생성이 느리거나 타임아웃이 발생합니까?">
    * 4K 해상도는 더 오래 걸립니다 — 테스트용으로 먼저 1K를 시도하십시오
    * 여러 이미지(image\_count가 1보다 큼)는 처리 시간을 늘립니다
    * 타임아웃이 자주 발생하면 더 낮은 해상도나 더 적은 이미지를 시도하십시오
  </Accordion>

  <Accordion title="Nano Banana Pro와 Nano Banana 2 중 무엇을 선택해야 합니까?">
    * **Nano Banana Pro** (`gemini-3-pro-image-preview`): 더 세밀한 품질로, 고급 제작에 적합합니다
    * **Nano Banana 2** (`gemini-3.1-flash-image-preview`): 더 빠르고, 더 저렴하며(\$0.025/image부터), 더 많은 참조 이미지와 극단적인 비율을 지원합니다
    * 일상적인 제작에는 Nano Banana 2를 권장하며, 최고의 품질이 필요하면 Pro를 선택하십시오
  </Accordion>

  <Accordion title="APIYI API key는 어떻게 받습니까?">
    [APIYI 콘솔](https://api.apiyi.com/token)에 접속하여 계정을 등록한 다음 Token 섹션에서 새 Key를 생성하십시오. 신규 사용자는 무료 체험 크레딧을 받습니다.
  </Accordion>

  <Accordion title="콘텐츠 안전성 때문에 이미지 생성에 실패했습니까?">
    Nano Banana 모델에는 내장된 콘텐츠 안전성 검사가 있습니다. 일부 설명은 제한을 유발할 수 있습니다. 제안:

    1. prompt를 민감한 콘텐츠를 피하도록 조정하십시오
    2. 자세한 내용은 [Nano Banana Image Failure Troubleshooting](/ko/faq/nano-banana-image-failure)를 참조하십시오
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="Nano Banana Pro 문서" icon="banana" href="/en/api-capabilities/nano-banana-image">
    Nano Banana Pro 전체 API 문서와 가격 보기
  </Card>

  <Card title="Nano Banana 2 문서" icon="banana" href="/en/api-capabilities/nano-banana-2-image">
    Nano Banana 2 전체 API 문서와 가격 보기
  </Card>

  <Card title="이미지 생성 실패 문제 해결" icon="circle-question-mark" href="/ko/faq/nano-banana-image-failure">
    Nano Banana 이미지 생성 문제 해결 가이드
  </Card>

  <Card title="APIYI - Token 관리" icon="settings" href="https://api.apiyi.com/token">
    API 키를 관리하고 사용량과 잔액을 확인합니다
  </Card>
</CardGroup>
