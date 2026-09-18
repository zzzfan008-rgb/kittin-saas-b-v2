> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 콘텐츠가 MIME 유형과 일치하지 않는 오류를 해결하는 방법은 무엇입니까?

> 이미지 URL이 x-oss-process(또는 이와 유사한 CDN 처리) 매개변수로 끝나는 경우 이 오류가 발생합니다. 해당 매개변수를 제거하거나 원본 직접 링크를 사용하십시오.

## 간단한 답변

API에 전달한 이미지 URL이 `?x-oss-process=...`와 같은 클라우드 스토리지 처리 매개변수로 끝나는 경우, API에서 “이미지 콘텐츠가 MIME 유형과 일치하지 않습니다” 오류를 반환합니다.

해결하려면 URL에서 처리 매개변수를 제거한 후 원본 직접 링크를 API에 전달하거나, 이미지를 자체 서버에서 다운로드하고 다시 처리한 다음 업로드해야 합니다.

## 오류는 어떻게 표시됩니까?

오류 응답은 다음과 같습니다.

```json theme={null}
{
  "error": {
    "message": "decode image: image content does not match MIME type 'image/png'",
    "type": "invalid_request_error",
    "code": 429
  }
}
```

일반적으로 오류를 발생시키는 URL은 다음과 같습니다.

```text theme={null}
https://oss.fzputi.com/tools/aiCraft/...jpg?x-oss-process=image/resize,w_800
```

`?x-oss-process=...` 접미사는 Alibaba Cloud OSS 및 유사한 객체 스토리지 서비스에서 사용하는 이미지 처리 매개변수입니다. APIYI의 이미지 생성 엔드포인트는 URL에 이러한 유형의 매개변수가 포함된 경우 위의 오류를 반환하는 것으로 알려져 있습니다.

## 영향을 받는 것으로 알려진 매개변수 이름

다음 매개변수 이름이 이미지 URL에 포함되어 있을 때 이 오류를 발생시키는 것으로 보고되었습니다.

* `x-oss-process`

다른 클라우드 스토리지 제공업체(예: Tencent Cloud COS 또는 Huawei Cloud OBS)의 이미지 처리 매개변수를 사용하는 경우, URL을 API에 전달하기 전에 아래 단계를 동일하게 따르시기 바랍니다.

## 문제 해결 단계

<Steps>
  <Step title="처리 파라미터를 URL에서 제거합니다">
    이미지의 원시 직접 링크(`?x-oss-process=` 형식의 파라미터 제외)를 복사하여 API에 다시 전달합니다.

    예를 들어 다음과 같이 변경합니다:

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg?x-oss-process=image/resize,w_800
    ```

    다음으로:

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg
    ```
  </Step>

  <Step title="크기 조정이 필요한 경우 먼저 서버에서 이미지를 처리합니다">
    워크플로가 실제로 OSS 측 압축 또는 자르기에 의존하는 경우, 먼저 버킷에서 처리된 이미지를 로컬 스토리지로 다운로드한 다음 로컬 경로 또는 새 파라미터가 없는 직접 링크를 통해 업로드합니다.
  </Step>
</Steps>

## 참고 사항

<Warning>
  API에 전달하는 이미지 URL은 뒤에 매개변수를 추가하지 않은 일반 직접 링크로 유지해야 합니다. 그렇지 않으면 이 오류가 발생할 수 있습니다.
</Warning>

## 그래도 작동하지 않는 경우

* URL을 브라우저에서 직접 열 수 있는지 확인하고, 브라우저에 표시되는 실제 이미지 형식(마우스 오른쪽 버튼 클릭 → 검사)이 URL 확장자(jpg / png / webp)와 일치하는지 확인합니다.
* 다른 클라우드 스토리지 제공업체의 이미지 처리 매개변수를 사용하는 경우, 전체 오류 JSON과 요청 ID를 포함하여 기술 지원팀에 문의합니다.

## 관련 문서

* [비동기 이미지 API가 있습니까? 작업 ID로 결과를 조회할 수 있습니까?](/ko/faq/image-async-api)
* [생성된 이미지가 참조 이미지와 크게 다른 이유는 무엇입니까?](/ko/faq/image-result-differs-from-reference)
