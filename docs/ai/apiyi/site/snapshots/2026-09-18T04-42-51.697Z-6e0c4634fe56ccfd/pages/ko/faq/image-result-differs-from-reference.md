> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 생성된 이미지가 참조 이미지와 크게 다른 이유는 무엇입니까?

> Gemini-3-Pro-Image와 Banana-series 모델은 OpenAI 형식의 URL이 아니라 base64 참조 이미지를 요구합니다. 일반적인 확인 사항은 아래와 같습니다.

## 간단한 답변

`gemini-3-pro-image`, Banana Pro 또는 Banana 2를 사용하는 경우, 생성된 이미지와 참조 이미지 사이의 큰 차이는 보통 참조 이미지 업로드 형식 불일치 때문에 발생합니다.

* 이 모델들은 **OpenAI 형식의 참조 이미지 업로드를 지원하지 않습니다**
* 참조 이미지는 **base64 문자열**로 업로드해야 합니다
* 이 문제는 모델 자체가 아니라 통합 방식과 관련이 있습니다

## 문제 해결 단계

다음 점검 사항을 순서대로 확인합니다:

<Steps>
  <Step title="웹 콘솔에서 모델 테스트">
    `imagen.apiyi.com`를 열고 같은 참조를 웹 UI에서 실행합니다.

    웹 결과가 참조와 일치하면 모델은 정상적으로 동작하는 것이며, 문제는 통합 쪽에 있습니다. 웹 결과도 다르면 다음 점검으로 진행합니다.
  </Step>

  <Step title="token 그룹 확인">
    APIYI 콘솔에서 token에 `gemini-3-pro-image` 또는 Banana 시리즈 모델 그룹이 포함되어 있는지 확인합니다.

    모델이 활성화되지 않으면 호출이 기본 동작으로 폴백되어 예상치 못한 결과가 나올 수 있습니다.
  </Step>

  <Step title="과금 방식 확인">
    token 설정에서 과금 방식을 확인합니다:

    * **종량제 우선**: 사용량 기반과 구독 쿼터를 모두 사용합니다
    * **종량제만**: 사용량 기반 쿼터만 사용할 수 있습니다

    과금 방식과 모델 그룹이 일치하지 않으면 호출이 실패하거나 예상치 못한 결과가 나올 수 있습니다.
  </Step>

  <Step title="통합 방법 확인">
    요청이 공식 모델 문서와 일치하는지 다시 확인합니다.

    Banana 2의 경우:
    `docs.apiyi.com/api-capabilities/nano-banana-2-image/image-edit`

    다음 사항에 주의합니다:

    * reference 필드는 URL이 아니라 **base64 문자열**을 기대합니다
    * MIME 타입은 실제 이미지 형식과 일치해야 합니다
    * 파라미터 형식은 이 모델이 지원하는 내용과 일치해야 합니다
  </Step>
</Steps>

## 일반적인 원인

| 증상                       | 가능한 원인                        |
| ------------------------ | ----------------------------- |
| Web UI는 동작하지만 API 결과가 다름 | 연동 형식 불일치(가장 흔함)              |
| 모든 호출의 결과가 다름            | 참조 이미지가 업로드되지 않았거나 업로드에 실패함   |
| 간헐적인 차이 발생               | prompt 설명이 너무 간단하거나 참조가 너무 많음 |
| 모델 그룹은 활성화되어 있지만 호출이 실패함 | 과금 모드 불일치                     |

<Tip>
  **가장 흔한 원인**: 이미지 URL을 OpenAI-compatible `image_url` 필드에 넣는 것입니다. OpenAI 형식의 참조를 지원하지 않는 모델의 경우, 이미지를 base64 문자열로 인코딩하여 올바른 필드에 넣으십시오.
</Tip>

## 관련 질문

<CardGroup cols={2}>
  <Card title="Nano Banana 이미지 실패" icon="banana" href="/ko/faq/nano-banana-image-failure">
    Nano Banana 모델의 일반적인 문제 및 해결 방법입니다.
  </Card>

  <Card title="이미지 비동기 API" icon="loader" href="/ko/faq/image-async-api">
    이미지 비동기 작업 엔드포인트 사용 방법입니다.
  </Card>

  <Card title="기본 URL 구성 방법" icon="link" href="/ko/faq/base-url-config">
    다양한 클라이언트 도구에서 APIYI에 연결합니다.
  </Card>

  <Card title="token 모델 허용 목록" icon="key" href="/ko/faq/token-model-whitelist">
    token이 액세스할 수 있는 모델을 구성합니다.
  </Card>
</CardGroup>
