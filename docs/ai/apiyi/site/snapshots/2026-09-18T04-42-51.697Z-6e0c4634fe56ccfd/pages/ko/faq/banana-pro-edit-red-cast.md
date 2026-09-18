> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro로 편집한 후 내 이미지가 왜 붉은빛을 띠나요?

> Nano Banana Pro 이미지 편집에서 붉은빛/따뜻한 색조를 완화하는 일반적인 방법: Vertex 채널로 전환하거나 gpt-image-2로 대체합니다.

## 간단한 답변

Nano Banana Pro (`gemini-3-pro-image`) 이미지 편집에서 전체적으로 붉거나 따뜻한 색감이 도는 현상은 자주 보이는 증상입니다. 흔한 완화 방법 두 가지는 다음과 같습니다.

1. banana pro를 **버텍스** 채널로 라우팅합니다
2. 편집 작업에는 **gpt-image-2**로 전환합니다

## 상세 설명

### Nano Banana Pro는 기본적으로 어느 채널을 사용합니까?

apiyi의 Nano Banana Pro는 기본적으로 **공식 AI Studio** 채널을 통해 라우팅됩니다. Vertex는 별도의 선택적 풀로, AI Studio에 문제가 있을 때 이를 대신합니다(참조: [Google은 AI Studio 또는 Vertex를 통해 라우팅됩니까?](/ko/faq/google-upstream-aistudio-vertex)).

### Vertex로 어떻게 전환합니까?

Vertex는 apiyi 콘솔에서 **별도의 그룹**으로 노출됩니다. token을 생성하거나 편집할 때 Vertex 관련 그룹을 선택하면 됩니다. 코드 변경은 필요하지 않습니다(참조: [Google은 AI Studio 또는 Vertex를 통해 라우팅됩니까?](/ko/faq/google-upstream-aistudio-vertex)).

### gpt-image-2가 이 문제를 해결합니까?

gpt-image-2는 일반적으로 편집 작업에서 원본 색상을 더 잘 보존합니다. 대체 옵션으로 간주하십시오 — [GPT-Image-2 이미지 편집 API](/ko/api-capabilities/gpt-image-2-all/image-edit)를 참조하십시오.

## 문제 해결

<Steps>
  <Step title="웹 플레이그라운드에서 재현해 봅니다">
    `imagen.apiyi.com`를 열고 동일한 prompt + 참조 이미지를 다시 실행합니다.

    * 웹에서 재현됨 → 모델 동작일 가능성이 높습니다. Vertex / gpt-image-2를 시도해 보십시오.
    * 웹에서는 정상 → 통합을 확인하십시오([Image output differs heavily from the reference image](/ko/faq/image-result-differs-from-reference) 참고)
  </Step>

  <Step title="참조 이미지가 base64로 업로드되었는지 확인합니다">
    Nano Banana Pro는 OpenAI 방식의 참조 이미지 업로드를 **지원하지 않으며** — base64가 필요합니다([Image output differs heavily from the reference image](/ko/faq/image-result-differs-from-reference) 참고). URL을 `image_url`에 직접 넣으면 모델이 참조 이미지를 사실상 상상하게 되며, 이는 색조 변화로도 나타날 수 있습니다.
  </Step>

  <Step title="Vertex 채널을 시도합니다">
    token의 그룹을 Vertex 그룹으로 변경한 뒤 동일한 prompt를 다시 실행합니다. 색조를 AI Studio와 비교하십시오.
  </Step>

  <Step title="gpt-image-2를 시도합니다">
    Vertex에서도 여전히 색조가 보인다면 gpt-image-2로 되돌립니다. 시각적 스타일은 banana pro와 다를 것이므로 prompt를 다시 조정해야 합니다.
  </Step>
</Steps>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="gpt-image-2와 banana pro의 편집 비교">
    banana pro는 “스타일화된 재렌더링” 쪽에 더 가깝고, gpt-image-2는 “미세한 인플레이스 편집” 쪽에 더 가깝습니다. gpt-image-2는 일반적으로 원본 색상을 더 잘 보존합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Google은 AI Studio 또는 Vertex를 통해 라우팅됩니까?](/ko/faq/google-upstream-aistudio-vertex)
* [이미지 출력이 참조 이미지와 크게 다릅니다](/ko/faq/image-result-differs-from-reference)
* [Nano Banana Pro 이미지 편집 API](/ko/api-capabilities/nano-banana-image/image-edit)
* [GPT-Image-2 이미지 편집 API](/ko/api-capabilities/gpt-image-2-all/image-edit)

## 문의하기

계정에서 Vertex 그룹 사용 가능 여부를 확인하는 데 도움이 필요하거나, 색상 캐스트 편집 문제를 해결해야 하는 경우 지원팀에 문의해 주십시오.
