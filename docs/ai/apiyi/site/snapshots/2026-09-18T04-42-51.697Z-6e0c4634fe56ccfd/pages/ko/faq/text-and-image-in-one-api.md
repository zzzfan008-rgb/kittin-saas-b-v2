> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트와 생성된 이미지를 모두 출력하는 대화형 API가 있습니까?

> 이미지를 읽는 것과 이미지를 생성하는 것은 서로 다른 일입니다: 어떤 모델이 이미지 입력을 받는지, 어떤 모델이 실제로 이미지를 생성할 수 있는지, 어떤 계열이 단일 응답에서 텍스트와 이미지를 진정으로 반환하는지, 그리고 네 가지 이미지 경로 중에서 어떻게 선택하는지를 설명합니다.

## 짧은 답변

<Info>
  **세 문장으로 요약하면 다음과 같습니다.**

  1. **“이미지를 볼 수 있다”와 “이미지를 만들 수 있다”는 서로 다른 기능입니다.** 거의 모든 최신 채팅 모델은 이미지를 **읽을** 수 있습니다(일반적으로 이것이 “멀티모달”이라는 의미입니다). 그러나 이미지를 **생성할** 수는 없으며, 이는 전용 이미지 모델이라는 별도의 유형에 해당합니다.
  2. **하나의 엔드포인트에서 텍스트와 이미지를 함께 반환하는 것은 Gemini 이미지 제품군뿐입니다.** `gemini-3-pro-image`(Nano Banana Pro), `gemini-3.1-flash-image`(Nano Banana 2) 및 유사 모델은 동일한 응답에서 텍스트 부분과 이미지 부분을 번갈아 반환합니다.
  3. **그 외의 모든 방식은 오케스트레이션입니다.** 즉, 채팅 모델과 독립적인 이미지 엔드포인트(이미지 API)가 함께 작동하는 방식입니다. OpenAI Responses의 네이티브 `image_generation` 도구는 **APIYI에서 권장되지 않습니다**. 호출당 고정 요율로만 과금할 수 있어 합리적인 과금 모델이 아니며, 안정성도 보장할 수 없습니다.
</Info>

## 먼저 들어가는 이미지와 나오는 이미지를 구분하십시오

대부분의 혼란은 "multimodal"이라는 단어에서 비롯됩니다. API 맥락에서는 이것이 **기본적으로 입력 측**을 뜻하며,
즉 "모델에 이미지를 넣을 수 있다"는 의미이지, "모델이 이미지를 생성해 준다"는 의미가 아닙니다.
이 두 가지는 서로 다른 모델 풀, 서로 다른 엔드포인트, 그리고 서로 다른 과금 방식을 사용합니다.

| 항목        | 이미지 입력(vision)                                                       | 이미지 출력(generation)                                                                     |
| --------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 대상 모델     | **거의 모든 현대적인 chat 모델** — GPT-5 계열, Claude 계열, Gemini 텍스트 모델, Grok 계열 | **전용 이미지 모델의 소수 집합** — 플랫폼의 거의 300개 모델 중 약 30개                                         |
| 대표 엔드포인트  | `POST /v1/chat/completions`, `/v1/responses`, `/v1/messages`         | `POST /v1/images/generations`, `POST /v1/images/edits`                                 |
| 이미지가 있는 곳 | **요청** 안에 있습니다: `image_url` 또는 `content` 배열의 base64 항목               | **응답** 안에 있습니다: `data[0].url` / `data[0].b64_json`, 또는 Gemini의 경우 `parts[].inlineData` |
| 과금        | 이미지는 token으로 변환되어 chat 요율로 과금됩니다                                     | 이미지당 과금되거나, 출력 tokens 기준으로 과금됩니다                                                       |
| 확인 방법     | 모델 상세 페이지의 **입력 모달리티** 아래에 "image"가 표시됩니다                            | 상세 페이지 시스템에는 없습니다 — [이미지 및 동영상 생성 모델](/ko/api-capabilities/image-video-models)을 확인하십시오 |

<Note>
  따라서 누군가 "다중모달 chat API가 있습니까"라고 묻는다면: 모델이 분석할 이미지를 **업로드**하려는 뜻이라면,
  답은 "거의 모두가 지원합니다"입니다. 모델이 이미지를 **그리게** 하려는 뜻이라면, 그것은 완전히
  다른 모델 집합입니다. 이 확인 질문 하나만 해도 후속 대화의 대부분을 줄일 수 있습니다.
</Note>

## 이미지 얻기를 위한 네 가지 경로

| 경로                             | 호출 방법                                               | 같은 응답에 텍스트가 포함됩니까?                | 적합한 용도                                          |
| ------------------------------ | --------------------------------------------------- | --------------------------------- | ----------------------------------------------- |
| **A. 독립형 이미지 엔드포인트** (권장)      | 이미지 모델 + `POST /v1/images/generations`              | ❌ 이미지만 반환                         | “그냥 이미지를 원합니다”                                  |
| **B. Gemini 이미지 제품군, 네이티브 방식** | `POST /v1beta/models/{model}:generateContent`       | ✅ **가능하지만**, 보장되지 않음              | 설명과 이미지를 함께 원할 때                                |
| **C. Responses 네이티브 도구**       | `gpt-5.5` + `tools: [{"type": "image_generation"}]` | ✅ 예                               | **APIYI에서는 권장하지 않음**: 호출당 고정 요금, 안정성 미보장 — A 사용 |
| **D. 이미지 모델의 Chat 엔드포인트**      | `gpt-image-2-all` / `-vip` + `/v1/chat/completions` | 이미지는 `content` 내부에 Markdown으로 삽입됨 | 레거시 호환성, **더 이상 권장하지 않음**                       |

<AccordionGroup>
  <Accordion title="A. 독립형 이미지 엔드포인트 — 거의 모든 경우 이 경로를 선택하십시오">
    가장 표준적이고 저렴하며 디버깅하기 쉬운 경로입니다. GPT-Image, FLUX, Seedream 및 Grok Imagine이 모두 여기에 해당합니다.

    ```bash theme={null}
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-image-2",
        "prompt": "An orange cat sitting on a blue sofa, simple line-art style",
        "size": "1024x1024"
      }'
    ```

    FLUX와 Seedream은 일반적으로 `data[0].url`을 반환하며, GPT-Image 제품군은 `data[0].b64_json`을 반환합니다.
    **이 경로는 대화형 텍스트를 전혀 반환하지 않습니다** — Chat 엔드포인트가 아닙니다.

    전체 모델 표: [이미지 및 동영상 생성 모델](/ko/api-capabilities/image-video-models).
    모델별 엔드포인트, 타임아웃 및 출력 형식 차이:
    [이미지 API 참고 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices).
  </Accordion>

  <Accordion title="B. Gemini 이미지 제품군 — 텍스트와 이미지를 네이티브 방식으로 함께 반환하는 유일한 제품군">
    Nano Banana 시리즈(`gemini-3-pro-image`, `gemini-3.1-flash-image` 등)는 네이티브 Gemini 엔드포인트를 사용하며,
    `candidates[0].content.parts`은 **이기종 배열**입니다. 이미지 파트만 포함할 수도 있고, 텍스트 파트와 이미지 파트가
    번갈아 포함될 수도 있습니다. 한 번의 호출로 두 가지를 모두 제공하는 제품군은 이 제품군뿐입니다.

    미리 알아 두어야 할 함정이 하나 있습니다. **파트의 개수와 순서는 어느 것도 보장되지 않습니다.** 테스트에서 다음
    세 가지 배열이 관찰되었습니다.

    | 파트 구조                 | 길이 | 이미지 인덱스 |
    | --------------------- | -- | ------- |
    | `inlineData`          | 1  | `0`     |
    | `text` + `inlineData` | 2  | **`1`** |
    | `inlineData` + `text` | 2  | **`0`** |

    따라서 `parts[0]` 또는 `parts[1]`을 하드코딩하면 **간헐적으로 실패합니다**. 올바른 방법은 필드
    존재 여부로 필터링한 후 **마지막** `inlineData`을 가져오는 것입니다(복잡한 프롬프트에서는 모델이 여러 이미지를 반환하며, 마지막
    이미지가 최종 버전입니다).

    ```python theme={null}
    cand = (resp.get("candidates") or [{}])[0]
    parts = (cand.get("content") or {}).get("parts") or []
    images = [p["inlineData"] for p in parts if "inlineData" in p]
    texts  = [p["text"] for p in parts if "text" in p]          # commentary lives here
    if not images:
        raise RuntimeError(f"No image returned, finishReason={cand.get('finishReason')}")
    final = images[-1]                                          # last image is the final one
    ```

    자세한 내용은 [Nano Banana 시리즈 개발자 가이드](/ko/api-capabilities/nano-banana-dev-guide)를 참조하십시오.
  </Accordion>

  <Accordion title="C. Responses 네이티브 image_generation 도구 — APIYI에서는 권장하지 않음">
    이 경로는 `POST /v1/responses`을 `gpt-5.5`과 함께 호출하고 네이티브 이미지 도구를 추가합니다.

    ```json theme={null}
    {
      "model": "gpt-5.5",
      "input": "Draw a key visual poster for a product launch event",
      "tools": [{ "type": "image_generation" }]
    }
    ```

    모델이 이미지를 그릴지 여부를 자체적으로 결정하며, 이미지는 일반 텍스트 출력과 함께 응답 `output` 배열의
    `image_generation_call` 항목 내부에 base64로 반환됩니다.
    형태상 OpenAI 측에서 “그림을 그리는 채팅 모델”에 가장 가까운 방식이지만 — **APIYI에서는 이를 권장하지 않습니다**.

    <Warning>
      **권장하지 않는 이유:** APIYI에서는 Responses 내부의 이미지 도구에 **호출당 과금**만 적용할 수 있습니다. 즉,
      이미지당 약 \$0.20의 고정 도구 호출 요금이 부과되며, 경로 A와 같은 사용량 기반 옵션이 없습니다. 이는 합리적인 과금 모델이 아닙니다.
      또한 공급 제약으로 인해 이 경로의 **안정성을 보장할 수 없습니다**.

      이미지 생성에는 항상 사용량에 따라 과금되는 경로 A의 Images API(`/v1/images/generations` / `/v1/images/edits`)를 사용하십시오.
      “에이전트가 그릴지 여부를 결정”하도록 하려면 아래의 “채팅 및 그리기” 오케스트레이션으로 구축하십시오 —
      동일한 결과를 얻으면서 과금도 명확합니다.
    </Warning>
  </Accordion>

  <Accordion title="D. 이미지 모델의 Chat 엔드포인트 — 대화형처럼 보이지만 여전히 이미지 모델">
    `gpt-image-2-all` 및 `gpt-image-2-vip`은 `/v1/chat/completions`을 통해 호출할 수 있으며, 이미지는 `choices[0].message.content` 내부에
    Markdown 링크로 삽입됩니다.

    “대화도 하고 그림도 그리는 하나의 Chat 엔드포인트”처럼 보이지만, **그림을 그릴 수 있는 Chat 모델은 아닙니다** —
    내부적으로는 여전히 Chat 스키마로 감싼 이미지 모델이며, 일반적인 대화 기능은 없습니다.
    또한 기본 이미지로 **마지막 `user` 메시지의 `image_url`만 읽고**, assistant 기록의 이미지는 무시합니다.

    이 경로는 **더 이상 권장하지 않습니다** — 새 통합에는 경로 A를 사용해야 합니다.
  </Accordion>
</AccordionGroup>

## “채팅과 그림 그리기” 제품 구축: 권장 구조

대부분의 에이전트와 제품이 실제로 필요한 것은 하나의 마법 같은 엔드포인트가 아니라 명확한 오케스트레이션 체인입니다:

<Steps>
  <Step title="채팅 모델이 의도를 분류하게 하십시오">
    이미 사용 중인 채팅 모델(`gpt-5.5`, `claude-opus-5`, `gemini-3-pro` 등)을 사용해 사용자
    입력을 처리하고 이번 턴이 대화인지 이미지 요청인지 판단하게 합니다. 도움이 된다면 구조화된 플래그를
    반환하도록 하면 됩니다.
  </Step>

  <Step title="채팅 모델이 이미지 prompt를 작성하게 하십시오">
    이 단계는 충분히 가치가 있습니다. 사용자는 “포스터를 만들어 줘”라고 말하지만, 이미지 모델에는 완전한 시각적
    설명이 필요합니다. 채팅 모델이 대충의 요청을 잘 구성된 prompt로 다시 작성하게 하면 출력
    품질이 눈에 띄게 더 일관적이 됩니다.
  </Step>

  <Step title="이미지 엔드포인트를 호출하십시오">
    경로 A의 `/v1/images/generations`를 사용합니다. 반환된 `url` 또는 `b64_json`를 가져와 자체
    오브젝트 스토리지에 저장합니다.
  </Step>

  <Step title="이미지를 대화에 다시 반영하십시오">
    이미지 링크를 대화 기록에 어시스턴트 메시지로 추가합니다. 사용자 입장에서는
    “채팅과 그림을 하나의 흐름으로 처리하는 것”처럼 읽힙니다.
  </Step>
</Steps>

<Tip>
  이렇게 분리하는 실질적인 이점은 다음과 같습니다. 각 모델을 독립적으로 교체할 수 있고(이미지
  모델을 바꿔도 대화 로직에는 영향을 주지 않습니다), 로그에서 과금이 명확히 분리되며,
  **전체 턴을 다시 실행하는 대신 각 단계를 개별적으로 재시도할 수 있습니다**.
</Tip>

## 모델이 이미지를 지원하는지 확인하는 방법

<Steps>
  <Step title="1. 모델 상세 페이지를 확인합니다">
    `/models/<model-name>`을 열고 상단의 사양 표에 있는 **입력 방식** 행을 확인합니다 — 여기에
    "image"가 표시되면 해당 모델은 비전 입력을 지원합니다. 가장 빠른 확인 방법입니다.
  </Step>

  <Step title="2. 확신이 없으면 직접 테스트합니다">
    이미지가 포함된 최소 요청을 보내고 응답을 확인합니다:

    ```bash theme={null}
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "the-model-you-are-testing",
        "messages": [{
          "role": "user",
          "content": [
            {"type": "text", "text": "What is in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/test.jpg"}}
          ]
        }]
      }'
    ```
  </Step>

  <Step title="3. 오류 문자열을 확인합니다">
    텍스트 전용 모델은 명시적으로 실패합니다. 상위 메시지는 `Model do not support image input`
    (문법은 그쪽의 것이며, 오타가 아닙니다). 이 줄이 보이면 해당 모델은 이미지를 지원하지 않으므로 다른 모델로 전환합니다.
  </Step>
</Steps>

<Warning>
  **알려진 텍스트 전용 예외(2026-08-20 기준):** `deepseek-v4-pro`, `deepseek-v4-flash`, `glm-5.2`.

  이들은 "이미지 입력을 아직 받지 않는 최신 모델"의 소수 예외이며, 종종 사람을 헷갈리게 합니다.
  **이 목록은 모델 카탈로그가 바뀌면 함께 바뀝니다** — 같은 공급업체의 세대 간에도 기능이 다를 수 있습니다. 이 목록을 영구적인 것으로 보지 말고, 항상 모델 상세 페이지의 "입력 방식" 행과 직접 테스트한 결과를 정답으로 삼으십시오.
</Warning>

## 자주 발생하는 5가지 오해

<AccordionGroup>
  <Accordion title="1. 멀티모달 모델은 이미지를 생성할 수 있다">
    **사실이 아닙니다.** API 컨텍스트에서 멀티모달은 기본적으로 **입력 측** 기능을 의미합니다. `gpt-5.5`은 사용자가 전송한 디자인 목업을 읽을 수 있지만, 자체적으로 이미지를 출력할 수는 없습니다. 이미지를 얻으려면 이미지 엔드포인트를 별도로 호출해야 합니다(경로 A). Responses 네이티브 이미지 도구(경로 C)는 APIYI에서 권장되지 않습니다.
  </Accordion>

  <Accordion title="2. 이미지 모델을 채팅 모델로 사용할 수 있다">
    **사실이 아닙니다.** 이미지 모델에는 일반적인 대화 기능이 없으므로 `gpt-image-2`을 지원 챗봇의 기반으로 사용해서는 안 됩니다. 채팅 엔드포인트(경로 D)를 지원하는 `-all` / `-vip` 변형조차도 내부적으로는 여전히 이미지 모델입니다.
  </Accordion>

  <Accordion title="3. responseModalities에 TEXT를 포함하면 텍스트 파트가 보장된다">
    **반대의 경우는 성립하지 않습니다.** `responseModalities: ["TEXT", "IMAGE"]`을 선언해도 응답에 텍스트 파트가 포함된다는 보장은 없습니다. 모델은 이미지만 반환할 수 있습니다. 다만 반대 방향은 유용합니다. `["IMAGE"]`을 명시적으로 선언하면 불필요한 텍스트 파트가 포함되는 것을 줄일 수 있습니다.
  </Accordion>

  <Accordion title="4. parts[0]과 parts[1]을 전환하면 이미지 추출 오류가 해결된다">
    **해결되지 않습니다.** 하드코딩된 인덱스를 사용하는 두 접근 방식은 **상호 보완적**입니다. 이미지는 항상 `[0]` 또는 `[1]`에 위치하므로 어느 쪽을 선택하든 일부 요청에서는 이미지를 찾지 못합니다. 인덱스를 변경하면 실패하는 요청만 바뀔 뿐입니다. **필드 존재 여부로 필터링하는 방법만 안정적입니다.**
  </Accordion>

  <Accordion title="5. /v1/images/generations에 참조 이미지를 전달하면 편집이 수행된다">
    **사실이 아니며, 오류도 조용히 발생합니다.** Grok Imagine이 가장 명확한 예입니다. `image` / `image_url` /
    `images`을 생성 엔드포인트에 전달하면 **정상적인 이미지와 함께 200을 반환하지만, 참조 이미지는 조용히 폐기되고 평소와 동일하게 과금됩니다**. 반환되는 결과는 일반적인 텍스트-이미지 결과입니다.

    이미지 편집은 반드시 `/v1/images/edits`을 통해 수행해야 합니다. (또한 Grok Imagine은 해당 엔드포인트에서 `multipart/form-data`을 추가로 요구합니다. JSON을 전송하면 즉시 400 오류가 반환됩니다.)
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="비전(이미지 이해) API" icon="eye" href="/ko/api-capabilities/vision-understanding">
    입력 측 전체 가이드: 지원 모델, URL과 base64 비교, 다중 이미지 입력, 일반적인 오류
  </Card>

  <Card title="이미지 및 동영상 생성 모델" icon="palette" href="/ko/api-capabilities/image-video-models">
    가격이 포함된 출력 측 모델 전체 표 — 이미지를 생성할 수 있는 모델을 확인하는 곳
  </Card>

  <Card title="Nano Banana 시리즈 개발자 가이드" icon="banana" href="/ko/api-capabilities/nano-banana-dev-guide">
    Gemini 이미지 제품군을 올바르게 호출하는 방법: parts 순회, 다중 이미지 출력, mimeType 처리
  </Card>

  <Card title="이미지 API 참고 사항 및 모범 사례" icon="list-checks" href="/ko/api-capabilities/image-api-best-practices">
    이미지 모델 전반의 엔드포인트, 타임아웃 및 출력 형식 매트릭스
  </Card>

  <Card title="적합한 AI 모델을 선택하는 방법" icon="compass" href="/ko/faq/model-selection-guide">
    사용 사례, 비용 및 속도에 따른 모델 선택
  </Card>
</CardGroup>
