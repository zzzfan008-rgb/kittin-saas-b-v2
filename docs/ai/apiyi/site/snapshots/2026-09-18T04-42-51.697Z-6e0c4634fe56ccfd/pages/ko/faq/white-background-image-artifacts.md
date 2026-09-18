> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 왜 흰 배경 이미지에 검은 점, 더러운 얼룩, 또는 흐릿한 색 블록이 나타납니까?

> Google Aistudio API의 흰 배경 이미지는 종종 아티팩트가 나타납니다. 이를 해결하려면 prompt를 옅은 색조로 바꾸거나 Vertex 채널로 전환하십시오.

## 간단한 답변

이것은 Google Aistudio API의 알려진 문제입니다. 계산 압박이 높을 때 생성된 이미지의 큰 순백색 영역은 검은 점, 더러운 얼룩, 또는 흐릿한 색 블록으로 렌더링되는 경향이 있습니다. 2026년 4월 이후로 반복적으로 관찰되었습니다. 해결 방법은 두 가지입니다.

* **옵션 1(먼저 시도하십시오)**: 프롬프트를 “흰색 배경”에서 연한 색조(연회색, 베이지, 부드러운 파란색)로 바꾸십시오. 설정 변경은 필요 없습니다.
* **옵션 2**: 지원팀에 문의하여 `VertexGemini` 그룹을 활성화한 다음, 해당 그룹에 바인딩된 token을 생성하십시오. Vertex 채널은 깨끗한 순백 배경을 생성합니다.

## 자세한 설명

부하가 걸리면 Aistudio 이미지 파이프라인은 **큰 단색 영역**을 압축하고 재구성하는 데 문제가 있습니다. 특히 순백색에서 이런 현상이 두드러집니다. 흔한 아티팩트는 세 가지입니다:

* **검은 점 / 더러운 얼룩**: 이미지에 국소적으로 나타나는 어두운 점이나 불규칙한 얼룩입니다
* **흐릿한 색 블록**: 순백색 대신 흐릿한 회색빛 또는 노란빛 영역이 나타납니다
* **색 편차**: 흰 배경이 프롬프트와 비교해 따뜻한 베이지색이나 차가운 회청색으로 치우칩니다

이 문제는 **모델 성능 문제가 아닙니다** — 단색 배경에서 발생하는 Aistudio 파이프라인의 렌더링 결함입니다. Nano Banana Pro와 Nano Banana 2와 같은 Gemini 이미지 모델은 Aistudio를 통해 라우팅될 때 모두 영향을 받습니다.

## 해결 단계

### 옵션 1: 프롬프트 수준 우회 방법(먼저 권장)

프롬프트에서 "흰 배경 / 순백 배경 / #FFFFFF"를 옅은 색조로 바꿉니다:

* **연한 회색**: `light gray background` / `#F5F5F5`
* **베이지**: `beige background` / `#F5F0E5`
* **부드러운 파란색**: `light blue background` / `#E8F0F8`
* **투명**: `transparent background` (모델이 알파 출력을 지원하는 경우)

<Info>
  실제로 순백에서 연한 회색이나 베이지로 바꾸면 검은 점과 더러운 얼룩이 거의 완전히 사라집니다. 피사체 색상은 영향을 받지 않습니다 — 배경 색조만 바뀝니다.
</Info>

### 옵션 2: Vertex 채널로 전환

사용 사례에서 순백 배경이 반드시 필요하다면(예: 이커머스 상품 촬영), Vertex를 통해 라우팅하면 근본 원인을 해결할 수 있습니다.

#### VertexGemini 그룹 참조

| 항목        | 세부 정보                                                                     |
| --------- | ------------------------------------------------------------------------- |
| **식별자**   | `VertexGemini`                                                            |
| **설명**    | Vertex Gemini 모델: Nano Banana Pro / 2 시리즈. Vertex 채널을 통한 전용 이미지 생성 용량입니다. |
| **지원 모델** | Nano Banana Pro, Nano Banana 2                                            |
| **장점**    | 흐릿한 순백 배경 문제를 해결합니다                                                       |
| **단점**    | 동시 실행 수 제한(\~100 RPM); 초대 전용; Aistudio보다 약간 느림                            |

#### 사용 방법

<Steps>
  <Step title="지원팀에 접근 권한 요청">
    APIYI 지원팀 / 운영팀에 연락하여 `VertexGemini` 그룹을 활성화하십시오. 현재는 초대 전용입니다.
  </Step>

  <Step title="전용 token 생성">
    APIYI 콘솔에 로그인 → `Token management` → `Create token` → 그룹 \*\*`VertexGemini`\*\*를 선택 → 키를 저장합니다.
  </Step>

  <Step title="호출 전환">
    새 token으로 Nano Banana Pro / Nano Banana 2를 호출합니다. 기본 URL은 동일합니다(`https://api.apiyi.com/v1`).
  </Step>
</Steps>

<Warning>
  `VertexGemini` 그룹은 동시 실행 수가 제한적이므로(\~100 RPM), 고처리량 운영 워크로드에는 권장하지 않습니다. Aistudio를 기본 채널로 유지하고, 순백 배경 테스트에만 Vertex로 전환하십시오.
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="배경색을 바꾸면 왜 문제가 해결됩니까?">
    Aistudio 렌더링 문제는 큰 단색 영역을 압축할 때 발생합니다. 연한 회색이나 베이지색으로 바꾸면 배경에 약간의 질감이 생겨, 아티팩트를 유발하는 “큰 균일 영역 압축” 조건을 피할 수 있습니다.
  </Accordion>

  <Accordion title="Vertex가 항상 Aistudio보다 품질이 더 좋습니까?">
    꼭 그렇지는 않습니다. Vertex는 순백색 / 단색 배경에서 더 안정적이지만, 다른 장면(복잡한 구도, 인물 사진)에서는 두 서비스가 비슷하며 Vertex가 더 느립니다. 문제가 순백색 때문에 발생한다고 확인된 경우에만 전환하십시오.
  </Accordion>

  <Accordion title="VertexGemini 그룹은 어떻게 요청합니까?">
    초대 전용입니다. APIYI 지원팀이나 계정 관리자에게 문의하십시오. 대부분의 사용자에게는 옵션 1(옅은 색조의 배경으로 전환)만으로 충분합니다.
  </Accordion>

  <Accordion title="Vertex로 전환하면 요청 URL이 바뀝니까?">
    아닙니다. Base URL은 `https://api.apiyi.com/v1`로 유지됩니다. 바뀌는 것은 token의 그룹뿐이며, APIYI의 백엔드가 Vertex 그룹 트래픽을 Vertex 플랫폼으로 자동 라우팅합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Nano Banana 이미지 실패" icon="banana" href="/ko/faq/nano-banana-image-failure">
    Nano Banana 이미지 모델의 일반적인 문제 및 문제 해결.
  </Card>

  <Card title="Google Aistudio와 Vertex 채널 비교" icon="network" href="/ko/faq/google-upstream-aistudio-vertex">
    Aistudio와 Vertex Gemini 이미지 채널의 차이점 및 선택 방법.
  </Card>

  <Card title="엔터프라이즈 Vertex 폴백 그룹" icon="building" href="/ko/faq/enterprise-group-vertex-fallback">
    엔터프라이즈 고객이 Vertex 그룹을 폴백 채널로 사용하는 방법.
  </Card>

  <Card title="이미지 비동기 API" icon="loader" href="/ko/faq/image-async-api">
    비동기 이미지 생성 엔드포인트 사용 방법.
  </Card>
</CardGroup>
